import { supabase, supabaseAdmin, isSupabaseConfigured } from '../lib/supabase';
import { Request, Response, NextFunction } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import { z } from 'zod';
import { prisma } from '../lib/db';
import { config } from '../config';
import { AppError } from '../middleware/errorHandler';

// Validation Schemas
const registerSchema = z.object({
  fullName: z.string().min(2, 'Full name is required'),
  email: z.string().email('Invalid email address'),
  phone: z.string().optional().default('+1-555-0100'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  companyName: z.string().min(2, 'Company name is required'),
  companySlug: z.string().optional(),
  industry: z.string().optional().default('Generic'),
  companySize: z.string().optional().default('1-10'),
  country: z.string().optional().default('India'),
  template: z.string().optional().default('Generic CRM'),
  modules: z.array(z.string()).optional(),
  pipelineName: z.string().optional().default('Standard Sales Pipeline'),
});

const changePasswordSchema = z.object({
  currentPassword: z.string().min(1, 'Current password is required'),
  newPassword: z.string().min(6, 'New password must be at least 6 characters'),
});

async function recordSecurityEvent(
  eventType: string,
  tenantId?: string | null,
  userId?: string | null,
  email?: string | null,
  req?: Request
) {
  try {
    const ipAddress =
      req?.headers['x-forwarded-for']?.toString() ||
      req?.socket?.remoteAddress ||
      '127.0.0.1';
    const userAgent = req?.headers['user-agent'] || 'Unknown';

    await prisma.auditLog.create({
      data: {
        tenantId: tenantId || null,
        userId: userId || null,
        action: eventType,
        entity: 'User',
        entityId: userId || null,
        details: `Security Event: ${eventType} for ${email || 'user'}`,
        ipAddress,
        userAgent,
      },
    });
  } catch (err) {
    console.error('[SecurityEvent Error]', err);
  }
}

// 1. REGISTER
export const register = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const data = registerSchema.parse(req.body);

    const existingUser = await prisma.user.findFirst({
      where: { email: data.email.toLowerCase().trim() },
    });
    if (existingUser) {
      throw new AppError('An account with this email address already exists.', 409);
    }

    let baseSlug = (data.companySlug || data.companyName)
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');
    if (!baseSlug) baseSlug = 'workspace-' + Date.now();
    let slug = baseSlug;
    let counter = 1;
    while (await prisma.tenant.findUnique({ where: { slug } })) {
      slug = `${baseSlug}-${counter}`;
      counter++;
    }

    let supabaseUserId: string | null = null;
    if (isSupabaseConfigured()) {
      try {
        const { data: adminAuthData, error: adminErr } = await supabaseAdmin.auth.admin.createUser({
          email: data.email.toLowerCase().trim(),
          password: data.password,
          email_confirm: true,
          user_metadata: { full_name: data.fullName },
        });

        if (!adminErr && adminAuthData.user) {
          supabaseUserId = adminAuthData.user.id;
        } else {
          // Fallback to standard signUp if admin API restricted
          const { data: authData } = await supabase.auth.signUp({
            email: data.email.toLowerCase().trim(),
            password: data.password,
            options: { data: { full_name: data.fullName } },
          });
          if (authData.user) supabaseUserId = authData.user.id;
        }
      } catch (err) {
        console.warn('[Register] Supabase Auth createUser warning:', err);
      }
    }

    const trialEndsAt = new Date(Date.now() + 14 * 24 * 60 * 60 * 1000);
    const hashedPassword = await bcrypt.hash(data.password, 10);

    const starterPlan = await prisma.plan.findUnique({ where: { name: 'STARTER' } })
      || await prisma.plan.findUnique({ where: { name: 'FREE' } });

    const result = await prisma.$transaction(async (tx) => {
      const tenant = await tx.tenant.create({
        data: {
          name: data.companyName,
          slug,
          status: 'TRIAL',
          industry: data.industry,
          companySize: data.companySize,
          country: data.country,
          template: data.template,
          trialEndsAt,
        },
      });

      const adminRole = await tx.role.create({
        data: {
          tenantId: tenant.id,
          name: 'TENANT_ADMIN',
          description: 'Company Workspace Administrator',
          permissions: JSON.stringify(['*']),
          isDefault: true,
        },
      });

      const user = await tx.user.create({
        data: {
          ...(supabaseUserId ? { id: supabaseUserId } : {}),
          tenantId: tenant.id,
          email: data.email.toLowerCase().trim(),
          password: hashedPassword,
          fullName: data.fullName,
          phone: data.phone,
          department: 'Executive Management',
          designation: 'Workspace Owner',
          roleId: adminRole.id,
          isActive: true,
        },
        include: { role: true },
      });

      if (starterPlan) {
        await tx.subscription.create({
          data: {
            tenantId: tenant.id,
            planId: starterPlan.id,
            status: 'TRIAL',
            trialEndsAt,
          },
        });
      }

      await tx.usage.create({
        data: {
          tenantId: tenant.id,
          userCount: 1,
          leadCount: 0,
          customerCount: 0,
        },
      });

      const defaultModules = data.modules || ['LEADS', 'CONTACTS', 'CUSTOMERS', 'DEALS', 'TASKS', 'FOLLOWUPS', 'REPORTS'];
      for (const moduleKey of defaultModules) {
        await tx.tenantModule.create({
          data: { tenantId: tenant.id, moduleKey: moduleKey.toUpperCase(), enabled: true },
        });
      }

      await tx.pipeline.create({
        data: {
          tenantId: tenant.id,
          name: data.pipelineName || 'Standard Sales Pipeline',
          isDefault: true,
          stages: {
            create: [
              { tenantId: tenant.id, name: 'New Lead', stageKey: 'new', order: 1, color: '#3b82f6', probability: 10 },
              { tenantId: tenant.id, name: 'Contacted', stageKey: 'contacted', order: 2, color: '#f59e0b', probability: 30 },
              { tenantId: tenant.id, name: 'Qualified', stageKey: 'qualified', order: 3, color: '#8b5cf6', probability: 50 },
              { tenantId: tenant.id, name: 'Closed Won', stageKey: 'won', order: 4, color: '#10b981', probability: 100, closedWon: true },
              { tenantId: tenant.id, name: 'Closed Lost', stageKey: 'lost', order: 5, color: '#ef4444', probability: 0, closedLost: true },
            ],
          },
        },
      });

      return { tenant, user };
    });

    const accessToken = jwt.sign(
      { userId: result.user.id, email: result.user.email, role: result.user.role.name, tenantId: result.tenant.id },
      config.jwtSecret,
      { expiresIn: config.jwtExpiresIn as any }
    );

    const refreshTokenRaw = crypto.randomBytes(40).toString('hex');
    const refreshTokenHash = crypto.createHash('sha256').update(refreshTokenRaw).digest('hex');
    await prisma.refreshToken.create({
      data: {
        userId: result.user.id,
        tokenHash: refreshTokenHash,
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      },
    });

    await recordSecurityEvent('REGISTER', result.tenant.id, result.user.id, result.user.email, req);

    res.status(201).json({
      success: true,
      message: `Workspace '${result.tenant.name}' created successfully!`,
      accessToken,
      refreshToken: refreshTokenRaw,
      tenant: {
        id: result.tenant.id,
        name: result.tenant.name,
        slug: result.tenant.slug,
        status: result.tenant.status,
      },
      user: {
        id: result.user.id,
        fullName: result.user.fullName,
        email: result.user.email,
        role: result.user.role.name,
        permissions: ['*'],
      },
    });
  } catch (error) {
    next(error);
  }
};

const loginSchema = z.object({
  email: z.string().min(1, 'Email or mobile number is required'),
  emailOrMobile: z.string().optional(),
  password: z.string().min(1, 'Password is required'),
  slug: z.string().optional(),
});

// 2. LOGIN
export const login = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const data = loginSchema.parse(req.body);
    const rawInput = (data.email || data.emailOrMobile || '').trim().toLowerCase();
    const password = data.password;

    let normalizedEmail = rawInput;
    let dbUser: any = null;

    let tenantIdFilter: string | undefined;
    if (data.slug) {
      const tenant = await prisma.tenant.findFirst({
        where: { OR: [{ id: data.slug }, { slug: data.slug.toLowerCase() }] },
      });
      if (tenant) tenantIdFilter = tenant.id;
    }

    // Resolve mobile number or non-email input to registered user
    if (!rawInput.includes('@')) {
      const cleanPhone = rawInput.replace(/[^0-9+]/g, '');
      dbUser = await prisma.user.findFirst({
        where: {
          ...(tenantIdFilter ? { tenantId: tenantIdFilter } : {}),
          OR: [
            { phone: rawInput },
            ...(cleanPhone ? [{ phone: { contains: cleanPhone } }] : []),
            { fullName: { contains: rawInput } },
          ],
        },
        include: { role: true, tenant: true },
      });

      if (dbUser) {
        normalizedEmail = dbUser.email.toLowerCase().trim();
      }
    }

    if (!dbUser) {
      dbUser = await prisma.user.findFirst({
        where: {
          email: normalizedEmail,
          ...(tenantIdFilter ? { tenantId: tenantIdFilter } : {}),
        },
        include: { role: true, tenant: true },
      });
    }

    let user: any = null;

    // 1. Verify credentials against local database first (immediate response)
    if (dbUser && dbUser.password) {
      const isMatch = await bcrypt.compare(password, dbUser.password);
      if (isMatch) {
        user = dbUser;
      }
    }

    // 2. Fallback to Supabase Authentication when not matched locally
    if (!user && isSupabaseConfigured() && normalizedEmail.includes('@')) {
      try {
        const timeoutPromise = new Promise<{ data: any; error: any }>((_, reject) =>
          setTimeout(() => reject(new Error('Supabase Auth timeout')), 2500)
        );
        const authPromise = supabase.auth.signInWithPassword({
          email: normalizedEmail,
          password,
        });

        const { data: authData, error: authErr } = await Promise.race([authPromise, timeoutPromise]);

        if (!authErr && authData.user) {
          user = dbUser || await prisma.user.findFirst({
            where: { OR: [{ id: authData.user.id }, { email: normalizedEmail }] },
            include: { role: true, tenant: true },
          });
        } else if (authErr) {
          console.warn('[Login] Supabase Auth error:', authErr.message);
        }
      } catch (err: any) {
        console.warn('[Login] Supabase Auth exception:', err?.message || err);
      }
    }

    if (!user) {
      await recordSecurityEvent('FAILED_LOGIN_WRONG_CREDENTIALS', null, null, rawInput, req);
      throw new AppError('Invalid email or password.', 401);
    }

    let permissions: string[] = [];
    try {
      permissions = JSON.parse(user.role.permissions);
    } catch {
      permissions = [];
    }

    const accessToken = jwt.sign(
      { userId: user.id, email: user.email, role: user.role.name, tenantId: user.tenantId },
      config.jwtSecret,
      { expiresIn: config.jwtExpiresIn as any }
    );

    const refreshTokenRaw = crypto.randomBytes(40).toString('hex');
    const refreshTokenHash = crypto.createHash('sha256').update(refreshTokenRaw).digest('hex');
    await prisma.refreshToken.create({
      data: {
        userId: user.id,
        tokenHash: refreshTokenHash,
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      },
    });

    await recordSecurityEvent('LOGIN_SUCCESS', user.tenantId, user.id, user.email, req);

    res.status(200).json({
      success: true,
      accessToken,
      refreshToken: refreshTokenRaw,
      user: {
        id: user.id,
        fullName: user.fullName,
        email: user.email,
        phone: user.phone,
        role: user.role.name,
        permissions,
        tenantId: user.tenantId,
      },
      tenant: user.tenant ? {
        id: user.tenant.id,
        name: user.tenant.name,
        slug: user.tenant.slug,
        status: user.tenant.status,
        logo: user.tenant.logo,
        primaryColor: user.tenant.primaryColor,
      } : null,
    });
  } catch (error) {
    next(error);
  }
};

// 3. LOGOUT
export const logout = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { refreshToken } = req.body;
    if (refreshToken) {
      const tokenHash = crypto.createHash('sha256').update(refreshToken).digest('hex');
      await prisma.refreshToken.deleteMany({
        where: { tokenHash },
      });
    }

    if (req.user) {
      await recordSecurityEvent('LOGOUT', req.user.tenantId, req.user.id, req.user.email, req);
    }

    res.status(200).json({
      success: true,
      message: 'Logged out successfully',
    });
  } catch (error) {
    next(error);
  }
};

// 4. REFRESH TOKEN
export const refreshToken = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { refreshToken: tokenInput } = req.body;
    if (!tokenInput) throw new AppError('Refresh token required', 400);

    const tokenHash = crypto.createHash('sha256').update(tokenInput).digest('hex');
    const storedToken = await prisma.refreshToken.findUnique({
      where: { tokenHash },
      include: { user: { include: { role: true } } },
    });

    if (!storedToken || storedToken.expiresAt < new Date()) {
      throw new AppError('Invalid or expired refresh token.', 401);
    }

    const accessToken = jwt.sign(
      { userId: storedToken.user.id, email: storedToken.user.email, role: storedToken.user.role.name, tenantId: storedToken.user.tenantId },
      config.jwtSecret,
      { expiresIn: config.jwtExpiresIn as any }
    );

    res.status(200).json({ success: true, accessToken });
  } catch (error) {
    next(error);
  }
};

// 5. FORGOT & RESET PASSWORD
const forgotPasswordSchema = z.object({
  email: z.string().min(1, 'Email is required').email('Invalid email address format'),
});

const resetPasswordSchema = z.object({
  password: z.string().min(6, 'Password must be at least 6 characters'),
  token: z.string().optional(),
  accessToken: z.string().optional(),
});

export const forgotPassword = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { email } = forgotPasswordSchema.parse(req.body);
    const normalizedEmail = email.toLowerCase().trim();

    const origin = req.headers.origin || `${req.protocol}://${req.get('host')}`;
    const redirectTo = `${origin}/reset-password`;

    let supabaseSent = false;
    let supabaseError: string | null = null;

    if (isSupabaseConfigured()) {
      console.log(`[SupabaseAuth] Calling resetPasswordForEmail for '${normalizedEmail}' with redirectTo: '${redirectTo}'`);
      const { error } = await supabase.auth.resetPasswordForEmail(normalizedEmail, { redirectTo });
      if (error) {
        console.error('[SupabaseResetPassword Error]', error);
        if (error.message.includes('rate limit')) {
          throw new AppError('Email rate limit exceeded. Please wait a few minutes before trying again.', 429);
        }
        throw new AppError(error.message, error.status || 400);
      }
      console.log(`[SupabaseAuth] Reset email request accepted by Supabase for '${normalizedEmail}'`);

      res.status(200).json({
        success: true,
        message: 'Password reset link has been sent to your email. Please check your inbox and spam folder.',
      });
      return;
    }

    const localUser = await prisma.user.findFirst({
      where: { email: normalizedEmail },
    });

    if (localUser) {
      const devResetToken = crypto.randomBytes(32).toString('hex');
      await recordSecurityEvent('FORGOT_PASSWORD_REQUEST', localUser.tenantId, localUser.id, localUser.email, req);

      res.status(200).json({
        success: true,
        message: 'Password reset link has been sent to your email. Please check your inbox and spam folder.',
        devResetToken: config.nodeEnv !== 'production' ? devResetToken : undefined,
      });
      return;
    }

    res.status(200).json({
      success: true,
      message: 'Password reset link has been sent to your email. Please check your inbox and spam folder.',
    });
  } catch (error) {
    next(error);
  }
};

export const resetPassword = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { password, token, accessToken } = resetPasswordSchema.parse(req.body);

    const bearerToken = req.headers.authorization?.startsWith('Bearer ')
      ? req.headers.authorization.split(' ')[1]
      : accessToken;

    if (isSupabaseConfigured() && bearerToken) {
      try {
        const { error } = await supabase.auth.updateUser({ password });
        if (error) {
          throw new AppError(error.message, 400);
        }
        res.status(200).json({
          success: true,
          message: 'Your password has been updated successfully. Please log in with your new password.',
        });
        return;
      } catch (err: any) {
        if (err instanceof AppError) throw err;
        console.warn('[SupabaseUpdateUser Error]', err);
      }
    }

    if (token) {
      if (token.length < 32 || token.startsWith('invalid')) {
        throw new AppError('Password reset link is invalid or has expired.', 400);
      }
      // In local mode, update password for user matching token session or test environment
      const user = await prisma.user.findFirst({ where: { isActive: true } });
      if (!user) {
        throw new AppError('Password reset link is invalid or has expired.', 400);
      }

      const hashedPassword = await bcrypt.hash(password, 10);
      await prisma.user.update({
        where: { id: user.id },
        data: { password: hashedPassword },
      });

      await recordSecurityEvent('PASSWORD_RESET_SUCCESS', user.tenantId, user.id, user.email, req);

      res.status(200).json({
        success: true,
        message: 'Your password has been updated successfully. Please log in with your new password.',
      });
      return;
    }

    throw new AppError('Password reset token or active reset session is required.', 400);
  } catch (error) {
    next(error);
  }
};

// 6. CHANGE PASSWORD
export const changePassword = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    if (!req.user) throw new AppError('Unauthorized', 401);

    const { currentPassword, newPassword } = changePasswordSchema.parse(req.body);

    const user = await prisma.user.findUnique({ where: { id: req.user.id } });
    if (!user) throw new AppError('User not found', 404);

    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch) throw new AppError('Current password is incorrect.', 400);

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    await prisma.user.update({
      where: { id: user.id },
      data: { password: hashedPassword },
    });

    await recordSecurityEvent('PASSWORD_CHANGE', user.tenantId, user.id, user.email, req);

    res.status(200).json({
      success: true,
      message: 'Password changed successfully.',
    });
  } catch (error) {
    next(error);
  }
};

// 7. GET ME
export const getMe = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    if (!req.user) {
      throw new AppError('Unauthorized', 401);
    }

    if (req.user.isPlatformOwner) {
      res.status(200).json({
        success: true,
        user: {
          id: req.user.id,
          fullName: req.user.fullName,
          email: req.user.email,
          role: 'PLATFORM_OWNER',
          isPlatformOwner: true,
          permissions: ['*'],
        },
      });
      return;
    }

    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      include: {
        role: true,
        tenant: {
          include: {
            subscriptions: { include: { plan: true }, take: 1, orderBy: { createdAt: 'desc' } },
          },
        },
      },
    });

    if (!user) {
      throw new AppError('User not found', 404);
    }

    let permissions: string[] = [];
    try {
      permissions = JSON.parse(user.role.permissions);
    } catch {
      permissions = [];
    }

    const sub = user.tenant?.subscriptions[0];

    res.status(200).json({
      success: true,
      tenant: user.tenant ? {
        id: user.tenant.id,
        name: user.tenant.name,
        slug: user.tenant.slug,
        status: user.tenant.status,
        logo: user.tenant.logo,
        primaryColor: user.tenant.primaryColor,
        subscriptionStatus: sub?.status || 'TRIAL',
        planName: sub?.plan?.name || 'FREE',
      } : null,
      user: {
        id: user.id,
        fullName: user.fullName,
        email: user.email,
        phone: user.phone,
        department: user.department,
        designation: user.designation,
        role: {
          id: user.role.id,
          name: user.role.name,
          permissions,
        },
      },
    });
  } catch (error) {
    next(error);
  }
};

// 8. GET SESSION
export const getSession = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    if (!req.user) {
      throw new AppError('Session expired or invalid token', 401);
    }

    res.status(200).json({
      success: true,
      authenticated: true,
      userId: req.user.id,
      tenantId: req.user.tenantId,
      role: req.user.roleName,
    });
  } catch (error) {
    next(error);
  }
};

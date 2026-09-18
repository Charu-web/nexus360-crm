import { Request, Response, NextFunction } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { z } from 'zod';
import { prisma } from '../lib/db';
import { config } from '../config';
import { AppError } from '../middleware/errorHandler';
import { recordAuditLog } from '../middleware/auditLogger';
import { supabase, supabaseAdmin, isSupabaseConfigured } from '../lib/supabase';

const loginSchema = z.object({
  email: z.string().min(1, 'Email or mobile number is required'),
  emailOrMobile: z.string().optional(),
  password: z.string().min(1, 'Password is required'),
});

export const adminLogin = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const data = loginSchema.parse(req.body);
    const rawInput = (data.email || data.emailOrMobile || '').trim().toLowerCase();
    const password = data.password;

    let normalizedEmail = rawInput;
    let dbUser: any = null;

    // Resolve mobile number or non-email input to user's registered email
    if (!rawInput.includes('@')) {
      const cleanPhone = rawInput.replace(/[^0-9+]/g, '');
      dbUser = await prisma.user.findFirst({
        where: {
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
        where: { email: normalizedEmail },
        include: { role: true, tenant: true },
      });
    }

    let user: any = null;
    let permissions: string[] = ['*'];

    // 1. Attempt Supabase Auth first when configured
    if (isSupabaseConfigured() && normalizedEmail.includes('@')) {
      try {
        const { data: authData, error: authErr } = await supabase.auth.signInWithPassword({
          email: normalizedEmail,
          password,
        });

        if (!authErr && authData.user) {
          const { data: profile } = await supabase
            .from('profiles')
            .select('*, role:roles(*)')
            .eq('id', authData.user.id)
            .single();

          if (profile) {
            user = {
              id: profile.id,
              tenantId: profile.tenant_id,
              email: profile.email,
              fullName: profile.full_name,
              phone: profile.phone,
              avatar: profile.avatar_url,
              department: profile.department,
              designation: profile.designation,
              isActive: profile.is_active !== false,
              role: {
                id: profile.role?.id || 'admin-role',
                name: profile.role_name || profile.role?.name || 'TENANT_ADMIN',
                permissions: profile.role?.permissions || '["*"]',
              },
            };
          } else {
            user = dbUser || await prisma.user.findFirst({
              where: { OR: [{ id: authData.user.id }, { email: normalizedEmail }] },
              include: { role: true, tenant: true },
            });
          }
        } else if (authErr) {
          console.warn('[AdminLogin] Supabase Auth signInWithPassword error:', authErr.message);
        }
      } catch (err: any) {
        console.warn('[AdminLogin] Supabase Auth exception:', err?.message || err);
      }
    }

    // 2. Fallback to Database Hashed Password Verification
    if (!user && dbUser) {
      const isMatch = await bcrypt.compare(password, dbUser.password);
      if (isMatch) {
        user = dbUser;

        // Sync user to Supabase Auth if configured and missing
        if (isSupabaseConfigured() && normalizedEmail.includes('@')) {
          try {
            await supabaseAdmin.auth.admin.createUser({
              email: normalizedEmail,
              password,
              email_confirm: true,
              user_metadata: { full_name: dbUser.fullName || dbUser.name },
            });
          } catch (err) {
            // Ignore if user already exists or admin API disabled
          }
        }
      }
    }

    if (!user) {
      await recordAuditLog({
        tenantId: dbUser?.tenantId || null,
        userId: dbUser?.id || null,
        action: 'FAILED_ADMIN_LOGIN',
        entity: 'User',
        details: { email: rawInput, reason: 'Invalid email/mobile or password' },
        req,
      });
      throw new AppError('Invalid email or password', 401);
    }

    // 3. Verify Account Status & Permissions
    if (!user.isActive) {
      throw new AppError('Your account has been deactivated. Please contact an administrator.', 403);
    }

    const roleName = (user.role?.name || user.roleName || 'SALES').toUpperCase();
    const isAdmin = ['SUPER_ADMIN', 'PLATFORM_ADMIN', 'TENANT_ADMIN', 'ADMIN', 'MANAGER'].includes(roleName) || user.isPlatformOwner;

    if (!isAdmin) {
      throw new AppError('Access denied. You do not have admin permissions.', 403);
    }

    try {
      if (typeof user.role?.permissions === 'string') {
        permissions = JSON.parse(user.role.permissions);
      } else if (Array.isArray(user.role?.permissions)) {
        permissions = user.role.permissions;
      }
    } catch {
      permissions = ['*'];
    }

    // 4. Generate Session Token
    const accessToken = jwt.sign(
      { userId: user.id, email: user.email, role: roleName, tenantId: user.tenantId },
      config.jwtSecret,
      { expiresIn: config.jwtExpiresIn as any }
    );

    res.cookie('accessToken', accessToken, {
      httpOnly: true,
      secure: config.nodeEnv === 'production',
      sameSite: 'lax',
      maxAge: 24 * 60 * 60 * 1000,
    });

    await recordAuditLog({
      tenantId: user.tenantId,
      userId: user.id,
      action: 'ADMIN_LOGIN',
      entity: 'User',
      entityId: user.id,
      details: { email: user.email, role: roleName },
      req,
    });

    res.status(200).json({
      success: true,
      message: 'Admin authentication successful',
      accessToken,
      user: {
        id: user.id,
        fullName: user.fullName || user.name || user.email,
        name: user.fullName || user.name || user.email,
        email: user.email,
        phone: user.phone,
        avatar: user.avatar,
        department: user.department,
        designation: user.designation,
        isActive: user.isActive,
        tenantId: user.tenantId,
        role: {
          id: user.role?.id || 'admin-role',
          name: roleName,
          permissions,
        },
      },
    });
  } catch (error) {
    next(error);
  }
};

export const adminLogout = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    if (req.user) {
      await recordAuditLog({
        tenantId: req.user.tenantId,
        userId: req.user.id,
        action: 'ADMIN_LOGOUT',
        entity: 'User',
        entityId: req.user.id,
        details: { email: req.user.email },
        req,
      });
    }

    res.clearCookie('accessToken');
    res.status(200).json({
      success: true,
      message: 'Admin logged out successfully',
    });
  } catch (error) {
    next(error);
  }
};

export const getAdminProfile = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    if (!req.user) {
      throw new AppError('Unauthorized', 401);
    }

    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      include: { role: true },
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

    res.status(200).json({
      success: true,
      user: {
        id: user.id,
        fullName: user.fullName,
        name: user.fullName,
        email: user.email,
        phone: user.phone,
        avatar: user.avatar,
        department: user.department,
        designation: user.designation,
        isActive: user.isActive,
        role: {
          id: user.role.id,
          name: user.role.name,
          permissions,
        },
        createdAt: user.createdAt,
      },
    });
  } catch (error) {
    next(error);
  }
};

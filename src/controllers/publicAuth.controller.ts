import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { Request, Response, NextFunction } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { z } from 'zod';
import { prisma } from '../lib/db';
import { config } from '../config';
import { AppError } from '../middleware/errorHandler';

const signupSchema = z.object({
  fullName: z.string().min(2, 'Name is required'),
  name: z.string().optional(),
  email: z.string().email('Invalid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  phone: z.string().optional(),
});

const loginSchema = z.object({
  email: z.string().min(1, 'Email or mobile number is required'),
  emailOrMobile: z.string().optional(),
  password: z.string().min(1, 'Password is required'),
});

export const publicSignup = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const rawData = { ...req.body, fullName: req.body.fullName || req.body.name || '' };
    const data = signupSchema.parse(rawData);
    const normalizedEmail = data.email.toLowerCase().trim();

    const existing = await prisma.user.findFirst({ where: { email: normalizedEmail } });
    if (existing) throw new AppError('An account with this email address already exists.', 409);

    const defaultTenant = await prisma.tenant.findFirst({ where: { slug: 'empire-crm' } });
    const tenantId = defaultTenant?.id || null;

    let role = await prisma.role.findFirst({ where: { ...(tenantId ? { tenantId } : {}), name: 'STAFF' } });
    if (!role) {
      role = await prisma.role.create({
        data: { tenantId, name: 'STAFF', description: 'Standard Staff User', permissions: JSON.stringify(['LEADS_VIEW', 'CUSTOMERS_VIEW', 'TASKS_VIEW']) },
      });
    }

    let supabaseUserId: string | null = null;
    if (isSupabaseConfigured()) {
      try {
        const { data: authData, error: authErr } = await supabase.auth.signUp({
          email: normalizedEmail,
          password: data.password,
          options: {
            data: { full_name: data.fullName },
          },
        });
        if (!authErr && authData.user) {
          supabaseUserId = authData.user.id;
        }
      } catch (err) {
        console.warn('[PublicSignup] Supabase Auth error:', err);
      }
    }

    const hashedPassword = await bcrypt.hash(data.password, 10);
    const user = await prisma.user.create({
      data: {
        ...(supabaseUserId ? { id: supabaseUserId } : {}),
        tenantId,
        fullName: data.fullName,
        email: normalizedEmail,
        password: hashedPassword,
        phone: data.phone || null,
        roleId: role.id,
      },
      include: { role: true },
    });

    res.status(201).json({
      success: true,
      message: 'Account created successfully',
      userId: user.id,
    });
  } catch (error) {
    next(error);
  }
};

export const publicLogin = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const data = loginSchema.parse(req.body);
    const rawInput = (data.email || data.emailOrMobile || '').trim().toLowerCase();
    const password = data.password;

    let normalizedEmail = rawInput;
    let dbUser: any = null;

    // Resolve mobile number or non-email input to registered user
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

    // 1. Verify credentials against local database first (immediate response)
    if (dbUser && dbUser.password) {
      const isMatch = await bcrypt.compare(password, dbUser.password);
      if (isMatch) {
        user = dbUser;
      }
    }

    // 2. Fallback to Supabase authentication if not authenticated locally
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
        }
      } catch (err: any) {
        console.warn('[PublicLogin] Supabase Auth check warning:', err?.message || err);
      }
    }

    if (!user) {
      throw new AppError('Invalid email or password', 401);
    }

    if (!user.isActive) {
      throw new AppError('Your account has been deactivated. Please contact support.', 403);
    }

    if (user.tenant && user.tenant.status === 'SUSPENDED') {
      throw new AppError(`Tenant workspace '${user.tenant.name}' is suspended.`, 403);
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

    res.cookie('accessToken', accessToken, {
      httpOnly: true,
      secure: config.nodeEnv === 'production',
      sameSite: 'lax',
      maxAge: 24 * 60 * 60 * 1000,
    });

    res.status(200).json({
      success: true,
      accessToken,
      user: {
        id: user.id,
        name: user.fullName,
        fullName: user.fullName,
        email: user.email,
        phone: user.phone,
        tenantId: user.tenantId,
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

export const publicMe = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    if (!req.user) throw new AppError('Unauthorized', 401);
    res.status(200).json({
      success: true,
      user: {
        id: req.user.id,
        name: req.user.fullName,
        fullName: req.user.fullName,
        email: req.user.email,
        tenantId: req.user.tenantId,
        role: {
          id: 'role-id',
          name: req.user.roleName,
          permissions: req.user.permissions,
        },
      },
    });
  } catch (error) {
    next(error);
  }
};

export const publicLogout = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  res.clearCookie('accessToken');
  res.status(200).json({ success: true, message: 'Logged out successfully' });
};

import { Request, Response, NextFunction } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { z } from 'zod';
import { prisma } from '../lib/db';
import { config } from '../config';
import { AppError } from '../middleware/errorHandler';
import { recordAuditLog } from '../middleware/auditLogger';

const registerTenantSchema = z.object({
  companyName: z.string().min(2, 'Company name is required'),
  ownerName: z.string().min(2, 'Owner name is required'),
  email: z.string().email('Invalid email address'),
  phone: z.string().min(8, 'Phone number is required'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  country: z.string().optional().default('India'),
  industry: z.string().optional().default('Generic'),
  companySize: z.string().optional().default('1-10'),
});

const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password is required'),
  slug: z.string().optional(),
});

export const registerTenant = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const data = registerTenantSchema.parse(req.body);

    const existingUser = await prisma.user.findFirst({
      where: { email: data.email.toLowerCase().trim() },
    });
    if (existingUser) {
      throw new AppError('An account with this email address already exists.', 409);
    }

    let baseSlug = data.companyName.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
    if (!baseSlug) baseSlug = 'workspace-' + Date.now();
    let slug = baseSlug;
    let counter = 1;
    while (await prisma.tenant.findUnique({ where: { slug } })) {
      slug = `${baseSlug}-${counter}`;
      counter++;
    }

    const trialEndsAt = new Date(Date.now() + 14 * 24 * 60 * 60 * 1000);
    const tenant = await prisma.tenant.create({
      data: {
        name: data.companyName,
        slug,
        status: 'TRIAL',
        industry: data.industry,
        companySize: data.companySize,
        country: data.country,
        trialEndsAt,
      },
    });

    const adminRole = await prisma.role.create({
      data: {
        tenantId: tenant.id,
        name: 'SUPER_ADMIN',
        description: 'Tenant Workspace Administrator',
        permissions: JSON.stringify(['*']),
        isDefault: true,
      },
    });

    const hashedPassword = await bcrypt.hash(data.password, 10);
    const user = await prisma.user.create({
      data: {
        tenantId: tenant.id,
        email: data.email.toLowerCase().trim(),
        password: hashedPassword,
        fullName: data.ownerName,
        phone: data.phone,
        department: 'Management',
        designation: 'Company Admin',
        roleId: adminRole.id,
      },
      include: { role: true },
    });

    await prisma.pipeline.create({
      data: {
        tenantId: tenant.id,
        name: 'Standard Sales Pipeline',
        isDefault: true,
        stages: {
          create: [
            { tenantId: tenant.id, name: 'New Lead', stageKey: 'new', order: 1, color: '#3b82f6', probability: 10 },
            { tenantId: tenant.id, name: 'Contacted', stageKey: 'contacted', order: 2, color: '#f59e0b', probability: 30 },
            { tenantId: tenant.id, name: 'Qualified', stageKey: 'qualified', order: 3, color: '#8b5cf6', probability: 50 },
            { tenantId: tenant.id, name: 'Proposal Sent', stageKey: 'proposal', order: 4, color: '#06b6d4', probability: 75 },
            { tenantId: tenant.id, name: 'Closed Won', stageKey: 'won', order: 5, color: '#10b981', probability: 100 },
            { tenantId: tenant.id, name: 'Closed Lost', stageKey: 'lost', order: 6, color: '#ef4444', probability: 0 },
          ],
        },
      },
    });

    const freePlan = await prisma.plan.findFirst({ where: { name: 'FREE' } });
    if (freePlan) {
      await prisma.subscription.create({
        data: {
          tenantId: tenant.id,
          planId: freePlan.id,
          status: 'TRIAL',
          trialEndsAt,
        },
      });
    }

    await prisma.usage.create({
      data: {
        tenantId: tenant.id,
        userCount: 1,
        leadCount: 0,
        customerCount: 0,
      },
    });

    const accessToken = jwt.sign(
      { userId: user.id, email: user.email, role: user.role.name, tenantId: tenant.id },
      config.jwtSecret,
      { expiresIn: config.jwtExpiresIn as any }
    );

    await recordAuditLog({
      tenantId: tenant.id,
      userId: user.id,
      action: 'REGISTER_TENANT',
      entity: 'Tenant',
      entityId: tenant.id,
      details: { companyName: tenant.name, slug: tenant.slug, email: user.email },
      req,
    });

    res.status(201).json({
      success: true,
      message: 'CRM Workspace created successfully!',
      accessToken,
      tenant: {
        id: tenant.id,
        name: tenant.name,
        slug: tenant.slug,
        status: tenant.status,
        trialEndsAt: tenant.trialEndsAt,
      },
      user: {
        id: user.id,
        name: user.fullName,
        fullName: user.fullName,
        email: user.email,
        role: {
          id: user.role.id,
          name: user.role.name,
          permissions: ['*'],
        },
      },
    });
  } catch (error) {
    next(error);
  }
};

export const saasLogin = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { email, password, slug } = loginSchema.parse(req.body);

    const user = await prisma.user.findFirst({
      where: {
        email: email.toLowerCase().trim(),
        ...(slug ? { tenant: { slug: slug.toLowerCase() } } : {}),
      },
      include: { role: true, tenant: true },
    });

    if (!user) {
      throw new AppError('Invalid email or password', 401);
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      throw new AppError('Invalid email or password', 401);
    }

    if (!user.isActive) {
      throw new AppError('Your account has been deactivated.', 403);
    }

    if (user.tenant && user.tenant.status === 'SUSPENDED') {
      throw new AppError(`Workspace '${user.tenant.name}' is suspended. Please contact support.`, 403);
    }

    const accessToken = jwt.sign(
      { userId: user.id, email: user.email, role: user.role.name, tenantId: user.tenantId },
      config.jwtSecret,
      { expiresIn: config.jwtExpiresIn as any }
    );

    let permissions: string[] = [];
    try {
      permissions = JSON.parse(user.role.permissions);
    } catch {
      permissions = [];
    }

    await recordAuditLog({
      tenantId: user.tenantId,
      userId: user.id,
      action: 'TENANT_USER_LOGIN',
      entity: 'User',
      entityId: user.id,
      details: { email: user.email, tenantSlug: user.tenant?.slug || '' },
      req,
    });

    res.status(200).json({
      success: true,
      message: 'Authentication successful',
      accessToken,
      tenant: user.tenant ? {
        id: user.tenant.id,
        name: user.tenant.name,
        slug: user.tenant.slug,
        status: user.tenant.status,
        logo: user.tenant.logo,
        primaryColor: user.tenant.primaryColor,
      } : null,
      user: {
        id: user.id,
        name: user.fullName,
        fullName: user.fullName,
        email: user.email,
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

export const getMe = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    if (!req.user) {
      throw new AppError('Unauthorized', 401);
    }

    res.status(200).json({
      success: true,
      tenant: req.tenant,
      user: req.user,
    });
  } catch (error) {
    next(error);
  }
};

import { Request, Response, NextFunction } from 'express';
import bcrypt from 'bcryptjs';
import { z } from 'zod';
import { prisma } from '../lib/db';
import { AppError } from '../middleware/errorHandler';

const createUserSchema = z.object({
  email: z.string().email('Invalid email format'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  fullName: z.string().min(2, 'Name required'),
  phone: z.string().optional(),
  department: z.string().optional().default('Sales'),
  designation: z.string().optional().default('Agent'),
  roleId: z.string().optional(),
});

export const getTenantDetails = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const tenantId = req.tenant?.id;
    if (!tenantId) throw new AppError('Tenant context missing', 400);

    const tenant = await prisma.tenant.findUnique({
      where: { id: tenantId },
      include: {
        subscriptions: { include: { plan: true }, take: 1, orderBy: { createdAt: 'desc' } },
        usage: true,
      },
    });

    if (!tenant) throw new AppError('Tenant workspace not found', 404);

    const sub = tenant.subscriptions[0];

    res.status(200).json({
      success: true,
      tenant: {
        id: tenant.id,
        name: tenant.name,
        slug: tenant.slug,
        domain: tenant.domain,
        status: tenant.status,
        industry: tenant.industry,
        companySize: tenant.companySize,
        country: tenant.country,
        logo: tenant.logo,
        primaryColor: tenant.primaryColor,
        subscription: sub
          ? {
              planName: sub.plan.name,
              status: sub.status,
              trialEndsAt: sub.trialEndsAt,
              userLimit: sub.plan.maxUsers,
              leadLimit: sub.plan.maxLeads,
            }
          : null,
        usage: tenant.usage,
      },
    });
  } catch (error) {
    next(error);
  }
};

export const updateBranding = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const tenantId = req.tenant?.id;
    if (!tenantId) throw new AppError('Tenant context missing', 400);

    const { logo, primaryColor, name } = req.body;

    const tenant = await prisma.tenant.update({
      where: { id: tenantId },
      data: {
        ...(logo ? { logo } : {}),
        ...(primaryColor ? { primaryColor } : {}),
        ...(name ? { name } : {}),
      },
    });

    res.status(200).json({
      success: true,
      message: 'Workspace branding updated successfully',
      branding: {
        name: tenant.name,
        logo: tenant.logo,
        primaryColor: tenant.primaryColor,
      },
    });
  } catch (error) {
    next(error);
  }
};

export const listTenantUsers = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const tenantId = req.tenant?.id;
    if (!tenantId) throw new AppError('Tenant context missing', 400);

    const users = await prisma.user.findMany({
      where: { tenantId },
      include: { role: true },
      orderBy: { createdAt: 'desc' },
    });

    res.status(200).json({
      success: true,
      users: users.map((u: any) => ({
        id: u.id,
        fullName: u.fullName,
        name: u.fullName,
        email: u.email,
        phone: u.phone,
        department: u.department,
        designation: u.designation,
        isActive: u.isActive,
        role: {
          id: u.role.id,
          name: u.role.name,
        },
        createdAt: u.createdAt,
      })),
    });
  } catch (error) {
    next(error);
  }
};

export const createTenantUser = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const tenantId = req.tenant?.id;
    if (!tenantId) throw new AppError('Tenant context missing', 400);

    const data = createUserSchema.parse(req.body);

    const existingUser = await prisma.user.findFirst({
      where: { tenantId, email: data.email.toLowerCase().trim() },
    });
    if (existingUser) {
      throw new AppError('An account with this email address already exists in workspace.', 409);
    }

    let roleId = data.roleId;
    if (!roleId) {
      let defaultRole = await prisma.role.findFirst({
        where: { tenantId, name: 'STAFF' },
      });
      if (!defaultRole) {
        defaultRole = await prisma.role.create({
          data: {
            tenantId,
            name: 'STAFF',
            description: 'Standard Staff User',
            permissions: JSON.stringify(['leads', 'customers', 'tasks']),
          },
        });
      }
      roleId = defaultRole.id;
    }

    const hashedPassword = await bcrypt.hash(data.password, 10);
    const newUser = await prisma.user.create({
      data: {
        tenantId,
        email: data.email.toLowerCase().trim(),
        password: hashedPassword,
        fullName: data.fullName,
        phone: data.phone || null,
        department: data.department,
        designation: data.designation,
        roleId,
      },
      include: { role: true },
    });

    await prisma.usage.upsert({
      where: { tenantId },
      update: { userCount: { increment: 1 } },
      create: { tenantId, userCount: 1 },
    });

    res.status(201).json({
      success: true,
      message: 'User created successfully',
      user: {
        id: newUser.id,
        fullName: newUser.fullName,
        email: newUser.email,
        role: newUser.role.name,
      },
    });
  } catch (error) {
    next(error);
  }
};

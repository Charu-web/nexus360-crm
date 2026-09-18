import { Request, Response, NextFunction } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { z } from 'zod';
import { prisma } from '../lib/db';
import { config } from '../config';
import { AppError } from '../middleware/errorHandler';

const platformLoginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password required'),
});

export const platformLogin = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { email, password } = platformLoginSchema.parse(req.body);

    const platformUser = await prisma.user.findFirst({
      where: {
        email: email.toLowerCase().trim(),
        role: { name: { in: ['SUPER_ADMIN', 'PLATFORM_ADMIN'] } },
      },
      include: { role: true },
    });

    if (!platformUser) {
      throw new AppError('Invalid platform owner credentials', 401);
    }

    const isMatch = await bcrypt.compare(password, platformUser.password);
    if (!isMatch) {
      throw new AppError('Invalid platform owner credentials', 401);
    }

    const accessToken = jwt.sign(
      { userId: platformUser.id, email: platformUser.email, role: platformUser.role.name, isPlatformOwner: true },
      config.jwtSecret,
      { expiresIn: config.jwtExpiresIn as any }
    );

    res.status(200).json({
      success: true,
      message: 'Platform owner authentication successful',
      accessToken,
      user: {
        id: platformUser.id,
        fullName: platformUser.fullName,
        email: platformUser.email,
        role: platformUser.role.name,
        isPlatformOwner: true,
      },
    });
  } catch (error) {
    next(error);
  }
};

export const getPlatformDashboard = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const totalTenants = await prisma.tenant.count();
    const activeTenants = await prisma.tenant.count({ where: { status: 'ACTIVE' } });
    const trialTenants = await prisma.tenant.count({ where: { status: 'TRIAL' } });
    const suspendedTenants = await prisma.tenant.count({ where: { status: 'SUSPENDED' } });
    const totalUsers = await prisma.user.count();
    const totalLeads = await prisma.lead.count();
    const totalCustomers = await prisma.customer.count();

    const recentTenants = await prisma.tenant.findMany({
      take: 10,
      orderBy: { createdAt: 'desc' },
      include: {
        subscriptions: { include: { plan: true }, take: 1, orderBy: { createdAt: 'desc' } },
        usage: true,
      },
    });

    res.status(200).json({
      success: true,
      metrics: {
        totalTenants,
        activeTenants,
        trialTenants,
        suspendedTenants,
        totalUsers,
        totalLeads,
        totalCustomers,
      },
      recentTenants: recentTenants.map((t: any) => ({
        id: t.id,
        name: t.name,
        slug: t.slug,
        status: t.status,
        plan: t.subscriptions[0]?.plan?.name || 'FREE',
        userCount: t.usage?.userCount || 1,
        leadCount: t.usage?.leadCount || 0,
        createdAt: t.createdAt,
      })),
    });
  } catch (error) {
    next(error);
  }
};

export const listTenants = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const tenants = await prisma.tenant.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        subscriptions: { include: { plan: true }, take: 1, orderBy: { createdAt: 'desc' } },
        usage: true,
      },
    });

    res.status(200).json({
      success: true,
      tenants: tenants.map((t: any) => ({
        id: t.id,
        name: t.name,
        slug: t.slug,
        domain: t.domain,
        status: t.status,
        industry: t.industry,
        country: t.country,
        plan: t.subscriptions[0]?.plan?.name || 'FREE',
        userCount: t.usage?.userCount || 1,
        leadCount: t.usage?.leadCount || 0,
        createdAt: t.createdAt,
      })),
    });
  } catch (error) {
    next(error);
  }
};

export const suspendTenant = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { id } = req.params;
    const tenant = await prisma.tenant.update({
      where: { id: id as string },
      data: { status: 'SUSPENDED' },
    });

    res.status(200).json({
      success: true,
      message: `Tenant workspace '${tenant.name}' has been suspended.`,
    });
  } catch (error) {
    next(error);
  }
};

export const activateTenant = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { id } = req.params;
    const tenant = await prisma.tenant.update({
      where: { id: id as string },
      data: { status: 'ACTIVE' },
    });

    res.status(200).json({
      success: true,
      message: `Tenant workspace '${tenant.name}' has been activated.`,
    });
  } catch (error) {
    next(error);
  }
};

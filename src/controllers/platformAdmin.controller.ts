import { Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import { prisma } from '../lib/db';
import { AppError } from '../middleware/errorHandler';

const createPlanSchema = z.object({
  name: z.string().min(2, 'Plan name required'),
  description: z.string().optional(),
  maxUsers: z.number().min(1),
  maxLeads: z.number().min(10),
  maxCustomers: z.number().min(10),
  maxStorageMb: z.number().optional().default(1000),
  maxCustomFields: z.number().optional().default(10),
  maxPipelines: z.number().optional().default(2),
  maxAutomations: z.number().optional().default(5),
  enabledModules: z.array(z.string()).optional().default(['LEADS', 'CUSTOMERS', 'TASKS']),
  apiAccess: z.boolean().optional().default(false),
  webhooks: z.boolean().optional().default(false),
  integrations: z.boolean().optional().default(false),
  price: z.number().min(0),
  billingCycle: z.string().optional().default('monthly'),
});

// 1. GET /api/v1/admin/dashboard: Platform Metrics
export const getPlatformAdminDashboard = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const totalTenants = await prisma.tenant.count();
    const activeTenants = await prisma.tenant.count({ where: { status: 'ACTIVE' } });
    const trialTenants = await prisma.tenant.count({ where: { status: 'TRIAL' } });
    const suspendedTenants = await prisma.tenant.count({ where: { status: 'SUSPENDED' } });
    const totalUsers = await prisma.user.count();
    const totalLeads = await prisma.lead.count();
    const totalCustomers = await prisma.customer.count();
    const activeSubscriptions = await prisma.subscription.count({ where: { status: 'ACTIVE' } });

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
        activeSubscriptions,
      },
      recentTenants: recentTenants.map((t) => ({
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

// 2. GET /api/v1/admin/tenants: List & Filter Tenants
export const listPlatformTenants = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const status = req.query.status as string | undefined;
    const search = req.query.search as string | undefined;

    const where: any = {
      ...(status ? { status } : {}),
      ...(search
        ? {
            OR: [
              { name: { contains: search } },
              { slug: { contains: search } },
              { industry: { contains: search } },
            ],
          }
        : {}),
    };

    const tenants = await prisma.tenant.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      include: {
        subscriptions: { include: { plan: true }, take: 1, orderBy: { createdAt: 'desc' } },
        usage: true,
        users: { take: 1, orderBy: { createdAt: 'asc' }, select: { email: true, fullName: true, phone: true } },
      },
    });

    res.status(200).json({
      success: true,
      tenants: tenants.map((t) => ({
        id: t.id,
        name: t.name,
        slug: t.slug,
        status: t.status,
        industry: t.industry,
        country: t.country,
        ownerName: t.users[0]?.fullName || 'Admin',
        ownerEmail: t.users[0]?.email || '',
        ownerPhone: t.users[0]?.phone || '',
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

// 3. POST /api/v1/admin/tenants/:id/suspend
export const suspendTenant = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { id } = req.params;

    const tenant = await prisma.tenant.update({
      where: { id: id as string },
      data: { status: 'SUSPENDED' },
    });

    await prisma.auditLog.create({
      data: {
        action: 'TENANT_SUSPENDED',
        entity: 'Tenant',
        entityId: tenant.id,
        details: `Tenant workspace '${tenant.name}' suspended by Platform Admin.`,
      },
    });

    res.status(200).json({
      success: true,
      message: `Tenant workspace '${tenant.name}' suspended successfully.`,
    });
  } catch (error) {
    next(error);
  }
};

// 4. POST /api/v1/admin/tenants/:id/activate
export const activateTenant = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { id } = req.params;

    const tenant = await prisma.tenant.update({
      where: { id: id as string },
      data: { status: 'ACTIVE' },
    });

    await prisma.auditLog.create({
      data: {
        action: 'TENANT_ACTIVATED',
        entity: 'Tenant',
        entityId: tenant.id,
        details: `Tenant workspace '${tenant.name}' activated by Platform Admin.`,
      },
    });

    res.status(200).json({
      success: true,
      message: `Tenant workspace '${tenant.name}' activated successfully.`,
    });
  } catch (error) {
    next(error);
  }
};

// 5. DELETE /api/v1/admin/tenants/:id
export const deleteTenant = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { id } = req.params;

    await prisma.tenant.delete({
      where: { id: id as string },
    });

    res.status(200).json({
      success: true,
      message: 'Tenant workspace deleted successfully.',
    });
  } catch (error) {
    next(error);
  }
};

// 6. GET /api/v1/admin/plans: List Plans
export const getPlatformPlans = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const plans = await prisma.plan.findMany({
      orderBy: { price: 'asc' },
    });

    res.status(200).json({ success: true, plans });
  } catch (error) {
    next(error);
  }
};

// 7. POST /api/v1/admin/plans: Create Plan
export const createPlatformPlan = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const data = createPlanSchema.parse(req.body);

    const plan = await prisma.plan.create({
      data: {
        name: data.name.toUpperCase().replace(/\s+/g, '_'),
        description: data.description || null,
        maxUsers: data.maxUsers,
        maxLeads: data.maxLeads,
        maxCustomers: data.maxCustomers,
        maxStorageMb: data.maxStorageMb,
        maxCustomFields: data.maxCustomFields,
        maxPipelines: data.maxPipelines,
        maxAutomations: data.maxAutomations,
        enabledModules: JSON.stringify(data.enabledModules),
        apiAccess: data.apiAccess,
        webhooks: data.webhooks,
        integrations: data.integrations,
        price: data.price,
        billingCycle: data.billingCycle,
      },
    });

    res.status(201).json({ success: true, message: 'Plan created successfully', plan });
  } catch (error) {
    next(error);
  }
};

// 8. GET /api/v1/admin/audit-logs: Platform Audit Logs
export const getPlatformAuditLogs = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const logs = await prisma.auditLog.findMany({
      take: 100,
      orderBy: { timestamp: 'desc' },
      include: {
        tenant: { select: { name: true, slug: true } },
        user: { select: { fullName: true, email: true } },
      },
    });

    res.status(200).json({ success: true, logs });
  } catch (error) {
    next(error);
  }
};

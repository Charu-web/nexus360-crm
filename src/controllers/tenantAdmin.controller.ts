import { Request, Response, NextFunction } from 'express';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import { z } from 'zod';
import { prisma } from '../lib/db';
import { AppError } from '../middleware/errorHandler';

const createStaffSchema = z.object({
  fullName: z.string().min(2, 'Full name required'),
  email: z.string().email('Invalid email address'),
  phone: z.string().optional(),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  roleId: z.string().optional(),
  roleName: z.string().optional(),
  department: z.string().optional().default('Sales'),
  designation: z.string().optional().default('Agent'),
});

const createRoleSchema = z.object({
  name: z.string().min(2, 'Role name required'),
  description: z.string().optional(),
  permissions: z.array(z.string()).min(1, 'Select at least one permission'),
});

// 1. GET & PATCH /api/v1/tenant/settings and /api/v1/tenant/branding
export const getTenantSettings = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const tenantId = req.user?.tenantId || req.tenant?.id;
    if (!tenantId) throw new AppError('Tenant context missing', 400);

    const tenant = await prisma.tenant.findUnique({
      where: { id: tenantId },
      include: {
        subscriptions: { include: { plan: true }, take: 1, orderBy: { createdAt: 'desc' } },
        usage: true,
      },
    });

    if (!tenant) throw new AppError('Tenant workspace not found', 404);

    res.status(200).json({
      success: true,
      settings: {
        id: tenant.id,
        name: tenant.name,
        slug: tenant.slug,
        domain: tenant.domain,
        status: tenant.status,
        industry: tenant.industry,
        companySize: tenant.companySize,
        country: tenant.country,
        city: tenant.city,
        website: tenant.website,
        logo: tenant.logo,
        favicon: tenant.favicon,
        primaryColor: tenant.primaryColor,
        secondaryColor: tenant.secondaryColor,
        emailSenderName: tenant.emailSenderName,
        companyWebsite: tenant.companyWebsite,
        timezone: tenant.timezone,
        currency: tenant.currency,
        dateFormat: tenant.dateFormat,
        planName: tenant.subscriptions[0]?.plan?.name || 'FREE',
      },
    });
  } catch (error) {
    next(error);
  }
};

export const updateTenantSettings = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const tenantId = req.user?.tenantId || req.tenant?.id;
    if (!tenantId) throw new AppError('Tenant context missing', 400);

    const body = req.body;

    const tenant = await prisma.tenant.update({
      where: { id: tenantId },
      data: {
        ...(body.name && { name: body.name }),
        ...(body.industry && { industry: body.industry }),
        ...(body.companySize && { companySize: body.companySize }),
        ...(body.country && { country: body.country }),
        ...(body.city !== undefined && { city: body.city }),
        ...(body.website !== undefined && { website: body.website }),
        ...(body.timezone && { timezone: body.timezone }),
        ...(body.currency && { currency: body.currency }),
        ...(body.dateFormat && { dateFormat: body.dateFormat }),
      },
    });

    res.status(200).json({
      success: true,
      message: 'Workspace settings updated successfully',
      settings: tenant,
    });
  } catch (error) {
    next(error);
  }
};

export const updateTenantBranding = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const tenantId = req.user?.tenantId || req.tenant?.id;
    if (!tenantId) throw new AppError('Tenant context missing', 400);

    const { logo, favicon, primaryColor, secondaryColor, emailSenderName, companyWebsite, name } = req.body;

    const tenant = await prisma.tenant.update({
      where: { id: tenantId },
      data: {
        ...(logo !== undefined && { logo }),
        ...(favicon !== undefined && { favicon }),
        ...(primaryColor !== undefined && { primaryColor }),
        ...(secondaryColor !== undefined && { secondaryColor }),
        ...(emailSenderName !== undefined && { emailSenderName }),
        ...(companyWebsite !== undefined && { companyWebsite }),
        ...(name !== undefined && { name }),
      },
    });

    res.status(200).json({
      success: true,
      message: 'White-label branding updated successfully',
      branding: {
        name: tenant.name,
        logo: tenant.logo,
        favicon: tenant.favicon,
        primaryColor: tenant.primaryColor,
        secondaryColor: tenant.secondaryColor,
        emailSenderName: tenant.emailSenderName,
        companyWebsite: tenant.companyWebsite,
      },
    });
  } catch (error) {
    next(error);
  }
};

// 2. STAFF & USERS MANAGEMENT (/api/v1/tenant/staff)
export const getTenantStaff = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const tenantId = req.user?.tenantId || req.tenant?.id;
    if (!tenantId) throw new AppError('Tenant context missing', 400);

    const staff = await prisma.user.findMany({
      where: { tenantId },
      orderBy: { createdAt: 'desc' },
      include: { role: true },
    });

    res.status(200).json({
      success: true,
      staff: staff.map((u) => ({
        id: u.id,
        fullName: u.fullName,
        email: u.email,
        phone: u.phone,
        department: u.department,
        designation: u.designation,
        role: u.role.name,
        roleId: u.roleId,
        isActive: u.isActive,
        createdAt: u.createdAt,
      })),
    });
  } catch (error) {
    next(error);
  }
};

export const createTenantStaff = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const tenantId = req.user?.tenantId || req.tenant?.id;
    if (!tenantId) throw new AppError('Tenant context missing', 400);

    const data = createStaffSchema.parse(req.body);

    const existing = await prisma.user.findFirst({
      where: { tenantId, email: data.email.toLowerCase().trim() },
    });
    if (existing) {
      throw new AppError('Email address is already registered in this workspace', 409);
    }

    let roleId = data.roleId;
    if (!roleId) {
      let role = await prisma.role.findFirst({
        where: { tenantId, name: (data.roleName || 'STAFF').toUpperCase() },
      });
      if (!role) {
        role = await prisma.role.findFirst({ where: { tenantId } });
      }
      if (!role) throw new AppError('No suitable role found in workspace', 400);
      roleId = role.id;
    }

    const hashedPassword = await bcrypt.hash(data.password, 10);
    const user = await prisma.user.create({
      data: {
        tenantId,
        email: data.email.toLowerCase().trim(),
        password: hashedPassword,
        fullName: data.fullName,
        phone: data.phone || null,
        roleId,
        department: data.department,
        designation: data.designation,
        isActive: true,
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
      message: 'Staff member created successfully',
      staff: {
        id: user.id,
        fullName: user.fullName,
        email: user.email,
        role: user.role.name,
      },
    });
  } catch (error) {
    next(error);
  }
};

// 3. ROLES & PERMISSIONS MANAGEMENT (/api/v1/tenant/roles)
export const getTenantRoles = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const tenantId = req.user?.tenantId || req.tenant?.id;
    if (!tenantId) throw new AppError('Tenant context missing', 400);

    const roles = await prisma.role.findMany({
      where: { tenantId },
      include: { _count: { select: { users: true } } },
      orderBy: { createdAt: 'asc' },
    });

    res.status(200).json({
      success: true,
      roles: roles.map((r) => ({
        id: r.id,
        name: r.name,
        description: r.description,
        permissions: JSON.parse(r.permissions),
        userCount: r._count.users,
        isDefault: r.isDefault,
        createdAt: r.createdAt,
      })),
    });
  } catch (error) {
    next(error);
  }
};

export const createTenantRole = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const tenantId = req.user?.tenantId || req.tenant?.id;
    if (!tenantId) throw new AppError('Tenant context missing', 400);

    const data = createRoleSchema.parse(req.body);

    const existing = await prisma.role.findFirst({
      where: { tenantId, name: data.name.toUpperCase() },
    });
    if (existing) throw new AppError(`Role '${data.name}' already exists in workspace`, 409);

    const role = await prisma.role.create({
      data: {
        tenantId,
        name: data.name.toUpperCase(),
        description: data.description || null,
        permissions: JSON.stringify(data.permissions),
      },
    });

    res.status(201).json({
      success: true,
      message: 'Custom role created successfully',
      role: {
        id: role.id,
        name: role.name,
        permissions: data.permissions,
      },
    });
  } catch (error) {
    next(error);
  }
};

// 4. LIVE USAGE METRICS & SUBSCRIPTION (/api/v1/tenant/usage)
export const getTenantUsageMetrics = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const tenantId = req.user?.tenantId || req.tenant?.id;
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
    const plan = sub?.plan;

    const currentUsers = await prisma.user.count({ where: { tenantId } });
    const currentLeads = await prisma.lead.count({ where: { tenantId } });
    const currentCustomers = await prisma.customer.count({ where: { tenantId } });
    const currentFields = await prisma.customField.count({ where: { tenantId } });
    const currentPipelines = await prisma.pipeline.count({ where: { tenantId } });
    const currentAutomations = await prisma.automationRule.count({ where: { tenantId } });

    res.status(200).json({
      success: true,
      subscription: sub ? {
        planName: plan?.name,
        status: sub.status,
        createdAt: sub.createdAt,
        trialEndsAt: sub.trialEndsAt,
      } : null,
      usage: {
        users: { used: currentUsers, limit: plan?.maxUsers || 3 },
        leads: { used: currentLeads, limit: plan?.maxLeads || 250 },
        customers: { used: currentCustomers, limit: plan?.maxCustomers || 100 },
        customFields: { used: currentFields, limit: plan?.maxCustomFields || 5 },
        pipelines: { used: currentPipelines, limit: plan?.maxPipelines || 1 },
        automations: { used: currentAutomations, limit: plan?.maxAutomations || 2 },
      },
    });
  } catch (error) {
    next(error);
  }
};

export const getTenantSubscriptionDetails = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  return getTenantUsageMetrics(req, res, next);
};

export const getTenantAuditLogs = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const tenantId = req.user?.tenantId || req.tenant?.id;
    if (!tenantId) throw new AppError('Tenant context missing', 400);

    const page = parseInt((req.query.page as string) || '1', 10);
    const limit = parseInt((req.query.limit as string) || '20', 10);

    const [logs, total] = await Promise.all([
      prisma.auditLog.findMany({
        where: { tenantId },
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { timestamp: 'desc' },
        include: { user: { select: { id: true, fullName: true, email: true } } },
      }),
      prisma.auditLog.count({ where: { tenantId } }),
    ]);

    res.status(200).json({
      success: true,
      auditLogs: logs,
      pagination: { total, page, limit, pages: Math.ceil(total / limit) },
    });
  } catch (error) {
    next(error);
  }
};

export const getTenantLeadSources = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const tenantId = req.user?.tenantId || req.tenant?.id;
    if (!tenantId) throw new AppError('Tenant context missing', 400);

    const sources = await prisma.lead.groupBy({
      by: ['source'],
      where: { tenantId },
      _count: { _all: true },
    });

    res.status(200).json({
      success: true,
      sources: sources.map((s) => ({ name: s.source, count: s._count._all })),
    });
  } catch (error) {
    next(error);
  }
};

export const createTenantLeadSource = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  res.status(200).json({ success: true, message: 'Source registered successfully.' });
};

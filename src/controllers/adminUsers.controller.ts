import { Request, Response, NextFunction } from 'express';
import bcrypt from 'bcryptjs';
import { z } from 'zod';
import { prisma } from '../lib/db';
import { AppError } from '../middleware/errorHandler';
import { recordAuditLog } from '../middleware/auditLogger';

const getTenantId = (req: Request): string => {
  const tenantId = req.tenant?.id || req.user?.tenantId;
  if (!tenantId) throw new AppError('Tenant context missing', 400);
  return tenantId;
};

const createUserSchema = z.object({
  fullName: z.string().min(2, 'Full name is required'),
  email: z.string().email('Invalid email format'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  phone: z.string().optional(),
  department: z.string().optional(),
  designation: z.string().optional(),
  roleName: z.string().default('STAFF'),
});

const updateUserSchema = z.object({
  fullName: z.string().min(2).optional(),
  email: z.string().email().optional(),
  phone: z.string().optional(),
  department: z.string().optional(),
  designation: z.string().optional(),
  roleName: z.string().optional(),
  isActive: z.boolean().optional(),
});

const resetPasswordSchema = z.object({
  newPassword: z.string().min(6, 'Password must be at least 6 characters'),
});

export const getUsers = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const tenantId = getTenantId(req);
    const page = parseInt((req.query.page as string) || '1', 10);
    const limit = parseInt((req.query.limit as string) || '10', 10);
    const search = typeof req.query.search === 'string' ? req.query.search.trim() : '';
    const roleFilter = typeof req.query.role === 'string' ? req.query.role : undefined;
    const isActiveFilter = typeof req.query.isActive === 'string' ? req.query.isActive : undefined;

    const skip = (page - 1) * limit;

    const where: any = { tenantId };

    if (search) {
      where.OR = [
        { fullName: { contains: search } },
        { email: { contains: search } },
        { phone: { contains: search } },
      ];
    }

    if (roleFilter) {
      where.role = { name: { equals: roleFilter.toUpperCase() } };
    }

    if (isActiveFilter !== undefined && isActiveFilter !== '') {
      where.isActive = isActiveFilter === 'true' || isActiveFilter === '1';
    }

    const [users, total] = await Promise.all([
      prisma.user.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
          fullName: true,
          email: true,
          phone: true,
          avatar: true,
          isActive: true,
          department: true,
          designation: true,
          createdAt: true,
          updatedAt: true,
          role: {
            select: {
              id: true,
              name: true,
              description: true,
              permissions: true,
            },
          },
          _count: {
            select: {
              assignedLeads: true,
              assignedTasks: true,
            },
          },
        },
      }),
      prisma.user.count({ where }),
    ]);

    const formattedUsers = users.map((u: any) => {
      let permissions: string[] = [];
      try {
        permissions = JSON.parse(u.role.permissions);
      } catch {}
      return {
        ...u,
        role: {
          ...u.role,
          permissions,
        },
      };
    });

    res.status(200).json({
      success: true,
      users: formattedUsers,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    next(error);
  }
};

export const getUserById = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const tenantId = getTenantId(req);
    const id = req.params.id as string;

    const user = await prisma.user.findFirst({
      where: { id, tenantId },
      include: {
        role: true,
        assignedLeads: { take: 10, orderBy: { createdDate: 'desc' } },
        assignedTasks: { take: 10, orderBy: { createdAt: 'desc' } },
        activities: { take: 15, orderBy: { createdAt: 'desc' } },
        auditLogs: { take: 10, orderBy: { timestamp: 'desc' } },
      },
    });

    if (!user) {
      throw new AppError('User not found', 404);
    }

    let permissions: string[] = [];
    try {
      permissions = JSON.parse(user.role.permissions);
    } catch {}

    const { password, ...userWithoutPassword } = user;

    res.status(200).json({
      success: true,
      user: {
        ...userWithoutPassword,
        role: {
          ...user.role,
          permissions,
        },
      },
    });
  } catch (error) {
    next(error);
  }
};

export const createUser = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const tenantId = getTenantId(req);
    const data = createUserSchema.parse(req.body);

    const existingUser = await prisma.user.findFirst({
      where: { tenantId, email: data.email.toLowerCase().trim() },
    });

    if (existingUser) {
      throw new AppError('User with this email already exists in this workspace', 409);
    }

    let role = await prisma.role.findFirst({
      where: { tenantId, name: data.roleName.toUpperCase() },
    });

    if (!role) {
      role = await prisma.role.findFirst({ where: { tenantId, name: 'STAFF' } })
        || await prisma.role.findFirst({ where: { tenantId } });
    }

    if (!role) {
      throw new AppError('No suitable role found for workspace', 400);
    }

    const hashedPassword = await bcrypt.hash(data.password, 10);

    const newUser = await prisma.user.create({
      data: {
        tenantId,
        fullName: data.fullName,
        email: data.email.toLowerCase().trim(),
        password: hashedPassword,
        phone: data.phone || null,
        department: data.department || 'Sales',
        designation: data.designation || 'Agent',
        roleId: role.id,
        isActive: true,
      },
      include: { role: true },
    });

    await prisma.usage.upsert({
      where: { tenantId },
      update: { userCount: { increment: 1 } },
      create: { tenantId, userCount: 1 },
    });

    await recordAuditLog({
      tenantId,
      action: 'CREATE_USER',
      entity: 'User',
      entityId: newUser.id,
      details: { email: newUser.email, fullName: newUser.fullName, role: role.name },
      req,
    });

    let permissions: string[] = [];
    try {
      permissions = JSON.parse(newUser.role.permissions);
    } catch {}

    const { password, ...createdUser } = newUser;

    res.status(201).json({
      success: true,
      message: 'User created successfully',
      user: {
        ...createdUser,
        role: {
          ...newUser.role,
          permissions,
        },
      },
    });
  } catch (error) {
    next(error);
  }
};

export const updateUser = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const tenantId = getTenantId(req);
    const id = req.params.id as string;
    const data = updateUserSchema.parse(req.body);

    const user = await prisma.user.findFirst({ where: { id, tenantId } });
    if (!user) {
      throw new AppError('User not found', 404);
    }

    let roleId = user.roleId;
    if (data.roleName) {
      const role = await prisma.role.findFirst({
        where: { tenantId, name: data.roleName.toUpperCase() },
      });
      if (role) roleId = role.id;
    }

    const updatedUser = await prisma.user.update({
      where: { id },
      data: {
        ...(data.fullName && { fullName: data.fullName }),
        ...(data.email && { email: data.email.toLowerCase().trim() }),
        ...(data.phone !== undefined && { phone: data.phone }),
        ...(data.department && { department: data.department }),
        ...(data.designation && { designation: data.designation }),
        ...(data.isActive !== undefined && { isActive: data.isActive }),
        roleId,
      },
      include: { role: true },
    });

    await recordAuditLog({
      tenantId,
      action: 'UPDATE_USER',
      entity: 'User',
      entityId: updatedUser.id,
      details: data,
      req,
    });

    let permissions: string[] = [];
    try {
      permissions = JSON.parse(updatedUser.role.permissions);
    } catch {}

    const { password, ...result } = updatedUser;

    res.status(200).json({
      success: true,
      message: 'User updated successfully',
      user: {
        ...result,
        role: {
          ...updatedUser.role,
          permissions,
        },
      },
    });
  } catch (error) {
    next(error);
  }
};

export const toggleUserStatus = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const tenantId = getTenantId(req);
    const id = req.params.id as string;
    const { isActive } = req.body;

    if (typeof isActive !== 'boolean') {
      throw new AppError('isActive must be a boolean value', 400);
    }

    const user = await prisma.user.findFirst({ where: { id, tenantId } });
    if (!user) {
      throw new AppError('User not found', 404);
    }

    const updatedUser = await prisma.user.update({
      where: { id },
      data: { isActive },
      select: { id: true, fullName: true, email: true, isActive: true },
    });

    await recordAuditLog({
      tenantId,
      action: 'TOGGLE_USER_STATUS',
      entity: 'User',
      entityId: updatedUser.id,
      details: { email: updatedUser.email, isActive },
      req,
    });

    res.status(200).json({
      success: true,
      message: `User ${isActive ? 'activated' : 'deactivated'} successfully`,
      user: updatedUser,
    });
  } catch (error) {
    next(error);
  }
};

export const resetUserPassword = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const tenantId = getTenantId(req);
    const id = req.params.id as string;
    const { newPassword } = resetPasswordSchema.parse(req.body);

    const user = await prisma.user.findFirst({ where: { id, tenantId } });
    if (!user) {
      throw new AppError('User not found', 404);
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);

    await prisma.user.update({
      where: { id },
      data: { password: hashedPassword },
    });

    await recordAuditLog({
      tenantId,
      action: 'RESET_PASSWORD',
      entity: 'User',
      entityId: user.id,
      details: { email: user.email },
      req,
    });

    res.status(200).json({
      success: true,
      message: 'User password reset successfully',
    });
  } catch (error) {
    next(error);
  }
};

export const deleteUser = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const tenantId = getTenantId(req);
    const id = req.params.id as string;

    const user = await prisma.user.findFirst({ where: { id, tenantId } });
    if (!user) {
      throw new AppError('User not found', 404);
    }

    if (req.user && req.user.id === id) {
      throw new AppError('You cannot delete your own admin account', 400);
    }

    await prisma.user.delete({ where: { id } });

    await recordAuditLog({
      tenantId,
      action: 'DELETE_USER',
      entity: 'User',
      entityId: id,
      details: { email: user.email, fullName: user.fullName },
      req,
    });

    res.status(200).json({
      success: true,
      message: 'User deleted successfully',
    });
  } catch (error) {
    next(error);
  }
};

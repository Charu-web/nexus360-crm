import { Request, Response, NextFunction } from 'express';
import { OrganizationRole } from '@prisma/client';
import { AppError } from './errorHandler';

const roleHierarchy: Record<OrganizationRole, number> = {
  OWNER: 5,
  ADMIN: 4,
  MANAGER: 3,
  EMPLOYEE: 2,
  VIEWER: 1,
};

export const requireRole = (minimumRole: OrganizationRole) => {
  return (req: Request, _res: Response, next: NextFunction): void => {
    const userRole = req.organizationRole;

    if (!userRole) {
      return next(new AppError('No organization role identified.', 403, 'FORBIDDEN'));
    }

    const userLevel = roleHierarchy[userRole] || 0;
    const requiredLevel = roleHierarchy[minimumRole] || 99;

    if (userLevel < requiredLevel) {
      return next(
        new AppError(
          `Insufficient permissions. Requires minimum role of '${minimumRole}', current role is '${userRole}'.`,
          403,
          'INSUFFICIENT_PERMISSIONS'
        )
      );
    }

    next();
  };
};

export const requireOwner = requireRole(OrganizationRole.OWNER);
export const requireAdmin = requireRole(OrganizationRole.ADMIN);
export const requireManager = requireRole(OrganizationRole.MANAGER);
export const requireEmployee = requireRole(OrganizationRole.EMPLOYEE);

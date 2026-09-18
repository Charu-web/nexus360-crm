import { Request, Response, NextFunction } from 'express';
import { AppError } from './errorHandler';

export const requireAdmin = (req: Request, res: Response, next: NextFunction): void => {
  if (!req.user) {
    return next(new AppError('Unauthorized', 401));
  }

  const roleName = req.user.roleName.toUpperCase();
  if (roleName !== 'SUPER_ADMIN' && roleName !== 'PLATFORM_ADMIN' && roleName !== 'TENANT_ADMIN' && roleName !== 'ADMIN') {
    return next(new AppError('Access denied. Admin privileges required.', 403));
  }

  next();
};

export const requireTenantAdmin = (req: Request, res: Response, next: NextFunction): void => {
  if (!req.user) {
    return next(new AppError('Unauthorized', 401));
  }

  const roleName = req.user.roleName.toUpperCase();
  if (roleName !== 'SUPER_ADMIN' && roleName !== 'PLATFORM_ADMIN' && roleName !== 'TENANT_ADMIN') {
    return next(new AppError('Access denied. Tenant Admin privileges required.', 403));
  }

  next();
};

export const requirePlatformOwner = (req: Request, res: Response, next: NextFunction): void => {
  if (!req.user) {
    return next(new AppError('Unauthorized', 401));
  }

  if (!req.user.isPlatformOwner && req.user.roleName.toUpperCase() !== 'SUPER_ADMIN' && req.user.roleName.toUpperCase() !== 'PLATFORM_ADMIN') {
    return next(new AppError('Access denied. Platform Admin privileges required.', 403));
  }

  next();
};

export const requirePermission = (requiredPermission: string) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    if (!req.user) {
      return next(new AppError('Unauthorized', 401));
    }

    const roleName = req.user.roleName.toUpperCase();
    const permissions = req.user.permissions || [];

    // Platform Owners & Tenant Admins have full permission
    if (req.user.isPlatformOwner || roleName === 'SUPER_ADMIN' || roleName === 'PLATFORM_ADMIN' || roleName === 'TENANT_ADMIN' || permissions.includes('*')) {
      return next();
    }

    // Check specific module permission
    if (permissions.includes(requiredPermission)) {
      return next();
    }

    return next(
      new AppError(
        `Access denied. You do not have '${requiredPermission}' permission.`,
        403
      )
    );
  };
};

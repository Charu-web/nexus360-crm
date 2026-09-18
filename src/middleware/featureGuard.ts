import { Request, Response, NextFunction } from 'express';
import { prisma } from '../lib/db';
import { AppError } from './errorHandler';

export const checkFeatureAccess = (moduleKey: string) => {
  return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      if (req.user?.isPlatformOwner) {
        return next();
      }

      const tenantId = req.tenant?.id || req.user?.tenantId;
      if (!tenantId) {
        return next(new AppError('Tenant context missing', 400));
      }

      // Check explicit module override
      const tenantModule = await prisma.tenantModule.findUnique({
        where: { tenantId_moduleKey: { tenantId, moduleKey } },
      });

      if (tenantModule && !tenantModule.enabled) {
        res.status(403).json({
          success: false,
          code: 'MODULE_DISABLED',
          message: `Module '${moduleKey}' is disabled for your CRM workspace. Please enable it in Settings or contact your workspace admin.`,
        });
        return;
      }

      next();
    } catch (error) {
      next(error);
    }
  };
};

export const checkUsageLimit = (resourceType: 'USER' | 'LEAD' | 'CUSTOMER' | 'STORAGE') => {
  return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      if (req.user?.isPlatformOwner) {
        return next();
      }

      const tenantId = req.tenant?.id || req.user?.tenantId;
      if (!tenantId) {
        return next(new AppError('Tenant context missing', 400));
      }

      const activeSub = await prisma.subscription.findFirst({
        where: { tenantId },
        include: { plan: true },
        orderBy: { createdAt: 'desc' },
      });

      if (!activeSub || !activeSub.plan) {
        return next();
      }

      const usage = await prisma.usage.findUnique({ where: { tenantId } });
      const plan = activeSub.plan;

      if (resourceType === 'USER' && usage && usage.userCount >= plan.maxUsers) {
        res.status(403).json({
          success: false,
          code: 'PLAN_LIMIT_REACHED',
          message: `Your current ${plan.name} plan has reached its user limit of ${plan.maxUsers}. Please upgrade your plan.`,
        });
        return;
      }

      if (resourceType === 'LEAD' && usage && usage.leadCount >= plan.maxLeads) {
        res.status(403).json({
          success: false,
          code: 'PLAN_LIMIT_REACHED',
          message: `Your current ${plan.name} plan has reached its lead limit of ${plan.maxLeads}. Please upgrade your plan.`,
        });
        return;
      }

      if (resourceType === 'CUSTOMER' && usage && usage.customerCount >= plan.maxCustomers) {
        res.status(403).json({
          success: false,
          code: 'PLAN_LIMIT_REACHED',
          message: `Your current ${plan.name} plan has reached its customer limit of ${plan.maxCustomers}. Please upgrade your plan.`,
        });
        return;
      }

      next();
    } catch (error) {
      next(error);
    }
  };
};

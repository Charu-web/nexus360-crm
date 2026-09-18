import { Request, Response, NextFunction } from 'express';
import { prisma } from '../lib/db';

export const checkSubscriptionLimit = (resource: 'USER' | 'LEAD' | 'CUSTOMER' | 'STORAGE' | 'CUSTOM_FIELD' | 'PIPELINE' | 'AUTOMATION') => {
  return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      if (req.user?.isPlatformOwner) {
        return next();
      }

      const tenantId = req.tenant?.id || req.user?.tenantId;
      if (!tenantId) {
        res.status(400).json({ success: false, message: 'Tenant context missing' });
        return;
      }

      const subscription = await prisma.subscription.findFirst({
        where: { tenantId },
        include: { plan: true },
        orderBy: { createdAt: 'desc' },
      });

      if (!subscription) {
        res.status(403).json({
          success: false,
          code: 'PLAN_LIMIT_REACHED',
          message: 'No active subscription found for this workspace.',
        });
        return;
      }

      const plan = subscription.plan;

      if (resource === 'USER') {
        const count = await prisma.user.count({ where: { tenantId } });
        if (count >= plan.maxUsers) {
          res.status(403).json({
            success: false,
            code: 'PLAN_LIMIT_REACHED',
            message: `Your current ${plan.name} plan has reached its user limit of ${plan.maxUsers}. Please upgrade your plan.`,
          });
          return;
        }
      } else if (resource === 'LEAD') {
        const count = await prisma.lead.count({ where: { tenantId } });
        if (count >= plan.maxLeads) {
          res.status(403).json({
            success: false,
            code: 'PLAN_LIMIT_REACHED',
            message: `Your current ${plan.name} plan has reached its lead limit of ${plan.maxLeads}. Please upgrade your plan.`,
          });
          return;
        }
      } else if (resource === 'CUSTOMER') {
        const count = await prisma.customer.count({ where: { tenantId } });
        if (count >= plan.maxCustomers) {
          res.status(403).json({
            success: false,
            code: 'PLAN_LIMIT_REACHED',
            message: `Your current ${plan.name} plan has reached its customer limit of ${plan.maxCustomers}. Please upgrade your plan.`,
          });
          return;
        }
      } else if (resource === 'CUSTOM_FIELD') {
        const count = await prisma.customField.count({ where: { tenantId } });
        if (count >= plan.maxCustomFields) {
          res.status(403).json({
            success: false,
            code: 'PLAN_LIMIT_REACHED',
            message: `Your current ${plan.name} plan has reached its custom fields limit of ${plan.maxCustomFields}.`,
          });
          return;
        }
      } else if (resource === 'PIPELINE') {
        const count = await prisma.pipeline.count({ where: { tenantId } });
        if (count >= plan.maxPipelines) {
          res.status(403).json({
            success: false,
            code: 'PLAN_LIMIT_REACHED',
            message: `Your current ${plan.name} plan has reached its pipeline limit of ${plan.maxPipelines}.`,
          });
          return;
        }
      } else if (resource === 'AUTOMATION') {
        const count = await prisma.automationRule.count({ where: { tenantId } });
        if (count >= plan.maxAutomations) {
          res.status(403).json({
            success: false,
            code: 'PLAN_LIMIT_REACHED',
            message: `Your current ${plan.name} plan has reached its automation limit of ${plan.maxAutomations}.`,
          });
          return;
        }
      }

      next();
    } catch (error) {
      next(error);
    }
  };
};

export const checkFeatureEntitlement = (featureKey: 'apiAccess' | 'webhooks' | 'integrations') => {
  return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      if (req.user?.isPlatformOwner) {
        return next();
      }

      const tenantId = req.tenant?.id || req.user?.tenantId;
      if (!tenantId) {
        res.status(400).json({ success: false, message: 'Tenant context missing' });
        return;
      }

      const subscription = await prisma.subscription.findFirst({
        where: { tenantId },
        include: { plan: true },
        orderBy: { createdAt: 'desc' },
      });

      if (!subscription || !subscription.plan[featureKey]) {
        res.status(403).json({
          success: false,
          code: 'PLAN_LIMIT_REACHED',
          message: `Feature '${featureKey}' is not included in your subscription plan. Please upgrade your plan.`,
        });
        return;
      }

      next();
    } catch (error) {
      next(error);
    }
  };
};

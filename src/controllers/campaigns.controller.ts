import { Request, Response, NextFunction } from 'express';
import { prisma } from '../lib/db';
import { AppError } from '../middleware/errorHandler';

export const getCampaigns = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const tenantId = req.tenant?.id || req.user?.tenantId;
    if (!tenantId) throw new AppError('Tenant context missing', 400);

    const campaigns = await prisma.campaign.findMany({
      where: { tenantId },
      orderBy: { createdAt: 'desc' },
    });

    res.status(200).json({ success: true, campaigns });
  } catch (error) {
    next(error);
  }
};

export const createCampaign = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const tenantId = req.tenant?.id || req.user?.tenantId;
    if (!tenantId) throw new AppError('Tenant context missing', 400);

    const { name, type, status, budget, metrics } = req.body;
    if (!name) throw new AppError('Campaign name required', 400);

    const campaign = await prisma.campaign.create({
      data: {
        tenantId,
        name,
        type: type || 'Email',
        status: status || 'Draft',
        budget: Number(budget) || 0,
        metrics: metrics ? JSON.stringify(metrics) : null,
      },
    });

    res.status(201).json({ success: true, message: 'Campaign created', campaign });
  } catch (error) {
    next(error);
  }
};

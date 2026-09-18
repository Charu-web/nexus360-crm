import { Request, Response, NextFunction } from 'express';
import { prisma } from '../lib/db';
import { AppError } from '../middleware/errorHandler';

export const getSalesTargets = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const tenantId = req.tenant?.id || req.user?.tenantId;
    if (!tenantId) throw new AppError('Tenant context missing', 400);

    const targets = await prisma.salesTarget.findMany({
      where: { tenantId },
      include: { user: { select: { id: true, fullName: true, email: true } } },
      orderBy: { createdAt: 'desc' },
    });

    res.status(200).json({ success: true, targets });
  } catch (error) {
    next(error);
  }
};

export const createSalesTarget = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const tenantId = req.tenant?.id || req.user?.tenantId;
    if (!tenantId) throw new AppError('Tenant context missing', 400);

    const { userId, period, targetAmount } = req.body;
    if (!userId || !period) throw new AppError('User and period are required', 400);

    const target = await prisma.salesTarget.create({
      data: {
        tenantId,
        userId,
        period,
        targetAmount: Number(targetAmount) || 0,
        achievedAmount: 0,
      },
    });

    res.status(201).json({ success: true, message: 'Sales target created', target });
  } catch (error) {
    next(error);
  }
};

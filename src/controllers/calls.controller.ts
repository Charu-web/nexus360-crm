import { Request, Response, NextFunction } from 'express';
import { prisma } from '../lib/db';
import { AppError } from '../middleware/errorHandler';

export const getCallLogs = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const tenantId = req.tenant?.id || req.user?.tenantId;
    if (!tenantId) throw new AppError('Tenant context missing', 400);

    const calls = await prisma.callLog.findMany({
      where: { tenantId },
      include: { user: { select: { id: true, fullName: true } } },
      orderBy: { createdAt: 'desc' },
    });

    const metrics = {
      totalCalls: calls.length,
      outbound: calls.filter((c) => c.type === 'Outbound').length,
      totalDurationSeconds: calls.reduce((acc, c) => acc + (c.duration || 0), 0),
    };

    res.status(200).json({ success: true, metrics, calls });
  } catch (error) {
    next(error);
  }
};

export const createCallLog = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const tenantId = req.tenant?.id || req.user?.tenantId;
    if (!tenantId || !req.user) throw new AppError('Tenant or User context missing', 400);

    const { leadId, customerId, duration, type, summary, recordingUrl } = req.body;

    const call = await prisma.callLog.create({
      data: {
        tenantId,
        userId: req.user.id,
        leadId: leadId || null,
        customerId: customerId || null,
        duration: Number(duration) || 0,
        type: type || 'Outbound',
        summary: summary || null,
        recordingUrl: recordingUrl || null,
      },
    });

    res.status(201).json({ success: true, message: 'Call log recorded', call });
  } catch (error) {
    next(error);
  }
};

import { Request, Response, NextFunction } from 'express';
import { prisma } from '../lib/db';
import { AppError } from '../middleware/errorHandler';

export const getServiceRecords = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const tenantId = req.tenant?.id || req.user?.tenantId;
    if (!tenantId) throw new AppError('Tenant context missing', 400);

    const services = await prisma.serviceTicket.findMany({
      where: { tenantId },
      orderBy: { createdAt: 'desc' },
      include: { assignedTo: { select: { id: true, fullName: true } } },
    });

    res.status(200).json({ success: true, services });
  } catch (error) {
    next(error);
  }
};

export const createServiceRecord = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const tenantId = req.tenant?.id || req.user?.tenantId;
    if (!tenantId) throw new AppError('Tenant context missing', 400);

    const { subject, description, priority, customerId, assignedToId } = req.body;

    const count = await prisma.serviceTicket.count({ where: { tenantId } });
    const ticketId = `TICKET-${101 + count}`;

    const service = await prisma.serviceTicket.create({
      data: {
        tenantId,
        ticketId,
        subject,
        description: description || null,
        priority: priority || 'Medium',
        status: 'Open',
        customerId: customerId || null,
        assignedToId: assignedToId || req.user?.id || null,
      },
    });

    res.status(201).json({ success: true, message: 'Support ticket created', service });
  } catch (error) {
    next(error);
  }
};

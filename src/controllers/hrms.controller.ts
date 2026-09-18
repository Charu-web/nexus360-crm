import { Request, Response, NextFunction } from 'express';
import { prisma } from '../lib/db';
import { AppError } from '../middleware/errorHandler';

export const getAttendance = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const tenantId = req.tenant?.id || req.user?.tenantId;
    if (!tenantId) throw new AppError('Tenant context missing', 400);

    const attendances = await prisma.attendance.findMany({
      where: { tenantId },
      include: { user: { select: { id: true, fullName: true, email: true } } },
      orderBy: { date: 'desc' },
    });

    res.status(200).json({ success: true, attendances });
  } catch (error) {
    next(error);
  }
};

export const clockIn = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const tenantId = req.tenant?.id || req.user?.tenantId;
    if (!tenantId || !req.user) throw new AppError('Tenant or User context missing', 400);

    const today = new Date().toISOString().split('T')[0];

    const record = await prisma.attendance.create({
      data: {
        tenantId,
        userId: req.user.id,
        date: today,
        checkIn: new Date(),
        status: 'Present',
      },
    });

    res.status(200).json({ success: true, message: 'Clocked in successfully', attendance: record });
  } catch (error) {
    next(error);
  }
};

export const clockOut = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const tenantId = req.tenant?.id || req.user?.tenantId;
    if (!tenantId || !req.user) throw new AppError('Tenant or User context missing', 400);

    const today = new Date().toISOString().split('T')[0];

    const existing = await prisma.attendance.findFirst({
      where: { tenantId, userId: req.user.id, date: today },
      orderBy: { createdAt: 'desc' },
    });

    if (!existing) throw new AppError('No active clock-in record found for today.', 404);

    const record = await prisma.attendance.update({
      where: { id: existing.id },
      data: { checkOut: new Date() },
    });

    res.status(200).json({ success: true, message: 'Clocked out successfully', attendance: record });
  } catch (error) {
    next(error);
  }
};

export const getLeaveRequests = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const tenantId = req.tenant?.id || req.user?.tenantId;
    if (!tenantId) throw new AppError('Tenant context missing', 400);

    const leaves = await prisma.leaveRequest.findMany({
      where: { tenantId },
      include: { user: { select: { id: true, fullName: true, email: true } } },
      orderBy: { createdAt: 'desc' },
    });

    res.status(200).json({ success: true, leaves });
  } catch (error) {
    next(error);
  }
};

export const createLeaveRequest = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const tenantId = req.tenant?.id || req.user?.tenantId;
    if (!tenantId || !req.user) throw new AppError('Tenant or User context missing', 400);

    const { type, startDate, endDate, reason } = req.body;

    const leave = await prisma.leaveRequest.create({
      data: {
        tenantId,
        userId: req.user.id,
        type: type || 'Casual',
        startDate: new Date(startDate),
        endDate: new Date(endDate),
        reason: reason || null,
        status: 'Pending',
      },
    });

    res.status(201).json({ success: true, message: 'Leave request submitted', leave });
  } catch (error) {
    next(error);
  }
};

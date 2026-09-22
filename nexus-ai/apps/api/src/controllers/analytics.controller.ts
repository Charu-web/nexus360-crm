import { Request, Response, NextFunction } from 'express';
import { AnalyticsService } from '../services/analytics.service';
import { prisma } from '../lib/prisma';
import { redis } from '../lib/redis';
import { config } from '../config';
import { AuditAction } from '@prisma/client';

export const getAnalyticsOverview = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const data = await AnalyticsService.getOverview(req.organizationId!);
    res.status(200).json({ success: true, data });
  } catch (error) {
    next(error);
  }
};

export const listAuditLogs = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const page = Math.max(1, parseInt(req.query.page as string, 10) || 1);
    const limit = Math.min(100, parseInt(req.query.limit as string, 10) || 30);
    const skip = (page - 1) * limit;

    const where: any = { organizationId: req.organizationId! };
    if (req.query.action) where.action = req.query.action as AuditAction;
    if (req.query.userId) where.userId = String(req.query.userId);
    if (req.query.resource) where.resource = String(req.query.resource);

    const [logs, total] = await Promise.all([
      prisma.auditLog.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: { user: { select: { id: true, fullName: true, email: true } } },
      }),
      prisma.auditLog.count({ where }),
    ]);

    res.status(200).json({
      success: true,
      data: logs,
      meta: { page, limit, total, totalPages: Math.ceil(total / limit) },
    });
  } catch (error) {
    next(error);
  }
};

export const listNotifications = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const notifications = await prisma.notification.findMany({
      where: { organizationId: req.organizationId! },
      take: 50,
      orderBy: { createdAt: 'desc' },
    });
    res.status(200).json({ success: true, data: notifications });
  } catch (error) {
    next(error);
  }
};

export const markNotificationRead = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    await prisma.notification.update({
      where: { id: req.params.id as string },
      data: { isRead: true },
    });
    res.status(200).json({ success: true, message: 'Notification marked as read.' });
  } catch (error) {
    next(error);
  }
};

export const getHealth = async (_req: Request, res: Response): Promise<void> => {
  let dbStatus = 'UP';
  let redisStatus = 'UP';
  let aiStatus = 'UNKNOWN';

  try {
    await prisma.$queryRaw`SELECT 1`;
  } catch (e: any) {
    dbStatus = 'DOWN';
  }

  try {
    if (redis.status === 'ready' || redis.status === 'connecting') {
      redisStatus = 'UP';
    } else {
      redisStatus = 'IDLE/STANDALONE';
    }
  } catch (e) {
    redisStatus = 'DOWN';
  }

  try {
    const aiResp = await fetch(`${config.aiServiceUrl}/health`, { signal: AbortSignal.timeout(1500) });
    aiStatus = aiResp.ok ? 'UP' : 'DEGRADED';
  } catch (e) {
    aiStatus = 'STANDBY/STANDALONE';
  }

  const isHealthy = dbStatus === 'UP';

  res.status(isHealthy ? 200 : 503).json({
    status: isHealthy ? 'healthy' : 'degraded',
    environment: config.env,
    timestamp: new Date().toISOString(),
    components: {
      api: 'UP',
      database: dbStatus,
      redis: redisStatus,
      aiService: aiStatus,
    },
  });
};

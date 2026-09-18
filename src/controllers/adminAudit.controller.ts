import { Request, Response, NextFunction } from 'express';
import { prisma } from '../lib/db';

export const getAuditLogs = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const tenantId = req.tenant?.id || req.user?.tenantId;
    const page = parseInt((req.query.page as string) || '1', 10);
    const limit = parseInt((req.query.limit as string) || '15', 10);
    const action = typeof req.query.action === 'string' ? req.query.action : undefined;
    const entity = typeof req.query.entity === 'string' ? req.query.entity : undefined;
    const userId = typeof req.query.userId === 'string' ? req.query.userId : undefined;

    const skip = (page - 1) * limit;

    const where: any = {
      ...(tenantId ? { tenantId } : {}),
      ...(action ? { action } : {}),
      ...(entity ? { entity } : {}),
      ...(userId ? { userId } : {}),
    };

    const [auditLogs, total] = await Promise.all([
      prisma.auditLog.findMany({
        where,
        skip,
        take: limit,
        orderBy: { timestamp: 'desc' },
        include: {
          user: { select: { id: true, fullName: true, email: true } },
        },
      }),
      prisma.auditLog.count({ where }),
    ]);

    const formatted = auditLogs.map((log: any) => {
      let parsedDetails: any = log.details;
      if (log.details && log.details.startsWith('{')) {
        try {
          parsedDetails = JSON.parse(log.details);
        } catch {}
      }
      return {
        ...log,
        details: parsedDetails,
      };
    });

    res.status(200).json({
      success: true,
      auditLogs: formatted,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    next(error);
  }
};

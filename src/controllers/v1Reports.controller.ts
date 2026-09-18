import { Request, Response, NextFunction } from 'express';
import { prisma } from '../lib/db';
import { AppError } from '../middleware/errorHandler';

export const getTenantReports = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const tenantId = req.tenant?.id;
    if (!tenantId) throw new AppError('Tenant context missing', 400);

    const totalLeads = await prisma.lead.count({ where: { tenantId } });
    const convertedLeads = await prisma.lead.count({ where: { tenantId, status: 'Converted' } });
    const totalCustomers = await prisma.customer.count({ where: { tenantId } });

    const conversionRate = totalLeads > 0 ? parseFloat(((convertedLeads / totalLeads) * 100).toFixed(2)) : 0;

    const sourceGroup = await prisma.lead.groupBy({
      by: ['source'],
      where: { tenantId },
      _count: { source: true },
    });

    const statusGroup = await prisma.lead.groupBy({
      by: ['status'],
      where: { tenantId },
      _count: { status: true },
    });

    res.status(200).json({
      success: true,
      summary: {
        totalLeads,
        convertedLeads,
        conversionRate,
        totalCustomers,
      },
      sourceBreakdown: sourceGroup.map((g) => ({ source: g.source, count: g._count.source })),
      statusBreakdown: statusGroup.map((g) => ({ status: g.status, count: g._count.status })),
    });
  } catch (error) {
    next(error);
  }
};

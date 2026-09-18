import { Request, Response, NextFunction } from 'express';
import { prisma } from '../lib/db';
import { AppError } from '../middleware/errorHandler';

export const getAdminReports = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const tenantId = req.tenant?.id || req.user?.tenantId;
    const where: any = tenantId ? { tenantId } : {};

    const [
      leadsByStatus,
      leadsBySource,
      leadsByLoanType,
      customerCount,
      totalLeadValue,
    ] = await Promise.all([
      prisma.lead.groupBy({
        by: ['status'],
        where,
        _count: { _all: true },
        _sum: { amount: true },
      }),
      prisma.lead.groupBy({
        by: ['source'],
        where,
        _count: { _all: true },
        _sum: { amount: true },
      }),
      prisma.lead.groupBy({
        by: ['loanType'],
        where,
        _count: { _all: true },
        _sum: { amount: true },
      }),
      prisma.customer.count({ where }),
      prisma.lead.aggregate({
        where,
        _sum: { amount: true },
        _avg: { amount: true },
        _count: true,
      }),
    ]);

    const totalLeads = totalLeadValue._count || 0;
    const convertedGroup = leadsByStatus.find((g: any) => g.status === 'Converted');
    const convertedCount = convertedGroup ? convertedGroup._count._all : 0;
    const conversionRate = totalLeads > 0 ? ((convertedCount / totalLeads) * 100).toFixed(2) : '0';

    const conversionStats = {
      totalLeads,
      convertedLeads: convertedCount,
      conversionRate: `${conversionRate}%`,
      totalPipelineValue: totalLeadValue._sum.amount || 0,
      averageLeadValue: totalLeadValue._avg.amount ? Math.round(totalLeadValue._avg.amount) : 0,
      statusBreakdown: leadsByStatus.map((g: any) => ({
        status: g.status,
        count: g._count._all,
        totalAmount: g._sum.amount || 0,
      })),
    };

    const sourceBreakdown = leadsBySource.map((g: any) => ({
      source: g.source,
      count: g._count._all,
      percentage: totalLeads > 0 ? ((g._count._all / totalLeads) * 100).toFixed(1) + '%' : '0%',
      totalAmount: g._sum.amount || 0,
    }));

    const loanTypeBreakdown = leadsByLoanType.map((g: any) => ({
      loanType: g.loanType,
      count: g._count._all,
      totalAmount: g._sum.amount || 0,
    }));

    const summaries = {
      daily: { newLeads: Math.ceil(totalLeads / 30), newCustomers: Math.ceil(customerCount / 30) },
      weekly: { newLeads: Math.ceil(totalLeads / 4), newCustomers: Math.ceil(customerCount / 4) },
      monthly: { newLeads: totalLeads, newCustomers: customerCount },
    };

    res.status(200).json({
      success: true,
      reports: {
        conversionStats,
        sourceBreakdown,
        loanTypeBreakdown,
        summaries,
      },
    });
  } catch (error) {
    next(error);
  }
};

import { Request, Response, NextFunction } from 'express';
import { prisma } from '../lib/db';

export const getAdminDashboardMetrics = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const tenantId = req.tenant?.id || req.user?.tenantId;
    const where: any = tenantId ? { tenantId } : {};

    const [
      totalUsers,
      activeUsers,
      totalLeads,
      newLeads,
      convertedLeads,
      totalCustomers,
      totalContacts,
      openDeals,
      wonDeals,
      lostDeals,
      allDeals,
      pendingTasks,
      completedTasks,
      upcomingMeetings,
      openTickets,
      totalProducts,
      totalQuotes,
      recentActivities,
      recentRegistrations,
    ] = await Promise.all([
      prisma.user.count({ where }),
      prisma.user.count({ where: { ...where, isActive: true } }),
      prisma.lead.count({ where }),
      prisma.lead.count({ where: { ...where, status: 'New' } }),
      prisma.lead.count({ where: { ...where, status: 'Converted' } }),
      prisma.customer.count({ where }),
      prisma.contact.count({ where }),
      prisma.deal.count({ where: { ...where, status: 'OPEN' } }),
      prisma.deal.count({ where: { ...where, status: 'WON' } }),
      prisma.deal.count({ where: { ...where, status: 'LOST' } }),
      prisma.deal.findMany({ where: { ...where }, select: { amount: true, status: true } }),
      prisma.task.count({ where: { ...where, status: 'Pending' } }),
      prisma.task.count({ where: { ...where, status: 'Completed' } }),
      prisma.meeting.count({ where: { ...where, status: 'Scheduled' } }),
      prisma.serviceTicket.count({ where: { ...where, status: { in: ['Open', 'In Progress'] } } }),
      prisma.product.count({ where }),
      prisma.quote.count({ where }),
      prisma.activity.findMany({
        where,
        take: 10,
        orderBy: { createdAt: 'desc' },
        include: {
          user: {
            select: { id: true, fullName: true, email: true, avatar: true },
          },
        },
      }),
      prisma.user.findMany({
        where,
        take: 5,
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
          fullName: true,
          email: true,
          phone: true,
          department: true,
          createdAt: true,
          role: { select: { name: true } },
        },
      }),
    ]);

    const pipelineValue = allDeals
      .filter((d) => d.status === 'OPEN')
      .reduce((sum, d) => sum + (d.amount || 0), 0);

    const wonRevenue = allDeals
      .filter((d) => d.status === 'WON')
      .reduce((sum, d) => sum + (d.amount || 0), 0);

    const systemNotifications = [
      {
        id: 'sys-notif-1',
        title: 'System Healthy',
        message: 'All API routes and database engines operating normally.',
        type: 'SUCCESS',
        timestamp: new Date(),
      },
      {
        id: 'sys-notif-2',
        title: 'Pending Tasks',
        message: `There are currently ${pendingTasks} pending tasks requiring team action.`,
        type: pendingTasks > 0 ? 'WARNING' : 'INFO',
        timestamp: new Date(),
      },
    ];

    res.status(200).json({
      success: true,
      metrics: {
        totalUsers,
        activeUsers,
        totalLeads,
        newLeads,
        convertedLeads,
        totalCustomers,
        totalContacts,
        openDeals,
        wonDeals,
        lostDeals,
        pipelineValue,
        wonRevenue,
        pendingTasks,
        completedTasks,
        upcomingMeetings,
        openTickets,
        totalProducts,
        totalQuotes,
      },
      recentActivities,
      recentRegistrations,
      systemNotifications,
    });
  } catch (error) {
    next(error);
  }
};

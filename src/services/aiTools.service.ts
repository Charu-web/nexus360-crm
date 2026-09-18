import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export interface ToolExecutionResult<T = any> {
  toolName: string;
  success: boolean;
  data?: T;
  error?: string;
  recordCount?: number;
}

export class AIToolsService {
  /**
   * Enforces role permission checks on sensitive domains (deals, loans, financials).
   */
  private static checkPermission(user: any, requiredDomain: 'financial' | 'general' | 'admin'): boolean {
    if (!user) return true; // Internal system execution
    const roleName = (user?.role?.name || user?.role || '').toUpperCase();
    if (roleName.includes('ADMIN') || roleName.includes('OWNER') || roleName.includes('MANAGER')) {
      return true;
    }
    if (requiredDomain === 'financial' && (roleName.includes('RESTRICTED') || roleName.includes('GUEST'))) {
      return false;
    }
    return true;
  }

  /**
   * Tool 1: searchLeads
   */
  public static async searchLeads(
    tenantId: string,
    user: any,
    params: {
      query?: string;
      source?: string;
      status?: string;
      scoreCategory?: string;
      idleDays?: number;
      limit?: number;
    } = {}
  ): Promise<ToolExecutionResult> {
    try {
      const where: any = { tenantId };

      if (params.status) where.status = params.status;
      if (params.source) where.source = { contains: params.source };
      if (params.scoreCategory) where.leadScoreCategory = params.scoreCategory;

      if (params.idleDays && params.idleDays > 0) {
        const thresholdDate = new Date(Date.now() - params.idleDays * 24 * 60 * 60 * 1000);
        where.createdDate = { lte: thresholdDate };
        where.status = 'New';
      }

      if (params.query) {
        const q = params.query.trim();
        where.OR = [
          { customerName: { contains: q } },
          { phone: { contains: q } },
          { email: { contains: q } },
          { leadId: { contains: q } }
        ];
      }

      const leads = await prisma.lead.findMany({
        where,
        take: Math.min(params.limit || 20, 50),
        orderBy: { createdDate: 'desc' },
        include: {
          assignedTo: { select: { id: true, fullName: true, department: true } },
          stage: { select: { id: true, name: true } }
        }
      });

      return {
        toolName: 'searchLeads',
        success: true,
        recordCount: leads.length,
        data: leads.map(l => ({
          id: l.id,
          leadId: l.leadId,
          name: l.customerName,
          phone: l.phone,
          source: l.source,
          status: l.status,
          score: l.leadScore,
          category: l.leadScoreCategory,
          amount: l.amount,
          assignedTo: l.assignedTo?.fullName || 'Unassigned',
          createdDate: l.createdDate
        }))
      };
    } catch (err: any) {
      return { toolName: 'searchLeads', success: false, error: err.message };
    }
  }

  /**
   * Tool 2: getLeadDetails
   */
  public static async getLeadDetails(
    tenantId: string,
    user: any,
    leadId: string
  ): Promise<ToolExecutionResult> {
    try {
      if (!leadId) throw new Error('Lead ID is required');

      const lead = await prisma.lead.findFirst({
        where: {
          tenantId,
          OR: [{ id: leadId }, { leadId: leadId }, { customerName: { contains: leadId } }]
        },
        include: {
          assignedTo: { select: { id: true, fullName: true, email: true } },
          stage: true,
          pipeline: true,
          deals: true,
          siteVisits: true,
          loanApplications: true,
          followUps: { orderBy: { scheduledAt: 'desc' }, take: 5 }
        }
      });

      if (!lead) {
        return { toolName: 'getLeadDetails', success: false, error: `Lead not found for identifier: ${leadId}` };
      }

      return {
        toolName: 'getLeadDetails',
        success: true,
        data: lead
      };
    } catch (err: any) {
      return { toolName: 'getLeadDetails', success: false, error: err.message };
    }
  }

  /**
   * Tool 3: getSalesMetrics
   */
  public static async getSalesMetrics(
    tenantId: string,
    user: any
  ): Promise<ToolExecutionResult> {
    try {
      if (!this.checkPermission(user, 'financial')) {
        return { toolName: 'getSalesMetrics', success: false, error: 'Permission denied for financial metrics.' };
      }

      const [totalLeads, deals] = await Promise.all([
        prisma.lead.count({ where: { tenantId } }),
        prisma.deal.findMany({
          where: { tenantId },
          include: { stage: true }
        })
      ]);

      const openDeals = deals.filter(d => d.status === 'OPEN');
      const wonDeals = deals.filter(d => d.status === 'WON');
      const lostDeals = deals.filter(d => d.status === 'LOST');

      const totalPipelineValue = openDeals.reduce((sum, d) => sum + (d.amount || 0), 0);
      const wonValue = wonDeals.reduce((sum, d) => sum + (d.amount || 0), 0);
      const weightedForecast = openDeals.reduce((sum, d) => {
        const prob = (d.stage?.probability || 50) / 100;
        return sum + (d.amount || 0) * prob;
      }, 0);

      const conversionRate = totalLeads > 0 ? Math.round((wonDeals.length / totalLeads) * 100) : 0;

      return {
        toolName: 'getSalesMetrics',
        success: true,
        data: {
          totalLeads,
          openDealsCount: openDeals.length,
          wonDealsCount: wonDeals.length,
          lostDealsCount: lostDeals.length,
          conversionRate: `${conversionRate}%`,
          totalPipelineValue,
          wonValue,
          expectedRevenue: Math.round(weightedForecast)
        }
      };
    } catch (err: any) {
      return { toolName: 'getSalesMetrics', success: false, error: err.message };
    }
  }

  /**
   * Tool 4: getCampaignMetrics
   */
  public static async getCampaignMetrics(
    tenantId: string,
    user: any
  ): Promise<ToolExecutionResult> {
    try {
      const leads = await prisma.lead.findMany({
        where: { tenantId, campaignName: { not: null } },
        select: { campaignName: true, status: true, amount: true }
      });

      const campaignMap: Record<string, { total: number; won: number; revenue: number }> = {};

      leads.forEach(l => {
        const camp = l.campaignName || 'Organic';
        if (!campaignMap[camp]) campaignMap[camp] = { total: 0, won: 0, revenue: 0 };
        campaignMap[camp].total++;
        if (l.status === 'Won' || l.status === 'Converted') {
          campaignMap[camp].won++;
          campaignMap[camp].revenue += l.amount || 0;
        }
      });

      const list = Object.keys(campaignMap).map(k => ({
        campaign: k,
        leadsGenerated: campaignMap[k].total,
        dealsWon: campaignMap[k].won,
        conversionRate: campaignMap[k].total > 0 ? Math.round((campaignMap[k].won / campaignMap[k].total) * 100) : 0,
        revenue: campaignMap[k].revenue
      })).sort((a, b) => b.conversionRate - a.conversionRate);

      return {
        toolName: 'getCampaignMetrics',
        success: true,
        recordCount: list.length,
        data: list
      };
    } catch (err: any) {
      return { toolName: 'getCampaignMetrics', success: false, error: err.message };
    }
  }

  /**
   * Tool 5: getDealPipeline
   */
  public static async getDealPipeline(
    tenantId: string,
    user: any
  ): Promise<ToolExecutionResult> {
    try {
      if (!this.checkPermission(user, 'financial')) {
        return { toolName: 'getDealPipeline', success: false, error: 'Permission denied for deal pipeline.' };
      }

      const deals = await prisma.deal.findMany({
        where: { tenantId },
        include: { stage: true, assignedTo: { select: { fullName: true } }, customer: { select: { name: true } } },
        orderBy: { amount: 'desc' }
      });

      const now = new Date();
      const enriched = deals.map(d => ({
        id: d.id,
        dealId: d.dealId,
        title: d.title,
        amount: d.amount,
        stage: d.stage?.name || 'In Progress',
        status: d.status,
        probability: `${d.stage?.probability || 50}%`,
        isOverdue: Boolean(d.status === 'OPEN' && d.expectedCloseDate && new Date(d.expectedCloseDate) < now),
        assignedTo: d.assignedTo?.fullName || 'Unassigned',
        customer: d.customer?.name || 'N/A'
      }));

      return {
        toolName: 'getDealPipeline',
        success: true,
        recordCount: enriched.length,
        data: {
          deals: enriched,
          atRiskDeals: enriched.filter(d => d.isOverdue)
        }
      };
    } catch (err: any) {
      return { toolName: 'getDealPipeline', success: false, error: err.message };
    }
  }

  /**
   * Tool 6: getLoanApplications
   */
  public static async getLoanApplications(
    tenantId: string,
    user: any,
    params: { status?: string; minAmount?: number } = {}
  ): Promise<ToolExecutionResult> {
    try {
      if (!this.checkPermission(user, 'financial')) {
        return { toolName: 'getLoanApplications', success: false, error: 'Permission denied for loan applications.' };
      }

      const where: any = { tenantId };
      if (params.status) {
        where.status = params.status;
      } else {
        where.status = { in: ['Submitted', 'Under Review', 'Pending', 'In Progress'] };
      }

      if (params.minAmount) {
        where.requestedAmount = { gte: params.minAmount };
      }

      const loans = await prisma.loanApplication.findMany({
        where,
        orderBy: { requestedAmount: 'desc' },
        include: { documents: true, assignedTo: { select: { fullName: true } } }
      });

      return {
        toolName: 'getLoanApplications',
        success: true,
        recordCount: loans.length,
        data: loans.map(l => ({
          applicationId: l.applicationId,
          applicantName: l.applicantName,
          phone: l.phone,
          loanType: l.loanType,
          requestedAmount: l.requestedAmount,
          sanctionedAmount: l.sanctionedAmount,
          emiAmount: l.emiAmount,
          status: l.status,
          bankPartner: l.bankPartner || 'HDFC Bank',
          assignedTo: l.assignedTo?.fullName || 'Unassigned',
          documentsCount: l.documents.length
        }))
      };
    } catch (err: any) {
      return { toolName: 'getLoanApplications', success: false, error: err.message };
    }
  }

  /**
   * Tool 7: getPropertyAvailability
   */
  public static async getPropertyAvailability(
    tenantId: string,
    user: any,
    params: { projectId?: string; status?: string } = {}
  ): Promise<ToolExecutionResult> {
    try {
      const where: any = { tenantId };
      if (params.projectId) where.projectId = params.projectId;
      if (params.status) where.status = params.status;

      const units = await prisma.propertyUnit.findMany({
        where,
        include: { project: { select: { name: true, location: true } } },
        orderBy: { basePrice: 'asc' }
      });

      const totalUnits = units.length;
      const availableUnits = units.filter(u => u.status === 'Available');
      const bookedUnits = units.filter(u => u.status === 'Booked');

      return {
        toolName: 'getPropertyAvailability',
        success: true,
        recordCount: totalUnits,
        data: {
          totalUnits,
          availableCount: availableUnits.length,
          bookedCount: bookedUnits.length,
          units: units.map(u => ({
            id: u.id,
            unitNumber: u.unitNumber,
            block: u.block,
            project: u.project?.name,
            location: u.project?.location,
            sizeSqFt: u.sizeSqFt,
            basePrice: u.basePrice,
            status: u.status
          }))
        }
      };
    } catch (err: any) {
      return { toolName: 'getPropertyAvailability', success: false, error: err.message };
    }
  }

  /**
   * Tool 8: getFollowUps
   */
  public static async getFollowUps(
    tenantId: string,
    user: any,
    params: { overdueOnly?: boolean } = {}
  ): Promise<ToolExecutionResult> {
    try {
      const where: any = { tenantId, status: 'PENDING' };
      const now = new Date();

      if (params.overdueOnly) {
        where.scheduledAt = { lte: now };
      }

      const followUps = await prisma.followUp.findMany({
        where,
        orderBy: { scheduledAt: 'asc' },
        include: {
          lead: { select: { customerName: true, phone: true } }
        },
        take: 30
      });

      return {
        toolName: 'getFollowUps',
        success: true,
        recordCount: followUps.length,
        data: followUps.map(f => ({
          id: f.id,
          title: f.title,
          scheduledAt: f.scheduledAt,
          type: 'CALL',
          notes: f.notes,
          contactName: f.lead?.customerName || 'Contact',
          phone: f.lead?.phone || 'N/A',
          status: f.status,
          isOverdue: f.scheduledAt < now
        }))
      };
    } catch (err: any) {
      return { toolName: 'getFollowUps', success: false, error: err.message };
    }
  }

  /**
   * Tool 9: getTeamPerformance
   */
  public static async getTeamPerformance(
    tenantId: string,
    user: any
  ): Promise<ToolExecutionResult> {
    try {
      const users = await prisma.user.findMany({
        where: { tenantId, isActive: true },
        include: {
          assignedLeads: true,
          assignedDeals: { where: { status: 'WON' } },
          assignedTasks: { where: { status: 'Completed' } }
        }
      });

      const leaderboards = users.map(u => {
        const totalLeads = u.assignedLeads.length;
        const dealsWon = u.assignedDeals.length;
        const wonVolume = u.assignedDeals.reduce((s, d) => s + (d.amount || 0), 0);
        const rate = totalLeads > 0 ? Math.round((dealsWon / totalLeads) * 100) : 0;
        return {
          id: u.id,
          name: u.fullName,
          email: u.email,
          department: u.department || 'Sales',
          assignedLeads: totalLeads,
          dealsWon,
          wonVolume,
          tasksCompleted: u.assignedTasks.length,
          conversionRate: `${rate}%`
        };
      }).sort((a, b) => parseInt(b.conversionRate) - parseInt(a.conversionRate));

      return {
        toolName: 'getTeamPerformance',
        success: true,
        recordCount: leaderboards.length,
        data: leaderboards
      };
    } catch (err: any) {
      return { toolName: 'getTeamPerformance', success: false, error: err.message };
    }
  }
}

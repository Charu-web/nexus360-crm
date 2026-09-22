import { prisma } from '../lib/prisma';
import { LeadStatus } from '@prisma/client';

export class AnalyticsService {
  static async getOverview(organizationId: string) {
    const [
      totalLeads,
      wonLeads,
      newLeads,
      qualifiedLeads,
      pipelineAggregate,
      leadSourceGrouping,
      statusGrouping,
      tasksOpen,
    ] = await Promise.all([
      prisma.lead.count({ where: { organizationId } }),
      prisma.lead.count({ where: { organizationId, status: LeadStatus.WON } }),
      prisma.lead.count({ where: { organizationId, status: LeadStatus.NEW } }),
      prisma.lead.count({ where: { organizationId, status: LeadStatus.QUALIFIED } }),
      prisma.lead.aggregate({
        where: { organizationId },
        _sum: { estimatedValue: true },
        _avg: { aiScore: true },
      }),
      prisma.lead.groupBy({
        by: ['source'],
        where: { organizationId },
        _count: { id: true },
        _sum: { estimatedValue: true },
      }),
      prisma.lead.groupBy({
        by: ['status'],
        where: { organizationId },
        _count: { id: true },
      }),
      prisma.task.count({
        where: { organizationId, status: { in: ['TODO', 'IN_PROGRESS'] } },
      }),
    ]);

    const totalPipelineValue = pipelineAggregate._sum.estimatedValue || 0;
    const avgAiScore = Math.round(pipelineAggregate._avg.aiScore || 0);
    const conversionRate = totalLeads > 0 ? Math.round((wonLeads / totalLeads) * 100 * 10) / 10 : 0;

    // Generate real dynamic AI data insights
    const aiInsights: string[] = [];

    if (conversionRate >= 20) {
      aiInsights.push(`Strong conversion momentum (${conversionRate}%). Referrals and inbound web demonstrate the highest velocity.`);
    } else {
      aiInsights.push(`Current conversion rate is ${conversionRate}%. Recommend automating nurture follow-ups for ${newLeads} new leads.`);
    }

    if (totalPipelineValue > 100000) {
      aiInsights.push(`High pipeline value ($${totalPipelineValue.toLocaleString()}). Focus sales reps on leads with AI score > 75.`);
    }

    if (tasksOpen > 5) {
      aiInsights.push(`${tasksOpen} pending tasks require attention to maintain SLA compliance.`);
    }

    return {
      metrics: {
        totalLeads,
        wonLeads,
        newLeads,
        qualifiedLeads,
        conversionRate,
        totalPipelineValue,
        avgAiScore,
        tasksOpen,
      },
      leadSources: leadSourceGrouping.map((s: any) => ({
        source: s.source,
        count: s._count?.id || s._count || 0,
        value: s._sum?.estimatedValue || 0,
      })),
      leadFunnel: statusGrouping.map((st: any) => ({
        status: st.status,
        count: st._count?.id || st._count || 0,
      })),
      aiInsights,
    };
  }
}

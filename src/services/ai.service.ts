// src/services/ai.service.ts
import { PrismaClient } from '@prisma/client';
import { LLMFactory } from './llm/llm.factory';
import { AIToolsService } from './aiTools.service';

const prisma = new PrismaClient();

export interface LeadScoreResult {
  score: number;
  category: 'HOT' | 'WARM' | 'COLD';
  reasons: string[];
}

export interface AIRecommendationResult {
  recommendation: string;
  reason: string;
  confidence: number; // 0 - 100
  suggestedAction: 'CALL_NOW' | 'SCHEDULE_SITE_VISIT' | 'SEND_WHATSAPP' | 'REVIEW_LOAN_DOCS' | 'OFFER_DISCOUNT' | 'FOLLOW_UP';
}

export class AIService {
  /**
   * AI Lead Scoring Engine
   * Calculates 0-100 score with multi-factor heuristic and behavioral analysis.
   */
  public static calculateLeadScore(lead: any, activities: any[] = [], deals: any[] = []): LeadScoreResult {
    let score = 25; // Base starting score
    const reasons: string[] = [];

    // 1. Contact Information Completeness (up to +25)
    if (lead.phone && lead.phone.length >= 10) {
      score += 10;
      reasons.push('Verified contact phone number present (+10)');
    }
    if (lead.email && lead.email.includes('@')) {
      score += 8;
      reasons.push('Valid business/personal email provided (+8)');
    }
    if (lead.city && lead.city.trim().length > 0) {
      score += 4;
      reasons.push(`Target location specified: ${lead.city} (+4)`);
    }
    if (lead.customerName && lead.customerName.trim().includes(' ')) {
      score += 3;
      reasons.push('Full name on record (+3)');
    }

    // 2. High-intent Acquisition Channels (up to +20)
    const src = (lead.source || '').toLowerCase();
    if (src.includes('referral') || src.includes('walk-in')) {
      score += 20;
      reasons.push(`High-intent source: ${lead.source} (+20)`);
    } else if (src.includes('website') || src.includes('google')) {
      score += 15;
      reasons.push(`Inbound inquiry from ${lead.source} (+15)`);
    } else if (src.includes('facebook') || src.includes('instagram') || src.includes('social') || src.includes('meta')) {
      score += 12;
      reasons.push(`Social ad inquiry via ${lead.source} (+12)`);
    } else if (src.includes('loan') || src.includes('property')) {
      score += 18;
      reasons.push(`Direct vertical intent enquiry (${lead.source}) (+18)`);
    }

    // 3. Financial Scale / High-Value Deal Potential (up to +20)
    const amount = Number(lead.amount) || 0;
    if (amount >= 5000000) {
      score += 20;
      reasons.push(`High-value financial scope (₹${amount.toLocaleString()}) (+20)`);
    } else if (amount >= 1000000) {
      score += 15;
      reasons.push(`Significant commercial value (₹${amount.toLocaleString()}) (+15)`);
    } else if (amount > 0) {
      score += 10;
      reasons.push(`Budget defined: ₹${amount.toLocaleString()} (+10)`);
    }

    // 4. Activity & Engagement Depth (up to +20)
    const activityCount = (activities || []).length;
    if (activityCount >= 5) {
      score += 20;
      reasons.push(`High engagement: ${activityCount} interactions logged (+20)`);
    } else if (activityCount >= 2) {
      score += 12;
      reasons.push(`Active discussion: ${activityCount} interactions logged (+12)`);
    } else if (activityCount === 1) {
      score += 6;
      reasons.push('Initial interaction recorded (+6)');
    } else {
      score -= 5;
      reasons.push('Zero follow-up activities recorded yet (-5)');
    }

    // 5. Current Pipeline Stage / Status (up to +15)
    const status = (lead.status || '').toLowerCase();
    if (status.includes('qualified') || status.includes('interested')) {
      score += 15;
      reasons.push(`Favorable qualification stage: ${lead.status} (+15)`);
    } else if (status.includes('contacted') || status.includes('in progress')) {
      score += 8;
      reasons.push(`In discussion: ${lead.status} (+8)`);
    } else if (status.includes('lost') || status.includes('rejected')) {
      score = Math.min(score, 20);
      reasons.push(`Deal marked ${lead.status} (score capped at 20)`);
    }

    // 6. Connected Active Deals Bonus
    if (deals && deals.length > 0) {
      score += 10;
      reasons.push(`Direct active deal associated (${deals.length} deals) (+10)`);
    }

    // Clamp score between 0 and 100
    const finalScore = Math.max(5, Math.min(99, Math.round(score)));

    let category: 'HOT' | 'WARM' | 'COLD' = 'WARM';
    if (finalScore >= 75) {
      category = 'HOT';
    } else if (finalScore < 45) {
      category = 'COLD';
    }

    return {
      score: finalScore,
      category,
      reasons
    };
  }

  /**
   * AI Lead Summary Generator
   * Generates a concise, structured executive briefing for sales reps.
   */
  public static generateLeadSummary(
    lead: any,
    activities: any[] = [],
    notes: any[] = [],
    deals: any[] = [],
    siteVisits: any[] = [],
    loans: any[] = []
  ): string {
    const name = lead.customerName || 'Lead';
    const amount = Number(lead.amount) || 0;
    const cur = '₹';
    const source = lead.source || 'Website';
    const status = lead.status || 'New';
    const industry = lead.industry || 'General';

    let summary = `**Executive Summary for ${name}**:\n`;
    summary += `• **Origin & Intent**: Originated via ${source} under ${industry} vertical with budget of ${cur}${amount.toLocaleString()}.\n`;
    summary += `• **Current Stage**: Currently in "${status}" stage with ${lead.priority || 'Medium'} priority.\n`;

    if (loans.length > 0) {
      const loan = loans[0];
      summary += `• **Loan Application**: ${loan.loanType} of ${cur}${(loan.requestedAmount || 0).toLocaleString()} with ${loan.bankPartner} (Status: ${loan.status}).\n`;
    }

    if (siteVisits.length > 0) {
      const visit = siteVisits[0];
      summary += `• **Site Visit**: Scheduled on ${new Date(visit.visitDate).toLocaleDateString()} (Status: ${visit.status}, Outcome: ${visit.outcome || 'Pending'}).\n`;
    }

    if (deals.length > 0) {
      const deal = deals[0];
      summary += `• **Active Deal**: "${deal.title}" valued at ${cur}${(deal.amount || 0).toLocaleString()} in pipeline stage "${deal.stage?.name || 'In Progress'}".\n`;
    }

    if (activities.length > 0) {
      summary += `• **Recent Activity**: ${activities.length} total touchpoints logged. Last: "${activities[0].title || 'Call logged'}".\n`;
    } else {
      summary += `• **Attention Required**: No active customer touchpoints recorded. Immediate initial outreach recommended.\n`;
    }

    if (notes.length > 0) {
      summary += `• **Key Note**: "${notes[0].content.slice(0, 120)}..."\n`;
    }

    summary += `• **Recommendation**: Prioritize follow-up to move from "${status}" to next pipeline milestone.`;

    return summary;
  }

  /**
   * AI Follow-up Message Generator
   * Generates personalized WhatsApp, Email, or SMS copy based on customer lifecycle.
   */
  public static generateFollowUp(
    lead: any,
    channel: 'whatsapp' | 'email' | 'sms',
    agentName: string = 'Sales Team'
  ): { subject?: string; message: string; preview: string } {
    const name = lead.customerName || 'Client';
    const industry = (lead.industry || '').toUpperCase();
    const source = lead.source || 'our portal';

    if (channel === 'whatsapp') {
      if (industry === 'LOAN') {
        const msg = `Hi ${name}, this is ${agentName} from Nexus360 Finance. We received your ${lead.loanType || 'Loan'} application. Our banking desk has pre-matched competitive interest rates starting at 8.75% p.a. Could we connect today for a quick 5-minute eligibility review?`;
        return { message: msg, preview: msg };
      } else if (industry === 'REAL_ESTATE') {
        const msg = `Hello ${name}! Thank you for your interest in our premium property developments. We have high-potential units and plot layouts matching your requirements. Would you like to schedule a private site visit this Saturday or Sunday? Best regards, ${agentName}.`;
        return { message: msg, preview: msg };
      } else {
        const msg = `Hi ${name}, thank you for reaching out to us via ${source}. I would love to share how our platform can tailor a solution to your business requirements. What time works best for a brief call today? – ${agentName}`;
        return { message: msg, preview: msg };
      }
    } else if (channel === 'email') {
      const subject = `Next steps regarding your ${lead.industry || 'CRM'} inquiry - Nexus360`;
      const body = `Dear ${name},

Thank you for your recent inquiry regarding our services via ${source}.

We have reviewed your profile and identified key opportunities tailored to your requirements (Ref: ${lead.leadId || 'INQ-NEW'}). 

Our team would be delighted to arrange a brief introductory consultation at your convenience to walk you through our solutions, timelines, and competitive pricing.

Please let us know your availability over the coming days, or feel free to reply directly to this email.

Warm regards,

${agentName}
Nexus360 Enterprise Solutions`;
      return { subject, message: body, preview: body.slice(0, 180) + '...' };
    } else {
      // SMS
      const sms = `Hi ${name}, thank you for contacting Nexus360. Your inquiry (${lead.leadId || 'INQ-NEW'}) has been received. Our team is ready to assist you. Reply CALL to connect immediately.`;
      return { message: sms, preview: sms };
    }
  }

  /**
   * AI Recommended Next Action Engine
   * Generates a context-driven next step with reason, confidence, and action code.
   */
  public static generateLeadRecommendation(
    lead: any,
    activities: any[] = [],
    deals: any[] = [],
    followUps: any[] = []
  ): AIRecommendationResult {
    const amount = Number(lead.amount) || 0;
    const industry = (lead.industry || '').toUpperCase();
    const source = (lead.source || '').toLowerCase();
    const daysSinceCreated = Math.round((Date.now() - new Date(lead.createdDate || Date.now()).getTime()) / (1000 * 60 * 60 * 24));
    const pendingFollowUps = followUps.filter(f => f.status === 'PENDING');
    const isOverdue = pendingFollowUps.some(f => new Date(f.scheduledAt) < new Date());

    // Scenario 1: Overdue follow-up
    if (isOverdue) {
      return {
        recommendation: `Call ${lead.customerName || 'customer'} immediately to address overdue scheduled touchpoint.`,
        reason: 'Customer follow-up was scheduled but is currently past its SLA due date.',
        confidence: 95,
        suggestedAction: 'CALL_NOW'
      };
    }

    // Scenario 2: Real Estate High-Value Lead
    if (industry === 'REAL_ESTATE' && amount >= 5000000) {
      return {
        recommendation: 'Call customer today and offer private weekend site visit. Previous engagement indicates high purchase intent.',
        reason: `High commercial scope (₹${amount.toLocaleString()}) via ${lead.source || 'direct inquiry'} with strong buying potential.`,
        confidence: 92,
        suggestedAction: 'SCHEDULE_SITE_VISIT'
      };
    }

    // Scenario 3: Loan Application Lead
    if (industry === 'LOAN') {
      return {
        recommendation: 'Review loan applicant KYC & income documents with banking partner desk.',
        reason: 'Credit eligibility verification requires immediate bank rate matching.',
        confidence: 89,
        suggestedAction: 'REVIEW_LOAN_DOCS'
      };
    }

    // Scenario 4: High score but idle for >= 3 days
    if (lead.leadScore >= 75 && activities.length <= 1) {
      return {
        recommendation: 'Send personalized WhatsApp overview and schedule an introductory product walkthrough.',
        reason: 'Lead has high conversion score (75+) but minimal active rep interaction.',
        confidence: 86,
        suggestedAction: 'SEND_WHATSAPP'
      };
    }

    // Scenario 5: Stalled lead
    if (daysSinceCreated >= 7 && activities.length === 0) {
      return {
        recommendation: 'Re-engage prospect with promotional seasonal discount offer.',
        reason: 'Lead has been uncontacted for 7+ days; immediate re-activation needed before drop-off.',
        confidence: 78,
        suggestedAction: 'OFFER_DISCOUNT'
      };
    }

    // Default recommendation
    return {
      recommendation: 'Conduct 5-minute qualifying discovery call to establish budget and procurement timeline.',
      reason: 'Standard lifecycle progression from initial inquiry to qualified pipeline stage.',
      confidence: 82,
      suggestedAction: 'FOLLOW_UP'
    };
  }

  /**
   * AI Sales Insights Engine
   * Generates 6 live database-backed analytical sections:
   * 1. HOT OPPORTUNITIES
   * 2. AT-RISK DEALS
   * 3. OVERDUE FOLLOW-UPS
   * 4. HIGH-CONVERTING SOURCES
   * 5. LOW-PERFORMING CAMPAIGNS
   * 6. REVENUE OPPORTUNITIES
   */
  public static async getSalesInsights(tenantId: string) {
    const [leads, deals, followUps] = await Promise.all([
      prisma.lead.findMany({
        where: { tenantId },
        orderBy: { createdDate: 'desc' },
        take: 100,
        include: { assignedTo: true, deals: true, activities: true }
      }),
      prisma.deal.findMany({
        where: { tenantId },
        include: { stage: true, assignedTo: true, customer: true }
      }),
      prisma.followUp.findMany({
        where: { tenantId, status: 'PENDING' },
        include: { lead: true }
      })
    ]);

    const now = new Date();

    // 1. HOT OPPORTUNITIES
    const hotOpportunities = leads
      .filter(l => l.leadScoreCategory === 'HOT' || (l.amount || 0) >= 2500000)
      .slice(0, 6)
      .map(l => ({
        id: l.id,
        leadId: l.leadId,
        name: l.customerName,
        amount: l.amount,
        score: l.leadScore,
        category: l.leadScoreCategory,
        status: l.status,
        source: l.source,
        assignedTo: l.assignedTo?.fullName || 'Unassigned'
      }));

    // 2. AT-RISK DEALS
    const atRiskDeals = deals
      .filter(d => d.status === 'OPEN' && d.expectedCloseDate && new Date(d.expectedCloseDate) < now)
      .slice(0, 6)
      .map(d => ({
        id: d.id,
        dealId: d.dealId,
        title: d.title,
        amount: d.amount,
        stage: d.stage?.name || 'In Progress',
        overdueDate: d.expectedCloseDate,
        assignedTo: d.assignedTo?.fullName || 'Unassigned',
        daysOverdue: Math.round((now.getTime() - new Date(d.expectedCloseDate!).getTime()) / (1000 * 60 * 60 * 24))
      }));

    // 3. OVERDUE FOLLOW-UPS
    const overdueFollowUps = followUps
      .filter(f => f.scheduledAt < now)
      .slice(0, 6)
      .map(f => ({
        id: f.id,
        contactName: f.lead?.customerName || 'Contact',
        phone: f.lead?.phone || 'N/A',
        scheduledAt: f.scheduledAt,
        type: 'CALL',
        notes: f.notes,
        assignedTo: 'Sales Team'
      }));

    // 4. HIGH-CONVERTING SOURCES
    const sourceMap: Record<string, { total: number; won: number }> = {};
    leads.forEach(l => {
      const s = l.source || 'Website';
      if (!sourceMap[s]) sourceMap[s] = { total: 0, won: 0 };
      sourceMap[s].total++;
      if (l.status === 'Won' || l.status === 'Converted') sourceMap[s].won++;
    });
    const highConvertingSources = Object.keys(sourceMap).map(k => ({
      source: k,
      totalLeads: sourceMap[k].total,
      wonDeals: sourceMap[k].won,
      conversionRate: sourceMap[k].total > 0 ? Math.round((sourceMap[k].won / sourceMap[k].total) * 100) : 0
    })).sort((a, b) => b.conversionRate - a.conversionRate).slice(0, 5);

    // 5. LOW-PERFORMING CAMPAIGNS
    const campMap: Record<string, { total: number; won: number }> = {};
    leads.forEach(l => {
      if (l.campaignName) {
        if (!campMap[l.campaignName]) campMap[l.campaignName] = { total: 0, won: 0 };
        campMap[l.campaignName].total++;
        if (l.status === 'Won' || l.status === 'Converted') campMap[l.campaignName].won++;
      }
    });
    const lowPerformingCampaigns = Object.keys(campMap).map(k => ({
      campaign: k,
      leads: campMap[k].total,
      won: campMap[k].won,
      conversionRate: Math.round((campMap[k].won / campMap[k].total) * 100)
    })).filter(c => c.conversionRate < 15).slice(0, 5);

    // 6. REVENUE OPPORTUNITIES
    const openDeals = deals.filter(d => d.status === 'OPEN');
    const totalPipelineValue = openDeals.reduce((sum, d) => sum + (d.amount || 0), 0);
    const weightedForecast = openDeals.reduce((sum, d) => {
      const prob = (d.stage?.probability || 50) / 100;
      return sum + (d.amount || 0) * prob;
    }, 0);
    const revenueOpportunities = openDeals
      .sort((a, b) => (b.amount || 0) - (a.amount || 0))
      .slice(0, 5)
      .map(d => ({
        dealId: d.dealId,
        title: d.title,
        amount: d.amount,
        stage: d.stage?.name || 'In Progress',
        probability: `${d.stage?.probability || 50}%`,
        expectedValue: Math.round((d.amount || 0) * ((d.stage?.probability || 50) / 100))
      }));

    return {
      hotOpportunities,
      highValueLeads: hotOpportunities,
      atRiskDeals,
      overdueFollowUps,
      highConvertingSources,
      lowPerformingCampaigns,
      revenueOpportunities,
      revenueMetrics: {
        totalPipelineValue,
        weightedForecast: Math.round(weightedForecast),
        openDealsCount: openDeals.length
      },
      providerStatus: LLMFactory.getProviderStatus(),
      generatedAt: new Date().toISOString()
    };
  }

  /**
   * AI Natural Language Assistant Engine
   * Interprets user conversational commands using intent detection,
   * invokes authorized CRM query tools, and formats verified database responses.
   * Strictly enforces tenant isolation and user role permissions.
   */
  public static async answerAssistantPrompt(tenantId: string, user: any, query: string) {
    const q = query.toLowerCase().trim();
    const provider = LLMFactory.getProvider();
    const providerStatus = LLMFactory.getProviderStatus();

    // Multi-tenant RBAC Security Check
    const userRole = (user?.role?.name || user?.role || '').toUpperCase();
    const isRestricted = userRole.includes('RESTRICTED') || userRole.includes('GUEST');

    // Security Check: Deny restricted users access to financial & deal pipeline data
    if (isRestricted && (q.includes('revenue') || q.includes('forecast') || q.includes('loan') || q.includes('amount') || q.includes('deal'))) {
      return {
        answer: 'Access Restricted: Your assigned user role does not permit access to financial pipeline and loan records.',
        data: [],
        provider: providerStatus
      };
    }

    // Query Intent 1: Hot Leads (e.g. "Show me all hot leads", "hot leads from Facebook")
    if (q.includes('hot') && q.includes('lead')) {
      const source = q.includes('facebook') ? 'Facebook' : q.includes('instagram') ? 'Instagram' : undefined;
      const res = await AIToolsService.searchLeads(tenantId, user, { scoreCategory: 'HOT', source, limit: 10 });
      const list = res.data || [];
      return {
        answer: `Found ${list.length} HOT ${source ? source + ' ' : ''}leads with high purchase intent (AI Score 75+):`,
        data: list,
        provider: providerStatus
      };
    }

    // Query Intent 2: Uncontacted Leads (e.g. "Which leads have not been contacted for 7 days?", "Facebook leads > 3 days")
    if ((q.includes('not been contacted') || q.includes('no follow-up') || q.includes('uncontacted') || q.includes('haven\'t been contacted')) || (q.includes('facebook') && q.includes('lead'))) {
      const idleDays = q.includes('7') ? 7 : 3;
      const source = q.includes('facebook') ? 'Facebook' : undefined;
      const res = await AIToolsService.searchLeads(tenantId, user, { idleDays, source, limit: 10 });
      const list = res.data || [];
      return {
        answer: `I found ${list.length} ${source ? source + ' ' : ''}leads that have remained in "New" status for over ${idleDays} days with no recent follow-up:`,
        data: list,
        provider: providerStatus
      };
    }

    // Query Intent 3: Highest Revenue / Best Sales Executive / Top Performer
    if (q.includes('revenue') && (q.includes('highest') || q.includes('who') || q.includes('generated')) || q.includes('conversion') || q.includes('best sales') || q.includes('top performer')) {
      const res = await AIToolsService.getTeamPerformance(tenantId, user);
      const list = res.data || [];
      const top = list[0];
      return {
        answer: top
          ? `Top performer: **${top.name}** with a **${top.conversionRate}** win rate (${top.dealsWon} deals won out of ${top.assignedLeads} leads, generating ₹${(top.wonVolume || 0).toLocaleString()}).`
          : 'No team sales conversion records available yet.',
        data: list,
        provider: providerStatus
      };
    }

    // Query Intent 4: Campaign with best conversion rate
    if (q.includes('campaign') && (q.includes('best') || q.includes('conversion') || q.includes('rate') || q.includes('performance'))) {
      const res = await AIToolsService.getCampaignMetrics(tenantId, user);
      const list = res.data || [];
      const top = list[0];
      return {
        answer: top
          ? `Top converting marketing campaign is **"${top.campaign}"** with a **${top.conversionRate}%** conversion rate (${top.dealsWon} won out of ${top.leadsGenerated} leads, generating ₹${(top.revenue || 0).toLocaleString()}).`
          : 'No active marketing campaign conversion records found.',
        data: list,
        provider: providerStatus
      };
    }

    // Query Intent 5: Pending Loan Applications (e.g. "Show me pending loan applications", "Loans above 10 Lakhs")
    if (q.includes('loan') && (q.includes('pending') || q.includes('approval') || q.includes('application') || q.includes('10') || q.includes('lakh'))) {
      const minAmount = (q.includes('10') || q.includes('lakh')) ? 1000000 : 0;
      const res = await AIToolsService.getLoanApplications(tenantId, user, { minAmount });
      const list = res.data || [];
      return {
        answer: `Found ${list.length} loan applications pending approval${minAmount > 0 ? ' above ₹10,00,000' : ''}:`,
        data: list,
        provider: providerStatus
      };
    }

    // Query Intent 6: Property Demand & Availability
    if (q.includes('property') || q.includes('properties') || q.includes('plot') || q.includes('demand') || q.includes('units')) {
      const res = await AIToolsService.getPropertyAvailability(tenantId, user);
      const data = res.data || { totalUnits: 0, availableCount: 0, bookedCount: 0, units: [] };
      return {
        answer: `Real estate inventory breakdown: **${data.availableCount}** units available out of **${data.totalUnits}** total units (${data.bookedCount} booked/sold).`,
        data: data.units.slice(0, 10),
        provider: providerStatus
      };
    }

    // Query Intent 7: Deals at Risk
    if (q.includes('risk') || q.includes('stuck') || q.includes('overdue deal')) {
      const res = await AIToolsService.getDealPipeline(tenantId, user);
      const atRisk = res.data?.atRiskDeals || [];
      return {
        answer: `There are **${atRisk.length}** open deals at risk due to overdue projected closure dates:`,
        data: atRisk,
        provider: providerStatus
      };
    }

    // Query Intent 8: Expected Revenue This Month / Pipeline Forecast
    if (q.includes('revenue') || q.includes('expected') || q.includes('forecast')) {
      const res = await AIToolsService.getSalesMetrics(tenantId, user);
      const metrics = res.data || { totalPipelineValue: 0, expectedRevenue: 0, openDealsCount: 0 };
      return {
        answer: `The expected pipeline revenue is **₹${(metrics.totalPipelineValue || 0).toLocaleString()}** across ${metrics.openDealsCount || 0} open deals. Weighted forecast probability stands at **₹${(metrics.expectedRevenue || 0).toLocaleString()}**.`,
        data: [metrics],
        provider: providerStatus
      };
    }

    // Query Intent 9: Draft WhatsApp / Email / SMS Message for Lead
    if (q.includes('draft') && (q.includes('whatsapp') || q.includes('message') || q.includes('email') || q.includes('lead'))) {
      const match = q.match(/#?([a-z0-9-]+)/i);
      const searchKey = match ? match[1] : '';
      const leadDetailsRes = await AIToolsService.getLeadDetails(tenantId, user, searchKey || '102');

      let lead = leadDetailsRes.data;
      if (!lead) {
        const fallbackLeads = await AIToolsService.searchLeads(tenantId, user, { limit: 1 });
        lead = fallbackLeads.data?.[0];
      }

      if (lead) {
        const channel = q.includes('email') ? 'email' : q.includes('sms') ? 'sms' : 'whatsapp';
        const draft = this.generateFollowUp(lead, channel, user?.fullName || 'Nexus360 Representative');
        return {
          answer: `Drafted personalized ${channel.toUpperCase()} message for **${lead.customerName}** (${lead.leadId}):\n\n"${draft.message}"\n\n*(Editable copy generated — review before confirmation)*`,
          data: [{ leadId: lead.leadId, recipient: lead.customerName, phone: lead.phone, channel, draft: draft.message }],
          provider: providerStatus
        };
      }
    }

    // Default Fallback
    const [totalLeads, totalDeals, totalLoans] = await Promise.all([
      prisma.lead.count({ where: { tenantId } }),
      prisma.deal.count({ where: { tenantId } }),
      prisma.loanApplication.count({ where: { tenantId } })
    ]);

    return {
      answer: `I am your Nexus360 AI Assistant. In this workspace, you have ${totalLeads} leads, ${totalDeals} active deals, and ${totalLoans} loan applications. You can ask me about hot leads, uncontacted leads, conversion rates, loan approvals, properties, or revenue forecasts!`,
      data: [],
      provider: providerStatus
    };
  }
}

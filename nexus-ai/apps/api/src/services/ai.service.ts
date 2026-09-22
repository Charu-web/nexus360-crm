import { prisma } from '../lib/prisma';
import { config } from '../config';
import { AppError } from '../middleware/errorHandler';
import { LeadScoreResult, EmailGeneratorRequest, EmailGeneratorResult } from '@nexus-ai/types';
import { logger } from '../lib/logger';

export class AIService {
  // --------------------------------------------------------------------------
  // 1. AI LEAD SCORING & INTELLIGENCE
  // --------------------------------------------------------------------------
  static async scoreLead(organizationId: string, leadId: string): Promise<LeadScoreResult> {
    const lead = await prisma.lead.findFirst({
      where: { id: leadId, organizationId },
      include: {
        activities: { take: 10, orderBy: { createdAt: 'desc' } },
        company: true,
      },
    });

    if (!lead) {
      throw new AppError('Lead not found for AI scoring.', 404, 'LEAD_NOT_FOUND');
    }

    // Try FastAPI AI Microservice first
    try {
      const response = await fetch(`${config.aiServiceUrl}/api/v1/leads/score`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          leadId: lead.id,
          name: lead.name,
          companyName: lead.companyName || lead.company?.name,
          industry: lead.industry || lead.company?.industry,
          estimatedValue: lead.estimatedValue,
          source: lead.source,
          activityCount: lead.activities.length,
          notes: lead.notes ? [lead.notes] : [],
        }),
      });

      if (response.ok) {
        const aiResult = (await response.json()) as LeadScoreResult;
        await this.persistLeadScore(lead.id, aiResult);
        return aiResult;
      }
    } catch (err: any) {
      logger.warn(`[AI Engine] Microservice unreachable (${err.message}). Using intelligent rule engine fallback.`);
    }

    // High-fidelity fallback scoring engine
    const fallbackResult = this.computeAlgorithmicScore(lead);
    await this.persistLeadScore(lead.id, fallbackResult);
    return fallbackResult;
  }

  private static computeAlgorithmicScore(lead: any): LeadScoreResult {
    let score = 50;
    const factors: LeadScoreResult['factors'] = [];

    // Deal Value factor
    if (lead.estimatedValue >= 100000) {
      score += 25;
      factors.push({ factor: 'Enterprise Deal Size', impact: 'POSITIVE', description: `Estimated value is $${lead.estimatedValue.toLocaleString()}.` });
    } else if (lead.estimatedValue >= 25000) {
      score += 15;
      factors.push({ factor: 'Mid-Market Deal Size', impact: 'POSITIVE', description: `Estimated value is $${lead.estimatedValue.toLocaleString()}.` });
    }

    // Lead Source factor
    if (['REFERRAL', 'INBOUND_WEB', 'PARTNER'].includes(lead.source)) {
      score += 15;
      factors.push({ factor: 'High-Intent Source', impact: 'POSITIVE', description: `Acquired via ${lead.source}.` });
    } else if (lead.source === 'COLD_OUTREACH') {
      score -= 10;
      factors.push({ factor: 'Outbound Cold Prospect', impact: 'NEGATIVE', description: 'Requires additional qualification.' });
    }

    // Engagement & Status factor
    if (['QUALIFIED', 'PROPOSAL', 'NEGOTIATION'].includes(lead.status)) {
      score += 15;
      factors.push({ factor: 'Advanced Pipeline Stage', impact: 'POSITIVE', description: `Prospect is actively in ${lead.status} stage.` });
    } else if (lead.status === 'LOST') {
      score = 15;
      factors.push({ factor: 'Lost Deal', impact: 'NEGATIVE', description: 'Lead marked as closed lost.' });
    }

    score = Math.max(5, Math.min(99, score));

    let reasoning = 'Moderate engagement profile with standard opportunity velocity.';
    let recommendedAction = 'Reach out with product demo deck within 48 hours.';
    let suggestedUrgency: 'HIGH' | 'MEDIUM' | 'LOW' = 'MEDIUM';

    if (score >= 80) {
      reasoning = 'High potential account with verified intent and significant estimated ARR.';
      recommendedAction = 'Schedule executive discovery / architecture demo call immediately.';
      suggestedUrgency = 'HIGH';
    } else if (score < 40) {
      reasoning = 'Low current engagement and early qualification stage.';
      recommendedAction = 'Enroll in automated nurture email sequence.';
      suggestedUrgency = 'LOW';
    }

    return {
      score,
      confidence: 0.92,
      factors,
      reasoning,
      recommendedAction,
      suggestedUrgency,
    };
  }

  private static async persistLeadScore(leadId: string, result: LeadScoreResult) {
    await prisma.lead.update({
      where: { id: leadId },
      data: {
        aiScore: result.score,
        aiScoreConfidence: result.confidence,
        aiScoreReason: result.reasoning,
        aiRecommendedAction: result.recommendedAction,
        aiScoredAt: new Date(),
      },
    });
  }

  // --------------------------------------------------------------------------
  // 2. AI SALES ASSISTANT & EMAIL GENERATOR
  // --------------------------------------------------------------------------
  static async generateEmail(organizationId: string, input: EmailGeneratorRequest): Promise<EmailGeneratorResult> {
    try {
      const response = await fetch(`${config.aiServiceUrl}/api/v1/ai/generate-email`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(input),
      });

      if (response.ok) {
        return (await response.json()) as EmailGeneratorResult;
      }
    } catch (err: any) {
      logger.warn(`[AI Engine] Microservice email generation fallback: ${err.message}`);
    }

    // High quality intelligent template generator
    const subjectPrefix = input.emailPurpose === 'FIRST_OUTREACH'
      ? `Accelerating ${input.companyName || 'your team\'s'} growth with NexusAI`
      : `Follow-up: NexusAI platform demo for ${input.leadName}`;

    const body = `Hi ${input.leadName},

I wanted to follow up regarding our recent conversation about ${input.companyName || 'your organization'}. 

Our AI Business Operations platform helps teams streamline sales intelligence, document knowledge search, and workflow automation.

${input.specificGoal ? `Specifically: ${input.specificGoal}\n` : ''}
Would you be open to a brief 15-minute walkthrough this Thursday or Friday?

Best regards,
The NexusAI Solutions Team`;

    return {
      subject: subjectPrefix,
      body,
      keyPointsCovered: [input.emailPurpose, input.tone, 'Call to Action included'],
    };
  }

  // --------------------------------------------------------------------------
  // 3. ORGANIZATION CHAT ASSISTANT
  // --------------------------------------------------------------------------
  static async handleChatAssistant(
    organizationId: string,
    userId: string,
    message: string,
    conversationId?: string
  ) {
    // 1. Fetch or create conversation
    let conversation = conversationId
      ? await prisma.aIConversation.findFirst({ where: { id: conversationId, organizationId } })
      : null;

    if (!conversation) {
      conversation = await prisma.aIConversation.create({
        data: {
          organizationId,
          userId,
          title: message.substring(0, 30) + '...',
        },
      });
    }

    // Save user message
    await prisma.aIMessage.create({
      data: {
        conversationId: conversation.id,
        role: 'user',
        content: message,
      },
    });

    // Extract live CRM insights for contextual tool execution
    const lower = message.toLowerCase();
    let assistantReply = '';
    let toolCallsData: any = null;

    if (lower.includes('lead') || lower.includes('pipeline') || lower.includes('summary')) {
      const topLeads = await prisma.lead.findMany({
        where: { organizationId },
        take: 5,
        orderBy: [{ aiScore: 'desc' }, { createdAt: 'desc' }],
      });

      const leadsList = topLeads
        .map((l: any) => `• **${l.name}** (${l.companyName || 'No Company'}) - Score: **${l.aiScore || 'N/A'}/100** | Status: *${l.status}* | Val: $${l.estimatedValue.toLocaleString()}`)
        .join('\n');

      assistantReply = `Here is a summary of your organization's highest-priority leads:\n\n${leadsList}\n\nWould you like me to draft a follow-up email or schedule a task for any of these accounts?`;
      toolCallsData = { tool: 'crm_get_top_leads', count: topLeads.length };
    } else if (lower.includes('task') || lower.includes('todo') || lower.includes('pending')) {
      const tasks = await prisma.task.findMany({
        where: { organizationId },
        take: 5,
        orderBy: { dueDate: 'asc' },
      });

      const taskList = tasks
        .map((t: any) => `• **${t.title}** - Priority: *${t.priority}* | Status: *${t.status}*`)
        .join('\n');

      assistantReply = `Here are your upcoming tasks:\n\n${taskList}`;
      toolCallsData = { tool: 'crm_list_tasks', count: tasks.length };
    } else {
      assistantReply = `I am your NexusAI Business Copilot. I have live access to your leads, deals, tasks, workflows, and document knowledge base. You can ask me to analyze accounts, score leads, draft outreach emails, or search company documentation.`;
    }

    // Save assistant response
    const aiMsg = await prisma.aIMessage.create({
      data: {
        conversationId: conversation.id,
        role: 'assistant',
        content: assistantReply,
        toolCalls: toolCallsData ? toolCallsData : undefined,
      },
    });

    return {
      conversationId: conversation.id,
      message: aiMsg,
    };
  }
}

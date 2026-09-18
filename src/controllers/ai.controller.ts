// src/controllers/ai.controller.ts
import { Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { AIService } from '../services/ai.service';
import { LLMFactory } from '../services/llm/llm.factory';
import { TenantRequest } from '../middleware/tenant';

const prisma = new PrismaClient();

/**
 * POST /api/v1/ai/lead-score/:leadId
 * Recalculates and persists AI lead score, category, and reasons.
 */
export async function calculateLeadScore(req: TenantRequest, res: Response) {
  try {
    const tenantId = req.tenantId!;
    const leadId = String(req.params.leadId);

    const lead = await prisma.lead.findFirst({
      where: { id: leadId, tenantId },
      include: {
        activities: true,
        deals: true
      }
    });

    if (!lead) {
      return res.status(404).json({ success: false, message: 'Lead not found' });
    }

    const leadAny = lead as any;
    const result = AIService.calculateLeadScore(lead, leadAny.activities || [], leadAny.deals || []);

    const updatedLead = await prisma.lead.update({
      where: { id: lead.id },
      data: {
        leadScore: result.score,
        leadScoreCategory: result.category,
        leadScoreReason: JSON.stringify(result.reasons)
      }
    });

    return res.json({
      success: true,
      leadId: updatedLead.id,
      score: result.score,
      category: result.category,
      reasons: result.reasons
    });
  } catch (err: any) {
    return res.status(500).json({ success: false, message: err.message });
  }
}

/**
 * POST /api/v1/ai/lead-summary/:leadId
 * Generates and stores comprehensive AI briefing for lead.
 */
export async function generateLeadSummary(req: TenantRequest, res: Response) {
  try {
    const tenantId = req.tenantId!;
    const leadId = String(req.params.leadId);

    const lead = await prisma.lead.findFirst({
      where: { id: leadId, tenantId },
      include: {
        activities: { orderBy: { createdAt: 'desc' }, take: 10 },
        notesList: { orderBy: { createdAt: 'desc' }, take: 5 },
        deals: { include: { stage: true }, take: 5 },
        siteVisits: { orderBy: { visitDate: 'desc' }, take: 5 },
        loanApplications: { orderBy: { createdDate: 'desc' }, take: 5 }
      }
    });

    if (!lead) {
      return res.status(404).json({ success: false, message: 'Lead not found' });
    }

    const leadAny = lead as any;
    const summary = AIService.generateLeadSummary(
      lead,
      leadAny.activities || [],
      leadAny.notesList || [],
      leadAny.deals || [],
      leadAny.siteVisits || [],
      leadAny.loanApplications || []
    );

    await prisma.lead.update({
      where: { id: lead.id },
      data: { aiSummary: summary }
    });

    return res.json({
      success: true,
      leadId: lead.id,
      summary
    });
  } catch (err: any) {
    return res.status(500).json({ success: false, message: err.message });
  }
}

/**
 * POST /api/v1/ai/generate-followup/:leadId
 * Generates personalized WhatsApp, Email, or SMS copy.
 */
export async function generateFollowUpMessage(req: TenantRequest, res: Response) {
  try {
    const tenantId = req.tenantId!;
    const leadId = String(req.params.leadId);
    const { channel = 'whatsapp' } = req.body;

    const lead = await prisma.lead.findFirst({
      where: { id: leadId, tenantId }
    });

    if (!lead) {
      return res.status(404).json({ success: false, message: 'Lead not found' });
    }

    const agentName = (req as any).user?.fullName || 'Sales Team';
    const result = AIService.generateFollowUp(lead, channel as any, agentName);

    return res.json({
      success: true,
      channel,
      ...result
    });
  } catch (err: any) {
    return res.status(500).json({ success: false, message: err.message });
  }
}

/**
 * GET /api/v1/ai/sales-insights
 * Aggregates high-value opportunities, deals at risk, and pipeline forecast.
 */
export async function getSalesInsights(req: TenantRequest, res: Response) {
  try {
    const tenantId = req.tenantId!;
    const insights = await AIService.getSalesInsights(tenantId);
    return res.json({ success: true, insights });
  } catch (err: any) {
    return res.status(500).json({ success: false, message: err.message });
  }
}

/**
 * POST /api/v1/ai/assistant
 * Natural Language AI CRM query responder.
 */
export async function askAIAssistant(req: TenantRequest, res: Response) {
  try {
    const tenantId = req.tenantId!;
    const prompt = req.body.prompt || req.body.query;

    if (!prompt || typeof prompt !== 'string') {
      return res.status(400).json({ success: false, message: 'Query prompt is required' });
    }

    const response = await AIService.answerAssistantPrompt(tenantId, (req as any).user, prompt);
    return res.json({ success: true, ...response });
  } catch (err: any) {
    return res.status(500).json({ success: false, message: err.message });
  }
}

/**
 * GET /api/v1/ai/lead-recommendation/:leadId
 * Generates context-driven next step with reason, confidence, and action code.
 */
export async function getLeadRecommendation(req: TenantRequest, res: Response) {
  try {
    const tenantId = req.tenantId!;
    const leadId = String(req.params.leadId);

    const lead = await prisma.lead.findFirst({
      where: { id: leadId, tenantId },
      include: {
        activities: { orderBy: { createdAt: 'desc' }, take: 10 },
        deals: true,
        followUps: true
      }
    });

    if (!lead) {
      return res.status(404).json({ success: false, message: 'Lead not found' });
    }

    const leadAny = lead as any;
    const recommendation = AIService.generateLeadRecommendation(
      lead,
      leadAny.activities || [],
      leadAny.deals || [],
      leadAny.followUps || []
    );

    return res.json({
      success: true,
      leadId: lead.id,
      ...recommendation
    });
  } catch (err: any) {
    return res.status(500).json({ success: false, message: err.message });
  }
}

/**
 * GET /api/v1/ai/provider-status
 * Returns current LLM provider status without exposing secrets.
 */
export async function getAIProviderStatus(req: TenantRequest, res: Response) {
  try {
    const status = LLMFactory.getProviderStatus();
    return res.json({
      success: true,
      ...status
    });
  } catch (err: any) {
    return res.status(500).json({ success: false, message: err.message });
  }
}

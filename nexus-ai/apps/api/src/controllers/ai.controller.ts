import { Request, Response, NextFunction } from 'express';
import { AIService } from '../services/ai.service';
import { generateEmailSchema, leadScoreRequestSchema } from '@nexus-ai/validation';
import { logAuditEvent } from '../middleware/auditLogger';
import { AuditAction } from '@prisma/client';

export const scoreLead = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { leadId } = leadScoreRequestSchema.parse({ leadId: req.params.leadId });
    const scoreResult = await AIService.scoreLead(req.organizationId!, leadId);

    await logAuditEvent({
      organizationId: req.organizationId!,
      userId: req.user?.id,
      action: AuditAction.AI_SCORE,
      resource: 'Lead',
      resourceId: leadId,
      details: `Generated AI score (${scoreResult.score}/100) with confidence ${scoreResult.confidence}`,
      req,
    });

    res.status(200).json({
      success: true,
      message: 'AI Lead scoring completed.',
      data: scoreResult,
    });
  } catch (error) {
    next(error);
  }
};

export const generateEmail = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const validated = generateEmailSchema.parse(req.body);
    const result = await AIService.generateEmail(req.organizationId!, validated);

    await logAuditEvent({
      organizationId: req.organizationId!,
      userId: req.user?.id,
      action: AuditAction.AI_GENERATE_EMAIL,
      resource: 'EmailGenerator',
      details: `Generated email draft for lead '${validated.leadName}' with purpose '${validated.emailPurpose}'`,
      req,
    });

    res.status(200).json({
      success: true,
      message: 'Email draft generated successfully.',
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

export const chatAssistant = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { message, conversationId } = req.body;
    if (!message) {
      res.status(400).json({ success: false, message: 'Message is required' });
      return;
    }

    const result = await AIService.handleChatAssistant(
      req.organizationId!,
      req.user!.id,
      message,
      conversationId
    );

    res.status(200).json({
      success: true,
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

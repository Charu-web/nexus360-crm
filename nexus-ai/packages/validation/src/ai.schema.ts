import { z } from 'zod';

export const leadScoreRequestSchema = z.object({
  leadId: z.string().uuid(),
});

export const leadAssistantChatSchema = z.object({
  leadId: z.string().uuid(),
  message: z.string().min(1, 'Message cannot be empty').max(2000),
  history: z
    .array(
      z.object({
        role: z.enum(['user', 'assistant', 'system']),
        content: z.string(),
      })
    )
    .optional()
    .default([]),
});

export const generateEmailSchema = z.object({
  leadId: z.string().uuid().optional(),
  leadName: z.string().min(1, 'Lead name is required'),
  companyName: z.string().optional(),
  emailPurpose: z.enum(['FIRST_OUTREACH', 'FOLLOW_UP', 'PROPOSAL_SUBMISSION', 'MEETING_REQUEST', 'CHECK_IN']),
  tone: z.enum(['PROFESSIONAL', 'FRIENDLY', 'CONCISE', 'PERSUASIVE']).default('PROFESSIONAL'),
  specificGoal: z.string().min(5, 'Please specify the main objective of the email').max(500),
  contextNotes: z.string().max(2000).optional(),
});

export const ragQuerySchema = z.object({
  query: z.string().min(3, 'Query must be at least 3 characters long').max(1000),
  topK: z.number().int().min(1).max(10).default(5),
  documentIds: z.array(z.string().uuid()).optional(),
});

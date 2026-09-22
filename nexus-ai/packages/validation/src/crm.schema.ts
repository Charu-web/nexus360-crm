import { z } from 'zod';
import { LeadStatus, LeadPriority, TaskStatus, TaskPriority } from '@nexus-ai/types';

export const createLeadSchema = z.object({
  name: z.string().min(2, 'Contact name is required').max(100),
  email: z.string().email('Invalid email address').optional().or(z.literal('')),
  phone: z.string().max(30).optional().or(z.literal('')),
  companyName: z.string().max(100).optional().or(z.literal('')),
  companyId: z.string().uuid().optional(),
  source: z.string().default('DIRECT'),
  status: z.nativeEnum(LeadStatus).default(LeadStatus.NEW),
  priority: z.nativeEnum(LeadPriority).default(LeadPriority.MEDIUM),
  industry: z.string().optional().or(z.literal('')),
  estimatedValue: z.number().nonnegative().optional().default(0),
  assignedUserId: z.string().uuid().optional().nullable(),
  tags: z.array(z.string()).default([]),
  notes: z.string().optional(),
});

export const updateLeadSchema = createLeadSchema.partial();

export const createCompanySchema = z.object({
  name: z.string().min(2, 'Company name is required').max(100),
  domain: z.string().optional().or(z.literal('')),
  industry: z.string().optional().or(z.literal('')),
  size: z.string().optional().or(z.literal('')),
  website: z.string().url('Must be a valid URL').optional().or(z.literal('')),
  phone: z.string().optional().or(z.literal('')),
  annualRevenue: z.number().nonnegative().optional(),
});

export const createTaskSchema = z.object({
  title: z.string().min(2, 'Task title is required').max(200),
  description: z.string().optional(),
  status: z.nativeEnum(TaskStatus).default(TaskStatus.TODO),
  priority: z.nativeEnum(TaskPriority).default(TaskPriority.MEDIUM),
  dueDate: z.string().datetime().optional().nullable(),
  leadId: z.string().uuid().optional().nullable(),
  assignedUserId: z.string().uuid().optional().nullable(),
});

export const updateTaskSchema = createTaskSchema.partial();

export type CreateLeadInput = z.infer<typeof createLeadSchema>;
export type UpdateLeadInput = z.infer<typeof updateLeadSchema>;
export type CreateCompanyInput = z.infer<typeof createCompanySchema>;
export type CreateTaskInput = z.infer<typeof createTaskSchema>;

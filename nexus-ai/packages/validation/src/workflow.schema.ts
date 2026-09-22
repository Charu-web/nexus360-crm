import { z } from 'zod';
import { WorkflowTriggerType } from '@nexus-ai/types';

export const createWorkflowSchema = z.object({
  name: z.string().min(2, 'Workflow name is required').max(100),
  description: z.string().max(500).optional(),
  isActive: z.boolean().default(true),
  triggerType: z.nativeEnum(WorkflowTriggerType),
  nodes: z.array(
    z.object({
      id: z.string(),
      type: z.enum(['TRIGGER', 'CONDITION', 'ACTION']),
      label: z.string(),
      config: z.record(z.any()),
      nextNodes: z.array(z.string()).optional(),
    })
  ).min(2, 'Workflow must have at least a trigger and one action'),
});

export const updateWorkflowSchema = createWorkflowSchema.partial();

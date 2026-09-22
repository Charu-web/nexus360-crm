export enum WorkflowTriggerType {
  LEAD_CREATED = 'LEAD_CREATED',
  LEAD_UPDATED = 'LEAD_UPDATED',
  LEAD_SCORE_CHANGED = 'LEAD_SCORE_CHANGED',
  TASK_COMPLETED = 'TASK_COMPLETED',
  DOCUMENT_PROCESSED = 'DOCUMENT_PROCESSED'
}

export enum WorkflowActionType {
  AI_ANALYZE_LEAD = 'AI_ANALYZE_LEAD',
  CREATE_TASK = 'CREATE_TASK',
  UPDATE_LEAD = 'UPDATE_LEAD',
  SEND_NOTIFICATION = 'SEND_NOTIFICATION',
  GENERATE_DRAFT_EMAIL = 'GENERATE_DRAFT_EMAIL',
  TRIGGER_WEBHOOK = 'TRIGGER_WEBHOOK'
}

export interface WorkflowCondition {
  field: string;
  operator: 'EQUALS' | 'NOT_EQUALS' | 'GREATER_THAN' | 'LESS_THAN' | 'CONTAINS';
  value: any;
}

export interface WorkflowNode {
  id: string;
  type: 'TRIGGER' | 'CONDITION' | 'ACTION';
  label: string;
  config: Record<string, any>;
  nextNodes?: string[];
}

export interface WorkflowDTO {
  id: string;
  organizationId: string;
  name: string;
  description?: string;
  isActive: boolean;
  triggerType: WorkflowTriggerType;
  nodes: WorkflowNode[];
  executionCount: number;
  lastExecutedAt?: string;
  createdAt: string;
  updatedAt: string;
}

export enum WorkflowExecutionStatus {
  PENDING = 'PENDING',
  RUNNING = 'RUNNING',
  COMPLETED = 'COMPLETED',
  FAILED = 'FAILED'
}

export interface WorkflowExecutionDTO {
  id: string;
  workflowId: string;
  workflowName: string;
  status: WorkflowExecutionStatus;
  triggerEvent: string;
  logs: {
    timestamp: string;
    step: string;
    level: 'INFO' | 'WARN' | 'ERROR';
    message: string;
  }[];
  startedAt: string;
  completedAt?: string;
  error?: string;
}

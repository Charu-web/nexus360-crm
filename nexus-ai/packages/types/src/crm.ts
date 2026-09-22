export enum LeadStatus {
  NEW = 'NEW',
  CONTACTED = 'CONTACTED',
  QUALIFIED = 'QUALIFIED',
  PROPOSAL = 'PROPOSAL',
  NEGOTIATION = 'NEGOTIATION',
  WON = 'WON',
  LOST = 'LOST'
}

export enum LeadPriority {
  LOW = 'LOW',
  MEDIUM = 'MEDIUM',
  HIGH = 'HIGH',
  URGENT = 'URGENT'
}

export interface LeadDTO {
  id: string;
  organizationId: string;
  name: string;
  email?: string;
  phone?: string;
  companyName?: string;
  companyId?: string;
  source: string;
  status: LeadStatus;
  priority: LeadPriority;
  industry?: string;
  estimatedValue?: number;
  assignedUserId?: string;
  assignedUser?: {
    id: string;
    fullName: string;
    email: string;
  };
  aiScore?: number;
  aiScoreReason?: string;
  aiRecommendedAction?: string;
  tags: string[];
  notesCount: number;
  tasksCount: number;
  lastContactedAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CompanyDTO {
  id: string;
  organizationId: string;
  name: string;
  domain?: string;
  industry?: string;
  size?: string;
  country?: string;
  website?: string;
  phone?: string;
  annualRevenue?: number;
  createdAt: string;
  updatedAt: string;
}

export interface ContactDTO {
  id: string;
  organizationId: string;
  companyId?: string;
  name: string;
  email: string;
  phone?: string;
  title?: string;
  isPrimary: boolean;
  createdAt: string;
  updatedAt: string;
}

export enum TaskStatus {
  TODO = 'TODO',
  IN_PROGRESS = 'IN_PROGRESS',
  COMPLETED = 'COMPLETED',
  CANCELLED = 'CANCELLED'
}

export enum TaskPriority {
  LOW = 'LOW',
  MEDIUM = 'MEDIUM',
  HIGH = 'HIGH',
  URGENT = 'URGENT'
}

export interface TaskDTO {
  id: string;
  organizationId: string;
  title: string;
  description?: string;
  status: TaskStatus;
  priority: TaskPriority;
  dueDate?: string;
  leadId?: string;
  assignedUserId?: string;
  assignedUser?: {
    id: string;
    fullName: string;
  };
  createdAt: string;
  updatedAt: string;
}

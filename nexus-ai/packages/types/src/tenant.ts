import { OrganizationRole } from './auth';

export enum SubscriptionPlan {
  FREE = 'FREE',
  STARTER = 'STARTER',
  PRO = 'PRO',
  ENTERPRISE = 'ENTERPRISE'
}

export enum SubscriptionStatus {
  TRIAL = 'TRIAL',
  ACTIVE = 'ACTIVE',
  PAST_DUE = 'PAST_DUE',
  CANCELED = 'CANCELED'
}

export interface OrganizationDTO {
  id: string;
  name: string;
  slug: string;
  logoUrl?: string;
  website?: string;
  plan: SubscriptionPlan;
  status: SubscriptionStatus;
  maxUsers: number;
  maxLeads: number;
  maxDocuments: number;
  maxAiCredits: number;
  usedAiCredits: number;
  ownerId: string;
  createdAt: string;
  updatedAt: string;
}

export interface OrganizationMemberDTO {
  id: string;
  organizationId: string;
  userId: string;
  role: OrganizationRole;
  user: {
    id: string;
    fullName: string;
    email: string;
    avatarUrl?: string;
  };
  createdAt: string;
}

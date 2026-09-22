import { PrismaClient, OrganizationRole, SubscriptionPlan, SubscriptionStatus, LeadStatus, LeadPriority, DealStage, TaskStatus, TaskPriority, DocumentType, DocumentStatus, WorkflowTriggerType, AuditAction } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 [NexusAI] Seeding Enterprise Database with Realistic Multi-Tenant Data...');

  // 1. Clean up existing data in safe order
  await prisma.auditLog.deleteMany();
  await prisma.notification.deleteMany();
  await prisma.aIMessage.deleteMany();
  await prisma.aIConversation.deleteMany();
  await prisma.workflowExecution.deleteMany();
  await prisma.workflow.deleteMany();
  await prisma.documentChunk.deleteMany();
  await prisma.document.deleteMany();
  await prisma.activity.deleteMany();
  await prisma.task.deleteMany();
  await prisma.deal.deleteMany();
  await prisma.pipelineStage.deleteMany();
  await prisma.pipeline.deleteMany();
  await prisma.lead.deleteMany();
  await prisma.contact.deleteMany();
  await prisma.company.deleteMany();
  await prisma.refreshToken.deleteMany();
  await prisma.invitation.deleteMany();
  await prisma.organizationMember.deleteMany();
  await prisma.organization.deleteMany();
  await prisma.user.deleteMany();

  const passwordHash = await bcrypt.hash('Password@123', 10);

  // 2. Create Users
  const alexOwner = await prisma.user.create({
    data: {
      email: 'alex.owner@nexusai.io',
      fullName: 'Alex Reynolds',
      passwordHash,
      isEmailVerified: true,
      phone: '+1-555-0101',
    },
  });

  const sarahManager = await prisma.user.create({
    data: {
      email: 'sarah.manager@nexusai.io',
      fullName: 'Sarah Jenkins',
      passwordHash,
      isEmailVerified: true,
      phone: '+1-555-0102',
    },
  });

  const davidRep = await prisma.user.create({
    data: {
      email: 'david.rep@nexusai.io',
      fullName: 'David Chen',
      passwordHash,
      isEmailVerified: true,
      phone: '+1-555-0103',
    },
  });

  const emmaViewer = await prisma.user.create({
    data: {
      email: 'emma.viewer@nexusai.io',
      fullName: 'Emma Watson',
      passwordHash,
      isEmailVerified: true,
      phone: '+1-555-0104',
    },
  });

  // 3. Create Organizations (Multi-Tenant Isolation Demo)
  const acmeOrg = await prisma.organization.create({
    data: {
      name: 'Acme Enterprise Solutions',
      slug: 'acme-enterprise',
      website: 'https://acme-enterprise.com',
      plan: SubscriptionPlan.ENTERPRISE,
      status: SubscriptionStatus.ACTIVE,
      maxUsers: 50,
      maxLeads: 50000,
      maxDocuments: 1000,
      maxAiCredits: 25000,
      usedAiCredits: 1420,
    },
  });

  const apexOrg = await prisma.organization.create({
    data: {
      name: 'Apex Global Logistics',
      slug: 'apex-logistics',
      website: 'https://apex-logistics.io',
      plan: SubscriptionPlan.PRO,
      status: SubscriptionStatus.TRIAL,
      trialEndsAt: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
      maxUsers: 25,
      maxLeads: 10000,
      maxDocuments: 250,
      maxAiCredits: 5000,
      usedAiCredits: 350,
    },
  });

  // 4. Assign Memberships & Roles
  await prisma.organizationMember.createMany({
    data: [
      { organizationId: acmeOrg.id, userId: alexOwner.id, role: OrganizationRole.OWNER },
      { organizationId: acmeOrg.id, userId: sarahManager.id, role: OrganizationRole.MANAGER },
      { organizationId: acmeOrg.id, userId: davidRep.id, role: OrganizationRole.EMPLOYEE },
      { organizationId: acmeOrg.id, userId: emmaViewer.id, role: OrganizationRole.VIEWER },
      { organizationId: apexOrg.id, userId: alexOwner.id, role: OrganizationRole.OWNER },
      { organizationId: apexOrg.id, userId: sarahManager.id, role: OrganizationRole.ADMIN },
    ],
  });

  // 5. Create Pipelines & Stages for Acme Org
  const defaultPipeline = await prisma.pipeline.create({
    data: {
      organizationId: acmeOrg.id,
      name: 'Enterprise B2B Sales Pipeline',
      isDefault: true,
      stages: {
        create: [
          { name: 'Discovery Call', stageKey: 'discovery', order: 1, probability: 10, color: '#3b82f6' },
          { name: 'Solution Demo', stageKey: 'demo', order: 2, probability: 35, color: '#8b5cf6' },
          { name: 'Proposal Sent', stageKey: 'proposal', order: 3, probability: 60, color: '#f59e0b' },
          { name: 'Legal / Security Review', stageKey: 'review', order: 4, probability: 80, color: '#06b6d4' },
          { name: 'Closed Won', stageKey: 'won', order: 5, probability: 100, color: '#10b981' },
          { name: 'Closed Lost', stageKey: 'lost', order: 6, probability: 0, color: '#ef4444' },
        ],
      },
    },
    include: { stages: true },
  });

  // 6. Companies & Contacts
  const techCorp = await prisma.company.create({
    data: {
      organizationId: acmeOrg.id,
      name: 'TechFlow Cloud Inc',
      domain: 'techflow.io',
      industry: 'Software / SaaS',
      size: '250-500',
      country: 'United States',
      website: 'https://techflow.io',
      annualRevenue: 45000000,
    },
  });

  const bioHealth = await prisma.company.create({
    data: {
      organizationId: acmeOrg.id,
      name: 'BioHealth Dynamics',
      domain: 'biohealth.org',
      industry: 'Healthcare / Biotech',
      size: '500-1000',
      country: 'United Kingdom',
      website: 'https://biohealth.org',
      annualRevenue: 85000000,
    },
  });

  await prisma.contact.createMany({
    data: [
      {
        organizationId: acmeOrg.id,
        companyId: techCorp.id,
        name: 'Marcus Vance',
        email: 'marcus.v@techflow.io',
        phone: '+1-555-8821',
        title: 'Chief Technology Officer',
        isPrimary: true,
      },
      {
        organizationId: acmeOrg.id,
        companyId: bioHealth.id,
        name: 'Dr. Elena Rostova',
        email: 'elena.r@biohealth.org',
        phone: '+44-20-7946-0912',
        title: 'VP of Digital Operations',
        isPrimary: true,
      },
    ],
  });

  // 7. Seed 25+ Diverse CRM Leads with AI Scores & Rationale
  const leadsData = [
    {
      name: 'Marcus Vance',
      email: 'marcus.v@techflow.io',
      phone: '+1-555-8821',
      companyName: 'TechFlow Cloud Inc',
      companyId: techCorp.id,
      source: 'INBOUND_WEB',
      status: LeadStatus.PROPOSAL,
      priority: LeadPriority.HIGH,
      industry: 'Software / SaaS',
      estimatedValue: 75000,
      assignedUserId: davidRep.id,
      tags: ['Cloud Migration', 'Decision Maker', 'Q4 Deal'],
      aiScore: 92,
      aiScoreConfidence: 0.94,
      aiScoreReason: 'Executive CTO engagement, budget approved ($75k), rapid response time to proposal draft.',
      aiRecommendedAction: 'Schedule security architecture review call before Friday.',
      aiIntentSummary: 'Migrating legacy CRM to NexusAI to unify AI sales copilots and customer pipelines.',
      aiRiskIndicators: ['Competitor trial active with Salesforce'],
      aiScoredAt: new Date(),
    },
    {
      name: 'Dr. Elena Rostova',
      email: 'elena.r@biohealth.org',
      phone: '+44-20-7946-0912',
      companyName: 'BioHealth Dynamics',
      companyId: bioHealth.id,
      source: 'REFERRAL',
      status: LeadStatus.QUALIFIED,
      priority: LeadPriority.URGENT,
      industry: 'Healthcare / Biotech',
      estimatedValue: 120000,
      assignedUserId: sarahManager.id,
      tags: ['Enterprise HIPAA', 'Multi-region', 'High Value'],
      aiScore: 88,
      aiScoreConfidence: 0.91,
      aiScoreReason: 'High deal value ($120k ARR), executive referral, strict compliance alignment requirements.',
      aiRecommendedAction: 'Share HIPAA compliance documentation and schedule executive demo.',
      aiIntentSummary: 'Automating medical rep customer communication and clinical document intelligence.',
      aiRiskIndicators: ['Procurement approval required across 3 departments'],
      aiScoredAt: new Date(),
    },
    {
      name: 'Jonathan Sterling',
      email: 'j.sterling@sterlingfintech.com',
      phone: '+1-555-4301',
      companyName: 'Sterling Financial',
      source: 'LINKEDIN',
      status: LeadStatus.NEW,
      priority: LeadPriority.MEDIUM,
      industry: 'Financial Services',
      estimatedValue: 45000,
      assignedUserId: davidRep.id,
      tags: ['Fintech', 'Outreach'],
      aiScore: 68,
      aiScoreConfidence: 0.82,
      aiScoreReason: 'Verified financial services firm with 120 employees, requested pricing deck.',
      aiRecommendedAction: 'Send introductory custom deck with ROI calculator.',
      aiIntentSummary: 'Seeking AI automation for wealth advisory client follow-ups.',
      aiRiskIndicators: ['No budget specified yet'],
      aiScoredAt: new Date(),
    },
    {
      name: 'Samantha Lee',
      email: 'slee@urbanretail.co',
      phone: '+1-555-9012',
      companyName: 'Urban Retail Group',
      source: 'WEBINAR',
      status: LeadStatus.CONTACTED,
      priority: LeadPriority.HIGH,
      industry: 'Retail & E-commerce',
      estimatedValue: 55000,
      assignedUserId: davidRep.id,
      tags: ['E-commerce', 'Omnichannel'],
      aiScore: 78,
      aiScoreConfidence: 0.87,
      aiScoreReason: 'Attended full CRM AI automation webinar, asked 3 questions on document search.',
      aiRecommendedAction: 'Offer personalized 30-min RAG knowledge base trial walkthrough.',
      aiIntentSummary: 'Looking to organize 5,000+ internal vendor contracts with RAG search.',
      aiRiskIndicators: [],
      aiScoredAt: new Date(),
    },
    {
      name: 'Robert Thorne',
      email: 'rthorne@thorne-logistics.de',
      phone: '+49-30-5554-1290',
      companyName: 'Thorne Freight Systems',
      source: 'COLD_OUTREACH',
      status: LeadStatus.LOST,
      priority: LeadPriority.LOW,
      industry: 'Logistics',
      estimatedValue: 20000,
      assignedUserId: davidRep.id,
      tags: ['Budget Constraint'],
      aiScore: 28,
      aiScoreConfidence: 0.95,
      aiScoreReason: 'Frozen tech budget until next fiscal year, currently evaluating free open source alternatives.',
      aiRecommendedAction: 'Add to quarterly nurture campaign for Q2 re-engagement.',
      aiIntentSummary: 'Delayed migration.',
      aiRiskIndicators: ['Budget frozen', 'Low executive buy-in'],
      aiScoredAt: new Date(),
    },
    {
      name: 'Priya Sharma',
      email: 'priya.sharma@elevatehire.in',
      phone: '+91-98201-55412',
      companyName: 'Elevate Staffing Partners',
      source: 'INBOUND_WEB',
      status: LeadStatus.WON,
      priority: LeadPriority.HIGH,
      industry: 'Human Resources & Staffing',
      estimatedValue: 36000,
      assignedUserId: sarahManager.id,
      tags: ['Closed Won', 'Annual Contract', 'Fast Close'],
      aiScore: 98,
      aiScoreConfidence: 0.98,
      aiScoreReason: 'Contract executed, payment received, onboarding scheduled.',
      aiRecommendedAction: 'Assign Customer Success Onboarding Specialist.',
      aiIntentSummary: 'Platform live for 25 recruiter seats.',
      aiRiskIndicators: [],
      aiScoredAt: new Date(),
    },
  ];

  for (const lead of leadsData) {
    const createdLead = await prisma.lead.create({
      data: {
        organizationId: acmeOrg.id,
        ...lead,
      },
    });

    // Create follow-up tasks & activities for active leads
    if (createdLead.status !== LeadStatus.LOST) {
      await prisma.task.create({
        data: {
          organizationId: acmeOrg.id,
          title: `Follow up with ${createdLead.name} (${createdLead.companyName || 'Lead'})`,
          description: createdLead.aiRecommendedAction || 'Schedule follow-up call',
          status: TaskStatus.TODO,
          priority: TaskPriority.HIGH,
          dueDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000),
          leadId: createdLead.id,
          assignedUserId: createdLead.assignedUserId,
          createdById: alexOwner.id,
        },
      });

      await prisma.activity.create({
        data: {
          organizationId: acmeOrg.id,
          leadId: createdLead.id,
          userId: createdLead.assignedUserId,
          type: 'AI_ACTION',
          title: 'AI Lead Intelligence Evaluation',
          description: `Score: ${createdLead.aiScore}/100. Intent: ${createdLead.aiIntentSummary}`,
          metadata: {
            score: createdLead.aiScore,
            reason: createdLead.aiScoreReason,
            action: createdLead.aiRecommendedAction,
          },
        },
      });
    }
  }

  // 8. Visual AI Workflows
  await prisma.workflow.create({
    data: {
      organizationId: acmeOrg.id,
      name: 'High-Value Lead Automated Outreach',
      description: 'Triggers when a new lead is created, runs AI scoring, and auto-assigns senior reps for leads with score > 75.',
      isActive: true,
      triggerType: WorkflowTriggerType.LEAD_CREATED,
      executionCount: 14,
      lastExecutedAt: new Date(),
      nodes: [
        {
          id: 'trigger-1',
          type: 'TRIGGER',
          label: 'When New Lead Created',
          config: { event: 'LEAD_CREATED' },
          nextNodes: ['ai-analyze-1'],
        },
        {
          id: 'ai-analyze-1',
          type: 'ACTION',
          label: 'AI Intent & Score Analysis',
          config: { model: 'gpt-4o-mini', extractRisk: true },
          nextNodes: ['condition-score'],
        },
        {
          id: 'condition-score',
          type: 'CONDITION',
          label: 'Is AI Score > 75?',
          config: { field: 'aiScore', operator: 'GREATER_THAN', value: 75 },
          nextNodes: ['action-email-draft', 'action-task-create'],
        },
        {
          id: 'action-email-draft',
          type: 'ACTION',
          label: 'Generate Personalized Pitch Draft',
          config: { tone: 'PROFESSIONAL', autoSend: false },
          nextNodes: ['action-notify-manager'],
        },
        {
          id: 'action-task-create',
          type: 'ACTION',
          label: 'Create High Priority 24h Task',
          config: { dueInHours: 24, priority: 'HIGH' },
          nextNodes: [],
        },
        {
          id: 'action-notify-manager',
          type: 'ACTION',
          label: 'Notify Sales Manager on In-App & Email',
          config: { channel: 'IN_APP', priority: 'URGENT' },
          nextNodes: [],
        },
      ],
    },
  });

  // 9. Document Intelligence Sample Metadata
  await prisma.document.create({
    data: {
      organizationId: acmeOrg.id,
      uploaderId: alexOwner.id,
      name: 'Acme_Enterprise_Security_and_Compliance_Whitepaper.pdf',
      fileType: DocumentType.PDF,
      fileSize: 2450190,
      storageKey: 'docs/acme-security-whitepaper.pdf',
      status: DocumentStatus.COMPLETED,
      chunksCount: 18,
      metadata: {
        category: 'Security & Legal',
        author: 'Security Operations Team',
        totalPages: 14,
        topics: ['SOC2 Type II', 'ISO 27001', 'HIPAA', 'Data Encryption at Rest'],
      },
    },
  });

  // 10. Audit Logging Sample
  await prisma.auditLog.createMany({
    data: [
      {
        organizationId: acmeOrg.id,
        userId: alexOwner.id,
        action: AuditAction.LOGIN,
        resource: 'UserSession',
        resourceId: alexOwner.id,
        details: 'User logged in successfully via web interface',
        ipAddress: '192.168.1.1',
        userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
      },
      {
        organizationId: acmeOrg.id,
        userId: alexOwner.id,
        action: AuditAction.AI_SCORE,
        resource: 'Lead',
        details: 'Batch AI lead scoring calculated for 6 inbound accounts',
        ipAddress: '192.168.1.1',
      },
    ],
  });

  console.log('✅ [NexusAI] Database seeded successfully with multi-tenant demo accounts!');
  console.log('----------------------------------------------------');
  console.log('Demo Credentials:');
  console.log('  Owner:   alex.owner@nexusai.io    / Password@123');
  console.log('  Manager: sarah.manager@nexusai.io / Password@123');
  console.log('  Rep:     david.rep@nexusai.io     / Password@123');
  console.log('----------------------------------------------------');
}

main()
  .catch((e) => {
    console.error('❌ Seeding failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

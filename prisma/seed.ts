import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding Empire CRM Multi-Tenant SaaS Database...');

  // 1. SaaS Plans
  const plans = [
    {
      name: 'FREE',
      description: 'Ideal for small teams getting started with basic CRM features.',
      maxUsers: 3,
      maxLeads: 250,
      maxCustomers: 100,
      maxStorageMb: 500,
      maxCustomFields: 5,
      maxPipelines: 1,
      maxAutomations: 2,
      enabledModules: JSON.stringify(['LEADS', 'CUSTOMERS', 'TASKS', 'FOLLOWUPS', 'REPORTS']),
      apiAccess: false,
      webhooks: false,
      integrations: false,
      price: 0,
    },
    {
      name: 'STARTER',
      description: 'Perfect for growing businesses needing custom pipelines and fields.',
      maxUsers: 10,
      maxLeads: 2500,
      maxCustomers: 1000,
      maxStorageMb: 5000,
      maxCustomFields: 15,
      maxPipelines: 3,
      maxAutomations: 10,
      enabledModules: JSON.stringify(['LEADS', 'CONTACTS', 'CUSTOMERS', 'DEALS', 'TASKS', 'FOLLOWUPS', 'REPORTS', 'CALLS']),
      apiAccess: true,
      webhooks: true,
      integrations: false,
      price: 29,
    },
    {
      name: 'PRO',
      description: 'Advanced automation, custom modules, and integration tools.',
      maxUsers: 25,
      maxLeads: 10000,
      maxCustomers: 5000,
      maxStorageMb: 20000,
      maxCustomFields: 50,
      maxPipelines: 10,
      maxAutomations: 30,
      enabledModules: JSON.stringify(['LEADS', 'CONTACTS', 'CUSTOMERS', 'DEALS', 'TASKS', 'FOLLOWUPS', 'ACTIVITIES', 'NOTES', 'CAMPAIGNS', 'PROJECTS', 'SERVICES', 'CALLS', 'REPORTS', 'HRMS']),
      apiAccess: true,
      webhooks: true,
      integrations: true,
      price: 79,
    },
    {
      name: 'BUSINESS',
      description: 'High capacity solution with priority support and unlimited workflows.',
      maxUsers: 100,
      maxLeads: 50000,
      maxCustomers: 25000,
      maxStorageMb: 100000,
      maxCustomFields: 100,
      maxPipelines: 25,
      maxAutomations: 100,
      enabledModules: JSON.stringify(['*']),
      apiAccess: true,
      webhooks: true,
      integrations: true,
      price: 199,
    },
    {
      name: 'ENTERPRISE',
      description: 'Custom limits, dedicated infrastructure, and SLA.',
      maxUsers: 1000,
      maxLeads: 500000,
      maxCustomers: 250000,
      maxStorageMb: 500000,
      maxCustomFields: 500,
      maxPipelines: 100,
      maxAutomations: 500,
      enabledModules: JSON.stringify(['*']),
      apiAccess: true,
      webhooks: true,
      integrations: true,
      price: 499,
    },
  ];

  for (const p of plans) {
    await prisma.plan.upsert({
      where: { name: p.name },
      update: p,
      create: p,
    });
  }

  // 2. Global Platform Admin Role & User
  const platformAdminRole = await prisma.role.upsert({
    where: { id: 'role-platform-admin' },
    update: {},
    create: {
      id: 'role-platform-admin',
      name: 'SUPER_ADMIN',
      description: 'Platform Super Administrator with complete multi-tenant access',
      permissions: JSON.stringify(['*']),
    },
  });

  const superAdminPass = await bcrypt.hash('SuperAdminPassword123!', 10);
  const superAdminUser = await prisma.user.upsert({
    where: { id: 'user-platform-admin' },
    update: {},
    create: {
      id: 'user-platform-admin',
      email: 'superadmin@empirecrm.io',
      password: superAdminPass,
      fullName: 'Platform Owner',
      phone: '+1 (555) 000-1111',
      department: 'Platform Operations',
      designation: 'Chief Technology Officer',
      roleId: platformAdminRole.id,
      isActive: true,
    },
  });

  // 3. Default Workspace Tenant ("Empire CRM")
  const defaultTenant = await prisma.tenant.upsert({
    where: { slug: 'empire-crm' },
    update: {},
    create: {
      id: 'tenant-empire-default',
      name: 'Empire CRM Workspace',
      slug: 'empire-crm',
      status: 'ACTIVE',
      industry: 'Generic CRM',
      companySize: '10-50',
      country: 'India',
      city: 'Mumbai',
      website: 'https://empirecrm.io',
      primaryColor: '#3b82f6',
      secondaryColor: '#1e40af',
      template: 'Generic CRM',
    },
  });

  // Clear previous tenant data if re-seeding
  await prisma.leadActivity.deleteMany({ where: { tenantId: defaultTenant.id } });
  await prisma.activity.deleteMany({ where: { tenantId: defaultTenant.id } });
  await prisma.note.deleteMany({ where: { tenantId: defaultTenant.id } });
  await prisma.task.deleteMany({ where: { tenantId: defaultTenant.id } });
  await prisma.deal.deleteMany({ where: { tenantId: defaultTenant.id } });
  await prisma.customer.deleteMany({ where: { tenantId: defaultTenant.id } });
  await prisma.lead.deleteMany({ where: { tenantId: defaultTenant.id } });
  await prisma.usage.deleteMany({ where: { tenantId: defaultTenant.id } });
  await prisma.subscription.deleteMany({ where: { tenantId: defaultTenant.id } });
  await prisma.pipelineStage.deleteMany({ where: { tenantId: defaultTenant.id } });
  await prisma.pipeline.deleteMany({ where: { tenantId: defaultTenant.id } });
  await prisma.tenantModule.deleteMany({ where: { tenantId: defaultTenant.id } });
  await prisma.user.deleteMany({ where: { tenantId: defaultTenant.id } });
  await prisma.role.deleteMany({ where: { tenantId: defaultTenant.id } });

  // 4. Default Tenant Roles
  const tenantAdminRole = await prisma.role.create({
    data: {
      tenantId: defaultTenant.id,
      name: 'TENANT_ADMIN',
      description: 'Tenant Administrator',
      permissions: JSON.stringify(['*']),
      isDefault: true,
    },
  });

  const staffRole = await prisma.role.create({
    data: {
      tenantId: defaultTenant.id,
      name: 'STAFF',
      description: 'Standard CRM Staff Member',
      permissions: JSON.stringify(['LEADS_VIEW', 'LEADS_CREATE', 'CUSTOMERS_VIEW', 'TASKS_VIEW']),
      isDefault: false,
    },
  });

  // 5. Default Tenant Users
  const adminPass = await bcrypt.hash('AdminPassword123!', 10);
  const tenantAdminUser = await prisma.user.create({
    data: {
      tenantId: defaultTenant.id,
      email: 'admin@empirecrm.io',
      password: adminPass,
      fullName: 'Preeti Patel',
      phone: '+1 (555) 222-3333',
      department: 'Sales & Operations',
      designation: 'Store Manager',
      roleId: tenantAdminRole.id,
      isActive: true,
    },
  });

  const staffPass = await bcrypt.hash('UserPassword123!', 10);
  const staffUser = await prisma.user.create({
    data: {
      tenantId: defaultTenant.id,
      email: 'user@empirecrm.io',
      password: staffPass,
      fullName: 'Rahul Sharma',
      phone: '+1 (555) 444-5555',
      department: 'Sales',
      designation: 'Sales Specialist',
      roleId: staffRole.id,
      isActive: true,
    },
  });

  // 6. Default Tenant Modules
  const defaultModulesList = ['LEADS', 'CONTACTS', 'CUSTOMERS', 'DEALS', 'TASKS', 'FOLLOWUPS', 'ACTIVITIES', 'NOTES', 'CAMPAIGNS', 'PROJECTS', 'SERVICES', 'CALLS', 'REPORTS', 'HRMS'];
  for (const mKey of defaultModulesList) {
    await prisma.tenantModule.create({
      data: {
        tenantId: defaultTenant.id,
        moduleKey: mKey,
        enabled: true,
      },
    });
  }

  // 7. Default Tenant Pipeline & Stages
  const pipeline = await prisma.pipeline.create({
    data: {
      tenantId: defaultTenant.id,
      name: 'Standard Sales Pipeline',
      isDefault: true,
      stages: {
        create: [
          { tenantId: defaultTenant.id, name: 'New Lead', stageKey: 'new', order: 1, color: '#3b82f6', probability: 10 },
          { tenantId: defaultTenant.id, name: 'Contacted', stageKey: 'contacted', order: 2, color: '#f59e0b', probability: 30 },
          { tenantId: defaultTenant.id, name: 'Qualified', stageKey: 'qualified', order: 3, color: '#8b5cf6', probability: 50 },
          { tenantId: defaultTenant.id, name: 'Proposal Sent', stageKey: 'proposal', order: 4, color: '#06b6d4', probability: 75 },
          { tenantId: defaultTenant.id, name: 'Closed Won', stageKey: 'won', order: 5, color: '#10b981', probability: 100, closedWon: true },
          { tenantId: defaultTenant.id, name: 'Closed Lost', stageKey: 'lost', order: 6, color: '#ef4444', probability: 0, closedLost: true },
        ],
      },
    },
    include: { stages: true },
  });

  // 8. Default Subscription & Usage
  const proPlan = await prisma.plan.findUnique({ where: { name: 'PRO' } });
  if (proPlan) {
    await prisma.subscription.create({
      data: {
        tenantId: defaultTenant.id,
        planId: proPlan.id,
        status: 'ACTIVE',
      },
    });
  }

  await prisma.usage.create({
    data: {
      tenantId: defaultTenant.id,
      userCount: 2,
      leadCount: 3,
      customerCount: 1,
      dealCount: 0,
    },
  });

  // 9. Initial CRM Data (Leads, Customer, Task, Note)
  const lead1 = await prisma.lead.create({
    data: {
      tenantId: defaultTenant.id,
      leadId: 'EMP-LD-1001',
      customerName: 'Aarav Mehta',
      phone: '+91 9876543210',
      email: 'aarav.m@example.com',
      city: 'Mumbai',
      loanType: 'Home Loan',
      amount: 4500000,
      source: 'Website',
      status: 'Converted',
      pipelineId: pipeline.id,
      stageId: pipeline.stages[4].id,
      assignedToId: tenantAdminUser.id,
      notes: 'High priority customer seeking prime home financing.',
    },
  });

  const lead2 = await prisma.lead.create({
    data: {
      tenantId: defaultTenant.id,
      leadId: 'EMP-LD-1002',
      customerName: 'Ananya Verma',
      phone: '+91 9812345678',
      email: 'ananya.v@example.com',
      city: 'Delhi',
      loanType: 'Business Loan',
      amount: 2500000,
      source: 'Referral',
      status: 'In Progress',
      pipelineId: pipeline.id,
      stageId: pipeline.stages[2].id,
      assignedToId: staffUser.id,
      notes: 'Docs under evaluation.',
    },
  });

  const lead3 = await prisma.lead.create({
    data: {
      tenantId: defaultTenant.id,
      leadId: 'EMP-LD-1003',
      customerName: 'Vikram Singh',
      phone: '+91 9988776655',
      email: 'vikram.s@example.com',
      city: 'Bangalore',
      loanType: 'Personal Loan',
      amount: 750000,
      source: 'Facebook',
      status: 'New',
      pipelineId: pipeline.id,
      stageId: pipeline.stages[0].id,
      assignedToId: staffUser.id,
      notes: 'Newly generated inbound query.',
    },
  });

  const customer1 = await prisma.customer.create({
    data: {
      tenantId: defaultTenant.id,
      customerId: 'EMP-CUST-5001',
      name: 'Aarav Mehta',
      email: 'aarav.m@example.com',
      phone: '+91 9876543210',
      city: 'Mumbai',
      company: 'Mehta Enterprises',
      status: 'Active',
      totalDeals: 1,
      lifetimeValue: 4500000,
    },
  });

  await prisma.task.create({
    data: {
      tenantId: defaultTenant.id,
      title: 'Follow up on document verification for Ananya Verma',
      description: 'Collect GST certificate and last 6 months bank statement.',
      priority: 'High',
      status: 'Pending',
      dueDate: new Date(Date.now() + 86400000 * 2),
      assignedToId: staffUser.id,
      leadId: lead2.id,
    },
  });

  await prisma.note.create({
    data: {
      tenantId: defaultTenant.id,
      content: 'Initial call completed. Client is very interested in low interest rate scheme.',
      leadId: lead1.id,
      createdById: tenantAdminUser.id,
    },
  });

  // 10. Audit Log & System Settings
  await prisma.auditLog.create({
    data: {
      tenantId: defaultTenant.id,
      userId: tenantAdminUser.id,
      action: 'SYSTEM_INITIALIZATION',
      entity: 'System',
      details: 'Nexus360 AI-Powered Unified CRM Platform Database Seeded Successfully.',
      ipAddress: '127.0.0.1',
    },
  });

  const settings = [
    { key: 'company_name', value: 'Nexus360 Enterprise', category: 'General', description: 'Platform Name' },
    { key: 'support_email', value: 'support@nexus360.io', category: 'General', description: 'Support Contact Email' },
    { key: 'session_timeout_minutes', value: '60', category: 'Security', description: 'Session inactivity timeout' },
  ];

  for (const s of settings) {
    await prisma.systemSetting.upsert({
      where: { key: s.key },
      update: {},
      create: s,
    });
  }

  // 11. Seed Loan Applications (DSA Sathi Suite)
  const loan1 = await prisma.loanApplication.upsert({
    where: { tenantId_applicationId: { tenantId: defaultTenant.id, applicationId: 'LOAN-1001' } },
    update: {},
    create: {
      tenantId: defaultTenant.id,
      applicationId: 'LOAN-1001',
      applicantName: 'Amit Patel',
      phone: '+91 9876543212',
      email: 'amit.patel@example.com',
      panNumber: 'ABCDE1234F',
      employmentType: 'Business Owner',
      monthlyIncome: 120000,
      loanType: 'Business Loan',
      requestedAmount: 1000000,
      sanctionedAmount: 1000000,
      disbursedAmount: 950000,
      bankPartner: 'HDFC Bank',
      dsaCode: 'DST-HDFC-991',
      status: 'Disbursed',
      tenureMonths: 48,
      interestRate: 11.5,
      emiAmount: 26088,
      assignedToId: tenantAdminUser.id,
    }
  });

  const loan2 = await prisma.loanApplication.upsert({
    where: { tenantId_applicationId: { tenantId: defaultTenant.id, applicationId: 'LOAN-1002' } },
    update: {},
    create: {
      tenantId: defaultTenant.id,
      applicationId: 'LOAN-1002',
      applicantName: 'Manoj Tiwari',
      phone: '+91 9876543216',
      email: 'manoj.tiwari@example.com',
      employmentType: 'Salaried',
      monthlyIncome: 180000,
      loanType: 'Home Loan',
      requestedAmount: 4500000,
      sanctionedAmount: 4200000,
      disbursedAmount: 0,
      bankPartner: 'State Bank of India',
      dsaCode: 'DST-SBI-108',
      status: 'Sanctioned',
      tenureMonths: 240,
      interestRate: 8.75,
      emiAmount: 37112,
      assignedToId: staffUser.id,
    }
  });

  // 12. Seed Real Estate Projects & Units
  const project1 = await prisma.realEstateProject.upsert({
    where: { tenantId_projectId: { tenantId: defaultTenant.id, projectId: 'PROJ-101' } },
    update: {},
    create: {
      tenantId: defaultTenant.id,
      projectId: 'PROJ-101',
      name: 'Emerald Heights & Plotted Enclave',
      code: 'EMR-01',
      location: 'Sector 45, Expressway Corridor',
      city: 'Mumbai',
      projectType: 'Plotted Development',
      totalArea: '25 Acres',
      totalUnits: 120,
      status: 'Active'
    }
  });

  const unit1 = await prisma.propertyUnit.upsert({
    where: { projectId_unitNumber: { projectId: project1.id, unitNumber: 'Plot 104' } },
    update: {},
    create: {
      tenantId: defaultTenant.id,
      projectId: project1.id,
      unitNumber: 'Plot 104',
      block: 'Block A',
      unitType: 'Residential Plot',
      sizeSqFt: 1500,
      facing: 'East',
      basePrice: 4500000,
      totalPrice: 4500000,
      status: 'Available',
      assignedAgentId: staffUser.id
    }
  });

  const unit2 = await prisma.propertyUnit.upsert({
    where: { projectId_unitNumber: { projectId: project1.id, unitNumber: 'Plot 105' } },
    update: {},
    create: {
      tenantId: defaultTenant.id,
      projectId: project1.id,
      unitNumber: 'Plot 105',
      block: 'Block A',
      unitType: 'Corner Plot',
      sizeSqFt: 1800,
      facing: 'North-East',
      basePrice: 5800000,
      totalPrice: 6200000,
      status: 'Booked',
      assignedAgentId: staffUser.id
    }
  });

  // Site visit
  await prisma.siteVisit.create({
    data: {
      tenantId: defaultTenant.id,
      projectId: project1.id,
      unitId: unit1.id,
      visitorName: 'Rajesh Malhotra',
      phone: '+91 9811223344',
      visitDate: new Date(Date.now() + 86400000 * 2),
      status: 'Scheduled',
      outcome: 'Interested',
      assignedExecutiveId: staffUser.id,
      feedback: 'Client interested in immediate registry on 1500 sq ft plot.'
    }
  });

  // Booking
  const booking1 = await prisma.propertyBooking.upsert({
    where: { tenantId_bookingId: { tenantId: defaultTenant.id, bookingId: 'BKG-2026-101' } },
    update: {},
    create: {
      tenantId: defaultTenant.id,
      bookingId: 'BKG-2026-101',
      projectId: project1.id,
      unitId: unit2.id,
      salesExecutiveId: staffUser.id,
      agreementValue: 6200000,
      tokenAmount: 500000,
      totalPaidAmount: 500000,
      balanceAmount: 5700000,
      status: 'Token Paid',
      paymentPlan: 'Construction Linked'
    }
  });

  // 13. Seed Social Media Inbox
  await prisma.socialAccount.upsert({
    where: { tenantId_platform_accountId: { tenantId: defaultTenant.id, platform: 'FACEBOOK', accountId: 'act_fb_page_101' } },
    update: {},
    create: {
      tenantId: defaultTenant.id,
      platform: 'FACEBOOK',
      accountName: 'Nexus360 Real Estate & Fintech',
      accountId: 'act_fb_page_101',
      status: 'CONNECTED'
    }
  });

  const conv1 = await prisma.socialConversation.upsert({
    where: { tenantId_externalConversationId: { tenantId: defaultTenant.id, externalConversationId: 'ig_conv_101' } },
    update: {},
    create: {
      tenantId: defaultTenant.id,
      platform: 'INSTAGRAM',
      externalConversationId: 'ig_conv_101',
      senderId: 'ig_user_101',
      senderName: 'Pooja Bhatia',
      senderPhone: '+91 9988776655',
      senderEmail: 'pooja@bhatia.org',
      lastMessageText: 'Can I get floor plans and payment schedule for Emerald Heights plots?',
      lastMessageTime: new Date(),
      status: 'OPEN',
      unreadCount: 1,
      messages: {
        create: [
          {
            tenantId: defaultTenant.id,
            platform: 'INSTAGRAM',
            direction: 'INBOUND',
            messageText: 'Hello! I saw your reel regarding newly launched plots.',
            senderName: 'Pooja Bhatia'
          },
          {
            tenantId: defaultTenant.id,
            platform: 'INSTAGRAM',
            direction: 'INBOUND',
            messageText: 'Can I get floor plans and payment schedule for Emerald Heights plots?',
            senderName: 'Pooja Bhatia'
          }
        ]
      }
    }
  });

  // 14. Seed Automation Rule
  await prisma.automationRule.create({
    data: {
      tenantId: defaultTenant.id,
      name: 'High Score Lead Instant Outreach',
      triggerEvent: 'lead.score_high',
      conditions: JSON.stringify([{ field: 'leadScore', operator: 'greater_than', value: 70 }]),
      actions: JSON.stringify([
        { actionType: 'create_task', params: { title: 'High Intent Lead - Call within 15 mins', priority: 'High' } },
        { actionType: 'send_whatsapp', params: { channel: 'whatsapp' } }
      ]),
      isActive: true
    }
  });

  console.log('Nexus360 Multi-Tenant Unified Seeding completed successfully!');
}

main()
  .catch((e) => {
    console.error('Seeding error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

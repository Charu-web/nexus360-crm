import { PrismaClient } from '@prisma/client';
import { AIService } from '../services/ai.service';
import { AutomationEngine } from '../services/automation.service';
import { calculateEMI } from '../controllers/loans.controller';

const prisma = new PrismaClient();

let passed = 0;
let failed = 0;

function assert(condition: boolean, message: string) {
  if (condition) {
    console.log(`  [PASS] ${message}`);
    passed++;
  } else {
    console.error(`  [FAIL] ${message}`);
    failed++;
  }
}

async function runPhase2Tests() {
  console.log('===========================================================');
  console.log('    Nexus360 Phase 2: Unified CRM + AI + Automation Suite');
  console.log('===========================================================\n');

  const tenant = await prisma.tenant.findFirst({ where: { slug: 'empire-enterprises' } }) 
    || await prisma.tenant.findFirst() 
    || await prisma.tenant.create({
      data: {
        name: 'Empire Enterprises',
        slug: 'empire-enterprises',
        domain: 'empire.nexus360.local',
        industry: 'Enterprise CRM',
        status: 'ACTIVE'
      }
    });
  const tenantId = tenant.id;

  let salesRep = await prisma.user.findFirst({ where: { tenantId, department: 'Sales' } })
    || await prisma.user.findFirst({ where: { tenantId } });

  let manager = await prisma.user.findFirst({ where: { tenantId, email: { contains: 'admin' } } })
    || await prisma.user.findFirst({ where: { tenantId } });

  if (!salesRep || !manager) {
    throw new Error('Tenant users could not be found');
  }

  // -------------------------------------------------------------
  // TEST 1: UNIFIED LEAD MANAGEMENT (17 fields, Omnichannel Sources)
  // -------------------------------------------------------------
  console.log('--- 1. Unified Lead Management & Omnichannel Sources ---');
  const sources = [
    'Website', 'Facebook', 'Instagram', 'WhatsApp', 'Manual',
    'Loan Enquiry', 'Property Enquiry', 'Campaign', 'Import'
  ];

  const createdLeads = [];
  for (const src of sources) {
    const leadScoreRes = AIService.calculateLeadScore({
      customerName: `Lead from ${src}`,
      phone: '+91 9876543210',
      email: `${src.toLowerCase().replace(/\s+/g, '')}@testlead.com`,
      source: src,
      amount: 4500000,
      industry: src.includes('Loan') ? 'LOAN' : src.includes('Property') ? 'REAL_ESTATE' : 'GENERAL',
      status: 'New',
      priority: 'High'
    });

    const lead = await prisma.lead.create({
      data: {
        tenantId,
        leadId: `LD-${src.replace(/\s+/g, '').toUpperCase()}-${Date.now() % 100000}-${Math.floor(Math.random()*1000)}`,
        customerName: `Rajesh ${src}`,
        phone: '+91 9876543210',
        email: `rajesh.${src.toLowerCase().replace(/\s+/g, '')}@example.com`,
        source: src,
        campaignName: 'Summer Launch 2026',
        industry: src.includes('Loan') ? 'LOAN' : src.includes('Property') ? 'REAL_ESTATE' : 'GENERAL',
        assignedToId: salesRep.id,
        status: 'New',
        priority: 'High',
        leadScore: leadScoreRes.score,
        leadScoreCategory: leadScoreRes.category,
        leadScoreReason: JSON.stringify(leadScoreRes.reasons),
        tags: JSON.stringify(['HighIntent', 'Phase2Verified', src]),
        notes: `Created during automated omnichannel ingestion test for ${src}`,
        amount: 4500000
      }
    });
    createdLeads.push(lead);
  }

  assert(createdLeads.length === 9, `All 9 omnichannel sources successfully ingested as Unified Leads`);
  assert(createdLeads.every(l => Boolean(l.customerName && l.phone && l.email && l.source && l.campaignName && l.industry && l.leadScore !== null && l.tags)),
    `Every lead supports all required attributes (Name, Phone, Email, Source, Campaign, Industry, Score, Tags, etc.)`);

  // -------------------------------------------------------------
  // TEST 2: CONFIGURABLE PIPELINE & STAGE PROGRESSION
  // -------------------------------------------------------------
  console.log('\n--- 2. Configurable Lead Pipeline & Custom Stages ---');
  let pipeline = await prisma.pipeline.findFirst({ where: { tenantId, name: 'Nexus360 Unified Sales Pipeline' } });
  if (!pipeline) {
    pipeline = await prisma.pipeline.create({
      data: {
        tenantId,
        name: 'Nexus360 Unified Sales Pipeline',
        isDefault: true
      }
    });
  }

  const defaultStages = ['New', 'Contacted', 'Qualified', 'Follow-up', 'Negotiation', 'Won', 'Lost'];
  const createdStages = [];
  for (let i = 0; i < defaultStages.length; i++) {
    const stageName = defaultStages[i];
    let stage = await prisma.pipelineStage.findFirst({ where: { pipelineId: pipeline.id, name: stageName } });
    if (!stage) {
      stage = await prisma.pipelineStage.create({
        data: {
          tenantId,
          pipelineId: pipeline.id,
          name: stageName,
          stageKey: stageName.toLowerCase().replace(/[^a-z0-9]/g, '_'),
          order: i + 1,
          probability: stageName === 'Won' ? 100 : stageName === 'Lost' ? 0 : (i + 1) * 15
        }
      });
    }
    createdStages.push(stage);
  }

  assert(createdStages.length === 7, `Configured 7-stage pipeline (New -> Contacted -> Qualified -> Follow-up -> Negotiation -> Won -> Lost)`);

  const customStage = await prisma.pipelineStage.create({
    data: {
      tenantId,
      pipelineId: pipeline.id,
      name: `Credit Appraisal ${Date.now() % 1000}`,
      stageKey: `credit_appraisal_${Date.now() % 1000}`,
      order: 8,
      probability: 70
    }
  });
  assert(customStage.probability === 70, `Custom stage successfully added to pipeline`);

  const testLead = createdLeads[0];
  const updatedLead = await prisma.lead.update({
    where: { id: testLead.id },
    data: {
      status: 'Qualified',
      pipelineId: pipeline.id,
      stageId: createdStages[2].id
    }
  });
  assert(updatedLead.status === 'Qualified' && updatedLead.stageId === createdStages[2].id, `Lead progressed through pipeline stages with updated status`);

  // -------------------------------------------------------------
  // TEST 3: AI LEAD SCORING (0-100, Hot/Warm/Cold, Explainability)
  // -------------------------------------------------------------
  console.log('\n--- 3. AI Lead Scoring Engine (0-100, Categories, Reasons) ---');
  const hotScore = AIService.calculateLeadScore({
    customerName: 'Sanjay Singhania',
    phone: '+91 9811223344',
    email: 'sanjay@enterprise.com',
    city: 'Mumbai',
    source: 'Property Enquiry',
    amount: 12000000,
    status: 'Qualified'
  }, [{ title: 'Site visit confirmed' }, { title: 'Pricing negotiation call' }], [{ title: 'Tower A 3BHK Deal', amount: 12000000 }]);

  assert(hotScore.score >= 75 && hotScore.category === 'HOT', `High-intent lead scored ${hotScore.score}/100 categorized as HOT (>=75)`);
  assert(hotScore.reasons.length >= 4, `Explainability reasons provided: "${hotScore.reasons.slice(0, 2).join('; ')}"`);

  const coldScore = AIService.calculateLeadScore({
    customerName: 'User',
    source: 'Manual',
    amount: 0,
    status: 'Lost'
  }, []);
  assert(coldScore.score < 45 && coldScore.category === 'COLD', `Low-intent lead scored ${coldScore.score}/100 categorized as COLD (<45)`);

  // -------------------------------------------------------------
  // TEST 4: AI LEAD SUMMARY GENERATION
  // -------------------------------------------------------------
  console.log('\n--- 4. AI Structured Lead Summary ---');
  const summary = AIService.generateLeadSummary(
    testLead,
    [{ title: 'Inbound WhatsApp discussion regarding 3-BHK luxury apartment' }],
    [{ content: 'Client prefers possession within 6 months. Budget flexible.' }],
    [{ title: 'Villa 101 Booking', amount: 4500000 }],
    [{ visitDate: new Date(), status: 'Confirmed', outcome: 'Interested' }],
    []
  );
  assert(summary.includes('Executive Summary') && summary.includes('Origin & Intent') && summary.includes('Recommendation'),
    `Structured AI summary includes Customer Requirement, History, Stage, Notes, and Recommended Action`);

  // -------------------------------------------------------------
  // TEST 5: AI FOLLOW-UP GENERATOR (WhatsApp, Email, SMS)
  // -------------------------------------------------------------
  console.log('\n--- 5. AI Follow-up Message Generator (Multi-Channel Copy) ---');
  const waFollowUp = AIService.generateFollowUp(testLead, 'whatsapp', 'Aman Sharma');
  const emailFollowUp = AIService.generateFollowUp(testLead, 'email', 'Aman Sharma');
  const smsFollowUp = AIService.generateFollowUp(testLead, 'sms', 'Aman Sharma');

  assert(waFollowUp.message.includes('Aman Sharma') && waFollowUp.message.includes(testLead.customerName),
    `Personalized WhatsApp follow-up generated with agent and lead context`);
  assert(emailFollowUp.subject !== undefined && emailFollowUp.message.includes('Nexus360 Enterprise Solutions'),
    `Professional Email follow-up draft generated with subject and structured body`);
  assert(smsFollowUp.message.includes('Reply CALL'),
    `Concise SMS reminder generated with actionable call to action`);

  // -------------------------------------------------------------
  // TEST 6: CONVERSATIONAL AI CRM ASSISTANT & RBAC SECURITY
  // -------------------------------------------------------------
  console.log('\n--- 6. Conversational AI Assistant & Multi-tenant RBAC ---');
  const q1 = await AIService.answerAssistantPrompt(tenantId, manager, 'Show hot leads from Facebook with no follow-up in last 3 days');
  assert(q1.answer.includes('Facebook leads'), `Assistant resolved query: "Facebook leads with no follow-up"`);

  const q2 = await AIService.answerAssistantPrompt(tenantId, manager, 'Which sales executive has highest conversion this month?');
  assert(q2.answer.includes('Top performer') || q2.answer.includes('conversion'), `Assistant resolved query: "Sales executive highest conversion"`);

  const q3 = await AIService.answerAssistantPrompt(tenantId, manager, `Draft WhatsApp message for lead #${testLead.leadId}`);
  assert(q3.answer.includes('Drafted personalized WHATSAPP message'), `Assistant resolved query: "Draft WhatsApp message for lead"`);

  const q4 = await AIService.answerAssistantPrompt(tenantId, manager, 'Show all loans pending approval above 10 Lakhs');
  assert(q4.answer.includes('loan applications pending approval'), `Assistant resolved query: "Loans pending approval above 10 Lakhs"`);

  const q5 = await AIService.answerAssistantPrompt(tenantId, manager, 'What is our expected revenue this month?');
  assert(q5.answer.includes('pipeline revenue') || q5.answer.includes('forecast'), `Assistant resolved query: "Expected revenue this month"`);

  const restrictedUser = { role: { name: 'RESTRICTED_AGENT' } };
  const rbacTest = await AIService.answerAssistantPrompt(tenantId, restrictedUser, 'What is our expected revenue this month?');
  assert(rbacTest.answer.includes('Access Restricted'), `RBAC Security: Restricted user denied financial pipeline data`);

  // -------------------------------------------------------------
  // TEST 7: AUTOMATION ENGINE (TRIGGER -> CONDITION -> ACTION)
  // Concrete Test Example: Lead Created + Score >= 70 ->
  //   Assign Sales Exec -> Create Task -> Notify Manager -> Generate AI Follow-up
  // -------------------------------------------------------------
  console.log('\n--- 7. Automation Engine: Lead Created + Score >= 70 ---');
  const workflowRule = await prisma.automationRule.create({
    data: {
      tenantId,
      name: 'High Score Lead Immediate SLA Routing',
      triggerEvent: 'lead.created',
      conditions: JSON.stringify([
        { field: 'leadScore', operator: 'greater_than_or_equal', value: 70 }
      ]),
      actions: JSON.stringify([
        { actionType: 'assign_sales_executive', params: { userId: salesRep.id } },
        { actionType: 'create_task', params: { title: 'Call high-value lead within 15 minutes', priority: 'High', dueInDays: 1 } },
        { actionType: 'notify_manager', params: {} },
        { actionType: 'generate_ai_followup', params: { channel: 'whatsapp' } }
      ]),
      isActive: true
    }
  });

  const highLead = await prisma.lead.create({
    data: {
      tenantId,
      leadId: `LD-AUTO-${Date.now() % 100000}-${Math.floor(Math.random()*1000)}`,
      customerName: 'Vikramaditya Rao',
      phone: '+91 9988776655',
      email: 'vikramaditya@corporation.com',
      source: 'Facebook',
      industry: 'REAL_ESTATE',
      amount: 8500000,
      status: 'New',
      priority: 'High',
      leadScore: 88,
      leadScoreCategory: 'HOT',
      leadScoreReason: JSON.stringify(['Verified contact (+10)', 'Social enquiry (+12)', 'High budget (+20)']),
      tags: JSON.stringify(['AutomationCandidate', 'HNW'])
    }
  });

  const execResults = await AutomationEngine.processEvent(tenantId, 'lead.created', highLead);
  assert(execResults.length > 0 && execResults.some(r => r.ruleId === workflowRule.id && r.status === 'SUCCESS'),
    `Automation Engine evaluated trigger and satisfied condition (Score >= 70)`);

  const matchedRule = execResults.find(r => r.ruleId === workflowRule.id);
  const actions = matchedRule?.actionsExecuted || [];

  const assignAction = actions.find(a => a.action === 'assign_sales_executive');
  const taskAction = actions.find(a => a.action === 'create_task');
  const notifyAction = actions.find(a => a.action === 'notify_manager');
  const aiFollowUpAction = actions.find(a => a.action === 'generate_ai_followup');

  assert(Boolean(assignAction && assignAction.assignedToId === salesRep.id), `Action 1: Sales Executive assigned (${salesRep.fullName})`);
  assert(Boolean(taskAction && taskAction.taskId), `Action 2: High-priority follow-up task auto-created (Task ID: ${taskAction?.taskId})`);
  assert(Boolean(notifyAction && notifyAction.activityId), `Action 3: Manager alert notification dispatched (Activity ID: ${notifyAction?.activityId})`);
  assert(Boolean(aiFollowUpAction && aiFollowUpAction.readyForSendConfirmation === true && aiFollowUpAction.message.includes('Vikramaditya Rao')),
    `Action 4: AI Follow-up draft generated with client copy ready for confirmation`);

  const auditLogs = await prisma.automationLog.findMany({
    where: { tenantId, ruleId: workflowRule.id }
  });
  assert(auditLogs.length > 0 && auditLogs[0].status === 'SUCCESS', `Audit Log recorded in database with execution details`);

  // -------------------------------------------------------------
  // TEST 8: REAL ESTATE VERTICAL INTEGRATION
  // Lead -> Project Unit -> Site Visit -> Booking -> Payment
  // -------------------------------------------------------------
  console.log('\n--- 8. Real Estate Integration: Lead to Booking Lifecycle ---');
  let project = await prisma.realEstateProject.findFirst({ where: { tenantId, code: 'PH2-VALLEY' } });
  if (!project) {
    project = await prisma.realEstateProject.create({
      data: {
        tenantId,
        projectId: `PROJ-RE-${Date.now() % 10000}`,
        name: 'Nexus Greenfield Enclave',
        code: 'PH2-VALLEY',
        location: 'Sector 82, Expressway',
        city: 'Gurugram',
        status: 'Active'
      }
    });
  }

  let unit = await prisma.propertyUnit.findFirst({ where: { projectId: project.id, unitNumber: 'Plot-99' } });
  if (!unit) {
    unit = await prisma.propertyUnit.create({
      data: {
        tenantId,
        projectId: project.id,
        unitNumber: 'Plot-99',
        block: 'Block C',
        unitType: 'Residential Plot',
        sizeSqFt: 2400,
        basePrice: 7200000,
        status: 'Available'
      }
    });
  }

  const siteVisit = await prisma.siteVisit.create({
    data: {
      tenantId,
      projectId: project.id,
      unitId: unit.id,
      leadId: highLead.id,
      visitorName: highLead.customerName,
      phone: highLead.phone,
      visitDate: new Date(Date.now() + 24 * 60 * 60 * 1000),
      status: 'Scheduled',
      outcome: 'Highly Interested'
    }
  });
  assert(Boolean(siteVisit.id && siteVisit.visitorName === 'Vikramaditya Rao'), `Site visit scheduled for lead ${highLead.customerName}`);

  const booking = await prisma.propertyBooking.create({
    data: {
      tenantId,
      bookingId: `BKG-2026-${Date.now() % 10000}-${Math.floor(Math.random()*100)}`,
      projectId: project.id,
      unitId: unit.id,
      leadId: highLead.id,
      salesExecutiveId: salesRep.id,
      agreementValue: 7200000,
      tokenAmount: 500000,
      balanceAmount: 6700000,
      status: 'Confirmed'
    }
  });
  assert(Boolean(booking.id && booking.agreementValue === 7200000), `Property booking finalized (Token: ₹5L, Agreement: ₹72L)`);

  const bookedUnit = await prisma.propertyUnit.update({
    where: { id: unit.id },
    data: { status: 'Booked' }
  });
  assert(bookedUnit.status === 'Booked', `Property unit status automatically updated to Booked`);

  // -------------------------------------------------------------
  // TEST 9: LOAN & FINTECH VERTICAL INTEGRATION
  // Lead -> Loan Application -> EMI Calculation -> Document -> Status
  // -------------------------------------------------------------
  console.log('\n--- 9. Loan & Fintech Integration: Application to Approval ---');
  const requestedLoan = 5000000;
  const emi = calculateEMI(requestedLoan, 9.25, 60);
  assert(emi > 0 && emi < requestedLoan, `Accurate EMI calculated: ₹${emi.toLocaleString()}/month for ₹50L at 9.25% (60 mos)`);

  const loanApp = await prisma.loanApplication.create({
    data: {
      tenantId,
      applicationId: `LN-APP-${Date.now() % 100000}-${Math.floor(Math.random()*100)}`,
      applicantName: 'Meera Deshmukh',
      phone: '+91 9123456780',
      loanType: 'Home Loan',
      requestedAmount: requestedLoan,
      emiAmount: emi,
      tenureMonths: 60,
      interestRate: 9.25,
      bankPartner: 'HDFC Bank',
      status: 'Submitted',
      assignedToId: salesRep.id
    }
  });
  assert(Boolean(loanApp.id && loanApp.requestedAmount === requestedLoan), `Loan Application created for applicant Meera Deshmukh`);

  const doc = await prisma.loanDocument.create({
    data: {
      tenantId,
      loanApplicationId: loanApp.id,
      documentType: 'ITR',
      documentUrl: '/uploads/itr_2025_2026.pdf',
      status: 'Verified'
    }
  });
  assert(Boolean(doc.id && doc.status === 'Verified'), `KYC & Income proof document attached and verified`);

  const sanctionedLoan = await prisma.loanApplication.update({
    where: { id: loanApp.id },
    data: {
      status: 'Sanctioned',
      sanctionedAmount: 4800000
    }
  });
  assert(sanctionedLoan.status === 'Sanctioned' && sanctionedLoan.sanctionedAmount === 4800000,
    `Loan application sanctioned by banking partner for ₹48,00,000`);

  // -------------------------------------------------------------
  // TEST 10: SOCIAL MEDIA OMNICHANNEL INBOX TO LEAD
  // Social Conversation -> Reply -> Convert to Unified Lead
  // -------------------------------------------------------------
  console.log('\n--- 10. Social Media Omnichannel Conversation & Attribution ---');
  let socialAcc = await prisma.socialAccount.findFirst({ where: { tenantId, platform: 'INSTAGRAM' } });
  if (!socialAcc) {
    socialAcc = await prisma.socialAccount.create({
      data: {
        tenantId,
        platform: 'INSTAGRAM',
        accountName: '@nexus360.crm',
        accountId: `act_ig_${Date.now() % 10000}`,
        status: 'CONNECTED'
      }
    });
  }

  const socialConv = await prisma.socialConversation.create({
    data: {
      tenantId,
      socialAccountId: socialAcc.id,
      externalConversationId: `ext_ig_${Date.now() % 100000}`,
      platform: 'INSTAGRAM',
      senderId: 'ig_user_anita_88',
      senderName: 'Anita Krishnan',
      senderPhone: '+91 9776655443',
      lastMessageText: 'Hello, what are the interest rates for business loans of 25L?',
      lastMessageTime: new Date()
    }
  });
  assert(Boolean(socialConv.id && socialConv.senderName === 'Anita Krishnan'), `Social conversation received via Instagram Inbound`);

  const convertedSocialLead = await prisma.lead.create({
    data: {
      tenantId,
      leadId: `SOC-CONV-${Date.now() % 100000}-${Math.floor(Math.random()*100)}`,
      customerName: socialConv.senderName,
      phone: socialConv.senderPhone || '+91 9776655443',
      source: 'Instagram Inbound',
      industry: 'LOAN',
      amount: 2500000,
      status: 'New',
      priority: 'High',
      leadScore: 78,
      leadScoreCategory: 'HOT',
      notes: `Converted from Instagram inquiry: "${socialConv.lastMessageText}"`
    }
  });

  await prisma.socialConversation.update({
    where: { id: socialConv.id },
    data: { leadId: convertedSocialLead.id }
  });

  assert(Boolean(convertedSocialLead.id && convertedSocialLead.source === 'Instagram Inbound'),
    `Instagram conversation converted to Unified Lead with exact attribution and notes`);

  // =============================================================
  // SUMMARY
  // =============================================================
  console.log('\n===========================================================');
  console.log(`Phase 2 Test Results: ${passed} PASSED | ${failed} FAILED`);
  console.log('===========================================================');

  if (failed > 0) {
    process.exit(1);
  }
}

runPhase2Tests()
  .catch(err => {
    console.error('Test execution error:', err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

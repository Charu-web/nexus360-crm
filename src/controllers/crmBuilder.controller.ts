// src/controllers/crmBuilder.controller.ts
import { Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { TenantRequest } from '../middleware/tenant';

const prisma = new PrismaClient();

export interface IndustryPresetModule {
  key: string;
  name: string;
  singular: string;
  icon: string;
  description: string;
}

export interface IndustryCustomField {
  entityType: string;
  fieldName: string;
  fieldKey: string;
  fieldType: string;
  options?: string[];
  isRequired?: boolean;
}

export interface IndustryPipelineStage {
  name: string;
  stageKey: string;
  probability: number;
  color: string;
  closedWon?: boolean;
  closedLost?: boolean;
}

export interface IndustryBlueprint {
  key: string;
  name: string;
  description: string;
  badge: string;
  accentColor: string;
  modules: IndustryPresetModule[];
  customFields: IndustryCustomField[];
  pipelineStages: IndustryPipelineStage[];
  roles: Array<{ name: string; description: string; permissions: string[] }>;
  dashboardWidgets: Array<{ key: string; title: string; type: string }>;
  seedRecords?: Array<{ moduleKey: string; title: string; data: Record<string, any> }>;
}

export const INDUSTRY_PRESETS: Record<string, IndustryBlueprint> = {
  REAL_ESTATE: {
    key: 'REAL_ESTATE',
    name: 'Real Estate & Plot Development CRM',
    description: 'Specialized enterprise suite for builders, property developers, and plot brokers with site visit logistics, plot inventory, and construction milestone tracking.',
    badge: 'Real Estate Master',
    accentColor: '#10b981',
    modules: [
      { key: 'PROJECTS', name: 'Township Projects', singular: 'Project', icon: 'building', description: 'Master township, commercial, and residential developments' },
      { key: 'PROPERTIES', name: 'Plots & Units', singular: 'Plot/Unit', icon: 'home', description: 'Inventory of available, held, and booked plot units' },
      { key: 'SITE_VISITS', name: 'Site Visits', singular: 'Site Visit', icon: 'map-pin', description: 'Buyer property tours, transport coordination, and rating feedback' },
      { key: 'BOOKINGS', name: 'Property Bookings', singular: 'Booking', icon: 'file-text', description: 'Sale token, registry status, and payment schedules' },
      { key: 'PAYMENTS', name: 'Milestone Payments', singular: 'Payment', icon: 'credit-card', description: 'Construction-linked installment collection tracking' },
      { key: 'PROPERTY_DOCS', name: 'Property Documents', singular: 'Document', icon: 'folder', description: 'Allotment letters, 7/12 extracts, and sale deeds' }
    ],
    customFields: [
      { entityType: 'LEAD', fieldName: 'Preferred Facing', fieldKey: 'preferred_facing', fieldType: 'DROPDOWN', options: ['North', 'East', 'North-East', 'South', 'West'] },
      { entityType: 'LEAD', fieldName: 'Plot Size Required (Sq Ft)', fieldKey: 'plot_size', fieldType: 'NUMBER' },
      { entityType: 'LEAD', fieldName: 'Preferred Locality / Sector', fieldKey: 'preferred_locality', fieldType: 'TEXT' },
      { entityType: 'DEAL', fieldName: 'Registry Status', fieldKey: 'registry_status', fieldType: 'DROPDOWN', options: ['Token Agreement', 'Agreement to Sell', 'Sale Deed Executed', 'Possession Given'] },
      { entityType: 'DEAL', fieldName: 'Payment Plan Type', fieldKey: 'payment_plan', fieldType: 'DROPDOWN', options: ['Down Payment Plan', 'Construction Linked Plan', 'Flexi Plan'] }
    ],
    pipelineStages: [
      { name: 'Site Visit Planned', stageKey: 'site_visit_planned', probability: 20, color: '#3b82f6' },
      { name: 'Site Visit Completed', stageKey: 'site_visit_done', probability: 45, color: '#f59e0b' },
      { name: 'Unit Selected & Negotiation', stageKey: 'negotiation', probability: 70, color: '#8b5cf6' },
      { name: 'Booking Token Paid', stageKey: 'token_paid', probability: 85, color: '#06b6d4' },
      { name: 'Agreement Executed (Won)', stageKey: 'agreement_won', probability: 100, color: '#10b981', closedWon: true },
      { name: 'Dropped / Site Visit Rejected', stageKey: 'cancelled_lost', probability: 0, color: '#ef4444', closedLost: true }
    ],
    roles: [
      { name: 'RE_SALES_EXECUTIVE', description: 'Handles site tours, plot reservations, and buyer agreements', permissions: ['PROJECTS_VIEW', 'PROPERTIES_VIEW', 'SITE_VISITS_ALL', 'BOOKINGS_CREATE'] },
      { name: 'RE_SITE_COORDINATOR', description: 'Manages on-ground inventory inspection and customer reception', permissions: ['SITE_VISITS_ALL', 'PROPERTIES_VIEW'] }
    ],
    dashboardWidgets: [
      { key: 're_inventory_summary', title: 'Plot & Unit Inventory Breakdown', type: 'CHART' },
      { key: 're_upcoming_visits', title: 'Upcoming Weekend Site Visits', type: 'LIST' },
      { key: 're_bookings_funnel', title: 'Real Estate Sales Conversion Pipeline', type: 'METRIC' }
    ],
    seedRecords: [
      { moduleKey: 'PROJECTS', title: 'Greenfield Valley Phase 2', data: { location: 'Outer Ring Road', reraNumber: 'PRM/KA/RERA/1251/310/PR/190822', totalPlots: 120, status: 'Active' } },
      { moduleKey: 'PROPERTIES', title: 'Plot A-14 (1500 sqft, East Facing)', data: { plotNumber: 'A-14', areaSqFt: 1500, facing: 'East', basePrice: 4500000, status: 'AVAILABLE' } },
      { moduleKey: 'SITE_VISITS', title: 'Site Tour: Rahul Verma (Saturday 11 AM)', data: { customerName: 'Rahul Verma', phone: '+91 9876543210', date: '2026-09-20', status: 'CONFIRMED' } }
    ]
  },

  FINTECH_LOAN: {
    key: 'FINTECH_LOAN',
    name: 'Loans & DSA Banking Platform',
    description: 'Multi-bank direct selling agent (DSA) loan platform tracking applicant CIBIL scores, partner bank logins, sanction underwriting, and disbursals.',
    badge: 'Banking & DSA Suite',
    accentColor: '#3b82f6',
    modules: [
      { key: 'LOAN_APPLICATIONS', name: 'Loan Applications', singular: 'Loan App', icon: 'briefcase', description: 'Central tracker for Home, LAP, Business, and Personal loans' },
      { key: 'BANKS', name: 'Partner Banks & NBFCs', singular: 'Bank Partner', icon: 'dollar-sign', description: 'Lender payout matrix, branch contacts, and rate slabs' },
      { key: 'DOCUMENTS', name: 'KYC & Income Vault', singular: 'Document', icon: 'folder', description: 'PAN, Aadhaar, ITR, and bank statement verification' },
      { key: 'DISBURSEMENTS', name: 'Disbursement Tracker', singular: 'Disbursement', icon: 'check-circle', description: 'Tranche release records, UTR tracking, and commission payouts' },
      { key: 'APPLICANTS', name: 'Loan Applicants', singular: 'Applicant', icon: 'users', description: 'Borrower co-applicant profiles and financial history' }
    ],
    customFields: [
      { entityType: 'LEAD', fieldName: 'CIBIL / Credit Score', fieldKey: 'credit_score', fieldType: 'NUMBER' },
      { entityType: 'LEAD', fieldName: 'Employment Type', fieldKey: 'emp_type', fieldType: 'DROPDOWN', options: ['Salaried (MNC/Govt)', 'Salaried (Private Ltd)', 'Self-Employed Professional', 'Self-Employed Business'] },
      { entityType: 'LEAD', fieldName: 'Net Monthly In-hand Salary', fieldKey: 'monthly_salary', fieldType: 'NUMBER' },
      { entityType: 'DEAL', fieldName: 'Sanctioning Bank Partner', fieldKey: 'sanction_bank', fieldType: 'DROPDOWN', options: ['HDFC Bank', 'State Bank of India', 'ICICI Bank', 'Axis Bank', 'Bajaj Housing Finance', 'Tata Capital'] },
      { entityType: 'DEAL', fieldName: 'DSA Commission Percentage', fieldKey: 'dsa_commission_payout', fieldType: 'NUMBER' }
    ],
    pipelineStages: [
      { name: 'Lead Qualified & CIBIL Check', stageKey: 'qualified_cibil', probability: 20, color: '#3b82f6' },
      { name: 'Financial Docs Collected', stageKey: 'docs_collected', probability: 45, color: '#f59e0b' },
      { name: 'Logged In with Bank', stageKey: 'logged_in_bank', probability: 65, color: '#8b5cf6' },
      { name: 'Sanction Letter Issued', stageKey: 'sanctioned', probability: 85, color: '#06b6d4' },
      { name: 'Loan Disbursed (Won)', stageKey: 'disbursed_won', probability: 100, color: '#10b981', closedWon: true },
      { name: 'Application Rejected by Credit', stageKey: 'bank_rejected', probability: 0, color: '#ef4444', closedLost: true }
    ],
    roles: [
      { name: 'DSA_LOAN_OFFICER', description: 'Manages loan files, bank login, and applicant follow-ups', permissions: ['LOAN_APPLICATIONS_ALL', 'DOCUMENTS_ALL', 'BANKS_VIEW'] },
      { name: 'CREDIT_OPS_SPECIALIST', description: 'Collects and verifies KYC, ITR, and Bank Statements', permissions: ['DOCUMENTS_ALL', 'LOAN_APPLICATIONS_VIEW'] }
    ],
    dashboardWidgets: [
      { key: 'loan_disbursed_mtd', title: 'Disbursal Volume (Month to Date)', type: 'METRIC' },
      { key: 'loan_bank_distribution', title: 'Application Share by Bank Partner', type: 'CHART' },
      { key: 'loan_pending_sanctions', title: 'Pending Bank Sanctions', type: 'TABLE' }
    ],
    seedRecords: [
      { moduleKey: 'LOAN_APPLICATIONS', title: 'Home Loan: Vikram Malhotra (₹65L - HDFC)', data: { applicant: 'Vikram Malhotra', amount: 6500000, bank: 'HDFC Bank', type: 'Home Loan', status: 'Submitted' } },
      { moduleKey: 'BANKS', title: 'HDFC Bank - Retail Assets Desk', data: { contactPerson: 'Sandeep Khurana', email: 'sandeep@hdfcbank.com', commissionRate: '0.65%' } },
      { moduleKey: 'DOCUMENTS', title: 'Vikram Malhotra - 3 Years ITR & Form 16', data: { applicant: 'Vikram Malhotra', docType: 'ITR', verified: true } }
    ]
  },

  EDUCATION: {
    key: 'EDUCATION',
    name: 'Education & Admissions CRM',
    description: 'Comprehensive enrollment management for universities, ed-tech academies, and vocational institutes tracking student counseling and admission fee payments.',
    badge: 'Admissions & EdTech',
    accentColor: '#8b5cf6',
    modules: [
      { key: 'STUDENTS', name: 'Prospective Students', singular: 'Student', icon: 'user', description: 'Candidate database with entrance scores and educational background' },
      { key: 'COURSES', name: 'Academic Courses', singular: 'Course', icon: 'book', description: 'Degree programs, certifications, tuition fee structures, and batches' },
      { key: 'APPLICATIONS', name: 'Admission Applications', singular: 'Admission App', icon: 'award', description: 'Enrollment progress from registration to provisional acceptance' },
      { key: 'COUNSELING', name: 'Counseling Sessions', singular: 'Counseling', icon: 'calendar', description: 'One-on-one student career guidance and tele-counseling logs' },
      { key: 'FEES', name: 'Tuition Fee Payments', singular: 'Fee Payment', icon: 'credit-card', description: 'Seat confirmation tokens and installment payment receipts' }
    ],
    customFields: [
      { entityType: 'LEAD', fieldName: 'Highest Completed Qualification', fieldKey: 'highest_qualification', fieldType: 'DROPDOWN', options: ['12th Standard / HSC', 'Bachelor of Science (B.Sc)', 'Bachelor of Commerce (B.Com)', 'Bachelor of Technology (B.Tech)', 'Master Degree'] },
      { entityType: 'LEAD', fieldName: 'Target Academic Batch / Intake', fieldKey: 'target_intake', fieldType: 'DROPDOWN', options: ['Spring 2026', 'Summer 2026', 'Fall 2026', 'Winter 2026'] },
      { entityType: 'LEAD', fieldName: 'Entrance / Aptitude Score', fieldKey: 'entrance_score', fieldType: 'NUMBER' },
      { entityType: 'DEAL', fieldName: 'Enrolled Program Code', fieldKey: 'program_code', fieldType: 'TEXT' },
      { entityType: 'DEAL', fieldName: 'Scholarship Discount (₹)', fieldKey: 'scholarship_amount', fieldType: 'NUMBER' }
    ],
    pipelineStages: [
      { name: 'Inquiry Received', stageKey: 'inquiry_received', probability: 15, color: '#3b82f6' },
      { name: 'Counseling Call Completed', stageKey: 'counseling_done', probability: 35, color: '#f59e0b' },
      { name: 'Application & Docs Submitted', stageKey: 'app_submitted', probability: 60, color: '#8b5cf6' },
      { name: 'Offer Letter Issued', stageKey: 'offer_issued', probability: 85, color: '#06b6d4' },
      { name: 'Seat Fee Paid (Enrolled Won)', stageKey: 'enrolled_won', probability: 100, color: '#10b981', closedWon: true },
      { name: 'Offer Declined / Dropped', stageKey: 'declined_lost', probability: 0, color: '#ef4444', closedLost: true }
    ],
    roles: [
      { name: 'ACADEMIC_COUNSELOR', description: 'Conducts counseling sessions and follows up with prospective students', permissions: ['STUDENTS_ALL', 'APPLICATIONS_ALL', 'COUNSELING_ALL'] },
      { name: 'ADMISSIONS_COORDINATOR', description: 'Reviews academic certificates and issues provisional admission letters', permissions: ['APPLICATIONS_ALL', 'FEES_VIEW', 'DOCUMENTS_ALL'] }
    ],
    dashboardWidgets: [
      { key: 'edu_admissions_counter', title: 'Confirmed Enrollments (Current Batch)', type: 'METRIC' },
      { key: 'edu_course_demand', title: 'Applications by Course Program', type: 'CHART' },
      { key: 'edu_counselor_leaderboard', title: 'Counselor Conversion Performance', type: 'TABLE' }
    ],
    seedRecords: [
      { moduleKey: 'STUDENTS', title: 'Aarav Gupta (Target: B.Tech Computer Science)', data: { studentName: 'Aarav Gupta', email: 'aarav.gupta@student.in', phone: '+91 9123456780', qualification: '12th Standard' } },
      { moduleKey: 'COURSES', title: 'B.Tech in Artificial Intelligence & Data Science', data: { duration: '4 Years', annualFee: 225000, seatsTotal: 60, seatsAvailable: 18 } },
      { moduleKey: 'APPLICATIONS', title: 'Aarav Gupta - Provisional Admission Form', data: { student: 'Aarav Gupta', program: 'B.Tech AI', status: 'Offer Letter Issued' } }
    ]
  },

  RECRUITMENT: {
    key: 'RECRUITMENT',
    name: 'Recruitment & Staffing CRM',
    description: 'Applicant tracking and talent staffing platform managing client requisitions, candidate resumes, interview stages, and joining onboarding.',
    badge: 'Staffing & ATS Platform',
    accentColor: '#f59e0b',
    modules: [
      { key: 'CANDIDATES', name: 'Candidate Database', singular: 'Candidate', icon: 'users', description: 'Talent profiles, skills taxonomy, resume vault, and current CTC' },
      { key: 'JOBS', name: 'Job Requisitions', singular: 'Job Opening', icon: 'briefcase', description: 'Client openings, required skills, salary bands, and headcounts' },
      { key: 'INTERVIEWS', name: 'Interview Schedules', singular: 'Interview', icon: 'calendar', description: 'Technical rounds, feedback ratings, and meeting links' },
      { key: 'OFFERS', name: 'Offers & Placement', singular: 'Offer', icon: 'award', description: 'CTC breakups, offer rollout dates, and candidate acceptance' },
      { key: 'CLIENTS', name: 'Hiring Companies', singular: 'Corporate Client', icon: 'building', description: 'Enterprise hiring accounts and commission fee agreements' }
    ],
    customFields: [
      { entityType: 'LEAD', fieldName: 'Primary Tech Stack / Skills', fieldKey: 'primary_skills', fieldType: 'TEXT' },
      { entityType: 'LEAD', fieldName: 'Total Experience (Years)', fieldKey: 'experience_years', fieldType: 'NUMBER' },
      { entityType: 'LEAD', fieldName: 'Notice Period (Days)', fieldKey: 'notice_period_days', fieldType: 'NUMBER' },
      { entityType: 'LEAD', fieldName: 'Current CTC (LPA)', fieldKey: 'current_ctc', fieldType: 'NUMBER' },
      { entityType: 'DEAL', fieldName: 'Offered Annual CTC (LPA)', fieldKey: 'offered_ctc', fieldType: 'NUMBER' },
      { entityType: 'DEAL', fieldName: 'Staffing Agency Commission Rate (%)', fieldKey: 'recruitment_fee_percentage', fieldType: 'NUMBER' }
    ],
    pipelineStages: [
      { name: 'Profile Sourced & Screened', stageKey: 'sourced_screened', probability: 20, color: '#3b82f6' },
      { name: 'Shortlisted by Hiring Manager', stageKey: 'client_shortlisted', probability: 40, color: '#f59e0b' },
      { name: 'Technical / Panel Interview', stageKey: 'technical_interview', probability: 65, color: '#8b5cf6' },
      { name: 'HR Offer Extended', stageKey: 'offer_extended', probability: 85, color: '#06b6d4' },
      { name: 'Candidate Joined Company (Won)', stageKey: 'candidate_joined_won', probability: 100, color: '#10b981', closedWon: true },
      { name: 'Candidate Backed Out / Client Rejected', stageKey: 'backout_rejected_lost', probability: 0, color: '#ef4444', closedLost: true }
    ],
    roles: [
      { name: 'TALENT_RECRUITER', description: 'Sources profiles, screens candidates, and schedules client interviews', permissions: ['CANDIDATES_ALL', 'INTERVIEWS_ALL', 'JOBS_VIEW'] },
      { name: 'ACCOUNT_MANAGER_STAFFING', description: 'Manages enterprise client requisitions and offer negotiations', permissions: ['JOBS_ALL', 'OFFERS_ALL', 'CLIENTS_ALL'] }
    ],
    dashboardWidgets: [
      { key: 'rec_active_openings', title: 'Open Job Requisitions', type: 'METRIC' },
      { key: 'rec_interviews_this_week', title: 'Client Interviews Scheduled This Week', type: 'LIST' },
      { key: 'rec_placement_revenue', title: 'Placement Commission Revenue', type: 'CHART' }
    ],
    seedRecords: [
      { moduleKey: 'CANDIDATES', title: 'Sneha Kulkarni - Senior Full Stack Engineer (7 Yrs)', data: { name: 'Sneha Kulkarni', skills: 'React, Node.js, AWS, Postgres', currentCtc: 2400000, noticePeriod: 30 } },
      { moduleKey: 'JOBS', title: 'Lead Full Stack Architect (₹35L - ₹42L)', data: { client: 'FinScale Technologies', experienceRequired: '6-9 Years', openings: 2, status: 'Active' } },
      { moduleKey: 'INTERVIEWS', title: 'Sneha Kulkarni - Final System Design Round (Friday 3 PM)', data: { candidate: 'Sneha Kulkarni', client: 'FinScale Technologies', round: 'System Design', status: 'Scheduled' } }
    ]
  }
};

/**
 * GET /api/v1/crm-builder/presets
 * Returns available industry blueprints.
 */
export async function getIndustryPresets(_req: TenantRequest, res: Response) {
  return res.json({ success: true, presets: INDUSTRY_PRESETS });
}

/**
 * GET /api/v1/crm-builder/active-blueprint
 * Returns the currently active blueprint and configured modules for this workspace.
 */
export async function getActiveBlueprint(req: TenantRequest, res: Response) {
  try {
    const tenantId = req.tenantId!;
    const tenant = await prisma.tenant.findUnique({
      where: { id: tenantId },
      include: {
        modules: { where: { enabled: true }, orderBy: { sortOrder: 'asc' } },
        pipelines: { include: { stages: { orderBy: { order: 'asc' } } } },
        customFields: { orderBy: { displayOrder: 'asc' } }
      }
    });

    if (!tenant) {
      return res.status(404).json({ success: false, message: 'Tenant not found' });
    }

    return res.json({
      success: true,
      activeTemplate: tenant.template,
      industry: tenant.industry,
      modules: tenant.modules,
      pipelines: tenant.pipelines,
      customFields: tenant.customFields
    });
  } catch (err: any) {
    return res.status(500).json({ success: false, message: err.message });
  }
}

/**
 * POST /api/v1/crm-builder/apply-preset
 * Applies an industry blueprint to the current tenant workspace with robust persistence.
 * Safe application:
 * - Detects existing modules & reuses them without breaking data
 * - Does not overwrite existing customer records or leads
 * - Upserts missing custom fields & provisions dedicated pipeline
 * - Seeds demo records for new industry modules into CustomRecord
 */
export async function applyIndustryPreset(req: TenantRequest, res: Response) {
  try {
    const tenantId = req.tenantId!;
    const { presetKey } = req.body;

    const preset = INDUSTRY_PRESETS[presetKey];
    if (!preset) {
      return res.status(400).json({ success: false, message: `Unknown preset: ${presetKey}` });
    }

    const appliedModules: string[] = [];
    const appliedFields: string[] = [];

    // 1. Enable / Upsert Industry Modules
    for (let i = 0; i < preset.modules.length; i++) {
      const mod = preset.modules[i];
      const existing = await prisma.tenantModule.findUnique({
        where: { tenantId_moduleKey: { tenantId, moduleKey: mod.key } }
      });

      if (existing) {
        await prisma.tenantModule.update({
          where: { id: existing.id },
          data: {
            enabled: true,
            name: mod.name,
            singularName: mod.singular,
            description: mod.description,
            icon: mod.icon
          }
        });
      } else {
        await prisma.tenantModule.create({
          data: {
            tenantId,
            moduleKey: mod.key,
            name: mod.name,
            singularName: mod.singular,
            description: mod.description,
            icon: mod.icon,
            isCustom: true,
            sortOrder: 10 + i,
            enabled: true
          }
        });
      }
      appliedModules.push(mod.name);
    }

    // 2. Provision or Reuse Pipeline & Stages
    let pipeline = await prisma.pipeline.findFirst({
      where: { tenantId, name: `${preset.name} Pipeline` }
    });

    if (!pipeline) {
      pipeline = await prisma.pipeline.create({
        data: {
          tenantId,
          name: `${preset.name} Pipeline`,
          isDefault: false
        }
      });

      for (let i = 0; i < preset.pipelineStages.length; i++) {
        const st = preset.pipelineStages[i];
        await prisma.pipelineStage.create({
          data: {
            tenantId,
            pipelineId: pipeline.id,
            name: st.name,
            stageKey: st.stageKey,
            order: i + 1,
            probability: st.probability,
            color: st.color,
            closedWon: !!st.closedWon,
            closedLost: !!st.closedLost
          }
        });
      }
    }

    // 3. Provision Custom Fields safely
    for (let i = 0; i < preset.customFields.length; i++) {
      const f = preset.customFields[i];
      await prisma.customField.upsert({
        where: { tenantId_entityType_fieldKey: { tenantId, entityType: f.entityType, fieldKey: f.fieldKey } },
        update: {
          fieldName: f.fieldName,
          fieldType: f.fieldType,
          options: f.options ? JSON.stringify(f.options) : null
        },
        create: {
          tenantId,
          entityType: f.entityType,
          fieldName: f.fieldName,
          fieldKey: f.fieldKey,
          fieldType: f.fieldType,
          options: f.options ? JSON.stringify(f.options) : null,
          displayOrder: 20 + i,
          isVisible: true,
          isEditable: true
        }
      });
      appliedFields.push(f.fieldName);
    }

    // 4. Provision Dashboard Widgets
    for (let i = 0; i < preset.dashboardWidgets.length; i++) {
      const w = preset.dashboardWidgets[i];
      const existingWidget = await prisma.dashboardWidget.findFirst({
        where: { tenantId, widgetKey: w.key }
      });
      if (!existingWidget) {
        await prisma.dashboardWidget.create({
          data: {
            tenantId,
            widgetKey: w.key,
            title: w.title,
            type: w.type,
            order: i + 1,
            visible: true
          }
        });
      }
    }

    // 5. Seed Initial Domain Records into CustomRecord (if not already seeded)
    if (preset.seedRecords && preset.seedRecords.length > 0) {
      for (const rec of preset.seedRecords) {
        const existingRec = await prisma.customRecord.findFirst({
          where: { tenantId, moduleKey: rec.moduleKey, title: rec.title }
        });
        if (!existingRec) {
          await prisma.customRecord.create({
            data: {
              tenantId,
              moduleKey: rec.moduleKey,
              recordId: `REC-${Date.now().toString().slice(-4)}-${Math.floor(Math.random() * 900 + 100)}`,
              title: rec.title,
              data: JSON.stringify(rec.data)
            }
          });
        }
      }
    }

    // 6. Update Tenant Template setting
    await prisma.tenant.update({
      where: { id: tenantId },
      data: { template: preset.name, industry: presetKey }
    });

    // 7. Record an Audit Log
    await prisma.auditLog.create({
      data: {
        tenantId,
        action: 'APPLY_BLUEPRINT',
        entity: 'Tenant',
        entityId: tenantId,
        details: JSON.stringify({ presetKey, presetName: preset.name, appliedModules, appliedFields })
      }
    });

    return res.json({
      success: true,
      message: `Blueprint "${preset.name}" applied successfully!`,
      blueprint: {
        key: presetKey,
        name: preset.name,
        modulesCount: appliedModules.length,
        fieldsCount: appliedFields.length,
        pipelineId: pipeline.id
      }
    });
  } catch (err: any) {
    console.error('Error applying blueprint:', err);
    return res.status(500).json({ success: false, message: err.message });
  }
}

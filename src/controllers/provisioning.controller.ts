import { Request, Response, NextFunction } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import { z } from 'zod';
import { prisma } from '../lib/db';
import { config } from '../config';
import { AppError } from '../middleware/errorHandler';
import { recordAuditLog } from '../middleware/auditLogger';
import { supabaseAdmin, supabase, isSupabaseConfigured } from '../lib/supabase';

// Provisioning Validation Schema
const provisionSchema = z.object({
  // Account
  fullName: z.string().min(2, 'Full name is required'),
  email: z.string().email('Invalid email address'),
  phone: z.string().min(5, 'Phone number is required'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  // Company
  companyName: z.string().min(2, 'Company name is required'),
  companySlug: z.string().optional(),
  industry: z.string().optional().default('Generic'),
  companySize: z.string().optional().default('1-10'),
  country: z.string().optional().default('India'),
  city: z.string().optional(),
  website: z.string().optional(),
  // CRM Builder Customization
  template: z.string().optional().default('GENERIC'), // GENERIC, REAL_ESTATE, EDUCATION, AGENCY, IT_SERVICES, HEALTHCARE, FINANCE, RECRUITMENT, MANUFACTURING, ECOMMERCE
  enabledModules: z.array(z.string()).optional().default(['LEADS', 'CONTACTS', 'CUSTOMERS', 'DEALS', 'TASKS', 'FOLLOWUPS', 'REPORTS']),
  pipelineName: z.string().optional().default('Standard Sales Pipeline'),
  stages: z.array(z.object({
    name: z.string(),
    color: z.string().optional(),
    probability: z.number().optional(),
    closedWon: z.boolean().optional(),
    closedLost: z.boolean().optional(),
  })).optional(),
  customFields: z.array(z.object({
    fieldName: z.string(),
    fieldType: z.string(),
    entityType: z.string().optional().default('LEAD'),
    options: z.array(z.string()).optional(),
    isRequired: z.boolean().optional(),
  })).optional(),
  // Plan
  plan: z.string().optional().default('STARTER'), // FREE, STARTER, PRO, BUSINESS, ENTERPRISE
});

// Built-in Templates Registry (10 Templates)
export const CRM_TEMPLATES: Record<string, { key: string; name: string; description: string; stages: any[]; fields: any[]; modules: string[] }> = {
  GENERIC: {
    key: 'GENERIC',
    name: 'Generic CRM',
    description: 'Universal CRM setup suitable for all business types and general sales operations.',
    modules: ['LEADS', 'CONTACTS', 'CUSTOMERS', 'DEALS', 'TASKS', 'FOLLOWUPS', 'REPORTS'],
    stages: [
      { name: 'New Lead', stageKey: 'new', order: 1, color: '#3b82f6', probability: 10 },
      { name: 'Contacted', stageKey: 'contacted', order: 2, color: '#f59e0b', probability: 30 },
      { name: 'Qualified', stageKey: 'qualified', order: 3, color: '#8b5cf6', probability: 50 },
      { name: 'Proposal Sent', stageKey: 'proposal', order: 4, color: '#06b6d4', probability: 75 },
      { name: 'Closed Won', stageKey: 'won', order: 5, color: '#10b981', probability: 100, closedWon: true },
      { name: 'Closed Lost', stageKey: 'lost', order: 6, color: '#ef4444', probability: 0, closedLost: true },
    ],
    fields: [
      { fieldName: 'Lead Rating', fieldKey: 'lead_rating', fieldType: 'DROPDOWN', options: ['Hot', 'Warm', 'Cold'] },
      { fieldName: 'Estimated Revenue', fieldKey: 'estimated_revenue', fieldType: 'CURRENCY' },
    ],
  },
  REAL_ESTATE: {
    key: 'REAL_ESTATE',
    name: 'Real Estate CRM',
    description: 'Tailored for Property Developers, Agents, and Real Estate Consultancies.',
    modules: ['LEADS', 'CONTACTS', 'CUSTOMERS', 'DEALS', 'TASKS', 'FOLLOWUPS', 'REPORTS', 'SERVICES'],
    stages: [
      { name: 'New Inquiry', stageKey: 'new', order: 1, color: '#3b82f6', probability: 10 },
      { name: 'Site Visit Scheduled', stageKey: 'site_visit', order: 2, color: '#f59e0b', probability: 35 },
      { name: 'Negotiation', stageKey: 'negotiation', order: 3, color: '#8b5cf6', probability: 60 },
      { name: 'Booking Confirmed', stageKey: 'booked', order: 4, color: '#10b981', probability: 100, closedWon: true },
      { name: 'Cancelled', stageKey: 'cancelled', order: 5, color: '#ef4444', probability: 0, closedLost: true },
    ],
    fields: [
      { fieldName: 'Property Type', fieldKey: 'property_type', fieldType: 'DROPDOWN', options: ['Apartment', 'Villa', 'Plot', 'Commercial'] },
      { fieldName: 'Max Budget (INR)', fieldKey: 'max_budget', fieldType: 'CURRENCY' },
      { fieldName: 'Preferred Location', fieldKey: 'preferred_location', fieldType: 'TEXT' },
    ],
  },
  EDUCATION: {
    key: 'EDUCATION',
    name: 'Education & Admissions CRM',
    description: 'Optimized for Schools, Colleges, Universities, and EdTech Platforms.',
    modules: ['LEADS', 'CONTACTS', 'CUSTOMERS', 'DEALS', 'TASKS', 'FOLLOWUPS', 'REPORTS'],
    stages: [
      { name: 'New Application', stageKey: 'new', order: 1, color: '#3b82f6', probability: 15 },
      { name: 'Counselling Done', stageKey: 'counselled', order: 2, color: '#8b5cf6', probability: 45 },
      { name: 'Documents Verified', stageKey: 'doc_verified', order: 3, color: '#06b6d4', probability: 75 },
      { name: 'Admission Confirmed', stageKey: 'admitted', order: 4, color: '#10b981', probability: 100, closedWon: true },
      { name: 'Dropped', stageKey: 'dropped', order: 5, color: '#ef4444', probability: 0, closedLost: true },
    ],
    fields: [
      { fieldName: 'Course Interested', fieldKey: 'course', fieldType: 'DROPDOWN', options: ['B.Tech', 'MBA', 'BBA', 'Data Science', 'Law'] },
      { fieldName: 'Academic Score (%)', fieldKey: 'score', fieldType: 'NUMBER' },
    ],
  },
  AGENCY: {
    key: 'AGENCY',
    name: 'Marketing & Digital Agency CRM',
    description: 'Ideal for Ad Agencies, Software Consultancies, and Freelancers.',
    modules: ['LEADS', 'CONTACTS', 'CUSTOMERS', 'DEALS', 'TASKS', 'PROJECTS', 'SERVICES', 'REPORTS'],
    stages: [
      { name: 'Inquiry Lead', stageKey: 'new', order: 1, color: '#3b82f6', probability: 10 },
      { name: 'Discovery Call', stageKey: 'discovery', order: 2, color: '#f59e0b', probability: 30 },
      { name: 'Proposal Sent', stageKey: 'proposal', order: 3, color: '#8b5cf6', probability: 65 },
      { name: 'Contract Signed', stageKey: 'signed', order: 4, color: '#10b981', probability: 100, closedWon: true },
      { name: 'Lost Deal', stageKey: 'lost', order: 5, color: '#ef4444', probability: 0, closedLost: true },
    ],
    fields: [
      { fieldName: 'Project Scope', fieldKey: 'project_scope', fieldType: 'LONG_TEXT' },
      { fieldName: 'Monthly Retainer', fieldKey: 'monthly_retainer', fieldType: 'CURRENCY' },
    ],
  },
  IT_SERVICES: {
    key: 'IT_SERVICES',
    name: 'IT Services CRM',
    description: 'Designed for Managed Service Providers, SaaS vendor sales, and tech firms.',
    modules: ['LEADS', 'CONTACTS', 'CUSTOMERS', 'DEALS', 'TASKS', 'PROJECTS', 'SERVICES', 'REPORTS'],
    stages: [
      { name: 'Lead Qualified', stageKey: 'new', order: 1, color: '#3b82f6', probability: 20 },
      { name: 'Technical Demo', stageKey: 'demo', order: 2, color: '#f59e0b', probability: 40 },
      { name: 'Proof of Concept (PoC)', stageKey: 'poc', order: 3, color: '#8b5cf6', probability: 70 },
      { name: 'SLA Agreed', stageKey: 'sla', order: 4, color: '#10b981', probability: 100, closedWon: true },
    ],
    fields: [
      { fieldName: 'Current Tech Stack', fieldKey: 'tech_stack', fieldType: 'TEXT' },
      { fieldName: 'Cloud Provider', fieldKey: 'cloud_provider', fieldType: 'DROPDOWN', options: ['AWS', 'Azure', 'GCP', 'On-Premise'] },
    ],
  },
  HEALTHCARE: {
    key: 'HEALTHCARE',
    name: 'Healthcare CRM',
    description: 'Tailored for Hospitals, Clinics, Medical Equipment Suppliers, and Labs.',
    modules: ['LEADS', 'CONTACTS', 'CUSTOMERS', 'TASKS', 'FOLLOWUPS', 'SERVICES', 'REPORTS'],
    stages: [
      { name: 'New Patient Inquiry', stageKey: 'new', order: 1, color: '#3b82f6', probability: 20 },
      { name: 'Consultation Scheduled', stageKey: 'consultation', order: 2, color: '#f59e0b', probability: 50 },
      { name: 'Treatment Started', stageKey: 'treatment', order: 3, color: '#10b981', probability: 100, closedWon: true },
    ],
    fields: [
      { fieldName: 'Specialization Needed', fieldKey: 'specialization', fieldType: 'DROPDOWN', options: ['Cardiology', 'Orthopedics', 'Dental', 'General'] },
      { fieldName: 'Insurance Provider', fieldKey: 'insurance', fieldType: 'TEXT' },
    ],
  },
  FINANCE: {
    key: 'FINANCE',
    name: 'Finance & Banking CRM',
    description: 'Ideal for Loan DSA, Financial Advisors, Wealth Managers, and Accounting Firms.',
    modules: ['LEADS', 'CONTACTS', 'CUSTOMERS', 'DEALS', 'TASKS', 'FOLLOWUPS', 'REPORTS'],
    stages: [
      { name: 'Lead Received', stageKey: 'new', order: 1, color: '#3b82f6', probability: 15 },
      { name: 'CIBIL / Credit Check', stageKey: 'credit_check', order: 2, color: '#f59e0b', probability: 40 },
      { name: 'File Sanctioned', stageKey: 'sanctioned', order: 3, color: '#8b5cf6', probability: 80 },
      { name: 'Disbursed', stageKey: 'disbursed', order: 4, color: '#10b981', probability: 100, closedWon: true },
      { name: 'Rejected File', stageKey: 'rejected', order: 5, color: '#ef4444', probability: 0, closedLost: true },
    ],
    fields: [
      { fieldName: 'Loan Amount Required', fieldKey: 'loan_amount', fieldType: 'CURRENCY' },
      { fieldName: 'CIBIL Score', fieldKey: 'cibil_score', fieldType: 'NUMBER' },
    ],
  },
  RECRUITMENT: {
    key: 'RECRUITMENT',
    name: 'Recruitment & Staffing CRM',
    description: 'Tailored for HR agencies, headhunters, and staffing firms.',
    modules: ['LEADS', 'CONTACTS', 'CUSTOMERS', 'DEALS', 'TASKS', 'HRMS', 'REPORTS'],
    stages: [
      { name: 'Candidate Sourced', stageKey: 'sourced', order: 1, color: '#3b82f6', probability: 20 },
      { name: 'Interview Scheduled', stageKey: 'interview', order: 2, color: '#f59e0b', probability: 50 },
      { name: 'Offer Sent', stageKey: 'offer', order: 3, color: '#8b5cf6', probability: 80 },
      { name: 'Joined', stageKey: 'joined', order: 4, color: '#10b981', probability: 100, closedWon: true },
    ],
    fields: [
      { fieldName: 'Current CTC (LPA)', fieldKey: 'current_ctc', fieldType: 'NUMBER' },
      { fieldName: 'Notice Period (Days)', fieldKey: 'notice_period', fieldType: 'NUMBER' },
    ],
  },
  MANUFACTURING: {
    key: 'MANUFACTURING',
    name: 'Manufacturing & B2B CRM',
    description: 'Tailored for industrial suppliers, B2B manufacturers, and distributors.',
    modules: ['LEADS', 'CONTACTS', 'CUSTOMERS', 'DEALS', 'TASKS', 'PROJECTS', 'REPORTS'],
    stages: [
      { name: 'RFQ Received', stageKey: 'rfq', order: 1, color: '#3b82f6', probability: 15 },
      { name: 'Quotation Sent', stageKey: 'quote', order: 2, color: '#f59e0b', probability: 45 },
      { name: 'Sample Approved', stageKey: 'sample', order: 3, color: '#8b5cf6', probability: 75 },
      { name: 'PO Received', stageKey: 'po_received', order: 4, color: '#10b981', probability: 100, closedWon: true },
    ],
    fields: [
      { fieldName: 'Minimum Order Qty', fieldKey: 'moq', fieldType: 'NUMBER' },
      { fieldName: 'Industry Sector', fieldKey: 'industry_sector', fieldType: 'TEXT' },
    ],
  },
  ECOMMERCE: {
    key: 'ECOMMERCE',
    name: 'E-commerce & Retail CRM',
    description: 'Tailored for D2C brands, online sellers, and retail businesses.',
    modules: ['LEADS', 'CONTACTS', 'CUSTOMERS', 'DEALS', 'TASKS', 'CAMPAIGNS', 'REPORTS'],
    stages: [
      { name: 'Cart Abandoned', stageKey: 'cart', order: 1, color: '#f59e0b', probability: 25 },
      { name: 'Remarketing Contacted', stageKey: 'remarketed', order: 2, color: '#8b5cf6', probability: 60 },
      { name: 'Order Placed', stageKey: 'ordered', order: 3, color: '#10b981', probability: 100, closedWon: true },
    ],
    fields: [
      { fieldName: 'Preferred Category', fieldKey: 'category', fieldType: 'DROPDOWN', options: ['Electronics', 'Fashion', 'Home & Living', 'Beauty'] },
      { fieldName: 'Total Orders', fieldKey: 'order_count', fieldType: 'NUMBER' },
    ],
  },
};

// 1. GET /api/v1/templates
export const getCRMTemplates = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    res.status(200).json({
      success: true,
      templates: Object.values(CRM_TEMPLATES),
    });
  } catch (error) {
    next(error);
  }
};

// 2. POST /api/v1/provision: Transactional Provisioning Engine (Steps 1-17)
export const provisionTenantCRM = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const data = provisionSchema.parse(req.body);

    // Check duplicate user email
    const existingUser = await prisma.user.findFirst({
      where: { email: data.email.toLowerCase().trim() },
    });
    if (existingUser) {
      throw new AppError('An account with this email address already exists.', 409);
    }

    // Step 2: Generate unique tenant slug
    let baseSlug = (data.companySlug || data.companyName)
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');
    if (!baseSlug) baseSlug = 'workspace-' + Date.now();
    let slug = baseSlug;
    let counter = 1;
    while (await prisma.tenant.findUnique({ where: { slug } })) {
      slug = `${baseSlug}-${counter}`;
      counter++;
    }

    const trialEndsAt = new Date(Date.now() + 14 * 24 * 60 * 60 * 1000);
    const hashedPassword = await bcrypt.hash(data.password, 10);

    // Resolve template preset
    const presetKey = (data.template || 'GENERIC').toUpperCase();
    const preset = CRM_TEMPLATES[presetKey] || CRM_TEMPLATES.GENERIC;

    // Resolve plan
    const requestedPlanName = (data.plan || 'STARTER').toUpperCase();
    const targetPlan = await prisma.plan.findUnique({ where: { name: requestedPlanName } })
      || await prisma.plan.findUnique({ where: { name: 'FREE' } });

    if (!targetPlan) {
      throw new AppError('Invalid SaaS plan specified.', 400);
    }

    // EXECUTE ALL 17 PROVISIONING STEPS INSIDE A SINGLE TRANSACTION
    const result = await prisma.$transaction(async (tx) => {
      // Step 1 & 2: Create Tenant
      const tenant = await tx.tenant.create({
        data: {
          name: data.companyName,
          slug,
          status: 'TRIAL',
          industry: data.industry || preset.name,
          companySize: data.companySize,
          country: data.country,
          city: data.city,
          website: data.website,
          template: preset.name,
          trialEndsAt,
        },
      });

      // Step 3: Create Tenant Admin role
      const adminRole = await tx.role.create({
        data: {
          tenantId: tenant.id,
          name: 'TENANT_ADMIN',
          description: 'Company Workspace Administrator',
          permissions: JSON.stringify(['*']),
          isDefault: true,
        },
      });

      // Step 5: Create Default Roles
      const managerRole = await tx.role.create({
        data: {
          tenantId: tenant.id,
          name: 'MANAGER',
          description: 'Sales & Support Manager',
          permissions: JSON.stringify(['LEADS_VIEW', 'LEADS_CREATE', 'LEADS_EDIT', 'CUSTOMERS_VIEW', 'CUSTOMERS_CREATE', 'CUSTOMERS_EDIT', 'DEALS_VIEW', 'DEALS_CREATE', 'DEALS_EDIT', 'REPORTS_VIEW']),
        },
      });

      const salesRole = await tx.role.create({
        data: {
          tenantId: tenant.id,
          name: 'SALES',
          description: 'Sales Agent',
          permissions: JSON.stringify(['LEADS_VIEW', 'LEADS_CREATE', 'LEADS_EDIT', 'DEALS_VIEW', 'DEALS_CREATE']),
        },
      });

      const supportRole = await tx.role.create({
        data: {
          tenantId: tenant.id,
          name: 'SUPPORT',
          description: 'Support Specialist',
          permissions: JSON.stringify(['CUSTOMERS_VIEW', 'SERVICES_VIEW', 'SERVICES_CREATE']),
        },
      });

      // Step 4: Create Workspace Owner User
      let supabaseUserId: string | null = null;
      if (isSupabaseConfigured()) {
        try {
          const { data: adminAuthData, error: adminErr } = await supabaseAdmin.auth.admin.createUser({
            email: data.email.toLowerCase().trim(),
            password: data.password,
            email_confirm: true,
            user_metadata: {
              full_name: data.fullName,
              tenant_id: tenant.id,
              role_name: 'TENANT_ADMIN',
            },
          });
          if (!adminErr && adminAuthData.user) {
            supabaseUserId = adminAuthData.user.id;
          }
        } catch (err: any) {
          console.warn('[Provision] Supabase Auth createUser warning:', err.message || err);
        }
      }

      const user = await tx.user.create({
        data: {
          ...(supabaseUserId ? { id: supabaseUserId } : {}),
          tenantId: tenant.id,
          email: data.email.toLowerCase().trim(),
          password: hashedPassword,
          fullName: data.fullName,
          phone: data.phone,
          department: 'Executive Management',
          designation: 'Workspace Owner',
          roleId: adminRole.id,
          isActive: true,
        },
        include: { role: true },
      });

      // Step 6: Create Subscription
      const subscription = await tx.subscription.create({
        data: {
          tenantId: tenant.id,
          planId: targetPlan.id,
          status: 'TRIAL',
          trialEndsAt,
        },
      });

      // Step 7: Create Usage Record
      await tx.usage.create({
        data: {
          tenantId: tenant.id,
          userCount: 1,
          leadCount: 0,
          customerCount: 0,
          dealCount: 0,
        },
      });

      // Step 8: Enable Selected Modules
      const modulesToEnable = data.enabledModules && data.enabledModules.length > 0
        ? data.enabledModules
        : preset.modules;

      for (const moduleKey of modulesToEnable) {
        await tx.tenantModule.create({
          data: { tenantId: tenant.id, moduleKey: moduleKey.toUpperCase(), enabled: true },
        });
      }

      // Step 9, 10, 11: Create Template Pipeline & Stages
      const stagesToCreate = data.stages && data.stages.length > 0 ? data.stages : preset.stages;
      const pipeline = await tx.pipeline.create({
        data: {
          tenantId: tenant.id,
          name: data.pipelineName || (preset.name + ' Pipeline'),
          isDefault: true,
          stages: {
            create: stagesToCreate.map((s: any, idx: number) => ({
              tenantId: tenant.id,
              name: s.name,
              stageKey: s.stageKey || s.name.toLowerCase().replace(/[^a-z0-9]+/g, '_'),
              order: idx + 1,
              color: s.color || '#3b82f6',
              probability: s.probability ?? 20,
              closedWon: s.closedWon ?? false,
              closedLost: s.closedLost ?? false,
            })),
          },
        },
        include: { stages: true },
      });

      // Step 12: Create Custom Fields
      const fieldsToCreate = data.customFields && data.customFields.length > 0 ? data.customFields : preset.fields;
      for (const f of fieldsToCreate) {
        const fieldKey = f.fieldName.toLowerCase().replace(/[^a-z0-9]+/g, '_');
        await tx.customField.create({
          data: {
            tenantId: tenant.id,
            entityType: (f.entityType || 'LEAD').toUpperCase(),
            fieldName: f.fieldName,
            fieldKey,
            fieldType: (f.fieldType || 'TEXT').toUpperCase(),
            options: f.options ? JSON.stringify(f.options) : null,
            isRequired: f.isRequired ?? false,
          },
        });
      }

      // Step 13: Create Default Settings
      const defaultSettings = [
        { key: 'company_name', value: data.companyName, category: 'General', description: 'Company Name' },
        { key: 'support_email', value: data.email, category: 'General', description: 'Support Contact Email' },
        { key: 'currency', value: 'INR', category: 'General', description: 'Default Workspace Currency' },
        { key: 'timezone', value: 'Asia/Kolkata', category: 'General', description: 'Default Timezone' },
      ];
      for (const s of defaultSettings) {
        await tx.systemSetting.upsert({
          where: { key: s.key },
          update: { value: s.value },
          create: s,
        });
      }

      // Step 14: Create Default Automation Rules
      await tx.automationRule.create({
        data: {
          tenantId: tenant.id,
          name: 'Auto-assign New Website Leads',
          triggerEvent: 'lead.created',
          conditions: JSON.stringify([{ field: 'source', operator: 'equals', value: 'Website' }]),
          actions: JSON.stringify([{ actionType: 'create_task', params: { title: 'Follow up on website lead' } }]),
          isActive: true,
        },
      });

      // Step 15: Generate API Key
      const apiKeyRaw = 'sk_live_' + crypto.randomBytes(24).toString('hex');
      const keyHash = crypto.createHash('sha256').update(apiKeyRaw).digest('hex');
      await tx.apiKey.create({
        data: {
          tenantId: tenant.id,
          name: 'Primary Live API Key',
          keyPrefix: apiKeyRaw.substring(0, 12),
          keyHash,
          permissions: JSON.stringify(['*']),
        },
      });

      // Step 16: Create Audit Record
      await tx.auditLog.create({
        data: {
          tenantId: tenant.id,
          userId: user.id,
          action: 'PROVISION_TENANT',
          entity: 'Tenant',
          entityId: tenant.id,
          details: `Workspace '${tenant.name}' provisioned with template '${preset.name}' and plan '${targetPlan.name}'.`,
          ipAddress: req.ip || '127.0.0.1',
          userAgent: req.headers['user-agent'] || 'Provisioning API',
        },
      });

      return { tenant, user, apiKeyRaw, subscription, targetPlan };
    });

    // Step 17: Return Workspace Info and Auth Token
    const accessToken = jwt.sign(
      { userId: result.user.id, email: result.user.email, role: result.user.role.name, tenantId: result.tenant.id },
      config.jwtSecret,
      { expiresIn: config.jwtExpiresIn as any }
    );

    const refreshTokenRaw = crypto.randomBytes(40).toString('hex');
    const refreshTokenHash = crypto.createHash('sha256').update(refreshTokenRaw).digest('hex');
    await prisma.refreshToken.create({
      data: {
        userId: result.user.id,
        tokenHash: refreshTokenHash,
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      },
    });

    res.status(201).json({
      success: true,
      message: `CRM Workspace '${result.tenant.name}' provisioned successfully!`,
      accessToken,
      refreshToken: refreshTokenRaw,
      apiKey: result.apiKeyRaw,
      tenant: {
        id: result.tenant.id,
        name: result.tenant.name,
        slug: result.tenant.slug,
        status: result.tenant.status,
        template: result.tenant.template,
        trialEndsAt: result.tenant.trialEndsAt,
      },
      plan: {
        name: result.targetPlan.name,
        maxUsers: result.targetPlan.maxUsers,
        maxLeads: result.targetPlan.maxLeads,
      },
      user: {
        id: result.user.id,
        fullName: result.user.fullName,
        email: result.user.email,
        role: result.user.role.name,
        permissions: ['*'],
      },
    });
  } catch (error) {
    next(error);
  }
};

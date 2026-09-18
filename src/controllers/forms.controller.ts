import { Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import { prisma } from '../lib/db';
import { AppError } from '../middleware/errorHandler';
import { dispatchWebhookEvent } from './webhooks.controller';

const createFormSchema = z.object({
  name: z.string().min(2, 'Form name required'),
  fields: z.array(z.any()).min(1, 'At least one field required'),
  redirectUrl: z.string().optional(),
});

// GET /api/v1/forms
export const getTenantForms = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const tenantId = req.tenant?.id;
    if (!tenantId) throw new AppError('Tenant context missing', 400);

    const forms = await prisma.leadForm.findMany({
      where: { tenantId },
      orderBy: { createdAt: 'desc' },
    });

    res.status(200).json({
      success: true,
      forms: forms.map((f) => ({
        id: f.id,
        name: f.name,
        formKey: f.formKey,
        fields: JSON.parse(f.fields),
        redirectUrl: f.redirectUrl,
        isActive: f.isActive,
        submissionsCount: f.submissionsCount,
        publicUrl: `/api/public/forms/${f.formKey}/submit`,
        createdAt: f.createdAt,
      })),
    });
  } catch (error) {
    next(error);
  }
};

// POST /api/v1/forms
export const createCustomForm = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const tenantId = req.tenant?.id;
    if (!tenantId) throw new AppError('Tenant context missing', 400);

    const data = createFormSchema.parse(req.body);

    let baseKey = data.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
    let formKey = baseKey;
    let counter = 1;
    while (await prisma.leadForm.findUnique({ where: { formKey } })) {
      formKey = `${baseKey}-${counter}`;
      counter++;
    }

    const form = await prisma.leadForm.create({
      data: {
        tenantId,
        name: data.name,
        formKey,
        fields: JSON.stringify(data.fields),
        redirectUrl: data.redirectUrl || null,
        isActive: true,
      },
    });

    res.status(201).json({
      success: true,
      message: 'Lead form created successfully',
      form: {
        ...form,
        fields: data.fields,
        publicUrl: `/api/public/forms/${form.formKey}/submit`,
      },
    });
  } catch (error) {
    next(error);
  }
};

// PUBLIC ENDPOINT: Get Form Definition by FormKey (No Auth Required)
export const getPublicFormBySlug = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const formKey = (req.params.formKey || req.params.slug) as string;

    const form = await prisma.leadForm.findUnique({
      where: { formKey },
      include: { tenant: { select: { name: true, logo: true, primaryColor: true, status: true } } },
    });

    if (!form || !form.isActive) {
      throw new AppError('Public form not found or inactive', 404);
    }

    if (form.tenant.status === 'SUSPENDED') {
      throw new AppError('Form workspace is suspended', 403);
    }

    res.status(200).json({
      success: true,
      form: {
        id: form.id,
        name: form.name,
        formKey: form.formKey,
        fields: JSON.parse(form.fields),
        companyName: form.tenant.name,
        primaryColor: form.tenant.primaryColor,
      },
    });
  } catch (error) {
    next(error);
  }
};

// PUBLIC ENDPOINT: Submit Form & Auto-Provision Lead (No Auth Required)
export const submitPublicForm = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const formKey = (req.params.formKey || req.params.slug) as string;
    const formData = req.body || {};

    // Spam Protection check
    if (formData.honeypot) {
      res.status(200).json({ success: true, message: 'Submission received.' });
      return;
    }

    const form = await prisma.leadForm.findUnique({
      where: { formKey },
      include: { tenant: true },
    });

    if (!form || !form.isActive) {
      throw new AppError('Public form not found or inactive', 404);
    }

    if (form.tenant.status === 'SUSPENDED') {
      throw new AppError('Workspace is currently suspended.', 403);
    }

    const customerName = formData.name || formData.customerName || formData.fullName || 'Web Lead';
    const phone = formData.phone || formData.mobile || '+91 0000000000';
    const email = formData.email || null;
    const city = formData.city || null;

    const count = await prisma.lead.count({ where: { tenantId: form.tenantId } });
    const leadId = `LD-${1001 + count}`;

    const newLead = await prisma.lead.create({
      data: {
        tenantId: form.tenantId,
        leadId,
        customerName,
        phone,
        email,
        city,
        source: `Public Form: ${form.name}`,
        status: 'New',
        notes: `Submitted via web form '${form.name}'`,
      },
    });

    // Update Form Submission Counter
    await prisma.leadForm.update({
      where: { id: form.id },
      data: { submissionsCount: { increment: 1 } },
    });

    // Update Tenant Usage Record
    await prisma.usage.upsert({
      where: { tenantId: form.tenantId },
      update: { leadCount: { increment: 1 } },
      create: { tenantId: form.tenantId, leadCount: 1 },
    });

    // Audit Log
    await prisma.auditLog.create({
      data: {
        tenantId: form.tenantId,
        action: 'PUBLIC_FORM_SUBMISSION',
        entity: 'Lead',
        entityId: newLead.id,
        details: `Public form '${form.name}' submitted by ${customerName}.`,
        ipAddress: req.ip || '127.0.0.1',
      },
    });

    // Webhook Trigger
    dispatchWebhookEvent(form.tenantId, 'lead.created', newLead);

    res.status(201).json({
      success: true,
      message: 'Form submitted successfully!',
      leadId: newLead.leadId,
      redirectUrl: form.redirectUrl || null,
    });
  } catch (error) {
    next(error);
  }
};

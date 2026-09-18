import { Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import { prisma } from '../lib/db';
import { AppError } from '../middleware/errorHandler';
import { recordAuditLog } from '../middleware/auditLogger';
import { dispatchWebhookEvent } from './webhooks.controller';

const getTenantId = (req: Request): string => {
  const tenantId = req.user?.tenantId || req.tenant?.id;
  if (!tenantId) throw new AppError('Tenant context missing', 400);
  return tenantId;
};

const createLeadSchema = z.object({
  customerName: z.string().min(2, 'Customer name required'),
  phone: z.string().min(6, 'Phone number required'),
  email: z.string().email().optional().or(z.literal('')),
  city: z.string().optional(),
  loanType: z.string().optional().default('Personal Loan'),
  amount: z.number().optional().default(0),
  source: z.string().optional().default('Website'),
  status: z.string().optional().default('New'),
  assignedToId: z.string().optional(),
  notes: z.string().optional(),
  customFields: z.record(z.any()).optional(),
});

const createCustomerSchema = z.object({
  name: z.string().min(2, 'Customer name required'),
  email: z.string().email('Email is required'),
  phone: z.string().min(5, 'Phone number is required'),
  city: z.string().optional(),
  company: z.string().optional(),
  status: z.string().optional().default('Active'),
});

export const getLeads = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const tenantId = getTenantId(req);

    const page = parseInt((req.query.page as string) || '1', 10);
    const limit = parseInt((req.query.limit as string) || '50', 10);
    const search = req.query.search as string | undefined;
    const status = req.query.status as string | undefined;

    const where: any = {
      tenantId,
      ...(status ? { status } : {}),
      ...(search
        ? {
            OR: [
              { customerName: { contains: search } },
              { phone: { contains: search } },
              { email: { contains: search } },
              { leadId: { contains: search } },
            ],
          }
        : {}),
    };

    const total = await prisma.lead.count({ where });
    const leads = await prisma.lead.findMany({
      where,
      skip: (page - 1) * limit,
      take: limit,
      orderBy: { createdDate: 'desc' },
      include: {
        assignedTo: { select: { id: true, fullName: true, email: true } },
      },
    });

    res.status(200).json({
      success: true,
      pagination: {
        total,
        page,
        limit,
        pages: Math.ceil(total / limit),
      },
      leads,
    });
  } catch (error) {
    next(error);
  }
};

export const createLead = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const tenantId = getTenantId(req);

    const data = createLeadSchema.parse(req.body);

    const count = await prisma.lead.count({ where: { tenantId } });
    const leadId = `LD-${1001 + count}`;

    const lead = await prisma.lead.create({
      data: {
        tenantId,
        leadId,
        customerName: data.customerName,
        phone: data.phone,
        email: data.email || null,
        city: data.city || null,
        loanType: data.loanType,
        amount: data.amount,
        source: data.source,
        status: data.status,
        assignedToId: data.assignedToId || req.user?.id || null,
        notes: data.notes || null,
      },
      include: { assignedTo: { select: { id: true, fullName: true } } },
    });

    if (data.customFields && typeof data.customFields === 'object') {
      for (const [fieldKey, val] of Object.entries(data.customFields)) {
        const fieldDef = await prisma.customField.findFirst({
          where: { tenantId, entityType: 'LEAD', fieldKey },
        });
        if (fieldDef) {
          await prisma.customFieldValue.create({
            data: {
              tenantId,
              customFieldId: fieldDef.id,
              recordId: lead.id,
              value: String(val),
            },
          });
        }
      }
    }

    await prisma.usage.upsert({
      where: { tenantId },
      update: { leadCount: { increment: 1 } },
      create: { tenantId, leadCount: 1 },
    });

    await recordAuditLog({
      tenantId,
      userId: req.user?.id,
      action: 'CREATE_LEAD',
      entity: 'Lead',
      entityId: lead.id,
      details: { leadId: lead.leadId, customerName: lead.customerName },
      req,
    });

    dispatchWebhookEvent(tenantId, 'lead.created', lead);

    res.status(201).json({
      success: true,
      message: 'Lead created successfully',
      lead,
    });
  } catch (error) {
    next(error);
  }
};

export const getCustomers = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const tenantId = getTenantId(req);

    const customers = await prisma.customer.findMany({
      where: { tenantId },
      orderBy: { createdDate: 'desc' },
    });

    res.status(200).json({
      success: true,
      customers,
    });
  } catch (error) {
    next(error);
  }
};

export const createCustomer = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const tenantId = getTenantId(req);

    const data = createCustomerSchema.parse(req.body);

    const count = await prisma.customer.count({ where: { tenantId } });
    const customerId = `CUST-${5001 + count}`;

    const customer = await prisma.customer.create({
      data: {
        tenantId,
        customerId,
        name: data.name,
        email: data.email.toLowerCase().trim(),
        phone: data.phone,
        city: data.city || null,
        company: data.company || null,
        status: data.status,
      },
    });

    await prisma.usage.upsert({
      where: { tenantId },
      update: { customerCount: { increment: 1 } },
      create: { tenantId, customerCount: 1 },
    });

    dispatchWebhookEvent(tenantId, 'customer.created', customer);

    res.status(201).json({
      success: true,
      message: 'Customer created successfully',
      customer,
    });
  } catch (error) {
    next(error);
  }
};

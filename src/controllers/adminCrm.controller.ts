import { Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import { prisma } from '../lib/db';
import { AppError } from '../middleware/errorHandler';
import { recordAuditLog } from '../middleware/auditLogger';
import { dispatchWebhookEvent } from './webhooks.controller';

const getTenantId = (req: Request): string => {
  const tenantId = req.tenant?.id || req.user?.tenantId;
  if (!tenantId) throw new AppError('Tenant context missing', 400);
  return tenantId;
};

const generateUniqueCustomerId = async (tenantId: string): Promise<string> => {
  let count = await prisma.customer.count({ where: { tenantId } });
  let candidate = `EMP-CUST-${5001 + count}`;
  let exists = await prisma.customer.findFirst({ where: { tenantId, customerId: candidate } });
  while (exists) {
    count++;
    candidate = `EMP-CUST-${5001 + count}`;
    exists = await prisma.customer.findFirst({ where: { tenantId, customerId: candidate } });
  }
  return candidate;
};

const generateUniqueLeadId = async (tenantId: string): Promise<string> => {
  let count = await prisma.lead.count({ where: { tenantId } });
  let candidate = `EMP-LD-${1001 + count}`;
  let exists = await prisma.lead.findFirst({ where: { tenantId, leadId: candidate } });
  while (exists) {
    count++;
    candidate = `EMP-LD-${1001 + count}`;
    exists = await prisma.lead.findFirst({ where: { tenantId, leadId: candidate } });
  }
  return candidate;
};

const generateUniqueDealId = async (tenantId: string): Promise<string> => {
  let count = await prisma.deal.count({ where: { tenantId } });
  let candidate = `EMP-DEAL-${3001 + count}`;
  let exists = await prisma.deal.findFirst({ where: { tenantId, dealId: candidate } });
  while (exists) {
    count++;
    candidate = `EMP-DEAL-${3001 + count}`;
    exists = await prisma.deal.findFirst({ where: { tenantId, dealId: candidate } });
  }
  return candidate;
};

const createLeadSchema = z.object({
  customerName: z.string().min(2, 'Customer name is required'),
  phone: z.string().min(5, 'Valid phone is required'),
  email: z.string().email().optional().or(z.literal('')),
  city: z.string().optional(),
  loanType: z.string().default('Personal Loan'),
  amount: z.number().default(0),
  source: z.string().default('Website'),
  status: z.string().default('New'),
  assignedToId: z.string().optional(),
  notes: z.string().optional(),
});

const createCustomerSchema = z.object({
  name: z.string().min(2, 'Customer name is required'),
  email: z.string().email('Valid email is required'),
  phone: z.string().min(5, 'Phone is required'),
  city: z.string().optional(),
  company: z.string().optional(),
  status: z.string().default('Active'),
  totalDeals: z.number().default(0),
  lifetimeValue: z.number().default(0),
});

const createTaskSchema = z.object({
  title: z.string().min(2, 'Task title is required'),
  description: z.string().optional(),
  priority: z.string().default('Medium'),
  status: z.string().default('Pending'),
  dueDate: z.string().or(z.date()),
  assignedToId: z.string().min(1, 'Assigned user is required'),
  leadId: z.string().optional(),
});

const createNoteSchema = z.object({
  content: z.string().min(1, 'Note content cannot be empty'),
  leadId: z.string().optional(),
  customerId: z.string().optional(),
});

// LEADS
export const getLeads = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const tenantId = getTenantId(req);
    const page = parseInt((req.query.page as string) || '1', 10);
    const limit = parseInt((req.query.limit as string) || '10', 10);
    const search = typeof req.query.search === 'string' ? req.query.search.trim() : '';
    const status = typeof req.query.status === 'string' ? req.query.status : undefined;
    const source = typeof req.query.source === 'string' ? req.query.source : undefined;

    const skip = (page - 1) * limit;

    const where: any = { tenantId };
    if (search) {
      where.OR = [
        { customerName: { contains: search } },
        { phone: { contains: search } },
        { email: { contains: search } },
        { leadId: { contains: search } },
      ];
    }
    if (status) where.status = status;
    if (source) where.source = source;

    const [leads, total] = await Promise.all([
      prisma.lead.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdDate: 'desc' },
        include: {
          assignedTo: { select: { id: true, fullName: true, email: true } },
          _count: { select: { tasks: true, notesList: true, followUps: true } },
        },
      }),
      prisma.lead.count({ where }),
    ]);

    res.status(200).json({
      success: true,
      leads,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    next(error);
  }
};

export const getLeadById = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const tenantId = getTenantId(req);
    const id = req.params.id as string;
    const lead = await prisma.lead.findFirst({
      where: { id, tenantId },
      include: {
        assignedTo: { select: { id: true, fullName: true, email: true } },
        activities: { orderBy: { createdAt: 'desc' } },
        contacts: true,
        followUps: { orderBy: { scheduledAt: 'desc' } },
        tasks: { orderBy: { dueDate: 'asc' } },
        notesList: {
          include: { createdBy: { select: { id: true, fullName: true } } },
          orderBy: { createdAt: 'desc' },
        },
      },
    });

    if (!lead) throw new AppError('Lead not found', 404);

    res.status(200).json({ success: true, lead });
  } catch (error) {
    next(error);
  }
};

export const createLead = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const tenantId = getTenantId(req);
    const data = createLeadSchema.parse(req.body);
    const leadId = await generateUniqueLeadId(tenantId);

    const lead = await prisma.lead.create({
      data: {
        tenantId,
        leadId,
        customerName: data.customerName,
        phone: data.phone,
        email: data.email || null,
        city: data.city || null,
        loanType: data.loanType,
        amount: Number(data.amount) || 0,
        source: data.source,
        status: data.status,
        assignedToId: data.assignedToId || null,
        notes: data.notes || null,
      },
    });

    await prisma.usage.upsert({
      where: { tenantId },
      update: { leadCount: { increment: 1 } },
      create: { tenantId, leadCount: 1 },
    });

    await recordAuditLog({
      tenantId,
      action: 'MODIFY_LEAD',
      entity: 'Lead',
      entityId: lead.id,
      details: { action: 'create', leadId: lead.leadId, customerName: lead.customerName },
      req,
    });

    await prisma.activity.create({
      data: {
        tenantId,
        title: 'New Lead Created',
        details: `Lead ${lead.leadId} for ${lead.customerName} created.`,
        type: 'LEAD_CREATED',
        entityType: 'Lead',
        entityId: lead.id,
        userId: req.user?.id,
      },
    });

    dispatchWebhookEvent(tenantId, 'lead.created', lead);

    res.status(201).json({ success: true, message: 'Lead created successfully', lead });
  } catch (error) {
    next(error);
  }
};

export const updateLead = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const tenantId = getTenantId(req);
    const id = req.params.id as string;
    const body = req.body;

    const existing = await prisma.lead.findFirst({ where: { id, tenantId } });
    if (!existing) throw new AppError('Lead not found', 404);

    const updated = await prisma.lead.update({
      where: { id },
      data: {
        ...(body.customerName && { customerName: body.customerName }),
        ...(body.phone && { phone: body.phone }),
        ...(body.email !== undefined && { email: body.email || null }),
        ...(body.city !== undefined && { city: body.city || null }),
        ...(body.loanType && { loanType: body.loanType }),
        ...(body.amount !== undefined && { amount: Number(body.amount) }),
        ...(body.source && { source: body.source }),
        ...(body.status && { status: body.status }),
        ...(body.assignedToId !== undefined && { assignedToId: body.assignedToId || null }),
        ...(body.notes !== undefined && { notes: body.notes }),
      },
    });

    if (body.status && body.status !== existing.status) {
      await prisma.leadActivity.create({
        data: {
          tenantId,
          leadId: id,
          type: 'STATUS_CHANGE',
          title: 'Status Updated',
          details: `Status changed from ${existing.status} to ${body.status}`,
        },
      });
    }

    dispatchWebhookEvent(tenantId, 'lead.updated', updated);

    res.status(200).json({ success: true, message: 'Lead updated successfully', lead: updated });
  } catch (error) {
    next(error);
  }
};

export const deleteLead = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const tenantId = getTenantId(req);
    const id = req.params.id as string;
    const existing = await prisma.lead.findFirst({ where: { id, tenantId } });
    if (!existing) throw new AppError('Lead not found', 404);

    await prisma.lead.delete({ where: { id } });

    dispatchWebhookEvent(tenantId, 'lead.deleted', { id, leadId: existing.leadId });

    res.status(200).json({ success: true, message: 'Lead deleted successfully' });
  } catch (error) {
    next(error);
  }
};

// CUSTOMERS
export const getCustomers = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const tenantId = getTenantId(req);
    const page = parseInt((req.query.page as string) || '1', 10);
    const limit = parseInt((req.query.limit as string) || '10', 10);
    const search = typeof req.query.search === 'string' ? req.query.search.trim() : '';

    const skip = (page - 1) * limit;

    const where: any = { tenantId };
    if (search) {
      where.OR = [
        { name: { contains: search } },
        { phone: { contains: search } },
        { email: { contains: search } },
        { customerId: { contains: search } },
        { company: { contains: search } },
      ];
    }

    const [customers, total] = await Promise.all([
      prisma.customer.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdDate: 'desc' },
        include: { _count: { select: { contacts: true, notes: true } } },
      }),
      prisma.customer.count({ where }),
    ]);

    res.status(200).json({
      success: true,
      customers,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    next(error);
  }
};

export const getCustomerById = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const tenantId = getTenantId(req);
    const id = req.params.id as string;
    const customer = await prisma.customer.findFirst({
      where: { id, tenantId },
      include: {
        contacts: true,
        notes: {
          include: { createdBy: { select: { id: true, fullName: true } } },
          orderBy: { createdAt: 'desc' },
        },
      },
    });

    if (!customer) throw new AppError('Customer not found', 404);

    res.status(200).json({ success: true, customer });
  } catch (error) {
    next(error);
  }
};

export const createCustomer = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const tenantId = getTenantId(req);
    const data = createCustomerSchema.parse(req.body);

    const existingEmail = await prisma.customer.findFirst({
      where: { tenantId, email: data.email },
    });
    if (existingEmail) {
      throw new AppError('A customer with this email already exists in your workspace.', 400);
    }

    const customerId = await generateUniqueCustomerId(tenantId);

    const customer = await prisma.customer.create({
      data: {
        tenantId,
        customerId,
        name: data.name,
        email: data.email,
        phone: data.phone,
        city: data.city || null,
        company: data.company || null,
        status: data.status,
        totalDeals: Number(data.totalDeals) || 0,
        lifetimeValue: Number(data.lifetimeValue) || 0,
      },
    });

    await prisma.usage.upsert({
      where: { tenantId },
      update: { customerCount: { increment: 1 } },
      create: { tenantId, customerCount: 1 },
    });

    dispatchWebhookEvent(tenantId, 'customer.created', customer);

    res.status(201).json({ success: true, message: 'Customer created successfully', customer });
  } catch (error) {
    next(error);
  }
};

export const updateCustomer = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const tenantId = getTenantId(req);
    const id = req.params.id as string;
    const body = req.body;

    const existing = await prisma.customer.findFirst({ where: { id, tenantId } });
    if (!existing) throw new AppError('Customer not found', 404);

    const updated = await prisma.customer.update({
      where: { id },
      data: {
        ...(body.name && { name: body.name }),
        ...(body.email && { email: body.email }),
        ...(body.phone && { phone: body.phone }),
        ...(body.city !== undefined && { city: body.city || null }),
        ...(body.company !== undefined && { company: body.company || null }),
        ...(body.status && { status: body.status }),
        ...(body.totalDeals !== undefined && { totalDeals: Number(body.totalDeals) }),
        ...(body.lifetimeValue !== undefined && { lifetimeValue: Number(body.lifetimeValue) }),
      },
    });

    res.status(200).json({ success: true, message: 'Customer updated successfully', customer: updated });
  } catch (error) {
    next(error);
  }
};

export const deleteCustomer = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const tenantId = getTenantId(req);
    const id = req.params.id as string;
    const existing = await prisma.customer.findFirst({ where: { id, tenantId } });
    if (!existing) throw new AppError('Customer not found', 404);

    await prisma.customer.delete({ where: { id } });

    res.status(200).json({ success: true, message: 'Customer deleted successfully' });
  } catch (error) {
    next(error);
  }
};

// TASKS
export const getTasks = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const tenantId = getTenantId(req);
    const tasks = await prisma.task.findMany({
      where: { tenantId },
      orderBy: { dueDate: 'asc' },
      include: {
        assignedTo: { select: { id: true, fullName: true, email: true } },
        lead: { select: { id: true, leadId: true, customerName: true } },
      },
    });

    res.status(200).json({ success: true, tasks });
  } catch (error) {
    next(error);
  }
};

export const createTask = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const tenantId = getTenantId(req);
    const data = createTaskSchema.parse(req.body);

    const task = await prisma.task.create({
      data: {
        tenantId,
        title: data.title,
        description: data.description || null,
        priority: data.priority,
        status: data.status,
        dueDate: new Date(data.dueDate),
        assignedToId: data.assignedToId,
        leadId: data.leadId || null,
      },
    });

    dispatchWebhookEvent(tenantId, 'task.created', task);

    res.status(201).json({ success: true, message: 'Task created successfully', task });
  } catch (error) {
    next(error);
  }
};

export const updateTask = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const tenantId = getTenantId(req);
    const id = req.params.id as string;
    const existing = await prisma.task.findFirst({ where: { id, tenantId } });
    if (!existing) throw new AppError('Task not found', 404);

    const body = req.body;
    const updated = await prisma.task.update({
      where: { id },
      data: {
        ...(body.title && { title: body.title }),
        ...(body.description !== undefined && { description: body.description }),
        ...(body.priority && { priority: body.priority }),
        ...(body.status && { status: body.status }),
        ...(body.dueDate && { dueDate: new Date(body.dueDate) }),
        ...(body.assignedToId && { assignedToId: body.assignedToId }),
      },
    });

    res.status(200).json({ success: true, message: 'Task updated successfully', task: updated });
  } catch (error) {
    next(error);
  }
};

export const deleteTask = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const tenantId = getTenantId(req);
    const id = req.params.id as string;
    const existing = await prisma.task.findFirst({ where: { id, tenantId } });
    if (!existing) throw new AppError('Task not found', 404);

    await prisma.task.delete({ where: { id } });

    res.status(200).json({ success: true, message: 'Task deleted successfully' });
  } catch (error) {
    next(error);
  }
};

// NOTES
export const getNotes = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const tenantId = getTenantId(req);
    const notes = await prisma.note.findMany({
      where: { tenantId },
      orderBy: { createdAt: 'desc' },
      include: { createdBy: { select: { id: true, fullName: true } } },
    });

    res.status(200).json({ success: true, notes });
  } catch (error) {
    next(error);
  }
};

export const createNote = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const tenantId = getTenantId(req);
    const data = createNoteSchema.parse(req.body);

    if (!req.user) throw new AppError('User not authenticated', 401);

    const note = await prisma.note.create({
      data: {
        tenantId,
        content: data.content,
        leadId: data.leadId || null,
        customerId: data.customerId || null,
        createdById: req.user.id,
      },
    });

    res.status(201).json({ success: true, message: 'Note added successfully', note });
  } catch (error) {
    next(error);
  }
};

export const deleteNote = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const tenantId = getTenantId(req);
    const id = req.params.id as string;
    const existing = await prisma.note.findFirst({ where: { id, tenantId } });
    if (!existing) throw new AppError('Note not found', 404);

    await prisma.note.delete({ where: { id } });

    res.status(200).json({ success: true, message: 'Note deleted successfully' });
  } catch (error) {
    next(error);
  }
};

// ACTIVITIES
export const getActivities = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const tenantId = getTenantId(req);
    const activities = await prisma.activity.findMany({
      where: { tenantId },
      orderBy: { createdAt: 'desc' },
      take: 50,
      include: { user: { select: { id: true, fullName: true } } },
    });

    res.status(200).json({ success: true, activities });
  } catch (error) {
    next(error);
  }
};

// LEAD CONVERSION (Lead -> Contact + Account/Customer + Deal)
export const convertLead = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const tenantId = getTenantId(req);
    const id = req.params.id as string;
    const { createDeal, dealTitle, dealAmount } = req.body;

    const lead = await prisma.lead.findFirst({ where: { id, tenantId } });
    if (!lead) throw new AppError('Lead not found', 404);

    // 1. Update lead status to Converted
    const updatedLead = await prisma.lead.update({
      where: { id },
      data: { status: 'Converted' },
    });

    // 2. Create or find Customer/Company
    let customer = await prisma.customer.findFirst({
      where: { tenantId, email: lead.email || undefined },
    });

    if (!customer) {
      const customerId = await generateUniqueCustomerId(tenantId);
      customer = await prisma.customer.create({
        data: {
          tenantId,
          customerId,
          name: lead.customerName,
          email: lead.email || `lead-${lead.leadId.toLowerCase()}@local.crm`,
          phone: lead.phone,
          city: lead.city || null,
          company: lead.customerName,
          status: 'Active',
          totalDeals: createDeal ? 1 : 0,
          lifetimeValue: createDeal ? Number(dealAmount || lead.amount) || 0 : 0,
        },
      });
    }

    // 3. Create Contact
    const contact = await prisma.contact.create({
      data: {
        tenantId,
        name: lead.customerName,
        email: lead.email || null,
        phone: lead.phone,
        company: customer.company || lead.customerName,
        leadId: lead.id,
        customerId: customer.id,
      },
    });

    // 4. Optionally Create Deal
    let deal = null;
    if (createDeal) {
      const defaultPipeline = await prisma.pipeline.findFirst({
        where: { tenantId },
        include: { stages: { orderBy: { order: 'asc' } } },
      });

      if (defaultPipeline && defaultPipeline.stages.length > 0) {
        const dealId = await generateUniqueDealId(tenantId);
        deal = await prisma.deal.create({
          data: {
            tenantId,
            dealId,
            title: dealTitle || `${lead.customerName} - ${lead.loanType}`,
            amount: Number(dealAmount || lead.amount) || 0,
            pipelineId: defaultPipeline.id,
            stageId: defaultPipeline.stages[0].id,
            customerId: customer.id,
            leadId: lead.id,
            assignedToId: lead.assignedToId || req.user?.id || null,
            status: 'OPEN',
          },
        });
      }
    }

    await recordAuditLog({
      tenantId,
      action: 'CONVERT_LEAD',
      entity: 'Lead',
      entityId: lead.id,
      details: { customerId: customer.id, contactId: contact.id, dealId: deal?.id },
      req,
    });

    res.status(200).json({
      success: true,
      message: 'Lead converted successfully',
      lead: updatedLead,
      customer,
      contact,
      deal,
    });
  } catch (error) {
    next(error);
  }
};

// CONTACTS
export const getContacts = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const tenantId = getTenantId(req);
    const contacts = await prisma.contact.findMany({
      where: { tenantId },
      orderBy: { createdAt: 'desc' },
      include: {
        customer: { select: { id: true, name: true, email: true } },
        lead: { select: { id: true, customerName: true, leadId: true } },
      },
    });
    res.status(200).json({ success: true, contacts });
  } catch (error) {
    next(error);
  }
};

export const createContact = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const tenantId = getTenantId(req);
    const { name, email, phone, designation, company, customerId, leadId } = req.body;
    const contact = await prisma.contact.create({
      data: {
        tenantId,
        name,
        email: email || null,
        phone: phone || null,
        designation: designation || null,
        company: company || null,
        customerId: customerId || null,
        leadId: leadId || null,
      },
    });
    res.status(201).json({ success: true, message: 'Contact created successfully', contact });
  } catch (error) {
    next(error);
  }
};

export const updateContact = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const tenantId = getTenantId(req);
    const id = req.params.id as string;
    const contact = await prisma.contact.update({
      where: { id },
      data: req.body,
    });
    res.status(200).json({ success: true, message: 'Contact updated successfully', contact });
  } catch (error) {
    next(error);
  }
};

export const deleteContact = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const tenantId = getTenantId(req);
    const id = req.params.id as string;
    await prisma.contact.delete({ where: { id } });
    res.status(200).json({ success: true, message: 'Contact deleted successfully' });
  } catch (error) {
    next(error);
  }
};

// DEALS
export const getDeals = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const tenantId = getTenantId(req);
    const deals = await prisma.deal.findMany({
      where: { tenantId },
      orderBy: { createdAt: 'desc' },
      include: {
        pipeline: { select: { id: true, name: true } },
        stage: { select: { id: true, name: true, color: true, probability: true } },
        customer: { select: { id: true, name: true, company: true } },
        assignedTo: { select: { id: true, fullName: true, email: true } },
      },
    });
    res.status(200).json({ success: true, deals });
  } catch (error) {
    next(error);
  }
};

export const createDeal = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const tenantId = getTenantId(req);
    const { title, amount, pipelineId, stageId, customerId, leadId, assignedToId, expectedCloseDate } = req.body;

    const dealId = await generateUniqueDealId(tenantId);

    let resolvedPipelineId = pipelineId;
    let resolvedStageId = stageId;

    if (!resolvedPipelineId || !resolvedStageId) {
      const p = await prisma.pipeline.findFirst({
        where: { tenantId },
        include: { stages: { orderBy: { order: 'asc' } } },
      });
      if (p && p.stages.length > 0) {
        resolvedPipelineId = p.id;
        resolvedStageId = p.stages[0].id;
      }
    }

    const deal = await prisma.deal.create({
      data: {
        tenantId,
        dealId,
        title,
        amount: Number(amount) || 0,
        pipelineId: resolvedPipelineId,
        stageId: resolvedStageId,
        customerId: customerId || null,
        leadId: leadId || null,
        assignedToId: assignedToId || null,
        expectedCloseDate: expectedCloseDate ? new Date(expectedCloseDate) : null,
        status: 'OPEN',
      },
    });

    res.status(201).json({ success: true, message: 'Deal created successfully', deal });
  } catch (error) {
    next(error);
  }
};

export const updateDealStage = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const tenantId = getTenantId(req);
    const id = req.params.id as string;
    const { stageId, status } = req.body;

    const stage = await prisma.pipelineStage.findFirst({ where: { id: stageId, tenantId } });
    let dealStatus = status || 'OPEN';
    if (stage) {
      if (stage.closedWon) dealStatus = 'WON';
      else if (stage.closedLost) dealStatus = 'LOST';
    }

    const deal = await prisma.deal.update({
      where: { id },
      data: {
        stageId,
        status: dealStatus,
        ...(dealStatus !== 'OPEN' ? { closedAt: new Date() } : {}),
      },
      include: { stage: true },
    });

    res.status(200).json({ success: true, message: 'Deal stage updated successfully', deal });
  } catch (error) {
    next(error);
  }
};

export const deleteDeal = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const tenantId = getTenantId(req);
    const id = req.params.id as string;
    await prisma.deal.delete({ where: { id } });
    res.status(200).json({ success: true, message: 'Deal deleted successfully' });
  } catch (error) {
    next(error);
  }
};

// MEETINGS
export const getMeetings = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const tenantId = getTenantId(req);
    const meetings = await prisma.meeting.findMany({
      where: { tenantId },
      orderBy: { meetingDate: 'asc' },
    });
    res.status(200).json({ success: true, meetings });
  } catch (error) {
    next(error);
  }
};

export const createMeeting = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const tenantId = getTenantId(req);
    const { title, description, meetingDate, duration, location, meetingLink, leadId, contactId, dealId } = req.body;

    const meeting = await prisma.meeting.create({
      data: {
        tenantId,
        title,
        description: description || null,
        meetingDate: new Date(meetingDate),
        duration: Number(duration) || 30,
        location: location || null,
        meetingLink: meetingLink || null,
        status: 'Scheduled',
        leadId: leadId || null,
        contactId: contactId || null,
        dealId: dealId || null,
        hostId: req.user?.id || null,
      },
    });

    res.status(201).json({ success: true, message: 'Meeting scheduled successfully', meeting });
  } catch (error) {
    next(error);
  }
};

export const deleteMeeting = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const tenantId = getTenantId(req);
    const id = req.params.id as string;
    await prisma.meeting.delete({ where: { id } });
    res.status(200).json({ success: true, message: 'Meeting deleted successfully' });
  } catch (error) {
    next(error);
  }
};

// PRODUCTS
export const getProducts = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const tenantId = getTenantId(req);
    const products = await prisma.product.findMany({
      where: { tenantId },
      orderBy: { createdAt: 'desc' },
    });
    res.status(200).json({ success: true, products });
  } catch (error) {
    next(error);
  }
};

export const createProduct = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const tenantId = getTenantId(req);
    const { name, sku, category, price, cost, tax, status, description } = req.body;

    const product = await prisma.product.create({
      data: {
        tenantId,
        name,
        sku: sku || null,
        category: category || 'General',
        price: Number(price) || 0,
        cost: Number(cost) || 0,
        tax: Number(tax) || 0,
        status: status || 'Active',
        description: description || null,
      },
    });

    res.status(201).json({ success: true, message: 'Product created successfully', product });
  } catch (error) {
    next(error);
  }
};

export const deleteProduct = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const tenantId = getTenantId(req);
    const id = req.params.id as string;
    await prisma.product.delete({ where: { id } });
    res.status(200).json({ success: true, message: 'Product deleted successfully' });
  } catch (error) {
    next(error);
  }
};

// QUOTES
export const getQuotes = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const tenantId = getTenantId(req);
    const quotes = await prisma.quote.findMany({
      where: { tenantId },
      orderBy: { createdAt: 'desc' },
      include: { items: { include: { product: true } } },
    });
    res.status(200).json({ success: true, quotes });
  } catch (error) {
    next(error);
  }
};

export const createQuote = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const tenantId = getTenantId(req);
    const { subject, dealId, customerId, contactId, totalAmount, validUntil } = req.body;

    const count = await prisma.quote.count({ where: { tenantId } });
    const quoteId = `QT-${1001 + count}`;

    const quote = await prisma.quote.create({
      data: {
        tenantId,
        quoteId,
        subject,
        dealId: dealId || null,
        customerId: customerId || null,
        contactId: contactId || null,
        totalAmount: Number(totalAmount) || 0,
        status: 'Draft',
        validUntil: validUntil ? new Date(validUntil) : null,
      },
    });

    res.status(201).json({ success: true, message: 'Quote created successfully', quote });
  } catch (error) {
    next(error);
  }
};


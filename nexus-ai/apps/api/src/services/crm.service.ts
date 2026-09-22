import { prisma } from '../lib/prisma';
import { AppError } from '../middleware/errorHandler';
import { LeadStatus, LeadPriority, TaskStatus, TaskPriority, DealStage } from '@prisma/client';
import { CreateLeadInput, UpdateLeadInput, CreateCompanyInput, CreateTaskInput } from '@nexus-ai/validation';

let Papa: any;
try {
  Papa = require('papaparse');
} catch (e) {
  Papa = {
    unparse: (records: any[]) => {
      if (records.length === 0) return '';
      const headers = Object.keys(records[0]).join(',');
      const rows = records.map((r) => Object.values(r).map((v) => `"${String(v).replace(/"/g, '""')}"`).join(','));
      return [headers, ...rows].join('\n');
    },
    parse: (csv: string, _opts: any) => {
      const lines = csv.trim().split(/\r?\n/).filter(Boolean);
      if (lines.length < 2) return { data: [], errors: [] };
      const headers = lines[0].split(',').map((h) => h.replace(/^"|"$/g, '').trim());
      const data = lines.slice(1).map((line) => {
        const values = line.split(',').map((v) => v.replace(/^"|"$/g, '').trim());
        const row: any = {};
        headers.forEach((h, i) => {
          row[h] = values[i] || '';
        });
        return row;
      });
      return { data, errors: [] };
    },
  };
}

export class CRMService {
  // --------------------------------------------------------------------------
  // LEADS
  // --------------------------------------------------------------------------
  static async listLeads(
    organizationId: string,
    params: {
      search?: string;
      status?: LeadStatus;
      priority?: LeadPriority;
      assignedUserId?: string;
      page?: number;
      limit?: number;
      sortBy?: string;
      sortOrder?: 'asc' | 'desc';
    }
  ) {
    const page = Math.max(1, params.page || 1);
    const limit = Math.min(100, Math.max(1, params.limit || 25));
    const skip = (page - 1) * limit;

    const where: any = { organizationId };

    if (params.status) where.status = params.status;
    if (params.priority) where.priority = params.priority;
    if (params.assignedUserId) where.assignedUserId = params.assignedUserId;

    if (params.search) {
      where.OR = [
        { name: { contains: params.search, mode: 'insensitive' } },
        { email: { contains: params.search, mode: 'insensitive' } },
        { companyName: { contains: params.search, mode: 'insensitive' } },
        { phone: { contains: params.search, mode: 'insensitive' } },
      ];
    }

    const orderBy: any = {};
    const validSortFields = ['createdAt', 'updatedAt', 'name', 'estimatedValue', 'aiScore', 'status'];
    const sortField = validSortFields.includes(params.sortBy || '') ? params.sortBy! : 'createdAt';
    orderBy[sortField] = params.sortOrder === 'asc' ? 'asc' : 'desc';

    const [leads, total] = await Promise.all([
      prisma.lead.findMany({
        where,
        skip,
        take: limit,
        orderBy,
        include: {
          assignedUser: { select: { id: true, fullName: true, email: true } },
          company: { select: { id: true, name: true, domain: true } },
          _count: { select: { tasks: true, activities: true } },
        },
      }),
      prisma.lead.count({ where }),
    ]);

    return {
      leads,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  static async getLeadById(organizationId: string, leadId: string) {
    const lead = await prisma.lead.findFirst({
      where: { id: leadId, organizationId },
      include: {
        assignedUser: { select: { id: true, fullName: true, email: true, avatarUrl: true } },
        company: true,
        tasks: {
          orderBy: { dueDate: 'asc' },
          include: { assignedUser: { select: { id: true, fullName: true } } },
        },
        activities: {
          orderBy: { createdAt: 'desc' },
          include: { user: { select: { id: true, fullName: true } } },
        },
        deals: true,
      },
    });

    if (!lead) {
      throw new AppError('Lead not found in this organization.', 404, 'LEAD_NOT_FOUND');
    }

    return lead;
  }

  static async createLead(organizationId: string, input: CreateLeadInput, creatorId?: string) {
    let companyId = input.companyId;

    if (input.companyName && !companyId) {
      let company = await prisma.company.findFirst({
        where: { organizationId, name: { equals: input.companyName, mode: 'insensitive' } },
      });

      if (!company) {
        company = await prisma.company.create({
          data: {
            organizationId,
            name: input.companyName,
            industry: input.industry || undefined,
          },
        });
      }
      companyId = company.id;
    }

    const lead = await prisma.lead.create({
      data: {
        organizationId,
        name: input.name,
        email: input.email || null,
        phone: input.phone || null,
        companyName: input.companyName || null,
        companyId: companyId || null,
        source: input.source || 'DIRECT',
        status: (input.status as LeadStatus) || LeadStatus.NEW,
        priority: (input.priority as LeadPriority) || LeadPriority.MEDIUM,
        industry: input.industry || null,
        estimatedValue: input.estimatedValue || 0,
        assignedUserId: input.assignedUserId || creatorId || null,
        tags: input.tags || [],
        notes: input.notes || null,
      },
      include: {
        assignedUser: { select: { id: true, fullName: true, email: true } },
        company: true,
      },
    });

    await prisma.activity.create({
      data: {
        organizationId,
        leadId: lead.id,
        userId: creatorId || null,
        type: 'CREATE',
        title: 'Lead Created',
        description: `Lead '${lead.name}' entered CRM via ${lead.source}.`,
      },
    });

    return lead;
  }

  static async updateLead(organizationId: string, leadId: string, input: UpdateLeadInput, updaterId?: string) {
    await this.getLeadById(organizationId, leadId);

    const updated = await prisma.lead.update({
      where: { id: leadId },
      data: {
        ...input,
        status: input.status as LeadStatus,
        priority: input.priority as LeadPriority,
        email: input.email === '' ? null : input.email,
        phone: input.phone === '' ? null : input.phone,
      },
      include: {
        assignedUser: { select: { id: true, fullName: true, email: true } },
        company: true,
      },
    });

    await prisma.activity.create({
      data: {
        organizationId,
        leadId,
        userId: updaterId || null,
        type: 'UPDATE',
        title: 'Lead Updated',
        description: `Lead status/information updated.`,
      },
    });

    return updated;
  }

  static async deleteLead(organizationId: string, leadId: string) {
    await this.getLeadById(organizationId, leadId);
    return prisma.lead.delete({ where: { id: leadId } });
  }

  // --------------------------------------------------------------------------
  // COMPANIES & CONTACTS
  // --------------------------------------------------------------------------
  static async listCompanies(organizationId: string, search?: string) {
    const where: any = { organizationId };
    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { domain: { contains: search, mode: 'insensitive' } },
        { industry: { contains: search, mode: 'insensitive' } },
      ];
    }

    return prisma.company.findMany({
      where,
      orderBy: { name: 'asc' },
      include: {
        _count: { select: { leads: true, contacts: true, deals: true } },
      },
    });
  }

  static async createCompany(organizationId: string, input: CreateCompanyInput) {
    return prisma.company.create({
      data: {
        organizationId,
        name: input.name,
        domain: input.domain || null,
        industry: input.industry || null,
        size: input.size || null,
        website: input.website || null,
        phone: input.phone || null,
        annualRevenue: input.annualRevenue || null,
      },
    });
  }

  // --------------------------------------------------------------------------
  // TASKS & ACTIVITIES
  // --------------------------------------------------------------------------
  static async listTasks(organizationId: string, filter?: { status?: TaskStatus; assignedUserId?: string; leadId?: string }) {
    const where: any = { organizationId };
    if (filter?.status) where.status = filter.status;
    if (filter?.assignedUserId) where.assignedUserId = filter.assignedUserId;
    if (filter?.leadId) where.leadId = filter.leadId;

    return prisma.task.findMany({
      where,
      orderBy: [{ status: 'asc' }, { dueDate: 'asc' }],
      include: {
        assignedUser: { select: { id: true, fullName: true, email: true } },
        lead: { select: { id: true, name: true, companyName: true, status: true } },
      },
    });
  }

  static async createTask(organizationId: string, input: CreateTaskInput, creatorId?: string) {
    return prisma.task.create({
      data: {
        organizationId,
        title: input.title,
        description: input.description || null,
        status: (input.status as TaskStatus) || TaskStatus.TODO,
        priority: (input.priority as TaskPriority) || TaskPriority.MEDIUM,
        dueDate: input.dueDate ? new Date(input.dueDate) : null,
        leadId: input.leadId || null,
        assignedUserId: input.assignedUserId || creatorId || null,
        createdById: creatorId || null,
      },
      include: {
        assignedUser: { select: { id: true, fullName: true } },
        lead: { select: { id: true, name: true } },
      },
    });
  }

  static async updateTask(organizationId: string, taskId: string, data: Partial<CreateTaskInput>) {
    const task = await prisma.task.findFirst({ where: { id: taskId, organizationId } });
    if (!task) throw new AppError('Task not found.', 404, 'TASK_NOT_FOUND');

    return prisma.task.update({
      where: { id: taskId },
      data: {
        ...data,
        status: data.status as TaskStatus,
        priority: data.priority as TaskPriority,
        dueDate: data.dueDate ? new Date(data.dueDate) : undefined,
      },
      include: {
        assignedUser: { select: { id: true, fullName: true } },
      },
    });
  }

  // --------------------------------------------------------------------------
  // CSV IMPORT & EXPORT
  // --------------------------------------------------------------------------
  static async exportLeadsCSV(organizationId: string) {
    const leads = await prisma.lead.findMany({
      where: { organizationId },
      include: { assignedUser: true },
      orderBy: { createdAt: 'desc' },
    });

    const records = leads.map((l: any) => ({
      ID: l.id,
      Name: l.name,
      Email: l.email || '',
      Phone: l.phone || '',
      Company: l.companyName || '',
      Status: l.status,
      Priority: l.priority,
      Industry: l.industry || '',
      EstimatedValue: l.estimatedValue,
      AIScore: l.aiScore || '',
      AIScoreReason: l.aiScoreReason || '',
      AssignedTo: l.assignedUser?.fullName || '',
      CreatedDate: l.createdAt.toISOString(),
    }));

    return Papa.unparse(records);
  }

  static async importLeadsCSV(organizationId: string, csvContent: string, creatorId?: string) {
    const parsed = Papa.parse(csvContent, { header: true, skipEmptyLines: true });
    if (parsed.errors.length > 0 && parsed.data.length === 0) {
      throw new AppError('Failed to parse CSV file. Ensure valid headers are present.', 400, 'CSV_PARSE_ERROR');
    }

    const rows: any[] = parsed.data;
    let importedCount = 0;

    for (const row of rows) {
      const name = row.Name || row.name || row['Full Name'] || row['Contact Name'];
      if (!name) continue;

      const email = row.Email || row.email || null;
      const phone = row.Phone || row.phone || null;
      const companyName = row.Company || row.company || row['Company Name'] || null;
      const industry = row.Industry || row.industry || null;
      const estimatedValue = parseFloat(row.EstimatedValue || row.value || '0') || 0;

      await this.createLead(
        organizationId,
        {
          name: name.trim(),
          email: email ? email.trim() : undefined,
          phone: phone ? phone.trim() : undefined,
          companyName: companyName ? companyName.trim() : undefined,
          industry: industry ? industry.trim() : undefined,
          estimatedValue,
          status: LeadStatus.NEW as any,
          priority: LeadPriority.MEDIUM as any,
          source: 'CSV_IMPORT',
          tags: ['CSV Import'],
        },
        creatorId
      );

      importedCount++;
    }

    return { importedCount, totalRows: rows.length };
  }
}

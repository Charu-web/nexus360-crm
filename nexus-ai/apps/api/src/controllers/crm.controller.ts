import { Request, Response, NextFunction } from 'express';
import { CRMService } from '../services/crm.service';
import { createLeadSchema, updateLeadSchema, createCompanySchema, createTaskSchema } from '@nexus-ai/validation';
import { logAuditEvent } from '../middleware/auditLogger';
import { AuditAction, LeadStatus, LeadPriority, TaskStatus } from '@prisma/client';

export const listLeads = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { search, status, priority, assignedUserId, page, limit, sortBy, sortOrder } = req.query;
    const result = await CRMService.listLeads(req.organizationId!, {
      search: search ? String(search) : undefined,
      status: status ? (status as LeadStatus) : undefined,
      priority: priority ? (priority as LeadPriority) : undefined,
      assignedUserId: assignedUserId ? String(assignedUserId) : undefined,
      page: page ? parseInt(page as string, 10) : 1,
      limit: limit ? parseInt(limit as string, 10) : 25,
      sortBy: sortBy ? String(sortBy) : undefined,
      sortOrder: sortOrder as 'asc' | 'desc',
    });

    res.status(200).json({ success: true, data: result.leads, meta: result.pagination });
  } catch (error) {
    next(error);
  }
};

export const getLead = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const lead = await CRMService.getLeadById(req.organizationId!, req.params.id as string);
    res.status(200).json({ success: true, data: lead });
  } catch (error) {
    next(error);
  }
};

export const createLead = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const validated = createLeadSchema.parse(req.body);
    const lead = await CRMService.createLead(req.organizationId!, validated, req.user?.id);

    await logAuditEvent({
      organizationId: req.organizationId!,
      userId: req.user!.id,
      action: AuditAction.CREATE,
      resource: 'Lead',
      resourceId: lead.id,
      details: `Created lead '${lead.name}' for company '${lead.companyName || 'N/A'}'`,
      req,
    });

    res.status(201).json({ success: true, message: 'Lead created successfully.', data: lead });
  } catch (error) {
    next(error);
  }
};

export const updateLead = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const validated = updateLeadSchema.parse(req.body);
    const lead = await CRMService.updateLead(req.organizationId!, req.params.id as string, validated, req.user?.id);

    await logAuditEvent({
      organizationId: req.organizationId!,
      userId: req.user!.id,
      action: AuditAction.UPDATE,
      resource: 'Lead',
      resourceId: lead.id,
      details: `Updated lead '${lead.name}'`,
      req,
    });

    res.status(200).json({ success: true, message: 'Lead updated successfully.', data: lead });
  } catch (error) {
    next(error);
  }
};

export const deleteLead = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const leadId = req.params.id as string;
    await CRMService.deleteLead(req.organizationId!, leadId);

    await logAuditEvent({
      organizationId: req.organizationId!,
      userId: req.user!.id,
      action: AuditAction.DELETE,
      resource: 'Lead',
      resourceId: leadId,
      details: `Deleted lead ${leadId}`,
      req,
    });

    res.status(200).json({ success: true, message: 'Lead deleted successfully.' });
  } catch (error) {
    next(error);
  }
};

export const listCompanies = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const companies = await CRMService.listCompanies(req.organizationId!, req.query.search ? String(req.query.search) : undefined);
    res.status(200).json({ success: true, data: companies });
  } catch (error) {
    next(error);
  }
};

export const createCompany = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const validated = createCompanySchema.parse(req.body);
    const company = await CRMService.createCompany(req.organizationId!, validated);
    res.status(201).json({ success: true, message: 'Company created.', data: company });
  } catch (error) {
    next(error);
  }
};

export const listTasks = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const tasks = await CRMService.listTasks(req.organizationId!, {
      status: req.query.status as TaskStatus,
      assignedUserId: req.query.assignedUserId ? String(req.query.assignedUserId) : undefined,
      leadId: req.query.leadId ? String(req.query.leadId) : undefined,
    });
    res.status(200).json({ success: true, data: tasks });
  } catch (error) {
    next(error);
  }
};

export const createTask = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const validated = createTaskSchema.parse(req.body);
    const task = await CRMService.createTask(req.organizationId!, validated, req.user?.id);
    res.status(201).json({ success: true, message: 'Task created.', data: task });
  } catch (error) {
    next(error);
  }
};

export const updateTask = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const task = await CRMService.updateTask(req.organizationId!, req.params.id as string, req.body);
    res.status(200).json({ success: true, message: 'Task updated.', data: task });
  } catch (error) {
    next(error);
  }
};

export const exportLeads = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const csv = await CRMService.exportLeadsCSV(req.organizationId!);
    res.header('Content-Type', 'text/csv');
    res.attachment(`leads-export-${Date.now()}.csv`);
    res.send(csv);
  } catch (error) {
    next(error);
  }
};

export const importLeads = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { csvData } = req.body;
    if (!csvData) {
      res.status(400).json({ success: false, message: 'Missing csvData in request body' });
      return;
    }
    const result = await CRMService.importLeadsCSV(req.organizationId!, csvData, req.user?.id);
    res.status(200).json({ success: true, message: `Imported ${result.importedCount} leads.`, data: result });
  } catch (error) {
    next(error);
  }
};

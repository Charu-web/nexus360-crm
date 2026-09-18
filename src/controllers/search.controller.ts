import { Request, Response, NextFunction } from 'express';
import { prisma } from '../lib/db';

export const globalUnifiedSearch = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const tenantId = (req as any).tenantId || req.tenant?.id || (req as any).user?.tenantId || (req.headers['x-tenant-id'] as string);
    if (!tenantId) {
      res.status(400).json({ success: false, message: 'Tenant context missing' });
      return;
    }

    const user = (req as any).user;
    const userRole = (user?.role?.name || user?.role || '').toUpperCase();
    const isRestricted = userRole.includes('RESTRICTED') || userRole.includes('GUEST');

    const query = typeof req.query.q === 'string' ? req.query.q.trim() : '';
    const status = typeof req.query.status === 'string' ? req.query.status.trim() : undefined;
    const source = typeof req.query.source === 'string' ? req.query.source.trim() : undefined;
    const assignedToId = typeof req.query.assignedToId === 'string' ? req.query.assignedToId.trim() : undefined;
    const startDate = typeof req.query.startDate === 'string' ? new Date(req.query.startDate) : undefined;
    const endDate = typeof req.query.endDate === 'string' ? new Date(req.query.endDate) : undefined;
    const entityFilter = typeof req.query.entity === 'string' ? req.query.entity.toLowerCase().trim() : undefined;

    if (!query && !status && !source && !assignedToId) {
      res.status(200).json({
        success: true,
        results: {
          leads: [],
          contacts: [],
          companies: [],
          deals: [],
          properties: [],
          loans: [],
          tasks: [],
          campaigns: []
        }
      });
      return;
    }

    // 1. Leads
    const leadWhere: any = { tenantId };
    if (status) leadWhere.status = status;
    if (source) leadWhere.source = { contains: source };
    if (assignedToId) leadWhere.assignedToId = assignedToId;
    if (startDate || endDate) {
      leadWhere.createdDate = {};
      if (startDate) leadWhere.createdDate.gte = startDate;
      if (endDate) leadWhere.createdDate.lte = endDate;
    }
    if (query) {
      leadWhere.OR = [
        { customerName: { contains: query } },
        { phone: { contains: query } },
        { email: { contains: query } },
        { leadId: { contains: query } },
        { campaignName: { contains: query } }
      ];
    }

    // 2. Contacts
    const contactWhere: any = { tenantId };
    if (query) {
      contactWhere.OR = [
        { name: { contains: query } },
        { email: { contains: query } },
        { phone: { contains: query } },
        { company: { contains: query } }
      ];
    }

    // 3. Companies / Customers
    const customerWhere: any = { tenantId };
    if (status) customerWhere.status = status;
    if (query) {
      customerWhere.OR = [
        { name: { contains: query } },
        { company: { contains: query } },
        { email: { contains: query } },
        { phone: { contains: query } },
        { customerId: { contains: query } }
      ];
    }

    // 4. Deals (Blocked for restricted users)
    const dealWhere: any = { tenantId };
    if (status) dealWhere.status = status;
    if (assignedToId) dealWhere.assignedToId = assignedToId;
    if (query) {
      dealWhere.OR = [
        { title: { contains: query } },
        { dealId: { contains: query } }
      ];
    }

    // 5. Properties (Units & Projects)
    const propertyWhere: any = { tenantId };
    if (status) propertyWhere.status = status;
    if (query) {
      propertyWhere.OR = [
        { unitNumber: { contains: query } },
        { block: { contains: query } },
        { unitType: { contains: query } }
      ];
    }

    // 6. Loans (Blocked for restricted users)
    const loanWhere: any = { tenantId };
    if (status) loanWhere.status = status;
    if (assignedToId) loanWhere.assignedToId = assignedToId;
    if (query) {
      loanWhere.OR = [
        { applicantName: { contains: query } },
        { applicationId: { contains: query } },
        { phone: { contains: query } },
        { loanType: { contains: query } }
      ];
    }

    // 7. Tasks
    const taskWhere: any = { tenantId };
    if (status) taskWhere.status = status;
    if (assignedToId) taskWhere.assignedToId = assignedToId;
    if (query) {
      taskWhere.OR = [
        { title: { contains: query } },
        { description: { contains: query } }
      ];
    }

    // 8. Campaigns
    const campaignWhere: any = { tenantId };
    if (status) campaignWhere.status = status;
    if (query) {
      campaignWhere.OR = [
        { name: { contains: query } },
        { code: { contains: query } }
      ];
    }

    const shouldSearch = (name: string) => !entityFilter || entityFilter === name || entityFilter === name + 's';

    const [leads, contacts, customers, deals, properties, loans, tasks, campaigns] = await Promise.all([
      shouldSearch('lead') ? prisma.lead.findMany({ where: leadWhere, take: 10, include: { assignedTo: { select: { fullName: true } } } }) : Promise.resolve([]),
      shouldSearch('contact') ? prisma.contact.findMany({ where: contactWhere, take: 10 }) : Promise.resolve([]),
      shouldSearch('customer') || shouldSearch('company') ? prisma.customer.findMany({ where: customerWhere, take: 10 }) : Promise.resolve([]),
      shouldSearch('deal') && !isRestricted ? prisma.deal.findMany({ where: dealWhere, take: 10, include: { stage: true } }) : Promise.resolve([]),
      shouldSearch('property') ? prisma.propertyUnit.findMany({ where: propertyWhere, take: 10, include: { project: { select: { name: true } } } }) : Promise.resolve([]),
      shouldSearch('loan') && !isRestricted ? prisma.loanApplication.findMany({ where: loanWhere, take: 10 }) : Promise.resolve([]),
      shouldSearch('task') ? prisma.task.findMany({ where: taskWhere, take: 10, include: { assignedTo: { select: { fullName: true } } } }) : Promise.resolve([]),
      shouldSearch('campaign') ? prisma.campaign.findMany({ where: campaignWhere, take: 10 }) : Promise.resolve([])
    ]);

    res.status(200).json({
      success: true,
      query,
      filters: { status, source, assignedToId, entityFilter },
      isRestricted,
      results: {
        leads,
        contacts,
        companies: customers,
        deals,
        properties,
        loans,
        tasks,
        campaigns
      }
    });
  } catch (error) {
    next(error);
  }
};

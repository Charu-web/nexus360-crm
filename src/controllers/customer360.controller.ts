// src/controllers/customer360.controller.ts
import { Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { TenantRequest } from '../middleware/tenant';

const prisma = new PrismaClient();

/**
 * GET /api/v1/customer360/:id and /api/v1/customer-360/:id
 * Deep relational customer aggregation covering the entire lifecycle:
 * Customer -> Leads -> Deals -> Loans -> Properties -> Bookings -> Installments -> Activities -> Tasks -> Docs -> Comms
 */
export async function getCustomer360(req: TenantRequest, res: Response) {
  try {
    const tenantId = req.tenantId!;
    const id = String(req.params.id);

    // 1. Check in Customer table
    const customer = await prisma.customer.findFirst({
      where: {
        tenantId,
        OR: [{ id }, { customerId: id }, { email: id }, { phone: id }]
      },
      include: {
        contacts: true,
        notes: {
          include: { createdBy: { select: { fullName: true } } },
          orderBy: { createdAt: 'desc' }
        },
        deals: {
          include: {
            pipeline: { select: { name: true } },
            stage: { select: { name: true, color: true } },
            assignedTo: { select: { fullName: true } }
          },
          orderBy: { createdAt: 'desc' }
        },
        loanApplications: {
          orderBy: { createdDate: 'desc' }
        },
        siteVisits: {
          include: { project: { select: { name: true } } },
          orderBy: { visitDate: 'desc' }
        },
        propertyBookings: {
          include: {
            project: { select: { name: true } },
            unit: { select: { unitNumber: true, block: true } },
            installments: { orderBy: { installmentNumber: 'asc' } }
          },
          orderBy: { bookingDate: 'desc' }
        }
      }
    });

    if (!customer) {
      // 2. Check in Lead table
      const lead = await prisma.lead.findFirst({
        where: { tenantId, OR: [{ id }, { leadId: id }, { phone: id }, { email: id }] },
        include: {
          deals: true,
          loanApplications: true,
          siteVisits: true,
          propertyBookings: {
            include: { installments: true, project: true, unit: true }
          },
          tasks: true,
          notesList: true,
          activities: true
        }
      });

      if (!lead) {
        return res.status(404).json({ success: false, message: 'Customer or Lead profile not found.' });
      }

      // Convert lead to full Customer 360 profile
      const documents = await prisma.document.findMany({ where: { tenantId, entityId: lead.id } });
      const communications = await prisma.communicationMessage.findMany({ where: { tenantId, leadId: lead.id } });
      const dealTotal = lead.deals.reduce((sum: number, d: any) => sum + (d.amount || 0), 0);
      const bookingTotal = lead.propertyBookings.reduce((sum: number, b: any) => sum + (b.agreementValue || 0), 0);
      const totalLTV = Math.max(lead.amount || 0, dealTotal + bookingTotal);

      const virtualCustomer = {
        id: lead.id,
        customerId: lead.leadId || 'CUST-' + lead.id.substring(0, 6),
        name: lead.customerName,
        fullName: lead.customerName,
        email: lead.email || '',
        phone: lead.phone,
        city: lead.city || 'Primary Region',
        company: lead.industry ? `${lead.industry} Client` : 'Direct Customer',
        status: lead.status || 'Active',
        leadScore: lead.leadScore || 65,
        leadScoreCategory: lead.leadScoreCategory || 'WARM',
        assignedTo: lead.assignedToId ? { fullName: 'Assigned Account Executive' } : null,
        totalDeals: lead.deals.length,
        dealsCount: lead.deals.length,
        bookingsCount: lead.propertyBookings.length,
        loansCount: lead.loanApplications.length,
        tasksCount: lead.tasks.length,
        lifetimeValue: totalLTV,
        leads: [lead],
        deals: lead.deals,
        loanApplications: lead.loanApplications,
        siteVisits: lead.siteVisits,
        propertyBookings: lead.propertyBookings,
        notes: lead.notesList,
        tasks: lead.tasks,
        activities: lead.activities,
        documents,
        communications,
        isVirtual: true,
        createdAt: lead.createdDate
      };

      return res.json({ success: true, customer: virtualCustomer });
    }

    // Related leads by email or phone
    const relatedLeads = await prisma.lead.findMany({
      where: {
        tenantId,
        OR: [
          ...(customer.phone ? [{ phone: customer.phone }] : []),
          ...(customer.email ? [{ email: customer.email }] : [])
        ]
      },
      include: { tasks: true, activities: true }
    });

    const leadIds = relatedLeads.map(l => l.id);

    // Related documents
    const documents = await prisma.document.findMany({
      where: {
        tenantId,
        OR: [
          { entityType: 'Customer', entityId: customer.id },
          ...(leadIds.length > 0 ? [{ entityType: 'Lead', entityId: { in: leadIds } }] : [])
        ]
      },
      orderBy: { createdAt: 'desc' }
    });

    // Related communications
    const communications = await prisma.communicationMessage.findMany({
      where: {
        tenantId,
        OR: [
          { customerId: customer.id },
          ...(leadIds.length > 0 ? [{ leadId: { in: leadIds } }] : [])
        ]
      },
      orderBy: { createdAt: 'desc' }
    });

    // Related tasks
    const dealIds = customer.deals.map((d: any) => d.id);
    const taskConditions: any[] = [];
    if (leadIds.length > 0) taskConditions.push({ leadId: { in: leadIds } });
    if (dealIds.length > 0) taskConditions.push({ dealId: { in: dealIds } });

    const tasks = taskConditions.length > 0 
      ? await prisma.task.findMany({
          where: { tenantId, OR: taskConditions },
          orderBy: { dueDate: 'asc' }
        })
      : [];

    // Aggregated Lifetime Value
    const dealTotal = customer.deals.filter((d: any) => d.status === 'WON').reduce((s: number, d: any) => s + (d.amount || 0), 0);
    const bookingTotal = customer.propertyBookings.reduce((s: number, b: any) => s + (b.agreementValue || 0), 0);
    const calculatedLTV = Math.max(customer.lifetimeValue || 0, dealTotal + bookingTotal);

    return res.json({
      success: true,
      customer: {
        ...customer,
        fullName: customer.name,
        lifetimeValue: calculatedLTV,
        leads: relatedLeads,
        tasks,
        documents,
        communications
      }
    });
  } catch (err: any) {
    return res.status(500).json({ success: false, message: err.message });
  }
}

/**
 * GET /api/v1/customer360 and /api/v1/customer-360
 * Lists customers with aggregated metrics. Fallback merges leads as profiles.
 */
export async function listCustomers(req: TenantRequest, res: Response) {
  try {
    const tenantId = req.tenantId!;
    const { search, limit = 50 } = req.query;

    const where: any = { tenantId };
    if (search) {
      const q = String(search).trim();
      where.OR = [
        { name: { contains: q } },
        { email: { contains: q } },
        { phone: { contains: q } },
        { customerId: { contains: q } }
      ];
    }

    const customers = await prisma.customer.findMany({
      where,
      take: Number(limit),
      orderBy: { createdDate: 'desc' },
      include: {
        deals: { select: { id: true, amount: true, status: true } },
        propertyBookings: { select: { id: true, agreementValue: true } },
        loanApplications: { select: { id: true, requestedAmount: true, status: true } }
      }
    });

    // If fewer than 5 customers, also list prominent leads as 360 profiles
    let profiles = customers.map((c: any) => ({
      id: c.id,
      customerId: c.customerId,
      name: c.name,
      fullName: c.name,
      email: c.email,
      phone: c.phone,
      city: c.city,
      company: c.company,
      status: c.status,
      totalDeals: c.deals?.length || 0,
      dealsCount: c.deals?.length || 0,
      bookingsCount: c.propertyBookings?.length || 0,
      loansCount: c.loanApplications?.length || 0,
      lifetimeValue: c.lifetimeValue || 0,
      createdDate: c.createdDate
    }));

    if (profiles.length < 10) {
      const leads = await prisma.lead.findMany({
        where: { tenantId },
        take: 20,
        orderBy: { createdDate: 'desc' },
        include: {
          deals: true,
          propertyBookings: true,
          loanApplications: true
        }
      });

      const existingPhones = new Set(profiles.map(p => p.phone));
      const existingEmails = new Set(profiles.map(p => p.email).filter(Boolean));

      leads.forEach(l => {
        if (!existingPhones.has(l.phone) && (!l.email || !existingEmails.has(l.email))) {
          profiles.push({
            id: l.id,
            customerId: l.leadId || 'CUST-' + l.id.substring(0, 6),
            name: l.customerName,
            fullName: l.customerName,
            email: l.email || '',
            phone: l.phone,
            city: l.city || 'Primary Region',
            company: l.industry ? `${l.industry} Client` : 'Direct Customer',
            status: l.status || 'Active',
            totalDeals: l.deals.length,
            dealsCount: l.deals.length,
            bookingsCount: l.propertyBookings.length,
            loansCount: l.loanApplications.length,
            lifetimeValue: l.amount || 500000,
            createdDate: l.createdDate
          });
        }
      });
    }

    return res.json({
      success: true,
      customers: profiles
    });
  } catch (err: any) {
    return res.status(500).json({ success: false, message: err.message });
  }
}

// src/controllers/realEstate.controller.ts
import { Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { TenantRequest } from '../middleware/tenant';
import { AutomationEngine } from '../services/automation.service';

const prisma = new PrismaClient();

// ============================================================================
// 1. PROJECTS & INVENTORY
// ============================================================================

export async function getProjects(req: TenantRequest, res: Response) {
  try {
    const tenantId = req.tenantId!;
    const projects = await prisma.realEstateProject.findMany({
      where: { tenantId },
      orderBy: { createdDate: 'desc' },
      include: {
        units: true,
        siteVisits: true,
        bookings: true
      }
    });

    const enriched = projects.map(p => {
      const totalUnits = p.units.length;
      const availableUnits = p.units.filter(u => u.status === 'Available').length;
      const bookedUnits = p.units.filter(u => u.status === 'Booked').length;
      const soldUnits = p.units.filter(u => u.status === 'Sold').length;
      return {
        ...p,
        stats: { totalUnits, availableUnits, bookedUnits, soldUnits }
      };
    });

    return res.json({ success: true, projects: enriched });
  } catch (err: any) {
    return res.status(500).json({ success: false, message: err.message });
  }
}

export async function createProject(req: TenantRequest, res: Response) {
  try {
    const tenantId = req.tenantId!;
    const {
      name,
      code,
      location,
      city = 'Mumbai',
      projectType = 'Plotted Development',
      totalArea,
      startDate,
      expectedCompletion
    } = req.body;

    if (!name || !code || !location) {
      return res.status(400).json({ success: false, message: 'Name, project code, and location are required' });
    }

    const count = await prisma.realEstateProject.count({ where: { tenantId } });
    const projectId = `PROJ-${100 + count + 1}`;

    const project = await prisma.realEstateProject.create({
      data: {
        tenantId,
        projectId,
        name,
        code,
        location,
        city,
        projectType,
        totalArea: totalArea || null,
        startDate: startDate ? new Date(startDate) : null,
        expectedCompletion: expectedCompletion ? new Date(expectedCompletion) : null,
        status: 'Active'
      }
    });

    return res.status(201).json({ success: true, project });
  } catch (err: any) {
    return res.status(500).json({ success: false, message: err.message });
  }
}

// ============================================================================
// 2. PROPERTY UNITS & PLOTS
// ============================================================================

export async function getPropertyUnits(req: TenantRequest, res: Response) {
  try {
    const tenantId = req.tenantId!;
    const { projectId, status, block, unitType, search } = req.query;

    const where: any = { tenantId };
    if (projectId) where.projectId = String(projectId);
    if (status) where.status = String(status);
    if (block) where.block = String(block);
    if (unitType) where.unitType = String(unitType);

    if (search) {
      const q = String(search).trim();
      where.OR = [
        { unitNumber: { contains: q } },
        { block: { contains: q } }
      ];
    }

    const units = await prisma.propertyUnit.findMany({
      where,
      orderBy: { unitNumber: 'asc' },
      include: {
        project: { select: { id: true, name: true, location: true } },
        assignedAgent: { select: { id: true, fullName: true } }
      }
    });

    const summary = {
      total: units.length,
      available: units.filter(u => u.status === 'Available').length,
      booked: units.filter(u => u.status === 'Booked').length,
      sold: units.filter(u => u.status === 'Sold').length,
      blocked: units.filter(u => u.status === 'Blocked').length,
      totalInventoryValue: units.reduce((s, u) => s + (u.totalPrice || 0), 0)
    };

    return res.json({ success: true, summary, units });
  } catch (err: any) {
    return res.status(500).json({ success: false, message: err.message });
  }
}

export async function createPropertyUnit(req: TenantRequest, res: Response) {
  try {
    const tenantId = req.tenantId!;
    const {
      projectId,
      unitNumber,
      block = 'Block A',
      unitType = 'Plot',
      sizeSqFt = 1200,
      facing = 'East',
      basePrice,
      totalPrice,
      assignedAgentId
    } = req.body;

    if (!projectId || !unitNumber || !totalPrice) {
      return res.status(400).json({ success: false, message: 'Project ID, unit/plot number, and total price required.' });
    }

    const unit = await prisma.propertyUnit.create({
      data: {
        tenantId,
        projectId,
        unitNumber,
        block,
        unitType,
        sizeSqFt: Number(sizeSqFt),
        facing,
        basePrice: Number(basePrice || totalPrice),
        totalPrice: Number(totalPrice),
        status: 'Available',
        assignedAgentId: assignedAgentId || null
      }
    });

    return res.status(201).json({ success: true, unit });
  } catch (err: any) {
    return res.status(500).json({ success: false, message: err.message });
  }
}

export async function updatePropertyUnitStatus(req: TenantRequest, res: Response) {
  try {
    const tenantId = req.tenantId!;
    const id = String(req.params.id);
    const { status, assignedCustomerId, assignedAgentId } = req.body;

    const unit = await prisma.propertyUnit.findFirst({ where: { id, tenantId } });
    if (!unit) return res.status(404).json({ success: false, message: 'Unit not found' });

    const updated = await prisma.propertyUnit.update({
      where: { id },
      data: {
        status: status || unit.status,
        assignedCustomerId: assignedCustomerId !== undefined ? assignedCustomerId : unit.assignedCustomerId,
        assignedAgentId: assignedAgentId !== undefined ? assignedAgentId : unit.assignedAgentId
      }
    });

    return res.json({ success: true, unit: updated });
  } catch (err: any) {
    return res.status(500).json({ success: false, message: err.message });
  }
}

// ============================================================================
// 3. SITE VISITS
// ============================================================================

export async function getSiteVisits(req: TenantRequest, res: Response) {
  try {
    const tenantId = req.tenantId!;
    const { status, projectId } = req.query;

    const where: any = { tenantId };
    if (status) where.status = String(status);
    if (projectId) where.projectId = String(projectId);

    const siteVisits = await prisma.siteVisit.findMany({
      where,
      orderBy: { visitDate: 'desc' },
      include: {
        project: { select: { id: true, name: true, location: true } },
        unit: { select: { id: true, unitNumber: true, block: true } },
        lead: { select: { id: true, leadId: true, customerName: true } },
        assignedExecutive: { select: { id: true, fullName: true } }
      }
    });

    return res.json({ success: true, siteVisits });
  } catch (err: any) {
    return res.status(500).json({ success: false, message: err.message });
  }
}

export async function scheduleSiteVisit(req: TenantRequest, res: Response) {
  try {
    const tenantId = req.tenantId!;
    const {
      projectId,
      unitId,
      leadId,
      customerId,
      visitorName,
      phone,
      visitDate,
      assignedExecutiveId
    } = req.body;

    if (!visitorName || !phone || !visitDate) {
      return res.status(400).json({ success: false, message: 'Visitor name, phone, and visit date are required.' });
    }

    const visit = await prisma.siteVisit.create({
      data: {
        tenantId,
        projectId: projectId || null,
        unitId: unitId || null,
        leadId: leadId || null,
        customerId: customerId || null,
        visitorName,
        phone,
        visitDate: new Date(visitDate),
        assignedExecutiveId: assignedExecutiveId || null,
        status: 'Scheduled',
        outcome: 'Interested'
      }
    });

    // Auto-create Activity
    await prisma.activity.create({
      data: {
        tenantId,
        title: `Site Visit Scheduled: ${visitorName}`,
        details: `Visit date: ${new Date(visitDate).toLocaleString()} (Phone: ${phone})`,
        type: 'SITE_VISIT',
        entityType: 'SiteVisit',
        entityId: visit.id
      }
    });

    // Fire Automation Trigger
    await AutomationEngine.processEvent(tenantId, 'site_visit.scheduled', {
      id: visit.id,
      visitorName: visit.visitorName,
      phone: visit.phone,
      visitDate: visit.visitDate,
      projectId: visit.projectId,
      unitId: visit.unitId,
      assignedExecutiveId: visit.assignedExecutiveId
    });

    return res.status(201).json({ success: true, siteVisit: visit });
  } catch (err: any) {
    return res.status(500).json({ success: false, message: err.message });
  }
}

export async function updateSiteVisit(req: TenantRequest, res: Response) {
  try {
    const tenantId = req.tenantId!;
    const id = String(req.params.id);
    const { status, feedback, outcome } = req.body;

    const existing = await prisma.siteVisit.findFirst({ where: { id, tenantId } });
    if (!existing) return res.status(404).json({ success: false, message: 'Site visit not found' });

    const updated = await prisma.siteVisit.update({
      where: { id },
      data: {
        status: status || existing.status,
        feedback: feedback !== undefined ? feedback : existing.feedback,
        outcome: outcome || existing.outcome
      }
    });

    if (status === 'Completed') {
      await AutomationEngine.processEvent(tenantId, 'site_visit.completed', {
        id: updated.id,
        visitorName: updated.visitorName,
        outcome: updated.outcome,
        feedback: updated.feedback
      });
    }

    return res.json({ success: true, siteVisit: updated });
  } catch (err: any) {
    return res.status(500).json({ success: false, message: err.message });
  }
}

// ============================================================================
// 4. BOOKINGS & INSTALLMENT MILESTONES
// ============================================================================

export async function getBookings(req: TenantRequest, res: Response) {
  try {
    const tenantId = req.tenantId!;
    const bookings = await prisma.propertyBooking.findMany({
      where: { tenantId },
      orderBy: { bookingDate: 'desc' },
      include: {
        project: { select: { id: true, name: true, location: true } },
        unit: { select: { id: true, unitNumber: true, block: true, sizeSqFt: true } },
        customer: { select: { id: true, name: true, phone: true } },
        salesExecutive: { select: { id: true, fullName: true } },
        installments: { orderBy: { installmentNumber: 'asc' } }
      }
    });

    return res.json({ success: true, bookings });
  } catch (err: any) {
    return res.status(500).json({ success: false, message: err.message });
  }
}

export async function createBooking(req: TenantRequest, res: Response) {
  try {
    const tenantId = req.tenantId!;
    const {
      projectId,
      unitId,
      customerId,
      leadId,
      salesExecutiveId,
      agreementValue,
      tokenAmount,
      paymentPlan = 'Construction Linked',
      notes
    } = req.body;

    if (!projectId || !unitId || !agreementValue || !tokenAmount) {
      return res.status(400).json({ success: false, message: 'Project, unit, agreement value, and token amount required.' });
    }

    const count = await prisma.propertyBooking.count({ where: { tenantId } });
    const bookingId = `BKG-${new Date().getFullYear()}-${100 + count + 1}`;

    const totalVal = Number(agreementValue);
    const tokenVal = Number(tokenAmount);
    const balance = totalVal - tokenVal;

    const booking = await prisma.propertyBooking.create({
      data: {
        tenantId,
        bookingId,
        projectId,
        unitId,
        customerId: customerId || null,
        leadId: leadId || null,
        salesExecutiveId: salesExecutiveId || null,
        agreementValue: totalVal,
        tokenAmount: tokenVal,
        totalPaidAmount: tokenVal,
        balanceAmount: balance,
        paymentPlan,
        status: 'Token Paid',
        notes: notes || null
      }
    });

    // Update Unit status to 'Booked'
    await prisma.propertyUnit.update({
      where: { id: unitId },
      data: { status: 'Booked', assignedCustomerId: customerId || null }
    });

    // Auto-generate standard 5-stage installment milestones
    const milestones = [
      { name: 'Token Advance', pct: 0.10, dueDays: 0, status: 'Paid', paid: tokenVal },
      { name: 'Agreement Signing (20%)', pct: 0.10, dueDays: 30, status: 'Pending', paid: 0 },
      { name: 'Plinth / Foundation (25%)', pct: 0.25, dueDays: 90, status: 'Pending', paid: 0 },
      { name: 'Structure Completion (30%)', pct: 0.30, dueDays: 180, status: 'Pending', paid: 0 },
      { name: 'Possession & Handover (25%)', pct: 0.25, dueDays: 365, status: 'Pending', paid: 0 }
    ];

    for (let i = 0; i < milestones.length; i++) {
      const m = milestones[i];
      const amt = Math.round(totalVal * m.pct);
      const dueDate = new Date(Date.now() + m.dueDays * 24 * 60 * 60 * 1000);
      await prisma.propertyInstallment.create({
        data: {
          tenantId,
          bookingId: booking.id,
          installmentNumber: i + 1,
          milestoneName: m.name,
          dueDate,
          amount: amt,
          paidAmount: m.status === 'Paid' ? amt : 0,
          status: m.status
        }
      });
    }

    // Fire Automation Trigger
    await AutomationEngine.processEvent(tenantId, 'payment.received', {
      id: booking.id,
      bookingId: booking.bookingId,
      amount: tokenVal,
      projectId: booking.projectId,
      unitId: booking.unitId
    });

    return res.status(201).json({ success: true, booking });
  } catch (err: any) {
    return res.status(500).json({ success: false, message: err.message });
  }
}

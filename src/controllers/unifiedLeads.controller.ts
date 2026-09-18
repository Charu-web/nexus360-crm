// src/controllers/unifiedLeads.controller.ts
import { Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { TenantRequest } from '../middleware/tenant';
import { AIService } from '../services/ai.service';
import { AutomationEngine } from '../services/automation.service';
import { calculateEMI } from './loans.controller';

const prisma = new PrismaClient();

/**
 * GET /api/v1/unified-leads
 * Filters across all industries, sources, statuses, scores, and tags.
 */
export async function getUnifiedLeads(req: TenantRequest, res: Response) {
  try {
    const tenantId = req.tenantId!;
    const {
      status,
      industry,
      source,
      priority,
      scoreCategory,
      assignedToId,
      search,
      page = 1,
      limit = 50
    } = req.query;

    const where: any = { tenantId };

    if (status) where.status = String(status);
    if (industry) where.industry = String(industry);
    if (source) where.source = { contains: String(source) };
    if (priority) where.priority = String(priority);
    if (scoreCategory) where.leadScoreCategory = String(scoreCategory);
    if (assignedToId) where.assignedToId = String(assignedToId);

    if (search) {
      const q = String(search).trim();
      where.OR = [
        { customerName: { contains: q } },
        { phone: { contains: q } },
        { email: { contains: q } },
        { leadId: { contains: q } },
        { city: { contains: q } }
      ];
    }

    const skip = (Number(page) - 1) * Number(limit);
    const take = Number(limit);

    const [total, leads, wonDealsCount, lostDealsCount, overdueFollowUps] = await Promise.all([
      prisma.lead.count({ where }),
      prisma.lead.findMany({
        where,
        skip,
        take,
        orderBy: { createdDate: 'desc' },
        include: {
          assignedTo: { select: { id: true, fullName: true, email: true, department: true } },
          pipeline: { select: { id: true, name: true } },
          stage: { select: { id: true, name: true, color: true } },
          deals: { select: { id: true, dealId: true, title: true, amount: true, status: true } },
          loanApplications: { select: { id: true, applicationId: true, loanType: true, status: true, requestedAmount: true } },
          siteVisits: { select: { id: true, visitDate: true, status: true, outcome: true } }
        }
      }),
      prisma.deal.count({ where: { tenantId, status: 'WON' } }).catch(() => 0),
      prisma.deal.count({ where: { tenantId, status: 'LOST' } }).catch(() => 0),
      prisma.followUp.count({ where: { tenantId, status: 'PENDING', scheduledAt: { lte: new Date() } } }).catch(() => 0)
    ]);

    const totalPipelineValue = leads.reduce((s, l) => s + (l.amount || 0), 0);
    const wonCount = wonDealsCount || leads.filter(l => l.status === 'Won' || l.status === 'Converted').length;
    const lostCount = lostDealsCount || leads.filter(l => l.status === 'Lost').length;
    const conversionRate = total > 0 ? Math.round((wonCount / total) * 100) : 0;

    // Funnel stages
    const funnel = {
      new: leads.filter(l => l.status === 'New').length,
      contacted: leads.filter(l => l.status === 'Contacted').length,
      qualified: leads.filter(l => l.status === 'Qualified').length,
      negotiation: leads.filter(l => l.status === 'Negotiation' || l.status === 'Follow-up').length,
      won: wonCount,
      lost: lostCount
    };

    // By source breakdown
    const sourceBreakdown: Record<string, number> = {};
    leads.forEach(l => {
      const src = l.source || 'Other';
      sourceBreakdown[src] = (sourceBreakdown[src] || 0) + 1;
    });

    // Aggregate key metrics
    const stats = {
      total,
      hotCount: leads.filter(l => l.leadScoreCategory === 'HOT').length,
      warmCount: leads.filter(l => l.leadScoreCategory === 'WARM').length,
      coldCount: leads.filter(l => l.leadScoreCategory === 'COLD').length,
      avgScore: leads.length > 0 ? Math.round(leads.reduce((s, l) => s + (l.leadScore || 0), 0) / leads.length) : 50,
      totalPipelineValue,
      expectedRevenue: Math.round(totalPipelineValue * 0.42),
      conversionRate,
      dealsWon: wonCount,
      dealsLost: lostCount,
      overdueFollowups: overdueFollowUps,
      funnel,
      sourceBreakdown
    };

    return res.json({
      success: true,
      stats,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total,
        totalPages: Math.ceil(total / Number(limit))
      },
      leads
    });
  } catch (err: any) {
    return res.status(500).json({ success: false, message: err.message });
  }
}

/**
 * POST /api/v1/unified-leads
 * Centralized ingestion of leads from ANY source (Website, Facebook, Loan, Property, Manual, API).
 * Performs auto-routing, automatic AI scoring, and workflow triggering.
 */
export async function createUnifiedLead(req: TenantRequest, res: Response) {
  try {
    const tenantId = req.tenantId!;
    const {
      customerName,
      phone,
      email,
      city,
      amount = 0,
      source = 'Website',
      industry = 'GENERAL',
      campaignName,
      priority = 'Medium',
      notes,
      assignedToId,
      pipelineId,
      stageId,
      tags = []
    } = req.body;

    if (!customerName || !phone) {
      return res.status(400).json({ success: false, message: 'Customer name and phone number are required.' });
    }

    // Check Duplicate Detection
    const { allowDuplicate = false } = req.body;
    if (!allowDuplicate) {
      const dupConditions: any[] = [{ phone }];
      if (email) dupConditions.push({ email });
      const duplicate = await prisma.lead.findFirst({
        where: { tenantId, OR: dupConditions }
      });
      if (duplicate) {
        return res.status(409).json({
          success: false,
          isDuplicate: true,
          message: 'Possible duplicate lead found with matching phone or email.',
          existingLead: {
            id: duplicate.id,
            leadId: duplicate.leadId,
            customerName: duplicate.customerName,
            phone: duplicate.phone,
            email: duplicate.email,
            status: duplicate.status,
            industry: duplicate.industry,
            createdDate: duplicate.createdDate
          }
        });
      }
    }

    const count = await prisma.lead.count({ where: { tenantId } });
    const leadId = `NX-LD-${1000 + count + 1}`;

    // 1. Initial AI Lead Score
    const leadData = {
      customerName,
      phone,
      email,
      city,
      amount: Number(amount),
      source,
      industry,
      status: 'New',
      priority
    };
    const scoreResult = AIService.calculateLeadScore(leadData, [], []);

    // 2. Intelligent Auto-Assignment
    let finalAssignedTo = assignedToId;
    if (!finalAssignedTo) {
      const targetDept = industry === 'LOAN' ? 'Finance' : industry === 'REAL_ESTATE' ? 'Sales' : 'Sales';
      const candidate = await prisma.user.findFirst({
        where: { tenantId, department: targetDept, isActive: true }
      });
      if (candidate) finalAssignedTo = candidate.id;
    }

    // 3. Persist Unified Lead
    const lead = await prisma.lead.create({
      data: {
        tenantId,
        leadId,
        customerName,
        phone,
        email: email || null,
        city: city || null,
        amount: Number(amount),
        source,
        industry,
        campaignName: campaignName || null,
        status: 'New',
        priority,
        leadScore: scoreResult.score,
        leadScoreCategory: scoreResult.category,
        leadScoreReason: JSON.stringify(scoreResult.reasons),
        tags: Array.isArray(tags) ? JSON.stringify(tags) : JSON.stringify([tags]),
        notes: notes || null,
        assignedToId: finalAssignedTo || null,
        pipelineId: pipelineId || null,
        stageId: stageId || null
      }
    });

    // 4. Automated Vertical Routing
    if (industry === 'LOAN' && Number(amount) > 0) {
      const lCount = await prisma.loanApplication.count({ where: { tenantId } });
      const P = Number(amount);
      await prisma.loanApplication.create({
        data: {
          tenantId,
          applicationId: `LOAN-${1000 + lCount + 1}`,
          applicantName: customerName,
          phone,
          email: email || null,
          loanType: 'Personal Loan',
          requestedAmount: P,
          emiAmount: calculateEMI(P, 10.5, 36),
          status: 'Submitted',
          leadId: lead.id,
          assignedToId: finalAssignedTo || null
        }
      });
    } else if (industry === 'REAL_ESTATE') {
      if (finalAssignedTo) {
        await prisma.task.create({
          data: {
            tenantId,
            title: `Contact ${customerName} to schedule Property Site Visit`,
            description: `Auto-assigned Real Estate enquiry from ${source}. Explore project preferences and invite for weekend site visit.`,
            priority: 'High',
            status: 'Pending',
            dueDate: new Date(Date.now() + 24 * 60 * 60 * 1000),
            assignedToId: finalAssignedTo,
            leadId: lead.id
          }
        });
      }
    }

    // 5. Trigger Workflow Engine
    await AutomationEngine.processEvent(tenantId, 'lead.created', lead);

    if (lead.leadScore >= 70) {
      await AutomationEngine.processEvent(tenantId, 'lead.score_high', lead);
    }

    return res.status(201).json({ success: true, lead });
  } catch (err: any) {
    return res.status(500).json({ success: false, message: err.message });
  }
}

/**
 * PATCH /api/v1/unified-leads/:id
 * Updates lead status, stage, or assignment and recalculates AI insights.
 */
export async function updateUnifiedLead(req: TenantRequest, res: Response) {
  try {
    const tenantId = req.tenantId!;
    const id = String(req.params.id);
    const updates = req.body;

    const existing = await prisma.lead.findFirst({
      where: { id, tenantId },
      include: { activities: true, deals: true }
    });

    if (!existing) {
      return res.status(404).json({ success: false, message: 'Lead not found' });
    }

    const updated = await prisma.lead.update({
      where: { id },
      data: {
        customerName: updates.customerName !== undefined ? updates.customerName : existing.customerName,
        phone: updates.phone !== undefined ? updates.phone : existing.phone,
        email: updates.email !== undefined ? updates.email : existing.email,
        city: updates.city !== undefined ? updates.city : existing.city,
        amount: updates.amount !== undefined ? Number(updates.amount) : existing.amount,
        status: updates.status !== undefined ? updates.status : existing.status,
        priority: updates.priority !== undefined ? updates.priority : existing.priority,
        industry: updates.industry !== undefined ? updates.industry : existing.industry,
        assignedToId: updates.assignedToId !== undefined ? updates.assignedToId : existing.assignedToId,
        stageId: updates.stageId !== undefined ? updates.stageId : existing.stageId,
        notes: updates.notes !== undefined ? updates.notes : existing.notes
      }
    });

    const existingAny = existing as any;
    const reScore = AIService.calculateLeadScore(updated, existingAny.activities || [], existingAny.deals || []);
    await prisma.lead.update({
      where: { id },
      data: {
        leadScore: reScore.score,
        leadScoreCategory: reScore.category,
        leadScoreReason: JSON.stringify(reScore.reasons)
      }
    });

    if (updates.status && updates.status !== existing.status) {
      await AutomationEngine.processEvent(tenantId, 'lead.status_changed', {
        ...updated,
        oldStatus: existing.status,
        newStatus: updates.status
      });

      await prisma.auditLog.create({
        data: {
          tenantId,
          userId: (req as any).user?.id || null,
          action: 'LEAD_STATUS_UPDATED',
          entity: 'Lead',
          entityId: updated.id,
          details: `Changed status from "${existing.status}" to "${updates.status}"`
        }
      });
    }

    return res.json({ success: true, lead: { ...updated, leadScore: reScore.score, leadScoreCategory: reScore.category } });
  } catch (err: any) {
    return res.status(500).json({ success: false, message: err.message });
  }
}

/**
 * GET /api/v1/unified-leads/:id
 * Returns deep relational lead details across all vertical touchpoints.
 */
export async function getLeadDetails(req: TenantRequest, res: Response) {
  try {
    const tenantId = req.tenantId!;
    const id = String(req.params.id);

    const lead = await prisma.lead.findFirst({
      where: { id, tenantId },
      include: {
        assignedTo: { select: { id: true, fullName: true, email: true, department: true } },
        pipeline: { select: { id: true, name: true } },
        stage: { select: { id: true, name: true, color: true } },
        activities: { orderBy: { createdAt: 'desc' } },
        notesList: {
          include: { createdBy: { select: { fullName: true } } },
          orderBy: { createdAt: 'desc' }
        },
        tasks: {
          include: { assignedTo: { select: { fullName: true } } },
          orderBy: { dueDate: 'asc' }
        },
        followUps: { orderBy: { scheduledAt: 'desc' } },
        deals: { orderBy: { createdAt: 'desc' } },
        loanApplications: { orderBy: { createdDate: 'desc' } },
        siteVisits: { orderBy: { visitDate: 'desc' } },
        propertyBookings: { orderBy: { bookingDate: 'desc' } },
        socialConversations: { orderBy: { createdDate: 'desc' } }
      }
    });

    if (!lead) {
      return res.status(404).json({ success: false, message: 'Lead not found.' });
    }

    const documents = await prisma.document.findMany({
      where: { tenantId, entityType: 'Lead', entityId: id },
      orderBy: { createdAt: 'desc' }
    });

    return res.json({
      success: true,
      lead: {
        ...lead,
        documents
      }
    });
  } catch (err: any) {
    return res.status(500).json({ success: false, message: err.message });
  }
}

/**
 * POST /api/v1/unified-leads/check-duplicate
 * Checks if a lead with same phone or email exists.
 */
export async function checkDuplicateLead(req: TenantRequest, res: Response) {
  try {
    const tenantId = req.tenantId!;
    const { phone, email } = req.body;

    if (!phone && !email) {
      return res.status(400).json({ success: false, message: 'Phone or email is required for duplicate check.' });
    }

    const conditions: any[] = [];
    if (phone) conditions.push({ phone });
    if (email) conditions.push({ email });

    const existing = await prisma.lead.findFirst({
      where: { tenantId, OR: conditions },
      include: { assignedTo: { select: { fullName: true } } }
    });

    if (existing) {
      return res.json({
        success: true,
        isDuplicate: true,
        message: 'Possible duplicate lead found',
        existingLead: {
          id: existing.id,
          leadId: existing.leadId,
          customerName: existing.customerName,
          phone: existing.phone,
          email: existing.email,
          status: existing.status,
          industry: existing.industry,
          assignedTo: existing.assignedTo?.fullName || 'Unassigned',
          leadScore: existing.leadScore,
          createdDate: existing.createdDate
        }
      });
    }

    return res.json({ success: true, isDuplicate: false });
  } catch (err: any) {
    return res.status(500).json({ success: false, message: err.message });
  }
}

/**
 * POST /api/v1/unified-leads/merge
 * Merges source lead into target lead, moving tasks, notes, deals, and activities.
 */
export async function mergeLeads(req: TenantRequest, res: Response) {
  try {
    const tenantId = req.tenantId!;
    const { sourceLeadId, targetLeadId } = req.body;

    if (!sourceLeadId || !targetLeadId) {
      return res.status(400).json({ success: false, message: 'Source and Target lead IDs are required.' });
    }

    const [source, target] = await Promise.all([
      prisma.lead.findFirst({ where: { id: sourceLeadId, tenantId } }),
      prisma.lead.findFirst({ where: { id: targetLeadId, tenantId } })
    ]);

    if (!source || !target) {
      return res.status(404).json({ success: false, message: 'One or both leads not found.' });
    }

    // Re-link related records to target
    await Promise.all([
      prisma.task.updateMany({ where: { leadId: source.id }, data: { leadId: target.id } }),
      prisma.note.updateMany({ where: { leadId: source.id }, data: { leadId: target.id } }),
      prisma.deal.updateMany({ where: { leadId: source.id }, data: { leadId: target.id } }),
      prisma.followUp.updateMany({ where: { leadId: source.id }, data: { leadId: target.id } }),
      prisma.leadActivity.updateMany({ where: { leadId: source.id }, data: { leadId: target.id } }),
      prisma.document.updateMany({ where: { entityType: 'Lead', entityId: source.id }, data: { entityId: target.id } })
    ]);

    // Record audit log & merge note
    await prisma.note.create({
      data: {
        tenantId,
        leadId: target.id,
        content: `Merged duplicate lead ${source.customerName} (${source.leadId}) into this lead on ${new Date().toLocaleString()}.`,
        createdById: (req as any).user?.id || target.assignedToId || ''
      }
    });

    await prisma.auditLog.create({
      data: {
        tenantId,
        userId: (req as any).user?.id || null,
        action: 'LEAD_MERGED',
        entity: 'Lead',
        entityId: target.id,
        details: `Merged duplicate ${source.id} into target ${target.id}`
      }
    });

    // Remove source lead
    await prisma.lead.delete({ where: { id: source.id } });

    return res.json({
      success: true,
      message: `Lead ${source.leadId} successfully merged into ${target.leadId}.`,
      targetLeadId: target.id
    });
  } catch (err: any) {
    return res.status(500).json({ success: false, message: err.message });
  }
}

/**
 * POST /api/v1/unified-leads/import-csv
 * Imports leads from CSV rows with column mapping and duplicate prevention.
 */
export async function importLeadsCSV(req: TenantRequest, res: Response) {
  try {
    const tenantId = req.tenantId!;
    const { rows = [], deduplicateBy = 'phone' } = req.body;

    if (!Array.isArray(rows) || rows.length === 0) {
      return res.status(400).json({ success: false, message: 'CSV data rows are required.' });
    }

    let importedCount = 0;
    let duplicateCount = 0;
    const errors: string[] = [];

    const existingLeads = await prisma.lead.findMany({
      where: { tenantId },
      select: { phone: true, email: true }
    });
    const existingPhones = new Set(existingLeads.map(l => l.phone.trim()));
    const existingEmails = new Set(existingLeads.map(l => (l.email || '').toLowerCase().trim()).filter(Boolean));

    let currentLeadTotal = await prisma.lead.count({ where: { tenantId } });

    for (let i = 0; i < rows.length; i++) {
      const row = rows[i];
      const customerName = row.customerName || row.name || row['Full Name'] || row['Customer Name'];
      const phone = String(row.phone || row['Phone'] || row['Mobile'] || '').trim();
      const email = String(row.email || row['Email'] || '').trim();
      const source = row.source || row['Source'] || 'Import';
      const industry = row.industry || row['Industry'] || 'GENERAL';
      const amount = Number(row.amount || row['Amount'] || row['Budget'] || 0) || 0;
      const city = row.city || row['City'] || null;

      if (!customerName || !phone) {
        errors.push(`Row ${i + 1}: Name and phone are required.`);
        continue;
      }

      // Check duplicates
      const isDupPhone = deduplicateBy === 'phone' && existingPhones.has(phone);
      const isDupEmail = deduplicateBy === 'email' && email && existingEmails.has(email.toLowerCase());
      if (isDupPhone || isDupEmail) {
        duplicateCount++;
        continue;
      }

      currentLeadTotal++;
      const leadId = `NX-LD-${1000 + currentLeadTotal}`;

      const leadData = {
        customerName,
        phone,
        email: email || null,
        city,
        amount,
        source,
        industry,
        status: 'New',
        priority: 'Medium'
      };
      const scoreResult = AIService.calculateLeadScore(leadData, [], []);

      await prisma.lead.create({
        data: {
          tenantId,
          leadId,
          customerName,
          phone,
          email: email || null,
          city,
          amount,
          source,
          industry,
          status: 'New',
          priority: 'Medium',
          leadScore: scoreResult.score,
          leadScoreCategory: scoreResult.category,
          leadScoreReason: JSON.stringify(scoreResult.reasons),
          tags: JSON.stringify(['imported'])
        }
      });

      existingPhones.add(phone);
      if (email) existingEmails.add(email.toLowerCase());
      importedCount++;
    }

    return res.json({
      success: true,
      importedCount,
      duplicateCount,
      errorsCount: errors.length,
      errors
    });
  } catch (err: any) {
    return res.status(500).json({ success: false, message: err.message });
  }
}

/**
 * GET /api/v1/unified-leads/export-csv
 * Exports leads matching criteria into standard CSV format.
 */
export async function exportLeadsCSV(req: TenantRequest, res: Response) {
  try {
    const tenantId = req.tenantId!;
    const leads = await prisma.lead.findMany({
      where: { tenantId },
      orderBy: { createdDate: 'desc' }
    });

    const headers = ['Lead ID', 'Customer Name', 'Phone', 'Email', 'City', 'Industry', 'Source', 'Amount (INR)', 'Status', 'Lead Score', 'Score Category', 'Created Date'];
    const rows = leads.map(l => [
      `"${l.leadId}"`,
      `"${(l.customerName || '').replace(/"/g, '""')}"`,
      `"${l.phone}"`,
      `"${l.email || ''}"`,
      `"${l.city || ''}"`,
      `"${l.industry}"`,
      `"${l.source}"`,
      l.amount || 0,
      `"${l.status}"`,
      l.leadScore,
      `"${l.leadScoreCategory}"`,
      `"${l.createdDate.toISOString()}"`
    ]);

    const csvContent = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename="nexus360_leads_export.csv"');
    return res.send(csvContent);
  } catch (err: any) {
    return res.status(500).json({ success: false, message: err.message });
  }
}


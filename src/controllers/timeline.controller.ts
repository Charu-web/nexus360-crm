import { Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { TenantRequest } from '../middleware/tenant';

const prisma = new PrismaClient();

export interface TimelineEvent {
  id: string;
  type: string;
  title: string;
  details?: string | null;
  actor?: string;
  timestamp: string;
  icon?: string;
  color?: string;
  metadata?: Record<string, any>;
}

/**
 * GET /api/v1/timeline/:entityType/:entityId
 * Returns a unified chronological timeline using real stored activities, notes, and lifecycle records.
 */
export async function getEntityTimeline(req: TenantRequest, res: Response) {
  try {
    const tenantId = req.tenantId!;
    const entityType = String(req.params.entityType || '');
    const entityId = String(req.params.entityId || '');

    if (!entityType || !entityId) {
      return res.status(400).json({ success: false, message: 'entityType and entityId are required' });
    }

    const events: TimelineEvent[] = [];

    // 1. General Activities linked to this entity
    const activities = await prisma.activity.findMany({
      where: {
        tenantId,
        entityId,
        entityType
      },
      orderBy: { createdAt: 'desc' }
    });

    activities.forEach((a: any) => {
      events.push({
        id: a.id,
        type: a.type,
        title: a.title,
        details: a.details,
        actor: 'System Automation',
        timestamp: a.createdAt.toISOString(),
        icon: a.type === 'COMMUNICATION' ? '💬' : a.type === 'AI_DRAFT' ? '✨' : a.type === 'NOTIFICATION' ? '🔔' : '📋',
        color: '#3b82f6'
      });
    });

    // 2. Specific Lead Activities (if entityType is Lead)
    if (entityType.toLowerCase() === 'lead') {
      const leadActivities = await prisma.leadActivity.findMany({
        where: { tenantId, leadId: entityId },
        orderBy: { createdAt: 'desc' }
      });

      leadActivities.forEach(la => {
        events.push({
          id: la.id,
          type: la.type,
          title: la.title,
          details: la.details,
          actor: 'CRM Engine',
          timestamp: la.createdAt.toISOString(),
          icon: la.type === 'CALL' ? '📞' : la.type === 'STATUS_CHANGE' ? '🔄' : '📝',
          color: '#10b981'
        });
      });

      // Lead Creation Event
      const lead = await prisma.lead.findFirst({
        where: { id: entityId, tenantId },
        include: { assignedTo: { select: { fullName: true } } }
      });

      if (lead) {
        const leadAny = lead as any;
        events.push({
          id: `creation-${lead.id}`,
          type: 'LEAD_CREATED',
          title: `Lead Ingested from ${lead.source}`,
          details: `Campaign: ${lead.campaignName || 'Direct'} • Initial AI Score: ${lead.leadScore}/100 (${lead.leadScoreCategory})`,
          actor: leadAny.assignedTo?.fullName ? `Assigned to ${leadAny.assignedTo.fullName}` : 'Unassigned',
          timestamp: lead.createdDate.toISOString(),
          icon: '🚀',
          color: '#8b5cf6'
        });

        // Associated Site Visits
        const siteVisits = await prisma.siteVisit.findMany({
          where: { tenantId, leadId: lead.id },
          include: { project: { select: { name: true } } }
        });
        siteVisits.forEach(sv => {
          events.push({
            id: sv.id,
            type: 'SITE_VISIT',
            title: `Site Visit: ${sv.project?.name || 'Property'}`,
            details: `Visit Date: ${new Date(sv.visitDate).toLocaleDateString()} • Status: ${sv.status} • Outcome: ${sv.outcome || 'Pending'}`,
            actor: 'Real Estate Desk',
            timestamp: sv.createdDate.toISOString(),
            icon: '🏡',
            color: '#f59e0b'
          });
        });

        // Associated Property Bookings
        const bookings = await prisma.propertyBooking.findMany({
          where: { tenantId, leadId: lead.id }
        });
        bookings.forEach(b => {
          events.push({
            id: b.id,
            type: 'BOOKING_CREATED',
            title: `Property Booking Finalized: ${b.bookingId}`,
            details: `Agreement Value: ₹${b.agreementValue.toLocaleString()} • Token: ₹${b.tokenAmount.toLocaleString()} • Status: ${b.status}`,
            actor: 'Sales Executive',
            timestamp: b.bookingDate.toISOString(),
            icon: '📜',
            color: '#10b981'
          });
        });

        // Associated Loan Applications
        const loans = await prisma.loanApplication.findMany({
          where: { tenantId, leadId: lead.id }
        });
        loans.forEach(l => {
          events.push({
            id: l.id,
            type: 'LOAN_APPLICATION',
            title: `Loan Application ${l.applicationId} (${l.loanType})`,
            details: `Requested: ₹${l.requestedAmount.toLocaleString()} • Bank: ${l.bankPartner || 'HDFC'} • Status: ${l.status}`,
            actor: 'Fintech Desk',
            timestamp: l.createdDate.toISOString(),
            icon: '💳',
            color: '#06b6d4'
          });
        });
      }
    }

    // 3. Notes linked to entity
    const notes = await prisma.note.findMany({
      where: {
        tenantId,
        OR: [
          { leadId: entityId },
          { customerId: entityId },
          { dealId: entityId }
        ]
      },
      include: { createdBy: { select: { fullName: true } } },
      orderBy: { createdAt: 'desc' }
    });

    notes.forEach((n: any) => {
      events.push({
        id: n.id,
        type: 'NOTE_ADDED',
        title: 'Note Added',
        details: n.content,
        actor: n.createdBy?.fullName || 'User',
        timestamp: n.createdAt.toISOString(),
        icon: '📌',
        color: '#64748b'
      });
    });

    // 4. Follow-ups linked to entity
    const followUps = await prisma.followUp.findMany({
      where: {
        tenantId,
        leadId: entityId
      },
      orderBy: { scheduledAt: 'desc' }
    });

    followUps.forEach((f: any) => {
      events.push({
        id: f.id,
        type: 'FOLLOW_UP',
        title: `Follow-up: ${f.title || 'Call'}`,
        details: `${f.notes || 'Scheduled touchpoint'} • Status: ${f.status}`,
        actor: 'Assigned Rep',
        timestamp: f.scheduledAt.toISOString(),
        icon: '⏰',
        color: '#e11d48'
      });
    });

    // Sort all events chronologically (newest first)
    events.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

    return res.json({
      success: true,
      entityType,
      entityId,
      totalEvents: events.length,
      timeline: events
    });
  } catch (err: any) {
    return res.status(500).json({ success: false, message: err.message });
  }
}

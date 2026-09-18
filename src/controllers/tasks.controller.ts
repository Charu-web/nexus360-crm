// src/controllers/tasks.controller.ts
import { Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { TenantRequest } from '../middleware/tenant';

const prisma = new PrismaClient();

/**
 * GET /api/v1/tasks
 * Categorized tasks by Today, Upcoming, Overdue, and Completed.
 */
export async function getTasks(req: TenantRequest, res: Response) {
  try {
    const tenantId = req.tenantId!;
    const { status, filter, assignedToId, leadId } = req.query;

    const where: any = { tenantId };
    if (status) where.status = String(status);
    if (assignedToId) where.assignedToId = String(assignedToId);
    if (leadId) where.leadId = String(leadId);

    const now = new Date();
    const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const endOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59, 999);

    if (filter === 'today') {
      where.dueDate = { gte: startOfToday, lte: endOfToday };
      where.status = { not: 'Completed' };
    } else if (filter === 'overdue') {
      where.dueDate = { lt: startOfToday };
      where.status = { not: 'Completed' };
    } else if (filter === 'upcoming') {
      where.dueDate = { gt: endOfToday };
      where.status = { not: 'Completed' };
    } else if (filter === 'completed') {
      where.status = 'Completed';
    }

    const tasks = await prisma.task.findMany({
      where,
      orderBy: { dueDate: 'asc' },
      include: {
        assignedTo: { select: { id: true, fullName: true, email: true } },
        lead: { select: { id: true, customerName: true, phone: true, leadId: true } },
        deal: { select: { id: true, title: true, amount: true } }
      }
    });

    const [todayCount, overdueCount, upcomingCount, completedCount] = await Promise.all([
      prisma.task.count({ where: { tenantId, dueDate: { gte: startOfToday, lte: endOfToday }, status: { not: 'Completed' } } }),
      prisma.task.count({ where: { tenantId, dueDate: { lt: startOfToday }, status: { not: 'Completed' } } }),
      prisma.task.count({ where: { tenantId, dueDate: { gt: endOfToday }, status: { not: 'Completed' } } }),
      prisma.task.count({ where: { tenantId, status: 'Completed' } })
    ]);

    return res.json({
      success: true,
      stats: { todayCount, overdueCount, upcomingCount, completedCount },
      tasks
    });
  } catch (err: any) {
    return res.status(500).json({ success: false, message: err.message });
  }
}

/**
 * POST /api/v1/tasks
 * Creates a new CRM task with reminders.
 */
export async function createTask(req: TenantRequest, res: Response) {
  try {
    const tenantId = req.tenantId!;
    const {
      title,
      description,
      priority = 'Medium',
      status = 'Pending',
      dueDate,
      assignedToId,
      leadId,
      dealId
    } = req.body;

    if (!title || !dueDate) {
      return res.status(400).json({ success: false, message: 'Title and due date are required.' });
    }

    let finalAssignedTo = assignedToId;
    if (!finalAssignedTo) {
      const me = (req as any).user;
      finalAssignedTo = me?.id;
    }
    if (!finalAssignedTo) {
      const firstUser = await prisma.user.findFirst({ where: { tenantId } });
      finalAssignedTo = firstUser?.id;
    }

    const task = await prisma.task.create({
      data: {
        tenantId,
        title,
        description: description || null,
        priority,
        status,
        dueDate: new Date(dueDate),
        assignedToId: finalAssignedTo,
        leadId: leadId ? String(leadId) : null,
        dealId: dealId ? String(dealId) : null
      }
    });

    if (finalAssignedTo) {
      await prisma.notification.create({
        data: {
          tenantId,
          userId: finalAssignedTo,
          type: 'TASK_ASSIGNED',
          title: 'New Task Assigned: ' + title,
          message: 'Due by ' + new Date(dueDate).toLocaleDateString() + ' (Priority: ' + priority + ')',
          entityType: 'Task',
          entityId: task.id
        }
      });
    }

    return res.status(201).json({ success: true, task });
  } catch (err: any) {
    return res.status(500).json({ success: false, message: err.message });
  }
}

/**
 * PATCH /api/v1/tasks/:id
 * Updates task status or attributes.
 */
export async function updateTask(req: TenantRequest, res: Response) {
  try {
    const tenantId = req.tenantId!;
    const id = String(req.params.id);
    const updates = req.body;

    const task = await prisma.task.findFirst({ where: { id, tenantId } });
    if (!task) {
      return res.status(404).json({ success: false, message: 'Task not found.' });
    }

    const updated = await prisma.task.update({
      where: { id },
      data: {
        title: updates.title !== undefined ? updates.title : task.title,
        description: updates.description !== undefined ? updates.description : task.description,
        priority: updates.priority !== undefined ? updates.priority : task.priority,
        status: updates.status !== undefined ? updates.status : task.status,
        dueDate: updates.dueDate ? new Date(updates.dueDate) : task.dueDate,
        assignedToId: updates.assignedToId || task.assignedToId
      }
    });

    return res.json({ success: true, task: updated });
  } catch (err: any) {
    return res.status(500).json({ success: false, message: err.message });
  }
}

/**
 * DELETE /api/v1/tasks/:id
 */
export async function deleteTask(req: TenantRequest, res: Response) {
  try {
    const tenantId = req.tenantId!;
    const id = String(req.params.id);
    await prisma.task.deleteMany({ where: { id, tenantId } });
    return res.json({ success: true, message: 'Task deleted successfully.' });
  } catch (err: any) {
    return res.status(500).json({ success: false, message: err.message });
  }
}

/**
 * GET /api/v1/calendar/events
 * Aggregates all scheduled events: Follow-ups, Tasks, Site Visits, Meetings.
 */
export async function getCalendarEvents(req: TenantRequest, res: Response) {
  try {
    const tenantId = req.tenantId!;
    const { start, end } = req.query;

    const [tasks, followUps, siteVisits, meetings] = await Promise.all([
      prisma.task.findMany({
        where: { tenantId },
        include: { lead: { select: { customerName: true } } }
      }),
      prisma.followUp.findMany({
        where: { tenantId },
        include: { lead: { select: { customerName: true, phone: true } } }
      }),
      prisma.siteVisit.findMany({
        where: { tenantId },
        include: { lead: { select: { customerName: true } }, project: { select: { name: true } } }
      }),
      prisma.meeting.findMany({
        where: { tenantId }
      })
    ]);

    const events: any[] = [];

    tasks.forEach(t => {
      events.push({
        id: 'task-' + t.id,
        entityType: 'Task',
        entityId: t.id,
        title: '📋 ' + t.title,
        start: t.dueDate,
        end: t.dueDate,
        status: t.status,
        priority: t.priority,
        leadName: t.lead?.customerName || '',
        category: 'task',
        color: t.priority === 'Urgent' ? '#e11d48' : '#3b82f6'
      });
    });

    followUps.forEach(f => {
      events.push({
        id: 'followup-' + f.id,
        entityType: 'FollowUp',
        entityId: f.id,
        title: '📞 Follow-up: ' + (f.lead?.customerName || f.title),
        start: f.scheduledAt,
        end: f.scheduledAt,
        status: f.status,
        priority: 'Medium',
        leadName: f.lead?.customerName || '',
        category: 'followup',
        color: '#f59e0b'
      });
    });

    siteVisits.forEach(v => {
      events.push({
        id: 'visit-' + v.id,
        entityType: 'SiteVisit',
        entityId: v.id,
        title: '🏡 Site Visit: ' + (v.lead?.customerName || 'Client') + ' @ ' + (v.project?.name || 'Project'),
        start: v.visitDate,
        end: v.visitDate,
        status: v.status,
        priority: 'High',
        leadName: v.lead?.customerName || '',
        category: 'site_visit',
        color: '#10b981'
      });
    });

    meetings.forEach(m => {
      events.push({
        id: 'meeting-' + m.id,
        entityType: 'Meeting',
        entityId: m.id,
        title: '👥 Meeting: ' + m.title,
        start: m.meetingDate,
        end: m.meetingDate,
        status: m.status,
        priority: 'Medium',
        category: 'meeting',
        color: '#8b5cf6'
      });
    });

    events.sort((a, b) => new Date(a.start).getTime() - new Date(b.start).getTime());

    return res.json({ success: true, events });
  } catch (err: any) {
    return res.status(500).json({ success: false, message: err.message });
  }
}

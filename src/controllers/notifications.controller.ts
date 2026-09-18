import { Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { TenantRequest } from '../middleware/tenant';

const prisma = new PrismaClient();

/**
 * GET /api/v1/notifications
 */
export async function getNotifications(req: TenantRequest, res: Response) {
  try {
    const tenantId = req.tenantId!;
    const userId = (req as any).user?.id;
    const { unreadOnly, limit = 50 } = req.query;

    const where: any = { tenantId };
    if (userId) {
      where.OR = [{ userId }, { userId: null }];
    }
    if (unreadOnly === 'true') {
      where.isRead = false;
    }

    const [unreadCount, notifications] = await Promise.all([
      prisma.notification.count({ where: { ...where, isRead: false } }),
      prisma.notification.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        take: Number(limit)
      })
    ]);

    return res.json({
      success: true,
      unreadCount,
      notifications
    });
  } catch (err: any) {
    return res.status(500).json({ success: false, message: err.message });
  }
}

/**
 * PATCH /api/v1/notifications/:id/read
 */
export async function markNotificationAsRead(req: TenantRequest, res: Response) {
  try {
    const tenantId = req.tenantId!;
    const id = String(req.params.id);

    const notif = await prisma.notification.findFirst({ where: { id, tenantId } });
    if (!notif) {
      return res.status(404).json({ success: false, message: 'Notification not found' });
    }

    const updated = await prisma.notification.update({
      where: { id },
      data: { isRead: true }
    });

    return res.json({ success: true, notification: updated });
  } catch (err: any) {
    return res.status(500).json({ success: false, message: err.message });
  }
}

/**
 * POST /api/v1/notifications/mark-all-read
 */
export async function markAllNotificationsAsRead(req: TenantRequest, res: Response) {
  try {
    const tenantId = req.tenantId!;
    const userId = (req as any).user?.id;

    const where: any = { tenantId, isRead: false };
    if (userId) {
      where.OR = [{ userId }, { userId: null }];
    }

    await prisma.notification.updateMany({
      where,
      data: { isRead: true }
    });

    return res.json({ success: true, message: 'All notifications marked as read' });
  } catch (err: any) {
    return res.status(500).json({ success: false, message: err.message });
  }
}

/**
 * POST /api/v1/notifications
 */
export async function createNotification(req: TenantRequest, res: Response) {
  try {
    const tenantId = req.tenantId!;
    const { title, message, type = 'NEW_LEAD', entityType, entityId, link, userId } = req.body;

    if (!title || !message) {
      return res.status(400).json({ success: false, message: 'Title and message are required' });
    }

    const notif = await prisma.notification.create({
      data: {
        tenantId,
        userId: userId || null,
        type,
        title,
        message,
        entityType: entityType || null,
        entityId: entityId || null,
        link: link || null
      }
    });

    return res.status(201).json({ success: true, notification: notif });
  } catch (err: any) {
    return res.status(500).json({ success: false, message: err.message });
  }
}

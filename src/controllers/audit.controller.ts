// src/controllers/audit.controller.ts
import { Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { TenantRequest } from '../middleware/tenant';

const prisma = new PrismaClient();

/**
 * GET /api/v1/audit-logs and /api/v1/audit/logs
 * Returns tenant-isolated administrative and system audit events with real statistics.
 */
export async function getAuditLogs(req: TenantRequest, res: Response) {
  try {
    const tenantId = req.tenantId!;
    const { action, entity, userId, search, limit = 100 } = req.query;

    const where: any = { tenantId };
    if (action && action !== 'ALL') where.action = String(action);
    if (entity && entity !== 'ALL') where.entity = String(entity);
    if (userId && userId !== 'ALL') where.userId = String(userId);
    if (search) {
      const q = String(search).trim();
      where.OR = [
        { action: { contains: q } },
        { entity: { contains: q } },
        { details: { contains: q } },
        { entityId: { contains: q } }
      ];
    }

    const [logs, allLogs] = await Promise.all([
      prisma.auditLog.findMany({
        where,
        take: Number(limit),
        orderBy: { timestamp: 'desc' },
        include: {
          user: { select: { id: true, fullName: true, email: true, role: true } }
        }
      }),
      prisma.auditLog.findMany({
        where: { tenantId },
        select: { action: true, timestamp: true }
      })
    ]);

    // Calculate real stats
    const today = new Date().toDateString();
    const todayCount = allLogs.filter(l => new Date(l.timestamp).toDateString() === today).length;
    const creates = allLogs.filter(l => l.action.includes('CREATE') || l.action.includes('PROVISION')).length;
    const updates = allLogs.filter(l => l.action.includes('UPDATE') || l.action.includes('MODIFY') || l.action.includes('STAGE') || l.action.includes('MERGE')).length;
    const deletes = allLogs.filter(l => l.action.includes('DELETE') || l.action.includes('REMOVE')).length;

    const stats = {
      totalEvents: allLogs.length,
      todayEvents: todayCount,
      createCount: creates,
      updateCount: updates,
      deleteCount: deletes
    };

    return res.json({
      success: true,
      stats,
      logs: logs.map(l => ({
        id: l.id,
        action: l.action,
        entity: l.entity,
        entityType: l.entity,
        entityId: l.entityId,
        details: l.details,
        ipAddress: l.ipAddress || '127.0.0.1',
        userAgent: l.userAgent || 'Nexus360-Client',
        timestamp: l.timestamp,
        createdAt: l.timestamp,
        userName: l.user?.fullName || 'System Administrator',
        userEmail: l.user?.email || 'admin@empirecrm.io',
        user: l.user
      }))
    });
  } catch (err: any) {
    return res.status(500).json({ success: false, message: err.message });
  }
}

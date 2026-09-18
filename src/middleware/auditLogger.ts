import { Request } from 'express';
import { prisma } from '../lib/db';

export interface AuditLogInput {
  tenantId?: string | null;
  userId?: string | null;
  action: string;
  entity: string;
  entityId?: string | null;
  details?: string | object | null;
  req?: Request;
}

export const recordAuditLog = async (input: AuditLogInput): Promise<void> => {
  try {
    const tenantId = input.tenantId || input.req?.tenant?.id || input.req?.user?.tenantId || null;
    const userId = input.userId || input.req?.user?.id || null;
    const ipAddress =
      input.req?.headers['x-forwarded-for']?.toString() ||
      input.req?.socket?.remoteAddress ||
      '127.0.0.1';
    const userAgent = input.req?.headers['user-agent'] || 'Unknown';

    let detailsString: string | null = null;
    if (typeof input.details === 'object' && input.details !== null) {
      detailsString = JSON.stringify(input.details);
    } else if (typeof input.details === 'string') {
      detailsString = input.details;
    }

    await prisma.auditLog.create({
      data: {
        tenantId,
        userId,
        action: input.action,
        entity: input.entity,
        entityId: input.entityId || null,
        details: detailsString,
        ipAddress,
        userAgent,
      },
    });
  } catch (error) {
    console.error('[AuditLog Error] Failed to write audit record:', error);
  }
};

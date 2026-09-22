import { Request } from 'express';
import { prisma } from '../lib/prisma';
import { AuditAction } from '@prisma/client';
import { logger } from '../lib/logger';

export interface AuditLogOptions {
  organizationId: string;
  userId?: string;
  action: AuditAction;
  resource: string;
  resourceId?: string;
  details?: string;
  metadata?: Record<string, any>;
  req?: Request;
}

export const logAuditEvent = async (options: AuditLogOptions): Promise<void> => {
  try {
    const ipAddress = options.req?.ip || options.req?.socket?.remoteAddress;
    const userAgent = options.req?.get('user-agent');

    await prisma.auditLog.create({
      data: {
        organizationId: options.organizationId,
        userId: options.userId || options.req?.user?.id,
        action: options.action,
        resource: options.resource,
        resourceId: options.resourceId,
        details: options.details,
        metadata: options.metadata || undefined,
        ipAddress: ipAddress ? String(ipAddress) : null,
        userAgent: userAgent ? String(userAgent) : null,
      },
    });
  } catch (error: any) {
    logger.error(`[AuditLog Failure] Unable to write audit entry: ${error.message}`);
  }
};

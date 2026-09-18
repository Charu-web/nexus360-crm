import { Request, Response, NextFunction } from 'express';
import crypto from 'crypto';
import { z } from 'zod';
import { prisma } from '../lib/db';
import { AppError } from '../middleware/errorHandler';

const webhookSchema = z.object({
  name: z.string().optional().default('Webhook Endpoint'),
  url: z.string().url('Invalid webhook target URL'),
  events: z.array(z.string()).min(1, 'At least one event trigger is required'),
  secret: z.string().optional(),
  isActive: z.boolean().optional().default(true),
});

const getParamId = (param: string | string[]): string => {
  return Array.isArray(param) ? param[0] : param;
};

// Dispatch Webhook Helper
export async function dispatchWebhookEvent(tenantId: string, event: string, payload: any): Promise<void> {
  try {
    const webhooks = await prisma.webhook.findMany({
      where: { tenantId, isActive: true },
    });

    for (const hook of webhooks) {
      const subscribedEvents: string[] = JSON.parse(hook.events);
      if (subscribedEvents.includes('*') || subscribedEvents.includes(event)) {
        const bodyStr = JSON.stringify({ event, timestamp: new Date().toISOString(), data: payload });
        const signature = crypto.createHmac('sha256', hook.secret).update(bodyStr).digest('hex');

        fetch(hook.url, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'X-Empire-Signature': signature,
            'X-Empire-Event': event,
          },
          body: bodyStr,
        }).then(async (res) => {
          await prisma.webhookLog.create({
            data: {
              tenantId,
              webhookId: hook.id,
              event,
              payload: bodyStr,
              statusCode: res.status,
              responseBody: await res.text().catch(() => ''),
            },
          });
        }).catch(async (err) => {
          await prisma.webhookLog.create({
            data: {
              tenantId,
              webhookId: hook.id,
              event,
              payload: bodyStr,
              statusCode: 500,
              error: String(err),
            },
          });
        });
      }
    }
  } catch (err) {
    console.error('[Webhook Dispatch Error]', err);
  }
}

// GET /api/v1/tenant/webhooks
export const getWebhooks = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const tenantId = req.tenant?.id;
    if (!tenantId) throw new AppError('Tenant context missing', 400);

    const webhooks = await prisma.webhook.findMany({
      where: { tenantId },
      orderBy: { createdAt: 'desc' },
    });

    res.status(200).json({
      success: true,
      webhooks: webhooks.map((w) => ({
        id: w.id,
        name: w.name,
        url: w.url,
        events: JSON.parse(w.events),
        isActive: w.isActive,
        secretPrefix: w.secret.substring(0, 8) + '...',
        createdAt: w.createdAt,
      })),
    });
  } catch (error) {
    next(error);
  }
};

// POST /api/v1/tenant/webhooks
export const createWebhook = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const tenantId = req.tenant?.id;
    if (!tenantId) throw new AppError('Tenant context missing', 400);

    const data = webhookSchema.parse(req.body);
    const secret = data.secret || 'whsec_' + crypto.randomBytes(20).toString('hex');

    const webhook = await prisma.webhook.create({
      data: {
        tenantId,
        name: data.name || 'Webhook Endpoint',
        url: data.url,
        events: JSON.stringify(data.events),
        secret,
        isActive: data.isActive,
      },
    });

    res.status(201).json({
      success: true,
      message: 'Webhook endpoint registered successfully',
      webhook: {
        id: webhook.id,
        name: webhook.name,
        url: webhook.url,
        events: data.events,
        secret,
        isActive: webhook.isActive,
        createdAt: webhook.createdAt,
      },
    });
  } catch (error) {
    next(error);
  }
};

// PATCH /api/v1/tenant/webhooks/:id
export const updateWebhook = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const tenantId = req.tenant?.id;
    if (!tenantId) throw new AppError('Tenant context missing', 400);

    const id = getParamId(req.params.id);
    const existing = await prisma.webhook.findFirst({ where: { id, tenantId } });
    if (!existing) throw new AppError('Webhook not found', 404);

    const { name, url, events, isActive } = req.body;

    const updated = await prisma.webhook.update({
      where: { id },
      data: {
        ...(name ? { name } : {}),
        ...(url ? { url } : {}),
        ...(events ? { events: JSON.stringify(events) } : {}),
        ...(isActive !== undefined ? { isActive: Boolean(isActive) } : {}),
      },
    });

    res.status(200).json({
      success: true,
      message: 'Webhook endpoint updated successfully',
      webhook: {
        id: updated.id,
        name: updated.name,
        url: updated.url,
        events: JSON.parse(updated.events),
        isActive: updated.isActive,
      },
    });
  } catch (error) {
    next(error);
  }
};

// DELETE /api/v1/tenant/webhooks/:id
export const deleteWebhook = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const tenantId = req.tenant?.id;
    if (!tenantId) throw new AppError('Tenant context missing', 400);

    const id = getParamId(req.params.id);
    const existing = await prisma.webhook.findFirst({ where: { id, tenantId } });
    if (!existing) throw new AppError('Webhook not found', 404);

    await prisma.webhook.delete({ where: { id } });

    res.status(200).json({
      success: true,
      message: 'Webhook deleted successfully',
    });
  } catch (error) {
    next(error);
  }
};

// GET /api/v1/tenant/webhooks/:id/logs
export const getWebhookLogs = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const tenantId = req.tenant?.id;
    if (!tenantId) throw new AppError('Tenant context missing', 400);

    const webhookId = getParamId(req.params.id);

    const logs = await prisma.webhookLog.findMany({
      where: { tenantId, webhookId },
      orderBy: { createdAt: 'desc' },
      take: 50,
    });

    res.status(200).json({
      success: true,
      logs,
    });
  } catch (error) {
    next(error);
  }
};

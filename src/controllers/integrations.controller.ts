import { Request, Response, NextFunction } from 'express';
import { prisma } from '../lib/db';
import { AppError } from '../middleware/errorHandler';

const INTEGRATION_PROVIDERS = [
  { provider: 'GOOGLE', name: 'Google Workspace & Ads', category: 'Productivity & Ads', description: 'Google Calendar sync, Gmail integration, and Google Ads Lead Forms.' },
  { provider: 'MICROSOFT', name: 'Microsoft 365 / Outlook', category: 'Productivity', description: 'Outlook Email & Calendar synchronization.' },
  { provider: 'WHATSAPP', name: 'WhatsApp Business API', category: 'Messaging', description: 'Automated WhatsApp messaging, template notifications, and lead follow-up.' },
  { provider: 'EMAIL', name: 'Custom SMTP / IMAP Email', category: 'Email', description: 'Send transactional emails and drip campaigns using custom SMTP server.' },
  { provider: 'SLACK', name: 'Slack Notifications', category: 'Team Chat', description: 'Post new lead alerts and deal notifications to Slack channels.' },
  { provider: 'ZAPIER', name: 'Zapier Webhooks', category: 'Automation', description: 'Connect Empire CRM to 5,000+ apps via Zapier webhooks.' },
  { provider: 'PAYMENT', name: 'Razorpay / Stripe Payments', category: 'Billing', description: 'Collect customer invoice payments directly inside CRM deals.' },
];

// GET /api/v1/integrations
export const getIntegrations = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const tenantId = req.tenant?.id;
    if (!tenantId) throw new AppError('Tenant context missing', 400);

    const connectedList = await prisma.integration.findMany({
      where: { tenantId },
    });

    const connMap = new Map(connectedList.map((c) => [c.provider.toUpperCase(), c]));

    const integrations = INTEGRATION_PROVIDERS.map((p) => {
      const conn = connMap.get(p.provider);
      return {
        provider: p.provider,
        name: p.name,
        category: p.category,
        description: p.description,
        status: conn ? conn.status : 'DISCONNECTED',
        connectedAt: conn ? conn.createdAt : null,
      };
    });

    res.status(200).json({ success: true, integrations });
  } catch (error) {
    next(error);
  }
};

// POST /api/v1/integrations/:provider/connect
export const connectIntegration = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const tenantId = req.tenant?.id;
    if (!tenantId) throw new AppError('Tenant context missing', 400);

    const provider = (req.params.provider as string).toUpperCase();
    const configData = req.body || {};

    const providerDef = INTEGRATION_PROVIDERS.find((p) => p.provider === provider);
    if (!providerDef) {
      throw new AppError(`Unsupported integration provider '${provider}'`, 400);
    }

    const credentialsEncrypted = JSON.stringify(configData);

    const record = await prisma.integration.upsert({
      where: { tenantId_provider: { tenantId, provider } },
      update: {
        status: 'CONNECTED',
        credentialsEncrypted,
        config: JSON.stringify({ name: providerDef.name, category: providerDef.category }),
      },
      create: {
        tenantId,
        provider,
        status: 'CONNECTED',
        credentialsEncrypted,
        config: JSON.stringify({ name: providerDef.name, category: providerDef.category }),
      },
    });

    res.status(200).json({
      success: true,
      message: `Integration '${providerDef.name}' connected successfully!`,
      integration: {
        provider: record.provider,
        status: record.status,
        updatedAt: record.updatedAt,
      },
    });
  } catch (error) {
    next(error);
  }
};

// POST /api/v1/integrations/:provider/disconnect
export const disconnectIntegration = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const tenantId = req.tenant?.id;
    if (!tenantId) throw new AppError('Tenant context missing', 400);

    const provider = (req.params.provider as string).toUpperCase();

    const existing = await prisma.integration.findUnique({
      where: { tenantId_provider: { tenantId, provider } },
    });

    if (!existing) {
      throw new AppError(`Integration '${provider}' is not connected.`, 404);
    }

    await prisma.integration.update({
      where: { id: existing.id },
      data: { status: 'DISCONNECTED', credentialsEncrypted: null },
    });

    res.status(200).json({
      success: true,
      message: `Integration '${provider}' disconnected successfully.`,
    });
  } catch (error) {
    next(error);
  }
};

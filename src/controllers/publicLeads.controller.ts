import { Request, Response, NextFunction } from 'express';
import crypto from 'crypto';
import { z } from 'zod';
import { prisma } from '../lib/db';
import { AppError } from '../middleware/errorHandler';
import { triggerAutomationEvents } from '../services/automationEngine';

const publicLeadSchema = z.object({
  name: z.string().optional(),
  customerName: z.string().optional(),
  phone: z.string().min(5, 'Phone number is required'),
  email: z.string().email().optional().or(z.literal('')),
  city: z.string().optional(),
  loanType: z.string().optional().default('Personal Loan'),
  amount: z.number().optional().default(0),
  source: z.string().optional().default('Website API'),
  notes: z.string().optional(),
});

export const submitPublicLead = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const apiKeyInput = (req.headers['x-api-key'] || req.query.apiKey || req.body.apiKey) as string;
    if (!apiKeyInput) {
      throw new AppError('X-API-Key header or apiKey parameter required', 401);
    }

    const keyHash = crypto.createHash('sha256').update(apiKeyInput).digest('hex');
    const apiKeyRecord = await prisma.apiKey.findUnique({
      where: { keyHash },
      include: { tenant: true },
    });

    if (!apiKeyRecord || apiKeyRecord.isRevoked || apiKeyRecord.tenant.status === 'SUSPENDED') {
      throw new AppError('Invalid, revoked, or suspended API key', 401);
    }

    const tenantId = apiKeyRecord.tenantId;
    const data = publicLeadSchema.parse(req.body);

    const customerName = data.customerName || data.name || 'Website Lead';

    // Duplicate Check
    const duplicate = await prisma.lead.findFirst({
      where: {
        tenantId,
        OR: [
          { phone: data.phone },
          ...(data.email ? [{ email: data.email }] : []),
        ],
      },
    });

    if (duplicate) {
      res.status(200).json({
        success: true,
        message: 'Lead already exists in workspace.',
        duplicate: true,
        leadId: duplicate.leadId,
      });
      return;
    }

    const count = await prisma.lead.count({ where: { tenantId } });
    const leadId = `LD-${1001 + count}`;

    const lead = await prisma.lead.create({
      data: {
        tenantId,
        leadId,
        customerName,
        phone: data.phone,
        email: data.email || null,
        city: data.city || null,
        loanType: data.loanType,
        amount: Number(data.amount) || 0,
        source: data.source,
        status: 'New',
        notes: data.notes || 'Received via Public Website API Key',
      },
    });

    // Update Usage Counter & API Key Timestamp
    await Promise.all([
      prisma.usage.upsert({
        where: { tenantId },
        update: { leadCount: { increment: 1 }, apiCallsCount: { increment: 1 } },
        create: { tenantId, leadCount: 1, apiCallsCount: 1 },
      }),
      prisma.apiKey.update({
        where: { id: apiKeyRecord.id },
        data: { lastUsedAt: new Date() },
      }),
    ]);

    // Trigger Event Automation Engine
    await triggerAutomationEvents(tenantId, 'lead.created', lead);

    res.status(201).json({
      success: true,
      message: 'Lead submitted successfully',
      leadId: lead.leadId,
      tenantSlug: apiKeyRecord.tenant.slug,
    });
  } catch (error) {
    next(error);
  }
};

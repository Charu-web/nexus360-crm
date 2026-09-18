// src/controllers/automationWorkflow.controller.ts
import { Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { TenantRequest } from '../middleware/tenant';
import { AutomationEngine } from '../services/automation.service';

const prisma = new PrismaClient();

/**
 * GET /api/v1/workflow/rules
 */
export async function getWorkflowRules(req: TenantRequest, res: Response) {
  try {
    const tenantId = req.tenantId!;
    const rules = await prisma.automationRule.findMany({
      where: { tenantId },
      orderBy: { createdAt: 'desc' },
      include: {
        logs: { orderBy: { executedAt: 'desc' }, take: 5 }
      }
    });

    const parsedRules = rules.map(r => {
      let conditions = [];
      let actions = [];
      try { conditions = JSON.parse(r.conditions); } catch (e) {}
      try { actions = JSON.parse(r.actions); } catch (e) {}
      return {
        ...r,
        conditions,
        actions
      };
    });

    return res.json({ success: true, rules: parsedRules });
  } catch (err: any) {
    return res.status(500).json({ success: false, message: err.message });
  }
}

/**
 * POST /api/v1/workflow/rules
 */
export async function createWorkflowRule(req: TenantRequest, res: Response) {
  try {
    const tenantId = req.tenantId!;
    const { name, triggerEvent, conditions = [], actions = [], isActive = true } = req.body;

    if (!name || !triggerEvent || !actions.length) {
      return res.status(400).json({ success: false, message: 'Name, triggerEvent, and at least one action are required' });
    }

    const rule = await prisma.automationRule.create({
      data: {
        tenantId,
        name,
        triggerEvent,
        conditions: typeof conditions === 'string' ? conditions : JSON.stringify(conditions),
        actions: typeof actions === 'string' ? actions : JSON.stringify(actions),
        isActive
      }
    });

    return res.status(201).json({ success: true, rule });
  } catch (err: any) {
    return res.status(500).json({ success: false, message: err.message });
  }
}

/**
 * POST /api/v1/workflow/rules/:id/toggle
 */
export async function toggleWorkflowRule(req: TenantRequest, res: Response) {
  try {
    const tenantId = req.tenantId!;
    const id = String(req.params.id);

    const rule = await prisma.automationRule.findFirst({ where: { id, tenantId } });
    if (!rule) return res.status(404).json({ success: false, message: 'Rule not found' });

    const updated = await prisma.automationRule.update({
      where: { id },
      data: { isActive: !rule.isActive }
    });

    return res.json({ success: true, rule: updated });
  } catch (err: any) {
    return res.status(500).json({ success: false, message: err.message });
  }
}

/**
 * GET /api/v1/workflow/logs
 */
export async function getWorkflowLogs(req: TenantRequest, res: Response) {
  try {
    const tenantId = req.tenantId!;
    const { limit = 50 } = req.query;

    const logs = await prisma.automationLog.findMany({
      where: { tenantId },
      orderBy: { executedAt: 'desc' },
      take: Number(limit),
      include: { rule: { select: { id: true, name: true, triggerEvent: true } } }
    });

    return res.json({ success: true, logs });
  } catch (err: any) {
    return res.status(500).json({ success: false, message: err.message });
  }
}

/**
 * POST /api/v1/workflow/test-trigger
 */
export async function testTrigger(req: TenantRequest, res: Response) {
  try {
    const tenantId = req.tenantId!;
    const { triggerEvent, payload = {} } = req.body;

    if (!triggerEvent) {
      return res.status(400).json({ success: false, message: 'triggerEvent is required' });
    }

    const results = await AutomationEngine.processEvent(tenantId, triggerEvent, payload);
    return res.json({ success: true, results });
  } catch (err: any) {
    return res.status(500).json({ success: false, message: err.message });
  }
}

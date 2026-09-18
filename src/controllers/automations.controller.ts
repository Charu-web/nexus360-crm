import { Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import { prisma } from '../lib/db';
import { AppError } from '../middleware/errorHandler';

const automationSchema = z.object({
  name: z.string().min(1, 'Rule name is required'),
  triggerEvent: z.string().min(1, 'Trigger event is required'),
  conditions: z.array(z.object({
    field: z.string(),
    operator: z.string(),
    value: z.any(),
  })).optional().default([]),
  actions: z.array(z.object({
    actionType: z.string(),
    params: z.any(),
  })).min(1, 'At least one action is required'),
  isActive: z.boolean().optional().default(true),
});

const getParamId = (param: string | string[]): string => {
  return Array.isArray(param) ? param[0] : param;
};

const getTenantId = (req: Request): string => {
  const tenantId = req.user?.tenantId || req.tenant?.id;
  if (!tenantId) throw new AppError('Tenant context missing', 400);
  return tenantId;
};

// GET /api/v1/automations
export const getAutomations = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const tenantId = getTenantId(req);

    const automations = await prisma.automationRule.findMany({
      where: { tenantId },
      orderBy: { createdAt: 'desc' },
    });

    res.status(200).json({
      success: true,
      automations: automations.map((a) => ({
        id: a.id,
        name: a.name,
        triggerEvent: a.triggerEvent,
        conditions: JSON.parse(a.conditions),
        actions: JSON.parse(a.actions),
        isActive: a.isActive,
        createdAt: a.createdAt,
      })),
    });
  } catch (error) {
    next(error);
  }
};

// POST /api/v1/automations
export const createAutomation = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const tenantId = getTenantId(req);

    const data = automationSchema.parse(req.body);

    const automation = await prisma.automationRule.create({
      data: {
        tenantId,
        name: data.name,
        triggerEvent: data.triggerEvent,
        conditions: JSON.stringify(data.conditions),
        actions: JSON.stringify(data.actions),
        isActive: data.isActive,
      },
    });

    res.status(201).json({
      success: true,
      message: 'Automation rule created successfully',
      automation: {
        id: automation.id,
        name: automation.name,
        triggerEvent: automation.triggerEvent,
        conditions: data.conditions,
        actions: data.actions,
        isActive: automation.isActive,
      },
    });
  } catch (error) {
    next(error);
  }
};

// PATCH /api/v1/automations/:id
export const updateAutomation = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const tenantId = getTenantId(req);

    const id = getParamId(req.params.id);
    const existing = await prisma.automationRule.findFirst({ where: { id, tenantId } });
    if (!existing) throw new AppError('Automation rule not found', 404);

    const { name, triggerEvent, conditions, actions, isActive } = req.body;

    const updated = await prisma.automationRule.update({
      where: { id },
      data: {
        ...(name ? { name } : {}),
        ...(triggerEvent ? { triggerEvent } : {}),
        ...(conditions ? { conditions: JSON.stringify(conditions) } : {}),
        ...(actions ? { actions: JSON.stringify(actions) } : {}),
        ...(isActive !== undefined ? { isActive: Boolean(isActive) } : {}),
      },
    });

    res.status(200).json({
      success: true,
      message: 'Automation rule updated successfully',
      automation: {
        id: updated.id,
        name: updated.name,
        triggerEvent: updated.triggerEvent,
        conditions: JSON.parse(updated.conditions),
        actions: JSON.parse(updated.actions),
        isActive: updated.isActive,
      },
    });
  } catch (error) {
    next(error);
  }
};

// DELETE /api/v1/automations/:id
export const deleteAutomation = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const tenantId = getTenantId(req);

    const id = getParamId(req.params.id);
    const existing = await prisma.automationRule.findFirst({ where: { id, tenantId } });
    if (!existing) throw new AppError('Automation rule not found', 404);

    await prisma.automationRule.delete({ where: { id } });

    res.status(200).json({
      success: true,
      message: 'Automation rule deleted successfully',
    });
  } catch (error) {
    next(error);
  }
};

// POST /api/v1/automations/:id/test
export const testAutomationRule = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const tenantId = getTenantId(req);

    const id = getParamId(req.params.id);
    const rule = await prisma.automationRule.findFirst({ where: { id, tenantId } });
    if (!rule) throw new AppError('Automation rule not found', 404);

    const testPayload = req.body || {};
    const conditions = JSON.parse(rule.conditions);
    const actions = JSON.parse(rule.actions);

    let evaluated = true;
    for (const cond of conditions) {
      const val = testPayload[cond.field];
      if (cond.operator === 'equals' && val !== cond.value) evaluated = false;
    }

    res.status(200).json({
      success: true,
      testResult: {
        ruleId: rule.id,
        ruleName: rule.name,
        triggerEvent: rule.triggerEvent,
        conditionsMatched: evaluated,
        executedActions: evaluated ? actions : [],
        simulatedOutput: evaluated ? 'Triggered successfully during dry-run test.' : 'Conditions evaluated to false.',
      },
    });
  } catch (error) {
    next(error);
  }
};

import { Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import { prisma } from '../lib/db';
import { AppError } from '../middleware/errorHandler';

const moduleSchema = z.object({
  moduleKey: z.string().min(1, 'Module key required'),
  enabled: z.boolean().default(true),
});

const SYSTEM_REQUIRED_MODULES = ['LEADS', 'CUSTOMERS', 'TASKS', 'REPORTS'];

const getParamId = (param: string | string[]): string => {
  return Array.isArray(param) ? param[0] : param;
};

// GET /api/v1/modules
export const getTenantModules = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const tenantId = req.tenant?.id;
    if (!tenantId) throw new AppError('Tenant context missing', 400);

    const modules = await prisma.tenantModule.findMany({
      where: { tenantId },
      orderBy: { moduleKey: 'asc' },
    });

    res.status(200).json({
      success: true,
      modules,
    });
  } catch (error) {
    next(error);
  }
};

// POST /api/v1/modules
export const createOrEnableModule = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const tenantId = req.tenant?.id;
    if (!tenantId) throw new AppError('Tenant context missing', 400);

    const data = moduleSchema.parse(req.body);
    const moduleKey = data.moduleKey.toUpperCase();

    const moduleRecord = await prisma.tenantModule.upsert({
      where: { tenantId_moduleKey: { tenantId, moduleKey } },
      update: { enabled: data.enabled },
      create: { tenantId, moduleKey, enabled: data.enabled },
    });

    res.status(200).json({
      success: true,
      message: `Module '${moduleKey}' ${moduleRecord.enabled ? 'enabled' : 'disabled'} successfully.`,
      module: moduleRecord,
    });
  } catch (error) {
    next(error);
  }
};

// PATCH /api/v1/modules/:id
export const updateModuleStatus = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const tenantId = req.tenant?.id;
    if (!tenantId) throw new AppError('Tenant context missing', 400);

    const id = getParamId(req.params.id);
    const { enabled } = req.body;

    const existing = await prisma.tenantModule.findFirst({
      where: { id, tenantId },
    });

    if (!existing) throw new AppError('Module record not found', 404);

    if (!enabled && SYSTEM_REQUIRED_MODULES.includes(existing.moduleKey.toUpperCase())) {
      throw new AppError(`Cannot disable system-required module '${existing.moduleKey}'.`, 400);
    }

    const updated = await prisma.tenantModule.update({
      where: { id },
      data: { enabled: Boolean(enabled) },
    });

    res.status(200).json({
      success: true,
      message: `Module '${updated.moduleKey}' updated successfully`,
      module: updated,
    });
  } catch (error) {
    next(error);
  }
};

// DELETE /api/v1/modules/:id
export const deleteModule = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const tenantId = req.tenant?.id;
    if (!tenantId) throw new AppError('Tenant context missing', 400);

    const id = getParamId(req.params.id);
    const existing = await prisma.tenantModule.findFirst({
      where: { id, tenantId },
    });

    if (!existing) throw new AppError('Module record not found', 404);

    if (SYSTEM_REQUIRED_MODULES.includes(existing.moduleKey.toUpperCase())) {
      throw new AppError(`Cannot delete system-required module '${existing.moduleKey}'.`, 400);
    }

    await prisma.tenantModule.delete({ where: { id } });

    res.status(200).json({
      success: true,
      message: `Module '${existing.moduleKey}' removed successfully.`,
    });
  } catch (error) {
    next(error);
  }
};

import { Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import { prisma } from '../lib/db';
import { AppError } from '../middleware/errorHandler';

const pipelineSchema = z.object({
  name: z.string().min(1, 'Pipeline name is required'),
  isDefault: z.boolean().optional().default(false),
  stages: z.array(z.object({
    name: z.string().min(1, 'Stage name required'),
    stageKey: z.string().optional(),
    order: z.number(),
    color: z.string().optional().default('#3b82f6'),
    probability: z.number().optional().default(50),
    closedWon: z.boolean().optional().default(false),
    closedLost: z.boolean().optional().default(false),
  })).optional(),
});

const stageSchema = z.object({
  name: z.string().min(1, 'Stage name required'),
  stageKey: z.string().optional(),
  order: z.number(),
  color: z.string().optional().default('#3b82f6'),
  probability: z.number().optional().default(50),
  closedWon: z.boolean().optional().default(false),
  closedLost: z.boolean().optional().default(false),
});

const getParamId = (param: string | string[]): string => {
  return Array.isArray(param) ? param[0] : param;
};

const getTenantId = (req: Request): string => {
  const tenantId = req.user?.tenantId || req.tenant?.id;
  if (!tenantId) throw new AppError('Tenant context missing', 400);
  return tenantId;
};

// GET /api/v1/pipelines
export const getTenantPipelines = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const tenantId = getTenantId(req);
    const pipelines = await prisma.pipeline.findMany({
      where: { tenantId },
      include: {
        stages: { orderBy: { order: 'asc' } },
      },
      orderBy: { createdAt: 'asc' },
    });

    res.status(200).json({
      success: true,
      pipelines,
    });
  } catch (error) {
    next(error);
  }
};

// POST /api/v1/pipelines
export const createPipeline = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const tenantId = getTenantId(req);
    const data = pipelineSchema.parse(req.body);

    if (data.isDefault) {
      await prisma.pipeline.updateMany({
        where: { tenantId },
        data: { isDefault: false },
      });
    }

    const defaultStages = data.stages || [
      { name: 'New Lead', stageKey: 'new', order: 1, color: '#3b82f6', probability: 10, closedWon: false, closedLost: false },
      { name: 'Contacted', stageKey: 'contacted', order: 2, color: '#f59e0b', probability: 30, closedWon: false, closedLost: false },
      { name: 'Qualified', stageKey: 'qualified', order: 3, color: '#8b5cf6', probability: 50, closedWon: false, closedLost: false },
      { name: 'Proposal Sent', stageKey: 'proposal', order: 4, color: '#06b6d4', probability: 75, closedWon: false, closedLost: false },
      { name: 'Closed Won', stageKey: 'won', order: 5, color: '#10b981', probability: 100, closedWon: true, closedLost: false },
      { name: 'Closed Lost', stageKey: 'lost', order: 6, color: '#ef4444', probability: 0, closedWon: false, closedLost: true },
    ];

    const pipeline = await prisma.pipeline.create({
      data: {
        tenantId,
        name: data.name,
        isDefault: data.isDefault,
        stages: {
          create: defaultStages.map((s) => ({
            tenantId,
            name: s.name,
            stageKey: s.stageKey || s.name.toLowerCase().replace(/[^a-z0-9]+/g, '_'),
            order: s.order,
            color: s.color || '#3b82f6',
            probability: s.probability || 50,
            closedWon: s.closedWon || false,
            closedLost: s.closedLost || false,
          })),
        },
      },
      include: { stages: { orderBy: { order: 'asc' } } },
    });

    res.status(201).json({
      success: true,
      message: 'Pipeline created successfully',
      pipeline,
    });
  } catch (error) {
    next(error);
  }
};

// PATCH /api/v1/pipelines/:id
export const updatePipeline = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const tenantId = getTenantId(req);
    const id = getParamId(req.params.id);
    const existing = await prisma.pipeline.findFirst({ where: { id, tenantId } });
    if (!existing) throw new AppError('Pipeline not found', 404);

    const { name, isDefault } = req.body;

    if (isDefault) {
      await prisma.pipeline.updateMany({
        where: { tenantId },
        data: { isDefault: false },
      });
    }

    const updated = await prisma.pipeline.update({
      where: { id },
      data: {
        ...(name ? { name } : {}),
        ...(isDefault !== undefined ? { isDefault: Boolean(isDefault) } : {}),
      },
      include: { stages: { orderBy: { order: 'asc' } } },
    });

    res.status(200).json({
      success: true,
      message: 'Pipeline updated successfully',
      pipeline: updated,
    });
  } catch (error) {
    next(error);
  }
};

// DELETE /api/v1/pipelines/:id
export const deletePipeline = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const tenantId = getTenantId(req);
    const id = getParamId(req.params.id);
    const existing = await prisma.pipeline.findFirst({ where: { id, tenantId } });
    if (!existing) throw new AppError('Pipeline not found', 404);

    const count = await prisma.pipeline.count({ where: { tenantId } });
    if (count <= 1) throw new AppError('Cannot delete the only remaining pipeline in your workspace.', 400);

    await prisma.pipeline.delete({ where: { id } });

    res.status(200).json({
      success: true,
      message: 'Pipeline deleted successfully',
    });
  } catch (error) {
    next(error);
  }
};

// POST /api/v1/pipelines/:id/stages
export const createPipelineStage = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const tenantId = getTenantId(req);
    const pipelineId = getParamId(req.params.id);
    const pipeline = await prisma.pipeline.findFirst({ where: { id: pipelineId, tenantId } });
    if (!pipeline) throw new AppError('Pipeline not found', 404);

    const data = stageSchema.parse(req.body);

    const stage = await prisma.pipelineStage.create({
      data: {
        tenantId,
        pipelineId,
        name: data.name,
        stageKey: data.stageKey || data.name.toLowerCase().replace(/[^a-z0-9]+/g, '_'),
        order: data.order,
        color: data.color,
        probability: data.probability,
        closedWon: data.closedWon,
        closedLost: data.closedLost,
      },
    });

    res.status(201).json({
      success: true,
      message: 'Pipeline stage created successfully',
      stage,
    });
  } catch (error) {
    next(error);
  }
};

// PATCH /api/v1/pipeline-stages/:id
export const updatePipelineStage = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const tenantId = getTenantId(req);
    const id = getParamId(req.params.id);
    const existing = await prisma.pipelineStage.findFirst({ where: { id, tenantId } });
    if (!existing) throw new AppError('Pipeline stage not found', 404);

    const { name, order, color, probability, closedWon, closedLost } = req.body;

    const updated = await prisma.pipelineStage.update({
      where: { id },
      data: {
        ...(name ? { name } : {}),
        ...(order !== undefined ? { order: Number(order) } : {}),
        ...(color ? { color } : {}),
        ...(probability !== undefined ? { probability: Number(probability) } : {}),
        ...(closedWon !== undefined ? { closedWon: Boolean(closedWon) } : {}),
        ...(closedLost !== undefined ? { closedLost: Boolean(closedLost) } : {}),
      },
    });

    res.status(200).json({
      success: true,
      message: 'Pipeline stage updated successfully',
      stage: updated,
    });
  } catch (error) {
    next(error);
  }
};

// DELETE /api/v1/pipeline-stages/:id
export const deletePipelineStage = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const tenantId = getTenantId(req);
    const id = getParamId(req.params.id);
    const existing = await prisma.pipelineStage.findFirst({ where: { id, tenantId } });
    if (!existing) throw new AppError('Pipeline stage not found', 404);

    await prisma.pipelineStage.delete({ where: { id } });

    res.status(200).json({
      success: true,
      message: 'Pipeline stage deleted successfully',
    });
  } catch (error) {
    next(error);
  }
};

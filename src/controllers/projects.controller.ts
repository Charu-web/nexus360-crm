import { Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import { prisma } from '../lib/db';
import { AppError } from '../middleware/errorHandler';

const createProjectSchema = z.object({
  name: z.string().min(2, 'Project name is required'),
  description: z.string().optional(),
  status: z.string().default('In Progress'),
  budget: z.number().optional().default(0),
  startDate: z.string().or(z.date()).optional(),
  endDate: z.string().or(z.date()).optional(),
});

const getParamId = (param: string | string[]): string => {
  return Array.isArray(param) ? param[0] : param;
};

const getTenantId = (req: Request): string => {
  const tenantId = req.tenant?.id || req.user?.tenantId;
  if (!tenantId) throw new AppError('Tenant context missing', 400);
  return tenantId;
};

export const getProjects = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const tenantId = getTenantId(req);
    const projects = await prisma.project.findMany({
      where: { tenantId },
      include: {
        tasks: { select: { id: true, title: true, status: true, priority: true } },
        milestones: { select: { id: true, title: true, isCompleted: true, dueDate: true } },
      },
      orderBy: { createdAt: 'desc' },
    });

    res.status(200).json({ success: true, projects });
  } catch (error) {
    next(error);
  }
};

export const createProject = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const tenantId = getTenantId(req);
    const data = createProjectSchema.parse(req.body);

    const project = await prisma.project.create({
      data: {
        tenantId,
        name: data.name,
        description: data.description || null,
        status: data.status,
        budget: Number(data.budget) || 0,
        startDate: data.startDate ? new Date(data.startDate) : null,
        endDate: data.endDate ? new Date(data.endDate) : null,
        createdById: req.user?.id || null,
      },
    });

    res.status(201).json({ success: true, message: 'Project created successfully', project });
  } catch (error) {
    next(error);
  }
};

export const createProjectTask = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const tenantId = getTenantId(req);
    const projectId = getParamId(req.params.id);
    const { title, priority, status, dueDate, assignedToId } = req.body;

    const project = await prisma.project.findFirst({ where: { id: projectId, tenantId } });
    if (!project) throw new AppError('Project not found', 404);

    const task = await prisma.projectTask.create({
      data: {
        tenantId,
        projectId,
        title,
        priority: priority || 'Medium',
        status: status || 'Pending',
        dueDate: dueDate ? new Date(dueDate) : null,
        assignedToId: assignedToId || null,
      },
    });

    res.status(201).json({ success: true, message: 'Project task created', task });
  } catch (error) {
    next(error);
  }
};

export const createProjectMilestone = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const tenantId = getTenantId(req);
    const projectId = getParamId(req.params.id);
    const { title, dueDate, isCompleted } = req.body;

    const project = await prisma.project.findFirst({ where: { id: projectId, tenantId } });
    if (!project) throw new AppError('Project not found', 404);

    const milestone = await prisma.projectMilestone.create({
      data: {
        tenantId,
        projectId,
        title,
        isCompleted: Boolean(isCompleted),
        dueDate: dueDate ? new Date(dueDate) : null,
      },
    });

    res.status(201).json({ success: true, message: 'Project milestone created', milestone });
  } catch (error) {
    next(error);
  }
};

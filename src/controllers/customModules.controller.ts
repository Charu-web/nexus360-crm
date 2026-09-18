import { Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import { prisma } from '../lib/db';
import { AppError } from '../middleware/errorHandler';
import { recordAuditLog } from '../middleware/auditLogger';

const createModuleSchema = z.object({
  moduleKey: z.string().min(1, 'Module key is required'),
  name: z.string().min(1, 'Module name is required'),
  singularName: z.string().optional(),
  pluralName: z.string().optional(),
  icon: z.string().optional().default('Folder'),
  description: z.string().optional(),
});

const createRecordSchema = z.object({
  title: z.string().min(1, 'Record title is required'),
  data: z.record(z.any()).optional().default({}),
});

const createViewSchema = z.object({
  name: z.string().min(1, 'View name is required'),
  filters: z.array(z.any()).optional().default([]),
  isDefault: z.boolean().optional().default(false),
});

const getParamId = (param: string | string[]): string => {
  return Array.isArray(param) ? param[0] : param;
};

const getTenantId = (req: Request): string => {
  const tenantId = req.user?.tenantId || req.tenant?.id;
  if (!tenantId) throw new AppError('Tenant context missing', 400);
  return tenantId;
};

// 1. Create Dynamic Custom Module
export const createCustomModule = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const tenantId = getTenantId(req);
    const data = createModuleSchema.parse(req.body);

    const moduleKey = data.moduleKey.toUpperCase().replace(/[^A-Z0-9_]+/g, '_');

    const existing = await prisma.tenantModule.findFirst({
      where: { tenantId, moduleKey },
    });

    if (existing && existing.enabled) {
      throw new AppError(`Module '${data.name}' already exists in your workspace.`, 409);
    }

    const moduleRecord = await prisma.tenantModule.upsert({
      where: { tenantId_moduleKey: { tenantId, moduleKey } },
      update: {
        name: data.name,
        singularName: data.singularName || data.name,
        pluralName: data.pluralName || (data.name + 's'),
        icon: data.icon,
        description: data.description || null,
        isCustom: true,
        enabled: true,
      },
      create: {
        tenantId,
        moduleKey,
        name: data.name,
        singularName: data.singularName || data.name,
        pluralName: data.pluralName || (data.name + 's'),
        icon: data.icon,
        description: data.description || null,
        isCustom: true,
        enabled: true,
      },
    });

    await recordAuditLog({
      tenantId,
      userId: req.user?.id,
      action: 'CREATE_CUSTOM_MODULE',
      entity: 'TenantModule',
      entityId: moduleRecord.id,
      details: { moduleKey, name: data.name },
      req,
    });

    res.status(201).json({
      success: true,
      message: `Custom CRM Module '${data.name}' created successfully!`,
      module: moduleRecord,
    });
  } catch (error) {
    next(error);
  }
};

// 2. GET Custom Records for Module
export const getCustomRecords = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const tenantId = getTenantId(req);
    const moduleKey = getParamId(req.params.moduleKey).toUpperCase();
    const page = parseInt((req.query.page as string) || '1', 10);
    const limit = parseInt((req.query.limit as string) || '50', 10);
    const search = req.query.search as string | undefined;

    const where: any = {
      tenantId,
      moduleKey,
      ...(search ? { title: { contains: search } } : {}),
    };

    const total = await prisma.customRecord.count({ where });
    const records = await prisma.customRecord.findMany({
      where,
      skip: (page - 1) * limit,
      take: limit,
      orderBy: { createdAt: 'desc' },
    });

    res.status(200).json({
      success: true,
      pagination: {
        total,
        page,
        limit,
        pages: Math.ceil(total / limit),
      },
      records: records.map((r) => ({
        id: r.id,
        recordId: r.recordId,
        moduleKey: r.moduleKey,
        title: r.title,
        data: JSON.parse(r.data || '{}'),
        createdAt: r.createdAt,
        updatedAt: r.updatedAt,
      })),
    });
  } catch (error) {
    next(error);
  }
};

// 3. Create Custom Record
export const createCustomRecord = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const tenantId = getTenantId(req);
    const moduleKey = getParamId(req.params.moduleKey).toUpperCase();
    const data = createRecordSchema.parse(req.body);

    const count = await prisma.customRecord.count({ where: { tenantId, moduleKey } });
    const recordId = `${moduleKey.substring(0, 4)}-${1001 + count}`;

    const record = await prisma.customRecord.create({
      data: {
        tenantId,
        moduleKey,
        recordId,
        title: data.title,
        data: JSON.stringify(data.data || {}),
        createdById: req.user?.id || null,
      },
    });

    await recordAuditLog({
      tenantId,
      userId: req.user?.id,
      action: 'CREATE_CUSTOM_RECORD',
      entity: 'CustomRecord',
      entityId: record.id,
      details: { moduleKey, recordId, title: data.title },
      req,
    });

    res.status(201).json({
      success: true,
      message: 'Record created successfully',
      record: {
        id: record.id,
        recordId: record.recordId,
        moduleKey: record.moduleKey,
        title: record.title,
        data: data.data || {},
        createdAt: record.createdAt,
      },
    });
  } catch (error) {
    next(error);
  }
};

// 4. Update Custom Record
export const updateCustomRecord = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const tenantId = getTenantId(req);
    const moduleKey = getParamId(req.params.moduleKey).toUpperCase();
    const id = getParamId(req.params.id);

    const existing = await prisma.customRecord.findFirst({
      where: { id, tenantId, moduleKey },
    });
    if (!existing) throw new AppError('Record not found', 404);

    const { title, data } = req.body;
    const currentData = JSON.parse(existing.data || '{}');
    const updatedData = data ? { ...currentData, ...data } : currentData;

    const updated = await prisma.customRecord.update({
      where: { id },
      data: {
        ...(title ? { title } : {}),
        data: JSON.stringify(updatedData),
      },
    });

    res.status(200).json({
      success: true,
      message: 'Record updated successfully',
      record: {
        id: updated.id,
        recordId: updated.recordId,
        moduleKey: updated.moduleKey,
        title: updated.title,
        data: updatedData,
        updatedAt: updated.updatedAt,
      },
    });
  } catch (error) {
    next(error);
  }
};

// 5. Delete Custom Record
export const deleteCustomRecord = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const tenantId = getTenantId(req);
    const moduleKey = getParamId(req.params.moduleKey).toUpperCase();
    const id = getParamId(req.params.id);

    const existing = await prisma.customRecord.findFirst({
      where: { id, tenantId, moduleKey },
    });
    if (!existing) throw new AppError('Record not found', 404);

    await prisma.customRecord.delete({ where: { id } });

    res.status(200).json({
      success: true,
      message: 'Record deleted successfully',
    });
  } catch (error) {
    next(error);
  }
};

// 6. GET & POST Custom Views
export const getCustomViews = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const tenantId = getTenantId(req);
    const moduleKey = getParamId(req.params.moduleKey).toUpperCase();

    const views = await prisma.customView.findMany({
      where: { tenantId, moduleKey },
      orderBy: { createdAt: 'desc' },
    });

    res.status(200).json({
      success: true,
      views: views.map((v) => ({
        id: v.id,
        moduleKey: v.moduleKey,
        name: v.name,
        filters: JSON.parse(v.filters || '[]'),
        isDefault: v.isDefault,
      })),
    });
  } catch (error) {
    next(error);
  }
};

export const createCustomView = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const tenantId = getTenantId(req);
    const moduleKey = getParamId(req.params.moduleKey).toUpperCase();
    const data = createViewSchema.parse(req.body);

    const view = await prisma.customView.create({
      data: {
        tenantId,
        moduleKey,
        name: data.name,
        filters: JSON.stringify(data.filters || []),
        isDefault: data.isDefault,
        createdById: req.user?.id || null,
      },
    });

    res.status(201).json({
      success: true,
      message: 'Custom view created successfully',
      view: {
        id: view.id,
        moduleKey: view.moduleKey,
        name: view.name,
        filters: data.filters || [],
        isDefault: view.isDefault,
      },
    });
  } catch (error) {
    next(error);
  }
};

// 7. GET & POST Dashboard Config
export const getDashboardConfig = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const tenantId = getTenantId(req);

    const widgets = await prisma.dashboardWidget.findMany({
      where: { tenantId },
      orderBy: { order: 'asc' },
    });

    res.status(200).json({
      success: true,
      widgets: widgets.map((w) => ({
        id: w.id,
        widgetKey: w.widgetKey,
        title: w.title,
        type: w.type,
        config: w.config ? JSON.parse(w.config) : {},
        order: w.order,
        visible: w.visible,
      })),
    });
  } catch (error) {
    next(error);
  }
};

export const updateDashboardConfig = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const tenantId = getTenantId(req);
    const { widgets } = req.body;

    if (!Array.isArray(widgets)) {
      throw new AppError('Widgets array required', 400);
    }

    await prisma.dashboardWidget.deleteMany({ where: { tenantId } });

    for (let idx = 0; idx < widgets.length; idx++) {
      const w = widgets[idx];
      await prisma.dashboardWidget.create({
        data: {
          tenantId,
          userId: req.user?.id || null,
          widgetKey: w.widgetKey || `widget-${idx}`,
          title: w.title || 'Dashboard Widget',
          type: w.type || 'METRIC',
          config: w.config ? JSON.stringify(w.config) : null,
          order: idx + 1,
          visible: w.visible ?? true,
        },
      });
    }

    res.status(200).json({
      success: true,
      message: 'Dashboard layout updated successfully',
    });
  } catch (error) {
    next(error);
  }
};

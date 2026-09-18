import { Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import { prisma } from '../lib/db';
import { AppError } from '../middleware/errorHandler';

const customFieldSchema = z.object({
  entityType: z.string().min(1, 'Entity/Module type required'),
  fieldName: z.string().min(1, 'Field name required'),
  fieldKey: z.string().optional(),
  fieldType: z.enum([
    'TEXT', 'LONG_TEXT', 'NUMBER', 'CURRENCY', 'DATE', 'DATETIME', 'BOOLEAN',
    'EMAIL', 'PHONE', 'URL', 'DROPDOWN', 'MULTI_SELECT', 'USER', 'RELATION', 'FILE'
  ]),
  options: z.array(z.string()).optional(),
  isRequired: z.boolean().optional().default(false),
  isUnique: z.boolean().optional().default(false),
  isVisible: z.boolean().optional().default(true),
  isEditable: z.boolean().optional().default(true),
  displayOrder: z.number().optional().default(0),
  validation: z.string().optional(),
  defaultValue: z.string().optional(),
});

const getParamId = (param: string | string[]): string => {
  return Array.isArray(param) ? param[0] : param;
};

const getTenantId = (req: Request): string => {
  const tenantId = req.user?.tenantId || req.tenant?.id;
  if (!tenantId) throw new AppError('Tenant context missing', 400);
  return tenantId;
};

// GET /api/v1/custom-fields
export const listCustomFields = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const tenantId = getTenantId(req);
    const entityType = req.query.entityType as string | undefined;

    const customFields = await prisma.customField.findMany({
      where: {
        tenantId,
        ...(entityType ? { entityType: entityType.toUpperCase() } : {}),
      },
      orderBy: { displayOrder: 'asc' },
    });

    res.status(200).json({
      success: true,
      customFields: customFields.map((cf) => ({
        id: cf.id,
        entityType: cf.entityType,
        fieldName: cf.fieldName,
        fieldKey: cf.fieldKey,
        fieldType: cf.fieldType,
        options: cf.options ? JSON.parse(cf.options) : [],
        isRequired: cf.isRequired,
        isUnique: cf.isUnique,
        isVisible: cf.isVisible,
        isEditable: cf.isEditable,
        displayOrder: cf.displayOrder,
        validation: cf.validation,
        defaultValue: cf.defaultValue,
      })),
    });
  } catch (error) {
    next(error);
  }
};

// POST /api/v1/custom-fields
export const createCustomField = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const tenantId = getTenantId(req);
    const data = customFieldSchema.parse(req.body);

    const fieldKey = data.fieldKey || data.fieldName.toLowerCase().replace(/[^a-z0-9]+/g, '_');

    const existing = await prisma.customField.findFirst({
      where: { tenantId, entityType: data.entityType, fieldKey },
    });
    if (existing) {
      throw new AppError(`A custom field with key '${fieldKey}' already exists for ${data.entityType}.`, 409);
    }

    const customField = await prisma.customField.create({
      data: {
        tenantId,
        entityType: data.entityType,
        fieldName: data.fieldName,
        fieldKey,
        fieldType: data.fieldType,
        options: data.options ? JSON.stringify(data.options) : null,
        isRequired: data.isRequired,
        isUnique: data.isUnique,
        isVisible: data.isVisible,
        isEditable: data.isEditable,
        displayOrder: data.displayOrder,
        validation: data.validation,
        defaultValue: data.defaultValue,
      },
    });

    res.status(201).json({
      success: true,
      message: 'Custom field created successfully',
      customField: {
        id: customField.id,
        entityType: customField.entityType,
        fieldName: customField.fieldName,
        fieldKey: customField.fieldKey,
        fieldType: customField.fieldType,
        options: data.options || [],
        isRequired: customField.isRequired,
        isUnique: customField.isUnique,
        isVisible: customField.isVisible,
        isEditable: customField.isEditable,
        displayOrder: customField.displayOrder,
      },
    });
  } catch (error) {
    next(error);
  }
};

// PATCH /api/v1/custom-fields/:id
export const updateCustomField = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const tenantId = getTenantId(req);
    const id = getParamId(req.params.id);
    const existing = await prisma.customField.findFirst({
      where: { id, tenantId },
    });
    if (!existing) throw new AppError('Custom field not found', 404);

    const { fieldName, options, isRequired, isVisible, isEditable, displayOrder, defaultValue } = req.body;

    const updated = await prisma.customField.update({
      where: { id },
      data: {
        ...(fieldName ? { fieldName } : {}),
        ...(options ? { options: JSON.stringify(options) } : {}),
        ...(isRequired !== undefined ? { isRequired: Boolean(isRequired) } : {}),
        ...(isVisible !== undefined ? { isVisible: Boolean(isVisible) } : {}),
        ...(isEditable !== undefined ? { isEditable: Boolean(isEditable) } : {}),
        ...(displayOrder !== undefined ? { displayOrder: Number(displayOrder) } : {}),
        ...(defaultValue !== undefined ? { defaultValue } : {}),
      },
    });

    res.status(200).json({
      success: true,
      message: 'Custom field updated successfully',
      customField: updated,
    });
  } catch (error) {
    next(error);
  }
};

// DELETE /api/v1/custom-fields/:id
export const deleteCustomField = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const tenantId = getTenantId(req);
    const id = getParamId(req.params.id);
    const existing = await prisma.customField.findFirst({
      where: { id, tenantId },
    });
    if (!existing) throw new AppError('Custom field not found', 404);

    await prisma.customField.delete({ where: { id } });

    res.status(200).json({
      success: true,
      message: 'Custom field deleted successfully',
    });
  } catch (error) {
    next(error);
  }
};

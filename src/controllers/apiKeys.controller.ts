import { Request, Response, NextFunction } from 'express';
import crypto from 'crypto';
import { z } from 'zod';
import { prisma } from '../lib/db';
import { AppError } from '../middleware/errorHandler';

const createKeySchema = z.object({
  name: z.string().min(1, 'Key name is required'),
  permissions: z.array(z.string()).optional().default(['*']),
});

const getParamId = (param: string | string[]): string => {
  return Array.isArray(param) ? param[0] : param;
};

const getTenantId = (req: Request): string => {
  const tenantId = req.user?.tenantId || req.tenant?.id;
  if (!tenantId) throw new AppError('Tenant context missing', 400);
  return tenantId;
};

// GET /api/v1/tenant/api-keys
export const getApiKeys = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const tenantId = getTenantId(req);

    const keys = await prisma.apiKey.findMany({
      where: { tenantId },
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        name: true,
        keyPrefix: true,
        permissions: true,
        lastUsedAt: true,
        isRevoked: true,
        createdAt: true,
      },
    });

    res.status(200).json({
      success: true,
      apiKeys: keys.map((k) => ({
        ...k,
        permissions: JSON.parse(k.permissions),
      })),
    });
  } catch (error) {
    next(error);
  }
};

// POST /api/v1/tenant/api-keys
export const generateApiKey = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const tenantId = getTenantId(req);

    const data = createKeySchema.parse(req.body);

    const rawKey = 'sk_live_' + crypto.randomBytes(24).toString('hex');
    const keyPrefix = rawKey.substring(0, 12);
    const keyHash = crypto.createHash('sha256').update(rawKey).digest('hex');

    const apiKey = await prisma.apiKey.create({
      data: {
        tenantId,
        name: data.name,
        keyPrefix,
        keyHash,
        permissions: JSON.stringify(data.permissions),
      },
    });

    res.status(201).json({
      success: true,
      message: 'API Key generated successfully. Save this secret key now as it will not be displayed again.',
      apiKey: rawKey,
      keyRecord: {
        id: apiKey.id,
        name: apiKey.name,
        keyPrefix: apiKey.keyPrefix,
        permissions: data.permissions,
        createdAt: apiKey.createdAt,
      },
    });
  } catch (error) {
    next(error);
  }
};

// POST /api/v1/tenant/api-keys/:id/revoke
export const revokeApiKey = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const tenantId = getTenantId(req);

    const id = getParamId(req.params.id);
    const existing = await prisma.apiKey.findFirst({ where: { id, tenantId } });
    if (!existing) throw new AppError('API key not found', 404);

    await prisma.apiKey.update({
      where: { id },
      data: { isRevoked: true },
    });

    res.status(200).json({
      success: true,
      message: 'API key revoked successfully.',
    });
  } catch (error) {
    next(error);
  }
};

// POST /api/v1/tenant/api-keys/:id/rotate
export const rotateApiKey = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const tenantId = getTenantId(req);

    const id = getParamId(req.params.id);
    const existing = await prisma.apiKey.findFirst({ where: { id, tenantId } });
    if (!existing) throw new AppError('API key not found', 404);

    const newRawKey = 'sk_live_' + crypto.randomBytes(24).toString('hex');
    const newKeyPrefix = newRawKey.substring(0, 12);
    const newKeyHash = crypto.createHash('sha256').update(newRawKey).digest('hex');

    const updated = await prisma.apiKey.update({
      where: { id },
      data: {
        keyPrefix: newKeyPrefix,
        keyHash: newKeyHash,
        isRevoked: false,
        lastUsedAt: null,
      },
    });

    res.status(200).json({
      success: true,
      message: 'API key rotated successfully.',
      newApiKey: newRawKey,
      keyRecord: {
        id: updated.id,
        name: updated.name,
        keyPrefix: updated.keyPrefix,
        createdAt: updated.createdAt,
      },
    });
  } catch (error) {
    next(error);
  }
};

// DELETE /api/v1/tenant/api-keys/:id
export const deleteApiKey = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const tenantId = getTenantId(req);

    const id = getParamId(req.params.id);
    const existing = await prisma.apiKey.findFirst({ where: { id, tenantId } });
    if (!existing) throw new AppError('API key not found', 404);

    await prisma.apiKey.delete({ where: { id } });

    res.status(200).json({
      success: true,
      message: 'API key deleted successfully.',
    });
  } catch (error) {
    next(error);
  }
};

import { Request, Response, NextFunction } from 'express';
import { prisma } from '../lib/db';
import { recordAuditLog } from '../middleware/auditLogger';

export const getSystemSettings = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const settings = await prisma.systemSetting.findMany({
      orderBy: { category: 'asc' },
    });
    res.status(200).json({ success: true, settings });
  } catch (error) {
    next(error);
  }
};

export const updateSystemSettings = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { settings } = req.body; // Array of { key, value, category, description }

    if (!Array.isArray(settings)) {
      res.status(400).json({ success: false, message: 'settings must be an array of objects' });
      return;
    }

    const updated = [];
    for (const item of settings) {
      if (item.key && item.value !== undefined) {
        const s = await prisma.systemSetting.upsert({
          where: { key: item.key },
          update: { value: String(item.value), ...(item.category && { category: item.category }) },
          create: {
            key: item.key,
            value: String(item.value),
            category: item.category || 'General',
            description: item.description || null,
          },
        });
        updated.push(s);
      }
    }

    await recordAuditLog({
      action: 'UPDATE_SETTINGS',
      entity: 'Setting',
      details: { updatedKeys: updated.map((u) => u.key) },
      req,
    });

    res.status(200).json({ success: true, message: 'System settings updated', settings: updated });
  } catch (error) {
    next(error);
  }
};

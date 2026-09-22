import { Request, Response, NextFunction } from 'express';
import { AuthService } from '../services/auth.service';
import { registerSchema, loginSchema, refreshTokenSchema } from '@nexus-ai/validation';
import { logAuditEvent } from '../middleware/auditLogger';
import { AuditAction } from '@prisma/client';
import { prisma } from '../lib/prisma';

export const register = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const validated = registerSchema.parse(req.body);
    const result = await AuthService.register(validated);

    await logAuditEvent({
      organizationId: result.organization.id,
      userId: result.user.id,
      action: AuditAction.CREATE,
      resource: 'UserRegistration',
      resourceId: result.user.id,
      details: `New organization '${result.organization.name}' and owner account created.`,
      req,
    });

    res.status(201).json({
      success: true,
      message: 'Registration successful. Welcome to NexusAI!',
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

export const login = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const validated = loginSchema.parse(req.body);
    const result = await AuthService.login(validated);

    await logAuditEvent({
      organizationId: result.organization.id,
      userId: result.user.id,
      action: AuditAction.LOGIN,
      resource: 'UserSession',
      resourceId: result.user.id,
      details: 'User authenticated successfully.',
      req,
    });

    res.status(200).json({
      success: true,
      message: 'Logged in successfully.',
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

export const refresh = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const validated = refreshTokenSchema.parse(req.body);
    const tokens = await AuthService.refresh(validated.refreshToken);

    res.status(200).json({
      success: true,
      message: 'Tokens refreshed successfully.',
      data: tokens,
    });
  } catch (error) {
    next(error);
  }
};

export const logout = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const refreshToken = req.body.refreshToken;
    await AuthService.logout(refreshToken);

    if (req.user && req.organizationId) {
      await logAuditEvent({
        organizationId: req.organizationId,
        userId: req.user.id,
        action: AuditAction.LOGOUT,
        resource: 'UserSession',
        details: 'User session terminated.',
        req,
      });
    }

    res.status(200).json({
      success: true,
      message: 'Logged out successfully.',
    });
  } catch (error) {
    next(error);
  }
};

export const getMe = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      res.status(401).json({ success: false, message: 'Unauthorized' });
      return;
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        fullName: true,
        avatarUrl: true,
        phone: true,
        isEmailVerified: true,
        memberships: {
          include: {
            organization: {
              select: {
                id: true,
                name: true,
                slug: true,
                plan: true,
                status: true,
                logoUrl: true,
                maxUsers: true,
                maxLeads: true,
                maxDocuments: true,
                usedAiCredits: true,
                maxAiCredits: true,
              },
            },
          },
        },
      },
    });

    res.status(200).json({
      success: true,
      data: user,
    });
  } catch (error) {
    next(error);
  }
};

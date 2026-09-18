import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import { config } from '../config';
import { prisma } from '../lib/db';
import { AppError } from './errorHandler';

export interface AuthenticatedUser {
  id: string;
  email: string;
  fullName: string;
  roleName: string;
  permissions: string[];
  isActive: boolean;
  tenantId?: string | null;
  isPlatformOwner?: boolean;
}

declare global {
  namespace Express {
    interface Request {
      user?: AuthenticatedUser;
    }
  }
}

export const authenticateJwt = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const authHeader = req.headers.authorization;
    let token: string | undefined;

    if (authHeader && authHeader.startsWith('Bearer ')) {
      token = authHeader.substring(7);
    } else if (req.headers.cookie) {
      const match = req.headers.cookie.match(/accessToken=([^;]+)/);
      if (match) token = match[1];
    }

    if (!token) {
      throw new AppError('Authentication token missing. Please sign in.', 401);
    }

    // 1. API Key Authentication (sk_live_...)
    if (token.startsWith('sk_live_')) {
      const keyHash = crypto.createHash('sha256').update(token).digest('hex');
      const apiKeyRecord = await prisma.apiKey.findUnique({
        where: { keyHash },
        include: { tenant: true },
      });

      if (!apiKeyRecord || apiKeyRecord.isRevoked) {
        throw new AppError('Invalid or revoked API key.', 401);
      }

      if (apiKeyRecord.tenant.status === 'SUSPENDED') {
        throw new AppError('Tenant workspace is suspended.', 403);
      }

      // Update lastUsedAt asynchronously
      prisma.apiKey.update({
        where: { id: apiKeyRecord.id },
        data: { lastUsedAt: new Date() },
      }).catch(() => {});

      let permissions: string[] = [];
      try {
        permissions = JSON.parse(apiKeyRecord.permissions);
      } catch {
        permissions = ['*'];
      }

      req.user = {
        id: `apikey-${apiKeyRecord.id}`,
        email: `api@${apiKeyRecord.tenant.slug}.local`,
        fullName: apiKeyRecord.name,
        roleName: 'API_KEY',
        permissions,
        isActive: true,
        tenantId: apiKeyRecord.tenantId,
        isPlatformOwner: false,
      };

      return next();
    }

    // 2. JWT Token Authentication
    let decoded: any;
    try {
      decoded = jwt.verify(token, config.jwtSecret);
    } catch (err: any) {
      if (err.name === 'TokenExpiredError') {
        throw new AppError('Session expired. Please sign in again.', 401);
      }
      throw new AppError('Invalid authentication token.', 401);
    }

    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      include: { role: true, tenant: true },
    });

    if (!user) {
      throw new AppError('User account not found.', 401);
    }

    if (!user.isActive) {
      throw new AppError('Your account has been deactivated. Please contact an admin.', 403);
    }

    let permissions: string[] = [];
    try {
      permissions = JSON.parse(user.role.permissions);
    } catch {
      permissions = [];
    }

    const isPlatformOwner = !user.tenantId || user.role.name === 'SUPER_ADMIN' || user.role.name === 'PLATFORM_ADMIN';

    req.user = {
      id: user.id,
      email: user.email,
      fullName: user.fullName,
      roleName: user.role.name,
      permissions,
      isActive: user.isActive,
      tenantId: user.tenantId,
      isPlatformOwner,
    };

    next();
  } catch (error) {
    next(error);
  }
};

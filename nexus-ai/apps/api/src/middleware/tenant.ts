import { Request, Response, NextFunction } from 'express';
import { prisma } from '../lib/prisma';
import { AppError } from './errorHandler';
import { OrganizationRole } from '@prisma/client';

export const resolveTenant = async (
  req: Request,
  _res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    if (!req.user) {
      throw new AppError('Authentication required before tenant resolution.', 401, 'UNAUTHORIZED');
    }

    // 1. Check header or query parameter, or fall back to token's default organization
    const orgIdHeader = (req.headers['x-organization-id'] as string) ||
                        (req.query.organizationId as string) ||
                        req.user.currentOrganizationId;

    if (!orgIdHeader) {
      // Find the user's primary or first membership
      const firstMembership = await prisma.organizationMember.findFirst({
        where: { userId: req.user.id },
        include: { organization: true },
      });

      if (!firstMembership) {
        throw new AppError('User does not belong to any active organization.', 403, 'NO_ORGANIZATION');
      }

      req.organizationId = firstMembership.organizationId;
      req.organizationRole = firstMembership.role;
      return next();
    }

    // 2. Enforce strict membership verification for the target organization
    const membership = await prisma.organizationMember.findUnique({
      where: {
        organizationId_userId: {
          organizationId: orgIdHeader,
          userId: req.user.id,
        },
      },
    });

    if (!membership) {
      throw new AppError('Access denied. You are not a member of this organization.', 403, 'FORBIDDEN_TENANT');
    }

    req.organizationId = membership.organizationId;
    req.organizationRole = membership.role;

    next();
  } catch (error) {
    next(error);
  }
};

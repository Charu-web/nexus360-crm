import bcrypt from 'bcryptjs';
import jwt, { SignOptions } from 'jsonwebtoken';
import crypto from 'crypto';
import { prisma } from '../lib/prisma';
import { config } from '../config';
import { AppError } from '../middleware/errorHandler';
import { OrganizationRole, SubscriptionPlan, SubscriptionStatus } from '@prisma/client';
import { RegisterInput, LoginInput } from '@nexus-ai/validation';

export class AuthService {
  static generateTokens(userId: string, organizationId?: string, role?: OrganizationRole) {
    const options: SignOptions = { expiresIn: config.jwtExpiresIn as any };
    const accessToken = jwt.sign(
      { userId, organizationId, role },
      config.jwtSecret,
      options
    );

    const rawRefreshToken = crypto.randomBytes(40).toString('hex');
    const tokenHash = crypto.createHash('sha256').update(rawRefreshToken).digest('hex');

    return {
      accessToken,
      refreshToken: rawRefreshToken,
      tokenHash,
      expiresIn: 86400, // 24 hours in seconds
    };
  }

  static async register(input: RegisterInput) {
    const existingUser = await prisma.user.findUnique({
      where: { email: input.email },
    });

    if (existingUser) {
      throw new AppError('An account with this email address already exists.', 409, 'USER_EXISTS');
    }

    const passwordHash = await bcrypt.hash(input.password, config.bcryptSaltRounds);

    let baseSlug = input.organizationSlug ||
      input.organizationName.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
    if (!baseSlug) baseSlug = 'workspace-' + Date.now();

    let slug = baseSlug;
    let counter = 1;
    while (await prisma.organization.findUnique({ where: { slug } })) {
      slug = `${baseSlug}-${counter}`;
      counter++;
    }

    const result = await prisma.$transaction(async (tx: any) => {
      const user = await tx.user.create({
        data: {
          email: input.email,
          fullName: input.fullName,
          passwordHash,
          isEmailVerified: false,
        },
      });

      const organization = await tx.organization.create({
        data: {
          name: input.organizationName,
          slug,
          plan: SubscriptionPlan.STARTER,
          status: SubscriptionStatus.TRIAL,
          trialEndsAt: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
        },
      });

      await tx.organizationMember.create({
        data: {
          organizationId: organization.id,
          userId: user.id,
          role: OrganizationRole.OWNER,
        },
      });

      await tx.pipeline.create({
        data: {
          organizationId: organization.id,
          name: 'Standard Sales Pipeline',
          isDefault: true,
          stages: {
            create: [
              { name: 'New Lead', stageKey: 'new', order: 1, probability: 10, color: '#3b82f6' },
              { name: 'Contacted', stageKey: 'contacted', order: 2, probability: 30, color: '#f59e0b' },
              { name: 'Qualified', stageKey: 'qualified', order: 3, probability: 50, color: '#8b5cf6' },
              { name: 'Proposal', stageKey: 'proposal', order: 4, probability: 75, color: '#06b6d4' },
              { name: 'Closed Won', stageKey: 'won', order: 5, probability: 100, color: '#10b981' },
              { name: 'Closed Lost', stageKey: 'lost', order: 6, probability: 0, color: '#ef4444' },
            ],
          },
        },
      });

      return { user, organization };
    });

    const tokens = this.generateTokens(result.user.id, result.organization.id, OrganizationRole.OWNER);

    await prisma.refreshToken.create({
      data: {
        userId: result.user.id,
        tokenHash: tokens.tokenHash,
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      },
    });

    return {
      user: {
        id: result.user.id,
        email: result.user.email,
        fullName: result.user.fullName,
      },
      organization: {
        id: result.organization.id,
        name: result.organization.name,
        slug: result.organization.slug,
        role: OrganizationRole.OWNER,
      },
      tokens: {
        accessToken: tokens.accessToken,
        refreshToken: tokens.refreshToken,
        expiresIn: tokens.expiresIn,
      },
    };
  }

  static async login(input: LoginInput) {
    const user = await prisma.user.findUnique({
      where: { email: input.email },
      include: {
        memberships: {
          include: { organization: true },
          orderBy: { joinedAt: 'asc' },
        },
      },
    });

    if (!user || !user.isActive) {
      throw new AppError('Invalid email or password.', 401, 'INVALID_CREDENTIALS');
    }

    const isPasswordValid = await bcrypt.compare(input.password, user.passwordHash);
    if (!isPasswordValid) {
      throw new AppError('Invalid email or password.', 401, 'INVALID_CREDENTIALS');
    }

    const primaryMembership = user.memberships[0];
    if (!primaryMembership) {
      throw new AppError('User has no active organization memberships.', 403, 'NO_ORGANIZATION');
    }

    const tokens = this.generateTokens(
      user.id,
      primaryMembership.organizationId,
      primaryMembership.role
    );

    await prisma.refreshToken.create({
      data: {
        userId: user.id,
        tokenHash: tokens.tokenHash,
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      },
    });

    await prisma.user.update({
      where: { id: user.id },
      data: { lastLoginAt: new Date() },
    });

    return {
      user: {
        id: user.id,
        email: user.email,
        fullName: user.fullName,
        avatarUrl: user.avatarUrl,
      },
      organization: {
        id: primaryMembership.organization.id,
        name: primaryMembership.organization.name,
        slug: primaryMembership.organization.slug,
        role: primaryMembership.role,
      },
      organizations: user.memberships.map((m: any) => ({
        id: m.organization.id,
        name: m.organization.name,
        slug: m.organization.slug,
        role: m.role,
      })),
      tokens: {
        accessToken: tokens.accessToken,
        refreshToken: tokens.refreshToken,
        expiresIn: tokens.expiresIn,
      },
    };
  }

  static async refresh(rawRefreshToken: string) {
    const tokenHash = crypto.createHash('sha256').update(rawRefreshToken).digest('hex');

    const storedToken = await prisma.refreshToken.findUnique({
      where: { tokenHash },
      include: { user: { include: { memberships: { include: { organization: true } } } } },
    });

    if (!storedToken || storedToken.isRevoked || storedToken.expiresAt < new Date()) {
      throw new AppError('Invalid or expired refresh token. Please sign in again.', 401, 'REFRESH_TOKEN_EXPIRED');
    }

    await prisma.refreshToken.update({
      where: { id: storedToken.id },
      data: { isRevoked: true },
    });

    const user = storedToken.user || (await prisma.user.findUnique({
      where: { id: storedToken.userId },
      include: { memberships: { include: { organization: true } } },
    }));

    if (!user) {
      throw new AppError('User not found for token.', 401, 'USER_NOT_FOUND');
    }

    const primaryMembership = user.memberships?.[0];

    const tokens = this.generateTokens(
      user.id,
      primaryMembership?.organizationId,
      primaryMembership?.role
    );

    await prisma.refreshToken.create({
      data: {
        userId: user.id,
        tokenHash: tokens.tokenHash,
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      },
    });

    return {
      accessToken: tokens.accessToken,
      refreshToken: tokens.refreshToken,
      expiresIn: tokens.expiresIn,
    };
  }

  static async logout(rawRefreshToken?: string) {
    if (rawRefreshToken) {
      const tokenHash = crypto.createHash('sha256').update(rawRefreshToken).digest('hex');
      await prisma.refreshToken.updateMany({
        where: { tokenHash },
        data: { isRevoked: true },
      });
    }
  }
}

import crypto from 'crypto';
import { prisma } from '../lib/prisma';
import { AppError } from '../middleware/errorHandler';
import { OrganizationRole } from '@prisma/client';

export class OrgService {
  static async getOrganization(organizationId: string) {
    const org = await prisma.organization.findUnique({
      where: { id: organizationId },
      include: {
        _count: {
          select: {
            members: true,
            leads: true,
            documents: true,
            workflows: true,
            deals: true,
          },
        },
      },
    });

    if (!org) {
      throw new AppError('Organization not found.', 404, 'ORG_NOT_FOUND');
    }

    return org;
  }

  static async listMembers(organizationId: string) {
    return prisma.organizationMember.findMany({
      where: { organizationId },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            fullName: true,
            avatarUrl: true,
            lastLoginAt: true,
          },
        },
      },
      orderBy: { joinedAt: 'asc' },
    });
  }

  static async inviteMember(organizationId: string, email: string, role: OrganizationRole) {
    const existingMember = await prisma.organizationMember.findFirst({
      where: {
        organizationId,
        user: { email: email.toLowerCase().trim() },
      },
    });

    if (existingMember) {
      throw new AppError('User is already a member of this organization.', 409, 'ALREADY_MEMBER');
    }

    const token = crypto.randomBytes(32).toString('hex');
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days

    const invitation = await prisma.invitation.create({
      data: {
        organizationId,
        email: email.toLowerCase().trim(),
        role,
        token,
        expiresAt,
      },
    });

    return invitation;
  }

  static async updateMemberRole(organizationId: string, targetUserId: string, newRole: OrganizationRole, requesterId: string) {
    if (targetUserId === requesterId && newRole !== OrganizationRole.OWNER) {
      const ownerCount = await prisma.organizationMember.count({
        where: { organizationId, role: OrganizationRole.OWNER },
      });
      if (ownerCount <= 1) {
        throw new AppError('Cannot demote the sole organization owner.', 400, 'CANNOT_DEMOTE_SOLE_OWNER');
      }
    }

    return prisma.organizationMember.update({
      where: {
        organizationId_userId: {
          organizationId,
          userId: targetUserId,
        },
      },
      data: { role: newRole },
    });
  }

  static async removeMember(organizationId: string, targetUserId: string) {
    const member = await prisma.organizationMember.findUnique({
      where: {
        organizationId_userId: {
          organizationId,
          userId: targetUserId,
        },
      },
    });

    if (!member) {
      throw new AppError('Member not found in this organization.', 404, 'MEMBER_NOT_FOUND');
    }

    if (member.role === OrganizationRole.OWNER) {
      const ownerCount = await prisma.organizationMember.count({
        where: { organizationId, role: OrganizationRole.OWNER },
      });
      if (ownerCount <= 1) {
        throw new AppError('Cannot remove the sole organization owner.', 400, 'CANNOT_REMOVE_SOLE_OWNER');
      }
    }

    return prisma.organizationMember.delete({
      where: {
        organizationId_userId: {
          organizationId,
          userId: targetUserId,
        },
      },
    });
  }
}

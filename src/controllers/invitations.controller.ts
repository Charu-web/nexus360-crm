import { Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import { prisma } from '../lib/db';
import { supabaseAdmin, isSupabaseConfigured } from '../lib/supabase';
import { AppError } from '../middleware/errorHandler';

const inviteSchema = z.object({
  employeeName: z.string().min(2, 'Employee Name is required'),
  email: z.string().email('Invalid email address format'),
  role: z.string().default('STAFF'),
});

async function recordSecurityEvent(
  eventType: string,
  tenantId?: string | null,
  userId?: string | null,
  email?: string | null,
  req?: Request
) {
  try {
    const ipAddress =
      req?.headers['x-forwarded-for']?.toString() ||
      req?.socket?.remoteAddress ||
      '127.0.0.1';
    const userAgent = req?.headers['user-agent'] || 'Unknown';

    await prisma.auditLog.create({
      data: {
        tenantId: tenantId || null,
        userId: userId || null,
        action: eventType,
        entity: 'User',
        entityId: userId || null,
        details: `Security Event: ${eventType} for ${email || 'user'}`,
        ipAddress,
        userAgent,
      },
    });
  } catch (err) {
    console.error('[SecurityEvent Error]', err);
  }
}

export const listInvitations = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    if (!req.user) throw new AppError('Unauthorized', 401);
    const tenantId = req.user.tenantId || req.tenant?.id;
    if (!tenantId && !req.user.isPlatformOwner) {
      throw new AppError('Tenant context missing.', 400);
    }

    const whereTenant = tenantId ? { tenantId } : {};

    const dbUsers = await prisma.user.findMany({
      where: whereTenant,
      include: { role: true },
      orderBy: { createdAt: 'desc' },
    });

    const invitations = await prisma.employeeInvitation.findMany({
      where: whereTenant,
      orderBy: { createdAt: 'desc' },
    });

    const employeesList = dbUsers.map((u, idx) => ({
      id: u.id,
      employeeId: `EMP-${101 + idx}`,
      name: u.fullName || u.email,
      fullName: u.fullName || u.email,
      email: u.email,
      phone: u.phone || 'N/A',
      role: u.role?.name || 'STAFF',
      department: u.department || 'General',
      joiningDate: u.createdAt.toISOString().split('T')[0],
      salary: 75000,
      status: u.isActive ? 'Active' : 'Inactive',
      isInvitation: false,
    }));

    const pendingList = invitations.map((inv) => {
      const isExpired = new Date() > new Date(inv.expiresAt);
      return {
        id: inv.id,
        employeeId: `INV-${inv.id.slice(0, 4).toUpperCase()}`,
        name: inv.employeeName,
        fullName: inv.employeeName,
        email: inv.email,
        phone: 'Pending Invite',
        role: inv.role,
        department: 'Pending Invitation',
        joiningDate: inv.createdAt.toISOString().split('T')[0],
        salary: 0,
        status: isExpired ? 'Expired' : inv.status === 'PENDING' ? 'Pending' : inv.status,
        isInvitation: true,
        expiresAt: inv.expiresAt,
      };
    });

    res.status(200).json({
      success: true,
      employees: employeesList,
      invitations: pendingList,
      totalEmployees: employeesList.length,
      totalPending: pendingList.filter(i => i.status === 'Pending').length,
    });
  } catch (error) {
    next(error);
  }
};

export const inviteEmployee = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    if (!req.user) throw new AppError('Unauthorized', 401);

    const callerRole = (req.user.roleName || '').toUpperCase();
    const canInvite = req.user.isPlatformOwner || ['SUPER_ADMIN', 'PLATFORM_ADMIN', 'TENANT_ADMIN', 'ADMIN', 'MANAGER'].includes(callerRole);
    if (!canInvite) {
      throw new AppError('Access denied. Only administrators or managers can invite employees.', 403);
    }

    const tenantId = req.user.tenantId || req.tenant?.id;
    if (!tenantId) {
      throw new AppError('Tenant context required to send invitation.', 400);
    }

    const data = inviteSchema.parse(req.body);
    const normalizedEmail = data.email.toLowerCase().trim();

    let targetRole = data.role.toUpperCase();
    if (targetRole === 'ADMIN' || targetRole === 'TENANT_ADMIN') {
      if (!req.user.isPlatformOwner && !['SUPER_ADMIN', 'PLATFORM_ADMIN', 'TENANT_ADMIN', 'ADMIN'].includes(callerRole)) {
        throw new AppError('You do not have permission to invite Admin users.', 403);
      }
      targetRole = 'TENANT_ADMIN';
    } else if (targetRole === 'MANAGER') {
      targetRole = 'MANAGER';
    } else {
      targetRole = 'STAFF';
    }

    const existingUser = await prisma.user.findFirst({
      where: { email: normalizedEmail },
    });
    if (existingUser) {
      throw new AppError(`An account with email '${normalizedEmail}' is already registered as an active member.`, 400);
    }

    const existingInvite = await prisma.employeeInvitation.findFirst({
      where: {
        tenantId,
        email: normalizedEmail,
        status: 'PENDING',
      },
    });
    if (existingInvite) {
      throw new AppError(`A pending invitation has already been sent to '${normalizedEmail}'.`, 400);
    }

    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
    const invitation = await prisma.employeeInvitation.create({
      data: {
        tenantId,
        email: normalizedEmail,
        employeeName: data.employeeName.trim(),
        role: targetRole,
        invitedBy: req.user.id,
        status: 'PENDING',
        expiresAt,
      },
    });

    let emailSent = false;
    if (isSupabaseConfigured()) {
      try {
        const appUrl = process.env.APP_URL || (req.headers.origin ? req.headers.origin : 'https://bussniescrm.empireitxpert.in');
        const { error: inviteErr } = await supabaseAdmin.auth.admin.inviteUserByEmail(normalizedEmail, {
          redirectTo: `${appUrl}/login`,
          data: {
            full_name: data.employeeName.trim(),
            tenant_id: tenantId,
            role_name: targetRole,
            invitation_id: invitation.id,
          },
        });
        if (!inviteErr) {
          emailSent = true;
        } else {
          console.warn('[InviteEmployee] Supabase Auth invite warning:', inviteErr.message);
        }
      } catch (err: any) {
        console.warn('[InviteEmployee] Supabase Auth invite exception:', err.message || err);
      }
    }

    await recordSecurityEvent('EMPLOYEE_INVITED', tenantId, req.user.id, normalizedEmail, req);

    res.status(201).json({
      success: true,
      message: 'Invitation sent successfully.',
      emailSent,
      invitation: {
        id: invitation.id,
        employeeName: invitation.employeeName,
        email: invitation.email,
        role: invitation.role,
        status: invitation.status,
        expiresAt: invitation.expiresAt,
      },
    });
  } catch (error) {
    next(error);
  }
};

export const resendInvitation = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    if (!req.user) throw new AppError('Unauthorized', 401);
    const tenantId = req.user.tenantId || req.tenant?.id;
    const rawId = req.params.id;
    const targetId = Array.isArray(rawId) ? rawId[0] : rawId;

    const invitation = await prisma.employeeInvitation.findFirst({
      where: { id: targetId, ...(tenantId ? { tenantId } : {}) },
    });

    if (!invitation) {
      throw new AppError('Invitation record not found.', 404);
    }

    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
    const updated = await prisma.employeeInvitation.update({
      where: { id: invitation.id },
      data: {
        status: 'PENDING',
        expiresAt,
      },
    });

    if (isSupabaseConfigured()) {
      try {
        const appUrl = process.env.APP_URL || (req.headers.origin ? req.headers.origin : 'https://bussniescrm.empireitxpert.in');
        await supabaseAdmin.auth.admin.inviteUserByEmail(invitation.email, {
          redirectTo: `${appUrl}/login`,
          data: {
            full_name: invitation.employeeName,
            tenant_id: invitation.tenantId,
            role_name: invitation.role,
            invitation_id: invitation.id,
          },
        });
      } catch (err) {
        console.warn('[ResendInvite] Supabase warning:', err);
      }
    }

    await recordSecurityEvent('EMPLOYEE_INVITATION_RESENT', invitation.tenantId, req.user.id, invitation.email, req);

    res.status(200).json({
      success: true,
      message: 'Invitation resent successfully.',
      invitation: updated,
    });
  } catch (error) {
    next(error);
  }
};

export const removeEmployeeOrInvitation = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    if (!req.user) throw new AppError('Unauthorized', 401);
    const tenantId = req.user.tenantId || req.tenant?.id;
    const rawId = req.params.id;
    const targetId = Array.isArray(rawId) ? rawId[0] : rawId;

    const invitation = await prisma.employeeInvitation.findFirst({
      where: { id: targetId, ...(tenantId ? { tenantId } : {}) },
    });

    if (invitation) {
      await prisma.employeeInvitation.delete({ where: { id: invitation.id } });
      res.status(200).json({ success: true, message: 'Invitation removed successfully.' });
      return;
    }

    const dbUser = await prisma.user.findFirst({
      where: { id: targetId, ...(tenantId ? { tenantId } : {}) },
    });

    if (dbUser) {
      await prisma.user.update({
        where: { id: dbUser.id },
        data: { isActive: false },
      });
      res.status(200).json({ success: true, message: 'Employee removed from workspace.' });
      return;
    }

    throw new AppError('Record not found or access denied.', 404);
  } catch (error) {
    next(error);
  }
};

const acceptInviteSchema = z.object({
  invitationId: z.string().min(1, 'Invitation ID or Token is required'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  fullName: z.string().optional(),
});

export const acceptInvitation = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const data = acceptInviteSchema.parse(req.body);
    const targetId = data.invitationId.trim();

    const invitation = await prisma.employeeInvitation.findFirst({
      where: {
        OR: [
          { id: targetId },
          { email: targetId.toLowerCase() },
        ],
      },
      include: { tenant: true },
    });

    if (!invitation) {
      throw new AppError('Invalid or expired employee invitation link.', 404);
    }

    if (invitation.status === 'ACCEPTED') {
      throw new AppError('This employee invitation has already been accepted. Please sign in.', 400);
    }

    if (new Date() > new Date(invitation.expiresAt)) {
      await prisma.employeeInvitation.update({
        where: { id: invitation.id },
        data: { status: 'EXPIRED' },
      });
      throw new AppError('This employee invitation link has expired. Please ask your administrator to resend the invitation.', 400);
    }

    const normalizedEmail = invitation.email.toLowerCase().trim();

    // Check if user already registered
    const existingUser = await prisma.user.findFirst({
      where: { email: normalizedEmail },
    });
    if (existingUser) {
      throw new AppError('An account with this email address already exists. Please sign in.', 409);
    }

    // 1. Create Supabase Auth user
    let supabaseUserId: string | null = null;
    if (isSupabaseConfigured()) {
      try {
        const { data: adminAuthData, error: adminErr } = await supabaseAdmin.auth.admin.createUser({
          email: normalizedEmail,
          password: data.password,
          email_confirm: true,
          user_metadata: {
            full_name: data.fullName || invitation.employeeName,
            tenant_id: invitation.tenantId,
            role_name: invitation.role,
          },
        });
        if (!adminErr && adminAuthData.user) {
          supabaseUserId = adminAuthData.user.id;
        }
      } catch (err: any) {
        console.warn('[AcceptInvite] Supabase Auth createUser warning:', err.message || err);
      }
    }

    // 2. Find or create role for employee in EXISTING tenant
    let role = await prisma.role.findFirst({
      where: {
        tenantId: invitation.tenantId,
        name: invitation.role,
      },
    });

    if (!role) {
      role = await prisma.role.create({
        data: {
          tenantId: invitation.tenantId,
          name: invitation.role,
          description: invitation.role === 'MANAGER' ? 'Manager Role' : 'Staff Role',
          permissions: JSON.stringify(
            invitation.role === 'MANAGER'
              ? ['LEADS_VIEW', 'LEADS_CREATE', 'LEADS_EDIT', 'DEALS_VIEW', 'DEALS_CREATE']
              : ['LEADS_VIEW', 'LEADS_CREATE']
          ),
        },
      });
    }

    const bcrypt = require('bcryptjs');
    const hashedPassword = await bcrypt.hash(data.password, 10);

    // 3. Create User Profile linked to EXISTING tenant_id
    const user = await prisma.user.create({
      data: {
        ...(supabaseUserId ? { id: supabaseUserId } : {}),
        tenantId: invitation.tenantId, // LINKED TO EXISTING TENANT!
        email: normalizedEmail,
        password: hashedPassword,
        fullName: data.fullName?.trim() || invitation.employeeName,
        roleId: role.id,
        department: 'Operations',
        designation: invitation.role === 'MANAGER' ? 'Manager' : 'Employee',
        isActive: true,
      },
      include: { role: true, tenant: true },
    });

    // 4. Mark invitation ACCEPTED
    await prisma.employeeInvitation.update({
      where: { id: invitation.id },
      data: { status: 'ACCEPTED' },
    });

    // 5. Update Usage count
    await prisma.usage.updateMany({
      where: { tenantId: invitation.tenantId },
      data: { userCount: { increment: 1 } },
    });

    const jwt = require('jsonwebtoken');
    const crypto = require('crypto');
    const { config } = require('../config');

    const accessToken = jwt.sign(
      { userId: user.id, email: user.email, role: user.role.name, tenantId: user.tenantId },
      config.jwtSecret,
      { expiresIn: config.jwtExpiresIn as any }
    );

    const refreshTokenRaw = crypto.randomBytes(40).toString('hex');
    const refreshTokenHash = crypto.createHash('sha256').update(refreshTokenRaw).digest('hex');
    await prisma.refreshToken.create({
      data: {
        userId: user.id,
        tokenHash: refreshTokenHash,
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      },
    });

    await recordSecurityEvent('EMPLOYEE_INVITATION_ACCEPTED', invitation.tenantId, user.id, user.email, req);

    res.status(200).json({
      success: true,
      message: 'Invitation accepted successfully! Welcome to your workspace.',
      accessToken,
      refreshToken: refreshTokenRaw,
      user: {
        id: user.id,
        fullName: user.fullName,
        email: user.email,
        role: user.role.name,
        tenantId: user.tenantId,
        tenantName: user.tenant ? user.tenant.name : 'Empire CRM Workspace',
      },
    });
  } catch (error) {
    next(error);
  }
};

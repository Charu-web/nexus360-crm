import { Request, Response, NextFunction } from 'express';
import { OrgService } from '../services/org.service';
import { logAuditEvent } from '../middleware/auditLogger';
import { AuditAction, OrganizationRole } from '@prisma/client';

export const getOrgDetails = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const org = await OrgService.getOrganization(req.organizationId!);
    res.status(200).json({ success: true, data: org });
  } catch (error) {
    next(error);
  }
};

export const listMembers = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const members = await OrgService.listMembers(req.organizationId!);
    res.status(200).json({ success: true, data: members });
  } catch (error) {
    next(error);
  }
};

export const inviteMember = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { email, role } = req.body;
    const invitation = await OrgService.inviteMember(req.organizationId!, email, role || OrganizationRole.EMPLOYEE);

    await logAuditEvent({
      organizationId: req.organizationId!,
      userId: req.user!.id,
      action: AuditAction.CREATE,
      resource: 'OrganizationInvitation',
      resourceId: invitation.id,
      details: `Invited ${email} with role ${role || 'EMPLOYEE'}`,
      req,
    });

    res.status(201).json({
      success: true,
      message: `Invitation sent to ${email}.`,
      data: invitation,
    });
  } catch (error) {
    next(error);
  }
};

export const updateMemberRole = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const userId = req.params.userId as string;
    const { role } = req.body;
    const updated = await OrgService.updateMemberRole(req.organizationId!, userId, role, req.user!.id);

    await logAuditEvent({
      organizationId: req.organizationId!,
      userId: req.user!.id,
      action: AuditAction.PERMISSION_CHANGE,
      resource: 'OrganizationMember',
      resourceId: userId,
      details: `Updated role of user ${userId} to ${role}`,
      req,
    });

    res.status(200).json({
      success: true,
      message: 'Member role updated successfully.',
      data: updated,
    });
  } catch (error) {
    next(error);
  }
};

export const removeMember = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const userId = req.params.userId as string;
    await OrgService.removeMember(req.organizationId!, userId);

    await logAuditEvent({
      organizationId: req.organizationId!,
      userId: req.user!.id,
      action: AuditAction.DELETE,
      resource: 'OrganizationMember',
      resourceId: userId,
      details: `Removed member ${userId} from organization`,
      req,
    });

    res.status(200).json({
      success: true,
      message: 'Member removed from organization.',
    });
  } catch (error) {
    next(error);
  }
};

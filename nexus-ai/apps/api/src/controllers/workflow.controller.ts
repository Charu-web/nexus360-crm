import { Request, Response, NextFunction } from 'express';
import { WorkflowService } from '../services/workflow.service';
import { createWorkflowSchema, updateWorkflowSchema } from '@nexus-ai/validation';
import { logAuditEvent } from '../middleware/auditLogger';
import { AuditAction } from '@prisma/client';

export const listWorkflows = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const workflows = await WorkflowService.listWorkflows(req.organizationId!);
    res.status(200).json({ success: true, data: workflows });
  } catch (error) {
    next(error);
  }
};

export const getWorkflow = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const workflow = await WorkflowService.getWorkflowById(req.organizationId!, req.params.id as string);
    res.status(200).json({ success: true, data: workflow });
  } catch (error) {
    next(error);
  }
};

export const createWorkflow = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const validated = createWorkflowSchema.parse(req.body);
    const workflow = await WorkflowService.createWorkflow(req.organizationId!, validated);

    await logAuditEvent({
      organizationId: req.organizationId!,
      userId: req.user!.id,
      action: AuditAction.CREATE,
      resource: 'Workflow',
      resourceId: workflow.id,
      details: `Created automation workflow '${workflow.name}'`,
      req,
    });

    res.status(201).json({ success: true, message: 'Workflow created successfully.', data: workflow });
  } catch (error) {
    next(error);
  }
};

export const updateWorkflow = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const validated = updateWorkflowSchema.parse(req.body);
    const workflow = await WorkflowService.updateWorkflow(req.organizationId!, req.params.id as string, validated);

    await logAuditEvent({
      organizationId: req.organizationId!,
      userId: req.user!.id,
      action: AuditAction.UPDATE,
      resource: 'Workflow',
      resourceId: workflow.id,
      details: `Updated automation workflow '${workflow.name}'`,
      req,
    });

    res.status(200).json({ success: true, message: 'Workflow updated.', data: workflow });
  } catch (error) {
    next(error);
  }
};

export const deleteWorkflow = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const workflowId = req.params.id as string;
    await WorkflowService.deleteWorkflow(req.organizationId!, workflowId);

    await logAuditEvent({
      organizationId: req.organizationId!,
      userId: req.user!.id,
      action: AuditAction.DELETE,
      resource: 'Workflow',
      resourceId: workflowId,
      details: `Deleted workflow ${workflowId}`,
      req,
    });

    res.status(200).json({ success: true, message: 'Workflow deleted.' });
  } catch (error) {
    next(error);
  }
};

export const executeWorkflowManual = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const workflow = await WorkflowService.getWorkflowById(req.organizationId!, req.params.id as string);
    const execution = await WorkflowService.executeWorkflow(workflow, req.body.triggerData || {});

    await logAuditEvent({
      organizationId: req.organizationId!,
      userId: req.user!.id,
      action: AuditAction.WORKFLOW_TRIGGERED,
      resource: 'WorkflowExecution',
      resourceId: execution.id,
      details: `Manual trigger of workflow '${workflow.name}'`,
      req,
    });

    res.status(200).json({ success: true, message: 'Workflow executed.', data: execution });
  } catch (error) {
    next(error);
  }
};

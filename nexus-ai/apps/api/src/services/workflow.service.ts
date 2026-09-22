import { prisma } from '../lib/prisma';
import { AppError } from '../middleware/errorHandler';
import { WorkflowTriggerType, WorkflowExecutionStatus, TaskPriority, TaskStatus } from '@prisma/client';
import { AIService } from './ai.service';
import { logger } from '../lib/logger';

export class WorkflowService {
  static async listWorkflows(organizationId: string) {
    return prisma.workflow.findMany({
      where: { organizationId },
      include: {
        _count: { select: { executions: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  static async getWorkflowById(organizationId: string, workflowId: string) {
    const workflow = await prisma.workflow.findFirst({
      where: { id: workflowId, organizationId },
      include: {
        executions: { take: 20, orderBy: { startedAt: 'desc' } },
      },
    });

    if (!workflow) {
      throw new AppError('Workflow not found.', 404, 'WORKFLOW_NOT_FOUND');
    }

    return workflow;
  }

  static async createWorkflow(
    organizationId: string,
    data: {
      name: string;
      description?: string;
      triggerType: WorkflowTriggerType;
      nodes: any[];
      isActive?: boolean;
    }
  ) {
    return prisma.workflow.create({
      data: {
        organizationId,
        name: data.name,
        description: data.description || null,
        triggerType: data.triggerType,
        nodes: data.nodes,
        isActive: data.isActive !== undefined ? data.isActive : true,
      },
    });
  }

  static async updateWorkflow(organizationId: string, workflowId: string, data: any) {
    await this.getWorkflowById(organizationId, workflowId);
    return prisma.workflow.update({
      where: { id: workflowId },
      data,
    });
  }

  static async deleteWorkflow(organizationId: string, workflowId: string) {
    await this.getWorkflowById(organizationId, workflowId);
    return prisma.workflow.delete({ where: { id: workflowId } });
  }

  // --------------------------------------------------------------------------
  // WORKFLOW RUNNER / EXECUTION ENGINE
  // --------------------------------------------------------------------------
  static async triggerWorkflows(
    organizationId: string,
    triggerType: WorkflowTriggerType,
    triggerData: Record<string, any>
  ) {
    const activeWorkflows = await prisma.workflow.findMany({
      where: { organizationId, triggerType, isActive: true },
    });

    const executionResults = [];
    for (const workflow of activeWorkflows) {
      const exec = await this.executeWorkflow(workflow, triggerData);
      executionResults.push(exec);
    }

    return executionResults;
  }

  static async executeWorkflow(workflow: any, triggerData: any) {
    const logs: any[] = [];
    logs.push({ timestamp: new Date().toISOString(), step: 'TRIGGER', level: 'INFO', message: `Workflow triggered for event: ${workflow.triggerType}` });

    const execution = await prisma.workflowExecution.create({
      data: {
        workflowId: workflow.id,
        organizationId: workflow.organizationId,
        status: WorkflowExecutionStatus.RUNNING,
        triggerEvent: workflow.triggerType,
        triggerData,
        logs: [],
      },
    });

    try {
      const nodes = Array.isArray(workflow.nodes) ? workflow.nodes : [];
      let context = { ...triggerData };

      for (const node of nodes) {
        if (node.type === 'TRIGGER') continue;

        logs.push({ timestamp: new Date().toISOString(), step: node.label || node.id, level: 'INFO', message: `Executing node: ${node.label}` });

        if (node.type === 'CONDITION') {
          const { field, operator, value } = node.config || {};
          const actualVal = context[field];
          let pass = false;

          if (operator === 'GREATER_THAN') pass = Number(actualVal) > Number(value);
          else if (operator === 'LESS_THAN') pass = Number(actualVal) < Number(value);
          else if (operator === 'EQUALS') pass = String(actualVal) === String(value);
          else pass = true;

          logs.push({ timestamp: new Date().toISOString(), step: node.label, level: 'INFO', message: `Condition check (${field} ${operator} ${value}): Passed = ${pass}` });
          if (!pass) {
            logs.push({ timestamp: new Date().toISOString(), step: node.label, level: 'WARN', message: 'Condition not met. Stopping further workflow path.' });
            break;
          }
        } else if (node.type === 'ACTION') {
          // 1. AI Score Action
          if (node.label.toLowerCase().includes('score') && context.leadId) {
            const scoreResult = await AIService.scoreLead(workflow.organizationId, context.leadId);
            context.aiScore = scoreResult.score;
            logs.push({ timestamp: new Date().toISOString(), step: node.label, level: 'INFO', message: `AI scored lead: ${scoreResult.score}/100.` });
          }

          // 2. Create Task Action
          if (node.label.toLowerCase().includes('task') && context.leadId) {
            await prisma.task.create({
              data: {
                organizationId: workflow.organizationId,
                title: `Automated Workflow Task for ${context.name || 'Lead'}`,
                description: `Created automatically by workflow '${workflow.name}'.`,
                priority: TaskPriority.HIGH,
                status: TaskStatus.TODO,
                leadId: context.leadId,
                dueDate: new Date(Date.now() + 24 * 60 * 60 * 1000),
              },
            });
            logs.push({ timestamp: new Date().toISOString(), step: node.label, level: 'INFO', message: `Created follow-up task for lead.` });
          }

          // 3. Notification Action
          if (node.label.toLowerCase().includes('notify')) {
            await prisma.notification.create({
              data: {
                organizationId: workflow.organizationId,
                type: 'WORKFLOW_DONE',
                title: `Workflow Alert: ${workflow.name}`,
                message: `Automated action completed for ${context.name || 'entity'}.`,
              },
            });
            logs.push({ timestamp: new Date().toISOString(), step: node.label, level: 'INFO', message: `Notification dispatched.` });
          }
        }
      }

      const completed = await prisma.workflowExecution.update({
        where: { id: execution.id },
        data: {
          status: WorkflowExecutionStatus.COMPLETED,
          completedAt: new Date(),
          logs,
        },
      });

      await prisma.workflow.update({
        where: { id: workflow.id },
        data: {
          executionCount: { increment: 1 },
          lastExecutedAt: new Date(),
        },
      });

      return completed;
    } catch (err: any) {
      logs.push({ timestamp: new Date().toISOString(), step: 'ERROR', level: 'ERROR', message: `Execution failed: ${err.message}` });
      return prisma.workflowExecution.update({
        where: { id: execution.id },
        data: {
          status: WorkflowExecutionStatus.FAILED,
          completedAt: new Date(),
          error: err.message,
          logs,
        },
      });
    }
  }
}

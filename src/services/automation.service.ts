// src/services/automation.service.ts
import { PrismaClient } from '@prisma/client';
import { AIService } from './ai.service';

const prisma = new PrismaClient();

export interface AutomationExecutionResult {
  ruleId: string;
  name: string;
  trigger: string;
  status: 'SUCCESS' | 'FAILED' | 'SKIPPED';
  actionsExecuted: any[];
  error?: string;
}

export class AutomationEngine {
  /**
   * Helper: Evaluates a single condition or nested condition group against payload.
   */
  public static evaluateCondition(cond: any, payload: Record<string, any>): boolean {
    if (!cond) return true;

    // Handle { AND: [...] }
    if (cond.AND && Array.isArray(cond.AND)) {
      return cond.AND.every((c: any) => this.evaluateCondition(c, payload));
    }

    // Handle { OR: [...] }
    if (cond.OR && Array.isArray(cond.OR)) {
      return cond.OR.some((c: any) => this.evaluateCondition(c, payload));
    }

    if (cond.conditions && Array.isArray(cond.conditions)) {
      const groupLogic = (cond.logic || 'AND').toUpperCase();
      if (groupLogic === 'OR') {
        return cond.conditions.some((c: any) => this.evaluateCondition(c, payload));
      } else {
        return cond.conditions.every((c: any) => this.evaluateCondition(c, payload));
      }
    }

    const fieldVal = payload[cond.field];
    const targetVal = cond.value;
    const op = (cond.operator || 'equals').toLowerCase();

    if (op === 'equals' || op === '==' || op === '=') {
      return String(fieldVal || '').toLowerCase() === String(targetVal || '').toLowerCase();
    } else if (op === '!=' || op === 'not_equals') {
      return String(fieldVal || '').toLowerCase() !== String(targetVal || '').toLowerCase();
    } else if (op === 'greater_than' || op === '>' || op === 'gt') {
      return Number(fieldVal) > Number(targetVal);
    } else if (op === 'greater_than_or_equal' || op === '>=' || op === 'gte') {
      return Number(fieldVal) >= Number(targetVal);
    } else if (op === 'less_than' || op === '<' || op === 'lt') {
      return Number(fieldVal) < Number(targetVal);
    } else if (op === 'less_than_or_equal' || op === '<=' || op === 'lte') {
      return Number(fieldVal) <= Number(targetVal);
    } else if (op === 'contains') {
      return String(fieldVal || '').toLowerCase().includes(String(targetVal || '').toLowerCase());
    } else if (op === 'is_empty') {
      return !fieldVal || String(fieldVal).trim() === '';
    } else if (op === 'is_not_empty') {
      return Boolean(fieldVal && String(fieldVal).trim() !== '');
    }

    return true;
  }

  /**
   * Evaluates all active workflow rules for the given tenant and trigger event.
   * Supports complex AND / OR condition groups and sequential multi-action execution.
   */
  public static async processEvent(
    tenantId: string,
    triggerEvent: string,
    payload: Record<string, any>
  ): Promise<AutomationExecutionResult[]> {
    const rules = await prisma.automationRule.findMany({
      where: {
        tenantId,
        isActive: true
      }
    });

    const normalizedTrigger = triggerEvent.toLowerCase().replace(/[_\s]+/g, '.');
    const matchingRules = rules.filter(r => {
      const rNorm = (r.triggerEvent || '').toLowerCase().replace(/[_\s]+/g, '.');
      return (
        rNorm === normalizedTrigger ||
        r.triggerEvent.toLowerCase() === triggerEvent.toLowerCase() ||
        r.triggerEvent === triggerEvent
      );
    });

    const results: AutomationExecutionResult[] = [];

    for (const rule of matchingRules) {
      const startTime = new Date();
      try {
        // Parse conditions (supports flat array, nested logic, or { logic, conditions } group)
        let parsedConditions: any = [];
        try {
          parsedConditions = typeof rule.conditions === 'string' ? JSON.parse(rule.conditions || '[]') : (rule.conditions || []);
        } catch (e) {
          parsedConditions = [];
        }

        let conditionsMet = true;
        if (parsedConditions && typeof parsedConditions === 'object' && !Array.isArray(parsedConditions)) {
          conditionsMet = this.evaluateCondition(parsedConditions, payload);
        } else if (Array.isArray(parsedConditions) && parsedConditions.length > 0) {
          // Check if any rule element defines an OR operator
          const isOrRule = parsedConditions.some((c: any) => (c.logic || '').toUpperCase() === 'OR');
          if (isOrRule) {
            conditionsMet = parsedConditions.some((c: any) => this.evaluateCondition(c, payload));
          } else {
            conditionsMet = parsedConditions.every((c: any) => this.evaluateCondition(c, payload));
          }
        }

        if (!conditionsMet) {
          results.push({
            ruleId: rule.id,
            name: rule.name,
            trigger: triggerEvent,
            status: 'SKIPPED',
            actionsExecuted: []
          });
          continue;
        }

        // Parse actions
        let actions: any[] = [];
        try {
          actions = typeof rule.actions === 'string' ? JSON.parse(rule.actions || '[]') : (rule.actions || []);
        } catch (e) {
          actions = [];
        }

        const executedActions: any[] = [];

        for (const act of actions) {
          const res = await this.executeAction(tenantId, act.actionType, act.params || {}, payload);
          executedActions.push(res);
        }

        const completedTime = new Date();

        // Log execution in database with execution history timestamps
        await prisma.automationLog.create({
          data: {
            tenantId,
            ruleId: rule.id,
            triggerEvent,
            entityType: payload.entityType || 'LEAD',
            entityId: payload.id || payload.leadId || payload.dealId || 'N/A',
            actionType: actions.map(a => a.actionType).join(','),
            status: 'SUCCESS',
            details: JSON.stringify({ payload, executedActions, durationMs: completedTime.getTime() - startTime.getTime() }),
            startedAt: startTime,
            completedAt: completedTime
          }
        });

        results.push({
          ruleId: rule.id,
          name: rule.name,
          trigger: triggerEvent,
          status: 'SUCCESS',
          actionsExecuted: executedActions
        });
      } catch (err: any) {
        const completedTime = new Date();
        await prisma.automationLog.create({
          data: {
            tenantId,
            ruleId: rule.id,
            triggerEvent,
            entityType: payload.entityType || 'LEAD',
            entityId: payload.id || payload.leadId || 'N/A',
            actionType: 'ERROR',
            status: 'FAILED',
            details: JSON.stringify({ error: err.message, payload }),
            startedAt: startTime,
            completedAt: completedTime
          }
        });

        results.push({
          ruleId: rule.id,
          name: rule.name,
          trigger: triggerEvent,
          status: 'FAILED',
          actionsExecuted: [],
          error: err.message
        });
      }
    }

    return results;
  }

  private static async executeAction(
    tenantId: string,
    actionType: string,
    params: Record<string, any>,
    payload: Record<string, any>
  ) {
    switch (actionType) {
      case 'assign_sales_executive':
      case 'assign_user':
      case 'round_robin': {
        const leadId = payload.id || payload.leadId;
        let targetUserId = params.userId;

        if (!targetUserId) {
          // Find an active Sales agent or representative
          const salesUser = await prisma.user.findFirst({
            where: {
              tenantId,
              isActive: true,
              OR: [
                { department: 'Sales' },
                { role: { name: { contains: 'Sales' } } },
                { role: { name: { contains: 'Agent' } } }
              ]
            }
          }) || await prisma.user.findFirst({ where: { tenantId, isActive: true } });

          targetUserId = salesUser?.id;
        }

        if (leadId && targetUserId) {
          await prisma.lead.updateMany({
            where: { id: leadId, tenantId },
            data: { assignedToId: targetUserId }
          });
          return { action: actionType, leadId, assignedToId: targetUserId };
        }
        return { action: actionType, skipped: true };
      }

      case 'notify_manager': {
        const leadId = payload.id || payload.leadId;
        const leadName = payload.customerName || payload.name || 'Lead';
        const leadScore = payload.leadScore ?? 'N/A';

        // Find tenant manager or admin
        const managerUser = await prisma.user.findFirst({
          where: {
            tenantId,
            isActive: true,
            OR: [
              { role: { name: { contains: 'Admin' } } },
              { role: { name: { contains: 'Manager' } } }
            ]
          }
        }) || await prisma.user.findFirst({ where: { tenantId, isActive: true } });

        const activity = await prisma.activity.create({
          data: {
            tenantId,
            title: `Manager Alert: High-Value Lead (${leadScore}/100) - ${leadName}`,
            details: `Automated alert: Lead "${leadName}" scored ${leadScore}/100 and triggered priority management notification.`,
            type: 'NOTIFICATION',
            entityType: 'Lead',
            entityId: leadId || null,
            userId: managerUser?.id || null
          }
        });

        if (leadId) {
          await prisma.leadActivity.create({
            data: {
              tenantId,
              leadId,
              type: 'MESSAGE',
              title: 'Manager Alert Dispatched',
              details: `Priority lead notification sent to manager (${managerUser?.fullName || 'Admin'}).`
            }
          }).catch(() => {});
        }

        // Persist in unified Notification model
        await prisma.notification.create({
          data: {
            tenantId,
            userId: managerUser?.id || null,
            type: 'WORKFLOW_EXECUTION',
            title: `High-Priority Lead Alert: ${leadName}`,
            message: `Lead scored ${leadScore}/100 and triggered priority management alert.`,
            entityType: 'Lead',
            entityId: leadId || null,
            link: leadId ? `#/unified-leads?leadId=${leadId}` : '#/unified-leads'
          }
        }).catch(() => {});

        return { action: 'notify_manager', notifiedUserId: managerUser?.id, activityId: activity.id };
      }

      case 'change_status':
      case 'update_status': {
        const leadId = payload.id || payload.leadId;
        const newStatus = params.status;
        if (leadId && newStatus) {
          await prisma.lead.updateMany({
            where: { id: leadId, tenantId },
            data: { status: newStatus }
          });
          return { action: 'change_status', leadId, newStatus };
        }
        return { action: 'change_status', skipped: true };
      }

      case 'add_tag': {
        const leadId = payload.id || payload.leadId;
        const tag = params.tag;
        if (leadId && tag) {
          const lead = await prisma.lead.findUnique({ where: { id: leadId } });
          if (lead) {
            let tagsArr: string[] = [];
            try {
              tagsArr = JSON.parse(lead.tags || '[]');
            } catch (e) {
              tagsArr = (lead.tags || '').split(',').map(s => s.trim()).filter(Boolean);
            }
            if (!tagsArr.includes(tag)) tagsArr.push(tag);
            await prisma.lead.update({
              where: { id: leadId },
              data: { tags: JSON.stringify(tagsArr) }
            });
            return { action: 'add_tag', leadId, tag };
          }
        }
        return { action: 'add_tag', skipped: true };
      }

      case 'create_task':
      case 'reminder': {
        const title = params.title || `Follow up with ${payload.customerName || payload.name || 'Lead'}`;
        const dueDate = new Date(Date.now() + (params.dueInDays || 1) * 24 * 60 * 60 * 1000);
        let assigneeId = params.assignedToId || payload.assignedToId;

        if (!assigneeId) {
          const defaultUser = await prisma.user.findFirst({ where: { tenantId, isActive: true } });
          assigneeId = defaultUser?.id;
        }

        if (assigneeId) {
          const task = await prisma.task.create({
            data: {
              tenantId,
              title,
              description: params.description || `Auto-created by workflow rule for ${payload.customerName || 'client'}`,
              priority: params.priority || 'High',
              status: 'Pending',
              dueDate,
              assignedToId: assigneeId,
              leadId: payload.id || payload.leadId || null
            }
          });
          return { action: 'create_task', taskId: task.id, title };
        }
        return { action: 'create_task', skipped: true };
      }

      case 'send_whatsapp':
      case 'send_email': {
        const commMsg = AIService.generateFollowUp(payload, actionType === 'send_whatsapp' ? 'whatsapp' : 'email');
        await prisma.activity.create({
          data: {
            tenantId,
            title: `Automated ${actionType === 'send_whatsapp' ? 'WhatsApp' : 'Email'} Scheduled`,
            details: commMsg.message,
            type: 'COMMUNICATION',
            entityType: 'Lead',
            entityId: payload.id || payload.leadId
          }
        });
        return { action: actionType, dispatched: true, preview: commMsg.preview };
      }

      case 'generate_ai_followup':
      case 'generate_ai_message': {
        const channel = params.channel || 'whatsapp';
        const msg = AIService.generateFollowUp(payload, channel);
        const leadId = payload.id || payload.leadId;

        if (leadId) {
          await prisma.activity.create({
            data: {
              tenantId,
              title: `AI Follow-up Draft Generated (${channel.toUpperCase()})`,
              details: msg.message,
              type: 'AI_DRAFT',
              entityType: 'Lead',
              entityId: leadId
            }
          }).catch(() => {});
        }

        return {
          action: 'generate_ai_followup',
          channel,
          message: msg.message,
          preview: msg.preview,
          readyForSendConfirmation: true
        };
      }

      case 'create_followup': {
        const leadId = payload.id || payload.leadId;
        const scheduledAt = new Date(Date.now() + (params.dueInDays || 1) * 24 * 60 * 60 * 1000);
        const followUp = await prisma.followUp.create({
          data: {
            tenantId,
            leadId: leadId,
            title: params.title || `Automated follow-up for ${payload.customerName || 'Lead'}`,
            notes: params.notes || `Automated follow-up scheduled for ${payload.customerName || 'Lead'}`,
            scheduledAt,
            status: 'Pending'
          }
        });
        return { action: 'create_followup', followUpId: followUp.id, scheduledAt };
      }

      case 'create_notification':
      case 'send_notification': {
        const notif = await prisma.notification.create({
          data: {
            tenantId,
            userId: params.userId || payload.assignedToId || null,
            type: params.type || 'WORKFLOW_EXECUTION',
            title: params.title || 'Workflow Notification',
            message: params.message || `Automated notification triggered for ${payload.customerName || 'entity'}`,
            entityType: payload.entityType || 'Lead',
            entityId: payload.id || payload.leadId || null,
            link: params.link || null
          }
        });
        return { action: 'create_notification', notificationId: notif.id };
      }

      case 'trigger_webhook': {
        return {
          action: 'trigger_webhook',
          url: params.url || 'configured_webhook',
          dispatched: true
        };
      }

      default:
        return { action: actionType, executed: true };
    }
  }
}

export const AutomationService = AutomationEngine;


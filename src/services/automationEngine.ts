import { prisma } from '../lib/db';

export async function triggerAutomationEvents(
  tenantId: string,
  event: string,
  eventData: any
): Promise<void> {
  try {
    const rules = await prisma.automationRule.findMany({
      where: { tenantId, triggerEvent: event, isActive: true },
    });

    for (const rule of rules) {
      let conditions: any[] = [];
      let actions: any[] = [];
      try {
        conditions = JSON.parse(rule.conditions);
      } catch {}
      try {
        actions = JSON.parse(rule.actions);
      } catch {}

      // Execute actions
      for (const action of actions) {
        if (action.actionType === 'create_followup' && eventData.id) {
          await prisma.followUp.create({
            data: {
              tenantId,
              leadId: eventData.id,
              title: action.params?.title || 'Automated Lead Follow-up',
              scheduledAt: new Date(Date.now() + (action.params?.delayHours || 24) * 60 * 60 * 1000),
              status: 'Pending',
              notes: 'Triggered by Automation Rule: ' + rule.name,
            },
          });
        }

        if (action.actionType === 'create_task' && eventData.id && eventData.assignedToId) {
          await prisma.task.create({
            data: {
              tenantId,
              title: action.params?.title || 'Contact New Lead',
              description: 'Automated task generated upon lead creation.',
              priority: action.params?.priority || 'High',
              dueDate: new Date(Date.now() + 12 * 60 * 60 * 1000),
              assignedToId: eventData.assignedToId,
              leadId: eventData.id,
            },
          });
        }

        // Log Automation Execution to Audit Log
        await prisma.auditLog.create({
          data: {
            tenantId,
            action: 'AUTOMATION_EXECUTION',
            entity: 'AutomationRule',
            entityId: rule.id,
            details: `Automation '${rule.name}' executed action '${action.actionType}' for event '${event}'.`,
          },
        });
      }
    }
  } catch (err) {
    console.error('[AutomationEngine Error]', err);
  }
}

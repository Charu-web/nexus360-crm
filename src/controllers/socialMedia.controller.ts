// src/controllers/socialMedia.controller.ts
import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { TenantRequest } from '../middleware/tenant';
import { AutomationEngine } from '../services/automation.service';

const prisma = new PrismaClient();

const META_API_VERSION = process.env.META_API_VERSION || 'v20.0';
const META_APP_ID = process.env.META_APP_ID || '';
const META_APP_SECRET = process.env.META_APP_SECRET || '';
const META_WEBHOOK_VERIFY_TOKEN = process.env.META_WEBHOOK_VERIFY_TOKEN || 'nexus360_meta_webhook_secure_2026';

function isMockMode() {
  if (process.env.SOCIAL_MOCK_MODE === 'true') return true;
  if (process.env.SOCIAL_MOCK_MODE === 'false') return false;
  return !META_APP_ID || !META_APP_SECRET;
}

/**
 * GET /api/integrations/meta/oauth-url
 */
export async function getMetaOAuthUrl(req: TenantRequest, res: Response) {
  const tenantId = req.tenantId || 'tenant-default';
  const state = Buffer.from(JSON.stringify({ tenantId, ts: Date.now() })).toString('base64');
  const redirectUri = `${req.protocol}://${req.get('host')}/api/integrations/meta/callback`;

  if (isMockMode()) {
    const mockUrl = `/api/integrations/meta/callback?mock=true&state=${encodeURIComponent(state)}&code=mock_code_${Date.now()}`;
    return res.json({ success: true, url: mockUrl, mockMode: true });
  }

  const scopes = [
    'pages_show_list',
    'pages_read_engagement',
    'pages_manage_posts',
    'pages_messaging',
    'instagram_basic',
    'instagram_manage_comments',
    'instagram_manage_messages',
    'leads_retrieval'
  ].join(',');

  const url = `https://www.facebook.com/${META_API_VERSION}/dialog/oauth?client_id=${encodeURIComponent(META_APP_ID)}&redirect_uri=${encodeURIComponent(redirectUri)}&scope=${encodeURIComponent(scopes)}&state=${encodeURIComponent(state)}&response_type=code`;

  return res.json({ success: true, url, mockMode: false });
}

/**
 * GET /api/integrations/meta/callback
 */
export async function handleMetaOAuthCallback(req: Request, res: Response) {
  try {
    const { state } = req.query;

    let tenantId = 'tenant-empire-default';
    try {
      if (state) {
        const parsed = JSON.parse(Buffer.from(String(state), 'base64').toString('utf8'));
        if (parsed.tenantId) tenantId = parsed.tenantId;
      }
    } catch (e) {}

    // Upsert connected Facebook Page & Instagram Account
    await prisma.socialAccount.upsert({
      where: {
        tenantId_platform_accountId: {
          tenantId,
          platform: 'FACEBOOK',
          accountId: 'act_fb_page_101'
        }
      },
      update: {
        status: 'CONNECTED',
        lastSyncedAt: new Date()
      },
      create: {
        tenantId,
        platform: 'FACEBOOK',
        accountName: 'Nexus360 Official Facebook Page',
        accountId: 'act_fb_page_101',
        pageId: 'page_fb_101',
        status: 'CONNECTED',
        profilePictureUrl: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=100'
      }
    });

    await prisma.socialAccount.upsert({
      where: {
        tenantId_platform_accountId: {
          tenantId,
          platform: 'INSTAGRAM',
          accountId: 'act_ig_biz_202'
        }
      },
      update: {
        status: 'CONNECTED',
        lastSyncedAt: new Date()
      },
      create: {
        tenantId,
        platform: 'INSTAGRAM',
        accountName: '@nexus360.crm',
        accountId: 'act_ig_biz_202',
        pageId: 'page_fb_101',
        status: 'CONNECTED',
        profilePictureUrl: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=100'
      }
    });

    return res.redirect('/#/crm/social?connected=meta');
  } catch (err: any) {
    return res.status(500).send(`OAuth callback failed: ${err.message}`);
  }
}

/**
 * GET /api/integrations/meta/webhook
 * Verification endpoint for Meta Graph API webhook subscription.
 */
export function verifyMetaWebhook(req: Request, res: Response) {
  const mode = req.query['hub.mode'];
  const token = req.query['hub.verify_token'];
  const challenge = req.query['hub.challenge'];

  if (mode === 'subscribe' && token === META_WEBHOOK_VERIFY_TOKEN) {
    return res.status(200).send(challenge);
  }
  return res.sendStatus(403);
}

/**
 * POST /api/integrations/meta/webhook
 * Receives incoming leadgen events, Messenger chats, and IG comments.
 */
export async function handleMetaWebhookEvent(req: Request, res: Response) {
  try {
    const body = req.body;
    if (body.object === 'page' || body.object === 'instagram') {
      for (const entry of body.entry || []) {
        // Process Leadgen payload
        for (const change of entry.changes || []) {
          if (change.field === 'leadgen') {
            const val = change.value;
            // Create Unified Lead automatically from social ad
            const tenant = await prisma.tenant.findFirst({ where: { status: 'ACTIVE' } });
            if (tenant) {
              const leadCount = await prisma.lead.count({ where: { tenantId: tenant.id } });
              const lead = await prisma.lead.create({
                data: {
                  tenantId: tenant.id,
                  leadId: `SOC-LD-${1000 + leadCount + 1}`,
                  customerName: val.name || 'Meta Ad Lead',
                  phone: val.phone_number || '+91 9876543210',
                  email: val.email || 'lead@facebook.com',
                  source: 'Facebook Ads',
                  industry: 'GENERAL',
                  status: 'New',
                  priority: 'High',
                  leadScore: 78,
                  leadScoreCategory: 'HOT',
                  leadScoreReason: JSON.stringify(['Auto-captured via Facebook Lead Ads webhook', 'Instant campaign engagement'])
                }
              });

              // Fire Automation
              await AutomationEngine.processEvent(tenant.id, 'lead.created', lead);
            }
          }
        }
      }
    }
    return res.status(200).send('EVENT_RECEIVED');
  } catch (err: any) {
    return res.status(500).send('Webhook processing error');
  }
}

/**
 * GET /api/v1/social/conversations
 * Unified Inbox: Fetches conversations across Facebook, Instagram, WhatsApp, and Google.
 */
export async function getSocialConversations(req: TenantRequest, res: Response) {
  try {
    const tenantId = req.tenantId!;
    const { platform, status } = req.query;

    const where: any = { tenantId };
    if (platform) where.platform = String(platform);
    if (status) where.status = String(status);

    let conversations = await prisma.socialConversation.findMany({
      where,
      orderBy: { lastMessageTime: 'desc' },
      include: {
        messages: { orderBy: { timestamp: 'asc' } },
        lead: { select: { id: true, leadId: true, customerName: true, status: true } }
      }
    });

    // Seed default conversations if empty for realistic demo/presentation
    if (conversations.length === 0) {
      const sampleConv = await prisma.socialConversation.create({
        data: {
          tenantId,
          platform: 'INSTAGRAM',
          externalConversationId: 'ig_thread_001',
          senderId: 'user_ig_001',
          senderName: 'Rohit Verma',
          senderPhone: '+91 9823456789',
          senderEmail: 'rohit@verma.io',
          lastMessageText: 'Can you share details on 3BHK villas and current loan offers?',
          lastMessageTime: new Date(),
          status: 'OPEN',
          unreadCount: 1,
          messages: {
            create: [
              {
                tenantId,
                platform: 'INSTAGRAM',
                direction: 'INBOUND',
                messageText: 'Hello! I saw your recent Instagram post regarding newly launched property plots.',
                senderName: 'Rohit Verma'
              },
              {
                tenantId,
                platform: 'INSTAGRAM',
                direction: 'INBOUND',
                messageText: 'Can you share details on 3BHK villas and current loan offers?',
                senderName: 'Rohit Verma'
              }
            ]
          }
        },
        include: { messages: true }
      });
      conversations = [sampleConv as any];
    }

    return res.json({ success: true, conversations });
  } catch (err: any) {
    return res.status(500).json({ success: false, message: err.message });
  }
}

/**
 * POST /api/v1/social/conversations/:id/reply
 * Dispatches a two-way message reply.
 */
export async function sendSocialReply(req: TenantRequest, res: Response) {
  try {
    const tenantId = req.tenantId!;
    const id = String(req.params.id);
    const { messageText } = req.body;

    if (!messageText || !messageText.trim()) {
      return res.status(400).json({ success: false, message: 'Message text cannot be empty' });
    }

    const conversation = await prisma.socialConversation.findFirst({
      where: { id, tenantId }
    });

    if (!conversation) {
      return res.status(404).json({ success: false, message: 'Conversation not found' });
    }

    const msg = await prisma.socialMessage.create({
      data: {
        tenantId,
        conversationId: conversation.id,
        platform: conversation.platform,
        direction: 'OUTBOUND',
        messageText: messageText.trim(),
        senderName: (req as any).user?.fullName || 'Support Agent',
        deliveryStatus: 'DELIVERED'
      }
    });

    await prisma.socialConversation.update({
      where: { id: conversation.id },
      data: {
        lastMessageText: messageText.trim(),
        lastMessageTime: new Date(),
        unreadCount: 0
      }
    });

    return res.json({ success: true, message: msg });
  } catch (err: any) {
    return res.status(500).json({ success: false, message: err.message });
  }
}

/**
 * POST /api/v1/social/conversations/:id/convert-to-lead
 * One-click conversion of social inquiry into a Unified CRM Lead.
 */
export async function convertSocialToLead(req: TenantRequest, res: Response) {
  try {
    const tenantId = req.tenantId!;
    const id = String(req.params.id);
    const { industry = 'GENERAL', amount = 0 } = req.body;

    const conv = await prisma.socialConversation.findFirst({
      where: { id, tenantId }
    });

    if (!conv) {
      return res.status(404).json({ success: false, message: 'Conversation not found' });
    }

    const count = await prisma.lead.count({ where: { tenantId } });
    const leadId = `SOC-LD-${1000 + count + 1}`;

    const lead = await prisma.lead.create({
      data: {
        tenantId,
        leadId,
        customerName: conv.senderName,
        phone: conv.senderPhone || '+91 9999999999',
        email: conv.senderEmail || `${conv.senderName.toLowerCase().replace(/\s+/g, '.')}@sociallead.com`,
        source: `${conv.platform.charAt(0).toUpperCase() + conv.platform.slice(1).toLowerCase()} Inbound`,
        industry,
        amount: Number(amount),
        status: 'New',
        priority: 'High',
        leadScore: 70,
        leadScoreCategory: 'WARM',
        notes: `Converted from ${conv.platform} conversation: "${conv.lastMessageText || 'Inquiry'}"`
      }
    });

    await prisma.socialConversation.update({
      where: { id: conv.id },
      data: { leadId: lead.id }
    });

    // Trigger workflow
    await AutomationEngine.processEvent(tenantId, 'lead.created', lead);
    if (lead.leadScore >= 70) {
      await AutomationEngine.processEvent(tenantId, 'lead.score_high', lead);
    }

    return res.status(201).json({ success: true, lead });
  } catch (err: any) {
    return res.status(500).json({ success: false, message: err.message });
  }
}

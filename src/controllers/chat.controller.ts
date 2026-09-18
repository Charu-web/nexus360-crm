import { Request, Response, NextFunction } from 'express';
import { prisma } from '../lib/db';
import { AppError } from '../middleware/errorHandler';

export const getChatMessages = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const tenantId = req.tenant?.id || req.user?.tenantId;
    if (!tenantId) throw new AppError('Tenant context missing', 400);

    const messages = await prisma.chatMessage.findMany({
      where: { tenantId },
      include: {
        sender: { select: { id: true, fullName: true, avatar: true } },
        receiver: { select: { id: true, fullName: true } },
      },
      orderBy: { createdAt: 'asc' },
      take: 100,
    });

    res.status(200).json({ success: true, messages });
  } catch (error) {
    next(error);
  }
};

export const sendChatMessage = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const tenantId = req.tenant?.id || req.user?.tenantId;
    if (!tenantId || !req.user) throw new AppError('Tenant or User context missing', 400);

    const { receiverId, message, attachments } = req.body;
    if (!message) throw new AppError('Message body required', 400);

    const chat = await prisma.chatMessage.create({
      data: {
        tenantId,
        senderId: req.user.id,
        receiverId: receiverId || null,
        message,
        attachments: attachments ? JSON.stringify(attachments) : null,
      },
    });

    res.status(201).json({ success: true, message: 'Message sent', chat });
  } catch (error) {
    next(error);
  }
};

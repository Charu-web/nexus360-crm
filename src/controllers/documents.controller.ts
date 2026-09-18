// src/controllers/documents.controller.ts
import { Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { TenantRequest } from '../middleware/tenant';

const prisma = new PrismaClient();

/**
 * GET /api/v1/documents
 * Lists documents with tenant isolation and entity filters.
 */
export async function listDocuments(req: TenantRequest, res: Response) {
  try {
    const tenantId = req.tenantId!;
    const { entityType, entityId, search } = req.query;

    const where: any = { tenantId };
    if (entityType) where.entityType = String(entityType);
    if (entityId) where.entityId = String(entityId);
    if (search) {
      const q = String(search).trim();
      where.OR = [
        { title: { contains: q } },
        { fileName: { contains: q } },
        { fileType: { contains: q } }
      ];
    }

    const documents = await prisma.document.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      include: {
        uploadedBy: { select: { id: true, fullName: true, email: true } }
      }
    });

    return res.json({ success: true, documents });
  } catch (err: any) {
    return res.status(500).json({ success: false, message: err.message });
  }
}

/**
 * POST /api/v1/documents
 * Registers / uploads document metadata with entity association.
 */
export async function createDocument(req: TenantRequest, res: Response) {
  try {
    const tenantId = req.tenantId!;
    const {
      title,
      fileName,
      fileUrl,
      fileType = 'pdf',
      fileSize = 1024,
      entityType = 'Lead',
      entityId
    } = req.body;

    if (!title || !fileName || !entityId) {
      return res.status(400).json({ success: false, message: 'Title, fileName, and entityId are required.' });
    }

    const doc = await prisma.document.create({
      data: {
        tenantId,
        title,
        fileName,
        fileUrl: fileUrl || ('/uploads/' + fileName),
        fileType: fileType.toLowerCase(),
        fileSize: Number(fileSize),
        entityType,
        entityId: String(entityId),
        uploadedById: (req as any).user?.id || null
      }
    });

    await prisma.auditLog.create({
      data: {
        tenantId,
        userId: (req as any).user?.id || null,
        action: 'DOCUMENT_UPLOADED',
        entity: entityType,
        entityId: String(entityId),
        details: 'Uploaded document: ' + title + ' (' + fileName + ')'
      }
    });

    return res.status(201).json({ success: true, document: doc });
  } catch (err: any) {
    return res.status(500).json({ success: false, message: err.message });
  }
}

/**
 * DELETE /api/v1/documents/:id
 * Secure deletion of document.
 */
export async function deleteDocument(req: TenantRequest, res: Response) {
  try {
    const tenantId = req.tenantId!;
    const id = String(req.params.id);

    const doc = await prisma.document.findFirst({ where: { id, tenantId } });
    if (!doc) {
      return res.status(404).json({ success: false, message: 'Document not found.' });
    }

    await prisma.document.delete({ where: { id } });

    await prisma.auditLog.create({
      data: {
        tenantId,
        userId: (req as any).user?.id || null,
        action: 'DOCUMENT_DELETED',
        entity: doc.entityType,
        entityId: doc.entityId,
        details: 'Deleted document: ' + doc.title
      }
    });

    return res.json({ success: true, message: 'Document deleted successfully.' });
  } catch (err: any) {
    return res.status(500).json({ success: false, message: err.message });
  }
}

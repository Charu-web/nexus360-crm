import { Request, Response, NextFunction } from 'express';
import { DocumentService } from '../services/document.service';
import { ragQuerySchema } from '@nexus-ai/validation';
import { logAuditEvent } from '../middleware/auditLogger';
import { AuditAction } from '@prisma/client';

export const listDocuments = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const docs = await DocumentService.listDocuments(req.organizationId!);
    res.status(200).json({ success: true, data: docs });
  } catch (error) {
    next(error);
  }
};

export const getDocument = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const doc = await DocumentService.getDocumentById(req.organizationId!, req.params.id as string);
    res.status(200).json({ success: true, data: doc });
  } catch (error) {
    next(error);
  }
};

export const uploadDocument = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const file = (req as any).file;
    if (!file) {
      res.status(400).json({ success: false, message: 'No file uploaded.' });
      return;
    }

    const doc = await DocumentService.processUploadedFile(
      req.organizationId!,
      req.user!.id,
      file
    );

    await logAuditEvent({
      organizationId: req.organizationId!,
      userId: req.user!.id,
      action: AuditAction.DOCUMENT_UPLOAD,
      resource: 'Document',
      resourceId: doc.id,
      details: `Uploaded document '${doc.name}' (${doc.fileSize} bytes)`,
      req,
    });

    res.status(201).json({
      success: true,
      message: 'Document uploaded and queued for intelligence extraction.',
      data: doc,
    });
  } catch (error) {
    next(error);
  }
};

export const deleteDocument = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const docId = req.params.id as string;
    await DocumentService.deleteDocument(req.organizationId!, docId);

    await logAuditEvent({
      organizationId: req.organizationId!,
      userId: req.user!.id,
      action: AuditAction.DELETE,
      resource: 'Document',
      resourceId: docId,
      details: `Deleted document ${docId}`,
      req,
    });

    res.status(200).json({ success: true, message: 'Document deleted successfully.' });
  } catch (error) {
    next(error);
  }
};

export const queryRAG = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const validated = ragQuerySchema.parse(req.body);
    const result = await DocumentService.queryKnowledgeBase(req.organizationId!, {
      query: validated.query,
      organizationId: req.organizationId!,
      topK: validated.topK,
      filterDocumentIds: validated.documentIds,
    });

    res.status(200).json({
      success: true,
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

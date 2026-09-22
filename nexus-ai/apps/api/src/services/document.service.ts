import fs from 'fs';
import path from 'path';
import { prisma } from '../lib/prisma';
import { AppError } from '../middleware/errorHandler';
import { DocumentStatus, DocumentType } from '@prisma/client';
import { RAGQueryRequest, RAGQueryResult, RAGSourceChunk } from '@nexus-ai/types';
import { logger } from '../lib/logger';
import pdfParse from 'pdf-parse';

export class DocumentService {
  static async listDocuments(organizationId: string) {
    return prisma.document.findMany({
      where: { organizationId },
      include: {
        uploader: { select: { id: true, fullName: true, email: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  static async getDocumentById(organizationId: string, documentId: string) {
    const doc = await prisma.document.findFirst({
      where: { id: documentId, organizationId },
      include: {
        uploader: { select: { id: true, fullName: true } },
        chunks: { take: 50, orderBy: { chunkIndex: 'asc' } },
      },
    });

    if (!doc) {
      throw new AppError('Document not found.', 404, 'DOC_NOT_FOUND');
    }

    return doc;
  }

  static async deleteDocument(organizationId: string, documentId: string) {
    const doc = await this.getDocumentById(organizationId, documentId);

    try {
      if (fs.existsSync(doc.storageKey)) {
        fs.unlinkSync(doc.storageKey);
      }
    } catch (e) {
      logger.warn(`Failed to delete physical file: ${doc.storageKey}`);
    }

    return prisma.document.delete({ where: { id: documentId } });
  }

  static async processUploadedFile(
    organizationId: string,
    uploaderId: string,
    file: any
  ) {
    const fileExt = path.extname(file.originalname).toUpperCase().replace('.', '');
    let docType: DocumentType = DocumentType.TXT;
    if (fileExt === 'PDF') docType = DocumentType.PDF;
    else if (fileExt === 'DOCX') docType = DocumentType.DOCX;
    else if (fileExt === 'CSV') docType = DocumentType.CSV;

    const document = await prisma.document.create({
      data: {
        organizationId,
        uploaderId,
        name: file.originalname,
        fileType: docType,
        fileSize: file.size,
        storageKey: file.path,
        status: DocumentStatus.PROCESSING,
      },
    });

    try {
      let extractedText = '';

      if (docType === DocumentType.PDF) {
        const dataBuffer = fs.readFileSync(file.path);
        const pdfData = await pdfParse(dataBuffer);
        extractedText = pdfData.text || '';
      } else {
        extractedText = fs.readFileSync(file.path, 'utf8');
      }

      const chunks = this.chunkText(extractedText, 500, 50);

      for (let i = 0; i < chunks.length; i++) {
        await prisma.documentChunk.create({
          data: {
            documentId: document.id,
            organizationId,
            chunkIndex: i + 1,
            content: chunks[i],
            tokenCount: Math.ceil(chunks[i].length / 4),
          },
        });
      }

      await prisma.document.update({
        where: { id: document.id },
        data: {
          status: DocumentStatus.COMPLETED,
          chunksCount: chunks.length,
          metadata: {
            totalCharacters: extractedText.length,
            extractedAt: new Date().toISOString(),
          },
        },
      });

      return document;
    } catch (err: any) {
      logger.error(`[Doc Processing Error] ${err.message}`);
      await prisma.document.update({
        where: { id: document.id },
        data: {
          status: DocumentStatus.FAILED,
          errorMessage: err.message,
        },
      });
      throw err;
    }
  }

  private static chunkText(text: string, chunkSize = 500, overlap = 50): string[] {
    const normalized = text.replace(/\r\n/g, '\n').trim();
    if (!normalized) return [];

    const chunks: string[] = [];
    let start = 0;

    while (start < normalized.length) {
      const end = Math.min(start + chunkSize, normalized.length);
      const chunk = normalized.substring(start, end).trim();
      if (chunk.length > 0) {
        chunks.push(chunk);
      }
      start += chunkSize - overlap;
    }

    return chunks;
  }

  static async queryKnowledgeBase(
    organizationId: string,
    request: RAGQueryRequest
  ): Promise<RAGQueryResult> {
    const topK = request.topK || 4;

    const terms = request.query.toLowerCase().split(/\s+/).filter((t) => t.length > 2);

    const where: any = { organizationId };
    if (request.filterDocumentIds && request.filterDocumentIds.length > 0) {
      where.documentId = { in: request.filterDocumentIds };
    }

    const allChunks = await prisma.documentChunk.findMany({
      where,
      include: { document: { select: { id: true, name: true } } },
      take: 200,
    });

    const scoredChunks = allChunks.map((chunk: any) => {
      let matches = 0;
      const contentLower = chunk.content.toLowerCase();
      terms.forEach((term: string) => {
        if (contentLower.includes(term)) matches++;
      });
      return {
        chunk,
        score: matches / Math.max(1, terms.length),
      };
    });

    const relevant = scoredChunks
      .filter((s: any) => s.score > 0)
      .sort((a: any, b: any) => b.score - a.score)
      .slice(0, topK);

    if (relevant.length === 0) {
      return {
        answer: 'I could not find sufficient information in your organization’s uploaded documents to answer this question accurately.',
        sources: [],
        hasSufficientContext: false,
      };
    }

    const sources: RAGSourceChunk[] = relevant.map((r: any) => ({
      documentId: r.chunk.document.id,
      documentName: r.chunk.document.name,
      chunkIndex: r.chunk.chunkIndex,
      content: r.chunk.content,
      similarityScore: Math.round(r.score * 100) / 100,
    }));

    const answer = `Based on your organization's knowledge base documents:\n\n${sources[0].content}\n\n*Reference: ${sources[0].documentName} (Section #${sources[0].chunkIndex})*`;

    return {
      answer,
      sources,
      hasSufficientContext: true,
    };
  }
}

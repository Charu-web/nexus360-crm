export declare enum DocumentStatus {
    UPLOADING = "UPLOADING",
    QUEUED = "QUEUED",
    PROCESSING = "PROCESSING",
    COMPLETED = "COMPLETED",
    FAILED = "FAILED"
}
export declare enum DocumentType {
    PDF = "PDF",
    DOCX = "DOCX",
    TXT = "TXT",
    CSV = "CSV"
}
export interface DocumentDTO {
    id: string;
    organizationId: string;
    name: string;
    fileType: DocumentType;
    fileSize: number;
    storageKey: string;
    status: DocumentStatus;
    chunksCount: number;
    extractedMetadata?: Record<string, any>;
    errorMessage?: string;
    uploaderId: string;
    uploader?: {
        id: string;
        fullName: string;
    };
    createdAt: string;
    updatedAt: string;
}
export interface DocumentChunkDTO {
    id: string;
    documentId: string;
    chunkIndex: number;
    content: string;
    tokenCount: number;
    metadata?: Record<string, any>;
    createdAt: string;
}
//# sourceMappingURL=document.d.ts.map
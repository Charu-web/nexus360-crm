export interface LeadScoreRequest {
    leadId: string;
    name: string;
    companyName?: string;
    industry?: string;
    estimatedValue?: number;
    source?: string;
    activityCount?: number;
    notes?: string[];
    lastContactedDaysAgo?: number;
}
export interface LeadScoreResult {
    score: number;
    confidence: number;
    factors: {
        factor: string;
        impact: 'POSITIVE' | 'NEGATIVE' | 'NEUTRAL';
        description: string;
    }[];
    reasoning: string;
    recommendedAction: string;
    suggestedUrgency: 'HIGH' | 'MEDIUM' | 'LOW';
}
export interface EmailGeneratorRequest {
    leadName: string;
    companyName?: string;
    emailPurpose: 'FIRST_OUTREACH' | 'FOLLOW_UP' | 'PROPOSAL_SUBMISSION' | 'MEETING_REQUEST' | 'CHECK_IN';
    tone: 'PROFESSIONAL' | 'FRIENDLY' | 'CONCISE' | 'PERSUASIVE';
    specificGoal: string;
    contextNotes?: string;
}
export interface EmailGeneratorResult {
    subject: string;
    body: string;
    keyPointsCovered: string[];
}
export interface RAGQueryRequest {
    query: string;
    organizationId: string;
    topK?: number;
    filterDocumentIds?: string[];
}
export interface RAGSourceChunk {
    documentId: string;
    documentName: string;
    chunkIndex: number;
    content: string;
    similarityScore: number;
}
export interface RAGQueryResult {
    answer: string;
    sources: RAGSourceChunk[];
    hasSufficientContext: boolean;
}
//# sourceMappingURL=ai.d.ts.map
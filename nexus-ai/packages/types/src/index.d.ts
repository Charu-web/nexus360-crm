export * from './auth';
export * from './tenant';
export * from './crm';
export * from './ai';
export * from './workflow';
export * from './document';
export interface ApiResponse<T = any> {
    success: boolean;
    message?: string;
    data?: T;
    errors?: {
        field?: string;
        message: string;
    }[];
    meta?: {
        page?: number;
        limit?: number;
        total?: number;
        totalPages?: number;
    };
}
//# sourceMappingURL=index.d.ts.map
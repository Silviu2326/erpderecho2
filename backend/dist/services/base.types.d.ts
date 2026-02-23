export interface PaginationParams {
    page?: number;
    limit?: number;
    sort?: string;
    order?: 'asc' | 'desc';
}
export interface PaginatedResult<T> {
    data: T[];
    meta: {
        page: number;
        limit: number;
        total: number;
        totalPages: number;
    };
}
export interface ServiceError {
    code: string;
    message: string;
    statusCode?: number;
}
export declare class ServiceException extends Error {
    code: string;
    message: string;
    statusCode: number;
    constructor(code: string, message: string, statusCode?: number);
}
export declare function formatResponse<T>(data: T, meta?: any): any;
export declare function sanitizeUser(user: any): any;
//# sourceMappingURL=base.types.d.ts.map
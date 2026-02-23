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

export class ServiceException extends Error {
  constructor(
    public code: string,
    public message: string,
    public statusCode: number = 400
  ) {
    super(message);
    this.name = 'ServiceException';
  }
}

export function formatResponse<T>(data: T, meta?: any): any {
  const response: any = { success: true, data };
  if (meta) {
    response.meta = meta;
  }
  return response;
}

export function sanitizeUser(user: any) {
  const { password, ...rest } = user;
  return rest;
}

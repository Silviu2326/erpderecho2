import { Request, Response, NextFunction } from 'express';
export interface JwtPayload {
    id: string;
    userId: string;
    email: string;
    role: string;
}
export interface AuthRequest extends Request {
    user?: JwtPayload;
}
export declare function authMiddleware(req: AuthRequest, res: Response, next: NextFunction): void;
export declare function adminMiddleware(req: AuthRequest, res: Response, next: NextFunction): void;
//# sourceMappingURL=auth.d.ts.map
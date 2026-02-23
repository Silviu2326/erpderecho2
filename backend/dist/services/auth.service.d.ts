export interface RegisterInput {
    email: string;
    password: string;
    nombre: string;
    apellido1: string;
    apellido2?: string;
    rol?: string;
}
export interface LoginInput {
    email: string;
    password: string;
}
export interface TokenPair {
    accessToken: string;
    refreshToken: string;
}
export interface AuthTokens {
    user: any;
    accessToken: string;
    refreshToken: string;
}
declare class AuthService {
    register(input: RegisterInput): Promise<AuthTokens>;
    login(input: LoginInput): Promise<AuthTokens>;
    refresh(refreshToken: string): Promise<TokenPair>;
    logout(refreshToken?: string): Promise<void>;
    getCurrentUser(userId: string): Promise<any>;
    changePassword(userId: string, currentPassword: string, newPassword: string): Promise<void>;
    private generateTokens;
    private sanitizeUser;
}
export declare const authService: AuthService;
export {};
//# sourceMappingURL=auth.service.d.ts.map
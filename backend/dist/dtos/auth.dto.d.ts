export declare class CreateUserDto {
    email: string;
    password: string;
    nombre: string;
    apellido1?: string;
    apellido2?: string;
    rol?: string;
}
export declare class LoginDto {
    email: string;
    password: string;
}
export declare class RefreshTokenDto {
    refreshToken: string;
}
export declare class ChangePasswordDto {
    currentPassword: string;
    newPassword: string;
}
//# sourceMappingURL=auth.dto.d.ts.map
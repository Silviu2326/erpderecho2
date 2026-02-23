export declare enum UsuarioRol {
    ADMIN = "admin",
    ABOGADO = "abogado",
    LETRADO = "letrado",
    SECRETARY = "secretary",
    BECARIO = "becario",
    COLABORADOR = "colaborador"
}
export declare class CreateUsuarioDto {
    email: string;
    password: string;
    nombre: string;
    apellido1?: string;
    apellido2?: string;
    rol?: UsuarioRol;
    especialidad?: string;
    numeroColegiado?: string;
    telefono?: string;
    avatarUrl?: string;
    idioma?: string;
    moneda?: string;
}
export declare class UpdateUsuarioDto {
    nombre?: string;
    apellido1?: string;
    apellido2?: string;
    rol?: UsuarioRol;
    especialidad?: string;
    numeroColegiado?: string;
    telefono?: string;
    avatarUrl?: string;
    idioma?: string;
    moneda?: string;
    activo?: boolean;
}
export declare class AssignRolesDto {
    rol: UsuarioRol;
}
export declare class QueryUsuarioDto {
    page?: number;
    limit?: number;
    sort?: string;
    order?: 'asc' | 'desc';
    search?: string;
    rol?: UsuarioRol;
    activo?: boolean;
}
//# sourceMappingURL=usuario.dto.d.ts.map
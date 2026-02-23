import { PaginationParams, PaginatedResult } from './base.types';
export interface CreateUsuarioInput {
    email: string;
    password: string;
    nombre: string;
    apellido1: string;
    apellido2?: string;
    rol?: string;
    especialidad?: string;
    numeroColegiado?: string;
    telefono?: string;
    avatarUrl?: string;
    idioma?: string;
    moneda?: string;
}
export interface UpdateUsuarioInput {
    nombre?: string;
    apellido1?: string;
    apellido2?: string;
    rol?: string;
    especialidad?: string;
    numeroColegiado?: string;
    telefono?: string;
    avatarUrl?: string;
    idioma?: string;
    moneda?: string;
}
export interface QueryUsuarioParams extends PaginationParams {
    search?: string;
    rol?: string;
    activo?: boolean;
}
declare class UsuarioService {
    findAll(params: QueryUsuarioParams): Promise<PaginatedResult<any>>;
    findById(id: string): Promise<any>;
    create(input: CreateUsuarioInput): Promise<any>;
    update(id: string, input: UpdateUsuarioInput): Promise<any>;
    delete(id: string): Promise<void>;
    updateRoles(id: string, rol: string): Promise<any>;
    private sanitizeUser;
}
export declare const usuarioService: UsuarioService;
export {};
//# sourceMappingURL=usuario.service.d.ts.map
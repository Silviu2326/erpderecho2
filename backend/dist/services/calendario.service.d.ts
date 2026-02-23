import { PaginationParams, PaginatedResult } from './base.types';
export interface CreateEventoInput {
    titulo: string;
    descripcion?: string;
    fechaInicio: Date | string;
    fechaFin?: Date | string;
    tipo: string;
    expedienteId?: string;
}
export interface UpdateEventoInput {
    titulo?: string;
    descripcion?: string;
    fechaInicio?: Date | string;
    fechaFin?: Date | string;
    tipo?: string;
    expedienteId?: string;
}
export interface CreateTurnoInput {
    fecha: Date | string;
    tipo: string;
    centro?: string;
}
export interface UpdateTurnoInput {
    fecha?: Date | string;
    estado?: string;
    tipo?: string;
    centro?: string;
}
export interface CreateGuardiaInput {
    fechaInicio: Date | string;
    fechaFin: Date | string;
    tipo: string;
    centro?: string;
}
export interface UpdateGuardiaInput {
    fechaInicio?: Date | string;
    fechaFin?: Date | string;
    tipo?: string;
    centro?: string;
}
export interface CreateLiquidacionInput {
    importe: number;
    turnoId: string;
}
export interface QueryEventoParams extends PaginationParams {
    tipo?: string;
    fecha_desde?: string;
    fecha_hasta?: string;
    expediente_id?: string;
}
export interface QueryTurnoParams extends PaginationParams {
    estado?: string;
    tipo?: string;
    fecha_desde?: string;
    fecha_hasta?: string;
}
export interface QueryGuardiaParams extends PaginationParams {
    tipo?: string;
    fecha_desde?: string;
    fecha_hasta?: string;
}
declare class CalendarioService {
    findAllEventos(params: QueryEventoParams): Promise<PaginatedResult<any>>;
    findEventoById(id: string): Promise<any>;
    createEvento(usuarioId: string, input: CreateEventoInput): Promise<any>;
    updateEvento(id: string, input: UpdateEventoInput): Promise<any>;
    deleteEvento(id: string): Promise<void>;
    getEventosMes(mes: number, anio: number, usuarioId?: string): Promise<any[]>;
    findAllTurnos(params: QueryTurnoParams): Promise<PaginatedResult<any>>;
    findTurnoById(id: string): Promise<any>;
    createTurno(usuarioId: string, input: CreateTurnoInput): Promise<any>;
    updateTurno(id: string, input: UpdateTurnoInput): Promise<any>;
    deleteTurno(id: string): Promise<void>;
    findAllGuardias(params: QueryGuardiaParams): Promise<PaginatedResult<any>>;
    createGuardia(usuarioId: string, input: CreateGuardiaInput): Promise<any>;
    deleteGuardia(id: string): Promise<void>;
    createLiquidacion(input: CreateLiquidacionInput): Promise<any>;
    getEstadisticas(usuarioId: string, anio: number): Promise<any>;
}
export declare const calendarioService: CalendarioService;
export {};
//# sourceMappingURL=calendario.service.d.ts.map
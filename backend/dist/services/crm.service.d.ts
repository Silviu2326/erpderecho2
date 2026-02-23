import { PaginationParams, PaginatedResult } from './base.types';
export interface CreateLeadInput {
    nombre: string;
    email?: string;
    telefono?: string;
    empresa?: string;
    origen?: string;
    estado?: string;
    probabilidad?: number;
    expectedRevenue?: number;
}
export interface UpdateLeadInput {
    nombre?: string;
    email?: string;
    telefono?: string;
    empresa?: string;
    origen?: string;
    estado?: string;
    probabilidad?: number;
    expectedRevenue?: number;
    clienteId?: string;
}
export interface CreateOportunidadInput {
    titulo: string;
    estado?: string;
    probabilidad?: number;
    importe?: number;
    etapa?: string;
    leadId?: string;
}
export interface UpdateOportunidadInput {
    titulo?: string;
    estado?: string;
    probabilidad?: number;
    importe?: number;
    etapa?: string;
}
export interface CreateActividadInput {
    tipo: string;
    descripcion?: string;
    fecha: Date | string;
    completada?: boolean;
    oportunidadId?: string;
}
export interface UpdateActividadInput {
    tipo?: string;
    descripcion?: string;
    fecha?: Date | string;
    completada?: boolean;
}
export interface QueryLeadParams extends PaginationParams {
    estado?: string;
    origen?: string;
    cliente_id?: string;
}
export interface QueryOportunidadParams extends PaginationParams {
    etapa?: string;
    estado?: string;
    lead_id?: string;
}
export interface QueryActividadParams extends PaginationParams {
    oportunidad_id?: string;
    tipo?: string;
    completada?: boolean;
}
export interface PipelineStage {
    etapa: string;
    total: number;
    valor: number;
    oportunidades: any[];
}
declare class CrmService {
    findAllLeads(params: QueryLeadParams): Promise<PaginatedResult<any>>;
    findLeadById(id: string): Promise<any>;
    createLead(usuarioId: string, input: CreateLeadInput): Promise<any>;
    updateLead(id: string, input: UpdateLeadInput): Promise<any>;
    deleteLead(id: string): Promise<void>;
    convertLeadToCliente(id: string): Promise<any>;
    findAllOportunidades(params: QueryOportunidadParams): Promise<PaginatedResult<any>>;
    findOportunidadById(id: string): Promise<any>;
    createOportunidad(usuarioId: string, input: CreateOportunidadInput): Promise<any>;
    updateOportunidad(id: string, input: UpdateOportunidadInput): Promise<any>;
    deleteOportunidad(id: string): Promise<void>;
    getPipeline(usuarioId?: string): Promise<PipelineStage[]>;
    findAllActividades(params: QueryActividadParams): Promise<PaginatedResult<any>>;
    findActividadById(id: string): Promise<any>;
    createActividad(usuarioId: string, input: CreateActividadInput): Promise<any>;
    updateActividad(id: string, input: UpdateActividadInput): Promise<any>;
    deleteActividad(id: string): Promise<void>;
    getActividadesPendientes(usuarioId: string): Promise<any[]>;
    getEstadisticasCrm(usuarioId: string): Promise<any>;
}
export declare const crmService: CrmService;
export {};
//# sourceMappingURL=crm.service.d.ts.map
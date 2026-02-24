const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api/v1';

import { authService } from './authService';

// Enums
export type TipoExpediente = 'CIVIL' | 'PENAL' | 'LABORAL' | 'CONTENCIOSO' | 'MERCANTIL' | 'FAMILIA' | 'ADMINISTRATIVO';
export type EstadoExpediente = 'ACTIVO' | 'CERRADO' | 'ARCHIVADO' | 'SUSPENDIDO';

// Interfaces
export interface Expediente {
  id: string;
  numeroExpediente: string;
  tipo: TipoExpediente;
  estado: EstadoExpediente;
  descripcion?: string;
  clienteId?: string;
  cliente?: {
    id: string;
    nombre: string;
    email?: string;
    telefono?: string;
  };
  abogadoId?: string;
  abogado?: {
    id: string;
    nombre: string;
    apellido1?: string;
    email: string;
  };
  createdAt: string;
  updatedAt: string;
  version: number;
}

export interface Actuacion {
  id: string;
  tipo: string;
  descripcion?: string;
  fecha: string;
  documento?: string;
  expedienteId: string;
  usuarioId: string;
  usuario?: {
    id: string;
    nombre: string;
    apellido1?: string;
  };
  createdAt: string;
  updatedAt: string;
}

export interface CreateExpedienteData {
  numeroExpediente: string;
  tipo: TipoExpediente;
  estado?: EstadoExpediente;
  descripcion?: string;
  clienteId?: string;
  abogadoId?: string;
}

export interface UpdateExpedienteData {
  numeroExpediente?: string;
  tipo?: TipoExpediente;
  estado?: EstadoExpediente;
  descripcion?: string;
  clienteId?: string;
  abogadoId?: string;
}

export interface CreateActuacionData {
  tipo: string;
  descripcion?: string;
  fecha: string;
  documento?: string;
}

export interface QueryExpedientesParams {
  page?: number;
  limit?: number;
  search?: string;
  tipo?: TipoExpediente;
  estado?: EstadoExpediente;
  abogadoId?: string;
  clienteId?: string;
  fechaDesde?: string;
  fechaHasta?: string;
  sort?: string;
  order?: 'asc' | 'desc';
}

export interface QueryActuacionesParams {
  page?: number;
  limit?: number;
  sort?: string;
  order?: 'asc' | 'desc';
}

export interface PaginatedResponse<T> {
  success: boolean;
  data: T[];
  meta: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface DashboardStats {
  totalExpedientes: number;
  porEstado: Record<EstadoExpediente, number>;
  porTipo: Record<TipoExpediente, number>;
  expedientesMes: number;
  expedientesSemana: number;
  proximasAudiencias: number;
  plazosProximos: number;
  expedientesRecientes: Expediente[];
  proximosEventos: Array<{
    id: string;
    titulo: string;
    tipo: string;
    fechaInicio: string;
    expediente: { numeroExpediente: string };
  }>;
}

// Helper function for API calls
async function apiCall<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const token = authService.getAccessToken();
  
  const response = await fetch(`${API_URL}${endpoint}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(token && { 'Authorization': `Bearer ${token}` }),
      ...options.headers,
    },
  });

  const data = await response.json();
  
  if (!response.ok) {
    throw new Error(data.error?.message || `Error en la petición: ${response.status}`);
  }

  return data;
}

class ExpedienteService {
  // Listar expedientes con paginación y filtros
  async listarExpedientes(params: QueryExpedientesParams = {}): Promise<PaginatedResponse<Expediente>> {
    const queryParams = new URLSearchParams();
    
    if (params.page) queryParams.append('page', params.page.toString());
    if (params.limit) queryParams.append('limit', params.limit.toString());
    if (params.search) queryParams.append('search', params.search);
    if (params.tipo) queryParams.append('tipo', params.tipo);
    if (params.estado) queryParams.append('estado', params.estado);
    if (params.abogadoId) queryParams.append('abogadoId', params.abogadoId);
    if (params.clienteId) queryParams.append('clienteId', params.clienteId);
    if (params.fechaDesde) queryParams.append('fechaDesde', params.fechaDesde);
    if (params.fechaHasta) queryParams.append('fechaHasta', params.fechaHasta);
    if (params.sort) queryParams.append('sort', params.sort);
    if (params.order) queryParams.append('order', params.order);

    const queryString = queryParams.toString();
    return apiCall<PaginatedResponse<Expediente>>(`/expedientes${queryString ? `?${queryString}` : ''}`);
  }

  // Búsqueda rápida de expedientes
  async buscarExpedientes(query: string): Promise<Expediente[]> {
    const response = await apiCall<{ success: boolean; data: Expediente[] }>(`/expedientes/buscar?query=${encodeURIComponent(query)}`);
    return response.data;
  }

  // Obtener expediente por ID
  async obtenerExpediente(id: string): Promise<Expediente> {
    const response = await apiCall<{ success: boolean; data: Expediente }>(`/expedientes/${id}`);
    return response.data;
  }

  // Crear expediente
  async crearExpediente(data: CreateExpedienteData): Promise<Expediente> {
    const response = await apiCall<{ success: boolean; data: Expediente }>('/expedientes', {
      method: 'POST',
      body: JSON.stringify(data),
    });
    return response.data;
  }

  // Actualizar expediente
  async actualizarExpediente(id: string, data: UpdateExpedienteData): Promise<Expediente> {
    const response = await apiCall<{ success: boolean; data: Expediente }>(`/expedientes/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
    return response.data;
  }

  // Archivar expediente (soft delete)
  async archivarExpediente(id: string): Promise<void> {
    await apiCall<{ success: boolean }>(`/expedientes/${id}`, {
      method: 'DELETE',
    });
  }

  // Obtener actuaciones de un expediente
  async obtenerActuaciones(expedienteId: string, params: QueryActuacionesParams = {}): Promise<PaginatedResponse<Actuacion>> {
    const queryParams = new URLSearchParams();
    
    if (params.page) queryParams.append('page', params.page.toString());
    if (params.limit) queryParams.append('limit', params.limit.toString());
    if (params.sort) queryParams.append('sort', params.sort);
    if (params.order) queryParams.append('order', params.order);

    const queryString = queryParams.toString();
    return apiCall<PaginatedResponse<Actuacion>>(
      `/expedientes/${expedienteId}/actuaciones${queryString ? `?${queryString}` : ''}`
    );
  }

  // Crear actuación en un expediente
  async crearActuacion(expedienteId: string, data: CreateActuacionData): Promise<Actuacion> {
    const response = await apiCall<{ success: boolean; data: Actuacion }>(`/expedientes/${expedienteId}/actuaciones`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
    return response.data;
  }

  // Obtener documentos de un expediente
  async obtenerDocumentos(expedienteId: string): Promise<any[]> {
    const response = await apiCall<{ success: boolean; data: any[] }>(`/expedientes/${expedienteId}/documentos`);
    return response.data;
  }

  // Obtener eventos/actuaciones para calendario
  async obtenerCalendario(mes?: number, anio?: number): Promise<any[]> {
    const queryParams = new URLSearchParams();
    if (mes) queryParams.append('mes', mes.toString());
    if (anio) queryParams.append('anio', anio.toString());

    const queryString = queryParams.toString();
    const response = await apiCall<{ success: boolean; data: any[] }>(`/expedientes/calendario${queryString ? `?${queryString}` : ''}`);
    return response.data;
  }

  // Obtener estadísticas del dashboard
  async obtenerEstadisticas(): Promise<DashboardStats> {
    const response = await apiCall<{ success: boolean; data: DashboardStats }>('/expedientes/stats/dashboard');
    return response.data;
  }
}

export const expedienteService = new ExpedienteService();
export default expedienteService;

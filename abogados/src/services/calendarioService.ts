const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api/v1';

import { authService } from './authService';

// Enums
export type TipoEvento = 'AUDIENCIA' | 'PLAZO' | 'TAREA' | 'CITACION' | 'NOTIFICACION' | 'OTRO';

// Interfaces
export interface Evento {
  id: string;
  titulo: string;
  descripcion?: string;
  fechaInicio: string;
  fechaFin?: string;
  tipo: TipoEvento;
  expedienteId?: string;
  expediente?: {
    id: string;
    numeroExpediente: string;
    tipo: string;
  };
  usuarioId?: string;
  usuario?: {
    id: string;
    nombre: string;
    apellido1?: string;
  };
  createdAt: string;
  updatedAt: string;
}

export interface CreateEventoData {
  titulo: string;
  descripcion?: string;
  fechaInicio: string;
  fechaFin?: string;
  tipo: TipoEvento;
  expedienteId?: string;
}

export interface UpdateEventoData {
  titulo?: string;
  descripcion?: string;
  fechaInicio?: string;
  fechaFin?: string;
  tipo?: TipoEvento;
  expedienteId?: string;
}

export interface QueryEventosParams {
  page?: number;
  limit?: number;
  tipo?: TipoEvento;
  fechaDesde?: string;
  fechaHasta?: string;
  expedienteId?: string;
  sort?: string;
  order?: 'asc' | 'desc';
}

export interface QueryCalendarioParams {
  mes?: number;
  anio?: number;
  fechaDesde?: string;
  fechaHasta?: string;
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

class CalendarioService {
  // Listar eventos con paginación y filtros
  async listarEventos(params: QueryEventosParams = {}): Promise<PaginatedResponse<Evento>> {
    const queryParams = new URLSearchParams();
    
    if (params.page) queryParams.append('page', params.page.toString());
    if (params.limit) queryParams.append('limit', params.limit.toString());
    if (params.tipo) queryParams.append('tipo', params.tipo);
    if (params.fechaDesde) queryParams.append('fechaDesde', params.fechaDesde);
    if (params.fechaHasta) queryParams.append('fechaHasta', params.fechaHasta);
    if (params.expedienteId) queryParams.append('expedienteId', params.expedienteId);
    if (params.sort) queryParams.append('sort', params.sort);
    if (params.order) queryParams.append('order', params.order);

    const queryString = queryParams.toString();
    return apiCall<PaginatedResponse<Evento>>(`/calendario/eventos${queryString ? `?${queryString}` : ''}`);
  }

  // Obtener evento por ID
  async obtenerEvento(id: string): Promise<Evento> {
    const response = await apiCall<{ success: boolean; data: Evento }>(`/calendario/eventos/${id}`);
    return response.data;
  }

  // Crear evento
  async crearEvento(data: CreateEventoData): Promise<Evento> {
    const response = await apiCall<{ success: boolean; data: Evento }>('/calendario/eventos', {
      method: 'POST',
      body: JSON.stringify(data),
    });
    return response.data;
  }

  // Actualizar evento
  async actualizarEvento(id: string, data: UpdateEventoData): Promise<Evento> {
    const response = await apiCall<{ success: boolean; data: Evento }>(`/calendario/eventos/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
    return response.data;
  }

  // Eliminar evento
  async eliminarEvento(id: string): Promise<void> {
    await apiCall<{ success: boolean }>(`/calendario/eventos/${id}`, {
      method: 'DELETE',
    });
  }

  // Listar solo audiencias por rango de fechas
  async listarAudiencias(fechaDesde?: string, fechaHasta?: string): Promise<Evento[]> {
    const queryParams = new URLSearchParams();
    if (fechaDesde) queryParams.append('fechaDesde', fechaDesde);
    if (fechaHasta) queryParams.append('fechaHasta', fechaHasta);

    const queryString = queryParams.toString();
    const response = await apiCall<{ success: boolean; data: Evento[] }>(`/calendario/audiencias${queryString ? `?${queryString}` : ''}`);
    return response.data;
  }

  // Listar solo plazos por rango de fechas
  async listarPlazos(fechaDesde?: string, fechaHasta?: string): Promise<Evento[]> {
    const queryParams = new URLSearchParams();
    if (fechaDesde) queryParams.append('fechaDesde', fechaDesde);
    if (fechaHasta) queryParams.append('fechaHasta', fechaHasta);

    const queryString = queryParams.toString();
    const response = await apiCall<{ success: boolean; data: Evento[] }>(`/calendario/plazos${queryString ? `?${queryString}` : ''}`);
    return response.data;
  }

  // Listar solo tareas por rango de fechas
  async listarTareas(fechaDesde?: string, fechaHasta?: string): Promise<Evento[]> {
    const queryParams = new URLSearchParams();
    if (fechaDesde) queryParams.append('fechaDesde', fechaDesde);
    if (fechaHasta) queryParams.append('fechaHasta', fechaHasta);

    const queryString = queryParams.toString();
    const response = await apiCall<{ success: boolean; data: Evento[] }>(`/calendario/tareas${queryString ? `?${queryString}` : ''}`);
    return response.data;
  }

  // Obtener eventos para el calendario mensual
  async obtenerEventosCalendario(params: QueryCalendarioParams = {}): Promise<Evento[]> {
    const queryParams = new URLSearchParams();
    
    if (params.mes) queryParams.append('mes', params.mes.toString());
    if (params.anio) queryParams.append('anio', params.anio.toString());
    if (params.fechaDesde) queryParams.append('fechaDesde', params.fechaDesde);
    if (params.fechaHasta) queryParams.append('fechaHasta', params.fechaHasta);

    const queryString = queryParams.toString();
    
    // Usar el endpoint de listar eventos con filtros de fecha
    const response = await apiCall<PaginatedResponse<Evento>>(
      `/calendario/eventos${queryString ? `?${queryString}` : ''}`
    );
    return response.data;
  }

  // Obtener próximos eventos (hoy y próximos días)
  async obtenerProximosEventos(dias: number = 7): Promise<Evento[]> {
    const hoy = new Date();
    const fechaDesde = hoy.toISOString().split('T')[0];
    
    const fechaHasta = new Date();
    fechaHasta.setDate(hoy.getDate() + dias);
    
    const queryParams = new URLSearchParams();
    queryParams.append('fechaDesde', fechaDesde);
    queryParams.append('fechaHasta', fechaHasta.toISOString().split('T')[0]);
    queryParams.append('limit', '100');
    queryParams.append('sort', 'fechaInicio');
    queryParams.append('order', 'asc');

    const response = await apiCall<PaginatedResponse<Evento>>(
      `/calendario/eventos?${queryParams.toString()}`
    );
    return response.data;
  }

  // Crear audiencia (convenience method)
  async crearAudiencia(data: Omit<CreateEventoData, 'tipo'>): Promise<Evento> {
    return this.crearEvento({
      ...data,
      tipo: 'AUDIENCIA',
    });
  }

  // Crear plazo (convenience method)
  async crearPlazo(data: Omit<CreateEventoData, 'tipo'>): Promise<Evento> {
    return this.crearEvento({
      ...data,
      tipo: 'PLAZO',
    });
  }

  // Crear tarea (convenience method)
  async crearTarea(data: Omit<CreateEventoData, 'tipo'>): Promise<Evento> {
    return this.crearEvento({
      ...data,
      tipo: 'TAREA',
    });
  }
}

export const calendarioService = new CalendarioService();
export default calendarioService;

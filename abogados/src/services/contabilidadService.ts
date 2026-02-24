const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api/v1';

import { authService } from './authService';

// Enums
export type TipoAsiento = 'INGRESO' | 'EGRESO' | 'TRASPASO' | 'AJUSTE';

// Interfaces
export interface AsientoContable {
  id: string;
  numero: string;
  fecha: string;
  concepto: string;
  tipo: TipoAsiento;
  importe: number;
  importeDebe?: number;
  importeHaber?: number;
  cuentaCodigo: string;
  cuentaNombre: string;
  documentoRef?: string;
  createdAt: string;
  updatedAt: string;
  usuarioId: string;
  facturaId?: string;
  gastoId?: string;
  usuario?: {
    id: string;
    nombre: string;
    apellido1?: string;
  };
  factura?: {
    id: string;
    numero: string;
    importe: number;
  };
  gasto?: {
    id: string;
    concepto: string;
    importe: number;
  };
}

export interface CreateAsientoData {
  numero: string;
  fecha: string;
  concepto: string;
  tipo: TipoAsiento;
  importe: number;
  importeDebe?: number;
  importeHaber?: number;
  cuentaCodigo: string;
  cuentaNombre: string;
  documentoRef?: string;
  facturaId?: string;
  gastoId?: string;
}

export interface UpdateAsientoData {
  fecha?: string;
  concepto?: string;
  tipo?: TipoAsiento;
  importe?: number;
  importeDebe?: number;
  importeHaber?: number;
  cuentaCodigo?: string;
  cuentaNombre?: string;
  documentoRef?: string;
}

export interface QueryAsientosParams {
  page?: number;
  limit?: number;
  sort?: string;
  order?: 'asc' | 'desc';
  search?: string;
  tipo?: TipoAsiento;
  cuentaCodigo?: string;
  fechaDesde?: string;
  fechaHasta?: string;
}

export interface ContabilidadStats {
  totalIngresos: number;
  totalEgresos: number;
  balance: number;
  totalAsientos: number;
  asientosPorTipo: {
    INGRESO: number;
    EGRESO: number;
    TRASPASO: number;
    AJUSTE: number;
  };
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

async function apiCall<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const token = authService.getToken();
  
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(token && { Authorization: `Bearer ${token}` }),
    ...((options.headers as Record<string, string>) || {}),
  };

  const response = await fetch(`${API_URL}${endpoint}`, {
    ...options,
    headers,
  });

  if (response.status === 401) {
    authService.logout();
    window.location.href = '/login';
    throw new Error('Sesión expirada');
  }

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.error?.message || `HTTP ${response.status}`);
  }

  return data;
}

class ContabilidadService {
  // Obtener listado paginado de asientos
  async getAsientos(params: QueryAsientosParams = {}): Promise<PaginatedResponse<AsientoContable>> {
    const queryParams = new URLSearchParams();
    
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        queryParams.append(key, String(value));
      }
    });

    const queryString = queryParams.toString();
    return apiCall<PaginatedResponse<AsientoContable>>(`/contabilidad/asientos${queryString ? `?${queryString}` : ''}`);
  }

  // Obtener un asiento por ID
  async getAsientoById(id: string): Promise<{ success: boolean; data: AsientoContable }> {
    return apiCall<{ success: boolean; data: AsientoContable }>(`/contabilidad/asientos/${id}`);
  }

  // Crear nuevo asiento
  async createAsiento(data: CreateAsientoData): Promise<{ success: boolean; data: AsientoContable }> {
    return apiCall<{ success: boolean; data: AsientoContable }>('/contabilidad/asientos', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  // Actualizar asiento
  async updateAsiento(id: string, data: UpdateAsientoData): Promise<{ success: boolean; data: AsientoContable }> {
    return apiCall<{ success: boolean; data: AsientoContable }>(`/contabilidad/asientos/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  // Eliminar asiento (soft delete)
  async deleteAsiento(id: string): Promise<{ success: boolean; message: string }> {
    return apiCall<{ success: boolean; message: string }>(`/contabilidad/asientos/${id}`, {
      method: 'DELETE',
    });
  }

  // Obtener estadísticas de contabilidad
  async getStats(): Promise<{ success: boolean; data: ContabilidadStats }> {
    return apiCall<{ success: boolean; data: ContabilidadStats }>('/contabilidad/stats/resumen');
  }

  // Obtener libro mayor
  async getLibroMayor(cuentaCodigo: string, fechaDesde?: string, fechaHasta?: string): Promise<{ success: boolean; data: AsientoContable[] }> {
    const params = new URLSearchParams();
    params.append('cuenta', cuentaCodigo);
    if (fechaDesde) params.append('fechaDesde', fechaDesde);
    if (fechaHasta) params.append('fechaHasta', fechaHasta);
    
    return apiCall<{ success: boolean; data: AsientoContable[] }>(`/contabilidad/libro-mayor?${params.toString()}`);
  }

  // Obtener cuentas contables únicas
  async getCuentas(): Promise<{ success: boolean; data: { codigo: string; nombre: string; total: number }[] }> {
    return apiCall<{ success: boolean; data: { codigo: string; nombre: string; total: number }[] }>('/contabilidad/cuentas');
  }
}

export const contabilidadService = new ContabilidadService();

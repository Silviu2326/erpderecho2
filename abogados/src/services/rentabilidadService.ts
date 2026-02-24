const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api/v1';

import { authService } from './authService';

// Interfaces
export interface RentabilidadCaso {
  id: string;
  caso: string;
  expedienteId: string;
  numeroExpediente: string;
  abogado: string;
  abogadoId: string;
  facturado: number;
  coste: number;
  margen: number;
  estado: 'excellent' | 'good' | 'fair' | 'poor';
  createdAt: string;
}

export interface RentabilidadAbogado {
  abogado: string;
  abogadoId: string;
  casos: number;
  facturado: number;
  coste: number;
  margen: number;
  horas: number;
}

export interface RentabilidadKPIs {
  facturacionTotal: number;
  costeTotal: number;
  margenPromedio: number;
  casosRentables: number;
  casosNoRentables: number;
  totalCasos: number;
}

export interface QueryRentabilidadParams {
  periodo?: string;
  fechaDesde?: string;
  fechaHasta?: string;
  abogadoId?: string;
  page?: number;
  limit?: number;
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

class RentabilidadService {
  // Obtener rentabilidad por caso
  async getRentabilidadPorCaso(params: QueryRentabilidadParams = {}): Promise<PaginatedResponse<RentabilidadCaso>> {
    const queryParams = new URLSearchParams();
    
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        queryParams.append(key, String(value));
      }
    });

    const queryString = queryParams.toString();
    return apiCall<PaginatedResponse<RentabilidadCaso>>(`/rentabilidad/casos${queryString ? `?${queryString}` : ''}`);
  }

  // Obtener rentabilidad por abogado
  async getRentabilidadPorAbogado(params: QueryRentabilidadParams = {}): Promise<{ success: boolean; data: RentabilidadAbogado[] }> {
    const queryParams = new URLSearchParams();
    
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        queryParams.append(key, String(value));
      }
    });

    const queryString = queryParams.toString();
    return apiCall<{ success: boolean; data: RentabilidadAbogado[] }>(`/rentabilidad/abogados${queryString ? `?${queryString}` : ''}`);
  }

  // Obtener KPIs de rentabilidad
  async getKPIs(params: QueryRentabilidadParams = {}): Promise<{ success: boolean; data: RentabilidadKPIs }> {
    const queryParams = new URLSearchParams();
    
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        queryParams.append(key, String(value));
      }
    });

    const queryString = queryParams.toString();
    return apiCall<{ success: boolean; data: RentabilidadKPIs }>(`/rentabilidad/kpis${queryString ? `?${queryString}` : ''}`);
  }

  // Exportar reporte de rentabilidad
  async exportarReporte(tipo: 'casos' | 'abogados', formato: 'pdf' | 'excel', params: QueryRentabilidadParams = {}): Promise<{ success: boolean; url: string; message: string }> {
    const queryParams = new URLSearchParams();
    queryParams.append('tipo', tipo);
    queryParams.append('formato', formato);
    
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        queryParams.append(key, String(value));
      }
    });

    return apiCall<{ success: boolean; url: string; message: string }>(`/rentabilidad/exportar?${queryParams.toString()}`);
  }
}

export const rentabilidadService = new RentabilidadService();

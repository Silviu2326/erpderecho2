const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api/v1';

import { authService } from './authService';

// Enums
export type EstadoGasto = 'PENDIENTE' | 'APROBADO' | 'RECHAZADO' | 'PAGADO' | 'CONTABILIZADO';
export type TipoGasto = 'OPERATIVO' | 'PROFESIONAL' | 'ADMINISTRATIVO' | 'REEMBOLSABLE' | 'CASO';

// Interfaces
export interface Gasto {
  id: string;
  concepto: string;
  descripcion?: string;
  importe: number;
  importeIVA?: number;
  tipo: TipoGasto;
  estado: EstadoGasto;
  fechaGasto: string;
  fechaPago?: string;
  comprobanteUrl?: string;
  numeroFactura?: string;
  reembolsable: boolean;
  fechaReembolso?: string;
  createdAt: string;
  updatedAt: string;
  usuarioId: string;
  proveedorId?: string;
  expedienteId?: string;
  aprobadoPorId?: string;
  proveedor?: {
    id: string;
    nombre: string;
    cif?: string;
  };
  usuario?: {
    id: string;
    nombre: string;
    apellido1?: string;
  };
  expediente?: {
    id: string;
    numeroExpediente: string;
  };
  aprobadoPor?: {
    id: string;
    nombre: string;
    apellido1?: string;
  };
}

export interface Proveedor {
  id: string;
  nombre: string;
  cif?: string;
  email?: string;
  telefono?: string;
  direccion?: string;
  ciudad?: string;
  provincia?: string;
  codigoPostal?: string;
  pais: string;
  contactoNombre?: string;
  contactoEmail?: string;
  contactoTelefono?: string;
  activo: boolean;
  observaciones?: string;
  createdAt: string;
  updatedAt: string;
  _count?: {
    gastos: number;
  };
}

export interface CreateGastoData {
  concepto: string;
  descripcion?: string;
  importe: number;
  importeIVA?: number;
  tipo?: TipoGasto;
  fechaGasto: string;
  fechaPago?: string;
  comprobanteUrl?: string;
  numeroFactura?: string;
  reembolsable?: boolean;
  proveedorId?: string;
  expedienteId?: string;
}

export interface UpdateGastoData {
  concepto?: string;
  descripcion?: string;
  importe?: number;
  importeIVA?: number;
  tipo?: TipoGasto;
  estado?: EstadoGasto;
  fechaGasto?: string;
  fechaPago?: string;
  comprobanteUrl?: string;
  numeroFactura?: string;
  reembolsable?: boolean;
  proveedorId?: string;
  expedienteId?: string;
}

export interface CreateProveedorData {
  nombre: string;
  cif?: string;
  email?: string;
  telefono?: string;
  direccion?: string;
  ciudad?: string;
  provincia?: string;
  codigoPostal?: string;
  pais?: string;
  contactoNombre?: string;
  contactoEmail?: string;
  contactoTelefono?: string;
  observaciones?: string;
}

export interface UpdateProveedorData {
  nombre?: string;
  cif?: string;
  email?: string;
  telefono?: string;
  direccion?: string;
  ciudad?: string;
  provincia?: string;
  codigoPostal?: string;
  pais?: string;
  contactoNombre?: string;
  contactoEmail?: string;
  contactoTelefono?: string;
  observaciones?: string;
  activo?: boolean;
}

export interface QueryGastosParams {
  page?: number;
  limit?: number;
  sort?: string;
  order?: 'asc' | 'desc';
  search?: string;
  estado?: EstadoGasto;
  tipo?: TipoGasto;
  usuarioId?: string;
  proveedorId?: string;
  expedienteId?: string;
  fechaDesde?: string;
  fechaHasta?: string;
}

export interface QueryProveedoresParams {
  page?: number;
  limit?: number;
  search?: string;
  activo?: boolean;
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

export interface GastosStats {
  totalGastos: number;
  totalPendientes: number;
  totalAprobados: number;
  totalPagados: number;
  sumaTotal: number;
  sumaPendientes: number;
  sumaPagados: number;
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

class GastoService {
  // ============ GASTOS ============

  // Obtener listado paginado de gastos
  async getGastos(params: QueryGastosParams = {}): Promise<PaginatedResponse<Gasto>> {
    const queryParams = new URLSearchParams();
    
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        queryParams.append(key, String(value));
      }
    });

    const queryString = queryParams.toString();
    return apiCall<PaginatedResponse<Gasto>>(`/gastos${queryString ? `?${queryString}` : ''}`);
  }

  // Obtener un gasto por ID
  async getGastoById(id: string): Promise<{ success: boolean; data: Gasto }> {
    return apiCall<{ success: boolean; data: Gasto }>(`/gastos/${id}`);
  }

  // Crear nuevo gasto
  async createGasto(data: CreateGastoData): Promise<{ success: boolean; data: Gasto }> {
    return apiCall<{ success: boolean; data: Gasto }>('/gastos', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  // Actualizar gasto
  async updateGasto(id: string, data: UpdateGastoData): Promise<{ success: boolean; data: Gasto }> {
    return apiCall<{ success: boolean; data: Gasto }>(`/gastos/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  // Eliminar gasto (soft delete)
  async deleteGasto(id: string): Promise<{ success: boolean; message: string }> {
    return apiCall<{ success: boolean; message: string }>(`/gastos/${id}`, {
      method: 'DELETE',
    });
  }

  // Aprobar gasto
  async aprobarGasto(id: string): Promise<{ success: boolean; message: string; data: Gasto }> {
    return apiCall<{ success: boolean; message: string; data: Gasto }>(`/gastos/${id}/aprobar`, {
      method: 'POST',
    });
  }

  // Rechazar gasto
  async rechazarGasto(id: string): Promise<{ success: boolean; message: string; data: Gasto }> {
    return apiCall<{ success: boolean; message: string; data: Gasto }>(`/gastos/${id}/rechazar`, {
      method: 'POST',
    });
  }

  // Marcar gasto como pagado
  async pagarGasto(id: string): Promise<{ success: boolean; message: string; data: Gasto }> {
    return apiCall<{ success: boolean; message: string; data: Gasto }>(`/gastos/${id}/pagar`, {
      method: 'POST',
    });
  }

  // Obtener estadísticas de gastos
  async getStats(): Promise<{ success: boolean; data: GastosStats }> {
    return apiCall<{ success: boolean; data: GastosStats }>('/gastos/stats/resumen');
  }

  // ============ PROVEEDORES ============

  // Obtener listado paginado de proveedores
  async getProveedores(params: QueryProveedoresParams = {}): Promise<PaginatedResponse<Proveedor>> {
    const queryParams = new URLSearchParams();
    
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        queryParams.append(key, String(value));
      }
    });

    const queryString = queryParams.toString();
    return apiCall<PaginatedResponse<Proveedor>>(`/gastos/proveedores${queryString ? `?${queryString}` : ''}`);
  }

  // Obtener un proveedor por ID
  async getProveedorById(id: string): Promise<{ success: boolean; data: Proveedor }> {
    return apiCall<{ success: boolean; data: Proveedor }>(`/gastos/proveedores/${id}`);
  }

  // Crear nuevo proveedor
  async createProveedor(data: CreateProveedorData): Promise<{ success: boolean; data: Proveedor }> {
    return apiCall<{ success: boolean; data: Proveedor }>('/gastos/proveedores', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  // Actualizar proveedor
  async updateProveedor(id: string, data: UpdateProveedorData): Promise<{ success: boolean; data: Proveedor }> {
    return apiCall<{ success: boolean; data: Proveedor }>(`/gastos/proveedores/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  // Eliminar proveedor (soft delete)
  async deleteProveedor(id: string): Promise<{ success: boolean; message: string }> {
    return apiCall<{ success: boolean; message: string }>(`/gastos/proveedores/${id}`, {
      method: 'DELETE',
    });
  }
}

export const gastoService = new GastoService();

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api/v1';

import { authService } from './authService';

// Enums
export type EstadoFactura = 'PENDIENTE' | 'PAGADA' | 'ANULADA' | 'VENCIDA';

// Interfaces
export interface LineaFactura {
  id: string;
  concepto: string;
  cantidad: number;
  precioUnitario: number;
  importe: number;
  createdAt: string;
}

export interface Factura {
  id: string;
  numero: string;
  concepto: string;
  importe: number;
  importeBase: number;
  importeIVA: number;
  estado: EstadoFactura;
  fechaEmision: string;
  fechaVencimiento: string | null;
  clienteId: string;
  cliente?: {
    id: string;
    nombre: string;
    email?: string;
    cif?: string;
    telefono?: string;
    direccion?: string;
    ciudad?: string;
    provincia?: string;
  };
  expedienteId?: string;
  expediente?: {
    id: string;
    numeroExpediente: string;
    tipo?: string;
  };
  lineas?: LineaFactura[];
  _count?: {
    lineas: number;
  };
  createdAt: string;
  updatedAt: string;
}

export interface CreateLineaFacturaData {
  concepto: string;
  cantidad: number;
  precioUnitario: number;
}

export interface CreateFacturaData {
  numero: string;
  concepto: string;
  importeBase: number;
  importeIVA?: number;
  clienteId: string;
  expedienteId?: string;
  fechaEmision?: string;
  fechaVencimiento?: string;
  lineas?: CreateLineaFacturaData[];
}

export interface UpdateFacturaData {
  concepto?: string;
  importeBase?: number;
  importeIVA?: number;
  clienteId?: string;
  expedienteId?: string;
  fechaEmision?: string;
  fechaVencimiento?: string;
  lineas?: CreateLineaFacturaData[];
}

export interface QueryFacturasParams {
  page?: number;
  limit?: number;
  sort?: string;
  order?: 'asc' | 'desc';
  search?: string;
  estado?: EstadoFactura;
  cliente_id?: string;
  expediente_id?: string;
  fecha_desde?: string;
  fecha_hasta?: string;
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

class FacturaService {
  // Obtener listado paginado de facturas
  async getFacturas(params: QueryFacturasParams = {}): Promise<PaginatedResponse<Factura>> {
    const queryParams = new URLSearchParams();
    
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        queryParams.append(key, String(value));
      }
    });

    const queryString = queryParams.toString();
    return apiCall<PaginatedResponse<Factura>>(`/facturas${queryString ? `?${queryString}` : ''}`);
  }

  // Obtener facturas pendientes
  async getFacturasPendientes(): Promise<{ success: boolean; data: Factura[] }> {
    return apiCall<{ success: boolean; data: Factura[] }>('/facturas/pendientes');
  }

  // Obtener facturas vencidas
  async getFacturasVencidas(): Promise<{ success: boolean; data: Factura[] }> {
    return apiCall<{ success: boolean; data: Factura[] }>('/facturas/vencidas');
  }

  // Obtener una factura por ID
  async getFacturaById(id: string): Promise<{ success: boolean; data: Factura }> {
    return apiCall<{ success: boolean; data: Factura }>(`/facturas/${id}`);
  }

  // Crear nueva factura
  async createFactura(data: CreateFacturaData): Promise<{ success: boolean; data: Factura }> {
    return apiCall<{ success: boolean; data: Factura }>('/facturas', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  // Actualizar factura
  async updateFactura(id: string, data: UpdateFacturaData): Promise<{ success: boolean; data: Factura }> {
    return apiCall<{ success: boolean; data: Factura }>(`/facturas/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  // Anular factura (soft delete)
  async anularFactura(id: string): Promise<{ success: boolean; message: string }> {
    return apiCall<{ success: boolean; message: string }>(`/facturas/${id}`, {
      method: 'DELETE',
    });
  }

  // Marcar factura como pagada
  async pagarFactura(id: string): Promise<{ success: boolean; message: string; data: Factura }> {
    return apiCall<{ success: boolean; message: string; data: Factura }>(`/facturas/${id}/pagar`, {
      method: 'POST',
    });
  }

  // Obtener URL del PDF
  async getFacturaPDF(id: string): Promise<{ success: boolean; url: string; message: string }> {
    return apiCall<{ success: boolean; url: string; message: string }>(`/facturas/${id}/pdf`);
  }

  // Enviar factura por email
  async enviarFactura(id: string, email?: string): Promise<{ success: boolean; message: string; email: string }> {
    return apiCall<{ success: boolean; message: string; email: string }>(`/facturas/${id}/enviar`, {
      method: 'POST',
      body: JSON.stringify(email ? { email } : {}),
    });
  }

  // Obtener estadísticas para dashboard
  async getStats(): Promise<{
    totalFacturado: number;
    totalPendiente: number;
    totalVencido: number;
    totalPagado: number;
    countPendientes: number;
    countVencidas: number;
    countPagadas: number;
  }> {
    const [todas, pendientes, vencidas] = await Promise.all([
      this.getFacturas({ limit: 1000 }),
      this.getFacturasPendientes(),
      this.getFacturasVencidas(),
    ]);

    const todasFacturas = todas.data || [];
    const facturasPendientes = pendientes.data || [];
    const facturasVencidas = vencidas.data || [];

    const totalFacturado = todasFacturas.reduce((sum, f) => sum + (f.importe || 0), 0);
    const totalPendiente = facturasPendientes.reduce((sum, f) => sum + (f.importe || 0), 0);
    const totalVencido = facturasVencidas.reduce((sum, f) => sum + (f.importe || 0), 0);
    const totalPagado = todasFacturas
      .filter(f => f.estado === 'PAGADA')
      .reduce((sum, f) => sum + (f.importe || 0), 0);

    return {
      totalFacturado,
      totalPendiente,
      totalVencido,
      totalPagado,
      countPendientes: facturasPendientes.length,
      countVencidas: facturasVencidas.length,
      countPagadas: todasFacturas.filter(f => f.estado === 'PAGADA').length,
    };
  }
}

export const facturaService = new FacturaService();

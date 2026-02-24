const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api/v1';

import { authService } from './authService';

// Interfaces
export interface Cliente {
  id: string;
  nombre: string;
  cif?: string;
  email?: string;
  telefono?: string;
  direccion?: string;
  codigoPostal?: string;
  ciudad?: string;
  provincia?: string;
  pais?: string;
  observaciones?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Contacto {
  id: string;
  nombre: string;
  email?: string;
  telefono?: string;
  cargo?: string;
  clienteId: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateClienteData {
  nombre: string;
  cif?: string;
  email?: string;
  telefono?: string;
  direccion?: string;
  codigoPostal?: string;
  ciudad?: string;
  provincia?: string;
  pais?: string;
  observaciones?: string;
}

export interface UpdateClienteData {
  nombre?: string;
  cif?: string;
  email?: string;
  telefono?: string;
  direccion?: string;
  codigoPostal?: string;
  ciudad?: string;
  provincia?: string;
  pais?: string;
  observaciones?: string;
}

export interface CreateContactoData {
  nombre: string;
  email?: string;
  telefono?: string;
  cargo?: string;
}

export interface QueryClientesParams {
  page?: number;
  limit?: number;
  search?: string;
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

class ClienteService {
  // Listar clientes con paginación y filtros
  async listarClientes(params: QueryClientesParams = {}): Promise<PaginatedResponse<Cliente>> {
    const queryParams = new URLSearchParams();
    
    if (params.page) queryParams.append('page', params.page.toString());
    if (params.limit) queryParams.append('limit', params.limit.toString());
    if (params.search) queryParams.append('search', params.search);
    if (params.sort) queryParams.append('sort', params.sort);
    if (params.order) queryParams.append('order', params.order);

    const queryString = queryParams.toString();
    return apiCall<PaginatedResponse<Cliente>>(`/clientes${queryString ? `?${queryString}` : ''}`);
  }

  // Búsqueda rápida de clientes
  async buscarClientes(query: string): Promise<Cliente[]> {
    const response = await apiCall<{ success: boolean; data: Cliente[] }>(`/clientes/buscar?query=${encodeURIComponent(query)}`);
    return response.data;
  }

  // Obtener cliente por ID
  async obtenerCliente(id: string): Promise<Cliente> {
    const response = await apiCall<{ success: boolean; data: Cliente }>(`/clientes/${id}`);
    return response.data;
  }

  // Crear cliente
  async crearCliente(data: CreateClienteData): Promise<Cliente> {
    const response = await apiCall<{ success: boolean; data: Cliente }>('/clientes', {
      method: 'POST',
      body: JSON.stringify(data),
    });
    return response.data;
  }

  // Actualizar cliente
  async actualizarCliente(id: string, data: UpdateClienteData): Promise<Cliente> {
    const response = await apiCall<{ success: boolean; data: Cliente }>(`/clientes/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
    return response.data;
  }

  // Eliminar (desactivar) cliente
  async eliminarCliente(id: string): Promise<void> {
    await apiCall<{ success: boolean }>(`/clientes/${id}`, {
      method: 'DELETE',
    });
  }

  // Obtener expedientes de un cliente
  async obtenerExpedientesCliente(clienteId: string): Promise<any[]> {
    const response = await apiCall<{ success: boolean; data: any[] }>(`/clientes/${clienteId}/expedientes`);
    return response.data;
  }

  // Obtener facturas de un cliente
  async obtenerFacturasCliente(clienteId: string): Promise<any[]> {
    const response = await apiCall<{ success: boolean; data: any[] }>(`/clientes/${clienteId}/facturas`);
    return response.data;
  }

  // === CONTACTOS ===

  // Crear contacto para un cliente
  async crearContacto(clienteId: string, data: CreateContactoData): Promise<Contacto> {
    const response = await apiCall<{ success: boolean; data: Contacto }>(`/clientes/${clienteId}/contactos`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
    return response.data;
  }

  // Listar contactos de un cliente
  async listarContactos(clienteId: string): Promise<Contacto[]> {
    const cliente = await this.obtenerCliente(clienteId);
    // La API devuelve contactos incluidos en el cliente
    // Si necesitamos endpoint separado, se puede agregar
    return [];
  }
}

export const clienteService = new ClienteService();
export default clienteService;

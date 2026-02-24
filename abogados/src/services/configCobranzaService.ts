// Servicio de Configuración de Cobranza
// Gestión de configuración, recordatorios y alertas

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api/v1';

import { authService } from './authService';

// Tipos
export interface ConfiguracionCobranza {
  id: string;
  diasGracia: number;
  interesMora: number;
  moneda: string;
  idioma: string;
  sepaHabilitado: boolean;
  notificacionesAuto: boolean;
  emailRemitente?: string;
  nombreRemitente?: string;
  sepaCreditorId?: string;
  sepaIban?: string;
  sepaBic?: string;
  createdAt: string;
  updatedAt: string;
}

export interface RecordatorioCobranza {
  id: string;
  dias: number;
  tipo: 'antes' | 'despues';
  activo: boolean;
  plantilla: string;
  asunto?: string;
  contenido?: string;
  orden: number;
  createdAt: string;
  updatedAt: string;
}

export interface AlertaCobranza {
  id: string;
  nombre: string;
  descripcion?: string;
  condicion: string;
  tipo: 'email' | 'push' | 'email_push';
  activa: boolean;
  emailDestinatarios?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateRecordatorioData {
  dias: number;
  tipo: 'antes' | 'despues';
  plantilla: string;
  asunto?: string;
  contenido?: string;
  orden?: number;
}

export interface UpdateRecordatorioData {
  dias?: number;
  tipo?: 'antes' | 'despues';
  plantilla?: string;
  asunto?: string;
  contenido?: string;
  activo?: boolean;
  orden?: number;
}

export interface CreateAlertaData {
  nombre: string;
  descripcion?: string;
  condicion: string;
  tipo: 'email' | 'push' | 'email_push';
  emailDestinatarios?: string;
}

export interface UpdateAlertaData {
  nombre?: string;
  descripcion?: string;
  condicion?: string;
  tipo?: 'email' | 'push' | 'email_push';
  activa?: boolean;
  emailDestinatarios?: string;
}

export interface UpdateConfiguracionData {
  diasGracia?: number;
  interesMora?: number;
  moneda?: string;
  idioma?: string;
  sepaHabilitado?: boolean;
  notificacionesAuto?: boolean;
  emailRemitente?: string;
  nombreRemitente?: string;
  sepaCreditorId?: string;
  sepaIban?: string;
  sepaBic?: string;
}

// Helper para llamadas API
async function apiCall<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const token = authService.getToken();
  
  const response = await fetch(`${API_URL}/cobranza${endpoint}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(token && { 'Authorization': `Bearer ${token}` }),
      ...options.headers,
    },
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: 'Error desconocido' }));
    throw new Error(error.message || `HTTP ${response.status}`);
  }

  return response.json();
}

class ConfigCobranzaService {
  // ============ CONFIGURACIÓN GENERAL ============

  async getConfiguracion(): Promise<{ success: boolean; data: ConfiguracionCobranza }> {
    return apiCall<{ success: boolean; data: ConfiguracionCobranza }>('/configuracion');
  }

  async updateConfiguracion(data: UpdateConfiguracionData): Promise<{ success: boolean; data: ConfiguracionCobranza }> {
    return apiCall<{ success: boolean; data: ConfiguracionCobranza }>('/configuracion', {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  // ============ RECORDATORIOS ============

  async getRecordatorios(): Promise<{ success: boolean; data: RecordatorioCobranza[] }> {
    return apiCall<{ success: boolean; data: RecordatorioCobranza[] }>('/recordatorios');
  }

  async createRecordatorio(data: CreateRecordatorioData): Promise<{ success: boolean; data: RecordatorioCobranza }> {
    return apiCall<{ success: boolean; data: RecordatorioCobranza }>('/recordatorios', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateRecordatorio(id: string, data: UpdateRecordatorioData): Promise<{ success: boolean; data: RecordatorioCobranza }> {
    return apiCall<{ success: boolean; data: RecordatorioCobranza }>(`/recordatorios/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async deleteRecordatorio(id: string): Promise<{ success: boolean; data: { message: string } }> {
    return apiCall<{ success: boolean; data: { message: string } }>(`/recordatorios/${id}`, {
      method: 'DELETE',
    });
  }

  // ============ ALERTAS ============

  async getAlertas(): Promise<{ success: boolean; data: AlertaCobranza[] }> {
    return apiCall<{ success: boolean; data: AlertaCobranza[] }>('/alertas');
  }

  async createAlerta(data: CreateAlertaData): Promise<{ success: boolean; data: AlertaCobranza }> {
    return apiCall<{ success: boolean; data: AlertaCobranza }>('/alertas', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateAlerta(id: string, data: UpdateAlertaData): Promise<{ success: boolean; data: AlertaCobranza }> {
    return apiCall<{ success: boolean; data: AlertaCobranza }>(`/alertas/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async deleteAlerta(id: string): Promise<{ success: boolean; data: { message: string } }> {
    return apiCall<{ success: boolean; data: { message: string } }>(`/alertas/${id}`, {
      method: 'DELETE',
    });
  }
}

// Exportar singleton
export const configCobranzaService = new ConfigCobranzaService();

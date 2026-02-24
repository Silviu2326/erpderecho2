// Servicio de Cobranza - Módulo M4
// Gestión de cuentas por cobrar, facturas vencidas y cobros

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api/v1';

import { authService } from './authService';
import type { Factura, EstadoFactura } from './facturaService';

// Re-exportar tipos necesarios
export type { Factura, EstadoFactura };

// Tipos específicos de cobranza
export interface CuentaPorCobrar {
  id: string;
  clienteId: string;
  clienteNombre: string;
  clienteEmail?: string;
  totalFacturas: number;
  totalPendiente: number;
  totalPagado: number;
  facturasVencidas: number;
  diasPromedioMora: number;
  ultimoPago?: string;
  estado: 'al_dia' | 'pendiente' | 'moroso' | 'incobrable';
}

export interface FacturaVencida extends Factura {
  diasVencida: number;
  interesesMora: number;
}

export interface CobranzaStats {
  totalPendiente: number;
  totalVencido: number;
  totalAlDia: number;
  enCobranza: number;
  accionLegal: number;
  acuerdosActivos: number;
  acuerdosIncumplidos: number;
  vencido0a30: number;
  vencido31a60: number;
  vencido61a90: number;
  vencido90mas: number;
  totalClientes: number;
  clientesMorosos: number;
}

export interface AcuerdoPago {
  id: string;
  clienteId: string;
  clienteNombre: string;
  montoTotal: number;
  numeroCuotas: number;
  montoCuota: number;
  frecuencia: 'semanal' | 'quincenal' | 'mensual';
  fechaInicio: string;
  estado: 'activo' | 'completado' | 'incumplido';
  pagosRealizados: number;
  proximoPago?: string;
}

export interface RegistroCobro {
  id: string;
  facturaId: string;
  clienteId: string;
  tipo: 'llamada' | 'email' | 'carta' | 'visita' | 'notificacion';
  resultado: 'sin_respuesta' | 'promesa_pago' | 'rechazado' | 'negociando' | 'acuerdo' | 'otro';
  notas: string;
  fecha: string;
  realizadoPor: string;
  fechaPromesaPago?: string;
  montoPromesa?: number;
}

export interface QueryCobranzaParams {
  page?: number;
  limit?: number;
  search?: string;
  estado?: string;
  cliente_id?: string;
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

// Helper para llamadas API
async function apiCall<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const token = authService.getToken();
  
  const response = await fetch(`${API_URL}${endpoint}`, {
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

class CobranzaService {
  // ============ CUENTAS POR COBRAR ============

  // Obtener listado de cuentas por cobrar (resumen por cliente)
  async getCuentasPorCobrar(params: QueryCobranzaParams = {}): Promise<PaginatedResponse<CuentaPorCobrar>> {
    // Por ahora usamos facturas y agrupamos por cliente
    const facturasResponse = await apiCall<PaginatedResponse<Factura>>('/facturas?estado=PENDIENTE&limit=1000');
    
    // Agrupar facturas por cliente
    const cuentasMap = new Map<string, CuentaPorCobrar>();
    
    facturasResponse.data.forEach(factura => {
      const clienteId = factura.clienteId;
      
      if (!cuentasMap.has(clienteId)) {
        cuentasMap.set(clienteId, {
          id: `CC-${clienteId}`,
          clienteId: clienteId,
          clienteNombre: factura.cliente?.nombre || 'Cliente desconocido',
          clienteEmail: factura.cliente?.email,
          totalFacturas: 0,
          totalPendiente: 0,
          totalPagado: 0,
          facturasVencidas: 0,
          diasPromedioMora: 0,
          estado: 'al_dia',
        });
      }
      
      const cuenta = cuentasMap.get(clienteId)!;
      cuenta.totalFacturas++;
      cuenta.totalPendiente += factura.importe;
      
      // Verificar si está vencida
      if (factura.fechaVencimiento && new Date(factura.fechaVencimiento) < new Date()) {
        cuenta.facturasVencidas++;
      }
    });

    // Calcular estado y estadísticas adicionales
    cuentasMap.forEach(cuenta => {
      if (cuenta.facturasVencidas > 0) {
        cuenta.estado = cuenta.facturasVencidas > 3 ? 'moroso' : 'pendiente';
      }
    });

    const cuentas = Array.from(cuentasMap.values());
    
    return {
      success: true,
      data: cuentas,
      meta: {
        page: 1,
        limit: cuentas.length,
        total: cuentas.length,
        totalPages: 1,
      },
    };
  }

  // Obtener facturas vencidas
  async getFacturasVencidas(params: QueryCobranzaParams = {}): Promise<PaginatedResponse<FacturaVencida>> {
    const queryParams = new URLSearchParams();
    
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        queryParams.append(key, String(value));
      }
    });

    // Agregar filtro de estado VENCIDA si no está especificado
    if (!params.estado) {
      queryParams.append('estado', 'VENCIDA');
    }

    const queryString = queryParams.toString();
    const response = await apiCall<PaginatedResponse<Factura>>(`/facturas${queryString ? `?${queryString}` : ''}`);
    
    // Calcular días vencida e intereses para cada factura
    const facturasVencidas: FacturaVencida[] = response.data.map(factura => {
      const diasVencida = factura.fechaVencimiento 
        ? Math.max(0, Math.floor((new Date().getTime() - new Date(factura.fechaVencimiento).getTime()) / (1000 * 60 * 60 * 24)))
        : 0;
      
      // Intereses de mora: 5% anual
      const interesesMora = diasVencida > 0 ? (factura.importe * 0.05 * diasVencida) / 365 : 0;
      
      return {
        ...factura,
        diasVencida,
        interesesMora: Math.round(interesesMora * 100) / 100,
      };
    });

    return {
      ...response,
      data: facturasVencidas,
    };
  }

  // Obtener estadísticas de cobranza
  async getCobranzaStats(): Promise<CobranzaStats> {
    const [pendientes, vencidas] = await Promise.all([
      apiCall<PaginatedResponse<Factura>>('/facturas?estado=PENDIENTE&limit=1000'),
      apiCall<PaginatedResponse<Factura>>('/facturas?estado=VENCIDA&limit=1000'),
    ]);

    const totalPendiente = pendientes.data.reduce((sum, f) => sum + f.importe, 0) + 
                          vencidas.data.reduce((sum, f) => sum + f.importe, 0);
    
    const totalVencido = vencidas.data.reduce((sum, f) => sum + f.importe, 0);
    
    // Calcular distribución por días
    let vencido0a30 = 0, vencido31a60 = 0, vencido61a90 = 0, vencido90mas = 0;
    
    vencidas.data.forEach(factura => {
      if (factura.fechaVencimiento) {
        const dias = Math.floor((new Date().getTime() - new Date(factura.fechaVencimiento).getTime()) / (1000 * 60 * 60 * 24));
        if (dias <= 30) vencido0a30 += factura.importe;
        else if (dias <= 60) vencido31a60 += factura.importe;
        else if (dias <= 90) vencido61a90 += factura.importe;
        else vencido90mas += factura.importe;
      }
    });

    return {
      totalPendiente,
      totalVencido,
      totalAlDia: totalPendiente - totalVencido,
      enCobranza: vencidas.data.filter(f => {
        if (!f.fechaVencimiento) return false;
        const dias = Math.floor((new Date().getTime() - new Date(f.fechaVencimiento).getTime()) / (1000 * 60 * 60 * 24));
        return dias > 30 && dias <= 90;
      }).reduce((sum, f) => sum + f.importe, 0),
      accionLegal: vencidas.data.filter(f => {
        if (!f.fechaVencimiento) return false;
        const dias = Math.floor((new Date().getTime() - new Date(f.fechaVencimiento).getTime()) / (1000 * 60 * 60 * 24));
        return dias > 90;
      }).reduce((sum, f) => sum + f.importe, 0),
      acuerdosActivos: 0, // TODO: Implementar cuando haya tabla de acuerdos
      acuerdosIncumplidos: 0,
      vencido0a30,
      vencido31a60,
      vencido61a90,
      vencido90mas,
      totalClientes: new Set(pendientes.data.map(f => f.clienteId)).size + new Set(vencidas.data.map(f => f.clienteId)).size,
      clientesMorosos: new Set(vencidas.data.map(f => f.clienteId)).size,
    };
  }

  // ============ REGISTROS DE COBRO ============

  // Obtener historial de cobros de un cliente/factura
  async getRegistrosCobro(facturaId?: string, clienteId?: string): Promise<RegistroCobro[]> {
    // TODO: Implementar cuando haya tabla de registros de cobro
    return [];
  }

  // Crear nuevo registro de cobro
  async createRegistroCobro(data: Omit<RegistroCobro, 'id' | 'fecha'>): Promise<{ success: boolean; data: RegistroCobro }> {
    // TODO: Implementar cuando haya tabla de registros de cobro
    throw new Error('Funcionalidad no implementada en backend');
  }

  // ============ ACUERDOS DE PAGO ============

  // Obtener acuerdos de pago
  async getAcuerdosPago(params: QueryCobranzaParams = {}): Promise<PaginatedResponse<AcuerdoPago>> {
    // TODO: Implementar cuando haya tabla de acuerdos
    return {
      success: true,
      data: [],
      meta: {
        page: 1,
        limit: 20,
        total: 0,
        totalPages: 0,
      },
    };
  }

  // Crear acuerdo de pago
  async createAcuerdoPago(data: Omit<AcuerdoPago, 'id'>): Promise<{ success: boolean; data: AcuerdoPago }> {
    // TODO: Implementar cuando haya tabla de acuerdos
    throw new Error('Funcionalidad no implementada en backend');
  }

  // ============ ACCIONES DE COBRANZA ============

  // Enviar recordatorio de pago
  async enviarRecordatorio(facturaId: string, tipo: 'email' | 'sms' = 'email'): Promise<{ success: boolean; message: string }> {
    return apiCall<{ success: boolean; message: string }>(`/facturas/${facturaId}/recordatorio`, {
      method: 'POST',
      body: JSON.stringify({ tipo }),
    });
  }

  // Registrar pago manual
  async registrarPago(facturaId: string, monto: number, metodo: string, notas?: string): Promise<{ success: boolean; data: Factura }> {
    return apiCall<{ success: boolean; data: Factura }>(`/facturas/${facturaId}/pago`, {
      method: 'POST',
      body: JSON.stringify({ monto, metodo, notas }),
    });
  }
}

// Exportar singleton
export const cobranzaService = new CobranzaService();

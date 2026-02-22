import { useState, useEffect, useCallback } from 'react';
import type {
  EventoCalendario,
  PlataformaIntegracion,
  CredencialesIntegracion,
  SincronizacionConfig,
  LogSincronizacion,
} from '@/types/integraciones';

interface CalendarioSyncState {
  eventos: EventoCalendario[];
  calendariosConectados: CredencialesIntegracion[];
  configuraciones: SincronizacionConfig[];
  logs: LogSincronizacion[];
  isLoading: boolean;
  isSyncing: boolean;
  error: string | null;
  ultimoSync: string | null;
}

interface CreateEventoParams {
  titulo: string;
  descripcion?: string;
  inicio: string;
  fin: string;
  ubicacion?: string;
  esTodoElDia?: boolean;
  timezone?: string;
  asistentes?: Array<{ email: string; nombre?: string }>;
  plataforma: PlataformaIntegracion;
}

interface UpdateEventoParams {
  eventoId: string;
  plataforma: PlataformaIntegracion;
  titulo?: string;
  descripcion?: string;
  inicio?: string;
  fin?: string;
  ubicacion?: string;
  esTodoElDia?: boolean;
}

export function useCalendarSync() {
  const [state, setState] = useState<CalendarioSyncState>({
    eventos: [],
    calendariosConectados: [],
    configuraciones: [],
    logs: [],
    isLoading: true,
    isSyncing: false,
    error: null,
    ultimoSync: null,
  });

  const fetchEventos = useCallback(async (plataforma?: PlataformaIntegracion) => {
    try {
      setState(prev => ({ ...prev, isLoading: true, error: null }));
      
      const params = plataforma ? `?plataforma=${plataforma}` : '';
      const response = await fetch(`/api/calendario/eventos${params}`);
      
      if (!response.ok) {
        throw new Error('Error al cargar eventos');
      }
      
      const eventos: EventoCalendario[] = await response.json();
      setState(prev => ({ ...prev, eventos, isLoading: false }));
    } catch (e) {
      setState(prev => ({ 
        ...prev, 
        error: e instanceof Error ? e.message : 'Error desconocido',
        isLoading: false 
      }));
    }
  }, []);

  const fetchCalendariosConectados = useCallback(async () => {
    try {
      const response = await fetch('/api/calendario/conectados');
      
      if (!response.ok) {
        throw new Error('Error al cargar calendarios');
      }
      
      const calendarios: CredencialesIntegracion[] = await response.json();
      setState(prev => ({ ...prev, calendariosConectados: calendarios }));
    } catch (e) {
      console.error('[CalendarSync] Error fetching calendars:', e);
    }
  }, []);

  const fetchConfiguraciones = useCallback(async () => {
    try {
      const response = await fetch('/api/calendario/configuraciones');
      
      if (!response.ok) {
        throw new Error('Error al cargar configuraciones');
      }
      
      const configuraciones: SincronizacionConfig[] = await response.json();
      setState(prev => ({ ...prev, configuraciones }));
    } catch (e) {
      console.error('[CalendarSync] Error fetching configs:', e);
    }
  }, []);

  const fetchLogs = useCallback(async (configId?: string) => {
    try {
      const params = configId ? `?configId=${configId}` : '';
      const response = await fetch(`/api/calendario/logs${params}`);
      
      if (!response.ok) {
        throw new Error('Error al cargar logs');
      }
      
      const logs: LogSincronizacion[] = await response.json();
      setState(prev => ({ ...prev, logs }));
    } catch (e) {
      console.error('[CalendarSync] Error fetching logs:', e);
    }
  }, []);

  const inicializar = useCallback(async () => {
    setState(prev => ({ ...prev, isLoading: true, error: null }));
    
    try {
      await Promise.all([
        fetchEventos(),
        fetchCalendariosConectados(),
        fetchConfiguraciones(),
      ]);
      
      setState(prev => ({ ...prev, isLoading: false }));
    } catch (e) {
      setState(prev => ({ 
        ...prev, 
        error: e instanceof Error ? e.message : 'Error al inicializar',
        isLoading: false 
      }));
    }
  }, [fetchEventos, fetchCalendariosConectados, fetchConfiguraciones]);

  useEffect(() => {
    inicializar();
  }, [inicializar]);

  const conectarCalendario = useCallback(async (plataforma: PlataformaIntegracion): Promise<CredencialesIntegracion | null> => {
    try {
      setState(prev => ({ ...prev, error: null }));
      
      const response = await fetch('/api/calendario/conectar', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ plataforma }),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Error al conectar calendario');
      }
      
      const credenciales: CredencialesIntegracion = await response.json();
      
      setState(prev => ({
        ...prev,
        calendariosConectados: [...prev.calendariosConectados, credenciales],
      }));
      
      return credenciales;
    } catch (e) {
      setState(prev => ({ 
        ...prev, 
        error: e instanceof Error ? e.message : 'Error al conectar' 
      }));
      return null;
    }
  }, []);

  const desconectarCalendario = useCallback(async (plataforma: PlataformaIntegracion): Promise<boolean> => {
    try {
      setState(prev => ({ ...prev, error: null }));
      
      const response = await fetch('/api/calendario/desconectar', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ plataforma }),
      });
      
      if (!response.ok) {
        throw new Error('Error al desconectar calendario');
      }
      
      setState(prev => ({
        ...prev,
        calendariosConectados: prev.calendariosConectados.filter(c => c.plataforma !== plataforma),
      }));
      
      return true;
    } catch (e) {
      setState(prev => ({ 
        ...prev, 
        error: e instanceof Error ? e.message : 'Error al desconectar' 
      }));
      return false;
    }
  }, []);

  const crearEvento = useCallback(async (params: CreateEventoParams): Promise<EventoCalendario | null> => {
    try {
      setState(prev => ({ ...prev, error: null }));
      
      const response = await fetch('/api/calendario/eventos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(params),
      });
      
      if (!response.ok) {
        throw new Error('Error al crear evento');
      }
      
      const evento: EventoCalendario = await response.json();
      
      setState(prev => ({
        ...prev,
        eventos: [...prev.eventos, evento],
      }));
      
      return evento;
    } catch (e) {
      setState(prev => ({ 
        ...prev, 
        error: e instanceof Error ? e.message : 'Error al crear evento' 
      }));
      return null;
    }
  }, []);

  const actualizarEvento = useCallback(async (params: UpdateEventoParams): Promise<EventoCalendario | null> => {
    try {
      setState(prev => ({ ...prev, error: null }));
      
      const response = await fetch(`/api/calendario/eventos/${params.eventoId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(params),
      });
      
      if (!response.ok) {
        throw new Error('Error al actualizar evento');
      }
      
      const eventoActualizado: EventoCalendario = await response.json();
      
      setState(prev => ({
        ...prev,
        eventos: prev.eventos.map(e => 
          e.id === params.eventoId ? eventoActualizado : e
        ),
      }));
      
      return eventoActualizado;
    } catch (e) {
      setState(prev => ({ 
        ...prev, 
        error: e instanceof Error ? e.message : 'Error al actualizar evento' 
      }));
      return null;
    }
  }, []);

  const eliminarEvento = useCallback(async (eventoId: string, plataforma: PlataformaIntegracion): Promise<boolean> => {
    try {
      setState(prev => ({ ...prev, error: null }));
      
      const response = await fetch(`/api/calendario/eventos/${eventoId}`, {
        method: 'DELETE',
        headers: { ...(plataforma && { 'x-plataforma': plataforma }) },
      });
      
      if (!response.ok) {
        throw new Error('Error al eliminar evento');
      }
      
      setState(prev => ({
        ...prev,
        eventos: prev.eventos.filter(e => e.id !== eventoId),
      }));
      
      return true;
    } catch (e) {
      setState(prev => ({ 
        ...prev, 
        error: e instanceof Error ? e.message : 'Error al eliminar evento' 
      }));
      return false;
    }
  }, []);

  const sincronizarCalendario = useCallback(async (
    plataforma: PlataformaIntegracion,
    direccion: 'push' | 'pull' | 'bidirectional' = 'bidirectional'
  ): Promise<LogSincronizacion | null> => {
    try {
      setState(prev => ({ ...prev, isSyncing: true, error: null }));
      
      const response = await fetch('/api/calendario/sincronizar', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ plataforma, direccion }),
      });
      
      if (!response.ok) {
        throw new Error('Error al sincronizar calendario');
      }
      
      const log: LogSincronizacion = await response.json();
      
      setState(prev => ({
        ...prev,
        logs: [log, ...prev.logs],
        ultimoSync: new Date().toISOString(),
        isSyncing: false,
      }));
      
      await fetchEventos();
      
      return log;
    } catch (e) {
      setState(prev => ({ 
        ...prev, 
        error: e instanceof Error ? e.message : 'Error al sincronizar',
        isSyncing: false 
      }));
      return null;
    }
  }, [fetchEventos]);

  const sincronizarTodos = useCallback(async (): Promise<LogSincronizacion[]> => {
    try {
      setState(prev => ({ ...prev, isSyncing: true, error: null }));
      
      const response = await fetch('/api/calendario/sincronizar-todos', {
        method: 'POST',
      });
      
      if (!response.ok) {
        throw new Error('Error al sincronizar todos los calendarios');
      }
      
      const logs: LogSincronizacion[] = await response.json();
      
      setState(prev => ({
        ...prev,
        logs: [...logs, ...prev.logs],
        ultimoSync: new Date().toISOString(),
        isSyncing: false,
      }));
      
      await fetchEventos();
      
      return logs;
    } catch (e) {
      setState(prev => ({ 
        ...prev, 
        error: e instanceof Error ? e.message : 'Error al sincronizar todos',
        isSyncing: false 
      }));
      return [];
    }
  }, [fetchEventos]);

  const actualizarConfiguracion = useCallback(async (
    configId: string,
    updates: Partial<SincronizacionConfig>
  ): Promise<SincronizacionConfig | null> => {
    try {
      const response = await fetch(`/api/calendario/configuraciones/${configId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates),
      });
      
      if (!response.ok) {
        throw new Error('Error al actualizar configuración');
      }
      
      const configActualizada: SincronizacionConfig = await response.json();
      
      setState(prev => ({
        ...prev,
        configuraciones: prev.configuraciones.map(c => 
          c.id === configId ? configActualizada : c
        ),
      }));
      
      return configActualizada;
    } catch (e) {
      setState(prev => ({ 
        ...prev, 
        error: e instanceof Error ? e.message : 'Error al actualizar configuración' 
      }));
      return null;
    }
  }, []);

  const getEventosPorPlataforma = useCallback((plataforma: PlataformaIntegracion): EventoCalendario[] => {
    return state.eventos.filter(e => e.plataforma === plataforma);
  }, [state.eventos]);

  const getEventosPorFecha = useCallback((fechaInicio: string, fechaFin: string): EventoCalendario[] => {
    return state.eventos.filter(e => {
      const inicio = new Date(e.inicio);
      return inicio >= new Date(fechaInicio) && inicio <= new Date(fechaFin);
    });
  }, [state.eventos]);

  const getEventosSincronizados = useCallback((): EventoCalendario[] => {
    return state.eventos.filter(e => e.syncStatus === 'synced');
  }, [state.eventos]);

  const getEventosPendientes = useCallback((): EventoCalendario[] => {
    return state.eventos.filter(e => e.syncStatus === 'pending');
  }, [state.eventos]);

  const getEventosConConflictos = useCallback((): EventoCalendario[] => {
    return state.eventos.filter(e => e.syncStatus === 'conflict');
  }, [state.eventos]);

  const getConfiguracionActiva = useCallback((): SincronizacionConfig | undefined => {
    return state.configuraciones.find(c => c.activa && c.tipoIntegracion === 'calendar');
  }, [state.configuraciones]);

  const estaConectado = useCallback((plataforma: PlataformaIntegracion): boolean => {
    return state.calendariosConectados.some(c => c.plataforma === plataforma);
  }, [state.calendariosConectados]);

  const resolverConflicto = useCallback(async (
    eventoId: string,
    plataforma: PlataformaIntegracion,
    accion: 'local' | 'externo' | 'ambos'
  ): Promise<boolean> => {
    try {
      const response = await fetch(`/api/calendario/eventos/${eventoId}/resolver-conflicto`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ plataforma, accion }),
      });
      
      if (!response.ok) {
        throw new Error('Error al resolver conflicto');
      }
      
      await fetchEventos();
      
      return true;
    } catch (e) {
      setState(prev => ({ 
        ...prev, 
        error: e instanceof Error ? e.message : 'Error al resolver conflicto' 
      }));
      return false;
    }
  }, [fetchEventos]);

  const clearError = useCallback(() => {
    setState(prev => ({ ...prev, error: null }));
  }, []);

  return {
    eventos: state.eventos,
    calendariosConectados: state.calendariosConectados,
    configuraciones: state.configuraciones,
    logs: state.logs,
    isLoading: state.isLoading,
    isSyncing: state.isSyncing,
    error: state.error,
    ultimoSync: state.ultimoSync,
    fetchEventos,
    fetchCalendariosConectados,
    fetchConfiguraciones,
    fetchLogs,
    inicializar,
    conectarCalendario,
    desconectarCalendario,
    crearEvento,
    actualizarEvento,
    eliminarEvento,
    sincronizarCalendario,
    sincronizarTodos,
    actualizarConfiguracion,
    getEventosPorPlataforma,
    getEventosPorFecha,
    getEventosSincronizados,
    getEventosPendientes,
    getEventosConConflictos,
    getConfiguracionActiva,
    estaConectado,
    resolverConflicto,
    clearError,
  };
}

export default useCalendarSync;

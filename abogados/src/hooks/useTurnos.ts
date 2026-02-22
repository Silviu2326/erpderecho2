import { useState, useEffect, useCallback } from 'react';
import { oficioService } from '@/services/oficioService';
import type {
  Turno,
  Guardia,
  ActuacionOficio,
  AbogadoOficio,
  PartidoJudicial,
  ConfiguracionTurnos,
  EstadoTurno,
  TipoTurno,
  TipoActuacion,
  EstadisticasOficio,
} from '@/types/oficio';

export function useTurnos() {
  const [turnos, setTurnos] = useState<Turno[]>([]);
  const [guardias, setGuardias] = useState<Guardia[]>([]);
  const [actuaciones, setActuaciones] = useState<ActuacionOficio[]>([]);
  const [abogados, setAbogados] = useState<AbogadoOficio[]>([]);
  const [partidos, setPartidos] = useState<PartidoJudicial[]>([]);
  const [config, setConfig] = useState<ConfiguracionTurnos | null>(null);
  const [estadisticas, setEstadisticas] = useState<EstadisticasOficio | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchAll = useCallback(async () => {
    try {
      setIsLoading(true);
      const [turnosData, guardiasData, actuacionesData, abogadosData, partidosData, configData, statsData] = await Promise.all([
        oficioService.getTurnos(),
        oficioService.getGuardias(),
        oficioService.getActuaciones(),
        oficioService.getAbogados(),
        oficioService.getPartidosJudiciales(),
        oficioService.getConfiguracion(),
        oficioService.getEstadisticas(),
      ]);
      setTurnos(turnosData);
      setGuardias(guardiasData);
      setActuaciones(actuacionesData);
      setAbogados(abogadosData);
      setPartidos(partidosData);
      setConfig(configData);
      setEstadisticas(statsData);
      setError(null);
    } catch (e) {
      setError('Error al cargar datos de turnos de oficio');
      console.error('[TurnosOficio] Error:', e);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAll();
  }, [fetchAll]);

  const refreshStats = useCallback(async () => {
    const [statsData] = await Promise.all([
      oficioService.getEstadisticas(),
    ]);
    setEstadisticas(statsData);
  }, []);

  const crearTurno = useCallback(async (data: Omit<Turno, 'id' | 'estado'>) => {
    const nuevoTurno = await oficioService.createTurno(data);
    setTurnos(prev => [...prev, nuevoTurno]);
    await refreshStats();
    return nuevoTurno;
  }, [refreshStats]);

  const actualizarEstadoTurno = useCallback(async (turnoId: string, estado: EstadoTurno) => {
    const turnoActualizado = await oficioService.updateTurnoEstado(turnoId, estado);
    if (turnoActualizado) {
      setTurnos(prev => prev.map(t => t.id === turnoId ? turnoActualizado : t));
    }
    return turnoActualizado;
  }, []);

  const asignarAbogado = useCallback(async (turnoId: string, abogadoId: string, abogadoNombre: string) => {
    const turnoActualizado = await oficioService.asignarAbogado(turnoId, abogadoId, abogadoNombre);
    if (turnoActualizado) {
      setTurnos(prev => prev.map(t => t.id === turnoId ? turnoActualizado : t));
    }
    return turnoActualizado;
  }, []);

  const crearGuardia = useCallback(async (data: Omit<Guardia, 'id'>) => {
    const nuevaGuardia = await oficioService.createGuardia(data);
    setGuardias(prev => [...prev, nuevaGuardia]);
    return nuevaGuardia;
  }, []);

  const confirmarGuardia = useCallback(async (guardiaId: string) => {
    const guardiaConfirmada = await oficioService.confirmarGuardia(guardiaId);
    if (guardiaConfirmada) {
      setGuardias(prev => prev.map(g => g.id === guardiaId ? guardiaConfirmada : g));
    }
    return guardiaConfirmada;
  }, []);

  const crearActuacion = useCallback(async (data: Omit<ActuacionOficio, 'id'>) => {
    const nuevaActuacion = await oficioService.createActuacion(data);
    setActuaciones(prev => [nuevaActuacion, ...prev]);
    await refreshStats();
    return nuevaActuacion;
  }, [refreshStats]);

  const actualizarConfig = useCallback(async (newConfig: Partial<ConfiguracionTurnos>) => {
    const configActualizada = await oficioService.updateConfig(newConfig);
    setConfig(configActualizada);
    return configActualizada;
  }, []);

  const swapTurnos = useCallback(async (turnoId1: string, turnoId2: string) => {
    const turnosActualizados = await oficioService.swapTurnos(turnoId1, turnoId2);
    if (turnosActualizados) {
      setTurnos(prev => prev.map(t => {
        const actualizado = turnosActualizados.find(tu => tu.id === t.id);
        return actualizado || t;
      }));
    }
    return turnosActualizados;
  }, []);

  const getTurnosPorTipo = useCallback((tipo: TipoTurno) => {
    return turnos.filter(t => t.tipo === tipo);
  }, [turnos]);

  const getTurnosActivos = useCallback(() => {
    return turnos.filter(t => t.estado !== 'completado' && t.estado !== 'cancelado');
  }, [turnos]);

  const getGuardiasPendientes = useCallback(() => {
    return guardias.filter(g => !g.confirmada);
  }, [guardias]);

  const getActuacionesSinFacturar = useCallback(() => {
    return actuaciones.filter(a => !a.Facturada);
  }, [actuaciones]);

  return {
    turnos,
    guardias,
    actuaciones,
    abogados,
    partidos,
    config,
    estadisticas,
    isLoading,
    error,
    fetchAll,
    refreshStats,
    crearTurno,
    actualizarEstadoTurno,
    asignarAbogado,
    crearGuardia,
    confirmarGuardia,
    crearActuacion,
    actualizarConfig,
    swapTurnos,
    getTurnosPorTipo,
    getTurnosActivos,
    getGuardiasPendientes,
    getActuacionesSinFacturar,
  };
}

export default useTurnos;

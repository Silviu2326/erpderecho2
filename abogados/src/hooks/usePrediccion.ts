import { useState, useCallback } from 'react';
import type {
  AnalisisPredictivo,
  MateriaAnalisis,
  CategoriaRiesgo,
  Recomendacion,
} from '@/types/prediccion';
import {
  predecirCaso,
  analizarTendencia,
  obtenerMetricasAbogado,
  generarRecomendaciones,
  obtenerDashboardPredictivo,
  type InputPrediccion,
  type AnalisisTendencia,
  type MetricasAbogado,
  type DashboardPredictivoData,
} from '@/services/prediccionService';

export interface UsePrediccionReturn {
  analisis: AnalisisPredictivo | null;
  isLoading: boolean;
  error: string | null;
  prediccionesCargadas: boolean;
  predecir: (input: InputPrediccion) => Promise<AnalisisPredictivo | null>;
  limpiarAnalisis: () => void;
}

export interface UseTendenciaReturn {
  tendencias: AnalisisTendencia[];
  isLoading: boolean;
  error: string | null;
  cargarTendencias: (materia?: MateriaAnalisis, periodo?: 'trimestre' | 'semestre' | 'año') => Promise<void>;
}

export interface UseMetricasAbogadoReturn {
  metricas: MetricasAbogado | null;
  isLoading: boolean;
  error: string | null;
  cargarMetricas: (abogadoId: string, nombre: string) => Promise<void>;
}

export interface UseRecomendacionesReturn {
  recomendaciones: Recomendacion[];
  isLoading: boolean;
  error: string | null;
  generar: (analisis: AnalisisPredictivo) => Promise<Recomendacion[]>;
}

export interface UseDashboardPredictivoReturn {
  dashboard: DashboardPredictivoData | null;
  isLoading: boolean;
  error: string | null;
  cargarDashboard: () => Promise<void>;
}

export function usePrediccion(): UsePrediccionReturn {
  const [analisis, setAnalisis] = useState<AnalisisPredictivo | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [prediccionesCargadas, setPrediccionesCargadas] = useState(false);

  const predecir = useCallback(async (input: InputPrediccion): Promise<AnalisisPredictivo | null> => {
    setIsLoading(true);
    setError(null);
    
    try {
      const resultado = await predecirCaso(input);
      setAnalisis(resultado);
      setPrediccionesCargadas(true);
      return resultado;
    } catch (err) {
      const mensaje = err instanceof Error ? err.message : 'Error al generar predicción';
      setError(mensaje);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const limpiarAnalisis = useCallback(() => {
    setAnalisis(null);
    setError(null);
    setPrediccionesCargadas(false);
  }, []);

  return {
    analisis,
    isLoading,
    error,
    prediccionesCargadas,
    predecir,
    limpiarAnalisis,
  };
}

export function useTendencia(): UseTendenciaReturn {
  const [tendencias, setTendencias] = useState<AnalisisTendencia[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const cargarTendencias = useCallback(async (
    materia?: MateriaAnalisis,
    periodo: 'trimestre' | 'semestre' | 'año' = 'año'
  ) => {
    setIsLoading(true);
    setError(null);
    
    try {
      const resultado = await analizarTendencia(materia, periodo);
      setTendencias(resultado);
    } catch (err) {
      const mensaje = err instanceof Error ? err.message : 'Error al cargar tendencias';
      setError(mensaje);
    } finally {
      setIsLoading(false);
    }
  }, []);

  return {
    tendencias,
    isLoading,
    error,
    cargarTendencias,
  };
}

export function useMetricasAbogado(): UseMetricasAbogadoReturn {
  const [metricas, setMetricas] = useState<MetricasAbogado | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const cargarMetricas = useCallback(async (abogadoId: string, nombre: string) => {
    setIsLoading(true);
    setError(null);
    
    try {
      const resultado = await obtenerMetricasAbogado(abogadoId, nombre);
      setMetricas(resultado);
    } catch (err) {
      const mensaje = err instanceof Error ? err.message : 'Error al cargar métricas';
      setError(mensaje);
    } finally {
      setIsLoading(false);
    }
  }, []);

  return {
    metricas,
    isLoading,
    error,
    cargarMetricas,
  };
}

export function useRecomendaciones(): UseRecomendacionesReturn {
  const [recomendaciones, setRecomendaciones] = useState<Recomendacion[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const generar = useCallback(async (analisis: AnalisisPredictivo): Promise<Recomendacion[]> => {
    setIsLoading(true);
    setError(null);
    
    try {
      const resultado = await generarRecomendaciones(analisis);
      setRecomendaciones(resultado);
      return resultado;
    } catch (err) {
      const mensaje = err instanceof Error ? err.message : 'Error al generar recomendaciones';
      setError(mensaje);
      return [];
    } finally {
      setIsLoading(false);
    }
  }, []);

  return {
    recomendaciones,
    isLoading,
    error,
    generar,
  };
}

export function useDashboardPredictivo(): UseDashboardPredictivoReturn {
  const [dashboard, setDashboard] = useState<DashboardPredictivoData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const cargarDashboard = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const resultado = await obtenerDashboardPredictivo();
      setDashboard(resultado);
    } catch (err) {
      const mensaje = err instanceof Error ? err.message : 'Error al cargar dashboard';
      setError(mensaje);
    } finally {
      setIsLoading(false);
    }
  }, []);

  return {
    dashboard,
    isLoading,
    error,
    cargarDashboard,
  };
}

export function getExpedientesPorRiesgo(
  analisis: AnalisisPredictivo[]
): Record<CategoriaRiesgo, AnalisisPredictivo[]> {
  return analisis.reduce((acc, item) => {
    const categoria = item.categoriaRiesgo;
    if (!acc[categoria]) {
      acc[categoria] = [];
    }
    acc[categoria].push(item);
    return acc;
  }, {} as Record<CategoriaRiesgo, AnalisisPredictivo[]>);
}

export function getProbabilidadExitoPromedio(analisis: AnalisisPredictivo[]): number {
  if (analisis.length === 0) return 0;
  
  const suma = analisis.reduce((acc, item) => {
    const pred = item.predicciones.find(p => p.tipo === 'probabilidad_exito');
    return acc + (pred?.probabilidad || 0);
  }, 0);
  
  return Math.round((suma / analisis.length) * 100) / 100;
}

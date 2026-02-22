// ============================================
// TIPOS Y DEFINICIONES DE ANÁLISIS PREDICTIVO
// ============================================

// Tipos de predicción
export type TipoPrediccion = 
  | 'resultado_proceso'
  | 'duracion_estimada'
  | 'probabilidad_exito'
  | 'riesgo_procesal'
  | 'coste_estimado'
  | 'sentencia_probable';

// Estados de resolución
export type EstadoResolucion = 
  | 'favorable'
  | 'desfavorable'
  | 'parcial'
  | 'indeterminado';

// Niveles de confianza
export type NivelConfianza = 'alta' | 'media' | 'baja';

// Categorías de riesgo
export type CategoriaRiesgo = 'bajo' | 'medio' | 'alto' | 'critico';

// Tipos de materia para análisis
export type MateriaAnalisis = 'civil' | 'penal' | 'laboral' | 'administrativo' | 'mercantil';

// Estados del modelo predictivo
export type EstadoModelo = 'entrenando' | 'activo' | 'inactivo' | 'error';

// Interface principal de Predicción
export interface Prediccion {
  id: string;
  expedienteId: string;
  tipo: TipoPrediccion;
  valorPredicho: string | number;
  probabilidad: number;
  nivelConfianza: NivelConfianza;
  factoresInfluyentes: FactorInfluyente[];
  fechaPrediccion: Date;
  fechaActualizacion: Date;
  modeloUtilizado: string;
  precisionHistorica?: number;
  validada?: boolean;
  resultadoReal?: EstadoResolucion;
  errorPrediccion?: number;
}

// Factor que influye en una predicción
export interface FactorInfluyente {
  nombre: string;
  impacto: 'positivo' | 'negativo' | 'neutral';
  peso: number;
  descripcion: string;
  valor?: string | number;
}

// Resultado del análisis predictivo
export interface AnalisisPredictivo {
  id: string;
  expedienteId: string;
  numeroExpediente: string;
  materia: MateriaAnalisis;
  predicciones: Prediccion[];
  resumenEjecutivo: string;
  recomendaciones: Recomendacion[];
  fechaAnalisis: Date;
  puntuacionRiesgo: number;
  categoriaRiesgo: CategoriaRiesgo;
  comparacionHistorica?: ComparacionHistorica;
}

// Recomendación basada en análisis
export interface Recomendacion {
  id: string;
  titulo: string;
  descripcion: string;
  prioridad: 'alta' | 'media' | 'baja';
  accionSugerida: string;
  impactoEsperado: string;
  plazo?: string;
}

// Comparación con casos históricos similares
export interface ComparacionHistorica {
  casosSimilares: number;
  casosGanados: number;
  casosPerdidos: number;
  casosParciales: number;
  duracionMedia: number;
  costeMedio: number;
  porcentajeExito: number;
}

// Modelo predictivo
export interface ModeloPredictivo {
  id: string;
  nombre: string;
  descripcion: string;
  tipo: TipoPrediccion;
  estado: EstadoModelo;
  precision: number;
  fechaEntrenamiento: Date;
  ultimasMetricas: MetricasModelo;
  variablesUtilizadas: string[];
  casosEntrenamiento: number;
  rendimiento: RendimientoModelo;
}

// Métricas del modelo
export interface MetricasModelo {
  precision: number;
  exhaustividad: number;
  puntuacionF1: number;
  aucRoc: number;
  matrizConfusion?: MatrizConfusion;
}

// Matriz de confusión
export interface MatrizConfusion {
  verdaderosPositivos: number;
  falsosPositivos: number;
  verdaderosNegativos: number;
  falsosNegativos: number;
}

// Rendimiento del modelo
export interface RendimientoModelo {
  tiempoInferencia: number;
  prediccionesTotales: number;
  prediccionesUltimoMes: number;
  tasaError: number;
  estabilidad: number;
}

// Estadísticas predictivas
export interface EstadisticasPredictivas {
  totalPredicciones: number;
  prediccionesEsteMes: number;
  prediccionesValidadas: number;
  precisionMedia: number;
  tasaAciertos: number;
  prediccionesPorTipo: Record<TipoPrediccion, number>;
  prediccionesPorMateria: Record<MateriaAnalisis, number>;
  distribucionRiesgo: Record<CategoriaRiesgo, number>;
  tendenciaPrecision: Tendencia[];
}

// Tendencia temporal
export interface Tendencia {
  fecha: Date;
  valor: number;
  periodo: string;
}

// Configuración del módulo predictivo
export interface ConfiguracionPredictiva {
  modelosHabilitados: TipoPrediccion[];
  umbralConfianzaMinimo: number;
  actualizarAutomaticamente: boolean;
  frecuenciaActualizacion: 'diaria' | 'semanal' | 'mensual';
  incluirFactoresExternos: boolean;
  notificacionesHabilitadas: boolean;
  umbralesRiesgo: UmbralesRiesgo;
}

// Umbrales de riesgo
export interface UmbralesRiesgo {
  critico: number;
  alto: number;
  medio: number;
}

// Alerta predictiva
export interface AlertaPredictiva {
  id: string;
  expedienteId: string;
  tipo: TipoPrediccion;
  mensaje: string;
  nivel: 'info' | 'warning' | 'critical';
  fechaGeneracion: Date;
  leida: boolean;
  accionada: boolean;
  detalles?: Record<string, unknown>;
}

// Filtros para búsquedas
export interface FiltrosPrediccion {
  tipo?: TipoPrediccion;
  materia?: MateriaAnalisis;
  categoriaRiesgo?: CategoriaRiesgo;
  nivelConfianza?: NivelConfianza;
  fechaDesde?: Date;
  fechaHasta?: Date;
  validada?: boolean;
}

// Dashboard predictivo
export interface DashboardPredictivo {
  resumen: ResumenPredictivo;
  prediccionesRecientes: Prediccion[];
  alertasPendientes: AlertaPredictiva[];
  graficos: GraficosPredictivos;
  metricasClave: MetricasClave;
}

// Resumen ejecutivo
export interface ResumenPredictivo {
  totalExpedientesAnalizados: number;
  expedientesAltoRiesgo: number;
  probabilidadExitoMedia: number;
  duracionEstimadaMedia: number;
  ahorroPotencial: number;
}

// Gráficos del dashboard
export interface GraficosPredictivos {
  tendenciaExito: Tendencia[];
  distribucionRiesgo: Record<CategoriaRiesgo, number>;
  comparativaMaterias: Record<MateriaAnalisis, number>;
  evolucionPrecision: Tendencia[];
}

// Métricas clave
export interface MetricasClave {
  precisionModelo: number;
  tasaPrediccionesExitosas: number;
  reduccionCostes: number;
  tiempoPromedioResolucion: number;
}

// Histórico de predicciones
export interface HistorialPrediccion {
  id: string;
  prediccionId: string;
  valorAnterior: string | number;
  valorNuevo: string | number;
  fechaCambio: Date;
  motivo: string;
}

// Resultado de validación
export interface ValidacionPrediccion {
  id: string;
  prediccionId: string;
  resultadoReal: EstadoResolucion;
  fechaValidacion: Date;
  validadaPor: string;
  comentarios?: string;
  diferencia?: number;
}

// ============================================
// CONFIGURACIÓN POR DEFECTO
// ============================================

export const CONFIGURACION_PREDICTIVA_DEFAULT: ConfiguracionPredictiva = {
  modelosHabilitados: ['resultado_proceso', 'duracion_estimada', 'probabilidad_exito', 'riesgo_procesal'],
  umbralConfianzaMinimo: 0.6,
  actualizarAutomaticamente: true,
  frecuenciaActualizacion: 'semanal',
  incluirFactoresExternos: true,
  notificacionesHabilitadas: true,
  umbralesRiesgo: {
    critico: 0.8,
    alto: 0.6,
    medio: 0.4,
  },
};

export const MATERIAS_PREDICCION: { valor: MateriaAnalisis; label: string }[] = [
  { valor: 'civil', label: 'Civil' },
  { valor: 'penal', label: 'Penal' },
  { valor: 'laboral', label: 'Laboral' },
  { valor: 'administrativo', label: 'Administrativo' },
  { valor: 'mercantil', label: 'Mercantil' },
];

// ============================================
// HELPERS
// ============================================

export function getCategoriaRiesgoColor(categoria: CategoriaRiesgo): string {
  switch (categoria) {
    case 'bajo':
      return 'bg-emerald-500/20 text-emerald-500 border-emerald-500/30';
    case 'medio':
      return 'bg-amber-500/20 text-amber-500 border-amber-500/30';
    case 'alto':
      return 'bg-orange-500/20 text-orange-500 border-orange-500/30';
    case 'critico':
      return 'bg-red-500/20 text-red-500 border-red-500/30 animate-pulse';
    default:
      return 'bg-slate-500/20 text-slate-400';
  }
}

export function getCategoriaRiesgoTexto(categoria: CategoriaRiesgo): string {
  switch (categoria) {
    case 'bajo':
      return 'Bajo';
    case 'medio':
      return 'Medio';
    case 'alto':
      return 'Alto';
    case 'critico':
      return 'Crítico';
    default:
      return categoria;
  }
}

export function getNivelConfianzaColor(nivel: NivelConfianza): string {
  switch (nivel) {
    case 'alta':
      return 'bg-emerald-500/20 text-emerald-500 border-emerald-500/30';
    case 'media':
      return 'bg-amber-500/20 text-amber-500 border-amber-500/30';
    case 'baja':
      return 'bg-red-500/20 text-red-500 border-red-500/30';
    default:
      return 'bg-slate-500/20 text-slate-400';
  }
}

export function getNivelConfianzaTexto(nivel: NivelConfianza): string {
  switch (nivel) {
    case 'alta':
      return 'Alta';
    case 'media':
      return 'Media';
    case 'baja':
      return 'Baja';
    default:
      return nivel;
  }
}

export function getTipoPrediccionLabel(tipo: TipoPrediccion): string {
  switch (tipo) {
    case 'resultado_proceso':
      return 'Resultado del Proceso';
    case 'duracion_estimada':
      return 'Duración Estimada';
    case 'probabilidad_exito':
      return 'Probabilidad de Éxito';
    case 'riesgo_procesal':
      return 'Riesgo Procesal';
    case 'coste_estimado':
      return 'Coste Estimado';
    case 'sentencia_probable':
      return 'Sentencia Probable';
    default:
      return tipo;
  }
}

export function getTipoPrediccionIcon(tipo: TipoPrediccion): string {
  switch (tipo) {
    case 'resultado_proceso':
      return 'Gavel';
    case 'duracion_estimada':
      return 'Clock';
    case 'probabilidad_exito':
      return 'TrendingUp';
    case 'riesgo_procesal':
      return 'AlertTriangle';
    case 'coste_estimado':
      return 'DollarSign';
    case 'sentencia_probable':
      return 'FileText';
    default:
      return 'Brain';
  }
}

export function getEstadoResolucionColor(estado: EstadoResolucion): string {
  switch (estado) {
    case 'favorable':
      return 'bg-emerald-500/20 text-emerald-500 border-emerald-500/30';
    case 'desfavorable':
      return 'bg-red-500/20 text-red-500 border-red-500/30';
    case 'parcial':
      return 'bg-amber-500/20 text-amber-500 border-amber-500/30';
    case 'indeterminado':
      return 'bg-slate-500/20 text-slate-400 border-slate-500/30';
    default:
      return 'bg-slate-500/20 text-slate-400';
  }
}

export function getEstadoResolucionTexto(estado: EstadoResolucion): string {
  switch (estado) {
    case 'favorable':
      return 'Favorable';
    case 'desfavorable':
      return 'Desfavorable';
    case 'parcial':
      return 'Parcial';
    case 'indeterminado':
      return 'Indeterminado';
    default:
      return estado;
  }
}

export function calcularPuntuacionRiesgo(
  probabilidad: number,
  impacto: number,
  incertidumbre: number
): number {
  return Math.min(1, probabilidad * impacto * (1 + incertidumbre));
}

export function determinarCategoriaRiesgo(
  puntuacion: number,
  umbrales: UmbralesRiesgo
): CategoriaRiesgo {
  if (puntuacion >= umbrales.critico) return 'critico';
  if (puntuacion >= umbrales.alto) return 'alto';
  if (puntuacion >= umbrales.medio) return 'medio';
  return 'bajo';
}

export function formatearProbabilidad(probabilidad: number): string {
  return `${Math.round(probabilidad * 100)}%`;
}

export function formatearDuracion(dias: number): string {
  if (dias < 30) return `${dias} días`;
  const meses = Math.floor(dias / 30);
  const diasRestantes = dias % 30;
  if (meses < 12) {
    return diasRestantes > 0 ? `${meses} meses ${diasRestantes} días` : `${meses} meses`;
  }
  const anos = Math.floor(meses / 12);
  const mesesRestantes = meses % 12;
  if (mesesRestantes > 0) {
    return `${anos} año${anos > 1 ? 's' : ''} ${mesesRestantes} meses`;
  }
  return `${anos} año${anos > 1 ? 's' : ''}`;
}

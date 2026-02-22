/**
 * Servicio de Análisis Predictivo de Casos Legales
 * 
 * Proporciona predicciones sobre duración, resultado, costos y riesgos
 * basados en datos históricos y características del caso.
 */

import {
  getCategoriaRiesgoTexto,
  formatearDuracion,
  formatearProbabilidad,
} from '@/types/prediccion';
import type {
  Prediccion,
  AnalisisPredictivo,
  FactorInfluyente,
  Recomendacion,
  MateriaAnalisis,
  CategoriaRiesgo,
  NivelConfianza,
} from '@/types/prediccion';

const CONFIG = {
  USE_MOCK: true,
  MOCK_DELAY: 300,
};

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function generarId(): string {
  return `PRED-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

export interface InputPrediccion {
  expedienteId: string;
  numeroExpediente: string;
  materia: MateriaAnalisis;
  tipoProcedimiento?: string;
  complejidad?: 'baja' | 'media' | 'alta' | 'muy_alta';
  estado?: string;
  plazosPendientes?: number;
  partesContrarias?: number;
}

function calcularDuracionBase(materia: MateriaAnalisis | undefined): number {
  const duracionesBase: Record<MateriaAnalisis, number> = {
    civil: 180,
    penal: 365,
    laboral: 120,
    administrativo: 240,
    mercantil: 300,
  };
  return materia ? duracionesBase[materia] || 180 : 180;
}

function calcularTasaExitoBase(
  materia: MateriaAnalisis | undefined,
  estado: string | undefined
): number {
  const tasasBase: Record<MateriaAnalisis, number> = {
    civil: 0.65,
    penal: 0.45,
    laboral: 0.70,
    administrativo: 0.55,
    mercantil: 0.60,
  };

  let tasaBase = materia ? tasasBase[materia] || 0.50 : 0.50;

  if (estado === 'archivado' || estado === 'desestimado') {
    tasaBase *= 0.3;
  } else if (estado === 'en_tramite') {
    tasaBase *= 1.1;
  }

  return Math.min(0.95, Math.max(0.05, tasaBase));
}

function estimarCostos(
  materia: MateriaAnalisis | undefined,
  complejidad: string | undefined
): { minimo: number; maximo: number; probable: number; honorarios: number; tasas: number; otrosCostos: number } {
  const costosBase: Record<MateriaAnalisis, number> = {
    civil: 2500,
    penal: 4000,
    laboral: 1800,
    administrativo: 3500,
    mercantil: 5000,
  };

  const multiplicadorComplejidad: Record<string, number> = {
    baja: 0.7,
    media: 1.0,
    alta: 1.5,
    muy_alta: 2.0,
  };

  const base = materia ? costosBase[materia] || 3000 : 3000;
  const mult = complejidad ? multiplicadorComplejidad[complejidad] || 1.0 : 1.0;
  const probable = base * mult;
  const tasas = probable * 0.08;
  const honorarios = probable * 0.65;
  const otros = probable * 0.27;

  return {
    minimo: Math.round(probable * 0.6),
    maximo: Math.round(probable * 1.4),
    probable: Math.round(probable),
    honorarios: Math.round(honorarios),
    tasas: Math.round(tasas),
    otrosCostos: Math.round(otros),
  };
}

function identificarFactoresRiesgo(
  input: InputPrediccion,
  probabilidadFavorable: number
): FactorInfluyente[] {
  const factores: FactorInfluyente[] = [];

  if (probabilidadFavorable < 0.5) {
    factores.push({
      nombre: 'Baja probabilidad de éxito',
      impacto: 'negativo',
      peso: 0.35,
      descripcion: 'Basado en precedentes similares, la probabilidad de resultado favorable es inferior al 50%',
    });
  }

  if (input.plazosPendientes && input.plazosPendientes > 5) {
    factores.push({
      nombre: 'Complejidad procesal',
      impacto: 'negativo',
      peso: 0.2,
      descripcion: 'Múltiples plazos procesales pendientes aumentan el riesgo de errores procedimentales',
    });
  }

  if (input.partesContrarias && input.partesContrarias > 1) {
    factores.push({
      nombre: 'Múltiples partes',
      impacto: 'negativo',
      peso: 0.15,
      descripcion: 'La presencia de múltiples partes contrarias incrementa la complejidad del caso',
    });
  }

  if (input.complejidad === 'alta' || input.complejidad === 'muy_alta') {
    factores.push({
      nombre: 'Alta complejidad',
      impacto: 'negativo',
      peso: 0.25,
      descripcion: 'La complejidad alta del caso incrementa tiempo y costos estimados',
    });
  }

  factores.push({
    nombre: 'Carga judicial',
    impacto: 'neutral',
    peso: 0.05,
    descripcion: 'La carga actual de los tribunales puede afectar los tiempos de resolución',
  });

  return factores;
}

function calcularNivelConfianza(confianza: number): NivelConfianza {
  if (confianza >= 0.75) return 'alta';
  if (confianza >= 0.5) return 'media';
  return 'baja';
}

export async function predecirCaso(input: InputPrediccion): Promise<AnalisisPredictivo> {
  if (CONFIG.USE_MOCK) {
    await delay(CONFIG.MOCK_DELAY);
    return generarPrediccionMock(input);
  }

  return generarPrediccionMock(input);
}

function generarPrediccionMock(input: InputPrediccion): AnalisisPredictivo {
  const duracionBase = calcularDuracionBase(input.materia);
  const complejidad = input.complejidad;
  
  const duracionEstimada = duracionBase;
  const tasaExito = calcularTasaExitoBase(input.materia, input.estado);
  const costosEstimados = estimarCostos(input.materia, complejidad);
  const factoresRiesgo = identificarFactoresRiesgo(input, tasaExito);

  const puntuacionRiesgo = Math.min(1, (1 - tasaExito) * 1.2);
  let categoriaRiesgo: CategoriaRiesgo = 'bajo';
  if (puntuacionRiesgo >= 0.8) categoriaRiesgo = 'critico';
  else if (puntuacionRiesgo >= 0.6) categoriaRiesgo = 'alto';
  else if (puntuacionRiesgo >= 0.4) categoriaRiesgo = 'medio';

  const predicciones: Prediccion[] = [
    {
      id: generarId(),
      expedienteId: input.expedienteId,
      tipo: 'duracion_estimada',
      valorPredicho: formatearDuracion(duracionEstimada),
      probabilidad: 0.75,
      nivelConfianza: 'media',
      factoresInfluyentes: factoresRiesgo.filter(f => f.impacto === 'negativo'),
      fechaPrediccion: new Date(),
      fechaActualizacion: new Date(),
      modeloUtilizado: 'legal-predict-v2',
      precisionHistorica: 0.72,
    },
    {
      id: generarId(),
      expedienteId: input.expedienteId,
      tipo: 'probabilidad_exito',
      valorPredicho: formatearProbabilidad(tasaExito),
      probabilidad: tasaExito,
      nivelConfianza: calcularNivelConfianza(tasaExito),
      factoresInfluyentes: factoresRiesgo,
      fechaPrediccion: new Date(),
      fechaActualizacion: new Date(),
      modeloUtilizado: 'legal-predict-v2',
      precisionHistorica: 0.68,
    },
    {
      id: generarId(),
      expedienteId: input.expedienteId,
      tipo: 'coste_estimado',
      valorPredicho: `${costosEstimados.minimo} - ${costosEstimados.maximo} €`,
      probabilidad: 0.7,
      nivelConfianza: 'media',
      factoresInfluyentes: factoresRiesgo.filter(f => f.nombre.includes('complejidad')),
      fechaPrediccion: new Date(),
      fechaActualizacion: new Date(),
      modeloUtilizado: 'legal-predict-v2',
      precisionHistorica: 0.65,
    },
    {
      id: generarId(),
      expedienteId: input.expedienteId,
      tipo: 'riesgo_procesal',
      valorPredicho: getCategoriaRiesgoTexto(categoriaRiesgo),
      probabilidad: puntuacionRiesgo,
      nivelConfianza: 'alta',
      factoresInfluyentes: factoresRiesgo,
      fechaPrediccion: new Date(),
      fechaActualizacion: new Date(),
      modeloUtilizado: 'legal-predict-v2',
      precisionHistorica: 0.70,
    },
  ];

  const recomendaciones: Recomendacion[] = [];

  if (tasaExito < 0.5) {
    recomendaciones.push({
      id: generarId(),
      titulo: 'Considerar estrategia de acuerdo',
      descripcion: 'La probabilidad de resultado favorable es inferior al 50%. Se recomienda evaluar opciones de acuerdo o mediación.',
      prioridad: 'alta',
      accionSugerida: 'Contactar a la parte contraria para explorar negociación',
      impactoEsperado: 'Reducción de costos y tiempo',
    });
  }

  if (factoresRiesgo.some(f => f.peso >= 0.3)) {
    recomendaciones.push({
      id: generarId(),
      titulo: 'Revisar estrategia por factores de riesgo',
      descripcion: 'Se han identificado factores de riesgo significativos que pueden afectar el resultado del caso.',
      prioridad: 'alta',
      accionSugerida: 'Programar reunión para revisar estrategia',
      impactoEsperado: 'Mitigación de riesgos identificados',
    });
  }

  if (duracionEstimada > 365) {
    recomendaciones.push({
      id: generarId(),
      titulo: 'Planificar para duración extendida',
      descripcion: 'La duración estimada del caso supera el año. Preparar estrategia de largo plazo.',
      prioridad: 'media',
      accionSugerida: 'Revisar recursos disponibles para caso prolongado',
      impactoEsperado: 'Mejor gestión de expectativas',
    });
  }

  return {
    id: generarId(),
    expedienteId: input.expedienteId,
    numeroExpediente: input.numeroExpediente,
    materia: input.materia,
    predicciones,
    resumenEjecutivo: `Análisis predictivo del caso ${input.numeroExpediente}. Probabilidad de éxito: ${formatearProbabilidad(tasaExito)}. Duración estimada: ${formatearDuracion(duracionEstimada)}. Categoría de riesgo: ${getCategoriaRiesgoTexto(categoriaRiesgo)}.`,
    recomendaciones,
    fechaAnalisis: new Date(),
    puntuacionRiesgo,
    categoriaRiesgo,
    comparacionHistorica: {
      casosSimilares: Math.floor(10 + Math.random() * 40),
      casosGanados: Math.floor(5 + Math.random() * 20),
      casosPerdidos: Math.floor(3 + Math.random() * 10),
      casosParciales: Math.floor(2 + Math.random() * 8),
      duracionMedia: Math.floor(90 + Math.random() * 120),
      costeMedio: Math.floor(2000 + Math.random() * 3000),
      porcentajeExito: Math.round(tasaExito * 100) / 100,
    },
  };
}

export interface AnalisisTendencia {
  periodo: string;
  casosTotales: number;
  casosExitosos: number;
  tasaExito: number;
  duracionPromedio: number;
  costoPromedio: number;
}

export async function analizarTendencia(
  _materia: MateriaAnalisis | undefined,
  periodo: 'trimestre' | 'semestre' | 'año' = 'año'
): Promise<AnalisisTendencia[]> {
  if (CONFIG.USE_MOCK) {
    await delay(CONFIG.MOCK_DELAY);
  }

  const periodos: AnalisisTendencia[] = [];
  const meses = periodo === 'trimestre' ? 3 : periodo === 'semestre' ? 6 : 12;
  const ahora = new Date();

  for (let i = meses - 1; i >= 0; i--) {
    const fecha = new Date(ahora.getFullYear(), ahora.getMonth() - i, 1);
    const casosTotales = Math.floor(20 + Math.random() * 30);
    const casosExitosos = Math.floor(casosTotales * (0.55 + Math.random() * 0.25));

    periodos.push({
      periodo: fecha.toISOString().slice(0, 7),
      casosTotales,
      casosExitosos,
      tasaExito: Math.round((casosExitosos / casosTotales) * 100) / 100,
      duracionPromedio: Math.floor(90 + Math.random() * 120),
      costoPromedio: Math.floor(2000 + Math.random() * 3000),
    });
  }

  return periodos;
}

export interface MetricasAbogado {
  abogadoId: string;
  abogadoNombre: string;
  casosAnalizados: number;
  tasaExitoHistorica: number;
  duracionPromedioCasos: number;
  costoPromedioCasos: number;
  especialidadPrincipal: MateriaAnalisis;
  especialidades: MateriaAnalisis[];
  casosPorEspecialidad: Record<MateriaAnalisis, { total: number; exitosos: number; tasaExito: number }>;
}

export async function obtenerMetricasAbogado(
  abogadoId: string,
  nombre: string
): Promise<MetricasAbogado> {
  if (CONFIG.USE_MOCK) {
    await delay(CONFIG.MOCK_DELAY);
  }

  const materias: MateriaAnalisis[] = ['civil', 'penal', 'laboral', 'administrativo', 'mercantil'];
  const especialidadPrincipal = materias[Math.floor(Math.random() * materias.length)];
  
  const casosPorEspecialidad: Record<MateriaAnalisis, { total: number; exitosos: number; tasaExito: number }> = {
    civil: { total: 0, exitosos: 0, tasaExito: 0 },
    penal: { total: 0, exitosos: 0, tasaExito: 0 },
    laboral: { total: 0, exitosos: 0, tasaExito: 0 },
    administrativo: { total: 0, exitosos: 0, tasaExito: 0 },
    mercantil: { total: 0, exitosos: 0, tasaExito: 0 },
  };

  materias.forEach((materia) => {
    const total = Math.floor(5 + Math.random() * 20);
    const exitosos = Math.floor(total * (0.5 + Math.random() * 0.35));
    casosPorEspecialidad[materia] = {
      total,
      exitosos,
      tasaExito: Math.round((exitosos / total) * 100) / 100,
    };
  });

  const casosAnalizados = Object.values(casosPorEspecialidad).reduce(
    (acc, val) => acc + val.total,
    0
  );
  const exitososTotales = Object.values(casosPorEspecialidad).reduce(
    (acc, val) => acc + val.exitosos,
    0
  );

  return {
    abogadoId,
    abogadoNombre: nombre,
    casosAnalizados,
    tasaExitoHistorica: Math.round((exitososTotales / casosAnalizados) * 100) / 100,
    duracionPromedioCasos: Math.floor(90 + Math.random() * 90),
    costoPromedioCasos: Math.floor(2500 + Math.random() * 2500),
    especialidadPrincipal,
    especialidades: materias,
    casosPorEspecialidad,
  };
}

export async function generarRecomendaciones(
  analisis: AnalisisPredictivo
): Promise<Recomendacion[]> {
  if (CONFIG.USE_MOCK) {
    await delay(CONFIG.MOCK_DELAY);
  }

  const recomendaciones: Recomendacion[] = [...analisis.recomendaciones];

  const prediccionExito = analisis.predicciones.find(p => p.tipo === 'probabilidad_exito');
  if (prediccionExito && prediccionExito.probabilidad < 0.5) {
    recomendaciones.push({
      id: generarId(),
      titulo: 'Evaluar opciones extrajudiciales',
      descripcion: 'Dado el análisis predictivo, explorar soluciones alternativas antes de proseguir con el proceso judicial.',
      prioridad: 'alta',
      accionSugerida: 'Consultar con el cliente sobre opciones de mediación o negociación',
      impactoEsperado: 'Reducción significativa de costos y tiempo',
    });
  }

  if (analisis.categoriaRiesgo === 'alto' || analisis.categoriaRiesgo === 'critico') {
    recomendaciones.push({
      id: generarId(),
      titulo: 'Plan de mitigación de riesgos',
      descripcion: 'El caso presenta riesgos significativos. Se recomienda documentar exhaustivamente todas las actuaciones.',
      prioridad: 'alta',
      accionSugerida: 'Crear checklist de documentación y plazos críticos',
      impactoEsperado: 'Reducción de riesgos procesales',
    });
  }

  return recomendaciones;
}

export interface DashboardPredictivoData {
  totalExpedientes: number;
  altoRiesgo: number;
  probabilidadExitoPromedio: number;
  duracionMediaEstimada: number;
  tendenciaExito: AnalisisTendencia[];
  casosRecientes: AnalisisPredictivo[];
}

export async function obtenerDashboardPredictivo(): Promise<DashboardPredictivoData> {
  if (CONFIG.USE_MOCK) {
    await delay(CONFIG.MOCK_DELAY);
  }

  const materias: MateriaAnalisis[] = ['civil', 'penal', 'laboral', 'administrativo', 'mercantil'];
  const casosRecientes: AnalisisPredictivo[] = [];
  const totalExpedientes = Math.floor(50 + Math.random() * 100);

  for (let i = 0; i < 10; i++) {
    const materia = materias[Math.floor(Math.random() * materias.length)];
    casosRecientes.push(await predecirCaso({
      expedienteId: `EXP-${1000 + i}`,
      numeroExpediente: `EXP-${2024}-${1000 + i}`,
      materia,
      complejidad: ['baja', 'media', 'alta'][Math.floor(Math.random() * 3)] as 'baja' | 'media' | 'alta',
    }));
  }

  const altoRiesgo = casosRecientes.filter(c => 
    c.categoriaRiesgo === 'alto' || c.categoriaRiesgo === 'critico'
  ).length;

  const probabilidadExitoPromedio = casosRecientes.reduce((acc, c) => {
    const pred = c.predicciones.find(p => p.tipo === 'probabilidad_exito');
    return acc + (pred?.probabilidad || 0);
  }, 0) / casosRecientes.length;

  const duracionMediaEstimada = Math.floor(120 + Math.random() * 120);

  return {
    totalExpedientes,
    altoRiesgo,
    probabilidadExitoPromedio: Math.round(probabilidadExitoPromedio * 100) / 100,
    duracionMediaEstimada,
    tendenciaExito: await analizarTendencia(undefined, 'año'),
    casosRecientes,
  };
}

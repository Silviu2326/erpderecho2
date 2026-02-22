export type TipoTurno = 'penal' | 'civil' | 'extranjeria' | 'violencia_genero' | 'menores';

export type TipoGuardia = 'presencial' | 'localizable';

export type EstadoTurno = 'asignado' | 'confirmado' | 'completado' | 'cancelado';

export type TipoActuacion = 
  | 'detenido'
  | 'declaracion'
  | 'juicio_rapido'
  | 'orden_proteccion'
  | 'asistencia_detencion'
  | 'reconocimiento'
  | 'recursos'
  | 'otro';

export interface Turno {
  id: string;
  tipo: TipoTurno;
  partidoJudicial: string;
  fechaInicio: string;
  fechaFin: string;
  abogadoId: string;
  abogadoNombre: string;
  estado: EstadoTurno;
  observaciones?: string;
}

export interface Guardia {
  id: string;
  turnoId: string;
  fecha: string;
  horaInicio: string;
  horaFin: string;
  tipo: TipoGuardia;
  confirmada: boolean;
}

export interface ActuacionOficio {
  id: string;
  turnoId: string;
  expedienteId?: string;
  tipoActuacion: TipoActuacion;
  Juzgado: string;
  numeroProcedimiento: string;
  fecha: string;
  horaInicio: string;
  horaFin: string;
  detenidoNombre?: string;
  delito?: string;
  resultado: string;
  observaciones?: string;
  importe?: number;
  Facturada: boolean;
}

export interface AbogadoOficio {
  id: string;
  nombre: string;
  numeroColegiado: string;
  TurnosInscritos: TipoTurno[];
  disponibilidad: boolean;
}

export interface PartidoJudicial {
  id: string;
  nombre: string;
  provincia: string;
  turnosDisponibles: TipoTurno[];
}

export interface ConfiguracionTurnos {
  partidoJudicial: string;
  rotacionAutomatica: boolean;
  frecuenciaRotacion: 'semanal' | 'quincenal' | 'mensual';
  incompatibleConsecutivas: boolean;
  alertaHorasAntes: number;
}

export const TIPO_TURNO_CONFIG: Record<TipoTurno, { label: string; color: string; bgColor: string }> = {
  penal: { label: 'Penal', color: 'text-red-400', bgColor: 'bg-red-500/10' },
  civil: { label: 'Civil', color: 'text-blue-400', bgColor: 'bg-blue-500/10' },
  extranjeria: { label: 'Extranjería', color: 'text-green-400', bgColor: 'bg-green-500/10' },
  violencia_genero: { label: 'Violencia de Género', color: 'text-pink-400', bgColor: 'bg-pink-500/10' },
  menores: { label: 'Menores', color: 'text-amber-400', bgColor: 'bg-amber-500/10' },
};

export const TIPO_ACTUACION_LABELS: Record<TipoActuacion, string> = {
  detenido: 'Detención',
  declaracion: 'Declaración',
  juicio_rapido: 'Juicio Rápido',
  orden_proteccion: 'Orden de Protección',
  asistencia_detencion: 'Asistencia a Detenido',
  reconocimiento: 'Reconocimiento',
  recursos: 'Recursos',
  otro: 'Otro',
};

export const TIPO_GUARDIA_LABELS: Record<TipoGuardia, string> = {
  presencial: 'Presencial',
  localizable: 'Localizable',
};

export interface EstadisticasOficio {
  totalActuaciones: number;
  actuacionesEsteMes: number;
  ingresosOficio: number;
  horasDedicadas: number;
  actuacionesPorTipo: Record<TipoActuacion, number>;
  actuacionesPorAbogado: Record<string, number>;
  actuacionesPorMes: { mes: string; cantidad: number }[];
  ingresosPorMes: { mes: string; importe: number }[];
  tiposDelitoMasFrecuentes: { delito: string; cantidad: number }[];
  juzgadosMasActivos: { juzgado: string; cantidad: number }[];
  comparacionIngresos: { oficio: number; privado: number };
  horasPorMes: { mes: string; horas: number }[];
}

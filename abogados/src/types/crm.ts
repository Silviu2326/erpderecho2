export type EtapaPipeline =
  | 'nuevo'
  | 'contactado'
  | 'reunion'
  | 'propuesta'
  | 'negociacion'
  | 'ganado'
  | 'perdido';

export type FuenteCaptacion =
  | 'web'
  | 'referido'
  | 'publicidad'
  | 'colegio'
  | 'redes_sociales'
  | 'evento'
  | 'otro';

export type PrioridadLead = 'alta' | 'media' | 'baja';

export type TipoActividad = 'llamada' | 'email' | 'reunion' | 'nota' | 'tarea';

export interface Lead {
  id: string;
  nombre: string;
  email: string;
  telefono: string;
  empresa?: string;
  fuente: FuenteCaptacion;
  etapa: EtapaPipeline;
  valorEstimado: number;
  probabilidad: number;
  prioridad: PrioridadLead;
  abogadoAsignado: string;
  tipoServicio: string;
  notas: string;
  fechaCreacion: string;
  fechaUltimoContacto: string;
  diasEnEtapa: number;
  actividades: ActividadCRM[];
}

export interface ActividadCRM {
  id: string;
  leadId: string;
  tipo: TipoActividad;
  descripcion: string;
  fecha: string;
  resultado?: string;
  proximaAccion?: string;
}

export interface EtapaConfig {
  id: EtapaPipeline;
  nombre: string;
  color: string;
  bgColor: string;
  borderColor: string;
  orden: number;
}

export const ETAPAS_CONFIG: Record<EtapaPipeline, EtapaConfig> = {
  nuevo: { id: 'nuevo', nombre: 'Nuevo Lead', color: 'text-slate-400', bgColor: 'bg-slate-500/10', borderColor: 'border-slate-500/30', orden: 0 },
  contactado: { id: 'contactado', nombre: 'Contactado', color: 'text-blue-400', bgColor: 'bg-blue-500/10', borderColor: 'border-blue-500/30', orden: 1 },
  reunion: { id: 'reunion', nombre: 'Reunión', color: 'text-purple-400', bgColor: 'bg-purple-500/10', borderColor: 'border-purple-500/30', orden: 2 },
  propuesta: { id: 'propuesta', nombre: 'Propuesta Enviada', color: 'text-amber-400', bgColor: 'bg-amber-500/10', borderColor: 'border-amber-500/30', orden: 3 },
  negociacion: { id: 'negociacion', nombre: 'Negociación', color: 'text-orange-400', bgColor: 'bg-orange-500/10', borderColor: 'border-orange-500/30', orden: 4 },
  ganado: { id: 'ganado', nombre: 'Ganado', color: 'text-emerald-400', bgColor: 'bg-emerald-500/10', borderColor: 'border-emerald-500/30', orden: 5 },
  perdido: { id: 'perdido', nombre: 'Perdido', color: 'text-red-400', bgColor: 'bg-red-500/10', borderColor: 'border-red-500/30', orden: 6 },
};

export const ETAPAS_ACTIVAS: EtapaPipeline[] = ['nuevo', 'contactado', 'reunion', 'propuesta', 'negociacion'];
export const ETAPAS_CERRADAS: EtapaPipeline[] = ['ganado', 'perdido'];

export const FUENTES_LABELS: Record<FuenteCaptacion, string> = {
  web: 'Formulario Web',
  referido: 'Referido',
  publicidad: 'Publicidad',
  colegio: 'Colegio de Abogados',
  redes_sociales: 'Redes Sociales',
  evento: 'Evento / Conferencia',
  otro: 'Otro',
};

export interface CRMEstadisticas {
  totalLeads: number;
  leadsEsteMes: number;
  tasaConversion: number;
  valorPipeline: number;
  tiempoMedioConversion: number;
  leadsPorFuente: Record<FuenteCaptacion, number>;
  leadsPorEtapa: Record<EtapaPipeline, number>;
}

export interface RecordatorioCRM {
  id: string;
  leadId: string;
  leadNombre: string;
  etapa: EtapaPipeline;
  diasSinActividad: number;
  limiteEtapa: number;
  abogadoAsignado: string;
  nivel: 'info' | 'warning' | 'critical';
}

export const LIMITES_INACTIVIDAD: Record<EtapaPipeline, number> = {
  nuevo: 3,
  contactado: 5,
  reunion: 7,
  propuesta: 10,
  negociacion: 14,
  ganado: 0,
  perdido: 0,
};

export const ACTIVIDAD_ICONS: Record<TipoActividad, string> = {
  llamada: 'Phone',
  email: 'Mail',
  reunion: 'Users',
  nota: 'FileText',
  tarea: 'CheckSquare',
};

export interface ConversionResult {
  clienteId: string;
  expedienteId?: string;
  nombre: string;
}

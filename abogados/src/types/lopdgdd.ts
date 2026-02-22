// LOPDGDD / GDPR Types
// Registro de Actividades de Tratamiento (RAT)

export type DataCategory =
  | 'identificacion'
  | 'contacto'
  | 'financieros'
  | 'laborales'
  | 'salud'
  | 'condena_penal'
  | 'biometricos'
  | 'localizacion'
  | 'comunicaciones'
  | 'profesional'
  | 'contractual'
  | 'ubicacion';

export type LegalBasis =
  | 'consent'
  | 'contract'
  | 'legal_obligation'
  | 'vital_interests'
  | 'public_task'
  | 'legitimate_interest';

export type DataSubjectType =
  | 'empleados'
  | 'clientes'
  | 'proveedores'
  | 'candidatos'
  | 'contactos'
  | 'usuarios_web'
  | 'otros';

export type InternationalTransferMechanism =
  | 'scc_standard'
  | 'scc_corporate'
  | 'adequacy_decision'
  | 'bcr'
  | 'none';

export interface ResponsibleParty {
  id: string;
  name: string;
  nif: string;
  address: string;
  email: string;
  phone: string;
  dpo: string;
  dpoEmail: string;
}

export interface TreatmentActivity {
  id: string;
  name: string;
  description: string;
  purpose: string;
  legalBasis: LegalBasis;
  legalBasisDescription: string;
  dataCategories: DataCategory[];
  dataSubjects: DataSubjectType[];
  recipients: string[];
  internationalTransfers: boolean;
  transferMechanism?: InternationalTransferMechanism;
  thirdCountry?: string;
  retentionPeriod: string;
  securityMeasures: string;
  automatedDecisions: boolean;
  profiling: boolean;
  lastUpdated: Date;
}

export interface TreatmentActivityInput {
  name: string;
  description: string;
  purpose: string;
  legalBasis: LegalBasis;
  legalBasisDescription: string;
  dataCategories: DataCategory[];
  dataSubjects: DataSubjectType[];
  recipients: string[];
  internationalTransfers: boolean;
  transferMechanism?: InternationalTransferMechanism;
  thirdCountry?: string;
  retentionPeriod: string;
  securityMeasures: string;
  automatedDecisions: boolean;
  profiling: boolean;
}

export const DATA_CATEGORY_LABELS: Record<DataCategory, string> = {
  identificacion: 'Datos de identificación',
  contacto: 'Datos de contacto',
  financieros: 'Datos financieros',
  laborales: 'Datos laborales',
  salud: 'Datos de salud',
  condena_penal: 'Datos de condenas penales',
  biometricos: 'Datos biométricos',
  localizacion: 'Datos de localización',
  comunicaciones: 'Contenido de comunicaciones',
  profesional: 'Datos profesionales',
  contractual: 'Datos contractuales',
  ubicacion: 'Datos de ubicación'
};

export const LEGAL_BASIS_LABELS: Record<LegalBasis, string> = {
  consent: 'Consentimiento del interesado',
  contract: 'Ejecución de contrato',
  legal_obligation: 'Obligación legal',
  vital_interests: 'Intereses vitales',
  public_task: 'Ejecución de tarea pública',
  legitimate_interest: 'Interés legítimo'
};

export const DATA_SUBJECT_LABELS: Record<DataSubjectType, string> = {
  empleados: 'Empleados',
  clientes: 'Clientes',
  proveedores: 'Proveedores',
  candidatos: 'Candidatos',
  contactos: 'Contactos',
  usuarios_web: 'Usuarios web',
  otros: 'Otros'
};

export const TRANSFER_MECHANISM_LABELS: Record<InternationalTransferMechanism, string> = {
  scc_standard: 'Cláusulas contractuales estándar',
  scc_corporate: 'Reglas corporativas vinculantes',
  adequacy_decision: 'Decisión de adecuación',
  bcr: 'Normas corporativas vinculantes (BCR)',
  none: 'Sin transferencia'
};

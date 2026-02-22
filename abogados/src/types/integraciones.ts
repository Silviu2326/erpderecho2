// ============================================
// TIPOS PARA INTEGRACIONES EXTERNAS
// Office 365, Google Workspace, etc.
// ============================================

import type { UserRole } from './roles';

// ============================================
// TIPOS DE PLATAFORMA
// ============================================

export type PlataformaIntegracion = 'office365' | 'google' | 'dropbox' | 'onedrive' | 'googledrive';

export type TipoIntegracion = 
  | 'calendar' 
  | 'email' 
  | 'drive' 
  | 'contacts' 
  | 'auth' 
  | 'documents';

export type EstadoIntegracion = 
  | 'disconnected' 
  | 'connecting' 
  | 'connected' 
  | 'error' 
  | 'expired' 
  | 'syncing';

// ============================================
// AUTENTICACIÓN OAUTH
// ============================================

export interface OAuthConfig {
  clientId: string;
  clientSecret?: string;
  redirectUri: string;
  scope: string[];
  authorizeUrl: string;
  tokenUrl: string;
  refreshUrl: string;
}

export interface TokenOAuth {
  accessToken: string;
  refreshToken?: string;
  tokenType: string;
  expiresAt: number;
  scope?: string[];
  idToken?: string;
}

export interface CredencialesIntegracion {
  plataforma: PlataformaIntegracion;
  token: TokenOAuth;
  userId: string;
  userEmail: string;
  userName?: string;
  fechaConexion: string;
  ultimoRefresh?: string;
}

// ============================================
// CALENDARIO
// ============================================

export interface EventoCalendario {
  id: string;
  plataforma: PlataformaIntegracion;
  idExterno: string;
  titulo: string;
  descripcion?: string;
  inicio: string;
  fin: string;
  ubicacion?: string;
  esTodoElDia: boolean;
  timezone: string;
  asistentes?: AsistenteCalendario[];
  organizer?: OrganizadorCalendario;
  estado: EstadoEventoCalendario;
  urlMeet?: string;
  color?: string;
  recurrence?: RecurrenciaCalendario;
  adjuntos?: AttachmentCalendario[];
  syncStatus: SyncStatus;
  fechaSync?: string;
}

export type EstadoEventoCalendario = 'confirmed' | 'tentative' | 'cancelled';

export interface AsistenteCalendario {
  email: string;
  nombre?: string;
  respuesta: 'accepted' | 'declined' | 'tentative' | 'needsAction';
  esOpcional: boolean;
}

export interface OrganizadorCalendario {
  email: string;
  nombre?: string;
}

export interface RecurrenciaCalendario {
  frecuencia: 'daily' | 'weekly' | 'monthly' | 'yearly';
  intervalo: number;
  hasta?: string;
  diasSemana?: number[];
  diaMes?: number;
  mes?: number;
}

export interface AttachmentCalendario {
  id: string;
  nombre: string;
  url: string;
  tipo: string;
  tamaño?: number;
}

export type SyncStatus = 'synced' | 'pending' | 'conflict' | 'error';

// ============================================
// CORREO ELECTRÓNICO
// ============================================

export interface EmailIntegracion {
  id: string;
  plataforma: PlataformaIntegracion;
  idExterno: string;
  de: DireccionEmail;
  para: DireccionEmail[];
  cc?: DireccionEmail[];
  cco?: DireccionEmail[];
  asunto: string;
  cuerpo: string;
  cuerpoHtml?: string;
  fecha: string;
  leido: boolean;
  importante: boolean;
  adjuntos?: AdjuntoEmail[];
  carpeta: string;
  syncStatus: SyncStatus;
}

export interface DireccionEmail {
  email: string;
  nombre?: string;
}

export interface AdjuntoEmail {
  id: string;
  nombre: string;
  mimeType: string;
  tamaño: number;
  url?: string;
  inline?: boolean;
  contentId?: string;
}

export interface ConfiguracionEmail {
  plataforma: PlataformaIntegracion;
  firma?: string;
  firmaHtml?: string;
  guardarEnviados: boolean;
  carpetaEnviados?: string;
  plantillas?: PlantillaEmail[];
}

export interface PlantillaEmail {
  id: string;
  nombre: string;
  asunto: string;
  cuerpo: string;
  cuerpoHtml?: string;
  adjuntos?: string[];
}

// ============================================
// ARCHIVOS / DRIVE
// ============================================

export interface ArchivoDrive {
  id: string;
  plataforma: PlataformaIntegracion;
  idExterno: string;
  nombre: string;
  tipo: 'file' | 'folder';
  mimeType?: string;
  tamaño?: number;
  fechaCreacion: string;
  fechaModificacion: string;
  modificadoPor?: string;
  ruta?: string;
  idPadre?: string;
  url: string;
  urlPreview?: string;
  thumbnailUrl?: string;
  compartido: boolean;
  permisos?: PermisoArchivo[];
  syncStatus: SyncStatus;
}

export interface PermisoArchivo {
  email: string;
  rol: 'reader' | 'writer' | 'owner' | 'commenter';
  tipo: 'user' | 'group' | 'anyone';
  compartidoPor?: string;
}

export interface CarpetaDrive {
  id: string;
  plataforma: PlataformaIntegracion;
  idExterno: string;
  nombre: string;
  ruta: string;
  idPadre?: string;
  fechaCreacion: string;
  fechaModificacion: string;
  syncStatus: SyncStatus;
}

// ============================================
// CONTACTOS
// ============================================

export interface ContactoIntegracion {
  id: string;
  plataforma: PlataformaIntegracion;
  idExterno: string;
  nombre: string;
  email?: string;
  telefono?: string;
  movil?: string;
  empresa?: string;
  cargo?: string;
  direccion?: DireccionContacto;
  fotoUrl?: string;
  notas?: string;
  grupos?: string[];
  syncStatus: SyncStatus;
}

export interface DireccionContacto {
  calle?: string;
  ciudad?: string;
  provincia?: string;
  cp?: string;
  pais?: string;
}

// ============================================
// SINCRONIZACIÓN
// ============================================

export interface SincronizacionConfig {
  id: string;
  tipoIntegracion: TipoIntegracion;
  plataforma: PlataformaIntegracion;
  activa: boolean;
  direccion: 'push' | 'pull' | 'bidirectional';
  frecuenciaMinutos: number;
  ultimoSync?: string;
  filtros?: SincronizacionFiltro[];
  mapeos?: MapeoCampo[];
}

export interface SincronizacionFiltro {
  campo: string;
  operador: 'equals' | 'contains' | 'startsWith' | 'in';
  valor: string | string[];
}

export interface MapeoCampo {
  campoLocal: string;
  campoExterno: string;
  transform?: 'none' | 'uppercase' | 'lowercase' | 'date' | 'custom';
  funcionCustom?: string;
}

export interface LogSincronizacion {
  id: string;
  configId: string;
  inicio: string;
  fin?: string;
  estado: 'in_progress' | 'completed' | 'failed' | 'partial';
  elementosProcesados: number;
  elementosExitosos: number;
  elementosFallidos: number;
  errores?: ErrorSincronizacion[];
}

export interface ErrorSincronizacion {
  elementoId: string;
  operacion: 'create' | 'update' | 'delete' | 'read';
  mensaje: string;
  codigo?: string;
  fecha: string;
}

// ============================================
// WEBHOOKS Y NOTIFICACIONES
// ============================================

export interface WebhookIntegracion {
  id: string;
  plataforma: PlataformaIntegracion;
  url: string;
  eventos: EventoWebhook[];
  activo: boolean;
  secret?: string;
  ultimoEnvio?: string;
  ultimoEstado?: 'success' | 'failed';
}

export type EventoWebhook = 
  | 'calendar.created' 
  | 'calendar.updated' 
  | 'calendar.deleted'
  | 'email.received'
  | 'email.sent'
  | 'file.created'
  | 'file.updated'
  | 'file.deleted'
  | 'contact.created'
  | 'contact.updated';

// ============================================
// PERMISOS POR ROL
// ============================================

export interface PermisosIntegracion {
  puedeConectar: boolean;
  puedeSincronizar: boolean;
  puedeEnviarEmail: boolean;
  puedeLeerCalendario: boolean;
  puedeEscribirCalendario: boolean;
  puedeLeerDrive: boolean;
  puedeEscribirDrive: boolean;
  puedeVerContactos: boolean;
  plataformasPermitidas: PlataformaIntegracion[];
}

export const PERMISOS_INTEGRACION: Record<UserRole, PermisosIntegracion> = {
  super_admin: {
    puedeConectar: true,
    puedeSincronizar: true,
    puedeEnviarEmail: true,
    puedeLeerCalendario: true,
    puedeEscribirCalendario: true,
    puedeLeerDrive: true,
    puedeEscribirDrive: true,
    puedeVerContactos: true,
    plataformasPermitidas: ['office365', 'google', 'dropbox', 'onedrive', 'googledrive'],
  },
  socio: {
    puedeConectar: true,
    puedeSincronizar: true,
    puedeEnviarEmail: true,
    puedeLeerCalendario: true,
    puedeEscribirCalendario: true,
    puedeLeerDrive: true,
    puedeEscribirDrive: true,
    puedeVerContactos: true,
    plataformasPermitidas: ['office365', 'google'],
  },
  abogado_senior: {
    puedeConectar: true,
    puedeSincronizar: true,
    puedeEnviarEmail: true,
    puedeLeerCalendario: true,
    puedeEscribirCalendario: true,
    puedeLeerDrive: true,
    puedeEscribirDrive: false,
    puedeVerContactos: true,
    plataformasPermitidas: ['office365', 'google'],
  },
  abogado_junior: {
    puedeConectar: false,
    puedeSincronizar: false,
    puedeEnviarEmail: true,
    puedeLeerCalendario: true,
    puedeEscribirCalendario: false,
    puedeLeerDrive: true,
    puedeEscribirDrive: false,
    puedeVerContactos: false,
    plataformasPermitidas: [],
  },
  paralegal: {
    puedeConectar: false,
    puedeSincronizar: false,
    puedeEnviarEmail: false,
    puedeLeerCalendario: false,
    puedeEscribirCalendario: false,
    puedeLeerDrive: false,
    puedeEscribirDrive: false,
    puedeVerContactos: false,
    plataformasPermitidas: [],
  },
  secretario: {
    puedeConectar: true,
    puedeSincronizar: true,
    puedeEnviarEmail: true,
    puedeLeerCalendario: true,
    puedeEscribirCalendario: true,
    puedeLeerDrive: true,
    puedeEscribirDrive: true,
    puedeVerContactos: true,
    plataformasPermitidas: ['office365', 'google'],
  },
  administrador: {
    puedeConectar: true,
    puedeSincronizar: true,
    puedeEnviarEmail: true,
    puedeLeerCalendario: true,
    puedeEscribirCalendario: true,
    puedeLeerDrive: true,
    puedeEscribirDrive: true,
    puedeVerContactos: true,
    plataformasPermitidas: ['office365', 'google', 'dropbox', 'onedrive', 'googledrive'],
  },
  contador: {
    puedeConectar: false,
    puedeSincronizar: false,
    puedeEnviarEmail: false,
    puedeLeerCalendario: false,
    puedeEscribirCalendario: false,
    puedeLeerDrive: false,
    puedeEscribirDrive: false,
    puedeVerContactos: false,
    plataformasPermitidas: [],
  },
  recepcionista: {
    puedeConectar: false,
    puedeSincronizar: false,
    puedeEnviarEmail: false,
    puedeLeerCalendario: false,
    puedeEscribirCalendario: false,
    puedeLeerDrive: false,
    puedeEscribirDrive: false,
    puedeVerContactos: false,
    plataformasPermitidas: [],
  },
};

// ============================================
// CONFIGURACIONES
// ============================================

export const PLATAFORM_INTEGRATION_CONFIG: Record<PlataformaIntegracion, {
  nombre: string;
  icono: string;
  color: string;
  servicios: TipoIntegracion[];
  oauth: OAuthConfig;
}> = {
  office365: {
    nombre: 'Microsoft 365',
    icono: 'Microsoft',
    color: '#0078d4',
    servicios: ['calendar', 'email', 'drive', 'contacts', 'auth'],
    oauth: {
      clientId: '',
      redirectUri: '',
      scope: [
        'openid',
        'profile',
        'offline_access',
        'Calendars.ReadWrite',
        'Mail.ReadWrite',
        'Files.ReadWrite',
        'Contacts.ReadWrite',
      ],
      authorizeUrl: 'https://login.microsoftonline.com/common/oauth2/v2.0/authorize',
      tokenUrl: 'https://login.microsoftonline.com/common/oauth2/v2.0/token',
      refreshUrl: 'https://login.microsoftonline.com/common/oauth2/v2.0/token',
    },
  },
  google: {
    nombre: 'Google Workspace',
    icono: 'Chrome',
    color: '#4285f4',
    servicios: ['calendar', 'email', 'drive', 'contacts', 'auth'],
    oauth: {
      clientId: '',
      redirectUri: '',
      scope: [
        'openid',
        'email',
        'profile',
        'https://www.googleapis.com/auth/calendar',
        'https://www.googleapis.com/auth/gmail.readonly',
        'https://www.googleapis.com/auth/drive',
        'https://www.googleapis.com/auth/contacts',
      ],
      authorizeUrl: 'https://accounts.google.com/o/oauth2/v2/auth',
      tokenUrl: 'https://oauth2.googleapis.com/token',
      refreshUrl: 'https://oauth2.googleapis.com/token',
    },
  },
  dropbox: {
    nombre: 'Dropbox',
    icono: 'Cloud',
    color: '#0061ff',
    servicios: ['drive', 'auth'],
    oauth: {
      clientId: '',
      redirectUri: '',
      scope: ['files.content.read', 'files.content.write'],
      authorizeUrl: 'https://www.dropbox.com/oauth2/authorize',
      tokenUrl: 'https://api.dropboxapi.com/oauth2/token',
      refreshUrl: 'https://api.dropboxapi.com/oauth2/token',
    },
  },
  onedrive: {
    nombre: 'OneDrive',
    icono: 'Cloud',
    color: '#0078d4',
    servicios: ['drive', 'auth'],
    oauth: {
      clientId: '',
      redirectUri: '',
      scope: ['Files.ReadWrite', 'offline_access'],
      authorizeUrl: 'https://login.microsoftonline.com/common/oauth2/v2.0/authorize',
      tokenUrl: 'https://login.microsoftonline.com/common/oauth2/v2.0/token',
      refreshUrl: 'https://login.microsoftonline.com/common/oauth2/v2.0/token',
    },
  },
  googledrive: {
    nombre: 'Google Drive',
    icono: 'HardDrive',
    color: '#4285f4',
    servicios: ['drive', 'auth'],
    oauth: {
      clientId: '',
      redirectUri: '',
      scope: [
        'openid',
        'email',
        'profile',
        'https://www.googleapis.com/auth/drive',
      ],
      authorizeUrl: 'https://accounts.google.com/o/oauth2/v2/auth',
      tokenUrl: 'https://oauth2.googleapis.com/token',
      refreshUrl: 'https://oauth2.googleapis.com/token',
    },
  },
};

// ============================================
// HELPERS
// ============================================

export function getPlataformaNombre(plataforma: PlataformaIntegracion): string {
  return PLATAFORM_INTEGRATION_CONFIG[plataforma]?.nombre || plataforma;
}

export function getPlataformaIcono(plataforma: PlataformaIntegracion): string {
  return PLATAFORM_INTEGRATION_CONFIG[plataforma]?.icono || 'Cloud';
}

export function getPlataformaColor(plataforma: PlataformaIntegracion): string {
  return PLATAFORM_INTEGRATION_CONFIG[plataforma]?.color || '#64748b';
}

export function isTokenExpired(token: TokenOAuth): boolean {
  return Date.now() >= token.expiresAt;
}

export function needsRefresh(token: TokenOAuth, bufferMinutes = 5): boolean {
  const bufferMs = bufferMinutes * 60 * 1000;
  return Date.now() >= token.expiresAt - bufferMs;
}

export function getSyncStatusLabel(status: SyncStatus): string {
  const labels: Record<SyncStatus, string> = {
    synced: 'Sincronizado',
    pending: 'Pendiente',
    conflict: 'Conflicto',
    error: 'Error',
  };
  return labels[status];
}

export function getIntegracionEstadoLabel(estado: EstadoIntegracion): string {
  const labels: Record<EstadoIntegracion, string> = {
    disconnected: 'Desconectado',
    connecting: 'Conectando',
    connected: 'Conectado',
    error: 'Error',
    expired: 'Expirado',
    syncing: 'Sincronizando',
  };
  return labels[estado];
}

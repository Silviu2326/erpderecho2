// ============================================
// TIPOS PARA MARKETPLACE DE INTEGRACIONES
// Catálogo, instalación y gestión de integraciones
// ============================================

export type { PlataformaIntegracion } from './integraciones';


// ============================================
// TIPOS DE MARKETPLACE
// ============================================

export type CategoriaIntegracion = 
  | 'productividad'
  | 'comunicacion'
  | 'almacenamiento'
  | 'facturacion'
  | 'crm'
  | 'legal'
  | 'contabilidad'
  | 'recursos_humanos'
  | 'notificaciones'
  | 'analitica'
  | 'seguridad'
  | 'personalizada';

export type EstadoInstalacion = 
  | 'available'
  | 'installing'
  | 'installed'
  | 'updating'
  | 'uninstalling'
  | 'error'
  | 'requires_config';

export type TipoPrecio = 
  | 'free'
  | 'one_time'
  | 'monthly'
  | 'yearly'
  | 'usage';

export type VisibilidadIntegracion = 
  | 'public'
  | 'private'
  | 'beta'
  | 'deprecated';

// ============================================
// INTEGRACIÓN DEL MARKETPLACE
// ============================================

export interface IntegracionMarketplace {
  id: string;
  clave: string;
  nombre: string;
  descripcion: string;
  descripcionCorta: string;
  icono: string;
  capturas: string[];
  categoria: CategoriaIntegracion;
  proveedor: ProveedorIntegracion;
  precios: PlanPrecio[];
  version: string;
  versionRequeridaApp?: string;
  requisitos?: RequisitosIntegracion;
  permisos: PermisoIntegracionMarketplace[];
  etiquetas: string[];
  compatibilidad: CompatibilidadIntegracion;
  estadisticas: EstadisticasIntegracion;
  valoraciones: ValoracionesIntegracion;
  documentacion?: string;
  sitioWeb?: string;
  estado: VisibilidadIntegracion;
  fechaPublicacion: string;
  ultimaActualizacion: string;
  destacado: boolean;
  oficial: boolean;
}

export interface ProveedorIntegracion {
  id: string;
  nombre: string;
  logo?: string;
  sitioWeb?: string;
  email?: string;
  descripcion?: string;
}

export interface PlanPrecio {
  id: string;
  nombre: string;
  descripcion?: string;
  tipo: TipoPrecio;
  precio?: number;
  moneda?: string;
  periodo?: 'mes' | 'año';
  limites?: LimitesPlan;
  caracteristicas: CaracteristicaPlan[];
  popular?: boolean;
}

export interface LimitesPlan {
  usuarios?: number;
  registros?: number;
  almacenamiento?: number;
  llamadasApi?: number;
}

export interface CaracteristicaPlan {
  nombre: string;
  incluida: boolean;
  limite?: number | string;
}

export interface RequisitosIntegracion {
  minUsuarios?: number;
  requiereSuscripcion?: boolean;
  requiereAdmin?: boolean;
  plataformasSoportadas?: ('web' | 'mobile' | 'desktop')[];
  integracionesRequeridas?: string[];
}

export interface PermisoIntegracionMarketplace {
  nombre: string;
  descripcion: string;
  obligatorio: boolean;
  categoria: 'datos' | 'archivos' | 'calendario' | 'email' | 'usuarios' | 'webhooks';
}

export interface CompatibilidadIntegracion {
  versionesApp: string[];
  navegadores?: string[];
  offline?: boolean;
}

export interface EstadisticasIntegracion {
  instalaciones: number;
  instalacionesActivas: number;
  valoraciones: number;
  reseñas: number;
}

export interface ValoracionesIntegracion {
  promedio: number;
  distribution: Record<1 | 2 | 3 | 4 | 5, number>;
  reseñas: ResenaIntegracion[];
}

export interface ResenaIntegracion {
  id: string;
  usuarioId: string;
  usuarioNombre: string;
  usuarioAvatar?: string;
  calificacion: 1 | 2 | 3 | 4 | 5;
  titulo: string;
  contenido: string;
  pros?: string[];
  contras?: string[];
  utilidad: number;
  fecha: string;
  respuesta?: RespuestaResena;
}

export interface RespuestaResena {
  contenido: string;
  fecha: string;
}

// ============================================
// INSTALACIÓN Y CONFIGURACIÓN
// ============================================

export interface InstalacionIntegracion {
  id: string;
  integracionId: string;
  claveIntegracion: string;
  nombre: string;
  icono: string;
  version: string;
  estado: EstadoInstalacion;
  configuracion?: ConfiguracionIntegracion;
  permisos: PermisoIntegracionMarketplace[];
  instaladoPor: string;
  fechaInstalacion: string;
  fechaActualizacion?: string;
  ultimoUso?: string;
  uso: UsoIntegracion;
  errores?: ErrorIntegracion[];
}

export interface ConfiguracionIntegracion {
  parametros: ParametroConfiguracion[];
  credenciales?: CredencialesMarketplace;
  webhooks?: WebhookConfig[];
  opciones?: Record<string, unknown>;
}

export interface ParametroConfiguracion {
  clave: string;
  valor: string | number | boolean | string[];
  tipo: 'text' | 'number' | 'boolean' | 'select' | 'multiselect' | 'json';
  etiqueta: string;
  descripcion?: string;
  requerido: boolean;
  opciones?: { label: string; value: string }[];
  validacion?: {
    min?: number;
    max?: number;
    patron?: string;
    mensaje?: string;
  };
}

export interface CredencialesMarketplace {
  tipo: 'oauth2' | 'api_key' | 'basic' | 'custom';
  datos?: Record<string, string>;
  fechaExpiracion?: string;
}

export interface WebhookConfig {
  id: string;
  url: string;
  eventos: string[];
  activo: boolean;
  secreto?: string;
}

export interface UsoIntegracion {
  llamadasApi: number;
  limiteLlamadas: number;
  almacenamiento?: number;
  limiteAlmacenamiento?: number;
  resetFecha: string;
}

export interface ErrorIntegracion {
  codigo: string;
  mensaje: string;
  fecha: string;
  detalles?: Record<string, unknown>;
}

// ============================================
// BÚSQUEDA Y FILTROS
// ============================================

export interface FiltrosMarketplace {
  busqueda?: string;
  categorias?: CategoriaIntegracion[];
  precio?: ('free' | 'paid')[];
  valoraciones?: number[];
  etiquetas?: string[];
  oficial?: boolean;
  destacado?: boolean;
  orden?: OrdenMarketplace;
}

export type OrdenMarketplace = 
  | 'populares'
  | 'valoraciones'
  | 'recientes'
  | 'nombre'
  | 'precio_asc'
  | 'precio_desc';

export interface ResultadoBusquedaMarketplace {
  integraciones: IntegracionMarketplace[];
  total: number;
  pagina: number;
  porPagina: number;
  facetas: FacetasBusqueda;
}

export interface FacetasBusqueda {
  categorias: Record<CategoriaIntegracion, number>;
  precios: Record<'free' | 'paid', number>;
  valoraciones: Record<number, number>;
}

// ============================================
// NOTIFICACIONES Y ACTUALIZACIONES
// ============================================

export interface NotificacionMarketplace {
  id: string;
  tipo: 'update_available' | 'new_integration' | 'security' | 'billing' | 'review';
  titulo: string;
  mensaje: string;
  integracionId?: string;
  integracionNombre?: string;
  leida: boolean;
  accionUrl?: string;
  fecha: string;
}

export interface ActualizacionIntegracion {
  id: string;
  integracionId: string;
  version: string;
  versionAnterior: string;
  descripcion: string;
  cambios: CambioActualizacion[];
  fechaPublicacion: string;
  importancia: 'major' | 'minor' | 'patch' | 'security';
  obligatoria: boolean;
  notas?: string;
}

export interface CambioActualizacion {
  tipo: 'added' | 'changed' | 'deprecated' | 'removed' | 'fixed' | 'security';
  descripcion: string;
}

// ============================================
// PERMISOS Y ACCESSO
// ============================================

export interface PermisosMarketplace {
  puedeVer: boolean;
  puedeInstalar: boolean;
  puedeDesinstalar: boolean;
  puedeConfigurar: boolean;
  puedeVerUsage: boolean;
  puedeActualizar: boolean;
}

export const PERMISOS_MARKETPLACE: Record<string, PermisosMarketplace> = {
  super_admin: {
    puedeVer: true,
    puedeInstalar: true,
    puedeDesinstalar: true,
    puedeConfigurar: true,
    puedeVerUsage: true,
    puedeActualizar: true,
  },
  socio: {
    puedeVer: true,
    puedeInstalar: true,
    puedeDesinstalar: true,
    puedeConfigurar: true,
    puedeVerUsage: true,
    puedeActualizar: true,
  },
  administrador: {
    puedeVer: true,
    puedeInstalar: true,
    puedeDesinstalar: true,
    puedeConfigurar: true,
    puedeVerUsage: true,
    puedeActualizar: true,
  },
  default: {
    puedeVer: true,
    puedeInstalar: false,
    puedeDesinstalar: false,
    puedeConfigurar: false,
    puedeVerUsage: false,
    puedeActualizar: false,
  },
};

// ============================================
// HELPERS
// ============================================

export function getCategoriaLabel(categoria: CategoriaIntegracion): string {
  const labels: Record<CategoriaIntegracion, string> = {
    productividad: 'Productividad',
    comunicacion: 'Comunicación',
    almacenamiento: 'Almacenamiento',
    facturacion: 'Facturación',
    crm: 'CRM',
    legal: 'Legal',
    contabilidad: 'Contabilidad',
    recursos_humanos: 'Recursos Humanos',
    notificaciones: 'Notificaciones',
    analitica: 'Analítica',
    seguridad: 'Seguridad',
    personalizada: 'Personalizada',
  };
  return labels[categoria] || categoria;
}

export function getEstadoInstalacionLabel(estado: EstadoInstalacion): string {
  const labels: Record<EstadoInstalacion, string> = {
    available: 'Disponible',
    installing: 'Instalando',
    installed: 'Instalada',
    updating: 'Actualizando',
    uninstalling: 'Desinstalando',
    error: 'Error',
    requires_config: 'Requiere configuración',
  };
  return labels[estado] || estado;
}

export function getTipoPrecioLabel(tipo: TipoPrecio): string {
  const labels: Record<TipoPrecio, string> = {
    free: 'Gratis',
    one_time: 'Pago único',
    monthly: 'Mensual',
    yearly: 'Anual',
    usage: 'Por uso',
  };
  return labels[tipo] || tipo;
}

export function formatPrice(plan: PlanPrecio): string {
  if (plan.tipo === 'free') return 'Gratis';
  if (!plan.precio) return 'Consultar';
  
  const currency = plan.moneda || 'EUR';
  const symbol = currency === 'EUR' ? '€' : '$';
  const price = `${symbol}${plan.precio.toFixed(2)}`;
  
  if (plan.periodo) {
    return `${price}/${plan.periodo === 'mes' ? 'mes' : 'año'}`;
  }
  return price;
}

export function getUsagePercentage(instalacion: InstalacionIntegracion): number {
  const { uso } = instalacion;
  if (!uso.limiteLlamadas) return 0;
  return Math.min(100, (uso.llamadasApi / uso.limiteLlamadas) * 100);
}

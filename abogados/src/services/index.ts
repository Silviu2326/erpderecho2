// Servicios del Módulo M1 - Core Legal
export { clienteService } from './clienteService';

// Servicios del Módulo M2 - Gestión Documental
export { documentoService } from './documentoService';
export type {
  Documento,
  TipoDocumento,
  CreateDocumentoData,
  UpdateDocumentoData,
  QueryDocumentosParams,
} from '@/types/documento.types';
export type { 
  Cliente, 
  Contacto, 
  CreateClienteData, 
  UpdateClienteData,
  CreateContactoData,
  QueryClientesParams 
} from './clienteService';

export { expedienteService } from './expedienteService';
export type { 
  Expediente, 
  Actuacion,
  TipoExpediente,
  EstadoExpediente,
  CreateExpedienteData, 
  UpdateExpedienteData,
  CreateActuacionData,
  QueryExpedientesParams,
  QueryActuacionesParams,
  DashboardStats
} from './expedienteService';

export { calendarioService } from './calendarioService';
export type { 
  Evento,
  TipoEvento,
  CreateEventoData,
  UpdateEventoData,
  QueryEventosParams,
  QueryCalendarioParams
} from './calendarioService';

// Servicios del Módulo M3 - Finanzas
export { facturaService } from './facturaService';
export type {
  Factura,
  LineaFactura,
  EstadoFactura,
  CreateFacturaData,
  UpdateFacturaData,
  CreateLineaFacturaData,
  QueryFacturasParams,
} from './facturaService';

export { gastoService } from './gastoService';
export type {
  Gasto,
  Proveedor,
  EstadoGasto,
  TipoGasto,
  CreateGastoData,
  UpdateGastoData,
  CreateProveedorData,
  UpdateProveedorData,
  QueryGastosParams,
  QueryProveedoresParams,
  GastosStats,
} from './gastoService';

export { contabilidadService } from './contabilidadService';
export type {
  AsientoContable,
  TipoAsiento,
  CreateAsientoData,
  UpdateAsientoData,
  QueryAsientosParams,
  ContabilidadStats,
} from './contabilidadService';

export { rentabilidadService } from './rentabilidadService';
export type {
  RentabilidadCaso,
  RentabilidadAbogado,
  RentabilidadKPIs,
  QueryRentabilidadParams,
} from './rentabilidadService';

// Servicios del Módulo M4 - Cobranza
export { cobranzaService } from './cobranzaService';
export type {
  CuentaPorCobrar,
  FacturaVencida,
  CobranzaStats,
  AcuerdoPago,
  RegistroCobro,
  QueryCobranzaParams,
} from './cobranzaService';

export { configCobranzaService } from './configCobranzaService';
export type {
  ConfiguracionCobranza,
  RecordatorioCobranza,
  AlertaCobranza,
  CreateRecordatorioData,
  UpdateRecordatorioData,
  CreateAlertaData,
  UpdateAlertaData,
  UpdateConfiguracionData,
} from './configCobranzaService';

// Re-exportar authService para facilitar importaciones
export { authService } from './authService';
export type { 
  User, 
  UserRole, 
  UserPermissions,
  AuthResponse 
} from './authService';

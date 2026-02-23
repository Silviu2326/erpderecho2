# Especificaciones Técnicas - ERP Derecho

## 1. Estructura de Rutas

### 1.1 Rutas Principales

| Ruta | Página | Módulo |
|------|--------|--------|
| `/` | Dashboard | Core |
| `/login` | Login | Auth |
| `/register` | Register | Auth |
| `/dashboard` | Dashboard | Core |
| `/core/expedientes` | Expedientes | Core |
| `/core/expedientes/:id` | ExpedienteDetail | Core |
| `/core/calendario` | Calendario | Core |
| `/core/audiencias` | Audiencias | Core |
| `/core/prescripciones` | Prescripciones | Core |
| `/documentos/biblioteca` | Biblioteca | Documentos |
| `/documentos/buscar` | Buscar | Documentos |
| `/documentos/ocr` | OCR | Documentos |
| `/finanzas/facturacion` | Facturacion | Finanzas |
| `/finanzas/contabilidad` | Contabilidad | Finanzas |
| `/finanzas/gastos` | Gastos | Finanzas |
| `/finanzas/rentabilidad` | Rentabilidad | Finanzas |
| `/cobranza/dashboard` | Cobranza | Cobranza |
| `/cobranza/proveedores` | CobranzaProveedores | Cobranza |
| `/cobranza/config` | CobranzaConfig | Cobranza |
| `/tiempo/tareas` | Tareas | Tiempo |
| `/tiempo/tracking` | Tiempo | Tiempo |
| `/tiempo/informes` | TiempoInformes | Tiempo |
| `/comunicaciones/mensajes` | Mensajes | Comunicaciones |
| `/comunicaciones/juzgados` | Juzgados | Comunicaciones |
| `/comunicaciones/notificaciones` | Notificaciones | Comunicaciones |
| `/portal` | PortalCliente | Portal |
| `/firmas` | Firmas | Firmas |
| `/informes` | Informes | Informes |
| `/biblioteca/legislacion` | Legislacion | Biblioteca |
| `/biblioteca/plantillas` | Plantillas | Biblioteca |
| `/ia/chat` | IAChat | IA |
| `/ia/busqueda` | IABusqueda | IA |
| `/ia/generador` | IAGenerador | IA |
| `/forense/verificar` | ForenseVerificar | Forense |
| `/integraciones/lexnet` | Lexnet | Integraciones |
| `/admin` | Admin | Admin |
| `/crm/dashboard` | CRMDashboard | CRM |
| `/crm/pipeline` | CRMPipeline | CRM |
| `/crm/leads` | CRMLeads | CRM |
| `/contacto` | CRMContacto | CRM |
| `/oficio/dashboard` | OficioDashboard | Oficio |
| `/oficio/turnos` | Turnos | Oficio |
| `/oficio/guardias` | Guardias | Oficio |
| `/oficio/actuaciones` | Actuaciones | Oficio |
| `/oficio/liquidacion` | Liquidacion | Oficio |
| `/conflictos` | Conflictos | Conflictos |
| `/conflictos/partes` | ConflictosPartesContrarias | Conflictos |
| `/conflictos/analisis` | AnalisisConflictos | Conflictos |

---

## 2. Servicios y APIs

### 2.1 Servicios Existentes

| Servicio | Métodos | Descripción |
|----------|---------|-------------|
| **boeService** | buscarBoe, obtenerDocumentoBoe, obtenerCalendarioBoe, getNovedades, detectarDerogaciones | BOE |
| **cendojService** | buscarCendoj, obtenerResolucionCendoj, buscarPorTribunal, buscarPorMateria | CENDOJ |
| **crmService** | CRUD completo | CRM |
| **emailService** | Envío de emails | Email |
| **exchangeRateService** | getExchangeRates, convertCurrency, getAvailableCurrencies | Monedas |
| **googleService** | OAuth, Calendar, Gmail, Drive | Google Workspace |
| **legislacionApiService** | busquedaAvanzada, obtenerCodigos, sincronizarFuentes | Legislación |
| **lopdgdService** | Consentimientos, derechos ARCO, brechas, RAT | LOPDGDD |
| **marketplaceService** | Integraciones, registros públicos | Marketplace |
| **microsoftService** | OAuth, Outlook, Calendar, OneDrive | Microsoft 365 |
| **oficioService** | Turnos, guardias, actuaciones | Turnos Oficio |
| **prediccionService** | predecirCaso, analizarTendencia, generarRecomendaciones | IA Predictiva |
| **ocrService** | Extracción de texto | OCR |
| **compressionService** | Compresión de archivos | Documentos |
| **paymentService** | Pagos | Facturación |
| **reportsService** | Generación de informes | Informes |
| **templateMergeService** | Merge de plantillas | Documentos |
| **alertasEscalonadasService** | Alerts, notificaciones | Sistema |

---

## 3. Modelos de Datos

### 3.1 Entidades Principales

```
Usuarios
├── id
├── email
├── nombre
├── apellido
├── rol (abogado/admin/etc)
├── especialidad
├── numero_colegiado
├── password_hash
├── avatar
├── telefono
├── fecha_alta
└── ultimo_acceso

Expedientes
├── id
├── numero_expediente
├── cliente_id
├── tipo (civil/penal/laboral/etc)
├── estado (abierto/cerrado/archivado)
├── fecha_apertura
├── fecha_cierre
├── asunto
├── descripcion
├── abogado_responsable_id
├── partes_contrarias[]
├── documentos[]
├── actuaciones[]
├── presupuestos[]
├── facturacion[]
└── tareas[]

Clientes
├── id
├── nombre
├── apellido
├── nif
├── razon_social
├── tipo (particular/empresa)
├── direccion
├── telefonos[]
├── emails[]
├── contactos[]
├── expediente_ids[]
├── fecha_alta
└── observaciones

Facturas
├── id
├── numero_factura
├── expediente_id
├── cliente_id
├── fecha_emision
├── fecha_vencimiento
├── concepto
├── base_imponible
├── iva
├── total
├── estado (pagada/pendiente/cobrada)
├── forma_pago
└── pagos[]

Actuaciones
├── id
├── expediente_id
├── tipo (escritura/presentacion/audiencia/etc)
├── fecha
├── descripcion
├── documento_id
├── usuario_id
└── estado

Documentos
├── id
├── nombre
├── tipo (demanda/contestacion/sentencia/etc)
├── expediente_id
├── url
├── contenido
├── hash
├── firmado
├── fecha_creacion
├── usuario_creador_id
└── version

TurnosOficio
├── id
├── tipo_turno
├── fecha_asignacion
├── cliente_anónimo
├── descripcion_caso
├── abogado_asignado_id
├── estado (asignado/atendido/completado)
└── actuaciones[]

Prescripciones
├── id
├── expediente_id
├── tipo_prescripcion
├── fecha_inicio
├── fecha_fin
├── dias_restantes
├── estado (activa/prescrita/ampliada)
└── alertas[]

Conflictos
├── id
├── parte_contraria_id
├── expediente_id
├── tipo_conflicto
├── estado (abierto/resuelto/escalado)
├── probabilidad_exito
├── cuantia
└── resolucion

CRM
├── leads[]
├── oportunidades[]
├── empresas[]
├── contactos[]
├── tareas_crm[]
└── pipeline[]
```

---

## 4. APIs REST - Endpoints

### 4.1 Autenticación
```
POST   /api/auth/login
POST   /api/auth/register
POST   /api/auth/logout
POST   /api/auth/refresh
GET    /api/auth/me
POST   /api/auth/password/reset
```

### 4.2 Expedientes
```
GET    /api/expedientes
POST   /api/expedientes
GET    /api/expedientes/:id
PUT    /api/expedientes/:id
DELETE /api/expedientes/:id
GET    /api/expedientes/:id/actuaciones
POST   /api/expedientes/:id/documentos
GET    /api/expedientes/:id/timeline
```

### 4.3 Clientes
```
GET    /api/clientes
POST   /api/clientes
GET    /api/clientes/:id
PUT    /api/clientes/:id
DELETE /api/clientes/:id
GET    /api/clientes/:id/expedientes
GET    /api/clientes/:id/facturas
```

### 4.4 Facturación
```
GET    /api/facturas
POST   /api/facturas
GET    /api/facturas/:id
PUT    /api/facturas/:id
DELETE /api/facturas/:id
POST   /api/facturas/:id/pagar
GET    /api/facturas/:id/pdf
POST   /api/facturas/:id/enviar
```

### 4.5 Documentos
```
GET    /api/documentos
POST   /api/documentos
GET    /api/documentos/:id
PUT    /api/documentos/:id
DELETE /api/documentos/:id
POST   /api/documentos/:id/firmar
GET    /api/documentos/:id/descargar
POST   /api/documentos/ocr
```

### 4.6 Calendario
```
GET    /api/eventos
POST   /api/eventos
GET    /api/eventos/:id
PUT    /api/eventos/:id
DELETE /api/eventos/:id
GET    /api/eventos/audiencias
GET    /api/eventos/plazos
```

### 4.7 Turnos de Oficio
```
GET    /api/oficio/turnos
POST   /api/oficio/turnos
GET    /api/oficio/turnos/:id
PUT    /api/oficio/turnos/:id
GET    /api/oficio/actuaciones
POST   /api/oficio/actuaciones
GET    /api/oficio/guardias
POST   /api/oficio/guardias
GET    /api/oficio/liquidaciones
POST   /api/oficio/liquidaciones
```

### 4.8 CRM
```
GET    /api/crm/leads
POST   /api/crm/leads
PUT    /api/crm/leads/:id
DELETE /api/crm/leads/:id
GET    /api/crm/oportunidades
POST   /api/crm/oportunidades
PUT    /api/crm/oportunidades/:id
GET    /api/crm/pipeline
GET    /api/crm/contactos
POST   /api/crm/contactos
```

### 4.9 Legislación (BOE/CENDOJ)
```
GET    /api/legislacion/boe/buscar
GET    /api/legislacion/boe/:id
GET    /api/legislacion/cendoj/buscar
GET    /api/legislacion/cendoj/:id
GET    /api/legislacion/novedades
GET    /api/legislacion/derogaciones
GET    /api/legislacion/favoritos
POST   /api/legislacion/favoritos
```

### 4.10 LOPDGDD
```
GET    /api/lopdgdd/rat
POST   /api/lopdgdd/rat
PUT    /api/lopdgdd/rat/:id
DELETE /api/lopdgdd/rat/:id
GET    /api/lopdgdd/consentimientos
POST   /api/lopdgdd/consentimientos
GET    /api/lopdgdd/derechos
POST   /api/lopdgdd/derechos/ejercitar
GET    /api/lopdgdd/brechas
POST   /api/lopdgdd/brechas
GET    /api/lopdgdd/informes
```

### 4.11 Integraciones
```
POST   /api/integraciones/microsoft/connect
POST   /api/integraciones/microsoft/disconnect
GET    /api/integraciones/microsoft/calendar
POST   /api/integraciones/microsoft/calendar/sync
GET    /api/integraciones/microsoft/email
POST   /api/integraciones/microsoft/email/send

POST   /api/integraciones/google/connect
POST   /api/integraciones/google/disconnect
GET    /api/integraciones/google/calendar
POST   /api/integraciones/google/calendar/sync
GET    /api/integraciones/google/email
POST   /api/integraciones/google/email/send
```

### 4.12 Marketplace
```
GET    /api/marketplace/integraciones
GET    /api/marketplace/integraciones/:id
POST   /api/marketplace/integraciones/:id/activar
POST   /api/marketplace/integraciones/:id/desactivar
GET    /api/marketplace/registros/civil
GET    /api/marketplace/registros/catastro
GET    /api/marketplace/registros/propiedad
POST   /api/marketplace/registros/consultar
```

### 4.13 Predicción
```
POST   /api/prediccion/caso
GET    /api/prediccion/caso/:expedienteId
GET    /api/prediccion/tendencias
GET    /api/prediccion/casos-similares
GET    /api/prediccion/riesgo-prescripcion
GET    /api/prediccion/dashboard
```

### 4.14 Prescripciones
```
GET    /api/prescripciones
GET    /api/prescripciones/:id
POST   /api/prescripciones
PUT    /api/prescripciones/:id
GET    /api/prescripciones/proximas
GET    /api/prescripciones/alertas
```

### 4.15 Conflictos
```
GET    /api/conflictos
POST   /api/conflictos
GET    /api/conflictos/:id
PUT    /api/conflictos/:id
GET    /api/conflictos/partes-contrarias
POST   /api/conflictos/partes-contrarias
GET    /api/conflictos/analisis/:expedienteId
```

---

## 5. Tecnologías Recomendadas

### Backend
- **Framework**: Node.js (NestJS o Express)
- **Base de datos**: PostgreSQL
- **ORM**: Prisma o TypeORM
- **Auth**: JWT + Refresh Tokens
- **API Docs**: Swagger/OpenAPI
- **Queue**: Bull/RabbitMQ (para tareas asíncronas)
- **Cache**: Redis
- **Search**: Elasticsearch (para legislación)

### Integraciones
- **BOE**: API oficial del BOE
- **CENDOJ**: API del CENDOJ
- **Microsoft Graph API**: Office 365
- **Google API**: Gmail, Calendar, Drive
- **Registro Civil/Catastro**: APIs públicas españolas
- **Firma digital**: Certificados digitales, eIDAS

---

## 6. Pendiente de Documentar

- [ ] Detalle de cada endpoint (request/response)
- [ ] Autenticación y permisos
- [ ] Rate limiting
- [ ] Webhooks
- [ ] Eventos en tiempo real (WebSockets)
- [ ] Caching strategies
- [ ] Tests unitarios/integración
- [ ] Despliegue (Docker, Kubernetes)
- [ ] Monitorización (logs, métricas)

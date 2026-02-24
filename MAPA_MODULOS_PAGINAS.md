# 📋 MAPA COMPLETO DE MÓDULOS Y PÁGINAS - ERP DERECHO

## 🎯 Resumen Ejecutivo

**Total de Módulos:** 15  
**Total de Páginas:** 45+  
**Roles del Sistema:** 9

---

## 👥 ROLES DEL SISTEMA

| Código | Rol | Descripción |
|--------|-----|-------------|
| **SA** | super_admin | Administrador total del sistema |
| **SO** | socio | Socio del bufete |
| **AS** | abogado_senior | Abogado con experiencia |
| **AJ** | abogado_junior | Abogado junior |
| **PA** | paralegal | Asistente legal |
| **SE** | secretario | Secretario/a |
| **AD** | administrador | Administrador del bufete |
| **CO** | contador | Contable |
| **RE** | recepcionista | Recepción |

---

## 📊 DISTRIBUCIÓN DE PÁGINAS POR ROL

| Rol | Nº Páginas Accesibles |
|-----|----------------------|
| super_admin | **45** (Todas) |
| socio | 40 |
| abogado_senior | 28 |
| abogado_junior | 23 |
| paralegal | 16 |
| secretario | 12 |
| administrador | 25 |
| contador | 15 |
| recepcionista | 4 |

---

## 📁 MÓDULOS Y PÁGINAS

### 🔐 M0 - AUTENTICACIÓN (Público)

**Descripción:** Páginas de acceso sin autenticación requerida

| Página | Ruta | Componente | Roles |
|--------|------|------------|-------|
| Login | `/login` | Login.tsx | Todos |
| Registro | `/register` | Register.tsx | Todos |
| Recuperar Contraseña | `/forgot-password` | ForgotPassword.tsx | Todos |

---

### ⚖️ M1 - CORE LEGAL

**Descripción:** Funcionalidades principales de gestión legal

| Página | Ruta | Componente | Roles |
|--------|------|------------|-------|
| Dashboard | `/dashboard` | Dashboard.tsx | SA, SO, AS, AJ, PA, SE, AD, CO, RE |
| Dashboard Core | `/core/dashboard` | CoreDashboard.tsx | SA, SO, AS, AJ, PA, SE |
| **Expedientes** | `/core/expedientes` | Expedientes.tsx | SA, SO, AS, AJ, PA, SE |
| Detalle Expediente | `/core/expedientes/:id` | ExpedienteDetail.tsx | SA, SO, AS, AJ, PA, SE |
| Nuevo Expediente | `/core/expedientes/nuevo` | ExpedienteForm.tsx | SA, SO, AS, AJ, PA |
| **Calendario** | `/core/calendario` | Calendario.tsx | SA, SO, AS, AJ, PA, SE, AD, RE |
| Audiencias | `/core/audiencias` | Audiencias.tsx | SA, SO, AS, AJ, PA, SE |
| **Prescripciones** | `/core/prescripciones` | Prescripciones.tsx | SA, SO, AS, AJ |
| Plazos Procesales | `/core/plazos` | PlazosProcesales.tsx | SA, SO, AS, AJ, PA |

**Alias de rutas (compatibilidad):**
- `/expedientes` → `/core/expedientes`
- `/calendario` → `/core/calendario`
- `/audiencias` → `/core/audiencias`
- `/prescripciones` → `/core/prescripciones`

---

### 📄 M2 - GESTIÓN DOCUMENTAL

**Descripción:** Gestión de documentos, biblioteca y OCR

| Página | Ruta | Componente | Roles |
|--------|------|------------|-------|
| **Biblioteca** | `/documentos/biblioteca` | Biblioteca.tsx | SA, SO, AS, AJ, PA, SE, AD, CO |
| Documento Detalle | `/documentos/biblioteca/:id` | DocumentoDetail.tsx | SA, SO, AS, AJ, PA, SE, AD, CO |
| **Buscar Documentos** | `/documentos/buscar` | BuscarDocumentos.tsx | SA, SO, AS, AJ, PA, SE |
| Búsqueda Avanzada | `/documentos/buscar/avanzada` | BusquedaAvanzada.tsx | SA, SO, AS, AJ |
| **OCR** | `/documentos/ocr` | OCR.tsx | SA, SO, AD, CO |
| Procesamiento OCR | `/documentos/ocr/procesar` | OCRProcesar.tsx | SA, SO, AD, CO |
| Resultados OCR | `/documentos/ocr/resultados` | OCRResultados.tsx | SA, SO, AD, CO |

**Alias de rutas:**
- `/biblioteca` → `/documentos/biblioteca`

---

### 💰 M3 - FINANZAS

**Descripción:** Gestión financiera y contable

| Página | Ruta | Componente | Roles |
|--------|------|------------|-------|
| **Facturación** | `/finanzas/facturacion` | Facturacion.tsx | SA, SO, AD, CO |
| Nueva Factura | `/finanzas/facturacion/nueva` | FacturaForm.tsx | SA, SO, AD, CO |
| Detalle Factura | `/finanzas/facturacion/:id` | FacturaDetail.tsx | SA, SO, AD, CO |
| **Contabilidad** | `/finanzas/contabilidad` | Contabilidad.tsx | SA, SO, AD, CO |
| Asientos Contables | `/finanzas/contabilidad/asientos` | AsientosContables.tsx | SA, SO, AD, CO |
| Libro Mayor | `/finanzas/contabilidad/mayor` | LibroMayor.tsx | SA, SO, AD, CO |
| **Gastos** | `/finanzas/gastos` | Gastos.tsx | SA, SO, AD, CO |
| Nuevo Gasto | `/finanzas/gastos/nuevo` | GastoForm.tsx | SA, SO, AD, CO |
| **Rentabilidad** | `/finanzas/rentabilidad` | Rentabilidad.tsx | SA, SO, AD |
| Análisis por Cliente | `/finanzas/rentabilidad/cliente` | RentabilidadCliente.tsx | SA, SO, AD |
| Análisis por Abogado | `/finanzas/rentabilidad/abogado` | RentabilidadAbogado.tsx | SA, SO, AD |

**Alias de rutas:**
- `/facturacion` → `/finanzas/facturacion`

---

### 💳 M4 - COBRANZA Y PROVEEDORES

**Descripción:** Gestión de cobros y pagos

| Página | Ruta | Componente | Roles |
|--------|------|------------|-------|
| **Dashboard Cobranza** | `/cobranza/dashboard` | CobranzaDashboard.tsx | SA, SO, AD, CO |
| Gestión Cobros | `/cobranza/gestion` | GestionCobros.tsx | SA, SO, AD, CO |
| Vencimientos | `/cobranza/vencimientos` | Vencimientos.tsx | SA, SO, AD, CO |
| **Proveedores** | `/cobranza/proveedores` | Proveedores.tsx | SA, SO, AD |
| Nuevo Proveedor | `/cobranza/proveedores/nuevo` | ProveedorForm.tsx | SA, SO, AD |
| Detalle Proveedor | `/cobranza/proveedores/:id` | ProveedorDetail.tsx | SA, SO, AD |
| **Configuración** | `/cobranza/config` | ConfigCobranza.tsx | SA, AD |
| Métodos de Pago | `/cobranza/config/metodos` | MetodosPago.tsx | SA, AD |

---

### ⏱️ M5 - TIEMPO Y TAREAS

**Descripción:** Gestión del tiempo y productividad

| Página | Ruta | Componente | Roles |
|--------|------|------------|-------|
| **Tareas** | `/tiempo/tareas` | Tareas.tsx | SA, SO, AS, AJ, PA, SE |
| Nueva Tarea | `/tiempo/tareas/nueva` | TareaForm.tsx | SA, SO, AS, AJ, PA |
| Detalle Tarea | `/tiempo/tareas/:id` | TareaDetail.tsx | SA, SO, AS, AJ, PA, SE |
| **Tracking de Tiempo** | `/tiempo/tracking` | TimeTracking.tsx | SA, SO, AS, AJ, PA |
| Registro de Horas | `/tiempo/tracking/registro` | RegistroHoras.tsx | SA, SO, AS, AJ, PA |
| **Informes Productividad** | `/tiempo/informes` | InformesProductividad.tsx | SA, SO, AD |
| Reporte por Abogado | `/tiempo/informes/abogado` | ReporteAbogado.tsx | SA, SO, AD |
| Reporte por Proyecto | `/tiempo/informes/proyecto` | ReporteProyecto.tsx | SA, SO, AD |

**Alias de rutas:**
- `/tareas` → `/tiempo/tareas`

---

### 💬 M6 - COMUNICACIONES

**Descripción:** Mensajería y comunicaciones externas

| Página | Ruta | Componente | Roles |
|--------|------|------------|-------|
| **Mensajes** | `/comunicaciones/mensajes` | Mensajes.tsx | SA, SO, AS, AJ, PA, SE, AD, CO, RE |
| Conversación | `/comunicaciones/mensajes/:id` | Conversacion.tsx | SA, SO, AS, AJ, PA, SE, AD, CO, RE |
| Nuevo Mensaje | `/comunicaciones/mensajes/nuevo` | NuevoMensaje.tsx | SA, SO, AS, AJ, PA, SE, AD, CO |
| **Juzgados** | `/comunicaciones/juzgados` | Juzgados.tsx | SA, SO, AS, AJ, PA |
| Detalle Juzgado | `/comunicaciones/juzgados/:id` | JuzgadoDetail.tsx | SA, SO, AS, AJ, PA |
| **Notificaciones** | `/comunicaciones/notificaciones` | Notificaciones.tsx | SA, SO, AD |
| Configurar Alertas | `/comunicaciones/notificaciones/config` | ConfigNotificaciones.tsx | SA, SO, AD |

---

### 🌐 M7 - PORTAL CLIENTE

**Descripción:** Acceso para clientes externos

| Página | Ruta | Componente | Roles |
|--------|------|------------|-------|
| **Portal Cliente** | `/portal` | PortalCliente.tsx | SA, SO, AD, CLIENTE |
| Mis Expedientes | `/portal/expedientes` | PortalExpedientes.tsx | CLIENTE |
| Mis Documentos | `/portal/documentos` | PortalDocumentos.tsx | CLIENTE |
| Mis Facturas | `/portal/facturas` | PortalFacturas.tsx | CLIENTE |
| Mensajes | `/portal/mensajes` | PortalMensajes.tsx | CLIENTE |
| Configuración | `/portal/config` | PortalConfig.tsx | CLIENTE |

---

### ✍️ M8 - FIRMAS DIGITALES

**Descripción:** Firma electrónica de documentos

| Página | Ruta | Componente | Roles |
|--------|------|------------|-------|
| **Firmas** | `/firmas` | Firmas.tsx | SA, SO, AS, AJ, AD, CO |
| Firmar Documento | `/firmas/firmar/:id` | FirmarDocumento.tsx | SA, SO, AS, AJ, AD, CO |
| Historial de Firmas | `/firmas/historial` | HistorialFirmas.tsx | SA, SO, AD, CO |
| Configuración Firma | `/firmas/config` | ConfigFirma.tsx | SA, AD |

---

### 📊 M9 - INFORMES Y BI

**Descripción:** Business Intelligence y reportes

| Página | Ruta | Componente | Roles |
|--------|------|------------|-------|
| **Informes** | `/informes` | Informes.tsx | SA, SO, AD, CO |
| KPIs | `/informes/kpis` | KPIs.tsx | SA, SO, AD |
| Reportes Financieros | `/informes/financieros` | ReportesFinancieros.tsx | SA, SO, AD, CO |
| Reportes Operativos | `/informes/operativos` | ReportesOperativos.tsx | SA, SO, AD |
| Análisis Predictivo | `/informes/predictivo` | AnalisisPredictivo.tsx | SA, SO |

---

### 📚 M10 - BIBLIOTECA LEGAL

**Descripción:** Consulta de legislación y jurisprudencia

| Página | Ruta | Componente | Roles |
|--------|------|------------|-------|
| **Legislación** | `/biblioteca/legislacion` | Legislacion.tsx | SA, SO, AS, AJ, PA |
| BOE | `/biblioteca/legislacion/boe` | BOE.tsx | SA, SO, AS, AJ, PA |
| CENDOJ | `/biblioteca/legislacion/cendoj` | CENDOJ.tsx | SA, SO, AS, AJ |
| Jurisprudencia | `/biblioteca/legislacion/jurisprudencia` | Jurisprudencia.tsx | SA, SO, AS, AJ |
| **Plantillas** | `/biblioteca/plantillas` | Plantillas.tsx | SA, SO, AS, AD |
| Crear Plantilla | `/biblioteca/plantillas/crear` | PlantillaForm.tsx | SA, SO, AS, AD |
| Usar Plantilla | `/biblioteca/plantillas/:id/usar` | UsarPlantilla.tsx | SA, SO, AS, AJ, PA |
| **Doctrina** | `/biblioteca/doctrina` | Doctrina.tsx | SA, SO, AS, AJ |

---

### 🤖 M11 - IA LEGAL

**Descripción:** Inteligencia Artificial aplicada al derecho

| Página | Ruta | Componente | Roles |
|--------|------|------------|-------|
| **Chat IA** | `/ia/chat` | ChatIA.tsx | SA, SO, AS |
| Nueva Conversación | `/ia/chat/nueva` | NuevaConversacion.tsx | SA, SO, AS |
| Historial Chat | `/ia/chat/historial` | HistorialChat.tsx | SA, SO, AS |
| **Búsqueda Semántica** | `/ia/busqueda` | BusquedaSemantica.tsx | SA, SO, AS, AJ |
| Resultados Búsqueda | `/ia/busqueda/resultados` | ResultadosBusqueda.tsx | SA, SO, AS, AJ |
| **Generador de Escritos** | `/ia/generador` | GeneradorEscritos.tsx | SA, SO, AS, AJ |
| Crear Escrito | `/ia/generador/crear` | CrearEscrito.tsx | SA, SO, AS, AJ |
| Escritos Guardados | `/ia/generador/guardados` | EscritosGuardados.tsx | SA, SO, AS, AJ |
| **Análisis de Contratos** | `/ia/analisis` | AnalisisContratos.tsx | SA, SO, AS |
| Subir Contrato | `/ia/analisis/subir` | SubirContrato.tsx | SA, SO, AS |
| **Predicciones** | `/ia/predicciones` | Predicciones.tsx | SA, SO, AS |

---

### 🔬 M12 - BIBLIOTECA FORENSE

**Descripción:** Herramientas forenses y periciales

| Página | Ruta | Componente | Roles |
|--------|------|------------|-------|
| **Verificar ID** | `/forense/verificar` | VerificarID.tsx | SA, SO, AD |
| Verificar Documento | `/forense/verificar/documento` | VerificarDocumento.tsx | SA, SO, AD |
| Verificar Firma | `/forense/verificar/firma` | VerificarFirma.tsx | SA, SO |
| **Informes Periciales** | `/forense/informes` | InformesPericiales.tsx | SA, SO |
| Nuevo Informe | `/forense/informes/nuevo` | NuevoInforme.tsx | SA, SO |

---

### 🔌 M13 - INTEGRACIONES

**Descripción:** Integraciones con sistemas externos

| Página | Ruta | Componente | Roles |
|--------|------|------------|-------|
| **LexNET** | `/integraciones/lexnet` | LexNET.tsx | SA, SO, AS, AJ |
| Envío LexNET | `/integraciones/lexnet/envio` | EnvioLexNET.tsx | SA, SO, AS, AJ |
| **Office 365** | `/integraciones/office` | Office365.tsx | SA, SO, AD |
| Configuración Office | `/integraciones/office/config` | ConfigOffice.tsx | SA, SO, AD |
| **Google Workspace** | `/integraciones/google` | GoogleWorkspace.tsx | SA, SO, AD |
| Configuración Google | `/integraciones/google/config` | ConfigGoogle.tsx | SA, SO, AD |
| **API REST** | `/integraciones/api` | APIRest.tsx | SA |
| Documentación API | `/integraciones/api/docs` | APIDocs.tsx | SA |

---

### 👥 M14 - CRM (CLIENTES Y CONTACTOS)

**Descripción:** Gestión de clientes y relaciones

| Página | Ruta | Componente | Roles |
|--------|------|------------|-------|
| **Clientes** | `/clientes` | Clientes.tsx | SA, SO, AS, AJ, PA, SE, AD |
| Nuevo Cliente | `/clientes/nuevo` | ClienteForm.tsx | SA, SO, AS, AJ, PA, AD |
| Detalle Cliente | `/clientes/:id` | ClienteDetail.tsx | SA, SO, AS, AJ, PA, SE, AD |
| Editar Cliente | `/clientes/:id/editar` | ClienteEdit.tsx | SA, SO, AS, AJ, PA, AD |
| Contactos | `/clientes/:id/contactos` | ContactosCliente.tsx | SA, SO, AS, AJ, PA |
| **Leads** | `/crm/leads` | Leads.tsx | SA, SO, AS, AJ, AD |
| Nuevo Lead | `/crm/leads/nuevo` | LeadForm.tsx | SA, SO, AS, AJ, AD |
| **Oportunidades** | `/crm/oportunidades` | Oportunidades.tsx | SA, SO, AS, AJ |
| Pipeline | `/crm/pipeline` | Pipeline.tsx | SA, SO, AS, AJ, AD |

---

### ⚠️ M15 - GESTIÓN DE CONFLICTOS

**Descripción:** Verificación de conflictos de intereses

| Página | Ruta | Componente | Roles |
|--------|------|------------|-------|
| **Conflictos** | `/conflictos` | Conflictos.tsx | SA, SO, AS |
| Verificar Conflicto | `/conflictos/verificar` | VerificarConflicto.tsx | SA, SO, AS |
| **Partes Contrarias** | `/conflictos/partes` | PartesContrarias.tsx | SA, SO, AS |
| Registrar Parte | `/conflictos/partes/nueva` | NuevaParteContraria.tsx | SA, SO, AS |
| **Análisis de Conflictos** | `/conflictos/analisis` | AnalisisConflictos.tsx | SA, SO |
| Reporte Conflictos | `/conflictos/reporte` | ReporteConflictos.tsx | SA, SO |

---

### 🔧 M16 - ADMINISTRACIÓN DEL SISTEMA

**Descripción:** Configuración y administración

| Página | Ruta | Componente | Roles |
|--------|------|------------|-------|
| **Panel Admin** | `/admin` | AdminPanel.tsx | SA |
| Usuarios | `/admin/usuarios` | AdminUsuarios.tsx | SA |
| Nuevo Usuario | `/admin/usuarios/nuevo` | AdminUsuarioForm.tsx | SA |
| Roles y Permisos | `/admin/roles` | AdminRoles.tsx | SA |
| Configuración General | `/admin/config` | AdminConfig.tsx | SA |
| Logs del Sistema | `/admin/logs` | AdminLogs.tsx | SA |
| Backup y Restore | `/admin/backup` | AdminBackup.tsx | SA |

---

## 📱 OTRAS PÁGINAS

### Páginas de Perfil y Configuración

| Página | Ruta | Componente | Roles |
|--------|------|------------|-------|
| Mi Perfil | `/perfil` | MiPerfil.tsx | Todos |
| Editar Perfil | `/perfil/editar` | EditarPerfil.tsx | Todos |
| Cambiar Contraseña | `/perfil/password` | CambiarPassword.tsx | Todos |
| Preferencias | `/perfil/preferencias` | Preferencias.tsx | Todos |

### Páginas de Ayuda

| Página | Ruta | Componente | Roles |
|--------|------|------------|-------|
| Ayuda | `/ayuda` | Ayuda.tsx | Todos |
| FAQ | `/ayuda/faq` | FAQ.tsx | Todos |
| Tutoriales | `/ayuda/tutoriales` | Tutoriales.tsx | Todos |
| Soporte | `/ayuda/soporte` | Soporte.tsx | Todos |

---

## 🗂️ ESTRUCTURA DE CARPETAS

```
src/
├── pages/
│   ├── auth/                    # M0 - Autenticación
│   │   ├── Login.tsx
│   │   ├── Register.tsx
│   │   └── ForgotPassword.tsx
│   │
│   ├── core/                    # M1 - Core Legal
│   │   ├── Dashboard.tsx
│   │   ├── CoreDashboard.tsx
│   │   ├── Expedientes.tsx
│   │   ├── ExpedienteDetail.tsx
│   │   ├── ExpedienteForm.tsx
│   │   ├── Calendario.tsx
│   │   ├── Audiencias.tsx
│   │   ├── Prescripciones.tsx
│   │   └── PlazosProcesales.tsx
│   │
│   ├── documentos/              # M2 - Gestión Documental
│   │   ├── Biblioteca.tsx
│   │   ├── DocumentoDetail.tsx
│   │   ├── BuscarDocumentos.tsx
│   │   ├── BusquedaAvanzada.tsx
│   │   ├── OCR.tsx
│   │   ├── OCRProcesar.tsx
│   │   └── OCRResultados.tsx
│   │
│   ├── finanzas/                # M3 - Finanzas
│   │   ├── Facturacion.tsx
│   │   ├── FacturaForm.tsx
│   │   ├── FacturaDetail.tsx
│   │   ├── Contabilidad.tsx
│   │   ├── AsientosContables.tsx
│   │   ├── LibroMayor.tsx
│   │   ├── Gastos.tsx
│   │   ├── GastoForm.tsx
│   │   ├── Rentabilidad.tsx
│   │   ├── RentabilidadCliente.tsx
│   │   └── RentabilidadAbogado.tsx
│   │
│   ├── cobranza/                # M4 - Cobranza
│   │   ├── CobranzaDashboard.tsx
│   │   ├── GestionCobros.tsx
│   │   ├── Vencimientos.tsx
│   │   ├── Proveedores.tsx
│   │   ├── ProveedorForm.tsx
│   │   ├── ProveedorDetail.tsx
│   │   ├── ConfigCobranza.tsx
│   │   └── MetodosPago.tsx
│   │
│   ├── tiempo/                  # M5 - Tiempo y Tareas
│   │   ├── Tareas.tsx
│   │   ├── TareaForm.tsx
│   │   ├── TareaDetail.tsx
│   │   ├── TimeTracking.tsx
│   │   ├── RegistroHoras.tsx
│   │   ├── InformesProductividad.tsx
│   │   ├── ReporteAbogado.tsx
│   │   └── ReporteProyecto.tsx
│   │
│   ├── comunicaciones/          # M6 - Comunicaciones
│   │   ├── Mensajes.tsx
│   │   ├── Conversacion.tsx
│   │   ├── NuevoMensaje.tsx
│   │   ├── Juzgados.tsx
│   │   ├── JuzgadoDetail.tsx
│   │   ├── Notificaciones.tsx
│   │   └── ConfigNotificaciones.tsx
│   │
│   ├── portal/                  # M7 - Portal Cliente
│   │   ├── PortalCliente.tsx
│   │   ├── PortalExpedientes.tsx
│   │   ├── PortalDocumentos.tsx
│   │   ├── PortalFacturas.tsx
│   │   ├── PortalMensajes.tsx
│   │   └── PortalConfig.tsx
│   │
│   ├── firmas/                  # M8 - Firmas Digitales
│   │   ├── Firmas.tsx
│   │   ├── FirmarDocumento.tsx
│   │   ├── HistorialFirmas.tsx
│   │   └── ConfigFirma.tsx
│   │
│   ├── informes/                # M9 - Informes y BI
│   │   ├── Informes.tsx
│   │   ├── KPIs.tsx
│   │   ├── ReportesFinancieros.tsx
│   │   ├── ReportesOperativos.tsx
│   │   └── AnalisisPredictivo.tsx
│   │
│   ├── biblioteca/              # M10 - Biblioteca Legal
│   │   ├── Legislacion.tsx
│   │   ├── BOE.tsx
│   │   ├── CENDOJ.tsx
│   │   ├── Jurisprudencia.tsx
│   │   ├── Plantillas.tsx
│   │   ├── PlantillaForm.tsx
│   │   ├── UsarPlantilla.tsx
│   │   └── Doctrina.tsx
│   │
│   ├── ia/                      # M11 - IA Legal
│   │   ├── ChatIA.tsx
│   │   ├── NuevaConversacion.tsx
│   │   ├── HistorialChat.tsx
│   │   ├── BusquedaSemantica.tsx
│   │   ├── ResultadosBusqueda.tsx
│   │   ├── GeneradorEscritos.tsx
│   │   ├── CrearEscrito.tsx
│   │   ├── EscritosGuardados.tsx
│   │   ├── AnalisisContratos.tsx
│   │   ├── SubirContrato.tsx
│   │   └── Predicciones.tsx
│   │
│   ├── forense/                 # M12 - Biblioteca Forense
│   │   ├── VerificarID.tsx
│   │   ├── VerificarDocumento.tsx
│   │   ├── VerificarFirma.tsx
│   │   ├── InformesPericiales.tsx
│   │   └── NuevoInforme.tsx
│   │
│   ├── integraciones/           # M13 - Integraciones
│   │   ├── LexNET.tsx
│   │   ├── EnvioLexNET.tsx
│   │   ├── Office365.tsx
│   │   ├── ConfigOffice.tsx
│   │   ├── GoogleWorkspace.tsx
│   │   ├── ConfigGoogle.tsx
│   │   ├── APIRest.tsx
│   │   └── APIDocs.tsx
│   │
│   ├── clientes/                # M14 - CRM
│   │   ├── Clientes.tsx
│   │   ├── ClienteForm.tsx
│   │   ├── ClienteDetail.tsx
│   │   ├── ClienteEdit.tsx
│   │   ├── ContactosCliente.tsx
│   │   ├── Leads.tsx
│   │   ├── LeadForm.tsx
│   │   ├── Oportunidades.tsx
│   │   └── Pipeline.tsx
│   │
│   ├── conflictos/              # M15 - Gestión Conflictos
│   │   ├── Conflictos.tsx
│   │   ├── VerificarConflicto.tsx
│   │   ├── PartesContrarias.tsx
│   │   ├── NuevaParteContraria.tsx
│   │   ├── AnalisisConflictos.tsx
│   │   └── ReporteConflictos.tsx
│   │
│   ├── admin/                   # M16 - Administración
│   │   ├── AdminPanel.tsx
│   │   ├── AdminUsuarios.tsx
│   │   ├── AdminUsuarioForm.tsx
│   │   ├── AdminRoles.tsx
│   │   ├── AdminConfig.tsx
│   │   ├── AdminLogs.tsx
│   │   └── AdminBackup.tsx
│   │
│   ├── perfil/                  # Perfil y Configuración
│   │   ├── MiPerfil.tsx
│   │   ├── EditarPerfil.tsx
│   │   ├── CambiarPassword.tsx
│   │   └── Preferencias.tsx
│   │
│   └── ayuda/                   # Ayuda y Soporte
│       ├── Ayuda.tsx
│       ├── FAQ.tsx
│       ├── Tutoriales.tsx
│       └── Soporte.tsx
│
└── components/                  # Componentes reutilizables
    ├── common/                  # Componentes comunes
    ├── forms/                   # Formularios
    ├── tables/                  # Tablas
    ├── modals/                  # Modales
    └── charts/                  # Gráficos
```

---

## 🎯 RUTAS DESTACADAS

### Dashboard Principal
- `/dashboard` - Dashboard general con acceso por rol

### Rutas de Trabajo Diario
- `/core/expedientes` - Gestión de casos
- `/tiempo/tareas` - Tareas pendientes
- `/comunicaciones/mensajes` - Mensajes
- `/core/calendario` - Calendario y agenda

### Rutas Financieras
- `/finanzas/facturacion` - Facturación
- `/cobranza/dashboard` - Cobranzas
- `/finanzas/rentabilidad` - Rentabilidad

### Rutas de Consulta
- `/biblioteca/legislacion` - Legislación
- `/documentos/biblioteca` - Documentos
- `/ia/chat` - Asistente IA

### Rutas Administrativas
- `/admin` - Panel de administración
- `/admin/usuarios` - Gestión de usuarios

---

## 📈 ESTADÍSTICAS

- **Total de Módulos:** 16
- **Total de Páginas:** 85+
- **Total de Componentes:** 120+
- **Rutas Principales:** 45
- **Rutas Anidadas:** 40+

---

## ✅ ESTADO DE IMPLEMENTACIÓN

| Módulo | Páginas | Estado |
|--------|---------|--------|
| M0 - Autenticación | 3 | ✅ Implementado |
| M1 - Core Legal | 10 | ✅ Implementado (completo) |
| M2 - Gestión Documental | 7 | ✅ COMPLETAMENTE Implementado |
| M3 - Finanzas | 11 | ✅ Implementado |
| M4 - Cobranza | 8 | ✅ Implementado |
| M5 - Tiempo y Tareas | 8 | ✅ Implementado |
| M6 - Comunicaciones | 7 | ✅ Implementado |
| M7 - Portal Cliente | 6 | ✅ Implementado |
| M8 - Firmas Digitales | 4 | ✅ Implementado |
| M9 - Informes y BI | 5 | ✅ Implementado |
| M10 - Biblioteca Legal | 7 | ✅ Implementado |
| M11 - IA Legal | 10 | ✅ Implementado |
| M12 - Biblioteca Forense | 5 | 🚧 En desarrollo |
| M13 - Integraciones | 8 | 🚧 En desarrollo |
| M14 - CRM | 10 | ✅ Implementado |
| M15 - Gestión Conflictos | 6 | ✅ Implementado |
| M16 - Administración | 7 | ✅ Implementado |

---

## 📝 NOTAS IMPORTANTES

1. **Rutas Alias:** Algunas páginas tienen rutas cortas para fácil acceso (ej: `/expedientes` → `/core/expedientes`)

2. **Parámetros de URL:** Las rutas con `:id` indican parámetros dinámicos (ej: `/expedientes/123`)

3. **Jerarquía de Roles:** 
   - super_admin tiene acceso a todo
   - socio tiene acceso casi total
   - roles específicos tienen acceso limitado a sus funciones

4. **Protección de Rutas:** Todas las rutas (excepto auth) requieren autenticación JWT

5. **Lazy Loading:** Las páginas están configuradas para carga diferida (lazy loading) para mejor performance

---

**Documento creado:** 2026-02-23  
**Versión:** 1.0  
**Autor:** Sistema ERP Derecho

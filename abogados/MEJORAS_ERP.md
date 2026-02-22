# MEJORAS ERP

## 1. Funcionalidades que NO existen y sin las cuales el producto no puede competir en el mercado

| # | Carencia | Descripción y Justificación | Prioridad | Fase |
|---|----------|-----------------------------|-----------|------|
| **F1** | **Gestor Documental por Expediente** | No existe un repositorio de documentos INTERNO vinculado a cada expediente. El Portal Cliente tiene docs, la Biblioteca es forense, pero el abogado no puede subir/organizar/versionar demandas, escritos, pruebas, correspondencia dentro del caso. Sin esto, el expediente está incompleto. Es la carencia #1. | **CRÍTICO** | Fase 0 |
| **F2** | **Integración LexNET/eJusticia** | Envío y recepción de notificaciones judiciales electrónicas. Obligatorio para operar con los juzgados españoles. Todos los competidores (MN Program, Kleos, Aranzadi) lo tienen. Sin LexNET = sin mercado. | **CRÍTICO** | Fase 1 |
| **F3** | **Sistema IA/RAG Legal** | Asistente IA con búsqueda semántica sobre documentos, generación de escritos, análisis de contratos, resumen de expedientes. Es el diferenciador que justifica precio premium. Ningún competidor español lo ofrece integrado. | **ALTO** | Fase 2 |
| **F4** | **CRM / Pipeline Comercial** | No existe seguimiento de leads, oportunidades, ni conversión de clientes potenciales. Un despacho necesita saber de dónde vienen sus clientes y cuántos pierde. | **ALTO** | Fase 2 |
| **F5** | **App Móvil Nativa** | Solo versión web (responsive). Competidores como BaseNet y Kleos tienen app. Un abogado en juzgado necesita consultar rápido desde el móvil. | **ALTO** | Fase 3 |
| **F6** | **Integración Office 365/Google** | No se observa conexión con Outlook, Calendar, Drive, Gmail. Es estándar del mercado y esperado por cualquier bufete. | **MEDIO** | Fase 2 |
| **F7** | **Multi-idioma / Multi-divisa** | Para bufetes internacionales o con clientes extranjeros. Actualmente solo español. | **BAJO** | Fase 3 |

---

## 2. Módulos que existen pero necesitan mejoras para competir al máximo nivel

| # | Módulo | Mejora Necesaria | Impacto | Esf. | Fase |
|---|--------|------------------|---------|------|------|
| **M1** | **Plantillas** | Las 10 plantillas existen pero no tienen MERGE automático con datos del expediente. El abogado debería seleccionar plantilla + expediente y obtener el documento pre-rellenado (nombre cliente, nº expediente, juzgado, fechas, importes). Sin esto, las plantillas son PDFs estáticos. | **ALTO** | Medio | Fase 1 |
| **M2** | **Prescripciones** | Aparecen en Dashboard y como columna en Expedientes con cuenta atrás. Falta un MOTOR DE ALERTAS ESCALONADAS: aviso a 90d, 60d, 30d, 15d, 7d, 1d con escalación automática al supervisor si no se actúa. | **ALTO** | Bajo | Fase 0 |
| **M3** | **Legislación Oficial** | La estructura existe (Constitución, Códigos, BOE, Jurisprudencia) pero necesita CONTENIDO REAL y actualizaciones automáticas. Conectar con APIs del BOE y CENDOJ para tener legislación siempre actualizada. | **ALTO** | Alto | Fase 2 |
| **M4** | **Biblioteca Forense** | Excelente funcionalidad. Añadir: historial de verificaciones por caso, exportar informe pericial PDF, integración con expediente (adjuntar resultado de verificación directamente al caso). | **MEDIO** | Bajo | Fase 1 |
| **M5** | **Firmas Digitales** | Presente en Portal Cliente. Necesita: compatibilidad con certificados FNMT, firma con DNIe, firma múltiple (varios firmantes secuenciales), sellado de tiempo. | **MEDIO** | Medio | Fase 1 |
| **M6** | **Portal Cliente** | Ya es excelente. Añadir: notificaciones push/email al cliente cuando hay novedad, encuesta de satisfacción post-caso, pago online con Stripe/Redsys. | **MEDIO** | Medio | Fase 1 |
| **M7** | **Cobranza** | Muy completo. Añadir: automatización de recordatorios (email automático a X días de vencimiento), integración con domiciliaciones SEPA, generación automática de carta de reclamación. | **MEDIO** | Medio | Fase 2 |
| **M8** | **Gastos/Proveedores** | Bien resueltos. Añadir: OCR para escaneo de tickets/facturas, conciliación bancaria automática, presupuesto por caso con alertas de desviación. | **MEDIO** | Medio | Fase 2 |
| **M9** | **LOPDGDD** | Bitácora existe y es buena. Falta: políticas de retención documental, cifrado end-to-end, gestión de consentimientos, derecho al olvido automatizado, registro de actividades de tratamiento. | **ALTO** | Medio | Fase 1 |
| **M10** | **Informes** | 5 pestañas completas. Mejorar: KPIs de rentabilidad POR CASO y POR ABOGADO (coste hora vs facturado), benchmark vs objetivos individuales, informes personalizados guardables. | **MEDIO** | Bajo | Fase 1 |

---

## 3. FUNCIONALIDADES NUEVAS

| # | Innovación | Descripción | Impacto | Fase |
|---|------------|-------------|---------|------|
| **N1** | **Copiloto IA Legal** | Asistente conversacional dentro del ERP: “Resúmeme el expediente EXP-2024-001”, “Redacta un escrito de contestación basado en mis plantillas”, “¿Qué jurisprudencia aplica a este caso?”. Basado en RAG con los documentos propios del bufete. | **CRÍTICO** | Fase 2 |
| **N2** | **Análisis Predictivo** | IA que predice: probabilidad de éxito del caso, duración estimada, coste probable, basado en histórico de casos similares del bufete. KPI “Tasa de Éxito 94%” ya aparece en Informes. | **ALTO** | Fase 3 |
| **N3** | **Automatización Workflows** | Motor de reglas: “Cuando se crea audiencia → notificar cliente + crear tarea de preparación + bloquear agenda”. “Cuando prescripción < 30d → escalar a socio”. Reduce trabajo manual. | **ALTO** | Fase 2 |
| **N4** | **OCR Inteligente** | Escanear cualquier documento y extraer automáticamente: nombres, fechas, importes, NIFs, números de expediente judicial. Vinculación automática al caso correcto. | **ALTO** | Fase 2 |
| **N5** | **Tablero Económico por Caso** | Vista de rentabilidad real de cada expediente: horas dedicadas x coste/hora vs honorarios cobrados vs gastos imputados. El socio ve QUÉ casos ganan dinero y cuáles pierden. | **ALTO** | Fase 1 |
| **N6** | **Portal Juzgados** | Integración bidireccional con sistema judicial: recibir notificaciones, consultar estado actuaciones, recibir señalamientos automáticamente en el calendario. | **ALTO** | Fase 3 |
| **N7** | **Sistema de Turnos de Oficio** | Gestión de guardias, asignación de turnos, registro de actuaciones de oficio, facturación al turno. Funcionalidad específica para penalistas que nadie ofrece bien. | **MEDIO** | Fase 3 |
| **N8** | **Firma Biométrica** | Firma en tablet/móvil con captura biométrica para hojas de encargo y consentimientos presenciales en el despacho. | **MEDIO** | Fase 3 |
| **N9** | **Marketplace de Integraciones** | API abierta + conectores: Registros de la Propiedad, Registro Mercantil, AEAT (consultas fiscales), Seguridad Social, catastro. Cada integración añade valor. | **MEDIO** | Fase 3 |
| **N10** | **White-Label para Colegios** | Versión personalizable para Colegios de Abogados que la ofrezcan a sus colegiados con marca propia. Canal de distribución masivo. | **MEDIO** | Fase 3 |

# Diseno de las 9 Funcionalidades Pendientes

> Stack actual: React 19 + Vite 7 + TypeScript 5.9 + Tailwind 4 + Framer Motion
> Sin backend propio (todo frontend). Cada feature necesita backend.

---

## Indice

1. [F4 - CRM / Pipeline Comercial](#f4---crm--pipeline-comercial)
2. [F5 - App Movil Nativa](#f5---app-movil-nativa)
3. [F6 - Integracion Office 365 / Google](#f6---integracion-office-365--google)
4. [F7 - Multi-idioma / Multi-divisa](#f7---multi-idioma--multi-divisa)
5. [M3 - Legislacion APIs BOE/CENDOJ](#m3---legislacion-apis-boecendoj)
6. [M9 - LOPDGDD Compliance](#m9---lopdgdd-compliance)
7. [N2 - Analisis Predictivo](#n2---analisis-predictivo)
8. [N7 - Turnos de Oficio](#n7---turnos-de-oficio)
9. [N9 - Marketplace de Integraciones](#n9---marketplace-de-integraciones)

---

## F4 - CRM / Pipeline Comercial

**Objetivo:** Seguimiento completo del ciclo de vida del cliente, desde lead hasta caso cerrado.

**Estado actual:** Fase 1 ✅ completada | Fase 2 ✅ completada | Fase 3 ✅ completada

---

### Fase 1 - Modelo de datos y UI base
**Duracion estimada: 2-3 semanas**
**Estado:** ✅ COMPLETADA

| Sub | Tarea | Detalle | Estado |
|---|---|---|---|
| 1.1 | Definir modelo de datos | Tablas: `leads`, `oportunidades`, `actividades_crm`, `fuentes_captacion`, `etapas_pipeline`. Campos: nombre, email, telefono, fuente (web, referido, publicidad, colegio), etapa, valor_estimado, probabilidad, abogado_asignado, fecha_contacto, notas. | ✅ |
| 1.2 | API REST endpoints | `GET/POST /api/crm/leads`, `PATCH /api/crm/leads/:id/etapa`, `GET /api/crm/pipeline`, `GET /api/crm/estadisticas`. Auth por rol (SA, SO, AD). | ✅ |
| 1.3 | Pagina Pipeline (Kanban) | Vista tablero drag-and-drop con columnas: Nuevo Lead > Contactado > Reunion > Propuesta Enviada > Negociacion > Ganado > Perdido. Cards con nombre, valor, dias en etapa, abogado. | ✅ |
| 1.4 | Pagina Lista de Leads | Tabla con filtros por fuente, etapa, abogado, fecha. Busqueda full-text. Export CSV. | ✅ |

---

### Fase 2 - Gestion de actividades y seguimiento
**Duracion estimada: 2 semanas**
**Estado:** ✅ COMPLETADA

| Sub | Tarea | Detalle | Estado |
|---|---|---|---|
| 2.1 | Timeline de actividades | Por cada lead: llamadas, emails, reuniones, notas. Registro con fecha, tipo, resultado, proxima accion. | ✅ |
| 2.2 | Recordatorios automaticos | Alerta si un lead lleva X dias sin actividad. Configurable por etapa (ej: en "Contactado" alerta a los 3 dias, en "Propuesta" a los 7 dias). | ✅ |
| 2.3 | Conversion lead a cliente | Boton "Convertir a Cliente" que crea registro en tabla `clientes` + opcion de crear expediente automaticamente. Vincula historial CRM. | ✅ |
| 2.4 | Formulario web captacion | Widget embebible o pagina publica `/contacto` que crea lead automaticamente con fuente "web". | ✅ |
| 2.5 | Integracion en Pipeline y Leads | Integrar componentes de Fase 2 en las paginas existentes. | ✅ |
| 2.6 | Rutas y navegacion | Agregar ruta `/contacto` publica. | ✅ |
| 2.7 | Verificar build | Ejecutar TypeScript check y ESLint. | ✅ |

---

### Fase 3 - Metricas y reporting
**Duracion estimada: 1-2 semanas**
**Estado:** ✅ COMPLETADA

| Sub | Tarea | Detalle | Estado |
|---|---|---|---|
| 3.1 | Dashboard CRM | KPIs: leads este mes, tasa de conversion, valor pipeline, tiempo medio de conversion, leads por fuente (grafico). | ✅ |
| 3.2 | Informe de embudo | Funnel chart:有多少 leads en cada etapa, % que pasan a la siguiente, cuellos de botella. | ✅ |
| 3.3 | ROI por fuente | Comparar coste de captacion (publicidad, eventos) vs valor de casos ganados por fuente. | ✅ |

---

### Archivos creados (Fase 3)

```
src/types/crm.ts                  # Modelos de datos (Lead, Oportunidad, ActividadCRM, etc.)
src/services/crmService.ts        # Servicio mock con CRUD
src/hooks/useCRM.ts               # Hook con estado y operaciones
src/components/crm/LeadCard.tsx   # Card draggable para Kanban
src/components/crm/KanbanBoard.tsx # Tablero Kanban
src/components/crm/ActividadTimeline.tsx    # Timeline de actividades
src/components/crm/ConvertirClienteModal.tsx # Modal de conversion a cliente
src/components/crm/RecordatoriosPanel.tsx    # Panel de recordatorios por inactividad
src/components/crm/FunneChart.tsx   # Grafico de embudo de conversion
src/components/crm/ROIPorFuente.tsx # Analisis de ROI por fuente
src/pages/crm/Pipeline.tsx        # Vista Kanban con KPIs
src/pages/crm/Leads.tsx           # Tabla con filtros/busqueda
src/pages/crm/Contacto.tsx        # Pagina publica de captacion
src/pages/crm/DashboardCRM.tsx    # Dashboard con metricas y graficos
src/App.tsx                       # Rutas /crm/pipeline, /crm/leads, /crm/dashboard, /contacto
src/components/layout/Sidebar.tsx # Modulo F4 - CRM
```

### Roles con acceso
`super_admin`, `socio`, `administrador`

---

## F5 - App Movil Nativa

**Objetivo:** App para iOS y Android que permita a abogados consultar expedientes, calendario y notificaciones desde el juzgado.

### Fase 1 - Setup Capacitor + Shell
**Duracion estimada: 1-2 semanas**

| Sub | Tarea | Detalle |
|---|---|---|
| 1.1 | Instalar Capacitor | `npm install @capacitor/core @capacitor/cli`. Inicializar con `npx cap init`. Configurar `capacitor.config.ts` apuntando a build de Vite. |
| 1.2 | Plugins nativos base | `@capacitor/push-notifications`, `@capacitor/camera`, `@capacitor/filesystem`, `@capacitor/haptics`, `@capacitor/status-bar`. |
| 1.3 | Proyecto iOS + Android | `npx cap add ios && npx cap add android`. Configurar iconos, splash screen, bundle ID (`com.derecho.erp`). |
| 1.4 | Deteccion de plataforma | Hook `usePlatform()` que retorna `web | ios | android`. Ajustar safe areas, navegacion y gestos segun plataforma. |

### Fase 2 - Vistas moviles prioritarias
**Duracion estimada: 3-4 semanas**

| Sub | Tarea | Detalle |
|---|---|---|
| 2.1 | Layout movil | Bottom tab bar (Dashboard, Expedientes, Calendario, Mensajes, Mas). Header simplificado. Sidebar reemplazada por tabs. |
| 2.2 | Dashboard movil | Vista compacta: proximas audiencias (hoy/manana), tareas pendientes, alertas prescripcion, notificaciones recientes. |
| 2.3 | Expedientes movil | Lista con busqueda, pull-to-refresh. Detalle con tabs (Info, Documentos, Notas). Posibilidad de hacer fotos y adjuntar al expediente. |
| 2.4 | Calendario movil | Vista dia/semana. Integracion con calendario nativo del dispositivo. Alertas push para audiencias. |
| 2.5 | Push notifications | Backend envia push via Firebase Cloud Messaging (FCM) para: nuevas audiencias, vencimiento prescripcion, mensajes de cliente, asignacion de tarea. |

### Fase 3 - Funcionalidades offline y publicacion
**Duracion estimada: 2-3 semanas**

| Sub | Tarea | Detalle |
|---|---|---|
| 3.1 | Cache offline | Service worker + IndexedDB para expedientes recientes, calendario de la semana, contactos. Sincronizacion al reconectar. |
| 3.2 | Firma desde movil | Pad de firma tactil para hojas de encargo en reuniones presenciales. |
| 3.3 | Publicacion stores | Apple App Store (requiere cuenta dev $99/ano), Google Play ($25 unica vez). Configurar CI/CD con GitHub Actions para builds automaticos. |

### Archivos a crear
```
capacitor.config.ts
src/layouts/MobileLayout.tsx
src/components/mobile/BottomTabBar.tsx
src/components/mobile/MobileDashboard.tsx
src/components/mobile/MobileExpedienteList.tsx
src/hooks/usePlatform.ts
src/hooks/usePushNotifications.ts
src/services/offlineStorage.ts
ios/    (generado por Capacitor)
android/ (generado por Capacitor)
```

---

## F6 - Integracion Office 365 / Google

**Objetivo:** Sincronizar calendario, email y documentos con las herramientas que ya usa el bufete.

### Fase 1 - Autenticacion OAuth2
**Duracion estimada: 1-2 semanas**

| Sub | Tarea | Detalle |
|---|---|---|
| 1.1 | Registro apps en proveedores | Crear app en Azure AD (Microsoft) y Google Cloud Console. Obtener client_id, client_secret, redirect_uri. Scopes: `Calendars.ReadWrite`, `Mail.Read`, `Files.ReadWrite`. |
| 1.2 | Flujo OAuth2 backend | Endpoint `/api/auth/microsoft/callback` y `/api/auth/google/callback`. Guardar tokens (access + refresh) cifrados en BD por usuario. |
| 1.3 | UI de conexion | Pagina `/configuracion/integraciones` con botones "Conectar con Microsoft 365" y "Conectar con Google Workspace". Estado: conectado/desconectado, cuenta vinculada, ultima sincronizacion. |
| 1.4 | Refresh token automatico | Middleware que renueva tokens expirados. Alerta si falla (usuario debe reconectar). |

### Fase 2 - Sincronizacion de calendario
**Duracion estimada: 2 semanas**

| Sub | Tarea | Detalle |
|---|---|---|
| 2.1 | Sync bidireccional | Audiencias/eventos del ERP se crean en Outlook/Google Calendar y viceversa. Campo `external_id` para vincular. |
| 2.2 | Deteccion de conflictos | Si un evento se modifica en ambos lados entre syncs, mostrar modal de resolucion: "Mantener version ERP / Mantener version externa / Fusionar". |
| 2.3 | Sync automatico periodico | Cron cada 15 min o webhook (Microsoft Graph change notifications / Google Calendar push). |

### Fase 3 - Email y Drive
**Duracion estimada: 2-3 semanas**

| Sub | Tarea | Detalle |
|---|---|---|
| 3.1 | Vinculacion emails a expediente | Desde bandeja entrada, boton "Vincular a expediente" que asocia el email (asunto, cuerpo, adjuntos) al caso. |
| 3.2 | Envio email desde ERP | Componer email desde expediente usando cuenta Outlook/Gmail del usuario. Plantillas pre-rellenadas. |
| 3.3 | Sync documentos Drive/OneDrive | Carpeta por expediente en Drive/OneDrive. Upload desde ERP sube a la nube. Descargar desde nube aparece en ERP. |

### Archivos a crear
```
src/pages/configuracion/Integraciones.tsx
src/components/integraciones/OAuthConnectButton.tsx
src/components/integraciones/CalendarSyncStatus.tsx
src/components/integraciones/EmailVincularModal.tsx
src/services/microsoftService.ts
src/services/googleService.ts
src/hooks/useCalendarSync.ts
src/hooks/useEmailIntegration.ts
src/types/integraciones.ts
```

### Roles con acceso
Todos los roles (cada usuario conecta su propia cuenta)

---

## F7 - Multi-idioma / Multi-divisa

**Objetivo:** Soporte para bufetes internacionales con clientes en multiples idiomas y divisas.

### Fase 1 - Infraestructura i18n
**Duracion estimada: 2-3 semanas**

| Sub | Tarea | Detalle |
|---|---|---|
| 1.1 | Instalar react-i18next | `npm install i18next react-i18next i18next-browser-languagedetector i18next-http-backend`. Configurar en `src/i18n.ts`. |
| 1.2 | Extraer strings al espanol | Recorrer TODAS las paginas y componentes. Reemplazar texto hardcoded por `t('key')`. Archivo base: `public/locales/es/translation.json`. Estimar ~2000-3000 strings. |
| 1.3 | Traduccion ingles | `public/locales/en/translation.json`. Primera traduccion con IA, revision humana. |
| 1.4 | Selector de idioma | Dropdown en header/perfil. Persistir en localStorage y BD de usuario. Detectar idioma del navegador como default. |

### Fase 2 - Multi-divisa
**Duracion estimada: 1-2 semanas**

| Sub | Tarea | Detalle |
|---|---|---|
| 2.1 | Configuracion de divisa | En ajustes del bufete: divisa principal (EUR, USD, GBP, MXN). Por expediente: divisa del caso (para clientes internacionales). |
| 2.2 | Formateo automatico | Hook `useCurrency(amount, currency?)` que usa `Intl.NumberFormat` con la divisa correcta. Reemplazar todos los `currency: 'EUR'` hardcoded. |
| 2.3 | Tasas de cambio | Integracion con API gratuita (exchangerate-api.com o ECB). Cache diario. Conversion automatica en informes consolidados. |

### Fase 3 - Idiomas adicionales y legal
**Duracion estimada: 2-3 semanas**

| Sub | Tarea | Detalle |
|---|---|---|
| 3.1 | Catalan, Euskera, Gallego | Lenguas cooficiales espanolas. Importante para administraciones autonomicas. |
| 3.2 | Portugues, Frances, Aleman | Para bufetes con clientes europeos. |
| 3.3 | Documentos legales traducidos | Plantillas en multiples idiomas. El sistema genera el documento en el idioma del cliente. |

### Archivos a crear
```
src/i18n.ts
public/locales/es/translation.json
public/locales/en/translation.json
public/locales/ca/translation.json
src/hooks/useCurrency.ts
src/hooks/useLocale.ts
src/components/ui/LanguageSelector.tsx
src/components/ui/CurrencySelector.tsx
src/services/exchangeRateService.ts
src/types/i18n.ts
```

---

## M3 - Legislacion APIs BOE/CENDOJ

**Objetivo:** Legislacion siempre actualizada con datos reales del BOE y jurisprudencia del CENDOJ.

### Fase 1 - Integracion BOE
**Duracion estimada: 2-3 semanas**

| Sub | Tarea | Detalle |
|---|---|---|
| 1.1 | Investigar API BOE | El BOE ofrece datos abiertos en `boe.es/datosabiertos/`. Formato XML/JSON. Endpoints: busqueda por texto, por fecha, por rango legislativo. Rate limits. |
| 1.2 | Servicio de ingesta | Backend cron diario que consulta publicaciones nuevas del BOE. Parsear XML, extraer: titulo, referencia, tipo (ley, RD, orden), fecha, texto completo, materia. Guardar en BD con indice full-text. |
| 1.3 | UI de busqueda BOE | Busqueda por texto libre, filtros: tipo norma, rango fechas, materia. Resultados con preview del texto y link al BOE original. |
| 1.4 | Alertas legislativas | Suscripcion a materias: "laboral", "fiscal", "penal". Notificacion cuando se publica algo nuevo en esas areas. |

### Fase 2 - Integracion CENDOJ
**Duracion estimada: 2-3 semanas**

| Sub | Tarea | Detalle |
|---|---|---|
| 2.1 | Scraping CENDOJ | CENDOJ no tiene API publica oficial. Opciones: scraping controlado de `poderjudicial.es/search`, o contratar proveedor de datos (La Ley, Aranzadi API). |
| 2.2 | Indexacion jurisprudencia | Parsear sentencias: tribunal, sala, fecha, ponente, numero recurso, resumen, fallo. Indexar con Elasticsearch o PostgreSQL full-text. |
| 2.3 | Busqueda semantica | Buscar jurisprudencia por concepto legal, no solo por palabras clave. Usar embeddings (OpenAI/local) para busqueda vectorial. |
| 2.4 | Vinculacion a expediente | Desde un caso, buscar jurisprudencia relevante y adjuntarla como referencia. |

### Fase 3 - Actualizacion continua y alertas
**Duracion estimada: 1-2 semanas**

| Sub | Tarea | Detalle |
|---|---|---|
| 3.1 | Sync automatico diario | Cron nocturno que actualiza BOE y CENDOJ. Log de nuevas incorporaciones. |
| 3.2 | Deteccion de derogaciones | Cuando una ley nueva deroga otra, marcar la antigua como "derogada" y vincular la nueva. |
| 3.3 | Feed de novedades | Pagina "Novedades legislativas" con las ultimas publicaciones relevantes para el bufete, ordenadas por materia. |

### Archivos a crear/modificar
```
src/services/boeService.ts
src/services/cendojService.ts
src/services/legislacionSyncService.ts
src/pages/biblioteca/Legislacion.tsx        (modificar - reemplazar mock)
src/pages/biblioteca/NovedadesLegislativas.tsx
src/components/biblioteca/BuscadorBOE.tsx
src/components/biblioteca/ResultadoSentencia.tsx
src/components/biblioteca/AlertaLegislativa.tsx
src/hooks/useLegislacion.ts
src/types/legislacion.ts
```

---

## M9 - LOPDGDD Compliance

**Objetivo:** Cumplimiento total del RGPD/LOPDGDD para un bufete de abogados (responsable y encargado de tratamiento).

### Fase 1 - Registro de actividades de tratamiento (RAT)
**Duracion estimada: 2 semanas**

| Sub | Tarea | Detalle |
|---|---|---|
| 1.1 | Modelo RAT | Tabla `actividades_tratamiento`: nombre, finalidad, base_legitimadora, categorias_datos, categorias_interesados, destinatarios, transferencias_internacionales, plazo_supresion, medidas_seguridad. Cumple Art. 30 RGPD. |
| 1.2 | UI registro actividades | CRUD para gestionar actividades. Plantillas predefinidas para bufetes: "Gestion de expedientes", "Facturacion", "Marketing", "Videovigilancia", "Portal cliente". |
| 1.3 | Generacion automatica documento RAT | Export PDF/DOCX del registro completo, listo para presentar ante la AEPD si lo solicita. |

### Fase 2 - Gestion de consentimientos y derechos
**Duracion estimada: 2-3 semanas**

| Sub | Tarea | Detalle |
|---|---|---|
| 2.1 | Registro de consentimientos | Por cada cliente/contacto: que consintio, cuando, como (formulario web, email, presencial), para que finalidad. Evidencia almacenada. |
| 2.2 | Ejercicio de derechos ARSULIPO | Workflow para: Acceso, Rectificacion, Supresion, Limitacion, Portabilidad, Oposicion. Plazo legal: 1 mes. Alerta si se acerca el plazo. Registro de respuesta. |
| 2.3 | Derecho al olvido automatizado | Boton "Suprimir datos" que: anonimiza datos personales en expedientes cerrados, elimina documentos vinculados, genera certificado de supresion, respeta obligaciones de conservacion legal. |
| 2.4 | Clausulas informativas | Generador de clausulas (Art. 13/14 RGPD) adaptadas al canal: web, email, presencial. Con variables del bufete auto-rellenadas. |

### Fase 3 - Seguridad tecnica y politicas de retencion
**Duracion estimada: 2-3 semanas**

| Sub | Tarea | Detalle |
|---|---|---|
| 3.1 | Politicas de retencion | Reglas por tipo de dato: expedientes activos (indefinido), expedientes cerrados (6 anos fiscal + 5 anos prescripcion), datos contables (6 anos), logs (2 anos). Cron que marca datos a eliminar. |
| 3.2 | Cifrado en reposo | Campos sensibles (DNI, datos bancarios, datos salud) cifrados con AES-256 en BD. Clave gestionada con KMS (AWS KMS / Vault). |
| 3.3 | Evaluacion de impacto (EIPD) | Template de EIPD para tratamientos de alto riesgo (datos penales, menores). Wizard guiado con preguntas y respuestas. |
| 3.4 | Brechas de seguridad | Registro de incidentes. Workflow: deteccion > evaluacion riesgo > notificacion AEPD (72h) > notificacion afectados. Plantillas de notificacion. |

### Archivos a crear
```
src/pages/lopdgdd/Dashboard.tsx
src/pages/lopdgdd/ActividadesTratamiento.tsx
src/pages/lopdgdd/Consentimientos.tsx
src/pages/lopdgdd/DerechosARSULIPO.tsx
src/pages/lopdgdd/PoliticasRetencion.tsx
src/pages/lopdgdd/Brechas.tsx
src/components/lopdgdd/RAT_Form.tsx
src/components/lopdgdd/DerechoWorkflow.tsx
src/components/lopdgdd/SupresionDatosModal.tsx
src/components/lopdgdd/ClausulaGenerator.tsx
src/services/lopdgddService.ts
src/hooks/useConsentimientos.ts
src/hooks/useDerechos.ts
src/types/lopdgdd.ts
```

### Roles con acceso
`super_admin`, `administrador` (DPO del bufete)

---

## N2 - Analisis Predictivo

**Objetivo:** IA que predice resultados, duracion y costes de casos basandose en el historico del bufete.

### Fase 1 - Recoleccion y preparacion de datos
**Duracion estimada: 2-3 semanas**

| Sub | Tarea | Detalle |
|---|---|---|
| 1.1 | Definir dataset de entrenamiento | De cada expediente cerrado: tipo_caso, jurisdiccion, juzgado, juez (anonimizado), parte_contraria_tipo, cuantia, duracion_dias, resultado (favorable/parcial/desfavorable), coste_real, horas_dedicadas, abogado_responsable, complejidad. |
| 1.2 | Pipeline de extraccion | Script que recorre expedientes cerrados y genera CSV/JSON normalizado. Limpieza: eliminar outliers, completar campos faltantes, normalizar categorias. |
| 1.3 | Volumen minimo | Calcular cuantos casos cerrados tiene el bufete. Minimo recomendado: 200+ para predicciones basicas, 1000+ para precision alta. Si no hay suficientes, ofrecer modelo preentrenado con datos sinteticos. |

### Fase 2 - Modelos predictivos
**Duracion estimada: 3-4 semanas**

| Sub | Tarea | Detalle |
|---|---|---|
| 2.1 | Prediccion de resultado | Clasificacion: favorable / parcial / desfavorable. Features: tipo_caso, cuantia, jurisdiccion, complejidad. Modelo: Random Forest o XGBoost via API Python (FastAPI). |
| 2.2 | Estimacion de duracion | Regresion: dias estimados hasta resolucion. Features: tipo_caso, juzgado, complejidad, carga judicial. Output: rango (min-max) con intervalo de confianza. |
| 2.3 | Estimacion de coste | Regresion: coste estimado basado en tipo, duracion estimada, tarifa del abogado asignado. Incluir gastos judiciales tipicos. |
| 2.4 | API de prediccion | Endpoint `/api/prediccion/:expedienteId` que devuelve: `{ probabilidad_exito: 0.73, duracion_estimada: { min: 120, max: 240, media: 180 }, coste_estimado: { min: 3200, max: 8500, media: 5100 } }`. |

### Fase 3 - Visualizacion y mejora continua
**Duracion estimada: 2 semanas**

| Sub | Tarea | Detalle |
|---|---|---|
| 3.1 | Widget en ExpedienteDetail | Card "Analisis Predictivo" con: gauge de probabilidad de exito, timeline estimada, rango de coste. Comparacion con casos similares. |
| 3.2 | Dashboard predictivo | Vista global: distribucion de probabilidades de exito del portfolio activo, casos en riesgo (< 40% probabilidad), heatmap duracion por tipo de caso. |
| 3.3 | Feedback loop | Cuando un caso se cierra, comparar prediccion vs resultado real. Reentrenar modelo trimestralmente. Mostrar precision del modelo (ej: "Precision: 78% en ultimos 100 casos"). |

### Archivos a crear
```
src/pages/prediccion/Dashboard.tsx
src/components/prediccion/PrediccionWidget.tsx
src/components/prediccion/GaugeChart.tsx
src/components/prediccion/CasosSimilares.tsx
src/services/prediccionService.ts
src/hooks/usePrediccion.ts
src/types/prediccion.ts
```

### Stack adicional necesario
- **Backend ML:** Python + FastAPI + scikit-learn/XGBoost
- **Base de datos:** PostgreSQL (datos) + Redis (cache predicciones)
- **Infraestructura:** Docker container separado para servicio ML

---

## N7 - Turnos de Oficio

**Objetivo:** Gestion completa de turnos de oficio, guardias y justicia gratuita para penalistas y civilistas.

**Estado actual:** Fase 1 ✅ completada | Fase 2 ⏳ pendiente | Fase 3 ⏳ pendiente

---

### Fase 1 - Gestion de guardias y turnos
**Duracion estimada: 2-3 semanas**
**Estado:** ✅ COMPLETADA

| Sub | Tarea | Detalle | Estado |
|---|---|---|---|
| 1.1 | Modelo de datos | Tablas: `turnos`, `guardias`, `actuaciones_oficio`. Tipos: penal, civil, extranjeria, violencia_genero, menores. | ✅ |
| 1.2 | Calendario de turnos | Vista mensual con turnos por abogado. Colores por tipo. | ✅ |
| 1.3 | Configuracion de turnos | Filtros por tipo, partido judicial. Gestion de turnos. | ✅ |
| 1.4 | Alertas de guardia | Panel de guardias pendientes en Dashboard. | ✅ |

---

### Fase 2 - Registro de actuaciones
**Duracion estimada: 2 semanas**
**Estado:** ⏳ PENDIENTE

| Sub | Tarea | Detalle | Estado |
|---|---|---|---|
| 2.1 | Registro rapido de actuacion | Formulario movil-first: tipo, juzgado, hora, nombre detenido/cliente, delito, resultado. | ⏳ |
| 2.2 | Vinculacion a expediente | Crear expediente automaticamente desde actuacion de oficio. | ⏳ |
| 2.3 | Hoja de asistencia | PDF con datos de la actuacion para presentar al colegio. | ⏳ |

---

### Fase 3 - Facturacion y estadisticas
**Duracion estimada: 2 semanas**
**Estado:** ⏳ PENDIENTE

| Sub | Tarea | Detalle | Estado |
|---|---|---|---|
| 3.1 | Baremo de oficio | Tabla de tarifas oficiales por CCAA y tipo. Auto-calculo. | ⏳ |
| 3.2 | Liquidacion trimestral | Resumen de actuaciones del trimestre para el Colegio. | ⏳ |
| 3.3 | Estadisticas de oficio | Dashboard: actuaciones por mes, ingresos, tipos de delito, etc. | ⏳ |

---

### Archivos implementados

```
src/types/oficio.ts                  # Modelos de datos (Turno, Guardia, ActuacionOficio)
src/services/oficioService.ts          # Servicio mock con CRUD
src/hooks/useTurnos.ts                 # Hook con estado y operaciones
src/components/oficio/CalendarioTurnos.tsx  # Calendario visual mensual
src/pages/oficio/DashboardOficio.tsx  # Dashboard con KPIs
src/pages/oficio/Turnos.tsx           # Gestion de turnos
src/pages/oficio/Guardias.tsx         # Gestion de guardias
src/App.tsx                           # Rutas /oficio/*
src/components/layout/Sidebar.tsx     # Modulo N7 - Turnos de Oficio
```

### Roles con acceso
`super_admin`, `socio`, `abogado_senior`, `abogado_junior`

---

## N9 - Marketplace de Integraciones

**Objetivo:** API abierta y conectores con registros publicos, AEAT, Seguridad Social y otros servicios utiles para abogados.

### Fase 1 - API publica del ERP
**Duracion estimada: 3-4 semanas**

| Sub | Tarea | Detalle |
|---|---|---|
| 1.1 | Diseno API REST | Documentacion OpenAPI 3.0. Endpoints publicos: expedientes, clientes, facturas, documentos, calendario. Versionado: `/api/v1/`. Rate limiting: 1000 req/h por API key. |
| 1.2 | Autenticacion API keys | Generacion de API keys por bufete. Scopes: `expedientes:read`, `expedientes:write`, `facturacion:read`, etc. Panel de gestion de keys en Admin. |
| 1.3 | Webhooks | Eventos: `expediente.created`, `factura.paid`, `audiencia.scheduled`, `documento.uploaded`. Configuracion de URLs de destino. Reintentos con backoff exponencial. |
| 1.4 | SDK y documentacion | Portal de desarrolladores en `/developers`. SDK JavaScript/TypeScript publicado en npm. Ejemplos de integracion. Sandbox de pruebas. |

### Fase 2 - Conectores con registros publicos
**Duracion estimada: 4-6 semanas**

| Sub | Tarea | Detalle |
|---|---|---|
| 2.1 | Registro Mercantil | Consulta de datos societarios: denominacion, CIF, domicilio, administradores, apoderados, capital social, estado. Via API de Registradores o scraping controlado. |
| 2.2 | Registro de la Propiedad | Nota simple: titularidad, cargas, superficie, referencia catastral. Requiere certificado digital o acuerdo con Registradores.org. |
| 2.3 | Catastro | Consulta por referencia catastral o direccion: datos fisicos de la finca, valor catastral, titularidad. API publica de Catastro (sede electronica). |
| 2.4 | AEAT (Hacienda) | Verificacion de NIF/CIF, certificados de estar al corriente. Requiere certificado digital del bufete. Via Cl@ve o certificado FNMT. |
| 2.5 | Seguridad Social (TGSS) | Vida laboral del trabajador (con autorizacion), situacion de alta/baja. Para casos laborales. API via sistema RED. |

### Fase 3 - UI marketplace y mas conectores
**Duracion estimada: 3-4 semanas**

| Sub | Tarea | Detalle |
|---|---|---|
| 3.1 | Pagina marketplace | Catalogo visual de integraciones disponibles. Por cada una: descripcion, estado (activo/beta/pronto), boton activar/desactivar, configuracion. |
| 3.2 | Widget de consulta rapida | Desde cualquier expediente: boton "Consultar Registro Mercantil" que con el CIF del cliente trae datos al instante. Idem para Catastro con referencia catastral. |
| 3.3 | Conectores adicionales | DGT (Trafico): datos del vehiculo para accidentes. INE: datos demograficos. CIRBE (Banco de Espana): riesgo crediticio. Interpol: ordenes internacionales. |
| 3.4 | Integraciones de terceros | Permitir que proveedores externos publiquen conectores. Sistema de revision y aprobacion. Modelo freemium. |

### Archivos a crear
```
src/pages/marketplace/Marketplace.tsx
src/pages/marketplace/IntegracionDetail.tsx
src/pages/marketplace/APIKeys.tsx
src/pages/marketplace/Webhooks.tsx
src/pages/marketplace/Developers.tsx
src/components/marketplace/IntegracionCard.tsx
src/components/marketplace/ConsultaRapidaWidget.tsx
src/components/marketplace/WebhookConfig.tsx
src/services/registroMercantilService.ts
src/services/registroPropiedadService.ts
src/services/catastroService.ts
src/services/aeatService.ts
src/services/seguridadSocialService.ts
src/hooks/useMarketplace.ts
src/hooks/useConsultaRegistro.ts
src/types/marketplace.ts
src/types/registros.ts
```

### Roles con acceso
- Marketplace: `super_admin`, `socio`, `administrador`
- API Keys: `super_admin`
- Consultas registros: `super_admin`, `socio`, `abogado_senior`, `abogado_junior`

---

## Resumen de Esfuerzo Total

| Feature | Fase 1 | Fase 2 | Fase 3 | Total Estimado |
|---|---|---|---|---|
| F4 - CRM | 2-3 sem | 2 sem | 1-2 sem | **5-7 semanas** |
| F5 - App Movil | 1-2 sem | 3-4 sem | 2-3 sem | **6-9 semanas** |
| F6 - Office/Google | 1-2 sem | 2 sem | 2-3 sem | **5-7 semanas** |
| F7 - Multi-idioma | 2-3 sem | 1-2 sem | 2-3 sem | **5-8 semanas** |
| M3 - Legislacion | 2-3 sem | 2-3 sem | 1-2 sem | **5-8 semanas** |
| M9 - LOPDGDD | 2 sem | 2-3 sem | 2-3 sem | **6-8 semanas** |
| N2 - Predictivo | 2-3 sem | 3-4 sem | 2 sem | **7-9 semanas** |
| N7 - Turnos Oficio | 2-3 sem | 2 sem | 2 sem | **6-7 semanas** |
| N9 - Marketplace | 3-4 sem | 4-6 sem | 3-4 sem | **10-14 semanas** |
| | | | **TOTAL** | **55-77 semanas** |

### Orden de implementacion sugerido

```
BLOQUE A (inmediato - valor critico)
├── M9 - LOPDGDD ............. Obligacion legal, riesgo de multa sin esto
└── M3 - Legislacion ......... Core del negocio juridico

BLOQUE B (corto plazo - competitividad)
├── F4 - CRM ................. Sin esto no creces, pierdes leads
├── N7 - Turnos de Oficio .... Nicho sin competencia, diferenciador
└── F6 - Office/Google ....... Expectativa basica de cualquier bufete

BLOQUE C (medio plazo - premium)
├── N2 - Analisis Predictivo .. Diferenciador WOW, justifica precio premium
├── F7 - Multi-idioma ........ Expansion internacional
└── F5 - App Movil ........... Complementa la web, no la reemplaza

BLOQUE D (largo plazo - plataforma)
└── N9 - Marketplace ......... Ecosistema, efecto red, ingresos recurrentes
```

# Comparativa MEJORAS_ERP.md vs Estado Actual

> Generado: 2026-02-21 | Basado en analisis del codigo fuente

---

## Leyenda

| Icono | Significado |
|---|---|
| :white_check_mark: HECHO | Implementado y funcional |
| :large_orange_diamond: UI MOCK | La interfaz existe pero usa datos falsos / sin backend real |
| :red_circle: PENDIENTE | No existe en el codigo |

---

## 1. Funcionalidades Criticas (F1-F7)

| # | Funcionalidad | Estado | Detalle |
|---|---|---|---|
| F1 | Gestor Documental por Expediente | :large_orange_diamond: UI MOCK | `GestorDocumental.tsx` (1237 lineas) con carpetas, upload, versionado, filtros. Integrado en `ExpedienteDetail.tsx` como tab "Documentos". **Pero:** todo en estado local React, sin API real ni almacenamiento en servidor. |
| F2 | Integracion LexNET | :large_orange_diamond: UI MOCK | `Lexnet.tsx` existe con bandeja entrada/salida, estado conexion, envio. **Pero:** datos hardcoded (`comunicacionesLexnetMock`), sync es un `setTimeout(2000)`. Sin API LexNET real. |
| F3 | Sistema IA/RAG Legal | :large_orange_diamond: UI MOCK | 3 paginas: Chat, Busqueda, Generador. UI completa. **Pero:** respuestas hardcoded en `mockResponses`, busqueda devuelve `resultadosMock`, generador usa template string fija. Zero IA real. |
| F4 | CRM / Pipeline Comercial | :red_circle: PENDIENTE | No existe. Solo mencion en `features.ts` del landing como feature futura. |
| F5 | App Movil Nativa | :red_circle: PENDIENTE | No hay React Native, Capacitor ni Ionic. Solo web responsive con Vite. |
| F6 | Integracion Office 365/Google | :red_circle: PENDIENTE | Sin OAuth, sin Google Calendar, sin Outlook, sin Drive. |
| F7 | Multi-idioma / Multi-divisa | :red_circle: PENDIENTE | Sin i18n. Todo hardcoded en espanol. Moneda fija `EUR` en todos los `Intl.NumberFormat`. |

### Resumen Seccion 1

| Estado | Cantidad | % |
|---|---|---|
| :large_orange_diamond: UI MOCK | 3 | 43% |
| :red_circle: PENDIENTE | 4 | 57% |
| **Total** | **7** | |

---

## 2. Mejoras a Modulos Existentes (M1-M10)

| # | Mejora | Estado | Detalle |
|---|---|---|---|
| M1 | Plantillas - Merge automatico | :large_orange_diamond: UI MOCK | `TemplateMergeModal` importado, variables `{{placeholder}}` definidas. **Pero:** no conecta con datos reales de expedientes. |
| M2 | Prescripciones - Alertas escalonadas | :large_orange_diamond: UI MOCK | Alerta basica cuando `diasRestantes <= 30` (estado "peligro"). **Falta:** escalacion a 90d/60d/30d/15d/7d/1d, notificacion al supervisor, motor de alertas. |
| M3 | Legislacion - APIs BOE/CENDOJ | :red_circle: PENDIENTE | Codigo dice explicitamente: "Currently uses MOCK data. Configure VITE_BOE_API_KEY/VITE_CENDOJ_API_KEY". Sin conexion real. |
| M4 | Biblioteca Forense - Mejoras | :large_orange_diamond: UI MOCK | Verificacion con score de confianza. **Falta:** historial por caso, export PDF real, vinculacion a expediente. Usa `Math.random()`. |
| M5 | Firmas Digitales - Avanzadas | :large_orange_diamond: UI MOCK | UI soporta tipos: simple, avanzada, cualificada, biometrica, certificado. **Falta:** FNMT real, DNIe, firma multiple secuencial, sellado de tiempo RFC 3161. |
| M6 | Portal Cliente - Mejoras | :large_orange_diamond: UI MOCK | `PushNotificationPrompt` y `PushToggle` existen en UI. **Falta:** push real, encuestas satisfaccion, pago online Stripe/Redsys (solo toast "Procesando pago..."). |
| M7 | Cobranza - Automatizacion | :large_orange_diamond: UI MOCK | Aging summary (1-30d, 31-60d, etc.), boton "Enviar Recordatorio" manual. **Falta:** emails automaticos, SEPA, carta reclamacion autogenerada. |
| M8 | Gastos/OCR | :large_orange_diamond: UI MOCK | OCR UI completa (drag-drop, extraccion campos). **Pero:** `ocrService.ts` devuelve mock data. Sin conciliacion bancaria, sin presupuesto por caso. |
| M9 | LOPDGDD | :red_circle: PENDIENTE | `Bitacora.tsx` tiene logging de actividad. **Falta:** politicas retencion, cifrado e2e, gestion consentimientos, derecho al olvido. |
| M10 | Informes KPIs | :large_orange_diamond: UI MOCK | `Rentabilidad.tsx` muestra margen por caso y por abogado. **Pero:** todo mock. **Falta:** benchmarks, informes guardables, comparativa vs objetivos. |

### Resumen Seccion 2

| Estado | Cantidad | % |
|---|---|---|
| :large_orange_diamond: UI MOCK | 8 | 80% |
| :red_circle: PENDIENTE | 2 | 20% |
| **Total** | **10** | |

---

## 3. Funcionalidades Nuevas / Innovaciones (N1-N10)

| # | Innovacion | Estado | Detalle |
|---|---|---|---|
| N1 | Copiloto IA Legal | :large_orange_diamond: UI MOCK | Chat con historial conversaciones, sidebar. Dice "RAG" pero usa `mockResponses` con `setTimeout(1500)`. Zero backend IA. |
| N2 | Analisis Predictivo | :red_circle: PENDIENTE | No existe. Sin modelos ML, sin probabilidad de exito, sin estimacion duracion. |
| N3 | Automatizacion Workflows | :large_orange_diamond: UI MOCK | Solo workflows de firma (secuencial/paralelo en `SignatureModal.tsx`). No hay motor de reglas general ("cuando X -> hacer Y"). |
| N4 | OCR Inteligente | :large_orange_diamond: UI MOCK | UI excelente con drag-drop, campos extraidos (proveedor, CIF, importes). **Pero:** `ocrService.ts` devuelve datos fake. Sin Tesseract real. |
| N5 | Tablero Economico por Caso | :large_orange_diamond: UI MOCK | `Rentabilidad.tsx` tiene tabla por caso (facturado vs coste vs margen). `ExpedienteDetail` menciona "Rentabilidad estimada". Todo datos mock. |
| N6 | Portal Juzgados | :large_orange_diamond: UI MOCK | `Juzgados.tsx` + `Lexnet.tsx` con UI de bandeja, envio, directorio. Sin integracion judicial real. |
| N7 | Turnos de Oficio | :red_circle: PENDIENTE | No existe. Sin turnos, guardias ni gestion de oficio. |
| N8 | Firma Biometrica | :large_orange_diamond: UI MOCK | Tipo "biometric" en selector de firmas. Sin captura real de presion/velocidad ni pad de firma en tablet. |
| N9 | Marketplace Integraciones | :red_circle: PENDIENTE | No existe. Sin API abierta, sin conectores Registro Propiedad, AEAT, Catastro. |
| N10 | White-Label Colegios | :large_orange_diamond: UI MOCK | Theme toggle light/dark/system. **Falta:** branding personalizable, logo, colores por colegio. |

### Resumen Seccion 3

| Estado | Cantidad | % |
|---|---|---|
| :large_orange_diamond: UI MOCK | 7 | 70% |
| :red_circle: PENDIENTE | 3 | 30% |
| **Total** | **10** | |

---

## Resumen General

| Categoria | Total Items | :white_check_mark: Hecho | :large_orange_diamond: UI Mock | :red_circle: Pendiente |
|---|---|---|---|---|
| Funcionalidades Criticas (F) | 7 | 0 | 3 | 4 |
| Mejoras Modulos (M) | 10 | 0 | 8 | 2 |
| Innovaciones (N) | 10 | 0 | 7 | 3 |
| **TOTAL** | **27** | **0 (0%)** | **18 (67%)** | **9 (33%)** |

---

## Conclusion

**Ninguna mejora esta completamente implementada.** El 67% tiene UI construida con datos mock (sin backend/APIs reales), y el 33% restante no existe en absoluto.

### Lo que falta para produccion:

1. **Backend/APIs reales** para las 18 funcionalidades con UI mock
2. **9 funcionalidades** por construir desde cero (F4-F7, M3, M9, N2, N7, N9)
3. **Integraciones externas criticas**: LexNET, BOE/CENDOJ, FNMT/DNIe, Stripe/Redsys, Office 365, SEPA
4. **Motor de IA**: RAG con embeddings, OCR real (Tesseract/Google Vision), analisis predictivo

### Prioridad sugerida:

| Prioridad | Items | Razon |
|---|---|---|
| **Fase 0** | F1 (backend), M2 (alertas) | Sin documentos reales y alertas, el core no funciona |
| **Fase 1** | F2 (LexNET), M1 (merge), M5 (firmas), M9 (LOPDGDD), N5 (rentabilidad) | Competitividad minima en mercado espanol |
| **Fase 2** | F3 (IA), F4 (CRM), N1 (copiloto), N3 (workflows), N4 (OCR) | Diferenciacion y valor premium |
| **Fase 3** | F5 (movil), F6 (Office), F7 (i18n), N7-N10 | Expansion y escalabilidad |

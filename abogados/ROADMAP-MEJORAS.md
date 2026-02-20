# Roadmap de Mejoras UX/UI - 15 Páginas del ERP Legal

**Versión:** 1.0  
**Fecha:** 2026-02-20  
**Alcance:** Solo las 15 páginas creadas en este proyecto

---

## 📋 Las 15 Páginas Creadas

| # | Página | Módulo | Ruta |
|---|--------|---------|------|
| 1 | Prescripciones | M1 - Core Legal | `/core/prescripciones` |
| 2 | Buscar | M2 - Gestión Documental | `/documentos/buscar` |
| 3 | OCR | M2 - Gestión Documental | `/documentos/ocr` |
| 4 | Proveedores | M4 - Cobranza | `/cobranza/proveedores` |
| 5 | Cobranza/Config | M4 - Cobranza | `/cobranza/config` |
| 6 | Tiempo/Informes | M5 - Tiempo | `/tiempo/informes` |
| 7 | Juzgados | M6 - Comunicaciones | `/comunicaciones/juzgados` |
| 8 | Notificaciones | M6 - Comunicaciones | `/comunicaciones/notificaciones` |
| 9 | Chat IA | M11 - IA Legal | `/ia/chat` |
| 10 | Generador Escritos | M11 - IA Legal | `/ia/generador` |
| 11 | Rentabilidad | M3 - Finanzas | `/finanzas/rentabilidad` |
| 12 | Búsqueda Semántica | M11 - IA Legal | `/ia/busqueda` |
| 13 | Verificar Documentos | M12 - Forense | `/forense/verificar` |
| 14 | Informes Periciales | M12 - Forense | `/forense/informes` |
| 15 | LexNET | M13 - Integraciones | `/integraciones/lexnet` |

---

## 🎨 Sistema de Diseño Actual (Mantener)

### Colores del Tema
- **Primary:** `#6366f1` (Indigo-500) - `--color-accent`
- **Background:** `#0f172a` (Slate-900) dark / `#f8fafc` light
- **Surface:** `#1e293b` (Slate-800) dark / `#ffffff` light
- **Border:** `#334155` (Slate-700) dark / `#e2e8f0` light
- **Success:** Emerald-400
- **Warning:** Amber-400
- **Error:** Red-400

### Roles Existentes
- super_admin, socio, abogado_senior, abogado_junior
- paralegal, secretario, administrador, contador, recepcionista, cliente

---

## 🚀 30 Fases de Mejora (Enfocadas en las 15 Páginas)

---

## 🔵 FASE 1: Skeleton Loaders (Semana 1)

### 1.1 Skeletons para Tablas
- [ ] **Prescripciones** - Skeleton en tabla de expedientes
- [ ] **Buscar** - Skeleton en resultados de búsqueda
- [ ] **Proveedores** - Skeleton en grid de proveedores
- [ ] **Tiempo/Informes** - Skeleton en tablas de productividad
- [ ] **Rentabilidad** - Skeleton en tablas de rentabilidad

### 1.2 Skeletons para Cards
- [ ] **Chat IA** - Skeleton en mensajes
- [ ] **LexNET** - Skeleton en bandeja de entrada
- [ ] **Notificaciones** - Skeleton en lista de notificaciones
- [ ] **Verificar Documentos** - Skeleton en resultado de verificación

### 1.3 Skeletons para Formularios
- [ ] **OCR** - Skeleton al procesar imagen
- [ ] **Generador Escritos** - Skeleton al generar documento
- [ ] **Cobranza/Config** - Skeleton al cargar configuración

---

## 🔵 FASE 2: Estados Vacíos (Semana 1)

### 2.1 Empty States para Búsquedas
- [ ] **Buscar** - Ilustración + mensaje + sugerencias de búsqueda
- [ ] **Búsqueda Semántica** - Ilustración + ejemplos de consultas

### 2.2 Empty States para Lists
- [ ] **Proveedores** - "No hay proveedores. Añade el primero"
- [ ] **Notificaciones** - "No tienes notificaciones"
- [ ] **Informes Periciales** - "No hay informes generados"

### 2.3 Empty States para Detalles
- [ ] **Juzgados** - "No hay comunicaciones"
- [ ] **Verificar Documentos** - "Sube un documento para verificar"

---

## 🔵 FASE 3: Persistencia LocalStorage (Semana 2)

### 3.1 Guardar Filtros
- [ ] **Prescripciones** - Guardar tipo/estado seleccionados
- [ ] **Proveedores** - Guardar categoría/filtros
- [ ] **Buscar** - Guardar últimos filtros usados
- [ ] **Rentabilidad** - Guardar mes/vista seleccionados

### 3.2 Guardar Preferencias UI
- [ ] **Sidebar** - Estado expandido de módulos
- [ ] **Chat IA** - Guardar historial de conversación
- [ ] **Notificaciones** - Guardar pestaña activa

### 3.3 Guardar Datos de Formularios
- [ ] **OCR** - Recordar última configuración
- [ ] **Generador Escritos** - Auto-guardar borrador
- [ ] **Cobranza/Config** - Persistir configuración

---

## 🔵 FASE 4: Mejoras de Tablas (Semana 2-3)

### 4.1 Sorting
- [ ] **Prescripciones** - Ordenar por fecha, estado, días restantes
- [ ] **Proveedores** - Ordenar por nombre, rating, facturación
- [ ] **Tiempo/Informes** - Ordenar por abogado, horas, eficiencia

### 4.2 Column Visibility
- [ ] **Prescripciones** - Toggle columnas visibles
- [ ] **Rentabilidad** - Mostrar/ocultar columnas
- [ ] **Proveedores** - Personalizar vista

### 4.3 Pagination
- [ ] **Buscar** - Implementar paginación real
- [ ] **Proveedores** - Añadir selector de página
- [ ] **Juzgados** - Infinite scroll o pagination

---

## 🔵 FASE 5: Búsqueda y Filtros (Semana 3)

### 5.1 Search en Tiempo Real
- [ ] **Proveedores** - Debounced search
- [ ] **Notificaciones** - Filter en tiempo real
- [ ] **Informes Periciales** - Search instantáneo

### 5.2 Filtros Avanzados
- [ ] **Prescripciones** - Filtros combinados (tipo + estado + abogado)
- [ ] **Tiempo/Informes** - Filtro por rango de fechas
- [ ] **Rentabilidad** - Filtro por período

### 5.3 Búsqueda Global
- [ ] Implementar Ctrl+K para búsqueda global
- [ ] Buscar en todas las 15 páginas
- [ ] Resultados categorizados por página

---

## 🔵 FASE 6: Estados de Error (Semana 3)

### 6.1 Manejo de Errores API
- [ ] **OCR** - Error al procesar imagen (tamaño, formato)
- [ ] **Chat IA** - Error de conexión con IA
- [ ] **LexNET** - Error de sincronización

### 6.2 Validación de Formularios
- [ ] **Generador Escritos** - Validar campos requeridos
- [ ] **Proveedores** - Validar CIF único
- [ ] **Verificar Documentos** - Validar tipo de archivo

### 6.3 Estados de Error UI
- [ ] Crear componente ErrorState reutilizable
- [ ] Añadir a todas las páginas que consumen datos
- [ ] Botones de retry

---

## 🔵 FASE 7: Interactividad en Formularios (Semana 4)

### 7.1 Validación en Tiempo Real
- [ ] **Proveedores** - Validar email, teléfono
- [ ] **Generador Escritos** - Preview en tiempo real
- [ ] **Cobranza/Config** - Validar configuración

### 7.2 Auto-save
- [ ] **Generador Escritos** - Guardar cada 30 segundos
- [ ] **OCR** - Recordar datos extraídos
- [ ] **Verificar Documentos** - Guardar historial

### 7.3 Wizard Forms
- [ ] **Proveedores** - Formulario en pasos
- [ ] **Cobranza/Config** - Configuración por pasos

---

## 🔵 FASE 8: Optimización de Carga (Semana 4)

### 8.1 Lazy Loading
- [ ] **Chat IA** - Cargar componente solo cuando se usa
- [ ] **OCR** - Importar biblioteca OCR lazily
- [ ] **Gráficos** - Lazy load de Recharts

### 8.2 Memoización
- [ ] **Tablas** - React.memo en filas
- [ ] **Listas** - useMemo para filtering
- [ ] **Chat** - Optimizar re-renders

### 8.3 Optimización de Imágenes
- [ ] **Verificar Documentos** - Compresión de uploaded
- [ ] **OCR** - Preview thumbnails
- [ ] **Proveedores** - Avatares optimizados

---

## 🔵 FASE 9: Navegación y Breadcrumbs (Semana 5)

### 9.1 Breadcrumbs Dinámicos
- [ ] **Prescripciones** - Home > Core Legal > Prescripciones
- [ ] **Proveedores** - Home > Cobranza > Proveedores
- [ ] **Rentabilidad** - Home > Finanzas > Rentabilidad

### 9.2 Quick Navigation
- [ ] Breadcrumbs clickeables
- [ ] Añadir a sidebar items relacionados
- [ ] Links cruzados entre páginas

### 9.3 History Navigation
- [ ] Volver al estado anterior de filtros
- [ ] Back button funciona correctamente

---

## 🔵 FASE 10: Accesibilidad - Keyboard (Semana 5)

### 10.1 Tab Navigation
- [ ] **Todas las tablas** - Navegación con flechas
- [ ] **Todas las páginas** - Skip to content
- [ ] **Sidebar** - Navegación por teclado

### 10.2 Shortcuts Globales
- [ ] `Ctrl+K` - Búsqueda global
- [ ] `Ctrl+N` - Nuevo elemento (según página)
- [ ] `Escape` - Cerrar modales

### 10.3 Focus Management
- [ ] Focus trap en modales
- [ ] Focus restaurar al cerrar modal
- [ ] Focus visible en todos los elementos interactivos

---

## 🔵 FASE 11: Responsive Design (Semana 5-6)

### 11.1 Sidebar Mobile
- [ ] Drawer en lugar de sidebar fijo
- [ ] Hamburger menu
- [ ] Overlay con backdrop
- [ ] Swipe para abrir/cerrar

### 11.2 Tables Responsive
- [ ] Scroll horizontal en tablas
- [ ] Cards en móvil para tablas
- [ ] Sticky first column

### 11.3 Formularios Mobile
- [ ] Inputs correctamente sizeados
- [ ] Date pickers touch-friendly
- [ ] Teclado numérico para números

---

## 🔵 FASE 12: Mejoras de Rendimiento (Semana 6)

### 12.1 Virtual Scrolling
- [ ] **Buscar** - Virtual scroll para muchos resultados
- [ ] **Notificaciones** - Virtual scroll para historial
- [ ] **Proveedores** - Grid virtual

### 12.2 Code Splitting
- [ ] Cada página como chunk separado
- [ ] Cargar solo lo necesario
- [ ] Prefetch de páginas relacionadas

### 12.3 Optimización de Bundle
- [ ] Analizar bundle size
- [ ] Reducir dependencias
- [ ] Tree shaking efectivo

---

## 🔵 FASE 13: UI Feedback - Botones (Semana 6)

### 13.1 Button States
- [ ] Hover states en todos los botones
- [ ] Active/pressed states
- [ ] Loading states con spinner
- [ ] Disabled states visuales

### 13.2 Button Variants
- [ ] Primary, secondary, ghost, danger
- [ ] Icon buttons
- [ ] Group buttons
- [ ] Split buttons (dropdown)

### 13.3 Button Feedback
- [ ] Ripple effect
- [ ] Success animation (checkmark)
- [ ] Error shake animation

---

## 🔵 FASE 14: UI Feedback - Formularios (Semana 7)

### 14.1 Input States
- [ ] Focus ring con color de acento
- [ ] Error state (rojo)
- [ ] Success state (verde)
- [ ] Disabled state (opacity)

### 14.2 Character Counters
- [ ] **Generador Escritos** - Contador de caracteres
- [ ] **Notificaciones** - Asunto con límite
- [ ] **Proveedores** - Notas con contador

### 14.3 Password Strength
- [ ] Medidor de fuerza en creation forms
- [ ] Mostrar/ocultar toggle

---

## 🔵 FASE 15: Animaciones de Transición (Semana 7)

### 15.1 Page Transitions
- [ ] Fade in/out entre páginas
- [ ] Slide transitions para móviles
- [ ] Shared element transitions donde aplique

### 15.2 Component Transitions
- [ ] Expand/collapse animations
- [ ] Modal scale + fade
- [ ] Dropdown animations
- [ ] Tooltip fade

### 15.3 Micro-interacciones
- [ ] Toggle switches animados
- [ ] Checkbox animations
- [ ] Radio button animations
- [ ] Progress bar animations

---

## 🔵 FASE 16: Modo Oscuro/Claro (Semana 7-8)

### 16.1 Tema Persistente
- [ ] Guardar preference en localStorage
- [ ] Toggle en header/sidebar
- [ ] Transición suave entre temas

### 16.2 Componentes Theming
- [ ] Todos los componentes soportan ambos temas
- [ ] Gráficos adaptan colores
- [ ] Imágenes con filter en dark mode

### 16.3 Sistema de Colores
- [ ] CSS variables para temas
- [ ] Componentes usan variables
- [ ] No hardcoded colors

---

## 🔵 FASE 17: Mejoras de UX - Chat IA (Semana 8)

### 17.1 Chat Features
- [ ] Typing indicator (los 3 puntitos)
- [ ] Auto-scroll al nuevo mensaje
- [ ] Copy message button
- [ ] Timestamp en hover

### 17.2 Chat UX
- [ ] Markdown rendering
- [ ] Code syntax highlighting
- [ ] Link previews
- [ ] Suggested prompts

### 17.3 Chat History
- [ ] Guardar conversación actual
- [ ] Cargar conversaciones anteriores
- [ ] Clear chat option
- [ ] Export conversation

---

## 🔵 FASE 18: Mejoras de UX - OCR (Semana 8)

### 18.1 Upload Experience
- [ ] Drag & drop con feedback visual
- [ ] Preview de imagen antes de procesar
- [ ] Multiple file upload
- [ ] Progress bar de procesamiento

### 18.2 Resultados OCR
- [ ] Editor de resultados editable
- [ ] Añadir/eliminar items
- [ ] Recalcular totales automáticamente
- [ ] Copy to clipboard

### 18.3 Historial
- [ ] Ver escaneos anteriores
- [ ] Re-editar escaneos previos
- [ ] Exportar a PDF/Excel

---

## 🔵 FASE 19: Mejoras de UX - LexNET (Semana 9)

### 19.1 Bandeja de Entrada
- [ ] Unread count badge
- [ ] Mark as read on view
- [ ] Bulk actions
- [ ] Filter by estado

### 19.2 Reading Experience
- [ ] Preview de documento adjunto
- [ ] Download all attachments
- [ ] Responder desde la vista

### 19.3 Composing
- [ ] Editor rico para comunicaciones
- [ ] Adjuntar múltiples archivos
- [ ] Save as draft
- [ ] Preview antes de enviar

---

## 🔵 FASE 20: Mejoras de UX - Verificar Documentos (Semana 9)

### 20.1 Cámara
- [ ] Capture desde webcam
- [ ] Flash toggle
- [ ] Auto-capture
- [ ] Gallery picker

### 20.2 Resultados
- [ ] Visual highlights de áreas verificadas
- [ ] Detalle de cada verificación
- [ ] Export PDF report
- [ ] Enviar por email

### 20.3 Historial
- [ ] Timeline de verificaciones
- [ ] Estadísticas de verificaciones
- [ ] Exportar logs

---

## 🔵 FASE 21: Notificaciones Toast (Semana 9-10)

### 21.1 Toast Component
- [ ] Success, error, warning, info variants
- [ ] Auto-dismiss (configurable)
- [ ] Manual dismiss button
- [ ] Stack de toasts

### 21.2 Toast Placements
- [ ] Top-right default
- [ ] Mobile: bottom-center
- [ ] Configurable position

### 21.3 Toast Actions
- [ ] Action buttons en toast
- [ ] Undo action
- [ ] View details link

---

## 🔵 FASE 22: Mejoras de UX - Tiempo/Informes (Semana 10)

### 22.1 Gráficos Interactivos
- [ ] Tooltips en hover
- [ ] Click para drill-down
- [ ] Legend interactiva
- [ ] Exportar gráfico

### 22.2 Date Range Picker
- [ ] Presets (última semana, mes, año)
- [ ] Custom range
- [ ] Comparación período anterior

### 22.3 Export
- [ ] Exportar a Excel
- [ ] Exportar a PDF
- [ ] Exportar imagen

---

## 🔵 FASE 23: Mejoras de UX - Generador Escritos (Semana 10)

### 23.1 Editor
- [ ] Rich text editor
- [ ] Toolbar de formatting
- [ ] Word count
- [ ] Auto-save indicator

### 23.2 Templates
- [ ] Guardar como template
- [ ] Load from template
- [ ] Template categories

### 23.3 Preview
- [ ] Preview en tiempo real
- [ ] Toggle editor/preview
- [ ] Print-optimized view

---

## 🔵 FASE 24: Mejoras de UX - Proveedores (Semana 11)

### 24.1 Gestión de Proveedores
- [ ] CRUD completo (Create, Read, Update, Delete)
- [ ] Modal de edición inline
- [ ] Confirm before delete
- [ ] Undo delete

### 24.2 Contactos
- [ ] Múltiples contactos por proveedor
- [ ] Primary contact
- [ ] Contact history

### 24.3 Evaluación
- [ ] Rating interactivo (stars)
- [ ] Añadir comentarios
- [ ] Historial de evaluaciones

---

## 🔵 FASE 25: Mejoras de UX - Rentabilidad (Semana 11)

### 25.1 Gráficos
- [ ] Gráfico de barras por abogado
- [ ] Gráfico de tendencia temporal
- [ ] Pie chart de distribución
- [ ] Heatmap de rentabilidad

### 25.2 KPIs
- [ ] Trend indicators (↑↓)
- [ ] Comparison vs previous period
- [ ] Benchmark vs objetivo

### 25.3 Drill-down
- [ ] Click en abogado → detalle
- [ ] Click en caso → detalle
- [ ] Breadcrumb navigation

---

## 🔵 FASE 26: Mejoras de UX - Prescripciones (Semana 11-12)

### 26.1 Timeline View
- [ ] Vista de línea temporal
- [ ] Visualización de plazos
- [ ] Alertas visuales

### 26.2 Calendario View
- [ ] Vista de calendario mensual
- [ ] Ver prescripciones por fecha
- [ ] Crear desde calendario

### 26.3 Recordatorios
- [ ] Configurar recordatorios
- [ ] Notificaciones antes de prescripción
- [ ] Email alerts

---

## 🔵 FASE 27: Mejoras de UX - Búsqueda Semántica (Semana 12)

### 27.1 Resultados
- [ ] Snippets con highlight
- [ ] relevance score visual
- [ ] Filters en sidebar
- [ ] Sort by relevance/date

### 27.2 Saved Searches
- [ ] Guardar búsquedas
- [ ] Ejecutar saved search
- [ ] Notifications para nuevos resultados

### 27.3 AI Suggestions
- [ ] Sugerencias de búsqueda
- [ ] Related searches
- [ ] Search history

---

## 🔵 FASE 28: Accesibilidad - Screen Readers (Semana 12)

### 28.1 ARIA Labels
- [ ] Todos los buttons con aria-label
- [ ] Icon-only buttons
- [ ] Form inputs con labels
- [ ] Tables con scope

### 28.2 Live Regions
- [ ] Notificaciones en vivo
- [ ] Chat messages
- [ ] Search results count

### 28.3 Semantic HTML
- [ ] Use `<main>`, `<nav>`, `<aside>`
- [ ] Headings hierarchy (h1-h6)
- [ ] Lists semantics

---

## 🔵 FASE 29: Testing y QA (Semana 12-13)

### 29.1 Testing
- [ ] Unit tests para componentes
- [ ] Integration tests para flows
- [ ] E2E tests críticos

### 29.2 Cross-browser
- [ ] Chrome, Firefox, Safari, Edge
- [ ] Mobile browsers
- [ ] Fix bugs encontrados

### 29.3 Performance Testing
- [ ] Lighthouse score > 90
- [ ] First Contentful Paint < 1.5s
- [ ] Time to Interactive < 3s

---

## 🔵 FASE 30: Documentación y Polish Final (Semana 13)

### 30.1 Documentación
- [ ] README actualizado
- [ ] Contributing guide
- [ ] API documentation

### 30.2 Polish
- [ ] Animaciones finales
- [ ] Micro-interacciones
- [ ] Edge cases

### 30.3 Launch Prep
- [ ] SEO metadata
- [ ] Analytics setup
- [ ] Error tracking (Sentry)

---

## 📊 Resumen de Fases

| Fase | Área | Semanas |
|------|------|---------|
| 1 | Skeleton Loaders | 1 |
| 2 | Estados Vacíos | 1 |
| 3 | Persistencia | 2 |
| 4 | Tablas | 2-3 |
| 5 | Búsqueda/Filtros | 3 |
| 6 | Estados de Error | 3 |
| 7 | Formularios Interactivos | 4 |
| 8 | Optimización Carga | 4 |
| 9 | Navegación | 5 |
| 10 | Keyboard Accesibility | 5 |
| 11 | Responsive | 5-6 |
| 12 | Rendimiento | 6 |
| 13 | Button Feedback | 6 |
| 14 | Form Feedback | 7 |
| 15 | Animaciones | 7 |
| 16 | Dark/Light Mode | 7-8 |
| 17 | Chat IA | 8 |
| 18 | OCR | 8 |
| 19 | LexNET | 9 |
| 20 | Verificar Docs | 9 |
| 21 | Toast Notifications | 9-10 |
| 22 | Tiempo/Informes | 10 |
| 23 | Generador | 10 |
| 24 | Proveedores | 11 |
| 25 | Rentabilidad | 11 |
| 26 | Prescripciones | 11-12 |
| 27 | Búsqueda Semántica | 12 |
| 28 | Screen Readers | 12 |
| 29 | Testing | 12-13 |
| 30 | Polish/Docs | 13 |

---

## 🎯 Orden de Implementación Sugerido

### Inmediato (Esta semana):
1. FASE 1 - Skeleton Loaders
2. FASE 2 - Estados Vacíos

### Esta iteración (2 semanas):
3. FASE 3 - Persistencia
4. FASE 4 - Tablas
5. FASE 5 - Búsqueda

### Este mes:
6. FASE 6-10
7. FASE 11-15
8. FASE 16-20

### Próximo mes:
9. FASE 21-25
10. FASE 26-30

---

*Documento específico para las 15 páginas creadas*
*Mantiene consistencia con sistema de diseño actual*

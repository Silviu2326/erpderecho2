# Mapa de Páginas - DERECHO Legal ERP

## Roles del Sistema

| Abreviatura | Rol |
|---|---|
| SA | super_admin |
| SO | socio |
| AS | abogado_senior |
| AJ | abogado_junior |
| PA | paralegal |
| SE | secretario |
| AD | administrador |
| CO | contador |
| RE | recepcionista |

---

## Páginas Públicas (Sin autenticación)

| Página | Ruta | Roles |
|---|---|---|
| Login | `/login` | Todos |
| Registro | `/register` | Todos |

---

## M1 - Core Legal

| Página | Ruta | Roles |
|---|---|---|
| Dashboard | `/dashboard` | SA, SO, AS, AJ, PA, SE, AD, CO, RE |
| Expedientes | `/core/expedientes` | SA, SO, AS, AJ, PA, SE |
| Detalle Expediente | `/core/expedientes/:id` | SA, SO, AS, AJ, PA, SE |
| Calendario | `/core/calendario` | SA, SO, AS, AJ, PA, SE, AD, RE |
| Audiencias | `/core/audiencias` | SA, SO, AS, AJ, PA, SE |
| Prescripciones | `/core/prescripciones` | SA, SO, AS, AJ |

---

## M2 - Gestión Documental

| Página | Ruta | Roles |
|---|---|---|
| Biblioteca | `/documentos/biblioteca` | SA, SO, AS, AJ, PA, SE, AD, CO |
| Buscar | `/documentos/buscar` | SA, SO, AS, AJ, PA, SE |
| OCR | `/documentos/ocr` | SA, SO, AD, CO |

---

## M3 - Finanzas

| Página | Ruta | Roles |
|---|---|---|
| Facturación | `/finanzas/facturacion` | SA, SO, AD, CO |
| Contabilidad | `/finanzas/contabilidad` | SA, SO, AD, CO |
| Gastos | `/finanzas/gastos` | SA, SO, AD, CO |
| Rentabilidad | `/finanzas/rentabilidad` | SA, SO, AD |

---

## M4 - Cobranza

| Página | Ruta | Roles |
|---|---|---|
| Cobranza | `/cobranza` | SA, SO, AD, CO |
| Proveedores | `/cobranza/proveedores` | SA, SO, AD |
| Configuración | `/cobranza/config` | SA, AD |

---

## M5 - Tiempo & Tareas

| Página | Ruta | Roles |
|---|---|---|
| Tareas | `/tiempo/tareas` | SA, SO, AS, AJ, PA, SE |
| Tiempo | `/tiempo` | SA, SO, AS, AJ, PA |
| Informes | `/tiempo/informes` | SA, SO, AD |

---

## M6 - Comunicaciones

| Página | Ruta | Roles |
|---|---|---|
| Mensajes | `/comunicaciones/mensajes` | SA, SO, AS, AJ, PA, SE, AD, CO, RE |
| Juzgados | `/comunicaciones/juzgados` | SA, SO, AS, AJ, PA |
| Notificaciones | `/comunicaciones/notificaciones` | SA, SO, AD |

---

## M7 - Portal Cliente

| Página | Ruta | Roles |
|---|---|---|
| Portal Cliente | `/portal` | SA, SO, AD |

---

## M8 - Firmas Digitales

| Página | Ruta | Roles |
|---|---|---|
| Firmas | `/firmas` | SA, SO, AS, AJ, AD, CO |

---

## M9 - Informes & BI

| Página | Ruta | Roles |
|---|---|---|
| Informes | `/informes` | SA, SO, AD, CO |

---

## M10 - Biblioteca Legal

| Página | Ruta | Roles |
|---|---|---|
| Legislación | `/biblioteca/legislacion` | SA, SO, AS, AJ, PA |
| Plantillas | `/biblioteca/plantillas` | SA, SO, AS, AD |

---

## M11 - IA Legal

| Página | Ruta | Roles |
|---|---|---|
| Chat IA | `/ia/chat` | SA, SO, AS |
| Búsqueda Semántica | `/ia/busqueda` | SA, SO, AS, AJ |
| Generador de Escritos | `/ia/generador` | SA, SO, AS, AJ |

---

## M12 - Biblioteca Forense

| Página | Ruta | Roles |
|---|---|---|
| Verificar ID | `/forense/verificar` | SA, SO, AD |

---

## M13 - Integraciones

| Página | Ruta | Roles |
|---|---|---|
| LexNET | `/integraciones/lexnet` | SA, SO, AS, AJ |

---

## Admin

| Página | Ruta | Roles |
|---|---|---|
| Panel Admin | `/admin` | SA |

---

## Otras Páginas (Compatibilidad / Sin módulo en sidebar)

| Página | Ruta | Componente |
|---|---|---|
| Clientes | `/clientes` | Clientes.tsx |
| Detalle Cliente | `/clientes/:id` | ClienteDetail.tsx |
| Bitácora | `/bitacora` | Bitacora.tsx |
| Conflictos | `/conflictos` | Conflictos.tsx |
| Partes Contrarias | `/conflictos/partes` | ConflictosPartesContrarias.tsx |
| Análisis Conflictos | `/conflictos/analisis` | AnalisisConflictos.tsx |

> Nota: Existen rutas de compatibilidad (alias) que apuntan al mismo componente con rutas cortas como `/expedientes`, `/calendario`, `/tareas`, `/facturacion`, etc.

---

## Resumen por Rol

| Rol | Nº Páginas |
|---|---|
| super_admin | **Todas (37)** |
| socio | 33 |
| abogado_senior | 24 |
| abogado_junior | 20 |
| paralegal | 14 |
| secretario | 10 |
| administrador | 21 |
| contador | 12 |
| recepcionista | 3 |

# Roadmap: Módulos del Sistema ERP

## Estado: 🔄 En progreso

---

## M1 - Core Legal ✅

| Página | Ruta | Roles con Acceso | Estado |
|--------|------|-----------------|--------|
| Dashboard | `/core/dashboard` | Todos los roles | ✅ Existe |
| Expedientes | `/core/expedientes` | super_admin, socio, abogado_senior, abogado_junior, paralegal, secretario | ✅ Existe |
| Calendario | `/core/calendario` |Todos los roles excepto cliente | ✅ Existe |
| Audiencias | `/core/audiencias` | super_admin, socio, abogado_senior, abogado_junior, paralegal, secretario | ✅ Existe |
| Prescripciones | `/core/prescripciones` | super_admin, socio, abogado_senior, abogado_junior | ✅ CREADO |

---

## M2 - Gestión Documental ✅

| Página | Ruta | Roles con Acceso | Estado |
|--------|------|-----------------|--------|
| Biblioteca | `/documentos/biblioteca` | super_admin, socio, abogado_senior, abogado_junior, paralegal, secretario, administrador, contador | ✅ Existe |
| Buscar (full-text) | `/documentos/buscar` | super_admin, socio, abogado_senior, abogado_junior, paralegal, secretario | ✅ CREADO |
| OCR | `/documentos/ocr` | super_admin, socio, administrador, contador | ✅ CREADO

---

## M3 - Finanzas ✅

| Página | Ruta | Roles con Acceso |
|--------|------|-----------------|
| Facturación | `/finanzas/facturacion` | super_admin, socio, administrador, contador |
| Contabilidad | `/finanzas/contabilidad` | super_admin, socio, administrador, contador |
| Gastos | `/finanzas/gastos` | super_admin, socio, administrador, contador |
| Rentabilidad | `/finanzas/rentabilidad` | super_admin, socio, administrador |

🆕 **CREAR:** `src/pages/finanzas/Rentabilidad.tsx`

---

## M4 - Cobranza Pro + Proveedores ✅

| Página | Ruta | Roles con Acceso | Estado |
|--------|------|-----------------|--------|
| Dashboard Cobranza | `/cobranza/dashboard` | super_admin, socio, administrador, contador | ✅ Existe (renombrar) |
| Proveedores | `/cobranza/proveedores` | super_admin, socio, administrador | ✅ CREADO |
| Configuración | `/cobranza/config` | super_admin, administrador | 🆕 PENDIENTE

---

## M5 - Tiempo & Tareas ✅

| Página | Ruta | Roles con Acceso | Estado |
|--------|------|-----------------|--------|
| Tareas | `/tiempo/tareas` | super_admin, socio, abogado_senior, abogado_junior, paralegal, secretary | ✅ Existe |
| Tracking | `/tiempo/tracking` | super_admin, socio, abogado_senior, abogado_junior, paralegal | ✅ Existe |
| Informes Productividad | `/tiempo/informes` | super_admin, socio, administrador | ✅ CREADO

---

## M6 - Comunicaciones 🆕

| Página | Ruta | Roles con Acceso |
|--------|------|-----------------|
| Mensajes | `/comunicaciones/mensajes` | Todos los roles excepto cliente |
| Juzgados | `/comunicaciones/juzgados` | super_admin, socio, abogado_senior, abogado_junior, paralegal |
| Notificaciones | `/comunicaciones/notificaciones` | super_admin, socio, administrador |

🆕 **CREAR:** `src/pages/comunicaciones/Mensajes.tsx` (mover desde pages/)
🆕 **CREAR:** `src/pages/comunicaciones/Juzgados.tsx`
🆕 **CREAR:** `src/pages/comunicaciones/Notificaciones.tsx`

---

## M7 - Portal Cliente ✅

| Página | Ruta | Roles con Acceso |
|--------|------|-----------------|
| Portal Cliente | `/portal` | super_admin, socio, administrador, cliente |

✅ **EXISTE:** `src/pages/portal/PortalCliente.tsx`

---

## M8 - Firmas Digitales ✅

| Página | Ruta | Roles con Acceso |
|--------|------|-----------------|
| Firmas | `/firmas` | super_admin, socio, abogado_senior, abogado_junior, administrador, contador |

✅ **EXISTE:** `src/pages/firmas/Firmas.tsx`

---

## M9 - Informes & BI ✅

| Página | Ruta | Roles con Acceso |
|--------|------|-----------------|
| Informes | `/informes` | super_admin, socio, administrador, contador |

✅ **EXISTE:** `src/pages/informes/Informes.tsx` (KPIs implementado)

---

## M10 - Biblioteca Legal + Plantillas ✅

| Página | Ruta | Roles con Acceso |
|--------|------|-----------------|
| Legislación | `/biblioteca/legislacion` | super_admin, socio, abogado_senior, abogado_junior, paralegal |
| Plantillas | `/biblioteca/plantillas` | super_admin, socio, abogado_senior, administrador |

✅ **EXISTE:** `src/pages/biblioteca/Legislacion.tsx`
✅ **EXISTE:** `src/pages/biblioteca/Plantillas.tsx`

---

## M11 - IA Legal (RAG) 🆕

| Página | Ruta | Roles con Acceso |
|--------|------|-----------------|
| Chat IA | `/ia/chat` | super_admin, socio, abogado_senior |
| Búsqueda Semántica | `/ia/busqueda` | super_admin, socio, abogado_senior, abogado_junior |
| Generador Escritos | `/ia/generador` | super_admin, socio, abogado_senior, abogado_junior |
| Análisis Contratos | `/ia/analisis` | super_admin, socio, abogado_senior |

🆕 **CREAR:** `src/pages/ia/Chat.tsx`
🆕 **CREAR:** `src/pages/ia/Busqueda.tsx`
🆕 **CREAR:** `src/pages/ia/Generador.tsx`
🆕 **CREAR:** `src/pages/ia/Analisis.tsx`

---

## M12 - Biblioteca Forense 🆕

| Página | Ruta | Roles con Acceso |
|--------|------|-----------------|
| Verificar ID | `/forense/verificar` | super_admin, socio, administrador |
| Informes Periciales | `/forense/informes` | super_admin, socio |

🆕 **CREAR:** `src/pages/forense/Verificar.tsx`
🆕 **CREAR:** `src/pages/forense/Informes.tsx`

---

## M13 - Integraciones 🆕

| Página | Ruta | Roles con Acceso |
|--------|------|-----------------|
| LexNET | `/integraciones/lexnet` | super_admin, socio, abogado_senior, abogado_junior |
| Office 365 | `/integraciones/office` | super_admin, socio, administrador |
| Google Workspace | `/integraciones/google` | super_admin, socio, administrador |
| API REST | `/integraciones/api` | super_admin |

🆕 **CREAR:** `src/pages/integraciones/Lexnet.tsx`
🆕 **CREAR:** `src/pages/integraciones/Office.tsx`
🆕 **CREAR:** `src/pages/integraciones/Google.tsx`
🆕 **CREAR:** `src/pages/integraciones/API.tsx`

---

## Admin ✅

| Página | Ruta | Roles con Acceso |
|--------|------|-----------------|
| Configuración | `/admin/config` | super_admin |
| Usuarios | `/admin/usuarios` | super_admin |
| Clientes (gestión) | `/admin/clientes` | super_admin, administrador |

✅ **EXISTE:** `src/pages/admin/Configuracion.tsx`
✅ **EXISTE:** `src/pages/admin/Usuarios.tsx`
✅ **EXISTE:** `src/pages/admin/AdminClientes.tsx`

---

## 📊 Resumen TOTAL

| Estado | Cantidad |
|--------|----------|
| ✅ Existe | 20 páginas |
| ✅ Creado | 5 páginas |
| 🆕 Crear | 10 páginas |
| **TOTAL** | **35 páginas** |

---

## 🗂️ Estructura de Archivos propues

```
src/pages/
├── core/
│   ├── Dashboard.tsx
│   ├── Expedientes.tsx
│   ├── Calendario.tsx
│   ├── Audiencias.tsx
│   └── Prescripciones.tsx          # 🆕 NUEVO
├── documentos/
│   ├── Biblioteca.tsx
│   ├── Buscar.tsx                 # 🆕 NUEVO
│   └── OCR.tsx                    # 🆕 NUEVO
├── finanzas/
│   ├── Facturacion.tsx
│   ├── Contabilidad.tsx
│   ├── Gastos.tsx
│   └── Rentabilidad.tsx           # 🆕 NUEVO
├── cobranza/
│   ├── Dashboard.tsx              # 🆕 NUEVO
│   ├── Proveedores.tsx            # 🆕 NUEVO
│   └── Config.tsx                 # 🆕 NUEVO
├── tiempo/
│   ├── Tareas.tsx
│   ├── Tracking.tsx
│   └── Informes.tsx               # 🆕 NUEVO
├── comunicaciones/
│   ├── Mensajes.tsx               # 🆕 MOVER aquí
│   ├── Juzgados.tsx               # 🆕 NUEVO
│   └── Notificaciones.tsx         # 🆕 NUEVO
├── portal/
│   └── PortalCliente.tsx
├── firmas/
│   └── Firmas.tsx
├── informes/
│   └── Informes.tsx
├── biblioteca/
│   ├── Legislacion.tsx
│   └── Plantillas.tsx
├── ia/
│   ├── Chat.tsx                   # 🆕 NUEVO
│   ├── Busqueda.tsx               # 🆕 NUEVO
│   ├── Generador.tsx              # 🆕 NUEVO
│   └── Analisis.tsx               # 🆕 NUEVO
├── forense/
│   ├── Verificar.tsx              # 🆕 NUEVO
│   └── Informes.tsx               # 🆕 NUEVO
├── integraciones/
│   ├── Lexnet.tsx                 # 🆕 NUEVO
│   ├── Office.tsx                 # 🆕 NUEVO
│   ├── Google.tsx                 # 🆕 NUEVO
│   └── API.tsx                    # 🆕 NUEVO
└── admin/
    ├── Configuracion.tsx
    ├── Usuarios.tsx
    └── Clientes.tsx
```

---

## 👥 Roles del Sistema

| Rol | Descripción |
|-----|-------------|
| super_admin | Acceso total al sistema |
| socio | Socio del bufete |
| abogado_senior | Abogado senior |
| abogado_junior | Abogado junior |
| paralegal | Paralegal |
| secretario | Secretario/a |
| administrador | Administrador |
| contador | Contador |
| recepcionista | Recepcionista |
| cliente | Cliente externo (portal) |

---

*Última actualización: 2026-02-20*

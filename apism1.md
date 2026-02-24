# 📡 APIs del Módulo M1 - CORE LEGAL

Documentación completa de las APIs REST utilizadas en el módulo Core Legal del ERP Derecho.

---

## 📊 Resumen General

| Métrica | Valor |
|---------|-------|
| **Total de Páginas** | 9 |
| **Total de APIs Distintas** | 15 |
| **Servicios Utilizados** | 3 (expedienteService, calendarioService, clienteService) |
| **Métodos HTTP** | GET, POST, DELETE |

---

## 🗂️ Índice de Páginas y APIs

1. [Dashboard](#1-dashboard)
2. [Dashboard Core](#2-dashboard-core)
3. [Expedientes](#3-expedientes)
4. [Nuevo Expediente](#4-nuevo-expediente)
5. [Detalle Expediente](#5-detalle-expediente)
6. [Calendario](#6-calendario)
7. [Audiencias](#7-audiencias)
8. [Prescripciones](#8-prescripciones)
9. [Plazos Procesales](#9-plazos-procesales)

---

## 1. Dashboard

**Ruta:** `/dashboard`  
**Componente:** `Dashboard.tsx`  
**APIs:** 1

### APIs Utilizadas

| # | Método | Endpoint | Servicio | Propósito |
|---|--------|----------|----------|-----------|
| 1 | GET | `/expedientes/stats/dashboard` | `expedienteService.obtenerEstadisticas()` | Obtiene estadísticas generales del sistema: total expedientes, por estado, por tipo, recientes, próximos eventos, audiencias y plazos próximos |

### Datos Recibidos
```typescript
interface DashboardStats {
  totalExpedientes: number;
  porEstado: Record<EstadoExpediente, number>;
  porTipo: Record<TipoExpediente, number>;
  expedientesMes: number;
  expedientesSemana: number;
  proximasAudiencias: number;
  plazosProximos: number;
  expedientesRecientes: Expediente[];
  proximosEventos: Evento[];
}
```

---

## 2. Dashboard Core

**Ruta:** `/core/dashboard`  
**Componente:** `CoreDashboard.tsx`  
**APIs:** 2

### APIs Utilizadas

| # | Método | Endpoint | Servicio | Propósito |
|---|--------|----------|----------|-----------|
| 1 | GET | `/expedientes/stats/dashboard` | `expedienteService.obtenerEstadisticas()` | Estadísticas del área legal |
| 2 | GET | `/calendario/eventos?limit=100` | `calendarioService.obtenerProximosEventos(7)` | Próximos eventos de los próximos 7 días |

### Datos Recibidos
- **Estadísticas:** Igual que Dashboard general
- **Eventos:** Lista de audiencias y plazos próximos para mostrar alertas

---

## 3. Expedientes

**Ruta:** `/core/expedientes`  
**Componente:** `Expedientes.tsx`  
**APIs:** 2

### APIs Utilizadas

| # | Método | Endpoint | Servicio | Propósito |
|---|--------|----------|----------|-----------|
| 1 | GET | `/expedientes` | `expedienteService.listarExpedientes()` | Lista paginada de expedientes con filtros (búsqueda, estado, tipo, abogado, cliente) |
| 2 | DELETE | `/expedientes/:id` | `expedienteService.archivarExpediente()` | Archiva un expediente (soft delete) |

### Parámetros de Consulta (Query Params)
```typescript
{
  page?: number;        // Página actual
  limit?: number;       // Resultados por página
  search?: string;      // Búsqueda por número, descripción, cliente
  tipo?: TipoExpediente;
  estado?: EstadoExpediente;
  abogadoId?: string;
  clienteId?: string;
  fechaDesde?: string;
  fechaHasta?: string;
  sort?: string;        // Campo de ordenación
  order?: 'asc' | 'desc';
}
```

---

## 4. Nuevo Expediente

**Ruta:** `/core/expedientes/nuevo`  
**Componente:** `ExpedienteNuevo.tsx`  
**APIs:** 2

### APIs Utilizadas

| # | Método | Endpoint | Servicio | Propósito |
|---|--------|----------|----------|-----------|
| 1 | GET | `/clientes?search=&limit=10` | `clienteService.listarClientes()` | Buscar clientes para dropdown de selección |
| 2 | POST | `/expedientes` | `expedienteService.crearExpediente()` | Crear nuevo expediente en el sistema |

### Body POST /expedientes
```typescript
{
  numeroExpediente: string;    // Ej: "2026/0001"
  tipo: TipoExpediente;        // CIVIL, PENAL, LABORAL, etc.
  estado?: EstadoExpediente;   // ACTIVO, CERRADO, etc.
  descripcion?: string;
  clienteId?: string;
  abogadoId?: string;
}
```

---

## 5. Detalle Expediente

**Ruta:** `/core/expedientes/:id`  
**Componente:** `ExpedienteDetail.tsx`  
**APIs:** 3

### APIs Utilizadas

| # | Método | Endpoint | Servicio | Propósito |
|---|--------|----------|----------|-----------|
| 1 | GET | `/expedientes/:id` | `expedienteService.obtenerExpediente()` | Obtener datos completos del expediente incluyendo cliente y abogado |
| 2 | GET | `/expedientes/:id/actuaciones` | `expedienteService.obtenerActuaciones()` | Listar actuaciones/historial del expediente |
| 3 | DELETE | `/expedientes/:id` | `expedienteService.archivarExpediente()` | Archivar expediente desde el detalle |

### Datos Recibidos (GET /expedientes/:id)
```typescript
interface Expediente {
  id: string;
  numeroExpediente: string;
  tipo: TipoExpediente;
  estado: EstadoExpediente;
  descripcion?: string;
  cliente?: {
    id: string;
    nombre: string;
    email?: string;
    telefono?: string;
  };
  abogado?: {
    id: string;
    nombre: string;
    apellido1?: string;
    email: string;
  };
  createdAt: string;
  updatedAt: string;
}
```

---

## 6. Calendario

**Ruta:** `/core/calendario`  
**Componente:** `Calendario.tsx`  
**APIs:** 1

### APIs Utilizadas

| # | Método | Endpoint | Servicio | Propósito |
|---|--------|----------|----------|-----------|
| 1 | GET | `/calendario/eventos` | `calendarioService.listarEventos()` | Obtener todos los eventos del mes con filtros |

### Parámetros de Consulta
```typescript
{
  fechaDesde?: string;    // Inicio del mes
  fechaHasta?: string;    // Fin del mes
  tipo?: TipoEvento;      // AUDIENCIA, PLAZO, TAREA, etc.
  limit?: number;         // 100 por defecto
  sort?: string;          // 'fechaInicio'
  order?: 'asc' | 'desc';
}
```

### Tipos de Evento
```typescript
type TipoEvento = 'AUDIENCIA' | 'PLAZO' | 'TAREA' | 'CITACION' | 'NOTIFICACION' | 'OTRO';
```

---

## 7. Audiencias

**Ruta:** `/core/audiencias`  
**Componente:** `Audiencias.tsx`  
**APIs:** 1

### APIs Utilizadas

| # | Método | Endpoint | Servicio | Propósito |
|---|--------|----------|----------|-----------|
| 1 | GET | `/calendario/audiencias` | `calendarioService.listarAudiencias()` | Solo eventos tipo AUDIENCIA en un rango de fechas |

### Parámetros de Consulta
```typescript
{
  fechaDesde?: string;    // Hoy por defecto
  fechaHasta?: string;    // Hoy + 90 días por defecto
}
```

### Funcionalidad
- Muestra audiencias próximas (futuras)
- Muestra audiencias pasadas (histórico)
- Separación visual entre ambas categorías

---

## 8. Prescripciones

**Ruta:** `/core/prescripciones`  
**Componente:** `Prescripciones.tsx`  
**APIs:** 1

### APIs Utilizadas

| # | Método | Endpoint | Servicio | Propósito |
|---|--------|----------|----------|-----------|
| 1 | GET | `/calendario/plazos` | `calendarioService.listarPlazos()` | Solo eventos tipo PLAZO en un rango de fechas |

### Parámetros de Consulta
```typescript
{
  fechaDesde?: string;    // Hoy por defecto
  fechaHasta?: string;    // Hoy + 180 días por defecto
}
```

### Funcionalidad
- Clasifica plazos por urgencia:
  - **Críticos:** ≤ 7 días (rojo)
  - **Próximos:** 8-30 días (ámbar)
  - **Futuros:** > 30 días (verde)
- Ordena por días restantes (más urgentes primero)

---

## 9. Plazos Procesales

**Ruta:** `/core/plazos`  
**Componente:** `PlazosProcesales.tsx`  
**APIs:** 2

### APIs Utilizadas

| # | Método | Endpoint | Servicio | Propósito |
|---|--------|----------|----------|-----------|
| 1 | GET | `/calendario/plazos` | `calendarioService.listarPlazos()` | Listar plazos con filtros avanzados |
| 2 | POST | `/calendario/eventos` | `calendarioService.crearPlazo()` | Crear nuevo plazo/proceso |

### Funcionalidades

#### Lectura (GET)
- Filtros por estado: todos, activos, vencidos, próximos
- Filtros por rango de fechas
- Búsqueda por texto
- Estadísticas en tiempo real

#### Creación (POST)
```typescript
{
  titulo: string;
  descripcion?: string;
  fechaInicio: string;      // Fecha límite
  fechaFin?: string;        // Opcional
  tipo: 'PLAZO';            // Siempre PLAZO
  expedienteId?: string;
}
```

---

## 📈 Estadísticas por Página

| Página | APIs | Solo Lectura | Escritura | Complejidad |
|--------|------|--------------|-----------|---------------|
| Dashboard | 1 | ✅ | ❌ | ⭐ Baja |
| Dashboard Core | 2 | ✅ | ❌ | ⭐ Baja |
| Expedientes | 2 | ✅ | ✅ Eliminar | ⭐⭐ Media |
| Nuevo Expediente | 2 | ✅ Buscar | ✅ Crear | ⭐⭐ Media |
| Detalle Expediente | 3 | ✅ | ✅ Eliminar | ⭐⭐⭐ Alta |
| Calendario | 1 | ✅ | ❌ | ⭐ Baja |
| Audiencias | 1 | ✅ | ❌ | ⭐ Baja |
| Prescripciones | 1 | ✅ | ❌ | ⭐ Baja |
| Plazos Procesales | 2 | ✅ | ✅ Crear | ⭐⭐ Media |

---

## 🔄 APIs Más Reutilizadas

| Endpoint | Usos | Páginas |
|----------|------|---------|
| `GET /expedientes/stats/dashboard` | 2 | Dashboard, Dashboard Core |
| `GET /calendario/plazos` | 2 | Prescripciones, Plazos Procesales |
| `DELETE /expedientes/:id` | 2 | Expedientes, Detalle Expediente |

---

## 🔒 Autenticación

Todas las APIs requieren:
- **Header:** `Authorization: Bearer {token}`
- **Middleware:** `authMiddleware`
- **Token:** Obtenido de `authService.getAccessToken()`

---

## 📡 Servicios Frontend

### expedienteService
```typescript
- obtenerEstadisticas(): DashboardStats
- listarExpedientes(params): PaginatedResponse<Expediente>
- obtenerExpediente(id): Expediente
- crearExpediente(data): Expediente
- archivarExpediente(id): void
- obtenerActuaciones(id, params): PaginatedResponse<Actuacion>
```

### calendarioService
```typescript
- listarEventos(params): PaginatedResponse<Evento>
- listarAudiencias(desde, hasta): Evento[]
- listarPlazos(desde, hasta): Evento[]
- crearPlazo(data): Evento
- obtenerProximosEventos(dias): Evento[]
```

### clienteService
```typescript
- listarClientes(params): PaginatedResponse<Cliente>
- buscarClientes(query): Cliente[]
```

---

## 🌐 Variables de Entorno

```bash
VITE_API_URL=http://localhost:3000/api/v1
```

---

## 📝 Notas de Implementación

1. **Soft Delete:** Las operaciones DELETE no eliminan físicamente los datos, sino que marcan `deletedAt`
2. **Paginación:** Todas las listas usan paginación con `page`, `limit`, `meta`
3. **Filtros:** Los filtros se pasan como query parameters
4. **Formato de Respuesta:** Todas las APIs responden con `{ success: boolean, data: T, meta?: {...} }`
5. **Manejo de Errores:** Los errores retornan `{ success: false, error: { message, code? } }`

---

**Última actualización:** 2026-02-23  
**Versión:** 1.0  
**Módulo:** M1 - CORE LEGAL

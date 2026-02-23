# 03 - Entidades del Sistema

## Diagrama de Relaciones

```
┌─────────────┐       ┌─────────────┐       ┌─────────────┐
│   USUARIOS  │◄──────│ EXPEDIENTES │◄──────│  CLIENTES   │
└──────┬──────┘       └──────┬──────┘       └──────┬──────┘
       │                     │                     │
       │                     │                     │
       ▼                     ▼                     ▼
┌─────────────┐       ┌─────────────┐       ┌─────────────┐
│  ACTUACIONES │       │ DOCUMENTOS  │       │  FACTURAS   │
└─────────────┘       └─────────────┘       └─────────────┘
       │
       ▼
┌─────────────┐
│ PRESCRIPC.  │
└─────────────┘
```

---

## Entidades Principales

### 1. Usuario
```
Usuarios (1) ──────► (N) Expedientes
Usuarios (1) ──────► (N) Actuaciones
Usuarios (1) ──────► (N) Facturas
```

### 2. Cliente
```
Clientes (1) ──────► (N) Expedientes
Clientes (1) ──────► (N) Facturas
Clientes (1) ──────► (N) Contactos
```

### 3. Expediente
```
Expedientes (1) ───► (N) Actuaciones
Expedientes (1) ───► (N) Documentos
Expedientes (1) ───► (N) Facturas
Expedientes (1) ───► (N) Tareas
Expedientes (1) ───► (N) Prescripciones
Expedientes (1) ────► (N) Conflictos
```

---

## Entidades por Módulo

### Módulo Core
| Entidad | Descripción | Relaciones |
|---------|-------------|------------|
| Usuario | Abogado, admin, staff | Expedientes, Facturas |
| Expediente | Caso legal | Cliente, Abogado, Documentos, Actuaciones |
| Cliente | Cliente del bufete | Expedientes, Facturas |
| Contacto | Contacto de cliente | Cliente |
| Actuacion | Actuación judicial | Expediente, Usuario |
| Tarea | Tarea asociada a expediente | Expediente, Usuario |

### Módulo Finanzas
| Entidad | Descripción | Relaciones |
|---------|-------------|------------|
| Factura | Factura a cliente | Cliente, Expediente |
| LineaFactura | Línea de factura | Factura |
| Recibo | Recibo de pago | Factura |
| Gasto | Gasto del bufete | Categoría |
| Pago | Pago recibido | Factura |

### Módulo Documentos
| Entidad | Descripción | Relaciones |
|---------|-------------|------------|
| Documento | Archivo del sistema | Expediente, Usuario |
| Version | Versión de documento | Documento |
| Plantilla | Plantilla Word/PDF | Categoría |
| Biblioteca | Documento en biblioteca | Categoría |

### Módulo Oficio
| Entidad | Descripción | Relaciones |
|---------|-------------|------------|
| Turno | Turno de oficio | Usuario |
| Guardia | Guardia letrada | Usuario, Centro |
| ActuacionOficio | Actuación turno oficio | Turno |
| Liquidacion | Liquidación turno oficio | Turno, Actuacion |

### Módulo CRM
| Entidad | Descripción | Relaciones |
|---------|-------------|------------|
| Lead | Lead/Prospecto | Cliente |
| Oportunidad | Oportunidad comercial | Lead, Usuario |
| Actividad | Actividad CRM | Oportunidad, Usuario |
| Nota | Nota en CRM | Cliente, Oportunidad |

### Módulo LOPDGDD
| Entidad | Descripción | Relaciones |
|---------|-------------|------------|
| ActividadRAT | Actividad tratamiento RAT | - |
| Consentimiento | Consentimiento usuario | Cliente |
| DerechoARCO | Solicitud derecho ARCO | Cliente |
| Brecha | Brecha de seguridad | - |
| EIPD | Evaluación impacto | ActividadRAT |

### Módulo Legislación
| Entidad | Descripción | Relaciones |
|---------|-------------|------------|
| Legislacion | Norma guardada | - |
| Favorito | Legislative favorite | Usuario |
| Alerta | Alerta legislativa | Usuario |

---

## Atributos Comunes

Todas las entidades comparten:

```typescript
interface EntidadBase {
  id: string;           // UUID
  created_at: Date;     // Fecha creación
  updated_at: Date;     // Fecha modificación
  created_by: string;   // Usuario creador
  updated_by: string;   // Usuario modificador
  deleted_at?: Date;    // Soft delete
  version: number;      // Optimistic locking
}
```

---

## Enums Principales

```typescript
// Rol de usuario
enum RolUsuario {
  ADMIN = 'admin',
  ABOGADO = 'abogado',
  LETRADO = 'letrado',
  SECRETARIO = 'secretario',
  BECARIO = 'becario',
}

// Estado expediente
enum EstadoExpediente {
  ACTIVO = 'activo',
  CERRADO = 'cerrado',
  ARCHIVADO = 'archivado',
  SUSPENDIDO = 'suspendido',
}

// Tipo expediente
enum TipoExpediente {
  CIVIL = 'civil',
  PENAL = 'penal',
  LABORAL = 'laboral',
  CONTENCIOSO = 'contencioso',
  MERCANTIL = 'mercantil',
  FAMILIA = 'familia',
  ADMINISTRATIVO = 'administrativo',
}

// Estado factura
enum EstadoFactura {
  PENDIENTE = 'pendiente',
  PAGADA = 'pagada',
  VENCIDA = 'vencida',
  ANULADA = 'anulada',
}
```

---

## Relaciones Especiales

### Soft Deletes
- Cliente (para proteger datos facturables)
- Expediente (archivado en lugar de delete)
- Usuario (desactivar en lugar de delete)

### Auditoría
- Todas las entidades con `created_by`, `updated_by`
- Tabla de auditoría para cambios sensibles

### Multitenant (Futuro)
- Campo `empresa_id` en tablas principales
- Middleware de filtrado por empresa

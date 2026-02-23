# Módulo CRM - Gestión de Relaciones con Clientes

## Descripción

Módulo para gestionar las relaciones con clientes, incluyendo contactos, comunicaciones, oportunidades y seguimiento comercial.

## Tablas

### contacto

Contactos asociados a clientes o leads.

```sql
CREATE TABLE contacto (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    
    -- Relaciones
    cliente_id UUID REFERENCES cliente(id),
    lead_id UUID REFERENCES lead(id),
    usuario_id UUID REFERENCES usuario(id),
    
    -- Datos del contacto
    nombre VARCHAR(100) NOT NULL,
    apellido1 VARCHAR(100),
    apellido2 VARCHAR(100),
    cargo VARCHAR(100),
    departamento VARCHAR(100),
    
    -- Comunicación
    email VARCHAR(255),
    telefono VARCHAR(20),
    telefono_movil VARCHAR(20),
    
    -- Preferencias
    idioma VARCHAR(10) DEFAULT 'es',
    zona_horaria VARCHAR(50),
    preferenia_contacto contacto_preferencia DEFAULT 'email',
    
    -- Estado
    estado contacto_estado DEFAULT 'activo',
    es_principal BOOLEAN DEFAULT false,
    
    -- Notas
    notas TEXT,
    
    -- Timestamps
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP,
    
    -- Auditoría
    version INTEGER DEFAULT 1
);

CREATE INDEX idx_contacto_cliente ON contacto(cliente_id);
CREATE INDEX idx_contacto_email ON contacto(email);
CREATE INDEX idx_contacto_estado ON contacto(estado);
```

### lead

Leads o prospectos potenciales.

```sql
CREATE TABLE lead (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    
    -- Datos del lead
    nombre VARCHAR(255) NOT NULL,
    tipo lead_tipo,
    origen lead_origen,
    
    -- Datos de empresa (si aplica)
    empresa VARCHAR(255),
    cif VARCHAR(20),
    sector VARCHAR(100),
    tamano VARCHAR(20),
    
    -- Contacto principal
    nombre_contacto VARCHAR(100),
    email VARCHAR(255),
    telefono VARCHAR(20),
    
    -- Información comercial
    presupuesto DECIMAL(12,2),
    urgencia lead_urgencia,
    probabilidad DECIMAL(5,2) DEFAULT 0,
    valor_estimado DECIMAL(12,2),
    
    -- Estado
    estado lead_estado DEFAULT 'nuevo',
    fase funnel_fase DEFAULT 'captacion',
    
    -- Fechas
    fecha_cierre_prevista DATE,
    fecha_conversion DATE,
    
    -- Asignación
    usuario_id UUID REFERENCES usuario(id),
    fuente VARCHAR(100),
    campana VARCHAR(100),
    
    -- Notas
    notas TEXT,
    descripcion TEXT,
    
    -- Seguimiento
    ultimo_contacto TIMESTAMP,
    veces_contactado INTEGER DEFAULT 0,
    
    -- Timestamps
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP,
    
    -- Auditoría
    version INTEGER DEFAULT 1,
    converted_to_cliente_id UUID REFERENCES cliente(id)
);

CREATE INDEX idx_lead_estado ON lead(estado);
CREATE INDEX idx_lead_usuario ON lead(usuario_id);
CREATE INDEX idx_lead_fecha ON lead(created_at);
CREATE INDEX idx_lead_origen ON lead(origen);
```

### comunicacion

Registro de comunicaciones con clientes.

```sql
CREATE TABLE comunicacion (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    
    -- Relaciones
    cliente_id UUID REFERENCES cliente(id),
    contacto_id UUID REFERENCES contacto(id),
    expediente_id UUID REFERENCES expediente(id),
    lead_id UUID REFERENCES lead(id),
    usuario_id UUID REFERENCES usuario(id),
    
    -- Datos de la comunicación
    tipo comunicacion_tipo NOT NULL,
    canal comunicacion_canal NOT NULL,
    direccion comunicacion_direccion DEFAULT 'enviada',
    
    -- Contenido
    asunto VARCHAR(255),
    cuerpo TEXT,
    
    -- Metadata
    metadata JSONB,
    
    -- Estado
    estado comunicacion_estado DEFAULT 'pendiente',
    
    -- Seguimiento
    leida BOOLEAN DEFAULT false,
    leida_at TIMESTAMP,
    
    -- Timestamps
    fecha_programada TIMESTAMP,
    fecha_envio TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP,
    
    -- Auditoría
    version INTEGER DEFAULT 1
);

CREATE INDEX idx_comunicacion_cliente ON comunicacion(cliente_id);
CREATE INDEX idx_comunicacion_tipo ON comunicacion(tipo);
CREATE INDEX idx_comunicacion_fecha ON comunicacion(created_at);
```

### tarea_comercial

Tareas de seguimiento comercial.

```sql
CREATE TABLE tarea_comercial (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    
    -- Relaciones
    cliente_id UUID REFERENCES cliente(id),
    lead_id UUID REFERENCES lead(id),
    usuario_id UUID REFERENCES usuario(id),
    
    -- Datos
    tipo tarea_tipo NOT NULL,
    titulo VARCHAR(255) NOT NULL,
    descripcion TEXT,
    prioridad tarea_prioridad DEFAULT 'media',
    
    -- Fechas
    fecha_inicio TIMESTAMP,
    fecha_fin TIMESTAMP,
    fecha_recordatorio TIMESTAMP,
    recordatorio_enviado BOOLEAN DEFAULT false,
    
    -- Estado
    estado tarea_estado DEFAULT 'pendiente',
    completada_at TIMESTAMP,
    
    -- Resultado
    resultado TEXT,
    notas TEXT,
    
    -- Timestamps
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP,
    
    -- Auditoría
    version INTEGER DEFAULT 1
);

CREATE INDEX idx_tarea_comercial_usuario ON tarea_comercial(usuario_id);
CREATE INDEX idx_tarea_comercial_estado ON tarea_comercial(estado);
CREATE INDEX idx_tarea_comercial_fecha ON tarea_comercial(fecha_fin);
```

### nota

Notas y comentarios sobre clientes.

```sql
CREATE TABLE nota (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    
    -- Relaciones
    entidad_type VARCHAR(50) NOT NULL,
    entidad_id UUID NOT NULL,
    usuario_id UUID REFERENCES usuario(id),
    
    -- Contenido
    contenido TEXT NOT NULL,
    es_privada BOOLEAN DEFAULT false,
    es_importante BOOLEAN DEFAULT false,
    
    -- Categoría
    categoria nota_categoria,
    
    -- Adjuntos
    adjuntos JSONB,
    
    -- Timestamps
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP
);

CREATE INDEX idx_nota_entidad ON nota(entidad_type, entidad_id);
CREATE INDEX idx_nota_usuario ON nota(usuario_id);
```

## Enums

```sql
CREATE TYPE contacto_preferencia AS ENUM ('email', 'telefono', 'whatsapp', 'presencial');

CREATE TYPE contacto_estado AS ENUM ('activo', 'inactivo', 'bloqueado');

CREATE TYPE lead_tipo AS ENUM ('empresa', 'particular', 'autonomo', 'institucion');

CREATE TYPE lead_origen AS ENUM ('web', 'referido', 'feria', 'campana', 'redes_sociales', 'busqueda', 'otro');

CREATE TYPE lead_urgencia AS ENUM ('baja', 'media', 'alta', 'urgente');

CREATE TYPE lead_estado AS ENUM ('nuevo', 'contactado', 'calificado', 'propuesta', 'negociacion', 'ganado', 'perdido', 'no_calificado');

CREATE TYPE funnel_fase AS ENUM ('captacion', 'contacto', 'calificacion', 'propuesta', 'negociacion', 'cierre');

CREATE TYPE comunicacion_tipo AS ENUM ('informativa', 'comercial', 'legal', 'seguimiento', 'formal');

CREATE TYPE comunicacion_canal AS ENUM ('email', 'telefono', 'whatsapp', 'presencial', 'postal');

CREATE TYPE comunicacion_direccion AS ENUM ('enviada', 'recibida');

CREATE TYPE comunicacion_estado AS ENUM ('borrador', 'pendiente', 'enviada', 'entregada', 'leida', 'fallida', 'cancelada');

CREATE TYPE tarea_tipo AS ENUM ('llamada', 'reunion', 'seguimiento', 'presentacion', 'propuesta', 'cierre');

CREATE TYPE tarea_prioridad AS ENUM ('baja', 'media', 'alta', 'urgente');

CREATE TYPE tarea_estado AS ENUM ('pendiente', 'en_progreso', 'completada', 'cancelada', 'aplazada');

CREATE TYPE nota_categoria AS ENUM ('general', 'importante', 'seguimiento', 'historico', 'legal');
```

## Relaciones

```
cliente ─────< contacto
lead ────────< contacto
cliente ─────< comunicacion
contacto ───< comunicacion
expediente ─< comunicacion
cliente ─────< tarea_comercial
lead ────────< tarea_comercial
nota ───────< (entidad_polimorfica: cliente|lead|expediente|contacto)
```

## Notas

- Los leads pueden convertirse en clientes mediante el proceso de conversión
- Las comunicaciones se integran con el sistema de email
- Las tareas comerciales generan recordatorios automáticos

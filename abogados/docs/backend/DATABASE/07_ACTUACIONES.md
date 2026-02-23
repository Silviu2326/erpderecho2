# Tabla: actuaciones

## Descripción
Registra las actuaciones procesales dentro de cada expediente.

## Schema

```sql
CREATE TABLE actuacion (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    
    -- Relaciones
    expediente_id UUID NOT NULL REFERENCES expediente(id),
    usuario_id UUID REFERENCES usuario(id),
    documento_id UUID REFERENCES documento(id),
    
    -- Datos de la actuación
    tipo actuacion_tipo NOT NULL,
    subtype VARCHAR(50),
    descripcion TEXT NOT NULL,
    
    -- Fechas
    fecha_actuacion DATE NOT NULL,
    hora_actuacion TIME,
    fecha_limite DATE,
    
    -- Estado
    estado actuacion_estado DEFAULT 'pendiente',
    
    -- Detalles específicos
    Juzgado VARCHAR(255),
    procedimiento VARCHAR(255),
    numero_procedimiento VARCHAR(50),
    
    -- Resultado
    resultado TEXT,
    resumen TEXT,
    
    -- Costes
    coste DECIMAL(10,2),
    facturable BOOLEAN DEFAULT false,
    
    -- Plazo
    plazo_dias INTEGER,
    plazo_tipo VARCHAR(20),
    
    -- Timestamps
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP,
    
    -- Auditoría
    version INTEGER DEFAULT 1,
    created_by UUID REFERENCES usuario(id)
);

CREATE INDEX idx_actuacion_expediente ON actuacion(expediente_id);
CREATE INDEX idx_actuacion_fecha ON actuacion(fecha_actuacion);
CREATE INDEX idx_actuacion_tipo ON actuacion(tipo);
CREATE INDEX idx_actuacion_estado ON actuacion(estado);
```

## Enum: actuacion_tipo

```sql
CREATE TYPE actuacion_tipo AS ENUM (
    'escritura',
    'presentacion',
    'audiencia',
    'sentencia',
    'auto',
    'diligencia',
    'notificacion',
    'plazo',
    'requerimiento',
    'prueba',
    'alegacion',
    'recurso',
    'ejecucion',
    'archivo',
    'otro'
);
```

## Enum: actuacion_estado

```sql
CREATE TYPE actuacion_estado AS ENUM (
    'pendiente',
    'en_tramite',
    'completada',
    'cancelada',
    'archivada'
);
```

## Notas

- Las actuaciones generan automáticamente recordatorios
- Los plazos se calculan automáticamente
- Se integra con el calendario judicial

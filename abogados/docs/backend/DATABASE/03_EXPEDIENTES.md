# Tabla: expedientes

## Descripción
Almacena los expedientes judiciales del bufete.

## Schema

```sql
CREATE TABLE expediente (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    numero_expediente VARCHAR(50) NOT NULL UNIQUE,
    
    -- Relaciones
    cliente_id UUID NOT NULL REFERENCES cliente(id),
    abogado_id UUID REFERENCES usuario(id),
    
    -- Datos principales
    tipo expediente_tipo NOT NULL,
    estado expediente_estado DEFAULT 'activo',
    prioridad prioridad DEFAULT 'normal',
    
    -- Fechas
    fecha_apertura DATE NOT NULL,
    fecha_cierre DATE,
    fecha_archivado DATE,
    
    -- Contenido
    asunto TEXT NOT NULL,
    descripcion TEXT,
    objeto TEXT,
    
    -- JUZGADO
    jurisdiccion VARCHAR(50),
    juzgado VARCHAR(200),
    numero_procedimiento VARCHAR(50),
    rol_proceso VARCHAR(50), -- demandante, demandado
    
    -- Cuantía
    cuantia DECIMAL(15,2),
    moneda VARCHAR(3) DEFAULT 'EUR',
    
    -- Datos procesales
    demanda BOOLEAN DEFAULT false,
    sentencia BOOLEAN DEFAULT false,
    sentencia_favorable BOOLEAN,
    sentencia_fecha DATE,
    sentencia_resumen TEXT,
    
    -- Configuración
    facturable BOOLEAN DEFAULT true,
    tema_ia VARCHAR(100),
    
    -- Timestamps
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP,
    
    -- Auditoría
    version INTEGER DEFAULT 1,
    created_by UUID REFERENCES usuario(id),
    updated_by UUID REFERENCES usuario(id)
);

-- Índices
CREATE INDEX idx_expediente_numero ON expediente(numero_expediente);
CREATE INDEX idx_expediente_cliente ON expediente(cliente_id);
CREATE INDEX idx_expediente_abogado ON expediente(abogado_id);
CREATE INDEX idx_expediente_estado ON expediente(estado);
CREATE INDEX idx_expediente_tipo ON expediente(tipo);
CREATE INDEX idx_expediente_fecha ON expediente(fecha_apertura);
CREATE INDEX idx_expediente_juzgado ON expediente(juzgado);
```

## Enums

```sql
CREATE TYPE expediente_tipo AS ENUM (
    'civil',
    'penal',
    'laboral',
    'contencioso',
    'mercantil',
    'familia',
    'administrativo',
    'extranjeria',
    'social',
    'otro'
);

CREATE TYPE expediente_estado AS ENUM (
    'activo',
    'en_tramite',
    'cerrado',
    'archivado',
    'suspendido'
);

CREATE TYPE prioridad AS ENUM (
    'urgente',
    'alta',
    'normal',
    'baja'
);
```

## Relaciones

```
expediente (N) ──────► (1) cliente
expediente (N) ──────► (1) usuario (abogado)
expediente (1) ──────► (N) actuacion
expediente (1) ──────► (N) documento
expediente (1) ──────► (N) factura
expediente (1) ──────► (N) prescripcion
expediente (1) ──────► (N) tarea
expediente (1) ──────► (N) conflicto
```

## Notas

- El `numero_expediente` debe ser único en todo el sistema
- El campo `tema_ia` se usa para predicciones
- `facturable` indica si genera facturación automática

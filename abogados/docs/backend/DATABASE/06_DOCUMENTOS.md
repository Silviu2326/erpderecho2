# Tabla: documentos

## Descripción
Almacena los documentos asociados a expedientes (demandas, escritos, sentencias, etc.).

## Schema

```sql
CREATE TABLE documento (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    
    -- Identificación
    nombre VARCHAR(255) NOT NULL,
    nombre_original VARCHAR(255),
    descripcion TEXT,
    tipo documento_tipo NOT NULL,
    
    -- Relaciones
    expediente_id UUID REFERENCES expediente(id),
    cliente_id UUID REFERENCES cliente(id),
    usuario_id UUID REFERENCES usuario(id),
    
    -- Archivo
    archivo_url VARCHAR(500) NOT NULL,
    archivo_tipo VARCHAR(50),
    archivo_size BIGINT,
    mime_type VARCHAR(100),
    
    -- Firma digital
    firmado BOOLEAN DEFAULT false,
    certificado VARCHAR(255),
    hash_documento VARCHAR(64),
    hash_anterior VARCHAR(64),
    fecha_firma TIMESTAMP,
    
    -- Versión
    version INTEGER DEFAULT 1,
    version_anterior UUID REFERENCES documento(id),
    
    -- Estado
    estado documento_estado DEFAULT 'borrador',
    
    -- Metadata
    numero_paginas INTEGER,
    idioma VARCHAR(10) DEFAULT 'es',
    palabras_clave TEXT[],
    
    -- OCR
    contenido_ocr TEXT,
    ocr_realizado BOOLEAN DEFAULT false,
    ocr_confidence DECIMAL(5,2),
    
    -- Timestamps
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP,
    
    -- Auditoría
    created_by UUID REFERENCES usuario(id),
    version INTEGER DEFAULT 1
);

CREATE INDEX idx_documento_expediente ON documento(expediente_id);
CREATE INDEX idx_documento_cliente ON documento(cliente_id);
CREATE INDEX idx_documento_tipo ON documento(tipo);
CREATE INDEX idx_documento_estado ON documento(estado);
CREATE INDEX idx_documento_hash ON documento(hash_documento);
```

## Enum: documento_tipo

```sql
CREATE TYPE documento_tipo AS ENUM (
    'demanda',
    'contestacion',
    'escrito',
    'sentencia',
    'auto',
    'diligencia',
    'requerimiento',
    'acta',
    'certificado',
    'contrato',
    'documentacion_identidad',
    'documentacion_financiera',
    'presupuesto',
    'factura',
    'otro'
);
```

## Enum: documento_estado

```sql
CREATE TYPE documento_estado AS ENUM (
    'borrador',
    'pendiente_firma',
    'firmado',
    'presentado',
    'archivado',
    'eliminado'
);
```

## Tabla: documento_version

```sql
CREATE TABLE documento_version (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    documento_id UUID NOT NULL REFERENCES documento(id) ON DELETE CASCADE,
    
    version INTEGER NOT NULL,
    archivo_url VARCHAR(500) NOT NULL,
    hash_documento VARCHAR(64) NOT NULL,
    cambios TEXT,
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_by UUID REFERENCES usuario(id)
);

CREATE INDEX idx_documento_version_documento ON documento_version(documento_id);
```

## Tabla: documento_firmante

```sql
CREATE TABLE documento_firmante (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    documento_id UUID NOT NULL REFERENCES documento(id) ON DELETE CASCADE,
    
    nombre VARCHAR(255) NOT NULL,
    email VARCHAR(255),
    nif VARCHAR(20),
    rol VARCHAR(50),
    
    orden INTEGER DEFAULT 0,
    firmado BOOLEAN DEFAULT false,
    fecha_firma TIMESTAMP,
    certificado VARCHAR(255),
    ip_firma VARCHAR(45)
);

CREATE INDEX idx_documento_firmante_documento ON documento_firmante(documento_id);
```

## Notas

- El campo `hash_documento` permite verificar integridad
- Las versiones permiten auditoría y recuperación
- El OCR permite búsqueda full-text
- La firma digital utiliza certificados X.509

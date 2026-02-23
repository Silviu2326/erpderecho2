# Tabla: clientes

## Descripción
Almacena los clientes del bufete (particulares y empresas).

## Schema

```sql
CREATE TABLE cliente (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    
    -- Identificación
    tipo cliente_tipo NOT NULL,
    nif VARCHAR(20) NOT NULL,
    nombre VARCHAR(200) NOT NULL,
    razon_social VARCHAR(200),
    apellido1 VARCHAR(100),
    apellido2 VARCHAR(100),
    
    -- Contacto
    email VARCHAR(255),
    telefono VARCHAR(20),
    telefono2 VARCHAR(20),
    direccion VARCHAR(500),
    codigo_postal VARCHAR(10),
    ciudad VARCHAR(100),
    provincia VARCHAR(100),
    pais VARCHAR(100) DEFAULT 'España',
    
    -- Datos fiscales
    iva_exento BOOLEAN DEFAULT false,
    iva_reducido BOOLEAN DEFAULT false,
    retencion BOOLEAN DEFAULT false,
    iban VARCHAR(34),
    bic VARCHAR(11),
    
    -- Datos profesionales (para empresas)
    cif VARCHAR(20),
    actividad_economica VARCHAR(200),
    CNAE VARCHAR(4),
    
    -- Preferencias
    idioma VARCHAR(10) DEFAULT 'es',
    forma_pago forma_pago DEFAULT 'transferencia',
    descuento DECIMAL(5,2) DEFAULT 0,
    
    -- Gestión
    origen VARCHAR(100),
    cliente_desde DATE DEFAULT CURRENT_DATE,
    observaciones TEXT,
    tags TEXT[], -- Array de tags
    
    -- Estado
    activo BOOLEAN DEFAULT true,
    
    -- Timestamps
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP,
    
    -- Auditoría
    version INTEGER DEFAULT 1,
    created_by UUID REFERENCES usuario(id)
);

CREATE UNIQUE INDEX idx_cliente_nif ON cliente(nif);
CREATE INDEX idx_cliente_email ON cliente(email);
CREATE INDEX idx_cliente_tipo ON cliente(tipo);
CREATE INDEX idx_cliente_activo ON cliente(activo);
```

## Enum

```sql
CREATE TYPE cliente_tipo AS ENUM (
    'particular',
    'empresa',
    'autonomo',
    'administracion',
    'ong',
    'otro'
);

CREATE TYPE forma_pago AS ENUM (
    'transferencia',
    'tarjeta',
    'efectivo',
    'cheque',
    'domiciliacion'
);
```

## Relaciones

```
cliente (1) ──────► (N) expediente
cliente (1) ──────► (N) factura
cliente (1) ──────► (N) contacto (contacto_cliente)
cliente (1) ──────► (N) documento
```

## Notas

- Para empresas, `razon_social` es obligatorio
- Para particulares, `nombre` + `apellidos`
- `tags` permite categorización flexible

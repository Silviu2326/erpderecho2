# Tabla: facturas

## Descripción
Almacena las facturas emitidas a clientes.

## Schema

```sql
CREATE TABLE factura (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    numero_factura VARCHAR(20) NOT NULL UNIQUE,
    serie VARCHAR(10) DEFAULT 'A',
    numero_factura_rectificada UUID REFERENCES factura(id),
    
    -- Relaciones
    cliente_id UUID NOT NULL REFERENCES cliente(id),
    expediente_id UUID REFERENCES expediente(id),
    usuario_id UUID REFERENCES usuario(id),
    
    -- Fechas
    fecha_emision DATE NOT NULL,
    fecha_vencimiento DATE NOT NULL,
    fecha_pago DATE,
    fecha_rectificacion DATE,
    
    -- Conceptos
    concepto TEXT NOT NULL,
    
    -- Importes
    base_imponible DECIMAL(12,2) NOT NULL,
    iva DECIMAL(12,2) DEFAULT 0,
    iva_porcentaje DECIMAL(5,2) DEFAULT 21.00,
    retencion DECIMAL(12,2) DEFAULT 0,
    retencion_porcentaje DECIMAL(5,2) DEFAULT 0,
    descuento DECIMAL(12,2) DEFAULT 0,
    total DECIMAL(12,2) NOT NULL,
    moneda VARCHAR(3) DEFAULT 'EUR',
    
    -- Estado
    estado factura_estado DEFAULT 'pendiente',
    
    -- Datos pago
    forma_pago forma_pago DEFAULT 'transferencia',
    iban VARCHAR(34),
    banco VARCHAR(100),
    
    -- Información adicional
    observaciones TEXT,
    retenida BOOLEAN DEFAULT false,
    
    -- Factura electrónica
    facturae BOOLEAN DEFAULT false,
    uuid_facturae VARCHAR(36),
    
    -- PDF
    pdf_url VARCHAR(500),
    
    -- Timestamps
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP,
    
    -- Auditoría
    version INTEGER DEFAULT 1,
    created_by UUID REFERENCES usuario(id)
);

CREATE INDEX idx_factura_numero ON factura(numero_factura);
CREATE INDEX idx_factura_cliente ON factura(cliente_id);
CREATE INDEX idx_factura_expediente ON factura(expediente_id);
CREATE INDEX idx_factura_estado ON factura(estado);
CREATE INDEX idx_factura_fecha_emision ON factura(fecha_emision);
CREATE INDEX idx_factura_fecha_vencimiento ON factura(fecha_vencimiento);
```

## Enum

```sql
CREATE TYPE factura_estado AS ENUM (
    'borrador',
    'pendiente',
    'pagada',
    'vencida',
    'parcialmente_pagada',
    'anulada',
    'rectificada'
);
```

## Tabla: linea_factura

```sql
CREATE TABLE linea_factura (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    factura_id UUID NOT NULL REFERENCES factura(id) ON DELETE CASCADE,
    
    concepto TEXT NOT NULL,
    cantidad DECIMAL(10,2) DEFAULT 1,
    precio DECIMAL(10,4) NOT NULL,
    descuento DECIMAL(5,2) DEFAULT 0,
    iva_porcentaje DECIMAL(5,2) DEFAULT 21.00,
    total DECIMAL(12,2) NOT NULL,
    
    -- Referencia opcional a expediente/tarea
    expediente_id UUID REFERENCES expediente(id),
    tarea_id UUID REFERENCES tarea(id),
    
    orden INTEGER DEFAULT 0
);

CREATE INDEX idx_linea_factura ON linea_factura(factura_id);
```

## Estados y Transiciones

```
borrador → pendiente
pendiente → pagada / anulada
pagada → rectificada
pagada → parcialmente_pagada
parcialmente_pagada → pagada
vencida → pagada / anulada
```

## Cálculo de Totales

```sql
-- Ejemplo de cálculo
base_imponible = SUM(cantidad * precio * (1 - descuento/100))
iva = base_imponible * iva_porcentaje / 100
total = base_imponible + iva - retencion
```

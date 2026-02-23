# Schema de Base de Datos - Visión General

## Diagrama General

```
┌─────────────────────────────────────────────────────────────────────────┐
│                            USUARIOS                                      │
├─────────────────────────────────────────────────────────────────────────┤
│  id (PK)       │ email          │ password_hash │ rol   │ nombre    │
│  uuid          │ varchar(255)   │ varchar(255)  │ enum  │ varchar   │
└────────┬───────┴────────┬────────┴───────────────┴───────┴─────────────┘
         │                │
         ▼                ▼
┌─────────────────┐  ┌─────────────────┐
│   EXPEDIENTES   │  │    CLIENTES     │
├─────────────────┤  ├─────────────────┤
│ id (PK)         │  │ id (PK)         │
│ numero          │  │ nif             │
│ cliente_id (FK) │  │ nombre          │
│ tipo            │  │ tipo            │
│ estado          │  │ razon_social    │
│ abogado_id (FK) │  │ direccion       │
└────────┬────────┘  └────────┬────────┘
         │                    │
         ▼                    ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                            RELACIONES                                   │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                          │
│  Expediente ◄─────────────► Cliente                                    │
│      │                                                                    │
│      ├──────────────┬─────────────────┬──────────────────┐             │
│      ▼              ▼                 ▼                  ▼             │
│  ACTUACIONES    DOCUMENTOS        FACTURAS           TAREAS            │
│                                                                          │
│  Expediente ◄─────────────► Prescripciones                             │
│      │                                                                    │
│      ▼                                                                    │
│  CONFLICTOS                                                            │
│                                                                          │
└─────────────────────────────────────────────────────────────────────────┘
```

---

## Tablas Principales

| Tabla | Descripción | Registros típicos |
|-------|-------------|-------------------|
| usuarios | Usuarios del sistema | 10-100 |
| clientes | Clientes del bufete | 100-10000 |
| expediente | Expedientes | 1000-100000 |
| actuaciones | Actuaciones judiciales | 10000-1000000 |
| documentos | Documentos | 10000-1000000 |
| facturas | Facturas | 5000-500000 |
| turnos_oficio | Turnos de oficio | 100-10000 |

---

## Normalización

### Nivel de Normalización
- **3NF** (Forma Normal Tercera)
- Soft deletes mediante columna `deleted_at`
- Optimistic locking mediante `version`

### Conventions

- **Tablas**: snake_case, plural (usuarios, clientes)
- **Primary Keys**: UUID v4
- **Foreign Keys**: `tabla_id` (referencia_id)
- **Timestamps**: `created_at`, `updated_at`
- **Soft Delete**: `deleted_at`

---

## Índices

### Índices Principales

```sql
-- Expedientes
CREATE INDEX idx_expedientes_estado ON expediente(estado);
CREATE INDEX idx_expedientes_tipo ON expediente(tipo);
CREATE INDEX idx_expedientes_cliente ON expediente(cliente_id);
CREATE INDEX idx_expedientes_abogado ON expediente(abogado_id);
CREATE INDEX idx_expedientes_fecha ON expediente(fecha_apertura);

-- Clientes
CREATE INDEX idx_clientes_nif ON cliente(nif);
CREATE INDEX idx_clientes_email ON cliente(email);
CREATE INDEX idx_clientes_tipo ON cliente(tipo);

-- Facturas
CREATE INDEX idx_facturas_estado ON factura(estado);
CREATE INDEX idx_facturas_fecha ON factura(fecha_emision);
CREATE INDEX idx_facturas_cliente ON factura(cliente_id);
```

---

## Particiones Futuras

### Por Fecha

```sql
-- Actuaciones (partición por año)
CREATE TABLE actuaciones (
  ...
) PARTITION BY RANGE (fecha);
```

---

##Constraints

### Foreign Keys

```sql
ALTER TABLE expediente 
  ADD CONSTRAINT fk_expediente_cliente 
  FOREIGN KEY (cliente_id) REFERENCES cliente(id);

ALTER TABLE expediente 
  ADD CONSTRAINT fk_expediente_abogado 
  FOREIGN KEY (abogado_id) REFERENCES usuario(id);
```

### Unique Constraints

```sql
-- Número de expediente único
ALTER TABLE expediente 
  ADD CONSTRAINT uk_expediente_numero 
  UNIQUE (numero);

-- Email de cliente único
ALTER TABLE cliente 
  ADD CONSTRAINT uk_cliente_email 
  UNIQUE (email);
```

# Migraciones y Datos de Desarrollo

## Migraciones

### Estructura de Migraciones

```
migrations/
├── 2026_01_01_000001_create_usuarios.sql
├── 2026_01_01_000002_create_clientes.sql
├── 2026_01_01_000003_create_expedientes.sql
├── ...
└── 2026_01_15_000001_add_lopdgdd_tables.sql
```

### Convenciones

- Formato: `YYYY_MM_DD_HHMMSS_descripcion.sql`
- Una migración por cambio de schema
- Siempre hacia adelante (no modificar migraciones antiguas)
- Incluir `UP` y `DOWN` si es posible

### Migración Inicial Completa

```sql
-- migration: 2026_02_01_000001_initial_schema.sql

-- ============================================
-- USUARIOS
-- ============================================
CREATE TABLE IF NOT EXISTS usuario (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    nombre VARCHAR(100) NOT NULL,
    apellido1 VARCHAR(100),
    apellido2 VARCHAR(100),
    rol VARCHAR(20) NOT NULL DEFAULT 'abogado',
    especialidad VARCHAR(100),
    numero_colegiado VARCHAR(20),
    telefono VARCHAR(20),
    avatar_url VARCHAR(500),
    idioma VARCHAR(10) DEFAULT 'es',
    moneda VARCHAR(3) DEFAULT 'EUR',
    activo BOOLEAN DEFAULT true,
    ultimo_acceso TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP,
    version INTEGER DEFAULT 1
);

CREATE INDEX idx_usuario_email ON usuario(email);
CREATE INDEX idx_usuario_rol ON usuario(rol);

-- ============================================
-- CLIENTES
-- ============================================
CREATE TABLE IF NOT EXISTS cliente (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tipo VARCHAR(20) NOT NULL,
    nif VARCHAR(20) NOT NULL,
    nombre VARCHAR(200) NOT NULL,
    razon_social VARCHAR(200),
    email VARCHAR(255),
    telefono VARCHAR(20),
    direccion VARCHAR(500),
    codigo_postal VARCHAR(10),
    ciudad VARCHAR(100),
    provincia VARCHAR(100),
    pais VARCHAR(100) DEFAULT 'España',
    activo BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP,
    version INTEGER DEFAULT 1
);

CREATE UNIQUE INDEX idx_cliente_nif ON cliente(nif);
CREATE INDEX idx_cliente_email ON cliente(email);

-- ============================================
-- EXPEDIENTES
-- ============================================
CREATE TABLE IF NOT EXISTS expediente (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    numero_expediente VARCHAR(50) NOT NULL UNIQUE,
    cliente_id UUID NOT NULL REFERENCES cliente(id),
    abogado_id UUID REFERENCES usuario(id),
    tipo VARCHAR(30) NOT NULL,
    estado VARCHAR(20) DEFAULT 'activo',
    prioridad VARCHAR(20) DEFAULT 'normal',
    fecha_apertura DATE NOT NULL,
    fecha_cierre DATE,
    asunto TEXT NOT NULL,
    descripcion TEXT,
    cuantia DECIMAL(15,2),
    moneda VARCHAR(3) DEFAULT 'EUR',
    facturable BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP,
    version INTEGER DEFAULT 1,
    created_by UUID REFERENCES usuario(id),
    updated_by UUID REFERENCES usuario(id)
);

CREATE INDEX idx_expediente_cliente ON expediente(cliente_id);
CREATE INDEX idx_expediente_abogado ON expediente(abogado_id);
CREATE INDEX idx_expediente_estado ON expediente(estado);
CREATE INDEX idx_expediente_tipo ON expediente(tipo);

-- ============================================
-- FACTURAS
-- ============================================
CREATE TABLE IF NOT EXISTS factura (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    numero_factura VARCHAR(20) NOT NULL UNIQUE,
    serie VARCHAR(10) DEFAULT 'A',
    cliente_id UUID NOT NULL REFERENCES cliente(id),
    expediente_id UUID REFERENCES expediente(id),
    usuario_id UUID REFERENCES usuario(id),
    fecha_emision DATE NOT NULL,
    fecha_vencimiento DATE NOT NULL,
    concepto TEXT NOT NULL,
    base_imponible DECIMAL(12,2) NOT NULL,
    iva DECIMAL(12,2) DEFAULT 0,
    total DECIMAL(12,2) NOT NULL,
    estado VARCHAR(20) DEFAULT 'pendiente',
    forma_pago VARCHAR(20) DEFAULT 'transferencia',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP,
    version INTEGER DEFAULT 1
);

CREATE INDEX idx_factura_cliente ON factura(cliente_id);
CREATE INDEX idx_factura_estado ON factura(estado);
CREATE INDEX idx_factura_fecha ON factura(fecha_emision);

-- ============================================
-- DOCUMENTOS
-- ============================================
CREATE TABLE IF NOT EXISTS documento (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    nombre VARCHAR(255) NOT NULL,
    tipo VARCHAR(50),
    expediente_id UUID REFERENCES expediente(id),
    cliente_id UUID REFERENCES cliente(id),
    usuario_id UUID REFERENCES usuario(id),
    url VARCHAR(500),
    hash VARCHAR(64),
    tamano INTEGER,
    mime_type VARCHAR(100),
    firmado BOOLEAN DEFAULT false,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP,
    version INTEGER DEFAULT 1
);

CREATE INDEX idx_documento_expediente ON documento(expediente_id);
CREATE INDEX idx_documento_cliente ON documento(cliente_id);

-- ============================================
-- AUDITORIA
-- ============================================
CREATE TABLE IF NOT EXISTS auditoria_log (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    accion VARCHAR(20) NOT NULL,
    entidad VARCHAR(50) NOT NULL,
    entidad_id UUID,
    usuario_id UUID REFERENCES usuario(id),
    ip_address VARCHAR(45),
    datos_anteriores JSONB,
    datos_nuevos JSONB,
    resultado VARCHAR(20) DEFAULT 'exito',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_auditoria_entidad ON auditoria_log(entidad, entidad_id);
CREATE INDEX idx_auditoria_fecha ON auditoria_log(created_at);

-- ============================================
-- LOPDGDD
-- ============================================
CREATE TABLE IF NOT EXISTS actividad_rat (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    nombre VARCHAR(200) NOT NULL,
    descripcion TEXT,
    finalidad TEXT NOT NULL,
    base_legal VARCHAR(50) NOT NULL,
    categorias_datos TEXT[],
    transferencia_internacional BOOLEAN DEFAULT false,
    periodo_retencion VARCHAR(100),
    activo BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS consentimiento (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    cliente_id UUID REFERENCES cliente(id),
    tipo_consentimiento VARCHAR(50) NOT NULL,
    texto TEXT NOT NULL,
    activo BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

---

## Seed Data

### Datos de Desarrollo

```sql
-- seeds/001_usuarios.sql

-- Usuarios de prueba
INSERT INTO usuario (email, password_hash, nombre, apellido1, rol, numero_colegiado) VALUES
('admin@bufete.es', '$2b$10$abcdefghijklmnopqrstuv', 'Administrador', 'Admin', 'admin', NULL),
('juan.garcia@bufete.es', '$2b$10$abcdefghijklmnopqrstuv', 'Juan', 'García', 'abogado', '1234'),
('maria.lopez@bufete.es', '$2b$10$abcdefghijklmnopqrstuv', 'María', 'López', 'abogado', '5678'),
('carlos.martin@bufete.es', '$2b$10$abcdefghijklmnopqrstuv', 'Carlos', 'Martín', 'letrado', '9012');

-- seed: 002_clientes.sql

INSERT INTO cliente (tipo, nif, nombre, email, telefono, ciudad, provincia) VALUES
('particular', '12345678A', 'Juan Pérez', 'juan.perez@email.com', '600123456', 'Madrid', 'Madrid'),
('empresa', 'B12345678', 'Empresa SL', 'contacto@empresa.es', '600234567', 'Barcelona', 'Barcelona'),
('autonomo', '87654321B', 'María González', 'maria@autonomo.es', '600345678', 'Valencia', 'Valencia'),
('particular', '11223344C', 'Pedro Sánchez', 'pedro.s@email.com', '600456789', 'Sevilla', 'Sevilla');

-- seed: 003_expedientes.sql

INSERT INTO expediente (numero_expediente, cliente_id, abogado_id, tipo, estado, asunto, fecha_apertura) VALUES
(
    '2026-0001',
    (SELECT id FROM cliente WHERE nif = '12345678A'),
    (SELECT id FROM usuario WHERE email = 'juan.garcia@bufete.es'),
    'civil',
    'activo',
    'Reclamación de cantidad por impago de alquiler',
    '2026-01-15'
),
(
    '2026-0002',
    (SELECT id FROM cliente WHERE nif = 'B12345678'),
    (SELECT id FROM usuario WHERE email = 'maria.lopez@bufete.es'),
    'laboral',
    'activo',
    'Despido improcedente',
    '2026-01-20'
);

-- seed: 004_facturas.sql

INSERT INTO factura (numero_factura, cliente_id, expediente_id, fecha_emision, fecha_vencimiento, concepto, base_imponible, iva, total, estado) VALUES
(
    '2026-0001',
    (SELECT id FROM cliente WHERE nif = '12345678A'),
    (SELECT id FROM expediente WHERE numero_expediente = '2026-0001'),
    '2026-01-31',
    '2026-03-02',
    'Honorarios profesionales - Enero 2026',
    1500.00,
    315.00,
    1815.00,
    'pendiente'
);
```

---

## Scripts de Mantenimiento

```bash
#!/bin/bash
# scripts/migrate.sh

set -e

echo "Running migrations..."

# Run pending migrations
npx prisma migrate deploy

# Seed data in development
if [ "$NODE_ENV" = "development" ]; then
    echo "Seeding data..."
    psql $DATABASE_URL -f seeds/001_usuarios.sql
    psql $DATABASE_URL -f seeds/002_clientes.sql
    psql $DATABASE_URL -f seeds/003_expedientes.sql
    psql $DATABASE_URL -f seeds/004_facturas.sql
fi

echo "Migration complete!"
```

---

## Rollback

```sql
-- rollback_001.sql

-- Para revertir una migración
ALTER TABLE expediente DROP CONSTRAINT fk_expediente_cliente;
DROP INDEX idx_expediente_cliente;
DROP TABLE IF EXISTS expediente;

-- Siempre guardar el script de rollback junto a la migración
```

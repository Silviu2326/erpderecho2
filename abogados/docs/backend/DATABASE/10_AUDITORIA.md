# Auditoría del Sistema

## Descripción
Tablas para registrar todos los cambios y accesos al sistema.

## Schema

```sql
-- Log de auditoría general
CREATE TABLE auditoria_log (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    
    -- Acción
    accion auditoria_accion NOT NULL,
    entidad VARCHAR(50) NOT NULL,
    entidad_id UUID,
    
    -- Usuario
    usuario_id UUID REFERENCES usuario(id),
    usuario_email VARCHAR(255),
    ip_address VARCHAR(45),
    user_agent TEXT,
    
    -- Datos
    datos_anteriores JSONB,
    datos_nuevos JSONB,
    
    -- Resultado
    resultado auditoria_resultado DEFAULT 'exito',
    mensaje_error TEXT,
    
    -- Metadata
    modulo VARCHAR(50),
    submodulo VARCHAR(50),
    
    -- Timestamps
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    -- Sesión
    session_id VARCHAR(100),
    request_id VARCHAR(100)
);

-- Auditoría específica de Expedientes
CREATE TABLE auditoria_expediente (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    
    expediente_id UUID NOT NULL REFERENCES expediente(id),
    usuario_id UUID REFERENCES usuario(id),
    
    accion auditoria_accion NOT NULL,
    campo VARCHAR(50),
    valor_anterior TEXT,
    valor_nuevo TEXT,
    
    motivo TEXT,
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Auditoría de Login
CREATE TABLE auditoria_login (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    
    usuario_id UUID REFERENCES usuario(id),
    email VARCHAR(255),
    
    -- Login
    tipo_login auditoria_login_tipo DEFAULT 'password',
    ip_address VARCHAR(45),
    user_agent TEXT,
    
    -- Resultado
    resultado auditoria_resultado NOT NULL,
    motivo_fallo VARCHAR(100),
    
    -- Tokens
    token_id VARCHAR(100),
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Auditoría de Documentos
CREATE TABLE auditoria_documento (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    
    documento_id UUID NOT NULL REFERENCES documento(id),
    usuario_id UUID REFERENCES usuario(id),
    
    accion auditoria_accion NOT NULL,
    
    -- Detalles
    nombre_fichero VARCHAR(255),
    hash_anterior VARCHAR(64),
    hash_nuevo VARCHAR(64),
    tamano INTEGER,
    
    -- Descarga
    url_descarga VARCHAR(500),
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Auditoría de Facturación
CREATE TABLE auditoria_factura (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    
    factura_id UUID NOT NULL REFERENCES factura(id),
    usuario_id UUID REFERENCES usuario(id),
    
    accion auditoria_accion NOT NULL,
    
    -- Cambios
    campo VARCHAR(50),
    valor_anterior TEXT,
    valor_nuevo TEXT,
    
    -- Pago
    fecha_pago_anterior DATE,
    fecha_pago_nueva DATE,
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Retención de logs
CREATE TABLE auditoria_config (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    
    tabla VARCHAR(50) NOT NULL,
    
    -- Retención
    retention_days INTEGER DEFAULT 2555, -- 7 años para legales
    compression_enabled BOOLEAN DEFAULT true,
    archive_after_days INTEGER DEFAULT 365,
    
    -- Estado
    activo BOOLEAN DEFAULT true,
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Exportaciones de datos (RGPD)
CREATE TABLE auditoria_exportacion_datos (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    
    usuario_solicitante UUID REFERENCES usuario(id),
    cliente_id UUID REFERENCES cliente(id),
    
    -- Solicitud
    tipo_exportacion VARCHAR(50) NOT NULL,
    motivo TEXT,
    
    -- Datos incluidos
    datos_incluidos TEXT[],
    
    -- Estado
    estado exportacion_estado DEFAULT 'pendiente',
    fecha_inicio TIMESTAMP,
    fecha_fin TIMESTAMP,
    
    -- Fichero
    url_fichero VARCHAR(500),
    hash_fichero VARCHAR(64),
    tamano_bytes INTEGER,
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

## Enums

```sql
CREATE TYPE auditoria_accion AS ENUM (
    'CREATE',
    'READ',
    'UPDATE',
    'DELETE',
    'LOGIN',
    'LOGOUT',
    'EXPORT',
    'IMPORT',
    'FIRMA',
    'DESCARGA',
    'ENVIO',
    'ACCESO_DENEGADO'
);

CREATE TYPE auditoria_resultado AS ENUM (
    'exito',
    'error',
    'bloqueado',
    'timeout'
);

CREATE TYPE auditoria_login_tipo AS ENUM (
    'password',
    'oauth',
    'token',
    'sso',
    '2fa'
);

CREATE TYPE exportacion_estado AS ENUM (
    'pendiente',
    'procesando',
    'completado',
    'error',
    'caducado'
);
```

## Índices

```sql
-- Auditoría general
CREATE INDEX idx_auditoria_entidad ON auditoria_log(entidad, entidad_id);
CREATE INDEX idx_auditoria_usuario ON auditoria_log(usuario_id);
CREATE INDEX idx_auditoria_accion ON auditoria_log(accion);
CREATE INDEX idx_auditoria_fecha ON auditoria_log(created_at);
CREATE INDEX idx_auditoria_modulo ON auditoria_log(modulo);

-- Login
CREATE INDEX idx_auditoria_login_usuario ON auditoria_login(usuario_id);
CREATE INDEX idx_auditoria_login_fecha ON auditoria_login(created_at);
CREATE INDEX idx_auditoria_login_ip ON auditoria_login(ip_address);

-- Documentos
CREATE INDEX idx_auditoria_doc_documento ON auditoria_documento(documento_id);
CREATE INDEX idx_auditoria_doc_fecha ON auditoria_documento(created_at);

-- Facturas
CREATE INDEX idx_auditoria_factura_factura ON auditoria_factura(factura_id);
CREATE INDEX idx_auditoria_factura_fecha ON auditoria_factura(created_at);

-- Particionado por fecha (opcional)
-- CREATE TABLE auditoria_log PARTITION BY RANGE (created_at);
```

## Políticas de Retención

| Tipo de Log | Retención |
|-------------|-----------|
| Login/Logout | 2 años |
| Acceso a datos | 5 años |
| Modificaciones | 7 años |
| Facturación | 10 años |
| Exportaciones RGPD | 5 años |

## Consultas Útiles

```sql
-- Últimos accesos de un usuario
SELECT * FROM auditoria_log 
WHERE usuario_id = 'uuid' 
ORDER BY created_at DESC 
LIMIT 100;

-- Cambios en un expediente
SELECT * FROM auditoria_expediente 
WHERE expediente_id = 'uuid' 
ORDER BY created_at DESC;

-- Intentos de login fallidos
SELECT * FROM auditoria_login 
WHERE resultado = 'error' 
AND created_at > NOW() - INTERVAL '24 hours';

-- Descargas de documentos
SELECT * FROM auditoria_documento 
WHERE accion = 'DESCARGA' 
ORDER BY created_at DESC;
```

## Notas

- Los logs de auditoría no deben modificarse nunca
- Usar particiones por fecha para optimización
- Comprimir logs antiguos automáticamente
- Exportar a storage frío después de 1 año

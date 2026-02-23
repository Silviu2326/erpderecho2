# Tabla: usuarios

## Descripción
Almacena los usuarios del sistema (abogados, administradores, personal).

## Schema

```sql
CREATE TABLE usuario (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    nombre VARCHAR(100) NOT NULL,
    apellido1 VARCHAR(100),
    apellido2 VARCHAR(100),
    rol usuario_rol NOT NULL DEFAULT 'abogado',
    especialidad VARCHAR(100),
    numero_colegiado VARCHAR(20),
    telefono VARCHAR(20),
    avatar_url VARCHAR(500),
    idioma VARCHAR(10) DEFAULT 'es',
    moneda VARCHAR(3) DEFAULT 'EUR',
    
    -- Estado
    activo BOOLEAN DEFAULT true,
    ultimo_acceso TIMESTAMP,
    
    -- Timestamps
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP,
    
    -- Auditoría
    version INTEGER DEFAULT 1
);

CREATE INDEX idx_usuario_email ON usuario(email);
CREATE INDEX idx_usuario_rol ON usuario(rol);
CREATE INDEX idx_usuario_activo ON usuario(activo);
```

## Enum: usuario_rol

```sql
CREATE TYPE usuario_rol AS ENUM (
    'admin',
    'abogado',
    'letrado',
    'secretario',
    'becario',
    'colaborador'
);
```

## Datos de Ejemplo

```sql
INSERT INTO usuario (email, password_hash, nombre, apellido1, rol) VALUES
('admin@bufete.es', '$2b$10$...', 'Admin', 'Admin', 'admin'),
('juan@bufete.es', '$2b$10$...', 'Juan', 'García', 'abogado'),
('maria@bufete.es', '$2b$10$...', 'María', 'López', 'abogado');
```

## Notas

- La contraseña se almacena como hash bcrypt
- El campo `rol` determina los permisos
- El campo `idioma` y `moneda` son preferencias de usuario
- Soft delete mediante `deleted_at`

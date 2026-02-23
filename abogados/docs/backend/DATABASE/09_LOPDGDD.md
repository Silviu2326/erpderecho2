# Tabla: LOPDGDD - Protección de Datos

## Descripción
Almacena todo lo relacionado con el cumplimiento del RGPD/LOPDGDD.

## Schema

```sql
-- Actividad de Tratamiento (RAT)
CREATE TABLE actividad_rat (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    
    -- Datos del tratamiento
    nombre VARCHAR(200) NOT NULL,
    descripcion TEXT,
    finalidad TEXT NOT NULL,
    
    -- Base legal
    base_legal lopdgdd_base_legal NOT NULL,
    base_legal_descripcion TEXT,
    
    -- Categorías de datos
    categorias_datos lopdgdd_categoria_datos[],
    
    -- Interesados
    interesados lopdgdd_interesado[],
    
    -- Destinatarios
    destinatarios TEXT[],
    
    -- Transferencias internacionales
    transferencia_internacional BOOLEAN DEFAULT false,
    mecanismo_transferencia VARCHAR(50),
    pais_destino VARCHAR(100),
    
    -- Retención
    periodo_retencion VARCHAR(100),
    medida_seguridad TEXT,
    
    -- Decisiones automatizadas
    decisiones_automatizadas BOOLEAN DEFAULT false,
    perfilado BOOLEAN DEFAULT false,
    
    -- Estado
    activo BOOLEAN DEFAULT true,
    nivel_riesgo lopdgdd_nivel_riesgo DEFAULT 'bajo',
    
    -- Timestamps
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_by UUID REFERENCES usuario(id)
);

-- Consentimientos
CREATE TABLE consentimiento (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    
    -- Relación
    cliente_id UUID REFERENCES cliente(id),
    
    -- Datos del consentimiento
    tipo_consentimiento VARCHAR(50) NOT NULL,
    categoria lopdgdd_consentimiento_categoria NOT NULL,
    texto TEXT NOT NULL,
    obligatorio BOOLEAN DEFAULT false,
    doble_optin BOOLEAN DEFAULT false,
    
    -- Estado
    activo BOOLEAN DEFAULT true,
    fecha_concesion TIMESTAMP,
    fecha_revocado TIMESTAMP,
    
    -- IP y evidencia
    ip_concesion VARCHAR(45),
    user_agent_concesion TEXT,
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Derechos ARCO
CREATE TABLE derecho_arc (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    
    -- Solicitud
    cliente_id UUID REFERENCES cliente(id),
    tipo_derecho lopdgdd_tipo_derecho NOT NULL,
    
    -- Solicitud
    descripcion TEXT,
    documento_identidad VARCHAR(100),
    
    -- Procesamiento
    estado lopdgdd_derecho_estado DEFAULT 'pendiente',
    fecha_recepcion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    fecha_respuesta TIMESTAMP,
    fecha_limite TIMESTAMP,
    
    -- Respuesta
    respuesta TEXT,
    documento_respuesta UUID REFERENCES documento(id),
    
    -- Usuario procesamiento
    usuario_responsable UUID REFERENCES usuario(id),
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Brechas de seguridad
CREATE TABLE brecha_seguridad (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    
    -- Descripción
    titulo VARCHAR(200) NOT NULL,
    descripcion TEXT NOT NULL,
    tipo lopdgdd_tipo_brecha NOT NULL,
    
    -- Afectados
    numero_afectados INTEGER DEFAULT 0,
    categorias_afectadas lopdgdd_categoria_datos[],
    
    -- Severidad
    severidad lopdgdd_severidad DEFAULT 'media',
    
    -- Fechas
    fecha_deteccion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    fecha_notificacion_aepd TIMESTAMP,
    fecha_notificacion_afectados TIMESTAMP,
    
    -- Notificaciones
    notificada_aepd BOOLEAN DEFAULT false,
    notificada_dpo BOOLEAN DEFAULT false,
    notificada_afectados BOOLEAN DEFAULT false,
    
    -- Medidas
    medidas_inmediatas TEXT,
    medidas_correctivas TEXT,
    
    -- Estado
    estado lopdgdd_brecha_estado DEFAULT 'investigacion',
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_by UUID REFERENCES usuario(id)
);

-- EIPD (Evaluación de Impacto)
CREATE TABLE eipd (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    
    -- Relación con actividad RAT
    actividad_rat_id UUID REFERENCES actividad_rat(id),
    
    -- Datos
    titulo VARCHAR(200) NOT NULL,
    descripcion TEXT,
    
    -- Evaluación
    necesidad_tratamiento TEXT,
    proporcionalidad TEXT,
    riesgos_identificados JSONB,
    medidas_propuestas TEXT,
    
    -- Consulta previa
    consulta_previa BOOLEAN DEFAULT false,
    respuesta_aeprd TEXT,
    
    -- Estado
    estado eipd_estado DEFAULT 'borrador',
    
    -- Fechas
    fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    fecha_aprobacion TIMESTAMP,
    usuario_aprobador UUID REFERENCES usuario(id),
    
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Responsable del tratamiento
CREATE TABLE responsable_tratamiento (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    
    nombre VARCHAR(200) NOT NULL,
    nif VARCHAR(20) NOT NULL,
    direccion TEXT,
    email VARCHAR(255) NOT NULL,
    telefono VARCHAR(20),
    
    -- DPO
    dpo_nombre VARCHAR(100),
    dpo_email VARCHAR(255),
    dpo_telefono VARCHAR(20),
    
    -- Registro
    registro_inspeccion VARCHAR(50),
    actividad_principal TEXT,
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

## Enums

```sql
CREATE TYPE lopdgdd_base_legal AS ENUM (
    'consentimiento',
    'contrato',
    'obligacion_legal',
    'interes_vital',
    'tarea_publica',
    'interes_legitimo'
);

CREATE TYPE lopdgdd_categoria_datos AS ENUM (
    'identificacion',
    'contacto',
    'financieros',
    'laborales',
    'salud',
    'condena_penal',
    'biometricos',
    'localizacion',
    'comunicaciones',
    'profesional'
);

CREATE TYPE lopdgdd_interesado AS ENUM (
    'empleados',
    'clientes',
    'proveedores',
    'candidatos',
    'contactos',
    'usuarios_web'
);

CREATE TYPE lopdgdd_nivel_riesgo AS ENUM (
    'bajo',
    'medio',
    'alto',
    'critico'
);

CREATE TYPE lopdgdd_consentimiento_categoria AS ENUM (
    'cookies',
    'analiticas',
    'marketing',
    'terceros',
    'comercial',
    'newsletter'
);

CREATE TYPE lopdgdd_tipo_derecho AS ENUM (
    'acceso',
    'rectificacion',
    'supresion',
    'limitacion',
    'portabilidad',
    'oposicion'
);

CREATE TYPE lopdgdd_derecho_estado AS ENUM (
    'pendiente',
    'en_proceso',
    'completado',
    'rechazado',
    'ampliado'
);

CREATE TYPE lopdgdd_tipo_brecha AS ENUM (
    'confidencialidad',
    'integridad',
    'disponibilidad'
);

CREATE TYPE lopdgdd_severidad AS ENUM (
    'baja',
    'media',
    'alta',
    'critica'
);

CREATE TYPE lopdgdd_brecha_estado AS ENUM (
    'investigacion',
    'contencion',
    'notificacion',
    'resolucion',
    'cerrada'
);

CREATE TYPE eipd_estado AS ENUM (
    'borrador',
    'en_evaluacion',
    'pendiente_aprobacion',
    'aprobado',
    'rechazado',
    'obsoleto'
);
```

## Índices

```sql
CREATE INDEX idx_actividad_rat_legal ON actividad_rat(base_legal);
CREATE INDEX idx_actividad_rat_riesgo ON actividad_rat(nivel_riesgo);
CREATE INDEX idx_consentimiento_cliente ON consentimiento(cliente_id);
CREATE INDEX idx_consentimiento_tipo ON consentimiento(categoria);
CREATE INDEX idx_derecho_cliente ON derecho_arc(cliente_id);
CREATE INDEX idx_derecho_estado ON derecho_arc(estado);
CREATE INDEX idx_derecho_fecha ON derecho_arc(fecha_limite);
CREATE INDEX idx_brecha_estado ON brecha_seguridad(estado);
CREATE INDEX idx_brecha_fecha ON brecha_seguridad(fecha_deteccion);
CREATE INDEX idx_eipd_actividad ON eipd(actividad_rat_id);
```

## Notas

- Los consentimientos deben mantener historial (no borrar al revocar)
- Las brechas deben notificarse a AEPD en 72 horas
- El EIPD es obligatorio para tratamientos de alto riesgo
- La documentación debe conservarse 5 años mínimo

# Documentación Backend - ERP Derecho

Documentación técnica completa para el desarrollo del backend del ERP de gestión de bufete de abogados.

## Estructura

```
docs/backend/
├── 01_OVERVIEW.md           # Visión general
├── 02_ARQUITECTURA.md      # Arquitectura técnica
├── 03_ENTIDADES.md         # Entidades del sistema
├── 04_API_ENDPOINTS.md     # Endpoints REST
├── 05_AUTENTICACION.md     # Sistema de auth
├── 06_VALIDACION.md        # Validación DTOs
├── 07_ERRORES.md           # Manejo errores
├── 08_MIDDLEWARES.md       # Middlewares
├── 09_SERVICIOS.md         # Servicios
├── 10_WEBSOCKETS.md        # Tiempo real
├── 11_CACHING.md           # Redis cache
├── 12_COLAS.md             # Bull/RabbitMQ
├── 15_TESTING.md           # Estrategia testing
├── 16_DESPLIEGUE.md        # Docker, K8s
├── 17_MONITORIZACION.md    # Logs, métricas
│
├── DATABASE/
│   ├── 01_SCHEMA_OVERVIEW.md
│   ├── 02_USUARIOS.md
│   ├── 03_EXPEDIENTES.md
│   ├── 04_CLIENTES.md
│   ├── 05_FACTURAS.md
│   ├── 06_DOCUMENTOS.md
│   └── 07_ACTUACIONES.md
│
└── INTEGRACIONES/
    ├── BOE.md
    ├── CENDOJ.md
    ├── GOOGLE.md
    ├── MICROSOFT.md
    └── REGISTROS.md
```

## Uso

Esta documentación sirve como referencia para:

1. **Desarrolladores** - Entender la arquitectura y patrones
2. **Diseño de API** - Referencia de endpoints
3. **Implementación** - Esquemas de base de datos
4. **DevOps** - Despliegue y monitorización

## Tecnologías

- **Runtime**: Node.js 20+
- **Framework**: NestJS
- **DB**: PostgreSQL 15+
- **Cache**: Redis
- **Queue**: Bull/RabbitMQ
- **Search**: Elasticsearch

## Estado

**100% Completado** ✅

Total: 24 archivos de documentación

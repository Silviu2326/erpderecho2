# 02 - Arquitectura Técnica

## Arquitectura del Sistema

```
┌─────────────────────────────────────────────────────────────┐
│                        FRONTEND                              │
│                    (React + Vite)                            │
└──────────────────────────┬──────────────────────────────────┘
                           │ HTTPS
┌──────────────────────────▼──────────────────────────────────┐
│                      LOAD BALANCER                           │
│                      (Nginx / Cloud)                        │
└──────────────────────────┬──────────────────────────────────┘
                           │
┌──────────────────────────▼──────────────────────────────────┐
│                    API GATEWAY                               │
│                (Nginx / Kong / AWS API GW)                 │
│  - Rate Limiting                                            │
│  - Autenticación                                            │
│  - Logs                                                     │
│  - SSL/TLS                                                  │
└──────────────────────────┬──────────────────────────────────┘
                           │
        ┌─────────────────┼─────────────────┐
        │                 │                 │
        ▼                 ▼                 ▼
┌───────────────┐  ┌───────────────┐  ┌───────────────┐
│   API v1      │  │   API v1     │  │   Workers    │
│  (Node.js)    │  │  (Node.js)   │  │  (Colas)     │
│               │  │               │  │               │
│  - Auth       │  │  - Expedientes│  │  - OCR       │
│  - Expedientes│  │  - Clientes   │  │  - Emails    │
│  - Facturas   │  │  - Documentos │  │  - Informes  │
└───────┬───────┘  └───────┬───────┘  └───────┬───────┘
        │                  │                  │
        └──────────────────┼──────────────────┘
                           │
        ┌─────────────────┼─────────────────┐
        │                 │                 │
        ▼                 ▼                 ▼
┌───────────────┐  ┌───────────────┐  ┌───────────────┐
│  PostgreSQL    │  │    Redis     │  │ Elasticsearch │
│   (Primary)    │  │    (Cache)   │  │  (Search)    │
│                │  │               │  │               │
└───────────────┘  └───────────────┘  └───────────────┘
```

---

## Estructura del Proyecto

```
src/
├── main.ts                 # Entry point
├── app.module.ts          # Módulo raíz (NestJS)
├── config/                # Configuración
│   ├── database.ts
│   ├── redis.ts
│   └── environment.ts
├── common/                # Compartir
│   ├── decorators/
│   ├── guards/
│   ├── interceptors/
│   ├── filters/
│   └── pipes/
├── modules/               # Módulos
│   ├── auth/
│   ├── usuarios/
│   ├── expedientes/
│   ├── clientes/
│   ├── facturas/
│   ├── documentos/
│   ├── calendarios/
│   ├── of/
│   ├── crm/
│   ├── lopdgdd/
│   ├── legislacion/
│   ├── integraciones/
│   ├── marketplace/
│   └── prediccion/
├── services/              # Servicios externos
│   ├── boe/
│   ├── cendoj/
│   ├── microsoft/
│   ├── google/
│   └── notification/
├── events/                # WebSockets
└── jobs/                  # Jobs/Colas
```

---

## Patrones de Diseño

### 1. Repository Pattern
```typescript
// repositories/expediente.repository.ts
@Repository(Expediente)
export class ExpedienteRepository {
  async findById(id: string): Promise<Expediente>
  async findByCliente(clienteId: string): Promise<Expediente[]>
  async create(data: CreateExpedienteDto): Promise<Expediente>
}
```

### 2. Service Layer
```typescript
// services/expediente.service.ts
@Service()
export class ExpedienteService {
  constructor(
    private repo: ExpedienteRepository,
    private notificaciones: NotificacionService,
  ) {}

  async crear(data: CreateExpedienteDto) {
    const exp = await this.repo.create(data);
    await this.notificaciones.enviar({
      tipo: 'EXPEDIENTE CREADO',
      expedienteId: exp.id,
    });
    return exp;
  }
}
```

### 3. DTOs con Validación
```typescript
// dto/create-expediente.dto.ts
export class CreateExpedienteDto {
  @IsString()
  @IsNotEmpty()
  numero_expediente: string;

  @IsEnum(TipoExpediente)
  tipo: TipoExpediente;

  @IsUUID()
  cliente_id: string;

  @IsOptional()
  @IsString()
  descripcion?: string;
}
```

---

## Configuración de Entorno

```env
# Database
DATABASE_HOST=localhost
DATABASE_PORT=5432
DATABASE_USER=erp_user
DATABASE_PASSWORD=***
DATABASE_NAME=erp_derecho

# Redis
REDIS_HOST=localhost
REDIS_PORT=6379

# JWT
JWT_SECRET=***
JWT_EXPIRES_IN=15m
JWT_REFRESH_SECRET=***
JWT_REFRESH_EXPIRES_IN=7d

# Servicios externos
BOE_API_KEY=***
CENDOJ_API_KEY=***
MICROSOFT_CLIENT_ID=***
MICROSOFT_CLIENT_SECRET=***
GOOGLE_CLIENT_ID=***
GOOGLE_CLIENT_SECRET=***

# AWS S3 (documentos)
AWS_ACCESS_KEY_ID=***
AWS_SECRET_ACCESS_KEY=***
AWS_BUCKET=erp-documentos

# Email
SMTP_HOST=smtp.example.com
SMTP_PORT=587
SMTP_USER=***
SMTP_PASSWORD=***
```

---

## Caché

| Estrategia | TTL | Uso |
|-----------|-----|-----|
| **Cacheaside** | 5-15 min | Datos frecuentemente leídos |
| **Write-through** | - | Facturas, presupuestos |
| **TTL corto** | 1 min | Datos que cambian a menudo |
| **Invalidación** | - | Por evento de escritura |

---

## Colas (Bull/RabbitMQ)

| Cola | Prioridad | Descripción |
|------|-----------|-------------|
| `ocr` | baja | Procesamiento OCR |
| `emails` | media | Envío de emails |
| `informes` | baja | Generación PDF |
| `webhooks` | alta | Notificaciones externas |
| `sync` | baja | Sincronización externa |

---

## Seguridad

1. **HTTPS** - SSL/TLS obligatorio
2. **CORS** - Whitelist de dominios
3. **Helmet** - Headers de seguridad
4. **Rate Limiting** - Por usuario/IP
5. **Input Validation** - Zod/class-validator
6. **SQL Injection** - ORM + sanitize
7. **XSS** - Sanitización de salida
8. **CSRF** - Tokens

---

## Despliegue

### Desarrollo
```bash
npm run start:dev
```

### Producción
```bash
# Docker
docker build -t erp-derecho-api .
docker run -p 3000:3000 erp-derecho-api

# Docker Compose
docker-compose up -d
```

### Variables de Producción
- NODE_ENV=production
- Clustering (PM2 o内置)
- Logs estructurados (Winston/Pino)
- Health checks
- Graceful shutdown

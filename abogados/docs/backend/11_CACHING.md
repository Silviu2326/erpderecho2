# 11 - Estrategias de Caché

## Visión General

El sistema implementa múltiples estrategias de caché para optimizar el rendimiento y reducir la carga en la base de datos.

---

## Estrategias de Caché

### 1. Cache-Aside (Lectura)

```
┌─────────┐         ┌─────────┐         ┌─────────┐
│ Cliente │────────►│  API    │────────►│   DB    │
└─────────┘         └────┬────┘         └─────────┘
                        │
                        ▼
                  ┌─────────┐
                  │  Redis  │◄── Cache hit
                  └─────────┘
```

```typescript
@Injectable()
export class ExpedienteService {
  async findById(id: string): Promise<Expediente> {
    const cacheKey = `expediente:${id}`;
    
    // 1. Check cache
    const cached = await this.cacheManager.get(cacheKey);
    if (cached) {
      return cached;
    }
    
    // 2. Fetch from DB
    const expediente = await this.expedienteRepo.findOne(id);
    
    // 3. Store in cache (5 min TTL)
    await this.cacheManager.set(cacheKey, expediente, 300);
    
    return expediente;
  }
}
```

### 2. Write-Through (Escritura)

```typescript
@Injectable()
export class FacturaService {
  async create(dto: CreateFacturaDto): Promise<Factura> {
    // 1. Write to DB
    const factura = await this.facturaRepo.create(dto);
    
    // 2. Write to cache immediately
    const cacheKey = `factura:${factura.id}`;
    await this.cacheManager.set(cacheKey, factura);
    
    return factura;
  }
}
```

### 3. Write-Behind (Escritura Asíncrona)

```typescript
@Injectable()
export class DocumentoService {
  async upload(file: Express.Multer.File): Promise<Documento> {
    // 1. Store in cache temporarily
    await this.cacheManager.set(`upload:${file.filename}`, {
      status: 'processing',
      progreso: 0
    });
    
    // 2. Queue for DB write
    await this.queueService.add('documento-procesar', {
      file: file.filename
    });
    
    return { filename: file.filename, status: 'processing' };
  }
}
```

---

## Configuración de TTL

| Recurso | TTL | Estrategia | Invalidation |
|---------|-----|------------|---------------|
| Expedientes | 5 min | Cache-aside | On update/delete |
| Clientes | 10 min | Cache-aside | On update |
| Facturas | 15 min | Write-through | On payment |
| Legislación BOE | 24 h | Cache-aside | Scheduled |
| Rates cambio | 1 h | Cache-aside | Scheduled |
| catálogos | 1 día | Cache-aside | Manual |

---

## Invalidación de Caché

### Por Patrón

```typescript
@Injectable()
export class CacheService {
  async invalidatePattern(pattern: string): Promise<void> {
    const keys = await this.redis.keys(pattern);
    if (keys.length > 0) {
      await this.redis.del(...keys);
    }
  }
}

// Uso
await this.cacheService.invalidatePattern('expediente:*');
```

### Por Evento

```typescript
@Injectable()
export class ExpedienteEventsHandler {
  @OnEvent('expediente.updated')
  async handleExpedienteUpdate(payload: { id: string }) {
    await this.cacheService.invalidate(`expediente:${payload.id}`);
  }
  
  @OnEvent('expediente.deleted')
  async handleExpedienteDelete(payload: { id: string }) {
    await this.cacheService.invalidate(`expediente:${payload.id}`);
  }
}
```

---

## Redis Configuration

```typescript
// cache.config.ts
export const cacheConfig: RedisModuleOptions = {
  host: process.env.REDIS_HOST || 'localhost',
  port: parseInt(process.env.REDIS_PORT) || 6379,
  password: process.env.REDIS_PASSWORD,
  db: 0,
  keyPrefix: 'erp:',
  retryStrategy: (times) => {
    const delay = Math.min(times * 50, 2000);
    return delay;
  },
  maxRetriesPerRequest: 3,
  enableReadyCheck: true,
  enableOfflineQueue: true,
};
```

---

## Caché Distribuido vs Local

### Redis (Compartido)
- Sesiones de usuario
- Datos frecuentemente leídos
- Estados de cola
- Rate limiting

### Memory Cache (Local)
- Configuración de app
- catálogos pequeños
- Datos de sesión del request

```typescript
// Use local cache for static data
@Cacheable('roles')
async getRoles(): Promise<Role[]> {
  return this.roleRepo.findAll();
}
```

---

## Monitorización

```typescript
// Métricas de caché
const cacheMetrics = {
  hits: await redis.get('stats:cache:hits'),
  misses: await redis.get('stats:cache:misses'),
  hitRate: hits / (hits + misses) * 100
};
```

---

## Patrones Avanzados

### Cache Warming

```typescript
@Injectable()
export class CacheWarmingService {
  async warmUp(): Promise<void> {
    // Pre-cache top 100 expedientes
    const topExpedientes = await this.expedienteRepo.findTop(100);
    await Promise.all(
      topExpedientes.map(exp => 
        this.cacheManager.set(`expediente:${exp.id}`, exp, 300)
      )
    );
  }
}
```

### Stale-While-Revalidate

```typescript
async getExpediente(id: string): Promise<Expediente> {
  const cached = await this.cacheManager.get(`expediente:${id}`);
  
  if (cached && cached.staleAt < Date.now()) {
    // Return stale, revalidate in background
    this.refreshExpediente(id);
    return cached.data;
  }
  
  return cached || await this.fetchFromDB(id);
}
```

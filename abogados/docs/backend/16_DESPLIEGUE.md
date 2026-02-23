# Despliegue - Producción

## Visión General

```
┌─────────────────────────────────────────────────────────────┐
│                      ARQUITECTURA PRODUCCIÓN                 │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  ┌─────────────┐    ┌─────────────┐    ┌─────────────┐   │
│  │   Nginx     │───►│   API       │───►│  PostgreSQL  │   │
│  │  Load Bal. │    │  (Node.js)  │    │              │   │
│  └─────────────┘    └──────┬──────┘    └─────────────┘   │
│                            │                                │
│                      ┌──────▼──────┐                        │
│                      │    Redis    │                        │
│                      │    Cache    │                        │
│                      └─────────────┘                        │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

---

## Docker

### Dockerfile

```dockerfile
# Dockerfile
FROM node:20-alpine AS builder

WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM node:20-alpine AS runner

WORKDIR /app
ENV NODE_ENV=production

# Create non-root user
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 erpuser

COPY --from=builder --chown=erpuser:nodejs /app/dist ./dist
COPY --from=builder --chown=erpuser:nodejs /app/node_modules ./node_modules
COPY --from=builder --chown=erpuser:nodejs /app/package*.json ./

USER erpuser

EXPOSE 3000
ENV PORT=3000

CMD ["node", "dist/main.js"]
```

### .dockerignore

```
node_modules
dist
.git
*.md
.env*
coverage
```

---

## Docker Compose

```yaml
# docker-compose.yml
version: '3.8'

services:
  api:
    build: .
    ports:
      - "3000:3000"
    environment:
      - NODE_ENV=production
      - DATABASE_HOST=postgres
      - DATABASE_PORT=5432
      - REDIS_HOST=redis
    depends_on:
      - postgres
      - redis
    restart: unless-stopped

  postgres:
    image: postgres:15-alpine
    volumes:
      - postgres_data:/var/lib/postgresql/data
    environment:
      - POSTGRES_USER=erp
      - POSTGRES_PASSWORD=***
      - POSTGRES_DB=erp_derecho
    restart: unless-stopped

  redis:
    image: redis:7-alpine
    volumes:
      - redis_data:/data
    restart: unless-stopped

  nginx:
    image: nginx:alpine
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./nginx.conf:/etc/nginx/nginx.conf:ro
      - ./ssl:/etc/nginx/ssl:ro
    depends_on:
      - api
    restart: unless-stopped

volumes:
  postgres_data:
  redis_data:
```

---

## Nginx Configuration

```nginx
# nginx.conf
events {
    worker_connections 1024;
}

http {
    upstream api {
        server api:3000;
    }

    server {
        listen 80;
        server_name api.derecho.es;
        
        return 301 https://$server_name$request_uri;
    }

    server {
        listen 443 ssl http2;
        server_name api.derecho.es;
        
        ssl_certificate /etc/nginx/ssl/cert.pem;
        ssl_certificate_key /etc/nginx/ssl/key.pem;
        
        location / {
            proxy_pass http://api;
            proxy_http_version 1.1;
            proxy_set_header Upgrade $http_upgrade;
            proxy_set_header Connection 'upgrade';
            proxy_set_header Host $host;
            proxy_set_header X-Real-IP $remote_addr;
            proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
            proxy_set_header X-Forwarded-Proto $scheme;
            proxy_cache_bypass $http_upgrade;
            
            # Timeouts
            proxy_connect_timeout 60s;
            proxy_send_timeout 60s;
            proxy_read_timeout 60s;
        }
        
        # Health check
        location /health {
            proxy_pass http://api/health;
            access_log off;
        }
    }
}
```

---

## Variables de Producción

```bash
# .env.production
NODE_ENV=production
PORT=3000

# Database
DATABASE_HOST=postgres
DATABASE_PORT=5432
DATABASE_USER=erp
DATABASE_PASSWORD=***
DATABASE_NAME=erp_derecho

# Redis
REDIS_HOST=redis
REDIS_PORT=6379
REDIS_PASSWORD=***

# JWT
JWT_SECRET=***
JWT_EXPIRES_IN=15m
JWT_REFRESH_SECRET=***
JWT_REFRESH_EXPIRES_IN=7d

# Logging
LOG_LEVEL=info
LOG_FORMAT=json

# Rate Limiting
RATE_LIMIT_TTL=60
RATE_LIMIT_MAX=100
```

---

## Health Checks

```typescript
// health.controller.ts
@Controller('health')
export class HealthController {
  constructor(
    private db: DataSource,
    private redis: RedisService,
  ) {}

  @Get()
  async check() {
    const checks = {
      status: 'ok',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      database: await this.checkDatabase(),
      redis: await this.checkRedis(),
    };

    const isHealthy = checks.database === 'up' && checks.redis === 'up';
    
    return {
      status: isHealthy ? 'ok' : 'error',
      ...checks,
    };
  }

  private async checkDatabase(): Promise<string> {
    try {
      await this.db.query('SELECT 1');
      return 'up';
    } catch {
      return 'down';
    }
  }

  private async checkRedis(): Promise<string> {
    try {
      await this.redis.ping();
      return 'up';
    } catch {
      return 'down';
    }
  }
}
```

---

## Scripts de Despliegue

```bash
#!/bin/bash
# deploy.sh

set -e

echo "🚀 Starting deployment..."

# Build
echo "📦 Building..."
docker build -t erp-derecho-api:latest .

# Stop old container
echo "🛑 Stopping old container..."
docker-compose down

# Start new
echo "▶️ Starting new container..."
docker-compose up -d --build

# Wait for health
echo "⏳ Waiting for health check..."
sleep 10

# Check health
curl -f https://api.derecho.es/health || exit 1

echo "✅ Deployment complete!"
```

---

## Backup Database

```bash
#!/bin/bash
# backup.sh

DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_DIR="/backups"

docker exec erp-postgres pg_dump -U erp erp_derecho > "$BACKUP_DIR/backup_$DATE.sql"

# Keep only last 7 backups
ls -t "$BACKUP_DIR"/*.sql | tail -n +8 | xargs -r rm

echo "✅ Backup complete: backup_$DATE.sql"
```

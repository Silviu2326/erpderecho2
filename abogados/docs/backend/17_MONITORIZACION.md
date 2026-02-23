# Monitorización y Observabilidad

## Visión General

```
┌─────────────────────────────────────────────────────────────┐
│                   PILAR DE OBSERVABILIDAD                   │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│   ┌──────────┐   ┌──────────┐   ┌──────────┐              │
│   │  LOGS    │   │ MÉTRICAS │   │ TRAZAS   │              │
│   │          │   │          │   │          │              │
│   │ Winston  │   │ Prometheus│   │  Open    │              │
│   │  Pino    │   │ Grafana  │   │ Telemetry│              │
│   └──────────┘   └──────────┘   └──────────┘              │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

---

## Logs

### Winston Configuration

```typescript
// logger.service.ts
import { WinstonModule, utilities as nestWinston } from 'nest-winston';
import * as winston from 'winston';

export const winstonConfig = WinstonModule.createLogger({
  transports: [
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.timestamp(),
        nestWinston.format.nestLike(),
        winston.format.colorize(),
      ),
    }),
    new winston.transports.File({
      filename: 'logs/error.log',
      level: 'error',
      format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.json(),
      ),
    }),
    new winston.transports.File({
      filename: 'logs/combined.log',
      format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.json(),
      ),
    }),
  ],
});
```

### Uso en Servicios

```typescript
// auth.service.ts
@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  async login(user: User) {
    this.logger.log(`User login: ${user.email}`, {
      userId: user.id,
      action: 'LOGIN',
    });

    try {
      const result = await this.validateCredentials(user);
      this.logger.log(`Login successful`, { userId: user.id });
      return result;
    } catch (error) {
      this.logger.error(`Login failed: ${error.message}`, error.stack, {
        userId: user.id,
        action: 'LOGIN_ERROR',
      });
      throw error;
    }
  }
}
```

---

## Métricas

### Prometheus Metrics

```typescript
// metrics.service.ts
import { Injectable } from '@nestjs/common';
import { Counter, Histogram, Gauge } from 'nestjs-prometheus';

@Injectable()
export class MetricsService {
  @Counter({
    name: 'http_requests_total',
    help: 'Total HTTP requests',
    labelNames: ['method', 'endpoint', 'status'],
  })
  httpRequestsTotal: Counter;

  @Histogram({
    name: 'http_request_duration_seconds',
    help: 'HTTP request duration in seconds',
    labelNames: ['method', 'endpoint'],
    buckets: [0.1, 0.5, 1, 2, 5],
  })
  httpRequestDuration: Histogram;

  @Gauge({
    name: 'active_users',
    help: 'Number of active users',
  })
  activeUsers: Gauge;

  @Counter({
    name: 'database_queries_total',
    help: 'Total database queries',
    labelNames: ['operation', 'table'],
  })
  databaseQueries: Counter;
}
```

### Métricas Custom

```typescript
// Expedientes metrics
@Metric('expedientes_creados_total')
expedientesCreados: Counter;

@Metric('facturas_emitidas_total')
facturasEmitidas: Counter;

@Metric('tiempo_respuesta_api')
tiempoRespuesta: Histogram;
```

---

## Grafana Dashboards

### Dashboard Principal

```json
{
  "dashboard": {
    "title": "ERP Derecho - Production",
    "panels": [
      {
        "title": "Requests/sec",
        "targets": [
          { "expr": "rate(http_requests_total[5m])" }
        ]
      },
      {
        "title": "Response Time p95",
        "targets": [
          { "expr": "histogram_quantile(0.95, http_request_duration_seconds_bucket)" }
        ]
      },
      {
        "title": "Error Rate",
        "targets": [
          { "expr": "rate(http_requests_total{status=~'5..'}[5m])" }
        ]
      },
      {
        "title": "CPU Usage",
        "targets": [
          { "expr": "rate(process_cpu_seconds_total[1m])" }
        ]
      },
      {
        "title": "Memory Usage",
        "targets": [
          { "expr": "process_resident_memory_bytes" }
        ]
      },
      {
        "title": "Database Connections",
        "targets": [
          { "expr": "pg_stat_database_numbackends" }
        ]
      }
    ]
  }
}
```

---

## Alertas

### Prometheus Alerts

```yaml
# alerts.yml
groups:
  - name: erp-alerts
    rules:
      - alert: HighErrorRate
        expr: rate(http_requests_total{status=~'5..'}[5m]) > 0.05
        for: 5m
        labels:
          severity: critical
        annotations:
          summary: "High error rate detected"
          description: "Error rate is {{ $value | humanizePercentage }}"

      - alert: HighResponseTime
        expr: histogram_quantile(0.95, http_request_duration_seconds_bucket) > 2
        for: 5m
        labels:
          severity: warning
        annotations:
          summary: "High response time"
          description: "p95 response time is {{ $value }}s"

      - alert: DatabaseConnectionHigh
        expr: pg_stat_database_numbackends / pg_database_size(current_database()) > 0.8
        for: 5m
        labels:
          severity: warning
        annotations:
          summary: "Database connections high"

      - alert: DiskSpaceLow
        expr: (disk_free_space / disk_total_space) < 0.1
        for: 5m
        labels:
          severity: critical
        annotations:
          summary: "Disk space low"
```

---

## Trazas

### OpenTelemetry

```typescript
// main.ts
import { NodeSDK } from '@opentelemetry/sdk-node';
import { JaegerExporter } from '@opentelemetry/exporter-jaeger';
import { TraceIdRatioBased } from '@opentelemetry/trace-exporter';

const sdk = new NodeSDK({
  traceExporter: new JaegerExporter({
    endpoint: 'http://jaeger:14268/api/traces',
  }),
  sampler: new TraceIdRatioBased(0.1),
});

sdk.start();
```

### Trazas en Controladores

```typescript
// expediente.controller.ts
@Controller('expedientes')
export class ExpedienteController {
  @Get(':id')
  @Span('expediente.getById')
  async getById(@Param('id') id: string) {
    return this.expedienteService.findById(id);
  }

  @Post()
  @Span('expediente.create')
  async create(@Body() createDto: CreateExpedienteDto) {
    return this.expedienteService.create(createDto);
  }
}
```

---

## Slack Notifications

```typescript
// slack.service.ts
@Injectable()
export class SlackService {
  async sendAlert(message: string, severity: 'warning' | 'error' | 'critical') {
    const color = {
      warning: '#warning',
      error: '#danger',
      critical: '#danger',
    }[severity];

    await axios.post(process.env.SLACK_WEBHOOK, {
      attachments: [{
        color,
        text: message,
        footer: 'ERP Backend',
        ts: Date.now() / 1000,
      }],
    });
  }
}
```

---

## Dashboard URLs

| Dashboard | URL |
|-----------|-----|
| Grafana | https://grafana.derecho.es |
| Jaeger | https://jaeger.derecho.es |
| Prometheus | https://prometheus.derecho.es |
| AlertManager | https://alertmanager.derecho.es |

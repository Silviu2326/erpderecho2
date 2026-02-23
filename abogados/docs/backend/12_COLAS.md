# 12 - Sistema de Colas de Mensajes

## Visión General

Sistema de colas de mensajes para procesamiento asíncrono de tareas pesadas, integración de servicios externos y comunicación entre microservicios.

---

## Tecnologías

| Biblioteca | Uso |
|------------|-----|
| Bull | Cola de mensajes Redis-based |
| RabbitMQ | Message broker alternativo |
| BullMQ | Versión mejorada de Bull |

---

## Colas del Sistema

### Cola de Documentos

```typescript
// queues/document.queue.ts
interface DocumentJob {
  type: 'ocr' | 'compress' | 'sign' | 'convert';
  documentId: string;
  options: {
    language?: string;
    quality?: number;
    format?: string;
  };
  userId: string;
}
```

### Cola de Notificaciones

```typescript
// queues/notification.queue.ts
interface NotificationJob {
  type: 'email' | 'sms' | 'push' | 'webhook';
  recipient: string | string[];
  template: string;
  data: Record<string, any>;
  priority: 'high' | 'normal' | 'low';
}
```

### Cola de Integraciones

```typescript
// queues/integration.queue.ts
interface IntegrationJob {
  provider: 'boe' | 'cendoj' | 'microsoft' | 'google';
  action: 'sync' | 'fetch' | 'push';
  resource: string;
  params: Record<string, any>;
}
```

### Cola de Facturación

```typescript
// queues/billing.queue.ts
interface BillingJob {
  type: 'generate_invoice' | 'send_invoice' | 'process_payment';
  invoiceId: string;
  options: {
    generatePdf?: boolean;
    sendEmail?: boolean;
    notifyClient?: boolean;
  };
}
```

---

## Configuración

### Variables de Entorno

```env
# Redis
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=password
REDIS_DB=0

# Bull
BULL_REDIS_HOST=localhost
BULL_REDIS_PORT=6379
BULL_CONCURRENCY=5
BULL_MAX_ATTEMPTS=3
BULL_BACKOFF_STRATEGY=exponential
```

### Configuración de Cola

```typescript
// config/queue.config.ts
export const queues = {
  documents: {
    name: 'documents',
    defaultJobOptions: {
      attempts: 3,
      backoff: {
        type: 'exponential' as const,
        delay: 2000
      },
      removeOnComplete: true,
      removeOnFail: false
    },
    settings: {
      lockDuration: 30000,
      maxStalledCount: 2
    }
  },
  notifications: {
    name: 'notifications',
    defaultJobOptions: {
      attempts: 5,
      priority: 1,
      removeOnComplete: 100
    }
  }
};
```

---

## Productores

### Enviar a Cola

```typescript
// services/queue.service.ts
@Injectable()
export class QueueService {
  constructor(
    @InjectQueue('documents') private documentQueue: Queue,
    @InjectQueue('notifications') private notificationQueue: Queue
  ) {}

  async processDocument(data: DocumentJob) {
    return this.documentQueue.add('process', data, {
      priority: data.priority || 2,
      delay: data.scheduledAt ? 
        new Date(data.scheduledAt).getTime() - Date.now() : 0
    });
  }

  async sendNotification(data: NotificationJob) {
    return this.notificationQueue.add('send', data, {
      priority: data.priority === 'high' ? 1 : 2
    });
  }
}
```

---

## Consumidores

### Worker de Documentos

```typescript
// workers/document.worker.ts
@Processor('documents')
export class DocumentWorker {
  constructor(
    private ocrService: OcrService,
    private storageService: StorageService
  ) {}

  @Process('ocr')
  async handleOcr(job: Job<DocumentJob>) {
    const { documentId, options } = job.data;
    
    await job.progress(10);
    const document = await this.storageService.get(documentId);
    
    await job.progress(30);
    const text = await this.ocrService.extract(document, options);
    
    await job.progress(90);
    await this.storageService.update(documentId, { text });
    
    await job.progress(100);
    return { documentId, text };
  }

  @Process('compress')
  async handleCompress(job: Job<DocumentJob>) {
    const { documentId, options } = job.data;
    const compressed = await this.compressionService.compress(
      documentId,
      options.quality
    );
    return { documentId, compressed };
  }
}
```

### Worker de Notificaciones

```typescript
// workers/notification.worker.ts
@Processor('notifications')
export class NotificationWorker {
  constructor(
    private emailService: EmailService,
    private smsService: SmsService
  ) {}

  @Process('email')
  async handleEmail(job: Job<NotificationJob>) {
    const { recipient, template, data } = job.data;
    
    if (Array.isArray(recipient)) {
      return Promise.all(
        recipient.map(r => this.emailService.send(r, template, data))
      );
    }
    
    return this.emailService.send(recipient, template, data);
  }

  @Process('webhook')
  async handleWebhook(job: Job<NotificationJob>) {
    const { recipient, data } = job.data;
    return this.webhookService.send(recipient, data);
  }
}
```

---

## Patrones de Colas

### Retry con Backoff

```typescript
const jobOptions = {
  attempts: 3,
  backoff: {
    type: 'exponential',
    delay: 1000
  }
};
```

### Dead Letter Queue

```typescript
export const dlqQueue = Queue.extend('dlq');

processor.on('failed', async (job, err) => {
  if (job.attemptsMade >= job.opts.attempts) {
    await dlqQueue.add({
      originalQueue: job.queue.name,
      jobData: job.data,
      error: err.message,
      failedAt: new Date()
    });
  }
});
```

### Scheduled Jobs

```typescript
@Cron('0 9 * * 1-5')
async sendDailyDigest() {
  await this.notificationQueue.add('digest', {
    type: 'daily_summary'
  }, {
    delay: 0,
    repeat: {
      pattern: '0 9 * * 1-5'
    }
  });
}
```

---

## Monitorización

### UI de Bull

```typescript
// config/bull-board.config.ts
import { createBullBoard } from '@bull-board/express';
import { BullAdapter } from '@bull-board/api/bullAdapter';

const bullBoard = createBullBoard({
  queues: [
    new BullAdapter(documentQueue),
    new BullAdapter(notificationQueue)
  ],
  serverAdapter: new BullAdapter()
});
```

---

## Eventos

```typescript
documentQueue.on('completed', (job, result) => {
  console.log(`Job ${job.id} completed:`, result);
});

documentQueue.on('failed', (job, err) => {
  console.error(`Job ${job.id} failed:`, err.message);
});

documentQueue.on('progress', (job, progress) => {
  console.log(`Job ${job.id} progress: ${progress}%`);
});
```

---

## Buenas Prácticas

1. **Idempotencia** - Los jobs deben ser idempotentes
2. **Tiempo límite** - Máximo 5 minutos por job
3. **Logs** - Registrar inicio, progreso y fin
4. **Monitorización** - Usar Bull Board para debug
5. **DLQ** - Implementar dead letter queue para errores

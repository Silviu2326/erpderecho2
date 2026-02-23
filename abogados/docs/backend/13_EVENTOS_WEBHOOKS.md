# Eventos del Dominio y Webhooks

## Eventos del Sistema

### Tipos de Eventos

```typescript
// events/domain.events.ts

// Eventos de Expediente
export enum ExpedienteEvent {
  CREADO = 'expediente.creado',
  ACTUALIZADO = 'expediente.actualizado',
  CERRADO = 'expediente.cerrado',
  ARCHIVADO = 'expediente.archivado',
  ASIGNADO = 'expediente.asignado',
}

// Eventos de Cliente
export enum ClienteEvent {
  CREADO = 'cliente.creado',
  ACTUALIZADO = 'cliente.actualizado',
  ELIMINADO = 'cliente.eliminado',
}

// Eventos de Factura
export enum FacturaEvent {
  CREADA = 'factura.creada',
  ENVIADA = 'factura.enviada',
  PAGADA = 'factura.pagada',
  VENCIDA = 'factura.vencida',
  ANULADA = 'factura.anulada',
}

// Eventos de Documento
export enum DocumentoEvent {
  SUBIDO = 'documento.subido',
  DESCARGADO = 'documento.descargado',
  FIRMADO = 'documento.firmado',
  MODIFICADO = 'documento.modificado',
}

// Eventos de Usuario
export enum UsuarioEvent {
  LOGIN = 'usuario.login',
  LOGOUT = 'usuario.logout',
  PASSWORD_CAMBIADA = 'usuario.password.cambiada',
  ROL_CAMBIADO = 'usuario.rol.cambiado',
}

// Eventos de Prescripción
export enum PrescripcionEvent {
  CREADA = 'prescripcion.creada',
  AMPLIADA = 'prescripcion.ampliada',
  PRESCRITA = 'prescripcion.prescrita',
  ALERTA = 'prescripcion.alerta',
}
```

### Interfaz de Evento

```typescript
// events/event.interface.ts

export interface DomainEvent {
  eventId: string;
  eventType: string;
  occurredOn: Date;
  aggregateId: string;
  payload: Record<string, any>;
  metadata: EventMetadata;
}

export interface EventMetadata {
  userId?: string;
  userEmail?: string;
  correlationId?: string;
  causationId?: string;
  timestamp: Date;
  version: number;
}

export interface ExpedienteCreadoEvent extends DomainEvent {
  eventType: ExpedienteEvent.CREADO;
  payload: {
    numeroExpediente: string;
    tipo: string;
    clienteId: string;
    abogadoId: string;
    asunto: string;
  };
}
```

### Event Bus Implementation

```typescript
// events/event-bus.service.ts

@Injectable()
export class EventBus {
  private handlers: Map<string, EventHandler[]> = new Map();
  private eventStore: EventStore;

  async publish<T extends DomainEvent>(event: T): Promise<void> {
    // Persist event
    await this.eventStore.save(event);

    // Get handlers for this event type
    const handlers = this.handlers.get(event.eventType) || [];

    // Execute handlers
    await Promise.all(
      handlers.map(handler => handler.handle(event))
    );
  }

  subscribe<T extends DomainEvent>(
    eventType: string,
    handler: EventHandler<T>
  ): void {
    if (!this.handlers.has(eventType)) {
      this.handlers.set(eventType, []);
    }
    this.handlers.get(eventType)?.push(handler);
  }
}
```

### Event Store

```typescript
// events/event-store.service.ts

@Entity()
export class StoredEvent {
  @PrimaryColumn()
  id: string;

  @Column()
  eventType: string;

  @Column('jsonb')
  payload: Record<string, any>;

  @Column('jsonb')
  metadata: Record<string, any>;

  @Column()
  aggregateId: string;

  @Column()
  occurredOn: Date;

  @Column({ nullable: true })
  processedOn: Date;
}

@Injectable()
export class EventStore {
  async save(event: DomainEvent): Promise<StoredEvent> {
    const stored = new StoredEvent();
    stored.id = event.eventId;
    stored.eventType = event.eventType;
    stored.payload = event.payload;
    stored.metadata = event.metadata;
    stored.aggregateId = event.aggregateId;
    stored.occurredOn = event.occurredOn;
    
    return this.repository.save(stored);
  }

  async getEventsForAggregate(
    aggregateId: string
  ): Promise<DomainEvent[]> {
    const stored = await this.repository.find({
      where: { aggregateId },
      order: { occurredOn: 'ASC' }
    });
    
    return stored.map(this.mapToEvent);
  }
}
```

### Ejemplo de Handler

```typescript
// events/handlers/expediente.handler.ts

@Injectable()
export class ExpedienteEventHandler {
  constructor(
    private notificationService: NotificationService,
    private emailService: EmailService,
  ) {}

  @EventHandler(ExpedienteEvent.CREADO)
  async handleExpedienteCreado(event: ExpedienteCreadoEvent): Promise<void> {
    // Notificar al abogado asignado
    await this.notificationService.send({
      userId: event.payload.abogadoId,
      title: 'Nuevo Expediente',
      body: `Se le ha asignado el expediente ${event.payload.numeroExpediente}`,
    });

    // Notificar al cliente
    await this.emailService.send({
      to: event.payload.clienteEmail,
      subject: 'Expediente creado',
      template: 'expediente-creado',
    });
  }

  @EventHandler(ExpedienteEvent.PRESCRITA)
  async handlePrescripcion(event: DomainEvent): Promise<void> {
    await this.notificationService.send({
      title: '⚠️ Alerta de prescripción',
      body: 'Un expediente está próximo a prescribir',
      priority: 'high',
    });
  }
}
```

---

## Webhooks

### Configuración

```typescript
// webhooks/webhook.interface.ts

export interface Webhook {
  id: string;
  url: string;
  events: string[];
  secret: string;
  active: boolean;
  retryPolicy: RetryPolicy;
  createdAt: Date;
}

export interface RetryPolicy {
  maxRetries: number;
  retryInterval: number; // seconds
  backoffMultiplier: number;
}

export interface WebhookPayload {
  event: string;
  timestamp: number;
  data: Record<string, any>;
  signature: string;
}
```

### Webhook Service

```typescript
// webhooks/webhook.service.ts

@Injectable()
export class WebhookService {
  private webhooks: Webhook[] = [];
  private queue: Bull.Queue;

  async registerWebhook(config: WebhookConfig): Promise<Webhook> {
    const webhook: Webhook = {
      id: uuid(),
      ...config,
      secret: crypto.randomBytes(32).toString('hex'),
      active: true,
      retryPolicy: { maxRetries: 3, retryInterval: 60, backoffMultiplier: 2 },
    };
    
    this.webhooks.push(webhook);
    await this.webhookRepo.save(webhook);
    
    return webhook;
  }

  async trigger(event: string, data: any): Promise<void> {
    const webhooks = this.webhooks.filter(
      w => w.active && w.events.includes(event)
    );

    const payload: WebhookPayload = {
      event,
      timestamp: Date.now(),
      data,
      signature: this.sign(data),
    };

    for (const webhook of webhooks) {
      await this.queue.add('webhook-delivery', {
        webhookId: webhook.id,
        payload,
        url: webhook.url,
      });
    }
  }

  private sign(data: any): string {
    return crypto
      .createHmac('sha256', process.env.WEBHOOK_SECRET)
      .update(JSON.stringify(data))
      .digest('hex');
  }
}
```

### Eventos Disponibles para Webhooks

```typescript
export const WEBHOOK_EVENTS = {
  // Expedientes
  'expediente.creado': 'Expediente creado',
  'expediente.actualizado': 'Expediente actualizado',
  'expediente.cerrado': 'Expediente cerrado',
  
  // Clientes
  'cliente.creado': 'Cliente creado',
  'cliente.actualizado': 'Cliente actualizado',
  
  // Facturas
  'factura.creada': 'Factura creada',
  'factura.pagada': 'Factura pagada',
  'factura.vencida': 'Factura vencida',
  
  // Documentos
  'documento.subido': 'Documento subido',
  'documento.firmado': 'Documento firmado',
  
  // Usuarios
  'usuario.login': 'Usuario inició sesión',
  'usuario.logout': 'Usuario cerró sesión',
  
  // Prescripciones
  'prescripcion.alerta': 'Alerta de prescripción',
};
```

### Ejemplo de Payload

```json
{
  "event": "expediente.creado",
  "timestamp": 1706000000000,
  "data": {
    "id": "exp-uuid-123",
    "numero": "2026-0001",
    "tipo": "civil",
    "cliente": {
      "id": "cli-uuid-456",
      "nombre": "Juan García"
    },
    "abogado": {
      "id": "usr-uuid-789",
      "nombre": "María López"
    }
  },
  "signature": "sha256=abc123..."
}
```

---

## Cola de Procesamiento

```typescript
// webhooks/webhook.processor.ts

@Processor('webhooks')
export class WebhookProcessor {
  @Process('webhook-delivery')
  async handleDelivery(job: Job<WebhookDelivery>): Promise<void> {
    const { webhookId, payload, url } = job.data;
    const webhook = await this.getWebhook(webhookId);

    try {
      const response = await axios.post(url, payload, {
        headers: {
          'Content-Type': 'application/json',
          'X-Webhook-Signature': this.sign(payload, webhook.secret),
        },
        timeout: 30000,
      });

      await this.logSuccess(webhookId, response.status);
    } catch (error) {
      if (job.attemptsMade < webhook.retryPolicy.maxRetries) {
        throw error; // Will retry
      }
      
      await this.logFailure(webhookId, error.message);
    }
  }
}
```

# 10 - WebSockets

## Visión General

Sistema de comunicación en tiempo real utilizando WebSockets para notificaciones instantáneas, actualizaciones en vivo y colaboración en tiempo real.

---

## Tecnologías

| Biblioteca | Uso |
|------------|-----|
| Socket.io | WebSockets con fallback |
| @nestjs/platform-socket.io | Gateway en NestJS |
| Redis Adapter | Escala horizontal |

---

## Gateway Principal

```typescript
// gateways/main.gateway.ts
@WebSocketGateway({
  cors: {
    origin: process.env.ALLOWED_ORIGINS?.split(','),
    credentials: true
  },
  namespace: '/api'
})
export class MainGateway implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  afterInit() {
    console.log('WebSocket Gateway initialized');
  }

  handleConnection(client: Socket) {
    const token = client.handshake.auth.token;
    if (!token) {
      client.disconnect();
      return;
    }
    
    const user = this.validateToken(token);
    if (!user) {
      client.disconnect();
      return;
    }
    
    client.data.user = user;
    console.log(`Client connected: ${client.id}`);
  }

  handleDisconnect(client: Socket) {
    console.log(`Client disconnected: ${client.id}`);
  }
}
```

---

## Eventos del Servidor

### Notificaciones

```typescript
// Eventos emitidos por el servidor
enum ServerEvent {
  NOTIFICATION = 'notification',
  EXPEDIENTE_UPDATE = 'expediente:update',
  EXPEDIENTE_NEW = 'expediente:new',
  FACTURA_STATUS = 'factura:status',
  CALENDARIO_UPDATE = 'calendario:update',
  PRESCRIPCION_ALERT = 'prescripcion:alert',
  MENSAJE_NEW = 'mensaje:new',
  OFICIO_ASSIGNED = 'oficio:assigned',
  SYSTEM_ALERT = 'system:alert'
}
```

### Estructura de Eventos

```typescript
interface WSResponse<T> {
  event: string;
  data: T;
  timestamp: string;
}

interface NotificationEvent {
  id: string;
  type: 'info' | 'warning' | 'error' | 'success';
  title: string;
  message: string;
  userId: string;
  link?: string;
  metadata?: Record<string, any>;
}
```

---

## Rooms y Canales

### Rooms por Usuario

```typescript
// Unir al room del usuario
@SubscribeMessage('join:user')
handleJoinUser(client: Socket, userId: string) {
  client.join(`user:${userId}`);
  return { event: 'joined', room: `user:${userId}` };
}

// Salir del room
@SubscribeMessage('leave:user')
handleLeaveUser(client: Socket, userId: string) {
  client.leave(`user:${userId}`);
}
```

### Rooms por Expediente

```typescript
// Unir a un expediente
@SubscribeMessage('join:expediente')
handleJoinExpediente(client: Socket, expedienteId: string) {
  // Verificar permisos
  const user = client.data.user;
  if (!this.canAccessExpediente(user, expedienteId)) {
    throw new WsException('No autorizado');
  }
  
  client.join(`expediente:${expedienteId}`);
}

// Notificar a todos los del expediente
async notifyExpedienteUpdate(expedienteId: string, data: any) {
  this.server.to(`expediente:${expedienteId}`).emit(
    ServerEvent.EXPEDIENTE_UPDATE,
    {
      event: ServerEvent.EXPEDIENTE_UPDATE,
      data,
      timestamp: new Date().toISOString()
    }
  );
}
```

### Rooms Globales

```typescript
// Room de administración
@SubscribeMessage('join:admin')
handleJoinAdmin(client: Socket) {
  if (client.data.user.rol !== 'admin') {
    throw new WsException('Solo administradores');
  }
  client.join('admin');
}

// Room de oficina
@SubscribeMessage('join:oficio')
handleJoinOficio(client: Socket) {
  client.join('oficio');
}
```

---

## Eventos del Cliente

```typescript
// Suscribirse a notificaciones
client.emit('subscribe:notifications', { userId: 'xxx' });

// Marcar notificación como leída
client.emit('notification:read', { notificationId: 'xxx' });

// Unirse a expediente
client.emit('expediente:join', { expedienteId: 'xxx' });

// Typing indicator
client.emit('mensaje:typing', { 
  expedienteId: 'xxx',
  userId: 'xxx',
  isTyping: true 
});
```

---

## Autenticación WebSocket

### Con JWT

```typescript
// main.gateway.ts
validateToken(token: string) {
  try {
    return this.jwtService.verify(token);
  } catch {
    return null;
  }
}

// Handshake check
@WebSocketGateway({
  namespace: '/api'
})
export class MainGateway implements WebSocketAdapter {
  createIOServer(port: number, options: any): any {
    options.namespace = '/api';
    return super.createIOServer(port, options);
  }
}
```

### Con Cookies

```typescript
//获取用户信息
client.handshake.headers.cookie;
```

---

## Ejemplo de Uso en Frontend

```typescript
// socket.service.ts
@Injectable()
export class SocketService {
  private socket: io.Socket;

  connect() {
    this.socket = io('/api', {
      auth: { token: this.getToken() }
    });
    
    this.socket.on('connect', () => {
      console.log('Connected to WebSocket');
    });
    
    this.socket.on('notification', (data) => {
      this.notificationService.show(data);
    });
  }

  joinExpediente(expedienteId: string) {
    this.socket.emit('expediente:join', { expedienteId });
  }

  onExpedienteUpdate() {
    return new Observable(observer => {
      this.socket.on('expediente:update', (data) => {
        observer.next(data);
      });
    });
  }
}
```

---

## Escalabilidad con Redis

```typescript
// adapters/redis.adapter.ts
import { IoAdapter } from '@nestjs/platform-socket.io';
import { createAdapter } from '@socket.io/redis-adapter';
import { createClient } from 'redis';

export class RedisIoAdapter extends IoAdapter {
  createIOServer(port: number, options?: any): any {
    const server = super.createIOServer(port, options) as io.Server;
    
    const pubClient = createClient({ url: process.env.REDIS_URL });
    const subClient = pubClient.duplicate();
    
    const adapter = createAdapter(pubClient, subClient);
    server.adapter(adapter);
    
    return server;
  }
}

// main.ts
app.useWebSocketAdapter(new RedisIoAdapter(app));
```

---

## Manejo de Errores

```typescript
// Middleware de errores
@WebSocketGateway()
export class ErrorGateway {
  @SubscribeMessage('error')
  handleError(client: Socket, error: any) {
    console.error('WebSocket error:', error);
    
    client.emit('error', {
      code: error.code || 'WS_ERROR',
      message: error.message || 'Error de conexión'
    });
  }
}
```

---

## Eventos de Prescripciones en Tiempo Real

```typescript
// Notificar proximidad de prescripción
async notifyPrescripcionProxima(prescripcion: Prescripcion) {
  const diasRestantes = calcularDiasRestantes(prescripcion);
  
  if (diasRestantes <= 7) {
    const recipients = await this.getAbogadosExpediente(prescripcion.expedienteId);
    
    for (const userId of recipients) {
      this.server.to(`user:${userId}`).emit('prescripcion:alert', {
        id: prescripcion.id,
        expedienteId: prescripcion.expedienteId,
        tipo: prescripcion.tipo,
        diasRestantes,
        nivel: diasRestantes <= 1 ? 'critical' : 'warning'
      });
    }
  }
}
```

---

## Métricas

```typescript
// Métricas de conexión
const metrics = {
  conexionesActivas: 0,
  mensajesEnviados: 0,
  mensajesRecibidos: 0,
  
  onConnect() {
    this.conexionesActivas++;
  },
  
  onDisconnect() {
    this.conexionesActivas--;
  },
  
  onMessage() {
    this.mensajesRecibidos++;
  }
};
```

---

## Best Practices

1. **Validar tokens** en handshake
2. **Limitar reconexiones** del cliente
3. **Usar rooms** para optimizar difusión
4. **Heartbeat** para detectar conexiones muertas
5. **Limitar tamaño** de mensajes
6. **Loggear** eventos importantes

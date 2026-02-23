# 07 - Manejo de Errores

## Visión General

Sistema centralizado de manejo de errores con códigos de error consistentes, logs estructurados y respuestas uniformes.

---

## Estructura de Respuesta de Error

```typescript
// Formato estándar de error
interface ApiError {
  success: false;
  error: {
    code: string;           // Código único del error
    message: string;       // Mensaje para el usuario
    details?: any;         // Detalles adicionales
    timestamp: string;     // ISO timestamp
    requestId: string;     // ID de la petición
  };
}
```

### Ejemplo
```json
{
  "success": false,
  "error": {
    "code": "EXPEDIENTE_NOT_FOUND",
    "message": "El expediente solicitado no existe",
    "details": {
      "expedienteId": "uuid-invalido"
    },
    "timestamp": "2026-02-22T10:30:00.000Z",
    "requestId": "req-abc123"
  }
}
```

---

## Códigos de Error

### Errores de Autenticación (AUTH_*)
| Código | HTTP | Descripción |
|--------|------|-------------|
| AUTH_INVALID_CREDENTIALS | 401 | Credenciales incorrectas |
| AUTH_TOKEN_EXPIRED | 401 | Token expirado |
| AUTH_TOKEN_INVALID | 401 | Token inválido |
| AUTH_REFRESH_FAILED | 401 | Error al refresh token |
| AUTH_2FA_REQUIRED | 401 | 2FA requerido |
| AUTH_2FA_INVALID | 401 | Código 2FA inválido |
| AUTH_ACCOUNT_LOCKED | 403 | Cuenta bloqueada |
| AUTH_ACCOUNT_DISABLED | 403 | Cuenta desactivada |
| AUTH_PASSWORD_WEAK | 400 | Contraseña débil |
| AUTH_PASSWORD_MISMATCH | 400 | Contraseñas no coinciden |

### Errores de Validación (VALIDATION_)
| Código | HTTP | Descripción |
|--------|------|-------------|
| VALIDATION_ERROR | 400 | Error de validación |
| VALIDATION_REQUIRED | 400 | Campo obligatorio |
| VALIDATION_INVALID_FORMAT | 400 | Formato inválido |
| VALIDATION_OUT_OF_RANGE | 400 | Valor fuera de rango |

### Errores de Recursos (RESOURCE_*)
| Código | HTTP | Descripción |
|--------|------|-------------|
| RESOURCE_NOT_FOUND | 404 | Recurso no encontrado |
| RESOURCE_ALREADY_EXISTS | 409 | Recurso ya existe |
| RESOURCE_DELETED | 410 | Recurso eliminado |
| RESOURCE_SUSPENDED | 403 | Recurso suspendido |

### Errores de Expedientes (EXPEDIENTE_*)
| Código | HTTP | Descripción |
|--------|------|-------------|
| EXPEDIENTE_NOT_FOUND | 404 | Expediente no encontrado |
| EXPEDIENTE_CLOSED | 400 | Expediente cerrado |
| EXPEDIENTE_ARCHIVED | 400 | Expediente archivado |
| EXPEDIENTE_FORBIDDEN | 403 | Sin acceso al expediente |

### Errores de Clientes (CLIENTE_*)
| Código | HTTP | Descripción |
|--------|------|-------------|
| CLIENTE_NOT_FOUND | 404 | Cliente no encontrado |
| CLIENTE_NIF_DUPLICADO | 409 | NIF ya registrado |
| CLIENTE_INACTIVE | 400 | Cliente inactivo |

### Errores de Facturación (FACTURA_*)
| Código | HTTP | Descripción |
|--------|------|-------------|
| FACTURA_NOT_FOUND | 404 | Factura no encontrada |
| FACTURA_ANULADA | 400 | Factura anulada |
| FACTURA_PAGADA | 400 | Factura ya pagada |
| FACTURA_VENCIDA | 400 | Factura vencida |

### Errores de Sistema (SYSTEM_*)
| Código | HTTP | Descripción |
|--------|------|-------------|
| SYSTEM_ERROR | 500 | Error interno |
| SYSTEM_MAINTENANCE | 503 | Mantenimiento |
| SYSTEM_RATE_LIMIT | 429 | Límite excedido |
| SYSTEM_UNAVAILABLE | 503 | Servicio no disponible |

---

## Exception Filters

### NestJS Global Exception Filter

```typescript
// filters/http-exception.filter.ts
@Catch()
export class GlobalExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(GlobalExceptionFilter.name);

  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse();
    const request = ctx.getRequest();
    const requestId = request.headers['x-request-id'] || uuid();

    let status = HttpStatus.INTERNAL_SERVER_ERROR;
    let code = 'SYSTEM_ERROR';
    let message = 'Error interno del servidor';
    let details: any = undefined;

    if (exception instanceof HttpException) {
      status = exception.getStatus();
      const res = exception.getResponse();
      
      if (typeof res === 'object') {
        const { code: c, message: m, details: d } = res as any;
        code = c || 'HTTP_ERROR';
        message = m || exception.message;
        details = d;
      } else {
        message = res as string;
      }
    } else if (exception instanceof PrismaClientKnownRequestError) {
      status = this.mapPrismaError(exception);
      code = 'DATABASE_ERROR';
      message = 'Error de base de datos';
    }

    const errorResponse = {
      success: false,
      error: {
        code,
        message,
        details,
        timestamp: new Date().toISOString(),
        requestId
      }
    };

    this.logger.error({
      message,
      code,
      status,
      path: request.url,
      method: request.method,
      requestId,
      stack: exception instanceof Error ? exception.stack : undefined
    });

    response.status(status).json(errorResponse);
  }

  private mapPrismaError(error: PrismaClientKnownRequestError): number {
    switch (error.code) {
      case 'P2002': return HttpStatus.CONFLICT;
      case 'P2025': return HttpStatus.NOT_FOUND;
      default: return HttpStatus.INTERNAL_SERVER_ERROR;
    }
  }
}
```

---

## Custom Exceptions

### NotFoundException

```typescript
// exceptions/not-found.exception.ts
export class ExpedienteNotFoundException extends HttpException {
  constructor(expedienteId: string) {
    super({
      code: 'EXPEDIENTE_NOT_FOUND',
      message: 'El expediente solicitado no existe',
      details: { expedienteId }
    }, HttpStatus.NOT_FOUND);
  }
}
```

### ForbiddenException

```typescript
// exceptions/forbidden.exception.ts
export class ExpedienteForbiddenException extends HttpException {
  constructor(expedienteId: string, reason: string) {
    super({
      code: 'EXPEDIENTE_FORBIDDEN',
      message: 'No tienes acceso a este expediente',
      details: { expedienteId, reason }
    }, HttpStatus.FORBIDDEN);
  }
}
```

---

## Manejo de Errores de Base de Datos

```typescript
// interceptors/database-error.interceptor.ts
@Injectable()
export class DatabaseErrorInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    return next.handle().pipe(
      catchError(error => {
        if (error instanceof PrismaClientKnownRequestError) {
          switch (error.code) {
            case 'P2000':
              throw new BadRequestException({
                code: 'VALIDATION_VALUE_TOO_LONG',
                message: 'Valor demasiado largo para la columna'
              });
            case 'P2002':
              throw new ConflictException({
                code: 'RESOURCE_ALREADY_EXISTS',
                message: 'El recurso ya existe'
              });
            case 'P2025':
              throw new NotFoundException({
                code: 'RESOURCE_NOT_FOUND',
                message: 'El recurso no existe'
              });
          }
        }
        throw error;
      })
    );
  }
}
```

---

## Rate Limiting Errors

```typescript
// errors/rate-limit.error.ts
{
  "success": false,
  "error": {
    "code": "SYSTEM_RATE_LIMIT",
    "message": "Demasiadas peticiones. Intenta de nuevo en X segundos",
    "details": {
      "limit": 100,
      "remaining": 0,
      "reset": 1706000000
    },
    "timestamp": "2026-02-22T10:30:00.000Z",
    "requestId": "req-abc123"
  }
}
```

---

## Logging de Errores

### Estructura de Log

```typescript
// logger/error.logger.ts
interface ErrorLog {
  level: 'error' | 'warn' | 'info';
  timestamp: string;
  requestId: string;
  userId?: string;
  code: string;
  message: string;
  stack?: string;
  context: {
    path: string;
    method: string;
    params: any;
    query: any;
    body: any;
    ip: string;
    userAgent: string;
  };
  performance?: {
    duration: number;
  };
}

// Ejemplo de log
{
  "level": "error",
  "timestamp": "2026-02-22T10:30:00.000Z",
  "requestId": "req-abc123",
  "userId": "user-uuid",
  "code": "EXPEDIENTE_NOT_FOUND",
  "message": "El expediente solicitado no existe",
  "context": {
    "path": "/api/v1/expedientes/123",
    "method": "GET",
    "ip": "192.168.1.1"
  },
  "performance": {
    "duration": 45
  }
}
```

---

## Errores en Desarrollo vs Producción

```typescript
// main.ts
const isDevelopment = process.env.NODE_ENV === 'development';

app.useGlobalFilters(new GlobalExceptionFilter(isDevelopment));
```

### Diferencias
| Ambiente | Detalles del error | Stack trace |
|----------|-------------------|--------------|
| Development | Completos | Sí |
| Production | Resumidos | No |

---

## Webhooks de Errores

Para errores críticos, notificar a sistemas externos:

```typescript
// services/webhook.service.ts
async notifyError(error: ApiError) {
  await this.http.post(process.env.WEBHOOK_ERROR_URL, {
    event: 'error.occurred',
    data: error
  });
}
```

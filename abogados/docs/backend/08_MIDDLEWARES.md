# 08 - Middlewares

## Visión General

Middlewares personalizados para el backend del ERP de Derecho.

---

## Middlewares Existentes

### 1. Request Logger

```typescript
// middlewares/request-logger.middleware.ts
@Injectable()
export class RequestLoggerMiddleware implements NestMiddleware {
  private readonly logger = new Logger('HTTP');

  use(req: Request, res: Response, next: NextFunction) {
    const { method, originalUrl, ip } = req;
    const userAgent = req.get('user-agent') || '';
    const startTime = Date.now();

    res.on('finish', () => {
      const { statusCode } = res;
      const duration = Date.now() - startTime;

      this.logger.log(
        `${method} ${originalUrl} ${statusCode} ${duration}ms - ${ip} - ${userAgent}`
      );
    });

    next();
  }
}
```

### 2. Correlation ID

```typescript
// middlewares/correlation-id.middleware.ts
@Injectable()
export class CorrelationIdMiddleware implements NestMiddleware {
  use(req: Request, res: Response, next: NextFunction) {
    const existingHeader = req.headers['x-correlation-id'];
    const correlationId = existingHeader || uuid();

    req.headers['x-correlation-id'] = correlationId;
    res.setHeader('x-correlation-id', correlationId);

    next();
  }
}
```

### 3. Rate Limiter

```typescript
// middlewares/rate-limit.middleware.ts
@Injectable()
export class RateLimitMiddleware implements NestMiddleware {
  private cache: Map<string, { count: number; resetTime: number }> = new Map();

  use(req: Request, res: Response, next: NextFunction) {
    const ip = req.ip;
    const key = `rate-limit:${ip}`;
    const now = Date.now();
    const windowMs = 60000; // 1 minuto
    const maxRequests = 100;

    let record = this.cache.get(key);

    if (!record || now > record.resetTime) {
      record = { count: 0, resetTime: now + windowMs };
      this.cache.set(key, record);
    }

    record.count++;

    res.setHeader('X-RateLimit-Limit', maxRequests);
    res.setHeader('X-RateLimit-Remaining', Math.max(0, maxRequests - record.count));
    res.setHeader('X-RateLimit-Reset', Math.ceil(record.resetTime / 1000));

    if (record.count > maxRequests) {
      throw new HttpException(
        {
          success: false,
          error: {
            code: 'SYSTEM_RATE_LIMIT',
            message: 'Demasiadas peticiones',
            details: { retryAfter: Math.ceil((record.resetTime - now) / 1000) }
          }
        },
        HttpStatus.TOO_MANY_REQUESTS
      );
    }

    next();
  }
}
```

### 4. Authentication

```typescript
// middlewares/auth.middleware.ts
@Injectable()
export class AuthMiddleware implements NestMiddleware {
  constructor(private jwtService: JwtService) {}

  async use(req: Request, res: Response, next: NextFunction) {
    const authHeader = req.headers['authorization'];

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new UnauthorizedException({
        code: 'AUTH_TOKEN_MISSING',
        message: 'Token de acceso requerido'
      });
    }

    const token = authHeader.substring(7);

    try {
      const payload = await this.jwtService.verifyAsync(token, {
        secret: process.env.JWT_SECRET
      });
      
      req['user'] = payload;
      next();
    } catch (error) {
      throw new UnauthorizedException({
        code: 'AUTH_TOKEN_INVALID',
        message: 'Token de acceso inválido o expirado'
      });
    }
  }
}
```

### 5. Role Guard

```typescript
// guards/roles.guard.ts
@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.getAllAndOverride<Role[]>('roles', [
      context.getHandler(),
      context.getClass(),
    ]);

    if (!requiredRoles) {
      return true;
    }

    const { user } = context.switchToHttp().getRequest();
    
    return requiredRoles.some((role) => user.roles?.includes(role));
  }
}

// Uso en controlador
@Controller('expedientes')
export class ExpedienteController {
  @Get()
  @UseGuards(AuthGuard, RolesGuard)
  @SetMetadata('roles', [Role.ABOGADO, Role.ADMIN])
  findAll() {}
}
```

### 6. Audit Log

```typescript
// middlewares/audit.middleware.ts
@Injectable()
export class AuditMiddleware implements NestMiddleware {
  constructor(private auditService: AuditService) {}

  async use(req: Request, res: Response, next: NextFunction) {
    const startTime = Date.now();
    const originalSend = res.send;

    res.send = function(body: any) {
      originalSend.call(res, body);
      
      const duration = Date.now() - startTime;
      
      // Solo auditar mutaciones
      if (['POST', 'PUT', 'PATCH', 'DELETE'].includes(req.method)) {
        const userId = req['user']?.sub;
        
        this.auditService.log({
          userId,
          action: `${req.method} ${req.originalUrl}`,
          resource: req.path,
          method: req.method,
          statusCode: res.statusCode,
          duration,
          requestId: req.headers['x-correlation-id'],
          ip: req.ip
        });
      }

      return body;
    }.bind(this);

    next();
  }
}
```

---

## Registro de Middlewares

```typescript
// app.module.ts
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(
        CorrelationIdMiddleware,
        RequestLoggerMiddleware,
        RateLimitMiddleware,
        AuditMiddleware
      )
      .exclude('/health', '/metrics')
      .forRoutes('*');
  }
}
```

---

## Middlewares por Ruta

```typescript
// app.module.ts
consumer
  .apply(AuthMiddleware)
  .exclude(
    '/auth/login',
    '/auth/register',
    '/health'
  )
  .forRoutes({ path: '*', method: RequestMethod.ALL });
```

---

## Configuración de Headers

```typescript
// middlewares/security-headers.middleware.ts
@Injectable()
export class SecurityHeadersMiddleware implements NestMiddleware {
  use(req: Request, res: Response, next: NextFunction) {
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('X-Frame-Options', 'DENY');
    res.setHeader('X-XSS-Protection', '1; mode=block');
    res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
    res.setHeader('Permissions-Policy', 'camera=(), microphone=(), geolocation=()');
    next();
  }
}
```

---

## CORS

```typescript
// main.ts
app.enableCors({
  origin: process.env.ALLOWED_ORIGINS?.split(',') || ['http://localhost:5173'],
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Request-ID'],
  exposedHeaders: ['X-Total-Count', 'X-Page-Count'],
  credentials: true,
  maxAge: 86400
});
```

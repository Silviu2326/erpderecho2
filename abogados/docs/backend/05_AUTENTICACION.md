# 05 - Sistema de Autenticación

## Visión General

Sistema de autenticación basado en JWT con soporte para refresh tokens, OAuth 2.0 y autenticación de dos factores (2FA).

---

## Flujo de Autenticación

```
┌──────────┐     ┌──────────┐     ┌──────────┐
│  Client  │────►│   API    │────►│   DB     │
└──────────┘     └──────────┘     └──────────┘
     │                 │                 │
     │  1. Login      │                 │
     │───────────────►│                 │
     │                 │  2. Validate  │
     │                 │───────────────►│
     │                 │◄───────────────│
     │◄───────────────│                 │
     │  3. JWT        │                 │
     │                 │                 │
     │  4. Request    │                 │
     │───────────────►│                 │
     │                 │  5. Verify     │
     │                 │────► Cache     │
     │◄───────────────│                 │
     │  6. Response   │                 │
```

---

## Tipos de Autenticación

### 1. JWT + Refresh Token

#### Login
```typescript
// POST /api/v1/auth/login
{
  "email": "abogado@bufete.es",
  "password": "password123"
}

// Response
{
  "success": true,
  "data": {
    "user": {
      "id": "uuid",
      "email": "abogado@bufete.es",
      "nombre": "Juan Pérez",
      "rol": "abogado",
      "avatar": "url",
      "twoFactorEnabled": false
    },
    "accessToken": "eyJhbGc...",
    "refreshToken": "eyJhbGc...",
    "expiresIn": 900
  }
}
```

#### Refresh Token
```typescript
// POST /api/v1/auth/refresh
{
  "refreshToken": "eyJhbGc..."
}

// Response - Nuevos tokens
{
  "success": true,
  "data": {
    "accessToken": "eyJhbGc...",
    "refreshToken": "eyJhbGc...",
    "expiresIn": 900
  }
}
```

### 2. Autenticación de Dos Factores (2FA)

#### Habilitar 2FA
```typescript
// POST /api/v1/auth/2fa/enable
// Response - QR code para Google Authenticator
{
  "success": true,
  "data": {
    "secret": "JBSWY3DPEHPK3PXP",
    "qrCode": "data:image/png;base64,...",
    "backupCodes": ["ABC123", "DEF456", ...]
  }
}
```

#### Verificar 2FA
```typescript
// POST /api/v1/auth/2fa/verify
{
  "code": "123456"
}

// Response
{
  "success": true,
  "data": {
    "accessToken": "eyJhbGc...",
    "refreshToken": "eyJhbGc..."
  }
}
```

### 3. OAuth 2.0

#### Proveedores Soportados
- Microsoft Azure AD
- Google Workspace

#### Flujo OAuth
```
1. Client ──► /api/v1/auth/oauth/microsoft
2. Redirect ──► Microsoft Login
3. Callback ──► /api/v1/auth/oauth/callback?code=xxx
4. API ──► Exchange code por tokens
5. API ──► Create/Update user
6. Response ──► JWT tokens
```

---

## Estructura del Token JWT

### Access Token
```typescript
{
  "sub": "user-uuid",
  "email": "abogado@bufete.es",
  "rol": "abogado",
  "permisos": ["expedientes:read", "facturas:write"],
  "iat": 1706000000,
  "exp": 1706000900,
  "type": "access"
}
```

### Refresh Token
```typescript
{
  "sub": "user-uuid",
  "type": "refresh",
  "tokenId": "uuid-token",
  "iat": 1706000000,
  "exp": 1706600000  // 7 días
}
```

---

## Configuración

### Variables de Entorno
```env
# JWT
JWT_SECRET=super-secret-key-min-32-chars
JWT_EXPIRES_IN=15m
JWT_REFRESH_SECRET=refresh-secret-key-min-32
JWT_REFRESH_EXPIRES_IN=7d

# OAuth
MICROSOFT_CLIENT_ID=xxx
MICROSOFT_CLIENT_SECRET=xxx
MICROSOFT_TENANT_ID=xxx
GOOGLE_CLIENT_ID=xxx
GOOGLE_CLIENT_SECRET=xxx

# 2FA
TWO_FACTOR_APP_NAME=ERP Derecho
```

---

## Seguridad

### Medidas Implementadas

| Medida | Descripción |
|--------|-------------|
| **Password Hashing** | bcrypt con salt rounds 12 |
| **Rate Limiting** | 5 intentos/minuto |
| **Bloqueo de cuenta** | 10 intentos fallidos = 30 min bloqueo |
| **Tokens cortos** | Access: 15 min, Refresh: 7 días |
| **HTTP Only Cookies** | Refresh token en cookie segura |
| **IP Validation** | Refresh token ligado a IP |
| **Device Fingerprint** | Validación de dispositivo |

### Control de Sesiones

```typescript
// Tabla: sesiones_usuario
interface SesionUsuario {
  id: string;
  usuario_id: string;
  token_id: string;
  dispositivo: string;
  ip: string;
  user_agent: string;
  created_at: Date;
  expires_at: Date;
  ultimo_acceso: Date;
}
```

---

## Permisos y Roles

### Roles del Sistema
```typescript
enum RolUsuario {
  ADMIN = 'admin',
  ABOGADO = 'abogado',
  LETRADO = 'letrado',
  SECRETARIO = 'secretario',
  BECARIO = 'becario',
  CLIENTE = 'cliente'
}
```

### Matriz de Permisos
| Recurso | Admin | Abogado | Letrado | Secretario | Becario |
|---------|-------|---------|---------|------------|---------|
| Usuarios | CRUD | Read | - | - | - |
| Expedientes | CRUD | CRUD | Read | CRUD | Read |
| Clientes | CRUD | CRUD | Read | CRUD | - |
| Facturas | CRUD | CRUD | Read | CRUD | - |
| Documentos | CRUD | CRUD | CRUD | CRUD | Read |
| Configuración | CRUD | - | - | - | - |

---

## Logout

```typescript
// POST /api/v1/auth/logout
{
  "refreshToken": "eyJhbGc..." // Opcional - para revoke inmediato
}

// Response
{
  "success": true,
  "data": {
    "message": "Sesión cerrada correctamente"
  }
}
```

### Revoke de Tokens
- Refresh tokens se almacenan en Redis
- Logout invalida el token en Redis
- Tiempo de vida del access token se respeta

---

## Recovery de Contraseña

### 1. Solicitar Reset
```typescript
// POST /api/v1/auth/password/reset
{
  "email": "abogado@bufete.es"
}

// Token válido 1 hora
```

### 2. Confirmar Reset
```typescript
// POST /api/v1/auth/password/reset/confirm
{
  "token": "reset-token-uuid",
  "newPassword": "newPassword123"
}
```

---

## Webhooks de Auth

Eventos emitidos:
- `user.login` - Usuario inicia sesión
- `user.logout` - Usuario cierra sesión
- `user.password_changed` - Contraseña cambiada
- `user.2fa_enabled` - 2FA habilitado
- `user.2fa_disabled` - 2FA deshabilitado
- `user.locked` - Cuenta bloqueada

# Sistema de Roles y Permisos - ERP Derecho

## Resumen del Sistema de Autenticación con Roles

El sistema implementa un **control de acceso basado en roles (RBAC)** completo con 9 roles diferentes y permisos granulares.

---

## 👥 Roles del Sistema

| Rol | Código | Descripción | Nivel de Acceso |
|-----|--------|-------------|-----------------|
| **Super Admin** | `admin` | Administrador total del sistema | Total |
| **Socio** | `socio` | Socio/Director del bufete | Casi total |
| **Abogado** | `abogado` | Abogado con experiencia | Alto |
| **Letrado** | `letrado` | Abogado junior | Medio-Alto |
| **Secretario** | `secretary` | Asistente legal | Medio |
| **Becario** | `becario` | Becario/Prácticas | Bajo |
| **Colaborador** | `colaborador` | Colaborador externo | Bajo |
| **Contador** | `contador` | Contable/Finanzas | Medio |
| **Recepcionista** | `recepcionista` | Recepción | Básico |

---

## 🔐 Middlewares de Autorización (Backend)

### Middlewares Disponibles

```typescript
// Middlewares básicos
authMiddleware          // Verifica JWT
adminMiddleware         // Solo admin
socioMiddleware         // Admin o Socio
abogadoMiddleware       // Admin, Socio, Abogado o Letrado
secretarioMiddleware    // Admin, Socio, Abogado, Letrado o Secretario
contadorMiddleware      // Admin, Socio o Contador
activeUserMiddleware    // Verifica que el usuario esté activo
verifiedEmailMiddleware // Verifica que el email esté verificado

// Middleware genérico
requireRoles('admin', 'socio')  // Verifica uno de varios roles
ownerOrAdminMiddleware         // Verifica propiedad o admin
```

### Ejemplos de Uso

```typescript
import { Router } from 'express';
import { authMiddleware, adminMiddleware, abogadoMiddleware, requireRoles } from '../middleware/auth';

const router = Router();

// Solo administradores
router.get('/admin-only', authMiddleware, adminMiddleware, handler);

// Abogados y superiores
router.get('/expedientes', authMiddleware, abogadoMiddleware, handler);

// Múltiples roles específicos
router.get('/finanzas', authMiddleware, requireRoles('admin', 'socio', 'contador'), handler);

// Verificar usuario activo
router.post('/accion-importante', authMiddleware, activeUserMiddleware, handler);
```

---

## 📝 Permisos por Rol

### Admin (`admin`)
```javascript
permissions: ['*'] // Acceso total a todo
```

### Socio (`socio`)
```javascript
permissions: [
  'expedientes:read', 'expedientes:write', 'expedientes:delete',
  'clientes:read', 'clientes:write', 'clientes:delete',
  'facturas:read', 'facturas:write', 'facturas:delete',
  'usuarios:read', 'usuarios:write',
  'reportes:read', 'reportes:write',
  'calendario:read', 'calendario:write',
  'documentos:read', 'documentos:write', 'documentos:delete',
  'crm:read', 'crm:write', 'crm:delete',
  'config:read', 'config:write'
]
```

### Abogado (`abogado`)
```javascript
permissions: [
  'expedientes:read', 'expedientes:write',
  'clientes:read', 'clientes:write',
  'facturas:read',
  'calendario:read', 'calendario:write',
  'documentos:read', 'documentos:write',
  'crm:read', 'crm:write'
]
```

### Letrado (`letrado`)
```javascript
permissions: [
  'expedientes:read', 'expedientes:write',
  'clientes:read', 'clientes:write',
  'calendario:read', 'calendario:write',
  'documentos:read', 'documentos:write'
]
```

### Secretario (`secretary`)
```javascript
permissions: [
  'expedientes:read',
  'clientes:read', 'clientes:write',
  'calendario:read', 'calendario:write',
  'documentos:read', 'documentos:write'
]
```

### Becario (`becario`)
```javascript
permissions: [
  'expedientes:read',
  'documentos:read'
]
```

### Colaborador (`colaborador`)
```javascript
permissions: [
  'expedientes:read',
  'documentos:read'
]
```

### Contador (`contador`)
```javascript
permissions: [
  'facturas:read', 'facturas:write',
  'reportes:read',
  'clientes:read'
]
```

### Recepcionista (`recepcionista`)
```javascript
permissions: [
  'clientes:read', 'clientes:write',
  'calendario:read', 'calendario:write'
]
```

---

## 🎨 Uso en Frontend (React)

### Hook useAuth

```typescript
import { useAuth } from '@/contexts/AuthContext';

function MiComponente() {
  const { 
    user, 
    userRole, 
    permissions, 
    isAuthenticated,
    hasPermission,
    hasRole 
  } = useAuth();

  // Verificar rol
  if (hasRole('admin', 'socio')) {
    return <AdminPanel />;
  }

  // Verificar permiso específico
  if (hasPermission('expedientes:write')) {
    return <button>Editar Expediente</button>;
  }

  return <div>Vista de solo lectura</div>;
}
```

### Componente ProtectedRoute

```typescript
import { ProtectedRoute } from '@/components/ProtectedRoute';

// Proteger por rol
<Route 
  path="/admin" 
  element={
    <ProtectedRoute requiredRoles={['admin']}>
      <AdminPanel />
    </ProtectedRoute>
  } 
/>

// Proteger por permiso
<Route 
  path="/expedientes/nuevo" 
  element={
    <ProtectedRoute requiredPermissions={['expedientes:write']}>
      <NuevoExpediente />
    </ProtectedRoute>
  } 
/>

// Proteger por múltiples roles
<Route 
  path="/finanzas" 
  element={
    <ProtectedRoute requiredRoles={['admin', 'socio', 'contador']}>
      <Finanzas />
    </ProtectedRoute>
  } 
/>
```

---

## 🌐 APIs de Autenticación con Roles

### Login
```http
POST /api/v1/auth/login
Content-Type: application/json

{
  "email": "usuario@bufete.com",
  "password": "password123"
}

Response:
{
  "success": true,
  "data": {
    "user": {
      "id": "...",
      "email": "usuario@bufete.com",
      "nombre": "Juan",
      "rol": "abogado",  // ← El rol se incluye en la respuesta
      "activo": true,
      "emailVerified": true
    },
    "accessToken": "eyJ...",
    "refreshToken": "eyJ..."
  }
}
```

### Obtener Permisos
```http
GET /api/v1/auth/permissions
Authorization: Bearer {token}

Response:
{
  "success": true,
  "data": {
    "role": "abogado",
    "permissions": [
      "expedientes:read",
      "expedientes:write",
      ...
    ],
    "emailVerified": true
  }
}
```

---

## 📊 Matriz de Acceso por Módulo

### M0 - Autenticación (Público)
| Página | Roles Permitidos |
|--------|------------------|
| Login | Todos |
| Registro | Todos |
| Recuperar Contraseña | Todos |
| Restablecer Contraseña | Todos |
| Verificar Email | Todos |

### M1 - Core Legal
| Página | Roles Permitidos |
|--------|------------------|
| Dashboard | Todos |
| Expedientes | admin, socio, abogado, letrado, secretary |
| Calendario | Todos excepto becario, colaborador |
| Audiencias | admin, socio, abogado, letrado, secretary |
| Prescripciones | admin, socio, abogado, letrado |

### M2 - Gestión Documental
| Página | Roles Permitidos |
|--------|------------------|
| Biblioteca | Todos excepto recepcionista |
| OCR | admin, socio |

### M3 - Finanzas
| Página | Roles Permitidos |
|--------|------------------|
| Facturación | admin, socio, contador |
| Contabilidad | admin, socio, contador |
| Rentabilidad | admin, socio |

### M16 - Administración
| Página | Roles Permitidos |
|--------|------------------|
| Panel Admin | admin |
| Usuarios | admin |
| Roles y Permisos | admin |

---

## 🔧 Configuración de Variables de Entorno

```env
# JWT Configuration
JWT_SECRET="your-super-secret-jwt-key"
JWT_REFRESH_SECRET="your-super-secret-refresh-key"
JWT_EXPIRES_IN="15m"
JWT_REFRESH_EXPIRES_IN="7d"
```

---

## 🧪 Testing de Roles

### Crear usuario con rol específico (API)
```http
POST /api/v1/auth/register
Content-Type: application/json

{
  "email": "test@bufete.com",
  "password": "password123",
  "nombre": "Test",
  "apellido1": "Usuario",
  "rol": "abogado"  // ← Especificar rol
}
```

**Nota**: En producción, solo los admins deberían poder crear usuarios con roles específicos.

---

## 📚 Flujo de Autenticación Completo

1. **Login**: Usuario envía credenciales → Backend valida → Genera JWT con `role` en payload
2. **Almacenamiento**: Frontend guarda token en localStorage
3. **Peticiones**: Frontend envía token en header `Authorization: Bearer {token}`
4. **Verificación**: Middleware decodifica JWT y extrae `role`
5. **Autorización**: Middleware verifica si el rol tiene permiso para la ruta
6. **Respuesta**: Si autorizado, continúa; si no, retorna 403 Forbidden

---

## ⚠️ Consideraciones de Seguridad

1. **Nunca confíes solo en el frontend** para autorización - siempre validar en backend
2. **Tokens JWT** deben tener expiración corta (15 minutos recomendado)
3. **Refresh tokens** permiten renovar sesión sin re-loguear (7 días)
4. **Contraseñas** se almacenan con bcrypt (12 rounds)
5. **Validación de email** requerida para ciertas operaciones
6. **Usuarios inactivos** no pueden acceder al sistema

---

## 🚀 Próximos Pasos

1. **Auditoría**: Log de acciones por usuario/rol
2. **Permisos dinámicos**: Permitir configurar permisos personalizados por usuario
3. **Grupos de permisos**: Crear grupos predefinidos (ej: "Gestor de expedientes")
4. **2FA**: Autenticación de dos factores para roles críticos
5. **Sesiones**: Gestión de sesiones activas por usuario

# APIs Disponibles

Este documento lista todas las APIs externas e internas utilizadas en el proyecto.

---

## APIs Externas

### 1. BOE (Boletín Oficial del Estado)

| 属性 | Valor |
|------|-------|
| URL Base | `https://www.boe.es/datosabiertos/api` |
| Estado | Mock (desarrollo) |
| Documentación | https://www.boe.es/datosabiertos/api/ |

**Endpoints:**

- `GET /buscador` - Búsqueda de documentos legislativos
- `GET /documento/{id}` - Obtener documento completo
- `GET /calendario` - Calendario de publicaciones

**Variables de entorno:**
```bash
VITE_BOE_API_KEY=tu_api_key
```

**Tipos relacionados:**
- `BoeDocumento`
- `BoeSearchResponse`
- `BoeDocumentoCompleto`

---

### 2. CENDOJ (Centro de Documentación Judicial)

| 属性 | Valor |
|------|-------|
| URL Base | `https://www.poderjudicial.es/cgpj/rest/api` |
| Estado | Mock (desarrollo) |
| Documentación | https://www.poderjudicial.es/cgpj/es/Tribunales/CENDOJ/ |

**Endpoints:**

- `GET /busqueda` - Búsqueda de jurisprudencia
- `GET /resolucion/{id}` - Obtener resolución completa

**Variables de entorno:**
```bash
VITE_CENDOJ_API_KEY=tu_api_key
```

**Tipos relacionados:**
- `CendojDocumento`
- `CendojSearchResponse`
- `JurisprudenciaDetalle`

---

### 3. Exchange Rate API

| 属性 | Valor |
|------|-------|
| URL Base | `https://api.exchangerate-api.com/v4/latest` |
| Estado | Mock (desarrollo) |
| Uso | Conversión de moneda |

**Funciones:**
- `getExchangeRates(base)` - Obtener tasas de cambio
- `convertCurrency(amount, from, to)` - Convertir importe
- `getExchangeRate(from, to)` - Obtener tasa específica
- `getAvailableCurrencies()` - Listar monedas disponibles

**Variables de entorno:**
```bash
VITE_EXCHANGE_RATE_API_KEY=tu_api_key
```

---

### 4. Google Workspace API

| 属性 | Valor |
|------|-------|
| Estado | Integración implementada |
| Servicios | Google Drive, Gmail, Calendar, Docs |

**Servicios:**
- Autenticación OAuth 2.0
- Sincronización de calendario
- Gestión de archivos

**Tipos relacionados:**
- `GoogleDriveFile`
- `GoogleCalendarEvent`

---

### 5. Microsoft 365 API

| 属性 | Valor |
|------|-------|
| Estado | Integración implementada |
| Servicios | Outlook, OneDrive, Teams, SharePoint |

---

### 6. Stripe Payments

| 属性 | Valor |
|------|-------|
| Estado | Integración disponible |
| Uso | Procesamiento de pagos |

---

## APIs Internas (Frontend)

### Marketplace API

| 属性 | Valor |
|------|-------|
| URL Base | `/api/marketplace` |

**Endpoints:**

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| GET | `/integraciones` | Obtener catálogo |
| GET | `/integraciones/{id}` | Obtener integración |
| GET | `/integraciones/clave/{clave}` | Buscar por clave |
| GET | `/buscar?q={termino}` | Búsqueda |
| GET | `/instalaciones` | Listar instalaciones |
| POST | `/instalaciones` | Instalar integración |
| PATCH | `/instalaciones/{id}` | Actualizar instalación |
| DELETE | `/instalaciones/{id}` | Desinstalar |
| POST | `/instalaciones/{id}/actualizar` | Actualizar versión |
| POST | `/instalaciones/{id}/test` | Probar conexión |
| GET | `/notificaciones` | Obtener notificaciones |
| PATCH | `/notificaciones/{id}/leer` | Marcar como leída |
| GET | `/actualizaciones` | Listar actualizaciones |

---

### Calendario API

| 属性 | Valor |
|------|-------|
| URL Base | `/api/calendario` |

**Endpoints:**

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| GET | `/eventos` | Listar eventos |
| GET | `/eventos/{id}` | Obtener evento |
| POST | `/eventos` | Crear evento |
| PATCH | `/eventos/{id}` | Actualizar evento |
| DELETE | `/eventos/{id}` | Eliminar evento |
| GET | `/conectados` | Calendarios conectados |
| GET | `/configuraciones` | Configuraciones |
| POST | `/conectar` | Conectar calendario |
| POST | `/desconectar` | Desconectar calendario |
| POST | `/sincronizar` | Sincronizar |
| POST | `/sincronizar-todos` | Sincronizar todos |
| POST | `/eventos/{id}/resolver-conflicto` | Resolver conflicto |

---

## Notas

- **Mock vs Producción**: La mayoría de APIs externas están en modo mock para desarrollo
- **Credenciales**: Necesitas obtener credenciales reales para BOE y CENDOJ
- **Rate Limits**: 
  - BOE: 100 req/min
  - CENDOJ: 50 req/min
- **CORS**: Las APIs oficiales requieren backend proxy para evitar problemas de CORS

# 04 - Endpoints de API

## Convenciones

### Formato de Respuesta
```json
{
  "success": true,
  "data": { ... },
  "meta": {
    "page": 1,
    "limit": 20,
    "total": 100,
    "totalPages": 5
  }
}
```

### Formato de Error
```json
{
  "success": false,
  "error": {
    "code": "EXPEDIENTE_NOT_FOUND",
    "message": "Expediente no encontrado",
    "details": { ... }
  }
}
```

### Paginación
```
GET /api/v1/expedientes?page=1&limit=20&sort=created_at&order=desc
```

---

## Autenticación

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| POST | `/api/v1/auth/login` | Iniciar sesión |
| POST | `/api/v1/auth/register` | Registrarse |
| POST | `/api/v1/auth/logout` | Cerrar sesión |
| POST | `/api/v1/auth/refresh` | Refrescar token |
| GET | `/api/v1/auth/me` | Datos usuario actual |
| POST | `/api/v1/auth/password/reset` | Resetear contraseña |
| POST | `/api/v1/auth/password/change` | Cambiar contraseña |

### Login
```typescript
// Request
POST /api/v1/auth/login
{
  "email": "abogado@bufete.es",
  "password": "***"
}

// Response
{
  "success": true,
  "data": {
    "user": { "id": "uuid", "email": "...", "nombre": "..." },
    "accessToken": "eyJhbG...",
    "refreshToken": "eyJhbG..."
  }
}
```

---

## Usuarios

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| GET | `/api/v1/usuarios` | Listar usuarios |
| POST | `/api/v1/usuarios` | Crear usuario |
| GET | `/api/v1/usuarios/:id` | Ver usuario |
| PUT | `/api/v1/usuarios/:id` | Actualizar usuario |
| DELETE | `/api/v1/usuarios/:id` | Desactivar usuario |
| PUT | `/api/v1/usuarios/:id/roles` | Asignar roles |

---

## Expedientes

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| GET | `/api/v1/expedientes` | Listar expedientes |
| POST | `/api/v1/expedientes` | Crear expediente |
| GET | `/api/v1/expedientes/:id` | Ver expediente |
| PUT | `/api/v1/expedientes/:id` | Actualizar expediente |
| DELETE | `/api/v1/expedientes/:id` | Archivar expediente |
| GET | `/api/v1/expedientes/:id/actuaciones` | Ver actuaciones |
| POST | `/api/v1/expedientes/:id/actuaciones` | Crear actuación |
| GET | `/api/v1/expedientes/:id/documentos` | Ver documentos |
| POST | `/api/v1/expedientes/:id/documentos` | Añadir documento |
| GET | `/api/v1/expedientes/:id/timeline` | Ver timeline |
| GET | `/api/v1/expedientes/:id/prescripciones` | Ver prescripciones |
| GET | `/api/v1/expedientes/buscar` | Buscar expedientes |
| GET | `/api/v1/expedientes/calendario` | Calendario audiencias |

### Filtros
```
GET /api/v1/expedientes?
  estado=activo,cerrado
  &tipo=civil,penal
  &abogado_id=uuid
  &cliente_id=uuid
  &fecha_desde=2024-01-01
  &fecha_hasta=2024-12-31
  &busqueda=palabra
```

---

## Clientes

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| GET | `/api/v1/clientes` | Listar clientes |
| POST | `/api/v1/clientes` | Crear cliente |
| GET | `/api/v1/clientes/:id` | Ver cliente |
| PUT | `/api/v1/clientes/:id` | Actualizar cliente |
| DELETE | `/api/v1/clientes/:id` | Desactivar cliente |
| GET | `/api/v1/clientes/:id/expedientes` | Ver expedientes cliente |
| GET | `/api/v1/clientes/:id/facturas` | Ver facturas cliente |
| GET | `/api/v1/clientes/:id/documentos` | Ver documentos cliente |
| POST | `/api/v1/clientes/:id/contactos` | Añadir contacto |
| GET | `/api/v1/clientes/buscar` | Buscar clientes |

---

## Facturación

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| GET | `/api/v1/facturas` | Listar facturas |
| POST | `/api/v1/facturas` | Crear factura |
| GET | `/api/v1/facturas/:id` | Ver factura |
| PUT | `/api/v1/facturas/:id` | Actualizar factura |
| DELETE | `/api/v1/facturas/:id` | Anular factura |
| POST | `/api/v1/facturas/:id/pagar` | Registrar pago |
| GET | `/api/v1/facturas/:id/pdf` | Descargar PDF |
| POST | `/api/v1/facturas/:id/enviar` | Enviar por email |
| GET | `/api/v1/facturas/pendientes` | Facturas pendientes |
| GET | `/api/v1/facturas/vencidas` | Facturas vencidas |
| POST | `/api/v1/facturas/:id/recurrir` | Crear factura recurrente |

---

## Documentos

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| GET | `/api/v1/documentos` | Listar documentos |
| POST | `/api/v1/documentos` | Subir documento |
| GET | `/api/v1/documentos/:id` | Ver documento |
| PUT | `/api/v1/documentos/:id` | Actualizar metadata |
| DELETE | `/api/v1/documentos/:id` | Eliminar documento |
| GET | `/api/v1/documentos/:id/descargar` | Descargar archivo |
| POST | `/api/v1/documentos/:id/firmar` | Firmar documento |
| POST | `/api/v1/documentos/ocr` | Procesar OCR |
| GET | `/api/v1/documentos/biblioteca` | Biblioteca documentos |
| POST | `/api/v1/documentos/plantillas` | Guardar plantilla |
| GET | `/api/v1/documentos/plantillas` | Listar plantillas |
| POST | `/api/v1/documentos/merge` | Merge documento |

---

## Calendario

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| GET | `/api/v1/calendario/eventos` | Listar eventos |
| POST | `/api/v1/calendario/eventos` | Crear evento |
| GET | `/api/v1/calendario/eventos/:id` | Ver evento |
| PUT | `/api/v1/calendario/eventos/:id` | Actualizar evento |
| DELETE | `/api/v1/calendario/eventos/:id` | Eliminar evento |
| GET | `/api/v1/calendario/audiencias` | Audiencias próximas |
| GET | `/api/v1/calendario/plazos` | Plazos judiciales |
| GET | `/api/v1/calendario/tareas` | Tareas del día |

---

## Turnos de Oficio

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| GET | `/api/v1/oficio/turnos` | Listar turnos |
| POST | `/api/v1/oficio/turnos` | Asignar turno |
| GET | `/api/v1/oficio/turnos/:id` | Ver turno |
| PUT | `/api/v1/oficio/turnos/:id` | Actualizar turno |
| POST | `/api/v1/oficio/turnos/:id/atender` | Atender turno |
| GET | `/api/v1/oficio/guardias` | Listar guardias |
| POST | `/api/v1/oficio/guardias` | Crear guardia |
| GET | `/api/v1/oficio/actuaciones` | Listar actuaciones |
| POST | `/api/v1/oficio/actuaciones` | Crear actuación |
| GET | `/api/v1/oficio/liquidaciones` | Listar liquidaciones |
| POST | `/api/v1/oficio/liquidaciones` | Crear liquidación |
| GET | `/api/v1/oficio/dashboard` | Dashboard oficio |
| GET | `/api/v1/oficio/estadisticas` | Estadísticas |

---

## CRM

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| GET | `/api/v1/crm/leads` | Listar leads |
| POST | `/api/v1/crm/leads` | Crear lead |
| PUT | `/api/v1/crm/leads/:id` | Actualizar lead |
| PUT | `/api/v1/crm/leads/:id/convertir` | Convertir a cliente |
| GET | `/api/v1/crm/oportunidades` | Listar oportunidades |
| POST | `/api/v1/crm/oportunidades` | Crear oportunidad |
| PUT | `/api/v1/crm/oportunidades/:id` | Actualizar oportunidad |
| GET | `/api/v1/crm/pipeline` | Ver pipeline |
| GET | `/api/v1/crm/contactos` | Listar contactos |
| POST | `/api/v1/crm/contactos` | Crear contacto |
| GET | `/api/v1/crm/actividades` | Listar actividades |
| POST | `/api/v1/crm/actividades` | Crear actividad |

---

## LOPDGDD

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| GET | `/api/v1/lopdgdd/rat` | Listar actividades RAT |
| POST | `/api/v1/lopdgdd/rat` | Crear actividad RAT |
| PUT | `/api/v1/lopdgdd/rat/:id` | Actualizar RAT |
| GET | `/api/v1/lopdgdd/rat/exportar` | Exportar RAT JSON |
| GET | `/api/v1/lopdgdd/consentimientos` | Listar consentimientos |
| POST | `/api/v1/lopdgdd/consentimientos` | Registrar consentimiento |
| GET | `/api/v1/lopdgdd/derechos` | Listar solicitudes derechos |
| POST | `/api/v1/lopdgdd/derechos` | Ejercer derecho |
| PUT | `/api/v1/lopdgdd/derechos/:id/procesar` | Procesar solicitud |
| GET | `/api/v1/lopdgdd/brechas` | Listar brechas |
| POST | `/api/v1/lopdgdd/brechas` | Notificar brecha |
| POST | `/api/v1/lopdgdd/brechas/:id/notificar-aepd` | Notificar AEPD |
| GET | `/api/v1/lopdgdd/informes` | Informes compliance |
| GET | `/api/v1/lopdgdd/eipd` | Lista EIPD |
| POST | `/api/v1/lopdgdd/eipd` | Crear EIPD |

---

## Legislación

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| GET | `/api/v1/legislacion/boe/buscar` | Buscar BOE |
| GET | `/api/v1/legislacion/boe/:id` | Ver documento BOE |
| GET | `/api/v1/legislacion/cendoj/buscar` | Buscar jurisprudencia |
| GET | `/api/v1/legislacion/cendoj/:id` | Ver sentencia |
| GET | `/api/v1/legislacion/novedades` | Últimas publicaciones |
| GET | `/api/v1/legislacion/derogaciones` | Normas derogadas |
| GET | `/api/v1/legislacion/favoritos` | Favoritos usuario |
| POST | `/api/v1/legislacion/favoritos` | Añadir favorito |
| DELETE | `/api/v1/legislacion/favoritos/:id` | Quitar favorito |
| GET | `/api/v1/legislacion/alertas` | Alertas usuario |
| POST | `/api/v1/legislacion/alertas` | Crear alerta |
| DELETE | `/api/v1/legislacion/alertas/:id` | Eliminar alerta |

---

## Integraciones

### Microsoft 365
| Método | Endpoint | Descripción |
|--------|----------|-------------|
| GET | `/api/v1/integraciones/microsoft/status` | Estado conexión |
| POST | `/api/v1/integraciones/microsoft/connect` | Iniciar OAuth |
| POST | `/api/v1/integraciones/microsoft/disconnect` | Desconectar |
| GET | `/api/v1/integraciones/microsoft/calendar` | Ver calendario |
| POST | `/api/v1/integraciones/microsoft/calendar/sync` | Sincronizar |
| POST | `/api/v1/integraciones/microsoft/email/send` | Enviar email |
| GET | `/api/v1/integraciones/microsoft/onedrive` | Archivos OneDrive |

### Google
| Método | Endpoint | Descripción |
|--------|----------|-------------|
| GET | `/api/v1/integraciones/google/status` | Estado conexión |
| POST | `/api/v1/integraciones/google/connect` | Iniciar OAuth |
| POST | `/api/v1/integraciones/google/disconnect` | Desconectar |
| GET | `/api/v1/integraciones/google/calendar` | Ver calendario |
| POST | `/api/v1/integraciones/google/calendar/sync` | Sincronizar |
| POST | `/api/v1/integraciones/google/email/send` | Enviar email |
| GET | `/api/v1/integraciones/google/drive` | Archivos Drive |

---

## Marketplace

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| GET | `/api/v1/marketplace/integraciones` | Listar integraciones |
| GET | `/api/v1/marketplace/integraciones/:id` | Ver integración |
| POST | `/api/v1/marketplace/integraciones/:id/activar` | Activar |
| POST | `/api/v1/marketplace/integraciones/:id/desactivar` | Desactivar |
| GET | `/api/v1/marketplace/registros/civil` | Consulta RC |
| GET | `/api/v1/marketplace/registros/catastro` | Consulta Catastro |
| GET | `/api/v1/marketplace/registros/propiedad` | Consulta RP |
| POST | `/api/v1/marketplace/consulta` | Consulta genérica |

---

## Predicción

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| POST | `/api/v1/prediccion/caso` | Predecir caso |
| GET | `/api/v1/prediccion/caso/:expedienteId` | Ver predicción |
| GET | `/api/v1/prediccion/tendencias` | Tendencias globales |
| GET | `/api/v1/prediccion/casos-similares` | Casos similares |
| GET | `/api/v1/prediccion/riesgo-prescripcion` | Riesgo prescripción |
| GET | `/api/v1/prediccion/dashboard` | Dashboard predictivo |
| GET | `/api/v1/prediccion/abogado/:id/metricas` | Métricas abogado |

---

## Prescripciones

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| GET | `/api/v1/prescripciones` | Listar prescripciones |
| POST | `/api/v1/prescripciones` | Crear prescripción |
| GET | `/api/v1/prescripciones/:id` | Ver prescripción |
| PUT | `/api/v1/prescripciones/:id` | Actualizar |
| GET | `/api/v1/prescripciones/proximas` | Próximas a prescribir |
| GET | `/api/v1/prescripciones/alertas` | Alertas activas |

---

## Conflictos

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| GET | `/api/v1/conflictos` | Listar conflictos |
| POST | `/api/v1/conflictos` | Crear conflicto |
| GET | `/api/v1/conflictos/:id` | Ver conflicto |
| PUT | `/api/v1/conflictos/:id` | Actualizar |
| GET | `/api/v1/conflictos/partes-contrarias` | Lista partes |
| POST | `/api/v1/conflictos/partes-contrarias` | Crear parte |
| GET | `/api/v1/conflictos/analisis/:expedienteId` | Análisis conflicto |

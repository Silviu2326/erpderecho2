# 01 - Visión General del Backend

## ERP Derecho - Backend API

### Propósito

Backend REST API para el ERP de gestión de bufete de abogados, proporcionando:
- Gestión de expedientes y casos legales
- Administración de clientes
- Facturación y contabilidad
- Turnos de oficio y asistencia letrada
- Cumplimiento LOPDGDD
- Integración con servicios externos (BOE, CENDOJ, Microsoft, Google)
- Análisis predictivo de casos

### Objetivos

1. **API RESTful** - Interface REST estándar
2. **Escalable** - Arquitectura preparada para crecer
3. **Seguro** - Cumplimiento RGPD/LOPDGDD
4. **Integrado** - Conexión con servicios externos
5. **Rápido** - Respuestas optimizadas

### Tech Stack

| Componente | Tecnología |
|------------|------------|
| Runtime | Node.js 20+ |
| Framework | NestJS o Express |
| Base de datos | PostgreSQL 15+ |
| ORM | Prisma o TypeORM |
| Cache | Redis |
| Cola de mensajes | RabbitMQ o Bull |
| Búsqueda | Elasticsearch |
| API Docs | Swagger/OpenAPI |
| Autenticación | JWT + Refresh Tokens |
| Variables entorno | dotenv |

### Módulos del Sistema

| Módulo | Descripción |
|--------|-------------|
| Core | Expedientes, clientes, calendario |
| Finanzas | Facturación, contabilidad, gastos |
| Documentos | Biblioteca, OCR, plantillas |
| Comunicaciones | Mensajes, notificaciones |
| Oficio | Turnos, guardias, liquidación |
| CRM | Leads, oportunidades, pipeline |
| LOPDGDD | RAT, consentimientos, brechas |
| Legislación | BOE, CENDOJ |
| Integraciones | Microsoft 365, Google |
| Marketplace | Registros públicos |
| IA | Predicción, análisis |

### Autenticación

- JWT para acceso
- Refresh tokens para sesión persistente
- OAuth 2.0 para integraciones

### Rate Limiting

- 100 req/min por usuario
- 1000 req/min por IP
- Endpoints especiales con límites propios

### Versión API

- Versión actual: `v1`
- URL base: `/api/v1`

### Changelog

| Versión | Fecha | Cambios |
|---------|-------|----------|
| v1.0.0 | 2026-02 | Release inicial |

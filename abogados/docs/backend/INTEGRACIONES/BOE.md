# Integración BOE

## API del BOE

### Endpoint Principal
```
Base URL: https://boe.es/api
```

### Métodos Disponibles

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| GET | `/documentos` | Buscar documentos |
| GET | `/documentos/{id}` | Obtener documento por ID |
| GET | `/diarios` | Listar diarios oficiales |
| GET | `/materias` | Listar materias |

### Parametros de Búsqueda

```
GET /documentos?
  departamento=…
  &tipo=…
  &fechaDesde=…
  &fechaHasta=…
  &texto=…
  &page=…
```

### Tipos de Documentos

| Código | Descripción |
|--------|-------------|
| ley | Ley |
| real_decreto | Real Decreto |
| orden_ministerial | Orden Ministerial |
| resolucion | Resolución |
| acuerdo | Acuerdo |
| instruccion | Instruccion |

---

## Implementación Backend

### Servicio

```typescript
// services/boe.service.ts
interface BoeService {
  buscar(params: BusquedaBoeParams): Promise<BoeResponse>
  obtenerPorId(id: string): Promise<DocumentoBoe>
  obtenerCalendario(fecha: Date): Promise<Diario[]>
}

interface BusquedaBoeParams {
  texto?: string
  departamento?: string
  tipo?: string
  fechaDesde?: Date
  fechaHasta?: Date
  page?: number
  limit?: number
}
```

### Cache

- TTL: 1 hora para búsquedas
- TTL: 24 horas para documentos
- Invalidación: Por fecha

### Rate Limiting

- 100 requests/minuto
- Usar cache para evitar límite

---

## Respuesta API

### Documento BOE

```json
{
  "id": "boe-2026-1234",
  "titulo": "Ley 1/2026, de...",
  "numero": "1/2026",
  "tipo": "ley",
  "departamento": "Ministerio de Justicia",
  "fechaPublicacion": "2026-01-15",
  "url": "https://www.boe.es/boe/dias/2026/01/15/pdfs/BOE-A-2026-1234.pdf",
  "urlHtml": "https://www.boe.es/boe/dias/2026/01/15/pdfs/BOE-A-2026-1234",
  "resumen": "...",
  "materias": ["justicia", "procedimiento"],
  "deroga": ["ley-antigua"],
  "modifica": []
}
```

---

## Sincronización

### Job: Sincronizar BOE

```typescript
// jobs/sincronizar-boe.job.ts
@Cron('0 6 * * *') // Diario a las 6am
async sincronizarBoe() {
  const ultimos = await this.boeClient.obtenerUltimos()
  
  for (const doc of ultimos) {
    await this.legislacionRepo.upsert(doc)
  }
}
```

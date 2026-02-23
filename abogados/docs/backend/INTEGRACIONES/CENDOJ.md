# Integración CENDOJ

## API del CENDOJ

### Endpoint Principal
```
Base URL: https://www.poderjudicial.es/cgpj/rest/api
```

### Métodos Disponibles

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| GET | `/resoluciones` | Buscar resoluciones |
| GET | `/resoluciones/{id}` | Obtener resolución |
| GET | `/tribunales` | Listar tribunales |
| GET | `/materias` | Listar materias |

---

## Implementación Backend

### Servicio

```typescript
// services/cendoj.service.ts
interface CendojService {
  buscar(params: BusquedaCendojParams): Promise<CendojResponse>
  obtenerResolucion(id: string): Promise<Resolucion>
  buscarPorTribunal(tribunal: string, params: QueryParams): Promise<CendojResponse>
  buscarPorMateria(materia: string, params: QueryParams): Promise<CendojResponse>
}

interface BusquedaCendojParams {
  texto?: string
  tribunal?: string
  sala?: string
  ponente?: string
  procedimiento?: string
  fechaDesde?: Date
  fechaHasta?: Date
  materia?: string
  page?: number
  limit?: number
}
```

### Tipos de Resolución

| Código | Descripción |
|--------|-------------|
| sentencia | Sentencia |
| auto | Auto |
| providencia | Providencia |
| decreto | Decreto |
| interlocutoria | Interutoria |

---

## Respuesta API

### Resolución Judicial

```json
{
  "id": "STS-2026-1234",
  "tipo": "sentencia",
  "titulo": "STS 1234/2026",
  "tribunal": "tribunal_supremo",
  "sala": "sala_primera_civil",
  "ponente": "Excmo. Sr. D. ...",
  "fecha": "2026-01-15",
  "numero": "1234/2026",
  "procedimiento": "ordinario",
  "materia": "civil",
  "objeto": "Cláusulas abusivas",
  "antecedentes": "...",
  "fundamentos": "...",
  "fallo": "ESTIMAR...",
  "urlPdf": "https://...",
  "votoParticular": null,
  "recursos": [],
  "citas": [
    { "norma": "Ley 1/2000", "articulo": "art. 6" }
  ]
}
```

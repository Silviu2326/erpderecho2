# BOE y CENDOJ - Integración Legal

## BOE (Boletín Oficial del Estado)

### API Oficial
El BOE proporciona datos abiertos en formato XML a través de su API REST.

**Documentación oficial:** https://www.boe.es/datos_abiertos/

### Endpoints Implementados

#### 1. Buscar en BOE
```http
GET /api/v1/legislacion/boe/buscar?q={query}&sincronizar=true
Authorization: Bearer {token}
```

**Parámetros:**
- `q` (requerido): Término de búsqueda
- `sincronizar` (opcional): Guardar resultados en BD local

**Ejemplo:**
```http
GET /api/v1/legislacion/boe/buscar?q=concursal&sincronizar=true
```

**Respuesta:**
```json
{
  "success": true,
  "data": [
    {
      "id": "BOE-A-2024-1234",
      "titulo": "Ley 1/2024, de modificación de la Ley Concursal",
      "uri": "https://www.boe.es/diario_boe/txt.php?id=BOE-A-2024-1234",
      "pdf": "https://www.boe.es/diario_boe/pdf.php?id=BOE-A-2024-1234",
      "fecha": "2024-01-10",
      "departamento": "Ministerio de Justicia",
      "tipo": "disposicion"
    }
  ]
}
```

#### 2. Obtener documento específico
```http
GET /api/v1/legislacion/boe/{id}
Authorization: Bearer {token}
```

**Ejemplo:**
```http
GET /api/v1/legislacion/boe/BOE-A-2024-1234
```

### Características
- ✅ API oficial del BOE
- ✅ Sin necesidad de certificado
- ✅ Datos en tiempo real
- ✅ Sincronización automática con BD
- ✅ Rate limiting: 1 petición/segundo

---

## CENDOJ (Centro de Documentación Judicial)

### Scraping Controlado

Dado que CENDOJ no tiene API oficial pública, implementamos un scraper ético y controlado.

**Legalidad:**
El scraping de datos públicos es legal en España según:
- **Ley 37/2007**: Reutilización de la información del sector público
- **Sentencias del TJUE**: Datos públicos pueden ser reutilizados si no hay restricciones específicas

### Medidas Éticas Implementadas

1. **Rate Limiting**: Máximo 1 petición cada 3 segundos
2. **User-Agent Identificativo**: Contacto visible
3. **Cache**: Resultados cacheados 24 horas
4. **Sin descarga masiva**: Solo búsquedas puntuales
5. **Respeto a robots.txt**: Configuración conservadora

### Endpoints Implementados

#### 1. Buscar en CENDOJ
```http
GET /api/v1/legislacion/cendoj/buscar?q={query}&sincronizar=true
Authorization: Bearer {token}
```

**Parámetros:**
- `q` (requerido): Término de búsqueda
- `sincronizar` (opcional): Guardar resultados en BD local
- `page` (opcional): Página de resultados (default: 1)
- `limit` (opcional): Resultados por página (default: 10)

**Ejemplo:**
```http
GET /api/v1/legislacion/cendoj/buscar?q=despido+improcedente&sincronizar=true
```

**Respuesta:**
```json
{
  "success": true,
  "data": [
    {
      "id": "STS-123-2024",
      "numeroResolucion": "STS 123/2024",
      "titulo": "Sentencia sobre despido improcedente",
      "fecha": "2024-01-15",
      "organo": "Tribunal Supremo",
      "tipoResolucion": "Sentencia",
      "sede": "Madrid",
      "extracto": "En el recurso de casación...",
      "url": "https://www.poderjudicial.es/cgpj/...",
      "materias": ["Laboral", "Despido"]
    }
  ],
  "meta": {
    "page": 1,
    "limit": 10,
    "total": 45,
    "totalPages": 5
  }
}
```

#### 2. Obtener sentencia específica
```http
GET /api/v1/legislacion/cendoj/{id}
Authorization: Bearer {token}
```

---

## Búsqueda Unificada

### Buscar en ambas fuentes simultáneamente
```http
GET /api/v1/legislacion/buscar-externo?q={query}&fuente=TODAS&sincronizar=true
Authorization: Bearer {token}
```

**Parámetros:**
- `q` (requerido): Término de búsqueda
- `fuente` (opcional): BOE, CENDOJ, o TODAS (default: TODAS)
- `sincronizar` (opcional): Guardar resultados en BD
- `fechaDesde` (opcional): Fecha inicial (YYYY-MM-DD)
- `fechaHasta` (opcional): Fecha final (YYYY-MM-DD)

**Ejemplo:**
```http
GET /api/v1/legislacion/buscar-externo?q=proteccion+datos&fuente=TODAS&sincronizar=true
```

---

## Sincronización Masiva

### Sincronizar últimos días
```http
POST /api/v1/legislacion/sincronizar
Authorization: Bearer {token}
Content-Type: application/json

{
  "dias": 7
}
```

Sincroniza las publicaciones de los últimos N días desde BOE a la base de datos local.

**Nota:** CENDOJ no permite búsqueda por rango de fechas, por lo que solo se sincroniza BOE.

---

## Sistema de Alertas

### Crear alerta
```http
POST /api/v1/legislacion/alertas
Authorization: Bearer {token}
Content-Type: application/json

{
  "palabrasClave": "despido improcedente",
  "tipo": "Laboral",
  "activa": true
}
```

### Verificar alertas
```http
POST /api/v1/legislacion/alertas/verificar
Authorization: Bearer {token}
```

Busca nuevos resultados para todas las alertas activas del usuario.

---

## Favoritos

### Añadir a favoritos
```http
POST /api/v1/legislacion/favoritos
Authorization: Bearer {token}
Content-Type: application/json

{
  "legislacionId": "uuid-del-documento"
}
```

### Listar favoritos
```http
GET /api/v1/legislacion/favoritos
Authorization: Bearer {token}
```

---

## Cache y Performance

### Estrategia de Cache
- **BOE**: Sin cache (datos en tiempo real)
- **CENDOJ**: Cache de 24 horas
- **BD Local**: Consultas rápidas sin límites

### Límites de Uso

| Fuente | Límite | Notas |
|--------|--------|-------|
| BOE | 1 req/s | Rate limiting implementado |
| CENDOJ | 1 req/3s | Respeto al servidor |
| Cache CENDOJ | 24h | Reduce peticiones repetidas |

---

## Notas Importantes

### Sobre CENDOJ
1. **Web scraping**: Implementación ética y controlada
2. **Estructura HTML**: Puede cambiar. El scraper se adapta con selectores flexibles
3. **Disponibilidad**: Depende del sitio web oficial
4. **Fallback**: Si CENDOJ falla, se consulta la BD local

### Sobre BOE
1. **API XML**: Datos oficiales y estructurados
2. **XML Parsing**: Implementación simplificada. Para producción usar xml2js
3. **Formato IDs**: `BOE-A-YYYY-XXXXX`

### Mantenimiento
- Revisar logs de errores regularmente
- Monitorear cambios en la estructura de CENDOJ
- Ajustar rate limits si es necesario
- Limpiar cache cada 24h automáticamente

---

## Troubleshooting

### Error "Demasiadas peticiones"
- Esperar unos segundos entre búsquedas
- Usar cache de CENDOJ (24h)

### Error "Estructura cambiada" (CENDOJ)
- El scraper usa selectores flexibles
- Si falla, se devuelven resultados de BD local
- Revisar logs y ajustar selectores si es necesario

### No hay resultados
- Verificar términos de búsqueda
- Intentar con sinónimos
- Verificar fechas si se especifican

---

## Roadmap

- [ ] Parser XML completo con xml2js
- [ ] Web scraping avanzado con Playwright (si CENDOJ usa JS)
- [ ] Notificaciones automáticas de nuevas publicaciones
- [ ] Análisis de sentencias con IA
- [ ] Exportar a PDF/Word

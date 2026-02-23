# Configuración OCR - Google Cloud Vision

## Requisitos

### 1. Crear cuenta en Google Cloud Platform
- Ir a https://console.cloud.google.com/
- Crear cuenta o iniciar sesión
- Crear un nuevo proyecto

### 2. Habilitar Vision API
1. En el menú lateral, ir a "APIs y Servicios" > "Biblioteca"
2. Buscar "Cloud Vision API"
3. Click en "Habilitar"

### 3. Crear credenciales

#### Opción A: Archivo de clave JSON (Recomendado)
1. Ir a "APIs y Servicios" > "Credenciales"
2. Click en "Crear credenciales" > "Cuenta de servicio"
3. Dar nombre a la cuenta (ej: "erp-vision")
4. Asignar rol: "Usuario de Vision AI"
5. Click en "Crear clave" > "JSON"
6. Descargar el archivo (ej: `google-credentials.json`)
7. Mover a `backend/config/google-credentials.json`

#### Opción B: API Key (Menos seguro, solo para desarrollo)
1. Ir a "APIs y Servicios" > "Credenciales"
2. Click en "Crear credenciales" > "Clave de API"
3. Copiar la clave

## Configuración

### Variables de entorno

```bash
# backend/.env

# Opción A: Usar archivo de credenciales (Recomendado)
GOOGLE_CLOUD_PROJECT_ID=tu-project-id
GOOGLE_CLOUD_KEY_FILE=./config/google-credentials.json

# Opción B: Usar API Key directamente
GOOGLE_CLOUD_API_KEY=tu-api-key-aqui
```

### Costos

Google Vision API tiene **nivel gratuito**:
- 1,000 unidades/mes gratis

Después:
- Document Text Detection: $1.50 por 1,000 unidades
- Text Detection: $1.50 por 1,000 unidades

Para un bufete mediano (~500 documentos/mes): **~$0.75/mes**

## Endpoints OCR

### 1. Procesar OCR de un documento
```http
POST /api/v1/documentos/{documentoId}/ocr
Authorization: Bearer {token}
```

**Respuesta:**
```json
{
  "success": true,
  "data": {
    "documentoId": "uuid",
    "ocr": {
      "text": "Texto extraído del documento...",
      "confidence": 0.95,
      "pages": 2,
      "language": "es",
      "entities": {
        "dates": ["15/03/2024", "01/01/2024"],
        "amounts": ["1.500,00 €", "3.200 €"],
        "emails": ["cliente@email.com"],
        "phoneNumbers": ["612345678"],
        "dniNie": ["12345678A"],
        "caseNumbers": ["EXP-2024-001"]
      }
    },
    "analysis": {
      "documentType": "contrato",
      "summary": "Contrato de arrendamiento entre las partes...",
      "keyPoints": [
        "Fecha de inicio: 01/01/2024",
        "Renta mensual: 1.500 €"
      ],
      "legalEntities": ["Juzgado de Primera Instancia nº 5"],
      "suggestedTags": ["contrato", "arrendamiento", "inmobiliario"]
    }
  }
}
```

### 2. Procesar OCR en batch
```http
POST /api/v1/documentos/ocr/batch
Authorization: Bearer {token}
Content-Type: application/json

{
  "documentoIds": ["uuid-1", "uuid-2", "uuid-3"]
}
```

### 3. Buscar en contenido de documentos
```http
GET /api/v1/documentos/search/contenido?q=contrato+arrendamiento
Authorization: Bearer {token}
```

## Funcionalidades OCR

### ✅ Extraer texto
- Soporta PDF, JPG, PNG, TIFF
- Reconocimiento de escritura a mano (beta)
- Múltiples idiomas (español, inglés, etc.)

### ✅ Extraer entidades automáticamente
- **Fechas**: Formatos españoles (DD/MM/YYYY)
- **Montos**: Con símbolo € (ej: "1.500,00 €")
- **Emails**: Direcciones de correo
- **Teléfonos**: Móviles españoles (612345678)
- **DNI/NIE**: Documentos de identidad
- **Números de caso**: Expedientes legales

### ✅ Análisis del documento
- **Resumen**: Primeras oraciones principales
- **Puntos clave**: Fechas importantes, montos, partes
- **Tipo de documento**: Demanda, contrato, sentencia, etc.
- **Tags sugeridos**: Para clasificación automática

### ✅ Búsqueda en contenido
Buscar texto dentro de los documentos procesados

## Formatos soportados

| Formato | Extensión | Recomendado |
|---------|-----------|-------------|
| PDF | .pdf | ✅ Sí |
| JPEG | .jpg, .jpeg | ✅ Sí |
| PNG | .png | ✅ Sí |
| TIFF | .tiff, .tif | ✅ Sí |
| GIF | .gif | ⚠️ Limitado |
| BMP | .bmp | ⚠️ Limitado |

**Límites:**
- Tamaño máximo: 20 MB
- Resolución máxima: 75 megapíxeles

## Fallback

Si Google Vision no está configurado, el sistema usa **modo simulado** que:
- Devuelve texto genérico
- Extrae entidades básicas con regex
- Permite seguir desarrollando sin API

## Flujo típico

1. **Subir documento**: `POST /api/v1/documentos`
2. **Procesar OCR**: `POST /api/v1/documentos/{id}/ocr`
3. **Buscar contenido**: `GET /api/v1/documentos/search/contenido?q=termino`

## Troubleshooting

### Error "API key not valid"
- Verificar que la API Vision esté habilitada
- Verificar que la clave no haya expirado
- Revisar límites de cuota

### Error "File not found"
- Verificar que el archivo exista en la ruta especificada
- Revisar permisos de lectura

### OCR con baja calidad
- Usar imágenes de mayor resolución
- Asegurar buena iluminación en documentos escaneados
- Verificar que el texto no esté borroso

## Configuración de límites

Para evitar costos inesperados, configura cuotas en Google Cloud Console:
1. APIs y Servicios > Cuotas
2. Buscar "Cloud Vision API"
3. Configurar límite diario (ej: 1,000 peticiones)

## Alternativas

Si prefieres otra solución OCR:
- **AWS Textract**: Similar precio, integración AWS
- **Azure Computer Vision**: Buena precisión en español
- **Tesseract (local)**: Gratuito pero menos preciso

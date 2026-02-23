# Configuración de IA - ERP Derecho

## Requisitos

1. **Obtener API Key de OpenAI:**
   - Ir a https://platform.openai.com/
   - Crear cuenta o iniciar sesión
   - Generar API Key en "API Keys"
   - Copiar la clave (empieza con `sk-`)

2. **Configurar variables de entorno:**
   ```bash
   # backend/.env
   OPENAI_API_KEY=sk-tu-api-key-aqui
   OPENAI_MODEL=gpt-3.5-turbo  # o gpt-4 para mejor calidad
   ```

## Endpoints de IA Disponibles

### 1. Crear Predicción Individual
```http
POST /api/v1/prediccion/caso
Authorization: Bearer {token}
Content-Type: application/json

{
  "expedienteId": "uuid-del-expediente",
  "tipoPrediccion": "RESULTADO"  // RESULTADO | DURACION | COSTES | EXITO | RIESGO_PRESCRIPCION
}
```

**Respuesta:**
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "resultado": "Favorable",
    "probabilidad": 0.75,
    "factores": {
      "argumentosClave": ["Evidencia clara", "Testigos favorables"],
      "jurisprudenciaRelevante": ["STS 123/2023"],
      "recomendaciones": ["Reunir más pruebas"]
    },
    "modelo": "OPENAI_GPT"
  }
}
```

### 2. Análisis Completo del Caso
```http
POST /api/v1/prediccion/caso/{expedienteId}/analisis-completo
Authorization: Bearer {token}
```

Genera 4 predicciones diferentes + estrategia legal completa usando IA.

### 3. Analizar Sentimiento de Lead
```http
POST /api/v1/prediccion/lead/{leadId}/sentimiento
Authorization: Bearer {token}
```

**Respuesta:**
```json
{
  "success": true,
  "data": {
    "leadId": "uuid",
    "sentimiento": "positivo",
    "probabilidad": 0.85,
    "factores": ["Muestra interés", "Presupuesto disponible"],
    "modelo": "OPENAI_GPT"
  }
}
```

### 4. Dashboard de Estadísticas
```http
GET /api/v1/prediccion/stats/dashboard
Authorization: Bearer {token}
```

## Modelos Disponibles

| Modelo | Calidad | Costo Aprox. | Uso Recomendado |
|--------|---------|--------------|-----------------|
| gpt-3.5-turbo | Buena | ~$0.002/1K tokens | Desarrollo, predicciones simples |
| gpt-4 | Excelente | ~$0.03/1K tokens | Producción, casos complejos |
| gpt-4-turbo | Excelente | ~$0.01/1K tokens | Balance calidad/costo |

## Funcionalidades de IA Implementadas

✅ **Análisis de casos** - Predice resultado, duración, costes y probabilidad de éxito
✅ **Estrategia legal** - Genera estrategia recomendada con pasos prioritarios
✅ **Análisis de sentimiento** - Evalúa leads del CRM
✅ **Resumen de documentos** - Resume textos largos
✅ **Extracción de entidades** - Extrae fechas, montos, personas, conceptos legales

## Fallback

Si no hay API key configurada, el sistema usa **mocks inteligentes** basados en el tipo de caso, por lo que la aplicación sigue funcionando sin la API.

## Costos Estimados

Para un bufete mediano (~100 predicciones/mes):
- GPT-3.5: ~$1-3/mes
- GPT-4: ~$10-30/mes

## Próximas Mejoras

- [ ] Cache de predicciones para reducir costos
- [ ] Entrenamiento con datos históricos del bufete
- [ ] Integración con modelos locales (Llama, Mistral)
- [ ] Análisis de documentos con OCR + IA

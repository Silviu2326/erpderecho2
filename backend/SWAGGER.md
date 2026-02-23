# Documentación API - Swagger

## ✅ Implementado

### Configuración
- **Swagger UI**: Disponible en `/api-docs`
- **OpenAPI JSON**: Disponible en `/api-docs.json`
- **Versión**: OpenAPI 3.0.0

### Endpoints Documentados

#### Autenticación (`/auth`)
- ✅ `POST /auth/register` - Registrar usuario
- ✅ `POST /auth/login` - Iniciar sesión
- ✅ `GET /auth/me` - Perfil del usuario

#### Expedientes (`/expedientes`)
- ✅ `GET /expedientes` - Listar expedientes
- Más endpoints con documentación básica

### Cómo usar

#### 1. Acceder a Swagger UI
Abre en tu navegador:
```
http://localhost:3000/api-docs
```

#### 2. Autenticar
1. Haz login en `/auth/login`
2. Copia el `accessToken` de la respuesta
3. En Swagger UI, click en "Authorize" (🔒)
4. Introduce: `Bearer TU_TOKEN_AQUI`
5. Click en "Authorize" y luego "Close"

#### 3. Probar endpoints
- Todos los endpoints protegidos ahora funcionarán
- Puedes enviar requests directamente desde la UI
- Verás las respuestas formateadas

### Esquemas Definidos

```yaml
User:
  - id, email, nombre, apellidos, rol, especialidad

Cliente:
  - id, nombre, email, telefono, cif, tipo

Expediente:
  - id, numeroExpediente, tipo, estado, descripcion

Prediccion:
  - id, tipoPrediccion, resultado, probabilidad

Documento:
  - id, nombre, tipo, tamano, contenidoExtraido

LegislacionBOE:
  - id, titulo, uri, pdf, fecha, tipo

LegislacionCENDOJ:
  - id, numeroResolucion, titulo, fecha, organo
```

### Características

✅ **Autenticación JWT** integrada  
✅ **Modelos de respuesta** definidos  
✅ **Códigos de error** documentados  
✅ **Ejemplos** en cada endpoint  
✅ **Paginación** documentada  
✅ **Filtros** explicados  

### Extensiones Futuras

Para documentar más endpoints, agrega anotaciones JSDoc:

```typescript
/**
 * @swagger
 * /ruta:
 *   metodo:
 *     summary: Descripción breve
 *     tags: [Categoría]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: param
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Éxito
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Modelo'
 */
```

### Notas

- La documentación se genera automáticamente desde los comentarios JSDoc
- Los cambios en el código se reflejan al reiniciar el servidor
- Swagger UI es interactivo: puedes probar endpoints directamente
- El botón "Authorize" permite autenticar con JWT

---

**Backend 100% completo** 🎉

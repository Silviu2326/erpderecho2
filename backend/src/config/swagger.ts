import swaggerJsdoc from 'swagger-jsdoc';
import swaggerUi from 'swagger-ui-express';
import { Application } from 'express';

const options: swaggerJsdoc.Options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'ERP Derecho API',
      version: '1.0.0',
      description: `
API REST para gestión de bufetes de abogados.

## Funcionalidades principales:
- **Autenticación**: JWT con refresh tokens
- **Gestión de expedientes**: Casos legales, actuaciones, documentos
- **CRM**: Leads, oportunidades, pipeline
- **Facturación**: Facturas, pagos, vencimientos
- **Calendario**: Eventos, audiencias, plazos
- **IA**: Predicciones de casos con OpenAI
- **OCR**: Extracción de texto con Google Vision
- **Legislación**: Búsqueda en BOE y CENDOJ

## Autenticación
Todas las rutas protegidas requieren header:
\`\`\`
Authorization: Bearer {token}
\`\`\`

## Códigos de error comunes:
- 400: Bad Request - Datos inválidos
- 401: Unauthorized - Token no válido
- 403: Forbidden - Sin permisos
- 404: Not Found - Recurso no existe
- 409: Conflict - Recurso ya existe
- 429: Too Many Requests - Rate limit excedido
- 500: Internal Server Error
      `,
      contact: {
        name: 'Soporte ERP Derecho',
        email: 'soporte@erpderecho.com',
      },
      license: {
        name: 'Privado',
      },
    },
    servers: [
      {
        url: 'http://localhost:3000/api/v1',
        description: 'Servidor de desarrollo',
      },
      {
        url: 'https://api.erpderecho.com/api/v1',
        description: 'Servidor de producción',
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
          description: 'Token JWT obtenido al iniciar sesión',
        },
      },
      schemas: {
        // Esquemas reutilizables
        Error: {
          type: 'object',
          properties: {
            success: {
              type: 'boolean',
              example: false,
            },
            error: {
              type: 'object',
              properties: {
                code: {
                  type: 'string',
                  example: 'USER_NOT_FOUND',
                },
                message: {
                  type: 'string',
                  example: 'Usuario no encontrado',
                },
              },
            },
          },
        },
        PaginatedResponse: {
          type: 'object',
          properties: {
            success: {
              type: 'boolean',
              example: true,
            },
            data: {
              type: 'array',
              items: {
                type: 'object',
              },
            },
            meta: {
              type: 'object',
              properties: {
                page: {
                  type: 'integer',
                  example: 1,
                },
                limit: {
                  type: 'integer',
                  example: 20,
                },
                total: {
                  type: 'integer',
                  example: 100,
                },
                totalPages: {
                  type: 'integer',
                  example: 5,
                },
              },
            },
          },
        },
        User: {
          type: 'object',
          properties: {
            id: {
              type: 'string',
              example: '550e8400-e29b-41d4-a716-446655440000',
            },
            email: {
              type: 'string',
              example: 'abogado@bufete.com',
            },
            nombre: {
              type: 'string',
              example: 'Juan',
            },
            apellido1: {
              type: 'string',
              example: 'García',
            },
            apellido2: {
              type: 'string',
              example: 'López',
            },
            rol: {
              type: 'string',
              enum: ['admin', 'abogado', 'letrado', 'secretary', 'becario', 'colaborador'],
              example: 'abogado',
            },
            especialidad: {
              type: 'string',
              example: 'Derecho Civil',
            },
            createdAt: {
              type: 'string',
              format: 'date-time',
            },
          },
        },
        Cliente: {
          type: 'object',
          properties: {
            id: {
              type: 'string',
            },
            nombre: {
              type: 'string',
              example: 'Empresa ABC S.L.',
            },
            email: {
              type: 'string',
              example: 'contacto@empresa.com',
            },
            telefono: {
              type: 'string',
              example: '+34 912 345 678',
            },
            cif: {
              type: 'string',
              example: 'B12345678',
            },
            tipo: {
              type: 'string',
              enum: ['empresa', 'particular'],
              example: 'empresa',
            },
          },
        },
        Expediente: {
          type: 'object',
          properties: {
            id: {
              type: 'string',
            },
            numeroExpediente: {
              type: 'string',
              example: 'EXP-2024-001',
            },
            tipo: {
              type: 'string',
              enum: ['CIVIL', 'PENAL', 'LABORAL', 'CONTENCIOSO', 'MERCANTIL', 'FAMILIA', 'ADMINISTRATIVO'],
              example: 'CIVIL',
            },
            estado: {
              type: 'string',
              enum: ['ACTIVO', 'CERRADO', 'ARCHIVADO', 'SUSPENDIDO'],
              example: 'ACTIVO',
            },
            descripcion: {
              type: 'string',
              example: 'Reclamación de cantidad por contrato incumplido',
            },
            clienteId: {
              type: 'string',
            },
            abogadoId: {
              type: 'string',
            },
          },
        },
        Prediccion: {
          type: 'object',
          properties: {
            id: {
              type: 'string',
            },
            expedienteId: {
              type: 'string',
            },
            tipoPrediccion: {
              type: 'string',
              enum: ['RESULTADO', 'DURACION', 'COSTES', 'EXITO', 'RIESGO_PRESCRIPCION'],
              example: 'RESULTADO',
            },
            resultado: {
              type: 'string',
              example: 'Favorable',
            },
            probabilidad: {
              type: 'number',
              example: 0.75,
            },
            factores: {
              type: 'object',
              example: {
                argumentosClave: ['Evidencia clara'],
                jurisprudenciaRelevante: ['STS 123/2023'],
              },
            },
          },
        },
        Documento: {
          type: 'object',
          properties: {
            id: {
              type: 'string',
            },
            nombre: {
              type: 'string',
              example: 'Contrato_arrendamiento.pdf',
            },
            tipo: {
              type: 'string',
              example: 'application/pdf',
            },
            tamano: {
              type: 'integer',
              example: 2048576,
            },
            expedienteId: {
              type: 'string',
            },
            contenidoExtraido: {
              type: 'string',
              description: 'Texto extraído por OCR',
            },
          },
        },
        LegislacionBOE: {
          type: 'object',
          properties: {
            id: {
              type: 'string',
              example: 'BOE-A-2024-1234',
            },
            titulo: {
              type: 'string',
              example: 'Ley 1/2024, de modificación de la Ley Concursal',
            },
            uri: {
              type: 'string',
              example: 'https://www.boe.es/diario_boe/txt.php?id=BOE-A-2024-1234',
            },
            pdf: {
              type: 'string',
            },
            fecha: {
              type: 'string',
              example: '2024-01-10',
            },
            tipo: {
              type: 'string',
              example: 'disposicion',
            },
          },
        },
        LegislacionCENDOJ: {
          type: 'object',
          properties: {
            id: {
              type: 'string',
              example: 'STS-123-2024',
            },
            numeroResolucion: {
              type: 'string',
              example: 'STS 123/2024',
            },
            titulo: {
              type: 'string',
            },
            fecha: {
              type: 'string',
            },
            organo: {
              type: 'string',
              example: 'Tribunal Supremo',
            },
            tipoResolucion: {
              type: 'string',
              enum: ['Sentencia', 'Auto', 'Decreto', 'Providencia'],
            },
            url: {
              type: 'string',
            },
          },
        },
      },
    },
    security: [
      {
        bearerAuth: [],
      },
    ],
  },
  // Ruta a los archivos que contienen anotaciones JSDoc
  apis: [
    './src/routes/*.ts',
    './src/dtos/*.ts',
  ],
};

const specs = swaggerJsdoc(options);

export function setupSwagger(app: Application): void {
  // Ruta para la documentación UI
  app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(specs, {
    explorer: true,
    customCss: '.swagger-ui .topbar { display: none }',
    customSiteTitle: 'ERP Derecho API Documentation',
    customfavIcon: '/favicon.ico',
  }));

  // Ruta para obtener el JSON de la especificación
  app.get('/api-docs.json', (req, res) => {
    res.setHeader('Content-Type', 'application/json');
    res.send(specs);
  });

  console.log('📚 Swagger UI disponible en: http://localhost:3000/api-docs');
  console.log('📄 OpenAPI JSON disponible en: http://localhost:3000/api-docs.json');
}

export { specs };

import { Router, Response } from 'express';
import { validate } from 'class-validator';
import { plainToInstance } from 'class-transformer';
import { authMiddleware, AuthRequest } from '../middleware/auth';
import { prediccionService } from '../services/prediccion.service';
import {
  CreatePrediccionDto,
  QueryPrediccionDto,
  QueryCasosSimilaresDto,
  QueryTendenciaDto,
} from '../dtos/prediccion.dto';

const router = Router();

function formatResponse<T>(data: T, meta?: any) {
  const response: any = { success: true, data };
  if (meta) {
    response.meta = meta;
  }
  return response;
}

// Crear predicción individual con IA
router.post('/caso', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const dto = plainToInstance(CreatePrediccionDto, req.body);
    const errors = await validate(dto);
    if (errors.length > 0) {
      res.status(400).json({ success: false, error: { message: 'Validation failed', details: errors } });
      return;
    }

    const prediccion = await prediccionService.create(req.user!.id, {
      expedienteId: dto.expedienteId,
      tipoPrediccion: dto.tipoPrediccion,
    });

    res.status(201).json(formatResponse({
      ...prediccion,
      modelo: 'OPENAI_GPT',
      nota: 'Predicción generada por IA basada en análisis del caso.',
    }));
  } catch (error: any) {
    console.error('Create prediccion error:', error);
    const statusCode = error.statusCode || 500;
    const message = error.message || 'Internal server error';
    res.status(statusCode).json({ 
      success: false, 
      error: { 
        code: error.code || 'INTERNAL_ERROR', 
        message 
      } 
    });
  }
});

// Crear análisis completo del caso con IA
router.post('/caso/:expedienteId/analisis-completo', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const { expedienteId } = req.params;

    const resultado = await prediccionService.createAnalisisCompleto(req.user!.id, expedienteId);

    res.status(201).json(formatResponse({
      ...resultado,
      modelo: 'OPENAI_GPT',
      nota: 'Análisis completo generado por IA incluyendo predicciones, estrategia y recomendaciones.',
    }));
  } catch (error: any) {
    console.error('Analisis completo error:', error);
    const statusCode = error.statusCode || 500;
    const message = error.message || 'Internal server error';
    res.status(statusCode).json({ 
      success: false, 
      error: { 
        code: error.code || 'INTERNAL_ERROR', 
        message 
      } 
    });
  }
});

// Analizar sentimiento de un lead
router.post('/lead/:leadId/sentimiento', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const { leadId } = req.params;

    const resultado = await prediccionService.analizarSentimientoLead(leadId);

    res.json(formatResponse({
      ...resultado,
      modelo: 'OPENAI_GPT',
      nota: 'Análisis de sentimiento generado por IA.',
    }));
  } catch (error: any) {
    console.error('Analizar sentimiento error:', error);
    const statusCode = error.statusCode || 500;
    const message = error.message || 'Internal server error';
    res.status(statusCode).json({ 
      success: false, 
      error: { 
        code: error.code || 'INTERNAL_ERROR', 
        message 
      } 
    });
  }
});

// Obtener predicciones de un expediente
router.get('/caso/:expedienteId', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const { expedienteId } = req.params;
    const dto = plainToInstance(QueryPrediccionDto, req.query as any);

    const resultado = await prediccionService.findByExpediente(expedienteId);

    res.json(formatResponse(resultado));
  } catch (error: any) {
    console.error('Get predicciones error:', error);
    const statusCode = error.statusCode || 500;
    const message = error.message || 'Internal server error';
    res.status(statusCode).json({ 
      success: false, 
      error: { 
        code: error.code || 'INTERNAL_ERROR', 
        message 
      } 
    });
  }
});

// Listar todas las predicciones con paginación
router.get('/', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const dto = plainToInstance(QueryPrediccionDto, req.query as any);

    const resultado = await prediccionService.findAll({
      page: dto.page || 1,
      limit: dto.limit || 20,
      tipo: dto.tipo,
      expediente_id: dto.expediente_id,
    });

    res.json(formatResponse(resultado.data, resultado.meta));
  } catch (error: any) {
    console.error('List predicciones error:', error);
    const statusCode = error.statusCode || 500;
    const message = error.message || 'Internal server error';
    res.status(statusCode).json({ 
      success: false, 
      error: { 
        code: error.code || 'INTERNAL_ERROR', 
        message 
      } 
    });
  }
});

// Obtener una predicción por ID
router.get('/:id', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;

    const prediccion = await prediccionService.findById(id);

    res.json(formatResponse(prediccion));
  } catch (error: any) {
    console.error('Get prediccion error:', error);
    const statusCode = error.statusCode || 500;
    const message = error.message || 'Internal server error';
    res.status(statusCode).json({ 
      success: false, 
      error: { 
        code: error.code || 'INTERNAL_ERROR', 
        message 
      } 
    });
  }
});

// Obtener tendencias
router.get('/stats/tendencias', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const { tipo, meses } = req.query;

    const resultado = await prediccionService.getTendencias({
      tipo: tipo as string,
      meses: meses ? parseInt(meses as string) : undefined,
    });

    res.json(formatResponse(resultado));
  } catch (error: any) {
    console.error('Get tendencias error:', error);
    const statusCode = error.statusCode || 500;
    const message = error.message || 'Internal server error';
    res.status(statusCode).json({ 
      success: false, 
      error: { 
        code: error.code || 'INTERNAL_ERROR', 
        message 
      } 
    });
  }
});

// Obtener casos similares
router.get('/casos-similares/:expedienteId', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const { expedienteId } = req.params;
    const { limite } = req.query;

    const resultado = await prediccionService.getCasosSimilares({
      expedienteId,
      limite: limite ? parseInt(limite as string) : undefined,
    });

    res.json(formatResponse({
      expedienteReferencia: expedienteId,
      casosSimilares: resultado,
      nota: 'Casos similares basados en tipo y características.',
    }));
  } catch (error: any) {
    console.error('Get casos similares error:', error);
    const statusCode = error.statusCode || 500;
    const message = error.message || 'Internal server error';
    res.status(statusCode).json({ 
      success: false, 
      error: { 
        code: error.code || 'INTERNAL_ERROR', 
        message 
      } 
    });
  }
});

// Dashboard de predicciones
router.get('/stats/dashboard', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const resultado = await prediccionService.getEstadisticas(req.user!.id);

    res.json(formatResponse({
      ...resultado,
      generado: new Date().toISOString(),
    }));
  } catch (error: any) {
    console.error('Get dashboard error:', error);
    const statusCode = error.statusCode || 500;
    const message = error.message || 'Internal server error';
    res.status(statusCode).json({ 
      success: false, 
      error: { 
        code: error.code || 'INTERNAL_ERROR', 
        message 
      } 
    });
  }
});

// Eliminar predicción
router.delete('/:id', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;

    await prediccionService.delete(id);

    res.json(formatResponse({ message: 'Predicción eliminada correctamente' }));
  } catch (error: any) {
    console.error('Delete prediccion error:', error);
    const statusCode = error.statusCode || 500;
    const message = error.message || 'Internal server error';
    res.status(statusCode).json({ 
      success: false, 
      error: { 
        code: error.code || 'INTERNAL_ERROR', 
        message 
      } 
    });
  }
});

export default router;

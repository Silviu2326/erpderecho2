import { Router, Response } from 'express';
import { validate } from 'class-validator';
import { plainToInstance } from 'class-transformer';
import { authMiddleware, AuthRequest } from '../middleware/auth';
import { documentoService } from '../services/documento.service';
import {
  CreateDocumentoDto,
  UpdateDocumentoDto,
  QueryDocumentoDto,
} from '../dtos/documento.dto';
import * as fs from 'fs';
import * as path from 'path';

const router = Router();

function formatResponse<T>(data: T, meta?: any) {
  const response: any = { success: true, data };
  if (meta) {
    response.meta = meta;
  }
  return response;
}

// Listar documentos
router.get('/', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const dto = plainToInstance(QueryDocumentoDto, req.query as any);
    const errors = await validate(dto);
    if (errors.length > 0) {
      res.status(400).json({ success: false, error: { message: 'Validation failed', details: errors } });
      return;
    }

    const resultado = await documentoService.findAll({
      page: dto.page || 1,
      limit: dto.limit || 20,
      sort: dto.sort || 'createdAt',
      order: dto.order || 'desc',
      search: dto.search,
      expediente_id: dto.expediente_id,
      tipo: dto.tipo,
    });

    res.json(formatResponse(resultado.data, resultado.meta));
  } catch (error: any) {
    console.error('List documentos error:', error);
    res.status(error.statusCode || 500).json({ 
      success: false, 
      error: { 
        code: error.code || 'INTERNAL_ERROR', 
        message: error.message || 'Internal server error' 
      } 
    });
  }
});

// Crear documento
router.post('/', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const dto = plainToInstance(CreateDocumentoDto, req.body);
    const errors = await validate(dto);
    if (errors.length > 0) {
      res.status(400).json({ success: false, error: { message: 'Validation failed', details: errors } });
      return;
    }

    const documento = await documentoService.create(dto, req.user!.id);

    res.status(201).json(formatResponse(documento));
  } catch (error: any) {
    console.error('Create documento error:', error);
    res.status(error.statusCode || 500).json({ 
      success: false, 
      error: { 
        code: error.code || 'INTERNAL_ERROR', 
        message: error.message || 'Internal server error' 
      } 
    });
  }
});

// Obtener documento por ID
router.get('/:id', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;

    const documento = await documentoService.findById(id);

    res.json(formatResponse(documento));
  } catch (error: any) {
    console.error('Get documento error:', error);
    res.status(error.statusCode || 500).json({ 
      success: false, 
      error: { 
        code: error.code || 'INTERNAL_ERROR', 
        message: error.message || 'Internal server error' 
      } 
    });
  }
});

// Actualizar documento
router.put('/:id', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const dto = plainToInstance(UpdateDocumentoDto, req.body);
    const errors = await validate(dto);
    if (errors.length > 0) {
      res.status(400).json({ success: false, error: { message: 'Validation failed', details: errors } });
      return;
    }

    const documento = await documentoService.update(id, dto);

    res.json(formatResponse(documento));
  } catch (error: any) {
    console.error('Update documento error:', error);
    res.status(error.statusCode || 500).json({ 
      success: false, 
      error: { 
        code: error.code || 'INTERNAL_ERROR', 
        message: error.message || 'Internal server error' 
      } 
    });
  }
});

// Eliminar documento
router.delete('/:id', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;

    await documentoService.delete(id);

    res.json(formatResponse({ message: 'Documento eliminado correctamente' }));
  } catch (error: any) {
    console.error('Delete documento error:', error);
    res.status(error.statusCode || 500).json({ 
      success: false, 
      error: { 
        code: error.code || 'INTERNAL_ERROR', 
        message: error.message || 'Internal server error' 
      } 
    });
  }
});

// Descargar documento
router.get('/:id/descargar', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;

    const { filePath, fileName } = await documentoService.download(id);

    res.download(filePath, fileName);
  } catch (error: any) {
    console.error('Download documento error:', error);
    res.status(error.statusCode || 500).json({ 
      success: false, 
      error: { 
        code: error.code || 'INTERNAL_ERROR', 
        message: error.message || 'Internal server error' 
      } 
    });
  }
});

// Procesar OCR de un documento
router.post('/:id/ocr', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;

    const resultado = await documentoService.processOcr(id);

    res.json(formatResponse(resultado));
  } catch (error: any) {
    console.error('OCR documento error:', error);
    res.status(error.statusCode || 500).json({ 
      success: false, 
      error: { 
        code: error.code || 'INTERNAL_ERROR', 
        message: error.message || 'Internal server error' 
      } 
    });
  }
});

// Procesar OCR en batch
router.post('/ocr/batch', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const { documentoIds } = req.body;

    if (!documentoIds || !Array.isArray(documentoIds) || documentoIds.length === 0) {
      res.status(400).json({ 
        success: false, 
        error: { message: 'documentoIds es requerido y debe ser un array' } 
      });
      return;
    }

    const resultado = await documentoService.batchOcr(documentoIds);

    res.json(formatResponse({
      procesados: resultado.results.length,
      fallidos: resultado.failed.length,
      idsFallidos: resultado.failed,
      message: `Procesados ${resultado.results.length} documentos, ${resultado.failed.length} fallidos`,
    }));
  } catch (error: any) {
    console.error('OCR batch error:', error);
    res.status(error.statusCode || 500).json({ 
      success: false, 
      error: { 
        code: error.code || 'INTERNAL_ERROR', 
        message: error.message || 'Internal server error' 
      } 
    });
  }
});

// Buscar en contenido de documentos
router.get('/search/contenido', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const { q, page, limit } = req.query;

    if (!q || typeof q !== 'string') {
      res.status(400).json({ 
        success: false, 
        error: { message: 'Parámetro q (query) es requerido' } 
      });
      return;
    }

    const resultado = await documentoService.searchByContent(q, {
      page: page ? parseInt(page as string) : 1,
      limit: limit ? parseInt(limit as string) : 20,
    });

    res.json(formatResponse(resultado.data, resultado.meta));
  } catch (error: any) {
    console.error('Search documentos error:', error);
    res.status(error.statusCode || 500).json({ 
      success: false, 
      error: { 
        code: error.code || 'INTERNAL_ERROR', 
        message: error.message || 'Internal server error' 
      } 
    });
  }
});

export default router;

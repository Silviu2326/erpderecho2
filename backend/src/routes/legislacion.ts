import { Router, Response } from 'express';
import { validate } from 'class-validator';
import { plainToInstance } from 'class-transformer';
import { authMiddleware, AuthRequest } from '../middleware/auth';
import { legislacionService } from '../services/legislacion.service';
import {
  QueryLegislacionDto,
  CreateFavoritoDto,
  QueryFavoritoDto,
  CreateAlertaDto,
  UpdateAlertaDto,
  QueryAlertaDto,
} from '../dtos/legislacion.dto';

const router = Router();

function formatResponse<T>(data: T, meta?: any) {
  const response: any = { success: true, data };
  if (meta) {
    response.meta = meta;
  }
  return response;
}

// Listar legislación de BD local
router.get('/', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const dto = plainToInstance(QueryLegislacionDto, req.query as any);
    const errors = await validate(dto);
    if (errors.length > 0) {
      res.status(400).json({ success: false, error: { message: 'Validation failed', details: errors } });
      return;
    }

    const resultado = await legislacionService.findAll({
      page: dto.page || 1,
      limit: dto.limit || 20,
      sort: dto.sort,
      order: dto.order,
      tipo: dto.tipo,
      search: dto.search,
      fuente: req.query.fuente as string,
    });

    res.json(formatResponse(resultado.data, resultado.meta));
  } catch (error: any) {
    console.error('List legislacion error:', error);
    res.status(error.statusCode || 500).json({ 
      success: false, 
      error: { 
        code: error.code || 'INTERNAL_ERROR',
        message: error.message || 'Internal server error' 
      } 
    });
  }
});

// Búsqueda externa (BOE y/o CENDOJ)
router.get('/buscar-externo', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const { fuente, q, fechaDesde, fechaHasta, sincronizar, limit } = req.query;

    if (!q) {
      res.status(400).json({ 
        success: false, 
        error: { message: 'Parámetro q (query) es requerido' } 
      });
      return;
    }

    const resultado = await legislacionService.busquedaExterna({
      fuente: (fuente as 'BOE' | 'CENDOJ' | 'TODAS') || 'TODAS',
      query: q as string,
      fechaDesde: fechaDesde as string,
      fechaHasta: fechaHasta as string,
      limit: limit ? parseInt(limit as string) : 10,
      sincronizar: sincronizar === 'true',
    });

    res.json(formatResponse(resultado));
  } catch (error: any) {
    console.error('Busqueda externa error:', error);
    res.status(error.statusCode || 500).json({ 
      success: false, 
      error: { 
        code: error.code || 'INTERNAL_ERROR',
        message: error.message || 'Internal server error' 
      } 
    });
  }
});

// Búsqueda específica en BOE
router.get('/boe/buscar', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const { q, sincronizar, limit } = req.query;

    if (!q) {
      res.status(400).json({ 
        success: false, 
        error: { message: 'Parámetro q (query) es requerido' } 
      });
      return;
    }

    const resultado = await legislacionService.searchBOE(
      q as string,
      sincronizar === 'true'
    );

    res.json(formatResponse(resultado.slice(0, limit ? parseInt(limit as string) : 20)));
  } catch (error: any) {
    console.error('BOE search error:', error);
    res.status(error.statusCode || 500).json({ 
      success: false, 
      error: { 
        code: error.code || 'INTERNAL_ERROR',
        message: error.message || 'Error al buscar en BOE' 
      } 
    });
  }
});

// Obtener documento específico de BOE
router.get('/boe/:id', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const resultado = await legislacionService.getBOEDocumento(id);
    res.json(formatResponse(resultado));
  } catch (error: any) {
    console.error('BOE get error:', error);
    res.status(error.statusCode || 500).json({ 
      success: false, 
      error: { 
        code: error.code || 'INTERNAL_ERROR',
        message: error.message || 'Error al obtener documento BOE' 
      } 
    });
  }
});

// Búsqueda específica en CENDOJ
router.get('/cendoj/buscar', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const { q, sincronizar, limit, page } = req.query;

    if (!q) {
      res.status(400).json({ 
        success: false, 
        error: { message: 'Parámetro q (query) es requerido' } 
      });
      return;
    }

    const resultado = await legislacionService.searchCENDOJ(
      q as string,
      sincronizar === 'true'
    );

    // Aplicar paginación manual si es necesario
    const pageNum = page ? parseInt(page as string) : 1;
    const limitNum = limit ? parseInt(limit as string) : 10;
    const start = (pageNum - 1) * limitNum;
    const paginatedResults = resultado.results.slice(start, start + limitNum);

    res.json(formatResponse(paginatedResults, {
      page: pageNum,
      limit: limitNum,
      total: resultado.total,
      totalPages: Math.ceil(resultado.total / limitNum),
    }));
  } catch (error: any) {
    console.error('CENDOJ search error:', error);
    res.status(error.statusCode || 500).json({ 
      success: false, 
      error: { 
        code: error.code || 'INTERNAL_ERROR',
        message: error.message || 'Error al buscar en CENDOJ' 
      } 
    });
  }
});

// Obtener sentencia específica de CENDOJ
router.get('/cendoj/:id', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const resultado = await legislacionService.getCENDOJSentencia(id);
    res.json(formatResponse(resultado));
  } catch (error: any) {
    console.error('CENDOJ get error:', error);
    res.status(error.statusCode || 500).json({ 
      success: false, 
      error: { 
        code: error.code || 'INTERNAL_ERROR',
        message: error.message || 'Error al obtener sentencia CENDOJ' 
      } 
    });
  }
});

// Sincronización masiva
router.post('/sincronizar', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const { dias } = req.body;
    const resultado = await legislacionService.sincronizarFuentesExternas(dias || 7);
    res.json(formatResponse(resultado));
  } catch (error: any) {
    console.error('Sincronizar error:', error);
    res.status(error.statusCode || 500).json({ 
      success: false, 
      error: { 
        code: error.code || 'INTERNAL_ERROR',
        message: error.message || 'Error al sincronizar' 
      } 
    });
  }
});

// Novedades (últimas publicaciones)
router.get('/novedades', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const { page = 1, limit = 20 } = req.query;

    // Obtener últimas entradas de BOE y CENDOJ
    const [boeResults, cendojResults] = await Promise.all([
      legislacionService.searchBOE('', false).catch(() => []),
      legislacionService.searchCENDOJ('', false).catch(() => ({ results: [], total: 0 })),
    ]);

    const allResults = [
      ...boeResults.map((r: any) => ({ ...r, origen: 'BOE' })),
      ...cendojResults.results.map((r: any) => ({ ...r, origen: 'CENDOJ' })),
    ];

    allResults.sort(
      (a, b) => new Date(b.fecha || b.fechaPublicacion).getTime() - new Date(a.fecha || a.fechaPublicacion).getTime()
    );

    const skip = (Number(page) - 1) * Number(limit);
    const paginatedResults = allResults.slice(skip, skip + Number(limit));

    res.json(
      formatResponse(paginatedResults, {
        page: Number(page),
        limit: Number(limit),
        total: allResults.length,
        totalPages: Math.ceil(allResults.length / Number(limit)),
      })
    );
  } catch (error: any) {
    console.error('Novedades error:', error);
    res.status(error.statusCode || 500).json({ 
      success: false, 
      error: { 
        code: error.code || 'INTERNAL_ERROR',
        message: error.message || 'Internal server error' 
      } 
    });
  }
});

// Favoritos
router.get('/favoritos', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const dto = plainToInstance(QueryFavoritoDto, req.query as any);
    const errors = await validate(dto);
    if (errors.length > 0) {
      res.status(400).json({ success: false, error: { message: 'Validation failed', details: errors } });
      return;
    }

    const resultado = await legislacionService.getFavoritos(req.user!.id, {
      page: dto.page || 1,
      limit: dto.limit || 20,
    });

    res.json(formatResponse(resultado.data, resultado.meta));
  } catch (error: any) {
    console.error('List favoritos error:', error);
    res.status(error.statusCode || 500).json({ 
      success: false, 
      error: { 
        code: error.code || 'INTERNAL_ERROR',
        message: error.message || 'Internal server error' 
      } 
    });
  }
});

router.post('/favoritos', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const dto = plainToInstance(CreateFavoritoDto, req.body);
    const errors = await validate(dto);
    if (errors.length > 0) {
      res.status(400).json({ success: false, error: { message: 'Validation failed', details: errors } });
      return;
    }

    const favorito = await legislacionService.addFavorito(req.user!.id, dto);
    res.status(201).json(formatResponse(favorito));
  } catch (error: any) {
    console.error('Create favorito error:', error);
    res.status(error.statusCode || 500).json({ 
      success: false, 
      error: { 
        code: error.code || 'INTERNAL_ERROR',
        message: error.message || 'Internal server error' 
      } 
    });
  }
});

router.delete('/favoritos/:legislacionId', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const { legislacionId } = req.params;
    await legislacionService.removeFavorito(req.user!.id, legislacionId);
    res.json(formatResponse({ message: 'Favorito eliminado correctamente' }));
  } catch (error: any) {
    console.error('Delete favorito error:', error);
    res.status(error.statusCode || 500).json({ 
      success: false, 
      error: { 
        code: error.code || 'INTERNAL_ERROR',
        message: error.message || 'Internal server error' 
      } 
    });
  }
});

// Alertas
router.get('/alertas', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const dto = plainToInstance(QueryAlertaDto, req.query as any);
    const errors = await validate(dto);
    if (errors.length > 0) {
      res.status(400).json({ success: false, error: { message: 'Validation failed', details: errors } });
      return;
    }

    const resultado = await legislacionService.getAlertas(req.user!.id, {
      page: dto.page || 1,
      limit: dto.limit || 20,
      activa: dto.activa,
    });

    res.json(formatResponse(resultado.data, resultado.meta));
  } catch (error: any) {
    console.error('List alertas error:', error);
    res.status(error.statusCode || 500).json({ 
      success: false, 
      error: { 
        code: error.code || 'INTERNAL_ERROR',
        message: error.message || 'Internal server error' 
      } 
    });
  }
});

router.post('/alertas', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const dto = plainToInstance(CreateAlertaDto, req.body);
    const errors = await validate(dto);
    if (errors.length > 0) {
      res.status(400).json({ success: false, error: { message: 'Validation failed', details: errors } });
      return;
    }

    const alerta = await legislacionService.createAlerta(req.user!.id, dto);
    res.status(201).json(formatResponse(alerta));
  } catch (error: any) {
    console.error('Create alerta error:', error);
    res.status(error.statusCode || 500).json({ 
      success: false, 
      error: { 
        code: error.code || 'INTERNAL_ERROR',
        message: error.message || 'Internal server error' 
      } 
    });
  }
});

router.put('/alertas/:id', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const dto = plainToInstance(UpdateAlertaDto, req.body);
    const errors = await validate(dto);
    if (errors.length > 0) {
      res.status(400).json({ success: false, error: { message: 'Validation failed', details: errors } });
      return;
    }

    const alerta = await legislacionService.updateAlerta(id, req.user!.id, dto);
    res.json(formatResponse(alerta));
  } catch (error: any) {
    console.error('Update alerta error:', error);
    res.status(error.statusCode || 500).json({ 
      success: false, 
      error: { 
        code: error.code || 'INTERNAL_ERROR',
        message: error.message || 'Internal server error' 
      } 
    });
  }
});

router.delete('/alertas/:id', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    await legislacionService.deleteAlerta(id, req.user!.id);
    res.json(formatResponse({ message: 'Alerta eliminada correctamente' }));
  } catch (error: any) {
    console.error('Delete alerta error:', error);
    res.status(error.statusCode || 500).json({ 
      success: false, 
      error: { 
        code: error.code || 'INTERNAL_ERROR',
        message: error.message || 'Internal server error' 
      } 
    });
  }
});

router.patch('/alertas/:id/toggle', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const alerta = await legislacionService.toggleAlerta(id, req.user!.id);
    res.json(formatResponse(alerta));
  } catch (error: any) {
    console.error('Toggle alerta error:', error);
    res.status(error.statusCode || 500).json({ 
      success: false, 
      error: { 
        code: error.code || 'INTERNAL_ERROR',
        message: error.message || 'Internal server error' 
      } 
    });
  }
});

// Verificar alertas (buscar nuevos resultados)
router.post('/alertas/verificar', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const resultado = await legislacionService.verificarAlertas(req.user!.id);
    res.json(formatResponse(resultado));
  } catch (error: any) {
    console.error('Verificar alertas error:', error);
    res.status(error.statusCode || 500).json({ 
      success: false, 
      error: { 
        code: error.code || 'INTERNAL_ERROR',
        message: error.message || 'Error al verificar alertas' 
      } 
    });
  }
});

export default router;

import { Router, Response } from 'express';
import { validate } from 'class-validator';
import { plainToInstance } from 'class-transformer';
import { prisma } from '../config/database';
import { authMiddleware, AuthRequest } from '../middleware/auth';
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

interface BOEResult {
  id: string;
  titulo: string;
  tipo: string;
  numero: string;
  url: string;
  fechaPublicacion: string;
  contenido?: string;
}

interface CendojResult {
  id: string;
  titulo: string;
  tipo: string;
  numero: string;
  url: string;
  fechaPublicacion: string;
  contenido?: string;
}

const mockBOEResults: BOEResult[] = [
  {
    id: 'boe-001',
    titulo: 'Ley 1/2024, de 9 de enero, de modificación de la Ley Concursal',
    tipo: 'LEY',
    numero: '1/2024',
    url: 'https://www.boe.es/boe/dias/2024/01/10/pdfs/BOE-A-2024-1234.pdf',
    fechaPublicacion: '2024-01-10',
    contenido: 'El objetivo de esta ley es simplificar los procedimientos de concursal...',
  },
  {
    id: 'boe-002',
    titulo: 'Real Decreto 123/2024, de 5 de febrero, por el que se aprueba el Reglamento de la Ley de Protección de Datos',
    tipo: 'REAL DECRETO',
    numero: '123/2024',
    url: 'https://www.boe.es/boe/dias/2024/02/06/pdfs/BOE-A-2024-2345.pdf',
    fechaPublicacion: '2024-02-06',
    contenido: 'Se aprueba el Reglamento de desarrollo de la Ley Orgánica 3/2018...',
  },
  {
    id: 'boe-003',
    titulo: 'Resolución de 15 de marzo de 2024, de la Dirección General del Registro y del Notariado',
    tipo: 'RESOLUCION',
    numero: 'RES/2024/03/15',
    url: 'https://www.boe.es/boe/dias/2024/03/16/pdfs/BOE-A-2024-3456.pdf',
    fechaPublicacion: '2024-03-16',
  },
  {
    id: 'boe-004',
    titulo: 'Ley 2/2024, de 20 de junio, por la que se modifica la Ley de Enjuiciamiento Civil',
    tipo: 'LEY',
    numero: '2/2024',
    url: 'https://www.boe.es/boe/dias/2024/06/21/pdfs/BOE-A-2024-4567.pdf',
    fechaPublicacion: '2024-06-21',
    contenido: 'Modificación de diversos artículos de la Ley de Enjuiciamiento Civil...',
  },
  {
    id: 'boe-005',
    titulo: 'Circular 1/2024, de 30 de julio, del Banco de España',
    tipo: 'CIRCULAR',
    numero: '1/2024',
    url: 'https://www.boe.es/boe/dias/2024/07/31/pdfs/BOE-A-2024-5678.pdf',
    fechaPublicacion: '2024-07-31',
  },
];

const mockCendojResults: CendojResult[] = [
  {
    id: 'cendoj-001',
    titulo: 'Sentencia 123/2024, de 15 de enero, de la Audiencia Provincial de Madrid',
    tipo: 'SENTENCIA',
    numero: '123/2024',
    url: 'https://www.poderjudicial.es/search/recursos/id/12345',
    fechaPublicacion: '2024-01-15',
    contenido: 'En la ciudad de Madrid, a quince de enero de dos mil veinticuatro...',
  },
  {
    id: 'cendoj-002',
    titulo: 'Auto 456/2024, de 22 de febrero, del Tribunal Supremo',
    tipo: 'AUTO',
    numero: '456/2024',
    url: 'https://www.poderjudicial.es/search/recursos/id/23456',
    fechaPublicacion: '2024-02-22',
  },
  {
    id: 'cendoj-003',
    titulo: 'Sentencia 789/2024, de 10 de marzo, del Tribunal Superior de Justicia de Cataluña',
    tipo: 'SENTENCIA',
    numero: '789/2024',
    url: 'https://www.poderjudicial.es/search/recursos/id/34567',
    fechaPublicacion: '2024-03-10',
    contenido: 'Ponente: Ilmo. Sr. D. Juan García Martínez...',
  },
  {
    id: 'cendoj-004',
    titulo: 'Decreto 234/2024, de 5 de abril, del Juzgado de Primera Instancia número 5 de Valencia',
    tipo: 'DECRETO',
    numero: '234/2024',
    url: 'https://www.poderjudicial.es/search/recursos/id/45678',
    fechaPublicacion: '2024-04-05',
  },
  {
    id: 'cendoj-005',
    titulo: 'Sentencia 567/2024, de 20 de mayo, de la Audiencia Provincial de Barcelona',
    tipo: 'SENTENCIA',
    numero: '567/2024',
    url: 'https://www.poderjudicial.es/search/recursos/id/56789',
    fechaPublicacion: '2024-05-20',
    contenido: 'En el procedimiento ordinario número 1234/2023...',
  },
];

router.get('/boe/buscar', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const { search, tipo, page = 1, limit = 20 } = req.query;

    let results = [...mockBOEResults];

    if (search) {
      const searchLower = (search as string).toLowerCase();
      results = results.filter(
        (r) =>
          r.titulo.toLowerCase().includes(searchLower) ||
          r.numero.toLowerCase().includes(searchLower) ||
          r.contenido?.toLowerCase().includes(searchLower)
      );
    }

    if (tipo) {
      results = results.filter((r) => r.tipo.toLowerCase() === (tipo as string).toLowerCase());
    }

    const skip = (Number(page) - 1) * Number(limit);
    const paginatedResults = results.slice(skip, skip + Number(limit));

    res.json(
      formatResponse(paginatedResults, {
        page: Number(page),
        limit: Number(limit),
        total: results.length,
        totalPages: Math.ceil(results.length / Number(limit)),
      })
    );
  } catch (error) {
    console.error('BOE search error:', error);
    res.status(500).json({ success: false, error: { message: 'Internal server error' } });
  }
});

router.get('/boe/:id', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const result = mockBOEResults.find((r) => r.id === id);

    if (!result) {
      res.status(404).json({ success: false, error: { code: 'LEGISLACION_NOT_FOUND', message: 'Legislación BOE no encontrada' } });
      return;
    }

    res.json(formatResponse(result));
  } catch (error) {
    console.error('BOE get error:', error);
    res.status(500).json({ success: false, error: { message: 'Internal server error' } });
  }
});

router.get('/cendoj/buscar', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const { search, tipo, page = 1, limit = 20 } = req.query;

    let results = [...mockCendojResults];

    if (search) {
      const searchLower = (search as string).toLowerCase();
      results = results.filter(
        (r) =>
          r.titulo.toLowerCase().includes(searchLower) ||
          r.numero.toLowerCase().includes(searchLower) ||
          r.contenido?.toLowerCase().includes(searchLower)
      );
    }

    if (tipo) {
      results = results.filter((r) => r.tipo.toLowerCase() === (tipo as string).toLowerCase());
    }

    const skip = (Number(page) - 1) * Number(limit);
    const paginatedResults = results.slice(skip, skip + Number(limit));

    res.json(
      formatResponse(paginatedResults, {
        page: Number(page),
        limit: Number(limit),
        total: results.length,
        totalPages: Math.ceil(results.length / Number(limit)),
      })
    );
  } catch (error) {
    console.error('Cendoj search error:', error);
    res.status(500).json({ success: false, error: { message: 'Internal server error' } });
  }
});

router.get('/cendoj/:id', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const result = mockCendojResults.find((r) => r.id === id);

    if (!result) {
      res.status(404).json({ success: false, error: { code: 'LEGISLACION_NOT_FOUND', message: 'Legislación Cendoj no encontrada' } });
      return;
    }

    res.json(formatResponse(result));
  } catch (error) {
    console.error('Cendoj get error:', error);
    res.status(500).json({ success: false, error: { message: 'Internal server error' } });
  }
});

router.get('/novedades', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const { page = 1, limit = 20 } = req.query;

    const allResults = [
      ...mockBOEResults.map((r) => ({ ...r, origen: 'BOE' })),
      ...mockCendojResults.map((r) => ({ ...r, origen: 'Cendoj' })),
    ];

    allResults.sort(
      (a, b) => new Date(b.fechaPublicacion).getTime() - new Date(a.fechaPublicacion).getTime()
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
  } catch (error) {
    console.error('Novedades error:', error);
    res.status(500).json({ success: false, error: { message: 'Internal server error' } });
  }
});

router.get('/favoritos', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const dto = plainToInstance(QueryFavoritoDto, req.query as any);
    const errors = await validate(dto);
    if (errors.length > 0) {
      res.status(400).json({ success: false, error: { message: 'Validation failed', details: errors } });
      return;
    }

    const { page = 1, limit = 20 } = dto;
    const skip = (page - 1) * limit;

    const userId = req.user!.id;

    const [favoritos, total] = await Promise.all([
      prisma.favorito.findMany({
        where: {
          usuarioId: userId,
          deletedAt: null,
        },
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          legislacion: true,
        },
      }),
      prisma.favorito.count({
        where: {
          usuarioId: userId,
          deletedAt: null,
        },
      }),
    ]);

    res.json(
      formatResponse(
        favoritos.map((f) => ({
          id: f.id,
          legislacion: f.legislacion,
          createdAt: f.createdAt,
        })),
        {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit),
        }
      )
    );
  } catch (error) {
    console.error('List favoritos error:', error);
    res.status(500).json({ success: false, error: { message: 'Internal server error' } });
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

    const userId = req.user!.id;

    const existingFavorite = await prisma.favorito.findFirst({
      where: {
        legislacionId: dto.legislacionId,
        usuarioId: userId,
        deletedAt: null,
      },
    });

    if (existingFavorite) {
      res.status(400).json({ success: false, error: { code: 'FAVORITO_EXISTS', message: 'El favorito ya existe' } });
      return;
    }

    const favorito = await prisma.favorito.create({
      data: {
        legislacionId: dto.legislacionId,
        usuarioId: userId,
      },
    });

    res.status(201).json(formatResponse(favorito));
  } catch (error) {
    console.error('Create favorito error:', error);
    res.status(500).json({ success: false, error: { message: 'Internal server error' } });
  }
});

router.delete('/favoritos', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const { legislacionId } = req.body;

    if (!legislacionId) {
      res.status(400).json({ success: false, error: { code: 'LEGISLACION_ID_REQUIRED', message: 'legislacionId es requerido' } });
      return;
    }

    const userId = req.user!.id;

    const existingFavorite = await prisma.favorito.findFirst({
      where: {
        legislacionId,
        usuarioId: userId,
        deletedAt: null,
      },
    });

    if (!existingFavorite) {
      res.status(404).json({ success: false, error: { code: 'FAVORITO_NOT_FOUND', message: 'Favorito no encontrado' } });
      return;
    }

    await prisma.favorito.update({
      where: { id: existingFavorite.id },
      data: { deletedAt: new Date() },
    });

    res.json(formatResponse({ message: 'Favorito eliminado correctamente' }));
  } catch (error) {
    console.error('Delete favorito error:', error);
    res.status(500).json({ success: false, error: { message: 'Internal server error' } });
  }
});

router.get('/alertas', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const dto = plainToInstance(QueryAlertaDto, req.query as any);
    const errors = await validate(dto);
    if (errors.length > 0) {
      res.status(400).json({ success: false, error: { message: 'Validation failed', details: errors } });
      return;
    }

    const { page = 1, limit = 20, activa } = dto;
    const skip = (page - 1) * limit;

    const userId = req.user!.id;

    const where: any = {
      usuarioId: userId,
      deletedAt: null,
    };

    if (activa !== undefined) {
      where.activa = activa;
    }

    const [alertas, total] = await Promise.all([
      prisma.alerta.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      prisma.alerta.count({ where }),
    ]);

    res.json(
      formatResponse(alertas, {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      })
    );
  } catch (error) {
    console.error('List alertas error:', error);
    res.status(500).json({ success: false, error: { message: 'Internal server error' } });
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

    const userId = req.user!.id;

    const alerta = await prisma.alerta.create({
      data: {
        palabrasClave: dto.palabrasClave,
        tipo: dto.tipo,
        activa: dto.activa ?? true,
        usuarioId: userId,
      },
    });

    res.status(201).json(formatResponse(alerta));
  } catch (error) {
    console.error('Create alerta error:', error);
    res.status(500).json({ success: false, error: { message: 'Internal server error' } });
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

    const userId = req.user!.id;

    const existingAlerta = await prisma.alerta.findFirst({
      where: { id, usuarioId: userId, deletedAt: null },
    });

    if (!existingAlerta) {
      res.status(404).json({ success: false, error: { code: 'ALERTA_NOT_FOUND', message: 'Alerta no encontrada' } });
      return;
    }

    const alerta = await prisma.alerta.update({
      where: { id },
      data: {
        ...(dto.palabrasClave && { palabrasClave: dto.palabrasClave }),
        ...(dto.tipo && { tipo: dto.tipo }),
        ...(dto.activa !== undefined && { activa: dto.activa }),
      },
    });

    res.json(formatResponse(alerta));
  } catch (error) {
    console.error('Update alerta error:', error);
    res.status(500).json({ success: false, error: { message: 'Internal server error' } });
  }
});

router.delete('/alertas/:id', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const userId = req.user!.id;

    const existingAlerta = await prisma.alerta.findFirst({
      where: { id, usuarioId: userId, deletedAt: null },
    });

    if (!existingAlerta) {
      res.status(404).json({ success: false, error: { code: 'ALERTA_NOT_FOUND', message: 'Alerta no encontrada' } });
      return;
    }

    await prisma.alerta.update({
      where: { id },
      data: { deletedAt: new Date() },
    });

    res.json(formatResponse({ message: 'Alerta eliminada correctamente' }));
  } catch (error) {
    console.error('Delete alerta error:', error);
    res.status(500).json({ success: false, error: { message: 'Internal server error' } });
  }
});

export default router;

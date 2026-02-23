import { Router, Response } from 'express';
import { validate } from 'class-validator';
import { plainToInstance } from 'class-transformer';
import { prisma } from '../config/database';
import { authMiddleware, AuthRequest } from '../middleware/auth';
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

router.get('/', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const dto = plainToInstance(QueryDocumentoDto, req.query as any);
    const errors = await validate(dto);
    if (errors.length > 0) {
      res.status(400).json({ success: false, error: { message: 'Validation failed', details: errors } });
      return;
    }

    const { page = 1, limit = 20, sort = 'createdAt', order = 'desc', search, expediente_id, tipo } = dto;
    const skip = (page - 1) * limit;

    const where: any = {
      deletedAt: null,
    };

    if (expediente_id) {
      where.expedienteId = expediente_id;
    }

    if (tipo) {
      where.tipo = tipo;
    }

    if (search) {
      where.OR = [
        { nombre: { contains: search, mode: 'insensitive' } },
        { tipo: { contains: search, mode: 'insensitive' } },
      ];
    }

    const [documentos, total] = await Promise.all([
      prisma.documento.findMany({
        where,
        skip,
        take: limit,
        orderBy: { [sort]: order },
        select: {
          id: true,
          nombre: true,
          tipo: true,
          tamano: true,
          ruta: true,
          mimeType: true,
          expedienteId: true,
          usuarioId: true,
          createdAt: true,
          updatedAt: true,
          expediente: {
            select: {
              id: true,
              numeroExpediente: true,
            },
          },
        },
      }),
      prisma.documento.count({ where }),
    ]);

    res.json(formatResponse(documentos, {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    }));
  } catch (error) {
    console.error('List documentos error:', error);
    res.status(500).json({ success: false, error: { message: 'Internal server error' } });
  }
});

router.post('/', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const dto = plainToInstance(CreateDocumentoDto, req.body);
    const errors = await validate(dto);
    if (errors.length > 0) {
      res.status(400).json({ success: false, error: { message: 'Validation failed', details: errors } });
      return;
    }

    const documento = await prisma.documento.create({
      data: {
        ...dto,
        usuarioId: req.user?.id,
      },
    });

    res.status(201).json(formatResponse(documento));
  } catch (error) {
    console.error('Create documento error:', error);
    res.status(500).json({ success: false, error: { message: 'Internal server error' } });
  }
});

router.get('/:id', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;

    const documento = await prisma.documento.findFirst({
      where: { id, deletedAt: null },
      include: {
        expediente: {
          select: {
            id: true,
            numeroExpediente: true,
            tipo: true,
          },
        },
        usuario: {
          select: {
            id: true,
            nombre: true,
            apellido1: true,
          },
        },
      },
    });

    if (!documento) {
      res.status(404).json({ success: false, error: { code: 'DOCUMENTO_NOT_FOUND', message: 'Documento no encontrado' } });
      return;
    }

    res.json(formatResponse(documento));
  } catch (error) {
    console.error('Get documento error:', error);
    res.status(500).json({ success: false, error: { message: 'Internal server error' } });
  }
});

router.put('/:id', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const dto = plainToInstance(UpdateDocumentoDto, req.body);
    const errors = await validate(dto);
    if (errors.length > 0) {
      res.status(400).json({ success: false, error: { message: 'Validation failed', details: errors } });
      return;
    }

    const existingDocumento = await prisma.documento.findFirst({
      where: { id, deletedAt: null },
    });

    if (!existingDocumento) {
      res.status(404).json({ success: false, error: { code: 'DOCUMENTO_NOT_FOUND', message: 'Documento no encontrado' } });
      return;
    }

    const documento = await prisma.documento.update({
      where: { id },
      data: dto,
    });

    res.json(formatResponse(documento));
  } catch (error) {
    console.error('Update documento error:', error);
    res.status(500).json({ success: false, error: { message: 'Internal server error' } });
  }
});

router.delete('/:id', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;

    const existingDocumento = await prisma.documento.findFirst({
      where: { id, deletedAt: null },
    });

    if (!existingDocumento) {
      res.status(404).json({ success: false, error: { code: 'DOCUMENTO_NOT_FOUND', message: 'Documento no encontrado' } });
      return;
    }

    await prisma.documento.update({
      where: { id },
      data: { deletedAt: new Date() },
    });

    res.json(formatResponse({ message: 'Documento eliminado correctamente' }));
  } catch (error) {
    console.error('Delete documento error:', error);
    res.status(500).json({ success: false, error: { message: 'Internal server error' } });
  }
});

router.get('/:id/descargar', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;

    const documento = await prisma.documento.findFirst({
      where: { id, deletedAt: null },
    });

    if (!documento) {
      res.status(404).json({ success: false, error: { code: 'DOCUMENTO_NOT_FOUND', message: 'Documento no encontrado' } });
      return;
    }

    const filePath = path.resolve(documento.ruta);

    if (!fs.existsSync(filePath)) {
      res.status(404).json({ success: false, error: { code: 'FILE_NOT_FOUND', message: 'Archivo no encontrado en el servidor' } });
      return;
    }

    res.download(filePath, documento.nombre);
  } catch (error) {
    console.error('Download documento error:', error);
    res.status(500).json({ success: false, error: { message: 'Internal server error' } });
  }
});

router.post('/ocr', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const { documentoId } = req.body;

    if (!documentoId) {
      res.status(400).json({ success: false, error: { message: 'documentoId es requerido' } });
      return;
    }

    const documento = await prisma.documento.findFirst({
      where: { id: documentoId, deletedAt: null },
    });

    if (!documento) {
      res.status(404).json({ success: false, error: { code: 'DOCUMENTO_NOT_FOUND', message: 'Documento no encontrado' } });
      return;
    }

    const filePath = path.resolve(documento.ruta);

    if (!fs.existsSync(filePath)) {
      res.status(404).json({ success: false, error: { code: 'FILE_NOT_FOUND', message: 'Archivo no encontrado en el servidor' } });
      return;
    }

    res.json(formatResponse({
      message: 'OCR processing not implemented',
      documentoId,
    }));
  } catch (error) {
    console.error('OCR documento error:', error);
    res.status(500).json({ success: false, error: { message: 'Internal server error' } });
  }
});

export default router;

import { Router, Response } from 'express';
import { validate } from 'class-validator';
import { plainToInstance } from 'class-transformer';
import { prisma } from '../config/database';
import { authMiddleware, AuthRequest } from '../middleware/auth';
import {
  CreateClienteDto,
  UpdateClienteDto,
  QueryClienteDto,
  CreateContactoDto,
} from '../dtos/cliente.dto';

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
    const dto = plainToInstance(QueryClienteDto, req.query as any);
    const errors = await validate(dto);
    if (errors.length > 0) {
      res.status(400).json({ success: false, error: { message: 'Validation failed', details: errors } });
      return;
    }

    const { page = 1, limit = 20, sort = 'createdAt', order = 'desc', search } = dto;
    const skip = (page - 1) * limit;

    const where: any = {
      deletedAt: null,
    };

    if (search) {
      where.OR = [
        { nombre: { contains: search, mode: 'insensitive' } },
        { cif: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
        { ciudad: { contains: search, mode: 'insensitive' } },
      ];
    }

    const [clientes, total] = await Promise.all([
      prisma.cliente.findMany({
        where,
        skip,
        take: limit,
        orderBy: { [sort]: order },
        select: {
          id: true,
          nombre: true,
          cif: true,
          email: true,
          telefono: true,
          direccion: true,
          codigoPostal: true,
          ciudad: true,
          provincia: true,
          pais: true,
          observaciones: true,
          createdAt: true,
          updatedAt: true,
        },
      }),
      prisma.cliente.count({ where }),
    ]);

    res.json(formatResponse(clientes, {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    }));
  } catch (error) {
    console.error('List clientes error:', error);
    res.status(500).json({ success: false, error: { message: 'Internal server error' } });
  }
});

router.post('/', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const dto = plainToInstance(CreateClienteDto, req.body);
    const errors = await validate(dto);
    if (errors.length > 0) {
      res.status(400).json({ success: false, error: { message: 'Validation failed', details: errors } });
      return;
    }

    const cliente = await prisma.cliente.create({
      data: dto,
    });

    res.status(201).json(formatResponse(cliente));
  } catch (error) {
    console.error('Create cliente error:', error);
    if ((error as any).code === 'P2002') {
      res.status(409).json({ success: false, error: { code: 'CLIENTE_EXISTS', message: 'El CIF ya existe' } });
      return;
    }
    res.status(500).json({ success: false, error: { message: 'Internal server error' } });
  }
});

router.get('/buscar', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const { q } = req.query;
    if (!q || typeof q !== 'string') {
      res.status(400).json({ success: false, error: { message: 'Search query required' } });
      return;
    }

    const clientes = await prisma.cliente.findMany({
      where: {
        deletedAt: null,
        OR: [
          { nombre: { contains: q, mode: 'insensitive' } },
          { cif: { contains: q, mode: 'insensitive' } },
          { email: { contains: q, mode: 'insensitive' } },
        ],
      },
      take: 20,
      select: {
        id: true,
        nombre: true,
        cif: true,
        email: true,
        telefono: true,
      },
    });

    res.json(formatResponse(clientes));
  } catch (error) {
    console.error('Search clientes error:', error);
    res.status(500).json({ success: false, error: { message: 'Internal server error' } });
  }
});

router.get('/:id', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;

    const cliente = await prisma.cliente.findFirst({
      where: { id, deletedAt: null },
      include: {
        contactos: {
          select: {
            id: true,
            nombre: true,
            email: true,
            telefono: true,
            cargo: true,
            createdAt: true,
            updatedAt: true,
          },
        },
      },
    });

    if (!cliente) {
      res.status(404).json({ success: false, error: { code: 'CLIENTE_NOT_FOUND', message: 'Cliente no encontrado' } });
      return;
    }

    res.json(formatResponse(cliente));
  } catch (error) {
    console.error('Get cliente error:', error);
    res.status(500).json({ success: false, error: { message: 'Internal server error' } });
  }
});

router.put('/:id', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const dto = plainToInstance(UpdateClienteDto, req.body);
    const errors = await validate(dto);
    if (errors.length > 0) {
      res.status(400).json({ success: false, error: { message: 'Validation failed', details: errors } });
      return;
    }

    const existingCliente = await prisma.cliente.findFirst({
      where: { id, deletedAt: null },
    });

    if (!existingCliente) {
      res.status(404).json({ success: false, error: { code: 'CLIENTE_NOT_FOUND', message: 'Cliente no encontrado' } });
      return;
    }

    const cliente = await prisma.cliente.update({
      where: { id },
      data: dto,
    });

    res.json(formatResponse(cliente));
  } catch (error) {
    console.error('Update cliente error:', error);
    if ((error as any).code === 'P2002') {
      res.status(409).json({ success: false, error: { code: 'CLIENTE_EXISTS', message: 'El CIF ya existe' } });
      return;
    }
    res.status(500).json({ success: false, error: { message: 'Internal server error' } });
  }
});

router.delete('/:id', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;

    const existingCliente = await prisma.cliente.findFirst({
      where: { id, deletedAt: null },
    });

    if (!existingCliente) {
      res.status(404).json({ success: false, error: { code: 'CLIENTE_NOT_FOUND', message: 'Cliente no encontrado' } });
      return;
    }

    await prisma.cliente.update({
      where: { id },
      data: { deletedAt: new Date() },
    });

    res.json(formatResponse({ message: 'Cliente desactivado correctamente' }));
  } catch (error) {
    console.error('Delete cliente error:', error);
    res.status(500).json({ success: false, error: { message: 'Internal server error' } });
  }
});

router.get('/:id/expedientes', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { page = 1, limit = 20 } = req.query;

    const existingCliente = await prisma.cliente.findFirst({
      where: { id, deletedAt: null },
    });

    if (!existingCliente) {
      res.status(404).json({ success: false, error: { code: 'CLIENTE_NOT_FOUND', message: 'Cliente no encontrado' } });
      return;
    }

    const skip = (Number(page) - 1) * Number(limit);

    const [expedientes, total] = await Promise.all([
      prisma.expediente.findMany({
        where: { clienteId: id, deletedAt: null },
        skip,
        take: Number(limit),
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
          numeroExpediente: true,
          descripcion: true,
          tipo: true,
          estado: true,
          createdAt: true,
          updatedAt: true,
        },
      }),
      prisma.expediente.count({ where: { clienteId: id, deletedAt: null } }),
    ]);

    res.json(formatResponse(expedientes, {
      page: Number(page),
      limit: Number(limit),
      total,
      totalPages: Math.ceil(total / Number(limit)),
    }));
  } catch (error) {
    console.error('Get cliente expedientes error:', error);
    res.status(500).json({ success: false, error: { message: 'Internal server error' } });
  }
});

router.get('/:id/facturas', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { page = 1, limit = 20 } = req.query;

    const existingCliente = await prisma.cliente.findFirst({
      where: { id, deletedAt: null },
    });

    if (!existingCliente) {
      res.status(404).json({ success: false, error: { code: 'CLIENTE_NOT_FOUND', message: 'Cliente no encontrado' } });
      return;
    }

    const skip = (Number(page) - 1) * Number(limit);

    const [facturas, total] = await Promise.all([
      prisma.factura.findMany({
        where: { clienteId: id, deletedAt: null },
        skip,
        take: Number(limit),
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
          numero: true,
          concepto: true,
          importe: true,
          estado: true,
          createdAt: true,
          updatedAt: true,
        },
      }),
      prisma.factura.count({ where: { clienteId: id, deletedAt: null } }),
    ]);

    res.json(formatResponse(facturas, {
      page: Number(page),
      limit: Number(limit),
      total,
      totalPages: Math.ceil(total / Number(limit)),
    }));
  } catch (error) {
    console.error('Get cliente facturas error:', error);
    res.status(500).json({ success: false, error: { message: 'Internal server error' } });
  }
});

router.post('/:id/contactos', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const dto = plainToInstance(CreateContactoDto, req.body);
    const errors = await validate(dto);
    if (errors.length > 0) {
      res.status(400).json({ success: false, error: { message: 'Validation failed', details: errors } });
      return;
    }

    const existingCliente = await prisma.cliente.findFirst({
      where: { id, deletedAt: null },
    });

    if (!existingCliente) {
      res.status(404).json({ success: false, error: { code: 'CLIENTE_NOT_FOUND', message: 'Cliente no encontrado' } });
      return;
    }

    const contacto = await prisma.contacto.create({
      data: {
        ...dto,
        clienteId: id,
      },
    });

    res.status(201).json(formatResponse(contacto));
  } catch (error) {
    console.error('Create contacto error:', error);
    res.status(500).json({ success: false, error: { message: 'Internal server error' } });
  }
});

export default router;

import { prisma } from '../config/database';
import { ServiceException, PaginationParams, PaginatedResult } from './base.types';

export interface CreateClienteInput {
  nombre: string;
  cif: string;
  email?: string;
  telefono?: string;
  direccion?: string;
  codigoPostal?: string;
  ciudad?: string;
  provincia?: string;
  pais?: string;
  observaciones?: string;
}

export interface UpdateClienteInput {
  nombre?: string;
  cif?: string;
  email?: string;
  telefono?: string;
  direccion?: string;
  codigoPostal?: string;
  ciudad?: string;
  provincia?: string;
  pais?: string;
  observaciones?: string;
}

export interface QueryClienteParams extends PaginationParams {
  search?: string;
}

const clienteSelect = {
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
};

class ClienteService {
  async findAll(params: QueryClienteParams): Promise<PaginatedResult<any>> {
    const { page = 1, limit = 20, sort = 'createdAt', order = 'desc', search } = params;
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
        select: clienteSelect,
      }),
      prisma.cliente.count({ where }),
    ]);

    return {
      data: clientes,
      meta: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async findById(id: string): Promise<any> {
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
      throw new ServiceException('CLIENTE_NOT_FOUND', 'Cliente no encontrado', 404);
    }

    return cliente;
  }

  async getFacturas(clienteId: string, page: number = 1, limit: number = 20): Promise<PaginatedResult<any>> {
    const existingCliente = await prisma.cliente.findFirst({
      where: { id: clienteId, deletedAt: null },
    });

    if (!existingCliente) {
      throw new ServiceException('CLIENTE_NOT_FOUND', 'Cliente no encontrado', 404);
    }

    const skip = (page - 1) * limit;

    const [facturas, total] = await Promise.all([
      prisma.factura.findMany({
        where: { clienteId, deletedAt: null },
        skip,
        take: limit,
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
      prisma.factura.count({ where: { clienteId, deletedAt: null } }),
    ]);

    return {
      data: facturas,
      meta: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async createContacto(clienteId: string, input: any): Promise<any> {
    const existingCliente = await prisma.cliente.findFirst({
      where: { id: clienteId, deletedAt: null },
    });

    if (!existingCliente) {
      throw new ServiceException('CLIENTE_NOT_FOUND', 'Cliente no encontrado', 404);
    }

    const contacto = await prisma.contacto.create({
      data: {
        ...input,
        clienteId,
      } as any,
    });

    return contacto;
  }
}

export const clienteService = new ClienteService();

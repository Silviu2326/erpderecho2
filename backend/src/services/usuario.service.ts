import bcrypt from 'bcryptjs';
import { prisma } from '../config/database';
import { ServiceException, PaginationParams, PaginatedResult } from './base.types';

export interface CreateUsuarioInput {
  email: string;
  password: string;
  nombre: string;
  apellido1: string;
  apellido2?: string;
  rol?: string;
  especialidad?: string;
  numeroColegiado?: string;
  telefono?: string;
  avatarUrl?: string;
  idioma?: string;
  moneda?: string;
}

export interface UpdateUsuarioInput {
  nombre?: string;
  apellido1?: string;
  apellido2?: string;
  rol?: string;
  especialidad?: string;
  numeroColegiado?: string;
  telefono?: string;
  avatarUrl?: string;
  idioma?: string;
  moneda?: string;
}

export interface QueryUsuarioParams extends PaginationParams {
  search?: string;
  rol?: string;
  activo?: boolean;
}

const usuarioSelect = {
  id: true,
  email: true,
  nombre: true,
  apellido1: true,
  apellido2: true,
  rol: true,
  especialidad: true,
  numeroColegiado: true,
  telefono: true,
  avatarUrl: true,
  idioma: true,
  moneda: true,
  activo: true,
  ultimoAcceso: true,
  createdAt: true,
  updatedAt: true,
};

class UsuarioService {
  async findAll(params: QueryUsuarioParams): Promise<PaginatedResult<any>> {
    const { page = 1, limit = 20, sort = 'createdAt', order = 'desc', search, rol, activo } = params;
    const skip = (page - 1) * limit;

    const where: any = {
      deletedAt: null,
    };

    if (search) {
      where.OR = [
        { nombre: { contains: search, mode: 'insensitive' } },
        { apellido1: { contains: search, mode: 'insensitive' } },
        { apellido2: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
      ];
    }

    if (rol) {
      where.rol = rol;
    }

    if (activo !== undefined) {
      where.activo = activo;
    }

    const [usuarios, total] = await Promise.all([
      prisma.user.findMany({
        where,
        skip,
        take: limit,
        orderBy: { [sort]: order },
        select: usuarioSelect,
      }),
      prisma.user.count({ where }),
    ]);

    return {
      data: usuarios,
      meta: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async findById(id: string): Promise<any> {
    const user = await prisma.user.findFirst({
      where: { id, deletedAt: null },
      select: usuarioSelect,
    });

    if (!user) {
      throw new ServiceException('USER_NOT_FOUND', 'Usuario no encontrado', 404);
    }

    return user;
  }

  async create(input: CreateUsuarioInput): Promise<any> {
    const { email, password, nombre, apellido1, apellido2, rol, especialidad, numeroColegiado, telefono, avatarUrl, idioma, moneda } = input;

    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      throw new ServiceException('USER_EXISTS', 'El usuario ya existe', 409);
    }

    const passwordHash = await bcrypt.hash(password, 12);

    const user = await prisma.user.create({
      data: {
        email,
        password: passwordHash,
        nombre,
        apellido1,
        apellido2,
        rol: rol as any || 'abogado',
        especialidad,
        numeroColegiado,
        telefono,
        avatarUrl,
        idioma: idioma || 'es',
        moneda: moneda || 'EUR',
      },
    });

    return this.sanitizeUser(user);
  }

  async update(id: string, input: UpdateUsuarioInput): Promise<any> {
    const existingUser = await prisma.user.findFirst({
      where: { id, deletedAt: null },
    });

    if (!existingUser) {
      throw new ServiceException('USER_NOT_FOUND', 'Usuario no encontrado', 404);
    }

    const user = await prisma.user.update({
      where: { id },
      data: input as any,
    });

    return this.sanitizeUser(user);
  }

  async delete(id: string): Promise<void> {
    const existingUser = await prisma.user.findFirst({
      where: { id, deletedAt: null },
    });

    if (!existingUser) {
      throw new ServiceException('USER_NOT_FOUND', 'Usuario no encontrado', 404);
    }

    await prisma.user.update({
      where: { id },
      data: { activo: false, deletedAt: new Date() },
    });
  }

  async updateRoles(id: string, rol: string): Promise<any> {
    const existingUser = await prisma.user.findFirst({
      where: { id, deletedAt: null },
    });

    if (!existingUser) {
      throw new ServiceException('USER_NOT_FOUND', 'Usuario no encontrado', 404);
    }

    const user = await prisma.user.update({
      where: { id },
      data: { rol: rol as any },
    });

    return this.sanitizeUser(user);
  }

  private sanitizeUser(user: any) {
    const { password, ...rest } = user;
    return rest;
  }
}

export const usuarioService = new UsuarioService();

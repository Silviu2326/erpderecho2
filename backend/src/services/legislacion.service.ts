import { prisma } from '../config/database';
import { ServiceException, PaginationParams, PaginatedResult } from './base.types';

export interface QueryLegislacionParams extends PaginationParams {
  tipo?: string;
  search?: string;
}

export interface CreateFavoritoInput {
  legislacionId: string;
}

export interface CreateAlertaInput {
  palabrasClave: string;
  tipo?: string;
  activa?: boolean;
}

export interface UpdateAlertaInput {
  palabrasClave?: string;
  tipo?: string;
  activa?: boolean;
}

export interface QueryAlertaParams extends PaginationParams {
  activa?: boolean;
}

const legislacionSelect = {
  id: true,
  titulo: true,
  tipo: true,
  fechaPublicacion: true,
  fuente: true,
  url: true,
  contenido: true,
  createdAt: true,
  updatedAt: true,
};

const favoritoSelect = {
  id: true,
  legislacionId: true,
  usuarioId: true,
  createdAt: true,
  legislacion: {
    select: legislacionSelect,
  },
};

const alertaSelect = {
  id: true,
  palabrasClave: true,
  tipo: true,
  activa: true,
  usuarioId: true,
  createdAt: true,
  updatedAt: true,
};

class LegislacionService {
  async findAll(params: QueryLegislacionParams): Promise<PaginatedResult<any>> {
    const { page = 1, limit = 20, sort = 'fechaPublicacion', order = 'desc', tipo, search } = params;
    const skip = (page - 1) * limit;

    const where: any = {};

    if (tipo) {
      where.tipo = tipo;
    }

    if (search) {
      where.OR = [
        { titulo: { contains: search, mode: 'insensitive' } },
        { contenido: { contains: search, mode: 'insensitive' } },
      ];
    }

    const [legislacion, total] = await Promise.all([
      prisma.legislacion.findMany({
        where,
        skip,
        take: limit,
        orderBy: { [sort]: order },
        select: legislacionSelect,
      }),
      prisma.legislacion.count({ where }),
    ]);

    return {
      data: legislacion,
      meta: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async findById(id: string): Promise<any> {
    const legislacion = await prisma.legislacion.findFirst({
      where: { id },
      select: legislacionSelect,
    });

    if (!legislacion) {
      throw new ServiceException('LEGISLACION_NOT_FOUND', 'Legislación no encontrada', 404);
    }

    return legislacion;
  }

  async searchBOE(query: string, tipo?: string): Promise<any[]> {
    const where: any = {
      fuente: 'BOE',
      OR: [
        { titulo: { contains: query, mode: 'insensitive' } },
        { contenido: { contains: query, mode: 'insensitive' } },
      ],
    };

    if (tipo) {
      where.tipo = tipo;
    }

    return prisma.legislacion.findMany({
      where,
      take: 20,
      orderBy: { fechaPublicacion: 'desc' },
      select: legislacionSelect,
    });
  }

  async searchCENDOJ(query: string, tipo?: string): Promise<any[]> {
    const where: any = {
      fuente: 'CENDOJ',
      OR: [
        { titulo: { contains: query, mode: 'insensitive' } },
        { contenido: { contains: query, mode: 'insensitive' } },
      ],
    };

    if (tipo) {
      where.tipo = tipo;
    }

    return prisma.legislacion.findMany({
      where,
      take: 20,
      orderBy: { fechaPublicacion: 'desc' },
      select: legislacionSelect,
    });
  }

  async getFavoritos(usuarioId: string, params: PaginationParams): Promise<PaginatedResult<any>> {
    const { page = 1, limit = 20 } = params;
    const skip = (page - 1) * limit;

    const [favoritos, total] = await Promise.all([
      prisma.favorito.findMany({
        where: { usuarioId, deletedAt: null },
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        select: favoritoSelect,
      }),
      prisma.favorito.count({ where: { usuarioId, deletedAt: null } }),
    ]);

    return {
      data: favoritos,
      meta: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async addFavorito(usuarioId: string, input: CreateFavoritoInput): Promise<any> {
    const existingLegislacion = await prisma.legislacion.findFirst({
      where: { id: input.legislacionId },
    });

    if (!existingLegislacion) {
      throw new ServiceException('LEGISLACION_NOT_FOUND', 'Legislación no encontrada', 404);
    }

    const existingFavorito = await prisma.favorito.findFirst({
      where: { usuarioId, legislacionId: input.legislacionId, deletedAt: null },
    });

    if (existingFavorito) {
      throw new ServiceException('FAVORITO_EXISTS', 'El favorito ya existe', 409);
    }

    const favorito = await prisma.favorito.create({
      data: {
        usuarioId,
        legislacionId: input.legislacionId,
      },
      select: favoritoSelect,
    });

    return favorito;
  }

  async removeFavorito(usuarioId: string, legislacionId: string): Promise<void> {
    const existingFavorito = await prisma.favorito.findFirst({
      where: { usuarioId, legislacionId, deletedAt: null },
    });

    if (!existingFavorito) {
      throw new ServiceException('FAVORITO_NOT_FOUND', 'Favorito no encontrado', 404);
    }

    await prisma.favorito.update({
      where: { id: existingFavorito.id },
      data: { deletedAt: new Date() },
    });
  }

  async getAlertas(usuarioId: string, params: QueryAlertaParams): Promise<PaginatedResult<any>> {
    const { page = 1, limit = 20, activa } = params;
    const skip = (page - 1) * limit;

    const where: any = { usuarioId, deletedAt: null };

    if (activa !== undefined) {
      where.activa = activa;
    }

    const [alertas, total] = await Promise.all([
      prisma.alerta.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        select: alertaSelect,
      }),
      prisma.alerta.count({ where }),
    ]);

    return {
      data: alertas,
      meta: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async createAlerta(usuarioId: string, input: CreateAlertaInput): Promise<any> {
    const alerta = await prisma.alerta.create({
      data: {
        ...input,
        usuarioId,
      },
      select: alertaSelect,
    });

    return alerta;
  }

  async updateAlerta(id: string, usuarioId: string, input: UpdateAlertaInput): Promise<any> {
    const existingAlerta = await prisma.alerta.findFirst({
      where: { id, usuarioId, deletedAt: null },
    });

    if (!existingAlerta) {
      throw new ServiceException('ALERTA_NOT_FOUND', 'Alerta no encontrada', 404);
    }

    const alerta = await prisma.alerta.update({
      where: { id },
      data: input,
      select: alertaSelect,
    });

    return alerta;
  }

  async deleteAlerta(id: string, usuarioId: string): Promise<void> {
    const existingAlerta = await prisma.alerta.findFirst({
      where: { id, usuarioId, deletedAt: null },
    });

    if (!existingAlerta) {
      throw new ServiceException('ALERTA_NOT_FOUND', 'Alerta no encontrada', 404);
    }

    await prisma.alerta.update({
      where: { id },
      data: { deletedAt: new Date() },
    });
  }

  async toggleAlerta(id: string, usuarioId: string): Promise<any> {
    const existingAlerta = await prisma.alerta.findFirst({
      where: { id, usuarioId, deletedAt: null },
    });

    if (!existingAlerta) {
      throw new ServiceException('ALERTA_NOT_FOUND', 'Alerta no encontrada', 404);
    }

    const alerta = await prisma.alerta.update({
      where: { id },
      data: { activa: !existingAlerta.activa },
      select: alertaSelect,
    });

    return alerta;
  }
}

export const legislacionService = new LegislacionService();

import { prisma } from '../config/database';
import { ServiceException, PaginationParams, PaginatedResult } from './base.types';
import { TipoPrediccionEnum } from '../dtos/prediccion.dto';

export interface CreatePrediccionInput {
  expedienteId: string;
  tipoPrediccion: TipoPrediccionEnum;
}

export interface QueryPrediccionParams extends PaginationParams {
  tipo?: string;
  expediente_id?: string;
}

export interface QueryCasosSimilaresInput {
  expedienteId: string;
  limite?: number;
}

export interface QueryTendenciaInput {
  tipo?: string;
  meses?: number;
}

class PrediccionService {
  async create(usuarioId: string, input: CreatePrediccionInput): Promise<any> {
    const expediente = await prisma.expediente.findFirst({
      where: { id: input.expedienteId, deletedAt: null },
    });

    if (!expediente) {
      throw new ServiceException('EXPEDIENTE_NOT_FOUND', 'Expediente no encontrado', 404);
    }

    const prediccion = await prisma.prediccion.create({
      data: {
        usuarioId,
        expedienteId: input.expedienteId,
        tipoPrediccion: input.tipoPrediccion,
        resultado: this.generateMockPrediction(input.tipoPrediccion),
        confianza: Math.random() * 0.3 + 0.7,
      } as any,
    });

    return prediccion;
  }

  private generateMockPrediction(tipo: TipoPrediccionEnum): string {
    const predictions: Record<TipoPrediccionEnum, string> = {
      [TipoPrediccionEnum.RESULTADO]: 'Favorable',
      [TipoPrediccionEnum.DURACION]: '6-12 meses',
      [TipoPrediccionEnum.COSTES]: '5000-10000 EUR',
      [TipoPrediccionEnum.EXITO]: '75%',
      [TipoPrediccionEnum.RIESGO_PRESCRIPCION]: 'Bajo',
    };
    return predictions[tipo] || 'Predicción no disponible';
  }

  async findAll(params: QueryPrediccionParams): Promise<PaginatedResult<any>> {
    const { page = 1, limit = 20, sort = 'createdAt', order = 'desc', tipo, expediente_id } = params;
    const skip = (page - 1) * limit;

    const where: any = { deletedAt: null };

    if (tipo) {
      where.tipoPrediccion = tipo;
    }

    if (expediente_id) {
      where.expedienteId = expediente_id;
    }

    const [predicciones, total] = await Promise.all([
      prisma.prediccion.findMany({
        where,
        skip,
        take: limit,
        orderBy: { [sort]: order },
        select: {
          id: true,
          expedienteId: true,
          tipoPrediccion: true,
          resultado: true,
          createdAt: true,
          expediente: {
            select: {
              id: true,
              numeroExpediente: true,
              tipo: true,
            },
          },
        },
      }),
      prisma.prediccion.count({ where }),
    ]);

    return {
      data: predicciones,
      meta: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async findById(id: string): Promise<any> {
    const prediccion = await prisma.prediccion.findFirst({
      where: { id, deletedAt: null },
      include: {
        expediente: {
          select: {
            id: true,
            numeroExpediente: true,
            tipo: true,
            estado: true,
            cliente: {
              select: {
                id: true,
                nombre: true,
              },
            },
          },
        },
      },
    });

    if (!prediccion) {
      throw new ServiceException('PREDICCION_NOT_FOUND', 'Predicción no encontrada', 404);
    }

    return prediccion;
  }

  async findByExpediente(expedienteId: string): Promise<any[]> {
    const predicciones = await prisma.prediccion.findMany({
      where: { expedienteId, deletedAt: null },
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        tipoPrediccion: true,
        resultado: true,
        createdAt: true,
      },
    });

    return predicciones;
  }

  async getCasosSimilares(input: QueryCasosSimilaresInput): Promise<any[]> {
    const expediente = await prisma.expediente.findFirst({
      where: { id: input.expedienteId, deletedAt: null },
    });

    if (!expediente) {
      throw new ServiceException('EXPEDIENTE_NOT_FOUND', 'Expediente no encontrado', 404);
    }

    const casosSimilares = await prisma.expediente.findMany({
      where: {
        id: { not: input.expedienteId },
        tipo: expediente.tipo,
        deletedAt: null,
      },
      take: input.limite || 5,
      select: {
        id: true,
        numeroExpediente: true,
        tipo: true,
        estado: true,
        cliente: {
          select: {
            id: true,
            nombre: true,
          },
        },
        predicciones: {
          where: { deletedAt: null },
          select: {
            tipoPrediccion: true,
            resultado: true,
          },
        },
      },
    });

    return casosSimilares;
  }

  async getTendencias(input: QueryTendenciaInput): Promise<any> {
    const meses = input.meses || 12;
    const fechaInicio = new Date();
    fechaInicio.setMonth(fechaInicio.getMonth() - meses);

    const where: any = {
      createdAt: { gte: fechaInicio },
      deletedAt: null,
    };

    if (input.tipo) {
      where.tipoPrediccion = input.tipo;
    }

    const predicciones = await prisma.prediccion.findMany({
      where,
      select: {
        id: true,
        tipoPrediccion: true,
        resultado: true,
        createdAt: true,
      },
    });

    const tendencias = predicciones.reduce((acc: any, pred) => {
      if (!acc[pred.tipoPrediccion]) {
        acc[pred.tipoPrediccion] = {
          total: 0,
          count: 0,
        };
      }
      acc[pred.tipoPrediccion].total += 1;
      acc[pred.tipoPrediccion].count += 1;
      return acc;
    }, {});

    Object.keys(tendencias).forEach((key) => {
      tendencias[key].total = tendencias[key].total;
    });

    return {
      periodo: `${meses} meses`,
      totalPredicciones: predicciones.length,
      tendencias,
    };
  }

  async delete(id: string): Promise<void> {
    const prediccion = await prisma.prediccion.findFirst({
      where: { id, deletedAt: null },
    });

    if (!prediccion) {
      throw new ServiceException('PREDICCION_NOT_FOUND', 'Predicción no encontrada', 404);
    }

    await prisma.prediccion.update({
      where: { id },
      data: { deletedAt: new Date() },
    });
  }

  async getEstadisticas(usuarioId: string): Promise<any> {
    const predicciones = await prisma.prediccion.findMany({
      where: { deletedAt: null },
    });

    const total = predicciones.length;

    const porTipo = predicciones.reduce((acc: any, p) => {
      if (!acc[p.tipoPrediccion]) {
        acc[p.tipoPrediccion] = 0;
      }
      acc[p.tipoPrediccion] += 1;
      return acc;
    }, {});

    return {
      total,
      porTipo,
    };
  }
}

export const prediccionService = new PrediccionService();

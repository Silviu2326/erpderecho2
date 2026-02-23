import { prisma } from '../config/database';
import { ServiceException, PaginationParams, PaginatedResult } from './base.types';
import { TipoPrediccionEnum } from '../dtos/prediccion.dto';
import { aiService, AnalisisCasoInput } from './ai.service';

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
      include: {
        cliente: true,
        actuaciones: {
          orderBy: { fecha: 'desc' },
          take: 5,
        },
      },
    });

    if (!expediente) {
      throw new ServiceException('EXPEDIENTE_NOT_FOUND', 'Expediente no encontrado', 404);
    }

    let resultado: string;
    let probabilidad: number;
    let factoresAdicionales: any = {};

    // Usar IA para generar predicción real
    if (input.tipoPrediccion === TipoPrediccionEnum.RESULTADO || 
        input.tipoPrediccion === TipoPrediccionEnum.EXITO) {
      const analisisInput: AnalisisCasoInput = {
        tipo: expediente.tipo,
        descripcion: expediente.descripcion || 'Sin descripción detallada',
        parteDemandante: expediente.cliente?.nombre,
      };

      const analisis = await aiService.analizarCaso(analisisInput);
      
      if (input.tipoPrediccion === TipoPrediccionEnum.RESULTADO) {
        resultado = analisis.resultadoProbable;
        factoresAdicionales = {
          argumentosClave: analisis.argumentosClave,
          jurisprudenciaRelevante: analisis.jurisprudenciaRelevante,
          recomendaciones: analisis.recomendaciones,
        };
      } else {
        resultado = `${analisis.probabilidadExito}%`;
      }
      probabilidad = analisis.probabilidadExito / 100;
    } else if (input.tipoPrediccion === TipoPrediccionEnum.DURACION) {
      const analisisInput: AnalisisCasoInput = {
        tipo: expediente.tipo,
        descripcion: expediente.descripcion || '',
      };
      const analisis = await aiService.analizarCaso(analisisInput);
      resultado = analisis.duracionEstimada;
      probabilidad = 0.75;
    } else if (input.tipoPrediccion === TipoPrediccionEnum.COSTES) {
      const analisisInput: AnalisisCasoInput = {
        tipo: expediente.tipo,
        descripcion: expediente.descripcion || '',
      };
      const analisis = await aiService.analizarCaso(analisisInput);
      resultado = analisis.costesEstimados;
      probabilidad = 0.70;
    } else {
      // Para otros tipos, usar mock simple
      resultado = this.getMockPrediction(input.tipoPrediccion);
      probabilidad = 0.65;
    }

    const prediccion = await prisma.prediccion.create({
      data: {
        expedienteId: input.expedienteId,
        tipoPrediccion: input.tipoPrediccion,
        resultado,
        probabilidad,
        factores: factoresAdicionales,
      } as any,
    });

    return {
      ...prediccion,
      factores: factoresAdicionales,
    };
  }

  private getMockPrediction(tipo: TipoPrediccionEnum): string {
    const predictions: Record<TipoPrediccionEnum, string> = {
      [TipoPrediccionEnum.RESULTADO]: 'Favorable',
      [TipoPrediccionEnum.DURACION]: '6-12 meses',
      [TipoPrediccionEnum.COSTES]: '5000-10000 EUR',
      [TipoPrediccionEnum.EXITO]: '75%',
      [TipoPrediccionEnum.RIESGO_PRESCRIPCION]: 'Bajo',
    };
    return predictions[tipo] || 'Predicción no disponible';
  }

  async createAnalisisCompleto(usuarioId: string, expedienteId: string): Promise<any> {
    const expediente = await prisma.expediente.findFirst({
      where: { id: expedienteId, deletedAt: null },
      include: {
        cliente: true,
        actuaciones: {
          orderBy: { fecha: 'desc' },
          take: 5,
        },
      },
    });

    if (!expediente) {
      throw new ServiceException('EXPEDIENTE_NOT_FOUND', 'Expediente no encontrado', 404);
    }

    const analisisInput: AnalisisCasoInput = {
      tipo: expediente.tipo,
      descripcion: expediente.descripcion || 'Sin descripción detallada',
      parteDemandante: expediente.cliente?.nombre,
    };

    // Generar análisis completo con IA
    const [prediccionResultado, estrategia] = await Promise.all([
      aiService.analizarCaso(analisisInput),
      aiService.generarEstrategia(analisisInput),
    ]);

    // Crear múltiples predicciones
    const predicciones = await prisma.$transaction([
      prisma.prediccion.create({
        data: {
          expedienteId,
          tipoPrediccion: TipoPrediccionEnum.RESULTADO,
          resultado: prediccionResultado.resultadoProbable,
          probabilidad: prediccionResultado.probabilidadExito / 100,
          factores: {
            argumentosClave: prediccionResultado.argumentosClave,
            jurisprudenciaRelevante: prediccionResultado.jurisprudenciaRelevante,
            recomendaciones: prediccionResultado.recomendaciones,
          },
        } as any,
      }),
      prisma.prediccion.create({
        data: {
          expedienteId,
          tipoPrediccion: TipoPrediccionEnum.EXITO,
          resultado: `${prediccionResultado.probabilidadExito}%`,
          probabilidad: prediccionResultado.probabilidadExito / 100,
        } as any,
      }),
      prisma.prediccion.create({
        data: {
          expedienteId,
          tipoPrediccion: TipoPrediccionEnum.DURACION,
          resultado: prediccionResultado.duracionEstimada,
          probabilidad: 0.75,
        } as any,
      }),
      prisma.prediccion.create({
        data: {
          expedienteId,
          tipoPrediccion: TipoPrediccionEnum.COSTES,
          resultado: prediccionResultado.costesEstimados,
          probabilidad: 0.70,
        } as any,
      }),
    ]);

    return {
      predicciones,
      analisis: prediccionResultado,
      estrategia,
    };
  }

  async analizarSentimientoLead(leadId: string): Promise<any> {
    const lead = await prisma.lead.findFirst({
      where: { id: leadId, deletedAt: null },
    });

    if (!lead) {
      throw new ServiceException('LEAD_NOT_FOUND', 'Lead no encontrado', 404);
    }

    const texto = `${lead.nombre} ${lead.origen || ''} ${lead.estado} ${lead.empresa || ''}`;
      const analisis = await aiService.analizarSentimiento(texto);

    return {
      leadId,
      sentimiento: analisis.sentimiento,
      probabilidad: analisis.confianza,
      factores: analisis.factores,
    };
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
          probabilidad: true,
          createdAt: true,
          factores: true,
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
          probabilidad: true,
          createdAt: true,
          factores: true,
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

    // Buscar casos similares por tipo y características
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
        descripcion: true,
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
            probabilidad: true,
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
          probabilidad: true,
          createdAt: true,
          factores: true,
        },
    });

    // Análisis de tendencias
    const porTipo = predicciones.reduce((acc: any, pred) => {
      if (!acc[pred.tipoPrediccion]) {
        acc[pred.tipoPrediccion] = {
          count: 0,
          probabilidadPromedio: 0,
        };
      }
      acc[pred.tipoPrediccion].count += 1;
      acc[pred.tipoPrediccion].probabilidadPromedio += pred.probabilidad || 0;
      return acc;
    }, {});

    // Calcular promedios
    Object.keys(porTipo).forEach((key) => {
      porTipo[key].probabilidadPromedio = 
        Math.round((porTipo[key].probabilidadPromedio / porTipo[key].count) * 100) / 100;
    });

    return {
      periodo: `${meses} meses`,
      totalPredicciones: predicciones.length,
      porTipo,
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
        acc[p.tipoPrediccion] = { count: 0, probabilidadTotal: 0 };
      }
      acc[p.tipoPrediccion].count += 1;
      acc[p.tipoPrediccion].probabilidadTotal += p.probabilidad || 0;
      return acc;
    }, {});

    // Calcular promedios
    Object.keys(porTipo).forEach((key) => {
      porTipo[key].probabilidadPromedio = 
        Math.round((porTipo[key].probabilidadTotal / porTipo[key].count) * 100) / 100;
      delete porTipo[key].probabilidadTotal;
    });

    return {
      total,
      porTipo,
    };
  }
}

export const prediccionService = new PrediccionService();

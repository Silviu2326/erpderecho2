import { Router, Response } from 'express';
import { validate } from 'class-validator';
import { plainToInstance } from 'class-transformer';
import { prisma } from '../config/database';
import { authMiddleware, AuthRequest } from '../middleware/auth';
import {
  CreatePrediccionDto,
  QueryPrediccionDto,
  QueryCasosSimilaresDto,
  QueryTendenciaDto,
  TipoPrediccionEnum,
} from '../dtos/prediccion.dto';

const router = Router();

function formatResponse<T>(data: T, meta?: any) {
  const response: any = { success: true, data };
  if (meta) {
    response.meta = meta;
  }
  return response;
}

function generateMockPrediction(tipo: TipoPrediccionEnum) {
  const mockResults: Record<TipoPrediccionEnum, { resultado: string; probabilidad: number; factores: any }> = {
    [TipoPrediccionEnum.RESULTADO]: {
      resultado: 'FAVORABLE',
      probabilidad: 0.72,
      factores: {
        historicoExito: 0.68,
        complejidad: 'MEDIA',
        evidencia: 'SOLIDA',
        opposicion: 'BAJA',
      },
    },
    [TipoPrediccionEnum.DURACION]: {
      resultado: '8-12 meses',
      probabilidad: 0.65,
      factores: {
        promedioHistorico: '10 meses',
        complejidad: 'MEDIA',
        tipoProcedimiento: 'ABREVIADO',
      },
    },
    [TipoPrediccionEnum.COSTES]: {
      resultado: '5000-8000 EUR',
      probabilidad: 0.70,
      factores: {
        promedioHistorico: '6500 EUR',
        complejidad: 'MEDIA',
        urgencia: false,
      },
    },
    [TipoPrediccionEnum.EXITO]: {
      resultado: 'PROBABLE',
      probabilidad: 0.75,
      factores: {
        fortalezas: ['Evidencia clara', 'Testigos favorables'],
        debilidades: ['Plazos ajustados'],
        jurisprudencia: 'FAVORABLE',
      },
    },
    [TipoPrediccionEnum.RIESGO_PRESCRIPCION]: {
      resultado: 'BAJO',
      probabilidad: 0.85,
      factores: {
        tiempoTranscurrido: '6 meses',
        plazoMaximo: '24 meses',
        accionesInterrumpidoras: true,
      },
    },
  };
  return mockResults[tipo];
}

router.post('/caso', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const dto = plainToInstance(CreatePrediccionDto, req.body);
    const errors = await validate(dto);
    if (errors.length > 0) {
      res.status(400).json({ success: false, error: { message: 'Validation failed', details: errors } });
      return;
    }

    const expediente = await prisma.expediente.findFirst({
      where: { id: dto.expedienteId, deletedAt: null },
    });

    if (!expediente) {
      res.status(404).json({ success: false, error: { code: 'EXPEDIENTE_NOT_FOUND', message: 'Expediente no encontrado' } });
      return;
    }

    const mockPrediction = generateMockPrediction(dto.tipoPrediccion);

    const prediccion = await prisma.prediccion.create({
      data: {
        expedienteId: dto.expedienteId,
        tipoPrediccion: dto.tipoPrediccion,
        resultado: mockPrediction.resultado,
        probabilidad: mockPrediction.probabilidad,
        factores: mockPrediction.factores,
      },
    });

    res.status(201).json(formatResponse({
      ...prediccion,
      detalles: mockPrediction.factores,
      modelo: 'MOCK_PREDICTION',
      nota: 'Esta es una predicción simulada. Se requiere entrenamiento de modelo ML real para predicciones precisas.',
    }));
  } catch (error) {
    console.error('Create prediccion error:', error);
    res.status(500).json({ success: false, error: { message: 'Internal server error' } });
  }
});

router.get('/caso/:expedienteId', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const { expedienteId } = req.params;
    const dto = plainToInstance(QueryPrediccionDto, req.query as any);

    const expediente = await prisma.expediente.findFirst({
      where: { id: expedienteId, deletedAt: null },
    });

    if (!expediente) {
      res.status(404).json({ success: false, error: { code: 'EXPEDIENTE_NOT_FOUND', message: 'Expediente no encontrado' } });
      return;
    }

    const { page = 1, limit = 20 } = dto;
    const skip = (page - 1) * limit;

    const where: any = {
      expedienteId,
      deletedAt: null,
    };

    if (dto.tipo) {
      where.tipoPrediccion = dto.tipo;
    }

    const [predicciones, total] = await Promise.all([
      prisma.prediccion.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      prisma.prediccion.count({ where }),
    ]);

    res.json(formatResponse(predicciones, {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    }));
  } catch (error) {
    console.error('Get predicciones error:', error);
    res.status(500).json({ success: false, error: { message: 'Internal server error' } });
  }
});

router.get('/tendencias', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const { tipo, meses = 12 } = req.query;

    const fechaInicio = new Date();
    fechaInicio.setMonth(fechaInicio.getMonth() - parseInt(meses as string));

    const where: any = {
      deletedAt: null,
      createdAt: {
        gte: fechaInicio,
      },
    };

    if (tipo) {
      where.tipoPrediccion = tipo;
    }

    const predicciones = await prisma.prediccion.findMany({
      where,
      select: {
        tipoPrediccion: true,
        resultado: true,
        probabilidad: true,
        createdAt: true,
      },
    });

    const tendenciasPorTipo = Object.values(TipoPrediccionEnum).map(tipo => {
      const filtered = predicciones.filter(p => p.tipoPrediccion === tipo);
      const promedioProbabilidad = filtered.length > 0
        ? filtered.reduce((sum, p) => sum + p.probabilidad, 0) / filtered.length
        : 0;

      return {
        tipo,
        totalPredicciones: filtered.length,
        promedioProbabilidad: Math.round(promedioProbabilidad * 100) / 100,
        tendencias: [
          { periodo: 'Ultimo mes', promedio: promedioProbabilidad },
          { periodo: 'Ultimos 3 meses', promedio: promedioProbabilidad * 0.98 },
          { periodo: 'Ultimos 6 meses', promedio: promedioProbabilidad * 0.95 },
        ],
      };
    });

    res.json(formatResponse({
      periodo: `${meses} meses`,
      generado: new Date().toISOString(),
      tendencias: tendenciasPorTipo,
      nota: 'Datos simulados. Se requiere historial real para tendencias precisas.',
    }));
  } catch (error) {
    console.error('Get tendencias error:', error);
    res.status(500).json({ success: false, error: { message: 'Internal server error' } });
  }
});

router.get('/casos-similares', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const { expediente_id, limite = 5 } = req.query;

    if (!expediente_id) {
      res.status(400).json({ success: false, error: { message: 'expediente_id es requerido' } });
      return;
    }

    const expediente = await prisma.expediente.findFirst({
      where: { id: expediente_id as string, deletedAt: null },
      include: {
        cliente: true,
      },
    });

    if (!expediente) {
      res.status(404).json({ success: false, error: { code: 'EXPEDIENTE_NOT_FOUND', message: 'Expediente no encontrado' } });
      return;
    }

    const casosSimilares = await prisma.expediente.findMany({
      where: {
        deletedAt: null,
        id: { not: expediente_id as string },
        tipo: expediente.tipo,
      },
      take: parseInt(limite as string),
      select: {
        id: true,
        numeroExpediente: true,
        tipo: true,
        estado: true,
        descripcion: true,
        createdAt: true,
        cliente: {
          select: {
            id: true,
            nombre: true,
          },
        },
        predicciones: {
          where: { deletedAt: null },
          take: 1,
          orderBy: { createdAt: 'desc' },
        },
      },
    });

    const resultado = casosSimilares.map(caso => ({
      expediente: {
        id: caso.id,
        numeroExpediente: caso.numeroExpediente,
        tipo: caso.tipo,
        estado: caso.estado,
        descripcion: caso.descripcion,
        cliente: caso.cliente,
      },
      similitud: Math.round((0.6 + Math.random() * 0.4) * 100) / 100,
      resultadoReal: caso.predicciones[0]?.resultado || 'DESCONOCIDO',
      probabilidadPredicha: caso.predicciones[0]?.probabilidad || null,
    }));

    res.json(formatResponse({
      expedienteReferencia: {
        id: expediente.id,
        numeroExpediente: expediente.numeroExpediente,
        tipo: expediente.tipo,
      },
      casosSimilares: resultado,
      nota: 'Casos simulados como similares. Se requiere modelo ML entrenado para similitud real.',
    }));
  } catch (error) {
    console.error('Get casos similares error:', error);
    res.status(500).json({ success: false, error: { message: 'Internal server error' } });
  }
});

router.get('/riesgo-prescripcion', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const { expediente_id } = req.query;

    if (!expediente_id) {
      res.status(400).json({ success: false, error: { message: 'expediente_id es requerido' } });
      return;
    }

    const expediente = await prisma.expediente.findFirst({
      where: { id: expediente_id as string, deletedAt: null },
      include: {
        actuaciones: {
          where: { deletedAt: null },
          orderBy: { fecha: 'desc' },
          take: 10,
        },
      },
    });

    if (!expediente) {
      res.status(404).json({ success: false, error: { code: 'EXPEDIENTE_NOT_FOUND', message: 'Expediente no encontrado' } });
      return;
    }

    const fechaApertura = expediente.createdAt;
    const ahora = new Date();
    const mesesTranscurridos = (ahora.getTime() - fechaApertura.getTime()) / (1000 * 60 * 60 * 24 * 30);

    const plazosPorTipo: Record<string, number> = {
      CIVIL: 24,
      PENAL: 24,
      LABORAL: 12,
      CONTENCIOSO: 24,
      MERCANTIL: 36,
      FAMILIA: 12,
      ADMINISTRATIVO: 24,
    };

    const plazoMaximo = plazosPorTipo[expediente.tipo] || 24;
    const mesesRestantes = plazoMaximo - mesesTranscurridos;
    const riesgo = mesesRestantes <= 3 ? 'ALTO' : mesesRestantes <= 6 ? 'MEDIO' : 'BAJO';

    const ultimaActuacion = expediente.actuaciones[0];
    const diasDesdeUltimaActuacion = ultimaActuacion
      ? (ahora.getTime() - new Date(ultimaActuacion.fecha).getTime()) / (1000 * 60 * 60 * 24)
      : null;

    res.json(formatResponse({
      expediente: {
        id: expediente.id,
        numeroExpediente: expediente.numeroExpediente,
        tipo: expediente.tipo,
      },
      analisis: {
        fechaApertura: fechaApertura.toISOString(),
        mesesTranscurridos: Math.round(mesesTranscurridos * 10) / 10,
        plazoMaximoMeses: plazoMaximo,
        mesesRestantes: Math.round(mesesRestantes * 10) / 10,
        riesgo,
        ultimaActuacion: ultimaActuacion ? {
          fecha: ultimaActuacion.fecha,
          diasHace: Math.round(diasDesdeUltimaActuacion!),
          tipo: ultimaActuacion.tipo,
        } : null,
        recomendaciones: [
          mesesRestantes <= 3 ? 'URGENTE: Revisar plazos y evitar prescripción' : null,
          diasDesdeUltimaActuacion && diasDesdeUltimaActuacion > 60 ? 'Considerar actuaciones para interrumpir plazo' : null,
          riesgo === 'ALTO' ? 'Solicitar suspension de plazos si procede' : null,
        ].filter(Boolean),
      },
      modelo: 'MOCK_PRESCRIPTION_RISK',
      nota: 'Análisis de riesgo simulado. Se requiere modelo entrenado con datos históricos reales.',
    }));
  } catch (error) {
    console.error('Get riesgo prescripcion error:', error);
    res.status(500).json({ success: false, error: { message: 'Internal server error' } });
  }
});

router.get('/dashboard', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const { abogado_id, fecha_desde, fecha_hasta } = req.query;

    const whereExpediente: any = { deletedAt: null };
    if (abogado_id) {
      whereExpediente.abogadoId = abogado_id;
    }

    if (fecha_desde || fecha_hasta) {
      whereExpediente.createdAt = {};
      if (fecha_desde) {
        whereExpediente.createdAt.gte = new Date(fecha_desde as string);
      }
      if (fecha_hasta) {
        whereExpediente.createdAt.lte = new Date(fecha_hasta as string);
      }
    }

    const [totalExpedientes, expedientesActivos, predicciones] = await Promise.all([
      prisma.expediente.count({ where: whereExpediente }),
      prisma.expediente.count({ where: { ...whereExpediente, estado: 'ACTIVO' } }),
      prisma.prediccion.findMany({
        where: {
          deletedAt: null,
          expediente: whereExpediente,
        },
        select: {
          tipoPrediccion: true,
          probabilidad: true,
          resultado: true,
        },
      }),
    ]);

    const estadisticasPorTipo = Object.values(TipoPrediccionEnum).map(tipo => {
      const filtered = predicciones.filter(p => p.tipoPrediccion === tipo);
      const exitosas = filtered.filter(p => 
        p.resultado.includes('FAVORABLE') || 
        p.resultado.includes('PROBABLE') || 
        p.probabilidad >= 0.7
      );

      return {
        tipo,
        total: filtered.length,
        exitosas: exitosas.length,
        tasaExito: filtered.length > 0 ? Math.round((exitosas.length / filtered.length) * 100) : 0,
        probabilidadPromedio: filtered.length > 0
          ? Math.round((filtered.reduce((sum, p) => sum + p.probabilidad, 0) / filtered.length) * 100) / 100
          : 0,
      };
    });

    const casosAltoRiesgo = await prisma.expediente.findMany({
      where: {
        ...whereExpediente,
        estado: 'ACTIVO',
        createdAt: {
          lte: new Date(Date.now() - 18 * 30 * 24 * 60 * 60 * 1000),
        },
      },
      select: {
        id: true,
        numeroExpediente: true,
        tipo: true,
        createdAt: true,
      },
      take: 10,
    }).then(exp => exp.map(e => ({
      ...e,
      mesesTranscurridos: Math.round((Date.now() - new Date(e.createdAt).getTime()) / (1000 * 60 * 60 * 24 * 30)),
    })));

    res.json(formatResponse({
      resumen: {
        totalExpedientes,
        expedientesActivos,
        totalPredicciones: predicciones.length,
        promedioExitoGeneral: predicciones.length > 0
          ? Math.round((predicciones.reduce((sum, p) => sum + p.probabilidad, 0) / predicciones.length) * 100)
          : 0,
      },
      porTipo: estadisticasPorTipo,
      casosAltoRiesgoPrescripcion: casosAltoRiesgo,
      generado: new Date().toISOString(),
      nota: 'Dashboard con datos simulados. Se requiere modelo ML entrenado para métricas precisas.',
    }));
  } catch (error) {
    console.error('Get dashboard error:', error);
    res.status(500).json({ success: false, error: { message: 'Internal server error' } });
  }
});

router.get('/abogado/:id/metricas', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;

    const abogado = await prisma.user.findFirst({
      where: { id, deletedAt: null },
    });

    if (!abogado) {
      res.status(404).json({ success: false, error: { code: 'ABOGADO_NOT_FOUND', message: 'Abogado no encontrado' } });
      return;
    }

    const [expedientes, predicciones] = await Promise.all([
      prisma.expediente.findMany({
        where: {
          deletedAt: null,
          abogadoId: id,
        },
        select: {
          id: true,
          tipo: true,
          estado: true,
          createdAt: true,
        },
      }),
      prisma.prediccion.findMany({
        where: {
          deletedAt: null,
          expediente: {
            abogadoId: id,
          },
        },
        select: {
          tipoPrediccion: true,
          probabilidad: true,
          resultado: true,
          createdAt: true,
        },
      }),
    ]);

    const exitosos = predicciones.filter(p =>
      p.resultado.includes('FAVORABLE') ||
      p.resultado.includes('PROBABLE') ||
      p.probabilidad >= 0.7
    );

    const metricas = {
      abogado: {
        id: abogado.id,
        nombre: abogado.nombre,
        apellido1: abogado.apellido1,
        especialidad: abogado.especialidad,
      },
      expediente: {
        total: expedientes.length,
        activos: expedientes.filter((e: any) => e.estado === 'ACTIVO').length,
        cerrados: expedientes.filter((e: any) => e.estado === 'CERRADO').length,
        archivados: expedientes.filter((e: any) => e.estado === 'ARCHIVADO').length,
      },
      predicciones: {
        total: predicciones.length,
        exitosas: exitosos.length,
        tasaExito: predicciones.length > 0
          ? Math.round((exitosos.length / predicciones.length) * 100)
          : 0,
        probabilidadPromedio: predicciones.length > 0
          ? Math.round((predicciones.reduce((sum, p) => sum + p.probabilidad, 0) / predicciones.length) * 100) / 100
          : 0,
      },
      porTipoExpediente: Object.values(TipoPrediccionEnum).map(tipo => {
        const filtered = predicciones.filter(p => p.tipoPrediccion === tipo);
        return {
          tipo,
          total: filtered.length,
          promedioProbabilidad: filtered.length > 0
            ? Math.round((filtered.reduce((sum, p) => sum + p.probabilidad, 0) / filtered.length) * 100) / 100
            : 0,
        };
      }),
      rendimientoHistorico: [
        { periodo: 'Ultimo mes', predicciones: 0, tasaExito: 0 },
        { periodo: 'Ultimos 3 meses', predicciones: 0, tasaExito: 0 },
        { periodo: 'Ultimos 6 meses', predicciones: 0, tasaExito: 0 },
        { periodo: 'Ultimo ano', predicciones: 0, tasaExito: 0 },
      ],
      comparativa: {
        posicion: 'N/A',
        nota: 'Se requiere historial de múltiples abogados para ranking',
      },
      generado: new Date().toISOString(),
      nota: 'Métricas simuladas. Se requiere datos históricos reales para métricas precisas.',
    };

    res.json(formatResponse(metricas));
  } catch (error) {
    console.error('Get lawyer metrics error:', error);
    res.status(500).json({ success: false, error: { message: 'Internal server error' } });
  }
});

export default router;

import { prisma } from '../config/database';
import { ServiceException, PaginationParams, PaginatedResult } from './base.types';
import { boeService, BOEQueryParams } from './boe.service';
import { cendojService, CENDOJQueryParams } from './cendoj.service';

export interface QueryLegislacionParams extends PaginationParams {
  tipo?: string;
  search?: string;
  fuente?: string;
  fechaDesde?: string;
  fechaHasta?: string;
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

export interface BusquedaExternaParams {
  fuente: 'BOE' | 'CENDOJ' | 'TODAS';
  query: string;
  fechaDesde?: string;
  fechaHasta?: string;
  tipo?: string;
  limit?: number;
  sincronizar?: boolean;
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
  // Búsqueda en base de datos local
  async findAll(params: QueryLegislacionParams): Promise<PaginatedResult<any>> {
    const { page = 1, limit = 20, sort = 'fechaPublicacion', order = 'desc', tipo, search, fuente } = params;
    const skip = (page - 1) * limit;

    const where: any = {};

    if (tipo) {
      where.tipo = tipo;
    }

    if (fuente) {
      where.fuente = fuente;
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

  // Búsqueda externa en BOE y/o CENDOJ
  async busquedaExterna(params: BusquedaExternaParams): Promise<{
    boe?: any[];
    cendoj?: { results: any[]; total: number };
    mensaje?: string;
  }> {
    const resultados: any = {};

    try {
      if (params.fuente === 'BOE' || params.fuente === 'TODAS') {
        const boeParams: BOEQueryParams = {
          q: params.query,
          fechaDesde: params.fechaDesde,
          fechaHasta: params.fechaHasta,
          limit: params.limit || 10,
        };

        const boeResults = await boeService.search(boeParams);
        resultados.boe = boeResults;

        // Sincronizar con BD si se solicita
        if (params.sincronizar) {
          await boeService.syncWithDatabase(prisma, boeResults);
        }
      }
    } catch (error) {
      console.error('Error en búsqueda BOE:', error);
      resultados.boeError = 'Error al consultar BOE';
    }

    try {
      if (params.fuente === 'CENDOJ' || params.fuente === 'TODAS') {
        const cendojParams: CENDOJQueryParams = {
          q: params.query,
          fechaDesde: params.fechaDesde,
          fechaHasta: params.fechaHasta,
          limit: params.limit || 10,
        };

        const cendojResults = await cendojService.search(cendojParams);
        resultados.cendoj = cendojResults;

        // Sincronizar con BD si se solicita
        if (params.sincronizar) {
          await cendojService.syncWithDatabase(prisma, cendojResults.results);
        }
      }
    } catch (error) {
      console.error('Error en búsqueda CENDOJ:', error);
      resultados.cendojError = 'Error al consultar CENDOJ';
    }

    if (!resultados.boe && !resultados.cendoj) {
      throw new ServiceException('SEARCH_ERROR', 'No se pudieron obtener resultados de ninguna fuente', 503);
    }

    return resultados;
  }

  // Búsqueda específica BOE
  async searchBOE(query: string, sincronizar: boolean = false): Promise<any[]> {
    try {
      const results = await boeService.search({ q: query, limit: 20 });
      
      if (sincronizar) {
        await boeService.syncWithDatabase(prisma, results);
      }
      
      return results;
    } catch (error) {
      console.error('Error buscando BOE:', error);
      // Fallback a BD local
      return this.findAll({ search: query, fuente: 'BOE' }).then(r => r.data);
    }
  }

  // Búsqueda específica CENDOJ
  async searchCENDOJ(query: string, sincronizar: boolean = false): Promise<any> {
    try {
      const results = await cendojService.search({ q: query, limit: 10 });
      
      if (sincronizar) {
        await cendojService.syncWithDatabase(prisma, results.results);
      }
      
      return results;
    } catch (error) {
      console.error('Error buscando CENDOJ:', error);
      // Fallback a BD local
      const localResults = await this.findAll({ search: query, fuente: 'CENDOJ' });
      return { results: localResults.data, total: localResults.meta.total };
    }
  }

  // Obtener documento específico de BOE
  async getBOEDocumento(id: string): Promise<any> {
    try {
      const documento = await boeService.getDocumento(id);
      
      // Guardar en BD local
      await prisma.legislacion.upsert({
        where: { id: documento.id },
        update: {
          titulo: documento.titulo,
          tipo: documento.tipo,
          url: documento.uri,
          fechaPublicacion: new Date(documento.fecha),
          fuente: 'BOE',
          contenido: documento.textoCompleto || documento.extracto,
        },
        create: {
          id: documento.id,
          titulo: documento.titulo,
          tipo: documento.tipo,
          url: documento.uri,
          fechaPublicacion: new Date(documento.fecha),
          fuente: 'BOE',
          contenido: documento.textoCompleto || documento.extracto,
        },
      });
      
      return documento;
    } catch (error) {
      console.error('Error obteniendo documento BOE:', error);
      throw new ServiceException('BOE_ERROR', 'Error al obtener documento del BOE', 503);
    }
  }

  // Obtener sentencia específica de CENDOJ
  async getCENDOJSentencia(id: string): Promise<any> {
    try {
      const sentencia = await cendojService.getSentencia(id);
      
      // Guardar en BD local
      await prisma.legislacion.upsert({
        where: { id: sentencia.id },
        update: {
          titulo: sentencia.titulo,
          tipo: sentencia.tipoResolucion,
          url: sentencia.url,
          fechaPublicacion: new Date(sentencia.fecha),
          fuente: 'CENDOJ',
          contenido: sentencia.extracto,
        },
        create: {
          id: sentencia.id,
          titulo: sentencia.titulo,
          tipo: sentencia.tipoResolucion,
          url: sentencia.url,
          fechaPublicacion: new Date(sentencia.fecha),
          fuente: 'CENDOJ',
          contenido: sentencia.extracto,
        },
      });
      
      return sentencia;
    } catch (error) {
      console.error('Error obteniendo sentencia CENDOJ:', error);
      throw new ServiceException('CENDOJ_ERROR', 'Error al obtener sentencia del CENDOJ', 503);
    }
  }

  // Sincronización masiva
  async sincronizarFuentesExternas(dias: number = 7): Promise<{
    boe: number;
    cendoj: number;
    errores: string[];
  }> {
    const resultados = { boe: 0, cendoj: 0, errores: [] as string[] };
    const fechaHasta = new Date().toISOString().split('T')[0];
    const fechaDesde = new Date(Date.now() - dias * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

    try {
      // Sincronizar BOE
      const boeResults = await boeService.searchByDateRange(fechaDesde, fechaHasta);
      await boeService.syncWithDatabase(prisma, boeResults);
      resultados.boe = boeResults.length;
    } catch (error: any) {
      resultados.errores.push(`BOE: ${error.message}`);
    }

    // Nota: CENDOJ no tiene búsqueda por rango, solo se sincroniza búsqueda específica
    // Para sincronización masiva de CENDOJ se necesitaría iterar por términos de búsqueda

    return resultados;
  }

  // Gestión de favoritos
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

  // Gestión de alertas
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

  // Verificar alertas y buscar nuevas publicaciones
  async verificarAlertas(usuarioId: string): Promise<{
    alertasVerificadas: number;
    nuevosResultados: any[];
  }> {
    const alertas = await prisma.alerta.findMany({
      where: { usuarioId, activa: true, deletedAt: null },
    });

    const nuevosResultados: any[] = [];

    for (const alerta of alertas) {
      try {
        // Buscar en BOE
        const boeResults = await boeService.search({
          q: alerta.palabrasClave,
          limit: 5,
        });

        // Buscar en CENDOJ
        const cendojResults = await cendojService.search({
          q: alerta.palabrasClave,
          limit: 5,
        });

        nuevosResultados.push({
          alerta: alerta.palabrasClave,
          boe: boeResults,
          cendoj: cendojResults.results,
        });
      } catch (error) {
        console.error(`Error verificando alerta ${alerta.id}:`, error);
      }
    }

    return {
      alertasVerificadas: alertas.length,
      nuevosResultados,
    };
  }
}

export const legislacionService = new LegislacionService();

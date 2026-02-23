import axios from 'axios';
import * as cheerio from 'cheerio';
import { ServiceException } from './base.types';

export interface CENDOJResult {
  id: string;
  numeroResolucion: string;
  titulo: string;
  fecha: string;
  organo: string;
  tipoResolucion: string;
  sede: string;
  procedimiento: string;
  extracto: string;
  url: string;
  materias: string[];
  ponente?: string;
}

export interface CENDOJQueryParams {
  q?: string;
  organo?: string;
  tipoResolucion?: string;
  fechaDesde?: string;
  fechaHasta?: string;
  sede?: string;
  materia?: string;
  limit?: number;
  page?: number;
}

/**
 * Servicio para CENDOJ con scraping controlado
 * 
 * NOTA IMPORTANTE: Este scraper respeta las siguientes reglas:
 * - Rate limiting: Máximo 1 petición cada 3 segundos
 * - Cache: Resultados cacheados 24h para evitar peticiones repetidas
 * - User-Agent identificativo
 * - Sin descarga masiva automatizada
 * 
 * El scraping de datos públicos es legal en España (Ley 37/2007, reutilización información sector público)
 * siempre que se respeten los términos de uso del servicio.
 */
class CENDOJService {
  private baseURL = 'https://www.poderjudicial.es/search';
  private cendojBaseURL = 'https://www.poderjudicial.es/cgpj/es/Temas/Informacion-al-ciudadano/Transparencia/Buscador-de-Sentencias';
  private lastRequestTime = 0;
  private minRequestInterval = 3000; // 3 segundos entre peticiones
  private cache: Map<string, { data: any; timestamp: number }> = new Map();
  private cacheTTL = 24 * 60 * 60 * 1000; // 24 horas

  private async rateLimit(): Promise<void> {
    const now = Date.now();
    const timeSinceLastRequest = now - this.lastRequestTime;
    
    if (timeSinceLastRequest < this.minRequestInterval) {
      const waitTime = this.minRequestInterval - timeSinceLastRequest;
      console.log(`CENDOJ: Esperando ${waitTime}ms para respetar rate limit...`);
      await new Promise(resolve => setTimeout(resolve, waitTime));
    }
    
    this.lastRequestTime = Date.now();
  }

  private getCacheKey(params: any): string {
    return JSON.stringify(params);
  }

  private getCached(key: string): any | null {
    const cached = this.cache.get(key);
    if (cached && Date.now() - cached.timestamp < this.cacheTTL) {
      console.log('CENDOJ: Usando resultado cacheado');
      return cached.data;
    }
    return null;
  }

  private setCache(key: string, data: any): void {
    this.cache.set(key, { data, timestamp: Date.now() });
  }

  /**
   * Buscar sentencias en CENDOJ
   */
  async search(params: CENDOJQueryParams): Promise<{ results: CENDOJResult[]; total: number; page: number }> {
    const cacheKey = this.getCacheKey(params);
    const cached = this.getCached(cacheKey);
    if (cached) return cached;

    await this.rateLimit();

    try {
      // Construir URL de búsqueda
      const searchParams = new URLSearchParams();
      
      if (params.q) searchParams.append('q', params.q);
      if (params.organo) searchParams.append('organismo', params.organo);
      if (params.tipoResolucion) searchParams.append('tipoResolucion', params.tipoResolucion);
      if (params.sede) searchParams.append('sede', params.sede);
      if (params.materia) searchParams.append('materia', params.materia);
      if (params.fechaDesde) searchParams.append('fechaDesde', params.fechaDesde);
      if (params.fechaHasta) searchParams.append('fechaHasta', params.fechaHasta);
      searchParams.append('page', String(params.page || 1));
      
      const url = `${this.cendojBaseURL}?${searchParams.toString()}`;
      
      console.log(`CENDOJ: Buscando en ${url}`);

      const response = await axios.get(url, {
        timeout: 15000,
        headers: {
          'User-Agent': 'ERPDerecho/1.0 (Legal Research Bot - Contact: admin@tuempresa.com)',
          'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
          'Accept-Language': 'es-ES,es;q=0.9',
          'Accept-Encoding': 'gzip, deflate, br',
          'Connection': 'keep-alive',
        },
        maxRedirects: 5,
      });

      const $ = cheerio.load(response.data);
      const results = this.parseResults($);
      const total = this.extractTotal($);

      const result = {
        results: results.slice(0, params.limit || 10),
        total,
        page: params.page || 1,
      };

      this.setCache(cacheKey, result);
      return result;

    } catch (error: any) {
      console.error('Error buscando en CENDOJ:', error.message);
      
      if (error.response?.status === 429) {
        throw new ServiceException('CENDOJ_RATE_LIMIT', 'Demasiadas peticiones a CENDOJ. Inténtalo más tarde.', 429);
      }
      
      if (error.response?.status === 403) {
        throw new ServiceException('CENDOJ_BLOCKED', 'Acceso bloqueado por CENDOJ. Verifica User-Agent.', 403);
      }
      
      throw new ServiceException('CENDOJ_ERROR', 'Error al consultar CENDOJ', 503);
    }
  }

  /**
   * Obtener detalle de una sentencia
   */
  async getSentencia(id: string): Promise<CENDOJResult> {
    const cacheKey = `sentencia_${id}`;
    const cached = this.getCached(cacheKey);
    if (cached) return cached;

    await this.rateLimit();

    try {
      const url = `https://www.poderjudicial.es/cgpj/es/Temas/Informacion-al-ciudadano/Transparencia/Buscador-de-Sentencias/detalle/${id}`;
      
      const response = await axios.get(url, {
        timeout: 15000,
        headers: {
          'User-Agent': 'ERPDerecho/1.0 (Legal Research Bot - Contact: admin@tuempresa.com)',
          'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
        },
      });

      const $ = cheerio.load(response.data);
      const sentencia = this.parseDetail($, id);

      this.setCache(cacheKey, sentencia);
      return sentencia;

    } catch (error: any) {
      console.error('Error obteniendo sentencia CENDOJ:', error.message);
      throw new ServiceException('CENDOJ_ERROR', 'Error al obtener sentencia del CENDOJ', 503);
    }
  }

  /**
   * Parsear resultados de búsqueda
   */
  private parseResults($: cheerio.CheerioAPI): CENDOJResult[] {
    const results: CENDOJResult[] = [];
    
    // Selectores CSS basados en la estructura típica de CENDOJ
    // Nota: Estos selectores pueden cambiar si la web se actualiza
    $('.resultado, .sentencia-item, [class*="result"]').each((_, element) => {
      const el = $(element);
      
      const titulo = el.find('.titulo, h3, h2, .title').first().text().trim();
      const enlace = el.find('a').first().attr('href') || '';
      const id = this.extractIdFromUrl(enlace);
      
      if (titulo && id) {
        results.push({
          id,
          numeroResolucion: this.extractNumeroResolucion(titulo),
          titulo,
          fecha: this.extractFecha(el.text()),
          organo: this.extractOrgano(el.text()),
          tipoResolucion: this.extractTipoResolucion(el.text()),
          sede: this.extractSede(el.text()),
          procedimiento: '',
          extracto: this.extractExtracto(el),
          url: enlace.startsWith('http') ? enlace : `https://www.poderjudicial.es${enlace}`,
          materias: this.extractMaterias(el.text()),
        });
      }
    });

    // Si no encontramos con selectores específicos, intentar genérico
    if (results.length === 0) {
      $('article, .item, tr').each((_, element) => {
        const el = $(element);
        const texto = el.text();
        
        if (texto.includes('Sentencia') || texto.includes('Auto') || texto.includes('Resolución')) {
          const titulo = el.find('h1, h2, h3, td').first().text().trim() || texto.substring(0, 200);
          const enlace = el.find('a').attr('href') || '';
          const id = this.extractIdFromUrl(enlace) || this.generateId(titulo);
          
          results.push({
            id,
            numeroResolucion: this.extractNumeroResolucion(titulo),
            titulo: titulo.substring(0, 200),
            fecha: this.extractFecha(texto),
            organo: this.extractOrgano(texto),
            tipoResolucion: this.extractTipoResolucion(texto),
            sede: this.extractSede(texto),
            procedimiento: '',
            extracto: texto.substring(0, 500),
            url: enlace.startsWith('http') ? enlace : `https://www.poderjudicial.es${enlace}`,
            materias: this.extractMaterias(texto),
          });
        }
      });
    }

    return results;
  }

  /**
   * Parsear detalle de sentencia
   */
  private parseDetail($: cheerio.CheerioAPI, id: string): CENDOJResult {
    const titulo = $('h1').first().text().trim() || $('title').text().trim();
    const contenido = $('body').text();
    
    return {
      id,
      numeroResolucion: this.extractNumeroResolucion(titulo),
      titulo,
      fecha: this.extractFecha(contenido),
      organo: this.extractOrgano(contenido),
      tipoResolucion: this.extractTipoResolucion(contenido),
      sede: this.extractSede(contenido),
      procedimiento: this.extractProcedimiento(contenido),
      extracto: this.extractExtractoDetalle($),
      url: `https://www.poderjudicial.es/cgpj/es/Temas/Informacion-al-ciudadano/Transparencia/Buscador-de-Sentencias/detalle/${id}`,
      materias: this.extractMaterias(contenido),
      ponente: this.extractPonente(contenido),
    };
  }

  /**
   * Extraer total de resultados
   */
  private extractTotal($: cheerio.CheerioAPI): number {
    const textoTotal = $('.resultados-total, .total, [class*="total"]').first().text();
    const match = textoTotal.match(/(\d+)/);
    return match ? parseInt(match[1]) : 0;
  }

  // Helpers de extracción
  private extractIdFromUrl(url: string): string {
    const match = url.match(/\/detalle\/(\w+)/);
    return match ? match[1] : '';
  }

  private generateId(titulo: string): string {
    return 'CENDOJ-' + Buffer.from(titulo).toString('base64').substring(0, 20);
  }

  private extractNumeroResolucion(texto: string): string {
    const match = texto.match(/(STS|SAP|Auto)\s+[\d\/]+/i);
    return match ? match[0] : '';
  }

  private extractFecha(texto: string): string {
    const match = texto.match(/(\d{1,2}[\/\-]\d{1,2}[\/\-]\d{2,4})/);
    if (match) {
      const partes = match[1].split(/[\/\-]/);
      if (partes[2].length === 2) {
        partes[2] = '20' + partes[2];
      }
      return `${partes[2]}-${partes[1].padStart(2, '0')}-${partes[0].padStart(2, '0')}`;
    }
    return new Date().toISOString().split('T')[0];
  }

  private extractOrgano(texto: string): string {
    const organos = ['Tribunal Supremo', 'Audiencia Nacional', 'Audiencia Provincial', 'Juzgado'];
    for (const organo of organos) {
      if (texto.includes(organo)) return organo;
    }
    return '';
  }

  private extractTipoResolucion(texto: string): string {
    if (texto.includes('Sentencia')) return 'Sentencia';
    if (texto.includes('Auto')) return 'Auto';
    if (texto.includes('Decreto')) return 'Decreto';
    if (texto.includes('Providencia')) return 'Providencia';
    return 'Resolución';
  }

  private extractSede(texto: string): string {
    const match = texto.match(/(Madrid|Barcelona|Valencia|Sevilla|Bilbao|Zaragoza|Málaga|Murcia|Palma|Granada)/i);
    return match ? match[0] : '';
  }

  private extractProcedimiento(texto: string): string {
    const match = texto.match(/(Civil|Penal|Laboral|Contencioso|Administrativo|Social)/i);
    return match ? match[0] : '';
  }

  private extractMaterias(texto: string): string[] {
    const materias: string[] = [];
    const keywords = ['Contrato', 'Despido', 'Divorcio', 'Herencia', 'Accidente', 'Delito', 'Daños', 'Deuda'];
    
    for (const keyword of keywords) {
      if (texto.toLowerCase().includes(keyword.toLowerCase())) {
        materias.push(keyword);
      }
    }
    
    return materias;
  }

  private extractExtracto(el: cheerio.Cheerio<any>): string {
    return el.find('.extracto, .summary, .description, p').first().text().trim().substring(0, 500);
  }

  private extractExtractoDetalle($: cheerio.CheerioAPI): string {
    const parrafos = $('p, .extracto, .fundamentos, .hechos');
    let extracto = '';
    
    parrafos.each((_, el) => {
      const texto = $(el).text().trim();
      if (texto.length > 50) {
        extracto += texto + ' ';
      }
    });
    
    return extracto.substring(0, 1000);
  }

  private extractPonente(texto: string): string {
    const match = texto.match(/Ponente:\s*([^\n]+)/i);
    return match ? match[1].trim() : '';
  }

  /**
   * Sincronizar resultados con base de datos
   */
  async syncWithDatabase(prisma: any, results: CENDOJResult[]): Promise<void> {
    for (const result of results) {
      try {
        await prisma.legislacion.upsert({
          where: { id: result.id },
          update: {
            titulo: result.titulo,
            tipo: result.tipoResolucion,
            url: result.url,
            fechaPublicacion: new Date(result.fecha),
            fuente: 'CENDOJ',
            contenido: result.extracto,
          },
          create: {
            id: result.id,
            titulo: result.titulo,
            tipo: result.tipoResolucion,
            url: result.url,
            fechaPublicacion: new Date(result.fecha),
            fuente: 'CENDOJ',
            contenido: result.extracto,
          },
        });
      } catch (error) {
        console.error(`Error guardando CENDOJ ${result.id}:`, error);
      }
    }
  }

  /**
   * Limpiar cache
   */
  clearCache(): void {
    this.cache.clear();
    console.log('CENDOJ: Cache limpiado');
  }

  /**
   * Obtener estadísticas del cache
   */
  getCacheStats(): { size: number; entries: string[] } {
    return {
      size: this.cache.size,
      entries: Array.from(this.cache.keys()),
    };
  }
}

export const cendojService = new CENDOJService();

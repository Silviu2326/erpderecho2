"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.boeService = void 0;
const axios_1 = __importDefault(require("axios"));
const base_types_1 = require("./base.types");
class BOEService {
    constructor() {
        this.baseURL = 'https://www.boe.es/datos_abiertos/BOE';
        this.lastRequestTime = 0;
        this.minRequestInterval = 1000; // 1 segundo entre peticiones (rate limiting)
    }
    async rateLimit() {
        const now = Date.now();
        const timeSinceLastRequest = now - this.lastRequestTime;
        if (timeSinceLastRequest < this.minRequestInterval) {
            await new Promise(resolve => setTimeout(resolve, this.minRequestInterval - timeSinceLastRequest));
        }
        this.lastRequestTime = Date.now();
    }
    /**
     * Buscar en el BOE por términos
     * API: https://www.boe.es/datos_abiertos/BOE/[AÑO]/[NÚMERO BOE]/[ID]
     */
    async search(params) {
        await this.rateLimit();
        try {
            // La API del BOE permite búsqueda por sumario
            // Usaremos la URL de sumario para obtener datos
            let url = `${this.baseURL}/`;
            if (params.fecha) {
                // Formato: YYYYMMDD
                const fecha = params.fecha.replace(/-/g, '');
                url += `sumario/${fecha}/sumario.xml`;
            }
            else {
                // Por defecto, último sumario disponible
                const today = new Date();
                const fecha = today.toISOString().split('T')[0].replace(/-/g, '');
                url += `sumario/${fecha}/sumario.xml`;
            }
            const response = await axios_1.default.get(url, {
                timeout: 10000,
                headers: {
                    'User-Agent': 'ERPDerecho/1.0 (Legal Research)',
                },
            });
            // Parsear XML y filtrar por query si existe
            const results = this.parseSumarioXML(response.data);
            if (params.q) {
                const query = params.q.toLowerCase();
                return results.filter(r => r.titulo.toLowerCase().includes(query) ||
                    (r.extracto && r.extracto.toLowerCase().includes(query))).slice(0, params.limit || 20);
            }
            return results.slice(0, params.limit || 20);
        }
        catch (error) {
            console.error('Error buscando en BOE:', error.message);
            if (error.response?.status === 404) {
                // Si no hay sumario para esa fecha, devolver vacío
                return [];
            }
            throw new base_types_1.ServiceException('BOE_ERROR', 'Error al consultar BOE', 503);
        }
    }
    /**
     * Obtener un documento específico del BOE
     */
    async getDocumento(id) {
        await this.rateLimit();
        try {
            // El ID tiene formato: BOE-A-YYYY-XXXXX
            const url = `${this.baseURL}/${id}.xml`;
            const response = await axios_1.default.get(url, {
                timeout: 10000,
                headers: {
                    'User-Agent': 'ERPDerecho/1.0 (Legal Research)',
                },
            });
            return this.parseDocumentoXML(response.data, id);
        }
        catch (error) {
            console.error('Error obteniendo documento BOE:', error.message);
            throw new base_types_1.ServiceException('BOE_ERROR', 'Error al obtener documento del BOE', 503);
        }
    }
    /**
     * Buscar por rango de fechas
     */
    async searchByDateRange(fechaDesde, fechaHasta, query) {
        const results = [];
        const desde = new Date(fechaDesde);
        const hasta = new Date(fechaHasta);
        // Limitar a máximo 30 días para no saturar
        const diffTime = Math.abs(hasta.getTime() - desde.getTime());
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        if (diffDays > 30) {
            throw new base_types_1.ServiceException('DATE_RANGE_TOO_LARGE', 'El rango de fechas no puede superar 30 días', 400);
        }
        const current = new Date(desde);
        while (current <= hasta) {
            const fecha = current.toISOString().split('T')[0];
            const dayResults = await this.search({ fecha, q: query });
            results.push(...dayResults);
            current.setDate(current.getDate() + 1);
        }
        return results;
    }
    /**
     * Obtener últimas disposiciones publicadas
     */
    async getUltimasDisposiciones(limit = 10) {
        return this.search({ limit });
    }
    /**
     * Parsear XML del sumario
     * Nota: Implementación simplificada - en producción usar una librería XML
     */
    parseSumarioXML(xml) {
        const results = [];
        // Extracto básico - en producción usar xml2js
        const itemRegex = /<item[^>]*id\s*=\s*"([^"]*)"[^>]*>[\s\S]*?<\/item>/g;
        const tituloRegex = /<titulo><!\[CDATA\[([\s\S]*?)\]\]><\/titulo>/;
        const uriRegex = /<uri[^>]*><!\[CDATA\[([\s\S]*?)\]\]><\/uri>/;
        const pdfRegex = /<urlPdf[^>]*><!\[CDATA\[([\s\S]*?)\]\]><\/urlPdf>/;
        let match;
        while ((match = itemRegex.exec(xml)) !== null) {
            const itemXml = match[0];
            const id = match[1];
            const tituloMatch = itemXml.match(tituloRegex);
            const uriMatch = itemXml.match(uriRegex);
            const pdfMatch = itemXml.match(pdfRegex);
            if (tituloMatch) {
                results.push({
                    id,
                    titulo: this.cleanCDATA(tituloMatch[1]),
                    uri: uriMatch ? this.cleanCDATA(uriMatch[1]) : '',
                    pdf: pdfMatch ? this.cleanCDATA(pdfMatch[1]) : '',
                    fecha: this.extractFechaFromId(id),
                    departamento: '',
                    seccion: '',
                    subseccion: '',
                    tipo: 'disposicion',
                });
            }
        }
        return results;
    }
    /**
     * Parsear XML de documento individual
     */
    parseDocumentoXML(xml, id) {
        // Implementación simplificada
        const metadatosRegex = /<metadatos>([\s\S]*?)<\/metadatos>/;
        const textoRegex = /<texto>([\s\S]*?)<\/texto>/;
        const metadatosMatch = xml.match(metadatosRegex);
        const textoMatch = xml.match(textoRegex);
        // Extraer departamento, sección, etc. de metadatos
        const departamento = this.extractTag(xml, 'departamento');
        const seccion = this.extractTag(xml, 'seccion');
        const subseccion = this.extractTag(xml, 'subseccion');
        return {
            id,
            titulo: this.extractTag(xml, 'titulo') || 'Sin título',
            uri: `https://www.boe.es/diario_boe/txt.php?id=${id}`,
            pdf: `https://www.boe.es/diario_boe/pdf.php?id=${id}`,
            fecha: this.extractFechaFromId(id),
            departamento,
            seccion,
            subseccion,
            tipo: this.extractTag(xml, 'tipo') || 'disposicion',
            extracto: this.extractTag(xml, 'extracto'),
            textoCompleto: textoMatch ? this.cleanCDATA(textoMatch[1]) : undefined,
        };
    }
    extractTag(xml, tag) {
        const regex = new RegExp(`<${tag}><!\[CDATA\[([\s\S]*?)\]\]><\/${tag}>|<${tag}>([^\u003c]*)<\/${tag}>`);
        const match = xml.match(regex);
        return match ? this.cleanCDATA(match[1] || match[2] || '') : '';
    }
    cleanCDATA(text) {
        if (!text)
            return '';
        return text
            .replace(/\u003c!\[CDATA\[/g, '')
            .replace(/\]\]>/g, '')
            .replace(/\u003cp\u003e/g, '\n')
            .replace(/\u003c\/p\u003e/g, '')
            .replace(/\u003cbr\s*\/?>/g, '\n')
            .replace(/\u003c[^\u003e]+>/g, '')
            .trim();
    }
    extractFechaFromId(id) {
        // Formato BOE-A-YYYY-XXXXX
        const parts = id.split('-');
        if (parts.length >= 3) {
            return parts[2];
        }
        return new Date().toISOString().split('T')[0];
    }
    /**
     * Guardar resultados en la base de datos local
     */
    async syncWithDatabase(prisma, results) {
        for (const result of results) {
            try {
                await prisma.legislacion.upsert({
                    where: { id: result.id },
                    update: {
                        titulo: result.titulo,
                        tipo: result.tipo,
                        url: result.uri,
                        fechaPublicacion: new Date(result.fecha),
                        fuente: 'BOE',
                        contenido: result.extracto || result.textoCompleto,
                    },
                    create: {
                        id: result.id,
                        titulo: result.titulo,
                        tipo: result.tipo,
                        url: result.uri,
                        fechaPublicacion: new Date(result.fecha),
                        fuente: 'BOE',
                        contenido: result.extracto || result.textoCompleto,
                    },
                });
            }
            catch (error) {
                console.error(`Error guardando BOE ${result.id}:`, error);
            }
        }
    }
}
exports.boeService = new BOEService();
//# sourceMappingURL=boe.service.js.map
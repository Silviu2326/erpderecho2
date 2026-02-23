"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.documentoService = void 0;
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));
const database_1 = require("../config/database");
const base_types_1 = require("./base.types");
const ocr_service_1 = require("./ocr.service");
class DocumentoService {
    async findAll(params) {
        const { page = 1, limit = 20, sort = 'createdAt', order = 'desc', search, expediente_id, tipo } = params;
        const skip = (page - 1) * limit;
        const where = {
            deletedAt: null,
        };
        if (expediente_id) {
            where.expedienteId = expediente_id;
        }
        if (tipo) {
            where.tipo = tipo;
        }
        if (search) {
            where.OR = [
                { nombre: { contains: search, mode: 'insensitive' } },
                { tipo: { contains: search, mode: 'insensitive' } },
            ];
        }
        const [documentos, total] = await Promise.all([
            database_1.prisma.documento.findMany({
                where,
                skip,
                take: limit,
                orderBy: { [sort]: order },
                select: {
                    id: true,
                    nombre: true,
                    tipo: true,
                    tamano: true,
                    ruta: true,
                    mimeType: true,
                    expedienteId: true,
                    usuarioId: true,
                    createdAt: true,
                    updatedAt: true,
                    expediente: {
                        select: {
                            id: true,
                            numeroExpediente: true,
                        },
                    },
                },
            }),
            database_1.prisma.documento.count({ where }),
        ]);
        return {
            data: documentos,
            meta: {
                page,
                limit,
                total,
                totalPages: Math.ceil(total / limit),
            },
        };
    }
    async findById(id) {
        const documento = await database_1.prisma.documento.findFirst({
            where: { id, deletedAt: null },
            include: {
                expediente: {
                    select: {
                        id: true,
                        numeroExpediente: true,
                        tipo: true,
                    },
                },
                usuario: {
                    select: {
                        id: true,
                        nombre: true,
                        apellido1: true,
                    },
                },
            },
        });
        if (!documento) {
            throw new base_types_1.ServiceException('DOCUMENTO_NOT_FOUND', 'Documento no encontrado', 404);
        }
        return documento;
    }
    async create(input, usuarioId) {
        const documento = await database_1.prisma.documento.create({
            data: {
                ...input,
                usuarioId,
            },
        });
        return documento;
    }
    async update(id, input) {
        const existingDocumento = await database_1.prisma.documento.findFirst({
            where: { id, deletedAt: null },
        });
        if (!existingDocumento) {
            throw new base_types_1.ServiceException('DOCUMENTO_NOT_FOUND', 'Documento no encontrado', 404);
        }
        const documento = await database_1.prisma.documento.update({
            where: { id },
            data: input,
        });
        return documento;
    }
    async delete(id) {
        const existingDocumento = await database_1.prisma.documento.findFirst({
            where: { id, deletedAt: null },
        });
        if (!existingDocumento) {
            throw new base_types_1.ServiceException('DOCUMENTO_NOT_FOUND', 'Documento no encontrado', 404);
        }
        await database_1.prisma.documento.update({
            where: { id },
            data: { deletedAt: new Date() },
        });
    }
    async download(id) {
        const documento = await database_1.prisma.documento.findFirst({
            where: { id, deletedAt: null },
        });
        if (!documento) {
            throw new base_types_1.ServiceException('DOCUMENTO_NOT_FOUND', 'Documento no encontrado', 404);
        }
        const filePath = path.resolve(documento.ruta);
        if (!fs.existsSync(filePath)) {
            throw new base_types_1.ServiceException('FILE_NOT_FOUND', 'Archivo no encontrado en el servidor', 404);
        }
        return { filePath, fileName: documento.nombre };
    }
    async processOcr(id) {
        const documento = await database_1.prisma.documento.findFirst({
            where: { id, deletedAt: null },
        });
        if (!documento) {
            throw new base_types_1.ServiceException('DOCUMENTO_NOT_FOUND', 'Documento no encontrado', 404);
        }
        const filePath = path.resolve(documento.ruta);
        if (!fs.existsSync(filePath)) {
            throw new base_types_1.ServiceException('FILE_NOT_FOUND', 'Archivo no encontrado en el servidor', 404);
        }
        // Procesar OCR
        const ocrResult = await ocr_service_1.ocrService.extractText(filePath);
        // Analizar documento
        const analysis = await ocr_service_1.ocrService.analyzeDocument(filePath);
        // Actualizar documento con información extraída
        await database_1.prisma.documento.update({
            where: { id },
            data: {
                contenidoExtraido: ocrResult.fullText,
                metadata: {
                    ocr: {
                        confidence: ocrResult.confidence,
                        pages: ocrResult.pages,
                        language: ocrResult.language,
                        entities: ocrResult.entities,
                    },
                    analysis: {
                        documentType: analysis.documentType,
                        summary: analysis.summary,
                        keyPoints: analysis.keyPoints,
                        suggestedTags: analysis.suggestedTags,
                    },
                },
            },
        });
        return {
            documentoId: id,
            ocr: ocrResult,
            analysis,
            message: 'OCR procesado correctamente',
        };
    }
    async batchOcr(documentoIds) {
        const results = [];
        const failed = [];
        for (const id of documentoIds) {
            try {
                const result = await this.processOcr(id);
                results.push(result);
            }
            catch (error) {
                console.error(`Error procesando OCR para documento ${id}:`, error);
                failed.push(id);
            }
        }
        return { results, failed };
    }
    async searchByContent(query, params = {}) {
        const { page = 1, limit = 20 } = params;
        // Por ahora, búsqueda básica por nombre (requiere migración de DB para búsqueda en contenido)
        const resultado = await this.findAll({
            page,
            limit,
            search: query,
        });
        return resultado;
    }
}
exports.documentoService = new DocumentoService();
//# sourceMappingURL=documento.service.js.map
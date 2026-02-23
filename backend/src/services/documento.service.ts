import * as fs from 'fs';
import * as path from 'path';
import { prisma } from '../config/database';
import { ServiceException, PaginationParams, PaginatedResult } from './base.types';
import { ocrService } from './ocr.service';

export interface CreateDocumentoInput {
  nombre: string;
  tipo?: string;
  tamano?: number;
  ruta: string;
  mimeType?: string;
  expedienteId?: string;
}

export interface UpdateDocumentoInput {
  nombre?: string;
  tipo?: string;
  tamano?: number;
  ruta?: string;
  mimeType?: string;
  expedienteId?: string;
}

export interface QueryDocumentoParams extends PaginationParams {
  search?: string;
  expediente_id?: string;
  tipo?: string;
}

class DocumentoService {
  async findAll(params: QueryDocumentoParams): Promise<PaginatedResult<any>> {
    const { page = 1, limit = 20, sort = 'createdAt', order = 'desc', search, expediente_id, tipo } = params;
    const skip = (page - 1) * limit;

    const where: any = {
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
      prisma.documento.findMany({
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
      prisma.documento.count({ where }),
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

  async findById(id: string): Promise<any> {
    const documento = await prisma.documento.findFirst({
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
      throw new ServiceException('DOCUMENTO_NOT_FOUND', 'Documento no encontrado', 404);
    }

    return documento;
  }

  async create(input: CreateDocumentoInput, usuarioId: string): Promise<any> {
    const documento = await prisma.documento.create({
      data: {
        ...input,
        usuarioId,
      } as any,
    });

    return documento;
  }

  async update(id: string, input: UpdateDocumentoInput): Promise<any> {
    const existingDocumento = await prisma.documento.findFirst({
      where: { id, deletedAt: null },
    });

    if (!existingDocumento) {
      throw new ServiceException('DOCUMENTO_NOT_FOUND', 'Documento no encontrado', 404);
    }

    const documento = await prisma.documento.update({
      where: { id },
      data: input as any,
    });

    return documento;
  }

  async delete(id: string): Promise<void> {
    const existingDocumento = await prisma.documento.findFirst({
      where: { id, deletedAt: null },
    });

    if (!existingDocumento) {
      throw new ServiceException('DOCUMENTO_NOT_FOUND', 'Documento no encontrado', 404);
    }

    await prisma.documento.update({
      where: { id },
      data: { deletedAt: new Date() },
    });
  }

  async download(id: string): Promise<{ filePath: string; fileName: string }> {
    const documento = await prisma.documento.findFirst({
      where: { id, deletedAt: null },
    });

    if (!documento) {
      throw new ServiceException('DOCUMENTO_NOT_FOUND', 'Documento no encontrado', 404);
    }

    const filePath = path.resolve(documento.ruta);

    if (!fs.existsSync(filePath)) {
      throw new ServiceException('FILE_NOT_FOUND', 'Archivo no encontrado en el servidor', 404);
    }

    return { filePath, fileName: documento.nombre };
  }

  async processOcr(id: string): Promise<any> {
    const documento = await prisma.documento.findFirst({
      where: { id, deletedAt: null },
    });

    if (!documento) {
      throw new ServiceException('DOCUMENTO_NOT_FOUND', 'Documento no encontrado', 404);
    }

    const filePath = path.resolve(documento.ruta);

    if (!fs.existsSync(filePath)) {
      throw new ServiceException('FILE_NOT_FOUND', 'Archivo no encontrado en el servidor', 404);
    }

    // Procesar OCR
    const ocrResult = await ocrService.extractText(filePath);

    // Analizar documento
    const analysis = await ocrService.analyzeDocument(filePath);

    // Actualizar documento con información extraída
    await prisma.documento.update({
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
      } as any,
    });

    return {
      documentoId: id,
      ocr: ocrResult,
      analysis,
      message: 'OCR procesado correctamente',
    };
  }

  async batchOcr(documentoIds: string[]): Promise<{ results: any[]; failed: string[] }> {
    const results: any[] = [];
    const failed: string[] = [];

    for (const id of documentoIds) {
      try {
        const result = await this.processOcr(id);
        results.push(result);
      } catch (error) {
        console.error(`Error procesando OCR para documento ${id}:`, error);
        failed.push(id);
      }
    }

    return { results, failed };
  }

  async searchByContent(query: string, params: PaginationParams = {}): Promise<PaginatedResult<any>> {
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

export const documentoService = new DocumentoService();

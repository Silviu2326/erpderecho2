import * as fs from 'fs';
import * as path from 'path';
import sharp from 'sharp';
import { prisma } from '../config/database';
import { env } from '../config/env';
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

export interface UploadResult {
  documento: any;
  ocrResult?: any;
  thumbnailPath?: string;
}

class DocumentoService {
  private readonly documentsPath: string;
  private readonly thumbnailsPath: string;

  constructor() {
    this.documentsPath = path.resolve(env.UPLOAD_PATH, 'documents');
    this.thumbnailsPath = path.resolve(env.UPLOAD_PATH, 'thumbnails');
    this.ensureDirectories();
  }

  private ensureDirectories() {
    [this.documentsPath, this.thumbnailsPath].forEach(dir => {
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }
    });
  }

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
        { contenidoExtraido: { contains: search, mode: 'insensitive' } },
      ];
    }

    const [documentos, total] = await Promise.all([
      prisma.documento.findMany({
        where,
        skip,
        take: limit,
        orderBy: { [sort]: order },
        include: {
          expediente: {
            select: {
              id: true,
              numeroExpediente: true,
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
      }),
      prisma.documento.count({ where }),
    ]);

    const documentosConThumbnail = documentos.map(doc => ({
      ...doc,
      thumbnailUrl: this.getThumbnailUrl(doc.id, doc.mimeType || undefined),
    }));

    return {
      data: documentosConThumbnail,
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

    return {
      ...documento,
      thumbnailUrl: this.getThumbnailUrl(documento.id, documento.mimeType || undefined),
    };
  }

  async uploadFile(
    file: Express.Multer.File, 
    input: Partial<CreateDocumentoInput>, 
    usuarioId: string,
    processOcr: boolean = env.OCR_AUTO_PROCESS
  ): Promise<UploadResult> {
    const finalPath = path.join(this.documentsPath, file.filename);
    fs.renameSync(file.path, finalPath);

    const documento = await prisma.documento.create({
      data: {
        nombre: input.nombre || file.originalname,
        tipo: input.tipo || this.getFileType(file.mimetype),
        tamano: file.size,
        ruta: finalPath,
        mimeType: file.mimetype,
        expedienteId: input.expedienteId,
        usuarioId,
      } as any,
    });

    let thumbnailPath: string | undefined;
    try {
      thumbnailPath = await this.generateThumbnail(finalPath, documento.id, file.mimetype);
    } catch (error) {
      console.warn('Error generando thumbnail:', error);
    }

    let ocrResult: any;
    if (processOcr && this.isOcrEnabled(file.mimetype)) {
      try {
        ocrResult = await this.processOcr(documento.id);
      } catch (error) {
        console.warn('Error procesando OCR:', error);
      }
    }

    return {
      documento: {
        ...documento,
        thumbnailUrl: this.getThumbnailUrl(documento.id, documento.mimeType),
      },
      ocrResult,
      thumbnailPath,
    };
  }

  async uploadMultipleFiles(
    files: Express.Multer.File[],
    input: Partial<CreateDocumentoInput>,
    usuarioId: string,
    processOcr: boolean = env.OCR_AUTO_PROCESS
  ): Promise<UploadResult[]> {
    const results: UploadResult[] = [];
    
    for (const file of files) {
      try {
        const result = await this.uploadFile(file, input, usuarioId, processOcr);
        results.push(result);
      } catch (error) {
        console.error(`Error subiendo archivo ${file.originalname}:`, error);
        throw error;
      }
    }

    return results;
  }

  private async generateThumbnail(filePath: string, documentoId: string, mimeType: string): Promise<string | undefined> {
    if (!mimeType?.startsWith('image/')) {
      return undefined;
    }

    const thumbnailFilename = `thumb-${documentoId}.jpg`;
    const thumbnailPath = path.join(this.thumbnailsPath, thumbnailFilename);

    try {
      await sharp(filePath)
        .resize(env.THUMBNAIL_WIDTH, env.THUMBNAIL_HEIGHT, {
          fit: 'inside',
          withoutEnlargement: true
        })
        .jpeg({ quality: env.THUMBNAIL_QUALITY })
        .toFile(thumbnailPath);

      return thumbnailPath;
    } catch (error) {
      console.error('Error generando thumbnail:', error);
      return undefined;
    }
  }

  private getThumbnailUrl(documentoId: string, mimeType: string | undefined | null): string | undefined {
    if (!mimeType?.startsWith('image/')) {
      return undefined;
    }
    return `/uploads/thumbnails/thumb-${documentoId}.jpg`;
  }

  private getFileType(mimeType: string): string {
    if (mimeType.includes('pdf')) return 'PDF';
    if (mimeType.includes('image')) return 'IMAGEN';
    if (mimeType.includes('word') || mimeType.includes('document')) return 'WORD';
    if (mimeType.includes('excel') || mimeType.includes('sheet')) return 'EXCEL';
    return 'OTRO';
  }

  private isOcrEnabled(mimeType: string): boolean {
    return mimeType?.includes('pdf') || mimeType?.startsWith('image/');
  }

  async create(input: CreateDocumentoInput, usuarioId: string): Promise<any> {
    const documento = await prisma.documento.create({
      data: {
        ...input,
        usuarioId,
      } as any,
    });

    return {
      ...documento,
      thumbnailUrl: this.getThumbnailUrl(documento.id, documento.mimeType),
    };
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

    return {
      ...documento,
      thumbnailUrl: this.getThumbnailUrl(documento.id, documento.mimeType),
    };
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

    if (!this.isOcrEnabled(documento.mimeType || '')) {
      throw new ServiceException('OCR_NOT_SUPPORTED', 'Tipo de archivo no soportado para OCR', 400);
    }

    const ocrResult = await ocrService.extractText(filePath);
    const analysis = await ocrService.analyzeDocument(filePath);

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
    
    const resultado = await this.findAll({
      page,
      limit,
      search: query,
    });

    return resultado;
  }
}

export const documentoService = new DocumentoService();

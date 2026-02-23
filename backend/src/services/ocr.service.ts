import { ImageAnnotatorClient } from '@google-cloud/vision';
import { env } from '../config/env';
import { ServiceException } from './base.types';
import * as fs from 'fs';
import * as path from 'path';

export interface OCRResult {
  text: string;
  confidence: number;
  pages: number;
  language: string;
  entities: {
    dates: string[];
    amounts: string[];
    people: string[];
    organizations: string[];
    addresses: string[];
    phoneNumbers: string[];
    emails: string[];
    dniNie: string[];
    caseNumbers: string[];
  };
  fullText: string;
}

export interface DocumentAnalysis {
  summary: string;
  keyPoints: string[];
  legalEntities: string[];
  documentType: string;
  suggestedTags: string[];
}

class OCRService {
  private client: ImageAnnotatorClient | null = null;

  constructor() {
    this.initializeClient();
  }

  private initializeClient(): void {
    try {
      if (env.GOOGLE_CLOUD_KEY_FILE && fs.existsSync(env.GOOGLE_CLOUD_KEY_FILE)) {
        // Usar archivo de credenciales
        this.client = new ImageAnnotatorClient({
          keyFilename: env.GOOGLE_CLOUD_KEY_FILE,
        });
      } else if (env.GOOGLE_CLOUD_PROJECT_ID) {
        // Usar Project ID (requiere autenticación via gcloud CLI)
        this.client = new ImageAnnotatorClient({
          projectId: env.GOOGLE_CLOUD_PROJECT_ID,
        });
      } else {
        console.warn('Google Cloud Vision no configurado. OCR usará modo simulado.');
      }
    } catch (error) {
      console.error('Error inicializando Google Vision:', error);
    }
  }

  private isAvailable(): boolean {
    return this.client !== null;
  }

  async extractText(filePath: string): Promise<OCRResult> {
    if (!this.isAvailable()) {
      return this.mockOCRResult();
    }

    try {
      // Verificar que el archivo existe
      if (!fs.existsSync(filePath)) {
        throw new ServiceException('FILE_NOT_FOUND', 'Archivo no encontrado', 404);
      }

      // Leer el archivo como buffer
      const fileBuffer = fs.readFileSync(filePath);
      const base64Content = fileBuffer.toString('base64');

      // Llamar a Google Vision API
      const [result] = await this.client!.documentTextDetection({
        image: {
          content: base64Content,
        },
      });

      const fullTextAnnotation = result.fullTextAnnotation;
      
      if (!fullTextAnnotation || !fullTextAnnotation.text) {
        throw new ServiceException('OCR_FAILED', 'No se pudo extraer texto del documento', 422);
      }

      const text = fullTextAnnotation.text;
      const pages = fullTextAnnotation.pages?.length || 1;
      
      // Detectar idioma
      const language = this.detectLanguage(fullTextAnnotation);
      
      // Calcular confianza promedio
      const confidence = this.calculateConfidence(fullTextAnnotation);

      // Extraer entidades
      const entities = this.extractEntities(text);

      return {
        text: text.substring(0, 5000), // Limitar texto extraído
        confidence,
        pages,
        language,
        entities,
        fullText: text,
      };
    } catch (error: any) {
      console.error('Error en OCR:', error);
      
      if (error.code === 'ENOENT') {
        throw new ServiceException('FILE_NOT_FOUND', 'Archivo no encontrado', 404);
      }
      
      // Fallback a mock en caso de error
      return this.mockOCRResult();
    }
  }

  async extractTextFromUrl(imageUrl: string): Promise<OCRResult> {
    if (!this.isAvailable()) {
      return this.mockOCRResult();
    }

    try {
      const [result] = await this.client!.documentTextDetection({
        image: {
          source: {
            imageUri: imageUrl,
          },
        },
      });

      const fullTextAnnotation = result.fullTextAnnotation;
      
      if (!fullTextAnnotation || !fullTextAnnotation.text) {
        throw new ServiceException('OCR_FAILED', 'No se pudo extraer texto de la imagen', 422);
      }

      const text = fullTextAnnotation.text;
      const pages = fullTextAnnotation.pages?.length || 1;
      const language = this.detectLanguage(fullTextAnnotation);
      const confidence = this.calculateConfidence(fullTextAnnotation);
      const entities = this.extractEntities(text);

      return {
        text: text.substring(0, 5000),
        confidence,
        pages,
        language,
        entities,
        fullText: text,
      };
    } catch (error) {
      console.error('Error en OCR desde URL:', error);
      return this.mockOCRResult();
    }
  }

  async analyzeDocument(filePath: string): Promise<DocumentAnalysis> {
    const ocrResult = await this.extractText(filePath);
    
    // Analizar el texto extraído
    const analysis: DocumentAnalysis = {
      summary: this.generateSummary(ocrResult.fullText),
      keyPoints: this.extractKeyPoints(ocrResult.fullText),
      legalEntities: this.extractLegalEntities(ocrResult.fullText),
      documentType: this.detectDocumentType(ocrResult.fullText),
      suggestedTags: this.generateTags(ocrResult),
    };

    return analysis;
  }

  async batchOCR(filePaths: string[]): Promise<{ results: OCRResult[]; failed: string[] }> {
    const results: OCRResult[] = [];
    const failed: string[] = [];

    for (const filePath of filePaths) {
      try {
        const result = await this.extractText(filePath);
        results.push(result);
      } catch (error) {
        console.error(`Error procesando ${filePath}:`, error);
        failed.push(filePath);
      }
    }

    return { results, failed };
  }

  private detectLanguage(annotation: any): string {
    const pages = annotation.pages || [];
    if (pages.length === 0) return 'unknown';

    const page = pages[0];
    const languages = page.property?.detectedLanguages || [];
    
    if (languages.length > 0) {
      return languages[0].languageCode || 'unknown';
    }

    return 'unknown';
  }

  private calculateConfidence(annotation: any): number {
    const pages = annotation.pages || [];
    if (pages.length === 0) return 0.5;

    let totalConfidence = 0;
    let blockCount = 0;

    for (const page of pages) {
      for (const block of page.blocks || []) {
        totalConfidence += block.confidence || 0;
        blockCount++;
      }
    }

    return blockCount > 0 ? Math.round((totalConfidence / blockCount) * 100) / 100 : 0.5;
  }

  private extractEntities(text: string): OCRResult['entities'] {
    const entities: OCRResult['entities'] = {
      dates: [],
      amounts: [],
      people: [],
      organizations: [],
      addresses: [],
      phoneNumbers: [],
      emails: [],
      dniNie: [],
      caseNumbers: [],
    };

    // Extraer fechas (formatos españoles)
    const dateRegex = /\b(\d{1,2}[\/\-\.]\d{1,2}[\/\-\.]\d{2,4}|\d{4}[\/\-\.]\d{1,2}[\/\-\.]\d{1,2})\b/g;
    entities.dates = [...text.matchAll(dateRegex)].map(m => m[0]);

    // Extraer montos (€, EUR)
    const amountRegex = /\b(\d{1,3}(?:\.?\d{3})*(?:,\d{2})?\s*(?:€|EUR|euros?))\b/gi;
    entities.amounts = [...text.matchAll(amountRegex)].map(m => m[0]);

    // Extraer emails
    const emailRegex = /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/g;
    entities.emails = [...text.matchAll(emailRegex)].map(m => m[0]);

    // Extraer teléfonos (formatos españoles)
    const phoneRegex = /\b(?:\+34\s?)?[6789]\d{2}[\s\-]?\d{3}[\s\-]?\d{3}\b/g;
    entities.phoneNumbers = [...text.matchAll(phoneRegex)].map(m => m[0]);

    // Extraer DNI/NIE
    const dniRegex = /\b\d{8}[A-Z]\b|\b[X-Z]\d{7}[A-Z]\b/gi;
    entities.dniNie = [...text.matchAll(dniRegex)].map(m => m[0]);

    // Extraer números de expediente/caso
    const caseRegex = /\b(?:expediente|nº|número|ref)[:\s]*([A-Z0-9\-\/]+)\b/gi;
    entities.caseNumbers = [...text.matchAll(caseRegex)].map(m => m[1]);

    return entities;
  }

  private generateSummary(text: string): string {
    // Tomar las primeras 3-5 oraciones como resumen
    const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 10);
    const summarySentences = sentences.slice(0, Math.min(5, sentences.length));
    return summarySentences.join('. ').trim() + '.';
  }

  private extractKeyPoints(text: string): string[] {
    const keyPoints: string[] = [];
    const lines = text.split('\n');

    // Buscar líneas que parecen importantes
    for (const line of lines) {
      const trimmed = line.trim();
      
      // Detectar fechas importantes
      if (/\b(?:fecha|plazo|vencimiento|término)\b/i.test(trimmed) && /\d{1,2}[\/\-]/.test(trimmed)) {
        keyPoints.push(trimmed);
      }
      
      // Detectar montos
      if (/\b(?:cantidad|importe|total|suma)\b/i.test(trimmed) && /[€\d]/.test(trimmed)) {
        keyPoints.push(trimmed);
      }
      
      // Detectar partes
      if (/\b(?:demandante|demandado|actor|demandado|parte)\b/i.test(trimmed)) {
        keyPoints.push(trimmed);
      }

      // Limitar a 10 puntos clave
      if (keyPoints.length >= 10) break;
    }

    return keyPoints;
  }

  private extractLegalEntities(text: string): string[] {
    const entities: string[] = [];
    
    // Buscar términos legales comunes
    const legalTerms = [
      /\b(?:juzgado|audiencia|tribunal)\s+[^\n]+/gi,
      /\b(?:procedimiento|expediente)\s+[^\n]+/gi,
      /\b(?:diligencia|resolución|sentencia|auto|decreto)\b/gi,
      /\b(?:procurador|abogado|letrado)\s+[^\n]+/gi,
    ];

    for (const regex of legalTerms) {
      const matches = [...text.matchAll(regex)].map(m => m[0].trim());
      entities.push(...matches);
    }

    // Eliminar duplicados y limitar
    return [...new Set(entities)].slice(0, 20);
  }

  private detectDocumentType(text: string): string {
    const textLower = text.toLowerCase();
    
    if (/demanda|demandante|demandado/.test(textLower)) return 'demanda';
    if (/sentencia|fallo|resolución judicial/.test(textLower)) return 'sentencia';
    if (/contrato|acuerdo|pacto/.test(textLower)) return 'contrato';
    if (/factura|recibo|albarán/.test(textLower)) return 'factura';
    if (/escritura|notaría|notario/.test(textLower)) return 'escritura';
    if (/informe|memoria|dictamen/.test(textLower)) return 'informe';
    if (/diligencia|acta|certificación/.test(textLower)) return 'diligencia';
    if (/poder|mandato|representación/.test(textLower)) return 'poder';
    if (/escrito|alegaciones|recurso/.test(textLower)) return 'escrito';
    if (/notificación|emplazamiento|cédula/.test(textLower)) return 'notificación';
    
    return 'documento';
  }

  private generateTags(ocrResult: OCRResult): string[] {
    const tags: string[] = [];
    const textLower = ocrResult.fullText.toLowerCase();

    // Tags por tipo de documento
    tags.push(this.detectDocumentType(ocrResult.fullText));

    // Tags por contenido
    if (/civil|mercantil|penal|laboral|administrativo/.test(textLower)) {
      const matches = textLower.match(/civil|mercantil|penal|laboral|administrativo/g);
      if (matches) tags.push(...matches);
    }

    // Tags por materia
    if (/divorcio|separación|matrimonio/.test(textLower)) tags.push('familia');
    if (/desahucio|arrendamiento|alquiler/.test(textLower)) tags.push('arrendamiento');
    if (/despido|trabajo|laboral/.test(textLower)) tags.push('laboral');
    if (/accidente|tráfico|circulación/.test(textLower)) tags.push('accidente');
    if (/herencia|testamento|sucesión/.test(textLower)) tags.push('sucesiones');
    if (/reclamación|cantidad|deuda/.test(textLower)) tags.push('reclamación');

    // Eliminar duplicados
    return [...new Set(tags)];
  }

  private mockOCRResult(): OCRResult {
    return {
      text: 'Texto extraído del documento (modo simulado - configure Google Cloud Vision para OCR real)',
      confidence: 0.5,
      pages: 1,
      language: 'es',
      entities: {
        dates: [],
        amounts: [],
        people: [],
        organizations: [],
        addresses: [],
        phoneNumbers: [],
        emails: [],
        dniNie: [],
        caseNumbers: [],
      },
      fullText: 'Texto completo del documento (modo simulado)',
    };
  }
}

export const ocrService = new OCRService();

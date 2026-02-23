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
exports.ocrService = void 0;
const vision_1 = require("@google-cloud/vision");
const env_1 = require("../config/env");
const base_types_1 = require("./base.types");
const fs = __importStar(require("fs"));
class OCRService {
    constructor() {
        this.client = null;
        this.initializeClient();
    }
    initializeClient() {
        try {
            if (env_1.env.GOOGLE_CLOUD_KEY_FILE && fs.existsSync(env_1.env.GOOGLE_CLOUD_KEY_FILE)) {
                // Usar archivo de credenciales
                this.client = new vision_1.ImageAnnotatorClient({
                    keyFilename: env_1.env.GOOGLE_CLOUD_KEY_FILE,
                });
            }
            else if (env_1.env.GOOGLE_CLOUD_PROJECT_ID) {
                // Usar Project ID (requiere autenticación via gcloud CLI)
                this.client = new vision_1.ImageAnnotatorClient({
                    projectId: env_1.env.GOOGLE_CLOUD_PROJECT_ID,
                });
            }
            else {
                console.warn('Google Cloud Vision no configurado. OCR usará modo simulado.');
            }
        }
        catch (error) {
            console.error('Error inicializando Google Vision:', error);
        }
    }
    isAvailable() {
        return this.client !== null;
    }
    async extractText(filePath) {
        if (!this.isAvailable()) {
            return this.mockOCRResult();
        }
        try {
            // Verificar que el archivo existe
            if (!fs.existsSync(filePath)) {
                throw new base_types_1.ServiceException('FILE_NOT_FOUND', 'Archivo no encontrado', 404);
            }
            // Leer el archivo como buffer
            const fileBuffer = fs.readFileSync(filePath);
            const base64Content = fileBuffer.toString('base64');
            // Llamar a Google Vision API
            const [result] = await this.client.documentTextDetection({
                image: {
                    content: base64Content,
                },
            });
            const fullTextAnnotation = result.fullTextAnnotation;
            if (!fullTextAnnotation || !fullTextAnnotation.text) {
                throw new base_types_1.ServiceException('OCR_FAILED', 'No se pudo extraer texto del documento', 422);
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
        }
        catch (error) {
            console.error('Error en OCR:', error);
            if (error.code === 'ENOENT') {
                throw new base_types_1.ServiceException('FILE_NOT_FOUND', 'Archivo no encontrado', 404);
            }
            // Fallback a mock en caso de error
            return this.mockOCRResult();
        }
    }
    async extractTextFromUrl(imageUrl) {
        if (!this.isAvailable()) {
            return this.mockOCRResult();
        }
        try {
            const [result] = await this.client.documentTextDetection({
                image: {
                    source: {
                        imageUri: imageUrl,
                    },
                },
            });
            const fullTextAnnotation = result.fullTextAnnotation;
            if (!fullTextAnnotation || !fullTextAnnotation.text) {
                throw new base_types_1.ServiceException('OCR_FAILED', 'No se pudo extraer texto de la imagen', 422);
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
        }
        catch (error) {
            console.error('Error en OCR desde URL:', error);
            return this.mockOCRResult();
        }
    }
    async analyzeDocument(filePath) {
        const ocrResult = await this.extractText(filePath);
        // Analizar el texto extraído
        const analysis = {
            summary: this.generateSummary(ocrResult.fullText),
            keyPoints: this.extractKeyPoints(ocrResult.fullText),
            legalEntities: this.extractLegalEntities(ocrResult.fullText),
            documentType: this.detectDocumentType(ocrResult.fullText),
            suggestedTags: this.generateTags(ocrResult),
        };
        return analysis;
    }
    async batchOCR(filePaths) {
        const results = [];
        const failed = [];
        for (const filePath of filePaths) {
            try {
                const result = await this.extractText(filePath);
                results.push(result);
            }
            catch (error) {
                console.error(`Error procesando ${filePath}:`, error);
                failed.push(filePath);
            }
        }
        return { results, failed };
    }
    detectLanguage(annotation) {
        const pages = annotation.pages || [];
        if (pages.length === 0)
            return 'unknown';
        const page = pages[0];
        const languages = page.property?.detectedLanguages || [];
        if (languages.length > 0) {
            return languages[0].languageCode || 'unknown';
        }
        return 'unknown';
    }
    calculateConfidence(annotation) {
        const pages = annotation.pages || [];
        if (pages.length === 0)
            return 0.5;
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
    extractEntities(text) {
        const entities = {
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
    generateSummary(text) {
        // Tomar las primeras 3-5 oraciones como resumen
        const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 10);
        const summarySentences = sentences.slice(0, Math.min(5, sentences.length));
        return summarySentences.join('. ').trim() + '.';
    }
    extractKeyPoints(text) {
        const keyPoints = [];
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
            if (keyPoints.length >= 10)
                break;
        }
        return keyPoints;
    }
    extractLegalEntities(text) {
        const entities = [];
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
    detectDocumentType(text) {
        const textLower = text.toLowerCase();
        if (/demanda|demandante|demandado/.test(textLower))
            return 'demanda';
        if (/sentencia|fallo|resolución judicial/.test(textLower))
            return 'sentencia';
        if (/contrato|acuerdo|pacto/.test(textLower))
            return 'contrato';
        if (/factura|recibo|albarán/.test(textLower))
            return 'factura';
        if (/escritura|notaría|notario/.test(textLower))
            return 'escritura';
        if (/informe|memoria|dictamen/.test(textLower))
            return 'informe';
        if (/diligencia|acta|certificación/.test(textLower))
            return 'diligencia';
        if (/poder|mandato|representación/.test(textLower))
            return 'poder';
        if (/escrito|alegaciones|recurso/.test(textLower))
            return 'escrito';
        if (/notificación|emplazamiento|cédula/.test(textLower))
            return 'notificación';
        return 'documento';
    }
    generateTags(ocrResult) {
        const tags = [];
        const textLower = ocrResult.fullText.toLowerCase();
        // Tags por tipo de documento
        tags.push(this.detectDocumentType(ocrResult.fullText));
        // Tags por contenido
        if (/civil|mercantil|penal|laboral|administrativo/.test(textLower)) {
            const matches = textLower.match(/civil|mercantil|penal|laboral|administrativo/g);
            if (matches)
                tags.push(...matches);
        }
        // Tags por materia
        if (/divorcio|separación|matrimonio/.test(textLower))
            tags.push('familia');
        if (/desahucio|arrendamiento|alquiler/.test(textLower))
            tags.push('arrendamiento');
        if (/despido|trabajo|laboral/.test(textLower))
            tags.push('laboral');
        if (/accidente|tráfico|circulación/.test(textLower))
            tags.push('accidente');
        if (/herencia|testamento|sucesión/.test(textLower))
            tags.push('sucesiones');
        if (/reclamación|cantidad|deuda/.test(textLower))
            tags.push('reclamación');
        // Eliminar duplicados
        return [...new Set(tags)];
    }
    mockOCRResult() {
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
exports.ocrService = new OCRService();
//# sourceMappingURL=ocr.service.js.map
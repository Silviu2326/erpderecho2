"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.aiService = void 0;
const openai_1 = __importDefault(require("openai"));
const env_1 = require("../config/env");
const base_types_1 = require("./base.types");
class AIService {
    constructor() {
        if (!env_1.env.OPENAI_API_KEY) {
            console.warn('OPENAI_API_KEY no configurada. Las predicciones usarán mocks.');
        }
        this.client = new openai_1.default({
            apiKey: env_1.env.OPENAI_API_KEY,
        });
    }
    isAvailable() {
        return !!env_1.env.OPENAI_API_KEY;
    }
    async analizarCaso(input) {
        if (!this.isAvailable()) {
            return this.getMockPrediccion(input.tipo);
        }
        const prompt = this.buildAnalisisPrompt(input);
        try {
            const response = await this.client.chat.completions.create({
                model: env_1.env.OPENAI_MODEL,
                messages: [
                    {
                        role: 'system',
                        content: `Eres un asistente legal experto en derecho español. Analiza casos legales y proporciona predicciones profesionales.
            Responde SIEMPRE en formato JSON con esta estructura exacta:
            {
              "resultadoProbable": "string",
              "probabilidadExito": number (0-100),
              "argumentosClave": ["string"],
              "jurisprudenciaRelevante": ["string"],
              "recomendaciones": ["string"],
              "duracionEstimada": "string",
              "costesEstimados": "string"
            }`,
                    },
                    {
                        role: 'user',
                        content: prompt,
                    },
                ],
                temperature: 0.7,
                max_tokens: 1000,
            });
            const content = response.choices[0]?.message?.content;
            if (!content) {
                throw new base_types_1.ServiceException('AI_ERROR', 'No se pudo obtener respuesta de la IA', 500);
            }
            return this.parseAIResponse(content);
        }
        catch (error) {
            console.error('Error en analizarCaso:', error);
            return this.getMockPrediccion(input.tipo);
        }
    }
    async analizarSentimiento(texto) {
        if (!this.isAvailable()) {
            return {
                sentimiento: 'neutral',
                confianza: 0.5,
                factores: ['Sin análisis - API no disponible'],
            };
        }
        try {
            const response = await this.client.chat.completions.create({
                model: env_1.env.OPENAI_MODEL,
                messages: [
                    {
                        role: 'system',
                        content: `Analiza el sentimiento del siguiente texto relacionado con un caso legal.
            Responde en formato JSON:
            {
              "sentimiento": "positivo" | "neutral" | "negativo",
              "confianza": number (0-1),
              "factores": ["string"]
            }`,
                    },
                    {
                        role: 'user',
                        content: texto,
                    },
                ],
                temperature: 0.3,
                max_tokens: 300,
            });
            const content = response.choices[0]?.message?.content;
            if (!content) {
                throw new Error('No content');
            }
            return JSON.parse(content);
        }
        catch (error) {
            console.error('Error en analizarSentimiento:', error);
            return {
                sentimiento: 'neutral',
                confianza: 0.5,
                factores: ['Error en análisis'],
            };
        }
    }
    async generarEstrategia(input) {
        if (!this.isAvailable()) {
            return this.getMockEstrategia();
        }
        const prompt = this.buildEstrategiaPrompt(input);
        try {
            const response = await this.client.chat.completions.create({
                model: env_1.env.OPENAI_MODEL,
                messages: [
                    {
                        role: 'system',
                        content: `Eres un estratega legal experto. Genera estrategias para casos legales.
            Responde en formato JSON:
            {
              "estrategiaRecomendada": "string",
              "pasosPrioritarios": ["string"],
              "riesgosIdentificados": ["string"],
              "oportunidades": ["string"]
            }`,
                    },
                    {
                        role: 'user',
                        content: prompt,
                    },
                ],
                temperature: 0.7,
                max_tokens: 800,
            });
            const content = response.choices[0]?.message?.content;
            if (!content) {
                throw new Error('No content');
            }
            return JSON.parse(content);
        }
        catch (error) {
            console.error('Error en generarEstrategia:', error);
            return this.getMockEstrategia();
        }
    }
    async resumirDocumento(texto, maxPalabras = 200) {
        if (!this.isAvailable()) {
            return texto.substring(0, 200) + '...';
        }
        try {
            const response = await this.client.chat.completions.create({
                model: env_1.env.OPENAI_MODEL,
                messages: [
                    {
                        role: 'system',
                        content: `Resume el siguiente documento legal en máximo ${maxPalabras} palabras. Mantén los puntos clave y la información legal relevante.`,
                    },
                    {
                        role: 'user',
                        content: texto,
                    },
                ],
                temperature: 0.5,
                max_tokens: 500,
            });
            return response.choices[0]?.message?.content || texto.substring(0, 200) + '...';
        }
        catch (error) {
            console.error('Error en resumirDocumento:', error);
            return texto.substring(0, 200) + '...';
        }
    }
    async extraerEntidadesLegales(texto) {
        if (!this.isAvailable()) {
            return { fechas: [], montos: [], personas: [], conceptosLegales: [] };
        }
        try {
            const response = await this.client.chat.completions.create({
                model: env_1.env.OPENAI_MODEL,
                messages: [
                    {
                        role: 'system',
                        content: `Extrae entidades legales del texto. Responde en formato JSON:
            {
              "fechas": ["string"],
              "montos": ["string"],
              "personas": ["string"],
              "conceptosLegales": ["string"]
            }`,
                    },
                    {
                        role: 'user',
                        content: texto,
                    },
                ],
                temperature: 0.3,
                max_tokens: 500,
            });
            const content = response.choices[0]?.message?.content;
            if (!content) {
                throw new Error('No content');
            }
            return JSON.parse(content);
        }
        catch (error) {
            console.error('Error en extraerEntidadesLegales:', error);
            return { fechas: [], montos: [], personas: [], conceptosLegales: [] };
        }
    }
    buildAnalisisPrompt(input) {
        return `Analiza el siguiente caso legal:

Tipo: ${input.tipo}
Descripción: ${input.descripcion}
${input.parteDemandante ? `Parte Demandante: ${input.parteDemandante}` : ''}
${input.parteDemandada ? `Parte Demandada: ${input.parteDemandada}` : ''}
${input.pretensiones ? `Pretensiones: ${input.pretensiones}` : ''}
${input.pruebas && input.pruebas.length > 0 ? `Pruebas: ${input.pruebas.join(', ')}` : ''}

Proporciona un análisis legal completo con predicción del resultado.`;
    }
    buildEstrategiaPrompt(input) {
        return `Genera una estrategia legal para el siguiente caso:

Tipo: ${input.tipo}
Descripción: ${input.descripcion}
${input.parteDemandante ? `Parte Demandante: ${input.parteDemandante}` : ''}
${input.parteDemandada ? `Parte Demandada: ${input.parteDemandada}` : ''}
${input.pretensiones ? `Pretensiones: ${input.pretensiones}` : ''}

¿Qué estrategia recomiendas?`;
    }
    parseAIResponse(content) {
        try {
            // Intentar extraer JSON de la respuesta
            const jsonMatch = content.match(/\{[\s\S]*\}/);
            if (jsonMatch) {
                return JSON.parse(jsonMatch[0]);
            }
            throw new Error('No JSON found');
        }
        catch (error) {
            console.error('Error parseando respuesta IA:', error);
            return this.getMockPrediccion('general');
        }
    }
    getMockPrediccion(tipo) {
        const mockResultados = {
            CIVIL: {
                resultadoProbable: 'Estimación parcial favorable',
                probabilidadExito: 65,
                argumentosClave: [
                    'Pruebas documentales presentadas',
                    'Jurisprudencia favorable reciente',
                    'Prescripción no ha operado',
                ],
                jurisprudenciaRelevante: [
                    'STS 123/2023 sobre contratos',
                    'SAP Madrid 456/2022',
                ],
                recomendaciones: [
                    'Reforzar pruebas documentales',
                    'Solicitar informe pericial',
                    'Considerar mediación antes del juicio',
                ],
                duracionEstimada: '8-14 meses',
                costesEstimados: '3.000-8.000 EUR',
            },
            PENAL: {
                resultadoProbable: 'Absolución/Condena leve',
                probabilidadExito: 70,
                argumentosClave: [
                    'Falta de pruebas concluyentes',
                    'Testigos favorables',
                    'Antecedentes limpios',
                ],
                jurisprudenciaRelevante: [
                    'STS 789/2023 penal',
                    'SAP Barcelona 321/2022',
                ],
                recomendaciones: [
                    'Preparar testigos de descargo',
                    'Solicitar informe forense',
                    'Negociar conformidad',
                ],
                duracionEstimada: '12-24 meses',
                costesEstimados: '5.000-15.000 EUR',
            },
            LABORAL: {
                resultadoProbable: 'Favorable al trabajador',
                probabilidadExito: 80,
                argumentosClave: [
                    'Documentación contractual incompleta',
                    'Despido procedente dudoso',
                    'Derechos laborales vulnerados',
                ],
                jurisprudenciaRelevante: [
                    'STSJ Madrid 111/2023',
                    'Sentencias favorable despido improcedente',
                ],
                recomendaciones: [
                    'Documentar horas extras no pagadas',
                    'Revisar nóminas',
                    'Preparar testigos compañeros',
                ],
                duracionEstimada: '4-8 meses',
                costesEstimados: '1.500-4.000 EUR',
            },
        };
        return (mockResultados[tipo] || {
            resultadoProbable: 'Resultado incierto - se necesita más información',
            probabilidadExito: 50,
            argumentosClave: ['Análisis preliminar necesario', 'Revisar documentación'],
            jurisprudenciaRelevante: ['Consultar jurisprudencia específica'],
            recomendaciones: ['Reunir toda la documentación', 'Consultar con especialista'],
            duracionEstimada: '6-18 meses',
            costesEstimados: '2.000-10.000 EUR',
        });
    }
    getMockEstrategia() {
        return {
            estrategiaRecomendada: 'Estrategia defensiva con enfoque en negociación previa',
            pasosPrioritarios: [
                'Reunir toda la documentación relevante',
                'Realizar informe pericial si procede',
                'Intentar negociación extrajudicial',
                'Preparar demanda con todos los argumentos',
            ],
            riesgosIdentificados: [
                'Prescripción próxima',
                'Falta de pruebas documentales',
                'Testigos poco fiables',
            ],
            oportunidades: [
                'Jurisprudencia favorable reciente',
                'Parte contraria dispuesta a negociar',
                'Interés público en el caso',
            ],
        };
    }
}
exports.aiService = new AIService();
//# sourceMappingURL=ai.service.js.map
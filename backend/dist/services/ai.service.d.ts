export interface AnalisisCasoInput {
    tipo: string;
    descripcion: string;
    parteDemandante?: string;
    parteDemandada?: string;
    pretensiones?: string;
    pruebas?: string[];
}
export interface PrediccionResultado {
    resultadoProbable: string;
    probabilidadExito: number;
    argumentosClave: string[];
    jurisprudenciaRelevante: string[];
    recomendaciones: string[];
    duracionEstimada: string;
    costesEstimados: string;
}
export interface AnalisisSentimiento {
    sentimiento: 'positivo' | 'neutral' | 'negativo';
    confianza: number;
    factores: string[];
}
export interface EstrategiaLegal {
    estrategiaRecomendada: string;
    pasosPrioritarios: string[];
    riesgosIdentificados: string[];
    oportunidades: string[];
}
declare class AIService {
    private client;
    constructor();
    private isAvailable;
    analizarCaso(input: AnalisisCasoInput): Promise<PrediccionResultado>;
    analizarSentimiento(texto: string): Promise<AnalisisSentimiento>;
    generarEstrategia(input: AnalisisCasoInput): Promise<EstrategiaLegal>;
    resumirDocumento(texto: string, maxPalabras?: number): Promise<string>;
    extraerEntidadesLegales(texto: string): Promise<{
        fechas: string[];
        montos: string[];
        personas: string[];
        conceptosLegales: string[];
    }>;
    private buildAnalisisPrompt;
    private buildEstrategiaPrompt;
    private parseAIResponse;
    private getMockPrediccion;
    private getMockEstrategia;
}
export declare const aiService: AIService;
export {};
//# sourceMappingURL=ai.service.d.ts.map
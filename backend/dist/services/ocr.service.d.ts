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
declare class OCRService {
    private client;
    constructor();
    private initializeClient;
    private isAvailable;
    extractText(filePath: string): Promise<OCRResult>;
    extractTextFromUrl(imageUrl: string): Promise<OCRResult>;
    analyzeDocument(filePath: string): Promise<DocumentAnalysis>;
    batchOCR(filePaths: string[]): Promise<{
        results: OCRResult[];
        failed: string[];
    }>;
    private detectLanguage;
    private calculateConfidence;
    private extractEntities;
    private generateSummary;
    private extractKeyPoints;
    private extractLegalEntities;
    private detectDocumentType;
    private generateTags;
    private mockOCRResult;
}
export declare const ocrService: OCRService;
export {};
//# sourceMappingURL=ocr.service.d.ts.map
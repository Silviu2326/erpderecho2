// OCR Service - Receipt/Invoice Scanning
// Uses Tesseract.js for client-side OCR (demo)

export interface OCRResult {
  success: boolean;
  rawText: string;
  extractedData: {
    vendor?: string;
    date?: string;
    total?: number;
    tax?: number;
    items?: Array<{
      description: string;
      quantity?: number;
      unitPrice?: number;
      total?: number;
    }>;
    invoiceNumber?: string;
    cif?: string;
  };
  confidence: number;
  processingTime: number;
}

export interface OCRConfig {
  language: string;
  whitelistChars?: string;
}

class OCRService {
  private isProcessing: boolean = false;

  /**
   * Process an image file (receipt/invoice)
   * Uses Tesseract.js for OCR
   */
  async processImage(file: File, config?: OCRConfig): Promise<OCRResult> {
    if (this.isProcessing) {
      throw new Error('Another OCR process is already running');
    }

    this.isProcessing = true;
    const startTime = Date.now();

    try {
      console.log('[OCR] Processing image:', file.name);

      // In production: use Tesseract.js or cloud OCR service
      // For demo: return mock data after delay
      await new Promise(resolve => setTimeout(resolve, 2000));

      // Mock extracted data
      const mockResult: OCRResult = {
        success: true,
        rawText: `FACTURA
Restaurante La Casa
CIF: B12345678
C/ Mayor 123, Madrid

Fecha: ${new Date().toLocaleDateString('es-ES')}
Factura #: 2024-001

1. Comida............... 25.00€
2. Bebidas............... 12.50€
3. Postre................ 8.00€

Subtotal: 45.50€
IVA 21%: 9.56€
TOTAL: 55.06€

Gracias por su visita`,
        extractedData: {
          vendor: 'Restaurante La Casa',
          date: new Date().toISOString().split('T')[0],
          total: 55.06,
          tax: 9.56,
          invoiceNumber: '2024-001',
          cif: 'B12345678',
          items: [
            { description: 'Comida', total: 25.00 },
            { description: 'Bebidas', total: 12.50 },
            { description: 'Postre', total: 8.00 }
          ]
        },
        confidence: 0.92,
        processingTime: Date.now() - startTime
      };

      console.log('[OCR] Result:', mockResult);
      return mockResult;
    } catch (error) {
      console.error('[OCR] Error:', error);
      return {
        success: false,
        rawText: '',
        extractedData: {},
        confidence: 0,
        processingTime: Date.now() - startTime
      };
    } finally {
      this.isProcessing = false;
    }
  }

  /**
   * Process image from camera (mobile)
   */
  async processFromCamera(): Promise<OCRResult | null> {
    // In production: use navigator.mediaDevices for camera capture
    console.log('[OCR] Camera capture not implemented in demo');
    return null;
  }

  /**
   * Validate extracted data
   */
  validateExtractedData(data: OCRResult['extractedData']): {
    valid: boolean;
    errors: string[];
    warnings: string[];
  } {
    const errors: string[] = [];
    const warnings: string[] = [];

    if (!data.vendor) errors.push('No el proveedor');
    if (!data.date) errors.push('No se ha detectado la fecha');
    if (!data.total) errors.push('No se ha detectado el total');

    if (data.total && data.total > 10000) {
      warnings.push('El importe parece inusualmente alto');
    }

    return {
      valid: errors.length === 0,
      errors,
      warnings
    };
  }
}

export const ocrService = new OCRService();

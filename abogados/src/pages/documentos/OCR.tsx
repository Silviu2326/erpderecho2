// M2 - Gestión Documental: OCR
// Escaneo y reconocimiento óptico de caracteres

import { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Upload, FileText, Camera, Image, X, Check, 
  AlertCircle, Loader2, Edit2, Trash2, Save
} from 'lucide-react';
import { ocrService, type OCRResult } from '@/services/ocrService';
import { useToast } from '@/components/ui/Toast';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Form';
import { Card, Badge } from '@/components/ui';
import { Breadcrumbs } from '@/components/ui/Breadcrumbs';
import { LoadingOverlay } from '@/components/ui/Loading';

// Datos mock de reconocimientos anteriores
const historialOCR = [
  { id: 'OCR-001', archivo: 'factura_restaurante.jpg', fecha: '2024-05-15', proveedor: 'Restaurante La Casa', total: 55.06, estado: 'completado' },
  { id: 'OCR-002', archivo: 'ticket_gasolina.pdf', fecha: '2024-05-14', proveedor: 'Repsol', total: 45.00, estado: 'completado' },
  { id: 'OCR-003', archivo: 'factura_servicios.pdf', fecha: '2024-05-10', proveedor: 'Telefónica', total: 89.99, estado: 'completado' },
  { id: 'OCR-004', archivo: 'ticket_supermercado.jpg', fecha: '2024-05-08', proveedor: 'Mercadona', total: 32.50, estado: 'completado' },
];

export default function DocumentosOCR() {
  const [isProcessing, setIsProcessing] = useState(false);
  const [ocrResult, setOcrResult] = useState<OCRResult | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [dragActive, setDragActive] = useState(false);
  const [editedData, setEditedData] = useState<any>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const { showToast } = useToast();

  const handleFile = async (file: File) => {
    if (!file) return;
    
    setSelectedFile(file);
    setIsProcessing(true);
    setOcrResult(null);
    showToast('Procesando documento...', 'info');

    try {
      const result = await ocrService.processImage(file);
      setOcrResult(result);
      setEditedData(result.extractedData);
    } catch (error) {
      console.error('OCR Error:', error);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setDragActive(true);
  };

  const handleDragLeave = () => {
    setDragActive(false);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleFile(e.target.files[0]);
    }
  };

  const handleSave = () => {
    console.log('Saving OCR data:', editedData);
    // Aquí se guardaría en la base de datos
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'EUR' }).format(amount);
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-theme-primary">OCR - Escaneo de Documentos</h1>
          <p className="text-theme-secondary">Reconocimiento óptico de caracteres para tickets y facturas</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Panel de carga */}
        <div className="space-y-4">
          {/* Área de drop */}
          <div
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onClick={() => inputRef.current?.click()}
            className={`
              border-2 border-dashed rounded-2xl p-8 text-center cursor-pointer transition-all
              ${dragActive 
                ? 'border-accent bg-accent/10' 
                : 'border-theme hover:border-accent/50 bg-theme-card'
              }
            `}
          >
            <input
              ref={inputRef}
              type="file"
              accept="image/*,.pdf"
              onChange={handleInputChange}
              className="hidden"
            />
            
            {isProcessing ? (
              <div className="py-8">
                <Loader2 className="w-12 h-12 text-accent mx-auto animate-spin" />
                <p className="mt-4 text-theme-primary font-medium">Procesando documento...</p>
                <p className="text-sm text-theme-secondary">Extrayendo texto y datos</p>
              </div>
            ) : selectedFile ? (
              <div className="py-4">
                <FileText className="w-12 h-12 text-accent mx-auto" />
                <p className="mt-3 text-theme-primary font-medium">{selectedFile.name}</p>
                <p className="text-sm text-theme-secondary">{(selectedFile.size / 1024).toFixed(1)} KB</p>
                <button
                  onClick={(e) => { e.stopPropagation(); setSelectedFile(null); setOcrResult(null); }}
                  className="mt-3 text-sm text-red-400 hover:text-red-300"
                >
                  Cancelar
                </button>
              </div>
            ) : (
              <>
                <Upload className="w-12 h-12 text-theme-muted mx-auto" />
                <p className="mt-4 text-theme-primary font-medium">Arrastra un archivo o haz clic para seleccionar</p>
                <p className="text-sm text-theme-secondary mt-1">Soporta: JPG, PNG, PDF</p>
              </>
            )}
          </div>

          {/* Botones de acción rápida */}
          <div className="flex gap-3">
            <button className="flex-1 flex items-center justify-center gap-2 py-3 bg-theme-card border border-theme rounded-xl text-theme-secondary hover:text-theme-primary hover:border-accent transition-colors">
              <Camera className="w-5 h-5" />
              Cámara
            </button>
            <button className="flex-1 flex items-center justify-center gap-2 py-3 bg-theme-card border border-theme rounded-xl text-theme-secondary hover:text-theme-primary hover:border-accent transition-colors">
              <Image className="w-5 h-5" />
              Galería
            </button>
          </div>

          {/* Historial */}
          <div className="bg-theme-card border border-theme rounded-xl p-4">
            <h3 className="font-semibold text-theme-primary mb-3">Historial de escaneos</h3>
            <div className="space-y-2 max-h-64 overflow-y-auto">
              {historialOCR.map((item) => (
                <div key={item.id} className="flex items-center justify-between p-3 bg-theme-tertiary/50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <FileText className="w-5 h-5 text-theme-muted" />
                    <div>
                      <p className="text-sm text-theme-primary">{item.archivo}</p>
                      <p className="text-xs text-theme-muted">{item.proveedor} • {formatCurrency(item.total)}</p>
                    </div>
                  </div>
                  <span className="text-xs text-emerald-400">{item.estado}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Panel de resultados */}
        <div className="space-y-4">
          {ocrResult ? (
            <>
              {/* Estado del procesamiento */}
              <div className={`p-4 rounded-xl flex items-center gap-3 ${
                ocrResult.success 
                  ? 'bg-emerald-500/10 border border-emerald-500/20' 
                  : 'bg-red-500/10 border border-red-500/20'
              }`}>
                {ocrResult.success ? (
                  <>
                    <Check className="w-5 h-5 text-emerald-400" />
                    <span className="text-emerald-400">Documento procesado correctamente</span>
                  </>
                ) : (
                  <>
                    <AlertCircle className="w-5 h-5 text-red-400" />
                    <span className="text-red-400">Error al procesar documento</span>
                  </>
                )}
                <span className="ml-auto text-xs text-theme-muted">{ocrResult.processingTime}ms</span>
              </div>

              {/* Datos extraídos */}
              <div className="bg-theme-card border border-theme rounded-xl p-4">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-semibold text-theme-primary">Datos Extraídos</h3>
                  <button
                    onClick={handleSave}
                    className="flex items-center gap-2 px-3 py-1.5 bg-accent text-white text-sm rounded-lg hover:bg-accent-hover"
                  >
                    <Save className="w-4 h-4" />
                    Guardar
                  </button>
                </div>

                <div className="space-y-3">
                  <div>
                    <label className="text-xs text-theme-muted">Proveedor</label>
                    <input
                      type="text"
                      value={editedData?.vendor || ''}
                      onChange={(e) => setEditedData({ ...editedData, vendor: e.target.value })}
                      className="w-full mt-1 px-3 py-2 bg-theme-tertiary border border-theme rounded-lg text-theme-primary"
                    />
                  </div>
                  <div>
                    <label className="text-xs text-theme-muted">Fecha</label>
                    <input
                      type="date"
                      value={editedData?.date || ''}
                      onChange={(e) => setEditedData({ ...editedData, date: e.target.value })}
                      className="w-full mt-1 px-3 py-2 bg-theme-tertiary border border-theme rounded-lg text-theme-primary"
                    />
                  </div>
                  <div>
                    <label className="text-xs text-theme-muted">NIF/CIF</label>
                    <input
                      type="text"
                      value={editedData?.cif || ''}
                      onChange={(e) => setEditedData({ ...editedData, cif: e.target.value })}
                      className="w-full mt-1 px-3 py-2 bg-theme-tertiary border border-theme rounded-lg text-theme-primary"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-xs text-theme-muted">Base Imponible</label>
                      <input
                        type="number"
                        value={((editedData?.total || 0) / 1.21).toFixed(2)}
                        onChange={(e) => setEditedData({ ...editedData, total: parseFloat(e.target.value) * 1.21 })}
                        className="w-full mt-1 px-3 py-2 bg-theme-tertiary border border-theme rounded-lg text-theme-primary"
                      />
                    </div>
                    <div>
                      <label className="text-xs text-theme-muted">IVA</label>
                      <input
                        type="number"
                        value={(editedData?.tax || 0).toFixed(2)}
                        onChange={(e) => setEditedData({ ...editedData, tax: parseFloat(e.target.value) })}
                        className="w-full mt-1 px-3 py-2 bg-theme-tertiary border border-theme rounded-lg text-theme-primary"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="text-xs text-theme-muted">Total</label>
                    <input
                      type="number"
                      value={editedData?.total || 0}
                      onChange={(e) => setEditedData({ ...editedData, total: parseFloat(e.target.value) })}
                      className="w-full mt-1 px-3 py-2 bg-theme-tertiary border border-theme rounded-lg text-theme-primary font-bold text-lg"
                    />
                  </div>
                </div>
              </div>

              {/* Texto extraído */}
              <div className="bg-theme-card border border-theme rounded-xl p-4">
                <h3 className="font-semibold text-theme-primary mb-3">Texto Extraído</h3>
                <div className="p-3 bg-theme-tertiary/50 rounded-lg">
                  <pre className="text-sm text-theme-secondary whitespace-pre-wrap font-mono">
                    {ocrResult.rawText}
                  </pre>
                </div>
                <div className="mt-2 text-xs text-theme-muted">
                  Confianza: {(ocrResult.confidence * 100).toFixed(1)}%
                </div>
              </div>

              {/* Items detectados */}
              {editedData?.items && editedData.items.length > 0 && (
                <div className="bg-theme-card border border-theme rounded-xl p-4">
                  <h3 className="font-semibold text-theme-primary mb-3">Items Detectados</h3>
                  <div className="space-y-2">
                    {editedData.items.map((item: any, index: number) => (
                      <div key={index} className="flex items-center justify-between p-2 bg-theme-tertiary/50 rounded-lg">
                        <input
                          type="text"
                          value={item.description}
                          onChange={(e) => {
                            const newItems = [...editedData.items];
                            newItems[index].description = e.target.value;
                            setEditedData({ ...editedData, items: newItems });
                          }}
                          className="flex-1 bg-transparent text-theme-primary text-sm"
                        />
                        <span className="text-theme-secondary text-sm">
                          {formatCurrency(item.total)}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </>
          ) : (
            <div className="bg-theme-card border border-theme rounded-xl p-12 text-center h-full flex flex-col items-center justify-center">
              <FileText className="w-16 h-16 text-theme-muted mb-4" />
              <p className="text-theme-primary font-medium">Sin resultados</p>
              <p className="text-theme-secondary text-sm mt-1">
                Sube un documento para extraer sus datos
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

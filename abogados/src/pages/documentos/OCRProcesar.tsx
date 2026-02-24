import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  ArrowLeft, FileText, Image, File, Loader2, CheckCircle,
  AlertCircle, RefreshCw, Clock, ChevronRight, X
} from 'lucide-react';
import { AppLayout } from '@/components/layout/AppLayout';
import { documentoService } from '@/services';
import type { Documento } from '@/types/documento.types';

interface Toast {
  id: number;
  message: string;
  type: 'success' | 'error' | 'info';
}

export default function OCRProcesar() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [documento, setDocumento] = useState<Documento | null>(null);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [resultado, setResultado] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [toasts, setToasts] = useState<Toast[]>([]);

  useEffect(() => {
    if (id) {
      cargarDocumento();
    }
  }, [id]);

  const cargarDocumento = async () => {
    setLoading(true);
    try {
      const data = await documentoService.obtenerDocumento(id!);
      setDocumento(data);
      
      // Si ya tiene OCR, mostrar resultado
      if (data.contenidoExtraido) {
        setResultado({
          ocr: data.metadata?.ocr,
          analysis: data.metadata?.analysis,
        });
      }
    } catch (err: any) {
      setError(err.message || 'Error al cargar documento');
      showToast('Error al cargar documento', 'error');
    } finally {
      setLoading(false);
    }
  };

  const showToast = (message: string, type: 'success' | 'error' | 'info' = 'info') => {
    const toastId = Date.now();
    setToasts(prev => [...prev, { id: toastId, message, type }]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== toastId));
    }, 3000);
  };

  const procesar = async () => {
    if (!documento) return;
    
    setProcessing(true);
    setProgress(0);
    setError(null);

    // Simular progreso
    const progressInterval = setInterval(() => {
      setProgress(prev => {
        if (prev >= 90) return prev;
        return prev + Math.random() * 15;
      });
    }, 500);

    try {
      const result = await documentoService.procesarOcr(documento.id);
      clearInterval(progressInterval);
      setProgress(100);
      setResultado(result);
      showToast('OCR procesado correctamente', 'success');
      
      // Recargar documento para obtener datos actualizados
      await cargarDocumento();
    } catch (err: any) {
      clearInterval(progressInterval);
      setError(err.message || 'Error al procesar OCR');
      showToast(err.message || 'Error al procesar OCR', 'error');
    } finally {
      setProcessing(false);
    }
  };

  const getFileIcon = () => {
    if (!documento?.mimeType) return File;
    if (documento.mimeType.includes('pdf')) return FileText;
    if (documento.mimeType.startsWith('image/')) return Image;
    return File;
  };

  const Icon = getFileIcon();

  if (loading) {
    return (
      <AppLayout>
        <div className="flex items-center justify-center min-h-[60vh]">
          <Loader2 className="w-8 h-8 animate-spin text-amber-500" />
        </div>
      </AppLayout>
    );
  }

  if (error || !documento) {
    return (
      <AppLayout>
        <div className="p-6">
          <div className="p-8 bg-red-500/10 border border-red-500/20 rounded-xl text-center">
            <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
            <h2 className="text-xl font-bold text-red-500 mb-2">Error</h2>
            <p className="text-theme-secondary mb-4">{error || 'Documento no encontrado'}</p>
            <button
              onClick={() => navigate('/documentos/biblioteca')}
              className="px-4 py-2 bg-amber-500 text-white rounded-lg hover:bg-amber-600"
            >
              Volver a la biblioteca
            </button>
          </div>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="p-6 max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate(-1)}
            className="p-2 text-theme-secondary hover:text-theme-primary transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>

          <div className="flex-1">
            <h1 className="text-2xl font-bold text-theme-primary">Procesar OCR</h1>
            <p className="text-theme-secondary">{documento.nombre}</p>
          </div>
        </div>

        {/* Vista previa del archivo */}
        <div className="bg-theme-secondary rounded-xl border border-theme p-6">
          <h2 className="text-lg font-semibold text-theme-primary mb-4">Vista previa</h2>
          
          <div className="flex items-center justify-center py-8 bg-theme rounded-xl">
            <div className="text-center">
              <Icon className="w-16 h-16 text-theme-tertiary mx-auto mb-4" />
              <p className="text-theme-primary font-medium">{documento.nombre}</p>
              <p className="text-theme-secondary text-sm mt-1">
                {documentoService.formatFileSize(documento.tamano)}
              </p>
            </div>
          </div>
        </div>

        {/* Estado del OCR */}
        {resultado ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-emerald-500/10 border border-emerald-500/20 rounded-xl p-6"
          >
            <div className="flex items-center gap-3 mb-4">
              <CheckCircle className="w-8 h-8 text-emerald-500" />
              <div>
                <h2 className="text-lg font-semibold text-emerald-500">OCR Completado</h2>
                <p className="text-emerald-400 text-sm">
                  El documento ha sido procesado correctamente
                </p>
              </div>
            </div>

            {resultado.ocr?.confidence && (
              <div className="mb-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-theme-secondary">Confianza</span>
                  <span className={`font-medium ${
                    resultado.ocr.confidence > 0.8 ? 'text-emerald-500' :
                    resultado.ocr.confidence > 0.5 ? 'text-amber-500' : 'text-red-500'
                  }`}>
                    {Math.round(resultado.ocr.confidence * 100)}%
                  </span>
                </div>
                <div className="h-2 bg-theme rounded-full overflow-hidden">
                  <div
                    className={`h-full transition-all ${
                      resultado.ocr.confidence > 0.8 ? 'bg-emerald-500' :
                      resultado.ocr.confidence > 0.5 ? 'bg-amber-500' : 'bg-red-500'
                    }`}
                    style={{ width: `${resultado.ocr.confidence * 100}%` }}
                  />
                </div>
              </div>
            )}

            <div className="flex gap-3">
              <button
                onClick={() => navigate(`/documentos/ocr/resultados?id=${documento.id}`)}
                className="flex-1 py-2 bg-emerald-500 text-white rounded-lg hover:bg-emerald-600 flex items-center justify-center gap-2"
              >
                <FileText className="w-4 h-4" />
                Ver resultado completo
                <ChevronRight className="w-4 h-4" />
              </button>
              
              <button
                onClick={() => navigate(`/documentos/biblioteca/${documento.id}`)}
                className="px-4 py-2 bg-theme text-theme-primary rounded-lg hover:bg-theme-hover"
              >
                Ver documento
              </button>
            </div>
          </motion.div>
        ) : (
          <div className="bg-theme-secondary rounded-xl border border-theme p-6">
            {!processing ? (
              <>
                <h2 className="text-lg font-semibold text-theme-primary mb-4">
                  Procesar documento con OCR
                </h2>
                
                <p className="text-theme-secondary mb-6">
                  El OCR (Reconocimiento Óptico de Caracteres) extraerá el texto del documento 
                  para hacerlo searchable y analizar su contenido.
                </p>

                <div className="space-y-3 mb-6">
                  <div className="flex items-center gap-3 text-sm text-theme-secondary">
                    <CheckCircle className="w-4 h-4 text-emerald-500" />
                    <span>Extracción de texto completo</span>
                  </div>
                  <div className="flex items-center gap-3 text-sm text-theme-secondary">
                    <CheckCircle className="w-4 h-4 text-emerald-500" />
                    <span>Detección de entidades (fechas, montos, DNI, etc.)</span>
                  </div>
                  <div className="flex items-center gap-3 text-sm text-theme-secondary">
                    <CheckCircle className="w-4 h-4 text-emerald-500" />
                    <span>Análisis del tipo de documento</span>
                  </div>
                  <div className="flex items-center gap-3 text-sm text-theme-secondary">
                    <CheckCircle className="w-4 h-4 text-emerald-500" />
                    <span>Búsqueda por contenido habilitada</span>
                  </div>
                </div>

                <button
                  onClick={procesar}
                  className="w-full py-3 bg-amber-500 text-white rounded-lg hover:bg-amber-600 flex items-center justify-center gap-2"
                >
                  <RefreshCw className="w-5 h-5" />
                  Iniciar procesamiento OCR
                </button>
              </>
            ) : (
              <div className="text-center py-8">
                <Loader2 className="w-12 h-12 animate-spin text-amber-500 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-theme-primary mb-2">
                  Procesando documento...
                </h3>
                <p className="text-theme-secondary mb-4">
                  Esto puede tomar unos segundos dependiendo del tamaño del archivo
                </p>
                
                <div className="max-w-md mx-auto">
                  <div className="h-2 bg-theme rounded-full overflow-hidden">
                    <motion.div
                      className="h-full bg-amber-500"
                      initial={{ width: 0 }}
                      animate={{ width: `${progress}%` }}
                      transition={{ duration: 0.3 }}
                    />
                  </div>
                  <p className="text-sm text-theme-tertiary mt-2">
                    {Math.round(progress)}%
                  </p>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Toasts */}
      <div className="fixed bottom-6 right-6 space-y-2 z-50">
        {toasts.map(toast => (
          <motion.div
            key={toast.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className={`px-4 py-3 rounded-lg shadow-lg flex items-center gap-2 ${
              toast.type === 'success'
                ? 'bg-emerald-500 text-white'
                : toast.type === 'error'
                ? 'bg-red-500 text-white'
                : 'bg-amber-500 text-white'
            }`}
          >
            {toast.type === 'success' ? <CheckCircle className="w-4 h-4" />
              : toast.type === 'error' ? <AlertCircle className="w-4 h-4" />
              : <Clock className="w-4 h-4" />}
            <span>{toast.message}</span>
          </motion.div>
        ))}
      </div>
    </AppLayout>
  );
}

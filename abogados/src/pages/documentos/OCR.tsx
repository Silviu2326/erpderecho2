import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  FileSearch, AlertCircle, CheckCircle, Clock, Loader2,
  TrendingUp, FileText, Image, Zap, RefreshCw, Eye,
  ArrowRight, Filter, Calendar, BarChart3
} from 'lucide-react';
import { AppLayout } from '@/components/layout/AppLayout';
import { documentoService } from '@/services';
import type { Documento } from '@/types/documento.types';

interface Toast {
  id: number;
  message: string;
  type: 'success' | 'error' | 'info';
}

interface OCRStats {
  totalProcesados: number;
  totalPendientes: number;
  totalErrores: number;
  promedioConfianza: number;
  ultimos7Dias: number;
}

export default function OCRDashboard() {
  const navigate = useNavigate();

  const [documentosPendientes, setDocumentosPendientes] = useState<Documento[]>([]);
  const [documentosProcesados, setDocumentosProcesados] = useState<Documento[]>([]);
  const [stats, setStats] = useState<OCRStats>({
    totalProcesados: 0,
    totalPendientes: 0,
    totalErrores: 0,
    promedioConfianza: 0,
    ultimos7Dias: 0,
  });
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState<string[]>([]);
  const [toasts, setToasts] = useState<Toast[]>([]);
  const [selectedDocs, setSelectedDocs] = useState<string[]>([]);
  const [batchProcessing, setBatchProcessing] = useState(false);

  const showToast = (message: string, type: 'success' | 'error' | 'info' = 'info') => {
    const id = Date.now();
    setToasts(prev => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 3000);
  };

  const cargarDatos = useCallback(async () => {
    setLoading(true);
    try {
      // Cargar todos los documentos
      const response = await documentoService.listarDocumentos({ limit: 100 });
      const todos = response.data;

      // Separar pendientes (sin contenidoExtraido) y procesados
      const pendientes = todos.filter(d => 
        !d.contenidoExtraido && 
        (d.mimeType?.includes('pdf') || d.mimeType?.startsWith('image/'))
      );
      
      const procesados = todos.filter(d => d.contenidoExtraido);

      setDocumentosPendientes(pendientes);
      setDocumentosProcesados(procesados.slice(0, 10)); // Últimos 10

      // Calcular estadísticas
      const confianzas = procesados
        .map(d => d.metadata?.ocr?.confidence || 0)
        .filter(c => c > 0);
      
      const promedioConfianza = confianzas.length > 0
        ? confianzas.reduce((a, b) => a + b, 0) / confianzas.length
        : 0;

      const ultimos7Dias = procesados.filter(d => {
        const fecha = new Date(d.createdAt);
        const hace7Dias = new Date();
        hace7Dias.setDate(hace7Dias.getDate() - 7);
        return fecha >= hace7Dias;
      }).length;

      setStats({
        totalProcesados: procesados.length,
        totalPendientes: pendientes.length,
        totalErrores: 0, // TODO: tracking de errores
        promedioConfianza,
        ultimos7Dias,
      });
    } catch (err: any) {
      showToast(err.message || 'Error al cargar datos', 'error');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    cargarDatos();
  }, [cargarDatos]);

  const procesarDocumento = async (id: string) => {
    setProcessing(prev => [...prev, id]);
    
    try {
      await documentoService.procesarOcr(id);
      showToast('Documento procesado correctamente', 'success');
      cargarDatos(); // Recargar para actualizar listas
    } catch (err: any) {
      showToast(err.message || 'Error al procesar OCR', 'error');
    } finally {
      setProcessing(prev => prev.filter(pid => pid !== id));
    }
  };

  const procesarBatch = async () => {
    if (selectedDocs.length === 0) {
      showToast('Selecciona al menos un documento', 'info');
      return;
    }

    setBatchProcessing(true);
    
    try {
      // Procesar uno por uno para mejor feedback
      for (const id of selectedDocs) {
        await procesarDocumento(id);
      }
      showToast(`${selectedDocs.length} documentos procesados`, 'success');
      setSelectedDocs([]);
    } catch (err: any) {
      showToast(err.message || 'Error en procesamiento batch', 'error');
    } finally {
      setBatchProcessing(false);
    }
  };

  const toggleSeleccion = (id: string) => {
    setSelectedDocs(prev => 
      prev.includes(id) 
        ? prev.filter(did => did !== id)
        : [...prev, id]
    );
  };

  const seleccionarTodos = () => {
    if (selectedDocs.length === documentosPendientes.length) {
      setSelectedDocs([]);
    } else {
      setSelectedDocs(documentosPendientes.map(d => d.id));
    }
  };

  const verResultado = (documento: Documento) => {
    navigate(`/documentos/ocr/resultados?id=${documento.id}`);
  };

  if (loading) {
    return (
      <AppLayout>
        <div className="flex items-center justify-center min-h-[60vh]">
          <Loader2 className="w-8 h-8 animate-spin text-amber-500" />
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="p-6 space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-theme-primary">Dashboard OCR</h1>
            <p className="text-theme-secondary">
              Gestión de reconocimiento óptico de caracteres
            </p>
          </div>

          <button
            onClick={cargarDatos}
            className="flex items-center gap-2 px-4 py-2 bg-theme-secondary text-theme-primary rounded-lg hover:bg-theme-hover transition-colors"
          >
            <RefreshCw className="w-4 h-4" />
            Actualizar
          </button>
        </div>

        {/* Estadísticas */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="p-4 bg-theme-secondary rounded-xl border border-theme"
          >
            <div className="flex items-center gap-2 mb-2">
              <CheckCircle className="w-5 h-5 text-emerald-500" />
              <span className="text-sm text-theme-secondary">Procesados</span>
            </div>
            <p className="text-2xl font-bold text-theme-primary">{stats.totalProcesados}</p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className={`p-4 rounded-xl border ${
              stats.totalPendientes > 0 
                ? 'bg-amber-500/10 border-amber-500/20' 
                : 'bg-theme-secondary border-theme'
            }`}
          >
            <div className="flex items-center gap-2 mb-2">
              <Clock className={`w-5 h-5 ${stats.totalPendientes > 0 ? 'text-amber-500' : 'text-theme-tertiary'}`} />
              <span className={`text-sm ${stats.totalPendientes > 0 ? 'text-amber-500' : 'text-theme-secondary'}`}>
                Pendientes
              </span>
            </div>
            <p className={`text-2xl font-bold ${stats.totalPendientes > 0 ? 'text-amber-500' : 'text-theme-primary'}`}>
              {stats.totalPendientes}
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="p-4 bg-theme-secondary rounded-xl border border-theme"
          >
            <div className="flex items-center gap-2 mb-2">
              <BarChart3 className="w-5 h-5 text-blue-500" />
              <span className="text-sm text-theme-secondary">Confianza promedio</span>
            </div>
            <p className="text-2xl font-bold text-theme-primary">
              {Math.round(stats.promedioConfianza * 100)}%
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="p-4 bg-theme-secondary rounded-xl border border-theme"
          >
            <div className="flex items-center gap-2 mb-2">
              <Calendar className="w-5 h-5 text-purple-500" />
              <span className="text-sm text-theme-secondary">Últimos 7 días</span>
            </div>
            <p className="text-2xl font-bold text-theme-primary">{stats.ultimos7Dias}</p>
          </motion.div>
        </div>

        {/* Documentos pendientes */}
        {documentosPendientes.length > 0 && (
          <div className="bg-theme-secondary rounded-xl border border-theme overflow-hidden">
            <div className="p-4 border-b border-theme flex items-center justify-between">
              <div className="flex items-center gap-2">
                <AlertCircle className="w-5 h-5 text-amber-500" />
                <h2 className="text-lg font-semibold text-theme-primary">
                  Documentos pendientes de OCR
                </h2>
                <span className="px-2 py-0.5 bg-amber-500/20 text-amber-500 text-sm rounded-full">
                  {documentosPendientes.length}
                </span>
              </div>

              {selectedDocs.length > 0 && (
                <button
                  onClick={procesarBatch}
                  disabled={batchProcessing}
                  className="flex items-center gap-2 px-4 py-2 bg-amber-500 text-white rounded-lg hover:bg-amber-600 disabled:opacity-50"
                >
                  {batchProcessing ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Procesando...
                    </>
                  ) : (
                    <>
                      <Zap className="w-4 h-4" />
                      Procesar {selectedDocs.length} seleccionados
                    </>
                  )}
                </button>
              )}
            </div>

            <div className="p-4">
              <div className="flex items-center gap-3 mb-4">
                <input
                  type="checkbox"
                  checked={selectedDocs.length === documentosPendientes.length && documentosPendientes.length > 0}
                  onChange={seleccionarTodos}
                  className="w-4 h-4 rounded border-theme text-amber-500 focus:ring-amber-500"
                />
                <span className="text-sm text-theme-secondary">
                  {selectedDocs.length} de {documentosPendientes.length} seleccionados
                </span>
              </div>

              <div className="space-y-2">
                {documentosPendientes.map((doc) => (
                  <div
                    key={doc.id}
                    className="flex items-center gap-3 p-3 bg-theme rounded-lg hover:bg-theme-hover transition-colors"
                  >
                    <input
                      type="checkbox"
                      checked={selectedDocs.includes(doc.id)}
                      onChange={() => toggleSeleccion(doc.id)}
                      className="w-4 h-4 rounded border-theme text-amber-500 focus:ring-amber-500"
                    />

                    <div className="w-10 h-10 bg-theme-secondary rounded-lg flex items-center justify-center">
                      {doc.mimeType?.startsWith('image/') ? (
                        <Image className="w-5 h-5 text-theme-tertiary" />
                      ) : (
                        <FileText className="w-5 h-5 text-theme-tertiary" />
                      )}
                    </div>

                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-theme-primary truncate">{doc.nombre}</p>
                      <p className="text-sm text-theme-secondary">
                        {documentoService.formatFileSize(doc.tamano)} • 
                        Subido el {new Date(doc.createdAt).toLocaleDateString('es-ES')}
                      </p>
                    </div>

                    <button
                      onClick={() => procesarDocumento(doc.id)}
                      disabled={processing.includes(doc.id)}
                      className="flex items-center gap-2 px-3 py-1.5 text-sm bg-amber-500/10 text-amber-500 rounded-lg hover:bg-amber-500/20 disabled:opacity-50"
                    >
                      {processing.includes(doc.id) ? (
                        <>
                          <Loader2 className="w-3 h-3 animate-spin" />
                          Procesando...
                        </>
                      ) : (
                        <>
                          <Zap className="w-3 h-3" />
                          Procesar OCR
                        </>
                      )}
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Documentos recientemente procesados */}
        {documentosProcesados.length > 0 && (
          <div className="bg-theme-secondary rounded-xl border border-theme overflow-hidden">
            <div className="p-4 border-b border-theme">
              <h2 className="text-lg font-semibold text-theme-primary">
                Recientemente procesados
              </h2>
            </div>

            <div className="divide-y divide-theme">
              {documentosProcesados.map((doc) => (
                <div
                  key={doc.id}
                  className="p-4 flex items-center gap-4 hover:bg-theme-hover/50 transition-colors"
                >
                  <div className="w-10 h-10 bg-emerald-500/10 rounded-lg flex items-center justify-center">
                    <CheckCircle className="w-5 h-5 text-emerald-500" />
                  </div>

                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-theme-primary truncate">{doc.nombre}</p>
                    <div className="flex items-center gap-3 text-sm text-theme-secondary">
                      <span>
                        Confianza: {' '}
                        <span className={`
                          ${(doc.metadata?.ocr?.confidence || 0) > 0.8 ? 'text-emerald-500' :
                            (doc.metadata?.ocr?.confidence || 0) > 0.5 ? 'text-amber-500' : 'text-red-500'}
                        `}>
                          {Math.round((doc.metadata?.ocr?.confidence || 0) * 100)}%
                        </span>
                      </span>
                      {doc.metadata?.ocr?.pages && (
                        <span>• {doc.metadata.ocr.pages} páginas</span>
                      )}
                      <span>• {new Date(doc.updatedAt).toLocaleDateString('es-ES')}</span>
                    </div>
                  </div>

                  <button
                    onClick={() => verResultado(doc)}
                    className="flex items-center gap-1 text-sm text-amber-500 hover:text-amber-400"
                  >
                    <Eye className="w-4 h-4" />
                    Ver resultado
                    <ArrowRight className="w-3 h-3" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Estado vacío */}
        {documentosPendientes.length === 0 && documentosProcesados.length === 0 && (
          <div className="text-center py-12 bg-theme-secondary rounded-xl">
            <FileSearch className="w-12 h-12 text-theme-tertiary mx-auto mb-4" />
            <h3 className="text-lg font-medium text-theme-primary mb-2">
              No hay documentos para procesar
            </h3>
            <p className="text-theme-secondary">
              Sube documentos PDF o imágenes para procesarlos con OCR
            </p>
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
              : <FileSearch className="w-4 h-4" />}
            <span>{toast.message}</span>
          </motion.div>
        ))}
      </div>
    </AppLayout>
  );
}

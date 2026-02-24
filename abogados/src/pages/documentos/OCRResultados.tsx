import { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  ArrowLeft, FileText, Download, Copy, CheckCircle,
  AlertCircle, Loader2, Eye, File, Image, Hash,
  Calendar, DollarSign, User, Mail, Phone, MapPin,
  FileSignature, ChevronRight
} from 'lucide-react';
import { AppLayout } from '@/components/layout/AppLayout';
import { documentoService } from '@/services';
import type { Documento } from '@/types/documento.types';

interface Toast {
  id: number;
  message: string;
  type: 'success' | 'error' | 'info';
}

export default function OCRResultados() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const documentoId = searchParams.get('id');

  const [documento, setDocumento] = useState<Documento | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [copiedText, setCopiedText] = useState(false);
  const [toasts, setToasts] = useState<Toast[]>([]);
  const [activeTab, setActiveTab] = useState<'texto' | 'entidades' | 'analisis'>('texto');

  useEffect(() => {
    if (documentoId) {
      cargarDocumento();
    }
  }, [documentoId]);

  const cargarDocumento = async () => {
    setLoading(true);
    setError(null);

    try {
      const data = await documentoService.obtenerDocumento(documentoId!);
      setDocumento(data);
      
      if (!data.contenidoExtraido) {
        setError('Este documento no tiene OCR procesado');
      }
    } catch (err: any) {
      setError(err.message || 'Error al cargar documento');
      showToast('Error al cargar documento', 'error');
    } finally {
      setLoading(false);
    }
  };

  const showToast = (message: string, type: 'success' | 'error' | 'info' = 'info') => {
    const id = Date.now();
    setToasts(prev => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 3000);
  };

  const copiarTexto = async () => {
    if (!documento?.contenidoExtraido) return;
    
    try {
      await navigator.clipboard.writeText(documento.contenidoExtraido);
      setCopiedText(true);
      showToast('Texto copiado al portapapeles', 'success');
      setTimeout(() => setCopiedText(false), 2000);
    } catch {
      showToast('Error al copiar texto', 'error');
    }
  };

  const descargarTexto = () => {
    if (!documento?.contenidoExtraido) return;
    
    const blob = new Blob([documento.contenidoExtraido], { type: 'text/plain' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${documento.nombre}.txt`;
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);
    
    showToast('Archivo descargado', 'success');
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
              onClick={() => navigate('/documentos/ocr')}
              className="px-4 py-2 bg-amber-500 text-white rounded-lg hover:bg-amber-600"
            >
              Volver al Dashboard OCR
            </button>
          </div>
        </div>
      </AppLayout>
    );
  }

  const entities = documento.metadata?.ocr?.entities || {};
  const analysis = documento.metadata?.analysis;
  const ocr = documento.metadata?.ocr;

  return (
    <AppLayout>
      <div className="p-6 max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate(-1)}
              className="p-2 text-theme-secondary hover:text-theme-primary transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>

            <div>
              <h1 className="text-2xl font-bold text-theme-primary">Resultados OCR</h1>
              <p className="text-theme-secondary">{documento.nombre}</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={copiarTexto}
              className="flex items-center gap-2 px-4 py-2 bg-theme-secondary text-theme-primary rounded-lg hover:bg-theme-hover transition-colors"
            >
              {copiedText ? <CheckCircle className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
              {copiedText ? 'Copiado' : 'Copiar texto'}
            </button>
            
            <button
              onClick={descargarTexto}
              className="flex items-center gap-2 px-4 py-2 bg-amber-500 text-white rounded-lg hover:bg-amber-600 transition-colors"
            >
              <Download className="w-4 h-4" />
              Descargar TXT
            </button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="p-4 bg-theme-secondary rounded-xl">
            <p className="text-sm text-theme-tertiary">Confianza</p>
            <p className={`text-2xl font-bold ${
              (ocr?.confidence || 0) > 0.8 ? 'text-emerald-500' :
              (ocr?.confidence || 0) > 0.5 ? 'text-amber-500' : 'text-red-500'
            }`}>
              {Math.round((ocr?.confidence || 0) * 100)}%
            </p>
          </div>

          <div className="p-4 bg-theme-secondary rounded-xl">
            <p className="text-sm text-theme-tertiary">Páginas</p>
            <p className="text-2xl font-bold text-theme-primary">{ocr?.pages || 1}</p>
          </div>

          <div className="p-4 bg-theme-secondary rounded-xl">
            <p className="text-sm text-theme-tertiary">Idioma</p>
            <p className="text-2xl font-bold text-theme-primary uppercase">{ocr?.language || 'ES'}</p>
          </div>

          <div className="p-4 bg-theme-secondary rounded-xl">
            <p className="text-sm text-theme-tertiary">Entidades</p>
            <p className="text-2xl font-bold text-theme-primary">
              {Object.values(entities).reduce((acc: number, arr: any) => acc + (arr?.length || 0), 0)}
            </p>
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-theme-secondary rounded-xl border border-theme overflow-hidden">
          <div className="flex border-b border-theme">
            {[
              { id: 'texto', label: 'Texto Extraído', icon: FileText },
              { id: 'entidades', label: 'Entidades', icon: Hash },
              { id: 'analisis', label: 'Análisis', icon: FileSignature },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 text-sm font-medium transition-colors ${
                  activeTab === tab.id
                    ? 'text-amber-500 border-b-2 border-amber-500 bg-amber-500/10'
                    : 'text-theme-secondary hover:text-theme-primary'
                }`}
              >
                <tab.icon className="w-4 h-4" />
                {tab.label}
              </button>
            ))}
          </div>

          <div className="p-6">
            {activeTab === 'texto' && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="space-y-4"
              >
                {documento.contenidoExtraido ? (
                  <>
                    <div className="flex items-center justify-between">
                      <p className="text-sm text-theme-secondary">
                        {documento.contenidoExtraido.length.toLocaleString()} caracteres
                      </p>
                    </div>
                    
                    <div className="bg-theme p-4 rounded-lg max-h-[600px] overflow-y-auto">
                      <pre className="text-sm text-theme-primary whitespace-pre-wrap font-sans leading-relaxed">
                        {documento.contenidoExtraido}
                      </pre>
                    </div>
                  </>
                ) : (
                  <div className="text-center py-12">
                    <FileText className="w-12 h-12 text-theme-tertiary mx-auto mb-4" />
                    <p className="text-theme-secondary">No hay texto extraído</p>
                  </div>
                )}
              </motion.div>
            )}

            {activeTab === 'entidades' && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="grid grid-cols-1 md:grid-cols-2 gap-4"
              >
                {entities.dates?.length > 0 && (
                  <div className="p-4 bg-theme rounded-lg">
                    <div className="flex items-center gap-2 mb-3">
                      <Calendar className="w-5 h-5 text-amber-500" />
                      <h3 className="font-medium text-theme-primary">Fechas</h3>
                      <span className="ml-auto text-xs text-theme-tertiary">{entities.dates.length}</span>
                    </div>
                    <div className="space-y-1">
                      {entities.dates.slice(0, 10).map((date, idx) => (
                        <p key={idx} className="text-sm text-theme-secondary">{date}</p>
                      ))}
                    </div>
                  </div>
                )}

                {entities.amounts?.length > 0 && (
                  <div className="p-4 bg-theme rounded-lg">
                    <div className="flex items-center gap-2 mb-3">
                      <DollarSign className="w-5 h-5 text-emerald-500" />
                      <h3 className="font-medium text-theme-primary">Montos</h3>
                      <span className="ml-auto text-xs text-theme-tertiary">{entities.amounts.length}</span>
                    </div>
                    <div className="space-y-1">
                      {entities.amounts.slice(0, 10).map((amount, idx) => (
                        <p key={idx} className="text-sm text-emerald-500">{amount}</p>
                      ))}
                    </div>
                  </div>
                )}

                {entities.dniNie?.length > 0 && (
                  <div className="p-4 bg-theme rounded-lg">
                    <div className="flex items-center gap-2 mb-3">
                      <User className="w-5 h-5 text-blue-500" />
                      <h3 className="font-medium text-theme-primary">DNI/NIE</h3>
                      <span className="ml-auto text-xs text-theme-tertiary">{entities.dniNie.length}</span>
                    </div>
                    <div className="space-y-1">
                      {entities.dniNie.slice(0, 10).map((dni, idx) => (
                        <p key={idx} className="text-sm text-theme-secondary font-mono">{dni}</p>
                      ))}
                    </div>
                  </div>
                )}

                {entities.emails?.length > 0 && (
                  <div className="p-4 bg-theme rounded-lg">
                    <div className="flex items-center gap-2 mb-3">
                      <Mail className="w-5 h-5 text-purple-500" />
                      <h3 className="font-medium text-theme-primary">Emails</h3>
                      <span className="ml-auto text-xs text-theme-tertiary">{entities.emails.length}</span>
                    </div>
                    <div className="space-y-1">
                      {entities.emails.slice(0, 10).map((email, idx) => (
                        <p key={idx} className="text-sm text-theme-secondary">{email}</p>
                      ))}
                    </div>
                  </div>
                )}

                {entities.phoneNumbers?.length > 0 && (
                  <div className="p-4 bg-theme rounded-lg">
                    <div className="flex items-center gap-2 mb-3">
                      <Phone className="w-5 h-5 text-orange-500" />
                      <h3 className="font-medium text-theme-primary">Teléfonos</h3>
                      <span className="ml-auto text-xs text-theme-tertiary">{entities.phoneNumbers.length}</span>
                    </div>
                    <div className="space-y-1">
                      {entities.phoneNumbers.slice(0, 10).map((phone, idx) => (
                        <p key={idx} className="text-sm text-theme-secondary">{phone}</p>
                      ))}
                    </div>
                  </div>
                )}

                {entities.caseNumbers?.length > 0 && (
                  <div className="p-4 bg-theme rounded-lg">
                    <div className="flex items-center gap-2 mb-3">
                      <FileSignature className="w-5 h-5 text-red-500" />
                      <h3 className="font-medium text-theme-primary">Nº Expediente/Caso</h3>
                      <span className="ml-auto text-xs text-theme-tertiary">{entities.caseNumbers.length}</span>
                    </div>
                    <div className="space-y-1">
                      {entities.caseNumbers.slice(0, 10).map((num, idx) => (
                        <p key={idx} className="text-sm text-theme-secondary font-mono">{num}</p>
                      ))}
                    </div>
                  </div>
                )}
              </motion.div>
            )}

            {activeTab === 'analisis' && analysis && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="space-y-6"
              >
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="p-4 bg-theme rounded-lg">
                    <p className="text-sm text-theme-tertiary mb-1">Tipo de documento</p>
                    <p className="text-lg font-medium text-theme-primary capitalize">
                      {analysis.documentType}
                    </p>
                  </div>

                  {analysis.summary && (
                    <div className="md:col-span-2 p-4 bg-theme rounded-lg">
                      <p className="text-sm text-theme-tertiary mb-2">Resumen</p>
                      <p className="text-theme-secondary leading-relaxed">{analysis.summary}</p>
                    </div>
                  )}
                </div>

                {analysis.keyPoints && analysis.keyPoints.length > 0 && (
                  <div>
                    <h3 className="font-medium text-theme-primary mb-3">Puntos clave</h3>
                    <ul className="space-y-2">
                      {analysis.keyPoints.map((punto, idx) => (
                        <li key={idx} className="flex items-start gap-2 text-theme-secondary">
                          <ChevronRight className="w-4 h-4 text-amber-500 flex-shrink-0 mt-0.5" />
                          {punto}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {analysis.suggestedTags && analysis.suggestedTags.length > 0 && (
                  <div>
                    <h3 className="font-medium text-theme-primary mb-3">Tags sugeridos</h3>
                    <div className="flex flex-wrap gap-2">
                      {analysis.suggestedTags.map((tag, idx) => (
                        <span
                          key={idx}
                          className="px-3 py-1 text-sm bg-amber-500/10 text-amber-500 rounded-full"
                        >
                          #{tag}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </motion.div>
            )}
          </div>
        </div>
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
              : <Eye className="w-4 h-4" />}
            <span>{toast.message}</span>
          </motion.div>
        ))}
      </div>
    </AppLayout>
  );
}

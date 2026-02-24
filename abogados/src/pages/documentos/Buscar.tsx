import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Search, FileText, FolderOpen, Filter, Download, Eye, Clock, User, X,
  AlertCircle, Loader2, ChevronRight, File, Image, Table
} from 'lucide-react';
import { AppLayout } from '@/components/layout/AppLayout';
import { documentoService } from '@/services';
import type { Documento, TipoDocumento } from '@/types/documento.types';

interface Toast {
  id: number;
  message: string;
  type: 'success' | 'error' | 'info';
}

const tipoOpciones: { value: TipoDocumento | 'all'; label: string }[] = [
  { value: 'all', label: 'Todos los tipos' },
  { value: 'PDF', label: 'PDF' },
  { value: 'IMAGEN', label: 'Imágenes' },
  { value: 'WORD', label: 'Word' },
  { value: 'EXCEL', label: 'Excel' },
  { value: 'OTRO', label: 'Otros' },
];

export default function Buscar() {
  const navigate = useNavigate();

  const [searchQuery, setSearchQuery] = useState('');
  const [tipoFiltro, setTipoFiltro] = useState<TipoDocumento | 'all'>('all');
  const [documentos, setDocumentos] = useState<Documento[]>([]);
  const [loading, setLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const [totalResultados, setTotalResultados] = useState(0);
  const [toasts, setToasts] = useState<Toast[]>([]);

  const showToast = (message: string, type: 'success' | 'error' | 'info' = 'info') => {
    const id = Date.now();
    setToasts(prev => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 3000);
  };

  const handleSearch = useCallback(async () => {
    if (!searchQuery.trim() && tipoFiltro === 'all') {
      showToast('Introduce un término de búsqueda', 'info');
      return;
    }

    setLoading(true);
    setHasSearched(true);

    try {
      const response = await documentoService.listarDocumentos({
        search: searchQuery || undefined,
        tipo: tipoFiltro === 'all' ? undefined : tipoFiltro,
        limit: 50,
      });

      setDocumentos(response.data);
      setTotalResultados(response.meta.total);
    } catch (err: any) {
      showToast(err.message || 'Error al buscar', 'error');
      setDocumentos([]);
    } finally {
      setLoading(false);
    }
  }, [searchQuery, tipoFiltro]);

  // Búsqueda al presionar Enter
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  const handleVerDocumento = (documento: Documento) => {
    navigate(`/documentos/biblioteca/${documento.id}`);
  };

  const handleDescargar = async (e: React.MouseEvent, documento: Documento) => {
    e.stopPropagation();
    try {
      await documentoService.descargarDocumento(documento.id, documento.nombre);
      showToast('Descarga iniciada', 'success');
    } catch (err: any) {
      showToast(err.message || 'Error al descargar', 'error');
    }
  };

  const getFileIcon = (mimeType?: string) => {
    if (!mimeType) return File;
    if (mimeType.includes('pdf')) return FileText;
    if (mimeType.startsWith('image/')) return Image;
    if (mimeType.includes('excel') || mimeType.includes('sheet')) return Table;
    return File;
  };

  const getTipoLabel = (tipo: string) => {
    const labels: Record<string, string> = {
      'PDF': 'PDF',
      'IMAGEN': 'Imagen',
      'WORD': 'Word',
      'EXCEL': 'Excel',
      'OTRO': 'Otro',
    };
    return labels[tipo] || tipo;
  };

  return (
    <AppLayout>
      <div className="p-6 max-w-5xl mx-auto space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold text-theme-primary">Buscar Documentos</h1>
          <p className="text-theme-secondary">Búsqueda full-text en contenido OCR y metadatos</p>
        </div>

        {/* Buscador */}
        <div className="bg-theme-secondary rounded-xl border border-theme p-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-theme-tertiary" />
              <input
                type="text"
                placeholder="Buscar en documentos, contenido OCR, expedientes..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={handleKeyDown}
                className="w-full pl-12 pr-4 py-3 bg-theme border border-theme rounded-lg text-theme-primary placeholder-theme-tertiary focus:outline-none focus:border-amber-500 text-lg"
              />
            </div>

            <div className="flex items-center gap-2">
              <Filter className="w-4 h-4 text-theme-tertiary" />
              <select
                value={tipoFiltro}
                onChange={(e) => setTipoFiltro(e.target.value as TipoDocumento | 'all')}
                className="px-4 py-3 bg-theme border border-theme rounded-lg text-theme-primary focus:outline-none focus:border-amber-500"
              >
                {tipoOpciones.map(opcion => (
                  <option key={opcion.value} value={opcion.value}>
                    {opcion.label}
                  </option>
                ))}
              </select>
            </div>

            <button
              onClick={handleSearch}
              disabled={loading}
              className="px-6 py-3 bg-amber-500 text-white font-medium rounded-lg hover:bg-amber-600 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Buscando...
                </>
              ) : (
                'Buscar'
              )}
            </button>
          </div>

          <p className="text-sm text-theme-tertiary mt-3">
            💡 La búsqueda incluye: nombre del archivo, contenido extraído por OCR, número de expediente y metadatos
          </p>
        </div>

        {/* Resultados */}
        {hasSearched && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <p className="text-theme-secondary">
                {loading ? 'Buscando...' : `${totalResultados} resultado${totalResultados !== 1 ? 's' : ''} encontrado${totalResultados !== 1 ? 's' : ''}`}
              </p>

              {(searchQuery || tipoFiltro !== 'all') && (
                <button
                  onClick={() => {
                    setSearchQuery('');
                    setTipoFiltro('all');
                    setHasSearched(false);
                    setDocumentos([]);
                  }}
                  className="text-sm text-theme-tertiary hover:text-theme-primary flex items-center gap-1"
                >
                  <X className="w-4 h-4" />
                  Limpiar búsqueda
                </button>
              )}
            </div>

            {loading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="w-8 h-8 animate-spin text-amber-500" />
              </div>
            ) : documentos.length === 0 ? (
              <div className="bg-theme-secondary rounded-xl border border-theme p-12 text-center">
                <Search className="w-12 h-12 text-theme-tertiary mx-auto mb-4" />
                <p className="text-theme-primary font-medium">No se encontraron resultados</p>
                <p className="text-theme-secondary text-sm mt-1">
                  Intenta con otros términos de búsqueda o filtros
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {documentos.map((documento, idx) => {
                  const Icon = getFileIcon(documento.mimeType);

                  return (
                    <motion.div
                      key={documento.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: idx * 0.05 }}
                      className="bg-theme-secondary rounded-xl border border-theme p-4 hover:border-amber-500/30 transition-colors cursor-pointer group"
                      onClick={() => handleVerDocumento(documento)}
                    >
                      <div className="flex items-start gap-4">
                        <div className="w-12 h-12 bg-theme rounded-lg flex items-center justify-center flex-shrink-0">
                          {documento.thumbnailUrl ? (
                            <img
                              src={documento.thumbnailUrl}
                              alt=""
                              className="w-full h-full object-cover rounded-lg"
                            />
                          ) : (
                            <Icon className="w-6 h-6 text-theme-tertiary" />
                          )}
                        </div>

                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <h3 className="font-medium text-theme-primary truncate group-hover:text-amber-500 transition-colors">
                              {documento.nombre}
                            </h3>
                            <span className="px-2 py-0.5 text-xs rounded bg-theme text-theme-secondary">
                              {getTipoLabel(documento.tipo)}
                            </span>
                          </div>

                          {/* Preview del contenido OCR si existe */}
                          {documento.contenidoExtraido && (
                            <p className="text-sm text-theme-tertiary mt-1 line-clamp-2">
                              {documento.contenidoExtraido.substring(0, 150)}...
                            </p>
                          )}

                          <div className="flex items-center gap-4 mt-2 text-xs text-theme-tertiary">
                            {documento.expediente && (
                              <span className="flex items-center gap-1">
                                <FolderOpen className="w-3 h-3" />
                                {documento.expediente.numeroExpediente}
                              </span>
                            )}
                            {documento.usuario && (
                              <span className="flex items-center gap-1">
                                <User className="w-3 h-3" />
                                {documento.usuario.nombre}
                              </span>
                            )}
                            <span className="flex items-center gap-1">
                              <Clock className="w-3 h-3" />
                              {new Date(documento.createdAt).toLocaleDateString('es-ES')}
                            </span>
                            <span>{documentoService.formatFileSize(documento.tamano)}</span>
                          </div>

                          {/* Entidades detectadas */}
                          {documento.metadata?.ocr?.entities && (
                            <div className="flex flex-wrap gap-2 mt-2">
                              {documento.metadata.ocr.entities.dates?.slice(0, 2).map((date, i) => (
                                <span key={i} className="px-2 py-0.5 text-xs rounded bg-amber-500/10 text-amber-500">
                                  📅 {date}
                                </span>
                              ))}
                              {documento.metadata.ocr.entities.amounts?.slice(0, 2).map((amount, i) => (
                                <span key={i} className="px-2 py-0.5 text-xs rounded bg-emerald-500/10 text-emerald-500">
                                  💰 {amount}
                                </span>
                              ))}
                            </div>
                          )}
                        </div>

                        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button
                            onClick={(e) => handleDescargar(e, documento)}
                            className="p-2 text-theme-tertiary hover:text-amber-500 transition-colors"
                            title="Descargar"
                          >
                            <Download className="w-4 h-4" />
                          </button>
                          <button
                            className="p-2 text-theme-tertiary hover:text-amber-500 transition-colors"
                            title="Ver detalle"
                          >
                            <ChevronRight className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* Mensaje inicial */}
        {!hasSearched && (
          <div className="bg-theme-secondary rounded-xl border border-theme p-12 text-center">
            <Search className="w-16 h-16 text-theme-tertiary mx-auto mb-4" />
            <p className="text-xl font-medium text-theme-primary">Buscar en documentos</p>
            <p className="text-theme-secondary mt-2">
              Introduce términos de búsqueda para encontrar documentos en todo el repositorio.
              <br />
              La búsqueda incluye el texto extraído por OCR de PDFs e imágenes.
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
            {toast.type === 'success' ? <Eye className="w-4 h-4" />
              : toast.type === 'error' ? <AlertCircle className="w-4 h-4" />
              : <Search className="w-4 h-4" />}
            <span>{toast.message}</span>
          </motion.div>
        ))}
      </div>
    </AppLayout>
  );
}

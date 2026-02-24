import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  ArrowLeft, FileText, Image, File, Table, Download, Trash2,
  Edit2, CheckCircle, AlertCircle, Loader2, FolderOpen,
  Calendar, User, Hash, Save, X, Eye, Share2, Star,
  FileSearch, CheckSquare, Clock
} from 'lucide-react';
import { AppLayout } from '@/components/layout/AppLayout';
import { useAuth } from '@/contexts/AuthContext';
import { documentoService, expedienteService } from '@/services';
import type { Documento } from '@/types/documento.types';

interface Toast {
  id: number;
  message: string;
  type: 'success' | 'error' | 'info';
}

export default function DocumentoDetalle() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { hasPermission } = useAuth();

  const [documento, setDocumento] = useState<Documento | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editedNombre, setEditedNombre] = useState('');
  const [processingOcr, setProcessingOcr] = useState(false);
  const [toasts, setToasts] = useState<Toast[]>([]);
  const [isFavorito, setIsFavorito] = useState(false);

  const canEdit = hasPermission('documentos:write');
  const canDelete = hasPermission('documentos:delete');

  useEffect(() => {
    if (id) {
      cargarDocumento();
    }
  }, [id]);

  const cargarDocumento = async () => {
    setLoading(true);
    setError(null);

    try {
      const data = await documentoService.obtenerDocumento(id!);
      setDocumento(data);
      setEditedNombre(data.nombre);
      // Verificar si está en favoritos (localStorage)
      const favoritos = JSON.parse(localStorage.getItem('documentos_favoritos') || '[]');
      setIsFavorito(favoritos.includes(data.id));
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

  const handleGuardar = async () => {
    if (!documento) return;

    try {
      await documentoService.actualizarDocumento(documento.id, {
        nombre: editedNombre,
      });
      showToast('Documento actualizado correctamente', 'success');
      setIsEditing(false);
      cargarDocumento();
    } catch (err: any) {
      showToast(err.message || 'Error al actualizar', 'error');
    }
  };

  const handleEliminar = async () => {
    if (!documento) return;
    if (!confirm('¿Estás seguro de que deseas eliminar este documento?')) return;

    try {
      await documentoService.eliminarDocumento(documento.id);
      showToast('Documento eliminado', 'success');
      navigate('/documentos/biblioteca');
    } catch (err: any) {
      showToast(err.message || 'Error al eliminar', 'error');
    }
  };

  const handleDescargar = async () => {
    if (!documento) return;
    try {
      await documentoService.descargarDocumento(documento.id, documento.nombre);
      showToast('Descarga iniciada', 'success');
    } catch (err: any) {
      showToast(err.message || 'Error al descargar', 'error');
    }
  };

  const handleProcesarOcr = async () => {
    if (!documento) return;
    setProcessingOcr(true);

    try {
      const result = await documentoService.procesarOcr(documento.id);
      showToast('OCR procesado correctamente', 'success');
      cargarDocumento(); // Recargar para ver resultados
    } catch (err: any) {
      showToast(err.message || 'Error al procesar OCR', 'error');
    } finally {
      setProcessingOcr(false);
    }
  };

  const toggleFavorito = () => {
    if (!documento) return;
    const favoritos = JSON.parse(localStorage.getItem('documentos_favoritos') || '[]');
    
    if (isFavorito) {
      const nuevos = favoritos.filter((favId: string) => favId !== documento.id);
      localStorage.setItem('documentos_favoritos', JSON.stringify(nuevos));
      setIsFavorito(false);
      showToast('Eliminado de favoritos', 'info');
    } else {
      favoritos.push(documento.id);
      localStorage.setItem('documentos_favoritos', JSON.stringify(favoritos));
      setIsFavorito(true);
      showToast('Añadido a favoritos', 'success');
    }
  };

  const handleCompartir = async () => {
    if (!documento) return;
    
    // Crear enlace compartible
    const url = `${window.location.origin}/documentos/biblioteca/${documento.id}`;
    
    try {
      await navigator.clipboard.writeText(url);
      showToast('Enlace copiado al portapapeles', 'success');
    } catch {
      showToast('Error al copiar enlace', 'error');
    }
  };

  const getFileIcon = () => {
    if (!documento?.mimeType) return File;
    if (documento.mimeType.includes('pdf')) return FileText;
    if (documento.mimeType.startsWith('image/')) return Image;
    if (documento.mimeType.includes('excel') || documento.mimeType.includes('sheet')) return Table;
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
      <div className="p-6 max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex items-center gap-4 mb-6">
          <button
            onClick={() => navigate('/documentos/biblioteca')}
            className="p-2 text-theme-secondary hover:text-theme-primary transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>

          <div className="flex-1">
            {isEditing ? (
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={editedNombre}
                  onChange={(e) => setEditedNombre(e.target.value)}
                  className="flex-1 px-3 py-2 bg-theme border border-theme rounded-lg text-theme-primary focus:outline-none focus:border-amber-500"
                />
                <button
                  onClick={handleGuardar}
                  className="p-2 text-emerald-500 hover:bg-emerald-500/10 rounded-lg"
                >
                  <Save className="w-4 h-4" />
                </button>
                <button
                  onClick={() => {
                    setIsEditing(false);
                    setEditedNombre(documento.nombre);
                  }}
                  className="p-2 text-theme-tertiary hover:bg-theme-secondary rounded-lg"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-3">
                <h1 className="text-2xl font-bold text-theme-primary">{documento.nombre}</h1>
                {canEdit && (
                  <button
                    onClick={() => setIsEditing(true)}
                    className="p-2 text-theme-tertiary hover:text-amber-500 transition-colors"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                )}
              </div>
            )}

            <div className="flex items-center gap-4 mt-2">
              <span className="text-sm text-theme-secondary">
                {documento.tipo} • {documentoService.formatFileSize(documento.tamano)}
              </span>
              {documento.expediente && (
                <button
                  onClick={() => navigate(`/core/expedientes/${documento.expediente?.id}`)}
                  className="text-sm text-amber-500 hover:text-amber-400 flex items-center gap-1"
                >
                  <FolderOpen className="w-3 h-3" />
                  {documento.expediente.numeroExpediente}
                </button>
              )}
            </div>
          </div>

          {/* Acciones */}
          <div className="flex items-center gap-2">
            <button
              onClick={toggleFavorito}
              className={`p-2 rounded-lg transition-colors ${
                isFavorito
                  ? 'text-amber-500 bg-amber-500/10'
                  : 'text-theme-tertiary hover:text-amber-500'
              }`}
              title={isFavorito ? 'Quitar de favoritos' : 'Añadir a favoritos'}
            >
              <Star className={`w-5 h-5 ${isFavorito ? 'fill-current' : ''}`} />
            </button>

            <button
              onClick={handleCompartir}
              className="p-2 text-theme-tertiary hover:text-amber-500 transition-colors"
              title="Compartir"
            >
              <Share2 className="w-5 h-5" />
            </button>

            <button
              onClick={handleDescargar}
              className="flex items-center gap-2 px-4 py-2 bg-theme-secondary text-theme-primary rounded-lg hover:bg-theme-hover transition-colors"
            >
              <Download className="w-4 h-4" />
              Descargar
            </button>

            {canDelete && (
              <button
                onClick={handleEliminar}
                className="p-2 text-red-500 hover:bg-red-500/10 rounded-lg transition-colors"
                title="Eliminar"
              >
                <Trash2 className="w-5 h-5" />
              </button>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Vista previa */}
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-theme-secondary rounded-xl border border-theme p-6">
              <h2 className="text-lg font-semibold text-theme-primary mb-4">Vista previa</h2>

              {documento.mimeType?.startsWith('image/') && documento.thumbnailUrl ? (
                <div className="flex justify-center">
                  <img
                    src={documento.thumbnailUrl}
                    alt={documento.nombre}
                    className="max-w-full max-h-[500px] object-contain rounded-lg"
                  />
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-12 bg-theme rounded-xl">
                  <Icon className="w-24 h-24 text-theme-tertiary mb-4" />
                  <p className="text-theme-secondary">Vista previa no disponible</p>
                  <button
                    onClick={handleDescargar}
                    className="mt-4 px-4 py-2 bg-amber-500 text-white rounded-lg hover:bg-amber-600"
                  >
                    Descargar para ver
                  </button>
                </div>
              )}
            </div>

            {/* Contenido OCR */}
            {documento.contenidoExtraido && (
              <div className="bg-theme-secondary rounded-xl border border-theme p-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-semibold text-theme-primary flex items-center gap-2">
                    <FileSearch className="w-5 h-5 text-amber-500" />
                    Texto extraído (OCR)
                  </h2>
                  {documento.metadata?.ocr?.confidence && (
                    <span className={`text-sm px-2 py-1 rounded ${
                      documento.metadata.ocr.confidence > 0.8
                        ? 'bg-emerald-500/20 text-emerald-500'
                        : documento.metadata.ocr.confidence > 0.5
                        ? 'bg-amber-500/20 text-amber-500'
                        : 'bg-red-500/20 text-red-500'
                    }`}>
                      Confianza: {Math.round(documento.metadata.ocr.confidence * 100)}%
                    </span>
                  )}
                </div>

                <div className="bg-theme p-4 rounded-lg max-h-[400px] overflow-y-auto">
                  <pre className="text-sm text-theme-secondary whitespace-pre-wrap font-sans">
                    {documento.contenidoExtraido}
                  </pre>
                </div>

                {/* Entidades detectadas */}
                {documento.metadata?.ocr?.entities && (
                  <div className="mt-4 grid grid-cols-2 md:grid-cols-3 gap-3">
                    {Object.entries(documento.metadata.ocr.entities)
                      .filter(([_, values]) => Array.isArray(values) && values.length > 0)
                      .map(([tipo, valores]) => (
                        <div key={tipo} className="p-3 bg-theme rounded-lg">
                          <p className="text-xs text-theme-tertiary uppercase mb-1">
                            {tipo.replace(/([A-Z])/g, ' $1').trim()}
                          </p>
                          <div className="space-y-1">
                            {(valores as string[]).slice(0, 3).map((valor, idx) => (
                              <p key={idx} className="text-sm text-theme-primary truncate">
                                {valor}
                              </p>
                            ))}
                            {(valores as string[]).length > 3 && (
                              <p className="text-xs text-theme-tertiary">
                                +{(valores as string[]).length - 3} más
                              </p>
                            )}
                          </div>
                        </div>
                      ))}
                  </div>
                )}
              </div>
            )}

            {/* Análisis del documento */}
            {documento.metadata?.analysis && (
              <div className="bg-theme-secondary rounded-xl border border-theme p-6">
                <h2 className="text-lg font-semibold text-theme-primary mb-4">Análisis del documento</h2>

                <div className="space-y-4">
                  <div>
                    <p className="text-sm text-theme-tertiary">Tipo de documento</p>
                    <p className="text-theme-primary capitalize">
                      {documento.metadata.analysis.documentType}
                    </p>
                  </div>

                  {documento.metadata.analysis.summary && (
                    <div>
                      <p className="text-sm text-theme-tertiary">Resumen</p>
                      <p className="text-theme-secondary text-sm leading-relaxed">
                        {documento.metadata.analysis.summary}
                      </p>
                    </div>
                  )}

                  {documento.metadata.analysis.keyPoints && documento.metadata.analysis.keyPoints.length > 0 && (
                    <div>
                      <p className="text-sm text-theme-tertiary mb-2">Puntos clave</p>
                      <ul className="space-y-1">
                        {documento.metadata.analysis.keyPoints.map((punto, idx) => (
                          <li key={idx} className="flex items-start gap-2 text-sm text-theme-secondary">
                            <CheckSquare className="w-4 h-4 text-amber-500 flex-shrink-0 mt-0.5" />
                            {punto}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Sidebar - Información */}
          <div className="space-y-6">
            {/* Información general */}
            <div className="bg-theme-secondary rounded-xl border border-theme p-6">
              <h3 className="font-semibold text-theme-primary mb-4">Información</h3>

              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <Calendar className="w-4 h-4 text-theme-tertiary" />
                  <div>
                    <p className="text-xs text-theme-tertiary">Fecha de subida</p>
                    <p className="text-sm text-theme-primary">
                      {new Date(documento.createdAt).toLocaleDateString('es-ES', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                      })}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <Clock className="w-4 h-4 text-theme-tertiary" />
                  <div>
                    <p className="text-xs text-theme-tertiary">Última modificación</p>
                    <p className="text-sm text-theme-primary">
                      {new Date(documento.updatedAt).toLocaleDateString('es-ES', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                      })}
                    </p>
                  </div>
                </div>

                {documento.usuario && (
                  <div className="flex items-center gap-3">
                    <User className="w-4 h-4 text-theme-tertiary" />
                    <div>
                      <p className="text-xs text-theme-tertiary">Subido por</p>
                      <p className="text-sm text-theme-primary">
                        {documento.usuario.nombre} {documento.usuario.apellido1}
                      </p>
                    </div>
                  </div>
                )}

                <div className="flex items-center gap-3">
                  <Hash className="w-4 h-4 text-theme-tertiary" />
                  <div>
                    <p className="text-xs text-theme-tertiary">ID</p>
                    <p className="text-sm text-theme-primary font-mono">{documento.id}</p>
                  </div>
                </div>

                {documento.metadata?.ocr?.pages && (
                  <div className="flex items-center gap-3">
                    <FileText className="w-4 h-4 text-theme-tertiary" />
                    <div>
                      <p className="text-xs text-theme-tertiary">Páginas</p>
                      <p className="text-sm text-theme-primary">{documento.metadata.ocr.pages}</p>
                    </div>
                  </div>
                )}

                {documento.metadata?.ocr?.language && (
                  <div className="flex items-center gap-3">
                    <span className="w-4 h-4 flex items-center justify-center text-theme-tertiary text-xs">🌐</span>
                    <div>
                      <p className="text-xs text-theme-tertiary">Idioma detectado</p>
                      <p className="text-sm text-theme-primary uppercase">{documento.metadata.ocr.language}</p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Acciones OCR */}
            {!documento.contenidoExtraido && documento.mimeType && (
              documento.mimeType.includes('pdf') || documento.mimeType.startsWith('image/')
            ) && (
              <div className="bg-theme-secondary rounded-xl border border-theme p-6">
                <h3 className="font-semibold text-theme-primary mb-4">Procesar OCR</h3>
                <p className="text-sm text-theme-secondary mb-4">
                  Extrae el texto del documento para hacerlo searchable.
                </p>
                <button
                  onClick={handleProcesarOcr}
                  disabled={processingOcr}
                  className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-amber-500 text-white rounded-lg hover:bg-amber-600 disabled:opacity-50"
                >
                  {processingOcr ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Procesando...
                    </>
                  ) : (
                    <>
                      <FileSearch className="w-4 h-4" />
                      Procesar OCR
                    </>
                  )}
                </button>
              </div>
            )}

            {/* Tags sugeridos */}
            {documento.metadata?.analysis?.suggestedTags && documento.metadata.analysis.suggestedTags.length > 0 && (
              <div className="bg-theme-secondary rounded-xl border border-theme p-6">
                <h3 className="font-semibold text-theme-primary mb-4">Tags sugeridos</h3>
                <div className="flex flex-wrap gap-2">
                  {documento.metadata.analysis.suggestedTags.map((tag, idx) => (
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
              : <FileText className="w-4 h-4" />}
            <span>{toast.message}</span>
          </motion.div>
        ))}
      </div>
    </AppLayout>
  );
}

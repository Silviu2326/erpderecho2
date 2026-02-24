import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search, Filter, Grid3X3, List as ListIcon, Upload, Trash2,
  Download, Eye, FileText, Image, File, Table, AlertCircle,
  ChevronLeft, ChevronRight, X, CheckCircle, Loader2,
  FolderOpen, RefreshCw
} from 'lucide-react';
import { AppLayout } from '@/components/layout/AppLayout';
import { UploadZone } from '@/components/documentos/UploadZone';
import { DocumentoCard } from '@/components/documentos/DocumentoCard';
import { useAuth } from '@/contexts/AuthContext';
import { documentoService, expedienteService } from '@/services';
import type { Documento, UploadProgress, TipoDocumento } from '@/types/documento.types';

interface Toast {
  id: number;
  message: string;
  type: 'success' | 'error' | 'info';
}

const tipoFiltros: { value: TipoDocumento | 'all'; label: string }[] = [
  { value: 'all', label: 'Todos' },
  { value: 'PDF', label: 'PDF' },
  { value: 'IMAGEN', label: 'Imágenes' },
  { value: 'WORD', label: 'Word' },
  { value: 'EXCEL', label: 'Excel' },
  { value: 'OTRO', label: 'Otros' },
];

export default function Biblioteca() {
  const navigate = useNavigate();
  const { user, hasPermission } = useAuth();

  // Estados de documentos
  const [documentos, setDocumentos] = useState<Documento[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [totalPages, setTotalPages] = useState(1);
  const [currentPage, setCurrentPage] = useState(1);

  // Filtros
  const [searchQuery, setSearchQuery] = useState('');
  const [tipoFiltro, setTipoFiltro] = useState<TipoDocumento | 'all'>('all');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  // Upload
  const [uploads, setUploads] = useState<UploadProgress[]>([]);
  const [showUploadZone, setShowUploadZone] = useState(false);

  // Expedientes para dropdown
  const [expedientes, setExpedientes] = useState<Array<{ id: string; numeroExpediente: string }>>([]);
  const [selectedExpediente, setSelectedExpediente] = useState<string>('');

  // Toasts
  const [toasts, setToasts] = useState<Toast[]>([]);

  // Cargar documentos
  const cargarDocumentos = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await documentoService.listarDocumentos({
        page: currentPage,
        limit: 20,
        search: searchQuery || undefined,
        tipo: tipoFiltro === 'all' ? undefined : tipoFiltro,
      });

      setDocumentos(response.data);
      setTotalPages(response.meta.totalPages);
    } catch (err: any) {
      setError(err.message || 'Error al cargar documentos');
      showToast('Error al cargar documentos', 'error');
    } finally {
      setLoading(false);
    }
  }, [currentPage, searchQuery, tipoFiltro]);

  // Cargar expedientes para dropdown
  const cargarExpedientes = useCallback(async () => {
    try {
      const response = await expedienteService.listarExpedientes({ limit: 100 });
      setExpedientes(response.data.map(e => ({ id: e.id, numeroExpediente: e.numeroExpediente })));
    } catch (err) {
      console.error('Error cargando expedientes:', err);
    }
  }, []);

  // Cargar datos iniciales
  useEffect(() => {
    cargarDocumentos();
    cargarExpedientes();
  }, [cargarDocumentos, cargarExpedientes]);

  // Toast helper
  const showToast = (message: string, type: 'success' | 'error' | 'info' = 'info') => {
    const id = Date.now();
    setToasts(prev => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 3000);
  };

  // Manejar archivos seleccionados
  const handleFilesSelected = async (files: File[]) => {
    setShowUploadZone(false);

    // Crear estado inicial de uploads
    const newUploads: UploadProgress[] = files.map(file => ({
      file,
      progress: 0,
      status: 'pending',
    }));

    setUploads(prev => [...prev, ...newUploads]);

    // Subir cada archivo
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const uploadIndex = uploads.length + i;

      try {
        // Actualizar a uploading
        setUploads(prev => prev.map((u, idx) =>
          idx === uploadIndex ? { ...u, status: 'uploading' } : u
        ));

        const documento = await documentoService.subirDocumento(
          file,
          {
            nombre: file.name,
            expedienteId: selectedExpediente || undefined,
            processOcr: true,
          },
          (progress) => {
            setUploads(prev => prev.map((u, idx) =>
              idx === uploadIndex ? { ...u, progress } : u
            ));
          }
        );

        // Actualizar a completed
        setUploads(prev => prev.map((u, idx) =>
          idx === uploadIndex ? { ...u, status: 'completed', documento } : u
        ));

        showToast(`"${file.name}" subido correctamente`, 'success');

        // Recargar lista
        cargarDocumentos();

      } catch (err: any) {
        setUploads(prev => prev.map((u, idx) =>
          idx === uploadIndex ? { ...u, status: 'error', error: err.message } : u
        ));
        showToast(`Error subiendo "${file.name}": ${err.message}`, 'error');
      }
    }

    // Limpiar uploads completados después de 3 segundos
    setTimeout(() => {
      setUploads(prev => prev.filter(u => u.status !== 'completed'));
    }, 3000);
  };

  // Descargar documento
  const handleDownload = async (documento: Documento) => {
    try {
      await documentoService.descargarDocumento(documento.id, documento.nombre);
      showToast('Descarga iniciada', 'success');
    } catch (err: any) {
      showToast(`Error al descargar: ${err.message}`, 'error');
    }
  };

  // Eliminar documento
  const handleDelete = async (id: string) => {
    if (!confirm('¿Estás seguro de que deseas eliminar este documento?')) {
      return;
    }

    try {
      await documentoService.eliminarDocumento(id);
      showToast('Documento eliminado', 'success');
      cargarDocumentos();
    } catch (err: any) {
      showToast(`Error al eliminar: ${err.message}`, 'error');
    }
  };

  // Ver documento
  const handleView = (documento: Documento) => {
    navigate(`/documentos/biblioteca/${documento.id}`);
  };

  // Limpiar filtros
  const clearFilters = () => {
    setSearchQuery('');
    setTipoFiltro('all');
    setSelectedExpediente('');
    setCurrentPage(1);
  };

  const canUpload = hasPermission('documentos:write');
  const canDelete = hasPermission('documentos:delete');

  return (
    <AppLayout>
      <div className="p-6 space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-theme-primary">Biblioteca de Documentos</h1>
            <p className="text-theme-secondary">
              {documentos.length} documentos en total
            </p>
          </div>

          <div className="flex items-center gap-3">
            {canUpload && (
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setShowUploadZone(!showUploadZone)}
                className="flex items-center gap-2 px-4 py-2 bg-amber-500 text-white rounded-lg hover:bg-amber-600 transition-colors"
              >
                <Upload className="w-4 h-4" />
                Subir Documento
              </motion.button>
            )}
          </div>
        </div>

        {/* Upload Zone */}
        <AnimatePresence>
          {showUploadZone && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="space-y-4"
            >
              <UploadZone
                onFilesSelected={handleFilesSelected}
                multiple={true}
                maxSize={25}
              />

              {/* Selector de expediente */}
              <div className="flex items-center gap-3">
                <span className="text-theme-secondary">Vincular a expediente:</span>
                <select
                  value={selectedExpediente}
                  onChange={(e) => setSelectedExpediente(e.target.value)}
                  className="px-3 py-2 bg-theme-secondary border border-theme rounded-lg text-theme-primary"
                >
                  <option value="">Ninguno</option>
                  {expedientes.map(exp => (
                    <option key={exp.id} value={exp.id}>
                      {exp.numeroExpediente}
                    </option>
                  ))}
                </select>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Progreso de uploads */}
        {uploads.length > 0 && (
          <div className="space-y-2">
            <h3 className="text-sm font-medium text-theme-secondary">Subiendo archivos...</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {uploads.map((upload, idx) => (
                <DocumentoCard key={idx} uploadProgress={upload} />
              ))}
            </div>
          </div>
        )}

        {/* Filtros */}
        <div className="flex flex-col md:flex-row gap-4 p-4 bg-theme-secondary rounded-xl">
          {/* Búsqueda */}
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-theme-tertiary" />
            <input
              type="text"
              placeholder="Buscar documentos..."
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full pl-10 pr-4 py-2 bg-theme border border-theme rounded-lg text-theme-primary placeholder-theme-tertiary focus:outline-none focus:border-amber-500"
            />
          </div>

          {/* Filtro tipo */}
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-theme-tertiary" />
            <select
              value={tipoFiltro}
              onChange={(e) => {
                setTipoFiltro(e.target.value as TipoDocumento | 'all');
                setCurrentPage(1);
              }}
              className="px-3 py-2 bg-theme border border-theme rounded-lg text-theme-primary focus:outline-none focus:border-amber-500"
            >
              {tipoFiltros.map(tipo => (
                <option key={tipo.value} value={tipo.value}>{tipo.label}</option>
              ))}
            </select>
          </div>

          {/* Vista */}
          <div className="flex items-center gap-1 bg-theme rounded-lg p-1">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-2 rounded transition-colors ${
                viewMode === 'grid'
                  ? 'bg-amber-500 text-white'
                  : 'text-theme-tertiary hover:text-theme-primary'
              }`}
            >
              <Grid3X3 className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`p-2 rounded transition-colors ${
                viewMode === 'list'
                  ? 'bg-amber-500 text-white'
                  : 'text-theme-tertiary hover:text-theme-primary'
              }`}
            >
              <ListIcon className="w-4 h-4" />
            </button>
          </div>

          {/* Limpiar filtros */}
          {(searchQuery || tipoFiltro !== 'all') && (
            <button
              onClick={clearFilters}
              className="p-2 text-theme-tertiary hover:text-theme-primary"
              title="Limpiar filtros"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Error */}
        {error && (
          <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-xl flex items-center gap-3">
            <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0" />
            <p className="text-red-400">{error}</p>
            <button
              onClick={cargarDocumentos}
              className="ml-auto px-3 py-1 text-sm text-red-500 hover:text-red-400 underline"
            >
              Reintentar
            </button>
          </div>
        )}

        {/* Loading */}
        {loading && (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-amber-500" />
          </div>
        )}

        {/* Documentos */}
        {!loading && !error && (
          <>
            {documentos.length > 0 ? (
              <div className={`grid gap-4 ${
                viewMode === 'grid'
                  ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4'
                  : 'grid-cols-1'
              }`}>
                {documentos.map(documento => (
                  <DocumentoCard
                    key={documento.id}
                    documento={documento}
                    onDownload={handleDownload}
                    onDelete={canDelete ? handleDelete : undefined}
                    onView={handleView}
                    canDelete={canDelete}
                  />
                ))}
              </div>
            ) : (
              <div className="text-center py-12 bg-theme-secondary rounded-xl">
                <FolderOpen className="w-12 h-12 text-theme-tertiary mx-auto mb-4" />
                <h3 className="text-lg font-medium text-theme-primary mb-2">
                  No hay documentos
                </h3>
                <p className="text-theme-secondary mb-4">
                  {searchQuery || tipoFiltro !== 'all'
                    ? 'No se encontraron documentos con los filtros aplicados'
                    : 'Sube tu primer documento para comenzar'}
                </p>
                {canUpload && !searchQuery && tipoFiltro === 'all' && (
                  <button
                    onClick={() => setShowUploadZone(true)}
                    className="px-4 py-2 bg-amber-500 text-white rounded-lg hover:bg-amber-600"
                  >
                    Subir Documento
                  </button>
                )}
              </div>
            )}

            {/* Paginación */}
            {totalPages > 1 && (
              <div className="flex items-center justify-center gap-2 pt-4">
                <button
                  onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                  className="p-2 rounded-lg bg-theme-secondary text-theme-primary disabled:opacity-50"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>

                <span className="text-theme-secondary">
                  Página {currentPage} de {totalPages}
                </span>

                <button
                  onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages}
                  className="p-2 rounded-lg bg-theme-secondary text-theme-primary disabled:opacity-50"
                >
                  <ChevronRight className="w-5 h-5" />
                </button>
              </div>
            )}
          </>
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
              : <FileText className="w-4 h-4" />}
            <span>{toast.message}</span>
          </motion.div>
        ))}
      </div>
    </AppLayout>
  );
}

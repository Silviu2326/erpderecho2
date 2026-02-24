import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  Plus, Filter, Search, Eye, Edit2, MoreVertical, 
  FileText, Trash2, Calendar, AlertCircle, 
  CheckCircle2, Clock, Archive, Loader2,
  ChevronLeft, ChevronRight, LayoutGrid, List
} from 'lucide-react';
import { AppLayout } from '@/components/layout/AppLayout';
import { useAuth } from '@/contexts/AuthContext';
import { 
  expedienteService, 
  clienteService,
  type Expediente, 
  type TipoExpediente,
  type EstadoExpediente
} from '@/services';

// Tipos
interface Toast {
  id: number;
  message: string;
  type: 'success' | 'error' | 'info';
}

// Mapeo de estados para UI
const estadoConfig: Record<EstadoExpediente, { color: string; icon: any; label: string }> = {
  ACTIVO: { color: 'bg-emerald-500', icon: CheckCircle2, label: 'Activo' },
  CERRADO: { color: 'bg-blue-500', icon: CheckCircle2, label: 'Cerrado' },
  ARCHIVADO: { color: 'bg-gray-500', icon: Archive, label: 'Archivado' },
  SUSPENDIDO: { color: 'bg-amber-500', icon: Clock, label: 'Suspendido' },
};

const tipoConfig: Record<TipoExpediente, string> = {
  CIVIL: 'Civil',
  PENAL: 'Penal',
  LABORAL: 'Laboral',
  CONTENCIOSO: 'Contencioso',
  MERCANTIL: 'Mercantil',
  FAMILIA: 'Familia',
  ADMINISTRATIVO: 'Administrativo',
};

export default function Expedientes() {
  const navigate = useNavigate();
  const { user, hasPermission } = useAuth();
  
  // Estados
  const [expedientes, setExpedientes] = useState<Expediente[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [toasts, setToasts] = useState<Toast[]>([]);
  
  // Filtros y búsqueda
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<EstadoExpediente | 'all'>('all');
  const [typeFilter, setTypeFilter] = useState<TipoExpediente | 'all'>('all');
  const [viewMode, setViewMode] = useState<'list' | 'grid'>('list');
  
  // Paginación
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const itemsPerPage = 10;

  // Cargar expedientes
  useEffect(() => {
    cargarExpedientes();
  }, [currentPage, statusFilter, typeFilter]);

  const cargarExpedientes = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const params: any = {
        page: currentPage,
        limit: itemsPerPage,
        sort: 'createdAt',
        order: 'desc',
      };

      if (searchQuery) {
        params.search = searchQuery;
      }

      if (statusFilter !== 'all') {
        params.estado = statusFilter;
      }

      if (typeFilter !== 'all') {
        params.tipo = typeFilter;
      }

      const response = await expedienteService.listarExpedientes(params);
      setExpedientes(response.data);
      setTotalPages(response.meta.totalPages);
      setTotalItems(response.meta.total);
    } catch (err: any) {
      setError(err.message || 'Error al cargar expedientes');
      showToast('Error al cargar expedientes', 'error');
    } finally {
      setLoading(false);
    }
  };

  // Buscar al escribir (con debounce)
  useEffect(() => {
    const timer = setTimeout(() => {
      if (currentPage !== 1) {
        setCurrentPage(1);
      } else {
        cargarExpedientes();
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Toast helper
  const showToast = (message: string, type: 'success' | 'error' | 'info' = 'info') => {
    const id = Date.now();
    setToasts(prev => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 3000);
  };

  // Filtrar expedientes localmente (por búsqueda ya hecha en API)
  const filteredExpedientes = useMemo(() => {
    return expedientes;
  }, [expedientes]);

  // Handlers
  const handleViewExpediente = (id: string) => {
    navigate(`/core/expedientes/${id}`);
  };

  const handleEditExpediente = (expediente: Expediente) => {
    // TODO: Abrir modal de edición
    showToast('Función de edición en desarrollo', 'info');
  };

  const handleDeleteExpediente = async (id: string) => {
    if (!confirm('¿Estás seguro de que deseas archivar este expediente?')) {
      return;
    }

    try {
      await expedienteService.archivarExpediente(id);
      showToast('Expediente archivado correctamente', 'success');
      cargarExpedientes();
    } catch (err: any) {
      showToast(err.message || 'Error al archivar expediente', 'error');
    }
  };

  const handleCreateExpediente = () => {
    // TODO: Abrir modal de creación
    showToast('Función de creación en desarrollo', 'info');
  };

  // Paginación
  const paginatedExpedientes = filteredExpedientes;
  
  // Determinar permisos
  const canCreate = hasPermission('expedientes:write');
  const canEdit = hasPermission('expedientes:write');
  const canDelete = hasPermission('expedientes:delete');

  return (
    <AppLayout>
      <div className="p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-theme-primary">Expedientes</h1>
            <p className="text-theme-secondary">
              {totalItems} expedientes en total
            </p>
          </div>
          
          <div className="flex items-center gap-3">
            {canCreate && (
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleCreateExpediente}
                className="flex items-center gap-2 px-4 py-2 bg-amber-500 text-white rounded-lg hover:bg-amber-600 transition-colors"
              >
                <Plus className="w-4 h-4" />
                Nuevo Expediente
              </motion.button>
            )}
            
            <div className="flex items-center gap-2 bg-theme-secondary rounded-lg p-1">
              <button
                onClick={() => setViewMode('list')}
                className={`p-2 rounded-md transition-colors ${
                  viewMode === 'list' 
                    ? 'bg-theme-primary text-amber-500' 
                    : 'text-theme-tertiary hover:text-theme-primary'
                }`}
              >
                <List className="w-4 h-4" />
              </button>
              <button
                onClick={() => setViewMode('grid')}
                className={`p-2 rounded-md transition-colors ${
                  viewMode === 'grid' 
                    ? 'bg-theme-primary text-amber-500' 
                    : 'text-theme-tertiary hover:text-theme-primary'
                }`}
              >
                <LayoutGrid className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Filtros */}
        <div className="flex flex-wrap items-center gap-4 p-4 bg-theme-secondary rounded-xl">
          <div className="flex-1 min-w-[300px]">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-theme-tertiary" />
              <input
                type="text"
                placeholder="Buscar expedientes..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-theme-primary border border-theme rounded-lg text-theme-primary placeholder-theme-tertiary focus:outline-none focus:border-amber-500"
              />
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-theme-tertiary" />
            
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as EstadoExpediente | 'all')}
              className="px-3 py-2 bg-theme-primary border border-theme rounded-lg text-theme-primary focus:outline-none focus:border-amber-500"
            >
              <option value="all">Todos los estados</option>
              {Object.entries(estadoConfig).map(([key, config]) => (
                <option key={key} value={key}>{config.label}</option>
              ))}
            </select>
            
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value as TipoExpediente | 'all')}
              className="px-3 py-2 bg-theme-primary border border-theme rounded-lg text-theme-primary focus:outline-none focus:border-amber-500"
            >
              <option value="all">Todos los tipos</option>
              {Object.entries(tipoConfig).map(([key, label]) => (
                <option key={key} value={key}>{label}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Error */}
        {error && (
          <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-xl flex items-center gap-3">
            <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0" />
            <p className="text-red-400">{error}</p>
            <button
              onClick={cargarExpedientes}
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

        {/* Lista de expedientes */}
        {!loading && !error && (
          <>
            {viewMode === 'list' ? (
              <div className="bg-theme-secondary rounded-xl overflow-hidden">
                <table className="w-full">
                  <thead className="bg-theme border-b border-theme">
                    <tr>
                      <th className="text-left px-4 py-3 text-theme-secondary font-medium">Número</th>
                      <th className="text-left px-4 py-3 text-theme-secondary font-medium">Tipo</th>
                      <th className="text-left px-4 py-3 text-theme-secondary font-medium">Estado</th>
                      <th className="text-left px-4 py-3 text-theme-secondary font-medium">Cliente</th>
                      <th className="text-left px-4 py-3 text-theme-secondary font-medium">Abogado</th>
                      <th className="text-left px-4 py-3 text-theme-secondary font-medium">Fecha</th>
                      <th className="text-right px-4 py-3 text-theme-secondary font-medium">Acciones</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-theme">
                    {paginatedExpedientes.map((expediente) => {
                      const estado = estadoConfig[expediente.estado];
                      const EstadoIcon = estado.icon;
                      
                      return (
                        <tr 
                          key={expediente.id} 
                          className="hover:bg-theme-hover/50 transition-colors"
                        >
                          <td className="px-4 py-3">
                            <button
                              onClick={() => handleViewExpediente(expediente.id)}
                              className="text-amber-500 hover:text-amber-400 font-medium"
                            >
                              {expediente.numeroExpediente}
                            </button>
                          </td>
                          <td className="px-4 py-3">
                            <span className="text-theme-primary">
                              {tipoConfig[expediente.tipo]}
                            </span>
                          </td>
                          <td className="px-4 py-3">
                            <span className={`inline-flex items-center gap-1.5 px-2 py-1 rounded-full text-xs font-medium ${estado.color} text-white`}>
                              <EstadoIcon className="w-3 h-3" />
                              {estado.label}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-theme-primary">
                            {expediente.cliente?.nombre || 'Sin cliente'}
                          </td>
                          <td className="px-4 py-3 text-theme-primary">
                            {expediente.abogado 
                              ? `${expediente.abogado.nombre} ${expediente.abogado.apellido1 || ''}`
                              : 'Sin abogado'
                            }
                          </td>
                          <td className="px-4 py-3 text-theme-secondary">
                            {new Date(expediente.createdAt).toLocaleDateString('es-ES')}
                          </td>
                          <td className="px-4 py-3">
                            <div className="flex items-center justify-end gap-2">
                              <button
                                onClick={() => handleViewExpediente(expediente.id)}
                                className="p-2 text-theme-tertiary hover:text-amber-500 transition-colors"
                                title="Ver detalle"
                              >
                                <Eye className="w-4 h-4" />
                              </button>
                              
                              {canEdit && (
                                <button
                                  onClick={() => handleEditExpediente(expediente)}
                                  className="p-2 text-theme-tertiary hover:text-amber-500 transition-colors"
                                  title="Editar"
                                >
                                  <Edit2 className="w-4 h-4" />
                                </button>
                              )}
                              
                              {canDelete && (
                                <button
                                  onClick={() => handleDeleteExpediente(expediente.id)}
                                  className="p-2 text-theme-tertiary hover:text-red-500 transition-colors"
                                  title="Archivar"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              )}
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
                
                {paginatedExpedientes.length === 0 && (
                  <div className="p-8 text-center text-theme-tertiary">
                    No se encontraron expedientes
                  </div>
                )}
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {paginatedExpedientes.map((expediente) => {
                  const estado = estadoConfig[expediente.estado];
                  const EstadoIcon = estado.icon;
                  
                  return (
                    <motion.div
                      key={expediente.id}
                      whileHover={{ scale: 1.02 }}
                      className="p-4 bg-theme-secondary rounded-xl border border-theme hover:border-amber-500/30 transition-colors cursor-pointer"
                      onClick={() => handleViewExpediente(expediente.id)}
                    >
                      <div className="flex items-start justify-between mb-3">
                        <span className="text-amber-500 font-medium">
                          {expediente.numeroExpediente}
                        </span>
                        <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${estado.color} text-white`}>
                          <EstadoIcon className="w-3 h-3" />
                          {estado.label}
                        </span>
                      </div>
                      
                      <div className="space-y-2">
                        <div className="text-theme-primary font-medium">
                          {tipoConfig[expediente.tipo]}
                        </div>
                        
                        <div className="text-theme-secondary text-sm">
                          <span className="text-theme-tertiary">Cliente: </span>
                          {expediente.cliente?.nombre || 'Sin cliente'}
                        </div>
                        
                        <div className="text-theme-secondary text-sm">
                          <span className="text-theme-tertiary">Abogado: </span>
                          {expediente.abogado 
                            ? `${expediente.abogado.nombre} ${expediente.abogado.apellido1 || ''}`
                            : 'Sin abogado'
                          }
                        </div>
                        
                        <div className="text-theme-tertiary text-xs">
                          Creado: {new Date(expediente.createdAt).toLocaleDateString('es-ES')}
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
                
                {paginatedExpedientes.length === 0 && (
                  <div className="col-span-full p-8 text-center text-theme-tertiary">
                    No se encontraron expedientes
                  </div>
                )}
              </div>
            )}

            {/* Paginación */}
            {totalPages > 1 && (
              <div className="flex items-center justify-between pt-4">
                <div className="text-theme-secondary text-sm">
                  Página {currentPage} de {totalPages} ({totalItems} total)
                </div>
                
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                    disabled={currentPage === 1}
                    className="p-2 rounded-lg border border-theme text-theme-secondary hover:bg-theme-hover disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  
                  <button
                    onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                    disabled={currentPage === totalPages}
                    className="p-2 rounded-lg border border-theme text-theme-secondary hover:bg-theme-hover disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* Toasts */}
      <div className="fixed bottom-6 right-6 space-y-2 z-50">
        {toasts.map((toast) => (
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
            {toast.type === 'success' ? <CheckCircle2 className="w-4 h-4" /> 
              : toast.type === 'error' ? <AlertCircle className="w-4 h-4" /> 
              : <FileText className="w-4 h-4" />}
            <span>{toast.message}</span>
          </motion.div>
        ))}
      </div>
    </AppLayout>
  );
}

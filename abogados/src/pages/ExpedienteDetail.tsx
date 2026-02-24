import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  ArrowLeft, FileText, User, Calendar, CheckCircle2,
  AlertCircle, Clock, FolderOpen, Plus,
  Edit2, CheckSquare, MessageSquare, History,
  Gavel, Loader2, Archive
} from 'lucide-react';
import { AppLayout } from '@/components/layout/AppLayout';
import { useAuth } from '@/contexts/AuthContext';
import { 
  expedienteService,
  type Expediente,
  type Actuacion,
  type EstadoExpediente,
  type TipoExpediente
} from '@/services';

// Tipos
type TabType = 'general' | 'actuaciones' | 'documentos' | 'notas';

interface Toast {
  id: number;
  message: string;
  type: 'success' | 'error' | 'info';
}

// Configuración de estados
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

export default function ExpedienteDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { hasPermission } = useAuth();
  
  // Estados
  const [expediente, setExpediente] = useState<Expediente | null>(null);
  const [actuaciones, setActuaciones] = useState<Actuacion[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<TabType>('general');
  const [toasts, setToasts] = useState<Toast[]>([]);

  // Cargar expediente
  useEffect(() => {
    if (id) {
      cargarExpediente();
    }
  }, [id]);

  const cargarExpediente = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const data = await expedienteService.obtenerExpediente(id!);
      setExpediente(data);
      
      // Cargar actuaciones
      const actuacionesResponse = await expedienteService.obtenerActuaciones(id!, {
        limit: 10,
        sort: 'fecha',
        order: 'desc'
      });
      setActuaciones(actuacionesResponse.data);
    } catch (err: any) {
      setError(err.message || 'Error al cargar expediente');
      showToast('Error al cargar expediente', 'error');
    } finally {
      setLoading(false);
    }
  };

  // Toast helper
  const showToast = (message: string, type: 'success' | 'error' | 'info' = 'info') => {
    const toastId = Date.now();
    setToasts(prev => [...prev, { id: toastId, message, type }]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== toastId));
    }, 3000);
  };

  // Handlers
  const handleGoBack = () => {
    navigate('/core/expedientes');
  };

  const handleEditExpediente = () => {
    showToast('Función de edición en desarrollo', 'info');
  };

  const handleArchiveExpediente = async () => {
    if (!confirm('¿Estás seguro de que deseas archivar este expediente?')) {
      return;
    }

    try {
      await expedienteService.archivarExpediente(id!);
      showToast('Expediente archivado correctamente', 'success');
      navigate('/core/expedientes');
    } catch (err: any) {
      showToast(err.message || 'Error al archivar expediente', 'error');
    }
  };

  // Determinar permisos
  const canEdit = hasPermission('expedientes:write');
  const canDelete = hasPermission('expedientes:delete');

  if (loading) {
    return (
      <AppLayout>
        <div className="flex items-center justify-center min-h-screen">
          <Loader2 className="w-8 h-8 animate-spin text-amber-500" />
        </div>
      </AppLayout>
    );
  }

  if (error || !expediente) {
    return (
      <AppLayout>
        <div className="p-6">
          <button
            onClick={handleGoBack}
            className="flex items-center gap-2 text-theme-secondary hover:text-theme-primary mb-6"
          >
            <ArrowLeft className="w-4 h-4" />
            Volver a expedientes
          </button>
          
          <div className="p-8 bg-red-500/10 border border-red-500/20 rounded-xl text-center">
            <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
            <h2 className="text-xl font-bold text-red-500 mb-2">Error al cargar expediente</h2>
            <p className="text-theme-secondary mb-4">{error || 'No se encontró el expediente'}</p>
            <button
              onClick={cargarExpediente}
              className="px-4 py-2 bg-amber-500 text-white rounded-lg hover:bg-amber-600"
            >
              Reintentar
            </button>
          </div>
        </div>
      </AppLayout>
    );
  }

  const estado = estadoConfig[expediente.estado];
  const EstadoIcon = estado.icon;

  return (
    <AppLayout>
      <div className="p-6 space-y-6">
        {/* Header */}
        <div className="flex items-start justify-between">
          <div className="space-y-2">
            <button
              onClick={handleGoBack}
              className="flex items-center gap-2 text-theme-secondary hover:text-theme-primary"
            >
              <ArrowLeft className="w-4 h-4" />
              Volver a expedientes
            </button>
            
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold text-theme-primary">
                {expediente.numeroExpediente}
              </h1>
              <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-sm font-medium ${estado.color} text-white`}>
                <EstadoIcon className="w-4 h-4" />
                {estado.label}
              </span>
            </div>
            
            <p className="text-theme-secondary">
              {tipoConfig[expediente.tipo]} • Creado el {new Date(expediente.createdAt).toLocaleDateString('es-ES')}
            </p>
          </div>
          
          <div className="flex items-center gap-2">
            {canEdit && (
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleEditExpediente}
                className="flex items-center gap-2 px-4 py-2 bg-theme-secondary text-theme-primary rounded-lg hover:bg-theme-hover transition-colors"
              >
                <Edit2 className="w-4 h-4" />
                Editar
              </motion.button>
            )}
            
            {canDelete && (
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleArchiveExpediente}
                className="flex items-center gap-2 px-4 py-2 bg-red-500/10 text-red-500 rounded-lg hover:bg-red-500/20 transition-colors"
              >
                <Archive className="w-4 h-4" />
                Archivar
              </motion.button>
            )}
          </div>
        </div>

        {/* Tabs */}
        <div className="flex items-center gap-1 border-b border-theme">
          {[
            { id: 'general', label: 'General', icon: FileText },
            { id: 'actuaciones', label: 'Actuaciones', icon: History },
            { id: 'documentos', label: 'Documentos', icon: FolderOpen },
            { id: 'notas', label: 'Notas', icon: MessageSquare },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as TabType)}
              className={`flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
                activeTab === tab.id
                  ? 'border-amber-500 text-amber-500'
                  : 'border-transparent text-theme-secondary hover:text-theme-primary'
              }`}
            >
              <tab.icon className="w-4 h-4" />
              {tab.label}
            </button>
          ))}
        </div>

        {/* Contenido */}
        <div className="bg-theme-secondary rounded-xl p-6">
          {activeTab === 'general' && (
            <div className="space-y-6">
              {expediente.descripcion && (
                <div>
                  <h3 className="text-sm font-medium text-theme-secondary mb-2">Descripción</h3>
                  <p className="text-theme-primary">{expediente.descripcion}</p>
                </div>
              )}
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 bg-theme rounded-xl">
                  <div className="flex items-center gap-2 text-theme-secondary mb-2">
                    <User className="w-4 h-4" />
                    <span className="text-sm">Cliente</span>
                  </div>
                  <p className="text-theme-primary font-medium">
                    {expediente.cliente?.nombre || 'Sin cliente'}
                  </p>
                  {expediente.cliente?.email && (
                    <p className="text-theme-secondary text-sm mt-1">{expediente.cliente.email}</p>
                  )}
                </div>
                
                <div className="p-4 bg-theme rounded-xl">
                  <div className="flex items-center gap-2 text-theme-secondary mb-2">
                    <Gavel className="w-4 h-4" />
                    <span className="text-sm">Abogado</span>
                  </div>
                  <p className="text-theme-primary font-medium">
                    {expediente.abogado 
                      ? `${expediente.abogado.nombre} ${expediente.abogado.apellido1 || ''}`
                      : 'Sin abogado asignado'
                    }
                  </p>
                  {expediente.abogado?.email && (
                    <p className="text-theme-secondary text-sm mt-1">{expediente.abogado.email}</p>
                  )}
                </div>
                
                <div className="p-4 bg-theme rounded-xl">
                  <div className="flex items-center gap-2 text-theme-secondary mb-2">
                    <Calendar className="w-4 h-4" />
                    <span className="text-sm">Fecha de creación</span>
                  </div>
                  <p className="text-theme-primary font-medium">
                    {new Date(expediente.createdAt).toLocaleDateString('es-ES', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })}
                  </p>
                </div>
                
                <div className="p-4 bg-theme rounded-xl">
                  <div className="flex items-center gap-2 text-theme-secondary mb-2">
                    <Clock className="w-4 h-4" />
                    <span className="text-sm">Última actualización</span>
                  </div>
                  <p className="text-theme-primary font-medium">
                    {new Date(expediente.updatedAt).toLocaleDateString('es-ES', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </p>
                </div>
              </div​>
            </div>
          )}

          {activeTab === 'actuaciones' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-medium text-theme-primary">Actuaciones</h3>
                <button className="flex items-center gap-2 px-3 py-1.5 text-sm bg-amber-500 text-white rounded-lg hover:bg-amber-600">
                  <Plus className="w-4 h-4" />
                  Nueva actuación
                </button>
              </div>
              
              {actuaciones.length > 0 ? (
                <div className="space-y-3">
                  {actuaciones.map((actuacion) => (
                    <div key={actuacion.id} className="p-4 bg-theme rounded-xl">
                      <div className="flex items-start justify-between">
                        <div>
                          <div className="flex items-center gap-2 mb-2">
                            <History className="w-4 h-4 text-amber-500" />
                            <span className="font-medium text-theme-primary">{actuacion.tipo}</span>
                          </div>
                          {actuacion.descripcion && (
                            <p className="text-theme-secondary text-sm mb-2">{actuacion.descripcion}</p>
                          )}
                          <div className="flex items-center gap-4 text-sm text-theme-tertiary">
                            <span>{new Date(actuacion.fecha).toLocaleDateString('es-ES')}</span>
                            <span>por {actuacion.usuario?.nombre || 'Usuario'}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-theme-tertiary">
                  No hay actuaciones registradas
                </div>
              )}
            </div>
          )}

          {activeTab === 'documentos' && (
            <div className="text-center py-8 text-theme-tertiary">
              <FolderOpen className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>Gestión documental en desarrollo</p>
            </div>
          )}

          {activeTab === 'notas' && (
            <div className="text-center py-8 text-theme-tertiary">
              <MessageSquare className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>Sistema de notas en desarrollo</p>
            </div>
          )}
        </div>
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

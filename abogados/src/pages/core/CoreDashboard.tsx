import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  FileText, Calendar, Clock, Gavel, TrendingUp,
  AlertCircle, CheckCircle, ArrowRight, Plus,
  Loader2, FolderOpen
} from 'lucide-react';
import { AppLayout } from '@/components/layout/AppLayout';
import { useAuth } from '@/contexts/AuthContext';
import { 
  expedienteService, 
  calendarioService,
  type DashboardStats,
  type Evento
} from '@/services';

interface Toast {
  id: number;
  message: string;
  type: 'success' | 'error' | 'info';
}

export default function CoreDashboard() {
  const navigate = useNavigate();
  const { user, hasPermission } = useAuth();
  
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [eventos, setEventos] = useState<Evento[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [toasts, setToasts] = useState<Toast[]>([]);

  useEffect(() => {
    cargarDatos();
  }, []);

  const cargarDatos = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const [statsData, eventosData] = await Promise.all([
        expedienteService.obtenerEstadisticas(),
        calendarioService.obtenerProximosEventos(7)
      ]);
      
      setStats(statsData);
      setEventos(eventosData);
    } catch (err: any) {
      setError(err.message || 'Error al cargar datos');
      showToast('Error al cargar datos del dashboard', 'error');
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

  if (loading) {
    return (
      <AppLayout>
        <div className="flex items-center justify-center min-h-[60vh]">
          <Loader2 className="w-8 h-8 animate-spin text-amber-500" />
        </div>
      </AppLayout>
    );
  }

  if (error) {
    return (
      <AppLayout>
        <div className="p-6">
          <div className="p-8 bg-red-500/10 border border-red-500/20 rounded-xl text-center">
            <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
            <h2 className="text-xl font-bold text-red-500 mb-2">Error al cargar dashboard</h2>
            <p className="text-theme-secondary mb-4">{error}</p>
            <button
              onClick={cargarDatos}
              className="px-4 py-2 bg-amber-500 text-white rounded-lg hover:bg-amber-600"
            >
              Reintentar
            </button>
          </div>
        </div>
      </AppLayout>
    );
  }

  if (!stats) {
    return null;
  }

  const plazosCriticos = eventos.filter(e => 
    e.tipo === 'PLAZO' && new Date(e.fechaInicio) <= new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
  );

  const audienciasProximas = eventos.filter(e => e.tipo === 'AUDIENCIA');

  return (
    <AppLayout>
      <div className="p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-theme-primary">Dashboard Core Legal</h1>
            <p className="text-theme-secondary">
              Resumen del área legal - {user?.nombre} {user?.apellido1}
            </p>
          </div>
          
          {hasPermission('expedientes:write') && (
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => navigate('/core/expedientes/nuevo')}
              className="flex items-center gap-2 px-4 py-2 bg-amber-500 text-white rounded-lg hover:bg-amber-600 transition-colors"
            >
              <Plus className="w-4 h-4" />
              Nuevo Expediente
            </motion.button>
          )}
        </div>

        {/* KPI Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="p-4 bg-theme-secondary rounded-xl border border-theme cursor-pointer hover:border-amber-500/30 transition-colors"
            onClick={() => navigate('/core/expedientes')}
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-theme-secondary">Total Expedientes</p>
                <p className="text-2xl font-bold text-theme-primary">{stats.totalExpedientes}</p>
              </div>
              <div className="w-12 h-12 bg-amber-500/10 rounded-xl flex items-center justify-center">
                <FolderOpen className="w-6 h-6 text-amber-500" />
              </div>
            </div>
            <div className="mt-4 flex items-center gap-2 text-sm">
              <TrendingUp className="w-4 h-4 text-emerald-500" />
              <span className="text-emerald-500">+{stats.expedientesMes}</span>
              <span className="text-theme-tertiary">este mes</span>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="p-4 bg-theme-secondary rounded-xl border border-theme cursor-pointer hover:border-amber-500/30 transition-colors"
            onClick={() => navigate('/core/expedientes')}
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-theme-secondary">Expedientes Activos</p>
                <p className="text-2xl font-bold text-emerald-500">{stats.porEstado.ACTIVO || 0}</p>
              </div>
              <div className="w-12 h-12 bg-emerald-500/10 rounded-xl flex items-center justify-center">
                <CheckCircle className="w-6 h-6 text-emerald-500" />
              </div>
            </div>
            <div className="mt-4 text-sm text-theme-tertiary">
              {((stats.porEstado.ACTIVO / stats.totalExpedientes) * 100).toFixed(1)}% del total
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className={`p-4 rounded-xl border cursor-pointer hover:border-amber-500/30 transition-colors ${
              stats.plazosProximos > 0 
                ? 'bg-red-500/10 border-red-500/20' 
                : 'bg-theme-secondary border-theme'
            }`}
            onClick={() => navigate('/core/plazos')}
          >
            <div className="flex items-center justify-between">
              <div>
                <p className={`text-sm ${stats.plazosProximos > 0 ? 'text-red-500' : 'text-theme-secondary'}`}>
                  Plazos Próximos
                </p>
                <p className={`text-2xl font-bold ${stats.plazosProximos > 0 ? 'text-red-500' : 'text-theme-primary'}`}>
                  {stats.plazosProximos}
                </p>
              </div>
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                stats.plazosProximos > 0 ? 'bg-red-500/20' : 'bg-amber-500/10'
              }`}>
                <Clock className={`w-6 h-6 ${stats.plazosProximos > 0 ? 'text-red-500' : 'text-amber-500'}`} />
              </div>
            </div>
            <div className={`mt-4 text-sm flex items-center gap-1 ${
              stats.plazosProximos > 0 ? 'text-red-500' : 'text-amber-500'
            }`}>
              Ver plazos
              <ArrowRight className="w-3 h-3" />
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="p-4 bg-theme-secondary rounded-xl border border-theme cursor-pointer hover:border-amber-500/30 transition-colors"
            onClick={() => navigate('/core/audiencias')}
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-theme-secondary">Próximas Audiencias</p>
                <p className="text-2xl font-bold text-blue-500">{stats.proximasAudiencias}</p>
              </div>
              <div className="w-12 h-12 bg-blue-500/10 rounded-xl flex items-center justify-center">
                <Gavel className="w-6 h-6 text-blue-500" />
              </div>
            </div>
            <div className="mt-4 text-sm text-blue-500 flex items-center gap-1">
              Ver audiencias
              <ArrowRight className="w-3 h-3" />
            </div>
          </motion.div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Plazos Críticos */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="bg-theme-secondary rounded-xl border border-theme"
          >
            <div className="p-4 border-b border-theme flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Clock className="w-5 h-5 text-red-500" />
                <h2 className="text-lg font-semibold text-theme-primary">Plazos Críticos</h2>
              </div>
              <button
                onClick={() => navigate('/core/plazos')}
                className="text-sm text-amber-500 hover:text-amber-400 flex items-center gap-1"
              >
                Ver todos
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
            
            <div className="divide-y divide-theme">
              {plazosCriticos.slice(0, 5).map((plazo) => (
                <div key={plazo.id} className="p-4 hover:bg-theme-hover/50 transition-colors">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h3 className="font-medium text-theme-primary">{plazo.titulo}</h3>
                      <p className="text-sm text-theme-secondary mt-1">
                        {new Date(plazo.fechaInicio).toLocaleDateString('es-ES', {
                          weekday: 'long',
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric'
                        })}
                      </p>
                      {plazo.expediente && (
                        <p className="text-xs text-theme-tertiary mt-1">
                          Expediente: {plazo.expediente.numeroExpediente}
                        </p>
                      )}
                    </div>
                    <span className="px-2 py-1 bg-red-500/20 text-red-500 text-xs rounded-full">
                      Crítico
                    </span>
                  </div>
                </div>
              ))}
              
              {plazosCriticos.length === 0 && (
                <div className="p-8 text-center text-theme-tertiary">
                  <CheckCircle className="w-12 h-12 mx-auto mb-2 opacity-50" />
                  <p>No hay plazos críticos pendientes</p>
                </div>
              )}
            </div>
          </motion.div>

          {/* Próximas Audiencias */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="bg-theme-secondary rounded-xl border border-theme"
          >
            <div className="p-4 border-b border-theme flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Gavel className="w-5 h-5 text-blue-500" />
                <h2 className="text-lg font-semibold text-theme-primary">Próximas Audiencias</h2>
              </div>
              <button
                onClick={() => navigate('/core/audiencias')}
                className="text-sm text-amber-500 hover:text-amber-400 flex items-center gap-1"
              >
                Ver todas
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
            
            <div className="divide-y divide-theme">
              {audienciasProximas.slice(0, 5).map((audiencia) => (
                <div key={audiencia.id} className="p-4 hover:bg-theme-hover/50 transition-colors">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h3 className="font-medium text-theme-primary">{audiencia.titulo}</h3>
                      <p className="text-sm text-theme-secondary mt-1">
                        {new Date(audiencia.fechaInicio).toLocaleDateString('es-ES', {
                          weekday: 'long',
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </p>
                      {audiencia.expediente && (
                        <p className="text-xs text-theme-tertiary mt-1">
                          Expediente: {audiencia.expediente.numeroExpediente}
                        </p>
                      )}
                    </div>
                    <span className="px-2 py-1 bg-blue-500/20 text-blue-500 text-xs rounded-full">
                      Audiencia
                    </span>
                  </div>
                </div>
              ))}
              
              {audienciasProximas.length === 0 && (
                <div className="p-8 text-center text-theme-tertiary">
                  <Calendar className="w-12 h-12 mx-auto mb-2 opacity-50" />
                  <p>No hay audiencias programadas</p>
                </div>
              )}
            </div>
          </motion.div>
        </div>

        {/* Distribución por Tipo */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
          className="bg-theme-secondary rounded-xl border border-theme p-6"
        >
          <h2 className="text-lg font-semibold text-theme-primary mb-4">Distribución por Tipo</h2>
          
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4">
            {Object.entries(stats.porTipo).map(([tipo, count]) => (
              <div key={tipo} className="text-center p-4 bg-theme rounded-xl cursor-pointer hover:bg-theme-hover transition-colors"
                onClick={() => navigate(`/core/expedientes?tipo=${tipo}`)}
              >
                <p className="text-2xl font-bold text-theme-primary">{count}</p>
                <p className="text-xs text-theme-secondary mt-1">{tipo}</p>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Accesos Rápidos */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
          className="grid grid-cols-2 md:grid-cols-4 gap-4"
        >
          {[
            { label: 'Expedientes', icon: FileText, path: '/core/expedientes', color: 'text-amber-500' },
            { label: 'Calendario', icon: Calendar, path: '/core/calendario', color: 'text-blue-500' },
            { label: 'Audiencias', icon: Gavel, path: '/core/audiencias', color: 'text-purple-500' },
            { label: 'Plazos', icon: Clock, path: '/core/plazos', color: 'text-red-500' },
          ].map((item) => (
            <button
              key={item.label}
              onClick={() => navigate(item.path)}
              className="p-4 bg-theme-secondary rounded-xl border border-theme hover:border-amber-500/30 transition-colors flex flex-col items-center gap-2"
            >
              <item.icon className={`w-8 h-8 ${item.color}`} />
              <span className="text-theme-primary font-medium">{item.label}</span>
            </button>
          ))}
        </motion.div>
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

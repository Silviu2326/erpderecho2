import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { 
  FileText, Users, Calendar, Clock, TrendingUp, 
  AlertCircle, CheckCircle, FolderOpen, ArrowRight,
  Loader2, Gavel
} from 'lucide-react';
import { AppLayout } from '@/components/layout/AppLayout';
import { useAuth } from '@/contexts/AuthContext';
import { expedienteService, type DashboardStats } from '@/services';

export default function Dashboard() {
  const navigate = useNavigate();
  const { user, hasPermission } = useAuth();
  
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    cargarEstadisticas();
  }, []);

  const cargarEstadisticas = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const data = await expedienteService.obtenerEstadisticas();
      setStats(data);
    } catch (err: any) {
      setError(err.message || 'Error al cargar estadísticas');
    } finally {
      setLoading(false);
    }
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
              onClick={cargarEstadisticas}
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

  // Calcular totales
  const totalActivos = stats.porEstado.ACTIVO || 0;
  const totalCerrados = stats.porEstado.CERRADO || 0;
  const totalArchivados = stats.porEstado.ARCHIVADO || 0;

  return (
    <AppLayout>
      <div className="p-6 space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold text-theme-primary">Dashboard</h1>
          <p className="text-theme-secondary">
            Bienvenido, {user?.nombre} {user?.apellido1}
          </p>
        </div>

        {/* KPI Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="p-4 bg-theme-secondary rounded-xl border border-theme"
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
            className="p-4 bg-theme-secondary rounded-xl border border-theme"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-theme-secondary">Expedientes Activos</p>
                <p className="text-2xl font-bold text-emerald-500">{totalActivos}</p>
              </div>
              <div className="w-12 h-12 bg-emerald-500/10 rounded-xl flex items-center justify-center">
                <CheckCircle className="w-6 h-6 text-emerald-500" />
              </div>
            </div>
            <div className="mt-4 text-sm text-theme-tertiary">
              {((totalActivos / stats.totalExpedientes) * 100).toFixed(1)}% del total
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="p-4 bg-theme-secondary rounded-xl border border-theme"
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
            <button
              onClick={() => navigate('/core/audiencias')}
              className="mt-4 text-sm text-blue-500 hover:text-blue-400 flex items-center gap-1"
            >
              Ver audiencias
              <ArrowRight className="w-3 h-3" />
            </button>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className={`p-4 rounded-xl border ${
              stats.plazosProximos > 0 
                ? 'bg-red-500/10 border-red-500/20' 
                : 'bg-theme-secondary border-theme'
            }`}
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
            <button
              onClick={() => navigate('/core/prescripciones')}
              className={`mt-4 text-sm flex items-center gap-1 ${
                stats.plazosProximos > 0 ? 'text-red-500 hover:text-red-400' : 'text-amber-500 hover:text-amber-400'
              }`}
            >
              Ver plazos
              <ArrowRight className="w-3 h-3" />
            </button>
          </motion.div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Expedientes recientes */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="bg-theme-secondary rounded-xl border border-theme"
          >
            <div className="p-4 border-b border-theme flex items-center justify-between">
              <h2 className="text-lg font-semibold text-theme-primary">Expedientes Recientes</h2>
              <button
                onClick={() => navigate('/core/expedientes')}
                className="text-sm text-amber-500 hover:text-amber-400 flex items-center gap-1"
              >
                Ver todos
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
            
            <div className="divide-y divide-theme">
              {stats.expedientesRecientes?.map((exp) => (
                <div 
                  key={exp.id} 
                  className="p-4 hover:bg-theme-hover/50 transition-colors cursor-pointer"
                  onClick={() => navigate(`/core/expedientes/${exp.id}`)}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="flex items-center gap-2">
                        <FileText className="w-4 h-4 text-amber-500" />
                        <span className="font-medium text-theme-primary">{exp.numeroExpediente}</span>
                        <span className={`px-2 py-0.5 text-xs rounded-full ${
                          exp.estado === 'ACTIVO' ? 'bg-emerald-500/20 text-emerald-500' :
                          exp.estado === 'CERRADO' ? 'bg-blue-500/20 text-blue-500' :
                          'bg-gray-500/20 text-gray-500'
                        }`}>
                          {exp.estado}
                        </span>
                      </div>
                      <p className="text-sm text-theme-secondary mt-1">
                        {exp.cliente?.nombre || 'Sin cliente'}
                      </p>
                    </div>
                    <span className="text-xs text-theme-tertiary">
                      {new Date(exp.createdAt).toLocaleDateString('es-ES')}
                    </span>
                  </div>
                </div>
              ))}
              
              {(!stats.expedientesRecientes || stats.expedientesRecientes.length === 0) && (
                <div className="p-8 text-center text-theme-tertiary">
                  No hay expedientes recientes
                </div>
              )}
            </div>
          </motion.div>

          {/* Próximos eventos */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="bg-theme-secondary rounded-xl border border-theme"
          >
            <div className="p-4 border-b border-theme flex items-center justify-between">
              <h2 className="text-lg font-semibold text-theme-primary">Próximos Eventos</h2>
              <button
                onClick={() => navigate('/core/calendario')}
                className="text-sm text-amber-500 hover:text-amber-400 flex items-center gap-1"
              >
                Ver calendario
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
            
            <div className="divide-y divide-theme">
              {stats.proximosEventos?.map((evento) => (
                <div key={evento.id} className="p-4">
                  <div className="flex items-start gap-3">
                    <div className={`w-2 h-2 rounded-full mt-2 ${
                      evento.tipo === 'AUDIENCIA' ? 'bg-blue-500' : 'bg-red-500'
                    }`} />
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <h3 className="font-medium text-theme-primary">{evento.titulo}</h3>
                        <span className={`px-2 py-0.5 text-xs rounded-full ${
                          evento.tipo === 'AUDIENCIA' 
                            ? 'bg-blue-500/20 text-blue-500' 
                            : 'bg-red-500/20 text-red-500'
                        }`}>
                          {evento.tipo}
                        </span>
                      </div>
                      
                      <div className="flex items-center gap-4 mt-1 text-sm text-theme-tertiary">
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          {new Date(evento.fechaInicio).toLocaleDateString('es-ES')}
                        </span>
                        
                        <span className="flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {new Date(evento.fechaInicio).toLocaleTimeString('es-ES', {
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </span>
                      </div>
                      
                      {evento.expediente && (
                        <p className="text-sm text-theme-secondary mt-1">
                          Expediente: {evento.expediente.numeroExpediente}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              ))}
              
              {(!stats.proximosEventos || stats.proximosEventos.length === 0) && (
                <div className="p-8 text-center text-theme-tertiary">
                  No hay eventos programados
                </div>
              )}
            </div>
          </motion.div>
        </div>

        {/* Distribución por tipo */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
          className="bg-theme-secondary rounded-xl border border-theme p-6"
        >
          <h2 className="text-lg font-semibold text-theme-primary mb-4">Distribución por Tipo</h2>
          
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4">
            {Object.entries(stats.porTipo).map(([tipo, count]) => (
              <div key={tipo} className="text-center p-4 bg-theme rounded-xl">
                <p className="text-2xl font-bold text-theme-primary">{count}</p>
                <p className="text-xs text-theme-secondary mt-1">{tipo}</p>
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </AppLayout>
  );
}

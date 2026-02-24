import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Clock, AlertTriangle, CheckCircle, Calendar,
  Search, Plus, Loader2, FileText, ArrowUpRight
} from 'lucide-react';
import { AppLayout } from '@/components/layout/AppLayout';
import { useAuth } from '@/contexts/AuthContext';
import { 
  calendarioService,
  type Evento
} from '@/services';

interface Toast {
  id: number;
  message: string;
  type: 'success' | 'error' | 'info';
}

export default function Prescripciones() {
  // Estados
  const [plazos, setPlazos] = useState<Evento[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [toasts, setToasts] = useState<Toast[]>([]);
  const [searchQuery, setSearchQuery] = useState('');

  // Cargar plazos
  useEffect(() => {
    cargarPlazos();
  }, []);

  const cargarPlazos = async () => {
    setLoading(true);
    setError(null);
    
    try {
      // Calcular rango de fechas (próximos 180 días)
      const hoy = new Date();
      const fechaDesde = hoy.toISOString().split('T')[0];
      
      const fechaHasta = new Date();
      fechaHasta.setDate(hoy.getDate() + 180);
      
      const data = await calendarioService.listarPlazos(
        fechaDesde,
        fechaHasta.toISOString().split('T')[0]
      );
      
      setPlazos(data);
    } catch (err: any) {
      setError(err.message || 'Error al cargar plazos');
      showToast('Error al cargar plazos', 'error');
    } finally {
      setLoading(false);
    }
  };

  // Toast helper
  const showToast = (message: string, type: 'success' | 'error' | 'info' = 'info') => {
    const id = Date.now();
    setToasts(prev => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 3000);
  };

  // Calcular días restantes
  const getDiasRestantes = (fechaFin: string): number => {
    const hoy = new Date();
    hoy.setHours(0, 0, 0, 0);
    const fecha = new Date(fechaFin);
    fecha.setHours(0, 0, 0, 0);
    const diffTime = fecha.getTime() - hoy.getTime();
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  };

  // Determinar estado del plazo
  const getEstadoPlazo = (diasRestantes: number): { estado: string; color: string; icon: any } => {
    if (diasRestantes < 0) {
      return { estado: 'Vencido', color: 'bg-red-500', icon: AlertTriangle };
    } else if (diasRestantes <= 7) {
      return { estado: 'Crítico', color: 'bg-red-500', icon: AlertTriangle };
    } else if (diasRestantes <= 30) {
      return { estado: 'Urgente', color: 'bg-amber-500', icon: Clock };
    } else {
      return { estado: 'Activo', color: 'bg-emerald-500', icon: CheckCircle };
    }
  };

  // Filtrar plazos
  const filteredPlazos = plazos.filter(plazo =>
    plazo.titulo.toLowerCase().includes(searchQuery.toLowerCase()) ||
    plazo.descripcion?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    plazo.expediente?.numeroExpediente.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Ordenar por días restantes (más urgentes primero)
  const sortedPlazos = [...filteredPlazos].sort((a, b) => {
    const diasA = getDiasRestantes(a.fechaInicio);
    const diasB = getDiasRestantes(b.fechaInicio);
    return diasA - diasB;
  });

  // Separar por estado
  const plazosCriticos = sortedPlazos.filter(p => getDiasRestantes(p.fechaInicio) <= 7);
  const plazosProximos = sortedPlazos.filter(p => {
    const dias = getDiasRestantes(p.fechaInicio);
    return dias > 7 && dias <= 30;
  });
  const plazosFuturos = sortedPlazos.filter(p => getDiasRestantes(p.fechaInicio) > 30);

  return (
    <AppLayout>
      <div className="p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-theme-primary">Plazos y Prescripciones</h1>
            <p className="text-theme-secondary">
              {plazosCriticos.length} críticos • {plazosProximos.length} próximos • {plazosFuturos.length} futuros
            </p>
          </div>
          
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => showToast('Función de creación en desarrollo', 'info')}
            className="flex items-center gap-2 px-4 py-2 bg-amber-500 text-white rounded-lg hover:bg-amber-600 transition-colors"
          >
            <Plus className="w-4 h-4" />
            Nuevo Plazo
          </motion.button>
        </div>

        {/* Búsqueda */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-theme-tertiary" />
          <input
            type="text"
            placeholder="Buscar plazos..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-theme-secondary border border-theme rounded-lg text-theme-primary placeholder-theme-tertiary focus:outline-none focus:border-amber-500"
          />
        </div>

        {/* Error */}
        {error && (
          <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-xl flex items-center gap-3">
            <AlertTriangle className="w-5 h-5 text-red-500 flex-shrink-0" />
            <p className="text-red-400">{error}</p>
            <button
              onClick={cargarPlazos}
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

        {/* Contenido */}
        {!loading && !error && (
          <div className="space-y-6">
            {/* Plazos críticos */}
            {plazosCriticos.length > 0 && (
              <div>
                <div className="flex items-center gap-2 mb-4">
                  <AlertTriangle className="w-5 h-5 text-red-500" />
                  <h2 className="text-lg font-semibold text-red-500">Plazos Críticos</h2>
                  <span className="px-2 py-0.5 bg-red-500 text-white text-xs rounded-full">{plazosCriticos.length}</span>
                </div>
                
                <div className="space-y-3">
                  {plazosCriticos.map((plazo) => {
                    const diasRestantes = getDiasRestantes(plazo.fechaInicio);
                    const { estado, color, icon: Icon } = getEstadoPlazo(diasRestantes);
                    
                    return (
                      <motion.div
                        key={plazo.id}
                        whileHover={{ scale: 1.01 }}
                        className="p-4 bg-red-500/10 border border-red-500/20 rounded-xl"
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <Clock className="w-5 h-5 text-red-500" />
                              <h3 className="font-semibold text-theme-primary">{plazo.titulo}</h3>
                              <span className={`px-2 py-0.5 text-xs text-white rounded-full ${color}`}>
                                {diasRestantes < 0 ? `Vencido hace ${Math.abs(diasRestantes)} días` : `${diasRestantes} días restantes`}
                              </span>
                            </div>
                            
                            {plazo.descripcion && (
                              <p className="text-theme-secondary text-sm mb-3">{plazo.descripcion}</p>
                            )}
                            
                            <div className="flex flex-wrap items-center gap-4 text-sm text-theme-tertiary">
                              <span className="flex items-center gap-1">
                                <Calendar className="w-4 h-4" />
                                Vence: {new Date(plazo.fechaInicio).toLocaleDateString('es-ES')}
                              </span>
                              
                              {plazo.expediente && (
                                <span className="flex items-center gap-1">
                                  <FileText className="w-4 h-4" />
                                  {plazo.expediente.numeroExpediente}
                                </span>
                              )}
                            </div>
                          </div>
                          
                          <ArrowUpRight className="w-5 h-5 text-red-500" />
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Plazos próximos */}
            {plazosProximos.length > 0 && (
              <div>
                <div className="flex items-center gap-2 mb-4">
                  <Clock className="w-5 h-5 text-amber-500" />
                  <h2 className="text-lg font-semibold text-amber-500">Plazos Próximos</h2>
                  <span className="px-2 py-0.5 bg-amber-500 text-white text-xs rounded-full">{plazosProximos.length}</span>
                </div>
                
                <div className="space-y-3">
                  {plazosProximos.map((plazo) => {
                    const diasRestantes = getDiasRestantes(plazo.fechaInicio);
                    
                    return (
                      <motion.div
                        key={plazo.id}
                        whileHover={{ scale: 1.01 }}
                        className="p-4 bg-amber-500/10 border border-amber-500/20 rounded-xl"
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <Clock className="w-5 h-5 text-amber-500" />
                              <h3 className="font-medium text-theme-primary">{plazo.titulo}</h3>
                              <span className="px-2 py-0.5 bg-amber-500 text-white text-xs rounded-full">
                                {diasRestantes} días
                              </span>
                            </div>
                            
                            <div className="flex flex-wrap items-center gap-4 text-sm text-theme-tertiary">
                              <span className="flex items-center gap-1">
                                <Calendar className="w-4 h-4" />
                                {new Date(plazo.fechaInicio).toLocaleDateString('es-ES')}
                              </span>
                              
                              {plazo.expediente && (
                                <span className="flex items-center gap-1">
                                  <FileText className="w-4 h-4" />
                                  {plazo.expediente.numeroExpediente}
                                </span>
                              )}
                            </div>
                          </div>
                          
                          <ArrowUpRight className="w-5 h-5 text-amber-500" />
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Plazos futuros */}
            {plazosFuturos.length > 0 && (
              <div>
                <div className="flex items-center gap-2 mb-4">
                  <CheckCircle className="w-5 h-5 text-emerald-500" />
                  <h2 className="text-lg font-semibold text-emerald-500">Plazos Futuros</h2>
                  <span className="px-2 py-0.5 bg-emerald-500 text-white text-xs rounded-full">{plazosFuturos.length}</span>
                </div>
                
                <div className="space-y-3">
                  {plazosFuturos.map((plazo) => {
                    const diasRestantes = getDiasRestantes(plazo.fechaInicio);
                    
                    return (
                      <div
                        key={plazo.id}
                        className="p-4 bg-theme-secondary rounded-xl border border-theme"
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <Clock className="w-5 h-5 text-theme-tertiary" />
                              <h3 className="font-medium text-theme-primary">{plazo.titulo}</h3>
                              <span className="px-2 py-0.5 bg-emerald-500 text-white text-xs rounded-full">
                                {diasRestantes} días
                              </span>
                            </div>
                            
                            <div className="flex flex-wrap items-center gap-4 text-sm text-theme-tertiary">
                              <span className="flex items-center gap-1">
                                <Calendar className="w-4 h-4" />
                                {new Date(plazo.fechaInicio).toLocaleDateString('es-ES')}
                              </span>
                              
                              {plazo.expediente && (
                                <span className="flex items-center gap-1">
                                  <FileText className="w-4 h-4" />
                                  {plazo.expediente.numeroExpediente}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Sin plazos */}
            {sortedPlazos.length === 0 && (
              <div className="text-center py-12 bg-theme-secondary rounded-xl">
                <Clock className="w-12 h-12 text-theme-tertiary mx-auto mb-4" />
                <h3 className="text-lg font-medium text-theme-primary mb-2">No hay plazos registrados</h3>
                <p className="text-theme-secondary">Crea un nuevo plazo para comenzar</p>
              </div>
            )}
          </div>
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
            {toast.type === 'success' ? <CheckCircle className="w-4 h-4" /> 
              : toast.type === 'error' ? <AlertTriangle className="w-4 h-4" /> 
              : <Clock className="w-4 h-4" />}
            <span>{toast.message}</span>
          </motion.div>
        ))}
      </div>
    </AppLayout>
  );
}

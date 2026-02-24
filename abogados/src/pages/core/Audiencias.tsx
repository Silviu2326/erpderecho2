import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Plus, Calendar, Clock, MapPin, FileText, CheckCircle2,
  AlertCircle, Search, Eye, Loader2, Gavel
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

export default function Audiencias() {
  // Estados
  const [audiencias, setAudiencias] = useState<Evento[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [toasts, setToasts] = useState<Toast[]>([]);
  const [searchQuery, setSearchQuery] = useState('');

  // Cargar audiencias
  useEffect(() => {
    cargarAudiencias();
  }, []);

  const cargarAudiencias = async () => {
    setLoading(true);
    setError(null);
    
    try {
      // Calcular rango de fechas (próximos 90 días)
      const hoy = new Date();
      const fechaDesde = hoy.toISOString().split('T')[0];
      
      const fechaHasta = new Date();
      fechaHasta.setDate(hoy.getDate() + 90);
      
      const data = await calendarioService.listarAudiencias(
        fechaDesde,
        fechaHasta.toISOString().split('T')[0]
      );
      
      setAudiencias(data);
    } catch (err: any) {
      setError(err.message || 'Error al cargar audiencias');
      showToast('Error al cargar audiencias', 'error');
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

  // Filtrar audiencias
  const filteredAudiencias = audiencias.filter(audiencia =>
    audiencia.titulo.toLowerCase().includes(searchQuery.toLowerCase()) ||
    audiencia.descripcion?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    audiencia.expediente?.numeroExpediente.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Separar por estado temporal
  const hoy = new Date();
  const audienciasProximas = filteredAudiencias.filter(a => new Date(a.fechaInicio) >= hoy);
  const audienciasPasadas = filteredAudiencias.filter(a => new Date(a.fechaInicio) < hoy);

  return (
    <AppLayout>
      <div className="p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-theme-primary">Audiencias</h1>
            <p className="text-theme-secondary">
              {audienciasProximas.length} próximas • {audienciasPasadas.length} pasadas
            </p>
          </div>
          
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => showToast('Función de creación en desarrollo', 'info')}
            className="flex items-center gap-2 px-4 py-2 bg-amber-500 text-white rounded-lg hover:bg-amber-600 transition-colors"
          >
            <Plus className="w-4 h-4" />
            Nueva Audiencia
          </motion.button>
        </div>

        {/* Búsqueda */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-theme-tertiary" />
          <input
            type="text"
            placeholder="Buscar audiencias..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-theme-secondary border border-theme rounded-lg text-theme-primary placeholder-theme-tertiary focus:outline-none focus:border-amber-500"
          />
        </div>

        {/* Error */}
        {error && (
          <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-xl flex items-center gap-3">
            <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0" />
            <p className="text-red-400">{error}</p>
            <button
              onClick={cargarAudiencias}
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
          <>
            {/* Audiencias próximas */}
            <div>
              <h2 className="text-lg font-semibold text-theme-primary mb-4">Próximas Audiencias</h2>
              
              {audienciasProximas.length > 0 ? (
                <div className="space-y-3">
                  {audienciasProximas.map((audiencia) => (
                    <motion.div
                      key={audiencia.id}
                      whileHover={{ scale: 1.01 }}
                      className="p-4 bg-theme-secondary rounded-xl border border-theme hover:border-amber-500/30 transition-colors"
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <Gavel className="w-5 h-5 text-blue-500" />
                            <h3 className="font-semibold text-theme-primary">{audiencia.titulo}</h3>
                          </div>
                          
                          {audiencia.descripcion && (
                            <p className="text-theme-secondary text-sm mb-3">{audiencia.descripcion}</p>
                          )}
                          
                          <div className="flex flex-wrap items-center gap-4 text-sm text-theme-tertiary">
                            <span className="flex items-center gap-1">
                              <Calendar className="w-4 h-4" />
                              {new Date(audiencia.fechaInicio).toLocaleDateString('es-ES', {
                                weekday: 'long',
                                year: 'numeric',
                                month: 'long',
                                day: 'numeric'
                              })}
                            </span>
                            
                            <span className="flex items-center gap-1">
                              <Clock className="w-4 h-4" />
                              {new Date(audiencia.fechaInicio).toLocaleTimeString('es-ES', {
                                hour: '2-digit',
                                minute: '2-digit'
                              })}
                            </span>
                            
                            {audiencia.expediente && (
                              <span className="flex items-center gap-1">
                                <FileText className="w-4 h-4" />
                                {audiencia.expediente.numeroExpediente}
                              </span>
                            )}
                          </div>
                        </div>
                        
                        <button className="p-2 text-theme-tertiary hover:text-amber-500 transition-colors">
                          <Eye className="w-5 h-5" />
                        </button>
                      </div>
                    </motion.div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-theme-tertiary bg-theme-secondary rounded-xl">
                  No hay audiencias próximas programadas
                </div>
              )}
            </div>

            {/* Audiencias pasadas */}
            {audienciasPasadas.length > 0 && (
              <div className="mt-8">
                <h2 className="text-lg font-semibold text-theme-primary mb-4">Audiencias Pasadas</h2>
                
                <div className="space-y-3 opacity-75">
                  {audienciasPasadas.slice(0, 5).map((audiencia) => (
                    <div
                      key={audiencia.id}
                      className="p-4 bg-theme-secondary rounded-xl border border-theme"
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                            <h3 className="font-medium text-theme-primary">{audiencia.titulo}</h3>
                          </div>
                          
                          <div className="flex flex-wrap items-center gap-4 text-sm text-theme-tertiary">
                            <span className="flex items-center gap-1">
                              <Calendar className="w-4 h-4" />
                              {new Date(audiencia.fechaInicio).toLocaleDateString('es-ES')}
                            </span>
                            
                            {audiencia.expediente && (
                              <span className="flex items-center gap-1">
                                <FileText className="w-4 h-4" />
                                {audiencia.expediente.numeroExpediente}
                              </span>
                            )}
                          </div>
                        </div>
                        
                        <button className="p-2 text-theme-tertiary hover:text-amber-500 transition-colors"
003e
                          <Eye className="w-5 h-5" />
                        </button>
                      </div>
                    </div>
                  ))}
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
              : <Gavel className="w-4 h-4" />}
            <span>{toast.message}</span>
          </motion.div>
        ))}
      </div>
    </AppLayout>
  );
}

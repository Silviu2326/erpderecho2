import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Calendar as CalendarIcon, ChevronLeft, ChevronRight, Plus,
  Clock, AlertCircle, CheckCircle2, Loader2
} from 'lucide-react';
import { AppLayout } from '@/components/layout/AppLayout';
import { useAuth } from '@/contexts/AuthContext';
import { 
  calendarioService,
  type Evento,
  type TipoEvento
} from '@/services';

// Configuración de tipos de evento
const tipoEventoConfig: Record<TipoEvento, { color: string; label: string }> = {
  AUDIENCIA: { color: 'bg-blue-500', label: 'Audiencia' },
  PLAZO: { color: 'bg-red-500', label: 'Plazo' },
  TAREA: { color: 'bg-emerald-500', label: 'Tarea' },
  CITACION: { color: 'bg-purple-500', label: 'Citación' },
  NOTIFICACION: { color: 'bg-amber-500', label: 'Notificación' },
  OTRO: { color: 'bg-gray-500', label: 'Otro' },
};

interface Toast {
  id: number;
  message: string;
  type: 'success' | 'error' | 'info';
}

export default function Calendario() {
  // Estados
  const [eventos, setEventos] = useState<Evento[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [toasts, setToasts] = useState<Toast[]>([]);
  
  // Fecha actual
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  
  // Filtros
  const [tipoFilter, setTipoFilter] = useState<TipoEvento | 'all'>('all');

  // Cargar eventos
  useEffect(() => {
    cargarEventos();
  }, [currentDate, tipoFilter]);

  const cargarEventos = async () => {
    setLoading(true);
    setError(null);
    
    try {
      // Calcular rango de fechas para el mes actual
      const year = currentDate.getFullYear();
      const month = currentDate.getMonth();
      
      const primerDia = new Date(year, month, 1);
      const ultimoDia = new Date(year, month + 1, 0);
      
      const params: any = {
        fechaDesde: primerDia.toISOString().split('T')[0],
        fechaHasta: ultimoDia.toISOString().split('T')[0],
        limit: 100,
        sort: 'fechaInicio',
        order: 'asc',
      };

      if (tipoFilter !== 'all') {
        params.tipo = tipoFilter;
      }

      const response = await calendarioService.listarEventos(params);
      setEventos(response.data);
    } catch (err: any) {
      setError(err.message || 'Error al cargar eventos');
      showToast('Error al cargar eventos', 'error');
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

  // Navegación del calendario
  const prevMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  };

  const nextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
  };

  // Generar días del calendario
  const getDaysInMonth = () => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay(); // 0 = Domingo

    const days = [];
    
    // Días vacíos antes del primer día del mes
    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(null);
    }
    
    // Días del mes
    for (let i = 1; i <= daysInMonth; i++) {
      days.push(new Date(year, month, i));
    }
    
    return days;
  };

  // Obtener eventos para un día específico
  const getEventosForDay = (date: Date) => {
    const dateStr = date.toISOString().split('T')[0];
    return eventos.filter(evento => {
      const eventoDate = new Date(evento.fechaInicio).toISOString().split('T')[0];
      return eventoDate === dateStr;
    });
  };

  const days = getDaysInMonth();
  const weekDays = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];
  const monthNames = [
    'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
    'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
  ];

  return (
    <AppLayout>
      <div className="p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-theme-primary">Calendario</h1>
            <p className="text-theme-secondary">
              {eventos.length} eventos este mes
            </p>
          </div>
          
          <div className="flex items-center gap-3">
            <select
              value={tipoFilter}
              onChange={(e) => setTipoFilter(e.target.value as TipoEvento | 'all')}
              className="px-3 py-2 bg-theme-secondary border border-theme rounded-lg text-theme-primary focus:outline-none focus:border-amber-500"
            >
              <option value="all">Todos los tipos</option>
              {Object.entries(tipoEventoConfig).map(([key, config]) => (
                <option key={key} value={key}>{config.label}</option>
              ))}
            </select>
            
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => showToast('Función de creación en desarrollo', 'info')}
              className="flex items-center gap-2 px-4 py-2 bg-amber-500 text-white rounded-lg hover:bg-amber-600 transition-colors"
            >
              <Plus className="w-4 h-4" />
              Nuevo Evento
            </motion.button>
          </div>
        </div>

        {/* Navegación del mes */}
        <div className="flex items-center justify-between p-4 bg-theme-secondary rounded-xl">
          <button
            onClick={prevMonth}
            className="p-2 rounded-lg hover:bg-theme-hover transition-colors"
          >
            <ChevronLeft className="w-5 h-5 text-theme-primary" />
          </button>
          
          <h2 className="text-xl font-semibold text-theme-primary">
            {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
          </h2>
          
          <button
            onClick={nextMonth}
            className="p-2 rounded-lg hover:bg-theme-hover transition-colors"
          >
            <ChevronRight className="w-5 h-5 text-theme-primary" />
          </button>
        </div>

        {/* Error */}
        {error && (
          <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-xl flex items-center gap-3">
            <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0" />
            <p className="text-red-400">{error}</p>
            <button
              onClick={cargarEventos}
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

        {/* Calendario */}
        {!loading && !error && (
          <>
            {/* Días de la semana */}
            <div className="grid grid-cols-7 gap-2">
              {weekDays.map((day) => (
                <div 
                  key={day} 
                  className="text-center py-2 text-sm font-medium text-theme-secondary"
                >
                  {day}
                </div>
              ))}
            </div>

            {/* Días del mes */}
            <div className="grid grid-cols-7 gap-2">
              {days.map((day, index) => {
                if (!day) {
                  return <div key={`empty-${index}`} className="h-24" />;
                }

                const eventosDelDia = getEventosForDay(day);
                const isToday = day.toDateString() === new Date().toDateString();
                const isSelected = selectedDate?.toDateString() === day.toDateString();

                return (
                  <motion.div
                    key={day.toISOString()}
                    whileHover={{ scale: 1.02 }}
                    onClick={() => setSelectedDate(day)}
                    className={`h-24 p-2 bg-theme-secondary rounded-lg border cursor-pointer transition-colors ${
                      isSelected 
                        ? 'border-amber-500 bg-amber-500/10' 
                        : isToday
                        ? 'border-amber-500/50'
                        : 'border-theme hover:border-amber-500/30'
                    }`}
                  >
                    <div className={`text-sm font-medium mb-1 ${
                      isToday ? 'text-amber-500' : 'text-theme-primary'
                    }`}>
                      {day.getDate()}
                    </div>
                    
                    <div className="space-y-1">
                      {eventosDelDia.slice(0, 3).map((evento) => (
                        <div
                          key={evento.id}
                          className={`text-xs px-1.5 py-0.5 rounded text-white truncate ${
                            tipoEventoConfig[evento.tipo].color
                          }`}
                        >
                          {evento.titulo}
                        </div>
                      ))}
                      {eventosDelDia.length > 3 && (
                        <div className="text-xs text-theme-tertiary text-center">
                          +{eventosDelDia.length - 3} más
                        </div>
                      )}
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </>
        )}

        {/* Panel de eventos del día seleccionado */}
        {selectedDate && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-6 p-4 bg-theme-secondary rounded-xl"
          >
            <h3 className="text-lg font-semibold text-theme-primary mb-4">
              Eventos del {selectedDate.toLocaleDateString('es-ES', { 
                weekday: 'long', 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric' 
              })}
            </h3>
            
            {(() => {
              const eventosDelDia = getEventosForDay(selectedDate);
              
              if (eventosDelDia.length === 0) {
                return (
                  <div className="text-center py-8 text-theme-tertiary">
                    No hay eventos para este día
                  </div>
                );
              }

              return (
                <div className="space-y-3">
                  {eventosDelDia.map((evento) => (
                    <div 
                      key={evento.id} 
                      className="p-4 bg-theme rounded-xl flex items-start gap-3"
                    >
                      <div className={`w-3 h-3 rounded-full mt-1.5 ${tipoEventoConfig[evento.tipo].color}`} />
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <h4 className="font-medium text-theme-primary">{evento.titulo}</h4>
                          <span className="text-xs text-theme-tertiary">
                            {tipoEventoConfig[evento.tipo].label}
                          </span>
                        </div>
                        
                        {evento.descripcion && (
                          <p className="text-sm text-theme-secondary mt-1">{evento.descripcion}</p>
                        )}
                        
                        <div className="flex items-center gap-4 mt-2 text-sm text-theme-tertiary">
                          <span className="flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {new Date(evento.fechaInicio).toLocaleTimeString('es-ES', { 
                              hour: '2-digit', 
                              minute: '2-digit' 
                            })}
                          </span>
                          
                          {evento.expediente && (
                            <span>Exp: {evento.expediente.numeroExpediente}</span>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              );
            })()}
          </motion.div>
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
              : <CalendarIcon className="w-4 h-4" />}
            <span>{toast.message}</span>
          </motion.div>
        ))}
      </div>
    </AppLayout>
  );
}

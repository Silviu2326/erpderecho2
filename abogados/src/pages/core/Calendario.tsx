import { useState, useMemo, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Plus, ChevronLeft, ChevronRight, Clock, MapPin, Calendar, 
  AlertTriangle, CheckCircle2, Users, Briefcase, Gavel, 
  FileText, Building2, UserCircle, Filter, X, Save, Trash2,
  LayoutGrid, Columns, List
} from 'lucide-react';
import { AppLayout } from '@/components/layout/AppLayout';
import { eventosData, diasSemana, meses, getEventTypeColor, type EventoCalendario } from '@/data/calendarioData';
import { useRole } from '@/hooks/useRole';
import type { UserRole } from '@/types/roles';
import { 
  MiniCalendar, SearchFilters, 
  CalendarStats, AgendaView, type FilterState 
} from '@/components/calendario';

// ============================================
// DATOS SIMULADOS POR ROL
// ============================================

// Eventos específicos por rol (simulación)
const getEventosPorRol = (role: UserRole): EventoCalendario[] => {
  const baseEventos = [...eventosData];
  
  switch (role) {
    case 'super_admin':
    case 'socio':
      // Todos los eventos + eventos adicionales de gestión
      return [
        ...baseEventos,
        {
          id: 'ev-sa-1',
          title: 'Reunión de Socios',
          date: '2026-02-15',
          time: '09:00',
          type: 'reunion',
          caseTitle: 'Bufete - Administración',
          location: 'Sala de Juntas Principal',
          urgent: false,
          completed: false,
          duration: '2 horas'
        },
        {
          id: 'ev-sa-2',
          title: 'Revisión de Desempeño Trimestral',
          date: '2026-02-20',
          time: '14:00',
          type: 'reunion',
          caseTitle: 'RRHH - Evaluaciones',
          location: 'Oficina del Director',
          urgent: false,
          completed: false,
          duration: '3 horas'
        }
      ];
    
    case 'abogado_senior':
      // Eventos propios + supervisión
      return baseEventos.filter(e => 
        e.caseTitle.includes('López') || 
        e.caseTitle.includes('Martínez') ||
        e.caseTitle.includes('Corporación') ||
        e.type === 'reunion'
      );
    
    case 'abogado_junior':
      // Solo eventos asignados al junior
      return baseEventos.filter(e => 
        e.caseTitle.includes('Gómez') || 
        e.caseTitle.includes('López') ||
        e.caseTitle.includes('Industrias')
      );
    
    case 'paralegal':
      // Diligencias y trámites
      return baseEventos.filter(e => 
        e.type === 'plazo' || 
        e.type === 'vista' ||
        e.title.includes('diligencia') ||
        e.title.includes('trámite')
      );
    
    case 'secretario':
    case 'recepcionista':
      // Citas programadas y disponibilidad
      return baseEventos.filter(e => 
        e.type === 'reunion' || 
        e.title.includes('cita') ||
        e.title.includes('audiencia')
      );
    
    case 'administrador':
      // Eventos administrativos
      return [
        ...baseEventos.filter(e => e.type === 'reunion'),
        {
          id: 'ev-adm-1',
          title: 'Vencimiento Contrato Proveedor',
          date: '2026-02-28',
          time: '00:00',
          type: 'plazo',
          caseTitle: 'Administración - Proveedores',
          location: 'Sistema',
          urgent: true,
          completed: false
        },
        {
          id: 'ev-adm-2',
          title: 'Reunión de Personal',
          date: '2026-02-14',
          time: '10:00',
          type: 'reunion',
          caseTitle: 'Administración - RRHH',
          location: 'Sala de Capacitación',
          urgent: false,
          completed: false
        }
      ];
    
    case 'contador':
      // Sin acceso al calendario según PAGINAS_POR_ROL.md
      return [];
    
    default:
      return baseEventos;
  }
};

// Configuración de vistas por rol
const getConfigPorRol = (role: UserRole) => {
  const configs: Record<UserRole, {
    title: string;
    subtitle: string;
    puedeCrear: boolean;
    puedeEditarTodos: boolean;
    puedeVerTodos: boolean;
    vistaDefault: 'month' | 'week' | 'day';
    mostrarFiltros: boolean;
    mostrarLeyendaCompleta: boolean;
    mensajeBienvenida: string;
  }> = {
    super_admin: {
      title: 'Calendario del Bufete',
      subtitle: 'Vista completa de todos los eventos',
      puedeCrear: true,
      puedeEditarTodos: true,
      puedeVerTodos: true,
      vistaDefault: 'month',
      mostrarFiltros: true,
      mostrarLeyendaCompleta: true,
      mensajeBienvenida: 'Calendario completo del bufete'
    },
    socio: {
      title: 'Calendario General',
      subtitle: 'Agenda completa del bufete',
      puedeCrear: true,
      puedeEditarTodos: true,
      puedeVerTodos: true,
      vistaDefault: 'month',
      mostrarFiltros: true,
      mostrarLeyendaCompleta: true,
      mensajeBienvenida: 'Vista general de todas las actividades'
    },
    abogado_senior: {
      title: 'Mi Calendario',
      subtitle: 'Tus audiencias, citas y reuniones',
      puedeCrear: true,
      puedeEditarTodos: false,
      puedeVerTodos: false,
      vistaDefault: 'week',
      mostrarFiltros: true,
      mostrarLeyendaCompleta: true,
      mensajeBienvenida: 'Gestiona tu agenda y supervisa tus casos'
    },
    abogado_junior: {
      title: 'Mi Calendario',
      subtitle: 'Tus audiencias y citas asignadas',
      puedeCrear: true,
      puedeEditarTodos: false,
      puedeVerTodos: false,
      vistaDefault: 'week',
      mostrarFiltros: false,
      mostrarLeyendaCompleta: true,
      mensajeBienvenida: 'Revisa tus actividades programadas'
    },
    paralegal: {
      title: 'Calendario de Diligencias',
      subtitle: 'Trámites y diligencias programadas',
      puedeCrear: false,
      puedeEditarTodos: false,
      puedeVerTodos: false,
      vistaDefault: 'week',
      mostrarFiltros: false,
      mostrarLeyendaCompleta: false,
      mensajeBienvenida: 'Tus diligencias y trámites asignados'
    },
    secretario: {
      title: 'Agenda General',
      subtitle: 'Calendario para programación de citas',
      puedeCrear: true,
      puedeEditarTodos: false,
      puedeVerTodos: true,
      vistaDefault: 'week',
      mostrarFiltros: true,
      mostrarLeyendaCompleta: false,
      mensajeBienvenida: 'Verifica disponibilidad para agendar'
    },
    recepcionista: {
      title: 'Agenda de Citas',
      subtitle: 'Calendario de disponibilidad',
      puedeCrear: false,
      puedeEditarTodos: false,
      puedeVerTodos: true,
      vistaDefault: 'week',
      mostrarFiltros: false,
      mostrarLeyendaCompleta: false,
      mensajeBienvenida: 'Consulta disponibilidad para citas'
    },
    administrador: {
      title: 'Calendario Administrativo',
      subtitle: 'Eventos y reuniones del bufete',
      puedeCrear: true,
      puedeEditarTodos: false,
      puedeVerTodos: false,
      vistaDefault: 'month',
      mostrarFiltros: true,
      mostrarLeyendaCompleta: false,
      mensajeBienvenida: 'Gestión de eventos administrativos'
    },
    contador: {
      title: 'Sin Acceso',
      subtitle: 'No tienes permisos para ver el calendario',
      puedeCrear: false,
      puedeEditarTodos: false,
      puedeVerTodos: false,
      vistaDefault: 'month',
      mostrarFiltros: false,
      mostrarLeyendaCompleta: false,
      mensajeBienvenida: 'Contacta al administrador si necesitas acceso'
    }
  };
  
  return configs[role] || configs.abogado_junior;
};

// Componente para acceso denegado
const AccesoDenegado = () => (
  <div className="flex flex-col items-center justify-center min-h-[60vh] p-8">
    <div className="w-24 h-24 bg-theme-tertiary rounded-full flex items-center justify-center mb-6">
      <Calendar className="w-12 h-12 text-theme-muted" />
    </div>
    <h2 className="text-2xl font-bold text-theme-primary mb-2">Acceso Restringido</h2>
    <p className="text-theme-secondary text-center max-w-md">
      Tu rol no tiene permisos para acceder al calendario. 
      Si necesitas ver información de eventos, contacta a tu supervisor.
    </p>
  </div>
);

// Componente de filtros por abogado (solo para roles con acceso completo)
const FiltrosAbogados = ({ 
  selectedAbogado, 
  onSelectAbogado 
}: { 
  selectedAbogado: string; 
  onSelectAbogado: (id: string) => void;
}) => {
  const abogados = [
    { id: 'all', name: 'Todos', icon: Users },
    { id: 'carlos', name: 'Dr. Carlos Ramírez', icon: Gavel },
    { id: 'ana', name: 'Dra. Ana López', icon: Briefcase },
    { id: 'maria', name: 'Dra. María Gómez', icon: UserCircle },
    { id: 'juan', name: 'Dr. Juan Martínez', icon: FileText },
  ];

  return (
    <div className="flex items-center gap-2 overflow-x-auto pb-2">
      <Filter className="w-4 h-4 text-theme-tertiary flex-shrink-0" />
      {abogados.map((abogado) => (
        <button
          key={abogado.id}
          onClick={() => onSelectAbogado(abogado.id)}
          className={`flex items-center gap-2 px-3 py-1.5 text-sm font-medium rounded-lg whitespace-nowrap transition-colors ${
            selectedAbogado === abogado.id
              ? 'bg-amber-500 text-slate-950'
              : 'bg-theme-tertiary text-theme-secondary hover:bg-theme-hover'
          }`}
        >
          <abogado.icon className="w-3.5 h-3.5" />
          {abogado.name}
        </button>
      ))}
    </div>
  );
};

// ============================================
// MODAL DE EVENTO
// ============================================

interface EventoModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (evento: Partial<EventoCalendario>) => void;
  onDelete?: (id: string) => void;
  evento: EventoCalendario | null;
  selectedDate: Date | null;
  config: ReturnType<typeof getConfigPorRol>;
}

const EventoModal = ({ isOpen, onClose, onSave, onDelete, evento, selectedDate, config }: EventoModalProps) => {
  const [formData, setFormData] = useState<Partial<EventoCalendario>>({
    title: '',
    date: selectedDate ? selectedDate.toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
    time: '09:00',
    type: 'reunion',
    caseTitle: '',
    location: '',
    urgent: false,
    completed: false,
    duration: '1 hora'
  });

  // Cargar datos del evento si estamos editando
  useState(() => {
    if (evento) {
      setFormData(evento);
    }
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
    onClose();
  };

  const tiposEvento = [
    { id: 'vista', label: 'Vista/Audiencia', color: 'bg-blue-500' },
    { id: 'plazo', label: 'Plazo', color: 'bg-red-500' },
    { id: 'reunion', label: 'Reunión', color: 'bg-purple-500' },
    { id: 'entrega', label: 'Entrega', color: 'bg-emerald-500' },
  ];

  const puedeEliminar = config.puedeEditarTodos || (config.puedeCrear && evento && !config.puedeVerTodos);

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="fixed inset-0 m-auto w-full max-w-lg h-fit max-h-[90vh] overflow-y-auto bg-theme-card border border-theme rounded-2xl shadow-2xl z-50 p-6"
          >
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-theme-primary">
                {evento ? 'Editar Evento' : 'Nuevo Evento'}
              </h2>
              <button onClick={onClose} className="p-2 text-theme-tertiary hover:text-theme-primary hover:bg-theme-tertiary rounded-lg">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-theme-secondary mb-2">Título</label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full px-4 py-2 bg-theme-tertiary border border-theme rounded-lg text-theme-primary focus:outline-none focus:border-amber-500"
                  placeholder="Ej: Audiencia de juicio"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-theme-secondary mb-2">Fecha</label>
                  <input
                    type="date"
                    value={formData.date}
                    onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                    className="w-full px-4 py-2 bg-theme-tertiary border border-theme rounded-lg text-theme-primary focus:outline-none focus:border-amber-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-theme-secondary mb-2">Hora</label>
                  <input
                    type="time"
                    value={formData.time}
                    onChange={(e) => setFormData({ ...formData, time: e.target.value })}
                    className="w-full px-4 py-2 bg-theme-tertiary border border-theme rounded-lg text-theme-primary focus:outline-none focus:border-amber-500"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-theme-secondary mb-2">Tipo de evento</label>
                <div className="grid grid-cols-2 gap-2">
                  {tiposEvento.map((tipo) => (
                    <button
                      key={tipo.id}
                      type="button"
                      onClick={() => setFormData({ ...formData, type: tipo.id as EventoCalendario['type'] })}
                      className={`flex items-center gap-2 px-3 py-2 rounded-lg border transition-colors ${
                        formData.type === tipo.id
                          ? 'bg-amber-500/20 border-amber-500 text-amber-400'
                          : 'bg-theme-tertiary border-theme text-theme-secondary hover:bg-theme-hover'
                      }`}
                    >
                      <div className={`w-2 h-2 rounded-full ${tipo.color}`} />
                      {tipo.label}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-theme-secondary mb-2">Expediente/Caso</label>
                <input
                  type="text"
                  value={formData.caseTitle}
                  onChange={(e) => setFormData({ ...formData, caseTitle: e.target.value })}
                  className="w-full px-4 py-2 bg-theme-tertiary border border-theme rounded-lg text-theme-primary focus:outline-none focus:border-amber-500"
                  placeholder="Ej: EXP-2024-001"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-theme-secondary mb-2">Ubicación</label>
                <input
                  type="text"
                  value={formData.location}
                  onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                  className="w-full px-4 py-2 bg-theme-tertiary border border-theme rounded-lg text-theme-primary focus:outline-none focus:border-amber-500"
                  placeholder="Ej: Juzgado Civil 1"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-theme-secondary mb-2">Duración</label>
                <select
                  value={formData.duration}
                  onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
                  className="w-full px-4 py-2 bg-theme-tertiary border border-theme rounded-lg text-theme-primary focus:outline-none focus:border-amber-500"
                >
                  <option value="30 minutos">30 minutos</option>
                  <option value="1 hora">1 hora</option>
                  <option value="2 horas">2 horas</option>
                  <option value="3 horas">3 horas</option>
                  <option value="Todo el día">Todo el día</option>
                </select>
              </div>

              <div className="flex items-center gap-4">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.urgent}
                    onChange={(e) => setFormData({ ...formData, urgent: e.target.checked })}
                    className="w-4 h-4 rounded border-theme bg-theme-tertiary text-amber-500"
                  />
                  <span className="text-sm text-theme-secondary">Marcar como urgente</span>
                </label>
              </div>

              <div className="flex gap-3 pt-4">
                {evento && puedeEliminar && (
                  <button
                    type="button"
                    onClick={() => onDelete && onDelete(evento.id)}
                    className="flex items-center gap-2 px-4 py-2 bg-red-500/10 text-red-500 rounded-lg hover:bg-red-500/20 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                    Eliminar
                  </button>
                )}
                <div className="flex-1" />
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 text-theme-secondary hover:text-theme-primary hover:bg-theme-tertiary rounded-lg transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="flex items-center gap-2 px-4 py-2 bg-amber-500 text-slate-950 font-medium rounded-lg hover:bg-amber-400 transition-colors"
                >
                  <Save className="w-4 h-4" />
                  Guardar
                </button>
              </div>
            </form>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

// ============================================
// COMPONENTE PRINCIPAL
// ============================================

export default function Calendario() {
  const { role, roleConfig } = useRole();
  const [currentDate, setCurrentDate] = useState(new Date(2026, 1, 11));
  const [selectedDate, setSelectedDate] = useState<Date | null>(new Date(2026, 1, 11));
  const [viewMode, setViewMode] = useState<'month' | 'week' | 'day' | 'agenda'>('month');
  const [selectedAbogado, setSelectedAbogado] = useState('all');
  
  // Estados para búsqueda y filtros
  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState<FilterState>({
    types: [],
    urgent: null,
    dateRange: null,
  });
  
  // Estados para el modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingEvent, setEditingEvent] = useState<EventoCalendario | null>(null);
  const [eventos, setEventos] = useState<EventoCalendario[]>(eventosData);

  // Obtener configuración según el rol
  const config = useMemo(() => getConfigPorRol(role), [role]);
  
  // Obtener eventos según el rol
  const eventosDelRol = useMemo(() => getEventosPorRol(role), [role]);
  
  // Combinar eventos base con los creados por el usuario
  const allEventos = useMemo(() => {
    return [...eventosDelRol, ...eventos.filter(e => !eventosDelRol.find(ed => ed.id === e.id))];
  }, [eventosDelRol, eventos]);
  
  // Filtrar eventos por abogado seleccionado, búsqueda y filtros
  const eventosFiltrados = useMemo(() => {
    let baseEventos = allEventos;
    
    // Filtrar por abogado
    if (selectedAbogado !== 'all' && config.puedeVerTodos) {
      baseEventos = baseEventos.filter(e => {
        if (selectedAbogado === 'carlos') return e.caseTitle.includes('Industrias') || e.caseTitle.includes('Corporación');
        if (selectedAbogado === 'ana') return e.caseTitle.includes('López') || e.caseTitle.includes('Martínez');
        if (selectedAbogado === 'maria') return e.caseTitle.includes('Gómez') || e.caseTitle.includes('López');
        if (selectedAbogado === 'juan') return e.caseTitle.includes('Martínez') || e.caseTitle.includes('Tech');
        return true;
      });
    }
    
    // Filtrar por búsqueda
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      baseEventos = baseEventos.filter(e => 
        e.title.toLowerCase().includes(query) ||
        e.caseTitle?.toLowerCase().includes(query) ||
        e.location?.toLowerCase().includes(query)
      );
    }
    
    // Filtrar por tipo
    if (filters.types.length > 0) {
      baseEventos = baseEventos.filter(e => filters.types.includes(e.type));
    }
    
    // Filtrar por urgencia
    if (filters.urgent === true) {
      baseEventos = baseEventos.filter(e => e.urgent && !e.completed);
    }
    
    return baseEventos;
  }, [allEventos, selectedAbogado, config.puedeVerTodos, searchQuery, filters]);
  
  // Contar eventos por fecha para el mini calendario
  const eventsCountByDate = useMemo(() => {
    const count: Record<string, number> = {};
    eventosFiltrados.forEach(e => {
      count[e.date] = (count[e.date] || 0) + 1;
    });
    return count;
  }, [eventosFiltrados]);
  
  // Funciones de navegación del mini calendario
  const handleMiniCalendarNavigate = (direction: 'prev' | 'next') => {
    const newDate = new Date(currentDate);
    if (direction === 'prev') {
      newDate.setMonth(currentDate.getMonth() - 1);
    } else {
      newDate.setMonth(currentDate.getMonth() + 1);
    }
    setCurrentDate(newDate);
  };
  const handleCreateEvent = () => {
    setEditingEvent(null);
    setIsModalOpen(true);
  };
  
  const handleEditEvent = (evento: EventoCalendario) => {
    if (!config.puedeEditarTodos && !config.puedeCrear) return;
    setEditingEvent(evento);
    setIsModalOpen(true);
  };
  
  const handleSaveEvent = (eventoData: Partial<EventoCalendario>) => {
    if (editingEvent) {
      // Editar evento existente
      setEventos(prev => prev.map(e => 
        e.id === editingEvent.id ? { ...e, ...eventoData } as EventoCalendario : e
      ));
    } else {
      // Crear nuevo evento
      const newEvent: EventoCalendario = {
        id: `ev-${Date.now()}`,
        title: eventoData.title || 'Nuevo Evento',
        date: eventoData.date || new Date().toISOString().split('T')[0],
        time: eventoData.time || '09:00',
        type: eventoData.type || 'reunion',
        caseTitle: eventoData.caseTitle || '',
        location: eventoData.location || '',
        urgent: eventoData.urgent || false,
        completed: false,
        duration: eventoData.duration || '1 hora'
      };
      setEventos(prev => [...prev, newEvent]);
    }
  };
  
  const handleDeleteEvent = (id: string) => {
    setEventos(prev => prev.filter(e => e.id !== id));
    setIsModalOpen(false);
    setEditingEvent(null);
  };

  // Si es contador, mostrar acceso denegado
  if (role === 'contador') {
    return (
      <AppLayout title={config.title} subtitle={config.subtitle}>
        <AccesoDenegado />
      </AppLayout>
    );
  }

  // ============================================
  // FUNCIONES DE NAVEGACIÓN Y UTILIDADES
  // ============================================
  
  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDay = firstDay.getDay() === 0 ? 6 : firstDay.getDay() - 1;
    
    const days: { date: number; currentMonth: boolean; fullDate: Date }[] = [];
    
    const prevMonthLastDay = new Date(year, month, 0).getDate();
    for (let i = startingDay - 1; i >= 0; i--) {
      days.push({
        date: prevMonthLastDay - i,
        currentMonth: false,
        fullDate: new Date(year, month - 1, prevMonthLastDay - i)
      });
    }
    
    for (let i = 1; i <= daysInMonth; i++) {
      days.push({
        date: i,
        currentMonth: true,
        fullDate: new Date(year, month, i)
      });
    }
    
    const remaining = 42 - days.length;
    for (let i = 1; i <= remaining; i++) {
      days.push({
        date: i,
        currentMonth: false,
        fullDate: new Date(year, month + 1, i)
      });
    }
    
    return days;
  };

  // Obtener días de la semana actual
  const getWeekDays = (date: Date) => {
    const days: Date[] = [];
    const day = date.getDay();
    const diff = date.getDate() - day + (day === 0 ? -6 : 1);
    const monday = new Date(date);
    monday.setDate(diff);
    
    for (let i = 0; i < 7; i++) {
      const weekDay = new Date(monday);
      weekDay.setDate(monday.getDate() + i);
      days.push(weekDay);
    }
    
    return days;
  };

  // Horas del día para la vista diaria y semanal
  const hoursOfDay = Array.from({ length: 14 }, (_, i) => i + 7); // 7:00 - 20:00

  const calendarDays = getDaysInMonth(currentDate);
  const weekDays = getWeekDays(currentDate);

  const getEventsForDate = (date: Date) => {
    const dateStr = date.toISOString().split('T')[0];
    return eventosFiltrados.filter(e => e.date === dateStr);
  };

  const getEventsForDateAndHour = (date: Date, hour: number) => {
    const dateStr = date.toISOString().split('T')[0];
    return eventosFiltrados.filter(e => {
      if (e.date !== dateStr) return false;
      const eventHour = parseInt(e.time.split(':')[0]);
      return eventHour === hour;
    });
  };

  const selectedDateEvents = selectedDate ? getEventsForDate(selectedDate) : [];

  // Navegación según la vista actual
  const navigatePrev = useCallback(() => {
    if (viewMode === 'month') {
      setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
    } else if (viewMode === 'week') {
      const prevWeek = new Date(currentDate);
      prevWeek.setDate(currentDate.getDate() - 7);
      setCurrentDate(prevWeek);
    } else {
      const prevDay = new Date(currentDate);
      prevDay.setDate(currentDate.getDate() - 1);
      setCurrentDate(prevDay);
    }
  }, [viewMode, currentDate]);

  const navigateNext = useCallback(() => {
    if (viewMode === 'month') {
      setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
    } else if (viewMode === 'week') {
      const nextWeek = new Date(currentDate);
      nextWeek.setDate(currentDate.getDate() + 7);
      setCurrentDate(nextWeek);
    } else {
      const nextDay = new Date(currentDate);
      nextDay.setDate(currentDate.getDate() + 1);
      setCurrentDate(nextDay);
    }
  }, [viewMode, currentDate]);

  const goToToday = () => {
    const today = new Date(2026, 1, 11);
    setCurrentDate(today);
    setSelectedDate(today);
  };

  const isToday = (date: Date) => {
    const today = new Date(2026, 1, 11);
    return date.toDateString() === today.toDateString();
  };

  const isSelected = (date: Date) => {
    return selectedDate?.toDateString() === date.toDateString();
  };

  // Obtener título del período actual
  const getPeriodTitle = () => {
    if (viewMode === 'month') {
      return `${meses[currentDate.getMonth()]} ${currentDate.getFullYear()}`;
    } else if (viewMode === 'week') {
      const startOfWeek = weekDays[0];
      const endOfWeek = weekDays[6];
      if (startOfWeek.getMonth() === endOfWeek.getMonth()) {
        return `${startOfWeek.getDate()} - ${endOfWeek.getDate()} de ${meses[startOfWeek.getMonth()]} ${startOfWeek.getFullYear()}`;
      } else {
        return `${startOfWeek.getDate()} ${meses[startOfWeek.getMonth()]} - ${endOfWeek.getDate()} ${meses[endOfWeek.getMonth()]}`;
      }
    } else {
      return currentDate.toLocaleDateString('es-ES', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
    }
  };

  // ============================================
  // COMPONENTES DE VISTAS
  // ============================================

  // Vista Mensual mejorada
  const MonthView = () => (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="bg-theme-card/60 border border-theme rounded-2xl overflow-hidden shadow-lg"
    >
      <div className="grid grid-cols-7 bg-theme-card border-b border-theme">
        {diasSemana.map((day) => (
          <div key={day} className="py-4 text-center text-sm font-semibold text-theme-secondary uppercase tracking-wider">
            {day.substring(0, 3)}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-7">
        {calendarDays.map((day, index) => {
          const dayEvents = getEventsForDate(day.fullDate);
          return (
            <button
              key={index}
              onClick={() => {
                setSelectedDate(day.fullDate);
                if (!day.currentMonth) {
                  setCurrentDate(day.fullDate);
                }
              }}
              className={`
                min-h-[120px] p-2 border-b border-r border-theme/30 text-left transition-all hover:shadow-md
                ${!day.currentMonth ? 'bg-theme-card/20' : 'hover:bg-theme-tertiary/20'}
                ${isSelected(day.fullDate) ? 'bg-amber-500/10 border-amber-500/50 shadow-inner' : ''}
              `}
            >
              <div className="flex items-center justify-between mb-2">
                <span className={`
                  text-sm font-bold w-8 h-8 flex items-center justify-center rounded-full transition-all
                  ${isToday(day.fullDate) 
                    ? 'bg-gradient-to-br from-amber-400 to-amber-500 text-slate-950 shadow-lg' 
                    : day.currentMonth 
                      ? 'text-theme-primary' 
                      : 'text-theme-muted/50'
                  }
                  ${isSelected(day.fullDate) && !isToday(day.fullDate) ? 'bg-amber-500/20 text-amber-400' : ''}
                `}>
                  {day.date}
                </span>
                {dayEvents.length > 0 && (
                  <span className={`
                    text-xs font-medium px-2 py-0.5 rounded-full
                    ${isSelected(day.fullDate) ? 'bg-amber-500 text-slate-950' : 'bg-theme-tertiary text-theme-muted'}
                  `}>
                    {dayEvents.length}
                  </span>
                )}
              </div>
              <div className="space-y-1.5">
                {dayEvents.slice(0, 3).map((event) => (
                  <motion.div
                    key={event.id}
                    whileHover={{ scale: 1.02 }}
                    onClick={(e) => {
                      e.stopPropagation();
                      handleEditEvent(event);
                    }}
                    className={`
                      px-2 py-1.5 rounded-lg text-[11px] truncate cursor-pointer transition-all
                      ${event.urgent 
                        ? 'bg-red-500/30 text-red-300 border border-red-500/30' 
                        : `${getEventTypeColor(event.type)} text-white`
                      }
                      ${event.completed ? 'opacity-40 line-through' : 'hover:shadow-md'}
                    `}
                  >
                    <div className="flex items-center gap-1">
                      <span className="font-bold opacity-80">{event.time}</span>
                      <span className="truncate font-medium">{event.title}</span>
                    </div>
                  </motion.div>
                ))}
                {dayEvents.length > 3 && (
                  <div className="px-2 py-1 text-[10px] text-theme-muted font-medium hover:text-amber-400 cursor-pointer">
                    +{dayEvents.length - 3} más eventos
                  </div>
                )}
              </div>
            </button>
          );
        })}
      </div>
    </motion.div>
  );

  // Vista Semanal mejorada
  const WeekView = () => {
    const currentHour = new Date(2026, 1, 11).getHours();
    const showCurrentTime = weekDays.some(day => isToday(day));
    
    return (
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="bg-theme-card/60 border border-theme rounded-2xl overflow-hidden shadow-lg"
      >
        {/* Header con días de la semana */}
        <div className="grid grid-cols-8 bg-theme-card border-b border-theme sticky top-0 z-10">
          <div className="py-4 px-2 text-center text-sm font-semibold text-theme-muted border-r border-theme">
            Hora
          </div>
          {weekDays.map((day, index) => (
            <button
              key={index}
              onClick={() => setSelectedDate(day)}
              className={`
                py-4 px-2 text-center border-r border-theme last:border-r-0 transition-all
                ${isSelected(day) ? 'bg-amber-500/10' : 'hover:bg-theme-tertiary/30'}
              `}
            >
              <div className="text-xs font-medium text-theme-muted uppercase">
                {diasSemana[index].substring(0, 3)}
              </div>
              <div className={`
                text-xl font-bold mt-1.5 w-10 h-10 mx-auto flex items-center justify-center rounded-full transition-all
                ${isToday(day) 
                  ? 'bg-gradient-to-br from-amber-400 to-amber-500 text-slate-950 shadow-lg' 
                  : 'text-theme-primary'
              }`}>
                {day.getDate()}
              </div>
            </button>
          ))}
        </div>

        {/* Grid de horas */}
        <div className="max-h-[600px] overflow-y-auto relative">
          {showCurrentTime && (
            <div 
              className="absolute left-[12.5%] right-0 border-t-2 border-red-500 z-20 pointer-events-none"
              style={{ top: `${((currentHour - 7) / 14) * 100}%` }}
            >
              <div className="w-3 h-3 bg-red-500 rounded-full -ml-1.5 -mt-1.5" />
            </div>
          )}
          {hoursOfDay.map((hour) => (
            <div key={hour} className="grid grid-cols-8 border-b border-theme/30">
              <div className="py-4 px-2 text-center text-sm font-medium text-theme-muted border-r border-theme bg-theme-card/50">
                {hour.toString().padStart(2, '0')}:00
              </div>
              {weekDays.map((day, dayIndex) => {
                const hourEvents = getEventsForDateAndHour(day, hour);
                const isCurrentHour = isToday(day) && hour === currentHour;
                
                return (
                  <div
                    key={dayIndex}
                    onClick={() => {
                      setSelectedDate(day);
                      if (hourEvents.length === 0 && config.puedeCrear) {
                        handleCreateEvent();
                      }
                    }}
                    className={`
                      min-h-[70px] p-1.5 border-r border-theme/30 last:border-r-0 cursor-pointer transition-all hover:bg-theme-tertiary/20
                      ${isSelected(day) ? 'bg-amber-500/5' : ''}
                      ${isCurrentHour ? 'bg-red-500/5' : ''}
                    `}
                  >
                    {hourEvents.map((event) => (
                      <motion.div
                        key={event.id}
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        whileHover={{ scale: 1.02 }}
                        onClick={(e) => {
                          e.stopPropagation();
                          handleEditEvent(event);
                        }}
                        className={`
                          px-2.5 py-2 rounded-lg text-xs cursor-pointer transition-all mb-1
                          ${event.urgent 
                            ? 'bg-red-500/30 text-red-300 border border-red-500/30' 
                            : `${getEventTypeColor(event.type)} text-white`
                          }
                          ${event.completed ? 'opacity-50' : 'hover:shadow-lg'}
                        `}
                      >
                        <div className="font-semibold truncate">{event.title}</div>
                        <div className="text-[10px] opacity-80 flex items-center gap-1">
                          <Clock className="w-2.5 h-2.5" />
                          {event.time}
                        </div>
                      </motion.div>
                    ))}
                  </div>
                );
              })}
            </div>
          ))}
        </div>
      </motion.div>
    );
  };

  // Vista Diaria mejorada
  const DayView = () => {
    const dayEvents = getEventsForDate(currentDate);
    const currentHour = new Date(2026, 1, 11).getHours();
    const isCurrentDay = isToday(currentDate);
    
    return (
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="bg-theme-card/60 border border-theme rounded-2xl overflow-hidden shadow-lg"
      >
        {/* Header con navegación del día */}
        <div className="flex items-center justify-between p-6 border-b border-theme bg-theme-card">
          <button
            onClick={() => {
              const prevDay = new Date(currentDate);
              prevDay.setDate(currentDate.getDate() - 1);
              setCurrentDate(prevDay);
              setSelectedDate(prevDay);
            }}
            className="p-2.5 text-theme-tertiary hover:text-theme-primary hover:bg-theme-tertiary rounded-lg transition-all hover:scale-105"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <div className="text-center">
            <div className="text-xl font-bold text-theme-primary capitalize">
              {currentDate.toLocaleDateString('es-ES', { weekday: 'long', day: 'numeric', month: 'long' })}
            </div>
            <div className="text-sm text-theme-muted mt-1">
              {dayEvents.length} evento{dayEvents.length !== 1 ? 's' : ''} programado{dayEvents.length !== 1 ? 's' : ''}
            </div>
          </div>
          <button
            onClick={() => {
              const nextDay = new Date(currentDate);
              nextDay.setDate(currentDate.getDate() + 1);
              setCurrentDate(nextDay);
              setSelectedDate(nextDay);
            }}
            className="p-2.5 text-theme-tertiary hover:text-theme-primary hover:bg-theme-tertiary rounded-lg transition-all hover:scale-105"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>

        {/* Grid de horas del día */}
        <div className="max-h-[600px] overflow-y-auto relative">
          {isCurrentDay && (
            <div 
              className="absolute left-20 right-0 border-t-2 border-red-500 z-20 pointer-events-none"
              style={{ top: `${((currentHour - 7) / 14) * 100}%` }}
            >
              <div className="w-3 h-3 bg-red-500 rounded-full -ml-1.5 -mt-1.5" />
            </div>
          )}
          {hoursOfDay.map((hour) => {
            const hourEvents = getEventsForDateAndHour(currentDate, hour);
            const isCurrentHour = isCurrentDay && hour === currentHour;
            
            return (
              <motion.div
                key={hour}
                className={`
                  flex border-b border-theme/30 hover:bg-theme-tertiary/10 cursor-pointer transition-colors
                  ${isCurrentHour ? 'bg-red-500/5' : ''}
                `}
                onClick={() => {
                  if (hourEvents.length === 0 && config.puedeCrear) {
                    handleCreateEvent();
                  }
                }}
              >
                <div className="w-24 py-5 px-4 text-center font-medium text-theme-muted border-r border-theme bg-theme-card/50 flex-shrink-0">
                  {hour.toString().padStart(2, '0')}:00
                </div>
                <div className="flex-1 p-3 min-h-[80px]">
                  {hourEvents.map((event) => (
                    <motion.div
                      key={event.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      whileHover={{ scale: 1.01 }}
                      onClick={(e) => {
                        e.stopPropagation();
                        handleEditEvent(event);
                      }}
                      className={`
                        p-4 rounded-xl cursor-pointer transition-all mb-3
                        ${event.urgent 
                          ? 'bg-red-500/20 border border-red-500/40 hover:border-red-500/60' 
                          : event.completed
                            ? 'bg-theme-tertiary/30 border border-theme opacity-60'
                            : `${getEventTypeColor(event.type)}/30 border ${getEventTypeColor(event.type)}/50 hover:border-amber-500/50`
                        }
                      `}
                    >
                      <div className="flex items-start gap-3">
                        <div className={`w-3 h-3 rounded-full mt-1.5 flex-shrink-0 ${getEventTypeColor(event.type)}`} />
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <p className={`font-bold text-theme-primary truncate ${event.completed ? 'line-through text-theme-muted' : ''}`}>
                              {event.title}
                            </p>
                            {event.urgent && (
                              <span className="px-2 py-0.5 bg-red-500/30 text-red-400 text-[10px] font-bold rounded uppercase">
                                Urgente
                              </span>
                            )}
                          </div>
                          <p className="text-sm text-theme-muted mt-1">{event.caseTitle}</p>
                          <div className="flex items-center gap-4 mt-2 text-xs text-theme-tertiary">
                            <span className="flex items-center gap-1">
                              <Clock className="w-3 h-3" />
                              {event.time}{event.duration && ` (${event.duration})`}
                            </span>
                            <span className="flex items-center gap-1">
                              <MapPin className="w-3 h-3" />
                              {event.location}
                            </span>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            );
          })}
        </div>
      </motion.div>
    );
  };

  // Renderizar la vista actual
  const renderCurrentView = () => {
    switch (viewMode) {
      case 'week':
        return <WeekView />;
      case 'day':
        return <DayView />;
      case 'agenda':
        return (
          <AgendaView 
            events={eventosFiltrados}
            selectedDate={selectedDate || new Date()}
            onSelectDate={(date) => {
              setSelectedDate(date);
              setCurrentDate(date);
            }}
            onEditEvent={handleEditEvent}
          />
        );
      default:
        return <MonthView />;
    }
  };

  const headerActions = config.puedeCrear ? (
    <button 
      onClick={handleCreateEvent}
      className="hidden sm:flex items-center gap-2 px-4 py-2 bg-amber-500 text-slate-950 font-medium rounded-xl hover:bg-amber-400 transition-colors"
    >
      <Plus className="w-4 h-4" />
      <span className="hidden lg:inline">
        {role === 'secretario' || role === 'recepcionista' ? 'Nueva Cita' : 'Nuevo Evento'}
      </span>
    </button>
  ) : null;

  return (
    <AppLayout 
      title={config.title}
      subtitle={config.subtitle}
      headerActions={headerActions}
    >
      {/* Mensaje de bienvenida según rol */}
      <div className={`mx-6 lg:mx-8 mb-4 p-4 rounded-xl border ${roleConfig.bgColor} ${roleConfig.textColor.replace('text-', 'border-').replace('400', '500/20')}`}>
        <div className="flex items-center gap-3">
          <div className={`p-2 rounded-lg bg-theme-card/50`}>
            <Calendar className={`w-5 h-5 ${roleConfig.textColor}`} />
          </div>
          <div>
            <p className={`font-medium ${roleConfig.textColor}`}>{config.mensajeBienvenida}</p>
            <p className="text-sm text-theme-tertiary">
              {role === 'super_admin' && 'Tienes acceso completo a todas las agendas'}
              {role === 'socio' && 'Puedes ver y gestionar todos los eventos del bufete'}
              {role === 'abogado_senior' && 'Visualiza tu agenda y la de los casos bajo tu supervisión'}
              {role === 'abogado_junior' && 'Consulta tus audiencias y actividades asignadas'}
              {role === 'paralegal' && 'Revisa las diligencias y trámites de tus casos'}
              {role === 'secretario' && 'Gestiona la agenda y disponibilidad del bufete'}
              {role === 'recepcionista' && 'Consulta disponibilidad para programar citas'}
              {role === 'administrador' && 'Gestiona eventos administrativos y reuniones'}
            </p>
          </div>
        </div>
      </div>

      {/* Filtros por abogado (solo para roles con acceso completo) */}
      {config.mostrarFiltros && config.puedeVerTodos && (
        <div className="mx-6 lg:mx-8 mb-4">
          <FiltrosAbogados 
            selectedAbogado={selectedAbogado} 
            onSelectAbogado={setSelectedAbogado} 
          />
        </div>
      )}

      {/* Widget de estadísticas */}
      <div className="mx-6 lg:mx-8 mb-4">
        <CalendarStats events={eventosFiltrados} />
      </div>

      {/* Buscador y filtros */}
      <div className="mx-6 lg:mx-8 mb-4">
        <SearchFilters
          searchQuery={searchQuery}
          onSearch={setSearchQuery}
          filters={filters}
          onFilterChange={setFilters}
        />
      </div>

      <main className="flex-1 overflow-y-auto p-6 lg:p-8">
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
          {/* Calendar */}
          <div className="xl:col-span-2 space-y-6">
            {/* Calendar Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <h2 className="text-2xl font-bold text-theme-primary capitalize">
                  {getPeriodTitle()}
                </h2>
                <div className="flex items-center gap-1">
                  <button onClick={navigatePrev} className="p-2 text-theme-tertiary hover:text-theme-primary hover:bg-theme-tertiary rounded-lg transition-colors">
                    <ChevronLeft className="w-5 h-5" />
                  </button>
                  <button onClick={navigateNext} className="p-2 text-theme-tertiary hover:text-theme-primary hover:bg-theme-tertiary rounded-lg transition-colors">
                    <ChevronRight className="w-5 h-5" />
                  </button>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <button 
                  onClick={goToToday}
                  className="px-4 py-2 text-sm text-theme-secondary hover:text-theme-primary hover:bg-theme-tertiary rounded-lg transition-colors"
                >
                  Hoy
                </button>
                <div className="flex p-1 bg-theme-card border border-theme rounded-lg">
                  {(['month', 'week', 'day', 'agenda'] as const).map((mode) => (
                    <button
                      key={mode}
                      onClick={() => setViewMode(mode)}
                      className={`px-3 py-1.5 text-sm font-medium rounded-md transition-colors flex items-center gap-1.5 ${
                        viewMode === mode
                          ? 'bg-amber-500 text-slate-950'
                          : 'text-theme-tertiary hover:text-theme-primary'
                      }`}
                    >
                      {mode === 'month' && <LayoutGrid className="w-4 h-4" />}
                      {mode === 'week' && <Columns className="w-4 h-4" />}
                      {mode === 'day' && <Calendar className="w-4 h-4" />}
                      {mode === 'agenda' && <List className="w-4 h-4" />}
                      <span className="hidden lg:inline">
                        {mode === 'month' ? 'Mes' : mode === 'week' ? 'Semana' : mode === 'day' ? 'Día' : 'Agenda'}
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Calendar Grid - Renderizado dinámico según vista */}
            {renderCurrentView()}

            {/* Legend - Adaptada según el rol */}
            {config.mostrarLeyendaCompleta ? (
              <div className="flex flex-wrap items-center gap-4">
                {[
                  { label: 'Vista', color: 'bg-blue-500' },
                  { label: 'Plazo', color: 'bg-red-500' },
                  { label: 'Reunión', color: 'bg-purple-500' },
                  { label: 'Entrega', color: 'bg-emerald-500' },
                ].map((item) => (
                  <div key={item.label} className="flex items-center gap-2">
                    <div className={`w-3 h-3 rounded-full ${item.color}`} />
                    <span className="text-sm text-theme-tertiary">{item.label}</span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex flex-wrap items-center gap-4">
                {[
                  { label: 'Plazo', color: 'bg-red-500' },
                  { label: 'Reunión', color: 'bg-purple-500' },
                ].map((item) => (
                  <div key={item.label} className="flex items-center gap-2">
                    <div className={`w-3 h-3 rounded-full ${item.color}`} />
                    <span className="text-sm text-theme-tertiary">{item.label}</span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Side Panel */}
          <div className="space-y-6">
            {/* Mini Calendar */}
            <MiniCalendar
              currentDate={currentDate}
              selectedDate={selectedDate}
              eventsCount={eventsCountByDate}
              onSelectDate={(date) => {
                setSelectedDate(date);
                setCurrentDate(date);
              }}
              onNavigate={handleMiniCalendarNavigate}
            />
            
            {/* Selected Day Events */}
            <div className="bg-theme-card/60 border border-theme rounded-2xl p-6">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-lg font-semibold text-theme-primary">
                    {selectedDate ? selectedDate.toLocaleDateString('es-ES', { weekday: 'long', day: 'numeric', month: 'long' }) : 'Selecciona una fecha'}
                  </h3>
                  <p className="text-sm text-theme-tertiary">
                    {selectedDateEvents.length} eventos programados
                  </p>
                </div>
                {config.puedeCrear && (
                  <button 
                    onClick={handleCreateEvent}
                    className="p-2 bg-amber-500 text-slate-950 rounded-lg hover:bg-amber-400 transition-colors"
                  >
                    <Plus className="w-5 h-5" />
                  </button>
                )}
              </div>

              <div className="space-y-3">
                {selectedDateEvents.length === 0 ? (
                  <div className="text-center py-8">
                    <Calendar className="w-12 h-12 text-theme-muted mx-auto mb-3" />
                    <p className="text-theme-tertiary">No hay eventos para este día</p>
                    {config.puedeCrear && (
                      <button 
                        onClick={handleCreateEvent}
                        className="mt-3 text-sm text-amber-500 hover:text-amber-400"
                      >
                        + Crear nuevo evento
                      </button>
                    )}
                  </div>
                ) : (
                  selectedDateEvents.map((event, index) => (
                    <motion.div
                      key={event.id}
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.05 }}
                      className={`p-4 rounded-xl border transition-all cursor-pointer ${
                        event.urgent 
                          ? 'bg-red-500/5 border-red-500/20 hover:border-red-500/40' 
                          : event.completed
                            ? 'bg-theme-tertiary/30 border-theme opacity-60'
                            : 'bg-theme-tertiary/50 border-theme hover:border-amber-500/30'
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        <div className={`w-2 h-2 rounded-full mt-2 ${getEventTypeColor(event.type)}`} />
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <p className={`text-sm font-medium truncate ${event.completed ? 'text-theme-muted line-through' : 'text-theme-primary'}`}>
                              {event.title}
                            </p>
                            {event.urgent && !event.completed && (
                              <span className="px-1.5 py-0.5 bg-red-500/20 text-red-500 text-[10px] font-bold rounded uppercase">Urgente</span>
                            )}
                            {event.completed && (
                              <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                            )}
                          </div>
                          <p className="text-xs text-theme-muted mt-1">{event.caseTitle}</p>
                          <div className="flex items-center gap-4 mt-2 text-xs text-theme-tertiary">
                            <span className="flex items-center gap-1">
                              <Clock className="w-3 h-3" />
                              {event.time}{event.duration && ` (${event.duration})`}
                            </span>
                            <span className="flex items-center gap-1">
                              <MapPin className="w-3 h-3" />
                              {event.location}
                            </span>
                          </div>
                        </div>
                        {(config.puedeEditarTodos || (config.puedeCrear && !config.puedeVerTodos)) && (
                          <button 
                            onClick={() => handleEditEvent(event)}
                            className="p-1 text-theme-muted hover:text-theme-primary"
                          >
                            <span className="sr-only">Editar</span>
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                            </svg>
                          </button>
                        )}
                      </div>
                    </motion.div>
                  ))
                )}
              </div>
            </div>

            {/* Upcoming Deadlines - Solo para roles relevantes */}
            {(role === 'super_admin' || role === 'socio' || role === 'abogado_senior' || 
              role === 'abogado_junior' || role === 'paralegal' || role === 'administrador') && (
              <div className="bg-gradient-to-br from-amber-500/10 to-amber-600/5 border border-amber-500/20 rounded-2xl p-6">
                <h3 className="text-lg font-semibold text-theme-primary mb-4 flex items-center gap-2">
                  <AlertTriangle className="w-5 h-5 text-amber-500" />
                  {role === 'administrador' 
                    ? 'Vencimientos Administrativos' 
                    : role === 'paralegal'
                      ? 'Plazos de Diligencias'
                      : 'Próximos Plazos Críticos'}
                </h3>
                <div className="space-y-3">
                  {eventosFiltrados
                    .filter(e => e.urgent && !e.completed)
                    .slice(0, 3)
                    .map((event) => (
                      <div key={event.id} className="flex items-center gap-3 p-3 bg-theme-card/60 rounded-lg">
                        <div className="w-10 h-10 bg-red-500/20 rounded-lg flex items-center justify-center flex-shrink-0">
                          <Clock className="w-5 h-5 text-red-500" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-theme-primary truncate">{event.title}</p>
                          <p className="text-xs text-theme-muted">
                            {new Date(event.date).toLocaleDateString('es-ES', { day: 'numeric', month: 'short' })} • {event.time}
                          </p>
                        </div>
                      </div>
                    ))}
                  {eventosFiltrados.filter(e => e.urgent && !e.completed).length === 0 && (
                    <p className="text-sm text-theme-muted text-center py-4">
                      No hay plazos críticos pendientes
                    </p>
                  )}
                </div>
              </div>
            )}

            {/* Panel adicional para Secretario/Recepcionista - Disponibilidad */}
            {(role === 'secretario' || role === 'recepcionista') && (
              <div className="bg-gradient-to-br from-emerald-500/10 to-emerald-600/5 border border-emerald-500/20 rounded-2xl p-6">
                <h3 className="text-lg font-semibold text-theme-primary mb-4 flex items-center gap-2">
                  <Building2 className="w-5 h-5 text-emerald-500" />
                  Salas Disponibles
                </h3>
                <div className="space-y-2">
                  {[
                    { name: 'Sala de Juntas Principal', status: 'available', time: 'Todo el día' },
                    { name: 'Sala de Reuniones A', status: 'busy', time: '14:00 - 16:00' },
                    { name: 'Sala de Capacitación', status: 'available', time: 'Todo el día' },
                  ].map((sala, idx) => (
                    <div key={idx} className="flex items-center justify-between p-3 bg-theme-card/60 rounded-lg">
                      <div className="flex items-center gap-3">
                        <div className={`w-2 h-2 rounded-full ${sala.status === 'available' ? 'bg-emerald-500' : 'bg-red-500'}`} />
                        <span className="text-sm text-theme-primary">{sala.name}</span>
                      </div>
                      <span className="text-xs text-theme-muted">{sala.time}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Panel para Administrador - Reuniones del bufete */}
            {role === 'administrador' && (
              <div className="bg-gradient-to-br from-orange-500/10 to-orange-600/5 border border-orange-500/20 rounded-2xl p-6">
                <h3 className="text-lg font-semibold text-theme-primary mb-4 flex items-center gap-2">
                  <Users className="w-5 h-5 text-orange-500" />
                  Reuniones Programadas
                </h3>
                <div className="space-y-3">
                  {eventosFiltrados
                    .filter(e => e.type === 'reunion')
                    .slice(0, 3)
                    .map((event) => (
                      <div key={event.id} className="flex items-center gap-3 p-3 bg-theme-card/60 rounded-lg">
                        <div className="w-10 h-10 bg-orange-500/20 rounded-lg flex items-center justify-center flex-shrink-0">
                          <Users className="w-5 h-5 text-orange-500" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-theme-primary truncate">{event.title}</p>
                          <p className="text-xs text-theme-muted">
                            {new Date(event.date).toLocaleDateString('es-ES', { day: 'numeric', month: 'short' })} • {event.location}
                          </p>
                        </div>
                      </div>
                    ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </main>
      
      {/* Modal de Crear/Editar Evento */}
      <EventoModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setEditingEvent(null);
        }}
        onSave={handleSaveEvent}
        onDelete={handleDeleteEvent}
        evento={editingEvent}
        selectedDate={selectedDate}
        config={config}
      />
    </AppLayout>
  );
}

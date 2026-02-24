import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  Clock, AlertTriangle, CheckCircle, Calendar, Filter,
  Search, Plus, Loader2, FileText, ArrowUpRight, X,
  ChevronLeft, ChevronRight, Bell, History, Save
} from 'lucide-react';
import { AppLayout } from '@/components/layout/AppLayout';
import { useAuth } from '@/contexts/AuthContext';
import { 
  calendarioService,
  type Evento,
  type CreateEventoData
} from '@/services';

interface Toast {
  id: number;
  message: string;
  type: 'success' | 'error' | 'info';
}

interface PlazoFormData {
  titulo: string;
  descripcion: string;
  fechaInicio: string;
  fechaFin: string;
  expedienteId: string;
}

export default function PlazosProcesales() {
  const navigate = useNavigate();
  const { user, hasPermission } = useAuth();
  
  const [plazos, setPlazos] = useState<Evento[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [toasts, setToasts] = useState<Toast[]>([]);
  
  // Filtros
  const [searchQuery, setSearchQuery] = useState('');
  const [filtroEstado, setFiltroEstado] = useState<'todos' | 'activos' | 'vencidos' | 'proximos'>('todos');
  const [fechaDesde, setFechaDesde] = useState('');
  const [fechaHasta, setFechaHasta] = useState('');
  
  // Modal de nuevo plazo
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState<PlazoFormData>({
    titulo: '',
    descripcion: '',
    fechaInicio: '',
    fechaFin: '',
    expedienteId: ''
  });
  const [saving, setSaving] = useState(false);

  // Cargar plazos
  useEffect(() => {
    cargarPlazos();
  }, [filtroEstado, fechaDesde, fechaHasta]);

  const cargarPlazos = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const hoy = new Date();
      let desde = fechaDesde || hoy.toISOString().split('T')[0];
      let hasta = fechaHasta || new Date(hoy.getFullYear(), hoy.getMonth() + 6, 0).toISOString().split('T')[0];
      
      const data = await calendarioService.listarPlazos(desde, hasta);
      setPlazos(data);
    } catch (err: any) {
      setError(err.message || 'Error al cargar plazos');
      showToast('Error al cargar plazos', 'error');
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

  // Calcular días restantes
  const getDiasRestantes = (fecha: string): number => {
    const hoy = new Date();
    hoy.setHours(0, 0, 0, 0);
    const fechaObj = new Date(fecha);
    fechaObj.setHours(0, 0, 0, 0);
    const diffTime = fechaObj.getTime() - hoy.getTime();
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  };

  // Determinar estado y color del plazo
  const getEstadoPlazo = (diasRestantes: number) => {
    if (diasRestantes < 0) {
      return { 
        estado: 'Vencido', 
        color: 'bg-red-500', 
        bgColor: 'bg-red-500/10',
        borderColor: 'border-red-500/20',
        textColor: 'text-red-500'
      };
    } else if (diasRestantes <= 3) {
      return { 
        estado: 'Crítico', 
        color: 'bg-red-500', 
        bgColor: 'bg-red-500/10',
        borderColor: 'border-red-500/20',
        textColor: 'text-red-500'
      };
    } else if (diasRestantes <= 7) {
      return { 
        estado: 'Urgente', 
        color: 'bg-amber-500', 
        bgColor: 'bg-amber-500/10',
        borderColor: 'border-amber-500/20',
        textColor: 'text-amber-500'
      };
    } else if (diasRestantes <= 30) {
      return { 
        estado: 'Próximo', 
        color: 'bg-blue-500', 
        bgColor: 'bg-blue-500/10',
        borderColor: 'border-blue-500/20',
        textColor: 'text-blue-500'
      };
    } else {
      return { 
        estado: 'Activo', 
        color: 'bg-emerald-500', 
        bgColor: 'bg-emerald-500/10',
        borderColor: 'border-emerald-500/20',
        textColor: 'text-emerald-500'
      };
    }
  };

  // Filtrar plazos
  const plazosFiltrados = plazos.filter(plazo => {
    const dias = getDiasRestantes(plazo.fechaInicio);
    
    // Filtro por búsqueda
    const matchSearch = searchQuery === '' || 
      plazo.titulo.toLowerCase().includes(searchQuery.toLowerCase()) ||
      plazo.descripcion?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      plazo.expediente?.numeroExpediente.toLowerCase().includes(searchQuery.toLowerCase());
    
    // Filtro por estado
    let matchEstado = true;
    if (filtroEstado === 'vencidos') matchEstado = dias < 0;
    else if (filtroEstado === 'activos') matchEstado = dias >= 0;
    else if (filtroEstado === 'proximos') matchEstado = dias >= 0 && dias <= 30;
    
    return matchSearch && matchEstado;
  });

  // Ordenar por días restantes
  const plazosOrdenados = [...plazosFiltrados].sort((a, b) => {
    return getDiasRestantes(a.fechaInicio) - getDiasRestantes(b.fechaInicio);
  });

  // Estadísticas
  const stats = {
    total: plazos.length,
    vencidos: plazos.filter(p => getDiasRestantes(p.fechaInicio) < 0).length,
    criticos: plazos.filter(p => {
      const dias = getDiasRestantes(p.fechaInicio);
      return dias >= 0 && dias <= 3;
    }).length,
    urgentes: plazos.filter(p => {
      const dias = getDiasRestantes(p.fechaInicio);
      return dias > 3 && dias <= 7;
    }).length,
    proximos: plazos.filter(p => {
      const dias = getDiasRestantes(p.fechaInicio);
      return dias > 7 && dias <= 30;
    }).length,
  };

  const handleCrearPlazo = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    
    try {
      const data: CreateEventoData = {
        titulo: formData.titulo,
        descripcion: formData.descripcion,
        fechaInicio: formData.fechaInicio,
        fechaFin: formData.fechaFin || undefined,
        tipo: 'PLAZO',
        expedienteId: formData.expedienteId || undefined
      };
      
      await calendarioService.crearPlazo(data);
      showToast('Plazo creado correctamente', 'success');
      setShowModal(false);
      setFormData({
        titulo: '',
        descripcion: '',
        fechaInicio: '',
        fechaFin: '',
        expedienteId: ''
      });
      cargarPlazos();
    } catch (err: any) {
      showToast(err.message || 'Error al crear plazo', 'error');
    } finally {
      setSaving(false);
    }
  };

  return (
    <AppLayout>
      <div className="p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-theme-primary">Plazos Procesales</h1>
            <p className="text-theme-secondary">
              Gestión de plazos y prescripciones legales
            </p>
          </div>
          
          {hasPermission('expedientes:write') && (
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setShowModal(true)}
              className="flex items-center gap-2 px-4 py-2 bg-amber-500 text-white rounded-lg hover:bg-amber-600 transition-colors"
            >
              <Plus className="w-4 h-4" />
              Nuevo Plazo
            </motion.button>
          )}
        </div>

        {/* Estadísticas */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="p-4 bg-theme-secondary rounded-xl border border-theme"
          >
            <p className="text-sm text-theme-secondary">Total Plazos</p>
            <p className="text-2xl font-bold text-theme-primary">{stats.total}</p>
          </motion.div>
          
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="p-4 bg-red-500/10 border border-red-500/20 rounded-xl"
          >
            <p className="text-sm text-red-500">Vencidos</p>
            <p className="text-2xl font-bold text-red-500">{stats.vencidos}</p>
          </motion.div>
          
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="p-4 bg-red-500/10 border border-red-500/20 rounded-xl"
          >
            <p className="text-sm text-red-500">Críticos</p>
            <p className="text-2xl font-bold text-red-500">{stats.criticos}</p>
          </motion.div>
          
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="p-4 bg-amber-500/10 border border-amber-500/20 rounded-xl"
          >
            <p className="text-sm text-amber-500">Urgentes</p>
            <p className="text-2xl font-bold text-amber-500">{stats.urgentes}</p>
          </motion.div>
          
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="p-4 bg-blue-500/10 border border-blue-500/20 rounded-xl"
          >
            <p className="text-sm text-blue-500">Próximos</p>
            <p className="text-2xl font-bold text-blue-500">{stats.proximos}</p>
          </motion.div>
        </div>

        {/* Filtros */}
        <div className="bg-theme-secondary rounded-xl border border-theme p-4">
          <div className="flex flex-wrap items-center gap-4">
            <div className="flex-1 min-w-[300px]">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-theme-tertiary" />
                <input
                  type="text"
                  placeholder="Buscar plazos..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 bg-theme border border-theme rounded-lg text-theme-primary placeholder-theme-tertiary focus:outline-none focus:border-amber-500"
                />
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              <Filter className="w-4 h-4 text-theme-tertiary" />
              <select
                value={filtroEstado}
                onChange={(e) => setFiltroEstado(e.target.value as any)}
                className="px-3 py-2 bg-theme border border-theme rounded-lg text-theme-primary focus:outline-none focus:border-amber-500"
              >
                <option value="todos">Todos los estados</option>
                <option value="activos">Activos</option>
                <option value="proximos">Próximos (≤30 días)</option>
                <option value="vencidos">Vencidos</option>
              </select>
            </div>
            
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-theme-tertiary" />
              <input
                type="date"
                value={fechaDesde}
                onChange={(e) => setFechaDesde(e.target.value)}
                className="px-3 py-2 bg-theme border border-theme rounded-lg text-theme-primary focus:outline-none focus:border-amber-500"
              />
              <span className="text-theme-tertiary">a</span>
              <input
                type="date"
                value={fechaHasta}
                onChange={(e) => setFechaHasta(e.target.value)}
                className="px-3 py-2 bg-theme border border-theme rounded-lg text-theme-primary focus:outline-none focus:border-amber-500"
              />
            </div>
          </div>
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

        {/* Lista de Plazos */}
        {!loading && !error && (
          <div className="space-y-3">
            {plazosOrdenados.length > 0 ? (
              plazosOrdenados.map((plazo) => {
                const diasRestantes = getDiasRestantes(plazo.fechaInicio);
                const { estado, bgColor, borderColor, textColor } = getEstadoPlazo(diasRestantes);
                
                return (
                  <motion.div
                    key={plazo.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`p-4 ${bgColor} ${borderColor} border rounded-xl`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <Clock className={`w-5 h-5 ${textColor}`} />
                          <h3 className="font-semibold text-theme-primary">{plazo.titulo}</h3>
                          <span className={`px-2 py-0.5 text-xs text-white rounded-full ${
                            diasRestantes < 0 ? 'bg-red-500' : 
                            diasRestantes <= 3 ? 'bg-red-500' :
                            diasRestantes <= 7 ? 'bg-amber-500' :
                            diasRestantes <= 30 ? 'bg-blue-500' : 'bg-emerald-500'
                          }`}>
                            {diasRestantes < 0 
                              ? `Vencido hace ${Math.abs(diasRestantes)} días` 
                              : `${diasRestantes} días restantes`
                            }
                          </span>
                        </div>
                        
                        {plazo.descripcion && (
                          <p className="text-theme-secondary text-sm mb-2">{plazo.descripcion}</p>
                        )}
                        
                        <div className="flex flex-wrap items-center gap-4 text-sm">
                          <span className="flex items-center gap-1 text-theme-tertiary">
                            <Calendar className="w-4 h-4" />
                            Vence: {new Date(plazo.fechaInicio).toLocaleDateString('es-ES', {
                              weekday: 'long',
                              year: 'numeric',
                              month: 'long',
                              day: 'numeric'
                            })}
                          </span>
                          
                          {plazo.expediente && (
                            <button
                              onClick={() => navigate(`/core/expedientes/${plazo.expediente?.id}`)}
                              className="flex items-center gap-1 text-amber-500 hover:text-amber-400"
                            >
                              <FileText className="w-4 h-4" />
                              {plazo.expediente.numeroExpediente}
                            </button>
                          )}
                        </div>
                      </div>
                      
                      <button
                        onClick={() => navigate(`/core/expedientes/${plazo.expedienteId}`)}
                        className={`p-2 ${textColor} hover:opacity-70 transition-opacity`}
                      >
                        <ArrowUpRight className="w-5 h-5" />
                      </button>
                    </div>
                  </motion.div>
                );
              })
            ) : (
              <div className="text-center py-12 bg-theme-secondary rounded-xl">
                <Clock className="w-12 h-12 text-theme-tertiary mx-auto mb-4" />
                <h3 className="text-lg font-medium text-theme-primary mb-2">No hay plazos registrados</h3>
                <p className="text-theme-secondary">Crea un nuevo plazo para comenzar</p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Modal Nuevo Plazo */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-theme-secondary rounded-xl border border-theme w-full max-w-lg max-h-[90vh] overflow-y-auto"
          >
            <div className="p-6 border-b border-theme flex items-center justify-between">
              <h2 className="text-xl font-bold text-theme-primary">Nuevo Plazo Procesal</h2>
              <button
                onClick={() => setShowModal(false)}
                className="p-2 text-theme-tertiary hover:text-theme-primary"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <form onSubmit={handleCrearPlazo} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-theme-secondary mb-1">
                  Título <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.titulo}
                  onChange={(e) => setFormData({ ...formData, titulo: e.target.value })}
                  className="w-full px-4 py-2 bg-theme border border-theme rounded-lg text-theme-primary focus:outline-none focus:border-amber-500"
                  placeholder="Ej: Plazo para presentar escrito"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-theme-secondary mb-1">
                  Descripción
                </label>
                <textarea
                  value={formData.descripcion}
                  onChange={(e) => setFormData({ ...formData, descripcion: e.target.value })}
                  rows={3}
                  className="w-full px-4 py-2 bg-theme border border-theme rounded-lg text-theme-primary focus:outline-none focus:border-amber-500 resize-none"
                  placeholder="Detalles del plazo..."
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-theme-secondary mb-1">
                    Fecha Límite <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="date"
                    value={formData.fechaInicio}
                    onChange={(e) => setFormData({ ...formData, fechaInicio: e.target.value })}
                    className="w-full px-4 py-2 bg-theme border border-theme rounded-lg text-theme-primary focus:outline-none focus:border-amber-500"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-theme-secondary mb-1">
                    Fecha Fin (opcional)
                  </label>
                  <input
                    type="date"
                    value={formData.fechaFin}
                    onChange={(e) => setFormData({ ...formData, fechaFin: e.target.value })}
                    className="w-full px-4 py-2 bg-theme border border-theme rounded-lg text-theme-primary focus:outline-none focus:border-amber-500"
                  />
                </div>
              </div>
              
              <div className="flex items-center justify-end gap-4 pt-4">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 text-theme-secondary hover:text-theme-primary"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="flex items-center gap-2 px-4 py-2 bg-amber-500 text-white rounded-lg hover:bg-amber-600 disabled:opacity-50"
                >
                  {saving ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Guardando...
                    </>
                  ) : (
                    <>
                      <Save className="w-4 h-4" />
                      Crear Plazo
                    </>
                  )}
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}

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

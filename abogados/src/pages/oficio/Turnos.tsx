import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Calendar, List, Filter, Search, ChevronDown, X } from 'lucide-react';
import useTurnos from '@/hooks/useTurnos';
import CalendarioTurnos from '@/components/oficio/CalendarioTurnos';
import { TIPO_TURNO_CONFIG, TIPO_GUARDIA_LABELS, type TipoTurno, type EstadoTurno, type Turno } from '@/types/oficio';

export default function Turnos() {
  const { turnos, abogados, partidos, crearTurno, actualizarEstadoTurno, isLoading } = useTurnos();
  const [viewMode, setViewMode] = useState<'calendario' | 'lista'>('calendario');
  const [showModal, setShowModal] = useState(false);
  const [filterTipo, setFilterTipo] = useState<TipoTurno | 'todos'>('todos');
  const [filterEstado, setFilterEstado] = useState<EstadoTurno | 'todos'>('todos');
  const [searchTerm, setSearchTerm] = useState('');

  const [newTurno, setNewTurno] = useState({
    tipo: 'penal' as TipoTurno,
    partidoJudicial: 'Madrid',
    fechaInicio: '',
    fechaFin: '',
    abogadoId: '',
    abogadoNombre: '',
    observaciones: '',
  });

  const filteredTurnos = turnos.filter(turno => {
    if (filterTipo !== 'todos' && turno.tipo !== filterTipo) return false;
    if (filterEstado !== 'todos' && turno.estado !== filterEstado) return false;
    if (searchTerm && !turno.abogadoNombre.toLowerCase().includes(searchTerm.toLowerCase()) &&
        !turno.partidoJudicial.toLowerCase().includes(searchTerm.toLowerCase())) return false;
    return true;
  });

  const handleCreateTurno = async () => {
    if (!newTurno.fechaInicio || !newTurno.fechaFin || !newTurno.abogadoId) return;
    
    const abogado = abogados.find(a => a.id === newTurno.abogadoId);
    await crearTurno({
      tipo: newTurno.tipo,
      partidoJudicial: newTurno.partidoJudicial,
      fechaInicio: newTurno.fechaInicio,
      fechaFin: newTurno.fechaFin,
      abogadoId: newTurno.abogadoId,
      abogadoNombre: abogado?.nombre || '',
      observaciones: newTurno.observaciones,
    });
    setShowModal(false);
    setNewTurno({
      tipo: 'penal',
      partidoJudicial: 'Madrid',
      fechaInicio: '',
      fechaFin: '',
      abogadoId: '',
      abogadoNombre: '',
      observaciones: '',
    });
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-accent" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-theme-primary">Turnos de Guardia</h1>
          <p className="text-theme-muted">Gestiona los turnos de oficio del bufete</p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="flex items-center gap-2 px-4 py-2 bg-accent text-white rounded-lg hover:bg-accent/90 transition-colors"
        >
          <Plus className="w-5 h-5" />
          Nuevo Turno
        </button>
      </div>

      <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-theme-muted" />
            <input
              type="text"
              placeholder="Buscar turnos..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2 bg-theme-card border border-theme rounded-lg text-theme-primary placeholder:text-theme-muted focus:outline-none focus:ring-2 focus:ring-accent"
            />
          </div>
          <select
            value={filterTipo}
            onChange={e => setFilterTipo(e.target.value as TipoTurno | 'todos')}
            className="px-3 py-2 bg-theme-card border border-theme rounded-lg text-theme-primary focus:outline-none focus:ring-2 focus:ring-accent"
          >
            <option value="todos">Todos los tipos</option>
            {(Object.keys(TIPO_TURNO_CONFIG) as TipoTurno[]).map(tipo => (
              <option key={tipo} value={tipo}>{TIPO_TURNO_CONFIG[tipo].label}</option>
            ))}
          </select>
          <select
            value={filterEstado}
            onChange={e => setFilterEstado(e.target.value as EstadoTurno | 'todos')}
            className="px-3 py-2 bg-theme-card border border-theme rounded-lg text-theme-primary focus:outline-none focus:ring-2 focus:ring-accent"
          >
            <option value="todos">Todos los estados</option>
            <option value="asignado">Asignado</option>
            <option value="confirmado">Confirmado</option>
            <option value="completado">Completado</option>
            <option value="cancelado">Cancelado</option>
          </select>
        </div>

        <div className="flex items-center gap-2 bg-theme-secondary/30 p-1 rounded-lg">
          <button
            onClick={() => setViewMode('calendario')}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-lg transition-colors ${
              viewMode === 'calendario' ? 'bg-accent text-white' : 'text-theme-muted hover:text-theme-primary'
            }`}
          >
            <Calendar className="w-4 h-4" />
            Calendario
          </button>
          <button
            onClick={() => setViewMode('lista')}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-lg transition-colors ${
              viewMode === 'lista' ? 'bg-accent text-white' : 'text-theme-muted hover:text-theme-primary'
            }`}
          >
            <List className="w-4 h-4" />
            Lista
          </button>
        </div>
      </div>

      <AnimatePresence mode="wait">
        {viewMode === 'calendario' ? (
          <motion.div
            key="calendario"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
          >
            <CalendarioTurnos 
              turnos={filteredTurnos} 
              onTurnoClick={(turno) => console.log('Clicked:', turno)}
            />
          </motion.div>
        ) : (
          <motion.div
            key="lista"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"
          >
            {filteredTurnos.map(turno => {
              const config = TIPO_TURNO_CONFIG[turno.tipo];
              return (
                <motion.div
                  key={turno.id}
                  whileHover={{ scale: 1.02 }}
                  className={`bg-theme-card rounded-xl border border-theme p-5 ${config.bgColor}`}
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className={`px-2 py-1 rounded-lg ${config.bgColor} ${config.color} text-xs font-medium`}>
                      {config.label}
                    </div>
                    <span className={`text-xs px-2 py-1 rounded-full ${
                      turno.estado === 'confirmado' ? 'bg-emerald-500/20 text-emerald-400' :
                      turno.estado === 'asignado' ? 'bg-amber-500/20 text-amber-400' :
                      turno.estado === 'completado' ? 'bg-blue-500/20 text-blue-400' :
                      'bg-red-500/20 text-red-400'
                    }`}>
                      {turno.estado}
                    </span>
                  </div>
                  <h3 className="font-semibold text-theme-primary mb-1">{turno.abogadoNombre}</h3>
                  <p className="text-sm text-theme-muted mb-3">{turno.partidoJudicial}</p>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-theme-muted">
                      {turno.fechaInicio} - {turno.fechaFin}
                    </span>
                  </div>
                  {turno.observaciones && (
                    <p className="text-xs text-theme-muted mt-2 pt-2 border-t border-theme">
                      {turno.observaciones}
                    </p>
                  )}
                </motion.div>
              );
            })}
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
            onClick={() => setShowModal(false)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-theme-card rounded-xl border border-theme w-full max-w-lg"
              onClick={e => e.stopPropagation()}
            >
              <div className="p-4 border-b border-theme flex items-center justify-between">
                <h3 className="text-lg font-semibold text-theme-primary">Nuevo Turno</h3>
                <button
                  onClick={() => setShowModal(false)}
                  className="p-1 text-theme-muted hover:text-theme-primary"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              <div className="p-4 space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm text-theme-muted mb-1">Tipo de Turno</label>
                    <select
                      value={newTurno.tipo}
                      onChange={e => setNewTurno({ ...newTurno, tipo: e.target.value as TipoTurno })}
                      className="w-full px-3 py-2 bg-theme-secondary/30 border border-theme rounded-lg text-theme-primary focus:outline-none focus:ring-2 focus:ring-accent"
                    >
                      {(Object.keys(TIPO_TURNO_CONFIG) as TipoTurno[]).map(tipo => (
                        <option key={tipo} value={tipo}>{TIPO_TURNO_CONFIG[tipo].label}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm text-theme-muted mb-1">Partido Judicial</label>
                    <select
                      value={newTurno.partidoJudicial}
                      onChange={e => setNewTurno({ ...newTurno, partidoJudicial: e.target.value })}
                      className="w-full px-3 py-2 bg-theme-secondary/30 border border-theme rounded-lg text-theme-primary focus:outline-none focus:ring-2 focus:ring-accent"
                    >
                      {partidos.map(p => (
                        <option key={p.id} value={p.nombre}>{p.nombre}</option>
                      ))}
                    </select>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm text-theme-muted mb-1">Fecha Inicio</label>
                    <input
                      type="date"
                      value={newTurno.fechaInicio}
                      onChange={e => setNewTurno({ ...newTurno, fechaInicio: e.target.value })}
                      className="w-full px-3 py-2 bg-theme-secondary/30 border border-theme rounded-lg text-theme-primary focus:outline-none focus:ring-2 focus:ring-accent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-theme-muted mb-1">Fecha Fin</label>
                    <input
                      type="date"
                      value={newTurno.fechaFin}
                      onChange={e => setNewTurno({ ...newTurno, fechaFin: e.target.value })}
                      className="w-full px-3 py-2 bg-theme-secondary/30 border border-theme rounded-lg text-theme-primary focus:outline-none focus:ring-2 focus:ring-accent"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm text-theme-muted mb-1">Abogado Asignado</label>
                  <select
                    value={newTurno.abogadoId}
                    onChange={e => setNewTurno({ ...newTurno, abogadoId: e.target.value })}
                    className="w-full px-3 py-2 bg-theme-secondary/30 border border-theme rounded-lg text-theme-primary focus:outline-none focus:ring-2 focus:ring-accent"
                  >
                    <option value="">Seleccionar...</option>
                    {abogados.filter(a => a.disponibilidad).map(abogado => (
                      <option key={abogado.id} value={abogado.id}>{abogado.nombre}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm text-theme-muted mb-1">Observaciones</label>
                  <textarea
                    value={newTurno.observaciones}
                    onChange={e => setNewTurno({ ...newTurno, observaciones: e.target.value })}
                    rows={3}
                    className="w-full px-3 py-2 bg-theme-secondary/30 border border-theme rounded-lg text-theme-primary focus:outline-none focus:ring-2 focus:ring-accent resize-none"
                    placeholder="Observaciones adicionales..."
                  />
                </div>
              </div>
              <div className="p-4 border-t border-theme flex justify-end gap-3">
                <button
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 text-theme-muted hover:text-theme-primary transition-colors"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleCreateTurno}
                  disabled={!newTurno.fechaInicio || !newTurno.fechaFin || !newTurno.abogadoId}
                  className="px-4 py-2 bg-accent text-white rounded-lg hover:bg-accent/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Crear Turno
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

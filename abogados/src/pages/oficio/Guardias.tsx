import { useState } from 'react';
import { motion } from 'framer-motion';
import { Plus, Clock, CheckCircle, XCircle, Calendar, Phone, MapPin, AlertTriangle } from 'lucide-react';
import useTurnos from '@/hooks/useTurnos';
import { TIPO_TURNO_CONFIG, TIPO_GUARDIA_LABELS, type TipoGuardia, type Guardia, type Turno } from '@/types/oficio';

export default function Guardias() {
  const { guardias, turnos, crearGuardia, confirmarGuardia, isLoading } = useTurnos();
  const [showModal, setShowModal] = useState(false);
  const [filterConfirmada, setFilterConfirmada] = useState<'todas' | 'confirmadas' | 'pendientes'>('todas');

  const [newGuardia, setNewGuardia] = useState({
    turnoId: '',
    fecha: '',
    horaInicio: '08:00',
    horaFin: '20:00',
    tipo: 'presencial' as TipoGuardia,
  });

  const filteredGuardias = guardias.filter(g => {
    if (filterConfirmada === 'confirmadas') return g.confirmada;
    if (filterConfirmada === 'pendientes') return !g.confirmada;
    return true;
  });

  const getTurnoForGuardia = (turnoId: string): Turno | undefined => {
    return turnos.find(t => t.id === turnoId);
  };

  const handleCreateGuardia = async () => {
    if (!newGuardia.turnoId || !newGuardia.fecha) return;
    await crearGuardia({
      turnoId: newGuardia.turnoId,
      fecha: newGuardia.fecha,
      horaInicio: newGuardia.horaInicio,
      horaFin: newGuardia.horaFin,
      tipo: newGuardia.tipo,
      confirmada: false,
    });
    setShowModal(false);
    setNewGuardia({
      turnoId: '',
      fecha: '',
      horaInicio: '08:00',
      horaFin: '20:00',
      tipo: 'presencial',
    });
  };

  const handleConfirmar = async (guardiaId: string) => {
    await confirmarGuardia(guardiaId);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-accent" />
      </div>
    );
  }

  const pendingCount = guardias.filter(g => !g.confirmada).length;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-theme-primary">Guardias</h1>
          <p className="text-theme-muted">Gestión de guardias de turno de oficio</p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="flex items-center gap-2 px-4 py-2 bg-accent text-white rounded-lg hover:bg-accent/90 transition-colors"
        >
          <Plus className="w-5 h-5" />
          Nueva Guardia
        </button>
      </div>

      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2 bg-amber-500/10 px-4 py-2 rounded-lg">
          <AlertTriangle className="w-5 h-5 text-amber-400" />
          <span className="text-amber-400 font-medium">{pendingCount} guardias pendientes de confirmación</span>
        </div>
      </div>

      <div className="flex items-center gap-2 bg-theme-secondary/30 p-1 rounded-lg w-fit">
        <button
          onClick={() => setFilterConfirmada('todas')}
          className={`px-3 py-1.5 rounded-lg transition-colors ${
            filterConfirmada === 'todas' ? 'bg-accent text-white' : 'text-theme-muted hover:text-theme-primary'
          }`}
        >
          Todas
        </button>
        <button
          onClick={() => setFilterConfirmada('pendientes')}
          className={`px-3 py-1.5 rounded-lg transition-colors ${
            filterConfirmada === 'pendientes' ? 'bg-amber-500 text-white' : 'text-theme-muted hover:text-theme-primary'
          }`}
        >
          Pendientes
        </button>
        <button
          onClick={() => setFilterConfirmada('confirmadas')}
          className={`px-3 py-1.5 rounded-lg transition-colors ${
            filterConfirmada === 'confirmadas' ? 'bg-emerald-500 text-white' : 'text-theme-muted hover:text-theme-primary'
          }`}
        >
          Confirmadas
        </button>
      </div>

      <div className="space-y-4">
        {filteredGuardias.length === 0 ? (
          <div className="bg-theme-card rounded-xl border border-theme p-8 text-center">
            <Calendar className="w-12 h-12 text-theme-muted mx-auto mb-3" />
            <p className="text-theme-muted">No hay guardias para mostrar</p>
          </div>
        ) : (
          filteredGuardias.map(guardia => {
            const turno = getTurnoForGuardia(guardia.turnoId);
            const tipoConfig = turno ? TIPO_TURNO_CONFIG[turno.tipo] : null;
            const isPendiente = !guardia.confirmada;
            const isHoy = guardia.fecha === new Date().toISOString().split('T')[0];

            return (
              <motion.div
                key={guardia.id}
                whileHover={{ scale: 1.01 }}
                className={`bg-theme-card rounded-xl border border-theme p-5 ${
                  isPendiente ? 'border-amber-500/30' : isHoy ? 'border-emerald-500/30' : ''
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-4">
                    <div className={`p-3 rounded-xl ${
                      isPendiente ? 'bg-amber-500/10' : 'bg-emerald-500/10'
                    }`}>
                      {isPendiente ? (
                        <Clock className="w-6 h-6 text-amber-400" />
                      ) : (
                        <CheckCircle className="w-6 h-6 text-emerald-400" />
                      )}
                    </div>
                    <div>
                      <div className="flex items-center gap-3 mb-1">
                        <h3 className="font-semibold text-theme-primary">{turno?.abogadoNombre || 'Abogado'}</h3>
                        {isHoy && (
                          <span className="px-2 py-0.5 bg-emerald-500/20 text-emerald-400 rounded-full text-xs">
                            Hoy
                          </span>
                        )}
                        {isPendiente && (
                          <span className="px-2 py-0.5 bg-amber-500/20 text-amber-400 rounded-full text-xs">
                            Pendiente
                          </span>
                        )}
                      </div>
                      {tipoConfig && (
                        <span className={`text-xs ${tipoConfig.color}`}>
                          {tipoConfig.label}
                        </span>
                      )}
                      <div className="flex items-center gap-4 mt-2 text-sm text-theme-muted">
                        <span className="flex items-center gap-1">
                          <Calendar className="w-4 h-4" />
                          {guardia.fecha}
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock className="w-4 h-4" />
                          {guardia.horaInicio} - {guardia.horaFin}
                        </span>
                        <span className="flex items-center gap-1">
                          {guardia.tipo === 'presencial' ? (
                            <MapPin className="w-4 h-4" />
                          ) : (
                            <Phone className="w-4 h-4" />
                          )}
                          {TIPO_GUARDIA_LABELS[guardia.tipo]}
                        </span>
                      </div>
                      {turno && (
                        <p className="text-xs text-theme-muted mt-2">
                          Partido Judicial: {turno.partidoJudicial}
                        </p>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {isPendiente ? (
                      <button
                        onClick={() => handleConfirmar(guardia.id)}
                        className="flex items-center gap-2 px-4 py-2 bg-emerald-500/10 text-emerald-400 rounded-lg hover:bg-emerald-500/20 transition-colors"
                      >
                        <CheckCircle className="w-4 h-4" />
                        Confirmar
                      </button>
                    ) : (
                      <span className="flex items-center gap-2 px-4 py-2 text-theme-muted">
                        <CheckCircle className="w-4 h-4" />
                        Confirmada
                      </span>
                    )}
                  </div>
                </div>
              </motion.div>
            );
          })
        )}
      </div>

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
              <h3 className="text-lg font-semibold text-theme-primary">Nueva Guardia</h3>
              <button
                onClick={() => setShowModal(false)}
                className="p-1 text-theme-muted hover:text-theme-primary"
              >
                <XCircle className="w-5 h-5" />
              </button>
            </div>
            <div className="p-4 space-y-4">
              <div>
                <label className="block text-sm text-theme-muted mb-1">Turno</label>
                <select
                  value={newGuardia.turnoId}
                  onChange={e => setNewGuardia({ ...newGuardia, turnoId: e.target.value })}
                  className="w-full px-3 py-2 bg-theme-secondary/30 border border-theme rounded-lg text-theme-primary focus:outline-none focus:ring-2 focus:ring-accent"
                >
                  <option value="">Seleccionar...</option>
                  {turnos.map(turno => (
                    <option key={turno.id} value={turno.id}>
                      {turno.abogadoNombre} - {turno.fechaInicio} a {turno.fechaFin}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm text-theme-muted mb-1">Fecha</label>
                <input
                  type="date"
                  value={newGuardia.fecha}
                  onChange={e => setNewGuardia({ ...newGuardia, fecha: e.target.value })}
                  className="w-full px-3 py-2 bg-theme-secondary/30 border border-theme rounded-lg text-theme-primary focus:outline-none focus:ring-2 focus:ring-accent"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-theme-muted mb-1">Hora Inicio</label>
                  <input
                    type="time"
                    value={newGuardia.horaInicio}
                    onChange={e => setNewGuardia({ ...newGuardia, horaInicio: e.target.value })}
                    className="w-full px-3 py-2 bg-theme-secondary/30 border border-theme rounded-lg text-theme-primary focus:outline-none focus:ring-2 focus:ring-accent"
                  />
                </div>
                <div>
                  <label className="block text-sm text-theme-muted mb-1">Hora Fin</label>
                  <input
                    type="time"
                    value={newGuardia.horaFin}
                    onChange={e => setNewGuardia({ ...newGuardia, horaFin: e.target.value })}
                    className="w-full px-3 py-2 bg-theme-secondary/30 border border-theme rounded-lg text-theme-primary focus:outline-none focus:ring-2 focus:ring-accent"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm text-theme-muted mb-1">Tipo de Guardia</label>
                <select
                  value={newGuardia.tipo}
                  onChange={e => setNewGuardia({ ...newGuardia, tipo: e.target.value as TipoGuardia })}
                  className="w-full px-3 py-2 bg-theme-secondary/30 border border-theme rounded-lg text-theme-primary focus:outline-none focus:ring-2 focus:ring-accent"
                >
                  <option value="presencial">Presencial</option>
                  <option value="localizable">Localizable</option>
                </select>
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
                onClick={handleCreateGuardia}
                disabled={!newGuardia.turnoId || !newGuardia.fecha}
                className="px-4 py-2 bg-accent text-white rounded-lg hover:bg-accent/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Crear Guardia
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </div>
  );
}

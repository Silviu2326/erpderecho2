import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Search, X, FileText, Building, Clock, User, AlertCircle, CheckCircle, Calendar, FileDown } from 'lucide-react';
import useTurnos from '@/hooks/useTurnos';
import { TIPO_ACTUACION_LABELS, TIPO_TURNO_CONFIG, type TipoActuacion, type ActuacionOficio, type Turno } from '@/types/oficio';
import HojaAsistenciaPDF from '@/components/oficio/HojaAsistenciaPDF';

const mockClientes = [
  { id: 'CLI-001', nombre: 'Juan Martínez Pérez', dni: '12345678A' },
  { id: 'CLI-002', nombre: 'Carlos García López', dni: '23456789B' },
  { id: 'CLI-003', nombre: 'Miguel Torres Ruiz', dni: '34567890C' },
  { id: 'CLI-004', nombre: 'Ana Rodríguez Sánchez', dni: '45678901D' },
];

const mockExpedientes: Array<{
  id: string;
  title: string;
  client: string;
  type: string;
  status: string;
}> = [];

export default function Actuaciones() {
  const { actuaciones, turnos, crearActuacion, isLoading } = useTurnos();
  const [showModal, setShowModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterTipo, setFilterTipo] = useState<TipoActuacion | 'todos'>('todos');
  const [filterFacturada, setFilterFacturada] = useState<'todas' | 'facturadas' | 'sin_facturar'>('todas');
  const [showCrearExpediente, setShowCrearExpediente] = useState(false);
  const [actuacionCreada, setActuacionCreada] = useState<ActuacionOficio | null>(null);
  const [expedienteCreado, setExpedienteCreado] = useState(false);
  const [showPDF, setShowPDF] = useState(false);
  const [selectedActuacion, setSelectedActuacion] = useState<ActuacionOficio | null>(null);

  const [newActuacion, setNewActuacion] = useState({
    turnoId: '',
    tipoActuacion: 'detenido' as TipoActuacion,
    Juzgado: '',
    numeroProcedimiento: '',
    fecha: new Date().toISOString().split('T')[0],
    horaInicio: '',
    horaFin: '',
    detenidoNombre: '',
    delito: '',
    resultado: '',
    observaciones: '',
    crearExpediente: false,
    clienteId: '',
    tipoCaso: 'penal' as string,
  });

  const filteredActuaciones = actuaciones.filter(a => {
    if (filterTipo !== 'todos' && a.tipoActuacion !== filterTipo) return false;
    if (filterFacturada === 'facturadas' && !a.Facturada) return false;
    if (filterFacturada === 'sin_facturar' && a.Facturada) return false;
    if (searchTerm) {
      const search = searchTerm.toLowerCase();
      return (
        a.detenidoNombre?.toLowerCase().includes(search) ||
        a.juzgado.toLowerCase().includes(search) ||
        a.numeroProcedimiento.toLowerCase().includes(search) ||
        a.delito?.toLowerCase().includes(search)
      );
    }
    return true;
  });

  const getTurnoForActuacion = (turnoId: string): Turno | undefined => {
    return turnos.find(t => t.id === turnoId);
  };

  const handleCreateActuacion = async () => {
    if (!newActuacion.turnoId || !newActuacion.fecha || !newActuacion.Juzgado) return;

    const actuacionData: Omit<ActuacionOficio, 'id'> = {
      turnoId: newActuacion.turnoId,
      tipoActuacion: newActuacion.tipoActuacion,
      Juzgado: newActuacion.Juzgado,
      numeroProcedimiento: newActuacion.numeroProcedimiento,
      fecha: newActuacion.fecha,
      horaInicio: newActuacion.horaInicio,
      horaFin: newActuacion.horaFin,
      detenidoNombre: newActuacion.detenidoNombre,
      delito: newActuacion.delito,
      resultado: newActuacion.resultado,
      observaciones: newActuacion.observaciones,
      Facturada: false,
    };

    const actuacion = await crearActuacion(actuacionData);
    
    if (newActuacion.crearExpediente) {
      setActuacionCreada(actuacion);
      setShowCrearExpediente(true);
    } else {
      setShowModal(false);
      resetForm();
    }
  };

  const handleCrearExpediente = async () => {
    if (!actuacionCreada) return;

    const cliente = mockClientes.find(c => c.id === newActuacion.clienteId);
    
    const nuevoExpediente = {
      id: `EXP-OF-${String(mockExpedientes.length + 1).padStart(3, '0')}`,
      title: `Asunto de Oficio - ${actuacionCreada.detenidoNombre || 'Sin nombre'}`,
      client: cliente?.nombre || actuacionCreada.detenidoNombre || 'Cliente de Oficio',
      type: 'Oficio',
      status: 'active',
    };
    
    mockExpedientes.push(nuevoExpediente);
    setExpedienteCreado(true);
    
    setTimeout(() => {
      setShowModal(false);
      setShowCrearExpediente(false);
      setActuacionCreada(null);
      setExpedienteCreado(false);
      resetForm();
    }, 2000);
  };

  const resetForm = () => {
    setNewActuacion({
      turnoId: '',
      tipoActuacion: 'detenido',
      Juzgado: '',
      numeroProcedimiento: '',
      fecha: new Date().toISOString().split('T')[0],
      horaInicio: '',
      horaFin: '',
      detenidoNombre: '',
      delito: '',
      resultado: '',
      observaciones: '',
      crearExpediente: false,
      clienteId: '',
      tipoCaso: 'penal',
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
          <h1 className="text-2xl font-bold text-theme-primary">Actuaciones de Oficio</h1>
          <p className="text-theme-muted">Registro y gestión de actuaciones en turnos de oficio</p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="flex items-center gap-2 px-4 py-2 bg-accent text-white rounded-lg hover:bg-accent/90 transition-colors"
        >
          <Plus className="w-5 h-5" />
          Nueva Actuación
        </button>
      </div>

      <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-theme-muted" />
          <input
            type="text"
            placeholder="Buscar actuaciones..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="pl-10 pr-4 py-2 bg-theme-card border border-theme rounded-lg text-theme-primary placeholder:text-theme-muted focus:outline-none focus:ring-2 focus:ring-accent"
          />
        </div>
        <div className="flex items-center gap-3">
          <select
            value={filterTipo}
            onChange={e => setFilterTipo(e.target.value as TipoActuacion | 'todos')}
            className="px-3 py-2 bg-theme-card border border-theme rounded-lg text-theme-primary focus:outline-none focus:ring-2 focus:ring-accent"
          >
            <option value="todos">Todos los tipos</option>
            {(Object.keys(TIPO_ACTUACION_LABELS) as TipoActuacion[]).map(tipo => (
              <option key={tipo} value={tipo}>{TIPO_ACTUACION_LABELS[tipo]}</option>
            ))}
          </select>
          <select
            value={filterFacturada}
            onChange={e => setFilterFacturada(e.target.value as 'todas' | 'facturadas' | 'sin_facturar')}
            className="px-3 py-2 bg-theme-card border border-theme rounded-lg text-theme-primary focus:outline-none focus:ring-2 focus:ring-accent"
          >
            <option value="todas">Todas</option>
            <option value="facturadas">Facturadas</option>
            <option value="sin_facturar">Sin facturar</option>
          </select>
        </div>
      </div>

      <div className="space-y-4">
        {filteredActuaciones.length === 0 ? (
          <div className="bg-theme-card rounded-xl border border-theme p-8 text-center">
            <FileText className="w-12 h-12 text-theme-muted mx-auto mb-3" />
            <p className="text-theme-muted">No hay actuaciones para mostrar</p>
          </div>
        ) : (
          filteredActuaciones.map(actuacion => {
            const turno = getTurnoForActuacion(actuacion.turnoId);
            const tipoLabel = TIPO_ACTUACION_LABELS[actuacion.tipoActuacion];

            return (
              <motion.div
                key={actuacion.id}
                whileHover={{ scale: 1.01 }}
                className="bg-theme-card rounded-xl border border-theme p-5"
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-4">
                    <div className={`p-3 rounded-xl ${
                      actuacion.Facturada ? 'bg-emerald-500/10' : 'bg-amber-500/10'
                    }`}>
                      {actuacion.Facturada ? (
                        <CheckCircle className="w-6 h-6 text-emerald-400" />
                      ) : (
                        <AlertCircle className="w-6 h-6 text-amber-400" />
                      )}
                    </div>
                    <div>
                      <div className="flex items-center gap-3 mb-1">
                        <h3 className="font-semibold text-theme-primary">{tipoLabel}</h3>
                        {actuacion.expedienteId && (
                          <span className="px-2 py-0.5 bg-blue-500/20 text-blue-400 rounded-full text-xs">
                            Con Expediente
                          </span>
                        )}
                        {actuacion.Facturada ? (
                          <span className="px-2 py-0.5 bg-emerald-500/20 text-emerald-400 rounded-full text-xs">
                            Facturada
                          </span>
                        ) : (
                          <span className="px-2 py-0.5 bg-amber-500/20 text-amber-400 rounded-full text-xs">
                            Sin facturar
                          </span>
                        )}
                      </div>
                      {turno && (
                        <p className="text-sm text-theme-muted">
                          {turno.abogadoNombre} • {TIPO_TURNO_CONFIG[turno.tipo]?.label}
                        </p>
                      )}
                      <div className="flex items-center gap-4 mt-2 text-sm text-theme-muted">
                        <span className="flex items-center gap-1">
                          <Building className="w-4 h-4" />
                          {actuacion.juzgado}
                        </span>
                        <span className="flex items-center gap-1">
                          <FileText className="w-4 h-4" />
                          {actuacion.numeroProcedimiento}
                        </span>
                      </div>
                      {actuacion.detenidoNombre && (
                        <div className="flex items-center gap-4 mt-2 text-sm text-theme-muted">
                          <span className="flex items-center gap-1">
                            <User className="w-4 h-4" />
                            {actuacion.detenidoNombre}
                          </span>
                          {actuacion.delito && (
                            <span className="text-red-400">
                              {actuacion.delito}
                            </span>
                          )}
                        </div>
                      )}
                      <div className="flex items-center gap-4 mt-2 text-sm text-theme-muted">
                        <span className="flex items-center gap-1">
                          <Calendar className="w-4 h-4" />
                          {actuacion.fecha}
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock className="w-4 h-4" />
                          {actuacion.horaInicio} - {actuacion.horaFin}
                        </span>
                      </div>
                      {actuacion.resultado && (
                        <p className="text-sm text-theme-muted mt-2 p-2 bg-theme-secondary/30 rounded-lg">
                          {actuacion.resultado}
                        </p>
                      )}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => {
                          setSelectedActuacion(actuacion);
                          setShowPDF(true);
                        }}
                        className="p-2 text-theme-muted hover:text-blue-400 hover:bg-blue-500/10 rounded-lg transition-colors"
                        title="Descargar hoja de asistencia"
                      >
                        <FileDown className="w-5 h-5" />
                      </button>
                    </div>
                    {actuacion.importe && (
                      <p className="text-lg font-semibold text-theme-primary mt-2">
                        {actuacion.importe.toFixed(2)} €
                      </p>
                    )}
                  </div>
                </div>
              </motion.div>
            );
          })
        )}
      </div>

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
              className="bg-theme-card rounded-xl border border-theme w-full max-w-2xl max-h-[90vh] overflow-y-auto"
              onClick={e => e.stopPropagation()}
            >
              <div className="p-4 border-b border-theme flex items-center justify-between sticky top-0 bg-theme-card z-10">
                <h3 className="text-lg font-semibold text-theme-primary">Nueva Actuación</h3>
                <button
                  onClick={() => setShowModal(false)}
                  className="p-1 text-theme-muted hover:text-theme-primary"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              
              {expedienteCreado ? (
                <div className="p-8 text-center">
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="w-16 h-16 bg-emerald-500/20 rounded-full flex items-center justify-center mx-auto mb-4"
                  >
                    <CheckCircle className="w-8 h-8 text-emerald-400" />
                  </motion.div>
                  <h4 className="text-xl font-semibold text-theme-primary mb-2">Expediente creado correctamente</h4>
                  <p className="text-theme-muted">
                    La actuación y el expediente de oficio han sido registrados.
                  </p>
                </div>
              ) : showCrearExpediente ? (
                <div className="p-4 space-y-4">
                  <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-4">
                    <h4 className="text-lg font-semibold text-theme-primary mb-2">Crear Expediente de Oficio</h4>
                    <p className="text-sm text-theme-muted mb-4">
                      Vincula esta actuación a un nuevo expediente automático.
                    </p>
                    
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm text-theme-muted mb-1">Cliente</label>
                        <select
                          value={newActuacion.clienteId}
                          onChange={e => setNewActuacion({ ...newActuacion, clienteId: e.target.value })}
                          className="w-full px-3 py-2 bg-theme-secondary/30 border border-theme rounded-lg text-theme-primary focus:outline-none focus:ring-2 focus:ring-accent"
                        >
                          <option value="">Seleccionar o crear nuevo...</option>
                          {mockClientes.map(c => (
                            <option key={c.id} value={c.id}>{c.nombre} ({c.dni})</option>
                          ))}
                        </select>
                      </div>
                      
                      <div>
                        <label className="block text-sm text-theme-muted mb-1">Tipo de Caso</label>
                        <select
                          value={newActuacion.tipoCaso}
                          onChange={e => setNewActuacion({ ...newActuacion, tipoCaso: e.target.value })}
                          className="w-full px-3 py-2 bg-theme-secondary/30 border border-theme rounded-lg text-theme-primary focus:outline-none focus:ring-2 focus:ring-accent"
                        >
                          <option value="penal">Penal</option>
                          <option value="civil">Civil</option>
                          <option value="extranjeria">Extranjería</option>
                          <option value="violencia_genero">Violencia de Género</option>
                          <option value="menores">Menores</option>
                        </select>
                      </div>

                      <div className="p-3 bg-theme-secondary/30 rounded-lg">
                        <p className="text-sm text-theme-muted mb-2">Datos que se vincularán:</p>
                        <ul className="text-sm text-theme-primary space-y-1">
                          <li><strong>Juzgado:</strong> {actuacionCreada?.juzgado}</li>
                          <li><strong>Nº Procedimiento:</strong> {actuacionCreada?.numeroProcedimiento}</li>
                          <li><strong>Cliente:</strong> {actuacionCreada?.detenidoNombre || 'Por asignar'}</li>
                          <li><strong>Tipo:</strong> Oficio</li>
                        </ul>
                      </div>
                    </div>
                  </div>

                  <div className="flex justify-end gap-3 pt-4 border-t border-theme">
                    <button
                      onClick={() => {
                        setShowCrearExpediente(false);
                        setShowModal(false);
                        resetForm();
                      }}
                      className="px-4 py-2 text-theme-muted hover:text-theme-primary transition-colors"
                    >
                      Omitir
                    </button>
                    <button
                      onClick={handleCrearExpediente}
                      className="px-4 py-2 bg-accent text-white rounded-lg hover:bg-accent/90 transition-colors"
                    >
                      Crear Expediente
                    </button>
                  </div>
                </div>
              ) : (
                <div className="p-4 space-y-4">
                  <div>
                    <label className="block text-sm text-theme-muted mb-1">Turno de Guardia</label>
                    <select
                      value={newActuacion.turnoId}
                      onChange={e => setNewActuacion({ ...newActuacion, turnoId: e.target.value })}
                      className="w-full px-3 py-2 bg-theme-secondary/30 border border-theme rounded-lg text-theme-primary focus:outline-none focus:ring-2 focus:ring-accent"
                    >
                      <option value="">Seleccionar...</option>
                      {turnos.filter(t => t.estado !== 'cancelado').map(turno => (
                        <option key={turno.id} value={turno.id}>
                          {turno.abogadoNombre} - {turno.fechaInicio} a {turno.fechaFin} ({TIPO_TURNO_CONFIG[turno.tipo]?.label})
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm text-theme-muted mb-1">Tipo de Actuación</label>
                      <select
                        value={newActuacion.tipoActuacion}
                        onChange={e => setNewActuacion({ ...newActuacion, tipoActuacion: e.target.value as TipoActuacion })}
                        className="w-full px-3 py-2 bg-theme-secondary/30 border border-theme rounded-lg text-theme-primary focus:outline-none focus:ring-2 focus:ring-accent"
                      >
                        {(Object.keys(TIPO_ACTUACION_LABELS) as TipoActuacion[]).map(tipo => (
                          <option key={tipo} value={tipo}>{TIPO_ACTUACION_LABELS[tipo]}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm text-theme-muted mb-1">Fecha</label>
                      <input
                        type="date"
                        value={newActuacion.fecha}
                        onChange={e => setNewActuacion({ ...newActuacion, fecha: e.target.value })}
                        className="w-full px-3 py-2 bg-theme-secondary/30 border border-theme rounded-lg text-theme-primary focus:outline-none focus:ring-2 focus:ring-accent"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm text-theme-muted mb-1">Juzgado / Centro</label>
                    <input
                      type="text"
                      value={newActuacion.Juzgado}
                      onChange={e => setNewActuacion({ ...newActuacion, Juzgado: e.target.value })}
                      className="w-full px-3 py-2 bg-theme-secondary/30 border border-theme rounded-lg text-theme-primary focus:outline-none focus:ring-2 focus:ring-accent"
                      placeholder="Juzgado de Guardia Madrid, Comisaría..."
                    />
                  </div>

                  <div>
                    <label className="block text-sm text-theme-muted mb-1">Número de Procedimiento</label>
                    <input
                      type="text"
                      value={newActuacion.numeroProcedimiento}
                      onChange={e => setNewActuacion({ ...newActuacion, numeroProcedimiento: e.target.value })}
                      className="w-full px-3 py-2 bg-theme-secondary/30 border border-theme rounded-lg text-theme-primary focus:outline-none focus:ring-2 focus:ring-accent"
                      placeholder="0001234/2026"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm text-theme-muted mb-1">Hora Inicio</label>
                      <input
                        type="time"
                        value={newActuacion.horaInicio}
                        onChange={e => setNewActuacion({ ...newActuacion, horaInicio: e.target.value })}
                        className="w-full px-3 py-2 bg-theme-secondary/30 border border-theme rounded-lg text-theme-primary focus:outline-none focus:ring-2 focus:ring-accent"
                      />
                    </div>
                    <div>
                      <label className="block text-sm text-theme-muted mb-1">Hora Fin</label>
                      <input
                        type="time"
                        value={newActuacion.horaFin}
                        onChange={e => setNewActuacion({ ...newActuacion, horaFin: e.target.value })}
                        className="w-full px-3 py-2 bg-theme-secondary/30 border border-theme rounded-lg text-theme-primary focus:outline-none focus:ring-2 focus:ring-accent"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm text-theme-muted mb-1">Nombre del Detenido/Cliente</label>
                      <input
                        type="text"
                        value={newActuacion.detenidoNombre}
                        onChange={e => setNewActuacion({ ...newActuacion, detenidoNombre: e.target.value })}
                        className="w-full px-3 py-2 bg-theme-secondary/30 border border-theme rounded-lg text-theme-primary focus:outline-none focus:ring-2 focus:ring-accent"
                        placeholder="Nombre completo"
                      />
                    </div>
                    <div>
                      <label className="block text-sm text-theme-muted mb-1">Delito / Motivo</label>
                      <input
                        type="text"
                        value={newActuacion.delito}
                        onChange={e => setNewActuacion({ ...newActuacion, delito: e.target.value })}
                        className="w-full px-3 py-2 bg-theme-secondary/30 border border-theme rounded-lg text-theme-primary focus:outline-none focus:ring-2 focus:ring-accent"
                        placeholder="Robo con violencia, lesiones..."
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm text-theme-muted mb-1">Resultado</label>
                    <textarea
                      value={newActuacion.resultado}
                      onChange={e => setNewActuacion({ ...newActuacion, resultado: e.target.value })}
                      rows={3}
                      className="w-full px-3 py-2 bg-theme-secondary/30 border border-theme rounded-lg text-theme-primary focus:outline-none focus:ring-2 focus:ring-accent resize-none"
                      placeholder="Resultado de la actuación..."
                    />
                  </div>

                  <div>
                    <label className="block text-sm text-theme-muted mb-1">Observaciones</label>
                    <textarea
                      value={newActuacion.observaciones}
                      onChange={e => setNewActuacion({ ...newActuacion, observaciones: e.target.value })}
                      rows={2}
                      className="w-full px-3 py-2 bg-theme-secondary/30 border border-theme rounded-lg text-theme-primary focus:outline-none focus:ring-2 focus:ring-accent resize-none"
                      placeholder="Observaciones adicionales..."
                    />
                  </div>

                  <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-4">
                    <label className="flex items-center gap-3 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={newActuacion.crearExpediente}
                        onChange={e => setNewActuacion({ ...newActuacion, crearExpediente: e.target.checked })}
                        className="w-5 h-5 rounded border-theme text-accent focus:ring-accent bg-theme-secondary/30"
                      />
                      <div>
                        <span className="text-theme-primary font-medium">Crear expediente automáticamente</span>
                        <p className="text-xs text-theme-muted">
                          Genera un nuevo expediente vinculado con tipo "oficio"
                        </p>
                      </div>
                    </label>
                  </div>

                  <div className="p-4 border-t border-theme flex justify-end gap-3">
                    <button
                      onClick={() => setShowModal(false)}
                      className="px-4 py-2 text-theme-muted hover:text-theme-primary transition-colors"
                    >
                      Cancelar
                    </button>
                    <button
                      onClick={handleCreateActuacion}
                      disabled={!newActuacion.turnoId || !newActuacion.fecha || !newActuacion.Juzgado}
                      className="px-4 py-2 bg-accent text-white rounded-lg hover:bg-accent/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Crear Actuación
                    </button>
                  </div>
                </div>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {selectedActuacion && (
        <HojaAsistenciaPDF
          actuacion={selectedActuacion}
          turno={getTurnoForActuacion(selectedActuacion.turnoId)}
          abogado={abogados.find(a => a.nombre === getTurnoForActuacion(selectedActuacion.turnoId)?.abogadoNombre)}
          isOpen={showPDF}
          onClose={() => {
            setShowPDF(false);
            setSelectedActuacion(null);
          }}
        />
      )}
    </div>
  );
}

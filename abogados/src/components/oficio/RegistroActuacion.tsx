import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Save, X, Clock, Building2, FileText, User, AlertCircle } from 'lucide-react';
import type { ActuacionOficio, TipoActuacion, Turno } from '@/types/oficio';
import { TIPO_ACTUACION_LABELS } from '@/types/oficio';

interface RegistroActuacionProps {
  turnos: Turno[];
  onSubmit: (data: Omit<ActuacionOficio, 'id' | 'expedienteId' | 'importe' | 'Facturada'>) => Promise<void>;
  onClose: () => void;
  isSubmitting?: boolean;
}

const tiposActuacion: TipoActuacion[] = [
  'detenido',
  'declaracion',
  'juicio_rapido',
  'orden_proteccion',
  'asistencia_detencion',
  'reconocimiento',
  'recursos',
  'otro',
];

export default function RegistroActuacion({
  turnos,
  onSubmit,
  onClose,
  isSubmitting = false,
}: RegistroActuacionProps) {
  const [formData, setFormData] = useState({
    turnoId: '',
    tipoActuacion: '' as TipoActuacion | '',
    juzgado: '',
    numeroProcedimiento: '',
    fecha: new Date().toISOString().split('T')[0],
    horaInicio: '',
    horaFin: '',
    detenidoNombre: '',
    delito: '',
    resultado: '',
    observaciones: '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    
    if (!formData.turnoId) newErrors.turnoId = 'Selecciona un turno';
    if (!formData.tipoActuacion) newErrors.tipoActuacion = 'Selecciona el tipo de actuación';
    if (!formData.juzgado) newErrors.juzgado = 'Indica el juzgado';
    if (!formData.numeroProcedimiento) newErrors.numeroProcedimiento = 'Indica el número de procedimiento';
    if (!formData.fecha) newErrors.fecha = 'Indica la fecha';
    if (!formData.horaInicio) newErrors.horaInicio = 'Indica la hora de inicio';
    if (!formData.horaFin) newErrors.horaFin = 'Indica la hora de fin';
    if (!formData.resultado) newErrors.resultado = 'Indica el resultado';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    await onSubmit({
      turnoId: formData.turnoId,
      tipoActuacion: formData.tipoActuacion as TipoActuacion,
      juzgado: formData.juzgado,
      numeroProcedimiento: formData.numeroProcedimiento,
      fecha: formData.fecha,
      horaInicio: formData.horaInicio,
      horaFin: formData.horaFin,
      detenidoNombre: formData.detenidoNombre || undefined,
      delito: formData.delito || undefined,
      resultado: formData.resultado,
      observaciones: formData.observaciones || undefined,
    });
  };

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-end sm:items-center justify-center p-0 sm:p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ y: '100%' }}
          animate={{ y: 0 }}
          exit={{ y: '100%' }}
          transition={{ type: 'spring', damping: 25, stiffness: 300 }}
          className="bg-theme-card w-full sm:max-w-lg sm:rounded-2xl max-h-[90vh] overflow-y-auto rounded-t-2xl"
          onClick={e => e.stopPropagation()}
        >
          <div className="sticky top-0 bg-theme-card border-b border-theme p-4 flex items-center justify-between z-10">
            <h2 className="text-lg font-semibold text-theme-primary">
              Nueva Actuación de Oficio
            </h2>
            <button
              onClick={onClose}
              className="p-2 text-theme-muted hover:text-theme-primary hover:bg-theme-tertiary rounded-lg transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="p-4 space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="sm:col-span-2">
                <label className="block text-sm font-medium text-theme-secondary mb-1.5">
                  Turno *
                </label>
                <select
                  value={formData.turnoId}
                  onChange={e => handleChange('turnoId', e.target.value)}
                  className={`w-full px-3 py-2.5 bg-theme-secondary border rounded-lg text-theme-primary text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                    errors.turnoId ? 'border-red-500' : 'border-theme'
                  }`}
                >
                  <option value="">Seleccionar turno...</option>
                  {turnos.map(turno => (
                    <option key={turno.id} value={turno.id}>
                      {turno.tipo.toUpperCase()} - {turno.partidoJudicial} ({turno.fechaInicio})
                    </option>
                  ))}
                </select>
                {errors.turnoId && (
                  <p className="text-red-400 text-xs mt-1">{errors.turnoId}</p>
                )}
              </div>

              <div className="sm:col-span-2">
                <label className="block text-sm font-medium text-theme-secondary mb-1.5">
                  Tipo de Actuación *
                </label>
                <select
                  value={formData.tipoActuacion}
                  onChange={e => handleChange('tipoActuacion', e.target.value)}
                  className={`w-full px-3 py-2.5 bg-theme-secondary border rounded-lg text-theme-primary text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                    errors.tipoActuacion ? 'border-red-500' : 'border-theme'
                  }`}
                >
                  <option value="">Seleccionar tipo...</option>
                  {tiposActuacion.map(tipo => (
                    <option key={tipo} value={tipo}>
                      {TIPO_ACTUACION_LABELS[tipo]}
                    </option>
                  ))}
                </select>
                {errors.tipoActuacion && (
                  <p className="text-red-400 text-xs mt-1">{errors.tipoActuacion}</p>
                )}
              </div>

              <div className="sm:col-span-2">
                <label className="block text-sm font-medium text-theme-secondary mb-1.5">
                  <Building2 className="w-4 h-4 inline mr-1" />
                  Juzgado *
                </label>
                <input
                  type="text"
                  value={formData.juzgado}
                  onChange={e => handleChange('juzgado', e.target.value)}
                  placeholder="Juzgado de Guardia Madrid"
                  className={`w-full px-3 py-2.5 bg-theme-secondary border rounded-lg text-theme-primary text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                    errors.juzgado ? 'border-red-500' : 'border-theme'
                  }`}
                />
                {errors.juzgado && (
                  <p className="text-red-400 text-xs mt-1">{errors.juzgado}</p>
                )}
              </div>

              <div className="sm:col-span-2">
                <label className="block text-sm font-medium text-theme-secondary mb-1.5">
                  <FileText className="w-4 h-4 inline mr-1" />
                  Número de Procedimiento *
                </label>
                <input
                  type="text"
                  value={formData.numeroProcedimiento}
                  onChange={e => handleChange('numeroProcedimiento', e.target.value)}
                  placeholder="0001234/2026"
                  className={`w-full px-3 py-2.5 bg-theme-secondary border rounded-lg text-theme-primary text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                    errors.numeroProcedimiento ? 'border-red-500' : 'border-theme'
                  }`}
                />
                {errors.numeroProcedimiento && (
                  <p className="text-red-400 text-xs mt-1">{errors.numeroProcedimiento}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-theme-secondary mb-1.5">
                  Fecha *
                </label>
                <input
                  type="date"
                  value={formData.fecha}
                  onChange={e => handleChange('fecha', e.target.value)}
                  className={`w-full px-3 py-2.5 bg-theme-secondary border rounded-lg text-theme-primary text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                    errors.fecha ? 'border-red-500' : 'border-theme'
                  }`}
                />
                {errors.fecha && (
                  <p className="text-red-400 text-xs mt-1">{errors.fecha}</p>
                )}
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-sm font-medium text-theme-secondary mb-1.5">
                    <Clock className="w-4 h-4 inline mr-1" />
                    Inicio *
                  </label>
                  <input
                    type="time"
                    value={formData.horaInicio}
                    onChange={e => handleChange('horaInicio', e.target.value)}
                    className={`w-full px-3 py-2.5 bg-theme-secondary border rounded-lg text-theme-primary text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                      errors.horaInicio ? 'border-red-500' : 'border-theme'
                    }`}
                  />
                  {errors.horaInicio && (
                    <p className="text-red-400 text-xs mt-1">{errors.horaInicio}</p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-theme-secondary mb-1.5">
                    <Clock className="w-4 h-4 inline mr-1" />
                    Fin *
                  </label>
                  <input
                    type="time"
                    value={formData.horaFin}
                    onChange={e => handleChange('horaFin', e.target.value)}
                    className={`w-full px-3 py-2.5 bg-theme-secondary border rounded-lg text-theme-primary text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                      errors.horaFin ? 'border-red-500' : 'border-theme'
                    }`}
                  />
                  {errors.horaFin && (
                    <p className="text-red-400 text-xs mt-1">{errors.horaFin}</p>
                  )}
                </div>
              </div>

              <div className="sm:col-span-2">
                <label className="block text-sm font-medium text-theme-secondary mb-1.5">
                  <User className="w-4 h-4 inline mr-1" />
                  Nombre del Detenido/Cliente
                </label>
                <input
                  type="text"
                  value={formData.detenidoNombre}
                  onChange={e => handleChange('detenidoNombre', e.target.value)}
                  placeholder="Nombre completo"
                  className="w-full px-3 py-2.5 bg-theme-secondary border border-theme rounded-lg text-theme-primary text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block text-sm font-medium text-theme-secondary mb-1.5">
                  <AlertCircle className="w-4 h-4 inline mr-1" />
                  Delito
                </label>
                <input
                  type="text"
                  value={formData.delito}
                  onChange={e => handleChange('delito', e.target.value)}
                  placeholder="Robo con violencia"
                  className="w-full px-3 py-2.5 bg-theme-secondary border border-theme rounded-lg text-theme-primary text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block text-sm font-medium text-theme-secondary mb-1.5">
                  Resultado *
                </label>
                <textarea
                  value={formData.resultado}
                  onChange={e => handleChange('resultado', e.target.value)}
                  placeholder="Resultado de la actuación..."
                  rows={3}
                  className={`w-full px-3 py-2.5 bg-theme-secondary border rounded-lg text-theme-primary text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none ${
                    errors.resultado ? 'border-red-500' : 'border-theme'
                  }`}
                />
                {errors.resultado && (
                  <p className="text-red-400 text-xs mt-1">{errors.resultado}</p>
                )}
              </div>

              <div className="sm:col-span-2">
                <label className="block text-sm font-medium text-theme-secondary mb-1.5">
                  Observaciones
                </label>
                <textarea
                  value={formData.observaciones}
                  onChange={e => handleChange('observaciones', e.target.value)}
                  placeholder="Notas adicionales..."
                  rows={2}
                  className="w-full px-3 py-2.5 bg-theme-secondary border border-theme rounded-lg text-theme-primary text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                />
              </div>
            </div>

            <div className="flex gap-3 pt-4 border-t border-theme">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 px-4 py-2.5 text-theme-muted hover:text-theme-primary hover:bg-theme-tertiary rounded-lg transition-colors text-sm font-medium"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-800 text-white rounded-lg transition-colors text-sm font-medium"
              >
                {isSubmitting ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Guardando...
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4" />
                    Guardar
                  </>
                )}
              </button>
            </div>
          </form>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

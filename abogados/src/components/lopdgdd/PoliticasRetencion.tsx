import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Plus, Pencil, Trash2, Clock, Archive, 
  AlertTriangle, CheckCircle, X, FileText
} from 'lucide-react';
import { ResponsiveTable } from '../ui/ResponsiveTable';
import { Button } from '../ui/Button';

export interface PoliticaRetencion {
  id: string;
  categoriaDatos: string;
  actividadTratamiento: string;
  plazoConservacion: string;
  unidadTiempo: 'dias' | 'meses' | 'anos' | 'indefinido';
  fundamento: string;
  accionFinPlazo: 'supresion' | 'anonimizacion' | 'bloqueo' | 'conservacion';
  responsable: string;
  revisionAutomatica: boolean;
  cumplimientoNormativo: string[];
  observaciones: string;
}

const initialPoliticas: PoliticaRetencion[] = [
  {
    id: '1',
    categoriaDatos: 'Datos fiscales y contables',
    actividadTratamiento: 'Gestión contable y fiscal',
    plazoConservacion: '6',
    unidadTiempo: 'anos',
    fundamento: 'Ley General Tributaria art. 66 bis',
    accionFinPlazo: 'conservacion',
    responsable: 'Departamento de Contabilidad',
    revisionAutomatica: true,
    cumplimientoNormativo: ['LGT', 'Código de Comercio', 'Ley de Sociedades'],
    observaciones: 'Conservación por obligación legal. No procede eliminación.'
  },
  {
    id: '2',
    categoriaDatos: 'Curriculum vitae',
    actividadTratamiento: 'Selección de personal',
    plazoConservacion: '1',
    unidadTiempo: 'anos',
    fundamento: 'Interés legítimo del responsable',
    accionFinPlazo: 'supresion',
    responsable: 'Departamento de RRHH',
    revisionAutomatica: true,
    cumplimientoNormativo: ['RGPD', 'LOPDGDD'],
    observaciones: 'Eliminar tras 12 meses desde última entrevista'
  },
  {
    id: '3',
    categoriaDatos: 'Grabaciones de videovigilancia',
    actividadTratamiento: 'Videovigilancia',
    plazoConservacion: '30',
    unidadTiempo: 'dias',
    fundamento: 'Interés legítimo (seguridad)',
    accionFinPlazo: 'supresion',
    responsable: 'Departamento de Seguridad',
    revisionAutomatica: true,
    cumplimientoNormativo: ['LOPDGDD', 'Instrucción DGT'],
    observaciones: 'Eliminación automática tras 30 días'
  },
  {
    id: '4',
    categoriaDatos: 'Datos de clientes',
    actividadTratamiento: 'Gestión de clientes',
    plazoConservacion: '5',
    unidadTiempo: 'anos',
    fundamento: 'Ejecución de contrato',
    accionFinPlazo: 'supresion',
    responsable: 'Departamento Comercial',
    revisionAutomatica: false,
    cumplimientoNormativo: ['RGPD', 'Código de Comercio'],
    observaciones: 'Conservación durante relación contractual + plazo legal'
  },
  {
    id: '5',
    categoriaDatos: 'Comunicaciones comerciales',
    actividadTratamiento: 'Marketing',
    plazoConservacion: '0',
    unidadTiempo: 'indefinido',
    fundamento: 'Consentimiento del interesado',
    accionFinPlazo: 'supresion',
    responsable: 'Departamento de Marketing',
    revisionAutomatica: true,
    cumplimientoNormativo: ['RGPD', 'LSSICE'],
    observaciones: 'Eliminar inmediatamente al revoke el consentimiento'
  },
  {
    id: '6',
    categoriaDatos: 'Datos de empleados',
    actividadTratamiento: 'Gestión de recursos humanos',
    plazoConservacion: '3',
    unidadTiempo: 'anos',
    fundamento: 'Ejecución de contrato laboral',
    accionFinPlazo: 'bloqueo',
    responsable: 'Departamento de RRHH',
    revisionAutomatica: false,
    cumplimientoNormativo: ['RGPD', 'Estatuto de los Trabajadores'],
    observaciones: 'Conservación bloqueada para posibles reclamaciones laborales'
  }
];

interface PoliticasRetencionProps {
  editable?: boolean;
}

export function PoliticasRetencion({ editable = true }: PoliticasRetencionProps) {
  const [politicas, setPoliticas] = useState<PoliticaRetencion[]>(initialPoliticas);
  const [showModal, setShowModal] = useState(false);
  const [editingPolitica, setEditingPolitica] = useState<PoliticaRetencion | null>(null);

  const handleDelete = (id: string) => {
    setPoliticas(prev => prev.filter(p => p.id !== id));
  };

  const handleEdit = (politica: PoliticaRetencion) => {
    setEditingPolitica({ ...politica });
    setShowModal(true);
  };

  const handleAdd = () => {
    const newPolitica: PoliticaRetencion = {
      id: Date.now().toString(),
      categoriaDatos: '',
      actividadTratamiento: '',
      plazoConservacion: '',
      unidadTiempo: 'meses',
      fundamento: '',
      accionFinPlazo: 'supresion',
      responsable: '',
      revisionAutomatica: false,
      cumplimientoNormativo: [],
      observaciones: ''
    };
    setEditingPolitica(newPolitica);
    setShowModal(true);
  };

  const handleSave = () => {
    if (editingPolitica) {
      const exists = politicas.find(p => p.id === editingPolitica.id);
      if (exists) {
        setPoliticas(prev => prev.map(p => p.id === editingPolitica.id ? editingPolitica : p));
      } else {
        setPoliticas(prev => [...prev, editingPolitica]);
      }
    }
    setShowModal(false);
    setEditingPolitica(null);
  };

  const getAccionColor = (accion: string) => {
    switch (accion) {
      case 'supresion': return 'bg-red-500/20 text-red-600 dark:text-red-400';
      case 'anonimizacion': return 'bg-blue-500/20 text-blue-600 dark:text-blue-400';
      case 'bloqueo': return 'bg-amber-500/20 text-amber-600 dark:text-amber-400';
      case 'conservacion': return 'bg-emerald-500/20 text-emerald-600 dark:text-emerald-400';
      default: return 'bg-gray-500/20 text-gray-600';
    }
  };

  const getAccionLabel = (accion: string) => {
    switch (accion) {
      case 'supresion': return 'Supresión';
      case 'anonimizacion': return 'Anonimización';
      case 'bloqueo': return 'Bloqueo';
      case 'conservacion': return 'Conservación';
      default: return accion;
    }
  };

  const formatPlazo = (politica: PoliticaRetencion) => {
    if (politica.unidadTiempo === 'indefinido') return 'Indefinido';
    return `${politica.plazoConservacion} ${politica.unidadTiempo}`;
  };

  const columns = [
    {
      key: 'categoriaDatos',
      header: 'Categoría de Datos',
      render: (item: PoliticaRetencion) => (
        <div className="font-medium text-theme-primary">{item.categoriaDatos}</div>
      )
    },
    {
      key: 'actividadTratamiento',
      header: 'Actividad de Tratamiento',
      render: (item: PoliticaRetencion) => (
        <div className="text-sm text-theme-secondary">{item.actividadTratamiento}</div>
      )
    },
    {
      key: 'plazo',
      header: 'Plazo de Conservación',
      render: (item: PoliticaRetencion) => (
        <div className="flex items-center gap-2">
          <Clock className="w-4 h-4 text-theme-muted" />
          <span className="text-theme-primary">{formatPlazo(item)}</span>
        </div>
      )
    },
    {
      key: 'accionFinPlazo',
      header: 'Acción Final',
      render: (item: PoliticaRetencion) => (
        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getAccionColor(item.accionFinPlazo)}`}>
          {getAccionLabel(item.accionFinPlazo)}
        </span>
      )
    },
    {
      key: 'revisionAutomatica',
      header: 'Revisión Auto.',
      render: (item: PoliticaRetencion) => (
        item.revisionAutomatica ? (
          <CheckCircle className="w-5 h-5 text-emerald-500" />
        ) : (
          <AlertTriangle className="w-5 h-5 text-amber-500" />
        )
      )
    },
    {
      key: 'acciones',
      header: '',
      className: 'w-20'
    }
  ];

  const actions = editable ? [
    {
      icon: Pencil,
      label: 'Editar',
      onClick: (item: PoliticaRetencion) => handleEdit(item)
    },
    {
      icon: Trash2,
      label: 'Eliminar',
      onClick: (item: PoliticaRetencion) => handleDelete(item.id)
    }
  ] : undefined;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-theme-primary">Políticas de Retención de Datos</h2>
          <p className="text-theme-secondary mt-1">
            Definición de plazos de conservación y acciones al vencimiento
          </p>
        </div>
        {editable && (
          <Button onClick={handleAdd} leftIcon={Plus}>
            Nueva Política
          </Button>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-theme-card border border-theme rounded-xl p-4"
        >
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-500/20 rounded-lg">
              <Archive className="w-5 h-5 text-blue-500" />
            </div>
            <div>
              <p className="text-2xl font-bold text-theme-primary">{politicas.length}</p>
              <p className="text-sm text-theme-muted">Políticas</p>
            </div>
          </div>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-theme-card border border-theme rounded-xl p-4"
        >
          <div className="flex items-center gap-3">
            <div className="p-2 bg-emerald-500/20 rounded-lg">
              <CheckCircle className="w-5 h-5 text-emerald-500" />
            </div>
            <div>
              <p className="text-2xl font-bold text-theme-primary">
                {politicas.filter(p => p.revisionAutomatica).length}
              </p>
              <p className="text-sm text-theme-muted">Revisión Automática</p>
            </div>
          </div>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-theme-card border border-theme rounded-xl p-4"
        >
          <div className="flex items-center gap-3">
            <div className="p-2 bg-amber-500/20 rounded-lg">
              <Clock className="w-5 h-5 text-amber-500" />
            </div>
            <div>
              <p className="text-2xl font-bold text-theme-primary">
                {politicas.filter(p => p.unidadTiempo !== 'indefinido').length}
              </p>
              <p className="text-sm text-theme-muted">Plazo Definido</p>
            </div>
          </div>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-theme-card border border-theme rounded-xl p-4"
        >
          <div className="flex items-center gap-3">
            <div className="p-2 bg-purple-500/20 rounded-lg">
              <FileText className="w-5 h-5 text-purple-500" />
            </div>
            <div>
              <p className="text-2xl font-bold text-theme-primary">
                {new Set(politicas.flatMap(p => p.cumplimientoNormativo)).size}
              </p>
              <p className="text-sm text-theme-muted">Normativas</p>
            </div>
          </div>
        </motion.div>
      </div>

      <div className="bg-theme-card border border-theme rounded-xl overflow-hidden">
        <ResponsiveTable
          data={politicas}
          columns={columns}
          keyExtractor={(item) => item.id}
          actions={actions}
          emptyMessage="No hay políticas de retención registradas"
        />
      </div>

      <AnimatePresence>
        {showModal && editingPolitica && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50"
            onClick={() => setShowModal(false)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-theme-card border border-theme rounded-2xl w-full max-w-3xl max-h-[90vh] overflow-y-auto"
              onClick={e => e.stopPropagation()}
            >
              <div className="sticky top-0 bg-theme-card border-b border-theme p-4 flex items-center justify-between">
                <h3 className="text-lg font-semibold text-theme-primary">
                  {politicas.find(p => p.id === editingPolitica.id) ? 'Editar' : 'Nueva'} Política de Retención
                </h3>
                <button
                  onClick={() => setShowModal(false)}
                  className="p-2 hover:bg-theme-tertiary rounded-lg transition-colors"
                >
                  <X className="w-5 h-5 text-theme-muted" />
                </button>
              </div>

              <div className="p-6 space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-theme-secondary mb-2">
                      Categoría de Datos *
                    </label>
                    <input
                      type="text"
                      value={editingPolitica.categoriaDatos}
                      onChange={e => setEditingPolitica({ ...editingPolitica, categoriaDatos: e.target.value })}
                      className="w-full px-4 py-2 bg-theme-tertiary border border-theme rounded-xl text-theme-primary focus:outline-none focus:ring-2 focus:ring-accent"
                      placeholder="ej. Datos fiscales"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-theme-secondary mb-2">
                      Actividad de Tratamiento
                    </label>
                    <input
                      type="text"
                      value={editingPolitica.actividadTratamiento}
                      onChange={e => setEditingPolitica({ ...editingPolitica, actividadTratamiento: e.target.value })}
                      className="w-full px-4 py-2 bg-theme-tertiary border border-theme rounded-xl text-theme-primary focus:outline-none focus:ring-2 focus:ring-accent"
                      placeholder="ej. Gestión contable"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-theme-secondary mb-2">
                      Plazo de Conservación
                    </label>
                    <input
                      type="number"
                      min="0"
                      value={editingPolitica.plazoConservacion}
                      onChange={e => setEditingPolitica({ ...editingPolitica, plazoConservacion: e.target.value })}
                      className="w-full px-4 py-2 bg-theme-tertiary border border-theme rounded-xl text-theme-primary focus:outline-none focus:ring-2 focus:ring-accent"
                      placeholder="0"
                      disabled={editingPolitica.unidadTiempo === 'indefinido'}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-theme-secondary mb-2">
                      Unidad de Tiempo
                    </label>
                    <select
                      value={editingPolitica.unidadTiempo}
                      onChange={e => setEditingPolitica({ ...editingPolitica, unidadTiempo: e.target.value as PoliticaRetencion['unidadTiempo'] })}
                      className="w-full px-4 py-2 bg-theme-tertiary border border-theme rounded-xl text-theme-primary focus:outline-none focus:ring-2 focus:ring-accent"
                    >
                      <option value="dias">Días</option>
                      <option value="meses">Meses</option>
                      <option value="anos">Años</option>
                      <option value="indefinido">Indefinido</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-theme-secondary mb-2">
                      Acción al Fin del Plazo
                    </label>
                    <select
                      value={editingPolitica.accionFinPlazo}
                      onChange={e => setEditingPolitica({ ...editingPolitica, accionFinPlazo: e.target.value as PoliticaRetencion['accionFinPlazo'] })}
                      className="w-full px-4 py-2 bg-theme-tertiary border border-theme rounded-xl text-theme-primary focus:outline-none focus:ring-2 focus:ring-accent"
                    >
                      <option value="supresion">Supresión</option>
                      <option value="anonimizacion">Anonimización</option>
                      <option value="bloqueo">Bloqueo</option>
                      <option value="conservacion">Conservación</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-theme-secondary mb-2">
                    Fundamento Legal *
                  </label>
                  <input
                    type="text"
                    value={editingPolitica.fundamento}
                    onChange={e => setEditingPolitica({ ...editingPolitica, fundamento: e.target.value })}
                    className="w-full px-4 py-2 bg-theme-tertiary border border-theme rounded-xl text-theme-primary focus:outline-none focus:ring-2 focus:ring-accent"
                    placeholder="ej. Ley General Tributaria art. 66 bis"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-theme-secondary mb-2">
                      Responsable
                    </label>
                    <input
                      type="text"
                      value={editingPolitica.responsable}
                      onChange={e => setEditingPolitica({ ...editingPolitica, responsable: e.target.value })}
                      className="w-full px-4 py-2 bg-theme-tertiary border border-theme rounded-xl text-theme-primary focus:outline-none focus:ring-2 focus:ring-accent"
                      placeholder="ej. Departamento de Contabilidad"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-theme-secondary mb-2">
                      Revisión Automática
                    </label>
                    <div className="flex items-center gap-3 h-[42px]">
                      <input
                        type="checkbox"
                        id="revisionAutomatica"
                        checked={editingPolitica.revisionAutomatica}
                        onChange={e => setEditingPolitica({ ...editingPolitica, revisionAutomatica: e.target.checked })}
                        className="w-5 h-5 rounded border-theme text-accent focus:ring-accent"
                      />
                      <label htmlFor="revisionAutomatica" className="text-theme-secondary">
                        Habilitar eliminación automática
                      </label>
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-theme-secondary mb-2">
                    Normativa de Cumplimiento (separadas por coma)
                  </label>
                  <input
                    type="text"
                    value={editingPolitica.cumplimientoNormativo.join(', ')}
                    onChange={e => setEditingPolitica({ 
                      ...editingPolitica, 
                      cumplimientoNormativo: e.target.value.split(',').map(s => s.trim()).filter(Boolean)
                    })}
                    className="w-full px-4 py-2 bg-theme-tertiary border border-theme rounded-xl text-theme-primary focus:outline-none focus:ring-2 focus:ring-accent"
                    placeholder="ej. RGPD, LOPDGDD, LGT"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-theme-secondary mb-2">
                    Observaciones
                  </label>
                  <textarea
                    value={editingPolitica.observaciones}
                    onChange={e => setEditingPolitica({ ...editingPolitica, observaciones: e.target.value })}
                    className="w-full px-4 py-2 bg-theme-tertiary border border-theme rounded-xl text-theme-primary focus:outline-none focus:ring-2 focus:ring-accent h-24 resize-none"
                    placeholder="Observaciones adicionales sobre la política de retención..."
                  />
                </div>
              </div>

              <div className="sticky bottom-0 bg-theme-card border-t border-theme p-4 flex justify-end gap-3">
                <Button variant="secondary" onClick={() => setShowModal(false)}>
                  Cancelar
                </Button>
                <Button onClick={handleSave}>
                  Guardar
                </Button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default PoliticasRetencion;

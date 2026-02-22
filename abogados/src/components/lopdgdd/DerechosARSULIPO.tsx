import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Plus, Pencil, Trash2, Eye, Edit3, Trash, 
  Shield, Download, Ban, CheckCircle, X, 
  Clock, User, FileText, AlertTriangle
} from 'lucide-react';
import { ResponsiveTable } from '../ui/ResponsiveTable';
import { Button } from '../ui/Button';

export interface Derecho {
  id: string;
  nombre: string;
  descripcion: string;
  fundamento: string;
  plazoRespuesta: number;
  gratuito: boolean;
  requiereIdentificacion: boolean;
  afectaActividades: string[];
  observaciones: string;
  activo: boolean;
  fechaCreacion: string;
  ultimaModificacion: string;
}

export type TipoDerecho = 'acceso' | 'rectificacion' | 'supresion' | 'limitacion' | 'portabilidad' | 'oposicion';

const initialDerechos: Derecho[] = [
  {
    id: '1',
    nombre: 'Acceso',
    descripcion: 'Derecho a obtener confirmación de si se están tratando sus datos personales y a acceder a los mismos',
    fundamento: 'Art. 15 RGPD / Art. 13 LOPDGDD',
    plazoRespuesta: 30,
    gratuito: true,
    requiereIdentificacion: true,
    afectaActividades: ['Gestión de clientes', 'Recursos humanos'],
    observaciones: 'El responsable debe proporcionar copia gratuita de los datos en formato electrónico',
    activo: true,
    fechaCreacion: '2024-01-15',
    ultimaModificacion: '2024-01-15'
  },
  {
    id: '2',
    nombre: 'Rectificación',
    descripcion: 'Derecho a obtener la rectificación de los datos personales inexactos o incompletos',
    fundamento: 'Art. 16 RGPD / Art. 14 LOPDGDD',
    plazoRespuesta: 30,
    gratuito: true,
    requiereIdentificacion: true,
    afectaActividades: ['Gestión de clientes', 'Comunicaciones comerciales'],
    observaciones: 'Debe completarse en el menor tiempo posible',
    activo: true,
    fechaCreacion: '2024-01-15',
    ultimaModificacion: '2024-02-20'
  },
  {
    id: '3',
    nombre: 'Supresión',
    descripcion: 'Derecho a obtener la supresión de los datos personales (derecho al olvido)',
    fundamento: 'Art. 17 RGPD / Art. 15 LOPDGDD',
    plazoRespuesta: 30,
    gratuito: true,
    requiereIdentificacion: true,
    afectaActividades: ['Videovigilancia', 'Comunicaciones comerciales'],
    observaciones: 'No procede cuando existe obligación legal de conservación',
    activo: true,
    fechaCreacion: '2024-01-15',
    ultimaModificacion: '2024-01-15'
  },
  {
    id: '4',
    nombre: 'Limitación',
    descripcion: 'Derecho a obtener la limitación del tratamiento de los datos',
    fundamento: 'Art. 18 RGPD / Art. 16 LOPDGDD',
    plazoRespuesta: 30,
    gratuito: true,
    requiereIdentificacion: true,
    afectaActividades: ['Gestión de clientes'],
    observaciones: 'Los datos solo pueden conservarse para el ejercicio de reclamaciones',
    activo: true,
    fechaCreacion: '2024-01-15',
    ultimaModificacion: '2024-01-15'
  },
  {
    id: '5',
    nombre: 'Portabilidad',
    descripcion: 'Derecho a recibir los datos personales en un formato estructurado y transferirlos a otro responsable',
    fundamento: 'Art. 20 RGPD / Art. 17 LOPDGDD',
    plazoRespuesta: 30,
    gratuito: true,
    requiereIdentificacion: true,
    afectaActividades: ['Gestión de clientes'],
    observaciones: 'Solo aplica a datos facilitados por el interesado y tratados automáticamente',
    activo: true,
    fechaCreacion: '2024-01-15',
    ultimaModificacion: '2024-01-15'
  },
  {
    id: '6',
    nombre: 'Oposición',
    descripcion: 'Derecho a oponerse al tratamiento de los datos personales',
    fundamento: 'Art. 21 RGPD / Art. 18 LOPDGDD',
    plazoRespuesta: 30,
    gratuito: true,
    requiereIdentificacion: true,
    afectaActividades: ['Comunicaciones comerciales', 'Cookies analíticas'],
    observaciones: 'El responsable debe cesar el tratamiento salvo motivos legítimos imperiosos',
    activo: true,
    fechaCreacion: '2024-01-15',
    ultimaModificacion: '2024-01-15'
  }
];

interface DerechosProps {
  editable?: boolean;
}

export function DerechosARSULIPO({ editable = true }: DerechosProps) {
  const [derechos, setDerechos] = useState<Derecho[]>(initialDerechos);
  const [showModal, setShowModal] = useState(false);
  const [editingDerecho, setEditingDerecho] = useState<Derecho | null>(null);
  const [filtroEstado, setFiltroEstado] = useState<string>('todos');

  const derechosFiltrados = useMemo(() => {
    return derechos.filter(d => {
      if (filtroEstado === 'todos') return true;
      if (filtroEstado === 'activo') return d.activo;
      if (filtroEstado === 'inactivo') return !d.activo;
      return true;
    });
  }, [derechos, filtroEstado]);

  const handleDelete = (id: string) => {
    setDerechos(prev => prev.filter(d => d.id !== id));
  };

  const handleEdit = (derecho: Derecho) => {
    setEditingDerecho({ ...derecho });
    setShowModal(true);
  };

  const handleAdd = () => {
    const today = new Date().toISOString().split('T')[0];
    const newDerecho: Derecho = {
      id: Date.now().toString(),
      nombre: '',
      descripcion: '',
      fundamento: '',
      plazoRespuesta: 30,
      gratuito: true,
      requiereIdentificacion: true,
      afectaActividades: [],
      observaciones: '',
      activo: true,
      fechaCreacion: today,
      ultimaModificacion: today
    };
    setEditingDerecho(newDerecho);
    setShowModal(true);
  };

  const handleSave = () => {
    if (editingDerecho) {
      editingDerecho.ultimaModificacion = new Date().toISOString().split('T')[0];
      const exists = derechos.find(d => d.id === editingDerecho.id);
      if (exists) {
        setDerechos(prev => prev.map(d => d.id === editingDerecho.id ? editingDerecho : d));
      } else {
        setDerechos(prev => [...prev, editingDerecho]);
      }
    }
    setShowModal(false);
    setEditingDerecho(null);
  };

  const getDerechoIcon = (nombre: string) => {
    switch (nombre.toLowerCase()) {
      case 'acceso': return <Eye className="w-5 h-5" />;
      case 'rectificacion': return <Edit3 className="w-5 h-5" />;
      case 'supresion': return <Trash className="w-5 h-5" />;
      case 'limitacion': return <Shield className="w-5 h-5" />;
      case 'portabilidad': return <Download className="w-5 h-5" />;
      case 'oposicion': return <Ban className="w-5 h-5" />;
      default: return <User className="w-5 h-5" />;
    }
  };

  const getDerechoColor = (nombre: string) => {
    switch (nombre.toLowerCase()) {
      case 'acceso': return 'bg-blue-500/20 text-blue-600 dark:text-blue-400';
      case 'rectificacion': return 'bg-emerald-500/20 text-emerald-600 dark:text-emerald-400';
      case 'supresion': return 'bg-red-500/20 text-red-600 dark:text-red-400';
      case 'limitacion': return 'bg-amber-500/20 text-amber-600 dark:text-amber-400';
      case 'portabilidad': return 'bg-purple-500/20 text-purple-600 dark:text-purple-400';
      case 'oposicion': return 'bg-orange-500/20 text-orange-600 dark:text-orange-400';
      default: return 'bg-gray-500/20 text-gray-600 dark:text-gray-400';
    }
  };

  const columns = [
    {
      key: 'nombre',
      header: 'Derecho',
      render: (item: Derecho) => (
        <div className="flex items-center gap-3">
          <div className={`p-2 rounded-lg ${getDerechoColor(item.nombre)}`}>
            {getDerechoIcon(item.nombre)}
          </div>
          <div>
            <div className="font-medium text-theme-primary">{item.nombre}</div>
            <div className="text-xs text-theme-muted">{item.fundamento}</div>
          </div>
        </div>
      )
    },
    {
      key: 'descripcion',
      header: 'Descripción',
      render: (item: Derecho) => (
        <div className="text-sm text-theme-secondary line-clamp-2">{item.descripcion}</div>
      )
    },
    {
      key: 'plazoRespuesta',
      header: 'Plazo',
      render: (item: Derecho) => (
        <div className="flex items-center gap-1 text-theme-secondary">
          <Clock className="w-4 h-4" />
          <span>{item.plazoRespuesta} días</span>
        </div>
      )
    },
    {
      key: 'gratuito',
      header: 'Gratuito',
      render: (item: Derecho) => (
        item.gratuito ? (
          <span className="flex items-center gap-1 text-emerald-500 text-sm">
            <CheckCircle className="w-4 h-4" /> Sí
          </span>
        ) : (
          <span className="flex items-center gap-1 text-amber-500 text-sm">
            <AlertTriangle className="w-4 h-4" /> No
          </span>
        )
      )
    },
    {
      key: 'activo',
      header: 'Estado',
      render: (item: Derecho) => (
        <span className={`px-2 py-1 rounded-full text-xs font-medium ${item.activo ? 'bg-emerald-500/20 text-emerald-600 dark:text-emerald-400' : 'bg-gray-500/20 text-gray-600 dark:text-gray-400'}`}>
          {item.activo ? 'Activo' : 'Inactivo'}
        </span>
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
      onClick: (item: Derecho) => handleEdit(item)
    },
    {
      icon: Trash2,
      label: 'Eliminar',
      onClick: (item: Derecho) => handleDelete(item.id)
    }
  ] : undefined;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-theme-primary">Derechos de los Interesados</h2>
          <p className="text-theme-secondary mt-1">
            Gestión de derechos ARCO/ARSULIPO conforme RGPD/LOPDGDD
          </p>
        </div>
        {editable && (
          <Button onClick={handleAdd} leftIcon={Plus}>
            Nuevo Derecho
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
              <Shield className="w-5 h-5 text-blue-500" />
            </div>
            <div>
              <p className="text-2xl font-bold text-theme-primary">{derechos.length}</p>
              <p className="text-sm text-theme-muted">Derechos</p>
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
                {derechos.filter(d => d.activo).length}
              </p>
              <p className="text-sm text-theme-muted">Activos</p>
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
            <div className="p-2 bg-purple-500/20 rounded-lg">
              <Clock className="w-5 h-5 text-purple-500" />
            </div>
            <div>
              <p className="text-2xl font-bold text-theme-primary">
                {Math.max(...derechos.map(d => d.plazoRespuesta))}
              </p>
              <p className="text-sm text-theme-muted">Días máx.</p>
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
            <div className="p-2 bg-amber-500/20 rounded-lg">
              <FileText className="w-5 h-5 text-amber-500" />
            </div>
            <div>
              <p className="text-2xl font-bold text-theme-primary">
                {derechos.filter(d => d.requiereIdentificacion).length}
              </p>
              <p className="text-sm text-theme-muted">Requieren ID</p>
            </div>
          </div>
        </motion.div>
      </div>

      <div className="flex flex-wrap items-center gap-4 p-4 bg-theme-card border border-theme rounded-xl">
        <div className="flex items-center gap-2">
          <FileText className="w-5 h-5 text-theme-muted" />
          <span className="text-sm font-medium text-theme-secondary">Filtros:</span>
        </div>
        <select
          value={filtroEstado}
          onChange={e => setFiltroEstado(e.target.value)}
          className="px-3 py-2 bg-theme-tertiary border border-theme rounded-lg text-theme-primary text-sm focus:outline-none focus:ring-2 focus:ring-accent"
        >
          <option value="todos">Todos los estados</option>
          <option value="activo">Activos</option>
          <option value="inactivo">Inactivos</option>
        </select>
        <span className="ml-auto text-sm text-theme-muted">
          Mostrando {derechosFiltrados.length} de {derechos.length} derechos
        </span>
      </div>

      <div className="bg-theme-card border border-theme rounded-xl overflow-hidden">
        <ResponsiveTable
          data={derechosFiltrados}
          columns={columns}
          keyExtractor={(item) => item.id}
          actions={actions}
          emptyMessage="No hay derechos que coincidan con los filtros"
        />
      </div>

      <AnimatePresence>
        {showModal && editingDerecho && (
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
                  {derechos.find(d => d.id === editingDerecho.id) ? 'Editar' : 'Nuevo'} Derecho
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
                      Nombre del Derecho *
                    </label>
                    <select
                      value={editingDerecho.nombre}
                      onChange={e => setEditingDerecho({ ...editingDerecho, nombre: e.target.value })}
                      className="w-full px-4 py-2 bg-theme-tertiary border border-theme rounded-xl text-theme-primary focus:outline-none focus:ring-2 focus:ring-accent"
                    >
                      <option value="">Seleccione...</option>
                      <option value="Acceso">Acceso</option>
                      <option value="Rectificación">Rectificación</option>
                      <option value="Supresión">Supresión</option>
                      <option value="Limitación">Limitación</option>
                      <option value="Portabilidad">Portabilidad</option>
                      <option value="Oposición">Oposición</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-theme-secondary mb-2">
                      Fundamento Legal *
                    </label>
                    <input
                      type="text"
                      value={editingDerecho.fundamento}
                      onChange={e => setEditingDerecho({ ...editingDerecho, fundamento: e.target.value })}
                      className="w-full px-4 py-2 bg-theme-tertiary border border-theme rounded-xl text-theme-primary focus:outline-none focus:ring-2 focus:ring-accent"
                      placeholder="ej. Art. 15 RGPD"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-theme-secondary mb-2">
                    Descripción *
                  </label>
                  <textarea
                    value={editingDerecho.descripcion}
                    onChange={e => setEditingDerecho({ ...editingDerecho, descripcion: e.target.value })}
                    className="w-full px-4 py-2 bg-theme-tertiary border border-theme rounded-xl text-theme-primary focus:outline-none focus:ring-2 focus:ring-accent h-24 resize-none"
                    placeholder="Descripción del derecho..."
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-theme-secondary mb-2">
                      Plazo de Respuesta (días)
                    </label>
                    <input
                      type="number"
                      min="1"
                      max="90"
                      value={editingDerecho.plazoRespuesta}
                      onChange={e => setEditingDerecho({ ...editingDerecho, plazoRespuesta: parseInt(e.target.value) || 30 })}
                      className="w-full px-4 py-2 bg-theme-tertiary border border-theme rounded-xl text-theme-primary focus:outline-none focus:ring-2 focus:ring-accent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-theme-secondary mb-2">
                      Actividades Afectadas (separadas por coma)
                    </label>
                    <input
                      type="text"
                      value={editingDerecho.afectaActividades.join(', ')}
                      onChange={e => setEditingDerecho({ 
                        ...editingDerecho, 
                        afectaActividades: e.target.value.split(',').map(s => s.trim()).filter(Boolean)
                      })}
                      className="w-full px-4 py-2 bg-theme-tertiary border border-theme rounded-xl text-theme-primary focus:outline-none focus:ring-2 focus:ring-accent"
                      placeholder="ej. Gestión de clientes, RRHH"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-theme-secondary mb-2">
                    Observaciones
                  </label>
                  <textarea
                    value={editingDerecho.observaciones}
                    onChange={e => setEditingDerecho({ ...editingDerecho, observaciones: e.target.value })}
                    className="w-full px-4 py-2 bg-theme-tertiary border border-theme rounded-xl text-theme-primary focus:outline-none focus:ring-2 focus:ring-accent h-20 resize-none"
                    placeholder="Notas adicionales sobre el ejercicio de este derecho..."
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex items-center gap-6">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={editingDerecho.gratuito}
                        onChange={e => setEditingDerecho({ ...editingDerecho, gratuito: e.target.checked })}
                        className="w-5 h-5 rounded border-theme text-accent focus:ring-accent"
                      />
                      <span className="text-theme-primary">Ejercicio gratuito</span>
                    </label>
                  </div>
                  <div className="flex items-center gap-6">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={editingDerecho.requiereIdentificacion}
                        onChange={e => setEditingDerecho({ ...editingDerecho, requiereIdentificacion: e.target.checked })}
                        className="w-5 h-5 rounded border-theme text-accent focus:ring-accent"
                      />
                      <span className="text-theme-primary">Requiere identificación</span>
                    </label>
                  </div>
                </div>

                <div className="flex items-center gap-6">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={editingDerecho.activo}
                      onChange={e => setEditingDerecho({ ...editingDerecho, activo: e.target.checked })}
                      className="w-5 h-5 rounded border-theme text-accent focus:ring-accent"
                    />
                    <span className="text-theme-primary">Activo</span>
                  </label>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t border-theme">
                  <div className="flex items-center gap-2 text-theme-muted">
                    <Clock className="w-4 h-4" />
                    <span className="text-sm">Creación: {editingDerecho.fechaCreacion}</span>
                  </div>
                  <div className="flex items-center gap-2 text-theme-muted">
                    <Clock className="w-4 h-4" />
                    <span className="text-sm">Última modificación: {editingDerecho.ultimaModificacion}</span>
                  </div>
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

export default DerechosARSULIPO;

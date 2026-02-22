import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Plus, Pencil, Trash2, FileText, CheckCircle, X, 
  AlertTriangle, Calendar, Shield, Filter
} from 'lucide-react';
import { ResponsiveTable } from '../ui/ResponsiveTable';
import { Button } from '../ui/Button';

export interface Consentimiento {
  id: string;
  nombre: string;
  descripcion: string;
  categoria: 'comercial' | 'newsletter' | 'analitica' | 'terceros' | 'otros';
  texto: string;
  obligatorio: boolean;
  fechaCreacion: string;
  ultimaModificacion: string;
  activo: boolean;
  aceptaEdad: number;
  requiereDobleOptin: boolean;
}

const initialConsentimientos: Consentimiento[] = [
  {
    id: '1',
    nombre: 'Newsletter',
    descripcion: 'Consentimiento para recibir comunicaciones comerciales por correo electrónico',
    categoria: 'newsletter',
    texto: 'He leído y acepto recibir el newsletter con información sobre actualizaciones, noticias y contenidos exclusivos de la empresa.',
    obligatorio: false,
    fechaCreacion: '2024-01-15',
    ultimaModificacion: '2024-01-15',
    activo: true,
    aceptaEdad: 16,
    requiereDobleOptin: true
  },
  {
    id: '2',
    nombre: 'Comunicaciones comerciales',
    descripcion: 'Consentimiento para recibir ofertas y promociones',
    categoria: 'comercial',
    texto: 'Acepto recibir comunicaciones comerciales personalizadas sobre productos y servicios que puedan ser de mi interés.',
    obligatorio: false,
    fechaCreacion: '2024-01-15',
    ultimaModificacion: '2024-02-20',
    activo: true,
    aceptaEdad: 18,
    requiereDobleOptin: true
  },
  {
    id: '3',
    nombre: 'Cookies analíticas',
    descripcion: 'Consentimiento para el uso de cookies de análisis',
    categoria: 'analitica',
    texto: 'Acepto el uso de cookies analíticas para mejorar la experiencia de usuario y analizar el tráfico del sitio web.',
    obligatorio: false,
    fechaCreacion: '2024-01-15',
    ultimaModificacion: '2024-01-15',
    activo: true,
    aceptaEdad: 16,
    requiereDobleOptin: false
  },
  {
    id: '4',
    nombre: 'Cesión a terceros',
    descripcion: 'Consentimiento para ceder datos a empresas colaboradoras',
    categoria: 'terceros',
    texto: 'Acepto que mis datos sean cedidos a empresas colaboradoras para el envío de comunicaciones comerciales de terceros.',
    obligatorio: false,
    fechaCreacion: '2024-01-15',
    ultimaModificacion: '2024-01-15',
    activo: false,
    aceptaEdad: 18,
    requiereDobleOptin: true
  }
];

interface ConsentimientosProps {
  editable?: boolean;
}

export function Consentimientos({ editable = true }: ConsentimientosProps) {
  const [consentimientos, setConsentimientos] = useState<Consentimiento[]>(initialConsentimientos);
  const [showModal, setShowModal] = useState(false);
  const [editingConsentimiento, setEditingConsentimiento] = useState<Consentimiento | null>(null);
  const [filtroCategoria, setFiltroCategoria] = useState<string>('todos');
  const [filtroEstado, setFiltroEstado] = useState<string>('todos');

  const consentimientosFiltrados = useMemo(() => {
    return consentimientos.filter(c => {
      const matchCategoria = filtroCategoria === 'todos' || c.categoria === filtroCategoria;
      const matchEstado = filtroEstado === 'todos' || 
        (filtroEstado === 'activo' && c.activo) || 
        (filtroEstado === 'inactivo' && !c.activo);
      return matchCategoria && matchEstado;
    });
  }, [consentimientos, filtroCategoria, filtroEstado]);

  const handleDelete = (id: string) => {
    setConsentimientos(prev => prev.filter(c => c.id !== id));
  };

  const handleEdit = (consentimiento: Consentimiento) => {
    setEditingConsentimiento({ ...consentimiento });
    setShowModal(true);
  };

  const handleAdd = () => {
    const today = new Date().toISOString().split('T')[0];
    const newConsentimiento: Consentimiento = {
      id: Date.now().toString(),
      nombre: '',
      descripcion: '',
      categoria: 'otros',
      texto: '',
      obligatorio: false,
      fechaCreacion: today,
      ultimaModificacion: today,
      activo: true,
      aceptaEdad: 16,
      requiereDobleOptin: false
    };
    setEditingConsentimiento(newConsentimiento);
    setShowModal(true);
  };

  const handleSave = () => {
    if (editingConsentimiento) {
      editingConsentimiento.ultimaModificacion = new Date().toISOString().split('T')[0];
      const exists = consentimientos.find(c => c.id === editingConsentimiento.id);
      if (exists) {
        setConsentimientos(prev => prev.map(c => c.id === editingConsentimiento.id ? editingConsentimiento : c));
      } else {
        setConsentimientos(prev => [...prev, editingConsentimiento]);
      }
    }
    setShowModal(false);
    setEditingConsentimiento(null);
  };

  const getCategoriaColor = (categoria: string) => {
    switch (categoria) {
      case 'comercial': return 'bg-blue-500/20 text-blue-600 dark:text-blue-400';
      case 'newsletter': return 'bg-purple-500/20 text-purple-600 dark:text-purple-400';
      case 'analitica': return 'bg-amber-500/20 text-amber-600 dark:text-amber-400';
      case 'terceros': return 'bg-pink-500/20 text-pink-600 dark:text-pink-400';
      default: return 'bg-gray-500/20 text-gray-600 dark:text-gray-400';
    }
  };

  const getCategoriaLabel = (categoria: string) => {
    const labels: Record<string, string> = {
      comercial: 'Comercial',
      newsletter: 'Newsletter',
      analitica: 'Analítica',
      terceros: 'Terceros',
      otros: 'Otros'
    };
    return labels[categoria] || categoria;
  };

  const columns = [
    {
      key: 'nombre',
      header: 'Consentimiento',
      render: (item: Consentimiento) => (
        <div className="font-medium text-theme-primary">{item.nombre}</div>
      )
    },
    {
      key: 'categoria',
      header: 'Categoría',
      render: (item: Consentimiento) => (
        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getCategoriaColor(item.categoria)}`}>
          {getCategoriaLabel(item.categoria)}
        </span>
      )
    },
    {
      key: 'obligatorio',
      header: 'Obligatorio',
      render: (item: Consentimiento) => (
        item.obligatorio ? (
          <span className="flex items-center gap-1 text-red-500 text-sm">
            <AlertTriangle className="w-4 h-4" /> Sí
          </span>
        ) : (
          <span className="flex items-center gap-1 text-emerald-500 text-sm">
            <CheckCircle className="w-4 h-4" /> No
          </span>
        )
      )
    },
    {
      key: 'activo',
      header: 'Estado',
      render: (item: Consentimiento) => (
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
      onClick: (item: Consentimiento) => handleEdit(item)
    },
    {
      icon: Trash2,
      label: 'Eliminar',
      onClick: (item: Consentimiento) => handleDelete(item.id)
    }
  ] : undefined;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-theme-primary">Gestión de Consentimientos</h2>
          <p className="text-theme-secondary mt-1">
            Administrar consentimientos conforme RGPD/LOPDGDD
          </p>
        </div>
        {editable && (
          <Button onClick={handleAdd} leftIcon={Plus}>
            Nuevo Consentimiento
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
              <FileText className="w-5 h-5 text-blue-500" />
            </div>
            <div>
              <p className="text-2xl font-bold text-theme-primary">{consentimientos.length}</p>
              <p className="text-sm text-theme-muted">Consentimientos</p>
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
                {consentimientos.filter(c => c.activo).length}
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
            <div className="p-2 bg-red-500/20 rounded-lg">
              <AlertTriangle className="w-5 h-5 text-red-500" />
            </div>
            <div>
              <p className="text-2xl font-bold text-theme-primary">
                {consentimientos.filter(c => c.obligatorio).length}
              </p>
              <p className="text-sm text-theme-muted">Obligatorios</p>
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
              <Shield className="w-5 h-5 text-purple-500" />
            </div>
            <div>
              <p className="text-2xl font-bold text-theme-primary">
                {consentimientos.filter(c => c.requiereDobleOptin).length}
              </p>
              <p className="text-sm text-theme-muted">Doble Opt-in</p>
            </div>
          </div>
        </motion.div>
      </div>

      <div className="flex flex-wrap items-center gap-4 p-4 bg-theme-card border border-theme rounded-xl">
        <div className="flex items-center gap-2">
          <Filter className="w-5 h-5 text-theme-muted" />
          <span className="text-sm font-medium text-theme-secondary">Filtros:</span>
        </div>
        <select
          value={filtroCategoria}
          onChange={e => setFiltroCategoria(e.target.value)}
          className="px-3 py-2 bg-theme-tertiary border border-theme rounded-lg text-theme-primary text-sm focus:outline-none focus:ring-2 focus:ring-accent"
        >
          <option value="todos">Todas las categorías</option>
          <option value="comercial">Comercial</option>
          <option value="newsletter">Newsletter</option>
          <option value="analitica">Analítica</option>
          <option value="terceros">Terceros</option>
          <option value="otros">Otros</option>
        </select>
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
          Mostrando {consentimientosFiltrados.length} de {consentimientos.length} consentimientos
        </span>
      </div>

      <div className="bg-theme-card border border-theme rounded-xl overflow-hidden">
        <ResponsiveTable
          data={consentimientosFiltrados}
          columns={columns}
          keyExtractor={(item) => item.id}
          actions={actions}
          emptyMessage="No hay consentimientos que coincidan con los filtros"
        />
      </div>

      <AnimatePresence>
        {showModal && editingConsentimiento && (
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
                  {consentimientos.find(c => c.id === editingConsentimiento.id) ? 'Editar' : 'Nuevo'} Consentimiento
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
                      Nombre del Consentimiento *
                    </label>
                    <input
                      type="text"
                      value={editingConsentimiento.nombre}
                      onChange={e => setEditingConsentimiento({ ...editingConsentimiento, nombre: e.target.value })}
                      className="w-full px-4 py-2 bg-theme-tertiary border border-theme rounded-xl text-theme-primary focus:outline-none focus:ring-2 focus:ring-accent"
                      placeholder="ej. Newsletter"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-theme-secondary mb-2">
                      Categoría
                    </label>
                    <select
                      value={editingConsentimiento.categoria}
                      onChange={e => setEditingConsentimiento({ ...editingConsentimiento, categoria: e.target.value as Consentimiento['categoria'] })}
                      className="w-full px-4 py-2 bg-theme-tertiary border border-theme rounded-xl text-theme-primary focus:outline-none focus:ring-2 focus:ring-accent"
                    >
                      <option value="comercial">Comercial</option>
                      <option value="newsletter">Newsletter</option>
                      <option value="analitica">Analítica</option>
                      <option value="terceros">Terceros</option>
                      <option value="otros">Otros</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-theme-secondary mb-2">
                    Descripción *
                  </label>
                  <textarea
                    value={editingConsentimiento.descripcion}
                    onChange={e => setEditingConsentimiento({ ...editingConsentimiento, descripcion: e.target.value })}
                    className="w-full px-4 py-2 bg-theme-tertiary border border-theme rounded-xl text-theme-primary focus:outline-none focus:ring-2 focus:ring-accent h-20 resize-none"
                    placeholder="Breve descripción del consentimiento..."
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-theme-secondary mb-2">
                    Texto del Consentimiento *
                  </label>
                  <textarea
                    value={editingConsentimiento.texto}
                    onChange={e => setEditingConsentimiento({ ...editingConsentimiento, texto: e.target.value })}
                    className="w-full px-4 py-2 bg-theme-tertiary border border-theme rounded-xl text-theme-primary focus:outline-none focus:ring-2 focus:ring-accent h-32 resize-none"
                    placeholder="Texto completo que verá el usuario al dar su consentimiento..."
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-theme-secondary mb-2">
                      Edad Mínima (años)
                    </label>
                    <input
                      type="number"
                      min="13"
                      max="99"
                      value={editingConsentimiento.aceptaEdad}
                      onChange={e => setEditingConsentimiento({ ...editingConsentimiento, aceptaEdad: parseInt(e.target.value) || 16 })}
                      className="w-full px-4 py-2 bg-theme-tertiary border border-theme rounded-xl text-theme-primary focus:outline-none focus:ring-2 focus:ring-accent"
                    />
                  </div>
                  <div className="flex items-center gap-6 mt-6">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={editingConsentimiento.obligatorio}
                        onChange={e => setEditingConsentimiento({ ...editingConsentimiento, obligatorio: e.target.checked })}
                        className="w-5 h-5 rounded border-theme text-accent focus:ring-accent"
                      />
                      <span className="text-theme-primary">Consentimiento obligatorio</span>
                    </label>
                  </div>
                </div>

                <div className="flex items-center gap-6">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={editingConsentimiento.requiereDobleOptin}
                      onChange={e => setEditingConsentimiento({ ...editingConsentimiento, requiereDobleOptin: e.target.checked })}
                      className="w-5 h-5 rounded border-theme text-accent focus:ring-accent"
                    />
                    <span className="text-theme-primary">Requiere doble opt-in</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={editingConsentimiento.activo}
                      onChange={e => setEditingConsentimiento({ ...editingConsentimiento, activo: e.target.checked })}
                      className="w-5 h-5 rounded border-theme text-accent focus:ring-accent"
                    />
                    <span className="text-theme-primary">Activo</span>
                  </label>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t border-theme">
                  <div className="flex items-center gap-2 text-theme-muted">
                    <Calendar className="w-4 h-4" />
                    <span className="text-sm">Creación: {editingConsentimiento.fechaCreacion}</span>
                  </div>
                  <div className="flex items-center gap-2 text-theme-muted">
                    <Calendar className="w-4 h-4" />
                    <span className="text-sm">Última modificación: {editingConsentimiento.ultimaModificacion}</span>
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

export default Consentimientos;

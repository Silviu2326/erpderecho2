import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Plus, Pencil, Trash2, Shield, Database, 
  AlertTriangle, CheckCircle, X
} from 'lucide-react';
import { ResponsiveTable } from '../ui/ResponsiveTable';
import { Button } from '../ui/Button';

export interface ActividadTratamiento {
  id: string;
  nombre: string;
  finalidad: string;
  baseLegal: string;
  categoriasDatos: string[];
  categoriasInteresados: string[];
  destinatarios: string[];
  plazosConservacion: string;
  medidasTecnicas: string[];
  medidasOrganizativas: string[];
  transferencias: string;
  ejercicioDerechos: string;
  nivelRiesgo: 'bajo' | 'medio' | 'alto';
}

const initialActividades: ActividadTratamiento[] = [
  {
    id: '1',
    nombre: 'Gestión de clientes',
    finalidad: 'Gestión administrativa, comercial y contable de clientes',
    baseLegal: 'Ejecución de contrato (art. 6.1.b RGPD)',
    categoriasDatos: ['Identificativos', 'Contactos', 'Económicos'],
    categoriasInteresados: ['Clientes'],
    destinatarios: ['Entidades bancarias', 'Administraciones públicas'],
    plazosConservacion: 'Durante la relación contractual + 6 años',
    medidasTecnicas: ['Cifrado', 'Control de acceso', 'Registro de actividad'],
    medidasOrganizativas: ['Política de protección de datos', 'Acuerdos de confidencialidad'],
    transferencias: 'No se realizan',
    ejercicioDerechos: 'dp@empresa.es',
    nivelRiesgo: 'bajo'
  },
  {
    id: '2',
    nombre: 'Envío de comunicaciones comerciales',
    finalidad: 'Envío de información sobre productos, servicios y promociones',
    baseLegal: 'Consentimiento (art. 6.1.a RGPD)',
    categoriasDatos: ['Identificativos', 'Contactos', 'Preferencias'],
    categoriasInteresados: ['Clientes', 'Leads'],
    destinatarios: ['Proveedores de email marketing'],
    plazosConservacion: 'Hasta revocación del consentimiento',
    medidasTecnicas: ['Double opt-in', 'Listas de exclusión'],
    medidasOrganizativas: ['Procedimiento de gestión de bajas'],
    transferencias: 'Proveedores en EE.UU. (Privacy Shield)',
    ejercicioDerechos: 'dp@empresa.es',
    nivelRiesgo: 'medio'
  },
  {
    id: '3',
    nombre: 'Videovigilancia',
    finalidad: 'Seguridad de personas, bienes e instalaciones',
    baseLegal: 'Interés legítimo (art. 6.1.f RGPD)',
    categoriasDatos: ['Imagen', 'Audio'],
    categoriasInteresados: ['Empleados', 'Visitantes', 'Clientes'],
    destinatarios: ['Fuerzas y cuerpos de seguridad'],
    plazosConservacion: '30 días',
    medidasTecnicas: ['Cifrado de grabaciones', 'Control de acceso', 'Marcado de agua'],
    medidasOrganizativas: ['Carteles informativos', 'Procedimiento de acceso'],
    transferencias: 'No se realizan',
    ejercicioDerechos: 'dp@empresa.es',
    nivelRiesgo: 'alto'
  },
  {
    id: '4',
    nombre: 'Selección de personal',
    finalidad: 'Gestión del proceso de selección y contratación de personal',
    baseLegal: 'Consentimiento (art. 6.1.a RGPD)',
    categoriasDatos: ['Identificativos', 'Contactos', 'Curriculum', 'Datos académicos'],
    categoriasInteresados: ['Candidatos'],
    destinatarios: ['No se comunican datos a terceros'],
    plazosConservacion: '1 año desde la última entrevista',
    medidasTecnicas: ['Almacenamiento cifrado', 'Control de acceso'],
    medidasOrganizativas: ['Política de retención de candidatos'],
    transferencias: 'No se realizan',
    ejercicioDerechos: 'rrhh@empresa.es',
    nivelRiesgo: 'medio'
  }
];

interface ActividadesTratamientoProps {
  editable?: boolean;
}

export function ActividadesTratamiento({ editable = true }: ActividadesTratamientoProps) {
  const [actividades, setActividades] = useState<ActividadTratamiento[]>(initialActividades);
  const [showModal, setShowModal] = useState(false);
  const [editingActividad, setEditingActividad] = useState<ActividadTratamiento | null>(null);

  const handleDelete = (id: string) => {
    setActividades(prev => prev.filter(a => a.id !== id));
  };

  const handleEdit = (actividad: ActividadTratamiento) => {
    setEditingActividad({ ...actividad });
    setShowModal(true);
  };

  const handleAdd = () => {
    const newActividad: ActividadTratamiento = {
      id: Date.now().toString(),
      nombre: '',
      finalidad: '',
      baseLegal: '',
      categoriasDatos: [],
      categoriasInteresados: [],
      destinatarios: [],
      plazosConservacion: '',
      medidasTecnicas: [],
      medidasOrganizativas: [],
      transferencias: '',
      ejercicioDerechos: '',
      nivelRiesgo: 'bajo'
    };
    setEditingActividad(newActividad);
    setShowModal(true);
  };

  const handleSave = () => {
    if (editingActividad) {
      const exists = actividades.find(a => a.id === editingActividad.id);
      if (exists) {
        setActividades(prev => prev.map(a => a.id === editingActividad.id ? editingActividad : a));
      } else {
        setActividades(prev => [...prev, editingActividad]);
      }
    }
    setShowModal(false);
    setEditingActividad(null);
  };

  const getRiesgoColor = (nivel: string) => {
    switch (nivel) {
      case 'bajo': return 'bg-emerald-500/20 text-emerald-600 dark:text-emerald-400';
      case 'medio': return 'bg-amber-500/20 text-amber-600 dark:text-amber-400';
      case 'alto': return 'bg-red-500/20 text-red-600 dark:text-red-400';
      default: return 'bg-gray-500/20 text-gray-600';
    }
  };

  const columns = [
    {
      key: 'nombre',
      header: 'Actividad',
      render: (item: ActividadTratamiento) => (
        <div className="font-medium text-theme-primary">{item.nombre}</div>
      )
    },
    {
      key: 'baseLegal',
      header: 'Base Legal',
      render: (item: ActividadTratamiento) => (
        <div className="text-sm text-theme-secondary">{item.baseLegal}</div>
      )
    },
    {
      key: 'categoriasDatos',
      header: 'Categorías de Datos',
      render: (item: ActividadTratamiento) => (
        <div className="flex flex-wrap gap-1">
          {item.categoriasDatos.slice(0, 2).map((cat, i) => (
            <span key={i} className="px-2 py-0.5 bg-theme-tertiary text-theme-secondary text-xs rounded-full">
              {cat}
            </span>
          ))}
          {item.categoriasDatos.length > 2 && (
            <span className="text-theme-muted text-xs">+{item.categoriasDatos.length - 2}</span>
          )}
        </div>
      )
    },
    {
      key: 'nivelRiesgo',
      header: 'Riesgo',
      render: (item: ActividadTratamiento) => (
        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getRiesgoColor(item.nivelRiesgo)}`}>
          {item.nivelRiesgo.charAt(0).toUpperCase() + item.nivelRiesgo.slice(1)}
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
      onClick: (item: ActividadTratamiento) => handleEdit(item)
    },
    {
      icon: Trash2,
      label: 'Eliminar',
      onClick: (item: ActividadTratamiento) => handleDelete(item.id)
    }
  ] : undefined;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-theme-primary">Registro de Actividades de Tratamiento</h2>
          <p className="text-theme-secondary mt-1">
            Documento obligatorio según RGPD/LOPDGDD (Art. 30)
          </p>
        </div>
        {editable && (
          <Button onClick={handleAdd} leftIcon={Plus}>
            Nueva Actividad
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
              <Database className="w-5 h-5 text-blue-500" />
            </div>
            <div>
              <p className="text-2xl font-bold text-theme-primary">{actividades.length}</p>
              <p className="text-sm text-theme-muted">Actividades</p>
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
                {actividades.filter(a => a.nivelRiesgo === 'bajo').length}
              </p>
              <p className="text-sm text-theme-muted">Bajo Riesgo</p>
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
              <AlertTriangle className="w-5 h-5 text-amber-500" />
            </div>
            <div>
              <p className="text-2xl font-bold text-theme-primary">
                {actividades.filter(a => a.nivelRiesgo === 'medio').length}
              </p>
              <p className="text-sm text-theme-muted">Medio Riesgo</p>
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
            <div className="p-2 bg-red-500/20 rounded-lg">
              <Shield className="w-5 h-5 text-red-500" />
            </div>
            <div>
              <p className="text-2xl font-bold text-theme-primary">
                {actividades.filter(a => a.nivelRiesgo === 'alto').length}
              </p>
              <p className="text-sm text-theme-muted">Alto Riesgo</p>
            </div>
          </div>
        </motion.div>
      </div>

      <div className="bg-theme-card border border-theme rounded-xl overflow-hidden">
        <ResponsiveTable
          data={actividades}
          columns={columns}
          keyExtractor={(item) => item.id}
          actions={actions}
          emptyMessage="No hay actividades de tratamiento registradas"
        />
      </div>

      <AnimatePresence>
        {showModal && editingActividad && (
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
                  {actividades.find(a => a.id === editingActividad.id) ? 'Editar' : 'Nueva'} Actividad de Tratamiento
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
                      Nombre de la Actividad *
                    </label>
                    <input
                      type="text"
                      value={editingActividad.nombre}
                      onChange={e => setEditingActividad({ ...editingActividad, nombre: e.target.value })}
                      className="w-full px-4 py-2 bg-theme-tertiary border border-theme rounded-xl text-theme-primary focus:outline-none focus:ring-2 focus:ring-accent"
                      placeholder="ej. Gestión de clientes"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-theme-secondary mb-2">
                      Nivel de Riesgo
                    </label>
                    <select
                      value={editingActividad.nivelRiesgo}
                      onChange={e => setEditingActividad({ ...editingActividad, nivelRiesgo: e.target.value as 'bajo' | 'medio' | 'alto' })}
                      className="w-full px-4 py-2 bg-theme-tertiary border border-theme rounded-xl text-theme-primary focus:outline-none focus:ring-2 focus:ring-accent"
                    >
                      <option value="bajo">Bajo</option>
                      <option value="medio">Medio</option>
                      <option value="alto">Alto</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-theme-secondary mb-2">
                    Finalidad del Tratamiento *
                  </label>
                  <textarea
                    value={editingActividad.finalidad}
                    onChange={e => setEditingActividad({ ...editingActividad, finalidad: e.target.value })}
                    className="w-full px-4 py-2 bg-theme-tertiary border border-theme rounded-xl text-theme-primary focus:outline-none focus:ring-2 focus:ring-accent h-24 resize-none"
                    placeholder="Describa la finalidad del tratamiento..."
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-theme-secondary mb-2">
                    Base Legal *
                  </label>
                  <input
                    type="text"
                    value={editingActividad.baseLegal}
                    onChange={e => setEditingActividad({ ...editingActividad, baseLegal: e.target.value })}
                    className="w-full px-4 py-2 bg-theme-tertiary border border-theme rounded-xl text-theme-primary focus:outline-none focus:ring-2 focus:ring-accent"
                    placeholder="ej. Consentimiento (art. 6.1.a RGPD)"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-theme-secondary mb-2">
                      Plazo de Conservación
                    </label>
                    <input
                      type="text"
                      value={editingActividad.plazosConservacion}
                      onChange={e => setEditingActividad({ ...editingActividad, plazosConservacion: e.target.value })}
                      className="w-full px-4 py-2 bg-theme-tertiary border border-theme rounded-xl text-theme-primary focus:outline-none focus:ring-2 focus:ring-accent"
                      placeholder="ej. 5 años"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-theme-secondary mb-2">
                      Ejercicio de Derechos
                    </label>
                    <input
                      type="text"
                      value={editingActividad.ejercicioDerechos}
                      onChange={e => setEditingActividad({ ...editingActividad, ejercicioDerechos: e.target.value })}
                      className="w-full px-4 py-2 bg-theme-tertiary border border-theme rounded-xl text-theme-primary focus:outline-none focus:ring-2 focus:ring-accent"
                      placeholder="ej. dp@empresa.es"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-theme-secondary mb-2">
                    Transferencias Internacionales
                  </label>
                  <input
                    type="text"
                    value={editingActividad.transferencias}
                    onChange={e => setEditingActividad({ ...editingActividad, transferencias: e.target.value })}
                    className="w-full px-4 py-2 bg-theme-tertiary border border-theme rounded-xl text-theme-primary focus:outline-none focus:ring-2 focus:ring-accent"
                    placeholder="Indique si hay transferencias y país..."
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-theme-secondary mb-2">
                    Categorías de Datos (separadas por coma)
                  </label>
                  <input
                    type="text"
                    value={editingActividad.categoriasDatos.join(', ')}
                    onChange={e => setEditingActividad({ 
                      ...editingActividad, 
                      categoriasDatos: e.target.value.split(',').map(s => s.trim()).filter(Boolean)
                    })}
                    className="w-full px-4 py-2 bg-theme-tertiary border border-theme rounded-xl text-theme-primary focus:outline-none focus:ring-2 focus:ring-accent"
                    placeholder="ej. Identificativos, Contactos, Económicos"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-theme-secondary mb-2">
                    Categorías de Interesados (separadas por coma)
                  </label>
                  <input
                    type="text"
                    value={editingActividad.categoriasInteresados.join(', ')}
                    onChange={e => setEditingActividad({ 
                      ...editingActividad, 
                      categoriasInteresados: e.target.value.split(',').map(s => s.trim()).filter(Boolean)
                    })}
                    className="w-full px-4 py-2 bg-theme-tertiary border border-theme rounded-xl text-theme-primary focus:outline-none focus:ring-2 focus:ring-accent"
                    placeholder="ej. Clientes, Empleados"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-theme-secondary mb-2">
                    Destinatarios (separados por coma)
                  </label>
                  <input
                    type="text"
                    value={editingActividad.destinatarios.join(', ')}
                    onChange={e => setEditingActividad({ 
                      ...editingActividad, 
                      destinatarios: e.target.value.split(',').map(s => s.trim()).filter(Boolean)
                    })}
                    className="w-full px-4 py-2 bg-theme-tertiary border border-theme rounded-xl text-theme-primary focus:outline-none focus:ring-2 focus:ring-accent"
                    placeholder="ej. Administraciones públicas, Bancos"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-theme-secondary mb-2">
                      Medidas Técnicas (separadas por coma)
                    </label>
                    <input
                      type="text"
                      value={editingActividad.medidasTecnicas.join(', ')}
                      onChange={e => setEditingActividad({ 
                        ...editingActividad, 
                        medidasTecnicas: e.target.value.split(',').map(s => s.trim()).filter(Boolean)
                      })}
                      className="w-full px-4 py-2 bg-theme-tertiary border border-theme rounded-xl text-theme-primary focus:outline-none focus:ring-2 focus:ring-accent"
                      placeholder="ej. Cifrado, Control de acceso"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-theme-secondary mb-2">
                      Medidas Organizativas (separadas por coma)
                    </label>
                    <input
                      type="text"
                      value={editingActividad.medidasOrganizativas.join(', ')}
                      onChange={e => setEditingActividad({ 
                        ...editingActividad, 
                        medidasOrganizativas: e.target.value.split(',').map(s => s.trim()).filter(Boolean)
                      })}
                      className="w-full px-4 py-2 bg-theme-tertiary border border-theme rounded-xl text-theme-primary focus:outline-none focus:ring-2 focus:ring-accent"
                      placeholder="ej. Política de privacidad"
                    />
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

export default ActividadesTratamiento;

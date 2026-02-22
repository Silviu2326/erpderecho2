import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Plus, Trash2, Shield, AlertTriangle, 
  CheckCircle, X, Eye, Clock, FileWarning, Bell
} from 'lucide-react';
import { ResponsiveTable } from '../ui/ResponsiveTable';
import { Button } from '../ui/Button';

export interface BrechaSeguridad {
  id: string;
  titulo: string;
  descripcion: string;
  fechaDeteccion: string;
  fechaNotificacion?: string;
  tipo: 'confidencialidad' | 'integridad' | 'disponibilidad';
  categoriaDatos: string[];
  numAfectados: number;
  medidasInmediatas: string[];
  medidasCorrectivas: string[];
  notificacionAEPD: boolean;
  fechaNotificacionAEPD?: string;
  afectadoDPD: boolean;
  afectadosNotificados: boolean;
  estado: 'pendiente' | 'en_proceso' | 'cerrada';
  resultado?: string;
}

const initialBrechas: BrechaSeguridad[] = [
  {
    id: '1',
    titulo: 'Acceso no autorizado a carpeta compartida',
    descripcion: 'Se detectaron intentos de acceso no autorizado a una carpeta compartida que contenía datos de clientes.',
    fechaDeteccion: '2024-01-15',
    fechaNotificacion: '2024-01-16',
    tipo: 'confidencialidad',
    categoriaDatos: ['Identificativos', 'Datos económicos'],
    numAfectados: 150,
    medidasInmediatas: ['Revocación de accesos', 'Cambio de contraseñas', 'Análisis de logs'],
    medidasCorrectivas: ['Implementación de 2FA', 'Auditoría de permisos'],
    notificacionAEPD: true,
    fechaNotificacionAEPD: '2024-01-17',
    afectadoDPD: true,
    afectadosNotificados: true,
    estado: 'cerrada',
    resultado: 'Sin riesgo significativo para los afectados'
  },
  {
    id: '2',
    titulo: 'Envío incorrecto de correo electrónico',
    descripcion: 'Se envió un correo electrónico a un destinatario incorrecto contendo información personal de un cliente.',
    fechaDeteccion: '2024-02-20',
    tipo: 'confidencialidad',
    categoriaDatos: ['Identificativos', 'Datos de salud'],
    numAfectados: 1,
    medidasInmediatas: ['Solicitud de eliminación del correo', 'Comunicación al destinatario'],
    medidasCorrectivas: ['Revisión de procedimientos de envío', 'Implementación de verificación'],
    notificacionAEPD: false,
    afectadoDPD: true,
    afectadosNotificados: true,
    estado: 'cerrada',
    resultado: 'Afectado notificado y satisfecho'
  },
  {
    id: '3',
    titulo: 'Caída del sistema de gestión',
    descripcion: 'El sistema de gestión de clientes estuvo indisponible durante 4 horas debido a un fallo en el servidor.',
    fechaDeteccion: '2024-03-10',
    tipo: 'disponibilidad',
    categoriaDatos: [],
    numAfectados: 0,
    medidasInmediatas: ['Activación de servidor backup', 'Comunicación a usuarios'],
    medidasCorrectivas: ['Migración a servidor redundante', 'Mejora del plan de contingencia'],
    notificacionAEPD: false,
    afectadoDPD: false,
    afectadosNotificados: false,
    estado: 'en_proceso'
  },
  {
    id: '4',
    titulo: 'Modificación no autorizada de datos',
    descripcion: 'Se detectaron modificaciones no autorizadas en registros de facturación.',
    fechaDeteccion: '2024-03-25',
    tipo: 'integridad',
    categoriaDatos: ['Datos económicos', 'Facturación'],
    numAfectados: 12,
    medidasInmediatas: ['Bloqueo de cuentas', 'Restauración de datos desde backup'],
    medidasCorrectivas: ['Implementación de logs de auditoría', 'Revisión de controles internos'],
    notificacionAEPD: true,
    fechaNotificacionAEPD: '2024-03-26',
    afectadoDPD: true,
    afectadosNotificados: false,
    estado: 'pendiente'
  }
];

interface BrechasProps {
  editable?: boolean;
}

export function Brechas({ editable = true }: BrechasProps) {
  const [brechas, setBrechas] = useState<BrechaSeguridad[]>(initialBrechas);
  const [showModal, setShowModal] = useState(false);
  const [editingBrecha, setEditingBrecha] = useState<BrechaSeguridad | null>(null);
  const [filterEstado, setFilterEstado] = useState<string>('todos');

  const handleDelete = (id: string) => {
    setBrechas(prev => prev.filter(b => b.id !== id));
  };

  const handleEdit = (brecha: BrechaSeguridad) => {
    setEditingBrecha({ ...brecha });
    setShowModal(true);
  };

  const handleAdd = () => {
    const newBrecha: BrechaSeguridad = {
      id: Date.now().toString(),
      titulo: '',
      descripcion: '',
      fechaDeteccion: new Date().toISOString().split('T')[0],
      tipo: 'confidencialidad',
      categoriaDatos: [],
      numAfectados: 0,
      medidasInmediatas: [],
      medidasCorrectivas: [],
      notificacionAEPD: false,
      afectadoDPD: false,
      afectadosNotificados: false,
      estado: 'pendiente'
    };
    setEditingBrecha(newBrecha);
    setShowModal(true);
  };

  const handleSave = () => {
    if (editingBrecha) {
      const exists = brechas.find(b => b.id === editingBrecha.id);
      if (exists) {
        setBrechas(prev => prev.map(b => b.id === editingBrecha.id ? editingBrecha : b));
      } else {
        setBrechas(prev => [...prev, editingBrecha]);
      }
    }
    setShowModal(false);
    setEditingBrecha(null);
  };

  const getEstadoColor = (estado: string) => {
    switch (estado) {
      case 'pendiente': return 'bg-red-500/20 text-red-600 dark:text-red-400';
      case 'en_proceso': return 'bg-amber-500/20 text-amber-600 dark:text-amber-400';
      case 'cerrada': return 'bg-emerald-500/20 text-emerald-600 dark:text-emerald-400';
      default: return 'bg-gray-500/20 text-gray-600';
    }
  };

  const getEstadoLabel = (estado: string) => {
    switch (estado) {
      case 'pendiente': return 'Pendiente';
      case 'en_proceso': return 'En Proceso';
      case 'cerrada': return 'Cerrada';
      default: return estado;
    }
  };

  const getTipoColor = (tipo: string) => {
    switch (tipo) {
      case 'confidencialidad': return 'bg-purple-500/20 text-purple-600 dark:text-purple-400';
      case 'integridad': return 'bg-blue-500/20 text-blue-600 dark:text-blue-400';
      case 'disponibilidad': return 'bg-orange-500/20 text-orange-600 dark:text-orange-400';
      default: return 'bg-gray-500/20 text-gray-600';
    }
  };

  const filteredBrechas = filterEstado === 'todos' 
    ? brechas 
    : brechas.filter(b => b.estado === filterEstado);

  const columns = [
    {
      key: 'titulo',
      header: 'Brecha de Seguridad',
      render: (item: BrechaSeguridad) => (
        <div>
          <div className="font-medium text-theme-primary">{item.titulo}</div>
          <div className="text-sm text-theme-muted mt-1">{item.descripcion.substring(0, 60)}...</div>
        </div>
      )
    },
    {
      key: 'tipo',
      header: 'Tipo',
      render: (item: BrechaSeguridad) => (
        <span className={`px-2 py-1 rounded-full text-xs font-medium capitalize ${getTipoColor(item.tipo)}`}>
          {item.tipo}
        </span>
      )
    },
    {
      key: 'numAfectados',
      header: 'Afectados',
      render: (item: BrechaSeguridad) => (
        <span className="text-theme-primary font-medium">
          {item.numAfectados.toLocaleString()}
        </span>
      )
    },
    {
      key: 'estado',
      header: 'Estado',
      render: (item: BrechaSeguridad) => (
        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getEstadoColor(item.estado)}`}>
          {getEstadoLabel(item.estado)}
        </span>
      )
    },
    {
      key: 'fechaDeteccion',
      header: 'Detectada',
      render: (item: BrechaSeguridad) => (
        <div className="text-theme-secondary text-sm">
          {new Date(item.fechaDeteccion).toLocaleDateString('es-ES')}
        </div>
      )
    },
    {
      key: 'notificacionAEPD',
      header: 'AEPD',
      render: (item: BrechaSeguridad) => (
        item.notificacionAEPD ? (
          <CheckCircle className="w-5 h-5 text-emerald-500" />
        ) : (
          <Clock className="w-5 h-5 text-amber-500" />
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
      icon: Eye,
      label: 'Ver/Editar',
      onClick: (item: BrechaSeguridad) => handleEdit(item)
    },
    {
      icon: Trash2,
      label: 'Eliminar',
      onClick: (item: BrechaSeguridad) => handleDelete(item.id)
    }
  ] : undefined;

  const stats = {
    total: brechas.length,
    pendientes: brechas.filter(b => b.estado === 'pendiente').length,
    enProceso: brechas.filter(b => b.estado === 'en_proceso').length,
    cerradas: brechas.filter(b => b.estado === 'cerrada').length,
    notificadasAEPD: brechas.filter(b => b.notificacionAEPD).length
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-theme-primary">Registro de Brechas de Seguridad</h2>
          <p className="text-theme-secondary mt-1">
            Gestión de incidentes de seguridad (RGPD Art. 33)
          </p>
        </div>
        {editable && (
          <Button onClick={handleAdd} leftIcon={Plus}>
            Nueva Brecha
          </Button>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
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
              <p className="text-2xl font-bold text-theme-primary">{stats.total}</p>
              <p className="text-sm text-theme-muted">Total Brechas</p>
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
            <div className="p-2 bg-red-500/20 rounded-lg">
              <AlertTriangle className="w-5 h-5 text-red-500" />
            </div>
            <div>
              <p className="text-2xl font-bold text-theme-primary">{stats.pendientes}</p>
              <p className="text-sm text-theme-muted">Pendientes</p>
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
              <p className="text-2xl font-bold text-theme-primary">{stats.enProceso}</p>
              <p className="text-sm text-theme-muted">En Proceso</p>
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
            <div className="p-2 bg-emerald-500/20 rounded-lg">
              <CheckCircle className="w-5 h-5 text-emerald-500" />
            </div>
            <div>
              <p className="text-2xl font-bold text-theme-primary">{stats.cerradas}</p>
              <p className="text-sm text-theme-muted">Cerradas</p>
            </div>
          </div>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-theme-card border border-theme rounded-xl p-4"
        >
          <div className="flex items-center gap-3">
            <div className="p-2 bg-purple-500/20 rounded-lg">
              <FileWarning className="w-5 h-5 text-purple-500" />
            </div>
            <div>
              <p className="text-2xl font-bold text-theme-primary">{stats.notificadasAEPD}</p>
              <p className="text-sm text-theme-muted">Notificadas AEPD</p>
            </div>
          </div>
        </motion.div>
      </div>

      <div className="flex gap-2">
        <button
          onClick={() => setFilterEstado('todos')}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
            filterEstado === 'todos' 
              ? 'bg-accent text-white' 
              : 'bg-theme-card border border-theme text-theme-secondary hover:bg-theme-tertiary'
          }`}
        >
          Todas
        </button>
        <button
          onClick={() => setFilterEstado('pendiente')}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
            filterEstado === 'pendiente' 
              ? 'bg-red-500 text-white' 
              : 'bg-theme-card border border-theme text-theme-secondary hover:bg-theme-tertiary'
          }`}
        >
          Pendientes
        </button>
        <button
          onClick={() => setFilterEstado('en_proceso')}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
            filterEstado === 'en_proceso' 
              ? 'bg-amber-500 text-white' 
              : 'bg-theme-card border border-theme text-theme-secondary hover:bg-theme-tertiary'
          }`}
        >
          En Proceso
        </button>
        <button
          onClick={() => setFilterEstado('cerrada')}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
            filterEstado === 'cerrada' 
              ? 'bg-emerald-500 text-white' 
              : 'bg-theme-card border border-theme text-theme-secondary hover:bg-theme-tertiary'
          }`}
        >
          Cerradas
        </button>
      </div>

      <div className="bg-theme-card border border-theme rounded-xl overflow-hidden">
        <ResponsiveTable
          data={filteredBrechas}
          columns={columns}
          keyExtractor={(item) => item.id}
          actions={actions}
          emptyMessage="No hay brechas de seguridad registradas"
        />
      </div>

      <AnimatePresence>
        {showModal && editingBrecha && (
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
                  {brechas.find(b => b.id === editingBrecha.id) ? 'Editar' : 'Nueva'} Brecha de Seguridad
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
                      Título de la Brecha *
                    </label>
                    <input
                      type="text"
                      value={editingBrecha.titulo}
                      onChange={e => setEditingBrecha({ ...editingBrecha, titulo: e.target.value })}
                      className="w-full px-4 py-2 bg-theme-tertiary border border-theme rounded-xl text-theme-primary focus:outline-none focus:ring-2 focus:ring-accent"
                      placeholder="ej. Acceso no autorizado a datos"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-theme-secondary mb-2">
                      Estado
                    </label>
                    <select
                      value={editingBrecha.estado}
                      onChange={e => setEditingBrecha({ ...editingBrecha, estado: e.target.value as 'pendiente' | 'en_proceso' | 'cerrada' })}
                      className="w-full px-4 py-2 bg-theme-tertiary border border-theme rounded-xl text-theme-primary focus:outline-none focus:ring-2 focus:ring-accent"
                    >
                      <option value="pendiente">Pendiente</option>
                      <option value="en_proceso">En Proceso</option>
                      <option value="cerrada">Cerrada</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-theme-secondary mb-2">
                    Descripción *
                  </label>
                  <textarea
                    value={editingBrecha.descripcion}
                    onChange={e => setEditingBrecha({ ...editingBrecha, descripcion: e.target.value })}
                      className="w-full px-4 py-2 bg-theme-tertiary border border-theme rounded-xl text-theme-primary focus:outline-none focus:ring-2 focus:ring-accent h-24 resize-none"
                    placeholder="Describa la brecha de seguridad..."
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-theme-secondary mb-2">
                      Fecha de Detección *
                    </label>
                    <input
                      type="date"
                      value={editingBrecha.fechaDeteccion}
                      onChange={e => setEditingBrecha({ ...editingBrecha, fechaDeteccion: e.target.value })}
                      className="w-full px-4 py-2 bg-theme-tertiary border border-theme rounded-xl text-theme-primary focus:outline-none focus:ring-2 focus:ring-accent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-theme-secondary mb-2">
                      Número de Afectados
                    </label>
                    <input
                      type="number"
                      value={editingBrecha.numAfectados}
                      onChange={e => setEditingBrecha({ ...editingBrecha, numAfectados: parseInt(e.target.value) || 0 })}
                      className="w-full px-4 py-2 bg-theme-tertiary border border-theme rounded-xl text-theme-primary focus:outline-none focus:ring-2 focus:ring-accent"
                      min="0"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-theme-secondary mb-2">
                    Tipo de Brecha
                  </label>
                  <select
                    value={editingBrecha.tipo}
                    onChange={e => setEditingBrecha({ ...editingBrecha, tipo: e.target.value as 'confidencialidad' | 'integridad' | 'disponibilidad' })}
                    className="w-full px-4 py-2 bg-theme-tertiary border border-theme rounded-xl text-theme-primary focus:outline-none focus:ring-2 focus:ring-accent"
                  >
                    <option value="confidencialidad">Confidencialidad</option>
                    <option value="integridad">Integridad</option>
                    <option value="disponibilidad">Disponibilidad</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-theme-secondary mb-2">
                    Categorías de Datos Afectados (separadas por coma)
                  </label>
                  <input
                    type="text"
                    value={editingBrecha.categoriaDatos.join(', ')}
                    onChange={e => setEditingBrecha({ 
                      ...editingBrecha, 
                      categoriaDatos: e.target.value.split(',').map(s => s.trim()).filter(Boolean)
                    })}
                    className="w-full px-4 py-2 bg-theme-tertiary border border-theme rounded-xl text-theme-primary focus:outline-none focus:ring-2 focus:ring-accent"
                    placeholder="ej. Identificativos, Datos de salud, Datos financieros"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-theme-secondary mb-2">
                    Medidas Inmediatas Adoptadas (separadas por coma)
                  </label>
                  <input
                    type="text"
                    value={editingBrecha.medidasInmediatas.join(', ')}
                    onChange={e => setEditingBrecha({ 
                      ...editingBrecha, 
                      medidasInmediatas: e.target.value.split(',').map(s => s.trim()).filter(Boolean)
                    })}
                    className="w-full px-4 py-2 bg-theme-tertiary border border-theme rounded-xl text-theme-primary focus:outline-none focus:ring-2 focus:ring-accent"
                    placeholder="ej. Aislamiento del sistema, Cambio de contraseñas"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-theme-secondary mb-2">
                    Medidas Correctivas (separadas por coma)
                  </label>
                  <input
                    type="text"
                    value={editingBrecha.medidasCorrectivas.join(', ')}
                    onChange={e => setEditingBrecha({ 
                      ...editingBrecha, 
                      medidasCorrectivas: e.target.value.split(',').map(s => s.trim()).filter(Boolean)
                    })}
                    className="w-full px-4 py-2 bg-theme-tertiary border border-theme rounded-xl text-theme-primary focus:outline-none focus:ring-2 focus:ring-accent"
                    placeholder="ej. Implementación de 2FA, Auditoría de seguridad"
                  />
                </div>

                <div className="border-t border-theme pt-4">
                  <h4 className="text-md font-semibold text-theme-primary mb-4 flex items-center gap-2">
                    <Bell className="w-4 h-4" />
                    Notificaciones
                  </h4>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="flex items-center gap-3">
                      <input
                        type="checkbox"
                        id="notificacionAEPD"
                        checked={editingBrecha.notificacionAEPD}
                        onChange={e => setEditingBrecha({ ...editingBrecha, notificacionAEPD: e.target.checked })}
                        className="w-4 h-4 rounded border-theme text-accent focus:ring-accent"
                      />
                      <label htmlFor="notificacionAEPD" className="text-sm text-theme-secondary">
                        Notificada a la AEPD
                      </label>
                    </div>
                    {editingBrecha.notificacionAEPD && (
                      <div>
                        <label className="block text-sm font-medium text-theme-secondary mb-2">
                          Fecha de notificación AEPD
                        </label>
                        <input
                          type="date"
                          value={editingBrecha.fechaNotificacionAEPD || ''}
                          onChange={e => setEditingBrecha({ ...editingBrecha, fechaNotificacionAEPD: e.target.value })}
                          className="w-full px-4 py-2 bg-theme-tertiary border border-theme rounded-xl text-theme-primary focus:outline-none focus:ring-2 focus:ring-accent"
                        />
                      </div>
                    )}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                    <div className="flex items-center gap-3">
                      <input
                        type="checkbox"
                        id="afectadoDPD"
                        checked={editingBrecha.afectadoDPD}
                        onChange={e => setEditingBrecha({ ...editingBrecha, afectadoDPD: e.target.checked })}
                        className="w-4 h-4 rounded border-theme text-accent focus:ring-accent"
                      />
                      <label htmlFor="afectadoDPD" className="text-sm text-theme-secondary">
                        Afectado al Delegado de Protección de Datos
                      </label>
                    </div>
                    <div className="flex items-center gap-3">
                      <input
                        type="checkbox"
                        id="afectadosNotificados"
                        checked={editingBrecha.afectadosNotificados}
                        onChange={e => setEditingBrecha({ ...editingBrecha, afectadosNotificados: e.target.checked })}
                        className="w-4 h-4 rounded border-theme text-accent focus:ring-accent"
                      />
                      <label htmlFor="afectadosNotificados" className="text-sm text-theme-secondary">
                        Afectados notificados
                      </label>
                    </div>
                  </div>
                </div>

                {editingBrecha.estado === 'cerrada' && (
                  <div>
                    <label className="block text-sm font-medium text-theme-secondary mb-2">
                      Resultado / Resolución
                    </label>
                    <textarea
                      value={editingBrecha.resultado || ''}
                      onChange={e => setEditingBrecha({ ...editingBrecha, resultado: e.target.value })}
                      className="w-full px-4 py-2 bg-theme-tertiary border border-theme rounded-xl text-theme-primary focus:outline-none focus:ring-2 focus:ring-accent h-20 resize-none"
                      placeholder="Describa el resultado de la gestión de la brecha..."
                    />
                  </div>
                )}
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

export default Brechas;

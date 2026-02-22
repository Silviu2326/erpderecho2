import { motion, AnimatePresence } from 'framer-motion';
import {
  X, Mail, Phone, Globe, Calendar, CheckCircle, AlertTriangle,
  RefreshCw, Key, Webhook, Settings, Activity, Clock, Zap
} from 'lucide-react';

export interface Integracion {
  id: number;
  nombre: string;
  tipo: string;
  descripcion: string;
  estado: 'activa' | 'inactiva' | 'error' | 'pendiente';
  proveedor: string;
  emailContacto: string;
  telefono?: string;
  sitioWeb?: string;
  webhookUrl?: string;
  apiKeyConfigurada: boolean;
  ultimaSincronizacion: string;
  fechaCreacion: string;
  peticionesMes: number;
  limitePeticiones: number;
  funcionalidades: string[];
}

interface IntegracionDetailProps {
  integracion: Integracion | null;
  isOpen: boolean;
  onClose: () => void;
}

const getEstadoBadge = (estado: string) => {
  const styles: Record<string, string> = {
    activa: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
    inactiva: 'bg-slate-500/10 text-slate-400 border-slate-500/20',
    error: 'bg-red-500/10 text-red-400 border-red-500/20',
    pendiente: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
  };
  const labels: Record<string, string> = {
    activa: 'Activa',
    inactiva: 'Inactiva',
    error: 'Error',
    pendiente: 'Pendiente',
  };
  return { style: styles[estado] || styles.inactiva, label: labels[estado] || estado };
};

const getTipoIcon = (tipo: string) => {
  const icons: Record<string, string> = {
    'crm': 'bg-blue-500/20 text-blue-400',
    'pago': 'bg-green-500/20 text-green-400',
    'email': 'bg-purple-500/20 text-purple-400',
    'storage': 'bg-amber-500/20 text-amber-400',
    'analytics': 'bg-cyan-500/20 text-cyan-400',
    'api': 'bg-pink-500/20 text-pink-400',
    'webhook': 'bg-indigo-500/20 text-indigo-400',
  };
  return icons[tipo.toLowerCase()] || 'bg-slate-500/20 text-slate-400';
};

export default function IntegracionDetail({ integracion, isOpen, onClose }: IntegracionDetailProps) {
  if (!integracion) return null;

  const { style: estadoStyle, label: estadoLabel } = getEstadoBadge(integracion.estado);
  const tipoColor = getTipoIcon(integracion.tipo);
  const usoPorcentaje = Math.round((integracion.peticionesMes / integracion.limitePeticiones) * 100);

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="sticky top-0 bg-slate-900 border-b border-slate-800 p-6 flex items-center justify-between z-10">
              <div className="flex items-center gap-4">
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${tipoColor}`}>
                  <Webhook className="w-6 h-6" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-white">{integracion.nombre}</h2>
                  <p className="text-sm text-slate-400 capitalize">{integracion.tipo}</p>
                </div>
              </div>
              <button 
                onClick={onClose} 
                className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-6">
              <div className="flex items-center justify-between">
                <span className={`px-3 py-1.5 text-sm font-medium rounded-full border ${estadoStyle}`}>
                  {estadoLabel}
                </span>
                {integracion.estado === 'activa' && (
                  <div className="flex items-center gap-2 text-emerald-400 text-sm">
                    <Activity className="w-4 h-4" />
                    <span>Operativa</span>
                  </div>
                )}
                {integracion.estado === 'error' && (
                  <div className="flex items-center gap-2 text-red-400 text-sm">
                    <AlertTriangle className="w-4 h-4" />
                    <span>Requiere atención</span>
                  </div>
                )}
              </div>

              <p className="text-slate-300">{integracion.descripcion}</p>

              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 bg-slate-800/50 rounded-xl">
                  <div className="flex items-center gap-2 text-slate-400 mb-1">
                    <Globe className="w-4 h-4" />
                    <p className="text-xs">Proveedor</p>
                  </div>
                  <p className="text-sm text-white font-medium">{integracion.proveedor}</p>
                </div>
                <div className="p-4 bg-slate-800/50 rounded-xl">
                  <div className="flex items-center gap-2 text-slate-400 mb-1">
                    <Calendar className="w-4 h-4" />
                    <p className="text-xs">Fecha de Creación</p>
                  </div>
                  <p className="text-sm text-white">{integracion.fechaCreacion}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 bg-slate-800/50 rounded-xl">
                  <div className="flex items-center gap-2 text-slate-400 mb-1">
                    <Mail className="w-4 h-4" />
                    <p className="text-xs">Email de Contacto</p>
                  </div>
                  <p className="text-sm text-white">{integracion.emailContacto}</p>
                </div>
                {integracion.telefono && (
                  <div className="p-4 bg-slate-800/50 rounded-xl">
                    <div className="flex items-center gap-2 text-slate-400 mb-1">
                      <Phone className="w-4 h-4" />
                      <p className="text-xs">Teléfono</p>
                    </div>
                    <p className="text-sm text-white">{integracion.telefono}</p>
                  </div>
                )}
              </div>

              {integracion.webhookUrl && (
                <div className="p-4 bg-slate-800/50 rounded-xl">
                  <div className="flex items-center gap-2 text-slate-400 mb-2">
                    <Webhook className="w-4 h-4" />
                    <p className="text-xs">Webhook URL</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <code className="flex-1 text-xs text-slate-300 bg-slate-800 px-3 py-2 rounded-lg truncate">
                      {integracion.webhookUrl}
                    </code>
                    <button className="p-2 text-slate-400 hover:text-white hover:bg-slate-700 rounded-lg" title="Copiar">
                      <Key className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              )}

              <div className="p-4 bg-slate-800/50 rounded-xl">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2 text-slate-400">
                    <Zap className="w-4 h-4" />
                    <p className="text-xs">Uso de API</p>
                  </div>
                  <span className="text-sm text-white font-medium">
                    {integracion.peticionesMes.toLocaleString()} / {integracion.limitePeticiones.toLocaleString()}
                  </span>
                </div>
                <div className="h-2 bg-slate-700 rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${usoPorcentaje}%` }}
                    transition={{ duration: 0.5, delay: 0.2 }}
                    className={`h-full rounded-full ${
                      usoPorcentaje > 90 ? 'bg-red-500' :
                      usoPorcentaje > 70 ? 'bg-amber-500' :
                      'bg-emerald-500'
                    }`}
                  />
                </div>
                <p className="text-xs text-slate-500 mt-2">{usoPorcentaje}% utilizado este mes</p>
              </div>

              <div className="p-4 bg-slate-800/50 rounded-xl">
                <div className="flex items-center gap-2 text-slate-400 mb-2">
                  <RefreshCw className="w-4 h-4" />
                  <p className="text-xs">Última Sincronización</p>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-slate-500" />
                  <p className="text-sm text-white">{integracion.ultimaSincronizacion}</p>
                </div>
              </div>

              <div className="p-4 bg-slate-800/50 rounded-xl">
                <div className="flex items-center gap-2 text-slate-400 mb-3">
                  <Settings className="w-4 h-4" />
                  <p className="text-xs">Configuración</p>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-slate-300">API Key Configurada</span>
                    {integracion.apiKeyConfigurada ? (
                      <span className="flex items-center gap-1 text-emerald-400 text-sm">
                        <CheckCircle className="w-4 h-4" />
                        Configurada
                      </span>
                    ) : (
                      <span className="flex items-center gap-1 text-amber-400 text-sm">
                        <AlertTriangle className="w-4 h-4" />
                        Pendiente
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {integracion.funcionalidades && integracion.funcionalidades.length > 0 && (
                <div className="p-4 bg-slate-800/50 rounded-xl">
                  <p className="text-xs text-slate-400 mb-3">Funcionalidades</p>
                  <div className="flex flex-wrap gap-2">
                    {integracion.funcionalidades.map((func, index) => (
                      <span 
                        key={index}
                        className="px-2.5 py-1 text-xs font-medium bg-slate-700 text-slate-300 rounded-full"
                      >
                        {func}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="sticky bottom-0 bg-slate-900 border-t border-slate-800 p-6 flex gap-3">
              <button 
                onClick={onClose}
                className="flex-1 px-4 py-2.5 bg-slate-800 text-white rounded-xl hover:bg-slate-700 transition-colors"
              >
                Cerrar
              </button>
              <button 
                className="flex-1 px-4 py-2.5 bg-blue-500 text-white font-medium rounded-xl hover:bg-blue-400 transition-colors"
              >
                Editar Integración
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

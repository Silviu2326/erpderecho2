// M6 - Comunicaciones: Juzgados
// Comunicación con juzgados y tribunales

import { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Building2, Send, Search, FileText, Clock, CheckCircle,
  XCircle, AlertCircle, Plus, Filter, User, Calendar,
  MessageSquare, Paperclip, Eye, Download, ChevronRight
} from 'lucide-react';
import { AppLayout } from '@/components/layout/AppLayout';

// Datos mock
const juzgadosMock = [
  { id: 'JUZ-001', nombre: 'Juzgado de Primera Instancia nº 1', ciudad: 'Madrid', tipo: 'Primera Instancia',direccion: 'C/ Gran Vía 1', telefono: '91 123 45 67' },
  { id: 'JUZ-002', nombre: 'Audiencia Provincial de Madrid', ciudad: 'Madrid', tipo: 'Audiencia', direccion: 'C/ Génova 17', telefono: '91 234 56 78' },
  { id: 'JUZ-003', nombre: 'Juzgado de lo Social nº 5', ciudad: 'Madrid', tipo: 'Social', direccion: 'C/ Pradillo 40', telefono: '91 345 67 89' },
  { id: 'JUZ-004', nombre: 'Juzgado de lo Contencioso-Administrativo', ciudad: 'Madrid', tipo: 'Contencioso', direccion: 'C/ Mayor 69', telefono: '91 456 78 90' },
];

const comunicacionesMock = [
  { id: 'COM-001', expediente: 'EXP-2024-001', juzgado: 'Juzgado de Primera Instancia nº 1', asunto: 'Demanda laboral', tipo: 'enviado', fecha: '2024-05-15', estado: 'entregado' },
  { id: 'COM-002', expediente: 'EXP-2024-002', juzgado: 'Juzgado de lo Social nº 5', asunto: 'Recurso', tipo: 'recibido', fecha: '2024-05-14', estado: 'leido' },
  { id: 'COM-003', expediente: 'EXP-2024-003', juzgado: 'Audiencia Provincial de Madrid', asunto: 'Sentencia', tipo: 'recibido', fecha: '2024-05-12', estado: 'pendiente' },
  { id: 'COM-004', expediente: 'EXP-2024-001', juzgado: 'Juzgado de Primera Instancia nº 1', asunto: 'Acumulación', tipo: 'enviado', fecha: '2024-05-10', estado: 'entregado' },
];

const BandejaEntrada = () => {
  const [activeTab, setActiveTab] = useState<'bandeja' | 'enviados' | 'juzgados'>('bandeja');
  const [selectedJuzgado, setSelectedJuzgado] = useState<typeof jailsMock[0] | null>(null);
  const [showCompose, setShowCompose] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  const getEstadoIcon = (estado: string) => {
    switch (estado) {
      case 'entregado': return <CheckCircle className="w-4 h-4 text-emerald-400" />;
      case 'leido': return <Eye className="w-4 h-4 text-blue-400" />;
      case 'pendiente': return <Clock className="w-4 h-4 text-amber-400" />;
      default: return <AlertCircle className="w-4 h-4 text-red-400" />;
    }
  };

  const getTipoIcon = (tipo: string) => {
    return tipo === 'enviado' ? <Send className="w-4 h-4 text-accent" /> : <MessageSquare className="w-4 h-4 text-emerald-400" />;
  };

  return (
    <AppLayout title="Juzgados" subtitle="Comunicación con juzgados y tribunales">
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-theme-primary">Comunicaciones con Juzgados</h1>
          <p className="text-theme-secondary">Gestión de comunicaciones con tribunales</p>
        </div>
        <button
          onClick={() => setShowCompose(true)}
          className="flex items-center gap-2 px-4 py-2 bg-accent text-white font-medium rounded-xl hover:bg-accent-hover transition-colors"
        >
          <Plus className="w-4 h-4" />
          Nueva Comunicación
        </button>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-theme">
        {[
          { id: 'bandeja', label: 'Bandeja de Entrada', count: 2 },
          { id: 'enviados', label: 'Enviados', count: 15 },
          { id: 'juzgados', label: 'Juzgados', count: 4 },
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`flex items-center gap-2 px-4 py-3 border-b-2 transition-colors ${
              activeTab === tab.id
                ? 'border-accent text-accent'
                : 'border-transparent text-theme-secondary hover:text-theme-primary'
            }`}
          >
            {tab.label}
            {tab.count > 0 && (
              <span className="px-2 py-0.5 text-xs bg-theme-tertiary rounded-full">{tab.count}</span>
            )}
          </button>
        ))}
      </div>

      {/* Contenido: Bandeja de Entrada */}
      {activeTab === 'bandeja' && (
        <div className="space-y-4">
          {/* Filtros */}
          <div className="flex gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-theme-muted" />
              <input
                type="text"
                placeholder="Buscar comunicaciones..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-theme-card border border-theme rounded-xl text-theme-primary placeholder-theme-muted focus:outline-none focus:border-accent"
              />
            </div>
            <select className="px-4 py-2 bg-theme-card border border-theme rounded-xl text-theme-primary">
              <option>Todos los estados</option>
              <option>Pendiente</option>
              <option>Leído</option>
              <option>Entregado</option>
            </select>
          </div>

          {/* Lista de comunicaciones */}
          <div className="space-y-2">
            {comunicacionesMock.filter(c => c.tipo === 'recibido').map((com) => (
              <motion.div
                key={com.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-theme-card border border-theme rounded-xl p-4 hover:border-accent/50 transition-colors cursor-pointer"
              >
                <div className="flex items-start gap-4">
                  <div className="mt-1">{getTipoIcon(com.tipo)}</div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <h3 className="font-medium text-theme-primary">{com.asunto}</h3>
                      {getEstadoIcon(com.estado)}
                    </div>
                    <p className="text-sm text-theme-secondary">{com.juzgado}</p>
                    <p className="text-xs text-theme-muted mt-1">Exp: {com.expediente} • {new Date(com.fecha).toLocaleDateString('es-ES')}</p>
                  </div>
                  <button className="p-2 text-theme-muted hover:text-theme-primary">
                    <ChevronRight className="w-5 h-5" />
                  </button>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      )}

      {/* Contenido: Enviados */}
      {activeTab === 'enviados' && (
        <div className="space-y-2">
          {comunicacionesMock.filter(c => c.tipo === 'enviado').map((com) => (
            <motion.div
              key={com.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-theme-card border border-theme rounded-xl p-4 hover:border-accent/50 transition-colors cursor-pointer"
            >
              <div className="flex items-start gap-4">
                <div className="mt-1">{getTipoIcon(com.tipo)}</div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <h3 className="font-medium text-theme-primary">{com.asunto}</h3>
                    {getEstadoIcon(com.estado)}
                  </div>
                  <p className="text-sm text-theme-secondary">Para: {com.juzgado}</p>
                  <p className="text-xs text-theme-muted mt-1">Exp: {com.expediente} • {new Date(com.fecha).toLocaleDateString('es-ES')}</p>
                </div>
                <button className="p-2 text-theme-muted hover:text-theme-primary">
                  <Eye className="w-5 h-5" />
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* Contenido: Juzgados */}
      {activeTab === 'juzgados' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {juzgadosMock.map((juzgado) => (
            <motion.div
              key={juzgado.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-theme-card border border-theme rounded-xl p-4 hover:border-accent/50 transition-colors cursor-pointer"
              onClick={() => setSelectedJuzgado(juzgado)}
            >
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-theme-tertiary rounded-xl flex items-center justify-center">
                  <Building2 className="w-6 h-6 text-theme-muted" />
                </div>
                <div className="flex-1">
                  <h3 className="font-medium text-theme-primary">{juzgado.nombre}</h3>
                  <p className="text-sm text-theme-secondary">{juzgado.ciudad} • {juzgado.tipo}</p>
                  <p className="text-xs text-theme-muted mt-2">{juzgado.direccion}</p>
                  <p className="text-xs text-theme-muted">{juzgado.telefono}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* Modal: Nueva Comunicación */}
      {showCompose && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60"
          onClick={() => setShowCompose(false)}
        >
          <motion.div
            initial={{ scale: 0.95 }}
            animate={{ scale: 1 }}
            className="bg-theme-secondary border border-theme rounded-2xl p-6 max-w-2xl w-full"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 className="text-xl font-bold text-theme-primary mb-6">Nueva Comunicación</h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-theme-primary mb-2">Juzgado</label>
                <select className="w-full px-4 py-2 bg-theme-tertiary border border-theme rounded-xl text-theme-primary">
                  <option>Seleccionar juzgado...</option>
                  {juzgadosMock.map(j => (
                    <option key={j.id} value={j.id}>{j.nombre}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-theme-primary mb-2">Expediente</label>
                <input
                  type="text"
                  placeholder="EXP-2024-XXX"
                  className="w-full px-4 py-2 bg-theme-tertiary border border-theme rounded-xl text-theme-primary"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-theme-primary mb-2">Asunto</label>
                <input
                  type="text"
                  placeholder="Asunto de la comunicación"
                  className="w-full px-4 py-2 bg-theme-tertiary border border-theme rounded-xl text-theme-primary"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-theme-primary mb-2">Mensaje</label>
                <textarea
                  rows={6}
                  placeholder="Escribe tu comunicación..."
                  className="w-full px-4 py-2 bg-theme-tertiary border border-theme rounded-xl text-theme-primary resize-none"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-theme-primary mb-2">Adjuntos</label>
                <div className="border-2 border-dashed border-theme rounded-xl p-4 text-center">
                  <Paperclip className="w-8 h-8 text-theme-muted mx-auto mb-2" />
                  <p className="text-sm text-theme-secondary">Arrastra archivos o haz clic para subir</p>
                </div>
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setShowCompose(false)}
                className="flex-1 py-3 border border-theme text-theme-secondary rounded-xl hover:bg-theme-tertiary transition-colors"
              >
                Cancelar
              </button>
              <button className="flex-1 py-3 bg-accent text-white font-medium rounded-xl hover:bg-accent-hover transition-colors flex items-center justify-center gap-2">
                <Send className="w-4 h-4" />
                Enviar
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </div>
    </AppLayout>
  );
};

export default BandejaEntrada;

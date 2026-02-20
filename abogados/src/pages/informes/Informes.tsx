// M12 - Biblioteca Forense: Informes Periciales
// Generación de informes periciales

import { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  FileText, Plus, Search, Download, Eye, Trash2,
  Calendar, User, Clock, CheckCircle, AlertCircle,
  FileSignature, Printer, Share2
} from 'lucide-react';

// Datos mock
const informesMock = [
  { 
    id: 'INF-001', 
    titulo: 'Informe pericial - Suplantación de identidad',
    tipo: 'Documental',
    cliente: 'Carlos García',
    expediente: 'EXP-2024-001',
    estado: 'completado',
    fechaCreacion: '2024-05-15',
    fechaEntrega: '2024-05-18',
    paginas: 24
  },
  { 
    id: 'INF-002', 
    titulo: 'Análisis grafonormativo - Firma disputada',
    tipo: 'Grafológico',
    cliente: 'María López',
    expediente: 'EXP-2024-002',
    estado: 'en_proceso',
    fechaCreacion: '2024-05-19',
    fechaEntrega: null,
    paginas: 0
  },
  { 
    id: 'INF-003', 
    titulo: 'Informe técnico - Software piracy',
    tipo: 'Informático',
    cliente: 'TechCorp S.L.',
    expediente: 'EXP-2024-003',
    estado: 'completado',
    fechaCreacion: '2024-05-10',
    fechaEntrega: '2024-05-12',
    paginas: 45
  },
  { 
    id: 'INF-004', 
    titulo: 'Valoraci\u00f3n da\u00f1os - Accidente tr\u00e1fico',
    tipo: 'Accidentes',
    cliente: 'Juan Sánchez',
    expediente: 'EXP-2024-004',
    estado: 'pendiente',
    fechaCreacion: '2024-05-20',
    fechaEntrega: null,
    paginas: 0
  },
];

const plantillasInformes = [
  { id: 'p1', nombre: 'Informe pericial estándar', tipo: 'General' },
  { id: 'p2', nombre: 'Análisis grafonormativo', tipo: 'Grafológico' },
  { id: 'p3', nombre: 'Informe técnico informatico', tipo: 'Informático' },
  { id: 'p4', nombre: 'Valoración de daños', tipo: 'Accidentes' },
  { id: 'p5', nombre: 'Informe de autenticidad documental', tipo: 'Documental' },
];

export default function ForenseInformes() {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterEstado, setFilterEstado] = useState('todos');
  const [showNewModal, setShowNewModal] = useState(false);
  const [selectedInforme, setSelectedInforme] = useState<typeof informesMock[0] | null>(null);

  const filteredInformes = informesMock.filter(informe => {
    const matchesSearch = informe.titulo.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         informe.cliente.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         informe.expediente.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesEstado = filterEstado === 'todos' || informe.estado === filterEstado;
    return matchesSearch && matchesEstado;
  });

  const getEstadoBadge = (estado: string) => {
    switch (estado) {
      case 'completado':
        return <span className="px-2 py-1 text-xs rounded-full bg-emerald-500/10 text-emerald-400">Completado</span>;
      case 'en_proceso':
        return <span className="px-2 py-1 text-xs rounded-full bg-blue-500/10 text-blue-400">En proceso</span>;
      case 'pendiente':
        return <span className="px-2 py-1 text-xs rounded-full bg-amber-500/10 text-amber-400">Pendiente</span>;
      default:
        return null;
    }
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-theme-primary">Informes Periciales</h1>
          <p className="text-theme-secondary">Generación y gestión de informes forenses</p>
        </div>
        <button
          onClick={() => setShowNewModal(true)}
          className="flex items-center gap-2 px-4 py-2 bg-accent text-white font-medium rounded-xl hover:bg-accent-hover transition-colors"
        >
          <Plus className="w-4 h-4" />
          Nuevo Informe
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-theme-card border border-theme rounded-xl p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-500/20 rounded-xl flex items-center justify-center">
              <FileText className="w-5 h-5 text-blue-400" />
            </div>
            <div>
              <p className="text-2xl font-bold text-theme-primary">{informesMock.length}</p>
              <p className="text-sm text-theme-secondary">Total informes</p>
            </div>
          </div>
        </div>
        <div className="bg-theme-card border border-theme rounded-xl p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-emerald-500/20 rounded-xl flex items-center justify-center">
              <CheckCircle className="w-5 h-5 text-emerald-400" />
            </div>
            <div>
              <p className="text-2xl font-bold text-theme-primary">{informesMock.filter(i => i.estado === 'completado').length}</p>
              <p className="text-sm text-theme-secondary">Completados</p>
            </div>
          </div>
        </div>
        <div className="bg-theme-card border border-theme rounded-xl p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-500/20 rounded-xl flex items-center justify-center">
              <Clock className="w-5 h-5 text-blue-400" />
            </div>
            <div>
              <p className="text-2xl font-bold text-theme-primary">{informesMock.filter(i => i.estado === 'en_proceso').length}</p>
              <p className="text-sm text-theme-secondary">En proceso</p>
            </div>
          </div>
        </div>
        <div className="bg-theme-card border border-theme rounded-xl p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-amber-500/20 rounded-xl flex items-center justify-center">
              <AlertCircle className="w-5 h-5 text-amber-400" />
            </div>
            <div>
              <p className="text-2xl font-bold text-theme-primary">{informesMock.filter(i => i.estado === 'pendiente').length}</p>
              <p className="text-sm text-theme-secondary">Pendientes</p>
            </div>
          </div>
        </div>
      </div>

      {/* Filtros */}
      <div className="flex flex-wrap gap-4 bg-theme-card border border-theme rounded-xl p-4">
        <div className="flex-1 min-w-[200px]">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-theme-muted" />
            <input
              type="text"
              placeholder="Buscar informes..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-theme-tertiary border border-theme rounded-xl text-theme-primary placeholder-theme-muted focus:outline-none focus:border-accent"
            />
          </div>
        </div>
        <select
          value={filterEstado}
          onChange={(e) => setFilterEstado(e.target.value)}
          className="px-4 py-2 bg-theme-tertiary border border-theme rounded-xl text-theme-primary focus:outline-none focus:border-accent"
        >
          <option value="todos">Todos los estados</option>
          <option value="pendiente">Pendiente</option>
          <option value="en_proceso">En proceso</option>
          <option value="completado">Completado</option>
        </select>
      </div>

      {/* Lista de informes */}
      <div className="space-y-3">
        {filteredInformes.map((informe) => (
          <motion.div
            key={informe.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-theme-card border border-theme rounded-xl p-4 hover:border-accent/50 transition-colors cursor-pointer"
            onClick={() => setSelectedInforme(informe)}
          >
            <div className="flex items-start justify-between">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-theme-tertiary rounded-xl flex items-center justify-center">
                  <FileSignature className="w-6 h-6 text-theme-muted" />
                </div>
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-medium text-theme-primary">{informe.titulo}</h3>
                    {getEstadoBadge(informe.estado)}
                  </div>
                  <div className="flex items-center gap-4 text-sm text-theme-secondary">
                    <span className="flex items-center gap-1">
                      <User className="w-3 h-3" />
                      {informe.cliente}
                    </span>
                    <span className="flex items-center gap-1">
                      <FileText className="w-3 h-3" />
                      {informe.expediente}
                    </span>
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      {informe.fechaCreacion}
                    </span>
                  </div>
                </div>
              </div>
              <div className="flex gap-2">
                {informe.estado === 'completado' && (
                  <>
                    <button className="p-2 text-theme-muted hover:text-theme-primary hover:bg-theme-tertiary rounded-lg">
                      <Eye className="w-4 h-4" />
                    </button>
                    <button className="p-2 text-theme-muted hover:text-theme-primary hover:bg-theme-tertiary rounded-lg">
                      <Download className="w-4 h-4" />
                    </button>
                    <button className="p-2 text-theme-muted hover:text-theme-primary hover:bg-theme-tertiary rounded-lg">
                      <Printer className="w-4 h-4" />
                    </button>
                  </>
                )}
                {informe.estado === 'en_proceso' && (
                  <button className="p-2 text-blue-400 hover:bg-blue-500/10 rounded-lg">
                    <FileSignature className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Plantillas */}
      <div className="bg-theme-card border border-theme rounded-xl p-4">
        <h3 className="font-semibold text-theme-primary mb-3">Plantillas disponibles</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {plantillasInformes.map((plantilla) => (
            <button
              key={plantilla.id}
              onClick={() => setShowNewModal(true)}
              className="p-3 bg-theme-tertiary/50 rounded-xl text-left hover:bg-theme-tertiary transition-colors"
            >
              <p className="font-medium text-theme-primary text-sm">{plantilla.nombre}</p>
              <p className="text-xs text-theme-muted">{plantilla.tipo}</p>
            </button>
          ))}
        </div>
      </div>

      {/* Modal nuevo informe */}
      {showNewModal && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60"
          onClick={() => setShowNewModal(false)}
        >
          <motion.div
            initial={{ scale: 0.95 }}
            animate={{ scale: 1 }}
            className="bg-theme-secondary border border-theme rounded-2xl p-6 max-w-md w-full"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 className="text-xl font-bold text-theme-primary mb-4">Nuevo Informe Pericial</h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-theme-primary mb-2">Título</label>
                <input
                  type="text"
                  placeholder="Título del informe..."
                  className="w-full px-4 py-2 bg-theme-tertiary border border-theme rounded-xl text-theme-primary"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-theme-primary mb-2">Tipo de informe</label>
                <select className="w-full px-4 py-2 bg-theme-tertiary border border-theme rounded-xl text-theme-primary">
                  {plantillasInformes.map(p => (
                    <option key={p.id} value={p.id}>{p.nombre}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-theme-primary mb-2">Expediente relacionado</label>
                <input
                  type="text"
                  placeholder="EXP-2024-XXX"
                  className="w-full px-4 py-2 bg-theme-tertiary border border-theme rounded-xl text-theme-primary"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-theme-primary mb-2">Cliente</label>
                <input
                  type="text"
                  placeholder="Nombre del cliente..."
                  className="w-full px-4 py-2 bg-theme-tertiary border border-theme rounded-xl text-theme-primary"
                />
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setShowNewModal(false)}
                className="flex-1 py-3 border border-theme text-theme-secondary rounded-xl hover:bg-theme-tertiary"
              >
                Cancelar
              </button>
              <button className="flex-1 py-3 bg-accent text-white font-medium rounded-xl hover:bg-accent-hover">
                Crear Informe
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </div>
  );
}

// M1 - Core Legal: Prescripciones
// Gestión de plazos de prescripción de expedientes

import { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Clock, AlertTriangle, CheckCircle, XCircle, 
  Calendar, Filter, Search, FolderOpen, ChevronRight
} from 'lucide-react';
import { useLocalStorage } from '@/hooks/useLocalStorage';
import { useDebounce } from '@/hooks/useDebounce';
import { TableSkeleton, StatsSkeleton } from '@/components/ui/Skeleton';
import { EmptyState } from '@/components/ui/EmptyState';

// Datos mock
const prescripcionesMock = [
  { id: 'EXP-2024-001', caso: 'Demanda laboral - García', tipo: 'laboral', fechaInicio: '2024-01-15', fechaPrescripcion: '2027-01-15', diasRestantes: 365, estado: 'activa', abogado: 'María González' },
  { id: 'EXP-2024-002', caso: 'Divorcio - Martínez', tipo: 'familia', fechaInicio: '2024-03-10', fechaPrescripcion: '2026-03-10', diasRestantes: 20, estado: 'peligro', abogado: 'Carlos Ruiz' },
  { id: 'EXP-2024-003', caso: 'Reclamación deuda - TechCorp', tipo: 'civil', fechaInicio: '2024-06-20', fechaPrescripcion: '2026-06-20', diasRestantes: 120, estado: 'activa', abogado: 'Ana López' },
  { id: 'EXP-2024-004', caso: 'Accidente tráfico - Sánchez', tipo: 'penal', fechaInicio: '2023-11-01', fechaPrescripcion: '2025-11-01', diasRestantes: -111, estado: 'prescrita', abogado: 'María González' },
  { id: 'EXP-2024-005', caso: 'Despido - Rodríguez', tipo: 'laboral', fechaInicio: '2025-01-20', fechaPrescripcion: '2028-01-20', diasRestantes: 700, estado: 'activa', abogado: 'Carlos Ruiz' },
];

const tiposExpediente = ['todos', 'civil', 'penal', 'laboral', 'familia', 'administrativo'];

export default function Prescripciones() {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterTipo, setFilterTipo] = useLocalStorage('prescripciones-tipo', 'todos');
  const [filterEstado, setFilterEstado] = useLocalStorage('prescripciones-estado', 'todos');
  const [isLoading, setIsLoading] = useState(false);
  const debouncedSearch = useDebounce(searchTerm, 300);

  const filteredData = prescripcionesMock.filter(item => {
    const matchesSearch = item.caso.toLowerCase().includes(debouncedSearch.toLowerCase()) || 
                         item.id.toLowerCase().includes(debouncedSearch.toLowerCase());
    const matchesTipo = filterTipo === 'todos' || item.tipo === filterTipo;
    const matchesEstado = filterEstado === 'todos' || item.estado === filterEstado;
    return matchesSearch && matchesTipo && matchesEstado;
  });

  const getEstadoColor = (estado: string) => {
    switch (estado) {
      case 'activa': return 'text-emerald-400 bg-emerald-400/10';
      case 'peligro': return 'text-amber-400 bg-amber-400/10';
      case 'prescrita': return 'text-red-400 bg-red-400/10';
      default: return 'text-gray-400 bg-gray-400/10';
    }
  };

  const getDiasColor = (dias: number) => {
    if (dias < 0) return 'text-red-400';
    if (dias < 30) return 'text-red-400';
    if (dias < 90) return 'text-amber-400';
    return 'text-emerald-400';
  };

  const prescripcionesActivas = prescripcionesMock.filter(p => p.estado === 'activa').length;
  const prescripcionesPeligro = prescripcionesMock.filter(p => p.estado === 'peligro').length;
  const prescripcionesPrescritas = prescripcionesMock.filter(p => p.estado === 'prescrita').length;

      {/* Empty State */}
      {!isLoading && filteredData.length === 0 && (
        <EmptyState
          icon={Clock}
          title="No se encontraron prescripciones"
          description="No hay prescripciones que coincidan con los filtros aplicados"
          action={{ 
            label: "Limpiar filtros", 
            onClick: () => {
              setSearchTerm('');
              setFilterTipo('todos');
              setFilterEstado('todos');
            }
          }}
        />
      )}

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-theme-primary">Prescripciones</h1>
          <p className="text-theme-secondary">Control de plazos de prescripción</p>
        </div>
      </div>

      {/* Loading State */}
      {isLoading ? (
        <StatsSkeleton />
      ) : (

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-theme-card border border-theme rounded-xl p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-emerald-500/20 rounded-xl flex items-center justify-center">
              <CheckCircle className="w-5 h-5 text-emerald-400" />
            </div>
            <div>
              <p className="text-2xl font-bold text-theme-primary">{prescripcionesActivas}</p>
              <p className="text-sm text-theme-secondary">Activas</p>
            </div>
          </div>
        </div>
        <div className="bg-theme-card border border-theme rounded-xl p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-amber-500/20 rounded-xl flex items-center justify-center">
              <AlertTriangle className="w-5 h-5 text-amber-400" />
            </div>
            <div>
              <p className="text-2xl font-bold text-theme-primary">{prescripcionesPeligro}</p>
              <p className="text-sm text-theme-secondary">En peligro</p>
            </div>
          </div>
        </div>
        <div className="bg-theme-card border border-theme rounded-xl p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-red-500/20 rounded-xl flex items-center justify-center">
              <XCircle className="w-5 h-5 text-red-400" />
            </div>
            <div>
              <p className="text-2xl font-bold text-theme-primary">{prescripcionesPrescritas}</p>
              <p className="text-sm text-theme-secondary">Prescritas</p>
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
              placeholder="Buscar por caso o expediente..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-theme-tertiary border border-theme rounded-xl text-theme-primary placeholder-theme-muted focus:outline-none focus:border-accent"
            />
          </div>
        </div>
        <select
          value={filterTipo}
          onChange={(e) => setFilterTipo(e.target.value)}
          className="px-4 py-2 bg-theme-tertiary border border-theme rounded-xl text-theme-primary focus:outline-none focus:border-accent"
        >
          {tiposExpediente.map(tipo => (
            <option key={tipo} value={tipo}>
              {tipo === 'todos' ? 'Todos los tipos' : tipo.charAt(0).toUpperCase() + tipo.slice(1)}
            </option>
          ))}
        </select>
        <select
          value={filterEstado}
          onChange={(e) => setFilterEstado(e.target.value)}
          className="px-4 py-2 bg-theme-tertiary border border-theme rounded-xl text-theme-primary focus:outline-none focus:border-accent"
        >
          <option value="todos">Todos los estados</option>
          <option value="activa">Activa</option>
          <option value="peligro">En peligro</option>
          <option value="prescrita">Prescrita</option>
        </select>
      </div>

      {/* Tabla */}
      <div className="bg-theme-card border border-theme rounded-xl overflow-hidden">
        <table className="w-full">
          <thead className="bg-theme-tertiary/50">
            <tr>
              <th className="text-left p-4 text-sm font-medium text-theme-secondary">Expediente</th>
              <th className="text-left p-4 text-sm font-medium text-theme-secondary">Caso</th>
              <th className="text-left p-4 text-sm font-medium text-theme-secondary">Tipo</th>
              <th className="text-left p-4 text-sm font-medium text-theme-secondary">Abogado</th>
              <th className="text-left p-4 text-sm font-medium text-theme-secondary">Inicio</th>
              <th className="text-left p-4 text-sm font-medium text-theme-secondary">Prescripción</th>
              <th className="text-center p-4 text-sm font-medium text-theme-secondary">Días restantes</th>
              <th className="text-center p-4 text-sm font-medium text-theme-secondary">Estado</th>
              <th className="text-center p-4 text-sm font-medium text-theme-secondary">Acción</th>
            </tr>
          </thead>
          <tbody>
            {filteredData.map((item) => (
              <motion.tr 
                key={item.id}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="border-t border-theme hover:bg-theme-tertiary/30"
              >
                <td className="p-4">
                  <div className="flex items-center gap-2">
                    <FolderOpen className="w-4 h-4 text-theme-muted" />
                    <span className="font-medium text-theme-primary">{item.id}</span>
                  </div>
                </td>
                <td className="p-4 text-theme-primary">{item.caso}</td>
                <td className="p-4">
                  <span className="px-2 py-1 text-xs rounded-full bg-theme-tertiary text-theme-secondary capitalize">
                    {item.tipo}
                  </span>
                </td>
                <td className="p-4 text-theme-secondary">{item.abogado}</td>
                <td className="p-4 text-theme-secondary">{new Date(item.fechaInicio).toLocaleDateString('es-ES')}</td>
                <td className="p-4 text-theme-secondary">{new Date(item.fechaPrescripcion).toLocaleDateString('es-ES')}</td>
                <td className={`p-4 text-center font-medium ${getDiasColor(item.diasRestantes)}`}>
                  {item.diasRestantes < 0 ? `Hace ${Math.abs(item.diasRestantes)} días` : `${item.diasRestantes} días`}
                </td>
                <td className="p-4 text-center">
                  <span className={`px-2 py-1 text-xs rounded-full capitalize ${getEstadoColor(item.estado)}`}>
                    {item.estado}
                  </span>
                </td>
                <td className="p-4 text-center">
                  <button className="p-2 text-theme-muted hover:text-theme-primary hover:bg-theme-tertiary rounded-lg transition-colors">
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </td>
              </motion.tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

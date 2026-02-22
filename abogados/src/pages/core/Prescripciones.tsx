// M1 - Core Legal: Prescripciones MEJORADA
// Gestión de plazos de prescripción con UX/UI avanzada

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Clock, AlertTriangle, CheckCircle, XCircle, 
  Calendar, Filter, Search, FolderOpen, ChevronRight,
  Plus, Edit2, Trash2, Eye, Bell, Download, RefreshCw
} from 'lucide-react';
import { useLocalStorage } from '@/hooks/useLocalStorage';
import { useDebounce } from '@/hooks/useDebounce';
import { useToast } from '@/components/ui/Toast';
import { TableSkeleton, StatsSkeleton, CardSkeleton } from '@/components/ui/Skeleton';
import { EmptyState } from '@/components/ui/EmptyState';
import { Breadcrumbs } from '@/components/ui/Breadcrumbs';
import { ErrorState } from '@/components/ui/ErrorState';
import { LoadingOverlay } from '@/components/ui/Loading';
import { Button } from '@/components/ui/Button';
import { Input, Select, Textarea } from '@/components/ui/Form';
import { Card, Badge, Tabs, Progress } from '@/components/ui';
import { Modal } from '@/components/ui/Modal';
import { usePagination } from '@/hooks/usePagination';
import { AppLayout } from '@/components/layout/AppLayout';

// Datos mock mejorados
const prescripcionesMock = [
  { id: 'EXP-2024-001', caso: 'Demanda laboral - García', tipo: 'laboral', fechaInicio: '2024-01-15', fechaPrescripcion: '2027-01-15', diasRestantes: 365, estado: 'activa', abogado: 'María González', prioridad: 'media', recordatorio: true },
  { id: 'EXP-2024-002', caso: 'Divorcio - Martínez', tipo: 'familia', fechaInicio: '2024-03-10', fechaPrescripcion: '2026-03-10', diasRestantes: 20, estado: 'peligro', abogado: 'Carlos Ruiz', prioridad: 'alta', recordatorio: true },
  { id: 'EXP-2024-003', caso: 'Reclamación deuda - TechCorp', tipo: 'civil', fechaInicio: '2024-06-20', fechaPrescripcion: '2026-06-20', diasRestantes: 120, estado: 'activa', abogado: 'Ana López', prioridad: 'baja', recordatorio: false },
  { id: 'EXP-2024-004', caso: 'Accidente tráfico - Sánchez', tipo: 'penal', fechaInicio: '2023-11-01', fechaPrescripcion: '2025-11-01', diasRestantes: -111, estado: 'prescrita', abogado: 'María González', prioridad: 'alta', recordatorio: false },
  { id: 'EXP-2024-005', caso: 'Despido - Rodríguez', tipo: 'laboral', fechaInicio: '2025-01-20', fechaPrescripcion: '2028-01-20', diasRestantes: 700, estado: 'activa', abogado: 'Carlos Ruiz', prioridad: 'media', recordatorio: true },
  { id: 'EXP-2024-006', caso: 'Reclamación alquiler', tipo: 'civil', fechaInicio: '2025-02-15', fechaPrescripcion: '2027-02-15', diasRestantes: 360, estado: 'activa', abogado: 'Ana López', prioridad: 'baja', recordatorio: false },
  { id: 'EXP-2024-007', caso: 'Separación - López', tipo: 'familia', fechaInicio: '2025-06-01', fechaPrescripcion: '2027-06-01', diasRestantes: 465, estado: 'activa', abogado: 'Javier M.', prioridad: 'media', recordatorio: true },
  { id: 'EXP-2024-008', caso: 'Demanda mercantil', tipo: 'civil', fechaInicio: '2025-08-10', fechaPrescripcion: '2027-08-10', diasRestantes: 540, estado: 'activa', abogado: 'María González', prioridad: 'baja', recordatorio: false },
];

const tiposExpediente = ['todos', 'civil', 'penal', 'laboral', 'familia', 'administrativo'];
const estados = ['todos', 'activa', 'peligro', 'prescrita'];
const prioridades = ['todos', 'alta', 'media', 'baja'];
const abogados = ['todos', 'María González', 'Carlos Ruiz', 'Ana López', 'Javier M.'];

export default function Prescripciones() {
  // Estados
  const [searchTerm, setSearchTerm] = useState('');
  const [filterTipo, setFilterTipo] = useLocalStorage('prescripciones-tipo', 'todos');
  const [filterEstado, setFilterEstado] = useLocalStorage('prescripciones-estado', 'todos');
  const [filterPrioridad, setFilterPrioridad] = useLocalStorage('prescripciones-prioridad', 'todos');
  const [filterAbogado, setFilterAbogado] = useLocalStorage('prescripciones-abogado', 'todos');
  const [alertasActivas, setAlertasActivas] = useState(true);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [selectedPrescripcion, setSelectedPrescripcion] = useState<typeof prescripcionesMock[0] | null>(null);
  const [activeTab, setActiveTab] = useState('todas');
  const [showFilters, setShowFilters] = useState(false);
  
  const debouncedSearch = useDebounce(searchTerm, 300);
  const { showToast } = useToast();

  // Pagination
  const {
    currentData: paginatedData,
    currentPage,
    totalPages,
    goToPage,
    hasNextPage,
    hasPrevPage,
    startIndex,
    endIndex,
    totalItems
  } = usePagination({ data: prescripcionesMock });

  // Simular carga
  useEffect(() => {
    setIsLoading(true);
    const timer = setTimeout(() => setIsLoading(false), 1200);
    return () => clearTimeout(timer);
  }, []);

  // Filtrar datos
  const filteredData = prescripcionesMock.filter(item => {
    const matchesSearch = item.caso.toLowerCase().includes(debouncedSearch.toLowerCase()) || 
                         item.id.toLowerCase().includes(debouncedSearch.toLowerCase()) ||
                         item.abogado.toLowerCase().includes(debouncedSearch.toLowerCase());
    const matchesTipo = filterTipo === 'todos' || item.tipo === filterTipo;
    const matchesEstado = filterEstado === 'todos' || item.estado === filterEstado;
    const matchesPrioridad = filterPrioridad === 'todos' || item.prioridad === filterPrioridad;
    const matchesAbogado = filterAbogado === 'todos' || item.abogado === filterAbogado;
    return matchesSearch && matchesTipo && matchesEstado && matchesPrioridad && matchesAbogado;
  });

  // Obtener datos según tab
  const getDataByTab = () => {
    switch (activeTab) {
      case 'activas': return filteredData.filter(p => p.estado === 'activa');
      case 'peligro': return filteredData.filter(p => p.estado === 'peligro');
      case 'prescritas': return filteredData.filter(p => p.estado === 'prescrita');
      default: return filteredData;
    }
  };

  const displayData = getDataByTab();

  // Stats
  const prescripcionesActivas = prescripcionesMock.filter(p => p.estado === 'activa').length;
  const prescripcionesPeligro = prescripcionesMock.filter(p => p.estado === 'peligro').length;
  const prescripcionesPrescritas = prescripcionesMock.filter(p => p.estado === 'prescrita').length;
  const peligroCritico = prescripcionesMock.filter(p => p.diasRestantes > 0 && p.diasRestantes <= 30).length;

  // Handlers
  const handleRefresh = () => {
    setIsLoading(true);
    showToast('Actualizando...', 'info');
    setTimeout(() => {
      setIsLoading(false);
      showToast('Datos actualizados', 'success');
    }, 1500);
  };

  const handleNew = () => {
    setSelectedPrescripcion(null);
    setShowModal(true);
  };

  const handleEdit = (item: typeof prescripcionesMock[0]) => {
    setSelectedPrescripcion(item);
    setShowModal(true);
  };

  const handleDelete = (id: string) => {
    showToast('Prescripción eliminada', 'success');
  };

  const handleExportPDF = () => {
    showToast('Generando PDF...', 'info');
    // Simular generación PDF
    setTimeout(() => {
      showToast('PDF descargado correctamente', 'success');
    }, 1500);
  };

  const handleExportExcel = () => {
    showToast('Generando Excel...', 'info');
    // Simular generación Excel
    setTimeout(() => {
      showToast('Excel descargado correctamente', 'success');
    }, 1500);
  };

  const handleToggleAlertas = () => {
    setAlertasActivas(!alertasActivas);
    showToast(alertasActivas ? 'Alertas desactivadas' : 'Alertas activadas', 'info');
  };

  // Verificar alertas automáticas
  useEffect(() => {
    if (!alertasActivas) return;
    
    const prescripcionesPeligro = filteredData.filter(p => p.diasRestantes > 0 && p.diasRestantes <= 30);
    
    if (prescripcionesPeligro.length > 0) {
      showToast(`⚠️ Tienes ${prescripcionesPeligro.length} prescripciones en peligro`, 'warning');
    }
  }, [filteredData, alertasActivas]);

  const handleToggleRecordatorio = (id: string) => {
    showToast('Recordatorio actualizado', 'success');
  };

  // Badge variants
  const getEstadoBadge = (estado: string) => {
    switch (estado) {
      case 'activa': return 'success';
      case 'peligro': return 'warning';
      case 'prescrita': return 'error';
      default: return 'default';
    }
  };

  const getPrioridadBadge = (prioridad: string) => {
    switch (prioridad) {
      case 'alta': return 'error';
      case 'media': return 'warning';
      case 'baja': return 'info';
      default: return 'default';
    }
  };

  return (
    <AppLayout title="Prescripciones" subtitle="Gestión de plazos de prescripción">
    <div className="p-6 space-y-6">
      {/* Breadcrumbs */}
      <Breadcrumbs
        items={[
          { label: 'Core Legal', path: '/core/expedientes' },
          { label: 'Prescripciones' }
        ]}
      />

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-theme-primary">Prescripciones</h1>
          <p className="text-theme-secondary">Control de plazos de prescripción</p>
        </div>
        <div className="flex gap-2">
          <Button variant="secondary" onClick={handleExportPDF}>
            <Download className="w-4 h-4 mr-2" />
            Exportar
          </Button>
          <Button variant="secondary" onClick={handleRefresh}>
            <RefreshCw className={`w-4 h-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
            Actualizar
          </Button>
          <Button onClick={handleNew}>
            <Plus className="w-4 h-4 mr-2" />
            Nueva
          </Button>
        </div>
      </div>

      {/* Tabs */}
      <Tabs
        tabs={[
          { id: 'todas', label: 'Todas', badge: prescripcionesMock.length },
          { id: 'activas', label: 'Activas', badge: prescripcionesActivas },
          { id: 'peligro', label: 'En peligro', badge: prescripcionesPeligro },
          { id: 'prescritas', label: 'Prescritas', badge: prescripcionesPrescritas }
        ]}
        activeTab={activeTab}
        onChange={setActiveTab}
      />

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card hover>
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-emerald-500/20 rounded-xl flex items-center justify-center">
              <CheckCircle className="w-6 h-6 text-emerald-400" />
            </div>
            <div>
              <p className="text-2xl font-bold text-theme-primary">{prescripcionesActivas}</p>
              <p className="text-sm text-theme-secondary">Activas</p>
            </div>
          </div>
        </Card>
        
        <Card hover>
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-amber-500/20 rounded-xl flex items-center justify-center">
              <AlertTriangle className="w-6 h-6 text-amber-400" />
            </div>
            <div>
              <p className="text-2xl font-bold text-theme-primary">{prescripcionesPeligro}</p>
              <p className="text-sm text-theme-secondary">En peligro</p>
            </div>
          </div>
        </Card>
        
        <Card hover>
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-red-500/20 rounded-xl flex items-center justify-center">
              <XCircle className="w-6 h-6 text-red-400" />
            </div>
            <div>
              <p className="text-2xl font-bold text-theme-primary">{prescripcionesPrescritas}</p>
              <p className="text-sm text-theme-secondary">Prescritas</p>
            </div>
          </div>
        </Card>

        <Card hover>
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-blue-500/20 rounded-xl flex items-center justify-center">
              <Bell className="w-6 h-6 text-blue-400" />
            </div>
            <div>
              <p className="text-2xl font-bold text-theme-primary">{peligroCritico}</p>
              <p className="text-sm text-theme-secondary">Críticas (&lt;30 días)</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex-1 min-w-[200px]">
            <Input
              placeholder="Buscar por caso, expediente o abogado..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              leftIcon={<Search className="w-4 h-4" />}
            />
          </div>
          
          <Select
            value={filterTipo}
            onChange={(e) => setFilterTipo(e.target.value)}
            options={tiposExpediente.map(t => ({ value: t, label: t === 'todos' ? 'Todos los tipos' : t }))}
          />
          
          <Select
            value={filterEstado}
            onChange={(e) => setFilterEstado(e.target.value)}
            options={estados.map(e => ({ value: e, label: e === 'todos' ? 'Todos los estados' : e }))}
          />
          
          <Button 
            variant={showFilters ? 'primary' : 'secondary'}
            onClick={() => setShowFilters(!showFilters)}
          >
            <Filter className="w-4 h-4 mr-2" />
            Filtros
          </Button>
        </div>
      </Card>

      {/* Loading State */}
      {isLoading ? (
        <StatsSkeleton />
      ) : displayData.length === 0 ? (
        <EmptyState
          icon={Clock}
          title="No se encontraron prescripciones"
          description="No hay prescripciones que coincidan con los filtros aplicados"
          action={{ label: "Limpiar filtros", onClick: () => {
            setSearchTerm('');
            setFilterTipo('todos');
            setFilterEstado('todos');
            setFilterPrioridad('todos');
          }}}
        />
      ) : (
        <>
          {/* Table */}
          <Card padding="p-0">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-theme-tertiary/50">
                  <tr>
                    <th className="text-left p-4 text-sm font-medium text-theme-secondary">Expediente</th>
                    <th className="text-left p-4 text-sm font-medium text-theme-secondary">Caso</th>
                    <th className="text-left p-4 text-sm font-medium text-theme-secondary">Tipo</th>
                    <th className="text-left p-4 text-sm font-medium text-theme-secondary">Abogado</th>
                    <th className="text-left p-4 text-sm font-medium text-theme-secondary">Vencimiento</th>
                    <th className="text-center p-4 text-sm font-medium text-theme-secondary">Días restantes</th>
                    <th className="text-center p-4 text-sm font-medium text-theme-secondary">Estado</th>
                    <th className="text-center p-4 text-sm font-medium text-theme-secondary">Prioridad</th>
                    <th className="text-center p-4 text-sm font-medium text-theme-secondary">Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {displayData.map((item, index) => (
                    <motion.tr
                      key={item.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.03 }}
                      className="border-t border-theme hover:bg-theme-tertiary/30"
                    >
                      <td className="p-4">
                        <div className="flex items-center gap-2">
                          <FolderOpen className="w-4 h-4 text-theme-muted" />
                          <span className="font-medium text-theme-primary">{item.id}</span>
                        </div>
                      </td>
                      <td className="p-4 text-theme-primary max-w-[200px] truncate">{item.caso}</td>
                      <td className="p-4">
                        <Badge variant="default">{item.tipo}</Badge>
                      </td>
                      <td className="p-4 text-theme-secondary">{item.abogado}</td>
                      <td className="p-4 text-theme-secondary">
                        {new Date(item.fechaPrescripcion).toLocaleDateString('es-ES')}
                      </td>
                      <td className="p-4 text-center">
                        <span className={`
                          font-bold ${item.diasRestantes < 0 ? 'text-red-400' : 
                            item.diasRestantes < 30 ? 'text-red-400' : 
                            item.diasRestantes < 90 ? 'text-amber-400' : 'text-emerald-400'}
                        `}>
                          {item.diasRestantes < 0 ? `Hace ${Math.abs(item.diasRestantes)} días` : `${item.diasRestantes} días`}
                        </span>
                      </td>
                      <td className="p-4 text-center">
                        <Badge variant={getEstadoBadge(item.estado)}>
                          {item.estado}
                        </Badge>
                      </td>
                      <td className="p-4 text-center">
                        <Badge variant={getPrioridadBadge(item.prioridad)}>
                          {item.prioridad}
                        </Badge>
                      </td>
                      <td className="p-4">
                        <div className="flex items-center justify-center gap-1">
                          <Button variant="ghost" size="sm" onClick={() => handleToggleRecordatorio(item.id)}>
                            <Bell className={`w-4 h-4 ${item.recordatorio ? 'text-accent' : 'text-theme-muted'}`} />
                          </Button>
                          <Button variant="ghost" size="sm" onClick={() => handleEdit(item)}>
                            <Edit2 className="w-4 h-4" />
                          </Button>
                          <Button variant="ghost" size="sm" onClick={() => handleDelete(item.id)}>
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>

          {/* Pagination Info */}
          <div className="flex items-center justify-between">
            <p className="text-sm text-theme-secondary">
              Mostrando {displayData.length} de {displayData.length} prescripciones
            </p>
            <div className="flex gap-2">
              <Button 
                variant="secondary" 
                size="sm"
                onClick={() => goToPage(currentPage - 1)}
                disabled={!hasPrevPage}
              >
                Anterior
              </Button>
              <span className="px-4 py-2 text-theme-secondary">
                {currentPage} / {Math.ceil(displayData.length / 10)}
              </span>
              <Button 
                variant="secondary" 
                size="sm"
                onClick={() => goToPage(currentPage + 1)}
                disabled={!hasNextPage}
              >
                Siguiente
              </Button>
            </div>
          </div>
        </>
      )}

      {/* Modal para crear/editar */}
      <Modal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        title={selectedPrescripcion ? 'Editar Prescripción' : 'Nueva Prescripción'}
        size="lg"
      >
        <div className="space-y-4">
          <Input
            label="Expediente"
            placeholder="EXP-2024-XXX"
            defaultValue={selectedPrescripcion?.id}
          />
          <Input
            label="Caso"
            placeholder="Nombre del caso"
            defaultValue={selectedPrescripcion?.caso}
          />
          <div className="grid grid-cols-2 gap-4">
            <Select
              label="Tipo"
              defaultValue={selectedPrescripcion?.tipo || 'civil'}
              options={tiposExpediente.filter(t => t !== 'todos').map(t => ({ value: t, label: t }))}
            />
            <Select
              label="Prioridad"
              defaultValue={selectedPrescripcion?.prioridad || 'media'}
              options={[
                { value: 'alta', label: 'Alta' },
                { value: 'media', label: 'Media' },
                { value: 'baja', label: 'Baja' }
              ]}
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Fecha de inicio"
              type="date"
              defaultValue={selectedPrescripcion?.fechaInicio}
            />
            <Input
              label="Fecha de prescripción"
              type="date"
              defaultValue={selectedPrescripcion?.fechaPrescripcion}
            />
          </div>
          <Textarea
            label="Notas"
            placeholder="Notas adicionales..."
            rows={3}
          />
          <div className="flex justify-end gap-3 pt-4">
            <Button variant="secondary" onClick={() => setShowModal(false)}>
              Cancelar
            </Button>
            <Button onClick={() => {
              showToast(selectedPrescripcion ? 'Prescripción actualizada' : 'Prescripción creada', 'success');
              setShowModal(false);
            }}>
              {selectedPrescripcion ? 'Guardar' : 'Crear'}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
    </AppLayout>
  );
}

import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Building2, Search, Plus, Phone, Mail, MapPin, Star,
  FileText, TrendingUp, TrendingDown, AlertCircle, CheckCircle2,
  DollarSign, Edit2, FileDown, User, Lock,
  CheckCircle, X, Trash2
} from 'lucide-react';
import { AppLayout } from '@/components/layout/AppLayout';
import { 
  proveedoresData as initialProveedoresData, 
  facturasProveedorData as initialFacturasData,
  contratosProveedorData as initialContratosData,
  evaluacionesProveedorData as initialEvaluacionesData,
  proveedoresStats,
  getProveedorStatusColor,
  getProveedorStatusText,
  getFacturaStatusColor,
  getFacturaStatusText,
  type Proveedor,
  type FacturaProveedor,
  type ContratoProveedor,
  type EvaluacionProveedor
} from '@/data/proveedoresData';
import { useRole } from '@/hooks/useRole';
import type { UserRole } from '@/types/roles';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';

type ActiveTab = 'proveedores' | 'facturas' | 'contratos' | 'evaluaciones';
type ModalType = 'create' | 'edit' | 'delete' | 'evaluate' | null;

// Configuración de acceso por rol
const ROLE_ACCESS: Record<UserRole, { 
  hasAccess: boolean; 
  canCreate: boolean; 
  canEdit: boolean; 
  canDelete: boolean; 
  canEvaluate: boolean;
  canViewInvoices: boolean;
  description: string;
}> = {
  super_admin: { 
    hasAccess: true, 
    canCreate: true, 
    canEdit: true, 
    canDelete: true,
    canEvaluate: true,
    canViewInvoices: true,
    description: 'Gestión completa de proveedores y facturas'
  },
  socio: { 
    hasAccess: true, 
    canCreate: true, 
    canEdit: true, 
    canDelete: false,
    canEvaluate: true,
    canViewInvoices: true,
    description: 'Gestión de proveedores para casos del bufete'
  },
  abogado_senior: { 
    hasAccess: true, 
    canCreate: false, 
    canEdit: false, 
    canDelete: false,
    canEvaluate: false,
    canViewInvoices: true,
    description: 'Vista de solo lectura de proveedores'
  },
  abogado_junior: { 
    hasAccess: true, 
    canCreate: false, 
    canEdit: false, 
    canDelete: false,
    canEvaluate: false,
    canViewInvoices: true,
    description: 'Vista de solo lectura de proveedores'
  },
  paralegal: { 
    hasAccess: false, 
    canCreate: false, 
    canEdit: false, 
    canDelete: false,
    canEvaluate: false,
    canViewInvoices: false,
    description: 'Sin acceso a proveedores'
  },
  secretario: { 
    hasAccess: false, 
    canCreate: false, 
    canEdit: false, 
    canDelete: false,
    canEvaluate: false,
    canViewInvoices: false,
    description: 'Sin acceso a proveedores'
  },
  administrador: { 
    hasAccess: true, 
    canCreate: true, 
    canEdit: true, 
    canDelete: false,
    canEvaluate: true,
    canViewInvoices: true,
    description: 'Gestión completa de proveedores administrativos'
  },
  contador: { 
    hasAccess: true, 
    canCreate: false, 
    canEdit: false, 
    canDelete: false,
    canEvaluate: false,
    canViewInvoices: true,
    description: 'Gestión de facturas de proveedores'
  },
  recepcionista: { 
    hasAccess: false, 
    canCreate: false, 
    canEdit: false, 
    canDelete: false,
    canEvaluate: false,
    canViewInvoices: false,
    description: 'Sin acceso a proveedores'
  },
};

const COLORS = ['#f59e0b', '#10b981', '#3b82f6', '#8b5cf6', '#ec4899', '#06b6d4', '#84cc16'];

const getCategoryDistribution = (proveedores: Proveedor[]) => {
  const categoryMap: Record<string, number> = {};
  proveedores.forEach(p => {
    p.categories.forEach(cat => {
      categoryMap[cat] = (categoryMap[cat] || 0) + p.totalInvoiced;
    });
  });
  return Object.entries(categoryMap)
    .map(([name, value]) => ({ name, value }))
    .sort((a, b) => b.value - a.value)
    .slice(0, 7);
};

// Títulos y subtítulos por rol
const ROLE_TITLES: Record<UserRole, { title: string; subtitle: string }> = {
  super_admin: { title: 'Gestión de Proveedores', subtitle: 'Administración completa del directorio de proveedores' },
  socio: { title: 'Proveedores del Bufete', subtitle: 'Gestión de proveedores para casos' },
  abogado_senior: { title: 'Directorio de Proveedores', subtitle: 'Consulta de información de proveedores' },
  abogado_junior: { title: 'Directorio de Proveedores', subtitle: 'Consulta de información de proveedores' },
  paralegal: { title: 'Sin Acceso', subtitle: 'No tienes permisos para ver proveedores' },
  secretario: { title: 'Sin Acceso', subtitle: 'No tienes permisos para ver proveedores' },
  administrador: { title: 'Gestión de Proveedores', subtitle: 'Administración de proveedores administrativos' },
  contador: { title: 'Facturas de Proveedores', subtitle: 'Gestión de pagos a proveedores' },
  recepcionista: { title: 'Sin Acceso', subtitle: 'No tienes permisos para ver proveedores' },
};

export default function Proveedores() {
  const { role, roleName } = useRole();
  
  const [activeTab, setActiveTab] = useState<ActiveTab>('proveedores');
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [categoryFilter,] = useState('all');
  const [,] = useState<'grid' | 'list'>('grid'); // viewMode - disponible para uso futuro
  const [selectedProveedor, setSelectedProveedor] = useState<Proveedor | null>(null);
  const [,] = useState<string | null>(null); // openMenuId - disponible para uso futuro
  const [activeModal, setActiveModal] = useState<ModalType>(null);
  const [editingProveedor, setEditingProveedor] = useState<Proveedor | null>(null);
  const [toast, setToast] = useState<{message: string; type: 'success' | 'error'} | null>(null);
  
  // Datos mutables
  const [proveedoresData, setProveedoresData] = useState<Proveedor[]>(initialProveedoresData);
  const [facturasData] = useState<FacturaProveedor[]>(initialFacturasData);
  const [contratosData] = useState<ContratoProveedor[]>(initialContratosData);
  const [evaluacionesData, setEvaluacionesData] = useState<EvaluacionProveedor[]>(initialEvaluacionesData);

  // Permisos según rol
  const permissions = useMemo(() => ROLE_ACCESS[role], [role]);

  // Distribución por categoría
  const categoryDistribution = useMemo(() => 
    getCategoryDistribution(proveedoresData), 
  [proveedoresData]);

  /* Categorías únicas para filtro (disponible para uso futuro)
  const uniqueCategories = useMemo(() => {
    const cats = new Set<string>();
    proveedoresData.forEach(p => p.categories.forEach(c => cats.add(c)));
    return Array.from(cats).sort();
  }, [proveedoresData]);
  */

  const showToast = (message: string, type: 'success' | 'error' = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  // Handlers
  const handleDeleteProveedor = () => {
    if (!editingProveedor) return;
    setProveedoresData(prev => prev.filter(p => p.id !== editingProveedor.id));
    if (selectedProveedor?.id === editingProveedor.id) {
      setSelectedProveedor(null);
    }
    setActiveModal(null);
    setEditingProveedor(null);
    showToast('Proveedor eliminado correctamente');
  };

  const handleExportData = () => {
    showToast('Exportando datos de proveedores...');
    setTimeout(() => {
      showToast('Exportación completada');
    }, 1500);
  };

  const handleEvaluate = (proveedorId: string, rating: number) => {
    const newEval: EvaluacionProveedor = {
      id: `EVAL-${Date.now()}`,
      providerId: proveedorId,
      providerName: proveedoresData.find(p => p.id === proveedorId)?.name || '',
      evaluatorId: 'current-user',
      evaluatorName: roleName,
      overall: rating,
      quality: rating,
      punctuality: rating,
      price: rating,
      service: rating,
      communication: rating,
      comments: '',
      wouldRecommend: rating >= 4,
      evaluationDate: new Date().toISOString(),
    };
    setEvaluacionesData([newEval, ...evaluacionesData]);
    showToast('Evaluación registrada correctamente');
    setActiveModal(null);
  };

  // Filtrar proveedores
  const filteredProveedores = useMemo(() => {
    return proveedoresData.filter(p => {
      const matchesSearch = 
        p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.legalName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.taxId.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.contactName.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesStatus = statusFilter === 'all' || p.status === statusFilter;
      const matchesCategory = categoryFilter === 'all' || p.categories.includes(categoryFilter);
      return matchesSearch && matchesStatus && matchesCategory;
    });
  }, [proveedoresData, searchQuery, statusFilter, categoryFilter]);

  // Mensaje de acceso denegado
  const getRoleMessage = () => {
    const messages: Record<UserRole, { title: string; description: string; actions: string[] }> = {
      super_admin: {
        title: 'Gestión Completa de Proveedores',
        description: 'Puedes crear, editar, eliminar y gestionar todos los proveedores del bufete.',
        actions: ['Crear nuevos proveedores', 'Editar información', 'Eliminar proveedores', 'Evaluar proveedores', 'Gestionar facturas', 'Exportar datos']
      },
      socio: {
        title: 'Gestión de Proveedores',
        description: 'Puedes crear y gestionar los proveedores para los casos del bufete.',
        actions: ['Crear proveedores', 'Editar proveedores', 'Evaluar proveedores', 'Ver facturas', 'Exportar datos']
      },
      abogado_senior: {
        title: 'Consulta de Proveedores',
        description: 'Puedes consultar información de proveedores para tus casos.',
        actions: ['Ver lista de proveedores', 'Ver información de contacto', 'Ver evaluaciones', 'Ver historial de facturas']
      },
      abogado_junior: {
        title: 'Consulta de Proveedores',
        description: 'Puedes consultar información de proveedores para tus casos.',
        actions: ['Ver lista de proveedores', 'Ver información de contacto', 'Ver evaluaciones']
      },
      paralegal: {
        title: 'Sin Acceso a Proveedores',
        description: 'Tu rol no tiene acceso al módulo de proveedores.',
        actions: ['Accede a Documentos', 'Revisa tareas asignadas', 'Consulta casos']
      },
      secretario: {
        title: 'Sin Acceso a Proveedores',
        description: 'Tu rol no tiene acceso al módulo de proveedores.',
        actions: ['Gestiona agenda', 'Programa audiencias', 'Gestiona citas']
      },
      administrador: {
        title: 'Gestión de Proveedores Administrativos',
        description: 'Puedes gestionar los proveedores administrativos y de servicios.',
        actions: ['Crear proveedores administrativos', 'Editar proveedores', 'Evaluar servicios', 'Gestionar facturas', 'Exportar datos']
      },
      contador: {
        title: 'Gestión de Facturas de Proveedores',
        description: 'Puedes gestionar y pagar las facturas de proveedores.',
        actions: ['Ver todas las facturas', 'Procesar pagos', 'Reconciliar cuentas', 'Generar reportes']
      },
      recepcionista: {
        title: 'Sin Acceso a Proveedores',
        description: 'Tu rol no tiene acceso al módulo de proveedores.',
        actions: ['Gestiona recepción', 'Atiende llamadas', 'Programa citas']
      },
    };
    return messages[role] || messages.recepcionista;
  };

  // Si no tiene acceso
  if (!permissions.hasAccess) {
    const message = getRoleMessage();
    return (
      <AppLayout title="Proveedores" subtitle="Acceso restringido">
        <main className="flex-1 overflow-y-auto p-6 lg:p-8">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-2xl mx-auto mt-12"
          >
            <div className="p-8 bg-theme-card/60 border border-theme rounded-2xl text-center">
              <div className="w-20 h-20 mx-auto mb-6 bg-theme-tertiary rounded-full flex items-center justify-center">
                <Lock className="w-10 h-10 text-theme-tertiary" />
              </div>
              <h2 className="text-2xl font-bold text-theme-primary mb-2">{message.title}</h2>
              <p className="text-theme-secondary mb-6">{message.description}</p>
              
              <div className="p-4 bg-theme-tertiary/50 rounded-xl text-left">
                <p className="text-sm font-medium text-theme-secondary mb-3">Acciones disponibles para tu rol:</p>
                <ul className="space-y-2">
                  {message.actions.map((action, idx) => (
                    <li key={idx} className="flex items-center gap-2 text-sm text-theme-secondary">
                      <div className="w-1.5 h-1.5 bg-amber-500 rounded-full" />
                      {action}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </motion.div>
        </main>
      </AppLayout>
    );
  }

  const { title, subtitle } = ROLE_TITLES[role];

  const headerActions = (
    <>
      <button 
        onClick={handleExportData}
        className="hidden sm:flex items-center gap-2 px-4 py-2 bg-theme-card text-theme-primary font-medium rounded-xl hover:bg-theme-hover transition-colors border border-theme"
      >
        <FileDown className="w-4 h-4" />
        <span className="hidden lg:inline">Exportar</span>
      </button>
      {permissions.canCreate && (
        <button 
          onClick={() => setActiveModal('create')}
          className="hidden sm:flex items-center gap-2 px-4 py-2 bg-amber-500 text-slate-950 font-medium rounded-xl hover:bg-amber-400 transition-colors"
        >
          <Plus className="w-4 h-4" />
          <span className="hidden lg:inline">Nuevo Proveedor</span>
        </button>
      )}
    </>
  );

  // Tabs disponibles según rol
  const availableTabs = useMemo(() => {
    const tabs = [
      { id: 'proveedores' as ActiveTab, label: 'Proveedores', count: proveedoresData.length },
    ];
    if (permissions.canViewInvoices) {
      tabs.push({ id: 'facturas' as ActiveTab, label: 'Facturas', count: facturasData.length });
    }
    if (permissions.canCreate || permissions.canEdit) {
      tabs.push({ id: 'contratos' as ActiveTab, label: 'Contratos', count: contratosData.length });
    }
    if (permissions.canEvaluate) {
      tabs.push({ id: 'evaluaciones' as ActiveTab, label: 'Evaluaciones', count: evaluacionesData.length });
    }
    return tabs;
  }, [permissions, proveedoresData.length, facturasData.length, contratosData.length, evaluacionesData.length]);

  return (
    <AppLayout 
      title={title}
      subtitle={subtitle}
      headerActions={headerActions}
    >
      <main className="flex-1 overflow-y-auto p-6 lg:p-8">
        {/* Stats Cards mejoradas con tendencias */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
          {[
            { 
              label: 'Total Proveedores', 
              value: proveedoresStats.total, 
              trend: '+2',
              trendUp: true,
              color: 'slate', 
              icon: Building2,
              bgGradient: 'from-slate-500/20 to-slate-600/5'
            },
            { 
              label: 'Activos', 
              value: proveedoresStats.active, 
              trend: '+1',
              trendUp: true,
              color: 'emerald', 
              icon: CheckCircle2,
              bgGradient: 'from-emerald-500/20 to-emerald-600/5'
            },
            { 
              label: 'Total Facturado', 
              value: `€${proveedoresStats.totalInvoiced.toLocaleString()}`, 
              trend: '+8.5%',
              trendUp: true,
              color: 'blue', 
              icon: TrendingUp,
              bgGradient: 'from-blue-500/20 to-blue-600/5'
            },
            { 
              label: 'Pendiente', 
              value: `€${proveedoresStats.totalPending.toLocaleString()}`, 
              trend: '-12%',
              trendUp: false,
              color: 'amber', 
              icon: DollarSign,
              bgGradient: 'from-amber-500/20 to-amber-600/5'
            },
          ].map((stat, idx) => (
            <motion.div 
              key={stat.label}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.05 }}
              className={`p-4 bg-gradient-to-br ${stat.bgGradient} border border-theme rounded-xl hover:border-amber-500/30 transition-all cursor-pointer group`}
            >
              <div className="flex items-start justify-between">
                <div className={`w-10 h-10 rounded-lg bg-${stat.color}-500/10 flex items-center justify-center group-hover:scale-110 transition-transform`}>
                  <stat.icon className={`w-5 h-5 text-${stat.color}-400`} />
                </div>
                <div className={`flex items-center gap-1 text-xs font-medium ${stat.trendUp ? 'text-emerald-400' : 'text-red-400'}`}>
                  {stat.trendUp ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                  {stat.trend}
                </div>
              </div>
              <div className="mt-3">
                <p className="text-xl font-bold text-theme-primary">{stat.value}</p>
                <p className="text-xs text-theme-secondary">{stat.label}</p>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Chart de distribución por categoría */}
        {activeTab === 'proveedores' && (
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6 p-4 bg-theme-card/60 border border-theme rounded-xl hidden md:block"
          >
            <h3 className="text-sm font-medium text-theme-primary mb-4">Distribución por Categoría</h3>
            <div className="h-48 flex items-center justify-center">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={categoryDistribution}
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={80}
                    paddingAngle={2}
                    dataKey="value"
                  >
                    {categoryDistribution.map((_entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'var(--theme-card)', 
                      border: '1px solid var(--theme)',
                      borderRadius: '8px'
                    }}
                    labelStyle={{ color: 'var(--theme-primary)' }}
                  />
                </PieChart>
              </ResponsiveContainer>
              <div className="flex flex-wrap gap-3 ml-4">
                {categoryDistribution.map((cat, idx) => (
                  <div key={cat.name} className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS[idx % COLORS.length] }} />
                    <span className="text-xs text-theme-secondary">{cat.name}</span>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        )}

        {/* Tabs */}
        <div className="flex gap-2 mb-6 border-b border-theme">
          {availableTabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-6 py-3 text-sm font-medium transition-colors relative ${
                activeTab === tab.id ? 'text-amber-500' : 'text-theme-secondary hover:text-theme-primary'
              }`}
            >
              {tab.label}
              <span className={`ml-2 px-2 py-0.5 rounded-full text-xs ${
                activeTab === tab.id ? 'bg-amber-500/20 text-amber-400' : 'bg-theme-tertiary text-theme-secondary'
              }`}>
                {tab.count}
              </span>
              {activeTab === tab.id && (
                <motion.div layoutId="activeTabProv" className="absolute bottom-0 left-0 right-0 h-0.5 bg-amber-500" />
              )}
            </button>
          ))}
        </div>

        {/* Content */}
        {activeTab === 'proveedores' && (
          <ProveedoresView 
            data={filteredProveedores}
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
            statusFilter={statusFilter}
            setStatusFilter={setStatusFilter}
            onSelect={setSelectedProveedor}
            permissions={permissions}
            onEdit={(p) => { setEditingProveedor(p); setActiveModal('edit'); }}
            onDelete={(p) => { setEditingProveedor(p); setActiveModal('delete'); }}
            onEvaluate={(p) => { setEditingProveedor(p); setActiveModal('evaluate'); }}
          />
        )}
        {activeTab === 'facturas' && <FacturasView data={facturasData} />}
        {activeTab === 'contratos' && <ContratosView data={contratosData} />}
        {activeTab === 'evaluaciones' && <EvaluacionesView data={evaluacionesData} />}

        {/* Modal de Detalle */}
        {selectedProveedor && (
          <ProveedorModal 
            proveedor={selectedProveedor} 
            onClose={() => setSelectedProveedor(null)} 
            permissions={permissions}
            onEdit={() => { setEditingProveedor(selectedProveedor); setActiveModal('edit'); }}
            onDelete={() => { setEditingProveedor(selectedProveedor); setActiveModal('delete'); }}
          />
        )}

        {/* Modal Confirmar Eliminación */}
        <AnimatePresence>
          {activeModal === 'delete' && editingProveedor && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
              onClick={() => { setActiveModal(null); setEditingProveedor(null); }}
            >
              <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 20 }}
                onClick={(e) => e.stopPropagation()}
                className="bg-theme-card border border-theme rounded-2xl max-w-md w-full p-6"
              >
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 bg-red-500/10 rounded-full flex items-center justify-center">
                    <Trash2 className="w-6 h-6 text-red-500" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-theme-primary">Eliminar Proveedor</h3>
                    <p className="text-sm text-theme-secondary">Esta acción no se puede deshacer</p>
                  </div>
                </div>
                
                <p className="text-theme-secondary mb-6">
                  ¿Estás seguro de que deseas eliminar al proveedor <strong className="text-theme-primary">{editingProveedor.name}</strong>?
                </p>

                <div className="flex justify-end gap-3">
                  <button 
                    onClick={() => { setActiveModal(null); setEditingProveedor(null); }}
                    className="px-4 py-2 text-theme-secondary hover:text-theme-primary transition-colors"
                  >
                    Cancelar
                  </button>
                  <button 
                    onClick={handleDeleteProveedor}
                    className="px-4 py-2 bg-red-500 text-white font-medium rounded-xl hover:bg-red-400 transition-colors flex items-center gap-2"
                  >
                    <Trash2 className="w-4 h-4" />
                    Eliminar
                  </button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Modal Evaluar */}
        <AnimatePresence>
          {activeModal === 'evaluate' && editingProveedor && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
              onClick={() => { setActiveModal(null); setEditingProveedor(null); }}
            >
              <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 20 }}
                onClick={(e) => e.stopPropagation()}
                className="bg-theme-card border border-theme rounded-2xl max-w-md w-full p-6"
              >
                <h3 className="text-lg font-bold text-theme-primary mb-2">Evaluar Proveedor</h3>
                <p className="text-theme-secondary mb-6">{editingProveedor.name}</p>
                
                <div className="space-y-4 mb-6">
                  {[5, 4, 3, 2, 1].map((rating) => (
                    <button
                      key={rating}
                      onClick={() => handleEvaluate(editingProveedor.id, rating)}
                      className="w-full flex items-center gap-2 p-3 bg-theme-tertiary/50 rounded-xl hover:bg-theme-tertiary transition-colors"
                    >
                      <div className="flex">
                        {Array.from({ length: 5 }).map((_, i) => (
                          <Star 
                            key={i} 
                            className={`w-5 h-5 ${i < rating ? 'text-amber-400 fill-amber-400' : 'text-theme-tertiary'}`} 
                          />
                        ))}
                      </div>
                      <span className="text-theme-primary font-medium">
                        {rating === 5 ? 'Excelente' : rating === 4 ? 'Muy bueno' : rating === 3 ? 'Bueno' : rating === 2 ? 'Regular' : 'Deficiente'}
                      </span>
                    </button>
                  ))}
                </div>

                <button 
                  onClick={() => { setActiveModal(null); setEditingProveedor(null); }}
                  className="w-full px-4 py-2 text-theme-secondary hover:text-theme-primary transition-colors"
                >
                  Cancelar
                </button>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Toast Notifications */}
        <AnimatePresence>
          {toast && (
            <motion.div
              initial={{ opacity: 0, y: 50, x: '-50%' }}
              animate={{ opacity: 1, y: 0, x: '-50%' }}
              exit={{ opacity: 0, y: 20, x: '-50%' }}
              className={`fixed bottom-6 left-1/2 z-50 px-6 py-3 rounded-xl shadow-lg flex items-center gap-3 ${
                toast.type === 'success' ? 'bg-emerald-500 text-slate-950' : 'bg-red-500 text-white'
              }`}
            >
              {toast.type === 'success' ? <CheckCircle className="w-5 h-5" /> : <AlertCircle className="w-5 h-5" />}
              <span className="font-medium">{toast.message}</span>
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </AppLayout>
  );
}

interface ProveedoresViewProps { 
  data: Proveedor[]; 
  searchQuery: string; 
  setSearchQuery: (s: string) => void;
  statusFilter: string; 
  setStatusFilter: (s: string) => void;
  onSelect: (p: Proveedor) => void;
  permissions: { canEdit: boolean; canDelete: boolean; canEvaluate: boolean };
  onEdit: (p: Proveedor) => void;
  onDelete: (p: Proveedor) => void;
  onEvaluate: (p: Proveedor) => void;
}

function ProveedoresView({ 
  data, searchQuery, setSearchQuery, statusFilter, setStatusFilter, onSelect,
  permissions, onEdit, onDelete, onEvaluate
}: ProveedoresViewProps) {
  return (
    <>
      {/* Filters */}
      <div className="mb-6 flex flex-col lg:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-theme-tertiary" />
          <input
            type="text"
            placeholder="Buscar proveedores..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-12 pr-4 py-3 bg-theme-card border border-theme rounded-xl text-theme-primary placeholder-theme-tertiary focus:outline-none focus:border-amber-500 transition-colors"
          />
        </div>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="px-4 py-3 bg-theme-card border border-theme rounded-xl text-theme-primary focus:outline-none focus:border-amber-500 transition-colors"
        >
          <option value="all">Todos los estados</option>
          <option value="active">Activo</option>
          <option value="inactive">Inactivo</option>
          <option value="pending">Pendiente</option>
          <option value="blocked">Bloqueado</option>
        </select>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {data.map((proveedor, index) => (
          <motion.div
            key={proveedor.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.03 }}
            className="p-6 bg-theme-card/60 border border-theme rounded-2xl hover:border-amber-500/30 transition-colors group"
          >
            <div className="flex items-start justify-between mb-4">
              <div 
                className="flex items-center gap-3 cursor-pointer"
                onClick={() => onSelect(proveedor)}
              >
                <div className="w-12 h-12 bg-gradient-to-br from-amber-500 to-amber-600 rounded-xl flex items-center justify-center text-xl font-bold text-slate-950">
                  {proveedor.name.substring(0, 2).toUpperCase()}
                </div>
                <div>
                  <h3 className="font-semibold text-theme-primary group-hover:text-amber-500 transition-colors">
                    {proveedor.name}
                  </h3>
                  <p className="text-sm text-theme-secondary">{proveedor.taxId}</p>
                </div>
              </div>
              <span className={`px-3 py-1 text-xs font-medium rounded-full border ${getProveedorStatusColor(proveedor.status)}`}>
                {getProveedorStatusText(proveedor.status)}
              </span>
            </div>

            <div className="space-y-2 text-sm mb-4">
              <p className="text-theme-secondary flex items-center gap-2">
                <MapPin className="w-4 h-4 text-theme-tertiary" />
                {proveedor.city}, {proveedor.province}
              </p>
              <p className="text-theme-secondary flex items-center gap-2">
                <Phone className="w-4 h-4 text-theme-tertiary" />
                {proveedor.phone}
              </p>
              <p className="text-theme-secondary flex items-center gap-2">
                <User className="w-4 h-4 text-theme-tertiary" />
                {proveedor.contactName}
              </p>
            </div>

            <div className="flex items-center justify-between pt-4 border-t border-theme">
              <div className="flex items-center gap-1">
                <Star className="w-4 h-4 text-amber-400 fill-amber-400" />
                <span className="text-theme-primary font-medium">{proveedor.rating}</span>
              </div>
              <div className="text-right">
                <p className="text-lg font-bold text-theme-primary">€{proveedor.totalInvoiced.toLocaleString()}</p>
                <p className="text-xs text-theme-secondary">Total facturado</p>
              </div>
            </div>

            {proveedor.pendingAmount > 0 && (
              <div className="mt-3 p-2 bg-amber-500/10 border border-amber-500/20 rounded-lg">
                <p className="text-sm text-amber-400">
                  Pendiente: €{proveedor.pendingAmount.toLocaleString()}
                </p>
              </div>
            )}

            {/* Action Buttons */}
            <div className="mt-4 pt-4 border-t border-theme flex gap-2">
              <button 
                onClick={() => onSelect(proveedor)}
                className="flex-1 py-2 bg-theme-tertiary text-theme-primary text-sm font-medium rounded-lg hover:bg-theme-hover transition-colors"
              >
                Ver detalles
              </button>
              {permissions.canEdit && (
                <button 
                  onClick={() => onEdit(proveedor)}
                  className="px-3 py-2 bg-amber-500/10 text-amber-400 rounded-lg hover:bg-amber-500/20 transition-colors"
                  title="Editar"
                >
                  <Edit2 className="w-4 h-4" />
                </button>
              )}
              {permissions.canEvaluate && (
                <button 
                  onClick={() => onEvaluate(proveedor)}
                  className="px-3 py-2 bg-emerald-500/10 text-emerald-400 rounded-lg hover:bg-emerald-500/20 transition-colors"
                  title="Evaluar"
                >
                  <Star className="w-4 h-4" />
                </button>
              )}
              {permissions.canDelete && (
                <button 
                  onClick={() => onDelete(proveedor)}
                  className="px-3 py-2 bg-red-500/10 text-red-400 rounded-lg hover:bg-red-500/20 transition-colors"
                  title="Eliminar"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              )}
            </div>
          </motion.div>
        ))}
      </div>
    </>
  );
}

function FacturasView({ data }: { data: FacturaProveedor[] }) {
  return (
    <div className="bg-theme-card/60 border border-theme rounded-2xl overflow-hidden">
      <table className="w-full">
        <thead>
          <tr className="border-b border-theme bg-theme-card/80">
            <th className="text-left py-4 px-6 text-xs font-medium text-theme-secondary uppercase">Nº Factura</th>
            <th className="text-left py-4 px-6 text-xs font-medium text-theme-secondary uppercase">Proveedor</th>
            <th className="text-left py-4 px-6 text-xs font-medium text-theme-secondary uppercase">Concepto</th>
            <th className="text-left py-4 px-6 text-xs font-medium text-theme-secondary uppercase">Importe</th>
            <th className="text-left py-4 px-6 text-xs font-medium text-theme-secondary uppercase">Vencimiento</th>
            <th className="text-left py-4 px-6 text-xs font-medium text-theme-secondary uppercase">Estado</th>
          </tr>
        </thead>
        <tbody>
          {data.map((factura, index) => (
            <motion.tr 
              key={factura.id} 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.03 }}
              className="border-b border-theme/50 hover:bg-theme-tertiary/30 transition-colors"
            >
              <td className="py-4 px-6">
                <p className="text-sm font-medium text-theme-primary">{factura.invoiceNumber}</p>
              </td>
              <td className="py-4 px-6">
                <p className="text-sm text-theme-secondary">{factura.providerName}</p>
              </td>
              <td className="py-4 px-6">
                <p className="text-sm text-theme-secondary">{factura.concept}</p>
                {factura.caseTitle && (
                  <p className="text-xs text-theme-tertiary">{factura.caseTitle}</p>
                )}
              </td>
              <td className="py-4 px-6">
                <p className="text-sm font-bold text-theme-primary">€{factura.totalAmount.toLocaleString()}</p>
                <p className="text-xs text-theme-tertiary">Base: €{factura.baseAmount.toLocaleString()}</p>
              </td>
              <td className="py-4 px-6">
                <p className="text-sm text-theme-secondary">{new Date(factura.dueDate).toLocaleDateString('es-ES')}</p>
              </td>
              <td className="py-4 px-6">
                <span className={`px-3 py-1 text-xs font-medium rounded-full border ${getFacturaStatusColor(factura.status)}`}>
                  {getFacturaStatusText(factura.status)}
                </span>
              </td>
            </motion.tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function ContratosView({ data }: { data: ContratoProveedor[] }) {
  return (
    <div className="space-y-4">
      {data.map((contrato, index) => (
        <motion.div
          key={contrato.id}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.03 }}
          className="p-6 bg-theme-card/60 border border-theme rounded-2xl"
        >
          <div className="flex items-start justify-between mb-4">
            <div>
              <h3 className="font-semibold text-theme-primary">{contrato.title}</h3>
              <p className="text-sm text-theme-secondary">{contrato.providerName}</p>
            </div>
            <span className={`px-3 py-1 text-xs font-medium rounded-full border ${
              contrato.status === 'active' 
                ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' :
              contrato.status === 'expired'
                ? 'bg-slate-500/10 text-slate-400 border-slate-500/20' :
              contrato.status === 'terminated'
                ? 'bg-red-500/10 text-red-400 border-red-500/20' :
                'bg-amber-500/10 text-amber-400 border-amber-500/20'
            }`}>
              {contrato.status === 'active' ? 'Activo' : 
               contrato.status === 'expired' ? 'Vencido' : 
               contrato.status === 'terminated' ? 'Rescindido' : 'Pendiente'}
            </span>
          </div>
          
          <p className="text-sm text-theme-secondary mb-4">{contrato.description}</p>
          
          <div className="grid grid-cols-3 gap-4 mb-4">
            <div>
              <p className="text-xs text-theme-tertiary">Inicio</p>
              <p className="text-sm text-theme-primary">{new Date(contrato.startDate).toLocaleDateString('es-ES')}</p>
            </div>
            {contrato.endDate && (
              <div>
                <p className="text-xs text-theme-tertiary">Fin</p>
                <p className="text-sm text-theme-primary">{new Date(contrato.endDate).toLocaleDateString('es-ES')}</p>
              </div>
            )}
            {contrato.monthlyAmount && (
              <div>
                <p className="text-xs text-theme-tertiary">Importe mensual</p>
                <p className="text-sm text-theme-primary">€{contrato.monthlyAmount.toLocaleString()}</p>
              </div>
            )}
          </div>
          
          <div className="flex flex-wrap gap-2">
            {contrato.services.map((service, i) => (
              <span key={i} className="px-2 py-1 bg-theme-tertiary text-theme-secondary text-xs rounded-full">
                {service}
              </span>
            ))}
          </div>
        </motion.div>
      ))}
    </div>
  );
}

function EvaluacionesView({ data }: { data: EvaluacionProveedor[] }) {
  return (
    <div className="space-y-4">
      {data.map((evaluacion, index) => (
        <motion.div
          key={evaluacion.id}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.03 }}
          className="p-6 bg-theme-card/60 border border-theme rounded-2xl"
        >
          <div className="flex items-start justify-between mb-4">
            <div>
              <h3 className="font-semibold text-theme-primary">{evaluacion.providerName}</h3>
              <p className="text-sm text-theme-secondary">Evaluado por {evaluacion.evaluatorName}</p>
            </div>
            <div className="flex items-center gap-1">
              <Star className="w-5 h-5 text-amber-400 fill-amber-400" />
              <span className="text-xl font-bold text-theme-primary">{evaluacion.overall.toFixed(1)}</span>
            </div>
          </div>
          
          <div className="grid grid-cols-5 gap-4 mb-4">
            <div className="text-center">
              <p className="text-lg font-bold text-theme-primary">{evaluacion.quality}</p>
              <p className="text-xs text-theme-tertiary">Calidad</p>
            </div>
            <div className="text-center">
              <p className="text-lg font-bold text-theme-primary">{evaluacion.punctuality}</p>
              <p className="text-xs text-theme-tertiary">Puntualidad</p>
            </div>
            <div className="text-center">
              <p className="text-lg font-bold text-theme-primary">{evaluacion.price}</p>
              <p className="text-xs text-theme-tertiary">Precio</p>
            </div>
            <div className="text-center">
              <p className="text-lg font-bold text-theme-primary">{evaluacion.service}</p>
              <p className="text-xs text-theme-tertiary">Servicio</p>
            </div>
            <div className="text-center">
              <p className="text-lg font-bold text-theme-primary">{evaluacion.communication}</p>
              <p className="text-xs text-theme-tertiary">Comunicación</p>
            </div>
          </div>
          
          {evaluacion.comments && (
            <p className="text-sm text-theme-secondary italic">"{evaluacion.comments}"</p>
          )}
          
          <div className="mt-3 flex items-center gap-2">
            {evaluacion.wouldRecommend ? (
              <span className="px-2 py-1 bg-emerald-500/10 text-emerald-400 text-xs rounded-full">
                Recomienda
              </span>
            ) : (
              <span className="px-2 py-1 bg-red-500/10 text-red-400 text-xs rounded-full">
                No recomienda
              </span>
            )}
            <span className="text-xs text-theme-tertiary">
              {new Date(evaluacion.evaluationDate).toLocaleDateString('es-ES')}
            </span>
          </div>
        </motion.div>
      ))}
    </div>
  );
}

interface ProveedorModalProps {
  proveedor: Proveedor;
  onClose: () => void;
  permissions: { canEdit: boolean; canDelete: boolean; canEvaluate: boolean };
  onEdit: () => void;
  onDelete: () => void;
}

function ProveedorModal({ proveedor, onClose, permissions, onEdit, onDelete }: ProveedorModalProps) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        onClick={(e) => e.stopPropagation()}
        className="bg-theme-card border border-theme rounded-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto"
      >
        <div className="p-6 border-b border-theme">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 bg-gradient-to-br from-amber-500 to-amber-600 rounded-xl flex items-center justify-center text-2xl font-bold text-slate-950">
                {proveedor.name.substring(0, 2).toUpperCase()}
              </div>
              <div>
                <h2 className="text-xl font-bold text-theme-primary">{proveedor.name}</h2>
                <p className="text-theme-secondary">{proveedor.legalName}</p>
                <div className="flex items-center gap-2 mt-2">
                  <span className={`px-3 py-1 text-xs font-medium rounded-full border ${getProveedorStatusColor(proveedor.status)}`}>
                    {getProveedorStatusText(proveedor.status)}
                  </span>
                  <span className="text-xs text-theme-secondary">{proveedor.taxId}</span>
                </div>
              </div>
            </div>
            <button onClick={onClose} className="p-2 text-theme-secondary hover:text-theme-primary hover:bg-theme-tertiary rounded-lg">
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>
        
        <div className="p-6 space-y-6">
          {/* Financial Summary */}
          <div className="grid grid-cols-4 gap-4">
            <div className="p-4 bg-theme-tertiary/50 rounded-xl text-center">
              <p className="text-xs text-theme-secondary mb-1">Total Facturado</p>
              <p className="text-xl font-bold text-theme-primary">€{proveedor.totalInvoiced.toLocaleString()}</p>
            </div>
            <div className="p-4 bg-theme-tertiary/50 rounded-xl text-center">
              <p className="text-xs text-theme-secondary mb-1">Total Pagado</p>
              <p className="text-xl font-bold text-emerald-400">€{proveedor.totalPaid.toLocaleString()}</p>
            </div>
            <div className="p-4 bg-theme-tertiary/50 rounded-xl text-center">
              <p className="text-xs text-theme-secondary mb-1">Pendiente</p>
              <p className="text-xl font-bold text-amber-400">€{proveedor.pendingAmount.toLocaleString()}</p>
            </div>
            <div className="p-4 bg-theme-tertiary/50 rounded-xl text-center">
              <p className="text-xs text-theme-secondary mb-1">Valoración</p>
              <div className="flex items-center justify-center gap-1">
                <Star className="w-5 h-5 text-amber-400 fill-amber-400" />
                <span className="text-xl font-bold text-theme-primary">{proveedor.rating}</span>
              </div>
            </div>
          </div>

          {/* Contact Info */}
          <div className="grid grid-cols-2 gap-4">
            <div className="p-4 bg-theme-tertiary/50 rounded-xl">
              <h4 className="text-sm font-medium text-theme-secondary mb-3">Información de Contacto</h4>
              <div className="space-y-2 text-sm">
                <p className="text-theme-secondary flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-theme-tertiary" />
                  {proveedor.address}, {proveedor.postalCode} {proveedor.city}
                </p>
                <p className="text-theme-secondary flex items-center gap-2">
                  <Phone className="w-4 h-4 text-theme-tertiary" />
                  {proveedor.phone}
                </p>
                <p className="text-theme-secondary flex items-center gap-2">
                  <Mail className="w-4 h-4 text-theme-tertiary" />
                  {proveedor.email}
                </p>
                {proveedor.website && (
                  <p className="text-theme-secondary flex items-center gap-2">
                    <Building2 className="w-4 h-4 text-theme-tertiary" />
                    {proveedor.website}
                  </p>
                )}
              </div>
            </div>

            <div className="p-4 bg-theme-tertiary/50 rounded-xl">
              <h4 className="text-sm font-medium text-theme-secondary mb-3">Persona de Contacto</h4>
              <div className="space-y-2 text-sm">
                <p className="text-theme-secondary flex items-center gap-2">
                  <User className="w-4 h-4 text-theme-tertiary" />
                  {proveedor.contactName}
                </p>
                <p className="text-theme-secondary flex items-center gap-2">
                  <Phone className="w-4 h-4 text-theme-tertiary" />
                  {proveedor.contactPhone}
                </p>
                <p className="text-theme-secondary flex items-center gap-2">
                  <Mail className="w-4 h-4 text-theme-tertiary" />
                  {proveedor.contactEmail}
                </p>
              </div>
            </div>
          </div>

          {/* Payment Info */}
          <div className="p-4 bg-theme-tertiary/50 rounded-xl">
            <h4 className="text-sm font-medium text-theme-secondary mb-3">Condiciones de Pago</h4>
            <div className="grid grid-cols-3 gap-4 text-sm">
              <div>
                <p className="text-theme-tertiary">Plazo</p>
                <p className="text-theme-primary">{proveedor.paymentTerms}</p>
              </div>
              <div>
                <p className="text-theme-tertiary">Método</p>
                <p className="text-theme-primary capitalize">{proveedor.paymentMethod === 'transfer' ? 'Transferencia' : proveedor.paymentMethod}</p>
              </div>
              <div>
                <p className="text-theme-tertiary">Límite de crédito</p>
                <p className="text-theme-primary">€{proveedor.creditLimit.toLocaleString()}</p>
              </div>
            </div>
            {proveedor.bankAccount && (
              <div className="mt-3 pt-3 border-t border-theme">
                <p className="text-theme-tertiary text-sm">Cuenta bancaria</p>
                <p className="text-theme-primary font-mono">{proveedor.bankAccount}</p>
                <p className="text-theme-secondary text-sm">{proveedor.bankName}</p>
              </div>
            )}
          </div>

          {/* Categories */}
          <div>
            <h4 className="text-sm font-medium text-theme-secondary mb-3">Categorías</h4>
            <div className="flex flex-wrap gap-2">
              {proveedor.categories.map((cat, i) => (
                <span key={i} className="px-3 py-1 bg-theme-tertiary text-theme-secondary rounded-full text-sm">
                  {cat}
                </span>
              ))}
            </div>
          </div>

          {/* Notes */}
          {proveedor.notes && (
            <div className="p-4 bg-theme-tertiary/50 rounded-xl">
              <h4 className="text-sm font-medium text-theme-secondary mb-2">Notas</h4>
              <p className="text-theme-secondary text-sm">{proveedor.notes}</p>
            </div>
          )}
        </div>

        <div className="p-6 border-t border-theme flex justify-end gap-3">
          <button onClick={onClose} className="px-4 py-2 text-theme-secondary hover:text-theme-primary transition-colors">
            Cerrar
          </button>
          <button className="px-4 py-2 bg-theme-tertiary text-theme-primary font-medium rounded-xl hover:bg-theme-hover transition-colors">
            <FileText className="w-4 h-4 inline mr-2" />
            Ver Facturas
          </button>
          {permissions.canEdit && (
            <button 
              onClick={() => { onEdit(); onClose(); }}
              className="px-4 py-2 bg-amber-500 text-slate-950 font-medium rounded-xl hover:bg-amber-400 transition-colors"
            >
              <Edit2 className="w-4 h-4 inline mr-2" />
              Editar
            </button>
          )}
          {permissions.canDelete && (
            <button 
              onClick={() => { onDelete(); onClose(); }}
              className="px-4 py-2 bg-red-500 text-white font-medium rounded-xl hover:bg-red-400 transition-colors"
            >
              <Trash2 className="w-4 h-4 inline mr-2" />
              Eliminar
            </button>
          )}
        </div>
      </motion.div>
    </motion.div>
  );
}

import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Plus, DollarSign, Building2, FileText,
  CheckCircle2, Clock, AlertCircle, Search, Eye,
  Wallet, Lock, Crown, Briefcase, Calculator,
  CheckCircle, Info, X, Edit2, Trash2,
  TrendingUp, TrendingDown, XCircle
} from 'lucide-react';
import { 
  PieChart, Pie, Cell, ResponsiveContainer, Tooltip 
} from 'recharts';
import { AppLayout } from '@/components/layout/AppLayout';
import { 
  gastosData as initialGastosData, 
  presupuestosData,
  proveedoresData,
  getGastoCategoryColor, 
  getGastoCategoryText,
  getGastoStatusColor,
  getGastoStatusText,
  type Gasto,
  type Presupuesto,
  type Proveedor
} from '@/data/gastosData';
import { useRole } from '@/hooks/useRole';
import type { UserRole } from '@/types/roles';

type ActiveTab = 'gastos' | 'presupuestos' | 'proveedores';
type ModalType = 'create' | 'edit' | 'delete' | 'approve' | null;

// Simulación de ID de usuario según rol
const getCurrentUserId = (role: UserRole): string => {
  const userIds: Record<UserRole, string> = {
    super_admin: 'super_admin',
    socio: 'socio_1',
    abogado_senior: 'abogado_senior_1',
    abogado_junior: 'abogado_junior_1',
    paralegal: 'paralegal_1',
    secretario: 'secretario_1',
    administrador: 'administrador_1',
    contador: 'contador_1',
    recepcionista: 'recepcionista_1',
  };
  return userIds[role] || 'unknown';
};

// Casos asignados por usuario (simulación)
const getUserCases = (userId: string): string[] => {
  const caseMap: Record<string, string[]> = {
    'abogado_senior_1': ['EXP-2024-001', 'EXP-2024-006'],
    'abogado_junior_1': ['EXP-2024-003'],
    'paralegal_1': ['EXP-2024-001', 'EXP-2024-003'],
  };
  return caseMap[userId] || [];
};

export default function Gastos() {
  const { role, roleConfig } = useRole();
  const currentUserId = getCurrentUserId(role);
  const userCases = getUserCases(currentUserId);

  const [activeTab, setActiveTab] = useState<ActiveTab>('gastos');
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [selectedGasto, setSelectedGasto] = useState<Gasto | null>(null);
  const [activeModal, setActiveModal] = useState<ModalType>(null);
  const [editingGasto, setEditingGasto] = useState<Gasto | null>(null);
  const [toast, setToast] = useState<{message: string; type: 'success' | 'info' | 'error'} | null>(null);
  
  // Datos mutables
  const [gastosData, setGastosData] = useState<Gasto[]>(initialGastosData);

  // Determinar permisos según el rol
  const permissions = useMemo(() => {
    return {
      // Acceso al módulo
      hasAccess: role === 'super_admin' || role === 'socio' || 
                 role === 'abogado_senior' || role === 'administrador' || 
                 role === 'contador',
      
      // Qué gastos puede ver
      canViewAll: role === 'super_admin' || role === 'socio' || role === 'contador',
      canViewOwnCases: role === 'abogado_senior',
      canViewOperational: role === 'administrador',
      
      // Acciones
      canCreate: role === 'super_admin' || role === 'socio' || 
                 role === 'abogado_senior' || role === 'administrador',
      canEdit: role === 'super_admin' || role === 'socio' || 
               role === 'abogado_senior',
      canDelete: role === 'super_admin' || role === 'socio',
      canApprove: role === 'super_admin' || role === 'socio' || 
                  (role === 'administrador' ? 'minor' : false),
      canValidateFiscal: role === 'contador' || role === 'super_admin',
      canManageProviders: role === 'super_admin' || role === 'socio' || role === 'administrador',
      
      // Tabs visibles
      canViewPresupuestos: role === 'super_admin' || role === 'socio' || role === 'administrador' || role === 'contador',
      canViewProveedores: role === 'super_admin' || role === 'socio' || role === 'administrador',
    };
  }, [role]);

  // Filtrar gastos según rol
  const filteredGastos = useMemo(() => {
    let filtered = gastosData;

    switch (role) {
      case 'super_admin':
      case 'socio':
      case 'contador':
        // Ven todos los gastos
        break;
      
      case 'abogado_senior':
        // Ven gastos de sus casos + los que él registró + reembolsables
        filtered = gastosData.filter(g => 
          g.submittedBy === currentUserId || 
          (g.caseId && userCases.includes(g.caseId)) ||
          g.reimbursable
        );
        break;
      
      case 'administrador':
        // Gastos operativos y administrativos
        filtered = gastosData.filter(g => 
          g.category === 'operational' || 
          g.category === 'administrative' ||
          g.category === 'professional'
        );
        break;
      
      default:
        filtered = [];
    }

    // Aplicar filtros de búsqueda
    filtered = filtered.filter(g => {
      const matchesSearch = 
        g.concept.toLowerCase().includes(searchQuery.toLowerCase()) ||
        g.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        g.provider?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        g.caseTitle?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        g.submittedByName.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesStatus = statusFilter === 'all' || g.status === statusFilter;
      const matchesCategory = categoryFilter === 'all' || g.category === categoryFilter;
      return matchesSearch && matchesStatus && matchesCategory;
    });

    return filtered;
  }, [role, currentUserId, userCases, gastosData, searchQuery, statusFilter, categoryFilter]);

  // Calcular estadísticas según rol
  const stats = useMemo(() => {
    const baseStats = {
      totalGastos: filteredGastos.reduce((sum, g) => sum + g.totalAmount, 0),
      totalPendientes: filteredGastos.filter(g => g.status === 'pending').reduce((sum, g) => sum + g.totalAmount, 0),
      totalAprobados: filteredGastos.filter(g => g.status === 'approved').reduce((sum, g) => sum + g.totalAmount, 0),
      totalPagados: filteredGastos.filter(g => g.status === 'paid').reduce((sum, g) => sum + g.totalAmount, 0),
      totalReembolsables: filteredGastos.filter(g => g.reimbursable).reduce((sum, g) => sum + g.totalAmount, 0),
    };

    if (role === 'abogado_senior') {
      const misReembolsos = filteredGastos.filter(g => 
        g.submittedBy === currentUserId && g.reimbursable
      ).reduce((sum, g) => sum + g.totalAmount, 0);
      return { ...baseStats, misReembolsos };
    }

    if (role === 'administrador') {
      const porOperativos = filteredGastos.filter(g => g.category === 'operational').reduce((sum, g) => sum + g.totalAmount, 0);
      return { ...baseStats, porOperativos };
    }

    return baseStats;
  }, [filteredGastos, role, currentUserId]);

  const showToast = (message: string, type: 'success' | 'info' | 'error' = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  // Handlers
  const handleApproveGasto = () => {
    if (!editingGasto) return;
    
    setGastosData(gastosData.map(g => 
      g.id === editingGasto.id 
        ? { ...g, status: 'approved', approvedBy: currentUserId, approvedByName: roleConfig.name, approvedDate: new Date().toISOString() }
        : g
    ));
    
    if (selectedGasto?.id === editingGasto.id) {
      setSelectedGasto({ 
        ...selectedGasto, 
        status: 'approved', 
        approvedBy: currentUserId, 
        approvedByName: roleConfig.name, 
        approvedDate: new Date().toISOString() 
      });
    }
    
    setActiveModal(null);
    setEditingGasto(null);
    showToast('Gasto aprobado correctamente');
  };

  const handleRejectGasto = () => {
    if (!editingGasto) return;
    
    setGastosData(gastosData.map(g => 
      g.id === editingGasto.id 
        ? { ...g, status: 'rejected' }
        : g
    ));
    
    if (selectedGasto?.id === editingGasto.id) {
      setSelectedGasto({ ...selectedGasto, status: 'rejected' });
    }
    
    setActiveModal(null);
    setEditingGasto(null);
    showToast('Gasto rechazado', 'info');
  };

  const handleDeleteGasto = () => {
    if (!editingGasto) return;
    
    setGastosData(gastosData.filter(g => g.id !== editingGasto.id));
    if (selectedGasto?.id === editingGasto.id) {
      setSelectedGasto(null);
    }
    setActiveModal(null);
    setEditingGasto(null);
    showToast('Gasto eliminado');
  };

  const openApproveModal = (gasto: Gasto) => {
    setEditingGasto(gasto);
    setActiveModal('approve');
  };

  const openEditModal = (gasto: Gasto) => {
    setEditingGasto(gasto);
    setActiveModal('edit');
  };

  const openDeleteModal = (gasto: Gasto) => {
    setEditingGasto(gasto);
    setActiveModal('delete');
  };

  // Títulos y mensajes según rol
  const getPageInfo = () => {
    switch (role) {
      case 'super_admin':
        return { 
          title: 'Todos los Gastos', 
          subtitle: 'Control financiero completo',
          description: 'Gestión total de gastos del bufete'
        };
      case 'socio':
        return { 
          title: 'Gastos del Bufete', 
          subtitle: 'Supervisión de egresos',
          description: 'Aprobación y supervisión de gastos'
        };
      case 'abogado_senior':
        return { 
          title: 'Mis Gastos y Casos', 
          subtitle: 'Gastos de tus casos asignados',
          description: 'Gastos relacionados con tus casos y reembolsables'
        };
      case 'administrador':
        return { 
          title: 'Gastos Operativos', 
          subtitle: 'Gestión de proveedores y operaciones',
          description: 'Administración de gastos operativos y administrativos'
        };
      case 'contador':
        return { 
          title: 'Contabilidad de Gastos', 
          subtitle: 'Validación fiscal y contable',
          description: 'Todos los gastos para registro contable'
        };
      default:
        return { 
          title: 'Gastos', 
          subtitle: 'Acceso restringido',
          description: ''
        };
    }
  };

  const pageInfo = getPageInfo();

  // Mensaje de acceso según rol
  const getRoleMessage = () => {
    const messages: Record<UserRole, { title: string; description: string; actions: string[] }> = {
      super_admin: {
        title: 'Control Total de Gastos',
        description: 'Puedes ver, crear, editar, eliminar y aprobar cualquier gasto.',
        actions: ['Crear cualquier tipo de gasto', 'Aprobar/Rechazar gastos', 'Eliminar gastos', 'Gestionar proveedores', 'Ver reportes']
      },
      socio: {
        title: 'Supervisión de Gastos',
        description: 'Acceso completo para supervisar y aprobar gastos del bufete.',
        actions: ['Ver todos los gastos', 'Aprobar/Rechazar gastos', 'Crear gastos', 'Gestionar presupuestos', 'Generar reportes']
      },
      abogado_senior: {
        title: 'Gastos de tus Casos',
        description: 'Puedes registrar gastos de tus casos y solicitar reembolsos.',
        actions: ['Registrar gastos de casos', 'Subir comprobantes', 'Solicitar reembolsos', 'Ver gastos aprobados', 'Seguimiento de pagos']
      },
      abogado_junior: {
        title: 'Sin Acceso a Gastos',
        description: 'Tu rol no tiene acceso al módulo de gastos.',
        actions: ['Consulta con tu supervisor', 'Revisa tus tareas', 'Actualiza expedientes']
      },
      paralegal: {
        title: 'Sin Acceso a Gastos',
        description: 'Tu rol no tiene acceso al módulo de gastos.',
        actions: ['Consulta con tu supervisor', 'Colabora en casos', 'Gestiona documentación']
      },
      secretario: {
        title: 'Sin Acceso a Gastos',
        description: 'Tu rol no tiene acceso al módulo de gastos.',
        actions: ['Gestiona citas', 'Organiza documentos', 'Atiende llamadas']
      },
      administrador: {
        title: 'Gestión de Gastos Operativos',
        description: 'Puedes gestionar gastos operativos y administrar proveedores.',
        actions: ['Registrar gastos operativos', 'Aprobar gastos menores', 'Gestionar proveedores', 'Ver presupuestos', 'Control de facturas']
      },
      contador: {
        title: 'Contabilidad de Gastos',
        description: 'Acceso a todos los gastos para validación contable y fiscal.',
        actions: ['Validar comprobantes fiscales', 'Registrar en contabilidad', 'Generar reportes fiscales', 'Revisar deducibilidad', 'Exportar datos']
      },
      recepcionista: {
        title: 'Sin Acceso a Gastos',
        description: 'Tu rol no tiene acceso al módulo de gastos.',
        actions: ['Gestiona citas', 'Atiende llamadas', 'Actualiza contactos']
      },
    };

    return messages[role] || messages.recepcionista;
  };

  // Si el rol no tiene acceso
  if (!permissions.hasAccess) {
    const message = getRoleMessage();
    return (
      <AppLayout 
        title="Gastos y Egresos"
        subtitle="Acceso restringido"
      >
        <main className="flex-1 overflow-y-auto p-6 lg:p-8">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-2xl mx-auto mt-12"
          >
            <div className="p-8 bg-theme-card/60 border border-theme rounded-2xl text-center">
              <div className="w-20 h-20 mx-auto mb-6 bg-theme-secondary rounded-full flex items-center justify-center">
                <Lock className="w-10 h-10 text-theme-muted" />
              </div>
              <h2 className="text-2xl font-bold text-theme-primary mb-2">{message.title}</h2>
              <p className="text-theme-secondary mb-6">{message.description}</p>
              
              <div className="p-4 bg-theme-secondary/50 rounded-xl text-left">
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

  const headerActions = (
    <>
      {permissions.canCreate && (
        <button className="hidden sm:flex items-center gap-2 px-4 py-2 bg-amber-500 text-theme-primary font-medium rounded-xl hover:bg-amber-400 transition-colors">
          <Plus className="w-4 h-4" />
          <span className="hidden lg:inline">Nuevo Gasto</span>
        </button>
      )}
    </>
  );

  // Icono según rol
  const getRoleIcon = () => {
    switch (role) {
      case 'super_admin':
      case 'socio':
        return <Crown className="w-5 h-5" />;
      case 'abogado_senior':
        return <Briefcase className="w-5 h-5" />;
      case 'administrador':
        return <Building2 className="w-5 h-5" />;
      case 'contador':
        return <Calculator className="w-5 h-5" />;
      default:
        return <DollarSign className="w-5 h-5" />;
    }
  };

  // Filtrar tabs disponibles
  const availableTabs = [
    { id: 'gastos', label: 'Gastos', count: filteredGastos.length },
    ...(permissions.canViewPresupuestos ? [{ id: 'presupuestos', label: 'Presupuestos', count: presupuestosData.length }] : []),
    ...(permissions.canViewProveedores ? [{ id: 'proveedores', label: 'Proveedores', count: proveedoresData.length }] : []),
  ];

  return (
    <AppLayout 
      title={pageInfo.title}
      subtitle={`${filteredGastos.length} gastos encontrados${pageInfo.subtitle ? ` • ${pageInfo.subtitle}` : ''}`}
      headerActions={headerActions}
    >
      <main className="flex-1 overflow-y-auto p-6 lg:p-8">
        {/* Stats Cards con gradientes y tendencias */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          {[
            { 
              label: 'Total Gastos', 
              value: stats.totalGastos, 
              trend: 12.5,
              color: 'amber',
              gradient: 'from-amber-500/20 to-amber-600/5',
              icon: DollarSign,
              iconBg: 'bg-amber-500/10',
              iconColor: 'text-amber-400'
            },
            { 
              label: 'Pendientes', 
              value: stats.totalPendientes, 
              trend: -5.2,
              color: 'orange',
              gradient: 'from-orange-500/20 to-orange-600/5',
              icon: Clock,
              iconBg: 'bg-orange-500/10',
              iconColor: 'text-orange-400'
            },
            { 
              label: 'Aprobados', 
              value: stats.totalAprobados, 
              trend: 8.3,
              color: 'blue',
              gradient: 'from-blue-500/20 to-blue-600/5',
              icon: CheckCircle2,
              iconBg: 'bg-blue-500/10',
              iconColor: 'text-blue-400'
            },
            { 
              label: 'Pagados', 
              value: stats.totalPagados, 
              trend: 15.7,
              color: 'emerald',
              gradient: 'from-emerald-500/20 to-emerald-600/5',
              icon: CheckCircle,
              iconBg: 'bg-emerald-500/10',
              iconColor: 'text-emerald-400'
            },
          ].map((stat, index) => {
            const TrendIcon = stat.trend >= 0 ? TrendingUp : TrendingDown;
            const trendColor = stat.trend >= 0 ? 'text-emerald-400' : 'text-red-400';
            
            return (
              <motion.div 
                key={stat.label}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                whileHover={{ scale: 1.02, y: -2 }}
                className={`relative overflow-hidden p-5 bg-gradient-to-br ${stat.gradient} border border-theme rounded-2xl hover:border-${stat.color}-500/30 transition-all cursor-default`}
              >
                <div className="absolute top-0 right-0 w-24 h-24 bg-white/5 rounded-full -mr-8 -mt-8" />
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <p className="text-sm text-theme-secondary mb-1">{stat.label}</p>
                    <p className="text-2xl font-bold text-theme-primary">€{stat.value.toLocaleString()}</p>
                    <div className="flex items-center gap-1.5 mt-2">
                      <TrendIcon className={`w-3.5 h-3.5 ${trendColor}`} />
                      <span className={`text-xs font-medium ${trendColor}`}>
                        {stat.trend >= 0 ? '+' : ''}{stat.trend}%
                      </span>
                      <span className="text-xs text-theme-tertiary">vs mes anterior</span>
                    </div>
                  </div>
                  <div className={`p-2.5 rounded-xl ${stat.iconBg}`}>
                    <stat.icon className={`w-5 h-5 ${stat.iconColor}`} />
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* Distribution - DonutChart para roles con acceso completo */}
        {(role === 'super_admin' || role === 'socio' || role === 'contador') && (
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="mb-6 p-6 bg-theme-card/60 border border-theme rounded-2xl"
          >
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-lg font-semibold text-theme-primary">Distribución por Categoría</h3>
                <p className="text-sm text-theme-secondary">Resumen de gastos por tipo</p>
              </div>
              <div className="text-right">
                <p className="text-2xl font-bold text-theme-primary">€{stats.totalGastos.toLocaleString()}</p>
                <p className="text-xs text-theme-tertiary">Total</p>
              </div>
            </div>
            
            <div className="flex flex-col lg:flex-row items-center gap-6">
              {/* Donut Chart */}
              <div className="w-full lg:w-1/2 h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <defs>
                      <linearGradient id="caseGradient" x1="0" y1="0" x2="1" y2="1">
                        <stop offset="0%" stopColor="#3B82F6" stopOpacity={0.8}/>
                        <stop offset="100%" stopColor="#3B82F6" stopOpacity={0.4}/>
                      </linearGradient>
                      <linearGradient id="operationalGradient" x1="0" y1="0" x2="1" y2="1">
                        <stop offset="0%" stopColor="#F59E0B" stopOpacity={0.8}/>
                        <stop offset="100%" stopColor="#F59E0B" stopOpacity={0.4}/>
                      </linearGradient>
                      <linearGradient id="professionalGradient" x1="0" y1="0" x2="1" y2="1">
                        <stop offset="0%" stopColor="#10B981" stopOpacity={0.8}/>
                        <stop offset="100%" stopColor="#10B981" stopOpacity={0.4}/>
                      </linearGradient>
                      <linearGradient id="adminGradient" x1="0" y1="0" x2="1" y2="1">
                        <stop offset="0%" stopColor="#8B5CF6" stopOpacity={0.8}/>
                        <stop offset="100%" stopColor="#8B5CF6" stopOpacity={0.4}/>
                      </linearGradient>
                      <linearGradient id="reimbursableGradient" x1="0" y1="0" x2="1" y2="1">
                        <stop offset="0%" stopColor="#EC4899" stopOpacity={0.8}/>
                        <stop offset="100%" stopColor="#EC4899" stopOpacity={0.4}/>
                      </linearGradient>
                    </defs>
                    <Pie
                      data={[
                        { name: 'Por Casos', value: filteredGastos.filter(g => g.category === 'case').reduce((sum, g) => sum + g.totalAmount, 0), color: '#3B82F6' },
                        { name: 'Operativos', value: filteredGastos.filter(g => g.category === 'operational').reduce((sum, g) => sum + g.totalAmount, 0), color: '#F59E0B' },
                        { name: 'Profesionales', value: filteredGastos.filter(g => g.category === 'professional').reduce((sum, g) => sum + g.totalAmount, 0), color: '#10B981' },
                        { name: 'Administrativos', value: filteredGastos.filter(g => g.category === 'administrative').reduce((sum, g) => sum + g.totalAmount, 0), color: '#8B5CF6' },
                        { name: 'Reembolsables', value: filteredGastos.filter(g => g.category === 'reimbursable').reduce((sum, g) => sum + g.totalAmount, 0), color: '#EC4899' },
                      ].filter(d => d.value > 0)}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={90}
                      paddingAngle={3}
                      dataKey="value"
                      animationBegin={0}
                      animationDuration={800}
                    >
                      {[
                        { name: 'Por Casos', value: filteredGastos.filter(g => g.category === 'case').reduce((sum, g) => sum + g.totalAmount, 0), color: '#3B82F6' },
                        { name: 'Operativos', value: filteredGastos.filter(g => g.category === 'operational').reduce((sum, g) => sum + g.totalAmount, 0), color: '#F59E0B' },
                        { name: 'Profesionales', value: filteredGastos.filter(g => g.category === 'professional').reduce((sum, g) => sum + g.totalAmount, 0), color: '#10B981' },
                        { name: 'Administrativos', value: filteredGastos.filter(g => g.category === 'administrative').reduce((sum, g) => sum + g.totalAmount, 0), color: '#8B5CF6' },
                        { name: 'Reembolsables', value: filteredGastos.filter(g => g.category === 'reimbursable').reduce((sum, g) => sum + g.totalAmount, 0), color: '#EC4899' },
                      ].filter(d => d.value > 0).map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} stroke="transparent" />
                      ))}
                    </Pie>
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: '#0F172A', 
                        border: '1px solid #1E293B', 
                        borderRadius: '12px',
                        boxShadow: '0 4px 20px rgba(0,0,0,0.3)'
                      }}
                      labelStyle={{ color: '#F1F5F9', fontWeight: 600 }}
                      itemStyle={{ color: '#94A3B8' }}
                      formatter={(value) => [`€${Number(value).toLocaleString()}`, 'Importe']}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>

              {/* Legend */}
              <div className="w-full lg:w-1/2 grid grid-cols-2 gap-3">
                {[
                  { name: 'Por Casos', key: 'case', color: '#3B82F6', bgColor: 'bg-blue-500/10', borderColor: 'border-blue-500/20' },
                  { name: 'Operativos', key: 'operational', color: '#F59E0B', bgColor: 'bg-amber-500/10', borderColor: 'border-amber-500/20' },
                  { name: 'Profesionales', key: 'professional', color: '#10B981', bgColor: 'bg-emerald-500/10', borderColor: 'border-emerald-500/20' },
                  { name: 'Administrativos', key: 'administrative', color: '#8B5CF6', bgColor: 'bg-purple-500/10', borderColor: 'border-purple-500/20' },
                  { name: 'Reembolsables', key: 'reimbursable', color: '#EC4899', bgColor: 'bg-pink-500/10', borderColor: 'border-pink-500/20' },
                ].map((cat) => {
                  const amount = filteredGastos.filter(g => g.category === cat.key).reduce((sum, g) => sum + g.totalAmount, 0);
                  const percentage = stats.totalGastos > 0 ? ((amount / stats.totalGastos) * 100).toFixed(1) : '0';
                  
                  return (
                    <div 
                      key={cat.key}
                      className={`p-3 rounded-xl border ${cat.bgColor} ${cat.borderColor} hover:scale-[1.02] transition-transform cursor-default`}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-xs font-medium" style={{ color: cat.color }}>{cat.name}</span>
                        <span className="text-xs text-theme-tertiary">{percentage}%</span>
                      </div>
                      <p className="text-lg font-bold text-theme-primary">€{amount.toLocaleString()}</p>
                    </div>
                  );
                })}
              </div>
            </div>
          </motion.div>
        )}

        {/* Tabs */}
        <div className="flex gap-2 mb-6 border-b border-theme">
          {availableTabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as ActiveTab)}
              className={`px-6 py-3 text-sm font-medium transition-colors relative ${
                activeTab === tab.id ? 'text-amber-500' : 'text-theme-secondary hover:text-theme-primary'
              }`}
            >
              {tab.label}
              <span className={`ml-2 px-2 py-0.5 rounded-full text-xs ${
                activeTab === tab.id ? 'bg-amber-500/20 text-amber-400' : 'bg-theme-secondary text-theme-secondary'
              }`}>
                {tab.count}
              </span>
              {activeTab === tab.id && (
                <motion.div layoutId="activeTabGastos" className="absolute bottom-0 left-0 right-0 h-0.5 bg-amber-500" />
              )}
            </button>
          ))}
        </div>

        {/* Content */}
        {activeTab === 'gastos' && (
          <GastosView 
            data={filteredGastos}
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
            statusFilter={statusFilter}
            setStatusFilter={setStatusFilter}
            categoryFilter={categoryFilter}
            setCategoryFilter={setCategoryFilter}
            onSelect={setSelectedGasto}
            permissions={permissions}
            onApprove={openApproveModal}
            onEdit={openEditModal}
            onDelete={openDeleteModal}
            role={role}
          />
        )}
        {activeTab === 'presupuestos' && <PresupuestosView data={presupuestosData} />}
        {activeTab === 'proveedores' && <ProveedoresView data={proveedoresData} />}

        {/* Modal de Detalle */}
        {selectedGasto && (
          <GastoModal 
            gasto={selectedGasto} 
            onClose={() => setSelectedGasto(null)} 
            permissions={permissions}
            onApprove={() => openApproveModal(selectedGasto)}
            onReject={() => {
              setEditingGasto(selectedGasto);
              handleRejectGasto();
            }}
          />
        )}

        {/* Info del rol */}
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="mt-6 p-4 bg-theme-card/40 border border-theme rounded-xl"
        >
          <div className="flex items-start gap-3">
            <div className={`p-2 rounded-lg ${roleConfig.bgColor}`}>
              {getRoleIcon()}
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <h4 className="text-sm font-medium text-theme-primary">
                  {getRoleMessage().title}
                </h4>
                <span className={`text-xs px-2 py-0.5 rounded-full ${roleConfig.bgColor} ${roleConfig.textColor}`}>
                  {roleConfig.name}
                </span>
              </div>
              <p className="text-xs text-theme-secondary mt-1">
                {getRoleMessage().description}
              </p>
              <div className="mt-3 flex flex-wrap gap-2">
                {getRoleMessage().actions.slice(0, 3).map((action, idx) => (
                  <span 
                    key={idx}
                    className="inline-flex items-center gap-1.5 text-xs text-theme-secondary px-2 py-1 bg-theme-secondary/50 rounded-lg"
                  >
                    <div className="w-1 h-1 bg-amber-500 rounded-full" />
                    {action}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </motion.div>

        {/* Modal Confirmar Aprobación */}
        <AnimatePresence>
          {activeModal === 'approve' && editingGasto && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
              onClick={() => { setActiveModal(null); setEditingGasto(null); }}
            >
              <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 20 }}
                onClick={(e) => e.stopPropagation()}
                className="bg-theme-primary border border-theme rounded-2xl max-w-md w-full p-6"
              >
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 bg-emerald-500/10 rounded-full flex items-center justify-center">
                    <CheckCircle2 className="w-6 h-6 text-emerald-500" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-theme-primary">Aprobar Gasto</h3>
                    <p className="text-sm text-theme-secondary">Confirmar aprobación de gasto</p>
                  </div>
                </div>
                
                <div className="p-4 bg-theme-secondary/50 rounded-xl mb-6">
                  <p className="text-sm text-theme-secondary mb-2"><strong className="text-theme-primary">{editingGasto.concept}</strong></p>
                  <p className="text-sm text-theme-secondary">Importe: <span className="text-theme-primary font-medium">€{editingGasto.totalAmount.toLocaleString()}</span></p>
                  <p className="text-sm text-theme-secondary">Solicitado por: <span className="text-theme-primary">{editingGasto.submittedByName}</span></p>
                </div>

                <div className="flex justify-end gap-3">
                  <button 
                    onClick={() => { setActiveModal(null); setEditingGasto(null); }}
                    className="px-4 py-2 text-theme-secondary hover:text-theme-primary transition-colors"
                  >
                    Cancelar
                  </button>
                  <button 
                    onClick={handleApproveGasto}
                    className="px-4 py-2 bg-emerald-500 text-theme-primary font-medium rounded-xl hover:bg-emerald-400 transition-colors flex items-center gap-2"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    Aprobar Gasto
                  </button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Modal Confirmar Eliminación */}
        <AnimatePresence>
          {activeModal === 'delete' && editingGasto && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
              onClick={() => { setActiveModal(null); setEditingGasto(null); }}
            >
              <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 20 }}
                onClick={(e) => e.stopPropagation()}
                className="bg-theme-primary border border-theme rounded-2xl max-w-md w-full p-6"
              >
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 bg-red-500/10 rounded-full flex items-center justify-center">
                    <Trash2 className="w-6 h-6 text-red-500" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-theme-primary">Eliminar Gasto</h3>
                    <p className="text-sm text-theme-secondary">Esta acción no se puede deshacer</p>
                  </div>
                </div>
                
                <p className="text-theme-secondary mb-6">
                  ¿Estás seguro de que deseas eliminar el gasto <strong className="text-theme-primary">{editingGasto.concept}</strong>?
                </p>

                <div className="flex justify-end gap-3">
                  <button 
                    onClick={() => { setActiveModal(null); setEditingGasto(null); }}
                    className="px-4 py-2 text-theme-secondary hover:text-theme-primary transition-colors"
                  >
                    Cancelar
                  </button>
                  <button 
                    onClick={handleDeleteGasto}
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

        {/* Toast Notifications */}
        <AnimatePresence>
          {toast && (
            <motion.div
              initial={{ opacity: 0, y: 50, x: '-50%' }}
              animate={{ opacity: 1, y: 0, x: '-50%' }}
              exit={{ opacity: 0, y: 20, x: '-50%' }}
              className={`fixed bottom-6 left-1/2 z-50 px-6 py-3 rounded-xl shadow-lg flex items-center gap-3 ${
                toast.type === 'success' ? 'bg-emerald-500 text-slate-950' :
                toast.type === 'error' ? 'bg-red-500 text-white' :
                'bg-amber-500 text-slate-950'
              }`}
            >
              {toast.type === 'success' ? <CheckCircle className="w-5 h-5" /> :
               toast.type === 'error' ? <AlertCircle className="w-5 h-5" /> :
               <Info className="w-5 h-5" />}
              <span className="font-medium">{toast.message}</span>
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </AppLayout>
  );
}

interface GastosViewProps {
  data: Gasto[];
  searchQuery: string;
  setSearchQuery: (s: string) => void;
  statusFilter: string;
  setStatusFilter: (s: string) => void;
  categoryFilter: string;
  setCategoryFilter: (s: string) => void;
  onSelect: (g: Gasto) => void;
  permissions: {
    canApprove: boolean | string;
    canEdit: boolean;
    canDelete: boolean;
    canValidateFiscal: boolean;
  };
  onApprove: (g: Gasto) => void;
  onEdit: (g: Gasto) => void;
  onDelete: (g: Gasto) => void;
  role: UserRole;
}

function GastosView({ 
  data, searchQuery, setSearchQuery, statusFilter, setStatusFilter, 
  categoryFilter, setCategoryFilter, onSelect, permissions, onApprove, onEdit, onDelete, role
}: GastosViewProps) {
  const [expandedRow, setExpandedRow] = useState<string | null>(null);
  const hasActiveFilters = statusFilter !== 'all' || categoryFilter !== 'all' || searchQuery !== '';
  
  const clearFilters = () => {
    setSearchQuery('');
    setStatusFilter('all');
    setCategoryFilter('all');
  };

  const getStatusLabel = (value: string) => {
    const labels: Record<string, string> = {
      pending: 'Pendiente',
      approved: 'Aprobado',
      accounting: 'En Contabilidad',
      paid: 'Pagado',
      rejected: 'Rechazado'
    };
    return labels[value] || value;
  };

  const getCategoryLabel = (value: string) => {
    const labels: Record<string, string> = {
      case: 'Por Casos',
      operational: 'Operativo',
      administrative: 'Administrativo',
      professional: 'Profesional',
      reimbursable: 'Reembolsable'
    };
    return labels[value] || value;
  };

  return (
    <>
      {/* Filters con chips activos */}
      <div className="mb-6 space-y-4">
        {/* Barra de búsqueda y filtros */}
        <div className="flex flex-col lg:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-theme-muted" />
            <input
              type="text"
              placeholder="Buscar por concepto, descripción, proveedor o caso..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-10 py-3 bg-theme-primary border border-theme rounded-xl text-theme-primary placeholder-theme-muted focus:outline-none focus:border-amber-500 transition-colors"
            />
            {searchQuery && (
              <button 
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-theme-muted hover:text-theme-secondary transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
          <div className="flex gap-3">
            <div className="relative">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="appearance-none pl-4 pr-10 py-3 bg-theme-primary border border-theme rounded-xl text-theme-primary focus:outline-none focus:border-amber-500 transition-colors cursor-pointer min-w-[160px]"
              >
                <option value="all">Todos los estados</option>
                <option value="pending">Pendiente</option>
                <option value="approved">Aprobado</option>
                <option value="accounting">En Contabilidad</option>
                <option value="paid">Pagado</option>
                <option value="rejected">Rechazado</option>
              </select>
              <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
                <svg className="w-4 h-4 text-theme-muted" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </div>
            </div>
            <div className="relative">
              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="appearance-none pl-4 pr-10 py-3 bg-theme-primary border border-theme rounded-xl text-theme-primary focus:outline-none focus:border-amber-500 transition-colors cursor-pointer min-w-[180px]"
              >
                <option value="all">Todas las categorías</option>
                <option value="case">Por Casos</option>
                <option value="operational">Operativo</option>
                <option value="administrative">Administrativo</option>
                <option value="professional">Profesional</option>
                <option value="reimbursable">Reembolsable</option>
              </select>
              <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
                <svg className="w-4 h-4 text-theme-muted" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </div>
            </div>
          </div>
        </div>

        {/* Chips de filtros activos */}
        {hasActiveFilters && (
          <motion.div 
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-wrap items-center gap-2"
          >
            <span className="text-sm text-theme-secondary">Filtros activos:</span>
            
            {searchQuery && (
              <motion.span 
                initial={{ scale: 0.8 }}
                animate={{ scale: 1 }}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-amber-500/10 border border-amber-500/30 rounded-full text-sm text-amber-400"
              >
                <Search className="w-3.5 h-3.5" />
                "{searchQuery}"
                <button 
                  onClick={() => setSearchQuery('')}
                  className="ml-1 hover:text-amber-300 transition-colors"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </motion.span>
            )}

            {statusFilter !== 'all' && (
              <motion.span 
                initial={{ scale: 0.8 }}
                animate={{ scale: 1 }}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-blue-500/10 border border-blue-500/30 rounded-full text-sm text-blue-400"
              >
                {getStatusLabel(statusFilter)}
                <button 
                  onClick={() => setStatusFilter('all')}
                  className="ml-1 hover:text-blue-300 transition-colors"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </motion.span>
            )}

            {categoryFilter !== 'all' && (
              <motion.span 
                initial={{ scale: 0.8 }}
                animate={{ scale: 1 }}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-500/10 border border-emerald-500/30 rounded-full text-sm text-emerald-400"
              >
                {getCategoryLabel(categoryFilter)}
                <button 
                  onClick={() => setCategoryFilter('all')}
                  className="ml-1 hover:text-emerald-300 transition-colors"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </motion.span>
            )}

            <button 
              onClick={clearFilters}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm text-theme-muted hover:text-theme-secondary transition-colors"
            >
              <XCircle className="w-4 h-4" />
              Limpiar todo
            </button>

            <span className="text-sm text-theme-tertiary ml-auto">
              {data.length} resultado{data.length !== 1 ? 's' : ''}
            </span>
          </motion.div>
        )}
      </div>

      {/* Table mejorada con expandable rows */}
      <div className="bg-theme-card/60 border border-theme rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="sticky top-0 z-10">
              <tr className="border-b border-theme bg-theme-card/95 backdrop-blur-sm">
                <th className="w-10 py-4 px-4"></th>
                <th className="text-left py-4 px-4 text-xs font-medium text-theme-secondary uppercase">Concepto</th>
                <th className="text-left py-4 px-4 text-xs font-medium text-theme-secondary uppercase">Categoría</th>
                <th className="text-left py-4 px-4 text-xs font-medium text-theme-secondary uppercase">Importe</th>
                <th className="text-left py-4 px-4 text-xs font-medium text-theme-secondary uppercase">Fecha</th>
                <th className="text-left py-4 px-4 text-xs font-medium text-theme-secondary uppercase">Estado</th>
                <th className="text-left py-4 px-4 text-xs font-medium text-theme-secondary uppercase">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {data.map((gasto, index) => {
                const isExpanded = expandedRow === gasto.id;
                const statusBg = gasto.status === 'pending' ? 'bg-orange-500/5' : 
                                 gasto.status === 'approved' ? 'bg-blue-500/5' :
                                 gasto.status === 'paid' ? 'bg-emerald-500/5' :
                                 gasto.status === 'rejected' ? 'bg-red-500/5' : '';
                
                return (
                  <React.Fragment key={gasto.id}>
                    <motion.tr 
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.03 }}
                      className={`border-b border-theme/50 ${statusBg} hover:bg-theme-tertiary/30 transition-all cursor-pointer group`}
                      onClick={() => setExpandedRow(isExpanded ? null : gasto.id)}
                    >
                      <td className="py-4 px-4">
                        <div className={`w-6 h-6 flex items-center justify-center rounded-md transition-all ${
                          isExpanded ? 'bg-amber-500/20 text-amber-400' : 'text-theme-muted group-hover:bg-theme-tertiary/50'
                        }`}>
                          <svg 
                            className={`w-4 h-4 transition-transform ${isExpanded ? 'rotate-90' : ''}`} 
                            fill="none" 
                            stroke="currentColor" 
                            viewBox="0 0 24 24"
                          >
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                          </svg>
                        </div>
                      </td>
                      <td className="py-4 px-4">
                        <div>
                          <p className="text-sm font-medium text-theme-primary group-hover:text-amber-500 transition-colors">{gasto.concept}</p>
                          <p className="text-xs text-theme-tertiary line-clamp-1">{gasto.description}</p>
                          {gasto.caseTitle && (
                            <p className="text-xs text-blue-400 mt-1">{gasto.caseTitle}</p>
                          )}
                        </div>
                      </td>
                      <td className="py-4 px-4">
                        <span className={`px-3 py-1 text-xs font-medium rounded-full border ${getGastoCategoryColor(gasto.category)}`}>
                          {getGastoCategoryText(gasto.category)}
                        </span>
                      </td>
                      <td className="py-4 px-4">
                        <p className="text-sm font-bold text-theme-primary">€{gasto.totalAmount.toLocaleString()}</p>
                        {gasto.taxAmount > 0 && (
                          <p className="text-xs text-theme-tertiary">IVA: €{gasto.taxAmount.toLocaleString()}</p>
                        )}
                      </td>
                      <td className="py-4 px-4">
                        <p className="text-sm text-theme-secondary">{new Date(gasto.date).toLocaleDateString('es-ES')}</p>
                      </td>
                      <td className="py-4 px-4">
                        <span className={`px-3 py-1 text-xs font-medium rounded-full border ${getGastoStatusColor(gasto.status)}`}>
                          {getGastoStatusText(gasto.status)}
                        </span>
                      </td>
                      <td className="py-4 px-4">
                        <div className="flex items-center gap-1">
                          <button 
                            onClick={(e) => { e.stopPropagation(); onSelect(gasto); }}
                            className="p-2 text-theme-tertiary hover:text-amber-500 hover:bg-amber-500/10 rounded-lg transition-colors"
                            title="Ver detalle"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          {gasto.status === 'pending' && permissions.canApprove && (
                            <button 
                              onClick={(e) => { e.stopPropagation(); onApprove(gasto); }}
                              className="p-2 text-theme-tertiary hover:text-emerald-500 hover:bg-emerald-500/10 rounded-lg transition-colors"
                              title="Aprobar"
                            >
                              <CheckCircle2 className="w-4 h-4" />
                            </button>
                          )}
                          {permissions.canEdit && (
                            <button 
                              onClick={(e) => { e.stopPropagation(); onEdit(gasto); }}
                              className="p-2 text-theme-tertiary hover:text-blue-500 hover:bg-blue-500/10 rounded-lg transition-colors"
                              title="Editar"
                            >
                              <Edit2 className="w-4 h-4" />
                            </button>
                          )}
                          {permissions.canDelete && (
                            <button 
                              onClick={(e) => { e.stopPropagation(); onDelete(gasto); }}
                              className="p-2 text-theme-tertiary hover:text-red-500 hover:bg-red-500/10 rounded-lg transition-colors"
                              title="Eliminar"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      </td>
                    </motion.tr>
                    
                    {/* Fila expandida */}
                    <AnimatePresence>
                      {isExpanded && (
                        <motion.tr
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: 'auto' }}
                          exit={{ opacity: 0, height: 0 }}
                          className="border-b border-theme/30 bg-theme-tertiary/20"
                        >
                          <td colSpan={7} className="py-4 px-4">
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                              <div>
                                <p className="text-xs text-theme-muted uppercase tracking-wide">Solicitante</p>
                                <p className="text-sm text-theme-primary font-medium mt-1">{gasto.submittedByName}</p>
                              </div>
                              {gasto.provider && (
                                <div>
                                  <p className="text-xs text-theme-muted uppercase tracking-wide">Proveedor</p>
                                  <p className="text-sm text-theme-primary font-medium mt-1">{gasto.provider}</p>
                                </div>
                              )}
                              {gasto.invoiceNumber && (
                                <div>
                                  <p className="text-xs text-theme-muted uppercase tracking-wide">Factura</p>
                                  <p className="text-sm text-theme-primary font-medium mt-1">{gasto.invoiceNumber}</p>
                                </div>
                              )}
                              {gasto.approvedByName && (
                                <div>
                                  <p className="text-xs text-theme-muted uppercase tracking-wide">Aprobado por</p>
                                  <p className="text-sm text-theme-primary font-medium mt-1">{gasto.approvedByName}</p>
                                </div>
                              )}
                              {gasto.reimbursable && (
                                <div className="col-span-2 md:col-span-4">
                                  <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-blue-500/10 border border-blue-500/30 rounded-full text-xs text-blue-400">
                                    <Wallet className="w-3 h-3" />
                                    Reembolsable
                                  </span>
                                </div>
                              )}
                              {gasto.attachments.length > 0 && (
                                <div className="col-span-2 md:col-span-4 mt-2">
                                  <p className="text-xs text-theme-muted uppercase tracking-wide mb-2">Adjuntos</p>
                                  <div className="flex flex-wrap gap-2">
                                    {gasto.attachments.map((att, i) => (
                                      <span key={i} className="inline-flex items-center gap-1.5 px-2 py-1 bg-theme-secondary/30 rounded-lg text-xs text-theme-secondary">
                                        <FileText className="w-3 h-3" />
                                        {att}
                                      </span>
                                    ))}
                                  </div>
                                </div>
                              )}
                            </div>
                          </td>
                        </motion.tr>
                      )}
                    </AnimatePresence>
                  </React.Fragment>
                );
              })}
            </tbody>
          </table>
        </div>
        {data.length === 0 && (
          <div className="p-12 text-center">
            <DollarSign className="w-12 h-12 text-theme-tertiary mx-auto mb-4" />
            <p className="text-theme-secondary">No se encontraron gastos</p>
            {role === 'abogado_senior' && (
              <p className="text-sm text-theme-tertiary mt-2">
                No tienes gastos registrados en tus casos actualmente
              </p>
            )}
          </div>
        )}
      </div>
    </>
  );
}

function PresupuestosView({ data }: { data: Presupuesto[] }) {
  return (
    <div className="grid gap-4">
      {data.map((presupuesto, index) => (
        <motion.div
          key={presupuesto.id}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.05 }}
          className="p-6 bg-theme-card/60 border border-theme rounded-2xl"
        >
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-semibold text-theme-primary">{presupuesto.category}</h3>
              <p className="text-sm text-theme-secondary">{presupuesto.month}/{presupuesto.year}</p>
            </div>
            <div className="text-right">
              <p className="text-2xl font-bold text-theme-primary">{presupuesto.percentageUsed.toFixed(1)}%</p>
              <p className="text-xs text-theme-secondary">usado</p>
            </div>
          </div>
          
          <div className="h-3 bg-theme-tertiary rounded-full overflow-hidden mb-4">
            <div 
              className={`h-full rounded-full ${
                presupuesto.percentageUsed > 90 ? 'bg-red-500' :
                presupuesto.percentageUsed > 75 ? 'bg-amber-500' : 'bg-emerald-500'
              }`}
              style={{ width: `${Math.min(presupuesto.percentageUsed, 100)}%` }}
            />
          </div>
          
          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <p className="text-lg font-bold text-theme-primary">€{presupuesto.budgetedAmount.toLocaleString()}</p>
              <p className="text-xs text-theme-secondary">Presupuestado</p>
            </div>
            <div>
              <p className="text-lg font-bold text-amber-400">€{presupuesto.spentAmount.toLocaleString()}</p>
              <p className="text-xs text-theme-secondary">Gastado</p>
            </div>
            <div>
              <p className="text-lg font-bold text-emerald-400">€{presupuesto.remainingAmount.toLocaleString()}</p>
              <p className="text-xs text-theme-secondary">Restante</p>
            </div>
          </div>
        </motion.div>
      ))}
    </div>
  );
}

function ProveedoresView({ data }: { data: Proveedor[] }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {data.map((proveedor, index) => (
        <motion.div
          key={proveedor.id}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.05 }}
          className="p-6 bg-theme-card/60 border border-theme rounded-2xl hover:border-amber-500/30 transition-colors"
        >
          <div className="flex items-start justify-between mb-4">
            <div>
              <h3 className="font-semibold text-theme-primary">{proveedor.name}</h3>
              <p className="text-sm text-theme-secondary">{proveedor.taxId}</p>
            </div>
            <span className={`px-3 py-1 text-xs font-medium rounded-full border ${
              proveedor.status === 'active' 
                ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' 
                : 'bg-theme-tertiary text-theme-secondary border-theme'
            }`}>
              {proveedor.status === 'active' ? 'Activo' : 'Inactivo'}
            </span>
          </div>
          
          <div className="space-y-2 text-sm">
            <p className="text-theme-secondary flex items-center gap-2">
              <Building2 className="w-4 h-4 text-theme-tertiary" />
              {proveedor.address}
            </p>
            <p className="text-theme-secondary flex items-center gap-2">
              <Wallet className="w-4 h-4 text-theme-tertiary" />
              Total facturado: €{proveedor.totalInvoiced.toLocaleString()}
            </p>
          </div>
          
          <div className="mt-4 pt-4 border-t border-theme">
            <p className="text-xs text-theme-secondary mb-2">Categorías:</p>
            <div className="flex flex-wrap gap-2">
              {proveedor.category.map((cat, i) => (
                <span key={i} className="px-2 py-1 bg-theme-tertiary text-theme-secondary text-xs rounded-full">
                  {cat}
                </span>
              ))}
            </div>
          </div>
        </motion.div>
      ))}
    </div>
  );
}

interface GastoModalProps {
  gasto: Gasto;
  onClose: () => void;
  permissions: {
    canApprove: boolean | string;
  };
  onApprove: () => void;
  onReject: () => void;
}

function GastoModal({ gasto, onClose, permissions, onApprove, onReject }: GastoModalProps) {
  const timelineSteps = [
    { status: 'created', label: 'Creado', date: gasto.date, icon: Plus, done: true },
    { status: 'pending', label: 'Pendiente', date: gasto.date, icon: Clock, done: gasto.status !== 'pending' || true },
    { status: 'approved', label: 'Aprobado', date: gasto.approvedDate, icon: CheckCircle2, done: gasto.approvedDate !== undefined },
    { status: 'paid', label: 'Pagado', date: null, icon: Wallet, done: gasto.status === 'paid' },
  ];

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        onClick={(e) => e.stopPropagation()}
        className="bg-theme-primary border border-theme rounded-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto shadow-2xl"
      >
        {/* Header */}
        <div className="p-6 border-b border-theme bg-gradient-to-r from-theme-secondary/30 to-transparent">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-3 flex-wrap">
                <span className={`px-3 py-1 text-xs font-medium rounded-full border ${getGastoStatusColor(gasto.status)}`}>
                  {getGastoStatusText(gasto.status)}
                </span>
                <span className={`px-3 py-1 text-xs font-medium rounded-full border ${getGastoCategoryColor(gasto.category)}`}>
                  {getGastoCategoryText(gasto.category)}
                </span>
                {gasto.reimbursable && (
                  <span className="px-3 py-1 text-xs font-medium rounded-full border bg-blue-500/10 text-blue-400 border-blue-500/20 flex items-center gap-1.5">
                    <Wallet className="w-3 h-3" />
                    Reembolsable
                  </span>
                )}
              </div>
              <h2 className="text-2xl font-bold text-theme-primary">{gasto.concept}</h2>
              <p className="text-sm text-theme-tertiary mt-1">{gasto.id}</p>
            </div>
            <button onClick={onClose} className="p-2 text-theme-tertiary hover:text-theme-primary hover:bg-theme-tertiary rounded-lg transition-colors">
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>
        
        {/* Contenido en 2 columnas */}
        <div className="p-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Columna izquierda - Info principal */}
            <div className="lg:col-span-2 space-y-6">
              {/* Descripción */}
              <div className="p-4 bg-theme-secondary/30 rounded-xl">
                <h3 className="text-sm font-medium text-theme-secondary mb-2 flex items-center gap-2">
                  <FileText className="w-4 h-4" />
                  Descripción
                </h3>
                <p className="text-theme-primary">{gasto.description}</p>
              </div>

              {/* Expediente */}
              {gasto.caseTitle && (
                <div className="p-4 bg-blue-500/10 border border-blue-500/20 rounded-xl">
                  <h3 className="text-sm font-medium text-blue-400 mb-2">Expediente Asociado</h3>
                  <p className="text-theme-primary font-semibold">{gasto.caseTitle}</p>
                  <p className="text-sm text-theme-secondary">{gasto.caseId}</p>
                </div>
              )}

              {/* Timeline visual */}
              <div>
                <h3 className="text-sm font-medium text-theme-secondary mb-4">Estado del Gasto</h3>
                <div className="relative">
                  <div className="absolute top-4 left-4 right-4 h-0.5 bg-theme-tertiary" />
                  <div className="flex justify-between relative">
                    {timelineSteps.map((step, index) => {
                      const Icon = step.icon;
                      const isActive = index <= timelineSteps.findIndex(s => 
                        s.status === (gasto.approvedDate ? 'approved' : gasto.status === 'paid' ? 'paid' : gasto.status === 'approved' ? 'approved' : 'pending')
                      );
                      const isCurrent = step.status === gasto.status || (step.status === 'approved' && gasto.approvedDate) || (step.status === 'paid' && gasto.status === 'paid');
                      
                      return (
                        <div key={step.status} className="flex flex-col items-center">
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center z-10 transition-all ${
                            isActive 
                              ? 'bg-emerald-500 text-white' 
                              : isCurrent 
                                ? 'bg-amber-500 text-white animate-pulse'
                                : 'bg-theme-tertiary text-theme-muted'
                          }`}>
                            <Icon className="w-4 h-4" />
                          </div>
                          <p className={`text-xs mt-2 font-medium ${isActive ? 'text-theme-primary' : 'text-theme-muted'}`}>
                            {step.label}
                          </p>
                          {step.date && (
                            <p className="text-xs text-theme-muted">
                              {new Date(step.date).toLocaleDateString('es-ES')}
                            </p>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* Adjuntos */}
              {gasto.attachments.length > 0 && (
                <div>
                  <h3 className="text-sm font-medium text-theme-secondary mb-3">Adjuntos</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {gasto.attachments.map((att, i) => (
                      <div key={i} className="flex items-center gap-3 p-3 bg-theme-secondary/30 hover:bg-theme-secondary/50 rounded-xl transition-colors cursor-pointer group">
                        <div className="p-2 bg-amber-500/10 rounded-lg group-hover:bg-amber-500/20 transition-colors">
                          <FileText className="w-5 h-5 text-amber-400" />
                        </div>
                        <span className="text-sm text-theme-secondary group-hover:text-theme-primary transition-colors truncate">
                          {att}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Columna derecha - Detalles financieros */}
            <div className="space-y-4">
              {/* Card de totales */}
              <div className="p-5 bg-gradient-to-br from-amber-500/10 to-amber-500/5 border border-amber-500/20 rounded-2xl">
                <p className="text-xs text-amber-400 uppercase tracking-wide mb-1">Total</p>
                <p className="text-3xl font-bold text-theme-primary">€{gasto.totalAmount.toLocaleString()}</p>
              </div>

              {/* Desglose */}
              <div className="p-4 bg-theme-secondary/30 rounded-xl space-y-3">
                <div className="flex justify-between">
                  <span className="text-sm text-theme-secondary">Base imponible</span>
                  <span className="text-sm font-medium text-theme-primary">€{gasto.amount.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-theme-secondary">IVA</span>
                  <span className="text-sm font-medium text-theme-primary">€{gasto.taxAmount.toLocaleString()}</span>
                </div>
                <div className="h-px bg-theme-tertiary" />
                <div className="flex justify-between">
                  <span className="text-sm font-medium text-theme-primary">Total</span>
                  <span className="text-sm font-bold text-theme-primary">€{gasto.totalAmount.toLocaleString()}</span>
                </div>
              </div>

              {/* Datos adicionales */}
              <div className="p-4 bg-theme-secondary/30 rounded-xl space-y-3">
                <div>
                  <p className="text-xs text-theme-muted uppercase tracking-wide">Fecha</p>
                  <p className="text-sm font-medium text-theme-primary">{new Date(gasto.date).toLocaleDateString('es-ES', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
                </div>
                
                {gasto.provider && (
                  <div>
                    <p className="text-xs text-theme-muted uppercase tracking-wide">Proveedor</p>
                    <p className="text-sm font-medium text-theme-primary">{gasto.provider}</p>
                  </div>
                )}

                <div>
                  <p className="text-xs text-theme-muted uppercase tracking-wide">Solicitante</p>
                  <p className="text-sm font-medium text-theme-primary">{gasto.submittedByName}</p>
                </div>

                {gasto.approvedByName && (
                  <div>
                    <p className="text-xs text-theme-muted uppercase tracking-wide">Aprobado por</p>
                    <p className="text-sm font-medium text-theme-primary">{gasto.approvedByName}</p>
                    {gasto.approvedDate && (
                      <p className="text-xs text-theme-tertiary">{new Date(gasto.approvedDate).toLocaleDateString('es-ES')}</p>
                    )}
                  </div>
                )}

                {gasto.invoiceNumber && (
                  <div>
                    <p className="text-xs text-theme-muted uppercase tracking-wide">Factura</p>
                    <p className="text-sm font-medium text-theme-primary">{gasto.invoiceNumber}</p>
                    {gasto.invoiceDate && (
                      <p className="text-xs text-theme-tertiary">Fecha: {new Date(gasto.invoiceDate).toLocaleDateString('es-ES')}</p>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Footer con acciones */}
        <div className="p-6 border-t border-theme bg-gradient-to-r from-transparent to-theme-secondary/20">
          <div className="flex flex-col sm:flex-row justify-between gap-3">
            <button 
              onClick={onClose} 
              className="px-5 py-2.5 text-theme-secondary hover:text-theme-primary border border-theme hover:border-theme-secondary rounded-xl transition-all"
            >
              Cerrar
            </button>
            {gasto.status === 'pending' && permissions.canApprove && (
              <div className="flex gap-3">
                <button 
                  onClick={onReject}
                  className="px-5 py-2.5 bg-red-500/10 text-red-400 border border-red-500/30 hover:bg-red-500/20 hover:border-red-500/50 font-medium rounded-xl transition-all flex items-center gap-2"
                >
                  <X className="w-4 h-4" />
                  Rechazar
                </button>
                <button 
                  onClick={onApprove}
                  className="px-5 py-2.5 bg-emerald-500 text-slate-950 font-medium rounded-xl hover:bg-emerald-400 transition-all flex items-center gap-2 shadow-lg shadow-emerald-500/20"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  Aprobar Gasto
                </button>
              </div>
            )}
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}

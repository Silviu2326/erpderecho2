import { useState, useMemo, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Plus, DollarSign, Building2, FileText,
  CheckCircle2, Clock, AlertCircle, Search, Eye,
  Wallet, Lock, Crown, Briefcase, Calculator,
  CheckCircle, Info, X, Edit2, Trash2,
  TrendingUp, TrendingDown, XCircle, ChevronLeft, ChevronRight,
  ChevronDown, User
} from 'lucide-react';
import { 
  PieChart, Pie, Cell, ResponsiveContainer, Tooltip as RechartsTooltip 
} from 'recharts';
import { AppLayout } from '@/components/layout/AppLayout';
import { gastoService, type Gasto, type Proveedor, type EstadoGasto, type TipoGasto } from '@/services/gastoService';
import { useRole } from '@/hooks/useRole';
import type { UserRole } from '@/types/roles';

type ActiveTab = 'gastos' | 'proveedores';
type ModalType = 'view' | 'approve' | 'reject' | 'pay' | 'delete' | null;

// Mapeo de tipos del backend a categorías del frontend
const mapTipoToCategory = (tipo: TipoGasto): string => {
  const map: Record<TipoGasto, string> = {
    'OPERATIVO': 'operational',
    'PROFESIONAL': 'professional',
    'ADMINISTRATIVO': 'administrative',
    'REEMBOLSABLE': 'reimbursable',
    'CASO': 'case',
  };
  return map[tipo] || tipo.toLowerCase();
};

const mapCategoryToTipo = (category: string): TipoGasto | undefined => {
  const map: Record<string, TipoGasto> = {
    'operational': 'OPERATIVO',
    'professional': 'PROFESIONAL',
    'administrative': 'ADMINISTRATIVO',
    'reimbursable': 'REEMBOLSABLE',
    'case': 'CASO',
  };
  return map[category];
};

const getGastoCategoryColor = (category: string): string => {
  const colors: Record<string, string> = {
    case: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
    operational: 'bg-amber-500/20 text-amber-400 border-amber-500/30',
    professional: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
    administrative: 'bg-purple-500/20 text-purple-400 border-purple-500/30',
    reimbursable: 'bg-pink-500/20 text-pink-400 border-pink-500/30',
  };
  return colors[category] || 'bg-slate-500/20 text-slate-400';
};

const getGastoCategoryText = (category: string): string => {
  const texts: Record<string, string> = {
    case: 'Por Casos',
    operational: 'Operativo',
    professional: 'Profesional',
    administrative: 'Administrativo',
    reimbursable: 'Reembolsable',
  };
  return texts[category] || category;
};

const getGastoStatusColor = (status: string): string => {
  const colors: Record<string, string> = {
    PENDIENTE: 'bg-orange-500/20 text-orange-400 border-orange-500/30',
    APROBADO: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
    RECHAZADO: 'bg-red-500/20 text-red-400 border-red-500/30',
    PAGADO: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
    CONTABILIZADO: 'bg-purple-500/20 text-purple-400 border-purple-500/30',
  };
  return colors[status] || 'bg-slate-500/20 text-slate-400';
};

const getGastoStatusText = (status: string): string => {
  const texts: Record<string, string> = {
    PENDIENTE: 'Pendiente',
    APROBADO: 'Aprobado',
    RECHAZADO: 'Rechazado',
    PAGADO: 'Pagado',
    CONTABILIZADO: 'Contabilizado',
  };
  return texts[status] || status;
};

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('es-ES', {
    style: 'currency',
    currency: 'EUR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
};

export default function Gastos() {
  const { role, roleConfig } = useRole();
  
  // Estados de datos
  const [gastos, setGastos] = useState<Gasto[]>([]);
  const [proveedores, setProveedores] = useState<Proveedor[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalGastos: 0,
    totalPendientes: 0,
    totalAprobados: 0,
    totalPagados: 0,
    sumaTotal: 0,
    sumaPendientes: 0,
    sumaPagados: 0,
  });
  
  // Estados de UI
  const [activeTab, setActiveTab] = useState<ActiveTab>('gastos');
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | EstadoGasto>('all');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [selectedGasto, setSelectedGasto] = useState<Gasto | null>(null);
  const [selectedProveedor, setSelectedProveedor] = useState<Proveedor | null>(null);
  const [activeModal, setActiveModal] = useState<ModalType>(null);
  const [toast, setToast] = useState<{message: string; type: 'success' | 'info' | 'error'} | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [itemsPerPage] = useState(10);

  const showToast = (message: string, type: 'success' | 'info' | 'error' = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  // Cargar gastos desde el backend
  const loadGastos = useCallback(async () => {
    try {
      setLoading(true);
      const params: any = {
        page: currentPage,
        limit: itemsPerPage,
        sort: 'fechaGasto',
        order: 'desc',
      };
      
      if (searchQuery) params.search = searchQuery;
      if (statusFilter !== 'all') params.estado = statusFilter;
      if (categoryFilter !== 'all') {
        const tipo = mapCategoryToTipo(categoryFilter);
        if (tipo) params.tipo = tipo;
      }
      
      const response = await gastoService.getGastos(params);
      setGastos(response.data);
      setTotalPages(response.meta.totalPages);
      
      // Cargar estadísticas
      const statsResponse = await gastoService.getStats();
      setStats(statsResponse.data);
    } catch (error) {
      console.error('Error cargando gastos:', error);
      showToast('Error al cargar los gastos', 'error');
    } finally {
      setLoading(false);
    }
  }, [currentPage, itemsPerPage, searchQuery, statusFilter, categoryFilter]);

  // Cargar proveedores desde el backend
  const loadProveedores = useCallback(async () => {
    try {
      const response = await gastoService.getProveedores({ limit: 100 });
      setProveedores(response.data);
    } catch (error) {
      console.error('Error cargando proveedores:', error);
    }
  }, []);

  useEffect(() => {
    if (activeTab === 'gastos') {
      loadGastos();
    } else {
      loadProveedores();
    }
  }, [activeTab, loadGastos, loadProveedores]);

  // Determinar permisos según el rol
  const permissions = useMemo(() => {
    return {
      hasAccess: role === 'super_admin' || role === 'socio' || 
                 role === 'abogado_senior' || role === 'administrador' || 
                 role === 'contador',
      canViewAll: role === 'super_admin' || role === 'socio' || role === 'contador',
      canCreate: role === 'super_admin' || role === 'socio' || 
                 role === 'abogado_senior' || role === 'administrador',
      canEdit: role === 'super_admin' || role === 'socio' || 
               role === 'abogado_senior',
      canDelete: role === 'super_admin' || role === 'socio',
      canApprove: role === 'super_admin' || role === 'socio',
      canPay: role === 'super_admin' || role === 'socio' || role === 'administrador',
      canManageProviders: role === 'super_admin' || role === 'socio' || role === 'administrador',
    };
  }, [role]);

  // Handlers
  const handleApproveGasto = async () => {
    if (!selectedGasto) return;
    
    try {
      await gastoService.aprobarGasto(selectedGasto.id);
      showToast('Gasto aprobado correctamente');
      setActiveModal(null);
      setSelectedGasto(null);
      loadGastos();
    } catch (error) {
      showToast('Error al aprobar el gasto', 'error');
    }
  };

  const handleRejectGasto = async () => {
    if (!selectedGasto) return;
    
    try {
      await gastoService.rechazarGasto(selectedGasto.id);
      showToast('Gasto rechazado', 'info');
      setActiveModal(null);
      setSelectedGasto(null);
      loadGastos();
    } catch (error) {
      showToast('Error al rechazar el gasto', 'error');
    }
  };

  const handlePayGasto = async () => {
    if (!selectedGasto) return;
    
    try {
      await gastoService.pagarGasto(selectedGasto.id);
      showToast('Gasto marcado como pagado');
      setActiveModal(null);
      setSelectedGasto(null);
      loadGastos();
    } catch (error) {
      showToast('Error al procesar el pago', 'error');
    }
  };

  const handleDeleteGasto = async () => {
    if (!selectedGasto) return;
    
    try {
      await gastoService.deleteGasto(selectedGasto.id);
      showToast('Gasto eliminado');
      setActiveModal(null);
      setSelectedGasto(null);
      loadGastos();
    } catch (error) {
      showToast('Error al eliminar el gasto', 'error');
    }
  };

  const handleDeleteProveedor = async (proveedorId: string) => {
    if (!confirm('¿Estás seguro de eliminar este proveedor?')) return;
    
    try {
      await gastoService.deleteProveedor(proveedorId);
      showToast('Proveedor eliminado');
      loadProveedores();
    } catch (error) {
      showToast('Error al eliminar el proveedor', 'error');
    }
  };

  // Mensaje según rol
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

  // Títulos según rol
  const getPageInfo = () => {
    switch (role) {
      case 'super_admin':
        return { 
          title: 'Todos los Gastos', 
          subtitle: 'Control financiero completo',
        };
      case 'socio':
        return { 
          title: 'Gastos del Bufete', 
          subtitle: 'Supervisión de egresos',
        };
      case 'abogado_senior':
        return { 
          title: 'Mis Gastos y Casos', 
          subtitle: 'Gastos de tus casos asignados',
        };
      case 'administrador':
        return { 
          title: 'Gastos Operativos', 
          subtitle: 'Gestión de proveedores y operaciones',
        };
      case 'contador':
        return { 
          title: 'Contabilidad de Gastos', 
          subtitle: 'Validación fiscal y contable',
        };
      default:
        return { 
          title: 'Gastos', 
          subtitle: '',
        };
    }
  };

  const pageInfo = getPageInfo();

  const headerActions = (
    <>
      {permissions.canCreate && (
        <button className="hidden sm:flex items-center gap-2 px-4 py-2 bg-amber-500 text-slate-950 font-medium rounded-xl hover:bg-amber-400 transition-colors">
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
    { id: 'gastos' as const, label: 'Gastos', count: stats.totalGastos },
    ...(permissions.canManageProviders ? [{ id: 'proveedores' as const, label: 'Proveedores', count: proveedores.length }] : []),
  ];

  return (
    <AppLayout 
      title={pageInfo.title}
      subtitle={pageInfo.subtitle}
      headerActions={headerActions}
    >
      <main className="flex-1 overflow-y-auto p-6 lg:p-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          {[
            { 
              label: 'Total Gastos', 
              value: stats.sumaTotal, 
              trend: 12.5,
              color: 'amber',
              gradient: 'from-amber-500/20 to-amber-600/5',
              icon: DollarSign,
              iconBg: 'bg-amber-500/10',
              iconColor: 'text-amber-400'
            },
            { 
              label: 'Pendientes', 
              value: stats.sumaPendientes, 
              trend: stats.totalPendientes,
              color: 'orange',
              gradient: 'from-orange-500/20 to-orange-600/5',
              icon: Clock,
              iconBg: 'bg-orange-500/10',
              iconColor: 'text-orange-400'
            },
            { 
              label: 'Aprobados', 
              value: gastos.filter(g => g.estado === 'APROBADO').reduce((sum, g) => sum + g.importe, 0), 
              trend: stats.totalAprobados,
              color: 'blue',
              gradient: 'from-blue-500/20 to-blue-600/5',
              icon: CheckCircle2,
              iconBg: 'bg-blue-500/10',
              iconColor: 'text-blue-400'
            },
            { 
              label: 'Pagados', 
              value: stats.sumaPagados, 
              trend: stats.totalPagados,
              color: 'emerald',
              gradient: 'from-emerald-500/20 to-emerald-600/5',
              icon: CheckCircle,
              iconBg: 'bg-emerald-500/10',
              iconColor: 'text-emerald-400'
            },
          ].map((stat, index) => {
            const TrendIcon = TrendingUp;
            
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
                    <p className="text-2xl font-bold text-theme-primary">{formatCurrency(stat.value)}</p>
                    <div className="flex items-center gap-1.5 mt-2">
                      <TrendIcon className={`w-3.5 h-3.5 text-emerald-400`} />
                      <span className="text-xs font-medium text-emerald-400">
                        {stat.trend}
                      </span>
                      <span className="text-xs text-theme-tertiary">
                        {stat.label === 'Pendientes' ? 'por aprobar' : stat.label === 'Aprobados' ? 'por pagar' : stat.label === 'Pagados' ? 'registrados' : 'total'}
                      </span>
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
                <p className="text-2xl font-bold text-theme-primary">{formatCurrency(stats.sumaTotal)}</p>
                <p className="text-xs text-theme-tertiary">Total</p>
              </div>
            </div>
            
            <div className="flex flex-col lg:flex-row items-center gap-6">
              {/* Donut Chart */}
              <div className="w-full lg:w-1/2 h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={[
                        { name: 'Por Casos', value: gastos.filter(g => g.tipo === 'CASO').reduce((sum, g) => sum + g.importe, 0), color: '#3B82F6' },
                        { name: 'Operativos', value: gastos.filter(g => g.tipo === 'OPERATIVO').reduce((sum, g) => sum + g.importe, 0), color: '#F59E0B' },
                        { name: 'Profesionales', value: gastos.filter(g => g.tipo === 'PROFESIONAL').reduce((sum, g) => sum + g.importe, 0), color: '#10B981' },
                        { name: 'Administrativos', value: gastos.filter(g => g.tipo === 'ADMINISTRATIVO').reduce((sum, g) => sum + g.importe, 0), color: '#8B5CF6' },
                        { name: 'Reembolsables', value: gastos.filter(g => g.tipo === 'REEMBOLSABLE').reduce((sum, g) => sum + g.importe, 0), color: '#EC4899' },
                      ].filter(d => d.value > 0)}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={90}
                      paddingAngle={3}
                      dataKey="value"
                    >
                      {[
                        { name: 'Por Casos', value: gastos.filter(g => g.tipo === 'CASO').reduce((sum, g) => sum + g.importe, 0), color: '#3B82F6' },
                        { name: 'Operativos', value: gastos.filter(g => g.tipo === 'OPERATIVO').reduce((sum, g) => sum + g.importe, 0), color: '#F59E0B' },
                        { name: 'Profesionales', value: gastos.filter(g => g.tipo === 'PROFESIONAL').reduce((sum, g) => sum + g.importe, 0), color: '#10B981' },
                        { name: 'Administrativos', value: gastos.filter(g => g.tipo === 'ADMINISTRATIVO').reduce((sum, g) => sum + g.importe, 0), color: '#8B5CF6' },
                        { name: 'Reembolsables', value: gastos.filter(g => g.tipo === 'REEMBOLSABLE').reduce((sum, g) => sum + g.importe, 0), color: '#EC4899' },
                      ].filter(d => d.value > 0).map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} stroke="transparent" />
                      ))}
                    </Pie>
                    <RechartsTooltip 
                      contentStyle={{ 
                        backgroundColor: '#0F172A', 
                        border: '1px solid #1E293B', 
                        borderRadius: '12px',
                      }}
                      formatter={(value) => [`${formatCurrency(value as number)}`, 'Importe']}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>

              {/* Legend */}
              <div className="w-full lg:w-1/2 grid grid-cols-2 gap-3">
                {[
                  { name: 'Por Casos', key: 'CASO', color: '#3B82F6', bgColor: 'bg-blue-500/10', borderColor: 'border-blue-500/20' },
                  { name: 'Operativos', key: 'OPERATIVO', color: '#F59E0B', bgColor: 'bg-amber-500/10', borderColor: 'border-amber-500/20' },
                  { name: 'Profesionales', key: 'PROFESIONAL', color: '#10B981', bgColor: 'bg-emerald-500/10', borderColor: 'border-emerald-500/20' },
                  { name: 'Administrativos', key: 'ADMINISTRATIVO', color: '#8B5CF6', bgColor: 'bg-purple-500/10', borderColor: 'border-purple-500/20' },
                  { name: 'Reembolsables', key: 'REEMBOLSABLE', color: '#EC4899', bgColor: 'bg-pink-500/10', borderColor: 'border-pink-500/20' },
                ].map((cat) => {
                  const amount = gastos.filter(g => g.tipo === cat.key).reduce((sum, g) => sum + g.importe, 0);
                  const percentage = stats.sumaTotal > 0 ? ((amount / stats.sumaTotal) * 100).toFixed(1) : '0';
                  
                  return (
                    <div 
                      key={cat.key}
                      className={`p-3 rounded-xl border ${cat.bgColor} ${cat.borderColor} hover:scale-[1.02] transition-transform cursor-default`}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-xs font-medium" style={{ color: cat.color }}>{cat.name}</span>
                        <span className="text-xs text-theme-tertiary">{percentage}%</span>
                      </div>
                      <p className="text-lg font-bold text-theme-primary">{formatCurrency(amount)}</p>
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
              onClick={() => { setActiveTab(tab.id); setCurrentPage(1); }}
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
            data={gastos}
            loading={loading}
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
            statusFilter={statusFilter}
            setStatusFilter={setStatusFilter}
            categoryFilter={categoryFilter}
            setCategoryFilter={setCategoryFilter}
            onSelect={setSelectedGasto}
            permissions={permissions}
            onApprove={(g) => { setSelectedGasto(g); setActiveModal('approve'); }}
            onReject={(g) => { setSelectedGasto(g); setActiveModal('reject'); }}
            onPay={(g) => { setSelectedGasto(g); setActiveModal('pay'); }}
            onDelete={(g) => { setSelectedGasto(g); setActiveModal('delete'); }}
            currentPage={currentPage}
            setCurrentPage={setCurrentPage}
            totalPages={totalPages}
          />
        )}
        
        {activeTab === 'proveedores' && (
          <ProveedoresView 
            data={proveedores}
            onSelect={setSelectedProveedor}
            onDelete={handleDeleteProveedor}
            permissions={permissions}
          />
        )}

        {/* Modal de Detalle */}
        {selectedGasto && activeModal === 'view' && (
          <GastoModal 
            gasto={selectedGasto} 
            onClose={() => setActiveModal(null)}
            permissions={permissions}
            onApprove={() => setActiveModal('approve')}
            onReject={() => setActiveModal('reject')}
          />
        )}

        {/* Modal Confirmar Aprobación */}
        <AnimatePresence>
          {activeModal === 'approve' && selectedGasto && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
              onClick={() => setActiveModal(null)}
            >
              <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 20 }}
                onClick={(e) => e.stopPropagation()}
                className="bg-slate-900 border border-slate-700 rounded-2xl max-w-md w-full p-6"
              >
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 bg-emerald-500/10 rounded-full flex items-center justify-center">
                    <CheckCircle2 className="w-6 h-6 text-emerald-500" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-white">Aprobar Gasto</h3>
                    <p className="text-sm text-slate-400">Confirmar aprobación de gasto</p>
                  </div>
                </div>
                
                <div className="p-4 bg-slate-800/50 rounded-xl mb-6">
                  <p className="text-sm text-slate-400 mb-2"><strong className="text-white">{selectedGasto.concepto}</strong></p>
                  <p className="text-sm text-slate-400">Importe: <span className="text-white font-medium">{formatCurrency(selectedGasto.importe)}</span></p>
                  <p className="text-sm text-slate-400">Solicitado por: <span className="text-white">{selectedGasto.usuario?.nombre} {selectedGasto.usuario?.apellido1}</span></p>
                </div>

                <div className="flex justify-end gap-3">
                  <button 
                    onClick={() => setActiveModal(null)}
                    className="px-4 py-2 text-slate-400 hover:text-white transition-colors"
                  >
                    Cancelar
                  </button>
                  <button 
                    onClick={handleApproveGasto}
                    className="px-4 py-2 bg-emerald-500 text-slate-950 font-medium rounded-xl hover:bg-emerald-400 transition-colors flex items-center gap-2"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    Aprobar Gasto
                  </button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Modal Confirmar Rechazo */}
        <AnimatePresence>
          {activeModal === 'reject' && selectedGasto && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
              onClick={() => setActiveModal(null)}
            >
              <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 20 }}
                onClick={(e) => e.stopPropagation()}
                className="bg-slate-900 border border-slate-700 rounded-2xl max-w-md w-full p-6"
              >
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 bg-red-500/10 rounded-full flex items-center justify-center">
                    <XCircle className="w-6 h-6 text-red-500" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-white">Rechazar Gasto</h3>
                    <p className="text-sm text-slate-400">¿Estás seguro de rechazar este gasto?</p>
                  </div>
                </div>
                
                <div className="p-4 bg-slate-800/50 rounded-xl mb-6">
                  <p className="text-sm text-slate-400 mb-2"><strong className="text-white">{selectedGasto.concepto}</strong></p>
                  <p className="text-sm text-slate-400">Importe: <span className="text-white font-medium">{formatCurrency(selectedGasto.importe)}</span></p>
                </div>

                <div className="flex justify-end gap-3">
                  <button 
                    onClick={() => setActiveModal(null)}
                    className="px-4 py-2 text-slate-400 hover:text-white transition-colors"
                  >
                    Cancelar
                  </button>
                  <button 
                    onClick={handleRejectGasto}
                    className="px-4 py-2 bg-red-500 text-white font-medium rounded-xl hover:bg-red-400 transition-colors flex items-center gap-2"
                  >
                    <XCircle className="w-4 h-4" />
                    Rechazar
                  </button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Modal Confirmar Pago */}
        <AnimatePresence>
          {activeModal === 'pay' && selectedGasto && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
              onClick={() => setActiveModal(null)}
            >
              <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 20 }}
                onClick={(e) => e.stopPropagation()}
                className="bg-slate-900 border border-slate-700 rounded-2xl max-w-md w-full p-6"
              >
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 bg-emerald-500/10 rounded-full flex items-center justify-center">
                    <Wallet className="w-6 h-6 text-emerald-500" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-white">Registrar Pago</h3>
                    <p className="text-sm text-slate-400">Marcar gasto como pagado</p>
                  </div>
                </div>
                
                <div className="p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-xl mb-6">
                  <p className="text-sm text-emerald-400 mb-2">{selectedGasto.concepto}</p>
                  <p className="text-2xl font-bold text-emerald-400">{formatCurrency(selectedGasto.importe)}</p>
                </div>

                <div className="flex justify-end gap-3">
                  <button 
                    onClick={() => setActiveModal(null)}
                    className="px-4 py-2 text-slate-400 hover:text-white transition-colors"
                  >
                    Cancelar
                  </button>
                  <button 
                    onClick={handlePayGasto}
                    className="px-4 py-2 bg-emerald-500 text-slate-950 font-medium rounded-xl hover:bg-emerald-400 transition-colors flex items-center gap-2"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    Confirmar Pago
                  </button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Modal Confirmar Eliminación */}
        <AnimatePresence>
          {activeModal === 'delete' && selectedGasto && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
              onClick={() => setActiveModal(null)}
            >
              <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 20 }}
                onClick={(e) => e.stopPropagation()}
                className="bg-slate-900 border border-slate-700 rounded-2xl max-w-md w-full p-6"
              >
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 bg-red-500/10 rounded-full flex items-center justify-center">
                    <Trash2 className="w-6 h-6 text-red-500" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-white">Eliminar Gasto</h3>
                    <p className="text-sm text-slate-400">Esta acción no se puede deshacer</p>
                  </div>
                </div>
                
                <p className="text-slate-400 mb-6">
                  ¿Estás seguro de que deseas eliminar el gasto <strong className="text-white">{selectedGasto.concepto}</strong>?
                </p>

                <div className="flex justify-end gap-3">
                  <button 
                    onClick={() => setActiveModal(null)}
                    className="px-4 py-2 text-slate-400 hover:text-white transition-colors"
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

// ==================== COMPONENTES HIJOS ====================

interface GastosViewProps {
  data: Gasto[];
  loading: boolean;
  searchQuery: string;
  setSearchQuery: (s: string) => void;
  statusFilter: 'all' | EstadoGasto;
  setStatusFilter: (s: 'all' | EstadoGasto) => void;
  categoryFilter: string;
  setCategoryFilter: (s: string) => void;
  onSelect: (g: Gasto) => void;
  permissions: {
    canApprove: boolean;
    canPay: boolean;
    canDelete: boolean;
  };
  onApprove: (g: Gasto) => void;
  onReject: (g: Gasto) => void;
  onPay: (g: Gasto) => void;
  onDelete: (g: Gasto) => void;
  currentPage: number;
  setCurrentPage: (p: number) => void;
  totalPages: number;
}

function GastosView({ 
  data, loading, searchQuery, setSearchQuery, statusFilter, setStatusFilter, 
  categoryFilter, setCategoryFilter, onSelect, permissions, onApprove, onReject, onPay, onDelete,
  currentPage, setCurrentPage, totalPages
}: GastosViewProps) {
  const [expandedRow, setExpandedRow] = useState<string | null>(null);
  
  const getStatusLabel = (value: string) => {
    const labels: Record<string, string> = {
      PENDIENTE: 'Pendiente',
      APROBADO: 'Aprobado',
      RECHAZADO: 'Rechazado',
      PAGADO: 'Pagado',
      CONTABILIZADO: 'Contabilizado',
    };
    return labels[value] || value;
  };

  const getCategoryLabel = (value: string) => {
    const labels: Record<string, string> = {
      CASO: 'Por Casos',
      OPERATIVO: 'Operativo',
      ADMINISTRATIVO: 'Administrativo',
      PROFESIONAL: 'Profesional',
      REEMBOLSABLE: 'Reembolsable',
    };
    return labels[value] || value;
  };

  return (
    <>
      {/* Filters */}
      <div className="mb-6 space-y-4">
        <div className="flex flex-col lg:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-theme-muted" />
            <input
              type="text"
              placeholder="Buscar por concepto, descripción o proveedor..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-10 py-3 bg-slate-800 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-amber-500 transition-colors"
            />
            {searchQuery && (
              <button 
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-slate-500 hover:text-white transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
          <div className="flex gap-3">
            <div className="relative">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value as 'all' | EstadoGasto)}
                className="appearance-none pl-4 pr-10 py-3 bg-slate-800 border border-slate-700 rounded-xl text-white focus:outline-none focus:border-amber-500 transition-colors cursor-pointer min-w-[160px]"
              >
                <option value="all">Todos los estados</option>
                <option value="PENDIENTE">Pendiente</option>
                <option value="APROBADO">Aprobado</option>
                <option value="PAGADO">Pagado</option>
                <option value="RECHAZADO">Rechazado</option>
                <option value="CONTABILIZADO">Contabilizado</option>
              </select>
              <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
                <ChevronDown className="w-4 h-4 text-slate-500" />
              </div>
            </div>
            <div className="relative">
              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="appearance-none pl-4 pr-10 py-3 bg-slate-800 border border-slate-700 rounded-xl text-white focus:outline-none focus:border-amber-500 transition-colors cursor-pointer min-w-[180px]"
              >
                <option value="all">Todas las categorías</option>
                <option value="caso">Por Casos</option>
                <option value="operational">Operativo</option>
                <option value="administrative">Administrativo</option>
                <option value="professional">Profesional</option>
                <option value="reimbursable">Reembolsable</option>
              </select>
              <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
                <ChevronDown className="w-4 h-4 text-slate-500" />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="bg-slate-900/50 border border-slate-800 rounded-2xl overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-slate-400">Cargando gastos...</div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="sticky top-0 z-10">
                  <tr className="border-b border-slate-700 bg-slate-800/95 backdrop-blur-sm">
                    <th className="w-10 py-4 px-4"></th>
                    <th className="text-left py-4 px-4 text-xs font-medium text-slate-400 uppercase">Concepto</th>
                    <th className="text-left py-4 px-4 text-xs font-medium text-slate-400 uppercase">Categoría</th>
                    <th className="text-left py-4 px-4 text-xs font-medium text-slate-400 uppercase">Importe</th>
                    <th className="text-left py-4 px-4 text-xs font-medium text-slate-400 uppercase">Fecha</th>
                    <th className="text-left py-4 px-4 text-xs font-medium text-slate-400 uppercase">Estado</th>
                    <th className="text-left py-4 px-4 text-xs font-medium text-slate-400 uppercase">Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {data.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="py-8 text-center text-slate-400">
                        No se encontraron gastos
                      </td>
                    </tr>
                  ) : (
                    data.map((gasto, index) => {
                      const isExpanded = expandedRow === gasto.id;
                      const category = mapTipoToCategory(gasto.tipo);
                      
                      return (
                        <React.Fragment key={gasto.id}>
                          <motion.tr 
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.03 }}
                            className="border-b border-slate-800 hover:bg-slate-800/50 transition-all cursor-pointer group"
                            onClick={() => setExpandedRow(isExpanded ? null : gasto.id)}
                          >
                            <td className="py-4 px-4">
                              <div className={`w-6 h-6 flex items-center justify-center rounded-md transition-all ${
                                isExpanded ? 'bg-amber-500/20 text-amber-400' : 'text-slate-500 group-hover:bg-slate-700'
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
                                <p className="text-sm font-medium text-white group-hover:text-amber-400 transition-colors">{gasto.concepto}</p>
                                {gasto.descripcion && (
                                  <p className="text-xs text-slate-500 line-clamp-1">{gasto.descripcion}</p>
                                )}
                                {gasto.expediente && (
                                  <p className="text-xs text-blue-400 mt-1">{gasto.expediente.numeroExpediente}</p>
                                )}
                              </div>
                            </td>
                            <td className="py-4 px-4">
                              <span className={`px-3 py-1 text-xs font-medium rounded-full border ${getGastoCategoryColor(category)}`}>
                                {getGastoCategoryText(category)}
                              </span>
                            </td>
                            <td className="py-4 px-4">
                              <p className="text-sm font-bold text-white">{formatCurrency(gasto.importe)}</p>
                              {gasto.importeIVA && gasto.importeIVA > 0 && (
                                <p className="text-xs text-slate-500">IVA: {formatCurrency(gasto.importeIVA)}</p>
                              )}
                            </td>
                            <td className="py-4 px-4">
                              <p className="text-sm text-slate-400">{new Date(gasto.fechaGasto).toLocaleDateString('es-ES')}</p>
                            </td>
                            <td className="py-4 px-4">
                              <span className={`px-3 py-1 text-xs font-medium rounded-full border ${getGastoStatusColor(gasto.estado)}`}>
                                {getGastoStatusText(gasto.estado)}
                              </span>
                            </td>
                            <td className="py-4 px-4">
                              <div className="flex items-center gap-1">
                                <button 
                                  onClick={(e) => { e.stopPropagation(); onSelect(gasto); }}
                                  className="p-2 text-slate-500 hover:text-amber-500 hover:bg-amber-500/10 rounded-lg transition-colors"
                                  title="Ver detalle"
                                >
                                  <Eye className="w-4 h-4" />
                                </button>
                                {gasto.estado === 'PENDIENTE' && permissions.canApprove && (
                                  <>
                                    <button 
                                      onClick={(e) => { e.stopPropagation(); onApprove(gasto); }}
                                      className="p-2 text-slate-500 hover:text-emerald-500 hover:bg-emerald-500/10 rounded-lg transition-colors"
                                      title="Aprobar"
                                    >
                                      <CheckCircle2 className="w-4 h-4" />
                                    </button>
                                    <button 
                                      onClick={(e) => { e.stopPropagation(); onReject(gasto); }}
                                      className="p-2 text-slate-500 hover:text-red-500 hover:bg-red-500/10 rounded-lg transition-colors"
                                      title="Rechazar"
                                    >
                                      <XCircle className="w-4 h-4" />
                                    </button>
                                  </>
                                )}
                                {gasto.estado === 'APROBADO' && permissions.canPay && (
                                  <button 
                                    onClick={(e) => { e.stopPropagation(); onPay(gasto); }}
                                    className="p-2 text-slate-500 hover:text-emerald-500 hover:bg-emerald-500/10 rounded-lg transition-colors"
                                    title="Pagar"
                                  >
                                    <Wallet className="w-4 h-4" />
                                  </button>
                                )}
                                {permissions.canDelete && (
                                  <button 
                                    onClick={(e) => { e.stopPropagation(); onDelete(gasto); }}
                                    className="p-2 text-slate-500 hover:text-red-500 hover:bg-red-500/10 rounded-lg transition-colors"
                                    title="Eliminar"
                                  >
                                    <Trash2 className="w-4 h-4" />
                                  </button>
                                )}
                              </div>
                            </td>
                          </motion.tr>
                          
                          {/* Expanded Row */}
                          <AnimatePresence>
                            {isExpanded && (
                              <motion.tr
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: 'auto' }}
                                exit={{ opacity: 0, height: 0 }}
                                className="bg-slate-800/30"
                              >
                                <td colSpan={7} className="py-4 px-4">
                                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                                    <div>
                                      <p className="text-slate-500 mb-1">Proveedor</p>
                                      <p className="text-white">{gasto.proveedor?.nombre || '-'}</p>
                                    </div>
                                    <div>
                                      <p className="text-slate-500 mb-1">Registrado por</p>
                                      <p className="text-white">{gasto.usuario?.nombre} {gasto.usuario?.apellido1}</p>
                                    </div>
                                    <div>
                                      <p className="text-slate-500 mb-1">Fecha de registro</p>
                                      <p className="text-white">{new Date(gasto.createdAt).toLocaleDateString('es-ES')}</p>
                                    </div>
                                    {gasto.aprobadoPor && (
                                      <div>
                                        <p className="text-slate-500 mb-1">Aprobado por</p>
                                        <p className="text-white">{gasto.aprobadoPor.nombre} {gasto.aprobadoPor.apellido1}</p>
                                      </div>
                                    )}
                                  </div>
                                </td>
                              </motion.tr>
                            )}
                          </AnimatePresence>
                        </React.Fragment>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
            
            {/* Paginación */}
            {totalPages > 1 && (
              <div className="flex items-center justify-between p-4 border-t border-slate-800">
                <span className="text-sm text-slate-400">
                  Página {currentPage} de {totalPages}
                </span>
                
                <div className="flex gap-2">
                  <button
                    onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                    disabled={currentPage === 1}
                    className="p-2 rounded-lg border border-slate-700 text-slate-400 hover:text-white hover:bg-slate-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  
                  <button
                    onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                    disabled={currentPage === totalPages}
                    className="p-2 rounded-lg border border-slate-700 text-slate-400 hover:text-white hover:bg-slate-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </>
  );
}

interface ProveedoresViewProps {
  data: Proveedor[];
  onSelect: (p: Proveedor) => void;
  onDelete: (id: string) => void;
  permissions: {
    canManageProviders: boolean;
  };
}

function ProveedoresView({ data, onSelect, onDelete, permissions }: ProveedoresViewProps) {
  return (
    <div className="bg-slate-900/50 border border-slate-800 rounded-2xl overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="sticky top-0 z-10">
            <tr className="border-b border-slate-700 bg-slate-800/95 backdrop-blur-sm">
              <th className="text-left py-4 px-4 text-xs font-medium text-slate-400 uppercase">Nombre</th>
              <th className="text-left py-4 px-4 text-xs font-medium text-slate-400 uppercase">CIF</th>
              <th className="text-left py-4 px-4 text-xs font-medium text-slate-400 uppercase">Contacto</th>
              <th className="text-left py-4 px-4 text-xs font-medium text-slate-400 uppercase">Teléfono</th>
              <th className="text-center py-4 px-4 text-xs font-medium text-slate-400 uppercase">Gastos</th>
              <th className="text-left py-4 px-4 text-xs font-medium text-slate-400 uppercase">Estado</th>
              <th className="text-right py-4 px-4 text-xs font-medium text-slate-400 uppercase">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {data.length === 0 ? (
              <tr>
                <td colSpan={7} className="py-8 text-center text-slate-400">
                  No se encontraron proveedores
                </td>
              </tr>
            ) : (
              data.map((proveedor, index) => (
                <motion.tr 
                  key={proveedor.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.03 }}
                  className="border-b border-slate-800 hover:bg-slate-800/50 transition-all"
                >
                  <td className="py-4 px-4">
                    <div>
                      <p className="text-sm font-medium text-white">{proveedor.nombre}</p>
                      <p className="text-xs text-slate-500">{proveedor.ciudad}{proveedor.provincia && `, ${proveedor.provincia}`}</p>
                    </div>
                  </td>
                  <td className="py-4 px-4">
                    <p className="text-sm text-slate-400">{proveedor.cif || '-'}</p>
                  </td>
                  <td className="py-4 px-4">
                    <div>
                      <p className="text-sm text-slate-400">{proveedor.contactoNombre || proveedor.email || '-'}</p>
                      {proveedor.contactoEmail && (
                        <p className="text-xs text-slate-500">{proveedor.contactoEmail}</p>
                      )}
                    </div>
                  </td>
                  <td className="py-4 px-4">
                    <p className="text-sm text-slate-400">{proveedor.telefono || proveedor.contactoTelefono || '-'}</p>
                  </td>
                  <td className="py-4 px-4 text-center">
                    <span className="px-2 py-1 text-xs font-medium bg-slate-700 text-slate-300 rounded-full">
                      {proveedor._count?.gastos || 0}
                    </span>
                  </td>
                  <td className="py-4 px-4">
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                      proveedor.activo 
                        ? 'bg-emerald-500/20 text-emerald-400' 
                        : 'bg-red-500/20 text-red-400'
                    }`}>
                      {proveedor.activo ? 'Activo' : 'Inactivo'}
                    </span>
                  </td>
                  <td className="py-4 px-4">
                    <div className="flex items-center justify-end gap-1">
                      <button 
                        onClick={() => onSelect(proveedor)}
                        className="p-2 text-slate-500 hover:text-amber-500 hover:bg-amber-500/10 rounded-lg transition-colors"
                        title="Ver detalle"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      {permissions.canManageProviders && (
                        <button 
                          onClick={() => onDelete(proveedor.id)}
                          className="p-2 text-slate-500 hover:text-red-500 hover:bg-red-500/10 rounded-lg transition-colors"
                          title="Eliminar"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </td>
                </motion.tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

interface GastoModalProps {
  gasto: Gasto;
  onClose: () => void;
  permissions: {
    canApprove: boolean;
    canPay: boolean;
  };
  onApprove: () => void;
  onReject: () => void;
}

function GastoModal({ gasto, onClose, permissions, onApprove, onReject }: GastoModalProps) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.95, opacity: 0 }}
        className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-6 border-b border-slate-800 flex items-center justify-between">
          <h2 className="text-xl font-bold text-white">Detalle del Gasto</h2>
          <button onClick={onClose} className="p-2 text-slate-400 hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>
        
        <div className="p-6 space-y-6">
          {/* Header Info */}
          <div className="flex items-start justify-between">
            <div>
              <span className={`px-3 py-1 text-xs font-medium rounded-full border ${getGastoStatusColor(gasto.estado)}`}>
                {getGastoStatusText(gasto.estado)}
              </span>
              <h3 className="text-2xl font-bold text-white mt-2">{gasto.concepto}</h3>
              {gasto.descripcion && (
                <p className="text-slate-400 mt-1">{gasto.descripcion}</p>
              )}
            </div>
            <div className="text-right">
              <p className="text-3xl font-bold text-emerald-400">{formatCurrency(gasto.importe)}</p>
              {gasto.importeIVA && gasto.importeIVA > 0 && (
                <p className="text-sm text-slate-500">IVA: {formatCurrency(gasto.importeIVA)}</p>
              )}
            </div>
          </div>

          {/* Grid Info */}
          <div className="grid grid-cols-2 gap-4">
            <div className="p-4 bg-slate-800/50 rounded-xl">
              <p className="text-sm text-slate-500 mb-1">Categoría</p>
              <p className="text-white font-medium">{getGastoCategoryText(mapTipoToCategory(gasto.tipo))}</p>
            </div>
            
            <div className="p-4 bg-slate-800/50 rounded-xl">
              <p className="text-sm text-slate-500 mb-1">Fecha del Gasto</p>
              <p className="text-white font-medium">{new Date(gasto.fechaGasto).toLocaleDateString('es-ES')}</p>
            </div>
            
            <div className="p-4 bg-slate-800/50 rounded-xl">
              <p className="text-sm text-slate-500 mb-1">Registrado por</p>
              <p className="text-white font-medium">{gasto.usuario?.nombre} {gasto.usuario?.apellido1}</p>
            </div>
            
            <div className="p-4 bg-slate-800/50 rounded-xl">
              <p className="text-sm text-slate-500 mb-1">Fecha de registro</p>
              <p className="text-white font-medium">{new Date(gasto.createdAt).toLocaleDateString('es-ES')}</p>
            </div>
            
            {gasto.proveedor && (
              <div className="p-4 bg-slate-800/50 rounded-xl">
                <p className="text-sm text-slate-500 mb-1">Proveedor</p>
                <p className="text-white font-medium">{gasto.proveedor.nombre}</p>
                {gasto.proveedor.cif && (
                  <p className="text-xs text-slate-500">CIF: {gasto.proveedor.cif}</p>
                )}
              </div>
            )}
            
            {gasto.expediente && (
              <div className="p-4 bg-slate-800/50 rounded-xl">
                <p className="text-sm text-slate-500 mb-1">Expediente</p>
                <p className="text-white font-medium">{gasto.expediente.numeroExpediente}</p>
              </div>
            )}
            
            {gasto.numeroFactura && (
              <div className="p-4 bg-slate-800/50 rounded-xl">
                <p className="text-sm text-slate-500 mb-1">Nº Factura</p>
                <p className="text-white font-medium">{gasto.numeroFactura}</p>
              </div>
            )}
            
            {gasto.fechaPago && (
              <div className="p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-xl">
                <p className="text-sm text-emerald-400 mb-1">Fecha de Pago</p>
                <p className="text-emerald-400 font-medium">{new Date(gasto.fechaPago).toLocaleDateString('es-ES')}</p>
              </div>
            )}
            
            {gasto.aprobadoPor && (
              <div className="p-4 bg-blue-500/10 border border-blue-500/20 rounded-xl">
                <p className="text-sm text-blue-400 mb-1">Aprobado por</p>
                <p className="text-blue-400 font-medium">{gasto.aprobadoPor.nombre} {gasto.aprobadoPor.apellido1}</p>
              </div>
            )}
          </div>

          {/* Reembolsable */}
          {gasto.reembolsable && (
            <div className="p-4 bg-pink-500/10 border border-pink-500/20 rounded-xl">
              <div className="flex items-center gap-2">
                <AlertCircle className="w-5 h-5 text-pink-400" />
                <span className="text-pink-400 font-medium">Gasto Reembolsable</span>
              </div>
              {gasto.fechaReembolso && (
                <p className="text-sm text-pink-400/70 mt-1">
                  Reembolsado el: {new Date(gasto.fechaReembolso).toLocaleDateString('es-ES')}
                </p>
              )}
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="p-6 border-t border-slate-800 flex justify-end gap-3">
          <button 
            onClick={onClose}
            className="px-4 py-2 bg-slate-800 text-white rounded-xl hover:bg-slate-700"
          >
            Cerrar
          </button>
          
          {gasto.estado === 'PENDIENTE' && permissions.canApprove && (
            <>
              <button 
                onClick={onReject}
                className="px-4 py-2 bg-red-500/20 text-red-400 border border-red-500/30 rounded-xl hover:bg-red-500/30"
              >
                Rechazar
              </button>
              <button 
                onClick={onApprove}
                className="px-4 py-2 bg-emerald-500 text-slate-950 font-medium rounded-xl hover:bg-emerald-400"
              >
                Aprobar
              </button>
            </>
          )}
          
          {gasto.estado === 'APROBADO' && permissions.canPay && (
            <button 
              onClick={onApprove}
              className="px-4 py-2 bg-emerald-500 text-slate-950 font-medium rounded-xl hover:bg-emerald-400"
            >
              Registrar Pago
            </button>
          )}
        </div>
      </motion.div>
    </motion.div>
  );
}

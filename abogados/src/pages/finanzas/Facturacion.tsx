import { useState, useMemo, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Plus, Download, Eye, X, ChevronLeft, ChevronRight, ChevronDown,
  Receipt, Wallet, BarChart4, ArrowUpRight, Search,
  BadgeEuro, Clock, AlertCircle, CheckCircle2, Zap, Target, Lock,
  FileCheck, Send, Crown, UserCheck, Percent, RotateCcw, Ban,
  TrendingUp, TrendingDown
} from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { AppLayout } from '@/components/layout/AppLayout';
import { facturaService, type Factura, type EstadoFactura } from '@/services/facturaService';
import { useRole } from '@/hooks/useRole';
import { useTheme } from '@/context/ThemeContext';
import type { UserRole } from '@/types/roles';

type ModalType = 'view' | 'payment' | 'cancel' | null;

// Mapeo de estados del backend a estados del frontend
const mapEstadoToStatus = (estado: EstadoFactura): string => {
  const map: Record<EstadoFactura, string> = {
    'PENDIENTE': 'pending',
    'PAGADA': 'paid',
    'ANULADA': 'cancelled',
    'VENCIDA': 'overdue',
  };
  return map[estado] || estado.toLowerCase();
};

const mapStatusToEstado = (status: string): EstadoFactura | undefined => {
  const map: Record<string, EstadoFactura> = {
    'pending': 'PENDIENTE',
    'paid': 'PAGADA',
    'cancelled': 'ANULADA',
    'overdue': 'VENCIDA',
  };
  return map[status];
};

const getStatusColor = (status: string): string => {
  const colors: Record<string, string> = {
    paid: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
    pending: 'bg-amber-500/20 text-amber-400 border-amber-500/30',
    overdue: 'bg-red-500/20 text-red-400 border-red-500/30',
    cancelled: 'bg-slate-500/20 text-slate-400 border-slate-500/30',
  };
  return colors[status] || 'bg-slate-500/20 text-slate-400';
};

const getStatusText = (status: string): string => {
  const texts: Record<string, string> = {
    paid: 'Pagada',
    pending: 'Pendiente',
    overdue: 'Vencida',
    cancelled: 'Anulada',
  };
  return texts[status] || status;
};

const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('es-ES', {
    style: 'currency',
    currency: 'EUR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
};

export default function Facturacion() {
  const { role, roleConfig } = useRole();
  const { resolvedTheme } = useTheme();
  
  // Estados de datos
  const [facturas, setFacturas] = useState<Factura[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalFacturado: 0,
    totalPendiente: 0,
    totalVencido: 0,
    countPendientes: 0,
    countVencidas: 0,
  });
  
  // Estados de UI
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'oil' | EstadoFactura>('all');
  const [activeTab, setActiveTab] = useState('overview');
  const [activeModal, setActiveModal] = useState<ModalType>(null);
  const [selectedFactura, setSelectedFactura] = useState<Factura | null>(null);
  const [toast, setToast] = useState<{message: string; type: 'success' | 'info' | 'error'} | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [itemsPerPage] = useState(10);
  
  // Form states
  const [paymentForm, setPaymentForm] = useState({
    amount: '',
    method: 'transfer',
    date: new Date().toISOString().split('T')[0]
  });

  const showToast = (message: string, type: 'success' | 'info' | 'error' = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  // Cargar datos desde el backend
  const loadFacturas = useCallback(async () => {
    try {
      setLoading(true);
      const params: any = {
        page: currentPage,
        limit: itemsPerPage,
        sort: 'fechaEmision',
        order: 'desc',
      };
      
      if (searchQuery) params.search = searchQuery;
      if (statusFilter !== 'all') params.estado = statusFilter;
      
      const response = await facturaService.getFacturas(params);
      setFacturas(response.data);
      setTotalPages(response.meta.totalPages);
      
      // Cargar estadísticas
      const statsData = await facturaService.getStats();
      setStats(statsData);
    } catch (error) {
      console.error('Error cargando facturas:', error);
      showToast('Error al cargar las facturas', 'error');
    } finally {
      setLoading(false);
    }
  }, [currentPage, itemsPerPage, searchQuery, statusFilter]);

  useEffect(() => {
    loadFacturas();
  }, [loadFacturas]);

  // Determinar permisos según el rol
  const permissions = useMemo(() => {
    const moduleAccess = roleConfig.permissions.modules.facturacion;
    
    return {
      hasAccess: moduleAccess !== 'none',
      canViewAll: moduleAccess === 'full' || moduleAccess === 'view',
      canCreate: role === 'super_admin' || role === 'socio' || role === 'administrador',
      canEdit: role === 'super_admin' || role === 'socio' || role === 'administrador',
      canDelete: role === 'super_admin' || role === 'socio',
      canCancel: role === 'super_admin' || role === 'socio',
      canRegisterPayments: role === 'super_admin' || role === 'socio' || role === 'administrador',
      canSendReminders: role === 'super_admin' || role === 'socio' || role === 'administrador',
    };
  }, [role, roleConfig]);

  // Handlers
  const handleRegisterPayment = async () => {
    if (!selectedFactura || !paymentForm.amount) {
      showToast('Por favor ingresa el monto', 'error');
      return;
    }
    
    try {
      await facturaService.pagarFactura(selectedFactura.id);
      showToast('Pago registrado correctamente');
      setActiveModal(null);
      setSelectedFactura(null);
      setPaymentForm({ amount: '', method: 'transfer', date: new Date().toISOString().split('T')[0] });
      loadFacturas(); // Recargar datos
    } catch (error) {
      showToast('Error al registrar el pago', 'error');
    }
  };

  const handleCancelInvoice = async () => {
    if (!selectedFactura) return;
    
    if (confirm(`¿Estás seguro de anular la factura ${selectedFactura.numero}?`)) {
      try {
        await facturaService.anularFactura(selectedFactura.id);
        showToast('Factura anulada correctamente');
        setActiveModal(null);
        setSelectedFactura(null);
        loadFacturas(); // Recargar datos
      } catch (error) {
        showToast('Error al anular la factura', 'error');
      }
    }
  };

  const handleSendReminder = async (factura: Factura) => {
    try {
      await facturaService.enviarFactura(factura.id);
      showToast('Recordatorio enviado correctamente');
    } catch (error) {
      showToast('Error al enviar el recordatorio', 'error');
    }
  };

  const handleDownloadInvoice = async (factura: Factura) => {
    try {
      const response = await facturaService.getFacturaPDF(factura.id);
      if (response.url) {
        window.open(response.url, '_blank');
      }
      showToast('Descargando factura...', 'info');
    } catch (error) {
      showToast('Error al descargar la factura', 'error');
    }
  };

  const handleExport = () => {
    showToast('Exportando facturas...', 'info');
    // TODO: Implementar exportación real
  };

  // Mensaje según rol
  const getRoleMessage = () => {
    const messages: Record<UserRole, { title: string; description: string; actions: string[] }> = {
      super_admin: {
        title: 'Control Total de Facturación',
        description: 'Puedes crear, editar, cancelar facturas y autorizar descuentos.',
        actions: ['Crear y cancelar facturas', 'Autorizar descuentos', 'Generar notas de crédito', 'Ver proyecciones anuales']
      },
      socio: {
        title: 'Supervisión Financiera',
        description: 'Acceso a la gestión completa de ingresos y aprobaciones.',
        actions: ['Aprobar descuentos y modificaciones', 'Autorizar cancelaciones', 'Ver análisis financiero', 'Gestionar cotizaciones']
      },
      administrador: {
        title: 'Gestión Operativa de Cobranza',
        description: 'Administra pagos, envía recordatorios y gestiona cobros.',
        actions: ['Crear facturas y registrar pagos', 'Enviar recordatorios', 'Gestionar estados de cuenta', 'Dar seguimiento a cobranza']
      },
      contador: {
        title: 'Validación Contable y Fiscal',
        description: 'Revisa, timbra y genera reportes fiscales de facturación.',
        actions: ['Revisar y validar facturas', 'Timbrar facturas fiscales', 'Generar reportes fiscales', 'Registrar en contabilidad']
      },
      abogado_senior: {
        title: 'Sin Acceso a Facturación',
        description: 'Tu rol no tiene acceso al módulo de facturación.',
        actions: ['Consulta tus expedientes', 'Registra tiempo facturable', 'Ve tus informes personales']
      },
      abogado_junior: {
        title: 'Sin Acceso a Facturación',
        description: 'Tu rol no tiene acceso al módulo de facturación.',
        actions: ['Consulta tus casos asignados', 'Registra tu tiempo', 'Sube documentos de trabajo']
      },
      paralegal: {
        title: 'Sin Acceso a Facturación',
        description: 'Tu rol no tiene acceso al módulo de facturación.',
        actions: ['Colabora en expedientes', 'Actualiza trámites', 'Sube documentos']
      },
      secretario: {
        title: 'Sin Acceso a Facturación',
        description: 'Tu rol no tiene acceso al módulo de facturación.',
        actions: ['Gestiona documentación', 'Organiza archivos', 'Actualiza datos de clientes']
      },
      recepcionista: {
        title: 'Sin Acceso a Facturación',
        description: 'Tu rol no tiene acceso al módulo de facturación.',
        actions: ['Gestiona citas y agenda', 'Atiende llamadas', 'Actualiza contactos']
      },
    };

    return messages[role] || messages.recepcionista;
  };

  // Si el rol no tiene acceso
  if (!permissions.hasAccess) {
    const message = getRoleMessage();
    return (
      <AppLayout 
        title="Facturación"
        subtitle="Acceso restringido"
      >
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

  // Títulos según rol
  const getPageInfo = () => {
    switch (role) {
      case 'super_admin':
        return { 
          title: 'Facturación y Cobranza', 
          subtitle: 'Gestión completa de ingresos',
        };
      case 'socio':
        return { 
          title: 'Facturación Ejecutiva', 
          subtitle: 'Visión integral de ingresos',
        };
      case 'administrador':
        return { 
          title: 'Gestión de Cobranza', 
          subtitle: 'Administración de pagos y facturas',
        };
      case 'contador':
        return { 
          title: 'Facturación Contable', 
          subtitle: 'Validación fiscal y reportes',
        };
      default:
        return { 
          title: 'Facturación', 
          subtitle: '',
        };
    }
  };

  const pageInfo = getPageInfo();

  const headerActions = (
    <>
      {permissions.canCreate && (
        <button 
          onClick={() => {/* TODO: Navegar a formulario de nueva factura */}}
          className="hidden sm:flex items-center gap-2 px-4 py-2 bg-amber-500 text-slate-950 font-medium rounded-xl hover:bg-amber-400 transition-colors"
        >
          <Plus className="w-4 h-4" />
          <span className="hidden lg:inline">Nueva Factura</span>
        </button>
      )}
    </>
  );

  return (
    <AppLayout 
      title={pageInfo.title}
      subtitle={pageInfo.subtitle}
      headerActions={headerActions}
    >
      <main className="flex-1 overflow-y-auto p-4 lg:p-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          {[
            { 
              label: 'Total Facturado', 
              value: formatCurrency(stats.totalFacturado), 
              change: `${facturas.length} facturas`,
              trend: 'up', 
              icon: BadgeEuro, 
              color: 'emerald',
              subtitle: 'ejercicio actual'
            },
            { 
              label: 'Pendiente Cobro', 
              value: formatCurrency(stats.totalPendiente), 
              change: `${stats.countPendientes} facturas`,
              trend: 'up', 
              icon: Clock, 
              color: 'amber',
              subtitle: 'por cobrar'
            },
            { 
              label: 'Vencido', 
              value: formatCurrency(stats.totalVencido), 
              change: `${stats.countVencidas} facturas`,
              trend: 'down', 
              icon: AlertCircle, 
              color: 'red',
              subtitle: 'requieren acción'
            },
            { 
              label: 'Facturas Pagadas', 
              value: formatCurrency(stats.totalFacturado - stats.totalPendiente), 
              change: 'cobrado',
              trend: 'up', 
              icon: CheckCircle2, 
              color: 'blue',
              subtitle: 'ingresos confirmados'
            },
          ].map((stat, index) => {
            const Icon = stat.icon;
            const TrendIcon = stat.trend === 'up' ? TrendingUp : TrendingDown;
            const gradientColors = {
              blue: { bg: 'from-blue-500/20 to-blue-600/5', border: 'border-blue-500/20', icon: 'text-blue-400' },
              emerald: { bg: 'from-emerald-500/20 to-emerald-600/5', border: 'border-emerald-500/20', icon: 'text-emerald-400' },
              amber: { bg: 'from-amber-500/20 to-amber-600/5', border: 'border-amber-500/20', icon: 'text-amber-400' },
              purple: { bg: 'from-purple-500/20 to-purple-600/5', border: 'border-purple-500/20', icon: 'text-purple-400' },
              red: { bg: 'from-red-500/20 to-red-600/5', border: 'border-red-500/20', icon: 'text-red-400' },
            };
            const colors = gradientColors[stat.color as keyof typeof gradientColors] || gradientColors.blue;
            
            return (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className={`relative overflow-hidden p-5 bg-gradient-to-br ${colors.bg} border ${colors.border} rounded-2xl`}
              >
                <div className="flex items-start justify-between mb-3">
                  <div className={`p-2.5 rounded-xl bg-white/10 backdrop-blur-sm`}>
                    <Icon className={`w-5 h-5 ${colors.icon}`} />
                  </div>
                  <div className={`flex items-center gap-1 text-xs font-medium ${stat.trend === 'up' ? 'text-emerald-400' : 'text-red-400'}`}>
                    <TrendIcon className="w-3 h-3" />
                    {stat.change}
                  </div>
                </div>
                <h3 className="text-xl font-bold text-theme-primary mb-0.5">{stat.value}</h3>
                <p className="text-theme-secondary text-sm font-medium">{stat.label}</p>
                <p className="text-theme-tertiary text-xs mt-1">{stat.subtitle}</p>
              </motion.div>
            );
          })}
        </div>

        {/* Tabs */}
        <div className="mb-6">
          <div className="flex items-center gap-1 p-1 bg-theme-secondary/50 rounded-xl overflow-x-auto">
            {[
              { id: 'overview', label: 'Resumen', icon: BarChart4 },
              { id: 'invoices', label: 'Facturas', icon: Receipt },
            ].map((tab) => {
              const isActive = activeTab === tab.id;
              return (
                <motion.button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-all whitespace-nowrap ${
                    isActive
                      ? 'bg-amber-500 text-slate-950 shadow-lg shadow-amber-500/20'
                      : 'text-theme-secondary hover:text-theme-primary hover:bg-theme-tertiary'
                  }`}
                >
                  <tab.icon className={`w-4 h-4 ${isActive ? 'text-slate-950' : ''}`} />
                  <span>{tab.label}</span>
                </motion.button>
              );
            })}
          </div>
        </div>

        {activeTab === 'overview' && (
          <>
            {/* Gráfico y Alertas */}
            <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
              {/* Chart */}
              <div className="xl:col-span-2 bg-gradient-to-br from-theme-card to-theme-secondary/30 border border-theme rounded-2xl p-6">
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h2 className="text-lg font-semibold text-theme-primary">Evolución de Ingresos</h2>
                    <p className="text-sm text-theme-secondary">Facturación mensual</p>
                  </div>
                </div>
                
                <div className="h-72">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={[
                      { month: 'Ene', current: 45000, previous: 38000 },
                      { month: 'Feb', current: 52000, previous: 42000 },
                      { month: 'Mar', current: 48000, previous: 45000 },
                      { month: 'Abr', current: 61000, previous: 48000 },
                      { month: 'May', current: 55000, previous: 51000 },
                      { month: 'Jun', current: 67000, previous: 54000 },
                    ]} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                      <defs>
                        <linearGradient id="colorCurrent" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#10B981" stopOpacity={0.3}/>
                          <stop offset="95%" stopColor="#10B981" stopOpacity={0}/>
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" vertical={false} />
                      <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 12 }} dy={10} />
                      <YAxis axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 12 }} tickFormatter={(value) => `€${(value / 1000).toFixed(0)}k`} dx={-10} />
                      <Tooltip 
                        contentStyle={{ 
                          backgroundColor: 'rgba(15, 23, 42, 0.9)', 
                          border: '1px solid rgba(255,255,255,0.1)', 
                          borderRadius: '12px',
                        }}
                        formatter={(value) => [formatCurrency(value as number), '']}
                      />
                      <Area type="monotone" dataKey="current" stroke="#10B981" strokeWidth={2} fillOpacity={1} fill="url(#colorCurrent)" name="2026" />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Alertas */}
              <div className="bg-gradient-to-br from-amber-500/10 to-amber-600/5 border border-amber-500/20 rounded-2xl p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <div className="p-2 bg-amber-500/20 rounded-lg">
                      <Zap className="w-4 h-4 text-amber-400" />
                    </div>
                    <h3 className="text-lg font-semibold text-theme-primary">Alertas de Cobro</h3>
                  </div>
                  <span className="px-2 py-1 text-xs font-medium bg-amber-500/20 text-amber-400 rounded-full">
                    {stats.countVencidas} vencidas
                  </span>
                </div>
                
                <div className="space-y-3">
                  {facturas
                    .filter(f => f.estado === 'VENCIDA' || f.estado === 'PENDIENTE')
                    .slice(0, 5)
                    .map((factura) => (
                      <div key={factura.id} className="p-3 bg-amber-500/10 border border-amber-500/20 rounded-xl">
                        <div className="flex items-start justify-between mb-2">
                          <span className="text-sm font-semibold text-theme-primary truncate">{factura.cliente?.nombre || 'Sin cliente'}</span>
                          <span className="text-sm font-bold text-amber-400">{formatCurrency(factura.importe)}</span>
                        </div>
                        <div className="flex items-center justify-between text-xs">
                          <span className="text-theme-secondary">{factura.numero}</span>
                          <span className={`font-medium ${factura.estado === 'VENCIDA' ? 'text-red-400' : 'text-amber-400'}`}>
                            {factura.estado === 'VENCIDA' ? 'Vencida' : 'Pendiente'}
                          </span>
                        </div>
                        
                        {permissions.canSendReminders && (
                          <button 
                            onClick={() => handleSendReminder(factura)}
                            className="mt-2 w-full py-1.5 text-xs font-medium bg-amber-500/20 text-amber-400 hover:bg-amber-500/30 rounded-lg transition-colors flex items-center justify-center gap-2"
                          >
                            <Send className="w-3 h-3" /> Enviar recordatorio
                          </button>
                        )}
                      </div>
                    ))}
                  
                  {facturas.filter(f => f.estado === 'VENCIDA' || f.estado === 'PENDIENTE').length === 0 && (
                    <div className="p-4 text-center text-theme-secondary text-sm">
                      No hay facturas pendientes
                    </div>
                  )}
                </div>
              </div>
            </div>
          </>
        )}

        {activeTab === 'invoices' && (
          <div className="bg-gradient-to-br from-theme-card to-theme-secondary/30 border border-theme rounded-2xl overflow-hidden">
            {/* Header con búsqueda y filtros */}
            <div className="p-4 border-b border-theme">
              <div className="flex flex-col lg:flex-row gap-4">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-theme-tertiary" />
                  <input
                    type="text"
                    placeholder="Buscar por cliente, concepto o número..."
                    value={searchQuery}
                    onChange={(e) => { setSearchQuery(e.target.value); setCurrentPage(1); }}
                    className="w-full pl-10 pr-4 py-2.5 bg-theme-tertiary/50 border border-theme rounded-xl text-theme-primary text-sm placeholder-theme-tertiary focus:outline-none focus:border-amber-500 transition-all"
                  />
                </div>
                
                <div className="flex gap-2">
                  <div className="relative">
                    <select
                      value={statusFilter}
                      onChange={(e) => { setStatusFilter(e.target.value as any); setCurrentPage(1); }}
                      className="pl-4 pr-10 py-2.5 bg-theme-tertiary/50 border border-theme rounded-xl text-theme-primary text-sm appearance-none cursor-pointer"
                    >
                      <option value="all">Todos los estados</option>
                      <option value="PAGADA">Pagadas</option>
                      <option value="PENDIENTE">Pendientes</option>
                      <option value="VENCIDA">Vencidas</option>
                      <option value="ANULADA">Anuladas</option>
                    </select>
                    <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-theme-tertiary pointer-events-none" />
                  </div>
                  
                  <button 
                    onClick={handleExport}
                    className="flex items-center gap-2 px-4 py-2.5 bg-theme-tertiary/50 border border-theme rounded-xl text-theme-secondary hover:text-theme-primary transition-colors"
                  >
                    <Download className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>

            {/* Tabla */}
            <div className="overflow-x-auto">
              {loading ? (
                <div className="p-8 text-center text-theme-secondary">Cargando facturas...</div>
              ) : (
                <>
                  <table className="w-full">
                    <thead className="bg-theme-tertiary/30">
                      <tr>
                        <th className="text-left py-3 px-4 text-xs font-medium text-theme-secondary uppercase">Número</th>
                        <th className="text-left py-3 px-4 text-xs font-medium text-theme-secondary uppercase">Cliente</th>
                        <th className="text-left py-3 px-4 text-xs font-medium text-theme-secondary uppercase">Concepto</th>
                        <th className="text-right py-3 px-4 text-xs font-medium text-theme-secondary uppercase">Importe</th>
                        <th className="text-left py-3 px-4 text-xs font-medium text-theme-secondary uppercase">Emisión</th>
                        <th className="text-left py-3 px-4 text-xs font-medium text-theme-secondary uppercase">Estado</th>
                        <th className="text-right py-3 px-4 text-xs font-medium text-theme-secondary uppercase">Acciones</th>
                      </tr>
                    </thead>
                    <tbody>
                      {facturas.map((factura, index) => {
                        const status = mapEstadoToStatus(factura.estado);
                        return (
                          <motion.tr 
                            key={factura.id}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.03 }}
                            className="border-b border-theme hover:bg-theme-tertiary/20 transition-colors"
                          >
                            <td className="py-3 px-4">
                              <span className="font-medium text-theme-primary">{factura.numero}</span>
                            </td>
                            <td className="py-3 px-4">
                              <span className="text-theme-secondary">{factura.cliente?.nombre || '-'}</span>
                            </td>
                            <td className="py-3 px-4">
                              <span className="text-theme-secondary truncate max-w-[200px] block">{factura.concepto}</span>
                            </td>
                            <td className="py-3 px-4 text-right">
                              <span className="font-medium text-theme-primary">{formatCurrency(factura.importe)}</span>
                            </td>
                            <td className="py-3 px-4">
                              <span className="text-theme-secondary text-sm">
                                {new Date(factura.fechaEmision).toLocaleDateString('es-ES')}
                              </span>
                            </td>
                            <td className="py-3 px-4">
                              <span className={`px-2 py-1 text-xs font-medium rounded-full border ${getStatusColor(status)}`}>
                                {getStatusText(status)}
                              </span>
                            </td>
                            <td className="py-3 px-4">
                              <div className="flex items-center justify-end gap-1">
                                <button 
                                  onClick={() => { setSelectedFactura(factura); setActiveModal('view'); }}
                                  className="p-2 text-theme-tertiary hover:text-amber-500 hover:bg-amber-500/10 rounded-lg transition-colors"
                                  title="Ver detalle"
                                >
                                  <Eye className="w-4 h-4" />
                                </button>
                                
                                {factura.estado === 'PENDIENTE' && permissions.canRegisterPayments && (
                                  <button 
                                    onClick={() => { setSelectedFactura(factura); setActiveModal('payment'); }}
                                    className="p-2 text-theme-tertiary hover:text-emerald-500 hover:bg-emerald-500/10 rounded-lg transition-colors"
                                    title="Registrar pago"
                                  >
                                    <CheckCircle2 className="w-4 h-4" />
                                  </button>
                                )}
                                
                                <button 
                                  onClick={() => handleDownloadInvoice(factura)}
                                  className="p-2 text-theme-tertiary hover:text-blue-500 hover:bg-blue-500/10 rounded-lg transition-colors"
                                  title="Descargar PDF"
                                >
                                  <Download className="w-4 h-4" />
                                </button>
                                
                                {factura.estado !== 'ANULADA' && permissions.canCancel && (
                                  <button 
                                    onClick={() => { setSelectedFactura(factura); setActiveModal('cancel'); }}
                                    className="p-2 text-theme-tertiary hover:text-red-500 hover:bg-red-500/10 rounded-lg transition-colors"
                                    title="Anular"
                                  >
                                    <Ban className="w-4 h-4" />
                                  </button>
                                )}
                              </div>
                            </td>
                          </motion.tr>
                        );
                      })}
                    </tbody>
                  </table>
                  
                  {/* Paginación */}
                  {totalPages > 1 && (
                    <div className="flex items-center justify-between p-4 border-t border-theme">
                      <span className="text-sm text-theme-secondary">
                        Página {currentPage} de {totalPages}
                      </span>
                      
                      <div className="flex gap-2">
                        <button
                          onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                          disabled={currentPage === 1}
                          className="p-2 rounded-lg border border-theme text-theme-secondary hover:text-theme-primary hover:bg-theme-tertiary disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                        >
                          <ChevronLeft className="w-4 h-4" />
                        </button>
                        
                        <button
                          onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                          disabled={currentPage === totalPages}
                          className="p-2 rounded-lg border border-theme text-theme-secondary hover:text-theme-primary hover:bg-theme-tertiary disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                        >
                          <ChevronRight className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        )}

        {/* Modal: Ver Detalle */}
        <AnimatePresence>
          {activeModal === 'view' && selectedFactura && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
              onClick={() => setActiveModal(null)}
            >
              <motion.div
                initial={{ scale: 0.95, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.95, opacity: 0 }}
                className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-2xl p-6 max-h-[90vh] overflow-y-auto"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-bold text-white">Detalle de Factura</h2>
                  <button onClick={() => setActiveModal(null)} className="p-2 text-slate-400 hover:text-white">
                    <X className="w-5 h-5" />
                  </button>
                </div>
                
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="p-4 bg-slate-800/50 rounded-xl">
                      <p className="text-sm text-slate-400 mb-1">Número</p>
                      <p className="text-lg font-semibold text-white">{selectedFactura.numero}</p>
                    </div>
                    
                    <div className="p-4 bg-slate-800/50 rounded-xl">
                      <p className="text-sm text-slate-400 mb-1">Estado</p>
                      <span className={`inline-block px-3 py-1 text-sm font-medium rounded-full border ${getStatusColor(mapEstadoToStatus(selectedFactura.estado))}`}>
                        {getStatusText(mapEstadoToStatus(selectedFactura.estado))}
                      </span>
                    </div>
                  </div>
                  
                  <div className="p-4 bg-slate-800/50 rounded-xl">
                    <p className="text-sm text-slate-400 mb-1">Cliente</p>
                    <p className="text-white font-medium">{selectedFactura.cliente?.nombre || 'Sin cliente'}</p>
                    {selectedFactura.cliente?.email && (
                      <p className="text-sm text-slate-400">{selectedFactura.cliente.email}</p>
                    )}
                  </div>
                  
                  <div className="p-4 bg-slate-800/50 rounded-xl">
                    <p className="text-sm text-slate-400 mb-1">Concepto</p>
                    <p className="text-white">{selectedFactura.concepto}</p>
                  </div>
                  
                  <div className="grid grid-cols-3 gap-4">
                    <div className="p-4 bg-slate-800/50 rounded-xl">
                      <p className="text-sm text-slate-400 mb-1">Base Imponible</p>
                      <p className="text-lg font-semibold text-white">{formatCurrency(selectedFactura.importeBase)}</p>
                    </div>
                    
                    <div className="p-4 bg-slate-800/50 rounded-xl">
                      <p className="text-sm text-slate-400 mb-1">IVA</p>
                      <p className="text-lg font-semibold text-white">{formatCurrency(selectedFactura.importeIVA || 0)}</p>
                    </div>
                    
                    <div className="p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-xl">
                      <p className="text-sm text-emerald-400 mb-1">Total</p>
                      <p className="text-2xl font-bold text-emerald-400">{formatCurrency(selectedFactura.importe)}</p>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div className="p-4 bg-slate-800/50 rounded-xl">
                      <p className="text-sm text-slate-400 mb-1">Fecha de Emisión</p>
                      <p className="text-white">{new Date(selectedFactura.fechaEmision).toLocaleDateString('es-ES')}</p>
                    </div>
                    
                    <div className="p-4 bg-slate-800/50 rounded-xl">
                      <p className="text-sm text-slate-400 mb-1">Fecha de Vencimiento</p>
                      <p className="text-white">
                        {selectedFactura.fechaVencimiento 
                          ? new Date(selectedFactura.fechaVencimiento).toLocaleDateString('es-ES')
                          : 'No especificada'}
                      </p>
                    </div>
                  </div>
                  
                  {selectedFactura.expediente && (
                    <div className="p-4 bg-slate-800/50 rounded-xl">
                      <p className="text-sm text-slate-400 mb-1">Expediente Relacionado</p>
                      <p className="text-white font-medium">{selectedFactura.expediente.numeroExpediente}</p>
                    </div>
                  )}
                </div>
                
                <div className="flex gap-3 mt-6">
                  <button 
                    onClick={() => setActiveModal(null)}
                    className="flex-1 px-4 py-2.5 bg-slate-800 text-white rounded-xl hover:bg-slate-700"
                  >
                    Cerrar
                  </button>
                  
                  <button 
                    onClick={() => handleDownloadInvoice(selectedFactura)}
                    className="flex-1 px-4 py-2.5 bg-amber-500 text-slate-950 font-medium rounded-xl hover:bg-amber-400 flex items-center justify-center gap-2"
                  >
                    <Download className="w-4 h-4" />
                    Descargar PDF
                  </button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Modal: Registrar Pago */}
        <AnimatePresence>
          {activeModal === 'payment' && selectedFactura && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
              onClick={() => setActiveModal(null)}
            >
              <motion.div
                initial={{ scale: 0.95, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.95, opacity: 0 }}
                className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-md p-6"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-bold text-white">Registrar Pago</h2>
                  <button onClick={() => setActiveModal(null)} className="p-2 text-slate-400 hover:text-white">
                    <X className="w-5 h-5" />
                  </button>
                </div>
                
                <div className="p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-xl mb-6">
                  <p className="text-sm text-emerald-400 mb-1">Factura {selectedFactura.numero}</p>
                  <p className="text-2xl font-bold text-emerald-400">{formatCurrency(selectedFactura.importe)}</p>
                  <p className="text-sm text-slate-400">{selectedFactura.cliente?.nombre}</p>
                </div>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm text-slate-400 mb-2">Fecha de Pago</label>
                    <input
                      type="date"
                      value={paymentForm.date}
                      onChange={(e) => setPaymentForm({...paymentForm, date: e.target.value})}
                      className="w-full px-4 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-white"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm text-slate-400 mb-2">Método de Pago</label>
                    <select
                      value={paymentForm.method}
                      onChange={(e) => setPaymentForm({...paymentForm, method: e.target.value})}
                      className="w-full px-4 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-white"
                    >
                      <option value="transfer">Transferencia</option>
                      <option value="card">Tarjeta</option>
                      <option value="cash">Efectivo</option>
                      <option value="check">Cheque</option>
                    </select>
                  </div>
                </div>
                
                <div className="flex gap-3 mt-6">
                  <button 
                    onClick={() => setActiveModal(null)}
                    className="flex-1 px-4 py-2.5 bg-slate-800 text-white rounded-xl hover:bg-slate-700"
                  >
                    Cancelar
                  </button>
                  
                  <button 
                    onClick={handleRegisterPayment}
                    className="flex-1 px-4 py-2.5 bg-emerald-500 text-slate-950 font-medium rounded-xl hover:bg-emerald-400 flex items-center justify-center gap-2"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    Confirmar Pago
                  </button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Toast Notification */}
        <AnimatePresence>
          {toast && (
            <motion.div
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 50 }}
              className={`fixed bottom-6 right-6 z-50 px-4 py-3 rounded-xl shadow-lg flex items-center gap-3 ${
                toast.type === 'success' ? 'bg-emerald-500' : 
                toast.type === 'error' ? 'bg-red-500' : 'bg-amber-500'
              } text-slate-950 font-medium`}
            >
              {toast.type === 'success' ? <CheckCircle2 className="w-5 h-5" /> : 
               toast.type === 'error' ? <AlertCircle className="w-5 h-5" /> : <Info className="w-5 h-5" />}
              {toast.message}
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </AppLayout>
  );
}

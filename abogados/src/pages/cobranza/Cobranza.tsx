import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { 
  DollarSign, Phone, Mail, FileText, AlertTriangle, CheckCircle2,
  Search, Eye, 
  PhoneCall, Building, Plus,
  HandCoins,
  Lock, Crown, UserCheck, Calculator,
  TrendingUp, TrendingDown, Clock, FileCheck,
  Calendar, CreditCard,
  Bell, PieChart, AlertCircle,
  ChevronRight, X
} from 'lucide-react';
import { AppLayout } from '@/components/layout/AppLayout';
import { 
  cuentasPorCobrarData, 
  facturasVencidasData,
  cobranzaStats,
  getCuentaStatusColor,
  getCuentaStatusText,
  getCollectionTypeText,
  getCollectionResultText,
  getAgreementStatusColor,
  getAgreementStatusText,
  type CuentaPorCobrar,
  type FacturaVencida,
  type CollectionRecord
} from '@/data/cobranzaData';
import { useRole } from '@/hooks/useRole';
import type { UserRole } from '@/types/roles';

type ActiveTab = 'cuentas' | 'vencidas' | 'acuerdos' | 'estadisticas';

// Simulación de usuario actual por rol
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

export default function Cobranza() {
  const { role, roleConfig } = useRole();
  // currentUserId está disponible para futuras funcionalidades de filtrado por usuario
  getCurrentUserId(role);
  
  const [activeTab, setActiveTab] = useState<ActiveTab>('cuentas');
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedCuenta, setSelectedCuenta] = useState<CuentaPorCobrar | null>(null);

  // Determinar permisos según el rol
  const permissions = useMemo(() => {
    return {
      // Acceso al módulo: solo super_admin, socio, administrador y contador
      hasAccess: role === 'super_admin' || role === 'socio' || role === 'administrador' || role === 'contador',
      
      // Ver todas las cuentas
      canViewAll: role === 'super_admin' || role === 'socio' || role === 'administrador' || role === 'contador',
      
      // Gestionar cobranza (enviar recordatorios, gestionar casos)
      canManageCollection: role === 'super_admin' || role === 'socio' || role === 'administrador',
      
      // Registrar pagos
      canRegisterPayments: role === 'super_admin' || role === 'socio' || role === 'administrador' || role === 'contador',
      
      // Enviar recordatorios
      canSendReminders: role === 'super_admin' || role === 'socio' || role === 'administrador',
      
      // Aprobar acuerdos de pago
      canApproveAgreements: role === 'super_admin' || role === 'socio',
      
      // Generar reportes
      canGenerateReports: role === 'super_admin' || role === 'socio' || role === 'administrador' || role === 'contador',
      
      // Conciliar pagos (solo contador y super_admin)
      canReconcile: role === 'super_admin' || role === 'contador',
    };
  }, [role]);

  // Filtrar cuentas según rol (todos con acceso ven todo por ahora)
  const filteredCuentas = useMemo(() => {
    if (!permissions.hasAccess) return [];
    
    return cuentasPorCobrarData.filter(c => {
      const matchesSearch = 
        c.clientName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.caseTitle?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.id.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesStatus = statusFilter === 'all' || c.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [permissions.hasAccess, searchQuery, statusFilter]);

  // Filtrar facturas vencidas
  const filteredFacturas = useMemo(() => {
    if (!permissions.hasAccess) return [];
    
    return facturasVencidasData.filter(f => {
      const matchesSearch = 
        f.clientName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        f.caseTitle?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        f.id.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesStatus = statusFilter === 'all' || f.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [permissions.hasAccess, searchQuery, statusFilter]);

  // Filtrar acuerdos de pago
  const filteredAcuerdos = useMemo(() => {
    if (!permissions.hasAccess) return [];
    
    return cuentasPorCobrarData.filter(c => c.paymentAgreement);
  }, [permissions.hasAccess]);

  // Mensaje de acceso denegado
  const getRoleMessage = () => {
    const messages: Record<UserRole, { title: string; description: string; actions: string[] }> = {
      super_admin: {
        title: 'Control Total de Cobranza',
        description: 'Acceso completo a la gestión de cuentas por cobrar.',
        actions: ['Ver todas las cuentas', 'Registrar pagos', 'Enviar recordatorios', 'Aprobar acuerdos', 'Generar reportes']
      },
      socio: {
        title: 'Gestión de Cobranza',
        description: 'Supervisión completa de la cartera de cobranza del bufete.',
        actions: ['Ver todas las cuentas', 'Registrar pagos', 'Enviar recordatorios', 'Aprobar acuerdos', 'Generar reportes']
      },
      administrador: {
        title: 'Gestión de Cobranza',
        description: 'Administración de la cobranza y envío de recordatorios.',
        actions: ['Ver todas las cuentas', 'Registrar pagos', 'Enviar recordatorios', 'Generar reportes']
      },
      contador: {
        title: 'Registro de Pagos y Conciliación',
        description: 'Acceso para registrar pagos, conciliar y generar estados de cuenta.',
        actions: ['Ver todas las cuentas', 'Registrar pagos', 'Conciliar movimientos', 'Generar estados de cuenta', 'Generar reportes']
      },
      abogado_senior: {
        title: 'Sin Acceso a Cobranza',
        description: 'Tu rol no tiene acceso al módulo de cobranza.',
        actions: ['Accede a Expedientes', 'Gestiona tus casos', 'Ve tus tareas asignadas']
      },
      abogado_junior: {
        title: 'Sin Acceso a Cobranza',
        description: 'Tu rol no tiene acceso al módulo de cobranza.',
        actions: ['Accede a Expedientes', 'Trabaja en tus casos', 'Completa tus tareas']
      },
      paralegal: {
        title: 'Sin Acceso a Cobranza',
        description: 'Tu rol no tiene acceso al módulo de cobranza.',
        actions: ['Accede a Documentos', 'Colabora en casos', 'Gestiona trámites']
      },
      secretario: {
        title: 'Sin Acceso a Cobranza',
        description: 'Tu rol no tiene acceso al módulo de cobranza.',
        actions: ['Gestiona la agenda', 'Administra documentos', 'Atiende llamadas']
      },
      recepcionista: {
        title: 'Sin Acceso a Cobranza',
        description: 'Tu rol no tiene acceso al módulo de cobranza.',
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
        title="Cobranza"
        subtitle="Gestión de cuentas por cobrar"
      >
        <main className="flex-1 overflow-y-auto p-6 lg:p-8">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-2xl mx-auto mt-12"
          >
            <div className="p-8 bg-theme-secondary/60 border border-theme rounded-2xl text-center">
              <div className="w-20 h-20 mx-auto mb-6 bg-theme-tertiary rounded-full flex items-center justify-center">
                <Lock className="w-10 h-10 text-theme-muted" />
              </div>
              <h2 className="text-2xl font-bold text-theme-primary mb-2">{message.title}</h2>
              <p className="text-theme-secondary mb-6">{message.description}</p>
              
              <div className="p-4 bg-theme-tertiary/50 rounded-xl text-left">
                <p className="text-sm font-medium text-theme-primary mb-3">Acciones disponibles para tu rol:</p>
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
          title: 'Cobranza', 
          subtitle: 'Control total de cuentas por cobrar',
          description: 'Gestión completa de la cartera de cobranza'
        };
      case 'socio':
        return { 
          title: 'Cobranza', 
          subtitle: 'Supervisión de cartera de cobranza',
          description: 'Supervisión de todas las cuentas por cobrar'
        };
      case 'administrador':
        return { 
          title: 'Gestión de Cobranza', 
          subtitle: 'Administración de cobranza y recordatorios',
          description: 'Gestión de cobranza y envío de recordatorios'
        };
      case 'contador':
        return { 
          title: 'Pagos y Conciliación', 
          subtitle: 'Registro de pagos y estados de cuenta',
          description: 'Registro de pagos, conciliación y reportes financieros'
        };
      default:
        return { 
          title: 'Cobranza', 
          subtitle: 'Gestión de cuentas por cobrar',
          description: ''
        };
    }
  };

  const pageInfo = getPageInfo();

  // Icono según rol
  const getRoleIcon = () => {
    switch (role) {
      case 'super_admin':
      case 'socio':
        return <Crown className="w-5 h-5" />;
      case 'administrador':
        return <UserCheck className="w-5 h-5" />;
      case 'contador':
        return <Calculator className="w-5 h-5" />;
      default:
        return <DollarSign className="w-5 h-5" />;
    }
  };

  const headerActions = (
    <>
      {permissions.canGenerateReports && (
        <button className="hidden sm:flex items-center gap-2 px-4 py-2 bg-theme-tertiary text-theme-primary font-medium rounded-xl hover:bg-theme-hover transition-colors border border-theme">
          <FileText className="w-4 h-4" />
          <span className="hidden lg:inline">Reporte</span>
        </button>
      )}
      {permissions.canManageCollection && (
        <button className="hidden sm:flex items-center gap-2 px-4 py-2 bg-amber-500 text-white font-medium rounded-xl hover:bg-amber-400 transition-colors">
          <Phone className="w-4 h-4" />
          <span className="hidden lg:inline">Nuevo Seguimiento</span>
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
      <main className="flex-1 overflow-y-auto p-6 lg:p-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          {[
            { label: 'Total Pendiente', value: `€${cobranzaStats.totalPending.toLocaleString()}`, color: 'amber', icon: DollarSign, trend: '+12%', trendUp: true },
            { label: 'Vencido', value: `€${cobranzaStats.totalOverdue.toLocaleString()}`, color: 'red', icon: AlertTriangle, trend: '+5%', trendUp: false },
            { label: 'Al Día', value: `€${cobranzaStats.totalCurrent.toLocaleString()}`, color: 'emerald', icon: CheckCircle2, trend: '+8%', trendUp: true },
            { label: 'En Cobranza', value: `€${cobranzaStats.inCollection.toLocaleString()}`, color: 'orange', icon: PhoneCall, trend: '-3%', trendUp: true },
          ].map((stat, index) => (
            <motion.div 
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              whileHover={{ y: -4, transition: { duration: 0.2 } }}
              className="p-5 bg-theme-secondary/60 border border-theme rounded-2xl hover:border-amber-500/30 hover:shadow-lg hover:shadow-amber-500/5 transition-all cursor-pointer group"
            >
              <div className="flex items-start justify-between mb-3">
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center bg-gradient-to-br ${
                  stat.color === 'amber' ? 'from-amber-500/20 to-amber-600/10' :
                  stat.color === 'red' ? 'from-red-500/20 to-red-600/10' :
                  stat.color === 'emerald' ? 'from-emerald-500/20 to-emerald-600/10' :
                  'from-orange-500/20 to-orange-600/10'
                } border border-${stat.color}-500/20`}>
                  <stat.icon className={`w-6 h-6 text-${stat.color}-400 group-hover:scale-110 transition-transform`} />
                </div>
                <div className={`flex items-center gap-1 text-xs font-medium px-2 py-1 rounded-full ${
                  stat.trendUp 
                    ? 'bg-emerald-500/10 text-emerald-400' 
                    : 'bg-red-500/10 text-red-400'
                }`}>
                  {stat.trendUp ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                  {stat.trend}
                </div>
              </div>
              <p className="text-2xl font-bold text-theme-primary">{stat.value}</p>
              <p className="text-sm text-theme-secondary mt-1">{stat.label}</p>
            </motion.div>
          ))}
        </div>

        {/* Aging Summary con barras visuales */}
        <div className="p-5 bg-theme-secondary/60 border border-theme rounded-2xl mb-6">
          <div className="flex items-center justify-between mb-5">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-amber-500/10 flex items-center justify-center border border-amber-500/20">
                <Clock className="w-5 h-5 text-amber-400" />
              </div>
              <div>
                <h3 className="text-base font-semibold text-theme-primary">Antigüedad de Saldos</h3>
                <p className="text-xs text-theme-secondary">Distribución por días de mora</p>
              </div>
            </div>
          </div>
          
          {/* Barras de progreso horizontales */}
          <div className="space-y-4">
            {[
              { label: 'Al corriente', value: cobranzaStats.totalCurrent, total: cobranzaStats.totalPending, color: 'emerald', bg: 'emerald' },
              { label: '1-30 días', value: cobranzaStats.overdue0to30, total: cobranzaStats.totalPending, color: 'amber', bg: 'amber' },
              { label: '31-60 días', value: cobranzaStats.overdue31to60, total: cobranzaStats.totalPending, color: 'orange', bg: 'orange' },
              { label: '61-90 días', value: cobranzaStats.overdue61to90, total: cobranzaStats.totalPending, color: 'red', bg: 'red' },
              { label: '> 90 días', value: cobranzaStats.overdueOver90, total: cobranzaStats.totalPending, color: 'purple', bg: 'purple' },
            ].map((item) => {
              const percentage = item.total > 0 ? (item.value / item.total) * 100 : 0;
              return (
                <div key={item.label} className="group">
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-sm text-theme-secondary">{item.label}</span>
                    <div className="flex items-center gap-2">
                      <span className={`text-sm font-semibold text-${item.color}-400`}>€{item.value.toLocaleString()}</span>
                      <span className="text-xs text-theme-muted">({percentage.toFixed(1)}%)</span>
                    </div>
                  </div>
                  <div className="h-2.5 bg-theme-tertiary rounded-full overflow-hidden">
                    <motion.div 
                      initial={{ width: 0 }}
                      animate={{ width: `${percentage}%` }}
                      transition={{ duration: 0.8, ease: "easeOut" }}
                      className={`h-full bg-gradient-to-r from-${item.color}-500 to-${item.color}-400 rounded-full group-hover:opacity-80 transition-opacity`}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Distribución de Cartera */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-6">
          {/* Donut Chart Visual */}
          <div className="p-5 bg-theme-secondary/60 border border-theme rounded-2xl">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-purple-500/10 flex items-center justify-center border border-purple-500/20">
                <PieChart className="w-5 h-5 text-purple-400" />
              </div>
              <div>
                <h3 className="text-base font-semibold text-theme-primary">Distribución</h3>
                <p className="text-xs text-theme-secondary">Estado de cartera</p>
              </div>
            </div>
            
            {/* Visual Donut con CSS */}
            <div className="flex items-center justify-center py-4">
              <div className="relative w-32 h-32">
                <svg viewBox="0 0 100 100" className="w-full h-full -rotate-90">
                  {(() => {
                    const total = cobranzaStats.totalPending;
                    const current = (cobranzaStats.totalCurrent / total) * 100;
                    const pending = ((cobranzaStats.totalPending - cobranzaStats.totalCurrent - cobranzaStats.totalOverdue - cobranzaStats.inCollection) / total) * 100;
                    const overdue = (cobranzaStats.totalOverdue / total) * 100;
                    const collection = (cobranzaStats.inCollection / total) * 100;
                    
                    let cumulative = 0;
                    const segments = [
                      { value: current, color: '#34d399' },
                      { value: pending, color: '#fbbf24' },
                      { value: overdue, color: '#f97316' },
                      { value: collection, color: '#ef4444' },
                    ].filter(s => s.value > 0);
                    
                    return segments.map((seg, i) => {
                      const start = cumulative;
                      cumulative += seg.value;
                      const dashArray = `${seg.value} ${100 - seg.value}`;
                      return (
                        <circle
                          key={i}
                          cx="50"
                          cy="50"
                          r="40"
                          fill="none"
                          stroke={seg.color}
                          strokeWidth="20"
                          strokeDasharray={dashArray}
                          strokeDashoffset={-start}
                          className="transition-all duration-500"
                        />
                      );
                    });
                  })()}
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="text-center">
                    <p className="text-2xl font-bold text-theme-primary">{filteredCuentas.length}</p>
                    <p className="text-xs text-theme-secondary">Cuentas</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Leyenda */}
            <div className="grid grid-cols-2 gap-2 mt-2">
              {[
                { label: 'Al Día', value: cobranzaStats.totalCurrent, color: 'emerald' },
                { label: 'Pendiente', value: cobranzaStats.totalPending - cobranzaStats.totalCurrent - cobranzaStats.totalOverdue - cobranzaStats.inCollection, color: 'amber' },
                { label: 'Vencido', value: cobranzaStats.totalOverdue, color: 'orange' },
                { label: 'Cobranza', value: cobranzaStats.inCollection, color: 'red' },
              ].filter(item => item.value > 0).map((item) => (
                <div key={item.label} className="flex items-center gap-2 text-xs">
                  <div className={`w-3 h-3 rounded-full bg-${item.color}-400`} />
                  <span className="text-theme-secondary">{item.label}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Acciones Rápidas */}
          <div className="p-5 bg-theme-secondary/60 border border-theme rounded-2xl">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center border border-blue-500/20">
                <Bell className="w-5 h-5 text-blue-400" />
              </div>
              <div>
                <h3 className="text-base font-semibold text-theme-primary">Acciones Rápidas</h3>
                <p className="text-xs text-theme-secondary">Gestión inmediata</p>
              </div>
            </div>
            
            <div className="space-y-2">
              {permissions.canSendReminders && (
                <button className="w-full flex items-center gap-3 p-3 bg-theme-tertiary/50 hover:bg-theme-tertiary rounded-xl transition-colors group">
                  <div className="w-9 h-9 rounded-lg bg-purple-500/10 flex items-center justify-center group-hover:scale-110 transition-transform">
                    <Mail className="w-4 h-4 text-purple-400" />
                  </div>
                  <div className="flex-1 text-left">
                    <p className="text-sm font-medium text-theme-primary">Enviar Recordatorio</p>
                    <p className="text-xs text-theme-muted">{filteredFacturas.filter(f => f.remindersSent === 0).length} pendientes</p>
                  </div>
                  <ChevronRight className="w-4 h-4 text-theme-muted group-hover:text-theme-primary transition-colors" />
                </button>
              )}
              
              {permissions.canManageCollection && (
                <button className="w-full flex items-center gap-3 p-3 bg-theme-tertiary/50 hover:bg-theme-tertiary rounded-xl transition-colors group">
                  <div className="w-9 h-9 rounded-lg bg-amber-500/10 flex items-center justify-center group-hover:scale-110 transition-transform">
                    <Phone className="w-4 h-4 text-amber-400" />
                  </div>
                  <div className="flex-1 text-left">
                    <p className="text-sm font-medium text-theme-primary">Llamar Cliente</p>
                    <p className="text-xs text-theme-muted">{filteredCuentas.filter(c => c.daysOverdue > 30).length} urgentes</p>
                  </div>
                  <ChevronRight className="w-4 h-4 text-theme-muted group-hover:text-theme-primary transition-colors" />
                </button>
              )}
              
              {permissions.canRegisterPayments && (
                <button className="w-full flex items-center gap-3 p-3 bg-theme-tertiary/50 hover:bg-theme-tertiary rounded-xl transition-colors group">
                  <div className="w-9 h-9 rounded-lg bg-emerald-500/10 flex items-center justify-center group-hover:scale-110 transition-transform">
                    <CreditCard className="w-4 h-4 text-emerald-400" />
                  </div>
                  <div className="flex-1 text-left">
                    <p className="text-sm font-medium text-theme-primary">Registrar Pago</p>
                    <p className="text-xs text-theme-muted">{filteredAcuerdos.filter(a => a.paymentAgreement?.status === 'active').length} acuerdos</p>
                  </div>
                  <ChevronRight className="w-4 h-4 text-theme-muted group-hover:text-theme-primary transition-colors" />
                </button>
              )}
              
              {permissions.canApproveAgreements && (
                <button className="w-full flex items-center gap-3 p-3 bg-theme-tertiary/50 hover:bg-theme-tertiary rounded-xl transition-colors group">
                  <div className="w-9 h-9 rounded-lg bg-blue-500/10 flex items-center justify-center group-hover:scale-110 transition-transform">
                    <FileCheck className="w-4 h-4 text-blue-400" />
                  </div>
                  <div className="flex-1 text-left">
                    <p className="text-sm font-medium text-theme-primary">Aprobar Acuerdos</p>
                    <p className="text-xs text-theme-muted">{filteredAcuerdos.filter(a => a.paymentAgreement?.status === 'defaulted').length} incumplidos</p>
                  </div>
                  <ChevronRight className="w-4 h-4 text-theme-muted group-hover:text-theme-primary transition-colors" />
                </button>
              )}
            </div>
          </div>

          {/* Alertas Prioritarias */}
          <div className="p-5 bg-theme-secondary/60 border border-theme rounded-2xl">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-red-500/10 flex items-center justify-center border border-red-500/20">
                <AlertCircle className="w-5 h-5 text-red-400" />
              </div>
              <div>
                <h3 className="text-base font-semibold text-theme-primary">Alertas Prioritarias</h3>
                <p className="text-xs text-theme-secondary">Requiere atención</p>
              </div>
            </div>
            
            <div className="space-y-2">
              {filteredCuentas.filter(c => c.daysOverdue > 60).slice(0, 4).map((cuenta) => (
                <div key={cuenta.id} className="flex items-center gap-3 p-2.5 bg-red-500/5 hover:bg-red-500/10 rounded-lg cursor-pointer transition-colors border border-red-500/10">
                  <div className="w-8 h-8 bg-gradient-to-br from-red-500/20 to-red-600/10 rounded-lg flex items-center justify-center text-xs font-bold text-red-400">
                    {cuenta.clientName.split(' ').map((n: string) => n[0]).join('').substring(0, 2)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-theme-primary truncate">{cuenta.clientName}</p>
                    <p className="text-xs text-red-400">€{cuenta.pendingAmount.toLocaleString()} • {cuenta.daysOverdue} días</p>
                  </div>
                </div>
              ))}
              
              {filteredCuentas.filter(c => c.daysOverdue > 60).length === 0 && (
                <div className="text-center py-6">
                  <CheckCircle2 className="w-10 h-10 text-emerald-400 mx-auto mb-2" />
                  <p className="text-sm text-theme-secondary">Sin alertas críticas</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-6 border-b border-theme">
          {[
            { id: 'cuentas', label: 'Cuentas por Cobrar', count: filteredCuentas.length },
            { id: 'vencidas', label: 'Facturas Vencidas', count: filteredFacturas.length },
            { id: 'acuerdos', label: 'Acuerdos de Pago', count: filteredAcuerdos.length },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => { setActiveTab(tab.id as ActiveTab); setSearchQuery(''); setStatusFilter('all'); }}
              className={`px-6 py-3 text-sm font-medium transition-colors relative ${
                activeTab === tab.id
                  ? 'text-amber-500'
                  : 'text-theme-secondary hover:text-theme-primary'
              }`}
            >
              {tab.label}
              <span className={`ml-2 px-2 py-0.5 rounded-full text-xs ${
                activeTab === tab.id ? 'bg-amber-500/20 text-amber-400' : 'bg-theme-tertiary text-theme-secondary'
              }`}>
                {tab.count}
              </span>
              {activeTab === tab.id && (
                <motion.div
                  layoutId="activeTabCobranza"
                  className="absolute bottom-0 left-0 right-0 h-0.5 bg-amber-500"
                />
              )}
            </button>
          ))}
        </div>

        {/* Search and Filters */}
        <div className="mb-6 space-y-4">
          <div className="flex flex-col lg:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-theme-muted" />
              <input
                type="text"
                placeholder={`Buscar ${activeTab === 'cuentas' ? 'cuentas' : 'facturas'}...`}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-12 pr-4 py-3 bg-theme-secondary border border-theme rounded-xl text-theme-primary placeholder-theme-muted focus:outline-none focus:border-amber-500 transition-colors"
              />
            </div>

            <div className="flex gap-3">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-4 py-3 bg-theme-secondary border border-theme rounded-xl text-theme-primary focus:outline-none focus:border-amber-500 transition-colors"
              >
                <option value="all">Todos los estados</option>
                {activeTab === 'cuentas' && (
                  <>
                    <option value="current">Al Día</option>
                    <option value="pending">Pendiente</option>
                    <option value="overdue">Vencida</option>
                    <option value="collection">En Cobranza</option>
                    <option value="legal">Acción Legal</option>
                  </>
                )}
                {activeTab === 'vencidas' && (
                  <>
                    <option value="overdue">Vencida</option>
                    <option value="in_collection">En Cobranza</option>
                    <option value="legal_action">Acción Legal</option>
                  </>
                )}
              </select>
            </div>
          </div>
        </div>

        {/* Content */}
        {activeTab === 'cuentas' && (
          <CuentasTable 
            data={filteredCuentas} 
            onSelect={setSelectedCuenta}
            permissions={permissions}
          />
        )}
        {activeTab === 'vencidas' && (
          <FacturasVencidasTable 
            data={filteredFacturas} 
            permissions={permissions}
          />
        )}
        {activeTab === 'acuerdos' && (
          <AcuerdosTable 
            data={filteredAcuerdos} 
          />
        )}

        {/* Info del rol */}
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="mt-6 p-4 bg-theme-secondary/40 border border-theme rounded-xl"
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
                    className="inline-flex items-center gap-1.5 text-xs text-theme-secondary px-2 py-1 bg-theme-tertiary/50 rounded-lg"
                  >
                    <div className="w-1 h-1 bg-amber-500 rounded-full" />
                    {action}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </motion.div>

        {/* Modal de Detalle de Cuenta */}
        {selectedCuenta && (
          <CuentaModal 
            cuenta={selectedCuenta} 
            onClose={() => setSelectedCuenta(null)} 
          />
        )}
      </main>
    </AppLayout>
  );
}

// Sub-componentes

interface Permissions {
  hasAccess: boolean;
  canViewAll: boolean;
  canManageCollection: boolean;
  canRegisterPayments: boolean;
  canSendReminders: boolean;
  canApproveAgreements: boolean;
  canGenerateReports: boolean;
  canReconcile: boolean;
}

function CuentasTable({ 
  data, 
  onSelect,
  permissions 
}: { 
  data: CuentaPorCobrar[], 
  onSelect: (c: CuentaPorCobrar) => void,
  permissions: Permissions
}) {
  return (
    <div className="bg-theme-secondary/60 border border-theme rounded-2xl overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-theme bg-theme-secondary/80">
              <th className="text-left py-4 px-6 text-xs font-semibold text-theme-secondary uppercase tracking-wider">Cliente</th>
              <th className="text-left py-4 px-6 text-xs font-semibold text-theme-secondary uppercase tracking-wider hidden lg:table-cell">Expediente</th>
              <th className="text-right py-4 px-6 text-xs font-semibold text-theme-secondary uppercase tracking-wider">Total</th>
              <th className="text-left py-4 px-6 text-xs font-semibold text-theme-secondary uppercase tracking-wider">Pendiente</th>
              <th className="text-left py-4 px-6 text-xs font-semibold text-theme-secondary uppercase tracking-wider">Estado</th>
              <th className="text-right py-4 px-6 text-xs font-semibold text-theme-secondary uppercase tracking-wider">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {data.map((cuenta, index) => {
              const paidPercentage = cuenta.totalAmount > 0 ? (cuenta.paidAmount / cuenta.totalAmount) * 100 : 0;
              
              return (
                <motion.tr 
                  key={cuenta.id} 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.03 }}
                  className={`border-b border-theme/50 hover:bg-theme-tertiary/30 transition-all cursor-pointer group border-l-4 ${
                    cuenta.daysOverdue > 90 ? 'border-l-red-500' :
                    cuenta.daysOverdue > 60 ? 'border-l-orange-500' :
                    cuenta.daysOverdue > 30 ? 'border-l-amber-500' :
                    'border-l-emerald-500'
                  }`}
                  onClick={() => onSelect(cuenta)}
                >
                  <td className="py-4 px-6">
                    <div className="flex items-center gap-3">
                      <div className="w-11 h-11 bg-gradient-to-br from-amber-500/20 to-purple-500/20 rounded-xl flex items-center justify-center text-sm font-bold text-amber-400 border border-amber-500/20 shadow-sm">
                        {cuenta.clientName.split(' ').map((n: string) => n[0]).join('').substring(0, 2)}
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-theme-primary">{cuenta.clientName}</p>
                        <div className="flex items-center gap-2 mt-0.5">
                          <span className="text-xs text-theme-muted">{cuenta.id}</span>
                          <span className="text-xs text-theme-muted">•</span>
                          <span className="text-xs text-theme-muted">{cuenta.invoiceCount} facturas</span>
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="py-4 px-6 hidden lg:table-cell">
                    {cuenta.caseTitle ? (
                      <p className="text-sm text-theme-secondary max-w-[200px] truncate">{cuenta.caseTitle}</p>
                    ) : (
                      <span className="text-sm text-theme-muted">Varios</span>
                    )}
                  </td>
                  <td className="py-4 px-6 text-right">
                    <p className="text-sm font-semibold text-theme-primary">€{cuenta.totalAmount.toLocaleString()}</p>
                  </td>
                  <td className="py-4 px-6">
                    <div className="space-y-1.5">
                      <div className="flex items-center justify-between">
                        <p className={`text-sm font-bold ${cuenta.pendingAmount > 0 ? 'text-amber-400' : 'text-emerald-400'}`}>
                          €{cuenta.pendingAmount.toLocaleString()}
                        </p>
                        <span className="text-xs text-theme-muted">{paidPercentage.toFixed(0)}% pagado</span>
                      </div>
                      <div className="w-24 h-1.5 bg-theme-tertiary rounded-full overflow-hidden">
                        <motion.div 
                          initial={{ width: 0 }}
                          animate={{ width: `${paidPercentage}%` }}
                          transition={{ duration: 0.5, delay: index * 0.05 }}
                          className={`h-full rounded-full ${
                            paidPercentage >= 100 ? 'bg-emerald-500' : 'bg-gradient-to-r from-amber-500 to-amber-400'
                          }`}
                        />
                      </div>
                    </div>
                  </td>
                  <td className="py-4 px-6">
                    <div className="flex flex-col gap-1.5">
                      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-semibold rounded-lg border w-fit ${getCuentaStatusColor(cuenta.status)}`}>
                        {getCuentaStatusText(cuenta.status)}
                      </span>
                      {cuenta.daysOverdue > 0 && (
                        <span className={`text-xs font-medium ${
                          cuenta.daysOverdue > 90 ? 'text-red-400' :
                          cuenta.daysOverdue > 60 ? 'text-orange-400' :
                          'text-amber-400'
                        }`}>
                          {cuenta.daysOverdue} días vencido
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="py-4 px-6 text-right">
                    <div className="flex items-center justify-end gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button 
                        onClick={(e) => { e.stopPropagation(); onSelect(cuenta); }}
                        className="p-2 text-theme-secondary hover:text-amber-500 hover:bg-amber-500/10 rounded-lg transition-all hover:scale-110"
                        title="Ver detalles"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      {permissions.canManageCollection && (
                        <button 
                          onClick={(e) => e.stopPropagation()}
                          className="p-2 text-theme-secondary hover:text-blue-500 hover:bg-blue-500/10 rounded-lg transition-all hover:scale-110"
                          title="Llamar"
                        >
                          <Phone className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </td>
                </motion.tr>
              );
            })}
          </tbody>
        </table>
      </div>
      {data.length === 0 && (
        <div className="p-16 text-center">
          <div className="w-16 h-16 mx-auto mb-4 bg-theme-tertiary rounded-2xl flex items-center justify-center">
            <DollarSign className="w-8 h-8 text-theme-muted" />
          </div>
          <p className="text-theme-secondary font-medium">No se encontraron cuentas</p>
          <p className="text-theme-muted text-sm mt-1">Intenta ajustar los filtros de búsqueda</p>
        </div>
      )}
    </div>
  );
}

function FacturasVencidasTable({ 
  data,
  permissions 
}: { 
  data: FacturaVencida[],
  permissions: Permissions
}) {
  return (
    <div className="bg-theme-secondary/60 border border-theme rounded-2xl overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-theme bg-theme-secondary/80">
              <th className="text-left py-4 px-6 text-xs font-semibold text-theme-secondary uppercase tracking-wider">Factura</th>
              <th className="text-left py-4 px-6 text-xs font-semibold text-theme-secondary uppercase tracking-wider">Cliente</th>
              <th className="text-right py-4 px-6 text-xs font-semibold text-theme-secondary uppercase tracking-wider">Importe</th>
              <th className="text-left py-4 px-6 text-xs font-semibold text-theme-secondary uppercase tracking-wider hidden md:table-cell">Vencimiento</th>
              <th className="text-left py-4 px-6 text-xs font-semibold text-theme-secondary uppercase tracking-wider">Días Vencido</th>
              <th className="text-center py-4 px-6 text-xs font-semibold text-theme-secondary uppercase tracking-wider">Recordatorios</th>
              <th className="text-right py-4 px-6 text-xs font-semibold text-theme-secondary uppercase tracking-wider">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {data.map((factura, index) => (
              <motion.tr 
                key={factura.id} 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.03 }}
                className={`border-b border-theme/50 hover:bg-theme-tertiary/30 transition-all group border-l-4 ${
                  factura.daysOverdue > 90 ? 'border-l-purple-500' :
                  factura.daysOverdue > 60 ? 'border-l-red-500' :
                  factura.daysOverdue > 30 ? 'border-l-orange-500' :
                  'border-l-amber-500'
                }`}
              >
                <td className="py-4 px-6">
                  <div>
                    <p className="text-sm font-semibold text-theme-primary">{factura.id}</p>
                    {factura.caseTitle && (
                      <p className="text-xs text-theme-muted hidden lg:block">{factura.caseTitle}</p>
                    )}
                  </div>
                </td>
                <td className="py-4 px-6">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 bg-gradient-to-br from-red-500/20 to-orange-500/20 rounded-lg flex items-center justify-center text-xs font-bold text-orange-400">
                      {factura.clientName.split(' ').map((n: string) => n[0]).join('').substring(0, 2)}
                    </div>
                    <p className="text-sm text-theme-primary">{factura.clientName}</p>
                  </div>
                </td>
                <td className="py-4 px-6 text-right">
                  <p className="text-sm font-bold text-theme-primary">€{factura.amount.toLocaleString()}</p>
                </td>
                <td className="py-4 px-6 hidden md:table-cell">
                  <p className="text-sm text-theme-secondary">{new Date(factura.dueDate).toLocaleDateString('es-ES')}</p>
                </td>
                <td className="py-4 px-6">
                  <div className="flex items-center gap-2">
                    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-bold rounded-lg ${
                      factura.daysOverdue > 90 ? 'bg-purple-500/20 text-purple-400' :
                      factura.daysOverdue > 60 ? 'bg-red-500/20 text-red-400' :
                      factura.daysOverdue > 30 ? 'bg-orange-500/20 text-orange-400' :
                      'bg-amber-500/20 text-amber-400'
                    }`}>
                      {factura.daysOverdue > 90 && <AlertTriangle className="w-3 h-3" />}
                      {factura.daysOverdue} días
                    </span>
                  </div>
                </td>
                <td className="py-4 px-6 text-center">
                  <div className="flex items-center justify-center gap-2">
                    <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg ${
                      factura.remindersSent === 0 ? 'bg-theme-tertiary text-theme-muted' :
                      factura.remindersSent >= 3 ? 'bg-purple-500/20 text-purple-400' :
                      'bg-blue-500/20 text-blue-400'
                    }`}>
                      <Mail className="w-3 h-3" />
                      <span className="text-xs font-medium">{factura.remindersSent}</span>
                    </div>
                  </div>
                </td>
                <td className="py-4 px-6 text-right">
                  <div className="flex items-center justify-end gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                    {permissions.canSendReminders && (
                      <button className="p-2 text-theme-secondary hover:text-blue-500 hover:bg-blue-500/10 rounded-lg transition-all hover:scale-110" title="Enviar recordatorio">
                        <Mail className="w-4 h-4" />
                      </button>
                    )}
                    {permissions.canManageCollection && (
                      <button className="p-2 text-theme-secondary hover:text-emerald-500 hover:bg-emerald-500/10 rounded-lg transition-all hover:scale-110" title="Llamar">
                        <Phone className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </td>
              </motion.tr>
            ))}
          </tbody>
        </table>
      </div>
      {data.length === 0 && (
        <div className="p-16 text-center">
          <div className="w-16 h-16 mx-auto mb-4 bg-theme-tertiary rounded-2xl flex items-center justify-center">
            <AlertTriangle className="w-8 h-8 text-theme-muted" />
          </div>
          <p className="text-theme-secondary font-medium">No hay facturas vencidas</p>
          <p className="text-theme-muted text-sm mt-1">Todas las facturas están al día</p>
        </div>
      )}
    </div>
  );
}

function AcuerdosTable({
  data
}: { 
  data: CuentaPorCobrar[]
}) {
  const acuerdosData = data.filter(c => c.paymentAgreement);
  
  return (
    <div className="bg-theme-secondary/60 border border-theme rounded-2xl overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-theme bg-theme-secondary/80">
              <th className="text-left py-4 px-6 text-xs font-semibold text-theme-secondary uppercase tracking-wider">Cliente</th>
              <th className="text-right py-4 px-6 text-xs font-semibold text-theme-secondary uppercase tracking-wider">Total</th>
              <th className="text-center py-4 px-6 text-xs font-semibold text-theme-secondary uppercase tracking-wider">Cuotas</th>
              <th className="text-left py-4 px-6 text-xs font-semibold text-theme-secondary uppercase tracking-wider">Progreso</th>
              <th className="text-left py-4 px-6 text-xs font-semibold text-theme-secondary uppercase tracking-wider hidden md:table-cell">Próximo Pago</th>
              <th className="text-left py-4 px-6 text-xs font-semibold text-theme-secondary uppercase tracking-wider">Estado</th>
            </tr>
          </thead>
          <tbody>
            {acuerdosData.map((cuenta, index) => {
              if (!cuenta.paymentAgreement) return null;
              const agreement = cuenta.paymentAgreement;
              const progress = (agreement.paymentsMade / agreement.installmentCount) * 100;
              const isDefaulted = agreement.status === 'defaulted';
              
              return (
                <motion.tr
                  key={cuenta.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.03 }}
                  className={`border-b border-theme/50 hover:bg-theme-tertiary/30 transition-all border-l-4 ${
                    isDefaulted ? 'border-l-red-500' : progress >= 100 ? 'border-l-emerald-500' : 'border-l-blue-500'
                  }`}
                >
                  <td className="py-4 px-6">
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-sm font-bold border ${
                        isDefaulted 
                          ? 'bg-red-500/20 text-red-400 border-red-500/20' 
                          : progress >= 100 
                            ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/20'
                            : 'bg-blue-500/20 text-blue-400 border-blue-500/20'
                      }`}>
                        {cuenta.clientName.split(' ').map((n: string) => n[0]).join('').substring(0, 2)}
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-theme-primary">{cuenta.clientName}</p>
                        <p className="text-xs text-theme-muted">{cuenta.id}</p>
                      </div>
                    </div>
                  </td>
                  <td className="py-4 px-6 text-right">
                    <p className="text-sm font-bold text-theme-primary">
                      €{agreement.totalAmount.toLocaleString()}
                    </p>
                    <p className="text-xs text-theme-muted">
                      €{agreement.installmentAmount.toLocaleString()}/{agreement.frequency === 'monthly' ? 'mes' : 'sem'}
                    </p>
                  </td>
                  <td className="py-4 px-6 text-center">
                    <span className={`text-sm font-semibold ${
                      isDefaulted ? 'text-red-400' : progress >= 100 ? 'text-emerald-400' : 'text-blue-400'
                    }`}>
                      {agreement.paymentsMade}
                    </span>
                    <span className="text-theme-muted text-sm"> / {agreement.installmentCount}</span>
                  </td>
                  <td className="py-4 px-6">
                    <div className="space-y-1.5">
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-theme-muted">{progress.toFixed(0)}% completado</span>
                      </div>
                      <div className="w-28 h-2 bg-theme-tertiary rounded-full overflow-hidden">
                        <motion.div 
                          initial={{ width: 0 }}
                          animate={{ width: `${progress}%` }}
                          transition={{ duration: 0.5, delay: index * 0.05 }}
                          className={`h-full rounded-full ${
                            isDefaulted 
                              ? 'bg-gradient-to-r from-red-500 to-red-400' 
                              : progress >= 100 
                                ? 'bg-gradient-to-r from-emerald-500 to-emerald-400'
                                : 'bg-gradient-to-r from-blue-500 to-blue-400'
                          }`}
                        />
                      </div>
                    </div>
                  </td>
                  <td className="py-4 px-6 hidden md:table-cell">
                    {agreement.nextPaymentDate ? (
                      <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4 text-theme-muted" />
                        <p className={`text-sm font-medium ${
                          new Date(agreement.nextPaymentDate) <= new Date() 
                            ? 'text-red-400' 
                            : 'text-theme-primary'
                        }`}>
                          {new Date(agreement.nextPaymentDate).toLocaleDateString('es-ES')}
                        </p>
                      </div>
                    ) : (
                      <span className="text-sm text-theme-muted">-</span>
                    )}
                  </td>
                  <td className="py-4 px-6">
                    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-semibold rounded-lg border ${getAgreementStatusColor(agreement.status)}`}>
                      {agreement.status === 'active' && <Clock className="w-3 h-3" />}
                      {agreement.status === 'completed' && <CheckCircle2 className="w-3 h-3" />}
                      {agreement.status === 'defaulted' && <AlertTriangle className="w-3 h-3" />}
                      {getAgreementStatusText(agreement.status)}
                    </span>
                  </td>
                </motion.tr>
              );
            })}
          </tbody>
        </table>
      </div>
      {acuerdosData.length === 0 && (
        <div className="p-16 text-center">
          <div className="w-16 h-16 mx-auto mb-4 bg-theme-tertiary rounded-2xl flex items-center justify-center">
            <HandCoins className="w-8 h-8 text-theme-muted" />
          </div>
          <p className="text-theme-secondary font-medium">No hay acuerdos de pago activos</p>
          <p className="text-theme-muted text-sm mt-1">Los acuerdos de pago aparecerán aquí</p>
        </div>
      )}
    </div>
  );
}

function CuentaModal({ 
  cuenta, 
  onClose
}: { 
  cuenta: CuentaPorCobrar, 
  onClose: () => void
}) {
  const paidPercentage = cuenta.totalAmount > 0 ? (cuenta.paidAmount / cuenta.totalAmount) * 100 : 0;
  
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
        className="bg-theme-secondary border border-theme rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto shadow-2xl"
      >
        {/* Header mejorado con gradiente */}
        <div className="relative p-6 border-b border-theme overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-amber-500/5 via-purple-500/5 to-transparent" />
          <div className="relative flex items-start justify-between">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 bg-gradient-to-br from-amber-500 to-orange-600 rounded-2xl flex items-center justify-center text-2xl font-bold text-white shadow-lg shadow-amber-500/20">
                {cuenta.clientName.split(' ').map((n: string) => n[0]).join('').substring(0, 2)}
              </div>
              <div>
                <h2 className="text-2xl font-bold text-theme-primary">{cuenta.clientName}</h2>
                <div className="flex items-center gap-3 mt-1">
                  <span className="text-sm text-theme-muted">{cuenta.id}</span>
                  {cuenta.caseTitle && (
                    <>
                      <span className="text-theme-muted">•</span>
                      <span className="text-sm text-theme-secondary">{cuenta.caseTitle}</span>
                    </>
                  )}
                </div>
                <div className="flex items-center gap-2 mt-2">
                  <span className={`inline-flex items-center gap-1.5 px-3 py-1 text-xs font-semibold rounded-lg border ${getCuentaStatusColor(cuenta.status)}`}>
                    {getCuentaStatusText(cuenta.status)}
                  </span>
                  {cuenta.daysOverdue > 0 && (
                    <span className={`inline-flex items-center gap-1 px-2.5 py-1 text-xs font-medium rounded-lg ${
                      cuenta.daysOverdue > 90 ? 'bg-red-500/20 text-red-400' :
                      cuenta.daysOverdue > 60 ? 'bg-orange-500/20 text-orange-400' :
                      'bg-amber-500/20 text-amber-400'
                    }`}>
                      <Clock className="w-3 h-3" />
                      {cuenta.daysOverdue} días vencido
                    </span>
                  )}
                </div>
              </div>
            </div>
            <button onClick={onClose} className="p-2 text-theme-secondary hover:text-theme-primary hover:bg-theme-tertiary rounded-xl transition-colors">
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        <div className="p-6 space-y-6">
          {/* Resumen Financiero mejorado */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-5 bg-gradient-to-br from-theme-tertiary to-theme-secondary/50 rounded-2xl border border-theme">
              <div className="flex items-center gap-2 mb-2">
                <DollarSign className="w-4 h-4 text-theme-muted" />
                <p className="text-xs text-theme-secondary font-medium">Total Facturado</p>
              </div>
              <p className="text-2xl font-bold text-theme-primary">€{cuenta.totalAmount.toLocaleString()}</p>
              <p className="text-xs text-theme-muted mt-1">{cuenta.invoiceCount} facturas</p>
            </div>
            <div className="p-5 bg-gradient-to-br from-emerald-500/10 to-emerald-600/5 rounded-2xl border border-emerald-500/20">
              <div className="flex items-center gap-2 mb-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <p className="text-xs text-emerald-400 font-medium">Total Pagado</p>
              </div>
              <p className="text-2xl font-bold text-emerald-400">€{cuenta.paidAmount.toLocaleString()}</p>
              <p className="text-xs text-emerald-400/70 mt-1">{paidPercentage.toFixed(0)}% del total</p>
            </div>
            <div className="p-5 bg-gradient-to-br from-amber-500/10 to-amber-600/5 rounded-2xl border border-amber-500/20">
              <div className="flex items-center gap-2 mb-2">
                <AlertTriangle className="w-4 h-4 text-amber-400" />
                <p className="text-xs text-amber-400 font-medium">Pendiente</p>
              </div>
              <p className="text-2xl font-bold text-amber-400">€{cuenta.pendingAmount.toLocaleString()}</p>
              <div className="mt-2">
                <div className="h-1.5 bg-theme-tertiary rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-gradient-to-r from-amber-500 to-amber-400 rounded-full"
                    style={{ width: `${100 - paidPercentage}%` }}
                  />
                </div>
              </div>
            </div>
          </div>

          {cuenta.caseTitle && (
            <div className="p-4 bg-theme-tertiary/50 rounded-xl">
              <p className="text-xs text-theme-secondary mb-1">Expediente relacionado</p>
              <p className="text-theme-primary font-medium">{cuenta.caseTitle}</p>
            </div>
          )}

          {/* Información de contacto */}
          <div className="grid grid-cols-2 gap-4">
            <div className="p-4 bg-theme-tertiary/50 rounded-xl">
              <p className="text-xs text-theme-secondary mb-1">Último contacto</p>
              <p className="text-theme-primary">{cuenta.lastContact ? new Date(cuenta.lastContact).toLocaleDateString('es-ES') : 'Sin contacto reciente'}</p>
            </div>
            <div className="p-4 bg-theme-tertiary/50 rounded-xl">
              <p className="text-xs text-theme-secondary mb-1">Próxima acción</p>
              <p className="text-theme-primary">{cuenta.nextAction || 'Sin acción programada'}</p>
            </div>
          </div>

          {/* Acuerdo de pago */}
          {cuenta.paymentAgreement && (
            <div className="p-4 bg-theme-tertiary/30 border border-theme rounded-xl">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-medium text-theme-primary">Acuerdo de Pago</h3>
                <span className={`px-3 py-1 text-xs font-medium rounded-full border ${getAgreementStatusColor(cuenta.paymentAgreement.status)}`}>
                  {getAgreementStatusText(cuenta.paymentAgreement.status)}
                </span>
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <p className="text-xs text-theme-secondary">Total</p>
                  <p className="text-theme-primary font-medium">€{cuenta.paymentAgreement.totalAmount.toLocaleString()}</p>
                </div>
                <div>
                  <p className="text-xs text-theme-secondary">Cuotas</p>
                  <p className="text-theme-primary font-medium">{cuenta.paymentAgreement.paymentsMade} / {cuenta.paymentAgreement.installmentCount}</p>
                </div>
                <div>
                  <p className="text-xs text-theme-secondary">Importe cuota</p>
                  <p className="text-theme-primary font-medium">€{cuenta.paymentAgreement.installmentAmount.toLocaleString()}</p>
                </div>
              </div>
            </div>
          )}

          {/* Historial de Cobranza con Timeline Visual */}
          <div>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-purple-500/10 flex items-center justify-center border border-purple-500/20">
                <Clock className="w-5 h-5 text-purple-400" />
              </div>
              <div>
                <h3 className="text-base font-semibold text-theme-primary">Historial de Cobranza</h3>
                <p className="text-xs text-theme-secondary">{cuenta.collectionHistory.length} acciones registradas</p>
              </div>
            </div>
            
            <div className="relative pl-6 border-l-2 border-theme/50 ml-4 space-y-6">
              {cuenta.collectionHistory.map((record: CollectionRecord, index: number) => (
                <motion.div 
                  key={record.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="relative"
                >
                  {/* Punto del timeline */}
                  <div className={`absolute -left-[31px] top-0 w-6 h-6 rounded-full border-2 flex items-center justify-center ${
                    record.result === 'promised_payment' ? 'bg-emerald-500/20 border-emerald-500' :
                    record.result === 'refused' ? 'bg-red-500/20 border-red-500' :
                    record.result === 'negotiating' ? 'bg-amber-500/20 border-amber-500' :
                    'bg-theme-tertiary border-theme'
                  }`}>
                    {record.type === 'call' ? <Phone className="w-3 h-3 text-blue-400" /> :
                     record.type === 'email' ? <Mail className="w-3 h-3 text-purple-400" /> :
                     record.type === 'letter' ? <FileText className="w-3 h-3 text-amber-400" /> :
                     record.type === 'visit' ? <Building className="w-3 h-3 text-theme-secondary" /> :
                     <AlertCircle className="w-3 h-3 text-theme-muted" />}
                  </div>
                  
                  <div className="p-4 bg-theme-tertiary/30 hover:bg-theme-tertiary/50 rounded-xl border border-theme/50 transition-colors">
                    <div className="flex items-start justify-between">
                      <div className="flex items-start gap-3">
                        <div>
                          <div className="flex items-center gap-2">
                            <p className="text-sm font-semibold text-theme-primary">{getCollectionTypeText(record.type)}</p>
                            <span className={`px-2 py-0.5 text-xs rounded-md ${
                              record.result === 'promised_payment' ? 'bg-emerald-500/20 text-emerald-400' :
                              record.result === 'refused' ? 'bg-red-500/20 text-red-400' :
                              record.result === 'negotiating' ? 'bg-amber-500/20 text-amber-400' :
                              'bg-theme-tertiary text-theme-secondary'
                            }`}>
                              {getCollectionResultText(record.result)}
                            </span>
                          </div>
                          <p className="text-xs text-theme-muted mt-1">{record.madeBy} • {new Date(record.date).toLocaleDateString('es-ES', { day: '2-digit', month: 'short', year: 'numeric' })}</p>
                          <p className="text-sm text-theme-secondary mt-2">{record.notes}</p>
                          {record.promisedDate && (
                            <div className="flex items-center gap-2 mt-2 p-2 bg-amber-500/10 rounded-lg border border-amber-500/20">
                              <Calendar className="w-4 h-4 text-amber-400" />
                              <p className="text-xs text-amber-400 font-medium">
                                Promesa de pago: {new Date(record.promisedDate).toLocaleDateString('es-ES')}
                                {record.promisedAmount && <span className="ml-1">- €{record.promisedAmount.toLocaleString()}</span>}
                              </p>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </div>

        <div className="p-6 border-t border-theme bg-theme-tertiary/20">
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
            <button 
              onClick={onClose} 
              className="px-5 py-3 text-theme-secondary hover:text-theme-primary hover:bg-theme-tertiary transition-all rounded-xl font-medium order-2 sm:order-1"
            >
              Cerrar
            </button>
            <div className="flex gap-3 order-1 sm:order-2">
              <button className="flex-1 sm:flex-none px-5 py-3 bg-blue-500/10 text-blue-400 font-semibold rounded-xl hover:bg-blue-500/20 transition-all flex items-center justify-center gap-2 border border-blue-500/20">
                <Phone className="w-5 h-5" />
                Llamada
              </button>
              <button className="flex-1 sm:flex-none px-5 py-3 bg-gradient-to-r from-amber-500 to-orange-500 text-white font-semibold rounded-xl hover:from-amber-400 hover:to-orange-400 transition-all shadow-lg shadow-amber-500/20 flex items-center justify-center gap-2">
                <Plus className="w-5 h-5" />
                Nuevo Acuerdo
              </button>
            </div>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}

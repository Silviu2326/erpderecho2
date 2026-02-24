import { useState, useMemo, useEffect, useCallback } from 'react';
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
  ChevronRight, X, Loader2
} from 'lucide-react';
import { AppLayout } from '@/components/layout/AppLayout';
import { 
  getCuentaStatusColor,
  getCuentaStatusText,
  getCollectionTypeText,
  getCollectionResultText,
  getAgreementStatusColor,
  getAgreementStatusText,
} from '@/data/cobranzaData';
import { useRole } from '@/hooks/useRole';
import type { UserRole } from '@/types/roles';
import { cobranzaService, type CuentaPorCobrar, type FacturaVencida, type CobranzaStats } from '@/services';

type ActiveTab = 'cuentas' | 'vencidas' | 'acuerdos' | 'estadisticas';

// Tipo extendido para compatibilidad con la UI
interface CuentaUI extends CuentaPorCobrar {
  clientName: string;
  totalAmount: number;
  paidAmount: number;
  pendingAmount: number;
  status: 'current' | 'pending' | 'overdue' | 'collection' | 'legal';
  invoiceCount: number;
  daysOverdue: number;
  caseTitle?: string;
  paymentAgreement?: {
    id: string;
    totalAmount: number;
    installmentCount: number;
    installmentAmount: number;
    frequency: 'weekly' | 'biweekly' | 'monthly';
    status: 'active' | 'completed' | 'defaulted';
    paymentsMade: number;
    nextPaymentDate?: string;
  };
  collectionHistory: any[];
}

// Tipo extendido para facturas vencidas UI
interface FacturaVencidaUI extends FacturaVencida {
  clientName: string;
  amount: number;
  dueDate: string;
  daysOverdue: number;
  remindersSent: number;
  status: string;
  caseTitle?: string;
}

export default function Cobranza() {
  const { role, roleConfig } = useRole();
  
  const [activeTab, setActiveTab] = useState<ActiveTab>('cuentas');
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedCuenta, setSelectedCuenta] = useState<CuentaUI | null>(null);
  
  // Estados para datos del backend
  const [cuentas, setCuentas] = useState<CuentaUI[]>([]);
  const [facturasVencidas, setFacturasVencidas] = useState<FacturaVencidaUI[]>([]);
  const [stats, setStats] = useState<CobranzaStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Cargar datos del backend
  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Cargar estadísticas
      const statsData = await cobranzaService.getCobranzaStats();
      setStats(statsData);
      
      // Cargar cuentas por cobrar
      const cuentasResponse = await cobranzaService.getCuentasPorCobrar({ limit: 1000 });
      const cuentasUI: CuentaUI[] = cuentasResponse.data.map(c => ({
        ...c,
        clientName: c.clienteNombre,
        totalAmount: c.totalPendiente + c.totalPagado,
        paidAmount: c.totalPagado,
        pendingAmount: c.totalPendiente,
        status: c.estado === 'al_dia' ? 'current' : 
                c.estado === 'pendiente' ? 'pending' : 
                c.estado === 'moroso' ? 'overdue' : 
                c.estado === 'incobrable' ? 'legal' : 'current',
        invoiceCount: c.totalFacturas,
        daysOverdue: c.diasPromedioMora,
        caseTitle: undefined,
        paymentAgreement: undefined,
        collectionHistory: [],
      }));
      setCuentas(cuentasUI);
      
      // Cargar facturas vencidas
      const vencidasResponse = await cobranzaService.getFacturasVencidas({ limit: 1000 });
      const facturasUI: FacturaVencidaUI[] = vencidasResponse.data.map(f => ({
        ...f,
        clientName: f.cliente?.nombre || 'Cliente desconocido',
        amount: f.importe,
        dueDate: f.fechaVencimiento || '',
        daysOverdue: f.diasVencida,
        remindersSent: 0, // TODO: Obtener del backend
        status: 'overdue',
        caseTitle: f.expediente?.numeroExpediente,
      }));
      setFacturasVencidas(facturasUI);
      
    } catch (err) {
      console.error('Error cargando datos de cobranza:', err);
      setError('Error al cargar los datos. Por favor, intenta de nuevo.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Determinar permisos según el rol
  const permissions = useMemo(() => {
    return {
      hasAccess: role === 'super_admin' || role === 'socio' || role === 'administrador' || role === 'contador',
      canViewAll: role === 'super_admin' || role === 'socio' || role === 'administrador' || role === 'contador',
      canManageCollection: role === 'super_admin' || role === 'socio' || role === 'administrador',
      canRegisterPayments: role === 'super_admin' || role === 'socio' || role === 'administrador' || role === 'contador',
      canSendReminders: role === 'super_admin' || role === 'socio' || role === 'administrador',
      canApproveAgreements: role === 'super_admin' || role === 'socio',
      canGenerateReports: role === 'super_admin' || role === 'socio' || role === 'administrador' || role === 'contador',
      canReconcile: role === 'super_admin' || role === 'contador',
    };
  }, [role]);

  // Filtrar cuentas
  const filteredCuentas = useMemo(() => {
    if (!permissions.hasAccess) return [];
    
    return cuentas.filter(c => {
      const matchesSearch = 
        c.clientName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.caseTitle?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.id.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesStatus = statusFilter === 'all' || c.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [permissions.hasAccess, searchQuery, statusFilter, cuentas]);

  // Filtrar facturas vencidas
  const filteredFacturas = useMemo(() => {
    if (!permissions.hasAccess) return [];
    
    return facturasVencidas.filter(f => {
      const matchesSearch = 
        f.clientName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        f.caseTitle?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        f.id.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesSearch;
    });
  }, [permissions.hasAccess, searchQuery, facturasVencidas]);

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

  // Mostrar loading
  if (loading) {
    return (
      <AppLayout title="Cobranza" subtitle="Cargando datos...">
        <main className="flex-1 overflow-y-auto p-6 lg:p-8 flex items-center justify-center">
          <div className="text-center">
            <Loader2 className="w-12 h-12 text-accent animate-spin mx-auto mb-4" />
            <p className="text-theme-secondary">Cargando datos de cobranza...</p>
          </div>
        </main>
      </AppLayout>
    );
  }

  // Mostrar error
  if (error) {
    return (
      <AppLayout title="Cobranza" subtitle="Error">
        <main className="flex-1 overflow-y-auto p-6 lg:p-8 flex items-center justify-center">
          <div className="text-center max-w-md">
            <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-theme-primary mb-2">Error al cargar datos</h3>
            <p className="text-theme-secondary mb-4">{error}</p>
            <button 
              onClick={loadData}
              className="px-4 py-2 bg-accent text-white rounded-xl hover:bg-accent-hover transition-colors"
            >
              Reintentar
            </button>
          </div>
        </main>
      </AppLayout>
    );
  }

  const pageInfo = {
    title: role === 'contador' ? 'Pagos y Conciliación' : 'Cobranza',
    subtitle: role === 'contador' ? 'Registro de pagos y estados de cuenta' : 'Gestión de cuentas por cobrar',
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

  const cobranzaStatsForUI = stats ? {
    totalPending: stats.totalPendiente,
    totalOverdue: stats.totalVencido,
    totalCurrent: stats.totalAlDia,
    inCollection: stats.enCobranza,
    totalCurrent: stats.totalAlDia,
    overdue0to30: stats.vencido0a30,
    overdue31to60: stats.vencido31a60,
    overdue61to90: stats.vencido61a90,
    overdueOver90: stats.vencido90mas,
  } : null;

  return (
    <AppLayout 
      title={pageInfo.title}
      subtitle={pageInfo.subtitle}
      headerActions={headerActions}
    >
      <main className="flex-1 overflow-y-auto p-6 lg:p-8">
        {stats && (
          <>
            {/* Stats Cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
              {[
                { label: 'Total Pendiente', value: `€${stats.totalPendiente.toLocaleString()}`, color: 'amber', icon: DollarSign },
                { label: 'Vencido', value: `€${stats.totalVencido.toLocaleString()}`, color: 'red', icon: AlertTriangle },
                { label: 'Al Día', value: `€${stats.totalAlDia.toLocaleString()}`, color: 'emerald', icon: CheckCircle2 },
                { label: 'En Cobranza', value: `€${stats.enCobranza.toLocaleString()}`, color: 'orange', icon: PhoneCall },
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
                  </div>
                  <p className="text-2xl font-bold text-theme-primary">{stat.value}</p>
                  <p className="text-sm text-theme-secondary mt-1">{stat.label}</p>
                </motion.div>
              ))}
            </div>

            {/* Antigüedad de Saldos */}
            <div className="p-5 bg-theme-secondary/60 border border-theme rounded-2xl mb-6">
              <div className="flex items-center gap-3 mb-5">
                <div className="w-10 h-10 rounded-xl bg-amber-500/10 flex items-center justify-center border border-amber-500/20">
                  <Clock className="w-5 h-5 text-amber-400" />
                </div>
                <div>
                  <h3 className="text-base font-semibold text-theme-primary">Antigüedad de Saldos</h3>
                  <p className="text-xs text-theme-secondary">Distribución por días de mora</p>
                </div>
              </div>
              
              <div className="space-y-4">
                {[
                  { label: 'Al corriente', value: stats.totalAlDia, total: stats.totalPendiente, color: 'emerald' },
                  { label: '1-30 días', value: stats.vencido0a30, total: stats.totalPendiente, color: 'amber' },
                  { label: '31-60 días', value: stats.vencido31a60, total: stats.totalPendiente, color: 'orange' },
                  { label: '61-90 días', value: stats.vencido61a90, total: stats.totalPendiente, color: 'red' },
                  { label: '> 90 días', value: stats.vencido90mas, total: stats.totalPendiente, color: 'purple' },
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
                          className={`h-full bg-gradient-to-r from-${item.color}-500 to-${item.color}-400 rounded-full`}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </>
        )}

        {/* Tabs */}
        <div className="flex gap-2 mb-6 border-b border-theme">
          {[
            { id: 'cuentas', label: 'Cuentas por Cobrar', count: filteredCuentas.length },
            { id: 'vencidas', label: 'Facturas Vencidas', count: filteredFacturas.length },
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

        {/* Search */}
        <div className="mb-6">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-theme-muted" />
            <input
              type="text"
              placeholder={`Buscar ${activeTab === 'cuentas' ? 'cuentas' : 'facturas'}...`}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full max-w-md pl-12 pr-4 py-3 bg-theme-secondary border border-theme rounded-xl text-theme-primary placeholder-theme-muted focus:outline-none focus:border-amber-500 transition-colors"
            />
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
      </main>
    </AppLayout>
  );
}

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
  data: CuentaUI[], 
  onSelect: (c: CuentaUI) => void,
  permissions: Permissions
}) {
  return (
    <div className="bg-theme-secondary/60 border border-theme rounded-2xl overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-theme bg-theme-secondary/80">
              <th className="text-left py-4 px-6 text-xs font-semibold text-theme-secondary uppercase tracking-wider">Cliente</th>
              <th className="text-right py-4 px-6 text-xs font-semibold text-theme-secondary uppercase tracking-wider">Total Facturas</th>
              <th className="text-right py-4 px-6 text-xs font-semibold text-theme-secondary uppercase tracking-wider">Pendiente</th>
              <th className="text-left py-4 px-6 text-xs font-semibold text-theme-secondary uppercase tracking-wider">Estado</th>
              <th className="text-right py-4 px-6 text-xs font-semibold text-theme-secondary uppercase tracking-wider">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {data.map((cuenta, index) => (
              <motion.tr 
                key={cuenta.id} 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.03 }}
                className="border-b border-theme/50 hover:bg-theme-tertiary/30 transition-all cursor-pointer group"
                onClick={() => onSelect(cuenta)}
              >
                <td className="py-4 px-6">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-amber-500/20 to-purple-500/20 rounded-xl flex items-center justify-center text-sm font-bold text-amber-400">
                      {cuenta.clientName.substring(0, 2).toUpperCase()}
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-theme-primary">{cuenta.clientName}</p>
                      <p className="text-xs text-theme-muted">{cuenta.clienteEmail}</p>
                    </div>
                  </div>
                </td>
                <td className="py-4 px-6 text-right">
                  <p className="text-sm font-semibold text-theme-primary">{cuenta.invoiceCount}</p>
                </td>
                <td className="py-4 px-6 text-right">
                  <p className="text-sm font-bold text-amber-400">€{cuenta.pendingAmount.toLocaleString()}</p>
                </td>
                <td className="py-4 px-6">
                  <span className={`inline-flex items-center px-2.5 py-1 text-xs font-semibold rounded-full ${
                    cuenta.estado === 'al_dia' ? 'bg-emerald-500/10 text-emerald-400' :
                    cuenta.estado === 'pendiente' ? 'bg-amber-500/10 text-amber-400' :
                    cuenta.estado === 'moroso' ? 'bg-red-500/10 text-red-400' :
                    'bg-purple-500/10 text-purple-400'
                  }`}>
                    {cuenta.estado === 'al_dia' ? 'Al Día' :
                     cuenta.estado === 'pendiente' ? 'Pendiente' :
                     cuenta.estado === 'moroso' ? 'Moroso' : 'Incobrable'}
                  </span>
                </td>
                <td className="py-4 px-6 text-right">
                  <div className="flex items-center justify-end gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button 
                      onClick={(e) => { e.stopPropagation(); onSelect(cuenta); }}
                      className="p-2 text-theme-secondary hover:text-amber-500 hover:bg-amber-500/10 rounded-lg transition-all"
                      title="Ver detalles"
                    >
                      <Eye className="w-4 h-4" />
                    </button>
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
            <DollarSign className="w-8 h-8 text-theme-muted" />
          </div>
          <p className="text-theme-secondary font-medium">No se encontraron cuentas</p>
          <p className="text-theme-muted text-sm mt-1">No hay cuentas por cobrar pendientes</p>
        </div>
      )}
    </div>
  );
}

function FacturasVencidasTable({ 
  data,
  permissions 
}: { 
  data: FacturaVencidaUI[],
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
              <th className="text-left py-4 px-6 text-xs font-semibold text-theme-secondary uppercase tracking-wider">Vencimiento</th>
              <th className="text-left py-4 px-6 text-xs font-semibold text-theme-secondary uppercase tracking-wider">Días Vencida</th>
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
                    <p className="text-sm font-semibold text-theme-primary">{factura.numero}</p>
                    <p className="text-xs text-theme-muted">{factura.concepto}</p>
                  </div>
                </td>
                <td className="py-4 px-6">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 bg-gradient-to-br from-red-500/20 to-orange-500/20 rounded-lg flex items-center justify-center text-xs font-bold text-orange-400">
                      {factura.clientName.substring(0, 2).toUpperCase()}
                    </div>
                    <p className="text-sm text-theme-primary">{factura.clientName}</p>
                  </div>
                </td>
                <td className="py-4 px-6 text-right">
                  <p className="text-sm font-bold text-theme-primary">€{factura.amount.toLocaleString()}</p>
                  {factura.interesesMora > 0 && (
                    <p className="text-xs text-red-400">+ €{factura.interesesMora.toLocaleString()} intereses</p>
                  )}
                </td>
                <td className="py-4 px-6">
                  <p className="text-sm text-theme-secondary">{new Date(factura.dueDate).toLocaleDateString('es-ES')}</p>
                </td>
                <td className="py-4 px-6">
                  <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-bold rounded-lg ${
                    factura.daysOverdue > 90 ? 'bg-purple-500/20 text-purple-400' :
                    factura.daysOverdue > 60 ? 'bg-red-500/20 text-red-400' :
                    factura.daysOverdue > 30 ? 'bg-orange-500/20 text-orange-400' :
                    'bg-amber-500/20 text-amber-400'
                  }`}>
                    {factura.daysOverdue > 90 && <AlertTriangle className="w-3 h-3" />}
                    {factura.daysOverdue} días
                  </span>
                </td>
                <td className="py-4 px-6 text-right">
                  <div className="flex items-center justify-end gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                    {permissions.canSendReminders && (
                      <button className="p-2 text-theme-secondary hover:text-blue-500 hover:bg-blue-500/10 rounded-lg transition-all" title="Enviar recordatorio">
                        <Mail className="w-4 h-4" />
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
            <CheckCircle2 className="w-8 h-8 text-emerald-400" />
          </div>
          <p className="text-theme-secondary font-medium">¡Excelente!</p>
          <p className="text-theme-muted text-sm mt-1">No hay facturas vencidas</p>
        </div>
      )}
    </div>
  );
}

import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Plus, Download, TrendingUp, TrendingDown,
  Calculator, PieChart, BarChart4, FileText, CreditCard, Wallet,
  ArrowUpRight, ArrowDownRight, Lock, Crown, UserCheck, Building2,
  FileCheck, Receipt, Repeat, BadgeEuro, CheckCircle2, Target, X,
  CheckCircle, AlertCircle, Info, Send, Printer
} from 'lucide-react';
import { AppLayout } from '@/components/layout/AppLayout';
import { useRole } from '@/hooks/useRole';
import type { UserRole } from '@/types/roles';

// Tipos
type ModalType = 'export' | 'declare' | 'pay' | 'viewAll' | 'payroll' | null;

interface Movimiento {
  id: string;
  fecha: string;
  tipo: 'ingreso' | 'egreso' | string;
  cuenta: string;
  monto: number;
  referencia: string;
}

interface CuentaPagar {
  id: string;
  proveedor: string;
  monto: number;
  vencimiento: string;
  dias: number;
  estado: string;
}

// Datos de ejemplo para contabilidad
const balanceData = {
  activos: 485000,
  pasivos: 125000,
  patrimonio: 360000,
  ingresosAnuales: 590000,
  gastosAnuales: 215000,
  utilidadNeta: 375000,
  ivaRecaudado: 45200,
  ivaPagado: 18900,
  ivaPorPagar: 26300,
  retencionesISR: 48500,
};

const cuentasPorCobrar = [
  { id: 'CC-001', cliente: 'TechCorp SL', monto: 25000, vencimiento: '2026-03-15', dias: 5, estado: 'vigente' },
  { id: 'CC-002', cliente: 'InnovateLab SA', monto: 18500, vencimiento: '2026-03-01', dias: -11, estado: 'vencida' },
  { id: 'CC-003', cliente: 'María García', monto: 8200, vencimiento: '2026-03-25', dias: 15, estado: 'vigente' },
  { id: 'CC-004', cliente: 'GlobalTech Inc', monto: 32000, vencimiento: '2026-02-28', dias: -12, estado: 'vencida' },
];

const cuentasPorPagar = [
  { id: 'CP-001', proveedor: 'Office Supplies Ltd', monto: 3500, vencimiento: '2026-03-20', dias: 10, estado: 'vigente' },
  { id: 'CP-002', proveedor: 'Legal Software Inc', monto: 12000, vencimiento: '2026-03-10', dias: 0, estado: 'vencehoy' },
  { id: 'CP-003', proveedor: 'Cloud Services SA', monto: 2800, vencimiento: '2026-03-30', dias: 20, estado: 'vigente' },
];

const movimientosRecientes = [
  { id: 'MOV-156', fecha: '2026-03-08', tipo: 'ingreso', cuenta: 'Honorarios profesionales', monto: 8500, referencia: 'FAC-2026-045' },
  { id: 'MOV-155', fecha: '2026-03-07', tipo: 'egreso', cuenta: 'Nómina', monto: 15200, referencia: 'NOM-03-2026' },
  { id: 'MOV-154', fecha: '2026-03-06', tipo: 'ingreso', cuenta: 'Servicios legales', monto: 12000, referencia: 'FAC-2026-044' },
  { id: 'MOV-153', fecha: '2026-03-05', tipo: 'egreso', cuenta: 'Renta oficina', monto: 4500, referencia: 'REP-003' },
  { id: 'MOV-152', fecha: '2026-03-04', tipo: 'egreso', cuenta: 'Servicios profesionales', monto: 2800, referencia: 'FAC-PRV-089' },
];

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('es-ES', {
    style: 'currency',
    currency: 'EUR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
};

export default function Contabilidad() {
  const { role, roleConfig } = useRole();
  const [activeTab, setActiveTab] = useState('overview');
  
  const [showNewEntryModal, setShowNewEntryModal] = useState(false);
  const [activeModal, setActiveModal] = useState<ModalType>(null);
  const [toast, setToast] = useState<{message: string; type: 'success' | 'info' | 'error'} | null>(null);
  
  // Estados para datos mutables
  const [movimientos, setMovimientos] = useState<Movimiento[]>(movimientosRecientes as Movimiento[]);
  const [cuentasPagar, setCuentasPagar] = useState<CuentaPagar[]>(cuentasPorPagar);
  
  // Form states
  const [newEntryForm, setNewEntryForm] = useState({
    tipo: '',
    cuenta: '',
    monto: '',
    fecha: new Date().toISOString().split('T')[0],
    concepto: ''
  });
  
  const [payForm, setPayForm] = useState({
    proveedor: '',
    monto: '',
    metodo: 'transferencia',
    notas: ''
  });

  const showToast = (message: string, type: 'success' | 'info' | 'error' = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  // Determinar permisos según el rol
  const permissions = useMemo(() => {
    const moduleAccess = roleConfig.permissions.modules.contabilidad;

    return {
      hasAccess: moduleAccess !== 'none',
      canViewAll: moduleAccess === 'full' || moduleAccess === 'view',
      canViewOwn: moduleAccess === 'own',

      // Acciones contables
      canCreateEntries: role === 'super_admin' || role === 'contador',
      canEditEntries: role === 'super_admin' || role === 'contador',
      canDeleteEntries: role === 'super_admin',
      canApproveEntries: role === 'super_admin' || role === 'socio',

      // Funciones específicas
      canGenerateTaxReports: role === 'super_admin' || role === 'contador',
      canProcessPayroll: role === 'super_admin' || role === 'contador',
      canReconcileBanks: role === 'super_admin' || role === 'contador',
      canViewFullBalance: role === 'super_admin' || role === 'socio' || role === 'contador',

      // Gestión administrativa
      canManageSuppliers: role === 'super_admin' || role === 'administrador',
      canApprovePayments: role === 'super_admin' || role === 'socio',
      canViewBudgets: roleConfig.permissions.canViewFinancialData,
      canEditBudgets: role === 'super_admin' || role === 'socio',
    };
  }, [role, roleConfig]);

  // Stats según rol
  const stats = useMemo(() => {
    switch (role) {
      case 'super_admin':
      case 'socio':
        return [
          { label: 'Patrimonio Neto', value: formatCurrency(balanceData.patrimonio), change: '+12.5%', trend: 'up', icon: BadgeEuro, color: 'emerald', subtitle: 'Activos - Pasivos' },
          { label: 'Utilidad del Año', value: formatCurrency(balanceData.utilidadNeta), change: '+18.3%', trend: 'up', icon: TrendingUp, color: 'blue', subtitle: 'Ingresos - Gastos' },
          { label: 'Por Cobrar', value: formatCurrency(cuentasPorCobrar.reduce((acc, c) => acc + c.monto, 0)), change: `${cuentasPorCobrar.length} cuentas`, trend: 'up', icon: Wallet, color: 'amber', subtitle: `${cuentasPorCobrar.filter(c => c.estado === 'vencida').length} vencidas` },
          { label: 'Liquidez', value: '85%', change: 'Excelente', trend: 'up', icon: Target, color: 'purple', subtitle: 'Capacidad de pago' },
        ];

      case 'contador':
        return [
          { label: 'IVA por Pagar', value: formatCurrency(balanceData.ivaPorPagar), change: 'Q1 2026', trend: 'up', icon: Receipt, color: 'amber', subtitle: `Recaudado: ${formatCurrency(balanceData.ivaRecaudado)}` },
          { label: 'Retenciones ISR', value: formatCurrency(balanceData.retencionesISR), change: 'Mensual', trend: 'up', icon: FileCheck, color: 'blue', subtitle: 'Pendiente declarar' },
          { label: 'Conciliaciones', value: '12', change: '3 pendientes', trend: 'down', icon: Repeat, color: 'purple', subtitle: 'Cuentas bancarias' },
          { label: 'Pólizas del Mes', value: '148', change: 'Febrero', trend: 'up', icon: FileText, color: 'emerald', subtitle: '45 automáticas' },
        ];

      case 'administrador':
        return [
          { label: 'Presupuesto Mes', value: formatCurrency(18500), change: '72% usado', trend: 'up', icon: Calculator, color: 'blue', subtitle: 'Gastos operativos' },
          { label: 'Por Pagar', value: formatCurrency(cuentasPorPagar.reduce((acc, c) => acc + c.monto, 0)), change: `${cuentasPorPagar.length} proveedores`, trend: 'up', icon: CreditCard, color: 'amber', subtitle: `${cuentasPorPagar.filter(c => c.estado === 'vencehoy').length} vencen hoy` },
          { label: 'Gastos del Mes', value: formatCurrency(15200), change: '+5.2%', trend: 'up', icon: TrendingDown, color: 'red', subtitle: 'vs mes anterior' },
          { label: 'Proveedores Activos', value: '24', change: '3 nuevos', trend: 'up', icon: Building2, color: 'purple', subtitle: 'En el sistema' },
        ];

      default:
        return [];
    }
  }, [role]);

  // Información de página según rol
  const getPageInfo = () => {
    switch (role) {
      case 'super_admin':
        return {
          title: 'Contabilidad General',
          subtitle: 'Control total del sistema contable',
          description: 'Gestión completa de la contabilidad del bufete'
        };
      case 'socio':
        return {
          title: 'Estados Financieros',
          subtitle: 'Visión ejecutiva de finanzas',
          description: 'Supervisión de resultados y rentabilidad'
        };
      case 'contador':
        return {
          title: 'Módulo Contable',
          subtitle: 'Gestión contable y fiscal',
          description: 'Registro, conciliación y reportes fiscales'
        };
      case 'administrador':
        return {
          title: 'Gestión Administrativa',
          subtitle: 'Control de gastos y proveedores',
          description: 'Administración de pagos y presupuestos'
        };
      default:
        return {
          title: 'Contabilidad',
          subtitle: 'Acceso restringido',
          description: ''
        };
    }
  };

  const pageInfo = getPageInfo();

  // Tabs disponibles según rol
  const availableTabs = useMemo(() => {
    const baseTabs = [
      { id: 'overview', label: 'Resumen', icon: BarChart4 },
    ];

    if (role === 'super_admin' || role === 'socio') {
      return [
        ...baseTabs,
        { id: 'balance', label: 'Balance General', icon: PieChart },
        { id: 'income', label: 'Estado Resultados', icon: TrendingUp },
        { id: 'cashflow', label: 'Flujo de Caja', icon: Wallet },
        { id: 'budgets', label: 'Presupuestos', icon: Target },
      ];
    }

    if (role === 'contador') {
      return [
        ...baseTabs,
        { id: 'entries', label: 'Pólizas', icon: FileText },
        { id: 'reconciliation', label: 'Conciliación', icon: Repeat },
        { id: 'tax', label: 'Fiscal', icon: Receipt },
        { id: 'payroll', label: 'Nómina', icon: UserCheck },
      ];
    }

    if (role === 'administrador') {
      return [
        ...baseTabs,
        { id: 'payables', label: 'Cuentas por Pagar', icon: CreditCard },
        { id: 'expenses', label: 'Gastos', icon: TrendingDown },
        { id: 'suppliers', label: 'Proveedores', icon: Building2 },
      ];
    }

    return baseTabs;
  }, [role]);

  // Handlers
  const handleRegisterEntry = () => {
    if (!newEntryForm.tipo || !newEntryForm.cuenta || !newEntryForm.monto) {
      showToast('Por favor completa todos los campos', 'error');
      return;
    }
    
    const newMov: Movimiento = {
      id: `MOV-${Date.now().toString().slice(-3)}`,
      fecha: newEntryForm.fecha,
      tipo: newEntryForm.tipo.toLowerCase().includes('ingreso') ? 'ingreso' : 'egreso',
      cuenta: newEntryForm.cuenta,
      monto: parseFloat(newEntryForm.monto),
      referencia: `REF-${Date.now().toString().slice(-4)}`
    };
    
    setMovimientos([newMov, ...movimientos]);
    setNewEntryForm({ tipo: '', cuenta: '', monto: '', fecha: new Date().toISOString().split('T')[0], concepto: '' });
    setShowNewEntryModal(false);
    showToast('Asiento registrado correctamente');
  };

  const handleExport = () => {
    showToast('Exportando balance general...', 'info');
    setTimeout(() => {
      showToast('Balance exportado correctamente');
      setActiveModal(null);
    }, 1500);
  };

  const handleGenerateDeclaration = () => {
    showToast('Generando declaración fiscal...', 'info');
    setTimeout(() => {
      showToast('Declaración generada y lista para presentar');
      setActiveModal(null);
    }, 2000);
  };

  const handlePay = () => {
    if (!payForm.proveedor || !payForm.monto) {
      showToast('Por favor completa todos los campos', 'error');
      return;
    }
    showToast(`Pago de ${formatCurrency(parseFloat(payForm.monto))} a ${payForm.proveedor} procesado`, 'success');
    setCuentasPagar(cuentasPagar.filter(c => c.proveedor !== payForm.proveedor));
    setPayForm({ proveedor: '', monto: '', metodo: 'transferencia', notas: '' });
    setActiveModal(null);
  };

  // Mensaje de acceso denegado
  const getRoleMessage = () => {
    const messages: Record<UserRole, { title: string; description: string; actions: string[] }> = {
      super_admin: {
        title: 'Control Total de Contabilidad',
        description: 'Acceso completo a todos los módulos contables y financieros.',
        actions: ['Gestión completa del sistema contable', 'Aprobar asientos y pólizas', 'Configurar catálogo de cuentas', 'Ver todos los reportes']
      },
      socio: {
        title: 'Visión Financiera Ejecutiva',
        description: 'Acceso a estados financieros y análisis de rentabilidad.',
        actions: ['Ver estados financieros', 'Aprobar gastos mayores', 'Analizar rentabilidad', 'Revisar presupuestos']
      },
      contador: {
        title: 'Gestión Contable Completa',
        description: 'Control de pólizas, conciliaciones y obligaciones fiscales.',
        actions: ['Registrar asientos contables', 'Conciliar cuentas bancarias', 'Generar reportes fiscales', 'Procesar nómina']
      },
      administrador: {
        title: 'Gestión de Gastos y Proveedores',
        description: 'Control de cuentas por pagar y presupuestos operativos.',
        actions: ['Gestionar proveedores', 'Registrar gastos operativos', 'Solicitar pagos', 'Controlar presupuestos']
      },
      abogado_senior: {
        title: 'Sin Acceso a Contabilidad',
        description: 'Tu rol no tiene acceso al módulo de contabilidad.',
        actions: ['Gestiona tus expedientes', 'Registra tiempo facturable', 'Ve tus informes personales']
      },
      abogado_junior: {
        title: 'Sin Acceso a Contabilidad',
        description: 'Tu rol no tiene acceso al módulo de contabilidad.',
        actions: ['Trabaja en tus casos asignados', 'Registra tu tiempo', 'Sube documentos']
      },
      paralegal: {
        title: 'Sin Acceso a Contabilidad',
        description: 'Tu rol no tiene acceso al módulo de contabilidad.',
        actions: ['Colabora en expedientes', 'Actualiza trámites', 'Gestiona documentos']
      },
      secretario: {
        title: 'Sin Acceso a Contabilidad',
        description: 'Tu rol no tiene acceso al módulo de contabilidad.',
        actions: ['Organiza archivos', 'Gestiona agenda', 'Actualiza información']
      },
      recepcionista: {
        title: 'Sin Acceso a Contabilidad',
        description: 'Tu rol no tiene acceso al módulo de contabilidad.',
        actions: ['Atiende llamadas', 'Gestiona citas', 'Recibe clientes']
      },
    };

    return messages[role] || messages.recepcionista;
  };

  // Si el rol no tiene acceso
  if (!permissions.hasAccess) {
    const message = getRoleMessage();
    return (
      <AppLayout
        title="Contabilidad"
        subtitle="Acceso restringido"
      >
        <main className="flex-1 overflow-y-auto p-6 lg:p-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-2xl mx-auto mt-12"
          >
            <div className="p-8 bg-slate-900/60 border border-slate-800 rounded-2xl text-center">
              <div className="w-20 h-20 mx-auto mb-6 bg-slate-800 rounded-full flex items-center justify-center">
                <Lock className="w-10 h-10 text-slate-600" />
              </div>
              <h2 className="text-2xl font-bold text-white mb-2">{message.title}</h2>
              <p className="text-slate-400 mb-6">{message.description}</p>

              <div className="p-4 bg-slate-800/50 rounded-xl text-left">
                <p className="text-sm font-medium text-slate-300 mb-3">Acciones disponibles para tu rol:</p>
                <ul className="space-y-2">
                  {message.actions.map((action, idx) => (
                    <li key={idx} className="flex items-center gap-2 text-sm text-slate-400">
                      <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full" />
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
      {permissions.canCreateEntries && (
        <button
          onClick={() => setShowNewEntryModal(true)}
          className="hidden sm:flex items-center gap-2 px-4 py-2 bg-emerald-500 text-slate-950 font-medium rounded-xl hover:bg-emerald-400 transition-colors"
        >
          <Plus className="w-4 h-4" />
          <span className="hidden lg:inline">
            {role === 'contador' ? 'Nueva Póliza' : 'Nuevo Asiento'}
          </span>
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
        {/* Tabs */}
        <div className="flex items-center gap-2 mb-6 flex-wrap">
          {availableTabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                activeTab === tab.id
                  ? 'bg-emerald-500 text-slate-950'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800'
              }`}
            >
              <tab.icon className="w-4 h-4" />
              {tab.label}
            </button>
          ))}
        </div>

        {activeTab === 'overview' && (
          <>
            {/* Stats Cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
              {stats.map((stat, index) => (
                <motion.div
                  key={stat.label}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="p-5 bg-slate-900/60 border border-slate-800 rounded-2xl hover:border-emerald-500/30 transition-all group cursor-pointer"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                      stat.color === 'blue' ? 'bg-blue-500/20' :
                      stat.color === 'emerald' ? 'bg-emerald-500/20' :
                      stat.color === 'amber' ? 'bg-amber-500/20' :
                      stat.color === 'purple' ? 'bg-purple-500/20' :
                      'bg-red-500/20'
                    }`}>
                      <stat.icon className={`w-5 h-5 ${
                        stat.color === 'blue' ? 'text-blue-500' :
                        stat.color === 'emerald' ? 'text-emerald-500' :
                        stat.color === 'amber' ? 'text-amber-500' :
                        stat.color === 'purple' ? 'text-purple-500' :
                        'text-red-500'
                      }`} />
                    </div>
                    <div className={`flex items-center gap-0.5 text-xs font-medium ${
                      stat.trend === 'up' ? 'text-emerald-500' : 'text-red-500'
                    }`}>
                      {stat.trend === 'up' ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
                      {stat.change}
                    </div>
                  </div>
                  <h3 className="text-xl font-bold text-white mb-0.5">{stat.value}</h3>
                  <p className="text-slate-400 text-sm">{stat.label}</p>
                  <p className="text-slate-600 text-xs mt-1">{stat.subtitle}</p>
                </motion.div>
              ))}
            </div>

            {/* Main Grid */}
            <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
              {/* Balance Visual - Solo Admin/Socio */}
              {(role === 'super_admin' || role === 'socio') && (
                <div className="xl:col-span-2 bg-slate-900/60 border border-slate-800 rounded-2xl p-6">
                  <div className="flex items-center justify-between mb-6">
                    <div>
                      <h2 className="text-lg font-semibold text-white">Balance General</h2>
                      <p className="text-sm text-slate-400">Estado financiero al 10 de Marzo, 2026</p>
                    </div>
                    <button 
                  onClick={() => setActiveModal('export')}
                  className="text-sm text-emerald-500 hover:text-emerald-400 flex items-center gap-1"
                >
                  <Download className="w-4 h-4" />
                  Exportar
                </button>
                  </div>

                  <div className="grid grid-cols-3 gap-6">
                    <div className="space-y-4">
                      <div className="p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-xl">
                        <p className="text-xs text-emerald-400 font-medium mb-1">ACTIVOS</p>
                        <p className="text-2xl font-bold text-white">{formatCurrency(balanceData.activos)}</p>
                      </div>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between text-slate-300">
                          <span>Efectivo</span>
                          <span>{formatCurrency(185000)}</span>
                        </div>
                        <div className="flex justify-between text-slate-300">
                          <span>Cuentas por cobrar</span>
                          <span>{formatCurrency(120000)}</span>
                        </div>
                        <div className="flex justify-between text-slate-300">
                          <span>Activos fijos</span>
                          <span>{formatCurrency(180000)}</span>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-xl">
                        <p className="text-xs text-red-400 font-medium mb-1">PASIVOS</p>
                        <p className="text-2xl font-bold text-white">{formatCurrency(balanceData.pasivos)}</p>
                      </div>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between text-slate-300">
                          <span>Cuentas por pagar</span>
                          <span>{formatCurrency(45000)}</span>
                        </div>
                        <div className="flex justify-between text-slate-300">
                          <span>Préstamos</span>
                          <span>{formatCurrency(65000)}</span>
                        </div>
                        <div className="flex justify-between text-slate-300">
                          <span>Otros pasivos</span>
                          <span>{formatCurrency(15000)}</span>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <div className="p-4 bg-blue-500/10 border border-blue-500/20 rounded-xl">
                        <p className="text-xs text-blue-400 font-medium mb-1">PATRIMONIO</p>
                        <p className="text-2xl font-bold text-white">{formatCurrency(balanceData.patrimonio)}</p>
                      </div>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between text-slate-300">
                          <span>Capital social</span>
                          <span>{formatCurrency(200000)}</span>
                        </div>
                        <div className="flex justify-between text-slate-300">
                          <span>Reservas</span>
                          <span>{formatCurrency(50000)}</span>
                        </div>
                        <div className="flex justify-between text-emerald-400">
                          <span className="font-medium">Utilidad del ejercicio</span>
                          <span className="font-bold">{formatCurrency(110000)}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="mt-6 pt-6 border-t border-slate-800">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-slate-400">Ecuación contable:</span>
                      <span className="text-sm text-slate-300">
                        Activos ({formatCurrency(balanceData.activos)}) = Pasivos ({formatCurrency(balanceData.pasivos)}) + Patrimonio ({formatCurrency(balanceData.patrimonio)})
                      </span>
                    </div>
                  </div>
                </div>
              )}

              {/* Contador - Obligaciones Fiscales */}
              {role === 'contador' && (
                <div className="xl:col-span-2 bg-slate-900/60 border border-slate-800 rounded-2xl p-6">
                  <div className="flex items-center justify-between mb-6">
                    <div>
                      <h2 className="text-lg font-semibold text-white">Obligaciones Fiscales</h2>
                      <p className="text-sm text-slate-400">Pendientes y próximos vencimientos</p>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div className="p-4 bg-amber-500/10 border border-amber-500/20 rounded-xl">
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <h3 className="text-sm font-medium text-white">IVA - Febrero 2026</h3>
                          <p className="text-xs text-slate-400">Vence: 20 de Marzo, 2026</p>
                        </div>
                        <span className="px-2 py-1 bg-amber-500/20 text-amber-400 text-xs font-medium rounded-full">
                          Urgente
                        </span>
                      </div>
                      <div className="grid grid-cols-3 gap-4 text-sm">
                        <div>
                          <p className="text-slate-500 text-xs">IVA Cobrado</p>
                          <p className="text-white font-bold">{formatCurrency(balanceData.ivaRecaudado)}</p>
                        </div>
                        <div>
                          <p className="text-slate-500 text-xs">IVA Pagado</p>
                          <p className="text-white font-bold">{formatCurrency(balanceData.ivaPagado)}</p>
                        </div>
                        <div>
                          <p className="text-slate-500 text-xs">Por Pagar</p>
                          <p className="text-amber-400 font-bold">{formatCurrency(balanceData.ivaPorPagar)}</p>
                        </div>
                      </div>
                      <button 
                        onClick={() => setActiveModal('declare')}
                        className="mt-3 w-full py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 text-sm font-medium rounded-xl transition-colors"
                      >
                        Generar Declaración
                      </button>
                    </div>

                    <div className="p-4 bg-blue-500/10 border border-blue-500/20 rounded-xl">
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <h3 className="text-sm font-medium text-white">Retenciones ISR - Febrero</h3>
                          <p className="text-xs text-slate-400">Vence: 17 de Marzo, 2026</p>
                        </div>
                        <span className="px-2 py-1 bg-blue-500/20 text-blue-400 text-xs font-medium rounded-full">
                          Pendiente
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <p className="text-sm text-slate-300">Monto a declarar:</p>
                        <p className="text-xl font-bold text-white">{formatCurrency(balanceData.retencionesISR)}</p>
                      </div>
                      <button 
                        onClick={() => setActiveModal('declare')}
                        className="mt-3 w-full py-2 bg-blue-500 hover:bg-blue-400 text-white text-sm font-medium rounded-xl transition-colors"
                      >
                        Preparar Declaración
                      </button>
                    </div>

                    <div className="p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-xl">
                      <div className="flex items-start justify-between">
                        <div>
                          <h3 className="text-sm font-medium text-white">Nómina - Febrero 2026</h3>
                          <p className="text-xs text-slate-400">Procesada: 28 de Febrero, 2026</p>
                        </div>
                        <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Administrador - Cuentas por Pagar */}
              {role === 'administrador' && (
                <div className="xl:col-span-2 bg-slate-900/60 border border-slate-800 rounded-2xl p-6">
                  <div className="flex items-center justify-between mb-6">
                    <div>
                      <h2 className="text-lg font-semibold text-white">Cuentas por Pagar Próximas</h2>
                      <p className="text-sm text-slate-400">Vencimientos de los próximos 30 días</p>
                    </div>
                  </div>

                  <div className="space-y-3">
                    {cuentasPorPagar.map((cuenta) => (
                      <div key={cuenta.id} className={`p-4 rounded-xl border ${
                        cuenta.estado === 'vencehoy' ? 'bg-red-500/10 border-red-500/20' : 'bg-slate-800/50 border-slate-700'
                      }`}>
                        <div className="flex items-start justify-between mb-2">
                          <div>
                            <p className="text-sm font-medium text-white">{cuenta.proveedor}</p>
                            <p className="text-xs text-slate-400">{cuenta.id}</p>
                          </div>
                          {cuenta.estado === 'vencehoy' && (
                            <span className="px-2 py-1 bg-red-500/20 text-red-400 text-xs font-medium rounded-full">
                              Vence Hoy
                            </span>
                          )}
                        </div>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-4 text-xs text-slate-400">
                            <span>Vence: {cuenta.vencimiento}</span>
                            <span>{cuenta.dias > 0 ? `${cuenta.dias} días` : 'Vencida'}</span>
                          </div>
                          <span className="text-lg font-bold text-white">{formatCurrency(cuenta.monto)}</span>
                        </div>
                        <button 
                          onClick={() => { setPayForm({...payForm, proveedor: cuenta.proveedor, monto: cuenta.monto.toString()}); setActiveModal('pay'); }}
                          className="mt-2 w-full py-1.5 bg-slate-700 hover:bg-slate-600 text-slate-300 text-xs rounded-lg transition-colors"
                        >
                          Solicitar Pago
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Side Panel - Movimientos Recientes */}
              <div className="space-y-6">
                <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold text-white">
                      {role === 'contador' ? 'Últimos Asientos' : 'Movimientos Recientes'}
                    </h3>
                    <button 
                      onClick={() => setActiveModal('viewAll')}
                      className="text-sm text-emerald-500 hover:text-emerald-400"
                    >
                      Ver todo
                    </button>
                  </div>
                  <div className="space-y-3">
                    {movimientos.slice(0, 5).map((mov) => (
                      <div key={mov.id} className="flex items-center gap-3">
                        <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                          mov.tipo === 'ingreso' ? 'bg-emerald-500/20' : 'bg-red-500/20'
                        }`}>
                          {mov.tipo === 'ingreso' ? (
                            <ArrowDownRight className="w-5 h-5 text-emerald-500" />
                          ) : (
                            <ArrowUpRight className="w-5 h-5 text-red-500" />
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-white truncate">{mov.cuenta}</p>
                          <p className="text-xs text-slate-500">{mov.fecha} • {mov.referencia}</p>
                        </div>
                        <span className={`text-sm font-bold ${mov.tipo === 'ingreso' ? 'text-emerald-400' : 'text-red-400'}`}>
                          {mov.tipo === 'ingreso' ? '+' : '-'}{formatCurrency(mov.monto)}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Cuentas por Cobrar - Solo Admin/Socio */}
                {(role === 'super_admin' || role === 'socio') && (
                  <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-6">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-lg font-semibold text-white">Cuentas por Cobrar</h3>
                      <span className="text-xs text-slate-500">{cuentasPorCobrar.filter(c => c.estado === 'vencida').length} vencidas</span>
                    </div>
                    <div className="space-y-3">
                      {cuentasPorCobrar.slice(0, 3).map((cuenta) => (
                        <div key={cuenta.id} className={`p-3 rounded-xl ${
                          cuenta.estado === 'vencida' ? 'bg-red-500/10 border border-red-500/20' : 'bg-slate-800/50'
                        }`}>
                          <div className="flex items-start justify-between mb-1">
                            <span className="text-sm font-medium text-white">{cuenta.cliente}</span>
                            <span className={`text-sm font-bold ${cuenta.estado === 'vencida' ? 'text-red-400' : 'text-emerald-400'}`}>
                              {formatCurrency(cuenta.monto)}
                            </span>
                          </div>
                          <div className="flex items-center justify-between text-xs">
                            <span className="text-slate-400">{cuenta.id}</span>
                            <span className={cuenta.estado === 'vencida' ? 'text-red-400' : 'text-slate-500'}>
                              {cuenta.estado === 'vencida' ? `${Math.abs(cuenta.dias)} días vencida` : `${cuenta.dias} días`}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Info del rol */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="mt-6 p-4 bg-slate-900/40 border border-slate-800 rounded-xl"
            >
              <div className="flex items-start gap-3">
                <div className={`p-2 rounded-lg ${roleConfig.bgColor}`}>
                  {role === 'super_admin' || role === 'socio' ? <Crown className="w-5 h-5" /> :
                   role === 'contador' ? <Calculator className="w-5 h-5" /> :
                   <UserCheck className="w-5 h-5" />}
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <h4 className="text-sm font-medium text-white">
                      {getRoleMessage().title}
                    </h4>
                    <span className={`text-xs px-2 py-0.5 rounded-full ${roleConfig.bgColor} ${roleConfig.textColor}`}>
                      {roleConfig.name}
                    </span>
                  </div>
                  <p className="text-xs text-slate-400 mt-1">
                    {getRoleMessage().description}
                  </p>
                </div>
              </div>
            </motion.div>
          </>
        )}

        {/* Otros tabs se pueden implementar aquí */}
        {activeTab !== 'overview' && (
          <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-8 text-center">
            <FileText className="w-12 h-12 text-slate-600 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-white mb-2">Sección en Desarrollo</h3>
            <p className="text-sm text-slate-400">
              La pestaña "{availableTabs.find(t => t.id === activeTab)?.label}" estará disponible próximamente.
            </p>
          </div>
        )}
      </main>

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
            {toast.type === 'success' ? <CheckCircle className="w-5 h-5" /> : 
             toast.type === 'error' ? <AlertCircle className="w-5 h-5" /> : <Info className="w-5 h-5" />}
            {toast.message}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Modal Nueva Póliza */}
      <AnimatePresence>
        {showNewEntryModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => setShowNewEntryModal(false)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-lg p-6"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-white">
                  {role === 'contador' ? 'Nueva Póliza Contable' : 'Nuevo Asiento'}
                </h2>
                <button onClick={() => setShowNewEntryModal(false)} className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg">
                  <X className="w-5 h-5" />
                </button>
              </div>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm text-slate-400 mb-2">Tipo de Movimiento</label>
                  <select 
                    value={newEntryForm.tipo}
                    onChange={(e) => setNewEntryForm({...newEntryForm, tipo: e.target.value})}
                    className="w-full px-4 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-white"
                  >
                    <option value="">Seleccionar...</option>
                    <option value="Ingreso">Ingreso</option>
                    <option value="Egreso">Egreso</option>
                    <option value="Traspaso">Traspaso</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm text-slate-400 mb-2">Cuenta Contable</label>
                  <select 
                    value={newEntryForm.cuenta}
                    onChange={(e) => setNewEntryForm({...newEntryForm, cuenta: e.target.value})}
                    className="w-full px-4 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-white"
                  >
                    <option value="">Seleccionar cuenta...</option>
                    <option value="4000 - Ingresos por honorarios">4000 - Ingresos por honorarios</option>
                    <option value="4100 - Servicios legales">4100 - Servicios legales</option>
                    <option value="5000 - Gastos operativos">5000 - Gastos operativos</option>
                    <option value="5100 - Nómina">5100 - Nómina</option>
                    <option value="5200 - Renta oficina">5200 - Renta oficina</option>
                  </select>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm text-slate-400 mb-2">Importe (€)</label>
                    <input 
                      type="number" 
                      value={newEntryForm.monto}
                      onChange={(e) => setNewEntryForm({...newEntryForm, monto: e.target.value})}
                      placeholder="0.00" 
                      className="w-full px-4 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-white" 
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-slate-400 mb-2">Fecha</label>
                    <input 
                      type="date" 
                      value={newEntryForm.fecha}
                      onChange={(e) => setNewEntryForm({...newEntryForm, fecha: e.target.value})}
                      className="w-full px-4 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-white" 
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm text-slate-400 mb-2">Concepto</label>
                  <textarea
                    value={newEntryForm.concepto}
                    onChange={(e) => setNewEntryForm({...newEntryForm, concepto: e.target.value})}
                    placeholder="Descripción del movimiento..."
                    rows={3}
                    className="w-full px-4 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-white resize-none"
                  />
                </div>
              </div>
              <div className="flex gap-3 mt-6">
                <button onClick={() => setShowNewEntryModal(false)} className="flex-1 px-4 py-2.5 bg-slate-800 text-white rounded-xl hover:bg-slate-700">
                  Cancelar
                </button>
                <button onClick={handleRegisterEntry} className="flex-1 px-4 py-2.5 bg-emerald-500 text-slate-950 font-medium rounded-xl hover:bg-emerald-400">
                  Registrar
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Modal: Exportar Balance */}
      <AnimatePresence>
        {activeModal === 'export' && (
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
                <h2 className="text-xl font-bold text-white">Exportar Balance</h2>
                <button onClick={() => setActiveModal(null)} className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg">
                  <X className="w-5 h-5" />
                </button>
              </div>
              <div className="space-y-3">
                <button onClick={handleExport} className="w-full flex items-center gap-3 p-4 bg-slate-800/50 border border-slate-700 rounded-xl hover:border-emerald-500/30 transition-all">
                  <FileText className="w-6 h-6 text-emerald-500" />
                  <div className="text-left">
                    <p className="text-white font-medium">Exportar como PDF</p>
                    <p className="text-xs text-slate-400">Documento formal del balance</p>
                  </div>
                </button>
                <button onClick={handleExport} className="w-full flex items-center gap-3 p-4 bg-slate-800/50 border border-slate-700 rounded-xl hover:border-emerald-500/30 transition-all">
                  <Calculator className="w-6 h-6 text-blue-500" />
                  <div className="text-left">
                    <p className="text-white font-medium">Exportar a Excel</p>
                    <p className="text-xs text-slate-400">Datos para análisis</p>
                  </div>
                </button>
                <button onClick={handleExport} className="w-full flex items-center gap-3 p-4 bg-slate-800/50 border border-slate-700 rounded-xl hover:border-emerald-500/30 transition-all">
                  <Printer className="w-6 h-6 text-amber-500" />
                  <div className="text-left">
                    <p className="text-white font-medium">Imprimir</p>
                    <p className="text-xs text-slate-400">Enviar a impresora</p>
                  </div>
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Modal: Generar Declaración */}
      <AnimatePresence>
        {activeModal === 'declare' && (
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
              className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-lg p-6"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-white">Generar Declaración Fiscal</h2>
                <button onClick={() => setActiveModal(null)} className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg">
                  <X className="w-5 h-5" />
                </button>
              </div>
              <div className="space-y-4">
                <div className="p-4 bg-amber-500/10 border border-amber-500/20 rounded-xl">
                  <p className="text-sm text-amber-400 font-medium">IVA - Febrero 2026</p>
                  <div className="grid grid-cols-3 gap-4 mt-3 text-sm">
                    <div>
                      <p className="text-slate-500 text-xs">IVA Cobrado</p>
                      <p className="text-white font-bold">{formatCurrency(balanceData.ivaRecaudado)}</p>
                    </div>
                    <div>
                      <p className="text-slate-500 text-xs">IVA Pagado</p>
                      <p className="text-white font-bold">{formatCurrency(balanceData.ivaPagado)}</p>
                    </div>
                    <div>
                      <p className="text-slate-500 text-xs">Por Pagar</p>
                      <p className="text-amber-400 font-bold">{formatCurrency(balanceData.ivaPorPagar)}</p>
                    </div>
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm text-slate-400 mb-2">Tipo de declaración</label>
                  <select className="w-full px-4 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-white">
                    <option>IVA - Mensual</option>
                    <option>IVA - Trimestral</option>
                    <option>Retenciones ISR</option>
                    <option>Modelo 347</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm text-slate-400 mb-2">Período</label>
                  <select className="w-full px-4 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-white">
                    <option>Febrero 2026</option>
                    <option>Enero 2026</option>
                    <option>Diciembre 2025</option>
                  </select>
                </div>
              </div>
              <div className="flex gap-3 mt-6">
                <button onClick={() => setActiveModal(null)} className="flex-1 px-4 py-2.5 bg-slate-800 text-white rounded-xl hover:bg-slate-700">
                  Cancelar
                </button>
                <button onClick={handleGenerateDeclaration} className="flex-1 px-4 py-2.5 bg-amber-500 text-slate-950 font-medium rounded-xl hover:bg-amber-400 flex items-center justify-center gap-2">
                  <FileText className="w-4 h-4" />
                  Generar
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Modal: Solicitar Pago */}
      <AnimatePresence>
        {activeModal === 'pay' && (
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
              className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-lg p-6"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-white">Solicitar Pago a Proveedor</h2>
                <button onClick={() => setActiveModal(null)} className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg">
                  <X className="w-5 h-5" />
                </button>
              </div>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm text-slate-400 mb-2">Proveedor</label>
                  <input 
                    type="text" 
                    value={payForm.proveedor}
                    onChange={(e) => setPayForm({...payForm, proveedor: e.target.value})}
                    className="w-full px-4 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-white"
                  />
                </div>
                <div>
                  <label className="block text-sm text-slate-400 mb-2">Monto a pagar (€)</label>
                  <input 
                    type="number" 
                    value={payForm.monto}
                    onChange={(e) => setPayForm({...payForm, monto: e.target.value})}
                    className="w-full px-4 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-white"
                  />
                </div>
                <div>
                  <label className="block text-sm text-slate-400 mb-2">Método de pago</label>
                  <select 
                    value={payForm.metodo}
                    onChange={(e) => setPayForm({...payForm, metodo: e.target.value})}
                    className="w-full px-4 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-white"
                  >
                    <option value="transferencia">Transferencia bancaria</option>
                    <option value="cheque">Cheque</option>
                    <option value="efectivo">Efectivo</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm text-slate-400 mb-2">Notas</label>
                  <textarea
                    value={payForm.notas}
                    onChange={(e) => setPayForm({...payForm, notas: e.target.value})}
                    placeholder="Notas adicionales..."
                    rows={2}
                    className="w-full px-4 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-white resize-none"
                  />
                </div>
              </div>
              <div className="flex gap-3 mt-6">
                <button onClick={() => setActiveModal(null)} className="flex-1 px-4 py-2.5 bg-slate-800 text-white rounded-xl hover:bg-slate-700">
                  Cancelar
                </button>
                <button onClick={handlePay} className="flex-1 px-4 py-2.5 bg-emerald-500 text-slate-950 font-medium rounded-xl hover:bg-emerald-400 flex items-center justify-center gap-2">
                  <Send className="w-4 h-4" />
                  Procesar Pago
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Modal: Ver Todos los Movimientos */}
      <AnimatePresence>
        {activeModal === 'viewAll' && (
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
              className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-2xl max-h-[80vh] overflow-hidden flex flex-col"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between p-6 border-b border-slate-800">
                <h2 className="text-xl font-bold text-white">Todos los Movimientos</h2>
                <button onClick={() => setActiveModal(null)} className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg">
                  <X className="w-5 h-5" />
                </button>
              </div>
              <div className="flex-1 overflow-y-auto p-6">
                <div className="space-y-3">
                  {movimientos.map((mov) => (
                    <div key={mov.id} className="flex items-center gap-3 p-4 bg-slate-800/50 rounded-xl">
                      <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                        mov.tipo === 'ingreso' ? 'bg-emerald-500/20' : 'bg-red-500/20'
                      }`}>
                        {mov.tipo === 'ingreso' ? (
                          <ArrowDownRight className="w-5 h-5 text-emerald-500" />
                        ) : (
                          <ArrowUpRight className="w-5 h-5 text-red-500" />
                        )}
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-medium text-white">{mov.cuenta}</p>
                        <p className="text-xs text-slate-500">{mov.fecha} • {mov.referencia}</p>
                      </div>
                      <span className={`text-sm font-bold ${mov.tipo === 'ingreso' ? 'text-emerald-400' : 'text-red-400'}`}>
                        {mov.tipo === 'ingreso' ? '+' : '-'}{formatCurrency(mov.monto)}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </AppLayout>
  );
}

import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Plus, Download, Eye, Edit3, Mail, X, ChevronLeft, ChevronRight, ChevronDown,
  Receipt, Wallet, PieChart, BarChart4, ArrowUpRight, Search,
  BadgeEuro, Clock, AlertCircle, CheckCircle2, Zap, Target, Lock,
  Calculator, FileCheck, FileSpreadsheet, Printer, Send,
  Crown, UserCheck, Percent, RotateCcw, Ban, CheckCircle,
  FileText, Info, FileSignature, TrendingUp, TrendingDown, Building2, User, Banknote, CreditCard
} from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart as RechartsPieChart, Pie, Cell, BarChart, Bar } from 'recharts';
import { AppLayout } from '@/components/layout/AppLayout';
import { SignatureModal, useSignature } from '@/components/signature';
import { facturasData as initialFacturasData, monthlyData, byTypeData, byClientType, upcomingAlerts as initialAlerts, recentPayments as initialPayments, formatCurrency, getStatusColor, getStatusText } from '@/data/facturacionData';
import { useRole } from '@/hooks/useRole';
import { useTheme } from '@/context/ThemeContext';
import type { UserRole } from '@/types/roles';

// Tipos
interface Factura {
  id: string;
  client: string;
  type: string;
  concept: string;
  amount: number;
  status: 'paid' | 'pending' | 'overdue' | 'cancelled' | 'stamped' | string;
  date: string;
  dueDate: string;
  method?: string;
  expedition?: string;
}

interface Alert {
  id: number;
  client: string;
  invoice: string;
  amount: number;
  daysLeft: number;
  type: string;
  reminded?: boolean;
}

type ModalType = 'view' | 'edit' | 'payment' | 'reminder' | 'cancel' | 'stamp' | 'report' | 'accountState' | 'creditNote' | 'request-signature' | null;

// Datos específicos por rol para contadores
const accountingData = {
  pendingReview: 12,
  pendingStamp: 5,
  monthlyRevenue: 45200,
  monthlyExpenses: 18500,
  vatPayable: 8900,
  annualTotal: 590200,
};

export default function Facturacion() {
  const { role, roleConfig } = useRole();
  const { resolvedTheme } = useTheme();
  const signature = useSignature(role, 'usuario@bufete.com');
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');
  const [activeTab, setActiveTab] = useState('overview');
  const [showNewInvoiceModal, setShowNewInvoiceModal] = useState(false);
  const [activeModal, setActiveModal] = useState<ModalType>(null);
  const [selectedInvoice, setSelectedInvoice] = useState<Factura | null>(null);
  const [toast, setToast] = useState<{message: string; type: 'success' | 'info' | 'error'} | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  
  // Estado para firma electrónica
  const [signatureModalOpen, setSignatureModalOpen] = useState(false);
  
  // Datos mutables
  const [facturasData, setFacturasData] = useState<Factura[]>(initialFacturasData as Factura[]);
  const [recentPayments, setRecentPayments] = useState(initialPayments);
  const [upcomingAlerts, setUpcomingAlerts] = useState<Alert[]>(initialAlerts as Alert[]);
  const [pendingStamps, setPendingStamps] = useState(5);
  const [newInvoiceStep, setNewInvoiceStep] = useState(1);
  
  // Form states para nueva factura
  const [newInvoiceForm, setNewInvoiceForm] = useState({
    client: '',
    concept: '',
    amount: '',
    dueDate: '',
    type: 'Empresa'
  });
  
  // Form states para pago
  const [paymentForm, setPaymentForm] = useState({
    amount: '',
    method: 'transfer',
    date: new Date().toISOString().split('T')[0]
  });

  const showToast = (message: string, type: 'success' | 'info' | 'error' = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  const itemsPerPage = 5;

  // Determinar permisos según el rol
  const permissions = useMemo(() => {
    const moduleAccess = roleConfig.permissions.modules.facturacion;
    
    return {
      // Acceso a facturación
      hasAccess: moduleAccess !== 'none',
      canViewAll: moduleAccess === 'full' || moduleAccess === 'view',
      canViewOwn: moduleAccess === 'own',
      
      // Acciones sobre facturas
      canCreate: role === 'super_admin' || role === 'socio' || role === 'administrador',
      canEdit: role === 'super_admin' || role === 'socio' || role === 'administrador',
      canDelete: role === 'super_admin' || role === 'socio',
      canCancel: role === 'super_admin' || role === 'socio',
      canAuthorizeDiscounts: role === 'super_admin' || role === 'socio',
      
      // Gestión de cobranza
      canManageCollection: role === 'super_admin' || role === 'socio' || role === 'administrador',
      canRegisterPayments: role === 'super_admin' || role === 'socio' || role === 'administrador',
      canSendReminders: role === 'super_admin' || role === 'socio' || role === 'administrador',
      
      // Funciones contables
      canReviewAccounting: role === 'super_admin' || role === 'socio' || role === 'contador',
      canStampInvoices: role === 'super_admin' || role === 'contador',
      canGenerateTaxReports: role === 'super_admin' || role === 'contador',
      canValidateFiscal: role === 'super_admin' || role === 'contador',
      
      // Visualización de datos
      canViewFinancialDetails: roleConfig.permissions.canViewFinancialData,
      canViewAllClients: roleConfig.permissions.canViewAllClients,
      canEditFinancialData: roleConfig.permissions.canEditFinancialData,
    };
  }, [role, roleConfig]);

  // Filtrar datos según rol (simulación - en producción vendría del backend)
  const filteredFacturas = useMemo(() => {
    // Todos los roles con acceso ven todas las facturas (en producción se filtraría)
    return facturasData.filter(fact => {
      const matchesSearch = fact.client.toLowerCase().includes(searchQuery.toLowerCase()) ||
                           fact.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
                           fact.concept.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesStatus = statusFilter === 'all' || fact.status === statusFilter;
      const matchesType = typeFilter === 'all' || fact.type === typeFilter;
      return matchesSearch && matchesStatus && matchesType;
    });
  }, [facturasData, searchQuery, statusFilter, typeFilter]);

  // Paginación
  const totalPages = Math.ceil(filteredFacturas.length / itemsPerPage);
  const paginatedFacturas = filteredFacturas.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  // Handlers
  const handleCreateInvoice = () => {
    if (!newInvoiceForm.client || !newInvoiceForm.concept || !newInvoiceForm.amount) {
      showToast('Por favor completa todos los campos', 'error');
      return;
    }
    
    const newInvoice: Factura = {
      id: `F-${Date.now().toString().slice(-6)}`,
      client: newInvoiceForm.client === 'other' ? 'Nuevo Cliente' : newInvoiceForm.client,
      type: newInvoiceForm.type,
      concept: newInvoiceForm.concept,
      amount: parseFloat(newInvoiceForm.amount),
      status: role === 'contador' ? 'stamped' : 'pending',
      date: new Date().toISOString().split('T')[0],
      dueDate: newInvoiceForm.dueDate || new Date(Date.now() + 30*24*60*60*1000).toISOString().split('T')[0]
    };
    
    setFacturasData([newInvoice, ...facturasData]);
    setNewInvoiceForm({ client: '', concept: '', amount: '', dueDate: '', type: 'Empresa' });
    setNewInvoiceStep(1);
    setShowNewInvoiceModal(false);
    showToast(role === 'contador' ? 'Factura creada y timbrada correctamente' : 'Factura creada correctamente');
  };

  const handleRegisterPayment = () => {
    if (!selectedInvoice || !paymentForm.amount) {
      showToast('Por favor ingresa el monto', 'error');
      return;
    }
    
    setFacturasData(facturasData.map(f => 
      f.id === selectedInvoice.id ? { ...f, status: 'paid' as const } : f
    ));
    
    setRecentPayments([{
      id: Date.now(),
      client: selectedInvoice.client,
      amount: parseFloat(paymentForm.amount),
      date: paymentForm.date,
      method: paymentForm.method === 'transfer' ? 'Transferencia' : paymentForm.method === 'card' ? 'Tarjeta' : 'Efectivo'
    }, ...recentPayments]);
    
    setActiveModal(null);
    setSelectedInvoice(null);
    setPaymentForm({ amount: '', method: 'transfer', date: new Date().toISOString().split('T')[0] });
    showToast('Pago registrado correctamente');
  };

  const handleSendReminder = (alertId?: number) => {
    if (alertId) {
      setUpcomingAlerts(upcomingAlerts.map(a => a.id === alertId ? { ...a, reminded: true } : a));
    }
    showToast('Recordatorio enviado correctamente');
    setActiveModal(null);
  };

  const handleDownloadInvoice = (invoice: Factura) => {
    showToast(`Descargando factura ${invoice.id}...`, 'info');
    setTimeout(() => {
      showToast('Factura descargada correctamente');
    }, 1000);
  };

  const handleCancelInvoice = () => {
    if (!selectedInvoice) return;
    
    if (confirm(`¿Estás seguro de cancelar la factura ${selectedInvoice.id}?`)) {
      setFacturasData(facturasData.map(f => 
        f.id === selectedInvoice.id ? { ...f, status: 'cancelled' as const } : f
      ));
      setActiveModal(null);
      setSelectedInvoice(null);
      showToast('Factura cancelada correctamente');
    }
  };

  const handleStampInvoices = () => {
    const toStamp = facturasData.filter(f => f.status === 'pending').slice(0, pendingStamps);
    setFacturasData(facturasData.map(f => 
      toStamp.some(ts => ts.id === f.id) ? { ...f, status: 'stamped' as const } : f
    ));
    setPendingStamps(0);
    showToast(`${toStamp.length} facturas timbradas correctamente`);
  };

  const handleExport = () => {
    showToast('Exportando facturas a Excel...', 'info');
    setTimeout(() => {
      showToast('Facturas exportadas correctamente');
    }, 1500);
  };

  const handleQuickAction = (label: string) => {
    switch (label) {
      case 'Generar informe fiscal':
      case 'Generar reporte fiscal':
        showToast('Generando reporte fiscal...', 'info');
        setTimeout(() => showToast('Reporte generado y descargado'), 1500);
        break;
      case 'Enviar recordatorios':
        showToast('Enviando recordatorios a clientes con facturas pendientes...', 'info');
        setTimeout(() => showToast('Recordatorios enviados'), 1500);
        break;
      case 'Autorizar descuento':
        setActiveModal('creditNote');
        break;
      case 'Nota de crédito':
        setActiveModal('creditNote');
        break;
      case 'Ver proyección anual':
        setActiveTab('projections');
        break;
      case 'Generar estado de cuenta':
        setActiveModal('accountState');
        break;
      case 'Registrar pago':
        setActiveModal('payment');
        break;
      case 'Exportar cobranza':
        handleExport();
        break;
      case 'Programar seguimiento':
        showToast('Seguimiento programado para mañana', 'info');
        break;
      case 'Timbrar facturas pendientes':
        handleStampInvoices();
        break;
      case 'Validar IVA':
        showToast('Validando IVA de facturas pendientes...', 'info');
        setTimeout(() => showToast('Validación completada'), 1500);
        break;
      case 'Exportar para contabilidad':
        showToast('Exportando para sistema contable...', 'info');
        setTimeout(() => showToast('Exportación completada'), 1500);
        break;
      case 'Generar declaración':
        setActiveTab('tax');
        break;
      default:
        showToast(`Acción: ${label}`, 'info');
    }
  };

  // Calcular estadísticas según rol
  const stats = useMemo(() => {
    const totalPending = facturasData.filter(f => f.status === 'pending').reduce((acc, f) => acc + f.amount, 0);
    const totalOverdue = facturasData.filter(f => f.status === 'overdue').reduce((acc, f) => acc + f.amount, 0);
    const currentYearTotal = monthlyData.filter(m => m.current > 0).reduce((acc, m) => acc + m.current, 0);
    const previousYearTotal = monthlyData.reduce((acc, m) => acc + m.previous, 0);
    const growthRate = ((currentYearTotal - previousYearTotal) / previousYearTotal * 100).toFixed(1);

    switch (role) {
      case 'super_admin':
      case 'socio':
        return [
          { label: 'Facturado 2026', value: formatCurrency(currentYearTotal), change: `${Number(growthRate) > 0 ? '+' : ''}${growthRate}%`, trend: Number(growthRate) > 0 ? 'up' : 'down', icon: BadgeEuro, color: 'emerald', subtitle: 'vs año anterior' },
          { label: 'Pendiente Cobro', value: formatCurrency(totalPending), change: `${facturasData.filter(f => f.status === 'pending').length} facturas`, trend: 'up', icon: Clock, color: 'amber', subtitle: 'próximos 30 días' },
          { label: 'Vencido', value: formatCurrency(totalOverdue), change: `${facturasData.filter(f => f.status === 'overdue').length} facturas`, trend: 'down', icon: AlertCircle, color: 'red', subtitle: 'requieren acción' },
          { label: 'Previsión Anual', value: formatCurrency(580000), change: '85% del objetivo', trend: 'up', icon: Target, color: 'blue', subtitle: 'objetivo: €680,000' },
        ];
      
      case 'administrador':
        return [
          { label: 'Facturado Mes', value: formatCurrency(45200), change: '+8.5%', trend: 'up', icon: BadgeEuro, color: 'emerald', subtitle: 'vs mes anterior' },
          { label: 'Por Cobrar', value: formatCurrency(totalPending + totalOverdue), change: `${facturasData.filter(f => f.status === 'pending' || f.status === 'overdue').length} facturas`, trend: 'up', icon: Clock, color: 'amber', subtitle: 'gestión de cobranza' },
          { label: 'Cobrado Mes', value: formatCurrency(38500), change: '+12%', trend: 'up', icon: CheckCircle2, color: 'blue', subtitle: 'pagos recibidos' },
          { label: 'Alertas', value: '5', change: '2 vencen hoy', trend: 'down', icon: AlertCircle, color: 'red', subtitle: 'requieren atención' },
        ];
      
      case 'contador':
        return [
          { label: 'Ingresos Anuales', value: formatCurrency(accountingData.annualTotal), change: '+18.5%', trend: 'up', icon: BadgeEuro, color: 'emerald', subtitle: 'ejercicio fiscal' },
          { label: 'IVA a Pagar', value: formatCurrency(accountingData.vatPayable), change: 'Q4', trend: 'up', icon: Calculator, color: 'amber', subtitle: 'trimestre actual' },
          { label: 'Pend. Revisión', value: accountingData.pendingReview.toString(), change: `${accountingData.pendingStamp} por timbrar`, trend: 'down', icon: FileCheck, color: 'blue', subtitle: 'validación fiscal' },
          { label: 'Beneficio Neto', value: formatCurrency(accountingData.annualTotal - 215000), change: '63% margen', trend: 'up', icon: Target, color: 'purple', subtitle: 'vs gastos deducibles' },
        ];
      
      default:
        return [];
    }
  }, [role]);

  // Títulos y mensajes según rol
  const getPageInfo = () => {
    switch (role) {
      case 'super_admin':
        return { 
          title: 'Facturación y Cobranza', 
          subtitle: 'Gestión completa de ingresos',
          description: 'Control total de facturas, cobros y previsiones'
        };
      case 'socio':
        return { 
          title: 'Facturación Ejecutiva', 
          subtitle: 'Visión integral de ingresos',
          description: 'Supervisión financiera y autorización de descuentos'
        };
      case 'administrador':
        return { 
          title: 'Gestión de Cobranza', 
          subtitle: 'Administración de pagos y facturas',
          description: 'Gestión operativa de facturación y cobros'
        };
      case 'contador':
        return { 
          title: 'Facturación Contable', 
          subtitle: 'Validación fiscal y reportes',
          description: 'Revisión, timbrado y reportes fiscales'
        };
      default:
        return { 
          title: 'Facturación', 
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
      { id: 'invoices', label: 'Facturas', icon: Receipt },
    ];
    
    if (role === 'super_admin' || role === 'socio') {
      return [
        ...baseTabs,
        { id: 'payments', label: 'Cobros', icon: Wallet },
        { id: 'analytics', label: 'Análisis', icon: PieChart },
        { id: 'projections', label: 'Proyecciones', icon: Target },
      ];
    }
    
    if (role === 'administrador') {
      return [
        ...baseTabs,
        { id: 'payments', label: 'Cobros', icon: Wallet },
        { id: 'collection', label: 'Cobranza', icon: AlertCircle },
      ];
    }
    
    if (role === 'contador') {
      return [
        ...baseTabs,
        { id: 'accounting', label: 'Contabilidad', icon: Calculator },
        { id: 'tax', label: 'Fiscal', icon: FileCheck },
      ];
    }
    
    return baseTabs;
  }, [role]);

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
        return <Receipt className="w-5 h-5" />;
    }
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

  // Acciones rápidas según rol
  const getQuickActions = () => {
    switch (role) {
      case 'super_admin':
      case 'socio':
        return [
          { label: 'Generar informe fiscal', icon: FileSpreadsheet },
          { label: 'Enviar recordatorios', icon: Send },
          { label: 'Autorizar descuento', icon: Percent },
          { label: 'Nota de crédito', icon: RotateCcw },
          { label: 'Ver proyección anual', icon: Target },
        ];
      case 'administrador':
        return [
          { label: 'Generar estado de cuenta', icon: FileSpreadsheet },
          { label: 'Enviar recordatorios', icon: Send },
          { label: 'Registrar pago', icon: CheckCircle2 },
          { label: 'Exportar cobranza', icon: Download },
          { label: 'Programar seguimiento', icon: Clock },
        ];
      case 'contador':
        return [
          { label: 'Generar reporte fiscal', icon: FileCheck },
          { label: 'Timbrar facturas pendientes', icon: FileSpreadsheet },
          { label: 'Validar IVA', icon: Calculator },
          { label: 'Exportar para contabilidad', icon: Download },
          { label: 'Generar declaración', icon: Printer },
        ];
      default:
        return [];
    }
  };

  // Si el rol no tiene acceso a facturación
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

  const headerActions = (
    <>
      {permissions.canCreate && (
        <button 
          onClick={() => setShowNewInvoiceModal(true)}
          className="hidden sm:flex items-center gap-2 px-4 py-2 bg-amber-500 text-slate-950 font-medium rounded-xl hover:bg-amber-400 transition-colors"
        >
          <Plus className="w-4 h-4" />
          <span className="hidden lg:inline">
            {role === 'contador' ? 'Nueva Factura Fiscal' : 'Nueva Factura'}
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
      <main className="flex-1 overflow-y-auto p-4 lg:p-8">
        {/* Tabs Navigation */}
        <div className="mb-6">
          <div className="flex items-center gap-1 p-1 bg-theme-secondary/50 rounded-xl overflow-x-auto">
            {availableTabs.map((tab) => {
              const isActive = activeTab === tab.id;
              return (
                <motion.button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-all whitespace-nowrap ${
                    isActive
                      ? 'bg-amber-500 text-slate-950 shadow-lg shadow-amber-500/20'
                      : 'text-theme-secondary hover:text-theme-primary hover:bg-theme-tertiary'
                  }`}
                >
                  <tab.icon className={`w-4 h-4 ${isActive ? 'text-slate-950' : ''}`} />
                  <span className="hidden sm:inline">{tab.label}</span>
                  {tab.id === 'payments' && (
                    <span className={`ml-1 px-1.5 py-0.5 text-xs rounded-full ${
                      isActive ? 'bg-slate-950/20 text-slate-950' : 'bg-amber-500/20 text-amber-400'
                    }`}>
                      3
                    </span>
                  )}
                </motion.button>
              );
            })}
          </div>
        </div>

        {activeTab === 'overview' && (
          <>
            {/* Stats Cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
              {stats.map((stat, index) => {
                const Icon = stat.icon;
                const TrendIcon = stat.trend === 'up' ? TrendingUp : TrendingDown;
                const gradientColors = {
                  blue: { bg: 'from-blue-500/20 to-blue-600/5', border: 'border-blue-500/20', icon: 'text-blue-400', accent: 'blue' },
                  emerald: { bg: 'from-emerald-500/20 to-emerald-600/5', border: 'border-emerald-500/20', icon: 'text-emerald-400', accent: 'emerald' },
                  amber: { bg: 'from-amber-500/20 to-amber-600/5', border: 'border-amber-500/20', icon: 'text-amber-400', accent: 'amber' },
                  purple: { bg: 'from-purple-500/20 to-purple-600/5', border: 'border-purple-500/20', icon: 'text-purple-400', accent: 'purple' },
                  red: { bg: 'from-red-500/20 to-red-600/5', border: 'border-red-500/20', icon: 'text-red-400', accent: 'red' },
                };
                const colors = gradientColors[stat.color as keyof typeof gradientColors] || gradientColors.blue;
                
                return (
                  <motion.div
                    key={stat.label}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                    whileHover={{ scale: 1.02, y: -2 }}
                    className={`relative overflow-hidden p-5 bg-gradient-to-br ${colors.bg} border ${colors.border} rounded-2xl cursor-pointer group`}
                  >
                    <div className="absolute top-0 right-0 w-24 h-24 bg-white/5 rounded-full -translate-y-8 translate-x-8 group-hover:scale-150 transition-transform duration-500" />
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

            {/* Main Grid */}
            <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
              {/* Chart */}
              <div className="xl:col-span-2 bg-gradient-to-br from-theme-card to-theme-secondary/30 border border-theme rounded-2xl p-6">
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h2 className="text-lg font-semibold text-theme-primary">
                      {role === 'contador' ? 'Evolución Contable' : 'Evolución de Ingresos'}
                    </h2>
                    <p className="text-sm text-theme-secondary">
                      {role === 'contador' ? 'Comparativa fiscal 2026 vs 2025' : 'Comparativa 2026 vs 2025'}
                    </p>
                  </div>
                  <div className="flex items-center gap-4 text-sm">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 bg-emerald-500 rounded-full" />
                      <span className="text-theme-secondary">2026</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 bg-slate-400 rounded-full" />
                      <span className="text-theme-secondary">2025</span>
                    </div>
                  </div>
                </div>
                
                <div className="h-72">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={monthlyData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                      <defs>
                        <linearGradient id="colorCurrent" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#10B981" stopOpacity={0.3}/>
                          <stop offset="95%" stopColor="#10B981" stopOpacity={0}/>
                        </linearGradient>
                        <linearGradient id="colorPrevious" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#64748B" stopOpacity={0.3}/>
                          <stop offset="95%" stopColor="#64748B" stopOpacity={0}/>
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" vertical={false} />
                      <XAxis 
                        dataKey="month" 
                        axisLine={false} 
                        tickLine={false} 
                        tick={{ fill: '#94a3b8', fontSize: 12 }}
                        dy={10}
                      />
                      <YAxis 
                        axisLine={false} 
                        tickLine={false} 
                        tick={{ fill: '#94a3b8', fontSize: 12 }}
                        tickFormatter={(value) => `€${(value / 1000).toFixed(0)}k`}
                        dx={-10}
                      />
                      <Tooltip 
                        contentStyle={{ 
                          backgroundColor: 'rgba(15, 23, 42, 0.9)', 
                          border: '1px solid rgba(255,255,255,0.1)', 
                          borderRadius: '12px',
                          boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.3)'
                        }}
                        labelStyle={{ color: '#f1f5f9', fontWeight: 600 }}
                        formatter={(value) => [formatCurrency(value as number), '']}
                      />
                      <Area 
                        type="monotone" 
                        dataKey="previous" 
                        stroke="#64748B" 
                        strokeWidth={2}
                        fillOpacity={1} 
                        fill="url(#colorPrevious)" 
                        name="2025"
                        dot={false}
                        activeDot={{ r: 6, fill: '#64748B', stroke: '#0f172a', strokeWidth: 2 }}
                      />
                      <Area 
                        type="monotone" 
                        dataKey="current" 
                        stroke="#10B981" 
                        strokeWidth={2}
                        fillOpacity={1} 
                        fill="url(#colorCurrent)" 
                        name="2026"
                        dot={false}
                        activeDot={{ r: 6, fill: '#10B981', stroke: '#0f172a', strokeWidth: 2 }}
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Side Panel */}
              <div className="space-y-6">
                {/* Alerts - Solo para admin y socio */}
                {role !== 'contador' && (
                  <div className="bg-gradient-to-br from-amber-500/10 to-amber-600/5 border border-amber-500/20 rounded-2xl p-6">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-2">
                        <div className="p-2 bg-amber-500/20 rounded-lg">
                          <Zap className="w-4 h-4 text-amber-400" />
                        </div>
                        <h3 className="text-lg font-semibold text-theme-primary">
                          {role === 'administrador' ? 'Gestión de Cobranza' : 'Alertas de Cobro'}
                        </h3>
                      </div>
                      <span className="px-2 py-1 text-xs font-medium bg-amber-500/20 text-amber-400 rounded-full">
                        {upcomingAlerts.length} pendientes
                      </span>
                    </div>
                    <div className="space-y-4">
                      {upcomingAlerts.map((alert, index) => {
                        const maxDays = 7;
                        const progress = alert.type === 'due' ? 0 : Math.max(0, (alert.daysLeft / maxDays) * 100);
                        const isUrgent = alert.type === 'due' || alert.daysLeft <= 2;
                        
                        return (
                          <motion.div 
                            key={alert.id}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: index * 0.1 }}
                            className={`p-4 rounded-xl border transition-all ${
                              isUrgent 
                                ? 'bg-red-500/10 border-red-500/30 hover:border-red-500/50' 
                                : 'bg-amber-500/10 border-amber-500/30 hover:border-amber-500/50'
                            }`}
                          >
                            <div className="flex items-start justify-between mb-2">
                              <div className="flex items-center gap-2">
                                {isUrgent && (
                                  <span className="relative flex h-2 w-2">
                                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                                    <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span>
                                  </span>
                                )}
                                <span className="text-sm font-semibold text-theme-primary">{alert.client}</span>
                              </div>
                              <span className={`text-sm font-bold ${isUrgent ? 'text-red-400' : 'text-amber-400'}`}>
                                {formatCurrency(alert.amount)}
                              </span>
                            </div>
                            
                            <div className="flex items-center justify-between text-xs mb-2">
                              <span className="text-theme-secondary">{alert.invoice}</span>
                              <span className={`font-medium ${isUrgent ? 'text-red-400' : 'text-amber-400'}`}>
                                {alert.type === 'due' ? '¡Vence hoy!' : `${alert.daysLeft} días restantes`}
                              </span>
                            </div>
                            
                            <div className="h-1.5 bg-theme-tertiary/50 rounded-full overflow-hidden">
                              <motion.div 
                                initial={{ width: 0 }}
                                animate={{ width: `${progress}%` }}
                                transition={{ delay: index * 0.1 + 0.2, duration: 0.5 }}
                                className={`h-full rounded-full ${isUrgent ? 'bg-red-500' : 'bg-amber-500'}`}
                              />
                            </div>
                            
                            {permissions.canSendReminders && (
                              <button 
                                onClick={() => handleSendReminder(alert.id)}
                                disabled={alert.reminded}
                                className={`mt-3 w-full py-2 text-xs font-medium rounded-lg transition-colors flex items-center justify-center gap-2 ${
                                  alert.reminded 
                                    ? 'bg-emerald-500/20 text-emerald-400 cursor-default' 
                                    : isUrgent
                                      ? 'bg-red-500/20 text-red-400 hover:bg-red-500/30'
                                      : 'bg-amber-500/20 text-amber-400 hover:bg-amber-500/30'
                                }`}
                              >
                                {alert.reminded ? (
                                  <><CheckCircle2 className="w-3 h-3" /> Recordatorio enviado</>
                                ) : (
                                  <><Send className="w-3 h-3" /> Enviar recordatorio</>
                                )}
                              </button>
                            )}
                          </motion.div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Contador - Pendientes de Revisión */}
                {role === 'contador' && (
                  <div className="bg-gradient-to-br from-blue-500/10 to-blue-600/5 border border-blue-500/20 rounded-2xl p-6">
                    <div className="flex items-center gap-2 mb-4">
                      <FileCheck className="w-5 h-5 text-blue-500" />
                      <h3 className="text-lg font-semibold text-theme-primary">Pendientes de Revisión</h3>
                    </div>
                    <div className="space-y-3">
                      <div className="p-3 bg-blue-500/10 border border-blue-500/20 rounded-xl">
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-sm font-medium text-theme-primary">Por validar fiscalmente</span>
                          <span className="text-sm font-bold text-blue-400">{accountingData.pendingReview}</span>
                        </div>
                        <p className="text-xs text-theme-secondary">Facturas pendientes de revisión contable</p>
                      </div>
                      <div className="p-3 bg-amber-500/10 border border-amber-500/20 rounded-xl">
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-sm font-medium text-theme-primary">Por timbrar</span>
                          <span className="text-sm font-bold text-amber-400">{accountingData.pendingStamp}</span>
                        </div>
                        <p className="text-xs text-theme-secondary">Facturas pendientes de timbrado fiscal</p>
                      </div>
                    </div>
                    {permissions.canStampInvoices && pendingStamps > 0 && (
                      <button 
                        onClick={handleStampInvoices}
                        className="mt-4 w-full py-2 bg-blue-500 hover:bg-blue-400 text-white text-sm font-medium rounded-xl transition-colors"
                      >
                        Timbrar Pendientes ({pendingStamps})
                      </button>
                    )}
                  </div>
                )}

                {/* Recent Payments */}
                <div className="bg-theme-card/60 border border-theme rounded-2xl p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold text-theme-primary">
                      {role === 'contador' ? 'Pagos Registrados' : 'Pagos Recientes'}
                    </h3>
                    <button 
                      onClick={() => setActiveTab('payments')}
                      className="text-sm text-amber-500 hover:text-amber-400"
                    >
                      Ver todo
                    </button>
                  </div>
                  <div className="space-y-3">
                    {recentPayments.map((payment) => (
                      <div key={payment.id} className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-emerald-500/20 rounded-lg flex items-center justify-center">
                          <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-theme-primary truncate">{payment.client}</p>
                          <p className="text-xs text-theme-tertiary">{payment.date} • {payment.method}</p>
                        </div>
                        <span className="text-sm font-bold text-emerald-400">+{formatCurrency(payment.amount)}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Breakdown Section */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-6">
              {/* By Matter Type */}
              <div className="bg-theme-card/60 border border-theme rounded-2xl p-6">
                <h3 className="text-lg font-semibold text-theme-primary mb-4">
                  {role === 'contador' ? 'Ingresos por Tipo de Asunto' : 'Por Tipo de Asunto'}
                </h3>
                <div className="space-y-4">
                  {byTypeData.map((item) => (
                    <div key={item.type}>
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-sm text-theme-secondary">{item.type}</span>
                        <span className="text-sm text-theme-primary">{formatCurrency(item.amount)}</span>
                      </div>
                      <div className="h-2 bg-theme-tertiary rounded-full overflow-hidden">
                        <div className={`h-full ${item.color} rounded-full`} style={{ width: `${item.percentage}%` }} />
                      </div>
                      <div className="flex items-center justify-between mt-1">
                        <span className="text-xs text-theme-tertiary">{item.count} facturas</span>
                        <span className="text-xs text-theme-secondary">{item.percentage}%</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* By Client Type */}
              <div className="bg-theme-card/60 border border-theme rounded-2xl p-6">
                <h3 className="text-lg font-semibold text-theme-primary mb-4">Por Tipo de Cliente</h3>
                <div className="space-y-6">
                  {byClientType.map((item) => (
                    <div key={item.type} className="relative">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm text-theme-secondary">{item.type}</span>
                        <span className="text-sm font-bold text-theme-primary">{formatCurrency(item.amount)}</span>
                      </div>
                      <div className="h-4 bg-theme-tertiary rounded-full overflow-hidden">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${item.percentage}%` }}
                          transition={{ duration: 0.8 }}
                          className={`h-full rounded-full ${item.type === 'Empresas' ? 'bg-purple-500' : 'bg-blue-500'}`}
                        />
                      </div>
                      <p className="text-xs text-theme-tertiary mt-1">{item.count} clientes • {item.percentage}%</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Quick Actions */}
              <div className="bg-gradient-to-br from-theme-card to-theme-secondary/30 border border-theme rounded-2xl p-6">
                <div className="flex items-center gap-2 mb-4">
                  <div className="p-2 bg-amber-500/20 rounded-lg">
                    <Zap className="w-4 h-4 text-amber-400" />
                  </div>
                  <h3 className="text-lg font-semibold text-theme-primary">Acciones Rápidas</h3>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  {getQuickActions().map((action, index) => (
                    <motion.button
                      key={action.label}
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: index * 0.05 }}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => handleQuickAction(action.label)}
                      className="flex items-center gap-2 p-3 bg-theme-tertiary/50 border border-theme rounded-xl hover:border-amber-500/40 hover:bg-amber-500/10 transition-all group"
                    >
                      <div className="p-1.5 rounded-lg bg-theme-tertiary group-hover:bg-amber-500/20 transition-colors">
                        <action.icon className="w-4 h-4 text-theme-secondary group-hover:text-amber-400 transition-colors" />
                      </div>
                      <span className="text-xs font-medium text-theme-secondary group-hover:text-theme-primary truncate">{action.label}</span>
                    </motion.button>
                  ))}
                </div>
              </div>
            </div>

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
          </>
        )}

        {activeTab === 'invoices' && (
          <div className="bg-gradient-to-br from-theme-card to-theme-secondary/30 border border-theme rounded-2xl overflow-hidden">
            {/* Header con búsqueda y filtros */}
            <div className="p-4 border-b border-theme">
              <div className="flex flex-col lg:flex-row gap-4">
                {/* Search Bar Mejorado */}
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-theme-tertiary" />
                  <input
                    type="text"
                    placeholder="Buscar por cliente, concepto o número..."
                    value={searchQuery}
                    onChange={(e) => { setSearchQuery(e.target.value); setCurrentPage(1); }}
                    className="w-full pl-10 pr-10 py-2.5 bg-theme-tertiary/50 border border-theme rounded-xl text-theme-primary text-sm placeholder-theme-tertiary focus:outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 transition-all"
                  />
                  {searchQuery && (
                    <button 
                      onClick={() => setSearchQuery('')}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-theme-tertiary hover:text-theme-secondary"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  )}
                </div>
                
                <div className="flex gap-2 flex-wrap">
                  {/* Status Filter */}
                  <div className="relative">
                    <select
                      value={statusFilter}
                      onChange={(e) => { setStatusFilter(e.target.value); setCurrentPage(1); }}
                      className="pl-4 pr-10 py-2.5 bg-theme-tertiary/50 border border-theme rounded-xl text-theme-primary text-sm appearance-none cursor-pointer hover:border-amber-500/50 transition-colors"
                    >
                      <option value="all">Todos los estados</option>
                      <option value="paid">Pagadas</option>
                      <option value="pending">Pendientes</option>
                      <option value="overdue">Vencidas</option>
                      {role === 'contador' && <option value="stamped">Timbradas</option>}
                    </select>
                    <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-theme-tertiary pointer-events-none" />
                  </div>
                  
                  {/* Type Filter */}
                  <div className="relative">
                    <select
                      value={typeFilter}
                      onChange={(e) => { setTypeFilter(e.target.value); setCurrentPage(1); }}
                      className="pl-4 pr-10 py-2.5 bg-theme-tertiary/50 border border-theme rounded-xl text-theme-primary text-sm appearance-none cursor-pointer hover:border-amber-500/50 transition-colors"
                    >
                      <option value="all">Todos los tipos</option>
                      <option value="Empresa">Empresas</option>
                      <option value="Particular">Particulares</option>
                    </select>
                    <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-theme-tertiary pointer-events-none" />
                  </div>
                  
                  {/* Clear Filters */}
                  {(statusFilter !== 'all' || typeFilter !== 'all' || searchQuery) && (
                    <button 
                      onClick={() => { setStatusFilter('all'); setTypeFilter('all'); setSearchQuery(''); setCurrentPage(1); }}
                      className="px-3 py-2.5 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-sm hover:bg-red-500/20 transition-colors flex items-center gap-1"
                    >
                      <X className="w-3 h-3" />
                      Limpiar
                    </button>
                  )}
                  
                  <button 
                    onClick={handleExport}
                    className="p-2.5 bg-theme-tertiary/50 border border-theme rounded-xl text-theme-secondary hover:text-amber-500 hover:border-amber-500/50 transition-all"
                  >
                    <Download className="w-4 h-4" />
                  </button>
                </div>
              </div>
              
              {/* Active Filters Display */}
              {(statusFilter !== 'all' || typeFilter !== 'all') && (
                <div className="flex items-center gap-2 mt-3 flex-wrap">
                  <span className="text-xs text-theme-tertiary">Filtros activos:</span>
                  {statusFilter !== 'all' && (
                    <span className="inline-flex items-center gap-1 px-2 py-1 bg-amber-500/10 border border-amber-500/20 rounded-lg text-xs text-amber-400">
                      {getStatusText(statusFilter)}
                      <button onClick={() => setStatusFilter('all')}><X className="w-3 h-3" /></button>
                    </span>
                  )}
                  {typeFilter !== 'all' && (
                    <span className="inline-flex items-center gap-1 px-2 py-1 bg-blue-500/10 border border-blue-500/20 rounded-lg text-xs text-blue-400">
                      {typeFilter}
                      <button onClick={() => setTypeFilter('all')}><X className="w-3 h-3" /></button>
                    </span>
                  )}
                  <span className="text-xs text-theme-tertiary">
                    • {filteredFacturas.length} resultado{filteredFacturas.length !== 1 ? 's' : ''}
                  </span>
                </div>
              )}
            </div>

            {/* Tabla Mejorada */}
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="sticky top-0 z-10 bg-theme-secondary/80 backdrop-blur-sm">
                  <tr className="border-b border-theme">
                    <th className="text-left py-3 px-4 text-xs font-semibold text-theme-secondary uppercase tracking-wider">Factura</th>
                    <th className="text-left py-3 px-4 text-xs font-semibold text-theme-secondary uppercase tracking-wider">Cliente</th>
                    <th className="text-left py-3 px-4 text-xs font-semibold text-theme-secondary uppercase tracking-wider hidden lg:table-cell">Concepto</th>
                    <th className="text-left py-3 px-4 text-xs font-semibold text-theme-secondary uppercase tracking-wider">Importe</th>
                    <th className="text-left py-3 px-4 text-xs font-semibold text-theme-secondary uppercase tracking-wider">Estado</th>
                    {role === 'contador' && (
                      <th className="text-left py-3 px-4 text-xs font-semibold text-theme-secondary uppercase tracking-wider">Fiscal</th>
                    )}
                    <th className="text-right py-3 px-4 text-xs font-semibold text-theme-secondary uppercase tracking-wider">Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {paginatedFacturas.length === 0 ? (
                    <tr>
                      <td colSpan={role === 'contador' ? 7 : 6} className="py-12 text-center">
                        <div className="flex flex-col items-center gap-2">
                          <Receipt className="w-12 h-12 text-theme-tertiary" />
                          <p className="text-theme-secondary">No se encontraron facturas</p>
                          <p className="text-theme-tertiary text-sm">Try adjusting your search or filters</p>
                        </div>
                      </td>
                    </tr>
                  ) : (
                    paginatedFacturas.map((fact, index) => (
                      <motion.tr 
                        key={fact.id} 
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.03 }}
                        className="border-b border-theme/30 hover:bg-theme-tertiary/20 transition-colors group"
                      >
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-2">
                            <div className="p-1.5 bg-amber-500/10 rounded-lg">
                              <Receipt className="w-4 h-4 text-amber-400" />
                            </div>
                            <span className="text-sm font-semibold text-theme-primary font-mono">{fact.id}</span>
                          </div>
                        </td>
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-2">
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${
                              fact.type === 'Empresa' ? 'bg-purple-500/20 text-purple-400' : 'bg-blue-500/20 text-blue-400'
                            }`}>
                              {fact.type === 'Empresa' ? 'E' : 'P'}
                            </div>
                            <div>
                              <span className="text-sm text-theme-primary block">{fact.client}</span>
                              <span className="text-xs text-theme-tertiary">{fact.type}</span>
                            </div>
                          </div>
                        </td>
                        <td className="py-3 px-4 hidden lg:table-cell">
                          <span className="text-sm text-theme-secondary truncate max-w-xs block">{fact.concept}</span>
                        </td>
                        <td className="py-3 px-4">
                          <span className="text-sm font-bold text-theme-primary">{formatCurrency(fact.amount)}</span>
                        </td>
                        <td className="py-3 px-4">
                          <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-semibold rounded-full border ${getStatusColor(fact.status)}`}>
                            {getStatusText(fact.status)}
                          </span>
                        </td>
                        {role === 'contador' && (
                          <td className="py-3 px-4">
                            {fact.status === 'stamped' ? (
                              <span className="inline-flex items-center gap-1 px-2 py-1 text-xs font-medium rounded-full bg-blue-500/10 text-blue-400 border border-blue-500/20">
                                <FileCheck className="w-3 h-3" />
                                Timbrada
                              </span>
                            ) : (
                              <span className="text-xs text-theme-tertiary">-</span>
                            )}
                          </td>
                        )}
                        <td className="py-3 px-4">
                          <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button 
                              onClick={() => { setSelectedInvoice(fact); setActiveModal('view'); }}
                              className="p-2 text-theme-secondary hover:text-theme-primary hover:bg-theme-tertiary rounded-lg transition-colors" 
                              title="Ver detalles"
                            >
                              <Eye className="w-4 h-4" />
                            </button>
                            {permissions.canEdit && fact.status !== 'cancelled' && (
                              <button 
                                onClick={() => { setSelectedInvoice(fact); setActiveModal('edit'); }}
                                className="p-2 text-theme-secondary hover:text-blue-400 hover:bg-blue-500/10 rounded-lg transition-colors" 
                                title="Editar"
                              >
                                <Edit3 className="w-4 h-4" />
                              </button>
                            )}
                            <button 
                              onClick={() => handleDownloadInvoice(fact)}
                              className="p-2 text-theme-secondary hover:text-emerald-400 hover:bg-emerald-500/10 rounded-lg transition-colors" 
                              title="Descargar"
                            >
                              <Download className="w-4 h-4" />
                            </button>
                            {signature.permissions.canRequestSignatures && (
                              <button 
                                onClick={() => { 
                                  setSelectedInvoice(fact); 
                                  setSignatureModalOpen(true);
                                }}
                                className="p-1.5 text-theme-secondary hover:text-purple-400 hover:bg-purple-500/10 rounded-lg" 
                                title="Solicitar firma"
                              >
                                <FileSignature className="w-4 h-4" />
                              </button>
                            )}
                            {permissions.canSendReminders && (fact.status === 'pending' || fact.status === 'overdue') && (
                              <button 
                                onClick={() => { setSelectedInvoice(fact); setActiveModal('reminder'); }}
                                className="p-1.5 text-theme-secondary hover:text-amber-400 hover:bg-amber-500/10 rounded-lg" 
                                title="Enviar recordatorio"
                              >
                                <Mail className="w-4 h-4" />
                              </button>
                            )}
                            {permissions.canCancel && fact.status !== 'cancelled' && fact.status !== 'paid' && (
                              <button 
                                onClick={() => { setSelectedInvoice(fact); setActiveModal('cancel'); }}
                                className="p-1.5 text-theme-secondary hover:text-red-400 hover:bg-red-500/10 rounded-lg" 
                                title="Cancelar"
                              >
                                <Ban className="w-4 h-4" />
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

            <div className="p-4 border-t border-theme flex flex-col sm:flex-row items-center justify-between gap-4">
              <p className="text-sm text-theme-secondary order-2 sm:order-1">
                Mostrando {((currentPage - 1) * itemsPerPage) + 1} - {Math.min(currentPage * itemsPerPage, filteredFacturas.length)} de {filteredFacturas.length}
              </p>
              <div className="flex items-center gap-1 order-1 sm:order-2">
                <button 
                  onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                  className="p-2 text-theme-secondary hover:text-theme-primary hover:bg-theme-tertiary rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                  <button 
                    key={page}
                    onClick={() => setCurrentPage(page)}
                    className={`min-w-[32px] px-2 py-1.5 text-sm font-medium rounded-lg transition-colors ${
                      currentPage === page 
                        ? 'bg-amber-500 text-slate-950' 
                        : 'text-theme-secondary hover:text-theme-primary hover:bg-theme-tertiary'
                    }`}
                  >
                    {page}
                  </button>
                ))}
                <button 
                  onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages}
                  className="p-2 text-theme-secondary hover:text-theme-primary hover:bg-theme-tertiary rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Tab Análisis - Solo Socio y Super Admin */}
        {activeTab === 'analytics' && (role === 'socio' || role === 'super_admin') && (
          <div className="space-y-6">
            {/* Charts Row */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {/* Distribution by Client Type - PieChart */}
              <div className="bg-gradient-to-br from-theme-card to-theme-secondary/30 border border-theme rounded-2xl p-6">
                <div className="flex items-center gap-2 mb-4">
                  <div className="p-2 bg-purple-500/20 rounded-lg">
                    <PieChart className="w-5 h-5 text-purple-400" />
                  </div>
                  <h3 className="text-lg font-semibold text-theme-primary">Distribución por Cliente</h3>
                </div>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <RechartsPieChart>
                      <Pie
                        data={byClientType}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={80}
                        paddingAngle={5}
                        dataKey="amount"
                        nameKey="type"
                      >
                        {byClientType.map((_, index) => (
                          <Cell key={`cell-${index}`} fill={index === 0 ? '#8B5CF6' : '#3B82F6'} />
                        ))}
                      </Pie>
                      <Tooltip 
                        contentStyle={{ 
                          backgroundColor: 'rgba(15, 23, 42, 0.9)', 
                          border: '1px solid rgba(255,255,255,0.1)', 
                          borderRadius: '12px'
                        }}
                        formatter={(value) => [formatCurrency(value as number), '']}
                      />
                    </RechartsPieChart>
                  </ResponsiveContainer>
                </div>
                <div className="space-y-3 mt-4">
                  {byClientType.map((item, index) => (
                    <div key={item.type} className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className={`w-3 h-3 rounded-full ${index === 0 ? 'bg-purple-500' : 'bg-blue-500'}`} />
                        <span className="text-sm text-theme-secondary">{item.type}</span>
                      </div>
                      <span className="text-sm font-bold text-theme-primary">{item.percentage}%</span>
                    </div>
                  ))}
                </div>
              </div>
              
              {/* Monthly Billing - AreaChart */}
              <div className="bg-gradient-to-br from-theme-card to-theme-secondary/30 border border-theme rounded-2xl p-6">
                <div className="flex items-center gap-2 mb-4">
                  <div className="p-2 bg-blue-500/20 rounded-lg">
                    <BarChart4 className="w-5 h-5 text-blue-400" />
                  </div>
                  <h3 className="text-lg font-semibold text-theme-primary">Facturación Mensual</h3>
                </div>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={monthlyData.slice(-6)}>
                      <defs>
                        <linearGradient id="colorBilling" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.3}/>
                          <stop offset="95%" stopColor="#3B82F6" stopOpacity={0}/>
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" vertical={false} />
                      <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 12 }} />
                      <YAxis axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 12 }} tickFormatter={(v) => `${(v/1000).toFixed(0)}k`} />
                      <Tooltip 
                        contentStyle={{ 
                          backgroundColor: 'rgba(15, 23, 42, 0.9)', 
                          border: '1px solid rgba(255,255,255,0.1)', 
                          borderRadius: '12px'
                        }}
                        formatter={(value) => [formatCurrency(value as number), '']}
                      />
                      <Area type="monotone" dataKey="current" stroke="#3B82F6" strokeWidth={2} fill="url(#colorBilling)" />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Invoice Status - Donut */}
              <div className="bg-gradient-to-br from-theme-card to-theme-secondary/30 border border-theme rounded-2xl p-6">
                <div className="flex items-center gap-2 mb-4">
                  <div className="p-2 bg-emerald-500/20 rounded-lg">
                    <Receipt className="w-5 h-5 text-emerald-400" />
                  </div>
                  <h3 className="text-lg font-semibold text-theme-primary">Estado de Facturas</h3>
                </div>
                <div className="h-48">
                  <ResponsiveContainer width="100%" height="100%">
                    <RechartsPieChart>
                      <Pie
                        data={[
                          { name: 'Pagadas', value: facturasData.filter(f => f.status === 'paid').length, color: '#10B981' },
                          { name: 'Pendientes', value: facturasData.filter(f => f.status === 'pending').length, color: '#F59E0B' },
                          { name: 'Vencidas', value: facturasData.filter(f => f.status === 'overdue').length, color: '#EF4444' },
                        ]}
                        cx="50%"
                        cy="50%"
                        innerRadius={50}
                        outerRadius={70}
                        paddingAngle={3}
                        dataKey="value"
                      >
                        {[
                          { name: 'Pagadas', value: facturasData.filter(f => f.status === 'paid').length, color: '#10B981' },
                          { name: 'Pendientes', value: facturasData.filter(f => f.status === 'pending').length, color: '#F59E0B' },
                          { name: 'Vencidas', value: facturasData.filter(f => f.status === 'overdue').length, color: '#EF4444' },
                        ].map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip 
                        contentStyle={{ 
                          backgroundColor: 'rgba(15, 23, 42, 0.9)', 
                          border: '1px solid rgba(255,255,255,0.1)', 
                          borderRadius: '12px'
                        }}
                      />
                    </RechartsPieChart>
                  </ResponsiveContainer>
                </div>
                <div className="space-y-2 mt-2">
                  {[
                    { name: 'Pagadas', value: facturasData.filter(f => f.status === 'paid').length, color: '#10B981' },
                    { name: 'Pendientes', value: facturasData.filter(f => f.status === 'pending').length, color: '#F59E0B' },
                    { name: 'Vencidas', value: facturasData.filter(f => f.status === 'overdue').length, color: '#EF4444' },
                  ].map((item) => (
                    <div key={item.name} className="flex items-center justify-between p-2 rounded-lg" style={{ backgroundColor: `${item.color}10` }}>
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full" style={{ backgroundColor: item.color }} />
                        <span className="text-sm text-theme-secondary">{item.name}</span>
                      </div>
                      <span className="text-sm font-bold" style={{ color: item.color }}>{item.value}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Revenue by Type */}
            <div className="bg-gradient-to-br from-theme-card to-theme-secondary/30 border border-theme rounded-2xl p-6">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-2">
                  <div className="p-2 bg-amber-500/20 rounded-lg">
                    <TrendingUp className="w-5 h-5 text-amber-400" />
                  </div>
                  <h3 className="text-lg font-semibold text-theme-primary">Ingresos por Tipo de Asunto</h3>
                </div>
              </div>
              <div className="h-72">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={byTypeData} layout="vertical">
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" horizontal={false} />
                    <XAxis type="number" axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 12 }} tickFormatter={(v) => `€${(v/1000).toFixed(0)}k`} />
                    <YAxis type="category" dataKey="type" axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 12 }} width={80} />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: 'rgba(15, 23, 42, 0.9)', 
                        border: '1px solid rgba(255,255,255,0.1)', 
                        borderRadius: '12px'
                      }}
                      formatter={(value) => [formatCurrency(value as number), '']}
                    />
                    <Bar dataKey="amount" radius={[0, 4, 4, 0]}>
                      {byTypeData.map((_, index) => (
                        <Cell key={`cell-${index}`} fill={index === 0 ? '#3B82F6' : index === 1 ? '#10B981' : index === 2 ? '#8B5CF6' : '#EF4444'} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
                {byTypeData.map((item, index) => (
                  <div key={item.type} className="p-4 bg-theme-tertiary/30 rounded-xl">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium text-theme-primary">{item.type}</span>
                      <span className="text-sm font-bold text-emerald-400">{formatCurrency(item.amount)}</span>
                    </div>
                    <div className="h-1.5 bg-theme-tertiary rounded-full overflow-hidden">
                      <div 
                        className="h-full rounded-full" 
                        style={{ 
                          width: `${item.percentage}%`,
                          backgroundColor: index === 0 ? '#3B82F6' : index === 1 ? '#10B981' : index === 2 ? '#8B5CF6' : '#EF4444'
                        }} 
                      />
                    </div>
                    <div className="flex items-center justify-between mt-2">
                      <span className="text-xs text-theme-tertiary">{item.count} facturas</span>
                      <span className="text-xs text-theme-secondary">{item.percentage}%</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Tab Proyecciones - Solo Socio y Super Admin */}
        {activeTab === 'projections' && (role === 'socio' || role === 'super_admin') && (
          <div className="space-y-6">
            {/* KPI Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <motion.div 
                whileHover={{ scale: 1.02 }}
                className="bg-gradient-to-br from-emerald-500/10 to-emerald-600/5 border border-emerald-500/20 rounded-2xl p-6"
              >
                <div className="flex items-center gap-2 mb-2">
                  <div className="p-2 bg-emerald-500/20 rounded-lg">
                    <Target className="w-5 h-5 text-emerald-400" />
                  </div>
                  <h3 className="text-lg font-semibold text-theme-primary">Objetivo Anual</h3>
                </div>
                <p className="text-3xl font-bold text-emerald-400 mb-1">€680,000</p>
                <p className="text-sm text-theme-secondary">Meta de facturación 2026</p>
              </motion.div>
              <motion.div 
                whileHover={{ scale: 1.02 }}
                className="bg-gradient-to-br from-blue-500/10 to-blue-600/5 border border-blue-500/20 rounded-2xl p-6"
              >
                <div className="flex items-center gap-2 mb-2">
                  <div className="p-2 bg-blue-500/20 rounded-lg">
                    <BadgeEuro className="w-5 h-5 text-blue-400" />
                  </div>
                  <h3 className="text-lg font-semibold text-theme-primary">Realizado</h3>
                </div>
                <p className="text-3xl font-bold text-blue-400 mb-1">€578,400</p>
                <div className="w-full h-2 bg-theme-tertiary rounded-full mt-2 overflow-hidden">
                  <div className="h-full bg-blue-500 rounded-full" style={{ width: '85%' }} />
                </div>
                <p className="text-xs text-theme-secondary mt-1">85% del objetivo</p>
              </motion.div>
              <motion.div 
                whileHover={{ scale: 1.02 }}
                className="bg-gradient-to-br from-amber-500/10 to-amber-600/5 border border-amber-500/20 rounded-2xl p-6"
              >
                <div className="flex items-center gap-2 mb-2">
                  <div className="p-2 bg-amber-500/20 rounded-lg">
                    <ArrowUpRight className="w-5 h-5 text-amber-400" />
                  </div>
                  <h3 className="text-lg font-semibold text-theme-primary">Proyectado</h3>
                </div>
                <p className="text-3xl font-bold text-amber-400 mb-1">€695,000</p>
                <p className="text-sm text-theme-secondary">+2.2% vs objetivo</p>
              </motion.div>
            </div>

            {/* Projection Chart */}
            <div className="bg-gradient-to-br from-theme-card to-theme-secondary/30 border border-theme rounded-2xl p-6">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-2">
                  <div className="p-2 bg-purple-500/20 rounded-lg">
                    <TrendingUp className="w-5 h-5 text-purple-400" />
                  </div>
                  <h3 className="text-lg font-semibold text-theme-primary">Proyección Mensual</h3>
                </div>
                <div className="flex items-center gap-4 text-sm">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-emerald-500 rounded-full" />
                    <span className="text-theme-secondary">Optimista</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-amber-500 rounded-full" />
                    <span className="text-theme-secondary">Conservador</span>
                  </div>
                </div>
              </div>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={[
                    { month: 'Ene', optimistic: 52000, conservative: 45000, target: 56667 },
                    { month: 'Feb', optimistic: 55500, conservative: 48000, target: 56667 },
                    { month: 'Mar', optimistic: 59000, conservative: 51000, target: 56667 },
                    { month: 'Abr', optimistic: 62500, conservative: 54000, target: 56667 },
                    { month: 'May', optimistic: 66000, conservative: 57000, target: 56667 },
                    { month: 'Jun', optimistic: 69500, conservative: 60000, target: 56667 },
                  ]}>
                    <defs>
                      <linearGradient id="colorOptimistic" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#10B981" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="#10B981" stopOpacity={0}/>
                      </linearGradient>
                      <linearGradient id="colorConservative" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#F59E0B" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="#F59E0B" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" vertical={false} />
                    <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 12 }} />
                    <YAxis axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 12 }} tickFormatter={(v) => `€${(v/1000).toFixed(0)}k`} />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: 'rgba(15, 23, 42, 0.9)', 
                        border: '1px solid rgba(255,255,255,0.1)', 
                        borderRadius: '12px'
                      }}
                      formatter={(value) => [formatCurrency(value as number), '']}
                    />
                    <Area type="monotone" dataKey="target" stroke="#8B5CF6" strokeWidth={2} strokeDasharray="5 5" fill="transparent" name="Objetivo" />
                    <Area type="monotone" dataKey="conservative" stroke="#F59E0B" strokeWidth={2} fill="url(#colorConservative)" name="Conservador" />
                    <Area type="monotone" dataKey="optimistic" stroke="#10B981" strokeWidth={2} fill="url(#colorOptimistic)" name="Optimista" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Growth Factors */}
            <div className="bg-gradient-to-br from-theme-card to-theme-secondary/30 border border-theme rounded-2xl p-6">
              <div className="flex items-center gap-2 mb-4">
                <div className="p-2 bg-blue-500/20 rounded-lg">
                  <TrendingUp className="w-5 h-5 text-blue-400" />
                </div>
                <h3 className="text-lg font-semibold text-theme-primary">Factores de Crecimiento</h3>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <motion.div whileHover={{ scale: 1.02 }} className="p-4 bg-theme-tertiary/30 rounded-xl">
                  <div className="flex items-center gap-2 mb-2">
                    <UserCheck className="w-4 h-4 text-blue-500" />
                    <span className="text-sm font-medium text-theme-primary">Nuevos Clientes</span>
                  </div>
                  <p className="text-2xl font-bold text-blue-400">+12</p>
                  <p className="text-xs text-theme-secondary">previstos este trimestre</p>
                </motion.div>
                <motion.div whileHover={{ scale: 1.02 }} className="p-4 bg-theme-tertiary/30 rounded-xl">
                  <div className="flex items-center gap-2 mb-2">
                    <RotateCcw className="w-4 h-4 text-emerald-500" />
                    <span className="text-sm font-medium text-theme-primary">Renovaciones</span>
                  </div>
                  <p className="text-2xl font-bold text-emerald-400">85%</p>
                  <p className="text-xs text-theme-secondary">tasa de retención</p>
                </motion.div>
                <motion.div whileHover={{ scale: 1.02 }} className="p-4 bg-theme-tertiary/30 rounded-xl">
                  <div className="flex items-center gap-2 mb-2">
                    <Zap className="w-4 h-4 text-amber-500" />
                    <span className="text-sm font-medium text-theme-primary">Servicios Extra</span>
                  </div>
                  <p className="text-2xl font-bold text-amber-400">+18%</p>
                  <p className="text-xs text-theme-secondary">upselling estimado</p>
                </motion.div>
              </div>
            </div>
          </div>
        )}

        {/* Tab Cobros - Admin, Socio, Super Admin */}
        {activeTab === 'payments' && (role === 'administrador' || role === 'socio' || role === 'super_admin') && (
          <div className="space-y-6">
            {(role === 'socio' || role === 'super_admin') && (
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-2xl p-5">
                  <p className="text-sm text-theme-secondary mb-1">Cobrado Mes</p>
                  <p className="text-2xl font-bold text-emerald-400">€38,500</p>
                  <p className="text-xs text-theme-tertiary">+12% vs mes anterior</p>
                </div>
                <div className="bg-amber-500/10 border border-amber-500/20 rounded-2xl p-5">
                  <p className="text-sm text-theme-secondary mb-1">Pendiente</p>
                  <p className="text-2xl font-bold text-amber-400">€52,300</p>
                  <p className="text-xs text-theme-tertiary">15 facturas</p>
                </div>
                <div className="bg-red-500/10 border border-red-500/20 rounded-2xl p-5">
                  <p className="text-sm text-theme-secondary mb-1">Vencido</p>
                  <p className="text-2xl font-bold text-red-400">€12,800</p>
                  <p className="text-xs text-theme-tertiary">4 facturas</p>
                </div>
                <div className="bg-blue-500/10 border border-blue-500/20 rounded-2xl p-5">
                  <p className="text-sm text-theme-secondary mb-1">Promedio Cobro</p>
                  <p className="text-2xl font-bold text-blue-400">28 días</p>
                  <p className="text-xs text-theme-tertiary">tiempo promedio</p>
                </div>
              </div>
            )}

            <div className="bg-theme-card/60 border border-theme rounded-2xl p-6">
              <h2 className="text-lg font-semibold text-theme-primary mb-4">Registro de Pagos</h2>
              <p className="text-theme-secondary mb-6">Gestiona los pagos recibidos y actualiza el estado de las facturas.</p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 bg-theme-tertiary/50 rounded-xl">
                  <h3 className="text-sm font-medium text-theme-primary mb-2">Registrar Nuevo Pago</h3>
                  <p className="text-xs text-theme-secondary mb-3">Selecciona una factura pendiente para registrar su pago</p>
                  <button 
                    onClick={() => setActiveModal('payment')}
                    className="w-full py-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-sm font-medium rounded-xl transition-colors"
                  >
                    Registrar Pago
                  </button>
                </div>
                <div className="p-4 bg-theme-tertiary/50 rounded-xl">
                  <h3 className="text-sm font-medium text-theme-primary mb-2">Generar Estado de Cuenta</h3>
                  <p className="text-xs text-theme-secondary mb-3">Crea un resumen de facturas para un cliente específico</p>
                  <button 
                    onClick={() => setActiveModal('accountState')}
                    className="w-full py-2 bg-blue-500 hover:bg-blue-400 text-white text-sm font-medium rounded-xl transition-colors"
                  >
                    Generar Reporte
                  </button>
                </div>
              </div>
            </div>

            <div className="bg-theme-card/60 border border-theme rounded-2xl p-6">
              <h3 className="text-lg font-semibold text-theme-primary mb-4">Pagos Recientes</h3>
              <div className="space-y-3">
                {recentPayments.slice(0, 5).map((payment) => (
                  <div key={payment.id} className="flex items-center gap-4 p-3 bg-theme-tertiary/30 rounded-xl">
                    <div className="w-10 h-10 bg-emerald-500/20 rounded-lg flex items-center justify-center">
                      <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-theme-primary">{payment.client}</p>
                      <p className="text-xs text-theme-tertiary">{payment.date} • {payment.method}</p>
                    </div>
                    <span className="text-sm font-bold text-emerald-400">+{formatCurrency(payment.amount)}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Tab Cobranza - Solo Admin */}
        {activeTab === 'collection' && role === 'administrador' && (
          <div className="bg-theme-card/60 border border-theme rounded-2xl p-6">
            <h2 className="text-lg font-semibold text-theme-primary mb-4">Gestión de Cobranza</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-xl">
                <h3 className="text-sm font-medium text-red-400 mb-1">Vencidas</h3>
                <p className="text-2xl font-bold text-theme-primary">€45,200</p>
                <p className="text-xs text-theme-secondary">8 facturas requieren acción</p>
              </div>
              <div className="p-4 bg-amber-500/10 border border-amber-500/20 rounded-xl">
                <h3 className="text-sm font-medium text-amber-400 mb-1">Por vencer (7 días)</h3>
                <p className="text-2xl font-bold text-theme-primary">€28,500</p>
                <p className="text-xs text-theme-secondary">5 facturas próximas</p>
              </div>
              <div className="p-4 bg-blue-500/10 border border-blue-500/20 rounded-xl">
                <h3 className="text-sm font-medium text-blue-400 mb-1">Promedio cobro</h3>
                <p className="text-2xl font-bold text-theme-primary">32 días</p>
                <p className="text-xs text-theme-secondary">Tiempo promedio de pago</p>
              </div>
            </div>
          </div>
        )}

        {/* Tab Contabilidad - Solo Contador */}
        {activeTab === 'accounting' && role === 'contador' && (
          <div className="bg-theme-card/60 border border-theme rounded-2xl p-6">
            <h2 className="text-lg font-semibold text-theme-primary mb-4">Contabilización</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 bg-theme-tertiary/50 rounded-xl">
                <h3 className="text-sm font-medium text-theme-primary mb-2">Polizas del Mes</h3>
                <p className="text-xs text-theme-secondary mb-3">Genera las pólizas contables del período</p>
                <button 
                  onClick={() => { showToast('Generando pólizas contables...', 'info'); setTimeout(() => showToast('Pólizas generadas correctamente'), 1500); }}
                  className="w-full py-2 bg-blue-500 hover:bg-blue-400 text-white text-sm font-medium rounded-xl transition-colors"
                >
                  Generar Pólizas
                </button>
              </div>
              <div className="p-4 bg-theme-tertiary/50 rounded-xl">
                <h3 className="text-sm font-medium text-theme-primary mb-2">Conciliación Bancaria</h3>
                <p className="text-xs text-theme-secondary mb-3">Concilia los pagos recibidos con el banco</p>
                <button 
                  onClick={() => { showToast('Iniciando conciliación bancaria...', 'info'); setTimeout(() => showToast('Conciliación completada'), 1500); }}
                  className="w-full py-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-sm font-medium rounded-xl transition-colors"
                >
                  Conciliar
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Tab Fiscal - Solo Contador */}
        {activeTab === 'tax' && role === 'contador' && (
          <div className="bg-theme-card/60 border border-theme rounded-2xl p-6">
            <h2 className="text-lg font-semibold text-theme-primary mb-4">Obligaciones Fiscales</h2>
            <div className="space-y-4">
              <div className="p-4 bg-amber-500/10 border border-amber-500/20 rounded-xl flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-medium text-theme-primary">Declaración IVA - Q4 2025</h3>
                  <p className="text-xs text-theme-secondary">Vence: 30 de Enero, 2026</p>
                </div>
                <button 
                  onClick={() => { showToast('Preparando declaración de IVA...', 'info'); setTimeout(() => showToast('Declaración lista para presentar'), 1500); }}
                  className="px-4 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 text-sm font-medium rounded-xl transition-colors"
                >
                  Preparar
                </button>
              </div>
              <div className="p-4 bg-blue-500/10 border border-blue-500/20 rounded-xl flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-medium text-theme-primary">Modelo 347 - Operaciones Terceros</h3>
                  <p className="text-xs text-theme-secondary">Vence: 28 de Febrero, 2026</p>
                </div>
                <button 
                  onClick={() => { showToast('Generando Modelo 347...', 'info'); setTimeout(() => showToast('Modelo 347 generado correctamente'), 1500); }}
                  className="px-4 py-2 bg-blue-500 hover:bg-blue-400 text-white text-sm font-medium rounded-xl transition-colors"
                >
                  Generar
                </button>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Toast Notification */}
      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: 50, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.9 }}
            className="fixed bottom-6 right-6 z-50"
          >
            <div className={`relative overflow-hidden px-4 py-3 rounded-xl shadow-lg flex items-center gap-3 min-w-[280px] ${
              toast.type === 'success' ? 'bg-gradient-to-r from-emerald-500 to-emerald-600' : 
              toast.type === 'error' ? 'bg-gradient-to-r from-red-500 to-red-600' : 'bg-gradient-to-r from-amber-500 to-amber-600'
            } text-slate-950 font-medium`}>
              <div className="absolute inset-0 bg-white/10 animate-pulse opacity-0" />
              <div className={`p-1.5 rounded-lg ${
                toast.type === 'success' ? 'bg-white/20' : 
                toast.type === 'error' ? 'bg-white/20' : 'bg-white/20'
              }`}>
                {toast.type === 'success' ? <CheckCircle className="w-4 h-4 text-white" /> : 
                 toast.type === 'error' ? <AlertCircle className="w-4 h-4 text-white" /> : <Info className="w-4 h-4 text-white" />}
              </div>
              <span className="flex-1 text-sm">{toast.message}</span>
              <button 
                onClick={() => setToast(null)}
                className="p-1 hover:bg-white/20 rounded-lg transition-colors"
              >
                <X className="w-4 h-4 text-slate-900" />
              </button>
              <motion.div 
                initial={{ scaleX: 1 }}
                animate={{ scaleX: 0 }}
                transition={{ duration: 3, ease: "linear" }}
                className="absolute bottom-0 left-0 right-0 h-1 bg-white/30 origin-left"
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* New Invoice Modal */}
      <AnimatePresence>
        {showNewInvoiceModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => { setShowNewInvoiceModal(false); setNewInvoiceStep(1); }}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 20 }}
              className="bg-gradient-to-br from-slate-900 to-slate-800 border border-slate-700 rounded-2xl w-full max-w-lg overflow-hidden"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header con progress steps */}
              <div className="p-6 border-b border-slate-700">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl font-bold text-white">
                    {role === 'contador' ? 'Nueva Factura Fiscal' : 'Nueva Factura'}
                  </h2>
                  <button onClick={() => { setShowNewInvoiceModal(false); setNewInvoiceStep(1); }} className="p-2 text-slate-400 hover:text-white hover:bg-slate-700 rounded-lg transition-colors">
                    <X className="w-5 h-5" />
                  </button>
                </div>
                
                {/* Progress Steps */}
                <div className="flex items-center gap-2">
                  {[1, 2, 3].map((step, index) => (
                    <div key={step} className="flex-1 flex items-center gap-2">
                      <div className={`flex items-center justify-center w-8 h-8 rounded-full text-sm font-semibold transition-all ${
                        newInvoiceStep >= step 
                          ? 'bg-amber-500 text-slate-950' 
                          : 'bg-slate-700 text-slate-400'
                      }`}>
                        {newInvoiceStep > step ? <CheckCircle className="w-4 h-4" /> : step}
                      </div>
                      <span className={`text-xs font-medium hidden sm:block ${newInvoiceStep >= step ? 'text-white' : 'text-slate-400'}`}>
                        {step === 1 ? 'Cliente' : step === 2 ? 'Detalles' : 'Confirmar'}
                      </span>
                      {index < 2 && (
                        <div className={`flex-1 h-0.5 rounded-full transition-all ${newInvoiceStep > step ? 'bg-amber-500' : 'bg-slate-700'}`} />
                      )}
                    </div>
                  ))}
                </div>
              </div>
              
              {/* Content */}
              <div className="p-6">
                {newInvoiceStep === 1 && (
                  <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-4">
                    <div>
                      <label className="block text-sm text-slate-400 mb-2">Cliente</label>
                      <select 
                        value={newInvoiceForm.client}
                        onChange={(e) => setNewInvoiceForm({...newInvoiceForm, client: e.target.value})}
                        className="w-full px-4 py-3 bg-slate-800 border border-slate-600 text-white rounded-xl focus:outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 transition-all"
                      >
                        <option value="">Seleccionar cliente...</option>
                        <option value="TechCorp SL">TechCorp SL</option>
                        <option value="María García">María García</option>
                        <option value="Carlos López">Carlos López</option>
                        <option value="other">Otro...</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm text-slate-400 mb-2">Tipo de cliente</label>
                      <div className="grid grid-cols-2 gap-3">
                        <button
                          type="button"
                          onClick={() => setNewInvoiceForm({...newInvoiceForm, type: 'Empresa'})}
                          className={`p-4 rounded-xl border-2 transition-all flex flex-col items-center gap-2 ${
                            newInvoiceForm.type === 'Empresa' 
                              ? 'border-amber-500 bg-amber-500/10 text-amber-400' 
                              : 'border-slate-600 bg-slate-800 text-slate-400 hover:border-slate-500'
                          }`}
                        >
                          <Building2 className="w-6 h-6" />
                          <span className="text-sm font-medium">Empresa</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => setNewInvoiceForm({...newInvoiceForm, type: 'Particular'})}
                          className={`p-4 rounded-xl border-2 transition-all flex flex-col items-center gap-2 ${
                            newInvoiceForm.type === 'Particular' 
                              ? 'border-amber-500 bg-amber-500/10 text-amber-400' 
                              : 'border-slate-600 bg-slate-800 text-slate-400 hover:border-slate-500'
                          }`}
                        >
                          <User className="w-6 h-6" />
                          <span className="text-sm font-medium">Particular</span>
                        </button>
                      </div>
                    </div>
                  </motion.div>
                )}
                
                {newInvoiceStep === 2 && (
                  <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-4">
                    <div>
                      <label className="block text-sm text-slate-400 mb-2">Concepto</label>
                      <input 
                        type="text" 
                        value={newInvoiceForm.concept}
                        onChange={(e) => setNewInvoiceForm({...newInvoiceForm, concept: e.target.value})}
                        placeholder="Descripción del servicio..." 
                        className="w-full px-4 py-3 bg-slate-800 border border-slate-600 text-white rounded-xl focus:outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 transition-all"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm text-slate-400 mb-2">Importe (€)</label>
                        <input 
                          type="number" 
                          value={newInvoiceForm.amount}
                          onChange={(e) => setNewInvoiceForm({...newInvoiceForm, amount: e.target.value})}
                          placeholder="0.00" 
                          className="w-full px-4 py-3 bg-slate-800 border border-slate-600 text-white rounded-xl focus:outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 transition-all"
                        />
                      </div>
                      <div>
                        <label className="block text-sm text-slate-400 mb-2">Vencimiento</label>
                        <input 
                          type="date" 
                          value={newInvoiceForm.dueDate}
                          onChange={(e) => setNewInvoiceForm({...newInvoiceForm, dueDate: e.target.value})}
                          className="w-full px-4 py-3 bg-slate-800 border border-slate-600 text-white rounded-xl focus:outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 transition-all"
                        />
                      </div>
                    </div>
                  </motion.div>
                )}
                
                {newInvoiceStep === 3 && (
                  <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-4">
                    <div className="p-4 bg-slate-800/50 rounded-xl border border-slate-700">
                      <h3 className="text-sm font-medium text-slate-400 mb-3">Resumen de Factura</h3>
                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <span className="text-slate-400">Cliente:</span>
                          <span className="text-white font-medium">{newInvoiceForm.client || 'No seleccionado'}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-400">Tipo:</span>
                          <span className="text-white">{newInvoiceForm.type}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-400">Concepto:</span>
                          <span className="text-white">{newInvoiceForm.concept || 'Sin concepto'}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-400">Importe:</span>
                          <span className="text-emerald-400 font-bold">{formatCurrency(parseFloat(newInvoiceForm.amount) || 0)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-400">Vencimiento:</span>
                          <span className="text-white">{newInvoiceForm.dueDate || '30 días'}</span>
                        </div>
                      </div>
                    </div>
                    {role === 'contador' && (
                      <div className="p-4 bg-blue-500/10 border border-blue-500/20 rounded-xl">
                        <p className="text-sm text-blue-400 flex items-center gap-2">
                          <FileCheck className="w-4 h-4" />
                          Se timbrará automáticamente ante el SAT
                        </p>
                      </div>
                    )}
                  </motion.div>
                )}
              </div>
              
              {/* Footer */}
              <div className="p-6 border-t border-slate-700 flex gap-3">
                {newInvoiceStep > 1 && (
                  <button 
                    onClick={() => setNewInvoiceStep(newInvoiceStep - 1)} 
                    className="flex-1 px-4 py-3 bg-slate-700 text-white hover:bg-slate-600 rounded-xl transition-colors flex items-center justify-center gap-2"
                  >
                    <ChevronLeft className="w-4 h-4" />
                    Atrás
                  </button>
                )}
                {newInvoiceStep < 3 ? (
                  <button 
                    onClick={() => setNewInvoiceStep(newInvoiceStep + 1)} 
                    disabled={(newInvoiceStep === 1 && !newInvoiceForm.client) || (newInvoiceStep === 2 && (!newInvoiceForm.concept || !newInvoiceForm.amount))}
                    className="flex-1 px-4 py-3 bg-amber-500 text-slate-950 font-medium rounded-xl hover:bg-amber-400 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
                  >
                    Siguiente
                    <ChevronRight className="w-4 h-4" />
                  </button>
                ) : (
                  <button 
                    onClick={handleCreateInvoice}
                    className="flex-1 px-4 py-3 bg-emerald-500 text-slate-950 font-medium rounded-xl hover:bg-emerald-400 transition-colors flex items-center justify-center gap-2"
                  >
                    <CheckCircle className="w-4 h-4" />
                    {role === 'contador' ? 'Crear y Timbrar' : 'Crear Factura'}
                  </button>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* View Invoice Modal */}
      <AnimatePresence>
        {activeModal === 'view' && selectedInvoice && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => setActiveModal(null)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 20 }}
              className="bg-gradient-to-br from-slate-900 to-slate-800 border border-slate-700 rounded-2xl w-full max-w-lg overflow-hidden"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Invoice Header */}
              <div className="bg-gradient-to-r from-amber-500/20 to-transparent p-6 border-b border-slate-700">
                <div className="flex items-start justify-between">
                  <div>
                    <div className="flex items-center gap-3 mb-2">
                      <div className="p-2 bg-amber-500/20 rounded-lg">
                        <Receipt className="w-6 h-6 text-amber-400" />
                      </div>
                      <div>
                        <h2 className="text-xl font-bold text-white">Factura</h2>
                        <p className="text-slate-400 text-sm font-mono">{selectedInvoice.id}</p>
                      </div>
                    </div>
                  </div>
                  <button onClick={() => setActiveModal(null)} className="p-2 text-slate-400 hover:text-white hover:bg-slate-700 rounded-lg transition-colors">
                    <X className="w-5 h-5" />
                  </button>
                </div>
                
                {/* Status Badge */}
                <div className="mt-4">
                  <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-sm font-semibold rounded-full border ${getStatusColor(selectedInvoice.status)}`}>
                    {selectedInvoice.status === 'paid' && <CheckCircle2 className="w-4 h-4" />}
                    {selectedInvoice.status === 'pending' && <Clock className="w-4 h-4" />}
                    {selectedInvoice.status === 'overdue' && <AlertCircle className="w-4 h-4" />}
                    {getStatusText(selectedInvoice.status)}
                  </span>
                </div>
              </div>
              
              {/* Invoice Body */}
              <div className="p-6 space-y-4">
                {/* Amount - Prominent */}
                <div className="text-center py-4">
                  <p className="text-slate-400 text-sm mb-1">Importe Total</p>
                  <p className="text-4xl font-bold text-emerald-400">{formatCurrency(selectedInvoice.amount)}</p>
                </div>
                
                {/* Client & Type */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-4 bg-slate-800/50 rounded-xl border border-slate-700">
                    <p className="text-slate-400 text-xs mb-1">Cliente</p>
                    <div className="flex items-center gap-2">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${
                        selectedInvoice.type === 'Empresa' ? 'bg-purple-500/20 text-purple-400' : 'bg-blue-500/20 text-blue-400'
                      }`}>
                        {selectedInvoice.type === 'Empresa' ? 'E' : 'P'}
                      </div>
                      <span className="text-white font-medium">{selectedInvoice.client}</span>
                    </div>
                  </div>
                  <div className="p-4 bg-slate-800/50 rounded-xl border border-slate-700">
                    <p className="text-slate-400 text-xs mb-1">Tipo</p>
                    <p className="text-white font-medium">{selectedInvoice.type}</p>
                  </div>
                </div>
                
                {/* Concept */}
                <div className="p-4 bg-slate-800/50 rounded-xl border border-slate-700">
                  <p className="text-slate-400 text-xs mb-1">Concepto</p>
                  <p className="text-white">{selectedInvoice.concept}</p>
                </div>
                
                {/* Dates */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-4 bg-slate-800/50 rounded-xl border border-slate-700">
                    <p className="text-slate-400 text-xs mb-1">Fecha de emisión</p>
                    <p className="text-white font-medium">{selectedInvoice.date}</p>
                  </div>
                  <div className="p-4 bg-slate-800/50 rounded-xl border border-slate-700">
                    <p className="text-slate-400 text-xs mb-1">Fecha de vencimiento</p>
                    <p className={`font-medium ${selectedInvoice.status === 'overdue' ? 'text-red-400' : 'text-white'}`}>{selectedInvoice.dueDate}</p>
                  </div>
                </div>
              </div>
              
              {/* Invoice Actions */}
              <div className="p-6 border-t border-slate-700 bg-slate-800/30">
                <div className="flex gap-3">
                  <button 
                    onClick={() => setActiveModal(null)} 
                    className="flex-1 px-4 py-3 bg-slate-700 text-white hover:bg-slate-600 rounded-xl transition-colors flex items-center justify-center gap-2"
                  >
                    Cerrar
                  </button>
                  <button 
                    onClick={() => handleDownloadInvoice(selectedInvoice)} 
                    className="flex-1 px-4 py-3 bg-amber-500 text-slate-950 font-medium rounded-xl hover:bg-amber-400 transition-colors flex items-center justify-center gap-2"
                  >
                    <Download className="w-4 h-4" />
                    Descargar
                  </button>
                </div>
                
                {/* Secondary Actions */}
                <div className="flex gap-2 mt-3">
                  {permissions.canSendReminders && (selectedInvoice.status === 'pending' || selectedInvoice.status === 'overdue') && (
                    <button 
                      onClick={() => { setActiveModal('reminder'); }}
                      className="flex-1 px-3 py-2 bg-slate-700/50 text-slate-300 hover:bg-slate-700 rounded-lg text-sm transition-colors flex items-center justify-center gap-2"
                    >
                      <Mail className="w-4 h-4" />
                      Enviar recordatorio
                    </button>
                  )}
                  {selectedInvoice.method && selectedInvoice.method !== '-' && (
                    <div className="flex-1 px-3 py-2 bg-emerald-500/10 text-emerald-400 rounded-lg text-sm flex items-center justify-center gap-2">
                      <CheckCircle2 className="w-4 h-4" />
                      Pagado por {selectedInvoice.method}
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Payment Modal */}
      <AnimatePresence>
        {activeModal === 'payment' && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => setActiveModal(null)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 20 }}
              className="bg-gradient-to-br from-slate-900 to-slate-800 border border-slate-700 rounded-2xl w-full max-w-lg overflow-hidden"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header */}
              <div className="p-6 border-b border-slate-700">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-emerald-500/20 rounded-lg">
                      <Wallet className="w-6 h-6 text-emerald-400" />
                    </div>
                    <div>
                      <h2 className="text-xl font-bold text-white">Registrar Pago</h2>
                      <p className="text-slate-400 text-sm">Completa los datos del cobro</p>
                    </div>
                  </div>
                  <button onClick={() => setActiveModal(null)} className="p-2 text-slate-400 hover:text-white hover:bg-slate-700 rounded-lg transition-colors">
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </div>
              
              {/* Body */}
              <div className="p-6 space-y-4">
                <div>
                  <label className="block text-sm text-slate-400 mb-2">Factura a cobrar</label>
                  <select 
                    className="w-full px-4 py-3 bg-slate-800 border border-slate-600 text-white rounded-xl focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 transition-all"
                    onChange={(e) => {
                      const fact = facturasData.find(f => f.id === e.target.value);
                      if (fact) {
                        setSelectedInvoice(fact);
                        setPaymentForm({...paymentForm, amount: fact.amount.toString()});
                      }
                    }}
                  >
                    <option value="">Seleccionar factura...</option>
                    {facturasData.filter(f => f.status === 'pending' || f.status === 'overdue').map(f => (
                      <option key={f.id} value={f.id}>
                        {f.id} - {f.client} ({formatCurrency(f.amount)})
                      </option>
                    ))}
                  </select>
                </div>
                
                {/* Selected Invoice Preview */}
                {selectedInvoice && (
                  <div className="p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-xl">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-white font-medium">{selectedInvoice.client}</p>
                        <p className="text-slate-400 text-sm">{selectedInvoice.concept}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-emerald-400 font-bold text-lg">{formatCurrency(parseFloat(paymentForm.amount) || selectedInvoice.amount)}</p>
                        <p className="text-slate-400 text-xs">Pendiente: {formatCurrency(selectedInvoice.amount)}</p>
                      </div>
                    </div>
                  </div>
                )}
                
                <div>
                  <label className="block text-sm text-slate-400 mb-2">Monto recibido (€)</label>
                  <div className="relative">
                    <input 
                      type="number" 
                      value={paymentForm.amount}
                      onChange={(e) => setPaymentForm({...paymentForm, amount: e.target.value})}
                      placeholder="0.00" 
                      className="w-full px-4 py-3 pl-10 bg-slate-800 border border-slate-600 text-white rounded-xl focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 transition-all"
                    />
                    <Banknote className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm text-slate-400 mb-2">Método de pago</label>
                  <div className="grid grid-cols-2 gap-3">
                    {[
                      { value: 'transfer', label: 'Transferencia', icon: Building2 },
                      { value: 'card', label: 'Tarjeta', icon: CreditCard },
                      { value: 'cash', label: 'Efectivo', icon: Banknote },
                      { value: 'check', label: 'Cheque', icon: FileText },
                    ].map((method) => (
                      <button
                        key={method.value}
                        type="button"
                        onClick={() => setPaymentForm({...paymentForm, method: method.value})}
                        className={`p-3 rounded-xl border-2 transition-all flex flex-col items-center gap-2 ${
                          paymentForm.method === method.value 
                            ? 'border-emerald-500 bg-emerald-500/10 text-emerald-400' 
                            : 'border-slate-600 bg-slate-800 text-slate-400 hover:border-slate-500'
                        }`}
                      >
                        <method.icon className="w-5 h-5" />
                        <span className="text-xs font-medium">{method.label}</span>
                      </button>
                    ))}
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm text-slate-400 mb-2">Fecha de recepción</label>
                  <input 
                    type="date" 
                    value={paymentForm.date}
                    onChange={(e) => setPaymentForm({...paymentForm, date: e.target.value})}
                    className="w-full px-4 py-3 bg-slate-800 border border-slate-600 text-white rounded-xl focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 transition-all"
                  />
                </div>
              </div>
              
              {/* Footer */}
              <div className="p-6 border-t border-slate-700 bg-slate-800/30">
                <div className="flex gap-3">
                  <button 
                    onClick={() => setActiveModal(null)} 
                    className="flex-1 px-4 py-3 bg-slate-700 text-white hover:bg-slate-600 rounded-xl transition-colors"
                  >
                    Cancelar
                  </button>
                  <button 
                    onClick={handleRegisterPayment}
                    disabled={!paymentForm.amount || !selectedInvoice}
                    className="flex-1 px-4 py-3 bg-emerald-500 text-slate-950 font-medium rounded-xl hover:bg-emerald-400 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
                  >
                    <CheckCircle className="w-4 h-4" />
                    Confirmar Pago
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Reminder Modal */}
      <AnimatePresence>
        {activeModal === 'reminder' && selectedInvoice && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className={`fixed inset-0 ${resolvedTheme === 'dark' ? 'bg-slate-950/80' : 'bg-slate-950/50'} backdrop-blur-sm z-50 flex items-center justify-center p-4`}
            onClick={() => setActiveModal(null)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className={`${resolvedTheme === 'dark' ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'} border rounded-2xl w-full max-w-lg p-6`}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-6">
                <h2 className={`text-xl font-bold ${resolvedTheme === 'dark' ? 'text-white' : 'text-slate-900'}`}>Enviar Recordatorio</h2>
                <button onClick={() => setActiveModal(null)} className={`p-2 ${resolvedTheme === 'dark' ? 'text-slate-400 hover:text-white hover:bg-slate-800' : 'text-slate-500 hover:text-slate-900 hover:bg-slate-100'} rounded-lg`}>
                  <X className="w-5 h-5" />
                </button>
              </div>
              <div className={`p-4 ${resolvedTheme === 'dark' ? 'bg-amber-500/10 border-amber-500/20' : 'bg-amber-50 border-amber-200'} border rounded-xl mb-4`}>
                <p className={`text-sm ${resolvedTheme === 'dark' ? 'text-amber-400' : 'text-amber-700'} font-medium`}>{selectedInvoice.client}</p>
                <p className={`text-sm ${resolvedTheme === 'dark' ? 'text-slate-400' : 'text-slate-500'}`}>Factura: {selectedInvoice.id}</p>
                <p className={`text-lg font-bold ${resolvedTheme === 'dark' ? 'text-white' : 'text-slate-900'} mt-2`}>{formatCurrency(selectedInvoice.amount)}</p>
                <p className={`text-sm ${resolvedTheme === 'dark' ? 'text-slate-400' : 'text-slate-500'}`}>Vencimiento: {selectedInvoice.dueDate}</p>
              </div>
              <div className="space-y-4">
                <div>
                  <label className={`block text-sm ${resolvedTheme === 'dark' ? 'text-slate-400' : 'text-slate-600'} mb-2`}>Mensaje</label>
                  <textarea 
                    className={`w-full px-4 py-2.5 ${resolvedTheme === 'dark' ? 'bg-slate-800 border-slate-700 text-white' : 'bg-slate-50 border-slate-300 text-slate-900'} border rounded-xl h-32 resize-none`}
                    defaultValue={`Estimado cliente,

Le recordamos que tiene una factura pendiente de pago por importe de ${formatCurrency(selectedInvoice.amount)} con fecha de vencimiento ${selectedInvoice.dueDate}.

Agradecemos su atención.

Atentamente,
Bufete de Abogados`}
                  />
                </div>
                <div className="flex items-center gap-2">
                  <input type="checkbox" id="email" defaultChecked className={`rounded ${resolvedTheme === 'dark' ? 'border-slate-600 text-amber-500' : 'border-slate-300 text-amber-500'}`} />
                  <label htmlFor="email" className={`text-sm ${resolvedTheme === 'dark' ? 'text-slate-300' : 'text-slate-700'}`}>Enviar por email</label>
                </div>
              </div>
              <div className="flex gap-3 mt-6">
                <button onClick={() => setActiveModal(null)} className={`flex-1 px-4 py-2.5 ${resolvedTheme === 'dark' ? 'bg-slate-800 text-white hover:bg-slate-700' : 'bg-slate-100 text-slate-900 hover:bg-slate-200'} rounded-xl`}>
                  Cancelar
                </button>
                <button 
                  onClick={() => handleSendReminder()} 
                  className="flex-1 px-4 py-2.5 bg-amber-500 text-slate-950 font-medium rounded-xl hover:bg-amber-400 flex items-center justify-center gap-2"
                >
                  <Send className="w-4 h-4" />
                  Enviar Recordatorio
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Cancel Modal */}
      <AnimatePresence>
        {activeModal === 'cancel' && selectedInvoice && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className={`fixed inset-0 ${resolvedTheme === 'dark' ? 'bg-slate-950/80' : 'bg-slate-950/50'} backdrop-blur-sm z-50 flex items-center justify-center p-4`}
            onClick={() => setActiveModal(null)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className={`${resolvedTheme === 'dark' ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'} border rounded-2xl w-full max-w-md p-6`}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-6">
                <h2 className={`text-xl font-bold ${resolvedTheme === 'dark' ? 'text-white' : 'text-slate-900'}`}>Cancelar Factura</h2>
                <button onClick={() => setActiveModal(null)} className={`p-2 ${resolvedTheme === 'dark' ? 'text-slate-400 hover:text-white hover:bg-slate-800' : 'text-slate-500 hover:text-slate-900 hover:bg-slate-100'} rounded-lg`}>
                  <X className="w-5 h-5" />
                </button>
              </div>
              <div className={`p-4 ${resolvedTheme === 'dark' ? 'bg-red-500/10 border-red-500/20' : 'bg-red-50 border-red-200'} border rounded-xl mb-4`}>
                <p className={`text-sm ${resolvedTheme === 'dark' ? 'text-red-400' : 'text-red-600'} font-medium mb-2`}>⚠️ Esta acción no se puede deshacer</p>
                <p className={`text-sm ${resolvedTheme === 'dark' ? 'text-slate-400' : 'text-slate-500'}`}>Factura: {selectedInvoice.id}</p>
                <p className={`${resolvedTheme === 'dark' ? 'text-white' : 'text-slate-900'}`}>{selectedInvoice.client}</p>
                <p className={`text-lg font-bold ${resolvedTheme === 'dark' ? 'text-white' : 'text-slate-900'} mt-2`}>{formatCurrency(selectedInvoice.amount)}</p>
              </div>
              <div className="space-y-4">
                <div>
                  <label className={`block text-sm ${resolvedTheme === 'dark' ? 'text-slate-400' : 'text-slate-600'} mb-2`}>Motivo de cancelación</label>
                  <select className={`w-full px-4 py-2.5 ${resolvedTheme === 'dark' ? 'bg-slate-800 border-slate-700 text-white' : 'bg-slate-50 border-slate-300 text-slate-900'} border rounded-xl`}>
                    <option>Error en datos fiscales</option>
                    <option>Factura duplicada</option>
                    <option>Servicio no prestado</option>
                    <option>Cancelación por cliente</option>
                    <option>Otro</option>
                  </select>
                </div>
              </div>
              <div className="flex gap-3 mt-6">
                <button onClick={() => setActiveModal(null)} className={`flex-1 px-4 py-2.5 ${resolvedTheme === 'dark' ? 'bg-slate-800 text-white hover:bg-slate-700' : 'bg-slate-100 text-slate-900 hover:bg-slate-200'} rounded-xl`}>
                  Cancelar
                </button>
                <button 
                  onClick={handleCancelInvoice} 
                  className="flex-1 px-4 py-2.5 bg-red-500 text-white font-medium rounded-xl hover:bg-red-400 flex items-center justify-center gap-2"
                >
                  <Ban className="w-4 h-4" />
                  Confirmar Cancelación
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Account State Modal */}
      <AnimatePresence>
        {activeModal === 'accountState' && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className={`fixed inset-0 ${resolvedTheme === 'dark' ? 'bg-slate-950/80' : 'bg-slate-950/50'} backdrop-blur-sm z-50 flex items-center justify-center p-4`}
            onClick={() => setActiveModal(null)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className={`${resolvedTheme === 'dark' ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'} border rounded-2xl w-full max-w-lg p-6`}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-6">
                <h2 className={`text-xl font-bold ${resolvedTheme === 'dark' ? 'text-white' : 'text-slate-900'}`}>Generar Estado de Cuenta</h2>
                <button onClick={() => setActiveModal(null)} className={`p-2 ${resolvedTheme === 'dark' ? 'text-slate-400 hover:text-white hover:bg-slate-800' : 'text-slate-500 hover:text-slate-900 hover:bg-slate-100'} rounded-lg`}>
                  <X className="w-5 h-5" />
                </button>
              </div>
              <div className="space-y-4">
                <div>
                  <label className={`block text-sm ${resolvedTheme === 'dark' ? 'text-slate-400' : 'text-slate-600'} mb-2`}>Cliente</label>
                  <select className={`w-full px-4 py-2.5 ${resolvedTheme === 'dark' ? 'bg-slate-800 border-slate-700 text-white' : 'bg-slate-50 border-slate-300 text-slate-900'} border rounded-xl`}>
                    <option>Seleccionar cliente...</option>
                    <option>TechCorp SL</option>
                    <option>María García</option>
                    <option>Carlos López</option>
                  </select>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className={`block text-sm ${resolvedTheme === 'dark' ? 'text-slate-400' : 'text-slate-600'} mb-2`}>Desde</label>
                    <input type="date" className={`w-full px-4 py-2.5 ${resolvedTheme === 'dark' ? 'bg-slate-800 border-slate-700 text-white' : 'bg-slate-50 border-slate-300 text-slate-900'} border rounded-xl`} />
                  </div>
                  <div>
                    <label className={`block text-sm ${resolvedTheme === 'dark' ? 'text-slate-400' : 'text-slate-600'} mb-2`}>Hasta</label>
                    <input type="date" className={`w-full px-4 py-2.5 ${resolvedTheme === 'dark' ? 'bg-slate-800 border-slate-700 text-white' : 'bg-slate-50 border-slate-300 text-slate-900'} border rounded-xl`} />
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <input type="checkbox" id="includePaid" defaultChecked className={`rounded ${resolvedTheme === 'dark' ? 'border-slate-600 text-amber-500' : 'border-slate-300 text-amber-500'}`} />
                  <label htmlFor="includePaid" className={`text-sm ${resolvedTheme === 'dark' ? 'text-slate-300' : 'text-slate-700'}`}>Incluir facturas pagadas</label>
                </div>
              </div>
              <div className="flex gap-3 mt-6">
                <button onClick={() => setActiveModal(null)} className={`flex-1 px-4 py-2.5 ${resolvedTheme === 'dark' ? 'bg-slate-800 text-white hover:bg-slate-700' : 'bg-slate-100 text-slate-900 hover:bg-slate-200'} rounded-xl`}>
                  Cancelar
                </button>
                <button 
                  onClick={() => { showToast('Generando estado de cuenta...', 'info'); setTimeout(() => showToast('Estado de cuenta generado'), 1500); setActiveModal(null); }} 
                  className="flex-1 px-4 py-2.5 bg-blue-500 text-white font-medium rounded-xl hover:bg-blue-400 flex items-center justify-center gap-2"
                >
                  <FileText className="w-4 h-4" />
                  Generar
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Modal: Firma Electrónica */}
      <SignatureModal
        isOpen={signatureModalOpen}
        onClose={() => setSignatureModalOpen(false)}
        mode="request"
        documentId={selectedInvoice?.id || ''}
        documentName={`Factura_${selectedInvoice?.id}.pdf`}
        onComplete={(_result) => {
          showToast(`Solicitud de firma enviada para ${selectedInvoice?.id}`, 'success');
          setSignatureModalOpen(false);
        }}
      />
    </AppLayout>
  );
}

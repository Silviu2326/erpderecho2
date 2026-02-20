import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Download, FileText, Zap, ArrowUpRight, TrendingUp, TrendingDown, 
  Euro, Briefcase, Target, Clock, BarChart3, CalendarDays, AlertCircle,
  Users, FileBarChart, TrendingUp as TrendingUpIcon, 
  DollarSign, Calculator, Receipt, Wallet, Gavel, Crown, UserCheck,
  Lock, X, FileSpreadsheet, Plus, CheckCircle,
  Eye, Trash2, Play, Settings, Repeat, Activity
} from 'lucide-react';
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  BarChart, Bar, PieChart, Pie, Cell
} from 'recharts';
import { AppLayout } from '@/components/layout/AppLayout';
import { financialData, recentReports, kpis } from '@/data/informesData';
import { useRole } from '@/hooks/useRole';
import type { UserRole } from '@/types/roles';
import { reportsService, type LawyerKPIs, type CaseKPIs, type Benchmark, type CustomReport } from '@/services/reportsService';

const EXPENSE_COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#8B5CF6'];

// Tipos para modales
type ModalType = 'export' | 'custom' | 'generate' | 'schedule' | 'timeReport' | 'caseStatus' | 'balance' | 'iva' | 'compare' | 'alerts' | null;

interface ScheduledReport {
  id: number;
  name: string;
  type: string;
  frequency: string;
  nextRun: string;
  format: string;
  enabled: boolean;
}

// Datos específicos por rol
const roleSpecificData = {
  abogado_senior: {
    personalKPIs: [
      { label: 'Mis Casos Activos', value: '12', change: '+3', trend: 'up', icon: 'Briefcase', color: 'blue', description: 'este mes' },
      { label: 'Casos Resueltos', value: '28', change: '+5', trend: 'up', icon: 'Target', color: 'emerald', description: 'este año' },
      { label: 'Horas Registradas', value: '156h', change: '+12%', trend: 'up', icon: 'Clock', color: 'amber', description: 'este mes' },
      { label: 'Tasa de Éxito', value: '91%', change: '+4%', trend: 'up', icon: 'TrendingUpIcon', color: 'purple', description: 'casos favorables' },
    ],
    recentReports: [
      { id: 1, title: 'Mi Productividad - Enero 2026', type: 'Personal', date: '01 Feb 2026', size: '1.2 MB', format: 'PDF' },
      { id: 2, title: 'Estado de Mis Expedientes', type: 'Operativo', date: '15 Ene 2026', size: '890 KB', format: 'PDF' },
      { id: 3, title: 'Tiempo por Caso - Q4 2025', type: 'Personal', date: '10 Ene 2026', size: '1.5 MB', format: 'XLSX' },
    ]
  },
  administrador: {
    adminKPIs: [
      { label: 'Ingresos del Mes', value: '€45.2K', change: '+8.5%', trend: 'up', icon: 'Euro', color: 'emerald', description: 'vs mes anterior' },
      { label: 'Gastos Operativos', value: '€18.5K', change: '-2%', trend: 'up', icon: 'Wallet', color: 'red', description: 'este mes' },
      { label: 'Clientes Nuevos', value: '8', change: '+3', trend: 'up', icon: 'Users', color: 'blue', description: 'este mes' },
      { label: 'Cobranza Pendiente', value: '€125K', change: '-5%', trend: 'down', icon: 'Receipt', color: 'amber', description: 'por cobrar' },
    ],
    recentReports: [
      { id: 1, title: 'Estado Financiero - Enero 2026', type: 'Financiero', date: '01 Feb 2026', size: '2.4 MB', format: 'PDF' },
      { id: 2, title: 'Reporte de Recursos - Q4 2025', type: 'Administrativo', date: '15 Ene 2026', size: '1.8 MB', format: 'PDF' },
      { id: 3, title: 'Base de Clientes - 2025', type: 'Clientes', date: '10 Ene 2026', size: '3.2 MB', format: 'XLSX' },
      { id: 4, title: 'Estado de Cobranza', type: 'Financiero', date: '05 Ene 2026', size: '1.5 MB', format: 'PDF' },
    ]
  },
  contador: {
    accountingKPIs: [
      { label: 'Ingresos Totales', value: '€590.2K', change: '+18.5%', trend: 'up', icon: 'Euro', color: 'emerald', description: 'ejercicio fiscal' },
      { label: 'Gastos Deducibles', value: '€215K', change: '+5%', trend: 'up', icon: 'Calculator', color: 'blue', description: 'acumulado' },
      { label: 'IVA a Pagar', value: '€45.2K', change: '+8%', trend: 'up', icon: 'Receipt', color: 'amber', description: 'trimestre actual' },
      { label: 'Beneficio Neto', value: '€375K', change: '+22%', trend: 'up', icon: 'DollarSign', color: 'purple', description: 'margen 63%' },
    ],
    recentReports: [
      { id: 1, title: 'Balance General - 2025', type: 'Contable', date: '01 Feb 2026', size: '2.8 MB', format: 'PDF' },
      { id: 2, title: 'Estado de Resultados - Q4', type: 'Contable', date: '15 Ene 2026', size: '1.9 MB', format: 'PDF' },
      { id: 3, title: 'Flujo de Caja - 2025', type: 'Financiero', date: '10 Ene 2026', size: '2.1 MB', format: 'XLSX' },
      { id: 4, title: 'Declaración IVA - Q4', type: 'Fiscal', date: '15 Ene 2026', size: '1.2 MB', format: 'PDF' },
      { id: 5, title: 'Conciliación Bancaria - Dic', type: 'Contable', date: '05 Ene 2026', size: '890 KB', format: 'PDF' },
    ]
  }
};

export default function Informes() {
  const { role, roleConfig } = useRole();
  const [activeTab, setActiveTab] = useState('overview');
  const [dateRange, setDateRange] = useState('year');
  const [activeModal, setActiveModal] = useState<ModalType>(null);
  const [selectedReport, setSelectedReport] = useState<number | null>(null);
  const [toast, setToast] = useState<{message: string; type: 'success' | 'info'} | null>(null);
  const [scheduledReports, setScheduledReports] = useState<ScheduledReport[]>([
    { id: 1, name: 'Informe Financiero Mensual', type: 'Financiero', frequency: 'Mensual', nextRun: '01/03/2026', format: 'PDF', enabled: true },
    { id: 2, name: 'Reporte de Productividad', type: 'Personal', frequency: 'Semanal', nextRun: '15/02/2026', format: 'Excel', enabled: true },
    { id: 3, name: 'Estado de Cobranza', type: 'Administrativo', frequency: 'Quincenal', nextRun: '20/02/2026', format: 'PDF', enabled: false },
  ]);

  // Form states
  const [exportFormat, setExportFormat] = useState<'pdf' | 'excel'>('pdf');
  const [customReportName, setCustomReportName] = useState('');
  const [customReportType, setCustomReportType] = useState('financial');
  const [scheduleName, setScheduleName] = useState('');
  const [scheduleFrequency, setScheduleFrequency] = useState('monthly');
  const [comparePeriod1, setComparePeriod1] = useState('2025-Q4');
  const [comparePeriod2, setComparePeriod2] = useState('2026-Q1');
  const [alertSettings, setAlertSettings] = useState({
    revenue: true,
    expenses: true,
    cases: false,
    productivity: true,
    cobranza: false,
  });

  // M10: KPIs y Benchmarks state
  const [lawyerKPIs, setLawyerKPIs] = useState<LawyerKPIs | null>(null);
  const [benchmarks, setBenchmarks] = useState<Benchmark[]>([]);
  const [caseKPIs, setCaseKPIs] = useState<CaseKPIs | null>(null);
  const [customReports, setCustomReports] = useState<CustomReport[]>([]);
  const [selectedLawyer, setSelectedLawyer] = useState<string>('lawyer_1');
  const [selectedCase, setSelectedCase] = useState<string>('EXP-2024-001');
  const [kpisLoading, setKpisLoading] = useState(false);
  const [reportName, setReportName] = useState('');
  const [reportType, setReportType] = useState<'lawyer' | 'case' | 'financial'>('lawyer');

  // Load KPIs
  const loadLawyerKPIs = async () => {
    setKpisLoading(true);
    try {
      const kpis = await reportsService.getLawyerKPIs(selectedLawyer, {
        start: new Date('2026-01-01'),
        end: new Date('2026-12-31')
      });
      setLawyerKPIs(kpis);
      const bmarks = await reportsService.getLawyerBenchmarks(selectedLawyer);
      setBenchmarks(bmarks);
    } catch (e) {
      console.error('Error loading KPIs:', e);
    } finally {
      setKpisLoading(false);
    }
  };

  // Load custom reports
  const loadCustomReports = () => {
    const reports = reportsService.getCustomReports();
    setCustomReports(reports);
  };

  // Create custom report
  const createCustomReport = () => {
    if (!reportName.trim()) return;
    const newReport = reportsService.createCustomReport({
      name: reportName,
      description: `Informe personalizado - ${reportType}`,
      type: reportType,
      filters: { period: '2026' },
      columns: ['name', 'value', 'change']
    });
    setCustomReports([...customReports, newReport]);
    setReportName('');
    showToast(`Informe "${reportName}" creado correctamente`);
  };

  // Execute custom report
  const executeCustomReport = async (reportId: string) => {
    showToast('Generando informe...', 'info');
    try {
      const result = await reportsService.executeCustomReport(reportId);
      console.log('Report result:', result);
      showToast('Informe generado correctamente');
    } catch (e) {
      showToast('Error al generar informe', 'info');
    }
  };

  const showToast = (message: string, type: 'success' | 'info' = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  const handleExport = (format: 'pdf' | 'excel') => {
    showToast(`Informe exportado como ${format.toUpperCase()} correctamente`);
    setActiveModal(null);
    setSelectedReport(null);
  };

  const handleGenerateReport = (type: string) => {
    showToast(`Generando informe: ${type}...`, 'info');
    setTimeout(() => {
      showToast('Informe generado correctamente');
      setActiveModal(null);
    }, 1500);
  };

  const handleCreateCustomReport = () => {
    if (!customReportName.trim()) {
      showToast('Por favor ingresa un nombre para el informe', 'info');
      return;
    }
    showToast(`Informe personalizado "${customReportName}" creado correctamente`);
    setCustomReportName('');
    setActiveModal(null);
  };

  const handleScheduleReport = () => {
    if (!scheduleName.trim()) {
      showToast('Por favor ingresa un nombre para la programación', 'info');
      return;
    }
    const newReport: ScheduledReport = {
      id: Date.now(),
      name: scheduleName,
      type: customReportType === 'financial' ? 'Financiero' : customReportType === 'productivity' ? 'Productividad' : 'Personalizado',
      frequency: scheduleFrequency === 'daily' ? 'Diario' : scheduleFrequency === 'weekly' ? 'Semanal' : scheduleFrequency === 'biweekly' ? 'Quincenal' : 'Mensual',
      nextRun: '01/03/2026',
      format: exportFormat.toUpperCase(),
      enabled: true,
    };
    setScheduledReports([...scheduledReports, newReport]);
    showToast('Informe programado correctamente');
    setScheduleName('');
    setActiveModal(null);
  };

  const toggleScheduledReport = (id: number) => {
    setScheduledReports(scheduledReports.map(r => r.id === id ? { ...r, enabled: !r.enabled } : r));
  };

  const deleteScheduledReport = (id: number) => {
    setScheduledReports(scheduledReports.filter(r => r.id !== id));
    showToast('Programación eliminada');
  };

  const handleSaveAlerts = () => {
    showToast('Configuración de alertas guardada correctamente');
    setActiveModal(null);
  };

  // Determinar permisos según el rol
  const permissions = useMemo(() => {
    const moduleAccess = roleConfig.permissions.modules.reportes;
    
    return {
      // Acceso a informes
      canViewAll: role === 'super_admin' || role === 'socio',
      canViewOwn: moduleAccess === 'own',
      canViewFinancial: moduleAccess === 'financial' || moduleAccess === 'full',
      canViewBasic: moduleAccess === 'basic',
      
      // Acciones
      canGenerateAll: role === 'super_admin' || role === 'socio',
      canGeneratePersonal: role === 'abogado_senior',
      canGenerateFinancial: role === 'administrador' || role === 'contador',
      canExport: moduleAccess !== 'none' && moduleAccess !== 'basic',
      canSchedule: role === 'super_admin' || role === 'socio' || role === 'administrador',
      canCreateCustom: role === 'super_admin',
      
      // Visualización de datos
      canViewFinancialData: roleConfig.permissions.canViewFinancialData,
      canViewAllCases: roleConfig.permissions.canViewAllCases,
      canViewAllClients: roleConfig.permissions.canViewAllClients,
      canViewProductivity: role === 'super_admin' || role === 'socio' || role === 'abogado_senior',
      canViewTimeReports: role === 'super_admin' || role === 'socio' || role === 'abogado_senior' || role === 'abogado_junior' || role === 'paralegal',
    };
  }, [role, roleConfig]);

  // Datos filtrados según rol
  const filteredData = useMemo(() => {
    switch (role) {
      case 'super_admin':
      case 'socio':
        return {
          kpis: kpis,
          reports: recentReports,
          financialData: financialData,
          tabs: [
            { id: 'overview', label: 'Resumen General' },
            { id: 'financial', label: 'Financiero' },
            { id: 'cases', label: 'Expedientes' },
            { id: 'productivity', label: 'Productividad' },
            { id: 'clients', label: 'Clientes' },
            { id: 'kpis', label: 'KPIs & Informes' },
          ]
        };
      
      case 'abogado_senior':
        return {
          kpis: roleSpecificData.abogado_senior.personalKPIs,
          reports: roleSpecificData.abogado_senior.recentReports,
          financialData: null, // No ve datos financieros generales
          tabs: [
            { id: 'overview', label: 'Mi Resumen' },
            { id: 'cases', label: 'Mis Expedientes' },
            { id: 'productivity', label: 'Mi Productividad' },
            { id: 'time', label: 'Tiempo' },
          ]
        };
      
      case 'administrador':
        return {
          kpis: roleSpecificData.administrador.adminKPIs,
          reports: roleSpecificData.administrador.recentReports,
          financialData: financialData,
          tabs: [
            { id: 'overview', label: 'Resumen Admin' },
            { id: 'financial', label: 'Financiero' },
            { id: 'clients', label: 'Clientes' },
            { id: 'resources', label: 'Recursos' },
          ]
        };
      
      case 'contador':
        return {
          kpis: roleSpecificData.contador.accountingKPIs,
          reports: roleSpecificData.contador.recentReports,
          financialData: financialData,
          tabs: [
            { id: 'overview', label: 'Resumen Contable' },
            { id: 'financial', label: 'Estados Financieros' },
            { id: 'tax', label: 'Fiscal' },
            { id: 'cashflow', label: 'Flujo de Caja' },
          ]
        };
      
      default:
        return {
          kpis: [],
          reports: [],
          financialData: null,
          tabs: []
        };
    }
  }, [role]);

  // KPIs específicos por tab
  const tabKPIs = useMemo(() => {
    const overviewKPIs = filteredData.kpis;
    
    const financialKPIs = [
      { label: 'Ingresos Totales', value: '€590.2K', change: '+18.5%', trend: 'up', icon: 'Euro', color: 'emerald', description: 'ejercicio fiscal' },
      { label: 'Gastos Operativos', value: '€216K', change: '+8%', trend: 'up', icon: 'Wallet', color: 'red', description: 'acumulado anual' },
      { label: 'Beneficio Neto', value: '€374.2K', change: '+22%', trend: 'up', icon: 'DollarSign', color: 'blue', description: 'margen 63%' },
      { label: 'Pendiente Cobro', value: '€125K', change: '-5%', trend: 'down', icon: 'Receipt', color: 'amber', description: 'facturas pendientes' },
    ];

    const casesKPIs = [
      { label: 'Expedientes Activos', value: '89', change: '+12', trend: 'up', icon: 'Briefcase', color: 'blue', description: 'en tramitación' },
      { label: 'Nuevos Este Mes', value: '15', change: '+3', trend: 'up', icon: 'FileText', color: 'emerald', description: 'expedientes nuevos' },
      { label: 'Resueltos', value: '127', change: '+23', trend: 'up', icon: 'Target', color: 'purple', description: 'este año' },
      { label: 'Urgentes', value: '8', change: '-2', trend: 'down', icon: 'AlertCircle', color: 'red', description: 'requieren atención' },
    ];

    const productivityKPIs = [
      { label: 'Horas Facturadas', value: '2,840h', change: '+12%', trend: 'up', icon: 'Clock', color: 'blue', description: 'este mes' },
      { label: 'Promedio por Abogado', value: '142h', change: '+5%', trend: 'up', icon: 'Users', color: 'emerald', description: 'horas mensuales' },
      { label: 'Tasa de Ocupación', value: '78%', change: '+3%', trend: 'up', icon: 'BarChart3', color: 'amber', description: 'capacidad utilizada' },
      { label: 'Eficiencia', value: '92%', change: '+4%', trend: 'up', icon: 'TrendingUpIcon', color: 'purple', description: 'horas vs objetivo' },
    ];

    const clientsKPIs = [
      { label: 'Clientes Activos', value: '156', change: '+18', trend: 'up', icon: 'Users', color: 'blue', description: 'con expedientes' },
      { label: 'Nuevos Clientes', value: '24', change: '+6', trend: 'up', icon: 'UserCheck', color: 'emerald', description: 'este trimestre' },
      { label: 'Retención', value: '94%', change: '+2%', trend: 'up', icon: 'TrendingUpIcon', color: 'amber', description: 'tasa de renovación' },
      { label: 'Satisfacción', value: '4.7/5', change: '+0.3', trend: 'up', icon: 'Target', color: 'purple', description: 'valoración media' },
    ];

    switch (activeTab) {
      case 'financial':
        return financialKPIs;
      case 'cases':
        return casesKPIs;
      case 'productivity':
        return productivityKPIs;
      case 'clients':
        return clientsKPIs;
      default:
        return overviewKPIs;
    }
  }, [activeTab, filteredData.kpis]);

  // Títulos y mensajes según rol
  const getPageInfo = () => {
    switch (role) {
      case 'super_admin':
        return { 
          title: 'Informes y Análisis', 
          subtitle: 'Reportes completos del sistema',
          description: 'Acceso total a todos los informes del bufete'
        };
      case 'socio':
        return { 
          title: 'Informes Ejecutivos', 
          subtitle: 'Análisis integral del bufete',
          description: 'Reportes financieros, operativos y de productividad'
        };
      case 'abogado_senior':
        return { 
          title: 'Mis Informes', 
          subtitle: 'Análisis de mi desempeño',
          description: 'Reportes personales de casos, tiempo y productividad'
        };
      case 'administrador':
        return { 
          title: 'Informes Administrativos', 
          subtitle: 'Gestión operativa y financiera',
          description: 'Reportes de recursos, clientes y estado financiero'
        };
      case 'contador':
        return { 
          title: 'Informes Contables', 
          subtitle: 'Reportes financieros y fiscales',
          description: 'Estados financieros, fiscales y flujo de caja'
        };
      default:
        return { 
          title: 'Informes', 
          subtitle: 'Acceso restringido',
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
      case 'abogado_senior':
        return <Gavel className="w-5 h-5" />;
      case 'administrador':
        return <UserCheck className="w-5 h-5" />;
      case 'contador':
        return <Calculator className="w-5 h-5" />;
      default:
        return <FileBarChart className="w-5 h-5" />;
    }
  };

  // Mensaje según rol
  const getRoleMessage = () => {
    const messages: Record<UserRole, { title: string; description: string; actions: string[] }> = {
      super_admin: {
        title: 'Acceso Total a Informes',
        description: 'Puedes generar, ver y exportar cualquier tipo de reporte del sistema.',
        actions: ['Crear reportes personalizados', 'Programar informes automáticos', 'Exportar en múltiples formatos', 'Ver auditoría completa']
      },
      socio: {
        title: 'Informes Ejecutivos',
        description: 'Acceso a reportes estratégicos y financieros del bufete.',
        actions: ['Generar reportes ejecutivos', 'Ver análisis de rentabilidad', 'Exportar reportes personalizados', 'Programar envíos automáticos']
      },
      abogado_senior: {
        title: 'Informes Personales',
        description: 'Visualiza tu productividad, casos y tiempo registrado.',
        actions: ['Ver productividad personal', 'Analizar tiempo por caso', 'Exportar reportes propios', 'Ver estadísticas de casos']
      },
      administrador: {
        title: 'Informes Administrativos',
        description: 'Gestiona reportes operativos, de clientes y recursos.',
        actions: ['Generar reportes financieros', 'Ver estado de cobranza', 'Analizar recursos del bufete', 'Exportar datos administrativos']
      },
      contador: {
        title: 'Informes Contables y Fiscales',
        description: 'Acceso a reportes financieros, estados contables y fiscales.',
        actions: ['Generar estados financieros', 'Ver reportes fiscales', 'Analizar flujo de caja', 'Exportar para declaraciones']
      },
      abogado_junior: {
        title: 'Sin Acceso a Informes',
        description: 'Tu rol no tiene acceso al módulo de informes.',
        actions: ['Consulta tus casos en Expedientes', 'Registra tu tiempo en Tiempo', 'Ve tus tareas asignadas']
      },
      paralegal: {
        title: 'Sin Acceso a Informes',
        description: 'Tu rol no tiene acceso al módulo de informes.',
        actions: ['Consulta expedientes en colaboración', 'Actualiza trámites', 'Ve documentos de apoyo']
      },
      secretario: {
        title: 'Sin Acceso a Informes',
        description: 'Tu rol no tiene acceso al módulo de informes.',
        actions: ['Gestiona el archivo de expedientes', 'Actualiza información de clientes', 'Organiza documentación']
      },
      recepcionista: {
        title: 'Sin Acceso a Informes',
        description: 'Tu rol no tiene acceso al módulo de informes.',
        actions: ['Gestiona la agenda de citas', 'Atiende llamadas y visitas', 'Actualiza datos de contacto']
      },
    };

    return messages[role] || messages.recepcionista;
  };

  // Renderizar icono de KPI
  const renderKpiIcon = (iconName: string, color: string) => {
    const iconClass = {
      'blue': 'text-blue-500',
      'emerald': 'text-emerald-500',
      'amber': 'text-amber-500',
      'purple': 'text-purple-500',
      'red': 'text-red-500',
    }[color] || 'text-slate-500';

    const icons: Record<string, React.ReactNode> = {
      'Euro': <Euro className={`w-5 h-5 ${iconClass}`} />,
      'Briefcase': <Briefcase className={`w-5 h-5 ${iconClass}`} />,
      'Target': <Target className={`w-5 h-5 ${iconClass}`} />,
      'Clock': <Clock className={`w-5 h-5 ${iconClass}`} />,
      'TrendingUpIcon': <TrendingUpIcon className={`w-5 h-5 ${iconClass}`} />,
      'Calculator': <Calculator className={`w-5 h-5 ${iconClass}`} />,
      'Receipt': <Receipt className={`w-5 h-5 ${iconClass}`} />,
      'Wallet': <Wallet className={`w-5 h-5 ${iconClass}`} />,
      'DollarSign': <DollarSign className={`w-5 h-5 ${iconClass}`} />,
      'Users': <Users className={`w-5 h-5 ${iconClass}`} />,
    };

    return icons[iconName] || <FileText className={`w-5 h-5 ${iconClass}`} />;
  };

  // Si el rol no tiene acceso a informes
  const noAccessRoles: UserRole[] = ['abogado_junior', 'paralegal', 'secretario', 'recepcionista'];
  if (noAccessRoles.includes(role)) {
    const message = getRoleMessage();
    return (
      <AppLayout 
        title="Informes"
        subtitle="Acceso restringido"
      >
        <main className="flex-1 overflow-y-auto p-6 lg:p-8">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-2xl mx-auto mt-12"
          >
            <div className="p-8 bg-theme-card border border-theme rounded-2xl text-center">
              <div className="w-20 h-20 mx-auto mb-6 bg-theme-tertiary rounded-full flex items-center justify-center">
                <Lock className="w-10 h-10 text-theme-muted" />
              </div>
              <h2 className="text-2xl font-bold text-theme-primary mb-2">{message.title}</h2>
              <p className="text-theme-tertiary mb-6">{message.description}</p>
              
              <div className="p-4 bg-theme-tertiary rounded-xl text-left">
                <p className="text-sm font-medium text-theme-secondary mb-3">Acciones disponibles para tu rol:</p>
                <ul className="space-y-2">
                  {message.actions.map((action, idx) => (
                    <li key={idx} className="flex items-center gap-2 text-sm text-theme-tertiary">
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
      <select
        value={dateRange}
        onChange={(e) => setDateRange(e.target.value)}
        className="px-4 py-2 bg-theme-tertiary border border-theme rounded-xl text-theme-primary text-sm focus:outline-none focus:border-amber-500 transition-colors"
      >
        <option value="month">Este mes</option>
        <option value="quarter">Este trimestre</option>
        <option value="year">Este año</option>
        {permissions.canViewAll && <option value="all">Todo el tiempo</option>}
      </select>
      
      {permissions.canExport && (
        <button 
          onClick={() => setActiveModal('export')}
          className="hidden sm:flex items-center gap-2 px-4 py-2 bg-theme-tertiary border border-theme text-theme-primary font-medium rounded-xl hover:border-amber-500/30 transition-colors"
        >
          <Download className="w-4 h-4" />
          <span className="hidden lg:inline">Exportar</span>
        </button>
      )}
      
      {permissions.canCreateCustom && (
        <button 
          onClick={() => setActiveModal('custom')}
          className="hidden sm:flex items-center gap-2 px-4 py-2 bg-amber-500 text-slate-950 font-medium rounded-xl hover:bg-amber-400 transition-colors"
        >
          <Zap className="w-4 h-4" />
          <span className="hidden lg:inline">Personalizado</span>
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
          {filteredData.tabs.map((tab) => {
            const TabIcon = tab.id === 'overview' ? Activity : 
                           tab.id === 'financial' ? DollarSign :
                           tab.id === 'cases' ? Briefcase :
                           tab.id === 'productivity' ? Clock :
                           tab.id === 'clients' ? Users :
                           tab.id === 'tax' ? Receipt :
                           tab.id === 'cashflow' ? TrendingUp :
                           tab.id === 'time' ? Clock :
                           tab.id === 'resources' ? BarChart3 :
                           FileBarChart;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-4 py-2 rounded-xl text-sm font-medium transition-all flex items-center gap-2 ${
                  activeTab === tab.id
                    ? 'bg-amber-500 text-slate-950 shadow-lg shadow-amber-500/20'
                    : 'text-theme-tertiary hover:text-theme-primary hover:bg-theme-tertiary'
                }`}
              >
                <TabIcon className="w-4 h-4" />
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* KPIs - Cambian según el tab activo */}
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6"
          >
            {tabKPIs.map((kpi, index) => (
              <motion.div
                key={kpi.label}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05, duration: 0.3 }}
                whileHover={{ scale: 1.02, y: -2 }}
                className="p-5 bg-theme-card border border-theme rounded-2xl hover:border-amber-500/30 transition-all group cursor-pointer"
              >
                <div className="flex items-start justify-between mb-3">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                    kpi.color === 'blue' ? 'bg-blue-500/20' :
                    kpi.color === 'emerald' ? 'bg-emerald-500/20' :
                    kpi.color === 'amber' ? 'bg-amber-500/20' :
                    kpi.color === 'red' ? 'bg-red-500/20' :
                    'bg-purple-500/20'
                  }`}>
                    {renderKpiIcon(kpi.icon, kpi.color)}
                  </div>
                  <div className={`flex items-center gap-0.5 text-xs font-medium ${
                    kpi.trend === 'up' ? 'text-emerald-500' : 'text-red-500'
                  }`}>
                    {kpi.trend === 'up' ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                    {kpi.change}
                  </div>
                </div>
                <h3 className="text-2xl font-bold text-theme-primary mb-0.5">{kpi.value}</h3>
                <p className="text-theme-secondary text-sm">{kpi.label}</p>
                <p className="text-theme-muted text-xs mt-1">{kpi.description}</p>
              </motion.div>
            ))}
          </motion.div>
        </AnimatePresence>

        {/* Main Content Grid - Cambia según el tab activo */}
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            className="grid grid-cols-1 xl:grid-cols-3 gap-6"
          >
          {/* Left Column */}
          <div className="xl:col-span-2 space-y-6">
            {/* TAB: OVERVIEW - Resumen General */}
            {activeTab === 'overview' && filteredData.financialData && permissions.canViewFinancialData && (
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-theme-card border border-theme rounded-2xl p-6"
              >
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h2 className="text-lg font-semibold text-theme-primary">
                      {role === 'contador' ? 'Ingresos vs Gastos' : 'Facturación Mensual'}
                    </h2>
                    <p className="text-sm text-theme-tertiary mt-1">
                      {role === 'contador' ? 'Análisis contable del ejercicio' : 'Comparativa con objetivos mensuales'}
                    </p>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2 text-xs">
                      <div className="w-3 h-3 bg-amber-500 rounded-full" />
                      <span className="text-theme-tertiary">Real</span>
                    </div>
                    <div className="flex items-center gap-2 text-xs">
                      <div className="w-3 h-3 bg-slate-600 rounded-full" />
                      <span className="text-theme-tertiary">Objetivo</span>
                    </div>
                  </div>
                </div>
                
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={filteredData.financialData.monthlyRevenue} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                      <defs>
                        <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#F59E0B" stopOpacity={0.3}/>
                          <stop offset="95%" stopColor="#F59E0B" stopOpacity={0}/>
                        </linearGradient>
                        <linearGradient id="colorTarget" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.2}/>
                          <stop offset="95%" stopColor="#3B82F6" stopOpacity={0}/>
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" vertical={false} />
                      <XAxis 
                        dataKey="month" 
                        stroke="var(--color-text-tertiary)" 
                        fontSize={12} 
                        tickLine={false}
                        axisLine={false}
                      />
                      <YAxis 
                        stroke="var(--color-text-tertiary)" 
                        fontSize={12}
                        tickLine={false}
                        axisLine={false}
                        tickFormatter={(value) => `€${value / 1000}K`}
                      />
                      <Tooltip 
                        contentStyle={{ 
                          backgroundColor: 'var(--color-card)', 
                          border: '1px solid var(--color-border)', 
                          borderRadius: '12px',
                          boxShadow: '0 4px 12px rgba(0,0,0,0.15)'
                        }}
                        labelStyle={{ color: 'var(--color-text-secondary)', fontWeight: 600 }}
                        formatter={(value) => [`€${(value as number)?.toLocaleString() || 0}`, '']}
                      />
                      <Area 
                        type="monotone" 
                        dataKey="target" 
                        stroke="#3B82F6" 
                        fill="url(#colorTarget)" 
                        strokeWidth={2}
                        strokeDasharray="5 5"
                        name="Objetivo"
                      />
                      <Area 
                        type="monotone" 
                        dataKey="value" 
                        stroke="#F59E0B" 
                        fillOpacity={1} 
                        fill="url(#colorRevenue)" 
                        strokeWidth={2}
                        name="Real"
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </motion.div>
            )}

            {/* TAB: FINANCIAL - Contenido Financiero Detallado */}
            {activeTab === 'financial' && permissions.canViewFinancialData && (
              <>
                <motion.div 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-theme-card border border-theme rounded-2xl p-6"
                >
                  <h2 className="text-lg font-semibold text-theme-primary mb-6">Ingresos vs Gastos Mensual</h2>
                  <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={filteredData.financialData?.monthlyRevenue} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" vertical={false} />
                        <XAxis 
                          dataKey="month" 
                          stroke="var(--color-text-tertiary)" 
                          fontSize={12}
                          tickLine={false}
                          axisLine={false}
                        />
                        <YAxis 
                          stroke="var(--color-text-tertiary)" 
                          fontSize={12}
                          tickLine={false}
                          axisLine={false}
                          tickFormatter={(value) => `€${value / 1000}K`}
                        />
                        <Tooltip 
                          contentStyle={{ 
                            backgroundColor: 'var(--color-card)', 
                            border: '1px solid var(--color-border)', 
                            borderRadius: '12px',
                            boxShadow: '0 4px 12px rgba(0,0,0,0.15)'
                          }}
                          labelStyle={{ color: 'var(--color-text-secondary)', fontWeight: 600 }}
                          formatter={(value) => [`€${(value as number)?.toLocaleString() || 0}`, '']}
                        />
                        <Bar dataKey="value" name="Ingresos" fill="#10B981" radius={[4, 4, 0, 0]} />
                        <Bar dataKey={(data) => data.value * 0.4} name="Gastos" fill="#EF4444" radius={[4, 4, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                  <div className="flex items-center gap-6 mt-6 pt-4 border-t border-theme">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 bg-emerald-500 rounded-full" />
                      <span className="text-sm text-theme-tertiary">Ingresos</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 bg-red-500 rounded-full" />
                      <span className="text-sm text-theme-tertiary">Gastos</span>
                    </div>
                  </div>
                </motion.div>

                <motion.div 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 }}
                  className="bg-theme-card border border-theme rounded-2xl p-6"
                >
                  <h2 className="text-lg font-semibold text-theme-primary mb-4">Desglose de Gastos</h2>
                  <div className="flex items-center gap-6">
                    <div className="w-48 h-48">
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie
                            data={[
                              { name: 'Personal', value: 145000, percentage: 67 },
                              { name: 'Operaciones', value: 38500, percentage: 18 },
                              { name: 'Marketing', value: 21500, percentage: 10 },
                              { name: 'Otros', value: 11000, percentage: 5 },
                            ]}
                            cx="50%"
                            cy="50%"
                            innerRadius={50}
                            outerRadius={80}
                            paddingAngle={2}
                            dataKey="value"
                          >
                            {[0, 1, 2, 3].map((index) => (
                              <Cell key={`cell-${index}`} fill={EXPENSE_COLORS[index]} />
                            ))}
                          </Pie>
                          <Tooltip 
                            contentStyle={{ 
                              backgroundColor: 'var(--color-card)', 
                              border: '1px solid var(--color-border)', 
                              borderRadius: '12px',
                              boxShadow: '0 4px 12px rgba(0,0,0,0.15)'
                            }}
                            formatter={(value) => [`€${(value as number)?.toLocaleString() || 0}`, '']}
                          />
                        </PieChart>
                      </ResponsiveContainer>
                    </div>
                    <div className="flex-1 space-y-3">
                      {[
                        { category: 'Personal', amount: '€145,000', percentage: 67, color: 'bg-blue-500' },
                        { category: 'Operaciones', amount: '€38,500', percentage: 18, color: 'bg-emerald-500' },
                        { category: 'Marketing', amount: '€21,500', percentage: 10, color: 'bg-amber-500' },
                        { category: 'Otros', amount: '€11,000', percentage: 5, color: 'bg-purple-500' },
                      ].map((item) => (
                        <div key={item.category} className="flex items-center gap-3">
                          <div className={`w-3 h-3 ${item.color} rounded-full`} />
                          <div className="flex-1">
                            <div className="flex items-center justify-between">
                              <span className="text-sm text-theme-secondary">{item.category}</span>
                              <span className="text-xs text-theme-tertiary">{item.amount}</span>
                            </div>
                          </div>
                          <span className="text-sm font-medium text-theme-secondary w-10 text-right">{item.percentage}%</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </motion.div>
              </>
            )}

            {/* TAB: CASES - Contenido de Expedientes */}
            {activeTab === 'cases' && permissions.canViewAllCases && (
              <>
                <div className="bg-theme-card border border-theme rounded-2xl p-6">
                  <h2 className="text-lg font-semibold text-theme-primary mb-6">Expedientes por Estado</h2>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {[
                      { status: 'En trámite', count: 45, color: 'bg-blue-500', icon: Briefcase },
                      { status: 'Pendientes', count: 23, color: 'bg-amber-500', icon: Clock },
                      { status: 'Urgentes', count: 8, color: 'bg-red-500', icon: AlertCircle },
                      { status: 'Resueltos', count: 127, color: 'bg-emerald-500', icon: Target },
                    ].map((item) => (
                      <div key={item.status} className="p-4 bg-theme-tertiary rounded-xl">
                        <div className={`w-10 h-10 ${item.color} rounded-lg flex items-center justify-center mb-3`}>
                          <item.icon className="w-5 h-5 text-white" />
                        </div>
                        <p className="text-2xl font-bold text-theme-primary">{item.count}</p>
                        <p className="text-sm text-theme-secondary">{item.status}</p>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="bg-theme-card border border-theme rounded-2xl p-6">
                  <h2 className="text-lg font-semibold text-theme-primary mb-4">Expedientes por Tipo de Caso</h2>
                  <div className="space-y-4">
                    {filteredData.financialData?.caseTypes.map((type) => (
                      <div key={type.type} className="flex items-center gap-4">
                        <div className="flex-1">
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-sm text-theme-secondary">{type.type}</span>
                            <span className="text-xs text-emerald-400">{type.amount}</span>
                          </div>
                          <div className="h-2 bg-theme-tertiary rounded-full overflow-hidden">
                            <div className={`h-full ${type.color} rounded-full`} style={{ width: `${type.percentage}%` }} />
                          </div>
                        </div>
                        <span className="text-sm font-medium text-theme-secondary w-12 text-right">{type.count}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="bg-theme-card border border-theme rounded-2xl p-6">
                  <h2 className="text-lg font-semibold text-theme-primary mb-4">Próximos Vencimientos</h2>
                  <div className="space-y-3">
                    {[
                      { expediente: 'CASO-2026-0145', cliente: 'García López S.L.', vencimiento: '15 Feb 2026', tipo: 'Escrito', urgency: 'high' },
                      { expediente: 'CASO-2026-0138', cliente: 'Martínez Ruiz', vencimiento: '18 Feb 2026', tipo: 'Audiencia', urgency: 'medium' },
                      { expediente: 'CASO-2026-0122', cliente: 'Constructora ABC', vencimiento: '22 Feb 2026', tipo: 'Plazo', urgency: 'low' },
                      { expediente: 'CASO-2026-0118', cliente: 'Tech Solutions', vencimiento: '28 Feb 2026', tipo: 'Presentación', urgency: 'low' },
                    ].map((item, idx) => (
                      <div key={idx} className="flex items-center justify-between p-3 bg-theme-tertiary rounded-xl">
                        <div>
                          <p className="text-sm font-medium text-theme-primary">{item.expediente}</p>
                          <p className="text-xs text-theme-muted">{item.cliente}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-sm text-theme-secondary">{item.vencimiento}</p>
                          <p className={`text-xs ${item.urgency === 'high' ? 'text-red-400' : item.urgency === 'medium' ? 'text-amber-400' : 'text-theme-muted'}`}>
                            {item.tipo}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </>
            )}

            {/* TAB: PRODUCTIVITY - Contenido de Productividad */}
            {activeTab === 'productivity' && permissions.canViewProductivity && (
              <>
                <div className="bg-theme-card border border-theme rounded-2xl p-6">
                  <h2 className="text-lg font-semibold text-theme-primary mb-6">Horas por Abogado</h2>
                  <div className="space-y-4">
                    {[
                      { name: 'Ana García', hours: 168, target: 160, efficiency: 105 },
                      { name: 'Carlos López', hours: 152, target: 160, efficiency: 95 },
                      { name: 'María Ruiz', hours: 175, target: 160, efficiency: 109 },
                      { name: 'Juan Martínez', hours: 148, target: 160, efficiency: 93 },
                      { name: 'Laura Sánchez', hours: 162, target: 160, efficiency: 101 },
                    ].map((lawyer) => (
                      <div key={lawyer.name} className="flex items-center gap-4">
                        <div className="w-10 h-10 bg-amber-500/20 rounded-full flex items-center justify-center">
                          <span className="text-sm font-medium text-amber-500">{lawyer.name.split(' ').map(n => n[0]).join('')}</span>
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-sm text-theme-secondary">{lawyer.name}</span>
                            <span className="text-xs text-theme-tertiary">{lawyer.hours}h / {lawyer.target}h</span>
                          </div>
                          <div className="h-2 bg-theme-tertiary rounded-full overflow-hidden">
                            <div 
                              className={`h-full rounded-full ${lawyer.efficiency >= 100 ? 'bg-emerald-500' : 'bg-amber-500'}`} 
                              style={{ width: `${Math.min(lawyer.efficiency, 100)}%` }} 
                            />
                          </div>
                        </div>
                        <span className={`text-sm font-medium ${lawyer.efficiency >= 100 ? 'text-emerald-400' : 'text-amber-400'}`}>
                          {lawyer.efficiency}%
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="bg-theme-card border border-theme rounded-2xl p-6">
                  <h2 className="text-lg font-semibold text-theme-primary mb-4">Distribución de Actividades</h2>
                  <div className="space-y-4">
                    {[
                      { activity: 'Trabajo legal', hours: 1420, percentage: 50, color: 'bg-blue-500' },
                      { activity: 'Reuniones', hours: 426, percentage: 15, color: 'bg-emerald-500' },
                      { activity: 'Investigación', hours: 355, percentage: 12.5, color: 'bg-amber-500' },
                      { activity: 'Documentación', hours: 426, percentage: 15, color: 'bg-purple-500' },
                      { activity: 'Administrativo', hours: 213, percentage: 7.5, color: 'bg-red-500' },
                    ].map((item) => (
                      <div key={item.activity} className="flex items-center gap-4">
                        <div className="flex-1">
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-sm text-theme-secondary">{item.activity}</span>
                            <span className="text-xs text-theme-tertiary">{item.hours}h</span>
                          </div>
                          <div className="h-2 bg-theme-tertiary rounded-full overflow-hidden">
                            <div className={`h-full ${item.color} rounded-full`} style={{ width: `${item.percentage}%` }} />
                          </div>
                        </div>
                        <span className="text-sm font-medium text-theme-secondary w-12 text-right">{item.percentage}%</span>
                      </div>
                    ))}
                  </div>
                </div>
              </>
            )}

            {/* TAB: KPIs - M10: Informes Personalizados y Benchmarks */}
            {activeTab === 'kpis' && (
              <>
                {/* Lawyer Selection */}
                <div className="bg-theme-card border border-theme rounded-2xl p-6 mb-6">
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="text-lg font-semibold text-theme-primary">KPIs por Abogado</h2>
                    <button
                      onClick={loadLawyerKPIs}
                      disabled={kpisLoading}
                      className="px-4 py-2 bg-amber-500 text-slate-950 font-medium rounded-xl hover:bg-amber-400 transition-colors disabled:opacity-50"
                    >
                      {kpisLoading ? 'Cargando...' : 'Actualizar KPIs'}
                    </button>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                    <div className="p-4 bg-theme-tertiary rounded-xl">
                      <p className="text-sm text-theme-secondary mb-1">Total Facturado</p>
                      <p className="text-2xl font-bold text-emerald-400">{lawyerKPIs ? `€${lawyerKPIs.totalBilled.toLocaleString()}` : '€0'}</p>
                    </div>
                    <div className="p-4 bg-theme-tertiary rounded-xl">
                      <p className="text-sm text-theme-secondary mb-1">Total Cobrado</p>
                      <p className="text-2xl font-bold text-blue-400">{lawyerKPIs ? `€${lawyerKPIs.totalCollected.toLocaleString()}` : '€0'}</p>
                    </div>
                    <div className="p-4 bg-theme-tertiary rounded-xl">
                      <p className="text-sm text-theme-secondary mb-1">Horas Trabajadas</p>
                      <p className="text-2xl font-bold text-amber-400">{lawyerKPIs ? lawyerKPIs.totalHoursWorked : 0}h</p>
                    </div>
                    <div className="p-4 bg-theme-tertiary rounded-xl">
                      <p className="text-sm text-theme-secondary mb-1">Tasa Efectiva/Hora</p>
                      <p className="text-2xl font-bold text-purple-400">{lawyerKPIs ? `€${lawyerKPIs.effectiveHourlyRate.toFixed(2)}` : '€0'}</p>
                    </div>
                  </div>

                  {/* Benchmarks vs Objetivos */}
                  <h3 className="text-md font-semibold text-theme-primary mb-4">Benchmarks vs Objetivos</h3>
                  <div className="space-y-3">
                    {benchmarks.map((benchmark) => (
                      <div key={benchmark.id} className="flex items-center gap-4 p-3 bg-theme-tertiary/50 rounded-xl">
                        <div className="flex-1">
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-sm font-medium text-theme-primary">{benchmark.name}</span>
                            <span className={`text-xs px-2 py-0.5 rounded-full ${
                              benchmark.status === 'above' ? 'bg-emerald-500/20 text-emerald-400' :
                              benchmark.status === 'below' ? 'bg-red-500/20 text-red-400' :
                              'bg-amber-500/20 text-amber-400'
                            }`}>
                              {benchmark.status === 'above' ? '✓ Sobre objetivo' : 
                               benchmark.status === 'below' ? '✗ Bajo objetivo' : 'En camino'}
                            </span>
                          </div>
                          <div className="flex items-center gap-2 text-sm text-theme-secondary">
                            <span>Objetivo: {benchmark.target.toLocaleString()}</span>
                            <span>→</span>
                            <span className="font-medium text-theme-primary">Actual: {benchmark.actual.toLocaleString()}</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Custom Reports */}
                <div className="bg-theme-card border border-theme rounded-2xl p-6">
                  <h2 className="text-lg font-semibold text-theme-primary mb-6">Informes Personalizados</h2>
                  
                  {/* Create new report */}
                  <div className="flex gap-3 mb-6">
                    <input
                      type="text"
                      value={reportName}
                      onChange={(e) => setReportName(e.target.value)}
                      placeholder="Nombre del informe..."
                      className="flex-1 px-4 py-2 bg-theme-tertiary border border-theme rounded-xl text-theme-primary placeholder-theme-muted focus:outline-none focus:border-amber-500"
                    />
                    <select
                      value={reportType}
                      onChange={(e) => setReportType(e.target.value as any)}
                      className="px-4 py-2 bg-theme-tertiary border border-theme rounded-xl text-theme-primary focus:outline-none focus:border-amber-500"
                    >
                      <option value="lawyer">Por Abogado</option>
                      <option value="case">Por Caso</option>
                      <option value="financial">Financiero</option>
                    </select>
                    <button
                      onClick={createCustomReport}
                      disabled={!reportName.trim()}
                      className="px-4 py-2 bg-emerald-500 text-white font-medium rounded-xl hover:bg-emerald-400 transition-colors disabled:opacity-50"
                    >
                      Crear
                    </button>
                  </div>

                  {/* Saved reports */}
                  <div className="space-y-2">
                    {customReports.length === 0 ? (
                      <p className="text-center text-theme-muted py-8">No hay informes personalizados. Crea uno nuevo arriba.</p>
                    ) : (
                      customReports.map((report) => (
                        <div key={report.id} className="flex items-center justify-between p-4 bg-theme-tertiary/50 rounded-xl">
                          <div>
                            <p className="font-medium text-theme-primary">{report.name}</p>
                            <p className="text-sm text-theme-secondary">{report.type} • Creado: {new Date(report.createdAt).toLocaleDateString('es-ES')}</p>
                          </div>
                          <div className="flex gap-2">
                            <button
                              onClick={() => executeCustomReport(report.id)}
                              className="p-2 text-theme-secondary hover:text-amber-500 hover:bg-amber-500/10 rounded-lg transition-colors"
                            >
                              <Play className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => {
                                reportsService.deleteCustomReport(report.id);
                                loadCustomReports();
                              }}
                              className="p-2 text-theme-secondary hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </>
            )}

            {/* TAB: CLIENTS - Contenido de Clientes */}
            {activeTab === 'clients' && permissions.canViewAllClients && (
              <>
                <div className="bg-theme-card border border-theme rounded-2xl p-6">
                  <h2 className="text-lg font-semibold text-theme-primary mb-6">Clientes por Categoría</h2>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {[
                      { category: 'Corporativos', count: 45, color: 'bg-blue-500' },
                      { category: 'Particulares', count: 78, color: 'bg-emerald-500' },
                      { category: 'PYMES', count: 23, color: 'bg-amber-500' },
                      { category: 'Institucionales', count: 10, color: 'bg-purple-500' },
                    ].map((item) => (
                      <div key={item.category} className="p-4 bg-theme-tertiary rounded-xl">
                        <div className={`w-10 h-10 ${item.color} rounded-lg flex items-center justify-center mb-3`}>
                          <Users className="w-5 h-5 text-white" />
                        </div>
                        <p className="text-2xl font-bold text-theme-primary">{item.count}</p>
                        <p className="text-sm text-theme-secondary">{item.category}</p>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="bg-theme-card border border-theme rounded-2xl p-6">
                  <h2 className="text-lg font-semibold text-theme-primary mb-4">Top Clientes por Facturación</h2>
                  <div className="space-y-3">
                    {[
                      { name: 'Constructora ABC S.A.', facturado: '€85,400', expedientes: 12, trend: 'up' },
                      { name: 'Tech Solutions SL', facturado: '€62,300', expedientes: 8, trend: 'up' },
                      { name: 'García López Holdings', facturado: '€48,750', expedientes: 5, trend: 'down' },
                      { name: 'Inmobiliaria Norte', facturado: '€41,200', expedientes: 6, trend: 'up' },
                      { name: 'Distribuidora Express', facturado: '€35,800', expedientes: 4, trend: 'stable' },
                    ].map((client, idx) => (
                      <div key={idx} className="flex items-center justify-between p-3 bg-theme-tertiary rounded-xl">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 bg-amber-500/20 rounded-full flex items-center justify-center">
                            <span className="text-xs font-medium text-amber-500">{idx + 1}</span>
                          </div>
                          <div>
                            <p className="text-sm font-medium text-theme-primary">{client.name}</p>
                            <p className="text-xs text-theme-muted">{client.expedientes} expedientes</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-medium text-emerald-400">{client.facturado}</p>
                          <div className={`flex items-center justify-end gap-1 text-xs ${
                            client.trend === 'up' ? 'text-emerald-400' : client.trend === 'down' ? 'text-red-400' : 'text-theme-muted'
                          }`}>
                            {client.trend === 'up' ? <TrendingUp className="w-3 h-3" /> : client.trend === 'down' ? <TrendingDown className="w-3 h-3" /> : null}
                            {client.trend === 'up' ? 'Subiendo' : client.trend === 'down' ? 'Bajando' : 'Estable'}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="bg-theme-card border border-theme rounded-2xl p-6">
                  <h2 className="text-lg font-semibold text-theme-primary mb-4">Satisfacción del Cliente</h2>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-xl text-center">
                      <p className="text-3xl font-bold text-emerald-400">4.7</p>
                      <p className="text-sm text-theme-secondary">Valoración media</p>
                      <p className="text-xs text-theme-muted mt-1">de 5.0</p>
                    </div>
                    <div className="p-4 bg-blue-500/10 border border-blue-500/20 rounded-xl text-center">
                      <p className="text-3xl font-bold text-blue-400">94%</p>
                      <p className="text-sm text-theme-secondary">Tasa retención</p>
                      <p className="text-xs text-theme-muted mt-1">clientes recurrentes</p>
                    </div>
                    <div className="p-4 bg-amber-500/10 border border-amber-500/20 rounded-xl text-center">
                      <p className="text-3xl font-bold text-amber-400">24</p>
                      <p className="text-sm text-theme-secondary">Nuevos clientes</p>
                      <p className="text-xs text-theme-muted mt-1">este trimestre</p>
                    </div>
                  </div>
                </div>
              </>
            )}

            {/* Contador - Estados Financieros (solo para overview) */}
            {activeTab === 'overview' && role === 'contador' && (
              <div className="bg-theme-card border border-theme rounded-2xl p-6">
                <h2 className="text-lg font-semibold text-theme-primary mb-4">Resumen Contable del Trimestre</h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-xl">
                    <p className="text-sm text-emerald-400 mb-1">Activo Corriente</p>
                    <p className="text-2xl font-bold text-theme-primary">€485K</p>
                    <p className="text-xs text-theme-muted mt-1">+12% vs trim anterior</p>
                  </div>
                  <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-xl">
                    <p className="text-sm text-red-400 mb-1">Pasivo Corriente</p>
                    <p className="text-2xl font-bold text-theme-primary">€125K</p>
                    <p className="text-xs text-theme-muted mt-1">-5% vs trim anterior</p>
                  </div>
                  <div className="p-4 bg-blue-500/10 border border-blue-500/20 rounded-xl">
                    <p className="text-sm text-blue-400 mb-1">Patrimonio Neto</p>
                    <p className="text-2xl font-bold text-theme-primary">€360K</p>
                    <p className="text-xs text-theme-muted mt-1">+18% vs trim anterior</p>
                  </div>
                </div>
              </div>
            )}

            {/* Abogado Senior - Rendimiento Personal */}
            {role === 'abogado_senior' && (
              <div className="bg-theme-card border border-theme rounded-2xl p-6">
                <h2 className="text-lg font-semibold text-theme-primary mb-4">Distribución de Mi Tiempo</h2>
                <div className="space-y-4">
                  {[
                    { activity: 'Preparación de documentos', hours: 45, percentage: 35, color: 'bg-blue-500' },
                    { activity: 'Reuniones con clientes', hours: 28, percentage: 22, color: 'bg-emerald-500' },
                    { activity: 'Investigación legal', hours: 24, percentage: 19, color: 'bg-amber-500' },
                    { activity: 'Audiencias y trámites', hours: 18, percentage: 14, color: 'bg-purple-500' },
                    { activity: 'Supervisión de equipo', hours: 13, percentage: 10, color: 'bg-red-500' },
                  ].map((item) => (
                    <div key={item.activity} className="flex items-center gap-4">
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-sm text-theme-secondary">{item.activity}</span>
                          <span className="text-xs text-theme-tertiary">{item.hours}h</span>
                        </div>
                        <div className="h-2 bg-theme-tertiary rounded-full overflow-hidden">
                          <div className={`h-full ${item.color} rounded-full`} style={{ width: `${item.percentage}%` }} />
                        </div>
                      </div>
                      <span className="text-sm font-medium text-theme-secondary w-12 text-right">{item.percentage}%</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Administrador - Rendimiento de Recursos */}
            {role === 'administrador' && (
              <div className="bg-theme-card border border-theme rounded-2xl p-6">
                <h2 className="text-lg font-semibold text-theme-primary mb-4">Estado de Recursos</h2>
                <div className="space-y-4">
                  {[
                    { resource: 'Sala de Juntas A', status: 'Disponible', next: '14:00 - Reunión García', color: 'emerald' },
                    { resource: 'Sala de Juntas B', status: 'Ocupada', next: '16:00 - Disponible', color: 'red' },
                    { resource: 'Vehículo Corporativo', status: 'En uso', next: 'Mañana - Disponible', color: 'amber' },
                    { resource: 'Sala de Conferencias', status: 'Disponible', next: 'Sin reservas', color: 'emerald' },
                  ].map((item) => (
                    <div key={item.resource} className="flex items-center justify-between p-3 bg-theme-tertiary rounded-xl">
                      <div>
                        <p className="text-sm font-medium text-theme-primary">{item.resource}</p>
                        <p className="text-xs text-theme-muted">Próximo: {item.next}</p>
                      </div>
                      <span className={`px-3 py-1 text-xs font-medium rounded-full ${
                        item.color === 'emerald' ? 'bg-emerald-500/20 text-emerald-400' :
                        item.color === 'red' ? 'bg-red-500/20 text-red-400' :
                        'bg-amber-500/20 text-amber-400'
                      }`}>
                        {item.status}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Quarterly Performance - Solo para roles con acceso financiero completo */}
            {filteredData.financialData && permissions.canViewFinancialData && role !== 'abogado_senior' && (
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="bg-theme-card border border-theme rounded-2xl p-6"
              >
                <h2 className="text-lg font-semibold text-theme-primary mb-6">
                  {role === 'contador' ? 'Rendimiento Contable Trimestral' : 'Rendimiento Trimestral'}
                </h2>
                <div className="space-y-4">
                  {filteredData.financialData.quarterlyPerformance.map((quarter, index) => (
                    <div key={quarter.quarter} className="relative">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium text-theme-primary">{quarter.quarter}</span>
                        <div className="flex items-center gap-4 text-sm">
                          <span className="text-emerald-500">Ingresos: €{quarter.revenue.toLocaleString()}</span>
                          <span className="text-red-400">Gastos: €{quarter.expenses.toLocaleString()}</span>
                          <span className="text-amber-500 font-medium">Beneficio: €{quarter.profit.toLocaleString()}</span>
                        </div>
                      </div>
                      <div className="h-4 bg-theme-tertiary rounded-full overflow-hidden flex">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${(quarter.revenue / 200000) * 100}%` }}
                          transition={{ delay: index * 0.1, duration: 0.5 }}
                          className="h-full bg-emerald-500"
                        />
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${(quarter.expenses / 200000) * 100}%` }}
                          transition={{ delay: index * 0.1 + 0.1, duration: 0.5 }}
                          className="h-full bg-red-500"
                        />
                      </div>
                    </div>
                  ))}
                </div>
                <div className="flex items-center gap-6 mt-6 pt-4 border-t border-theme">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-emerald-500 rounded-full" />
                    <span className="text-sm text-theme-tertiary">Ingresos</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-red-500 rounded-full" />
                    <span className="text-sm text-theme-tertiary">Gastos</span>
                  </div>
                </div>
              </motion.div>
            )}
          </div>

          {/* Right Column */}
          <div className="space-y-6">
            {/* Case Types - Solo para roles con acceso a expedientes */}
            {filteredData.financialData && permissions.canViewAllCases && (
              <div className="bg-theme-card border border-theme rounded-2xl p-6">
                <h2 className="text-lg font-semibold text-theme-primary mb-4">Distribución por Tipo</h2>
                <div className="space-y-4">
                  {filteredData.financialData.caseTypes.map((type) => (
                    <div key={type.type} className="flex items-center gap-3">
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-sm text-theme-secondary">{type.type}</span>
                          <span className="text-xs text-emerald-400">{type.amount}</span>
                        </div>
                        <div className="h-2 bg-theme-tertiary rounded-full overflow-hidden">
                          <div className={`h-full ${type.color} rounded-full`} style={{ width: `${type.percentage}%` }} />
                        </div>
                        <div className="flex items-center justify-between mt-1">
                          <span className="text-xs text-theme-muted">{type.count} casos</span>
                          <span className="text-xs text-theme-tertiary">{type.percentage}%</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Abogado Senior - Mis Casos Activos */}
            {role === 'abogado_senior' && (
              <div className="bg-theme-card border border-theme rounded-2xl p-6">
                <h2 className="text-lg font-semibold text-theme-primary mb-4">Mis Casos por Estado</h2>
                <div className="space-y-3">
                  {[
                    { status: 'Activos', count: 8, color: 'bg-emerald-500', textColor: 'text-emerald-400' },
                    { status: 'Pendientes', count: 2, color: 'bg-amber-500', textColor: 'text-amber-400' },
                    { status: 'Urgentes', count: 2, color: 'bg-red-500', textColor: 'text-red-400' },
                    { status: 'En revisión', count: 3, color: 'bg-blue-500', textColor: 'text-blue-400' },
                  ].map((item) => (
                    <div key={item.status} className="flex items-center justify-between p-3 bg-theme-tertiary rounded-xl">
                      <div className="flex items-center gap-3">
                        <div className={`w-3 h-3 ${item.color} rounded-full`} />
                        <span className="text-sm text-theme-secondary">{item.status}</span>
                      </div>
                      <span className={`text-sm font-medium ${item.textColor}`}>{item.count}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Recent Reports */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="bg-theme-card border border-theme rounded-2xl p-6"
            >
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-theme-primary">
                  {role === 'abogado_senior' ? 'Mis Informes Recientes' : 'Informes Recientes'}
                </h2>
                <button 
                  onClick={() => showToast('Mostrando todos los informes...', 'info')}
                  className="text-sm text-amber-500 hover:text-amber-400"
                >
                  Ver todos
                </button>
              </div>
              <div className="space-y-3">
                {filteredData.reports.map((report, idx) => (
                  <motion.div
                    key={report.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: idx * 0.05 }}
                    whileHover={{ scale: 1.01 }}
                    className="p-3 bg-theme-tertiary rounded-xl hover:bg-theme-hover transition-colors group cursor-pointer"
                  >
                    <div className="flex items-start gap-3">
                      <div className="w-10 h-10 bg-amber-500/20 rounded-lg flex items-center justify-center flex-shrink-0">
                        <FileText className="w-5 h-5 text-amber-500" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-theme-primary group-hover:text-amber-500 transition-colors truncate">
                          {report.title}
                        </p>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="text-xs text-theme-muted">{report.type}</span>
                          <span className="text-xs text-theme-muted">•</span>
                          <span className="text-xs text-theme-muted">{report.date}</span>
                        </div>
                      </div>
                      {permissions.canExport && (
                        <button 
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedReport(report.id);
                            setActiveModal('export');
                          }}
                          className="p-2 text-theme-tertiary hover:text-theme-primary hover:bg-theme-hover rounded-lg transition-colors opacity-0 group-hover:opacity-100"
                        >
                          <Download className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </motion.div>
                ))}
              </div>
              
              {(permissions.canGenerateAll || permissions.canGeneratePersonal || permissions.canGenerateFinancial) && (
                <button 
                  onClick={() => setActiveModal('generate')}
                  className="w-full mt-4 py-3 border border-dashed border-theme text-theme-tertiary rounded-xl hover:border-amber-500/30 hover:text-theme-primary transition-colors text-sm font-medium flex items-center justify-center gap-2"
                >
                  <Zap className="w-4 h-4" />
                  Generar nuevo informe
                </button>
              )}
            </motion.div>

            {/* Quick Actions */}
            <div className="bg-gradient-to-br from-amber-500/10 to-amber-600/5 border border-amber-500/20 rounded-2xl p-6">
              <h2 className="text-lg font-semibold text-theme-primary mb-4">Acciones Rápidas</h2>
              <div className="space-y-2">
                {/* Acciones según rol */}
                {permissions.canExport && (
                  <button 
                    onClick={() => setActiveModal('export')}
                    className="w-full p-3 bg-theme-card border border-theme rounded-xl hover:border-amber-500/30 hover:bg-theme-hover transition-all text-left flex items-center gap-3 group"
                  >
                    <Download className="w-4 h-4 text-theme-tertiary group-hover:text-amber-500 transition-colors" />
                    <span className="text-sm text-theme-secondary group-hover:text-theme-primary">Exportar informe</span>
                    <ArrowUpRight className="w-4 h-4 text-theme-muted ml-auto opacity-0 group-hover:opacity-100 transition-opacity" />
                  </button>
                )}
                
                {permissions.canSchedule && (
                  <button 
                    onClick={() => setActiveModal('schedule')}
                    className="w-full p-3 bg-theme-card border border-theme rounded-xl hover:border-amber-500/30 hover:bg-theme-hover transition-all text-left flex items-center gap-3 group"
                  >
                    <CalendarDays className="w-4 h-4 text-theme-tertiary group-hover:text-amber-500 transition-colors" />
                    <span className="text-sm text-theme-secondary group-hover:text-theme-primary">Programar informe</span>
                    <ArrowUpRight className="w-4 h-4 text-theme-muted ml-auto opacity-0 group-hover:opacity-100 transition-opacity" />
                  </button>
                )}
                
                {role === 'contador' && (
                  <>
                    <button 
                      onClick={() => setActiveModal('balance')}
                      className="w-full p-3 bg-theme-card border border-theme rounded-xl hover:border-amber-500/30 hover:bg-theme-hover transition-all text-left flex items-center gap-3 group"
                    >
                      <Calculator className="w-4 h-4 text-theme-tertiary group-hover:text-amber-500 transition-colors" />
                      <span className="text-sm text-theme-secondary group-hover:text-theme-primary">Generar balance</span>
                      <ArrowUpRight className="w-4 h-4 text-theme-muted ml-auto opacity-0 group-hover:opacity-100 transition-opacity" />
                    </button>
                    <button 
                      onClick={() => setActiveModal('iva')}
                      className="w-full p-3 bg-theme-card border border-theme rounded-xl hover:border-amber-500/30 hover:bg-theme-hover transition-all text-left flex items-center gap-3 group"
                    >
                      <Receipt className="w-4 h-4 text-theme-tertiary group-hover:text-amber-500 transition-colors" />
                      <span className="text-sm text-theme-secondary group-hover:text-theme-primary">Declaración IVA</span>
                      <ArrowUpRight className="w-4 h-4 text-theme-muted ml-auto opacity-0 group-hover:opacity-100 transition-opacity" />
                    </button>
                  </>
                )}
                
                {role === 'abogado_senior' && (
                  <>
                    <button 
                      onClick={() => setActiveModal('timeReport')}
                      className="w-full p-3 bg-theme-card border border-theme rounded-xl hover:border-amber-500/30 hover:bg-theme-hover transition-all text-left flex items-center gap-3 group"
                    >
                      <Clock className="w-4 h-4 text-theme-tertiary group-hover:text-amber-500 transition-colors" />
                      <span className="text-sm text-theme-secondary group-hover:text-theme-primary">Reporte de tiempo</span>
                      <ArrowUpRight className="w-4 h-4 text-theme-muted ml-auto opacity-0 group-hover:opacity-100 transition-opacity" />
                    </button>
                    <button 
                      onClick={() => setActiveModal('caseStatus')}
                      className="w-full p-3 bg-theme-card border border-theme rounded-xl hover:border-amber-500/30 hover:bg-theme-hover transition-all text-left flex items-center gap-3 group"
                    >
                      <Briefcase className="w-4 h-4 text-theme-tertiary group-hover:text-amber-500 transition-colors" />
                      <span className="text-sm text-theme-secondary group-hover:text-theme-primary">Estado de casos</span>
                      <ArrowUpRight className="w-4 h-4 text-theme-muted ml-auto opacity-0 group-hover:opacity-100 transition-opacity" />
                    </button>
                  </>
                )}
                
                <button 
                  onClick={() => setActiveModal('compare')}
                  className="w-full p-3 bg-theme-card border border-theme rounded-xl hover:border-amber-500/30 hover:bg-theme-hover transition-all text-left flex items-center gap-3 group"
                >
                  <BarChart3 className="w-4 h-4 text-theme-tertiary group-hover:text-amber-500 transition-colors" />
                  <span className="text-sm text-theme-secondary group-hover:text-theme-primary">Comparar períodos</span>
                  <ArrowUpRight className="w-4 h-4 text-theme-muted ml-auto opacity-0 group-hover:opacity-100 transition-opacity" />
                </button>
                
                {permissions.canViewAll && (
                  <button 
                    onClick={() => setActiveModal('alerts')}
                    className="w-full p-3 bg-theme-card border border-theme rounded-xl hover:border-amber-500/30 hover:bg-theme-hover transition-all text-left flex items-center gap-3 group"
                  >
                    <AlertCircle className="w-4 h-4 text-theme-tertiary group-hover:text-amber-500 transition-colors" />
                    <span className="text-sm text-theme-secondary group-hover:text-theme-primary">Configurar alertas</span>
                    <ArrowUpRight className="w-4 h-4 text-theme-muted ml-auto opacity-0 group-hover:opacity-100 transition-opacity" />
                  </button>
                )}
              </div>
            </div>

            {/* Info del rol */}
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="p-4 bg-theme-card border border-theme rounded-xl"
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
                  <p className="text-xs text-theme-tertiary mt-1">
                    {getRoleMessage().description}
                  </p>
                </div>
              </div>
            </motion.div>
          </div>
          </motion.div>
        </AnimatePresence>
      </main>

      {/* Toast Notification */}
      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 50 }}
            className={`fixed bottom-6 right-6 z-50 px-4 py-3 rounded-xl shadow-lg flex items-center gap-3 ${
              toast.type === 'success' ? 'bg-emerald-500' : 'bg-amber-500'
            } text-slate-950 font-medium`}
          >
            <CheckCircle className="w-5 h-5" />
            {toast.message}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Modal: Exportar */}
      <AnimatePresence>
        {activeModal === 'export' && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => setActiveModal(null)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-slate-900 border border-slate-800 rounded-2xl p-6 w-full max-w-md"
              onClick={e => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-white">Exportar Informe</h3>
                <button onClick={() => setActiveModal(null)} className="p-1 text-slate-400 hover:text-white">
                  <X className="w-5 h-5" />
                </button>
              </div>
              
              <div className="space-y-4">
                <div className="p-4 bg-slate-800/50 rounded-xl">
                  <p className="text-sm text-slate-400 mb-1">Informe seleccionado</p>
                  <p className="text-white font-medium">
                    {selectedReport 
                      ? filteredData.reports.find(r => r.id === selectedReport)?.title || 'Informe seleccionado'
                      : activeTab === 'overview' ? 'Resumen General' : `Informe de ${filteredData.tabs.find(t => t.id === activeTab)?.label}`
                    }
                  </p>
                </div>

                <div>
                  <label className="text-sm text-slate-400 mb-2 block">Formato de exportación</label>
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      onClick={() => setExportFormat('pdf')}
                      className={`p-4 rounded-xl border flex flex-col items-center gap-2 transition-all ${
                        exportFormat === 'pdf' 
                          ? 'border-amber-500 bg-amber-500/10' 
                          : 'border-slate-700 hover:border-slate-600'
                      }`}
                    >
                      <FileText className={`w-8 h-8 ${exportFormat === 'pdf' ? 'text-amber-500' : 'text-slate-400'}`} />
                      <span className={`text-sm ${exportFormat === 'pdf' ? 'text-white' : 'text-slate-400'}`}>PDF</span>
                    </button>
                    <button
                      onClick={() => setExportFormat('excel')}
                      className={`p-4 rounded-xl border flex flex-col items-center gap-2 transition-all ${
                        exportFormat === 'excel' 
                          ? 'border-emerald-500 bg-emerald-500/10' 
                          : 'border-slate-700 hover:border-slate-600'
                      }`}
                    >
                      <FileSpreadsheet className={`w-8 h-8 ${exportFormat === 'excel' ? 'text-emerald-500' : 'text-slate-400'}`} />
                      <span className={`text-sm ${exportFormat === 'excel' ? 'text-white' : 'text-slate-400'}`}>Excel</span>
                    </button>
                  </div>
                </div>

                <div className="flex gap-3 pt-4">
                  <button
                    onClick={() => setActiveModal(null)}
                    className="flex-1 py-2.5 border border-slate-700 text-slate-400 rounded-xl hover:text-white transition-colors"
                  >
                    Cancelar
                  </button>
                  <button
                    onClick={() => handleExport(exportFormat)}
                    className="flex-1 py-2.5 bg-amber-500 text-slate-950 font-medium rounded-xl hover:bg-amber-400 transition-colors flex items-center justify-center gap-2"
                  >
                    <Download className="w-4 h-4" />
                    Exportar
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Modal: Informe Personalizado */}
      <AnimatePresence>
        {activeModal === 'custom' && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => setActiveModal(null)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-slate-900 border border-slate-800 rounded-2xl p-6 w-full max-w-lg"
              onClick={e => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-white">Crear Informe Personalizado</h3>
                <button onClick={() => setActiveModal(null)} className="p-1 text-slate-400 hover:text-white">
                  <X className="w-5 h-5" />
                </button>
              </div>
              
              <div className="space-y-4">
                <div>
                  <label className="text-sm text-slate-400 mb-2 block">Nombre del informe</label>
                  <input
                    type="text"
                    value={customReportName}
                    onChange={(e) => setCustomReportName(e.target.value)}
                    placeholder="Ej: Análisis de rentabilidad Q1"
                    className="w-full px-4 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-amber-500"
                  />
                </div>

                <div>
                  <label className="text-sm text-slate-400 mb-2 block">Tipo de informe</label>
                  <select
                    value={customReportType}
                    onChange={(e) => setCustomReportType(e.target.value)}
                    className="w-full px-4 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-white focus:outline-none focus:border-amber-500"
                  >
                    <option value="financial">Financiero</option>
                    <option value="productivity">Productividad</option>
                    <option value="cases">Expedientes</option>
                    <option value="clients">Clientes</option>
                    <option value="time">Tiempo</option>
                    <option value="cobranza">Cobranza</option>
                  </select>
                </div>

                <div>
                  <label className="text-sm text-slate-400 mb-2 block">Filtros a incluir</label>
                  <div className="space-y-2">
                    {['Rango de fechas', 'Abogados específicos', 'Tipos de casos', 'Estados de expediente', 'Monto mínimo'].map((filter) => (
                      <label key={filter} className="flex items-center gap-3 p-3 bg-slate-800/50 rounded-xl cursor-pointer hover:bg-slate-800 transition-colors">
                        <input type="checkbox" className="w-4 h-4 rounded border-slate-600 bg-slate-700 text-amber-500 focus:ring-amber-500" />
                        <span className="text-sm text-slate-300">{filter}</span>
                      </label>
                    ))}
                  </div>
                </div>

                <div className="flex gap-3 pt-4">
                  <button
                    onClick={() => setActiveModal(null)}
                    className="flex-1 py-2.5 border border-slate-700 text-slate-400 rounded-xl hover:text-white transition-colors"
                  >
                    Cancelar
                  </button>
                  <button
                    onClick={handleCreateCustomReport}
                    className="flex-1 py-2.5 bg-amber-500 text-slate-950 font-medium rounded-xl hover:bg-amber-400 transition-colors flex items-center justify-center gap-2"
                  >
                    <Plus className="w-4 h-4" />
                    Crear Informe
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Modal: Generar Informe */}
      <AnimatePresence>
        {activeModal === 'generate' && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => setActiveModal(null)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-slate-900 border border-slate-800 rounded-2xl p-6 w-full max-w-lg"
              onClick={e => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-white">Generar Nuevo Informe</h3>
                <button onClick={() => setActiveModal(null)} className="p-1 text-slate-400 hover:text-white">
                  <X className="w-5 h-5" />
                </button>
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {role === 'contador' && (
                  <>
                    <button onClick={() => handleGenerateReport('Balance General')} className="p-4 bg-slate-800/50 border border-slate-700 rounded-xl hover:border-amber-500/30 hover:bg-slate-800 transition-all text-left">
                      <Calculator className="w-6 h-6 text-amber-500 mb-2" />
                      <p className="text-sm font-medium text-white">Balance General</p>
                      <p className="text-xs text-slate-500">Estado financiero completo</p>
                    </button>
                    <button onClick={() => handleGenerateReport('Estado de Resultados')} className="p-4 bg-slate-800/50 border border-slate-700 rounded-xl hover:border-amber-500/30 hover:bg-slate-800 transition-all text-left">
                      <FileText className="w-6 h-6 text-emerald-500 mb-2" />
                      <p className="text-sm font-medium text-white">Estado de Resultados</p>
                      <p className="text-xs text-slate-500">Ingresos y gastos</p>
                    </button>
                    <button onClick={() => handleGenerateReport('Flujo de Caja')} className="p-4 bg-slate-800/50 border border-slate-700 rounded-xl hover:border-amber-500/30 hover:bg-slate-800 transition-all text-left">
                      <TrendingUp className="w-6 h-6 text-blue-500 mb-2" />
                      <p className="text-sm font-medium text-white">Flujo de Caja</p>
                      <p className="text-xs text-slate-500">Movimientos de efectivo</p>
                    </button>
                    <button onClick={() => handleGenerateReport('Declaración IVA')} className="p-4 bg-slate-800/50 border border-slate-700 rounded-xl hover:border-amber-500/30 hover:bg-slate-800 transition-all text-left">
                      <Receipt className="w-6 h-6 text-purple-500 mb-2" />
                      <p className="text-sm font-medium text-white">Declaración IVA</p>
                      <p className="text-xs text-slate-500">Resumen trimestral</p>
                    </button>
                  </>
                )}
                
                {role === 'abogado_senior' && (
                  <>
                    <button onClick={() => handleGenerateReport('Mi Productividad')} className="p-4 bg-slate-800/50 border border-slate-700 rounded-xl hover:border-amber-500/30 hover:bg-slate-800 transition-all text-left">
                      <Target className="w-6 h-6 text-amber-500 mb-2" />
                      <p className="text-sm font-medium text-white">Mi Productividad</p>
                      <p className="text-xs text-slate-500">Rendimiento personal</p>
                    </button>
                    <button onClick={() => handleGenerateReport('Reporte de Tiempo')} className="p-4 bg-slate-800/50 border border-slate-700 rounded-xl hover:border-amber-500/30 hover:bg-slate-800 transition-all text-left">
                      <Clock className="w-6 h-6 text-blue-500 mb-2" />
                      <p className="text-sm font-medium text-white">Reporte de Tiempo</p>
                      <p className="text-xs text-slate-500">Horas registradas</p>
                    </button>
                    <button onClick={() => handleGenerateReport('Estado de Mis Casos')} className="p-4 bg-slate-800/50 border border-slate-700 rounded-xl hover:border-amber-500/30 hover:bg-slate-800 transition-all text-left">
                      <Briefcase className="w-6 h-6 text-emerald-500 mb-2" />
                      <p className="text-sm font-medium text-white">Estado de Mis Casos</p>
                      <p className="text-xs text-slate-500">Expedientes activos</p>
                    </button>
                    <button onClick={() => handleGenerateReport('Análisis de Casos')} className="p-4 bg-slate-800/50 border border-slate-700 rounded-xl hover:border-amber-500/30 hover:bg-slate-800 transition-all text-left">
                      <BarChart3 className="w-6 h-6 text-purple-500 mb-2" />
                      <p className="text-sm font-medium text-white">Análisis de Casos</p>
                      <p className="text-xs text-slate-500">Estadísticas detalladas</p>
                    </button>
                  </>
                )}
                
                {(role === 'administrador' || role === 'socio' || role === 'super_admin') && (
                  <>
                    <button onClick={() => handleGenerateReport('Informe Financiero')} className="p-4 bg-slate-800/50 border border-slate-700 rounded-xl hover:border-amber-500/30 hover:bg-slate-800 transition-all text-left">
                      <DollarSign className="w-6 h-6 text-emerald-500 mb-2" />
                      <p className="text-sm font-medium text-white">Informe Financiero</p>
                      <p className="text-xs text-slate-500">Ingresos y gastos</p>
                    </button>
                    <button onClick={() => handleGenerateReport('Reporte de Clientes')} className="p-4 bg-slate-800/50 border border-slate-700 rounded-xl hover:border-amber-500/30 hover:bg-slate-800 transition-all text-left">
                      <Users className="w-6 h-6 text-blue-500 mb-2" />
                      <p className="text-sm font-medium text-white">Reporte de Clientes</p>
                      <p className="text-xs text-slate-500">Base de clientes</p>
                    </button>
                    <button onClick={() => handleGenerateReport('Estado de Cobranza')} className="p-4 bg-slate-800/50 border border-slate-700 rounded-xl hover:border-amber-500/30 hover:bg-slate-800 transition-all text-left">
                      <Wallet className="w-6 h-6 text-amber-500 mb-2" />
                      <p className="text-sm font-medium text-white">Estado de Cobranza</p>
                      <p className="text-xs text-slate-500">Cuentas por cobrar</p>
                    </button>
                    <button onClick={() => handleGenerateReport('Productividad del Equipo')} className="p-4 bg-slate-800/50 border border-slate-700 rounded-xl hover:border-amber-500/30 hover:bg-slate-800 transition-all text-left">
                      <TrendingUpIcon className="w-6 h-6 text-purple-500 mb-2" />
                      <p className="text-sm font-medium text-white">Productividad del Equipo</p>
                      <p className="text-xs text-slate-500">Rendimiento general</p>
                    </button>
                  </>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Modal: Programar Informe */}
      <AnimatePresence>
        {activeModal === 'schedule' && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => setActiveModal(null)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-slate-900 border border-slate-800 rounded-2xl p-6 w-full max-w-lg max-h-[90vh] overflow-y-auto"
              onClick={e => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-white">Programar Informes</h3>
                <button onClick={() => setActiveModal(null)} className="p-1 text-slate-400 hover:text-white">
                  <X className="w-5 h-5" />
                </button>
              </div>
              
              {/* Crear nueva programación */}
              <div className="p-4 bg-slate-800/30 border border-slate-700 rounded-xl mb-4">
                <h4 className="text-sm font-medium text-white mb-3">Nueva programación</h4>
                <div className="space-y-3">
                  <input
                    type="text"
                    value={scheduleName}
                    onChange={(e) => setScheduleName(e.target.value)}
                    placeholder="Nombre de la programación"
                    className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white text-sm placeholder-slate-500 focus:outline-none focus:border-amber-500"
                  />
                  <div className="grid grid-cols-2 gap-3">
                    <select
                      value={scheduleFrequency}
                      onChange={(e) => setScheduleFrequency(e.target.value)}
                      className="px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white text-sm focus:outline-none focus:border-amber-500"
                    >
                      <option value="daily">Diario</option>
                      <option value="weekly">Semanal</option>
                      <option value="biweekly">Quincenal</option>
                      <option value="monthly">Mensual</option>
                    </select>
                    <select
                      value={exportFormat}
                      onChange={(e) => setExportFormat(e.target.value as 'pdf' | 'excel')}
                      className="px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white text-sm focus:outline-none focus:border-amber-500"
                    >
                      <option value="pdf">PDF</option>
                      <option value="excel">Excel</option>
                    </select>
                  </div>
                  <button
                    onClick={handleScheduleReport}
                    className="w-full py-2 bg-amber-500 text-slate-950 font-medium rounded-lg hover:bg-amber-400 transition-colors text-sm"
                  >
                    Programar
                  </button>
                </div>
              </div>

              {/* Programaciones existentes */}
              <div>
                <h4 className="text-sm font-medium text-white mb-3">Programaciones activas</h4>
                <div className="space-y-2">
                  {scheduledReports.map((report) => (
                    <div key={report.id} className="flex items-center gap-3 p-3 bg-slate-800/50 rounded-xl">
                      <button
                        onClick={() => toggleScheduledReport(report.id)}
                        className={`w-8 h-8 rounded-lg flex items-center justify-center transition-colors ${
                          report.enabled ? 'bg-emerald-500/20 text-emerald-500' : 'bg-slate-700 text-slate-500'
                        }`}
                      >
                        {report.enabled ? <Play className="w-4 h-4" /> : <Clock className="w-4 h-4" />}
                      </button>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-white truncate">{report.name}</p>
                        <p className="text-xs text-slate-500">{report.frequency} • {report.format} • Próximo: {report.nextRun}</p>
                      </div>
                      <button
                        onClick={() => deleteScheduledReport(report.id)}
                        className="p-2 text-slate-400 hover:text-red-400 transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Modal: Balance General (Contador) */}
      <AnimatePresence>
        {activeModal === 'balance' && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => setActiveModal(null)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-slate-900 border border-slate-800 rounded-2xl p-6 w-full max-w-md"
              onClick={e => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-white">Generar Balance General</h3>
                <button onClick={() => setActiveModal(null)} className="p-1 text-slate-400 hover:text-white">
                  <X className="w-5 h-5" />
                </button>
              </div>
              
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-3">
                  <button onClick={() => handleGenerateReport('Balance General - Mensual')} className="p-4 bg-slate-800/50 border border-slate-700 rounded-xl hover:border-amber-500/30 transition-all text-center">
                    <CalendarDays className="w-6 h-6 text-amber-500 mx-auto mb-2" />
                    <p className="text-sm font-medium text-white">Mensual</p>
                  </button>
                  <button onClick={() => handleGenerateReport('Balance General - Trimestral')} className="p-4 bg-slate-800/50 border border-slate-700 rounded-xl hover:border-amber-500/30 transition-all text-center">
                    <BarChart3 className="w-6 h-6 text-blue-500 mx-auto mb-2" />
                    <p className="text-sm font-medium text-white">Trimestral</p>
                  </button>
                  <button onClick={() => handleGenerateReport('Balance General - Anual')} className="p-4 bg-slate-800/50 border border-slate-700 rounded-xl hover:border-amber-500/30 transition-all text-center">
                    <TrendingUp className="w-6 h-6 text-emerald-500 mx-auto mb-2" />
                    <p className="text-sm font-medium text-white">Anual</p>
                  </button>
                  <button onClick={() => handleGenerateReport('Balance General - Personalizado')} className="p-4 bg-slate-800/50 border border-slate-700 rounded-xl hover:border-amber-500/30 transition-all text-center">
                    <Settings className="w-6 h-6 text-purple-500 mx-auto mb-2" />
                    <p className="text-sm font-medium text-white">Personalizado</p>
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Modal: Declaración IVA */}
      <AnimatePresence>
        {activeModal === 'iva' && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => setActiveModal(null)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-slate-900 border border-slate-800 rounded-2xl p-6 w-full max-w-md"
              onClick={e => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-white">Declaración de IVA</h3>
                <button onClick={() => setActiveModal(null)} className="p-1 text-slate-400 hover:text-white">
                  <X className="w-5 h-5" />
                </button>
              </div>
              
              <div className="space-y-4">
                <div>
                  <label className="text-sm text-slate-400 mb-2 block">Período</label>
                  <select className="w-full px-4 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-white focus:outline-none focus:border-amber-500">
                    <option>1T 2026 (Ene-Mar)</option>
                    <option>4T 2025 (Oct-Dic)</option>
                    <option>3T 2025 (Jul-Sep)</option>
                    <option>2T 2025 (Abr-Jun)</option>
                  </select>
                </div>

                <div className="p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-xl">
                  <div className="flex items-center gap-2 mb-2">
                    <CheckCircle className="w-5 h-5 text-emerald-500" />
                    <span className="text-sm font-medium text-emerald-400">Datos completos</span>
                  </div>
                  <p className="text-xs text-slate-400">Todos los registros del período están completos y listos para la declaración.</p>
                </div>

                <div className="grid grid-cols-2 gap-3 pt-2">
                  <button
                    onClick={() => setActiveModal(null)}
                    className="py-2.5 border border-slate-700 text-slate-400 rounded-xl hover:text-white transition-colors"
                  >
                    Cancelar
                  </button>
                  <button
                    onClick={() => handleGenerateReport('Declaración IVA')}
                    className="py-2.5 bg-amber-500 text-slate-950 font-medium rounded-xl hover:bg-amber-400 transition-colors"
                  >
                    Generar
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Modal: Reporte de Tiempo (Abogado Senior) */}
      <AnimatePresence>
        {activeModal === 'timeReport' && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => setActiveModal(null)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-slate-900 border border-slate-800 rounded-2xl p-6 w-full max-w-md"
              onClick={e => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-white">Reporte de Tiempo</h3>
                <button onClick={() => setActiveModal(null)} className="p-1 text-slate-400 hover:text-white">
                  <X className="w-5 h-5" />
                </button>
              </div>
              
              <div className="space-y-4">
                <div>
                  <label className="text-sm text-slate-400 mb-2 block">Período</label>
                  <select className="w-full px-4 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-white focus:outline-none focus:border-amber-500">
                    <option>Esta semana</option>
                    <option>Semana pasada</option>
                    <option>Este mes</option>
                    <option>Mes pasado</option>
                    <option>Últimos 3 meses</option>
                  </select>
                </div>

                <div>
                  <label className="text-sm text-slate-400 mb-2 block">Agrupar por</label>
                  <div className="grid grid-cols-2 gap-2">
                    <label className="flex items-center gap-2 p-3 bg-slate-800/50 rounded-xl cursor-pointer">
                      <input type="radio" name="groupBy" defaultChecked className="text-amber-500" />
                      <span className="text-sm text-slate-300">Caso</span>
                    </label>
                    <label className="flex items-center gap-2 p-3 bg-slate-800/50 rounded-xl cursor-pointer">
                      <input type="radio" name="groupBy" className="text-amber-500" />
                      <span className="text-sm text-slate-300">Actividad</span>
                    </label>
                    <label className="flex items-center gap-2 p-3 bg-slate-800/50 rounded-xl cursor-pointer">
                      <input type="radio" name="groupBy" className="text-amber-500" />
                      <span className="text-sm text-slate-300">Cliente</span>
                    </label>
                    <label className="flex items-center gap-2 p-3 bg-slate-800/50 rounded-xl cursor-pointer">
                      <input type="radio" name="groupBy" className="text-amber-500" />
                      <span className="text-sm text-slate-300">Día</span>
                    </label>
                  </div>
                </div>

                <div className="p-4 bg-blue-500/10 border border-blue-500/20 rounded-xl">
                  <p className="text-sm text-blue-400 font-medium">Resumen del período seleccionado</p>
                  <div className="grid grid-cols-2 gap-4 mt-3">
                    <div>
                      <p className="text-2xl font-bold text-white">45.5h</p>
                      <p className="text-xs text-slate-500">Total registrado</p>
                    </div>
                    <div>
                      <p className="text-2xl font-bold text-white">12</p>
                      <p className="text-xs text-slate-500">Casos trabajados</p>
                    </div>
                  </div>
                </div>

                <button
                  onClick={() => handleGenerateReport('Reporte de Tiempo')}
                  className="w-full py-2.5 bg-amber-500 text-slate-950 font-medium rounded-xl hover:bg-amber-400 transition-colors"
                >
                  Generar Reporte
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Modal: Estado de Casos */}
      <AnimatePresence>
        {activeModal === 'caseStatus' && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => setActiveModal(null)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-slate-900 border border-slate-800 rounded-2xl p-6 w-full max-w-lg"
              onClick={e => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-white">Estado de Mis Casos</h3>
                <button onClick={() => setActiveModal(null)} className="p-1 text-slate-400 hover:text-white">
                  <X className="w-5 h-5" />
                </button>
              </div>
              
              <div className="space-y-3 mb-6">
                {[
                  { status: 'Activos', count: 8, color: 'bg-emerald-500', desc: 'En progreso actualmente' },
                  { status: 'Pendientes', count: 2, color: 'bg-amber-500', desc: 'Esperando documentos' },
                  { status: 'Urgentes', count: 2, color: 'bg-red-500', desc: 'Requieren atención inmediata' },
                  { status: 'En revisión', count: 3, color: 'bg-blue-500', desc: 'Para revisión interna' },
                ].map((item) => (
                  <div key={item.status} className="flex items-center gap-4 p-4 bg-slate-800/50 rounded-xl">
                    <div className={`w-12 h-12 ${item.color} rounded-xl flex items-center justify-center`}>
                      <Briefcase className="w-6 h-6 text-white" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className="text-white font-medium">{item.status}</span>
                        <span className={`px-2 py-0.5 text-xs rounded-full ${item.color} text-white`}>{item.count}</span>
                      </div>
                      <p className="text-xs text-slate-500">{item.desc}</p>
                    </div>
                    <button className="p-2 text-slate-400 hover:text-white hover:bg-slate-700 rounded-lg transition-colors">
                      <Eye className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => setActiveModal(null)}
                  className="flex-1 py-2.5 border border-slate-700 text-slate-400 rounded-xl hover:text-white transition-colors"
                >
                  Cerrar
                </button>
                <button
                  onClick={() => handleGenerateReport('Estado de Casos Completo')}
                  className="flex-1 py-2.5 bg-amber-500 text-slate-950 font-medium rounded-xl hover:bg-amber-400 transition-colors"
                >
                  Generar PDF
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Modal: Comparar Períodos */}
      <AnimatePresence>
        {activeModal === 'compare' && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => setActiveModal(null)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-slate-900 border border-slate-800 rounded-2xl p-6 w-full max-w-md"
              onClick={e => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-white">Comparar Períodos</h3>
                <button onClick={() => setActiveModal(null)} className="p-1 text-slate-400 hover:text-white">
                  <X className="w-5 h-5" />
                </button>
              </div>
              
              <div className="space-y-4">
                <div>
                  <label className="text-sm text-slate-400 mb-2 block">Período base</label>
                  <select
                    value={comparePeriod1}
                    onChange={(e) => setComparePeriod1(e.target.value)}
                    className="w-full px-4 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-white focus:outline-none focus:border-amber-500"
                  >
                    <option value="2026-Q1">1T 2026</option>
                    <option value="2025-Q4">4T 2025</option>
                    <option value="2025-Q3">3T 2025</option>
                    <option value="2025-Q2">2T 2025</option>
                    <option value="2025-Q1">1T 2025</option>
                    <option value="2025">2025 Completo</option>
                  </select>
                </div>

                <div className="flex justify-center">
                  <div className="p-2 bg-slate-800 rounded-full">
                    <Repeat className="w-5 h-5 text-slate-400" />
                  </div>
                </div>

                <div>
                  <label className="text-sm text-slate-400 mb-2 block">Período a comparar</label>
                  <select
                    value={comparePeriod2}
                    onChange={(e) => setComparePeriod2(e.target.value)}
                    className="w-full px-4 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-white focus:outline-none focus:border-amber-500"
                  >
                    <option value="2026-Q1">1T 2026</option>
                    <option value="2025-Q4">4T 2025</option>
                    <option value="2025-Q3">3T 2025</option>
                    <option value="2025-Q2">2T 2025</option>
                    <option value="2025-Q1">1T 2025</option>
                    <option value="2025">2025 Completo</option>
                  </select>
                </div>

                <div>
                  <label className="text-sm text-slate-400 mb-2 block">Métricas a comparar</label>
                  <div className="space-y-2">
                    {['Ingresos', 'Gastos', 'Nuevos casos', 'Horas facturables', 'Clientes nuevos'].map((metric) => (
                      <label key={metric} className="flex items-center gap-3 p-3 bg-slate-800/50 rounded-xl cursor-pointer">
                        <input type="checkbox" defaultChecked className="w-4 h-4 rounded border-slate-600 bg-slate-700 text-amber-500" />
                        <span className="text-sm text-slate-300">{metric}</span>
                      </label>
                    ))}
                  </div>
                </div>

                <button
                  onClick={() => handleGenerateReport(`Comparación ${comparePeriod1} vs ${comparePeriod2}`)}
                  className="w-full py-2.5 bg-amber-500 text-slate-950 font-medium rounded-xl hover:bg-amber-400 transition-colors"
                >
                  Generar Comparación
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Modal: Configurar Alertas */}
      <AnimatePresence>
        {activeModal === 'alerts' && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => setActiveModal(null)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-slate-900 border border-slate-800 rounded-2xl p-6 w-full max-w-md"
              onClick={e => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-white">Configurar Alertas</h3>
                <button onClick={() => setActiveModal(null)} className="p-1 text-slate-400 hover:text-white">
                  <X className="w-5 h-5" />
                </button>
              </div>
              
              <div className="space-y-3 mb-6">
                {[
                  { key: 'revenue', label: 'Ingresos mensuales', desc: 'Alerta si hay variación > 10%', icon: Euro },
                  { key: 'expenses', label: 'Gastos operativos', desc: 'Alerta si superan el presupuesto', icon: Wallet },
                  { key: 'cases', label: 'Casos nuevos', desc: 'Notificación por nuevos expedientes', icon: Briefcase },
                  { key: 'productivity', label: 'Productividad del equipo', desc: 'Alerta de bajo rendimiento', icon: TrendingUp },
                  { key: 'cobranza', label: 'Cobranza pendiente', desc: 'Alerta de facturas vencidas', icon: Receipt },
                ].map(({ key, label, desc, icon: Icon }) => (
                  <div key={key} className="flex items-center gap-3 p-3 bg-slate-800/50 rounded-xl">
                    <div className="w-10 h-10 bg-slate-700 rounded-lg flex items-center justify-center">
                      <Icon className="w-5 h-5 text-amber-500" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-white">{label}</p>
                      <p className="text-xs text-slate-500">{desc}</p>
                    </div>
                    <button
                      onClick={() => setAlertSettings({...alertSettings, [key]: !alertSettings[key as keyof typeof alertSettings]})}
                      className={`w-12 h-6 rounded-full transition-colors relative ${
                        alertSettings[key as keyof typeof alertSettings] ? 'bg-amber-500' : 'bg-slate-700'
                      }`}
                    >
                      <div className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-all ${
                        alertSettings[key as keyof typeof alertSettings] ? 'left-7' : 'left-1'
                      }`} />
                    </button>
                  </div>
                ))}
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => setActiveModal(null)}
                  className="flex-1 py-2.5 border border-slate-700 text-slate-400 rounded-xl hover:text-white transition-colors"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleSaveAlerts}
                  className="flex-1 py-2.5 bg-amber-500 text-slate-950 font-medium rounded-xl hover:bg-amber-400 transition-colors"
                >
                  Guardar
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </AppLayout>
  );
}

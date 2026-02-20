import { useState, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Plus, Download, Eye, Edit3, Trash2, Play, Pause, Square, Clock,
  Calendar, Target, DollarSign, BarChart4, FileText,
  CheckCircle2, AlertCircle, Search, X, Timer, Crown, UserCheck, Users, Lock,
  ArrowUpRight, ArrowDownRight, PieChart, CheckCircle, Info
} from 'lucide-react';
import { AppLayout } from '@/components/layout/AppLayout';
import { useRole } from '@/hooks/useRole';
import type { UserRole } from '@/types/roles';

// Tipos
type ModalType = 'view' | 'edit' | 'delete' | 'export' | null;

interface RegistroTiempo {
  id: string;
  fecha: string;
  abogado: string;
  expediente: string;
  cliente: string;
  actividad: string;
  horas: number;
  tarifa: number;
  facturable: boolean;
  estado: 'aprobado' | 'pendiente' | 'rechazado' | string;
}

// Datos de ejemplo
const registrosTiempo = [
  { id: 'T-156', fecha: '2026-03-10', abogado: 'Ana López', expediente: 'EXP-2026-045', cliente: 'TechCorp SL', actividad: 'Redacción de contrato', horas: 2.5, tarifa: 150, facturable: true, estado: 'aprobado' },
  { id: 'T-155', fecha: '2026-03-10', abogado: 'Pedro García', expediente: 'EXP-2026-038', cliente: 'María García', actividad: 'Revisión de documentos', horas: 1.5, tarifa: 100, facturable: true, estado: 'pendiente' },
  { id: 'T-154', fecha: '2026-03-09', abogado: 'Ana López', expediente: 'EXP-2026-045', cliente: 'TechCorp SL', actividad: 'Reunión con cliente', horas: 1.0, tarifa: 150, facturable: true, estado: 'aprobado' },
  { id: 'T-153', fecha: '2026-03-09', abogado: 'Pedro García', expediente: 'EXP-2026-039', cliente: 'InnovateLab SA', actividad: 'Investigación jurídica', horas: 3.0, tarifa: 100, facturable: true, estado: 'aprobado' },
  { id: 'T-152', fecha: '2026-03-09', abogado: 'María Sánchez', expediente: 'EXP-2026-042', cliente: 'GlobalTech Inc', actividad: 'Preparación de trámites', horas: 2.0, tarifa: 75, facturable: true, estado: 'pendiente' },
  { id: 'T-151', fecha: '2026-03-08', abogado: 'Ana López', expediente: 'INTERNO', cliente: 'Bufete', actividad: 'Capacitación interna', horas: 2.0, tarifa: 0, facturable: false, estado: 'aprobado' },
];

const tiempoSemanal = [
  { dia: 'Lun', horas: 7.5, facturable: 6.0 },
  { dia: 'Mar', horas: 8.0, facturable: 7.5 },
  { dia: 'Mié', horas: 6.5, facturable: 5.5 },
  { dia: 'Jue', horas: 8.5, facturable: 8.0 },
  { dia: 'Vie', horas: 7.0, facturable: 6.5 },
  { dia: 'Sáb', horas: 0, facturable: 0 },
  { dia: 'Dom', horas: 0, facturable: 0 },
];

const categoriasTiempo = [
  { categoria: 'Redacción Legal', horas: 45.5, porcentaje: 35, color: 'bg-blue-500' },
  { categoria: 'Reuniones Cliente', horas: 28.0, porcentaje: 22, color: 'bg-emerald-500' },
  { categoria: 'Investigación', horas: 32.5, porcentaje: 25, color: 'bg-purple-500' },
  { categoria: 'Audiencias', horas: 15.0, porcentaje: 12, color: 'bg-amber-500' },
  { categoria: 'Admin/Otros', horas: 8.0, porcentaje: 6, color: 'bg-slate-500' },
];

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('es-ES', {
    style: 'currency',
    currency: 'EUR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
};

const formatHours = (hours: number) => {
  const h = Math.floor(hours);
  const m = Math.round((hours - h) * 60);
  return m > 0 ? `${h}h ${m}m` : `${h}h`;
};

export default function Tiempo() {
  const { role, roleConfig } = useRole();
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterType, setFilterType] = useState('all');
  const [activeTab, setActiveTab] = useState('overview');
  const [showNewTimeModal, setShowNewTimeModal] = useState(false);
  const [isTimerRunning, setIsTimerRunning] = useState(false);
  const [timerSeconds, setTimerSeconds] = useState(0);
  const [activeModal, setActiveModal] = useState<ModalType>(null);
  const [selectedRegistro, setSelectedRegistro] = useState<RegistroTiempo | null>(null);
  const [toast, setToast] = useState<{message: string; type: 'success' | 'info' | 'error'} | null>(null);
  
  // Datos mutables
  const [registros, setRegistros] = useState<RegistroTiempo[]>(registrosTiempo as RegistroTiempo[]);
  
  // Form states
  const [newTimeForm, setNewTimeForm] = useState({
    expediente: '',
    actividad: '',
    horas: '',
    fecha: new Date().toISOString().split('T')[0],
    facturable: true
  });
  
  const [editForm, setEditForm] = useState({
    actividad: '',
    horas: '',
    facturable: true
  });

  const showToast = (message: string, type: 'success' | 'info' | 'error' = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  // Timer effect
  useEffect(() => {
    let interval: ReturnType<typeof setInterval>;
    if (isTimerRunning) {
      interval = setInterval(() => {
        setTimerSeconds(s => s + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isTimerRunning]);

  // Determinar permisos según el rol
  const permissions = useMemo(() => {
    const moduleAccess = roleConfig.permissions.modules.tiempo;

    return {
      hasAccess: moduleAccess !== 'none',
      canViewAll: moduleAccess === 'full' || moduleAccess === 'view',
      canViewOwn: moduleAccess === 'own',

      // Acciones sobre tiempo
      canCreate: role === 'super_admin' || role === 'socio' || role === 'abogado_senior' || role === 'abogado_junior' || role === 'paralegal',
      canEdit: role === 'super_admin' || role === 'socio' || role === 'abogado_senior' || role === 'abogado_junior' || role === 'paralegal',
      canDelete: role === 'super_admin' || role === 'socio',
      canApprove: role === 'super_admin' || role === 'socio' || role === 'abogado_senior',

      // Funciones específicas
      canViewAllUsers: role === 'super_admin' || role === 'socio',
      canSetRates: role === 'super_admin' || role === 'socio',
      canExportReports: roleConfig.permissions.canViewReports,
      canValidateBillable: role === 'super_admin' || role === 'socio' || role === 'abogado_senior',
    };
  }, [role, roleConfig]);

  // Handlers
  const handleSaveTime = () => {
    if (!newTimeForm.expediente || !newTimeForm.actividad || !newTimeForm.horas) {
      showToast('Por favor completa todos los campos', 'error');
      return;
    }
    
    const nuevoRegistro: RegistroTiempo = {
      id: `T-${Date.now().toString().slice(-3)}`,
      fecha: newTimeForm.fecha,
      abogado: 'Usuario Actual',
      expediente: newTimeForm.expediente.split('-')[0] || 'EXP-2026-XXX',
      cliente: newTimeForm.expediente.split('-').slice(1).join('-') || 'Cliente',
      actividad: newTimeForm.actividad,
      horas: parseFloat(newTimeForm.horas),
      tarifa: newTimeForm.facturable ? 150 : 0,
      facturable: newTimeForm.facturable,
      estado: 'pendiente'
    };
    
    setRegistros([nuevoRegistro, ...registros]);
    setNewTimeForm({ expediente: '', actividad: '', horas: '', fecha: new Date().toISOString().split('T')[0], facturable: true });
    setShowNewTimeModal(false);
    setTimerSeconds(0);
    showToast('Tiempo registrado correctamente');
  };

  const handleApprove = (id: string) => {
    setRegistros(registros.map(r => r.id === id ? { ...r, estado: 'aprobado' as const } : r));
    showToast('Registro aprobado correctamente');
  };

  const handleDelete = () => {
    if (!selectedRegistro) return;
    if (confirm(`¿Eliminar el registro ${selectedRegistro.id}?`)) {
      setRegistros(registros.filter(r => r.id !== selectedRegistro.id));
      setActiveModal(null);
      setSelectedRegistro(null);
      showToast('Registro eliminado');
    }
  };

  const handleEdit = () => {
    if (!selectedRegistro) return;
    
    setRegistros(registros.map(r => 
      r.id === selectedRegistro.id 
        ? { ...r, actividad: editForm.actividad || r.actividad, horas: parseFloat(editForm.horas) || r.horas, facturable: editForm.facturable }
        : r
    ));
    
    setActiveModal(null);
    setSelectedRegistro(null);
    showToast('Registro actualizado correctamente');
  };

  const handleExport = () => {
    showToast('Exportando registros de tiempo...', 'info');
    setTimeout(() => {
      showToast('Exportación completada');
      setActiveModal(null);
    }, 1500);
  };

  const openEditModal = (registro: RegistroTiempo) => {
    setSelectedRegistro(registro);
    setEditForm({
      actividad: registro.actividad,
      horas: registro.horas.toString(),
      facturable: registro.facturable
    });
    setActiveModal('edit');
  };

  // Filtrar registros según rol
  const filteredRegistros = useMemo(() => {
    let data = registros;

    // Filtrar por rol
    if (role === 'abogado_junior' || role === 'paralegal') {
      data = registros.filter(r => r.abogado === 'Pedro García' || r.abogado === 'María Sánchez' || r.abogado === 'Usuario Actual');
    } else if (role === 'abogado_senior') {
      data = registros;
    }

    // Aplicar filtros
    data = data.filter(registro => {
      const matchesSearch =
        registro.cliente.toLowerCase().includes(searchQuery.toLowerCase()) ||
        registro.expediente.toLowerCase().includes(searchQuery.toLowerCase()) ||
        registro.actividad.toLowerCase().includes(searchQuery.toLowerCase()) ||
        registro.abogado.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesStatus = filterStatus === 'all' || registro.estado === filterStatus;
      const matchesType = filterType === 'all' ||
        (filterType === 'facturable' && registro.facturable) ||
        (filterType === 'no_facturable' && !registro.facturable);

      return matchesSearch && matchesStatus && matchesType;
    });

    return data;
  }, [registros, role, searchQuery, filterStatus, filterType]);

  // Calcular estadísticas
  const stats = useMemo(() => {
    const horasTotales = registrosTiempo.reduce((acc, r) => acc + r.horas, 0);
    const horasFacturables = registrosTiempo.filter(r => r.facturable).reduce((acc, r) => acc + r.horas, 0);
    
    const horasPendientes = registrosTiempo.filter(r => r.estado === 'pendiente').reduce((acc, r) => acc + r.horas, 0);
    const ingresosPotenciales = registrosTiempo.filter(r => r.facturable).reduce((acc, r) => acc + (r.horas * r.tarifa), 0);
    const tasaFacturabilidad = ((horasFacturables / horasTotales) * 100).toFixed(1);

    if (role === 'super_admin' || role === 'socio') {
      return [
        { label: 'Total Horas Mes', value: formatHours(horasTotales), change: '+8.5%', trend: 'up', icon: Clock, color: 'blue', subtitle: 'Todo el equipo' },
        { label: 'Horas Facturables', value: formatHours(horasFacturables), change: `${tasaFacturabilidad}% del total`, trend: 'up', icon: Target, color: 'emerald', subtitle: 'Tasa de facturación' },
        { label: 'Ingresos Potenciales', value: formatCurrency(ingresosPotenciales), change: '+12.3%', trend: 'up', icon: DollarSign, color: 'amber', subtitle: 'Por facturar' },
        { label: 'Pendientes Aprobación', value: formatHours(horasPendientes), change: `${registrosTiempo.filter(r => r.estado === 'pendiente').length} entradas`, trend: 'down', icon: AlertCircle, color: 'red', subtitle: 'Requieren revisión' },
      ];
    } else if (role === 'abogado_senior') {
      const misHoras = registrosTiempo.filter(r => r.abogado === 'Ana López').reduce((acc, r) => acc + r.horas, 0);
      const misFacturables = registrosTiempo.filter(r => r.abogado === 'Ana López' && r.facturable).reduce((acc, r) => acc + r.horas, 0);
      const misIngresos = registrosTiempo.filter(r => r.abogado === 'Ana López' && r.facturable).reduce((acc, r) => acc + (r.horas * r.tarifa), 0);

      return [
        { label: 'Mis Horas Mes', value: formatHours(misHoras), change: '+5.2%', trend: 'up', icon: Clock, color: 'blue', subtitle: 'Registradas' },
        { label: 'Horas Facturables', value: formatHours(misFacturables), change: `${((misFacturables/misHoras)*100).toFixed(0)}%`, trend: 'up', icon: Target, color: 'emerald', subtitle: 'De mis horas' },
        { label: 'Valor Generado', value: formatCurrency(misIngresos), change: '+10%', trend: 'up', icon: DollarSign, color: 'amber', subtitle: 'Este mes' },
        { label: 'Por Aprobar', value: formatHours(horasPendientes), change: `${registrosTiempo.filter(r => r.estado === 'pendiente').length} de juniors`, trend: 'up', icon: Users, color: 'purple', subtitle: 'Revisión pendiente' },
      ];
    } else {
      const misHoras = registrosTiempo.filter(r => r.abogado === 'Pedro García' || r.abogado === 'María Sánchez').reduce((acc, r) => acc + r.horas, 0);
      const misFacturables = registrosTiempo.filter(r => (r.abogado === 'Pedro García' || r.abogado === 'María Sánchez') && r.facturable).reduce((acc, r) => acc + r.horas, 0);
      const misPendientes = registrosTiempo.filter(r => (r.abogado === 'Pedro García' || r.abogado === 'María Sánchez') && r.estado === 'pendiente').reduce((acc, r) => acc + r.horas, 0);

      return [
        { label: 'Mis Horas Mes', value: formatHours(misHoras), change: '+3.8%', trend: 'up', icon: Clock, color: 'blue', subtitle: 'Registradas' },
        { label: 'Horas Facturables', value: formatHours(misFacturables), change: `${((misFacturables/misHoras)*100).toFixed(0)}%`, trend: 'up', icon: Target, color: 'emerald', subtitle: 'De mis horas' },
        { label: 'Esta Semana', value: formatHours(37.5), change: '5 días', trend: 'up', icon: Calendar, color: 'purple', subtitle: 'Tiempo registrado' },
        { label: 'Pend. Aprobación', value: formatHours(misPendientes), change: `${registrosTiempo.filter(r => (r.abogado === 'Pedro García' || r.abogado === 'María Sánchez') && r.estado === 'pendiente').length} entradas`, trend: 'down', icon: AlertCircle, color: 'amber', subtitle: 'En revisión' },
      ];
    }
  }, [role]);

  // Información de página según rol
  const getPageInfo = () => {
    switch (role) {
      case 'super_admin':
        return {
          title: 'Gestión de Tiempo',
          subtitle: 'Control total de tiempo y facturación',
          description: 'Supervisión del tiempo registrado por todo el equipo'
        };
      case 'socio':
        return {
          title: 'Tiempo y Productividad',
          subtitle: 'Análisis de facturación por horas',
          description: 'Supervisión de tiempo facturable del bufete'
        };
      case 'abogado_senior':
        return {
          title: 'Registro de Tiempo',
          subtitle: 'Mis horas y equipo supervisado',
          description: 'Control de tiempo personal y aprobación de juniors'
        };
      case 'abogado_junior':
        return {
          title: 'Registro de Tiempo',
          subtitle: 'Control de horas trabajadas',
          description: 'Registro de tiempo en casos asignados'
        };
      case 'paralegal':
        return {
          title: 'Registro de Tiempo',
          subtitle: 'Control de horas de trabajo',
          description: 'Registro de tiempo en tareas asignadas'
        };
      default:
        return {
          title: 'Registro de Tiempo',
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
      { id: 'timesheet', label: 'Registros', icon: FileText },
    ];

    if (role === 'super_admin' || role === 'socio') {
      return [
        ...baseTabs,
        { id: 'team', label: 'Por Abogado', icon: Users },
        { id: 'analytics', label: 'Análisis', icon: PieChart },
        { id: 'billable', label: 'Facturación', icon: DollarSign },
      ];
    }

    if (role === 'abogado_senior') {
      return [
        ...baseTabs,
        { id: 'approvals', label: 'Aprobaciones', icon: CheckCircle2 },
        { id: 'analytics', label: 'Mi Análisis', icon: PieChart },
      ];
    }

    return baseTabs;
  }, [role]);

  // Mensaje de acceso denegado
  const getRoleMessage = () => {
    const messages: Record<UserRole, { title: string; description: string; actions: string[] }> = {
      super_admin: {
        title: 'Control Total de Tiempo',
        description: 'Gestión completa del tiempo registrado por todo el equipo.',
        actions: ['Ver tiempo de todos los abogados', 'Aprobar registros', 'Configurar tarifas', 'Exportar reportes']
      },
      socio: {
        title: 'Supervisión de Tiempo',
        description: 'Análisis de productividad y facturación por horas.',
        actions: ['Ver tiempo del equipo', 'Aprobar registros', 'Validar tiempo facturable', 'Análisis de rentabilidad']
      },
      abogado_senior: {
        title: 'Registro y Supervisión',
        description: 'Gestión de tu tiempo y aprobación de juniors supervisados.',
        actions: ['Registrar tu tiempo', 'Aprobar tiempo de juniors', 'Ver estadísticas personales', 'Solicitar aprobación']
      },
      abogado_junior: {
        title: 'Registro de Tiempo Personal',
        description: 'Control de horas trabajadas en casos asignados.',
        actions: ['Registrar tiempo trabajado', 'Asignar a casos', 'Ver tus estadísticas', 'Solicitar aprobación']
      },
      paralegal: {
        title: 'Registro de Horas de Trabajo',
        description: 'Control de tiempo en tareas y trámites asignados.',
        actions: ['Registrar tiempo de trabajo', 'Asignar a tareas', 'Ver tus horas', 'Solicitar aprobación']
      },
      secretario: {
        title: 'Sin Acceso a Tiempo',
        description: 'Tu rol no tiene acceso al módulo de registro de tiempo.',
        actions: ['Gestiona documentación', 'Organiza archivos', 'Actualiza agenda']
      },
      administrador: {
        title: 'Sin Acceso a Tiempo',
        description: 'Tu rol no tiene acceso al módulo de registro de tiempo.',
        actions: ['Gestiona proveedores', 'Controla presupuestos', 'Registra gastos']
      },
      contador: {
        title: 'Sin Acceso a Tiempo',
        description: 'Tu rol no tiene acceso al módulo de registro de tiempo.',
        actions: ['Gestiona contabilidad', 'Procesa nómina', 'Genera reportes fiscales']
      },
      recepcionista: {
        title: 'Sin Acceso a Tiempo',
        description: 'Tu rol no tiene acceso al módulo de registro de tiempo.',
        actions: ['Gestiona citas', 'Atiende llamadas', 'Recibe clientes']
      },
    };

    return messages[role] || messages.recepcionista;
  };

  // Si el rol no tiene acceso
  if (!permissions.hasAccess) {
    const message = getRoleMessage();
    return (
      <AppLayout
        title="Registro de Tiempo"
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
                      <div className="w-1.5 h-1.5 bg-blue-500 rounded-full" />
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
          onClick={() => setShowNewTimeModal(true)}
          className="hidden sm:flex items-center gap-2 px-4 py-2 bg-blue-500 text-white font-medium rounded-xl hover:bg-blue-400 transition-colors"
        >
          <Plus className="w-4 h-4" />
          <span className="hidden lg:inline">Nuevo Registro</span>
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
                  ? 'bg-blue-500 text-white'
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
                  className="p-5 bg-slate-900/60 border border-slate-800 rounded-2xl hover:border-blue-500/30 transition-all group cursor-pointer"
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
              {/* Tiempo Semanal */}
              <div className="xl:col-span-2 bg-slate-900/60 border border-slate-800 rounded-2xl p-6">
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h2 className="text-lg font-semibold text-white">
                      {role === 'super_admin' || role === 'socio' ? 'Tiempo Semanal del Equipo' : 'Mi Tiempo Semanal'}
                    </h2>
                    <p className="text-sm text-slate-400">Semana del 10 al 16 de Marzo, 2026</p>
                  </div>
                  <div className="flex items-center gap-4 text-sm">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 bg-blue-500 rounded-full" />
                      <span className="text-slate-400">Total</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 bg-emerald-500 rounded-full" />
                      <span className="text-slate-400">Facturable</span>
                    </div>
                  </div>
                </div>

                <div className="h-64 flex items-end gap-3">
                  {tiempoSemanal.map((data, i) => (
                    <div key={data.dia} className="flex-1 flex flex-col items-center gap-2 group">
                      <div className="relative w-full flex items-end justify-center gap-1 h-48">
                        <motion.div
                          initial={{ height: 0 }}
                          animate={{ height: `${(data.horas / 10) * 100}%` }}
                          transition={{ delay: i * 0.05, duration: 0.5 }}
                          className="w-full bg-blue-500/30 rounded-t-lg relative overflow-hidden"
                        >
                          <motion.div
                            initial={{ height: 0 }}
                            animate={{ height: `${data.horas > 0 ? (data.facturable / data.horas) * 100 : 0}%` }}
                            transition={{ delay: i * 0.05 + 0.1, duration: 0.5 }}
                            className="absolute bottom-0 w-full bg-emerald-500 rounded-t-lg"
                          />
                        </motion.div>
                      </div>
                      <div className="text-center">
                        <span className="text-xs font-medium text-white block">{data.dia}</span>
                        <span className="text-xs text-slate-500">{formatHours(data.horas)}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Side Panel */}
              <div className="space-y-6">
                {/* Cronómetro */}
                <div className="bg-gradient-to-br from-blue-500/10 to-blue-600/5 border border-blue-500/20 rounded-2xl p-6">
                  <div className="flex items-center gap-2 mb-4">
                    <Timer className="w-5 h-5 text-blue-500" />
                    <h3 className="text-lg font-semibold text-white">Cronómetro</h3>
                  </div>
                  <div className="text-center mb-4">
                    <div className="text-4xl font-bold text-white font-mono mb-2">
                      {Math.floor(timerSeconds / 3600).toString().padStart(2, '0')}:
                      {Math.floor((timerSeconds % 3600) / 60).toString().padStart(2, '0')}:
                      {(timerSeconds % 60).toString().padStart(2, '0')}
                    </div>
                    <p className="text-xs text-slate-400">Tiempo actual</p>
                  </div>
                  <div className="flex gap-2">
                    {!isTimerRunning ? (
                      <button
                        onClick={() => setIsTimerRunning(true)}
                        className="flex-1 py-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-sm font-medium rounded-xl transition-colors flex items-center justify-center gap-2"
                      >
                        <Play className="w-4 h-4" />
                        Iniciar
                      </button>
                    ) : (
                      <button
                        onClick={() => setIsTimerRunning(false)}
                        className="flex-1 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 text-sm font-medium rounded-xl transition-colors flex items-center justify-center gap-2"
                      >
                        <Pause className="w-4 h-4" />
                        Pausar
                      </button>
                    )}
                    <button
                      onClick={() => { setIsTimerRunning(false); setTimerSeconds(0); }}
                      className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 text-sm font-medium rounded-xl transition-colors"
                    >
                      <Square className="w-4 h-4" />
                    </button>
                  </div>
                  {timerSeconds > 0 && (
                    <button
                      onClick={() => setShowNewTimeModal(true)}
                      className="mt-3 w-full py-2 bg-blue-500 hover:bg-blue-400 text-white text-sm font-medium rounded-xl transition-colors"
                    >
                      Guardar Tiempo
                    </button>
                  )}
                </div>

                {/* Distribución de Tiempo */}
                <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold text-white">Distribución</h3>
                    <span className="text-xs text-slate-500">Este mes</span>
                  </div>
                  <div className="space-y-4">
                    {categoriasTiempo.map((cat) => (
                      <div key={cat.categoria}>
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-sm text-slate-300">{cat.categoria}</span>
                          <span className="text-sm text-white">{formatHours(cat.horas)}</span>
                        </div>
                        <div className="h-2 bg-slate-800 rounded-full overflow-hidden">
                          <div className={`h-full ${cat.color} rounded-full`} style={{ width: `${cat.porcentaje}%` }} />
                        </div>
                        <div className="flex items-center justify-between mt-1">
                          <span className="text-xs text-slate-500">{cat.porcentaje}%</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
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
                  {(role === 'super_admin' || role === 'socio') ? <Crown className="w-5 h-5" /> :
                   role === 'abogado_senior' ? <UserCheck className="w-5 h-5" /> :
                   <Clock className="w-5 h-5" />}
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

        {/* Timesheet Tab */}
        {activeTab === 'timesheet' && (
          <div className="bg-slate-900/60 border border-slate-800 rounded-2xl overflow-hidden">
            <div className="p-4 border-b border-slate-800 flex flex-col lg:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                <input
                  type="text"
                  placeholder="Buscar por cliente, expediente o actividad..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-4 py-2 bg-slate-800 border border-slate-700 rounded-xl text-white text-sm placeholder-slate-500 focus:outline-none focus:border-blue-500 transition-colors"
                />
              </div>
              <div className="flex gap-3">
                <select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                  className="px-4 py-2 bg-slate-800 border border-slate-700 rounded-xl text-white text-sm"
                >
                  <option value="all">Todos los estados</option>
                  <option value="aprobado">Aprobado</option>
                  <option value="pendiente">Pendiente</option>
                  <option value="rechazado">Rechazado</option>
                </select>
                <select
                  value={filterType}
                  onChange={(e) => setFilterType(e.target.value)}
                  className="px-4 py-2 bg-slate-800 border border-slate-700 rounded-xl text-white text-sm"
                >
                  <option value="all">Todos los tipos</option>
                  <option value="facturable">Facturable</option>
                  <option value="no_facturable">No facturable</option>
                </select>
                <button 
                  onClick={() => setActiveModal('export')}
                  className="p-2 bg-slate-800 border border-slate-700 rounded-xl text-slate-400 hover:text-white"
                >
                  <Download className="w-5 h-5" />
                </button>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-slate-800 bg-slate-900/80">
                    <th className="text-left py-3 px-4 text-xs font-medium text-slate-400 uppercase">ID</th>
                    <th className="text-left py-3 px-4 text-xs font-medium text-slate-400 uppercase">Fecha</th>
                    {permissions.canViewAll && (
                      <th className="text-left py-3 px-4 text-xs font-medium text-slate-400 uppercase">Abogado</th>
                    )}
                    <th className="text-left py-3 px-4 text-xs font-medium text-slate-400 uppercase">Cliente/Expediente</th>
                    <th className="text-left py-3 px-4 text-xs font-medium text-slate-400 uppercase hidden xl:table-cell">Actividad</th>
                    <th className="text-left py-3 px-4 text-xs font-medium text-slate-400 uppercase">Horas</th>
                    <th className="text-left py-3 px-4 text-xs font-medium text-slate-400 uppercase">Tipo</th>
                    <th className="text-left py-3 px-4 text-xs font-medium text-slate-400 uppercase">Estado</th>
                    <th className="text-left py-3 px-4 text-xs font-medium text-slate-400 uppercase"></th>
                  </tr>
                </thead>
                <tbody>
                  {filteredRegistros.map((registro, index) => (
                    <motion.tr
                      key={registro.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.03 }}
                      className="border-b border-slate-800/50 hover:bg-slate-800/30 transition-colors group"
                    >
                      <td className="py-3 px-4">
                        <span className="text-sm font-medium text-white font-mono">{registro.id}</span>
                      </td>
                      <td className="py-3 px-4">
                        <span className="text-sm text-slate-400">{registro.fecha}</span>
                      </td>
                      {permissions.canViewAll && (
                        <td className="py-3 px-4">
                          <span className="text-sm text-white">{registro.abogado}</span>
                        </td>
                      )}
                      <td className="py-3 px-4">
                        <div>
                          <span className="text-sm text-white">{registro.cliente}</span>
                          <span className="block text-xs text-slate-500">{registro.expediente}</span>
                        </div>
                      </td>
                      <td className="py-3 px-4 hidden xl:table-cell">
                        <span className="text-sm text-slate-400 truncate max-w-xs block">{registro.actividad}</span>
                      </td>
                      <td className="py-3 px-4">
                        <span className="text-sm font-bold text-white">{formatHours(registro.horas)}</span>
                      </td>
                      <td className="py-3 px-4">
                        <span className={`px-2.5 py-1 text-xs font-medium rounded-full border ${
                          registro.facturable
                            ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                            : 'bg-slate-500/10 text-slate-400 border-slate-500/20'
                        }`}>
                          {registro.facturable ? 'Facturable' : 'No facturable'}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <span className={`px-2.5 py-1 text-xs font-medium rounded-full border ${
                          registro.estado === 'aprobado'
                            ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                            : registro.estado === 'pendiente'
                            ? 'bg-amber-500/10 text-amber-400 border-amber-500/20'
                            : 'bg-red-500/10 text-red-400 border-red-500/20'
                        }`}>
                          {registro.estado === 'aprobado' ? 'Aprobado' : registro.estado === 'pendiente' ? 'Pendiente' : 'Rechazado'}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button 
                            onClick={() => { setSelectedRegistro(registro); setActiveModal('view'); }}
                            className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-700 rounded-lg" 
                            title="Ver"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          {permissions.canEdit && registro.estado === 'pendiente' && (
                            <button 
                              onClick={() => openEditModal(registro)}
                              className="p-1.5 text-slate-400 hover:text-blue-400 hover:bg-blue-500/10 rounded-lg" 
                              title="Editar"
                            >
                              <Edit3 className="w-4 h-4" />
                            </button>
                          )}
                          {permissions.canApprove && registro.estado === 'pendiente' && (
                            <button 
                              onClick={() => handleApprove(registro.id)}
                              className="p-1.5 text-slate-400 hover:text-emerald-400 hover:bg-emerald-500/10 rounded-lg" 
                              title="Aprobar"
                            >
                              <CheckCircle2 className="w-4 h-4" />
                            </button>
                          )}
                          {permissions.canDelete && (
                            <button 
                              onClick={() => { setSelectedRegistro(registro); setActiveModal('delete'); }}
                              className="p-1.5 text-slate-400 hover:text-red-400 hover:bg-red-500/10 rounded-lg" 
                              title="Eliminar"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      </td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="p-4 border-t border-slate-800 flex items-center justify-between">
              <p className="text-sm text-slate-400">
                Mostrando {filteredRegistros.length} de {registros.length} registros
              </p>
            </div>
          </div>
        )}

        {/* Otros tabs */}
        {activeTab !== 'overview' && activeTab !== 'timesheet' && (
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
              toast.type === 'error' ? 'bg-red-500' : 'bg-blue-500'
            } text-slate-950 font-medium`}
          >
            {toast.type === 'success' ? <CheckCircle className="w-5 h-5" /> : 
             toast.type === 'error' ? <AlertCircle className="w-5 h-5" /> : <Info className="w-5 h-5" />}
            {toast.message}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Modal Nuevo Registro */}
      <AnimatePresence>
        {showNewTimeModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => setShowNewTimeModal(false)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-lg p-6"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-white">Registrar Tiempo</h2>
                <button onClick={() => setShowNewTimeModal(false)} className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg">
                  <X className="w-5 h-5" />
                </button>
              </div>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm text-slate-400 mb-2">Expediente / Cliente</label>
                  <select 
                    value={newTimeForm.expediente}
                    onChange={(e) => setNewTimeForm({...newTimeForm, expediente: e.target.value})}
                    className="w-full px-4 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-white"
                  >
                    <option value="">Seleccionar expediente...</option>
                    <option value="EXP-2026-045 - TechCorp SL">EXP-2026-045 - TechCorp SL</option>
                    <option value="EXP-2026-038 - María García">EXP-2026-038 - María García</option>
                    <option value="EXP-2026-039 - InnovateLab SA">EXP-2026-039 - InnovateLab SA</option>
                    <option value="EXP-2026-042 - GlobalTech Inc">EXP-2026-042 - GlobalTech Inc</option>
                    <option value="INTERNO - Bufete">INTERNO - Bufete</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm text-slate-400 mb-2">Actividad</label>
                  <textarea
                    value={newTimeForm.actividad}
                    onChange={(e) => setNewTimeForm({...newTimeForm, actividad: e.target.value})}
                    placeholder="Descripción de la actividad realizada..."
                    rows={3}
                    className="w-full px-4 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-white resize-none"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm text-slate-400 mb-2">Horas</label>
                    <input
                      type="number"
                      step="0.5"
                      placeholder="0.0"
                      value={newTimeForm.horas || (timerSeconds > 0 ? (timerSeconds / 3600).toFixed(2) : '')}
                      onChange={(e) => setNewTimeForm({...newTimeForm, horas: e.target.value})}
                      className="w-full px-4 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-slate-400 mb-2">Fecha</label>
                    <input 
                      type="date" 
                      value={newTimeForm.fecha}
                      onChange={(e) => setNewTimeForm({...newTimeForm, fecha: e.target.value})}
                      className="w-full px-4 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-white" 
                    />
                  </div>
                </div>
                <div className="flex items-center gap-3 p-3 bg-slate-800/50 rounded-xl">
                  <input 
                    type="checkbox" 
                    id="facturable" 
                    checked={newTimeForm.facturable}
                    onChange={(e) => setNewTimeForm({...newTimeForm, facturable: e.target.checked})}
                    className="w-4 h-4" 
                  />
                  <label htmlFor="facturable" className="text-sm text-slate-300">
                    Tiempo facturable al cliente
                  </label>
                </div>
              </div>
              <div className="flex gap-3 mt-6">
                <button onClick={() => setShowNewTimeModal(false)} className="flex-1 px-4 py-2.5 bg-slate-800 text-white rounded-xl hover:bg-slate-700">
                  Cancelar
                </button>
                <button onClick={handleSaveTime} className="flex-1 px-4 py-2.5 bg-blue-500 text-white font-medium rounded-xl hover:bg-blue-400">
                  Guardar Registro
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Modal Ver Registro */}
      <AnimatePresence>
        {activeModal === 'view' && selectedRegistro && (
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
                <h2 className="text-xl font-bold text-white">Detalle de Registro</h2>
                <button onClick={() => setActiveModal(null)} className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg">
                  <X className="w-5 h-5" />
                </button>
              </div>
              <div className="space-y-4">
                <div className="p-4 bg-slate-800/50 rounded-xl">
                  <p className="text-xs text-slate-400 mb-1">ID</p>
                  <p className="text-white font-mono">{selectedRegistro.id}</p>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-4 bg-slate-800/50 rounded-xl">
                    <p className="text-xs text-slate-400 mb-1">Fecha</p>
                    <p className="text-white">{selectedRegistro.fecha}</p>
                  </div>
                  <div className="p-4 bg-slate-800/50 rounded-xl">
                    <p className="text-xs text-slate-400 mb-1">Horas</p>
                    <p className="text-white font-bold">{formatHours(selectedRegistro.horas)}</p>
                  </div>
                </div>
                <div className="p-4 bg-slate-800/50 rounded-xl">
                  <p className="text-xs text-slate-400 mb-1">Expediente / Cliente</p>
                  <p className="text-white">{selectedRegistro.expediente}</p>
                  <p className="text-sm text-slate-400">{selectedRegistro.cliente}</p>
                </div>
                <div className="p-4 bg-slate-800/50 rounded-xl">
                  <p className="text-xs text-slate-400 mb-1">Actividad</p>
                  <p className="text-white">{selectedRegistro.actividad}</p>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-4 bg-slate-800/50 rounded-xl">
                    <p className="text-xs text-slate-400 mb-1">Tipo</p>
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                      selectedRegistro.facturable ? 'bg-emerald-500/20 text-emerald-400' : 'bg-slate-500/20 text-slate-400'
                    }`}>
                      {selectedRegistro.facturable ? 'Facturable' : 'No facturable'}
                    </span>
                  </div>
                  <div className="p-4 bg-slate-800/50 rounded-xl">
                    <p className="text-xs text-slate-400 mb-1">Estado</p>
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                      selectedRegistro.estado === 'aprobado' ? 'bg-emerald-500/20 text-emerald-400' :
                      selectedRegistro.estado === 'pendiente' ? 'bg-amber-500/20 text-amber-400' :
                      'bg-red-500/20 text-red-400'
                    }`}>
                      {selectedRegistro.estado === 'aprobado' ? 'Aprobado' : 
                       selectedRegistro.estado === 'pendiente' ? 'Pendiente' : 'Rechazado'}
                    </span>
                  </div>
                </div>
                {selectedRegistro.facturable && (
                  <div className="p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-xl">
                    <p className="text-xs text-emerald-400 mb-1">Valor a Facturar</p>
                    <p className="text-xl font-bold text-white">{formatCurrency(selectedRegistro.horas * selectedRegistro.tarifa)}</p>
                    <p className="text-xs text-slate-400">{formatCurrency(selectedRegistro.tarifa)}/hora</p>
                  </div>
                )}
              </div>
              <div className="mt-6">
                <button onClick={() => setActiveModal(null)} className="w-full px-4 py-2.5 bg-slate-800 text-white rounded-xl hover:bg-slate-700">
                  Cerrar
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Modal Editar Registro */}
      <AnimatePresence>
        {activeModal === 'edit' && selectedRegistro && (
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
                <h2 className="text-xl font-bold text-white">Editar Registro</h2>
                <button onClick={() => setActiveModal(null)} className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg">
                  <X className="w-5 h-5" />
                </button>
              </div>
              <div className="space-y-4">
                <div className="p-3 bg-slate-800/30 rounded-xl">
                  <p className="text-xs text-slate-400">Registro</p>
                  <p className="text-white font-medium">{selectedRegistro.id} - {selectedRegistro.expediente}</p>
                </div>
                <div>
                  <label className="block text-sm text-slate-400 mb-2">Actividad</label>
                  <textarea
                    value={editForm.actividad}
                    onChange={(e) => setEditForm({...editForm, actividad: e.target.value})}
                    rows={3}
                    className="w-full px-4 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-white resize-none"
                  />
                </div>
                <div>
                  <label className="block text-sm text-slate-400 mb-2">Horas</label>
                  <input
                    type="number"
                    step="0.5"
                    value={editForm.horas}
                    onChange={(e) => setEditForm({...editForm, horas: e.target.value})}
                    className="w-full px-4 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-white"
                  />
                </div>
                <div className="flex items-center gap-3 p-3 bg-slate-800/50 rounded-xl">
                  <input 
                    type="checkbox" 
                    id="editFacturable" 
                    checked={editForm.facturable}
                    onChange={(e) => setEditForm({...editForm, facturable: e.target.checked})}
                    className="w-4 h-4" 
                  />
                  <label htmlFor="editFacturable" className="text-sm text-slate-300">
                    Tiempo facturable al cliente
                  </label>
                </div>
              </div>
              <div className="flex gap-3 mt-6">
                <button onClick={() => setActiveModal(null)} className="flex-1 px-4 py-2.5 bg-slate-800 text-white rounded-xl hover:bg-slate-700">
                  Cancelar
                </button>
                <button onClick={handleEdit} className="flex-1 px-4 py-2.5 bg-blue-500 text-white font-medium rounded-xl hover:bg-blue-400">
                  Guardar Cambios
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Modal Eliminar Registro */}
      <AnimatePresence>
        {activeModal === 'delete' && selectedRegistro && (
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
                <h2 className="text-xl font-bold text-white">Eliminar Registro</h2>
                <button onClick={() => setActiveModal(null)} className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg">
                  <X className="w-5 h-5" />
                </button>
              </div>
              <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-xl mb-4">
                <p className="text-sm text-red-400 font-medium mb-2">⚠️ Esta acción no se puede deshacer</p>
                <p className="text-xs text-slate-400">Registro:</p>
                <p className="text-white font-medium">{selectedRegistro.id}</p>
                <p className="text-sm text-slate-300">{selectedRegistro.actividad}</p>
                <p className="text-lg font-bold text-white mt-2">{formatHours(selectedRegistro.horas)}</p>
              </div>
              <p className="text-sm text-slate-400 mb-6">
                ¿Estás seguro de que deseas eliminar este registro de tiempo permanentemente?
              </p>
              <div className="flex gap-3">
                <button onClick={() => setActiveModal(null)} className="flex-1 px-4 py-2.5 bg-slate-800 text-white rounded-xl hover:bg-slate-700">
                  Cancelar
                </button>
                <button onClick={handleDelete} className="flex-1 px-4 py-2.5 bg-red-500 text-white font-medium rounded-xl hover:bg-red-400">
                  Eliminar
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Modal Exportar */}
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
                <h2 className="text-xl font-bold text-white">Exportar Registros</h2>
                <button onClick={() => setActiveModal(null)} className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg">
                  <X className="w-5 h-5" />
                </button>
              </div>
              <div className="space-y-3">
                <button onClick={handleExport} className="w-full flex items-center gap-3 p-4 bg-slate-800/50 border border-slate-700 rounded-xl hover:border-blue-500/30 transition-all">
                  <FileText className="w-6 h-6 text-blue-500" />
                  <div className="text-left">
                    <p className="text-white font-medium">Exportar como PDF</p>
                    <p className="text-xs text-slate-400">Reporte formal de tiempo</p>
                  </div>
                </button>
                <button onClick={handleExport} className="w-full flex items-center gap-3 p-4 bg-slate-800/50 border border-slate-700 rounded-xl hover:border-blue-500/30 transition-all">
                  <BarChart4 className="w-6 h-6 text-emerald-500" />
                  <div className="text-left">
                    <p className="text-white font-medium">Exportar a Excel</p>
                    <p className="text-xs text-slate-400">Datos para análisis</p>
                  </div>
                </button>
                <button onClick={handleExport} className="w-full flex items-center gap-3 p-4 bg-slate-800/50 border border-slate-700 rounded-xl hover:border-blue-500/30 transition-all">
                  <Clock className="w-6 h-6 text-amber-500" />
                  <div className="text-left">
                    <p className="text-white font-medium">Formato CSV</p>
                    <p className="text-xs text-slate-400">Compatible con sistemas externos</p>
                  </div>
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </AppLayout>
  );
}

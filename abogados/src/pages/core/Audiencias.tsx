import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Plus, Calendar, Clock, MapPin, FileText, CheckCircle2,
  AlertCircle, Search, Eye, Edit2,
  Gavel, Building2,
  Lock, Crown, Briefcase, Users,
  Wrench, Car, X, Filter, ChevronLeft, ChevronRight
} from 'lucide-react';
import { AppLayout } from '@/components/layout/AppLayout';
import { 
  audienciasData, 
  tramitesData, 
  diligenciasData,
  getAudienciaStatusText,
  getTramiteStatusColor,
  getTramiteStatusText,
  getTramiteTypeColor,
  getTramiteTypeText,
  type Audiencia,
  type Tramite,
  type Diligencia
} from '@/data/audienciasData';
import { useRole } from '@/hooks/useRole';
import type { UserRole } from '@/types/roles';

type ActiveTab = 'audiencias' | 'tramites' | 'diligencias';

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

// Simulación de abogados junior supervisados por el senior
const getSupervisedJuniors = (seniorId: string): string[] => {
  const supervised: Record<string, string[]> = {
    'abogado_senior_1': ['abogado_junior_1', 'abogado_junior_2'],
    'abogado_senior_2': ['abogado_junior_3'],
  };
  return supervised[seniorId] || [];
};

// Simulación de expedientes en los que colabora un paralegal
const getParalegalCases = (paralegalId: string): string[] => {
  const cases: Record<string, string[]> = {
    'paralegal_1': ['EXP-2024-001', 'EXP-2024-003', 'EXP-2024-008'],
    'paralegal_2': ['EXP-2024-002', 'EXP-2024-005'],
  };
  return cases[paralegalId] || [];
};

export default function Audiencias() {
  const { role, roleConfig } = useRole();
  const currentUserId = getCurrentUserId(role);
  
  const [activeTab, setActiveTab] = useState<ActiveTab>('audiencias');
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedItem, setSelectedItem] = useState<Audiencia | Tramite | Diligencia | null>(null);
  const [calendarMonth, setCalendarMonth] = useState(new Date());

  // Determinar permisos según el rol
  const permissions = useMemo(() => {
    return {
      // Acceso al módulo (según PAGINAS_POR_ROL.md)
      hasAccess: ['super_admin', 'socio', 'abogado_senior', 'abogado_junior', 'paralegal', 'secretario'].includes(role),
      
      // Qué puede ver
      canViewAll: role === 'super_admin' || role === 'socio',
      canViewOwn: role === 'abogado_junior',
      canViewTeam: role === 'abogado_senior',
      canViewCollaboration: role === 'paralegal',
      canViewSupport: role === 'secretario',
      
      // Acciones
      canCreate: role === 'super_admin' || role === 'socio' || role === 'abogado_senior',
      canEdit: role === 'super_admin' || role === 'socio' || role === 'abogado_senior' || role === 'abogado_junior',
      canDelete: role === 'super_admin' || role === 'socio',
      canRegisterResults: role === 'super_admin' || role === 'socio' || role === 'abogado_senior' || role === 'abogado_junior',
    };
  }, [role]);

  // Filtrar audiencias según rol
  const filteredAudiencias = useMemo(() => {
    if (!permissions.hasAccess) return [];

    let filtered = audienciasData;

    switch (role) {
      case 'super_admin':
      case 'socio':
        // Ven todas las audiencias
        break;
      
      case 'abogado_senior':
        // Sus audiencias + las de sus juniors supervisados
        const supervisedJuniors = getSupervisedJuniors(currentUserId);
        filtered = audienciasData.filter(a => 
          a.lawyer === currentUserId || 
          supervisedJuniors.some(junior => a.lawyer?.includes(junior)) ||
          a.caseId?.includes('EXP-2024-00') // Simulación: casos del senior
        );
        break;
      
      case 'abogado_junior':
        // Solo sus audiencias asignadas
        filtered = audienciasData.filter(a => a.lawyer === currentUserId);
        break;
      
      case 'paralegal':
        // Audiencias de casos en los que colabora
        const paralegalCases = getParalegalCases(currentUserId);
        filtered = audienciasData.filter(a => 
          paralegalCases.some(caseId => a.caseId?.includes(caseId))
        );
        break;
      
      case 'secretario':
        // Apoyo en audiencias (audiencias donde participa como apoyo)
        filtered = audienciasData.filter(a => 
          a.notes?.toLowerCase().includes('secretario') ||
          a.type.toLowerCase().includes('notificación')
        );
        break;
      
      default:
        filtered = [];
    }

    // Aplicar filtros de búsqueda
    return filtered.filter(a => {
      const matchesSearch = 
        a.caseTitle?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        a.clientName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        a.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
        a.type.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesStatus = statusFilter === 'all' || a.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [role, currentUserId, permissions.hasAccess, searchQuery, statusFilter]);

  // Filtrar trámites según rol
  const filteredTramites = useMemo(() => {
    if (!permissions.hasAccess) return [];

    let filtered = tramitesData;

    switch (role) {
      case 'super_admin':
      case 'socio':
        break;
      
      case 'abogado_senior':
        const supervisedJuniors = getSupervisedJuniors(currentUserId);
        filtered = tramitesData.filter(t => 
          t.assignedTo === currentUserId || 
          supervisedJuniors.includes(t.assignedTo)
        );
        break;
      
      case 'abogado_junior':
        filtered = tramitesData.filter(t => t.assignedTo === currentUserId);
        break;
      
      case 'paralegal':
        const paralegalCases = getParalegalCases(currentUserId);
        filtered = tramitesData.filter(t => 
          t.assignedTo === currentUserId ||
          paralegalCases.some(caseId => t.caseId?.includes(caseId))
        );
        break;
      
      case 'secretario':
        filtered = tramitesData.filter(t => 
          t.type === 'administrativo' || t.type === 'notarial'
        );
        break;
      
      default:
        filtered = [];
    }

    return filtered.filter(t => {
      const matchesSearch = 
        t.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        t.caseTitle?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        t.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
        t.entity.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesStatus = statusFilter === 'all' || t.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [role, currentUserId, permissions.hasAccess, searchQuery, statusFilter]);

  // Filtrar diligencias según rol
  const filteredDiligencias = useMemo(() => {
    if (!permissions.hasAccess) return [];

    let filtered = diligenciasData;

    switch (role) {
      case 'super_admin':
      case 'socio':
        break;
      
      case 'abogado_senior':
        const supervisedJuniors = getSupervisedJuniors(currentUserId);
        filtered = diligenciasData.filter(d => 
          d.assignedTo === currentUserId || 
          supervisedJuniors.includes(d.assignedTo)
        );
        break;
      
      case 'abogado_junior':
        filtered = diligenciasData.filter(d => d.assignedTo === currentUserId);
        break;
      
      case 'paralegal':
        filtered = diligenciasData.filter(d => 
          d.assignedTo === currentUserId
        );
        break;
      
      case 'secretario':
        filtered = diligenciasData.filter(d => 
          d.assignedTo === currentUserId
        );
        break;
      
      default:
        filtered = [];
    }

    return filtered.filter(d => {
      const matchesSearch = 
        d.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        d.caseTitle?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        d.assignedToName.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesStatus = statusFilter === 'all' || d.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [role, currentUserId, permissions.hasAccess, searchQuery, statusFilter]);

  // Calcular estadísticas según rol
  const stats = useMemo(() => {
    const audienciasStats = {
      total: filteredAudiencias.length,
      scheduled: filteredAudiencias.filter(a => a.status === 'scheduled').length,
      completed: filteredAudiencias.filter(a => a.status === 'completed').length,
      postponed: filteredAudiencias.filter(a => a.status === 'postponed').length,
      thisWeek: filteredAudiencias.filter(a => {
        const date = new Date(a.date);
        const now = new Date();
        const oneWeek = 7 * 24 * 60 * 60 * 1000;
        return date >= now && date.getTime() - now.getTime() <= oneWeek;
      }).length,
    };

    const tramitesStats = {
      total: filteredTramites.length,
      pending: filteredTramites.filter(t => t.status === 'pending').length,
      inProgress: filteredTramites.filter(t => t.status === 'in_progress').length,
      completed: filteredTramites.filter(t => t.status === 'completed').length,
      delayed: filteredTramites.filter(t => t.status === 'delayed').length,
    };

    return { audiencias: audienciasStats, tramites: tramitesStats };
  }, [filteredAudiencias, filteredTramites]);

  // Títulos y mensajes según rol
  const getPageInfo = () => {
    switch (role) {
      case 'super_admin':
        return { 
          title: 'Todas las Audiencias y Trámites', 
          subtitle: 'Gestión completa del bufete'
        };
      case 'socio':
        return { 
          title: 'Audiencias del Bufete', 
          subtitle: 'Supervisión de audiencias y trámites'
        };
      case 'abogado_senior':
        return { 
          title: 'Mis Audiencias y Equipo', 
          subtitle: 'Gestión de audiencias de mi equipo'
        };
      case 'abogado_junior':
        return { 
          title: 'Mis Audiencias Asignadas', 
          subtitle: 'Audiencias bajo mi responsabilidad'
        };
      case 'paralegal':
        return { 
          title: 'Audiencias en Colaboración', 
          subtitle: 'Apoyo en audiencias de mis casos'
        };
      case 'secretario':
        return { 
          title: 'Apoyo en Audiencias', 
          subtitle: 'Gestión y organización de audiencias'
        };
      default:
        return { 
          title: 'Audiencias y Trámites', 
          subtitle: 'Acceso restringido'
        };
    }
  };

  const pageInfo = getPageInfo();

  // Mensaje de acceso denegado
  const getRoleMessage = () => {
    const messages: Record<UserRole, { title: string; description: string; actions: string[] }> = {
      super_admin: {
        title: 'Control Total de Audiencias',
        description: 'Puedes ver, crear, editar y gestionar todas las audiencias y trámites.',
        actions: ['Crear audiencias y trámites', 'Editar cualquier audiencia', 'Eliminar registros', 'Registrar resultados']
      },
      socio: {
        title: 'Supervisión de Audiencias',
        description: 'Acceso completo para supervisar todas las audiencias del bufete.',
        actions: ['Ver todas las audiencias', 'Crear nuevas audiencias', 'Asignar abogados', 'Generar reportes']
      },
      abogado_senior: {
        title: 'Gestión de Audiencias de Equipo',
        description: 'Puedes gestionar tus audiencias y las de los abogados junior a tu cargo.',
        actions: ['Ver audiencias del equipo', 'Crear audiencias', 'Asignar juniors', 'Registrar resultados']
      },
      abogado_junior: {
        title: 'Tus Audiencias Asignadas',
        description: 'Ves únicamente las audiencias asignadas a ti por tus supervisores.',
        actions: ['Ver tus audiencias', 'Actualizar información', 'Registrar asistencia', 'Solicitar cambios']
      },
      paralegal: {
        title: 'Audiencias en Colaboración',
        description: 'Audiencias de los casos en los que participas como apoyo legal.',
        actions: ['Ver audiencias de tus casos', 'Preparar documentación', 'Asistir a audiencias', 'Actualizar estatus']
      },
      secretario: {
        title: 'Apoyo en Audiencias',
        description: 'Gestión administrativa y logística de audiencias.',
        actions: ['Organizar documentación', 'Coordinar traslados', 'Notificar partes', 'Archivar resultados']
      },
      administrador: {
        title: 'Sin Acceso a Audiencias',
        description: 'Tu rol no tiene acceso al módulo de audiencias.',
        actions: ['Accede a Facturación', 'Gestiona cobranza', 'Administra proveedores']
      },
      contador: {
        title: 'Sin Acceso a Audiencias',
        description: 'Tu rol no tiene acceso al módulo de audiencias.',
        actions: ['Accede a Contabilidad', 'Revisa facturación', 'Genera reportes fiscales']
      },
      recepcionista: {
        title: 'Sin Acceso a Audiencias',
        description: 'Tu rol no tiene acceso al módulo de audiencias.',
        actions: ['Gestiona citas', 'Atiende llamadas', 'Actualiza contactos']
      },
    };

    return messages[role] || messages.recepcionista;
  };

  // Icono según rol
  const getRoleIcon = () => {
    switch (role) {
      case 'super_admin':
      case 'socio':
        return <Crown className="w-5 h-5" />;
      case 'abogado_senior':
        return <Briefcase className="w-5 h-5" />;
      case 'abogado_junior':
        return <Gavel className="w-5 h-5" />;
      case 'paralegal':
        return <Users className="w-5 h-5" />;
      default:
        return <Calendar className="w-5 h-5" />;
    }
  };

  // Si el rol no tiene acceso
  if (!permissions.hasAccess) {
    const message = getRoleMessage();
    return (
      <AppLayout 
        title="Audiencias y Trámites"
        subtitle="Acceso restringido"
      >
        <main className="flex-1 overflow-y-auto p-6 lg:p-8">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-2xl mx-auto mt-12"
          >
            <div className="p-8 bg-slate-100/60 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 rounded-2xl text-center">
              <div className="w-20 h-20 mx-auto mb-6 bg-slate-200 dark:bg-slate-800 rounded-full flex items-center justify-center">
                <Lock className="w-10 h-10 text-slate-400 dark:text-slate-600" />
              </div>
              <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">{message.title}</h2>
              <p className="text-slate-600 dark:text-slate-400 mb-6">{message.description}</p>
              
              <div className="p-4 bg-slate-200/50 dark:bg-slate-800/50 rounded-xl text-left">
                <p className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-3">Acciones disponibles para tu rol:</p>
                <ul className="space-y-2">
                  {message.actions.map((action, idx) => (
                    <li key={idx} className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400">
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
        <button className="hidden sm:flex items-center gap-2 px-4 py-2 bg-amber-500 text-slate-950 font-medium rounded-xl hover:bg-amber-400 transition-colors">
          <Plus className="w-4 h-4" />
          <span className="hidden lg:inline">
            {activeTab === 'audiencias' ? 'Nueva Audiencia' : 
             activeTab === 'tramites' ? 'Nuevo Trámite' : 'Nueva Diligencia'}
          </span>
        </button>
      )}
    </>
  );

  return (
    <AppLayout 
      title={pageInfo.title}
      subtitle={`${pageInfo.subtitle}${activeTab === 'audiencias' ? ` • ${filteredAudiencias.length} audiencias` : activeTab === 'tramites' ? ` • ${filteredTramites.length} trámites` : ` • ${filteredDiligencias.length} diligencias`}`}
      headerActions={headerActions}
    >
      <main className="flex-1 overflow-y-auto p-6 lg:p-8">
        {/* Stats Cards - Diseño mejorado */}
        {activeTab === 'audiencias' && (
          <>
            <div className="grid grid-cols-2 lg:grid-cols-5 gap-3 mb-6">
            {[
              { label: 'Total', value: stats.audiencias.total, color: 'slate', gradient: 'from-slate-500 to-slate-700', icon: Calendar, bg: 'bg-slate-100 dark:bg-slate-900' },
              { label: 'Programadas', value: stats.audiencias.scheduled, color: 'blue', gradient: 'from-blue-500 to-blue-700', icon: Clock, bg: 'bg-blue-50 dark:bg-blue-950/30' },
              { label: 'Celebradas', value: stats.audiencias.completed, color: 'emerald', gradient: 'from-emerald-500 to-emerald-700', icon: CheckCircle2, bg: 'bg-emerald-50 dark:bg-emerald-950/30' },
              { label: 'Aplazadas', value: stats.audiencias.postponed, color: 'amber', gradient: 'from-amber-500 to-amber-700', icon: AlertCircle, bg: 'bg-amber-50 dark:bg-amber-950/30' },
              { label: 'Esta Semana', value: stats.audiencias.thisWeek, color: 'purple', gradient: 'from-purple-500 to-purple-700', icon: Calendar, bg: 'bg-purple-50 dark:bg-purple-950/30' },
            ].map((stat, idx) => (
              <motion.div 
                key={stat.label}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.05 }}
                className={`${stat.bg} border border-slate-200 dark:border-slate-800 rounded-2xl p-4 hover:shadow-lg transition-all duration-300 group cursor-pointer`}
              >
                <div className="flex items-center justify-between mb-3">
                  <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${stat.gradient} flex items-center justify-center shadow-md group-hover:scale-110 transition-transform duration-300`}>
                    <stat.icon className="w-5 h-5 text-white" />
                  </div>
                  <span className="text-3xl font-bold text-slate-900 dark:text-white">{stat.value}</span>
                </div>
                <p className="text-sm font-medium text-slate-600 dark:text-slate-400">{stat.label}</p>
              </motion.div>
            ))}
          </div>
          
          {/* Mini Calendario */}
          <MiniCalendar 
            month={calendarMonth} 
            onMonthChange={setCalendarMonth} 
            audiencias={filteredAudiencias}
            onSelectAudiencia={setSelectedItem}
          />
          </>
        )}

        {activeTab === 'tramites' && (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
            {[
              { label: 'Total', value: stats.tramites.total, color: 'slate', gradient: 'from-slate-500 to-slate-700', icon: Building2, bg: 'bg-slate-100 dark:bg-slate-900' },
              { label: 'Pendientes', value: stats.tramites.pending, color: 'amber', gradient: 'from-amber-500 to-amber-700', icon: Clock, bg: 'bg-amber-50 dark:bg-amber-950/30' },
              { label: 'En Progreso', value: stats.tramites.inProgress, color: 'blue', gradient: 'from-blue-500 to-blue-700', icon: Wrench, bg: 'bg-blue-50 dark:bg-blue-950/30' },
              { label: 'Completados', value: stats.tramites.completed, color: 'emerald', gradient: 'from-emerald-500 to-emerald-700', icon: CheckCircle2, bg: 'bg-emerald-50 dark:bg-emerald-950/30' },
            ].map((stat, idx) => (
              <motion.div 
                key={stat.label}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.05 }}
                className={`${stat.bg} border border-slate-200 dark:border-slate-800 rounded-2xl p-4 hover:shadow-lg transition-all duration-300 group cursor-pointer`}
              >
                <div className="flex items-center justify-between mb-3">
                  <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${stat.gradient} flex items-center justify-center shadow-md group-hover:scale-110 transition-transform duration-300`}>
                    <stat.icon className="w-5 h-5 text-white" />
                  </div>
                  <span className="text-3xl font-bold text-slate-900 dark:text-white">{stat.value}</span>
                </div>
                <p className="text-sm font-medium text-slate-600 dark:text-slate-400">{stat.label}</p>
              </motion.div>
            ))}
          </div>
        )}

        {/* Tabs - Diseño mejorado */}
        <div className="flex gap-2 mb-6 p-1 bg-slate-100 dark:bg-slate-900 rounded-xl w-fit">
          {[
            { id: 'audiencias', label: 'Audiencias', count: filteredAudiencias.length, icon: Gavel },
            { id: 'tramites', label: 'Trámites', count: filteredTramites.length, icon: Building2 },
            { id: 'diligencias', label: 'Diligencias', count: filteredDiligencias.length, icon: Car },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => { setActiveTab(tab.id as ActiveTab); setSearchQuery(''); setStatusFilter('all'); }}
              className={`flex items-center gap-2 px-5 py-2.5 text-sm font-medium rounded-lg transition-all duration-300 ${
                activeTab === tab.id
                  ? 'bg-white dark:bg-slate-800 text-amber-600 dark:text-amber-500 shadow-md'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-white/50 dark:hover:bg-slate-800/50'
              }`}
            >
              <tab.icon className="w-4 h-4" />
              {tab.label}
              <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${
                activeTab === tab.id ? 'bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400' : 'bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-400'
              }`}>
                {tab.count}
              </span>
            </button>
          ))}
        </div>

        {/* Search and Filters - Diseño mejorado */}
        <div className="mb-6 space-y-4">
          <div className="flex flex-col lg:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
              <input
                type="text"
                placeholder={`Buscar ${activeTab} por cliente, expediente o tipo...`}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-12 pr-4 py-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 transition-all"
              />
              {searchQuery && (
                <button 
                  onClick={() => setSearchQuery('')}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>

            <div className="flex gap-3">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-4 py-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-900 dark:text-white focus:outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 transition-all cursor-pointer"
              >
                <option value="all">Todos los estados</option>
                {activeTab === 'audiencias' && (
                  <>
                    <option value="scheduled">Programada</option>
                    <option value="completed">Celebrada</option>
                    <option value="cancelled">Cancelada</option>
                    <option value="postponed">Aplazada</option>
                  </>
                )}
                {activeTab === 'tramites' && (
                  <>
                    <option value="pending">Pendiente</option>
                    <option value="in_progress">En Progreso</option>
                    <option value="completed">Completado</option>
                    <option value="delayed">Retrasado</option>
                  </>
                )}
                {activeTab === 'diligencias' && (
                  <>
                    <option value="pending">Pendiente</option>
                    <option value="completed">Completada</option>
                    <option value="cancelled">Cancelada</option>
                  </>
                )}
              </select>
              
              <button className="px-4 py-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-600 dark:text-slate-400 hover:text-amber-600 dark:hover:text-amber-500 hover:border-amber-500/50 transition-all flex items-center gap-2">
                <Filter className="w-4 h-4" />
                <span className="hidden sm:inline">Más filtros</span>
              </button>
            </div>
          </div>
        </div>

        {/* Content */}
        {activeTab === 'audiencias' && (
          <AudienciasTable 
            data={filteredAudiencias} 
            onSelect={setSelectedItem}
            permissions={permissions}
          />
        )}
        {activeTab === 'tramites' && (
          <TramitesTable 
            data={filteredTramites} 
            onSelect={setSelectedItem}
            permissions={permissions}
          />
        )}
        {activeTab === 'diligencias' && (
          <DiligenciasTable 
            data={filteredDiligencias} 
            onSelect={setSelectedItem}
            permissions={permissions}
          />
        )}

        {/* Info del rol */}
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="mt-6 p-4 bg-slate-100/40 dark:bg-slate-900/40 border border-slate-200 dark:border-slate-800 rounded-xl"
        >
          <div className="flex items-start gap-3">
            <div className={`p-2 rounded-lg ${roleConfig.bgColor}`}>
              {getRoleIcon()}
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <h4 className="text-sm font-medium text-slate-900 dark:text-white">
                  {getRoleMessage().title}
                </h4>
                <span className={`text-xs px-2 py-0.5 rounded-full ${roleConfig.bgColor} ${roleConfig.textColor}`}>
                  {roleConfig.name}
                </span>
              </div>
              <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">
                {getRoleMessage().description}
              </p>
              <div className="mt-3 flex flex-wrap gap-2">
                {getRoleMessage().actions.slice(0, 3).map((action, idx) => (
                  <span 
                    key={idx}
                    className="inline-flex items-center gap-1.5 text-xs text-slate-600 dark:text-slate-400 px-2 py-1 bg-slate-200/50 dark:bg-slate-800/50 rounded-lg"
                  >
                    <div className="w-1 h-1 bg-amber-500 rounded-full" />
                    {action}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </motion.div>

        {/* Modal de Detalle */}
        {selectedItem && activeTab === 'audiencias' && (
          <AudienciaModal 
            audiencia={selectedItem as Audiencia} 
            onClose={() => setSelectedItem(null)}
            permissions={permissions}
          />
        )}
        {selectedItem && activeTab === 'tramites' && (
          <TramiteModal 
            tramite={selectedItem as Tramite} 
            onClose={() => setSelectedItem(null)}
            permissions={permissions}
          />
        )}
      </main>
    </AppLayout>
  );
}

// Sub-componentes

interface Permissions {
  canEdit: boolean;
  canDelete: boolean;
  canRegisterResults: boolean;
}

function AudienciasTable({ data, onSelect, permissions }: { data: Audiencia[], onSelect: (a: Audiencia) => void, permissions: Permissions }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
      <AnimatePresence>
        {data.map((audiencia, index) => (
          <motion.div 
            key={audiencia.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ delay: index * 0.03 }}
            className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 hover:shadow-xl hover:border-amber-500/30 transition-all duration-300 cursor-pointer group"
            onClick={() => onSelect(audiencia)}
          >
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                  audiencia.status === 'scheduled' ? 'bg-blue-100 dark:bg-blue-900/30' :
                  audiencia.status === 'completed' ? 'bg-emerald-100 dark:bg-emerald-900/30' :
                  audiencia.status === 'postponed' ? 'bg-amber-100 dark:bg-amber-900/30' :
                  'bg-red-100 dark:bg-red-900/30'
                }`}>
                  <Gavel className={`w-6 h-6 ${
                    audiencia.status === 'scheduled' ? 'text-blue-600 dark:text-blue-400' :
                    audiencia.status === 'completed' ? 'text-emerald-600 dark:text-emerald-400' :
                    audiencia.status === 'postponed' ? 'text-amber-600 dark:text-amber-400' :
                    'text-red-600 dark:text-red-400'
                  }`} />
                </div>
                <div>
                  <h3 className="font-semibold text-slate-900 dark:text-white group-hover:text-amber-600 dark:group-hover:text-amber-500 transition-colors">{audiencia.type}</h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">{audiencia.id}</p>
                </div>
              </div>
              <span className={`px-3 py-1 text-xs font-semibold rounded-full ${
                audiencia.status === 'scheduled' ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400' :
                audiencia.status === 'completed' ? 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400' :
                audiencia.status === 'postponed' ? 'bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400' :
                'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400'
              }`}>
                {getAudienciaStatusText(audiencia.status)}
              </span>
            </div>
            
            {audiencia.caseTitle && (
              <div className="mb-4 p-3 bg-slate-50 dark:bg-slate-800/50 rounded-xl">
                <p className="text-sm font-medium text-slate-900 dark:text-white">{audiencia.caseTitle}</p>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">{audiencia.clientName}</p>
              </div>
            )}
            
            <div className="flex items-center gap-4 text-sm text-slate-600 dark:text-slate-400">
              <div className="flex items-center gap-1.5">
                <Calendar className="w-4 h-4" />
                <span>{new Date(audiencia.date).toLocaleDateString('es-ES', { day: '2-digit', month: 'short' })}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Clock className="w-4 h-4" />
                <span>{audiencia.time}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <MapPin className="w-4 h-4" />
                <span className="truncate max-w-[100px]">{audiencia.location.split(',')[0]}</span>
              </div>
            </div>
            
            <div className="flex items-center justify-end gap-2 mt-4 pt-4 border-t border-slate-100 dark:border-slate-800">
              <button 
                onClick={(e) => { e.stopPropagation(); onSelect(audiencia); }}
                className="p-2 text-slate-500 dark:text-slate-400 hover:text-amber-600 dark:hover:text-amber-500 hover:bg-amber-500/10 rounded-lg transition-colors"
              >
                <Eye className="w-4 h-4" />
              </button>
              {permissions.canEdit && (
                <button 
                  onClick={(e) => e.stopPropagation()}
                  className="p-2 text-slate-500 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-500 hover:bg-blue-500/10 rounded-lg transition-colors"
                >
                  <Edit2 className="w-4 h-4" />
                </button>
              )}
            </div>
          </motion.div>
        ))}
      </AnimatePresence>
      {data.length === 0 && (
        <div className="col-span-full p-12 text-center">
          <Calendar className="w-16 h-16 text-slate-300 dark:text-slate-600 mx-auto mb-4" />
          <p className="text-lg font-medium text-slate-600 dark:text-slate-400">No se encontraron audiencias</p>
          <p className="text-sm text-slate-500 dark:text-slate-500 mt-1">Intenta ajustar los filtros de búsqueda</p>
        </div>
      )}
    </div>
  );
}

function TramitesTable({ data, onSelect, permissions }: { data: Tramite[], onSelect: (t: Tramite) => void, permissions: Permissions }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
      <AnimatePresence>
        {data.map((tramite, index) => (
          <motion.div 
            key={tramite.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ delay: index * 0.03 }}
            className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 hover:shadow-xl hover:border-amber-500/30 transition-all duration-300 cursor-pointer group"
            onClick={() => onSelect(tramite)}
          >
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                  tramite.status === 'pending' ? 'bg-amber-100 dark:bg-amber-900/30' :
                  tramite.status === 'in_progress' ? 'bg-blue-100 dark:bg-blue-900/30' :
                  tramite.status === 'completed' ? 'bg-emerald-100 dark:bg-emerald-900/30' :
                  'bg-red-100 dark:bg-red-900/30'
                }`}>
                  <Building2 className={`w-6 h-6 ${
                    tramite.status === 'pending' ? 'text-amber-600 dark:text-amber-400' :
                    tramite.status === 'in_progress' ? 'text-blue-600 dark:text-blue-400' :
                    tramite.status === 'completed' ? 'text-emerald-600 dark:text-emerald-400' :
                    'text-red-600 dark:text-red-400'
                  }`} />
                </div>
                <div>
                  <h3 className="font-semibold text-slate-900 dark:text-white group-hover:text-amber-600 dark:group-hover:text-amber-500 transition-colors line-clamp-1">{tramite.title}</h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">{tramite.id}</p>
                </div>
              </div>
              <div className="flex flex-col items-end gap-2">
                <span className={`px-3 py-1 text-xs font-semibold rounded-full ${
                  tramite.status === 'pending' ? 'bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400' :
                  tramite.status === 'in_progress' ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400' :
                  tramite.status === 'completed' ? 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400' :
                  'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400'
                }`}>
                  {getTramiteStatusText(tramite.status)}
                </span>
                <span className={`px-2 py-0.5 text-xs rounded-full border ${
                  tramite.type === 'administrativo' ? 'bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-400 border-purple-200 dark:border-purple-800' :
                  tramite.type === 'judicial' ? 'bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-400 border-indigo-200 dark:border-indigo-800' :
                  'bg-cyan-100 dark:bg-cyan-900/30 text-cyan-700 dark:text-cyan-400 border-cyan-200 dark:border-cyan-800'
                }`}>
                  {getTramiteTypeText(tramite.type)}
                </span>
              </div>
            </div>
            
            <p className="text-sm text-slate-600 dark:text-slate-400 mb-4 line-clamp-2">{tramite.description}</p>
            
            <div className="flex items-center gap-3 mb-4 p-3 bg-slate-50 dark:bg-slate-800/50 rounded-xl">
              <div className="w-8 h-8 bg-gradient-to-br from-slate-300 to-slate-400 dark:from-slate-600 dark:to-slate-700 rounded-full flex items-center justify-center text-xs font-medium text-white">
                {tramite.assignedToName.split(' ').map((n: string) => n[0]).join('')}
              </div>
              <div>
                <p className="text-sm font-medium text-slate-700 dark:text-slate-300">{tramite.assignedToName}</p>
                <p className="text-xs text-slate-500 dark:text-slate-400">{tramite.entity}</p>
              </div>
            </div>
            
            <div className="flex items-center justify-between text-sm">
              <div className="flex items-center gap-1.5">
                <Clock className={`w-4 h-4 ${tramite.status === 'delayed' ? 'text-red-500' : 'text-slate-500 dark:text-slate-400'}`} />
                <span className={tramite.status === 'delayed' ? 'text-red-600 dark:text-red-400 font-medium' : 'text-slate-600 dark:text-slate-400'}>
                  Vence: {new Date(tramite.dueDate).toLocaleDateString('es-ES', { day: '2-digit', month: 'short' })}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <button 
                  onClick={(e) => { e.stopPropagation(); onSelect(tramite); }}
                  className="p-2 text-slate-500 dark:text-slate-400 hover:text-amber-600 dark:hover:text-amber-500 hover:bg-amber-500/10 rounded-lg transition-colors"
                >
                  <Eye className="w-4 h-4" />
                </button>
                {permissions.canEdit && (
                  <button 
                    onClick={(e) => e.stopPropagation()}
                    className="p-2 text-slate-500 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-500 hover:bg-blue-500/10 rounded-lg transition-colors"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>
          </motion.div>
        ))}
      </AnimatePresence>
      {data.length === 0 && (
        <div className="col-span-full p-12 text-center">
          <Building2 className="w-16 h-16 text-slate-300 dark:text-slate-600 mx-auto mb-4" />
          <p className="text-lg font-medium text-slate-600 dark:text-slate-400">No se encontraron trámites</p>
          <p className="text-sm text-slate-500 dark:text-slate-500 mt-1">Intenta ajustar los filtros de búsqueda</p>
        </div>
      )}
    </div>
  );
}

function DiligenciasTable({ data, onSelect, permissions }: { data: Diligencia[], onSelect: (d: Diligencia) => void, permissions: Permissions }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
      <AnimatePresence>
        {data.map((diligencia, index) => (
          <motion.div 
            key={diligencia.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ delay: index * 0.03 }}
            className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 hover:shadow-xl hover:border-amber-500/30 transition-all duration-300 cursor-pointer group"
            onClick={() => onSelect(diligencia)}
          >
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                  diligencia.status === 'completed' ? 'bg-emerald-100 dark:bg-emerald-900/30' :
                  diligencia.status === 'pending' ? 'bg-amber-100 dark:bg-amber-900/30' :
                  'bg-red-100 dark:bg-red-900/30'
                }`}>
                  <Car className={`w-6 h-6 ${
                    diligencia.status === 'completed' ? 'text-emerald-600 dark:text-emerald-400' :
                    diligencia.status === 'pending' ? 'text-amber-600 dark:text-amber-400' :
                    'text-red-600 dark:text-red-400'
                  }`} />
                </div>
                <div>
                  <h3 className="font-semibold text-slate-900 dark:text-white group-hover:text-amber-600 dark:group-hover:text-amber-500 transition-colors line-clamp-1">{diligencia.title}</h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">{diligencia.id}</p>
                </div>
              </div>
              <span className={`px-3 py-1 text-xs font-semibold rounded-full ${
                diligencia.status === 'completed' ? 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400' :
                diligencia.status === 'pending' ? 'bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400' :
                'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400'
              }`}>
                {diligencia.status === 'completed' ? 'Completada' : diligencia.status === 'pending' ? 'Pendiente' : 'Cancelada'}
              </span>
            </div>
            
            <p className="text-sm text-slate-600 dark:text-slate-400 mb-4 line-clamp-2">{diligencia.description}</p>
            
            {diligencia.caseTitle && (
              <div className="mb-4 p-3 bg-slate-50 dark:bg-slate-800/50 rounded-xl">
                <p className="text-sm font-medium text-slate-700 dark:text-slate-300">{diligencia.caseTitle}</p>
              </div>
            )}
            
            <div className="flex items-center gap-3 mb-4 p-3 bg-slate-50 dark:bg-slate-800/50 rounded-xl">
              <div className="w-8 h-8 bg-gradient-to-br from-slate-300 to-slate-400 dark:from-slate-600 dark:to-slate-700 rounded-full flex items-center justify-center text-xs font-medium text-white">
                {diligencia.assignedToName.split(' ').map((n: string) => n[0]).join('')}
              </div>
              <div>
                <p className="text-sm font-medium text-slate-700 dark:text-slate-300">{diligencia.assignedToName}</p>
                <p className="text-xs text-slate-500 dark:text-slate-400">Responsable</p>
              </div>
            </div>
            
            <div className="flex items-center justify-between text-sm">
              <div className="flex items-center gap-1.5">
                <Calendar className="w-4 h-4 text-slate-500 dark:text-slate-400" />
                <span className="text-slate-600 dark:text-slate-400">
                  {new Date(diligencia.date).toLocaleDateString('es-ES', { day: '2-digit', month: 'short', year: 'numeric' })}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <button 
                  onClick={(e) => { e.stopPropagation(); onSelect(diligencia); }}
                  className="p-2 text-slate-500 dark:text-slate-400 hover:text-amber-600 dark:hover:text-amber-500 hover:bg-amber-500/10 rounded-lg transition-colors"
                >
                  <Eye className="w-4 h-4" />
                </button>
                {permissions.canEdit && (
                  <button 
                    onClick={(e) => e.stopPropagation()}
                    className="p-2 text-slate-500 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-500 hover:bg-blue-500/10 rounded-lg transition-colors"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>
          </motion.div>
        ))}
      </AnimatePresence>
      {data.length === 0 && (
        <div className="col-span-full p-12 text-center">
          <Gavel className="w-16 h-16 text-slate-300 dark:text-slate-600 mx-auto mb-4" />
          <p className="text-lg font-medium text-slate-600 dark:text-slate-400">No se encontraron diligencias</p>
          <p className="text-sm text-slate-500 dark:text-slate-500 mt-1">Intenta ajustar los filtros de búsqueda</p>
        </div>
      )}
    </div>
  );
}

function AudienciaModal({ audiencia, onClose, permissions }: { audiencia: Audiencia, onClose: () => void, permissions: Permissions }) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="fixed inset-0 bg-black/60 backdrop-blur-md z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        onClick={(e) => e.stopPropagation()}
        className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden shadow-2xl"
      >
        {/* Header con gradiente */}
        <div className={`relative p-6 border-b border-slate-200 dark:border-slate-800 ${
          audiencia.status === 'scheduled' ? 'bg-gradient-to-r from-blue-500 to-blue-600' :
          audiencia.status === 'completed' ? 'bg-gradient-to-r from-emerald-500 to-emerald-600' :
          audiencia.status === 'postponed' ? 'bg-gradient-to-r from-amber-500 to-amber-600' :
          'bg-gradient-to-r from-red-500 to-red-600'
        }`}>
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center">
                <Gavel className="w-7 h-7 text-white" />
              </div>
              <div>
                <span className="inline-flex items-center px-3 py-1 text-xs font-semibold rounded-full bg-white/20 text-white backdrop-blur-sm">
                  {getAudienciaStatusText(audiencia.status)}
                </span>
                <h2 className="text-xl font-bold text-white mt-2">{audiencia.type}</h2>
                <p className="text-sm text-white/80">{audiencia.id}</p>
              </div>
            </div>
            <button onClick={onClose} className="p-2 bg-white/20 hover:bg-white/30 rounded-xl transition-colors">
              <X className="w-5 h-5 text-white" />
            </button>
          </div>
          <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-white/30 to-transparent" />
        </div>
        
        <div className="p-6 space-y-5 max-h-[60vh] overflow-y-auto">
          {audiencia.caseTitle && (
            <div className="p-4 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-xl">
              <p className="text-xs font-medium text-amber-600 dark:text-amber-400 mb-1">Expediente</p>
              <p className="text-slate-900 dark:text-white font-semibold">{audiencia.caseTitle}</p>
              <p className="text-sm text-slate-500 dark:text-slate-400">{audiencia.caseId}</p>
            </div>
          )}

          <div className="grid grid-cols-2 gap-4">
            <div className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-xl">
              <p className="text-xs font-medium text-slate-500 dark:text-slate-400 mb-1">Cliente</p>
              <p className="text-slate-900 dark:text-white font-medium">{audiencia.clientName}</p>
            </div>
            <div className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-xl">
              <p className="text-xs font-medium text-slate-500 dark:text-slate-400 mb-1">Abogado</p>
              <p className="text-slate-900 dark:text-white font-medium">{audiencia.lawyer}</p>
            </div>
            <div className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-xl">
              <p className="text-xs font-medium text-slate-500 dark:text-slate-400 mb-1">Fecha y Hora</p>
              <p className="text-slate-900 dark:text-white font-medium">
                {new Date(audiencia.date).toLocaleDateString('es-ES', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
              </p>
              <p className="text-sm text-amber-600 dark:text-amber-400 font-medium">{audiencia.time}</p>
            </div>
            <div className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-xl">
              <p className="text-xs font-medium text-slate-500 dark:text-slate-400 mb-1">Juez/Magistrado</p>
              <p className="text-slate-900 dark:text-white font-medium">{audiencia.judge || 'Por determinar'}</p>
            </div>
          </div>

          <div className="p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-xl">
            <div className="flex items-start gap-3">
              <MapPin className="w-5 h-5 text-blue-600 dark:text-blue-400 mt-0.5" />
              <div>
                <p className="text-xs font-medium text-blue-600 dark:text-blue-400 mb-1">Ubicación</p>
                <p className="text-slate-900 dark:text-white">{audiencia.location}</p>
              </div>
            </div>
          </div>

          {audiencia.notes && (
            <div className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-xl">
              <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">Notas</h3>
              <p className="text-slate-600 dark:text-slate-400">{audiencia.notes}</p>
            </div>
          )}

          {audiencia.result && (
            <div className="p-4 bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800 rounded-xl">
              <h3 className="text-sm font-semibold text-emerald-700 dark:text-emerald-400 mb-2">Resultado</h3>
              <p className="text-emerald-800 dark:text-emerald-300">{audiencia.result}</p>
            </div>
          )}

          {audiencia.documents.length > 0 && (
            <div>
              <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-3">Documentos requeridos</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {audiencia.documents.map((doc, i) => (
                  <div key={i} className="flex items-center gap-3 p-3 bg-slate-50 dark:bg-slate-800/50 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer">
                    <div className="w-8 h-8 bg-amber-100 dark:bg-amber-900/30 rounded-lg flex items-center justify-center">
                      <FileText className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                    </div>
                    <span className="text-sm text-slate-700 dark:text-slate-300">{doc}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="p-6 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 flex justify-between items-center">
          <button onClick={onClose} className="px-5 py-2.5 text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200 dark:hover:bg-slate-800 rounded-xl transition-colors font-medium">
            Cerrar
          </button>
          {audiencia.status === 'scheduled' && permissions.canRegisterResults && (
            <button className="px-5 py-2.5 bg-gradient-to-r from-emerald-500 to-emerald-600 text-white font-semibold rounded-xl hover:from-emerald-400 hover:to-emerald-500 transition-all shadow-lg shadow-emerald-500/25 flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4" />
              Registrar Resultado
            </button>
          )}
        </div>
      </motion.div>
    </motion.div>
  );
}

function TramiteModal({ tramite, onClose, permissions }: { tramite: Tramite, onClose: () => void, permissions: Permissions }) {
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
        className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
      >
        <div className="p-6 border-b border-slate-200 dark:border-slate-800 flex items-start justify-between">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <span className={`px-3 py-1 text-xs font-medium rounded-full border ${getTramiteStatusColor(tramite.status)}`}>
                {getTramiteStatusText(tramite.status)}
              </span>
              <span className={`px-3 py-1 text-xs font-medium rounded-full border ${getTramiteTypeColor(tramite.type)}`}>
                {getTramiteTypeText(tramite.type)}
              </span>
            </div>
            <h2 className="text-xl font-bold text-slate-900 dark:text-white">{tramite.title}</h2>
            <p className="text-slate-500 dark:text-slate-400">{tramite.id}</p>
          </div>
          <button onClick={onClose} className="p-2 text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg">
            <AlertCircle className="w-5 h-5" />
          </button>
        </div>
        
        <div className="p-6 space-y-6">
          <div>
            <h3 className="text-sm font-medium text-slate-600 dark:text-slate-400 mb-2">Descripción</h3>
            <p className="text-slate-700 dark:text-slate-300">{tramite.description}</p>
          </div>

          {tramite.caseTitle && (
            <div className="p-4 bg-slate-100/50 dark:bg-slate-800/50 rounded-xl">
              <p className="text-xs text-slate-500 dark:text-slate-400 mb-1">Expediente relacionado</p>
              <p className="text-slate-900 dark:text-white font-medium">{tramite.caseTitle}</p>
              <p className="text-sm text-slate-500 dark:text-slate-400">{tramite.caseId}</p>
            </div>
          )}

          <div className="grid grid-cols-2 gap-4">
            <div className="p-4 bg-slate-100/50 dark:bg-slate-800/50 rounded-xl">
              <p className="text-xs text-slate-500 dark:text-slate-400 mb-1">Entidad</p>
              <p className="text-slate-900 dark:text-white font-medium">{tramite.entity}</p>
            </div>
            <div className="p-4 bg-slate-100/50 dark:bg-slate-800/50 rounded-xl">
              <p className="text-xs text-slate-500 dark:text-slate-400 mb-1">Coste</p>
              <p className="text-slate-900 dark:text-white font-medium">{tramite.cost ? `€${tramite.cost.toFixed(2)}` : 'Sin coste'}</p>
            </div>
            <div className="p-4 bg-slate-100/50 dark:bg-slate-800/50 rounded-xl">
              <p className="text-xs text-slate-500 dark:text-slate-400 mb-1">Asignado a</p>
              <p className="text-slate-900 dark:text-white font-medium">{tramite.assignedToName}</p>
            </div>
            <div className="p-4 bg-slate-100/50 dark:bg-slate-800/50 rounded-xl">
              <p className="text-xs text-slate-500 dark:text-slate-400 mb-1">Fecha límite</p>
              <p className={`font-medium ${tramite.status === 'delayed' ? 'text-red-600 dark:text-red-400' : 'text-slate-900 dark:text-white'}`}>
                {new Date(tramite.dueDate).toLocaleDateString('es-ES')}
              </p>
            </div>
          </div>

          {tramite.documents.length > 0 && (
            <div>
              <h3 className="text-sm font-medium text-slate-600 dark:text-slate-400 mb-2">Documentos</h3>
              <div className="space-y-2">
                {tramite.documents.map((doc, i) => (
                  <div key={i} className="flex items-center gap-3 p-3 bg-slate-100/50 dark:bg-slate-800/50 rounded-lg">
                    <FileText className="w-5 h-5 text-amber-500" />
                    <span className="text-slate-700 dark:text-slate-300">{doc}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {tramite.observations.length > 0 && (
            <div>
              <h3 className="text-sm font-medium text-slate-600 dark:text-slate-400 mb-2">Observaciones</h3>
              <ul className="space-y-2">
                {tramite.observations.map((obs, i) => (
                  <li key={i} className="flex items-start gap-2 text-slate-700 dark:text-slate-300">
                    <AlertCircle className="w-4 h-4 text-amber-500 mt-0.5 flex-shrink-0" />
                    {obs}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>

        <div className="p-6 border-t border-slate-200 dark:border-slate-800 flex justify-end gap-3">
          <button onClick={onClose} className="px-4 py-2 text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white transition-colors">
            Cerrar
          </button>
          {tramite.status !== 'completed' && permissions.canEdit && (
            <button className="px-4 py-2 bg-emerald-500 text-white dark:text-slate-950 font-medium rounded-xl hover:bg-emerald-400 transition-colors">
              Marcar completado
            </button>
          )}
        </div>
      </motion.div>
    </motion.div>
  );
}

function MiniCalendar({ 
  month, 
  onMonthChange, 
  audiencias,
  onSelectAudiencia
}: { 
  month: Date, 
  onMonthChange: (date: Date) => void, 
  audiencias: Audiencia[],
  onSelectAudiencia: (a: Audiencia) => void
}) {
  const today = new Date();
  const daysInMonth = new Date(month.getFullYear(), month.getMonth() + 1, 0).getDate();
  const firstDayOfMonth = new Date(month.getFullYear(), month.getMonth(), 1).getDay();
  
  const prevMonth = () => {
    onMonthChange(new Date(month.getFullYear(), month.getMonth() - 1, 1));
  };
  
  const nextMonth = () => {
    onMonthChange(new Date(month.getFullYear(), month.getMonth() + 1, 1));
  };

  const getAudienciasForDay = (day: number) => {
    return audiencias.filter(a => {
      const date = new Date(a.date);
      return date.getDate() === day && 
             date.getMonth() === month.getMonth() && 
             date.getFullYear() === month.getFullYear();
    });
  };

  const isToday = (day: number) => {
    return day === today.getDate() && 
           month.getMonth() === today.getMonth() && 
           month.getFullYear() === today.getFullYear();
  };

  const weekDays = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];
  const monthNames = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 mb-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
          {monthNames[month.getMonth()]} {month.getFullYear()}
        </h3>
        <div className="flex items-center gap-1">
          <button 
            onClick={prevMonth}
            className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
          >
            <ChevronLeft className="w-5 h-5 text-slate-600 dark:text-slate-400" />
          </button>
          <button 
            onClick={() => onMonthChange(new Date())}
            className="px-3 py-1.5 text-sm font-medium text-amber-600 dark:text-amber-500 hover:bg-amber-50 dark:hover:bg-amber-900/20 rounded-lg transition-colors"
          >
            Hoy
          </button>
          <button 
            onClick={nextMonth}
            className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
          >
            <ChevronRight className="w-5 h-5 text-slate-600 dark:text-slate-400" />
          </button>
        </div>
      </div>
      
      <div className="grid grid-cols-7 gap-1 mb-2">
        {weekDays.map(day => (
          <div key={day} className="text-center text-xs font-medium text-slate-500 dark:text-slate-400 py-2">
            {day}
          </div>
        ))}
      </div>
      
      <div className="grid grid-cols-7 gap-1">
        {Array.from({ length: firstDayOfMonth }).map((_, i) => (
          <div key={`empty-${i}`} className="aspect-square" />
        ))}
        {Array.from({ length: daysInMonth }).map((_, i) => {
          const day = i + 1;
          const dayAudiencias = getAudienciasForDay(day);
          const hasAudiencias = dayAudiencias.length > 0;
          const isTodayDate = isToday(day);
          
          return (
            <button
              key={day}
              onClick={() => dayAudiencias.length > 0 && onSelectAudiencia(dayAudiencias[0])}
              className={`aspect-square rounded-xl flex flex-col items-center justify-center text-sm transition-all relative ${
                isTodayDate 
                  ? 'bg-amber-500 text-white font-bold shadow-lg shadow-amber-500/30' 
                  : hasAudiencias
                    ? 'bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 hover:bg-blue-100 dark:hover:bg-blue-900/50'
                    : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              {day}
              {hasAudiencias && (
                <div className={`absolute bottom-1 w-1 h-1 rounded-full ${
                  isTodayDate ? 'bg-white' : 'bg-blue-500'
                }`} />
              )}
            </button>
          );
        })}
      </div>
      
      {audiencias.filter(a => {
        const date = new Date(a.date);
        return date.getMonth() === month.getMonth() && date.getFullYear() === month.getFullYear();
      }).length > 0 && (
        <div className="mt-4 pt-4 border-t border-slate-200 dark:border-slate-800">
          <p className="text-xs font-medium text-slate-500 dark:text-slate-400 mb-2">
            Audiencias este mes: {audiencias.filter(a => {
              const date = new Date(a.date);
              return date.getMonth() === month.getMonth() && date.getFullYear() === month.getFullYear();
            }).length}
          </p>
        </div>
      )}
    </div>
  );
}

import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Plus, Filter, CheckCircle2, Clock, AlertCircle, 
  Calendar, ArrowUpDown, Eye, Edit2,
  MessageSquare, Flag, Trash2, Search, X, CheckCircle, Info,
  Lock, Crown, Briefcase, Users, FileText,
  ChevronDown, Layers, List, Bell, Pin,
  MoreHorizontal, User, Zap, Target, TrendingUp
} from 'lucide-react';
import { AppLayout } from '@/components/layout/AppLayout';
import { 
  tareasData as initialTareasData, 
  getPriorityColor, 
  getPriorityText, 
  getStatusColor, 
  getStatusText,
  type Tarea 
} from '@/data/tareasData';
import { useRole } from '@/hooks/useRole';
import type { UserRole } from '@/types/roles';

type ModalType = 'create' | 'edit' | 'delete' | null;

// Simulación de asignaciones de tareas por rol
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

export default function Tareas() {
  const { role, roleConfig } = useRole();
  const currentUserId = getCurrentUserId(role);
  
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [priorityFilter, setPriorityFilter] = useState('all');
  const [assigneeFilter, setAssigneeFilter] = useState('all');
const [viewMode, setViewMode] = useState<'list' | 'kanban'>('list');
  const [showFilterPanel, setShowFilterPanel] = useState(false);
  const [selectedTask, setSelectedTask] = useState<Tarea | null>(null);
  const [selectedTasks, setSelectedTasks] = useState<string[]>([]);
  const [sortBy, setSortBy] = useState<'title' | 'dueDate' | 'priority' | 'status'>('dueDate');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  const [activeModal, setActiveModal] = useState<ModalType>(null);
  const [editingTask, setEditingTask] = useState<Tarea | null>(null);
  const [toast, setToast] = useState<{message: string; type: 'success' | 'info' | 'error'} | null>(null);
  
  // Datos mutables
  const [tareasData, setTareasData] = useState<Tarea[]>(initialTareasData);
  
  // Form states
  const [newTaskForm, setNewTaskForm] = useState({
    title: '',
    description: '',
    priority: 'medium',
    status: 'pending',
    dueDate: new Date(Date.now() + 7*24*60*60*1000).toISOString().split('T')[0],
    assignedTo: 'current-user',
    assignedToName: 'Usuario Actual',
    expedienteId: '',
    expedienteTitle: '',
    tags: ''
  });

  // Determinar permisos según el rol
  const permissions = useMemo(() => {
    // Acceso a módulos disponible en roleConfig.permissions.modules
    
    return {
      // Acceso al módulo
      hasAccess: role !== 'administrador' && role !== 'contador' && role !== 'recepcionista',
      
      // Qué tareas puede ver
      canViewAll: role === 'super_admin' || role === 'socio',
      canViewOwn: role === 'abogado_senior' || role === 'abogado_junior' || role === 'paralegal' || role === 'secretario',
      canViewTeam: role === 'abogado_senior',
      
      // Acciones
      canCreate: role === 'super_admin' || role === 'socio' || role === 'abogado_senior',
      canEdit: role === 'super_admin' || role === 'socio' || role === 'abogado_senior' || role === 'abogado_junior',
      canDelete: role === 'super_admin' || role === 'socio',
      canAssign: role === 'super_admin' || role === 'socio' || role === 'abogado_senior',
      canReassign: role === 'super_admin' || role === 'socio',
      
      // Acciones específicas
      canMarkComplete: true,
      canAddComments: true,
    };
  }, [role, roleConfig]);

  // Filtrar tareas según rol
  const filteredTareas = useMemo(() => {
    let filtered = tareasData;

    switch (role) {
      case 'super_admin':
      case 'socio':
        // Ven todas las tareas
        break;
      
      case 'abogado_senior':
        // Ven sus tareas asignadas + las que asignó + las de sus casos
        filtered = tareasData.filter(t => 
          t.assignedTo === currentUserId || 
          t.assignedBy === currentUserId ||
          t.expedienteId?.includes('EXP-2024-00') // Simulación: casos del senior
        );
        break;
      
      case 'abogado_junior':
        // Solo sus tareas asignadas
        filtered = tareasData.filter(t => t.assignedTo === currentUserId);
        break;
      
      case 'paralegal':
        // Tareas asignadas + casos en los que colabora
        filtered = tareasData.filter(t => 
          t.assignedTo === currentUserId ||
          t.tags.includes('diligencia') ||
          t.tags.includes('trámite')
        );
        break;
      
      case 'secretario':
        // Tareas asignadas al secretario
        filtered = tareasData.filter(t => 
          t.assignedTo === currentUserId ||
          t.tags.includes('archivo') ||
          t.tags.includes('documentación')
        );
        break;
      
      default:
        filtered = [];
    }

    // Aplicar filtros de búsqueda
    filtered = filtered.filter(tarea => {
      const matchesSearch = 
        tarea.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        tarea.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        tarea.expedienteTitle?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        tarea.assignedToName.toLowerCase().includes(searchQuery.toLowerCase());
      
      const matchesStatus = statusFilter === 'all' || tarea.status === statusFilter;
      const matchesPriority = priorityFilter === 'all' || tarea.priority === priorityFilter;
      const matchesAssignee = assigneeFilter === 'all' || tarea.assignedTo === assigneeFilter;
      
      return matchesSearch && matchesStatus && matchesPriority && matchesAssignee;
    });

    return filtered;
  }, [role, currentUserId, tareasData, searchQuery, statusFilter, priorityFilter, assigneeFilter]);

  // Calcular estadísticas según rol
  const stats = useMemo(() => {
    const baseStats = {
      total: filteredTareas.length,
      pending: filteredTareas.filter(t => t.status === 'pending').length,
      inProgress: filteredTareas.filter(t => t.status === 'in_progress').length,
      completed: filteredTareas.filter(t => t.status === 'completed').length,
      overdue: filteredTareas.filter(t => t.status === 'overdue').length,
    };

    if (role === 'abogado_senior') {
      const teamTasks = filteredTareas.filter(t => 
        t.assignedBy === currentUserId && t.assignedTo !== currentUserId
      ).length;
      return { ...baseStats, teamTasks };
    }

    return baseStats;
  }, [filteredTareas, role, currentUserId]);

  // Función para obtener proximidad de vencimiento
  const getDueProximity = (dueDate: string, status: string) => {
    if (status === 'completed') return null;
    
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const due = new Date(dueDate);
    due.setHours(0, 0, 0, 0);
    
    const diffDays = Math.ceil((due.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
    
    if (diffDays < 0) return { label: 'Vencida', color: 'red', key: 'overdue' };
    if (diffDays === 0) return { label: 'Hoy', color: 'red', key: 'today' };
    if (diffDays === 1) return { label: 'Mañana', color: 'amber', key: 'tomorrow' };
    if (diffDays <= 3) return { label: `${diffDays}d`, color: 'amber', key: 'soon' };
    if (diffDays <= 7) return { label: `${diffDays}d`, color: 'blue', key: 'week' };
    return null;
  };

  const showToast = (message: string, type: 'success' | 'info' | 'error' = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  // Handlers
  const handleCreateTask = () => {
    if (!newTaskForm.title || !newTaskForm.description) {
      showToast('Por favor completa el título y descripción', 'error');
      return;
    }
    
    const newTask: Tarea = {
      id: `TAR-${Date.now().toString().slice(-4)}`,
      title: newTaskForm.title,
      description: newTaskForm.description,
      priority: newTaskForm.priority as 'high' | 'medium' | 'low',
      status: newTaskForm.status as 'pending' | 'in_progress' | 'completed' | 'overdue',
      dueDate: newTaskForm.dueDate,
      createdAt: new Date().toISOString(),
      assignedTo: newTaskForm.assignedTo,
      assignedToName: newTaskForm.assignedToName,
      assignedBy: currentUserId,
      assignedByName: roleConfig.name,
      expedienteId: newTaskForm.expedienteId || undefined,
      expedienteTitle: newTaskForm.expedienteTitle || undefined,
      tags: newTaskForm.tags.split(',').map(t => t.trim()).filter(Boolean),
      comments: []
    };
    
    setTareasData([newTask, ...tareasData]);
    setNewTaskForm({
      title: '',
      description: '',
      priority: 'medium',
      status: 'pending',
      dueDate: new Date(Date.now() + 7*24*60*60*1000).toISOString().split('T')[0],
      assignedTo: 'current-user',
      assignedToName: 'Usuario Actual',
      expedienteId: '',
      expedienteTitle: '',
      tags: ''
    });
    setActiveModal(null);
    showToast('Tarea creada correctamente');
  };

  const handleUpdateTask = () => {
    if (!editingTask) return;
    
    setTareasData(tareasData.map(t => 
      t.id === editingTask.id ? editingTask : t
    ));
    
    setActiveModal(null);
    setEditingTask(null);
    showToast('Tarea actualizada correctamente');
  };

  const handleDeleteTask = () => {
    if (!editingTask) return;
    
    setTareasData(tareasData.filter(t => t.id !== editingTask.id));
    if (selectedTask?.id === editingTask.id) {
      setSelectedTask(null);
    }
    setActiveModal(null);
    setEditingTask(null);
    showToast('Tarea eliminada');
  };

  const handleCompleteTask = (taskId: string) => {
    setTareasData(tareasData.map(t => 
      t.id === taskId 
        ? { ...t, status: 'completed' as const, completedAt: new Date().toISOString() }
        : t
    ));
    
    if (selectedTask?.id === taskId) {
      setSelectedTask({ ...selectedTask, status: 'completed', completedAt: new Date().toISOString() });
    }
    showToast('Tarea marcada como completada');
  };

  const openEditModal = (task: Tarea) => {
    setEditingTask(task);
    setActiveModal('edit');
  };

  const openDeleteModal = (task: Tarea) => {
    setEditingTask(task);
    setActiveModal('delete');
  };

  const toggleTaskSelection = (taskId: string) => {
    setSelectedTasks(prev => 
      prev.includes(taskId) 
        ? prev.filter(id => id !== taskId)
        : [...prev, taskId]
    );
  };

  const toggleSelectAll = () => {
    if (selectedTasks.length === filteredTareas.length) {
      setSelectedTasks([]);
    } else {
      setSelectedTasks(filteredTareas.map(t => t.id));
    }
  };

  const handleSort = (column: 'title' | 'dueDate' | 'priority' | 'status') => {
    if (sortBy === column) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(column);
      setSortOrder('asc');
    }
  };

  // Navegación entre tareas
  const navigateToTask = (direction: 'prev' | 'next') => {
    if (!selectedTask) return;
    const currentIndex = filteredTareas.findIndex(t => t.id === selectedTask.id);
    if (currentIndex === -1) return;
    
    const newIndex = direction === 'prev' 
      ? (currentIndex - 1 + filteredTareas.length) % filteredTareas.length
      : (currentIndex + 1) % filteredTareas.length;
    
    setSelectedTask(filteredTareas[newIndex]);
  };

  // Obtener lista única de asignados (solo de las tareas visibles)
  const assignees = Array.from(new Set(filteredTareas.map(t => t.assignedTo)));

  // Agrupar por estado para vista kanban
  const tareasByStatus = {
    pending: filteredTareas.filter(t => t.status === 'pending'),
    in_progress: filteredTareas.filter(t => t.status === 'in_progress'),
    completed: filteredTareas.filter(t => t.status === 'completed'),
    overdue: filteredTareas.filter(t => t.status === 'overdue'),
  };

  // Títulos y mensajes según rol
  const getPageInfo = () => {
    switch (role) {
      case 'super_admin':
        return { 
          title: 'Todas las Tareas', 
          subtitle: 'Gestión completa de asignaciones',
          description: 'Control total de tareas del bufete'
        };
      case 'socio':
        return { 
          title: 'Tareas del Bufete', 
          subtitle: 'Supervisión de asignaciones',
          description: 'Supervisión de tareas del equipo'
        };
      case 'abogado_senior':
        return { 
          title: 'Mis Tareas y Equipo', 
          subtitle: 'Gestión personal y de equipo',
          description: 'Tus tareas y las de los abogados junior a tu cargo'
        };
      case 'abogado_junior':
        return { 
          title: 'Mis Tareas Asignadas', 
          subtitle: 'Tareas bajo tu responsabilidad',
          description: 'Tareas asignadas a ti por tus supervisores'
        };
      case 'paralegal':
        return { 
          title: 'Tareas en Colaboración', 
          subtitle: 'Apoyo en casos asignados',
          description: 'Tareas de apoyo legal en tus casos'
        };
      case 'secretario':
        return { 
          title: 'Mis Tareas', 
          subtitle: 'Gestión administrativa',
          description: 'Tareas de apoyo administrativo asignadas'
        };
      default:
        return { 
          title: 'Tareas', 
          subtitle: 'Acceso restringido',
          description: ''
        };
    }
  };

  const pageInfo = getPageInfo();

  // Mensaje de acceso denegado
  const getRoleMessage = () => {
    const messages: Record<UserRole, { title: string; description: string; actions: string[] }> = {
      super_admin: {
        title: 'Control Total de Tareas',
        description: 'Puedes ver, crear, editar y eliminar cualquier tarea.',
        actions: ['Crear tareas para cualquier usuario', 'Reasignar tareas', 'Eliminar tareas', 'Generar reportes']
      },
      socio: {
        title: 'Supervisión de Tareas',
        description: 'Acceso completo para gestionar asignaciones del bufete.',
        actions: ['Ver todas las tareas del equipo', 'Crear y asignar tareas', 'Reasignar tareas', 'Generar reportes']
      },
      abogado_senior: {
        title: 'Gestión de Tareas de Equipo',
        description: 'Puedes gestionar tus tareas y las de tu equipo.',
        actions: ['Crear tareas para tu equipo', 'Asignar a juniors/paralegales', 'Editar tareas asignadas', 'Dar seguimiento']
      },
      abogado_junior: {
        title: 'Tareas Asignadas',
        description: 'Ves únicamente las tareas asignadas a ti.',
        actions: ['Ver tus tareas', 'Marcar como completadas', 'Agregar comentarios', 'Solicitar extensiones']
      },
      paralegal: {
        title: 'Tareas de Colaboración',
        description: 'Tareas asignadas para apoyo legal.',
        actions: ['Ver tareas asignadas', 'Marcar como completadas', 'Actualizar progreso', 'Agregar notas']
      },
      secretario: {
        title: 'Tareas Administrativas',
        description: 'Tareas de apoyo y gestión documental.',
        actions: ['Ver tareas asignadas', 'Organizar documentos', 'Actualizar información', 'Marcar completadas']
      },
      administrador: {
        title: 'Sin Acceso a Tareas',
        description: 'Tu rol no tiene acceso al módulo de tareas.',
        actions: ['Accede a Facturación', 'Gestiona cobranza', 'Administra proveedores']
      },
      contador: {
        title: 'Sin Acceso a Tareas',
        description: 'Tu rol no tiene acceso al módulo de tareas.',
        actions: ['Accede a Contabilidad', 'Revisa facturación', 'Genera reportes fiscales']
      },
      recepcionista: {
        title: 'Sin Acceso a Tareas',
        description: 'Tu rol no tiene acceso al módulo de tareas.',
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
        title="Tareas y Asignaciones"
        subtitle="Acceso restringido"
      >
        <main className="flex-1 overflow-y-auto p-6 lg:p-8 bg-theme-primary">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-2xl mx-auto mt-12"
          >
            <div className="p-8 bg-theme-card border border-theme rounded-2xl text-center">
              <div className="w-20 h-20 mx-auto mb-6 bg-theme-tertiary rounded-full flex items-center justify-center">
                <Lock className="w-10 h-10 text-theme-tertiary" />
              </div>
              <h2 className="text-2xl font-bold text-theme-primary mb-2">{message.title}</h2>
              <p className="text-theme-secondary mb-6">{message.description}</p>
              
              <div className="p-4 bg-theme-tertiary rounded-xl text-left">
                <p className="text-sm font-medium text-theme-primary mb-3">Acciones disponibles para tu rol:</p>
                <ul className="space-y-2">
                  {message.actions.map((action, idx) => (
                    <li key={idx} className="flex items-center gap-2 text-sm text-theme-secondary">
                      <div className="w-1.5 h-1.5 bg-accent rounded-full" />
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
    <div className="flex items-center gap-2">
      <div className="hidden md:flex items-center gap-1 px-2 py-1 bg-theme-tertiary rounded-lg">
        <button 
          onClick={() => setViewMode('list')}
          className={`p-2 rounded-lg transition-colors ${viewMode === 'list' ? 'bg-theme-card text-accent' : 'text-theme-secondary hover:text-theme-primary'}`}
          title="Vista Lista"
        >
          <List className="w-4 h-4" />
        </button>
        <button 
          onClick={() => setViewMode('kanban')}
          className={`p-2 rounded-lg transition-colors ${viewMode === 'kanban' ? 'bg-theme-card text-accent' : 'text-theme-secondary hover:text-theme-primary'}`}
          title="Vista Kanban"
        >
          <Layers className="w-4 h-4" />
        </button>
      </div>
    </div>
  );

  // Icono según rol
  const getRoleIcon = () => {
    switch (role) {
      case 'super_admin':
      case 'socio':
        return <Crown className="w-5 h-5" />;
      case 'abogado_senior':
        return <Briefcase className="w-5 h-5" />;
      case 'abogado_junior':
        return <FileText className="w-5 h-5" />;
      case 'paralegal':
        return <Users className="w-5 h-5" />;
      default:
        return <Flag className="w-5 h-5" />;
    }
  };

  return (
    <AppLayout 
      title={pageInfo.title}
      subtitle={`${filteredTareas.length} tareas encontradas${pageInfo.subtitle ? ` • ${pageInfo.subtitle}` : ''}`}
      headerActions={headerActions}
    >
      <main className="flex-1 overflow-y-auto p-6 lg:p-8 bg-theme-primary">
        {/* Stats Cards - Bento Grid Mejorado */}
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-3 mb-6">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            whileHover={{ y: -2, transition: { duration: 0.2 } }}
            onClick={() => setStatusFilter('all')}
            className={`p-4 bg-gradient-to-br from-accent/20 via-accent/10 to-transparent border border-accent/30 rounded-2xl cursor-pointer hover:border-accent/60 hover:shadow-lg hover:shadow-accent/10 transition-all ${statusFilter === 'all' ? 'ring-2 ring-accent/50 shadow-lg shadow-accent/20' : ''}`}
          >
            <div className="flex items-center justify-between mb-3">
              <div className="p-2 bg-accent/20 rounded-xl">
                <Flag className="w-5 h-5 text-accent" />
              </div>
              <span className="text-xs font-medium text-accent/80 bg-accent/10 px-2 py-0.5 rounded-full">100%</span>
            </div>
            <p className="text-3xl font-bold text-theme-primary">{stats.total}</p>
            <p className="text-sm text-theme-secondary mt-1">Total</p>
            <div className="mt-3 h-1.5 bg-theme-tertiary/50 rounded-full overflow-hidden">
              <motion.div 
                className="h-full bg-accent rounded-full" 
                initial={{ width: 0 }}
                animate={{ width: '100%' }}
                transition={{ duration: 0.8, ease: "easeOut" }}
              />
            </div>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.05 }}
            whileHover={{ y: -2, transition: { duration: 0.2 } }}
            onClick={() => setStatusFilter('pending')}
            className={`p-4 bg-theme-card border border-theme rounded-2xl cursor-pointer hover:border-amber-500/60 hover:shadow-lg hover:shadow-amber-500/10 transition-all ${statusFilter === 'pending' ? 'ring-2 ring-amber-500/30 shadow-lg shadow-amber-500/20' : ''}`}
          >
            <div className="flex items-center justify-between mb-3">
              <div className="p-2 bg-amber-500/20 rounded-xl">
                <Clock className="w-5 h-5 text-amber-400" />
              </div>
              <span className="text-xs font-medium text-amber-400/80 bg-amber-500/10 px-2 py-0.5 rounded-full">
                {stats.total > 0 ? Math.round((stats.pending / stats.total) * 100) : 0}%
              </span>
            </div>
            <p className="text-3xl font-bold text-theme-primary">{stats.pending}</p>
            <p className="text-sm text-theme-secondary mt-1">Pendientes</p>
            <div className="mt-3 h-1.5 bg-theme-tertiary/50 rounded-full overflow-hidden">
              <motion.div 
                className="h-full bg-amber-400 rounded-full" 
                initial={{ width: 0 }}
                animate={{ width: `${stats.total > 0 ? (stats.pending / stats.total) * 100 : 0}%` }}
                transition={{ duration: 0.8, ease: "easeOut", delay: 0.1 }}
              />
            </div>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            whileHover={{ y: -2, transition: { duration: 0.2 } }}
            onClick={() => setStatusFilter('in_progress')}
            className={`p-4 bg-theme-card border border-theme rounded-2xl cursor-pointer hover:border-blue-500/60 hover:shadow-lg hover:shadow-blue-500/10 transition-all ${statusFilter === 'in_progress' ? 'ring-2 ring-blue-500/30 shadow-lg shadow-blue-500/20' : ''}`}
          >
            <div className="flex items-center justify-between mb-3">
              <div className="p-2 bg-blue-500/20 rounded-xl">
                <Eye className="w-5 h-5 text-blue-400" />
              </div>
              <span className="text-xs font-medium text-blue-400/80 bg-blue-500/10 px-2 py-0.5 rounded-full">
                {stats.total > 0 ? Math.round((stats.inProgress / stats.total) * 100) : 0}%
              </span>
            </div>
            <p className="text-3xl font-bold text-theme-primary">{stats.inProgress}</p>
            <p className="text-sm text-theme-secondary mt-1">En Progreso</p>
            <div className="mt-3 h-1.5 bg-theme-tertiary/50 rounded-full overflow-hidden">
              <motion.div 
                className="h-full bg-blue-400 rounded-full" 
                initial={{ width: 0 }}
                animate={{ width: `${stats.total > 0 ? (stats.inProgress / stats.total) * 100 : 0}%` }}
                transition={{ duration: 0.8, ease: "easeOut", delay: 0.2 }}
              />
            </div>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
            whileHover={{ y: -2, transition: { duration: 0.2 } }}
            onClick={() => setStatusFilter('completed')}
            className={`p-4 bg-theme-card border border-theme rounded-2xl cursor-pointer hover:border-emerald-500/60 hover:shadow-lg hover:shadow-emerald-500/10 transition-all ${statusFilter === 'completed' ? 'ring-2 ring-emerald-500/30 shadow-lg shadow-emerald-500/20' : ''}`}
          >
            <div className="flex items-center justify-between mb-3">
              <div className="p-2 bg-emerald-500/20 rounded-xl">
                <CheckCircle2 className="w-5 h-5 text-emerald-400" />
              </div>
              <span className="text-xs font-medium text-emerald-400/80 bg-emerald-500/10 px-2 py-0.5 rounded-full">
                {stats.total > 0 ? Math.round((stats.completed / stats.total) * 100) : 0}%
              </span>
            </div>
            <p className="text-3xl font-bold text-theme-primary">{stats.completed}</p>
            <p className="text-sm text-theme-secondary mt-1">Completadas</p>
            <div className="mt-3 h-1.5 bg-theme-tertiary/50 rounded-full overflow-hidden">
              <motion.div 
                className="h-full bg-emerald-400 rounded-full" 
                initial={{ width: 0 }}
                animate={{ width: `${stats.total > 0 ? (stats.completed / stats.total) * 100 : 0}%` }}
                transition={{ duration: 0.8, ease: "easeOut", delay: 0.3 }}
              />
            </div>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            whileHover={{ y: -2, transition: { duration: 0.2 } }}
            onClick={() => setStatusFilter('overdue')}
            className={`p-4 bg-theme-card border border-theme rounded-2xl cursor-pointer hover:border-red-500/60 hover:shadow-lg hover:shadow-red-500/10 transition-all ${statusFilter === 'overdue' ? 'ring-2 ring-red-500/30 shadow-lg shadow-red-500/20' : ''} ${stats.overdue > 0 ? 'bg-gradient-to-br from-red-500/10 to-transparent' : ''}`}
          >
            <div className="flex items-center justify-between mb-3">
              <div className={`p-2 ${stats.overdue > 0 ? 'bg-red-500/20' : 'bg-theme-tertiary/50'} rounded-xl`}>
                <AlertCircle className={`w-5 h-5 ${stats.overdue > 0 ? 'text-red-400' : 'text-theme-tertiary'}`} />
              </div>
              {stats.overdue > 0 && <Bell className="w-4 h-4 text-red-400 animate-pulse" />}
            </div>
            <p className={`text-3xl font-bold ${stats.overdue > 0 ? 'text-red-400' : 'text-theme-primary'}`}>{stats.overdue}</p>
            <p className="text-sm text-theme-secondary mt-1">Vencidas</p>
            {stats.overdue > 0 && (
              <div className="mt-3 flex items-center gap-1">
                <TrendingUp className="w-3 h-3 text-red-400" />
                <span className="text-xs text-red-400 font-medium">¡Actción requerida!</span>
              </div>
            )}
          </motion.div>

          {permissions.canCreate && (
            <motion.button
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.25 }}
              whileHover={{ scale: 1.02, y: -2 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setActiveModal('create')}
              className="p-4 bg-gradient-to-br from-accent/20 to-accent/5 border-2 border-dashed border-accent/40 rounded-2xl cursor-pointer hover:bg-accent/20 hover:border-accent hover:shadow-lg hover:shadow-accent/20 transition-all flex flex-col items-center justify-center gap-2 group"
            >
              <motion.div 
                className="w-12 h-12 rounded-full bg-accent/30 flex items-center justify-center group-hover:scale-110 transition-transform"
                whileHover={{ rotate: 90 }}
              >
                <Plus className="w-6 h-6 text-accent" />
              </motion.div>
              <p className="text-sm font-semibold text-accent">Nueva Tarea</p>
            </motion.button>
          )}
        </div>

        {/* Search and Filters - Modern */}
        <div className="mb-6 space-y-3">
          <div className="flex flex-col lg:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-theme-tertiary" />
              <input
                type="text"
                placeholder="Buscar por título, descripción, expediente o asignado..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-12 pr-12 py-3 bg-theme-card border border-theme rounded-xl text-theme-primary placeholder-theme-tertiary focus:outline-none focus:border-accent transition-colors"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-4 top-1/2 -translate-y-1/2 p-1 text-theme-tertiary hover:text-theme-primary transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>

            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setViewMode(viewMode === 'list' ? 'kanban' : 'list')}
              className="flex items-center justify-center gap-2 px-4 py-3 bg-theme-card border border-theme rounded-xl text-theme-secondary hover:text-theme-primary hover:border-accent/50 transition-colors"
            >
              {viewMode === 'list' ? (
                <>
                  <Layers className="w-4 h-4" />
                  <span className="hidden sm:inline">Kanban</span>
                </>
              ) : (
                <>
                  <List className="w-4 h-4" />
                  <span className="hidden sm:inline">Lista</span>
                </>
              )}
            </motion.button>

            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setShowFilterPanel(!showFilterPanel)}
              className={`
                flex items-center justify-center gap-2 px-4 py-3 rounded-xl border transition-colors
                ${showFilterPanel || statusFilter !== 'all' || priorityFilter !== 'all' || assigneeFilter !== 'all'
                  ? 'bg-accent/10 border-accent text-accent' 
                  : 'bg-theme-card border-theme text-theme-secondary hover:text-theme-primary'
                }
              `}
            >
              <Filter className="w-4 h-4" />
              <span className="hidden sm:inline">Filtros</span>
              {(statusFilter !== 'all' || priorityFilter !== 'all' || assigneeFilter !== 'all') && (
                <span className="w-5 h-5 bg-accent text-slate-950 text-xs font-bold rounded-full flex items-center justify-center">
                  {[statusFilter, priorityFilter, assigneeFilter].filter(f => f !== 'all').length}
                </span>
              )}
              <ChevronDown className={`w-4 h-4 transition-transform ${showFilterPanel ? 'rotate-180' : ''}`} />
            </motion.button>

            {permissions.canCreate && (
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setActiveModal('create')}
                className="flex items-center justify-center gap-2 px-5 py-3 bg-accent text-slate-950 font-medium rounded-xl hover:bg-amber-400 transition-colors"
              >
                <Plus className="w-4 h-4" />
                <span className="hidden sm:inline">Nueva Tarea</span>
              </motion.button>
            )}
          </div>

          {/* Quick Filters Pills */}
          <div className="flex flex-wrap gap-2 mt-3">
            <span className="text-xs text-theme-tertiary flex items-center gap-1 py-1">
              <Zap className="w-3 h-3" /> Filtros rápidos:
            </span>
            <button
              onClick={() => { setStatusFilter('all'); setPriorityFilter('high'); }}
              className={`text-xs px-3 py-1.5 rounded-full border transition-all ${priorityFilter === 'high' ? 'bg-red-500/20 border-red-500/50 text-red-400' : 'bg-theme-tertiary/30 border-theme text-theme-secondary hover:border-red-500/50 hover:text-red-400'}`}
            >
              <Flag className="w-3 h-3 inline mr-1" /> Alta prioridad
            </button>
            <button
              onClick={() => { setStatusFilter('pending'); setPriorityFilter('all'); }}
              className={`text-xs px-3 py-1.5 rounded-full border transition-all ${statusFilter === 'pending' && priorityFilter === 'all' ? 'bg-amber-500/20 border-amber-500/50 text-amber-400' : 'bg-theme-tertiary/30 border-theme text-theme-secondary hover:border-amber-500/50 hover:text-amber-400'}`}
            >
              <Clock className="w-3 h-3 inline mr-1" /> Pendientes
            </button>
            <button
              onClick={() => setStatusFilter('overdue')}
              className={`text-xs px-3 py-1.5 rounded-full border transition-all ${statusFilter === 'overdue' ? 'bg-red-500/20 border-red-500/50 text-red-400' : 'bg-theme-tertiary/30 border-theme text-theme-secondary hover:border-red-500/50 hover:text-red-400'}`}
            >
              <AlertCircle className="w-3 h-3 inline mr-1" /> Vencidas
            </button>
            <button
              onClick={() => { setStatusFilter('all'); setAssigneeFilter(currentUserId); }}
              className={`text-xs px-3 py-1.5 rounded-full border transition-all ${assigneeFilter === currentUserId ? 'bg-blue-500/20 border-blue-500/50 text-blue-400' : 'bg-theme-tertiary/30 border-theme text-theme-secondary hover:border-blue-500/50 hover:text-blue-400'}`}
            >
              <User className="w-3 h-3 inline mr-1" /> Mis tareas
            </button>
          </div>

          {/* Filter Panel */}
          <AnimatePresence>
            {showFilterPanel && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="overflow-hidden"
              >
                <div className="bg-theme-card/60 backdrop-blur-sm border border-theme rounded-xl p-4 space-y-4">
                  <div className="flex flex-wrap items-start gap-6">
                    <div className="flex-1 min-w-[180px]">
                      <label className="text-xs font-semibold text-theme-secondary uppercase tracking-wider mb-3 flex items-center gap-1">
                        <Clock className="w-3 h-3" /> Estado
                      </label>
                      <div className="flex flex-wrap gap-2">
                        {[
                          { value: 'all', label: 'Todos', color: 'bg-theme-tertiary' },
                          { value: 'pending', label: 'Pendiente', color: 'bg-amber-500' },
                          { value: 'in_progress', label: 'En Progreso', color: 'bg-blue-500' },
                          { value: 'completed', label: 'Completada', color: 'bg-emerald-500' },
                          { value: 'overdue', label: 'Vencida', color: 'bg-red-500' },
                        ].map((option) => (
                          <button
                            key={option.value}
                            onClick={() => setStatusFilter(option.value)}
                            className={`
                              flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all
                              ${statusFilter === option.value
                                ? option.value === 'all' ? 'bg-theme-tertiary text-theme-primary ring-1 ring-theme' : `${option.color} text-white shadow-lg`
                                : 'bg-theme-tertiary/40 text-theme-secondary hover:bg-theme-hover hover:text-theme-primary'
                              }
                            `}
                          >
                            {option.value !== 'all' && <span className={`w-2 h-2 rounded-full ${option.color}`} />}
                            {option.label}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="flex-1 min-w-[180px]">
                      <label className="text-xs font-semibold text-theme-secondary uppercase tracking-wider mb-3 flex items-center gap-1">
                        <Flag className="w-3 h-3" /> Prioridad
                      </label>
                      <div className="flex flex-wrap gap-2">
                        {[
                          { value: 'all', label: 'Todas', color: '' },
                          { value: 'high', label: 'Alta', color: 'red' },
                          { value: 'medium', label: 'Media', color: 'amber' },
                          { value: 'low', label: 'Baja', color: 'emerald' },
                        ].map((option) => (
                          <button
                            key={option.value}
                            onClick={() => setPriorityFilter(option.value)}
                            className={`
                              px-3 py-2 rounded-lg text-sm font-medium transition-all border
                              ${priorityFilter === option.value
                                ? option.value === 'all' 
                                  ? 'bg-theme-tertiary text-theme-primary border-theme'
                                  : `bg-${option.color}-500/20 text-${option.color}-400 border-${option.color}-500/50 shadow-lg`
                                : 'bg-theme-tertiary/40 text-theme-secondary hover:bg-theme-hover border-transparent hover:border-theme'
                              }
                            `}
                          >
                            {option.label}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="flex-1 min-w-[180px]">
                      <label className="text-xs font-semibold text-theme-secondary uppercase tracking-wider mb-3 flex items-center gap-1">
                        <User className="w-3 h-3" /> Asignado
                      </label>
                      <select
                        value={assigneeFilter}
                        onChange={(e) => setAssigneeFilter(e.target.value)}
                        className="w-full px-3 py-2 bg-theme-tertiary/50 border border-theme rounded-lg text-theme-primary text-sm focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent/30"
                      >
                        <option value="all">Todos los asignados</option>
                        {assignees.map(assignee => (
                          <option key={assignee} value={assignee}>
                            {filteredTareas.find(t => t.assignedTo === assignee)?.assignedToName}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  {(statusFilter !== 'all' || priorityFilter !== 'all' || assigneeFilter !== 'all' || searchQuery) && (
                    <div className="flex items-center gap-2 pt-2 border-t border-theme">
                      <span className="text-xs text-theme-tertiary">Filtros activos:</span>
                      {searchQuery && (
                        <span className="inline-flex items-center gap-1 text-xs px-2 py-1 bg-accent/10 text-accent rounded-lg">
                          "{searchQuery}" <X className="w-3 h-3 cursor-pointer" onClick={() => setSearchQuery('')} />
                        </span>
                      )}
                      {statusFilter !== 'all' && (
                        <span className="inline-flex items-center gap-1 text-xs px-2 py-1 bg-blue-500/10 text-blue-400 rounded-lg">
                          {statusFilter === 'in_progress' ? 'En Progreso' : statusFilter} <X className="w-3 h-3 cursor-pointer" onClick={() => setStatusFilter('all')} />
                        </span>
                      )}
                      {priorityFilter !== 'all' && (
                        <span className="inline-flex items-center gap-1 text-xs px-2 py-1 bg-amber-500/10 text-amber-400 rounded-lg">
                          {priorityFilter} <X className="w-3 h-3 cursor-pointer" onClick={() => setPriorityFilter('all')} />
                        </span>
                      )}
                      {assigneeFilter !== 'all' && (
                        <span className="inline-flex items-center gap-1 text-xs px-2 py-1 bg-purple-500/10 text-purple-400 rounded-lg">
                          {filteredTareas.find(t => t.assignedTo === assigneeFilter)?.assignedToName} <X className="w-3 h-3 cursor-pointer" onClick={() => setAssigneeFilter('all')} />
                        </span>
                      )}
                      <button
                        onClick={() => { setStatusFilter('all'); setPriorityFilter('all'); setAssigneeFilter('all'); setSearchQuery(''); }}
                        className="text-xs text-accent hover:text-amber-400 font-medium ml-auto"
                      >
                        Limpiar todo
                      </button>
                    </div>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Content */}
        {viewMode === 'list' ? (
          /* Lista de Tareas Mejorada */
          <div className="bg-theme-card border border-theme rounded-2xl overflow-hidden">
            {selectedTasks.length > 0 && (
              <div className="p-3 bg-accent/10 border-b border-accent/30 flex items-center justify-between">
                <span className="text-sm text-accent font-medium">
                  {selectedTasks.length} tarea{selectedTasks.length > 1 ? 's' : ''} seleccionada{selectedTasks.length > 1 ? 's' : ''}
                </span>
                <div className="flex items-center gap-2">
                  {permissions.canEdit && (
                    <button className="px-3 py-1.5 text-xs bg-accent/20 text-accent rounded-lg hover:bg-accent/30 transition-colors">
                      Editar selección
                    </button>
                  )}
                  {permissions.canDelete && (
                    <button className="px-3 py-1.5 text-xs bg-red-500/20 text-red-400 rounded-lg hover:bg-red-500/30 transition-colors">
                      Eliminar ({selectedTasks.length})
                    </button>
                  )}
                </div>
              </div>
            )}
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-theme bg-gradient-to-r from-theme-tertiary/40 via-theme-tertiary/20 to-transparent">
                    <th className="py-3 px-4 w-10">
                      <div 
                        onClick={toggleSelectAll}
                        className={`w-5 h-5 rounded border-2 cursor-pointer flex items-center justify-center transition-all ${
                          selectedTasks.length === filteredTareas.length && filteredTareas.length > 0
                            ? 'bg-accent border-accent'
                            : 'border-theme hover:border-accent hover:scale-110'
                        }`}
                      >
                        {selectedTasks.length === filteredTareas.length && filteredTareas.length > 0 && (
                          <CheckCircle className="w-3 h-3 text-slate-950" />
                        )}
                      </div>
                    </th>
                    <th className="text-left py-3 px-4 text-xs font-semibold text-theme-secondary uppercase tracking-wider">
                      <button 
                        onClick={() => handleSort('title')}
                        className="flex items-center gap-1.5 hover:text-accent transition-colors"
                      >
                        <Flag className="w-3 h-3" /> Tarea
                        {sortBy === 'title' && (
                          <ArrowUpDown className={`w-3 h-3 ${sortOrder === 'desc' ? 'rotate-180' : ''}`} />
                        )}
                      </button>
                    </th>
                    <th className="text-left py-3 px-4 text-xs font-semibold text-theme-secondary uppercase tracking-wider hidden lg:table-cell">
                      <div className="flex items-center gap-1.5">
                        <Briefcase className="w-3 h-3" /> Expediente
                      </div>
                    </th>
                    <th className="text-left py-3 px-4 text-xs font-semibold text-theme-secondary uppercase tracking-wider hidden md:table-cell">
                      <div className="flex items-center gap-1.5">
                        <User className="w-3 h-3" /> Asignado
                      </div>
                    </th>
                    <th className="text-left py-3 px-4 text-xs font-semibold text-theme-secondary uppercase tracking-wider">
                      <button 
                        onClick={() => handleSort('priority')}
                        className="flex items-center gap-1.5 hover:text-accent transition-colors"
                      >
                        <Target className="w-3 h-3" /> Prioridad
                        {sortBy === 'priority' && (
                          <ArrowUpDown className={`w-3 h-3 ${sortOrder === 'desc' ? 'rotate-180' : ''}`} />
                        )}
                      </button>
                    </th>
                    <th className="text-left py-3 px-4 text-xs font-semibold text-theme-secondary uppercase tracking-wider">
                      <button 
                        onClick={() => handleSort('status')}
                        className="flex items-center gap-1.5 hover:text-accent transition-colors"
                      >
                        <CheckCircle2 className="w-3 h-3" /> Estado
                        {sortBy === 'status' && (
                          <ArrowUpDown className={`w-3 h-3 ${sortOrder === 'desc' ? 'rotate-180' : ''}`} />
                        )}
                      </button>
                    </th>
                    <th className="text-left py-3 px-4 text-xs font-medium text-theme-secondary uppercase">
                      <button 
                        onClick={() => handleSort('dueDate')}
                        className="flex items-center gap-1 hover:text-accent transition-colors"
                      >
                        Vencimiento
                        {sortBy === 'dueDate' && (
                          <ArrowUpDown className={`w-3 h-3 ${sortOrder === 'desc' ? 'rotate-180' : ''}`} />
                        )}
                      </button>
                    </th>
                    <th className="text-left py-3 px-4 text-xs font-medium text-theme-secondary uppercase w-20">Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredTareas.map((tarea, index) => (
                    <motion.tr 
                      key={tarea.id} 
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.02 }}
                      className={`
                        border-b border-theme/30 hover:bg-theme-hover/80 transition-all group
                        ${selectedTasks.includes(tarea.id) ? 'bg-accent/5' : index % 2 === 0 ? 'bg-theme-card/30' : 'bg-theme-card/60'}
                        ${tarea.priority === 'high' && tarea.status !== 'completed' ? 'border-l-2 border-l-red-500' : ''}
                        ${tarea.status === 'overdue' ? 'border-l-2 border-l-red-500' : ''}
                      `}
                    >
                      <td className="py-3 px-4">
                        <div 
                          onClick={(e) => { e.stopPropagation(); toggleTaskSelection(tarea.id); }}
                          className={`w-5 h-5 rounded border-2 cursor-pointer flex items-center justify-center transition-colors ${
                            selectedTasks.includes(tarea.id)
                              ? 'bg-accent border-accent'
                              : 'border-theme hover:border-accent'
                          }`}
                        >
                          {selectedTasks.includes(tarea.id) && (
                            <CheckCircle className="w-3 h-3 text-slate-950" />
                          )}
                        </div>
                      </td>
                      <td className="py-3 px-4" onClick={() => setSelectedTask(tarea)}>
                        <div className="cursor-pointer">
                          <div className="flex items-center gap-2">
                            {tarea.status === 'completed' && (
                              <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                            )}
                            {tarea.status === 'overdue' && (
                              <AlertCircle className="w-4 h-4 text-red-400 flex-shrink-0" />
                            )}
                            <p className={`text-sm font-medium text-theme-primary group-hover:text-accent transition-colors ${tarea.status === 'completed' ? 'line-through opacity-60' : ''}`}>
                              {tarea.title}
                            </p>
                          </div>
                          <p className="text-xs text-theme-tertiary mt-1 line-clamp-1 hidden sm:block">{tarea.description}</p>
                          {tarea.tags.length > 0 && (
                            <div className="flex gap-1 mt-1.5 flex-wrap">
                              {tarea.tags.slice(0, 3).map(tag => (
                                <span key={tag} className="text-[10px] px-1.5 py-0.5 bg-theme-tertiary/50 text-theme-secondary rounded">
                                  {tag}
                                </span>
                              ))}
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="py-3 px-4 hidden lg:table-cell" onClick={() => setSelectedTask(tarea)}>
                        {tarea.expedienteTitle ? (
                          <div className="cursor-pointer">
                            <div className="flex items-center gap-1.5">
                              <Briefcase className="w-3 h-3 text-theme-tertiary" />
                              <p className="text-sm text-theme-primary">{tarea.expedienteTitle}</p>
                            </div>
                            <p className="text-xs text-theme-tertiary mt-0.5">{tarea.expedienteId}</p>
                          </div>
                        ) : (
                          <span className="text-sm text-theme-tertiary">-</span>
                        )}
                      </td>
                      <td className="py-3 px-4 hidden md:table-cell" onClick={() => setSelectedTask(tarea)}>
                        <div className="flex items-center gap-2 cursor-pointer">
                          <div className="w-7 h-7 bg-gradient-to-br from-theme-tertiary to-theme-hover rounded-full flex items-center justify-center text-xs font-medium text-theme-secondary border border-theme">
                            {tarea.assignedToName.split(' ').map((n: string) => n[0]).join('')}
                          </div>
                          <div>
                            <p className="text-sm text-theme-primary">{tarea.assignedToName.split(' ')[0]}</p>
                          </div>
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <span className={`px-2.5 py-1 text-xs font-medium rounded-full border ${getPriorityColor(tarea.priority)}`}>
                          {getPriorityText(tarea.priority)}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <span className={`px-2.5 py-1 text-xs font-medium rounded-full border ${getStatusColor(tarea.status)}`}>
                          {getStatusText(tarea.status)}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex flex-col gap-1">
                          <div className="flex items-center gap-1.5">
                            <Calendar className={`w-3.5 h-3.5 ${tarea.status === 'overdue' ? 'text-red-400' : 'text-theme-tertiary'}`} />
                            <span className={`text-xs ${tarea.status === 'overdue' ? 'text-red-400 font-medium' : 'text-theme-secondary'}`}>
                              {new Date(tarea.dueDate).toLocaleDateString('es-ES', { day: 'numeric', month: 'short' })}
                            </span>
                          </div>
                          {getDueProximity(tarea.dueDate, tarea.status) && (
                            <span className={`
                              inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded text-[10px] font-medium w-fit
                              ${getDueProximity(tarea.dueDate, tarea.status)?.color === 'red' ? 'bg-red-500/20 text-red-400' : ''}
                              ${getDueProximity(tarea.dueDate, tarea.status)?.color === 'amber' ? 'bg-amber-500/20 text-amber-400' : ''}
                              ${getDueProximity(tarea.dueDate, tarea.status)?.color === 'blue' ? 'bg-blue-500/20 text-blue-400' : ''}
                            `}>
                              <Zap className="w-2.5 h-2.5" />
                              {getDueProximity(tarea.dueDate, tarea.status)?.label}
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-1">
                          {tarea.status !== 'completed' && permissions.canMarkComplete && (
                            <motion.button
                              whileHover={{ scale: 1.1 }}
                              whileTap={{ scale: 0.9 }}
                              onClick={(e) => { e.stopPropagation(); handleCompleteTask(tarea.id); }}
                              className="p-1.5 text-theme-tertiary hover:text-emerald-500 hover:bg-emerald-500/10 rounded-lg transition-colors"
                              title="Completar tarea"
                            >
                              <CheckCircle2 className="w-4 h-4" />
                            </motion.button>
                          )}
                          <button 
                            onClick={(e) => { e.stopPropagation(); setSelectedTask(tarea); }}
                            className="p-1.5 text-theme-tertiary hover:text-accent hover:bg-accent/10 rounded-lg transition-colors"
                            title="Ver detalles"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          {permissions.canEdit && (
                            <button 
                              onClick={(e) => { e.stopPropagation(); openEditModal(tarea); }}
                              className="p-1.5 text-theme-tertiary hover:text-blue-500 hover:bg-blue-500/10 rounded-lg transition-colors"
                              title="Editar"
                            >
                              <Edit2 className="w-4 h-4" />
                            </button>
                          )}
                          {permissions.canDelete && (
                            <button 
                              onClick={(e) => { e.stopPropagation(); openDeleteModal(tarea); }}
                              className="p-1.5 text-theme-tertiary hover:text-red-500 hover:bg-red-500/10 rounded-lg transition-colors"
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

            {filteredTareas.length === 0 && (
              <div className="p-12 text-center">
                <div className="w-16 h-16 mx-auto mb-4 bg-theme-tertiary rounded-full flex items-center justify-center">
                  <Search className="w-8 h-8 text-theme-tertiary" />
                </div>
                <p className="text-theme-secondary">No se encontraron tareas con los filtros aplicados</p>
                {role !== 'super_admin' && role !== 'socio' && (
                  <p className="text-sm text-theme-tertiary mt-2">
                    No tienes tareas asignadas actualmente
                  </p>
                )}
              </div>
            )}
          </div>
        ) : (
          /* Vista Kanban Mejorada */
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { key: 'pending', title: 'Pendientes', color: 'amber', bg: 'bg-amber-500/10', border: 'border-amber-500/30', header: 'from-amber-500/20', icon: Clock },
              { key: 'in_progress', title: 'En Progreso', color: 'blue', bg: 'bg-blue-500/10', border: 'border-blue-500/30', header: 'from-blue-500/20', icon: Eye },
              { key: 'completed', title: 'Completadas', color: 'emerald', bg: 'bg-emerald-500/10', border: 'border-emerald-500/30', header: 'from-emerald-500/20', icon: CheckCircle2 },
              { key: 'overdue', title: 'Vencidas', color: 'red', bg: 'bg-red-500/10', border: 'border-red-500/30', header: 'from-red-500/20', icon: AlertCircle },
            ].map((column) => (
              <div key={column.key} className={`bg-theme-card/80 backdrop-blur-sm border ${column.border} rounded-2xl overflow-hidden shadow-lg`}>
                <div className={`p-4 bg-gradient-to-r ${column.header} to-transparent border-b ${column.border}`}>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className={`p-2 rounded-xl bg-${column.color}-500/20`}>
                        <column.icon className={`w-4 h-4 text-${column.color}-400`} />
                      </div>
                      <div>
                        <h3 className="font-semibold text-theme-primary">{column.title}</h3>
                        <p className="text-xs text-theme-tertiary">{tareasByStatus[column.key as keyof typeof tareasByStatus].length} tareas</p>
                      </div>
                    </div>
                    <span className={`px-3 py-1.5 ${column.bg} text-${column.color}-400 rounded-full text-xs font-bold shadow-lg`}>
                      {tareasByStatus[column.key as keyof typeof tareasByStatus].length}
                    </span>
                  </div>
                </div>
                <div className="p-3 space-y-3 max-h-[calc(100vh-400px)] overflow-y-auto">
                  {tareasByStatus[column.key as keyof typeof tareasByStatus].map((tarea, idx) => (
                    <motion.div
                      key={tarea.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: idx * 0.05 }}
                      onClick={() => setSelectedTask(tarea)}
                      whileHover={{ scale: 1.02, y: -2 }}
                      className={`p-4 bg-gradient-to-br from-theme-card to-theme-tertiary/30 rounded-xl cursor-pointer hover:shadow-lg transition-all group border border-theme/30 hover:border-theme ${tarea.priority === 'high' ? 'border-l-4 border-l-red-500' : ''}`}
                    >
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className={`px-2 py-0.5 text-xs font-medium rounded-full border ${getPriorityColor(tarea.priority)}`}>
                            {getPriorityText(tarea.priority)}
                          </span>
                          {tarea.status === 'overdue' && (
                            <span className="px-2 py-0.5 text-xs font-medium rounded-full bg-red-500/20 text-red-400 border border-red-500/30 flex items-center gap-1">
                              <AlertCircle className="w-3 h-3" /> Vencida
                            </span>
                          )}
                        </div>
                        <button 
                          onClick={(e) => { e.stopPropagation(); openEditModal(tarea); }}
                          className="opacity-0 group-hover:opacity-100 p-1 text-theme-tertiary hover:text-theme-primary hover:bg-theme-card rounded transition-all"
                        >
                          <MoreHorizontal className="w-4 h-4" />
                        </button>
                      </div>
                      
                      <h4 className="font-medium text-theme-primary text-sm mb-1 group-hover:text-accent transition-colors line-clamp-2">
                        {tarea.title}
                      </h4>
                      
                      <p className="text-xs text-theme-secondary line-clamp-2 mb-3">{tarea.description}</p>
                      
                      {tarea.tags.length > 0 && (
                        <div className="flex gap-1 mb-3 flex-wrap">
                          {tarea.tags.slice(0, 2).map(tag => (
                            <span key={tag} className="text-[10px] px-1.5 py-0.5 bg-theme-tertiary/50 text-theme-secondary rounded">
                              {tag}
                            </span>
                          ))}
                          {tarea.tags.length > 2 && (
                            <span className="text-[10px] px-1.5 py-0.5 bg-theme-tertiary/50 text-theme-tertiary rounded">
                              +{tarea.tags.length - 2}
                            </span>
                          )}
                        </div>
                      )}
                      
                      <div className="flex items-center justify-between pt-2 border-t border-theme/50">
                        <div className="flex items-center gap-2">
                          <div className="w-7 h-7 bg-gradient-to-br from-theme-tertiary to-theme-hover rounded-full flex items-center justify-center text-xs font-medium text-theme-secondary border border-theme">
                            {tarea.assignedToName.split(' ').map((n: string) => n[0]).join('')}
                          </div>
                          <div>
                            <p className="text-xs text-theme-primary">{tarea.assignedToName.split(' ')[0]}</p>
                          </div>
                        </div>
                        <div className={`flex items-center gap-1 text-xs ${tarea.status === 'overdue' ? 'text-red-400 font-medium' : 'text-theme-tertiary'}`}>
                          <Calendar className="w-3 h-3" />
                          {new Date(tarea.dueDate).toLocaleDateString('es-ES', { day: 'numeric', month: 'short' })}
                        </div>
                      </div>
                      
                      {tarea.expedienteTitle && (
                        <div className="mt-2 pt-2 border-t border-theme/50 flex items-center gap-1">
                          <Briefcase className="w-3 h-3 text-theme-tertiary" />
                          <p className="text-[10px] text-theme-tertiary truncate">{tarea.expedienteTitle}</p>
                        </div>
                      )}
                      
                      {tarea.comments.length > 0 && (
                        <div className="mt-2 flex items-center gap-1 text-xs text-theme-tertiary">
                          <MessageSquare className="w-3 h-3" />
                          <span>{tarea.comments.length} comentario{tarea.comments.length > 1 ? 's' : ''}</span>
                        </div>
                      )}
                    </motion.div>
                  ))}
                  {tareasByStatus[column.key as keyof typeof tareasByStatus].length === 0 && (
                    <div className="p-8 text-center border-2 border-dashed border-theme rounded-xl">
                      <p className="text-sm text-theme-tertiary">No hay tareas</p>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* FAB for Mobile - fuera del ternary */}
        {permissions.canCreate && (
          <motion.button
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={() => setActiveModal('create')}
            className="sm:hidden fixed bottom-6 right-6 w-14 h-14 bg-accent text-slate-950 rounded-full shadow-lg flex items-center justify-center z-40"
          >
            <Plus className="w-6 h-6" />
          </motion.button>
        )}

        {/* Quick Stats - Solo visible en móvil */}
        <div className="sm:hidden mt-6 flex items-center justify-between p-3 bg-theme-card border border-theme rounded-xl">
          <div className="flex items-center gap-4 text-xs">
            <span className="flex items-center gap-1 text-amber-400">
              <Clock className="w-3 h-3" /> {stats.pending} pend.
            </span>
            <span className="flex items-center gap-1 text-blue-400">
              <Eye className="w-3 h-3" /> {stats.inProgress} proc.
            </span>
            <span className="flex items-center gap-1 text-emerald-400">
              <CheckCircle2 className="w-3 h-3" /> {stats.completed} ok
            </span>
          </div>
          {stats.overdue > 0 && (
            <span className="flex items-center gap-1 text-xs text-red-400">
              <AlertCircle className="w-3 h-3" /> {stats.overdue} venc.
            </span>
          )}
        </div>

        {/* Info del rol - Redundante, se elimina */}

        {/* Modal de Detalle de Tarea Mejorado */}
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="mt-6 p-4 bg-theme-card border border-theme rounded-xl"
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
                    <div className="w-1 h-1 bg-accent rounded-full" />
                    {action}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </motion.div>

        {/* Modal de Detalle de Tarea Mejorado */}
        {selectedTask && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => setSelectedTask(null)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-theme-card border border-theme rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden flex flex-col"
            >
              {/* Header */}
              <div className="p-6 border-b border-theme bg-gradient-to-r from-theme-tertiary/30 to-transparent">
                {/* Navigation Pills */}
                <div className="flex items-center justify-between mb-4">
                  <button 
                    onClick={() => navigateToTask('prev')}
                    className="flex items-center gap-1 px-3 py-1.5 text-xs text-theme-secondary hover:text-theme-primary hover:bg-theme-hover rounded-lg transition-colors"
                  >
                    <ChevronDown className="w-4 h-4 rotate-90" />
                    Anterior
                  </button>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-theme-tertiary">
                      {filteredTareas.findIndex(t => t.id === selectedTask.id) + 1} / {filteredTareas.length}
                    </span>
                    <div className="flex gap-1">
                      {filteredTareas.slice(
                        Math.max(0, filteredTareas.findIndex(t => t.id === selectedTask.id) - 2),
                        filteredTareas.findIndex(t => t.id === selectedTask.id) + 3
                      ).map((t) => (
                        <button
                          key={t.id}
                          onClick={() => setSelectedTask(t)}
                          className={`w-2 h-2 rounded-full transition-all ${t.id === selectedTask.id ? 'bg-accent w-4' : 'bg-theme-tertiary hover:bg-theme-secondary'}`}
                        />
                      ))}
                    </div>
                  </div>
                  <button 
                    onClick={() => navigateToTask('next')}
                    className="flex items-center gap-1 px-3 py-1.5 text-xs text-theme-secondary hover:text-theme-primary hover:bg-theme-hover rounded-lg transition-colors"
                  >
                    Siguiente
                    <ChevronDown className="w-4 h-4 -rotate-90" />
                  </button>
                </div>
                
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-3 flex-wrap">
                      <span className={`px-2.5 py-1 text-xs font-medium rounded-full border ${getPriorityColor(selectedTask.priority)}`}>
                        {getPriorityText(selectedTask.priority)}
                      </span>
                      <span className={`px-2.5 py-1 text-xs font-medium rounded-full border ${getStatusColor(selectedTask.status)}`}>
                        {getStatusText(selectedTask.status)}
                      </span>
                      {selectedTask.status === 'overdue' && (
                        <span className="px-2.5 py-1 text-xs font-medium rounded-full bg-red-500/20 text-red-400 border border-red-500/30 flex items-center gap-1">
                          <AlertCircle className="w-3 h-3" /> ¡Vencida!
                        </span>
                      )}
                    </div>
                    <h2 className="text-xl font-bold text-theme-primary">{selectedTask.title}</h2>
                    <p className="text-sm text-theme-tertiary mt-1 flex items-center gap-2">
                      <Flag className="w-3 h-3" /> {selectedTask.id}
                    </p>
                  </div>
                  <button 
                    onClick={() => setSelectedTask(null)}
                    className="p-2 text-theme-tertiary hover:text-theme-primary hover:bg-theme-hover rounded-lg transition-colors"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </div>
              
              {/* Content */}
              <div className="p-6 space-y-5 overflow-y-auto flex-1">
                <div>
                  <h3 className="text-xs font-medium text-theme-tertiary uppercase tracking-wider mb-2">Descripción</h3>
                  <p className="text-theme-primary leading-relaxed">{selectedTask.description}</p>
                </div>

                {selectedTask.expedienteTitle && (
                  <div className="p-4 bg-blue-500/10 border border-blue-500/20 rounded-xl">
                    <h3 className="text-xs font-medium text-blue-400 uppercase tracking-wider mb-2 flex items-center gap-1">
                      <Briefcase className="w-3 h-3" /> Expediente relacionado
                    </h3>
                    <p className="text-theme-primary font-medium">{selectedTask.expedienteTitle}</p>
                    <p className="text-sm text-blue-400/70">{selectedTask.expedienteId}</p>
                  </div>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="p-4 bg-theme-tertiary/30 rounded-xl">
                    <h3 className="text-xs font-medium text-theme-tertiary uppercase tracking-wider mb-3 flex items-center gap-1">
                      <User className="w-3 h-3" /> Asignado a
                    </h3>
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-gradient-to-br from-accent/20 to-accent/5 rounded-full flex items-center justify-center text-sm font-medium text-accent border border-accent/30">
                        {selectedTask.assignedToName.split(' ').map((n: string) => n[0]).join('')}
                      </div>
                      <div>
                        <p className="text-theme-primary font-medium">{selectedTask.assignedToName}</p>
                        <p className="text-xs text-theme-tertiary">Por: {selectedTask.assignedByName}</p>
                      </div>
                    </div>
                  </div>
                  <div className="p-4 bg-theme-tertiary/30 rounded-xl">
                    <h3 className="text-xs font-medium text-theme-tertiary uppercase tracking-wider mb-3 flex items-center gap-1">
                      <Calendar className="w-3 h-3" /> Fechas
                    </h3>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-theme-tertiary">Creada</span>
                        <span className="text-theme-primary">{new Date(selectedTask.createdAt).toLocaleDateString('es-ES')}</span>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-theme-tertiary">Vencimiento</span>
                        <span className={selectedTask.status === 'overdue' ? 'text-red-400 font-medium' : 'text-theme-primary'}>
                          {new Date(selectedTask.dueDate).toLocaleDateString('es-ES')}
                        </span>
                      </div>
                      {selectedTask.completedAt && (
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-emerald-400">Completada</span>
                          <span className="text-emerald-400">{new Date(selectedTask.completedAt).toLocaleDateString('es-ES')}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {selectedTask.tags.length > 0 && (
                  <div>
                    <h3 className="text-xs font-medium text-theme-tertiary uppercase tracking-wider mb-2">Etiquetas</h3>
                    <div className="flex gap-2 flex-wrap">
                      {selectedTask.tags.map(tag => (
                        <span key={tag} className="px-3 py-1.5 bg-theme-tertiary/50 text-theme-secondary rounded-lg text-sm flex items-center gap-1">
                          <Pin className="w-3 h-3" /> {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Comments Section */}
                <div>
                  <h3 className="text-xs font-medium text-theme-tertiary uppercase tracking-wider mb-3 flex items-center gap-1">
                    <MessageSquare className="w-3 h-3" /> Comentarios ({selectedTask.comments.length})
                  </h3>
                  {selectedTask.comments.length > 0 ? (
                    <div className="space-y-3">
                      {selectedTask.comments.map(comment => (
                        <div key={comment.id} className="p-3 bg-theme-tertiary/30 rounded-xl">
                          <div className="flex items-center justify-between mb-1.5">
                            <span className="text-sm font-medium text-theme-primary flex items-center gap-2">
                              <div className="w-6 h-6 bg-gradient-to-br from-theme-tertiary to-theme-hover rounded-full flex items-center justify-center text-[10px] font-medium text-theme-secondary">
                                {comment.author.split(' ').map((n: string) => n[0]).join('')}
                              </div>
                              {comment.author}
                            </span>
                            <span className="text-xs text-theme-tertiary">{new Date(comment.createdAt).toLocaleDateString('es-ES')}</span>
                          </div>
                          <p className="text-sm text-theme-secondary pl-8">{comment.content}</p>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="p-4 text-center border border-dashed border-theme rounded-xl">
                      <MessageSquare className="w-6 h-6 text-theme-tertiary mx-auto mb-2" />
                      <p className="text-sm text-theme-tertiary">No hay comentarios aún</p>
                    </div>
                  )}
                  
                  {/* Add Comment Input */}
                  <div className="mt-3 flex gap-2">
                    <input
                      type="text"
                      placeholder="Agregar un comentario..."
                      className="flex-1 px-4 py-2 bg-theme-tertiary/50 border border-theme rounded-xl text-theme-primary placeholder-theme-tertiary text-sm focus:outline-none focus:border-accent"
                    />
                    <button className="px-4 py-2 bg-accent text-slate-950 rounded-xl hover:bg-amber-400 transition-colors">
                      <MessageSquare className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>

              {/* Footer Actions */}
              <div className="p-4 border-t border-theme bg-theme-tertiary/20 flex justify-between items-center">
                <div className="flex gap-2">
                  {permissions.canEdit && (
                    <button 
                      onClick={() => { setSelectedTask(null); openEditModal(selectedTask); }}
                      className="px-4 py-2 bg-theme-card border border-theme text-theme-primary rounded-xl hover:bg-theme-hover transition-colors flex items-center gap-2"
                    >
                      <Edit2 className="w-4 h-4" />
                      Editar
                    </button>
                  )}
                </div>
                <div className="flex gap-2">
                  <button 
                    onClick={() => setSelectedTask(null)}
                    className="px-4 py-2 text-theme-secondary hover:text-theme-primary transition-colors"
                  >
                    Cerrar
                  </button>
                  {selectedTask.status !== 'completed' && permissions.canMarkComplete && (
                    <button 
                      onClick={() => handleCompleteTask(selectedTask.id)}
                      className="px-4 py-2 bg-emerald-500 text-slate-950 font-medium rounded-xl hover:bg-emerald-400 transition-colors flex items-center gap-2"
                    >
                      <CheckCircle2 className="w-4 h-4" />
                      Completar
                    </button>
                  )}
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}

        {/* Modal Crear/Editar Tarea */}
        <AnimatePresence>
          {(activeModal === 'create' || activeModal === 'edit') && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
              onClick={() => { setActiveModal(null); setEditingTask(null); }}
            >
              <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 20 }}
                onClick={(e) => e.stopPropagation()}
                className="bg-theme-card border border-theme rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
              >
                <div className="p-6 border-b border-theme flex items-center justify-between">
                  <h2 className="text-xl font-bold text-theme-primary">
                    {activeModal === 'create' ? 'Nueva Tarea' : 'Editar Tarea'}
                  </h2>
                  <button 
                    onClick={() => { setActiveModal(null); setEditingTask(null); }}
                    className="p-2 text-theme-tertiary hover:text-theme-primary hover:bg-theme-hover rounded-lg transition-colors"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
                
                <div className="p-6 space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-theme-secondary mb-1">Título *</label>
                    <input
                      type="text"
                      value={activeModal === 'edit' && editingTask ? editingTask.title : newTaskForm.title}
                      onChange={(e) => activeModal === 'edit' && editingTask
                        ? setEditingTask({ ...editingTask, title: e.target.value })
                        : setNewTaskForm({ ...newTaskForm, title: e.target.value })
                      }
                      placeholder="Título de la tarea"
                      className="w-full px-4 py-2 bg-theme-tertiary border border-theme rounded-lg text-theme-primary placeholder-theme-tertiary focus:outline-none focus:border-accent"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-theme-secondary mb-1">Descripción *</label>
                    <textarea
                      value={activeModal === 'edit' && editingTask ? editingTask.description : newTaskForm.description}
                      onChange={(e) => activeModal === 'edit' && editingTask
                        ? setEditingTask({ ...editingTask, description: e.target.value })
                        : setNewTaskForm({ ...newTaskForm, description: e.target.value })
                      }
                      placeholder="Describe la tarea..."
                      rows={3}
                      className="w-full px-4 py-2 bg-theme-tertiary border border-theme rounded-lg text-theme-primary placeholder-theme-tertiary focus:outline-none focus:border-accent resize-none"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-theme-secondary mb-1">Prioridad</label>
                      <select
                        value={activeModal === 'edit' && editingTask ? editingTask.priority : newTaskForm.priority}
                        onChange={(e) => activeModal === 'edit' && editingTask
                          ? setEditingTask({ ...editingTask, priority: e.target.value as 'high' | 'medium' | 'low' })
                          : setNewTaskForm({ ...newTaskForm, priority: e.target.value })
                        }
                        className="w-full px-4 py-2 bg-theme-tertiary border border-theme rounded-lg text-theme-primary focus:outline-none focus:border-accent"
                      >
                        <option value="high">Alta</option>
                        <option value="medium">Media</option>
                        <option value="low">Baja</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-theme-secondary mb-1">Estado</label>
                      <select
                        value={activeModal === 'edit' && editingTask ? editingTask.status : newTaskForm.status}
                        onChange={(e) => activeModal === 'edit' && editingTask
                          ? setEditingTask({ ...editingTask, status: e.target.value as 'pending' | 'in_progress' | 'completed' | 'overdue' })
                          : setNewTaskForm({ ...newTaskForm, status: e.target.value })
                        }
                        className="w-full px-4 py-2 bg-theme-tertiary border border-theme rounded-lg text-theme-primary focus:outline-none focus:border-accent"
                      >
                        <option value="pending">Pendiente</option>
                        <option value="in_progress">En Progreso</option>
                        <option value="completed">Completada</option>
                        <option value="overdue">Vencida</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-theme-secondary mb-1">Fecha de vencimiento</label>
                    <input
                      type="date"
                      value={activeModal === 'edit' && editingTask ? editingTask.dueDate.split('T')[0] : newTaskForm.dueDate}
                      onChange={(e) => activeModal === 'edit' && editingTask
                        ? setEditingTask({ ...editingTask, dueDate: e.target.value })
                        : setNewTaskForm({ ...newTaskForm, dueDate: e.target.value })
                      }
                      className="w-full px-4 py-2 bg-theme-tertiary border border-theme rounded-lg text-theme-primary focus:outline-none focus:border-accent"
                    />
                  </div>

                  {permissions.canAssign && (
                    <div>
                      <label className="block text-sm font-medium text-theme-secondary mb-1">Asignado a</label>
                      <select
                        value={activeModal === 'edit' && editingTask ? editingTask.assignedTo : newTaskForm.assignedTo}
                        onChange={(e) => activeModal === 'edit' && editingTask
                          ? setEditingTask({ ...editingTask, assignedTo: e.target.value, assignedToName: e.target.value === 'current-user' ? 'Usuario Actual' : 'Otro Usuario' })
                          : setNewTaskForm({ ...newTaskForm, assignedTo: e.target.value, assignedToName: e.target.value === 'current-user' ? 'Usuario Actual' : 'Otro Usuario' })
                        }
                        className="w-full px-4 py-2 bg-theme-tertiary border border-theme rounded-lg text-theme-primary focus:outline-none focus:border-accent"
                      >
                        <option value="current-user">Usuario Actual</option>
                        <option value="otro-usuario">Otro Usuario</option>
                      </select>
                    </div>
                  )}

                  <div>
                    <label className="block text-sm font-medium text-theme-secondary mb-1">Expediente relacionado</label>
                    <input
                      type="text"
                      value={activeModal === 'edit' && editingTask ? editingTask.expedienteTitle || '' : newTaskForm.expedienteTitle}
                      onChange={(e) => activeModal === 'edit' && editingTask
                        ? setEditingTask({ ...editingTask, expedienteTitle: e.target.value, expedienteId: e.target.value ? `EXP-${e.target.value.slice(0,4).toUpperCase()}` : undefined })
                        : setNewTaskForm({ ...newTaskForm, expedienteTitle: e.target.value })
                      }
                      placeholder="Nombre del expediente (opcional)"
                      className="w-full px-4 py-2 bg-theme-tertiary border border-theme rounded-lg text-theme-primary placeholder-theme-tertiary focus:outline-none focus:border-accent"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-theme-secondary mb-1">Etiquetas (separadas por comas)</label>
                    <input
                      type="text"
                      value={activeModal === 'edit' && editingTask ? editingTask.tags.join(', ') : newTaskForm.tags}
                      onChange={(e) => activeModal === 'edit' && editingTask
                        ? setEditingTask({ ...editingTask, tags: e.target.value.split(',').map(t => t.trim()).filter(Boolean) })
                        : setNewTaskForm({ ...newTaskForm, tags: e.target.value })
                      }
                      placeholder="urgente, revisión, cliente..."
                      className="w-full px-4 py-2 bg-theme-tertiary border border-theme rounded-lg text-theme-primary placeholder-theme-tertiary focus:outline-none focus:border-accent"
                    />
                  </div>
                </div>

                <div className="p-6 border-t border-theme flex justify-end gap-3">
                  <button 
                    onClick={() => { setActiveModal(null); setEditingTask(null); }}
                    className="px-4 py-2 text-theme-secondary hover:text-theme-primary transition-colors"
                  >
                    Cancelar
                  </button>
                  <button 
                    onClick={activeModal === 'create' ? handleCreateTask : handleUpdateTask}
                    className="px-4 py-2 bg-accent text-slate-950 font-medium rounded-xl hover:bg-amber-400 transition-colors"
                  >
                    {activeModal === 'create' ? 'Crear Tarea' : 'Guardar Cambios'}
                  </button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Modal Confirmar Eliminación */}
        <AnimatePresence>
          {activeModal === 'delete' && editingTask && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
              onClick={() => { setActiveModal(null); setEditingTask(null); }}
            >
              <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 20 }}
                onClick={(e) => e.stopPropagation()}
                className="bg-theme-card border border-theme rounded-2xl max-w-md w-full p-6"
              >
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 bg-red-500/10 rounded-full flex items-center justify-center">
                    <Trash2 className="w-6 h-6 text-red-500" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-theme-primary">Eliminar Tarea</h3>
                    <p className="text-sm text-theme-secondary">Esta acción no se puede deshacer</p>
                  </div>
                </div>
                
                <p className="text-theme-primary mb-6">
                  ¿Estás seguro de que deseas eliminar la tarea <strong className="text-theme-primary">{editingTask.title}</strong>?
                </p>

                <div className="flex justify-end gap-3">
                  <button 
                    onClick={() => { setActiveModal(null); setEditingTask(null); }}
                    className="px-4 py-2 text-theme-secondary hover:text-theme-primary transition-colors"
                  >
                    Cancelar
                  </button>
                  <button 
                    onClick={handleDeleteTask}
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

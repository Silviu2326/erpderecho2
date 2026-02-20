import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Bell, Check, CheckCheck, Trash2, Settings, Search,
  AlertCircle, Gavel, CheckSquare, MessageSquare, FileText,
  DollarSign, Settings2, Mail, Smartphone, BellRing,
  EyeOff, Filter, X, ChevronRight,
  Activity, Zap, Target, FileCheck,
  ArrowRight
} from 'lucide-react';
import { AppLayout } from '@/components/layout/AppLayout';
import { useRole } from '@/hooks/useRole';
import type { UserRole } from '@/types/roles';
import { 
  notificacionesData,
  notificacionesConfigData,
  getNotificacionTypeColor,
  getNotificacionTypeText,
  getNotificacionTypeIcon,
  getPriorityColor,
  getPriorityText,
  type Notificacion,
  type NotificacionConfig
} from '@/data/notificacionesData';

const ROLE_NOTIFICATION_TYPES: Record<UserRole, string[]> = {
  super_admin: ['system', 'deadline', 'task', 'message', 'hearing', 'document', 'approval', 'expense'],
  socio: ['system', 'deadline', 'task', 'message', 'hearing', 'document', 'approval', 'expense'],
  abogado_senior: ['deadline', 'task', 'message', 'hearing', 'document', 'expense'],
  abogado_junior: ['deadline', 'task', 'message', 'hearing', 'document', 'expense'],
  paralegal: ['task', 'document', 'message'],
  secretario: ['hearing', 'task', 'message', 'system'],
  administrador: ['system', 'expense', 'approval', 'message'],
  contador: ['expense', 'approval', 'system', 'message'],
  recepcionista: ['hearing', 'message', 'system'],
};

const ROLE_NOTIFICATION_CONFIG: Record<UserRole, string[]> = {
  super_admin: ['deadline', 'hearing', 'task', 'message', 'document', 'expense', 'approval', 'system'],
  socio: ['deadline', 'hearing', 'task', 'message', 'document', 'expense', 'approval', 'system'],
  abogado_senior: ['deadline', 'hearing', 'task', 'message', 'document'],
  abogado_junior: ['deadline', 'hearing', 'task', 'message', 'document'],
  paralegal: ['task', 'document', 'message'],
  secretario: ['hearing', 'task', 'message', 'system'],
  administrador: ['system', 'expense', 'approval', 'message'],
  contador: ['expense', 'approval', 'system', 'message'],
  recepcionista: ['hearing', 'message', 'system'],
};

const ROLE_TITLES: Record<UserRole, { title: string; subtitle: string }> = {
  super_admin: { title: 'Centro de Notificaciones', subtitle: 'Monitoreo completo del bufete' },
  socio: { title: 'Centro de Notificaciones', subtitle: 'Notificaciones del bufete' },
  abogado_senior: { title: 'Mis Notificaciones', subtitle: 'Casos y tareas asignadas' },
  abogado_junior: { title: 'Mis Notificaciones', subtitle: 'Tareas y plazos de tus casos' },
  paralegal: { title: 'Notificaciones de Trabajo', subtitle: 'Tareas y documentos' },
  secretario: { title: 'Centro de Notificaciones', subtitle: 'Agenda y tareas' },
  administrador: { title: 'Notificaciones Admin', subtitle: 'Gastos y aprobaciones' },
  contador: { title: 'Notificaciones Contables', subtitle: 'Finanzas y facturación' },
  recepcionista: { title: 'Notificaciones de Citas', subtitle: 'Agenda del bufete' },
};

type Category = 'all' | 'urgent' | 'unread' | 'deadline' | 'hearing' | 'task' | 'message' | 'document' | 'expense' | 'approval' | 'system';

interface CategoryInfo {
  id: Category;
  label: string;
  icon: React.ElementType;
  color: string;
  bgColor: string;
}

const CATEGORIES: CategoryInfo[] = [
  { id: 'all', label: 'Todas', icon: Bell, color: 'text-theme-primary', bgColor: 'bg-accent/20' },
  { id: 'urgent', label: 'Urgentes', icon: Zap, color: 'text-red-400', bgColor: 'bg-red-500/20' },
  { id: 'unread', label: 'Sin leer', icon: EyeOff, color: 'text-amber-400', bgColor: 'bg-amber-500/20' },
  { id: 'deadline', label: 'Vencimientos', icon: AlertCircle, color: 'text-orange-400', bgColor: 'bg-orange-500/20' },
  { id: 'hearing', label: 'Audiencias', icon: Gavel, color: 'text-blue-400', bgColor: 'bg-blue-500/20' },
  { id: 'task', label: 'Tareas', icon: CheckSquare, color: 'text-emerald-400', bgColor: 'bg-emerald-500/20' },
  { id: 'message', label: 'Mensajes', icon: MessageSquare, color: 'text-purple-400', bgColor: 'bg-purple-500/20' },
  { id: 'document', label: 'Documentos', icon: FileText, color: 'text-teal-400', bgColor: 'bg-teal-500/20' },
  { id: 'expense', label: 'Gastos', icon: DollarSign, color: 'text-cyan-400', bgColor: 'bg-cyan-500/20' },
  { id: 'approval', label: 'Aprobaciones', icon: FileCheck, color: 'text-pink-400', bgColor: 'bg-pink-500/20' },
  { id: 'system', label: 'Sistema', icon: Settings2, color: 'text-slate-400', bgColor: 'bg-slate-500/20' },
];

function getCategoryByRole(role: UserRole): CategoryInfo[] {
  const allowedTypes = ROLE_NOTIFICATION_TYPES[role];
  return CATEGORIES.filter(c => {
    if (c.id === 'all' || c.id === 'urgent' || c.id === 'unread') return true;
    return allowedTypes.includes(c.id);
  });
}

function groupByTime(notifications: Notificacion[]): { label: string; data: Notificacion[] }[] {
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const yesterday = new Date(today.getTime() - 24 * 60 * 60 * 1000);
  const thisWeek = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
  
  const groups: { label: string; data: Notificacion[] }[] = [];
  
  const todayNotifs = notifications.filter(n => new Date(n.createdAt) >= today);
  const yesterdayNotifs = notifications.filter(n => {
    const date = new Date(n.createdAt);
    return date >= yesterday && date < today;
  });
  const weekNotifs = notifications.filter(n => {
    const date = new Date(n.createdAt);
    return date >= thisWeek && date < yesterday;
  });
  const olderNotifs = notifications.filter(n => new Date(n.createdAt) < thisWeek);
  
  if (todayNotifs.length > 0) groups.push({ label: 'Hoy', data: todayNotifs });
  if (yesterdayNotifs.length > 0) groups.push({ label: 'Ayer', data: yesterdayNotifs });
  if (weekNotifs.length > 0) groups.push({ label: 'Esta semana', data: weekNotifs });
  if (olderNotifs.length > 0) groups.push({ label: 'Anteriores', data: olderNotifs });
  
  return groups;
}

export default function Notificaciones() {
  const { role } = useRole();
  const [selectedCategory, setSelectedCategory] = useState<Category>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [notifications, setNotifications] = useState<Notificacion[]>(notificacionesData);
  const [selectedNotification, setSelectedNotification] = useState<Notificacion | null>(null);
  const [showConfig, setShowConfig] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  
  const roleFilteredNotifications = useMemo(() => {
    const allowedTypes = ROLE_NOTIFICATION_TYPES[role];
    return notifications.filter(n => allowedTypes.includes(n.type));
  }, [notifications, role]);

  const filteredNotifications = useMemo(() => {
    let filtered = roleFilteredNotifications;
    
    if (selectedCategory === 'urgent') {
      filtered = filtered.filter(n => n.priority === 'urgent');
    } else if (selectedCategory === 'unread') {
      filtered = filtered.filter(n => n.status === 'unread');
    } else if (selectedCategory !== 'all') {
      filtered = filtered.filter(n => n.type === selectedCategory);
    }
    
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(n => 
        n.title.toLowerCase().includes(query) || 
        n.message.toLowerCase().includes(query)
      );
    }
    
    return filtered.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }, [roleFilteredNotifications, selectedCategory, searchQuery]);

  const groupedNotifications = useMemo(() => groupByTime(filteredNotifications), [filteredNotifications]);

  const stats = useMemo(() => {
    const roleNotifs = roleFilteredNotifications;
    return {
      total: roleNotifs.length,
      unread: roleNotifs.filter(n => n.status === 'unread').length,
      urgent: roleNotifs.filter(n => n.priority === 'urgent').length,
      thisWeek: roleNotifs.filter(n => {
        const date = new Date(n.createdAt);
        const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
        return date >= weekAgo;
      }).length,
    };
  }, [roleFilteredNotifications]);

  const categoryStats = useMemo(() => {
    const counts: Record<string, number> = {};
    roleFilteredNotifications.forEach(n => {
      counts[n.type] = (counts[n.type] || 0) + 1;
    });
    return counts;
  }, [roleFilteredNotifications]);

  const markAsRead = (id: string) => {
    setNotifications(prev => prev.map(n => 
      n.id === id ? { ...n, status: 'read', readAt: new Date().toISOString() } : n
    ));
    if (selectedNotification?.id === id) {
      setSelectedNotification(prev => prev ? { ...prev, status: 'read', readAt: new Date().toISOString() } : null);
    }
  };

  const markAllAsRead = () => {
    setNotifications(prev => prev.map(n => 
      n.status === 'unread' ? { ...n, status: 'read', readAt: new Date().toISOString() } : n
    ));
  };

  const deleteNotification = (id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
    if (selectedNotification?.id === id) {
      setSelectedNotification(null);
    }
  };

  const getIcon = (type: string) => {
    switch (getNotificacionTypeIcon(type)) {
      case 'alert-circle': return AlertCircle;
      case 'gavel': return Gavel;
      case 'check-square': return CheckSquare;
      case 'message-square': return MessageSquare;
      case 'file-text': return FileText;
      case 'dollar-sign': return DollarSign;
      case 'check-circle': return Check;
      case 'settings': return Settings2;
      default: return Bell;
    }
  };

  const categories = getCategoryByRole(role);
  const { title, subtitle } = ROLE_TITLES[role];

  const headerActions = (
    <div className="flex items-center gap-2">
      <button 
        onClick={markAllAsRead}
        disabled={stats.unread === 0}
        className="hidden sm:flex items-center gap-2 px-4 py-2 bg-theme-secondary text-theme-primary font-medium rounded-xl hover:bg-theme-tertiary transition-colors border border-theme disabled:opacity-50 disabled:cursor-not-allowed"
      >
        <CheckCheck className="w-4 h-4" />
        <span className="hidden lg:inline">Todo leído</span>
      </button>
      <button 
        onClick={() => setShowConfig(true)}
        className="hidden sm:flex items-center gap-2 px-4 py-2 bg-accent text-slate-950 font-medium rounded-xl hover:bg-accent-secondary transition-colors"
      >
        <Settings className="w-4 h-4" />
        <span className="hidden lg:inline">Configurar</span>
      </button>
    </div>
  );

  return (
    <AppLayout title={title} subtitle={subtitle} headerActions={headerActions}>
      <main className="flex-1 overflow-hidden">
        <div className="h-full flex">
          {/* Columna Izquierda - Sidebar */}
          <aside className="w-72 bg-theme-secondary border-r border-theme flex flex-col hidden lg:flex">
            {/* Search */}
            <div className="p-4 border-b border-theme">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-theme-tertiary" />
                <input
                  type="text"
                  placeholder="Buscar notificaciones..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-4 py-2.5 bg-theme-tertiary border border-theme rounded-xl text-theme-primary text-sm placeholder:text-theme-tertiary focus:outline-none focus:border-accent transition-colors"
                />
              </div>
            </div>

            {/* Stats Grid */}
            <div className="p-4 border-b border-theme">
              <div className="grid grid-cols-2 gap-3">
                <motion.div 
                  whileHover={{ scale: 1.02 }}
                  className="p-3 bg-theme-tertiary rounded-xl border border-theme"
                >
                  <div className="flex items-center gap-2 mb-1">
                    <Bell className="w-4 h-4 text-slate-400" />
                    <span className="text-xs text-theme-secondary">Total</span>
                  </div>
                  <p className="text-2xl font-bold text-theme-primary">{stats.total}</p>
                </motion.div>
                <motion.div 
                  whileHover={{ scale: 1.02 }}
                  className="p-3 bg-amber-500/10 rounded-xl border border-amber-500/20"
                >
                  <div className="flex items-center gap-2 mb-1">
                    <EyeOff className="w-4 h-4 text-amber-400" />
                    <span className="text-xs text-amber-400">Sin leer</span>
                  </div>
                  <p className="text-2xl font-bold text-amber-400">{stats.unread}</p>
                </motion.div>
                <motion.div 
                  whileHover={{ scale: 1.02 }}
                  className="p-3 bg-red-500/10 rounded-xl border border-red-500/20"
                >
                  <div className="flex items-center gap-2 mb-1">
                    <Zap className="w-4 h-4 text-red-400" />
                    <span className="text-xs text-red-400">Urgentes</span>
                  </div>
                  <p className="text-2xl font-bold text-red-400">{stats.urgent}</p>
                </motion.div>
                <motion.div 
                  whileHover={{ scale: 1.02 }}
                  className="p-3 bg-emerald-500/10 rounded-xl border border-emerald-500/20"
                >
                  <div className="flex items-center gap-2 mb-1">
                    <Activity className="w-4 h-4 text-emerald-400" />
                    <span className="text-xs text-emerald-400">Esta semana</span>
                  </div>
                  <p className="text-2xl font-bold text-emerald-400">{stats.thisWeek}</p>
                </motion.div>
              </div>
            </div>

            {/* Categories */}
            <div className="flex-1 overflow-y-auto p-2">
              <div className="space-y-1">
                {categories.map((cat) => {
                  const Icon = cat.id === 'urgent' ? Zap : cat.icon;
                  const count = cat.id === 'all' ? stats.total : 
                               cat.id === 'unread' ? stats.unread :
                               cat.id === 'urgent' ? stats.urgent :
                               categoryStats[cat.id] || 0;
                  const isActive = selectedCategory === cat.id;
                  
                  return (
                    <motion.button
                      key={cat.id}
                      whileHover={{ x: 4 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => setSelectedCategory(cat.id)}
                      className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all ${
                        isActive 
                          ? 'bg-accent/20 border border-accent/30' 
                          : 'hover:bg-theme-hover border border-transparent'
                      }`}
                    >
                      <div className={`w-8 h-8 rounded-lg ${isActive ? cat.bgColor : 'bg-theme-tertiary'} flex items-center justify-center`}>
                        <Icon className={`w-4 h-4 ${isActive ? 'text-accent' : cat.color}`} />
                      </div>
                      <span className={`flex-1 text-left text-sm font-medium ${isActive ? 'text-accent' : 'text-theme-primary'}`}>
                        {cat.label}
                      </span>
                      {count > 0 && (
                        <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                          isActive 
                            ? 'bg-accent text-slate-950' 
                            : 'bg-theme-tertiary text-theme-secondary'
                        }`}>
                          {count}
                        </span>
                      )}
                    </motion.button>
                  );
                })}
              </div>
            </div>

            {/* Quick Actions */}
            <div className="p-4 border-t border-theme">
              <button
                onClick={() => setShowConfig(true)}
                className="w-full flex items-center gap-3 px-3 py-2.5 bg-theme-tertiary hover:bg-theme-hover rounded-xl transition-colors"
              >
                <Settings className="w-4 h-4 text-theme-secondary" />
                <span className="text-sm text-theme-secondary">Configuración</span>
                <ChevronRight className="w-4 h-4 text-theme-tertiary ml-auto" />
              </button>
            </div>
          </aside>

          {/* Columna Centro - Lista de Notificaciones */}
          <section className="flex-1 flex flex-col min-w-0 bg-theme-primary">
            {/* Mobile Search & Filter Bar */}
            <div className="lg:hidden p-4 border-b border-theme bg-theme-secondary">
              <div className="relative mb-3">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-theme-tertiary" />
                <input
                  type="text"
                  placeholder="Buscar..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-4 py-2 bg-theme-tertiary border border-theme rounded-xl text-theme-primary text-sm"
                />
              </div>
              <div className="flex gap-2 overflow-x-auto pb-1">
                {categories.slice(0, 5).map((cat) => (
                  <button
                    key={cat.id}
                    onClick={() => setSelectedCategory(cat.id)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap ${
                      selectedCategory === cat.id 
                        ? 'bg-accent text-slate-950' 
                        : 'bg-theme-tertiary text-theme-secondary'
                    }`}
                  >
                    {cat.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Header de Lista */}
            <div className="px-6 py-4 border-b border-theme bg-theme-secondary/50">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-semibold text-theme-primary">
                    {categories.find(c => c.id === selectedCategory)?.label || 'Todas'}
                  </h2>
                  <p className="text-sm text-theme-secondary">
                    {filteredNotifications.length} notificación{filteredNotifications.length !== 1 ? 'es' : ''}
                  </p>
                </div>
                <button 
                  onClick={() => setShowFilters(!showFilters)}
                  className="lg:hidden p-2 text-theme-secondary hover:text-theme-primary hover:bg-theme-hover rounded-lg"
                >
                  <Filter className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Notifications List */}
            <div className="flex-1 overflow-y-auto">
              <AnimatePresence>
                {groupedNotifications.map((group) => (
                  <div key={group.label}>
                    {/* Time Group Header */}
                    <div className="sticky top-0 px-6 py-2 bg-theme-primary/95 backdrop-blur-sm border-b border-theme z-10">
                      <div className="flex items-center gap-3">
                        <div className="h-px flex-1 bg-theme" />
                        <span className="text-xs font-medium text-theme-tertiary uppercase tracking-wider px-2">
                          {group.label}
                        </span>
                        <div className="h-px flex-1 bg-theme" />
                      </div>
                    </div>

                    {/* Notifications */}
                    <div className="p-3 space-y-2">
                      {group.data.map((notificacion, idx) => {
                        const Icon = getIcon(notificacion.type);
                        const isSelected = selectedNotification?.id === notificacion.id;
                        
                        return (
                          <motion.div
                            key={notificacion.id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: idx * 0.05 }}
                            whileHover={{ scale: 1.01 }}
                            onClick={() => setSelectedNotification(notificacion)}
                            className={`p-4 rounded-xl cursor-pointer transition-all ${
                              isSelected 
                                ? 'bg-accent/10 border-2 border-accent shadow-lg shadow-accent/10' 
                                : notificacion.status === 'unread'
                                ? 'bg-theme-card border border-accent/30 hover:border-accent/50'
                                : 'bg-theme-card border border-theme hover:border-theme-hover'
                            }`}
                          >
                            <div className="flex items-start gap-4">
                              {/* Icon */}
                              <div className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 ${getNotificacionTypeColor(notificacion.type)}`}>
                                <Icon className="w-6 h-6" />
                              </div>

                              {/* Content */}
                              <div className="flex-1 min-w-0">
                                <div className="flex items-start justify-between gap-2">
                                  <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2 mb-1">
                                      <h3 className={`font-semibold truncate ${notificacion.status === 'unread' ? 'text-theme-primary' : 'text-theme-secondary'}`}>
                                        {notificacion.title}
                                      </h3>
                                      {notificacion.status === 'unread' && (
                                        <span className="w-2 h-2 bg-accent rounded-full flex-shrink-0" />
                                      )}
                                    </div>
                                    <p className="text-sm text-theme-secondary line-clamp-2">{notificacion.message}</p>
                                    
                                    <div className="flex items-center gap-3 mt-2">
                                      <span className="text-xs text-theme-muted">
                                        {new Date(notificacion.createdAt).toLocaleString('es-ES', {
                                          day: 'numeric',
                                          month: 'short',
                                          hour: '2-digit',
                                          minute: '2-digit'
                                        })}
                                      </span>
                                      <span className={`px-2 py-0.5 text-xs rounded-full ${getPriorityColor(notificacion.priority)}`}>
                                        {getPriorityText(notificacion.priority)}
                                      </span>
                                      {notificacion.sender && (
                                        <span className="text-xs text-theme-muted flex items-center gap-1">
                                          <span className="w-5 h-5 bg-theme-tertiary rounded-full flex items-center justify-center text-[10px]">
                                            {notificacion.senderAvatar}
                                          </span>
                                          {notificacion.sender}
                                        </span>
                                      )}
                                    </div>
                                  </div>

                                  {/* Actions */}
                                  <div className="flex items-center gap-1 flex-shrink-0" onClick={(e) => e.stopPropagation()}>
                                    {notificacion.status === 'unread' && (
                                      <button 
                                        onClick={() => markAsRead(notificacion.id)}
                                        className="p-2 text-theme-muted hover:text-emerald-500 hover:bg-emerald-500/10 rounded-lg transition-colors"
                                        title="Marcar como leída"
                                      >
                                        <Check className="w-4 h-4" />
                                      </button>
                                    )}
                                    <button 
                                      onClick={() => deleteNotification(notificacion.id)}
                                      className="p-2 text-theme-muted hover:text-red-500 hover:bg-red-500/10 rounded-lg transition-colors"
                                      title="Eliminar"
                                    >
                                      <Trash2 className="w-4 h-4" />
                                    </button>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </motion.div>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </AnimatePresence>

              {filteredNotifications.length === 0 && (
                <div className="flex flex-col items-center justify-center h-64 p-8 text-center">
                  <div className="w-20 h-20 bg-theme-secondary rounded-full flex items-center justify-center mb-4">
                    <Bell className="w-10 h-10 text-theme-tertiary" />
                  </div>
                  <h3 className="text-lg font-semibold text-theme-primary mb-2">Sin notificaciones</h3>
                  <p className="text-theme-secondary text-sm max-w-xs">
                    {searchQuery 
                      ? 'No hay notificaciones que coincidan con tu búsqueda'
                      : 'No hay notificaciones en esta categoría'}
                  </p>
                </div>
              )}
            </div>
          </section>

          {/* Columna Derecha - Preview */}
          <aside className="w-96 bg-theme-secondary border-l border-theme flex-col hidden xl:flex">
            {selectedNotification ? (
              <PreviewPanel 
                notification={selectedNotification}
                onMarkAsRead={() => markAsRead(selectedNotification.id)}
                onDelete={() => deleteNotification(selectedNotification.id)}
                onClose={() => setSelectedNotification(null)}
              />
            ) : (
              <EmptyPreview />
            )}
          </aside>
        </div>

        {/* Config Modal */}
        <AnimatePresence>
          {showConfig && (
            <ConfigModal 
              role={role} 
              onClose={() => setShowConfig(false)}
            />
          )}
        </AnimatePresence>
      </main>
    </AppLayout>
  );
}

function PreviewPanel({ 
  notification, 
  onMarkAsRead, 
  onDelete, 
  onClose 
}: { 
  notification: Notificacion; 
  onMarkAsRead: () => void;
  onDelete: () => void;
  onClose: () => void;
}) {
  const Icon = (() => {
    switch (getNotificacionTypeIcon(notification.type)) {
      case 'alert-circle': return AlertCircle;
      case 'gavel': return Gavel;
      case 'check-square': return CheckSquare;
      case 'message-square': return MessageSquare;
      case 'file-text': return FileText;
      case 'dollar-sign': return DollarSign;
      case 'check-circle': return Check;
      case 'settings': return Settings2;
      default: return Bell;
    }
  })();

  return (
    <>
      <div className="p-4 border-b border-theme flex items-center justify-between">
        <h3 className="font-semibold text-theme-primary">Detalles</h3>
        <button 
          onClick={onClose}
          className="p-1.5 text-theme-tertiary hover:text-theme-primary hover:bg-theme-hover rounded-lg"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-6">
        {/* Header */}
        <div className="flex items-start gap-4 mb-6">
          <div className={`w-14 h-14 rounded-2xl flex items-center justify-center ${getNotificacionTypeColor(notification.type)}`}>
            <Icon className="w-7 h-7" />
          </div>
          <div className="flex-1">
            <h2 className="text-lg font-bold text-theme-primary mb-1">{notification.title}</h2>
            <span className={`px-2 py-0.5 text-xs rounded-full ${getPriorityColor(notification.priority)}`}>
              {getPriorityText(notification.priority)}
            </span>
          </div>
        </div>

        {/* Message */}
        <div className="mb-6">
          <h4 className="text-xs font-medium text-theme-tertiary uppercase tracking-wider mb-2">Mensaje</h4>
          <p className="text-theme-secondary leading-relaxed">{notification.message}</p>
        </div>

        {/* Metadata */}
        <div className="space-y-3 mb-6">
          <div className="flex items-center justify-between p-3 bg-theme-tertiary/50 rounded-xl">
            <span className="text-sm text-theme-secondary">Tipo</span>
            <span className="text-sm font-medium text-theme-primary">{getNotificacionTypeText(notification.type)}</span>
          </div>
          <div className="flex items-center justify-between p-3 bg-theme-tertiary/50 rounded-xl">
            <span className="text-sm text-theme-secondary">Recibida</span>
            <span className="text-sm font-medium text-theme-primary">
              {new Date(notification.createdAt).toLocaleString('es-ES', {
                day: 'numeric',
                month: 'long',
                year: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
              })}
            </span>
          </div>
          {notification.readAt && (
            <div className="flex items-center justify-between p-3 bg-theme-tertiary/50 rounded-xl">
              <span className="text-sm text-theme-secondary">Leída</span>
              <span className="text-sm font-medium text-theme-primary">
                {new Date(notification.readAt).toLocaleString('es-ES', {
                  day: 'numeric',
                  month: 'short',
                  hour: '2-digit',
                  minute: '2-digit'
                })}
              </span>
            </div>
          )}
          {notification.sender && (
            <div className="flex items-center justify-between p-3 bg-theme-tertiary/50 rounded-xl">
              <span className="text-sm text-theme-secondary">Remitente</span>
              <div className="flex items-center gap-2">
                <span className="w-6 h-6 bg-accent/20 rounded-full flex items-center justify-center text-xs font-medium text-accent">
                  {notification.senderAvatar}
                </span>
                <span className="text-sm font-medium text-theme-primary">{notification.sender}</span>
              </div>
            </div>
          )}
          {notification.relatedId && (
            <div className="flex items-center justify-between p-3 bg-theme-tertiary/50 rounded-xl">
              <span className="text-sm text-theme-secondary">Referencia</span>
              <span className="text-sm font-medium text-accent">{notification.relatedId}</span>
            </div>
          )}
        </div>

        {/* Action Button */}
        {notification.actionUrl && (
          <a
            href={notification.actionUrl}
            className="flex items-center justify-center gap-2 w-full py-3 bg-accent text-slate-950 font-medium rounded-xl hover:bg-accent-secondary transition-colors mb-4"
          >
            {notification.actionText || 'Ver detalle'}
            <ArrowRight className="w-4 h-4" />
          </a>
        )}

        {/* Actions */}
        <div className="flex gap-2">
          {notification.status === 'unread' && (
            <button
              onClick={onMarkAsRead}
              className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-emerald-500/10 text-emerald-400 rounded-xl hover:bg-emerald-500/20 transition-colors"
            >
              <Check className="w-4 h-4" />
              <span className="text-sm font-medium">Marcar leída</span>
            </button>
          )}
          <button
            onClick={onDelete}
            className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-red-500/10 text-red-400 rounded-xl hover:bg-red-500/20 transition-colors"
          >
            <Trash2 className="w-4 h-4" />
            <span className="text-sm font-medium">Eliminar</span>
          </button>
        </div>
      </div>
    </>
  );
}

function EmptyPreview() {
  return (
    <div className="flex-1 flex flex-col items-center justify-center p-8 text-center">
      <div className="w-24 h-24 bg-theme-tertiary/50 rounded-full flex items-center justify-center mb-4">
        <Target className="w-12 h-12 text-theme-tertiary" />
      </div>
      <h3 className="text-lg font-semibold text-theme-primary mb-2">Vista previa</h3>
      <p className="text-theme-secondary text-sm max-w-xs">
        Selecciona una notificación para ver sus detalles
      </p>
    </div>
  );
}

function ConfigModal({ role, onClose }: { role: UserRole; onClose: () => void }) {
  const [config, setConfig] = useState<NotificacionConfig[]>(notificacionesConfigData);
  const [expandedType, setExpandedType] = useState<string | null>(null);

  const allowedTypes = ROLE_NOTIFICATION_CONFIG[role];
  const filteredConfig = config.filter(c => allowedTypes.includes(c.type));

  const toggleEnabled = (type: string) => {
    setConfig(prev => prev.map(c => 
      c.type === type ? { ...c, enabled: !c.enabled } : c
    ));
  };

  const toggleChannel = (type: string, channel: 'email' | 'push' | 'sms') => {
    setConfig(prev => prev.map(c => 
      c.type === type ? { ...c, [channel]: !c[channel] } : c
    ));
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.95, opacity: 0 }}
        className="bg-theme-secondary border border-theme rounded-2xl w-full max-w-2xl max-h-[85vh] flex flex-col"
        onClick={e => e.stopPropagation()}
      >
        <div className="p-6 border-b border-theme flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-theme-primary">Configuración de Notificaciones</h2>
            <p className="text-sm text-theme-secondary mt-1">Personaliza cómo recibes tus alertas</p>
          </div>
          <button onClick={onClose} className="p-2 text-theme-tertiary hover:text-theme-primary hover:bg-theme-hover rounded-lg">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-3">
          {filteredConfig.map((item) => {
            const Icon = (() => {
              switch (item.type) {
                case 'deadline': return AlertCircle;
                case 'hearing': return Gavel;
                case 'task': return CheckSquare;
                case 'message': return MessageSquare;
                case 'document': return FileText;
                case 'expense': return DollarSign;
                case 'approval': return FileCheck;
                case 'system': return Settings2;
                default: return Bell;
              }
            })();
            const isExpanded = expandedType === item.type;

            return (
              <motion.div
                key={item.type}
                layout
                className={`bg-theme-tertiary/30 rounded-xl border transition-colors ${
                  item.enabled ? 'border-theme' : 'border-transparent opacity-60'
                }`}
              >
                <button
                  onClick={() => setExpandedType(isExpanded ? null : item.type)}
                  className="w-full flex items-center gap-4 p-4"
                >
                  <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${getNotificacionTypeColor(item.type)}`}>
                    <Icon className="w-5 h-5" />
                  </div>
                  <div className="flex-1 text-left">
                    <h4 className="font-medium text-theme-primary">{item.label}</h4>
                    <p className="text-xs text-theme-secondary">{getNotificacionTypeText(item.type)}</p>
                  </div>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleEnabled(item.type);
                    }}
                    className={`relative w-12 h-6 rounded-full transition-colors ${
                      item.enabled ? 'bg-accent' : 'bg-theme-hover'
                    }`}
                  >
                    <span className={`absolute top-1 left-1 w-4 h-4 bg-white rounded-full transition-transform ${
                      item.enabled ? 'translate-x-6' : 'translate-x-0'
                    }`} />
                  </button>
                </button>

                <AnimatePresence>
                  {item.enabled && isExpanded && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="overflow-hidden"
                    >
                      <div className="px-4 pb-4 ml-14 flex gap-4">
                        {[
                          { key: 'email', icon: Mail, label: 'Email' },
                          { key: 'push', icon: BellRing, label: 'Push' },
                          { key: 'sms', icon: Smartphone, label: 'SMS' },
                        ].map(({ key, icon: ChannelIcon, label }) => (
                          <label
                            key={key}
                            className="flex items-center gap-2 cursor-pointer"
                          >
                            <input
                              type="checkbox"
                              checked={item[key as keyof NotificacionConfig] as boolean}
                              onChange={() => toggleChannel(item.type, key as 'email' | 'push' | 'sms')}
                              className="w-4 h-4 rounded border-theme bg-theme-tertiary text-accent focus:ring-accent"
                            />
                            <ChannelIcon className="w-4 h-4 text-theme-secondary" />
                            <span className="text-sm text-theme-secondary">{label}</span>
                          </label>
                        ))}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            );
          })}
        </div>

        <div className="p-6 border-t border-theme bg-theme-tertiary/20">
          <div className="flex items-start gap-3 p-4 bg-accent/10 border border-accent/20 rounded-xl">
            <Bell className="w-5 h-5 text-accent flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-accent">Nota importante</p>
              <p className="text-sm text-theme-secondary mt-1">
                Las notificaciones urgentes siempre se enviarán por todos los canales activos.
              </p>
            </div>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}

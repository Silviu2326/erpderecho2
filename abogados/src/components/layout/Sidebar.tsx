import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { LucideIcon } from 'lucide-react';
import { 
  Scale, Settings, LogOut, LayoutDashboard, FolderOpen, Calendar, 
  Users, BarChart3, MessageSquare, CreditCard, BookOpen,
  Clock, Shield, Calculator, CheckSquare, UserCircle, Gavel, DollarSign,
  Receipt, FileText, Bell, Activity, Building2, X, FileSignature,
  Timer, ShieldAlert, ChevronDown, ChevronRight, Search, Upload,
  Briefcase, Sparkles, Bot, Fingerprint, Link, BellRing
} from 'lucide-react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useRole } from '@/hooks/useRole';
import type { UserRole } from '@/types/roles';

interface SidebarItem {
  icon: LucideIcon;
  label: string;
  path: string;
  roles: UserRole[];
  badge?: number;
}

interface ModuleGroup {
  id: string;
  name: string;
  icon: LucideIcon;
  color: string;
  items: SidebarItem[];
  defaultOpen?: boolean;
}

// Definición de módulos con sus páginas
const moduleGroups: ModuleGroup[] = [
  {
    id: 'core',
    name: 'M1 - Core Legal',
    icon: Scale,
    color: 'from-blue-500 to-blue-600',
    defaultOpen: true,
    items: [
      { icon: LayoutDashboard, label: 'Dashboard', path: '/dashboard', roles: ['super_admin', 'socio', 'abogado_senior', 'abogado_junior', 'paralegal', 'secretario', 'administrador', 'contador', 'recepcionista'] },
      { icon: FolderOpen, label: 'Expedientes', path: '/core/expedientes', roles: ['super_admin', 'socio', 'abogado_senior', 'abogado_junior', 'paralegal', 'secretario'], badge: 6 },
      { icon: Calendar, label: 'Calendario', path: '/core/calendario', roles: ['super_admin', 'socio', 'abogado_senior', 'abogado_junior', 'paralegal', 'secretario', 'administrador', 'recepcionista'], badge: 8 },
      { icon: Gavel, label: 'Audiencias', path: '/core/audiencias', roles: ['super_admin', 'socio', 'abogado_senior', 'abogado_junior', 'paralegal', 'secretario'], badge: 4 },
      { icon: Clock, label: 'Prescripciones', path: '/core/prescripciones', roles: ['super_admin', 'socio', 'abogado_senior', 'abogado_junior'] },
    ]
  },
  {
    id: 'documentos',
    name: 'M2 - Gestión Documental',
    icon: FileText,
    color: 'from-purple-500 to-purple-600',
    items: [
      { icon: BookOpen, label: 'Biblioteca', path: '/documentos/biblioteca', roles: ['super_admin', 'socio', 'abogado_senior', 'abogado_junior', 'paralegal', 'secretario', 'administrador', 'contador'] },
      { icon: Search, label: 'Buscar', path: '/documentos/buscar', roles: ['super_admin', 'socio', 'abogado_senior', 'abogado_junior', 'paralegal', 'secretario'] },
      { icon: Upload, label: 'OCR', path: '/documentos/ocr', roles: ['super_admin', 'socio', 'administrador', 'contador'] },
    ]
  },
  {
    id: 'finanzas',
    name: 'M3 - Finanzas',
    icon: DollarSign,
    color: 'from-emerald-500 to-emerald-600',
    items: [
      { icon: CreditCard, label: 'Facturación', path: '/finanzas/facturacion', roles: ['super_admin', 'socio', 'administrador', 'contador'] },
      { icon: Calculator, label: 'Contabilidad', path: '/finanzas/contabilidad', roles: ['super_admin', 'socio', 'administrador', 'contador'] },
      { icon: Receipt, label: 'Gastos', path: '/finanzas/gastos', roles: ['super_admin', 'socio', 'administrador', 'contador'] },
      { icon: BarChart3, label: 'Rentabilidad', path: '/finanzas/rentabilidad', roles: ['super_admin', 'socio', 'administrador'] },
    ]
  },
  {
    id: 'cobranza',
    name: 'M4 - Cobranza',
    icon: BellRing,
    color: 'from-amber-500 to-amber-600',
    items: [
      { icon: DollarSign, label: 'Cobranza', path: '/cobranza/dashboard', roles: ['super_admin', 'socio', 'administrador', 'contador'] },
      { icon: Building2, label: 'Proveedores', path: '/cobranza/proveedores', roles: ['super_admin', 'socio', 'administrador'] },
      { icon: Settings, label: 'Configuración', path: '/cobranza/config', roles: ['super_admin', 'administrador'] },
    ]
  },
  {
    id: 'tiempo',
    name: 'M5 - Tiempo & Tareas',
    icon: Timer,
    color: 'from-cyan-500 to-cyan-600',
    items: [
      { icon: CheckSquare, label: 'Tareas', path: '/tiempo/tareas', roles: ['super_admin', 'socio', 'abogado_senior', 'abogado_junior', 'paralegal', 'secretario'], badge: 3 },
      { icon: Clock, label: 'Tiempo', path: '/tiempo/tracking', roles: ['super_admin', 'socio', 'abogado_senior', 'abogado_junior', 'paralegal'] },
      { icon: Activity, label: 'Informes', path: '/tiempo/informes', roles: ['super_admin', 'socio', 'administrador'] },
    ]
  },
  {
    id: 'comunicaciones',
    name: 'M6 - Comunicaciones',
    icon: MessageSquare,
    color: 'from-indigo-500 to-indigo-600',
    items: [
      { icon: MessageSquare, label: 'Mensajes', path: '/comunicaciones/mensajes', roles: ['super_admin', 'socio', 'abogado_senior', 'abogado_junior', 'paralegal', 'secretario', 'administrador', 'contador', 'recepcionista'], badge: 3 },
      { icon: Building2, label: 'Juzgados', path: '/comunicaciones/juzgados', roles: ['super_admin', 'socio', 'abogado_senior', 'abogado_junior', 'paralegal'] },
      { icon: Bell, label: 'Notificaciones', path: '/comunicaciones/notificaciones', roles: ['super_admin', 'socio', 'administrador'] },
    ]
  },
  {
    id: 'portal',
    name: 'M7 - Portal Cliente',
    icon: UserCircle,
    color: 'from-pink-500 to-pink-600',
    items: [
      { icon: UserCircle, label: 'Portal Cliente', path: '/portal', roles: ['super_admin', 'socio', 'administrador'] },
    ]
  },
  {
    id: 'firmas',
    name: 'M8 - Firmas Digitales',
    icon: FileSignature,
    color: 'from-teal-500 to-teal-600',
    items: [
      { icon: FileSignature, label: 'Firmas', path: '/firmas', roles: ['super_admin', 'socio', 'abogado_senior', 'abogado_junior', 'administrador', 'contador'], badge: 2 },
    ]
  },
  {
    id: 'informes',
    name: 'M9 - Informes & BI',
    icon: BarChart3,
    color: 'from-orange-500 to-orange-600',
    items: [
      { icon: BarChart3, label: 'Informes', path: '/informes', roles: ['super_admin', 'socio', 'administrador', 'contador'] },
    ]
  },
  {
    id: 'biblioteca',
    name: 'M10 - Biblioteca Legal',
    icon: BookOpen,
    color: 'from-rose-500 to-rose-600',
    items: [
      { icon: BookOpen, label: 'Legislación', path: '/biblioteca/legislacion', roles: ['super_admin', 'socio', 'abogado_senior', 'abogado_junior', 'paralegal'] },
      { icon: FileText, label: 'Plantillas', path: '/biblioteca/plantillas', roles: ['super_admin', 'socio', 'abogado_senior', 'administrador'] },
    ]
  },
  {
    id: 'ia',
    name: 'M11 - IA Legal',
    icon: Sparkles,
    color: 'from-violet-500 to-violet-600',
    items: [
      { icon: Bot, label: 'Chat IA', path: '/ia/chat', roles: ['super_admin', 'socio', 'abogado_senior'] },
      { icon: Search, label: 'Búsqueda', path: '/ia/busqueda', roles: ['super_admin', 'socio', 'abogado_senior', 'abogado_junior'] },
      { icon: FileText, label: 'Generador', path: '/ia/generador', roles: ['super_admin', 'socio', 'abogado_senior', 'abogado_junior'] },
    ]
  },
  {
    id: 'forense',
    name: 'M12 - Biblioteca Forense',
    icon: Fingerprint,
    color: 'from-slate-500 to-slate-600',
    items: [
      { icon: Shield, label: 'Verificar ID', path: '/forense/verificar', roles: ['super_admin', 'socio', 'administrador'] },
      { icon: FileText, label: 'Informes', path: '/forense/informes', roles: ['super_admin', 'socio'] },
    ]
  },
  {
    id: 'integraciones',
    name: 'M13 - Integraciones',
    icon: Link,
    color: 'from-zinc-500 to-zinc-600',
    items: [
      { icon: Building2, label: 'LexNET', path: '/integraciones/lexnet', roles: ['super_admin', 'socio', 'abogado_senior', 'abogado_junior'] },
    ]
  },
  {
    id: 'admin',
    name: 'Admin',
    icon: Shield,
    color: 'from-red-500 to-red-600',
    items: [
      { icon: Settings, label: 'Configuración', path: '/admin/config', roles: ['super_admin'] },
      { icon: Users, label: 'Usuarios', path: '/admin/usuarios', roles: ['super_admin'] },
      { icon: UserCircle, label: 'Clientes', path: '/admin/clientes', roles: ['super_admin', 'administrador'] },
    ]
  },
];

export default function Sidebar() {
  const [isOpen, setIsOpen] = useState(true);
  const [expandedModules, setExpandedModules] = useState<string[]>(['core']);
  const navigate = useNavigate();
  const location = useLocation();
  const { role } = useRole();

  const toggleModule = (moduleId: string) => {
    setExpandedModules(prev => 
      prev.includes(moduleId) 
        ? prev.filter(id => id !== moduleId)
        : [...prev, moduleId]
    );
  };

  const userRole = role as UserRole;

  // Filtrar módulos por rol
  const visibleModules = moduleGroups.map(group => ({
    ...group,
    items: group.items.filter(item => item.roles.includes(userRole))
  })).filter(group => group.items.length > 0);

  return (
    <motion.aside
      initial={false}
      animate={{ width: isOpen ? 280 : 80 }}
      className="fixed left-0 top-0 h-screen bg-theme-card border-r border-theme flex flex-col z-40"
    >
      {/* Header */}
      <div className="p-4 border-b border-theme flex items-center justify-between">
        <AnimatePresence mode="wait">
          {isOpen && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex items-center gap-3"
            >
              <div className="w-10 h-10 bg-gradient-to-br from-accent to-purple-500 rounded-xl flex items-center justify-center">
                <Scale className="w-5 h-5 text-white" />
              </div>
              <div>
                <h1 className="font-bold text-theme-primary">DERECHO</h1>
                <p className="text-xs text-theme-muted">Legal ERP</p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
        
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="p-2 text-theme-muted hover:text-theme-primary hover:bg-theme-tertiary rounded-lg transition-colors"
        >
          {isOpen ? <X className="w-5 h-5" /> : <ChevronRight className="w-5 h-5" />}
        </button>
      </div>

      {/* Módulos */}
      <div className="flex-1 overflow-y-auto py-4">
        <AnimatePresence>
          {isOpen ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="space-y-1 px-2"
            >
              {visibleModules.map((group) => (
                <div key={group.id} className="mb-2">
                  {/* Módulo Header */}
                  <button
                    onClick={() => toggleModule(group.id)}
                    className="w-full flex items-center gap-3 px-3 py-2 rounded-xl hover:bg-theme-tertiary transition-colors group"
                  >
                    <div className={`w-8 h-8 bg-gradient-to-br ${group.color} rounded-lg flex items-center justify-center flex-shrink-0`}>
                      <group.icon className="w-4 h-4 text-white" />
                    </div>
                    <span className="flex-1 text-left text-sm font-medium text-theme-primary truncate">
                      {group.name}
                    </span>
                    <ChevronDown 
                      className={`w-4 h-4 text-theme-muted transition-transform ${
                        expandedModules.includes(group.id) ? '' : '-rotate-90'
                      }`} 
                    />
                  </button>

                  {/* Submenú */}
                  <AnimatePresence>
                    {expandedModules.includes(group.id) && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="overflow-hidden ml-4 mt-1 space-y-1"
                      >
                        {group.items.map((item) => {
                          const isActive = location.pathname === item.path;
                          return (
                            <Link
                              key={item.path}
                              to={item.path}
                              className={`
                                flex items-center gap-3 px-3 py-2 rounded-lg transition-colors
                                ${isActive 
                                  ? 'bg-accent/10 text-accent' 
                                  : 'text-theme-secondary hover:bg-theme-tertiary hover:text-theme-primary'
                                }
                              `}
                            >
                              <item.icon className="w-4 h-4 flex-shrink-0" />
                              <span className="flex-1 text-sm truncate">{item.label}</span>
                              {item.badge && (
                                <span className="px-2 py-0.5 text-xs bg-accent text-white rounded-full">
                                  {item.badge}
                                </span>
                              )}
                            </Link>
                          );
                        })}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              ))}
            </motion.div>
          ) : (
            // Modo compacto - solo iconos
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="space-y-1 px-2"
            >
              {visibleModules.map((group) => (
                <div key={group.id} className="relative group">
                  <button
                    onClick={() => toggleModule(group.id)}
                    className={`
                      w-full flex items-center justify-center p-2 rounded-xl 
                      hover:bg-theme-tertiary transition-colors
                    `}
                  >
                    <div className={`w-8 h-8 bg-gradient-to-br ${group.color} rounded-lg flex items-center justify-center`}>
                      <group.icon className="w-4 h-4 text-white" />
                    </div>
                  </button>
                  
                  {/* Tooltip */}
                  <div className="absolute left-full ml-2 px-2 py-1 bg-theme-primary text-theme-secondary text-sm rounded-lg opacity-0 group-hover:opacity-100 pointer-events-none whitespace-nowrap z-50">
                    {group.name}
                  </div>

                  {/* Dropdown en compacto */}
                  <div className="absolute left-full ml-1 top-0 bg-theme-card border border-theme rounded-xl shadow-lg opacity-0 group-hover:opacity-100 pointer-events-none group-hover:pointer-events-auto min-w-[200px] z-50">
                    {group.items.map((item) => {
                      const isActive = location.pathname === item.path;
                      return (
                        <Link
                          key={item.path}
                          to={item.path}
                          className={`
                            flex items-center gap-3 px-3 py-2 first:rounded-t-xl last:rounded-b-xl transition-colors
                            ${isActive 
                              ? 'bg-accent/10 text-accent' 
                              : 'text-theme-secondary hover:bg-theme-tertiary hover:text-theme-primary'
                            }
                          `}
                        >
                          <item.icon className="w-4 h-4" />
                          <span className="flex-1 text-sm">{item.label}</span>
                          {item.badge && (
                            <span className="px-2 py-0.5 text-xs bg-accent text-white rounded-full">
                              {item.badge}
                            </span>
                          )}
                        </Link>
                      );
                    })}
                  </div>
                </div>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Footer */}
      <div className="p-4 border-t border-theme">
        <button className="w-full flex items-center gap-3 px-3 py-2 text-theme-muted hover:text-theme-primary hover:bg-theme-tertiary rounded-lg transition-colors">
          <LogOut className="w-5 h-5" />
          {isOpen && <span className="text-sm">Cerrar sesión</span>}
        </button>
      </div>
    </motion.aside>
  );
}

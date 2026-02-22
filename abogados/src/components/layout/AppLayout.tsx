import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Bell, ChevronDown, Users, Settings, LogOut } from 'lucide-react';
import { useRole } from '@/hooks/useRole';
import type { UserRole } from '@/types/roles';
import { ThemeToggleSimple } from '@/components/ThemeToggle';
import Sidebar from './Sidebar';

interface AppLayoutProps {
  children: React.ReactNode;
  title: string;
  subtitle?: string;
  headerActions?: React.ReactNode;
}

const notifications = [
  { id: 1, title: 'Nuevo expediente asignado', message: 'Se te ha asignado el caso EXP-2024-006 - Delito fiscal', time: '5 min', read: false, type: 'case' },
  { id: 2, title: 'Plazo próximo crítico', message: 'Vence plazo en EXP-2024-001 en 2 horas', time: '1 h', read: false, type: 'urgent' },
  { id: 3, title: 'Pago recibido', message: 'El cliente Juan Martínez ha pagado la factura #234 - €5,000', time: '3 h', read: true, type: 'payment' },
];

export function AppLayout({ children, title, subtitle, headerActions }: AppLayoutProps) {
  const [showNotifications, setShowNotifications] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const { role, roleConfig, roleName, isLoading } = useRole();

  // Obtener datos del usuario desde localStorage
  const userEmail = localStorage.getItem('userEmail') || 'usuario@derecho.erp';

  // Generar iniciales a partir del email
  const userInitials = useMemo(() => {
    const emailParts = userEmail.split('@')[0].split(/[._-]/);
    if (emailParts.length >= 2) {
      return (emailParts[0][0] + emailParts[1][0]).toUpperCase();
    }
    return userEmail.substring(0, 2).toUpperCase();
  }, [userEmail]);

  const handleLogout = () => {
    localStorage.removeItem('userRole');
    localStorage.removeItem('userRoleName');
    localStorage.removeItem('userEmail');
    navigate('/login');
  };

  const isActive = (path: string) => location.pathname === path;

  // Mostrar loading mientras se carga el rol
  if (isLoading) {
    return (
      <div className="min-h-screen bg-theme-primary flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-amber-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-theme-primary flex overflow-hidden">
      {/* Sidebar */}
      <Sidebar />

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0 ml-[280px]">
        {/* Header */}
        <header className="h-20 bg-theme-secondary/80 backdrop-blur-xl border-b border-theme flex items-center justify-between px-4 lg:px-8">
          <div className="flex items-center gap-3 lg:gap-4">
            <div>
              <h1 className="text-xl font-bold text-theme-primary">{title}</h1>
              {subtitle && <p className="text-sm text-theme-secondary">{subtitle}</p>}
            </div>
          </div>

          <div className="flex items-center gap-4">
            {/* Custom Header Actions */}
            {headerActions}

            {/* Theme Toggle */}
            <ThemeToggleSimple />

            {/* Notifications */}
            <div className="relative">
              <button
                onClick={() => setShowNotifications(!showNotifications)}
                className="relative p-2 text-theme-secondary hover:text-theme-primary hover:bg-theme-tertiary rounded-lg transition-colors"
              >
                <Bell className="w-5 h-5" />
                <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full animate-pulse" />
              </button>

              <AnimatePresence>
                {showNotifications && (
                  <motion.div
                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 10, scale: 0.95 }}
                    className="absolute right-0 top-full mt-2 w-96 bg-theme-secondary border border-theme rounded-2xl shadow-2xl z-50 overflow-hidden"
                  >
                    <div className="p-4 border-b border-theme flex items-center justify-between">
                      <h3 className="font-semibold text-theme-primary">Notifsicaciones</h3>
                      <button className="text-xs text-accent hover:text-amber-400">Marcar todas leídas</button>
                    </div>
                    <div className="max-h-80 overflow-y-auto">
                      {notifications.map((notif) => (
                        <div
                          key={notif.id}
                          className={`p-4 border-b border-theme hover:bg-theme-tertiary/50 cursor-pointer transition-colors ${!notif.read ? 'bg-accent/5' : ''
                            }`}
                        >
                          <div className="flex items-start gap-3">
                            <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${notif.type === 'urgent' ? 'bg-red-500/20' :
                                notif.type === 'payment' ? 'bg-emerald-500/20' :
                                  'bg-blue-500/20'
                              }`}>
                              <span className={`w-2 h-2 rounded-full ${notif.type === 'urgent' ? 'bg-red-500' :
                                  notif.type === 'payment' ? 'bg-emerald-500' :
                                    'bg-blue-500'
                                }`} />
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium text-theme-primary">{notif.title}</p>
                              <p className="text-xs text-theme-secondary mt-1">{notif.message}</p>
                              <p className="text-xs text-theme-tertiary mt-1">{notif.time}</p>
                            </div>
                            {!notif.read && <div className="w-2 h-2 bg-accent rounded-full flex-shrink-0" />}
                          </div>
                        </div>
                      ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* User Menu */}
            <div className="relative">
              <button
                onClick={() => setShowUserMenu(!showUserMenu)}
                className="flex items-center gap-3 px-3 py-2 hover:bg-theme-tertiary rounded-xl transition-colors"
              >
                <div className={`w-10 h-10 bg-gradient-to-br ${roleConfig.color} rounded-full flex items-center justify-center text-theme-primary font-bold`}>
                  {userInitials}
                </div>
                <div className="hidden md:block text-left">
                  <p className="text-sm font-medium text-theme-primary">{userEmail.split('@')[0].replace(/[._-]/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}</p>
                  <p className={`text-xs ${roleConfig.textColor}`}>{roleName}</p>
                </div>
                <ChevronDown className="w-4 h-4 text-theme-secondary hidden md:block" />
              </button>

              <AnimatePresence>
                {showUserMenu && (
                  <motion.div
                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 10, scale: 0.95 }}
                    className="absolute right-0 top-full mt-2 w-64 bg-theme-secondary border border-theme rounded-2xl shadow-2xl z-50 py-2 overflow-hidden"
                  >
                    <div className="px-4 py-3 border-b border-theme">
                      <p className="text-sm font-medium text-theme-primary">{userEmail}</p>
                      <p className={`text-xs ${roleConfig.textColor}`}>{roleName}</p>
                    </div>
                    <Link to="/profile" className="flex items-center gap-3 px-4 py-3 text-theme-secondary hover:bg-theme-tertiary hover:text-theme-primary transition-colors">
                      <Users className="w-4 h-4" />
                      Mi Perfil
                    </Link>
                    <Link to="/settings" className="flex items-center gap-3 px-4 py-3 text-theme-secondary hover:bg-theme-tertiary hover:text-theme-primary transition-colors">
                      <Settings className="w-4 h-4" />
                      Configuración
                    </Link>
                    <div className="border-t border-theme my-2" />
                    <button
                      onClick={handleLogout}
                      className="w-full flex items-center gap-3 px-4 py-3 text-red-400 hover:bg-red-500/10 transition-colors"
                    >
                      <LogOut className="w-4 h-4" />
                      Cerrar sesión
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </header>

        {/* Page Content */}
        {children}
      </div>
    </div>
  );
}

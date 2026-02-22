import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { useDashboard } from '@/hooks/useDashboard';
import { useRole } from '@/hooks/useRole';
import Sidebar from '@/components/layout/Sidebar';
import { Header } from '@/components/layout/Header';
import { SearchModal } from '@/components/layout/SearchModal';
import type { UserRole } from '@/types/roles';

// Importar dashboards por rol
import {
  SuperAdminDashboard,
  SocioDashboard,
  AbogadoSeniorDashboard,
  AbogadoJuniorDashboard,
  ParalegalDashboard,
  SecretarioDashboard,
  AdministradorDashboard,
  ContadorDashboard,
  RecepcionistaDashboard,
} from '@/components/dashboard/roles';

// Componente que renderiza el dashboard según el rol
function RoleBasedDashboard({ role }: { role: UserRole }) {
  switch (role) {
    case 'super_admin':
      return <SuperAdminDashboard />;
    case 'socio':
      return <SocioDashboard />;
    case 'abogado_senior':
      return <AbogadoSeniorDashboard />;
    case 'abogado_junior':
      return <AbogadoJuniorDashboard />;
    case 'paralegal':
      return <ParalegalDashboard />;
    case 'secretario':
      return <SecretarioDashboard />;
    case 'administrador':
      return <AdministradorDashboard />;
    case 'contador':
      return <ContadorDashboard />;
    case 'recepcionista':
      return <RecepcionistaDashboard />;
    default:
      return <AbogadoJuniorDashboard />;
  }
}

export default function Dashboard() {
  const location = useLocation();
  const {
    sidebarOpen,
    setSidebarOpen,
    isMobile,
    showSearchModal,
    setShowSearchModal,
  } = useDashboard();

  const { role, roleName, isLoading } = useRole();

  // Cerrar sidebar al navegar en móvil
  useEffect(() => {
    if (isMobile) {
      setSidebarOpen(false);
    }
  }, [location.pathname, isMobile, setSidebarOpen]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-theme-primary flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-amber-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-theme-primary flex overflow-hidden">
      <Sidebar 
        isOpen={sidebarOpen} 
        isMobile={isMobile}
        onClose={() => setSidebarOpen(false)}
      />

      <div className="flex-1 flex flex-col min-w-0">
        <Header 
          sidebarOpen={sidebarOpen}
          isMobile={isMobile}
          onToggleSidebar={() => setSidebarOpen(!sidebarOpen)}
          onOpenSearch={() => setShowSearchModal(true)}
        />

        <main className="flex-1 overflow-y-auto">
          {/* Role Banner */}
          <div className="px-6 lg:px-8 py-4 border-b border-theme">
            <div className="flex items-center gap-3">
              <span className="text-sm text-theme-tertiary">Rol actual:</span>
              <span className="px-3 py-1 bg-accent/10 text-accent rounded-full text-sm font-medium">
                {roleName}
              </span>
            </div>
          </div>

          {/* Dashboard Content based on Role */}
          <div className="p-6 lg:p-8">
            <RoleBasedDashboard role={role} />
          </div>
        </main>
      </div>

      <SearchModal 
        isOpen={showSearchModal} 
        onClose={() => setShowSearchModal(false)} 
      />
    </div>
  );
}

import { ReactNode } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth, type UserRole } from '@/contexts/AuthContext';
import { Loader2 } from 'lucide-react';

interface ProtectedRouteProps {
  children: ReactNode;
  requiredRoles?: UserRole[];
  requiredPermissions?: string[];
  fallback?: ReactNode;
}

export function ProtectedRoute({ 
  children, 
  requiredRoles, 
  requiredPermissions,
  fallback 
}: ProtectedRouteProps) {
  const { isAuthenticated, isLoading, user, hasRole, hasPermission } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-theme-primary">
        <Loader2 className="w-8 h-8 animate-spin text-amber-500" />
      </div>
    );
  }

  if (!isAuthenticated) {
    // Redirect to login if not authenticated
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Check if user is active
  if (user && !user.activo) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-theme-primary p-4">
        <div className="max-w-md w-full p-6 bg-red-500/10 border border-red-500/20 rounded-xl text-center">
          <h2 className="text-xl font-bold text-red-500 mb-2">Cuenta desactivada</h2>
          <p className="text-theme-secondary">
            Tu cuenta ha sido desactivada. Contacta al administrador para más información.
          </p>
        </div>
      </div>
    );
  }

  // Check required roles
  if (requiredRoles && requiredRoles.length > 0) {
    if (!hasRole(...requiredRoles)) {
      if (fallback) {
        return <>{fallback}</>;
      }
      return (
        <div className="min-h-screen flex items-center justify-center bg-theme-primary p-4">
          <div className="max-w-md w-full p-6 bg-amber-500/10 border border-amber-500/20 rounded-xl text-center">
            <h2 className="text-xl font-bold text-amber-500 mb-2">Acceso denegado</h2>
            <p className="text-theme-secondary">
              No tienes los permisos necesarios para acceder a esta página.
            </p>
          </div>
        </div>
      );
    }
  }

  // Check required permissions
  if (requiredPermissions && requiredPermissions.length > 0) {
    const hasAllPermissions = requiredPermissions.every(perm => hasPermission(perm));
    if (!hasAllPermissions) {
      if (fallback) {
        return <>{fallback}</>;
      }
      return (
        <div className="min-h-screen flex items-center justify-center bg-theme-primary p-4">
          <div className="max-w-md w-full p-6 bg-amber-500/10 border border-amber-500/20 rounded-xl text-center">
            <h2 className="text-xl font-bold text-amber-500 mb-2">Acceso denegado</h2>
            <p className="text-theme-secondary">
              No tienes los permisos necesarios para acceder a esta funcionalidad.
            </p>
          </div>
        </div>
      );
    }
  }

  return <>{children}</>;
}

export default ProtectedRoute;

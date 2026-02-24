import React, { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from 'react';
import authService, { type User, type UserRole, type UserPermissions } from '@/services/authService';

interface AuthContextType {
  user: User | null;
  userRole: UserRole | null;
  permissions: string[];
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (userData: RegisterData) => Promise<void>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
  refreshPermissions: () => Promise<void>;
  forgotPassword: (email: string) => Promise<void>;
  resetPassword: (token: string, newPassword: string) => Promise<void>;
  verifyEmail: (token: string) => Promise<void>;
  resendVerification: () => Promise<void>;
  changePassword: (currentPassword: string, newPassword: string) => Promise<void>;
  hasPermission: (permission: string) => boolean;
  hasRole: (...roles: UserRole[]) => boolean;
}

interface RegisterData {
  email: string;
  password: string;
  nombre: string;
  apellido1?: string;
  apellido2?: string;
  rol?: string;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [permissions, setPermissions] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Check if user is authenticated on mount
  useEffect(() => {
    const initAuth = async () => {
      if (authService.isAuthenticated()) {
        try {
          const [userData, userPermissions] = await Promise.all([
            authService.getCurrentUser(),
            authService.getUserPermissions().catch(() => null)
          ]);
          setUser(userData);
          if (userPermissions) {
            setPermissions(userPermissions.permissions);
          }
        } catch (error) {
          console.error('Failed to get current user:', error);
          authService.clearTokens();
        }
      }
      setIsLoading(false);
    };

    initAuth();
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    setIsLoading(true);
    try {
      const response = await authService.login(email, password);
      setUser(response.data.user);
      // Load permissions after login
      try {
        const userPermissions = await authService.getUserPermissions();
        setPermissions(userPermissions.permissions);
      } catch (error) {
        console.error('Failed to load permissions:', error);
      }
    } finally {
      setIsLoading(false);
    }
  }, []);

  const register = useCallback(async (userData: RegisterData) => {
    setIsLoading(true);
    try {
      const response = await authService.register(userData);
      setUser(response.data.user);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const logout = useCallback(async () => {
    setIsLoading(true);
    try {
      await authService.logout();
      setUser(null);
      setPermissions([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const refreshUser = useCallback(async () => {
    try {
      const userData = await authService.getCurrentUser();
      setUser(userData);
    } catch (error) {
      console.error('Failed to refresh user:', error);
    }
  }, []);

  const refreshPermissions = useCallback(async () => {
    try {
      const userPermissions = await authService.getUserPermissions();
      setPermissions(userPermissions.permissions);
    } catch (error) {
      console.error('Failed to refresh permissions:', error);
    }
  }, []);

  const forgotPassword = useCallback(async (email: string) => {
    await authService.forgotPassword(email);
  }, []);

  const resetPassword = useCallback(async (token: string, newPassword: string) => {
    await authService.resetPassword(token, newPassword);
  }, []);

  const verifyEmail = useCallback(async (token: string) => {
    await authService.verifyEmail(token);
    // Refresh user data after verification
    await refreshUser();
  }, [refreshUser]);

  const resendVerification = useCallback(async () => {
    await authService.resendVerification();
  }, []);

  const changePassword = useCallback(async (currentPassword: string, newPassword: string) => {
    await authService.changePassword(currentPassword, newPassword);
  }, []);

  const hasPermission = useCallback((permission: string) => {
    return authService.hasPermission(permissions, permission);
  }, [permissions]);

  const hasRole = useCallback((...roles: UserRole[]) => {
    return user ? roles.includes(user.rol) : false;
  }, [user]);

  const value: AuthContextType = {
    user,
    userRole: user?.rol || null,
    permissions,
    isAuthenticated: !!user,
    isLoading,
    login,
    register,
    logout,
    refreshUser,
    refreshPermissions,
    forgotPassword,
    resetPassword,
    verifyEmail,
    resendVerification,
    changePassword,
    hasPermission,
    hasRole,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

export default AuthContext;

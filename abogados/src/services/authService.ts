const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api/v1';

export type UserRole = 'admin' | 'socio' | 'abogado' | 'letrado' | 'secretary' | 'becario' | 'colaborador' | 'contador' | 'recepcionista';

export interface User {
  id: string;
  email: string;
  nombre: string;
  apellido1?: string;
  apellido2?: string;
  rol: UserRole;
  activo: boolean;
  emailVerified: boolean;
  avatarUrl?: string;
  ultimoAcceso?: string;
}

export interface UserPermissions {
  role: UserRole;
  permissions: string[];
  emailVerified: boolean;
}

export interface AuthResponse {
  success: boolean;
  data: {
    user: User;
    accessToken: string;
    refreshToken: string;
  };
}

export interface ApiError {
  success: false;
  error: {
    code?: string;
    message: string;
    details?: any;
  };
}

class AuthService {
  async login(email: string, password: string): Promise<AuthResponse> {
    const response = await fetch(`${API_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });

    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.error?.message || 'Error al iniciar sesión');
    }

    // Store tokens
    this.setTokens(data.data.accessToken, data.data.refreshToken);
    
    return data;
  }

  async register(userData: {
    email: string;
    password: string;
    nombre: string;
    apellido1?: string;
    apellido2?: string;
    rol?: string;
  }): Promise<AuthResponse> {
    const response = await fetch(`${API_URL}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(userData),
    });

    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.error?.message || 'Error al registrar usuario');
    }

    // Store tokens
    this.setTokens(data.data.accessToken, data.data.refreshToken);
    
    return data;
  }

  async logout(): Promise<void> {
    const refreshToken = this.getRefreshToken();
    
    try {
      await fetch(`${API_URL}/auth/logout`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.getAccessToken()}`,
        },
        body: JSON.stringify({ refreshToken }),
      });
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      this.clearTokens();
    }
  }

  async getCurrentUser(): Promise<User> {
    const response = await fetch(`${API_URL}/auth/me`, {
      headers: {
        'Authorization': `Bearer ${this.getAccessToken()}`,
      },
    });

    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.error?.message || 'Error al obtener usuario');
    }

    return data.data.user;
  }

  async getUserPermissions(): Promise<UserPermissions> {
    const response = await fetch(`${API_URL}/auth/permissions`, {
      headers: {
        'Authorization': `Bearer ${this.getAccessToken()}`,
      },
    });

    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.error?.message || 'Error al obtener permisos');
    }

    return data.data;
  }

  hasPermission(permissions: string[], permission: string): boolean {
    if (permissions.includes('*')) return true;
    if (permissions.includes(permission)) return true;
    
    // Check wildcard permissions (e.g., 'expedientes:*' matches 'expedientes:read')
    const [resource, action] = permission.split(':');
    if (permissions.includes(`${resource}:*`)) return true;
    
    return false;
  }

  async refreshToken(): Promise<{ accessToken: string; refreshToken: string }> {
    const refreshToken = this.getRefreshToken();
    
    if (!refreshToken) {
      throw new Error('No refresh token available');
    }

    const response = await fetch(`${API_URL}/auth/refresh`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refreshToken }),
    });

    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.error?.message || 'Error al refrescar token');
    }

    this.setTokens(data.data.accessToken, data.data.refreshToken);
    
    return data.data;
  }

  async forgotPassword(email: string): Promise<void> {
    const response = await fetch(`${API_URL}/auth/password/forgot`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email }),
    });

    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.error?.message || 'Error al solicitar recuperación');
    }
  }

  async resetPassword(token: string, newPassword: string): Promise<void> {
    const response = await fetch(`${API_URL}/auth/password/reset`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token, newPassword }),
    });

    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.error?.message || 'Error al restablecer contraseña');
    }
  }

  async verifyEmail(token: string): Promise<void> {
    const response = await fetch(`${API_URL}/auth/verify-email`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token }),
    });

    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.error?.message || 'Error al verificar email');
    }
  }

  async resendVerification(): Promise<void> {
    const response = await fetch(`${API_URL}/auth/resend-verification`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.getAccessToken()}`,
      },
    });

    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.error?.message || 'Error al reenviar verificación');
    }
  }

  async changePassword(currentPassword: string, newPassword: string): Promise<void> {
    const response = await fetch(`${API_URL}/auth/password/change`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.getAccessToken()}`,
      },
      body: JSON.stringify({ currentPassword, newPassword }),
    });

    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.error?.message || 'Error al cambiar contraseña');
    }
  }

  // Token management
  setTokens(accessToken: string, refreshToken: string): void {
    localStorage.setItem('accessToken', accessToken);
    localStorage.setItem('refreshToken', refreshToken);
  }

  getAccessToken(): string | null {
    return localStorage.getItem('accessToken');
  }

  getRefreshToken(): string | null {
    return localStorage.getItem('refreshToken');
  }

  clearTokens(): void {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
  }

  isAuthenticated(): boolean {
    return !!this.getAccessToken();
  }
}

export const authService = new AuthService();
export default authService;

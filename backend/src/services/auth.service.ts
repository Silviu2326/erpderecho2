import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { prisma } from '../config/database';
import { env } from '../config/env';
import { ServiceException } from './base.types';

export interface RegisterInput {
  email: string;
  password: string;
  nombre: string;
  apellido1: string;
  apellido2?: string;
  rol?: string;
}

export interface LoginInput {
  email: string;
  password: string;
}

export interface TokenPair {
  accessToken: string;
  refreshToken: string;
}

export interface AuthTokens {
  user: any;
  accessToken: string;
  refreshToken: string;
}

class AuthService {
  async register(input: RegisterInput): Promise<AuthTokens> {
    const { email, password, nombre, apellido1, apellido2, rol } = input;

    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      throw new ServiceException('USER_EXISTS', 'El usuario ya existe', 409);
    }

    const passwordHash = await bcrypt.hash(password, 12);

    const user = await prisma.user.create({
      data: {
        email,
        password: passwordHash,
        nombre,
        apellido1,
        apellido2,
        rol: rol as any || 'abogado',
      },
    });

    const tokens = await this.generateTokens(user.id, user.email, user.rol);

    return {
      user: this.sanitizeUser(user),
      accessToken: tokens.accessToken,
      refreshToken: tokens.refreshToken,
    };
  }

  async login(input: LoginInput): Promise<AuthTokens> {
    const { email, password } = input;

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user || !user.activo) {
      throw new ServiceException('INVALID_CREDENTIALS', 'Credenciales inválidas', 401);
    }

    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      throw new ServiceException('INVALID_CREDENTIALS', 'Credenciales inválidas', 401);
    }

    await prisma.user.update({
      where: { id: user.id },
      data: { ultimoAcceso: new Date() },
    });

    const tokens = await this.generateTokens(user.id, user.email, user.rol);

    return {
      user: this.sanitizeUser(user),
      accessToken: tokens.accessToken,
      refreshToken: tokens.refreshToken,
    };
  }

  async refresh(refreshToken: string): Promise<TokenPair> {
    const decoded = jwt.verify(refreshToken, env.JWT_REFRESH_SECRET) as any;

    const storedToken = await prisma.refreshToken.findFirst({
      where: { token: refreshToken, revoked: false },
    });

    if (!storedToken || storedToken.expiresAt < new Date()) {
      throw new ServiceException('INVALID_TOKEN', 'Token inválido o expirado', 401);
    }

    await prisma.refreshToken.update({
      where: { id: storedToken.id },
      data: { revoked: true },
    });

    const user = await prisma.user.findUnique({ where: { id: decoded.userId } });
    if (!user || !user.activo) {
      throw new ServiceException('USER_NOT_FOUND', 'Usuario no encontrado', 401);
    }

    return await this.generateTokens(user.id, user.email, user.rol);
  }

  async logout(refreshToken?: string): Promise<void> {
    if (refreshToken) {
      await prisma.refreshToken.updateMany({
        where: { token: refreshToken },
        data: { revoked: true },
      });
    }
  }

  async getCurrentUser(userId: string): Promise<any> {
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user || !user.activo) {
      throw new ServiceException('USER_NOT_FOUND', 'Usuario no encontrado', 404);
    }
    return this.sanitizeUser(user);
  }

  async changePassword(userId: string, currentPassword: string, newPassword: string): Promise<void> {
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
      throw new ServiceException('USER_NOT_FOUND', 'Usuario no encontrado', 404);
    }

    const isValidPassword = await bcrypt.compare(currentPassword, user.password);
    if (!isValidPassword) {
      throw new ServiceException('INVALID_PASSWORD', 'Contraseña actual incorrecta', 401);
    }

    const newPasswordHash = await bcrypt.hash(newPassword, 12);

    await prisma.user.update({
      where: { id: user.id },
      data: { password: newPasswordHash },
    });

    await prisma.refreshToken.updateMany({
      where: { userId: user.id },
      data: { revoked: true },
    });
  }

  private async generateTokens(userId: string, email: string, rol: string): Promise<TokenPair> {
    const accessToken = jwt.sign(
      { id: userId, userId, email, rol, type: 'access' },
      env.JWT_SECRET,
      { expiresIn: env.JWT_EXPIRES_IN as any }
    );

    const refreshToken = jwt.sign(
      { userId, type: 'refresh' },
      env.JWT_REFRESH_SECRET,
      { expiresIn: env.JWT_REFRESH_EXPIRES_IN as any }
    );

    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7);

    await prisma.refreshToken.create({
      data: {
        token: refreshToken,
        expiresAt,
        userId,
      },
    });

    return { accessToken, refreshToken };
  }

  private sanitizeUser(user: any) {
    const { password, ...rest } = user;
    return rest;
  }
}

export const authService = new AuthService();

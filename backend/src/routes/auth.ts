import { Router, Response } from 'express';
import { validate } from 'class-validator';
import { plainToInstance } from 'class-transformer';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { prisma } from '../config/database';
import { env } from '../config/env';
import { authMiddleware, AuthRequest } from '../middleware/auth';
import {
  CreateUserDto,
  LoginDto,
  RefreshTokenDto,
  ChangePasswordDto,
} from '../dtos/auth.dto';

const router = Router();

function formatResponse<T>(data: T) {
  return { success: true, data };
}

async function generateTokens(userId: string, email: string, rol: string) {
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

function sanitizeUser(user: any) {
  const { password, ...rest } = user;
  return rest;
}

router.post('/register', async (req, res: Response) => {
  try {
    const dto = plainToInstance(CreateUserDto, req.body);
    const errors = await validate(dto);
    if (errors.length > 0) {
      res.status(400).json({ success: false, error: { message: 'Validation failed', details: errors } });
      return;
    }

    const { email, password, nombre, apellido1, apellido2, rol } = dto;

    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      res.status(409).json({ success: false, error: { code: 'USER_EXISTS', message: 'El usuario ya existe' } });
      return;
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

    const tokens = await generateTokens(user.id, user.email, user.rol);

    res.status(201).json(
      formatResponse({
        user: sanitizeUser(user),
        accessToken: tokens.accessToken,
        refreshToken: tokens.refreshToken,
      })
    );
  } catch (error) {
    console.error('Register error:', error);
    res.status(500).json({ success: false, error: { message: 'Internal server error' } });
  }
});

router.post('/login', async (req, res: Response) => {
  try {
    const dto = plainToInstance(LoginDto, req.body);
    const errors = await validate(dto);
    if (errors.length > 0) {
      res.status(400).json({ success: false, error: { message: 'Validation failed', details: errors } });
      return;
    }

    const { email, password } = dto;

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user || !user.activo) {
      res.status(401).json({ success: false, error: { code: 'INVALID_CREDENTIALS', message: 'Credenciales inválidas' } });
      return;
    }

    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      res.status(401).json({ success: false, error: { code: 'INVALID_CREDENTIALS', message: 'Credenciales inválidas' } });
      return;
    }

    await prisma.user.update({
      where: { id: user.id },
      data: { ultimoAcceso: new Date() },
    });

    const tokens = await generateTokens(user.id, user.email, user.rol);

    res.json(
      formatResponse({
        user: sanitizeUser(user),
        accessToken: tokens.accessToken,
        refreshToken: tokens.refreshToken,
      })
    );
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ success: false, error: { message: 'Internal server error' } });
  }
});

router.post('/refresh', async (req, res: Response) => {
  try {
    const dto = plainToInstance(RefreshTokenDto, req.body);
    const errors = await validate(dto);
    if (errors.length > 0) {
      res.status(400).json({ success: false, error: { message: 'Validation failed', details: errors } });
      return;
    }

    const { refreshToken } = dto;

    const decoded = jwt.verify(refreshToken, env.JWT_REFRESH_SECRET) as any;

    const storedToken = await prisma.refreshToken.findFirst({
      where: { token: refreshToken, revoked: false },
    });

    if (!storedToken || storedToken.expiresAt < new Date()) {
      res.status(401).json({ success: false, error: { code: 'INVALID_TOKEN', message: 'Token inválido o expirado' } });
      return;
    }

    await prisma.refreshToken.update({
      where: { id: storedToken.id },
      data: { revoked: true },
    });

    const user = await prisma.user.findUnique({ where: { id: decoded.userId } });
    if (!user || !user.activo) {
      res.status(401).json({ success: false, error: { code: 'USER_NOT_FOUND', message: 'Usuario no encontrado' } });
      return;
    }

    const tokens = await generateTokens(user.id, user.email, user.rol);

    res.json(
      formatResponse({
        accessToken: tokens.accessToken,
        refreshToken: tokens.refreshToken,
      })
    );
  } catch (error) {
    console.error('Refresh error:', error);
    res.status(500).json({ success: false, error: { message: 'Internal server error' } });
  }
});

router.post('/logout', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const { refreshToken } = req.body;

    if (refreshToken) {
      await prisma.refreshToken.updateMany({
        where: { token: refreshToken },
        data: { revoked: true },
      });
    }

    res.json(formatResponse({ message: 'Sesión cerrada correctamente' }));
  } catch (error) {
    console.error('Logout error:', error);
    res.status(500).json({ success: false, error: { message: 'Internal server error' } });
  }
});

router.get('/me', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user?.userId },
    });

    if (!user || !user.activo) {
      res.status(404).json({ success: false, error: { code: 'USER_NOT_FOUND', message: 'Usuario no encontrado' } });
      return;
    }

    res.json(formatResponse({ user: sanitizeUser(user) }));
  } catch (error) {
    console.error('Me error:', error);
    res.status(500).json({ success: false, error: { message: 'Internal server error' } });
  }
});

router.post('/password/change', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const dto = plainToInstance(ChangePasswordDto, req.body);
    const errors = await validate(dto);
    if (errors.length > 0) {
      res.status(400).json({ success: false, error: { message: 'Validation failed', details: errors } });
      return;
    }

    const { currentPassword, newPassword } = dto;

    const user = await prisma.user.findUnique({
      where: { id: req.user?.userId },
    });

    if (!user) {
      res.status(404).json({ success: false, error: { code: 'USER_NOT_FOUND', message: 'Usuario no encontrado' } });
      return;
    }

    const isValidPassword = await bcrypt.compare(currentPassword, user.password);
    if (!isValidPassword) {
      res.status(401).json({ success: false, error: { code: 'INVALID_PASSWORD', message: 'Contraseña actual incorrecta' } });
      return;
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

    res.json(formatResponse({ message: 'Contraseña actualizada correctamente' }));
  } catch (error) {
    console.error('Change password error:', error);
    res.status(500).json({ success: false, error: { message: 'Internal server error' } });
  }
});

export default router;

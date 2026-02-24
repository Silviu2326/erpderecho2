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
  ForgotPasswordDto,
  ResetPasswordDto,
  VerifyEmailDto,
} from '../dtos/auth.dto';
import { sendPasswordResetEmail, sendVerificationEmail, sendWelcomeEmail } from '../config/email';
import crypto from 'crypto';

const router = Router();

function formatResponse<T>(data: T) {
  return { success: true, data };
}

/**
 * @swagger
 * /auth/register:
 *   post:
 *     summary: Registrar un nuevo usuario
 *     tags: [Autenticación]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *               - nombre
 *               - apellido1
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 example: abogado@bufete.com
 *               password:
 *                 type: string
 *                 minLength: 6
 *                 example: password123
 *               nombre:
 *                 type: string
 *                 example: Juan
 *               apellido1:
 *                 type: string
 *                 example: García
 *               apellido2:
 *                 type: string
 *                 example: López
 *               rol:
 *                 type: string
 *                 enum: [admin, abogado, letrado, secretary, becario, colaborador]
 *                 example: abogado
 *     responses:
 *       201:
 *         description: Usuario registrado exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: object
 *                   properties:
 *                     user:
 *                       $ref: '#/components/schemas/User'
 *                     accessToken:
 *                       type: string
 *                     refreshToken:
 *                       type: string
 *       400:
 *         description: Datos inválidos
 *       409:
 *         description: El usuario ya existe
 */

async function generateTokens(userId: string, email: string, role: string) {
  const accessToken = jwt.sign(
    { id: userId, userId, email, role, type: 'access' },
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

    const tokens = await generateTokens(user.id, user.email, user.rol as string);

    // Send verification email
    const verificationToken = crypto.randomBytes(32).toString('hex');
    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + 24);

    await prisma.emailVerificationToken.create({
      data: {
        token: verificationToken,
        expiresAt,
        userId: user.id,
      },
    });

    // Send emails asynchronously (don't wait)
    const verifyUrl = `${env.FRONTEND_URL}/verify-email?token=${verificationToken}`;
    sendVerificationEmail(user.email, verifyUrl).catch(console.error);
    sendWelcomeEmail(user.email, user.nombre).catch(console.error);

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

/**
 * @swagger
 * /auth/login:
 *   post:
 *     summary: Iniciar sesión
 *     tags: [Autenticación]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 example: abogado@bufete.com
 *               password:
 *                 type: string
 *                 example: password123
 *     responses:
 *       200:
 *         description: Login exitoso
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: object
 *                   properties:
 *                     user:
 *                       $ref: '#/components/schemas/User'
 *                     accessToken:
 *                       type: string
 *                     refreshToken:
 *                       type: string
 *       401:
 *         description: Credenciales inválidas
 */
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

    const tokens = await generateTokens(user.id, user.email, user.rol as string);

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

    const tokens = await generateTokens(user.id, user.email, user.rol as string);

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

/**
 * @swagger
 * /auth/me:
 *   get:
 *     summary: Obtener información del usuario autenticado
 *     tags: [Autenticación]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Información del usuario
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: object
 *                   properties:
 *                     user:
 *                       $ref: '#/components/schemas/User'
 *       401:
 *         description: No autorizado
 *       404:
 *         description: Usuario no encontrado
 */
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

/**
 * @swagger
 * /auth/permissions:
 *   get:
 *     summary: Obtener permisos del usuario autenticado
 *     tags: [Autenticación]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Permisos del usuario
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: object
 *                   properties:
 *                     role:
 *                       type: string
 *                       enum: [admin, socio, abogado, letrado, secretary, becario, colaborador, contador, recepcionista]
 *                     permissions:
 *                       type: array
 *                       items:
 *                         type: string
 *       401:
 *         description: No autorizado
 */
router.get('/permissions', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user?.userId },
      select: { rol: true, activo: true, emailVerified: true }
    });

    if (!user || !user.activo) {
      res.status(404).json({ success: false, error: { code: 'USER_NOT_FOUND', message: 'Usuario no encontrado' } });
      return;
    }

    // Definir permisos basados en el rol
    const rolePermissions: Record<string, string[]> = {
      admin: ['*'], // Acceso total
      socio: [
        'expedientes:read', 'expedientes:write', 'expedientes:delete',
        'clientes:read', 'clientes:write', 'clientes:delete',
        'facturas:read', 'facturas:write', 'facturas:delete',
        'usuarios:read', 'usuarios:write',
        'reportes:read', 'reportes:write',
        'calendario:read', 'calendario:write',
        'documentos:read', 'documentos:write', 'documentos:delete',
        'crm:read', 'crm:write', 'crm:delete',
        'config:read', 'config:write'
      ],
      abogado: [
        'expedientes:read', 'expedientes:write',
        'clientes:read', 'clientes:write',
        'facturas:read',
        'calendario:read', 'calendario:write',
        'documentos:read', 'documentos:write',
        'crm:read', 'crm:write'
      ],
      letrado: [
        'expedientes:read', 'expedientes:write',
        'clientes:read', 'clientes:write',
        'calendario:read', 'calendario:write',
        'documentos:read', 'documentos:write'
      ],
      secretary: [
        'expedientes:read',
        'clientes:read', 'clientes:write',
        'calendario:read', 'calendario:write',
        'documentos:read', 'documentos:write'
      ],
      becario: [
        'expedientes:read',
        'documentos:read'
      ],
      colaborador: [
        'expedientes:read',
        'documentos:read'
      ],
      contador: [
        'facturas:read', 'facturas:write',
        'reportes:read',
        'clientes:read'
      ],
      recepcionista: [
        'clientes:read', 'clientes:write',
        'calendario:read', 'calendario:write'
      ]
    };

    const permissions = rolePermissions[user.rol] || [];

    res.json(formatResponse({
      role: user.rol,
      permissions,
      emailVerified: user.emailVerified
    }));
  } catch (error) {
    console.error('Permissions error:', error);
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

/**
 * @swagger
 * /auth/password/forgot:
 *   post:
 *     summary: Solicitar recuperación de contraseña
 *     tags: [Autenticación]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 example: usuario@despacho.com
 *     responses:
 *       200:
 *         description: Email de recuperación enviado
 *       404:
 *         description: Usuario no encontrado
 */
router.post('/password/forgot', async (req, res: Response) => {
  try {
    const dto = plainToInstance(ForgotPasswordDto, req.body);
    const errors = await validate(dto);
    if (errors.length > 0) {
      res.status(400).json({ success: false, error: { message: 'Validation failed', details: errors } });
      return;
    }

    const { email } = dto;

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      // Return success even if user not found (security best practice)
      res.json(formatResponse({ message: 'Si el email existe, recibirás instrucciones para recuperar tu contraseña' }));
      return;
    }

    // Generate reset token
    const token = crypto.randomBytes(32).toString('hex');
    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + 1); // 1 hour expiration

    await prisma.passwordResetToken.create({
      data: {
        token,
        expiresAt,
        userId: user.id,
      },
    });

    // Send email
    const resetUrl = `${env.FRONTEND_URL}/reset-password?token=${token}`;
    await sendPasswordResetEmail(email, resetUrl);

    res.json(formatResponse({ message: 'Si el email existe, recibirás instrucciones para recuperar tu contraseña' }));
  } catch (error) {
    console.error('Forgot password error:', error);
    res.status(500).json({ success: false, error: { message: 'Internal server error' } });
  }
});

/**
 * @swagger
 * /auth/password/reset:
 *   post:
 *     summary: Restablecer contraseña con token
 *     tags: [Autenticación]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - token
 *               - newPassword
 *             properties:
 *               token:
 *                 type: string
 *                 example: abc123...
 *               newPassword:
 *                 type: string
 *                 minLength: 8
 *                 example: newpassword123
 *     responses:
 *       200:
 *         description: Contraseña restablecida exitosamente
 *       400:
 *         description: Token inválido o expirado
 */
router.post('/password/reset', async (req, res: Response) => {
  try {
    const dto = plainToInstance(ResetPasswordDto, req.body);
    const errors = await validate(dto);
    if (errors.length > 0) {
      res.status(400).json({ success: false, error: { message: 'Validation failed', details: errors } });
      return;
    }

    const { token, newPassword } = dto;

    const resetToken = await prisma.passwordResetToken.findFirst({
      where: {
        token,
        used: false,
        expiresAt: { gt: new Date() },
      },
    });

    if (!resetToken) {
      res.status(400).json({ success: false, error: { code: 'INVALID_TOKEN', message: 'Token inválido o expirado' } });
      return;
    }

    // Hash new password
    const passwordHash = await bcrypt.hash(newPassword, 12);

    // Update user password
    await prisma.user.update({
      where: { id: resetToken.userId },
      data: { password: passwordHash },
    });

    // Mark token as used
    await prisma.passwordResetToken.update({
      where: { id: resetToken.id },
      data: { used: true },
    });

    // Revoke all refresh tokens for this user
    await prisma.refreshToken.updateMany({
      where: { userId: resetToken.userId },
      data: { revoked: true },
    });

    res.json(formatResponse({ message: 'Contraseña restablecida exitosamente' }));
  } catch (error) {
    console.error('Reset password error:', error);
    res.status(500).json({ success: false, error: { message: 'Internal server error' } });
  }
});

/**
 * @swagger
 * /auth/verify-email:
 *   post:
 *     summary: Verificar correo electrónico
 *     tags: [Autenticación]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - token
 *             properties:
 *               token:
 *                 type: string
 *                 example: abc123...
 *     responses:
 *       200:
 *         description: Email verificado exitosamente
 *       400:
 *         description: Token inválido o expirado
 */
router.post('/verify-email', async (req, res: Response) => {
  try {
    const dto = plainToInstance(VerifyEmailDto, req.body);
    const errors = await validate(dto);
    if (errors.length > 0) {
      res.status(400).json({ success: false, error: { message: 'Validation failed', details: errors } });
      return;
    }

    const { token } = dto;

    const verificationToken = await prisma.emailVerificationToken.findFirst({
      where: {
        token,
        used: false,
        expiresAt: { gt: new Date() },
      },
    });

    if (!verificationToken) {
      res.status(400).json({ success: false, error: { code: 'INVALID_TOKEN', message: 'Token inválido o expirado' } });
      return;
    }

    // Mark email as verified
    await prisma.user.update({
      where: { id: verificationToken.userId },
      data: { emailVerified: true },
    });

    // Mark token as used
    await prisma.emailVerificationToken.update({
      where: { id: verificationToken.id },
      data: { used: true },
    });

    res.json(formatResponse({ message: 'Email verificado exitosamente' }));
  } catch (error) {
    console.error('Verify email error:', error);
    res.status(500).json({ success: false, error: { message: 'Internal server error' } });
  }
});

/**
 * @swagger
 * /auth/resend-verification:
 *   post:
 *     summary: Reenviar email de verificación
 *     tags: [Autenticación]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Email de verificación reenviado
 *       401:
 *         description: No autorizado
 *       400:
 *         description: Email ya verificado
 */
router.post('/resend-verification', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user?.userId },
    });

    if (!user) {
      res.status(404).json({ success: false, error: { code: 'USER_NOT_FOUND', message: 'Usuario no encontrado' } });
      return;
    }

    if (user.emailVerified) {
      res.status(400).json({ success: false, error: { code: 'ALREADY_VERIFIED', message: 'El email ya está verificado' } });
      return;
    }

    // Invalidate old tokens
    await prisma.emailVerificationToken.updateMany({
      where: { userId: user.id, used: false },
      data: { used: true },
    });

    // Generate new token
    const token = crypto.randomBytes(32).toString('hex');
    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + 24); // 24 hour expiration

    await prisma.emailVerificationToken.create({
      data: {
        token,
        expiresAt,
        userId: user.id,
      },
    });

    // Send email
    const verifyUrl = `${env.FRONTEND_URL}/verify-email?token=${token}`;
    await sendVerificationEmail(user.email, verifyUrl);

    res.json(formatResponse({ message: 'Email de verificación reenviado' }));
  } catch (error) {
    console.error('Resend verification error:', error);
    res.status(500).json({ success: false, error: { message: 'Internal server error' } });
  }
});

export default router;

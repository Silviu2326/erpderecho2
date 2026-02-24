import nodemailer from 'nodemailer';
import { env } from './env';

const transporter = nodemailer.createTransport({
  host: env.SMTP_HOST,
  port: env.SMTP_PORT || 587,
  secure: false,
  auth: {
    user: env.SMTP_USER,
    pass: env.SMTP_PASS,
  },
});

export async function sendPasswordResetEmail(email: string, resetUrl: string): Promise<void> {
  const mailOptions = {
    from: env.SMTP_FROM,
    to: email,
    subject: 'Recuperación de contraseña - Derecho ERP',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #d97706;">Recuperación de contraseña</h2>
        <p>Has solicitado restablecer tu contraseña. Haz clic en el siguiente enlace para continuar:</p>
        <a href="${resetUrl}" style="display: inline-block; background: #d97706; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin: 20px 0;">
          Restablecer contraseña
        </a>
        <p style="color: #666; font-size: 14px;">Este enlace expirará en 1 hora.</p>
        <p style="color: #666; font-size: 14px;">Si no solicitaste este cambio, puedes ignorar este correo.</p>
      </div>
    `,
  };

  await transporter.sendMail(mailOptions);
}

export async function sendVerificationEmail(email: string, verifyUrl: string): Promise<void> {
  const mailOptions = {
    from: env.SMTP_FROM,
    to: email,
    subject: 'Verifica tu correo electrónico - Derecho ERP',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #d97706;">Verifica tu correo electrónico</h2>
        <p>Gracias por registrarte en Derecho ERP. Haz clic en el siguiente enlace para verificar tu correo:</p>
        <a href="${verifyUrl}" style="display: inline-block; background: #d97706; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin: 20px 0;">
          Verificar correo
        </a>
        <p style="color: #666; font-size: 14px;">Este enlace expirará en 24 horas.</p>
        <p style="color: #666; font-size: 14px;">Si no creaste esta cuenta, puedes ignorar este correo.</p>
      </div>
    `,
  };

  await transporter.sendMail(mailOptions);
}

export async function sendWelcomeEmail(email: string, nombre: string): Promise<void> {
  const mailOptions = {
    from: env.SMTP_FROM,
    to: email,
    subject: 'Bienvenido a Derecho ERP',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #d97706;">¡Bienvenido a Derecho ERP!</h2>
        <p>Hola ${nombre},</p>
        <p>Tu cuenta ha sido creada exitosamente. Ya puedes acceder a todas las funcionalidades del sistema.</p>
        <p>Si tienes alguna pregunta, no dudes en contactarnos.</p>
        <p style="margin-top: 30px;">Saludos,<br>El equipo de Derecho ERP</p>
      </div>
    `,
  };

  await transporter.sendMail(mailOptions);
}

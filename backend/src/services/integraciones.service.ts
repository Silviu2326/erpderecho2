import { prisma } from '../config/database';
import { ServiceException } from './base.types';

export interface ConnectIntegracionInput {
  tipo: string;
  accessToken?: string;
  refreshToken?: string;
  expiresAt?: string;
}

export interface SendEmailInput {
  to: string;
  subject: string;
  body: string;
  from?: string;
  cc?: string[];
  bcc?: string[];
  expedienteId?: string;
}

export interface CalendarEventInput {
  title: string;
  description?: string;
  startTime: string;
  endTime?: string;
  location?: string;
  attendees?: string[];
  allDay?: boolean;
  expedienteId?: string;
}

export interface SyncCalendarInput {
  startDate?: string;
  endDate?: string;
  syncEvents?: boolean;
}

class IntegracionesService {
  async getStatus(usuarioId: string): Promise<any[]> {
    const integraciones = await prisma.integracion.findMany({
      where: { usuarioId, deletedAt: null },
      select: {
        id: true,
        tipo: true,
        accessToken: true,
        refreshToken: true,
        expiresAt: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    return integraciones.map((int) => ({
      id: int.id,
      tipo: int.tipo,
      expiresAt: int.expiresAt,
      daysUntilExpiry: int.expiresAt
        ? Math.ceil((new Date(int.expiresAt).getTime() - Date.now()) / (1000 * 60 * 60 * 24))
        : null,
    }));
  }

  async connect(usuarioId: string, input: ConnectIntegracionInput): Promise<any> {
    const existingIntegracion = await prisma.integracion.findFirst({
      where: { usuarioId, tipo: input.tipo as any, deletedAt: null },
    });

    if (existingIntegracion) {
      const integracion = await prisma.integracion.update({
        where: { id: existingIntegracion.id },
      data: {
        accessToken: input.accessToken,
        refreshToken: input.refreshToken,
        expiresAt: input.expiresAt ? new Date(input.expiresAt) : null,
        connected: true,
        updatedAt: new Date(),
      } as any,
      });
      return integracion;
    }

    const integracion = await prisma.integracion.create({
      data: {
        usuarioId,
        tipo: input.tipo,
        accessToken: input.accessToken,
        refreshToken: input.refreshToken,
        expiresAt: input.expiresAt ? new Date(input.expiresAt) : null,
        connected: true,
      } as any,
    });

    return integracion;
  }

  async disconnect(usuarioId: string, tipo: string): Promise<void> {
    const existingIntegracion = await prisma.integracion.findFirst({
      where: { usuarioId, tipo: tipo as any, deletedAt: null },
    });

    if (!existingIntegracion) {
      throw new ServiceException('INTEGRACION_NOT_FOUND', 'Integración no encontrada', 404);
    }

    await prisma.integracion.update({
      where: { id: existingIntegracion.id },
      data: {
        accessToken: null,
        refreshToken: null,
        expiresAt: null,
        connected: false,
        updatedAt: new Date(),
      } as any,
    });
  }

  async sendEmail(usuarioId: string, input: SendEmailInput): Promise<any> {
    const integracion = await prisma.integracion.findFirst({
      where: { usuarioId, tipo: 'MICROSOFT', deletedAt: null },
    });

    if (!integracion) {
      throw new ServiceException('INTEGRACION_NOT_CONNECTED', 'Microsoft no está conectado', 400);
    }

    if (integracion.expiresAt && new Date(integracion.expiresAt) < new Date()) {
      throw new ServiceException('INTEGRACION_EXPIRED', 'La conexión con Microsoft ha expirado', 401);
    }

    return {
      id: 'mock-email-id',
      status: 'sent',
      message: 'Email enviado correctamente',
    };
  }

  async getEmails(usuarioId: string, params: any): Promise<any> {
    const { page = 1, limit = 20 } = params;
    const skip = (page - 1) * limit;

    return {
      data: [],
      meta: {
        page,
        limit,
        total: 0,
        totalPages: 0,
      },
    };
  }

  async createCalendarEvent(usuarioId: string, input: CalendarEventInput): Promise<any> {
    const integracion = await prisma.integracion.findFirst({
      where: { usuarioId, tipo: 'MICROSOFT', deletedAt: null },
    });

    if (!integracion) {
      throw new ServiceException('INTEGRACION_NOT_CONNECTED', 'Microsoft no está conectado', 400);
    }

    const evento = await prisma.evento.create({
      data: {
        usuarioId,
        expedienteId: input.expedienteId,
        titulo: input.title,
        descripcion: input.description,
        fechaInicio: new Date(input.startTime),
        fechaFin: input.endTime ? new Date(input.endTime) : null,
        attendees: input.attendees ? input.attendees.join(',') : null,
        allDay: input.allDay || false,
      } as any,
    });

    return evento;
  }

  async getCalendarEvents(usuarioId: string, startDate?: string, endDate?: string): Promise<any[]> {
    const where: any = { usuarioId, deletedAt: null };

    if (startDate || endDate) {
      where.fechaInicio = {};
      if (startDate) {
        where.fechaInicio.gte = new Date(startDate);
      }
      if (endDate) {
        where.fechaInicio.lte = new Date(endDate);
      }
    }

    return prisma.evento.findMany({
      where,
      orderBy: { fechaInicio: 'asc' },
      select: {
        id: true,
        titulo: true,
        descripcion: true,
        fechaInicio: true,
        fechaFin: true,
        
        expedienteId: true,
      },
    });
  }

  async syncCalendar(usuarioId: string, input: SyncCalendarInput): Promise<any> {
    const integracion = await prisma.integracion.findFirst({
      where: { usuarioId, tipo: 'MICROSOFT', deletedAt: null },
    });

    if (!integracion) {
      throw new ServiceException('INTEGRACION_NOT_CONNECTED', 'Microsoft no está conectado', 400);
    }

    if (integracion.expiresAt && new Date(integracion.expiresAt) < new Date()) {
      throw new ServiceException('INTEGRACION_EXPIRED', 'La conexión con Microsoft ha expirado', 401);
    }

    await prisma.integracion.update({
      where: { id: integracion.id },
      data: { lastSyncAt: new Date() } as any,
    });

    return {
      synced: true,
      message: 'Calendario sincronizado correctamente',
      syncedAt: new Date(),
    };
  }

  async deleteCalendarEvent(usuarioId: string, eventId: string): Promise<void> {
    const existingEvento = await prisma.evento.findFirst({
      where: { id: eventId, usuarioId, deletedAt: null },
    });

    if (!existingEvento) {
      throw new ServiceException('EVENTO_NOT_FOUND', 'Evento no encontrado', 404);
    }

    await prisma.evento.update({
      where: { id: eventId },
      data: { deletedAt: new Date() },
    });
  }

  async refreshToken(usuarioId: string, tipo: string): Promise<any> {
    const integracion = await prisma.integracion.findFirst({
      where: { usuarioId, tipo: tipo as any, deletedAt: null },
    });

    if (!integracion) {
      throw new ServiceException('INTEGRACION_NOT_FOUND', 'Integración no encontrada', 404);
    }

    if (!integracion.refreshToken) {
      throw new ServiceException('REFRESH_TOKEN_MISSING', 'No hay token de refresco disponible', 400);
    }

    return {
      refreshed: true,
      message: 'Token refrescado correctamente',
    };
  }
}

export const integracionesService = new IntegracionesService();

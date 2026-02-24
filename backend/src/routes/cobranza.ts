import { Router, Response } from 'express';
import { prisma } from '../config/database';
import { authMiddleware, AuthRequest } from '../middleware/auth';

const router = Router();

function formatResponse<T>(data: T) {
  return { success: true, data };
}

// ============ CONFIGURACIÓN GENERAL ============

// Obtener configuración de cobranza
router.get('/configuracion', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    let config = await prisma.configuracionCobranza.findFirst();
    
    // Si no existe, crear configuración por defecto
    if (!config) {
      config = await prisma.configuracionCobranza.create({
        data: {
          diasGracia: 3,
          interesMora: 5.0,
          moneda: 'EUR',
          idioma: 'es',
          sepaHabilitado: false,
          notificacionesAuto: true,
        }
      });
    }
    
    res.json(formatResponse(config));
  } catch (error) {
    console.error('Error obteniendo configuración:', error);
    res.status(500).json({ success: false, error: { message: 'Error obteniendo configuración' } });
  }
});

// Actualizar configuración de cobranza
router.put('/configuracion', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const {
      diasGracia,
      interesMora,
      moneda,
      idioma,
      sepaHabilitado,
      notificacionesAuto,
      emailRemitente,
      nombreRemitente,
      sepaCreditorId,
      sepaIban,
      sepaBic,
    } = req.body;
    
    let config = await prisma.configuracionCobranza.findFirst();
    
    if (config) {
      config = await prisma.configuracionCobranza.update({
        where: { id: config.id },
        data: {
          diasGracia: diasGracia !== undefined ? diasGracia : config.diasGracia,
          interesMora: interesMora !== undefined ? interesMora : config.interesMora,
          moneda: moneda || config.moneda,
          idioma: idioma || config.idioma,
          sepaHabilitado: sepaHabilitado !== undefined ? sepaHabilitado : config.sepaHabilitado,
          notificacionesAuto: notificacionesAuto !== undefined ? notificacionesAuto : config.notificacionesAuto,
          emailRemitente: emailRemitente !== undefined ? emailRemitente : config.emailRemitente,
          nombreRemitente: nombreRemitente !== undefined ? nombreRemitente : config.nombreRemitente,
          sepaCreditorId: sepaCreditorId !== undefined ? sepaCreditorId : config.sepaCreditorId,
          sepaIban: sepaIban !== undefined ? sepaIban : config.sepaIban,
          sepaBic: sepaBic !== undefined ? sepaBic : config.sepaBic,
        }
      });
    } else {
      config = await prisma.configuracionCobranza.create({
        data: {
          diasGracia: diasGracia || 3,
          interesMora: interesMora || 5.0,
          moneda: moneda || 'EUR',
          idioma: idioma || 'es',
          sepaHabilitado: sepaHabilitado || false,
          notificacionesAuto: notificacionesAuto !== undefined ? notificacionesAuto : true,
          emailRemitente,
          nombreRemitente,
          sepaCreditorId,
          sepaIban,
          sepaBic,
        }
      });
    }
    
    res.json(formatResponse(config));
  } catch (error) {
    console.error('Error actualizando configuración:', error);
    res.status(500).json({ success: false, error: { message: 'Error actualizando configuración' } });
  }
});

// ============ RECORDATORIOS ============

// Obtener todos los recordatorios
router.get('/recordatorios', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const recordatorios = await prisma.recordatorioCobranza.findMany({
      orderBy: { orden: 'asc' }
    });
    
    res.json(formatResponse(recordatorios));
  } catch (error) {
    console.error('Error obteniendo recordatorios:', error);
    res.status(500).json({ success: false, error: { message: 'Error obteniendo recordatorios' } });
  }
});

// Crear recordatorio
router.post('/recordatorios', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const { dias, tipo, plantilla, asunto, contenido, orden } = req.body;
    
    const recordatorio = await prisma.recordatorioCobranza.create({
      data: {
        dias,
        tipo,
        plantilla,
        asunto,
        contenido,
        orden: orden || 0,
        activo: true,
      }
    });
    
    res.status(201).json(formatResponse(recordatorio));
  } catch (error) {
    console.error('Error creando recordatorio:', error);
    res.status(500).json({ success: false, error: { message: 'Error creando recordatorio' } });
  }
});

// Actualizar recordatorio
router.put('/recordatorios/:id', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { dias, tipo, plantilla, asunto, contenido, activo, orden } = req.body;
    
    const recordatorio = await prisma.recordatorioCobranza.update({
      where: { id },
      data: {
        dias: dias !== undefined ? dias : undefined,
        tipo: tipo || undefined,
        plantilla: plantilla || undefined,
        asunto: asunto !== undefined ? asunto : undefined,
        contenido: contenido !== undefined ? contenido : undefined,
        activo: activo !== undefined ? activo : undefined,
        orden: orden !== undefined ? orden : undefined,
      }
    });
    
    res.json(formatResponse(recordatorio));
  } catch (error) {
    console.error('Error actualizando recordatorio:', error);
    res.status(500).json({ success: false, error: { message: 'Error actualizando recordatorio' } });
  }
});

// Eliminar recordatorio
router.delete('/recordatorios/:id', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    
    await prisma.recordatorioCobranza.delete({
      where: { id }
    });
    
    res.json(formatResponse({ message: 'Recordatorio eliminado' }));
  } catch (error) {
    console.error('Error eliminando recordatorio:', error);
    res.status(500).json({ success: false, error: { message: 'Error eliminando recordatorio' } });
  }
});

// ============ ALERTAS ============

// Obtener todas las alertas
router.get('/alertas', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const alertas = await prisma.alertaCobranza.findMany({
      orderBy: { createdAt: 'asc' }
    });
    
    res.json(formatResponse(alertas));
  } catch (error) {
    console.error('Error obteniendo alertas:', error);
    res.status(500).json({ success: false, error: { message: 'Error obteniendo alertas' } });
  }
});

// Crear alerta
router.post('/alertas', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const { nombre, descripcion, condicion, tipo, emailDestinatarios } = req.body;
    
    const alerta = await prisma.alertaCobranza.create({
      data: {
        nombre,
        descripcion,
        condicion,
        tipo,
        emailDestinatarios,
        activa: true,
      }
    });
    
    res.status(201).json(formatResponse(alerta));
  } catch (error) {
    console.error('Error creando alerta:', error);
    res.status(500).json({ success: false, error: { message: 'Error creando alerta' } });
  }
});

// Actualizar alerta
router.put('/alertas/:id', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { nombre, descripcion, condicion, tipo, activa, emailDestinatarios } = req.body;
    
    const alerta = await prisma.alertaCobranza.update({
      where: { id },
      data: {
        nombre: nombre || undefined,
        descripcion: descripcion !== undefined ? descripcion : undefined,
        condicion: condicion || undefined,
        tipo: tipo || undefined,
        activa: activa !== undefined ? activa : undefined,
        emailDestinatarios: emailDestinatarios !== undefined ? emailDestinatarios : undefined,
      }
    });
    
    res.json(formatResponse(alerta));
  } catch (error) {
    console.error('Error actualizando alerta:', error);
    res.status(500).json({ success: false, error: { message: 'Error actualizando alerta' } });
  }
});

// Eliminar alerta
router.delete('/alertas/:id', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    
    await prisma.alertaCobranza.delete({
      where: { id }
    });
    
    res.json(formatResponse({ message: 'Alerta eliminada' }));
  } catch (error) {
    console.error('Error eliminando alerta:', error);
    res.status(500).json({ success: false, error: { message: 'Error eliminando alerta' } });
  }
});

export default router;

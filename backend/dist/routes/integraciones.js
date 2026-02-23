"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const class_validator_1 = require("class-validator");
const class_transformer_1 = require("class-transformer");
const database_1 = require("../config/database");
const auth_1 = require("../middleware/auth");
const integraciones_dto_1 = require("../dtos/integraciones.dto");
const router = (0, express_1.Router)();
function formatResponse(data) {
    return { success: true, data };
}
function formatError(code, message) {
    return { success: false, error: { code, message } };
}
async function getIntegracion(userId, tipo) {
    return database_1.prisma.integracion.findFirst({
        where: {
            usuarioId: userId,
            tipo,
            deletedAt: null,
        },
    });
}
async function isTokenExpired(integracion) {
    if (!integracion.expiresAt)
        return false;
    return new Date(integracion.expiresAt) <= new Date();
}
async function refreshTokenIfNeeded(integracion, tipo) {
    if (await isTokenExpired(integracion)) {
        if (tipo === 'MICROSOFT') {
            const newTokens = await refreshMicrosoftToken(integracion.refreshToken);
            if (newTokens) {
                const expiresAt = new Date();
                expiresAt.setSeconds(expiresAt.getSeconds() + newTokens.expires_in);
                return database_1.prisma.integracion.update({
                    where: { id: integracion.id },
                    data: {
                        accessToken: newTokens.access_token,
                        refreshToken: newTokens.refresh_token || integracion.refreshToken,
                        expiresAt,
                    },
                });
            }
        }
        else {
            const newTokens = await refreshGoogleToken(integracion.refreshToken);
            if (newTokens) {
                const expiresAt = new Date();
                expiresAt.setSeconds(expiresAt.getSeconds() + newTokens.expires_in);
                return database_1.prisma.integracion.update({
                    where: { id: integracion.id },
                    data: {
                        accessToken: newTokens.access_token,
                        refreshToken: newTokens.refresh_token || integracion.refreshToken,
                        expiresAt,
                    },
                });
            }
        }
    }
    return integracion;
}
async function refreshMicrosoftToken(refreshToken) {
    try {
        const response = await fetch('https://login.microsoftonline.com/common/oauth2/v2.0/token', {
            method: 'POST',
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
            body: new URLSearchParams({
                client_id: process.env.MICROSOFT_CLIENT_ID || '',
                client_secret: process.env.MICROSOFT_CLIENT_SECRET || '',
                refresh_token: refreshToken,
                grant_type: 'refresh_token',
            }),
        });
        return response.ok ? await response.json() : null;
    }
    catch {
        return null;
    }
}
async function refreshGoogleToken(refreshToken) {
    try {
        const response = await fetch('https://oauth2.googleapis.com/token', {
            method: 'POST',
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
            body: new URLSearchParams({
                client_id: process.env.GOOGLE_CLIENT_ID || '',
                client_secret: process.env.GOOGLE_CLIENT_SECRET || '',
                refresh_token: refreshToken,
                grant_type: 'refresh_token',
            }),
        });
        return response.ok ? await response.json() : null;
    }
    catch {
        return null;
    }
}
router.get('/microsoft/status', auth_1.authMiddleware, async (req, res) => {
    try {
        const integracion = await getIntegracion(req.user.userId, 'MICROSOFT');
        if (!integracion) {
            res.json(formatResponse({ connected: false, tipo: 'MICROSOFT' }));
            return;
        }
        const isExpired = await isTokenExpired(integracion);
        const daysUntilExpiry = integracion.expiresAt
            ? Math.ceil((new Date(integracion.expiresAt).getTime() - Date.now()) / (1000 * 60 * 60 * 24))
            : null;
        res.json(formatResponse({
            connected: true,
            tipo: 'MICROSOFT',
            expiresAt: integracion.expiresAt,
            isExpired,
            daysUntilExpiry,
        }));
    }
    catch (error) {
        console.error('Microsoft status error:', error);
        res.status(500).json(formatError('INTERNAL_ERROR', 'Error al obtener estado de integración'));
    }
});
router.post('/microsoft/connect', auth_1.authMiddleware, async (req, res) => {
    try {
        const dto = (0, class_transformer_1.plainToInstance)(integraciones_dto_1.ConnectIntegracionDto, req.body);
        const errors = await (0, class_validator_1.validate)(dto);
        if (errors.length > 0) {
            res.status(400).json({ success: false, error: { message: 'Validation failed', details: errors } });
            return;
        }
        const { accessToken, refreshToken, expiresAt } = dto;
        if (!accessToken || !refreshToken) {
            res.status(400).json(formatError('INVALID_TOKENS', 'Se requieren accessToken y refreshToken'));
            return;
        }
        const existing = await getIntegracion(req.user.userId, 'MICROSOFT');
        const integracion = existing
            ? await database_1.prisma.integracion.update({
                where: { id: existing.id },
                data: {
                    accessToken,
                    refreshToken,
                    expiresAt: expiresAt ? new Date(expiresAt) : new Date(Date.now() + 3600 * 1000),
                },
            })
            : await database_1.prisma.integracion.create({
                data: {
                    tipo: 'MICROSOFT',
                    accessToken,
                    refreshToken,
                    expiresAt: expiresAt ? new Date(expiresAt) : new Date(Date.now() + 3600 * 1000),
                    usuarioId: req.user.userId,
                },
            });
        res.json(formatResponse({
            connected: true,
            tipo: 'MICROSOFT',
            expiresAt: integracion.expiresAt,
        }));
    }
    catch (error) {
        console.error('Microsoft connect error:', error);
        res.status(500).json(formatError('INTERNAL_ERROR', 'Error al conectar con Microsoft'));
    }
});
router.post('/microsoft/disconnect', auth_1.authMiddleware, async (req, res) => {
    try {
        const integracion = await getIntegracion(req.user.userId, 'MICROSOFT');
        if (!integracion) {
            res.status(404).json(formatError('NOT_FOUND', 'No hay integración con Microsoft'));
            return;
        }
        await database_1.prisma.integracion.update({
            where: { id: integracion.id },
            data: { deletedAt: new Date() },
        });
        res.json(formatResponse({ connected: false, tipo: 'MICROSOFT' }));
    }
    catch (error) {
        console.error('Microsoft disconnect error:', error);
        res.status(500).json(formatError('INTERNAL_ERROR', 'Error al desconectar de Microsoft'));
    }
});
router.get('/microsoft/calendar', auth_1.authMiddleware, async (req, res) => {
    try {
        const integracion = await getIntegracion(req.user.userId, 'MICROSOFT');
        if (!integracion) {
            res.status(401).json(formatError('NOT_CONNECTED', 'No conectado con Microsoft'));
            return;
        }
        const validIntegracion = await refreshTokenIfNeeded(integracion, 'MICROSOFT');
        if (!validIntegracion?.accessToken) {
            res.status(401).json(formatError('TOKEN_EXPIRED', 'Token expirado, por favor reconecte'));
            return;
        }
        const startDate = req.query.startDate || new Date().toISOString();
        const endDate = req.query.endDate || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString();
        const response = await fetch(`https://graph.microsoft.com/v1.0/me/calendarView?startDateTime=${startDate}&endDateTime=${endDate}&$select=id,subject,body,start,end,location,attendees`, {
            headers: {
                Authorization: `Bearer ${validIntegracion.accessToken}`,
            },
        });
        if (!response.ok) {
            const error = await response.text();
            console.error('Microsoft calendar error:', error);
            res.status(400).json(formatError('API_ERROR', 'Error al obtener calendario de Microsoft'));
            return;
        }
        const data = await response.json();
        res.json(formatResponse({ events: data.value || [] }));
    }
    catch (error) {
        console.error('Microsoft calendar error:', error);
        res.status(500).json(formatError('INTERNAL_ERROR', 'Error al obtener calendario'));
    }
});
router.post('/microsoft/calendar/sync', auth_1.authMiddleware, async (req, res) => {
    try {
        const dto = (0, class_transformer_1.plainToInstance)(integraciones_dto_1.SyncCalendarDto, req.body);
        const errors = await (0, class_validator_1.validate)(dto);
        if (errors.length > 0) {
            res.status(400).json({ success: false, error: { message: 'Validation failed', details: errors } });
            return;
        }
        const integracion = await getIntegracion(req.user.userId, 'MICROSOFT');
        if (!integracion) {
            res.status(401).json(formatError('NOT_CONNECTED', 'No conectado con Microsoft'));
            return;
        }
        const validIntegracion = await refreshTokenIfNeeded(integracion, 'MICROSOFT');
        if (!validIntegracion?.accessToken) {
            res.status(401).json(formatError('TOKEN_EXPIRED', 'Token expirado'));
            return;
        }
        const startDate = dto.startDate || new Date().toISOString();
        const endDate = dto.endDate || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString();
        const response = await fetch(`https://graph.microsoft.com/v1.0/me/calendarView?startDateTime=${startDate}&endDateTime=${endDate}&$select=id,subject,body,start,end,location,attendees`, {
            headers: {
                Authorization: `Bearer ${validIntegracion.accessToken}`,
            },
        });
        if (!response.ok) {
            res.status(400).json(formatError('API_ERROR', 'Error al sincronizar calendario'));
            return;
        }
        const data = await response.json();
        const events = data.value || [];
        let syncedCount = 0;
        for (const event of events) {
            const existing = await database_1.prisma.evento.findFirst({
                where: {
                    titulo: event.subject,
                    fechaInicio: new Date(event.start.dateTime),
                    usuarioId: req.user.userId,
                },
            });
            if (!existing) {
                await database_1.prisma.evento.create({
                    data: {
                        titulo: event.subject,
                        descripcion: event.body?.content || '',
                        fechaInicio: new Date(event.start.dateTime),
                        fechaFin: event.end?.dateTime ? new Date(event.end.dateTime) : null,
                        location: event.location?.displayName || '',
                        usuarioId: req.user.userId,
                    },
                });
                syncedCount++;
            }
        }
        res.json(formatResponse({
            message: `Sincronizados ${syncedCount} eventos`,
            syncedCount,
            totalEvents: events.length,
        }));
    }
    catch (error) {
        console.error('Microsoft calendar sync error:', error);
        res.status(500).json(formatError('INTERNAL_ERROR', 'Error al sincronizar calendario'));
    }
});
router.post('/microsoft/email/send', auth_1.authMiddleware, async (req, res) => {
    try {
        const dto = (0, class_transformer_1.plainToInstance)(integraciones_dto_1.SendEmailDto, req.body);
        const errors = await (0, class_validator_1.validate)(dto);
        if (errors.length > 0) {
            res.status(400).json({ success: false, error: { message: 'Validation failed', details: errors } });
            return;
        }
        const integracion = await getIntegracion(req.user.userId, 'MICROSOFT');
        if (!integracion) {
            res.status(401).json(formatError('NOT_CONNECTED', 'No conectado con Microsoft'));
            return;
        }
        const validIntegracion = await refreshTokenIfNeeded(integracion, 'MICROSOFT');
        if (!validIntegracion?.accessToken) {
            res.status(401).json(formatError('TOKEN_EXPIRED', 'Token expirado'));
            return;
        }
        const emailPayload = {
            message: {
                subject: dto.subject,
                body: {
                    contentType: 'HTML',
                    content: dto.body,
                },
                toRecipients: [{ emailAddress: { address: dto.to } }],
                ...(dto.cc && { ccRecipients: dto.cc.map(c => ({ emailAddress: { address: c } })) }),
            },
        };
        const response = await fetch('https://graph.microsoft.com/v1.0/me/sendMail', {
            method: 'POST',
            headers: {
                Authorization: `Bearer ${validIntegracion.accessToken}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(emailPayload),
        });
        if (!response.ok) {
            const error = await response.text();
            console.error('Microsoft email error:', error);
            res.status(400).json(formatError('API_ERROR', 'Error al enviar email'));
            return;
        }
        res.json(formatResponse({ message: 'Email enviado correctamente' }));
    }
    catch (error) {
        console.error('Microsoft email send error:', error);
        res.status(500).json(formatError('INTERNAL_ERROR', 'Error al enviar email'));
    }
});
router.get('/microsoft/onedrive', auth_1.authMiddleware, async (req, res) => {
    try {
        const integracion = await getIntegracion(req.user.userId, 'MICROSOFT');
        if (!integracion) {
            res.status(401).json(formatError('NOT_CONNECTED', 'No conectado con Microsoft'));
            return;
        }
        const validIntegracion = await refreshTokenIfNeeded(integracion, 'MICROSOFT');
        if (!validIntegracion?.accessToken) {
            res.status(401).json(formatError('TOKEN_EXPIRED', 'Token expirado'));
            return;
        }
        const response = await fetch('https://graph.microsoft.com/v1.0/me/drive/recent?$top=20', {
            headers: {
                Authorization: `Bearer ${validIntegracion.accessToken}`,
            },
        });
        if (!response.ok) {
            res.status(400).json(formatError('API_ERROR', 'Error al obtener archivos de OneDrive'));
            return;
        }
        const data = await response.json();
        res.json(formatResponse({ files: data.value || [] }));
    }
    catch (error) {
        console.error('Microsoft OneDrive error:', error);
        res.status(500).json(formatError('INTERNAL_ERROR', 'Error al obtener archivos'));
    }
});
router.get('/google/status', auth_1.authMiddleware, async (req, res) => {
    try {
        const integracion = await getIntegracion(req.user.userId, 'GOOGLE');
        if (!integracion) {
            res.json(formatResponse({ connected: false, tipo: 'GOOGLE' }));
            return;
        }
        const isExpired = await isTokenExpired(integracion);
        const daysUntilExpiry = integracion.expiresAt
            ? Math.ceil((new Date(integracion.expiresAt).getTime() - Date.now()) / (1000 * 60 * 60 * 24))
            : null;
        res.json(formatResponse({
            connected: true,
            tipo: 'GOOGLE',
            expiresAt: integracion.expiresAt,
            isExpired,
            daysUntilExpiry,
        }));
    }
    catch (error) {
        console.error('Google status error:', error);
        res.status(500).json(formatError('INTERNAL_ERROR', 'Error al obtener estado de integración'));
    }
});
router.post('/google/connect', auth_1.authMiddleware, async (req, res) => {
    try {
        const dto = (0, class_transformer_1.plainToInstance)(integraciones_dto_1.ConnectIntegracionDto, req.body);
        const errors = await (0, class_validator_1.validate)(dto);
        if (errors.length > 0) {
            res.status(400).json({ success: false, error: { message: 'Validation failed', details: errors } });
            return;
        }
        const { accessToken, refreshToken, expiresAt } = dto;
        if (!accessToken || !refreshToken) {
            res.status(400).json(formatError('INVALID_TOKENS', 'Se requieren accessToken y refreshToken'));
            return;
        }
        const existing = await getIntegracion(req.user.userId, 'GOOGLE');
        const integracion = existing
            ? await database_1.prisma.integracion.update({
                where: { id: existing.id },
                data: {
                    accessToken,
                    refreshToken,
                    expiresAt: expiresAt ? new Date(expiresAt) : new Date(Date.now() + 3600 * 1000),
                },
            })
            : await database_1.prisma.integracion.create({
                data: {
                    tipo: 'GOOGLE',
                    accessToken,
                    refreshToken,
                    expiresAt: expiresAt ? new Date(expiresAt) : new Date(Date.now() + 3600 * 1000),
                    usuarioId: req.user.userId,
                },
            });
        res.json(formatResponse({
            connected: true,
            tipo: 'GOOGLE',
            expiresAt: integracion.expiresAt,
        }));
    }
    catch (error) {
        console.error('Google connect error:', error);
        res.status(500).json(formatError('INTERNAL_ERROR', 'Error al conectar con Google'));
    }
});
router.post('/google/disconnect', auth_1.authMiddleware, async (req, res) => {
    try {
        const integracion = await getIntegracion(req.user.userId, 'GOOGLE');
        if (!integracion) {
            res.status(404).json(formatError('NOT_FOUND', 'No hay integración con Google'));
            return;
        }
        await database_1.prisma.integracion.update({
            where: { id: integracion.id },
            data: { deletedAt: new Date() },
        });
        res.json(formatResponse({ connected: false, tipo: 'GOOGLE' }));
    }
    catch (error) {
        console.error('Google disconnect error:', error);
        res.status(500).json(formatError('INTERNAL_ERROR', 'Error al desconectar de Google'));
    }
});
router.get('/google/calendar', auth_1.authMiddleware, async (req, res) => {
    try {
        const integracion = await getIntegracion(req.user.userId, 'GOOGLE');
        if (!integracion) {
            res.status(401).json(formatError('NOT_CONNECTED', 'No conectado con Google'));
            return;
        }
        const validIntegracion = await refreshTokenIfNeeded(integracion, 'GOOGLE');
        if (!validIntegracion?.accessToken) {
            res.status(401).json(formatError('TOKEN_EXPIRED', 'Token expirado'));
            return;
        }
        const startDate = Number(req.query.startDate) || Math.floor(Date.now() / 1000);
        const endDate = Number(req.query.endDate) || Math.floor((Date.now() + 30 * 24 * 60 * 60 * 1000) / 1000);
        const response = await fetch(`https://www.googleapis.com/calendar/v3/calendars/primary/events?timeMin=${new Date(startDate * 1000).toISOString()}&timeMax=${new Date(endDate * 1000).toISOString()}&singleEvents=true&orderBy=startTime`, {
            headers: {
                Authorization: `Bearer ${validIntegracion.accessToken}`,
            },
        });
        if (!response.ok) {
            const error = await response.text();
            console.error('Google calendar error:', error);
            res.status(400).json(formatError('API_ERROR', 'Error al obtener calendario de Google'));
            return;
        }
        const data = await response.json();
        res.json(formatResponse({ events: data.items || [] }));
    }
    catch (error) {
        console.error('Google calendar error:', error);
        res.status(500).json(formatError('INTERNAL_ERROR', 'Error al obtener calendario'));
    }
});
router.post('/google/calendar/sync', auth_1.authMiddleware, async (req, res) => {
    try {
        const dto = (0, class_transformer_1.plainToInstance)(integraciones_dto_1.SyncCalendarDto, req.body);
        const errors = await (0, class_validator_1.validate)(dto);
        if (errors.length > 0) {
            res.status(400).json({ success: false, error: { message: 'Validation failed', details: errors } });
            return;
        }
        const integracion = await getIntegracion(req.user.userId, 'GOOGLE');
        if (!integracion) {
            res.status(401).json(formatError('NOT_CONNECTED', 'No conectado con Google'));
            return;
        }
        const validIntegracion = await refreshTokenIfNeeded(integracion, 'GOOGLE');
        if (!validIntegracion?.accessToken) {
            res.status(401).json(formatError('TOKEN_EXPIRED', 'Token expirado'));
            return;
        }
        const startDate = dto.startDate ? Math.floor(new Date(dto.startDate).getTime() / 1000) : Math.floor(Date.now() / 1000);
        const endDate = dto.endDate ? Math.floor(new Date(dto.endDate).getTime() / 1000) : Math.floor((Date.now() + 30 * 24 * 60 * 60 * 1000) / 1000);
        const response = await fetch(`https://www.googleapis.com/calendar/v3/calendars/primary/events?timeMin=${new Date(startDate * 1000).toISOString()}&timeMax=${new Date(endDate * 1000).toISOString()}&singleEvents=true&orderBy=startTime`, {
            headers: {
                Authorization: `Bearer ${validIntegracion.accessToken}`,
            },
        });
        if (!response.ok) {
            res.status(400).json(formatError('API_ERROR', 'Error al sincronizar calendario'));
            return;
        }
        const data = await response.json();
        const events = data.items || [];
        let syncedCount = 0;
        for (const event of events) {
            const startTime = event.start?.dateTime || event.start?.date;
            const existing = await database_1.prisma.evento.findFirst({
                where: {
                    titulo: event.summary,
                    fechaInicio: new Date(startTime),
                    usuarioId: req.user.userId,
                },
            });
            if (!existing) {
                await database_1.prisma.evento.create({
                    data: {
                        titulo: event.summary || 'Sin título',
                        descripcion: event.description || '',
                        fechaInicio: new Date(startTime),
                        fechaFin: event.end?.dateTime ? new Date(event.end.dateTime) : null,
                        location: event.location || '',
                        usuarioId: req.user.userId,
                    },
                });
                syncedCount++;
            }
        }
        res.json(formatResponse({
            message: `Sincronizados ${syncedCount} eventos`,
            syncedCount,
            totalEvents: events.length,
        }));
    }
    catch (error) {
        console.error('Google calendar sync error:', error);
        res.status(500).json(formatError('INTERNAL_ERROR', 'Error al sincronizar calendario'));
    }
});
router.post('/google/email/send', auth_1.authMiddleware, async (req, res) => {
    try {
        const dto = (0, class_transformer_1.plainToInstance)(integraciones_dto_1.SendEmailDto, req.body);
        const errors = await (0, class_validator_1.validate)(dto);
        if (errors.length > 0) {
            res.status(400).json({ success: false, error: { message: 'Validation failed', details: errors } });
            return;
        }
        const integracion = await getIntegracion(req.user.userId, 'GOOGLE');
        if (!integracion) {
            res.status(401).json(formatError('NOT_CONNECTED', 'No conectado con Google'));
            return;
        }
        const validIntegracion = await refreshTokenIfNeeded(integracion, 'GOOGLE');
        if (!validIntegracion?.accessToken) {
            res.status(401).json(formatError('TOKEN_EXPIRED', 'Token expirado'));
            return;
        }
        const emailPayload = {
            raw: Buffer.from(`To: ${dto.to}\r\nSubject: ${dto.subject}\r\nContent-Type: text/html; charset=UTF-8\r\n\r\n${dto.body}`).toString('base64url'),
        };
        const response = await fetch('https://gmail.googleapis.com/gmail/v1/users/me/messages/send', {
            method: 'POST',
            headers: {
                Authorization: `Bearer ${validIntegracion.accessToken}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(emailPayload),
        });
        if (!response.ok) {
            const error = await response.text();
            console.error('Google email error:', error);
            res.status(400).json(formatError('API_ERROR', 'Error al enviar email'));
            return;
        }
        res.json(formatResponse({ message: 'Email enviado correctamente' }));
    }
    catch (error) {
        console.error('Google email send error:', error);
        res.status(500).json(formatError('INTERNAL_ERROR', 'Error al enviar email'));
    }
});
router.get('/google/drive', auth_1.authMiddleware, async (req, res) => {
    try {
        const integracion = await getIntegracion(req.user.userId, 'GOOGLE');
        if (!integracion) {
            res.status(401).json(formatError('NOT_CONNECTED', 'No conectado con Google'));
            return;
        }
        const validIntegracion = await refreshTokenIfNeeded(integracion, 'GOOGLE');
        if (!validIntegracion?.accessToken) {
            res.status(401).json(formatError('TOKEN_EXPIRED', 'Token expirado'));
            return;
        }
        const response = await fetch('https://www.googleapis.com/drive/v3/files?pageSize=20&orderBy=modifiedTime desc', {
            headers: {
                Authorization: `Bearer ${validIntegracion.accessToken}`,
            },
        });
        if (!response.ok) {
            res.status(400).json(formatError('API_ERROR', 'Error al obtener archivos de Google Drive'));
            return;
        }
        const data = await response.json();
        res.json(formatResponse({ files: data.files || [] }));
    }
    catch (error) {
        console.error('Google Drive error:', error);
        res.status(500).json(formatError('INTERNAL_ERROR', 'Error al obtener archivos'));
    }
});
exports.default = router;
//# sourceMappingURL=integraciones.js.map
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
declare class IntegracionesService {
    getStatus(usuarioId: string): Promise<any[]>;
    connect(usuarioId: string, input: ConnectIntegracionInput): Promise<any>;
    disconnect(usuarioId: string, tipo: string): Promise<void>;
    sendEmail(usuarioId: string, input: SendEmailInput): Promise<any>;
    getEmails(usuarioId: string, params: any): Promise<any>;
    createCalendarEvent(usuarioId: string, input: CalendarEventInput): Promise<any>;
    getCalendarEvents(usuarioId: string, startDate?: string, endDate?: string): Promise<any[]>;
    syncCalendar(usuarioId: string, input: SyncCalendarInput): Promise<any>;
    deleteCalendarEvent(usuarioId: string, eventId: string): Promise<void>;
    refreshToken(usuarioId: string, tipo: string): Promise<any>;
}
export declare const integracionesService: IntegracionesService;
export {};
//# sourceMappingURL=integraciones.service.d.ts.map
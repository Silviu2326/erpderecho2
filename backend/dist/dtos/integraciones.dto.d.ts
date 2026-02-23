export declare class ConnectIntegracionDto {
    accessToken?: string;
    refreshToken?: string;
    expiresAt?: string;
}
export declare class SendEmailDto {
    to: string;
    subject: string;
    body: string;
    from?: string;
    cc?: string[];
    bcc?: string[];
    expedienteId?: string;
}
export declare class CalendarEventDto {
    title: string;
    description?: string;
    startTime: string;
    endTime?: string;
    location?: string;
    attendees?: string[];
    allDay?: boolean;
    expedienteId?: string;
}
export declare class SyncCalendarDto {
    startDate?: string;
    endDate?: string;
    syncEvents?: boolean;
}
export declare class IntegracionStatusDto {
    tipo: string;
    connected: boolean;
    expiresAt?: string;
    daysUntilExpiry?: number;
}
//# sourceMappingURL=integraciones.dto.d.ts.map
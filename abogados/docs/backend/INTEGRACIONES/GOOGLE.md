# Integración Google Workspace

## Google APIs

### Endpoints Principales

| Servicio | URL |
|----------|-----|
| Calendar | https://www.googleapis.com/calendar/v3 |
| Gmail | https://gmail.googleapis.com/gmail/v1 |
| Drive | https://www.googleapis.com/drive/v3 |

---

## Flujo OAuth

```
1. Redirect a: https://accounts.google.com/o/oauth2/v2/auth
2. Params: client_id, redirect_uri, response_type=code, scope
3. Obtener code
4. Intercambiar por tokens: /token
5. Obtener access_token, refresh_token
```

### Scopes

```
https://www.googleapis.com/auth/calendar
https://www.googleapis.com/auth/calendar.events
https://www.googleapis.com/auth/gmail.send
https://www.googleapis.com/auth/gmail.readonly
https://www.googleapis.com/auth/drive
https://www.googleapis.com/auth/drive.file
```

---

## Implementación Backend

### Servicio

```typescript
// services/google.service.ts
interface GoogleService {
  // OAuth
  getAuthUrl(): string
  exchangeCode(code: string): Promise<Tokens>
  refreshToken(refreshToken: string): Promise<Tokens>
  
  // Calendar
  getEvents(calendarId: string, params: CalendarParams): Promise<GoogleEvent[]>
  createEvent(calendarId: string, event: CreateEventDto): Promise<GoogleEvent>
  updateEvent(calendarId: string, eventId: string, event: UpdateEventDto): Promise<GoogleEvent>
  deleteEvent(calendarId: string, eventId: string): Promise<void>
  
  // Gmail
  sendMessage(message: GmailMessage): Promise<string>
  listMessages(query: string, maxResults: number): Promise<GmailMessage[]>
  getMessage(id: string): Promise<GmailMessage>
  
  // Drive
  createFile(file: CreateFileDto): Promise<GoogleDriveFile>
  getFile(id: string): Promise<GoogleDriveFile>
  downloadFile(id: string): Promise<Buffer>
  listFiles(folderId?: string): Promise<GoogleDriveFile[]>
  deleteFile(id: string): Promise<void>
}
```

---

## Modelos

### GoogleEvent

```typescript
interface GoogleEvent {
  id: string
  summary: string
  description?: string
  start: {
    dateTime: string // ISO 8601
    timeZone: string
  }
  end: {
    dateTime: string
    timeZone: string
  }
  location?: string
  attendees?: Attendee[]
  conferenceData?: ConferenceData
  recurrence?: string[]
}
```

### GmailMessage

```typescript
interface GmailMessage {
  id: string
  threadId: string
  subject: string
  from: string
  to: string[]
  cc?: string[]
  date: string
  snippet: string
  body: {
    mimeType: string
    data: string // Base64url
  }
  attachments?: Attachment[]
}
```

---

## Notas Importantes

### Rate Limits

- Calendar: 500 req/user/segundo
- Gmail: 100 req/segundo
- Drive: 1000 req/segundo

### Refresh Tokens

- Google no expira refresh tokens automáticamente
- pero puede revocarlos
- Guardar de forma segura

### Webhooks

- Available para cambios en Calendar y Drive
- Configurar endpoint público para notificaciones

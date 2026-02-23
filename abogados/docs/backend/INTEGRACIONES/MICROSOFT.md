# Integración Microsoft 365

## Microsoft Graph API

### Endpoint Principal
```
Base URL: https://graph.microsoft.com/v1.0
```

### Permisos Requeridos

| Permiso | Descripción |
|---------|-------------|
| `User.Read` | Leer perfil |
| `Calendars.ReadWrite` | Calendario |
| `Mail.Send` | Enviar emails |
| `Files.ReadWrite` | OneDrive |
| `Contacts.ReadWrite` | Contactos |

---

## Flujo OAuth

```
1. Redirect a: https://login.microsoftonline.com/common/oauth2/v2.0/authorize
2. Params: client_id, redirect_uri, response_type=code, scope
3. Obtener code
4. Intercambiar por tokens: /token
5. Obtener access_token, refresh_token
```

---

## Implementación Backend

### Servicio

```typescript
// services/microsoft.service.ts
interface MicrosoftService {
  // OAuth
  getAuthUrl(): string
  exchangeCode(code: string): Promise<Tokens>
  refreshToken(refreshToken: string): Promise<Tokens>
  
  // Calendario
  getCalendarEvents(from: Date, to: Date): Promise<CalendarEvent[]>
  createCalendarEvent(event: CreateEventDto): Promise<CalendarEvent>
  updateCalendarEvent(id: string, event: UpdateEventDto): Promise<CalendarEvent>
  deleteCalendarEvent(id: string): Promise<void>
  
  // Email
  sendEmail(email: SendEmailDto): Promise<void>
  getEmails(folder?: string): Promise<Email[]>
  
  // OneDrive
  uploadFile(path: string, content: Buffer): Promise<DriveItem>
  downloadFile(id: string): Promise<Buffer>
  listFiles(folderId?: string): Promise<DriveItem[]>
}
```

---

## Modelos

### CalendarEvent

```typescript
interface CalendarEvent {
  id: string
  subject: string
  body: string
  start: DateTimeZone
  end: DateTimeZone
  location: Location
  attendees: Attendee[]
  organizer: Organizer
  isOnlineMeeting: boolean
  joinUrl?: string
}
```

### Email

```typescript
interface Email {
  id: string
  subject: string
  from: EmailAddress
  to: EmailAddress[]
  cc?: EmailAddress[]
  body: EmailBody
  attachments?: Attachment[]
  sentDateTime: Date
}
```

---

## Sincronización

### Bidireccional

```
1. Obtener cambios desde última sincronización (delta token)
2. Aplicar cambios locales al calendario
3. Subir cambios nuevos
4. Resolver conflictos (timestamp based)
```

### Configuración

```typescript
// Sync config
interface CalendarSyncConfig {
  enabled: boolean
  direction: 'import' | 'export' | 'bidirectional'
  syncInterval: number // minutos
  conflictResolution: 'server' | 'client' | 'manual'
}
```

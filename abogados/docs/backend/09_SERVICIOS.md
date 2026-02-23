# 09 - Servicios del Backend

## Visión General

El backend está estructurado en módulos y servicios que encapsulan la lógica de negocio. Cada servicio es responsable de una funcionalidad específica.

---

## Servicios Principales

### 1. AuthService

Gestión de autenticación y autorización.

```typescript
@Injectable()
export class AuthService {
  async login(loginDto: LoginDto): Promise<AuthResponse>
  async register(registerDto: RegisterDto): Promise<AuthResponse>
  async refreshToken(refreshToken: string): Promise<AuthResponse>
  async logout(userId: string): Promise<void>
  async validateUser(email: string, password: string): Promise<User>
  async enable2FA(userId: string): Promise<{ secret: string; qrCode: string }>
  async verify2FA(userId: string, code: string): Promise<boolean>
  async resetPassword(token: string, newPassword: string): Promise<void>
}
```

### 2. ExpedienteService

Gestión de expedientes judiciales.

```typescript
@Injectable()
export class ExpedienteService {
  async findAll(filters: ExpedienteFilters): Promise<PaginatedResult<Expediente>>
  async findById(id: string): Promise<Expediente>
  async create(dto: CreateExpedienteDto): Promise<Expediente>
  async update(id: string, dto: UpdateExpedienteDto): Promise<Expediente>
  async delete(id: string): Promise<void>
  async getActuaciones(expedienteId: string): Promise<Actuacion[]>
  async addDocumento(expedienteId: string, documentoId: string): Promise<void>
  async getTimeline(expedienteId: string): Promise<TimelineEvent[]>
}
```

### 3. ClienteService

Administración de clientes.

```typescript
@Injectable()
export class ClienteService {
  async findAll(filters: ClienteFilters): Promise<PaginatedResult<Cliente>>
  async findById(id: string): Promise<Cliente>
  async create(dto: CreateClienteDto): Promise<Cliente>
  async update(id: string, dto: UpdateClienteDto): Promise<Cliente>
  async delete(id: string): Promise<void>
  async getExpedientes(clienteId: string): Promise<Expediente[]>
  async getFacturas(clienteId: string): Promise<Factura[]>
  async searchByNif(nif: string): Promise<Cliente | null>
}
```

### 4. FacturaService

Gestión de facturación.

```typescript
@Injectable()
export class FacturaService {
  async findAll(filters: FacturaFilters): Promise<PaginatedResult<Factura>>
  async findById(id: string): Promise<Factura>
  async create(dto: CreateFacturaDto): Promise<Factura>
  async update(id: string, dto: UpdateFacturaDto): Promise<Factura>
  async delete(id: string): Promise<void>
  async marcarPagada(id: string, pagoDto: PagoDto): Promise<Factura>
  async generarPDF(id: string): Promise<Buffer>
  async enviarPorEmail(id: string, email: string): Promise<void>
  async calcularTotales(expedienteId: string): Promise<ResumenFacturacion>
}
```

### 5. DocumentoService

Gestión de documentos.

```typescript
@Injectable()
export class DocumentoService {
  async upload(file: Express.Multer.File, metadata: DocumentoMetadata): Promise<Documento>
  async findById(id: string): Promise<Documento>
  async findByExpediente(expedienteId: string): Promise<Documento[]>
  async update(id: string, dto: UpdateDocumentoDto): Promise<Documento>
  async delete(id: string): Promise<void>
  async sign(id: string, certificate: Buffer): Promise<Documento>
  async download(id: string): Promise<StreamableFile>
  async runOCR(id: string): Promise<{ text: string; confidence: number }>
  async search(query: string): Promise<Documento[]>
}
```

### 6. CalendarioService

Gestión de eventos y plazos.

```typescript
@Injectable()
export class CalendarioService {
  async findAll(filters: EventoFilters): Promise<Evento[]>
  async create(dto: CreateEventoDto): Promise<Evento>
  async update(id: string, dto: UpdateEventoDto): Promise<Evento>
  async delete(id: string): Promise<void>
  async getAudiencias(dateRange: DateRange): Promise<Evento[]>
  async getPlazos(dateRange: DateRange): Promise<Evento[]>
  async syncWithGoogle(usuarioId: string): Promise<void>
  async syncWithOutlook(usuarioId: string): Promise<void>
}
```

---

## Servicios de Integración

### 7. BoeService

Integración con el Boletín Oficial del Estado.

```typescript
@Injectable()
export class BoeService {
  async buscar(query: string, filtros: BoeFiltros): Promise<BoeResultado[]>
  async obtenerDocumento(id: string): Promise<BoeDocumento>
  async obtenerCalendario(anno: number, mes: number): Promise<CalendarioBoe[]>
  async getNovedades(fecha: Date): Promise<BoeDocumento[]>
  async detectarDerogaciones(legislacionId: string): Promise<Derogacion[]>
}
```

### 8. CendojService

Integración con el CENDOJ (Centro de Documentación Judicial).

```typescript
@Injectable()
export class CendojService {
  async buscar(query: string, filtros: CendojFiltros): Promise<ResultadoJudicial[]>
  async obtenerResolucion(id: string): Promise<ResolucionJudicial>
  async buscarPorTribunal(tribunal: string, fecha: Date): Promise<ResolucionJudicial[]>
  async buscarPorMateria(materia: string, fecha: Date): Promise<ResolucionJudicial[]>
}
```

### 9. MicrosoftService

Integración con Microsoft 365.

```typescript
@Injectable()
export class MicrosoftService {
  async connect(userId: string, code: string): Promise<MicrosoftConnection>
  async disconnect(userId: string): Promise<void>
  async getCalendarEvents(userId: string, range: DateRange): Promise<MicrosoftCalendarEvent[]>
  async createCalendarEvent(userId: string, event: CalendarEvent): Promise<string>
  async sendEmail(userId: string, email: MicrosoftEmail): Promise<string>
  async uploadToOneDrive(userId: string, file: Buffer, path: string): Promise<string>
}
```

### 10. GoogleService

Integración con Google Workspace.

```typescript
@Injectable()
export class GoogleService {
  async connect(userId: string, code: string): Promise<GoogleConnection>
  async disconnect(userId: string): Promise<void>
  async getCalendarEvents(userId: string, range: DateRange): Promise<GoogleCalendarEvent[]>
  async createCalendarEvent(userId: string, event: CalendarEvent): Promise<string>
  async sendEmail(userId: string, email: GoogleEmail): Promise<string>
  async uploadToDrive(userId: string, file: Buffer, folderId: string): Promise<string>
}
```

---

## Servicios Especializados

### 11. OficioService

Gestión de turnos de oficio.

```typescript
@Injectable()
export class OficioService {
  async getTurnos(filters: TurnoFilters): Promise<TurnoOficio[]>
  async getTurnoById(id: string): Promise<TurnoOficio>
  async createTurno(dto: CreateTurnoDto): Promise<TurnoOficio>
  async updateTurno(id: string, dto: UpdateTurnoDto): Promise<TurnoOficio>
  async getGuardias(fecha: Date): Promise<Guardia[]>
  async assignAbogado(turnoId: string, abogadoId: string): Promise<TurnoOficio>
  async completeTurno(turnoId: string, actuaciones: Actuacion[]): Promise<Liquidacion>
}
```

### 12. CrmService

Gestión de relaciones con clientes (CRM).

```typescript
@Injectable()
export class CrmService {
  // Leads
  async getLeads(filters: LeadFilters): Promise<Lead[]>
  async createLead(dto: CreateLeadDto): Promise<Lead>
  async updateLead(id: string, dto: UpdateLeadDto): Promise<Lead>
  async convertLead(id: string): Promise<Cliente>
  
  // Oportunidades
  async getOportunidades(filters: OportunidadFilters): Promise<Oportunidad[]>
  async createOportunidad(dto: CreateOportunidadDto): Promise<Oportunidad>
  async updateOportunidad(id: string, dto: UpdateOportunidadDto): Promise<Oportunidad>
  
  // Pipeline
  async getPipeline(usuarioId?: string): Promise<PipelineStage[]>
}
```

### 13. LopdgddService

Cumplimiento LOPDGDD.

```typescript
@Injectable()
export class LopdgddService {
  // RAT
  async getRAT(empresaId: string): Promise<RAT>
  async createRAT(dto: CreateRATDto): Promise<RAT>
  async updateRAT(id: string, dto: UpdateRATDto): Promise<RAT>
  
  // Consentimientos
  async getConsentimientos(clienteId: string): Promise<Consentimiento[]>
  async createConsentimiento(dto: CreateConsentimientoDto): Promise<Consentimiento>
  
  // Derechos ARCO
  async ejercitarDerecho(derecho: string, clienteId: string, datos: EjercicioDerechoDto): Promise<Ejercicio>
  
  // Brechas
  async reportBrecha(dto: CreateBrechaDto): Promise<Brecha>
  async getBrechas(): Promise<Brecha[]>
}
```

### 14. PrediccionService

Análisis predictivo con IA.

```typescript
@Injectable()
export class PrediccionService {
  async predecirCaso(expedienteId: string): Promise<PrediccionCaso>
  async analizarTendencia(tipoExpediente: string): Promise<Tendencia>
  async generarRecomendaciones(expedienteId: string): Promise<Recomendacion[]>
  async getCasosSimilares(expedienteId: string): Promise<Expediente[]>
  async predecirRiesgoPrescripcion(expedienteId: string): Promise<RiesgoPrescripcion>
}
```

### 15. PrescripcionService

Gestión de plazos de prescripción.

```typescript
@Injectable()
export class PrescripcionService {
  async findAll(filters: PrescripcionFilters): Promise<Prescripcion[]>
  async findById(id: string): Promise<Prescripcion>
  async create(dto: CreatePrescripcionDto): Promise<Prescripcion>
  async update(id: string, dto: UpdatePrescripcionDto): Promise<Prescripcion>
  async getProximas(dias: number): Promise<Prescripcion[]>
  async getAlertas(): Promise<AlertaPrescripcion[]>
  async calcularDiasRestantes(tipo: string, fechaInicio: Date): Promise<number>
}
```

### 16. ConflictoService

Gestión de conflictos y partes contrarias.

```typescript
@Injectable()
export class ConflictoService {
  async findAll(filters: ConflictoFilters): Promise<Conflicto[]>
  async findById(id: string): Promise<Conflicto>
  async create(dto: CreateConflictoDto): Promise<Conflicto>
  async update(id: string, dto: UpdateConflictoDto): Promise<Conflicto>
  async getPartesContrarias(): Promise<ParteContraria[]>
  async createParteContraria(dto: CreateParteDto): Promise<ParteContraria>
  async analizarExpediente(expedienteId: string): Promise<AnalisisConflicto>
}
```

---

## Servicios de Utilidad

### 17. EmailService

Envío de emails.

```typescript
@Injectable()
export class EmailService {
  async send(to: string, subject: string, body: string): Promise<void>
  async sendTemplate(to: string, templateId: string, data: any): Promise<void>
  async sendBatch(emails: EmailMessage[]): Promise<EmailResult[]>
}
```

### 18. ReportsService

Generación de informes.

```typescript
@Injectable()
export class ReportsService {
  async generarInforme(tipo: string, parametros: any): Promise<Buffer>
  async generarInformeExpediente(expedienteId: string): Promise<Buffer>
  async generarInformeFacturacion(fechaInicio: Date, fechaFin: Date): Promise<Buffer>
  async generarInformeActividad(usuarioId: string, fechaInicio: Date, fechaFin: Date): Promise<Buffer>
}
```

### 19. OcrService

Reconocimiento óptico de caracteres.

```typescript
@Injectable()
export class OcrService {
  async processImage(imageBuffer: Buffer): Promise<OcrResult>
  async processPDF(pdfBuffer: Buffer): Promise<OcrResult[]>
  async extractText(fileId: string): Promise<string>
}
```

### 20. AlertasService

Sistema de alertas.

```typescript
@Injectable()
export class AlertasService {
  async crearAlerta(alerta: CreateAlertaDto): Promise<Alerta>
  async getAlertasUsuario(usuarioId: string, leidas?: boolean): Promise<Alerta[]>
  async marcarLeida(alertaId: string): Promise<void>
  async getAlertasPendientes(): Promise<Alerta[]>
}
```

---

## Inyección de Dependencias

```typescript
// ejemplo.module.ts
@Module({
  providers: [
    AuthService,
    ExpedienteService,
    ClienteService,
    {
      provide: 'IAuthRepository',
      useClass: AuthRepository
    }
  ]
})
export class EjemploModule {}
```

---

## Patrones de Servicios

### Repository Pattern

```typescript
// services/expediente.service.ts
@Injectable()
export class ExpedienteService {
  constructor(
    @InjectRepository(Expediente)
    private readonly expedienteRepo: Repository<Expediente>,
    private readonly clienteService: ClienteService
  ) {}

  async findAll(filters: ExpedienteFilters): Promise<PaginatedResult<Expediente>> {
    const query = this.expedienteRepo.createQueryBuilder('e');
    
    if (filters.estado) {
      query.andWhere('e.estado = :estado', { estado: filters.estado });
    }
    
    return this.paginate(query, filters.page, filters.limit);
  }
}
```

### Unit of Work

```typescript
@Injectable()
export class TransaccionService {
  async ejecutarTransaccion<T>(fn: () => Promise<T>): Promise<T> {
    return this.dataSource.transaction(async (manager) => {
      return fn();
    });
  }
}
```

import type {
  Lead,
  ActividadCRM,
  TipoActividad,
  EtapaPipeline,
  CRMEstadisticas,
  FuenteCaptacion,
  RecordatorioCRM,
  ConversionResult,
} from '@/types/crm';
import { LIMITES_INACTIVIDAD } from '@/types/crm';

const leadsMock: Lead[] = [
  {
    id: 'LEAD-001', nombre: 'Roberto Fernández', email: 'roberto@empresa.com', telefono: '+34 612 345 678',
    empresa: 'Fernández & Asociados S.L.', fuente: 'referido', etapa: 'nuevo', valorEstimado: 12000,
    probabilidad: 20, prioridad: 'alta', abogadoAsignado: 'María González', tipoServicio: 'Derecho mercantil',
    notas: 'Referido por cliente actual. Necesita asesoría para reestructuración societaria.',
    fechaCreacion: '2026-02-18', fechaUltimoContacto: '2026-02-18', diasEnEtapa: 3, actividades: [
      { id: 'ACT-001', leadId: 'LEAD-001', tipo: 'nota', descripcion: 'Lead recibido por referencia de cliente actual.', fecha: '2026-02-18', resultado: 'Registrado', proximaAccion: 'Llamar para primera toma de contacto' },
    ],
  },
  {
    id: 'LEAD-002', nombre: 'Laura Sánchez', email: 'laura.sanchez@gmail.com', telefono: '+34 623 456 789',
    fuente: 'web', etapa: 'contactado', valorEstimado: 5000, probabilidad: 35, prioridad: 'media',
    abogadoAsignado: 'Carlos Ruiz', tipoServicio: 'Derecho laboral',
    notas: 'Consulta por despido improcedente. Antigüedad 8 años en la empresa.',
    fechaCreacion: '2026-02-14', fechaUltimoContacto: '2026-02-17', diasEnEtapa: 4, actividades: [
      { id: 'ACT-002', leadId: 'LEAD-002', tipo: 'llamada', descripcion: 'Primera llamada. Explicó su situación de despido.', fecha: '2026-02-15', resultado: 'Interesada, solicita reunión', proximaAccion: 'Enviar email con disponibilidad' },
      { id: 'ACT-003', leadId: 'LEAD-002', tipo: 'email', descripcion: 'Enviado email con horarios disponibles para reunión.', fecha: '2026-02-17', resultado: 'Pendiente respuesta' },
    ],
  },
  {
    id: 'LEAD-003', nombre: 'TechStart Solutions', email: 'legal@techstart.es', telefono: '+34 634 567 890',
    empresa: 'TechStart Solutions S.L.', fuente: 'evento', etapa: 'reunion', valorEstimado: 25000,
    probabilidad: 50, prioridad: 'alta', abogadoAsignado: 'Ana López', tipoServicio: 'Propiedad intelectual',
    notas: 'Startup que necesita protección de marca y patentes. Contacto en evento LegalTech Madrid.',
    fechaCreacion: '2026-02-10', fechaUltimoContacto: '2026-02-19', diasEnEtapa: 5, actividades: [
      { id: 'ACT-004', leadId: 'LEAD-003', tipo: 'nota', descripcion: 'Contacto en evento LegalTech Madrid. Intercambio de tarjetas.', fecha: '2026-02-10' },
      { id: 'ACT-005', leadId: 'LEAD-003', tipo: 'email', descripcion: 'Email de seguimiento post-evento.', fecha: '2026-02-12', resultado: 'Respondió con interés' },
      { id: 'ACT-006', leadId: 'LEAD-003', tipo: 'reunion', descripcion: 'Reunión presencial en sus oficinas. Presentación de servicios.', fecha: '2026-02-19', resultado: 'Muy interesados, piden propuesta', proximaAccion: 'Preparar propuesta de servicios' },
    ],
  },
  {
    id: 'LEAD-004', nombre: 'Carmen Jiménez', email: 'carmen.j@hotmail.com', telefono: '+34 645 678 901',
    fuente: 'publicidad', etapa: 'propuesta', valorEstimado: 8000, probabilidad: 65, prioridad: 'media',
    abogadoAsignado: 'María González', tipoServicio: 'Derecho de familia',
    notas: 'Divorcio contencioso con custodia compartida. Propuesta enviada el 16/02.',
    fechaCreacion: '2026-02-05', fechaUltimoContacto: '2026-02-16', diasEnEtapa: 5, actividades: [],
  },
  {
    id: 'LEAD-005', nombre: 'Grupo Inmobiliario del Sur', email: 'juridico@inmosur.es', telefono: '+34 656 789 012',
    empresa: 'Grupo Inmobiliario del Sur S.A.', fuente: 'referido', etapa: 'negociacion', valorEstimado: 35000,
    probabilidad: 80, prioridad: 'alta', abogadoAsignado: 'Carlos Ruiz', tipoServicio: 'Derecho inmobiliario',
    notas: 'Litigio por vicios ocultos en promoción de 20 viviendas. Negociando honorarios.',
    fechaCreacion: '2026-01-25', fechaUltimoContacto: '2026-02-20', diasEnEtapa: 8, actividades: [
      { id: 'ACT-007', leadId: 'LEAD-005', tipo: 'llamada', descripcion: 'Llamada inicial. Explicaron caso de vicios ocultos.', fecha: '2026-01-25', resultado: 'Interesados' },
      { id: 'ACT-008', leadId: 'LEAD-005', tipo: 'reunion', descripcion: 'Reunión con director jurídico. Revisión de documentación.', fecha: '2026-02-05', resultado: 'Solicitan propuesta detallada' },
      { id: 'ACT-009', leadId: 'LEAD-005', tipo: 'email', descripcion: 'Enviada propuesta económica detallada.', fecha: '2026-02-12', resultado: 'Revisando internamente' },
      { id: 'ACT-010', leadId: 'LEAD-005', tipo: 'llamada', descripcion: 'Seguimiento de propuesta. Negociando honorarios.', fecha: '2026-02-20', resultado: 'Piden ajuste en fees', proximaAccion: 'Preparar contraoferta' },
    ],
  },
  {
    id: 'LEAD-006', nombre: 'Miguel Torres', email: 'mtorres@gmail.com', telefono: '+34 667 890 123',
    fuente: 'colegio', etapa: 'contactado', valorEstimado: 3000, probabilidad: 25, prioridad: 'baja',
    abogadoAsignado: 'Ana López', tipoServicio: 'Derecho penal',
    notas: 'Derivación del turno de oficio. Recurso de apelación por delito leve.',
    fechaCreacion: '2026-02-15', fechaUltimoContacto: '2026-02-15', diasEnEtapa: 6, actividades: [],
  },
  {
    id: 'LEAD-007', nombre: 'Elena Martín', email: 'elena.martin@corporacion.es', telefono: '+34 678 901 234',
    empresa: 'Corporación Alimentaria S.A.', fuente: 'redes_sociales', etapa: 'nuevo', valorEstimado: 15000,
    probabilidad: 15, prioridad: 'media', abogadoAsignado: 'María González', tipoServicio: 'Compliance',
    notas: 'Contactó vía LinkedIn. Necesita programa de compliance corporativo.',
    fechaCreacion: '2026-02-20', fechaUltimoContacto: '2026-02-20', diasEnEtapa: 1, actividades: [],
  },
  {
    id: 'LEAD-008', nombre: 'Distribuciones Rápidas S.L.', email: 'admin@distrirapidas.com', telefono: '+34 689 012 345',
    empresa: 'Distribuciones Rápidas S.L.', fuente: 'web', etapa: 'ganado', valorEstimado: 6500,
    probabilidad: 100, prioridad: 'media', abogadoAsignado: 'Carlos Ruiz', tipoServicio: 'Derecho mercantil',
    notas: 'Contrato firmado. Asesoría recurrente en contratos de distribución.',
    fechaCreacion: '2026-01-10', fechaUltimoContacto: '2026-02-12', diasEnEtapa: 0, actividades: [],
  },
  {
    id: 'LEAD-009', nombre: 'Pablo Ruiz', email: 'pruiz@email.com', telefono: '+34 690 123 456',
    fuente: 'publicidad', etapa: 'perdido', valorEstimado: 4000, probabilidad: 0, prioridad: 'baja',
    abogadoAsignado: 'Ana López', tipoServicio: 'Derecho civil',
    notas: 'Eligió otro despacho por precio. Reclamación de cantidad.',
    fechaCreacion: '2026-01-20', fechaUltimoContacto: '2026-02-08', diasEnEtapa: 0, actividades: [],
  },
  {
    id: 'LEAD-010', nombre: 'Clínica Dental Sonrisa', email: 'gerencia@clinicasonrisa.es', telefono: '+34 601 234 567',
    empresa: 'Clínica Dental Sonrisa S.L.', fuente: 'referido', etapa: 'reunion', valorEstimado: 10000,
    probabilidad: 45, prioridad: 'media', abogadoAsignado: 'María González', tipoServicio: 'Derecho sanitario',
    notas: 'Referido por Fernández & Asociados. Reclamación por negligencia médica.',
    fechaCreacion: '2026-02-12', fechaUltimoContacto: '2026-02-19', diasEnEtapa: 3, actividades: [],
  },
];

class CRMService {
  private leads: Lead[] = [...leadsMock];

  async getLeads(): Promise<Lead[]> {
    await new Promise(r => setTimeout(r, 500));
    return [...this.leads];
  }

  async getLeadById(id: string): Promise<Lead | undefined> {
    await new Promise(r => setTimeout(r, 300));
    return this.leads.find(l => l.id === id);
  }

  async updateLeadEtapa(leadId: string, etapa: EtapaPipeline): Promise<Lead | undefined> {
    await new Promise(r => setTimeout(r, 300));
    const lead = this.leads.find(l => l.id === leadId);
    if (lead) {
      lead.etapa = etapa;
      lead.diasEnEtapa = 0;
      if (etapa === 'ganado') lead.probabilidad = 100;
      if (etapa === 'perdido') lead.probabilidad = 0;
    }
    return lead;
  }

  async createLead(data: Omit<Lead, 'id' | 'actividades' | 'diasEnEtapa' | 'fechaCreacion'>): Promise<Lead> {
    await new Promise(r => setTimeout(r, 400));
    const newLead: Lead = {
      ...data,
      id: `LEAD-${String(this.leads.length + 1).padStart(3, '0')}`,
      actividades: [],
      diasEnEtapa: 0,
      fechaCreacion: new Date().toISOString().split('T')[0],
    };
    this.leads.push(newLead);
    return newLead;
  }

  async deleteLead(id: string): Promise<boolean> {
    await new Promise(r => setTimeout(r, 300));
    const idx = this.leads.findIndex(l => l.id === id);
    if (idx !== -1) { this.leads.splice(idx, 1); return true; }
    return false;
  }

  async getEstadisticas(): Promise<CRMEstadisticas> {
    await new Promise(r => setTimeout(r, 400));
    const leads = this.leads;
    const ahora = new Date();
    const inicioMes = new Date(ahora.getFullYear(), ahora.getMonth(), 1).toISOString().split('T')[0];

    const leadsPorFuente = {} as Record<FuenteCaptacion, number>;
    const leadsPorEtapa = {} as Record<EtapaPipeline, number>;

    leads.forEach(l => {
      leadsPorFuente[l.fuente] = (leadsPorFuente[l.fuente] || 0) + 1;
      leadsPorEtapa[l.etapa] = (leadsPorEtapa[l.etapa] || 0) + 1;
    });

    const ganados = leads.filter(l => l.etapa === 'ganado');
    const cerrados = leads.filter(l => l.etapa === 'ganado' || l.etapa === 'perdido');

    return {
      totalLeads: leads.length,
      leadsEsteMes: leads.filter(l => l.fechaCreacion >= inicioMes).length,
      tasaConversion: cerrados.length > 0 ? Math.round((ganados.length / cerrados.length) * 100) : 0,
      valorPipeline: leads.filter(l => l.etapa !== 'ganado' && l.etapa !== 'perdido').reduce((s, l) => s + l.valorEstimado, 0),
      tiempoMedioConversion: 28,
      leadsPorFuente,
      leadsPorEtapa,
    };
  }

  private activityCounter = 100;

  async addActividad(leadId: string, tipo: TipoActividad, descripcion: string, resultado?: string, proximaAccion?: string): Promise<ActividadCRM | undefined> {
    await new Promise(r => setTimeout(r, 300));
    const lead = this.leads.find(l => l.id === leadId);
    if (!lead) return undefined;
    const actividad: ActividadCRM = {
      id: `ACT-${String(++this.activityCounter).padStart(3, '0')}`,
      leadId,
      tipo,
      descripcion,
      fecha: new Date().toISOString().split('T')[0],
      resultado,
      proximaAccion,
    };
    lead.actividades.push(actividad);
    lead.fechaUltimoContacto = actividad.fecha;
    return actividad;
  }

  async getActividades(leadId: string): Promise<ActividadCRM[]> {
    await new Promise(r => setTimeout(r, 200));
    const lead = this.leads.find(l => l.id === leadId);
    return lead ? [...lead.actividades].reverse() : [];
  }

  async getRecordatorios(): Promise<RecordatorioCRM[]> {
    await new Promise(r => setTimeout(r, 300));
    const hoy = new Date();
    const recordatorios: RecordatorioCRM[] = [];

    this.leads.forEach(lead => {
      if (lead.etapa === 'ganado' || lead.etapa === 'perdido') return;
      const limite = LIMITES_INACTIVIDAD[lead.etapa];
      if (limite === 0) return;

      const ultimoContacto = new Date(lead.fechaUltimoContacto);
      const diasSin = Math.floor((hoy.getTime() - ultimoContacto.getTime()) / (1000 * 60 * 60 * 24));

      if (diasSin >= limite) {
        let nivel: RecordatorioCRM['nivel'] = 'info';
        if (diasSin >= limite * 2) nivel = 'critical';
        else if (diasSin >= Math.floor(limite * 1.5)) nivel = 'warning';

        recordatorios.push({
          id: `REC-${lead.id}`,
          leadId: lead.id,
          leadNombre: lead.nombre,
          etapa: lead.etapa,
          diasSinActividad: diasSin,
          limiteEtapa: limite,
          abogadoAsignado: lead.abogadoAsignado,
          nivel,
        });
      }
    });

    return recordatorios.sort((a, b) => {
      const order = { critical: 0, warning: 1, info: 2 };
      return order[a.nivel] - order[b.nivel];
    });
  }

  async convertirACliente(leadId: string, crearExpediente: boolean): Promise<ConversionResult | undefined> {
    await new Promise(r => setTimeout(r, 500));
    const lead = this.leads.find(l => l.id === leadId);
    if (!lead) return undefined;

    lead.etapa = 'ganado';
    lead.probabilidad = 100;
    lead.diasEnEtapa = 0;

    const result: ConversionResult = {
      clienteId: `CLI-${Date.now()}`,
      nombre: lead.nombre,
    };

    if (crearExpediente) {
      result.expedienteId = `EXP-2026-${String(Math.floor(Math.random() * 900) + 100)}`;
    }

    return result;
  }
}

export const crmService = new CRMService();

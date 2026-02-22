import type {
  Turno,
  Guardia,
  ActuacionOficio,
  AbogadoOficio,
  PartidoJudicial,
  ConfiguracionTurnos,
  TipoTurno,
  TipoActuacion,
  EstadoTurno,
  EstadisticasOficio,
} from '@/types/oficio';

const turnosMock: Turno[] = [
  {
    id: 'TURNO-001',
    tipo: 'penal',
    partidoJudicial: 'Madrid',
    fechaInicio: '2026-02-24',
    fechaFin: '2026-02-28',
    abogadoId: 'ABG-001',
    abogadoNombre: 'María González',
    estado: 'confirmado',
  },
  {
    id: 'TURNO-002',
    tipo: 'civil',
    partidoJudicial: 'Madrid',
    fechaInicio: '2026-02-24',
    fechaFin: '2026-02-28',
    abogadoId: 'ABG-002',
    abogadoNombre: 'Carlos Ruiz',
    estado: 'asignado',
  },
  {
    id: 'TURNO-003',
    tipo: 'extranjeria',
    partidoJudicial: 'Madrid',
    fechaInicio: '2026-03-01',
    fechaFin: '2026-03-07',
    abogadoId: 'ABG-003',
    abogadoNombre: 'Ana López',
    estado: 'asignado',
  },
  {
    id: 'TURNO-004',
    tipo: 'violencia_genero',
    partidoJudicial: 'Madrid',
    fechaInicio: '2026-03-01',
    fechaFin: '2026-03-07',
    abogadoId: 'ABG-001',
    abogadoNombre: 'María González',
    estado: 'asignado',
  },
  {
    id: 'TURNO-005',
    tipo: 'menores',
    partidoJudicial: 'Madrid',
    fechaInicio: '2026-03-03',
    fechaFin: '2026-03-07',
    abogadoId: 'ABG-004',
    abogadoNombre: 'Pedro Sánchez',
    estado: 'asignado',
  },
];

const guardiasMock: Guardia[] = [
  {
    id: 'GUARD-001',
    turnoId: 'TURNO-001',
    fecha: '2026-02-24',
    horaInicio: '08:00',
    horaFin: '20:00',
    tipo: 'presencial',
    confirmada: true,
  },
  {
    id: 'GUARD-002',
    turnoId: 'TURNO-001',
    fecha: '2026-02-25',
    horaInicio: '20:00',
    horaFin: '08:00',
    tipo: 'localizable',
    confirmada: true,
  },
  {
    id: 'GUARD-003',
    turnoId: 'TURNO-002',
    fecha: '2026-02-24',
    horaInicio: '09:00',
    horaFin: '14:00',
    tipo: 'presencial',
    confirmada: false,
  },
];

const actuacionesMock: ActuacionOficio[] = [
  {
    id: 'ACT-OF-001',
    turnoId: 'TURNO-001',
    tipoActuacion: 'detenido',
    juzgado: 'Juzgado de Guardia Madrid',
    numeroProcedimiento: '0001234/2026',
    fecha: '2026-02-20',
    horaInicio: '10:30',
    horaFin: '12:45',
    detenidoNombre: 'Juan Martínez Pérez',
    delito: 'Robo con violencia',
    resultado: 'Declaración prestada. Solicitud de habeas corpus denegada.',
    importe: 150.50,
    Facturada: true,
  },
  {
    id: 'ACT-OF-002',
    turnoId: 'TURNO-001',
    tipoActuacion: 'orden_proteccion',
    Juzgado: 'Juzgado de Violencia de Género nº 1',
    numeroProcedimiento: '0005678/2026',
    fecha: '2026-02-19',
    horaInicio: '16:00',
    horaFin: '17:30',
    detenidoNombre: 'Carlos García',
    delito: 'Malos tratos',
    resultado: 'Orden de protección concedida.',
    importe: 120.75,
    Facturada: true,
  },
  {
    id: 'ACT-OF-003',
    turnoId: 'TURNO-002',
    tipoActuacion: 'asistencia_detencion',
    Juzgado: 'Comisaría del distrito Centro',
    numeroProcedimiento: '0009012/2026',
    fecha: '2026-02-21',
    horaInicio: '22:00',
    horaFin: '23:15',
    detenidoNombre: 'Miguel Torres',
    delito: 'Conducción bajo efectos del alcohol',
    resultado: 'Declaración prestada.wickets comparison.',
    importe: 89.25,
    Facturada: false,
  },
  {
    id: 'ACT-OF-004',
    turnoId: 'TURNO-001',
    tipoActuacion: 'juicio_rapido',
    Juzgado: 'Juzgado de lo Penal nº 3',
    numeroProcedimiento: '0003456/2026',
    fecha: '2026-02-18',
    horaInicio: '09:00',
    horaFin: '10:30',
    resultado: 'Juicio celebrado. Sentencia en 15 días.',
    importe: 200.00,
    Facturada: true,
  },
];

const abogadosMock: AbogadoOficio[] = [
  { id: 'ABG-001', nombre: 'María González', numeroColegiado: '12345', TurnosInscritos: ['penal', 'violencia_genero'], disponibilidad: true },
  { id: 'ABG-002', nombre: 'Carlos Ruiz', numeroColegiado: '23456', TurnosInscritos: ['civil', 'extranjeria'], disponibilidad: true },
  { id: 'ABG-003', nombre: 'Ana López', numeroColegiado: '34567', TurnosInscritos: ['extranjeria', 'menores'], disponibilidad: true },
  { id: 'ABG-004', nombre: 'Pedro Sánchez', numeroColegiado: '45678', TurnosInscritos: ['menores', 'civil'], disponibilidad: false },
  { id: 'ABG-005', nombre: 'Laura Fernández', numeroColegiado: '56789', TurnosInscritos: ['penal'], disponibilidad: true },
];

const partidosJudicialesMock: PartidoJudicial[] = [
  { id: 'PJ-001', nombre: 'Madrid', provincia: 'Madrid', turnosDisponibles: ['penal', 'civil', 'extranjeria', 'violencia_genero', 'menores'] },
  { id: 'PJ-002', nombre: 'Alcalá de Henares', provincia: 'Madrid', turnosDisponibles: ['penal', 'civil', 'extranjeria'] },
  { id: 'PJ-003', nombre: 'Getafe', provincia: 'Madrid', turnosDisponibles: ['penal', 'civil'] },
  { id: 'PJ-004', nombre: 'Móstoles', provincia: 'Madrid', turnosDisponibles: ['penal', 'civil', 'violencia_genero'] },
];

class OficioService {
  private turnos: Turno[] = [...turnosMock];
  private guardias: Guardia[] = [...guardiasMock];
  private actuaciones: ActuacionOficio[] = [...actuacionesMock];
  private config: ConfiguracionTurnos = {
    partidoJudicial: 'Madrid',
    rotacionAutomatica: true,
    frecuenciaRotacion: 'semanal',
    incompatibleConsecutivas: true,
    alertaHorasAntes: 24,
  };

  async getTurnos(): Promise<Turno[]> {
    await new Promise(r => setTimeout(r, 400));
    return [...this.turnos];
  }

  async getTurnoById(id: string): Promise<Turno | undefined> {
    await new Promise(r => setTimeout(r, 200));
    return this.turnos.find(t => t.id === id);
  }

  async getTurnosPorAbogado(abogadoId: string): Promise<Turno[]> {
    await new Promise(r => setTimeout(r, 300));
    return this.turnos.filter(t => t.abogadoId === abogadoId);
  }

  async getTurnosPorFecha(fecha: string): Promise<Turno[]> {
    await new Promise(r => setTimeout(r, 300));
    return this.turnos.filter(t => fecha >= t.fechaInicio && fecha <= t.fechaFin);
  }

  async createTurno(data: Omit<Turno, 'id' | 'estado'>): Promise<Turno> {
    await new Promise(r => setTimeout(r, 400));
    const nuevoTurno: Turno = {
      ...data,
      id: `TURNO-${String(this.turnos.length + 1).padStart(3, '0')}`,
      estado: 'asignado',
    };
    this.turnos.push(nuevoTurno);
    return nuevoTurno;
  }

  async updateTurnoEstado(turnoId: string, estado: EstadoTurno): Promise<Turno | undefined> {
    await new Promise(r => setTimeout(r, 300));
    const turno = this.turnos.find(t => t.id === turnoId);
    if (turno) {
      turno.estado = estado;
    }
    return turno;
  }

  async asignarAbogado(turnoId: string, abogadoId: string, abogadoNombre: string): Promise<Turno | undefined> {
    await new Promise(r => setTimeout(r, 300));
    const turno = this.turnos.find(t => t.id === turnoId);
    if (turno) {
      turno.abogadoId = abogadoId;
      turno.abogadoNombre = abogadoNombre;
    }
    return turno;
  }

  async getGuardias(): Promise<Guardia[]> {
    await new Promise(r => setTimeout(r, 300));
    return [...this.guardias];
  }

  async getGuardiasPorTurno(turnoId: string): Promise<Guardia[]> {
    await new Promise(r => setTimeout(r, 200));
    return this.guardias.filter(g => g.turnoId === turnoId);
  }

  async createGuardia(data: Omit<Guardia, 'id'>): Promise<Guardia> {
    await new Promise(r => setTimeout(r, 300));
    const nuevaGuardia: Guardia = {
      ...data,
      id: `GUARD-${String(this.guardias.length + 1).padStart(3, '0')}`,
    };
    this.guardias.push(nuevaGuardia);
    return nuevaGuardia;
  }

  async confirmarGuardia(guardiaId: string): Promise<Guardia | undefined> {
    await new Promise(r => setTimeout(r, 200));
    const guardia = this.guardias.find(g => g.id === guardiaId);
    if (guardia) {
      guardia.confirmada = true;
    }
    return guardia;
  }

  async getActuaciones(): Promise<ActuacionOficio[]> {
    await new Promise(r => setTimeout(r, 400));
    return [...this.actuaciones].reverse();
  }

  async getActuacionesPorTurno(turnoId: string): Promise<ActuacionOficio[]> {
    await new Promise(r => setTimeout(r, 200));
    return this.actuaciones.filter(a => a.turnoId === turnoId);
  }

  async createActuacion(data: Omit<ActuacionOficio, 'id'>): Promise<ActuacionOficio> {
    await new Promise(r => setTimeout(r, 400));
    const nuevaActuacion: ActuacionOficio = {
      ...data,
      id: `ACT-OF-${String(this.actuaciones.length + 1).padStart(3, '0')}`,
    };
    this.actuaciones.push(nuevaActuacion);
    return nuevaActuacion;
  }

  async getAbogados(): Promise<AbogadoOficio[]> {
    await new Promise(r => setTimeout(r, 300));
    return [...abogadosMock];
  }

  async getPartidosJudiciales(): Promise<PartidoJudicial[]> {
    await new Promise(r => setTimeout(r, 200));
    return [...partidosJudicialesMock];
  }

  async getConfiguracion(): Promise<ConfiguracionTurnos> {
    await new Promise(r => setTimeout(r, 200));
    return { ...this.config };
  }

  async updateConfig(config: Partial<ConfiguracionTurnos>): Promise<ConfiguracionTurnos> {
    await new Promise(r => setTimeout(r, 300));
    this.config = { ...this.config, ...config };
    return { ...this.config };
  }

  async getEstadisticas(): Promise<EstadisticasOficio> {
    await new Promise(r => setTimeout(r, 400));
    const actuaciones = this.actuaciones;
    const ahora = new Date();
    const inicioMes = new Date(ahora.getFullYear(), ahora.getMonth(), 1).toISOString().split('T')[0];

    const actuacionesPorTipo = {} as Record<TipoActuacion, number>;
    const actuacionesPorAbogado = {} as Record<string, number>;

    let ingresosTotales = 0;
    let horasTotales = 0;

    const actuacionesPorMesMap = {} as Record<string, number>;
    const ingresosPorMesMap = {} as Record<string, number>;
    const horasPorMesMap = {} as Record<string, number>;
    const delitosMap = {} as Record<string, number>;
    const JuzgadosMap = {} as Record<string, number>;

    const meses = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];

    actuaciones.forEach(a => {
      actuacionesPorTipo[a.tipoActuacion] = (actuacionesPorTipo[a.tipoActuacion] || 0) + 1;
      
      const turno = this.turnos.find(t => t.id === a.turnoId);
      if (turno) {
        actuacionesPorAbogado[turno.abogadoNombre] = (actuacionesPorAbogado[turno.abogadoNombre] || 0) + 1;
      }

      if (a.importe) {
        ingresosTotales += a.importe;
        const mes = meses[new Date(a.fecha).getMonth()];
        ingresosPorMesMap[mes] = (ingresosPorMesMap[mes] || 0) + a.importe;
      }

      const [h1, m1] = a.horaInicio.split(':').map(Number);
      const [h2, m2] = a.horaFin.split(':').map(Number);
      const duracion = (h2 + m2 / 60) - (h1 + m1 / 60);
      horasTotales += duracion;

      const mes = meses[new Date(a.fecha).getMonth()];
      actuacionesPorMesMap[mes] = (actuacionesPorMesMap[mes] || 0) + 1;
      horasPorMesMap[mes] = (horasPorMesMap[mes] || 0) + duracion;

      if (a.delito) {
        delitosMap[a.delito] = (delitosMap[a.delito] || 0) + 1;
      }

      JuzgadosMap[a.juzgado] = (JuzgadosMap[a.juzgado] || 0) + 1;
    });

    const actuacionesPorMes = meses.map(mes => ({
      mes,
      cantidad: actuacionesPorMesMap[mes] || 0,
    }));

    const ingresosPorMes = meses.map(mes => ({
      mes,
      importe: Math.round((ingresosPorMesMap[mes] || 0) * 100) / 100,
    }));

    const horasPorMes = meses.map(mes => ({
      mes,
      horas: Math.round((horasPorMesMap[mes] || 0) * 10) / 10,
    }));

    const tiposDelitoMasFrecuentes = Object.entries(delitosMap)
      .map(([delito, cantidad]) => ({ delito, cantidad }))
      .sort((a, b) => b.cantidad - a.cantidad)
      .slice(0, 5);

    const jailsMasActivos = Object.entries(JuzgadosMap)
      .map(([juzgado, cantidad]) => ({ juzgado, cantidad }))
      .sort((a, b) => b.cantidad - a.cantidad)
      .slice(0, 5);

    return {
      totalActuaciones: actuaciones.length,
      actuacionesEsteMes: actuaciones.filter(a => a.fecha >= inicioMes).length,
      ingresosOficio: Math.round(ingresosTotales * 100) / 100,
      horasDedicadas: Math.round(horasTotales * 10) / 10,
      actuacionesPorTipo,
      actuacionesPorAbogado,
      actuacionesPorMes,
      ingresosPorMes,
      tiposDelitoMasFrecuentes,
      jailsMasActivos,
      comparacionIngresos: {
        oficio: Math.round(ingresosTotales * 100) / 100,
        privado: Math.round(ingresosTotales * 2.3 * 100) / 100,
      },
      horasPorMes,
    };
  }

  async swapTurnos(turnoId1: string, turnoId2: string): Promise<Turno[] | undefined> {
    await new Promise(r => setTimeout(r, 300));
    const t1 = this.turnos.find(t => t.id === turnoId1);
    const t2 = this.turnos.find(t => t.id === turnoId2);
    
    if (t1 && t2) {
      const tempAbogadoId = t1.abogadoId;
      const tempAbogadoNombre = t1.abogadoNombre;
      t1.abogadoId = t2.abogadoId;
      t1.abogadoNombre = t2.abogadoNombre;
      t2.abogadoId = tempAbogadoId;
      t2.abogadoNombre = tempAbogadoNombre;
      return [t1, t2];
    }
    return undefined;
  }
}

export const oficioService = new OficioService();

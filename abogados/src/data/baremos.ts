export interface BaremoItem {
  id: string;
  codigo: string;
  descripcion: string;
  tipoActuacion: string;
  importe: number;
  unidad: 'actuacion' | 'hora' | 'dia';
}

export interface BaremoCCAA {
  comunidad: string;
  ano: number;
  items: BaremoItem[];
}

export const BAREMOS_MADRIL: BaremoCCAA = {
  comunidad: 'Comunidad de Madrid',
  ano: 2026,
  items: [
    { id: 'BM-001', codigo: 'A.1.1', descripcion: 'Asistencia a detenido', tipoActuacion: 'detenido', importe: 150.50, unidad: 'actuacion' },
    { id: 'BM-002', codigo: 'A.1.2', descripcion: 'Declaración de detenido', tipoActuacion: 'declaracion', importe: 120.75, unidad: 'actuacion' },
    { id: 'BM-003', codigo: 'A.1.3', descripcion: 'Asistencia a juicio rápido', tipoActuacion: 'juicio_rapido', importe: 200.00, unidad: 'actuacion' },
    { id: 'BM-004', codigo: 'A.1.4', descripcion: 'Orden de protección', tipoActuacion: 'orden_proteccion', importe: 120.75, unidad: 'actuacion' },
    { id: 'BM-005', codigo: 'A.1.5', descripcion: 'Reconocimiento de testigo', tipoActuacion: 'reconocimiento', importe: 89.25, unidad: 'actuacion' },
    { id: 'BM-006', codigo: 'A.1.6', descripcion: 'Recursos de apelación', tipoActuacion: 'recursos', importe: 180.50, unidad: 'actuacion' },
    { id: 'BM-007', codigo: 'A.2.1', descripcion: 'Guardia presencial (8h)', tipoActuacion: 'guardia', importe: 250.00, unidad: 'dia' },
    { id: 'BM-008', codigo: 'A.2.2', descripcion: 'Guardia localizable (24h)', tipoActuacion: 'guardia', importe: 180.00, unidad: 'dia' },
    { id: 'BM-009', codigo: 'B.1.1', descripcion: 'Asistencia en procedimiento civil', tipoActuacion: 'asistencia_civil', importe: 95.25, unidad: 'actuacion' },
    { id: 'BM-010', codigo: 'B.1.2', descripcion: 'Representación en juicio', tipoActuacion: 'juicio_civil', importe: 175.50, unidad: 'actuacion' },
    { id: 'BM-011', codigo: 'C.1.1', descripcion: 'Asistencia a extranjero en retención', tipoActuacion: 'extranjeria', importe: 165.00, unidad: 'actuacion' },
    { id: 'BM-012', codigo: 'C.1.2', descripcion: 'Recurso against deportation', tipoActuacion: 'extranjeria', importe: 210.75, unidad: 'actuacion' },
    { id: 'BM-013', codigo: 'D.1.1', descripcion: 'Asistencia a víctima de VG', tipoActuacion: 'violencia_genero', importe: 145.25, unidad: 'actuacion' },
    { id: 'BM-014', codigo: 'D.1.2', descripcion: 'Seguimiento caso VG', tipoActuacion: 'violencia_genero', importe: 85.00, unidad: 'actuacion' },
    { id: 'BM-015', codigo: 'E.1.1', descripcion: 'Asistencia a menor', tipoActuacion: 'menores', importe: 175.50, unidad: 'actuacion' },
    { id: 'BM-016', codigo: 'E.1.2', descripcion: 'Declaración de menor', tipoActuacion: 'menores', importe: 145.25, unidad: 'actuacion' },
  ],
};

export const BAREMOS_ANDALUCIA: BaremoCCAA = {
  comunidad: 'Andalucía',
  ano: 2026,
  items: [
    { id: 'BA-001', codigo: 'A.1.1', descripcion: 'Asistencia a detenido', tipoActuacion: 'detenido', importe: 145.00, unidad: 'actuacion' },
    { id: 'BA-002', codigo: 'A.1.2', descripcion: 'Declaración de detenido', tipoActuacion: 'declaracion', importe: 115.50, unidad: 'actuacion' },
    { id: 'BA-003', codigo: 'A.1.3', descripcion: 'Asistencia a juicio rápido', tipoActuacion: 'juicio_rapido', importe: 190.00, unidad: 'actuacion' },
    { id: 'BA-004', codigo: 'A.1.4', descripcion: 'Orden de protección', tipoActuacion: 'orden_proteccion', importe: 115.50, unidad: 'actuacion' },
    { id: 'BA-005', codigo: 'A.1.5', descripcion: 'Reconocimiento de testigo', tipoActuacion: 'reconocimiento', importe: 85.75, unidad: 'actuacion' },
    { id: 'BA-006', codigo: 'A.1.6', descripcion: 'Recursos de apelación', tipoActuacion: 'recursos', importe: 175.00, unidad: 'actuacion' },
    { id: 'BA-007', codigo: 'A.2.1', descripcion: 'Guardia presencial (8h)', tipoActuacion: 'guardia', importe: 240.00, unidad: 'dia' },
    { id: 'BA-008', codigo: 'A.2.2', descripcion: 'Guardia localizable (24h)', tipoActuacion: 'guardia', importe: 175.00, unidad: 'dia' },
    { id: 'BA-009', codigo: 'B.1.1', descripcion: 'Asistencia en procedimiento civil', tipoActuacion: 'asistencia_civil', importe: 90.25, unidad: 'actuacion' },
    { id: 'BA-010', codigo: 'B.1.2', descripcion: 'Representación en juicio', tipoActuacion: 'juicio_civil', importe: 170.00, unidad: 'actuacion' },
    { id: 'BA-011', codigo: 'C.1.1', descripcion: 'Asistencia a extranjero en retención', tipoActuacion: 'extranjeria', importe: 160.00, unidad: 'actuacion' },
    { id: 'BA-012', codigo: 'C.1.2', descripcion: 'Recurso contra deportación', tipoActuacion: 'extranjeria', importe: 205.00, unidad: 'actuacion' },
    { id: 'BA-013', codigo: 'D.1.1', descripcion: 'Asistencia a víctima de VG', tipoActuacion: 'violencia_genero', importe: 140.00, unidad: 'actuacion' },
    { id: 'BA-014', codigo: 'D.1.2', descripcion: 'Seguimiento caso VG', tipoActuacion: 'violencia_genero', importe: 80.00, unidad: 'actuacion' },
    { id: 'BA-015', codigo: 'E.1.1', descripcion: 'Asistencia a menor', tipoActuacion: 'menores', importe: 170.00, unidad: 'actuacion' },
    { id: 'BA-016', codigo: 'E.1.2', descripcion: 'Declaración de menor', tipoActuacion: 'menores', importe: 140.00, unidad: 'actuacion' },
  ],
};

export const BAREMOS_CATALUNA: BaremoCCAA = {
  comunidad: 'Cataluña',
  ano: 2026,
  items: [
    { id: 'BC-001', codigo: 'A.1.1', descripcion: 'Assistencia a detingut', tipoActuacion: 'detenido', importe: 160.00, unidad: 'actuacion' },
    { id: 'BC-002', codigo: 'A.1.2', descripcion: 'Declaració de detingut', tipoActuacion: 'declaracion', importe: 130.25, unidad: 'actuacion' },
    { id: 'BC-003', codigo: 'A.1.3', descripcion: 'Assistencia a judici ràpid', tipoActuacion: 'juicio_rapido', importe: 215.00, unidad: 'actuacion' },
    { id: 'BC-004', codigo: 'A.1.4', descripcion: 'Ordre de protecció', tipoActuacion: 'orden_proteccion', importe: 130.25, unidad: 'actuacion' },
    { id: 'BC-005', codigo: 'A.1.5', descripcion: 'Reconeixement de testimoni', tipoActuacion: 'reconocimiento', importe: 95.00, unidad: 'actuacion' },
    { id: 'BC-006', codigo: 'A.1.6', descripcion: 'Recurs d\'apel·lació', tipoActuacion: 'recursos', importe: 195.00, unidad: 'actuacion' },
    { id: 'BC-007', codigo: 'A.2.1', descripcion: 'Guàrdia presencial (8h)', tipoActuacion: 'guardia', importe: 265.00, unidad: 'dia' },
    { id: 'BC-008', codigo: 'A.2.2', descripcion: 'Guàrdia localitzable (24h)', tipoActuacion: 'guardia', importe: 190.00, unidad: 'dia' },
    { id: 'BC-009', codigo: 'B.1.1', descripcion: 'Assistència en procediment civil', tipoActuacion: 'asistencia_civil', importe: 100.00, unidad: 'actuacion' },
    { id: 'BC-010', codigo: 'B.1.2', descripcion: 'Representació en judici', tipoActuacion: 'juicio_civil', importe: 185.00, unidad: 'actuacion' },
    { id: 'BC-011', codigo: 'C.1.1', descripcion: 'Assistència a estranger en retenció', tipoActuacion: 'extranjeria', importe: 175.00, unidad: 'actuacion' },
    { id: 'BC-012', codigo: 'C.1.2', descripcion: 'Recurs contra deportació', tipoActuacion: 'extranjeria', importe: 220.00, unidad: 'actuacion' },
    { id: 'BC-013', codigo: 'D.1.1', descripcion: 'Assistència a víctima de VG', tipoActuacion: 'violencia_genero', importe: 155.00, unidad: 'actuacion' },
    { id: 'BC-014', codigo: 'D.1.2', descripcion: 'Seguiment cas VG', tipoActuacion: 'violencia_genero', importe: 90.00, unidad: 'actuacion' },
    { id: 'BC-015', codigo: 'E.1.1', descripcion: 'Assistència a menor', tipoActuacion: 'menores', importe: 185.00, unidad: 'actuacion' },
    { id: 'BC-016', codigo: 'E.1.2', descripcion: 'Declaració de menor', tipoActuacion: 'menores', importe: 155.00, unidad: 'actuacion' },
  ],
};

export const BAREMOS_VALENCIA: BaremoCCAA = {
  comunidad: 'Comunidad Valenciana',
  ano: 2026,
  items: [
    { id: 'BV-001', codigo: 'A.1.1', descripcion: 'Asistencia a detenido', tipoActuacion: 'detenido', importe: 152.00, unidad: 'actuacion' },
    { id: 'BV-002', codigo: 'A.1.2', descripcion: 'Declaración de detenido', tipoActuacion: 'declaracion', importe: 122.00, unidad: 'actuacion' },
    { id: 'BV-003', codigo: 'A.1.3', descripcion: 'Asistencia a juicio rápido', tipoActuacion: 'juicio_rapido', importe: 205.00, unidad: 'actuacion' },
    { id: 'BV-004', codigo: 'A.1.4', descripcion: 'Orden de protección', tipoActuacion: 'orden_proteccion', importe: 122.00, unidad: 'actuacion' },
    { id: 'BV-005', codigo: 'A.1.5', descripcion: 'Reconocimiento de testigo', tipoActuacion: 'reconocimiento', importe: 90.00, unidad: 'actuacion' },
    { id: 'BV-006', codigo: 'A.1.6', descripcion: 'Recursos de apelación', tipoActuacion: 'recursos', importe: 182.00, unidad: 'actuacion' },
    { id: 'BV-007', codigo: 'A.2.1', descripcion: 'Guardia presencial (8h)', tipoActuacion: 'guardia', importe: 255.00, unidad: 'dia' },
    { id: 'BV-008', codigo: 'A.2.2', descripcion: 'Guardia localizable (24h)', tipoActuacion: 'guardia', importe: 185.00, unidad: 'dia' },
    { id: 'BV-009', codigo: 'B.1.1', descripcion: 'Asistencia en procedimiento civil', tipoActuacion: 'asistencia_civil', importe: 96.00, unidad: 'actuacion' },
    { id: 'BV-010', codigo: 'B.1.2', descripcion: 'Representación en juicio', tipoActuacion: 'juicio_civil', importe: 178.00, unidad: 'actuacion' },
    { id: 'BV-011', codigo: 'C.1.1', descripcion: 'Asistencia a extranjero en retención', tipoActuacion: 'extranjeria', importe: 168.00, unidad: 'actuacion' },
    { id: 'BV-012', codigo: 'C.1.2', descripcion: 'Recurso contra deportación', tipoActuacion: 'extranjeria', importe: 215.00, unidad: 'actuacion' },
    { id: 'BV-013', codigo: 'D.1.1', descripcion: 'Asistencia a víctima de VG', tipoActuacion: 'violencia_genero', importe: 148.00, unidad: 'actuacion' },
    { id: 'BV-014', codigo: 'D.1.2', descripcion: 'Seguimiento caso VG', tipoActuacion: 'violencia_genero', importe: 86.00, unidad: 'actuacion' },
    { id: 'BV-015', codigo: 'E.1.1', descripcion: 'Asistencia a menor', tipoActuacion: 'menores', importe: 178.00, unidad: 'actuacion' },
    { id: 'BV-016', codigo: 'E.1.2', descripcion: 'Declaración de menor', tipoActuacion: 'menores', importe: 148.00, unidad: 'actuacion' },
  ],
};

export const BAREMOS_GALICIA: BaremoCCAA = {
  comunidad: 'Galicia',
  ano: 2026,
  items: [
    { id: 'BG-001', codigo: 'A.1.1', descripcion: 'Asistencia a detenido', tipoActuacion: 'detenido', importe: 140.00, unidad: 'actuacion' },
    { id: 'BG-002', codigo: 'A.1.2', descripcion: 'Declaración de detenido', tipoActuacion: 'declaracion', importe: 110.00, unidad: 'actuacion' },
    { id: 'BG-003', codigo: 'A.1.3', descripcion: 'Asistencia a juicio rápido', tipoActuacion: 'juicio_rapido', importe: 185.00, unidad: 'actuacion' },
    { id: 'BG-004', codigo: 'A.1.4', descripcion: 'Orden de protección', tipoActuacion: 'orden_proteccion', importe: 110.00, unidad: 'actuacion' },
    { id: 'BG-005', codigo: 'A.1.5', descripcion: 'Reconocimiento de testigo', tipoActuacion: 'reconocimiento', importe: 80.00, unidad: 'actuacion' },
    { id: 'BG-006', codigo: 'A.1.6', descripcion: 'Recursos de apelación', tipoActuacion: 'recursos', importe: 170.00, unidad: 'actuacion' },
    { id: 'BG-007', codigo: 'A.2.1', descripcion: 'Guardia presencial (8h)', tipoActuacion: 'guardia', importe: 230.00, unidad: 'dia' },
    { id: 'BG-008', codigo: 'A.2.2', descripcion: 'Guardia localizable (24h)', tipoActuacion: 'guardia', importe: 165.00, unidad: 'dia' },
    { id: 'BG-009', codigo: 'B.1.1', descripcion: 'Asistencia en procedimiento civil', tipoActuacion: 'asistencia_civil', importe: 85.00, unidad: 'actuacion' },
    { id: 'BG-010', codigo: 'B.1.2', descripcion: 'Representación en juicio', tipoActuacion: 'juicio_civil', importe: 165.00, unidad: 'actuacion' },
    { id: 'BG-011', codigo: 'C.1.1', descripcion: 'Asistencia a extranjero en retención', tipoActuacion: 'extranjeria', importe: 155.00, unidad: 'actuacion' },
    { id: 'BG-012', codigo: 'C.1.2', descripcion: 'Recurso contra deportación', tipoActuacion: 'extranjeria', importe: 200.00, unidad: 'actuacion' },
    { id: 'BG-013', codigo: 'D.1.1', descripcion: 'Asistencia a víctima de VG', tipoActuacion: 'violencia_genero', importe: 135.00, unidad: 'actuacion' },
    { id: 'BG-014', codigo: 'D.1.2', descripcion: 'Seguimiento caso VG', tipoActuacion: 'violencia_genero', importe: 75.00, unidad: 'actuacion' },
    { id: 'BG-015', codigo: 'E.1.1', descripcion: 'Asistencia a menor', tipoActuacion: 'menores', importe: 165.00, unidad: 'actuacion' },
    { id: 'BG-016', codigo: 'E.1.2', descripcion: 'Declaración de menor', tipoActuacion: 'menores', importe: 135.00, unidad: 'actuacion' },
  ],
};

export const BAREMOS_PAIS_VASCO: BaremoCCAA = {
  comunidad: 'País Vasco',
  ano: 2026,
  items: [
    { id: 'BP-001', codigo: 'A.1.1', descripcion: 'Atxilotuaren laguntza', tipoActuacion: 'detenido', importe: 165.00, unidad: 'actuacion' },
    { id: 'BP-002', codigo: 'A.1.2', descripcion: 'Atxilotuaren adierazpena', tipoActuacion: 'declaracion', importe: 135.00, unidad: 'actuacion' },
    { id: 'BP-003', codigo: 'A.1.3', descripcion: 'Epaiketa azkarrean laguntza', tipoActuacion: 'juicio_rapido', importe: 220.00, unidad: 'actuacion' },
    { id: 'BP-004', codigo: 'A.1.4', descripcion: 'Babes agindua', tipoActuacion: 'orden_proteccion', importe: 135.00, unidad: 'actuacion' },
    { id: 'BP-005', codigo: 'A.1.5', descripcion: 'Testigantza ezagutzea', tipoActuacion: 'reconocimiento', importe: 100.00, unidad: 'actuacion' },
    { id: 'BP-006', codigo: 'A.1.6', descripcion: 'Apelazio baliabideak', tipoActuacion: 'recursos', importe: 200.00, unidad: 'actuacion' },
    { id: 'BP-007', codigo: 'A.2.1', descripcion: 'Zaintza presentziala (8h)', tipoActuacion: 'guardia', importe: 275.00, unidad: 'dia' },
    { id: 'BP-008', codigo: 'A.2.2', descripcion: 'Zaintza eskuragarria (24h)', tipoActuacion: 'guardia', importe: 200.00, unidad: 'dia' },
    { id: 'BP-009', codigo: 'B.1.1', descripcion: 'Prozedura zibilean laguntza', tipoActuacion: 'asistencia_civil', importe: 105.00, unidad: 'actuacion' },
    { id: 'BP-010', codigo: 'B.1.2', descripcion: 'Epaiketan ordezkaritza', tipoActuacion: 'juicio_civil', importe: 190.00, unidad: 'actuacion' },
    { id: 'BP-011', codigo: 'C.1.1', descripcion: 'Atxilotutako atzerritarrari laguntza', tipoActuacion: 'extranjeria', importe: 180.00, unidad: 'actuacion' },
    { id: 'BP-012', codigo: 'C.1.2', descripcion: 'Deportazioaren aurkako errekurtsoa', tipoActuacion: 'extranjeria', importe: 230.00, unidad: 'actuacion' },
    { id: 'BP-013', codigo: 'D.1.1', descripcion: 'GB biktimari laguntza', tipoActuacion: 'violencia_genero', importe: 160.00, unidad: 'actuacion' },
    { id: 'BP-014', codigo: 'D.1.2', descripcion: 'GB kasuaren jarraipena', tipoActuacion: 'violencia_genero', importe: 95.00, unidad: 'actuacion' },
    { id: 'BP-015', codigo: 'E.1.1', descripcion: 'Adingabeari laguntza', tipoActuacion: 'menores', importe: 190.00, unidad: 'actuacion' },
    { id: 'BP-016', codigo: 'E.1.2', descripcion: 'Adingabearen adierazpena', tipoActuacion: 'menores', importe: 160.00, unidad: 'actuacion' },
  ],
};

export const BAREMOS_CASTILLA_LEON: BaremoCCAA = {
  comunidad: 'Castilla y León',
  ano: 2026,
  items: [
    { id: 'BCL-001', codigo: 'A.1.1', descripcion: 'Asistencia a detenido', tipoActuacion: 'detenido', importe: 138.00, unidad: 'actuacion' },
    { id: 'BCL-002', codigo: 'A.1.2', descripcion: 'Declaración de detenido', tipoActuacion: 'declaracion', importe: 108.00, unidad: 'actuacion' },
    { id: 'BCL-003', codigo: 'A.1.3', descripcion: 'Asistencia a juicio rápido', tipoActuacion: 'juicio_rapido', importe: 182.00, unidad: 'actuacion' },
    { id: 'BCL-004', codigo: 'A.1.4', descripcion: 'Orden de protección', tipoActuacion: 'orden_proteccion', importe: 108.00, unidad: 'actuacion' },
    { id: 'BCL-005', codigo: 'A.1.5', descripcion: 'Reconocimiento de testigo', tipoActuacion: 'reconocimiento', importe: 78.00, unidad: 'actuacion' },
    { id: 'BCL-006', codigo: 'A.1.6', descripcion: 'Recursos de apelación', tipoActuacion: 'recursos', importe: 168.00, unidad: 'actuacion' },
    { id: 'BCL-007', codigo: 'A.2.1', descripcion: 'Guardia presencial (8h)', tipoActuacion: 'guardia', importe: 225.00, unidad: 'dia' },
    { id: 'BCL-008', codigo: 'A.2.2', descripcion: 'Guardia localizable (24h)', tipoActuacion: 'guardia', importe: 160.00, unidad: 'dia' },
    { id: 'BCL-009', codigo: 'B.1.1', descripcion: 'Asistencia en procedimiento civil', tipoActuacion: 'asistencia_civil', importe: 82.00, unidad: 'actuacion' },
    { id: 'BCL-010', codigo: 'B.1.2', descripcion: 'Representación en juicio', tipoActuacion: 'juicio_civil', importe: 162.00, unidad: 'actuacion' },
    { id: 'BCL-011', codigo: 'C.1.1', descripcion: 'Asistencia a extranjero en retención', tipoActuacion: 'extranjeria', importe: 152.00, unidad: 'actuacion' },
    { id: 'BCL-012', codigo: 'C.1.2', descripcion: 'Recurso contra deportación', tipoActuacion: 'extranjeria', importe: 195.00, unidad: 'actuacion' },
    { id: 'BCL-013', codigo: 'D.1.1', descripcion: 'Asistencia a víctima de VG', tipoActuacion: 'violencia_genero', importe: 132.00, unidad: 'actuacion' },
    { id: 'BCL-014', codigo: 'D.1.2', descripcion: 'Seguimiento caso VG', tipoActuacion: 'violencia_genero', importe: 72.00, unidad: 'actuacion' },
    { id: 'BCL-015', codigo: 'E.1.1', descripcion: 'Asistencia a menor', tipoActuacion: 'menores', importe: 162.00, unidad: 'actuacion' },
    { id: 'BCL-016', codigo: 'E.1.2', descripcion: 'Declaración de menor', tipoActuacion: 'menores', importe: 132.00, unidad: 'actuacion' },
  ],
};

export const BAREMOS_CCAA: BaremoCCAA[] = [
  BAREMOS_MADRIL, 
  BAREMOS_ANDALUCIA, 
  BAREMOS_CATALUNA,
  BAREMOS_VALENCIA,
  BAREMOS_GALICIA,
  BAREMOS_PAIS_VASCO,
  BAREMOS_CASTILLA_LEON
];

export function getBaremoPorCCAA(comunidad: string): BaremoCCAA | undefined {
  return BAREMOS_CCAA.find(b => b.comunidad.toLowerCase().includes(comunidad.toLowerCase()));
}

export function calcularImporte(tipoActuacion: string, comunidad: string = 'Madrid'): number {
  const baremo = getBaremoPorCCAA(comunidad);
  const item = baremo?.items.find(i => i.tipoActuacion === tipoActuacion);
  return item?.importe || 0;
}

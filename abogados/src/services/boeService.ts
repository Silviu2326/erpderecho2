/**
 * Servicio de integración con la API del BOE (Boletín Oficial del Estado)
 * 
 * Documentación: https://datos.gob.es/es/catalogo/e047d6e9-2166-4ed5-9356-0f5f7b2c6e3e
 * API: https://www.boe.es/datosabiertos/api/
 * 
 * NOTA: Este archivo contiene implementación MOCK para desarrollo frontend.
 * Para producción, configurar las credenciales reales en variables de entorno:
 * - VITE_BOE_API_KEY: Clave API del BOE
 */

import type {
  BoeDocumento,
  BoeSearchResponse,
  BoeDocumentoCompleto,
  BoeMetadatos,
  BoeTexto,
  BoeRelaciones,
  BoeDocumentoResumen,
  Materia,
} from '@/types/legislacion';

const CONFIG = {
  USE_MOCK: true,
  MOCK_DELAY: 300,
  PAGE_SIZE: 20,
  BASE_URL: 'https://www.boe.es/datosabiertos/api',
};

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

const MOCK_BOE_DOCUMENTS: BoeDocumento[] = [
  {
    id: 'BOE-A-2026-2345',
    tipo: 'disposicion',
    titulo: 'Real Decreto-ley 3/2026, de 20 de febrero, por el que se adoptan medidas urgentes en materia de eficiencia judicial',
    resumen: 'Se establecen medidas urgentes para la optimización de los recursos judiciales y la agilización de los procedimientos en el ámbito de la Administración de Justicia.',
    materia: 'procesal',
    fechaPublicacion: new Date('2026-02-21'),
    fechaEntradaVigor: new Date('2026-02-22'),
    vigencia: 'vigente',
    organismoEmisor: 'gobierno',
    urlPdf: 'https://www.boe.es/boe/dias/2026/02/21/pdfs/BOE-A-2026-2345.pdf',
    urlHtml: 'https://www.boe.es/buscar/doc.php?id=BOE-A-2026-2345',
    diarioOficial: 'BOE',
    numeroDiario: '42',
    paginaInicio: 15234,
    seccion: 'I',
    apartado: 'I. Disposiciones generales',
    departamento: 'Ministerio de Justicia',
    palabrasClave: ['justicia', 'procedimiento', 'eficiencia', 'recursos judiciales'],
    numeroLegislacion: '3/2026',
  },
  {
    id: 'BOE-A-2026-1890',
    tipo: 'disposicion',
    titulo: 'Ley 1/2026, de 28 de enero, de protección integral de las personas mayores',
    resumen: 'Ley integral para la protección de los derechos de las personas mayores, estableciendo medidas de protección social, sanitaria y jurídica.',
    materia: 'civil',
    fechaPublicacion: new Date('2026-01-29'),
    fechaEntradaVigor: new Date('2026-02-01'),
    vigencia: 'vigente',
    organismoEmisor: 'cortes_generales',
    urlPdf: 'https://www.boe.es/boe/dias/2026/01/29/pdfs/BOE-A-2026-1890.pdf',
    urlHtml: 'https://www.boe.es/buscar/doc.php?id=BOE-A-2026-1890',
    diarioOficial: 'BOE',
    numeroDiario: '24',
    paginaInicio: 8745,
    seccion: 'I',
    apartado: 'I. Disposiciones generales',
    departamento: 'Ministerio de Derechos Sociales',
    palabrasClave: ['personas mayores', 'protección', 'derechos', 'dependencia'],
    numeroLegislacion: '1/2026',
  },
  {
    id: 'BOE-A-2026-1234',
    tipo: 'disposicion',
    titulo: 'Real Decreto 156/2026, de 15 de febrero, por el que se aprueba el Reglamento de la Ley de Protección de Datos',
    resumen: 'Desarrolla aspectos procedimentales de la Ley Orgánica de Protección de Datos Personales y garantía de los derechos digitales.',
    materia: 'administrativo',
    fechaPublicacion: new Date('2026-02-16'),
    fechaEntradaVigor: new Date('2026-03-01'),
    vigencia: 'vigente',
    organismoEmisor: 'gobierno',
    urlPdf: 'https://www.boe.es/boe/dias/2026/02/16/pdfs/BOE-A-2026-1234.pdf',
    urlHtml: 'https://www.boe.es/buscar/doc.php?id=BOE-A-2026-1234',
    diarioOficial: 'BOE',
    numeroDiario: '38',
    paginaInicio: 12987,
    seccion: 'I',
    apartado: 'I. Disposiciones generales',
    departamento: 'Ministerio de la Presidencia',
    palabrasClave: ['protección de datos', 'RGPD', 'reglamento', 'LOPDGDD'],
    numeroLegislacion: '156/2026',
  },
  {
    id: 'BOE-A-2026-567',
    tipo: 'disposicion',
    titulo: 'Orden ETD/89/2026, de 5 de febrero, por la que se regulan las obligaciones de transparencia en el sector público',
    resumen: 'Establece las obligaciones de publicidad activa y acceso a la información pública para las entidades del sector público.',
    materia: 'administrativo',
    fechaPublicacion: new Date('2026-02-06'),
    vigencia: 'vigente',
    organismoEmisor: 'ministerio_hacienda',
    urlPdf: 'https://www.boe.es/boe/dias/2026/02/06/pdfs/BOE-A-2026-567.pdf',
    urlHtml: 'https://www.boe.es/buscar/doc.php?id=BOE-A-2026-567',
    diarioOficial: 'BOE',
    numeroDiario: '32',
    paginaInicio: 10234,
    seccion: 'I',
    apartado: 'III. Otras disposiciones',
    departamento: 'Ministerio de Transformación Digital',
    palabrasClave: ['transparencia', 'sector público', 'información'],
    numeroLegislacion: '89/2026',
  },
  {
    id: 'BOE-A-2025-23456',
    tipo: 'disposicion',
    titulo: 'Ley 8/2025, de 20 de noviembre, de reforma del Código Penal en materia de delitos económicos',
    resumen: 'Modifica el Código Penal para actualizar los tipos delictivos relacionados con la criminalidad económica y Blanqueo de capitales.',
    materia: 'penal',
    fechaPublicacion: new Date('2025-11-21'),
    fechaEntradaVigor: new Date('2025-12-01'),
    vigencia: 'vigente',
    organismoEmisor: 'cortes_generales',
    urlPdf: 'https://www.boe.es/boe/dias/2025/11/21/pdfs/BOE-A-2025-23456.pdf',
    urlHtml: 'https://www.boe.es/buscar/doc.php?id=BOE-A-2025-23456',
    diarioOficial: 'BOE',
    numeroDiario: '278',
    paginaInicio: 98765,
    seccion: 'I',
    apartado: 'I. Disposiciones generales',
    departamento: 'Ministerio de Justicia',
    palabrasClave: ['Código Penal', 'delitos económicos', 'blanqueo', 'corrupción'],
    numeroLegislacion: '8/2025',
  },
  {
    id: 'BOE-A-2025-19876',
    tipo: 'disposicion',
    titulo: 'Real Decreto Legislativo 2/2025, de 15 de octubre, por el que se aprueba el texto refundido de la Ley del Impuesto sobre Sociedades',
    resumen: 'Aprueba el texto refundido del Impuesto sobre Sociedades, incorporando las últimas reformas fiscales.',
    materia: 'tributario',
    fechaPublicacion: new Date('2025-10-16'),
    fechaEntradaVigor: new Date('2026-01-01'),
    vigencia: 'vigente',
    organismoEmisor: 'gobierno',
    urlPdf: 'https://www.boe.es/boe/dias/2025/10/16/pdfs/BOE-A-2025-19876.pdf',
    urlHtml: 'https://www.boe.es/buscar/doc.php?id=BOE-A-2025-19876',
    diarioOficial: 'BOE',
    numeroDiario: '248',
    paginaInicio: 76543,
    seccion: 'I',
    apartado: 'I. Disposiciones generales',
    departamento: 'Ministerio de Hacienda',
    palabrasClave: ['impuesto sobre sociedades', 'tributario', 'fiscalidad empresarial'],
    numeroLegislacion: '2/2025',
  },
  {
    id: 'BOE-A-2025-15432',
    tipo: 'disposicion',
    titulo: 'Ley 12/2025, de 15 de septiembre, de transposición de directivas de la Unión Europea en materia de digitalización',
    resumen: 'Transpone diversas directivas europeas relacionadas con la transformación digital del sector público y privado.',
    materia: 'union_europea',
    fechaPublicacion: new Date('2025-09-16'),
    fechaEntradaVigor: new Date('2025-10-01'),
    vigencia: 'vigente',
    organismoEmisor: 'cortes_generales',
    urlPdf: 'https://www.boe.es/boe/dias/2025/09/16/pdfs/BOE-A-2025-15432.pdf',
    urlHtml: 'https://www.boe.es/buscar/doc.php?id=BOE-A-2025-15432',
    diarioOficial: 'BOE',
    numeroDiario: '220',
    paginaInicio: 65432,
    seccion: 'I',
    apartado: 'I. Disposiciones generales',
    departamento: 'Ministerio de Asuntos Exteriores',
    palabrasClave: ['Unión Europea', 'directivas', 'digitalización', 'transposición'],
    numeroLegislacion: '12/2025',
  },
  {
    id: 'BOE-A-2025-11234',
    tipo: 'disposicion',
    titulo: 'Ley 10/2025, de 28 de junio, de modificación del Estatuto de los Trabajadores',
    resumen: 'Modifica diversos aspectos del Estatuto de los Trabajadores en materia de condiciones laborales y negociación colectiva.',
    materia: 'laboral',
    fechaPublicacion: new Date('2025-06-29'),
    fechaEntradaVigor: new Date('2025-07-01'),
    vigencia: 'vigente',
    organismoEmisor: 'cortes_generales',
    urlPdf: 'https://www.boe.es/boe/dias/2025/06/29/pdfs/BOE-A-2025-11234.pdf',
    urlHtml: 'https://www.boe.es/buscar/doc.php?id=BOE-A-2025-11234',
    diarioOficial: 'BOE',
    numeroDiario: '152',
    paginaInicio: 54321,
    seccion: 'I',
    apartado: 'I. Disposiciones generales',
    departamento: 'Ministerio de Trabajo',
    palabrasClave: ['trabajo', 'Estatuto Trabajadores', 'negociación colectiva', 'condiciones laborales'],
    numeroLegislacion: '10/2025',
  },
  {
    id: 'BOE-A-2025-8901',
    tipo: 'disposicion',
    titulo: 'Resolución de 20 de mayo de 2025, de la Dirección General de Seguros, sobre estadísticas del seguro privado',
    resumen: 'Publica las estadísticas anuales del sector asegurador español correspondientes al ejercicio 2024.',
    materia: 'mercantil',
    fechaPublicacion: new Date('2025-05-21'),
    vigencia: 'vigente',
    organismoEmisor: 'ministerio_hacienda',
    urlPdf: 'https://www.boe.es/boe/dias/2025/05/21/pdfs/BOE-A-2025-8901.pdf',
    urlHtml: 'https://www.boe.es/buscar/doc.php?id=BOE-A-2025-8901',
    diarioOficial: 'BOE',
    numeroDiario: '118',
    paginaInicio: 43210,
    seccion: 'I',
    apartado: 'III. Otras disposiciones',
    departamento: 'Ministerio de Asuntos Económicos',
    palabrasClave: ['seguros', 'estadísticas', 'sector financiero'],
  },
  {
    id: 'BOE-A-2024-34567',
    tipo: 'disposicion',
    titulo: 'Ley Orgánica 1/2024, de 27 de diciembre, de amnistías fiscales',
    resumen: 'Establece una amnistía fiscal para regularizar situaciones tributarias pendientes, con condiciones específicas.',
    materia: 'tributario',
    fechaPublicacion: new Date('2024-12-28'),
    fechaEntradaVigor: new Date('2024-12-29'),
    vigencia: 'vigente',
    organismoEmisor: 'cortes_generales',
    urlPdf: 'https://www.boe.es/boe/dias/2024/12/28/pdfs/BOE-A-2024-34567.pdf',
    urlHtml: 'https://www.boe.es/buscar/doc.php?id=BOE-A-2024-34567',
    diarioOficial: 'BOE',
    numeroDiario: '312',
    paginaInicio: 156789,
    seccion: 'I',
    apartado: 'I. Disposiciones generales',
    departamento: 'Ministerio de Hacienda',
    palabrasClave: ['amnistía fiscal', 'regularización', 'tributo'],
    numeroLegislacion: '1/2024',
  },
  {
    id: 'BOE-A-2020-1234',
    tipo: 'disposicion',
    titulo: 'Real Decreto 926/2020, de 25 de octubre, por el que se declara el estado de alarma',
    resumen: 'Declara el estado de alarma para contener la propagación de infecciones causadas por el SARS-CoV-2.',
    materia: 'administrativo',
    fechaPublicacion: new Date('2020-10-25'),
    fechaEntradaVigor: new Date('2020-10-25'),
    vigencia: 'derogado',
    organismoEmisor: 'gobierno',
    urlPdf: 'https://www.boe.es/boe/dias/2020/10/25/pdfs/BOE-A-2020-1234.pdf',
    urlHtml: 'https://www.boe.es/buscar/doc.php?id=BOE-A-2020-1234',
    diarioOficial: 'BOE',
    numeroDiario: '282',
    paginaInicio: 91234,
    seccion: 'I',
    apartado: 'I. Disposiciones generales',
    departamento: 'Presidencia del Gobierno',
    palabrasClave: ['estado de alarma', 'COVID-19', 'emergencia sanitaria'],
    numeroLegislacion: '926/2020',
  },
  {
    id: 'BOE-A-2019-5678',
    tipo: 'disposicion',
    titulo: 'Ley 39/2019, de 1 de febrero, del Procedimiento Administrativo Común',
    resumen: ' регуля процедуры административного производства.',
    materia: 'administrativo',
    fechaPublicacion: new Date('2019-02-02'),
    fechaEntradaVigor: new Date('2019-04-02'),
    vigencia: 'derogado',
    organismoEmisor: 'cortes_generales',
    urlPdf: 'https://www.boe.es/boe/dias/2019/02/02/pdfs/BOE-A-2019-5678.pdf',
    urlHtml: 'https://www.boe.es/buscar/doc.php?id=BOE-A-2019-5678',
    diarioOficial: 'BOE',
    numeroDiario: '28',
    paginaInicio: 8754,
    seccion: 'I',
    apartado: 'I. Disposiciones generales',
    departamento: 'Ministerio de Política Territorial',
    palabrasClave: ['procedimiento administrativo', 'administración pública'],
    numeroLegislacion: '39/2019',
  },
  {
    id: 'BOE-A-2018-9012',
    tipo: 'disposicion',
    titulo: 'Ley 40/2015, de 1 de octubre, de Régimen Jurídico del Sector Público',
    resumen: 'Establece el régimen jurídico básico del sector público.',
    materia: 'administrativo',
    fechaPublicacion: new Date('2015-10-02'),
    fechaEntradaVigor: new Date('2016-10-02'),
    vigencia: 'derogado',
    organismoEmisor: 'cortes_generales',
    urlPdf: 'https://www.boe.es/boe/dias/2015/10/02/pdfs/BOE-A-2015-9012.pdf',
    urlHtml: 'https://www.boe.es/buscar/doc.php?id=BOE-A-2015-9012',
    diarioOficial: 'BOE',
    numeroDiario: '236',
    paginaInicio: 89412,
    seccion: 'I',
    apartado: 'I. Disposiciones generales',
    departamento: 'Ministerio de la Presidencia',
    palabrasClave: ['régimen jurídico', 'sector público'],
    numeroLegislacion: '40/2015',
  },
];

export interface BoeCalendarioDia {
  fecha: string;
  diaSemana: string;
  boletines: {
    tipo: 'A' | 'B' | 'O';
    numero?: string;
    existenDocumentos: boolean;
  }[];
}

export interface BoeSearchOptions {
  query?: string;
  fechaDesde?: Date;
  fechaHasta?: Date;
  seccion?: 'I' | 'II' | 'III' | 'IV' | 'V';
  departamento?: string;
  materia?: Materia;
  pagina?: number;
  limit?: number;
  ordenarPor?: 'fecha' | 'relevancia';
}

export async function buscarBoe(params: BoeSearchOptions): Promise<BoeSearchResponse> {
  if (CONFIG.USE_MOCK) {
    await delay(CONFIG.MOCK_DELAY);
    return buscarBoeMock(params);
  }
  
  return buscarBoeApi(params);
}

async function buscarBoeApi(params: BoeSearchOptions): Promise<BoeSearchResponse> {
  const queryParams = new URLSearchParams();
  
  if (params.query) queryParams.set('q', params.query);
  if (params.fechaDesde) queryParams.set('fecha', formatFechaApi(params.fechaDesde));
  if (params.seccion) queryParams.set('seccion', params.seccion);
  if (params.departamento) queryParams.set('departamento', params.departamento);
  if (params.pagina) queryParams.set('pagina', params.pagina.toString());
  if (params.limit) queryParams.set('tamano', params.limit.toString());
  
  const response = await fetch(`${CONFIG.BASE_URL}/buscador?${queryParams.toString()}`, {
    headers: {
      'Accept': 'application/json',
    },
  });
  
  if (!response.ok) {
    throw new Error(`Error en la búsqueda del BOE: ${response.status}`);
  }
  
  return response.json();
}

async function buscarBoeMock(params: BoeSearchOptions): Promise<BoeSearchResponse> {
  let resultados = [...MOCK_BOE_DOCUMENTS];
  
  if (params.query) {
    const query = params.query.toLowerCase();
    resultados = resultados.filter(
      (doc) =>
        doc.titulo.toLowerCase().includes(query) ||
        doc.resumen?.toLowerCase().includes(query) ||
        doc.palabrasClave.some((kw) => kw.toLowerCase().includes(query))
    );
  }
  
  if (params.fechaDesde) {
    resultados = resultados.filter((doc) => doc.fechaPublicacion >= params.fechaDesde!);
  }
  
  if (params.fechaHasta) {
    resultados = resultados.filter((doc) => doc.fechaPublicacion <= params.fechaHasta!);
  }
  
  if (params.seccion) {
    resultados = resultados.filter((doc) => doc.seccion === params.seccion);
  }
  
  if (params.departamento) {
    resultados = resultados.filter((doc) => 
      doc.departamento?.toLowerCase().includes(params.departamento!.toLowerCase())
    );
  }
  
  if (params.materia) {
    resultados = resultados.filter((doc) => doc.materia === params.materia);
  }
  
  if (params.ordenarPor === 'fecha' || !params.ordenarPor) {
    resultados.sort((a, b) => b.fechaPublicacion.getTime() - a.fechaPublicacion.getTime());
  }
  
  const page = params.pagina || 1;
  const limit = params.limit || CONFIG.PAGE_SIZE;
  const start = (page - 1) * limit;
  const paginatedResults = resultados.slice(start, start + limit);
  
  return {
    total: resultados.length,
    pagina: page,
    totalPaginas: Math.ceil(resultados.length / limit),
    resultados: mapToResumen(paginatedResults),
  };
}

function mapToResumen(docs: BoeDocumento[]): BoeDocumentoResumen[] {
  return docs.map((doc) => ({
    id: doc.id,
    titulo: doc.titulo,
    url: doc.urlHtml || `https://www.boe.es/buscar/doc.php?id=${doc.id}`,
    fecha: doc.fechaPublicacion,
    seccion: doc.seccion || 'I',
    apartado: doc.apartado || 'General',
    departamento: doc.departamento || 'General',
    materia: doc.materia,
  }));
}

export async function obtenerDocumentoBoe(id: string): Promise<BoeDocumentoCompleto | null> {
  if (CONFIG.USE_MOCK) {
    await delay(CONFIG.MOCK_DELAY);
    return obtenerDocumentoBoeMock(id);
  }
  
  return obtenerDocumentoBoeApi(id);
}

async function obtenerDocumentoBoeApi(id: string): Promise<BoeDocumentoCompleto | null> {
  const response = await fetch(`${CONFIG.BASE_URL}/documento/${id}`, {
    headers: {
      'Accept': 'application/json',
    },
  });
  
  if (!response.ok) {
    if (response.status === 404) return null;
    throw new Error(`Error al obtener documento: ${response.status}`);
  }
  
  return response.json();
}

async function obtenerDocumentoBoeMock(id: string): Promise<BoeDocumentoCompleto | null> {
  const doc = MOCK_BOE_DOCUMENTS.find((d) => d.id === id);
  if (!doc) return null;
  
  const metadata: BoeMetadatos = {
    identificador: doc.id,
    titulo: doc.titulo,
    departamento: doc.departamento || 'General',
    seccion: doc.seccion || 'I',
    apartado: doc.apartado || 'General',
    numeroBoletin: doc.numeroDiario || 'N/A',
    fechaBoletin: formatFechaApi(doc.fechaPublicacion),
    numeroPagina: doc.paginaInicio || 1,
    materias: [doc.materia],
    pdf: doc.urlPdf
      ? {
          url: doc.urlPdf,
          nombre: `${doc.id}.pdf`,
          tamano: 1024000,
        }
      : undefined,
  };
  
  const texto: BoeTexto = {
    parrafos: [
      {
        id: 'p1',
        tipo: 'titulo',
        contenido: doc.titulo,
        nivel: 1,
      },
      {
        id: 'p2',
        tipo: 'articulo',
        numero: 'Preámbulo',
        contenido: doc.resumen || '',
        nivel: 2,
      },
    ],
    articulos: [],
    disposiciones: [],
  };
  
  const relaciones: BoeRelaciones = {
    deroga: [],
    derogadoPor: [],
    modifica: [],
    modificadoPor: [],
    concordancias: [],
  };
  
  return { metadata, texto, relaciones };
}

export async function obtenerCalendarioBoe(
  anno: number,
  mes?: number
): Promise<BoeCalendarioDia[]> {
  if (CONFIG.USE_MOCK) {
    await delay(CONFIG.MOCK_DELAY);
    return obtenerCalendarioBoeMock(anno, mes);
  }
  
  return obtenerCalendarioBoeApi(anno, mes);
}

async function obtenerCalendarioBoeApi(
  anno: number,
  mes?: number
): Promise<BoeCalendarioDia[]> {
  const params = new URLSearchParams();
  params.set('anno', anno.toString());
  if (mes) params.set('mes', mes.toString());
  
  const response = await fetch(`${CONFIG.BASE_URL}/calendario?${params.toString()}`, {
    headers: {
      'Accept': 'application/json',
    },
  });
  
  if (!response.ok) {
    throw new Error(`Error al obtener calendario: ${response.status}`);
  }
  
  return response.json();
}

async function obtenerCalendarioBoeMock(
  anno: number,
  mes?: number
): Promise<BoeCalendarioDia[]> {
  const diasLaborables = [1, 2, 3, 4, 5];
  const calendario: BoeCalendarioDia[] = [];
  
  const fechaInicio = new Date(anno, mes ? mes - 1 : 0, 1);
  const fechaFin = mes 
    ? new Date(anno, mes, 0) 
    : new Date(anno, 11, 31);
  
  const diasSemana = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];
  
  for (let d = new Date(fechaInicio); d <= fechaFin; d.setDate(d.getDate() + 1)) {
    const diaSemana = d.getDay();
    
    if (diasLaborables.includes(diaSemana)) {
      const numDia = d.getDate();
      const tieneBOE = Math.random() > 0.2;
      
      calendario.push({
        fecha: formatFechaApi(d),
        diaSemana: diasSemana[diaSemana],
        boletines: tieneBOE
          ? [
              { tipo: 'A', numero: `${anno}${String(d.getMonth() + 1).padStart(2, '0')}${String(numDia).padStart(2, '0')}`, existenDocumentos: true },
              { tipo: 'B', existenDocumentos: Math.random() > 0.5 },
              { tipo: 'O', existenDocumentos: Math.random() > 0.7 },
            ]
          : [],
      });
    }
  }
  
  return calendario;
}

export async function obtenerDocumentosPorFecha(
  fecha: Date,
  seccion?: 'I' | 'II' | 'III' | 'IV' | 'V'
): Promise<BoeSearchResponse> {
  return buscarBoe({
    fechaDesde: fecha,
    fechaHasta: fecha,
    seccion,
    limit: 100,
  });
}

export async function obtenerUltimosDocumentos(
  dias: number = 7,
  seccion?: 'I' | 'II' | 'III' | 'IV' | 'V'
): Promise<BoeSearchResponse> {
  const fechaDesde = new Date();
  fechaDesde.setDate(fechaDesde.getDate() - dias);
  
  return buscarBoe({
    fechaDesde,
    seccion,
    ordenarPor: 'fecha',
    limit: 20,
  });
}

export async function buscarPorMateria(
  materia: Materia,
  opciones?: Partial<BoeSearchOptions>
): Promise<BoeSearchResponse> {
  return buscarBoe({
    materia,
    ...opciones,
  });
}

export interface BoeNovedadesOptions {
  fechaDesde: Date;
  seccion?: 'I' | 'II' | 'III' | 'IV' | 'V';
  materia?: Materia;
  departamento?: string;
  limit?: number;
}

export interface BoeNovedadesResponse {
  total: number;
  novedades: BoeDocumentoResumen[];
  fechaConsulta: Date;
  fechaDesde: string;
}

export async function getNovedades(
  fechaDesde: Date,
  opciones?: Omit<BoeNovedadesOptions, 'fechaDesde'>
): Promise<BoeNovedadesResponse> {
  const params: BoeSearchOptions = {
    fechaDesde,
    seccion: opciones?.seccion,
    materia: opciones?.materia,
    departamento: opciones?.departamento,
    ordenarPor: 'fecha',
    limit: opciones?.limit || 50,
  };

  const resultado = await buscarBoe(params);

  return {
    total: resultado.total,
    novedades: resultado.resultados,
    fechaConsulta: new Date(),
    fechaDesde: formatFechaApi(fechaDesde),
  };
}

function formatFechaApi(date: Date): string {
  return date.toISOString().split('T')[0];
}

export interface DerogacionInfo {
  documentoDerogado: BoeDocumento;
  documentoDerogador: BoeDocumento;
  fechaDerogacion: Date;
  tipoDerogacion: 'expresa' | 'tácita';
}

export interface DetectarDerogacionesOptions {
  fechaDesde?: Date;
  fechaHasta?: Date;
  materia?: Materia;
  departamento?: string;
}

export async function detectarDerogaciones(
  opciones?: DetectarDerogacionesOptions
): Promise<DerogacionInfo[]> {
  if (CONFIG.USE_MOCK) {
    await delay(CONFIG.MOCK_DELAY);
    return detectarDerogacionesMock(opciones);
  }

  return detectarDerogacionesApi(opciones);
}

async function detectarDerogacionesApi(
  opciones?: DetectarDerogacionesOptions
): Promise<DerogacionInfo[]> {
  const params: BoeSearchOptions = {
    fechaDesde: opciones?.fechaDesde,
    fechaHasta: opciones?.fechaHasta,
    materia: opciones?.materia,
    departamento: opciones?.departamento,
    limit: 200,
  };

  const resultado = await buscarBoe(params);
  const derogaciones: DerogacionInfo[] = [];

  for (const doc of resultado.resultados) {
    const docCompleto = await obtenerDocumentoBoe(doc.id);
    if (docCompleto?.relaciones?.deroga && docCompleto.relaciones.deroga.length > 0) {
      for (const ref of docCompleto.relaciones.deroga) {
        const docDerogado = await obtenerDocumentoBoe(ref.id);
        if (docDerogado) {
          derogaciones.push({
            documentoDerogado: mapToDocumento(docDerogado),
            documentoDerogador: mapToDocumento(docCompleto),
            fechaDerogacion: doc.fecha,
            tipoDerogacion: 'expresa',
          });
        }
      }
    }
  }

  return derogaciones;
}

async function detectarDerogacionesMock(
  opciones?: DetectarDerogacionesOptions
): Promise<DerogacionInfo[]> {
  let documentos = [...MOCK_BOE_DOCUMENTS];

  if (opciones?.fechaDesde) {
    documentos = documentos.filter((d) => d.fechaPublicacion >= opciones.fechaDesde!);
  }

  if (opciones?.fechaHasta) {
    documentos = documentos.filter((d) => d.fechaPublicacion <= opciones.fechaHasta!);
  }

  if (opciones?.materia) {
    documentos = documentos.filter((d) => d.materia === opciones.materia);
  }

  if (opciones?.departamento) {
    documentos = documentos.filter((d) =>
      d.departamento?.toLowerCase().includes(opciones.departamento!.toLowerCase())
    );
  }

  const derogaciones: DerogacionInfo[] = [];
  const vigentes = documentos.filter((d) => d.vigencia === 'vigente');
  const derogados = documentos.filter((d) => d.vigencia === 'derogado');

  for (const derogador of vigentes) {
    const tituloDerogador = derogador.titulo.toLowerCase();
    
    for (const derogado of derogados) {
      const tituloDerogado = derogado.titulo.toLowerCase();
      
      let tipoDerogacion: 'expresa' | 'tácita' = 'tácita';

      if (
        tituloDerogador.includes('deroga') ||
        tituloDerogador.includes('derogación') ||
        tituloDerogador.includes('derogado') ||
        tituloDerogador.includes('modifica') && derogado.fechaPublicacion < derogador.fechaPublicacion
      ) {
        tipoDerogacion = 'expresa';
      }

      if (derogador.fechaPublicacion > derogado.fechaPublicacion) {
        const temasCoinciden = derogador.materia === derogado.materia ||
          tituloDerogador.includes(tituloDerogado.substring(0, 20));

        if (temasCoinciden || tipoDerogacion === 'expresa') {
          derogaciones.push({
            documentoDerogado: derogado,
            documentoDerogador: derogador,
            fechaDerogacion: derogador.fechaPublicacion,
            tipoDerogacion,
          });
        }
      }
    }
  }

  return derogaciones.sort(
    (a, b) => b.fechaDerogacion.getTime() - a.fechaDerogacion.getTime()
  );
}

function mapToDocumento(docCompleto: BoeDocumentoCompleto): BoeDocumento {
  return {
    id: docCompleto.metadata.identificador,
    tipo: 'disposicion',
    titulo: docCompleto.metadata.titulo,
    materia: docCompleto.metadata.materias[0] || 'administrativo',
    fechaPublicacion: new Date(docCompleto.metadata.fechaBoletin),
    vigencia: 'vigente',
    organismoEmisor: 'gobierno',
    urlHtml: `https://www.boe.es/buscar/doc.php?id=${docCompleto.metadata.identificador}`,
    diarioOficial: 'BOE',
    numeroDiario: docCompleto.metadata.numeroBoletin,
    paginaInicio: docCompleto.metadata.numeroPagina,
    seccion: docCompleto.metadata.seccion as 'I' | 'II' | 'III',
    departamento: docCompleto.metadata.departamento,
  };
}

export { MOCK_BOE_DOCUMENTS };

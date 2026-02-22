/**
 * Servicio de integración con APIs de Legislación Oficial
 * 
 * NOTA IMPORTANTE: Este archivo contiene implementación MOCK
 * para desarrollo frontend. Cuando se disponga de credenciales reales:
 * 
 * 1. BOE API: Obtener API Key en https://puntodeacceso.boe.es/
 * 2. CENDOJ API: Solicitar acceso en https://www.poderjudicial.es/cgpj/es/Tribunales/CENDOJ/Informacion-tecnica
 * 
 * Luego reemplazar las funciones mock por llamadas HTTP reales usando fetch/axios
 */

import type {
  BoeDocumento,
  BoesearchParams,
  BoeSearchResponse,
  BoeDocumentoCompleto,
  CendojDocumento,
  CendojSearchParams,
  CendojSearchResponse,
  LegislacionBase,
  BusquedaAvanzadaParams,
  BusquedaResponse,
  TipoDocumento,
  Materia,
  CodigoLegislacion,
  LegislacionStats,
  EstadoSincronizacion,
} from '@/types/legislacion';

// ============================================
// CONFIGURACIÓN (para desarrollo)
// ============================================

const CONFIG = {
  // Cuando tengas API keys reales, descomenta y configura:
  // BOE_API_KEY: import.meta.env.VITE_BOE_API_KEY || '',
  // BOE_BASE_URL: 'https://boe.es/datosabiertos/api',
  // CENDOJ_API_KEY: import.meta.env.VITE_CENDOJ_API_KEY || '',
  // CENDOJ_BASE_URL: 'https://www.poderjudicial.es/cgpj/es/Tribunales/CENDOJ/api',
  
  // Configuración mock
  USE_MOCK: true,
  MOCK_DELAY: 300, // ms para simular latencia de red
  PAGE_SIZE: 20,
};

// ============================================
// DATOS MOCK REALISTAS
// ============================================

// Mock de documentos del BOE (datos realistas)
const MOCK_BOE_DOCUMENTS: BoeDocumento[] = [
  {
    id: 'BOE-A-2024-1234',
    tipo: 'disposicion',
    titulo: 'Real Decreto-ley 5/2024, de 28 de febrero, de medidas urgentes para la reducción de la carga administrativa',
    resumen: 'Se adoptan medidas urgentes para simplificar procedimientos administrativos y reducir cargas burocráticas en el ámbito de la Administración General del Estado.',
    materia: 'administrativo',
    fechaPublicacion: new Date('2024-02-29'),
    fechaEntradaVigor: new Date('2024-03-01'),
    vigencia: 'vigente',
    organismoEmisor: 'gobierno',
    urlPdf: 'https://boe.es/boe/dias/2024/02/29/pdfs/BOE-A-2024-1234.pdf',
    urlHtml: 'https://boe.es/buscar/doc.php?id=BOE-A-2024-1234',
    diarioOficial: 'BOE',
    numeroDiario: '52',
    paginaInicio: 23450,
    seccion: 'I',
    apartado: 'Disposiciones generales',
    departamento: 'Presidencia del Gobierno',
    palabrasClave: ['administración electrónica', 'simplificación', 'carga administrativa'],
    numeroLegislacion: '5/2024',
  },
  {
    id: 'BOE-A-2023-18987',
    tipo: 'disposicion',
    titulo: 'Ley 19/2023, de 20 de noviembre, de transformación digital de la Administración de Justicia',
    resumen: 'Regula la transformación digital de la Administración de Justicia y el uso de medios electrónicos en el procedimiento judicial.',
    materia: 'procesal',
    fechaPublicacion: new Date('2023-11-21'),
    fechaEntradaVigor: new Date('2024-01-01'),
    vigencia: 'vigente',
    organismoEmisor: 'cortes_generales',
    urlPdf: 'https://boe.es/boe/dias/2023/11/21/pdfs/BOE-A-2023-18987.pdf',
    urlHtml: 'https://boe.es/buscar/doc.php?id=BOE-A-2023-18987',
    diarioOficial: 'BOE',
    numeroDiario: '278',
    paginaInicio: 154320,
    seccion: 'I',
    apartado: 'Disposiciones generales',
    departamento: 'Ministerio de Justicia',
    palabrasClave: ['justicia digital', 'procedimiento electrónico', 'LexNET'],
    numeroLegislacion: '19/2023',
  },
  {
    id: 'BOE-A-2023-15621',
    tipo: 'disposicion',
    titulo: 'Real Decreto Legislativo 3/2023, de 6 de septiembre, por el que se aprueba el texto refundido de la Ley de Contratos del Sector Público',
    resumen: 'Aprueba el texto refundido de la Ley de Contratos del Sector Público, en cumplimiento del mandato contenido en la disposición final décima primera de la Ley 9/2017.',
    materia: 'administrativo',
    fechaPublicacion: new Date('2023-09-07'),
    fechaEntradaVigor: new Date('2023-10-01'),
    vigencia: 'vigente',
    organismoEmisor: 'gobierno',
    urlPdf: 'https://boe.es/boe/dias/2023/09/07/pdfs/BOE-A-2023-15621.pdf',
    urlHtml: 'https://boe.es/buscar/doc.php?id=BOE-A-2023-15621',
    diarioOficial: 'BOE',
    numeroDiario: '213',
    paginaInicio: 111456,
    seccion: 'I',
    apartado: 'Disposiciones generales',
    departamento: 'Ministerio de Hacienda',
    palabrasClave: ['contratos públicos', 'licitación', 'sector público'],
    numeroLegislacion: '3/2023',
  },
  {
    id: 'BOE-A-2024-843',
    tipo: 'disposicion',
    titulo: 'Orden ETD/215/2024, de 1 de marzo, por la que se desarrolla el sistema de garantía de derechos de las personas trabajadoras autónomas',
    resumen: 'Desarrolla el sistema de garantía de derechos de las personas trabajadoras autónomas establecido en la disposición adicional decimoséptima del Real Decreto-ley 32/2021.',
    materia: 'laboral',
    fechaPublicacion: new Date('2024-03-02'),
    vigencia: 'vigente',
    organismoEmisor: 'ministerio_hacienda',
    urlPdf: 'https://boe.es/boe/dias/2024/03/02/pdfs/BOE-A-2024-843.pdf',
    urlHtml: 'https://boe.es/buscar/doc.php?id=BOE-A-2024-843',
    diarioOficial: 'BOE',
    numeroDiario: '54',
    paginaInicio: 25120,
    seccion: 'I',
    apartado: 'Autoridades y personal',
    departamento: 'Ministerio de Trabajo y Economía Social',
    palabrasClave: ['autónomos', 'trabajadores autónomos', 'protección social'],
  },
  {
    id: 'BOE-A-2023-2345',
    tipo: 'disposicion',
    titulo: 'Ley Orgánica 2/2023, de 22 de marzo, del Tribunal Constitucional',
    resumen: 'Regula la organización y funcionamiento del Tribunal Constitucional, en cumplimiento de lo dispuesto en el artículo 159 de la Constitución.',
    materia: 'constitucional',
    fechaPublicacion: new Date('2023-03-23'),
    fechaEntradaVigor: new Date('2023-04-01'),
    vigencia: 'vigente',
    organismoEmisor: 'cortes_generales',
    urlPdf: 'https://boe.es/boe/dias/2023/03/23/pdfs/BOE-A-2023-2345.pdf',
    urlHtml: 'https://boe.es/buscar/doc.php?id=BOE-A-2023-2345',
    diarioOficial: 'BOE',
    numeroDiario: '70',
    paginaInicio: 38456,
    seccion: 'I',
    apartado: 'Disposiciones generales',
    departamento: 'Tribunal Constitucional',
    palabrasClave: ['tribunal constitucional', 'constitución', 'control de constitucionalidad'],
    numeroLegislacion: '2/2023',
  },
  {
    id: 'BOE-A-2024-567',
    tipo: 'disposicion',
    titulo: 'Real Decreto 234/2024, de 27 de febrero, por el que se regula la protección de datos personales en el ámbito de las telecomunicaciones',
    resumen: 'Regula las condiciones de protección de datos personales en el sector de las comunicaciones electrónicas.',
    materia: 'administrativo',
    fechaPublicacion: new Date('2024-02-28'),
    fechaEntradaVigor: new Date('2024-03-15'),
    vigencia: 'vigente',
    organismoEmisor: 'gobierno',
    urlPdf: 'https://boe.es/boe/dias/2024/02/28/pdfs/BOE-A-2024-567.pdf',
    urlHtml: 'https://boe.es/buscar/doc.php?id=BOE-A-2024-567',
    diarioOficial: 'BOE',
    numeroDiario: '51',
    paginaInicio: 22890,
    seccion: 'I',
    apartado: 'Disposiciones generales',
    departamento: 'Ministerio de Asuntos Económicos y Transformación Digital',
    palabrasClave: ['protección de datos', 'RGPD', 'telecomunicaciones', 'privacidad'],
    numeroLegislacion: '234/2024',
  },
  {
    id: 'BOE-A-2023-18900',
    tipo: 'disposicion',
    titulo: 'Ley 15/2023, de 19 de julio, de transposición de directivas europeas y otras disposiciones para la adaptación del ordenamiento jurídico español a la Unión Europea',
    resumen: 'Transpone diversas directivas de la Unión Europea y adapta el ordenamiento jurídico español al Derecho de la Unión.',
    materia: 'union_europea',
    fechaPublicacion: new Date('2023-07-20'),
    fechaEntradaVigor: new Date('2023-08-01'),
    vigencia: 'vigente',
    organismoEmisor: 'cortes_generales',
    urlPdf: 'https://boe.es/boe/dias/2023/07/20/pdfs/BOE-A-2023-18900.pdf',
    urlHtml: 'https://boe.es/buscar/doc.php?id=BOE-A-2023-18900',
    diarioOficial: 'BOE',
    numeroDiario: '170',
    paginaInicio: 87543,
    seccion: 'I',
    apartado: 'Disposiciones generales',
    departamento: 'Ministerio de Asuntos Exteriores, Unión Europea y Cooperación',
    palabrasClave: ['unión europea', 'transposición', 'directivas europeas'],
    numeroLegislacion: '15/2023',
  },
  {
    id: 'BOE-A-2024-345',
    tipo: 'disposicion',
    titulo: 'Resolución de 15 de enero de 2024, de la Dirección General de los Registros y del Notariado',
    resumen: 'Se publica el Acuerdo de la Comisión Permanente de la Dirección General de los Registros y del Notariado sobre determinadas cuestiones de Derecho inmobiliario.',
    materia: 'civil',
    fechaPublicacion: new Date('2024-01-16'),
    vigencia: 'vigente',
    organismoEmisor: 'ministerio_justicia',
    urlPdf: 'https://boe.es/boe/dias/2024/01/16/pdfs/BOE-A-2024-345.pdf',
    urlHtml: 'https://boe.es/buscar/doc.php?id=BOE-A-2024-345',
    diarioOficial: 'BOE',
    numeroDiario: '13',
    paginaInicio: 4567,
    seccion: 'I',
    apartado: 'Autoridades y personal',
    departamento: 'Ministerio de Justicia',
    palabrasClave: ['registro de la propiedad', 'derecho inmobiliario', 'notariado'],
  },
  {
    id: 'BOE-A-2023-20150',
    tipo: 'disposicion',
    titulo: 'Circular 1/2023, de 18 de octubre, del Banco de España, a las entidades de crédito, sobre obligaciones de información a clientes en materia de transparencia de operaciones y protección de la clientela',
    resumen: 'Establece las obligaciones de información a clientes en materia de transparencia y protección de clientes.',
    materia: 'mercantil',
    fechaPublicacion: new Date('2023-10-19'),
    fechaEntradaVigor: new Date('2023-11-01'),
    vigencia: 'vigente',
    organismoEmisor: 'ministerio_hacienda',
    urlPdf: 'https://boe.es/boe/dias/2023/10/19/pdfs/BOE-A-2023-20150.pdf',
    urlHtml: 'https://boe.es/buscar/doc.php?id=BOE-A-2023-20150',
    diarioOficial: 'BOE',
    numeroDiario: '250',
    paginaInicio: 138456,
    seccion: 'I',
    apartado: 'Autoridades y personal',
    departamento: 'Banco de España',
    palabrasClave: ['banca', 'transparencia', 'clientes', 'entidades de crédito'],
  },
  {
    id: 'BOE-A-2024-100',
    tipo: 'disposicion',
    titulo: 'Orden HFP/67/2024, de 24 de enero, por la que se modifica el Reglamento de gestión e inspección tributaria',
    resumen: 'Modifica determinados aspectos del Reglamento de gestión e inspección tributaria para mejorar la eficiencia en la recaudación.',
    materia: 'tributario',
    fechaPublicacion: new Date('2024-01-25'),
    fechaEntradaVigor: new Date('2024-02-01'),
    vigencia: 'vigente',
    organismoEmisor: 'ministerio_hacienda',
    urlPdf: 'https://boe.es/boe/dias/2024/01/25/pdfs/BOE-A-2024-100.pdf',
    urlHtml: 'https://boe.es/buscar/doc.php?id=BOE-A-2024-100',
    diarioOficial: 'BOE',
    numeroDiario: '20',
    paginaInicio: 7890,
    seccion: 'I',
    apartado: 'Disposiciones generales',
    departamento: 'Ministerio de Hacienda',
    palabrasClave: ['hacienda', 'inspección tributaria', 'gestión tributaria', 'impuestos'],
  },
];

// Mock de sentencias del CENDOJ
const MOCK_CENDOJ_DOCUMENTS: CendojDocumento[] = [
  {
    id: 'CENDOJ-STS-2024-123',
    tipo: 'sentencia',
    titulo: 'Sentencia del Tribunal Supremo de 15 de enero de 2024',
    resumen: 'En materia de responsabilidad civil. Se establece la doctrina sobre la responsabilidad de los mediadores en la contratación de productos financieros complejos.',
    materia: 'civil',
    fechaPublicacion: new Date('2024-01-18'),
    vigencia: 'vigente',
    organismoEmisor: 'tribunal_supremo',
    tribunal: {
      id: 'TS',
      nombre: 'Tribunal Supremo',
      tipo: 'supremo',
    },
    ponente: 'D. Juan García-Calvo',
    numeroResolucion: '123/2024',
    numeroProcedimiento: '1234/2023',
    procedimiento: 'Recurso de casación',
    sala: 'Primera - Civil',
    tipoProcedimiento: 'Civil',
    antecedentes: 'Se plantea la cuestión de la responsabilidad de la entidad bancaria por la comercialización de participaciones preferentes.',
    hechosProbados: 'La entidad no informó adecuadamente de los riesgos del producto.',
    fundamentosDeDerecho: 'El artículo 1.902 del Código Civil establece el principio general de responsabilidad por culpa...',
    fallo: 'Se estima parcialmente el recurso y se condena a la entidad al abono de las cantidades reclamadas con los intereses legales.',
    costas: 'Las costas causadas en esta instancia se imponen a la parte recurrente.',
    jurisprudenciaCita: 'STS 123/2024',
    leyesAplicables: ['Código Civil art. 1902', 'Ley 22/2007 art. 3', 'Directiva 2014/65/UE'],
    precedentes: [
      {
        id: 'STS-2023-456',
        cita: 'STS 456/2023',
        tribunal: 'Tribunal Supremo',
        fecha: new Date('2023-06-15'),
        resumen: 'Sobre responsabilidad bancaria',
        url: 'https://www.poderjudicial.es/search/doc.jsp',
      },
    ],
    palabrasClave: ['responsabilidad civil', 'banca', 'productos financieros', 'cláusulas abusivas'],
  },
  {
    id: 'CENDOJ-STSJ-CAT-2024-45',
    tipo: 'sentencia',
    titulo: 'Sentencia del Tribunal Superior de Justicia de Cataluña de 10 de febrero de 2024',
    resumen: 'En materia laboral. Sobre la nulidad del despido objetivo por inadecuación de la valoración del informe de tramitación del expediente de regulación de empleo.',
    materia: 'laboral',
    fechaPublicacion: new Date('2024-02-12'),
    vigencia: 'vigente',
    organismoEmisor: 'tribunal_superior_justicia',
    tribunal: {
      id: 'TSJ-CAT',
      nombre: 'Tribunal Superior de Justicia de Cataluña',
      tipo: 'superior',
      provincia: 'Barcelona',
      comunidadAutonoma: 'Cataluña',
    },
    ponente: 'Dña. María López',
    numeroResolucion: '45/2024',
    numeroProcedimiento: '2345/2023',
    procedimiento: 'Recurso de suplicación',
    sala: 'Sala de lo Social',
    tipoProcedimiento: 'Laboral',
    fallo: 'Se desestima el recurso confirmando la nulidad del despido por vulneración del derecho a la tutela judicial efectiva.',
    jurisprudenciaCita: 'STSJ CAT 45/2024',
    leyesAplicables: ['Estatuto de los Trabajadores art. 53', 'Ley 36/2011 art. 12'],
    palabrasClave: ['despido', 'ERE', 'procedimiento', 'nulidad', 'trabajadores'],
  },
  {
    id: 'CENDOJ-AN-2024-89',
    tipo: 'sentencia',
    titulo: 'Sentencia de la Audiencia Nacional de 5 de marzo de 2024',
    resumen: 'En materia penal. Sobre el delito de blanqueo de capitales y su conexión con el delito precedente de fraude fiscal.',
    materia: 'penal',
    fechaPublicacion: new Date('2024-03-08'),
    vigencia: 'vigente',
    organismoEmisor: 'audiencia_nacional',
    tribunal: {
      id: 'AN',
      nombre: 'Audiencia Nacional',
      tipo: 'nacional',
    },
    ponente: 'D. Carlos Ruiz',
    numeroResolucion: '89/2024',
    numeroProcedimiento: '3456/2022',
    procedimiento: 'Procedimiento abreviado',
    sala: 'Sala de lo Penal',
    tipoProcedimiento: 'Penal',
    fallo: 'Se condena a los acusados por delito de blanqueo de capitales a la pena de 4 años de prisión e inhabilitación especial.',
    jurisprudenciaCita: 'SAN 89/2024',
    leyesAplicables: ['Código Penal art. 301', 'Código Penal art. 305'],
    palabrasClave: ['blanqueo de capitales', 'fraude fiscal', 'delito', 'penal'],
  },
  {
    id: 'CENDOJ-TC-2024-12',
    tipo: 'auto',
    titulo: 'Auto del Tribunal Constitucional de 20 de febrero de 2024',
    resumen: 'Inadmite el recurso de amparo al no agotarse la vía previa en la jurisdicción ordinaria.',
    materia: 'constitucional',
    fechaPublicacion: new Date('2024-02-22'),
    vigencia: 'vigente',
    organismoEmisor: 'tribunal_constitucional',
    tribunal: {
      id: 'TC',
      nombre: 'Tribunal Constitucional',
      tipo: 'constitucional',
    },
    ponente: 'Dña. Ana Martínez',
    numeroResolucion: '12/2024',
    numeroProcedimiento: '4567-2023',
    procedimiento: 'Recurso de amparo',
    tipoProcedimiento: 'Constitucional',
    fallo: 'Se inadmite el recurso de amparo interpuesto.',
    jurisprudenciaCita: 'ATC 12/2024',
    leyesAplicables: ['Constitución Española art. 161', 'LOTConst. art. 44'],
    palabrasClave: ['amparo', 'tutela de derechos fundamentales', 'vía previa'],
  },
  {
    id: 'CENDOJ-STJUE-2024-C-78',
    tipo: 'sentencia',
    titulo: 'Sentencia del Tribunal de Justicia de la Unión Europea (Gran Sala) de 25 de enero de 2024',
    resumen: 'Sobre la interpretación del Reglamento (UE) 2016/679 en relación con el derecho al olvido digital.',
    materia: 'union_europea',
    fechaPublicacion: new Date('2024-01-25'),
    vigencia: 'vigente',
    organismoEmisor: 'ue',
    tribunal: {
      id: 'TJUE',
      nombre: 'Tribunal de Justicia de la Unión Europea',
      tipo: 'ue',
    },
    ponente: 'Juez P. Koen Lenaerts',
    numeroResolucion: 'C-78/2023',
    numeroProcedimiento: 'C-78/23',
    procedimiento: 'Cuestión prejudicial',
    tipoProcedimiento: 'Unión Europea',
    fallo: 'El derecho al olvido digital debe ponderarse con el derecho a la información y la libertad de expresión.',
    jurisprudenciaCita: 'TJUE C-78/23',
    leyesAplicables: ['Reglamento (UE) 2016/679 art. 17', 'Carta Derechos Fundamentales UE art. 8 y 11'],
    palabrasClave: ['GDPR', 'protección de datos', 'derecho al olvido', 'privacidad'],
  },
];

// Mock de códigos
const MOCK_CODIGOS: CodigoLegislacion[] = [
  {
    id: 'CODIGO-CIVIL',
    tipo: 'codigo',
    titulo: 'Código Civil',
    resumen: 'Texto legal que regula las relaciones entre particulares en materia de personas, familia, patrimonio y obligaciones.',
    materia: 'civil',
    fechaPublicacion: new Date('1889-07-25'),
    fechaEntradaVigor: new Date('1889-08-01'),
    vigencia: 'vigente',
    organismoEmisor: 'cortes_generales',
    urlPdf: 'https://boe.es/buscar/pdf/1889/CODIGO_CIVIL.pdf',
    urlHtml: 'https://www.boe.es/buscar/act.php?id=BOE-A-1889-4763',
    numeroLegislacion: '1889',
    numeroLibros: 4,
    numeroTitulos: 28,
    numeroArticulos: 1976,
    fechaUltimaReforma: new Date('2023-11-21'),
    palabrasClave: ['código civil', 'obligaciones', 'contratos', 'familia', 'propiedad'],
    libros: [], // Simplificado para mock
  },
  {
    id: 'CODIGO-PENAL',
    tipo: 'codigo',
    titulo: 'Código Penal',
    resumen: 'Conjunto de normas jurídicas que definen los delitos y establecen las penas aplicables.',
    materia: 'penal',
    fechaPublicacion: new Date('1995-11-24'),
    fechaEntradaVigor: new Date('1996-05-24'),
    vigencia: 'vigente',
    organismoEmisor: 'cortes_generales',
    urlPdf: 'https://boe.es/buscar/pdf/1995/CODIGO_PENAL.pdf',
    urlHtml: 'https://www.boe.es/buscar/act.php?id=BOE-A-1995-25444',
    numeroLegislacion: '10/1995',
    numeroLibros: 3,
    numeroTitulos: 33,
    numeroArticulos: 888,
    fechaUltimaReforma: new Date('2023-07-20'),
    palabrasClave: ['código penal', 'delitos', 'penas', 'responsabilidad criminal'],
    libros: [],
  },
  {
    id: 'CONSTITUCION-1978',
    tipo: 'codigo',
    titulo: 'Constitución Española',
    resumen: 'Norma suprema del ordenamiento jurídico español. Establece los derechos fundamentales y la organización política del Estado.',
    materia: 'constitucional',
    fechaPublicacion: new Date('1978-12-29'),
    fechaEntradaVigor: new Date('1978-12-29'),
    vigencia: 'vigente',
    organismoEmisor: 'cortes_generales',
    urlPdf: 'https://boe.es/buscar/pdf/1978/CONSTITUCION.pdf',
    urlHtml: 'https://www.boe.es/buscar/act.php?id=BOE-A-1978-31229',
    numeroLegislacion: '1978',
    numeroTitulos: 10,
    numeroArticulos: 169,
    palabrasClave: ['constitución', 'derechos fundamentales', 'estado de derecho', 'democracia'],
    libros: [],
  },
];

// ============================================
// FUNCIONES MOCK
// ============================================

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

// ============================================
// API BOE (Mock)
// ============================================

export async function buscarBoe(params: BoesearchParams): Promise<BoeSearchResponse> {
  await delay(CONFIG.MOCK_DELAY);

  let resultados = [...MOCK_BOE_DOCUMENTS];

  // Filtrar por query
  if (params.query) {
    const query = params.query.toLowerCase();
    resultados = resultados.filter(
      (doc) =>
        doc.titulo.toLowerCase().includes(query) ||
        doc.resumen?.toLowerCase().includes(query) ||
        doc.palabrasClave.some((kw) => kw.toLowerCase().includes(query))
    );
  }

  // Filtrar por fechas
  if (params.fechaDesde) {
    resultados = resultados.filter((doc) => doc.fechaPublicacion >= params.fechaDesde!);
  }
  if (params.fechaHasta) {
    resultados = resultados.filter((doc) => doc.fechaPublicacion <= params.fechaHasta!);
  }

  // Filtrar por materia
  if (params.materia) {
    resultados = resultados.filter((doc) => doc.materia === params.materia);
  }

  // Paginación
  const page = params.pagina || 1;
  const limit = params.limit || CONFIG.PAGE_SIZE;
  const start = (page - 1) * limit;
  const paginatedResults = resultados.slice(start, start + limit);

  return {
    total: resultados.length,
    pagina: page,
    totalPaginas: Math.ceil(resultados.length / limit),
    resultados: paginatedResults.map((doc) => ({
      id: doc.id,
      titulo: doc.titulo,
      url: doc.urlHtml || '#',
      fecha: doc.fechaPublicacion,
      seccion: doc.seccion || 'I',
      apartado: doc.apartado || 'General',
      departamento: doc.departamento || 'General',
      materia: doc.materia,
    })),
  };
}

export async function obtenerDocumentoBoe(id: string): Promise<BoeDocumentoCompleto | null> {
  await delay(CONFIG.MOCK_DELAY);

  const doc = MOCK_BOE_DOCUMENTS.find((d) => d.id === id);
  if (!doc) return null;

  return {
    metadata: {
      identificador: doc.id,
      titulo: doc.titulo,
      departamento: doc.departamento || 'General',
      seccion: doc.seccion || 'I',
      apartado: doc.apartado || 'General',
      numeroBoletin: doc.numeroDiario || 'N/A',
      fechaBoletin: doc.fechaPublicacion.toISOString().split('T')[0],
      numeroPagina: doc.paginaInicio || 1,
      materias: [doc.materia],
      pdf: doc.urlPdf
        ? {
            url: doc.urlPdf,
            nombre: `${doc.id}.pdf`,
            tamano: 1024000, // Mock size
          }
        : undefined,
    },
    texto: {
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
          numero: 'Artículo 1',
          contenido: doc.resumen || 'Contenido del documento...',
          nivel: 2,
        },
      ],
      articulos: [],
      disposiciones: [],
    },
    relaciones: {
      deroga: [],
      derogadoPor: [],
      modifica: [],
      modificadoPor: [],
    },
  };
}

// ============================================
// API CENDOJ (Mock)
// ============================================

export async function buscarCendoj(params: CendojSearchParams): Promise<CendojSearchResponse> {
  await delay(CONFIG.MOCK_DELAY);

  let resultados = [...MOCK_CENDOJ_DOCUMENTS];

  if (params.query) {
    const query = params.query.toLowerCase();
    resultados = resultados.filter(
      (doc) =>
        doc.titulo.toLowerCase().includes(query) ||
        doc.resumen?.toLowerCase().includes(query) ||
        doc.fallo?.toLowerCase().includes(query)
    );
  }

  if (params.fechaDesde) {
    resultados = resultados.filter((doc) => doc.fechaPublicacion >= params.fechaDesde!);
  }
  if (params.fechaHasta) {
    resultados = resultados.filter((doc) => doc.fechaPublicacion <= params.fechaHasta!);
  }

  if (params.materia) {
    resultados = resultados.filter((doc) => doc.materia === params.materia);
  }

  if (params.tipoResolucion) {
    resultados = resultados.filter((doc) => doc.tipo === params.tipoResolucion);
  }

  const page = params.pagina || 1;
  const limit = params.limit || CONFIG.PAGE_SIZE;
  const start = (page - 1) * limit;
  const paginatedResults = resultados.slice(start, start + limit);

  return {
    total: resultados.length,
    pagina: page,
    totalPaginas: Math.ceil(resultados.length / limit),
    resultados: paginatedResults.map((doc) => ({
      id: doc.id,
      cita: doc.jurisprudenciaCita || doc.id,
      fecha: doc.fechaPublicacion,
      tribunal: doc.tribunal.nombre,
      tipo: doc.tipo,
      materia: doc.materia,
      resumen: doc.resumen || doc.fallo?.substring(0, 200) + '...' || '',
      url: '#',
    })),
  };
}

export async function obtenerDocumentoCendoj(id: string): Promise<CendojDocumento | null> {
  await delay(CONFIG.MOCK_DELAY);
  return MOCK_CENDOJ_DOCUMENTS.find((d) => d.id === id) || null;
}

// ============================================
// BÚSQUEDA UNIFICADA
// ============================================

export async function busquedaAvanzada(params: BusquedaAvanzadaParams): Promise<BusquedaResponse> {
  await delay(CONFIG.MOCK_DELAY);

  const todosLosDocumentos: LegislacionBase[] = [
    ...MOCK_BOE_DOCUMENTS,
    ...MOCK_CENDOJ_DOCUMENTS,
    ...MOCK_CODIGOS,
  ];

  let resultados = [...todosLosDocumentos];

  // Query de búsqueda
  if (params.query) {
    const query = params.query.toLowerCase();
    resultados = resultados.filter(
      (doc) =>
        doc.titulo.toLowerCase().includes(query) ||
        doc.resumen?.toLowerCase().includes(query) ||
        doc.palabrasClave.some((kw) => kw.toLowerCase().includes(query))
    );
  }

  // Filtros
  if (params.tipo && params.tipo.length > 0) {
    resultados = resultados.filter((doc) => params.tipo!.includes(doc.tipo));
  }

  if (params.materia && params.materia.length > 0) {
    resultados = resultados.filter((doc) => params.materia!.includes(doc.materia));
  }

  if (params.vigencia && params.vigencia.length > 0) {
    resultados = resultados.filter((doc) => params.vigencia!.includes(doc.vigencia));
  }

  if (params.fechaDesde) {
    resultados = resultados.filter((doc) => doc.fechaPublicacion >= params.fechaDesde!);
  }
  if (params.fechaHasta) {
    resultados = resultados.filter((doc) => doc.fechaPublicacion <= params.fechaHasta!);
  }

  // Ordenamiento
  if (params.sortBy === 'fecha_desc') {
    resultados.sort((a, b) => b.fechaPublicacion.getTime() - a.fechaPublicacion.getTime());
  } else if (params.sortBy === 'fecha_asc') {
    resultados.sort((a, b) => a.fechaPublicacion.getTime() - b.fechaPublicacion.getTime());
  } else if (params.sortBy === 'titulo') {
    resultados.sort((a, b) => a.titulo.localeCompare(b.titulo));
  }

  // Paginación
  const page = params.pagina || 1;
  const limit = params.limit || CONFIG.PAGE_SIZE;
  const start = (page - 1) * limit;
  const paginatedResults = resultados.slice(start, start + limit);

  // Calcular facets
  const facets = {
    tipos: Object.entries(
      resultados.reduce((acc, doc) => {
        acc[doc.tipo] = (acc[doc.tipo] || 0) + 1;
        return acc;
      }, {} as Record<string, number>)
    ).map(([valor, count]) => ({ valor, count })),
    materias: Object.entries(
      resultados.reduce((acc, doc) => {
        acc[doc.materia] = (acc[doc.materia] || 0) + 1;
        return acc;
      }, {} as Record<string, number>)
    ).map(([valor, count]) => ({ valor, count })),
    organismo: Object.entries(
      resultados.reduce((acc, doc) => {
        acc[doc.organismoEmisor] = (acc[doc.organismoEmisor] || 0) + 1;
        return acc;
      }, {} as Record<string, number>)
    ).map(([valor, count]) => ({ valor, count })),
    vigencia: Object.entries(
      resultados.reduce((acc, doc) => {
        acc[doc.vigencia] = (acc[doc.vigencia] || 0) + 1;
        return acc;
      }, {} as Record<string, number>)
    ).map(([valor, count]) => ({ valor, count })),
    anios: Object.entries(
      resultados.reduce((acc, doc) => {
        const anio = doc.fechaPublicacion.getFullYear().toString();
        acc[anio] = (acc[anio] || 0) + 1;
        return acc;
      }, {} as Record<string, number>)
    ).map(([valor, count]) => ({ valor, count })),
  };

  return {
    total: resultados.length,
    pagina: page,
    totalPaginas: Math.ceil(resultados.length / limit),
    tiempoBusqueda: Math.floor(Math.random() * 200) + 50, // Mock tiempo
    resultados: paginatedResults,
    facets,
  };
}

// ============================================
// CÓDIGOS Y CONSTITUCIÓN
// ============================================

export async function obtenerCodigos(): Promise<CodigoLegislacion[]> {
  await delay(CONFIG.MOCK_DELAY);
  return MOCK_CODIGOS;
}

export async function obtenerCodigoPorId(id: string): Promise<CodigoLegislacion | null> {
  await delay(CONFIG.MOCK_DELAY);
  return MOCK_CODIGOS.find((c) => c.id === id) || null;
}

// ============================================
// ESTADÍSTICAS Y SINCRONIZACIÓN
// ============================================

export async function obtenerEstadisticas(): Promise<LegislacionStats> {
  await delay(CONFIG.MOCK_DELAY);

  const todosLosDocumentos = [...MOCK_BOE_DOCUMENTS, ...MOCK_CENDOJ_DOCUMENTS, ...MOCK_CODIGOS];

  return {
    totalDocumentos: todosLosDocumentos.length,
    porTipo: todosLosDocumentos.reduce((acc, doc) => {
      const tipo = doc.tipo as TipoDocumento;
      acc[tipo] = (acc[tipo] || 0) + 1;
      return acc;
    }, {} as Record<TipoDocumento, number>),
    porMateria: todosLosDocumentos.reduce((acc, doc) => {
      acc[doc.materia] = (acc[doc.materia] || 0) + 1;
      return acc;
    }, {} as Record<Materia, number>),
    porAnio: todosLosDocumentos.reduce((acc, doc) => {
      const anio = doc.fechaPublicacion.getFullYear().toString();
      acc[anio] = (acc[anio] || 0) + 1;
      return acc;
    }, {} as Record<string, number>),
    nuevosEstaSemana: 3,
    nuevosEsteMes: 12,
    documentosSinPdf: 0,
    documentosSinResumen: 0,
  };
}

export async function obtenerEstadoSincronizacion(): Promise<EstadoSincronizacion> {
  await delay(CONFIG.MOCK_DELAY);

  return {
    boe: {
      estado: 'success',
      ultimaActualizacion: new Date(),
      documentosNuevos: 5,
    },
    cendoj: {
      estado: 'success',
      ultimaActualizacion: new Date(),
      documentosNuevos: 2,
    },
  };
}

export async function sincronizarFuentes(): Promise<EstadoSincronizacion> {
  await delay(2000); // Simular sincronización más larga
  return obtenerEstadoSincronizacion();
}

// ============================================
// EXPORTAR DATOS MOCK (para desarrollo)
// ============================================

export { MOCK_BOE_DOCUMENTS, MOCK_CENDOJ_DOCUMENTS, MOCK_CODIGOS };

// ============================================
// FUNCIÓN SIMPLIFICADA DE BÚSQUEDA
// ============================================

export interface BuscarNormasParams {
  texto?: string;
  tipo?: TipoDocumento;
  fechaDesde?: Date;
  fechaHasta?: Date;
}

export async function buscarNormas(params: BuscarNormasParams): Promise<BusquedaResponse> {
  return busquedaAvanzada({
    query: params.texto,
    tipo: params.tipo ? [params.tipo] : undefined,
    fechaDesde: params.fechaDesde,
    fechaHasta: params.fechaHasta,
    pagina: 1,
    limit: 20,
  });
}

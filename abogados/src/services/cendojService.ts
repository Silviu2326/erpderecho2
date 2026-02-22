/**
 * Servicio de integración con la API del CENDOJ (Centro de Documentación Judicial)
 * 
 * Documentación: https://www.poderjudicial.es/cgpj/es/Tribunales/CENDOJ/
 * API: https://www.poderjudicial.es/cgpj/es/Tribunales/CENDOJ/Busqueda-de-resoluciones
 * 
 * NOTA: Este archivo contiene implementación MOCK para desarrollo frontend.
 * Para producción, configurar las credenciales reales en variables de entorno:
 * - VITE_CENDOJ_API_KEY: Clave API del CENDOJ
 */

import type {
  CendojSearchResponse,
  CendojDocumentoResumen,
  CendojDocumento,
  JurisprudenciaDetalle,
  TipoResolucionJudicial,
  TipoTribunal,
  Materia,
  SentenciaTipoFallo,
  TribunalDetalle,
} from '@/types/legislacion';

const CONFIG = {
  USE_MOCK: true,
  MOCK_DELAY: 400,
  PAGE_SIZE: 20,
  BASE_URL: 'https://www.poderjudicial.es/cgpj/rest/api',
};

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

const MOCK_JURISPRUDENCIA: CendojDocumento[] = [
  {
    id: 'STS-2026-1234',
    tipo: 'sentencia',
    titulo: 'Sentencia del Tribunal Supremo, Sala Primera, de lo Civil, STS 1234/2026',
    resumen: 'Sobre revisión de cláusulas abusivas en contratos de préstamo hipotecario. Establece criterios interpretativos sobre el control de transparencia y la protección del consumidor.',
    materia: 'civil',
    fechaPublicacion: new Date('2026-02-15'),
    vigencia: 'vigente',
    organismoEmisor: 'tribunal_supremo',
    urlPdf: 'https://www.poderjudicial.es/search/descargaFichero?cid=1234',
    urlHtml: 'https://www.poderjudicial.es/search/resoluciones/detail/STS-2026-1234',
    palabrasClave: ['cláusulas abusivas', 'hipoteca', 'protección consumidor', 'transparencia'],
    tribunal: {
      id: 'ts-civil',
      nombre: 'Tribunal Supremo - Sala Primera',
      tipo: 'supremo',
      provincia: 'Madrid',
    },
    ponente: 'Magtrate. D. Juan García López',
    numeroResolucion: '1234',
    numeroProcedimiento: '2345/2024',
    procedimiento: 'Casación',
    sala: 'Sala Primera',
    seccion: '1',
    tipoProcedimiento: 'Civil',
    antecedentes: 'Se interpuso recurso de casación contra sentencia de la Audiencia Provincial de Madrid...',
    hechosProbados: 'Primero. El contrato de préstamo hipotecario fue firmado el 15 de marzo de 2019...',
    fundamentosDeDerecho: 'Primero. El control de transparencia de las cláusulas no negociadas...',
    fallo: 'Se estima parcialmente el recurso, se declaranabusivas las cláusulas...]',
    costas: 'No se hacen especiales pronunciamientos sobre costas.',
    doctrinaAplicable: ['STS 15/2023', 'STS 567/2022', 'STS 890/2021'],
    leyesAplicables: ['Ley 57/1968', 'Ley 2/2009', 'RDL 1/2007'],
    firmeza: 'firme',
    fechaFirmeza: new Date('2026-02-20'),
  },
  {
    id: 'STS-2026-987',
    tipo: 'sentencia',
    titulo: 'Sentencia del Tribunal Supremo, Sala Segunda, Penal, STS 987/2026',
    resumen: 'Responsabilidad penal de las personas jurídicas en delitos de corrupción. Análisis de los programas de cumplimiento y su eficacia como eximente o atenuante.',
    materia: 'penal',
    fechaPublicacion: new Date('2026-02-10'),
    vigencia: 'vigente',
    organismoEmisor: 'tribunal_supremo',
    urlPdf: 'https://www.poderjudicial.es/search/descargaFichero?cid=987',
    urlHtml: 'https://www.poderjudicial.es/search/resoluciones/detail/STS-2026-987',
    palabrasClave: ['responsabilidad penal', 'persona jurídica', 'compliance', 'corrupción'],
    tribunal: {
      id: 'ts-penal',
      nombre: 'Tribunal Supremo - Sala Segunda',
      tipo: 'supremo',
      provincia: 'Madrid',
    },
    ponente: 'Magistrado D. Carlos Martínez Sánchez',
    numeroResolucion: '987',
    numeroProcedimiento: '4567/2023',
    procedimiento: 'Casación',
    sala: 'Sala Segunda',
    seccion: '1',
    tipoProcedimiento: 'Penal',
    antecedentes: 'Se interpuso recurso de casación por condena a persona jurídica...',
    hechosProbados: 'Primero. Los hechos probados reflejan que los administradores...',
    fundamentosDeDerecho: 'Primero. La responsabilidad penal de las personas jurídicas...',
    fallo: 'Se desestima el recurso, se confirma la sentencia recurrida.',
    costas: 'Condena a la parte recurrente en costas.',
    doctrinaAplicable: ['STS 154/2024', 'STS 678/2023'],
    leyesAplicables: ['Código Penal arts. 33, 31 bis'],
    firmeza: 'firme',
    fechaFirmeza: new Date('2026-02-12'),
  },
  {
    id: 'STS-2026-543',
    tipo: 'sentencia',
    titulo: 'Sentencia del Tribunal Supremo, Sala Cuarta, de lo Social, STS 543/2026',
    resumen: 'Extinción de contrato de trabajo por causas objetivas. Validez del Expediente de Regulación Temporal de Empleo y derechos de los trabajadores.',
    materia: 'laboral',
    fechaPublicacion: new Date('2026-02-08'),
    vigencia: 'vigente',
    organismoEmisor: 'tribunal_supremo',
    urlPdf: 'https://www.poderjudicial.es/search/descargaFichero?cid=543',
    urlHtml: 'https://www.poderjudicial.es/search/resoluciones/detail/STS-2026-543',
    palabrasClave: ['ERTE', 'extinción contrato', 'causas objetivas', 'trabajador'],
    tribunal: {
      id: 'ts-social',
      nombre: 'Tribunal Supremo - Sala Cuarta',
      tipo: 'supremo',
      provincia: 'Madrid',
    },
    ponente: 'Magistrada Dª. María Rodríguez Pérez',
    numeroResolucion: '543',
    numeroProcedimiento: '3214/2024',
    procedimiento: 'Unificación de Doctrina',
    sala: 'Sala Cuarta',
    seccion: '1',
    tipoProcedimiento: 'Social',
    antecedentes: 'Se solicita unificación de doctrina respecto de sentencia...',
    hechosProbados: 'Primero. La empresa挺好的...',
    fundamentosDeDerecho: 'Primero. La interpretación del artículo 52 del Estatuto de los Trabajadores...',
    fallo: 'Se estima el recurso, se casa y anula la sentencia recurrida.',
    costas: 'No se hacen especiales pronunciamientos.',
    doctrinaAplicable: ['STS 789/2025', 'STS 234/2025'],
    leyesAplicables: ['Estatuto de los Trabajadores', 'RDL 8/2020'],
    firmeza: 'firme',
  },
  {
    id: 'STS-2025-4567',
    tipo: 'sentencia',
    titulo: 'Sentencia del Tribunal Supremo, Sala Tercera, de lo Contencioso-Administrativo, STS 4567/2025',
    resumen: 'Procedimiento administrativo sancionador en materia de protección de datos. Plazos de prescripción y garantías del procedimiento.',
    materia: 'administrativo',
    fechaPublicacion: new Date('2025-12-20'),
    vigencia: 'vigente',
    organismoEmisor: 'tribunal_supremo',
    urlPdf: 'https://www.poderjudicial.es/search/descargaFichero?cid=4567',
    urlHtml: 'https://www.poderjudicial.es/search/resoluciones/detail/STS-2025-4567',
    palabrasClave: ['sanción', 'protección de datos', 'prescripción', 'procedimiento administrativo'],
    tribunal: {
      id: 'ts-contencioso',
      nombre: 'Tribunal Supremo - Sala Tercera',
      tipo: 'supremo',
      provincia: 'Madrid',
    },
    ponente: 'Magistrado D. Antonio García Torres',
    numeroResolucion: '4567',
    numeroProcedimiento: '6789/2023',
    procedimiento: 'Casación',
    sala: 'Sala Tercera',
    seccion: '4',
    tipoProcedimiento: 'Contencioso-Administrativo',
    antecedentes: 'Recurso de casación contra sentencia de la Audiencia Nacional...',
    hechosProbados: 'La AEPD impuso sanción a la entidad recurrente...',
    fundamentosDeDerecho: 'Primero. El plazo de prescripción de las infracciones...',
    fallo: 'Se estima el recurso, se anula la sanción impuesta.',
    costas: 'Condena a la Administration en costas.',
    doctrinaAplicable: ['STS 2345/2024', 'STS 1890/2024'],
    leyesAplicables: ['RGPD', 'LOPDGDD', 'Ley 39/2015'],
    firmeza: 'firme',
  },
  {
    id: 'AN-2026-234',
    tipo: 'sentencia',
    titulo: 'Sentencia de la Audiencia Nacional, Sala de lo Penal, S/ 234/2026',
    resumen: 'Delitos contra la Hacienda Pública. Investigación de trama de fraude fiscal transfronterizo. Competencia de la Audiencia Nacional.',
    materia: 'penal',
    fechaPublicacion: new Date('2026-01-25'),
    vigencia: 'vigente',
    organismoEmisor: 'audiencia_nacional',
    urlPdf: 'https://www.poderjudicial.es/search/descargaFichero?cid=an234',
    urlHtml: 'https://www.poderjudicial.es/search/resoluciones/detail/AN-2026-234',
    palabrasClave: ['fraude fiscal', 'Audiencia Nacional', 'delitos económicos', 'investigación'],
    tribunal: {
      id: 'an-penal',
      nombre: 'Audiencia Nacional - Sala de lo Penal',
      tipo: 'nacional',
      provincia: 'Madrid',
    },
    ponente: 'Magistrado D. Fernando López Hernández',
    numeroResolucion: '234',
    numeroProcedimiento: '3/2025',
    procedimiento: 'Procedimiento Abreviado',
    sala: 'Sala de lo Penal',
    seccion: '1',
    tipoProcedimiento: 'Penal',
    antecedentes: 'Diligencias de investigación penal por delitos contra la Hacienda Pública...',
    hechosProbados: 'Primero. Los procesados constituían una trama...',
    fundamentosDeDerecho: 'Primero. La competencia de la Audiencia Nacional...',
    fallo: 'Se condena a los procesados como autores de delito contra la Hacienda Pública.',
    costas: 'Condena en costas.',
    doctrinaAplicable: ['AN 45/2024'],
    leyesAplicables: ['Código Penal arts. 305, 306'],
    firmeza: 'recurrida',
  },
  {
    id: 'TSJM-2026-567',
    tipo: 'sentencia',
    titulo: 'Sentencia del Tribunal Superior de Justicia de Cataluña, Sala de lo Contencioso-Administrativo, STSJ CAT 567/2026',
    resumen: 'Régimen lingüístico en la Administración pública de Cataluña. Uso del catalán y derechos de los ciudadanos.',
    materia: 'administrativo',
    fechaPublicacion: new Date('2026-02-01'),
    vigencia: 'vigente',
    organismoEmisor: 'tribunal_superior_justicia',
    urlPdf: 'https://www.poderjudicial.es/search/descargaFichero?cid=tsj567',
    urlHtml: 'https://www.poderjudicial.es/search/resoluciones/detail/TSJM-2026-567',
    palabrasClave: ['lengua catalana', 'Administración pública', 'derechos lingüísticos'],
    tribunal: {
      id: 'tsj-cataluna',
      nombre: 'Tribunal Superior de Justicia de Cataluña',
      tipo: 'superior',
      provincia: 'Barcelona',
      comunidadAutonoma: 'Cataluña',
    },
    ponente: 'Magistrada Dª. Cristina Martínez Vila',
    numeroResolucion: '567',
    numeroProcedimiento: '890/2024',
    procedimiento: 'Recurso Contencioso-Administrativo',
    sala: 'Sala de lo Contencioso-Administrativo',
    seccion: '1',
    tipoProcedimiento: 'Contencioso-Administrativo',
    antecedentes: 'Recurso contra resolución de la Generalitat de Cataluña...',
    fundamentosDeDerecho: 'Primero. El derecho al uso de las lenguas cooficiales...',
    fallo: 'Se desestima el recurso.',
    doctrinaAplicable: ['TC 31/2010'],
    leyesAplicables: ['Estatuto de Cataluña', 'Ley 1/1998'],
    firmeza: 'firme',
  },
  {
    id: 'APM-2026-189',
    tipo: 'sentencia',
    titulo: 'Sentencia de la Audiencia Provincial de Madrid, Sección 11ª, APM 189/2026',
    resumen: 'Responsabilidad civil extracontractual. Accidente de tráfico. Determinación de indemnizaciones por daños personales.',
    materia: 'civil',
    fechaPublicacion: new Date('2026-01-30'),
    vigencia: 'vigente',
    organismoEmisor: 'audiencia_provincial',
    urlPdf: 'https://www.poderjudicial.es/search/descargaFichero?cid=apm189',
    urlHtml: 'https://www.poderjudicial.es/search/resoluciones/detail/APM-2026-189',
    palabrasClave: ['accidente tráfico', 'responsabilidad civil', 'indemnización', 'daños'],
    tribunal: {
      id: 'ap-madrid',
      nombre: 'Audiencia Provincial de Madrid',
      tipo: 'provincial',
      provincia: 'Madrid',
    },
    ponente: 'Magistrado D. Diego Ruiz Sánchez',
    numeroResolucion: '189',
    numeroProcedimiento: '1456/2024',
    procedimiento: 'Apelación',
    seccion: '11',
    tipoProcedimiento: 'Civil',
    antecedentes: 'Recurso de apelación contra sentencia del Juzgado de Primera Instancia...',
    fundamentosDeDerecho: 'Primero. La responsabilidad civil derivada de accidentes de circulación...',
    fallo: 'Se confirma la sentencia apelada.',
    costas: 'No se hacen especiales pronunciamientos.',
    leyesAplicables: ['Ley sobre Responsabilidad Civil y Seguro en la Circulación de Vehículos a Motor'],
    firmeza: 'firme',
  },
  {
    id: 'STS-2025-3456',
    tipo: 'auto',
    titulo: 'Auto del Tribunal Supremo, Sala Primera, de lo Civil, ATS 3456/2025',
    resumen: 'Admisión a trámite de recurso de casación. Cuestión de interés casacional objetivo para la formación de jurisprudencia.',
    materia: 'civil',
    fechaPublicacion: new Date('2025-11-15'),
    vigencia: 'vigente',
    organismoEmisor: 'tribunal_supremo',
    urlPdf: 'https://www.poderjudicial.es/search/descargaFichero?cid=ats3456',
    urlHtml: 'https://www.poderjudicial.es/search/resoluciones/detail/STS-2025-3456',
    palabrasClave: ['admisión', 'casación', 'interés casacional', 'jurisprudencia'],
    tribunal: {
      id: 'ts-civil',
      nombre: 'Tribunal Supremo - Sala Primera',
      tipo: 'supremo',
      provincia: 'Madrid',
    },
    ponente: 'Magistrado D. José Manuel Torres',
    numeroResolucion: '3456',
    numeroProcedimiento: '2345/2024',
    procedimiento: 'Casación',
    sala: 'Sala Primera',
    tipoProcedimiento: 'Civil',
    antecedentes: 'Se interesa la admisión del recurso de casación...',
    fundamentosDeDerecho: 'Primero. La cuestión planteada presenta interés casacional...',
    fallo: 'Se admite a trámite el recurso.',
    firmeza: 'firme',
  },
];

export interface CendojBusquedaOpciones {
  query?: string;
  fechaDesde?: Date;
  fechaHasta?: Date;
  tribunal?: TipoTribunal;
  tipoResolucion?: TipoResolucionJudicial;
  ponente?: string;
  numeroProcedimiento?: string;
  materia?: Materia;
  procedimiento?: string;
  pagina?: number;
  limit?: number;
  ordenarPor?: 'fecha' | 'relevancia';
}

export async function buscarCendoj(
  params: CendojBusquedaOpciones
): Promise<CendojSearchResponse> {
  if (CONFIG.USE_MOCK) {
    await delay(CONFIG.MOCK_DELAY);
    return buscarCendojMock(params);
  }

  return buscarCendojApi(params);
}

async function buscarCendojApi(
  params: CendojBusquedaOpciones
): Promise<CendojSearchResponse> {
  const queryParams = new URLSearchParams();

  if (params.query) queryParams.set('q', params.query);
  if (params.fechaDesde) queryParams.set('fecha_desde', formatFechaApi(params.fechaDesde));
  if (params.fechaHasta) queryParams.set('fecha_hasta', formatFechaApi(params.fechaHasta));
  if (params.tribunal) queryParams.set('tribunal', params.tribunal);
  if (params.tipoResolucion) queryParams.set('tipo', params.tipoResolucion);
  if (params.ponente) queryParams.set('ponente', params.ponente);
  if (params.materia) queryParams.set('materia', params.materia);
  if (params.pagina) queryParams.set('pagina', params.pagina.toString());
  if (params.limit) queryParams.set('tamano', params.limit.toString());

  const response = await fetch(`${CONFIG.BASE_URL}/busqueda?${queryParams.toString()}`, {
    headers: {
      'Accept': 'application/json',
    },
  });

  if (!response.ok) {
    throw new Error(`Error en la búsqueda del CENDOJ: ${response.status}`);
  }

  return response.json();
}

async function buscarCendojMock(
  params: CendojBusquedaOpciones
): Promise<CendojSearchResponse> {
  let resultados = [...MOCK_JURISPRUDENCIA];

  if (params.query) {
    const query = params.query.toLowerCase();
    resultados = resultados.filter(
      (doc) =>
        doc.titulo.toLowerCase().includes(query) ||
        doc.resumen?.toLowerCase().includes(query) ||
        doc.palabrasClave.some((kw) => kw.toLowerCase().includes(query)) ||
        doc.numeroResolucion.includes(query)
    );
  }

  if (params.fechaDesde) {
    resultados = resultados.filter((doc) => doc.fechaPublicacion >= params.fechaDesde!);
  }

  if (params.fechaHasta) {
    resultados = resultados.filter((doc) => doc.fechaPublicacion <= params.fechaHasta!);
  }

  if (params.tribunal) {
    resultados = resultados.filter(
      (doc) => doc.tribunal?.tipo === params.tribunal?.replace('tribunal_', '').replace('juzgado_', '')
    );
  }

  if (params.tipoResolucion) {
    resultados = resultados.filter((doc) => doc.tipo === params.tipoResolucion);
  }

  if (params.materia) {
    resultados = resultados.filter((doc) => doc.materia === params.materia);
  }

  if (params.ponente) {
    resultados = resultados.filter((doc) =>
      doc.ponente?.toLowerCase().includes(params.ponente!.toLowerCase())
    );
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

function mapToResumen(docs: CendojDocumento[]): CendojDocumentoResumen[] {
  return docs.map((doc) => ({
    id: doc.id,
    cita: formatearCitaCendoj(doc),
    fecha: doc.fechaPublicacion,
    tribunal: doc.tribunal?.nombre || doc.organismoEmisor,
    tipo: doc.tipo,
    materia: doc.materia,
    resumen: doc.resumen || '',
    url: doc.urlHtml || `https://www.poderjudicial.es/search/indexAN.jsp`,
  }));
}

function formatearCitaCendoj(doc: CendojDocumento): string {
  const prefijo = getPrefijoTipo(doc.tipo);
  const tribunal = getAbreviaturaTribunal(doc.organismoEmisor);
  return `${prefijo} ${tribunal} ${doc.numeroResolucion}/${doc.fechaPublicacion.getFullYear()}`;
}

function getPrefijoTipo(tipo: string): string {
  const prefijos: Record<string, string> = {
    sentencia: 'STS',
    auto: 'ATS',
    providencia: 'ATP',
    decreto: 'D',
  };
  return prefijos[tipo] || tipo.toUpperCase();
}

function getAbreviaturaTribunal(organismo: string): string {
  const abrev: Record<string, string> = {
    tribunal_supremo: 'TS',
    audiencia_nacional: 'AN',
    tribunal_superior_justicia: 'TSJ',
    audiencia_provincial: 'AP',
    tribunal_constitucional: 'TC',
  };
  return abrev[organismo] || organismo;
}

export async function obtenerResolucionCendoj(
  id: string
): Promise<JurisprudenciaDetalle | null> {
  if (CONFIG.USE_MOCK) {
    await delay(CONFIG.MOCK_DELAY);
    return obtenerResolucionCendojMock(id);
  }

  return obtenerResolucionCendojApi(id);
}

async function obtenerResolucionCendojApi(
  id: string
): Promise<JurisprudenciaDetalle | null> {
  const response = await fetch(`${CONFIG.BASE_URL}/resolucion/${id}`, {
    headers: {
      'Accept': 'application/json',
    },
  });

  if (!response.ok) {
    if (response.status === 404) return null;
    throw new Error(`Error al obtener resolución: ${response.status}`);
  }

  return response.json();
}

async function obtenerResolucionCendojMock(
  id: string
): Promise<JurisprudenciaDetalle | null> {
  const doc = MOCK_JURISPRUDENCIA.find((d) => d.id === id);
  if (!doc) return null;

  return mapToDetalle(doc);
}

function mapToDetalle(doc: CendojDocumento): JurisprudenciaDetalle {
  const tribunalDetalle: TribunalDetalle = {
    tipo: mapOrganismoToTribunal(doc.organismoEmisor),
    nombre: doc.tribunal?.nombre || doc.organismoEmisor,
    provincia: doc.tribunal?.provincia,
    comunidadAutonoma: doc.tribunal?.comunidadAutonoma,
  };

  return {
    id: doc.id,
    tipo: doc.tipo as TipoResolucionJudicial,
    numeroResolucion: doc.numeroResolucion,
    annoResolucion: doc.fechaPublicacion.getFullYear(),
    numeroProcedimiento: doc.numeroProcedimiento,
    tribunal: tribunalDetalle,
    sala: doc.sala as any,
    ponente: doc.ponente,
    fechaResolucion: doc.fechaPublicacion,
    fechaPublicacion: doc.fechaPublicacion,
    antecedentesHechos: doc.antecedentes,
    hechosProbados: doc.hechosProbados,
    fundamentosDerecho: doc.fundamentosDeDerecho,
    fallo: doc.fallo,
    tipoFallo: mapFallo(doc.fallo),
    contenidoFallo: doc.fallo,
    normasAplicadas: doc.leyesAplicables?.map((l: string) => ({
      id: l,
      titulo: l,
      url: '',
      fecha: new Date(),
      tipo: 'ley',
    })),
    doctrina: doc.doctrinaAplicable,
    firmeza: doc.firmeza as any,
    palabrasClave: doc.palabrasClave,
  };
}

function mapOrganismoToTribunal(organismo: string): TipoTribunal {
  const map: Record<string, TipoTribunal> = {
    tribunal_supremo: 'tribunal_supremo',
    audiencia_nacional: 'audiencia_nacional',
    tribunal_superior_justicia: 'tribunal_superior_justicia',
    audiencia_provincial: 'audiencia_provincial',
  };
  return map[organismo] || 'juzgado_primera_instancia';
}

function mapFallo(fallo?: string): SentenciaTipoFallo {
  if (!fallo) return 'desestimatorio';
  const falloLower = fallo.toLowerCase();
  if (falloLower.includes('estim')) {
    return falloLower.includes('parcial') ? 'estimatorio_parcial' : 'estimatorio_total';
  }
  if (falloLower.includes('desestim')) return 'desestimatorio';
  if (falloLower.includes('absol')) return 'absolucion';
  if (falloLower.includes('conden')) return 'condena';
  return 'desestimatorio';
}

export async function buscarPorTribunal(
  tipo: TipoTribunal,
  opciones?: Partial<CendojBusquedaOpciones>
): Promise<CendojSearchResponse> {
  return buscarCendoj({
    tribunal: tipo,
    ...opciones,
  });
}

export async function buscarPorMateria(
  materia: Materia,
  opciones?: Partial<CendojBusquedaOpciones>
): Promise<CendojSearchResponse> {
  return buscarCendoj({
    materia,
    ...opciones,
  });
}

export async function buscarUltimasResoluciones(
  dias: number = 7,
  tipoResolucion?: TipoResolucionJudicial
): Promise<CendojSearchResponse> {
  const fechaDesde = new Date();
  fechaDesde.setDate(fechaDesde.getDate() - dias);

  return buscarCendoj({
    fechaDesde,
    tipoResolucion,
    ordenarPor: 'fecha',
    limit: 20,
  });
}

export async function buscarResolucionesPorProcedimiento(
  numeroProcedimiento: string
): Promise<CendojSearchResponse> {
  return buscarCendoj({
    numeroProcedimiento,
    limit: 50,
  });
}

export async function buscarPorPonente(
  ponente: string,
  opciones?: Partial<CendojBusquedaOpciones>
): Promise<CendojSearchResponse> {
  return buscarCendoj({
    ponente,
    ...opciones,
  });
}

export async function obtenerEstadisticasCendoj(): Promise<{
  totalResoluciones: number;
  porTipo: Record<string, number>;
  porMateria: Record<string, number>;
  ultimos30Dias: number;
}> {
  if (CONFIG.USE_MOCK) {
    await delay(CONFIG.MOCK_DELAY);
    return {
      totalResoluciones: MOCK_JURISPRUDENCIA.length,
      porTipo: {
        sentencia: MOCK_JURISPRUDENCIA.filter((d) => d.tipo === 'sentencia').length,
        auto: MOCK_JURISPRUDENCIA.filter((d) => d.tipo === 'auto').length,
        providencia: MOCK_JURISPRUDENCIA.filter((d) => d.tipo === 'providencia').length,
      },
      porMateria: {
        civil: MOCK_JURISPRUDENCIA.filter((d) => d.materia === 'civil').length,
        penal: MOCK_JURISPRUDENCIA.filter((d) => d.materia === 'penal').length,
        laboral: MOCK_JURISPRUDENCIA.filter((d) => d.materia === 'laboral').length,
        administrativo: MOCK_JURISPRUDENCIA.filter((d) => d.materia === 'administrativo').length,
      },
      ultimos30Dias: MOCK_JURISPRUDENCIA.filter((d) => {
        const hace30 = new Date();
        hace30.setDate(hace30.getDate() - 30);
        return d.fechaPublicacion >= hace30;
      }).length,
    };
  }

  return buscarCendoj({ limit: 1 }).then((res) => ({
    totalResoluciones: res.total,
    porTipo: {},
    porMateria: {},
    ultimos30Dias: 0,
  }));
}

function formatFechaApi(date: Date): string {
  return date.toISOString().split('T')[0];
}

export { MOCK_JURISPRUDENCIA };

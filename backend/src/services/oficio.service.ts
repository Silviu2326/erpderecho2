import { prisma } from '../config/database';
import { ServiceException, PaginationParams, PaginatedResult } from './base.types';

export interface CreateOficioInput {
  nombre: string;
  tipo: string;
  contenido?: string;
  expedienteId?: string;
}

export interface UpdateOficioInput {
  nombre?: string;
  tipo?: string;
  contenido?: string;
}

export interface GenerateOficioInput {
  plantillaId: string;
  expedienteId: string;
  datos: Record<string, any>;
}

export interface QueryOficioParams extends PaginationParams {
  tipo?: string;
  search?: string;
  expediente_id?: string;
}

class OficioService {
  private plantillasBase: Map<string, any> = new Map([
    ['DEMANDA', {
      titulo: 'Demanda',
      tipo: 'DEMANDA',
      contenido: `D./Dña. {{nombre_abogado}}, Abogado/a del Ilustre Colegio de Abogados de {{provincia}}, con número de colegiado {{numero_colegiado}}, ante el {{jurado}} comparezco y respetuosamente expongo:

Que, por medio del presente escrito, interponho DEMANDA contra {{demandado}}, en materia {{materia}}, según lo dispuesto en los artículos 247 y siguientes de la Ley de Enjuiciamiento Civil.

PRIMERO.- De los hechos:
{{hechos}}

SEGUNDO.- De los fundamentos de derecho:
{{fundamentos}}

Por lo expuesto,
SUPLICO AL JUZGADO que, teniendo por presentado este escrito con los documentos que se acompañan, se sirva admitirlo, tenga por interpuesta DEMANDA contra {{demandado}}, y, previos los trámites legales oportunos, dicte Sentencia por la que se condene al demandado a {{pretensiones}}.

Es Justicia que respetuosamente pido en {{lugar}}, a {{fecha}}.

{{firma}}
{{nombre_abogado}}
Abogado - Colegiado nº {{numero_colegiado}}`
    }],
    ['CONTESTACION_DEMANDA', {
      titulo: 'Contestación a la Demanda',
      tipo: 'CONTESTACION_DEMANDA',
      contenido: `D./Dña. {{nombre_abogado}}, Abogado/a del Ilustre Colegio de Abogados de {{provincia}}, con número de colegiado {{numero_colegiado}}, ante el {{jurado}} comparezco y respetuosamente expongo:

Que, habiendo sido emplazado para contestar a la demanda interpuesta por {{demandante}}, por medio del presente escrito formulo CONTESTACIÓN A LA DEMANDA.

PRIMERO.- De los hechos:
{{hechos}}

SEGUNDO.- De los fundamentos de derecho:
{{fundamentos}}

Por lo expuesto,
SUPLICO AL JUZGADO que, teniendo por presentado este escrito, se sirva tener por formulada Contestación a la Demanda y dicte Sentencia por la que se desestime íntegramente la demanda, con expresa imposición de costas a la parte actora.

Es Justicia que respetuosamente pido en {{lugar}}, a {{fecha}}.

{{firma}}
{{nombre_abogado}}
Abogado - Colegiado nº {{numero_colegiado}}`
    }],
    ['ESCRITO_RECURSO', {
      titulo: 'Recurso de Apelación',
      tipo: 'ESCRITO_RECURSO',
      contenido: `D./Dña. {{nombre_abogado}}, Abogado/a del Ilustre Colegio de Abogados de {{provincia}}, con número de colegiado {{numero_colegiado}}, ante la Sala comparezco y respetuosamente expongo:

Que, habiendo sido notificada la Sentencia de fecha {{fecha_sentencia}}, dictada en el procedimiento {{numero_expediente}}, por medio del presente escrito interponho RECURSO DE APELACIÓN contra la misma.

PRIMERO.- De los hechos:
{{hechos}}

SEGUNDO.- De los fundamentos de derecho:
{{fundamentos}}

Por lo expuesto,
SUPLICO A LA SALA que, teniendo por presentado este escrito, se sirva admitirlo y tener por interpuesto recurso de apelación contra la Sentencia de fecha {{fecha_sentencia}}, revocando la misma.

Es Justicia que respetuosamente pido en {{lugar}}, a {{fecha}}.

{{firma}}
{{nombre_abogado}}
Abogado - Colegiado nº {{numero_colegiado}}`
    }],
    ['CARTA_PODER', {
      titulo: 'Carta de Poder',
      tipo: 'CARTA_PODER',
      contenido: `D./Dña. {{nombre_cliente}}, mayor de edad, con {{tipo_documento}} número {{numero_documento}}, y domicilio en {{domicilio}}, ante el Notario comparezco y respetuosamente expongo:

Que otorgo PODER GENERAL para pleitos a favor de D./Dña. {{nombre_abogado}}, Abogado/a del Ilustre Colegio de Abogados de {{provincia}}, con número de colegiado {{numero_colegiado}}, para que, en mi nombre y representación, pueda:

- Interponer toda clase de recursos contra resoluciones judiciales.
- Renunciar a la acción o al derecho.
- Representarme ante cualesquiera Juzgados y Tribunales.
- absolver posiciones y prestar declaración en nombre del poderdante.
- ejercitar las facultades que le confiere la Ley de Enjuiciamiento Civil.

El presente poder tendrá validez hasta su revocación expresa.

En {{lugar}}, a {{fecha}}.

{{firma_poderdante}}
{{nombre_cliente}}

{{firma_notario}}
Notario`
    }],
    ['REQUERIMIENTO', {
      titulo: 'Requerimiento de Pago',
      tipo: 'REQUERIMIENTO',
      contenido: `D./Dña. {{nombre_abogado}}, Abogado/a, en nombre y representación de mi cliente {{nombre_cliente}}, ante usted respetuosamente expongo:

Que, con fecha {{fecha_vencimiento}}, venció la obligación de pago contraída por {{deudor}}, consistente en el pago de la cantidad de {{importe}} euros, en concepto de {{concepto}}.

El deudor, a pesar de los requerimientos realizados, no ha procedido al pago de la cantidad adeudada.

Por lo expuesto,
REQUERO a {{deudor}} para que, en el plazo de {{plazo}} días hábiles, proceda al pago de la cantidad de {{importe}} euros, más los intereses legales correspondientes, en caso contrario se procederá a ejercitar las acciones legales pertinentes.

En {{lugar}}, a {{fecha}}.

{{firma}}
{{nombre_abogado}}
Abogado - Colegiado nº {{numero_colegiado}}`
    }],
    ['SOLICITUD_MEDIDAS_CAUTELARES', {
      titulo: 'Solicitud de Medidas Cautelares',
      tipo: 'SOLICITUD_MEDIDAS_CAUTELARES',
      contenido: `D./Dña. {{nombre_abogado}}, Abogado/a del Ilustre Colegio de Abogados de {{provincia}}, ante el {{jurado}} comparezco y respetuosamente expongo:

Que, en el procedimiento {{numero_expediente}}, y con el fin de asegurar la efectividad de la sentencia que recaiga, por medio del presente escrito solicito la adopción de las siguientes MEDIDAS CAUTELARES:

PRIMERO.- De la justificación de la medida:
{{justificacion}}

SEGUNDO.- De los fundamentos de derecho:
{{fundamentos}}

Por lo expuesto,
SUPLICO AL JUZGADO que, teniendo por presentado este escrito, se sirva admitirlo y adopte las medidas cautelares solicitadas.

Es Justicia que respetuosamente pido en {{lugar}}, a {{fecha}}.

{{firma}}
{{nombre_abogado}}
Abogado - Colegiado nº {{numero_colegiado}}`
    }],
    ['PRESENTACION_DOCUMENTOS', {
      titulo: 'Presentación de Documentos',
      tipo: 'PRESENTACION_DOCUMENTOS',
      contenido: `D./Dña. {{nombre_abogado}}, Abogado/a del Ilustre Colegio de Abogados de {{provincia}}, ante el {{jurado}} comparezco y respetuosamente expongo:

Que, en el procedimiento {{numero_expediente}}, por medio del presente escrito PRESENTO los siguientes documentos:

{{lista_documentos}}

Por lo expuesto,
SUPLICO AL JUZGADO que, teniendo por presentado este escrito con los documentos que se acompañan, se sirva admitirlo y tener por añadidos los mismos a los autos.

Es Justicia que respetuosamente pido en {{lugar}}, a {{fecha}}.

{{firma}}
{{nombre_abogado}}
Abogado - Colegiado nº {{numero_colegiado}}`
    }],
    ['CONCILIACION', {
      titulo: 'Solicitud de Conciliación',
      tipo: 'CONCILIACION',
      contenido: `D./Dña. {{nombre_abogado}}, Abogado/a del Ilustre Colegio de Abogados de {{provincia}}, ante el Juzgado de Primera Instancia comparezco y respetuosamente expongo:

Que, deseo intentar la vía de la conciliación con {{parte_contraria}}, en relación con {{asunto}}.

Por lo expuesto,
SUPLICO AL JUZGADO que, teniendo por presentada esta solicitud, cite a ambas partes al acto de conciliación.

Es Justicia que respetuosamente pido en {{lugar}}, a {{fecha}}.

{{firma}}
{{nombre_abogado}}
Abogado - Colegiado nº {{numero_colegiado}}`
    }],
  ]);

  async getPlantillas(tipo?: string): Promise<any[]> {
    const plantillas: any[] = [];

    this.plantillasBase.forEach((value, key) => {
      if (!tipo || value.tipo === tipo) {
        plantillas.push({
          id: key,
          ...value,
        });
      }
    });

    return plantillas;
  }

  async getPlantillaById(id: string): Promise<any> {
    const plantilla = this.plantillasBase.get(id);
    if (!plantilla) {
      throw new ServiceException('PLANTILLA_NOT_FOUND', 'Plantilla no encontrada', 404);
    }
    return { id, ...plantilla };
  }

  async generateDocument(input: GenerateOficioInput): Promise<string> {
    const { plantillaId, datos } = input;

    const plantilla = await this.getPlantillaById(plantillaId);
    let contenido = plantilla.contenido;

    Object.keys(datos).forEach(key => {
      const regex = new RegExp(`{{${key}}}`, 'g');
      contenido = contenido.replace(regex, datos[key] || '');
    });

    return contenido;
  }

  async findAllDocumentos(params: QueryOficioParams): Promise<PaginatedResult<any>> {
    const { page = 1, limit = 20, sort = 'createdAt', order = 'desc', tipo, search, expediente_id } = params;
    const skip = (page - 1) * limit;

    const where: any = { deletedAt: null };

    if (tipo) {
      where.tipo = tipo;
    }

    if (expediente_id) {
      where.expedienteId = expediente_id;
    }

    if (search) {
      where.OR = [
        { nombre: { contains: search, mode: 'insensitive' } },
        { contenido: { contains: search, mode: 'insensitive' } },
      ];
    }

    const [documentos, total] = await Promise.all([
      prisma.documento.findMany({
        where,
        skip,
        take: limit,
        orderBy: { [sort]: order },
        include: {
          expediente: {
            select: { id: true, numeroExpediente: true },
          },
          usuario: {
            select: { id: true, nombre: true, apellido1: true },
          },
        },
      }),
      prisma.documento.count({ where }),
    ]);

    return {
      data: documentos,
      meta: { page, limit, total, totalPages: Math.ceil(total / limit) },
    };
  }

  async findDocumentoById(id: string): Promise<any> {
    const documento = await prisma.documento.findFirst({
      where: { id, deletedAt: null },
      include: {
        expediente: {
          select: {
            id: true,
            numeroExpediente: true,
            tipo: true,
            cliente: { select: { id: true, nombre: true } },
          },
        },
        usuario: {
          select: { id: true, nombre: true, apellido1: true },
        },
      },
    });

    if (!documento) {
      throw new ServiceException('DOCUMENTO_NOT_FOUND', 'Documento no encontrado', 404);
    }

    return documento;
  }

  async createDocumento(usuarioId: string, input: CreateOficioInput): Promise<any> {
    const documento = await prisma.documento.create({
      data: {
        ...input,
        usuarioId,
        ruta: '',
      } as any,
    });
    return documento;
  }

  async updateDocumento(id: string, input: UpdateOficioInput): Promise<any> {
    const existingDocumento = await prisma.documento.findFirst({
      where: { id, deletedAt: null },
    });

    if (!existingDocumento) {
      throw new ServiceException('DOCUMENTO_NOT_FOUND', 'Documento no encontrado', 404);
    }

    const documento = await prisma.documento.update({
      where: { id },
      data: input,
    });
    return documento;
  }

  async deleteDocumento(id: string): Promise<void> {
    const existingDocumento = await prisma.documento.findFirst({
      where: { id, deletedAt: null },
    });

    if (!existingDocumento) {
      throw new ServiceException('DOCUMENTO_NOT_FOUND', 'Documento no encontrado', 404);
    }

    await prisma.documento.update({
      where: { id },
      data: { deletedAt: new Date() },
    });
  }

  async getTiposDocumento(): Promise<string[]> {
    return Array.from(this.plantillasBase.keys());
  }

  async saveGeneratedDocument(usuarioId: string, expedienteId: string | null, nombre: string, tipo: string, contenido: string): Promise<any> {
    const documento = await prisma.documento.create({
      data: {
        nombre,
        tipo,
        ruta: `/documentos/${nombre}_${Date.now()}.pdf`,
        expedienteId,
        usuarioId,
      },
    });
    return documento;
  }
}

export const oficioService = new OficioService();

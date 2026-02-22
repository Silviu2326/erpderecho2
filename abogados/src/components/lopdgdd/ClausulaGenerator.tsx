import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FileText, Copy, Download, Check, RefreshCw, 
  Shield, Users, Cookie, AlertTriangle, Building,
  Eye, Settings, ChevronDown, X
} from 'lucide-react';
import { Button } from '../ui/Button';

export type TipoClausula = 
  | 'consentimiento'
  | 'informacion'
  | 'derechos'
  | 'cookies'
  | 'cesion'
  | 'aviso'
  | 'contratacion'
  | 'confidencialidad';

export interface ParametrosClausula {
  nombreEmpresa: string;
  cifEmpresa: string;
  direccionEmpresa: string;
  emailDpo: string;
  emailEmpresa: string;
  telefonoEmpresa: string;
  webEmpresa: string;
  nombreInteresado: string;
  dniInteresado: string;
  emailInteresado: string;
  telefonoInteresado: string;
  finalidades: string[];
  baseLegal: string;
  plazosConservacion: string;
  categoriasDestinatarios: string[];
  transferenciasInternacionales: boolean;
  paisesDestino: string[];
  derechos: string[];
  edadMinima: number;
  doubleOptin: boolean;
  cookiesAnaliticas: boolean;
  cookiesPublicitarias: boolean;
  terceroNombre: string;
  terceroFinalidad: string;
}

const defaultParametros: ParametrosClausula = {
  nombreEmpresa: '',
  cifEmpresa: '',
  direccionEmpresa: '',
  emailDpo: '',
  emailEmpresa: '',
  telefonoEmpresa: '',
  webEmpresa: '',
  nombreInteresado: '',
  dniInteresado: '',
  emailInteresado: '',
  telefonoInteresado: '',
  finalidades: ['Gestión comercial y administrativa'],
  baseLegal: 'Ejecución de contrato',
  plazosConservacion: 'Durante la relación contractual y posteriormente durante los plazos legales de conservación',
  categoriasDestinatarios: ['Administraciones públicas', 'Entidades financieras'],
  transferenciasInternacionales: false,
  paisesDestino: [],
  derechos: ['acceso', 'rectificacion', 'supresion', 'limitacion', 'portabilidad', 'oposicion'],
  edadMinima: 14,
  doubleOptin: true,
  cookiesAnaliticas: true,
  cookiesPublicitarias: false,
  tercerosNombre: '',
  terceroFinalidad: ''
};

const finalidadesPredefinidas = [
  'Gestión comercial y administrativa',
  'Gestión de clientes y proveedores',
  'Envío de comunicaciones comerciales',
  'Gestión de recursos humanos',
  'Videovigilancia',
  'Análisis de perfiles y marketing',
  'Prestaciones de servicios tecnológicos',
  'Gestión contable y fiscal'
];

const categoriasDerechos = [
  { id: 'acceso', label: 'Acceso', fundamento: 'Art. 15 RGPD' },
  { id: 'rectificacion', label: 'Rectificación', fundamento: 'Art. 16 RGPD' },
  { id: 'supresion', label: 'Supresión', fundamento: 'Art. 17 RGPD' },
  { id: 'limitacion', label: 'Limitación', fundamento: 'Art. 18 RGPD' },
  { id: 'portabilidad', label: 'Portabilidad', fundamento: 'Art. 20 RGPD' },
  { id: 'oposicion', label: 'Oposición', fundamento: 'Art. 21 RGPD' }
];

interface ClausulaTemplate {
  tipo: TipoClausula;
  titulo: string;
  descripcion: string;
  icono: React.ReactNode;
}

const templates: ClausulaTemplate[] = [
  {
    tipo: 'consentimiento',
    titulo: 'Consentimiento Informado',
    descripcion: 'Cláusula para obtener el consentimiento del interesado para el tratamiento de sus datos',
    icono: <Check className="w-5 h-5" />
  },
  {
    tipo: 'informacion',
    titulo: 'Información al Interesado',
    descripcion: 'Cláusula informativa conforme al Art. 13 y 14 RGPD',
    icono: <Eye className="w-5 h-5" />
  },
  {
    tipo: 'derechos',
    titulo: 'Ejercicio de Derechos',
    descripcion: 'Procedimiento para el ejercicio de derechos ARCO/ARSULIPO',
    icono: <Shield className="w-5 h-5" />
  },
  {
    tipo: 'cookies',
    titulo: 'Política de Cookies',
    descripcion: 'Cláusula sobre el uso de cookies y tecnologías similares',
    icono: <Cookie className="w-5 h-5" />
  },
  {
    tipo: 'cesion',
    titulo: 'Cesión de Datos',
    descripcion: 'Cláusula de comunicación/cesión de datos a terceros',
    icono: <Users className="w-5 h-5" />
  },
  {
    tipo: 'aviso',
    titulo: 'Aviso Legal',
    descripcion: 'Información legal general del sitio web/aplicación',
    icono: <AlertTriangle className="w-5 h-5" />
  },
  {
    tipo: 'contratacion',
    titulo: 'Cláusula de Contratación',
    descripcion: 'Cláusula de protección de datos para contratos',
    icono: <FileText className="w-5 h-5" />
  },
  {
    tipo: 'confidencialidad',
    titulo: 'Confidencialidad',
    descripcion: 'Cláusula de confidencialidad sobre el tratamiento de datos',
    icono: <Settings className="w-5 h-5" />
  }
];

function generateConsentimiento(params: ParametrosClausula): string {
  const { nombreEmpresa, emailEmpresa, finalidades, baseLegal, derechos, doubleOptin, edadMinima } = params;
  
  return `CLÁUSULA DE CONSENTIMIENTO INFORMADO

De conformidad con el Reglamento (UE) 2016/679 del Parlamento Europeo y del Consejo (RGPD) y la Ley Orgánica 3/2018 de Protección de Datos Personales y garantía de los derechos digitales (LOPDGDD), ${nombreEmpresa || '[NOMBRE DE LA EMPRESA]'} le informa de que los datos personales que nos proporcione serán tratados con las siguientes finalidades:

${finalidades.map((f, i) => `${i + 1}. ${f}`).join('\n')}

Base legal del tratamiento: ${baseLegal}

Los datos personales proporcionados se conservarán durante ${params.plazosConservacion}. No se cederán datos a terceros, salvo obligación legal.

${params.transferenciasInternacionales ? `Se informa que sus datos pueden ser transferidos a los siguientes países: ${params.paisesDestino.join(', ')}.` : ''}

${doubleOptin ? 'Para la aceptación del consentimiento, será necesario un proceso de doble confirmación (double opt-in).' : ''}

El interesado puede ejercer sus derechos de: ${derechos.map(d => categoriasDerechos.find(c => c.id === d)?.label).filter(Boolean).join(', ')} dirigiéndose a ${emailEmpresa || '[EMAIL]'}.

El ejercicio de estos derechos es gratuito. En caso de no obtener respuesta satisfactoria, puede presentar reclamación ante la Agencia Española de Protección de Datos (AEPD).

Declaro haber sido informado/a y expressly otorgo mi consentimiento para el tratamiento de mis datos personales con las finalidades indicadas.

${params.edadMinima > 0 ? `Declaro ser mayor de ${edadMinima} años.` : ''}

Fecha: ${new Date().toLocaleDateString('es-ES')}
`;
}

function generateInformacion(params: ParametrosClausula): string {
  const { nombreEmpresa, cifEmpresa, direccionEmpresa, emailDpo, emailEmpresa, telefonoEmpresa, webEmpresa, finalidades, baseLegal, plazosConservacion, categoriasDestinatarios, transferenciasInternacionales, paisesDestino, derechos } = params;
  
  return `INFORMACIÓN AL INTERESADO
(en cumplimiento de los artículos 13 y 14 del RGPD)

RESPONSABLE DEL TRATAMIENTO
${nombreEmpresa || '[NOMBRE DE LA EMPRESA]'}
CIF: ${cifEmpresa || '[CIF]'}
Domicilio: ${direccionEmpresa || '[DIRECCIÓN]'}
Email: ${emailEmpresa || '[EMAIL]'}
Teléfono: ${telefonoEmpresa || '[TELÉFONO]'}
Web: ${webEmpresa || '[WEB]'}

${emailDpo ? `DELEGADO DE PROTECCIÓN DE DATOS
Email: ${emailDpo}` : ''}

FINALIDADES DEL TRATAMIENTO
${finalidades.map((f, i) => `${i + 1}. ${f}`).join('\n')}

BASE LEGAL DEL TRATAMIENTO
${baseLegal}

CATEGORÍAS DE DESTINATARIOS
${categoriasDestinatarios.map((d, i) => `${i + 1}. ${d}`).join('\n')}

PLAZOS DE CONSERVACIÓN
${plazosConservacion}

TRANSFERENCIAS INTERNACIONALES
${transferenciasInternacionales ? `Sus datos podrán ser transferidos a los siguientes países: ${paisesDestino.join(', ')}. Estas transferencias cuentan con garantías adecuadas conforme al RGPD.` : 'No se realizan transferencias internacionales de datos personales.'}

EJERCICIO DE DERECHOS
El interesado puede ejercer sus derechos de:
${categoriasDerechos.filter(d => derechos.includes(d.id)).map(d => `- ${d.label} (${d.fundamento})`).join('\n')}

Para ejercer estos derechos, puede dirigirse por escrito a ${emailEmpresa} o presentar reclamación ante la Agencia Española de Protección de Datos (AEPD): www.aepd.es

${new Date().toLocaleDateString('es-ES')}
`;
}

function generateDerechos(params: ParametrosClausula): string {
  const { nombreEmpresa, emailEmpresa, emailDpo, direccionEmpresa } = params;
  
  return `PROCEDIMIENTO PARA EL EJERCICIO DE DERECHOS
(Arts. 15-22 RGPD y Arts. 12-18 LOPDGDD)

${nombreEmpresa || '[EMPRESA]'} informa a los interesados sobre el procedimiento para el ejercicio de los derechos de protección de datos:

DERECHOS QUE PUEDEN EJERCERSE:

1. ACCESO (Art. 15 RGPD)
   Obtener confirmación de si se tratan sus datos y acceder a los mismos.

2. RECTIFICACIÓN (Art. 16 RGPD)
   Obtener la rectificación de los datos inexactos o incompletos.

3. SUPRESIÓN (Art. 17 RGPD)
   Obtener la supresión de sus datos ('derecho al olvido').

4. LIMITACIÓN (Art. 18 RGPD)
   Obtener la limitación del tratamiento.

5. PORTABILIDAD (Art. 20 RGPD)
   Recibir sus datos en formato estructurado y transferirlos a otro responsable.

6. OPOSICIÓN (Art. 21 RGPD)
   Oponerse al tratamiento basado en interés legítimo o interés público.

PLAZO DE RESPUESTA: 1 mes desde la recepción de la solicitud (extendible a 2 meses en caso de complejidad o volumen de solicitudes).

COSTE: El ejercicio de los derechos es gratuito.

REQUISITOS:
- Acreditación de identidad (DNI, pasaporte o documento equivalente)
- Specify concreta del derecho que desea ejercer
- Preferentemente, por escrito

CANALES DE EJERCICIO:
- Email: ${emailEmpresa || '[EMAIL]'}
- Email DPO: ${emailDpo || '[DPO EMAIL]'}
- Correo postal: ${direccionEmpresa || '[DIRECCIÓN]'}
- Presencial en nuestras oficinas

RECLAMACIÓN ANTE LA AEPD
Sin perjuicio de cualquier otro recurso administrativo o judicial, el interesado tiene derecho a presentar reclamación ante la Agencia Española de Protección de Datos (AEPD).

Fecha de última actualización: ${new Date().toLocaleDateString('es-ES')}
`;
}

function generateCookies(params: ParametrosClausula): string {
  const { nombreEmpresa, webEmpresa, cookiesAnaliticas, cookiesPublicitarias } = params;
  
  return `POLÍTICA DE COOKIES
${nombreEmpresa || '[EMPRESA]'}

${webEmpresa || '[WEB]'} utiliza cookies y tecnologías similares para garantizar el correcto funcionamiento del sitio web y mejorar la experiencia del usuario.

¿QUÉ SON LAS COOKIES?
Las cookies son pequeños archivos de texto que se almacenan en su dispositivo cuando visita nuestro sitio web.

TIPOS DE COOKIES QUE UTILIZAMOS:

1. COOKIES ESENCIALES/NECESARIAS
   Son estrictamente necesarias para el funcionamiento del sitio web.
   No requieren su consentimiento.

2. COOKIES DE FUNCIONALIDAD
   Permiten recordar sus preferencias (idioma, región, etc.).
   Su consentimiento es necesario.

3. COOKIES ANALÍTICAS (${cookiesAnaliticas ? 'SÍ se utilizan' : 'NO se utilizan'})
   Nos permiten analizar el uso del sitio web para mejorar nuestros servicios.
   ${cookiesAnaliticas ? 'Se utilizan herramientas como Google Analytics.' : ''}

4. COOKIES PUBLICITARIAS (${cookiesPublicitarias ? 'SÍ se utilizan' : 'NO se utilizan'})
   ${cookiesPublicitarias ? 'Se utilizan para mostrar publicidad personalizada basada en su perfil.' : 'No se utilizan cookies publicitarias.'}

GESTIÓN DE COOKIES
Puede configurar su navegador para:
- Aceptar todas las cookies
- Rechazar todas las cookies
- Ser informado cuando se establece una cookie

Para más información sobre cómo gestionar cookies, visite: www.aboutcookies.org

ACTUALIZACIONES
Esta política puede actualizarse periódicamente. Le recomendamos revisar esta política cada vez que acceda a nuestro sitio web.

Fecha de última actualización: ${new Date().toLocaleDateString('es-ES')}
`;
}

function generateCesion(params: ParametrosClausula): string {
  const { nombreEmpresa, categoriasDestinatarios, tercerosNombre, terceroFinalidad } = params;
  
  return `CLÁUSULA DE CESIÓN/COMUNICACIÓN DE DATOS A TERCEROS

${nombreEmpresa || '[EMPRESA]'} le informa sobre la posible cesión o comunicación de sus datos personales:

CESIONES PREVISTAS:
${categoriasDestinatarios.map((d, i) => `${i + 1}. ${d}`).join('\n')}

${tercerosNombre ? `CESIÓN ESPECÍFICA A: ${tercerosNombre}
Finalidad: ${terceroFinalidad}` : ''}

NATURALEZA DE LA CESIÓN:
- Las cesiones se realizan en cumplimiento de obligaciones legales y/o para la prestación de servicios solicitados.
- Los terceros receptores se comprometen a tratar los datos conforme a esta política de privacidad.

TRANSFERENCIAS INTERNACIONALES:
${params.transferenciasInternacionales ? 
`Se informa que sus datos pueden ser transferidos a: ${params.paisesDestino.join(', ')}` : 
'No se realizan transferencias internacionales de datos.'}

DERECHO A OPONERSE
El interesado puede oponerse a estas cesiones ejercitando su derecho de oposición dirigiéndose a: ${params.emailEmpresa || '[EMAIL]'}

Fecha de última actualización: ${new Date().toLocaleDateString('es-ES')}
`;
}

function generateAvisoLegal(params: ParametrosClausula): string {
  const { nombreEmpresa, cifEmpresa, direccionEmpresa, emailEmpresa, telefonoEmpresa, webEmpresa } = params;
  
  return `AVISO LEGAL

1. TITULARIDAD
En cumplimiento de la Ley 34/2002 de Servicios de la Sociedad de la Información y de Comercio Electrónico (LSSI-CE), se informa que:

${nombreEmpresa || '[NOMBRE DE LA EMPRESA]'}
CIF: ${cifEmpresa || '[CIF]'}
Domicilio social: ${direccionEmpresa || '[DIRECCIÓN]'}
Email: ${emailEmpresa || '[EMAIL]'}
Teléfono: ${telefonoEmpresa || '[TELÉFONO]'}
Web: ${webEmpresa || '[WEB]'}

2. OBJETO
El presente aviso legal regula el uso del sitio web propiedad de ${nombreEmpresa || '[EMPRESA]'}.

3. CONDICIONES DE USO
El usuario se compromete a utilizar el sitio web de forma lawful y de acuerdo con el presente aviso legal.

4. PROPIEDAD INTELECTUAL E INDUSTRIAL
Todos los contenidos del sitio web son propiedad de ${nombreEmpresa || '[EMPRESA]'} o de terceros, y están protegidos por los derechos de propiedad intelectual e industrial.

5. RESPONSABILIDAD
${nombreEmpresa || '[EMPRESA]'} no se responsabiliza de los daños derivados del uso del sitio web ni de la información contenida en el mismo.

6. LEGISLACIÓN APLICABLE
El presente aviso legal se rige por la legislación española.

Fecha de última actualización: ${new Date().toLocaleDateString('es-ES')}
`;
}

function generateContratacion(params: ParametrosClausula): string {
  const { nombreEmpresa, emailEmpresa, finalidades, plazosConservacion, derechos } = params;
  
  return `CLÁUSULA DE PROTECCIÓN DE DATOS PARA CONTRATOS

En cumplimiento del RGPD (Reglamento UE 2016/679) y la LOPDGDD (Ley Orgánica 3/2018), las partes reconocen que:

1. DATOS DEL RESPONSABLE
${nombreEmpresa || '[EMPRESA]'}
Contact: ${emailEmpresa || '[EMAIL]'}

2. FINALIDAD DEL TRATAMIENTO
Los datos personales facilitados serán tratados para:
${finalidades.map((f, i) => `${i + 1}. ${f}`).join('\n')}

3. BASE LEGAL
El tratamiento es necesario para la ejecución del contrato en el que el interesado es parte.

4. CONSERVACIÓN
Los datos se conservarán durante ${plazosConservacion} y, posteriormente, durante los plazos legalmente establecidos.

5. DERECHOS
El cliente puede ejercer sus derechos (${derechos.map(d => categoriasDerechos.find(c => c.id === d)?.label).filter(Boolean).join(', '})}) dirigiéndose a ${emailEmpresa}.

6. CONSECUENCIAS DE NO PROPORCIONAR LOS DATOS
La no comunicación de los datos personales necesarios impedirá la formalización y/o ejecución del contrato.

7. DECLARACIONES
Ambas partes declaran haber sido informadas y comprender las implicaciones del tratamiento de datos personales descrito.

Fecha y lugar: ${new Date().toLocaleDateString('es-ES')}
`;
}

function generateConfidencialidad(params: ParametrosClausula): string {
  const { nombreEmpresa, emailEmpresa } = params;
  
  return `CLÁUSULA DE CONFIDENCIALIDAD EN EL TRATAMIENTO DE DATOS

${nombreEmpresa || '[EMPRESA]'} se compromete a:

1. TRATAR LOS DATOS DE FORMA CONFIDENCIAL
   - Mantener absoluta confidencialidad sobre toda la información obtenida.
   - No revelar información a terceros sin autorización expresa.

2. APLICAR MEDIDAS DE SEGURIDAD ADECUADAS
   - Medidas técnicas y organizativas apropiadas para garantizar la seguridad.
   - Protección contra tratamiento no autorizado o ilícito.

3. LIMITAR EL ACCESO A LOS DATOS
   - Solo personal autorizado tendrá acceso a los datos personales.
   - El personal firmará acuerdos de confidencialidad.

4. NOTIFICAR BRECHAS DE SEGURIDAD
   - Comunicación a la autoridad de control en un máximo de 72 horas.
   - Comunicación a los interesados cuando sea probable que suponga un alto riesgo.

5. CUMPLIMIENTO NORMATIVO
   - Cumplimiento del RGPD y LOPDGDD.
   - Colaboración con la autoridad de control cuando sea requerido.

6. DELEGADO DE PROTECCIÓN DE DATOS
   Contacto: ${params.emailDpo || '[DPO EMAIL]'}

Para cualquier consulta sobre confidencialidad: ${emailEmpresa || '[EMAIL]'}

Fecha de última actualización: ${new Date().toLocaleDateString('es-ES')}
`;
}

interface ClausulaGeneratorProps {
  onGenerated?: (clausula: string, tipo: TipoClausula) => void;
}

export function ClausulaGenerator({ onGenerated }: ClausulaGeneratorProps) {
  const [tipoSeleccionado, setTipoSeleccionado] = useState<TipoClausula | null>(null);
  const [parametros, setParametros] = useState<ParametrosClausula>(defaultParametros);
  const [clausulaGenerada, setClausulaGenerada] = useState<string>('');
  const [copiado, setCopiado] = useState(false);
  const [activeTab, setActiveTab] = useState<'templates' | 'editor'>('templates');
  const [showEmpresaModal, setShowEmpresaModal] = useState(false);
  const [showInteresadoModal, setShowInteresadoModal] = useState(false);
  const [showOpcionesModal, setShowOpcionesModal] = useState(false);

  const ClausulaGenerada = useMemo(() => {
    if (!tipoSeleccionado) return '';
    
    switch (tipoSeleccionado) {
      case 'consentimiento': return generateConsentimiento(parametros);
      case 'informacion': return generateInformacion(parametros);
      case 'derechos': return generateDerechos(parametros);
      case 'cookies': return generateCookies(parametros);
      case 'cesion': return generateCesion(parametros);
      case 'aviso': return generateAvisoLegal(parametros);
      case 'contratacion': return generateContratacion(parametros);
      case 'confidencialidad': return generateConfidencialidad(parametros);
      default: return '';
    }
  }, [tipoSeleccionado, parametros]);

  const handleGenerar = (tipo: TipoClausula) => {
    setTipoSeleccionado(tipo);
    setActiveTab('editor');
    const generador = {
      consentimiento: generateConsentimiento,
      informacion: generateInformacion,
      derechos: generateDerechos,
      cookies: generateCookies,
      cesion: generateCesion,
      aviso: generateAvisoLegal,
      contratacion: generateContratacion,
      confidencialidad: generateConfidencialidad
    }[tipo];
    setClausulaGenerada(generador(parametros));
    onGenerated?.(generador(parametros), tipo);
  };

  const handleCopy = async () => {
    await navigator.clipboard.writeText(ClausulaGenerada);
    setCopiado(true);
    setTimeout(() => setCopiado(false), 2000);
  };

  const handleDownload = () => {
    const blob = new Blob([ClausulaGenerada], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `clausula_${tipoSeleccionado}_${new Date().toISOString().split('T')[0]}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const updateParametro = <K extends keyof ParametrosClausula>(key: K, value: ParametrosClausula[K]) => {
    setParametros(prev => ({ ...prev, [key]: value }));
  };

  const toggleFinalidad = (finalidad: string) => {
    const current = parametros.finalidades;
    if (current.includes(finalidad)) {
      updateParametro('finalidades', current.filter(f => f !== finalidad));
    } else {
      updateParametro('finalidades', [...current, finalidad]);
    }
  };

  const toggleDerecho = (derecho: string) => {
    const current = parametros.derechos;
    if (current.includes(derecho)) {
      updateParametro('derechos', current.filter(d => d !== derecho));
    } else {
      updateParametro('derechos', [...current, derecho]);
    }
  };

  const toggleDestinatario = (destinatario: string) => {
    const current = parametros.categoriasDestinatarios;
    if (current.includes(destinatario)) {
      updateParametro('categoriasDestinatarios', current.filter(d => d !== destinatario));
    } else {
      updateParametro('categoriasDestinatarios', [...current, destinatario]);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-theme-primary">Generador de Cláusulas</h2>
          <p className="text-theme-secondary mt-1">
            Genere cláusulas de protección de datos conforme RGPD y LOPDGDD
          </p>
        </div>
      </div>

      <div className="flex gap-2 border-b border-theme">
        <button
          onClick={() => setActiveTab('templates')}
          className={`px-4 py-2 text-sm font-medium transition-colors ${
            activeTab === 'templates'
              ? 'text-accent border-b-2 border-accent'
              : 'text-theme-secondary hover:text-theme-primary'
          }`}
        >
          Plantillas
        </button>
        <button
          onClick={() => setActiveTab('editor')}
          disabled={!tipoSeleccionado}
          className={`px-4 py-2 text-sm font-medium transition-colors ${
            activeTab === 'editor'
              ? 'text-accent border-b-2 border-accent'
              : 'text-theme-secondary hover:text-theme-primary'
          } ${!tipoSeleccionado ? 'opacity-50 cursor-not-allowed' : ''}`}
        >
          Editor
        </button>
      </div>

      <AnimatePresence mode="wait">
        {activeTab === 'templates' && (
          <motion.div
            key="templates"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4"
          >
            {templates.map((template, index) => (
              <motion.button
                key={template.tipo}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                onClick={() => handleGenerar(template.tipo)}
                className="bg-theme-card border border-theme rounded-xl p-4 text-left hover:border-accent hover:bg-theme-tertiary transition-all group"
              >
                <div className="flex items-start gap-3">
                  <div className="p-2 bg-accent/10 rounded-lg text-accent group-hover:bg-accent group-hover:text-white transition-colors">
                    {template.icono}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-theme-primary truncate">{template.titulo}</h3>
                    <p className="text-sm text-theme-secondary mt-1 line-clamp-2">{template.descripcion}</p>
                  </div>
                </div>
              </motion.button>
            ))}
          </motion.div>
        )}

        {activeTab === 'editor' && (
          <motion.div
            key="editor"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="grid grid-cols-1 lg:grid-cols-3 gap-6"
          >
            <div className="lg:col-span-1 space-y-4">
              <div className="bg-theme-card border border-theme rounded-xl p-4">
                <h3 className="font-semibold text-theme-primary mb-4 flex items-center gap-2">
                  <Building className="w-5 h-5" />
                  Datos del Responsable
                </h3>
                <div className="space-y-3">
                  <button
                    onClick={() => setShowEmpresaModal(true)}
                    className="w-full px-4 py-2 bg-theme-tertiary border border-theme rounded-lg text-theme-secondary hover:text-theme-primary hover:border-accent transition-colors text-left flex items-center justify-between"
                  >
                    <span>{parametros.nombreEmpresa || 'Configurar empresa'}</span>
                    <ChevronDown className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <div className="bg-theme-card border border-theme rounded-xl p-4">
                <h3 className="font-semibold text-theme-primary mb-4 flex items-center gap-2">
                  <Users className="w-5 h-5" />
                  Datos del Interesado
                </h3>
                <button
                  onClick={() => setShowInteresadoModal(true)}
                  className="w-full px-4 py-2 bg-theme-tertiary border border-theme rounded-lg text-theme-secondary hover:text-theme-primary hover:border-accent transition-colors text-left flex items-center justify-between"
                >
                  <span>{parametros.nombreInteresado || 'Configurar interesado'}</span>
                  <ChevronDown className="w-4 h-4" />
                </button>
              </div>

              <div className="bg-theme-card border border-theme rounded-xl p-4">
                <h3 className="font-semibold text-theme-primary mb-4 flex items-center gap-2">
                  <Settings className="w-5 h-5" />
                  Opciones Avanzadas
                </h3>
                <button
                  onClick={() => setShowOpcionesModal(true)}
                  className="w-full px-4 py-2 bg-theme-tertiary border border-theme rounded-lg text-theme-secondary hover:text-theme-primary hover:border-accent transition-colors text-left flex items-center justify-between"
                >
                  <span>Finalidades, derechos, cesiones...</span>
                  <ChevronDown className="w-4 h-4" />
                </button>
              </div>

              <Button
                onClick={() => tipoSeleccionado && handleGenerar(tipoSeleccionado)}
                leftIcon={RefreshCw}
                className="w-full"
              >
                Regenerar Cláusula
              </Button>
            </div>

            <div className="lg:col-span-2 space-y-4">
              <div className="bg-theme-card border border-theme rounded-xl overflow-hidden">
                <div className="p-4 border-b border-theme flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <FileText className="w-5 h-5 text-accent" />
                    <h3 className="font-semibold text-theme-primary">
                      {templates.find(t => t.tipo === tipoSeleccionado)?.titulo || 'Cláusula Generada'}
                    </h3>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={handleCopy}
                      leftIcon={copiado ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                    >
                      {copiado ? 'Copiado' : 'Copiar'}
                    </Button>
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={handleDownload}
                      leftIcon={<Download className="w-4 h-4" />}
                    >
                      Descargar
                    </Button>
                  </div>
                </div>
                <div className="p-4">
                  <pre className="whitespace-pre-wrap text-sm text-theme-secondary font-mono bg-theme-tertiary rounded-lg p-4 max-h-[500px] overflow-y-auto">
                    {ClausulaGenerada}
                  </pre>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showEmpresaModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50"
            onClick={() => setShowEmpresaModal(false)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-theme-card border border-theme rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto"
              onClick={e => e.stopPropagation()}
            >
              <div className="sticky top-0 bg-theme-card border-b border-theme p-4 flex items-center justify-between">
                <h3 className="text-lg font-semibold text-theme-primary">Datos del Responsable</h3>
                <button
                  onClick={() => setShowEmpresaModal(false)}
                  className="p-2 hover:bg-theme-tertiary rounded-lg transition-colors"
                >
                  <X className="w-5 h-5 text-theme-muted" />
                </button>
              </div>
              <div className="p-6 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-theme-secondary mb-2">Nombre de la Empresa</label>
                  <input
                    type="text"
                    value={parametros.nombreEmpresa}
                    onChange={e => updateParametro('nombreEmpresa', e.target.value)}
                    className="w-full px-4 py-2 bg-theme-tertiary border border-theme rounded-xl text-theme-primary focus:outline-none focus:ring-2 focus:ring-accent"
                    placeholder="ej. Acme Solutions S.L."
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-theme-secondary mb-2">CIF/NIF</label>
                  <input
                    type="text"
                    value={parametros.cifEmpresa}
                    onChange={e => updateParametro('cifEmpresa', e.target.value)}
                    className="w-full px-4 py-2 bg-theme-tertiary border border-theme rounded-xl text-theme-primary focus:outline-none focus:ring-2 focus:ring-accent"
                    placeholder="ej. B-12345678"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-theme-secondary mb-2">Dirección</label>
                  <input
                    type="text"
                    value={parametros.direccionEmpresa}
                    onChange={e => updateParametro('direccionEmpresa', e.target.value)}
                    className="w-full px-4 py-2 bg-theme-tertiary border border-theme rounded-xl text-theme-primary focus:outline-none focus:ring-2 focus:ring-accent"
                    placeholder="ej. Calle Mayor 123, Madrid"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-theme-secondary mb-2">Email</label>
                  <input
                    type="email"
                    value={parametros.emailEmpresa}
                    onChange={e => updateParametro('emailEmpresa', e.target.value)}
                    className="w-full px-4 py-2 bg-theme-tertiary border border-theme rounded-xl text-theme-primary focus:outline-none focus:ring-2 focus:ring-accent"
                    placeholder="ej. info@empresa.com"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-theme-secondary mb-2">Teléfono</label>
                  <input
                    type="tel"
                    value={parametros.telefonoEmpresa}
                    onChange={e => updateParametro('telefonoEmpresa', e.target.value)}
                    className="w-full px-4 py-2 bg-theme-tertiary border border-theme rounded-xl text-theme-primary focus:outline-none focus:ring-2 focus:ring-accent"
                    placeholder="ej. +34 912 345 678"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-theme-secondary mb-2">Web</label>
                  <input
                    type="url"
                    value={parametros.webEmpresa}
                    onChange={e => updateParametro('webEmpresa', e.target.value)}
                    className="w-full px-4 py-2 bg-theme-tertiary border border-theme rounded-xl text-theme-primary focus:outline-none focus:ring-2 focus:ring-accent"
                    placeholder="ej. https://www.empresa.com"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-theme-secondary mb-2">Email del DPO</label>
                  <input
                    type="email"
                    value={parametros.emailDpo}
                    onChange={e => updateParametro('emailDpo', e.target.value)}
                    className="w-full px-4 py-2 bg-theme-tertiary border border-theme rounded-xl text-theme-primary focus:outline-none focus:ring-2 focus:ring-accent"
                    placeholder="ej. dpo@empresa.com"
                  />
                </div>
              </div>
              <div className="sticky bottom-0 bg-theme-card border-t border-theme p-4 flex justify-end">
                <Button onClick={() => { setShowEmpresaModal(false); handleGenerar(tipoSeleccionado!); }}>
                  Guardar y Regenerar
                </Button>
              </div>
            </motion.div>
          </motion.div>
        )}

        {showInteresadoModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50"
            onClick={() => setShowInteresadoModal(false)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-theme-card border border-theme rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto"
              onClick={e => e.stopPropagation()}
            >
              <div className="sticky top-0 bg-theme-card border-b border-theme p-4 flex items-center justify-between">
                <h3 className="text-lg font-semibold text-theme-primary">Datos del Interesado</h3>
                <button
                  onClick={() => setShowInteresadoModal(false)}
                  className="p-2 hover:bg-theme-tertiary rounded-lg transition-colors"
                >
                  <X className="w-5 h-5 text-theme-muted" />
                </button>
              </div>
              <div className="p-6 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-theme-secondary mb-2">Nombre Completo</label>
                  <input
                    type="text"
                    value={parametros.nombreInteresado}
                    onChange={e => updateParametro('nombreInteresado', e.target.value)}
                    className="w-full px-4 py-2 bg-theme-tertiary border border-theme rounded-xl text-theme-primary focus:outline-none focus:ring-2 focus:ring-accent"
                    placeholder="ej. Juan García Pérez"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-theme-secondary mb-2">DNI/NIE</label>
                  <input
                    type="text"
                    value={parametros.dniInteresado}
                    onChange={e => updateParametro('dniInteresado', e.target.value)}
                    className="w-full px-4 py-2 bg-theme-tertiary border border-theme rounded-xl text-theme-primary focus:outline-none focus:ring-2 focus:ring-accent"
                    placeholder="ej. 12345678A"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-theme-secondary mb-2">Email</label>
                  <input
                    type="email"
                    value={parametros.emailInteresado}
                    onChange={e => updateParametro('emailInteresado', e.target.value)}
                    className="w-full px-4 py-2 bg-theme-tertiary border border-theme rounded-xl text-theme-primary focus:outline-none focus:ring-2 focus:ring-accent"
                    placeholder="ej. juan@email.com"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-theme-secondary mb-2">Teléfono</label>
                  <input
                    type="tel"
                    value={parametros.telefonoInteresado}
                    onChange={e => updateParametro('telefonoInteresado', e.target.value)}
                    className="w-full px-4 py-2 bg-theme-tertiary border border-theme rounded-xl text-theme-primary focus:outline-none focus:ring-2 focus:ring-accent"
                    placeholder="ej. +34 612 345 678"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-theme-secondary mb-2">Edad Mínima</label>
                  <input
                    type="number"
                    min="0"
                    max="99"
                    value={parametros.edadMinima}
                    onChange={e => updateParametro('edadMinima', parseInt(e.target.value) || 0)}
                    className="w-full px-4 py-2 bg-theme-tertiary border border-theme rounded-xl text-theme-primary focus:outline-none focus:ring-2 focus:ring-accent"
                  />
                </div>
              </div>
              <div className="sticky bottom-0 bg-theme-card border-t border-theme p-4 flex justify-end">
                <Button onClick={() => { setShowInteresadoModal(false); handleGenerar(tipoSeleccionado!); }}>
                  Guardar y Regenerar
                </Button>
              </div>
            </motion.div>
          </motion.div>
        )}

        {showOpcionesModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50"
            onClick={() => setShowOpcionesModal(false)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-theme-card border border-theme rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto"
              onClick={e => e.stopPropagation()}
            >
              <div className="sticky top-0 bg-theme-card border-b border-theme p-4 flex items-center justify-between">
                <h3 className="text-lg font-semibold text-theme-primary">Opciones Avanzadas</h3>
                <button
                  onClick={() => setShowOpcionesModal(false)}
                  className="p-2 hover:bg-theme-tertiary rounded-lg transition-colors"
                >
                  <X className="w-5 h-5 text-theme-muted" />
                </button>
              </div>
              <div className="p-6 space-y-6">
                <div>
                  <label className="block text-sm font-medium text-theme-secondary mb-3">Finalidades del Tratamiento</label>
                  <div className="grid grid-cols-1 gap-2">
                    {finalidadesPredefinidas.map(finalidad => (
                      <label key={finalidad} className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={parametros.finalidades.includes(finalidad)}
                          onChange={() => toggleFinalidad(finalidad)}
                          className="w-4 h-4 rounded border-theme text-accent focus:ring-accent"
                        />
                        <span className="text-theme-primary text-sm">{finalidad}</span>
                      </label>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-theme-secondary mb-3">Base Legal del Tratamiento</label>
                  <select
                    value={parametros.baseLegal}
                    onChange={e => updateParametro('baseLegal', e.target.value)}
                    className="w-full px-4 py-2 bg-theme-tertiary border border-theme rounded-xl text-theme-primary focus:outline-none focus:ring-2 focus:ring-accent"
                  >
                    <option value="Ejecución de contrato">Ejecución de contrato</option>
                    <option value="Consentimiento del interesado">Consentimiento del interesado</option>
                    <option value="Obligación legal">Obligación legal</option>
                    <option value="Protección de intereses vitales">Protección de intereses vitales</option>
                    <option value="Interés legítimo">Interés legítimo</option>
                    <option value="Ejecución de tarea de interés público">Ejecución de tarea de interés público</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-theme-secondary mb-3">Derechos a Incluir</label>
                  <div className="grid grid-cols-2 gap-2">
                    {categoriasDerechos.map(derecho => (
                      <label key={derecho.id} className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={parametros.derechos.includes(derecho.id)}
                          onChange={() => toggleDerecho(derecho.id)}
                          className="w-4 h-4 rounded border-theme text-accent focus:ring-accent"
                        />
                        <span className="text-theme-primary text-sm">{derecho.label}</span>
                      </label>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-theme-secondary mb-3">Categorías de Destinatarios</label>
                  <div className="grid grid-cols-2 gap-2">
                    {['Administraciones públicas', 'Entidades financieras', 'Proveedores de servicios', 'Aseguradoras', 'Auditores', 'Otros'].map(dest => (
                      <label key={dest} className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={parametros.categoriasDestinatarios.includes(dest)}
                          onChange={() => toggleDestinatario(dest)}
                          className="w-4 h-4 rounded border-theme text-accent focus:ring-accent"
                        />
                        <span className="text-theme-primary text-sm">{dest}</span>
                      </label>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-theme-secondary mb-2">Plazos de Conservación</label>
                  <textarea
                    value={parametros.plazosConservacion}
                    onChange={e => updateParametro('plazosConservacion', e.target.value)}
                    className="w-full px-4 py-2 bg-theme-tertiary border border-theme rounded-xl text-theme-primary focus:outline-none focus:ring-2 focus:ring-accent h-20 resize-none"
                    placeholder="Durante la relación contractual..."
                  />
                </div>

                <div className="space-y-3">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={parametros.doubleOptin}
                      onChange={e => updateParametro('doubleOptin', e.target.checked)}
                      className="w-5 h-5 rounded border-theme text-accent focus:ring-accent"
                    />
                    <span className="text-theme-primary">Requerir doble opt-in (confirmación)</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={parametros.cookiesAnaliticas}
                      onChange={e => updateParametro('cookiesAnaliticas', e.target.checked)}
                      className="w-5 h-5 rounded border-theme text-accent focus:ring-accent"
                    />
                    <span className="text-theme-primary">Incluir cookies analíticas</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={parametros.cookiesPublicitarias}
                      onChange={e => updateParametro('cookiesPublicitarias', e.target.checked)}
                      className="w-5 h-5 rounded border-theme text-accent focus:ring-accent"
                    />
                    <span className="text-theme-primary">Incluir cookies publicitarias</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={parametros.transferenciasInternacionales}
                      onChange={e => updateParametro('transferenciasInternacionales', e.target.checked)}
                      className="w-5 h-5 rounded border-theme text-accent focus:ring-accent"
                    />
                    <span className="text-theme-primary">Transferencias internacionales</span>
                  </label>
                </div>
              </div>
              <div className="sticky bottom-0 bg-theme-card border-t border-theme p-4 flex justify-end">
                <Button onClick={() => { setShowOpcionesModal(false); handleGenerar(tipoSeleccionado!); }}>
                  Guardar y Regenerar
                </Button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default ClausulaGenerator;

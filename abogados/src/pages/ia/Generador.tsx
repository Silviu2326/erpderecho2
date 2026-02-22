// M11 - IA Legal: Generador de Escritos
// Generación automática de documentos legales con IA

import { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  FileText, Sparkles, Download, Copy, RefreshCw, Save,
  ChevronRight, ChevronDown, Building2, User, Calendar,
  AlertCircle, CheckCircle, FileSignature
} from 'lucide-react';
import { AppLayout } from '@/components/layout/AppLayout';

// Tipos de escritos disponibles
const tiposEscritos = [
  { id: 'demanda', nombre: 'Demanda', categoria: 'Laboral', icon: '📋' },
  { id: 'contestacion', nombre: 'Contestación a demanda', categoria: 'Civil', icon: '📝' },
  { id: 'recurso', nombre: 'Recurso de apelación', categoria: 'Civil', icon: '🔄' },
  { id: 'subsanacion', nombre: 'Subsanación de defectos', categoria: 'Procesal', icon: '✏️' },
  { id: 'alegaciones', nombre: 'Alegaciones previas', categoria: 'Procesal', icon: '📃' },
  { id: 'peticion', nombre: 'Petición general', categoria: 'General', icon: '📄' },
];

// Datos del formulario por defecto
const defaultFormData = {
  // Datos del cliente
  nombreCliente: '',
  dniCliente: '',
  direccionCliente: '',
  telefonoCliente: '',
  emailCliente: '',
  
  // Datos de la parte contraria
  nombreContrario: '',
  dniContrario: '',
  direccionContrario: '',
  
  // Datos del caso
  tipoProcedimiento: '',
  objetoDemanda: '',
  hechosRelevantes: '',
  fundamentosDerecho: '',
  petitum: '',
  
  // Datos adicionales
  Juzgado: '',
  numeroProcedimiento: '',
  fechaHechos: '',
};

export default function IAGenerador() {
  const [selectedTipo, setSelectedTipo] = useState<string | null>(null);
  const [formData, setFormData] = useState(defaultFormData);
  const [generatedContent, setGeneratedContent] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [showPreview, setShowPreview] = useState(false);

  const updateFormField = (field: string, value: string) => {
    setFormData({ ...formData, [field]: value });
  };

  const generateWrite = () => {
    setIsGenerating(true);
    
    // Simular generación con IA
    setTimeout(() => {
      const mockContent = `AL JUZGADO DE PRIMERA INSTANCIA Nº ${formData.numeroProcedimiento || '___'} DE ${formData.Juzgado || 'Madrid'}

D./D.ª ${formData.nombreCliente || '[NOMBRE DEL LETRADO]'}, Abogado/a del Ilustre Colegio de Abogados de Madrid, con número de colegiado ____, actuando en nombre y representación de D./D.ª ${formData.nombreCliente || '[NOMBRE CLIENTE]'}, según consta en el poder para pleitos que se acompaña como Documento nº 1, ante el Juzgado comparezco y DIGO:

Que, mediante el presente escrito, dentro del plazo legalmente establecido, formulo DEMANDA contra ${formData.nombreContrario || '[NOMBRE PARTE CONTRARIA]'}, en materia de ${formData.tipoProcedimiento || '[TIPO DE PROCEDIMIENTO]'}, exponiendo:

I. HECHOS

PRIMERO.- ${formData.hechosRelevantes || 'Los hechos que fundamentan la presente demanda son los siguientes: [DESCRIBIR HECHOS RELEVANTES]'}

SEGUNDO.- ${formData.hechosRelevantes || '[AÑADIR MAS HECHOS SI PROCEDE]'}

II. FUNDAMENTOS DE DERECHO

PRIMERO.- ${formData.fundamentosDerecho || 'La competencia de este Juzgado viene determinada por [ARTÍCULO 50 Y SIGUIENTES DE LA LEC]'}

SEGUNDO.- ${formData.fundamentosDerecho || 'La legitimación activa de mi representada deriva de [ARGUMENTAR LEGITIMACIÓN]'}

TERCERO.- ${formData.fundamentosDerecho || 'Los fundamentos de Derecho que sustentan la pretensión son los siguientes: [ARTÍCULOS APLICABLES]'}

III. PETICIÓN

Por todo lo expuesto, al Juzgado SUPLICO que, teniendo por presentado este escrito con los documentos que se acompañan, se sirva admitirlo y, previos los trámites legales oportunos, dicte Sentencia por la que:

${formData.petitum || 'PRIMERO.- Se condene a la parte demandada a [PETICIÓN PRINCIPAL]\nSEGUNDO.- Se impongan las costas procesales a la parte demandada.'}

OTROSÍ DIGO: Que se reservan los derechos a reclamar los daños y perjuicios que pudieran derivarse de los hechos expuestos.

Es Justicia que respetuosamente pido en ${formData.Juzgado || '[CIUDAD]'}, a ${new Date().toLocaleDateString('es-ES')}.

Fdo.: ${formData.nombreCliente || '[Letrado]'}
Abogado - Colegiado nº ____`;

      setGeneratedContent(mockContent);
      setIsGenerating(false);
      setShowPreview(true);
    }, 2000);
  };

  const copyToClipboard = () => {
    if (generatedContent) {
      navigator.clipboard.writeText(generatedContent);
    }
  };

  const groupedTipos = tiposEscritos.reduce((acc, item) => {
    if (!acc[item.categoria]) acc[item.categoria] = [];
    acc[item.categoria].push(item);
    return acc;
  }, {} as Record<string, typeof tiposEscritos>);

  return (
    <AppLayout title="Generador de Escritos" subtitle="Generación automática con IA">
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-theme-primary">Generador de Escritos</h1>
          <p className="text-theme-secondary">Crea documentos legales con asistencia de IA</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Panel izquierdo: Tipos de escrito */}
        <div className="lg:col-span-1 space-y-4">
          <h2 className="font-semibold text-theme-primary">Seleccionar tipo de escrito</h2>
          
          {Object.entries(groupedTipos).map(([categoria, tipos]) => (
            <div key={categoria} className="space-y-2">
              <h3 className="text-sm font-medium text-theme-muted uppercase">{categoria}</h3>
              {tipos.map((tipo) => (
                <button
                  key={tipo.id}
                  onClick={() => setSelectedTipo(tipo.id)}
                  className={`w-full flex items-center gap-3 p-3 rounded-xl transition-colors ${
                    selectedTipo === tipo.id
                      ? 'bg-accent/10 border border-accent text-accent'
                      : 'bg-theme-card border border-theme text-theme-secondary hover:border-accent/50'
                  }`}
                >
                  <span className="text-xl">{tipo.icon}</span>
                  <span className="font-medium">{tipo.nombre}</span>
                </button>
              ))}
            </div>
          ))}
        </div>

        {/* Panel central: Formulario */}
        <div className="lg:col-span-2 space-y-6">
          {!showPreview ? (
            <>
              {/* Datos del cliente */}
              <div className="bg-theme-card border border-theme rounded-xl p-4">
                <h3 className="font-semibold text-theme-primary mb-4 flex items-center gap-2">
                  <User className="w-4 h-4" />
                  Datos del Cliente
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <input
                    type="text"
                    placeholder="Nombre completo"
                    value={formData.nombreCliente}
                    onChange={(e) => updateFormField('nombreCliente', e.target.value)}
                    className="px-4 py-2 bg-theme-tertiary border border-theme rounded-xl text-theme-primary placeholder-theme-muted"
                  />
                  <input
                    type="text"
                    placeholder="DNI/NIE"
                    value={formData.dniCliente}
                    onChange={(e) => updateFormField('dniCliente', e.target.value)}
                    className="px-4 py-2 bg-theme-tertiary border border-theme rounded-xl text-theme-primary placeholder-theme-muted"
                  />
                  <input
                    type="text"
                    placeholder="Dirección"
                    value={formData.direccionCliente}
                    onChange={(e) => updateFormField('direccionCliente', e.target.value)}
                    className="px-4 py-2 bg-theme-tertiary border border-theme rounded-xl text-theme-primary placeholder-theme-muted"
                  />
                  <input
                    type="text"
                    placeholder="Teléfono"
                    value={formData.telefonoCliente}
                    onChange={(e) => updateFormField('telefonoCliente', e.target.value)}
                    className="px-4 py-2 bg-theme-tertiary border border-theme rounded-xl text-theme-primary placeholder-theme-muted"
                  />
                </div>
              </div>

              {/* Datos del caso */}
              <div className="bg-theme-card border border-theme rounded-xl p-4">
                <h3 className="font-semibold text-theme-primary mb-4 flex items-center gap-2">
                  <FileText className="w-4 h-4" />
                  Datos del Caso
                </h3>
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <input
                      type="text"
                      placeholder="Tipo de procedimiento"
                      value={formData.tipoProcedimiento}
                      onChange={(e) => updateFormField('tipoProcedimiento', e.target.value)}
                      className="px-4 py-2 bg-theme-tertiary border border-theme rounded-xl text-theme-primary placeholder-theme-muted"
                    />
                    <input
                      type="text"
                      placeholder="Juzgado"
                      value={formData.Juzgado}
                      onChange={(e) => updateFormField('Juzgado', e.target.value)}
                      className="px-4 py-2 bg-theme-tertiary border border-theme rounded-xl text-theme-primary placeholder-theme-muted"
                    />
                  </div>
                  <textarea
                    placeholder="Hechos relevantes (describe los hechos del caso)"
                    value={formData.hechosRelevantes}
                    onChange={(e) => updateFormField('hechosRelevantes', e.target.value)}
                    rows={4}
                    className="w-full px-4 py-2 bg-theme-tertiary border border-theme rounded-xl text-theme-primary placeholder-theme-muted resize-none"
                  />
                  <textarea
                    placeholder="Fundamentos de derecho (articulo aplicable)"
                    value={formData.fundamentosDerecho}
                    onChange={(e) => updateFormField('fundamentosDerecho', e.target.value)}
                    rows={3}
                    className="w-full px-4 py-2 bg-theme-tertiary border border-theme rounded-xl text-theme-primary placeholder-theme-muted resize-none"
                  />
                  <textarea
                    placeholder="Petitum (qué se pide al juez)"
                    value={formData.petitum}
                    onChange={(e) => updateFormField('petitum', e.target.value)}
                    rows={3}
                    className="w-full px-4 py-2 bg-theme-tertiary border border-theme rounded-xl text-theme-primary placeholder-theme-muted resize-none"
                  />
                </div>
              </div>

              {/* Botón generar */}
              <button
                onClick={generateWrite}
                disabled={isGenerating || !selectedTipo}
                className="w-full py-4 bg-gradient-to-r from-accent to-purple-500 text-white font-semibold rounded-xl hover:from-accent-hover hover:to-purple-400 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {isGenerating ? (
                  <>
                    <RefreshCw className="w-5 h-5 animate-spin" />
                    Generando escrito con IA...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-5 h-5" />
                    Generar Escrito con IA
                  </>
                )}
              </button>

              <p className="text-xs text-theme-muted text-center">
                ⚠️ El escrito generado es una plantilla. Revisa y personaliza antes de usar.
              </p>
            </>
          ) : (
            /* Vista previa del escrito */
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="font-semibold text-theme-primary">Vista Previa</h2>
                <div className="flex gap-2">
                  <button
                    onClick={() => setShowPreview(false)}
                    className="px-4 py-2 text-theme-secondary hover:text-theme-primary bg-theme-card border border-theme rounded-xl"
                  >
                    Editar
                  </button>
                  <button
                    onClick={copyToClipboard}
                    className="px-4 py-2 bg-theme-card border border-theme text-theme-secondary hover:text-theme-primary rounded-xl flex items-center gap-2"
                  >
                    <Copy className="w-4 h-4" />
                    Copiar
                  </button>
                  <button className="px-4 py-2 bg-accent text-white rounded-xl flex items-center gap-2 hover:bg-accent-hover">
                    <Download className="w-4 h-4" />
                    Descargar
                  </button>
                </div>
              </div>

              <div className="bg-theme-card border border-theme rounded-xl p-6">
                <pre className="whitespace-pre-wrap text-sm text-theme-primary font-mono leading-relaxed">
                  {generatedContent}
                </pre>
              </div>

              <div className="flex items-center gap-2 p-3 bg-amber-500/10 border border-amber-500/20 rounded-xl">
                <AlertCircle className="w-5 h-5 text-amber-400 flex-shrink-0" />
                <p className="text-sm text-amber-400">
                  Este documento es una plantilla generada por IA. Es necesario revisar y personalizar el contenido antes de su uso oficial.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
    </AppLayout>
  );
}

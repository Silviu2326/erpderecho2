import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Shield, ChevronRight, ChevronLeft, Check, AlertTriangle,
  FileText, Users, Scale, Activity, ClipboardCheck,
  Download, Save
} from 'lucide-react';
import { Button } from '../ui/Button';

export interface EIPDData {
  responsable: string;
  contacto: string;
  email: string;
  telefono: string;
  tratamiento: string;
  finalidad: string;
  baseLegal: string;
  categoriasDatos: string[];
  categoriasInteresados: string[];
  volumen: string;
  duracion: string;
  necesidad: string;
  proporcionalidad: string;
  derechosAfectados: string[];
  riesgos: {
    id: string;
    descripcion: string;
    probabilidad: 'baja' | 'media' | 'alta';
    impacto: 'bajo' | 'medio' | 'alto';
    mitigacion: string;
  }[];
  medidasTecnicas: string[];
  medidasOrganizativas: string[];
  conclusion: string;
  recomendaciones: string;
  requiereConsulta: boolean;
}

const initialData: EIPDData = {
  responsable: '',
  contacto: '',
  email: '',
  telefono: '',
  tratamiento: '',
  finalidad: '',
  baseLegal: '',
  categoriasDatos: [],
  categoriasInteresados: [],
  volumen: '',
  duracion: '',
  necesidad: '',
  proporcionalidad: '',
  derechosAfectados: [],
  riesgos: [],
  medidasTecnicas: [],
  medidasOrganizativas: [],
  conclusion: '',
  recomendaciones: '',
  requiereConsulta: false
};

const STEPS = [
  { id: 1, title: 'Identificación', description: 'Responsable y tratamiento', icon: Shield },
  { id: 2, title: 'Finalidad', description: 'Objetivo y base legal', icon: FileText },
  { id: 3, title: 'Necesidad', description: 'Análisis de proporcionalidad', icon: Scale },
  { id: 4, title: 'Riesgos', description: 'Evaluación de riesgos', icon: AlertTriangle },
  { id: 5, title: 'Medidas', description: 'Mitigación de riesgos', icon: ClipboardCheck },
  { id: 6, title: 'Conclusión', description: 'Informe final', icon: Activity }
];

const CATEGORIAS_DATOS = [
  'Identificativos', 'Contactos', 'Económicos', 'Salud', 'Biométricos',
  'Ubicación', 'Curriculum', 'Genéticos', 'Origen étnico', 'Opiniones políticas',
  'Religión', 'Afiliación sindical', 'Vida sexual', 'Datos judiciales'
];

const CATEGORIAS_INTERESADOS = [
  'Clientes', 'Empleados', 'Proveedores', 'Candidatos', 'Usuarios web',
  'Menores', 'Profesionales', 'Socios', 'Visitantes', 'Otros'
];

const DERECHOS_AFECTADOS = [
  'Acceso', 'Rectificación', 'Supresión', 'Limitación', 'Portabilidad',
  'Oposición', 'No autodeterminación'
];

interface EIPD_WizardProps {
  onSave?: (data: EIPDData) => void;
  initialData?: EIPDData;
}

export function EIPD_Wizard({ onSave, initialData: providedData }: EIPD_WizardProps) {
  const [currentStep, setCurrentStep] = useState(1);
  const [data, setData] = useState<EIPDData>(providedData || initialData);
  const [showPreview, setShowPreview] = useState(false);

  const handleNext = () => {
    if (currentStep < STEPS.length) {
      setCurrentStep(prev => prev + 1);
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(prev => prev - 1);
    }
  };

  const handleSave = () => {
    if (onSave) {
      onSave(data);
    }
  };

  const updateField = <K extends keyof EIPDData>(field: K, value: EIPDData[K]) => {
    setData(prev => ({ ...prev, [field]: value }));
  };

  const toggleArrayField = <K extends keyof EIPDData>(
    field: K,
    value: string
  ) => {
    const current = data[field] as string[];
    const updated = current.includes(value)
      ? current.filter(v => v !== value)
      : [...current, value];
    updateField(field, updated);
  };

  const addRiesgo = () => {
    const newRiesgo = {
      id: Date.now().toString(),
      descripcion: '',
      probabilidad: 'media' as const,
      impacto: 'medio' as const,
      mitigacion: ''
    };
    updateField('riesgos', [...data.riesgos, newRiesgo]);
  };

  const updateRiesgo = (id: string, field: string, value: any) => {
    updateField('riesgos', data.riesgos.map(r =>
      r.id === id ? { ...r, [field]: value } : r
    ));
  };

  const removeRiesgo = (id: string) => {
    updateField('riesgos', data.riesgos.filter(r => r.id !== id));
  };

  const getRiesgoNivel = (probabilidad: string, impacto: string): string => {
    const levels: Record<string, Record<string, string>> = {
      baja: { bajo: 'bajo', medio: 'medio', alto: 'medio' },
      media: { bajo: 'medio', medio: 'alto', alto: 'critico' },
      alta: { bajo: 'medio', medio: 'critico', alto: 'critico' }
    };
    return levels[probabilidad]?.[impacto] || 'bajo';
  };

  const getRiesgoColor = (nivel: string) => {
    switch (nivel) {
      case 'bajo': return 'bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 border-emerald-500/30';
      case 'medio': return 'bg-amber-500/20 text-amber-600 dark:text-amber-400 border-amber-500/30';
      case 'alto': return 'bg-orange-500/20 text-orange-600 dark:text-orange-400 border-orange-500/30';
      case 'critico': return 'bg-red-500/20 text-red-600 dark:text-red-400 border-red-500/30';
      default: return 'bg-gray-500/20 text-gray-600 border-gray-500/30';
    }
  };

  const renderStep1 = () => (
    <div className="space-y-6">
      <div className="bg-blue-500/10 border border-blue-500/30 rounded-xl p-4">
        <h3 className="font-semibold text-theme-primary mb-2">Responsable del Tratamiento</h3>
        <p className="text-sm text-theme-secondary">
          Identifique al responsable del tratamiento de datos y sus datos de contacto.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-theme-secondary mb-2">
            Nombre/Razón Social *
          </label>
          <input
            type="text"
            value={data.responsable}
            onChange={e => updateField('responsable', e.target.value)}
            className="w-full px-4 py-2 bg-theme-tertiary border border-theme rounded-xl text-theme-primary focus:outline-none focus:ring-2 focus:ring-accent"
            placeholder="Nombre de la empresa u organización"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-theme-secondary mb-2">
            Persona de Contacto *
          </label>
          <input
            type="text"
            value={data.contacto}
            onChange={e => updateField('contacto', e.target.value)}
            className="w-full px-4 py-2 bg-theme-tertiary border border-theme rounded-xl text-theme-primary focus:outline-none focus:ring-2 focus:ring-accent"
            placeholder="Nombre del responsable de datos"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-theme-secondary mb-2">
            Email *
          </label>
          <input
            type="email"
            value={data.email}
            onChange={e => updateField('email', e.target.value)}
            className="w-full px-4 py-2 bg-theme-tertiary border border-theme rounded-xl text-theme-primary focus:outline-none focus:ring-2 focus:ring-accent"
            placeholder="dp@empresa.es"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-theme-secondary mb-2">
            Teléfono
          </label>
          <input
            type="tel"
            value={data.telefono}
            onChange={e => updateField('telefono', e.target.value)}
            className="w-full px-4 py-2 bg-theme-tertiary border border-theme rounded-xl text-theme-primary focus:outline-none focus:ring-2 focus:ring-accent"
            placeholder="+34 900 000 000"
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-theme-secondary mb-2">
          Nombre del Tratamiento *
        </label>
        <input
          type="text"
          value={data.tratamiento}
          onChange={e => updateField('tratamiento', e.target.value)}
          className="w-full px-4 py-2 bg-theme-tertiary border border-theme rounded-xl text-theme-primary focus:outline-none focus:ring-2 focus:ring-accent"
          placeholder="ej. Gestión de clientes"
        />
      </div>
    </div>
  );

  const renderStep2 = () => (
    <div className="space-y-6">
      <div className="bg-blue-500/10 border border-blue-500/30 rounded-xl p-4">
        <h3 className="font-semibold text-theme-primary mb-2">Finalidad y Base Legal</h3>
        <p className="text-sm text-theme-secondary">
          Defina el propósito del tratamiento y su justificación legal.
        </p>
      </div>

      <div>
        <label className="block text-sm font-medium text-theme-secondary mb-2">
          Finalidad del Tratamiento *
        </label>
        <textarea
          value={data.finalidad}
          onChange={e => updateField('finalidad', e.target.value)}
          className="w-full px-4 py-2 bg-theme-tertiary border border-theme rounded-xl text-theme-primary focus:outline-none focus:ring-2 focus:ring-accent h-24 resize-none"
          placeholder="Describa detalladamente la finalidad del tratamiento..."
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-theme-secondary mb-2">
          Base Legal *
        </label>
        <select
          value={data.baseLegal}
          onChange={e => updateField('baseLegal', e.target.value)}
          className="w-full px-4 py-2 bg-theme-tertiary border border-theme rounded-xl text-theme-primary focus:outline-none focus:ring-2 focus:ring-accent"
        >
          <option value="">Seleccione una base legal</option>
          <option value="consentimiento">Consentimiento (art. 6.1.a RGPD)</option>
          <option value="contrato">Ejecución de contrato (art. 6.1.b RGPD)</option>
          <option value="obligacion_legal">Obligación legal (art. 6.1.c RGPD)</option>
          <option value="interes_legitimo">Interés legítimo (art. 6.1.f RGPD)</option>
          <option value="interes_publico">Interés público (art. 6.1.e RGPD)</option>
          <option value="proteccion_vital">Protección de intereses vitales (art. 6.1.d RGPD)</option>
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium text-theme-secondary mb-2">
          Categorías de Datos *
        </label>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
          {CATEGORIAS_DATOS.map(cat => (
            <label key={cat} className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkboxdata.categorias"
                checked={Datos.includes(cat)}
                onChange={() => toggleArrayField('categoriasDatos', cat)}
                className="w-4 h-4 rounded border-theme text-accent focus:ring-accent"
              />
              <span className="text-sm text-theme-secondary">{cat}</span>
            </label>
          ))}
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-theme-secondary mb-2">
          Categorías de Interesados *
        </label>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-2">
          {CATEGORIAS_INTERESADOS.map(cat => (
            <label key={cat} className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={data.categoriasInteresados.includes(cat)}
                onChange={() => toggleArrayField('categoriasInteresados', cat)}
                className="w-4 h-4 rounded border-theme text-accent focus:ring-accent"
              />
              <span className="text-sm text-theme-secondary">{cat}</span>
            </label>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-theme-secondary mb-2">
            Volumen de Interesados
          </label>
          <input
            type="text"
            value={data.volumen}
            onChange={e => updateField('volumen', e.target.value)}
            className="w-full px-4 py-2 bg-theme-tertiary border border-theme rounded-xl text-theme-primary focus:outline-none focus:ring-2 focus:ring-accent"
            placeholder="ej. 1.000 - 10.000"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-theme-secondary mb-2">
            Duración del Tratamiento
          </label>
          <input
            type="text"
            value={data.duracion}
            onChange={e => updateField('duracion', e.target.value)}
            className="w-full px-4 py-2 bg-theme-tertiary border border-theme rounded-xl text-theme-primary focus:outline-none focus:ring-2 focus:ring-accent"
            placeholder="ej. Temporal, Indefinida"
          />
        </div>
      </div>
    </div>
  );

  const renderStep3 = () => (
    <div className="space-y-6">
      <div className="bg-blue-500/10 border border-blue-500/30 rounded-xl p-4">
        <h3 className="font-semibold text-theme-primary mb-2">Análisis de Necesidad y Proporcionalidad</h3>
        <p className="text-sm text-theme-secondary">
          Evalúe si el tratamiento es necesario y proporcionado para la finalidad perseguida.
        </p>
      </div>

      <div>
        <label className="block text-sm font-medium text-theme-secondary mb-2">
          ¿Por qué es necesario este tratamiento? *
        </label>
        <textarea
          value={data.necesidad}
          onChange={e => updateField('necesidad', e.target.value)}
          className="w-full px-4 py-2 bg-theme-tertiary border border-theme rounded-xl text-theme-primary focus:outline-none focus:ring-2 focus:ring-accent h-24 resize-none"
          placeholder="Explique por qué el tratamiento es imprescindible para la finalidad..."
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-theme-secondary mb-2">
          ¿Es proporcionado? Justifique *
        </label>
        <textarea
          value={data.proporcionalidad}
          onChange={e => updateField('proporcionalidad', e.target.value)}
          className="w-full px-4 py-2 bg-theme-tertiary border border-theme rounded-xl text-theme-primary focus:outline-none focus:ring-2 focus:ring-accent h-24 resize-none"
          placeholder="Explique cómo el tratamiento no excesivos datos..."
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-theme-secondary mb-3">
          Derechos de los Interesados Afectados
        </label>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
          {DERECHOS_AFECTADOS.map(derecho => (
            <label key={derecho} className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={data.derechosAfectados.includes(derecho)}
                onChange={() => toggleArrayField('derechosAfectados', derecho)}
                className="w-4 h-4 rounded border-theme text-accent focus:ring-accent"
              />
              <span className="text-sm text-theme-secondary">{derecho}</span>
            </label>
          ))}
        </div>
      </div>

      <div className="bg-amber-500/10 border border-amber-500/30 rounded-xl p-4">
        <div className="flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 text-amber-500 flex-shrink-0 mt-0.5" />
          <div>
            <h4 className="font-medium text-theme-primary">Consulta Previa a la AEPD</h4>
            <p className="text-sm text-theme-secondary mt-1">
              Según el artículo 36 RGPD, cuando un tratamiento pueda afectar gravemente a los derechos 
              y libertades de los interesados, debe consultarse a la autoridad de control antes de 
              iniciar el tratamiento.
            </p>
          </div>
        </div>
      </div>
    </div>
  );

  const renderStep4 = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="bg-blue-500/10 border border-blue-500/30 rounded-xl p-4 flex-1 mr-4">
          <h3 className="font-semibold text-theme-primary mb-2">Evaluación de Riesgos</h3>
          <p className="text-sm text-theme-secondary">
            Identifique y evalúe los riesgos para los derechos y libertades de los interesados.
          </p>
        </div>
        <Button variant="secondary" onClick={addRiesgo} leftIcon={Users}>
          Añadir Riesgo
        </Button>
      </div>

      {data.riesgos.length === 0 ? (
        <div className="text-center py-12 bg-theme-tertiary rounded-xl">
          <Shield className="w-12 h-12 text-theme-muted mx-auto mb-4" />
          <p className="text-theme-secondary">No hay riesgos identificados</p>
          <Button variant="secondary" onClick={addRiesgo} leftIcon={Users} className="mt-4">
            Añadir el primer riesgo
          </Button>
        </div>
      ) : (
        <div className="space-y-4">
          {data.riesgos.map((riesgo, index) => {
            const nivel = getRiesgoNivel(riesgo.probabilidad, riesgo.impacto);
            return (
              <motion.div
                key={riesgo.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-theme-card border border-theme rounded-xl p-4"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-theme-secondary mb-2">
                        Descripción del Riesgo
                      </label>
                      <input
                        type="text"
                        value={riesgo.descripcion}
                        onChange={e => updateRiesgo(riesgo.id, 'descripcion', e.target.value)}
                        className="w-full px-4 py-2 bg-theme-tertiary border border-theme rounded-xl text-theme-primary focus:outline-none focus:ring-2 focus:ring-accent"
                        placeholder="Describa el riesgo..."
                      />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-theme-secondary mb-2">
                          Probabilidad
                        </label>
                        <select
                          value={riesgo.probabilidad}
                          onChange={e => updateRiesgo(riesgo.id, 'probabilidad', e.target.value)}
                          className="w-full px-4 py-2 bg-theme-tertiary border border-theme rounded-xl text-theme-primary focus:outline-none focus:ring-2 focus:ring-accent"
                        >
                          <option value="baja">Baja</option>
                          <option value="media">Media</option>
                          <option value="alta">Alta</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-theme-secondary mb-2">
                          Impacto
                        </label>
                        <select
                          value={riesgo.impacto}
                          onChange={e => updateRiesgo(riesgo.id, 'impacto', e.target.value)}
                          className="w-full px-4 py-2 bg-theme-tertiary border border-theme rounded-xl text-theme-primary focus:outline-none focus:ring-2 focus:ring-accent"
                        >
                          <option value="bajo">Bajo</option>
                          <option value="medio">Medio</option>
                          <option value="alto">Alto</option>
                        </select>
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-theme-secondary mb-2">
                        Medida de Mitigación
                      </label>
                      <textarea
                        value={riesgo.mitigacion}
                        onChange={e => updateRiesgo(riesgo.id, 'mitigacion', e.target.value)}
                        className="w-full px-4 py-2 bg-theme-tertiary border border-theme rounded-xl text-theme-primary focus:outline-none focus:ring-2 focus:ring-accent h-20 resize-none"
                        placeholder="Describa las medidas para mitigar este riesgo..."
                      />
                    </div>
                  </div>

                  <button
                    onClick={() => removeRiesgo(riesgo.id)}
                    className="p-2 bg-red-500/20 text-red-500 rounded-lg hover:bg-red-500/30 transition-colors"
                  >
                    ×
                  </button>
                </div>

                <div className="mt-4 flex items-center justify-between">
                  <span className="text-sm text-theme-muted">Nivel de Riesgo:</span>
                  <span className={`px-3 py-1 rounded-full text-sm font-medium border ${getRiesgoColor(nivel)}`}>
                    {nivel.charAt(0).toUpperCase() + nivel.slice(1)}
                  </span>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-xl p-4 text-center">
          <p className="text-2xl font-bold text-emerald-500">
            {data.riesgos.filter(r => getRiesgoNivel(r.probabilidad, r.impacto) === 'bajo').length}
          </p>
          <p className="text-sm text-theme-secondary">Riesgos Bajos</p>
        </div>
        <div className="bg-amber-500/10 border border-amber-500/30 rounded-xl p-4 text-center">
          <p className="text-2xl font-bold text-amber-500">
            {data.riesgos.filter(r => getRiesgoNivel(r.probabilidad, r.impacto) === 'medio').length}
          </p>
          <p className="text-sm text-theme-secondary">Riesgos Medios</p>
        </div>
        <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-4 text-center">
          <p className="text-2xl font-bold text-red-500">
            {data.riesgos.filter(r => ['alto', 'critico'].includes(getRiesgoNivel(r.probabilidad, r.impacto))).length}
          </p>
          <p className="text-sm text-theme-secondary">Riesgos Altos/Críticos</p>
        </div>
      </div>
    </div>
  );

  const renderStep5 = () => (
    <div className="space-y-6">
      <div className="bg-blue-500/10 border border-blue-500/30 rounded-xl p-4">
        <h3 className="font-semibold text-theme-primary mb-2">Medidas de Mitigación</h3>
        <p className="text-sm text-theme-secondary">
          Especifique las medidas técnicas y organizativas para gestionar los riesgos identificados.
        </p>
      </div>

      <div>
        <label className="block text-sm font-medium text-theme-secondary mb-2">
          Medidas Técnicas (separadas por coma)
        </label>
        <textarea
          value={data.medidasTecnicas.join(', ')}
          onChange={e => updateField('medidasTecnicas', e.target.value.split(',').map(s => s.trim()).filter(Boolean))}
          className="w-full px-4 py-2 bg-theme-tertiary border border-theme rounded-xl text-theme-primary focus:outline-none focus:ring-2 focus:ring-accent h-24 resize-none"
          placeholder="ej. Cifrado de datos, Control de acceso, Registro de actividad, Backups..."
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-theme-secondary mb-2">
          Medidas Organizativas (separadas por coma)
        </label>
        <textarea
          value={data.medidasOrganizativas.join(', ')}
          onChange={e => updateField('medidasOrganizativas', e.target.value.split(',').map(s => s.trim()).filter(Boolean))}
          className="w-full px-4 py-2 bg-theme-tertiary border border-theme rounded-xl text-theme-primary focus:outline-none focus:ring-2 focus:ring-accent h-24 resize-none"
          placeholder="ej. Política de protección de datos, Acuerdos de confidencialidad, Formación..."
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-theme-card border border-theme rounded-xl p-4">
          <h4 className="font-medium text-theme-primary mb-3">Medidas Técnicas</h4>
          {data.medidasTecnicas.length > 0 ? (
            <ul className="space-y-2">
              {data.medidasTecnicas.map((medida, i) => (
                <li key={i} className="flex items-center gap-2 text-sm text-theme-secondary">
                  <Check className="w-4 h-4 text-emerald-500" />
                  {medida}
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-sm text-theme-muted">No hay medidas técnicas definidas</p>
          )}
        </div>

        <div className="bg-theme-card border border-theme rounded-xl p-4">
          <h4 className="font-medium text-theme-primary mb-3">Medidas Organizativas</h4>
          {data.medidasOrganizativas.length > 0 ? (
            <ul className="space-y-2">
              {data.medidasOrganizativas.map((medida, i) => (
                <li key={i} className="flex items-center gap-2 text-sm text-theme-secondary">
                  <Check className="w-4 h-4 text-emerald-500" />
                  {medida}
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-sm text-theme-muted">No hay medidas organizativas definidas</p>
          )}
        </div>
      </div>
    </div>
  );

  const renderStep6 = () => {
    const riesgosAltos = data.riesgos.filter(r => 
      ['alto', 'critico'].includes(getRiesgoNivel(r.probabilidad, r.impacto))
    );
    const requiereConsulta = riesgosAltos.length > 0 || data.categoriasDatos.includes('Salud') || 
      data.categoriasDatos.includes('Genéticos') || data.categoriasDatos.includes('Biométricos') ||
      data.categoriasInteresados.includes('Menores');

    return (
      <div className="space-y-6">
        <div className="bg-blue-500/10 border border-blue-500/30 rounded-xl p-4">
          <h3 className="font-semibold text-theme-primary mb-2">Conclusiones e Informe</h3>
          <p className="text-sm text-theme-secondary">
            Finalice la evaluación con las conclusiones y recomendaciones.
          </p>
        </div>

        <div>
          <label className="block text-sm font-medium text-theme-secondary mb-2">
            Conclusión del Tratamiento
          </label>
          <textarea
            value={data.conclusion}
            onChange={e => updateField('conclusion', e.target.value)}
            className="w-full px-4 py-2 bg-theme-tertiary border border-theme rounded-xl text-theme-primary focus:outline-none focus:ring-2 focus:ring-accent h-24 resize-none"
            placeholder="Indique si el tratamiento puede llevarse a cabo, requiere modificaciones o consulta previa..."
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-theme-secondary mb-2">
            Recomendaciones
          </label>
          <textarea
            value={data.recomendaciones}
            onChange={e => updateField('recomendaciones', e.target.value)}
            className="w-full px-4 py-2 bg-theme-tertiary border border-theme rounded-xl text-theme-primary focus:outline-none focus:ring-2 focus:ring-accent h-24 resize-none"
            placeholder="Sugerencias para mejorar la protección de datos..."
          />
        </div>

        <div className={`rounded-xl p-4 ${requiereConsulta ? 'bg-red-500/10 border border-red-500/30' : 'bg-emerald-500/10 border border-emerald-500/30'}`}>
          <div className="flex items-start gap-3">
            {requiereConsulta ? (
              <>
                <AlertTriangle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-medium text-theme-primary">Se Requiere Consulta Previa a la AEPD</h4>
                  <p className="text-sm text-theme-secondary mt-1">
                    El tratamiento presenta riesgos altos o involucra categorías especiales de datos. 
                    Según el artículo 36 RGPD, debe consultarse a la Agencia Española de Protección de Datos 
                    antes de iniciar el tratamiento.
                  </p>
                </div>
              </>
            ) : (
              <>
                <Check className="w-5 h-5 text-emerald-500 flex-shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-medium text-theme-primary">No Requiere Consulta Previa</h4>
                  <p className="text-sm text-theme-secondary mt-1">
                    El tratamiento no presenta riesgos altos que requieran consulta a la autoridad de control. 
                    Puede procederse con la implementación del tratamiento.
                  </p>
                </div>
              </>
            )}
          </div>
        </div>

        <div className="bg-theme-card border border-theme rounded-xl p-6">
          <h4 className="font-medium text-theme-primary mb-4">Resumen de la Evaluación</h4>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <div>
              <span className="text-theme-muted">Responsable:</span>
              <p className="text-theme-primary font-medium">{data.responsable || '-'}</p>
            </div>
            <div>
              <span className="text-theme-muted">Tratamiento:</span>
              <p className="text-theme-primary font-medium">{data.tratamiento || '-'}</p>
            </div>
            <div>
              <span className="text-theme-muted">Categorías de Datos:</span>
              <p className="text-theme-primary font-medium">{data.categoriasDatos.length}</p>
            </div>
            <div>
              <span className="text-theme-muted">Riesgos Identificados:</span>
              <p className="text-theme-primary font-medium">{data.riesgos.length}</p>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const renderCurrentStep = () => {
    switch (currentStep) {
      case 1: return renderStep1();
      case 2: return renderStep2();
      case 3: return renderStep3();
      case 4: return renderStep4();
      case 5: return renderStep5();
      case 6: return renderStep6();
      default: return null;
    }
  };

  const currentStepData = STEPS.find(s => s.id === currentStep);

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-theme-primary">Evaluación de Impacto en Protección de Datos</h1>
        <p className="text-theme-secondary mt-1">
          Wizard para realizar una EIPD conforme al RGPD (Art. 35)
        </p>
      </div>

      <div className="flex items-center justify-between mb-8 overflow-x-auto pb-2">
        {STEPS.map((step, index) => (
          <div key={step.id} className="flex items-center">
            <div className="flex flex-col items-center min-w-[80px]">
              <div
                className={`w-10 h-10 rounded-full flex items-center justify-center transition-colors ${
                  step.id < currentStep
                    ? 'bg-emerald-500 text-white'
                    : step.id === currentStep
                    ? 'bg-accent text-white'
                    : 'bg-theme-tertiary text-theme-muted'
                }`}
              >
                {step.id < currentStep ? (
                  <Check className="w-5 h-5" />
                ) : (
                  <step.icon className="w-5 h-5" />
                )}
              </div>
              <span className={`text-xs mt-2 text-center ${step.id === currentStep ? 'text-accent font-medium' : 'text-theme-muted'}`}>
                {step.title}
              </span>
            </div>
            {index < STEPS.length - 1 && (
              <div
                className={`w-8 md:w-16 h-0.5 mx-2 ${
                  step.id < currentStep ? 'bg-emerald-500' : 'bg-theme-tertiary'
                }`}
              />
            )}
          </div>
        ))}
      </div>

      <div className="bg-theme-card border border-theme rounded-2xl overflow-hidden">
        <div className="border-b border-theme p-4">
          <h2 className="text-lg font-semibold text-theme-primary">
            Paso {currentStep}: {currentStepData?.title}
          </h2>
          <p className="text-sm text-theme-secondary">{currentStepData?.description}</p>
        </div>

        <div className="p-6">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentStep}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.2 }}
            >
              {renderCurrentStep()}
            </motion.div>
          </AnimatePresence>
        </div>

        <div className="border-t border-theme p-4 flex items-center justify-between">
          <Button
            variant="secondary"
            onClick={handleBack}
            disabled={currentStep === 1}
            leftIcon={ChevronLeft}
          >
            Anterior
          </Button>

          <div className="flex gap-2">
            <Button
              variant="secondary"
              onClick={() => setShowPreview(true)}
              leftIcon={FileText}
            >
              Vista Previa
            </Button>
            {currentStep < STEPS.length ? (
              <Button onClick={handleNext} rightIcon={ChevronRight}>
                Siguiente
              </Button>
            ) : (
              <Button onClick={handleSave} leftIcon={Save}>
                Guardar EIPD
              </Button>
            )}
          </div>
        </div>
      </div>

      <AnimatePresence>
        {showPreview && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50"
            onClick={() => setShowPreview(false)}
          >
            <motion.div
              initial={{ scale: 0.95 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.95 }}
              className="bg-theme-card border border-theme rounded-2xl w-full max-w-3xl max-h-[90vh] overflow-y-auto"
              onClick={e => e.stopPropagation()}
            >
              <div className="sticky top-0 bg-theme-card border-b border-theme p-4 flex items-center justify-between">
                <h3 className="text-lg font-semibold text-theme-primary">Vista Previa del EIPD</h3>
                <button
                  onClick={() => setShowPreview(false)}
                  className="p-2 hover:bg-theme-tertiary rounded-lg"
                >
                  ×
                </button>
              </div>
              <div className="p-6 space-y-6">
                <section>
                  <h4 className="font-medium text-theme-primary mb-2">1. Responsable del Tratamiento</h4>
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <p><span className="text-theme-muted">Nombre:</span> {data.responsable || '-'}</p>
                    <p><span className="text-theme-muted">Contacto:</span> {data.contacto || '-'}</p>
                    <p><span className="text-theme-muted">Email:</span> {data.email || '-'}</p>
                    <p><span className="text-theme-muted">Teléfono:</span> {data.telefono || '-'}</p>
                  </div>
                </section>

                <section>
                  <h4 className="font-medium text-theme-primary mb-2">2. Tratamiento</h4>
                  <div className="space-y-2 text-sm">
                    <p><span className="text-theme-muted">Nombre:</span> {data.tratamiento || '-'}</p>
                    <p><span className="text-theme-muted">Finalidad:</span> {data.finalidad || '-'}</p>
                    <p><span className="text-theme-muted">Base Legal:</span> {data.baseLegal || '-'}</p>
                  </div>
                </section>

                <section>
                  <h4 className="font-medium text-theme-primary mb-2">3. Necesidad y Proporcionalidad</h4>
                  <div className="space-y-2 text-sm">
                    <p><span className="text-theme-muted">Necesidad:</span> {data.necesidad || '-'}</p>
                    <p><span className="text-theme-muted">Proporcionalidad:</span> {data.proporcionalidad || '-'}</p>
                  </div>
                </section>

                <section>
                  <h4 className="font-medium text-theme-primary mb-2">4. Riesgos ({data.riesgos.length})</h4>
                  {data.riesgos.length === 0 ? (
                    <p className="text-sm text-theme-muted">Sin riesgos identificados</p>
                  ) : (
                    <ul className="space-y-2">
                      {data.riesgos.map((r, i) => (
                        <li key={i} className="text-sm bg-theme-tertiary p-2 rounded">
                          {r.descripcion} - {r.probabilidad}/{r.impacto}
                        </li>
                      ))}
                    </ul>
                  )}
                </section>

                <section>
                  <h4 className="font-medium text-theme-primary mb-2">5. Conclusión</h4>
                  <p className="text-sm">{data.conclusion || '-'}</p>
                </section>
              </div>
              <div className="sticky bottom-0 bg-theme-card border-t border-theme p-4 flex justify-end">
                <Button onClick={handleSave} leftIcon={Download}>
                  Exportar PDF
                </Button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default EIPD_Wizard;

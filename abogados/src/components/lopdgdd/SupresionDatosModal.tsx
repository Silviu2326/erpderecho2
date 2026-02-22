import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Trash2, User, Mail, Phone, FileText, Calendar, 
  MapPin, Send, AlertTriangle, Upload, Building, Shield
} from 'lucide-react';
import { Modal } from '../ui/Modal';
import { Input } from '../ui/Form';
import { Textarea } from '../ui/Form';
import { Select } from '../ui/Form';
import { Checkbox } from '../ui/Form';

export interface SolicitudSupresion {
  id?: string;
  fechaSolicitud: string;
  lugarFirma: string;
  
  datosSolicitante: {
    nombreCompleto: string;
    email: string;
    telefono: string;
    dni: string;
    direccion: string;
  };
  
  datosRepresentante?: {
    nombreCompleto: string;
    dni: string;
    documentoAutorizacion: string;
  };
  
  datosResponsable: {
    nombre: string;
    nif: string;
    direccion: string;
  };
  
  motivoSupresion: string;
  identificacionDatos: string;
  documentacionAdjunta: string[];
  formaRespuesta: string;
  
  consentimientos: {
    identificacion: boolean;
    tratamientoDatos: boolean;
    compresionPlazo: boolean;
  };
  
  observaciones: string;
  estado: 'borrador' | 'enviada' | 'procesada' | 'completada';
}

interface SupresionDatosModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave?: (solicitud: SolicitudSupresion) => void;
  initialData?: Partial<SolicitudSupresion>;
}

const motivosSupresion = [
  { value: 'revocacion_consentimiento', label: 'Revocación del consentimiento' },
  { value: 'ejercicio_derecho_olvido', label: 'Ejercicio del derecho al olvido' },
  { value: 'datos_innecesarios', label: 'Datos personales no necesarios para la finalidad' },
  { value: 'tratamiento_ilegal', label: 'Tratamiento ilícito de datos' },
  { value: 'cumplimiento_legal', label: 'Cumplimiento de obligación legal' },
  { value: 'oposicion_tratamiento', label: 'Oposición al tratamiento' },
  { value: 'otro', label: 'Otro motivo' }
];

const formasRespuesta = [
  { value: 'email', label: 'Correo electrónico' },
  { value: 'correo_postal', label: 'Correo postal' },
  { value: 'ambas', label: 'Ambas' }
];

const initialSolicitud: SolicitudSupresion = {
  fechaSolicitud: new Date().toISOString().split('T')[0],
  lugarFirma: '',
  datosSolicitante: {
    nombreCompleto: '',
    email: '',
    telefono: '',
    dni: '',
    direccion: ''
  },
  datosResponsable: {
    nombre: '',
    nif: '',
    direccion: ''
  },
  motivoSupresion: '',
  identificacionDatos: '',
  documentacionAdjunta: [],
  formaRespuesta: 'email',
  consentimientos: {
    identificacion: false,
    tratamientoDatos: false,
    compresionPlazo: false
  },
  observaciones: '',
  estado: 'borrador'
};

export function SupresionDatosModal({ 
  isOpen, 
  onClose, 
  onSave, 
  initialData 
}: SupresionDatosModalProps) {
  const [solicitud, setSolicitud] = useState<SolicitudSupresion>(
    initialData ? { ...initialSolicitud, ...initialData } : initialSolicitud
  );
  const [activeTab, setActiveTab] = useState<'solicitante' | 'responsable' | 'supresion' | 'documentacion'>('solicitante');
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    
    if (!solicitud.datosSolicitante.nombreCompleto) {
      newErrors['nombreCompleto'] = 'El nombre es obligatorio';
    }
    if (!solicitud.datosSolicitante.email) {
      newErrors['email'] = 'El email es obligatorio';
    }
    if (!solicitud.datosSolicitante.dni) {
      newErrors['dni'] = 'El DNI/NIE es obligatorio';
    }
    if (!solicitud.datosResponsable.nombre) {
      newErrors['responsable'] = 'El nombre del responsable es obligatorio';
    }
    if (!solicitud.motivoSupresion) {
      newErrors['motivo'] = 'Debe seleccionar un motivo';
    }
    if (!solicitud.identificacionDatos) {
      newErrors['identificacion'] = 'Debe identificar los datos a suprimir';
    }
    if (!solicitud.lugarFirma) {
      newErrors['lugar'] = 'El lugar de firma es obligatorio';
    }
    if (!solicitud.consentimientos.identificacion) {
      newErrors['consentimiento'] = 'Debe aceptar la verificación de identidad';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = () => {
    if (validateForm() && onSave) {
      onSave(solicitud);
      onClose();
    }
  };

  const updateSolicitante = (field: string, value: string) => {
    setSolicitud(prev => ({
      ...prev,
      datosSolicitante: { ...prev.datosSolicitante, [field]: value }
    }));
  };

  const updateResponsable = (field: string, value: string) => {
    setSolicitud(prev => ({
      ...prev,
      datosResponsable: { ...prev.datosResponsable, [field]: value }
    }));
  };

  const tabs = [
    { id: 'solicitante', label: 'Solicitante', icon: User },
    { id: 'responsable', label: 'Responsable', icon: Building },
    { id: 'supresion', label: 'Supresión', icon: Trash2 },
    { id: 'documentacion', label: 'Documentación', icon: FileText }
  ] as const;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Ejercicio del Derecho de Supresión" size="lg">
      <div className="flex flex-col h-[70vh]">
        {/* Tabs */}
        <div className="flex border-b border-theme">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-3 text-sm font-medium transition-colors relative
                ${activeTab === tab.id 
                  ? 'text-accent' 
                  : 'text-theme-muted hover:text-theme-primary'
                }`}
            >
              <tab.icon className="w-4 h-4" />
              {tab.label}
              {activeTab === tab.id && (
                <motion.div
                  layoutId="activeTab"
                  className="absolute bottom-0 left-0 right-0 h-0.5 bg-accent"
                />
              )}
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          <AnimatePresence mode="wait">
            {activeTab === 'solicitante' && (
              <motion.div
                key="solicitante"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-6"
              >
                <div className="bg-blue-500/10 border border-blue-500/30 rounded-xl p-4">
                  <div className="flex items-start gap-3">
                    <Shield className="w-5 h-5 text-blue-500 mt-0.5" />
                    <div>
                      <h4 className="font-medium text-theme-primary">Datos del Solicitante</h4>
                      <p className="text-sm text-theme-secondary mt-1">
                        Indique sus datos personales para poder verificar su identidad
                      </p>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Input
                    label="Nombre completo"
                    value={solicitud.datosSolicitante.nombreCompleto}
                    onChange={e => updateSolicitante('nombreCompleto', e.target.value)}
                    error={errors.nombreCompleto}
                    leftIcon={<User className="w-5 h-5" />}
                    placeholder="Nombre y apellidos"
                  />
                  <Input
                    label="DNI / NIE"
                    value={solicitud.datosSolicitante.dni}
                    onChange={e => updateSolicitante('dni', e.target.value.toUpperCase())}
                    error={errors.dni}
                    placeholder="12345678A"
                    maxLength={9}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Input
                    label="Correo electrónico"
                    type="email"
                    value={solicitud.datosSolicitante.email}
                    onChange={e => updateSolicitante('email', e.target.value)}
                    error={errors.email}
                    leftIcon={<Mail className="w-5 h-5" />}
                    placeholder="correo@ejemplo.com"
                  />
                  <Input
                    label="Teléfono"
                    type="tel"
                    value={solicitud.datosSolicitante.telefono}
                    onChange={e => updateSolicitante('telefono', e.target.value)}
                    leftIcon={<Phone className="w-5 h-5" />}
                    placeholder="+34 600 000 000"
                  />
                </div>

                <Input
                  label="Dirección"
                  value={solicitud.datosSolicitante.direccion}
                  onChange={e => updateSolicitante('direccion', e.target.value)}
                  leftIcon={<MapPin className="w-5 h-5" />}
                  placeholder="Calle, número, código postal, ciudad"
                />
              </motion.div>
            )}

            {activeTab === 'responsable' && (
              <motion.div
                key="responsable"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-6"
              >
                <div className="bg-amber-500/10 border border-amber-500/30 rounded-xl p-4">
                  <div className="flex items-start gap-3">
                    <Building className="w-5 h-5 text-amber-500 mt-0.5" />
                    <div>
                      <h4 className="font-medium text-theme-primary">Responsable del Tratamiento</h4>
                      <p className="text-sm text-theme-secondary mt-1">
                        Datos de la empresa o entidad responsable de sus datos personales
                      </p>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Input
                    label="Nombre / Razón social"
                    value={solicitud.datosResponsable.nombre}
                    onChange={e => updateResponsable('nombre', e.target.value)}
                    error={errors.responsable}
                    leftIcon={<Building className="w-5 h-5" />}
                    placeholder="Nombre de la empresa"
                  />
                  <Input
                    label="NIF / CIF"
                    value={solicitud.datosResponsable.nif}
                    onChange={e => updateResponsable('nif', e.target.value.toUpperCase())}
                    placeholder="A12345678"
                    maxLength={9}
                  />
                </div>

                <Input
                  label="Domicilio"
                  value={solicitud.datosResponsable.direccion}
                  onChange={e => updateResponsable('direccion', e.target.value)}
                  leftIcon={<MapPin className="w-5 h-5" />}
                  placeholder="Calle, número, código postal, ciudad"
                />

                <div className="bg-theme-tertiary rounded-xl p-4">
                  <p className="text-sm text-theme-secondary">
                    <strong>Nota:</strong> Si no conoce los datos del responsable, puede indicarlo 
                    y se mostrará cómo identificarlos en el registro de actividades de tratamiento.
                  </p>
                </div>
              </motion.div>
            )}

            {activeTab === 'supresion' && (
              <motion.div
                key="supresion"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-6"
              >
                <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-4">
                  <div className="flex items-start gap-3">
                    <Trash2 className="w-5 h-5 text-red-500 mt-0.5" />
                    <div>
                      <h4 className="font-medium text-theme-primary">Solicitud de Supresión</h4>
                      <p className="text-sm text-theme-secondary mt-1">
                        Indique el motivo y los datos que desea que sean suprimidos
                      </p>
                    </div>
                  </div>
                </div>

                <Select
                  label="Motivo de la solicitud"
                  value={solicitud.motivoSupresion}
                  onChange={e => setSolicitud(prev => ({ ...prev, motivoSupresion: e.target.value }))}
                  error={errors.motivo}
                  options={[
                    { value: '', label: 'Seleccione un motivo...' },
                    ...motivosSupresion
                  ]}
                />

                <Textarea
                  label="Identificación de los datos a suprimir"
                  value={solicitud.identificacionDatos}
                  onChange={e => setSolicitud(prev => ({ ...prev, identificacionDatos: e.target.value }))}
                  error={errors.identificacion}
                  placeholder="Describa los datos que desea que se supriman (ej. datos de mi cuenta de cliente, historial de compras, datos de videovigilancia del fecha...)"
                  hint="Sea lo más específico posible para facilitar la localización de sus datos"
                  showCharCount
                  maxLength={500}
                  className="h-32"
                />

                <div className="bg-theme-tertiary rounded-xl p-4">
                  <h5 className="font-medium text-theme-primary mb-2">Excepciones al derecho de supresión</h5>
                  <p className="text-sm text-theme-secondary">
                    El derecho de supresión no aplica cuando existe obligación legal de conservación, 
                    para el ejercicio del derecho a la libertad de expresión, por razones de interés 
                    público, para fins de archivística, interés general, o para la formulación, 
                    ejercicio o defensa de reclamaciones.
                  </p>
                </div>

                <Select
                  label="Forma de respuesta preferida"
                  value={solicitud.formaRespuesta}
                  onChange={e => setSolicitud(prev => ({ ...prev, formaRespuesta: e.target.value }))}
                  options={formasRespuesta}
                />
              </motion.div>
            )}

            {activeTab === 'documentacion' && (
              <motion.div
                key="documentacion"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-6"
              >
                <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-xl p-4">
                  <div className="flex items-start gap-3">
                    <FileText className="w-5 h-5 text-emerald-500 mt-0.5" />
                    <div>
                      <h4 className="font-medium text-theme-primary">Documentación y Consentimiento</h4>
                      <p className="text-sm text-theme-secondary mt-1">
                        Adjunte documentación y acepte los consentimientos necesarios
                      </p>
                    </div>
                  </div>
                </div>

                <div className="border-2 border-dashed border-theme rounded-xl p-6 text-center">
                  <Upload className="w-8 h-8 text-theme-muted mx-auto mb-2" />
                  <p className="text-theme-secondary text-sm">
                    Arrastre archivos aquí o haga clic para seleccionar
                  </p>
                  <p className="text-theme-muted text-xs mt-1">
                    PDF, JPG, PNG hasta 10MB
                  </p>
                </div>

                <div className="bg-theme-tertiary rounded-xl p-4 space-y-4">
                  <Checkbox
                    label="Autorizo la verificación de mi identidad con los datos proporcionados"
                    checked={solicitud.consentimientos.identificacion}
                    onChange={e => setSolicitud(prev => ({
                      ...prev,
                      consentimientos: { ...prev.consentimientos, identificacion: e.target.checked }
                    }))}
                  />
                  <Checkbox
                    label="Los datos proporcionados son correctos y autorizo su tratamiento para gestionar esta solicitud"
                    checked={solicitud.consentimientos.tratamientoDatos}
                    onChange={e => setSolicitud(prev => ({
                      ...prev,
                      consentimientos: { ...prev.consentimientos, tratamientoDatos: e.target.checked }
                    }))}
                  />
                  <Checkbox
                    label="Acepto que el plazo de respuesta puede ampliarse hasta 2 meses en caso de solicitud complejas"
                    checked={solicitud.consentimientos.compresionPlazo}
                    onChange={e => setSolicitud(prev => ({
                      ...prev,
                      consentimientos: { ...prev.consentimientos, compresionPlazo: e.target.checked }
                    }))}
                  />
                </div>

                <Textarea
                  label="Observaciones"
                  value={solicitud.observaciones}
                  onChange={e => setSolicitud(prev => ({ ...prev, observaciones: e.target.value }))}
                  placeholder="Añada cualquier información adicional que considere relevante..."
                  showCharCount
                  maxLength={300}
                  className="h-24"
                />

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Input
                    label="Lugar de firma"
                    value={solicitud.lugarFirma}
                    onChange={e => setSolicitud(prev => ({ ...prev, lugarFirma: e.target.value }))}
                    error={errors.lugar}
                    leftIcon={<MapPin className="w-5 h-5" />}
                    placeholder="Ciudad"
                  />
                  <Input
                    label="Fecha"
                    value={solicitud.fechaSolicitud}
                    onChange={e => setSolicitud(prev => ({ ...prev, fechaSolicitud: e.target.value }))}
                    leftIcon={<Calendar className="w-5 h-5" />}
                    type="date"
                  />
                </div>

                {Object.keys(errors).length > 0 && (
                  <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-4">
                    <div className="flex items-start gap-3">
                      <AlertTriangle className="w-5 h-5 text-red-500 mt-0.5" />
                      <div>
                        <h4 className="font-medium text-theme-primary">Errores en el formulario</h4>
                        <ul className="text-sm text-theme-secondary mt-1 space-y-1">
                          {Object.values(errors).map((error, idx) => (
                            <li key={idx}>• {error}</li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Footer */}
        <div className="border-t border-theme p-4 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <div className={`w-2 h-2 rounded-full ${solicitud.estado === 'borrador' ? 'bg-amber-500' : 'bg-emerald-500'}`} />
            <span className="text-sm text-theme-muted">
              Estado: {solicitud.estado.charAt(0).toUpperCase() + solicitud.estado.slice(1)}
            </span>
          </div>
          <div className="flex gap-3">
            <button
              onClick={onClose}
              className="px-4 py-2 text-theme-secondary hover:text-theme-primary transition-colors"
            >
              Cancelar
            </button>
            <button
              onClick={handleSave}
              className="flex items-center gap-2 px-4 py-2 bg-accent text-white rounded-xl hover:bg-accent/90 transition-colors"
            >
              <Send className="w-4 h-4" />
              Enviar Solicitud
            </button>
          </div>
        </div>
      </div>
    </Modal>
  );
}

export default SupresionDatosModal;

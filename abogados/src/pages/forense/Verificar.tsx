// M12 - Biblioteca Forense: Verificar Documentos
// Verificación de autenticidad de documentos de identidad

import { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { 
  Shield, Upload, Camera, FileText, CheckCircle, XCircle,
  AlertTriangle, User, Calendar, MapPin, Fingerprint,
  Search, RefreshCw, Download, Eye
} from 'lucide-react';

// Datos mock de verificaciones anteriores
const historialVerificaciones = [
  { id: 'VER-001', tipo: 'dni', nombre: 'Juan García', fecha: '2024-05-20', resultado: 'valido', confianza: 98 },
  { id: 'VER-002', tipo: 'pasaporte', nombre: 'María López', fecha: '2024-05-19', resultado: 'valido', confianza: 95 },
  { id: 'VER-003', tipo: 'dni', nombre: 'Carlos Ruiz', fecha: '2024-05-18', resultado: 'sospechoso', confianza: 67 },
];

export default function ForenseVerificar() {
  const [dragActive, setDragActive] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [resultado, setResultado] = useState<any>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFile = (file: File) => {
    setSelectedFile(file);
    setIsVerifying(true);
    setResultado(null);

    // Simular verificación
    setTimeout(() => {
      const isValid = Math.random() > 0.2;
      setResultado({
        valido: isValid,
        documento: {
          tipo: 'DNI',
          nombre: 'JUAN GARCÍA',
          numero: '12345678A',
          nacimiento: '15/03/1985',
          validez: '15/03/2035',
          nacionalidad: 'ESPAÑOLA',
          sexo: 'M',
          direccion: 'C/ Mayor 123, Madrid',
        },
        verificaciones: {
          chip: isValid,
          foto: isValid,
          firma: isValid,
          fechaExpedicion: isValid,
        },
        confianza: isValid ? 95 + Math.floor(Math.random() * 5) : 60 + Math.floor(Math.random() * 20),
        detalles: isValid 
          ? 'Documento auténtico. Todos los elementos de seguridad verificados.'
          : 'Se detectaron anomalías en la zona MRZ. Se recomienda revisión manual.'
      });
      setIsVerifying(false);
    }, 2500);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setDragActive(true);
  };

  const handleDragLeave = () => {
    setDragActive(false);
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-theme-primary">Verificación de Documentos</h1>
          <p className="text-theme-secondary">Verifica la autenticidad de documentos de identidad</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Panel de verificación */}
        <div className="space-y-4">
          {/* Área de drop */}
          <div
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onClick={() => inputRef.current?.click()}
            className={`
              border-2 border-dashed rounded-2xl p-8 text-center cursor-pointer transition-all
              ${dragActive 
                ? 'border-accent bg-accent/10' 
                : 'border-theme hover:border-accent/50 bg-theme-card'
              }
              ${isVerifying ? 'opacity-50 pointer-events-none' : ''}
            `}
          >
            <input
              ref={inputRef}
              type="file"
              accept="image/*,.pdf"
              onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])}
              className="hidden"
            />
            
            {isVerifying ? (
              <div className="py-8">
                <RefreshCw className="w-12 h-12 text-accent mx-auto animate-spin" />
                <p className="mt-4 text-theme-primary font-medium">Verificando documento...</p>
                <p className="text-sm text-theme-secondary">Analizando elementos de seguridad</p>
              </div>
            ) : selectedFile ? (
              <div className="py-4">
                <FileText className="w-12 h-12 text-accent mx-auto" />
                <p className="mt-3 text-theme-primary font-medium">{selectedFile.name}</p>
                <p className="text-sm text-theme-secondary">{(selectedFile.size / 1024).toFixed(1)} KB</p>
                <button
                  onClick={(e) => { e.stopPropagation(); setSelectedFile(null); setResultado(null); }}
                  className="mt-3 text-sm text-red-400 hover:text-red-300"
                >
                  Cancelar
                </button>
              </div>
            ) : (
              <>
                <Upload className="w-12 h-12 text-theme-muted mx-auto" />
                <p className="mt-4 text-theme-primary font-medium">Arrastra un documento o haz clic para seleccionar</p>
                <p className="text-sm text-theme-secondary mt-1">Soporta: DNI, Pasaporte, Permiso de conducir</p>
              </>
            )}
          </div>

          {/* Botones de acción rápida */}
          <div className="flex gap-3">
            <button className="flex-1 flex items-center justify-center gap-2 py-3 bg-theme-card border border-theme rounded-xl text-theme-secondary hover:text-theme-primary hover:border-accent transition-colors">
              <Camera className="w-5 h-5" />
              Cámara
            </button>
            <button className="flex-1 flex items-center justify-center gap-2 py-3 bg-theme-card border border-theme rounded-xl text-theme-secondary hover:text-theme-primary hover:border-accent transition-colors">
              <Fingerprint className="w-5 h-5" />
              Huella
            </button>
          </div>

          {/* Historial reciente */}
          <div className="bg-theme-card border border-theme rounded-xl p-4">
            <h3 className="font-semibold text-theme-primary mb-3">Verificaciones recientes</h3>
            <div className="space-y-2 max-h-48 overflow-y-auto">
              {historialVerificaciones.map((item) => (
                <div key={item.id} className="flex items-center justify-between p-3 bg-theme-tertiary/50 rounded-lg">
                  <div className="flex items-center gap-3">
                    {item.resultado === 'valido' ? (
                      <CheckCircle className="w-5 h-5 text-emerald-400" />
                    ) : (
                      <AlertTriangle className="w-5 h-5 text-amber-400" />
                    )}
                    <div>
                      <p className="text-sm font-medium text-theme-primary">{item.nombre}</p>
                      <p className="text-xs text-theme-muted">{item.tipo.toUpperCase()} • {item.fecha}</p>
                    </div>
                  </div>
                  <span className={`text-xs ${item.resultado === 'valido' ? 'text-emerald-400' : 'text-amber-400'}`}>
                    {item.confianza}% confianza
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Panel de resultados */}
        <div className="space-y-4">
          {resultado ? (
            <>
              {/* Estado general */}
              <div className={`p-6 rounded-xl flex items-center gap-4 ${
                resultado.valido 
                  ? 'bg-emerald-500/10 border border-emerald-500/20' 
                  : 'bg-amber-500/10 border border-amber-500/20'
              }`}>
                {resultado.valido ? (
                  <>
                    <CheckCircle className="w-12 h-12 text-emerald-400" />
                  <div>
                    <p className="text-xl font-bold text-emerald-400">Documento Válido</p>
                    <p className="text-theme-secondary">{resultado.detalles}</p>
                  </div>
                  </>
                ) : (
                  <>
                    <AlertTriangle className="w-12 h-12 text-amber-400" />
                  <div>
                    <p className="text-xl font-bold text-amber-400">Documento Sospechoso</p>
                    <p className="text-theme-secondary">{resultado.detalles}</p>
                  </div>
                  </>
                )}
              </div>

              {/* Datos del documento */}
              <div className="bg-theme-card border border-theme rounded-xl p-4">
                <h3 className="font-semibold text-theme-primary mb-4">Datos del Documento</h3>
                <div className="space-y-3">
                  <div className="grid grid-cols-2 gap-3">
                    <div className="p-3 bg-theme-tertiary/50 rounded-lg">
                      <p className="text-xs text-theme-muted">Tipo</p>
                      <p className="text-theme-primary font-medium">{resultado.documento.tipo}</p>
                    </div>
                    <div className="p-3 bg-theme-tertiary/50 rounded-lg">
                      <p className="text-xs text-theme-muted">Número</p>
                      <p className="text-theme-primary font-medium">{resultado.documento.numero}</p>
                    </div>
                  </div>
                  <div className="p-3 bg-theme-tertiary/50 rounded-lg">
                    <p className="text-xs text-theme-muted">Nombre</p>
                    <p className="text-theme-primary font-medium">{resultado.documento.nombre}</p>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="p-3 bg-theme-tertiary/50 rounded-lg">
                      <p className="text-xs text-theme-muted">Nacimiento</p>
                      <p className="text-theme-primary font-medium">{resultado.documento.nacimiento}</p>
                    </div>
                    <div className="p-3 bg-theme-tertiary/50 rounded-lg">
                      <p className="text-xs text-theme-muted">Validez</p>
                      <p className="text-theme-primary font-medium">{resultado.documento.validez}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Verificaciones de seguridad */}
              <div className="bg-theme-card border border-theme rounded-xl p-4">
                <h3 className="font-semibold text-theme-primary mb-4">Verificaciones de Seguridad</h3>
                <div className="space-y-2">
                  {Object.entries(resultado.verificaciones).map(([key, value]) => (
                    <div key={key} className="flex items-center justify-between p-3 bg-theme-tertiary/50 rounded-lg">
                      <span className="text-theme-primary capitalize">{key.replace(/([A-Z])/g, ' $1').trim()}</span>
                      {value ? (
                        <CheckCircle className="w-5 h-5 text-emerald-400" />
                      ) : (
                        <XCircle className="w-5 h-5 text-red-400" />
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Confianza */}
              <div className="bg-theme-card border border-theme rounded-xl p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-theme-primary font-medium">Nivel de confianza</span>
                  <span className={`text-lg font-bold ${resultado.confianza >= 90 ? 'text-emerald-400' : 'text-amber-400'}`}>
                    {resultado.confianza}%
                  </span>
                </div>
                <div className="h-2 bg-theme-tertiary rounded-full overflow-hidden">
                  <div 
                    className={`h-full rounded-full ${resultado.confianza >= 90 ? 'bg-emerald-400' : 'bg-amber-400'}`}
                    style={{ width: `${resultado.confianza}%` }}
                  />
                </div>
              </div>

              {/* Acciones */}
              <div className="flex gap-3">
                <button className="flex-1 py-3 bg-accent text-white font-medium rounded-xl hover:bg-accent-hover transition-colors flex items-center justify-center gap-2">
                  <Download className="w-4 h-4" />
                  Descargar Informe
                </button>
                <button className="px-4 py-3 border border-theme text-theme-secondary rounded-xl hover:bg-theme-tertiary transition-colors flex items-center justify-center gap-2">
                  <Eye className="w-4 h-4" />
                  Ver Detalle
                </button>
              </div>
            </>
          ) : (
            <div className="bg-theme-card border border-theme rounded-xl p-12 text-center h-full flex flex-col items-center justify-center">
              <Shield className="w-16 h-16 text-theme-muted mb-4" />
              <p className="text-theme-primary font-medium">Sin resultados</p>
              <p className="text-theme-secondary text-sm mt-1">
                Sube un documento para verificar su autenticidad
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

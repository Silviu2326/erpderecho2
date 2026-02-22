import { useState } from 'react';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import { Badge } from '../ui';
import { 
  Mail, 
  CheckCircle, 
  AlertCircle, 
  Loader2,
  ExternalLink,
  Shield,
  Calendar,
  HardDrive
} from 'lucide-react';
import type { 
  PlataformaIntegracion, 
  EstadoIntegracion,
  CredencialesIntegracion
} from '../../types/integraciones';

interface EmailVincularModalProps {
  isOpen: boolean;
  onClose: () => void;
  onVincular: (plataforma: PlataformaIntegracion) => Promise<void>;
  conexionesActivas?: CredencialesIntegracion[];
  isLoading?: boolean;
}

interface PlataformaOption {
  id: PlataformaIntegracion;
  nombre: string;
  color: string;
  servicios: string[];
  icono: 'google' | 'microsoft';
}

const plataformasDisponibles: PlataformaOption[] = [
  {
    id: 'google',
    nombre: 'Google Workspace',
    color: '#4285F4',
    servicios: ['Gmail', 'Google Calendar', 'Google Drive', 'Contactos'],
    icono: 'google'
  },
  {
    id: 'office365',
    nombre: 'Microsoft 365',
    color: '#0078D4',
    servicios: ['Outlook', 'Calendario', 'OneDrive', 'Contactos'],
    icono: 'microsoft'
  }
];

const PlataformaIcon = ({ 
  plataforma, 
  className = "w-12 h-12" 
}: { 
  plataforma: PlataformaOption; 
  className?: string;
}) => {
  if (plataforma.icono === 'google') {
    return (
      <svg viewBox="0 0 24 24" className={className}>
        <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
        <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
        <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
        <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
      </svg>
    );
  }

  return (
    <svg viewBox="0 0 23 23" className={className}>
      <path fill="#f25022" d="M1 1h10v10H1z"/>
      <path fill="#00a4ef" d="M1 12h10v10H1z"/>
      <path fill="#7fba00" d="M12 1h10v10H12z"/>
      <path fill="#ffb900" d="M12 12h10v10H12z"/>
    </svg>
  );
};

export function EmailVincularModal({
  isOpen,
  onClose,
  onVincular,
  conexionesActivas = [],
  isLoading = false
}: EmailVincularModalProps) {
  const [selectedPlataforma, setSelectedPlataforma] = useState<PlataformaIntegracion | null>(null);
  const [connectingPlataforma, setConnectingPlataforma] = useState<PlataformaIntegracion | null>(null);
  const [error, setError] = useState<string | null>(null);

  const getPlataformaEstado = (plataforma: PlataformaIntegracion): EstadoIntegracion | null => {
    const conexion = conexionesActivas.find(c => c.plataforma === plataforma);
    return conexion ? 'connected' : null;
  };

  const getPlataformaEmail = (plataforma: PlataformaIntegracion): string | null => {
    const conexion = conexionesActivas.find(c => c.plataforma === plataforma);
    return conexion?.userEmail || null;
  };

  const handleVincular = async (plataforma: PlataformaIntegracion) => {
    try {
      setError(null);
      setSelectedPlataforma(plataforma);
      setConnectingPlataforma(plataforma);
      await onVincular(plataforma);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al vincular la cuenta');
    } finally {
      setConnectingPlataforma(null);
      setSelectedPlataforma(null);
    }
  };

  const handleClose = () => {
    setSelectedPlataforma(null);
    setError(null);
    setConnectingPlataforma(null);
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title="Vincular Cuenta de Correo"
      size="lg"
    >
      <div className="space-y-6">
        <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-4 flex items-start gap-3">
          <Shield className="w-5 h-5 text-blue-400 flex-shrink-0 mt-0.5" />
          <div className="text-sm text-theme-secondary">
            <p className="font-medium text-blue-400 mb-1">Conexión segura</p>
            <p>Tu contraseña nunca se almacena. Usamos OAuth 2.0 para una conexión segura con tu proveedor de correo.</p>
          </div>
        </div>

        {error && (
          <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-4 flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
            <p className="text-sm text-red-400">{error}</p>
          </div>
        )}

        <div className="space-y-4">
          <h4 className="text-sm font-medium text-theme-primary">Selecciona tu proveedor de correo</h4>
          
          {plataformasDisponibles.map((plataforma) => {
            const estado = getPlataformaEstado(plataforma.id);
            const emailConectado = getPlataformaEmail(plataforma.id);
            const isConnecting = connectingPlataforma === plataforma.id;
            const isSelected = selectedPlataforma === plataforma.id;

            return (
              <div 
                key={plataforma.id}
                className={`
                  bg-theme-card border border-theme rounded-2xl p-6
                  hover:border-accent/50 hover:shadow-lg transition-all cursor-pointer
                  relative overflow-hidden
                  ${estado === 'connected' ? 'border-emerald-500/30 bg-emerald-500/5' : ''}
                  ${isSelected && !estado ? 'ring-2 ring-offset-2 ring-offset-theme-card' : ''}
                `}
                style={isSelected && !estado ? { '--tw-ring-color': plataforma.color } as React.CSSProperties : undefined}
              >
                <div className="flex items-start gap-4">
                  <PlataformaIcon plataforma={plataforma} className="w-12 h-12 flex-shrink-0" />
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h5 className="font-semibold text-theme-primary">{plataforma.nombre}</h5>
                      {estado === 'connected' && (
                        <Badge variant="success" size="sm">
                          <CheckCircle className="w-3 h-3 mr-1" />
                          Conectado
                        </Badge>
                      )}
                    </div>

                    {estado === 'connected' && emailConectado ? (
                      <div className="flex items-center gap-2 text-sm text-emerald-400">
                        <Mail className="w-4 h-4" />
                        <span className="truncate">{emailConectado}</span>
                      </div>
                    ) : (
                      <div className="flex flex-wrap gap-2 mt-2">
                        {plataforma.servicios.map((servicio) => (
                          <span 
                            key={servicio}
                            className="inline-flex items-center gap-1 px-2 py-1 bg-theme-tertiary rounded-md text-xs text-theme-muted"
                          >
                            {servicio === 'Gmail' || servicio === 'Outlook' ? (
                              <Mail className="w-3 h-3" />
                            ) : servicio.includes('Calendar') ? (
                              <Calendar className="w-3 h-3" />
                            ) : (
                              <HardDrive className="w-3 h-3" />
                            )}
                            {servicio}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>

                  <div className="flex-shrink-0">
                    {estado === 'connected' ? (
                      <Button 
                        variant="secondary" 
                        size="sm"
                        disabled={isConnecting}
                      >
                        Cambiar cuenta
                      </Button>
                    ) : isConnecting ? (
                      <Button variant="primary" size="sm" disabled>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Conectando...
                      </Button>
                    ) : (
                      <Button 
                        variant="primary" 
                        size="sm"
                        onClick={() => handleVincular(plataforma.id)}
                        disabled={isLoading}
                        style={{ backgroundColor: plataforma.color }}
                      >
                        <ExternalLink className="w-4 h-4 mr-2" />
                        Conectar
                      </Button>
                    )}
                  </div>
                </div>

                {estado === 'connected' && (
                  <div className="absolute inset-y-0 left-0 w-1 bg-emerald-500" />
                )}
              </div>
            );
          })}
        </div>

        <div className="text-center text-sm text-theme-muted">
          <p>Al vincular, estarás permitiendo el acceso a:</p>
          <ul className="mt-2 space-y-1">
            <li>• Leer y enviar correos electrónicos</li>
            <li>• Sincronizar calendario y eventos</li>
            <li>• Acceder a archivos en la nube</li>
          </ul>
        </div>
      </div>
    </Modal>
  );
}

export default EmailVincularModal;

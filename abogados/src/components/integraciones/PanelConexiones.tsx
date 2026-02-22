import { useState } from 'react';
import { Card, Badge } from '../ui';
import { Button } from '../ui/Button';
import { 
  RefreshCw, 
  CheckCircle, 
  XCircle, 
  AlertTriangle, 
  Clock,
  Mail,
  Calendar,
  HardDrive,
  Unplug
} from 'lucide-react';
import type { 
  EstadoIntegracion,
  PlataformaIntegracion 
} from '../../types/integraciones';
import { getPlataformaNombre } from '../../types/integraciones';

export interface ConexionActiva {
  id: string;
  plataforma: PlataformaIntegracion;
  estado: EstadoIntegracion;
  email: string;
  nombre?: string;
  ultimoAcceso?: string;
  servicios: {
    calendar: boolean;
    email: boolean;
    drive: boolean;
  };
}

interface PanelConexionesProps {
  conexiones: ConexionActiva[];
  onDesconectar?: (id: string) => void;
  onReconectar?: (id: string) => void;
}

const getEstadoIcon = (estado: EstadoIntegracion) => {
  switch (estado) {
    case 'connected':
      return <CheckCircle className="w-5 h-5 text-emerald-400" />;
    case 'connecting':
    case 'syncing':
      return <RefreshCw className="w-5 h-5 text-blue-400 animate-spin" />;
    case 'error':
    case 'expired':
      return <AlertTriangle className="w-5 h-5 text-amber-400" />;
    case 'disconnected':
      return <XCircle className="w-5 h-5 text-gray-400" />;
  }
};

const getEstadoBadge = (estado: EstadoIntegracion): 'success' | 'warning' | 'error' | 'info' | 'default' => {
  switch (estado) {
    case 'connected':
      return 'success';
    case 'connecting':
    case 'syncing':
      return 'info';
    case 'error':
    case 'expired':
      return 'warning';
    case 'disconnected':
      return 'default';
  }
};

const getEstadoLabel = (estado: EstadoIntegracion): string => {
  switch (estado) {
    case 'connected':
      return 'Conectado';
    case 'connecting':
      return 'Conectando...';
    case 'syncing':
      return 'Sincronizando';
    case 'error':
      return 'Error';
    case 'expired':
      return 'Expirado';
    case 'disconnected':
      return 'Desconectado';
  }
};

const PlataformaIcon = ({ plataforma }: { plataforma: PlataformaIntegracion }) => {
  if (plataforma === 'office365') {
    return (
      <svg viewBox="0 0 23 23" className="w-8 h-8">
        <path fill="#f25022" d="M1 1h10v10H1z"/>
        <path fill="#00a4ef" d="M1 12h10v10H1z"/>
        <path fill="#7fba00" d="M12 1h10v10H12z"/>
        <path fill="#ffb900" d="M12 12h10v10H12z"/>
      </svg>
    );
  }
  
  if (plataforma === 'google') {
    return (
      <svg viewBox="0 0 24 24" className="w-8 h-8">
        <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
        <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
        <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
        <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
      </svg>
    );
  }
  
  return <HardDrive className="w-8 h-8 text-gray-400" />;
};

export function PanelConexiones({ conexiones, onDesconectar, onReconectar }: PanelConexionesProps) {
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const conexionesOrdenadas = [...conexiones].sort((a, b) => {
    const estadoOrden = { connected: 0, syncing: 1, connecting: 2, error: 3, expired: 4, disconnected: 5 };
    return estadoOrden[a.estado] - estadoOrden[b.estado];
  });

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-theme-primary">Conexiones Activas</h3>
        <span className="text-sm text-theme-muted">
          {conexiones.filter(c => c.estado === 'connected').length} / {conexiones.length} activas
        </span>
      </div>

      {conexionesOrdenadas.length === 0 ? (
        <Card className="text-center py-8">
          <div className="flex flex-col items-center gap-3 text-theme-muted">
            <Unplug className="w-12 h-12" />
            <p>No hay conexiones configuradas</p>
            <p className="text-sm">Conecta tu cuenta de Microsoft o Google para comenzar</p>
          </div>
        </Card>
      ) : (
        <div className="space-y-3">
          {conexionesOrdenadas.map((conexion) => (
            <Card 
              key={conexion.id} 
              hover 
              className="overflow-hidden"
            >
              <div 
                className="flex items-center gap-4 cursor-pointer"
                onClick={() => setExpandedId(expandedId === conexion.id ? null : conexion.id)}
              >
                <PlataformaIcon plataforma={conexion.plataforma} />
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-theme-primary">
                      {getPlataformaNombre(conexion.plataforma)}
                    </span>
                    {getEstadoIcon(conexion.estado)}
                  </div>
                  <div className="flex items-center gap-2 text-sm text-theme-muted">
                    <Mail className="w-3.5 h-3.5" />
                    <span className="truncate">{conexion.email}</span>
                  </div>
                </div>

                <Badge variant={getEstadoBadge(conexion.estado)}>
                  {getEstadoLabel(conexion.estado)}
                </Badge>
              </div>

              {expandedId === conexion.id && (
                <div className="mt-4 pt-4 border-t border-theme">
                  <div className="grid grid-cols-3 gap-4 mb-4">
                    <div className={`flex flex-col items-center p-3 rounded-lg ${conexion.servicios.calendar ? 'bg-emerald-500/10' : 'bg-theme-tertiary'}`}>
                      <Calendar className={`w-5 h-5 mb-1 ${conexion.servicios.calendar ? 'text-emerald-400' : 'text-theme-muted'}`} />
                      <span className={`text-xs ${conexion.servicios.calendar ? 'text-emerald-400' : 'text-theme-muted'}`}>
                        Calendario
                      </span>
                    </div>
                    <div className={`flex flex-col items-center p-3 rounded-lg ${conexion.servicios.email ? 'bg-emerald-500/10' : 'bg-theme-tertiary'}`}>
                      <Mail className={`w-5 h-5 mb-1 ${conexion.servicios.email ? 'text-emerald-400' : 'text-theme-muted'}`} />
                      <span className={`text-xs ${conexion.servicios.email ? 'text-emerald-400' : 'text-theme-muted'}`}>
                        Correo
                      </span>
                    </div>
                    <div className={`flex flex-col items-center p-3 rounded-lg ${conexion.servicios.drive ? 'bg-emerald-500/10' : 'bg-theme-tertiary'}`}>
                      <HardDrive className={`w-5 h-5 mb-1 ${conexion.servicios.drive ? 'text-emerald-400' : 'text-theme-muted'}`} />
                      <span className={`text-xs ${conexion.servicios.drive ? 'text-emerald-400' : 'text-theme-muted'}`}>
                        Drive
                      </span>
                    </div>
                  </div>

                  {conexion.ultimoAcceso && (
                    <div className="flex items-center gap-2 text-sm text-theme-muted mb-4">
                      <Clock className="w-4 h-4" />
                      <span>Último acceso: {new Date(conexion.ultimoAcceso).toLocaleString('es-ES')}</span>
                    </div>
                  )}

                  <div className="flex gap-2">
                    {(conexion.estado === 'error' || conexion.estado === 'expired') && onReconectar && (
                      <Button 
                        variant="secondary" 
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          onReconectar(conexion.id);
                        }}
                      >
                        <RefreshCw className="w-4 h-4 mr-1" />
                        Reconectar
                      </Button>
                    )}
                    {conexion.estado === 'connected' && onDesconectar && (
                      <Button 
                        variant="danger" 
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          onDesconectar(conexion.id);
                        }}
                      >
                        <Unplug className="w-4 h-4 mr-1" />
                        Desconectar
                      </Button>
                    )}
                  </div>
                </div>
              )}
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

export default PanelConexiones;

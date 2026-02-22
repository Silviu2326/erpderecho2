import { 
  RefreshCw, 
  CheckCircle, 
  XCircle, 
  AlertTriangle, 
  Clock,
  Calendar,
  CalendarOff,
  Zap
} from 'lucide-react';
import { Card, Badge, Button } from '../ui';
import type { 
  EstadoIntegracion,
  PlataformaIntegracion,
  SyncStatus
} from '../../types/integraciones';
import { getPlataformaNombre } from '../../types/integraciones';

export interface CalendarioSyncInfo {
  id: string;
  plataforma: PlataformaIntegracion;
  estado: EstadoIntegracion;
  email: string;
  ultimoSync?: string;
  proximoSync?: string;
  eventosSincronizados: number;
  eventosPendientes: number;
  eventosConError: number;
  syncStatus: SyncStatus;
  calendarioId?: string;
  nombreCalendario?: string;
}

interface CalendarSyncStatusProps {
  calendarios: CalendarioSyncInfo[];
  onSincronizar?: (id: string) => void;
  onSincronizarTodo?: () => void;
  onConfigurar?: (id: string) => void;
}

const getEstadoIcon = (estado: EstadoIntegracion) => {
  switch (estado) {
    case 'connected':
      return <CheckCircle className="w-5 h-5 text-emerald-400" />;
    case 'syncing':
      return <RefreshCw className="w-5 h-5 text-blue-400 animate-spin" />;
    case 'connecting':
      return <RefreshCw className="w-5 h-5 text-blue-400 animate-pulse" />;
    case 'error':
      return <AlertTriangle className="w-5 h-5 text-red-400" />;
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
    case 'syncing':
    case 'connecting':
      return 'info';
    case 'error':
    case 'expired':
      return 'error';
    case 'disconnected':
      return 'default';
  }
};

const getEstadoLabel = (estado: EstadoIntegracion): string => {
  switch (estado) {
    case 'connected':
      return 'Conectado';
    case 'syncing':
      return 'Sincronizando';
    case 'connecting':
      return 'Conectando';
    case 'error':
      return 'Error';
    case 'expired':
      return 'Expirado';
    case 'disconnected':
      return 'Desconectado';
  }
};

const getSyncStatusBadge = (status: SyncStatus): 'success' | 'warning' | 'error' | 'info' | 'default' => {
  switch (status) {
    case 'synced':
      return 'success';
    case 'pending':
      return 'info';
    case 'conflict':
      return 'warning';
    case 'error':
      return 'error';
  }
};

const getSyncStatusLabel = (status: SyncStatus): string => {
  switch (status) {
    case 'synced':
      return 'Sincronizado';
    case 'pending':
      return 'Pendiente';
    case 'conflict':
      return 'Conflicto';
    case 'error':
      return 'Error';
  }
};

const formatFecha = (fecha?: string): string => {
  if (!fecha) return 'Nunca';
  const date = new Date(fecha);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return 'Hace un momento';
  if (diffMins < 60) return `Hace ${diffMins} min`;
  if (diffHours < 24) return `Hace ${diffHours} h`;
  if (diffDays < 7) return `Hace ${diffDays} días`;
  return date.toLocaleDateString('es-ES', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' });
};

const PlataformaIcon = ({ plataforma }: { plataforma: PlataformaIntegracion }) => {
  if (plataforma === 'office365') {
    return (
      <svg viewBox="0 0 23 23" className="w-6 h-6">
        <path fill="#f25022" d="M1 1h10v10H1z"/>
        <path fill="#00a4ef" d="M1 12h10v10H1z"/>
        <path fill="#7fba00" d="M12 1h10v10H12z"/>
        <path fill="#ffb900" d="M12 12h10v10H12z"/>
      </svg>
    );
  }
  
  if (plataforma === 'google') {
    return (
      <svg viewBox="0 0 24 24" className="w-6 h-6">
        <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
        <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
        <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
        <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
      </svg>
    );
  }
  
  return <Calendar className="w-6 h-6 text-gray-400" />;
};

export function CalendarSyncStatus({ 
  calendarios, 
  onSincronizar, 
  onSincronizarTodo,
  onConfigurar 
}: CalendarSyncStatusProps) {
  const calendariosActivos = calendarios.filter(c => c.estado === 'connected' || c.estado === 'syncing');
  const totalEventos = calendarios.reduce((acc, c) => acc + c.eventosSincronizados, 0);
  const totalPendientes = calendarios.reduce((acc, c) => acc + c.eventosPendientes, 0);
  const totalErrores = calendarios.reduce((acc, c) => acc + c.eventosConError, 0);

  const tieneErrores = calendarios.some(c => c.estado === 'error' || c.syncStatus === 'error');

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Calendar className="w-5 h-5 text-theme-primary" />
          <h3 className="text-lg font-semibold text-theme-primary">Sincronización de Calendarios</h3>
        </div>
        {onSincronizarTodo && calendariosActivos.length > 0 && (
          <Button 
            variant="secondary" 
            size="sm"
            onClick={onSincronizarTodo}
          >
            <RefreshCw className="w-4 h-4 mr-1" />
            Sincronizar Todo
          </Button>
        )}
      </div>

      {calendarios.length === 0 ? (
        <Card className="text-center py-8">
          <div className="flex flex-col items-center gap-3 text-theme-muted">
            <CalendarOff className="w-12 h-12" />
            <p>No hay calendarios configurados</p>
            <p className="text-sm">Conecta tu cuenta para sincronizar eventos</p>
          </div>
        </Card>
      ) : (
        <>
          <div className="grid grid-cols-3 gap-3">
            <Card className="text-center py-3">
              <div className="text-2xl font-bold text-emerald-400">{totalEventos}</div>
              <div className="text-xs text-theme-muted">Sincronizados</div>
            </Card>
            <Card className="text-center py-3">
              <div className={`text-2xl font-bold ${totalPendientes > 0 ? 'text-blue-400' : 'text-theme-muted'}`}>
                {totalPendientes}
              </div>
              <div className="text-xs text-theme-muted">Pendientes</div>
            </Card>
            <Card className="text-center py-3">
              <div className={`text-2xl font-bold ${totalErrores > 0 ? 'text-red-400' : 'text-theme-muted'}`}>
                {totalErrores}
              </div>
              <div className="text-xs text-theme-muted">Errores</div>
            </Card>
          </div>

          {tieneErrores && (
            <Card className="border-l-4 border-l-red-400 bg-red-500/5">
              <div className="flex items-start gap-3">
                <AlertTriangle className="w-5 h-5 text-red-400 mt-0.5" />
                <div>
                  <p className="font-medium text-red-400">Error de sincronización</p>
                  <p className="text-sm text-theme-muted">
                    Algunos calendarios tienen problemas de sincronización
                  </p>
                </div>
              </div>
            </Card>
          )}

          <div className="space-y-3">
            {calendarios.map((calendario) => (
              <Card key={calendario.id} hover className="overflow-hidden">
                <div className="flex items-center gap-4">
                  <PlataformaIcon plataforma={calendario.plataforma} />
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-theme-primary">
                        {calendario.nombreCalendario || getPlataformaNombre(calendario.plataforma)}
                      </span>
                      {getEstadoIcon(calendario.estado)}
                    </div>
                    <div className="flex items-center gap-2 text-sm text-theme-muted">
                      <Clock className="w-3.5 h-3.5" />
                      <span>Última sync: {formatFecha(calendario.ultimoSync)}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <Badge variant={getSyncStatusBadge(calendario.syncStatus)}>
                      {getSyncStatusLabel(calendario.syncStatus)}
                    </Badge>
                    <Badge variant={getEstadoBadge(calendario.estado)}>
                      {getEstadoLabel(calendario.estado)}
                    </Badge>
                  </div>
                </div>

                <div className="mt-3 pt-3 border-t border-theme flex items-center justify-between">
                  <div className="flex items-center gap-6 text-sm">
                    <div className="flex items-center gap-1.5">
                      <CheckCircle className="w-4 h-4 text-emerald-400" />
                      <span className="text-theme-muted">{calendario.eventosSincronizados} sync</span>
                    </div>
                    {calendario.eventosPendientes > 0 && (
                      <div className="flex items-center gap-1.5">
                        <Clock className="w-4 h-4 text-blue-400" />
                        <span className="text-theme-muted">{calendario.eventosPendientes} pend</span>
                      </div>
                    )}
                    {calendario.eventosConError > 0 && (
                      <div className="flex items-center gap-1.5">
                        <AlertTriangle className="w-4 h-4 text-red-400" />
                        <span className="text-red-400">{calendario.eventosConError} errores</span>
                      </div>
                    )}
                  </div>

                  <div className="flex gap-2">
                    {(calendario.estado === 'connected' || calendario.estado === 'error') && onSincronizar && (
                      <Button 
                        variant="secondary" 
                        size="sm"
                        onClick={() => onSincronizar(calendario.id)}
                        disabled={calendario.estado === 'syncing'}
                      >
                        {calendario.estado === 'syncing' ? (
                          <RefreshCw className="w-4 h-4 mr-1 animate-spin" />
                        ) : (
                          <Zap className="w-4 h-4 mr-1" />
                        )}
                        Sync
                      </Button>
                    )}
                    {calendario.estado === 'disconnected' && onConfigurar && (
                      <Button 
                        variant="primary" 
                        size="sm"
                        onClick={() => onConfigurar(calendario.id)}
                      >
                        Configurar
                      </Button>
                    )}
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

export default CalendarSyncStatus;

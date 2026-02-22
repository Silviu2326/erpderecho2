import {
  AlertTriangle, AlertCircle, Info, Clock, User, ChevronRight,
} from 'lucide-react';
import type { RecordatorioCRM } from '@/types/crm';
import { ETAPAS_CONFIG } from '@/types/crm';

interface RecordatoriosPanelProps {
  recordatorios: RecordatorioCRM[];
  onClickLead: (leadId: string) => void;
}

const nivelConfig = {
  critical: { icon: AlertTriangle, color: 'text-red-400', bg: 'bg-red-500/10', border: 'border-red-500/20', label: 'Urgente' },
  warning: { icon: AlertCircle, color: 'text-amber-400', bg: 'bg-amber-500/10', border: 'border-amber-500/20', label: 'Atención' },
  info: { icon: Info, color: 'text-blue-400', bg: 'bg-blue-500/10', border: 'border-blue-500/20', label: 'Recordatorio' },
};

export default function RecordatoriosPanel({ recordatorios, onClickLead }: RecordatoriosPanelProps) {
  if (recordatorios.length === 0) return null;

  return (
    <div className="bg-theme-card border border-theme rounded-2xl p-4">
      <div className="flex items-center gap-2 mb-3">
        <Clock className="w-4 h-4 text-amber-400" />
        <h3 className="text-sm font-semibold text-theme-primary">
          Recordatorios ({recordatorios.length})
        </h3>
      </div>
      <div className="space-y-2">
        {recordatorios.map((rec) => {
          const config = nivelConfig[rec.nivel];
          const Icon = config.icon;
          return (
            <button
              key={rec.id}
              onClick={() => onClickLead(rec.leadId)}
              className={`w-full flex items-center gap-3 p-3 rounded-xl border ${config.border} ${config.bg} hover:opacity-80 transition-opacity text-left`}
            >
              <Icon className={`w-4 h-4 ${config.color} flex-shrink-0`} />
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium text-theme-primary truncate">{rec.leadNombre}</span>
                  <span className={`text-xs px-1.5 py-0.5 rounded-full ${ETAPAS_CONFIG[rec.etapa].bgColor} ${ETAPAS_CONFIG[rec.etapa].color}`}>
                    {ETAPAS_CONFIG[rec.etapa].nombre}
                  </span>
                </div>
                <div className="flex items-center gap-2 text-xs text-theme-muted mt-0.5">
                  <span className={config.color}>{rec.diasSinActividad} días sin actividad</span>
                  <span>·</span>
                  <div className="flex items-center gap-1">
                    <User className="w-3 h-3" />
                    <span>{rec.abogadoAsignado}</span>
                  </div>
                </div>
              </div>
              <ChevronRight className="w-4 h-4 text-theme-muted flex-shrink-0" />
            </button>
          );
        })}
      </div>
    </div>
  );
}

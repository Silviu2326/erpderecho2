import { motion } from 'framer-motion';
import {
  Building2, DollarSign, Clock, Phone,
  GripVertical, Star,
} from 'lucide-react';
import type { Lead } from '@/types/crm';
import { Badge } from '@/components/ui';

interface LeadCardProps {
  lead: Lead;
  onClick?: (lead: Lead) => void;
  onDragStart?: (e: React.DragEvent, lead: Lead) => void;
  compact?: boolean;
}

const prioridadConfig = {
  alta: { label: 'Alta', variant: 'error' as const },
  media: { label: 'Media', variant: 'warning' as const },
  baja: { label: 'Baja', variant: 'default' as const },
};

export default function LeadCard({ lead, onClick, onDragStart, compact = false }: LeadCardProps) {
  const formatCurrency = (amount: number) =>
    new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 }).format(amount);

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8 }}
      draggable
      onDragStart={(e) => onDragStart?.(e as unknown as React.DragEvent, lead)}
      onClick={() => onClick?.(lead)}
      className="bg-theme-card border border-theme rounded-xl p-3 cursor-pointer hover:border-accent/40 hover:shadow-md transition-all group"
    >
      <div className="flex items-start gap-2">
        <GripVertical className="w-4 h-4 text-theme-muted opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0 mt-0.5 cursor-grab" />
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-2 mb-1">
            <p className="text-sm font-medium text-theme-primary truncate">{lead.nombre}</p>
            <Badge variant={prioridadConfig[lead.prioridad].variant} size="sm">
              {prioridadConfig[lead.prioridad].label}
            </Badge>
          </div>

          {lead.empresa && (
            <div className="flex items-center gap-1.5 mb-1.5">
              <Building2 className="w-3 h-3 text-theme-muted flex-shrink-0" />
              <span className="text-xs text-theme-secondary truncate">{lead.empresa}</span>
            </div>
          )}

          <div className="flex items-center gap-1.5 mb-2">
            <Star className="w-3 h-3 text-theme-muted flex-shrink-0" />
            <span className="text-xs text-theme-secondary truncate">{lead.tipoServicio}</span>
          </div>

          {!compact && (
            <div className="flex items-center gap-3 mb-2 text-xs text-theme-muted">
              <div className="flex items-center gap-1">
                <Phone className="w-3 h-3" />
                <span className="truncate">{lead.telefono}</span>
              </div>
            </div>
          )}

          <div className="flex items-center justify-between pt-2 border-t border-theme">
            <div className="flex items-center gap-1">
              <DollarSign className="w-3.5 h-3.5 text-emerald-400" />
              <span className="text-sm font-semibold text-emerald-400">{formatCurrency(lead.valorEstimado)}</span>
            </div>
            <div className="flex items-center gap-1">
              <Clock className="w-3 h-3 text-theme-muted" />
              <span className="text-xs text-theme-muted">{lead.diasEnEtapa}d</span>
            </div>
          </div>

          <div className="flex items-center justify-between mt-2">
            <div className="flex items-center gap-1.5">
              <div className="w-5 h-5 bg-accent rounded-full flex items-center justify-center">
                <span className="text-[10px] text-white font-medium">{lead.abogadoAsignado.split(' ').map(n => n[0]).join('')}</span>
              </div>
              <span className="text-xs text-theme-muted truncate">{lead.abogadoAsignado}</span>
            </div>
            <span className="text-xs text-theme-muted">{lead.probabilidad}%</span>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

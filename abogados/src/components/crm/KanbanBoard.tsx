import { useState } from 'react';
import { AnimatePresence } from 'framer-motion';
import { DollarSign } from 'lucide-react';
import type { Lead, EtapaPipeline } from '@/types/crm';
import { ETAPAS_CONFIG, ETAPAS_ACTIVAS } from '@/types/crm';
import LeadCard from './LeadCard';

interface KanbanBoardProps {
  leads: Lead[];
  onMoverLead: (leadId: string, etapa: EtapaPipeline) => void;
  onClickLead: (lead: Lead) => void;
}

export default function KanbanBoard({ leads, onMoverLead, onClickLead }: KanbanBoardProps) {
  const [dragOverEtapa, setDragOverEtapa] = useState<EtapaPipeline | null>(null);

  const handleDragStart = (e: React.DragEvent, lead: Lead) => {
    e.dataTransfer.setData('leadId', lead.id);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e: React.DragEvent, etapa: EtapaPipeline) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    setDragOverEtapa(etapa);
  };

  const handleDragLeave = () => {
    setDragOverEtapa(null);
  };

  const handleDrop = (e: React.DragEvent, etapa: EtapaPipeline) => {
    e.preventDefault();
    const leadId = e.dataTransfer.getData('leadId');
    if (leadId) {
      onMoverLead(leadId, etapa);
    }
    setDragOverEtapa(null);
  };

  const formatCurrency = (amount: number) =>
    new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 }).format(amount);

  return (
    <div className="flex gap-4 overflow-x-auto pb-4 min-h-[calc(100vh-320px)]">
      {ETAPAS_ACTIVAS.map((etapaId) => {
        const config = ETAPAS_CONFIG[etapaId];
        const etapaLeads = leads.filter(l => l.etapa === etapaId);
        const valorTotal = etapaLeads.reduce((s, l) => s + l.valorEstimado, 0);
        const isDragOver = dragOverEtapa === etapaId;

        return (
          <div
            key={etapaId}
            className="flex-shrink-0 w-72"
            onDragOver={(e) => handleDragOver(e, etapaId)}
            onDragLeave={handleDragLeave}
            onDrop={(e) => handleDrop(e, etapaId)}
          >
            <div className={`rounded-xl border ${isDragOver ? 'border-accent/50 bg-accent/5' : 'border-theme bg-theme-primary/50'} transition-colors`}>
              <div className="p-3 border-b border-theme">
                <div className="flex items-center justify-between mb-1">
                  <div className="flex items-center gap-2">
                    <div className={`w-2.5 h-2.5 rounded-full ${config.bgColor} border ${config.borderColor}`} />
                    <span className="text-sm font-medium text-theme-primary">{config.nombre}</span>
                  </div>
                  <span className={`px-2 py-0.5 text-xs rounded-full ${config.bgColor} ${config.color} font-medium`}>
                    {etapaLeads.length}
                  </span>
                </div>
                <div className="flex items-center gap-3 text-xs text-theme-muted">
                  <div className="flex items-center gap-1">
                    <DollarSign className="w-3 h-3" />
                    <span>{formatCurrency(valorTotal)}</span>
                  </div>
                </div>
              </div>

              <div className="p-2 space-y-2 min-h-[200px]">
                <AnimatePresence mode="popLayout">
                  {etapaLeads.map((lead) => (
                    <LeadCard
                      key={lead.id}
                      lead={lead}
                      onClick={onClickLead}
                      onDragStart={handleDragStart}
                      compact
                    />
                  ))}
                </AnimatePresence>

                {etapaLeads.length === 0 && (
                  <div className="flex items-center justify-center h-24 text-xs text-theme-muted border-2 border-dashed border-theme rounded-lg">
                    Arrastra leads aquí
                  </div>
                )}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

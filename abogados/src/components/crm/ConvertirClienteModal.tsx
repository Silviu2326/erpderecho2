import { useState } from 'react';
import {
  UserCheck, FolderOpen, CheckCircle,
} from 'lucide-react';
import type { Lead } from '@/types/crm';
import { Button } from '@/components/ui/Button';

interface ConvertirClienteModalProps {
  lead: Lead;
  onConvertir: (crearExpediente: boolean) => Promise<void>;
  onClose: () => void;
}

export default function ConvertirClienteModal({ lead, onConvertir, onClose }: ConvertirClienteModalProps) {
  const [crearExpediente, setCrearExpediente] = useState(true);
  const [converting, setConverting] = useState(false);
  const [done, setDone] = useState(false);

  const handleConvertir = async () => {
    setConverting(true);
    await onConvertir(crearExpediente);
    setConverting(false);
    setDone(true);
  };

  if (done) {
    return (
      <div className="text-center py-6 space-y-4">
        <div className="w-16 h-16 bg-emerald-500/10 rounded-full flex items-center justify-center mx-auto">
          <CheckCircle className="w-8 h-8 text-emerald-400" />
        </div>
        <div>
          <p className="text-lg font-semibold text-theme-primary">¡Lead convertido!</p>
          <p className="text-sm text-theme-secondary mt-1">
            {lead.nombre} ha sido registrado como cliente.
            {crearExpediente && ' Se ha creado un expediente automáticamente.'}
          </p>
        </div>
        <Button onClick={onClose}>Cerrar</Button>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <div className="bg-theme-tertiary rounded-xl p-4 border border-theme">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-10 h-10 bg-accent rounded-full flex items-center justify-center">
            <UserCheck className="w-5 h-5 text-white" />
          </div>
          <div>
            <p className="text-sm font-semibold text-theme-primary">{lead.nombre}</p>
            <p className="text-xs text-theme-muted">{lead.email} · {lead.tipoServicio}</p>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-3 text-sm">
          <div>
            <span className="text-theme-muted">Valor:</span>{' '}
            <span className="text-emerald-400 font-medium">
              {new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 }).format(lead.valorEstimado)}
            </span>
          </div>
          <div>
            <span className="text-theme-muted">Abogado:</span>{' '}
            <span className="text-theme-primary">{lead.abogadoAsignado}</span>
          </div>
        </div>
      </div>

      <div>
        <label className="flex items-center gap-3 p-3 bg-theme-card border border-theme rounded-xl cursor-pointer hover:border-accent/40 transition-colors">
          <input
            type="checkbox"
            checked={crearExpediente}
            onChange={(e) => setCrearExpediente(e.target.checked)}
            className="w-4 h-4 rounded border-theme accent-accent"
          />
          <div className="flex items-center gap-2">
            <FolderOpen className="w-4 h-4 text-accent" />
            <div>
              <p className="text-sm font-medium text-theme-primary">Crear expediente automáticamente</p>
              <p className="text-xs text-theme-muted">Se creará un expediente vinculado con los datos del lead</p>
            </div>
          </div>
        </label>
      </div>

      <div className="flex justify-end gap-3 pt-2">
        <Button variant="secondary" onClick={onClose}>Cancelar</Button>
        <Button onClick={handleConvertir} disabled={converting}>
          <UserCheck className="w-4 h-4 mr-2" />
          {converting ? 'Convirtiendo...' : 'Convertir a Cliente'}
        </Button>
      </div>
    </div>
  );
}

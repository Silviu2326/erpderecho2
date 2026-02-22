import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Phone, Mail, Users, FileText, CheckSquare,
  Plus, Clock, ChevronRight,
} from 'lucide-react';
import type { ActividadCRM, TipoActividad } from '@/types/crm';
import { Button } from '@/components/ui/Button';
import { Input, Select, Textarea } from '@/components/ui/Form';
import { Badge } from '@/components/ui';

const iconMap = {
  llamada: Phone,
  email: Mail,
  reunion: Users,
  nota: FileText,
  tarea: CheckSquare,
};

const colorMap: Record<TipoActividad, string> = {
  llamada: 'bg-blue-500/10 text-blue-400 border-blue-500/30',
  email: 'bg-purple-500/10 text-purple-400 border-purple-500/30',
  reunion: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30',
  nota: 'bg-amber-500/10 text-amber-400 border-amber-500/30',
  tarea: 'bg-cyan-500/10 text-cyan-400 border-cyan-500/30',
};

const tipoLabels: Record<TipoActividad, string> = {
  llamada: 'Llamada',
  email: 'Email',
  reunion: 'Reunión',
  nota: 'Nota',
  tarea: 'Tarea',
};

interface ActividadTimelineProps {
  actividades: ActividadCRM[];
  onAddActividad: (tipo: TipoActividad, descripcion: string, resultado?: string, proximaAccion?: string) => Promise<void>;
}

export default function ActividadTimeline({ actividades, onAddActividad }: ActividadTimelineProps) {
  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    tipo: 'llamada' as TipoActividad,
    descripcion: '',
    resultado: '',
    proximaAccion: '',
  });

  const handleSubmit = async () => {
    if (!form.descripcion.trim()) return;
    setSaving(true);
    await onAddActividad(form.tipo, form.descripcion, form.resultado || undefined, form.proximaAccion || undefined);
    setForm({ tipo: 'llamada', descripcion: '', resultado: '', proximaAccion: '' });
    setShowForm(false);
    setSaving(false);
  };

  const sorted = [...actividades].sort((a, b) => b.fecha.localeCompare(a.fecha));

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-theme-primary">Actividades ({actividades.length})</h3>
        <Button size="sm" onClick={() => setShowForm(!showForm)}>
          <Plus className="w-3.5 h-3.5 mr-1" />
          Registrar
        </Button>
      </div>

      <AnimatePresence>
        {showForm && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden"
          >
            <div className="bg-theme-tertiary rounded-xl p-4 space-y-3 border border-theme">
              <div className="grid grid-cols-2 gap-3">
                <Select
                  label="Tipo"
                  value={form.tipo}
                  onChange={(e) => setForm({ ...form, tipo: e.target.value as TipoActividad })}
                  options={Object.entries(tipoLabels).map(([k, v]) => ({ value: k, label: v }))}
                />
                <Input
                  label="Resultado"
                  placeholder="Resultado de la acción"
                  value={form.resultado}
                  onChange={(e) => setForm({ ...form, resultado: e.target.value })}
                />
              </div>
              <Textarea
                label="Descripción *"
                placeholder="Describe la actividad realizada..."
                rows={2}
                value={form.descripcion}
                onChange={(e) => setForm({ ...form, descripcion: e.target.value })}
              />
              <Input
                label="Próxima acción"
                placeholder="¿Qué hay que hacer después?"
                value={form.proximaAccion}
                onChange={(e) => setForm({ ...form, proximaAccion: e.target.value })}
              />
              <div className="flex justify-end gap-2">
                <Button variant="secondary" size="sm" onClick={() => setShowForm(false)}>Cancelar</Button>
                <Button size="sm" onClick={handleSubmit} disabled={saving || !form.descripcion.trim()}>
                  {saving ? 'Guardando...' : 'Guardar'}
                </Button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {sorted.length === 0 ? (
        <div className="text-center py-8 text-theme-muted">
          <Clock className="w-8 h-8 mx-auto mb-2 opacity-50" />
          <p className="text-sm">Sin actividades registradas</p>
        </div>
      ) : (
        <div className="relative">
          <div className="absolute left-4 top-0 bottom-0 w-px bg-theme-tertiary" />
          <div className="space-y-3">
            {sorted.map((act, i) => {
              const Icon = iconMap[act.tipo];
              return (
                <motion.div
                  key={act.id}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.05 }}
                  className="relative pl-10"
                >
                  <div className={`absolute left-1.5 top-2 w-5 h-5 rounded-full border flex items-center justify-center ${colorMap[act.tipo]}`}>
                    <Icon className="w-2.5 h-2.5" />
                  </div>
                  <div className="bg-theme-card border border-theme rounded-lg p-3">
                    <div className="flex items-center justify-between mb-1">
                      <Badge variant="info" size="sm">{tipoLabels[act.tipo]}</Badge>
                      <span className="text-xs text-theme-muted">{act.fecha}</span>
                    </div>
                    <p className="text-sm text-theme-primary">{act.descripcion}</p>
                    {act.resultado && (
                      <p className="text-xs text-theme-secondary mt-1">
                        <span className="font-medium">Resultado:</span> {act.resultado}
                      </p>
                    )}
                    {act.proximaAccion && (
                      <div className="flex items-center gap-1 mt-1.5 text-xs text-accent">
                        <ChevronRight className="w-3 h-3" />
                        <span>{act.proximaAccion}</span>
                      </div>
                    )}
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

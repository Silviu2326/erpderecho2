import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import {
  Search, Download, Trash2, Eye,
  ChevronUp, ChevronDown, Mail,
  ArrowUpDown,
} from 'lucide-react';
import { AppLayout } from '@/components/layout/AppLayout';
import { useCRM } from '@/hooks/useCRM';
import { Card, Badge } from '@/components/ui';
import { Button } from '@/components/ui/Button';
import { Input, Select } from '@/components/ui/Form';
import { useToast } from '@/components/ui/Toast';
import { useDebounce } from '@/hooks/useDebounce';
import { TableSkeleton } from '@/components/ui/Skeleton';
import { EmptyState } from '@/components/ui/EmptyState';
import { Modal } from '@/components/ui/Modal';
import type { Lead } from '@/types/crm';
import { ETAPAS_CONFIG, FUENTES_LABELS, ETAPAS_ACTIVAS, ETAPAS_CERRADAS } from '@/types/crm';

type SortField = 'nombre' | 'valorEstimado' | 'fechaCreacion' | 'diasEnEtapa' | 'probabilidad';
type SortDir = 'asc' | 'desc';

const prioridadBadge = {
  alta: 'error' as const,
  media: 'warning' as const,
  baja: 'default' as const,
};

function SortIndicator({ field, sortField, sortDir }: { field: SortField; sortField: SortField; sortDir: SortDir }) {
  if (sortField !== field) return <ArrowUpDown className="w-3 h-3 text-theme-muted" />;
  return sortDir === 'asc'
    ? <ChevronUp className="w-3 h-3 text-accent" />
    : <ChevronDown className="w-3 h-3 text-accent" />;
}

export default function Leads() {
  const { leads, isLoading, eliminarLead } = useCRM();
  const { showToast } = useToast();
  const [busqueda, setBusqueda] = useState('');
  const [filtroEtapa, setFiltroEtapa] = useState<string>('todos');
  const [filtroFuente, setFiltroFuente] = useState<string>('todos');
  const [filtroPrioridad, setFiltroPrioridad] = useState<string>('todos');
  const [sortField, setSortField] = useState<SortField>('fechaCreacion');
  const [sortDir, setSortDir] = useState<SortDir>('desc');
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<string | null>(null);

  const debouncedBusqueda = useDebounce(busqueda, 300);

  const formatCurrency = (amount: number) =>
    new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 }).format(amount);

  const filtered = useMemo(() => {
    let result = [...leads];

    if (debouncedBusqueda) {
      const q = debouncedBusqueda.toLowerCase();
      result = result.filter(l =>
        l.nombre.toLowerCase().includes(q) ||
        l.email.toLowerCase().includes(q) ||
        l.empresa?.toLowerCase().includes(q) ||
        l.tipoServicio.toLowerCase().includes(q)
      );
    }
    if (filtroEtapa !== 'todos') result = result.filter(l => l.etapa === filtroEtapa);
    if (filtroFuente !== 'todos') result = result.filter(l => l.fuente === filtroFuente);
    if (filtroPrioridad !== 'todos') result = result.filter(l => l.prioridad === filtroPrioridad);

    result.sort((a, b) => {
      let cmp = 0;
      if (sortField === 'nombre') cmp = a.nombre.localeCompare(b.nombre);
      else if (sortField === 'valorEstimado') cmp = a.valorEstimado - b.valorEstimado;
      else if (sortField === 'fechaCreacion') cmp = a.fechaCreacion.localeCompare(b.fechaCreacion);
      else if (sortField === 'diasEnEtapa') cmp = a.diasEnEtapa - b.diasEnEtapa;
      else if (sortField === 'probabilidad') cmp = a.probabilidad - b.probabilidad;
      return sortDir === 'asc' ? cmp : -cmp;
    });

    return result;
  }, [leads, debouncedBusqueda, filtroEtapa, filtroFuente, filtroPrioridad, sortField, sortDir]);

  const toggleSort = (field: SortField) => {
    if (sortField === field) setSortDir(d => d === 'asc' ? 'desc' : 'asc');
    else { setSortField(field); setSortDir('desc'); }
  };

  const handleDelete = async (id: string) => {
    await eliminarLead(id);
    showToast('Lead eliminado', 'success');
    setShowDeleteConfirm(null);
  };

  const handleExportCSV = () => {
    const headers = ['ID', 'Nombre', 'Email', 'Teléfono', 'Empresa', 'Etapa', 'Fuente', 'Valor', 'Probabilidad', 'Abogado', 'Servicio', 'Creado'];
    const rows = filtered.map(l => [l.id, l.nombre, l.email, l.telefono, l.empresa || '', ETAPAS_CONFIG[l.etapa].nombre, FUENTES_LABELS[l.fuente], l.valorEstimado, l.probabilidad + '%', l.abogadoAsignado, l.tipoServicio, l.fechaCreacion]);
    const csv = [headers, ...rows].map(r => r.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = 'leads_crm.csv'; a.click();
    URL.revokeObjectURL(url);
    showToast('CSV exportado', 'success');
  };

  const allEtapas = [...ETAPAS_ACTIVAS, ...ETAPAS_CERRADAS];

  return (
    <AppLayout title="Leads" subtitle="Lista de leads y oportunidades">
      <div className="p-6 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-theme-primary">Leads</h2>
            <p className="text-theme-secondary">{filtered.length} de {leads.length} leads</p>
          </div>
          <div className="flex items-center gap-3">
            <Button variant="secondary" onClick={handleExportCSV}>
              <Download className="w-4 h-4 mr-2" />
              Exportar CSV
            </Button>
          </div>
        </div>

        <Card className="!p-4">
          <div className="flex flex-wrap gap-3">
            <div className="flex-1 min-w-[200px]">
              <Input
                placeholder="Buscar por nombre, email, empresa..."
                value={busqueda}
                onChange={(e) => setBusqueda(e.target.value)}
                icon={<Search className="w-4 h-4" />}
              />
            </div>
            <Select
              value={filtroEtapa}
              onChange={(e) => setFiltroEtapa(e.target.value)}
              options={[{ value: 'todos', label: 'Todas las etapas' }, ...allEtapas.map(e => ({ value: e, label: ETAPAS_CONFIG[e].nombre }))]}
            />
            <Select
              value={filtroFuente}
              onChange={(e) => setFiltroFuente(e.target.value)}
              options={[{ value: 'todos', label: 'Todas las fuentes' }, ...Object.entries(FUENTES_LABELS).map(([k, v]) => ({ value: k, label: v }))]}
            />
            <Select
              value={filtroPrioridad}
              onChange={(e) => setFiltroPrioridad(e.target.value)}
              options={[{ value: 'todos', label: 'Todas' }, { value: 'alta', label: 'Alta' }, { value: 'media', label: 'Media' }, { value: 'baja', label: 'Baja' }]}
            />
          </div>
        </Card>

        {isLoading ? (
          <TableSkeleton />
        ) : filtered.length === 0 ? (
          <EmptyState title="Sin resultados" description="No se encontraron leads con los filtros aplicados." />
        ) : (
          <div className="bg-theme-card border border-theme rounded-2xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-theme">
                    <th className="text-left p-4 text-xs font-medium text-theme-muted uppercase cursor-pointer hover:text-theme-primary" onClick={() => toggleSort('nombre')}>
                      <div className="flex items-center gap-1">Lead <SortIndicator field="nombre" sortField={sortField} sortDir={sortDir} /></div>
                    </th>
                    <th className="text-left p-4 text-xs font-medium text-theme-muted uppercase">Etapa</th>
                    <th className="text-left p-4 text-xs font-medium text-theme-muted uppercase">Fuente</th>
                    <th className="text-right p-4 text-xs font-medium text-theme-muted uppercase cursor-pointer hover:text-theme-primary" onClick={() => toggleSort('valorEstimado')}>
                      <div className="flex items-center gap-1 justify-end">Valor <SortIndicator field="valorEstimado" sortField={sortField} sortDir={sortDir} /></div>
                    </th>
                    <th className="text-center p-4 text-xs font-medium text-theme-muted uppercase cursor-pointer hover:text-theme-primary" onClick={() => toggleSort('probabilidad')}>
                      <div className="flex items-center gap-1 justify-center">Prob. <SortIndicator field="probabilidad" sortField={sortField} sortDir={sortDir} /></div>
                    </th>
                    <th className="text-left p-4 text-xs font-medium text-theme-muted uppercase">Abogado</th>
                    <th className="text-center p-4 text-xs font-medium text-theme-muted uppercase cursor-pointer hover:text-theme-primary" onClick={() => toggleSort('diasEnEtapa')}>
                      <div className="flex items-center gap-1 justify-center">Días <SortIndicator field="diasEnEtapa" sortField={sortField} sortDir={sortDir} /></div>
                    </th>
                    <th className="text-left p-4 text-xs font-medium text-theme-muted uppercase">Prioridad</th>
                    <th className="text-right p-4 text-xs font-medium text-theme-muted uppercase">Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((lead, i) => (
                    <motion.tr
                      key={lead.id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: i * 0.03 }}
                      className="border-b border-theme last:border-0 hover:bg-theme-tertiary transition-colors"
                    >
                      <td className="p-4">
                        <div>
                          <p className="text-sm font-medium text-theme-primary">{lead.nombre}</p>
                          <div className="flex items-center gap-2 mt-0.5">
                            {lead.empresa && <span className="text-xs text-theme-muted">{lead.empresa}</span>}
                          </div>
                          <div className="flex items-center gap-3 mt-1 text-xs text-theme-muted">
                            <span className="flex items-center gap-1"><Mail className="w-3 h-3" />{lead.email}</span>
                          </div>
                        </div>
                      </td>
                      <td className="p-4">
                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${ETAPAS_CONFIG[lead.etapa].bgColor} ${ETAPAS_CONFIG[lead.etapa].color}`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${ETAPAS_CONFIG[lead.etapa].color.replace('text-', 'bg-')}`} />
                          {ETAPAS_CONFIG[lead.etapa].nombre}
                        </span>
                      </td>
                      <td className="p-4 text-sm text-theme-secondary">{FUENTES_LABELS[lead.fuente]}</td>
                      <td className="p-4 text-right">
                        <span className="text-sm font-semibold text-emerald-400">{formatCurrency(lead.valorEstimado)}</span>
                      </td>
                      <td className="p-4 text-center">
                        <span className="text-sm text-theme-primary">{lead.probabilidad}%</span>
                      </td>
                      <td className="p-4">
                        <div className="flex items-center gap-2">
                          <div className="w-6 h-6 bg-accent rounded-full flex items-center justify-center">
                            <span className="text-[10px] text-white font-medium">{lead.abogadoAsignado.split(' ').map(n => n[0]).join('')}</span>
                          </div>
                          <span className="text-sm text-theme-secondary">{lead.abogadoAsignado}</span>
                        </div>
                      </td>
                      <td className="p-4 text-center">
                        <span className="text-sm text-theme-muted">{lead.diasEnEtapa}d</span>
                      </td>
                      <td className="p-4">
                        <Badge variant={prioridadBadge[lead.prioridad]} size="sm">
                          {lead.prioridad.charAt(0).toUpperCase() + lead.prioridad.slice(1)}
                        </Badge>
                      </td>
                      <td className="p-4">
                        <div className="flex items-center justify-end gap-1">
                          <button onClick={() => setSelectedLead(lead)} className="p-1.5 text-theme-muted hover:text-accent hover:bg-accent/10 rounded-lg transition-colors">
                            <Eye className="w-4 h-4" />
                          </button>
                          <button onClick={() => setShowDeleteConfirm(lead.id)} className="p-1.5 text-theme-muted hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors">
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        <Modal isOpen={!!selectedLead} onClose={() => setSelectedLead(null)} title={selectedLead?.nombre || ''} size="lg">
          {selectedLead && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div><p className="text-xs text-theme-muted mb-1">Email</p><p className="text-sm text-theme-primary">{selectedLead.email}</p></div>
                <div><p className="text-xs text-theme-muted mb-1">Teléfono</p><p className="text-sm text-theme-primary">{selectedLead.telefono}</p></div>
                {selectedLead.empresa && <div><p className="text-xs text-theme-muted mb-1">Empresa</p><p className="text-sm text-theme-primary">{selectedLead.empresa}</p></div>}
                <div><p className="text-xs text-theme-muted mb-1">Fuente</p><p className="text-sm text-theme-primary">{FUENTES_LABELS[selectedLead.fuente]}</p></div>
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div><p className="text-xs text-theme-muted mb-1">Etapa</p><Badge variant="info">{ETAPAS_CONFIG[selectedLead.etapa].nombre}</Badge></div>
                <div><p className="text-xs text-theme-muted mb-1">Valor</p><p className="text-sm font-semibold text-emerald-400">{formatCurrency(selectedLead.valorEstimado)}</p></div>
                <div><p className="text-xs text-theme-muted mb-1">Probabilidad</p><p className="text-sm text-theme-primary">{selectedLead.probabilidad}%</p></div>
              </div>
              <div><p className="text-xs text-theme-muted mb-1">Notas</p><p className="text-sm text-theme-secondary bg-theme-tertiary rounded-lg p-3">{selectedLead.notas || 'Sin notas'}</p></div>
              <div className="grid grid-cols-3 gap-4 pt-2 border-t border-theme text-xs text-theme-muted">
                <div>Creado: {selectedLead.fechaCreacion}</div>
                <div>Último contacto: {selectedLead.fechaUltimoContacto}</div>
                <div>Días en etapa: {selectedLead.diasEnEtapa}</div>
              </div>
            </div>
          )}
        </Modal>

        <Modal isOpen={!!showDeleteConfirm} onClose={() => setShowDeleteConfirm(null)} title="Eliminar Lead" size="sm">
          <div className="space-y-4">
            <p className="text-sm text-theme-secondary">¿Estás seguro de que quieres eliminar este lead? Esta acción no se puede deshacer.</p>
            <div className="flex justify-end gap-3">
              <Button variant="secondary" onClick={() => setShowDeleteConfirm(null)}>Cancelar</Button>
              <Button variant="danger" onClick={() => showDeleteConfirm && handleDelete(showDeleteConfirm)}>Eliminar</Button>
            </div>
          </div>
        </Modal>
      </div>
    </AppLayout>
  );
}

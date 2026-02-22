import { useState } from 'react';
import {
  Plus, Users, DollarSign, Clock,
  ArrowUpRight, Target, RefreshCw, UserCheck,
} from 'lucide-react';
import { AppLayout } from '@/components/layout/AppLayout';
import { useCRM } from '@/hooks/useCRM';
import { Card, Badge, Tabs } from '@/components/ui';
import { Button } from '@/components/ui/Button';
import { StatsSkeleton } from '@/components/ui/Skeleton';
import { Modal } from '@/components/ui/Modal';
import { Input, Select, Textarea } from '@/components/ui/Form';
import { useToast } from '@/components/ui/Toast';
import KanbanBoard from '@/components/crm/KanbanBoard';
import ActividadTimeline from '@/components/crm/ActividadTimeline';
import ConvertirClienteModal from '@/components/crm/ConvertirClienteModal';
import RecordatoriosPanel from '@/components/crm/RecordatoriosPanel';
import type { Lead, EtapaPipeline, FuenteCaptacion, PrioridadLead, TipoActividad } from '@/types/crm';
import { ETAPAS_CONFIG, FUENTES_LABELS } from '@/types/crm';

const abogados = ['María González', 'Carlos Ruiz', 'Ana López', 'Javier Martínez'];
const tiposServicio = ['Derecho laboral', 'Derecho mercantil', 'Derecho de familia', 'Derecho penal', 'Derecho civil', 'Derecho inmobiliario', 'Propiedad intelectual', 'Compliance', 'Derecho sanitario', 'Otro'];

export default function Pipeline() {
  const { leads, estadisticas, recordatorios, isLoading, moverLead, crearLead, fetchLeads, agregarActividad, convertirACliente } = useCRM();
  const { showToast } = useToast();
  const [showNewLead, setShowNewLead] = useState(false);
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);
  const [detailTab, setDetailTab] = useState('info');
  const [showConvertir, setShowConvertir] = useState(false);

  const [form, setForm] = useState({
    nombre: '', email: '', telefono: '', empresa: '',
    fuente: 'web' as FuenteCaptacion, valorEstimado: '',
    prioridad: 'media' as PrioridadLead, abogadoAsignado: abogados[0],
    tipoServicio: tiposServicio[0], notas: '',
  });

  const formatCurrency = (amount: number) =>
    new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 }).format(amount);

  const handleCreate = async () => {
    if (!form.nombre || !form.email) {
      showToast('Nombre y email son obligatorios', 'error');
      return;
    }
    await crearLead({
      ...form,
      valorEstimado: Number(form.valorEstimado) || 0,
      probabilidad: 20,
      etapa: 'nuevo',
      fechaUltimoContacto: new Date().toISOString().split('T')[0],
    });
    showToast('Lead creado correctamente', 'success');
    setShowNewLead(false);
    setForm({ nombre: '', email: '', telefono: '', empresa: '', fuente: 'web', valorEstimado: '', prioridad: 'media', abogadoAsignado: abogados[0], tipoServicio: tiposServicio[0], notas: '' });
  };

  const handleMoverLead = async (leadId: string, etapa: EtapaPipeline) => {
    await moverLead(leadId, etapa);
    const lead = leads.find(l => l.id === leadId);
    showToast(`${lead?.nombre || 'Lead'} movido a ${ETAPAS_CONFIG[etapa].nombre}`, 'success');
  };

  const handleClickLead = (lead: Lead) => {
    setSelectedLead(lead);
    setDetailTab('info');
    setShowConvertir(false);
  };

  const handleRecordatorioClick = (leadId: string) => {
    const lead = leads.find(l => l.id === leadId);
    if (lead) handleClickLead(lead);
  };

  const handleAddActividad = async (tipo: TipoActividad, descripcion: string, resultado?: string, proximaAccion?: string) => {
    if (!selectedLead) return;
    await agregarActividad(selectedLead.id, tipo, descripcion, resultado, proximaAccion);
    const updated = leads.find(l => l.id === selectedLead.id);
    if (updated) setSelectedLead({ ...updated });
    showToast('Actividad registrada', 'success');
  };

  const handleConvertir = async (crearExpediente: boolean) => {
    if (!selectedLead) return;
    const result = await convertirACliente(selectedLead.id, crearExpediente);
    if (result) {
      showToast(`${selectedLead.nombre} convertido a cliente${result.expedienteId ? ` · Expediente ${result.expedienteId}` : ''}`, 'success');
    }
  };

  const canConvert = selectedLead && selectedLead.etapa !== 'ganado' && selectedLead.etapa !== 'perdido';

  return (
    <AppLayout title="Pipeline Comercial" subtitle="Gestión de leads y oportunidades">
      <div className="p-6 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-theme-primary">Pipeline</h2>
            <p className="text-theme-secondary">Vista Kanban del embudo comercial</p>
          </div>
          <div className="flex items-center gap-3">
            <Button variant="secondary" onClick={() => fetchLeads()}>
              <RefreshCw className="w-4 h-4 mr-2" />
              Actualizar
            </Button>
            <Button onClick={() => setShowNewLead(true)}>
              <Plus className="w-4 h-4 mr-2" />
              Nuevo Lead
            </Button>
          </div>
        </div>

        {isLoading ? (
          <StatsSkeleton />
        ) : estadisticas && (
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            <Card className="!p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-blue-500/10 rounded-xl flex items-center justify-center">
                  <Users className="w-5 h-5 text-blue-400" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-theme-primary">{estadisticas.totalLeads}</p>
                  <p className="text-xs text-theme-muted">Total Leads</p>
                </div>
              </div>
            </Card>
            <Card className="!p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-emerald-500/10 rounded-xl flex items-center justify-center">
                  <ArrowUpRight className="w-5 h-5 text-emerald-400" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-theme-primary">{estadisticas.leadsEsteMes}</p>
                  <p className="text-xs text-theme-muted">Este Mes</p>
                </div>
              </div>
            </Card>
            <Card className="!p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-purple-500/10 rounded-xl flex items-center justify-center">
                  <Target className="w-5 h-5 text-purple-400" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-theme-primary">{estadisticas.tasaConversion}%</p>
                  <p className="text-xs text-theme-muted">Conversión</p>
                </div>
              </div>
            </Card>
            <Card className="!p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-amber-500/10 rounded-xl flex items-center justify-center">
                  <DollarSign className="w-5 h-5 text-amber-400" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-theme-primary">{formatCurrency(estadisticas.valorPipeline)}</p>
                  <p className="text-xs text-theme-muted">Valor Pipeline</p>
                </div>
              </div>
            </Card>
            <Card className="!p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-cyan-500/10 rounded-xl flex items-center justify-center">
                  <Clock className="w-5 h-5 text-cyan-400" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-theme-primary">{estadisticas.tiempoMedioConversion}d</p>
                  <p className="text-xs text-theme-muted">Tiempo Medio</p>
                </div>
              </div>
            </Card>
          </div>
        )}

        <RecordatoriosPanel recordatorios={recordatorios} onClickLead={handleRecordatorioClick} />

        <KanbanBoard
          leads={leads}
          onMoverLead={handleMoverLead}
          onClickLead={handleClickLead}
        />

        <Modal
          isOpen={showNewLead}
          onClose={() => setShowNewLead(false)}
          title="Nuevo Lead"
          size="lg"
        >
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <Input label="Nombre *" placeholder="Nombre completo" value={form.nombre} onChange={(e) => setForm({ ...form, nombre: e.target.value })} />
              <Input label="Email *" type="email" placeholder="email@ejemplo.com" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <Input label="Teléfono" placeholder="+34 600 000 000" value={form.telefono} onChange={(e) => setForm({ ...form, telefono: e.target.value })} />
              <Input label="Empresa" placeholder="Nombre de empresa" value={form.empresa} onChange={(e) => setForm({ ...form, empresa: e.target.value })} />
            </div>
            <div className="grid grid-cols-3 gap-4">
              <Select label="Fuente" value={form.fuente} onChange={(e) => setForm({ ...form, fuente: e.target.value as FuenteCaptacion })} options={Object.entries(FUENTES_LABELS).map(([k, v]) => ({ value: k, label: v }))} />
              <Select label="Prioridad" value={form.prioridad} onChange={(e) => setForm({ ...form, prioridad: e.target.value as PrioridadLead })} options={[{ value: 'alta', label: 'Alta' }, { value: 'media', label: 'Media' }, { value: 'baja', label: 'Baja' }]} />
              <Input label="Valor Estimado (€)" type="number" placeholder="0" value={form.valorEstimado} onChange={(e) => setForm({ ...form, valorEstimado: e.target.value })} />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <Select label="Abogado Asignado" value={form.abogadoAsignado} onChange={(e) => setForm({ ...form, abogadoAsignado: e.target.value })} options={abogados.map(a => ({ value: a, label: a }))} />
              <Select label="Tipo de Servicio" value={form.tipoServicio} onChange={(e) => setForm({ ...form, tipoServicio: e.target.value })} options={tiposServicio.map(t => ({ value: t, label: t }))} />
            </div>
            <Textarea label="Notas" placeholder="Notas sobre el lead..." rows={3} value={form.notas} onChange={(e) => setForm({ ...form, notas: e.target.value })} />
            <div className="flex justify-end gap-3 pt-4">
              <Button variant="secondary" onClick={() => setShowNewLead(false)}>Cancelar</Button>
              <Button onClick={handleCreate}>Crear Lead</Button>
            </div>
          </div>
        </Modal>

        <Modal
          isOpen={!!selectedLead && !showConvertir}
          onClose={() => setSelectedLead(null)}
          title={selectedLead?.nombre || 'Detalle Lead'}
          size="xl"
        >
          {selectedLead && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <Tabs
                  tabs={[
                    { id: 'info', label: 'Información' },
                    { id: 'actividades', label: 'Actividades', badge: selectedLead.actividades.length },
                  ]}
                  activeTab={detailTab}
                  onChange={setDetailTab}
                />
                {canConvert && (
                  <Button size="sm" onClick={() => setShowConvertir(true)}>
                    <UserCheck className="w-4 h-4 mr-1" />
                    Convertir a Cliente
                  </Button>
                )}
              </div>

              {detailTab === 'info' && (
                <div className="space-y-4 pt-2">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-xs text-theme-muted mb-1">Email</p>
                      <p className="text-sm text-theme-primary">{selectedLead.email}</p>
                    </div>
                    <div>
                      <p className="text-xs text-theme-muted mb-1">Teléfono</p>
                      <p className="text-sm text-theme-primary">{selectedLead.telefono}</p>
                    </div>
                    {selectedLead.empresa && (
                      <div>
                        <p className="text-xs text-theme-muted mb-1">Empresa</p>
                        <p className="text-sm text-theme-primary">{selectedLead.empresa}</p>
                      </div>
                    )}
                    <div>
                      <p className="text-xs text-theme-muted mb-1">Fuente</p>
                      <p className="text-sm text-theme-primary">{FUENTES_LABELS[selectedLead.fuente]}</p>
                    </div>
                  </div>
                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <p className="text-xs text-theme-muted mb-1">Etapa</p>
                      <Badge variant="info">{ETAPAS_CONFIG[selectedLead.etapa].nombre}</Badge>
                    </div>
                    <div>
                      <p className="text-xs text-theme-muted mb-1">Valor Estimado</p>
                      <p className="text-sm font-semibold text-emerald-400">{formatCurrency(selectedLead.valorEstimado)}</p>
                    </div>
                    <div>
                      <p className="text-xs text-theme-muted mb-1">Probabilidad</p>
                      <p className="text-sm text-theme-primary">{selectedLead.probabilidad}%</p>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-xs text-theme-muted mb-1">Abogado Asignado</p>
                      <p className="text-sm text-theme-primary">{selectedLead.abogadoAsignado}</p>
                    </div>
                    <div>
                      <p className="text-xs text-theme-muted mb-1">Tipo de Servicio</p>
                      <p className="text-sm text-theme-primary">{selectedLead.tipoServicio}</p>
                    </div>
                  </div>
                  <div>
                    <p className="text-xs text-theme-muted mb-1">Notas</p>
                    <p className="text-sm text-theme-secondary bg-theme-tertiary rounded-lg p-3">{selectedLead.notas || 'Sin notas'}</p>
                  </div>
                  <div className="grid grid-cols-3 gap-4 pt-2 border-t border-theme text-xs text-theme-muted">
                    <div>Creado: {selectedLead.fechaCreacion}</div>
                    <div>Último contacto: {selectedLead.fechaUltimoContacto}</div>
                    <div>Días en etapa: {selectedLead.diasEnEtapa}</div>
                  </div>
                </div>
              )}

              {detailTab === 'actividades' && (
                <div className="pt-2">
                  <ActividadTimeline
                    actividades={selectedLead.actividades}
                    onAddActividad={handleAddActividad}
                  />
                </div>
              )}
            </div>
          )}
        </Modal>

        <Modal
          isOpen={showConvertir && !!selectedLead}
          onClose={() => setShowConvertir(false)}
          title="Convertir Lead a Cliente"
          size="md"
        >
          {selectedLead && (
            <ConvertirClienteModal
              lead={selectedLead}
              onConvertir={handleConvertir}
              onClose={() => { setShowConvertir(false); setSelectedLead(null); }}
            />
          )}
        </Modal>
      </div>
    </AppLayout>
  );
}

import { useState, useEffect, useCallback } from 'react';
import { crmService } from '@/services/crmService';
import type { Lead, ActividadCRM, TipoActividad, EtapaPipeline, CRMEstadisticas, RecordatorioCRM, ConversionResult } from '@/types/crm';

export function useCRM() {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [estadisticas, setEstadisticas] = useState<CRMEstadisticas | null>(null);
  const [recordatorios, setRecordatorios] = useState<RecordatorioCRM[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchLeads = useCallback(async () => {
    try {
      setIsLoading(true);
      const [leadsData, statsData, recsData] = await Promise.all([
        crmService.getLeads(),
        crmService.getEstadisticas(),
        crmService.getRecordatorios(),
      ]);
      setLeads(leadsData);
      setEstadisticas(statsData);
      setRecordatorios(recsData);
      setError(null);
    } catch (e) {
      setError('Error al cargar los datos del CRM');
      console.error('[CRM] Error:', e);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchLeads();
  }, [fetchLeads]);

  const refreshStats = useCallback(async () => {
    const [stats, recs] = await Promise.all([
      crmService.getEstadisticas(),
      crmService.getRecordatorios(),
    ]);
    setEstadisticas(stats);
    setRecordatorios(recs);
  }, []);

  const moverLead = useCallback(async (leadId: string, etapa: EtapaPipeline) => {
    const prev = [...leads];
    setLeads(leads.map(l => l.id === leadId ? { ...l, etapa, diasEnEtapa: 0 } : l));
    try {
      await crmService.updateLeadEtapa(leadId, etapa);
      await refreshStats();
    } catch {
      setLeads(prev);
    }
  }, [leads, refreshStats]);

  const crearLead = useCallback(async (data: Omit<Lead, 'id' | 'actividades' | 'diasEnEtapa' | 'fechaCreacion'>) => {
    const newLead = await crmService.createLead(data);
    setLeads(prev => [...prev, newLead]);
    await refreshStats();
    return newLead;
  }, [refreshStats]);

  const eliminarLead = useCallback(async (id: string) => {
    const prev = [...leads];
    setLeads(leads.filter(l => l.id !== id));
    try {
      await crmService.deleteLead(id);
      await refreshStats();
    } catch {
      setLeads(prev);
    }
  }, [leads, refreshStats]);

  const getLeadsPorEtapa = useCallback((etapa: EtapaPipeline) => {
    return leads.filter(l => l.etapa === etapa);
  }, [leads]);

  const agregarActividad = useCallback(async (
    leadId: string, tipo: TipoActividad, descripcion: string, resultado?: string, proximaAccion?: string
  ): Promise<ActividadCRM | undefined> => {
    const actividad = await crmService.addActividad(leadId, tipo, descripcion, resultado, proximaAccion);
    if (actividad) {
      setLeads(prev => prev.map(l => l.id === leadId ? {
        ...l,
        actividades: [...l.actividades, actividad],
        fechaUltimoContacto: actividad.fecha,
      } : l));
      await refreshStats();
    }
    return actividad;
  }, [refreshStats]);

  const getActividades = useCallback(async (leadId: string): Promise<ActividadCRM[]> => {
    return crmService.getActividades(leadId);
  }, []);

  const convertirACliente = useCallback(async (leadId: string, crearExpediente: boolean): Promise<ConversionResult | undefined> => {
    const result = await crmService.convertirACliente(leadId, crearExpediente);
    if (result) {
      setLeads(prev => prev.map(l => l.id === leadId ? { ...l, etapa: 'ganado' as const, probabilidad: 100, diasEnEtapa: 0 } : l));
      await refreshStats();
    }
    return result;
  }, [refreshStats]);

  return {
    leads,
    estadisticas,
    recordatorios,
    isLoading,
    error,
    fetchLeads,
    moverLead,
    crearLead,
    eliminarLead,
    getLeadsPorEtapa,
    agregarActividad,
    getActividades,
    convertirACliente,
  };
}

export default useCRM;

import { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { 
  Settings, Bell, Mail, Calendar, Clock, AlertTriangle,
  Save, Check, X, Plus, Trash2, Loader2, AlertCircle
} from 'lucide-react';
import { AppLayout } from '@/components/layout/AppLayout';
import { configCobranzaService, type RecordatorioCobranza, type AlertaCobranza, type ConfiguracionCobranza } from '@/services';

export default function CobranzaConfig() {
  const [activeTab, setActiveTab] = useState('recordatorios');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Datos del backend
  const [configuracion, setConfiguracion] = useState<ConfiguracionCobranza | null>(null);
  const [recordatorios, setRecordatorios] = useState<RecordatorioCobranza[]>([]);
  const [alertas, setAlertas] = useState<AlertaCobranza[]>([]);
  
  // Estados para edición
  const [saved, setSaved] = useState(false);
  const [showNuevoRecordatorio, setShowNuevoRecordatorio] = useState(false);
  const [showNuevaAlerta, setShowNuevaAlerta] = useState(false);
  const [editingRecordatorio, setEditingRecordatorio] = useState<RecordatorioCobranza | null>(null);
  const [editingAlerta, setEditingAlerta] = useState<AlertaCobranza | null>(null);

  // Cargar datos del backend
  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      const [configRes, recordatoriosRes, alertasRes] = await Promise.all([
        configCobranzaService.getConfiguracion(),
        configCobranzaService.getRecordatorios(),
        configCobranzaService.getAlertas(),
      ]);
      
      setConfiguracion(configRes.data);
      setRecordatorios(recordatoriosRes.data);
      setAlertas(alertasRes.data);
    } catch (err) {
      console.error('Error cargando configuración:', err);
      setError('Error al cargar la configuración');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleSave = async () => {
    if (!configuracion) return;
    
    try {
      setSaving(true);
      await configCobranzaService.updateConfiguracion({
        diasGracia: configuracion.diasGracia,
        interesMora: configuracion.interesMora,
        moneda: configuracion.moneda,
        idioma: configuracion.idioma,
        sepaHabilitado: configuracion.sepaHabilitado,
        notificacionesAuto: configuracion.notificacionesAuto,
        emailRemitente: configuracion.emailRemitente,
        nombreRemitente: configuracion.nombreRemitente,
        sepaCreditorId: configuracion.sepaCreditorId,
        sepaIban: configuracion.sepaIban,
        sepaBic: configuracion.sepaBic,
      });
      
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } catch (err) {
      console.error('Error guardando configuración:', err);
      setError('Error al guardar la configuración');
    } finally {
      setSaving(false);
    }
  };

  const toggleRecordatorio = async (id: string) => {
    try {
      const recordatorio = recordatorios.find(r => r.id === id);
      if (!recordatorio) return;
      
      const updated = await configCobranzaService.updateRecordatorio(id, {
        activo: !recordatorio.activo,
      });
      
      setRecordatorios(recordatorios.map(r => 
        r.id === id ? updated.data : r
      ));
    } catch (err) {
      console.error('Error actualizando recordatorio:', err);
    }
  };

  const toggleAlerta = async (id: string) => {
    try {
      const alerta = alertas.find(a => a.id === id);
      if (!alerta) return;
      
      const updated = await configCobranzaService.updateAlerta(id, {
        activa: !alerta.activa,
      });
      
      setAlertas(alertas.map(a => 
        a.id === id ? updated.data : a
      ));
    } catch (err) {
      console.error('Error actualizando alerta:', err);
    }
  };

  const deleteRecordatorio = async (id: string) => {
    try {
      await configCobranzaService.deleteRecordatorio(id);
      setRecordatorios(recordatorios.filter(r => r.id !== id));
    } catch (err) {
      console.error('Error eliminando recordatorio:', err);
    }
  };

  const deleteAlerta = async (id: string) => {
    try {
      await configCobranzaService.deleteAlerta(id);
      setAlertas(alertas.filter(a => a.id !== id));
    } catch (err) {
      console.error('Error eliminando alerta:', err);
    }
  };

  const crearRecordatorio = async (data: any) => {
    try {
      const result = await configCobranzaService.createRecordatorio(data);
      setRecordatorios([...recordatorios, result.data]);
      setShowNuevoRecordatorio(false);
    } catch (err) {
      console.error('Error creando recordatorio:', err);
    }
  };

  const crearAlerta = async (data: any) => {
    try {
      const result = await configCobranzaService.createAlerta(data);
      setAlertas([...alertas, result.data]);
      setShowNuevaAlerta(false);
    } catch (err) {
      console.error('Error creando alerta:', err);
    }
  };

  if (loading) {
    return (
      <AppLayout title="Configuración Cobranza" subtitle="Cargando...">
        <main className="flex-1 overflow-y-auto p-6 lg:p-8 flex items-center justify-center">
          <div className="text-center">
            <Loader2 className="w-12 h-12 text-accent animate-spin mx-auto mb-4" />
            <p className="text-theme-secondary">Cargando configuración...</p>
          </div>
        </main>
      </AppLayout>
    );
  }

  if (error || !configuracion) {
    return (
      <AppLayout title="Configuración Cobranza" subtitle="Error">
        <main className="flex-1 overflow-y-auto p-6 lg:p-8 flex items-center justify-center">
          <div className="text-center max-w-md">
            <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
            <p className="text-theme-secondary mb-4">{error || 'Error cargando configuración'}</p>
            <button 
              onClick={loadData}
              className="px-4 py-2 bg-accent text-white rounded-xl"
            >
              Reintentar
            </button>
          </div>
        </main>
      </AppLayout>
    );
  }

  return (
    <AppLayout title="Configuración Cobranza" subtitle="Alertas, recordatorios y automatización">
      <main className="flex-1 overflow-y-auto p-6 lg:p-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-theme-primary">Configuración de Cobranza</h1>
            <p className="text-theme-secondary">Automatización y alertas de cobranza</p>
          </div>
          <button
            onClick={handleSave}
            disabled={saving}
            className={`flex items-center gap-2 px-4 py-2 font-medium rounded-xl transition-colors ${
              saved 
                ? 'bg-emerald-500 text-white' 
                : 'bg-accent text-white hover:bg-accent-hover'
            }`}
          >
            {saving ? (
              <><Loader2 className="w-4 h-4 animate-spin" /> Guardando...</>
            ) : saved ? (
              <><Check className="w-4 h-4" /> Guardado</>
            ) : (
              <><Save className="w-4 h-4" /> Guardar</>
            )}
          </button>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 border-b border-theme mb-6">
          {[
            { id: 'recordatorios', label: 'Recordatorios', icon: Clock, count: recordatorios.length },
            { id: 'alertas', label: 'Alertas', icon: Bell, count: alertas.length },
            { id: 'general', label: 'General', icon: Settings },
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-3 border-b-2 transition-colors ${
                activeTab === tab.id
                  ? 'border-accent text-accent'
                  : 'border-transparent text-theme-secondary hover:text-theme-primary'
              }`}
            >
              <tab.icon className="w-4 h-4" />
              {tab.label}
              {tab.count !== undefined && (
                <span className="ml-2 px-2 py-0.5 text-xs bg-theme-tertiary rounded-full">
                  {tab.count}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* Contenido: Recordatorios */}
        {activeTab === 'recordatorios' && (
          <div className="space-y-4">
            <div className="bg-theme-card border border-theme rounded-xl p-4">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="font-semibold text-theme-primary">Recordatorios Automáticos</h3>
                  <p className="text-sm text-theme-secondary">
                    Configura cuándo se envían recordatorios de pago a los clientes
                  </p>
                </div>
                <button
                  onClick={() => setShowNuevoRecordatorio(true)}
                  className="flex items-center gap-2 px-3 py-2 bg-accent text-white rounded-lg hover:bg-accent-hover transition-colors"
                >
                  <Plus className="w-4 h-4" />
                  Nuevo
                </button>
              </div>

              <div className="space-y-3">
                {recordatorios
                  .sort((a, b) => a.orden - b.orden)
                  .map((rem) => (
                  <div key={rem.id} className="flex items-center justify-between p-3 bg-theme-tertiary/50 rounded-xl">
                    <div className="flex items-center gap-4">
                      <button
                        onClick={() => toggleRecordatorio(rem.id)}
                        className={`w-12 h-6 rounded-full transition-colors ${
                          rem.activo ? 'bg-accent' : 'bg-theme-tertiary'
                        }`}
                      >
                        <span className={`block w-4 h-4 bg-white rounded-full transition-transform ${
                          rem.activo ? 'translate-x-7' : 'translate-x-1'
                        }`} />
                      </button>
                      <div>
                        <p className="font-medium text-theme-primary">
                          {rem.dias} días {rem.tipo === 'antes' ? 'antes' : 'después'} del vencimiento
                        </p>
                        <p className="text-sm text-theme-muted">{rem.plantilla}</p>
                      </div>
                    </div>
                    <button
                      onClick={() => deleteRecordatorio(rem.id)}
                      className="p-2 text-theme-muted hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Contenido: Alertas */}
        {activeTab === 'alertas' && (
          <div className="space-y-4">
            <div className="bg-theme-card border border-theme rounded-xl p-4">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="font-semibold text-theme-primary">Alertas del Sistema</h3>
                  <p className="text-sm text-theme-secondary">
                    Configura alertas para situaciones especiales de cobranza
                  </p>
                </div>
                <button
                  onClick={() => setShowNuevaAlerta(true)}
                  className="flex items-center gap-2 px-3 py-2 bg-accent text-white rounded-lg hover:bg-accent-hover transition-colors"
                >
                  <Plus className="w-4 h-4" />
                  Nueva
                </button>
              </div>

              <div className="space-y-3">
                {alertas.map((alerta) => (
                  <div key={alerta.id} className="flex items-center justify-between p-3 bg-theme-tertiary/50 rounded-xl">
                    <div className="flex items-center gap-4">
                      <button
                        onClick={() => toggleAlerta(alerta.id)}
                        className={`w-12 h-6 rounded-full transition-colors ${
                          alerta.activa ? 'bg-accent' : 'bg-theme-tertiary'
                        }`}
                      >
                        <span className={`block w-4 h-4 bg-white rounded-full transition-transform ${
                          alerta.activa ? 'translate-x-7' : 'translate-x-1'
                        }`} />
                      </button>
                      <div>
                        <p className="font-medium text-theme-primary">{alerta.nombre}</p>
                        <p className="text-sm text-theme-muted">{alerta.tipo} • {alerta.condicion}</p>
                      </div>
                    </div>
                    <button
                      onClick={() => deleteAlerta(alerta.id)}
                      className="p-2 text-theme-muted hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Contenido: General */}
        {activeTab === 'general' && (
          <div className="space-y-4">
            <div className="bg-theme-card border border-theme rounded-xl p-6">
              <h3 className="font-semibold text-theme-primary mb-6">Configuración General</h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-theme-primary mb-2">
                    Días de gracia
                  </label>
                  <input
                    type="number"
                    value={configuracion.diasGracia}
                    onChange={(e) => setConfiguracion({ 
                      ...configuracion, 
                      diasGracia: parseInt(e.target.value) || 0 
                    })}
                    className="w-full px-4 py-2 bg-theme-tertiary border border-theme rounded-xl text-theme-primary"
                  />
                  <p className="text-xs text-theme-muted mt-1">Días adicionales antes de considerar vencida</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-theme-primary mb-2">
                    Interés de mora (%)
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    value={configuracion.interesMora}
                    onChange={(e) => setConfiguracion({ 
                      ...configuracion, 
                      interesMora: parseFloat(e.target.value) || 0 
                    })}
                    className="w-full px-4 py-2 bg-theme-tertiary border border-theme rounded-xl text-theme-primary"
                  />
                  <p className="text-xs text-theme-muted mt-1">Porcentaje de interés por mora</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-theme-primary mb-2">Moneda</label>
                  <select
                    value={configuracion.moneda}
                    onChange={(e) => setConfiguracion({ ...configuracion, moneda: e.target.value })}
                    className="w-full px-4 py-2 bg-theme-tertiary border border-theme rounded-xl text-theme-primary"
                  >
                    <option value="EUR">EUR - Euro</option>
                    <option value="USD">USD - Dólar</option>
                    <option value="GBP">GBP - Libra</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-theme-primary mb-2">Idioma</label>
                  <select
                    value={configuracion.idioma}
                    onChange={(e) => setConfiguracion({ ...configuracion, idioma: e.target.value })}
                    className="w-full px-4 py-2 bg-theme-tertiary border border-theme rounded-xl text-theme-primary"
                  >
                    <option value="es">Español</option>
                    <option value="en">English</option>
                    <option value="ca">Català</option>
                    <option value="gl">Galego</option>
                  </select>
                </div>
              </div>

              <div className="mt-6 pt-6 border-t border-theme space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-theme-primary">Domiciliaciones SEPA</p>
                    <p className="text-sm text-theme-muted">Permitir cobros automáticos por SEPA</p>
                  </div>
                  <button
                    onClick={() => setConfiguracion({ 
                      ...configuracion, 
                      sepaHabilitado: !configuracion.sepaHabilitado 
                    })}
                    className={`w-12 h-6 rounded-full transition-colors ${
                      configuracion.sepaHabilitado ? 'bg-accent' : 'bg-theme-tertiary'
                    }`}
                  >
                    <span className={`block w-4 h-4 bg-white rounded-full transition-transform ${
                      configuracion.sepaHabilitado ? 'translate-x-7' : 'translate-x-1'
                    }`} />
                  </button>
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-theme-primary">Notificaciones automáticas</p>
                    <p className="text-sm text-theme-muted">Enviar notificaciones push y email automáticamente</p>
                  </div>
                  <button
                    onClick={() => setConfiguracion({ 
                      ...configuracion, 
                      notificacionesAuto: !configuracion.notificacionesAuto 
                    })}
                    className={`w-12 h-6 rounded-full transition-colors ${
                      configuracion.notificacionesAuto ? 'bg-accent' : 'bg-theme-tertiary'
                    }`}
                  >
                    <span className={`block w-4 h-4 bg-white rounded-full transition-transform ${
                      configuracion.notificacionesAuto ? 'translate-x-7' : 'translate-x-1'
                    }`} />
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>
    </AppLayout>
  );
}

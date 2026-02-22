// M4 - Cobranza: Configuración
// Configuración de alertas, recordatorios y automatización de cobranza

import { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Settings, Bell, Mail, Calendar, Clock, AlertTriangle,
  Save, RefreshCw, Check, X, Plus, Trash2
} from 'lucide-react';
import { AppLayout } from '@/components/layout/AppLayout';

// Datos mock
const recordatoriosMock = [
  { id: 1, dias: 3, tipo: 'antes', activo: true, plantilla: 'recordatorio_pago' },
  { id: 2, dias: 1, tipo: 'antes', activo: true, plantilla: 'recordatorio_urgente' },
  { id: 3, dias: 1, tipo: 'despues', activo: true, plantilla: 'primer_vencido' },
  { id: 4, dias: 7, tipo: 'despues', activo: true, plantilla: 'segundo_vencido' },
  { id: 5, dias: 14, tipo: 'despues', activo: true, plantilla: 'aviso_legal' },
  { id: 6, dias: 30, tipo: 'despues', activo: false, plantilla: 'final_warning' },
];

const alertasMock = [
  { id: 1, nombre: 'Factura > 10.000€', condicion: 'monto > 10000', tipo: 'email', activa: true },
  { id: 2, nombre: 'Cliente con +3 facturas vencidas', condicion: 'facturas_vencidas > 3', tipo: 'email_push', activa: true },
  { id: 3, nombre: 'Factura sin pagar a los 60 días', condicion: 'dias_vencido > 60', tipo: 'push', activa: false },
];

export default function CobranzaConfig() {
  const [activeTab, setActiveTab] = useState('recordatorios');
  const [recordatorios, setRecordatorios] = useState(recordatoriosMock);
  const [alertas, setAlertas] = useState(alertasMock);
  const [configGeneral, setConfigGeneral] = useState({
    diasGracia: 3,
    interesMora: 5,
    moneda: 'EUR',
    idioma: 'es',
    sepahabilitado: false,
    notificacionesAuto: true,
  });
  const [saved, setSaved] = useState(false);

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const toggleRecordatorio = (id: number) => {
    setRecordatorios(recordatorios.map(r => 
      r.id === id ? { ...r, activo: !r.activo } : r
    ));
  };

  const toggleAlerta = (id: number) => {
    setAlertas(alertas.map(a => 
      a.id === id ? { ...a, activa: !a.activa } : a
    ));
  };

  const deleteRecordatorio = (id: number) => {
    setRecordatorios(recordatorios.filter(r => r.id !== id));
  };

  return (
    <AppLayout title="Configuración Cobranza" subtitle="Alertas, recordatorios y automatización">
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-theme-primary">Configuración de Cobranza</h1>
          <p className="text-theme-secondary">Automatización y alertas de cobranza</p>
        </div>
        <button
          onClick={handleSave}
          className={`flex items-center gap-2 px-4 py-2 font-medium rounded-xl transition-colors ${
            saved 
              ? 'bg-emerald-500 text-white' 
              : 'bg-accent text-white hover:bg-accent-hover'
          }`}
        >
          {saved ? <Check className="w-4 h-4" /> : <Save className="w-4 h-4" />}
          {saved ? 'Guardado' : 'Guardar'}
        </button>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-theme">
        {[
          { id: 'recordatorios', label: 'Recordatorios', icon: Clock },
          { id: 'alertas', label: 'Alertas', icon: Bell },
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
          </button>
        ))}
      </div>

      {/* Contenido: Recordatorios */}
      {activeTab === 'recordatorios' && (
        <div className="space-y-4">
          <div className="bg-theme-card border border-theme rounded-xl p-4">
            <h3 className="font-semibold text-theme-primary mb-4">Recordatorios Automáticos</h3>
            <p className="text-sm text-theme-secondary mb-4">
              Configura cuándo se envían recordatorios de pago a los clientes
            </p>

            <div className="space-y-3">
              {recordatorios.map((rem) => (
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

            <button className="mt-4 flex items-center gap-2 text-accent hover:text-accent-hover">
              <Plus className="w-4 h-4" />
              Añadir recordatorio
            </button>
          </div>
        </div>
      )}

      {/* Contenido: Alertas */}
      {activeTab === 'alertas' && (
        <div className="space-y-4">
          <div className="bg-theme-card border border-theme rounded-xl p-4">
            <h3 className="font-semibold text-theme-primary mb-4">Alertas del Sistema</h3>
            <p className="text-sm text-theme-secondary mb-4">
              Configura alertas para situaciones especiales de cobranza
            </p>

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
                  <AlertTriangle className={`w-5 h-5 ${alerta.activa ? 'text-amber-400' : 'text-theme-muted'}`} />
                </div>
              ))}
            </div>

            <button className="mt-4 flex items-center gap-2 text-accent hover:text-accent-hover">
              <Plus className="w-4 h-4" />
              Añadir alerta
            </button>
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
                  value={configGeneral.diasGracia}
                  onChange={(e) => setConfigGeneral({ ...configGeneral, diasGracia: parseInt(e.target.value) })}
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
                  value={configGeneral.interesMora}
                  onChange={(e) => setConfigGeneral({ ...configGeneral, interesMora: parseFloat(e.target.value) })}
                  className="w-full px-4 py-2 bg-theme-tertiary border border-theme rounded-xl text-theme-primary"
                />
                <p className="text-xs text-theme-muted mt-1">Porcentaje de interés por mora</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-theme-primary mb-2">
                  Moneda
                </label>
                <select
                  value={configGeneral.moneda}
                  onChange={(e) => setConfigGeneral({ ...configGeneral, moneda: e.target.value })}
                  className="w-full px-4 py-2 bg-theme-tertiary border border-theme rounded-xl text-theme-primary"
                >
                  <option value="EUR">EUR - Euro</option>
                  <option value="USD">USD - Dólar</option>
                  <option value="GBP">GBP - Libra</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-theme-primary mb-2">
                  Idioma
                </label>
                <select
                  value={configGeneral.idioma}
                  onChange={(e) => setConfigGeneral({ ...configGeneral, idioma: e.target.value })}
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
                  onClick={() => setConfigGeneral({ ...configGeneral, sepahabilitado: !configGeneral.sepahabilitado })}
                  className={`w-12 h-6 rounded-full transition-colors ${
                    configGeneral.sepahabilitado ? 'bg-accent' : 'bg-theme-tertiary'
                  }`}
                >
                  <span className={`block w-4 h-4 bg-white rounded-full transition-transform ${
                    configGeneral.sepahabilitado ? 'translate-x-7' : 'translate-x-1'
                  }`} />
                </button>
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-theme-primary">Notificaciones automáticas</p>
                  <p className="text-sm text-theme-muted">Enviar notificacionespush y email automáticamente</p>
                </div>
                <button
                  onClick={() => setConfigGeneral({ ...configGeneral, notificacionesAuto: !configGeneral.notificacionesAuto })}
                  className={`w-12 h-6 rounded-full transition-colors ${
                    configGeneral.notificacionesAuto ? 'bg-accent' : 'bg-theme-tertiary'
                  }`}
                >
                  <span className={`block w-4 h-4 bg-white rounded-full transition-transform ${
                    configGeneral.notificacionesAuto ? 'translate-x-7' : 'translate-x-1'
                  }`} />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
    </AppLayout>
  );
}

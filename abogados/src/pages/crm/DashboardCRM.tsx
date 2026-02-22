import {
  TrendingUp, Users, Target, DollarSign, Clock,
  BarChart3, PieChart, ArrowUpRight, ArrowDownRight,
} from 'lucide-react';
import { useCRM } from '@/hooks/useCRM';
import type { FuenteCaptacion } from '@/types/crm';
import { FUENTES_LABELS } from '@/types/crm';
import FunnelChart from '@/components/crm/FunneChart';
import ROIPorFuente from '@/components/crm/ROIPorFuente';

export default function CRMDashboard() {
  const { estadisticas: stats, isLoading: loading } = useCRM();

  if (loading || !stats) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
      </div>
    );
  }

  const kpis = [
    {
      label: 'Leads Totales',
      value: stats.totalLeads,
      icon: Users,
      color: 'text-blue-500',
      bgColor: 'bg-blue-500/10',
      change: '+12%',
      positive: true,
    },
    {
      label: 'Leads Este Mes',
      value: stats.leadsEsteMes,
      icon: TrendingUp,
      color: 'text-emerald-500',
      bgColor: 'bg-emerald-500/10',
      change: '+8%',
      positive: true,
    },
    {
      label: 'Tasa Conversión',
      value: `${stats.tasaConversion}%`,
      icon: Target,
      color: 'text-purple-500',
      bgColor: 'bg-purple-500/10',
      change: '+5%',
      positive: true,
    },
    {
      label: 'Valor Pipeline',
      value: `${(stats.valorPipeline / 1000).toFixed(1)}k€`,
      icon: DollarSign,
      color: 'text-amber-500',
      bgColor: 'bg-amber-500/10',
      change: '+15%',
      positive: true,
    },
    {
      label: 'Tiempo Medio (días)',
      value: stats.tiempoMedioConversion,
      icon: Clock,
      color: 'text-cyan-500',
      bgColor: 'bg-cyan-500/10',
      change: '-2 días',
      positive: true,
    },
  ];

  const leadsActivos = stats.totalLeads - (stats.leadsPorEtapa.ganado || 0) - (stats.leadsPorEtapa.perdido || 0);
  const tasaActivacion = stats.totalLeads > 0 
    ? Math.round(((stats.totalLeads - (stats.leadsPorEtapa.nuevo || 0)) / stats.totalLeads) * 100) 
    : 0;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Dashboard CRM</h1>
          <p className="text-slate-500 mt-1">Métricas y análisis del pipeline comercial</p>
        </div>
        <div className="text-sm text-slate-500">
          Actualizado: {new Date().toLocaleDateString('es-ES')}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        {kpis.map((kpi) => (
          <div
            key={kpi.label}
            className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm"
          >
            <div className="flex items-center justify-between">
              <div className={`p-2 rounded-lg ${kpi.bgColor}`}>
                <kpi.icon className={`w-5 h-5 ${kpi.color}`} />
              </div>
              <div className={`flex items-center text-sm font-medium ${kpi.positive ? 'text-emerald-600' : 'text-red-600'}`}>
                {kpi.positive ? <ArrowUpRight className="w-4 h-4 mr-1" /> : <ArrowDownRight className="w-4 h-4 mr-1" />}
                {kpi.change}
              </div>
            </div>
            <div className="mt-4">
              <p className="text-2xl font-bold text-slate-900">{kpi.value}</p>
              <p className="text-sm text-slate-500 mt-1">{kpi.label}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold text-slate-900 flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-slate-500" />
              Embudo de Conversión
            </h2>
          </div>
          <FunnelChart datos={stats.leadsPorEtapa} />
        </div>

        <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-slate-900 flex items-center gap-2 mb-6">
            <PieChart className="w-5 h-5 text-slate-500" />
            Leads por Fuente
          </h2>
          <div className="space-y-3">
            {Object.entries(stats.leadsPorFuente)
              .sort(([, a], [, b]) => b - a)
              .map(([fuente, cantidad], index) => {
                const porcentaje = Math.round((cantidad / stats.totalLeads) * 100);
                const colors = [
                  'bg-blue-500',
                  'bg-emerald-500',
                  'bg-purple-500',
                  'bg-amber-500',
                  'bg-rose-500',
                  'bg-cyan-500',
                  'bg-orange-500',
                ];
                return (
                  <div key={fuente}>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm text-slate-700">{FUENTES_LABELS[fuente as FuenteCaptacion]}</span>
                      <span className="text-sm font-medium text-slate-900">{cantidad} ({porcentaje}%)</span>
                    </div>
                    <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                      <div
                        className={`h-full ${colors[index % colors.length]} rounded-full transition-all duration-500`}
                        style={{ width: `${porcentaje}%` }}
                      />
                    </div>
                  </div>
                );
              })}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-slate-900 flex items-center gap-2 mb-6">
            <DollarSign className="w-5 h-5 text-slate-500" />
            ROI por Fuente de Captación
          </h2>
          <ROIPorFuente datos={stats.leadsPorFuente} />
        </div>

        <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-slate-900 mb-6">Resumen Ejecutivo</h2>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
              <span className="text-slate-700">Leads Activos</span>
              <span className="font-semibold text-slate-900">{leadsActivos}</span>
            </div>
            <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
              <span className="text-slate-700">Casos Ganados</span>
              <span className="font-semibold text-emerald-600">{stats.leadsPorEtapa.ganado || 0}</span>
            </div>
            <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
              <span className="text-slate-700">Casos Perdidos</span>
              <span className="font-semibold text-red-600">{stats.leadsPorEtapa.perdido || 0}</span>
            </div>
            <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
              <span className="text-slate-700">Tasa de Activación</span>
              <span className="font-semibold text-slate-900">{tasaActivacion}%</span>
            </div>
            <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
              <span className="text-slate-700">Valor Promedio por Lead</span>
              <span className="font-semibold text-slate-900">
                {stats.totalLeads > 0 ? Math.round(stats.valorPipeline / leadsActivos).toLocaleString('es-ES') : 0}€
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

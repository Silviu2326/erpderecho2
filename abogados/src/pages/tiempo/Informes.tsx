// M5 - Tiempo & Tareas: Informes de Productividad
// Informes y métricas de productividad del equipo

import { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Clock, TrendingUp, Calendar, Users, BarChart3,
  Download, Filter, ChevronDown, Target, Briefcase,
  AlertCircle, CheckCircle
} from 'lucide-react';
import { reportsService, type LawyerKPIs } from '@/services/reportsService';

// Datos mock
const productivityData = [
  { lawyer: 'María González', hours: 165, target: 160, cases: 8, completed: 6, efficiency: 95 },
  { lawyer: 'Carlos Ruiz', hours: 142, target: 160, cases: 6, completed: 5, efficiency: 88 },
  { lawyer: 'Ana López', hours: 178, target: 160, cases: 10, completed: 8, efficiency: 102 },
  { lawyer: 'Javier Martínez', hours: 125, target: 160, cases: 5, completed: 3, efficiency: 78 },
];

const timeEntriesMock = [
  { id: 'T-001', caso: 'Demanda laboral - García', lawyer: 'María González', fecha: '2024-05-20', horas: 4.5, actividad: 'Investigación', facturable: true },
  { id: 'T-002', caso: 'Divorcio - Martínez', lawyer: 'Carlos Ruiz', fecha: '2024-05-20', horas: 2.0, actividad: 'Cliente', facturable: true },
  { id: 'T-003', caso: 'Contrato TechCorp', lawyer: 'Ana López', fecha: '2024-05-20', horas: 6.0, actividad: 'Escritura', facturable: true },
  { id: 'T-004', caso: 'Reclamación deuda', lawyer: 'María González', fecha: '2024-05-19', horas: 3.0, actividad: 'Documentos', facturable: true },
  { id: 'T-005', caso: 'Accidente Sánchez', lawyer: 'Javier Martínez', fecha: '2024-05-19', horas: 5.5, actividad: 'Audiencia', facturable: true },
];

const months = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio'];

export default function TiempoInformes() {
  const [selectedMonth, setSelectedMonth] = useState('Mayo');
  const [selectedLawyer, setSelectedLawyer] = useState('todos');
  const [lawyerKPIs, setLawyerKPIs] = useState<LawyerKPIs | null>(null);
  const [loading, setLoading] = useState(false);

  const totalHours = productivityData.reduce((sum, p) => sum + p.hours, 0);
  const avgEfficiency = productivityData.reduce((sum, p) => sum + p.efficiency, 0) / productivityData.length;
  const totalCases = productivityData.reduce((sum, p) => sum + p.cases, 0);
  const totalCompleted = productivityData.reduce((sum, p) => sum + p.completed, 0);

  const handleLoadKPIs = async () => {
    setLoading(true);
    try {
      const kpis = await reportsService.getLawyerKPIs('lawyer_1', {
        start: new Date('2026-01-01'),
        end: new Date('2026-12-31')
      });
      setLawyerKPIs(kpis);
    } catch (e) {
      console.error('Error loading KPIs:', e);
    } finally {
      setLoading(false);
    }
  };

  const getEfficiencyColor = (efficiency: number) => {
    if (efficiency >= 90) return 'text-emerald-400';
    if (efficiency >= 70) return 'text-amber-400';
    return 'text-red-400';
  };

  const getEfficiencyBg = (efficiency: number) => {
    if (efficiency >= 90) return 'bg-emerald-500/10';
    if (efficiency >= 70) return 'bg-amber-500/10';
    return 'bg-red-500/10';
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-theme-primary">Informes de Productividad</h1>
          <p className="text-theme-secondary">Métricas y análisis del equipo legal</p>
        </div>
        <div className="flex gap-3">
          <button className="flex items-center gap-2 px-4 py-2 bg-theme-card border border-theme text-theme-secondary rounded-xl hover:text-theme-primary transition-colors">
            <Download className="w-4 h-4" />
            Exportar
          </button>
        </div>
      </div>

      {/* Filtros */}
      <div className="flex flex-wrap gap-4 bg-theme-card border border-theme rounded-xl p-4">
        <select
          value={selectedMonth}
          onChange={(e) => setSelectedMonth(e.target.value)}
          className="px-4 py-2 bg-theme-tertiary border border-theme rounded-xl text-theme-primary focus:outline-none focus:border-accent"
        >
          {months.map(month => (
            <option key={month} value={month}>{month}</option>
          ))}
        </select>
        <select
          value={selectedLawyer}
          onChange={(e) => setSelectedLawyer(e.target.value)}
          className="px-4 py-2 bg-theme-tertiary border border-theme rounded-xl text-theme-primary focus:outline-none focus:border-accent"
        >
          <option value="todos">Todos los abogados</option>
          {productivityData.map(p => (
            <option key={p.lawyer} value={p.lawyer}>{p.lawyer}</option>
          ))}
        </select>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-theme-card border border-theme rounded-xl p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-500/20 rounded-xl flex items-center justify-center">
              <Clock className="w-5 h-5 text-blue-400" />
            </div>
            <div>
              <p className="text-2xl font-bold text-theme-primary">{totalHours}h</p>
              <p className="text-sm text-theme-secondary">Horas totales</p>
            </div>
          </div>
        </div>
        <div className="bg-theme-card border border-theme rounded-xl p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-purple-500/20 rounded-xl flex items-center justify-center">
              <TrendingUp className="w-5 h-5 text-purple-400" />
            </div>
            <div>
              <p className="text-2xl font-bold text-theme-primary">{avgEfficiency.toFixed(0)}%</p>
              <p className="text-sm text-theme-secondary">Eficiencia media</p>
            </div>
          </div>
        </div>
        <div className="bg-theme-card border border-theme rounded-xl p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-emerald-500/20 rounded-xl flex items-center justify-center">
              <Briefcase className="w-5 h-5 text-emerald-400" />
            </div>
            <div>
              <p className="text-2xl font-bold text-theme-primary">{totalCases}</p>
              <p className="text-sm text-theme-secondary">Casos activos</p>
            </div>
          </div>
        </div>
        <div className="bg-theme-card border border-theme rounded-xl p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-amber-500/20 rounded-xl flex items-center justify-center">
              <CheckCircle className="w-5 h-5 text-amber-400" />
            </div>
            <div>
              <p className="text-2xl font-bold text-theme-primary">{totalCompleted}</p>
              <p className="text-sm text-theme-secondary">Casos completados</p>
            </div>
          </div>
        </div>
      </div>

      {/* Productividad por abogado */}
      <div className="bg-theme-card border border-theme rounded-xl overflow-hidden">
        <div className="p-4 border-b border-theme">
          <h2 className="font-semibold text-theme-primary">Productividad por Abogado</h2>
        </div>
        <table className="w-full">
          <thead className="bg-theme-tertiary/50">
            <tr>
              <th className="text-left p-4 text-sm font-medium text-theme-secondary">Abogado</th>
              <th className="text-center p-4 text-sm font-medium text-theme-secondary">Horas</th>
              <th className="text-center p-4 text-sm font-medium text-theme-secondary">Objetivo</th>
              <th className="text-center p-4 text-sm font-medium text-theme-secondary">Casos</th>
              <th className="text-center p-4 text-sm font-medium text-theme-secondary">Completados</th>
              <th className="text-center p-4 text-sm font-medium text-theme-secondary">Eficiencia</th>
            </tr>
          </thead>
          <tbody>
            {productivityData.map((lawyer, index) => (
              <motion.tr
                key={lawyer.lawyer}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: index * 0.1 }}
                className="border-t border-theme hover:bg-theme-tertiary/30"
              >
                <td className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-theme-tertiary rounded-full flex items-center justify-center text-sm font-medium text-theme-primary">
                      {lawyer.lawyer.charAt(0)}
                    </div>
                    <span className="font-medium text-theme-primary">{lawyer.lawyer}</span>
                  </div>
                </td>
                <td className="p-4 text-center text-theme-primary">{lawyer.hours}h</td>
                <td className="p-4 text-center text-theme-secondary">{lawyer.target}h</td>
                <td className="p-4 text-center text-theme-primary">{lawyer.cases}</td>
                <td className="p-4 text-center text-theme-primary">{lawyer.completed}</td>
                <td className="p-4 text-center">
                  <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-sm font-medium ${getEfficiencyBg(lawyer.efficiency)} ${getEfficiencyColor(lawyer.efficiency)}`}>
                    {lawyer.efficiency}%
                  </span>
                </td>
              </motion.tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Últimas entradas de tiempo */}
      <div className="bg-theme-card border border-theme rounded-xl overflow-hidden">
        <div className="p-4 border-b border-theme">
          <h2 className="font-semibold text-theme-primary">Últimas Entradas de Tiempo</h2>
        </div>
        <table className="w-full">
          <thead className="bg-theme-tertiary/50">
            <tr>
              <th className="text-left p-4 text-sm font-medium text-theme-secondary">Caso</th>
              <th className="text-left p-4 text-sm font-medium text-theme-secondary">Abogado</th>
              <th className="text-left p-4 text-sm font-medium text-theme-secondary">Fecha</th>
              <th className="text-left p-4 text-sm font-medium text-theme-secondary">Actividad</th>
              <th className="text-center p-4 text-sm font-medium text-theme-secondary">Horas</th>
              <th className="text-center p-4 text-sm font-medium text-theme-secondary">Facturable</th>
            </tr>
          </thead>
          <tbody>
            {timeEntriesMock.map((entry) => (
              <tr key={entry.id} className="border-t border-theme hover:bg-theme-tertiary/30">
                <td className="p-4 text-theme-primary">{entry.caso}</td>
                <td className="p-4 text-theme-secondary">{entry.lawyer}</td>
                <td className="p-4 text-theme-secondary">{new Date(entry.fecha).toLocaleDateString('es-ES')}</td>
                <td className="p-4 text-theme-secondary">{entry.actividad}</td>
                <td className="p-4 text-center text-theme-primary font-medium">{entry.horas}h</td>
                <td className="p-4 text-center">
                  {entry.facturable ? (
                    <CheckCircle className="w-5 h-5 text-emerald-400 mx-auto" />
                  ) : (
                    <AlertCircle className="w-5 h-5 text-theme-muted mx-auto" />
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* KPIs Detallados */}
      <div className="bg-theme-card border border-theme rounded-xl p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="font-semibold text-theme-primary">KPIs Detallados</h2>
          <button
            onClick={handleLoadKPIs}
            disabled={loading}
            className="px-4 py-2 bg-accent text-white font-medium rounded-xl hover:bg-accent-hover transition-colors disabled:opacity-50"
          >
            {loading ? 'Cargando...' : 'Cargar KPIs'}
          </button>
        </div>

        {lawyerKPIs ? (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="p-4 bg-theme-tertiary/50 rounded-xl text-center">
              <p className="text-sm text-theme-muted">Facturación Total</p>
              <p className="text-2xl font-bold text-emerald-400">{lawyerKPIs.totalBilled.toLocaleString()}€</p>
            </div>
            <div className="p-4 bg-theme-tertiary/50 rounded-xl text-center">
              <p className="text-sm text-theme-muted">Cobrado</p>
              <p className="text-2xl font-bold text-blue-400">{lawyerKPIs.totalCollected.toLocaleString()}€</p>
            </div>
            <div className="p-4 bg-theme-tertiary/50 rounded-xl text-center">
              <p className="text-sm text-theme-muted">Horas Trabajadas</p>
              <p className="text-2xl font-bold text-purple-400">{lawyerKPIs.totalHoursWorked}h</p>
            </div>
            <div className="p-4 bg-theme-tertiary/50 rounded-xl text-center">
              <p className="text-sm text-theme-muted">Tasa/Hora Efectiva</p>
              <p className="text-2xl font-bold text-amber-400">{lawyerKPIs.effectiveHourlyRate.toFixed(2)}€</p>
            </div>
          </div>
        ) : (
          <p className="text-center text-theme-muted py-8">
            Click en "Cargar KPIs" para ver métricas detalladas
          </p>
        )}
      </div>
    </div>
  );
}

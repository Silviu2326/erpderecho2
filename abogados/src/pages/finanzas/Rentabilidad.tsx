// M2 - Finanzas: Rentabilidad
// Análisis de rentabilidad por caso y abogado

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  TrendingUp, TrendingDown, DollarSign, Briefcase, Users,
  BarChart3, PieChart, Download, Filter, Calendar,
  ArrowUpRight, ArrowDownRight, Target
} from 'lucide-react';
import { useLocalStorage } from '@/hooks/useLocalStorage';
import { useDebounce } from '@/hooks/useDebounce';
import { useToast } from '@/components/ui/Toast';
import { Button } from '@/components/ui/Button';
import { Input, Select } from '@/components/ui/Form';
import { Card, Badge } from '@/components/ui';
import { Breadcrumbs } from '@/components/ui/Breadcrumbs';
import { StatsSkeleton, TableSkeleton } from '@/components/ui/Skeleton';
import { AppLayout } from '@/components/layout/AppLayout';

// Datos mock
const rentabilidadPorCasoMock = [
  { id: 'EXP-2024-001', caso: 'Demanda laboral - García', abogado: 'María González', facturado: 8500, coste: 3200, margen: 62, estado: 'excellent' },
  { id: 'EXP-2024-002', caso: 'Divorcio - Martínez', abogado: 'Carlos Ruiz', facturado: 4200, coste: 2800, margen: 33, estado: 'fair' },
  { id: 'EXP-2024-003', caso: 'Contrato TechCorp', abogado: 'Ana López', facturado: 15000, coste: 4500, margen: 70, estado: 'excellent' },
  { id: 'EXP-2024-004', caso: 'Reclamación deuda', abogado: 'María González', facturado: 2500, coste: 2200, margen: 12, estado: 'poor' },
  { id: 'EXP-2024-005', caso: 'Accidente Sánchez', abogado: 'Javier Martínez', facturado: 6800, coste: 3500, margen: 49, estado: 'good' },
];

const rentabilidadPorAbogadoMock = [
  { abogado: 'María González', casos: 12, facturado: 45000, coste: 18000, margen: 60, horas: 320 },
  { abogado: 'Carlos Ruiz', casos: 8, facturado: 28000, coste: 14000, margen: 50, horas: 210 },
  { abogado: 'Ana López', casos: 15, facturado: 68000, coste: 22000, margen: 68, horas: 380 },
  { abogado: 'Javier Martínez', casos: 6, facturado: 18000, coste: 12000, margen: 33, horas: 150 },
];

const kpisMock = {
  facturacionTotal: 159000,
  costeTotal: 66000,
  margenPromedio: 53,
  casosRentables: 4,
  casosNoRentables: 1,
};

export default function FinanzasRentabilidad() {
  const [view, setView] = useState<'casos' | 'abogados'>('casos');
  const [periodo, setPeriodo] = useState('2024');

  const getMargenColor = (margen: number) => {
    if (margen >= 50) return 'text-emerald-400';
    if (margen >= 30) return 'text-amber-400';
    return 'text-red-400';
  };

  const getMargenBg = (margen: number) => {
    if (margen >= 50) return 'bg-emerald-500/10';
    if (margen >= 30) return 'bg-amber-500/10';
    return 'bg-red-500/10';
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 }).format(amount);
  };

  return (
    <AppLayout title="Rentabilidad" subtitle="Análisis de rentabilidad por caso y abogado">
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-theme-primary">Análisis de Rentabilidad</h1>
          <p className="text-theme-secondary">Métricas de rentabilidad por caso y abogado</p>
        </div>
        <div className="flex gap-3">
          <select
            value={periodo}
            onChange={(e) => setPeriodo(e.target.value)}
            className="px-4 py-2 bg-theme-card border border-theme rounded-xl text-theme-primary"
          >
            <option value="2024">2024</option>
            <option value="2023">2023</option>
            <option value="2022">2022</option>
          </select>
          <button className="flex items-center gap-2 px-4 py-2 bg-theme-card border border-theme text-theme-secondary rounded-xl hover:text-theme-primary">
            <Download className="w-4 h-4" />
            Exportar
          </button>
        </div>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        <div className="bg-theme-card border border-theme rounded-xl p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-emerald-500/20 rounded-xl flex items-center justify-center">
              <DollarSign className="w-5 h-5 text-emerald-400" />
            </div>
            <div>
              <p className="text-sm text-theme-secondary">Facturación Total</p>
              <p className="text-xl font-bold text-theme-primary">{formatCurrency(kpisMock.facturacionTotal)}</p>
            </div>
          </div>
        </div>
        <div className="bg-theme-card border border-theme rounded-xl p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-red-500/20 rounded-xl flex items-center justify-center">
              <TrendingDown className="w-5 h-5 text-red-400" />
            </div>
            <div>
              <p className="text-sm text-theme-secondary">Coste Total</p>
              <p className="text-xl font-bold text-theme-primary">{formatCurrency(kpisMock.costeTotal)}</p>
            </div>
          </div>
        </div>
        <div className="bg-theme-card border border-theme rounded-xl p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-500/20 rounded-xl flex items-center justify-center">
              <BarChart3 className="w-5 h-5 text-blue-400" />
            </div>
            <div>
              <p className="text-sm text-theme-secondary">Margen Promedio</p>
              <p className="text-xl font-bold text-theme-primary">{kpisMock.margenPromedio}%</p>
            </div>
          </div>
        </div>
        <div className="bg-theme-card border border-theme rounded-xl p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-emerald-500/20 rounded-xl flex items-center justify-center">
              <ArrowUpRight className="w-5 h-5 text-emerald-400" />
            </div>
            <div>
              <p className="text-sm text-theme-secondary">Casos Rentables</p>
              <p className="text-xl font-bold text-emerald-400">{kpisMock.casosRentables}</p>
            </div>
          </div>
        </div>
        <div className="bg-theme-card border border-theme rounded-xl p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-red-500/20 rounded-xl flex items-center justify-center">
              <ArrowDownRight className="w-5 h-5 text-red-400" />
            </div>
            <div>
              <p className="text-sm text-theme-secondary">Casos No Rentables</p>
              <p className="text-xl font-bold text-red-400">{kpisMock.casosNoRentables}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Toggle view */}
      <div className="flex gap-2 border-b border-theme">
        <button
          onClick={() => setView('casos')}
          className={`px-4 py-3 border-b-2 transition-colors ${
            view === 'casos' ? 'border-accent text-accent' : 'border-transparent text-theme-secondary'
          }`}
        >
          <Briefcase className="w-4 h-4 inline mr-2" />
          Por Caso
        </button>
        <button
          onClick={() => setView('abogados')}
          className={`px-4 py-3 border-b-2 transition-colors ${
            view === 'abogados' ? 'border-accent text-accent' : 'border-transparent text-theme-secondary'
          }`}
        >
          <Users className="w-4 h-4 inline mr-2" />
          Por Abogado
        </button>
      </div>

      {/* Tabla: Por Caso */}
      {view === 'casos' && (
        <div className="bg-theme-card border border-theme rounded-xl overflow-hidden">
          <table className="w-full">
            <thead className="bg-theme-tertiary/50">
              <tr>
                <th className="text-left p-4 text-sm font-medium text-theme-secondary">Caso</th>
                <th className="text-left p-4 text-sm font-medium text-theme-secondary">Abogado</th>
                <th className="text-right p-4 text-sm font-medium text-theme-secondary">Facturado</th>
                <th className="text-right p-4 text-sm font-medium text-theme-secondary">Coste</th>
                <th className="text-right p-4 text-sm font-medium text-theme-secondary">Margen</th>
                <th className="text-center p-4 text-sm font-medium text-theme-secondary">Estado</th>
              </tr>
            </thead>
            <tbody>
              {rentabilidadPorCasoMock.map((item) => (
                <motion.tr
                  key={item.id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="border-t border-theme hover:bg-theme-tertiary/30"
                >
                  <td className="p-4">
                    <div>
                      <p className="font-medium text-theme-primary">{item.caso}</p>
                      <p className="text-xs text-theme-muted">{item.id}</p>
                    </div>
                  </td>
                  <td className="p-4 text-theme-secondary">{item.abogado}</td>
                  <td className="p-4 text-right text-theme-primary font-medium">{formatCurrency(item.facturado)}</td>
                  <td className="p-4 text-right text-theme-secondary">{formatCurrency(item.coste)}</td>
                  <td className="p-4 text-right">
                    <span className={`font-medium ${getMargenColor(item.margen)}`}>{item.margen}%</span>
                  </td>
                  <td className="p-4 text-center">
                    <span className={`px-2 py-1 text-xs rounded-full ${getMargenBg(item.margen)} ${getMargenColor(item.margen)}`}>
                      {item.margen >= 50 ? 'Rentable' : item.margen >= 30 ? 'Regular' : 'No rentable'}
                    </span>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Tabla: Por Abogado */}
      {view === 'abogados' && (
        <div className="bg-theme-card border border-theme rounded-xl overflow-hidden">
          <table className="w-full">
            <thead className="bg-theme-tertiary/50">
              <tr>
                <th className="text-left p-4 text-sm font-medium text-theme-secondary">Abogado</th>
                <th className="text-center p-4 text-sm font-medium text-theme-secondary">Casos</th>
                <th className="text-right p-4 text-sm font-medium text-theme-secondary">Facturado</th>
                <th className="text-right p-4 text-sm font-medium text-theme-secondary">Coste</th>
                <th className="text-right p-4 text-sm font-medium text-theme-secondary">Horas</th>
                <th className="text-right p-4 text-sm font-medium text-theme-secondary">Margen</th>
              </tr>
            </thead>
            <tbody>
              {rentabilidadPorAbogadoMock.map((item) => (
                <motion.tr
                  key={item.abogado}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="border-t border-theme hover:bg-theme-tertiary/30"
                >
                  <td className="p-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-theme-tertiary rounded-full flex items-center justify-center text-sm font-medium text-theme-primary">
                        {item.abogado.charAt(0)}
                      </div>
                      <span className="font-medium text-theme-primary">{item.abogado}</span>
                    </div>
                  </td>
                  <td className="p-4 text-center text-theme-primary">{item.casos}</td>
                  <td className="p-4 text-right text-theme-primary font-medium">{formatCurrency(item.facturado)}</td>
                  <td className="p-4 text-right text-theme-secondary">{formatCurrency(item.coste)}</td>
                  <td className="p-4 text-right text-theme-secondary">{item.horas}h</td>
                  <td className="p-4 text-right">
                    <span className={`font-medium ${getMargenColor(item.margen)}`}>{item.margen}%</span>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
    </AppLayout>
  );
}

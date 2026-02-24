// M2 - Finanzas: Rentabilidad
// Análisis de rentabilidad por caso y abogado

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  TrendingUp, TrendingDown, DollarSign, Briefcase, Users,
  BarChart3, PieChart, Download, Filter, Calendar,
  ArrowUpRight, ArrowDownRight, Target, Loader2
} from 'lucide-react';
import { useToast } from '@/components/ui/Toast';
import { AppLayout } from '@/components/layout/AppLayout';
import { rentabilidadService, RentabilidadCaso, RentabilidadAbogado, RentabilidadKPIs } from '@/services/rentabilidadService';

export default function FinanzasRentabilidad() {
  const [view, setView] = useState<'casos' | 'abogados'>('casos');
  const [periodo, setPeriodo] = useState('2024');
  const [loading, setLoading] = useState(true);
  const [exportando, setExportando] = useState(false);
  
  // Datos de la API
  const [kpis, setKpis] = useState<RentabilidadKPIs | null>(null);
  const [rentabilidadPorCaso, setRentabilidadPorCaso] = useState<RentabilidadCaso[]>([]);
  const [rentabilidadPorAbogado, setRentabilidadPorAbogado] = useState<RentabilidadAbogado[]>([]);
  
  const { showToast } = useToast();

  // Cargar datos al cambiar el período
  useEffect(() => {
    cargarDatos();
  }, [periodo]);

  const cargarDatos = async () => {
    setLoading(true);
    try {
      const [kpisRes, casosRes, abogadosRes] = await Promise.all([
        rentabilidadService.getKPIs({ periodo }),
        rentabilidadService.getRentabilidadPorCaso({ periodo, limit: 100 }),
        rentabilidadService.getRentabilidadPorAbogado({ periodo }),
      ]);

      if (kpisRes.success) {
        setKpis(kpisRes.data);
      }
      
      if (casosRes.success) {
        setRentabilidadPorCaso(casosRes.data);
      }
      
      if (abogadosRes.success) {
        setRentabilidadPorAbogado(abogadosRes.data);
      }
    } catch (error) {
      console.error('Error cargando datos de rentabilidad:', error);
      showToast({
        type: 'error',
        title: 'Error',
        message: 'No se pudieron cargar los datos de rentabilidad',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleExportar = async (formato: 'pdf' | 'excel') => {
    setExportando(true);
    try {
      const response = await rentabilidadService.exportarReporte(view, formato, { periodo });
      if (response.success) {
        // Descargar el archivo
        window.open(response.url, '_blank');
        showToast({
          type: 'success',
          title: 'Éxito',
          message: `Reporte exportado en formato ${formato.toUpperCase()}`,
        });
      }
    } catch (error) {
      console.error('Error exportando reporte:', error);
      showToast({
        type: 'error',
        title: 'Error',
        message: 'No se pudo exportar el reporte',
      });
    } finally {
      setExportando(false);
    }
  };

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

  const getEstadoTexto = (estado: string) => {
    switch (estado) {
      case 'excellent': return 'Muy rentable';
      case 'good': return 'Rentable';
      case 'fair': return 'Regular';
      case 'poor': return 'No rentable';
      default: return estado;
    }
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
            disabled={loading}
          >
            <option value="2024">2024</option>
            <option value="2023">2023</option>
            <option value="2022">2022</option>
            <option value="2021">2021</option>
          </select>
          <div className="relative">
            <button 
              onClick={() => handleExportar('pdf')}
              disabled={exportando || loading}
              className="flex items-center gap-2 px-4 py-2 bg-theme-card border border-theme text-theme-secondary rounded-xl hover:text-theme-primary disabled:opacity-50"
            >
              {exportando ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Download className="w-4 h-4" />
              )}
              Exportar PDF
            </button>
          </div>
          <div className="relative">
            <button 
              onClick={() => handleExportar('excel')}
              disabled={exportando || loading}
              className="flex items-center gap-2 px-4 py-2 bg-accent text-white rounded-xl hover:bg-accent/90 disabled:opacity-50"
            >
              {exportando ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Download className="w-4 h-4" />
              )}
              Exportar Excel
            </button>
          </div>
        </div>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        {loading ? (
          // Skeleton loading
          Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="bg-theme-card border border-theme rounded-xl p-4 animate-pulse">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-theme-tertiary rounded-xl"></div>
                <div className="flex-1">
                  <div className="h-4 bg-theme-tertiary rounded w-24 mb-2"></div>
                  <div className="h-6 bg-theme-tertiary rounded w-20"></div>
                </div>
              </div>
            </div>
          ))
        ) : kpis ? (
          <>
            <div className="bg-theme-card border border-theme rounded-xl p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-emerald-500/20 rounded-xl flex items-center justify-center">
                  <DollarSign className="w-5 h-5 text-emerald-400" />
                </div>
                <div>
                  <p className="text-sm text-theme-secondary">Facturación Total</p>
                  <p className="text-xl font-bold text-theme-primary">{formatCurrency(kpis.facturacionTotal)}</p>
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
                  <p className="text-xl font-bold text-theme-primary">{formatCurrency(kpis.costeTotal)}</p>
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
                  <p className="text-xl font-bold text-theme-primary">{kpis.margenPromedio}%</p>
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
                  <p className="text-xl font-bold text-emerald-400">{kpis.casosRentables}</p>
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
                  <p className="text-xl font-bold text-red-400">{kpis.casosNoRentables}</p>
                </div>
              </div>
            </div>
          </>
        ) : null}
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
              {loading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <tr key={i} className="border-t border-theme">
                    <td className="p-4" colSpan={6}>
                      <div className="h-12 bg-theme-tertiary/30 rounded animate-pulse"></div>
                    </td>
                  </tr>
                ))
              ) : rentabilidadPorCaso.length === 0 ? (
                <tr>
                  <td className="p-8 text-center text-theme-secondary" colSpan={6}>
                    No hay datos de rentabilidad para este período
                  </td>
                </tr>
              ) : (
                rentabilidadPorCaso.map((item) => (
                  <motion.tr
                    key={item.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="border-t border-theme hover:bg-theme-tertiary/30"
                  >
                    <td className="p-4">
                      <div>
                        <p className="font-medium text-theme-primary">{item.caso}</p>
                        <p className="text-xs text-theme-muted">{item.numeroExpediente}</p>
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
                        {getEstadoTexto(item.estado)}
                      </span>
                    </td>
                  </motion.tr>
                ))
              )}
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
              {loading ? (
                Array.from({ length: 4 }).map((_, i) => (
                  <tr key={i} className="border-t border-theme">
                    <td className="p-4" colSpan={6}>
                      <div className="h-12 bg-theme-tertiary/30 rounded animate-pulse"></div>
                    </td>
                  </tr>
                ))
              ) : rentabilidadPorAbogado.length === 0 ? (
                <tr>
                  <td className="p-8 text-center text-theme-secondary" colSpan={6}>
                    No hay datos de rentabilidad para este período
                  </td>
                </tr>
              ) : (
                rentabilidadPorAbogado.map((item) => (
                  <motion.tr
                    key={item.abogadoId}
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
                ))
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
    </AppLayout>
  );
}

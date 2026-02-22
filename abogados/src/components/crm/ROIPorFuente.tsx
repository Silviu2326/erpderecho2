import type { FuenteCaptacion } from '@/types/crm';
import { FUENTES_LABELS } from '@/types/crm';
import { ArrowUpRight, ArrowDownRight } from 'lucide-react';

interface ROIPorFuenteProps {
  datos: Record<FuenteCaptacion, number>;
}

const COSTES_CAPTACION: Record<FuenteCaptacion, number> = {
  web: 150,
  referido: 50,
  publicidad: 300,
  colegio: 100,
  redes_sociales: 200,
  evento: 400,
  otro: 100,
};

const VALOR_PROMEDIO_GANADO = 12500;

export default function ROIPorFuente({ datos }: ROIPorFuenteProps) {
  const fuentes = Object.entries(datos) as [FuenteCaptacion, number][];

  const analisis = fuentes.map(([fuente, leads]) => {
    const coste = COSTES_CAPTACION[fuente] * leads;
    const ganadosEstimados = Math.round(leads * 0.3);
    const ingresosEstimados = ganadosEstimados * VALOR_PROMEDIO_GANADO;
    const roi = coste > 0 ? Math.round(((ingresosEstimados - coste) / coste) * 100) : 0;
    
    return {
      fuente,
      leads,
      coste,
      ganadosEstimados,
      ingresosEstimados,
      roi,
    };
  }).sort((a, b) => b.roi - a.roi);

  const totalCoste = analisis.reduce((s, a) => s + a.coste, 0);
  const totalIngresos = analisis.reduce((s, a) => s + a.ingresosEstimados, 0);
  const roiGlobal = totalCoste > 0 ? Math.round(((totalIngresos - totalCoste) / totalCoste) * 100) : 0;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
        <div>
          <p className="text-sm text-slate-600">Inversión total</p>
          <p className="text-lg font-bold text-slate-900">{totalCoste.toLocaleString('es-ES')}€</p>
        </div>
        <div className="text-right">
          <p className="text-sm text-slate-600">Ingresos estimados</p>
          <p className="text-lg font-bold text-emerald-600">{totalIngresos.toLocaleString('es-ES')}€</p>
        </div>
        <div className="text-right">
          <p className="text-sm text-slate-600">ROI Global</p>
          <p className={`text-lg font-bold ${roiGlobal >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>
            {roiGlobal}%
          </p>
        </div>
      </div>

      <div className="space-y-3 mt-4">
        {analisis.map((item) => (
          <div key={item.fuente} className="p-3 border border-slate-200 rounded-lg">
            <div className="flex items-center justify-between mb-2">
              <span className="font-medium text-slate-900">{FUENTES_LABELS[item.fuente]}</span>
              <div className={`flex items-center gap-1 text-sm font-semibold ${item.roi >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>
                {item.roi >= 0 ? <ArrowUpRight className="w-4 h-4" /> : <ArrowDownRight className="w-4 h-4" />}
                {item.roi}%
              </div>
            </div>
            <div className="grid grid-cols-4 gap-2 text-xs">
              <div>
                <p className="text-slate-500">Leads</p>
                <p className="font-medium text-slate-900">{item.leads}</p>
              </div>
              <div>
                <p className="text-slate-500">Inversión</p>
                <p className="font-medium text-slate-900">{item.coste}€</p>
              </div>
              <div>
                <p className="text-slate-500">Ganados*</p>
                <p className="font-medium text-slate-900">{item.ganadosEstimados}</p>
              </div>
              <div>
                <p className="text-slate-500">Ingresos</p>
                <p className="font-medium text-emerald-600">{item.ingresosEstimados.toLocaleString('es-ES')}€</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      <p className="text-xs text-slate-400 mt-3">
        * Los casos ganados son estimados (30% tasa de conversión aplicada). 
        Valor promedio por caso: {VALOR_PROMEDIO_GANADO.toLocaleString('es-ES')}€
      </p>
    </div>
  );
}

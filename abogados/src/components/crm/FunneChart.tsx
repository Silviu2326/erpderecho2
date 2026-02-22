import type { EtapaPipeline } from '@/types/crm';
import { ETAPAS_CONFIG } from '@/types/crm';

interface FunnelChartProps {
  datos: Record<EtapaPipeline, number>;
}

const ETAPAS_ORDEN = ['nuevo', 'contactado', 'reunion', 'propuesta', 'negociacion', 'ganado', 'perdido'] as EtapaPipeline[];

export default function FunnelChart({ datos }: FunnelChartProps) {
  const etapasActivas = ETAPAS_ORDEN.slice(0, 5);
  const maxValor = Math.max(...etapasActivas.map(e => datos[e] || 0), 1);

  const etapasConDatos = etapasActivas.map((etapa, index) => {
    const valor = datos[etapa] || 0;
    const anchoPorcentaje = (valor / maxValor) * 100;
    const etapaAnterior = index > 0 ? datos[etapasActivas[index - 1]] || 0 : valor;
    const conversion = etapaAnterior > 0 ? Math.round((valor / etapaAnterior) * 100) : 100;
    
    return {
      etapa,
      valor,
      anchoPorcentaje: Math.max(anchoPorcentaje, 20),
      config: ETAPAS_CONFIG[etapa],
      conversion,
    };
  });

  const ganados = datos.ganado || 0;
  const totalIngresados = etapasActivas.reduce((s, e) => s + (datos[e] || 0), 0);
  const tasaFinal = totalIngresados > 0 ? Math.round((ganados / totalIngresados) * 100) : 0;

  return (
    <div className="space-y-2">
      {etapasConDatos.map((item, index) => (
        <div key={item.etapa} className="relative">
          <div className="flex items-center justify-between mb-1">
            <span className={`text-sm font-medium ${item.config.color}`}>
              {item.config.nombre}
            </span>
            <div className="flex items-center gap-2">
              <span className="text-sm font-bold text-slate-900">{item.valor}</span>
              {index > 0 && (
                <span className="text-xs text-slate-500">
                  ({item.conversion}% ↓)
                </span>
              )}
            </div>
          </div>
          <div 
            className="h-10 rounded-lg flex items-center px-3 transition-all duration-500"
            style={{ 
              width: `${item.anchoPorcentaje}%`,
              backgroundColor: item.config.bgColor.replace('/10', '/20'),
              borderLeft: `4px solid ${item.config.color.replace('text-', '').replace('-400', '-500')}`
            }}
          >
            <div className="w-full bg-slate-200/50 rounded h-1.5 overflow-hidden">
              <div 
                className="h-full rounded-full transition-all duration-500"
                style={{ 
                  width: `${(item.valor / maxValor) * 100}%`,
                  backgroundColor: item.config.color.replace('text-', '').replace('-400', '-500')
                }}
              />
            </div>
          </div>
        </div>
      ))}

      <div className="mt-6 pt-4 border-t border-slate-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-emerald-500" />
              <span className="text-sm text-slate-600">Ganados: {ganados}</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-red-500" />
              <span className="text-sm text-slate-600">Perdidos: {datos.perdido || 0}</span>
            </div>
          </div>
          <div className="text-right">
            <p className="text-xs text-slate-500">Tasa de conversión global</p>
            <p className="text-xl font-bold text-emerald-600">{tasaFinal}%</p>
          </div>
        </div>
      </div>
    </div>
  );
}

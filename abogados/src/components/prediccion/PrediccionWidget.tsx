import { useMemo } from 'react';
import { motion } from 'framer-motion';
import { Brain, TrendingUp, TrendingDown, Clock, DollarSign, Target, Info } from 'lucide-react';
import { Link } from 'react-router-dom';
import type { Prediccion, AnalisisPredictivo, TipoPrediccion } from '@/types/prediccion';

interface PrediccionWidgetProps {
  predicciones?: Prediccion[];
  analisis?: AnalisisPredictivo;
  maxItems?: number;
}

const tipoIconos: Record<TipoPrediccion, React.ReactNode> = {
  resultado_proceso: <Target className="w-4 h-4" />,
  duracion_estimada: <Clock className="w-4 h-4" />,
  probabilidad_exito: <TrendingUp className="w-4 h-4" />,
  riesgo_procesal: <TrendingDown className="w-4 h-4" />,
  coste_estimado: <DollarSign className="w-4 h-4" />,
  sentencia_probable: <Target className="w-4 h-4" />,
};

const tipoLabels: Record<TipoPrediccion, string> = {
  resultado_proceso: 'Resultado',
  duracion_estimada: 'Duración',
  probabilidad_exito: 'Éxito',
  riesgo_procesal: 'Riesgo',
  coste_estimado: 'Coste',
  sentencia_probable: 'Sentencia',
};

const getConfianzaColor = (nivel: string) => {
  switch (nivel) {
    case 'alta':
      return 'bg-emerald-500/20 text-emerald-500';
    case 'media':
      return 'bg-amber-500/20 text-amber-500';
    case 'baja':
      return 'bg-rose-500/20 text-rose-500';
    default:
      return 'bg-theme-tertiary/30 text-theme-secondary';
  }
};

const getProbabilidadColor = (prob: number) => {
  if (prob >= 0.7) return 'text-emerald-500';
  if (prob >= 0.4) return 'text-amber-500';
  return 'text-rose-500';
};

const getRiesgoColor = (categoria: string) => {
  switch (categoria) {
    case 'bajo':
      return 'bg-emerald-500/20 text-emerald-500';
    case 'medio':
      return 'bg-amber-500/20 text-amber-500';
    case 'alto':
      return 'bg-orange-500/20 text-orange-500';
    case 'critico':
      return 'bg-rose-500/20 text-rose-500';
    default:
      return 'bg-theme-tertiary/30 text-theme-secondary';
  }
};

export function PrediccionWidget({ predicciones = [], analisis, maxItems = 5 }: PrediccionWidgetProps) {
  const prediccionesOrdenadas = useMemo(() => {
    return [...predicciones].sort((a, b) => 
      new Date(b.fechaPrediccion).getTime() - new Date(a.fechaPrediccion).getTime()
    ).slice(0, maxItems);
  }, [predicciones, maxItems]);

  const prediccionExito = useMemo(() => {
    return predicciones.find(p => p.tipo === 'probabilidad_exito');
  }, [predicciones]);

  if (predicciones.length === 0 && !analisis) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-theme-card border border-theme rounded-2xl p-6"
      >
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2.5 bg-violet-500/20 rounded-xl">
            <Brain className="w-6 h-6 text-violet-500" />
          </div>
          <div>
            <h3 className="font-semibold text-theme-primary">Análisis Predictivo</h3>
            <p className="text-sm text-theme-secondary">
              Sin predicciones disponibles
            </p>
          </div>
        </div>
        <div className="text-center py-6 text-theme-tertiary">
          <Info className="w-8 h-8 mx-auto mb-2 opacity-50" />
          <p className="text-sm">No hay predicciones generadas aún</p>
          <Link
            to="/predicciones"
            className="inline-block mt-3 px-4 py-2 text-sm text-accent hover:bg-accent/10 rounded-lg transition-colors"
          >
            Generar predicción
          </Link>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-theme-card border border-theme rounded-2xl p-6"
    >
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-violet-500/20 rounded-xl">
            <Brain className="w-6 h-6 text-violet-500" />
          </div>
          <div>
            <h3 className="font-semibold text-theme-primary">Análisis Predictivo</h3>
            <p className="text-sm text-theme-secondary">
              {predicciones.length} predicción{predicciones.length !== 1 ? 'es' : ''} disponible{predicciones.length !== 1 ? 's' : ''}
            </p>
          </div>
        </div>
        <Link
          to="/predicciones"
          className="px-3 py-1.5 text-sm text-accent hover:bg-accent/10 rounded-lg transition-colors"
        >
          Ver todas
        </Link>
      </div>

      {analisis && (
        <div className="mb-4 p-4 bg-theme-tertiary/30 rounded-xl">
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm text-theme-secondary">Puntuación de Riesgo</span>
            <span className={`px-2 py-0.5 text-xs font-medium rounded-full ${getRiesgoColor(analisis.categoriaRiesgo)}`}>
              {analisis.categoriaRiesgo.toUpperCase()}
            </span>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex-1 h-2 bg-theme rounded-full overflow-hidden">
              <div 
                className={`h-full rounded-full ${analisis.puntuacionRiesgo >= 70 ? 'bg-rose-500' : analisis.puntuacionRiesgo >= 40 ? 'bg-amber-500' : 'bg-emerald-500'}`}
                style={{ width: `${analisis.puntuacionRiesgo}%` }}
              />
            </div>
            <span className="text-lg font-semibold text-theme-primary">{analisis.puntuacionRiesgo}</span>
          </div>
        </div>
      )}

      {prediccionExito && (
        <div className="mb-4 p-3 bg-violet-500/10 border border-violet-500/30 rounded-xl">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-violet-500" />
              <span className="text-sm text-theme-secondary">Probabilidad de éxito</span>
            </div>
            <span className={`text-2xl font-bold ${getProbabilidadColor(prediccionExito.probabilidad)}`}>
              {Math.round(prediccionExito.probabilidad * 100)}%
            </span>
          </div>
          <div className="flex items-center gap-2 mt-2">
            <span className="text-xs text-theme-tertiary">Confianza:</span>
            <span className={`px-2 py-0.5 text-xs font-medium rounded-full ${getConfianzaColor(prediccionExito.nivelConfianza)}`}>
              {prediccionExito.nivelConfianza}
            </span>
          </div>
        </div>
      )}

      <div className="space-y-3">
        {prediccionesOrdenadas.map((prediccion) => (
          <Link
            key={prediccion.id}
            to={`/predicciones/${prediccion.id}`}
            className="flex items-start gap-3 p-3 bg-theme-tertiary/30 hover:bg-theme-tertiary/50 rounded-xl transition-colors group"
          >
            <div className="p-1.5 rounded-lg bg-violet-500/20 text-violet-500">
              {tipoIconos[prediccion.tipo]}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between gap-2">
                <p className="text-sm text-theme-primary font-medium truncate group-hover:text-accent transition-colors">
                  {tipoLabels[prediccion.tipo]}
                </p>
                <span className={`text-sm font-semibold ${getProbabilidadColor(prediccion.probabilidad)}`}>
                  {prediccion.tipo === 'coste_estimado' || prediccion.tipo === 'duracion_estimada' 
                    ? typeof prediccion.valorPredicho === 'number' 
                      ? prediccion.tipo === 'coste_estimado' 
                        ? `${prediccion.valorPredicho.toLocaleString()}€`
                        : `${prediccion.valorPredicho} días`
                      : prediccion.valorPredicho
                    : `${Math.round(prediccion.probabilidad * 100)}%`
                  }
                </span>
              </div>
              {prediccion.factoresInfluyentes.length > 0 && (
                <p className="text-xs text-theme-secondary truncate mt-1">
                  {prediccion.factoresInfluyentes.slice(0, 2).map(f => f.nombre).join(', ')}
                </p>
              )}
              <div className="flex items-center gap-2 mt-1">
                <span className="text-xs text-accent">{prediccion.expedienteId}</span>
                <span className="text-xs text-theme-tertiary">
                  {new Date(prediccion.fechaPrediccion).toLocaleDateString()}
                </span>
                <span className={`px-1.5 py-0.5 text-xs rounded ${getConfianzaColor(prediccion.nivelConfianza)}`}>
                  {prediccion.nivelConfianza}
                </span>
              </div>
            </div>
          </Link>
        ))}
      </div>

      {predicciones.length > 0 && (
        <div className="mt-4 pt-4 border-t border-theme">
          <div className="flex items-center justify-between text-sm">
            <span className="text-theme-tertiary">Modelo utilizado</span>
            <span className="text-theme-secondary">{predicciones[0]?.modeloUtilizado || 'N/A'}</span>
          </div>
        </div>
      )}
    </motion.div>
  );
}

export default PrediccionWidget;

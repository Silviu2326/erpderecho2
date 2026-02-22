import { useMemo } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Scale, ExternalLink, FileText, Calendar, TrendingUp, TrendingDown, Minus } from 'lucide-react';
import type { EstadoResolucion, MateriaAnalisis } from '@/types/prediccion';

interface CasoSimilar {
  id: string;
  expedienteId: string;
  numeroExpediente: string;
  titulo: string;
  materia: MateriaAnalisis;
  similitud: number;
  resultado: EstadoResolucion;
  fechaResolucion: Date;
  tribunal?: string;
  cuantia?: number;
  factoresCoincidencia: string[];
}

interface CasosSimilaresProps {
  casos: CasoSimilar[];
  casoActualId?: string;
  maxItems?: number;
  isLoading?: boolean;
}

const getResultadoColor = (resultado: EstadoResolucion) => {
  switch (resultado) {
    case 'favorable':
      return 'bg-emerald-500/20 text-emerald-500 border-emerald-500/30';
    case 'desfavorable':
      return 'bg-rose-500/20 text-rose-500 border-rose-500/30';
    case 'parcial':
      return 'bg-amber-500/20 text-amber-500 border-amber-500/30';
    case 'indeterminado':
      return 'bg-slate-500/20 text-slate-400 border-slate-500/30';
    default:
      return 'bg-slate-500/20 text-slate-400';
  }
};

const getResultadoTexto = (resultado: EstadoResolucion) => {
  switch (resultado) {
    case 'favorable':
      return 'Favorable';
    case 'desfavorable':
      return 'Desfavorable';
    case 'parcial':
      return 'Parcial';
    case 'indeterminado':
      return 'Indeterminado';
    default:
      return resultado;
  }
};

const getResultadoIcon = (resultado: EstadoResolucion) => {
  switch (resultado) {
    case 'favorable':
      return <TrendingUp className="w-3.5 h-3.5" />;
    case 'desfavorable':
      return <TrendingDown className="w-3.5 h-3.5" />;
    case 'parcial':
      return <Minus className="w-3.5 h-3.5" />;
    default:
      return <Minus className="w-3.5 h-3.5" />;
  }
};

const getSimilitudColor = (similitud: number) => {
  if (similitud >= 0.85) return 'text-emerald-500';
  if (similitud >= 0.7) return 'text-amber-500';
  return 'text-rose-500';
};

const getSimilitudLabel = (similitud: number) => {
  if (similitud >= 0.85) return 'Muy similar';
  if (similitud >= 0.7) return 'Similar';
  return 'Poco similar';
};

const materiaLabels: Record<MateriaAnalisis, string> = {
  civil: 'Civil',
  penal: 'Penal',
  laboral: 'Laboral',
  administrativo: 'Administrativo',
  mercantil: 'Mercantil',
};

export function CasosSimilares({
  casos,
  casoActualId,
  maxItems = 5,
  isLoading = false
}: CasosSimilaresProps) {
  const casosOrdenados = useMemo(() => {
    return [...casos]
      .filter(c => c.id !== casoActualId)
      .sort((a, b) => b.similitud - a.similitud)
      .slice(0, maxItems);
  }, [casos, casoActualId, maxItems]);

  const estadisticas = useMemo(() => {
    const favorables = casos.filter(c => c.resultado === 'favorable').length;
    const total = casos.length;
    return {
      favorables,
      porcentaje: total > 0 ? Math.round((favorables / total) * 100) : 0,
      total
    };
  }, [casos]);

  if (isLoading) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-theme-card border border-theme rounded-2xl p-6"
      >
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2.5 bg-violet-500/20 rounded-xl animate-pulse">
            <Scale className="w-6 h-6 text-violet-500" />
          </div>
          <div>
            <h3 className="font-semibold text-theme-primary">Casos Similares</h3>
            <p className="text-sm text-theme-secondary">Cargando...</p>
          </div>
        </div>
        <div className="space-y-3">
          {[1, 2, 3].map(i => (
            <div key={i} className="p-4 bg-theme-tertiary/30 rounded-xl animate-pulse">
              <div className="h-4 bg-theme-tertiary rounded w-3/4 mb-2" />
              <div className="h-3 bg-theme-tertiary rounded w-1/2" />
            </div>
          ))}
        </div>
      </motion.div>
    );
  }

  if (casos.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-theme-card border border-theme rounded-2xl p-6"
      >
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2.5 bg-violet-500/20 rounded-xl">
            <Scale className="w-6 h-6 text-violet-500" />
          </div>
          <div>
            <h3 className="font-semibold text-theme-primary">Casos Similares</h3>
            <p className="text-sm text-theme-secondary">Sin resultados</p>
          </div>
        </div>
        <div className="text-center py-6 text-theme-tertiary">
          <FileText className="w-8 h-8 mx-auto mb-2 opacity-50" />
          <p className="text-sm">No se encontraron casos similares</p>
          <p className="text-xs mt-1">Intenta ajustar los filtros de búsqueda</p>
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
            <Scale className="w-6 h-6 text-violet-500" />
          </div>
          <div>
            <h3 className="font-semibold text-theme-primary">Casos Similares</h3>
            <p className="text-sm text-theme-secondary">
              {casos.length} caso{casos.length !== 1 ? 's' : ''} encontrado{casos.length !== 1 ? 's' : ''}
            </p>
          </div>
        </div>
        {estadisticas.total > 0 && (
          <div className="flex items-center gap-2 px-3 py-1.5 bg-emerald-500/10 border border-emerald-500/30 rounded-lg">
            <TrendingUp className="w-4 h-4 text-emerald-500" />
            <span className="text-sm font-medium text-emerald-500">
              {estadisticas.porcentaje}% favorables
            </span>
          </div>
        )}
      </div>

      <div className="space-y-3">
        {casosOrdenados.map((caso, index) => (
          <motion.div
            key={caso.id}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.05 }}
          >
            <Link
              to={`/expedientes/${caso.id}`}
              className="block p-4 bg-theme-tertiary/30 hover:bg-theme-tertiary/50 rounded-xl transition-all group"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h4 className="text-sm font-medium text-theme-primary truncate group-hover:text-accent transition-colors">
                      {caso.titulo}
                    </h4>
                    <ExternalLink className="w-3.5 h-3.5 text-theme-tertiary opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0" />
                  </div>
                  <div className="flex items-center gap-2 text-xs text-theme-secondary mb-2">
                    <span className="font-mono">{caso.numeroExpediente}</span>
                    <span>•</span>
                    <span>{materiaLabels[caso.materia]}</span>
                    {caso.tribunal && (
                      <>
                        <span>•</span>
                        <span className="truncate">{caso.tribunal}</span>
                      </>
                    )}
                  </div>
                  {caso.factoresCoincidencia.length > 0 && (
                    <div className="flex flex-wrap gap-1 mb-2">
                      {caso.factoresCoincidencia.slice(0, 3).map((factor, i) => (
                        <span
                          key={i}
                          className="px-2 py-0.5 text-xs bg-violet-500/10 text-violet-500 rounded-full"
                        >
                          {factor}
                        </span>
                      ))}
                    </div>
                  )}
                  <div className="flex items-center gap-3">
                    <div className="flex items-center gap-1.5">
                      <Calendar className="w-3.5 h-3.5 text-theme-tertiary" />
                      <span className="text-xs text-theme-tertiary">
                        {new Date(caso.fechaResolucion).toLocaleDateString('es-ES', {
                          day: '2-digit',
                          month: 'short',
                          year: 'numeric'
                        })}
                      </span>
                    </div>
                    {caso.cuantia && (
                      <span className="text-xs text-theme-tertiary">
                        {caso.cuantia.toLocaleString('es-ES')}€
                      </span>
                    )}
                  </div>
                </div>
                <div className="flex flex-col items-end gap-2 flex-shrink-0">
                  <div className="flex items-center gap-1.5">
                    <span className={`text-lg font-bold ${getSimilitudColor(caso.similitud)}`}>
                      {Math.round(caso.similitud * 100)}%
                    </span>
                  </div>
                  <span className="text-xs text-theme-tertiary">
                    {getSimilitudLabel(caso.similitud)}
                  </span>
                  <div className={`flex items-center gap-1 px-2 py-0.5 text-xs font-medium rounded-full border ${getResultadoColor(caso.resultado)}`}>
                    {getResultadoIcon(caso.resultado)}
                    {getResultadoTexto(caso.resultado)}
                  </div>
                </div>
              </div>
            </Link>
          </motion.div>
        ))}
      </div>

      {casos.length > maxItems && (
        <div className="mt-4 pt-4 border-t border-theme">
          <Link
            to={`/predicciones/casos-similares?expediente=${casoActualId}`}
            className="flex items-center justify-center gap-2 text-sm text-accent hover:bg-accent/10 py-2 rounded-lg transition-colors"
          >
            Ver todos los {casos.length} casos similares
            <ExternalLink className="w-4 h-4" />
          </Link>
        </div>
      )}
    </motion.div>
  );
}

export default CasosSimilares;

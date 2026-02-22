import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Scale,
  FileText,
  Gavel,
  BookOpen,
  Clock,
  TrendingUp,
  Filter,
  ExternalLink,
  AlertCircle,
  CheckCircle2,
  XCircle,
  RefreshCw,
} from 'lucide-react';
import { AppLayout } from '@/components/layout/AppLayout';
import { useLegislacion } from '@/hooks/useLegislacion';
import type { LegislacionBase, TipoDocumento, Vigencia } from '@/types/legislacion';

type FiltroTipo = 'todos' | 'ley' | 'rd' | 'sentencia' | 'reglamento';
type FiltroVigencia = 'todos' | 'vigente' | 'derogado' | 'modificado';

interface NovedadCardProps {
  documento: LegislacionBase;
  index: number;
}

function getTipoIcon(tipo: TipoDocumento) {
  switch (tipo) {
    case 'ley':
      return FileText;
    case 'rd':
      return Scale;
    case 'sentencia':
      return Gavel;
    case 'codigo':
      return BookOpen;
    default:
      return FileText;
  }
}

function getTipoLabel(tipo: TipoDocumento): string {
  switch (tipo) {
    case 'ley':
      return 'Ley';
    case 'rd':
      return 'Real Decreto';
    case 'sentencia':
      return 'Sentencia';
    case 'reglamento':
      return 'Reglamento';
    case 'codigo':
      return 'Código';
    case 'dm':
      return 'Disposición Mutua';
    case 'ou':
      return 'Orden Universal';
    case 'resolucion':
      return 'Resolución';
    case 'instruccion':
      return 'Instrucción';
    case 'circular':
      return 'Circular';
    default:
      return 'Documento';
  }
}

function getVigenciaBadge(vigencia: Vigencia) {
  switch (vigencia) {
    case 'vigente':
      return (
        <span className="flex items-center gap-1 text-xs text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full">
          <CheckCircle2 className="w-3 h-3" /> Vigente
        </span>
      );
    case 'derogado':
      return (
        <span className="flex items-center gap-1 text-xs text-red-400 bg-red-500/10 px-2 py-0.5 rounded-full">
          <XCircle className="w-3 h-3" /> Derogado
        </span>
      );
    case 'modificado':
      return (
        <span className="flex items-center gap-1 text-xs text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded-full">
          <RefreshCw className="w-3 h-3" /> Modificado
        </span>
      );
    default:
      return null;
  }
}

function NovedadCard({ documento, index }: NovedadCardProps) {
  const Icon = getTipoIcon(documento.tipo);
  const esReciente = useMemo(() => {
    const fechaPublicacion = new Date(documento.fechaPublicacion);
    const ahora = new Date();
    const diffDays = Math.floor((ahora.getTime() - fechaPublicacion.getTime()) / (1000 * 60 * 60 * 24));
    return diffDays <= 7;
  }, [documento.fechaPublicacion]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05, duration: 0.3 }}
      className="bg-theme-secondary border border-theme rounded-xl p-4 hover:border-amber-500/30 transition-all group"
    >
      <div className="flex items-start gap-3">
        <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
          esReciente ? 'bg-amber-500/20' : 'bg-theme-tertiary'
        }`}>
          <Icon className={`w-5 h-5 ${esReciente ? 'text-amber-400' : 'text-theme-tertiary'}`} />
        </div>
        
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-medium text-accent uppercase tracking-wide">
              {getTipoLabel(documento.tipo)}
            </span>
            {getVigenciaBadge(documento.vigencia)}
            {esReciente && (
              <span className="text-xs bg-amber-500/20 text-amber-400 px-2 py-0.5 rounded-full animate-pulse">
                Nuevo
              </span>
            )}
          </div>
          
          <h3 className="text-sm font-semibold text-theme-primary group-hover:text-accent transition-colors line-clamp-2 mb-1">
            {documento.titulo}
          </h3>
          
          {documento.numeroLegislacion && (
            <p className="text-xs text-theme-tertiary mb-2">
              {documento.numeroLegislacion}
            </p>
          )}
          
          {documento.resumen && (
            <p className="text-xs text-theme-secondary line-clamp-2 mb-3">
              {documento.resumen}
            </p>
          )}
          
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-xs text-theme-tertiary">
              <Clock className="w-3 h-3" />
              <span>
                {new Date(documento.fechaPublicacion).toLocaleDateString('es-ES', {
                  day: 'numeric',
                  month: 'short',
                  year: 'numeric'
                })}
              </span>
              <span className="text-theme-tertiary">•</span>
              <span className="capitalize">{documento.organismoEmisor}</span>
            </div>
            
            <div className="flex items-center gap-1">
              {documento.urlHtml && (
                <a
                  href={documento.urlHtml}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-1.5 text-theme-tertiary hover:text-accent hover:bg-accent/10 rounded transition-colors"
                  title="Ver texto completo"
                >
                  <ExternalLink className="w-4 h-4" />
                </a>
              )}
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

function StatCard({ label, value, icon: Icon, color }: {
  label: string;
  value: number;
  icon: React.ElementType;
  color: string;
}) {
  return (
    <div className="bg-theme-secondary border border-theme rounded-xl p-4">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs text-theme-tertiary mb-1">{label}</p>
          <p className="text-2xl font-bold text-theme-primary">{value}</p>
        </div>
        <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${color}`}>
          <Icon className="w-6 h-6" />
        </div>
      </div>
    </div>
  );
}

export default function NovedadesLegislativas() {
  const {
    resultados,
    cargando,
    error,
    filtros,
    buscarAvanzado,
    estadisticas,
    estadoSync,
    sincronizando,
    sincronizar,
  } = useLegislacion();

  const [filtroTipo, setFiltroTipo] = useState<FiltroTipo>('todos');
  const [filtroVigencia, setFiltroVigencia] = useState<FiltroVigencia>('todos');

  const documentosFiltrados = useMemo(() => {
    let filtered = [...resultados];
    
    if (filtroTipo !== 'todos') {
      const tipoMap: Record<FiltroTipo, TipoDocumento[]> = {
        todos: [],
        ley: ['ley'],
        rd: ['rd'],
        sentencia: ['sentencia'],
        reglamento: ['reglamento', 'dm', 'ou', 'resolucion', 'instruccion', 'circular'],
      };
      filtered = filtered.filter(doc => tipoMap[filtroTipo]?.includes(doc.tipo));
    }
    
    if (filtroVigencia !== 'todos') {
      filtered = filtered.filter(doc => doc.vigencia === filtroVigencia);
    }
    
    return filtered.sort((a, b) => 
      new Date(b.fechaPublicacion).getTime() - new Date(a.fechaPublicacion).getTime()
    );
  }, [resultados, filtroTipo, filtroVigencia]);

  const stats = useMemo(() => {
    const vigentes = resultados.filter(d => d.vigencia === 'vigente').length;
    const derogados = resultados.filter(d => d.vigencia === 'derogado').length;
    const modificados = resultados.filter(d => d.vigencia === 'modificado').length;
    const ultimos7dias = resultados.filter(d => {
      const diff = (Date.now() - new Date(d.fechaPublicacion).getTime()) / (1000 * 60 * 60 * 24);
      return diff <= 7;
    }).length;
    
    return { vigentes, derogados, modificados, ultimos7dias };
  }, [resultados]);

  const tiposCount = useMemo(() => {
    const ley = resultados.filter(d => d.tipo === 'ley').length;
    const rd = resultados.filter(d => d.tipo === 'rd').length;
    const sentencia = resultados.filter(d => d.tipo === 'sentencia').length;
    const reglamento = resultados.filter(d => ['reglamento', 'dm', 'ou', 'resolucion', 'instruccion', 'circular'].includes(d.tipo)).length;
    return { ley, rd, sentencia, reglamento };
  }, [resultados]);

  if (error) {
    return (
      <AppLayout title="Novedades Legislativas">
        <div className="flex flex-col items-center justify-center min-h-[60vh] p-8">
          <AlertCircle className="w-16 h-16 text-red-400 mb-4" />
          <h2 className="text-xl font-bold text-theme-primary mb-2">Error al cargar</h2>
          <p className="text-theme-secondary mb-4">{error}</p>
          <button
            onClick={() => buscarAvanzado({ ...filtros, pagina: 1 })}
            className="px-4 py-2 bg-accent text-slate-950 rounded-lg hover:bg-accent/90 transition-colors"
          >
            Reintentar
          </button>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout title="Novedades Legislativas">
      <div className="min-h-screen bg-theme-primary">
        <div className="px-6 py-6 border-b border-theme">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-accent/10 rounded-xl flex items-center justify-center">
                <TrendingUp className="w-6 h-6 text-accent" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-theme-primary">Novedades Legislativas</h1>
                <p className="text-theme-secondary">
                  Últimas actualizaciones en legislación oficial
                  {estadoSync?.boe.ultimaActualizacion && (
                    <span className="ml-2 text-xs">
                      • Actualizado: {estadoSync.boe.ultimaActualizacion.toLocaleTimeString()}
                    </span>
                  )}
                </p>
              </div>
            </div>
            
            <button
              onClick={sincronizar}
              disabled={sincronizando}
              className="flex items-center gap-2 px-4 py-2 bg-theme-secondary border border-theme rounded-lg text-theme-secondary hover:text-amber-400 hover:border-amber-500/50 transition-colors disabled:opacity-50"
            >
              <RefreshCw className={`w-4 h-4 ${sincronizando ? 'animate-spin' : ''}`} />
              {sincronizando ? 'Sincronizando...' : 'Actualizar'}
            </button>
          </div>
        </div>

        <div className="px-6 py-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <StatCard
              label="Vigentes"
              value={stats.vigentes}
              icon={CheckCircle2}
              color="bg-emerald-500/20 text-emerald-400"
            />
            <StatCard
              label="Modificados"
              value={stats.modificados}
              icon={RefreshCw}
              color="bg-amber-500/20 text-amber-400"
            />
            <StatCard
              label="Derogados"
              value={stats.derogados}
              icon={XCircle}
              color="bg-red-500/20 text-red-400"
            />
            <StatCard
              label="Esta semana"
              value={stats.ultimos7dias}
              icon={Clock}
              color="bg-blue-500/20 text-blue-400"
            />
          </div>

          <div className="flex flex-col lg:flex-row gap-6">
            <div className="lg:col-span-1 space-y-4">
              <div className="bg-theme-secondary border border-theme rounded-xl p-4">
                <div className="flex items-center gap-2 mb-4">
                  <Filter className="w-4 h-4 text-tertiary" />
                  <h3 className="font-theme-semibold text-theme-primary">Filtrar por tipo</h3>
                </div>
                <div className="space-y-1">
                  <FilterButton
                    active={filtroTipo === 'todos'}
                    onClick={() => setFiltroTipo('todos')}
                    label="Todos"
                    count={resultados.length}
                  />
                  <FilterButton
                    active={filtroTipo === 'ley'}
                    onClick={() => setFiltroTipo('ley')}
                    label="Leyes"
                    count={tiposCount.ley}
                  />
                  <FilterButton
                    active={filtroTipo === 'rd'}
                    onClick={() => setFiltroTipo('rd')}
                    label="Reales Decretos"
                    count={tiposCount.rd}
                  />
                  <FilterButton
                    active={filtroTipo === 'sentencia'}
                    onClick={() => setFiltroTipo('sentencia')}
                    label="Sentencias"
                    count={tiposCount.sentencia}
                  />
                  <FilterButton
                    active={filtroTipo === 'reglamento'}
                    onClick={() => setFiltroTipo('reglamento')}
                    label="Reglamentos"
                    count={tiposCount.reglamento}
                  />
                </div>
              </div>

              <div className="bg-theme-secondary border border-theme rounded-xl p-4">
                <div className="flex items-center gap-2 mb-4">
                  <CheckCircle2 className="w-4 h-4 text-theme-tertiary" />
                  <h3 className="font-semibold text-theme-primary">Estado de vigencia</h3>
                </div>
                <div className="space-y-1">
                  <FilterButton
                    active={filtroVigencia === 'todos'}
                    onClick={() => setFiltroVigencia('todos')}
                    label="Todos"
                    count={resultados.length}
                  />
                  <FilterButton
                    active={filtroVigencia === 'vigente'}
                    onClick={() => setFiltroVigencia('vigente')}
                    label="Vigentes"
                    count={stats.vigentes}
                    color="emerald"
                  />
                  <FilterButton
                    active={filtroVigencia === 'modificado'}
                    onClick={() => setFiltroVigencia('modificado')}
                    label="Modificados"
                    count={stats.modificados}
                    color="amber"
                  />
                  <FilterButton
                    active={filtroVigencia === 'derogado'}
                    onClick={() => setFiltroVigencia('derogado')}
                    label="Derogados"
                    count={stats.derogados}
                    color="red"
                  />
                </div>
              </div>
            </div>

            <div className="lg:col-span-3">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-theme-primary">
                  {documentosFiltrados.length} {documentosFiltrados.length === 1 ? 'documento' : 'documentos'}
                </h2>
              </div>

              {cargando ? (
                <div className="flex items-center justify-center py-20">
                  <RefreshCw className="w-8 h-8 text-amber-400 animate-spin" />
                </div>
              ) : documentosFiltrados.length === 0 ? (
                <div className="p-12 text-center bg-theme-secondary border border-theme rounded-xl">
                  <FileText className="w-12 h-12 mx-auto mb-4 text-theme-tertiary" />
                  <h3 className="text-lg font-medium text-theme-primary mb-2">
                    No se encontraron resultados
                  </h3>
                  <p className="text-theme-secondary mb-4">
                    Prueba con otros filtros de búsqueda
                  </p>
                  <button
                    onClick={() => {
                      setFiltroTipo('todos');
                      setFiltroVigencia('todos');
                    }}
                    className="px-4 py-2 bg-theme-tertiary text-theme-primary rounded-lg hover:bg-theme-hover transition-colors"
                  >
                    Limpiar filtros
                  </button>
                </div>
              ) : (
                <div className="grid gap-4">
                  <AnimatePresence mode="popLayout">
                    {documentosFiltrados.slice(0, 50).map((doc, index) => (
                      <NovedadCard key={doc.id} documento={doc} index={index} />
                    ))}
                  </AnimatePresence>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}

interface FilterButtonProps {
  active: boolean;
  onClick: () => void;
  label: string;
  count: number;
  color?: 'emerald' | 'amber' | 'red';
}

function FilterButton({ active, onClick, label, count, color }: FilterButtonProps) {
  const colorClasses = {
    emerald: 'text-emerald-400',
    amber: 'text-amber-400',
    red: 'text-red-400',
  };

  return (
    <button
      onClick={onClick}
      className={`w-full flex items-center justify-between p-2.5 rounded-lg transition-colors ${
        active
          ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
          : 'text-theme-secondary hover:bg-theme-tertiary/50 hover:text-theme-primary'
      }`}
    >
      <span className="text-sm font-medium">{label}</span>
      <span className={`text-xs px-2 py-0.5 rounded-full ${
        active 
          ? 'bg-amber-500/30' 
          : 'bg-theme-tertiary/50'
      } ${color ? colorClasses[color] : ''}`}>
        {count}
      </span>
    </button>
  );
}

/**
 * Página de Legislación Oficial
 * 
 * Integra contenido de:
 * - BOE (Boletín Oficial del Estado)
 * - CENDOJ (Centro de Documentación Judicial)
 * - Constitución y Códigos
 * 
 * NOTA: Actualmente usa datos MOCK.
 * Para activar integración real, configurar variables de entorno:
 * - VITE_BOE_API_KEY
 * - VITE_CENDOJ_API_KEY
 */

import { useState } from 'react';
import { AnimatePresence } from 'framer-motion';
import {
  Scale,
  BookOpen,
  FileText,
  Gavel,
  Building2,
  RefreshCw,
  AlertCircle,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Grid3X3,
  List,
  ExternalLink,
  Search,
} from 'lucide-react';
import { AppLayout } from '@/components/layout/AppLayout';
import { useLegislacion } from '@/hooks/useLegislacion';
import { LegislacionCard } from '@/components/legislacion/LegislacionCard';
import { BusquedaLegislacion } from '@/components/legislacion/BusquedaLegislacion';
// LegislacionBase type is used implicitly through the hook
// No direct type imports needed - all types come through hook interfaces

// ============================================
// COMPONENTE PRINCIPAL
// ============================================

export default function Legislacion() {
  const {
    resultados,
    totalResultados,
    pagina,
    totalPaginas,
    cargando,
    error,
    facets,
    filtros,
    buscarAvanzado,
    limpiarFiltros,
    siguientePagina,
    anteriorPagina,
    codigos,
    constitucion,
    estadisticas,
    estadoSync,
    sincronizando,
    sincronizar,
  } = useLegislacion();

  const [vistaActiva, setVistaActiva] = useState<'todos' | 'boe' | 'cendoj' | 'codigos'>('todos');
  const [vistaResultados, setVistaResultados] = useState<'grid' | 'lista'>('grid');

  // ============================================
  // RENDER
  // ============================================

  return (
    <AppLayout title="Legislación Oficial">
      <div className="min-h-screen bg-theme-primary">
        {/* Header */}
        <div className="px-6 py-6 border-b border-theme">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-accent/10 rounded-xl flex items-center justify-center">
                <Scale className="w-6 h-6 text-accent" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-theme-primary">Legislación Oficial</h1>
                <p className="text-theme-secondary">
                  BOE, CENDOJ, Constitución y Códigos
                  {estadoSync && (
                    <span className="ml-2 text-xs">
                      • Última sincronización: {estadoSync.boe.ultimaActualizacion?.toLocaleTimeString()}
                    </span>
                  )}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              {/* Estado de sincronización */}
              {estadoSync && (
                <div className="flex items-center gap-2 px-3 py-1.5 bg-theme-secondary rounded-lg border border-theme">
                  {sincronizando ? (
                    <>
                      <RefreshCw className="w-4 h-4 text-amber-400 animate-spin" />
                      <span className="text-sm text-theme-secondary">Sincronizando...</span>
                    </>
                  ) : estadoSync.boe.estado === 'success' ? (
                    <>
                      <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                      <span className="text-sm text-emerald-400">
                        {estadoSync.boe.documentosNuevos > 0 
                          ? `${estadoSync.boe.documentosNuevos} nuevos` 
                          : 'Actualizado'}
                      </span>
                    </>
                  ) : (
                    <>
                      <AlertCircle className="w-4 h-4 text-amber-400" />
                      <span className="text-sm text-amber-400">Revisar sincronización</span>
                    </>
                  )}
                  <button
                    onClick={sincronizar}
                    disabled={sincronizando}
                    className="p-1.5 text-theme-secondary hover:text-amber-400 hover:bg-amber-500/10 rounded transition-colors disabled:opacity-50"
                    title="Sincronizar ahora"
                  >
                    <RefreshCw className={`w-4 h-4 ${sincronizando ? 'animate-spin' : ''}`} />
                  </button>
                </div>
              )}

              {/* Stats rápidos */}
              {estadisticas && (
                <div className="hidden md:flex items-center gap-4">
                  <div className="text-right">
                    <p className="text-2xl font-bold text-theme-primary">{estadisticas.totalDocumentos}</p>
                    <p className="text-xs text-theme-secondary">documentos</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="px-6 py-6">
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            {/* Sidebar - Navegación por categorías */}
            <div className="lg:col-span-1 space-y-6">
              {/* Búsqueda rápida */}
              <BusquedaLegislacion
                onBuscar={buscarAvanzado}
                filtros={filtros}
                cargando={cargando}
              />

              {/* Navegación por fuentes */}
              <div className="bg-theme-secondary border border-theme rounded-xl p-4">
                <h3 className="font-semibold text-theme-primary mb-3">Fuentes</h3>
                <nav className="space-y-1">
                  <NavButton
                    active={vistaActiva === 'todos'}
                    onClick={() => setVistaActiva('todos')}
                    icon={Scale}
                    label="Todo"
                    count={estadisticas?.totalDocumentos}
                  />
                  <NavButton
                    active={vistaActiva === 'boe'}
                    onClick={() => setVistaActiva('boe')}
                    icon={FileText}
                    label="BOE"
                    count={estadisticas?.porTipo['ley']}
                  />
                  <NavButton
                    active={vistaActiva === 'cendoj'}
                    onClick={() => setVistaActiva('cendoj')}
                    icon={Gavel}
                    label="Jurisprudencia"
                    count={estadisticas?.porTipo['sentencia']}
                  />
                  <NavButton
                    active={vistaActiva === 'codigos'}
                    onClick={() => setVistaActiva('codigos')}
                    icon={BookOpen}
                    label="Códigos"
                    count={codigos.length}
                  />
                </nav>
              </div>

              {/* Constitución destacada */}
              {constitucion && (
                <div className="bg-gradient-to-br from-purple-500/10 to-blue-500/10 border border-purple-500/30 rounded-xl p-4">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-10 h-10 bg-purple-500/20 rounded-lg flex items-center justify-center">
                      <Building2 className="w-5 h-5 text-purple-400" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-theme-primary">Constitución Española</h3>
                      <p className="text-xs text-theme-secondary">1978</p>
                    </div>
                  </div>
                  <p className="text-sm text-theme-secondary mb-3">
                    Norma suprema del ordenamiento jurídico español
                  </p>
                  <a
                    href={constitucion.urlHtml}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-purple-400 hover:text-purple-300 flex items-center gap-1"
                  >
                    Ver texto completo
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
              )}

              {/* Facets/Filtros dinámicos */}
              {facets && (
                <div className="bg-theme-secondary border border-theme rounded-xl p-4">
                  <h3 className="font-semibold text-theme-primary mb-3">Filtrar resultados</h3>
                  
                  {facets.materias.length > 0 && (
                    <div className="mb-4">
                      <h4 className="text-sm text-theme-secondary mb-2">Materia</h4>
                      <div className="space-y-1">
                        {facets.materias.slice(0, 5).map((materia: { valor: string; count: number }) => (
                          <button
                            key={materia.valor}
                            onClick={() => buscarAvanzado({
                              ...filtros,
                              materia: [materia.valor as any],
                              pagina: 1,
                            })}
                            className="w-full flex items-center justify-between p-2 rounded hover:bg-theme-tertiary/50 text-sm"
                          >
                            <span className="text-theme-secondary capitalize">
                              {materia.valor.replace(/_/g, ' ')}
                            </span>
                            <span className="text-xs text-theme-tertiary bg-theme-tertiary/50 px-2 py-0.5 rounded-full">
                              {materia.count}
                            </span>
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {facets.anios.length > 0 && (
                    <div>
                      <h4 className="text-sm text-theme-secondary mb-2">Año</h4>
                      <div className="space-y-1">
                        {facets.anios.slice(0, 5).map((anio: { valor: string; count: number }) => (
                          <button
                            key={anio.valor}
                            onClick={() => buscarAvanzado({
                              ...filtros,
                              fechaDesde: new Date(`${anio.valor}-01-01`),
                              fechaHasta: new Date(`${anio.valor}-12-31`),
                              pagina: 1,
                            })}
                            className="w-full flex items-center justify-between p-2 rounded hover:bg-theme-tertiary/50 text-sm"
                          >
                            <span className="text-theme-secondary">{anio.valor}</span>
                            <span className="text-xs text-theme-tertiary bg-theme-tertiary/50 px-2 py-0.5 rounded-full">
                              {anio.count}
                            </span>
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Contenido principal */}
            <div className="lg:col-span-3">
              {/* Header de resultados */}
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h2 className="text-lg font-semibold text-theme-primary">
                    {vistaActiva === 'codigos' ? 'Códigos' : 
                     vistaActiva === 'boe' ? 'Boletín Oficial del Estado' :
                     vistaActiva === 'cendoj' ? 'Jurisprudencia' : 'Resultados'}
                  </h2>
                  <p className="text-sm text-theme-secondary">
                    {cargando ? 'Cargando...' : `${totalResultados} documentos encontrados`}
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  {/* Toggle vista */}
                  <div className="flex items-center bg-theme-secondary border border-theme rounded-lg p-1">
                    <button
                      onClick={() => setVistaResultados('grid')}
                      className={`p-1.5 rounded transition-colors ${
                        vistaResultados === 'grid' 
                          ? 'bg-accent text-slate-950' 
                          : 'text-theme-secondary hover:text-theme-primary'
                      }`}
                    >
                      <Grid3X3 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => setVistaResultados('lista')}
                      className={`p-1.5 rounded transition-colors ${
                        vistaResultados === 'lista' 
                          ? 'bg-accent text-slate-950' 
                          : 'text-theme-secondary hover:text-theme-primary'
                      }`}
                    >
                      <List className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>

              {/* Resultados */}
              {cargando ? (
                <div className="flex items-center justify-center py-20">
                  <RefreshCw className="w-8 h-8 text-amber-400 animate-spin" />
                </div>
              ) : error ? (
                <div className="p-8 text-center">
                  <AlertCircle className="w-12 h-12 mx-auto mb-4 text-red-400" />
                  <p className="text-theme-secondary">{error}</p>
                  <button
                    onClick={() => limpiarFiltros()}
                    className="mt-4 px-4 py-2 bg-accent text-slate-950 rounded-lg"
                  >
                    Reintentar
                  </button>
                </div>
              ) : resultados.length === 0 ? (
                <div className="p-12 text-center bg-theme-secondary border border-theme rounded-xl">
                  <Search className="w-12 h-12 mx-auto mb-4 text-theme-tertiary" />
                  <h3 className="text-lg font-medium text-theme-primary mb-2">
                    No se encontraron resultados
                  </h3>
                  <p className="text-theme-secondary mb-4">
                    Intenta ajustar tus filtros o términos de búsqueda
                  </p>
                  <button
                    onClick={limpiarFiltros}
                    className="px-4 py-2 bg-theme-tertiary text-theme-primary rounded-lg hover:bg-theme-hover transition-colors"
                  >
                    Limpiar filtros
                  </button>
                </div>
              ) : (
                <>
                  {/* Grid de resultados */}
                  <div className={`grid gap-4 ${
                    vistaResultados === 'grid' 
                      ? 'grid-cols-1 md:grid-cols-2' 
                      : 'grid-cols-1'
                  }`}>
                    <AnimatePresence mode="popLayout">
                      {resultados.map((doc) => (
                        <LegislacionCard
                          key={doc.id}
                          documento={doc}
                          compact={vistaResultados === 'lista'}
                        />
                      ))}
                    </AnimatePresence>
                  </div>

                  {/* Paginación */}
                  {totalPaginas > 1 && (
                    <div className="flex items-center justify-between mt-6">
                      <button
                        onClick={anteriorPagina}
                        disabled={pagina === 1}
                        className="flex items-center gap-2 px-4 py-2 bg-theme-secondary border border-theme rounded-lg text-theme-secondary hover:text-theme-primary hover:border-amber-500/50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                      >
                        <ChevronLeft className="w-4 h-4" />
                        Anterior
                      </button>

                      <div className="flex items-center gap-1">
                        {Array.from({ length: Math.min(5, totalPaginas) }, (_, i) => {
                          const pageNum = i + 1;
                          return (
                            <button
                              key={pageNum}
                              onClick={() => buscarAvanzado({ ...filtros, pagina: pageNum })}
                              className={`w-10 h-10 rounded-lg font-medium transition-colors ${
                                pagina === pageNum
                                  ? 'bg-accent text-slate-950'
                                  : 'bg-theme-secondary border border-theme text-theme-secondary hover:text-theme-primary hover:border-amber-500/50'
                              }`}
                            >
                              {pageNum}
                            </button>
                          );
                        })}
                        {totalPaginas > 5 && (
                          <>
                            <span className="px-2 text-theme-tertiary">...</span>
                            <button
                              onClick={() => buscarAvanzado({ ...filtros, pagina: totalPaginas })}
                              className="w-10 h-10 rounded-lg font-medium bg-theme-secondary border border-theme text-theme-secondary hover:text-theme-primary hover:border-amber-500/50 transition-colors"
                            >
                              {totalPaginas}
                            </button>
                          </>
                        )}
                      </div>

                      <button
                        onClick={siguientePagina}
                        disabled={pagina === totalPaginas}
                        className="flex items-center gap-2 px-4 py-2 bg-theme-secondary border border-theme rounded-lg text-theme-secondary hover:text-theme-primary hover:border-amber-500/50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                      >
                        Siguiente
                        <ChevronRight className="w-4 h-4" />
                      </button>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}

// ============================================
// SUBCOMPONENTES
// ============================================

interface NavButtonProps {
  active: boolean;
  onClick: () => void;
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  count?: number;
}

function NavButton({ active, onClick, icon: Icon, label, count }: NavButtonProps) {
  return (
    <button
      onClick={onClick}
      className={`w-full flex items-center justify-between p-2.5 rounded-lg transition-colors ${
        active
          ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
          : 'text-theme-secondary hover:bg-theme-tertiary/50 hover:text-theme-primary'
      }`}
    >
      <div className="flex items-center gap-3">
        <Icon className="w-4 h-4" />
        <span className="text-sm font-medium">{label}</span>
      </div>
      {count !== undefined && (
        <span className={`text-xs px-2 py-0.5 rounded-full ${
          active ? 'bg-amber-500/30' : 'bg-theme-tertiary/50'
        }`}>
          {count}
        </span>
      )}
    </button>
  );
}

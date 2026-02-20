// M11 - IA Legal: Búsqueda Semántica
// Búsqueda inteligente con IA en jurisprudencia y legislación

import { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Search, FileText, BookOpen, Sparkles, Clock, 
  Filter, Download, ExternalLink, Star, ChevronDown,
  Brain, Target, Lightbulb
} from 'lucide-react';

// Datos mock de resultados
const resultadosMock = [
  {
    id: '1',
    tipo: 'jurisprudencia',
    titulo: 'STS 234/2024 - Despido improcedente',
    referencia: 'STS (Sala de lo Social) 15/02/2024, rec. 1234/2023',
    contenido: 'El despido stickers debe notificarse por escrito y la carta debe contener los hechos que fundamentan la decisión...',
    relevancia: 95,
    fuente: 'Tribunal Supremo',
    fecha: '2024-02-15'
  },
  {
    id: '2',
    tipo: 'legislacion',
    titulo: 'Estatuto de los Trabajadores - Artículo 56',
    referencia: 'Real Decreto Legislativo 2/2015',
    contenido: '1. El contrato de trabajo podrá concertarse por tiempo indefinido o por duración determinada...',
    relevancia: 88,
    fuente: 'BOE',
    fecha: '2015-10-23'
  },
  {
    id: '3',
    tipo: 'doctrina',
    titulo: 'Análisis de la jurisprudencia sobre despido',
    referencia: 'Revista de Derecho del Trabajo, 2023',
    contenido: 'La evolución jurisprudencial en materia de despido ha consolidado determinados criterios interpretativos...',
    relevancia: 82,
    fuente: 'Revista doctrinal',
    fecha: '2023-06-10'
  },
];

const busquedasRecientes = [
  'despido improcedente indemnización',
  'cláusula suelo préstamo',
  'responsabilidad civil profesional',
  'contrato de arrendamiento',
];

const filtrosDisponibles = {
  tipo: ['jurisprudencia', 'legislacion', 'doctrina', 'resoluciones'],
  ano: ['2024', '2023', '2022', '2021', '2020'],
  tribunal: ['TS', 'AN', 'TSJ Madrid', 'TSJ Barcelona'],
};

export default function IABusqueda() {
  const [query, setQuery] = useState('');
  const [resultados, setResultados] = useState<typeof resultadosMock>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const [filtros, setFiltros] = useState({
    tipo: 'todos',
    ano: 'todos',
    tribunal: 'todos'
  });

  const handleSearch = async () => {
    if (!query.trim()) return;
    
    setIsSearching(true);
    setHasSearched(true);

    // Simular búsqueda con IA
    setTimeout(() => {
      setResultados(resultadosMock);
      setIsSearching(false);
    }, 1500);
  };

  const getTipoIcon = (tipo: string) => {
    switch (tipo) {
      case 'jurisprudencia': return '⚖️';
      case 'legislacion': return '📜';
      case 'doctrina': return '📚';
      default: return '📄';
    }
  };

  const getRelevanciaColor = (relevancia: number) => {
    if (relevancia >= 90) return 'text-emerald-400 bg-emerald-400/10';
    if (relevancia >= 70) return 'text-blue-400 bg-blue-400/10';
    return 'text-amber-400 bg-amber-400/10';
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-theme-primary">Búsqueda Semántica</h1>
          <p className="text-theme-secondary">Encuentra información legal con inteligencia artificial</p>
        </div>
      </div>

      {/* Buscador principal */}
      <div className="bg-theme-card border border-theme rounded-xl p-6">
        <div className="flex gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-theme-muted" />
            <input
              type="text"
              placeholder="Describe tu situación legal o pregunta..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
              className="w-full pl-12 pr-4 py-4 bg-theme-tertiary border border-theme rounded-xl text-theme-primary placeholder-theme-muted focus:outline-none focus:border-accent text-lg"
            />
          </div>
          <button
            onClick={handleSearch}
            disabled={isSearching || !query.trim()}
            className="px-8 py-4 bg-gradient-to-r from-accent to-purple-500 text-white font-medium rounded-xl hover:from-accent-hover hover:to-purple-400 transition-all disabled:opacity-50 flex items-center gap-2"
          >
            {isSearching ? (
              <>
                <Sparkles className="w-5 h-5 animate-spin" />
                Buscando...
              </>
            ) : (
              <>
                <Brain className="w-5 h-5" />
                Buscar con IA
              </>
            )}
          </button>
        </div>

        {/* Filtros rápidos */}
        <div className="flex flex-wrap gap-3 mt-4">
          <select
            value={filtros.tipo}
            onChange={(e) => setFiltros({ ...filtros, tipo: e.target.value })}
            className="px-4 py-2 bg-theme-tertiary border border-theme rounded-xl text-theme-primary text-sm"
          >
            <option value="todos">Todos los tipos</option>
            {filtrosDisponibles.tipo.map(t => (
              <option key={t} value={t}>{t.charAt(0).toUpperCase() + t.slice(1)}</option>
            ))}
          </select>
          <select
            value={filtros.ano}
            onChange={(e) => setFiltros({ ...filtros, ano: e.target.value })}
            className="px-4 py-2 bg-theme-tertiary border border-theme rounded-xl text-theme-primary text-sm"
          >
            <option value="todos">Todos los años</option>
            {filtrosDisponibles.ano.map(a => (
              <option key={a} value={a}>{a}</option>
            ))}
          </select>
          <select
            value={filtros.tribunal}
            onChange={(e) => setFiltros({ ...filtros, tribunal: e.target.value })}
            className="px-4 py-2 bg-theme-tertiary border border-theme rounded-xl text-theme-primary text-sm"
          >
            <option value="todos">Todos los tribunales</option>
            {filtrosDisponibles.tribunal.map(t => (
              <option key={t} value={t}>{t}</option>
            ))}
          </select>
        </div>

        <p className="text-sm text-theme-muted mt-4 flex items-center gap-2">
          <Lightbulb className="w-4 h-4" />
          💡 Prueba preguntas como: "¿Qué dice la jurisprudencia sobre despido improcedente?"
        </p>
      </div>

      {/* Búsquedas recientes */}
      {!hasSearched && (
        <div className="bg-theme-card border border-theme rounded-xl p-4">
          <h3 className="text-sm font-medium text-theme-muted mb-3">Búsquedas recientes</h3>
          <div className="flex flex-wrap gap-2">
            {busquedasRecientes.map((busqueda, i) => (
              <button
                key={i}
                onClick={() => { setQuery(busqueda); handleSearch(); }}
                className="px-3 py-1.5 bg-theme-tertiary text-theme-secondary text-sm rounded-lg hover:bg-accent/10 hover:text-accent transition-colors"
              >
                {busqueda}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Resultados */}
      {hasSearched && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <p className="text-theme-secondary">
              {isSearching ? 'Buscando...' : `${resultados.length} resultados encontrados`}
            </p>
          </div>

          {isSearching ? (
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="bg-theme-card border border-theme rounded-xl p-6 animate-pulse">
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 bg-theme-tertiary rounded-xl" />
                    <div className="flex-1 space-y-3">
                      <div className="h-4 bg-theme-tertiary rounded w-3/4" />
                      <div className="h-3 bg-theme-tertiary rounded w-1/2" />
                      <div className="h-3 bg-theme-tertiary rounded w-full" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="space-y-3">
              {resultados.map((resultado) => (
                <motion.div
                  key={resultado.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-theme-card border border-theme rounded-xl p-4 hover:border-accent/50 transition-colors cursor-pointer"
                >
                  <div className="flex items-start gap-4">
                    <div className="text-2xl">{getTipoIcon(resultado.tipo)}</div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-medium text-theme-primary">{resultado.titulo}</h3>
                        <span className={`px-2 py-0.5 text-xs rounded-full ${getRelevanciaColor(resultado.relevancia)}`}>
                          {resultado.relevancia}% relevancia
                        </span>
                      </div>
                      <p className="text-sm text-theme-muted mb-2">{resultado.referencia}</p>
                      <p className="text-sm text-theme-secondary line-clamp-3">{resultado.contenido}</p>
                      <div className="flex items-center gap-4 mt-3 text-xs text-theme-muted">
                        <span className="flex items-center gap-1">
                          <BookOpen className="w-3 h-3" />
                          {resultado.fuente}
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {resultado.fecha}
                        </span>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <button className="p-2 text-theme-muted hover:text-theme-primary hover:bg-theme-tertiary rounded-lg">
                        <Download className="w-4 h-4" />
                      </button>
                      <button className="p-2 text-theme-muted hover:text-theme-primary hover:bg-theme-tertiary rounded-lg">
                        <ExternalLink className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Estado inicial */}
      {!hasSearched && (
        <div className="bg-theme-card border border-theme rounded-xl p-12 text-center">
          <Search className="w-16 h-16 text-theme-muted mx-auto mb-4" />
          <p className="text-xl font-medium text-theme-primary">Búsqueda Semántica Legal</p>
          <p className="text-theme-secondary mt-2 max-w-md mx-auto">
            Encuentra jurisprudencia, legislación y doctrina usando lenguaje natural. 
            La IA entenderá tu consulta y encontrará los documentos más relevantes.
          </p>
        </div>
      )}
    </div>
  );
}

import { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search, Filter, X, History, Star, Trash2, ChevronDown, ChevronUp,
  Calendar, FileText, Tag, FolderOpen, Clock, Loader2, AlertCircle,
  CheckCircle, Save, Download, Eye, Sparkles, SlidersHorizontal
} from 'lucide-react';
import { AppLayout } from '@/components/layout/AppLayout';
import { documentoService, expedienteService } from '@/services';
import type { Documento, TipoDocumento } from '@/types/documento.types';

interface FiltroAvanzado {
  id: string;
  campo: 'nombre' | 'contenido' | 'tipo' | 'fecha' | 'expediente' | 'entidad';
  operador: 'contiene' | 'no_contiene' | 'igual' | 'mayor' | 'menor' | 'entre';
  valor: string;
  valor2?: string; // Para operador "entre"
}

interface BusquedaGuardada {
  id: string;
  nombre: string;
  filtros: FiltroAvanzado[];
  fecha: string;
  esFavorito: boolean;
}

interface Toast {
  id: number;
  message: string;
  type: 'success' | 'error' | 'info';
}

const camposDisponibles = [
  { value: 'nombre', label: 'Nombre del archivo', tipo: 'texto' },
  { value: 'contenido', label: 'Contenido OCR', tipo: 'texto' },
  { value: 'tipo', label: 'Tipo de documento', tipo: 'select' },
  { value: 'fecha', label: 'Fecha', tipo: 'fecha' },
  { value: 'expediente', label: 'Expediente', tipo: 'select' },
  { value: 'entidad', label: 'Entidad detectada', tipo: 'texto' },
] as const;

const operadoresPorTipo: Record<string, { value: string; label: string }[]> = {
  texto: [
    { value: 'contiene', label: 'Contiene' },
    { value: 'no_contiene', label: 'No contiene' },
    { value: 'igual', label: 'Es exactamente' },
  ],
  select: [
    { value: 'igual', label: 'Es' },
    { value: 'no_contiene', label: 'No es' },
  ],
  fecha: [
    { value: 'mayor', label: 'Después de' },
    { value: 'menor', label: 'Antes de' },
    { value: 'entre', label: 'Entre' },
    { value: 'igual', label: 'Exactamente' },
  ],
};

const tiposDocumento: { value: TipoDocumento; label: string }[] = [
  { value: 'PDF', label: 'PDF' },
  { value: 'IMAGEN', label: 'Imagen' },
  { value: 'WORD', label: 'Word' },
  { value: 'EXCEL', label: 'Excel' },
  { value: 'OTRO', label: 'Otro' },
];

export default function BusquedaAvanzada() {
  const navigate = useNavigate();

  const [filtros, setFiltros] = useState<FiltroAvanzado[]>([]);
  const [documentos, setDocumentos] = useState<Documento[]>([]);
  const [loading, setLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const [busquedasGuardadas, setBusquedasGuardadas] = useState<BusquedaGuardada[]>([]);
  const [mostrarHistorial, setMostrarHistorial] = useState(false);
  const [nombreBusqueda, setNombreBusqueda] = useState('');
  const [guardandoBusqueda, setGuardandoBusqueda] = useState(false);
  const [expedientes, setExpedientes] = useState<Array<{ id: string; numeroExpediente: string }>>([]);
  const [toasts, setToasts] = useState<Toast[]>([]);

  // Cargar búsquedas guardadas y expedientes
  useEffect(() => {
    const saved = localStorage.getItem('busquedas_avanzadas');
    if (saved) {
      setBusquedasGuardadas(JSON.parse(saved));
    }

    // Cargar expedientes
    expedienteService.listarExpedientes({ limit: 100 }).then(response => {
      setExpedientes(response.data.map(e => ({ id: e.id, numeroExpediente: e.numeroExpediente })));
    }).catch(console.error);
  }, []);

  const showToast = (message: string, type: 'success' | 'error' | 'info' = 'info') => {
    const id = Date.now();
    setToasts(prev => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 3000);
  };

  const agregarFiltro = () => {
    const nuevoFiltro: FiltroAvanzado = {
      id: Date.now().toString(),
      campo: 'nombre',
      operador: 'contiene',
      valor: '',
    };
    setFiltros(prev => [...prev, nuevoFiltro]);
  };

  const eliminarFiltro = (id: string) => {
    setFiltros(prev => prev.filter(f => f.id !== id));
  };

  const actualizarFiltro = (id: string, campo: keyof FiltroAvanzado, valor: string) => {
    setFiltros(prev => prev.map(f => {
      if (f.id !== id) return f;
      
      const actualizado = { ...f, [campo]: valor };
      
      // Resetear operador si cambia el campo
      if (campo === 'campo') {
        const tipoCampo = camposDisponibles.find(c => c.value === valor)?.tipo || 'texto';
        const operadores = operadoresPorTipo[tipoCampo] || operadoresPorTipo.texto;
        actualizado.operador = operadores[0].value as any;
        actualizado.valor = '';
        actualizado.valor2 = undefined;
      }
      
      return actualizado;
    }));
  };

  const buscar = async () => {
    if (filtros.length === 0) {
      showToast('Agrega al menos un filtro', 'info');
      return;
    }

    setLoading(true);
    setHasSearched(true);

    try {
      // Construir query de búsqueda
      const searchTerms: string[] = [];
      const params: any = {};

      filtros.forEach(filtro => {
        if (filtro.valor) {
          if (filtro.campo === 'nombre' || filtro.campo === 'contenido') {
            searchTerms.push(filtro.valor);
          } else if (filtro.campo === 'tipo') {
            params.tipo = filtro.valor;
          } else if (filtro.campo === 'expediente') {
            params.expediente_id = filtro.valor;
          }
        }
      });

      const searchQuery = searchTerms.join(' ');
      
      const response = await documentoService.listarDocumentos({
        search: searchQuery || undefined,
        ...params,
        limit: 50,
      });

      setDocumentos(response.data);
    } catch (err: any) {
      showToast(err.message || 'Error al buscar', 'error');
      setDocumentos([]);
    } finally {
      setLoading(false);
    }
  };

  const guardarBusqueda = () => {
    if (!nombreBusqueda.trim()) {
      showToast('Introduce un nombre para la búsqueda', 'info');
      return;
    }

    if (filtros.length === 0) {
      showToast('Agrega al menos un filtro', 'info');
      return;
    }

    setGuardandoBusqueda(true);

    const nuevaBusqueda: BusquedaGuardada = {
      id: Date.now().toString(),
      nombre: nombreBusqueda,
      filtros: [...filtros],
      fecha: new Date().toISOString(),
      esFavorito: false,
    };

    const actualizadas = [nuevaBusqueda, ...busquedasGuardadas].slice(0, 20); // Máximo 20
    setBusquedasGuardadas(actualizadas);
    localStorage.setItem('busquedas_avanzadas', JSON.stringify(actualizadas));
    
    setNombreBusqueda('');
    setGuardandoBusqueda(false);
    showToast('Búsqueda guardada', 'success');
  };

  const cargarBusqueda = (busqueda: BusquedaGuardada) => {
    setFiltros(busqueda.filtros.map(f => ({ ...f, id: Date.now().toString() + Math.random() })));
    setMostrarHistorial(false);
    showToast(`Búsqueda "${busqueda.nombre}" cargada`, 'info');
  };

  const eliminarBusqueda = (id: string) => {
    const actualizadas = busquedasGuardadas.filter(b => b.id !== id);
    setBusquedasGuardadas(actualizadas);
    localStorage.setItem('busquedas_avanzadas', JSON.stringify(actualizadas));
    showToast('Búsqueda eliminada', 'info');
  };

  const toggleFavorito = (id: string) => {
    const actualizadas = busquedasGuardadas.map(b => 
      b.id === id ? { ...b, esFavorito: !b.esFavorito } : b
    );
    setBusquedasGuardadas(actualizadas);
    localStorage.setItem('busquedas_avanzadas', JSON.stringify(actualizadas));
  };

  const limpiarTodo = () => {
    setFiltros([]);
    setDocumentos([]);
    setHasSearched(false);
  };

  const verDocumento = (doc: Documento) => {
    navigate(`/documentos/biblioteca/${doc.id}`);
  };

  const getTipoLabel = (tipo: string) => {
    const labels: Record<string, string> = {
      'PDF': 'PDF',
      'IMAGEN': 'Imagen',
      'WORD': 'Word',
      'EXCEL': 'Excel',
      'OTRO': 'Otro',
    };
    return labels[tipo] || tipo;
  };

  return (
    <AppLayout>
      <div className="p-6 max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-theme-primary flex items-center gap-2">
              <Sparkles className="w-6 h-6 text-amber-500" />
              Búsqueda Avanzada
            </h1>
            <p className="text-theme-secondary">
              Filtros combinados y búsqueda booleana
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setMostrarHistorial(!mostrarHistorial)}
              className="flex items-center gap-2 px-4 py-2 bg-theme-secondary text-theme-primary rounded-lg hover:bg-theme-hover transition-colors"
            >
              <History className="w-4 h-4" />
              Historial
            </button>
            
            {filtros.length > 0 && (
              <button
                onClick={limpiarTodo}
                className="px-4 py-2 text-theme-secondary hover:text-theme-primary transition-colors"
              >
                Limpiar todo
              </button>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Panel de filtros */}
          <div className="lg:col-span-1 space-y-4">
            <div className="bg-theme-secondary rounded-xl border border-theme p-4">
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-semibold text-theme-primary flex items-center gap-2">
                  <SlidersHorizontal className="w-4 h-4" />
                  Filtros
                </h2>
                <span className="text-sm text-theme-tertiary">
                  {filtros.length} filtro{filtros.length !== 1 ? 's' : ''}
                </span>
              </div>

              {/* Lista de filtros */}
              <div className="space-y-3">
                <AnimatePresence>
                  {filtros.map((filtro, index) => {
                    const tipoCampo = camposDisponibles.find(c => c.value === filtro.campo)?.tipo || 'texto';
                    const operadores = operadoresPorTipo[tipoCampo] || operadoresPorTipo.texto;

                    return (
                      <motion.div
                        key={filtro.id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: 20 }}
                        className="p-3 bg-theme rounded-lg space-y-2"
                      >
                        <div className="flex items-center justify-between">
                          <span className="text-xs text-theme-tertiary">
                            Filtro {index + 1}
                          </span>
                          <button
                            onClick={() => eliminarFiltro(filtro.id)}
                            className="p-1 text-theme-tertiary hover:text-red-500 transition-colors"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </div>

                        <select
                          value={filtro.campo}
                          onChange={(e) => actualizarFiltro(filtro.id, 'campo', e.target.value)}
                          className="w-full px-2 py-1.5 bg-theme-secondary border border-theme rounded text-sm text-theme-primary focus:outline-none focus:border-amber-500"
                        >
                          {camposDisponibles.map(campo => (
                            <option key={campo.value} value={campo.value}>
                              {campo.label}
                            </option>
                          ))}
                        </select>

                        <select
                          value={filtro.operador}
                          onChange={(e) => actualizarFiltro(filtro.id, 'operador', e.target.value)}
                          className="w-full px-2 py-1.5 bg-theme-secondary border border-theme rounded text-sm text-theme-primary focus:outline-none focus:border-amber-500"
                        >
                          {operadores.map(op => (
                            <option key={op.value} value={op.value}>
                              {op.label}
                            </option>
                          ))}
                        </select>

                        {tipoCampo === 'select' && filtro.campo === 'tipo' && (
                          <select
                            value={filtro.valor}
                            onChange={(e) => actualizarFiltro(filtro.id, 'valor', e.target.value)}
                            className="w-full px-2 py-1.5 bg-theme-secondary border border-theme rounded text-sm text-theme-primary focus:outline-none focus:border-amber-500"
                          >
                            <option value="">Selecciona tipo...</option>
                            {tiposDocumento.map(tipo => (
                              <option key={tipo.value} value={tipo.value}>
                                {tipo.label}
                              </option>
                            ))}
                          </select>
                        )}

                        {tipoCampo === 'select' && filtro.campo === 'expediente' && (
                          <select
                            value={filtro.valor}
                            onChange={(e) => actualizarFiltro(filtro.id, 'valor', e.target.value)}
                            className="w-full px-2 py-1.5 bg-theme-secondary border border-theme rounded text-sm text-theme-primary focus:outline-none focus:border-amber-500"
                          >
                            <option value="">Selecciona expediente...</option>
                            {expedientes.map(exp => (
                              <option key={exp.id} value={exp.id}>
                                {exp.numeroExpediente}
                              </option>
                            ))}
                          </select>
                        )}

                        {(tipoCampo === 'texto' || (tipoCampo === 'select' && filtro.campo === 'entidad')) && (
                          <input
                            type="text"
                            value={filtro.valor}
                            onChange={(e) => actualizarFiltro(filtro.id, 'valor', e.target.value)}
                            placeholder="Valor..."
                            className="w-full px-2 py-1.5 bg-theme-secondary border border-theme rounded text-sm text-theme-primary placeholder-theme-tertiary focus:outline-none focus:border-amber-500"
                          />
                        )}

                        {tipoCampo === 'fecha' && (
                          <>
                            <input
                              type="date"
                              value={filtro.valor}
                              onChange={(e) => actualizarFiltro(filtro.id, 'valor', e.target.value)}
                              className="w-full px-2 py-1.5 bg-theme-secondary border border-theme rounded text-sm text-theme-primary focus:outline-none focus:border-amber-500"
                            />
                            {filtro.operador === 'entre' && (
                              <>
                                <span className="text-xs text-theme-tertiary">y</span>
                                <input
                                  type="date"
                                  value={filtro.valor2 || ''}
                                  onChange={(e) => actualizarFiltro(filtro.id, 'valor2', e.target.value)}
                                  className="w-full px-2 py-1.5 bg-theme-secondary border border-theme rounded text-sm text-theme-primary focus:outline-none focus:border-amber-500"
                                />
                              </>
                            )}
                          </>
                        )}
                      </motion.div>
                    );
                  })}
                </AnimatePresence>

                {filtros.length === 0 && (
                  <div className="text-center py-8 text-theme-tertiary">
                    <Filter className="w-8 h-8 mx-auto mb-2 opacity-50" />
                    <p className="text-sm">Agrega filtros para comenzar</p>
                  </div>
                )}
              </div>

              {/* Botón agregar filtro */}
              <button
                onClick={agregarFiltro}
                className="w-full mt-4 py-2 border border-dashed border-theme-tertiary text-theme-tertiary rounded-lg hover:border-amber-500 hover:text-amber-500 transition-colors flex items-center justify-center gap-2"
              >
                <span className="text-lg">+</span>
                Agregar filtro
              </button>

              {/* Botón buscar */}
              {filtros.length > 0 && (
                <button
                  onClick={buscar}
                  disabled={loading}
                  className="w-full mt-4 py-2 bg-amber-500 text-white rounded-lg hover:bg-amber-600 disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Buscando...
                    </>
                  ) : (
                    <>
                      <Search className="w-4 h-4" />
                      Buscar
                    </>
                  )}
                </button>
              )}
            </div>

            {/* Guardar búsqueda */}
            {hasSearched && documentos.length > 0 && (
              <div className="bg-theme-secondary rounded-xl border border-theme p-4">
                <h3 className="font-medium text-theme-primary mb-3">Guardar búsqueda</h3>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={nombreBusqueda}
                    onChange={(e) => setNombreBusqueda(e.target.value)}
                    placeholder="Nombre de la búsqueda..."
                    className="flex-1 px-3 py-2 bg-theme border border-theme rounded-lg text-theme-primary placeholder-theme-tertiary focus:outline-none focus:border-amber-500"
                  />
                  <button
                    onClick={guardarBusqueda}
                    disabled={guardandoBusqueda}
                    className="px-3 py-2 bg-emerald-500 text-white rounded-lg hover:bg-emerald-600 disabled:opacity-50"
                  >
                    <Save className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Resultados / Historial */}
          <div className="lg:col-span-2">
            {mostrarHistorial ? (
              <div className="bg-theme-secondary rounded-xl border border-theme overflow-hidden">
                <div className="p-4 border-b border-theme flex items-center justify-between">
                  <h2 className="font-semibold text-theme-primary">Búsquedas guardadas</h2>
                  <button
                    onClick={() => setMostrarHistorial(false)}
                    className="text-sm text-theme-tertiary hover:text-theme-primary"
                  >
                    Cerrar
                  </button>
                </div>

                <div className="divide-y divide-theme">
                  {busquedasGuardadas.length === 0 ? (
                    <div className="p-8 text-center text-theme-tertiary">
                      <History className="w-12 h-12 mx-auto mb-2 opacity-50" />
                      <p>No hay búsquedas guardadas</p>
                    </div>
                  ) : (
                    busquedasGuardadas.map(busqueda => (
                      <div
                        key={busqueda.id}
                        className="p-4 flex items-center gap-4 hover:bg-theme-hover/50 transition-colors"
                      >
                        <button
                          onClick={() => toggleFavorito(busqueda.id)}
                          className={`p-1 ${busqueda.esFavorito ? 'text-amber-500' : 'text-theme-tertiary'}`}
                        >
                          <Star className={`w-4 h-4 ${busqueda.esFavorito ? 'fill-current' : ''}`} />
                        </button>

                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-theme-primary">{busqueda.nombre}</p>
                          <p className="text-sm text-theme-secondary">
                            {busqueda.filtros.length} filtro{busqueda.filtros.length !== 1 ? 's' : ''} • {new Date(busqueda.fecha).toLocaleDateString('es-ES')}
                          </p>
                        </div>

                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => cargarBusqueda(busqueda)}
                            className="p-2 text-theme-tertiary hover:text-amber-500 transition-colors"
                            title="Cargar búsqueda"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => eliminarBusqueda(busqueda.id)}
                            className="p-2 text-theme-tertiary hover:text-red-500 transition-colors"
                            title="Eliminar"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                {!hasSearched ? (
                  <div className="bg-theme-secondary rounded-xl border border-theme p-12 text-center">
                    <Search className="w-16 h-16 text-theme-tertiary mx-auto mb-4" />
                    <h2 className="text-xl font-medium text-theme-primary mb-2">
                      Búsqueda Avanzada
                    </h2>
                    <p className="text-theme-secondary max-w-md mx-auto">
                      Usa filtros combinados para encontrar documentos específicos.
                      Puedes buscar por nombre, contenido OCR, fechas, tipo de documento y más.
                    </p>
                  </div>
                ) : loading ? (
                  <div className="flex items-center justify-center py-12">
                    <Loader2 className="w-8 h-8 animate-spin text-amber-500" />
                  </div>
                ) : documentos.length === 0 ? (
                  <div className="bg-theme-secondary rounded-xl border border-theme p-12 text-center">
                    <AlertCircle className="w-12 h-12 text-theme-tertiary mx-auto mb-4" />
                    <h2 className="text-lg font-medium text-theme-primary mb-2">
                      No se encontraron resultados
                    </h2>
                    <p className="text-theme-secondary">
                      Intenta ajustar los filtros de búsqueda
                    </p>
                  </div>
                ) : (
                  <>
                    <div className="flex items-center justify-between">
                      <p className="text-theme-secondary">
                        {documentos.length} resultado{documentos.length !== 1 ? 's' : ''}
                      </p>
                    </div>

                    <div className="grid gap-3">
                      {documentos.map((doc, idx) => (
                        <motion.div
                          key={doc.id}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: idx * 0.05 }}
                          className="bg-theme-secondary rounded-xl border border-theme p-4 hover:border-amber-500/30 transition-colors cursor-pointer group"
                          onClick={() => verDocumento(doc)}
                        >
                          <div className="flex items-start gap-3">
                            <div className="w-10 h-10 bg-theme rounded-lg flex items-center justify-center flex-shrink-0">
                              {doc.thumbnailUrl ? (
                                <img
                                  src={doc.thumbnailUrl}
                                  alt=""
                                  className="w-full h-full object-cover rounded-lg"
                                />
                              ) : (
                                <FileText className="w-5 h-5 text-theme-tertiary" />
                              )}
                            </div>

                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2">
                                <h3 className="font-medium text-theme-primary truncate group-hover:text-amber-500 transition-colors">
                                  {doc.nombre}
                                </h3>
                                <span className="px-2 py-0.5 text-xs rounded bg-theme text-theme-secondary">
                                  {getTipoLabel(doc.tipo)}
                                </span>
                              </div>

                              {doc.contenidoExtraido && (
                                <p className="text-sm text-theme-tertiary mt-1 line-clamp-2">
                                  {doc.contenidoExtraido.substring(0, 120)}...
                                </p>
                              )}

                              <div className="flex items-center gap-3 mt-2 text-xs text-theme-tertiary">
                                {doc.expediente && (
                                  <span className="flex items-center gap-1">
                                    <FolderOpen className="w-3 h-3" />
                                    {doc.expediente.numeroExpediente}
                                  </span>
                                )}
                                <span className="flex items-center gap-1">
                                  <Calendar className="w-3 h-3" />
                                  {new Date(doc.createdAt).toLocaleDateString('es-ES')}
                                </span>
                                <span>{documentoService.formatFileSize(doc.tamano)}</span>
                              </div>
                            </div>

                            <ChevronRight className="w-5 h-5 text-theme-tertiary group-hover:text-amber-500 transition-colors" />
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  </>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Toasts */}
      <div className="fixed bottom-6 right-6 space-y-2 z-50">
        {toasts.map(toast => (
          <motion.div
            key={toast.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className={`px-4 py-3 rounded-lg shadow-lg flex items-center gap-2 ${
              toast.type === 'success'
                ? 'bg-emerald-500 text-white'
                : toast.type === 'error'
                ? 'bg-red-500 text-white'
                : 'bg-amber-500 text-white'
            }`}
          >
            {toast.type === 'success' ? <CheckCircle className="w-4 h-4" />
              : toast.type === 'error' ? <AlertCircle className="w-4 h-4" />
              : <Search className="w-4 h-4" />}
            <span>{toast.message}</span>
          </motion.div>
        ))}
      </div>
    </AppLayout>
  );
}

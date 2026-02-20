// M2 - Gestión Documental: Buscar
// Búsqueda full-text de documentos

import { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Search, FileText, FolderOpen, Filter, Download, 
  Eye, Clock, User, Tag, X, ChevronRight
} from 'lucide-react';

// Datos mock
const documentosMock = [
  { id: 'DOC-001', nombre: 'Demanda_laboral_2024.pdf', tipo: 'pdf', expediente: 'EXP-2024-001', caso: 'García vs TechCorp', tamano: '2.4 MB', fecha: '2024-01-15', autor: 'María González', tags: ['demanda', 'laboral'], contenido: 'demanda por despido improcedente solicitando indemnizacion...' },
  { id: 'DOC-002', nombre: 'Contrato_arrendamiento.pdf', tipo: 'pdf', expediente: 'EXP-2024-002', caso: 'Martínez S.L.', tamano: '1.8 MB', fecha: '2024-02-20', autor: 'Carlos Ruiz', tags: ['contrato', 'arrendamiento'], contenido: 'contrato de arrendamiento de local comercial...' },
  { id: 'DOC-003', nombre: 'Sentencia_2019_1234.pdf', tipo: 'pdf', expediente: 'EXP-2023-045', caso: 'Rodríguez vs Estado', tamano: '5.2 MB', fecha: '2019-06-15', autor: 'Ana López', tags: ['sentencia', 'penal'], contenido: 'sentencia absolutoria por falta de pruebas...' },
  { id: 'DOC-004', nombre: 'Acta_constitucion_S.L..docx', tipo: 'docx', expediente: 'EXP-2024-003', caso: 'Nueva Startup S.L.', tamano: '890 KB', fecha: '2024-03-10', autor: 'María González', tags: ['acta', 'sociedad'], contenido: 'acta de constitucion de sociedad limitada...' },
  { id: 'DOC-005', nombre: 'Escritura_divorcio.pdf', tipo: 'pdf', expediente: 'EXP-2024-004', caso: 'García - Divorce', tamano: '3.1 MB', fecha: '2024-04-05', autor: 'Carlos Ruiz', tags: ['escritura', 'familia'], contenido: 'escritura publica de divorcio consensual...' },
  { id: 'DOC-006', nombre: 'Informe_pericial.pdf', tipo: 'pdf', expediente: 'EXP-2024-005', caso: 'Accidente Sánchez', tamano: '8.5 MB', fecha: '2024-05-12', autor: 'Ana López', tags: ['pericial', 'accidente'], contenido: 'informe pericial médico de lesiones...' },
];

const tiposArchivo = ['todos', 'pdf', 'docx', 'xlsx', 'pptx'];

export default function DocumentosBuscar() {
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState<typeof documentosMock>([]);
  const [hasSearched, setHasSearched] = useState(false);
  const [filterTipo, setFilterTipo] = useState('todos');
  const [selectedDoc, setSelectedDoc] = useState<typeof documentosMock[0] | null>(null);

  const handleSearch = () => {
    if (!searchTerm.trim()) return;
    
    setHasSearched(true);
    
    // Simular búsqueda full-text
    const results = documentosMock.filter(doc => {
      const matchesSearch = doc.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           doc.caso.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           doc.contenido.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           doc.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));
      const matchesTipo = filterTipo === 'todos' || doc.tipo === filterTipo;
      return matchesSearch && matchesTipo;
    });
    
    setSearchResults(results);
  };

  const getTipoIcon = (tipo: string) => {
    switch (tipo) {
      case 'pdf': return '📄';
      case 'docx': return '📝';
      case 'xlsx': return '📊';
      case 'pptx': return '📑';
      default: return '📁';
    }
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-theme-primary">Buscar Documentos</h1>
          <p className="text-theme-secondary">Búsqueda full-text en todo el repositorio</p>
        </div>
      </div>

      {/* Buscador principal */}
      <div className="bg-theme-card border border-theme rounded-xl p-6">
        <div className="flex gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-theme-muted" />
            <input
              type="text"
              placeholder="Buscar en documentos, casos, contenido..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
              className="w-full pl-12 pr-4 py-3 bg-theme-tertiary border border-theme rounded-xl text-theme-primary placeholder-theme-muted focus:outline-none focus:border-accent text-lg"
            />
          </div>
          <select
            value={filterTipo}
            onChange={(e) => setFilterTipo(e.target.value)}
            className="px-4 py-3 bg-theme-tertiary border border-theme rounded-xl text-theme-primary focus:outline-none focus:border-accent"
          >
            {tiposArchivo.map(tipo => (
              <option key={tipo} value={tipo}>
                {tipo === 'todos' ? 'Todos los tipos' : tipo.toUpperCase()}
              </option>
            ))}
          </select>
          <button
            onClick={handleSearch}
            className="px-6 py-3 bg-accent text-white font-medium rounded-xl hover:bg-accent-hover transition-colors"
          >
            Buscar
          </button>
        </div>

        <p className="text-sm text-theme-muted mt-3">
          💡 Puedes buscar por nombre de archivo, caso, contenido del documento o etiquetas
        </p>
      </div>

      {/* Resultados */}
      {hasSearched && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <p className="text-theme-secondary">
              {searchResults.length} resultado{searchResults.length !== 1 ? 's' : ''} encontrado{searchResults.length !== 1 ? 's' : ''}
            </p>
          </div>

          {searchResults.length === 0 ? (
            <div className="bg-theme-card border border-theme rounded-xl p-12 text-center">
              <Search className="w-12 h-12 text-theme-muted mx-auto mb-4" />
              <p className="text-theme-primary font-medium">No se encontraron resultados</p>
              <p className="text-theme-secondary text-sm mt-1">Intenta con otros términos de búsqueda</p>
            </div>
          ) : (
            <div className="space-y-3">
              {searchResults.map((doc) => (
                <motion.div
                  key={doc.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-theme-card border border-theme rounded-xl p-4 hover:border-accent/50 transition-colors cursor-pointer"
                  onClick={() => setSelectedDoc(doc)}
                >
                  <div className="flex items-start gap-4">
                    <div className="text-3xl">{getTipoIcon(doc.tipo)}</div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <h3 className="font-medium text-theme-primary truncate">{doc.nombre}</h3>
                        <span className="px-2 py-0.5 text-xs rounded bg-theme-tertiary text-theme-secondary">
                          {doc.tipo.toUpperCase()}
                        </span>
                      </div>
                      <p className="text-sm text-theme-secondary mt-1">{doc.caso}</p>
                      
                      {/* Preview del contenido */}
                      <p className="text-sm text-theme-muted mt-2 line-clamp-2">
                        {doc.contenido}
                      </p>
                      
                      <div className="flex items-center gap-4 mt-3 text-xs text-theme-muted">
                        <span className="flex items-center gap-1">
                          <FolderOpen className="w-3 h-3" />
                          {doc.expediente}
                        </span>
                        <span className="flex items-center gap-1">
                          <User className="w-3 h-3" />
                          {doc.autor}
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {new Date(doc.fecha).toLocaleDateString('es-ES')}
                        </span>
                        <span>{doc.tamano}</span>
                      </div>
                      
                      <div className="flex gap-2 mt-2">
                        {doc.tags.map(tag => (
                          <span key={tag} className="px-2 py-0.5 text-xs rounded bg-accent/10 text-accent">
                            #{tag}
                          </span>
                        ))}
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <button className="p-2 text-theme-muted hover:text-theme-primary hover:bg-theme-tertiary rounded-lg transition-colors">
                        <Eye className="w-4 h-4" />
                      </button>
                      <button className="p-2 text-theme-muted hover:text-theme-primary hover:bg-theme-tertiary rounded-lg transition-colors">
                        <Download className="w-4 h-4" />
                      </button>
                      <button className="p-2 text-theme-muted hover:text-theme-primary hover:bg-theme-tertiary rounded-lg transition-colors">
                        <ChevronRight className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Mensaje inicial */}
      {!hasSearched && (
        <div className="bg-theme-card border border-theme rounded-xl p-12 text-center">
          <Search className="w-16 h-16 text-theme-muted mx-auto mb-4" />
          <p className="text-xl font-medium text-theme-primary">Buscar en documentos</p>
          <p className="text-theme-secondary mt-2">
            Introduce términos de búsqueda para encontrar documentos en todo el repositorio
          </p>
        </div>
      )}

      {/* Modal de detalle */}
      {selectedDoc && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60"
          onClick={() => setSelectedDoc(null)}
        >
          <motion.div
            initial={{ scale: 0.95 }}
            animate={{ scale: 1 }}
            className="bg-theme-secondary border border-theme rounded-2xl p-6 max-w-2xl w-full max-h-[80vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3">
                <span className="text-4xl">{getTipoIcon(selectedDoc.tipo)}</span>
                <div>
                  <h2 className="text-xl font-bold text-theme-primary">{selectedDoc.nombre}</h2>
                  <p className="text-theme-secondary">{selectedDoc.caso}</p>
                </div>
              </div>
              <button
                onClick={() => setSelectedDoc(null)}
                className="p-2 text-theme-muted hover:text-theme-primary hover:bg-theme-tertiary rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="p-3 bg-theme-tertiary/50 rounded-xl">
                  <p className="text-xs text-theme-muted">Expediente</p>
                  <p className="text-theme-primary font-medium">{selectedDoc.expediente}</p>
                </div>
                <div className="p-3 bg-theme-tertiary/50 rounded-xl">
                  <p className="text-xs text-theme-muted">Fecha</p>
                  <p className="text-theme-primary font-medium">{new Date(selectedDoc.fecha).toLocaleDateString('es-ES')}</p>
                </div>
                <div className="p-3 bg-theme-tertiary/50 rounded-xl">
                  <p className="text-xs text-theme-muted">Autor</p>
                  <p className="text-theme-primary font-medium">{selectedDoc.autor}</p>
                </div>
                <div className="p-3 bg-theme-tertiary/50 rounded-xl">
                  <p className="text-xs text-theme-muted">Tamaño</p>
                  <p className="text-theme-primary font-medium">{selectedDoc.tamano}</p>
                </div>
              </div>

              <div>
                <p className="text-xs text-theme-muted mb-2">Contenido</p>
                <div className="p-4 bg-theme-tertiary/50 rounded-xl">
                  <p className="text-theme-primary text-sm leading-relaxed">{selectedDoc.contenido}</p>
                </div>
              </div>

              <div className="flex gap-2">
                {selectedDoc.tags.map(tag => (
                  <span key={tag} className="px-3 py-1 text-sm rounded-full bg-accent/10 text-accent">
                    #{tag}
                  </span>
                ))}
              </div>

              <div className="flex gap-3 pt-4 border-t border-theme">
                <button className="flex-1 py-2 bg-accent text-white font-medium rounded-xl hover:bg-accent-hover transition-colors flex items-center justify-center gap-2">
                  <Eye className="w-4 h-4" />
                  Ver documento
                </button>
                <button className="px-4 py-2 border border-theme text-theme-secondary rounded-xl hover:bg-theme-tertiary transition-colors flex items-center justify-center gap-2">
                  <Download className="w-4 h-4" />
                  Descargar
                </button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </div>
  );
}

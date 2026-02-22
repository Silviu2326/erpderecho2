// M13 - Integraciones: Registro Civil
// Consulta de nacimientos, defunciones y matrimonios

import { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  BookOpen, Search, UserPlus, Heart, Search, CheckCircle, 
  XCircle, AlertCircle, Calendar, FileText, Download, 
  RefreshCw, Settings, Filter, Users
} from 'lucide-react';
import { AppLayout } from '@/components/layout/AppLayout';

type TipoRegistro = 'nacimiento' | 'defuncion' | 'matrimonio';

interface ResultadoRegistro {
  id: string;
  tipo: TipoRegistro;
  nombre?: string;
  primerApellido?: string;
  segundoApellido?: string;
  dni?: string;
  fechaNacimiento?: string;
  fechaDefuncion?: string;
  fechaMatrimonio?: string;
  lugar?: string;
  registro?: string;
  numeroTomo?: string;
  numeroPagina?: string;
  anno?: string;
  madre?: string;
  padre?: string;
  esposa?: string;
  esposo?: string;
  observaciones?: string;
}

const resultadosMock: ResultadoRegistro[] = [
  {
    id: 'RC-2024-001',
    tipo: 'nacimiento',
    nombre: 'MARIA',
    primerApellido: 'GARCIA',
    segundoApellido: 'LOPEZ',
    dni: '12345678A',
    fechaNacimiento: '15/03/1990',
    lugar: 'Madrid',
    registro: 'Registro Civil de Madrid',
    numeroTomo: '125',
    numeroPagina: '342',
    anno: '1990',
    madre: 'ANA LOPEZ MARTINEZ',
    padre: 'JOSE GARCIA SANCHEZ',
  },
  {
    id: 'RC-2024-002',
    tipo: 'defuncion',
    nombre: 'ANTONIO',
    primerApellido: 'FERNANDEZ',
    segundoApellido: 'RUIZ',
    dni: '87654321B',
    fechaDefuncion: '20/01/2024',
    lugar: 'Barcelona',
    registro: 'Registro Civil de Barcelona',
    numeroTomo: '89',
    numeroPagina: '156',
    anno: '2024',
  },
  {
    id: 'RC-2024-003',
    tipo: 'matrimonio',
    fechaMatrimonio: '10/06/2022',
    lugar: 'Valencia',
    registro: 'Registro Civil de Valencia',
    numeroTomo: '201',
    numeroPagina: '89',
    anno: '2022',
    esposa: 'LAURA MARTINEZ TORRES',
    esposo: 'DAVID SANCHEZ GOMEZ',
  },
];

export default function RegistroCivil() {
  const [activeTab, setActiveTab] = useState<TipoRegistro>('nacimiento');
  const [isConnected, setIsConnected] = useState(true);
  const [isSearching, setIsSearching] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [resultados, setResultados] = useState<ResultadoRegistro[]>([]);
  const [busquedaRealizada, setBusquedaRealizada] = useState(false);
  
  // Formulario de búsqueda
  const [formData, setFormData] = useState({
    nombre: '',
    primerApellido: '',
    segundoApellido: '',
    dni: '',
    fechaDesde: '',
    fechaHasta: '',
  });

  const handleSearch = () => {
    setIsSearching(true);
    setBusquedaRealizada(true);
    
    // Simular búsqueda
    setTimeout(() => {
      const filtered = resultadosMock.filter(r => {
        const matchesTipo = r.tipo === activeTab;
        const matchesNombre = !formData.nombre || r.nombre?.includes(formData.nombre.toUpperCase());
        const matchesApellido = !formData.primerApellido || 
          r.primerApellido?.includes(formData.primerApellido.toUpperCase()) ||
          r.esposa?.includes(formData.primerApellido.toUpperCase()) ||
          r.esposo?.includes(formData.primerApellido.toUpperCase());
        const matchesDni = !formData.dni || r.dni?.includes(formData.dni);
        
        return matchesTipo && matchesNombre && matchesApellido && matchesDni;
      });
      
      setResultados(filtered.length > 0 ? filtered : resultadosMock.filter(r => r.tipo === activeTab));
      setIsSearching(false);
    }, 1500);
  };

  const getTipoIcon = (tipo: TipoRegistro) => {
    switch (tipo) {
      case 'nacimiento': return <UserPlus className="w-5 h-5" />;
      case 'defuncion': return <BookOpen className="w-5 h-5" />;
      case 'matrimonio': return <Heart className="w-5 h-5" />;
    }
  };

  const getTipoLabel = (tipo: TipoRegistro) => {
    switch (tipo) {
      case 'nacimiento': return 'Nacimiento';
      case 'defuncion': return 'Defunción';
      case 'matrimonio': return 'Matrimonio';
    }
  };

  const getTipoColor = (tipo: TipoRegistro) => {
    switch (tipo) {
      case 'nacimiento': return 'bg-emerald-500/20 text-emerald-400';
      case 'defuncion': return 'bg-gray-500/20 text-gray-400';
      case 'matrimonio': return 'bg-pink-500/20 text-pink-400';
    }
  };

  const stats = {
    nacimiento: resultadosMock.filter(r => r.tipo === 'nacimiento').length,
    defuncion: resultadosMock.filter(r => r.tipo === 'defuncion').length,
    matrimonio: resultadosMock.filter(r => r.tipo === 'matrimonio').length,
  };

  return (
    <AppLayout title="Registro Civil" subtitle="Consulta de datos registrales">
      <div className="p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-gradient-to-br from-amber-500 to-orange-600 rounded-xl flex items-center justify-center">
              <BookOpen className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-theme-primary">Registro Civil</h1>
              <p className="text-theme-secondary">Consulta de nacimientos, defunciones y matrimonios</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full ${
              isConnected ? 'bg-emerald-500/10 text-emerald-400' : 'bg-red-500/10 text-red-400'
            }`}>
              {isConnected ? <CheckCircle className="w-4 h-4" /> : <XCircle className="w-4 h-4" />}
              <span className="text-sm font-medium">{isConnected ? 'Conectado' : 'Desconectado'}</span>
            </div>
            
            <button className="flex items-center gap-2 px-4 py-2 bg-theme-card border border-theme text-theme-secondary rounded-xl hover:text-theme-primary transition-colors">
              <Settings className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div 
            onClick={() => setActiveTab('nacimiento')}
            className={`bg-theme-card border rounded-xl p-4 cursor-pointer transition-all ${
              activeTab === 'nacimiento' ? 'border-emerald-500 ring-1 ring-emerald-500' : 'border-theme hover:border-emerald-500/50'
            }`}
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-emerald-500/20 rounded-xl flex items-center justify-center">
                <UserPlus className="w-5 h-5 text-emerald-400" />
              </div>
              <div>
                <p className="text-sm text-theme-secondary">Nacimientos</p>
                <p className="text-2xl font-bold text-theme-primary">{stats.nacimiento}</p>
              </div>
            </div>
          </div>
          
          <div 
            onClick={() => setActiveTab('defuncion')}
            className={`bg-theme-card border rounded-xl p-4 cursor-pointer transition-all ${
              activeTab === 'defuncion' ? 'border-gray-500 ring-1 ring-gray-500' : 'border-theme hover:border-gray-500/50'
            }`}
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gray-500/20 rounded-xl flex items-center justify-center">
                <BookOpen className="w-5 h-5 text-gray-400" />
              </div>
              <div>
                <p className="text-sm text-theme-secondary">Defunciones</p>
                <p className="text-2xl font-bold text-theme-primary">{stats.defuncion}</p>
              </div>
            </div>
          </div>
          
          <div 
            onClick={() => setActiveTab('matrimonio')}
            className={`bg-theme-card border rounded-xl p-4 cursor-pointer transition-all ${
              activeTab === 'matrimonio' ? 'border-pink-500 ring-1 ring-pink-500' : 'border-theme hover:border-pink-500/50'
            }`}
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-pink-500/20 rounded-xl flex items-center justify-center">
                <Heart className="w-5 h-5 text-pink-400" />
              </div>
              <div>
                <p className="text-sm text-theme-secondary">Matrimonios</p>
                <p className="text-2xl font-bold text-theme-primary">{stats.matrimonio}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 border-b border-theme">
          <button
            onClick={() => { setActiveTab('nacimiento'); setResultados([]); setBusquedaRealizada(false); }}
            className={`flex items-center gap-2 px-4 py-3 border-b-2 transition-colors ${
              activeTab === 'nacimiento' ? 'border-emerald-500 text-emerald-400' : 'border-transparent text-theme-secondary hover:text-theme-primary'
            }`}
          >
            <UserPlus className="w-4 h-4" />
            Nacimientos
          </button>
          <button
            onClick={() => { setActiveTab('defuncion'); setResultados([]); setBusquedaRealizada(false); }}
            className={`flex items-center gap-2 px-4 py-3 border-b-2 transition-colors ${
              activeTab === 'defuncion' ? 'border-gray-400 text-gray-400' : 'border-transparent text-theme-secondary hover:text-theme-primary'
            }`}
          >
            <BookOpen className="w-4 h-4" />
            Defunciones
          </button>
          <button
            onClick={() => { setActiveTab('matrimonio'); setResultados([]); setBusquedaRealizada(false); }}
            className={`flex items-center gap-2 px-4 py-3 border-b-2 transition-colors ${
              activeTab === 'matrimonio' ? 'border-pink-500 text-pink-400' : 'border-transparent text-theme-secondary hover:text-theme-primary'
            }`}
          >
            <Heart className="w-4 h-4" />
            Matrimonios
          </button>
        </div>

        {/* Formulario de búsqueda */}
        <div className="bg-theme-card border border-theme rounded-xl p-6">
          <div className="flex items-center gap-2 mb-4">
            <Search className="w-5 h-5 text-accent" />
            <h3 className="font-semibold text-theme-primary">Búsqueda en Registro Civil</h3>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-theme-primary mb-2">Nombre</label>
              <input
                type="text"
                value={formData.nombre}
                onChange={(e) => setFormData({...formData, nombre: e.target.value})}
                placeholder="Nombre completo"
                className="w-full px-4 py-2 bg-theme-tertiary border border-theme rounded-xl text-theme-primary"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-theme-primary mb-2">Primer Apellido</label>
              <input
                type="text"
                value={formData.primerApellido}
                onChange={(e) => setFormData({...formData, primerApellido: e.target.value})}
                placeholder="Primer apellido"
                className="w-full px-4 py-2 bg-theme-tertiary border border-theme rounded-xl text-theme-primary"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-theme-primary mb-2">Segundo Apellido</label>
              <input
                type="text"
                value={formData.segundoApellido}
                onChange={(e) => setFormData({...formData, segundoApellido: e.target.value})}
                placeholder="Segundo apellido"
                className="w-full px-4 py-2 bg-theme-tertiary border border-theme rounded-xl text-theme-primary"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-theme-primary mb-2">DNI/NIE</label>
              <input
                type="text"
                value={formData.dni}
                onChange={(e) => setFormData({...formData, dni: e.target.value})}
                placeholder="12345678A"
                className="w-full px-4 py-2 bg-theme-tertiary border border-theme rounded-xl text-theme-primary"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-theme-primary mb-2">Fecha Desde</label>
              <input
                type="date"
                value={formData.fechaDesde}
                onChange={(e) => setFormData({...formData, fechaDesde: e.target.value})}
                className="w-full px-4 py-2 bg-theme-tertiary border border-theme rounded-xl text-theme-primary"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-theme-primary mb-2">Fecha Hasta</label>
              <input
                type="date"
                value={formData.fechaHasta}
                onChange={(e) => setFormData({...formData, fechaHasta: e.target.value})}
                className="w-full px-4 py-2 bg-theme-tertiary border border-theme rounded-xl text-theme-primary"
              />
            </div>
          </div>
          
          <div className="flex gap-3 mt-4">
            <button
              onClick={handleSearch}
              disabled={isSearching}
              className="flex-1 py-3 bg-accent text-white font-medium rounded-xl hover:bg-accent-hover flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {isSearching ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  Buscando...
                </>
              ) : (
                <>
                  <Search className="w-4 h-4" />
                  Buscar en Registro Civil
                </>
              )}
            </button>
            
            <button
              onClick={() => {
                setFormData({ nombre: '', primerApellido: '', segundoApellido: '', dni: '', fechaDesde: '', fechaHasta: '' });
                setResultados([]);
                setBusquedaRealizada(false);
              }}
              className="px-4 py-3 border border-theme text-theme-secondary rounded-xl hover:bg-theme-tertiary"
            >
              Limpiar
            </button>
          </div>
        </div>

        {/* Resultados */}
        {busquedaRealizada && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold text-theme-primary">Resultados de búsqueda</h3>
              <span className="text-sm text-theme-secondary">{resultados.length} registros encontrados</span>
            </div>
            
            {resultados.length === 0 ? (
              <div className="bg-theme-card border border-theme rounded-xl p-8 text-center">
                <Search className="w-12 h-12 text-theme-muted mx-auto mb-4" />
                <p className="text-theme-secondary">No se encontraron registros con los criterios de búsqueda</p>
              </div>
            ) : (
              <div className="space-y-3">
                {resultados.map((resultado) => (
                  <motion.div
                    key={resultado.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-theme-card border border-theme rounded-xl p-4 hover:border-accent/50 transition-colors"
                  >
                    <div className="flex items-start gap-4">
                      <div className={`mt-1 p-2 rounded-lg ${getTipoColor(resultado.tipo)}`}>
                        {getTipoIcon(resultado.tipo)}
                      </div>
                      
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <h4 className="font-semibold text-theme-primary">
                            {resultado.nombre} {resultado.primerApellido} {resultado.segundoApellido}
                            {resultado.esposa && resultado.esposa}
                            {resultado.esposo && resultado.esposo}
                          </h4>
                          <span className={`px-2 py-0.5 text-xs rounded-full ${getTipoColor(resultado.tipo)}`}>
                            {getTipoLabel(resultado.tipo)}
                          </span>
                        </div>
                        
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                          {resultado.fechaNacimiento && (
                            <div>
                              <p className="text-theme-muted">Fecha nacimiento</p>
                              <p className="text-theme-primary">{resultado.fechaNacimiento}</p>
                            </div>
                          )}
                          {resultado.fechaDefuncion && (
                            <div>
                              <p className="text-theme-muted">Fecha defunción</p>
                              <p className="text-theme-primary">{resultado.fechaDefuncion}</p>
                            </div>
                          )}
                          {resultado.fechaMatrimonio && (
                            <div>
                              <p className="text-theme-muted">Fecha matrimonio</p>
                              <p className="text-theme-primary">{resultado.fechaMatrimonio}</p>
                            </div>
                          )}
                          {resultado.lugar && (
                            <div>
                              <p className="text-theme-muted">Lugar</p>
                              <p className="text-theme-primary">{resultado.lugar}</p>
                            </div>
                          )}
                          {resultado.dni && (
                            <div>
                              <p className="text-theme-muted">DNI/NIE</p>
                              <p className="text-theme-primary">{resultado.dni}</p>
                            </div>
                          )}
                          {resultado.registro && (
                            <div>
                              <p className="text-theme-muted">Registro</p>
                              <p className="text-theme-primary">{resultado.registro}</p>
                            </div>
                          )}
                          {resultado.numeroTomo && (
                            <div>
                              <p className="text-theme-muted">Tomo</p>
                              <p className="text-theme-primary">{resultado.numeroTomo}</p>
                            </div>
                          )}
                          {resultado.anno && (
                            <div>
                              <p className="text-theme-muted">Año</p>
                              <p className="text-theme-primary">{resultado.anno}</p>
                            </div>
                          )}
                        </div>
                        
                        {(resultado.madre || resultado.padre || resultado.esposa || resultado.esposo) && (
                          <div className="mt-3 pt-3 border-t border-theme">
                            <div className="flex flex-wrap gap-4 text-sm">
                              {resultado.madre && (
                                <div className="flex items-center gap-2">
                                  <Users className="w-4 h-4 text-pink-400" />
                                  <span className="text-theme-secondary">Madre:</span>
                                  <span className="text-theme-primary">{resultado.madre}</span>
                                </div>
                              )}
                              {resultado.padre && (
                                <div className="flex items-center gap-2">
                                  <Users className="w-4 h-4 text-blue-400" />
                                  <span className="text-theme-secondary">Padre:</span>
                                  <span className="text-theme-primary">{resultado.padre}</span>
                                </div>
                              )}
                              {resultado.esposa && (
                                <div className="flex items-center gap-2">
                                  <Heart className="w-4 h-4 text-pink-400" />
                                  <span className="text-theme-secondary">Cónyuge:</span>
                                  <span className="text-theme-primary">{resultado.esposa}</span>
                                </div>
                              )}
                              {resultado.esposo && (
                                <div className="flex items-center gap-2">
                                  <Heart className="w-4 h-4 text-blue-400" />
                                  <span className="text-theme-secondary">Cónyuge:</span>
                                  <span className="text-theme-primary">{resultado.esposo}</span>
                                </div>
                              )}
                            </div>
                          </div>
                        )}
                      </div>
                      
                      <div className="flex gap-2">
                        <button className="p-2 text-theme-muted hover:text-theme-primary hover:bg-theme-tertiary rounded-lg">
                          <FileText className="w-4 h-4" />
                        </button>
                        <button className="p-2 text-theme-muted hover:text-theme-primary hover:bg-theme-tertiary rounded-lg">
                          <Download className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </AppLayout>
  );
}

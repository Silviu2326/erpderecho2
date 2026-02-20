// M13 - Integraciones: LexNET
// Conexión con el sistema LexNET de comunicaciones judiciales

import { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Building2, Link, CheckCircle, XCircle, AlertCircle,
  Send, Download, Upload, RefreshCw, Settings, Clock,
  FileText, User, Eye, Search, Filter
} from 'lucide-react';

// Datos mock
const comunicacionesLexnetMock = [
  { id: 'LEX-001', tipo: 'enviado', expediente: 'EXP-2024-001', organismo: 'Juzgado Primera Instancia nº 1', asunto: 'Demanda', fecha: '2024-05-20 10:30', estado: 'entregado' },
  { id: 'LEX-002', tipo: 'recibido', expediente: 'EXP-2024-001', organismo: 'Juzgado Primera Instancia nº 1', asunto: 'Auto admisión demanda', fecha: '2024-05-21 09:15', estado: 'leido' },
  { id: 'LEX-003', tipo: 'recibido', expediente: 'EXP-2024-002', organismo: 'Audiencia Provincial', asunto: 'Sentencia', fecha: '2024-05-19 14:20', estado: 'pendiente' },
  { id: 'LEX-004', tipo: 'enviado', expediente: 'EXP-2024-003', organismo: 'Juzgado Social nº 5', asunto: 'Recurso', fecha: '2024-05-18 11:00', estado: 'entregado' },
];

const bandejaEntrada = 3;
const enviados = 15;
const pendientes = 1;

export default function IntegracionesLexnet() {
  const [activeTab, setActiveTab] = useState<'bandeja' | 'enviados' | 'redactar'>('bandeja');
  const [isConnected, setIsConnected] = useState(true);
  const [isSyncing, setIsSyncing] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  const handleSync = () => {
    setIsSyncing(true);
    setTimeout(() => setIsSyncing(false), 2000);
  };

  const getEstadoIcon = (estado: string) => {
    switch (estado) {
      case 'entregado': return <CheckCircle className="w-4 h-4 text-emerald-400" />;
      case 'leido': return <Eye className="w-4 h-4 text-blue-400" />;
      case 'pendiente': return <Clock className="w-4 h-4 text-amber-400" />;
      case 'fallido': return <XCircle className="w-4 h-4 text-red-400" />;
      default: return <AlertCircle className="w-4 h-4 text-gray-400" />;
    }
  };

  const filteredComunicaciones = comunicacionesLexnetMock.filter(c => {
    const matchesSearch = c.asunto.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         c.expediente.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         c.organismo.toLowerCase().includes(searchTerm.toLowerCase());
    
    if (activeTab === 'bandeja') return matchesSearch && c.tipo === 'recibido';
    if (activeTab === 'enviados') return matchesSearch && c.tipo === 'enviado';
    return matchesSearch;
  });

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-700 rounded-xl flex items-center justify-center">
            <Building2 className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-theme-primary">LexNET</h1>
            <p className="text-theme-secondary">Comunicaciones judiciales electrónicas</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          {/* Estado de conexión */}
          <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full ${
            isConnected ? 'bg-emerald-500/10 text-emerald-400' : 'bg-red-500/10 text-red-400'
          }`}>
            {isConnected ? <CheckCircle className="w-4 h-4" /> : <XCircle className="w-4 h-4" />}
            <span className="text-sm font-medium">{isConnected ? 'Conectado' : 'Desconectado'}</span>
          </div>
          
          <button
            onClick={handleSync}
            disabled={isSyncing}
            className="flex items-center gap-2 px-4 py-2 bg-theme-card border border-theme text-theme-secondary rounded-xl hover:text-theme-primary transition-colors"
          >
            <RefreshCw className={`w-4 h-4 ${isSyncing ? 'animate-spin' : ''}`} />
            Sincronizar
          </button>
          
          <button className="flex items-center gap-2 px-4 py-2 bg-theme-card border border-theme text-theme-secondary rounded-xl hover:text-theme-primary transition-colors">
            <Settings className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-theme-card border border-theme rounded-xl p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-500/20 rounded-xl flex items-center justify-center">
              <FileText className="w-5 h-5 text-blue-400" />
            </div>
            <div>
              <p className="text-sm text-theme-secondary">Bandeja entrada</p>
              <p className="text-2xl font-bold text-theme-primary">{bandejaEntrada}</p>
            </div>
          </div>
        </div>
        <div className="bg-theme-card border border-theme rounded-xl p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-emerald-500/20 rounded-xl flex items-center justify-center">
              <Send className="w-5 h-5 text-emerald-400" />
            </div>
            <div>
              <p className="text-sm text-theme-secondary">Enviados</p>
              <p className="text-2xl font-bold text-theme-primary">{enviados}</p>
            </div>
          </div>
        </div>
        <div className="bg-theme-card border border-theme rounded-xl p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-amber-500/20 rounded-xl flex items-center justify-center">
              <Clock className="w-5 h-5 text-amber-400" />
            </div>
            <div>
              <p className="text-sm text-theme-secondary">Pendientes</p>
              <p className="text-2xl font-bold text-theme-primary">{pendientes}</p>
            </div>
          </div>
        </div>
        <div className="bg-theme-card border border-theme rounded-xl p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-purple-500/20 rounded-xl flex items-center justify-center">
              <Link className="w-5 h-5 text-purple-400" />
            </div>
            <div>
              <p className="text-sm text-theme-secondary">Última sync</p>
              <p className="text-xl font-bold text-theme-primary">Ahora</p>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-theme">
        <button
          onClick={() => setActiveTab('bandeja')}
          className={`flex items-center gap-2 px-4 py-3 border-b-2 transition-colors ${
            activeTab === 'bandeja' ? 'border-accent text-accent' : 'border-transparent text-theme-secondary'
          }`}
        >
          <FileText className="w-4 h-4" />
          Bandeja de Entrada
          {bandejaEntrada > 0 && (
            <span className="px-2 py-0.5 text-xs bg-amber-500/20 text-amber-400 rounded-full">{bandejaEntrada}</span>
          )}
        </button>
        <button
          onClick={() => setActiveTab('enviados')}
          className={`flex items-center gap-2 px-4 py-3 border-b-2 transition-colors ${
            activeTab === 'enviados' ? 'border-accent text-accent' : 'border-transparent text-theme-secondary'
          }`}
        >
          <Send className="w-4 h-4" />
          Enviados
        </button>
        <button
          onClick={() => setActiveTab('redactar')}
          className={`flex items-center gap-2 px-4 py-3 border-b-2 transition-colors ${
            activeTab === 'redactar' ? 'border-accent text-accent' : 'border-transparent text-theme-secondary'
          }`}
        >
          <Upload className="w-4 h-4" />
          Redactar
        </button>
      </div>

      {/* Contenido: Bandeja / Enviados */}
      {(activeTab === 'bandeja' || activeTab === 'enviados') && (
        <>
          {/* Buscador */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-theme-muted" />
            <input
              type="text"
              placeholder="Buscar comunicaciones..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-theme-card border border-theme rounded-xl text-theme-primary placeholder-theme-muted focus:outline-none focus:border-accent"
            />
          </div>

          {/* Lista */}
          <div className="space-y-2">
            {filteredComunicaciones.map((com) => (
              <motion.div
                key={com.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-theme-card border border-theme rounded-xl p-4 hover:border-accent/50 transition-colors cursor-pointer"
              >
                <div className="flex items-start gap-4">
                  <div className={`mt-1 ${com.tipo === 'enviado' ? 'text-emerald-400' : 'text-blue-400'}`}>
                    {com.tipo === 'enviado' ? <Send className="w-5 h-5" /> : <FileText className="w-5 h-5" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-medium text-theme-primary">{com.asunto}</h3>
                      {getEstadoIcon(com.estado)}
                    </div>
                    <p className="text-sm text-theme-secondary">{com.organismo}</p>
                    <div className="flex items-center gap-4 mt-2 text-xs text-theme-muted">
                      <span className="flex items-center gap-1">
                        <FileText className="w-3 h-3" />
                        {com.expediente}
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {com.fecha}
                      </span>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button className="p-2 text-theme-muted hover:text-theme-primary hover:bg-theme-tertiary rounded-lg">
                      <Eye className="w-4 h-4" />
                    </button>
                    <button className="p-2 text-theme-muted hover:text-theme-primary hover:bg-theme-tertiary rounded-lg">
                      <Download className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </>
      )}

      {/* Contenido: Redactar */}
      {activeTab === 'redactar' && (
        <div className="bg-theme-card border border-theme rounded-xl p-6">
          <h3 className="font-semibold text-theme-primary mb-4">Nueva Comunicación LexNET</h3>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-theme-primary mb-2">Organismo destino</label>
              <select className="w-full px-4 py-2 bg-theme-tertiary border border-theme rounded-xl text-theme-primary">
                <option>Juzgado de Primera Instancia nº 1 - Madrid</option>
                <option>Audiencia Provincial - Madrid</option>
                <option>Juzgado de lo Social nº 5 - Madrid</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-theme-primary mb-2">Expediente</label>
              <input
                type="text"
                placeholder="EXP-2024-XXX"
                className="w-full px-4 py-2 bg-theme-tertiary border border-theme rounded-xl text-theme-primary"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-theme-primary mb-2">Asunto</label>
              <input
                type="text"
                placeholder="Asunto de la comunicación"
                className="w-full px-4 py-2 bg-theme-tertiary border border-theme rounded-xl text-theme-primary"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-theme-primary mb-2">Documento adjunto</label>
              <div className="border-2 border-dashed border-theme rounded-xl p-4 text-center">
                <Upload className="w-8 h-8 text-theme-muted mx-auto mb-2" />
                <p className="text-sm text-theme-secondary">Arrastra archivos o haz clic para subir</p>
                <p className="text-xs text-theme-muted mt-1">PDF, DOCX (max. 10MB)</p>
              </div>
            </div>

            <div className="flex gap-3 pt-4">
              <button
                onClick={() => setActiveTab('bandeja')}
                className="flex-1 py-3 border border-theme text-theme-secondary rounded-xl hover:bg-theme-tertiary"
              >
                Cancelar
              </button>
              <button className="flex-1 py-3 bg-accent text-white font-medium rounded-xl hover:bg-accent-hover flex items-center justify-center gap-2">
                <Send className="w-4 h-4" />
                Enviar a LexNET
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

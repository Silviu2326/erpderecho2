import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Building2, 
  Search, 
  MapPin, 
  User, 
  FileText, 
  Loader2,
  X,
  Home,
  Building,
  Trees,
  Scale
} from 'lucide-react';
import { useConsultaCatastro, type TipoCatastro } from '@/hooks/useConsultaCatastro';
import { useConsultaPropiedad, type TipoPropiedad } from '@/hooks/useConsultaPropiedad';
import { useConsultaRegistro, type TipoRegistro } from '@/hooks/useConsultaRegistro';

type ConsultaTipo = 'civil' | 'catastro' | 'propiedad';

interface ConsultaRapidaWidgetProps {
  className?: string;
}

export function ConsultaRapidaWidget({ className = '' }: ConsultaRapidaWidgetProps) {
  const [consultaActiva, setConsultaActiva] = useState<ConsultaTipo>('civil');
  const [tipoSeleccionado, setTipoSeleccionado] = useState<TipoCatastro | TipoPropiedad | TipoRegistro>('nacimiento');
  const [busqueda, setBusqueda] = useState('');
  const [resultadoExpandido, setResultadoExpandido] = useState<string | null>(null);

  const catastro = useConsultaCatastro();
  const propiedad = useConsultaPropiedad();
  const registro = useConsultaRegistro();

  const isLoading = 
    consultaActiva === 'civil' ? registro.isLoading :
    consultaActiva === 'catastro' ? catastro.isLoading : propiedad.isLoading;
  
  const resultados = 
    consultaActiva === 'civil' ? registro.resultados :
    consultaActiva === 'catastro' ? catastro.resultados : propiedad.resultados;
  
  const error = 
    consultaActiva === 'civil' ? registro.error :
    consultaActiva === 'catastro' ? catastro.error : propiedad.error;

  const handleBusqueda = async () => {
    if (!busqueda.trim()) return;
    
    if (consultaActiva === 'civil') {
      await registro.buscar(tipoSeleccionado as TipoRegistro, {
        nombre: busqueda,
        primerApellido: busqueda,
        dni: busqueda,
      });
    } else if (consultaActiva === 'catastro') {
      await catastro.buscar(tipoSeleccionado as TipoCatastro, {
        referenciaCatastral: busqueda,
        direccion: busqueda,
      });
    } else {
      await propiedad.buscar(tipoSeleccionado as TipoPropiedad, {
        referenciaCatastral: busqueda,
        direccion: busqueda,
      });
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleBusqueda();
    }
  };

  const limpiarBusqueda = () => {
    setBusqueda('');
    setResultadoExpandido(null);
    if (consultaActiva === 'civil') {
      registro.limpiarResultados();
    } else if (consultaActiva === 'catastro') {
      catastro.limpiarResultados();
    } else {
      propiedad.limpiarResultados();
    }
  };

  const tiposRegistro: { value: TipoRegistro; label: string; icon: React.ReactNode }[] = [
    { value: 'nacimiento', label: 'Nacimiento', icon: <User className="w-4 h-4" /> },
    { value: 'defuncion', label: 'Defunción', icon: <FileText className="w-4 h-4" /> },
    { value: 'matrimonio', label: 'Matrimonio', icon: <Scale className="w-4 h-4" /> },
  ];

  const tiposCatastro: { value: TipoCatastro; label: string; icon: React.ReactNode }[] = [
    { value: 'urbana', label: 'Urbana', icon: <Building className="w-4 h-4" /> },
    { value: 'rustica', label: 'Rústica', icon: <Trees className="w-4 h-4" /> },
    { value: 'especial', label: 'Especial', icon: <Building2 className="w-4 h-4" /> },
    { value: 'bienes_inmuebles', label: 'Bienes Inmuebles', icon: <Home className="w-4 h-4" /> },
  ];

  const tiposPropiedad: { value: TipoPropiedad; label: string; icon: React.ReactNode }[] = [
    { value: 'urbana', label: 'Urbana', icon: <Building className="w-4 h-4" /> },
    { value: 'rustica', label: 'Rústica', icon: <Trees className="w-4 h-4" /> },
    { value: 'especial', label: 'Especial', icon: <Building2 className="w-4 h-4" /> },
  ];

  const tipos = consultaActiva === 'civil' ? tiposRegistro : consultaActiva === 'catastro' ? tiposCatastro : tiposPropiedad;

  return (
    <div className={`bg-theme-card border border-theme rounded-2xl p-6 ${className}`}>
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-theme-primary flex items-center gap-2">
          <Search className="w-5 h-5 text-accent" />
          Consulta Rápida
        </h3>
        <div className="flex gap-2">
          <button
            onClick={() => {
              setConsultaActiva('civil');
              setTipoSeleccionado('nacimiento');
              limpiarBusqueda();
            }}
            className={`px-3 py-1.5 text-sm rounded-lg transition-colors ${
              consultaActiva === 'civil'
                ? 'bg-accent text-white'
                : 'bg-theme-tertiary text-theme-secondary hover:text-theme-primary'
            }`}
          >
            Civil
          </button>
          <button
            onClick={() => {
              setConsultaActiva('catastro');
              setTipoSeleccionado('urbana');
              limpiarBusqueda();
            }}
            className={`px-3 py-1.5 text-sm rounded-lg transition-colors ${
              consultaActiva === 'catastro'
                ? 'bg-accent text-white'
                : 'bg-theme-tertiary text-theme-secondary hover:text-theme-primary'
            }`}
          >
            Catastro
          </button>
          <button
            onClick={() => {
              setConsultaActiva('propiedad');
              setTipoSeleccionado('urbana');
              limpiarBusqueda();
            }}
            className={`px-3 py-1.5 text-sm rounded-lg transition-colors ${
              consultaActiva === 'propiedad'
                ? 'bg-accent text-white'
                : 'bg-theme-tertiary text-theme-secondary hover:text-theme-primary'
            }`}
          >
            Propiedad
          </button>
        </div>
      </div>

      <div className="space-y-4">
        <div className="flex flex-wrap gap-2">
          {tipos.map((tipo) => (
            <button
              key={tipo.value}
              onClick={() => setTipoSeleccionado(tipo.value)}
              className={`flex items-center gap-1.5 px-3 py-1.5 text-sm rounded-lg transition-colors ${
                tipoSeleccionado === tipo.value
                  ? 'bg-accent/10 text-accent border border-accent/30'
                  : 'bg-theme-tertiary text-theme-secondary hover:text-theme-primary border border-transparent'
              }`}
            >
              {tipo.icon}
              {tipo.label}
            </button>
          ))}
        </div>

        <div className="flex gap-2">
          <div className="relative flex-1">
            <input
              type="text"
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
              onKeyDown={handleKeyPress}
              placeholder={
                consultaActiva === 'civil'
                  ? 'DNI, nombre o apellidos...'
                  : consultaActiva === 'catastro'
                  ? 'Referencia catastral o dirección...'
                  : 'Referencia o dirección...'
              }
              className="w-full px-4 py-2.5 pl-10 bg-theme-tertiary border border-theme rounded-xl text-theme-primary placeholder:text-theme-muted focus:outline-none focus:border-accent"
            />
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-theme-muted" />
            {busqueda && (
              <button
                onClick={limpiarBusqueda}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-theme-muted hover:text-theme-primary"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
          <button
            onClick={handleBusqueda}
            disabled={isLoading || !busqueda.trim()}
            className="px-4 py-2.5 bg-accent text-white rounded-xl hover:bg-accent-hover disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            {isLoading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              'Buscar'
            )}
          </button>
        </div>
      </div>

      {error && (
        <div className="mt-4 p-3 bg-red-500/10 border border-red-500/30 rounded-xl text-red-400 text-sm">
          {error}
        </div>
      )}

      <div className="mt-4 space-y-2 max-h-80 overflow-y-auto">
        <AnimatePresence mode="wait">
          {resultados.length > 0 ? (
            resultados.map((resultado: any) => (
              <motion.div
                key={resultado.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="bg-theme-tertiary rounded-xl overflow-hidden"
              >
                <button
                  onClick={() => setResultadoExpandido(resultadoExpandido === resultado.id ? null : resultado.id)}
                  className="w-full p-3 text-left flex items-start gap-3 hover:bg-theme/50 transition-colors"
                >
                  <div className={`p-2 rounded-lg ${
                    consultaActiva === 'civil' ? 'bg-purple-500/20 text-purple-400' :
                    consultaActiva === 'catastro' ? 'bg-blue-500/20 text-blue-400' : 'bg-emerald-500/20 text-emerald-400'
                  }`}>
                    {consultaActiva === 'civil' ? <User className="w-4 h-4" /> :
                     consultaActiva === 'catastro' ? <Building2 className="w-4 h-4" /> : <FileText className="w-4 h-4" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-theme-primary truncate">
                      {resultado.direccion}
                    </p>
                    <p className="text-sm text-theme-secondary flex items-center gap-1">
                      <MapPin className="w-3 h-3" />
                      {resultado.municipio}, {resultado.provincia}
                    </p>
                    {resultado.referenciaCatastral && (
                      <p className="text-xs text-theme-muted mt-1">
                        Ref: {resultado.referenciaCatastral}
                      </p>
                    )}
                  </div>
                </button>

                <AnimatePresence>
                  {resultadoExpandido === resultado.id && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="border-t border-theme overflow-hidden"
                    >
                      <div className="p-3 space-y-2 text-sm">
                        {resultado.titular && (
                          <div className="flex items-center gap-2">
                            <User className="w-3 h-3 text-theme-muted" />
                            <span className="text-theme-secondary">Titular:</span>
                            <span className="text-theme-primary">{resultado.titular}</span>
                          </div>
                        )}
                        {resultado.nifTitular && (
                          <div className="flex items-center gap-2">
                            <span className="text-theme-muted">NIF:</span>
                            <span className="text-theme-primary font-mono">{resultado.nifTitular}</span>
                          </div>
                        )}
                        {resultado.superficie && (
                          <div className="flex items-center gap-2">
                            <span className="text-theme-muted">Superficie:</span>
                            <span className="text-theme-primary">{resultado.superficie} m²</span>
                          </div>
                        )}
                        {resultado.valorCatastral && (
                          <div className="flex items-center gap-2">
                            <span className="text-theme-muted">Valor Catastral:</span>
                            <span className="text-theme-primary">{resultado.valorCatastral.toLocaleString()} €</span>
                          </div>
                        )}
                        {resultado.derechosReales && (
                          <div className="flex items-center gap-2">
                            <span className="text-theme-muted">Derechos:</span>
                            <span className="text-theme-primary">{resultado.derechosReales}</span>
                          </div>
                        )}
                        {resultado.cargas && resultado.cargas.length > 0 && (
                          <div>
                            <span className="text-theme-muted">Cargas:</span>
                            <ul className="mt-1 ml-4 list-disc text-theme-secondary">
                              {resultado.cargas.map((carga: string, idx: number) => (
                                <li key={idx}>{carga}</li>
                              ))}
                            </ul>
                          </div>
                        )}
                        {resultado.registro && (
                          <div className="pt-2 border-t border-theme">
                            <p className="text-theme-muted text-xs">Registro de la Propiedad</p>
                            <p className="text-theme-secondary text-xs">{resultado.registro}</p>
                            {resultado.numeroFinca && (
                              <p className="text-theme-muted text-xs">Finca: {resultado.numeroFinca}</p>
                            )}
                          </div>
                        )}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            ))
          ) : (
            !isLoading && busqueda && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-center py-8 text-theme-muted"
              >
                <Search className="w-8 h-8 mx-auto mb-2 opacity-50" />
                <p>No se encontraron resultados</p>
              </motion.div>
            )
          )}
        </AnimatePresence>
      </div>

      {!busqueda && resultados.length === 0 && (
        <div className="mt-4 text-center py-8 text-theme-muted">
          <Search className="w-8 h-8 mx-auto mb-2 opacity-50" />
          <p className="text-sm">Ingresa una referencia o dirección para buscar</p>
        </div>
      )}
    </div>
  );
}

export default ConsultaRapidaWidget;

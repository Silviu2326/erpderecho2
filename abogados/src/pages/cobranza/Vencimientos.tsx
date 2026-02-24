import { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { 
  AlertTriangle, Calendar, Clock, Mail, Phone, DollarSign,
  Search, Filter, ChevronDown, ChevronUp, FileText,
  Loader2, AlertCircle, CheckCircle2
} from 'lucide-react';
import { AppLayout } from '@/components/layout/AppLayout';
import { useRole } from '@/hooks/useRole';
import { cobranzaService, type FacturaVencida } from '@/services';

export default function Vencimientos() {
  const { role } = useRole();
  const [facturas, setFacturas] = useState<FacturaVencida[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFactura, setSelectedFactura] = useState<FacturaVencida | null>(null);
  const [rangoDias, setRangoDias] = useState<'all' | '1-30' | '31-60' | '61-90' | '90+'>('all');

  // Cargar facturas vencidas
  const loadFacturas = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await cobranzaService.getFacturasVencidas({ limit: 1000 });
      setFacturas(response.data);
    } catch (err) {
      console.error('Error cargando vencimientos:', err);
      setError('Error al cargar las facturas vencidas');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadFacturas();
  }, [loadFacturas]);

  // Filtrar facturas
  const filteredFacturas = facturas.filter(f => {
    const matchesSearch = 
      f.cliente?.nombre.toLowerCase().includes(searchQuery.toLowerCase()) ||
      f.numero.toLowerCase().includes(searchQuery.toLowerCase()) ||
      f.concepto.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesRango = rangoDias === 'all' || 
      (rangoDias === '1-30' && f.diasVencida >= 1 && f.diasVencida <= 30) ||
      (rangoDias === '31-60' && f.diasVencida >= 31 && f.diasVencida <= 60) ||
      (rangoDias === '61-90' && f.diasVencida >= 61 && f.diasVencida <= 90) ||
      (rangoDias === '90+' && f.diasVencida > 90);
    
    return matchesSearch && matchesRango;
  });

  // Calcular totales
  const totales = {
    total: filteredFacturas.reduce((sum, f) => sum + f.importe, 0),
    intereses: filteredFacturas.reduce((sum, f) => sum + (f.interesesMora || 0), 0),
    cantidad: filteredFacturas.length,
  };

  // Agrupar por rango de días
  const porRango = {
    '1-30': filteredFacturas.filter(f => f.diasVencida >= 1 && f.diasVencida <= 30),
    '31-60': filteredFacturas.filter(f => f.diasVencida >= 31 && f.diasVencida <= 60),
    '61-90': filteredFacturas.filter(f => f.diasVencida >= 61 && f.diasVencida <= 90),
    '90+': filteredFacturas.filter(f => f.diasVencida > 90),
  };

  const enviarRecordatorio = async (facturaId: string) => {
    try {
      await cobranzaService.enviarRecordatorio(facturaId, 'email');
      // Mostrar notificación de éxito
    } catch (err) {
      console.error('Error enviando recordatorio:', err);
    }
  };

  if (loading) {
    return (
      <AppLayout title="Vencimientos" subtitle="Cargando...">
        <main className="flex-1 overflow-y-auto p-6 lg:p-8 flex items-center justify-center">
          <div className="text-center">
            <Loader2 className="w-12 h-12 text-accent animate-spin mx-auto mb-4" />
            <p className="text-theme-secondary">Cargando vencimientos...</p>
          </div>
        </main>
      </AppLayout>
    );
  }

  if (error) {
    return (
      <AppLayout title="Vencimientos" subtitle="Error">
        <main className="flex-1 overflow-y-auto p-6 lg:p-8 flex items-center justify-center">
          <div className="text-center max-w-md">
            <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
            <p className="text-theme-secondary mb-4">{error}</p>
            <button 
              onClick={loadFacturas}
              className="px-4 py-2 bg-accent text-white rounded-xl"
            >
              Reintentar
            </button>
          </div>
        </main>
      </AppLayout>
    );
  }

  return (
    <AppLayout 
      title="Vencimientos" 
      subtitle={`${totales.cantidad} facturas vencidas por €${totales.total.toLocaleString()}`}
    >
      <main className="flex-1 overflow-y-auto p-6 lg:p-8">
        {/* Resumen por rangos */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          {[
            { rango: '1-30', label: '1-30 días', color: 'amber', facturas: porRango['1-30'] },
            { rango: '31-60', label: '31-60 días', color: 'orange', facturas: porRango['31-60'] },
            { rango: '61-90', label: '61-90 días', color: 'red', facturas: porRango['61-90'] },
            { rango: '90+', label: '90+ días', color: 'purple', facturas: porRango['90+'] },
          ].map((item) => {
            const total = item.facturas.reduce((sum, f) => sum + f.importe, 0);
            return (
              <motion.button
                key={item.rango}
                onClick={() => setRangoDias(item.rango as any)}
                whileHover={{ scale: 1.02 }}
                className={`p-4 bg-theme-card border rounded-xl text-left transition-colors ${
                  rangoDias === item.rango ? 'border-amber-500' : 'border-theme'
                }`}
              >
                <div className={`w-10 h-10 rounded-lg bg-${item.color}-500/10 flex items-center justify-center mb-3`}>
                  <Clock className={`w-5 h-5 text-${item.color}-400`} />
                </div>
                <p className="text-2xl font-bold text-theme-primary">€{total.toLocaleString()}</p>
                <p className="text-sm text-theme-secondary">{item.label}</p>
                <p className="text-xs text-theme-muted mt-1">{item.facturas.length} facturas</p>
              </motion.button>
            );
          })}
        </div>

        {/* Filtros y búsqueda */}
        <div className="flex flex-col lg:flex-row gap-4 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-theme-muted" />
            <input
              type="text"
              placeholder="Buscar facturas vencidas..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-4 py-3 bg-theme-card border border-theme rounded-xl text-theme-primary focus:outline-none focus:border-amber-500"
            />
          </div>
          
          <select
            value={rangoDias}
            onChange={(e) => setRangoDias(e.target.value as any)}
            className="px-4 py-3 bg-theme-card border border-theme rounded-xl text-theme-primary"
          >
            <option value="all">Todos los rangos</option>
            <option value="1-30">1-30 días</option>
            <option value="31-60">31-60 días</option>
            <option value="61-90">61-90 días</option>
            <option value="90+">Más de 90 días</option>
          </select>
        </div>

        {/* Lista de facturas vencidas */}
        <div className="bg-theme-card border border-theme rounded-2xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-theme bg-theme-secondary/50">
                  <th className="text-left py-4 px-6 text-xs font-semibold text-theme-secondary uppercase">Factura</th>
                  <th className="text-left py-4 px-6 text-xs font-semibold text-theme-secondary uppercase">Cliente</th>
                  <th className="text-right py-4 px-6 text-xs font-semibold text-theme-secondary uppercase">Importe</th>
                  <th className="text-center py-4 px-6 text-xs font-semibold text-theme-secondary uppercase">Días</th>
                  <th className="text-left py-4 px-6 text-xs font-semibold text-theme-secondary uppercase">Vencimiento</th>
                  <th className="text-right py-4 px-6 text-xs font-semibold text-theme-secondary uppercase">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {filteredFacturas.map((factura, index) => (
                  <motion.tr
                    key={factura.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.03 }}
                    className={`border-b border-theme/50 hover:bg-theme-secondary/30 transition-all border-l-4 ${
                      factura.diasVencida > 90 ? 'border-l-purple-500' :
                      factura.diasVencida > 60 ? 'border-l-red-500' :
                      factura.diasVencida > 30 ? 'border-l-orange-500' :
                      'border-l-amber-500'
                    }`}
                  >
                    <td className="py-4 px-6">
                      <div>
                        <p className="text-sm font-semibold text-theme-primary">{factura.numero}</p>
                        <p className="text-xs text-theme-muted truncate max-w-[200px]">{factura.concepto}</p>
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 bg-amber-500/10 rounded-lg flex items-center justify-center text-xs font-bold text-amber-400">
                          {factura.cliente?.nombre.substring(0, 2).toUpperCase()}
                        </div>
                        <p className="text-sm text-theme-primary">{factura.cliente?.nombre}</p>
                      </div>
                    </td>
                    <td className="py-4 px-6 text-right">
                      <p className="text-sm font-bold text-theme-primary">€{factura.importe.toLocaleString()}</p>
                      {factura.interesesMora > 0 && (
                        <p className="text-xs text-red-400">+ €{factura.interesesMora.toFixed(2)} intereses</p>
                      )}
                    </td>
                    <td className="py-4 px-6 text-center">
                      <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-full ${
                        factura.diasVencida > 90 ? 'bg-purple-500/10 text-purple-400' :
                        factura.diasVencida > 60 ? 'bg-red-500/10 text-red-400' :
                        factura.diasVencida > 30 ? 'bg-orange-500/10 text-orange-400' :
                        'bg-amber-500/10 text-amber-400'
                      }`}>
                        {factura.diasVencida > 90 && <AlertTriangle className="w-3 h-3" />}
                        {factura.diasVencida} días
                      </span>
                    </td>
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-2 text-sm text-theme-secondary">
                        <Calendar className="w-4 h-4 text-theme-muted" />
                        {factura.fechaVencimiento && new Date(factura.fechaVencimiento).toLocaleDateString('es-ES')}
                      </div>
                    </td>
                    <td className="py-4 px-6 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => enviarRecordatorio(factura.id)}
                          className="p-2 text-theme-secondary hover:text-blue-500 hover:bg-blue-500/10 rounded-lg transition-all"
                          title="Enviar recordatorio"
                        >
                          <Mail className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => setSelectedProveedor(factura)}
                          className="p-2 text-theme-secondary hover:text-amber-500 hover:bg-amber-500/10 rounded-lg transition-all"
                          title="Ver detalles"
                        >
                          <FileText className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
          
          {filteredFacturas.length === 0 && (
            <div className="p-16 text-center">
              <CheckCircle2 className="w-16 h-16 text-emerald-400 mx-auto mb-4" />
              <p className="text-theme-secondary font-medium">¡Excelente noticia!</p>
              <p className="text-theme-muted text-sm mt-1">No hay facturas vencidas en este rango</p>
            </div>
          )}
        </div>

        {/* Total */}
        <div className="mt-6 p-4 bg-theme-card border border-theme rounded-xl">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-theme-secondary">Total en vencimientos</p>
              <p className="text-2xl font-bold text-theme-primary">€{totales.total.toLocaleString()}</p>
            </div>
            {totales.intereses > 0 && (
              <div className="text-right">
                <p className="text-sm text-theme-secondary">Intereses de mora</p>
                <p className="text-xl font-bold text-red-400">+ €{totales.intereses.toFixed(2)}</p>
              </div>
            )}
          </div>
        </div>
      </main>
    </AppLayout>
  );
}

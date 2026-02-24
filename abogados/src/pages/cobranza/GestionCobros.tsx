import { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { 
  Phone, Mail, FileText, Calendar, CheckCircle2, Clock,
  User, DollarSign, Search, Filter, Plus, AlertCircle,
  Loader2, ArrowRight
} from 'lucide-react';
import { AppLayout } from '@/components/layout/AppLayout';
import { useRole } from '@/hooks/useRole';
import { cobranzaService, type CuentaPorCobrar, type RegistroCobro } from '@/services';

export default function GestionCobros() {
  const { role } = useRole();
  const [cuentas, setCuentas] = useState<CuentaPorCobrar[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCuenta, setSelectedCuenta] = useState<CuentaPorCobrar | null>(null);
  const [showNuevoCobro, setShowNuevoCobro] = useState(false);

  // Cargar cuentas
  const loadCuentas = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await cobranzaService.getCuentasPorCobrar({ limit: 1000 });
      // Filtrar solo las que tienen facturas vencidas
      const cuentasConMora = response.data.filter(c => c.facturasVencidas > 0);
      setCuentas(cuentasConMora);
    } catch (err) {
      console.error('Error cargando cuentas:', err);
      setError('Error al cargar las cuentas');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadCuentas();
  }, [loadCuentas]);

  // Filtrar cuentas
  const filteredCuentas = cuentas.filter(c => 
    c.clienteNombre.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.clienteEmail?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Calcular totales
  const totales = {
    clientes: filteredCuentas.length,
    pendiente: filteredCuentas.reduce((sum, c) => sum + c.totalPendiente, 0),
    vencido: filteredCuentas.reduce((sum, c) => sum + (c.totalPendiente * c.facturasVencidas / c.totalFacturas), 0),
  };

  if (loading) {
    return (
      <AppLayout title="Gestión de Cobros" subtitle="Cargando...">
        <main className="flex-1 overflow-y-auto p-6 lg:p-8 flex items-center justify-center">
          <div className="text-center">
            <Loader2 className="w-12 h-12 text-accent animate-spin mx-auto mb-4" />
            <p className="text-theme-secondary">Cargando cuentas...</p>
          </div>
        </main>
      </AppLayout>
    );
  }

  if (error) {
    return (
      <AppLayout title="Gestión de Cobros" subtitle="Error">
        <main className="flex-1 overflow-y-auto p-6 lg:p-8 flex items-center justify-center">
          <div className="text-center max-w-md">
            <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
            <p className="text-theme-secondary mb-4">{error}</p>
            <button 
              onClick={loadCuentas}
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
      title="Gestión de Cobros" 
      subtitle={`${totales.clientes} clientes con facturas vencidas`}
    >
      <main className="flex-1 overflow-y-auto p-6 lg:p-8">
        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
          {[
            { label: 'Clientes', value: totales.clientes, icon: User, color: 'blue' },
            { label: 'Total Pendiente', value: `€${totales.pendiente.toLocaleString()}`, icon: DollarSign, color: 'amber' },
            { label: 'Vencido', value: `€${Math.round(totales.vencido).toLocaleString()}`, icon: AlertCircle, color: 'red' },
          ].map((stat) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="p-4 bg-theme-card border border-theme rounded-xl"
            >
              <div className={`w-10 h-10 rounded-lg bg-${stat.color}-500/10 flex items-center justify-center mb-3`}>
                <stat.icon className={`w-5 h-5 text-${stat.color}-400`} />
              </div>
              <p className="text-xl font-bold text-theme-primary">{stat.value}</p>
              <p className="text-sm text-theme-secondary">{stat.label}</p>
            </motion.div>
          ))}
        </div>

        {/* Search */}
        <div className="flex gap-4 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-theme-muted" />
            <input
              type="text"
              placeholder="Buscar cliente..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-4 py-3 bg-theme-card border border-theme rounded-xl text-theme-primary focus:outline-none focus:border-amber-500"
            />
          </div>
          
          <button
            onClick={() => setShowNuevoCobro(true)}
            className="px-4 py-2 bg-amber-500 text-white rounded-xl hover:bg-amber-400 transition-colors flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            <span className="hidden sm:inline">Nuevo Cobro</span>
          </button>
        </div>

        {/* Lista de cuentas */}
        <div className="space-y-4">
          {filteredCuentas.map((cuenta, index) => (
            <motion.div
              key={cuenta.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              className="p-6 bg-theme-card border border-theme rounded-2xl hover:border-amber-500/30 transition-all cursor-pointer group"
              onClick={() => setSelectedCuenta(cuenta)}
            >
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 bg-gradient-to-br from-amber-500/20 to-purple-500/20 rounded-xl flex items-center justify-center text-xl font-bold text-amber-400">
                    {cuenta.clienteNombre.substring(0, 2).toUpperCase()}
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-theme-primary">{cuenta.clienteNombre}</h3>
                    <p className="text-sm text-theme-secondary">{cuenta.clienteEmail}</p>
                    <div className="flex items-center gap-2 mt-2">
                      <span className="px-2 py-1 bg-red-500/10 text-red-400 text-xs rounded-full">
                        {cuenta.facturasVencidas} facturas vencidas
                      </span>
                      <span className="px-2 py-1 bg-amber-500/10 text-amber-400 text-xs rounded-full">
                        {cuenta.totalFacturas} total
                      </span>
                    </div>
                  </div>
                </div>
                
                <div className="text-right">
                  <p className="text-2xl font-bold text-theme-primary">€{cuenta.totalPendiente.toLocaleString()}</p>
                  <p className="text-sm text-theme-secondary">Pendiente</p>
                  <div className="flex items-center gap-2 mt-2 justify-end">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        // Llamar cliente
                      }}
                      className="p-2 bg-blue-500/10 text-blue-400 rounded-lg hover:bg-blue-500/20 transition-colors"
                      title="Llamar"
                    >
                      <Phone className="w-4 h-4" />
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        // Enviar email
                      }}
                      className="p-2 bg-purple-500/10 text-purple-400 rounded-lg hover:bg-purple-500/20 transition-colors"
                      title="Enviar email"
                    >
                      <Mail className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {filteredCuentas.length === 0 && (
          <div className="text-center py-16">
            <CheckCircle2 className="w-16 h-16 text-emerald-400 mx-auto mb-4" />
            <p className="text-theme-secondary font-medium">No hay clientes con facturas vencidas</p>
            <p className="text-theme-muted text-sm mt-1">Todos los clientes están al día con sus pagos</p>
          </div>
        )}
      </main>
    </AppLayout>
  );
}

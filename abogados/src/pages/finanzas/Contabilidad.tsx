import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Plus, Download, TrendingUp, TrendingDown,
  Calculator, PieChart, BarChart3, FileText, Wallet,
  ArrowUpRight, ArrowDownRight, Lock, Search, Filter,
  ChevronLeft, ChevronRight, Trash2, Eye, X,
  CheckCircle, AlertCircle, Calendar, Building2,
  BadgeEuro, Receipt, BookOpen
} from 'lucide-react';
import { LineChart, Line, PieChart as RePieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { AppLayout } from '@/components/layout/AppLayout';
import { contabilidadService, type AsientoContable, type ContabilidadStats, type TipoAsiento } from '@/services/contabilidadService';
import { useRole } from '@/hooks/useRole';

// Tipos
interface Tab {
  id: string;
  label: string;
  icon: React.ElementType;
}

interface LibroMayorEntry {
  codigo: string;
  nombre: string;
  total: number;
  asientos: AsientoContable[];
}

const COLORS = ['#10b981', '#3b82f6', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'];

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('es-ES', {
    style: 'currency',
    currency: 'EUR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
};

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString('es-ES', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  });
};

export default function Contabilidad() {
  const { role, roleConfig } = useRole();
  
  // Tabs state
  const [activeTab, setActiveTab] = useState('resumen');
  
  // Data states
  const [stats, setStats] = useState<ContabilidadStats | null>(null);
  const [asientos, setAsientos] = useState<AsientoContable[]>([]);
  const [cuentas, setCuentas] = useState<{ codigo: string; nombre: string; total: number }[]>([]);
  const [libroMayor, setLibroMayor] = useState<LibroMayorEntry | null>(null);
  
  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [itemsPerPage] = useState(10);
  
  // Filters
  const [searchTerm, setSearchTerm] = useState('');
  const [tipoFilter, setTipoFilter] = useState<TipoAsiento | ''>('');
  const [fechaDesde, setFechaDesde] = useState('');
  const [fechaHasta, setFechaHasta] = useState('');
  const [cuentaFilter, setCuentaFilter] = useState('');
  
  // Loading states
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingLibroMayor, setIsLoadingLibroMayor] = useState(false);
  
  // Modal states
  const [showNewEntryModal, setShowNewEntryModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedAsiento, setSelectedAsiento] = useState<AsientoContable | null>(null);
  
  // Toast
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'info' | 'error' } | null>(null);
  
  // Form states
  const [newEntryForm, setNewEntryForm] = useState({
    numero: '',
    fecha: new Date().toISOString().split('T')[0],
    concepto: '',
    tipo: 'INGRESO' as TipoAsiento,
    importe: '',
    importeDebe: '',
    importeHaber: '',
    cuentaCodigo: '',
    cuentaNombre: '',
    documentoRef: ''
  });

  // Permissions
  const permissions = {
    canView: role === 'super_admin' || role === 'socio' || role === 'contador' || role === 'administrador',
    canCreate: role === 'super_admin' || role === 'contador',
    canEdit: role === 'super_admin' || role === 'contador',
    canDelete: role === 'super_admin',
    canViewLibroMayor: role === 'super_admin' || role === 'contador',
  };

  const showToast = (message: string, type: 'success' | 'info' | 'error' = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  // Fetch stats
  const fetchStats = useCallback(async () => {
    try {
      const response = await contabilidadService.getStats();
      if (response.success) {
        setStats(response.data);
      }
    } catch (error) {
      console.error('Error fetching stats:', error);
      showToast('Error al cargar estadísticas', 'error');
    }
  }, []);

  // Fetch asientos with pagination
  const fetchAsientos = useCallback(async () => {
    setIsLoading(true);
    try {
      const params = {
        page: currentPage,
        limit: itemsPerPage,
        search: searchTerm || undefined,
        tipo: tipoFilter || undefined,
        fechaDesde: fechaDesde || undefined,
        fechaHasta: fechaHasta || undefined,
        cuentaCodigo: cuentaFilter || undefined,
        sort: 'fecha',
        order: 'desc' as const
      };
      
      const response = await contabilidadService.getAsientos(params);
      if (response.success) {
        setAsientos(response.data);
        setTotalPages(response.meta.totalPages);
      }
    } catch (error) {
      console.error('Error fetching asientos:', error);
      showToast('Error al cargar asientos contables', 'error');
    } finally {
      setIsLoading(false);
    }
  }, [currentPage, itemsPerPage, searchTerm, tipoFilter, fechaDesde, fechaHasta, cuentaFilter]);

  // Fetch cuentas
  const fetchCuentas = useCallback(async () => {
    try {
      const response = await contabilidadService.getCuentas();
      if (response.success) {
        setCuentas(response.data);
      }
    } catch (error) {
      console.error('Error fetching cuentas:', error);
    }
  }, []);

  // Fetch libro mayor
  const fetchLibroMayor = useCallback(async (cuentaCodigo: string) => {
    if (!cuentaCodigo) return;
    setIsLoadingLibroMayor(true);
    try {
      const response = await contabilidadService.getLibroMayor(cuentaCodigo, fechaDesde, fechaHasta);
      if (response.success) {
        const cuenta = cuentas.find(c => c.codigo === cuentaCodigo);
        setLibroMayor({
          codigo: cuentaCodigo,
          nombre: cuenta?.nombre || '',
          total: cuenta?.total || 0,
          asientos: response.data
        });
      }
    } catch (error) {
      console.error('Error fetching libro mayor:', error);
      showToast('Error al cargar libro mayor', 'error');
    } finally {
      setIsLoadingLibroMayor(false);
    }
  }, [cuentas, fechaDesde, fechaHasta]);

  // Load initial data
  useEffect(() => {
    if (permissions.canView) {
      fetchStats();
      fetchCuentas();
    }
  }, [fetchStats, fetchCuentas, permissions.canView]);

  // Load asientos when tab changes or filters change
  useEffect(() => {
    if (activeTab === 'asientos' && permissions.canView) {
      fetchAsientos();
    }
  }, [activeTab, fetchAsientos, permissions.canView]);

  // Load libro mayor when cuenta changes
  useEffect(() => {
    if (activeTab === 'libro-mayor' && cuentaFilter && permissions.canViewLibroMayor) {
      fetchLibroMayor(cuentaFilter);
    }
  }, [activeTab, cuentaFilter, fetchLibroMayor, permissions.canViewLibroMayor]);

  // Handlers
  const handleCreateAsiento = async () => {
    if (!newEntryForm.numero || !newEntryForm.concepto || !newEntryForm.importe || !newEntryForm.cuentaCodigo) {
      showToast('Por favor complete todos los campos obligatorios', 'error');
      return;
    }

    try {
      const data = {
        ...newEntryForm,
        importe: parseFloat(newEntryForm.importe),
        importeDebe: newEntryForm.importeDebe ? parseFloat(newEntryForm.importeDebe) : undefined,
        importeHaber: newEntryForm.importeHaber ? parseFloat(newEntryForm.importeHaber) : undefined
      };

      const response = await contabilidadService.createAsiento(data);
      if (response.success) {
        showToast('Asiento contable creado correctamente');
        setShowNewEntryModal(false);
        setNewEntryForm({
          numero: '',
          fecha: new Date().toISOString().split('T')[0],
          concepto: '',
          tipo: 'INGRESO',
          importe: '',
          importeDebe: '',
          importeHaber: '',
          cuentaCodigo: '',
          cuentaNombre: '',
          documentoRef: ''
        });
        fetchAsientos();
        fetchStats();
      }
    } catch (error) {
      console.error('Error creating asiento:', error);
      showToast('Error al crear el asiento', 'error');
    }
  };

  const handleDeleteAsiento = async () => {
    if (!selectedAsiento) return;

    try {
      const response = await contabilidadService.deleteAsiento(selectedAsiento.id);
      if (response.success) {
        showToast('Asiento eliminado correctamente');
        setShowDeleteModal(false);
        setSelectedAsiento(null);
        fetchAsientos();
        fetchStats();
      }
    } catch (error) {
      console.error('Error deleting asiento:', error);
      showToast('Error al eliminar el asiento', 'error');
    }
  };

  const handleViewAsiento = (asiento: AsientoContable) => {
    setSelectedAsiento(asiento);
    setShowViewModal(true);
  };

  const handleDeleteClick = (asiento: AsientoContable) => {
    setSelectedAsiento(asiento);
    setShowDeleteModal(true);
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const clearFilters = () => {
    setSearchTerm('');
    setTipoFilter('');
    setFechaDesde('');
    setFechaHasta('');
    setCuentaFilter('');
    setCurrentPage(1);
  };

  // Chart data preparation
  const evolutionData = stats ? [
    { name: 'Ingresos', value: stats.totalIngresos, color: '#10b981' },
    { name: 'Egresos', value: stats.totalEgresos, color: '#ef4444' },
    { name: 'Balance', value: stats.balance, color: '#3b82f6' }
  ] : [];

  const tipoDistribution = stats ? [
    { name: 'Ingresos', value: stats.asientosPorTipo.INGRESO },
    { name: 'Egresos', value: stats.asientosPorTipo.EGRESO },
    { name: 'Traspasos', value: stats.asientosPorTipo.TRASPASO },
    { name: 'Ajustes', value: stats.asientosPorTipo.AJUSTE }
  ] : [];

  // Tabs configuration
  const tabs: Tab[] = [
    { id: 'resumen', label: 'Resumen', icon: BarChart3 },
    { id: 'asientos', label: 'Asientos Contables', icon: FileText },
    ...(permissions.canViewLibroMayor ? [{ id: 'libro-mayor', label: 'Libro Mayor', icon: BookOpen }] : [])
  ];

  // Access denied view
  if (!permissions.canView) {
    return (
      <AppLayout title="Contabilidad" subtitle="Acceso restringido">
        <main className="flex-1 overflow-y-auto p-6 lg:p-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-2xl mx-auto mt-12"
          >
            <div className="p-8 bg-slate-900/60 border border-slate-800 rounded-2xl text-center">
              <div className="w-20 h-20 mx-auto mb-6 bg-slate-800 rounded-full flex items-center justify-center">
                <Lock className="w-10 h-10 text-slate-600" />
              </div>
              <h2 className="text-2xl font-bold text-white mb-2">Acceso Denegado</h2>
              <p className="text-slate-400">
                No tienes permisos para acceder al módulo de contabilidad.
              </p>
            </div>
          </motion.div>
        </main>
      </AppLayout>
    );
  }

  const headerActions = (
    <>
      {permissions.canCreate && (
        <button
          onClick={() => setShowNewEntryModal(true)}
          className="flex items-center gap-2 px-4 py-2 bg-emerald-500 text-slate-950 font-medium rounded-xl hover:bg-emerald-400 transition-colors"
        >
          <Plus className="w-4 h-4" />
          <span className="hidden sm:inline">Nuevo Asiento</span>
        </button>
      )}
    </>
  );

  return (
    <AppLayout
      title="Contabilidad"
      subtitle="Gestión de asientos contables y estados financieros"
      headerActions={headerActions}
    >
      <main className="flex-1 overflow-y-auto p-6 lg:p-8">
        {/* Tabs */}
        <div className="flex items-center gap-2 mb-6 flex-wrap">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                activeTab === tab.id
                  ? 'bg-emerald-500 text-slate-950'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800'
              }`}
            >
              <tab.icon className="w-4 h-4" />
              {tab.label}
            </button>
          ))}
        </div>

        {/* RESUMEN TAB */}
        {activeTab === 'resumen' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            {/* KPI Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="p-5 bg-slate-900/60 border border-slate-800 rounded-2xl">
                <div className="flex items-start justify-between mb-3">
                  <div className="w-10 h-10 rounded-xl bg-emerald-500/20 flex items-center justify-center">
                    <TrendingUp className="w-5 h-5 text-emerald-500" />
                  </div>
                  <div className="flex items-center gap-0.5 text-xs font-medium text-emerald-500">
                    <ArrowUpRight className="w-3 h-3" />
                    Ingresos
                  </div>
                </div>
                <h3 className="text-2xl font-bold text-white mb-0.5">
                  {stats ? formatCurrency(stats.totalIngresos) : '---'}
                </h3>
                <p className="text-slate-400 text-sm">Total ingresos</p>
              </div>

              <div className="p-5 bg-slate-900/60 border border-slate-800 rounded-2xl">
                <div className="flex items-start justify-between mb-3">
                  <div className="w-10 h-10 rounded-xl bg-red-500/20 flex items-center justify-center">
                    <TrendingDown className="w-5 h-5 text-red-500" />
                  </div>
                  <div className="flex items-center gap-0.5 text-xs font-medium text-red-500">
                    <ArrowDownRight className="w-3 h-3" />
                    Egresos
                  </div>
                </div>
                <h3 className="text-2xl font-bold text-white mb-0.5">
                  {stats ? formatCurrency(stats.totalEgresos) : '---'}
                </h3>
                <p className="text-slate-400 text-sm">Total egresos</p>
              </div>

              <div className="p-5 bg-slate-900/60 border border-slate-800 rounded-2xl">
                <div className="flex items-start justify-between mb-3">
                  <div className="w-10 h-10 rounded-xl bg-blue-500/20 flex items-center justify-center">
                    <BadgeEuro className="w-5 h-5 text-blue-500" />
                  </div>
                  <div className="flex items-center gap-0.5 text-xs font-medium text-blue-500">
                    <Wallet className="w-3 h-3" />
                    Balance
                  </div>
                </div>
                <h3 className="text-2xl font-bold text-white mb-0.5">
                  {stats ? formatCurrency(stats.balance) : '---'}
                </h3>
                <p className="text-slate-400 text-sm">Balance neto</p>
              </div>

              <div className="p-5 bg-slate-900/60 border border-slate-800 rounded-2xl">
                <div className="flex items-start justify-between mb-3">
                  <div className="w-10 h-10 rounded-xl bg-purple-500/20 flex items-center justify-center">
                    <FileText className="w-5 h-5 text-purple-500" />
                  </div>
                  <div className="flex items-center gap-0.5 text-xs font-medium text-purple-500">
                    <Calculator className="w-3 h-3" />
                    Total
                  </div>
                </div>
                <h3 className="text-2xl font-bold text-white mb-0.5">
                  {stats ? stats.totalAsientos : '---'}
                </h3>
                <p className="text-slate-400 text-sm">Asientos registrados</p>
              </div>
            </div>

            {/* Charts */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Evolution Chart */}
              <div className="p-6 bg-slate-900/60 border border-slate-800 rounded-2xl">
                <h3 className="text-lg font-semibold text-white mb-4">Evolución Financiera</h3>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={evolutionData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                      <XAxis dataKey="name" stroke="#94a3b8" />
                      <YAxis stroke="#94a3b8" tickFormatter={(value) => formatCurrency(value)} />
                      <Tooltip 
                        contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: '8px' }}
                        formatter={(value: number) => formatCurrency(value)}
                      />
                      <Line type="monotone" dataKey="value" stroke="#10b981" strokeWidth={2} dot={{ fill: '#10b981' }} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Distribution Chart */}
              <div className="p-6 bg-slate-900/60 border border-slate-800 rounded-2xl">
                <h3 className="text-lg font-semibold text-white mb-4">Distribución por Tipo</h3>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <RePieChart>
                      <Pie
                        data={tipoDistribution}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={80}
                        paddingAngle={5}
                        dataKey="value"
                      >
                        {tipoDistribution.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip 
                        contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: '8px' }}
                      />
                      <Legend />
                    </RePieChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>

            {/* Accounts Summary */}
            <div className="p-6 bg-slate-900/60 border border-slate-800 rounded-2xl">
              <h3 className="text-lg font-semibold text-white mb-4">Resumen por Cuenta</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {cuentas.slice(0, 6).map((cuenta) => (
                  <div key={cuenta.codigo} className="p-4 bg-slate-800/50 rounded-xl">
                    <p className="text-xs text-slate-500 mb-1">{cuenta.codigo}</p>
                    <p className="text-sm font-medium text-white mb-2 truncate">{cuenta.nombre}</p>
                    <p className={`text-lg font-bold ${cuenta.total >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                      {formatCurrency(cuenta.total)}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        )}

        {/* ASIENTOS TAB */}
        {activeTab === 'asientos' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            {/* Filters */}
            <div className="p-4 bg-slate-900/60 border border-slate-800 rounded-2xl space-y-4">
              <div className="flex flex-wrap items-center gap-3">
                <div className="flex-1 min-w-[200px]">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input
                      type="text"
                      placeholder="Buscar por concepto o número..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-full pl-10 pr-4 py-2 bg-slate-800 border border-slate-700 rounded-xl text-white text-sm"
                    />
                  </div>
                </div>

                <select
                  value={tipoFilter}
                  onChange={(e) => setTipoFilter(e.target.value as TipoAsiento | '')}
                  className="px-4 py-2 bg-slate-800 border border-slate-700 rounded-xl text-white text-sm"
                >
                  <option value="">Todos los tipos</option>
                  <option value="INGRESO">Ingreso</option>
                  <option value="EGRESO">Egreso</option>
                  <option value="TRASPASO">Traspaso</option>
                  <option value="AJUSTE">Ajuste</option>
                </select>

                <input
                  type="date"
                  value={fechaDesde}
                  onChange={(e) => setFechaDesde(e.target.value)}
                  className="px-4 py-2 bg-slate-800 border border-slate-700 rounded-xl text-white text-sm"
                  placeholder="Desde"
                />

                <input
                  type="date"
                  value={fechaHasta}
                  onChange={(e) => setFechaHasta(e.target.value)}
                  className="px-4 py-2 bg-slate-800 border border-slate-700 rounded-xl text-white text-sm"
                  placeholder="Hasta"
                />

                <button
                  onClick={clearFilters}
                  className="flex items-center gap-2 px-4 py-2 text-slate-400 hover:text-white transition-colors"
                >
                  <Filter className="w-4 h-4" />
                  Limpiar
                </button>
              </div>
            </div>

            {/* Asientos Table */}
            <div className="bg-slate-900/60 border border-slate-800 rounded-2xl overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-slate-800">
                      <th className="px-4 py-3 text-left text-xs font-medium text-slate-400 uppercase">Número</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-slate-400 uppercase">Fecha</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-slate-400 uppercase">Concepto</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-slate-400 uppercase">Tipo</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-slate-400 uppercase">Cuenta</th>
                      <th className="px-4 py-3 text-right text-xs font-medium text-slate-400 uppercase">Importe</th>
                      <th className="px-4 py-3 text-center text-xs font-medium text-slate-400 uppercase">Acciones</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800">
                    {isLoading ? (
                      <tr>
                        <td colSpan={7} className="px-4 py-8 text-center text-slate-400">
                          Cargando...
                        </td>
                      </tr>
                    ) : asientos.length === 0 ? (
                      <tr>
                        <td colSpan={7} className="px-4 py-8 text-center text-slate-400">
                          No se encontraron asientos contables
                        </td>
                      </tr>
                    ) : (
                      asientos.map((asiento) => (
                        <tr key={asiento.id} className="hover:bg-slate-800/50 transition-colors">
                          <td className="px-4 py-3 text-sm text-white font-mono">{asiento.numero}</td>
                          <td className="px-4 py-3 text-sm text-slate-300">{formatDate(asiento.fecha)}</td>
                          <td className="px-4 py-3 text-sm text-white">{asiento.concepto}</td>
                          <td className="px-4 py-3">
                            <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                              asiento.tipo === 'INGRESO' ? 'bg-emerald-500/20 text-emerald-400' :
                              asiento.tipo === 'EGRESO' ? 'bg-red-500/20 text-red-400' :
                              asiento.tipo === 'TRASPASO' ? 'bg-blue-500/20 text-blue-400' :
                              'bg-amber-500/20 text-amber-400'
                            }`}>
                              {asiento.tipo}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-sm text-slate-300">{asiento.cuentaCodigo} - {asiento.cuentaNombre}</td>
                          <td className="px-4 py-3 text-sm font-medium text-right ${asiento.tipo === 'INGRESO' ? 'text-emerald-400' : asiento.tipo === 'EGRESO' ? 'text-red-400' : 'text-white'}">
                            {formatCurrency(asiento.importe)}
                          </td>
                          <td className="px-4 py-3">
                            <div className="flex items-center justify-center gap-2">
                              <button
                                onClick={() => handleViewAsiento(asiento)}
                                className="p-1.5 text-slate-400 hover:text-blue-400 hover:bg-blue-500/20 rounded-lg transition-colors"
                                title="Ver detalle"
                              >
                                <Eye className="w-4 h-4" />
                              </button>
                              {permissions.canDelete && (
                                <button
                                  onClick={() => handleDeleteClick(asiento)}
                                  className="p-1.5 text-slate-400 hover:text-red-400 hover:bg-red-500/20 rounded-lg transition-colors"
                                  title="Eliminar"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              )}
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              <div className="flex items-center justify-between px-4 py-3 border-t border-slate-800">
                <div className="text-sm text-slate-400">
                  Página {currentPage} de {totalPages}
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handlePageChange(currentPage - 1)}
                    disabled={currentPage === 1}
                    className="p-2 text-slate-400 hover:text-white disabled:opacity-50 disabled:cursor-not-allowed rounded-lg hover:bg-slate-800"
                  >
                    <ChevronLeft className="w-5 h-5" />
                  </button>
                  {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                    const page = i + 1;
                    return (
                      <button
                        key={page}
                        onClick={() => handlePageChange(page)}
                        className={`w-8 h-8 rounded-lg text-sm font-medium transition-colors ${
                          currentPage === page
                            ? 'bg-emerald-500 text-slate-950'
                            : 'text-slate-400 hover:text-white hover:bg-slate-800'
                        }`}
                      >
                        {page}
                      </button>
                    );
                  })}
                  <button
                    onClick={() => handlePageChange(currentPage + 1)}
                    disabled={currentPage === totalPages}
                    className="p-2 text-slate-400 hover:text-white disabled:opacity-50 disabled:cursor-not-allowed rounded-lg hover:bg-slate-800"
                  >
                    <ChevronRight className="w-5 h-5" />
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {/* LIBRO MAYOR TAB */}
        {activeTab === 'libro-mayor' && permissions.canViewLibroMayor && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            {/* Account Selector */}
            <div className="p-4 bg-slate-900/60 border border-slate-800 rounded-2xl">
              <div className="flex flex-wrap items-center gap-3">
                <select
                  value={cuentaFilter}
                  onChange={(e) => setCuentaFilter(e.target.value)}
                  className="px-4 py-2 bg-slate-800 border border-slate-700 rounded-xl text-white text-sm min-w-[300px]"
                >
                  <option value="">Seleccione una cuenta...</option>
                  {cuentas.map((cuenta) => (
                    <option key={cuenta.codigo} value={cuenta.codigo}>
                      {cuenta.codigo} - {cuenta.nombre}
                    </option>
                  ))}
                </select>

                <input
                  type="date"
                  value={fechaDesde}
                  onChange={(e) => setFechaDesde(e.target.value)}
                  className="px-4 py-2 bg-slate-800 border border-slate-700 rounded-xl text-white text-sm"
                />

                <input
                  type="date"
                  value={fechaHasta}
                  onChange={(e) => setFechaHasta(e.target.value)}
                  className="px-4 py-2 bg-slate-800 border border-slate-700 rounded-xl text-white text-sm"
                />
              </div>
            </div>

            {/* Libro Mayor Content */}
            {isLoadingLibroMayor ? (
              <div className="p-8 text-center text-slate-400">
                Cargando libro mayor...
              </div>
            ) : libroMayor ? (
              <div className="space-y-4">
                {/* Account Header */}
                <div className="p-6 bg-slate-900/60 border border-slate-800 rounded-2xl">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="text-sm text-slate-500 mb-1">{libroMayor.codigo}</p>
                      <h3 className="text-xl font-bold text-white">{libroMayor.nombre}</h3>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-slate-500 mb-1">Saldo Total</p>
                      <p className={`text-2xl font-bold ${libroMayor.total >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                        {formatCurrency(libroMayor.total)}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Entries Table */}
                <div className="bg-slate-900/60 border border-slate-800 rounded-2xl overflow-hidden">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-slate-800">
                        <th className="px-4 py-3 text-left text-xs font-medium text-slate-400 uppercase">Fecha</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-slate-400 uppercase">Concepto</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-slate-400 uppercase">Referencia</th>
                        <th className="px-4 py-3 text-right text-xs font-medium text-slate-400 uppercase">Debe</th>
                        <th className="px-4 py-3 text-right text-xs font-medium text-slate-400 uppercase">Haber</th>
                        <th className="px-4 py-3 text-right text-xs font-medium text-slate-400 uppercase">Saldo</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800">
                      {libroMayor.asientos.map((asiento, index) => {
                        const runningBalance = libroMayor.asientos
                          .slice(0, index + 1)
                          .reduce((acc, a) => acc + (a.importeDebe || 0) - (a.importeHaber || 0), 0);
                        
                        return (
                          <tr key={asiento.id} className="hover:bg-slate-800/50 transition-colors">
                            <td className="px-4 py-3 text-sm text-slate-300">{formatDate(asiento.fecha)}</td>
                            <td className="px-4 py-3 text-sm text-white">{asiento.concepto}</td>
                            <td className="px-4 py-3 text-sm text-slate-400">{asiento.documentoRef || '-'}</td>
                            <td className="px-4 py-3 text-sm text-right text-emerald-400">
                              {asiento.importeDebe ? formatCurrency(asiento.importeDebe) : '-'}
                            </td>
                            <td className="px-4 py-3 text-sm text-right text-red-400">
                              {asiento.importeHaber ? formatCurrency(asiento.importeHaber) : '-'}
                            </td>
                            <td className="px-4 py-3 text-sm text-right font-medium text-white">
                              {formatCurrency(runningBalance)}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            ) : (
              <div className="p-8 text-center text-slate-400">
                Seleccione una cuenta para ver el libro mayor
              </div>
            )}
          </motion.div>
        )}
      </main>

      {/* Toast Notification */}
      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 50 }}
            className={`fixed bottom-6 right-6 z-50 px-4 py-3 rounded-xl shadow-lg flex items-center gap-3 ${
              toast.type === 'success' ? 'bg-emerald-500' : 
              toast.type === 'error' ? 'bg-red-500' : 'bg-amber-500'
            } text-slate-950 font-medium`}
          >
            {toast.type === 'success' ? <CheckCircle className="w-5 h-5" /> : 
             toast.type === 'error' ? <AlertCircle className="w-5 h-5" /> : <Receipt className="w-5 h-5" />}
            {toast.message}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Modal: Nuevo Asiento */}
      <AnimatePresence>
        {showNewEntryModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => setShowNewEntryModal(false)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto p-6"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-white">Nuevo Asiento Contable</h2>
                <button 
                  onClick={() => setShowNewEntryModal(false)} 
                  className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm text-slate-400 mb-2">Número *</label>
                    <input
                      type="text"
                      value={newEntryForm.numero}
                      onChange={(e) => setNewEntryForm({...newEntryForm, numero: e.target.value})}
                      placeholder="Ej: 001-2024"
                      className="w-full px-4 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-slate-400 mb-2">Fecha *</label>
                    <input
                      type="date"
                      value={newEntryForm.fecha}
                      onChange={(e) => setNewEntryForm({...newEntryForm, fecha: e.target.value})}
                      className="w-full px-4 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-white"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm text-slate-400 mb-2">Concepto *</label>
                  <input
                    type="text"
                    value={newEntryForm.concepto}
                    onChange={(e) => setNewEntryForm({...newEntryForm, concepto: e.target.value})}
                    placeholder="Descripción del asiento..."
                    className="w-full px-4 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-white"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm text-slate-400 mb-2">Tipo *</label>
                    <select
                      value={newEntryForm.tipo}
                      onChange={(e) => setNewEntryForm({...newEntryForm, tipo: e.target.value as TipoAsiento})}
                      className="w-full px-4 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-white"
                    >
                      <option value="INGRESO">Ingreso</option>
                      <option value="EGRESO">Egreso</option>
                      <option value="TRASPASO">Traspaso</option>
                      <option value="AJUSTE">Ajuste</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm text-slate-400 mb-2">Importe *</label>
                    <input
                      type="number"
                      step="0.01"
                      value={newEntryForm.importe}
                      onChange={(e) => setNewEntryForm({...newEntryForm, importe: e.target.value})}
                      placeholder="0.00"
                      className="w-full px-4 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-white"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm text-slate-400 mb-2">Cuenta Contable *</label>
                  <select
                    value={newEntryForm.cuentaCodigo}
                    onChange={(e) => {
                      const cuenta = cuentas.find(c => c.codigo === e.target.value);
                      setNewEntryForm({
                        ...newEntryForm, 
                        cuentaCodigo: e.target.value,
                        cuentaNombre: cuenta?.nombre || ''
                      });
                    }}
                    className="w-full px-4 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-white"
                  >
                    <option value="">Seleccione una cuenta...</option>
                    {cuentas.map((cuenta) => (
                      <option key={cuenta.codigo} value={cuenta.codigo}>
                        {cuenta.codigo} - {cuenta.nombre}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm text-slate-400 mb-2">Debe</label>
                    <input
                      type="number"
                      step="0.01"
                      value={newEntryForm.importeDebe}
                      onChange={(e) => setNewEntryForm({...newEntryForm, importeDebe: e.target.value})}
                      placeholder="0.00"
                      className="w-full px-4 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-slate-400 mb-2">Haber</label>
                    <input
                      type="number"
                      step="0.01"
                      value={newEntryForm.importeHaber}
                      onChange={(e) => setNewEntryForm({...newEntryForm, importeHaber: e.target.value})}
                      placeholder="0.00"
                      className="w-full px-4 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-white"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm text-slate-400 mb-2">Documento de Referencia</label>
                  <input
                    type="text"
                    value={newEntryForm.documentoRef}
                    onChange={(e) => setNewEntryForm({...newEntryForm, documentoRef: e.target.value})}
                    placeholder="Número de factura, recibo, etc."
                    className="w-full px-4 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-white"
                  />
                </div>
              </div>

              <div className="flex gap-3 mt-6">
                <button 
                  onClick={() => setShowNewEntryModal(false)} 
                  className="flex-1 px-4 py-2.5 bg-slate-800 text-white rounded-xl hover:bg-slate-700"
                >
                  Cancelar
                </button>
                <button 
                  onClick={handleCreateAsiento} 
                  className="flex-1 px-4 py-2.5 bg-emerald-500 text-slate-950 font-medium rounded-xl hover:bg-emerald-400"
                >
                  Guardar
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Modal: Ver Asiento */}
      <AnimatePresence>
        {showViewModal && selectedAsiento && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => setShowViewModal(false)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-lg p-6"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-white">Detalle del Asiento</h2>
                <button 
                  onClick={() => setShowViewModal(false)} 
                  className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between p-3 bg-slate-800/50 rounded-xl">
                  <span className="text-slate-400">Número</span>
                  <span className="text-white font-mono">{selectedAsiento.numero}</span>
                </div>

                <div className="flex items-center justify-between p-3 bg-slate-800/50 rounded-xl">
                  <span className="text-slate-400">Fecha</span>
                  <span className="text-white">{formatDate(selectedAsiento.fecha)}</span>
                </div>

                <div className="p-3 bg-slate-800/50 rounded-xl">
                  <span className="text-slate-400 block mb-1">Concepto</span>
                  <span className="text-white">{selectedAsiento.concepto}</span>
                </div>

                <div className="flex items-center justify-between p-3 bg-slate-800/50 rounded-xl">
                  <span className="text-slate-400">Tipo</span>
                  <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                    selectedAsiento.tipo === 'INGRESO' ? 'bg-emerald-500/20 text-emerald-400' :
                    selectedAsiento.tipo === 'EGRESO' ? 'bg-red-500/20 text-red-400' :
                    selectedAsiento.tipo === 'TRASPASO' ? 'bg-blue-500/20 text-blue-400' :
                    'bg-amber-500/20 text-amber-400'
                  }`}>
                    {selectedAsiento.tipo}
                  </span>
                </div>

                <div className="flex items-center justify-between p-3 bg-slate-800/50 rounded-xl">
                  <span className="text-slate-400">Importe</span>
                  <span className="text-xl font-bold text-white">{formatCurrency(selectedAsiento.importe)}</span>
                </div>

                <div className="p-3 bg-slate-800/50 rounded-xl">
                  <span className="text-slate-400 block mb-1">Cuenta</span>
                  <span className="text-white">{selectedAsiento.cuentaCodigo} - {selectedAsiento.cuentaNombre}</span>
                </div>

                {selectedAsiento.documentoRef && (
                  <div className="flex items-center justify-between p-3 bg-slate-800/50 rounded-xl">
                    <span className="text-slate-400">Documento Ref.</span>
                    <span className="text-white">{selectedAsiento.documentoRef}</span>
                  </div>
                )}

                {selectedAsiento.factura && (
                  <div className="flex items-center justify-between p-3 bg-slate-800/50 rounded-xl">
                    <span className="text-slate-400">Factura Relacionada</span>
                    <span className="text-white">{selectedAsiento.factura.numero} - {formatCurrency(selectedAsiento.factura.importe)}</span>
                  </div>
                )}

                {selectedAsiento.gasto && (
                  <div className="flex items-center justify-between p-3 bg-slate-800/50 rounded-xl">
                    <span className="text-slate-400">Gasto Relacionado</span>
                    <span className="text-white">{selectedAsiento.gasto.concepto} - {formatCurrency(selectedAsiento.gasto.importe)}</span>
                  </div>
                )}

                {selectedAsiento.usuario && (
                  <div className="flex items-center justify-between p-3 bg-slate-800/50 rounded-xl">
                    <span className="text-slate-400">Creado por</span>
                    <span className="text-white">{selectedAsiento.usuario.nombre} {selectedAsiento.usuario.apellido1 || ''}</span>
                  </div>
                )}
              </div>

              <button 
                onClick={() => setShowViewModal(false)} 
                className="w-full mt-6 px-4 py-2.5 bg-slate-800 text-white rounded-xl hover:bg-slate-700"
              >
                Cerrar
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Modal: Confirmar Eliminación */}
      <AnimatePresence>
        {showDeleteModal && selectedAsiento && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => setShowDeleteModal(false)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-md p-6"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="text-center mb-6">
                <div className="w-16 h-16 mx-auto mb-4 bg-red-500/20 rounded-full flex items-center justify-center">
                  <Trash2 className="w-8 h-8 text-red-500" />
                </div>
                <h2 className="text-xl font-bold text-white mb-2">¿Eliminar Asiento?</h2>
                <p className="text-slate-400">
                  Estás a punto de eliminar el asiento <strong className="text-white">{selectedAsiento.numero}</strong>. 
                  Esta acción no se puede deshacer.
                </p>
              </div>

              <div className="flex gap-3">
                <button 
                  onClick={() => setShowDeleteModal(false)} 
                  className="flex-1 px-4 py-2.5 bg-slate-800 text-white rounded-xl hover:bg-slate-700"
                >
                  Cancelar
                </button>
                <button 
                  onClick={handleDeleteAsiento} 
                  className="flex-1 px-4 py-2.5 bg-red-500 text-white font-medium rounded-xl hover:bg-red-400"
                >
                  Eliminar
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </AppLayout>
  );
}

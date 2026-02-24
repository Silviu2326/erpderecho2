import { useState, useMemo, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Building2, Search, Plus, Phone, Mail, MapPin, Star,
  FileText, TrendingUp, TrendingDown, AlertCircle, CheckCircle2,
  DollarSign, Edit2, FileDown, User, Lock,
  CheckCircle, X, Trash2, Loader2
} from 'lucide-react';
import { AppLayout } from '@/components/layout/AppLayout';
import { useRole } from '@/hooks/useRole';
import type { UserRole } from '@/types/roles';
import { gastoService, type Proveedor } from '@/services';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';

type ActiveTab = 'proveedores';
type ModalType = 'create' | 'edit' | 'delete' | null;

// Configuración de acceso por rol
const ROLE_ACCESS: Record<UserRole, { 
  hasAccess: boolean; 
  canCreate: boolean; 
  canEdit: boolean; 
  canDelete: boolean;
  description: string;
}> = {
  super_admin: { 
    hasAccess: true, 
    canCreate: true, 
    canEdit: true, 
    canDelete: true,
    description: 'Gestión completa de proveedores'
  },
  socio: { 
    hasAccess: true, 
    canCreate: true, 
    canEdit: true, 
    canDelete: false,
    description: 'Gestión de proveedores'
  },
  abogado_senior: { 
    hasAccess: true, 
    canCreate: false, 
    canEdit: false, 
    canDelete: false,
    description: 'Vista de solo lectura'
  },
  abogado_junior: { 
    hasAccess: true, 
    canCreate: false, 
    canEdit: false, 
    canDelete: false,
    description: 'Vista de solo lectura'
  },
  paralegal: { 
    hasAccess: false, 
    canCreate: false, 
    canEdit: false, 
    canDelete: false,
    description: 'Sin acceso'
  },
  secretario: { 
    hasAccess: false, 
    canCreate: false, 
    canEdit: false, 
    canDelete: false,
    description: 'Sin acceso'
  },
  administrador: { 
    hasAccess: true, 
    canCreate: true, 
    canEdit: true, 
    canDelete: false,
    description: 'Gestión de proveedores'
  },
  contador: { 
    hasAccess: true, 
    canCreate: false, 
    canEdit: false, 
    canDelete: false,
    description: 'Consulta de proveedores'
  },
  recepcionista: { 
    hasAccess: false, 
    canCreate: false, 
    canEdit: false, 
    canDelete: false,
    description: 'Sin acceso'
  },
};

const COLORS = ['#f59e0b', '#10b981', '#3b82f6', '#8b5cf6', '#ec4899', '#06b6d4', '#84cc16'];

// Títulos por rol
const ROLE_TITLES: Record<UserRole, { title: string; subtitle: string }> = {
  super_admin: { title: 'Gestión de Proveedores', subtitle: 'Administración completa' },
  socio: { title: 'Proveedores', subtitle: 'Gestión de proveedores' },
  abogado_senior: { title: 'Directorio', subtitle: 'Consulta de proveedores' },
  abogado_junior: { title: 'Directorio', subtitle: 'Consulta de proveedores' },
  paralegal: { title: 'Sin Acceso', subtitle: 'No tienes permisos' },
  secretario: { title: 'Sin Acceso', subtitle: 'No tienes permisos' },
  administrador: { title: 'Proveedores', subtitle: 'Gestión administrativa' },
  contador: { title: 'Proveedores', subtitle: 'Consulta de datos' },
  recepcionista: { title: 'Sin Acceso', subtitle: 'No tienes permisos' },
};

export default function Proveedores() {
  const { role, roleName } = useRole();
  
  const [activeTab, setActiveTab] = useState<ActiveTab>('proveedores');
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedProveedor, setSelectedProveedor] = useState<Proveedor | null>(null);
  const [activeModal, setActiveModal] = useState<ModalType>(null);
  const [editingProveedor, setEditingProveedor] = useState<Proveedor | null>(null);
  const [toast, setToast] = useState<{message: string; type: 'success' | 'error'} | null>(null);
  
  // Estados para datos del backend
  const [proveedores, setProveedores] = useState<Proveedor[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Permisos según rol
  const permissions = useMemo(() => ROLE_ACCESS[role], [role]);

  // Cargar proveedores del backend
  const loadProveedores = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await gastoService.getProveedores({ limit: 1000 });
      setProveedores(response.data);
    } catch (err) {
      console.error('Error cargando proveedores:', err);
      setError('Error al cargar los proveedores');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadProveedores();
  }, [loadProveedores]);

  const showToast = (message: string, type: 'success' | 'error' = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  // Handlers
  const handleDeleteProveedor = async () => {
    if (!editingProveedor) return;
    
    try {
      await gastoService.deleteProveedor(editingProveedor.id);
      setProveedores(prev => prev.filter(p => p.id !== editingProveedor.id));
      if (selectedProveedor?.id === editingProveedor.id) {
        setSelectedProveedor(null);
      }
      setActiveModal(null);
      setEditingProveedor(null);
      showToast('Proveedor eliminado correctamente');
    } catch (err) {
      showToast('Error al eliminar el proveedor', 'error');
    }
  };

  const handleExportData = () => {
    showToast('Exportando datos...');
    // TODO: Implementar exportación real
    setTimeout(() => {
      showToast('Exportación completada');
    }, 1500);
  };

  // Filtrar proveedores
  const filteredProveedores = useMemo(() => {
    return proveedores.filter(p => {
      const matchesSearch = 
        p.nombre.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.cif?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.contactoNombre?.toLowerCase().includes(searchQuery.toLowerCase());
      
      const matchesStatus = statusFilter === 'all' || 
        (statusFilter === 'active' && p.activo) ||
        (statusFilter === 'inactive' && !p.activo);
      
      return matchesSearch && matchesStatus;
    });
  }, [proveedores, searchQuery, statusFilter]);

  // Calcular estadísticas
  const stats = useMemo(() => {
    const total = proveedores.length;
    const activos = proveedores.filter(p => p.activo).length;
    const conGastos = proveedores.filter(p => (p._count?.gastos || 0) > 0).length;
    
    return {
      total,
      activos,
      inactivos: total - activos,
      conGastos,
    };
  }, [proveedores]);

  // Mensaje de acceso denegado
  const getRoleMessage = () => {
    const messages: Record<UserRole, { title: string; description: string; actions: string[] }> = {
      super_admin: {
        title: 'Gestión Completa',
        description: 'Puedes crear, editar y eliminar proveedores.',
        actions: ['Crear proveedores', 'Editar información', 'Eliminar proveedores', 'Exportar datos']
      },
      socio: {
        title: 'Gestión de Proveedores',
        description: 'Puedes crear y gestionar proveedores.',
        actions: ['Crear proveedores', 'Editar proveedores', 'Exportar datos']
      },
      abogado_senior: {
        title: 'Consulta de Proveedores',
        description: 'Puedes consultar información de proveedores.',
        actions: ['Ver lista de proveedores', 'Ver información de contacto']
      },
      abogado_junior: {
        title: 'Consulta de Proveedores',
        description: 'Puedes consultar información de proveedores.',
        actions: ['Ver lista de proveedores']
      },
      paralegal: {
        title: 'Sin Acceso',
        description: 'No tienes acceso a proveedores.',
        actions: ['Accede a Documentos']
      },
      secretario: {
        title: 'Sin Acceso',
        description: 'No tienes acceso a proveedores.',
        actions: ['Gestiona agenda']
      },
      administrador: {
        title: 'Gestión de Proveedores',
        description: 'Puedes gestionar proveedores administrativos.',
        actions: ['Crear proveedores', 'Editar proveedores', 'Exportar datos']
      },
      contador: {
        title: 'Consulta de Proveedores',
        description: 'Puedes consultar información de proveedores.',
        actions: ['Ver proveedores', 'Exportar datos']
      },
      recepcionista: {
        title: 'Sin Acceso',
        description: 'No tienes acceso a proveedores.',
        actions: ['Gestiona recepción']
      },
    };
    return messages[role] || messages.recepcionista;
  };

  // Si no tiene acceso
  if (!permissions.hasAccess) {
    const message = getRoleMessage();
    return (
      <AppLayout title="Proveedores" subtitle="Acceso restringido">
        <main className="flex-1 overflow-y-auto p-6 lg:p-8">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-2xl mx-auto mt-12"
          >
            <div className="p-8 bg-theme-card/60 border border-theme rounded-2xl text-center">
              <div className="w-20 h-20 mx-auto mb-6 bg-theme-tertiary rounded-full flex items-center justify-center">
                <Lock className="w-10 h-10 text-theme-tertiary" />
              </div>
              <h2 className="text-2xl font-bold text-theme-primary mb-2">{message.title}</h2>
              <p className="text-theme-secondary mb-6">{message.description}</p>
              
              <div className="p-4 bg-theme-tertiary/50 rounded-xl text-left">
                <p className="text-sm font-medium text-theme-secondary mb-3">Acciones disponibles:</p>
                <ul className="space-y-2">
                  {message.actions.map((action, idx) => (
                    <li key={idx} className="flex items-center gap-2 text-sm text-theme-secondary">
                      <div className="w-1.5 h-1.5 bg-amber-500 rounded-full" />
                      {action}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </motion.div>
        </main>
      </AppLayout>
    );
  }

  // Mostrar loading
  if (loading) {
    return (
      <AppLayout title="Proveedores" subtitle="Cargando...">
        <main className="flex-1 overflow-y-auto p-6 lg:p-8 flex items-center justify-center">
          <div className="text-center">
            <Loader2 className="w-12 h-12 text-accent animate-spin mx-auto mb-4" />
            <p className="text-theme-secondary">Cargando proveedores...</p>
          </div>
        </main>
      </AppLayout>
    );
  }

  // Mostrar error
  if (error) {
    return (
      <AppLayout title="Proveedores" subtitle="Error">
        <main className="flex-1 overflow-y-auto p-6 lg:p-8 flex items-center justify-center">
          <div className="text-center max-w-md">
            <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-theme-primary mb-2">Error</h3>
            <p className="text-theme-secondary mb-4">{error}</p>
            <button 
              onClick={loadProveedores}
              className="px-4 py-2 bg-accent text-white rounded-xl hover:bg-accent-hover transition-colors"
            >
              Reintentar
            </button>
          </div>
        </main>
      </AppLayout>
    );
  }

  const { title, subtitle } = ROLE_TITLES[role];

  const headerActions = (
    <>
      <button 
        onClick={handleExportData}
        className="hidden sm:flex items-center gap-2 px-4 py-2 bg-theme-card text-theme-primary font-medium rounded-xl hover:bg-theme-hover transition-colors border border-theme"
      >
        <FileDown className="w-4 h-4" />
        <span className="hidden lg:inline">Exportar</span>
      </button>
      {permissions.canCreate && (
        <button 
          onClick={() => setActiveModal('create')}
          className="hidden sm:flex items-center gap-2 px-4 py-2 bg-amber-500 text-slate-950 font-medium rounded-xl hover:bg-amber-400 transition-colors"
        >
          <Plus className="w-4 h-4" />
          <span className="hidden lg:inline">Nuevo Proveedor</span>
        </button>
      )}
    </>
  );

  return (
    <AppLayout 
      title={title}
      subtitle={subtitle}
      headerActions={headerActions}
    >
      <main className="flex-1 overflow-y-auto p-6 lg:p-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
          {[
            { label: 'Total Proveedores', value: stats.total, color: 'slate', icon: Building2 },
            { label: 'Activos', value: stats.activos, color: 'emerald', icon: CheckCircle2 },
            { label: 'Inactivos', value: stats.inactivos, color: 'red', icon: AlertCircle },
            { label: 'Con Gastos', value: stats.conGastos, color: 'blue', icon: TrendingUp },
          ].map((stat, idx) => (
            <motion.div 
              key={stat.label}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.05 }}
              className="p-4 bg-theme-card border border-theme rounded-xl hover:border-amber-500/30 transition-all"
            >
              <div className="flex items-start justify-between">
                <div className={`w-10 h-10 rounded-lg bg-${stat.color}-500/10 flex items-center justify-center`}>
                  <stat.icon className={`w-5 h-5 text-${stat.color}-400`} />
                </div>
              </div>
              <div className="mt-3">
                <p className="text-xl font-bold text-theme-primary">{stat.value}</p>
                <p className="text-xs text-theme-secondary">{stat.label}</p>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Search and Filters */}
        <div className="mb-6 flex flex-col lg:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-theme-tertiary" />
            <input
              type="text"
              placeholder="Buscar proveedores..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-4 py-3 bg-theme-card border border-theme rounded-xl text-theme-primary placeholder-theme-tertiary focus:outline-none focus:border-amber-500 transition-colors"
            />
          </div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-4 py-3 bg-theme-card border border-theme rounded-xl text-theme-primary focus:outline-none focus:border-amber-500 transition-colors"
          >
            <option value="all">Todos los estados</option>
            <option value="active">Activo</option>
            <option value="inactive">Inactivo</option>
          </select>
        </div>

        {/* Grid de Proveedores */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredProveedores.map((proveedor, index) => (
            <motion.div
              key={proveedor.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.03 }}
              className="p-6 bg-theme-card/60 border border-theme rounded-2xl hover:border-amber-500/30 transition-colors group"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-gradient-to-br from-amber-500 to-amber-600 rounded-xl flex items-center justify-center text-xl font-bold text-slate-950">
                    {proveedor.nombre.substring(0, 2).toUpperCase()}
                  </div>
                  <div>
                    <h3 className="font-semibold text-theme-primary">{proveedor.nombre}</h3>
                    <p className="text-sm text-theme-secondary">{proveedor.cif || 'Sin CIF'}</p>
                  </div>
                </div>
                <span className={`px-3 py-1 text-xs font-medium rounded-full ${
                  proveedor.activo 
                    ? 'bg-emerald-500/10 text-emerald-400' 
                    : 'bg-red-500/10 text-red-400'
                }`}>
                  {proveedor.activo ? 'Activo' : 'Inactivo'}
                </span>
              </div>

              <div className="space-y-2 text-sm mb-4">
                {proveedor.ciudad && (
                  <p className="text-theme-secondary flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-theme-tertiary" />
                    {proveedor.ciudad}, {proveedor.provincia}
                  </p>
                )}
                {proveedor.telefono && (
                  <p className="text-theme-secondary flex items-center gap-2">
                    <Phone className="w-4 h-4 text-theme-tertiary" />
                    {proveedor.telefono}
                  </p>
                )}
                {proveedor.contactoNombre && (
                  <p className="text-theme-secondary flex items-center gap-2">
                    <User className="w-4 h-4 text-theme-tertiary" />
                    {proveedor.contactoNombre}
                  </p>
                )}
              </div>

              <div className="flex items-center justify-between pt-4 border-t border-theme">
                <div className="text-right">
                  <p className="text-lg font-bold text-theme-primary">{proveedor._count?.gastos || 0}</p>
                  <p className="text-xs text-theme-secondary">Gastos</p>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="mt-4 pt-4 border-t border-theme flex gap-2">
                <button 
                  onClick={() => setSelectedProveedor(proveedor)}
                  className="flex-1 py-2 bg-theme-tertiary text-theme-primary text-sm font-medium rounded-lg hover:bg-theme-hover transition-colors"
                >
                  Ver detalles
                </button>
                {permissions.canEdit && (
                  <button 
                    onClick={() => { setEditingProveedor(proveedor); setActiveModal('edit'); }}
                    className="px-3 py-2 bg-amber-500/10 text-amber-400 rounded-lg hover:bg-amber-500/20 transition-colors"
                    title="Editar"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                )}
                {permissions.canDelete && (
                  <button 
                    onClick={() => { setEditingProveedor(proveedor); setActiveModal('delete'); }}
                    className="px-3 py-2 bg-red-500/10 text-red-400 rounded-lg hover:bg-red-500/20 transition-colors"
                    title="Eliminar"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>
            </motion.div>
          ))}
        </div>

        {filteredProveedores.length === 0 && (
          <div className="text-center py-16">
            <Building2 className="w-16 h-16 text-theme-tertiary mx-auto mb-4" />
            <p className="text-theme-secondary font-medium">No se encontraron proveedores</p>
            <p className="text-theme-muted text-sm mt-1">Intenta ajustar los filtros de búsqueda</p>
          </div>
        )}

        {/* Modal Confirmar Eliminación */}
        <AnimatePresence>
          {activeModal === 'delete' && editingProveedor && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
              onClick={() => { setActiveModal(null); setEditingProveedor(null); }}
            >
              <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 20 }}
                onClick={(e) => e.stopPropagation()}
                className="bg-theme-card border border-theme rounded-2xl max-w-md w-full p-6"
              >
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 bg-red-500/10 rounded-full flex items-center justify-center">
                    <Trash2 className="w-6 h-6 text-red-500" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-theme-primary">Eliminar Proveedor</h3>
                    <p className="text-sm text-theme-secondary">Esta acción no se puede deshacer</p>
                  </div>
                </div>
                
                <p className="text-theme-secondary mb-6">
                  ¿Estás seguro de que deseas eliminar a <strong className="text-theme-primary">{editingProveedor.nombre}</strong>?
                </p>

                <div className="flex justify-end gap-3">
                  <button 
                    onClick={() => { setActiveModal(null); setEditingProveedor(null); }}
                    className="px-4 py-2 text-theme-secondary hover:text-theme-primary transition-colors"
                  >
                    Cancelar
                  </button>
                  <button 
                    onClick={handleDeleteProveedor}
                    className="px-4 py-2 bg-red-500 text-white font-medium rounded-xl hover:bg-red-400 transition-colors flex items-center gap-2"
                  >
                    <Trash2 className="w-4 h-4" />
                    Eliminar
                  </button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Toast Notifications */}
        <AnimatePresence>
          {toast && (
            <motion.div
              initial={{ opacity: 0, y: 50, x: '-50%' }}
              animate={{ opacity: 1, y: 0, x: '-50%' }}
              exit={{ opacity: 0, y: 20, x: '-50%' }}
              className={`fixed bottom-6 left-1/2 z-50 px-6 py-3 rounded-xl shadow-lg flex items-center gap-3 ${
                toast.type === 'success' ? 'bg-emerald-500 text-slate-950' : 'bg-red-500 text-white'
              }`}
            >
              {toast.type === 'success' ? <CheckCircle className="w-5 h-5" /> : <AlertCircle className="w-5 h-5" />}
              <span className="font-medium">{toast.message}</span>
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </AppLayout>
  );
}

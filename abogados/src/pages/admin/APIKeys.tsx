import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Plus, Search, Eye, Edit3, Trash2, X, Key, Copy, RefreshCw,
  CheckCircle, AlertTriangle, Info, Clock, Shield, Zap
} from 'lucide-react';
import { AppLayout } from '@/components/layout/AppLayout';

type ModalType = 'view' | 'edit' | 'delete' | 'create' | null;

interface APIKey {
  id: number;
  nombre: string;
  clave: string;
  servicio: 'openai' | 'anthropic' | 'google' | 'stripe' | 'aws' | 'other';
  permisos: string[];
  estado: 'activa' | 'inactiva' | 'expirada';
  fechaCreacion: string;
  fechaExpiracion: string;
  ultimoUso: string;
  peticiones: number;
}

const initialAPIKeys: APIKey[] = [
  {
    id: 1,
    nombre: 'Producción Principal',
    clave: 'sk-live-****************************3f7a',
    servicio: 'openai',
    permisos: ['chat', 'embeddings', 'images'],
    estado: 'activa',
    fechaCreacion: '2024-06-15',
    fechaExpiracion: '2025-06-15',
    ultimoUso: '2026-03-10 14:35',
    peticiones: 15420,
  },
  {
    id: 2,
    nombre: 'Desarrollo Local',
    clave: 'sk-test-****************************8b2c',
    servicio: 'openai',
    permisos: ['chat', 'embeddings'],
    estado: 'activa',
    fechaCreacion: '2024-08-20',
    fechaExpiracion: '2025-08-20',
    ultimoUso: '2026-03-09 18:45',
    peticiones: 3250,
  },
  {
    id: 3,
    nombre: 'Stripe Payments',
    clave: 'sk_live_****************************9d1e',
    servicio: 'stripe',
    permisos: ['payments', 'webhooks'],
    estado: 'activa',
    fechaCreacion: '2024-03-01',
    fechaExpiracion: '2026-03-01',
    ultimoUso: '2026-03-10 10:22',
    peticiones: 8950,
  },
  {
    id: 4,
    nombre: 'Anthropic Claude',
    clave: 'sk-ant-****************************2x9f',
    servicio: 'anthropic',
    permisos: ['chat'],
    estado: 'inactiva',
    fechaCreacion: '2024-09-10',
    fechaExpiracion: '2025-09-10',
    ultimoUso: '2026-02-28 16:30',
    peticiones: 1200,
  },
  {
    id: 5,
    nombre: 'AWS Production',
    clave: 'AKIA****************************7k4m',
    servicio: 'aws',
    permisos: ['s3', 'lambda', 'cloudfront'],
    estado: 'activa',
    fechaCreacion: '2024-01-15',
    fechaExpiracion: '2025-01-15',
    ultimoUso: '2026-03-10 12:00',
    peticiones: 45000,
  },
];

const servicios = ['openai', 'anthropic', 'google', 'stripe', 'aws', 'other'];
const permisosDisponibles: Record<string, string[]> = {
  openai: ['chat', 'embeddings', 'images', 'audio', 'moderation'],
  anthropic: ['chat', 'vision', 'claude'],
  google: ['gemini', 'vision', 'speech'],
  stripe: ['payments', 'webhooks', 'subscriptions'],
  aws: ['s3', 'lambda', 'cloudfront', 'ec2', 'rds'],
  other: ['custom'],
};

const getServicioBadge = (servicio: string) => {
  const styles: Record<string, string> = {
    openai: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
    anthropic: 'bg-purple-500/10 text-purple-400 border-purple-500/20',
    google: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
    stripe: 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20',
    aws: 'bg-orange-500/10 text-orange-400 border-orange-500/20',
    other: 'bg-slate-500/10 text-slate-400 border-slate-500/20',
  };
  const labels: Record<string, string> = {
    openai: 'OpenAI',
    anthropic: 'Anthropic',
    google: 'Google',
    stripe: 'Stripe',
    aws: 'AWS',
    other: 'Otro',
  };
  return { style: styles[servicio] || styles.other, label: labels[servicio] || servicio };
};

const getEstadoBadge = (estado: string) => {
  const styles: Record<string, string> = {
    activa: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
    inactiva: 'bg-slate-500/10 text-slate-400 border-slate-500/20',
    expirada: 'bg-red-500/10 text-red-400 border-red-500/20',
  };
  const labels: Record<string, string> = {
    activa: 'Activa',
    inactiva: 'Inactiva',
    expirada: 'Expirada',
  };
  return { style: styles[estado] || styles.inactiva, label: labels[estado] || estado };
};

const getServicioIcon = (servicio: string) => {
  const icons: Record<string, string> = {
    openai: '🤖',
    anthropic: '🧠',
    google: '🔷',
    stripe: '💳',
    aws: '☁️',
    other: '🔑',
  };
  return icons[servicio] || '🔑';
};

export default function APIKeys() {
  const [apiKeys, setAPIKeys] = useState<APIKey[]>(initialAPIKeys);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterServicio, setFilterServicio] = useState('all');
  const [filterEstado, setFilterEstado] = useState('all');
  const [activeModal, setActiveModal] = useState<ModalType>(null);
  const [selectedKey, setSelectedKey] = useState<APIKey | null>(null);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'info' | 'error' } | null>(null);
  const [showKey, setShowKey] = useState<number | null>(null);
  
  const [newKeyForm, setNewKeyForm] = useState({
    nombre: '',
    clave: '',
    servicio: '',
    permisos: [] as string[],
    fechaExpiracion: '',
  });

  const [editKeyForm, setEditKeyForm] = useState({
    nombre: '',
    estado: '',
    permisos: [] as string[],
    fechaExpiracion: '',
  });

  const showToast = (message: string, type: 'success' | 'info' | 'error' = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  const filteredKeys = apiKeys.filter(key => {
    const matchesSearch = 
      key.nombre.toLowerCase().includes(searchQuery.toLowerCase()) ||
      key.servicio.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesServicio = filterServicio === 'all' || key.servicio === filterServicio;
    const matchesEstado = filterEstado === 'all' || key.estado === filterEstado;
    return matchesSearch && matchesServicio && matchesEstado;
  });

  const stats = {
    total: apiKeys.length,
    activas: apiKeys.filter(k => k.estado === 'activa').length,
    peticionesTotal: apiKeys.reduce((acc, k) => acc + k.peticiones, 0),
    proximaExpiracion: apiKeys.filter(k => {
      const expDate = new Date(k.fechaExpiracion);
      const thirtyDaysFromNow = new Date();
      thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30);
      return expDate <= thirtyDaysFromNow && expDate > new Date();
    }).length,
  };

  const handleCreateKey = () => {
    if (!newKeyForm.nombre || !newKeyForm.clave || !newKeyForm.servicio) {
      showToast('Por favor completa los campos obligatorios', 'error');
      return;
    }
    
    const newKey: APIKey = {
      id: Date.now(),
      nombre: newKeyForm.nombre,
      clave: newKeyForm.clave,
      servicio: newKeyForm.servicio as APIKey['servicio'],
      permisos: newKeyForm.permisos,
      estado: 'activa',
      fechaCreacion: new Date().toISOString().split('T')[0],
      fechaExpiracion: newKeyForm.fechaExpiracion || new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      ultimoUso: 'Nunca',
      peticiones: 0,
    };
    
    setAPIKeys([newKey, ...apiKeys]);
    setNewKeyForm({ nombre: '', clave: '', servicio: '', permisos: [], fechaExpiracion: '' });
    setActiveModal(null);
    showToast('Clave API creada correctamente');
  };

  const handleEditKey = () => {
    if (!selectedKey) return;
    
    setAPIKeys(apiKeys.map(k => 
      k.id === selectedKey.id 
        ? { 
            ...k, 
            nombre: editKeyForm.nombre || k.nombre, 
            estado: editKeyForm.estado as APIKey['estado'] || k.estado,
            permisos: editKeyForm.permisos.length > 0 ? editKeyForm.permisos : k.permisos,
            fechaExpiracion: editKeyForm.fechaExpiracion || k.fechaExpiracion,
          } 
        : k
    ));
    
    setActiveModal(null);
    setSelectedKey(null);
    showToast('Clave API actualizada correctamente');
  };

  const handleDeleteKey = () => {
    if (!selectedKey) return;
    if (confirm(`¿Eliminar la clave API "${selectedKey.nombre}"? Esta acción no se puede deshacer.`)) {
      setAPIKeys(apiKeys.filter(k => k.id !== selectedKey.id));
      setActiveModal(null);
      setSelectedKey(null);
      showToast('Clave API eliminada');
    }
  };

  const handleToggleKey = (key: APIKey) => {
    const newEstado = key.estado === 'activa' ? 'inactiva' : 'activa';
    setAPIKeys(apiKeys.map(k => 
      k.id === key.id ? { ...k, estado: newEstado } : k
    ));
    showToast(`Clave API ${newEstado === 'activa' ? 'activada' : 'desactivada'} correctamente`);
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    showToast('Copiado al portapapeles', 'success');
  };

  const regenerateKey = (key: APIKey) => {
    const newClave = key.clave.replace(/[*]+[a-f0-9]+$/, `****${Math.random().toString(16).slice(2, 6)}`);
    setAPIKeys(apiKeys.map(k => 
      k.id === key.id ? { ...k, clave: newClave } : k
    ));
    showToast('Clave API regenerada correctamente');
  };

  const openEditModal = (key: APIKey) => {
    setSelectedKey(key);
    setEditKeyForm({
      nombre: key.nombre,
      estado: key.estado,
      permisos: key.permisos,
      fechaExpiracion: key.fechaExpiracion,
    });
    setActiveModal('edit');
  };

  const openViewModal = (key: APIKey) => {
    setSelectedKey(key);
    setActiveModal('view');
  };

  const togglePermiso = (permiso: string, form: 'new' | 'edit') => {
    if (form === 'new') {
      setNewKeyForm(prev => ({
        ...prev,
        permisos: prev.permisos.includes(permiso)
          ? prev.permisos.filter(p => p !== permiso)
          : [...prev.permisos, permiso]
      }));
    } else {
      setEditKeyForm(prev => ({
        ...prev,
        permisos: prev.permisos.includes(permiso)
          ? prev.permisos.filter(p => p !== permiso)
          : [...prev.permisos, permiso]
      }));
    }
  };

  const headerActions = (
    <button
      onClick={() => setActiveModal('create')}
      className="hidden sm:flex items-center gap-2 px-4 py-2 bg-blue-500 text-white font-medium rounded-xl hover:bg-blue-400 transition-colors"
    >
      <Plus className="w-4 h-4" />
      <span className="hidden lg:inline">Nueva Clave API</span>
    </button>
  );

  return (
    <AppLayout
      title="Claves API"
      subtitle="Gestión de claves API del bufete"
      headerActions={headerActions}
    >
      <main className="flex-1 overflow-y-auto p-6 lg:p-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6"
        >
          <div className="p-5 bg-slate-900/60 border border-slate-800 rounded-2xl hover:border-blue-500/30 transition-all">
            <div className="flex items-start justify-between mb-3">
              <div className="w-10 h-10 rounded-xl bg-blue-500/20 flex items-center justify-center">
                <Key className="w-5 h-5 text-blue-500" />
              </div>
            </div>
            <h3 className="text-2xl font-bold text-white mb-0.5">{stats.total}</h3>
            <p className="text-slate-400 text-sm">Total Claves</p>
          </div>

          <div className="p-5 bg-slate-900/60 border border-slate-800 rounded-2xl hover:border-emerald-500/30 transition-all">
            <div className="flex items-start justify-between mb-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/20 flex items-center justify-center">
                <Shield className="w-5 h-5 text-emerald-500" />
              </div>
              <span className="text-xs text-emerald-500 font-medium">{Math.round((stats.activas / stats.total) * 100)}%</span>
            </div>
            <h3 className="text-2xl font-bold text-white mb-0.5">{stats.activas}</h3>
            <p className="text-slate-400 text-sm">Activas</p>
          </div>

          <div className="p-5 bg-slate-900/60 border border-slate-800 rounded-2xl hover:border-purple-500/30 transition-all">
            <div className="flex items-start justify-between mb-3">
              <div className="w-10 h-10 rounded-xl bg-purple-500/20 flex items-center justify-center">
                <Zap className="w-5 h-5 text-purple-500" />
              </div>
            </div>
            <h3 className="text-2xl font-bold text-white mb-0.5">{stats.peticionesTotal.toLocaleString()}</h3>
            <p className="text-slate-400 text-sm">Peticiones Totales</p>
          </div>

          <div className="p-5 bg-slate-900/60 border border-slate-800 rounded-2xl hover:border-amber-500/30 transition-all">
            <div className="flex items-start justify-between mb-3">
              <div className="w-10 h-10 rounded-xl bg-amber-500/20 flex items-center justify-center">
                <Clock className="w-5 h-5 text-amber-500" />
              </div>
            </div>
            <h3 className="text-2xl font-bold text-white mb-0.5">{stats.proximaExpiracion}</h3>
            <p className="text-slate-400 text-sm">Por Expirar (30 días)</p>
          </div>
        </motion.div>

        <div className="bg-slate-900/60 border border-slate-800 rounded-2xl overflow-hidden">
          <div className="p-4 border-b border-slate-800 flex flex-col lg:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
              <input
                type="text"
                placeholder="Buscar claves API..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-4 py-2 bg-slate-800 border border-slate-700 rounded-xl text-white text-sm placeholder-slate-500 focus:outline-none focus:border-blue-500 transition-colors"
              />
            </div>
            <div className="flex gap-3 flex-wrap">
              <select 
                value={filterServicio}
                onChange={(e) => setFilterServicio(e.target.value)}
                className="px-4 py-2 bg-slate-800 border border-slate-700 rounded-xl text-white text-sm"
              >
                <option value="all">Todos los servicios</option>
                {servicios.map(serv => (
                  <option key={serv} value={serv}>{getServicioBadge(serv).label}</option>
                ))}
              </select>
              <select 
                value={filterEstado}
                onChange={(e) => setFilterEstado(e.target.value)}
                className="px-4 py-2 bg-slate-800 border border-slate-700 rounded-xl text-white text-sm"
              >
                <option value="all">Todos los estados</option>
                <option value="activa">Activas</option>
                <option value="inactiva">Inactivas</option>
                <option value="expirada">Expiradas</option>
              </select>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-800 bg-slate-900/80">
                  <th className="text-left py-3 px-4 text-xs font-medium text-slate-400 uppercase">Nombre</th>
                  <th className="text-left py-3 px-4 text-xs font-medium text-slate-400 uppercase">Servicio</th>
                  <th className="text-left py-3 px-4 text-xs font-medium text-slate-400 uppercase">Clave</th>
                  <th className="text-left py-3 px-4 text-xs font-medium text-slate-400 uppercase">Estado</th>
                  <th className="text-left py-3 px-4 text-xs font-medium text-slate-400 uppercase">Expiración</th>
                  <th className="text-left py-3 px-4 text-xs font-medium text-slate-400 uppercase">Peticiones</th>
                  <th className="text-left py-3 px-4 text-xs font-medium text-slate-400 uppercase"></th>
                </tr>
              </thead>
              <tbody>
                {filteredKeys.map((key, index) => (
                  <motion.tr
                    key={key.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.03 }}
                    className="border-b border-slate-800/50 hover:bg-slate-800/30 transition-colors group"
                  >
                    <td className="py-3 px-4">
                      <span className="text-sm font-medium text-white block">{key.nombre}</span>
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2">
                        <span className="text-lg">{getServicioIcon(key.servicio)}</span>
                        <span className={`px-2.5 py-1 text-xs font-medium rounded-full border ${getServicioBadge(key.servicio).style}`}>
                          {getServicioBadge(key.servicio).label}
                        </span>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2">
                        <code className="text-sm text-slate-400 font-mono">
                          {showKey === key.id ? key.clave : key.clave.replace(/./g, '*')}
                        </code>
                        <button
                          onClick={() => setShowKey(showKey === key.id ? null : key.id)}
                          className="p-1 text-slate-500 hover:text-white transition-colors"
                          title={showKey === key.id ? 'Ocultar' : 'Mostrar'}
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => copyToClipboard(key.clave)}
                          className="p-1 text-slate-500 hover:text-blue-400 transition-colors"
                          title="Copiar"
                        >
                          <Copy className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <span className={`px-2.5 py-1 text-xs font-medium rounded-full border ${getEstadoBadge(key.estado).style}`}>
                        {getEstadoBadge(key.estado).label}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <span className="text-sm text-slate-400">{key.fechaExpiracion}</span>
                    </td>
                    <td className="py-3 px-4">
                      <span className="text-sm text-slate-400">{key.peticiones.toLocaleString()}</span>
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button 
                          onClick={() => openViewModal(key)}
                          className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-700 rounded-lg" 
                          title="Ver"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button 
                          onClick={() => openEditModal(key)}
                          className="p-1.5 text-slate-400 hover:text-blue-400 hover:bg-blue-500/10 rounded-lg" 
                          title="Editar"
                        >
                          <Edit3 className="w-4 h-4" />
                        </button>
                        <button 
                          onClick={() => handleToggleKey(key)}
                          className="p-1.5 text-slate-400 hover:text-amber-400 hover:bg-amber-500/10 rounded-lg" 
                          title={key.estado === 'activa' ? 'Desactivar' : 'Activar'}
                        >
                          <Shield className="w-4 h-4" />
                        </button>
                        <button 
                          onClick={() => regenerateKey(key)}
                          className="p-1.5 text-slate-400 hover:text-purple-400 hover:bg-purple-500/10 rounded-lg" 
                          title="Regenerar"
                        >
                          <RefreshCw className="w-4 h-4" />
                        </button>
                        <button 
                          onClick={() => { setSelectedKey(key); setActiveModal('delete'); }}
                          className="p-1.5 text-slate-400 hover:text-red-400 hover:bg-red-500/10 rounded-lg" 
                          title="Eliminar"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="p-4 border-t border-slate-800 flex items-center justify-between">
            <p className="text-sm text-slate-400">
              Mostrando {filteredKeys.length} de {apiKeys.length} claves API
            </p>
          </div>
        </div>
      </main>

      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 50 }}
            className={`fixed bottom-6 right-6 z-50 px-4 py-3 rounded-xl shadow-lg flex items-center gap-3 ${
              toast.type === 'success' ? 'bg-emerald-500' : 
              toast.type === 'error' ? 'bg-red-500' : 'bg-blue-500'
            } text-slate-950 font-medium`}
          >
            {toast.type === 'success' ? <CheckCircle className="w-5 h-5" /> : 
             toast.type === 'error' ? <AlertTriangle className="w-5 h-5" /> : <Info className="w-5 h-5" />}
            {toast.message}
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {activeModal === 'create' && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => setActiveModal(null)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-lg p-6"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-white">Nueva Clave API</h2>
                <button onClick={() => setActiveModal(null)} className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg">
                  <X className="w-5 h-5" />
                </button>
              </div>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm text-slate-400 mb-2">Nombre *</label>
                  <input 
                    type="text" 
                    value={newKeyForm.nombre}
                    onChange={(e) => setNewKeyForm({...newKeyForm, nombre: e.target.value})}
                    placeholder="Mi Clave API" 
                    className="w-full px-4 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-white" 
                  />
                </div>
                <div>
                  <label className="block text-sm text-slate-400 mb-2">Clave API *</label>
                  <input 
                    type="text" 
                    value={newKeyForm.clave}
                    onChange={(e) => setNewKeyForm({...newKeyForm, clave: e.target.value})}
                    placeholder="sk-..." 
                    className="w-full px-4 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-white font-mono" 
                  />
                </div>
                <div>
                  <label className="block text-sm text-slate-400 mb-2">Servicio *</label>
                  <select 
                    value={newKeyForm.servicio}
                    onChange={(e) => setNewKeyForm({...newKeyForm, servicio: e.target.value, permisos: []})}
                    className="w-full px-4 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-white"
                  >
                    <option value="">Seleccionar...</option>
                    {servicios.map(serv => (
                      <option key={serv} value={serv}>{getServicioBadge(serv).label}</option>
                    ))}
                  </select>
                </div>
                {newKeyForm.servicio && (
                  <div>
                    <label className="block text-sm text-slate-400 mb-2">Permisos</label>
                    <div className="flex flex-wrap gap-2">
                      {permisosDisponibles[newKeyForm.servicio]?.map(permiso => (
                        <button
                          key={permiso}
                          onClick={() => togglePermiso(permiso, 'new')}
                          className={`px-3 py-1.5 text-sm rounded-lg border transition-colors ${
                            newKeyForm.permisos.includes(permiso)
                              ? 'bg-blue-500/20 border-blue-500/30 text-blue-400'
                              : 'bg-slate-800 border-slate-700 text-slate-400 hover:border-slate-600'
                          }`}
                        >
                          {permiso}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
                <div>
                  <label className="block text-sm text-slate-400 mb-2">Fecha de Expiración</label>
                  <input 
                    type="date" 
                    value={newKeyForm.fechaExpiracion}
                    onChange={(e) => setNewKeyForm({...newKeyForm, fechaExpiracion: e.target.value})}
                    className="w-full px-4 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-white" 
                  />
                </div>
              </div>
              <div className="flex gap-3 mt-6">
                <button onClick={() => setActiveModal(null)} className="flex-1 px-4 py-2.5 bg-slate-800 text-white rounded-xl hover:bg-slate-700">
                  Cancelar
                </button>
                <button onClick={handleCreateKey} className="flex-1 px-4 py-2.5 bg-blue-500 text-white font-medium rounded-xl hover:bg-blue-400">
                  Crear Clave
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {activeModal === 'view' && selectedKey && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => setActiveModal(null)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-lg p-6"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-white">Detalle de Clave API</h2>
                <button onClick={() => setActiveModal(null)} className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg">
                  <X className="w-5 h-5" />
                </button>
              </div>
              <div className="space-y-4">
                <div className="flex items-center gap-4 p-4 bg-slate-800/50 rounded-xl">
                  <div className="w-14 h-14 rounded-xl bg-blue-500/20 flex items-center justify-center text-2xl">
                    {getServicioIcon(selectedKey.servicio)}
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-white">{selectedKey.nombre}</h3>
                    <span className={`px-2.5 py-1 text-xs font-medium rounded-full border ${getServicioBadge(selectedKey.servicio).style}`}>
                      {getServicioBadge(selectedKey.servicio).label}
                    </span>
                  </div>
                </div>
                
                <div className="p-4 bg-slate-800/50 rounded-xl">
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-xs text-slate-400">Clave API</p>
                    <div className="flex gap-1">
                      <button
                        onClick={() => setShowKey(showKey === selectedKey.id ? null : selectedKey.id)}
                        className="p-1 text-slate-500 hover:text-white"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => copyToClipboard(selectedKey.clave)}
                        className="p-1 text-slate-500 hover:text-blue-400"
                      >
                        <Copy className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                  <code className="text-sm text-white font-mono break-all">
                    {showKey === selectedKey.id ? selectedKey.clave : selectedKey.clave.replace(/./g, '*')}
                  </code>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="p-4 bg-slate-800/50 rounded-xl">
                    <p className="text-xs text-slate-400 mb-1">Estado</p>
                    <span className={`px-2.5 py-1 text-xs font-medium rounded-full border ${getEstadoBadge(selectedKey.estado).style}`}>
                      {getEstadoBadge(selectedKey.estado).label}
                    </span>
                  </div>
                  <div className="p-4 bg-slate-800/50 rounded-xl">
                    <p className="text-xs text-slate-400 mb-1">Peticiones</p>
                    <p className="text-sm text-white font-medium">{selectedKey.peticiones.toLocaleString()}</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="p-4 bg-slate-800/50 rounded-xl">
                    <p className="text-xs text-slate-400 mb-1">Creada</p>
                    <p className="text-sm text-white">{selectedKey.fechaCreacion}</p>
                  </div>
                  <div className="p-4 bg-slate-800/50 rounded-xl">
                    <p className="text-xs text-slate-400 mb-1">Expiración</p>
                    <p className="text-sm text-white">{selectedKey.fechaExpiracion}</p>
                  </div>
                </div>

                <div className="p-4 bg-slate-800/50 rounded-xl">
                  <p className="text-xs text-slate-400 mb-2">Último Uso</p>
                  <p className="text-sm text-white">{selectedKey.ultimoUso}</p>
                </div>

                {selectedKey.permisos.length > 0 && (
                  <div>
                    <p className="text-xs text-slate-400 mb-2">Permisos</p>
                    <div className="flex flex-wrap gap-2">
                      {selectedKey.permisos.map(permiso => (
                        <span key={permiso} className="px-3 py-1.5 text-xs bg-slate-800 border border-slate-700 rounded-lg text-slate-300">
                          {permiso}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
              <div className="mt-6">
                <button onClick={() => setActiveModal(null)} className="w-full px-4 py-2.5 bg-slate-800 text-white rounded-xl hover:bg-slate-700">
                  Cerrar
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {activeModal === 'edit' && selectedKey && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => setActiveModal(null)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-lg p-6"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-white">Editar Clave API</h2>
                <button onClick={() => setActiveModal(null)} className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg">
                  <X className="w-5 h-5" />
                </button>
              </div>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm text-slate-400 mb-2">Nombre</label>
                  <input 
                    type="text" 
                    value={editKeyForm.nombre}
                    onChange={(e) => setEditKeyForm({...editKeyForm, nombre: e.target.value})}
                    className="w-full px-4 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-white" 
                  />
                </div>
                <div>
                  <label className="block text-sm text-slate-400 mb-2">Estado</label>
                  <select 
                    value={editKeyForm.estado}
                    onChange={(e) => setEditKeyForm({...editKeyForm, estado: e.target.value})}
                    className="w-full px-4 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-white"
                  >
                    <option value="activa">Activa</option>
                    <option value="inactiva">Inactiva</option>
                    <option value="expirada">Expirada</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm text-slate-400 mb-2">Permisos</label>
                  <div className="flex flex-wrap gap-2">
                    {permisosDisponibles[selectedKey.servicio]?.map(permiso => (
                      <button
                        key={permiso}
                        onClick={() => togglePermiso(permiso, 'edit')}
                        className={`px-3 py-1.5 text-sm rounded-lg border transition-colors ${
                          editKeyForm.permisos.includes(permiso)
                            ? 'bg-blue-500/20 border-blue-500/30 text-blue-400'
                            : 'bg-slate-800 border-slate-700 text-slate-400 hover:border-slate-600'
                        }`}
                      >
                        {permiso}
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="block text-sm text-slate-400 mb-2">Fecha de Expiración</label>
                  <input 
                    type="date" 
                    value={editKeyForm.fechaExpiracion}
                    onChange={(e) => setEditKeyForm({...editKeyForm, fechaExpiracion: e.target.value})}
                    className="w-full px-4 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-white" 
                  />
                </div>
              </div>
              <div className="flex gap-3 mt-6">
                <button onClick={() => setActiveModal(null)} className="flex-1 px-4 py-2.5 bg-slate-800 text-white rounded-xl hover:bg-slate-700">
                  Cancelar
                </button>
                <button onClick={handleEditKey} className="flex-1 px-4 py-2.5 bg-blue-500 text-white font-medium rounded-xl hover:bg-blue-400">
                  Guardar Cambios
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {activeModal === 'delete' && selectedKey && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => setActiveModal(null)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-md p-6"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="text-center">
                <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-red-500/20 flex items-center justify-center">
                  <AlertTriangle className="w-8 h-8 text-red-500" />
                </div>
                <h2 className="text-xl font-bold text-white mb-2">Eliminar Clave API</h2>
                <p className="text-slate-400 mb-6">
                  ¿Estás seguro de que deseas eliminar la clave <span className="text-white font-medium">{selectedKey.nombre}</span>? Esta acción no se puede deshacer.
                </p>
                <div className="flex gap-3">
                  <button onClick={() => setActiveModal(null)} className="flex-1 px-4 py-2.5 bg-slate-800 text-white rounded-xl hover:bg-slate-700">
                    Cancelar
                  </button>
                  <button onClick={handleDeleteKey} className="flex-1 px-4 py-2.5 bg-red-500 text-white font-medium rounded-xl hover:bg-red-400">
                    Eliminar
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </AppLayout>
  );
}

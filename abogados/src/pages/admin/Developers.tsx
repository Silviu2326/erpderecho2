import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Plus, Search, Eye, Edit3, Trash2, X, Code, Users,
  Mail, Phone, Globe, MapPin, Calendar, Star,
  Github, Twitter, Linkedin, ExternalLink, CheckCircle,
  AlertTriangle, Info
} from 'lucide-react';
import { AppLayout } from '@/components/layout/AppLayout';
import { useRole } from '@/hooks/useRole';

type ModalType = 'view' | 'edit' | 'delete' | 'create' | null;

interface Developer {
  id: number;
  nombre: string;
  email: string;
  telefono: string;
  especialidad: string;
  experiencia: number;
  rating: number;
  proyectos: number;
  estado: 'activo' | 'inactivo' | 'pendiente';
  pais: string;
  ciudad: string;
  sitioWeb: string;
  github?: string;
  twitter?: string;
  linkedin?: string;
  fechaRegistro: string;
  ultimoAcceso: string;
}

const developersData: Developer[] = [
  {
    id: 1,
    nombre: 'Alex Rivera',
    email: 'alex@devstudio.com',
    telefono: '+34 612 345 678',
    especialidad: 'Full Stack',
    experiencia: 8,
    rating: 4.9,
    proyectos: 47,
    estado: 'activo',
    pais: 'España',
    ciudad: 'Madrid',
    sitioWeb: 'https://alexrivera.dev',
    github: 'alexrivera',
    twitter: 'alexrivera_dev',
    linkedin: 'alexrivera',
    fechaRegistro: '2024-03-15',
    ultimoAcceso: '2026-03-10 14:35'
  },
  {
    id: 2,
    nombre: 'Maria Chen',
    email: 'maria.chen@techlabs.io',
    telefono: '+34 654 987 321',
    especialidad: 'Frontend',
    experiencia: 5,
    rating: 4.7,
    proyectos: 32,
    estado: 'activo',
    pais: 'España',
    ciudad: 'Barcelona',
    sitioWeb: 'https://mariachen.dev',
    github: 'mariachen',
    linkedin: 'mariachen',
    fechaRegistro: '2024-06-22',
    ultimoAcceso: '2026-03-10 09:20'
  },
  {
    id: 3,
    nombre: 'David Kowalski',
    email: 'david@codeforge.com',
    telefono: '+48 123 456 789',
    especialidad: 'Backend',
    experiencia: 10,
    rating: 4.8,
    proyectos: 63,
    estado: 'activo',
    pais: 'Polonia',
    ciudad: 'Varsovia',
    sitioWeb: 'https://davidkowalski.pl',
    github: 'dkowalski',
    fechaRegistro: '2023-11-08',
    ultimoAcceso: '2026-03-09 18:45'
  },
  {
    id: 4,
    nombre: 'Sofia Martinez',
    email: 'sofia@webcraft.co',
    telefono: '+34 678 123 456',
    especialidad: 'UI/UX',
    experiencia: 6,
    rating: 4.6,
    proyectos: 28,
    estado: 'pendiente',
    pais: 'México',
    ciudad: 'Ciudad de México',
    sitioWeb: 'https://sofiamartinez.mx',
    twitter: 'sofia_ux',
    linkedin: 'sofiamartinez',
    fechaRegistro: '2025-01-20',
    ultimoAcceso: '2026-03-08 11:30'
  },
  {
    id: 5,
    nombre: 'James Wilson',
    email: 'james@devops.pro',
    telefono: '+1 555 123 4567',
    especialidad: 'DevOps',
    experiencia: 7,
    rating: 4.5,
    proyectos: 41,
    estado: 'inactivo',
    pais: 'Estados Unidos',
    ciudad: 'San Francisco',
    sitioWeb: 'https://jameswilson.dev',
    github: 'jwilson',
    twitter: 'james_devops',
    fechaRegistro: '2024-02-14',
    ultimoAcceso: '2026-02-15 10:00'
  },
];

const especialidades = ['Full Stack', 'Frontend', 'Backend', 'UI/UX', 'DevOps', 'Mobile', 'Data Science', 'Security'];

const getEstadoBadge = (estado: string) => {
  const styles: Record<string, string> = {
    activo: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
    inactivo: 'bg-slate-500/10 text-slate-400 border-slate-500/20',
    pendiente: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
  };
  const labels: Record<string, string> = {
    activo: 'Activo',
    inactivo: 'Inactivo',
    pendiente: 'Pendiente',
  };
  return { style: styles[estado] || styles.inactivo, label: labels[estado] || estado };
};

const getEspecialidadColor = (especialidad: string) => {
  const colors: Record<string, string> = {
    'Full Stack': 'bg-purple-500/20 text-purple-400 border-purple-500/30',
    'Frontend': 'bg-blue-500/20 text-blue-400 border-blue-500/30',
    'Backend': 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
    'UI/UX': 'bg-pink-500/20 text-pink-400 border-pink-500/30',
    'DevOps': 'bg-amber-500/20 text-amber-400 border-amber-500/30',
    'Mobile': 'bg-cyan-500/20 text-cyan-400 border-cyan-500/30',
    'Data Science': 'bg-indigo-500/20 text-indigo-400 border-indigo-500/30',
    'Security': 'bg-red-500/20 text-red-400 border-red-500/30',
  };
  return colors[especialidad] || 'bg-slate-500/20 text-slate-400 border-slate-500/30';
};

export default function Developers() {
  const { role, roleConfig } = useRole();
  const [developers, setDevelopers] = useState<Developer[]>(developersData);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterEspecialidad, setFilterEspecialidad] = useState('all');
  const [filterEstado, setFilterEstado] = useState('all');
  const [activeModal, setActiveModal] = useState<ModalType>(null);
  const [selectedDeveloper, setSelectedDeveloper] = useState<Developer | null>(null);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'info' | 'error' } | null>(null);
  
  const [newDeveloperForm, setNewDeveloperForm] = useState({
    nombre: '',
    email: '',
    telefono: '',
    especialidad: '',
    pais: '',
    ciudad: '',
    sitioWeb: '',
  });

  const [editDeveloperForm, setEditDeveloperForm] = useState({
    nombre: '',
    email: '',
    telefono: '',
    especialidad: '',
    estado: '',
    pais: '',
    ciudad: '',
    sitioWeb: '',
  });

  const showToast = (message: string, type: 'success' | 'info' | 'error' = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  const filteredDevelopers = developers.filter(dev => {
    const matchesSearch = 
      dev.nombre.toLowerCase().includes(searchQuery.toLowerCase()) ||
      dev.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      dev.especialidad.toLowerCase().includes(searchQuery.toLowerCase()) ||
      dev.pais.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesEspecialidad = filterEspecialidad === 'all' || dev.especialidad === filterEspecialidad;
    const matchesEstado = filterEstado === 'all' || dev.estado === filterEstado;
    return matchesSearch && matchesEspecialidad && matchesEstado;
  });

  const stats = {
    total: developers.length,
    activos: developers.filter(d => d.estado === 'activo').length,
    promedioRating: (developers.reduce((acc, d) => acc + d.rating, 0) / developers.length).toFixed(1),
    proyectosTotal: developers.reduce((acc, d) => acc + d.proyectos, 0),
  };

  const handleCreateDeveloper = () => {
    if (!newDeveloperForm.nombre || !newDeveloperForm.email || !newDeveloperForm.especialidad) {
      showToast('Por favor completa los campos obligatorios', 'error');
      return;
    }
    
    const newDev: Developer = {
      id: Date.now(),
      ...newDeveloperForm,
      experiencia: 0,
      rating: 0,
      proyectos: 0,
      estado: 'pendiente',
      fechaRegistro: new Date().toISOString().split('T')[0],
      ultimoAcceso: 'Nunca'
    };
    
    setDevelopers([newDev, ...developers]);
    setNewDeveloperForm({ nombre: '', email: '', telefono: '', especialidad: '', pais: '', ciudad: '', sitioWeb: '' });
    setActiveModal(null);
    showToast('Desarrollador añadido correctamente');
  };

  const handleEditDeveloper = () => {
    if (!selectedDeveloper) return;
    
    setDevelopers(developers.map(d => 
      d.id === selectedDeveloper.id 
        ? { 
            ...d, 
            nombre: editDeveloperForm.nombre || d.nombre, 
            email: editDeveloperForm.email || d.email,
            telefono: editDeveloperForm.telefono || d.telefono,
            especialidad: editDeveloperForm.especialidad || d.especialidad,
            estado: editDeveloperForm.estado as Developer['estado'] || d.estado,
            pais: editDeveloperForm.pais || d.pais,
            ciudad: editDeveloperForm.ciudad || d.ciudad,
            sitioWeb: editDeveloperForm.sitioWeb || d.sitioWeb,
          } 
        : d
    ));
    
    setActiveModal(null);
    setSelectedDeveloper(null);
    showToast('Desarrollador actualizado correctamente');
  };

  const handleDeleteDeveloper = () => {
    if (!selectedDeveloper) return;
    if (confirm(`¿Eliminar al desarrollador ${selectedDeveloper.nombre}?`)) {
      setDevelopers(developers.filter(d => d.id !== selectedDeveloper.id));
      setActiveModal(null);
      setSelectedDeveloper(null);
      showToast('Desarrollador eliminado');
    }
  };

  const openEditModal = (dev: Developer) => {
    setSelectedDeveloper(dev);
    setEditDeveloperForm({
      nombre: dev.nombre,
      email: dev.email,
      telefono: dev.telefono,
      especialidad: dev.especialidad,
      estado: dev.estado,
      pais: dev.pais,
      ciudad: dev.ciudad,
      sitioWeb: dev.sitioWeb,
    });
    setActiveModal('edit');
  };

  const openViewModal = (dev: Developer) => {
    setSelectedDeveloper(dev);
    setActiveModal('view');
  };

  const headerActions = (
    <button
      onClick={() => setActiveModal('create')}
      className="hidden sm:flex items-center gap-2 px-4 py-2 bg-blue-500 text-white font-medium rounded-xl hover:bg-blue-400 transition-colors"
    >
      <Plus className="w-4 h-4" />
      <span className="hidden lg:inline">Añadir Desarrollador</span>
    </button>
  );

  return (
    <AppLayout
      title="Desarrolladores"
      subtitle="Gestión del marketplace de desarrolladores"
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
                <Code className="w-5 h-5 text-blue-500" />
              </div>
            </div>
            <h3 className="text-2xl font-bold text-white mb-0.5">{stats.total}</h3>
            <p className="text-slate-400 text-sm">Total Desarrolladores</p>
          </div>

          <div className="p-5 bg-slate-900/60 border border-slate-800 rounded-2xl hover:border-emerald-500/30 transition-all">
            <div className="flex items-start justify-between mb-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/20 flex items-center justify-center">
                <Users className="w-5 h-5 text-emerald-500" />
              </div>
              <span className="text-xs text-emerald-500 font-medium">{Math.round((stats.activos / stats.total) * 100)}%</span>
            </div>
            <h3 className="text-2xl font-bold text-white mb-0.5">{stats.activos}</h3>
            <p className="text-slate-400 text-sm">Activos</p>
          </div>

          <div className="p-5 bg-slate-900/60 border border-slate-800 rounded-2xl hover:border-amber-500/30 transition-all">
            <div className="flex items-start justify-between mb-3">
              <div className="w-10 h-10 rounded-xl bg-amber-500/20 flex items-center justify-center">
                <Star className="w-5 h-5 text-amber-500" />
              </div>
            </div>
            <h3 className="text-2xl font-bold text-white mb-0.5">{stats.promedioRating}</h3>
            <p className="text-slate-400 text-sm">Rating Promedio</p>
          </div>

          <div className="p-5 bg-slate-900/60 border border-slate-800 rounded-2xl hover:border-purple-500/30 transition-all">
            <div className="flex items-start justify-between mb-3">
              <div className="w-10 h-10 rounded-xl bg-purple-500/20 flex items-center justify-center">
                <ExternalLink className="w-5 h-5 text-purple-500" />
              </div>
            </div>
            <h3 className="text-2xl font-bold text-white mb-0.5">{stats.proyectosTotal}</h3>
            <p className="text-slate-400 text-sm">Proyectos Totales</p>
          </div>
        </motion.div>

        <div className="bg-slate-900/60 border border-slate-800 rounded-2xl overflow-hidden">
          <div className="p-4 border-b border-slate-800 flex flex-col lg:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
              <input
                type="text"
                placeholder="Buscar desarrolladores..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-4 py-2 bg-slate-800 border border-slate-700 rounded-xl text-white text-sm placeholder-slate-500 focus:outline-none focus:border-blue-500 transition-colors"
              />
            </div>
            <div className="flex gap-3 flex-wrap">
              <select 
                value={filterEspecialidad}
                onChange={(e) => setFilterEspecialidad(e.target.value)}
                className="px-4 py-2 bg-slate-800 border border-slate-700 rounded-xl text-white text-sm"
              >
                <option value="all">Todas las especialidades</option>
                {especialidades.map(esp => (
                  <option key={esp} value={esp}>{esp}</option>
                ))}
              </select>
              <select 
                value={filterEstado}
                onChange={(e) => setFilterEstado(e.target.value)}
                className="px-4 py-2 bg-slate-800 border border-slate-700 rounded-xl text-white text-sm"
              >
                <option value="all">Todos los estados</option>
                <option value="activo">Activos</option>
                <option value="pendiente">Pendientes</option>
                <option value="inactivo">Inactivos</option>
              </select>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-800 bg-slate-900/80">
                  <th className="text-left py-3 px-4 text-xs font-medium text-slate-400 uppercase">Desarrollador</th>
                  <th className="text-left py-3 px-4 text-xs font-medium text-slate-400 uppercase">Especialidad</th>
                  <th className="text-left py-3 px-4 text-xs font-medium text-slate-400 uppercase">Experiencia</th>
                  <th className="text-left py-3 px-4 text-xs font-medium text-slate-400 uppercase">Proyectos</th>
                  <th className="text-left py-3 px-4 text-xs font-medium text-slate-400 uppercase">Rating</th>
                  <th className="text-left py-3 px-4 text-xs font-medium text-slate-400 uppercase">Estado</th>
                  <th className="text-left py-3 px-4 text-xs font-medium text-slate-400 uppercase"></th>
                </tr>
              </thead>
              <tbody>
                {filteredDevelopers.map((dev, index) => (
                  <motion.tr
                    key={dev.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.03 }}
                    className="border-b border-slate-800/50 hover:bg-slate-800/30 transition-colors group"
                  >
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-blue-500/20 flex items-center justify-center">
                          <span className="text-sm font-bold text-blue-400">
                            {dev.nombre.split(' ').map(n => n[0]).join('')}
                          </span>
                        </div>
                        <div>
                          <span className="text-sm font-medium text-white block">{dev.nombre}</span>
                          <span className="text-xs text-slate-500">{dev.email}</span>
                        </div>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <span className={`px-2.5 py-1 text-xs font-medium rounded-full border ${getEspecialidadColor(dev.especialidad)}`}>
                        {dev.especialidad}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <span className="text-sm text-slate-400">{dev.experiencia} años</span>
                    </td>
                    <td className="py-3 px-4">
                      <span className="text-sm text-slate-400">{dev.proyectos}</span>
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-1">
                        <Star className="w-4 h-4 text-amber-500 fill-amber-500" />
                        <span className="text-sm text-white font-medium">{dev.rating}</span>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <span className={`px-2.5 py-1 text-xs font-medium rounded-full border ${getEstadoBadge(dev.estado).style}`}>
                        {getEstadoBadge(dev.estado).label}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button 
                          onClick={() => openViewModal(dev)}
                          className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-700 rounded-lg" 
                          title="Ver"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button 
                          onClick={() => openEditModal(dev)}
                          className="p-1.5 text-slate-400 hover:text-blue-400 hover:bg-blue-500/10 rounded-lg" 
                          title="Editar"
                        >
                          <Edit3 className="w-4 h-4" />
                        </button>
                        <button 
                          onClick={() => { setSelectedDeveloper(dev); setActiveModal('delete'); }}
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
              Mostrando {filteredDevelopers.length} de {developers.length} desarrolladores
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
                <h2 className="text-xl font-bold text-white">Nuevo Desarrollador</h2>
                <button onClick={() => setActiveModal(null)} className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg">
                  <X className="w-5 h-5" />
                </button>
              </div>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm text-slate-400 mb-2">Nombre *</label>
                  <input 
                    type="text" 
                    value={newDeveloperForm.nombre}
                    onChange={(e) => setNewDeveloperForm({...newDeveloperForm, nombre: e.target.value})}
                    placeholder="Juan Pérez" 
                    className="w-full px-4 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-white" 
                  />
                </div>
                <div>
                  <label className="block text-sm text-slate-400 mb-2">Email *</label>
                  <input 
                    type="email" 
                    value={newDeveloperForm.email}
                    onChange={(e) => setNewDeveloperForm({...newDeveloperForm, email: e.target.value})}
                    placeholder="juan@ejemplo.com" 
                    className="w-full px-4 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-white" 
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm text-slate-400 mb-2">Teléfono</label>
                    <input 
                      type="tel" 
                      value={newDeveloperForm.telefono}
                      onChange={(e) => setNewDeveloperForm({...newDeveloperForm, telefono: e.target.value})}
                      placeholder="+34 123 456 789" 
                      className="w-full px-4 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-white" 
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-slate-400 mb-2">Especialidad *</label>
                    <select 
                      value={newDeveloperForm.especialidad}
                      onChange={(e) => setNewDeveloperForm({...newDeveloperForm, especialidad: e.target.value})}
                      className="w-full px-4 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-white"
                    >
                      <option value="">Seleccionar...</option>
                      {especialidades.map(esp => (
                        <option key={esp} value={esp}>{esp}</option>
                      ))}
                    </select>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm text-slate-400 mb-2">País</label>
                    <input 
                      type="text" 
                      value={newDeveloperForm.pais}
                      onChange={(e) => setNewDeveloperForm({...newDeveloperForm, pais: e.target.value})}
                      placeholder="España" 
                      className="w-full px-4 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-white" 
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-slate-400 mb-2">Ciudad</label>
                    <input 
                      type="text" 
                      value={newDeveloperForm.ciudad}
                      onChange={(e) => setNewDeveloperForm({...newDeveloperForm, ciudad: e.target.value})}
                      placeholder="Madrid" 
                      className="w-full px-4 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-white" 
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm text-slate-400 mb-2">Sitio Web</label>
                  <input 
                    type="url" 
                    value={newDeveloperForm.sitioWeb}
                    onChange={(e) => setNewDeveloperForm({...newDeveloperForm, sitioWeb: e.target.value})}
                    placeholder="https://miweb.com" 
                    className="w-full px-4 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-white" 
                  />
                </div>
              </div>
              <div className="flex gap-3 mt-6">
                <button onClick={() => setActiveModal(null)} className="flex-1 px-4 py-2.5 bg-slate-800 text-white rounded-xl hover:bg-slate-700">
                  Cancelar
                </button>
                <button onClick={handleCreateDeveloper} className="flex-1 px-4 py-2.5 bg-blue-500 text-white font-medium rounded-xl hover:bg-blue-400">
                  Crear Desarrollador
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {activeModal === 'view' && selectedDeveloper && (
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
                <h2 className="text-xl font-bold text-white">Detalle del Desarrollador</h2>
                <button onClick={() => setActiveModal(null)} className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg">
                  <X className="w-5 h-5" />
                </button>
              </div>
              <div className="space-y-4">
                <div className="flex items-center gap-4 p-4 bg-slate-800/50 rounded-xl">
                  <div className="w-16 h-16 rounded-full bg-blue-500/20 flex items-center justify-center">
                    <span className="text-xl font-bold text-blue-400">
                      {selectedDeveloper.nombre.split(' ').map(n => n[0]).join('')}
                    </span>
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-white">{selectedDeveloper.nombre}</h3>
                    <span className={`px-2.5 py-1 text-xs font-medium rounded-full border ${getEspecialidadColor(selectedDeveloper.especialidad)}`}>
                      {selectedDeveloper.especialidad}
                    </span>
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-4 bg-slate-800/50 rounded-xl">
                    <div className="flex items-center gap-2 text-slate-400 mb-1">
                      <Mail className="w-4 h-4" />
                      <p className="text-xs">Email</p>
                    </div>
                    <p className="text-sm text-white">{selectedDeveloper.email}</p>
                  </div>
                  <div className="p-4 bg-slate-800/50 rounded-xl">
                    <div className="flex items-center gap-2 text-slate-400 mb-1">
                      <Phone className="w-4 h-4" />
                      <p className="text-xs">Teléfono</p>
                    </div>
                    <p className="text-sm text-white">{selectedDeveloper.telefono}</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="p-4 bg-slate-800/50 rounded-xl">
                    <div className="flex items-center gap-2 text-slate-400 mb-1">
                      <MapPin className="w-4 h-4" />
                      <p className="text-xs">Ubicación</p>
                    </div>
                    <p className="text-sm text-white">{selectedDeveloper.ciudad}, {selectedDeveloper.pais}</p>
                  </div>
                  <div className="p-4 bg-slate-800/50 rounded-xl">
                    <div className="flex items-center gap-2 text-slate-400 mb-1">
                      <Calendar className="w-4 h-4" />
                      <p className="text-xs">Registrado</p>
                    </div>
                    <p className="text-sm text-white">{selectedDeveloper.fechaRegistro}</p>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div className="p-4 bg-slate-800/50 rounded-xl text-center">
                    <p className="text-2xl font-bold text-white">{selectedDeveloper.experiencia}</p>
                    <p className="text-xs text-slate-400">Años</p>
                  </div>
                  <div className="p-4 bg-slate-800/50 rounded-xl text-center">
                    <p className="text-2xl font-bold text-white">{selectedDeveloper.proyectos}</p>
                    <p className="text-xs text-slate-400">Proyectos</p>
                  </div>
                  <div className="p-4 bg-slate-800/50 rounded-xl text-center">
                    <div className="flex items-center justify-center gap-1">
                      <Star className="w-5 h-5 text-amber-500 fill-amber-500" />
                      <p className="text-2xl font-bold text-white">{selectedDeveloper.rating}</p>
                    </div>
                    <p className="text-xs text-slate-400">Rating</p>
                  </div>
                </div>

                {(selectedDeveloper.sitioWeb || selectedDeveloper.github || selectedDeveloper.twitter || selectedDeveloper.linkedin) && (
                  <div className="flex gap-2 flex-wrap">
                    {selectedDeveloper.sitioWeb && (
                      <a href={selectedDeveloper.sitioWeb} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 rounded-lg text-sm text-slate-300">
                        <Globe className="w-4 h-4" /> Web
                      </a>
                    )}
                    {selectedDeveloper.github && (
                      <a href={`https://github.com/${selectedDeveloper.github}`} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 rounded-lg text-sm text-slate-300">
                        <Github className="w-4 h-4" /> GitHub
                      </a>
                    )}
                    {selectedDeveloper.twitter && (
                      <a href={`https://twitter.com/${selectedDeveloper.twitter}`} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 rounded-lg text-sm text-slate-300">
                        <Twitter className="w-4 h-4" /> Twitter
                      </a>
                    )}
                    {selectedDeveloper.linkedin && (
                      <a href={`https://linkedin.com/in/${selectedDeveloper.linkedin}`} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 rounded-lg text-sm text-slate-300">
                        <Linkedin className="w-4 h-4" /> LinkedIn
                      </a>
                    )}
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
        {activeModal === 'edit' && selectedDeveloper && (
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
                <h2 className="text-xl font-bold text-white">Editar Desarrollador</h2>
                <button onClick={() => setActiveModal(null)} className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg">
                  <X className="w-5 h-5" />
                </button>
              </div>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm text-slate-400 mb-2">Nombre</label>
                  <input 
                    type="text" 
                    value={editDeveloperForm.nombre}
                    onChange={(e) => setEditDeveloperForm({...editDeveloperForm, nombre: e.target.value})}
                    className="w-full px-4 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-white" 
                  />
                </div>
                <div>
                  <label className="block text-sm text-slate-400 mb-2">Email</label>
                  <input 
                    type="email" 
                    value={editDeveloperForm.email}
                    onChange={(e) => setEditDeveloperForm({...editDeveloperForm, email: e.target.value})}
                    className="w-full px-4 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-white" 
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm text-slate-400 mb-2">Teléfono</label>
                    <input 
                      type="tel" 
                      value={editDeveloperForm.telefono}
                      onChange={(e) => setEditDeveloperForm({...editDeveloperForm, telefono: e.target.value})}
                      className="w-full px-4 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-white" 
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-slate-400 mb-2">Especialidad</label>
                    <select 
                      value={editDeveloperForm.especialidad}
                      onChange={(e) => setEditDeveloperForm({...editDeveloperForm, especialidad: e.target.value})}
                      className="w-full px-4 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-white"
                    >
                      {especialidades.map(esp => (
                        <option key={esp} value={esp}>{esp}</option>
                      ))}
                    </select>
                  </div>
                </div>
                <div>
                  <label className="block text-sm text-slate-400 mb-2">Estado</label>
                  <select 
                    value={editDeveloperForm.estado}
                    onChange={(e) => setEditDeveloperForm({...editDeveloperForm, estado: e.target.value})}
                    className="w-full px-4 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-white"
                  >
                    <option value="activo">Activo</option>
                    <option value="pendiente">Pendiente</option>
                    <option value="inactivo">Inactivo</option>
                  </select>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm text-slate-400 mb-2">País</label>
                    <input 
                      type="text" 
                      value={editDeveloperForm.pais}
                      onChange={(e) => setEditDeveloperForm({...editDeveloperForm, pais: e.target.value})}
                      className="w-full px-4 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-white" 
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-slate-400 mb-2">Ciudad</label>
                    <input 
                      type="text" 
                      value={editDeveloperForm.ciudad}
                      onChange={(e) => setEditDeveloperForm({...editDeveloperForm, ciudad: e.target.value})}
                      className="w-full px-4 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-white" 
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm text-slate-400 mb-2">Sitio Web</label>
                  <input 
                    type="url" 
                    value={editDeveloperForm.sitioWeb}
                    onChange={(e) => setEditDeveloperForm({...editDeveloperForm, sitioWeb: e.target.value})}
                    className="w-full px-4 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-white" 
                  />
                </div>
              </div>
              <div className="flex gap-3 mt-6">
                <button onClick={() => setActiveModal(null)} className="flex-1 px-4 py-2.5 bg-slate-800 text-white rounded-xl hover:bg-slate-700">
                  Cancelar
                </button>
                <button onClick={handleEditDeveloper} className="flex-1 px-4 py-2.5 bg-blue-500 text-white font-medium rounded-xl hover:bg-blue-400">
                  Guardar Cambios
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {activeModal === 'delete' && selectedDeveloper && (
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
                <h2 className="text-xl font-bold text-white mb-2">Eliminar Desarrollador</h2>
                <p className="text-slate-400 mb-6">
                  ¿Estás seguro de que deseas eliminar a <span className="text-white font-medium">{selectedDeveloper.nombre}</span>? Esta acción no se puede deshacer.
                </p>
                <div className="flex gap-3">
                  <button onClick={() => setActiveModal(null)} className="flex-1 px-4 py-2.5 bg-slate-800 text-white rounded-xl hover:bg-slate-700">
                    Cancelar
                  </button>
                  <button onClick={handleDeleteDeveloper} className="flex-1 px-4 py-2.5 bg-red-500 text-white font-medium rounded-xl hover:bg-red-400">
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

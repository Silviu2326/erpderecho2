import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Plus, Download, Eye, Edit3, Trash2, X, Shield, Users, Settings,
  Key, Database, Activity, Bell, Lock, UserPlus,
  ToggleLeft, ToggleRight, FileText, Server, HardDrive, Cloud, RefreshCw,
  AlertTriangle, CheckCircle2, Clock, Search, Crown,
  Zap, CheckCircle, Info
} from 'lucide-react';
import { AppLayout } from '@/components/layout/AppLayout';
import { useRole } from '@/hooks/useRole';

// Tipos
type ModalType = 'view' | 'edit' | 'permissions' | 'delete' | 'backup' | 'maintenance' | null;

interface Usuario {
  id: number;
  nombre: string;
  email: string;
  rol: string;
  estado: string;
  ultimoAcceso: string;
}

interface Configuracion {
  id: string;
  nombre: string;
  descripcion: string;
  activo: boolean;
  categoria: string;
}


// Datos de ejemplo
const usuarios = [
  { id: 1, nombre: 'Carlos Ruiz', email: 'carlos@bufete.com', rol: 'socio', estado: 'activo', ultimoAcceso: '2026-03-10 14:35' },
  { id: 2, nombre: 'Ana López', email: 'ana@bufete.com', rol: 'abogado_senior', estado: 'activo', ultimoAcceso: '2026-03-10 16:20' },
  { id: 3, nombre: 'Pedro García', email: 'pedro@bufete.com', rol: 'abogado_junior', estado: 'activo', ultimoAcceso: '2026-03-09 18:45' },
  { id: 4, nombre: 'María Sánchez', email: 'maria@bufete.com', rol: 'paralegal', estado: 'activo', ultimoAcceso: '2026-03-10 15:10' },
  { id: 5, nombre: 'Luis Fernández', email: 'luis@bufete.com', rol: 'contador', estado: 'inactivo', ultimoAcceso: '2026-02-28 10:00' },
];

const actividadReciente = [
  { id: 1, usuario: 'Carlos Ruiz', accion: 'Creó un nuevo expediente', detalle: 'EXP-2026-089', fecha: '2026-03-10 16:45', tipo: 'create' },
  { id: 2, usuario: 'Ana López', accion: 'Modificó datos de cliente', detalle: 'TechCorp SL', fecha: '2026-03-10 15:30', tipo: 'update' },
  { id: 3, usuario: 'Pedro García', accion: 'Subió documento', detalle: 'contrato_servicios.pdf', fecha: '2026-03-10 14:20', tipo: 'upload' },
  { id: 4, usuario: 'Sistema', accion: 'Backup automático completado', detalle: '2.4 GB', fecha: '2026-03-10 03:00', tipo: 'system' },
  { id: 5, usuario: 'María Sánchez', accion: 'Registró tiempo de trabajo', detalle: '3.5 horas', fecha: '2026-03-09 18:30', tipo: 'time' },
];

const configuracionSistema = [
  { id: 'backup_auto', nombre: 'Respaldo automático', descripcion: 'Respaldos diarios a las 3:00 AM', activo: true, categoria: 'sistema' },
  { id: 'notif_email', nombre: 'Notificaciones por email', descripcion: 'Enviar alertas importantes por correo', activo: true, categoria: 'notificaciones' },
  { id: 'notif_push', nombre: 'Notificaciones push', descripcion: 'Alertas en tiempo real en la aplicación', activo: true, categoria: 'notificaciones' },
  { id: '2fa', nombre: 'Autenticación de dos factores', descripcion: 'Requerir 2FA para roles administrativos', activo: false, categoria: 'seguridad' },
  { id: 'audit_log', nombre: 'Registro de auditoría', descripcion: 'Registrar todas las acciones del sistema', activo: true, categoria: 'seguridad' },
  { id: 'session_timeout', nombre: 'Tiempo de sesión', descripcion: 'Cerrar sesión después de 60 minutos', activo: true, categoria: 'seguridad' },
];

const estadisticasUso = {
  usuariosActivos: 24,
  usuariosTotales: 28,
  expedientesActivos: 156,
  almacenamientoUsado: 45.2,
  almacenamientoTotal: 100,
  backupsRealizados: 89,
  ultimoBackup: '2026-03-10 03:00',
};

const getRoleName = (rol: string) => {
  const roles: Record<string, string> = {
    super_admin: 'Super Admin',
    socio: 'Socio',
    abogado_senior: 'Abogado Senior',
    abogado_junior: 'Abogado Junior',
    paralegal: 'Paralegal',
    secretario: 'Secretario',
    administrador: 'Administrador',
    contador: 'Contador',
    recepcionista: 'Recepcionista',
  };
  return roles[rol] || rol;
};

const getRoleBadgeColor = (rol: string) => {
  const colors: Record<string, string> = {
    super_admin: 'bg-purple-500/20 text-purple-400 border-purple-500/30',
    socio: 'bg-amber-500/20 text-amber-400 border-amber-500/30',
    abogado_senior: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
    abogado_junior: 'bg-cyan-500/20 text-cyan-400 border-cyan-500/30',
    paralegal: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
    secretario: 'bg-slate-500/20 text-slate-400 border-slate-500/30',
    administrador: 'bg-indigo-500/20 text-indigo-400 border-indigo-500/30',
    contador: 'bg-green-500/20 text-green-400 border-green-500/30',
    recepcionista: 'bg-pink-500/20 text-pink-400 border-pink-500/30',
  };
  return colors[rol] || 'bg-slate-500/20 text-slate-400 border-slate-500/30';
};

export default function Admin() {
  const { role, roleConfig } = useRole();
  const [activeTab, setActiveTab] = useState('users');
  const [searchQuery, setSearchQuery] = useState('');
  const [showNewUserModal, setShowNewUserModal] = useState(false);
  const [activeModal, setActiveModal] = useState<ModalType>(null);
  const [selectedUser, setSelectedUser] = useState<Usuario | null>(null);
  const [toast, setToast] = useState<{message: string; type: 'success' | 'info' | 'error'} | null>(null);
  
  // Estados mutables
  const [usersList, setUsersList] = useState<Usuario[]>(usuarios);
  const [configList, setConfigList] = useState<Configuracion[]>(configuracionSistema);
  const [activityLog, setActivityLog] = useState(actividadReciente);
  
  // Form states
  const [newUserForm, setNewUserForm] = useState({
    nombre: '',
    email: '',
    rol: '',
    password: ''
  });
  
  const [editUserForm, setEditUserForm] = useState({
    nombre: '',
    email: '',
    rol: '',
    estado: ''
  });

  const showToast = (message: string, type: 'success' | 'info' | 'error' = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  // Solo Super Admin tiene acceso
  if (role !== 'super_admin') {
    return (
      <AppLayout
        title="Administración"
        subtitle="Acceso restringido"
      >
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
              <p className="text-slate-400 mb-6">
                Solo el Super Administrador puede acceder al panel de administración del sistema.
              </p>

              <div className="p-4 bg-slate-800/50 rounded-xl text-left">
                <p className="text-sm font-medium text-slate-300 mb-3">Tu rol actual:</p>
                <div className="flex items-center gap-2">
                  <span className={`px-3 py-1.5 rounded-lg border text-sm font-medium ${roleConfig.bgColor} ${roleConfig.textColor}`}>
                    {roleConfig.name}
                  </span>
                </div>
                <p className="text-xs text-slate-400 mt-3">
                  Si necesitas acceso administrativo, contacta al administrador del sistema.
                </p>
              </div>
            </div>
          </motion.div>
        </main>
      </AppLayout>
    );
  }

  const tabs = [
    { id: 'users', label: 'Usuarios', icon: Users },
    { id: 'roles', label: 'Roles y Permisos', icon: Shield },
    { id: 'settings', label: 'Configuración', icon: Settings },
    { id: 'activity', label: 'Actividad', icon: Activity },
    { id: 'system', label: 'Sistema', icon: Server },
  ];

  const filteredUsers = usersList.filter(user =>
    user.nombre.toLowerCase().includes(searchQuery.toLowerCase()) ||
    user.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
    getRoleName(user.rol).toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Handlers
  const handleCreateUser = () => {
    if (!newUserForm.nombre || !newUserForm.email || !newUserForm.rol) {
      showToast('Por favor completa todos los campos', 'error');
      return;
    }
    
    const newUser: Usuario = {
      id: Date.now(),
      nombre: newUserForm.nombre,
      email: newUserForm.email,
      rol: newUserForm.rol,
      estado: 'activo',
      ultimoAcceso: 'Nunca'
    };
    
    setUsersList([newUser, ...usersList]);
    
    // Agregar a log de actividad
    const newActivity = {
      id: Date.now(),
      usuario: 'Super Admin',
      accion: 'Creó nuevo usuario',
      detalle: newUserForm.nombre,
      fecha: new Date().toISOString().replace('T', ' ').slice(0, 16),
      tipo: 'create'
    };
    setActivityLog([newActivity, ...activityLog]);
    
    setNewUserForm({ nombre: '', email: '', rol: '', password: '' });
    setShowNewUserModal(false);
    showToast('Usuario creado correctamente');
  };

  const handleToggleConfig = (configId: string) => {
    setConfigList(configList.map(c => 
      c.id === configId ? { ...c, activo: !c.activo } : c
    ));
    const config = configList.find(c => c.id === configId);
    showToast(`${config?.nombre} ${config?.activo ? 'desactivado' : 'activado'}`);
  };

  const handleDeleteUser = () => {
    if (!selectedUser) return;
    if (confirm(`¿Eliminar al usuario ${selectedUser.nombre}?`)) {
      setUsersList(usersList.filter(u => u.id !== selectedUser.id));
      setActiveModal(null);
      setSelectedUser(null);
      showToast('Usuario eliminado');
    }
  };

  const handleEditUser = () => {
    if (!selectedUser) return;
    
    setUsersList(usersList.map(u => 
      u.id === selectedUser.id 
        ? { ...u, nombre: editUserForm.nombre || u.nombre, email: editUserForm.email || u.email, rol: editUserForm.rol || u.rol, estado: editUserForm.estado || u.estado }
        : u
    ));
    
    setActiveModal(null);
    setSelectedUser(null);
    showToast('Usuario actualizado correctamente');
  };

  const handleExportLog = () => {
    showToast('Exportando log de actividad...', 'info');
    setTimeout(() => showToast('Log exportado correctamente'), 1500);
  };

  const handleCreateBackup = () => {
    showToast('Creando backup del sistema...', 'info');
    setTimeout(() => {
      showToast('Backup creado exitosamente (2.8 GB)');
      const newActivity = {
        id: Date.now(),
        usuario: 'Sistema',
        accion: 'Backup manual completado',
        detalle: '2.8 GB',
        fecha: new Date().toISOString().replace('T', ' ').slice(0, 16),
        tipo: 'system'
      };
      setActivityLog([newActivity, ...activityLog]);
    }, 2000);
  };

  const handleDownloadBackup = () => {
    showToast('Descargando último backup...', 'info');
    setTimeout(() => showToast('Descarga iniciada'), 1000);
  };

  const handleOptimizeDB = () => {
    showToast('Optimizando base de datos...', 'info');
    setTimeout(() => showToast('Base de datos optimizada'), 2000);
  };

  const handleCleanTemp = () => {
    showToast('Limpiando archivos temporales...', 'info');
    setTimeout(() => showToast('Archivos temporales eliminados (450 MB liberados)'), 1500);
  };

  const openEditModal = (user: Usuario) => {
    setSelectedUser(user);
    setEditUserForm({
      nombre: user.nombre,
      email: user.email,
      rol: user.rol,
      estado: user.estado
    });
    setActiveModal('edit');
  };

  const headerActions = (
    <>
      {activeTab === 'users' && (
        <button
          onClick={() => setShowNewUserModal(true)}
          className="hidden sm:flex items-center gap-2 px-4 py-2 bg-purple-500 text-white font-medium rounded-xl hover:bg-purple-400 transition-colors"
        >
          <UserPlus className="w-4 h-4" />
          <span className="hidden lg:inline">Nuevo Usuario</span>
        </button>
      )}
    </>
  );

  return (
    <AppLayout
      title="Panel de Administración"
      subtitle="Gestión completa del sistema"
      headerActions={headerActions}
    >
      <main className="flex-1 overflow-y-auto p-6 lg:p-8">
        {/* Stats Overview */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="p-5 bg-slate-900/60 border border-slate-800 rounded-2xl hover:border-purple-500/30 transition-all"
          >
            <div className="flex items-start justify-between mb-3">
              <div className="w-10 h-10 rounded-xl bg-purple-500/20 flex items-center justify-center">
                <Users className="w-5 h-5 text-purple-500" />
              </div>
              <span className="text-xs text-emerald-500 font-medium">+3 este mes</span>
            </div>
            <h3 className="text-2xl font-bold text-white mb-0.5">{estadisticasUso.usuariosActivos}</h3>
            <p className="text-slate-400 text-sm">Usuarios Activos</p>
            <p className="text-slate-600 text-xs mt-1">de {estadisticasUso.usuariosTotales} totales</p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.05 }}
            className="p-5 bg-slate-900/60 border border-slate-800 rounded-2xl hover:border-blue-500/30 transition-all"
          >
            <div className="flex items-start justify-between mb-3">
              <div className="w-10 h-10 rounded-xl bg-blue-500/20 flex items-center justify-center">
                <FileText className="w-5 h-5 text-blue-500" />
              </div>
              <span className="text-xs text-blue-500 font-medium">+12 hoy</span>
            </div>
            <h3 className="text-2xl font-bold text-white mb-0.5">{estadisticasUso.expedientesActivos}</h3>
            <p className="text-slate-400 text-sm">Expedientes Activos</p>
            <p className="text-slate-600 text-xs mt-1">En el sistema</p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="p-5 bg-slate-900/60 border border-slate-800 rounded-2xl hover:border-amber-500/30 transition-all"
          >
            <div className="flex items-start justify-between mb-3">
              <div className="w-10 h-10 rounded-xl bg-amber-500/20 flex items-center justify-center">
                <HardDrive className="w-5 h-5 text-amber-500" />
              </div>
              <span className="text-xs text-amber-500 font-medium">{estadisticasUso.almacenamientoUsado}%</span>
            </div>
            <h3 className="text-2xl font-bold text-white mb-0.5">{estadisticasUso.almacenamientoUsado} GB</h3>
            <p className="text-slate-400 text-sm">Almacenamiento</p>
            <p className="text-slate-600 text-xs mt-1">de {estadisticasUso.almacenamientoTotal} GB totales</p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
            className="p-5 bg-slate-900/60 border border-slate-800 rounded-2xl hover:border-emerald-500/30 transition-all"
          >
            <div className="flex items-start justify-between mb-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/20 flex items-center justify-center">
                <Database className="w-5 h-5 text-emerald-500" />
              </div>
              <CheckCircle2 className="w-4 h-4 text-emerald-500" />
            </div>
            <h3 className="text-2xl font-bold text-white mb-0.5">{estadisticasUso.backupsRealizados}</h3>
            <p className="text-slate-400 text-sm">Backups</p>
            <p className="text-slate-600 text-xs mt-1">Último: hoy 03:00</p>
          </motion.div>
        </div>

        {/* Tabs */}
        <div className="flex items-center gap-2 mb-6 flex-wrap">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                activeTab === tab.id
                  ? 'bg-purple-500 text-white'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800'
              }`}
            >
              <tab.icon className="w-4 h-4" />
              {tab.label}
            </button>
          ))}
        </div>

        {/* Users Tab */}
        {activeTab === 'users' && (
          <div className="bg-slate-900/60 border border-slate-800 rounded-2xl overflow-hidden">
            <div className="p-4 border-b border-slate-800 flex flex-col lg:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                <input
                  type="text"
                  placeholder="Buscar usuarios por nombre, email o rol..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-4 py-2 bg-slate-800 border border-slate-700 rounded-xl text-white text-sm placeholder-slate-500 focus:outline-none focus:border-purple-500 transition-colors"
                />
              </div>
              <div className="flex gap-3">
                <select className="px-4 py-2 bg-slate-800 border border-slate-700 rounded-xl text-white text-sm">
                  <option value="all">Todos los roles</option>
                  <option value="socio">Socio</option>
                  <option value="abogado_senior">Abogado Senior</option>
                  <option value="abogado_junior">Abogado Junior</option>
                </select>
                <select className="px-4 py-2 bg-slate-800 border border-slate-700 rounded-xl text-white text-sm">
                  <option value="all">Todos los estados</option>
                  <option value="activo">Activos</option>
                  <option value="inactivo">Inactivos</option>
                </select>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-slate-800 bg-slate-900/80">
                    <th className="text-left py-3 px-4 text-xs font-medium text-slate-400 uppercase">Usuario</th>
                    <th className="text-left py-3 px-4 text-xs font-medium text-slate-400 uppercase">Email</th>
                    <th className="text-left py-3 px-4 text-xs font-medium text-slate-400 uppercase">Rol</th>
                    <th className="text-left py-3 px-4 text-xs font-medium text-slate-400 uppercase">Estado</th>
                    <th className="text-left py-3 px-4 text-xs font-medium text-slate-400 uppercase">Último Acceso</th>
                    <th className="text-left py-3 px-4 text-xs font-medium text-slate-400 uppercase"></th>
                  </tr>
                </thead>
                <tbody>
                  {filteredUsers.map((user, index) => (
                    <motion.tr
                      key={user.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.03 }}
                      className="border-b border-slate-800/50 hover:bg-slate-800/30 transition-colors group"
                    >
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-purple-500/20 flex items-center justify-center">
                            <span className="text-sm font-bold text-purple-400">
                              {user.nombre.split(' ').map(n => n[0]).join('')}
                            </span>
                          </div>
                          <span className="text-sm font-medium text-white">{user.nombre}</span>
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <span className="text-sm text-slate-400">{user.email}</span>
                      </td>
                      <td className="py-3 px-4">
                        <span className={`px-2.5 py-1 text-xs font-medium rounded-full border ${getRoleBadgeColor(user.rol)}`}>
                          {getRoleName(user.rol)}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <span className={`px-2.5 py-1 text-xs font-medium rounded-full ${
                          user.estado === 'activo'
                            ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                            : 'bg-slate-500/10 text-slate-400 border border-slate-500/20'
                        }`}>
                          {user.estado === 'activo' ? 'Activo' : 'Inactivo'}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <span className="text-sm text-slate-500">{user.ultimoAcceso}</span>
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button 
                            onClick={() => { setSelectedUser(user); setActiveModal('view'); }}
                            className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-700 rounded-lg" 
                            title="Ver"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          <button 
                            onClick={() => openEditModal(user)}
                            className="p-1.5 text-slate-400 hover:text-blue-400 hover:bg-blue-500/10 rounded-lg" 
                            title="Editar"
                          >
                            <Edit3 className="w-4 h-4" />
                          </button>
                          <button 
                            onClick={() => { setSelectedUser(user); setActiveModal('permissions'); }}
                            className="p-1.5 text-slate-400 hover:text-amber-400 hover:bg-amber-500/10 rounded-lg" 
                            title="Permisos"
                          >
                            <Key className="w-4 h-4" />
                          </button>
                          <button 
                            onClick={() => { setSelectedUser(user); setActiveModal('delete'); }}
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
                Mostrando {filteredUsers.length} de {usersList.length} usuarios
              </p>
            </div>
          </div>
        )}

        {/* Settings Tab */}
        {activeTab === 'settings' && (
          <div className="space-y-6">
            {/* Configuración por categoría */}
            {['sistema', 'seguridad', 'notificaciones'].map((categoria) => (
              <div key={categoria} className="bg-slate-900/60 border border-slate-800 rounded-2xl p-6">
                <h3 className="text-lg font-semibold text-white mb-4 capitalize flex items-center gap-2">
                  {categoria === 'sistema' && <Server className="w-5 h-5 text-purple-500" />}
                  {categoria === 'seguridad' && <Shield className="w-5 h-5 text-amber-500" />}
                  {categoria === 'notificaciones' && <Bell className="w-5 h-5 text-blue-500" />}
                  {categoria}
                </h3>
                <div className="space-y-4">
                  {configuracionSistema
                    .filter(config => config.categoria === categoria)
                    .map((config) => (
                      <div key={config.id} className="flex items-center justify-between p-4 bg-slate-800/50 rounded-xl">
                        <div className="flex-1">
                          <h4 className="text-sm font-medium text-white mb-1">{config.nombre}</h4>
                          <p className="text-xs text-slate-400">{config.descripcion}</p>
                        </div>
                        <button
                          onClick={() => handleToggleConfig(config.id)}
                          className={`ml-4 p-2 rounded-xl transition-colors ${
                            config.activo
                              ? 'bg-emerald-500/20 text-emerald-500 hover:bg-emerald-500/30'
                              : 'bg-slate-700 text-slate-400 hover:bg-slate-600'
                          }`}
                        >
                          {config.activo ? <ToggleRight className="w-6 h-6" /> : <ToggleLeft className="w-6 h-6" />}
                        </button>
                      </div>
                    ))}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Activity Tab */}
        {activeTab === 'activity' && (
          <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-6">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-lg font-semibold text-white">Actividad Reciente</h2>
                <p className="text-sm text-slate-400">Últimas acciones en el sistema</p>
              </div>
              <button 
                onClick={handleExportLog}
                className="text-sm text-purple-500 hover:text-purple-400 flex items-center gap-1"
              >
                <Download className="w-4 h-4" />
                Exportar Log
              </button>
            </div>

            <div className="space-y-3">
              {actividadReciente.map((actividad) => (
                <div key={actividad.id} className="flex items-start gap-4 p-4 bg-slate-800/50 rounded-xl hover:bg-slate-800 transition-colors">
                  <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                    actividad.tipo === 'create' ? 'bg-emerald-500/20' :
                    actividad.tipo === 'update' ? 'bg-blue-500/20' :
                    actividad.tipo === 'upload' ? 'bg-purple-500/20' :
                    actividad.tipo === 'system' ? 'bg-amber-500/20' :
                    'bg-slate-700'
                  }`}>
                    {actividad.tipo === 'create' && <Plus className="w-5 h-5 text-emerald-500" />}
                    {actividad.tipo === 'update' && <Edit3 className="w-5 h-5 text-blue-500" />}
                    {actividad.tipo === 'upload' && <FileText className="w-5 h-5 text-purple-500" />}
                    {actividad.tipo === 'system' && <Server className="w-5 h-5 text-amber-500" />}
                    {actividad.tipo === 'time' && <Clock className="w-5 h-5 text-slate-400" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-white">{actividad.usuario}</p>
                        <p className="text-sm text-slate-400">{actividad.accion}</p>
                        <p className="text-xs text-slate-500 mt-1 font-mono">{actividad.detalle}</p>
                      </div>
                      <span className="text-xs text-slate-500 whitespace-nowrap">{actividad.fecha}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* System Tab */}
        {activeTab === 'system' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Backup */}
              <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 rounded-xl bg-emerald-500/20 flex items-center justify-center">
                    <Database className="w-6 h-6 text-emerald-500" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-white">Respaldo de Datos</h3>
                    <p className="text-xs text-slate-400">Último backup: {estadisticasUso.ultimoBackup}</p>
                  </div>
                </div>
                <div className="space-y-3">
                  <button 
                    onClick={handleCreateBackup}
                    className="w-full py-2.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-sm font-medium rounded-xl transition-colors flex items-center justify-center gap-2"
                  >
                    <RefreshCw className="w-4 h-4" />
                    Crear Backup Ahora
                  </button>
                  <button 
                    onClick={handleDownloadBackup}
                    className="w-full py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 text-sm font-medium rounded-xl transition-colors flex items-center justify-center gap-2"
                  >
                    <Download className="w-4 h-4" />
                    Descargar Último Backup
                  </button>
                  <button 
                    onClick={() => showToast('Configuración de nube próximamente', 'info')}
                    className="w-full py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 text-sm font-medium rounded-xl transition-colors flex items-center justify-center gap-2"
                  >
                    <Cloud className="w-4 h-4" />
                    Configurar Backup en la Nube
                  </button>
                </div>
              </div>

              {/* Mantenimiento */}
              <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 rounded-xl bg-amber-500/20 flex items-center justify-center">
                    <Settings className="w-6 h-6 text-amber-500" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-white">Mantenimiento</h3>
                    <p className="text-xs text-slate-400">Optimización del sistema</p>
                  </div>
                </div>
                <div className="space-y-3">
                  <button 
                    onClick={handleOptimizeDB}
                    className="w-full py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 text-sm font-medium rounded-xl transition-colors flex items-center justify-center gap-2"
                  >
                    <Zap className="w-4 h-4" />
                    Optimizar Base de Datos
                  </button>
                  <button 
                    onClick={handleCleanTemp}
                    className="w-full py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 text-sm font-medium rounded-xl transition-colors flex items-center justify-center gap-2"
                  >
                    <Trash2 className="w-4 h-4" />
                    Limpiar Archivos Temporales
                  </button>
                  <button 
                    onClick={() => showToast('Logs del sistema disponibles en /var/log', 'info')}
                    className="w-full py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 text-sm font-medium rounded-xl transition-colors flex items-center justify-center gap-2"
                  >
                    <Activity className="w-4 h-4" />
                    Ver Logs del Sistema
                  </button>
                </div>
              </div>
            </div>

            {/* Info del Sistema */}
            <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-6">
              <h3 className="text-lg font-semibold text-white mb-4">Información del Sistema</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="p-4 bg-slate-800/50 rounded-xl">
                  <p className="text-xs text-slate-500 mb-1">Versión</p>
                  <p className="text-sm font-bold text-white">v2.5.1</p>
                </div>
                <div className="p-4 bg-slate-800/50 rounded-xl">
                  <p className="text-xs text-slate-500 mb-1">Base de Datos</p>
                  <p className="text-sm font-bold text-white">PostgreSQL 15</p>
                </div>
                <div className="p-4 bg-slate-800/50 rounded-xl">
                  <p className="text-xs text-slate-500 mb-1">Servidor</p>
                  <p className="text-sm font-bold text-white">Node.js 20.x</p>
                </div>
                <div className="p-4 bg-slate-800/50 rounded-xl">
                  <p className="text-xs text-slate-500 mb-1">Uptime</p>
                  <p className="text-sm font-bold text-emerald-400">99.8%</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Roles Tab */}
        {activeTab === 'roles' && (
          <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-6">
            <h2 className="text-lg font-semibold text-white mb-6">Gestión de Roles y Permisos</h2>

            <div className="space-y-4">
              {['super_admin', 'socio', 'abogado_senior', 'abogado_junior', 'paralegal', 'secretario', 'administrador', 'contador', 'recepcionista'].map((rol) => (
                <div key={rol} className="p-4 bg-slate-800/50 rounded-xl hover:bg-slate-800 transition-colors">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-lg bg-purple-500/20 flex items-center justify-center">
                        <Shield className="w-5 h-5 text-purple-500" />
                      </div>
                      <div>
                        <h4 className="text-sm font-medium text-white">{getRoleName(rol)}</h4>
                        <p className="text-xs text-slate-400">
                          {rol === 'super_admin' && 'Acceso total al sistema'}
                          {rol === 'socio' && 'Gestión ejecutiva y supervisión'}
                          {rol === 'abogado_senior' && 'Gestión de casos y supervisión de juniors'}
                          {rol === 'abogado_junior' && 'Trabajo en casos asignados'}
                          {rol === 'paralegal' && 'Apoyo legal y trámites'}
                          {rol === 'secretario' && 'Gestión administrativa y archivo'}
                          {rol === 'administrador' && 'Gestión administrativa y financiera'}
                          {rol === 'contador' && 'Gestión contable y fiscal'}
                          {rol === 'recepcionista' && 'Atención al cliente y agenda'}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className={`px-3 py-1.5 rounded-lg border text-xs font-medium ${getRoleBadgeColor(rol)}`}>
                        {usuarios.filter(u => u.rol === rol && u.estado === 'activo').length} usuarios
                      </span>
                      <button className="p-2 text-slate-400 hover:text-white hover:bg-slate-700 rounded-lg">
                        <Settings className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Admin Badge */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="mt-6 p-4 bg-purple-500/10 border border-purple-500/20 rounded-xl"
        >
          <div className="flex items-start gap-3">
            <div className="p-2 rounded-lg bg-purple-500/20">
              <Crown className="w-5 h-5 text-purple-400" />
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <h4 className="text-sm font-medium text-white">Panel de Super Administrador</h4>
                <span className="text-xs px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-400 border border-purple-500/30">
                  Acceso Total
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-1">
                Tienes control completo sobre usuarios, roles, configuración y todos los aspectos del sistema.
              </p>
            </div>
          </div>
        </motion.div>
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
              toast.type === 'error' ? 'bg-red-500' : 'bg-purple-500'
            } text-slate-950 font-medium`}
          >
            {toast.type === 'success' ? <CheckCircle className="w-5 h-5" /> : 
             toast.type === 'error' ? <AlertTriangle className="w-5 h-5" /> : <Info className="w-5 h-5" />}
            {toast.message}
          </motion.div>
        )}
      </AnimatePresence>

      {/* New User Modal */}
      <AnimatePresence>
        {showNewUserModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => setShowNewUserModal(false)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-lg p-6"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-white">Nuevo Usuario</h2>
                <button onClick={() => setShowNewUserModal(false)} className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg">
                  <X className="w-5 h-5" />
                </button>
              </div>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm text-slate-400 mb-2">Nombre Completo</label>
                  <input 
                    type="text" 
                    value={newUserForm.nombre}
                    onChange={(e) => setNewUserForm({...newUserForm, nombre: e.target.value})}
                    placeholder="Juan Pérez" 
                    className="w-full px-4 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-white" 
                  />
                </div>
                <div>
                  <label className="block text-sm text-slate-400 mb-2">Email</label>
                  <input 
                    type="email" 
                    value={newUserForm.email}
                    onChange={(e) => setNewUserForm({...newUserForm, email: e.target.value})}
                    placeholder="juan@bufete.com" 
                    className="w-full px-4 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-white" 
                  />
                </div>
                <div>
                  <label className="block text-sm text-slate-400 mb-2">Rol</label>
                  <select 
                    value={newUserForm.rol}
                    onChange={(e) => setNewUserForm({...newUserForm, rol: e.target.value})}
                    className="w-full px-4 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-white"
                  >
                    <option value="">Seleccionar rol...</option>
                    <option value="socio">Socio / Director</option>
                    <option value="abogado_senior">Abogado Senior</option>
                    <option value="abogado_junior">Abogado Junior</option>
                    <option value="paralegal">Paralegal</option>
                    <option value="secretario">Secretario</option>
                    <option value="administrador">Administrador</option>
                    <option value="contador">Contador</option>
                    <option value="recepcionista">Recepcionista</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm text-slate-400 mb-2">Contraseña Temporal</label>
                  <input 
                    type="password" 
                    value={newUserForm.password}
                    onChange={(e) => setNewUserForm({...newUserForm, password: e.target.value})}
                    placeholder="••••••••" 
                    className="w-full px-4 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-white" 
                  />
                </div>
                <div className="p-3 bg-amber-500/10 border border-amber-500/20 rounded-xl">
                  <p className="text-xs text-amber-400 flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4" />
                    El usuario deberá cambiar su contraseña en el primer inicio de sesión
                  </p>
                </div>
              </div>
              <div className="flex gap-3 mt-6">
                <button onClick={() => setShowNewUserModal(false)} className="flex-1 px-4 py-2.5 bg-slate-800 text-white rounded-xl hover:bg-slate-700">
                  Cancelar
                </button>
                <button onClick={handleCreateUser} className="flex-1 px-4 py-2.5 bg-purple-500 text-white font-medium rounded-xl hover:bg-purple-400">
                  Crear Usuario
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* View User Modal */}
      <AnimatePresence>
        {activeModal === 'view' && selectedUser && (
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
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-white">Detalle de Usuario</h2>
                <button onClick={() => setActiveModal(null)} className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg">
                  <X className="w-5 h-5" />
                </button>
              </div>
              <div className="space-y-4">
                <div className="flex items-center gap-4 p-4 bg-slate-800/50 rounded-xl">
                  <div className="w-16 h-16 rounded-full bg-purple-500/20 flex items-center justify-center">
                    <span className="text-xl font-bold text-purple-400">
                      {selectedUser.nombre.split(' ').map(n => n[0]).join('')}
                    </span>
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-white">{selectedUser.nombre}</h3>
                    <span className={`px-2.5 py-1 text-xs font-medium rounded-full border ${getRoleBadgeColor(selectedUser.rol)}`}>
                      {getRoleName(selectedUser.rol)}
                    </span>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-4 bg-slate-800/50 rounded-xl">
                    <p className="text-xs text-slate-400 mb-1">Email</p>
                    <p className="text-sm text-white">{selectedUser.email}</p>
                  </div>
                  <div className="p-4 bg-slate-800/50 rounded-xl">
                    <p className="text-xs text-slate-400 mb-1">Estado</p>
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                      selectedUser.estado === 'activo'
                        ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                        : 'bg-slate-500/10 text-slate-400 border border-slate-500/20'
                    }`}>
                      {selectedUser.estado === 'activo' ? 'Activo' : 'Inactivo'}
                    </span>
                  </div>
                </div>
                <div className="p-4 bg-slate-800/50 rounded-xl">
                  <p className="text-xs text-slate-400 mb-1">Último Acceso</p>
                  <p className="text-sm text-white">{selectedUser.ultimoAcceso}</p>
                </div>
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

      {/* Edit User Modal */}
      <AnimatePresence>
        {activeModal === 'edit' && selectedUser && (
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
                <h2 className="text-xl font-bold text-white">Editar Usuario</h2>
                <button onClick={() => setActiveModal(null)} className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg">
                  <X className="w-5 h-5" />
                </button>
              </div>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm text-slate-400 mb-2">Nombre Completo</label>
                  <input 
                    type="text" 
                    value={editUserForm.nombre}
                    onChange={(e) => setEditUserForm({...editUserForm, nombre: e.target.value})}
                    className="w-full px-4 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-white" 
                  />
                </div>
                <div>
                  <label className="block text-sm text-slate-400 mb-2">Email</label>
                  <input 
                    type="email" 
                    value={editUserForm.email}
                    onChange={(e) => setEditUserForm({...editUserForm, email: e.target.value})}
                    className="w-full px-4 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-white" 
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm text-slate-400 mb-2">Rol</label>
                    <select 
                      value={editUserForm.rol}
                      onChange={(e) => setEditUserForm({...editUserForm, rol: e.target.value})}
                      className="w-full px-4 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-white"
                    >
                      <option value="socio">Socio / Director</option>
                      <option value="abogado_senior">Abogado Senior</option>
                      <option value="abogado_junior">Abogado Junior</option>
                      <option value="paralegal">Paralegal</option>
                      <option value="secretario">Secretario</option>
                      <option value="administrador">Administrador</option>
                      <option value="contador">Contador</option>
                      <option value="recepcionista">Recepcionista</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm text-slate-400 mb-2">Estado</label>
                    <select 
                      value={editUserForm.estado}
                      onChange={(e) => setEditUserForm({...editUserForm, estado: e.target.value})}
                      className="w-full px-4 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-white"
                    >
                      <option value="activo">Activo</option>
                      <option value="inactivo">Inactivo</option>
                    </select>
                  </div>
                </div>
              </div>
              <div className="flex gap-3 mt-6">
                <button onClick={() => setActiveModal(null)} className="flex-1 px-4 py-2.5 bg-slate-800 text-white rounded-xl hover:bg-slate-700">
                  Cancelar
                </button>
                <button onClick={handleEditUser} className="flex-1 px-4 py-2.5 bg-blue-500 text-white font-medium rounded-xl hover:bg-blue-400">
                  Guardar Cambios
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Permissions Modal */}
      <AnimatePresence>
        {activeModal === 'permissions' && selectedUser && (
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
                <h2 className="text-xl font-bold text-white">Permisos de Usuario</h2>
                <button onClick={() => setActiveModal(null)} className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg">
                  <X className="w-5 h-5" />
                </button>
              </div>
              <div className="p-4 bg-amber-500/10 border border-amber-500/20 rounded-xl mb-4">
                <p className="text-sm text-amber-400 font-medium">{selectedUser.nombre}</p>
                <p className="text-xs text-slate-400">{getRoleName(selectedUser.rol)}</p>
              </div>
              <div className="space-y-3 max-h-64 overflow-y-auto">
                {['Dashboard', 'Expedientes', 'Clientes', 'Calendario', 'Facturación', 'Tiempo', 'Biblioteca', 'Contabilidad'].map((permiso) => (
                  <label key={permiso} className="flex items-center gap-3 p-3 bg-slate-800/50 rounded-xl cursor-pointer hover:bg-slate-800 transition-colors">
                    <input type="checkbox" defaultChecked className="w-4 h-4 rounded border-slate-600 text-purple-500" />
                    <span className="text-sm text-slate-300">{permiso}</span>
                  </label>
                ))}
              </div>
              <div className="flex gap-3 mt-6">
                <button onClick={() => setActiveModal(null)} className="flex-1 px-4 py-2.5 bg-slate-800 text-white rounded-xl hover:bg-slate-700">
                  Cerrar
                </button>
                <button onClick={() => { showToast('Permisos actualizados'); setActiveModal(null); }} className="flex-1 px-4 py-2.5 bg-purple-500 text-white font-medium rounded-xl hover:bg-purple-400">
                  Guardar
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Delete User Modal */}
      <AnimatePresence>
        {activeModal === 'delete' && selectedUser && (
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
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-white">Eliminar Usuario</h2>
                <button onClick={() => setActiveModal(null)} className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg">
                  <X className="w-5 h-5" />
                </button>
              </div>
              <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-xl mb-4">
                <p className="text-sm text-red-400 font-medium mb-2">⚠️ Esta acción no se puede deshacer</p>
                <p className="text-xs text-slate-400">Usuario:</p>
                <p className="text-white font-medium">{selectedUser.nombre}</p>
                <p className="text-sm text-slate-400">{selectedUser.email}</p>
              </div>
              <p className="text-sm text-slate-400 mb-6">
                ¿Estás seguro de que deseas eliminar este usuario permanentemente? Todos sus datos asociados serán eliminados.
              </p>
              <div className="flex gap-3">
                <button onClick={() => setActiveModal(null)} className="flex-1 px-4 py-2.5 bg-slate-800 text-white rounded-xl hover:bg-slate-700">
                  Cancelar
                </button>
                <button onClick={handleDeleteUser} className="flex-1 px-4 py-2.5 bg-red-500 text-white font-medium rounded-xl hover:bg-red-400">
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

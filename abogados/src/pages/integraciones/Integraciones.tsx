// M13 - Integraciones: Panel de Gestión de Integraciones Externas

import { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Link, CheckCircle, XCircle, RefreshCw, Settings,
  Building2, Mail, Cloud, Database, FileText, Shield,
  Zap, Globe, Clock, AlertTriangle
} from 'lucide-react';
import { AppLayout } from '@/components/layout/AppLayout';

interface Integracion {
  id: string;
  nombre: string;
  descripcion: string;
  icono: React.ReactNode;
  color: string;
  estado: 'conectado' | 'desconectado' | 'error' | 'sincronizando';
  ultimaSincronizacion: string;
  notificaciones: number;
  tipo: 'comunicaciones' | 'almacenamiento' | 'facturacion' | 'legal' | 'analytics';
}

const integracionesMock: Integracion[] = [
  {
    id: 'lexnet',
    nombre: 'LexNET',
    descripcion: 'Comunicaciones judiciales electrónicas',
    icono: <Building2 className="w-6 h-6" />,
    color: 'from-blue-500 to-blue-700',
    estado: 'conectado',
    ultimaSincronizacion: 'Hace 5 minutos',
    notificaciones: 3,
    tipo: 'comunicaciones',
  },
  {
    id: 'minerva',
    nombre: 'Minerva',
    descripcion: 'Gestión integral de abogados',
    icono: <Database className="w-6 h-6" />,
    color: 'from-purple-500 to-purple-700',
    estado: 'conectado',
    ultimaSincronizacion: 'Hace 1 hora',
    notificaciones: 0,
    tipo: 'legal',
  },
  {
    id: 'notifica',
    nombre: 'e-Notifica',
    descripcion: 'Notificaciones electrónicas administrativas',
    icono: <Mail className="w-6 h-6" />,
    color: 'from-emerald-500 to-emerald-700',
    estado: 'conectado',
    ultimaSincronizacion: 'Hace 15 minutos',
    notificaciones: 12,
    tipo: 'comunicaciones',
  },
  {
    id: 'cloud',
    nombre: 'Cloud Storage',
    descripcion: 'Almacenamiento en la nube',
    icono: <Cloud className="w-6 h-6" />,
    color: 'from-amber-500 to-orange-600',
    estado: 'sincronizando',
    ultimaSincronizacion: 'Sincronizando...',
    notificaciones: 0,
    tipo: 'almacenamiento',
  },
  {
    id: 'facturacion',
    nombre: 'Facturación Electrónica',
    descripcion: 'Sistema de facturación y contabilidad',
    icono: <FileText className="w-6 h-6" />,
    color: 'from-rose-500 to-rose-700',
    estado: 'conectado',
    ultimaSincronizacion: 'Ayer',
    notificaciones: 0,
    tipo: 'facturacion',
  },
  {
    id: 'seguridad',
    nombre: 'Validación Identidad',
    descripcion: 'Verificación y autenticación de documentos',
    icono: <Shield className="w-6 h-6" />,
    color: 'from-cyan-500 to-cyan-700',
    estado: 'conectado',
    ultimaSincronizacion: 'Hace 3 días',
    notificaciones: 0,
    tipo: 'legal',
  },
  {
    id: 'ia',
    nombre: 'AI Analytics',
    descripcion: 'Análisis inteligente de documentos',
    icono: <Zap className="w-6 h-6" />,
    color: 'from-violet-500 to-violet-700',
    estado: 'desconectado',
    ultimaSincronizacion: 'Nunca',
    notificaciones: 0,
    tipo: 'analytics',
  },
  {
    id: 'portales',
    nombre: 'Portales Judiciales',
    descripcion: 'Acceso a tribunales y audiencias',
    icono: <Globe className="w-6 h-6" />,
    color: 'from-teal-500 to-teal-700',
    estado: 'error',
    ultimaSincronizacion: 'Hace 2 días',
    notificaciones: 5,
    tipo: 'comunicaciones',
  },
];

const tipoLabels: Record<string, string> = {
  comunicaciones: 'Comunicaciones',
  almacenamiento: 'Almacenamiento',
  facturacion: 'Facturación',
  legal: 'Legal',
  analytics: 'Analytics',
};

export default function Integraciones() {
  const [integraciones, setIntegraciones] = useState(integracionesMock);
  const [filtroTipo, setFiltroTipo] = useState<string>('todos');
  const [filtroEstado, setFiltroEstado] = useState<string>('todos');

  const getEstadoBadge = (estado: Integracion['estado']) => {
    switch (estado) {
      case 'conectado':
        return (
          <span className="flex items-center gap-1.5 px-2 py-1 bg-emerald-500/10 text-emerald-400 rounded-full text-xs font-medium">
            <CheckCircle className="w-3 h-3" />
            Conectado
          </span>
        );
      case 'desconectado':
        return (
          <span className="flex items-center gap-1.5 px-2 py-1 bg-gray-500/10 text-gray-400 rounded-full text-xs font-medium">
            <XCircle className="w-3 h-3" />
            Desconectado
          </span>
        );
      case 'error':
        return (
          <span className="flex items-center gap-1.5 px-2 py-1 bg-red-500/10 text-red-400 rounded-full text-xs font-medium">
            <AlertTriangle className="w-3 h-3" />
            Error
          </span>
        );
      case 'sincronizando':
        return (
          <span className="flex items-center gap-1.5 px-2 py-1 bg-amber-500/10 text-amber-400 rounded-full text-xs font-medium">
            <RefreshCw className="w-3 h-3 animate-spin" />
            Sincronizando
          </span>
        );
    }
  };

  const handleSync = (id: string) => {
    setIntegraciones(prev => prev.map(inv => 
      inv.id === id ? { ...inv, estado: 'sincronizando' as const } : inv
    ));
    setTimeout(() => {
      setIntegraciones(prev => prev.map(inv => 
        inv.id === id ? { ...inv, estado: 'conectado' as const, ultimaSincronizacion: 'Ahora' } : inv
      ));
    }, 2000);
  };

  const integracionesFiltradas = integraciones.filter(inv => {
    const matchesTipo = filtroTipo === 'todos' || inv.tipo === filtroTipo;
    const matchesEstado = filtroEstado === 'todos' || inv.estado === filtroEstado;
    return matchesTipo && matchesEstado;
  });

  const stats = {
    total: integraciones.length,
    conectadas: integraciones.filter(i => i.estado === 'conectado').length,
    errores: integraciones.filter(i => i.estado === 'error').length,
    notificaciones: integraciones.reduce((acc, i) => acc + i.notificaciones, 0),
  };

  return (
    <AppLayout title="Integraciones" subtitle="Gestión de servicios externos">
    <div className="p-6 space-y-6">
      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-theme-card border border-theme rounded-xl p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-500/20 rounded-xl flex items-center justify-center">
              <Link className="w-5 h-5 text-blue-400" />
            </div>
            <div>
              <p className="text-sm text-theme-secondary">Total integraciones</p>
              <p className="text-2xl font-bold text-theme-primary">{stats.total}</p>
            </div>
          </div>
        </div>
        <div className="bg-theme-card border border-theme rounded-xl p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-emerald-500/20 rounded-xl flex items-center justify-center">
              <CheckCircle className="w-5 h-5 text-emerald-400" />
            </div>
            <div>
              <p className="text-sm text-theme-secondary">Conectadas</p>
              <p className="text-2xl font-bold text-theme-primary">{stats.conectadas}</p>
            </div>
          </div>
        </div>
        <div className="bg-theme-card border border-theme rounded-xl p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-red-500/20 rounded-xl flex items-center justify-center">
              <AlertTriangle className="w-5 h-5 text-red-400" />
            </div>
            <div>
              <p className="text-sm text-theme-secondary">Errores</p>
              <p className="text-2xl font-bold text-theme-primary">{stats.errores}</p>
            </div>
          </div>
        </div>
        <div className="bg-theme-card border border-theme rounded-xl p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-amber-500/20 rounded-xl flex items-center justify-center">
              <Clock className="w-5 h-5 text-amber-400" />
            </div>
            <div>
              <p className="text-sm text-theme-secondary">Notificaciones</p>
              <p className="text-2xl font-bold text-theme-primary">{stats.notificaciones}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Filtros */}
      <div className="flex flex-wrap gap-4 items-center">
        <div className="flex items-center gap-2">
          <span className="text-sm text-theme-secondary">Tipo:</span>
          <select
            value={filtroTipo}
            onChange={(e) => setFiltroTipo(e.target.value)}
            className="px-3 py-1.5 bg-theme-card border border-theme rounded-lg text-theme-primary text-sm"
          >
            <option value="todos">Todos</option>
            <option value="comunicaciones">Comunicaciones</option>
            <option value="almacenamiento">Almacenamiento</option>
            <option value="facturacion">Facturación</option>
            <option value="legal">Legal</option>
            <option value="analytics">Analytics</option>
          </select>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-sm text-theme-secondary">Estado:</span>
          <select
            value={filtroEstado}
            onChange={(e) => setFiltroEstado(e.target.value)}
            className="px-3 py-1.5 bg-theme-card border border-theme rounded-lg text-theme-primary text-sm"
          >
            <option value="todos">Todos</option>
            <option value="conectado">Conectado</option>
            <option value="desconectado">Desconectado</option>
            <option value="error">Error</option>
          </select>
        </div>
      </div>

      {/* Grid de Integraciones */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {integracionesFiltradas.map((integracion, index) => (
          <motion.div
            key={integracion.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
            className="bg-theme-card border border-theme rounded-xl p-5 hover:border-accent/50 transition-all group"
          >
            <div className="flex items-start justify-between mb-4">
              <div className={`w-12 h-12 bg-gradient-to-br ${integracion.color} rounded-xl flex items-center justify-center text-white`}>
                {integracion.icono}
              </div>
              {getEstadoBadge(integracion.estado)}
            </div>

            <h3 className="font-semibold text-theme-primary mb-1">{integracion.nombre}</h3>
            <p className="text-sm text-theme-secondary mb-4">{integracion.descripcion}</p>

            <div className="flex items-center justify-between text-xs text-theme-muted mb-4">
              <span className="px-2 py-1 bg-theme-tertiary rounded-lg">
                {tipoLabels[integracion.tipo]}
              </span>
              <span className="flex items-center gap-1">
                <Clock className="w-3 h-3" />
                {integracion.ultimaSincronizacion}
              </span>
            </div>

            {integracion.notificaciones > 0 && (
              <div className="flex items-center gap-2 mb-4 text-sm text-amber-400">
                <AlertTriangle className="w-4 h-4" />
                <span>{integracion.notificaciones} notificaciones pendientes</span>
              </div>
            )}

            <div className="flex gap-2">
              <button
                onClick={() => handleSync(integracion.id)}
                disabled={integracion.estado === 'sincronizando'}
                className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-theme-tertiary hover:bg-theme-border text-theme-secondary hover:text-theme-primary rounded-lg text-sm transition-colors disabled:opacity-50"
              >
                <RefreshCw className={`w-4 h-4 ${integracion.estado === 'sincronizando' ? 'animate-spin' : ''}`} />
                Sincronizar
              </button>
              <button className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-theme-tertiary hover:bg-theme-border text-theme-secondary hover:text-theme-primary rounded-lg text-sm transition-colors">
                <Settings className="w-4 h-4" />
                Configurar
              </button>
            </div>
          </motion.div>
        ))}
      </div>

      {integracionesFiltradas.length === 0 && (
        <div className="text-center py-12">
          <Link className="w-12 h-12 text-theme-muted mx-auto mb-4" />
          <p className="text-theme-secondary">No se encontraron integraciones con los filtros seleccionados</p>
        </div>
      )}
    </div>
    </AppLayout>
  );
}

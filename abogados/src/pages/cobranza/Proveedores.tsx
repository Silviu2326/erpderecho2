// M4 - Cobranza Pro: Proveedores
// Directorio y evaluación de proveedores

import { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Building2, Plus, Search, Star, Edit2, Trash2, 
  Phone, Mail, MapPin, FileText, DollarSign,
  CheckCircle, XCircle, AlertTriangle, Filter
} from 'lucide-react';

// Datos mock
const proveedoresMock = [
  { 
    id: 'PROV-001', 
    nombre: 'TechServicios S.L.', 
    cif: 'B12345678',
    categoria: 'Informática',
    telefono: '+34 912 345 678',
    email: 'contacto@techservicios.es',
    direccion: 'C/ Mayor 123, Madrid',
    rating: 4.5,
    evaluaciones: 12,
    facturacionAnual: 45000,
    estado: 'activo',
    ultimoTrabajo: '2024-05-10',
    notas: 'Excelente servicio técnico'
  },
  { 
    id: 'PROV-002', 
    nombre: 'Limpiezas Express',
    cif: 'B87654321',
    categoria: 'Limpieza',
    telefono: '+34 654 987 321',
    email: 'info@limpiezasexpress.com',
    direccion: 'C/ Gran Vía 45, Madrid',
    rating: 3.8,
    evaluaciones: 8,
    facturacionAnual: 12000,
    estado: 'activo',
    ultimoTrabajo: '2024-05-15',
    notas: 'Buena relación calidad-precio'
  },
  { 
    id: 'PROV-003', 
    nombre: 'Abogados Associates',
    cif: 'B11223344',
    categoria: 'Legal',
    telefono: '+34 917 654 321',
    email: 'contacto@abogadosassoc.es',
    direccion: 'Paseo de la Castellana 100, Madrid',
    rating: 4.2,
    evaluaciones: 5,
    facturacionAnual: 85000,
    estado: 'activo',
    ultimoTrabajo: '2024-04-20',
    notas: 'Especialistas en derecho mercantil'
  },
  { 
    id: 'PROV-004', 
    nombre: 'Printing Center',
    cif: 'B99887766',
    categoria: 'Impresión',
    telefono: '+34 915 123 456',
    email: 'ventas@printingcenter.es',
    direccion: 'C/ Alcalá 200, Madrid',
    rating: 2.5,
    evaluaciones: 4,
    facturacionAnual: 3500,
    estado: 'inactivo',
    ultimoTrabajo: '2023-11-15',
    notas: 'Problemas con la calidad de impresión'
  },
];

const categorias = ['todos', 'Informática', 'Limpieza', 'Legal', 'Impresión', 'Consultoría', 'Traducciones'];

export default function CobranzaProveedores() {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategoria, setFilterCategoria] = useState('todos');
  const [filterEstado, setFilterEstado] = useState('todos');
  const [proveedores, setProveedores] = useState(proveedoresMock);
  const [showModal, setShowModal] = useState(false);
  const [selectedProveedor, setSelectedProveedor] = useState<typeof proveedoresMock[0] | null>(null);

  const filteredProveedores = proveedores.filter(p => {
    const matchesSearch = p.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          p.cif.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategoria = filterCategoria === 'todos' || p.categoria === filterCategoria;
    const matchesEstado = filterEstado === 'todos' || p.estado === filterEstado;
    return matchesSearch && matchesCategoria && matchesEstado;
  });

  const getRatingColor = (rating: number) => {
    if (rating >= 4) return 'text-emerald-400';
    if (rating >= 3) return 'text-amber-400';
    return 'text-red-400';
  };

  const getEstadoBadge = (estado: string) => {
    if (estado === 'activo') {
      return <span className="px-2 py-1 text-xs rounded-full bg-emerald-500/10 text-emerald-400">Activo</span>;
    }
    return <span className="px-2 py-1 text-xs rounded-full bg-red-500/10 text-red-400">Inactivo</span>;
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 }).format(amount);
  };

  const totalFacturacion = filteredProveedores.reduce((sum, p) => sum + p.facturacionAnual, 0);
  const promedioRating = filteredProveedores.reduce((sum, p) => sum + p.rating, 0) / filteredProveedores.length;
  const proveedoresActivos = filteredProveedores.filter(p => p.estado === 'activo').length;

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-theme-primary">Proveedores</h1>
          <p className="text-theme-secondary">Directorio y evaluación de proveedores</p>
        </div>
        <button
          onClick={() => { setSelectedProveedor(null); setShowModal(true); }}
          className="flex items-center gap-2 px-4 py-2 bg-accent text-white font-medium rounded-xl hover:bg-accent-hover transition-colors"
        >
          <Plus className="w-4 h-4" />
          Nuevo Proveedor
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-theme-card border border-theme rounded-xl p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-500/20 rounded-xl flex items-center justify-center">
              <Building2 className="w-5 h-5 text-blue-400" />
            </div>
            <div>
              <p className="text-2xl font-bold text-theme-primary">{filteredProveedores.length}</p>
              <p className="text-sm text-theme-secondary">Total proveedores</p>
            </div>
          </div>
        </div>
        <div className="bg-theme-card border border-theme rounded-xl p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-emerald-500/20 rounded-xl flex items-center justify-center">
              <CheckCircle className="w-5 h-5 text-emerald-400" />
            </div>
            <div>
              <p className="text-2xl font-bold text-theme-primary">{proveedoresActivos}</p>
              <p className="text-sm text-theme-secondary">Activos</p>
            </div>
          </div>
        </div>
        <div className="bg-theme-card border border-theme rounded-xl p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-amber-500/20 rounded-xl flex items-center justify-center">
              <Star className="w-5 h-5 text-amber-400" />
            </div>
            <div>
              <p className="text-2xl font-bold text-theme-primary">{promedioRating.toFixed(1)}</p>
              <p className="text-sm text-theme-secondary">Rating promedio</p>
            </div>
          </div>
        </div>
        <div className="bg-theme-card border border-theme rounded-xl p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-purple-500/20 rounded-xl flex items-center justify-center">
              <DollarSign className="w-5 h-5 text-purple-400" />
            </div>
            <div>
              <p className="text-2xl font-bold text-theme-primary">{formatCurrency(totalFacturacion)}</p>
              <p className="text-sm text-theme-secondary">Facturación anual</p>
            </div>
          </div>
        </div>
      </div>

      {/* Filtros */}
      <div className="flex flex-wrap gap-4 bg-theme-card border border-theme rounded-xl p-4">
        <div className="flex-1 min-w-[200px]">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-theme-muted" />
            <input
              type="text"
              placeholder="Buscar proveedor..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-theme-tertiary border border-theme rounded-xl text-theme-primary placeholder-theme-muted focus:outline-none focus:border-accent"
            />
          </div>
        </div>
        <select
          value={filterCategoria}
          onChange={(e) => setFilterCategoria(e.target.value)}
          className="px-4 py-2 bg-theme-tertiary border border-theme rounded-xl text-theme-primary focus:outline-none focus:border-accent"
        >
          {categorias.map(cat => (
            <option key={cat} value={cat}>
              {cat === 'todos' ? 'Todas las categorías' : cat}
            </option>
          ))}
        </select>
        <select
          value={filterEstado}
          onChange={(e) => setFilterEstado(e.target.value)}
          className="px-4 py-2 bg-theme-tertiary border border-theme rounded-xl text-theme-primary focus:outline-none focus:border-accent"
        >
          <option value="todos">Todos los estados</option>
          <option value="activo">Activo</option>
          <option value="inactivo">Inactivo</option>
        </select>
      </div>

      {/* Grid de proveedores */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredProveedores.map((proveedor) => (
          <motion.div
            key={proveedor.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-theme-card border border-theme rounded-xl p-4 hover:border-accent/50 transition-colors cursor-pointer"
            onClick={() => { setSelectedProveedor(proveedor); setShowModal(true); }}
          >
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-theme-tertiary rounded-xl flex items-center justify-center">
                  <Building2 className="w-6 h-6 text-theme-muted" />
                </div>
                <div>
                  <h3 className="font-medium text-theme-primary">{proveedor.nombre}</h3>
                  <p className="text-sm text-theme-muted">{proveedor.cif}</p>
                </div>
              </div>
              {getEstadoBadge(proveedor.estado)}
            </div>

            <div className="flex items-center gap-2 mb-3">
              <span className="px-2 py-1 text-xs rounded bg-theme-tertiary text-theme-secondary">
                {proveedor.categoria}
              </span>
              <div className="flex items-center gap-1">
                {[1, 2, 3, 4, 5].map((star) => (
                  <Star
                    key={star}
                    className={`w-3 h-3 ${
                      star <= proveedor.rating
                        ? 'text-amber-400 fill-amber-400'
                        : 'text-theme-muted'
                    }`}
                  />
                ))}
                <span className={`ml-1 text-sm ${getRatingColor(proveedor.rating)}`}>
                  {proveedor.rating}
                </span>
              </div>
            </div>

            <div className="space-y-2 text-sm">
              <div className="flex items-center gap-2 text-theme-secondary">
                <Mail className="w-4 h-4" />
                <span className="truncate">{proveedor.email}</span>
              </div>
              <div className="flex items-center gap-2 text-theme-secondary">
                <Phone className="w-4 h-4" />
                <span>{proveedor.telefono}</span>
              </div>
              <div className="flex items-center gap-2 text-theme-secondary">
                <DollarSign className="w-4 h-4" />
                <span>{formatCurrency(proveedor.facturacionAnual)}/año</span>
              </div>
            </div>

            <div className="flex gap-2 mt-4 pt-3 border-t border-theme">
              <button className="flex-1 py-1.5 text-xs text-theme-secondary hover:text-theme-primary bg-theme-tertiary rounded-lg transition-colors">
                {proveedor.evaluaciones} evaluaciones
              </button>
              <button className="px-3 py-1.5 text-xs text-theme-muted hover:text-theme-primary">
                Ver más
              </button>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Modal de detalle */}
      {showModal && selectedProveedor && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60"
          onClick={() => setShowModal(false)}
        >
          <motion.div
            initial={{ scale: 0.95 }}
            animate={{ scale: 1 }}
            className="bg-theme-secondary border border-theme rounded-2xl p-6 max-w-2xl w-full max-h-[80vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start justify-between mb-6">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 bg-theme-tertiary rounded-2xl flex items-center justify-center">
                  <Building2 className="w-8 h-8 text-theme-muted" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-theme-primary">{selectedProveedor.nombre}</h2>
                  <p className="text-theme-secondary">{selectedProveedor.cif}</p>
                </div>
              </div>
              <button
                onClick={() => setShowModal(false)}
                className="p-2 text-theme-muted hover:text-theme-primary hover:bg-theme-tertiary rounded-lg"
              >
                <XCircle className="w-5 h-5" />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-4 mb-6">
              <div className="p-3 bg-theme-tertiary/50 rounded-xl">
                <p className="text-xs text-theme-muted">Categoría</p>
                <p className="text-theme-primary font-medium">{selectedProveedor.categoria}</p>
              </div>
              <div className="p-3 bg-theme-tertiary/50 rounded-xl">
                <p className="text-xs text-theme-muted">Estado</p>
                {getEstadoBadge(selectedProveedor.estado)}
              </div>
              <div className="p-3 bg-theme-tertiary/50 rounded-xl">
                <p className="text-xs text-theme-muted">Teléfono</p>
                <p className="text-theme-primary font-medium">{selectedProveedor.telefono}</p>
              </div>
              <div className="p-3 bg-theme-tertiary/50 rounded-xl">
                <p className="text-xs text-theme-muted">Facturación Anual</p>
                <p className="text-theme-primary font-medium">{formatCurrency(selectedProveedor.facturacionAnual)}</p>
              </div>
            </div>

            <div className="space-y-3 mb-6">
              <div>
                <label className="text-xs text-theme-muted">Email</label>
                <p className="text-theme-primary">{selectedProveedor.email}</p>
              </div>
              <div>
                <label className="text-xs text-theme-muted">Dirección</label>
                <p className="text-theme-primary">{selectedProveedor.direccion}</p>
              </div>
              <div>
                <label className="text-xs text-theme-muted">Notas</label>
                <p className="text-theme-secondary">{selectedProveedor.notas}</p>
              </div>
            </div>

            <div className="flex gap-3 pt-4 border-t border-theme">
              <button className="flex-1 py-2 bg-accent text-white font-medium rounded-xl hover:bg-accent-hover transition-colors">
                Editar
              </button>
              <button className="px-4 py-2 border border-theme text-theme-secondary rounded-xl hover:bg-theme-tertiary transition-colors">
                Eliminar
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </div>
  );
}

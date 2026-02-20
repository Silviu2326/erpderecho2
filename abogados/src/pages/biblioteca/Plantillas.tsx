import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Plus, FileText, FileSpreadsheet, File, Search, Download, 
  Eye, Edit2, Copy, Trash2, MoreVertical, FileSignature,
  Gavel, ClipboardList, Mail, Building, LayoutTemplate,
  Lock, Crown, Users, CheckCircle, AlertCircle, X,
  Flame, Sparkles, Copy as CopyIcon, Check, Wand2
} from 'lucide-react';
import { AppLayout } from '@/components/layout/AppLayout';
import { 
  plantillasData as initialPlantillasData, 
  categoriasPlantillas,
  getCategoryColor,
  getCategoryText,
  type Plantilla
} from '@/data/plantillasData';
import { useRole } from '@/hooks/useRole';
import type { UserRole } from '@/types/roles';
import { TemplateMergeModal } from '@/components/plantillas/TemplateMergeModal';

type ModalType = 'create' | 'edit' | 'delete' | 'view' | 'merge' | null;

// Configuración de acceso por rol
const ROLE_ACCESS: Record<UserRole, { canView: boolean; canCreate: boolean; canEdit: boolean; canDelete: boolean }> = {
  super_admin: { canView: true, canCreate: true, canEdit: true, canDelete: true },
  socio: { canView: true, canCreate: true, canEdit: true, canDelete: true },
  abogado_senior: { canView: true, canCreate: false, canEdit: false, canDelete: false },
  abogado_junior: { canView: true, canCreate: false, canEdit: false, canDelete: false },
  paralegal: { canView: true, canCreate: false, canEdit: false, canDelete: false },
  secretario: { canView: true, canCreate: false, canEdit: false, canDelete: false },
  administrador: { canView: true, canCreate: false, canEdit: false, canDelete: false },
  contador: { canView: false, canCreate: false, canEdit: false, canDelete: false },
  recepcionista: { canView: false, canCreate: false, canEdit: false, canDelete: false },
};

// Títulos por rol
const ROLE_TITLES: Record<UserRole, { title: string; subtitle: string }> = {
  super_admin: { title: 'Gestión de Plantillas', subtitle: 'Administración completa del repositorio de documentos' },
  socio: { title: 'Gestión de Plantillas', subtitle: 'Administración del repositorio de documentos' },
  abogado_senior: { title: 'Biblioteca de Plantillas', subtitle: 'Plantillas disponibles para uso en casos' },
  abogado_junior: { title: 'Biblioteca de Plantillas', subtitle: 'Plantillas disponibles para uso en casos' },
  paralegal: { title: 'Plantillas de Documentos', subtitle: 'Formatos y plantillas de uso común' },
  secretario: { title: 'Plantillas Administrativas', subtitle: 'Formatos para gestión documental' },
  administrador: { title: 'Plantillas de Documentos', subtitle: 'Formatos disponibles para uso administrativo' },
  contador: { title: 'Sin Acceso', subtitle: 'No tienes permisos para ver plantillas' },
  recepcionista: { title: 'Sin Acceso', subtitle: 'No tienes permisos para ver plantillas' },
};

export default function Plantillas() {
  const { role, roleConfig, roleName } = useRole();
  
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [sortBy, setSortBy] = useState<'usage' | 'recent' | 'name'>('usage');
  const [selectedPlantilla, setSelectedPlantilla] = useState<Plantilla | null>(null);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [activeModal, setActiveModal] = useState<ModalType>(null);
  const [editingPlantilla, setEditingPlantilla] = useState<Plantilla | null>(null);
  const [mergePlantilla, setMergePlantilla] = useState<Plantilla | null>(null);
  const [toast, setToast] = useState<{message: string; type: 'success' | 'error'} | null>(null);
  
  // Datos mutables
  const [plantillasData, setPlantillasData] = useState<Plantilla[]>(initialPlantillasData);

  // Permisos según rol
  const permissions = useMemo(() => ROLE_ACCESS[role], [role]);

  // Filtrar y ordenar plantillas
  const filteredPlantillas = useMemo(() => {
    let result = plantillasData.filter(p => {
      const matchesSearch = 
        p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.tags.some(t => t.toLowerCase().includes(searchQuery.toLowerCase()));
      const matchesCategory = categoryFilter === 'all' || p.category === categoryFilter;
      return matchesSearch && matchesCategory;
    });

    // Ordenar
    switch (sortBy) {
      case 'usage':
        result.sort((a, b) => b.usageCount - a.usageCount);
        break;
      case 'recent':
        result.sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());
        break;
      case 'name':
        result.sort((a, b) => a.title.localeCompare(b.title));
        break;
    }
    return result;
  }, [plantillasData, searchQuery, categoryFilter, sortBy]);

  const showToast = (message: string, type: 'success' | 'error' = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  // Handlers
  const handleDownload = (plantilla: Plantilla) => {
    showToast(`Descargando ${plantilla.title}...`);
    // Simular incremento de contador de uso
    setPlantillasData(prev => prev.map(p => 
      p.id === plantilla.id ? { ...p, usageCount: p.usageCount + 1 } : p
    ));
  };

  const handleMerge = (plantilla: Plantilla) => {
    setMergePlantilla(plantilla);
    setActiveModal('merge');
  };

  const closeMergeModal = () => {
    setMergePlantilla(null);
    setActiveModal(null);
    // Incrementar contador de uso después de generar
    if (mergePlantilla) {
      setPlantillasData(prev => prev.map(p => 
        p.id === mergePlantilla.id ? { ...p, usageCount: p.usageCount + 1 } : p
      ));
    }
  };

  const handleDelete = () => {
    if (!editingPlantilla) return;
    setPlantillasData(prev => prev.filter(p => p.id !== editingPlantilla.id));
    if (selectedPlantilla?.id === editingPlantilla.id) {
      setSelectedPlantilla(null);
    }
    setActiveModal(null);
    setEditingPlantilla(null);
    showToast('Plantilla eliminada correctamente');
  };

  const handleDuplicate = (plantilla: Plantilla) => {
    const newPlantilla: Plantilla = {
      ...plantilla,
      id: `PLANT-${Date.now().toString().slice(-4)}`,
      title: `${plantilla.title} (Copia)`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      usageCount: 0,
      createdByName: roleName,
    };
    setPlantillasData([newPlantilla, ...plantillasData]);
    showToast('Plantilla duplicada correctamente');
  };

  const openDeleteModal = (plantilla: Plantilla) => {
    setEditingPlantilla(plantilla);
    setActiveModal('delete');
  };

  const openEditModal = (plantilla: Plantilla) => {
    setEditingPlantilla(plantilla);
    setActiveModal('edit');
  };

  // Mensaje de acceso denegado
  const getRoleMessage = () => {
    const messages: Record<UserRole, { title: string; description: string; actions: string[] }> = {
      super_admin: {
        title: 'Gestión Completa de Plantillas',
        description: 'Puedes crear, editar, eliminar y gestionar todas las plantillas del sistema.',
        actions: ['Crear nuevas plantillas', 'Editar plantillas existentes', 'Eliminar plantillas', 'Gestionar categorías', 'Ver estadísticas de uso']
      },
      socio: {
        title: 'Gestión de Plantillas',
        description: 'Puedes crear, editar y gestionar las plantillas del bufete.',
        actions: ['Crear nuevas plantillas', 'Editar plantillas existentes', 'Eliminar plantillas', 'Organizar categorías', 'Ver uso de plantillas']
      },
      abogado_senior: {
        title: 'Uso de Plantillas',
        description: 'Puedes utilizar las plantillas disponibles para tus casos.',
        actions: ['Descargar plantillas', 'Ver variables disponibles', 'Generar documentos', 'Proponer nuevas plantillas']
      },
      abogado_junior: {
        title: 'Uso de Plantillas',
        description: 'Puedes utilizar las plantillas disponibles para tus casos.',
        actions: ['Descargar plantillas', 'Ver variables disponibles', 'Generar documentos', 'Usar formatos aprobados']
      },
      paralegal: {
        title: 'Uso de Plantillas',
        description: 'Puedes utilizar las plantillas para apoyo en casos.',
        actions: ['Descargar plantillas', 'Ver formatos disponibles', 'Generar documentos de apoyo']
      },
      secretario: {
        title: 'Uso de Plantillas',
        description: 'Puedes utilizar las plantillas administrativas y de correspondencia.',
        actions: ['Descargar plantillas administrativas', 'Usar formatos de correspondencia', 'Generar documentos']
      },
      administrador: {
        title: 'Uso de Plantillas',
        description: 'Puedes utilizar las plantillas para gestión administrativa.',
        actions: ['Descargar plantillas', 'Ver formatos administrativos', 'Generar documentos']
      },
      contador: {
        title: 'Sin Acceso a Plantillas',
        description: 'Tu rol no tiene acceso al módulo de plantillas de documentos.',
        actions: ['Accede a Contabilidad', 'Revisa facturación', 'Genera reportes fiscales']
      },
      recepcionista: {
        title: 'Sin Acceso a Plantillas',
        description: 'Tu rol no tiene acceso al módulo de plantillas de documentos.',
        actions: ['Gestiona citas', 'Atiende llamadas', 'Actualiza contactos']
      },
    };
    return messages[role] || messages.recepcionista;
  };

  // Si no tiene acceso
  if (!permissions.canView) {
    const message = getRoleMessage();
    return (
      <AppLayout title="Plantillas de Documentos" subtitle="Acceso restringido">
        <main className="flex-1 overflow-y-auto p-6 lg:p-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-2xl mx-auto mt-12"
          >
            <div className="p-8 bg-theme-secondary border border-theme rounded-2xl text-center">
              <div className="w-20 h-20 mx-auto mb-6 bg-theme-tertiary rounded-full flex items-center justify-center">
                <Lock className="w-10 h-10 text-theme-muted" />
              </div>
              <h2 className="text-2xl font-bold text-theme-primary mb-2">{message.title}</h2>
              <p className="text-theme-secondary mb-6">{message.description}</p>

              <div className="p-4 bg-theme-tertiary/50 rounded-xl text-left">
                <p className="text-sm font-medium text-theme-secondary mb-3">Acciones disponibles para tu rol:</p>
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

  const { title, subtitle } = ROLE_TITLES[role];

  const headerActions = (
    <>
      <button
        onClick={() => setViewMode(viewMode === 'grid' ? 'list' : 'grid')}
        className="hidden sm:flex items-center gap-2 px-4 py-2 bg-theme-tertiary text-theme-primary font-medium rounded-xl hover:bg-theme-hover transition-colors border border-theme-hover"
      >
        {viewMode === 'grid' ? (
          <>
            <ClipboardList className="w-4 h-4" />
            <span className="hidden lg:inline">Lista</span>
          </>
        ) : (
          <>
            <LayoutTemplate className="w-4 h-4" />
            <span className="hidden lg:inline">Cuadrícula</span>
          </>
        )}
      </button>
      {permissions.canCreate && (
        <button
          onClick={() => setActiveModal('create')}
          className="hidden sm:flex items-center gap-2 px-4 py-2 bg-accent text-theme-primary font-medium rounded-xl hover:bg-amber-400 transition-colors"
        >
          <Plus className="w-4 h-4" />
          <span className="hidden lg:inline">Nueva Plantilla</span>
        </button>
      )}
    </>
  );

  const getCategoryIcon = (iconName: string) => {
    switch (iconName) {
      case 'FileSignature': return FileSignature;
      case 'Gavel': return Gavel;
      case 'ClipboardList': return ClipboardList;
      case 'Mail': return Mail;
      case 'Building': return Building;
      default: return FileText;
    }
  };

  // Icono según rol
  const getRoleIcon = () => {
    switch (role) {
      case 'super_admin':
      case 'socio':
        return <Crown className="w-5 h-5" />;
      case 'abogado_senior':
      case 'abogado_junior':
        return <Gavel className="w-5 h-5" />;
      default:
        return <Users className="w-5 h-5" />;
    }
  };

  return (
    <AppLayout 
      title={title}
      subtitle={`${filteredPlantillas.length} plantillas disponibles${subtitle ? ` · ${subtitle}` : ''}`}
      headerActions={headerActions}
    >
      <main className="flex-1 overflow-y-auto p-6 lg:p-8">
        {/* Info del rol */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="mb-6 p-4 bg-theme-secondary border border-theme rounded-xl"
        >
          <div className="flex items-start gap-3">
            <div className={`p-2 rounded-lg ${roleConfig.bgColor}`}>
              {getRoleIcon()}
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <h4 className="text-sm font-medium text-theme-primary">
                  {getRoleMessage().title}
                </h4>
                <span className={`text-xs px-2 py-0.5 rounded-full ${roleConfig.bgColor} ${roleConfig.textColor}`}>
                  {roleConfig.name}
                </span>
              </div>
              <p className="text-xs text-theme-secondary mt-1">
                {getRoleMessage().description}
              </p>
              <div className="mt-3 flex flex-wrap gap-2">
                {getRoleMessage().actions.slice(0, 3).map((action, idx) => (
                  <span
                    key={idx}
                    className="inline-flex items-center gap-1.5 text-xs text-theme-secondary px-2 py-1 bg-theme-tertiary/50 rounded-lg"
                  >
                    <div className="w-1 h-1 bg-amber-500 rounded-full" />
                    {action}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </motion.div>

        {/* Category Pills */}
        <div className="mb-6">
          <div className="flex flex-wrap gap-2">
            {categoriasPlantillas.map((cat) => {
              const Icon = getCategoryIcon(cat.icon);
              const isSelected = categoryFilter === cat.id;
              const count = plantillasData.filter(p => p.category === cat.id).length;
              return (
                <motion.button
                  key={cat.id}
                  onClick={() => setCategoryFilter(isSelected ? 'all' : cat.id)}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className={`flex items-center gap-2 px-4 py-2 rounded-full border transition-all ${
                    isSelected
                      ? 'bg-amber-500/20 border-amber-500/50 text-amber-400 shadow-lg shadow-amber-500/10'
                      : 'bg-theme-secondary border-theme text-theme-secondary hover:border-amber-500/30 hover:text-theme-primary'
                  }`}
                >
                  <Icon className={`w-4 h-4 ${isSelected ? 'text-amber-400' : ''}`} />
                  <span className="text-sm font-medium">{cat.name}</span>
                  <span className={`text-xs px-2 py-0.5 rounded-full ${
                    isSelected ? 'bg-amber-500/30 text-amber-300' : 'bg-theme-tertiary text-theme-muted'
                  }`}>
                    {count}
                  </span>
                </motion.button>
              );
            })}
          </div>
        </div>

        {/* Search and Filters */}
        <div className="mb-6 space-y-4">
          <div className="flex flex-col lg:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-theme-muted" />
              <input
                type="text"
                placeholder="Buscar plantillas por nombre, descripción o etiquetas..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-12 pr-12 py-3 bg-theme-secondary border border-theme rounded-xl text-theme-primary placeholder-theme-muted focus:outline-none focus:border-amber-500 transition-colors"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-4 top-1/2 -translate-y-1/2 p-1 text-theme-muted hover:text-theme-primary transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>
            <div className="flex gap-3">
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as 'usage' | 'recent' | 'name')}
                className="px-4 py-3 bg-theme-secondary border border-theme rounded-xl text-theme-primary focus:outline-none focus:border-amber-500 transition-colors"
              >
                <option value="usage">Más usadas</option>
                <option value="recent">Más recientes</option>
                <option value="name">A-Z</option>
              </select>
              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="px-4 py-3 bg-theme-secondary border border-theme rounded-xl text-theme-primary focus:outline-none focus:border-amber-500 transition-colors"
              >
                <option value="all">Todas las categorías</option>
                {categoriasPlantillas.map(cat => (
                  <option key={cat.id} value={cat.id}>{cat.name}</option>
                ))}
              </select>
            </div>
          </div>
          {/* Contador de resultados */}
          <div className="flex items-center justify-between text-sm">
            <span className="text-theme-secondary">
              {filteredPlantillas.length} {filteredPlantillas.length === 1 ? 'plantilla encontrada' : 'plantillas encontradas'}
              {searchQuery && <span className="text-amber-400"> para "{searchQuery}"</span>}
            </span>
            {categoryFilter !== 'all' && (
              <button
                onClick={() => setCategoryFilter('all')}
                className="text-amber-400 hover:text-amber-300 transition-colors flex items-center gap-1"
              >
                <X className="w-3 h-3" />
                Limpiar filtro
              </button>
            )}
          </div>
        </div>

        {/* Content */}
        {viewMode === 'grid' ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredPlantillas.map((plantilla, index) => {
              const isNew = (Date.now() - new Date(plantilla.createdAt).getTime()) < 7 * 24 * 60 * 60 * 1000;
              const isPopular = plantilla.usageCount > 50;
              
              return (
                <motion.div
                  key={plantilla.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.03 }}
                  className="relative p-6 bg-theme-secondary border border-theme rounded-2xl hover:border-amber-500/40 hover:shadow-xl hover:shadow-amber-500/5 transition-all duration-300 group cursor-pointer hover:-translate-y-1"
                  onClick={() => setSelectedPlantilla(plantilla)}
                >
                  {/* Badges superiores */}
                  <div className="absolute -top-2 -right-2 flex gap-1">
                    {isNew && (
                      <span className="px-2 py-1 bg-emerald-500/20 text-emerald-400 rounded-full text-xs font-medium flex items-center gap-1 shadow-lg">
                        <Sparkles className="w-3 h-3" />
                        Nueva
                      </span>
                    )}
                    {isPopular && (
                      <span className="px-2 py-1 bg-orange-500/20 text-orange-400 rounded-full text-xs font-medium flex items-center gap-1 shadow-lg">
                        <Flame className="w-3 h-3" />
                        Popular
                      </span>
                    )}
                  </div>

                  <div className="flex items-start justify-between mb-4">
                    <div className={`w-14 h-14 rounded-xl flex items-center justify-center transition-transform group-hover:scale-110 ${
                      plantilla.type === 'word' ? 'bg-gradient-to-br from-blue-500/20 to-blue-600/10' :
                      plantilla.type === 'excel' ? 'bg-gradient-to-br from-emerald-500/20 to-emerald-600/10' :
                      'bg-gradient-to-br from-red-500/20 to-red-600/10'
                    }`}>
                      {plantilla.type === 'word' ? <FileText className="w-7 h-7 text-blue-400" /> :
                       plantilla.type === 'excel' ? <FileSpreadsheet className="w-7 h-7 text-emerald-400" /> :
                       <File className="w-7 h-7 text-red-400" />}
                    </div>
                    <div className="flex gap-1">
                      {permissions.canEdit && (
                        <button
                          onClick={(e) => { e.stopPropagation(); openEditModal(plantilla); }}
                          className="p-2 text-theme-muted hover:text-amber-500 hover:bg-amber-500/10 rounded-lg opacity-0 group-hover:opacity-100 transition-all"
                        >
                          <MoreVertical className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </div>

                  <h3 className="font-semibold text-theme-primary mb-2 group-hover:text-amber-500 transition-colors line-clamp-1">
                    {plantilla.title}
                  </h3>
                  <p className="text-sm text-theme-secondary line-clamp-2 mb-4">
                    {plantilla.description}
                  </p>

                  {/* Tags */}
                  <div className="flex flex-wrap gap-1 mb-4">
                    {plantilla.tags.slice(0, 3).map((tag, i) => (
                      <span key={i} className="px-2 py-0.5 bg-theme-tertiary/50 text-theme-muted rounded-md text-xs">
                        {tag}
                      </span>
                    ))}
                    {plantilla.tags.length > 3 && (
                      <span className="px-2 py-0.5 text-theme-muted text-xs">+{plantilla.tags.length - 3}</span>
                    )}
                  </div>

                  <div className="flex items-center gap-2 mb-4">
                    <span className={`px-3 py-1 text-xs font-medium rounded-full border ${getCategoryColor(plantilla.category)}`}>
                      {getCategoryText(plantilla.category)}
                    </span>
                    <span className="text-xs text-theme-muted flex items-center gap-1">
                      <File className="w-3 h-3" />
                      {plantilla.size}
                    </span>
                  </div>

                  <div className="flex items-center justify-between pt-4 border-t border-theme">
                    <div className="flex items-center gap-2 text-xs text-theme-secondary">
                      <Download className="w-4 h-4" />
                      {plantilla.usageCount} usos
                    </div>
                    <div className="flex gap-1">
                      <button
                        onClick={(e) => { e.stopPropagation(); setSelectedPlantilla(plantilla); }}
                        className="p-2 text-theme-muted hover:text-blue-500 hover:bg-blue-500/10 rounded-lg transition-colors"
                        title="Ver detalles"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      <button
                        onClick={(e) => { e.stopPropagation(); handleDownload(plantilla); }}
                        className="p-2 text-theme-muted hover:text-emerald-500 hover:bg-emerald-500/10 rounded-lg transition-colors"
                        title="Descargar vacía"
                      >
                        <Download className="w-4 h-4" />
                      </button>
                      <button
                        onClick={(e) => { e.stopPropagation(); handleMerge(plantilla); }}
                        className="p-2 text-theme-muted hover:text-purple-500 hover:bg-purple-500/10 rounded-lg transition-colors"
                        title="Generar con datos de expediente"
                      >
                        <Wand2 className="w-4 h-4" />
                      </button>
                      {permissions.canCreate && (
                        <button
                          onClick={(e) => { e.stopPropagation(); handleDuplicate(plantilla); }}
                          className="p-2 text-theme-muted hover:text-amber-500 hover:bg-amber-500/10 rounded-lg transition-colors"
                          title="Duplicar"
                        >
                          <Copy className="w-4 h-4" />
                        </button>
                      )}
                      {permissions.canDelete && (
                        <button
                          onClick={(e) => { e.stopPropagation(); openDeleteModal(plantilla); }}
                          className="p-2 text-theme-muted hover:text-red-500 hover:bg-red-500/10 rounded-lg transition-colors"
                          title="Eliminar"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        ) : (
          <div className="bg-theme-secondary border border-theme rounded-2xl overflow-hidden">
            <table className="w-full">
              <thead>
                <tr className="border-b border-theme bg-theme-tertiary/50">
                  <th className="text-left py-4 px-6 text-xs font-medium text-theme-muted uppercase">Plantilla</th>
                  <th className="text-left py-4 px-6 text-xs font-medium text-theme-muted uppercase">Categoría</th>
                  <th className="text-left py-4 px-4 text-xs font-medium text-theme-muted uppercase">Tipo</th>
                  <th className="text-left py-4 px-4 text-xs font-medium text-theme-muted uppercase">Tamaño</th>
                  <th className="text-left py-4 px-4 text-xs font-medium text-theme-muted uppercase">Usos</th>
                  <th className="text-right py-4 px-6 text-xs font-medium text-theme-muted uppercase">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {filteredPlantillas.map((plantilla, index) => (
                  <motion.tr 
                    key={plantilla.id} 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.03 }}
                    className="border-b border-theme hover:bg-theme-hover transition-colors group cursor-pointer"
                    onClick={() => setSelectedPlantilla(plantilla)}
                  >
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-3">
                        <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                          plantilla.type === 'word' ? 'bg-blue-500/10' :
                          plantilla.type === 'excel' ? 'bg-emerald-500/10' :
                          'bg-red-500/10'
                        }`}>
                          {plantilla.type === 'word' ? <FileText className="w-5 h-5 text-blue-400" /> :
                           plantilla.type === 'excel' ? <FileSpreadsheet className="w-5 h-5 text-emerald-400" /> :
                           <File className="w-5 h-5 text-red-400" />}
                        </div>
                        <div>
                          <p className="text-sm font-medium text-theme-primary group-hover:text-amber-400 transition-colors">{plantilla.title}</p>
                          <p className="text-xs text-theme-muted line-clamp-1">{plantilla.description}</p>
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      <span className={`px-3 py-1 text-xs font-medium rounded-full border ${getCategoryColor(plantilla.category)}`}>
                        {getCategoryText(plantilla.category)}
                      </span>
                    </td>
                    <td className="py-4 px-4">
                      <span className={`inline-flex items-center px-2.5 py-1 rounded-md text-xs font-medium ${
                        plantilla.type === 'word' ? 'bg-blue-500/10 text-blue-400' :
                        plantilla.type === 'excel' ? 'bg-emerald-500/10 text-emerald-400' :
                        'bg-red-500/10 text-red-400'
                      }`}>
                        {plantilla.type.toUpperCase()}
                      </span>
                    </td>
                    <td className="py-4 px-4">
                      <span className="text-sm text-theme-muted">{plantilla.size}</span>
                    </td>
                    <td className="py-4 px-4">
                      <div className="flex items-center gap-1 text-sm text-theme-secondary">
                        <Download className="w-3 h-3" />
                        {plantilla.usageCount}
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      <div className="flex items-center justify-end gap-1">
                        <button 
                          onClick={(e) => { e.stopPropagation(); setSelectedPlantilla(plantilla); }}
                          className="p-2 text-theme-muted hover:text-blue-500 hover:bg-blue-500/10 rounded-lg transition-colors"
                          title="Ver detalles"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button 
                          onClick={(e) => { e.stopPropagation(); handleDownload(plantilla); }}
                          className="p-2 text-theme-muted hover:text-emerald-500 hover:bg-emerald-500/10 rounded-lg transition-colors"
                          title="Descargar vacía"
                        >
                          <Download className="w-4 h-4" />
                        </button>
                        <button 
                          onClick={(e) => { e.stopPropagation(); handleMerge(plantilla); }}
                          className="p-2 text-theme-muted hover:text-purple-500 hover:bg-purple-500/10 rounded-lg transition-colors"
                          title="Generar con datos de expediente"
                        >
                          <Wand2 className="w-4 h-4" />
                        </button>
                        {permissions.canEdit && (
                          <button 
                            onClick={(e) => { e.stopPropagation(); openEditModal(plantilla); }}
                            className="p-2 text-theme-muted hover:text-amber-500 hover:bg-amber-500/10 rounded-lg transition-colors"
                            title="Editar"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                        )}
                        {permissions.canDelete && (
                          <button 
                            onClick={(e) => { e.stopPropagation(); openDeleteModal(plantilla); }}
                            className="p-2 text-theme-muted hover:text-red-500 hover:bg-red-500/10 rounded-lg transition-colors"
                            title="Eliminar"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {filteredPlantillas.length === 0 && (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="p-16 text-center"
          >
            <div className="w-24 h-24 mx-auto mb-6 bg-theme-tertiary/50 rounded-full flex items-center justify-center">
              <LayoutTemplate className="w-12 h-12 text-theme-muted" />
            </div>
            <h3 className="text-xl font-semibold text-theme-primary mb-2">
              {searchQuery || categoryFilter !== 'all' 
                ? 'No se encontraron resultados' 
                : 'No hay plantillas disponibles'}
            </h3>
            <p className="text-theme-secondary mb-6 max-w-md mx-auto">
              {searchQuery || categoryFilter !== 'all'
                ? `No hay plantillas que coincidan con "${searchQuery || getCategoryText(categoryFilter)}". Prueba con otros filtros.`
                : 'Aún no hay plantillas en el sistema. Crea la primera plantilla para comenzar.'}
            </p>
            <div className="flex justify-center gap-3">
              {(searchQuery || categoryFilter !== 'all') && (
                <button 
                  onClick={() => { setSearchQuery(''); setCategoryFilter('all'); }}
                  className="px-4 py-2 bg-theme-tertiary text-theme-primary font-medium rounded-xl hover:bg-theme-hover transition-colors flex items-center gap-2"
                >
                  <X className="w-4 h-4" />
                  Limpiar filtros
                </button>
              )}
              {permissions.canCreate && (
                <button 
                  onClick={() => setActiveModal('create')}
                  className="px-4 py-2 bg-accent text-slate-950 font-medium rounded-xl hover:bg-amber-400 transition-colors flex items-center gap-2"
                >
                  <Plus className="w-4 h-4" />
                  Crear plantilla
                </button>
              )}
            </div>
          </motion.div>
        )}

        {/* Modal de Detalle */}
        {selectedPlantilla && (
          <PlantillaModal 
            plantilla={selectedPlantilla} 
            onClose={() => setSelectedPlantilla(null)} 
            permissions={permissions}
            onDownload={() => handleDownload(selectedPlantilla)}
            onDuplicate={() => handleDuplicate(selectedPlantilla)}
            onDelete={() => openDeleteModal(selectedPlantilla)}
            onMerge={() => handleMerge(selectedPlantilla)}
          />
        )}

        {/* Modal de Merge */}
        <AnimatePresence>
          {activeModal === 'merge' && mergePlantilla && (
            <TemplateMergeModal 
              plantilla={mergePlantilla}
              onClose={closeMergeModal}
            />
          )}
        </AnimatePresence>

        {/* Modal Confirmar Eliminación */}
        <AnimatePresence>
          {activeModal === 'delete' && editingPlantilla && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
              onClick={() => { setActiveModal(null); setEditingPlantilla(null); }}
            >
              <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 20 }}
                onClick={(e) => e.stopPropagation()}
                className="bg-theme-secondary border border-theme rounded-2xl max-w-md w-full p-6"
              >
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 bg-red-500/10 rounded-full flex items-center justify-center">
                    <Trash2 className="w-6 h-6 text-red-500" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-theme-primary">Eliminar Plantilla</h3>
                    <p className="text-sm text-theme-muted">Esta acción no se puede deshacer</p>
                  </div>
                </div>
                
                <p className="text-theme-secondary mb-6">
                  ¿Estás seguro de que deseas eliminar la plantilla <strong className="text-theme-primary">{editingPlantilla.title}</strong>?
                </p>

                <div className="flex justify-end gap-3">
                  <button 
                    onClick={() => { setActiveModal(null); setEditingPlantilla(null); }}
                    className="px-4 py-2 text-theme-secondary hover:text-theme-primary transition-colors"
                  >
                    Cancelar
                  </button>
                  <button 
                    onClick={handleDelete}
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

interface PlantillaModalProps {
  plantilla: Plantilla;
  onClose: () => void;
  permissions: { canCreate: boolean; canDelete: boolean };
  onDownload: () => void;
  onDuplicate: () => void;
  onDelete: () => void;
  onMerge: () => void;
}

function PlantillaModal({ plantilla, onClose, permissions, onDownload, onDuplicate, onDelete, onMerge }: PlantillaModalProps) {
  const [activeTab, setActiveTab] = useState<'details' | 'variables' | 'history'>('details');
  const [copiedVar, setCopiedVar] = useState<string | null>(null);

  const copyVariable = (name: string) => {
    navigator.clipboard.writeText(`{{${name}}}`);
    setCopiedVar(name);
    setTimeout(() => setCopiedVar(null), 2000);
  };

  const copyAllVariables = () => {
    const vars = plantilla.variables.map(v => `{{${v.name}}}`).join(', ');
    navigator.clipboard.writeText(vars);
  };

  const isNew = (Date.now() - new Date(plantilla.createdAt).getTime()) < 7 * 24 * 60 * 60 * 1000;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        onClick={(e) => e.stopPropagation()}
        className="bg-theme-secondary border border-theme rounded-2xl max-w-3xl w-full max-h-[90vh] overflow-hidden flex flex-col"
      >
        {/* Header con gradiente */}
        <div className={`p-6 border-b border-theme ${
          plantilla.type === 'word' ? 'bg-gradient-to-r from-blue-500/10 to-transparent' :
          plantilla.type === 'excel' ? 'bg-gradient-to-r from-emerald-500/10 to-transparent' :
          'bg-gradient-to-r from-red-500/10 to-transparent'
        }`}>
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-4">
              <div className={`w-16 h-16 rounded-2xl flex items-center justify-center shadow-lg ${
                plantilla.type === 'word' ? 'bg-gradient-to-br from-blue-500 to-blue-600' :
                plantilla.type === 'excel' ? 'bg-gradient-to-br from-emerald-500 to-emerald-600' :
                'bg-gradient-to-br from-red-500 to-red-600'
              }`}>
                {plantilla.type === 'word' ? <FileText className="w-8 h-8 text-white" /> :
                 plantilla.type === 'excel' ? <FileSpreadsheet className="w-8 h-8 text-white" /> :
                 <File className="w-8 h-8 text-white" />}
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-xl font-bold text-theme-primary">{plantilla.title}</h2>
                  {isNew && (
                    <span className="px-2 py-0.5 bg-emerald-500/20 text-emerald-400 rounded-full text-xs flex items-center gap-1">
                      <Sparkles className="w-3 h-3" />
                      Nueva
                    </span>
                  )}
                </div>
                <p className="text-sm text-theme-muted">{plantilla.id}</p>
                <div className="flex items-center gap-2 mt-2">
                  <span className={`px-3 py-1 text-xs font-medium rounded-full border ${getCategoryColor(plantilla.category)}`}>
                    {getCategoryText(plantilla.category)}
                  </span>
                  <span className="text-xs text-theme-muted flex items-center gap-1">
                    <File className="w-3 h-3" />
                    {plantilla.size}
                  </span>
                  <span className="text-xs text-theme-muted uppercase px-2 py-0.5 bg-theme-tertiary rounded">
                    {plantilla.type}
                  </span>
                </div>
              </div>
            </div>
            <button onClick={onClose} className="p-2 text-theme-muted hover:text-theme-primary hover:bg-theme-hover rounded-lg">
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>
        
        {/* Pestañas */}
        <div className="px-6 border-b border-theme">
          <div className="flex gap-1">
            {[
              { id: 'details', label: 'Detalles', icon: FileText },
              { id: 'variables', label: `Variables (${plantilla.variables.length})`, icon: CopyIcon },
              { id: 'history', label: 'Historial', icon: ClipboardList },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as typeof activeTab)}
                className={`flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
                  activeTab === tab.id
                    ? 'border-amber-500 text-amber-400'
                    : 'border-transparent text-theme-secondary hover:text-theme-primary'
                }`}
              >
                <tab.icon className="w-4 h-4" />
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Contenido según pestaña */}
        <div className="p-6 overflow-y-auto flex-1">
          {activeTab === 'details' && (
            <div className="space-y-6">
              <div>
                <h3 className="text-sm font-medium text-theme-muted mb-2">Descripción</h3>
                <p className="text-theme-secondary">{plantilla.description}</p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 bg-theme-tertiary/50 rounded-xl">
                  <p className="text-xs text-theme-muted mb-1">Creado por</p>
                  <p className="text-theme-primary font-medium">{plantilla.createdByName}</p>
                  <p className="text-xs text-theme-muted">{new Date(plantilla.createdAt).toLocaleDateString('es-ES')}</p>
                </div>
                <div className="p-4 bg-theme-tertiary/50 rounded-xl">
                  <p className="text-xs text-theme-muted mb-1">Última actualización</p>
                  <p className="text-theme-primary font-medium">{new Date(plantilla.updatedAt).toLocaleDateString('es-ES')}</p>
                </div>
                <div className="p-4 bg-theme-tertiary/50 rounded-xl">
                  <p className="text-xs text-theme-muted mb-1">Veces utilizado</p>
                  <p className="text-2xl font-bold text-theme-primary">{plantilla.usageCount}</p>
                </div>
                <div className="p-4 bg-theme-tertiary/50 rounded-xl">
                  <p className="text-xs text-theme-muted mb-1">Variables</p>
                  <p className="text-2xl font-bold text-theme-primary">{plantilla.variables.length}</p>
                </div>
              </div>

              <div>
                <h3 className="text-sm font-medium text-theme-muted mb-2">Etiquetas</h3>
                <div className="flex flex-wrap gap-2">
                  {plantilla.tags.map((tag, i) => (
                    <span key={i} className="px-3 py-1 bg-theme-tertiary text-theme-secondary rounded-full text-sm">
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'variables' && (
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="text-sm font-medium text-theme-muted">Variables disponibles ({plantilla.variables.length})</h3>
                <button
                  onClick={copyAllVariables}
                  className="text-xs text-amber-400 hover:text-amber-300 flex items-center gap-1"
                >
                  <CopyIcon className="w-3 h-3" />
                  Copiar todas
                </button>
              </div>
              <div className="grid gap-3">
                {plantilla.variables.map((variable, i) => (
                  <div key={i} className="p-4 bg-theme-tertiary/50 rounded-xl hover:bg-theme-tertiary transition-colors group">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <code className="text-amber-400 text-sm bg-theme-tertiary px-2 py-1 rounded">{`{{${variable.name}}}`}</code>
                        {variable.required && (
                          <span className="text-xs text-red-400 bg-red-500/10 px-2 py-0.5 rounded">Requerido</span>
                        )}
                        <span className="text-xs text-theme-muted bg-theme-tertiary px-2 py-0.5 rounded uppercase">
                          {variable.type}
                        </span>
                      </div>
                      <button
                        onClick={() => copyVariable(variable.name)}
                        className="p-2 text-theme-muted hover:text-amber-400 hover:bg-amber-500/10 rounded-lg opacity-0 group-hover:opacity-100 transition-all"
                        title="Copiar variable"
                      >
                        {copiedVar === variable.name ? <Check className="w-4 h-4 text-emerald-400" /> : <CopyIcon className="w-4 h-4" />}
                      </button>
                    </div>
                    <p className="text-sm text-theme-secondary mt-2">{variable.description}</p>
                    {variable.defaultValue && (
                      <p className="text-xs text-theme-muted mt-1">Valor por defecto: {variable.defaultValue}</p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'history' && (
            <div className="space-y-4">
              <div className="p-4 bg-theme-tertiary/50 rounded-xl">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-blue-500/20 rounded-full flex items-center justify-center">
                    <FileText className="w-5 h-5 text-blue-400" />
                  </div>
                  <div>
                    <p className="text-theme-primary font-medium">Plantilla creada</p>
                    <p className="text-sm text-theme-muted">Por {plantilla.createdByName} · {new Date(plantilla.createdAt).toLocaleDateString('es-ES')}</p>
                  </div>
                </div>
              </div>
              <div className="p-4 bg-theme-tertiary/50 rounded-xl">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-amber-500/20 rounded-full flex items-center justify-center">
                    <Edit2 className="w-5 h-5 text-amber-400" />
                  </div>
                  <div>
                    <p className="text-theme-primary font-medium">Última modificación</p>
                    <p className="text-sm text-theme-muted">{new Date(plantilla.updatedAt).toLocaleDateString('es-ES')}</p>
                  </div>
                </div>
              </div>
              <div className="p-4 bg-theme-tertiary/50 rounded-xl">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-emerald-500/20 rounded-full flex items-center justify-center">
                    <Download className="w-5 h-5 text-emerald-400" />
                  </div>
                  <div>
                    <p className="text-theme-primary font-medium">Descargas totales</p>
                    <p className="text-sm text-theme-muted">{plantilla.usageCount} veces utilizada</p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="p-6 border-t border-theme flex justify-between items-center">
          <div className="flex gap-2">
            {permissions.canDelete && (
              <button 
                onClick={() => { onDelete(); onClose(); }}
                className="px-4 py-2 text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded-xl transition-colors flex items-center gap-2"
              >
                <Trash2 className="w-4 h-4" />
                Eliminar
              </button>
            )}
          </div>
          <div className="flex gap-3">
            <button onClick={onClose} className="px-4 py-2 text-theme-secondary hover:text-theme-primary transition-colors">
              Cerrar
            </button>
            {permissions.canCreate && (
              <button 
                onClick={() => { onDuplicate(); onClose(); }}
                className="px-4 py-2 bg-theme-tertiary text-theme-primary font-medium rounded-xl hover:bg-theme-hover transition-colors flex items-center gap-2"
              >
                <Copy className="w-4 h-4" />
                Duplicar
              </button>
            )}
            <button 
              onClick={() => { onDownload(); onClose(); }}
              className="px-4 py-2 bg-theme-tertiary text-theme-primary font-medium rounded-xl hover:bg-theme-hover transition-colors flex items-center gap-2"
              title="Descargar plantilla vacía"
            >
              <Download className="w-4 h-4" />
              Descargar vacía
            </button>
            <button 
              onClick={() => { onMerge(); onClose(); }}
              className="px-4 py-2 bg-purple-500 text-white font-medium rounded-xl hover:bg-purple-400 transition-colors flex items-center gap-2"
              title="Generar documento pre-rellenado con datos de expediente"
            >
              <Wand2 className="w-4 h-4" />
              Generar con Merge
            </button>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}

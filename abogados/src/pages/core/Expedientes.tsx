import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Plus, Filter, Download, ArrowUpDown, Eye, Edit2, MoreVertical, 
  FileText, Upload, CheckSquare, FolderArchive, Trash2, UserPlus,
  Users, Gavel, FileCheck, Archive, Briefcase, AlertCircle, 
  CheckCircle2, HourglassIcon, History, X, Search,
  ChevronLeft, ChevronRight, Calendar, DollarSign,
  User, Tag, Save, CheckCircle, FileSignature, Pen, XCircle,
  Flag, LayoutGrid, List
} from 'lucide-react';
import { AppLayout } from '@/components/layout/AppLayout';
import { SignatureModal } from '@/components/signature';
import { useSignature } from '@/components/signature';
import type { SelectableFile } from '@/components/compression/FileSelector';
import { CompressModalV2 } from '@/components/compression';
import type { CompressionHistoryItem } from '@/components/compression';
import { expedientesData, getStatusColor, getStatusText } from '@/data/expedientesData';
import { useRole } from '@/hooks/useRole';
import type { UserRole } from '@/types/roles';
import { PrescripcionBadge } from '@/components/prescripciones/PrescripcionBadge';

// Tipos extendidos para simulación de asignación de expedientes
interface ExpedienteAssignment {
  id: string;
  assignedTo: string;
  assignedToName: string;
  supervisedBy?: string;
  supervisedByName?: string;
  collaborators: string[];
  collaboratorNames: string[];
  status: 'active' | 'pending' | 'urgent' | 'closed';
  lastActivity: string;
  documentsPending: number;
}

// Simulación de asignaciones de expedientes
const expedientesAssignments: Record<string, ExpedienteAssignment> = {
  'EXP-2024-001': { 
    id: 'EXP-2024-001', 
    assignedTo: 'abogado_senior_1', 
    assignedToName: 'Carlos Méndez',
    supervisedBy: 'socio_1', 
    supervisedByName: 'Dr. García',
    collaborators: ['paralegal_1'], 
    collaboratorNames: ['Ana López'],
    status: 'active',
    lastActivity: '2024-01-15',
    documentsPending: 2
  },
  'EXP-2024-002': { 
    id: 'EXP-2024-002', 
    assignedTo: 'abogado_junior_1', 
    assignedToName: 'Juan Pérez',
    supervisedBy: 'abogado_senior_1', 
    supervisedByName: 'Carlos Méndez',
    collaborators: [], 
    collaboratorNames: [],
    status: 'pending',
    lastActivity: '2024-01-10',
    documentsPending: 5
  },
  'EXP-2024-003': { 
    id: 'EXP-2024-003', 
    assignedTo: 'abogado_senior_1', 
    assignedToName: 'Carlos Méndez',
    supervisedBy: 'socio_1', 
    supervisedByName: 'Dr. García',
    collaborators: ['paralegal_1', 'paralegal_2'], 
    collaboratorNames: ['Ana López', 'María Ruiz'],
    status: 'active',
    lastActivity: '2024-01-18',
    documentsPending: 0
  },
  'EXP-2024-004': { 
    id: 'EXP-2024-004', 
    assignedTo: 'abogado_junior_2', 
    assignedToName: 'Pedro Sánchez',
    supervisedBy: 'abogado_senior_2', 
    supervisedByName: 'Laura Torres',
    collaborators: [], 
    collaboratorNames: [],
    status: 'closed',
    lastActivity: '2023-12-20',
    documentsPending: 0
  },
  'EXP-2024-005': { 
    id: 'EXP-2024-005', 
    assignedTo: 'socio_1', 
    assignedToName: 'Dr. García',
    collaborators: [], 
    collaboratorNames: [],
    status: 'active',
    lastActivity: '2024-01-20',
    documentsPending: 1
  },
  'EXP-2024-006': { 
    id: 'EXP-2024-006', 
    assignedTo: 'abogado_senior_2', 
    assignedToName: 'Laura Torres',
    supervisedBy: 'socio_1', 
    supervisedByName: 'Dr. García',
    collaborators: [], 
    collaboratorNames: [],
    status: 'urgent',
    lastActivity: '2024-01-19',
    documentsPending: 3
  },
  'EXP-2024-007': { 
    id: 'EXP-2024-007', 
    assignedTo: 'abogado_junior_1', 
    assignedToName: 'Juan Pérez',
    supervisedBy: 'abogado_senior_1', 
    supervisedByName: 'Carlos Méndez',
    collaborators: ['paralegal_2'], 
    collaboratorNames: ['María Ruiz'],
    status: 'active',
    lastActivity: '2024-01-17',
    documentsPending: 1
  },
  'EXP-2024-008': { 
    id: 'EXP-2024-008', 
    assignedTo: 'socio_1', 
    assignedToName: 'Dr. García',
    collaborators: [], 
    collaboratorNames: [],
    status: 'pending',
    lastActivity: '2024-01-12',
    documentsPending: 4
  },
  'EXP-2024-009': { 
    id: 'EXP-2024-009', 
    assignedTo: 'abogado_junior_2', 
    assignedToName: 'Pedro Sánchez',
    supervisedBy: 'abogado_senior_2', 
    supervisedByName: 'Laura Torres',
    collaborators: [], 
    collaboratorNames: [],
    status: 'active',
    lastActivity: '2024-01-16',
    documentsPending: 0
  },
  'EXP-2024-010': { 
    id: 'EXP-2024-010', 
    assignedTo: 'abogado_senior_1', 
    assignedToName: 'Carlos Méndez',
    supervisedBy: 'socio_1', 
    supervisedByName: 'Dr. García',
    collaborators: ['paralegal_1'], 
    collaboratorNames: ['Ana López'],
    status: 'urgent',
    lastActivity: '2024-01-21',
    documentsPending: 2
  },
  'EXP-2024-011': { 
    id: 'EXP-2024-011', 
    assignedTo: 'abogado_junior_1', 
    assignedToName: 'Juan Pérez',
    supervisedBy: 'abogado_senior_1', 
    supervisedByName: 'Carlos Méndez',
    collaborators: [], 
    collaboratorNames: [],
    status: 'active',
    lastActivity: '2024-01-14',
    documentsPending: 0
  },
  'EXP-2024-012': { 
    id: 'EXP-2024-012', 
    assignedTo: 'socio_1', 
    assignedToName: 'Dr. García',
    collaborators: ['paralegal_2'], 
    collaboratorNames: ['María Ruiz'],
    status: 'pending',
    lastActivity: '2024-01-11',
    documentsPending: 6
  },
};

// IDs de usuario simulados según rol
const getCurrentUserId = (role: UserRole): string => {
  const userIds: Record<UserRole, string> = {
    super_admin: 'super_admin',
    socio: 'socio_1',
    abogado_senior: 'abogado_senior_1',
    abogado_junior: 'abogado_junior_1',
    paralegal: 'paralegal_1',
    secretario: 'secretario_1',
    administrador: 'administrador_1',
    contador: 'contador_1',
    recepcionista: 'recepcionista_1',
  };
  return userIds[role] || 'unknown';
};

// Tipos de modales
type ModalType = 
  | 'create' 
  | 'view' 
  | 'edit' 
  | 'upload' 
  | 'tasks' 
  | 'assign' 
  | 'delete' 
  | 'filters' 
  | 'diligencias' 
  | 'archive' 
  | 'compress' 
  | 'sign'
  | 'request-signature'
  | null;

// Toast notification type
interface Toast {
  id: number;
  message: string;
  type: 'success' | 'error' | 'info';
}

export default function Expedientes() {
  const navigate = useNavigate();
  const { role, roleConfig } = useRole();
  const currentUserId = getCurrentUserId(role);
  const signature = useSignature(role, 'usuario@bufete.com');
  
  // Estado para modales de firma
  const [signatureModalOpen, setSignatureModalOpen] = useState(false);
  const [signatureMode, setSignatureMode] = useState<'sign' | 'request'>('request');
  const [selectedDocument, setSelectedDocument] = useState<{id: string; name: string} | null>(null);
  
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');
  const [viewMode, setViewMode] = useState<'list' | 'grid'>('list');
  
  // Estados para modales
  const [activeModal, setActiveModal] = useState<ModalType>(null);
  const [selectedExpediente, setSelectedExpediente] = useState<typeof expedientesData[0] | null>(null);
  
  // Estados para formularios
  const [newExpediente, setNewExpediente] = useState({
    title: '',
    client: '',
    type: 'Civil',
    status: 'active',
    priority: 'medium',
    amount: '',
    description: '',
  });
  
  const [editExpediente, setEditExpediente] = useState({
    title: '',
    client: '',
    type: '',
    status: '',
    priority: '',
    progress: 0,
    description: '',
  });

  // Estado para filtros avanzados
  const [advancedFilters, setAdvancedFilters] = useState({
    priority: 'all',
    dateFrom: '',
    dateTo: '',
    amountMin: '',
    amountMax: '',
  });

  // Estado para paginación
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Estado para dropdown de "Más opciones"
  const [openDropdownId, setOpenDropdownId] = useState<string | null>(null);

  // Estado para compresión de archivos (reservado para futura implementación)
  const [_selectedFileIds, _setSelectedFileIds] = useState<string[]>([]);
  const [_expedienteFiles, _setExpedienteFiles] = useState<SelectableFile[]>([]);
  const [_filesToCompress, _setFilesToCompress] = useState<File[]>([]);
  const [_compressionHistory, _setCompressionHistory] = useState<CompressionHistoryItem[]>([]);

  // Estado para toasts
  const [toasts, setToasts] = useState<Toast[]>([]);

  // Función para mostrar toast
  const showToast = (message: string, type: 'success' | 'error' | 'info' = 'info') => {
    const id = Date.now();
    setToasts(prev => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 3000);
  };

  // Determinar permisos según el rol
  const permissions = useMemo(() => {
    const moduleAccess = roleConfig.permissions.modules.expedientes;
    
    return {
      // Acceso a expedientes
      canViewAll: role === 'super_admin' || role === 'socio' || role === 'secretario',
      canViewOwn: moduleAccess === 'own' || moduleAccess === 'supervised' || moduleAccess === 'support',
      canViewSupervised: moduleAccess === 'supervised',
      canViewSupport: moduleAccess === 'support',
      canViewArchive: moduleAccess === 'view',
      
      // Acciones
      canCreate: role === 'super_admin' || role === 'socio' || role === 'abogado_senior',
      canEdit: role === 'super_admin' || role === 'socio' || role === 'abogado_senior' || role === 'abogado_junior',
      canDelete: role === 'super_admin' || role === 'socio',
      canAssign: role === 'super_admin' || role === 'socio',
      canClose: role === 'super_admin' || role === 'socio',
      canApproveExpenses: role === 'super_admin' || role === 'socio',
      
      // Visualización de datos
      canViewFinancialData: roleConfig.permissions.canViewFinancialData,
      canViewAllDetails: role === 'super_admin' || role === 'socio' || role === 'abogado_senior' || role === 'abogado_junior',
      canViewAssignmentInfo: role === 'super_admin' || role === 'socio' || role === 'abogado_senior',
      canViewCollaborators: role !== 'secretario' && role !== 'recepcionista',
      canViewProgress: role !== 'secretario',
      canViewDocuments: true,
      canViewHistory: role === 'super_admin' || role === 'socio' || role === 'abogado_senior',
      
      // Acciones específicas
      canUploadDocs: role === 'super_admin' || role === 'socio' || role === 'abogado_senior' || 
                     role === 'abogado_junior' || role === 'paralegal',
      canCreateTasks: role === 'super_admin' || role === 'socio' || role === 'abogado_senior',
      canOrganizeArchive: role === 'secretario',
      canRegisterTime: role === 'super_admin' || role === 'socio' || role === 'abogado_senior' || 
                       role === 'abogado_junior' || role === 'paralegal',
      canUpdateTramites: role === 'abogado_senior' || role === 'abogado_junior' || role === 'paralegal',
      canRegisterDiligencias: role === 'paralegal',
      canSign: signature.permissions.canSign,
      canRequestSignatures: signature.permissions.canRequestSignatures,
    };
  }, [role, roleConfig, signature.permissions]);

  // Filtrar expedientes según rol
  const filteredExpedientes = useMemo(() => {
    let filtered = expedientesData;

    switch (role) {
      case 'super_admin':
      case 'socio':
        // Ven todos los expedientes
        break;
      
      case 'abogado_senior':
        // Ven sus expedientes asignados + los de sus juniors supervisados
        filtered = expedientesData.filter(exp => {
          const assignment = expedientesAssignments[exp.id];
          if (!assignment) return false;
          return assignment.assignedTo === currentUserId || 
                 assignment.supervisedBy === currentUserId;
        });
        break;
      
      case 'abogado_junior':
        // Solo sus expedientes asignados
        filtered = expedientesData.filter(exp => {
          const assignment = expedientesAssignments[exp.id];
          if (!assignment) return false;
          return assignment.assignedTo === currentUserId;
        });
        break;
      
      case 'paralegal':
        // Expedientes en los que colabora
        filtered = expedientesData.filter(exp => {
          const assignment = expedientesAssignments[exp.id];
          if (!assignment) return false;
          return assignment.collaborators.includes(currentUserId);
        });
        break;
      
      case 'secretario':
        // Vista de archivo - todos para organización documental
        filtered = expedientesData;
        break;
      
      case 'administrador':
        // Vista limitada de expedientes
        filtered = expedientesData;
        break;
      
      default:
        filtered = [];
    }

    // Aplicar filtros de búsqueda
    filtered = filtered.filter(exp => {
      const matchesSearch = exp.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                           exp.client.toLowerCase().includes(searchQuery.toLowerCase()) ||
                           exp.id.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesStatus = statusFilter === 'all' || exp.status === statusFilter;
      const matchesType = typeFilter === 'all' || exp.type === typeFilter;
      
      // Filtros avanzados
      const matchesPriority = advancedFilters.priority === 'all' || exp.priority === advancedFilters.priority;
      
      return matchesSearch && matchesStatus && matchesType && matchesPriority;
    });

    return filtered;
  }, [role, currentUserId, searchQuery, statusFilter, typeFilter, advancedFilters]);

  // Calcular estadísticas específicas según rol
  const stats = useMemo(() => {
    const baseStats = {
      total: filteredExpedientes.length,
      active: filteredExpedientes.filter(e => e.status === 'active').length,
      pending: filteredExpedientes.filter(e => e.status === 'pending').length,
      urgent: filteredExpedientes.filter(e => e.status === 'urgent').length,
      closed: filteredExpedientes.filter(e => e.status === 'closed').length,
    };

    // Estadísticas adicionales según rol
    if (role === 'abogado_senior') {
      const supervised = filteredExpedientes.filter(exp => {
        const assignment = expedientesAssignments[exp.id];
        return assignment?.supervisedBy === currentUserId && assignment?.assignedTo !== currentUserId;
      }).length;
      return { ...baseStats, supervised };
    }

    if (role === 'paralegal') {
      const collaborating = filteredExpedientes.filter(exp => {
        const assignment = expedientesAssignments[exp.id];
        return assignment?.collaborators.includes(currentUserId);
      }).length;
      return { ...baseStats, collaborating };
    }

    if (role === 'secretario') {
      const pendingDocs = filteredExpedientes.filter(exp => {
        const assignment = expedientesAssignments[exp.id];
        return assignment && assignment.documentsPending > 0;
      }).length;
      return { ...baseStats, pendingDocs };
    }

    return baseStats;
  }, [filteredExpedientes, role, currentUserId]);

  // Paginación
  const totalPages = Math.ceil(filteredExpedientes.length / itemsPerPage);
  const paginatedExpedientes = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredExpedientes.slice(start, start + itemsPerPage);
  }, [filteredExpedientes, currentPage]);

  // Handlers
  const handleCreateExpediente = () => {
    // Aquí iría la llamada a la API
    showToast('Expediente creado correctamente', 'success');
    setActiveModal(null);
    setNewExpediente({
      title: '',
      client: '',
      type: 'Civil',
      status: 'active',
      priority: 'medium',
      amount: '',
      description: '',
    });
  };

  const handleEditExpediente = () => {
    if (!selectedExpediente) return;
    showToast('Expediente actualizado correctamente', 'success');
    setActiveModal(null);
  };

  const handleDeleteExpediente = () => {
    if (!selectedExpediente) return;
    showToast('Expediente eliminado correctamente', 'success');
    setActiveModal(null);
    setSelectedExpediente(null);
  };

  const handleUploadDocuments = () => {
    showToast('Documentos subidos correctamente', 'success');
    setActiveModal(null);
  };

  const handleAssignTasks = () => {
    showToast('Tareas asignadas correctamente', 'success');
    setActiveModal(null);
  };

  const handleAssignLawyers = () => {
    showToast('Abogados asignados correctamente', 'success');
    setActiveModal(null);
  };

  const handleRegisterDiligencias = () => {
    showToast('Diligencias registradas correctamente', 'success');
    setActiveModal(null);
  };

  const handleOrganizeArchive = () => {
    showToast('Documentos organizados correctamente', 'success');
    setActiveModal(null);
  };

  const handleDownload = () => {
    // Crear CSV
    const headers = ['ID', 'Título', 'Cliente', 'Tipo', 'Estado', 'Prioridad', 'Progreso', 'Importe'];
    const rows = filteredExpedientes.map(exp => [
      exp.id,
      exp.title,
      exp.client,
      exp.type,
      getStatusText(exp.status),
      exp.priority,
      exp.progress,
      exp.amount
    ]);
    
    const csv = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `expedientes_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    
    showToast('Descarga iniciada', 'success');
  };

  const handleApplyFilters = () => {
    setCurrentPage(1);
    setActiveModal(null);
    showToast('Filtros aplicados', 'info');
  };

  const openModal = (type: ModalType, expediente?: typeof expedientesData[0]) => {
    if (expediente) {
      setSelectedExpediente(expediente);
      setEditExpediente({
        title: expediente.title,
        client: expediente.client,
        type: expediente.type,
        status: expediente.status,
        priority: expediente.priority,
        progress: expediente.progress,
        description: expediente.description,
      });
      
      // Si es el modal de compresión, cargar archivos simulados del expediente
      if (type === 'compress') {
        const mockFiles: SelectableFile[] = [
          { id: '1', name: 'Demanda.pdf', size: 2500000, type: 'application/pdf', lastModified: '2024-01-15' },
          { id: '2', name: 'Escritura.docx', size: 1800000, type: 'application/docx', lastModified: '2024-01-14' },
          { id: '3', name: 'Evidencia_Foto1.jpg', size: 3200000, type: 'image/jpeg', lastModified: '2024-01-13' },
          { id: '4', name: 'Anexos.pdf', size: 1500000, type: 'application/pdf', lastModified: '2024-01-12' },
          { id: '5', name: 'Correspondencia.pdf', size: 800000, type: 'application/pdf', lastModified: '2024-01-10' },
        ];
        _setExpedienteFiles(mockFiles);
        _setSelectedFileIds([]);
        _setFilesToCompress([]);
      }
    }
    setActiveModal(type);
    setOpenDropdownId(null);
  };

  // Obtener título y subtítulo según rol
  const getPageTitle = () => {
    switch (role) {
      case 'super_admin':
        return { title: 'Todos los Expedientes', subtitle: 'Gestión completa del bufete' };
      case 'socio':
        return { title: 'Expedientes del Bufete', subtitle: 'Supervisión y control de casos' };
      case 'abogado_senior':
        return { title: 'Mis Expedientes y Supervisados', subtitle: 'Casos asignados y equipo a cargo' };
      case 'abogado_junior':
        return { title: 'Mis Expedientes Asignados', subtitle: 'Casos bajo mi responsabilidad' };
      case 'paralegal':
        return { title: 'Expedientes en Colaboración', subtitle: 'Casos donde participo' };
      case 'secretario':
        return { title: 'Archivo de Expedientes', subtitle: 'Gestión documental de casos' };
      case 'administrador':
        return { title: 'Vista de Expedientes', subtitle: 'Consulta administrativa' };
      default:
        return { title: 'Expedientes', subtitle: '' };
    }
  };

  const pageInfo = getPageTitle();

  // Obtener icono de estado para el rol
  const getRoleIcon = () => {
    switch (role) {
      case 'super_admin':
      case 'socio':
        return <Gavel className="w-5 h-5" />;
      case 'abogado_senior':
        return <Briefcase className="w-5 h-5" />;
      case 'abogado_junior':
        return <FileText className="w-5 h-5" />;
      case 'paralegal':
        return <Users className="w-5 h-5" />;
      case 'secretario':
        return <Archive className="w-5 h-5" />;
      default:
        return <FolderArchive className="w-5 h-5" />;
    }
  };

  const headerActions = (
    <div className="flex items-center gap-2 sm:gap-3">
      {/* Selector de vista */}
      <div className="flex items-center gap-1 p-1 bg-theme-card border border-theme rounded-xl">
        <button
          onClick={() => setViewMode('list')}
          className={`p-2 rounded-lg transition-all duration-300 ${viewMode === 'list' ? 'bg-amber-500 text-theme-primary shadow-lg shadow-amber-500/20' : 'text-theme-secondary hover:text-theme-primary hover:bg-theme-tertiary'}`}
          title="Vista de lista"
        >
          <List className="w-4 h-4" />
        </button>
        <button
          onClick={() => setViewMode('grid')}
          className={`p-2 rounded-lg transition-all duration-300 ${viewMode === 'grid' ? 'bg-amber-500 text-theme-primary shadow-lg shadow-amber-500/20' : 'text-theme-secondary hover:text-theme-primary hover:bg-theme-tertiary'}`}
          title="Vista de cuadrícula"
        >
          <LayoutGrid className="w-4 h-4" />
        </button>
      </div>

      {permissions.canCreate && (
        <button 
          onClick={() => openModal('create')}
          className="flex items-center gap-2 px-4 py-2 bg-amber-500 text-theme-primary font-medium rounded-xl hover:bg-amber-400 hover:shadow-lg hover:shadow-amber-500/20 transition-all duration-300"
        >
          <Plus className="w-4 h-4" />
          <span className="hidden sm:inline">Nuevo Expediente</span>
        </button>
      )}
    </div>
  );

  // Renderizar tarjetas de estadísticas según rol
  const renderStatsCards = () => {
    const cards = [];
    
    // Tarjetas base para todos los roles
    cards.push(
      { label: 'Total', value: stats.total, color: 'slate', icon: FolderArchive },
      { label: 'Activos', value: stats.active, color: 'emerald', icon: CheckCircle2 },
    );

    // Tarjetas específicas por rol
    if (role === 'abogado_senior' && 'supervised' in stats) {
      cards.push(
        { label: 'Supervisados', value: stats.supervised, color: 'blue', icon: Users },
        { label: 'Urgentes', value: stats.urgent, color: 'red', icon: AlertCircle },
      );
    } else if (role === 'paralegal' && 'collaborating' in stats) {
      cards.push(
        { label: 'Colaborando', value: stats.collaborating, color: 'teal', icon: Users },
        { label: 'Pendientes', value: stats.pending, color: 'amber', icon: HourglassIcon },
      );
    } else if (role === 'secretario' && 'pendingDocs' in stats) {
      cards.push(
        { label: 'Docs. Pendientes', value: stats.pendingDocs, color: 'amber', icon: FileCheck },
        { label: 'Cerrados', value: stats.closed, color: 'slate', icon: Archive },
      );
    } else if (role === 'super_admin' || role === 'socio') {
      cards.push(
        { label: 'Pendientes', value: stats.pending, color: 'amber', icon: HourglassIcon },
        { label: 'Urgentes', value: stats.urgent, color: 'red', icon: AlertCircle },
        { label: 'Cerrados', value: stats.closed, color: 'slate', icon: Archive },
      );
    } else {
      cards.push(
        { label: 'Pendientes', value: stats.pending, color: 'amber', icon: HourglassIcon },
        { label: 'Urgentes', value: stats.urgent, color: 'red', icon: AlertCircle },
        { label: 'Cerrados', value: stats.closed, color: 'slate', icon: Archive },
      );
    }

    const colorClasses: Record<string, { bg: string; text: string; border: string; gradient: string; iconBg: string }> = {
      slate: { 
        bg: 'bg-slate-500/10', 
        text: 'text-slate-400', 
        border: 'border-slate-500/20',
        gradient: 'from-slate-500/20 to-slate-600/10',
        iconBg: 'bg-slate-500/20'
      },
      emerald: { 
        bg: 'bg-emerald-500/10', 
        text: 'text-emerald-400', 
        border: 'border-emerald-500/20',
        gradient: 'from-emerald-500/20 to-emerald-600/10',
        iconBg: 'bg-emerald-500/20'
      },
      amber: { 
        bg: 'bg-amber-500/10', 
        text: 'text-amber-400', 
        border: 'border-amber-500/20',
        gradient: 'from-amber-500/20 to-amber-600/10',
        iconBg: 'bg-amber-500/20'
      },
      red: { 
        bg: 'bg-red-500/10', 
        text: 'text-red-400', 
        border: 'border-red-500/20',
        gradient: 'from-red-500/20 to-red-600/10',
        iconBg: 'bg-red-500/20'
      },
      blue: { 
        bg: 'bg-blue-500/10', 
        text: 'text-blue-400', 
        border: 'border-blue-500/20',
        gradient: 'from-blue-500/20 to-blue-600/10',
        iconBg: 'bg-blue-500/20'
      },
      teal: { 
        bg: 'bg-teal-500/10', 
        text: 'text-teal-400', 
        border: 'border-teal-500/20',
        gradient: 'from-teal-500/20 to-teal-600/10',
        iconBg: 'bg-teal-500/20'
      },
    };

    return (
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
        {cards.map((stat, index) => {
          const colors = colorClasses[stat.color];
          const Icon = stat.icon;
          return (
            <motion.div 
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05, duration: 0.3 }}
              whileHover={{ scale: 1.02, y: -2 }}
              className={`relative overflow-hidden p-4 bg-gradient-to-br ${colors.gradient} ${colors.border} border rounded-xl cursor-pointer transition-all duration-300 hover:shadow-lg hover:shadow-amber-500/5 group`}
              onClick={() => {
                if (stat.label === 'Urgentes') setStatusFilter('urgent');
                else if (stat.label === 'Activos') setStatusFilter('active');
                else if (stat.label === 'Pendientes') setStatusFilter('pending');
                else if (stat.label === 'Cerrados') setStatusFilter('closed');
              }}
            >
              <div className="absolute top-0 right-0 w-16 h-16 bg-gradient-to-br from-white/5 to-transparent rounded-full -translate-y-1/2 translate-x-1/2" />
              <div className="flex items-center justify-between mb-3">
                <div className={`p-2.5 ${colors.iconBg} rounded-xl group-hover:scale-110 transition-transform duration-300`}>
                  <Icon className={`w-5 h-5 ${colors.text}`} />
                </div>
                <span className={`text-3xl font-bold ${colors.text} tabular-nums`}>{stat.value}</span>
              </div>
              <p className="text-sm font-medium text-theme-secondary group-hover:text-theme-primary transition-colors">{stat.label}</p>
            </motion.div>
          );
        })}
      </div>
    );
  };

  // Renderizar información de asignación según rol
  const renderAssignmentInfo = (expId: string) => {
    const assignment = expedientesAssignments[expId];
    if (!assignment) return null;

    if (role === 'abogado_senior') {
      if (assignment.assignedTo === currentUserId) {
        return <span className="text-xs text-blue-400">Asignado a mí</span>;
      } else if (assignment.supervisedBy === currentUserId) {
        return (
          <div className="flex flex-col">
            <span className="text-xs text-amber-400">Supervisado</span>
            <span className="text-xs text-theme-tertiary">{assignment.assignedToName}</span>
          </div>
        );
      }
    }

    if (role === 'paralegal' && assignment.collaborators.includes(currentUserId)) {
      return <span className="text-xs text-teal-400">Colaborador</span>;
    }

    if ((role === 'super_admin' || role === 'socio') && permissions.canViewAssignmentInfo) {
      return (
        <div className="flex flex-col">
          <span className="text-xs text-theme-secondary">{assignment.assignedToName}</span>
          {assignment.supervisedByName && (
            <span className="text-xs text-theme-tertiary">Super: {assignment.supervisedByName}</span>
          )}
        </div>
      );
    }

    return null;
  };

  // Renderizar acciones específicas según rol
  const renderActions = (exp: typeof expedientesData[0]) => {
    const actions = [];

    // Ver detalles - disponible para todos
    actions.push(
      <button 
        key="view"
        onClick={() => navigate(`/expedientes/${exp.id}`)}
        className="p-2 text-theme-secondary hover:text-amber-500 hover:bg-amber-500/10 rounded-lg transition-colors"
        title="Ver detalles"
      >
        <Eye className="w-4 h-4" />
      </button>
    );

    // Editar - según permisos
    if (permissions.canEdit) {
      actions.push(
        <button 
          key="edit"
          onClick={() => openModal('edit', exp)}
          className="p-2 text-theme-secondary hover:text-blue-500 hover:bg-blue-500/10 rounded-lg transition-colors"
          title="Editar"
        >
          <Edit2 className="w-4 h-4" />
        </button>
      );
    }

    // Acciones específicas por rol
    if (permissions.canUploadDocs) {
      actions.push(
        <button 
          key="upload"
          onClick={() => openModal('upload', exp)}
          className="p-2 text-theme-secondary hover:text-purple-500 hover:bg-purple-500/10 rounded-lg transition-colors"
          title="Subir documentos"
        >
          <Upload className="w-4 h-4" />
        </button>
      );
    }

    if (permissions.canCreateTasks) {
      actions.push(
        <button 
          key="tasks"
          onClick={() => openModal('tasks', exp)}
          className="p-2 text-theme-secondary hover:text-cyan-500 hover:bg-cyan-500/10 rounded-lg transition-colors"
          title="Asignar tareas"
        >
          <CheckSquare className="w-4 h-4" />
        </button>
      );
    }

    if (permissions.canOrganizeArchive) {
      actions.push(
        <button 
          key="archive"
          onClick={() => openModal('archive', exp)}
          className="p-2 text-theme-secondary hover:text-emerald-500 hover:bg-emerald-500/10 rounded-lg transition-colors"
          title="Organizar documentos"
        >
          <FolderArchive className="w-4 h-4" />
        </button>
      );
    }

    if (permissions.canRegisterDiligencias) {
      actions.push(
        <button 
          key="diligencias"
          onClick={() => openModal('diligencias', exp)}
          className="p-2 text-theme-secondary hover:text-teal-500 hover:bg-teal-500/10 rounded-lg transition-colors"
          title="Registrar diligencias"
        >
          <History className="w-4 h-4" />
        </button>
      );
    }

    if (permissions.canAssign) {
      actions.push(
        <button 
          key="assign"
          onClick={() => openModal('assign', exp)}
          className="p-2 text-theme-secondary hover:text-green-500 hover:bg-green-500/10 rounded-lg transition-colors"
          title="Asignar abogados"
        >
          <UserPlus className="w-4 h-4" />
        </button>
      );
    }

    if (permissions.canDelete) {
      actions.push(
        <button 
          key="delete"
          onClick={() => openModal('delete', exp)}
          className="p-2 text-theme-secondary hover:text-red-500 hover:bg-red-500/10 rounded-lg transition-colors"
          title="Eliminar"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      );
    }

    return actions;
  };

  // Renderizar dropdown de más opciones
  const renderDropdown = (exp: typeof expedientesData[0]) => {
    const isOpen = openDropdownId === exp.id;
    
    return (
      <div className="relative">
        <button 
          onClick={() => setOpenDropdownId(isOpen ? null : exp.id)}
          className="p-2 text-theme-secondary hover:text-theme-primary hover:bg-theme-tertiary rounded-lg transition-colors"
          title="Más opciones"
        >
          <MoreVertical className="w-4 h-4" />
        </button>
        
        <AnimatePresence>
          {isOpen && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: -10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: -10 }}
              className="absolute right-0 mt-2 w-48 bg-theme-card border border-theme rounded-xl shadow-xl z-50 py-1"
            >
              <button
                onClick={() => {
                  showToast(`Exportando expediente ${exp.id}...`, 'info');
                  setOpenDropdownId(null);
                }}
                className="w-full px-4 py-2 text-left text-sm text-theme-secondary hover:bg-theme-tertiary flex items-center gap-2"
              >
                <Download className="w-4 h-4" />
                Exportar a PDF
              </button>
              <button
                onClick={() => {
                  showToast(`Generando informe de ${exp.id}...`, 'info');
                  setOpenDropdownId(null);
                }}
                className="w-full px-4 py-2 text-left text-sm text-theme-secondary hover:bg-theme-tertiary flex items-center gap-2"
              >
                <FileText className="w-4 h-4" />
                Generar informe
              </button>
              <button
                onClick={() => {
                  openModal('compress', exp);
                }}
                className="w-full px-4 py-2 text-left text-sm text-theme-secondary hover:bg-theme-tertiary flex items-center gap-2"
              >
                <FolderArchive className="w-4 h-4" />
                Comprimir documentos
              </button>
              
              {/* Opciones de firma electrónica */}
              {permissions.canRequestSignatures && (
                <>
                  <div className="border-t border-theme my-1" />
                  <button
                    onClick={() => {
                      setSelectedDocument({ id: exp.id, name: `${exp.title}.pdf` });
                      setSignatureMode('request');
                      setSignatureModalOpen(true);
                      setOpenDropdownId(null);
                    }}
                    className="w-full px-4 py-2 text-left text-sm text-theme-secondary hover:bg-theme-tertiary flex items-center gap-2"
                  >
                    <FileSignature className="w-4 h-4 text-amber-500" />
                    Solicitar firmas
                  </button>
                </>
              )}
              
              {permissions.canSign && (
                <button
                  onClick={() => {
                    setSelectedDocument({ id: exp.id, name: `${exp.title}.pdf` });
                    setSignatureMode('sign');
                    setSignatureModalOpen(true);
                    setOpenDropdownId(null);
                  }}
                  className="w-full px-4 py-2 text-left text-sm text-theme-secondary hover:bg-theme-tertiary flex items-center gap-2"
                >
                  <Pen className="w-4 h-4 text-emerald-500" />
                  Firmar documento
                </button>
              )}
              {permissions.canViewHistory && (
                <button
                  onClick={() => {
                    showToast(`Mostrando historial de ${exp.id}...`, 'info');
                    setOpenDropdownId(null);
                  }}
                  className="w-full px-4 py-2 text-left text-sm text-theme-secondary hover:bg-theme-tertiary flex items-center gap-2"
                >
                  <History className="w-4 h-4" />
                  Ver historial
                </button>
              )}
              <div className="border-t border-theme my-1" />
              <button
                onClick={() => {
                  navigator.clipboard.writeText(exp.id);
                  showToast('ID copiado al portapapeles', 'success');
                  setOpenDropdownId(null);
                }}
                className="w-full px-4 py-2 text-left text-sm text-theme-secondary hover:bg-theme-tertiary flex items-center gap-2"
              >
                <CheckCircle className="w-4 h-4" />
                Copiar ID
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    );
  };

  // Mensaje informativo según rol
  const getRoleMessage = () => {
    const messages: Record<UserRole, { title: string; description: string; tips: string[] }> = {
      super_admin: {
        title: 'Acceso Total',
        description: 'Tienes acceso completo a todos los expedientes del bufete.',
        tips: ['Crear, editar y eliminar cualquier expediente', 'Asignar y reasignar abogados', 'Cerrar y archivar expedientes', 'Aprobar gastos del expediente']
      },
      socio: {
        title: 'Supervisión Completa',
        description: 'Tienes acceso a todos los expedientes del bufete.',
        tips: ['Gestionar asignaciones de abogados', 'Crear y editar expedientes', 'Ver estado financiero de casos', 'Aprobar gastos mayores']
      },
      abogado_senior: {
        title: 'Gestión de Casos y Equipo',
        description: 'Ves tus expedientes asignados y los de los abogados junior que supervisas.',
        tips: ['Crear nuevos expedientes', 'Asignar tareas a tu equipo', 'Subir y gestionar documentos', 'Supervisar casos de juniors']
      },
      abogado_junior: {
        title: 'Casos Asignados',
        description: 'Ves únicamente los expedientes asignados a ti.',
        tips: ['Subir documentos de trabajo', 'Registrar actividades y notas', 'Actualizar el progreso de casos', 'Solicitar revisión de documentos']
      },
      paralegal: {
        title: 'Colaboración en Expedientes',
        description: 'Ves los expedientes en los que colaboras.',
        tips: ['Subir documentos de apoyo', 'Actualizar trámites y diligencias', 'Registrar actividades realizadas', 'Consultar información de casos']
      },
      secretario: {
        title: 'Gestión Documental',
        description: 'Ves todos los expedientes para gestión de archivo.',
        tips: ['Organizar documentos físicos y digitales', 'Actualizar información básica', 'Verificar estado de documentación', 'Archivar expedientes cerrados']
      },
      administrador: {
        title: 'Vista Administrativa',
        description: 'Acceso limitado para consulta administrativa.',
        tips: ['Consultar información básica de expedientes', 'Verificar datos para facturación', 'Acceso a información de clientes']
      },
      contador: {
        title: 'Sin Acceso a Expedientes',
        description: 'Tu rol no tiene acceso al módulo de expedientes.',
        tips: ['Accede a Facturación y Contabilidad', 'Consulta reportes financieros', 'Gestiona pagos y cobranza']
      },
      recepcionista: {
        title: 'Sin Acceso a Expedientes',
        description: 'Tu rol no tiene acceso al módulo de expedientes.',
        tips: ['Accede a Calendario para citas', 'Gestiona información de clientes', 'Usa Mensajes para comunicación']
      },
    };

    return messages[role] || messages.recepcionista;
  };

  // Si el rol no tiene acceso a expedientes
  if (role === 'contador' || role === 'recepcionista') {
    const message = getRoleMessage();
    return (
      <AppLayout 
        title="Expedientes"
        subtitle="Acceso restringido"
      >
        <main className="flex-1 overflow-y-auto p-6 lg:p-8">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-2xl mx-auto mt-12"
          >
            <div className="p-8 bg-theme-card/60 border border-theme rounded-2xl text-center">
              <div className="w-20 h-20 mx-auto mb-6 bg-theme-tertiary rounded-full flex items-center justify-center">
                <FolderArchive className="w-10 h-10 text-slate-600" />
              </div>
              <h2 className="text-2xl font-bold text-theme-primary mb-2">{message.title}</h2>
              <p className="text-theme-secondary mb-6">{message.description}</p>
              
              <div className="p-4 bg-theme-tertiary/50 rounded-xl text-left">
                <p className="text-sm font-medium text-theme-secondary mb-3">Acciones disponibles para tu rol:</p>
                <ul className="space-y-2">
                  {message.tips.map((tip, idx) => (
                    <li key={idx} className="flex items-center gap-2 text-sm text-theme-secondary">
                      <div className="w-1.5 h-1.5 bg-amber-500 rounded-full" />
                      {tip}
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

  return (
    <AppLayout 
      title={pageInfo.title}
      subtitle={`${filteredExpedientes.length} expedientes encontrados${pageInfo.subtitle ? ` • ${pageInfo.subtitle}` : ''}`}
      headerActions={headerActions}
    >
      <main className="flex-1 overflow-y-auto p-6 lg:p-8">
        {/* Toast Notifications */}
        <div className="fixed top-4 right-4 z-50 space-y-2">
          <AnimatePresence>
            {toasts.map(toast => (
              <motion.div
                key={toast.id}
                initial={{ opacity: 0, x: 100 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 100 }}
                className={`px-4 py-3 rounded-xl shadow-lg flex items-center gap-2 ${
                  toast.type === 'success' ? 'bg-emerald-500 text-theme-primary' :
                  toast.type === 'error' ? 'bg-red-500 text-theme-primary' :
                  'bg-theme-tertiary text-theme-primary border border-theme'
                }`}
              >
                {toast.type === 'success' && <CheckCircle2 className="w-5 h-5" />}
                {toast.type === 'error' && <AlertCircle className="w-5 h-5" />}
                {toast.type === 'info' && <FileText className="w-5 h-5" />}
                <span className="text-sm font-medium">{toast.message}</span>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>

        {/* Search and Filters */}
        <div className="mb-6 space-y-4">
          <div className="flex flex-col lg:flex-row gap-4">
            <div className="relative flex-1 group">
              <input
                type="text"
                placeholder="Buscar por título, cliente o número de expediente..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-12 pr-12 py-3 bg-theme-card border border-theme rounded-xl text-theme-primary placeholder-theme-tertiary focus:outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 transition-all duration-300"
              />
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-theme-tertiary group-focus-within:text-amber-500 transition-colors" />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-4 top-1/2 -translate-y-1/2 p-1 text-theme-tertiary hover:text-theme-primary transition-colors"
                >
                  <XCircle className="w-5 h-5" />
                </button>
              )}
            </div>

            <div className="flex gap-2 flex-wrap sm:flex-nowrap">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-4 py-3 bg-theme-card border border-theme rounded-xl text-theme-primary focus:outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 transition-all duration-300 min-w-[140px]"
              >
                <option value="all">Estados</option>
                <option value="active">Activos</option>
                <option value="pending">Pendientes</option>
                <option value="urgent">Urgentes</option>
                <option value="closed">Cerrados</option>
              </select>

              <select
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value)}
                className="px-4 py-3 bg-theme-card border border-theme rounded-xl text-theme-primary focus:outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 transition-all duration-300 min-w-[140px]"
              >
                <option value="all">Tipos</option>
                <option value="Civil">Civil</option>
                <option value="Laboral">Laboral</option>
                <option value="Penal">Penal</option>
                <option value="Mercantil">Mercantil</option>
                <option value="Familiar">Familiar</option>
                <option value="Sucesiones">Sucesiones</option>
              </select>

              <button 
                onClick={() => setActiveModal('filters')}
                className={`p-3 bg-theme-card border border-theme rounded-xl transition-all duration-300 ${
                  Object.values(advancedFilters).some(v => v !== 'all' && v !== '') 
                    ? 'text-amber-500 border-amber-500 bg-amber-500/10' 
                    : 'text-theme-secondary hover:text-theme-primary hover:border-amber-500 hover:bg-amber-500/5'
                }`}
                title="Filtros avanzados"
              >
                <Filter className="w-5 h-5" />
              </button>

              {permissions.canViewAllDetails && (
                <button 
                  onClick={handleDownload}
                  className="p-3 bg-theme-card border border-theme rounded-xl text-theme-secondary hover:text-theme-primary hover:border-amber-500 hover:bg-amber-500/5 transition-all duration-300"
                  title="Descargar CSV"
                >
                  <Download className="w-5 h-5" />
                </button>
              )}
            </div>
          </div>

          {/* Active Filters Chips */}
          {(statusFilter !== 'all' || typeFilter !== 'all' || searchQuery || Object.values(advancedFilters).some(v => v !== 'all' && v !== '')) && (
            <motion.div 
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex flex-wrap items-center gap-2"
            >
              <span className="text-sm text-theme-secondary">Filtros activos:</span>
              
              {searchQuery && (
                <motion.button
                  initial={{ scale: 0.8 }}
                  animate={{ scale: 1 }}
                  onClick={() => setSearchQuery('')}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-amber-500/10 border border-amber-500/30 rounded-full text-sm text-amber-400 hover:bg-amber-500/20 transition-colors"
                >
                  <Search className="w-3.5 h-3.5" />
                  "{searchQuery}"
                  <XCircle className="w-4 h-4" />
                </motion.button>
              )}
              
              {statusFilter !== 'all' && (
                <motion.button
                  initial={{ scale: 0.8 }}
                  animate={{ scale: 1 }}
                  onClick={() => setStatusFilter('all')}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-500/10 border border-emerald-500/30 rounded-full text-sm text-emerald-400 hover:bg-emerald-500/20 transition-colors"
                >
                  {statusFilter === 'active' && <CheckCircle2 className="w-3.5 h-3.5" />}
                  {statusFilter === 'pending' && <HourglassIcon className="w-3.5 h-3.5" />}
                  {statusFilter === 'urgent' && <AlertCircle className="w-3.5 h-3.5" />}
                  {statusFilter === 'closed' && <Archive className="w-3.5 h-3.5" />}
                  {getStatusText(statusFilter)}
                  <XCircle className="w-4 h-4" />
                </motion.button>
              )}
              
              {typeFilter !== 'all' && (
                <motion.button
                  initial={{ scale: 0.8 }}
                  animate={{ scale: 1 }}
                  onClick={() => setTypeFilter('all')}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-blue-500/10 border border-blue-500/30 rounded-full text-sm text-blue-400 hover:bg-blue-500/20 transition-colors"
                >
                  <FileText className="w-3.5 h-3.5" />
                  {typeFilter}
                  <XCircle className="w-4 h-4" />
                </motion.button>
              )}
              
              {advancedFilters.priority !== 'all' && (
                <motion.button
                  initial={{ scale: 0.8 }}
                  animate={{ scale: 1 }}
                  onClick={() => setAdvancedFilters({...advancedFilters, priority: 'all'})}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-red-500/10 border border-red-500/30 rounded-full text-sm text-red-400 hover:bg-red-500/20 transition-colors"
                >
                  <Flag className="w-3.5 h-3.5" />
                  Prioridad {advancedFilters.priority}
                  <XCircle className="w-4 h-4" />
                </motion.button>
              )}
              
              <button
                onClick={() => {
                  setSearchQuery('');
                  setStatusFilter('all');
                  setTypeFilter('all');
                  setAdvancedFilters({
                    priority: 'all',
                    dateFrom: '',
                    dateTo: '',
                    amountMin: '',
                    amountMax: '',
                  });
                  setCurrentPage(1);
                }}
                className="text-sm text-theme-secondary hover:text-amber-500 transition-colors underline decoration-dotted"
              >
                Limpiar todo
              </button>
            </motion.div>
          )}

          {/* Quick Stats */}
          {renderStatsCards()}
        </div>

        {/* Expedientes Table/Grid */}
        <div className="bg-theme-card/60 border border-theme rounded-2xl overflow-hidden">
          {paginatedExpedientes.length === 0 ? (
            <div className="py-16 text-center text-theme-tertiary">
              <div className="flex flex-col items-center gap-3">
                <div className="w-20 h-20 bg-theme-tertiary/30 rounded-full flex items-center justify-center mb-2">
                  <FolderArchive className="w-10 h-10 text-slate-600" />
                </div>
                <p className="text-lg font-medium text-theme-secondary">No se encontraron expedientes</p>
                {(role === 'abogado_junior' || role === 'paralegal') && (
                  <p className="text-sm text-theme-tertiary">
                    {role === 'abogado_junior' 
                      ? 'No tienes expedientes asignados actualmente' 
                      : 'No colaboras en ningún expediente actualmente'}
                  </p>
                )}
              </div>
            </div>
          ) : viewMode === 'grid' ? (
            <div className="p-4">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {paginatedExpedientes.map((exp, index) => (
                  <motion.div
                    key={exp.id}
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: index * 0.05 }}
                    className="group relative bg-theme-card/80 border border-theme rounded-xl p-4 hover:border-amber-500/50 hover:shadow-lg hover:shadow-amber-500/5 transition-all duration-300 cursor-pointer"
                    onClick={() => navigate(`/expedientes/${exp.id}`)}
                  >
                    {/* Priority indicator */}
                    {exp.priority === 'high' && (
                      <div className="absolute top-0 right-0 w-0 h-0 border-t-[24px] border-t-red-500 border-l-[24px] border-l-transparent rounded-tr-xl" />
                    )}
                    
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1 min-w-0">
                        <h4 className="text-sm font-semibold text-theme-primary group-hover:text-amber-500 transition-colors truncate">
                          {exp.title}
                        </h4>
                        <p className="text-xs text-theme-tertiary mt-0.5">{exp.id}</p>
                      </div>
                      <span className={`px-2.5 py-1 text-xs font-medium rounded-full border shrink-0 ml-2 ${getStatusColor(exp.status)}`}>
                        {getStatusText(exp.status)}
                      </span>
                    </div>

                    <div className="flex items-center gap-2 mb-3">
                      <div className="w-7 h-7 bg-gradient-to-br from-theme-tertiary to-theme-tertiary rounded-full flex items-center justify-center text-xs font-medium text-theme-secondary border border-theme">
                        {exp.client.split(' ').map((n: string) => n[0]).join('')}
                      </div>
                      <span className="text-sm text-theme-secondary truncate">{exp.client}</span>
                    </div>

                    <div className="flex items-center gap-3 text-xs text-theme-tertiary mb-3">
                      {permissions.canViewAllDetails && (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-theme-tertiary/50 rounded">
                          <FileText className="w-3 h-3" />
                          {exp.type}
                        </span>
                      )}
                      <span className="inline-flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        {exp.date}
                      </span>
                    </div>

                    {permissions.canViewProgress && (
                      <div className="mb-3">
                        <div className="flex items-center justify-between text-xs mb-1">
                          <span className="text-theme-secondary">Progreso</span>
                          <span className={`font-medium ${
                            exp.progress === 100 ? 'text-emerald-400' :
                            exp.progress > 50 ? 'text-amber-400' :
                            'text-blue-400'
                          }`}>{exp.progress}%</span>
                        </div>
                        <div className="h-1.5 bg-theme-tertiary rounded-full overflow-hidden">
                          <motion.div 
                            initial={{ width: 0 }}
                            animate={{ width: `${exp.progress}%` }}
                            transition={{ duration: 0.5, delay: index * 0.05 }}
                            className={`h-full rounded-full ${
                              exp.progress === 100 ? 'bg-emerald-500' :
                              exp.progress > 50 ? 'bg-amber-500' :
                              'bg-blue-500'
                            }`}
                          />
                        </div>
                      </div>
                    )}

                    {permissions.canViewFinancialData && (
                      <div className="flex items-center justify-between py-2 border-t border-theme">
                        <span className="text-xs text-theme-tertiary">Importe</span>
                        <span className="text-sm font-semibold text-theme-primary">{exp.amount}</span>
                      </div>
                    )}

                    <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1 bg-theme-card/90 backdrop-blur-sm rounded-lg p-1">
                      <button 
                        onClick={(e) => { e.stopPropagation(); navigate(`/expedientes/${exp.id}`); }}
                        className="p-1.5 text-theme-secondary hover:text-amber-500 hover:bg-amber-500/10 rounded transition-colors"
                        title="Ver detalles"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      {permissions.canEdit && (
                        <button 
                          onClick={(e) => { e.stopPropagation(); openModal('edit', exp); }}
                          className="p-1.5 text-theme-secondary hover:text-blue-500 hover:bg-blue-500/10 rounded transition-colors"
                          title="Editar"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                      )}
                      <button 
                        onClick={(e) => { e.stopPropagation(); setOpenDropdownId(openDropdownId === exp.id ? null : exp.id); }}
                        className="p-1.5 text-theme-secondary hover:text-theme-primary hover:bg-theme-tertiary rounded transition-colors"
                      >
                        <MoreVertical className="w-4 h-4" />
                      </button>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-theme bg-theme-card/80">
                  <th className="text-left py-4 px-6 text-xs font-medium text-theme-secondary uppercase">
                    <div className="flex items-center gap-2">
                      Expediente
                      <ArrowUpDown className="w-3 h-3 opacity-50" />
                    </div>
                  </th>
                  <th className="text-left py-4 px-6 text-xs font-medium text-theme-secondary uppercase">
                    Cliente
                  </th>
                  {permissions.canViewAllDetails && (
                    <th className="text-left py-4 px-6 text-xs font-medium text-theme-secondary uppercase hidden md:table-cell">
                      Tipo
                    </th>
                  )}
                  {permissions.canViewAssignmentInfo && (
                    <th className="text-left py-4 px-6 text-xs font-medium text-theme-secondary uppercase hidden lg:table-cell">
                      Asignación
                    </th>
                  )}
                  <th className="text-left py-4 px-6 text-xs font-medium text-theme-secondary uppercase">
                    Estado
                  </th>
                  <th className="text-left py-4 px-6 text-xs font-medium text-theme-secondary uppercase">
                    Prescripción
                  </th>
                  {permissions.canViewProgress && (
                    <th className="text-left py-4 px-6 text-xs font-medium text-theme-secondary uppercase">
                      Progreso
                    </th>
                  )}
                  {permissions.canViewFinancialData && (
                    <th className="text-left py-4 px-6 text-xs font-medium text-theme-secondary uppercase">
                      Importe
                    </th>
                  )}
                  <th className="text-left py-4 px-6 text-xs font-medium text-theme-secondary uppercase">
                    Acciones
                  </th>
                </tr>
              </thead>
              <tbody>
                  {paginatedExpedientes.map((exp, index) => (
                    <motion.tr 
                      key={exp.id} 
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.03 }}
                      className="border-b border-theme/50 hover:bg-theme-tertiary/30 transition-colors cursor-pointer group"
                    >
                      <td className="py-4 px-6">
                        <div>
                          <p className="text-sm font-medium text-theme-primary group-hover:text-amber-500 transition-colors">
                            {exp.title}
                          </p>
                          <p className="text-xs text-theme-tertiary">{exp.id}</p>
                          {/* Para secretario: mostrar estado de documentación */}
                          {role === 'secretario' && (
                            <p className="text-xs text-theme-secondary mt-1">
                              Docs: {exp.status === 'closed' ? 'Archivado' : 'En proceso'}
                            </p>
                          )}
                        </div>
                      </td>
                      <td className="py-4 px-6">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 bg-gradient-to-br from-theme-tertiary to-theme-tertiary rounded-full flex items-center justify-center text-xs font-medium text-theme-secondary border border-theme">
                            {exp.client.split(' ').map((n: string) => n[0]).join('')}
                          </div>
                          <div>
                            <span className="text-sm text-theme-secondary">{exp.client}</span>
                            {/* Para paralegal: mostrar información básica */}
                            {role === 'paralegal' && (
                              <p className="text-xs text-theme-tertiary">Colaborador</p>
                            )}
                          </div>
                        </div>
                      </td>
                      {permissions.canViewAllDetails && (
                        <td className="py-4 px-6 hidden md:table-cell">
                          <span className="text-xs text-theme-secondary px-2 py-1 bg-theme-tertiary rounded-full">
                            {exp.type}
                          </span>
                        </td>
                      )}
                      {permissions.canViewAssignmentInfo && (
                        <td className="py-4 px-6 hidden lg:table-cell">
                          {renderAssignmentInfo(exp.id)}
                        </td>
                      )}
                      <td className="py-4 px-6">
                        <div className="flex items-center gap-2">
                          <span className={`px-3 py-1 text-xs font-medium rounded-full border ${getStatusColor(exp.status)}`}>
                            {getStatusText(exp.status)}
                          </span>
                          {exp.priority === 'high' && (
                            <Flag className="w-4 h-4 text-red-400" />
                          )}
                        </div>
                      </td>
                      <td className="py-4 px-6">
                        <PrescripcionBadge expedienteId={exp.id} size="sm" />
                      </td>
                      {permissions.canViewProgress && (
                        <td className="py-4 px-6">
                          <div className="flex items-center gap-3">
                            <div className="flex-1 h-2 bg-theme-tertiary rounded-full overflow-hidden w-20">
                              <div 
                                className={`h-full rounded-full ${
                                  exp.progress === 100 ? 'bg-emerald-500' :
                                  exp.progress > 50 ? 'bg-amber-500' :
                                  'bg-blue-500'
                                }`}
                                style={{ width: `${exp.progress}%` }}
                              />
                            </div>
                            <span className="text-xs text-theme-secondary w-8">{exp.progress}%</span>
                          </div>
                        </td>
                      )}
                      {permissions.canViewFinancialData && (
                        <td className="py-4 px-6">
                          <span className="text-sm font-medium text-theme-primary">{exp.amount}</span>
                        </td>
                      )}
                      <td className="py-4 px-6">
                        <div className="flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
                          {renderActions(exp)}
                          {renderDropdown(exp)}
                        </div>
                      </td>
                    </motion.tr>
                  ))}
              </tbody>
            </table>
          </div>
          )}

          {/* Pagination */}
          {filteredExpedientes.length > 0 && (
            <div className="p-4 border-t border-theme flex items-center justify-between">
              <p className="text-sm text-theme-secondary">
                Mostrando {Math.min((currentPage - 1) * itemsPerPage + 1, filteredExpedientes.length)} - {Math.min(currentPage * itemsPerPage, filteredExpedientes.length)} de {filteredExpedientes.length} expedientes
              </p>
              <div className="flex items-center gap-2">
                <button 
                  onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                  className="px-4 py-2 text-sm text-theme-secondary hover:text-theme-primary hover:bg-theme-tertiary rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                
                {Array.from({ length: totalPages }, (_, i) => i + 1).slice(
                  Math.max(0, currentPage - 3),
                  Math.min(totalPages, currentPage + 2)
                ).map(page => (
                  <button
                    key={page}
                    onClick={() => setCurrentPage(page)}
                    className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
                      currentPage === page 
                        ? 'bg-amber-500 text-theme-primary' 
                        : 'text-theme-secondary hover:text-theme-primary hover:bg-theme-tertiary'
                    }`}
                  >
                    {page}
                  </button>
                ))}
                
                <button 
                  onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages}
                  className="px-4 py-2 text-sm text-theme-secondary hover:text-theme-primary hover:bg-theme-tertiary rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}
        </div>

        {/* FAB Mobile */}
        {permissions.canCreate && (
          <motion.button
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => openModal('create')}
            className="sm:hidden fixed bottom-6 right-6 z-40 w-14 h-14 bg-amber-500 text-theme-primary rounded-full shadow-lg shadow-amber-500/30 flex items-center justify-center hover:bg-amber-400 transition-colors"
          >
            <Plus className="w-6 h-6" />
          </motion.button>
        )}

        {/* Mensaje informativo según rol */}
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="mt-6 p-4 bg-theme-card/40 border border-theme rounded-xl"
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
              <p className="text-sm text-theme-secondary mt-1">
                {getRoleMessage().description}
              </p>
              <div className="mt-3 flex flex-wrap gap-2">
                {getRoleMessage().tips.map((tip, idx) => (
                  <span 
                    key={idx}
                    className="inline-flex items-center gap-1.5 text-xs text-theme-secondary px-2 py-1 bg-theme-tertiary/50 rounded-lg"
                  >
                    <div className="w-1 h-1 bg-amber-500 rounded-full" />
                    {tip}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </motion.div>
      </main>

      {/* MODALES */}
      
      {/* Modal: Crear Expediente */}
      <AnimatePresence>
        {activeModal === 'create' && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => setActiveModal(null)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-theme-card border border-theme rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="p-6 border-b border-theme flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-amber-500/10 rounded-xl">
                    <Plus className="w-5 h-5 text-amber-500" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-theme-primary">Nuevo Expediente</h3>
                    <p className="text-sm text-theme-secondary">Crea un nuevo caso para el bufete</p>
                  </div>
                </div>
                <button 
                  onClick={() => setActiveModal(null)}
                  className="p-2 text-theme-secondary hover:text-theme-primary hover:bg-theme-tertiary rounded-lg transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              
              <div className="p-6 space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-theme-secondary mb-1">Título del caso</label>
                    <input
                      type="text"
                      value={newExpediente.title}
                      onChange={(e) => setNewExpediente({...newExpediente, title: e.target.value})}
                      className="w-full px-4 py-2 bg-theme-tertiary border border-theme rounded-lg text-theme-primary focus:outline-none focus:border-amber-500"
                      placeholder="Ej: Reclamación de deuda..."
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-theme-secondary mb-1">Cliente</label>
                    <input
                      type="text"
                      value={newExpediente.client}
                      onChange={(e) => setNewExpediente({...newExpediente, client: e.target.value})}
                      className="w-full px-4 py-2 bg-theme-tertiary border border-theme rounded-lg text-theme-primary focus:outline-none focus:border-amber-500"
                      placeholder="Nombre del cliente..."
                    />
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-theme-secondary mb-1">Tipo de caso</label>
                    <select
                      value={newExpediente.type}
                      onChange={(e) => setNewExpediente({...newExpediente, type: e.target.value})}
                      className="w-full px-4 py-2 bg-theme-tertiary border border-theme rounded-lg text-theme-primary focus:outline-none focus:border-amber-500"
                    >
                      <option value="Civil">Civil</option>
                      <option value="Laboral">Laboral</option>
                      <option value="Penal">Penal</option>
                      <option value="Mercantil">Mercantil</option>
                      <option value="Familiar">Familiar</option>
                      <option value="Sucesiones">Sucesiones</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-theme-secondary mb-1">Prioridad</label>
                    <select
                      value={newExpediente.priority}
                      onChange={(e) => setNewExpediente({...newExpediente, priority: e.target.value})}
                      className="w-full px-4 py-2 bg-theme-tertiary border border-theme rounded-lg text-theme-primary focus:outline-none focus:border-amber-500"
                    >
                      <option value="low">Baja</option>
                      <option value="medium">Media</option>
                      <option value="high">Alta</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-theme-secondary mb-1">Importe estimado</label>
                    <input
                      type="text"
                      value={newExpediente.amount}
                      onChange={(e) => setNewExpediente({...newExpediente, amount: e.target.value})}
                      className="w-full px-4 py-2 bg-theme-tertiary border border-theme rounded-lg text-theme-primary focus:outline-none focus:border-amber-500"
                      placeholder="€0.00"
                    />
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-theme-secondary mb-1">Descripción</label>
                  <textarea
                    value={newExpediente.description}
                    onChange={(e) => setNewExpediente({...newExpediente, description: e.target.value})}
                    rows={4}
                    className="w-full px-4 py-2 bg-theme-tertiary border border-theme rounded-lg text-theme-primary focus:outline-none focus:border-amber-500 resize-none"
                    placeholder="Describe los detalles del caso..."
                  />
                </div>
              </div>
              
              <div className="p-6 border-t border-theme flex justify-end gap-3">
                <button
                  onClick={() => setActiveModal(null)}
                  className="px-4 py-2 text-theme-secondary hover:text-theme-primary transition-colors"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleCreateExpediente}
                  className="px-6 py-2 bg-amber-500 text-theme-primary font-medium rounded-lg hover:bg-amber-400 transition-colors flex items-center gap-2"
                >
                  <Save className="w-4 h-4" />
                  Crear Expediente
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Modal: Ver Detalles */}
      <AnimatePresence>
        {activeModal === 'view' && selectedExpediente && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => setActiveModal(null)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-theme-card border border-theme rounded-2xl w-full max-w-3xl max-h-[90vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="p-6 border-b border-theme flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-blue-500/10 rounded-xl">
                    <Eye className="w-5 h-5 text-blue-500" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-theme-primary">{selectedExpediente.title}</h3>
                    <p className="text-sm text-theme-secondary">{selectedExpediente.id}</p>
                  </div>
                </div>
                <button 
                  onClick={() => setActiveModal(null)}
                  className="p-2 text-theme-secondary hover:text-theme-primary hover:bg-theme-tertiary rounded-lg transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              
              <div className="p-6 space-y-6">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="p-4 bg-theme-tertiary/50 rounded-xl">
                    <div className="flex items-center gap-2 text-theme-secondary mb-1">
                      <User className="w-4 h-4" />
                      <span className="text-xs">Cliente</span>
                    </div>
                    <p className="text-sm font-medium text-theme-primary">{selectedExpediente.client}</p>
                  </div>
                  <div className="p-4 bg-theme-tertiary/50 rounded-xl">
                    <div className="flex items-center gap-2 text-theme-secondary mb-1">
                      <Tag className="w-4 h-4" />
                      <span className="text-xs">Tipo</span>
                    </div>
                    <p className="text-sm font-medium text-theme-primary">{selectedExpediente.type}</p>
                  </div>
                  <div className="p-4 bg-theme-tertiary/50 rounded-xl">
                    <div className="flex items-center gap-2 text-theme-secondary mb-1">
                      <Calendar className="w-4 h-4" />
                      <span className="text-xs">Fecha</span>
                    </div>
                    <p className="text-sm font-medium text-theme-primary">{selectedExpediente.date}</p>
                  </div>
                  <div className="p-4 bg-theme-tertiary/50 rounded-xl">
                    <div className="flex items-center gap-2 text-theme-secondary mb-1">
                      <DollarSign className="w-4 h-4" />
                      <span className="text-xs">Importe</span>
                    </div>
                    <p className="text-sm font-medium text-theme-primary">{selectedExpediente.amount}</p>
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="text-sm font-medium text-theme-secondary mb-3">Estado del caso</h4>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-theme-secondary">Estado</span>
                        <span className={`px-3 py-1 text-xs font-medium rounded-full border ${getStatusColor(selectedExpediente.status)}`}>
                          {getStatusText(selectedExpediente.status)}
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-theme-secondary">Prioridad</span>
                        <span className={`text-sm font-medium ${
                          selectedExpediente.priority === 'high' ? 'text-red-400' :
                          selectedExpediente.priority === 'medium' ? 'text-amber-400' :
                          'text-emerald-400'
                        }`}>
                          {selectedExpediente.priority === 'high' ? 'Alta' :
                           selectedExpediente.priority === 'medium' ? 'Media' : 'Baja'}
                        </span>
                      </div>
                      <div>
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-sm text-theme-secondary">Progreso</span>
                          <span className="text-sm text-theme-primary">{selectedExpediente.progress}%</span>
                        </div>
                        <div className="h-2 bg-theme-tertiary rounded-full overflow-hidden">
                          <div 
                            className={`h-full rounded-full ${
                              selectedExpediente.progress === 100 ? 'bg-emerald-500' :
                              selectedExpediente.progress > 50 ? 'bg-amber-500' :
                              'bg-blue-500'
                            }`}
                            style={{ width: `${selectedExpediente.progress}%` }}
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div>
                    <h4 className="text-sm font-medium text-theme-secondary mb-3">Descripción</h4>
                    <p className="text-sm text-theme-secondary leading-relaxed">
                      {selectedExpediente.description}
                    </p>
                  </div>
                </div>

                {permissions.canViewAssignmentInfo && expedientesAssignments[selectedExpediente.id] && (
                  <div>
                    <h4 className="text-sm font-medium text-theme-secondary mb-3">Asignación</h4>
                    <div className="p-4 bg-theme-tertiary/50 rounded-xl space-y-2">
                      <div className="flex items-center gap-2">
                        <User className="w-4 h-4 text-theme-secondary" />
                        <span className="text-sm text-theme-secondary">Abogado asignado:</span>
                        <span className="text-sm text-theme-primary">
                          {expedientesAssignments[selectedExpediente.id].assignedToName}
                        </span>
                      </div>
                      {expedientesAssignments[selectedExpediente.id].supervisedByName && (
                        <div className="flex items-center gap-2">
                          <Users className="w-4 h-4 text-theme-secondary" />
                          <span className="text-sm text-theme-secondary">Supervisado por:</span>
                          <span className="text-sm text-theme-primary">
                            {expedientesAssignments[selectedExpediente.id].supervisedByName}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
              
              <div className="p-6 border-t border-theme flex justify-end gap-3">
                <button
                  onClick={() => setActiveModal(null)}
                  className="px-4 py-2 text-theme-secondary hover:text-theme-primary transition-colors"
                >
                  Cerrar
                </button>
                {permissions.canEdit && (
                  <button
                    onClick={() => openModal('edit', selectedExpediente)}
                    className="px-6 py-2 bg-blue-500 text-theme-primary font-medium rounded-lg hover:bg-blue-400 transition-colors flex items-center gap-2"
                  >
                    <Edit2 className="w-4 h-4" />
                    Editar
                  </button>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Modal: Editar Expediente */}
      <AnimatePresence>
        {activeModal === 'edit' && selectedExpediente && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => setActiveModal(null)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-theme-card border border-theme rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="p-6 border-b border-theme flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-blue-500/10 rounded-xl">
                    <Edit2 className="w-5 h-5 text-blue-500" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-theme-primary">Editar Expediente</h3>
                    <p className="text-sm text-theme-secondary">{selectedExpediente.id}</p>
                  </div>
                </div>
                <button 
                  onClick={() => setActiveModal(null)}
                  className="p-2 text-theme-secondary hover:text-theme-primary hover:bg-theme-tertiary rounded-lg transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              
              <div className="p-6 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-theme-secondary mb-1">Título del caso</label>
                  <input
                    type="text"
                    value={editExpediente.title}
                    onChange={(e) => setEditExpediente({...editExpediente, title: e.target.value})}
                    className="w-full px-4 py-2 bg-theme-tertiary border border-theme rounded-lg text-theme-primary focus:outline-none focus:border-blue-500"
                  />
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-theme-secondary mb-1">Estado</label>
                    <select
                      value={editExpediente.status}
                      onChange={(e) => setEditExpediente({...editExpediente, status: e.target.value})}
                      className="w-full px-4 py-2 bg-theme-tertiary border border-theme rounded-lg text-theme-primary focus:outline-none focus:border-blue-500"
                    >
                      <option value="active">Activo</option>
                      <option value="pending">Pendiente</option>
                      <option value="urgent">Urgente</option>
                      <option value="closed">Cerrado</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-theme-secondary mb-1">Prioridad</label>
                    <select
                      value={editExpediente.priority}
                      onChange={(e) => setEditExpediente({...editExpediente, priority: e.target.value})}
                      className="w-full px-4 py-2 bg-theme-tertiary border border-theme rounded-lg text-theme-primary focus:outline-none focus:border-blue-500"
                    >
                      <option value="low">Baja</option>
                      <option value="medium">Media</option>
                      <option value="high">Alta</option>
                    </select>
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-theme-secondary mb-1">Progreso ({editExpediente.progress}%)</label>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={editExpediente.progress}
                    onChange={(e) => setEditExpediente({...editExpediente, progress: parseInt(e.target.value)})}
                    className="w-full h-2 bg-theme-tertiary rounded-lg appearance-none cursor-pointer accent-blue-500"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-theme-secondary mb-1">Descripción</label>
                  <textarea
                    value={editExpediente.description}
                    onChange={(e) => setEditExpediente({...editExpediente, description: e.target.value})}
                    rows={4}
                    className="w-full px-4 py-2 bg-theme-tertiary border border-theme rounded-lg text-theme-primary focus:outline-none focus:border-blue-500 resize-none"
                  />
                </div>
              </div>
              
              <div className="p-6 border-t border-theme flex justify-end gap-3">
                <button
                  onClick={() => setActiveModal(null)}
                  className="px-4 py-2 text-theme-secondary hover:text-theme-primary transition-colors"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleEditExpediente}
                  className="px-6 py-2 bg-blue-500 text-theme-primary font-medium rounded-lg hover:bg-blue-400 transition-colors flex items-center gap-2"
                >
                  <Save className="w-4 h-4" />
                  Guardar Cambios
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Modal: Subir Documentos */}
      <AnimatePresence>
        {activeModal === 'upload' && selectedExpediente && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => setActiveModal(null)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-theme-card border border-theme rounded-2xl w-full max-w-xl"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="p-6 border-b border-theme flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-purple-500/10 rounded-xl">
                    <Upload className="w-5 h-5 text-purple-500" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-theme-primary">Subir Documentos</h3>
                    <p className="text-sm text-theme-secondary">{selectedExpediente.id}</p>
                  </div>
                </div>
                <button 
                  onClick={() => setActiveModal(null)}
                  className="p-2 text-theme-secondary hover:text-theme-primary hover:bg-theme-tertiary rounded-lg transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              
              <div className="p-6 space-y-4">
                <div className="border-2 border-dashed border-theme rounded-xl p-8 text-center hover:border-purple-500/50 transition-colors cursor-pointer">
                  <Upload className="w-12 h-12 text-slate-600 mx-auto mb-4" />
                  <p className="text-theme-primary font-medium mb-1">Arrastra archivos aquí</p>
                  <p className="text-sm text-theme-secondary">o haz clic para seleccionar</p>
                  <p className="text-xs text-theme-tertiary mt-2">PDF, DOC, DOCX, JPG, PNG (máx. 10MB)</p>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-theme-secondary mb-1">Tipo de documento</label>
                  <select className="w-full px-4 py-2 bg-theme-tertiary border border-theme rounded-lg text-theme-primary focus:outline-none focus:border-purple-500">
                    <option>Escrito</option>
                    <option>Contrato</option>
                    <option>Factura</option>
                    <option>Correspondencia</option>
                    <option>Otros</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-theme-secondary mb-1">Descripción</label>
                  <textarea
                    rows={2}
                    className="w-full px-4 py-2 bg-theme-tertiary border border-theme rounded-lg text-theme-primary focus:outline-none focus:border-purple-500 resize-none"
                    placeholder="Descripción opcional del documento..."
                  />
                </div>
              </div>
              
              <div className="p-6 border-t border-theme flex justify-end gap-3">
                <button
                  onClick={() => setActiveModal(null)}
                  className="px-4 py-2 text-theme-secondary hover:text-theme-primary transition-colors"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleUploadDocuments}
                  className="px-6 py-2 bg-purple-500 text-theme-primary font-medium rounded-lg hover:bg-purple-400 transition-colors flex items-center gap-2"
                >
                  <Upload className="w-4 h-4" />
                  Subir Documentos
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Modal: Asignar Tareas */}
      <AnimatePresence>
        {activeModal === 'tasks' && selectedExpediente && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => setActiveModal(null)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-theme-card border border-theme rounded-2xl w-full max-w-xl"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="p-6 border-b border-theme flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-cyan-500/10 rounded-xl">
                    <CheckSquare className="w-5 h-5 text-cyan-500" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-theme-primary">Asignar Tareas</h3>
                    <p className="text-sm text-theme-secondary">{selectedExpediente.id}</p>
                  </div>
                </div>
                <button 
                  onClick={() => setActiveModal(null)}
                  className="p-2 text-theme-secondary hover:text-theme-primary hover:bg-theme-tertiary rounded-lg transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              
              <div className="p-6 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-theme-secondary mb-1">Título de la tarea</label>
                  <input
                    type="text"
                    className="w-full px-4 py-2 bg-theme-tertiary border border-theme rounded-lg text-theme-primary focus:outline-none focus:border-cyan-500"
                    placeholder="Ej: Preparar escrito de demanda..."
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-theme-secondary mb-1">Asignar a</label>
                    <select className="w-full px-4 py-2 bg-theme-tertiary border border-theme rounded-lg text-theme-primary focus:outline-none focus:border-cyan-500">
                      <option>Carlos Méndez</option>
                      <option>Juan Pérez</option>
                      <option>Ana López</option>
                      <option>María Ruiz</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-theme-secondary mb-1">Fecha límite</label>
                    <input
                      type="date"
                      className="w-full px-4 py-2 bg-theme-tertiary border border-theme rounded-lg text-theme-primary focus:outline-none focus:border-cyan-500"
                    />
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-theme-secondary mb-1">Prioridad</label>
                  <div className="flex gap-2">
                    {['Baja', 'Media', 'Alta', 'Urgente'].map((p, i) => (
                      <button
                        key={p}
                        className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                          i === 1 
                            ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/50' 
                            : 'bg-theme-tertiary text-theme-secondary border border-theme hover:border-cyan-500/30'
                        }`}
                      >
                        {p}
                      </button>
                    ))}
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-theme-secondary mb-1">Descripción</label>
                  <textarea
                    rows={3}
                    className="w-full px-4 py-2 bg-theme-tertiary border border-theme rounded-lg text-theme-primary focus:outline-none focus:border-cyan-500 resize-none"
                    placeholder="Describe los detalles de la tarea..."
                  />
                </div>
              </div>
              
              <div className="p-6 border-t border-theme flex justify-end gap-3">
                <button
                  onClick={() => setActiveModal(null)}
                  className="px-4 py-2 text-theme-secondary hover:text-theme-primary transition-colors"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleAssignTasks}
                  className="px-6 py-2 bg-cyan-500 text-theme-primary font-medium rounded-lg hover:bg-cyan-400 transition-colors flex items-center gap-2"
                >
                  <CheckSquare className="w-4 h-4" />
                  Asignar Tarea
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Modal: Asignar Abogados */}
      <AnimatePresence>
        {activeModal === 'assign' && selectedExpediente && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => setActiveModal(null)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-theme-card border border-theme rounded-2xl w-full max-w-xl"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="p-6 border-b border-theme flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-green-500/10 rounded-xl">
                    <UserPlus className="w-5 h-5 text-green-500" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-theme-primary">Asignar Abogados</h3>
                    <p className="text-sm text-theme-secondary">{selectedExpediente.id}</p>
                  </div>
                </div>
                <button 
                  onClick={() => setActiveModal(null)}
                  className="p-2 text-theme-secondary hover:text-theme-primary hover:bg-theme-tertiary rounded-lg transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              
              <div className="p-6 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-theme-secondary mb-2">Abogado principal</label>
                  <div className="space-y-2">
                    {['Carlos Méndez (Senior)', 'Laura Torres (Senior)', 'Juan Pérez (Junior)', 'Pedro Sánchez (Junior)'].map((name) => (
                      <label key={name} className="flex items-center gap-3 p-3 bg-theme-tertiary/50 rounded-lg cursor-pointer hover:bg-theme-tertiary transition-colors">
                        <input type="radio" name="abogado" className="w-4 h-4 text-green-500 bg-theme-tertiary border-slate-600" />
                        <div className="flex-1">
                          <p className="text-sm text-theme-primary">{name.split('(')[0]}</p>
                          <p className="text-xs text-theme-secondary">{name.match(/\((.*)\)/)?.[1]}</p>
                        </div>
                      </label>
                    ))}
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-theme-secondary mb-2">Colaboradores</label>
                  <div className="space-y-2">
                    {['Ana López (Paralegal)', 'María Ruiz (Paralegal)'].map((name) => (
                      <label key={name} className="flex items-center gap-3 p-3 bg-theme-tertiary/50 rounded-lg cursor-pointer hover:bg-theme-tertiary transition-colors">
                        <input type="checkbox" className="w-4 h-4 text-green-500 bg-theme-tertiary border-slate-600 rounded" />
                        <div className="flex-1">
                          <p className="text-sm text-theme-primary">{name.split('(')[0]}</p>
                          <p className="text-xs text-theme-secondary">{name.match(/\((.*)\)/)?.[1]}</p>
                        </div>
                      </label>
                    ))}
                  </div>
                </div>
              </div>
              
              <div className="p-6 border-t border-theme flex justify-end gap-3">
                <button
                  onClick={() => setActiveModal(null)}
                  className="px-4 py-2 text-theme-secondary hover:text-theme-primary transition-colors"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleAssignLawyers}
                  className="px-6 py-2 bg-green-500 text-theme-primary font-medium rounded-lg hover:bg-green-400 transition-colors flex items-center gap-2"
                >
                  <UserPlus className="w-4 h-4" />
                  Guardar Asignación
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Modal: Eliminar Confirmación */}
      <AnimatePresence>
        {activeModal === 'delete' && selectedExpediente && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => setActiveModal(null)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-theme-card border border-theme rounded-2xl w-full max-w-md"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="p-6 text-center">
                <div className="w-16 h-16 bg-red-500/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <AlertCircle className="w-8 h-8 text-red-500" />
                </div>
                <h3 className="text-xl font-semibold text-theme-primary mb-2">¿Eliminar expediente?</h3>
                <p className="text-theme-secondary mb-6">
                  Estás a punto de eliminar <strong className="text-theme-primary">{selectedExpediente.title}</strong> ({selectedExpediente.id}).
                  Esta acción no se puede deshacer.
                </p>
                
                <div className="flex gap-3 justify-center">
                  <button
                    onClick={() => setActiveModal(null)}
                    className="px-6 py-2 text-theme-secondary hover:text-theme-primary transition-colors"
                  >
                    Cancelar
                  </button>
                  <button
                    onClick={handleDeleteExpediente}
                    className="px-6 py-2 bg-red-500 text-theme-primary font-medium rounded-lg hover:bg-red-400 transition-colors flex items-center gap-2"
                  >
                    <Trash2 className="w-4 h-4" />
                    Eliminar Expediente
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Modal: Filtros Avanzados */}
      <AnimatePresence>
        {activeModal === 'filters' && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => setActiveModal(null)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-theme-card border border-theme rounded-2xl w-full max-w-lg"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="p-6 border-b border-theme flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-amber-500/10 rounded-xl">
                    <Filter className="w-5 h-5 text-amber-500" />
                  </div>
                  <h3 className="text-lg font-semibold text-theme-primary">Filtros Avanzados</h3>
                </div>
                <button 
                  onClick={() => setActiveModal(null)}
                  className="p-2 text-theme-secondary hover:text-theme-primary hover:bg-theme-tertiary rounded-lg transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              
              <div className="p-6 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-theme-secondary mb-1">Prioridad</label>
                  <select
                    value={advancedFilters.priority}
                    onChange={(e) => setAdvancedFilters({...advancedFilters, priority: e.target.value})}
                    className="w-full px-4 py-2 bg-theme-tertiary border border-theme rounded-lg text-theme-primary focus:outline-none focus:border-amber-500"
                  >
                    <option value="all">Todas</option>
                    <option value="high">Alta</option>
                    <option value="medium">Media</option>
                    <option value="low">Baja</option>
                  </select>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-theme-secondary mb-1">Fecha desde</label>
                    <input
                      type="date"
                      value={advancedFilters.dateFrom}
                      onChange={(e) => setAdvancedFilters({...advancedFilters, dateFrom: e.target.value})}
                      className="w-full px-4 py-2 bg-theme-tertiary border border-theme rounded-lg text-theme-primary focus:outline-none focus:border-amber-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-theme-secondary mb-1">Fecha hasta</label>
                    <input
                      type="date"
                      value={advancedFilters.dateTo}
                      onChange={(e) => setAdvancedFilters({...advancedFilters, dateTo: e.target.value})}
                      className="w-full px-4 py-2 bg-theme-tertiary border border-theme rounded-lg text-theme-primary focus:outline-none focus:border-amber-500"
                    />
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-theme-secondary mb-1">Importe mínimo</label>
                    <input
                      type="text"
                      value={advancedFilters.amountMin}
                      onChange={(e) => setAdvancedFilters({...advancedFilters, amountMin: e.target.value})}
                      className="w-full px-4 py-2 bg-theme-tertiary border border-theme rounded-lg text-theme-primary focus:outline-none focus:border-amber-500"
                      placeholder="€0"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-theme-secondary mb-1">Importe máximo</label>
                    <input
                      type="text"
                      value={advancedFilters.amountMax}
                      onChange={(e) => setAdvancedFilters({...advancedFilters, amountMax: e.target.value})}
                      className="w-full px-4 py-2 bg-theme-tertiary border border-theme rounded-lg text-theme-primary focus:outline-none focus:border-amber-500"
                      placeholder="Sin límite"
                    />
                  </div>
                </div>
              </div>
              
              <div className="p-6 border-t border-theme flex justify-between">
                <button
                  onClick={() => {
                    setAdvancedFilters({
                      priority: 'all',
                      dateFrom: '',
                      dateTo: '',
                      amountMin: '',
                      amountMax: '',
                    });
                    setStatusFilter('all');
                    setTypeFilter('all');
                    showToast('Filtros reiniciados', 'info');
                  }}
                  className="px-4 py-2 text-theme-secondary hover:text-theme-primary transition-colors"
                >
                  Limpiar filtros
                </button>
                <div className="flex gap-3">
                  <button
                    onClick={() => setActiveModal(null)}
                    className="px-4 py-2 text-theme-secondary hover:text-theme-primary transition-colors"
                  >
                    Cancelar
                  </button>
                  <button
                    onClick={handleApplyFilters}
                    className="px-6 py-2 bg-amber-500 text-theme-primary font-medium rounded-lg hover:bg-amber-400 transition-colors flex items-center gap-2"
                  >
                    <Filter className="w-4 h-4" />
                    Aplicar Filtros
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Modal: Registrar Diligencias */}
      <AnimatePresence>
        {activeModal === 'diligencias' && selectedExpediente && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => setActiveModal(null)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-theme-card border border-theme rounded-2xl w-full max-w-xl"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="p-6 border-b border-theme flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-teal-500/10 rounded-xl">
                    <History className="w-5 h-5 text-teal-500" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-theme-primary">Registrar Diligencias</h3>
                    <p className="text-sm text-theme-secondary">{selectedExpediente.id}</p>
                  </div>
                </div>
                <button 
                  onClick={() => setActiveModal(null)}
                  className="p-2 text-theme-secondary hover:text-theme-primary hover:bg-theme-tertiary rounded-lg transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              
              <div className="p-6 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-theme-secondary mb-1">Tipo de diligencia</label>
                  <select className="w-full px-4 py-2 bg-theme-tertiary border border-theme rounded-lg text-theme-primary focus:outline-none focus:border-teal-500">
                    <option>Presentación de escrito</option>
                    <option>Recogida de notificación</option>
                    <option>Comparecencia en juzgado</option>
                    <option>Entrega de documentación</option>
                    <option>Otra</option>
                  </select>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-theme-secondary mb-1">Fecha</label>
                    <input
                      type="date"
                      className="w-full px-4 py-2 bg-theme-tertiary border border-theme rounded-lg text-theme-primary focus:outline-none focus:border-teal-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-theme-secondary mb-1">Hora</label>
                    <input
                      type="time"
                      className="w-full px-4 py-2 bg-theme-tertiary border border-theme rounded-lg text-theme-primary focus:outline-none focus:border-teal-500"
                    />
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-theme-secondary mb-1">Lugar/Órgano</label>
                  <input
                    type="text"
                    className="w-full px-4 py-2 bg-theme-tertiary border border-theme rounded-lg text-theme-primary focus:outline-none focus:border-teal-500"
                    placeholder="Ej: Juzgado de Primera Instancia nº 3..."
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-theme-secondary mb-1">Descripción / Resultado</label>
                  <textarea
                    rows={3}
                    className="w-full px-4 py-2 bg-theme-tertiary border border-theme rounded-lg text-theme-primary focus:outline-none focus:border-teal-500 resize-none"
                    placeholder="Describe la diligencia realizada..."
                  />
                </div>
              </div>
              
              <div className="p-6 border-t border-theme flex justify-end gap-3">
                <button
                  onClick={() => setActiveModal(null)}
                  className="px-4 py-2 text-theme-secondary hover:text-theme-primary transition-colors"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleRegisterDiligencias}
                  className="px-6 py-2 bg-teal-500 text-theme-primary font-medium rounded-lg hover:bg-teal-400 transition-colors flex items-center gap-2"
                >
                  <History className="w-4 h-4" />
                  Registrar Diligencia
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Modal: Organizar Archivo */}
      <AnimatePresence>
        {activeModal === 'archive' && selectedExpediente && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => setActiveModal(null)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-theme-card border border-theme rounded-2xl w-full max-w-xl"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="p-6 border-b border-theme flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-emerald-500/10 rounded-xl">
                    <FolderArchive className="w-5 h-5 text-emerald-500" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-theme-primary">Organizar Documentos</h3>
                    <p className="text-sm text-theme-secondary">{selectedExpediente.id}</p>
                  </div>
                </div>
                <button 
                  onClick={() => setActiveModal(null)}
                  className="p-2 text-theme-secondary hover:text-theme-primary hover:bg-theme-tertiary rounded-lg transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              
              <div className="p-6 space-y-4">
                <div className="p-4 bg-theme-tertiary/50 rounded-xl">
                  <h4 className="text-sm font-medium text-theme-secondary mb-2">Estado actual del archivo</h4>
                  <div className="flex items-center gap-2">
                    <div className="flex-1 h-2 bg-theme-tertiary rounded-full overflow-hidden">
                      <div className="h-full bg-emerald-500 rounded-full" style={{ width: '60%' }} />
                    </div>
                    <span className="text-sm text-theme-secondary">60% organizado</span>
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-theme-secondary mb-2">Acciones de organización</label>
                  <div className="space-y-2">
                    {[
                      'Verificar documentos faltantes',
                      'Clasificar por tipo de documento',
                      'Numerar páginas',
                      'Crear índice',
                      'Preparar para archivado físico'
                    ].map((action, i) => (
                      <label key={action} className="flex items-center gap-3 p-3 bg-theme-tertiary/50 rounded-lg cursor-pointer hover:bg-theme-tertiary transition-colors">
                        <input type="checkbox" className="w-4 h-4 text-emerald-500 bg-theme-tertiary border-slate-600 rounded" defaultChecked={i < 2} />
                        <span className="text-sm text-theme-secondary">{action}</span>
                      </label>
                    ))}
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-theme-secondary mb-1">Ubicación física</label>
                  <input
                    type="text"
                    className="w-full px-4 py-2 bg-theme-tertiary border border-theme rounded-lg text-theme-primary focus:outline-none focus:border-emerald-500"
                    placeholder="Ej: Archivo 3, Estante B, Caja 12..."
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-theme-secondary mb-1">Notas</label>
                  <textarea
                    rows={2}
                    className="w-full px-4 py-2 bg-theme-tertiary border border-theme rounded-lg text-theme-primary focus:outline-none focus:border-emerald-500 resize-none"
                    placeholder="Notas sobre el estado del archivo..."
                  />
                </div>
              </div>
              
              <div className="p-6 border-t border-theme flex justify-end gap-3">
                <button
                  onClick={() => setActiveModal(null)}
                  className="px-4 py-2 text-theme-secondary hover:text-theme-primary transition-colors"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleOrganizeArchive}
                  className="px-6 py-2 bg-emerald-500 text-theme-primary font-medium rounded-lg hover:bg-emerald-400 transition-colors flex items-center gap-2"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  Guardar Cambios
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Modal: Comprimir Documentos V2 */}
      <CompressModalV2
        isOpen={activeModal === 'compress'}
        onClose={() => setActiveModal(null)}
        defaultFilename={selectedExpediente ? `${selectedExpediente.id}_Documentos` : 'Expediente_Documentos'}
        showHistory={true}
        historyItems={_compressionHistory}
      />

      {/* Modal: Firma Electrónica */}
      <SignatureModal
        isOpen={signatureModalOpen}
        onClose={() => setSignatureModalOpen(false)}
        mode={signatureMode}
        documentId={selectedDocument?.id || ''}
        documentName={selectedDocument?.name || ''}
        onComplete={(_result) => {
          if (signatureMode === 'request') {
            showToast(`Solicitud de firma enviada correctamente`, 'success');
          } else {
            showToast(`Documento firmado correctamente`, 'success');
          }
          setSignatureModalOpen(false);
        }}
      />

      {/* Click outside dropdown */}
      {openDropdownId && (
        <div 
          className="fixed inset-0 z-30" 
          onClick={() => setOpenDropdownId(null)}
        />
      )}
    </AppLayout>
  );
}

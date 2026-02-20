import { useState, useMemo, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Folder, ChevronRight, Grid3X3, List as ListIcon, Search, 
  FileText, Eye, Download, Share2, Trash2, X, Scan, FileSearch,
  BookOpen, Plus, Star, Lock, AlertCircle, CheckCircle, Upload,
  Edit3, Settings, Copy, Check, FileEdit, Send,
  Scale, FileSignature, Pen, Clock, ArrowUpDown, Filter,
  FileJson, FileImage, Archive, History, Link2,
  FileOutput, Briefcase, FolderOpen
} from 'lucide-react';
import { CompressButton } from '@/components/compression/CompressButton';
import { AppLayout } from '@/components/layout/AppLayout';
import { SignatureModal, useSignature } from '@/components/signature';
import { folderStructure, allFiles as initialFiles, getStatusConfig, getFileStats, generateForensicReport, availableExpedientes, type FileItem } from '@/data/bibliotecaData';
import { useRole } from '@/hooks/useRole';
import type { UserRole } from '@/types/roles';
import LegalLibrary from '@/components/legal-library/LegalLibrary';

// ============================================
// TIPOS
// ============================================

type ModalType = 'upload' | 'suggest' | 'organize' | 'share' | 'delete' | 'edit' | 'view' | 'sign' | 'request-signature' | 'history' | 'link-expediente' | null;

// ============================================
// CONFIGURACIÓN POR ROL
// ============================================

const getConfigPorRol = (role: UserRole) => {
  const configs: Record<UserRole, {
    title: string;
    subtitle: string;
    puedeSubir: boolean;
    puedeEliminar: boolean;
    puedeEditarMetadatos: boolean;
    puedeOrganizar: boolean;
    puedeCompartir: boolean;
    puedeSugerir: boolean;
    puedeMarcarFavoritos: boolean;
    puedeConfigurarPermisos: boolean;
    puedeOrganizarArchivo: boolean;
    puedeVerHistorial: boolean;
    puedeExportarInforme: boolean;
    puedeVincularExpediente: boolean;
    categoriasVisibles: string[];
    mensajeBienvenida: string;
    accionesDisponibles: string[];
  }> = {
    super_admin: {
      title: 'Biblioteca Forense',
      subtitle: 'Gestión completa del repositorio',
      puedeSubir: true,
      puedeEliminar: true,
      puedeEditarMetadatos: true,
      puedeOrganizar: true,
      puedeCompartir: true,
      puedeSugerir: true,
      puedeMarcarFavoritos: true,
      puedeConfigurarPermisos: true,
      puedeOrganizarArchivo: true,
      puedeVerHistorial: true,
      puedeExportarInforme: true,
      puedeVincularExpediente: true,
      categoriasVisibles: ['all', 'legislacion', 'jurisprudencia', 'doctrina', 'plantillas', 'contratos', 'formatos', 'forense'],
      mensajeBienvenida: 'Acceso total: puedes subir, organizar y gestionar todos los documentos',
      accionesDisponibles: ['ver', 'descargar', 'compartir', 'editar', 'eliminar', 'configurar']
    },
    socio: {
      title: 'Biblioteca Forense',
      subtitle: 'Repositorio completo del bufete',
      puedeSubir: true,
      puedeEliminar: true,
      puedeEditarMetadatos: true,
      puedeOrganizar: true,
      puedeCompartir: true,
      puedeSugerir: true,
      puedeMarcarFavoritos: true,
      puedeConfigurarPermisos: false,
      puedeOrganizarArchivo: false,
      puedeVerHistorial: true,
      puedeExportarInforme: true,
      puedeVincularExpediente: true,
      categoriasVisibles: ['all', 'legislacion', 'jurisprudencia', 'doctrina', 'plantillas', 'contratos', 'formatos', 'forense'],
      mensajeBienvenida: 'Gestión completa de documentos y categorías',
      accionesDisponibles: ['ver', 'descargar', 'compartir', 'editar', 'eliminar']
    },
    abogado_senior: {
      title: 'Biblioteca de Consulta',
      subtitle: 'Documentos y jurisprudencia',
      puedeSubir: false,
      puedeEliminar: false,
      puedeEditarMetadatos: false,
      puedeOrganizar: false,
      puedeCompartir: true,
      puedeSugerir: true,
      puedeMarcarFavoritos: true,
      puedeConfigurarPermisos: false,
      puedeOrganizarArchivo: false,
      puedeVerHistorial: true,
      puedeExportarInforme: true,
      puedeVincularExpediente: true,
      categoriasVisibles: ['all', 'legislacion', 'jurisprudencia', 'doctrina', 'plantillas', 'contratos', 'formatos'],
      mensajeBienvenida: 'Consulta, descarga y comparte documentos. Marca tus favoritos',
      accionesDisponibles: ['ver', 'descargar', 'compartir', 'favorito', 'sugerir']
    },
    abogado_junior: {
      title: 'Biblioteca de Consulta',
      subtitle: 'Recursos para tus casos',
      puedeSubir: false,
      puedeEliminar: false,
      puedeEditarMetadatos: false,
      puedeOrganizar: false,
      puedeCompartir: true,
      puedeSugerir: true,
      puedeMarcarFavoritos: true,
      puedeConfigurarPermisos: false,
      puedeOrganizarArchivo: false,
      puedeVerHistorial: true,
      puedeExportarInforme: false,
      puedeVincularExpediente: true,
      categoriasVisibles: ['all', 'legislacion', 'jurisprudencia', 'doctrina', 'plantillas', 'contratos', 'formatos'],
      mensajeBienvenida: 'Consulta documentos y plantillas para tus casos',
      accionesDisponibles: ['ver', 'descargar', 'compartir', 'favorito', 'sugerir']
    },
    paralegal: {
      title: 'Biblioteca de Formatos',
      subtitle: 'Plantillas y documentos de referencia',
      puedeSubir: false,
      puedeEliminar: false,
      puedeEditarMetadatos: false,
      puedeOrganizar: false,
      puedeCompartir: false,
      puedeSugerir: false,
      puedeMarcarFavoritos: false,
      puedeConfigurarPermisos: false,
      puedeOrganizarArchivo: false,
      puedeVerHistorial: false,
      puedeExportarInforme: false,
      puedeVincularExpediente: false,
      categoriasVisibles: ['all', 'plantillas', 'formatos', 'legislacion'],
      mensajeBienvenida: 'Acceso a formatos y plantillas para tu trabajo',
      accionesDisponibles: ['ver', 'descargar', 'usar']
    },
    secretario: {
      title: 'Biblioteca Documental',
      subtitle: 'Formatos y organización de archivo',
      puedeSubir: false,
      puedeEliminar: false,
      puedeEditarMetadatos: false,
      puedeOrganizar: false,
      puedeCompartir: false,
      puedeSugerir: false,
      puedeMarcarFavoritos: false,
      puedeConfigurarPermisos: false,
      puedeOrganizarArchivo: true,
      puedeVerHistorial: false,
      puedeExportarInforme: false,
      puedeVincularExpediente: false,
      categoriasVisibles: ['all', 'plantillas', 'formatos', 'legislacion'],
      mensajeBienvenida: 'Consulta formatos y colabora en la organización del archivo',
      accionesDisponibles: ['ver', 'descargar', 'organizar']
    },
    administrador: {
      title: 'Biblioteca Administrativa',
      subtitle: 'Documentos de gestión',
      puedeSubir: false,
      puedeEliminar: false,
      puedeEditarMetadatos: false,
      puedeOrganizar: false,
      puedeCompartir: true,
      puedeSugerir: false,
      puedeMarcarFavoritos: false,
      puedeConfigurarPermisos: false,
      puedeOrganizarArchivo: false,
      puedeVerHistorial: false,
      puedeExportarInforme: false,
      puedeVincularExpediente: false,
      categoriasVisibles: ['all', 'contratos', 'plantillas', 'legislacion'],
      mensajeBienvenida: 'Acceso a documentos administrativos y contratos tipo',
      accionesDisponibles: ['ver', 'descargar', 'compartir']
    },
    contador: {
      title: 'Biblioteca Administrativa',
      subtitle: 'Documentos fiscales y contratos',
      puedeSubir: false,
      puedeEliminar: false,
      puedeEditarMetadatos: false,
      puedeOrganizar: false,
      puedeCompartir: true,
      puedeSugerir: false,
      puedeMarcarFavoritos: false,
      puedeConfigurarPermisos: false,
      puedeOrganizarArchivo: false,
      puedeVerHistorial: false,
      puedeExportarInforme: false,
      puedeVincularExpediente: false,
      categoriasVisibles: ['all', 'contratos', 'plantillas'],
      mensajeBienvenida: 'Acceso a plantillas de contratos y documentos administrativos',
      accionesDisponibles: ['ver', 'descargar', 'compartir']
    },
    recepcionista: {
      title: 'Sin Acceso',
      subtitle: 'No tienes permisos para esta sección',
      puedeSubir: false,
      puedeEliminar: false,
      puedeEditarMetadatos: false,
      puedeOrganizar: false,
      puedeCompartir: false,
      puedeSugerir: false,
      puedeMarcarFavoritos: false,
      puedeConfigurarPermisos: false,
      puedeOrganizarArchivo: false,
      puedeVerHistorial: false,
      puedeExportarInforme: false,
      puedeVincularExpediente: false,
      categoriasVisibles: [],
      mensajeBienvenida: 'Contacta al administrador si necesitas acceso a documentos',
      accionesDisponibles: []
    }
  };
  
  return configs[role] || configs.abogado_junior;
};

// Componente para acceso denegado
const AccesoDenegado = () => (
  <div className="flex flex-col items-center justify-center min-h-[60vh] p-8">
    <div className="w-24 h-24 bg-theme-tertiary rounded-full flex items-center justify-center mb-6">
      <Lock className="w-12 h-12 text-theme-muted" />
    </div>
    <h2 className="text-2xl font-bold text-theme-primary mb-2">Acceso Restringido</h2>
    <p className="text-theme-secondary text-center max-w-md">
      Tu rol no tiene permisos para acceder a la biblioteca. 
      Si necesitas consultar documentos, contacta a tu supervisor.
    </p>
  </div>
);

type LibraryTab = 'interna' | 'oficial';

export default function Biblioteca() {
  const { role, roleConfig } = useRole();
  const signature = useSignature(role, 'usuario@bufete.com');
  const [activeTab, setActiveTab] = useState<LibraryTab>('interna');
  const [selectedFolder, setSelectedFolder] = useState<string | null>(null);
  const [selectedSubfolder, setSelectedSubfolder] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [selectedFile, setSelectedFile] = useState<FileItem | null>(null);
  const [favoritos, setFavoritos] = useState<number[]>([]);
  const [allFiles, setAllFiles] = useState<FileItem[]>(initialFiles);
  const [activeModal, setActiveModal] = useState<ModalType>(null);
  const [toast, setToast] = useState<{message: string; type: 'success' | 'info' | 'error'} | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // Estados para nuevas funcionalidades
  const [recentFiles, setRecentFiles] = useState<number[]>([]);
  const [dateFilter, setDateFilter] = useState<'all' | 'today' | 'week' | 'month'>('all');
  const [sizeFilter, setSizeFilter] = useState<'all' | 'small' | 'medium' | 'large'>('all');
  const [sortBy, setSortBy] = useState<'name' | 'date' | 'size'>('date');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [showFilters, setShowFilters] = useState(false);
  const [hoveredFile, setHoveredFile] = useState<number | null>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  // Estados para vinculación con expedientes
  const [selectedExpediente, setSelectedExpediente] = useState<string>('');
  const [searchExpediente, setSearchExpediente] = useState('');

  // Form states
  const [uploadForm, setUploadForm] = useState({
    name: '',
    category: 'legislacion',
    tags: '',
    file: null as File | null
  });
  
  const [suggestForm, setSuggestForm] = useState({
    title: '',
    description: '',
    category: 'legislacion'
  });
  
  const [editForm, setEditForm] = useState({
    name: '',
    tags: '',
    notes: ''
  });

  const [shareEmail, setShareEmail] = useState('');
  const [copiedLink, setCopiedLink] = useState(false);
  
  // Estado para firma electrónica
  const [signatureModalOpen, setSignatureModalOpen] = useState(false);
  const [signatureMode, setSignatureMode] = useState<'sign' | 'request'>('request');

  const showToast = (message: string, type: 'success' | 'info' | 'error' = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.ctrlKey && e.key === 'f') {
        e.preventDefault();
        searchInputRef.current?.focus();
      }
      if (e.key === 'Escape') {
        if (activeModal) {
          setActiveModal(null);
        } else if (selectedFile) {
          setSelectedFile(null);
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [activeModal, selectedFile]);

  // Track recently viewed files
  const addToRecent = (fileId: number) => {
    setRecentFiles(prev => {
      const filtered = prev.filter(id => id !== fileId);
      return [fileId, ...filtered].slice(0, 5);
    });
  };

  // Obtener iconos por tipo de archivo
  const getFileIcon = (fileName: string) => {
    const ext = fileName.split('.').pop()?.toLowerCase();
    switch (ext) {
      case 'pdf': return <FileText className="w-6 h-6" />;
      case 'doc':
      case 'docx': return <FileEdit className="w-6 h-6" />;
      case 'xls':
      case 'xlsx': return <FileJson className="w-6 h-6" />;
      case 'jpg':
      case 'png':
      case 'gif': return <FileImage className="w-6 h-6" />;
      case 'mp3':
      case 'wav': return <FileText className="w-6 h-6" />;
      case 'zip':
      case 'rar': return <Archive className="w-6 h-6" />;
      default: return <FileText className="w-6 h-6" />;
    }
  };

  // Obtener configuración según el rol
  const config = useMemo(() => getConfigPorRol(role), [role]);

  // Filtrar archivos según búsqueda, carpetas y filtros avanzados
  const filteredFiles = useMemo(() => {
    let files = allFiles;
    
    // Filtrar por categorías visibles del rol
    if (!config.categoriasVisibles.includes('forense')) {
      files = files.filter(f => f.category !== 'forense');
    }
    
    // Aplicar filtros
    const filtered = files.filter(file => {
      const matchesSearch = file.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                           file.notes.toLowerCase().includes(searchQuery.toLowerCase()) ||
                           file.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()));
      const matchesFolder = !selectedFolder || file.category === selectedFolder;
      const matchesSubfolder = !selectedSubfolder || file.subcategory === selectedSubfolder;
      
      // Filtro por fecha
      let matchesDate = true;
      if (dateFilter !== 'all') {
        const fileDate = new Date(file.modified);
        const today = new Date();
        if (dateFilter === 'today') {
          matchesDate = fileDate.toDateString() === today.toDateString();
        } else if (dateFilter === 'week') {
          const weekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
          matchesDate = fileDate >= weekAgo;
        } else if (dateFilter === 'month') {
          const monthAgo = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000);
          matchesDate = fileDate >= monthAgo;
        }
      }
      
      // Filtro por tamaño
      let matchesSize = true;
      if (sizeFilter !== 'all') {
        const sizeMB = parseFloat(file.size);
        if (sizeFilter === 'small') matchesSize = sizeMB < 1;
        else if (sizeFilter === 'medium') matchesSize = sizeMB >= 1 && sizeMB < 10;
        else if (sizeFilter === 'large') matchesSize = sizeMB >= 10;
      }
      
      return matchesSearch && matchesFolder && matchesSubfolder && matchesDate && matchesSize;
    });
    
    // Ordenar
    filtered.sort((a, b) => {
      let comparison = 0;
      if (sortBy === 'name') comparison = a.name.localeCompare(b.name);
      else if (sortBy === 'date') comparison = new Date(b.modified).getTime() - new Date(a.modified).getTime();
      else if (sortBy === 'size') comparison = parseFloat(b.size) - parseFloat(a.size);
      return sortOrder === 'asc' ? comparison : -comparison;
    });
    
    return filtered;
  }, [allFiles, searchQuery, selectedFolder, selectedSubfolder, config.categoriasVisibles, dateFilter, sizeFilter, sortBy, sortOrder]);

  // Handlers
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setUploadForm({ ...uploadForm, file, name: file.name });
    }
  };

  const handleUpload = () => {
    if (!uploadForm.name || !uploadForm.file) {
      showToast('Por favor selecciona un archivo', 'error');
      return;
    }
    
    const newFile: FileItem = {
      id: Date.now(),
      name: uploadForm.name,
      type: uploadForm.file.name.split('.').pop()?.toLowerCase() || 'pdf',
      category: uploadForm.category,
      subcategory: 'general',
      size: `${(uploadForm.file.size / (1024 * 1024)).toFixed(1)} MB`,
      modified: new Date().toLocaleDateString('es-ES'),
      status: 'verified',
      confidence: 95,
      author: 'Usuario Actual',
      tags: uploadForm.tags.split(',').map(t => t.trim()).filter(Boolean),
      notes: 'Documento subido recientemente',
      verificationHistory: [
        {
          id: `vh-${Date.now()}`,
          date: new Date().toLocaleDateString('es-ES'),
          user: 'Usuario Actual',
          action: 'upload',
          notes: 'Documento cargado al sistema'
        }
      ],
      linkedExpedientes: []
    };
    
    setAllFiles([newFile, ...allFiles]);
    setUploadForm({ name: '', category: 'legislacion', tags: '', file: null });
    setActiveModal(null);
    showToast('Documento subido correctamente');
  };

  const handleSuggest = () => {
    if (!suggestForm.title) {
      showToast('Por favor ingresa el título del documento', 'error');
      return;
    }
    showToast('Sugerencia enviada para revisión', 'success');
    setSuggestForm({ title: '', description: '', category: 'legislacion' });
    setActiveModal(null);
  };

  const handleDelete = () => {
    if (!selectedFile) return;
    if (confirm(`¿Estás seguro de eliminar "${selectedFile.name}"?`)) {
      setAllFiles(allFiles.filter(f => f.id !== selectedFile.id));
      setSelectedFile(null);
      setActiveModal(null);
      showToast('Documento eliminado correctamente');
    }
  };

  const handleDownload = (file: FileItem) => {
    showToast(`Descargando ${file.name}...`, 'info');
    setTimeout(() => {
      showToast('Descarga completada');
    }, 1500);
  };

  const handleShare = () => {
    if (!shareEmail && !copiedLink) {
      showToast('Por favor ingresa un email o copia el enlace', 'error');
      return;
    }
    showToast(copiedLink ? 'Enlace copiado al portapapeles' : 'Documento compartido correctamente');
    setShareEmail('');
    setCopiedLink(false);
    setActiveModal(null);
  };

  const handleCopyLink = () => {
    setCopiedLink(true);
    navigator.clipboard.writeText(`https://bufete.com/docs/${selectedFile?.id}`);
    showToast('Enlace copiado al portapapeles');
  };

  const handleEdit = () => {
    if (!selectedFile) return;
    
    setAllFiles(allFiles.map(f => 
      f.id === selectedFile.id 
        ? { ...f, name: editForm.name || f.name, tags: editForm.tags.split(',').map(t => t.trim()).filter(Boolean) || f.tags, notes: editForm.notes || f.notes }
        : f
    ));
    
    setSelectedFile({ ...selectedFile, name: editForm.name || selectedFile.name, tags: editForm.tags.split(',').map(t => t.trim()).filter(Boolean) || selectedFile.tags, notes: editForm.notes || selectedFile.notes });
    setActiveModal(null);
    showToast('Documento actualizado correctamente');
  };

  const handleOrganize = () => {
    showToast('Archivo organizado correctamente', 'success');
    setActiveModal(null);
  };

  const openEditModal = () => {
    if (selectedFile) {
      setEditForm({
        name: selectedFile.name,
        tags: selectedFile.tags.join(', '),
        notes: selectedFile.notes
      });
      setActiveModal('edit');
    }
  };

  // ============================================
  // NUEVAS FUNCIONALIDADES FORENSES
  // ============================================

  // Exportar informe pericial PDF
  const handleExportForensicReport = (file: FileItem) => {
    const reportHTML = generateForensicReport(file);
    
    // Crear ventana de impresión
    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(reportHTML);
      printWindow.document.close();
      
      // Esperar a que cargue y luego imprimir/guardar como PDF
      printWindow.onload = () => {
        setTimeout(() => {
          printWindow.print();
        }, 500);
      };
      
      showToast('Informe pericial generado. Usa "Guardar como PDF" en el diálogo de impresión.', 'success');
    } else {
      // Fallback: descargar HTML
      const blob = new Blob([reportHTML], { type: 'text/html;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `Informe_Pericial_${file.name.replace(/\.[^/.]+$/, '')}.html`;
      link.click();
      URL.revokeObjectURL(url);
      showToast('Informe descargado como HTML', 'info');
    }
    
    // Registrar en historial
    const newHistoryEntry = {
      id: `vh-${Date.now()}`,
      date: new Date().toLocaleDateString('es-ES'),
      user: 'Usuario Actual',
      action: 'export' as const,
      notes: 'Informe pericial exportado en PDF'
    };
    
    setAllFiles(allFiles.map(f => 
      f.id === file.id 
        ? { ...f, verificationHistory: [newHistoryEntry, ...f.verificationHistory] }
        : f
    ));
    
    if (selectedFile?.id === file.id) {
      setSelectedFile({ ...file, verificationHistory: [newHistoryEntry, ...file.verificationHistory] });
    }
  };

  // Vincular con expediente
  const handleLinkExpediente = () => {
    if (!selectedFile || !selectedExpediente) {
      showToast('Por favor selecciona un expediente', 'error');
      return;
    }
    
    const expediente = availableExpedientes.find(e => e.id === selectedExpediente);
    if (!expediente) return;
    
    const newLink = {
      id: expediente.id,
      title: expediente.title,
      date: new Date().toLocaleDateString('es-ES')
    };
    
    const newHistoryEntry = {
      id: `vh-${Date.now()}`,
      date: new Date().toLocaleDateString('es-ES'),
      user: 'Usuario Actual',
      action: 'attach' as const,
      notes: `Documento vinculado a expediente ${expediente.id}`,
      expedienteId: expediente.id,
      expedienteTitle: expediente.title
    };
    
    const updatedFile = {
      ...selectedFile,
      linkedExpedientes: [...(selectedFile.linkedExpedientes || []), newLink],
      verificationHistory: [newHistoryEntry, ...selectedFile.verificationHistory]
    };
    
    setAllFiles(allFiles.map(f => f.id === selectedFile.id ? updatedFile : f));
    setSelectedFile(updatedFile);
    setSelectedExpediente('');
    setSearchExpediente('');
    setActiveModal(null);
    showToast(`Documento vinculado a ${expediente.id}`, 'success');
  };

  // Filtrar expedientes disponibles
  const filteredExpedientes = useMemo(() => {
    return availableExpedientes.filter(exp => 
      exp.id.toLowerCase().includes(searchExpediente.toLowerCase()) ||
      exp.title.toLowerCase().includes(searchExpediente.toLowerCase()) ||
      exp.client.toLowerCase().includes(searchExpediente.toLowerCase())
    );
  }, [searchExpediente]);

  // Estadísticas ajustadas según el rol
  const stats = useMemo(() => {
    const baseStats = getFileStats();
    if (!config.categoriasVisibles.includes('forense')) {
      // Ajustar estadísticas si no ve documentos forenses
      return {
        ...baseStats,
        total: filteredFiles.length,
        verified: Math.floor(baseStats.verified * 0.7),
        fake: Math.floor(baseStats.fake * 0.3),
        doubt: Math.floor(baseStats.doubt * 0.5)
      };
    }
    return baseStats;
  }, [config.categoriasVisibles, filteredFiles.length]);

  // Si es recepcionista, mostrar acceso denegado
  if (role === 'recepcionista') {
    return (
      <AppLayout title={config.title} subtitle={config.subtitle}>
        <AccesoDenegado />
      </AppLayout>
    );
  }

  const toggleFavorito = (fileId: number) => {
    setFavoritos(prev => 
      prev.includes(fileId) 
        ? prev.filter(id => id !== fileId)
        : [...prev, fileId]
    );
    addToRecent(fileId);
  };

  const handleFileClick = (file: FileItem) => {
    setSelectedFile(file);
    addToRecent(file.id);
  };

  // Filtrar carpetas según categorías visibles
  const visibleFolders = folderStructure.filter(folder => 
    config.categoriasVisibles.includes('all') || 
    config.categoriasVisibles.includes(folder.id)
  );

  const headerActions = (
    <>
      {config.puedeSubir && (
        <button 
          onClick={() => setActiveModal('upload')}
          className="flex items-center gap-2 px-4 py-2 bg-amber-500 text-slate-950 font-medium rounded-xl hover:bg-amber-400 transition-colors"
        >
          <Plus className="w-4 h-4" />
          <span className="hidden lg:inline">Subir Documento</span>
        </button>
      )}
      {config.puedeSugerir && (
        <button 
          onClick={() => setActiveModal('suggest')}
          className="flex items-center gap-2 px-4 py-2 bg-theme-tertiary text-theme-primary font-medium rounded-xl hover:bg-theme-secondary transition-colors"
        >
          <Scan className="w-4 h-4" />
          <span className="hidden lg:inline">Sugerir Documento</span>
        </button>
      )}
      {config.puedeOrganizarArchivo && (
        <button 
          onClick={() => setActiveModal('organize')}
          className="p-2 text-theme-secondary hover:text-theme-primary hover:bg-theme-tertiary rounded-lg transition-colors" 
          title="Organizar archivo"
        >
          <Folder className="w-5 h-5" />
        </button>
      )}
    </>
  );

  // Si estamos en la pestaña de Biblioteca Legal, renderizar el componente LegalLibrary
  if (activeTab === 'oficial') {
    return (
      <AppLayout 
        title="Biblioteca"
        subtitle="Gestión documental y legislación oficial"
      >
        {/* Tabs de navegación */}
        <div className="px-4 pt-4">
          <div className="flex gap-2 p-1 bg-theme-secondary border border-theme rounded-xl w-fit">
            <button
              onClick={() => setActiveTab('interna')}
              className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium text-theme-tertiary hover:text-theme-primary hover:bg-theme-tertiary transition-all"
            >
              <BookOpen className="w-4 h-4" />
              Biblioteca Interna
            </button>
            <button
              onClick={() => setActiveTab('oficial')}
              className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium bg-accent text-slate-950 transition-all"
            >
              <Scale className="w-4 h-4" />
              Legislación Oficial
            </button>
          </div>
        </div>
        <LegalLibrary />
      </AppLayout>
    );
  }

  return (
    <AppLayout 
      title={config.title}
      subtitle={config.subtitle}
      headerActions={headerActions}
    >
      {/* Tabs de navegación */}
      {(
        <div className="px-4 pt-4">
          <div className="flex gap-2 p-1 bg-theme-secondary border border-theme rounded-xl w-fit">
            <button
              onClick={() => setActiveTab('interna')}
              className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium bg-accent text-slate-950 transition-all"
            >
              <BookOpen className="w-4 h-4" />
              Biblioteca Interna
            </button>
            <button
              onClick={() => setActiveTab('oficial')}
              className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium text-theme-tertiary hover:text-theme-primary hover:bg-theme-tertiary transition-all"
            >
              <Scale className="w-4 h-4" />
              Legislación Oficial
            </button>
          </div>
        </div>
      )}

      {/* Mensaje de bienvenida según rol */}
      <div className={`mx-4 mb-2 p-3 rounded-xl border ${roleConfig.bgColor} ${roleConfig.textColor.replace('text-', 'border-').replace('400', '500/20')}`}>
        <div className="flex items-center gap-2">
          <div className={`p-1.5 rounded-lg bg-theme-secondary/50`}>
            <BookOpen className={`w-4 h-4 ${roleConfig.textColor}`} />
          </div>
          <p className={`text-sm ${roleConfig.textColor}`}>{config.mensajeBienvenida}</p>
        </div>
      </div>

      <div className="flex-1 flex overflow-hidden">
        {/* Sidebar de Carpetas */}
        <div className="w-72 bg-theme-secondary/60 border-r border-theme overflow-y-auto">
          {/* Accesos Rápidos */}
          <div className="p-3 border-b border-theme">
            <p className="text-[10px] font-semibold text-theme-muted uppercase tracking-wider mb-2 px-1">Accesos Rápidos</p>
            <div className="space-y-1">
              {config.puedeMarcarFavoritos && favoritos.length > 0 && (
                <button
                  onClick={() => { setSelectedFolder('favorites'); setSelectedSubfolder(null); }}
                  className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-all ${
                    selectedFolder === 'favorites' ? 'bg-amber-500/20 text-amber-500' : 'text-theme-secondary hover:bg-theme-tertiary hover:text-amber-400'
                  }`}
                >
                  <Star className="w-5 h-5" />
                  <span className="text-sm font-medium">Favoritos</span>
                  <span className="ml-auto text-xs bg-amber-500/20 text-amber-500 px-2 py-0.5 rounded-full">{favoritos.length}</span>
                </button>
              )}
              {recentFiles.length > 0 && (
                <button
                  onClick={() => { setSelectedFolder('recent'); setSelectedSubfolder(null); }}
                  className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-all ${
                    selectedFolder === 'recent' ? 'bg-blue-500/20 text-blue-500' : 'text-theme-secondary hover:bg-theme-tertiary hover:text-blue-400'
                  }`}
                >
                  <Clock className="w-5 h-5" />
                  <span className="text-sm font-medium">Recientes</span>
                  <span className="ml-auto text-xs bg-blue-500/20 text-blue-500 px-2 py-0.5 rounded-full">{recentFiles.length}</span>
                </button>
              )}
              <button
                onClick={() => { setSelectedFolder(null); setSelectedSubfolder(null); }}
                className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-all ${
                  !selectedFolder ? 'bg-amber-500/20 text-amber-500' : 'text-theme-secondary hover:bg-theme-tertiary hover:text-theme-primary'
                }`}
              >
                <Folder className="w-5 h-5" />
                <span className="text-sm font-medium">Todos</span>
                <span className="ml-auto text-xs text-theme-muted">{stats.total}</span>
              </button>
            </div>
          </div>

          {/* Estadísticas - solo si tiene acceso a forense */}
          {config.categoriasVisibles.includes('forense') && (
            <div className="p-3 border-b border-theme">
              <div className="grid grid-cols-3 gap-2">
                <div className="text-center p-2 bg-emerald-500/10 rounded-lg border border-emerald-500/20">
                  <p className="text-xl font-bold text-emerald-400">{stats.verified}</p>
                  <p className="text-[10px] text-emerald-500/70 uppercase">Verif.</p>
                </div>
                <div className="text-center p-2 bg-red-500/10 rounded-lg border border-red-500/20">
                  <p className="text-xl font-bold text-red-400">{stats.fake}</p>
                  <p className="text-[10px] text-red-500/70 uppercase">Falsos</p>
                </div>
                <div className="text-center p-2 bg-amber-500/10 rounded-lg border border-amber-500/20">
                  <p className="text-xl font-bold text-amber-400">{stats.doubt}</p>
                  <p className="text-[10px] text-amber-500/70 uppercase">Dudas</p>
                </div>
              </div>
            </div>
          )}

          {/* Categorías */}
          <div className="p-2">
            <p className="text-[10px] font-semibold text-theme-muted uppercase tracking-wider mb-2 px-1">Categorías</p>
            <div className="space-y-1">
              {visibleFolders.map((folder) => (
                <div key={folder.id}>
                  <button
                    onClick={() => setSelectedFolder(selectedFolder === folder.id ? null : folder.id)}
                    className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-all hover:scale-[1.02] ${
                      selectedFolder === folder.id ? 'bg-gradient-to-r from-theme-tertiary to-theme-secondary text-theme-primary' : 'text-theme-secondary hover:bg-theme-tertiary hover:text-theme-primary'
                    }`}
                  >
                    <folder.icon className={`w-5 h-5 ${
                      folder.color === 'blue' ? 'text-blue-500' :
                      folder.color === 'purple' ? 'text-purple-500' :
                      folder.color === 'cyan' ? 'text-cyan-500' :
                      folder.color === 'amber' ? 'text-amber-500' :
                      folder.color === 'rose' ? 'text-rose-500' :
                      'text-emerald-500'
                    }`} />
                    <span className="text-sm font-medium flex-1 text-left">{folder.name}</span>
                    <span className="text-xs bg-theme-tertiary text-theme-muted px-2 py-0.5 rounded-full">
                      {allFiles.filter(f => f.category === folder.id).length}
                    </span>
                    <ChevronRight className={`w-4 h-4 transition-transform ${selectedFolder === folder.id ? 'rotate-90' : ''}`} />
                  </button>

                  <AnimatePresence>
                    {selectedFolder === folder.id && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="overflow-hidden"
                      >
                        <div className="pl-6 pr-2 py-1 space-y-1">
                          {folder.subfolders.map((sub) => (
                            <button
                              key={sub.id}
                              onClick={() => setSelectedSubfolder(selectedSubfolder === sub.id ? null : sub.id)}
                              className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-all hover:translate-x-1 ${
                                selectedSubfolder === sub.id 
                                  ? `${sub.color === 'emerald' ? 'bg-emerald-500/20 text-emerald-400' : sub.color === 'red' ? 'bg-red-500/20 text-red-400' : 'bg-amber-500/20 text-amber-400'}`
                                  : 'text-theme-muted hover:bg-theme-tertiary hover:text-theme-primary'
                              }`}
                            >
                              <div className={`w-2 h-2 rounded-full ${
                                sub.color === 'emerald' ? 'bg-emerald-500' : sub.color === 'red' ? 'bg-red-500' : 'bg-amber-500'
                              }`} />
                              <span className="flex-1 text-left">{sub.name}</span>
                              <span className="text-xs opacity-70">{sub.count}</span>
                            </button>
                          ))}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Main Area */}
        <div className="flex-1 flex flex-col min-w-0">
          {/* Toolbar */}
          <div className="min-h-[64px] border-b border-theme flex items-center justify-between px-6 py-3">
            <div className="flex items-center gap-4">
              {/* Breadcrumb */}
              <div className="flex items-center gap-2 text-sm">
                <button onClick={() => { setSelectedFolder(null); setSelectedSubfolder(null); }} className="text-theme-muted hover:text-amber-500 transition-colors">
                  <Folder className="w-4 h-4" />
                </button>
                {selectedFolder && selectedFolder !== 'favorites' && selectedFolder !== 'recent' && (
                  <>
                    <ChevronRight className="w-4 h-4 text-theme-muted" />
                    <span className="text-theme-primary font-medium">
                      {folderStructure.find(f => f.id === selectedFolder)?.name}
                    </span>
                  </>
                )}
                {selectedSubfolder && (
                  <>
                    <ChevronRight className="w-4 h-4 text-theme-muted" />
                    <span className="text-amber-500 font-medium">
                      {folderStructure.find(f => f.id === selectedFolder)?.subfolders.find(s => s.id === selectedSubfolder)?.name}
                    </span>
                  </>
                )}
                {selectedFolder === 'favorites' && (
                  <>
                    <ChevronRight className="w-4 h-4 text-theme-muted" />
                    <span className="text-amber-500 font-medium flex items-center gap-1">
                      <Star className="w-4 h-4 fill-current" /> Favoritos
                    </span>
                  </>
                )}
                {selectedFolder === 'recent' && (
                  <>
                    <ChevronRight className="w-4 h-4 text-theme-muted" />
                    <span className="text-blue-500 font-medium flex items-center gap-1">
                      <Clock className="w-4 h-4" /> Recientes
                    </span>
                  </>
                )}
              </div>
              <span className="px-2 py-1 bg-amber-500/10 text-amber-500 text-xs font-medium rounded-full border border-amber-500/20">
                {filteredFiles.length} archivos
              </span>
            </div>

            <div className="flex items-center gap-3">
              {/* Filtros rápidos */}
              <div className="flex items-center gap-1 bg-theme-secondary border border-theme rounded-lg p-1">
                <button
                  onClick={() => setDateFilter('all')}
                  className={`px-3 py-1.5 text-xs rounded-md transition-all ${dateFilter === 'all' ? 'bg-theme-tertiary text-theme-primary' : 'text-theme-muted hover:text-theme-primary'}`}
                >
                  Todo
                </button>
                <button
                  onClick={() => setDateFilter('today')}
                  className={`px-3 py-1.5 text-xs rounded-md transition-all ${dateFilter === 'today' ? 'bg-theme-tertiary text-theme-primary' : 'text-theme-muted hover:text-theme-primary'}`}
                >
                  Hoy
                </button>
                <button
                  onClick={() => setDateFilter('week')}
                  className={`px-3 py-1.5 text-xs rounded-md transition-all ${dateFilter === 'week' ? 'bg-theme-tertiary text-theme-primary' : 'text-theme-muted hover:text-theme-primary'}`}
                >
                  Semana
                </button>
                <button
                  onClick={() => setDateFilter('month')}
                  className={`px-3 py-1.5 text-xs rounded-md transition-all ${dateFilter === 'month' ? 'bg-theme-tertiary text-theme-primary' : 'text-theme-muted hover:text-theme-primary'}`}
                >
                  Mes
                </button>
              </div>

              {/* Ordenar */}
              <div className="relative group">
                <button className="flex items-center gap-2 px-3 py-2 bg-theme-secondary border border-theme rounded-lg text-sm text-theme-secondary hover:text-theme-primary transition-colors">
                  <ArrowUpDown className="w-4 h-4" />
                  <span className="hidden sm:inline">Ordenar</span>
                </button>
                <div className="absolute right-0 top-full mt-2 w-48 bg-theme-secondary border border-theme rounded-xl shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-20">
                  <div className="p-2">
                    <p className="text-[10px] text-theme-muted uppercase px-2 py-1">Ordenar por</p>
                    <button onClick={() => { setSortBy('name'); setSortOrder('asc'); }} className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm ${sortBy === 'name' ? 'bg-amber-500/20 text-amber-500' : 'text-theme-secondary hover:bg-theme-tertiary'}`}>
                      <span className={sortBy === 'name' ? 'opacity-100' : 'opacity-0'}>✓</span> Nombre
                    </button>
                    <button onClick={() => { setSortBy('date'); setSortOrder('desc'); }} className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm ${sortBy === 'date' ? 'bg-amber-500/20 text-amber-500' : 'text-theme-secondary hover:bg-theme-tertiary'}`}>
                      <span className={sortBy === 'date' ? 'opacity-100' : 'opacity-0'}>✓</span> Fecha
                    </button>
                    <button onClick={() => { setSortBy('size'); setSortOrder('desc'); }} className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm ${sortBy === 'size' ? 'bg-amber-500/20 text-amber-500' : 'text-theme-secondary hover:bg-theme-tertiary'}`}>
                      <span className={sortBy === 'size' ? 'opacity-100' : 'opacity-0'}>✓</span> Tamaño
                    </button>
                  </div>
                </div>
              </div>

              {/* Botón de filtros avanzados */}
              <button 
                onClick={() => setShowFilters(!showFilters)}
                className={`p-2 rounded-lg border transition-all ${showFilters ? 'bg-amber-500/20 border-amber-500/50 text-amber-500' : 'bg-theme-secondary border-theme text-theme-secondary hover:text-theme-primary'}`}
              >
                <Filter className="w-4 h-4" />
              </button>

              {/* Botón de compresión */}
              <CompressButton
                files={[]}
                defaultFilename={`Biblioteca_${new Date().toISOString().split('T')[0]}`}
                variant="secondary"
                label="📦"
                showCount={false}
              />
              
              {/* Búsqueda mejorada */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-theme-muted" />
                <input
                  ref={searchInputRef}
                  type="text"
                  placeholder="Buscar... (Ctrl+F)"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-56 pl-9 pr-10 py-2 bg-theme-secondary border border-theme rounded-xl text-theme-primary text-sm placeholder-theme-muted focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500/30 transition-all"
                />
                {searchQuery && (
                  <button 
                    onClick={() => setSearchQuery('')}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-theme-muted hover:text-theme-primary"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>
              
              {/* View Mode */}
              <div className="flex p-1 bg-theme-secondary border border-theme rounded-lg">
                <button onClick={() => setViewMode('grid')} className={`p-2 rounded-md transition-all ${viewMode === 'grid' ? 'bg-theme-tertiary text-amber-500' : 'text-theme-secondary hover:text-theme-primary'}`}>
                  <Grid3X3 className="w-4 h-4" />
                </button>
                <button onClick={() => setViewMode('list')} className={`p-2 rounded-md transition-all ${viewMode === 'list' ? 'bg-theme-tertiary text-amber-500' : 'text-theme-secondary hover:text-theme-primary'}`}>
                  <ListIcon className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>

          {/* Panel de filtros avanzados */}
          <AnimatePresence>
            {showFilters && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="border-b border-theme bg-theme-secondary/30 overflow-hidden"
              >
                <div className="px-6 py-4 flex items-center gap-6 flex-wrap">
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-theme-muted">Tamaño:</span>
                    <div className="flex gap-1">
                      {(['all', 'small', 'medium', 'large'] as const).map((size) => (
                        <button
                          key={size}
                          onClick={() => setSizeFilter(size)}
                          className={`px-3 py-1.5 text-xs rounded-lg border transition-all ${
                            sizeFilter === size 
                              ? 'bg-amber-500/20 border-amber-500/50 text-amber-500' 
                              : 'bg-theme-tertiary border-theme text-theme-secondary hover:text-theme-primary'
                          }`}
                        >
                          {size === 'all' ? 'Todos' : size === 'small' ? '<1MB' : size === 'medium' ? '1-10MB' : '>10MB'}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-theme-muted">Estado:</span>
                    <div className="flex gap-1">
                      <button className="px-3 py-1.5 text-xs rounded-lg border bg-emerald-500/10 border-emerald-500/30 text-emerald-400">
                        Verificados
                      </button>
                      <button className="px-3 py-1.5 text-xs rounded-lg border bg-red-500/10 border-red-500/30 text-red-400">
                        Falsos
                      </button>
                      <button className="px-3 py-1.5 text-xs rounded-lg border bg-amber-500/10 border-amber-500/30 text-amber-400">
                        Dudosos
                      </button>
                    </div>
                  </div>
                  {(dateFilter !== 'all' || sizeFilter !== 'all' || searchQuery) && (
                    <button 
                      onClick={() => { setDateFilter('all'); setSizeFilter('all'); setSearchQuery(''); }}
                      className="ml-auto flex items-center gap-1 text-xs text-theme-muted hover:text-red-400 transition-colors"
                    >
                      <X className="w-3 h-3" /> Limpiar filtros
                    </button>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Files */}
          <div className="flex-1 overflow-y-auto p-6">
            {viewMode === 'grid' ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {filteredFiles.map((file, index) => {
                  const statusConfig = getStatusConfig(file.status);
                  const isFavorito = favoritos.includes(file.id);
                  const isHovered = hoveredFile === file.id;
                  const hasExpedientes = file.linkedExpedientes && file.linkedExpedientes.length > 0;
                  return (
                      <motion.div
                      key={file.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.03 }}
                      onMouseEnter={() => setHoveredFile(file.id)}
                      onMouseLeave={() => setHoveredFile(null)}
                      onClick={() => handleFileClick(file)}
                      className={`group relative p-4 bg-gradient-to-br from-theme-secondary/80 to-theme-secondary/40 border rounded-2xl cursor-pointer transition-all duration-300 hover:scale-[1.02] hover:shadow-lg hover:shadow-amber-500/10 ${
                        selectedFile?.id === file.id ? 'border-amber-500 ring-2 ring-amber-500/30' : 'border-theme hover:border-amber-500/50'
                      }`}
                    >
                      {/* Gradiente de fondo en hover */}
                      <div className={`absolute inset-0 bg-gradient-to-br from-amber-500/5 to-transparent rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300`} />

                      <div className="relative">
                        <div className="flex items-start gap-3 mb-3">
                          {/* Icono mejorado con gradiente */}
                          <div className={`relative w-14 h-14 ${statusConfig.bg} rounded-2xl flex items-center justify-center border-2 ${statusConfig.border} shadow-lg`}>
                            <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent rounded-2xl" />
                            {getFileIcon(file.name)}
                          </div>
                          <div className="flex-1 min-w-0">
                            <h4 className="text-sm font-semibold text-theme-primary truncate" title={file.name}>
                              {file.name.length > 28 ? file.name.substring(0, 28) + '...' : file.name}
                            </h4>
                            <p className="text-xs text-theme-muted mt-1 flex items-center gap-2">
                              <span className="flex items-center gap-1"><Archive className="w-3 h-3" /> {file.size}</span>
                              <span>•</span>
                              <span>{file.modified}</span>
                            </p>
                          </div>
                          {/* Botón de favorito mejorado */}
                          {config.puedeMarcarFavoritos && (
                            <button 
                              onClick={(e) => { e.stopPropagation(); toggleFavorito(file.id); }}
                              className={`p-2 rounded-xl transition-all duration-200 ${isFavorito ? 'text-amber-500 bg-amber-500/20' : 'text-theme-muted hover:text-amber-500 hover:bg-amber-500/10'}`}
                            >
                              <Star className={`w-5 h-5 ${isFavorito ? 'fill-current' : ''}`} />
                            </button>
                          )}
                        </div>

                        {/* Acciones rápidas en hover */}
                        <motion.div 
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: isHovered ? 1 : 0, height: isHovered ? 'auto' : 0 }}
                          className="overflow-hidden mb-3"
                        >
                          <div className="flex items-center gap-2 py-2">
                            <button 
                              onClick={(e) => { e.stopPropagation(); setActiveModal('view'); handleFileClick(file); }}
                              className="flex-1 flex items-center justify-center gap-1 px-3 py-2 bg-blue-500/20 text-blue-400 rounded-lg text-xs font-medium hover:bg-blue-500/30 transition-colors"
                            >
                              <Eye className="w-3 h-3" /> Ver
                            </button>
                            <button 
                              onClick={(e) => { e.stopPropagation(); handleDownload(file); }}
                              className="flex-1 flex items-center justify-center gap-1 px-3 py-2 bg-emerald-500/20 text-emerald-400 rounded-lg text-xs font-medium hover:bg-emerald-500/30 transition-colors"
                            >
                              <Download className="w-3 h-3" /> Descargar
                            </button>
                            {config.puedeCompartir && (
                              <button 
                                onClick={(e) => { e.stopPropagation(); setActiveModal('share'); }}
                                className="flex-1 flex items-center justify-center gap-1 px-3 py-2 bg-purple-500/20 text-purple-400 rounded-lg text-xs font-medium hover:bg-purple-500/30 transition-colors"
                              >
                                <Share2 className="w-3 h-3" /> Compartir
                              </button>
                            )}
                          </div>
                        </motion.div>

                        <div className="flex items-center justify-between mb-3">
                          <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold border ${statusConfig.bg} ${statusConfig.color} ${statusConfig.border}`}>
                            <span className={`w-2 h-2 rounded-full ${statusConfig.color.replace('text-', 'bg-')}`} />
                            {statusConfig.label}
                          </span>
                          {config.categoriasVisibles.includes('forense') && (
                            <div className="flex items-center gap-1.5" title={`Confianza: ${file.confidence}%`}>
                              <div className="h-1.5 w-16 bg-theme-tertiary rounded-full overflow-hidden">
                                <div 
                                  className={`h-full rounded-full transition-all duration-500 ${
                                    file.confidence >= 90 ? 'bg-emerald-500' : 
                                    file.confidence >= 70 ? 'bg-amber-500' : 'bg-red-500'
                                  }`}
                                  style={{ width: `${file.confidence}%` }}
                                />
                              </div>
                              <span className="text-xs font-medium text-theme-muted">{file.confidence}%</span>
                            </div>
                          )}
                        </div>

                        {/* Etiquetas e indicadores */}
                        <div className="flex flex-wrap gap-1.5 items-center">
                          {file.tags.slice(0, 3).map((tag) => (
                            <span key={tag} className="px-2.5 py-1 bg-theme-tertiary/80 text-theme-secondary text-[10px] rounded-lg border border-theme-hover/50">{tag}</span>
                          ))}
                          {file.tags.length > 3 && (
                            <span className="px-2.5 py-1 bg-theme-tertiary/80 text-theme-muted text-[10px] rounded-lg border border-theme-hover/50">+{file.tags.length - 3}</span>
                          )}
                          {hasExpedientes && (
                            <span className="px-2 py-0.5 bg-blue-500/20 text-blue-400 text-[10px] rounded-lg border border-blue-500/30 flex items-center gap-1 ml-auto">
                              <Briefcase className="w-3 h-3" />
                              {file.linkedExpedientes?.length}
                            </span>
                          )}
                          {config.puedeVerHistorial && file.verificationHistory.length > 0 && (
                            <span className="px-2 py-0.5 bg-purple-500/20 text-purple-400 text-[10px] rounded-lg border border-purple-500/30 flex items-center gap-1">
                              <History className="w-3 h-3" />
                              {file.verificationHistory.length}
                            </span>
                          )}
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            ) : (
              <div className="space-y-2">
                {filteredFiles.map((file, index) => {
                  const statusConfig = getStatusConfig(file.status);
                  const isFavorito = favoritos.includes(file.id);
                  const isHovered = hoveredFile === file.id;
                  const hasExpedientes = file.linkedExpedientes && file.linkedExpedientes.length > 0;
                  return (
                    <motion.div
                      key={file.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.03 }}
                      onMouseEnter={() => setHoveredFile(file.id)}
                      onMouseLeave={() => setHoveredFile(null)}
                      onClick={() => handleFileClick(file)}
                      className={`group flex items-center gap-4 p-4 bg-gradient-to-r from-theme-secondary/60 to-theme-secondary/30 border rounded-xl cursor-pointer transition-all duration-200 hover:scale-[1.005] ${
                        selectedFile?.id === file.id ? 'border-amber-500 ring-1 ring-amber-500/30' : 'border-theme hover:border-amber-500/50'
                      }`}
                    >
                      <div className={`w-12 h-12 ${statusConfig.bg} rounded-xl flex items-center justify-center border-2 ${statusConfig.border} flex-shrink-0 shadow-lg`}>
                        {getFileIcon(file.name)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-3">
                          <h4 className="text-sm font-semibold text-theme-primary truncate">{file.name}</h4>
                          <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border ${statusConfig.bg} ${statusConfig.color} ${statusConfig.border}`}>
                            <span className={`w-2 h-2 rounded-full ${statusConfig.color.replace('text-', 'bg-')}`} />
                            {statusConfig.label}
                          </span>
                          {config.puedeMarcarFavoritos && (
                            <button 
                              onClick={(e) => { e.stopPropagation(); toggleFavorito(file.id); }}
                              className={`transition-colors ${isFavorito ? 'text-amber-500' : 'text-theme-muted hover:text-amber-500'}`}
                            >
                              <Star className={`w-4 h-4 ${isFavorito ? 'fill-current' : ''}`} />
                            </button>
                          )}
                          {hasExpedientes && (
                            <span className="px-2 py-0.5 bg-blue-500/20 text-blue-400 text-xs rounded-lg border border-blue-500/30 flex items-center gap-1">
                              <Briefcase className="w-3 h-3" />
                              {file.linkedExpedientes?.length}
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-4 mt-1">
                          <p className="text-xs text-theme-muted truncate flex-1">{file.notes}</p>
                          <p className="text-xs text-theme-muted flex items-center gap-1">
                            <Archive className="w-3 h-3" /> {file.size}
                          </p>
                        </div>
                      </div>
                      
                      {/* Acciones rápidas en hover */}
                      <motion.div 
                        initial={{ opacity: 0 }}
                        animate={{ opacity: isHovered ? 1 : 0 }}
                        className="flex items-center gap-2"
                      >
                        <button 
                          onClick={(e) => { e.stopPropagation(); setActiveModal('view'); handleFileClick(file); }}
                          className="p-2 text-theme-muted hover:text-blue-400 hover:bg-blue-500/10 rounded-lg transition-colors"
                          title="Ver"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button 
                          onClick={(e) => { e.stopPropagation(); handleDownload(file); }}
                          className="p-2 text-theme-muted hover:text-emerald-400 hover:bg-emerald-500/10 rounded-lg transition-colors"
                          title="Descargar"
                        >
                          <Download className="w-4 h-4" />
                        </button>
                        {config.puedeCompartir && (
                          <button 
                            onClick={(e) => { e.stopPropagation(); setActiveModal('share'); }}
                            className="p-2 text-theme-muted hover:text-purple-400 hover:bg-purple-500/10 rounded-lg transition-colors"
                            title="Compartir"
                          >
                            <Share2 className="w-4 h-4" />
                          </button>
                        )}
                      </motion.div>

                      {config.categoriasVisibles.includes('forense') && (
                        <div className="flex items-center gap-3 min-w-[100px]">
                          <div className="flex items-center gap-1.5">
                            <div className="h-1.5 w-14 bg-theme-tertiary rounded-full overflow-hidden">
                              <div 
                                className={`h-full rounded-full transition-all duration-300 ${
                                  file.confidence >= 90 ? 'bg-emerald-500' : 
                                  file.confidence >= 70 ? 'bg-amber-500' : 'bg-red-500'
                                }`}
                                style={{ width: `${file.confidence}%` }}
                              />
                            </div>
                            <span className="text-xs font-medium text-theme-muted">{file.confidence}%</span>
                          </div>
                        </div>
                      )}
                    </motion.div>
                  );
                })}
              </div>
            )}

            {filteredFiles.length === 0 && (
              <div className="text-center py-16">
                <FileSearch className="w-16 h-16 text-theme-secondary mx-auto mb-4" />
                <h3 className="text-lg font-medium text-theme-primary mb-2">No se encontraron documentos</h3>
                <p className="text-theme-secondary">
                  {config.puedeSubir 
                    ? 'Intenta ajustar los filtros o sube un nuevo documento'
                    : 'Intenta ajustar los filtros de búsqueda'}
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Panel de Detalles */}
        <AnimatePresence>
          {selectedFile && (
            <motion.div
              initial={{ width: 0, opacity: 0 }}
              animate={{ width: 420, opacity: 1 }}
              exit={{ width: 0, opacity: 0 }}
              className="border-l border-theme bg-theme-secondary/60 overflow-hidden"
            >
              <div className="h-full overflow-y-auto p-6">
                {(() => {
                  const statusConfig = getStatusConfig(selectedFile.status);
                  const isFavorito = favoritos.includes(selectedFile.id);
                  const hasExpedientes = selectedFile.linkedExpedientes && selectedFile.linkedExpedientes.length > 0;
                  return (
                    <>
                      <div className="p-6 border-b border-theme">
                        <div className="flex items-start justify-between mb-4">
                          <div className={`w-16 h-16 ${statusConfig.bg} rounded-2xl flex items-center justify-center border ${statusConfig.border}`}>
                            <FileText className={`w-8 h-8 ${statusConfig.color}`} />
                          </div>
                          <button onClick={() => setSelectedFile(null)} className="p-2 text-theme-secondary hover:text-theme-primary hover:bg-theme-tertiary rounded-lg">
                            <X className="w-5 h-5" />
                          </button>
                        </div>
                        <h3 className="text-lg font-bold text-theme-primary break-all mb-2">{selectedFile.name}</h3>
                        <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium border ${statusConfig.bg} ${statusConfig.color} ${statusConfig.border}`}>
                          {statusConfig.label}
                        </span>
                        
                        {/* Indicador de favorito */}
                        {config.puedeMarcarFavoritos && (
                          <button
                            onClick={() => toggleFavorito(selectedFile.id)}
                            className={`mt-3 flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm transition-colors ${
                              isFavorito 
                                ? 'bg-amber-500/20 text-amber-500' 
                                : 'bg-theme-tertiary text-theme-secondary hover:text-amber-500'
                            }`}
                          >
                            <Star className={`w-4 h-4 ${isFavorito ? 'fill-current' : ''}`} />
                            {isFavorito ? 'En favoritos' : 'Añadir a favoritos'}
                          </button>
                        )}
                      </div>

                      <div className="p-6 space-y-6">
                        {/* Confianza - solo si tiene acceso a forense */}
                        {config.categoriasVisibles.includes('forense') && (
                          <div>
                            <div className="flex items-center justify-between mb-2">
                              <span className="text-sm text-theme-secondary">Nivel de confianza</span>
                              <span className={`text-lg font-bold ${
                                selectedFile.confidence >= 90 ? 'text-emerald-400' : 
                                selectedFile.confidence >= 70 ? 'text-amber-400' : 'text-red-400'
                              }`}>{selectedFile.confidence}%</span>
                            </div>
                            <div className="h-3 bg-theme-tertiary rounded-full overflow-hidden">
                              <div 
                                className={`h-full rounded-full ${
                                  selectedFile.confidence >= 90 ? 'bg-emerald-500' : 
                                  selectedFile.confidence >= 70 ? 'bg-amber-500' : 'bg-red-500'
                                }`}
                                style={{ width: `${selectedFile.confidence}%` }}
                              />
                            </div>
                          </div>
                        )}

                        {/* Expedientes vinculados */}
                        {hasExpedientes && (
                          <div>
                            <h4 className="text-sm font-medium text-theme-primary mb-3 flex items-center gap-2">
                              <Briefcase className="w-4 h-4 text-blue-400" />
                              Expedientes vinculados
                            </h4>
                            <div className="space-y-2">
                              {selectedFile.linkedExpedientes?.map((exp) => (
                                <div key={exp.id} className="p-3 bg-blue-500/10 border border-blue-500/20 rounded-lg">
                                  <div className="flex items-center justify-between">
                                    <span className="text-sm font-medium text-blue-400">{exp.id}</span>
                                    <span className="text-xs text-theme-muted">{exp.date}</span>
                                  </div>
                                  <p className="text-xs text-theme-secondary mt-1">{exp.title}</p>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        <div className="space-y-3">
                          <div className="flex justify-between py-2 border-b border-theme">
                            <span className="text-sm text-theme-secondary">Tamaño</span>
                            <span className="text-sm text-theme-primary">{selectedFile.size}</span>
                          </div>
                          <div className="flex justify-between py-2 border-b border-theme">
                            <span className="text-sm text-theme-secondary">Modificado</span>
                            <span className="text-sm text-theme-primary">{selectedFile.modified}</span>
                          </div>
                          <div className="flex justify-between py-2 border-b border-theme">
                            <span className="text-sm text-theme-secondary">Autor</span>
                            <span className="text-sm text-theme-primary">{selectedFile.author}</span>
                          </div>
                          {config.puedeOrganizarArchivo && (
                            <div className="flex justify-between py-2 border-b border-theme">
                              <span className="text-sm text-theme-secondary">Ubicación física</span>
                              <span className="text-sm text-theme-primary">Archivo {String(selectedFile.id).slice(-2)}</span>
                            </div>
                          )}
                        </div>

                        <div>
                          <h4 className="text-sm font-medium text-theme-primary mb-3">
                            {config.categoriasVisibles.includes('forense') 
                              ? 'Elementos de seguridad analizados' 
                              : 'Etiquetas'}
                          </h4>
                          <div className="flex flex-wrap gap-2">
                            {selectedFile.tags.map((tag) => (
                              <span key={tag} className="px-3 py-1.5 bg-theme-tertiary text-theme-primary text-xs rounded-lg border border-theme-hover">{tag}</span>
                            ))}
                          </div>
                        </div>

                        {config.categoriasVisibles.includes('forense') && (
                          <div>
                            <h4 className="text-sm font-medium text-theme-primary mb-3">Informe forense</h4>
                            <div className="p-4 bg-theme-tertiary/50 rounded-xl border border-theme-hover">
                              <p className="text-sm text-theme-primary leading-relaxed">{selectedFile.notes}</p>
                            </div>
                          </div>
                        )}

                        {/* Acciones principales */}
                        <div className="grid grid-cols-2 gap-3">
                          <button 
                            onClick={() => { setActiveModal('view'); }}
                            className="flex items-center justify-center gap-2 px-4 py-2.5 bg-theme-tertiary text-theme-primary rounded-xl hover:bg-theme-secondary"
                          >
                            <Eye className="w-4 h-4" />
                            <span className="text-sm">Ver</span>
                          </button>
                          <button 
                            onClick={() => handleDownload(selectedFile)}
                            className="flex items-center justify-center gap-2 px-4 py-2.5 bg-theme-tertiary text-theme-primary rounded-xl hover:bg-theme-secondary"
                          >
                            <Download className="w-4 h-4" />
                            <span className="text-sm">Descargar</span>
                          </button>
                          {config.puedeCompartir && (
                            <button 
                              onClick={() => setActiveModal('share')}
                              className="flex items-center justify-center gap-2 px-4 py-2.5 bg-theme-tertiary text-theme-primary rounded-xl hover:bg-theme-secondary"
                            >
                              <Share2 className="w-4 h-4" />
                              <span className="text-sm">Compartir</span>
                            </button>
                          )}
                          
                          {/* Botón Historial de verificaciones */}
                          {config.puedeVerHistorial && (
                            <button 
                              onClick={() => setActiveModal('history')}
                              className="flex items-center justify-center gap-2 px-4 py-2.5 bg-purple-500/10 text-purple-400 rounded-xl hover:bg-purple-500/20 border border-purple-500/20"
                            >
                              <History className="w-4 h-4" />
                              <span className="text-sm">Historial</span>
                            </button>
                          )}
                          
                          {/* Botón Exportar Informe */}
                          {config.puedeExportarInforme && (
                            <button 
                              onClick={() => handleExportForensicReport(selectedFile)}
                              className="flex items-center justify-center gap-2 px-4 py-2.5 bg-orange-500/10 text-orange-400 rounded-xl hover:bg-orange-500/20 border border-orange-500/20"
                            >
                              <FileOutput className="w-4 h-4" />
                              <span className="text-sm">Informe PDF</span>
                            </button>
                          )}
                          
                          {/* Botón Vincular a Expediente */}
                          {config.puedeVincularExpediente && (
                            <button 
                              onClick={() => setActiveModal('link-expediente')}
                              className="flex items-center justify-center gap-2 px-4 py-2.5 bg-blue-500/10 text-blue-400 rounded-xl hover:bg-blue-500/20 border border-blue-500/20"
                            >
                              <Link2 className="w-4 h-4" />
                              <span className="text-sm">Vincular</span>
                            </button>
                          )}
                          
                          {/* Botones de firma electrónica */}
                          {signature.permissions.canRequestSignatures && (
                            <button 
                              onClick={() => {
                                setSignatureMode('request');
                                setSignatureModalOpen(true);
                              }}
                              className="flex items-center justify-center gap-2 px-4 py-2.5 bg-purple-500/10 text-purple-400 rounded-xl hover:bg-purple-500/20 border border-purple-500/20"
                            >
                              <FileSignature className="w-4 h-4" />
                              <span className="text-sm">Solicitar firma</span>
                            </button>
                          )}
                          
                          {signature.permissions.canSign && (
                            <button 
                              onClick={() => {
                                setSignatureMode('sign');
                                setSignatureModalOpen(true);
                              }}
                              className="flex items-center justify-center gap-2 px-4 py-2.5 bg-emerald-500/10 text-emerald-400 rounded-xl hover:bg-emerald-500/20 border border-emerald-500/20"
                            >
                              <Pen className="w-4 h-4" />
                              <span className="text-sm">Firmar</span>
                            </button>
                          )}
                          
                          {config.puedeEditarMetadatos && (
                            <button 
                              onClick={openEditModal}
                              className="flex items-center justify-center gap-2 px-4 py-2.5 bg-blue-500/10 text-blue-400 rounded-xl hover:bg-blue-500/20 border border-blue-500/20"
                            >
                              <Edit3 className="w-4 h-4" />
                              <span className="text-sm">Editar</span>
                            </button>
                          )}
                          {config.puedeEliminar ? (
                            <button 
                              onClick={() => setActiveModal('delete')}
                              className="flex items-center justify-center gap-2 px-4 py-2.5 bg-red-500/10 text-red-400 rounded-xl hover:bg-red-500/20 border border-red-500/20"
                            >
                              <Trash2 className="w-4 h-4" />
                              <span className="text-sm">Eliminar</span>
                            </button>
                          ) : config.puedeSugerir ? (
                            <button 
                              onClick={() => setActiveModal('suggest')}
                              className="flex items-center justify-center gap-2 px-4 py-2.5 bg-amber-500/10 text-amber-400 rounded-xl hover:bg-amber-500/20 border border-amber-500/20"
                            >
                              <AlertCircle className="w-4 h-4" />
                              <span className="text-sm">Sugerir</span>
                            </button>
                          ) : null}
                        </div>
                      </div>
                    </>
                  );
                })()}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

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
             toast.type === 'error' ? <AlertCircle className="w-5 h-5" /> : <Scan className="w-5 h-5" />}
            {toast.message}
          </motion.div>
        )}
      </AnimatePresence>

      {/* ============================================
          MODALES
          ============================================ */}

      {/* Modal: Historial de Verificaciones */}
      <AnimatePresence>
        {activeModal === 'history' && selectedFile && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => setActiveModal(null)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-theme-secondary border border-theme rounded-2xl w-full max-w-2xl max-h-[80vh] overflow-hidden"
              onClick={e => e.stopPropagation()}
            >
              <div className="flex items-center justify-between p-6 border-b border-theme">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-purple-500/20 rounded-xl">
                    <History className="w-6 h-6 text-purple-400" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-theme-primary">Historial de Verificaciones</h3>
                    <p className="text-sm text-theme-secondary truncate max-w-md">{selectedFile.name}</p>
                  </div>
                </div>
                <button onClick={() => setActiveModal(null)} className="p-2 text-theme-secondary hover:text-theme-primary hover:bg-theme-tertiary rounded-lg">
                  <X className="w-5 h-5" />
                </button>
              </div>
              
              <div className="p-6 overflow-y-auto max-h-[60vh]">
                <div className="space-y-4">
                  {selectedFile.verificationHistory.map((item, index) => (
                    <motion.div
                      key={item.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.05 }}
                      className="relative pl-8 pb-4 last:pb-0"
                    >
                      {/* Línea de tiempo */}
                      {index < selectedFile.verificationHistory.length - 1 && (
                        <div className="absolute left-3 top-8 bottom-0 w-0.5 bg-theme-tertiary" />
                      )}
                      
                      {/* Punto de la línea de tiempo */}
                      <div className={`absolute left-0 top-1 w-6 h-6 rounded-full flex items-center justify-center ${
                        item.action === 'verify' ? 'bg-emerald-500/20' :
                        item.action === 'reject' ? 'bg-red-500/20' :
                        item.action === 'upload' ? 'bg-blue-500/20' :
                        item.action === 'export' ? 'bg-orange-500/20' :
                        item.action === 'attach' ? 'bg-blue-500/20' :
                        'bg-amber-500/20'
                      }`}>
                        {item.action === 'verify' ? <CheckCircle className="w-3.5 h-3.5 text-emerald-400" /> :
                         item.action === 'reject' ? <X className="w-3.5 h-3.5 text-red-400" /> :
                         item.action === 'upload' ? <Upload className="w-3.5 h-3.5 text-blue-400" /> :
                         item.action === 'export' ? <FileOutput className="w-3.5 h-3.5 text-orange-400" /> :
                         item.action === 'attach' ? <Link2 className="w-3.5 h-3.5 text-blue-400" /> :
                         <Scan className="w-3.5 h-3.5 text-amber-400" />}
                      </div>
                      
                      {/* Contenido */}
                      <div className="bg-theme-tertiary/50 rounded-xl p-4 border border-theme-hover">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm font-medium text-theme-primary">
                            {item.action === 'verify' ? 'Verificación exitosa' :
                             item.action === 'reject' ? 'Documento rechazado' :
                             item.action === 'upload' ? 'Carga de documento' :
                             item.action === 'export' ? 'Exportación de informe' :
                             item.action === 'attach' ? 'Vinculación a expediente' :
                             'Análisis en curso'}
                          </span>
                          <span className="text-xs text-theme-muted">{item.date}</span>
                        </div>
                        
                        {item.result && (
                          <p className="text-sm text-theme-secondary mb-2">{item.result}</p>
                        )}
                        
                        {item.notes && (
                          <p className="text-xs text-theme-muted bg-theme-secondary/50 p-2 rounded-lg">{item.notes}</p>
                        )}
                        
                        {item.confidence && (
                          <div className="mt-2 flex items-center gap-2">
                            <span className="text-xs text-theme-muted">Confianza:</span>
                            <div className="flex-1 h-1.5 bg-theme-secondary rounded-full overflow-hidden max-w-[100px]">
                              <div 
                                className={`h-full rounded-full ${
                                  item.confidence >= 90 ? 'bg-emerald-500' : 
                                  item.confidence >= 70 ? 'bg-amber-500' : 'bg-red-500'
                                }`}
                                style={{ width: `${item.confidence}%` }}
                              />
                            </div>
                            <span className={`text-xs font-medium ${
                              item.confidence >= 90 ? 'text-emerald-400' : 
                              item.confidence >= 70 ? 'text-amber-400' : 'text-red-400'
                            }`}>{item.confidence}%</span>
                          </div>
                        )}
                        
                        {item.expedienteId && (
                          <div className="mt-2 flex items-center gap-2 text-xs text-blue-400">
                            <Briefcase className="w-3 h-3" />
                            <span>Vinculado a {item.expedienteId}</span>
                          </div>
                        )}
                        
                        <div className="mt-2 text-xs text-theme-muted">
                          Por: <span className="text-theme-secondary">{item.user}</span>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>

              <div className="p-6 border-t border-theme flex justify-between">
                <button
                  onClick={() => setActiveModal(null)}
                  className="px-6 py-2.5 border border-theme-hover text-theme-secondary rounded-xl hover:text-theme-primary transition-colors"
                >
                  Cerrar
                </button>
                {config.puedeExportarInforme && (
                  <button
                    onClick={() => {
                      handleExportForensicReport(selectedFile);
                      setActiveModal(null);
                    }}
                    className="px-6 py-2.5 bg-orange-500/10 text-orange-400 rounded-xl hover:bg-orange-500/20 border border-orange-500/20 flex items-center gap-2"
                  >
                    <FileOutput className="w-4 h-4" />
                    Exportar informe
                  </button>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Modal: Vincular a Expediente */}
      <AnimatePresence>
        {activeModal === 'link-expediente' && selectedFile && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => setActiveModal(null)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-theme-secondary border border-theme rounded-2xl w-full max-w-lg max-h-[80vh] overflow-hidden"
              onClick={e => e.stopPropagation()}
            >
              <div className="flex items-center justify-between p-6 border-b border-theme">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-blue-500/20 rounded-xl">
                    <Link2 className="w-6 h-6 text-blue-400" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-theme-primary">Vincular a Expediente</h3>
                    <p className="text-sm text-theme-secondary truncate max-w-sm">{selectedFile.name}</p>
                  </div>
                </div>
                <button onClick={() => setActiveModal(null)} className="p-2 text-theme-secondary hover:text-theme-primary hover:bg-theme-tertiary rounded-lg">
                  <X className="w-5 h-5" />
                </button>
              </div>
              
              <div className="p-6">
                {/* Búsqueda de expedientes */}
                <div className="relative mb-4">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-theme-muted" />
                  <input
                    type="text"
                    placeholder="Buscar expediente por ID, título o cliente..."
                    value={searchExpediente}
                    onChange={(e) => setSearchExpediente(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 bg-theme-tertiary border border-theme-hover rounded-xl text-theme-primary text-sm placeholder-theme-muted focus:outline-none focus:border-blue-500"
                  />
                </div>

                {/* Lista de expedientes */}
                <div className="space-y-2 max-h-[300px] overflow-y-auto">
                  {filteredExpedientes.length === 0 ? (
                    <div className="text-center py-8">
                      <FolderOpen className="w-12 h-12 text-theme-tertiary mx-auto mb-3" />
                      <p className="text-sm text-theme-secondary">No se encontraron expedientes</p>
                    </div>
                  ) : (
                    filteredExpedientes.map((exp) => (
                      <button
                        key={exp.id}
                        onClick={() => setSelectedExpediente(exp.id)}
                        className={`w-full p-4 rounded-xl border text-left transition-all ${
                          selectedExpediente === exp.id
                            ? 'bg-blue-500/10 border-blue-500/50'
                            : 'bg-theme-tertiary/50 border-theme-hover hover:border-blue-500/30'
                        }`}
                      >
                        <div className="flex items-start justify-between">
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="text-sm font-semibold text-blue-400">{exp.id}</span>
                              <span className="px-2 py-0.5 bg-theme-secondary text-[10px] text-theme-muted rounded">{exp.type}</span>
                            </div>
                            <p className="text-sm text-theme-primary mt-1">{exp.title}</p>
                            <p className="text-xs text-theme-muted mt-1">Cliente: {exp.client}</p>
                          </div>
                          {selectedExpediente === exp.id && (
                            <CheckCircle className="w-5 h-5 text-blue-400" />
                          )}
                        </div>
                      </button>
                    ))
                  )}
                </div>
              </div>

              <div className="p-6 border-t border-theme flex gap-3">
                <button
                  onClick={() => setActiveModal(null)}
                  className="flex-1 py-2.5 border border-theme-hover text-theme-secondary rounded-xl hover:text-theme-primary transition-colors"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleLinkExpediente}
                  disabled={!selectedExpediente}
                  className="flex-1 py-2.5 bg-blue-500 text-white font-medium rounded-xl hover:bg-blue-400 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  <Link2 className="w-4 h-4" />
                  Vincular
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Modal: Subir Documento */}
      <AnimatePresence>
        {activeModal === 'upload' && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => setActiveModal(null)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-theme-secondary border border-theme rounded-2xl p-6 w-full max-w-lg"
              onClick={e => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-theme-primary">Subir Documento</h3>
                <button onClick={() => setActiveModal(null)} className="p-1 text-theme-secondary hover:text-theme-primary">
                  <X className="w-5 h-5" />
                </button>
              </div>
              
              <div className="space-y-4">
                <div 
                  onClick={() => fileInputRef.current?.click()}
                  className="border-2 border-dashed border-theme-hover rounded-xl p-8 text-center cursor-pointer hover:border-amber-500/50 transition-colors"
                >
                  <Upload className="w-10 h-10 text-theme-muted mx-auto mb-3" />
                  <p className="text-sm text-theme-secondary">
                    {uploadForm.file ? uploadForm.file.name : 'Arrastra un archivo o haz clic para seleccionar'}
                  </p>
                  <p className="text-xs text-theme-muted mt-1">Máximo 50MB</p>
                </div>
                <input ref={fileInputRef} type="file" onChange={handleFileSelect} className="hidden" />

                <div>
                  <label className="text-sm text-theme-secondary mb-2 block">Nombre del documento</label>
                  <input
                    type="text"
                    value={uploadForm.name}
                    onChange={(e) => setUploadForm({...uploadForm, name: e.target.value})}
                    placeholder="Ej: Código Civil 2026"
                    className="w-full px-4 py-2.5 bg-theme-tertiary border border-theme-hover rounded-xl text-theme-primary placeholder-theme-muted focus:outline-none focus:border-amber-500"
                  />
                </div>

                <div>
                  <label className="text-sm text-theme-secondary mb-2 block">Categoría</label>
                  <select
                    value={uploadForm.category}
                    onChange={(e) => setUploadForm({...uploadForm, category: e.target.value})}
                    className="w-full px-4 py-2.5 bg-theme-tertiary border border-theme-hover rounded-xl text-theme-primary focus:outline-none focus:border-amber-500"
                  >
                    <option value="legislacion">Legislación</option>
                    <option value="jurisprudencia">Jurisprudencia</option>
                    <option value="doctrina">Doctrina</option>
                    <option value="plantillas">Plantillas</option>
                    <option value="contratos">Contratos</option>
                    <option value="formatos">Formatos</option>
                  </select>
                </div>

                <div>
                  <label className="text-sm text-theme-secondary mb-2 block">Etiquetas (separadas por coma)</label>
                  <input
                    type="text"
                    value={uploadForm.tags}
                    onChange={(e) => setUploadForm({...uploadForm, tags: e.target.value})}
                    placeholder="Ej: civil, contratos, modelo"
                    className="w-full px-4 py-2.5 bg-theme-tertiary border border-theme-hover rounded-xl text-theme-primary placeholder-theme-muted focus:outline-none focus:border-amber-500"
                  />
                </div>
              </div>

              <div className="flex gap-3 mt-6">
                <button
                  onClick={() => setActiveModal(null)}
                  className="flex-1 py-2.5 border border-theme-hover text-theme-secondary rounded-xl hover:text-theme-primary transition-colors"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleUpload}
                  className="flex-1 py-2.5 bg-amber-500 text-slate-950 font-medium rounded-xl hover:bg-amber-400 transition-colors flex items-center justify-center gap-2"
                >
                  <Upload className="w-4 h-4" />
                  Subir Documento
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Modal: Sugerir Documento */}
      <AnimatePresence>
        {activeModal === 'suggest' && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => setActiveModal(null)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-theme-secondary border border-theme rounded-2xl p-6 w-full max-w-lg"
              onClick={e => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-theme-primary">Sugerir Nuevo Documento</h3>
                <button onClick={() => setActiveModal(null)} className="p-1 text-theme-secondary hover:text-theme-primary">
                  <X className="w-5 h-5" />
                </button>
              </div>
              
              <div className="space-y-4">
                <div>
                  <label className="text-sm text-theme-secondary mb-2 block">Título del documento</label>
                  <input
                    type="text"
                    value={suggestForm.title}
                    onChange={(e) => setSuggestForm({...suggestForm, title: e.target.value})}
                    placeholder="Ej: Nueva jurisprudencia sobre contratos"
                    className="w-full px-4 py-2.5 bg-theme-tertiary border border-theme-hover rounded-xl text-theme-primary placeholder-theme-muted focus:outline-none focus:border-amber-500"
                  />
                </div>

                <div>
                  <label className="text-sm text-theme-secondary mb-2 block">Categoría</label>
                  <select
                    value={suggestForm.category}
                    onChange={(e) => setSuggestForm({...suggestForm, category: e.target.value})}
                    className="w-full px-4 py-2.5 bg-theme-tertiary border border-theme-hover rounded-xl text-theme-primary focus:outline-none focus:border-amber-500"
                  >
                    <option value="legislacion">Legislación</option>
                    <option value="jurisprudencia">Jurisprudencia</option>
                    <option value="doctrina">Doctrina</option>
                    <option value="plantillas">Plantillas</option>
                    <option value="contratos">Contratos</option>
                    <option value="formatos">Formatos</option>
                  </select>
                </div>

                <div>
                  <label className="text-sm text-theme-secondary mb-2 block">Descripción / Justificación</label>
                  <textarea
                    value={suggestForm.description}
                    onChange={(e) => setSuggestForm({...suggestForm, description: e.target.value})}
                    placeholder="Describe por qué este documento sería útil..."
                    rows={4}
                    className="w-full px-4 py-2.5 bg-theme-tertiary border border-theme-hover rounded-xl text-theme-primary placeholder-theme-muted focus:outline-none focus:border-amber-500 resize-none"
                  />
                </div>
              </div>

              <div className="flex gap-3 mt-6">
                <button
                  onClick={() => setActiveModal(null)}
                  className="flex-1 py-2.5 border border-theme-hover text-theme-secondary rounded-xl hover:text-theme-primary transition-colors"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleSuggest}
                  className="flex-1 py-2.5 bg-amber-500 text-slate-950 font-medium rounded-xl hover:bg-amber-400 transition-colors flex items-center justify-center gap-2"
                >
                  <Send className="w-4 h-4" />
                  Enviar Sugerencia
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Modal: Compartir */}
      <AnimatePresence>
        {activeModal === 'share' && selectedFile && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => setActiveModal(null)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-theme-secondary border border-theme rounded-2xl p-6 w-full max-w-md"
              onClick={e => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-theme-primary">Compartir Documento</h3>
                <button onClick={() => setActiveModal(null)} className="p-1 text-theme-secondary hover:text-theme-primary">
                  <X className="w-5 h-5" />
                </button>
              </div>
              
              <div className="p-4 bg-theme-tertiary/50 rounded-xl mb-4">
                <p className="text-sm text-theme-secondary">Documento</p>
                <p className="text-theme-primary font-medium truncate">{selectedFile.name}</p>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="text-sm text-theme-secondary mb-2 block">Compartir por email</label>
                  <div className="flex gap-2">
                    <input
                      type="email"
                      value={shareEmail}
                      onChange={(e) => setShareEmail(e.target.value)}
                      placeholder="correo@ejemplo.com"
                      className="flex-1 px-4 py-2.5 bg-theme-tertiary border border-theme-hover rounded-xl text-theme-primary placeholder-theme-muted focus:outline-none focus:border-amber-500"
                    />
                    <button 
                      onClick={() => setShareEmail('')}
                      className="p-2.5 text-theme-secondary hover:text-theme-primary"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>
                </div>

                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-theme-hover"></div>
                  </div>
                  <div className="relative flex justify-center">
                    <span className="px-2 bg-theme-secondary text-xs text-theme-muted">O</span>
                  </div>
                </div>

                <button
                  onClick={handleCopyLink}
                  className="w-full p-3 bg-theme-tertiary/50 border border-theme-hover rounded-xl hover:border-amber-500/30 transition-colors flex items-center gap-3"
                >
                  <Copy className="w-5 h-5 text-theme-secondary" />
                  <span className="text-theme-primary">{copiedLink ? '¡Enlace copiado!' : 'Copiar enlace de acceso'}</span>
                  {copiedLink && <Check className="w-4 h-4 text-emerald-500 ml-auto" />}
                </button>
              </div>

              <div className="flex gap-3 mt-6">
                <button
                  onClick={() => setActiveModal(null)}
                  className="flex-1 py-2.5 border border-theme-hover text-theme-secondary rounded-xl hover:text-theme-primary transition-colors"
                >
                  Cerrar
                </button>
                <button
                  onClick={handleShare}
                  disabled={!shareEmail}
                  className="flex-1 py-2.5 bg-amber-500 text-slate-950 font-medium rounded-xl hover:bg-amber-400 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  <Share2 className="w-4 h-4" />
                  Compartir
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Modal: Eliminar */}
      <AnimatePresence>
        {activeModal === 'delete' && selectedFile && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => setActiveModal(null)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-theme-secondary border border-theme rounded-2xl p-6 w-full max-w-md"
              onClick={e => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-theme-primary">Eliminar Documento</h3>
                <button onClick={() => setActiveModal(null)} className="p-1 text-theme-secondary hover:text-theme-primary">
                  <X className="w-5 h-5" />
                </button>
              </div>
              
              <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-xl mb-4">
                <p className="text-sm text-red-400 font-medium mb-2">⚠️ Esta acción no se puede deshacer</p>
                <p className="text-sm text-theme-secondary">Documento:</p>
                <p className="text-theme-primary truncate">{selectedFile.name}</p>
              </div>

              <p className="text-sm text-theme-secondary mb-6">
                ¿Estás seguro de que deseas eliminar este documento permanentemente de la biblioteca?
              </p>

              <div className="flex gap-3">
                <button
                  onClick={() => setActiveModal(null)}
                  className="flex-1 py-2.5 border border-theme-hover text-theme-secondary rounded-xl hover:text-theme-primary transition-colors"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleDelete}
                  className="flex-1 py-2.5 bg-red-500 text-white font-medium rounded-xl hover:bg-red-400 transition-colors flex items-center justify-center gap-2"
                >
                  <Trash2 className="w-4 h-4" />
                  Eliminar
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Modal: Editar Metadatos */}
      <AnimatePresence>
        {activeModal === 'edit' && selectedFile && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => setActiveModal(null)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-theme-secondary border border-theme rounded-2xl p-6 w-full max-w-lg"
              onClick={e => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-theme-primary">Editar Metadatos</h3>
                <button onClick={() => setActiveModal(null)} className="p-1 text-theme-secondary hover:text-theme-primary">
                  <X className="w-5 h-5" />
                </button>
              </div>
              
              <div className="space-y-4">
                <div>
                  <label className="text-sm text-theme-secondary mb-2 block">Nombre del documento</label>
                  <input
                    type="text"
                    value={editForm.name}
                    onChange={(e) => setEditForm({...editForm, name: e.target.value})}
                    className="w-full px-4 py-2.5 bg-theme-tertiary border border-theme-hover rounded-xl text-theme-primary focus:outline-none focus:border-amber-500"
                  />
                </div>

                <div>
                  <label className="text-sm text-theme-secondary mb-2 block">Etiquetas (separadas por coma)</label>
                  <input
                    type="text"
                    value={editForm.tags}
                    onChange={(e) => setEditForm({...editForm, tags: e.target.value})}
                    placeholder="Ej: civil, contratos, modelo"
                    className="w-full px-4 py-2.5 bg-theme-tertiary border border-theme-hover rounded-xl text-theme-primary placeholder-theme-muted focus:outline-none focus:border-amber-500"
                  />
                </div>

                <div>
                  <label className="text-sm text-theme-secondary mb-2 block">Notas / Descripción</label>
                  <textarea
                    value={editForm.notes}
                    onChange={(e) => setEditForm({...editForm, notes: e.target.value})}
                    rows={4}
                    className="w-full px-4 py-2.5 bg-theme-tertiary border border-theme-hover rounded-xl text-theme-primary placeholder-theme-muted focus:outline-none focus:border-amber-500 resize-none"
                  />
                </div>
              </div>

              <div className="flex gap-3 mt-6">
                <button
                  onClick={() => setActiveModal(null)}
                  className="flex-1 py-2.5 border border-theme-hover text-theme-secondary rounded-xl hover:text-theme-primary transition-colors"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleEdit}
                  className="flex-1 py-2.5 bg-blue-500 text-white font-medium rounded-xl hover:bg-blue-400 transition-colors flex items-center justify-center gap-2"
                >
                  <FileEdit className="w-4 h-4" />
                  Guardar Cambios
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Modal: Organizar Archivo */}
      <AnimatePresence>
        {activeModal === 'organize' && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => setActiveModal(null)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-theme-secondary border border-theme rounded-2xl p-6 w-full max-w-lg"
              onClick={e => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-theme-primary">Organizar Archivo Físico</h3>
                <button onClick={() => setActiveModal(null)} className="p-1 text-theme-secondary hover:text-theme-primary">
                  <X className="w-5 h-5" />
                </button>
              </div>
              
              <div className="space-y-4">
                <p className="text-sm text-theme-secondary">
                  Gestiona la ubicación física de los documentos en el archivo del bufete.
                </p>

                <div className="grid grid-cols-2 gap-3">
                  <button className="p-4 bg-theme-tertiary/50 border border-theme-hover rounded-xl hover:border-amber-500/30 transition-all text-left">
                    <Folder className="w-6 h-6 text-amber-500 mb-2" />
                    <p className="text-sm font-medium text-theme-primary">Verificar ubicación</p>
                    <p className="text-xs text-theme-muted">Comprobar documentos en archivo</p>
                  </button>
                  <button className="p-4 bg-theme-tertiary/50 border border-theme-hover rounded-xl hover:border-amber-500/30 transition-all text-left">
                    <FileSearch className="w-6 h-6 text-blue-500 mb-2" />
                    <p className="text-sm font-medium text-theme-primary">Buscar documento</p>
                    <p className="text-xs text-theme-muted">Localizar en archivo físico</p>
                  </button>
                  <button className="p-4 bg-theme-tertiary/50 border border-theme-hover rounded-xl hover:border-amber-500/30 transition-all text-left">
                    <Folder className="w-6 h-6 text-emerald-500 mb-2" />
                    <p className="text-sm font-medium text-theme-primary">Nueva ubicación</p>
                    <p className="text-xs text-theme-muted">Asignar ubicación a documento</p>
                  </button>
                  <button className="p-4 bg-theme-tertiary/50 border border-theme-hover rounded-xl hover:border-amber-500/30 transition-all text-left">
                    <Settings className="w-6 h-6 text-purple-500 mb-2" />
                    <p className="text-sm font-medium text-theme-primary">Inventario</p>
                    <p className="text-xs text-theme-muted">Revisar inventario completo</p>
                  </button>
                </div>
              </div>

              <div className="flex gap-3 mt-6">
                <button
                  onClick={() => setActiveModal(null)}
                  className="flex-1 py-2.5 border border-theme-hover text-theme-secondary rounded-xl hover:text-theme-primary transition-colors"
                >
                  Cerrar
                </button>
                <button
                  onClick={handleOrganize}
                  className="flex-1 py-2.5 bg-emerald-500 text-slate-950 font-medium rounded-xl hover:bg-emerald-400 transition-colors flex items-center justify-center gap-2"
                >
                  <CheckCircle className="w-4 h-4" />
                  Marcar como Organizado
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Modal: Ver Documento */}
      <AnimatePresence>
        {activeModal === 'view' && selectedFile && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => setActiveModal(null)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-theme-secondary border border-theme rounded-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden"
              onClick={e => e.stopPropagation()}
            >
              <div className="flex items-center justify-between p-4 border-b border-theme">
                <div className="flex items-center gap-3">
                  <FileText className="w-6 h-6 text-amber-500" />
                  <div>
                    <h3 className="text-lg font-semibold text-theme-primary">{selectedFile.name}</h3>
                    <p className="text-xs text-theme-secondary">{selectedFile.size} • {selectedFile.modified}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {config.puedeExportarInforme && (
                    <button 
                      onClick={() => handleExportForensicReport(selectedFile)}
                      className="flex items-center gap-2 px-3 py-2 bg-orange-500/10 text-orange-400 rounded-lg hover:bg-orange-500/20 border border-orange-500/20"
                    >
                      <FileOutput className="w-4 h-4" />
                      <span className="text-sm">Informe PDF</span>
                    </button>
                  )}
                  <button 
                    onClick={() => handleDownload(selectedFile)}
                    className="flex items-center gap-2 px-3 py-2 bg-theme-tertiary text-theme-primary rounded-lg hover:bg-theme-secondary"
                  >
                    <Download className="w-4 h-4" />
                    <span className="text-sm">Descargar</span>
                  </button>
                  <button onClick={() => setActiveModal(null)} className="p-2 text-theme-secondary hover:text-theme-primary hover:bg-theme-tertiary rounded-lg">
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </div>
              
              <div className="p-8 flex items-center justify-center min-h-[400px] bg-theme-primary">
                <div className="text-center">
                  <FileText className="w-24 h-24 text-theme-secondary mx-auto mb-4" />
                  <p className="text-theme-muted mb-2">Vista previa del documento</p>
                  <p className="text-sm text-theme-secondary">{selectedFile.name}</p>
                  <p className="text-xs text-theme-muted mt-4 max-w-md">{selectedFile.notes}</p>
                  <div className="flex flex-wrap gap-2 justify-center mt-4">
                    {selectedFile.tags.map((tag) => (
                      <span key={tag} className="px-2 py-1 bg-theme-tertiary text-theme-secondary text-xs rounded-full">{tag}</span>
                    ))}
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Modal: Firma Electrónica */}
      <SignatureModal
        isOpen={signatureModalOpen}
        onClose={() => setSignatureModalOpen(false)}
        mode={signatureMode}
        documentId={selectedFile?.id?.toString() || ''}
        documentName={selectedFile?.name || ''}
        onComplete={() => {
          if (signatureMode === 'request') {
            showToast(`Solicitud de firma enviada para ${selectedFile?.name}`, 'success');
          } else {
            showToast(`Documento firmado correctamente`, 'success');
          }
          setSignatureModalOpen(false);
        }}
      />
    </AppLayout>
  );
}

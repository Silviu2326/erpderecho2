// ============================================
// PÁGINA DE GESTIÓN DE FIRMAS ELECTRÓNICAS
// ============================================

import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FileSignature, Clock, CheckCircle, XCircle, AlertCircle,
  Search, Download, Eye, MoreVertical, Calendar,
  Mail, RefreshCw, TrendingUp,
  FileText, Shield, Award, Fingerprint, Key,
  ChevronLeft, ChevronRight, ArrowUpDown,
  Pen, Send, Trash2, Bell
} from 'lucide-react';
import { AppLayout } from '@/components/layout/AppLayout';
import { useRole } from '@/hooks/useRole';
import { 
  SignatureModal, 
  useSignature, 
  SignatureTypeBadge,
  SignerListCompact,
  mockSignatureRequests
} from '@/components/signature';
import type { 
  SignatureRequest, 
  SignatureType
} from '@/components/signature';

// ============================================
// TIPOS EXTENDIDOS
// ============================================

type FilterStatus = 'all' | 'pending' | 'in_progress' | 'completed' | 'expired' | 'cancelled';
type FilterType = 'all' | 'simple' | 'advanced' | 'qualified' | 'biometric' | 'certificate';
type SortField = 'date' | 'deadline' | 'status' | 'type';
type SortOrder = 'asc' | 'desc';

interface SignatureFilters {
  status: FilterStatus;
  type: FilterType;
  search: string;
  dateFrom: string;
  dateTo: string;
  sortField: SortField;
  sortOrder: SortOrder;
}

// ============================================
// COMPONENTE PRINCIPAL
// ============================================

export default function SignatureManagement() {
  const { role } = useRole();
  const signature = useSignature(role, 'usuario@bufete.com');
  
  // Estado para filtros
  const [filters, setFilters] = useState<SignatureFilters>({
    status: 'all',
    type: 'all',
    search: '',
    dateFrom: '',
    dateTo: '',
    sortField: 'date',
    sortOrder: 'desc',
  });
  
  // Estado para vista activa
  const [activeTab, setActiveTab] = useState<'all' | 'pending' | 'completed' | 'history'>('all');
  
  // Estado para modal de firma
  const [signatureModalOpen, setSignatureModalOpen] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState<SignatureRequest | null>(null);
  const [modalMode, setModalMode] = useState<'sign' | 'request'>('sign');
  
  // Estado para paginación
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  
  // Estado para dropdown
  const [openDropdownId, setOpenDropdownId] = useState<string | null>(null);
  
  // Datos filtrados
  const filteredRequests = useMemo(() => {
    let data = [...mockSignatureRequests];
    
    // Filtrar por tab
    if (activeTab === 'pending') {
      data = data.filter(r => r.status === 'pending' || r.status === 'in_progress');
    } else if (activeTab === 'completed') {
      data = data.filter(r => r.status === 'completed');
    } else if (activeTab === 'history') {
      data = data.filter(r => r.status === 'expired' || r.status === 'cancelled');
    }
    
    // Filtrar por estado
    if (filters.status !== 'all') {
      data = data.filter(r => r.status === filters.status);
    }
    
    // Filtrar por tipo
    if (filters.type !== 'all') {
      data = data.filter(r => r.signatureType === filters.type);
    }
    
    // Filtrar por búsqueda
    if (filters.search) {
      const search = filters.search.toLowerCase();
      data = data.filter(r => 
        r.documentName.toLowerCase().includes(search) ||
        r.id.toLowerCase().includes(search) ||
        r.signers.some(s => s.name.toLowerCase().includes(search) || s.email.toLowerCase().includes(search))
      );
    }
    
    // Filtrar por fecha
    if (filters.dateFrom) {
      data = data.filter(r => new Date(r.createdAt) >= new Date(filters.dateFrom));
    }
    if (filters.dateTo) {
      data = data.filter(r => new Date(r.createdAt) <= new Date(filters.dateTo));
    }
    
    // Ordenar
    data.sort((a, b) => {
      let comparison = 0;
      switch (filters.sortField) {
        case 'date':
          comparison = new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
          break;
        case 'deadline':
          const aDeadline = a.expiresAt ? new Date(a.expiresAt).getTime() : Infinity;
          const bDeadline = b.expiresAt ? new Date(b.expiresAt).getTime() : Infinity;
          comparison = aDeadline - bDeadline;
          break;
        case 'status':
          comparison = a.status.localeCompare(b.status);
          break;
        case 'type':
          comparison = a.signatureType.localeCompare(b.signatureType);
          break;
      }
      return filters.sortOrder === 'asc' ? comparison : -comparison;
    });
    
    return data;
  }, [filters, activeTab]);
  
  // Paginación
  const totalPages = Math.ceil(filteredRequests.length / itemsPerPage);
  const paginatedRequests = filteredRequests.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );
  
  // Estadísticas
  const stats = useMemo(() => {
    const all = mockSignatureRequests;
    return {
      total: all.length,
      pending: all.filter(r => r.status === 'pending' || r.status === 'in_progress').length,
      completed: all.filter(r => r.status === 'completed').length,
      expired: all.filter(r => r.status === 'expired').length,
      completionRate: Math.round((all.filter(r => r.status === 'completed').length / all.length) * 100),
      byType: {
        simple: all.filter(r => r.signatureType === 'simple').length,
        advanced: all.filter(r => r.signatureType === 'advanced').length,
        qualified: all.filter(r => r.signatureType === 'qualified').length,
      }
    };
  }, []);
  
  // Handlers
  const handleViewRequest = (request: SignatureRequest) => {
    setSelectedRequest(request);
    setModalMode('sign');
    setSignatureModalOpen(true);
  };
  
  const handleRequestSignature = () => {
    setSelectedRequest(null);
    setModalMode('request');
    setSignatureModalOpen(true);
  };
  
  const handleCancelRequest = (requestId: string) => {
    // Aquí iría la lógica para cancelar
    console.log('Cancelando solicitud:', requestId);
    setOpenDropdownId(null);
  };
  
  const handleSendReminder = (requestId: string) => {
    // Aquí iría la lógica para enviar recordatorio
    console.log('Enviando recordatorio:', requestId);
    setOpenDropdownId(null);
  };
  
  const handleExport = () => {
    // Exportar a CSV
    const headers = ['ID', 'Documento', 'Tipo', 'Estado', 'Fecha', 'Expira', 'Firmantes'];
    const rows = filteredRequests.map(r => [
      r.id,
      r.documentName,
      r.signatureType,
      r.status,
      new Date(r.createdAt).toLocaleDateString('es-ES'),
      r.expiresAt ? new Date(r.expiresAt).toLocaleDateString('es-ES') : '-',
      r.signers.length
    ]);
    
    const csv = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `firmas_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };
  
  // Verificar si el usuario puede firmar una solicitud
  const canSignRequest = (request: SignatureRequest): boolean => {
    return signature.canSign(request);
  };
  
  // Renderizar icono de tipo de firma
  const getSignatureTypeIcon = (type: SignatureType) => {
    switch (type) {
      case 'simple': return <Pen className="w-4 h-4" />;
      case 'advanced': return <Shield className="w-4 h-4" />;
      case 'qualified': return <Award className="w-4 h-4" />;
      case 'biometric': return <Fingerprint className="w-4 h-4" />;
      case 'certificate': return <Key className="w-4 h-4" />;
      default: return <FileSignature className="w-4 h-4" />;
    }
  };
  
  // Header actions
  const headerActions = (
    <div className="flex items-center gap-3">
      {signature.permissions.canRequestSignatures && (
        <button 
          onClick={handleRequestSignature}
          className="flex items-center gap-2 px-4 py-2 bg-amber-500 text-slate-950 font-medium rounded-xl hover:bg-amber-400 transition-colors"
        >
          <Send className="w-4 h-4" />
          <span className="hidden lg:inline">Solicitar Firma</span>
        </button>
      )}
      <button 
        onClick={handleExport}
        className="flex items-center gap-2 px-4 py-2 bg-slate-800 text-white font-medium rounded-xl hover:bg-slate-700 transition-colors"
      >
        <Download className="w-4 h-4" />
        <span className="hidden lg:inline">Exportar</span>
      </button>
    </div>
  );
  
  return (
    <AppLayout 
      title="Gestión de Firmas"
      subtitle="Administra solicitudes de firma electrónica"
      headerActions={headerActions}
    >
      <main className="flex-1 overflow-y-auto p-6 lg:p-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4 mb-6">
          <StatCard 
            label="Total Solicitudes" 
            value={stats.total} 
            icon={FileSignature}
            color="blue"
          />
          <StatCard 
            label="Pendientes" 
            value={stats.pending} 
            icon={Clock}
            color="amber"
            trend={{ value: stats.pending, direction: 'up' }}
          />
          <StatCard 
            label="Completadas" 
            value={stats.completed} 
            icon={CheckCircle}
            color="emerald"
          />
          <StatCard 
            label="Expiradas" 
            value={stats.expired} 
            icon={XCircle}
            color="red"
          />
          <StatCard 
            label="Tasa Éxito" 
            value={`${stats.completionRate}%`} 
            icon={TrendingUp}
            color="purple"
          />
          <StatCard 
            label="Firma Cualificada" 
            value={stats.byType.qualified} 
            icon={Award}
            color="cyan"
          />
        </div>
        
        {/* Tabs */}
        <div className="flex items-center gap-2 mb-6 border-b border-slate-800">
          {[
            { id: 'all', label: 'Todas', count: stats.total },
            { id: 'pending', label: 'Pendientes', count: stats.pending },
            { id: 'completed', label: 'Completadas', count: stats.completed },
            { id: 'history', label: 'Historial', count: stats.expired + mockSignatureRequests.filter(r => r.status === 'cancelled').length },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
                activeTab === tab.id
                  ? 'border-amber-500 text-amber-500'
                  : 'border-transparent text-slate-400 hover:text-white'
              }`}
            >
              {tab.label}
              <span className={`px-2 py-0.5 rounded-full text-xs ${
                activeTab === tab.id ? 'bg-amber-500/20 text-amber-500' : 'bg-slate-800 text-slate-500'
              }`}>
                {tab.count}
              </span>
            </button>
          ))}
        </div>
        
        {/* Filters */}
        <div className="flex flex-col lg:flex-row gap-4 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
            <input
              type="text"
              placeholder="Buscar por documento, ID o firmante..."
              value={filters.search}
              onChange={(e) => setFilters({ ...filters, search: e.target.value })}
              className="w-full pl-12 pr-4 py-3 bg-slate-900 border border-slate-800 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-amber-500 transition-colors"
            />
          </div>
          
          <div className="flex gap-3 flex-wrap">
            <select
              value={filters.status}
              onChange={(e) => setFilters({ ...filters, status: e.target.value as FilterStatus })}
              className="px-4 py-3 bg-slate-900 border border-slate-800 rounded-xl text-white focus:outline-none focus:border-amber-500"
            >
              <option value="all">Todos los estados</option>
              <option value="pending">Pendiente</option>
              <option value="in_progress">En progreso</option>
              <option value="completed">Completada</option>
              <option value="expired">Expirada</option>
              <option value="cancelled">Cancelada</option>
            </select>
            
            <select
              value={filters.type}
              onChange={(e) => setFilters({ ...filters, type: e.target.value as FilterType })}
              className="px-4 py-3 bg-slate-900 border border-slate-800 rounded-xl text-white focus:outline-none focus:border-amber-500"
            >
              <option value="all">Todos los tipos</option>
              <option value="simple">Firma Simple</option>
              <option value="advanced">Firma Avanzada</option>
              <option value="qualified">Firma Cualificada</option>
              <option value="biometric">Firma Biométrica</option>
              <option value="certificate">Certificado Digital</option>
            </select>
            
            <button
              onClick={() => setFilters({
                ...filters,
                sortOrder: filters.sortOrder === 'asc' ? 'desc' : 'asc'
              })}
              className="flex items-center gap-2 px-4 py-3 bg-slate-900 border border-slate-800 rounded-xl text-slate-400 hover:text-white transition-colors"
            >
              <ArrowUpDown className="w-4 h-4" />
              <span className="text-sm">{filters.sortOrder === 'asc' ? 'Asc' : 'Desc'}</span>
            </button>
          </div>
        </div>
        
        {/* Table */}
        <div className="bg-slate-900/60 border border-slate-800 rounded-2xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-800 bg-slate-900/80">
                  <th className="text-left py-4 px-6 text-xs font-medium text-slate-400 uppercase">Documento</th>
                  <th className="text-left py-4 px-6 text-xs font-medium text-slate-400 uppercase">Tipo</th>
                  <th className="text-left py-4 px-6 text-xs font-medium text-slate-400 uppercase">Firmantes</th>
                  <th className="text-left py-4 px-6 text-xs font-medium text-slate-400 uppercase">Estado</th>
                  <th className="text-left py-4 px-6 text-xs font-medium text-slate-400 uppercase">Creado</th>
                  <th className="text-left py-4 px-6 text-xs font-medium text-slate-400 uppercase">Expira</th>
                  <th className="text-left py-4 px-6 text-xs font-medium text-slate-400 uppercase">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {paginatedRequests.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-12 text-center">
                      <FileSignature className="w-16 h-16 text-slate-700 mx-auto mb-4" />
                      <p className="text-slate-400">No se encontraron solicitudes de firma</p>
                    </td>
                  </tr>
                ) : (
                  paginatedRequests.map((request, index) => (
                    <motion.tr 
                      key={request.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.03 }}
                      className="border-b border-slate-800/50 hover:bg-slate-800/30 transition-colors"
                    >
                      <td className="py-4 px-6">
                        <div className="flex items-center gap-3">
                          <div className="p-2 bg-slate-800 rounded-lg">
                            <FileText className="w-5 h-5 text-amber-500" />
                          </div>
                          <div>
                            <p className="text-sm font-medium text-white">{request.documentName}</p>
                            <p className="text-xs text-slate-500 font-mono">{request.id}</p>
                          </div>
                        </div>
                      </td>
                      <td className="py-4 px-6">
                        <div className="flex items-center gap-2">
                          {getSignatureTypeIcon(request.signatureType)}
                          <SignatureTypeBadge type={request.signatureType} size="sm" />
                        </div>
                      </td>
                      <td className="py-4 px-6">
                        <SignerListCompact signers={request.signers} showStatus />
                      </td>
                      <td className="py-4 px-6">
                        <RequestStatusBadge status={request.status} />
                      </td>
                      <td className="py-4 px-6">
                        <div className="flex items-center gap-2 text-sm text-slate-400">
                          <Calendar className="w-4 h-4" />
                          {new Date(request.createdAt).toLocaleDateString('es-ES')}
                        </div>
                      </td>
                      <td className="py-4 px-6">
                        {request.expiresAt ? (
                          <div className={`flex items-center gap-2 text-sm ${
                            new Date(request.expiresAt) < new Date() ? 'text-red-400' : 'text-slate-400'
                          }`}>
                            <Clock className="w-4 h-4" />
                            {new Date(request.expiresAt).toLocaleDateString('es-ES')}
                          </div>
                        ) : (
                          <span className="text-slate-600">-</span>
                        )}
                      </td>
                      <td className="py-4 px-6">
                        <div className="flex items-center gap-2">
                          {/* Botón de firma si le toca al usuario */}
                          {canSignRequest(request) && (
                            <button
                              onClick={() => handleViewRequest(request)}
                              className="flex items-center gap-1 px-3 py-1.5 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded-lg hover:bg-emerald-500/20 transition-colors text-sm"
                            >
                              <Pen className="w-3.5 h-3.5" />
                              Firmar
                            </button>
                          )}
                          
                          <button
                            onClick={() => handleViewRequest(request)}
                            className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
                            title="Ver detalles"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          
                          <div className="relative">
                            <button
                              onClick={() => setOpenDropdownId(openDropdownId === request.id ? null : request.id)}
                              className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
                            >
                              <MoreVertical className="w-4 h-4" />
                            </button>
                            
                            <AnimatePresence>
                              {openDropdownId === request.id && (
                                <motion.div
                                  initial={{ opacity: 0, scale: 0.95 }}
                                  animate={{ opacity: 1, scale: 1 }}
                                  exit={{ opacity: 0, scale: 0.95 }}
                                  className="absolute right-0 mt-2 w-48 bg-slate-900 border border-slate-700 rounded-xl shadow-xl z-50 py-1"
                                >
                                  {request.status === 'pending' && (
                                    <button
                                      onClick={() => handleSendReminder(request.id)}
                                      className="w-full px-4 py-2 text-left text-sm text-slate-300 hover:bg-slate-800 flex items-center gap-2"
                                    >
                                      <Mail className="w-4 h-4" />
                                      Enviar recordatorio
                                    </button>
                                  )}
                                  <button
                                    onClick={() => handleExport()}
                                    className="w-full px-4 py-2 text-left text-sm text-slate-300 hover:bg-slate-800 flex items-center gap-2"
                                  >
                                    <Download className="w-4 h-4" />
                                    Descargar PDF
                                  </button>
                                  {(request.status === 'pending' || request.status === 'draft') && (
                                    <>
                                      <div className="border-t border-slate-700 my-1" />
                                      <button
                                        onClick={() => handleCancelRequest(request.id)}
                                        className="w-full px-4 py-2 text-left text-sm text-red-400 hover:bg-red-500/10 flex items-center gap-2"
                                      >
                                        <Trash2 className="w-4 h-4" />
                                        Cancelar
                                      </button>
                                    </>
                                  )}
                                </motion.div>
                              )}
                            </AnimatePresence>
                          </div>
                        </div>
                      </td>
                    </motion.tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
          
          {/* Pagination */}
          {totalPages > 1 && (
            <div className="p-4 border-t border-slate-800 flex items-center justify-between">
              <p className="text-sm text-slate-400">
                Mostrando {Math.min((currentPage - 1) * itemsPerPage + 1, filteredRequests.length)} - {Math.min(currentPage * itemsPerPage, filteredRequests.length)} de {filteredRequests.length}
              </p>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                  className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors disabled:opacity-50"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                  <button
                    key={page}
                    onClick={() => setCurrentPage(page)}
                    className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                      currentPage === page 
                        ? 'bg-amber-500 text-slate-950' 
                        : 'text-slate-400 hover:text-white hover:bg-slate-800'
                    }`}
                  >
                    {page}
                  </button>
                ))}
                <button
                  onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages}
                  className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors disabled:opacity-50"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}
        </div>
        
        {/* Recent Activity / Audit Trail */}
        <div className="mt-8 grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Recent Signatures */}
          <div className="lg:col-span-2 bg-slate-900/60 border border-slate-800 rounded-2xl p-6">
            <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
              <CheckCircle className="w-5 h-5 text-emerald-500" />
              Firmas Recientes
            </h3>
            <div className="space-y-3">
              {mockSignatureRequests
                .filter(r => r.signatures.length > 0)
                .flatMap(r => r.signatures.map(sig => ({ ...sig, documentName: r.documentName })))
                .slice(0, 5)
                .map((sig) => (
                  <div key={sig.id} className="flex items-center gap-3 p-3 bg-slate-800/50 rounded-xl">
                    <div className="w-10 h-10 bg-emerald-500/10 rounded-full flex items-center justify-center">
                      <CheckCircle className="w-5 h-5 text-emerald-500" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm text-white">
                        <span className="font-medium">{sig.signerName}</span> firmó{' '}
                        <span className="text-slate-400">{sig.documentName}</span>
                      </p>
                      <p className="text-xs text-slate-500">
                        {new Date(sig.signedAt).toLocaleString('es-ES')} • {sig.type}
                      </p>
                    </div>
                  </div>
                ))}
            </div>
          </div>
          
          {/* Quick Stats */}
          <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-6">
            <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
              <Bell className="w-5 h-5 text-amber-500" />
              Pendientes de Acción
            </h3>
            <div className="space-y-4">
              {signature.getPendingForCurrentUser().length > 0 ? (
                signature.getPendingForCurrentUser().map(req => (
                  <div key={req.id} className="p-3 bg-amber-500/10 border border-amber-500/20 rounded-xl">
                    <p className="text-sm font-medium text-amber-400">{req.documentName}</p>
                    <p className="text-xs text-slate-400 mt-1">
                      {req.signers.filter(s => s.status === 'pending').length} firmante(s) pendiente(s)
                    </p>
                    <button
                      onClick={() => handleViewRequest(req)}
                      className="mt-2 text-xs text-amber-500 hover:text-amber-400 font-medium"
                    >
                      Ver detalles →
                    </button>
                  </div>
                ))
              ) : (
                <p className="text-sm text-slate-500 text-center py-4">
                  No tienes firmas pendientes
                </p>
              )}
            </div>
          </div>
        </div>
      </main>
      
      {/* Signature Modal */}
      <SignatureModal
        isOpen={signatureModalOpen}
        onClose={() => setSignatureModalOpen(false)}
        mode={modalMode}
        documentId={selectedRequest?.documentId || 'new-doc'}
        documentName={selectedRequest?.documentName || 'Nuevo Documento'}
        requestId={selectedRequest?.id}
        onComplete={(_result) => {
          setSignatureModalOpen(false);
          // Aquí se recargarían los datos
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

// ============================================
// SUB-COMPONENTES
// ============================================

interface StatCardProps {
  label: string;
  value: string | number;
  icon: React.ElementType;
  color: 'blue' | 'emerald' | 'amber' | 'red' | 'purple' | 'cyan';
  trend?: { value: number; direction: 'up' | 'down' };
}

function StatCard({ label, value, icon: Icon, color, trend }: StatCardProps) {
  const colorClasses = {
    blue: { bg: 'bg-blue-500/10', text: 'text-blue-400', border: 'border-blue-500/20' },
    emerald: { bg: 'bg-emerald-500/10', text: 'text-emerald-400', border: 'border-emerald-500/20' },
    amber: { bg: 'bg-amber-500/10', text: 'text-amber-400', border: 'border-amber-500/20' },
    red: { bg: 'bg-red-500/10', text: 'text-red-400', border: 'border-red-500/20' },
    purple: { bg: 'bg-purple-500/10', text: 'text-purple-400', border: 'border-purple-500/20' },
    cyan: { bg: 'bg-cyan-500/10', text: 'text-cyan-400', border: 'border-cyan-500/20' },
  };
  
  const colors = colorClasses[color];
  
  return (
    <div className={`p-4 ${colors.bg} border ${colors.border} rounded-xl`}>
      <div className="flex items-center justify-between mb-2">
        <Icon className={`w-5 h-5 ${colors.text}`} />
        {trend && (
          <span className={`text-xs ${trend.direction === 'up' ? 'text-emerald-400' : 'text-red-400'}`}>
            {trend.direction === 'up' ? '↑' : '↓'}
          </span>
        )}
      </div>
      <p className={`text-2xl font-bold ${colors.text}`}>{value}</p>
      <p className="text-xs text-slate-400 mt-1">{label}</p>
    </div>
  );
}

function RequestStatusBadge({ status }: { status: SignatureRequest['status'] }) {
  const config = {
    draft: { color: 'text-slate-400', bg: 'bg-slate-500/10', border: 'border-slate-500/20', label: 'Borrador' },
    pending: { color: 'text-amber-400', bg: 'bg-amber-500/10', border: 'border-amber-500/20', label: 'Pendiente' },
    in_progress: { color: 'text-blue-400', bg: 'bg-blue-500/10', border: 'border-blue-500/20', label: 'En progreso' },
    completed: { color: 'text-emerald-400', bg: 'bg-emerald-500/10', border: 'border-emerald-500/20', label: 'Completada' },
    cancelled: { color: 'text-red-400', bg: 'bg-red-500/10', border: 'border-red-500/20', label: 'Cancelada' },
    expired: { color: 'text-slate-400', bg: 'bg-slate-500/10', border: 'border-slate-500/20', label: 'Expirada' },
  };
  
  const { color, bg, border, label } = config[status];
  
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border ${bg} ${color} ${border}`}>
      {status === 'completed' && <CheckCircle className="w-3 h-3" />}
      {status === 'pending' && <Clock className="w-3 h-3" />}
      {status === 'in_progress' && <RefreshCw className="w-3 h-3" />}
      {status === 'cancelled' && <XCircle className="w-3 h-3" />}
      {status === 'expired' && <AlertCircle className="w-3 h-3" />}
      {label}
    </span>
  );
}

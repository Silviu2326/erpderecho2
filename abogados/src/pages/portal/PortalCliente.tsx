import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Scale, FolderOpen, CreditCard, FileText, MessageSquare, 
  Calendar, User, Bell, LogOut, ChevronRight,
  Clock, AlertCircle, Download, Eye, Upload, Send,
  Lock, Crown, Gavel, Users, CheckCircle,
  ArrowLeft, FileSignature, Pen, DollarSign,
  TrendingUp, Home, Search, XCircle, Filter, Mail
} from 'lucide-react';
import { CompressButton } from '@/components/compression/CompressButton';
import { ThemeToggleSimple } from '@/components/ThemeToggle';
import { 
  clienteCasesData, 
  clienteInvoicesData, 
  clienteDocumentsData,
  clienteMessagesData,
  clienteHearingsData,
  clienteFinancialSummary,
  clienteInfo,
  getCaseStatusColor,
  getCaseStatusText,
  getInvoiceStatusColor,
  getInvoiceStatusText,
  type ClienteCase,
  type ClienteInvoice,
  type ClienteMessage
} from '@/data/portalClienteData';
import { useRole } from '@/hooks/useRole';
import type { UserRole } from '@/types/roles';
import { SignatureModal, SignatureInfoPanel, SignatureHelpButton } from '@/components/signature';
import { PushNotificationPrompt, PushToggle } from '@/components/portal/PushNotificationPrompt';
import { EmailSettingsPanel } from '@/components/portal/EmailSettingsPanel';

type ActiveTab = 'dashboard' | 'cases' | 'invoices' | 'documents' | 'messages' | 'hearings';

// Configuración de acceso por rol para empleados del bufete
const ROLE_ACCESS: Record<UserRole, { canView: boolean; canSendMessages: boolean; description: string }> = {
  super_admin: { 
    canView: true, 
    canSendMessages: true,
    description: 'Acceso completo al portal del cliente para supervisión'
  },
  socio: { 
    canView: true, 
    canSendMessages: true,
    description: 'Acceso al portal del cliente para gestión de casos'
  },
  abogado_senior: { 
    canView: true, 
    canSendMessages: true,
    description: 'Acceso al portal del cliente para sus casos asignados'
  },
  abogado_junior: { 
    canView: true, 
    canSendMessages: true,
    description: 'Acceso al portal del cliente para sus casos asignados'
  },
  paralegal: { 
    canView: true, 
    canSendMessages: false,
    description: 'Vista de solo lectura del portal del cliente'
  },
  secretario: { 
    canView: true, 
    canSendMessages: false,
    description: 'Vista de solo lectura del portal del cliente'
  },
  administrador: { 
    canView: false, 
    canSendMessages: false,
    description: 'Sin acceso al portal del cliente'
  },
  contador: { 
    canView: false, 
    canSendMessages: false,
    description: 'Sin acceso al portal del cliente'
  },
  recepcionista: { 
    canView: false, 
    canSendMessages: false,
    description: 'Sin acceso al portal del cliente'
  },
};

export default function PortalCliente() {
  const { role, roleConfig } = useRole();
  const [activeTab, setActiveTab] = useState<ActiveTab>('dashboard');
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [selectedCase, setSelectedCase] = useState<ClienteCase | null>(null);
  const [selectedInvoice, setSelectedInvoice] = useState<ClienteInvoice | null>(null);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showEmailSettings, setShowEmailSettings] = useState(false);
  const [toast, setToast] = useState<{message: string; type: 'success' | 'error'} | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  
  // Estado para filtros
  const [caseFilters, setCaseFilters] = useState({ status: 'all', type: 'all', search: '' });
  const [invoiceFilters, setInvoiceFilters] = useState({ status: 'all', dateRange: 'all', search: '' });
  const [documentFilters, setDocumentFilters] = useState({ type: 'all', search: '' });
  
  // Estado para notificaciones
  const [notificationSettings, setNotificationSettings] = useState({
    email: true,
    push: true,
    cases: true,
    invoices: true,
    hearings: true,
    messages: true
  });
  
  // Estado para firma electrónica
  const [signatureModalOpen, setSignatureModalOpen] = useState(false);
  const [signatureInfoOpen, setSignatureInfoOpen] = useState(false);
  const [documentToSign, setDocumentToSign] = useState<{id: string; name: string} | null>(null);

  // Permisos según rol
  const permissions = useMemo(() => ROLE_ACCESS[role], [role]);

  const showToast = (message: string, type: 'success' | 'error' = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  // Handlers funcionales
  const handleDownloadDocument = (docTitle: string) => {
    showToast(`Descargando ${docTitle}...`);
  };

  const handleDownloadInvoice = (invoiceId: string) => {
    showToast(`Descargando factura ${invoiceId}...`);
  };

  const handlePayInvoice = (invoiceId: string) => {
    showToast(`Procesando pago de ${invoiceId}...`, 'success');
    setTimeout(() => {
      showToast('Pago procesado correctamente');
    }, 1500);
  };

  const handleSendMessage = (_content: string) => {
    if (!permissions.canSendMessages) {
      showToast('No tienes permisos para enviar mensajes desde el portal del cliente', 'error');
      return;
    }
    showToast('Mensaje enviado correctamente');
  };

  const handleUploadDocument = () => {
    showToast('Funcionalidad de carga disponible en versión completa');
  };

  // Si no tiene acceso
  if (!permissions.canView) {
    return (
      <div className="min-h-screen bg-theme-primary flex items-center justify-center p-6">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-lg w-full"
        >
          <div className="p-8 bg-theme-secondary/60 border border-theme rounded-2xl text-center">
            <div className="w-20 h-20 mx-auto mb-6 bg-theme-tertiary rounded-full flex items-center justify-center">
              <Lock className="w-10 h-10 text-theme-tertiary" />
            </div>
            <h2 className="text-2xl font-bold text-theme-primary mb-2">Portal del Cliente</h2>
            <p className="text-theme-secondary mb-6">
              Tu rol ({roleConfig.name}) no tiene acceso al portal del cliente.
            </p>
            <p className="text-sm text-theme-muted mb-6">
              {permissions.description}
            </p>
            <a 
              href="/dashboard"
              className="inline-flex items-center gap-2 px-6 py-3 bg-accent text-white font-medium rounded-xl hover:bg-accent-hover transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              Volver al Dashboard
            </a>
          </div>
        </motion.div>
      </div>
    );
  }

  const unreadMessages = clienteMessagesData.filter(m => !m.read).length;
  const upcomingHearings = clienteHearingsData.length;

  const menuItems = [
    { id: 'dashboard' as ActiveTab, label: 'Inicio', icon: Home, count: 0 },
    { id: 'cases' as ActiveTab, label: 'Mis Casos', icon: FolderOpen, count: clienteCasesData.filter(c => c.status !== 'closed').length },
    { id: 'invoices' as ActiveTab, label: 'Facturas', icon: CreditCard, count: clienteInvoicesData.filter(i => i.status === 'pending').length },
    { id: 'documents' as ActiveTab, label: 'Documentos', icon: FileText, count: clienteDocumentsData.length },
    { id: 'messages' as ActiveTab, label: 'Mensajes', icon: MessageSquare, count: unreadMessages },
    { id: 'hearings' as ActiveTab, label: 'Audiencias', icon: Calendar, count: upcomingHearings },
  ];

  const filteredSearch = useMemo(() => {
    if (!searchQuery.trim()) return null;
    const query = searchQuery.toLowerCase();
    
    const cases = clienteCasesData.filter(c => 
      c.title.toLowerCase().includes(query) || c.id.toLowerCase().includes(query)
    );
    const invoices = clienteInvoicesData.filter(i => 
      i.id.toLowerCase().includes(query) || i.caseTitle.toLowerCase().includes(query)
    );
    const documents = clienteDocumentsData.filter(d => 
      d.title.toLowerCase().includes(query)
    );
    
    return { cases, invoices, documents };
  }, [searchQuery]);

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return <DashboardView onNavigate={setActiveTab} />;
      case 'cases':
        return (
          <CasesView 
            onSelectCase={setSelectedCase} 
            selectedCase={selectedCase}
            filters={caseFilters}
            setFilters={setCaseFilters}
          />
        );
      case 'invoices':
        return (
          <InvoicesView
            onSelectInvoice={setSelectedInvoice}
            selectedInvoice={selectedInvoice}
            onDownloadInvoice={handleDownloadInvoice}
            onPayInvoice={handlePayInvoice}
            filters={invoiceFilters}
            setFilters={setInvoiceFilters}
            onOpenSignatureModal={(docId, docName) => {
              setDocumentToSign({ id: docId, name: docName });
              setSignatureModalOpen(true);
            }}
          />
        );
      case 'documents':
        return (
          <DocumentsView
            onDownloadDocument={handleDownloadDocument}
            onUploadDocument={handleUploadDocument}
            filters={documentFilters}
            setFilters={setDocumentFilters}
            onOpenSignatureModal={(docId, docName) => {
              setDocumentToSign({ id: docId, name: docName });
              setSignatureModalOpen(true);
            }}
          />
        );
      case 'messages':
        return <MessagesView canSendMessages={permissions.canSendMessages} onSendMessage={handleSendMessage} />;
      case 'hearings':
        return <HearingsView />;
      default:
        return <DashboardView onNavigate={setActiveTab} />;
    }
  };

  // Icono según rol
  const getRoleIcon = () => {
    switch (role) {
      case 'super_admin':
      case 'socio':
        return <Crown className="w-4 h-4" />;
      case 'abogado_senior':
      case 'abogado_junior':
        return <Gavel className="w-4 h-4" />;
      default:
        return <Users className="w-4 h-4" />;
    }
  };

  return (
    <div className="min-h-screen bg-theme-primary flex overflow-hidden">
      {/* Role Banner */}
      <div className="fixed top-0 left-0 right-0 z-50 bg-accent text-white px-4 py-2">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            {getRoleIcon()}
            <span className="font-medium text-sm">
              Vista del Portal del Cliente · {roleConfig.name}
            </span>
            {!permissions.canSendMessages && (
              <span className="text-xs bg-slate-950/20 px-2 py-0.5 rounded-full">
                Solo lectura
              </span>
            )}
          </div>
          <a 
            href="/dashboard"
            className="text-xs font-medium hover:underline flex items-center gap-1"
          >
            <ArrowLeft className="w-3 h-3" />
            Volver al bufete
          </a>
        </div>
      </div>

      {/* Push Notification Prompt */}
      <PushNotificationPrompt
        position="bottom"
        title="Activa las notificaciones"
        description="Recibe alertas sobre tus casos, facturas y audiencias"
        acceptText="Activar"
        dismissText="Ahora no"
      />

      {/* Sidebar */}
      <motion.aside
        initial={false}
        animate={{ width: sidebarOpen ? 280 : 80 }}
        className="bg-theme-secondary border-r border-theme flex flex-col flex-shrink-0 mt-9"
      >
        {/* Logo */}
        <div className="h-20 flex items-center px-6 border-b border-theme">
          <div className="flex items-center gap-3 overflow-hidden">
            <div className="w-10 h-10 bg-gradient-to-br from-amber-500 to-amber-600 rounded-xl flex items-center justify-center flex-shrink-0">
              <Scale className="w-6 h-6 text-white" />
            </div>
            <AnimatePresence>
              {sidebarOpen && (
                <motion.span
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -10 }}
                  className="font-bold text-xl text-theme-primary whitespace-nowrap"
                >
                  PORTAL<span className="text-accent">CLIENTE</span>
                </motion.span>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* Client Info */}
        <AnimatePresence>
          {sidebarOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="p-4 border-b border-theme"
            >
              <div className="flex items-center gap-3 px-3 py-3 rounded-lg bg-theme-tertiary/50 border border-theme">
                <div className="w-12 h-12 bg-gradient-to-br from-amber-500 to-amber-600 rounded-full flex items-center justify-center text-lg font-bold text-white">
                  {clienteInfo.avatar}
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-medium text-theme-primary truncate">{clienteInfo.name}</p>
                  <p className="text-xs text-theme-secondary">Cliente desde {new Date(clienteInfo.clientSince).getFullYear()}</p>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Mini Calendar */}
        <AnimatePresence>
          {sidebarOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="p-4 border-b border-theme"
            >
              <div className="bg-theme-tertiary/30 rounded-xl p-3">
                <div className="flex items-center justify-between mb-2">
                  <button className="p-1 text-theme-secondary hover:text-theme-primary">
                    <ChevronRight className="w-4 h-4 rotate-180" />
                  </button>
                  <span className="text-sm font-medium text-theme-primary">
                    {new Date().toLocaleDateString('es-ES', { month: 'long', year: 'numeric' })}
                  </span>
                  <button className="p-1 text-theme-secondary hover:text-theme-primary">
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
                <div className="grid grid-cols-7 gap-1 text-center text-xs">
                  {['D', 'L', 'M', 'X', 'J', 'V', 'S'].map((day, idx) => (
                    <span key={idx} className="text-theme-muted py-1">{day}</span>
                  ))}
                  {Array.from({ length: 35 }, (_, i) => {
                    const day = i - 3;
                    const date = new Date();
                    date.setDate(day);
                    const hasHearing = clienteHearingsData.some(h => new Date(h.date).getDate() === date.getDate() && new Date(h.date).getMonth() === date.getMonth());
                    const isToday = date.getDate() === new Date().getDate() && date.getMonth() === new Date().getMonth();
                    const isPast = date < new Date() && !isToday;
                    
                    return (
                      <button
                        key={i}
                        className={`p-1 rounded-full text-center ${
                          isToday 
                            ? 'bg-accent text-white font-bold' 
                            : hasHearing 
                              ? 'bg-amber-500/20 text-amber-400' 
                              : isPast 
                                ? 'text-theme-muted/50' 
                                : 'text-theme-secondary hover:bg-theme-tertiary'
                        }`}
                      >
                        {day > 0 && day <= 31 ? day : ''}
                      </button>
                    );
                  })}
                </div>
                {clienteHearingsData.length > 0 && (
                  <div className="mt-3 pt-3 border-t border-theme">
                    <p className="text-xs text-theme-muted mb-2">Próximas audiencias</p>
                    {clienteHearingsData.slice(0, 2).map(hearing => (
                      <div key={hearing.id} className="flex items-center gap-2 text-xs py-1">
                        <div className="w-2 h-2 bg-amber-500 rounded-full flex-shrink-0" />
                        <span className="text-theme-secondary truncate">
                          {new Date(hearing.date).getDate()} {new Date(hearing.date).toLocaleDateString('es-ES', { month: 'short' })}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Navigation */}
        <nav className="flex-1 py-6 px-4 space-y-1 overflow-y-auto">
          {menuItems.map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
                activeTab === item.id
                  ? 'bg-gradient-to-r from-amber-500 to-amber-600 text-white font-semibold shadow-lg shadow-amber-500/20'
                  : 'text-theme-secondary hover:bg-theme-tertiary hover:text-theme-primary'
              }`}
            >
              <item.icon className="w-5 h-5 flex-shrink-0" />
              <AnimatePresence>
                {sidebarOpen && (
                  <motion.span
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="flex-1 text-left whitespace-nowrap"
                  >
                    {item.label}
                  </motion.span>
                )}
              </AnimatePresence>
              {sidebarOpen && item.count > 0 && (
                <span className="px-2 py-0.5 bg-red-500 text-white text-xs font-bold rounded-full">
                  {item.count}
                </span>
              )}
            </button>
          ))}
        </nav>

        {/* Bottom Actions */}
        <div className="p-4 border-t border-theme space-y-2">
          <button className="w-full flex items-center gap-3 px-4 py-3 text-theme-secondary hover:bg-theme-tertiary hover:text-theme-primary rounded-xl transition-all">
            <User className="w-5 h-5" />
            <AnimatePresence>
              {sidebarOpen && <motion.span initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>Mi Perfil</motion.span>}
            </AnimatePresence>
          </button>
          <a
            href="/dashboard"
            className="w-full flex items-center gap-3 px-4 py-3 text-red-400 hover:bg-red-500/10 rounded-xl transition-all"
          >
            <LogOut className="w-5 h-5" />
            <AnimatePresence>
              {sidebarOpen && <motion.span initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>Salir del portal</motion.span>}
            </AnimatePresence>
          </a>
        </div>
      </motion.aside>

        {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0 mt-9">
        {/* Header */}
        <header className="h-auto min-h-20 bg-theme-secondary/80 backdrop-blur-xl border-b border-theme flex items-center justify-between px-6 lg:px-8 py-4">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="p-2 text-theme-secondary hover:text-theme-primary hover:bg-theme-tertiary rounded-lg transition-colors"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
            <div>
              {/* Breadcrumbs */}
              <div className="flex items-center gap-2 text-sm mb-1">
                <button
                  onClick={() => { setActiveTab('dashboard'); setSelectedCase(null); setSelectedInvoice(null); }}
                  className="text-theme-muted hover:text-accent transition-colors"
                >
                  Inicio
                </button>
                <ChevronRight className="w-4 h-4 text-theme-muted" />
                <span className="text-theme-secondary">{menuItems.find(m => m.id === activeTab)?.label}</span>
                {selectedCase && (
                  <>
                    <ChevronRight className="w-4 h-4 text-theme-muted" />
                    <span className="text-accent font-medium truncate max-w-[200px]">{selectedCase.id}</span>
                  </>
                )}
                {selectedInvoice && (
                  <>
                    <ChevronRight className="w-4 h-4 text-theme-muted" />
                    <span className="text-accent font-medium">{selectedInvoice.id}</span>
                  </>
                )}
              </div>
              <h1 className="text-xl font-bold text-theme-primary">
                {selectedCase ? selectedCase.title : selectedInvoice ? selectedInvoice.id : menuItems.find(m => m.id === activeTab)?.label}
              </h1>
              {!selectedCase && !selectedInvoice && (
                <p className="text-sm text-theme-secondary">
                  Bienvenido, {clienteInfo.name.split(' ')[0]}
                </p>
              )}
            </div>
          </div>

          <div className="flex items-center gap-4">
            {/* Search Bar */}
            <div className="relative hidden md:block">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-theme-muted" />
              <input
                type="text"
                placeholder="Buscar casos, facturas, documentos..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-64 lg:w-80 pl-10 pr-4 py-2.5 bg-theme-tertiary/50 border border-theme rounded-xl text-theme-primary placeholder-theme-muted focus:outline-none focus:border-accent/50 transition-colors"
              />
              {searchQuery && filteredSearch && (
                <div className="absolute right-2 top-1/2 -translate-y-1/2">
                  <button
                    onClick={() => setSearchQuery('')}
                    className="p-1 text-theme-muted hover:text-theme-primary"
                  >
                    <XCircle className="w-4 h-4" />
                  </button>
                </div>
              )}
              {/* Search Results Dropdown */}
              {searchQuery && filteredSearch && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="absolute top-full mt-2 w-full bg-theme-secondary border border-theme rounded-xl shadow-xl z-50 overflow-hidden"
                >
                  {filteredSearch.cases.length > 0 && (
                    <div className="p-2 border-b border-theme">
                      <p className="text-xs text-theme-muted px-2 py-1">Casos</p>
                      {filteredSearch.cases.slice(0, 3).map(c => (
                        <button
                          key={c.id}
                          onClick={() => { setActiveTab('cases'); setSearchQuery(''); }}
                          className="w-full text-left px-2 py-2 rounded-lg hover:bg-theme-tertiary transition-colors"
                        >
                          <p className="text-sm text-theme-primary truncate">{c.title}</p>
                          <p className="text-xs text-theme-muted">{c.id}</p>
                        </button>
                      ))}
                    </div>
                  )}
                  {filteredSearch.invoices.length > 0 && (
                    <div className="p-2 border-b border-theme">
                      <p className="text-xs text-theme-muted px-2 py-1">Facturas</p>
                      {filteredSearch.invoices.slice(0, 3).map(i => (
                        <button
                          key={i.id}
                          onClick={() => { setActiveTab('invoices'); setSearchQuery(''); }}
                          className="w-full text-left px-2 py-2 rounded-lg hover:bg-theme-tertiary transition-colors"
                        >
                          <p className="text-sm text-theme-primary truncate">{i.id}</p>
                          <p className="text-xs text-theme-muted">€{i.amount}</p>
                        </button>
                      ))}
                    </div>
                  )}
                  {filteredSearch.documents.length > 0 && (
                    <div className="p-2">
                      <p className="text-xs text-theme-muted px-2 py-1">Documentos</p>
                      {filteredSearch.documents.slice(0, 3).map(d => (
                        <button
                          key={d.id}
                          onClick={() => { setActiveTab('documents'); setSearchQuery(''); }}
                          className="w-full text-left px-2 py-2 rounded-lg hover:bg-theme-tertiary transition-colors"
                        >
                          <p className="text-sm text-theme-primary truncate">{d.title}</p>
                        </button>
                      ))}
                    </div>
                  )}
                  {filteredSearch.cases.length === 0 && filteredSearch.invoices.length === 0 && filteredSearch.documents.length === 0 && (
                    <p className="p-4 text-center text-theme-muted text-sm">No se encontraron resultados</p>
                  )}
                </motion.div>
              )}
            </div>

            {/* Theme Toggle */}
            <ThemeToggleSimple />
            {/* Notifications */}
            <div className="relative">
              <button
                onClick={() => setShowNotifications(!showNotifications)}
                className="relative p-2 text-theme-secondary hover:text-theme-primary hover:bg-theme-tertiary rounded-lg transition-colors"
              >
                <Bell className="w-5 h-5" />
                {unreadMessages > 0 && (
                  <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full animate-pulse" />
                )}
              </button>

              <AnimatePresence>
                {showNotifications && (
                  <motion.div
                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 10, scale: 0.95 }}
                    className="absolute right-0 top-full mt-2 w-96 bg-theme-secondary border border-theme rounded-2xl shadow-2xl z-50 overflow-hidden"
                  >
                    <div className="p-4 border-b border-theme flex items-center justify-between">
                      <h3 className="font-semibold text-theme-primary">Notificaciones</h3>
                      <button 
                        onClick={() => setShowNotifications(false)}
                        className="text-theme-muted hover:text-theme-primary"
                      >
                        <XCircle className="w-5 h-5" />
                      </button>
                    </div>
                    
                    {/* Notification Settings */}
                    <div className="p-3 border-b border-theme bg-theme-tertiary/30">
                      <p className="text-xs text-theme-secondary mb-2 font-medium">Preferencias de notificaciones</p>
                      <div className="flex flex-wrap gap-2">
                        <button
                          onClick={() => setNotificationSettings(s => ({ ...s, cases: !s.cases }))}
                          className={`px-2 py-1 text-xs rounded-full border transition-colors ${
                            notificationSettings.cases 
                              ? 'bg-accent/20 text-accent border-accent/30' 
                              : 'bg-theme-tertiary text-theme-muted border-theme'
                          }`}
                        >
                          Casos
                        </button>
                        <button
                          onClick={() => setNotificationSettings(s => ({ ...s, invoices: !s.invoices }))}
                          className={`px-2 py-1 text-xs rounded-full border transition-colors ${
                            notificationSettings.invoices 
                              ? 'bg-accent/20 text-accent border-accent/30' 
                              : 'bg-theme-tertiary text-theme-muted border-theme'
                          }`}
                        >
                          Facturas
                        </button>
                        <button
                          onClick={() => setNotificationSettings(s => ({ ...s, hearings: !s.hearings }))}
                          className={`px-2 py-1 text-xs rounded-full border transition-colors ${
                            notificationSettings.hearings 
                              ? 'bg-accent/20 text-accent border-accent/30' 
                              : 'bg-theme-tertiary text-theme-muted border-theme'
                          }`}
                        >
                          Audiencias
                        </button>
                        <button
                          onClick={() => setNotificationSettings(s => ({ ...s, messages: !s.messages }))}
                          className={`px-2 py-1 text-xs rounded-full border transition-colors ${
                            notificationSettings.messages 
                              ? 'bg-accent/20 text-accent border-accent/30' 
                              : 'bg-theme-tertiary text-theme-muted border-theme'
                          }`}
                        >
                          Mensajes
                        </button>
                      </div>
                      {/* Push Notifications Toggle */}
                      <div className="mt-3 pt-3 border-t border-theme">
                        <PushToggle />
                      </div>
                    </div>

                    <div className="max-h-64 overflow-y-auto">
                      {clienteMessagesData.filter(m => !m.read).slice(0, 3).map((msg) => (
                        <div
                          key={msg.id}
                          className="p-4 border-b border-theme hover:bg-theme-tertiary/50 cursor-pointer transition-colors"
                          onClick={() => { setActiveTab('messages'); setShowNotifications(false); }}
                        >
                          <div className="flex items-start gap-3">
                            <div className="w-8 h-8 bg-amber-500/20 rounded-full flex items-center justify-center text-amber-400 text-xs font-bold flex-shrink-0">
                              {msg.fromAvatar}
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium text-theme-primary">{msg.subject}</p>
                              <p className="text-xs text-theme-secondary mt-1 line-clamp-2">{msg.content}</p>
                              <p className="text-xs text-theme-muted mt-1">{msg.from}</p>
                            </div>
                            <div className="w-2 h-2 bg-accent rounded-full flex-shrink-0 mt-2" />
                          </div>
                        </div>
                      ))}
                      {unreadMessages === 0 && (
                        <div className="p-8 text-center">
                          <Bell className="w-12 h-12 text-theme-muted mx-auto mb-2" />
                          <p className="text-theme-muted text-sm">No hay notificaciones nuevas</p>
                        </div>
                      )}
                    </div>
                    <div className="p-3 border-t border-theme">
                      <button 
                        onClick={() => { setActiveTab('messages'); setShowNotifications(false); }}
                        className="w-full text-center text-sm text-accent hover:underline"
                      >
                        Ver todas las notificaciones
                      </button>
                    </div>
                    
                    {/* Email Settings Button */}
                    <div className="p-3 border-t border-theme">
                      <button 
                        onClick={() => { setShowEmailSettings(true); setShowNotifications(false); }}
                        className="w-full flex items-center justify-center gap-2 px-4 py-2 text-sm text-theme-secondary hover:text-accent hover:bg-theme-tertiary rounded-lg transition-colors"
                      >
                        <Mail className="w-4 h-4" />
                        Configurar emails
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Quick Contact Button */}
            <button
              onClick={() => setActiveTab('messages')}
              className="hidden sm:flex items-center gap-2 px-4 py-2 bg-accent text-white font-medium rounded-xl hover:bg-accent-hover transition-colors"
            >
              <MessageSquare className="w-4 h-4" />
              Contactar
            </button>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto p-6 lg:p-8">
          {renderContent()}
        </main>
      </div>

      {/* Modal: Configuración de Email */}
      <AnimatePresence>
        {showEmailSettings && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50"
            onClick={() => setShowEmailSettings(false)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="w-full max-w-lg bg-theme-secondary border border-theme rounded-2xl shadow-2xl max-h-[90vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="sticky top-0 z-10 flex items-center justify-between p-4 border-b border-theme bg-theme-secondary">
                <h2 className="text-lg font-semibold text-theme-primary">Notificaciones por Email</h2>
                <button
                  onClick={() => setShowEmailSettings(false)}
                  className="p-2 text-theme-muted hover:text-theme-primary hover:bg-theme-tertiary rounded-lg transition-colors"
                >
                  <XCircle className="w-5 h-5" />
                </button>
              </div>
              <div className="p-4">
                <EmailSettingsPanel />
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Modal: Firma Electrónica Avanzada */}
      <SignatureModal
        isOpen={signatureModalOpen}
        onClose={() => setSignatureModalOpen(false)}
        mode="sign"
        documentId={documentToSign?.id || ''}
        documentName={documentToSign?.name || ''}
        enableTimestamp={true}
        onComplete={(result) => {
          const hasTimestamp = result && 'signatures' in result && result.signatures?.some((s: {timestamp?: unknown}) => s.timestamp);
          showToast(
            hasTimestamp 
              ? 'Documento firmado con sello de tiempo RFC 3161' 
              : 'Documento firmado correctamente', 
            'success'
          );
          setSignatureModalOpen(false);
        }}
      />

      {/* Panel informativo de opciones de firma */}
      <SignatureInfoPanel
        isOpen={signatureInfoOpen}
        onClose={() => setSignatureInfoOpen(false)}
      />

      {/* Botón de ayuda de firmas */}
      <SignatureHelpButton onClick={() => setSignatureInfoOpen(true)} />

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
    </div>
  );
}

// Sub-componentes para cada vista

function DashboardView({ onNavigate }: { onNavigate: (tab: ActiveTab) => void }) {
  const pendingInvoices = clienteInvoicesData.filter(i => i.status === 'pending');
  const activeCases = clienteCasesData.filter(c => c.status === 'active' || c.status === 'pending');
  const upcomingHearings = clienteHearingsData.filter(h => new Date(h.date) > new Date());
  const unreadMessages = clienteMessagesData.filter(m => !m.read);

  const quickActions = [
    { icon: MessageSquare, label: 'Enviar mensaje', action: () => onNavigate('messages'), color: 'bg-blue-500' },
    { icon: Upload, label: 'Subir documento', action: () => onNavigate('documents'), color: 'bg-purple-500' },
    { icon: CreditCard, label: 'Pagar factura', action: () => onNavigate('invoices'), color: 'bg-emerald-500' },
    { icon: Calendar, label: 'Ver audiencias', action: () => onNavigate('hearings'), color: 'bg-amber-500' },
  ];

  return (
    <div className="space-y-6">
      {/* Welcome Banner */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gradient-to-r from-accent/20 via-accent/10 to-transparent border border-accent/20 rounded-2xl p-6 lg:p-8"
      >
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div>
            <h1 className="text-2xl lg:text-3xl font-bold text-theme-primary mb-2">
              ¡Bienvenido de nuevo, {clienteInfo.name.split(' ')[0]}!
            </h1>
            <p className="text-theme-secondary">
              Aquí tienes el resumen de tu actividad legal
            </p>
          </div>
          <div className="flex gap-3">
            {quickActions.map((action, idx) => (
              <motion.button
                key={idx}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: idx * 0.1 }}
                onClick={action.action}
                className={`flex items-center gap-2 px-4 py-2.5 ${action.color} text-white font-medium rounded-xl hover:opacity-90 transition-all shadow-lg hover:shadow-xl`}
              >
                <action.icon className="w-4 h-4" />
                <span className="hidden sm:inline">{action.label}</span>
              </motion.button>
            ))}
          </div>
        </div>
      </motion.div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="p-5 bg-theme-secondary/60 border border-theme rounded-2xl hover:border-accent/30 transition-colors cursor-pointer"
          onClick={() => onNavigate('cases')}
        >
          <div className="flex items-center justify-between mb-3">
            <div className="w-12 h-12 bg-blue-500/20 rounded-xl flex items-center justify-center">
              <FolderOpen className="w-6 h-6 text-blue-400" />
            </div>
            <TrendingUp className="w-5 h-5 text-emerald-400" />
          </div>
          <p className="text-3xl font-bold text-theme-primary">{activeCases.length}</p>
          <p className="text-sm text-theme-secondary">Casos activos</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="p-5 bg-theme-secondary/60 border border-theme rounded-2xl hover:border-accent/30 transition-colors cursor-pointer"
          onClick={() => onNavigate('invoices')}
        >
          <div className="flex items-center justify-between mb-3">
            <div className="w-12 h-12 bg-amber-500/20 rounded-xl flex items-center justify-center">
              <CreditCard className="w-6 h-6 text-amber-400" />
            </div>
            {pendingInvoices.length > 0 ? (
              <AlertCircle className="w-5 h-5 text-amber-400" />
            ) : (
              <CheckCircle className="w-5 h-5 text-emerald-400" />
            )}
          </div>
          <p className="text-3xl font-bold text-theme-primary">€{clienteFinancialSummary.totalPending.toLocaleString()}</p>
          <p className="text-sm text-theme-secondary">Facturas pendientes</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="p-5 bg-theme-secondary/60 border border-theme rounded-2xl hover:border-accent/30 transition-colors cursor-pointer"
          onClick={() => onNavigate('hearings')}
        >
          <div className="flex items-center justify-between mb-3">
            <div className="w-12 h-12 bg-purple-500/20 rounded-xl flex items-center justify-center">
              <Calendar className="w-6 h-6 text-purple-400" />
            </div>
            <Clock className="w-5 h-5 text-theme-secondary" />
          </div>
          <p className="text-3xl font-bold text-theme-primary">{upcomingHearings.length}</p>
          <p className="text-sm text-theme-secondary">Próximas audiencias</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="p-5 bg-theme-secondary/60 border border-theme rounded-2xl hover:border-accent/30 transition-colors cursor-pointer"
          onClick={() => onNavigate('messages')}
        >
          <div className="flex items-center justify-between mb-3">
            <div className="w-12 h-12 bg-emerald-500/20 rounded-xl flex items-center justify-center">
              <MessageSquare className="w-6 h-6 text-emerald-400" />
            </div>
            {unreadMessages.length > 0 && (
              <span className="w-5 h-5 bg-red-500 rounded-full flex items-center justify-center text-xs text-white font-bold">
                {unreadMessages.length}
              </span>
            )}
          </div>
          <p className="text-3xl font-bold text-theme-primary">{unreadMessages.length}</p>
          <p className="text-sm text-theme-secondary">Mensajes nuevos</p>
        </motion.div>
      </div>

      {/* Two Column Layout */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Recent Activity */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="bg-theme-secondary/60 border border-theme rounded-2xl p-6"
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-theme-primary">Actividad reciente</h3>
            <button className="text-sm text-accent hover:underline">Ver todo</button>
          </div>
          <div className="space-y-4">
            {clienteMessagesData.slice(0, 3).map((msg) => (
              <div key={msg.id} className="flex items-start gap-3 p-3 rounded-xl hover:bg-theme-tertiary/30 transition-colors cursor-pointer" onClick={() => onNavigate('messages')}>
                <div className="w-10 h-10 bg-gradient-to-br from-amber-500 to-amber-600 rounded-full flex items-center justify-center text-sm font-bold text-white flex-shrink-0">
                  {msg.fromAvatar}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-theme-primary truncate">{msg.subject}</p>
                  <p className="text-xs text-theme-secondary truncate">{msg.from}</p>
                </div>
                {!msg.read && <div className="w-2 h-2 bg-accent rounded-full flex-shrink-0 mt-2" />}
              </div>
            ))}
          </div>
        </motion.div>

        {/* Upcoming Hearings Preview */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="bg-theme-secondary/60 border border-theme rounded-2xl p-6"
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-theme-primary">Próximas audiencias</h3>
            <button className="text-sm text-accent hover:underline" onClick={() => onNavigate('hearings')}>Ver todo</button>
          </div>
          <div className="space-y-3">
            {upcomingHearings.slice(0, 2).map((hearing) => (
              <div key={hearing.id} className="flex items-center gap-4 p-3 rounded-xl bg-theme-tertiary/30">
                <div className="w-14 h-14 bg-amber-500/20 rounded-xl flex flex-col items-center justify-center flex-shrink-0">
                  <span className="text-xs text-amber-400 uppercase">{new Date(hearing.date).toLocaleDateString('es-ES', { month: 'short' })}</span>
                  <span className="text-xl font-bold text-theme-primary">{new Date(hearing.date).getDate()}</span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-theme-primary truncate">{hearing.type}</p>
                  <p className="text-xs text-theme-secondary truncate">{hearing.caseTitle}</p>
                  <p className="text-xs text-theme-muted flex items-center gap-1 mt-1">
                    <Clock className="w-3 h-3" /> {hearing.time} - {hearing.location.split(',')[0]}
                  </p>
                </div>
              </div>
            ))}
            {upcomingHearings.length === 0 && (
              <p className="text-theme-secondary text-center py-4">No hay audiencias programadas</p>
            )}
          </div>
        </motion.div>
      </div>

      {/* Financial Summary */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.7 }}
        className="bg-gradient-to-r from-emerald-500/10 to-transparent border border-emerald-500/20 rounded-2xl p-6"
      >
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 bg-emerald-500/20 rounded-2xl flex items-center justify-center">
              <DollarSign className="w-7 h-7 text-emerald-400" />
            </div>
            <div>
              <p className="text-sm text-theme-secondary">Resumen financiero</p>
              <p className="text-2xl font-bold text-theme-primary">
                €{clienteFinancialSummary.totalPaid.toLocaleString()} <span className="text-sm font-normal text-theme-secondary">de €{clienteFinancialSummary.totalBilled.toLocaleString()}</span>
              </p>
            </div>
          </div>
          <div className="flex gap-6 text-center">
            <div>
              <p className="text-2xl font-bold text-emerald-400">€{clienteFinancialSummary.totalPaid.toLocaleString()}</p>
              <p className="text-xs text-theme-secondary">Pagado</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-amber-400">€{clienteFinancialSummary.totalPending.toLocaleString()}</p>
              <p className="text-xs text-theme-secondary">Pendiente</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-red-400">€{clienteFinancialSummary.totalOverdue.toLocaleString()}</p>
              <p className="text-xs text-theme-secondary">Vencido</p>
            </div>
          </div>
          <button
            onClick={() => onNavigate('invoices')}
            className="px-6 py-3 bg-emerald-500 text-white font-semibold rounded-xl hover:bg-emerald-400 transition-colors flex items-center gap-2"
          >
            <CreditCard className="w-4 h-4" />
            Ver facturas
          </button>
        </div>
      </motion.div>
    </div>
  );
}

function CasesView({ 
  onSelectCase, 
  selectedCase,
  filters,
  setFilters
}: { 
  onSelectCase: (c: ClienteCase | null) => void, 
  selectedCase: ClienteCase | null;
  filters: { status: string; type: string; search: string };
  setFilters: React.Dispatch<React.SetStateAction<{ status: string; type: string; search: string }>>;
}) {
  const filteredCases = useMemo(() => {
    return clienteCasesData.filter(c => {
      if (filters.status !== 'all' && c.status !== filters.status) return false;
      if (filters.type !== 'all' && c.type !== filters.type) return false;
      if (filters.search && !c.title.toLowerCase().includes(filters.search.toLowerCase()) && !c.id.toLowerCase().includes(filters.search.toLowerCase())) return false;
      return true;
    });
  }, [filters]);

  const [showFilters, setShowFilters] = useState(false);
  if (selectedCase) {
    const caseTimeline = [
      { step: 'Inicio', date: '2026-01-10', completed: true, description: 'Recepción del caso' },
      { step: 'Análisis', date: '2026-01-20', completed: true, description: 'Estudio de viabilidad' },
      { step: 'Demanda', date: '2026-02-01', completed: true, description: 'Presentación judicial' },
      { step: 'Contestación', date: selectedCase.progress >= 50 ? '2026-02-15' : null, completed: selectedCase.progress >= 50, description: 'Respuesta contraria' },
      { step: 'Pruebas', date: selectedCase.progress >= 75 ? '2026-03-01' : null, completed: selectedCase.progress >= 75, description: 'Fase probatoria' },
      { step: 'Sentencia', date: null, completed: false, description: 'Resolución judicial' },
    ];
    
    return (
      <div className="space-y-6">
        <button
          onClick={() => onSelectCase(null)}
          className="flex items-center gap-2 text-theme-secondary hover:text-theme-primary transition-colors"
        >
          <ChevronRight className="w-4 h-4 rotate-180" />
          Volver a mis casos
        </button>

        <div className="bg-theme-secondary/60 border border-theme rounded-2xl p-6">
          <div className="flex items-start justify-between mb-6">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <motion.span 
                  initial={{ scale: 0.9 }}
                  animate={{ scale: 1 }}
                  className={`px-3 py-1 text-xs font-medium rounded-full border ${getCaseStatusColor(selectedCase.status)}`}
                >
                  {getCaseStatusText(selectedCase.status)}
                </motion.span>
                <span className="text-sm text-theme-secondary">{selectedCase.type}</span>
              </div>
              <h2 className="text-2xl font-bold text-theme-primary">{selectedCase.title}</h2>
              <p className="text-theme-secondary mt-1">{selectedCase.id}</p>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-gradient-to-br from-amber-500 to-amber-600 rounded-full flex items-center justify-center text-lg font-bold text-white">
                {selectedCase.lawyerAvatar}
              </div>
              <div>
                <p className="text-sm text-theme-secondary">Abogado asignado</p>
                <p className="text-theme-primary font-medium">{selectedCase.lawyer}</p>
              </div>
            </div>
          </div>

          <p className="text-theme-secondary mb-8">{selectedCase.description}</p>

          {/* Timeline Visual */}
          <div className="mb-8">
            <h3 className="text-sm font-medium text-theme-secondary mb-4">Estado del proceso</h3>
            <div className="relative">
              <div className="absolute top-5 left-0 right-0 h-1 bg-theme-tertiary rounded-full" />
              <motion.div 
                initial={{ width: 0 }}
                animate={{ width: `${selectedCase.progress}%` }}
                transition={{ duration: 1, ease: 'easeOut' }}
                className="absolute top-5 left-0 h-1 bg-gradient-to-r from-amber-500 to-emerald-500 rounded-full" 
              />
              <div className="relative flex justify-between">
                {caseTimeline.map((item, idx) => (
                  <div key={idx} className="flex flex-col items-center">
                    <motion.div
                      initial={{ scale: 0.8 }}
                      animate={{ scale: 1 }}
                      transition={{ delay: idx * 0.1 }}
                      className={`w-10 h-10 rounded-full flex items-center justify-center z-10 ${
                        item.completed 
                          ? 'bg-emerald-500 text-white' 
                          : 'bg-theme-tertiary text-theme-muted border-2 border-theme'
                      }`}
                    >
                      {item.completed ? (
                        <CheckCircle className="w-5 h-5" />
                      ) : (
                        <span className="text-xs font-medium">{idx + 1}</span>
                      )}
                    </motion.div>
                    <p className="mt-2 text-xs font-medium text-theme-primary text-center">{item.step}</p>
                    {item.date && (
                      <p className="text-xs text-theme-muted">{new Date(item.date).toLocaleDateString('es-ES', { day: 'numeric', month: 'short' })}</p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="p-4 bg-theme-tertiary/50 rounded-xl">
              <p className="text-xs text-theme-secondary">Última actualización</p>
              <p className="text-theme-primary font-medium">{new Date(selectedCase.lastUpdate).toLocaleDateString('es-ES')}</p>
            </div>
            {selectedCase.nextHearing && (
              <div className="p-4 bg-theme-tertiary/50 rounded-xl">
                <p className="text-xs text-theme-secondary">Próxima audiencia</p>
                <p className="text-theme-primary font-medium">{new Date(selectedCase.nextHearing).toLocaleDateString('es-ES')}</p>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Filters Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl border transition-colors ${
              showFilters || filters.status !== 'all' || filters.type !== 'all'
                ? 'bg-accent text-white border-accent'
                : 'bg-theme-secondary border-theme text-theme-secondary hover:text-theme-primary'
            }`}
          >
            <Filter className="w-4 h-4" />
            Filtros
            {(filters.status !== 'all' || filters.type !== 'all') && (
              <span className="w-5 h-5 bg-white/20 rounded-full text-xs flex items-center justify-center">
                {(filters.status !== 'all' ? 1 : 0) + (filters.type !== 'all' ? 1 : 0)}
              </span>
            )}
          </button>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-theme-muted" />
            <input
              type="text"
              placeholder="Buscar casos..."
              value={filters.search}
              onChange={(e) => setFilters(f => ({ ...f, search: e.target.value }))}
              className="pl-10 pr-4 py-2.5 bg-theme-secondary border border-theme rounded-xl text-theme-primary placeholder-theme-muted focus:outline-none focus:border-accent/50 w-64"
            />
          </div>
        </div>
        <div className="text-sm text-theme-secondary">
          {filteredCases.length} caso{filteredCases.length !== 1 ? 's' : ''} encontrado{filteredCases.length !== 1 ? 's' : ''}
        </div>
      </div>

      {/* Expanded Filters Panel */}
      <AnimatePresence>
        {showFilters && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="bg-theme-secondary/60 border border-theme rounded-xl p-4"
          >
            <div className="flex flex-wrap gap-4">
              <div>
                <label className="block text-xs text-theme-secondary mb-2">Estado</label>
                <select
                  value={filters.status}
                  onChange={(e) => setFilters(f => ({ ...f, status: e.target.value }))}
                  className="bg-theme-tertiary border border-theme rounded-lg px-3 py-2 text-theme-primary text-sm focus:outline-none focus:border-accent"
                >
                  <option value="all">Todos los estados</option>
                  <option value="active">Activo</option>
                  <option value="pending">Pendiente</option>
                  <option value="closed">Cerrado</option>
                  <option value="urgent">Urgente</option>
                </select>
              </div>
              <div>
                <label className="block text-xs text-theme-secondary mb-2">Tipo de caso</label>
                <select
                  value={filters.type}
                  onChange={(e) => setFilters(f => ({ ...f, type: e.target.value }))}
                  className="bg-theme-tertiary border border-theme rounded-lg px-3 py-2 text-theme-primary text-sm focus:outline-none focus:border-accent"
                >
                  <option value="all">Todos los tipos</option>
                  <option value="Civil">Civil</option>
                  <option value="Familiar">Familiar</option>
                  <option value="Mercantil">Mercantil</option>
                  <option value="Penal">Penal</option>
                  <option value="Laboral">Laboral</option>
                </select>
              </div>
              <div className="flex items-end">
                <button
                  onClick={() => setFilters({ status: 'all', type: 'all', search: '' })}
                  className="px-4 py-2 text-sm text-theme-secondary hover:text-theme-primary transition-colors"
                >
                  Limpiar filtros
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="p-4 bg-theme-secondary/60 border border-theme rounded-xl">
          <p className="text-2xl font-bold text-theme-primary">{filteredCases.length}</p>
          <p className="text-sm text-theme-secondary">Total casos</p>
        </div>
        <div className="p-4 bg-theme-secondary/60 border border-theme rounded-xl">
          <p className="text-2xl font-bold text-emerald-400">{filteredCases.filter(c => c.status === 'active').length}</p>
          <p className="text-sm text-theme-secondary">Activos</p>
        </div>
        <div className="p-4 bg-theme-secondary/60 border border-theme rounded-xl">
          <p className="text-2xl font-bold text-amber-400">{filteredCases.filter(c => c.status === 'pending').length}</p>
          <p className="text-sm text-theme-secondary">Pendientes</p>
        </div>
        <div className="p-4 bg-theme-secondary/60 border border-theme rounded-xl">
          <p className="text-2xl font-bold text-theme-tertiary">{filteredCases.filter(c => c.status === 'closed').length}</p>
          <p className="text-sm text-theme-secondary">Cerrados</p>
        </div>
      </div>

      {/* Cases List */}
      <div className="grid gap-4">
        {filteredCases.map((caseItem, index) => (
          <motion.div
            key={caseItem.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
            onClick={() => onSelectCase(caseItem)}
            className="p-6 bg-theme-secondary/60 border border-theme rounded-2xl cursor-pointer hover:border-accent/50 transition-colors group"
          >
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <span className={`px-3 py-1 text-xs font-medium rounded-full border ${getCaseStatusColor(caseItem.status)}`}>
                    {getCaseStatusText(caseItem.status)}
                  </span>
                  <span className="text-xs text-theme-muted">{caseItem.type}</span>
                  <span className="text-xs text-theme-muted">{caseItem.id}</span>
                </div>
                <h3 className="text-lg font-semibold text-theme-primary group-hover:text-accent transition-colors">{caseItem.title}</h3>
                <p className="text-sm text-theme-secondary mt-1">{caseItem.description}</p>

                <div className="flex items-center gap-6 mt-4">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 bg-gradient-to-br from-theme-tertiary to-theme-secondary rounded-full flex items-center justify-center text-xs font-medium text-theme-secondary">
                      {caseItem.lawyerAvatar}
                    </div>
                    <span className="text-sm text-theme-secondary">{caseItem.lawyer}</span>
                  </div>
                  {caseItem.nextHearing && (
                    <div className="flex items-center gap-2 text-sm text-theme-secondary">
                      <Calendar className="w-4 h-4" />
                      Próxima audiencia: {new Date(caseItem.nextHearing).toLocaleDateString('es-ES')}
                    </div>
                  )}
                </div>
              </div>

              <div className="text-right ml-4">
                <div className="text-2xl font-bold text-theme-primary">{caseItem.progress}%</div>
                <div className="text-xs text-theme-secondary">Progreso</div>
              </div>
            </div>

            <div className="mt-4 h-2 bg-theme-tertiary rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full ${
                  caseItem.progress === 100 ? 'bg-emerald-500' :
                  caseItem.progress > 50 ? 'bg-amber-500' : 'bg-blue-500'
                }`}
                style={{ width: `${caseItem.progress}%` }}
              />
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}

function InvoicesView({
  onSelectInvoice,
  selectedInvoice,
  onDownloadInvoice,
  onPayInvoice,
  filters,
  setFilters,
  onOpenSignatureModal
}: {
  onSelectInvoice: (i: ClienteInvoice | null) => void,
  selectedInvoice: ClienteInvoice | null,
  onDownloadInvoice: (id: string) => void,
  onPayInvoice: (id: string) => void,
  filters: { status: string; dateRange: string; search: string };
  setFilters: React.Dispatch<React.SetStateAction<{ status: string; dateRange: string; search: string }>>;
  onOpenSignatureModal?: (docId: string, docName: string) => void
}) {
  const filteredInvoices = useMemo(() => {
    return clienteInvoicesData.filter(inv => {
      if (filters.status !== 'all' && inv.status !== filters.status) return false;
      if (filters.search && !inv.id.toLowerCase().includes(filters.search.toLowerCase()) && !inv.caseTitle.toLowerCase().includes(filters.search.toLowerCase())) return false;
      if (filters.dateRange !== 'all') {
        const invoiceDate = new Date(inv.issueDate);
        const now = new Date();
        if (filters.dateRange === 'last30') {
          const thirtyDaysAgo = new Date(now.setDate(now.getDate() - 30));
          if (invoiceDate < thirtyDaysAgo) return false;
        } else if (filters.dateRange === 'last90') {
          const ninetyDaysAgo = new Date(now.setDate(now.getDate() - 90));
          if (invoiceDate < ninetyDaysAgo) return false;
        } else if (filters.dateRange === 'thisYear') {
          if (invoiceDate.getFullYear() !== new Date().getFullYear()) return false;
        }
      }
      return true;
    });
  }, [filters]);

  const [showFilters, setShowFilters] = useState(false);
  if (selectedInvoice) {
    return (
      <div className="space-y-6">
        <button
          onClick={() => onSelectInvoice(null)}
          className="flex items-center gap-2 text-theme-secondary hover:text-theme-primary transition-colors"
        >
          <ChevronRight className="w-4 h-4 rotate-180" />
          Volver a facturas
        </button>

        <div className="bg-theme-secondary/60 border border-theme rounded-2xl p-8">
          <div className="flex items-start justify-between mb-8">
            <div>
              <span className={`px-3 py-1 text-xs font-medium rounded-full border ${getInvoiceStatusColor(selectedInvoice.status)}`}>
                {getInvoiceStatusText(selectedInvoice.status)}
              </span>
              <h2 className="text-3xl font-bold text-theme-primary mt-4">{selectedInvoice.id}</h2>
              <p className="text-theme-secondary mt-1">{selectedInvoice.concept}</p>
            </div>
            <div className="text-right">
              <p className="text-4xl font-bold text-theme-primary">€{selectedInvoice.amount.toLocaleString()}</p>
              <p className="text-theme-secondary">{selectedInvoice.caseTitle}</p>
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            <div className="p-4 bg-theme-tertiary/50 rounded-xl">
              <p className="text-xs text-theme-secondary">Fecha de emisión</p>
              <p className="text-theme-primary font-medium">{new Date(selectedInvoice.issueDate).toLocaleDateString('es-ES')}</p>
            </div>
            <div className="p-4 bg-theme-tertiary/50 rounded-xl">
              <p className="text-xs text-theme-secondary">Fecha de vencimiento</p>
              <p className="text-theme-primary font-medium">{new Date(selectedInvoice.dueDate).toLocaleDateString('es-ES')}</p>
            </div>
            {selectedInvoice.paidDate && (
              <div className="p-4 bg-theme-tertiary/50 rounded-xl">
                <p className="text-xs text-theme-secondary">Fecha de pago</p>
                <p className="text-emerald-400 font-medium">{new Date(selectedInvoice.paidDate).toLocaleDateString('es-ES')}</p>
              </div>
            )}
          </div>

          {selectedInvoice.status === 'pending' && (
            <div className="flex flex-col gap-3">
              <div className="flex gap-4">
                <button
                  onClick={() => onPayInvoice(selectedInvoice.id)}
                  className="flex-1 py-3 bg-emerald-500 text-white font-semibold rounded-xl hover:bg-emerald-400 transition-colors"
                >
                  Pagar ahora
                </button>
                <button
                  onClick={() => onDownloadInvoice(selectedInvoice.id)}
                  className="px-6 py-3 bg-theme-tertiary text-theme-primary rounded-xl hover:bg-theme-hover transition-colors"
                >
                  Descargar PDF
                </button>
              </div>
              {/* Botón para firmar aceptación de presupuesto */}
              {onOpenSignatureModal && (
                <button
                  onClick={() => onOpenSignatureModal(selectedInvoice.id, `Factura_${selectedInvoice.id}.pdf`)}
                  className="w-full py-3 bg-purple-500/10 text-purple-400 border border-purple-500/20 font-semibold rounded-xl hover:bg-purple-500/20 transition-colors flex items-center justify-center gap-2"
                >
                  <FileSignature className="w-5 h-5" />
                  Firmar aceptación del presupuesto
                </button>
              )}
            </div>
          )}
          {selectedInvoice.status === 'paid' && (
            <button
              onClick={() => onDownloadInvoice(selectedInvoice.id)}
              className="px-6 py-3 bg-theme-tertiary text-theme-primary rounded-xl hover:bg-theme-hover transition-colors flex items-center gap-2"
            >
              <Download className="w-4 h-4" />
              Descargar recibo
            </button>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Filters Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl border transition-colors ${
              showFilters || filters.status !== 'all' || filters.dateRange !== 'all'
                ? 'bg-accent text-white border-accent'
                : 'bg-theme-secondary border-theme text-theme-secondary hover:text-theme-primary'
            }`}
          >
            <Filter className="w-4 h-4" />
            Filtros
            {(filters.status !== 'all' || filters.dateRange !== 'all') && (
              <span className="w-5 h-5 bg-white/20 rounded-full text-xs flex items-center justify-center">
                {(filters.status !== 'all' ? 1 : 0) + (filters.dateRange !== 'all' ? 1 : 0)}
              </span>
            )}
          </button>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-theme-muted" />
            <input
              type="text"
              placeholder="Buscar facturas..."
              value={filters.search}
              onChange={(e) => setFilters(f => ({ ...f, search: e.target.value }))}
              className="pl-10 pr-4 py-2.5 bg-theme-secondary border border-theme rounded-xl text-theme-primary placeholder-theme-muted focus:outline-none focus:border-accent/50 w-64"
            />
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button className="flex items-center gap-2 px-4 py-2.5 bg-theme-secondary border border-theme text-theme-secondary rounded-xl hover:text-theme-primary transition-colors">
            <Download className="w-4 h-4" />
            Exportar
          </button>
        </div>
      </div>

      {/* Expanded Filters Panel */}
      <AnimatePresence>
        {showFilters && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="bg-theme-secondary/60 border border-theme rounded-xl p-4"
          >
            <div className="flex flex-wrap gap-4">
              <div>
                <label className="block text-xs text-theme-secondary mb-2">Estado</label>
                <select
                  value={filters.status}
                  onChange={(e) => setFilters(f => ({ ...f, status: e.target.value }))}
                  className="bg-theme-tertiary border border-theme rounded-lg px-3 py-2 text-theme-primary text-sm focus:outline-none focus:border-accent"
                >
                  <option value="all">Todos</option>
                  <option value="paid">Pagada</option>
                  <option value="pending">Pendiente</option>
                  <option value="overdue">Vencida</option>
                </select>
              </div>
              <div>
                <label className="block text-xs text-theme-secondary mb-2">Fecha</label>
                <select
                  value={filters.dateRange}
                  onChange={(e) => setFilters(f => ({ ...f, dateRange: e.target.value }))}
                  className="bg-theme-tertiary border border-theme rounded-lg px-3 py-2 text-theme-primary text-sm focus:outline-none focus:border-accent"
                >
                  <option value="all">Todas las fechas</option>
                  <option value="last30">Últimos 30 días</option>
                  <option value="last90">Últimos 90 días</option>
                  <option value="thisYear">Este año</option>
                </select>
              </div>
              <div className="flex items-end">
                <button
                  onClick={() => setFilters({ status: 'all', dateRange: 'all', search: '' })}
                  className="px-4 py-2 text-sm text-theme-secondary hover:text-theme-primary transition-colors"
                >
                  Limpiar filtros
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Financial Summary */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="p-4 bg-theme-secondary/60 border border-theme rounded-xl">
          <p className="text-2xl font-bold text-theme-primary">€{clienteFinancialSummary.totalBilled.toLocaleString()}</p>
          <p className="text-sm text-theme-secondary">Total facturado</p>
        </div>
        <div className="p-4 bg-theme-secondary/60 border border-theme rounded-xl">
          <p className="text-2xl font-bold text-emerald-400">€{clienteFinancialSummary.totalPaid.toLocaleString()}</p>
          <p className="text-sm text-theme-secondary">Total pagado</p>
        </div>
        <div className="p-4 bg-theme-secondary/60 border border-theme rounded-xl">
          <p className="text-2xl font-bold text-amber-400">€{clienteFinancialSummary.totalPending.toLocaleString()}</p>
          <p className="text-sm text-theme-secondary">Pendiente</p>
        </div>
        <div className="p-4 bg-theme-secondary/60 border border-theme rounded-xl">
          <p className="text-2xl font-bold text-red-400">€{clienteFinancialSummary.totalOverdue.toLocaleString()}</p>
          <p className="text-sm text-theme-secondary">Vencido</p>
        </div>
      </div>

      {/* Invoices List */}
      <div className="bg-theme-secondary/60 border border-theme rounded-2xl overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b border-theme bg-theme-secondary/80">
              <th className="text-left py-4 px-6 text-xs font-medium text-theme-secondary uppercase">Factura</th>
              <th className="text-left py-4 px-6 text-xs font-medium text-theme-secondary uppercase">Caso</th>
              <th className="text-left py-4 px-6 text-xs font-medium text-theme-secondary uppercase">Importe</th>
              <th className="text-left py-4 px-6 text-xs font-medium text-theme-secondary uppercase">Estado</th>
              <th className="text-left py-4 px-6 text-xs font-medium text-theme-secondary uppercase">Vencimiento</th>
              <th className="text-left py-4 px-6 text-xs font-medium text-theme-secondary uppercase">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {filteredInvoices.map((invoice) => (
              <tr
                key={invoice.id}
                onClick={() => onSelectInvoice(invoice)}
                className="border-b border-theme/50 hover:bg-theme-tertiary/30 transition-colors cursor-pointer"
              >
                <td className="py-4 px-6">
                  <p className="text-sm font-medium text-theme-primary">{invoice.id}</p>
                  <p className="text-xs text-theme-muted">{invoice.concept}</p>
                </td>
                <td className="py-4 px-6">
                  <p className="text-sm text-theme-secondary">{invoice.caseTitle}</p>
                </td>
                <td className="py-4 px-6">
                  <p className="text-sm font-bold text-theme-primary">€{invoice.amount.toLocaleString()}</p>
                </td>
                <td className="py-4 px-6">
                  <span className={`px-3 py-1 text-xs font-medium rounded-full border ${getInvoiceStatusColor(invoice.status)}`}>
                    {getInvoiceStatusText(invoice.status)}
                  </span>
                </td>
                <td className="py-4 px-6">
                  <p className="text-sm text-theme-secondary">{new Date(invoice.dueDate).toLocaleDateString('es-ES')}</p>
                </td>
                <td className="py-4 px-6">
                  <div className="flex items-center gap-2">
                    <button
                      onClick={(e) => { e.stopPropagation(); onSelectInvoice(invoice); }}
                      className="p-2 text-theme-secondary hover:text-accent hover:bg-accent/10 rounded-lg transition-colors"
                    >
                      <Eye className="w-4 h-4" />
                    </button>
                    <button
                      onClick={(e) => { e.stopPropagation(); onDownloadInvoice(invoice.id); }}
                      className="p-2 text-theme-secondary hover:text-theme-primary hover:bg-theme-tertiary rounded-lg transition-colors"
                    >
                      <Download className="w-4 h-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function DocumentsView({
  onDownloadDocument,
  onUploadDocument,
  filters,
  setFilters,
  onOpenSignatureModal
}: {
  onDownloadDocument: (title: string) => void;
  onUploadDocument: () => void;
  filters: { type: string; search: string };
  setFilters: React.Dispatch<React.SetStateAction<{ type: string; search: string }>>;
  onOpenSignatureModal?: (docId: string, docName: string) => void;
}) {
  const filteredDocs = useMemo(() => {
    return clienteDocumentsData.filter(d => {
      if (filters.type !== 'all' && d.type !== filters.type) return false;
      if (filters.search && !d.title.toLowerCase().includes(filters.search.toLowerCase())) return false;
      return true;
    });
  }, [filters]);

  const [showFilters, setShowFilters] = useState(false);
  
  const getAllDocumentsAsFiles = (): File[] => {
    return [];
  };

  return (
    <div className="space-y-6">
      {/* Filters Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl border transition-colors ${
              showFilters || filters.type !== 'all'
                ? 'bg-accent text-white border-accent'
                : 'bg-theme-secondary border-theme text-theme-secondary hover:text-theme-primary'
            }`}
          >
            <Filter className="w-4 h-4" />
            Filtros
            {filters.type !== 'all' && (
              <span className="w-5 h-5 bg-white/20 rounded-full text-xs flex items-center justify-center">1</span>
            )}
          </button>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-theme-muted" />
            <input
              type="text"
              placeholder="Buscar documentos..."
              value={filters.search}
              onChange={(e) => setFilters(f => ({ ...f, search: e.target.value }))}
              className="pl-10 pr-4 py-2.5 bg-theme-secondary border border-theme rounded-xl text-theme-primary placeholder-theme-muted focus:outline-none focus:border-accent/50 w-64"
            />
          </div>
        </div>
        <div className="text-sm text-theme-secondary">
          {filteredDocs.length} documento{filteredDocs.length !== 1 ? 's' : ''}
        </div>
      </div>

      {/* Expanded Filters Panel */}
      <AnimatePresence>
        {showFilters && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="bg-theme-secondary/60 border border-theme rounded-xl p-4"
          >
            <div className="flex flex-wrap gap-4">
              <div>
                <label className="block text-xs text-theme-secondary mb-2">Tipo de documento</label>
                <select
                  value={filters.type}
                  onChange={(e) => setFilters(f => ({ ...f, type: e.target.value }))}
                  className="bg-theme-tertiary border border-theme rounded-lg px-3 py-2 text-theme-primary text-sm focus:outline-none focus:border-accent"
                >
                  <option value="all">Todos los tipos</option>
                  <option value="contract">Contratos</option>
                  <option value="court">Judiciales</option>
                  <option value="evidence">Evidencias</option>
                  <option value="invoice">Facturas</option>
                </select>
              </div>
              <div className="flex items-end">
                <button
                  onClick={() => setFilters({ type: 'all', search: '' })}
                  className="px-4 py-2 text-sm text-theme-secondary hover:text-theme-primary transition-colors"
                >
                  Limpiar filtros
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Header con botón de compresión */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h3 className="text-lg font-semibold text-theme-primary">Mis Documentos</h3>
          <p className="text-sm text-theme-secondary">
            {filteredDocs.length} documentos disponibles
          </p>
        </div>
        <CompressButton
          files={getAllDocumentsAsFiles()}
          defaultFilename={`Mis_Documentos_${new Date().toISOString().split('T')[0]}`}
          variant="secondary"
          label="📦 Descargar todos"
          onSuccess={() => console.log('Documentos descargados')}
          onError={(err) => console.error('Error:', err)}
        />
      </div>

      {/* Documents Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredDocs.map((doc, index) => (
          <motion.div
            key={doc.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
            className="p-4 bg-theme-secondary/60 border border-theme rounded-xl hover:border-accent/30 transition-colors group"
          >
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 bg-theme-tertiary rounded-xl flex items-center justify-center flex-shrink-0">
                <FileText className="w-6 h-6 text-accent" />
              </div>
              <div className="flex-1 min-w-0">
                <h4 className="font-medium text-theme-primary truncate group-hover:text-accent transition-colors">
                  {doc.title}
                </h4>
                {doc.caseTitle && (
                  <p className="text-xs text-theme-secondary mt-1">{doc.caseTitle}</p>
                )}
                <div className="flex items-center gap-3 mt-2 text-xs text-theme-muted">
                  <span>{doc.size}</span>
                  <span>•</span>
                  <span>{new Date(doc.uploadedAt).toLocaleDateString('es-ES')}</span>
                </div>
              </div>
            </div>
            <div className="flex items-center justify-between mt-4 pt-4 border-t border-theme">
              <span className="text-xs text-theme-secondary">Subido por {doc.uploadedBy}</span>
              <div className="flex items-center gap-2">
                {/* Botón de firma para documentos que requieren firma */}
                {onOpenSignatureModal && (doc.type === 'contract' || doc.title.toLowerCase().includes('contrato') || doc.title.toLowerCase().includes('firma')) && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onOpenSignatureModal(doc.id, doc.title);
                    }}
                    className="flex items-center gap-2 px-3 py-1.5 bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20 border border-emerald-500/20 rounded-lg transition-colors text-sm"
                  >
                    <Pen className="w-3.5 h-3.5" />
                    Firmar
                  </button>
                )}
                <button
                  onClick={() => onDownloadDocument(doc.title)}
                  className="p-2 text-theme-secondary hover:text-accent hover:bg-accent/10 rounded-lg transition-colors"
                >
                  <Download className="w-4 h-4" />
                </button>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Upload Area */}
      <button
        onClick={onUploadDocument}
        className="w-full p-8 bg-theme-secondary/30 border-2 border-dashed border-theme rounded-2xl text-center hover:border-accent/30 transition-colors"
      >
        <Upload className="w-12 h-12 text-theme-muted mx-auto mb-4" />
        <p className="text-theme-primary font-medium mb-2">Arrastra archivos aquí o haz clic para subir</p>
        <p className="text-sm text-theme-secondary">PDF, Word, Excel hasta 10MB</p>
      </button>
    </div>
  );
}

function MessagesView({ 
  canSendMessages,
  onSendMessage
}: { 
  canSendMessages: boolean;
  onSendMessage: (content: string) => void;
}) {
  const [selectedMsg, setSelectedMsg] = useState<ClienteMessage | null>(null);
  const [replyText, setReplyText] = useState('');
  const [messages, setMessages] = useState<ClienteMessage[]>(clienteMessagesData);

  const handleSendReply = () => {
    if (!replyText.trim()) return;
    onSendMessage(replyText);
    setReplyText('');
    setSelectedMsg(null);
    // Marcar como leído
    if (selectedMsg) {
      setMessages(prev => prev.map(m => m.id === selectedMsg.id ? { ...m, read: true } : m));
    }
  };

  if (selectedMsg) {
    return (
      <div className="space-y-6">
        <button
          onClick={() => setSelectedMsg(null)}
          className="flex items-center gap-2 text-theme-secondary hover:text-theme-primary transition-colors"
        >
          <ChevronRight className="w-4 h-4 rotate-180" />
          Volver a mensajes
        </button>

        <div className="bg-theme-secondary/60 border border-theme rounded-2xl p-6">
          <div className="flex items-start gap-4 mb-6 pb-6 border-b border-theme">
            <div className="w-12 h-12 bg-gradient-to-br from-amber-500 to-amber-600 rounded-full flex items-center justify-center text-lg font-bold text-white">
              {selectedMsg.fromAvatar}
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-1">
                <h3 className="font-semibold text-theme-primary">{selectedMsg.from}</h3>
                <span className="text-xs text-theme-muted">{selectedMsg.fromRole}</span>
              </div>
              <p className="text-lg text-theme-primary font-medium">{selectedMsg.subject}</p>
              <p className="text-xs text-theme-secondary mt-1">
                {new Date(selectedMsg.timestamp).toLocaleString('es-ES')}
              </p>
            </div>
            {selectedMsg.caseTitle && (
              <span className="px-3 py-1 bg-theme-tertiary text-theme-secondary text-xs rounded-full">
                {selectedMsg.caseTitle}
              </span>
            )}
          </div>

          <div className="prose prose-invert max-w-none mb-8">
            <p className="text-theme-secondary leading-relaxed">{selectedMsg.content}</p>
          </div>

          {/* Reply Form */}
          {canSendMessages && (
            <div className="bg-theme-tertiary/50 rounded-xl p-4">
              <textarea
                value={replyText}
                onChange={(e) => setReplyText(e.target.value)}
                placeholder="Escribe tu respuesta..."
                className="w-full bg-transparent text-theme-primary placeholder-theme-muted resize-none focus:outline-none"
                rows={4}
              />
              <div className="flex justify-end mt-4">
                <button
                  onClick={handleSendReply}
                  disabled={!replyText.trim()}
                  className="flex items-center gap-2 px-4 py-2 bg-accent text-white font-medium rounded-xl hover:bg-accent-hover transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Send className="w-4 h-4" />
                  Enviar respuesta
                </button>
              </div>
            </div>
          )}
          {!canSendMessages && (
            <div className="p-4 bg-theme-tertiary/30 border border-theme rounded-xl">
              <p className="text-sm text-theme-secondary text-center">
                Tu rol no tiene permisos para enviar mensajes desde el portal del cliente.
              </p>
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {messages.map((msg, index) => (
        <motion.div
          key={msg.id}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.05 }}
          onClick={() => setSelectedMsg(msg)}
          className={`p-4 bg-theme-secondary/60 border rounded-2xl cursor-pointer hover:border-accent/30 transition-colors ${
            !msg.read ? 'border-accent/30 bg-accent/5' : 'border-theme'
          }`}
        >
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 bg-gradient-to-br from-theme-tertiary to-theme-secondary rounded-full flex items-center justify-center text-lg font-medium text-theme-secondary border border-theme">
              {msg.fromAvatar}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-3 mb-1">
                <h4 className="font-medium text-theme-primary">{msg.from}</h4>
                <span className="text-xs text-theme-muted">{msg.fromRole}</span>
                {!msg.read && (
                  <span className="w-2 h-2 bg-accent rounded-full" />
                )}
              </div>
              <p className="text-theme-primary font-medium mb-1">{msg.subject}</p>
              <p className="text-sm text-theme-secondary line-clamp-2">{msg.content}</p>
              <div className="flex items-center gap-3 mt-2">
                <span className="text-xs text-theme-muted">
                  {new Date(msg.timestamp).toLocaleString('es-ES')}
                </span>
                {msg.caseTitle && (
                  <span className="text-xs px-2 py-0.5 bg-theme-tertiary text-theme-secondary rounded-full">
                    {msg.caseTitle}
                  </span>
                )}
              </div>
            </div>
          </div>
        </motion.div>
      ))}
    </div>
  );
}

function HearingsView() {
  return (
    <div className="space-y-6">
      {/* Upcoming Summary */}
      <div className="p-6 bg-gradient-to-r from-amber-500/10 to-amber-600/10 border border-amber-500/20 rounded-2xl">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 bg-amber-500/20 rounded-2xl flex items-center justify-center">
            <Calendar className="w-8 h-8 text-amber-500" />
          </div>
          <div>
            <p className="text-3xl font-bold text-theme-primary">{clienteHearingsData.length}</p>
            <p className="text-theme-secondary">Audiencias programadas</p>
          </div>
        </div>
      </div>

      {/* Hearings List */}
      <div className="space-y-4">
        {clienteHearingsData.map((hearing, index) => (
          <motion.div
            key={hearing.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
            className="p-6 bg-theme-secondary/60 border border-theme rounded-2xl"
          >
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="flex items-start gap-4">
                <div className="w-16 h-16 bg-theme-tertiary rounded-2xl flex flex-col items-center justify-center flex-shrink-0">
                  <span className="text-xs text-theme-secondary uppercase">
                    {new Date(hearing.date).toLocaleDateString('es-ES', { month: 'short' })}
                  </span>
                  <span className="text-2xl font-bold text-theme-primary">
                    {new Date(hearing.date).getDate()}
                  </span>
                </div>
                <div>
                  <h3 className="font-semibold text-theme-primary text-lg">{hearing.type}</h3>
                  <p className="text-theme-secondary">{hearing.caseTitle}</p>
                  <div className="flex items-center gap-4 mt-2 text-sm text-theme-secondary">
                    <span className="flex items-center gap-1">
                      <Clock className="w-4 h-4" />
                      {hearing.time}
                    </span>
                    <span className="flex items-center gap-1">
                      <User className="w-4 h-4" />
                      {hearing.lawyer}
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2 md:text-right">
                <div className="px-4 py-2 bg-theme-tertiary rounded-xl">
                  <p className="text-xs text-theme-secondary">Ubicación</p>
                  <p className="text-sm text-theme-primary">{hearing.location}</p>
                </div>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Info Box */}
      <div className="p-4 bg-blue-500/10 border border-blue-500/20 rounded-xl">
        <div className="flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-blue-400 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-medium text-blue-400">Información importante</p>
            <p className="text-sm text-theme-secondary mt-1">
              Le recomendamos llegar 30 minutos antes de la hora programada.
              Traiga identificación oficial y todos los documentos relacionados con su caso.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

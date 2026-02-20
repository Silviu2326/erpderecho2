import { useState, useMemo, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Plus, Send, Paperclip, Smile, Phone, Video, MoreVertical, 
  CheckCheck, Search, Users, Gavel, X, Check,
  Briefcase, Shield, Eye, Lock, FileText, Image, File,
  MessageSquare, Bell, Archive, Trash2, Flag, Volume2, VolumeX,
  CheckCircle, Info, PhoneCall, Video as VideoIcon, Calendar,
  Pen
} from 'lucide-react';
import { AppLayout } from '@/components/layout/AppLayout';
import { conversations as allConversations, messages as initialMessages } from '@/data/mensajesData';
import { useRole } from '@/hooks/useRole';
import type { UserRole } from '@/types/roles';
import { SignatureModal, useSignature } from '@/components/signature';

// Tipos
interface Message {
  id: number;
  sender: 'me' | 'other';
  text: string;
  time: string;
  status?: 'sent' | 'delivered' | 'read';
  attachments?: { name: string; size: string; type: string }[];
}

interface Conversation {
  id: number;
  name: string;
  avatar: string;
  lastMessage: string;
  time: string;
  unread: number;
  online: boolean;
  type: string;
  case?: string;
  archived?: boolean;
  muted?: boolean;
}

type ModalType = 'new' | 'archived' | 'attachments' | 'emoji' | 'more' | 'call' | 'video' | 'sign' | null;

// ============================================
// DATOS SIMULADOS POR ROL
// ============================================

// Conversaciones filtradas según el rol
const getConversacionesPorRol = (role: UserRole) => {
  switch (role) {
    case 'super_admin':
    case 'socio':
    case 'administrador':
      // Acceso a todas las conversaciones + pueden ver mensajes del equipo
      return {
        conversaciones: allConversations,
        puedeVerTodas: true,
        puedeMonitorear: true,
        filtrosAdicionales: ['team', 'court', 'system']
      };
    
    case 'abogado_senior':
    case 'abogado_junior':
      // Solo sus conversaciones (simulado: todas menos algunas de otros)
      return {
        conversaciones: allConversations.filter(c => 
          c.type === 'client' || 
          (c.type === 'colleague' && c.name.includes('Ana')) ||
          (c.type === 'colleague' && c.name.includes('Laura'))
        ),
        puedeVerTodas: false,
        puedeMonitorear: false,
        filtrosAdicionales: ['client', 'colleague']
      };
    
    case 'paralegal':
      // Mensajes relacionados con su trabajo
      return {
        conversaciones: allConversations.filter(c => 
          c.name.includes('Laura') || // Compañeros
          c.name.includes('Martínez') ||
          c.type === 'court' ||
          (c.case && ['EXP-2024-002', 'EXP-2024-004'].includes(c.case))
        ),
        puedeVerTodas: false,
        puedeMonitorear: false,
        filtrosAdicionales: ['colleague', 'court']
      };
    
    case 'secretario':
    case 'recepcionista':
      // Mensajes relacionados con su trabajo + pueden enviar a todos (limitado)
      return {
        conversaciones: allConversations.filter(c => 
          c.type === 'client' ||
          c.type === 'court' ||
          c.name.includes('Soto')
        ),
        puedeVerTodas: false,
        puedeMonitorear: false,
        filtrosAdicionales: ['client', 'court'],
        envioLimitado: true
      };
    
    case 'contador':
      // Acceso a mensajes relacionados con facturación/contabilidad
      return {
        conversaciones: allConversations.filter(c => 
          c.name.includes('TechCorp') ||
          c.name.includes('Juzgado') ||
          c.type === 'court'
        ),
        puedeVerTodas: false,
        puedeMonitorear: false,
        filtrosAdicionales: ['court']
      };
    
    default:
      return {
        conversaciones: allConversations,
        puedeVerTodas: false,
        puedeMonitorear: false,
        filtrosAdicionales: []
      };
  }
};

// Configuración de vistas por rol
const getConfigPorRol = (role: UserRole) => {
  const configs: Record<UserRole, {
    title: string;
    subtitle: string;
    puedeCrearHilo: boolean;
    puedeAdjuntar: boolean;
    puedeArchivar: boolean;
    puedeBuscar: boolean;
    puedeVideollamada: boolean;
    puedeVerEstado: boolean;
    mensajePlaceholder: string;
    mensajeBienvenida: string;
    mostrarNotificaciones: boolean;
  }> = {
    super_admin: {
      title: 'Centro de Mensajes',
      subtitle: 'Gestión de todas las comunicaciones',
      puedeCrearHilo: true,
      puedeAdjuntar: true,
      puedeArchivar: true,
      puedeBuscar: true,
      puedeVideollamada: true,
      puedeVerEstado: true,
      mensajePlaceholder: 'Escribe un mensaje...',
      mensajeBienvenida: 'Acceso completo a todas las conversaciones del bufete',
      mostrarNotificaciones: true
    },
    socio: {
      title: 'Mensajes',
      subtitle: 'Todas las comunicaciones del bufete',
      puedeCrearHilo: true,
      puedeAdjuntar: true,
      puedeArchivar: true,
      puedeBuscar: true,
      puedeVideollamada: true,
      puedeVerEstado: true,
      mensajePlaceholder: 'Escribe un mensaje...',
      mensajeBienvenida: 'Puedes monitorear conversaciones del equipo si es necesario',
      mostrarNotificaciones: true
    },
    administrador: {
      title: 'Mensajes',
      subtitle: 'Comunicaciones administrativas',
      puedeCrearHilo: true,
      puedeAdjuntar: true,
      puedeArchivar: true,
      puedeBuscar: true,
      puedeVideollamada: true,
      puedeVerEstado: true,
      mensajePlaceholder: 'Escribe un mensaje administrativo...',
      mensajeBienvenida: 'Acceso a comunicaciones del equipo y administrativas',
      mostrarNotificaciones: true
    },
    abogado_senior: {
      title: 'Mis Mensajes',
      subtitle: 'Comunicaciones con clientes y equipo',
      puedeCrearHilo: true,
      puedeAdjuntar: true,
      puedeArchivar: true,
      puedeBuscar: true,
      puedeVideollamada: true,
      puedeVerEstado: true,
      mensajePlaceholder: 'Escribe a tu cliente o colega...',
      mensajeBienvenida: 'Tus conversaciones con clientes y equipo de trabajo',
      mostrarNotificaciones: true
    },
    abogado_junior: {
      title: 'Mis Mensajes',
      subtitle: 'Comunicaciones asignadas',
      puedeCrearHilo: true,
      puedeAdjuntar: true,
      puedeArchivar: true,
      puedeBuscar: true,
      puedeVideollamada: false,
      puedeVerEstado: true,
      mensajePlaceholder: 'Escribe un mensaje...',
      mensajeBienvenida: 'Tus conversaciones con clientes asignados',
      mostrarNotificaciones: true
    },
    paralegal: {
      title: 'Mensajes de Trabajo',
      subtitle: 'Comunicaciones de casos asignados',
      puedeCrearHilo: false,
      puedeAdjuntar: true,
      puedeArchivar: true,
      puedeBuscar: true,
      puedeVideollamada: false,
      puedeVerEstado: true,
      mensajePlaceholder: 'Escribe a tu equipo...',
      mensajeBienvenida: 'Mensajes relacionados con tus casos asignados',
      mostrarNotificaciones: true
    },
    secretario: {
      title: 'Centro de Comunicaciones',
      subtitle: 'Gestión de mensajes y notificaciones',
      puedeCrearHilo: true,
      puedeAdjuntar: true,
      puedeArchivar: true,
      puedeBuscar: true,
      puedeVideollamada: false,
      puedeVerEstado: true,
      mensajePlaceholder: 'Escribe un mensaje...',
      mensajeBienvenida: 'Gestiona comunicaciones con clientes y registra actividad',
      mostrarNotificaciones: true
    },
    recepcionista: {
      title: 'Mensajes',
      subtitle: 'Comunicaciones de atención al cliente',
      puedeCrearHilo: true,
      puedeAdjuntar: false,
      puedeArchivar: false,
      puedeBuscar: true,
      puedeVideollamada: false,
      puedeVerEstado: false,
      mensajePlaceholder: 'Escribe un mensaje (envío limitado)...',
      mensajeBienvenida: 'Puedes enviar mensajes a todos (uso limitado a atención)',
      mostrarNotificaciones: false
    },
    contador: {
      title: 'Mensajes Contables',
      subtitle: 'Comunicaciones financieras y fiscales',
      puedeCrearHilo: true,
      puedeAdjuntar: true,
      puedeArchivar: true,
      puedeBuscar: true,
      puedeVideollamada: false,
      puedeVerEstado: true,
      mensajePlaceholder: 'Escribe sobre temas contables...',
      mensajeBienvenida: 'Mensajes relacionados con facturación y contabilidad',
      mostrarNotificaciones: true
    }
  };
  
  return configs[role] || configs.abogado_junior;
};

export default function Mensajes() {
  const { role, roleConfig } = useRole();
  const signature = useSignature(role, 'usuario@bufete.com');
  
  const [selectedConversation, setSelectedConversation] = useState<Conversation>({
    id: allConversations[0].id,
    name: allConversations[0].name,
    avatar: allConversations[0].avatar,
    lastMessage: allConversations[0].lastMessage,
    time: allConversations[0].time,
    unread: allConversations[0].unread,
    online: allConversations[0].online,
    type: allConversations[0].type,
    case: allConversations[0].case || undefined,
    archived: false,
    muted: false
  });
  const [messageText, setMessageText] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [showAdminPanel, setShowAdminPanel] = useState(false);
  const [activeModal, setActiveModal] = useState<ModalType>(null);
  const [signatureModalOpen, setSignatureModalOpen] = useState(false);
  const [documentToSign, setDocumentToSign] = useState<{id: string; name: string} | null>(null);
  const [messages, setMessages] = useState<Message[]>(initialMessages as unknown as Message[]);
  const [conversations, setConversations] = useState<Conversation[]>(
    allConversations.map(c => ({ 
      id: c.id, name: c.name, avatar: c.avatar, lastMessage: c.lastMessage,
      time: c.time, unread: c.unread, online: c.online, type: c.type,
      case: c.case || undefined, archived: false, muted: false 
    }))
  );
  const [toast, setToast] = useState<{message: string; type: 'success' | 'info' | 'error'} | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Estados para nuevo mensaje
  const [newMessageType, setNewMessageType] = useState<'individual' | 'group'>('individual');
  const [selectedRecipients, setSelectedRecipients] = useState<string[]>([]);
  const [groupName, setGroupName] = useState('');

  // Scroll to bottom on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const showToast = (message: string, type: 'success' | 'info' | 'error' = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  // Obtener configuración según el rol
  const config = useMemo(() => getConfigPorRol(role), [role]);
  
  // Obtener permisos según el rol
  const { puedeMonitorear, filtrosAdicionales } = useMemo(() => 
    getConversacionesPorRol(role), [role]
  );

  // Filtrar conversaciones según búsqueda y filtros
  const filteredConversations = useMemo(() => {
    return conversations.filter(conv => {
      const matchesSearch = conv.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                           conv.lastMessage.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesFilter = filterType === 'all' || conv.type === filterType;
      const notArchived = !conv.archived;
      return matchesSearch && matchesFilter && notArchived;
    });
  }, [conversations, searchQuery, filterType]);

  // Conversaciones archivadas
  const archivedConversations = useMemo(() => {
    return conversations.filter(conv => conv.archived);
  }, [conversations]);

  // Calcular mensajes sin leer
  const unreadCount = useMemo(() => 
    filteredConversations.reduce((acc, c) => acc + c.unread, 0),
    [filteredConversations]
  );

  const handleSendMessage = () => {
    if (messageText.trim()) {
      const newMsg: Message = {
        id: Date.now(),
        sender: 'me',
        text: messageText,
        time: new Date().toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' }),
        status: 'sent'
      };
      setMessages([...messages, newMsg]);
      setMessageText('');
      
      // Simular respuesta después de 2 segundos
      setTimeout(() => {
        const reply: Message = {
          id: Date.now() + 1,
          sender: 'other',
          text: 'Entendido, gracias por la información.',
          time: new Date().toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })
        };
        setMessages(prev => [...prev, reply]);
      }, 2000);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      const fileNames = Array.from(files).map(f => f.name).join(', ');
      showToast(`Archivo(s) adjuntado(s): ${fileNames}`, 'info');
      setActiveModal(null);
      
      // Enviar mensaje con archivo
      const newMsg: Message = {
        id: Date.now(),
        sender: 'me',
        text: messageText || `📎 Archivo adjunto: ${fileNames}`,
        time: new Date().toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' }),
        status: 'sent',
        attachments: Array.from(files).map(f => ({
          name: f.name,
          size: `${(f.size / 1024).toFixed(1)} KB`,
          type: f.type
        }))
      };
      setMessages([...messages, newMsg]);
      setMessageText('');
    }
  };

  const handleArchiveConversation = (convId: number, archive: boolean = true) => {
    setConversations(conversations.map(c => c.id === convId ? { ...c, archived: archive } : c));
    showToast(archive ? 'Conversación archivada' : 'Conversación desarchivada');
    setActiveModal(null);
  };

  const handleMuteConversation = (convId: number) => {
    setConversations(conversations.map(c => c.id === convId ? { ...c, muted: !c.muted } : c));
    const conv = conversations.find(c => c.id === convId);
    showToast(conv?.muted ? 'Notificaciones activadas' : 'Conversación silenciada');
    setActiveModal(null);
  };

  const handleDeleteConversation = (convId: number) => {
    if (confirm('¿Estás seguro de eliminar esta conversación?')) {
      setConversations(conversations.filter(c => c.id !== convId));
      showToast('Conversación eliminada', 'info');
      setActiveModal(null);
    }
  };

  const handleMarkAsRead = (convId: number) => {
    setConversations(conversations.map(c => c.id === convId ? { ...c, unread: 0 } : c));
    showToast('Marcado como leído');
    setActiveModal(null);
  };

  const handleCreateNewConversation = () => {
    if (selectedRecipients.length === 0) {
      showToast('Selecciona al menos un destinatario', 'error');
      return;
    }
    
    const newConv: Conversation = {
      id: Date.now(),
      name: newMessageType === 'group' ? groupName || 'Nuevo Grupo' : selectedRecipients[0],
      avatar: newMessageType === 'group' ? 'GP' : selectedRecipients[0].split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase(),
      lastMessage: 'Conversación iniciada',
      time: 'Ahora',
      unread: 0,
      online: false,
      type: newMessageType === 'group' ? 'group' : 'client'
    };
    
    setConversations([newConv, ...conversations]);
    setSelectedConversation(newConv);
    setActiveModal(null);
    setSelectedRecipients([]);
    setGroupName('');
    showToast('Conversación creada correctamente');
  };

  const handleInitiateCall = (type: 'audio' | 'video') => {
    setActiveModal(type === 'audio' ? 'call' : 'video');
    setTimeout(() => {
      showToast(type === 'audio' ? 'Llamada iniciada' : 'Videollamada iniciada', 'info');
      setTimeout(() => setActiveModal(null), 2000);
    }, 1000);
  };

  const insertEmoji = (emoji: string) => {
    setMessageText(prev => prev + emoji);
    setActiveModal(null);
  };

  // Filtros disponibles según el rol
  const availableFilters = useMemo(() => {
    const baseFilters = [
      { id: 'all', label: 'Todos', icon: MessageSquare },
      { id: 'client', label: 'Clientes', icon: Users },
    ];
    
    if (filtrosAdicionales.includes('colleague')) {
      baseFilters.push({ id: 'colleague', label: 'Equipo', icon: Briefcase });
    }
    
    if (filtrosAdicionales.includes('court')) {
      baseFilters.push({ id: 'court', label: 'Juzgados', icon: Gavel });
    }
    
    if (filtrosAdicionales.includes('team')) {
      baseFilters.push({ id: 'team', label: 'Equipo', icon: Users });
    }
    
    if (filtrosAdicionales.includes('system')) {
      baseFilters.push({ id: 'system', label: 'Sistema', icon: Bell });
    }
    
    return baseFilters;
  }, [filtrosAdicionales]);

  const headerActions = (
    <div className="flex items-center gap-2">
      {config.puedeArchivar && (
        <button 
          onClick={() => setActiveModal('archived')}
          className="hidden sm:flex items-center gap-2 px-4 py-2 bg-theme-tertiary text-theme-primary font-medium rounded-xl hover:bg-theme-hover transition-colors border border-theme"
        >
          <Archive className="w-4 h-4" />
          <span className="hidden lg:inline">Archivados</span>
          {archivedConversations.length > 0 && (
            <span className="ml-1 px-1.5 py-0.5 bg-amber-500 text-slate-950 text-xs rounded-full">
              {archivedConversations.length}
            </span>
          )}
        </button>
      )}
      <button 
        onClick={() => setActiveModal('new')}
        className="hidden sm:flex items-center gap-2 px-4 py-2 bg-amber-500 text-slate-950 font-medium rounded-xl hover:bg-amber-400 transition-colors"
      >
        <Plus className="w-4 h-4" />
        <span className="hidden lg:inline">Nuevo</span>
      </button>
    </div>
  );

  return (
    <AppLayout 
      title={config.title}
      subtitle={unreadCount > 0 ? `${unreadCount} mensajes sin leer` : 'Sin mensajes nuevos'}
      headerActions={headerActions}
    >
      {/* Mensaje de bienvenida según rol */}
      {config.mostrarNotificaciones && (
        <div className={`mx-4 mb-2 p-3 rounded-xl border ${roleConfig.bgColor} ${roleConfig.textColor.replace('text-', 'border-').replace('400', '500/20')}`}>
          <div className="flex items-center gap-2">
            <div className={`p-1.5 rounded-lg bg-slate-900/50`}>
              <MessageSquare className={`w-4 h-4 ${roleConfig.textColor}`} />
            </div>
            <p className={`text-sm ${roleConfig.textColor}`}>{config.mensajeBienvenida}</p>
          </div>
        </div>
      )}

      <div className="flex-1 flex overflow-hidden">
        {/* Conversations List */}
        <div className="w-80 bg-theme-secondary border-r border-theme flex flex-col">
          <div className="p-4 border-b border-theme">
            <div className="relative">
              <input
                type="text"
                placeholder={config.puedeBuscar ? "Buscar conversaciones..." : "Buscar..."}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-4 py-2 bg-theme-tertiary border border-theme rounded-xl text-theme-primary text-sm placeholder:text-theme-tertiary focus:outline-none focus:border-amber-500 transition-colors"
              />
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-theme-tertiary" />
            </div>
            
            <div className="flex gap-2 mt-3 flex-wrap">
              {availableFilters.map((filter) => (
                <button
                  key={filter.id}
                  onClick={() => setFilterType(filter.id)}
                  className={`px-3 py-1 text-xs font-medium rounded-lg transition-colors ${
                    filterType === filter.id
                      ? 'bg-amber-500 text-slate-950'
                      : 'bg-theme-tertiary text-theme-secondary hover:text-theme-primary'
                  }`}
                >
                  {filter.label}
                </button>
              ))}
            </div>
          </div>

          <div className="flex-1 overflow-y-auto">
            <AnimatePresence>
              {filteredConversations.map((conv) => (
                <motion.button
                  key={conv.id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  onClick={() => setSelectedConversation(conv)}
                  className={`w-full p-4 flex items-start gap-3 hover:bg-theme-hover transition-colors border-b border-theme ${
                    selectedConversation.id === conv.id ? 'bg-theme-hover border-l-2 border-l-amber-500' : ''
                  }`}
                >
                  <div className="relative">
                    <div className="w-12 h-12 bg-gradient-to-br from-theme-tertiary to-theme-hover rounded-full flex items-center justify-center text-sm font-bold text-theme-primary border border-theme">
                      {conv.avatar}
                    </div>
                    {conv.online && config.puedeVerEstado && (
                      <div className="absolute bottom-0 right-0 w-3 h-3 bg-emerald-500 rounded-full border-2 border-theme-secondary" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0 text-left">
                    <div className="flex items-center justify-between">
                      <h4 className="text-sm font-medium text-theme-primary truncate">{conv.name}</h4>
                      <span className="text-xs text-theme-tertiary">{conv.time}</span>
                    </div>
                    <p className="text-xs text-theme-secondary truncate mt-0.5">{conv.lastMessage}</p>
                    {conv.case && (
                      <span className="inline-block mt-1 text-[10px] text-amber-500 bg-amber-500/10 px-2 py-0.5 rounded-full">
                        {conv.case}
                      </span>
                    )}
                  </div>
                  {conv.unread > 0 && (
                    <span className="w-5 h-5 bg-amber-500 text-slate-950 text-xs font-bold rounded-full flex items-center justify-center flex-shrink-0">
                      {conv.unread}
                    </span>
                  )}
                </motion.button>
              ))}
            </AnimatePresence>
            
            {filteredConversations.length === 0 && (
              <div className="p-8 text-center">
                <MessageSquare className="w-12 h-12 text-theme-tertiary mx-auto mb-3" />
                <p className="text-theme-secondary text-sm">No hay conversaciones</p>
              </div>
            )}
          </div>
        </div>

        {/* Chat Area */}
        <div className="flex-1 flex flex-col bg-theme-primary">
          <div className="h-16 bg-theme-secondary border-b border-theme flex items-center justify-between px-6">
            <div className="flex items-center gap-3">
              <div className="relative">
                <div className="w-10 h-10 bg-gradient-to-br from-theme-tertiary to-theme-hover rounded-full flex items-center justify-center text-sm font-bold text-theme-primary border border-theme">
                  {selectedConversation.avatar}
                </div>
                {selectedConversation.online && config.puedeVerEstado && (
                  <div className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-emerald-500 rounded-full border-2 border-theme-secondary" />
                )}
              </div>
              <div>
                <h3 className="text-sm font-semibold text-theme-primary">{selectedConversation.name}</h3>
                <p className="text-xs text-theme-secondary">
                  {config.puedeVerEstado 
                    ? (selectedConversation.online ? 'En línea' : 'Última vez hace 2h')
                    : selectedConversation.case || 'Conversación activa'
                  }
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {/* Botón de monitoreo para Socios/Admin */}
              {puedeMonitorear && (
                <button 
                  onClick={() => setShowAdminPanel(!showAdminPanel)}
                  className={`p-2 rounded-lg transition-colors ${showAdminPanel ? 'bg-purple-500/20 text-purple-500' : 'text-theme-tertiary hover:text-purple-500 hover:bg-purple-500/10'}`}
                  title="Monitorear conversaciones del equipo"
                >
                  <Eye className="w-5 h-5" />
                </button>
              )}
              
              {config.puedeVideollamada && (
                <>
                  <button 
                    onClick={() => handleInitiateCall('audio')}
                    className="p-2 text-theme-tertiary hover:text-theme-primary hover:bg-theme-hover rounded-lg transition-colors"
                  >
                    <Phone className="w-5 h-5" />
                  </button>
                  <button 
                    onClick={() => handleInitiateCall('video')}
                    className="p-2 text-theme-tertiary hover:text-theme-primary hover:bg-theme-hover rounded-lg transition-colors"
                  >
                    <Video className="w-5 h-5" />
                  </button>
                </>
              )}
              <button 
                onClick={() => setActiveModal('more')}
                className="p-2 text-theme-tertiary hover:text-theme-primary hover:bg-theme-hover rounded-lg transition-colors"
              >
                <MoreVertical className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Panel de monitoreo (solo para Socios/Admin) */}
          {showAdminPanel && puedeMonitorear && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="bg-purple-500/10 border-b border-purple-500/20 p-4"
            >
              <div className="flex items-center gap-2 mb-3">
                <Shield className="w-4 h-4 text-purple-500" />
                <span className="text-sm font-medium text-purple-400">Panel de Monitoreo</span>
              </div>
              <div className="grid grid-cols-4 gap-3">
                <div className="p-3 bg-theme-secondary rounded-lg border border-theme">
                  <p className="text-xs text-theme-tertiary">Conversaciones activas</p>
                  <p className="text-lg font-bold text-theme-primary">{allConversations.length}</p>
                </div>
                <div className="p-3 bg-theme-secondary rounded-lg border border-theme">
                  <p className="text-xs text-theme-tertiary">Mensajes hoy</p>
                  <p className="text-lg font-bold text-theme-primary">142</p>
                </div>
                <div className="p-3 bg-theme-secondary rounded-lg border border-theme">
                  <p className="text-xs text-theme-tertiary">Sin respuesta</p>
                  <p className="text-lg font-bold text-amber-500">3</p>
                </div>
                <div className="p-3 bg-theme-secondary rounded-lg border border-theme">
                  <p className="text-xs text-theme-tertiary">Clientes en línea</p>
                  <p className="text-lg font-bold text-emerald-500">5</p>
                </div>
              </div>
            </motion.div>
          )}

          <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-theme-primary">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex ${msg.sender === 'me' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[70%] px-4 py-3 rounded-2xl ${
                    msg.sender === 'me'
                      ? 'bg-amber-500 text-slate-950 rounded-br-md'
                      : 'bg-theme-tertiary text-theme-primary rounded-bl-md'
                  }`}
                >
                  <p className="text-sm">{msg.text}</p>
                  {msg.attachments && (
                    <div className="mt-2 space-y-1">
                      {msg.attachments.map((att, idx) => (
                        <div key={idx} className={`flex items-center gap-2 p-2 rounded-lg ${msg.sender === 'me' ? 'bg-amber-600/30' : 'bg-theme-hover'}`}>
                          <File className="w-4 h-4" />
                          <span className="text-xs truncate flex-1">{att.name}</span>
                          <span className="text-xs opacity-70">{att.size}</span>
                          {/* Botón de firma para documentos adjuntos */}
                          {signature.permissions.canSign && (
                            <button
                              onClick={() => {
                                setDocumentToSign({ id: `${msg.id}-${idx}`, name: att.name });
                                setSignatureModalOpen(true);
                              }}
                              className="p-1 text-theme-tertiary hover:text-emerald-400 transition-colors"
                              title="Firmar documento"
                            >
                              <Pen className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                  <div className={`flex items-center gap-1 mt-1 ${msg.sender === 'me' ? 'justify-end' : ''}`}>
                    <span className={`text-xs ${msg.sender === 'me' ? 'text-slate-700' : 'text-theme-tertiary'}`}>
                      {msg.time}
                    </span>
                    {msg.sender === 'me' && (
                      <CheckCheck className={`w-3 h-3 ${msg.status === 'read' ? 'text-blue-600' : 'text-slate-600'}`} />
                    )}
                  </div>
                </div>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>

          <div className="p-4 bg-theme-secondary border-t border-theme">
            <div className="flex items-center gap-3">
              {config.puedeAdjuntar && (
                <button 
                  onClick={() => setActiveModal('attachments')}
                  className="p-2 text-theme-tertiary hover:text-theme-primary hover:bg-theme-hover rounded-lg transition-colors"
                >
                  <Paperclip className="w-5 h-5" />
                </button>
              )}
              <input
                type="text"
                placeholder={config.mensajePlaceholder}
                value={messageText}
                onChange={(e) => setMessageText(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                disabled={!config.puedeCrearHilo}
                className="flex-1 px-4 py-2.5 bg-theme-tertiary border border-theme rounded-xl text-theme-primary placeholder:text-theme-tertiary focus:outline-none focus:border-amber-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              />
              {config.puedeCrearHilo && (
                <>
                  <button 
                    onClick={() => setActiveModal('emoji')}
                    className="p-2 text-theme-tertiary hover:text-theme-primary hover:bg-theme-hover rounded-lg transition-colors"
                  >
                    <Smile className="w-5 h-5" />
                  </button>
                  <button
                    onClick={handleSendMessage}
                    className="p-2.5 bg-amber-500 text-slate-950 rounded-xl hover:bg-amber-400 transition-colors"
                  >
                    <Send className="w-5 h-5" />
                  </button>
                </>
              )}
              {!config.puedeCrearHilo && (
                <div className="p-2 text-theme-tertiary" title="No tienes permiso para enviar mensajes">
                  <Lock className="w-5 h-5" />
                </div>
              )}
            </div>
          </div>
        </div>
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
             toast.type === 'error' ? <Info className="w-5 h-5" /> : <Info className="w-5 h-5" />}
            {toast.message}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Modal: Nuevo Mensaje */}
      <AnimatePresence>
        {activeModal === 'new' && (
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
                <h3 className="text-lg font-semibold text-theme-primary">Nuevo Mensaje</h3>
                <button onClick={() => setActiveModal(null)} className="p-1 text-theme-tertiary hover:text-theme-primary">
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Tabs */}
              <div className="flex gap-2 mb-4">
                <button
                  onClick={() => setNewMessageType('individual')}
                  className={`flex-1 py-2 rounded-lg text-sm font-medium transition-colors ${
                    newMessageType === 'individual' ? 'bg-amber-500 text-slate-950' : 'bg-theme-tertiary text-theme-secondary'
                  }`}
                >
                  Individual
                </button>
                <button
                  onClick={() => setNewMessageType('group')}
                  className={`flex-1 py-2 rounded-lg text-sm font-medium transition-colors ${
                    newMessageType === 'group' ? 'bg-amber-500 text-slate-950' : 'bg-theme-tertiary text-theme-secondary'
                  }`}
                >
                  Grupal
                </button>
              </div>

              {newMessageType === 'group' && (
                <div className="mb-4">
                  <label className="text-sm text-theme-secondary mb-2 block">Nombre del grupo</label>
                  <input
                    type="text"
                    value={groupName}
                    onChange={(e) => setGroupName(e.target.value)}
                    placeholder="Ej: Equipo de Trabajo"
                    className="w-full px-4 py-2 bg-theme-tertiary border border-theme rounded-xl text-theme-primary placeholder:text-theme-tertiary focus:outline-none focus:border-amber-500"
                  />
                </div>
              )}

              <div className="mb-4">
                <label className="text-sm text-theme-secondary mb-2 block">
                  {newMessageType === 'individual' ? 'Seleccionar destinatario' : 'Seleccionar miembros'}
                </label>
                <div className="space-y-2 max-h-48 overflow-y-auto">
                  {['Carlos Martínez', 'Ana García', 'Laura Soto', 'Pedro Rodríguez', 'María López', 'Juzgado Civil 1°'].map((name) => (
                    <label key={name} className="flex items-center gap-3 p-3 bg-theme-tertiary/50 rounded-xl cursor-pointer hover:bg-theme-hover transition-colors">
                      <input
                        type={newMessageType === 'individual' ? 'radio' : 'checkbox'}
                        name="recipient"
                        checked={selectedRecipients.includes(name)}
                        onChange={() => {
                          if (newMessageType === 'individual') {
                            setSelectedRecipients([name]);
                          } else {
                            setSelectedRecipients(prev => 
                              prev.includes(name) ? prev.filter(n => n !== name) : [...prev, name]
                            );
                          }
                        }}
                        className="text-amber-500"
                      />
                      <div className="w-8 h-8 bg-gradient-to-br from-theme-tertiary to-theme-hover rounded-full flex items-center justify-center text-xs font-bold text-theme-primary">
                        {name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase()}
                      </div>
                      <span className="text-sm text-theme-secondary">{name}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => setActiveModal(null)}
                  className="flex-1 py-2.5 border border-theme text-theme-secondary rounded-xl hover:text-theme-primary transition-colors"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleCreateNewConversation}
                  className="flex-1 py-2.5 bg-amber-500 text-slate-950 font-medium rounded-xl hover:bg-amber-400 transition-colors"
                >
                  Crear conversación
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Modal: Archivados */}
      <AnimatePresence>
        {activeModal === 'archived' && (
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
              className="bg-theme-secondary border border-theme rounded-2xl p-6 w-full max-w-lg max-h-[80vh] flex flex-col"
              onClick={e => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-theme-primary">Conversaciones Archivadas</h3>
                <button onClick={() => setActiveModal(null)} className="p-1 text-theme-tertiary hover:text-theme-primary">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto space-y-2">
                {archivedConversations.length === 0 ? (
                  <div className="text-center py-8">
                    <Archive className="w-12 h-12 text-theme-tertiary mx-auto mb-3" />
                    <p className="text-theme-secondary">No hay conversaciones archivadas</p>
                  </div>
                ) : (
                  archivedConversations.map((conv) => (
                    <div key={conv.id} className="flex items-center gap-3 p-3 bg-theme-tertiary/50 rounded-xl">
                      <div className="w-10 h-10 bg-gradient-to-br from-theme-tertiary to-theme-hover rounded-full flex items-center justify-center text-xs font-bold text-theme-primary">
                        {conv.avatar}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-theme-primary truncate">{conv.name}</p>
                        <p className="text-xs text-theme-tertiary">{conv.lastMessage}</p>
                      </div>
                      <button
                        onClick={() => handleArchiveConversation(conv.id, false)}
                        className="p-2 text-theme-tertiary hover:text-amber-500 hover:bg-amber-500/10 rounded-lg transition-colors"
                        title="Desarchivar"
                      >
                        <Archive className="w-4 h-4" />
                      </button>
                    </div>
                  ))
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Modal: Adjuntos */}
      <AnimatePresence>
        {activeModal === 'attachments' && (
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
                <h3 className="text-lg font-semibold text-theme-primary">Adjuntar Archivo</h3>
                <button onClick={() => setActiveModal(null)} className="p-1 text-theme-tertiary hover:text-theme-primary">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="grid grid-cols-2 gap-3 mb-4">
                <button 
                  onClick={() => fileInputRef.current?.click()}
                  className="p-4 bg-theme-tertiary/50 border border-theme rounded-xl hover:border-amber-500/30 transition-all text-center"
                >
                  <FileText className="w-8 h-8 text-blue-500 mx-auto mb-2" />
                  <p className="text-sm text-theme-secondary">Documento</p>
                </button>
                <button 
                  onClick={() => fileInputRef.current?.click()}
                  className="p-4 bg-theme-tertiary/50 border border-theme rounded-xl hover:border-amber-500/30 transition-all text-center"
                >
                  <Image className="w-8 h-8 text-emerald-500 mx-auto mb-2" />
                  <p className="text-sm text-theme-secondary">Imagen</p>
                </button>
                <button 
                  onClick={() => fileInputRef.current?.click()}
                  className="p-4 bg-theme-tertiary/50 border border-theme rounded-xl hover:border-amber-500/30 transition-all text-center"
                >
                  <Calendar className="w-8 h-8 text-amber-500 mx-auto mb-2" />
                  <p className="text-sm text-theme-secondary">Evento</p>
                </button>
                <button 
                  onClick={() => fileInputRef.current?.click()}
                  className="p-4 bg-theme-tertiary/50 border border-theme rounded-xl hover:border-amber-500/30 transition-all text-center"
                >
                  <File className="w-8 h-8 text-purple-500 mx-auto mb-2" />
                  <p className="text-sm text-theme-secondary">Otro</p>
                </button>
              </div>

              <input
                ref={fileInputRef}
                type="file"
                multiple
                onChange={handleFileSelect}
                className="hidden"
              />

              <p className="text-xs text-theme-tertiary text-center">
                Tamaño máximo: 25MB por archivo
              </p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Modal: Emoji Picker */}
      <AnimatePresence>
        {activeModal === 'emoji' && (
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
              className="bg-theme-secondary border border-theme rounded-2xl p-6 w-full max-w-sm"
              onClick={e => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-theme-primary">Emojis</h3>
                <button onClick={() => setActiveModal(null)} className="p-1 text-theme-tertiary hover:text-theme-primary">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="grid grid-cols-6 gap-2">
                {['😀', '😂', '🥰', '😎', '🤔', '👍', 
                  '👎', '👏', '🙏', '💪', '🎉', '🔥',
                  '❤️', '💯', '✅', '⚠️', '❌', '❓',
                  '📎', '📅', '⏰', '✉️', '📞', '💼'].map((emoji) => (
                  <button
                    key={emoji}
                    onClick={() => insertEmoji(emoji)}
                    className="p-2 text-2xl hover:bg-theme-hover rounded-lg transition-colors"
                  >
                    {emoji}
                  </button>
                ))}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Modal: Más Opciones */}
      <AnimatePresence>
        {activeModal === 'more' && (
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
              className="bg-theme-secondary border border-theme rounded-2xl p-6 w-full max-w-sm"
              onClick={e => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-theme-primary">Opciones</h3>
                <button onClick={() => setActiveModal(null)} className="p-1 text-theme-tertiary hover:text-theme-primary">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-2">
                <button 
                  onClick={() => handleMarkAsRead(selectedConversation.id)}
                  className="w-full p-3 flex items-center gap-3 text-left hover:bg-theme-hover rounded-xl transition-colors"
                >
                  <Check className="w-5 h-5 text-emerald-500" />
                  <span className="text-theme-secondary">Marcar como leído</span>
                </button>
                <button 
                  onClick={() => handleArchiveConversation(selectedConversation.id, true)}
                  className="w-full p-3 flex items-center gap-3 text-left hover:bg-theme-hover rounded-xl transition-colors"
                >
                  <Archive className="w-5 h-5 text-amber-500" />
                  <span className="text-theme-secondary">Archivar conversación</span>
                </button>
                <button 
                  onClick={() => handleMuteConversation(selectedConversation.id)}
                  className="w-full p-3 flex items-center gap-3 text-left hover:bg-theme-hover rounded-xl transition-colors"
                >
                  {selectedConversation.muted ? (
                    <>
                      <Volume2 className="w-5 h-5 text-blue-500" />
                      <span className="text-theme-secondary">Activar notificaciones</span>
                    </>
                  ) : (
                    <>
                      <VolumeX className="w-5 h-5 text-theme-tertiary" />
                      <span className="text-theme-secondary">Silenciar</span>
                    </>
                  )}
                </button>
                <button className="w-full p-3 flex items-center gap-3 text-left hover:bg-theme-hover rounded-xl transition-colors">
                  <Flag className="w-5 h-5 text-red-500" />
                  <span className="text-theme-secondary">Reportar</span>
                </button>
                <div className="border-t border-theme my-2" />
                <button 
                  onClick={() => handleDeleteConversation(selectedConversation.id)}
                  className="w-full p-3 flex items-center gap-3 text-left hover:bg-red-500/10 rounded-xl transition-colors"
                >
                  <Trash2 className="w-5 h-5 text-red-500" />
                  <span className="text-red-400">Eliminar conversación</span>
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Modal: Llamada */}
      <AnimatePresence>
        {activeModal === 'call' && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="text-center"
            >
              <div className="w-24 h-24 mx-auto mb-6 bg-gradient-to-br from-theme-tertiary to-theme-hover rounded-full flex items-center justify-center">
                <PhoneCall className="w-12 h-12 text-amber-500" />
              </div>
              <h3 className="text-2xl font-semibold text-theme-primary mb-2">{selectedConversation.name}</h3>
              <p className="text-theme-secondary mb-8">Llamando...</p>
              <div className="flex gap-4 justify-center">
                <button 
                  onClick={() => setActiveModal(null)}
                  className="w-14 h-14 bg-red-500 rounded-full flex items-center justify-center hover:bg-red-600 transition-colors"
                >
                  <X className="w-6 h-6 text-white" />
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Modal: Videollamada */}
      <AnimatePresence>
        {activeModal === 'video' && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="text-center"
            >
              <div className="w-24 h-24 mx-auto mb-6 bg-gradient-to-br from-theme-tertiary to-theme-hover rounded-full flex items-center justify-center">
                <VideoIcon className="w-12 h-12 text-emerald-500" />
              </div>
              <h3 className="text-2xl font-semibold text-theme-primary mb-2">{selectedConversation.name}</h3>
              <p className="text-theme-secondary mb-8">Iniciando videollamada...</p>
              <div className="flex gap-4 justify-center">
                <button 
                  onClick={() => setActiveModal(null)}
                  className="w-14 h-14 bg-red-500 rounded-full flex items-center justify-center hover:bg-red-600 transition-colors"
                >
                  <X className="w-6 h-6 text-white" />
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Modal: Firma Electrónica */}
      <SignatureModal
        isOpen={signatureModalOpen}
        onClose={() => setSignatureModalOpen(false)}
        mode="sign"
        documentId={documentToSign?.id || ''}
        documentName={documentToSign?.name || ''}
        onComplete={(_result) => {
          showToast(`Documento ${documentToSign?.name} firmado correctamente`, 'success');
          setSignatureModalOpen(false);
        }}
      />
    </AppLayout>
  );
}

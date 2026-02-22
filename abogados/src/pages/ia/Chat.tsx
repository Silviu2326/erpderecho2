// M11 - IA Legal: Chat
// Copiloto AI para asistencia legal

import { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  MessageSquare, Send, Bot, User, Copy, ThumbsUp, ThumbsDown,
  Sparkles, Clock, FileText, Search, Plus, Trash2, BookOpen
} from 'lucide-react';
import { useLocalStorage } from '@/hooks/useLocalStorage';
import { useToast } from '@/components/ui/Toast';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Form';
import { Card, Badge } from '@/components/ui';
import { Breadcrumbs } from '@/components/ui/Breadcrumbs';
import { AppLayout } from '@/components/layout/AppLayout';

// Tipos
interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  sources?: string[];
}

// Datos mock de conversaciones anteriores
const conversationsMock = [
  { id: '1', title: 'Análisis de contrato laboral', date: '2024-05-20' },
  { id: '2', title: 'Demanda por despido', date: '2024-05-19' },
  { id: '3', title: 'Cláusulas suelo', date: '2024-05-18' },
];

// Respuestas mock del AI
const mockResponses: Record<string, string> = {
  default: `Basándome en mi conocimiento legal, te puedo indicar lo siguiente:

**Aspectos relevantes:**

1. **Marco legal aplicable**: La legislación laboral española establece en el Estatuto de los Trabajadores (ET) los derechos y obligaciones de ambas partes.

2. **Procedimiento recomendado**: 
   - Reclamación prévia ante la empresa
   - Si no hay respuesta en 30 días, demanda ante el SJ
   - Plazo de 20 días hábiles desde el despido

3. **Documentación necesaria**:
   - Carta de despido
   - Nóminas últimos meses
   - Contrato de trabajo
   - Dokumentos que evidencien los hechos

¿Te gustaría que profundice en algún aspecto específico?`,

  contrato: `He analizado el contrato proporcionado. Aquí están los **puntos críticos** que he identificado:

⚠️ **Cláusulas potencialmente abusivas:**

1. **Cláusula de no competitividad**: Establece una restricción post-contractual sin compensación económica. Esta cláusula podría ser declarada nula.

2. **Penalización por desistimiento**: Los 6 meses de preaviso son excesivos y podrían considerarse nulos.

3. **Arbitraje vinculante**: La sumisión a arbitraje institucional limita el acceso a la jurisdicción laboral.

**Recomendación:** Revisar con detalle estas cláusulas antes de firma.

¿Te necesito analizar algún aspecto específico del contrato?`,
};

export default function IAChat() {
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<Message[]>([
    { id: '1', role: 'assistant', content: mockResponses.default, timestamp: new Date(), sources: ['ET Art. 50', 'Directiva 2003/88/CE'] }
  ]);
  const [isTyping, setIsTyping] = useState(false);
  const [conversations, setConversations] = useState(conversationsMock);
  const [selectedConversation, setSelectedConversation] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: input,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsTyping(true);

    // Simular respuesta del AI
    setTimeout(() => {
      const responseContent = input.toLowerCase().includes('contrato') 
        ? mockResponses.contrato 
        : mockResponses.default;

      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: responseContent,
        timestamp: new Date(),
        sources: ['ET Art. 50', 'Jurisprudencia TS', 'Directiva UE']
      };

      setMessages(prev => [...prev, assistantMessage]);
      setIsTyping(false);
    }, 1500);
  };

  const newConversation = () => {
    setMessages([{ 
      id: '1', 
      role: 'assistant', 
      content: '¡Hola! Soy tu asistente legal de IA. Estoy aquí para ayudarte con:\n\n• Análisis de contratos y documentos\n• Búsqueda de jurisprudencia\n• Redacción de escritos\n• Consulta de legislación\n• Estrategia procesal\n\n¿En qué puedo ayudarte hoy?', 
      timestamp: new Date() 
    }]);
    setSelectedConversation(null);
  };

  return (
    <AppLayout title="Chat IA" subtitle="Copiloto AI para asistencia legal">
    <div className="flex h-[calc(100vh-120px)]">
      {/* Sidebar - Historial */}
      <div className="w-64 border-r border-theme bg-theme-card p-4 hidden md:block">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold text-theme-primary">Conversaciones</h3>
          <button
            onClick={newConversation}
            className="p-1.5 text-accent hover:bg-accent/10 rounded-lg"
          >
            <Plus className="w-4 h-4" />
          </button>
        </div>

        <div className="space-y-2">
          {conversations.map(conv => (
            <button
              key={conv.id}
              onClick={() => setSelectedConversation(conv.id)}
              className={`w-full text-left p-3 rounded-xl transition-colors ${
                selectedConversation === conv.id
                  ? 'bg-accent/10 text-accent'
                  : 'hover:bg-theme-tertiary text-theme-secondary'
              }`}
            >
              <p className="font-medium text-sm truncate">{conv.title}</p>
              <p className="text-xs text-theme-muted mt-1">{conv.date}</p>
            </button>
          ))}
        </div>
      </div>

      {/* Chat principal */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <div className="p-4 border-b border-theme flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-accent to-purple-500 rounded-xl flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="font-semibold text-theme-primary">Copiloto Legal IA</h2>
              <p className="text-xs text-theme-muted">Asistente jurídico con RAG</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="flex items-center gap-1 text-xs text-emerald-400">
              <span className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse" />
              Disponible
            </span>
          </div>
        </div>

        {/* Mensajes */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.map((msg) => (
            <motion.div
              key={msg.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className={`flex gap-3 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}
            >
              <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                msg.role === 'user' ? 'bg-blue-500' : 'bg-gradient-to-br from-accent to-purple-500'
              }`}>
                {msg.role === 'user' ? (
                  <User className="w-4 h-4 text-white" />
                ) : (
                  <Bot className="w-4 h-4 text-white" />
                )}
              </div>

              <div className={`max-w-[70%] ${msg.role === 'user' ? 'text-right' : ''}`}>
                <div className={`p-4 rounded-2xl ${
                  msg.role === 'user' 
                    ? 'bg-blue-500/20 text-theme-primary' 
                    : 'bg-theme-card border border-theme text-theme-primary'
                }`}>
                  <p className="whitespace-pre-line text-sm">{msg.content}</p>
                </div>

                {msg.role === 'assistant' && (
                  <div className="flex items-center gap-2 mt-2">
                    {msg.sources && (
                      <div className="flex items-center gap-1 text-xs text-theme-muted">
                        <BookOpen className="w-3 h-3" />
                        {msg.sources.join(', ')}
                      </div>
                    )}
                    <div className="flex gap-1 ml-auto">
                      <button className="p-1 text-theme-muted hover:text-theme-primary hover:bg-theme-tertiary rounded">
                        <Copy className="w-3 h-3" />
                      </button>
                      <button className="p-1 text-theme-muted hover:text-emerald-400 hover:bg-emerald-500/10 rounded">
                        <ThumbsUp className="w-3 h-3" />
                      </button>
                      <button className="p-1 text-theme-muted hover:text-red-400 hover:bg-red-500/10 rounded">
                        <ThumbsDown className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                )}

                <p className="text-xs text-theme-muted mt-1">
                  <Clock className="w-3 h-3 inline mr-1" />
                  {msg.timestamp.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })}
                </p>
              </div>
            </motion.div>
          ))}

          {isTyping && (
            <div className="flex gap-3">
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-accent to-purple-500 flex items-center justify-center">
                <Bot className="w-4 h-4 text-white" />
              </div>
              <div className="bg-theme-card border border-theme rounded-2xl p-4">
                <div className="flex gap-1">
                  <span className="w-2 h-2 bg-theme-muted rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                  <span className="w-2 h-2 bg-theme-muted rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                  <span className="w-2 h-2 bg-theme-muted rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                </div>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        <div className="p-4 border-t border-theme">
          <div className="flex gap-3">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && handleSend()}
              placeholder="Escribe tu pregunta legal..."
              className="flex-1 px-4 py-3 bg-theme-card border border-theme rounded-xl text-theme-primary placeholder-theme-muted focus:outline-none focus:border-accent"
            />
            <button
              onClick={handleSend}
              disabled={!input.trim() || isTyping}
              className="px-4 py-3 bg-accent text-white font-medium rounded-xl hover:bg-accent-hover transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Send className="w-5 h-5" />
            </button>
          </div>
          <p className="text-xs text-theme-muted mt-2 text-center">
            ⚠️ Esta IA es una herramienta de asistencia. Verifica siempre la información con fuentes legales oficiales.
          </p>
        </div>
      </div>
    </div>
    </AppLayout>
  );
}

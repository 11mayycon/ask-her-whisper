import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Send, Zap, MessageCircle, User, Clock, CheckCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";
import { API_URL } from "@/lib/api-config";

interface Conversation {
  id: string;
  name: string;
  phone: string;
  profilePic: string | null;
  lastMessage: string;
  lastMessageTime: number;
  unreadCount: number;
  status: string;
  assignedTo: string;
}

interface Message {
  id: string;
  content: string;
  sender: 'client' | 'support' | 'ai';
  senderName: string;
  timestamp: number;
  type: string;
}

const SupportChat = () => {
  const { user } = useAuth();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedChat, setSelectedChat] = useState<Conversation | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputMessage, setInputMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [instanceName, setInstanceName] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Buscar instância do admin
  useEffect(() => {
    fetchAdminInstance();
  }, []);

  // Buscar conversas quando tiver a instância
  useEffect(() => {
    if (instanceName) {
      fetchConversations();
      // Atualizar a cada 5 segundos
      const interval = setInterval(fetchConversations, 5000);
      return () => clearInterval(interval);
    }
  }, [instanceName]);

  // Buscar mensagens quando selecionar um chat
  useEffect(() => {
    if (selectedChat && instanceName) {
      fetchMessages(selectedChat.id);
    }
  }, [selectedChat, instanceName]);

  // Auto scroll para última mensagem
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const fetchAdminInstance = async () => {
    try {
      const token = localStorage.getItem('auth_token');
      const response = await fetch(`${API_URL}/admin/whatsapp-instance`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        if (data.instance) {
          setInstanceName(data.instance.instance_name);
        }
      }
    } catch (error) {
      console.error('Erro ao buscar instância:', error);
    }
  };

  const fetchConversations = async () => {
    try {
      const token = localStorage.getItem('auth_token');
      const response = await fetch(`${API_URL}/conversations/${instanceName}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setConversations(data.conversations || []);
      }
    } catch (error) {
      console.error('Erro ao buscar conversas:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchMessages = async (chatId: string) => {
    try {
      const token = localStorage.getItem('auth_token');
      const response = await fetch(
        `${API_URL}/conversations/${instanceName}/messages/${chatId}`,
        {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        }
      );

      if (response.ok) {
        const data = await response.json();
        setMessages(data.messages || []);
      }
    } catch (error) {
      console.error('Erro ao buscar mensagens:', error);
    }
  };

  const handleSendMessage = async () => {
    if (!inputMessage.trim() || !selectedChat || sending) return;

    setSending(true);

    try {
      const token = localStorage.getItem('auth_token');
      const response = await fetch(`${API_URL}/conversations/${instanceName}/send`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          chatId: selectedChat.id,
          message: inputMessage
        })
      });

      if (response.ok) {
        setInputMessage("");
        // Recarregar mensagens
        await fetchMessages(selectedChat.id);
        toast.success("Mensagem enviada!");
      } else {
        const error = await response.json();
        toast.error(error.error || "Erro ao enviar mensagem");
      }
    } catch (error) {
      console.error('Erro ao enviar mensagem:', error);
      toast.error("Erro ao enviar mensagem");
    } finally {
      setSending(false);
    }
  };

  const handleTakeConversation = async (chatId: string) => {
    try {
      const token = localStorage.getItem('auth_token');
      const response = await fetch(
        `${API_URL}/conversations/${instanceName}/take/${chatId}`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`
          }
        }
      );

      if (response.ok) {
        toast.success("Conversa assumida!");
        fetchConversations();
      }
    } catch (error) {
      console.error('Erro ao assumir conversa:', error);
      toast.error("Erro ao assumir conversa");
    }
  };

  const formatTime = (timestamp: number) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const hours = Math.floor(diff / (1000 * 60 * 60));

    if (hours < 1) {
      const minutes = Math.floor(diff / (1000 * 60));
      return `${minutes}min`;
    } else if (hours < 24) {
      return `${hours}h`;
    } else {
      return date.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' });
    }
  };

  return (
    <div className="h-screen w-full bg-gradient-to-br from-[#0f172a] via-[#1e1b4b] to-[#0f172a] flex flex-col overflow-hidden">
      {/* Header */}
      <motion.div
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="px-6 py-4 border-b border-[#7C3AED]/20 bg-[#0f172a]/50 backdrop-blur-sm"
      >
        <div className="flex items-center gap-3">
          <div className="relative">
            <MessageCircle className="w-8 h-8 text-[#7C3AED]" />
            <div className="absolute -top-1 -right-1 w-3 h-3 bg-[#EC4899] rounded-full animate-pulse" />
          </div>
          <div>
            <h1 className="text-2xl font-bold bg-gradient-to-r from-[#7C3AED] to-[#EC4899] bg-clip-text text-transparent">
              💬 InovaPro AI Assistant
            </h1>
            <p className="text-sm text-gray-400">Conversas em Tempo Real</p>
          </div>
        </div>
      </motion.div>

      <div className="flex-1 flex overflow-hidden">
        {/* Lista de Conversas */}
        <motion.div
          initial={{ x: -20, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ delay: 0.1 }}
          className="w-80 border-r border-[#7C3AED]/20 bg-[#0f172a]/30 backdrop-blur-sm overflow-y-auto"
        >
          {loading ? (
            <div className="flex items-center justify-center h-full">
              <div className="w-8 h-8 border-4 border-[#7C3AED] border-t-transparent rounded-full animate-spin" />
            </div>
          ) : conversations.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-gray-500 p-8">
              <MessageCircle className="w-16 h-16 mb-4 opacity-30" />
              <p className="text-center">Nenhuma conversa ativa</p>
            </div>
          ) : (
            <div className="p-2 space-y-1">
              <AnimatePresence>
                {conversations.map((conv, index) => (
                  <motion.div
                    key={conv.id}
                    initial={{ x: -20, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    transition={{ delay: index * 0.05 }}
                    whileHover={{ scale: 1.02, x: 4 }}
                    onClick={() => setSelectedChat(conv)}
                    className={`p-4 rounded-lg cursor-pointer transition-all ${
                      selectedChat?.id === conv.id
                        ? 'bg-gradient-to-r from-[#7C3AED]/30 to-[#EC4899]/30 border border-[#7C3AED]/50'
                        : 'bg-[#1E293B]/50 hover:bg-[#1E293B]/80 border border-transparent'
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <div className="relative flex-shrink-0">
                        {conv.profilePic ? (
                          <img
                            src={conv.profilePic}
                            alt={conv.name}
                            className="w-12 h-12 rounded-full object-cover ring-2 ring-[#7C3AED]/50"
                          />
                        ) : (
                          <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[#7C3AED] to-[#EC4899] flex items-center justify-center ring-2 ring-[#7C3AED]/50">
                            <User className="w-6 h-6 text-white" />
                          </div>
                        )}
                        {conv.unreadCount > 0 && (
                          <div className="absolute -top-1 -right-1 w-5 h-5 bg-[#EC4899] rounded-full flex items-center justify-center text-xs font-bold text-white">
                            {conv.unreadCount}
                          </div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-1">
                          <h3 className="font-semibold text-white truncate">{conv.name}</h3>
                          <span className="text-xs text-gray-400 flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {formatTime(conv.lastMessageTime)}
                          </span>
                        </div>
                        <p className="text-sm text-gray-400 truncate">{conv.lastMessage}</p>
                        <div className="flex items-center gap-2 mt-1">
                          <span
                            className={`text-xs px-2 py-0.5 rounded-full ${
                              conv.status === 'in_progress'
                                ? 'bg-[#3B82F6]/20 text-[#3B82F6]'
                                : conv.status === 'waiting'
                                ? 'bg-[#EC4899]/20 text-[#EC4899]'
                                : 'bg-[#10B981]/20 text-[#10B981]'
                            }`}
                          >
                            {conv.status === 'in_progress'
                              ? '🔄 Em Atendimento'
                              : conv.status === 'waiting'
                              ? '⏳ Aguardando'
                              : '✅ Finalizado'}
                          </span>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          )}
        </motion.div>

        {/* Janela de Chat */}
        <div className="flex-1 flex flex-col">
          {selectedChat ? (
            <>
              {/* Header do Chat */}
              <motion.div
                initial={{ y: -10, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                className="px-6 py-4 border-b border-[#7C3AED]/20 bg-[#0f172a]/50 backdrop-blur-sm"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    {selectedChat.profilePic ? (
                      <img
                        src={selectedChat.profilePic}
                        alt={selectedChat.name}
                        className="w-10 h-10 rounded-full object-cover ring-2 ring-[#7C3AED]/50"
                      />
                    ) : (
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#7C3AED] to-[#EC4899] flex items-center justify-center ring-2 ring-[#7C3AED]/50">
                        <User className="w-5 h-5 text-white" />
                      </div>
                    )}
                    <div>
                      <h2 className="font-semibold text-white">{selectedChat.name}</h2>
                      <p className="text-xs text-gray-400">{selectedChat.phone}</p>
                    </div>
                  </div>
                  {selectedChat.assignedTo === 'ai' && (
                    <Button
                      onClick={() => handleTakeConversation(selectedChat.id)}
                      className="bg-gradient-to-r from-[#7C3AED] to-[#EC4899] hover:opacity-90"
                    >
                      <Zap className="w-4 h-4 mr-2" />
                      Assumir Conversa
                    </Button>
                  )}
                </div>
              </motion.div>

              {/* Mensagens */}
              <div className="flex-1 overflow-y-auto p-6 space-y-4">
                <AnimatePresence>
                  {messages.map((msg, index) => (
                    <motion.div
                      key={msg.id}
                      initial={{ y: 20, opacity: 0 }}
                      animate={{ y: 0, opacity: 1 }}
                      transition={{ delay: index * 0.03 }}
                      className={`flex ${msg.sender === 'client' ? 'justify-start' : 'justify-end'}`}
                    >
                      <div
                        className={`max-w-[70%] rounded-2xl px-4 py-3 ${
                          msg.sender === 'client'
                            ? 'bg-[#1E293B] border border-[#3B82F6]/30 text-gray-200'
                            : 'bg-gradient-to-r from-[#7C3AED] to-[#EC4899] text-white shadow-lg shadow-[#7C3AED]/20'
                        }`}
                      >
                        {msg.sender !== 'client' && (
                          <div className="text-xs font-bold mb-1 opacity-90">
                            SUPORTE - {msg.senderName}
                          </div>
                        )}
                        <p className="whitespace-pre-wrap break-words">{msg.content}</p>
                        <div className="flex items-center justify-end gap-1 mt-1">
                          <span className="text-xs opacity-70">
                            {new Date(msg.timestamp).toLocaleTimeString('pt-BR', {
                              hour: '2-digit',
                              minute: '2-digit'
                            })}
                          </span>
                          {msg.sender !== 'client' && (
                            <CheckCheck className="w-3 h-3 opacity-70" />
                          )}
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>
                <div ref={messagesEndRef} />
              </div>

              {/* Input de Mensagem */}
              <motion.div
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                className="p-4 border-t border-[#7C3AED]/20 bg-[#0f172a]/50 backdrop-blur-sm"
              >
                <div className="flex gap-3 items-end">
                  <div className="flex-1 relative">
                    <Input
                      value={inputMessage}
                      onChange={(e) => setInputMessage(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && !e.shiftKey && handleSendMessage()}
                      placeholder="Digite sua mensagem..."
                      disabled={sending}
                      className="bg-[#1E293B] border-[#7C3AED]/30 text-white placeholder:text-gray-500 pr-12 py-6 rounded-xl focus:ring-2 focus:ring-[#7C3AED] transition-all"
                    />
                  </div>
                  <Button
                    onClick={handleSendMessage}
                    disabled={sending || !inputMessage.trim()}
                    className="bg-gradient-to-r from-[#7C3AED] to-[#EC4899] hover:opacity-90 px-6 py-6 rounded-xl transition-all hover:scale-105 disabled:opacity-50 disabled:scale-100"
                  >
                    {sending ? (
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    ) : (
                      <Zap className="w-5 h-5" />
                    )}
                  </Button>
                </div>
              </motion.div>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center">
              <div className="text-center text-gray-500">
                <MessageCircle className="w-20 h-20 mx-auto mb-4 opacity-20" />
                <p className="text-lg">Selecione uma conversa para começar</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SupportChat;

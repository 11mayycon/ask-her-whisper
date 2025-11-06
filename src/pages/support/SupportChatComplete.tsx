import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Send,
  Zap,
  MessageCircle,
  User,
  Clock,
  CheckCheck,
  Paperclip,
  Image as ImageIcon,
  FileText,
  Video,
  Music,
  X,
  Search,
  Filter,
  Volume2,
  VolumeX
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";
import { API_URL } from "@/lib/api-config";
import { useWebSocket } from "@/hooks/useWebSocket";
import {
  playNotificationSound,
  requestNotificationPermission,
  showBrowserNotification
} from "@/lib/notification-sound";

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
  mediaUrl?: string;
}

const SupportChatComplete = () => {
  const { user } = useAuth();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [filteredConversations, setFilteredConversations] = useState<Conversation[]>([]);
  const [selectedChat, setSelectedChat] = useState<Conversation | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputMessage, setInputMessage] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [instanceName, setInstanceName] = useState("");
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [mediaPreview, setMediaPreview] = useState<{ file: File; preview: string; type: string } | null>(null);
  const [uploading, setUploading] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // WebSocket connection
  const { isConnected } = useWebSocket({
    instanceName,
    onNewMessage: (message) => {
      // Adicionar nova mensagem se for para o chat atual
      if (selectedChat && message.chatId === selectedChat.id) {
        setMessages(prev => [...prev, {
          id: message.id,
          content: message.content,
          sender: message.sender,
          senderName: message.sender === 'client' ? selectedChat.name : 'Suporte',
          timestamp: message.timestamp,
          type: message.type,
          mediaUrl: message.mediaUrl
        }]);
      }

      // Tocar som e mostrar notificação se não estiver com foco no chat
      if (soundEnabled && message.sender === 'client') {
        playNotificationSound();

        if (document.hidden) {
          showBrowserNotification(
            'Nova mensagem',
            `${message.phone}: ${message.content.substring(0, 50)}...`
          );
        }
      }
    },
    onConversationUpdated: (data) => {
      // Atualizar lista de conversas
      setConversations(prev =>
        prev.map(conv =>
          conv.id === data.chatId
            ? { ...conv, lastMessage: data.lastMessage, lastMessageTime: data.lastMessageTime }
            : conv
        )
      );
    }
  });

  // Buscar instância do admin
  useEffect(() => {
    fetchAdminInstance();
    requestNotificationPermission();
  }, []);

  // Buscar conversas quando tiver a instância
  useEffect(() => {
    if (instanceName) {
      fetchConversations();
      // Atualizar a cada 10 segundos
      const interval = setInterval(fetchConversations, 10000);
      return () => clearInterval(interval);
    }
  }, [instanceName]);

  // Buscar mensagens quando selecionar um chat
  useEffect(() => {
    if (selectedChat && instanceName) {
      fetchMessages(selectedChat.id);
    }
  }, [selectedChat, instanceName]);

  // Filtrar conversas
  useEffect(() => {
    let filtered = conversations;

    // Filtro de busca
    if (searchQuery) {
      filtered = filtered.filter(conv =>
        conv.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        conv.phone.includes(searchQuery)
      );
    }

    // Filtro de status
    if (statusFilter !== 'all') {
      filtered = filtered.filter(conv => conv.status === statusFilter);
    }

    setFilteredConversations(filtered);
  }, [conversations, searchQuery, statusFilter]);

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

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Verificar tamanho (máx 16MB)
    if (file.size > 16 * 1024 * 1024) {
      toast.error("Arquivo muito grande! Máximo 16MB");
      return;
    }

    // Criar preview
    const reader = new FileReader();
    reader.onloadend = () => {
      let type = 'document';
      if (file.type.startsWith('image/')) type = 'image';
      else if (file.type.startsWith('video/')) type = 'video';
      else if (file.type.startsWith('audio/')) type = 'audio';

      setMediaPreview({
        file,
        preview: reader.result as string,
        type
      });
    };
    reader.readAsDataURL(file);
  };

  const handleSendMedia = async (caption?: string) => {
    if (!mediaPreview || !selectedChat || uploading) return;

    setUploading(true);

    try {
      const token = localStorage.getItem('auth_token');
      const formData = new FormData();
      formData.append('media', mediaPreview.file);
      formData.append('chatId', selectedChat.id);
      if (caption) formData.append('caption', caption);

      const response = await fetch(
        `${API_URL}/conversations/${instanceName}/send-media`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`
          },
          body: formData
        }
      );

      if (response.ok) {
        setMediaPreview(null);
        await fetchMessages(selectedChat.id);
        toast.success("Mídia enviada!");
      } else {
        const error = await response.json();
        toast.error(error.error || "Erro ao enviar mídia");
      }
    } catch (error) {
      console.error('Erro ao enviar mídia:', error);
      toast.error("Erro ao enviar mídia");
    } finally {
      setUploading(false);
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

  const getMediaIcon = (type: string) => {
    switch (type) {
      case 'image': return <ImageIcon className="w-5 h-5" />;
      case 'video': return <Video className="w-5 h-5" />;
      case 'audio': return <Music className="w-5 h-5" />;
      default: return <FileText className="w-5 h-5" />;
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
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="relative">
              <MessageCircle className="w-8 h-8 text-[#7C3AED]" />
              {isConnected && (
                <div className="absolute -top-1 -right-1 w-3 h-3 bg-[#10B981] rounded-full animate-pulse" />
              )}
            </div>
            <div>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-[#7C3AED] to-[#EC4899] bg-clip-text text-transparent">
                💬 InovaPro AI Assistant
              </h1>
              <p className="text-sm text-gray-400">
                {isConnected ? '🟢 Conectado' : '🔴 Desconectado'} • Conversas em Tempo Real
              </p>
            </div>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setSoundEnabled(!soundEnabled)}
            className="text-gray-400 hover:text-white"
          >
            {soundEnabled ? <Volume2 className="w-5 h-5" /> : <VolumeX className="w-5 h-5" />}
          </Button>
        </div>
      </motion.div>

      <div className="flex-1 flex overflow-hidden">
        {/* Lista de Conversas */}
        <motion.div
          initial={{ x: -20, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ delay: 0.1 }}
          className="w-96 border-r border-[#7C3AED]/20 bg-[#0f172a]/30 backdrop-blur-sm flex flex-col"
        >
          {/* Filtros e Busca */}
          <div className="p-3 space-y-2 border-b border-[#7C3AED]/20">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Buscar conversa..."
                className="pl-10 bg-[#1E293B] border-[#7C3AED]/30 text-white placeholder:text-gray-500"
              />
            </div>
            <div className="flex gap-2">
              <Button
                size="sm"
                variant="ghost"
                onClick={() => setStatusFilter('all')}
                className={`flex-1 ${statusFilter === 'all' ? 'bg-[#7C3AED]/20 text-[#7C3AED]' : 'text-gray-400'}`}
              >
                Todas
              </Button>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => setStatusFilter('waiting')}
                className={`flex-1 ${statusFilter === 'waiting' ? 'bg-[#EC4899]/20 text-[#EC4899]' : 'text-gray-400'}`}
              >
                Aguardando
              </Button>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => setStatusFilter('in_progress')}
                className={`flex-1 ${statusFilter === 'in_progress' ? 'bg-[#3B82F6]/20 text-[#3B82F6]' : 'text-gray-400'}`}
              >
                Em Atend.
              </Button>
            </div>
          </div>

          {/* Lista */}
          <div className="flex-1 overflow-y-auto">
            {loading ? (
              <div className="flex items-center justify-center h-full">
                <div className="w-8 h-8 border-4 border-[#7C3AED] border-t-transparent rounded-full animate-spin" />
              </div>
            ) : filteredConversations.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-gray-500 p-8">
                <MessageCircle className="w-16 h-16 mb-4 opacity-30" />
                <p className="text-center">Nenhuma conversa encontrada</p>
              </div>
            ) : (
              <div className="p-2 space-y-1">
                <AnimatePresence>
                  {filteredConversations.map((conv, index) => (
                    <motion.div
                      key={conv.id}
                      initial={{ x: -20, opacity: 0 }}
                      animate={{ x: 0, opacity: 1 }}
                      transition={{ delay: index * 0.03 }}
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
          </div>
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
                      transition={{ delay: index * 0.02 }}
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

                        {/* Preview de mídia */}
                        {msg.mediaUrl && (
                          <div className="mb-2">
                            {msg.type === 'image' && (
                              <img
                                src={msg.mediaUrl}
                                alt="Imagem"
                                className="rounded-lg max-w-full h-auto"
                              />
                            )}
                            {msg.type === 'video' && (
                              <video
                                src={msg.mediaUrl}
                                controls
                                className="rounded-lg max-w-full h-auto"
                              />
                            )}
                            {msg.type === 'audio' && (
                              <audio
                                src={msg.mediaUrl}
                                controls
                                className="w-full"
                              />
                            )}
                            {msg.type === 'document' && (
                              <a
                                href={msg.mediaUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex items-center gap-2 p-2 bg-black/20 rounded hover:bg-black/30"
                              >
                                <FileText className="w-5 h-5" />
                                <span className="text-sm">Abrir documento</span>
                              </a>
                            )}
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

              {/* Preview de mídia antes de enviar */}
              <AnimatePresence>
                {mediaPreview && (
                  <motion.div
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    exit={{ y: 20, opacity: 0 }}
                    className="px-6 py-3 border-t border-[#7C3AED]/20 bg-[#0f172a]/70"
                  >
                    <div className="flex items-center gap-3">
                      <div className="relative">
                        {mediaPreview.type === 'image' ? (
                          <img
                            src={mediaPreview.preview}
                            alt="Preview"
                            className="w-16 h-16 rounded object-cover"
                          />
                        ) : (
                          <div className="w-16 h-16 rounded bg-[#1E293B] flex items-center justify-center">
                            {getMediaIcon(mediaPreview.type)}
                          </div>
                        )}
                        <button
                          onClick={() => setMediaPreview(null)}
                          className="absolute -top-2 -right-2 w-5 h-5 bg-red-500 rounded-full flex items-center justify-center hover:bg-red-600"
                        >
                          <X className="w-3 h-3 text-white" />
                        </button>
                      </div>
                      <div className="flex-1">
                        <p className="text-sm text-white font-medium">{mediaPreview.file.name}</p>
                        <p className="text-xs text-gray-400">
                          {(mediaPreview.file.size / 1024 / 1024).toFixed(2)} MB
                        </p>
                      </div>
                      <Button
                        onClick={() => handleSendMedia()}
                        disabled={uploading}
                        className="bg-gradient-to-r from-[#7C3AED] to-[#EC4899]"
                      >
                        {uploading ? 'Enviando...' : 'Enviar'}
                      </Button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Input de Mensagem */}
              <motion.div
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                className="p-4 border-t border-[#7C3AED]/20 bg-[#0f172a]/50 backdrop-blur-sm"
              >
                <div className="flex gap-3 items-end">
                  <input
                    ref={fileInputRef}
                    type="file"
                    className="hidden"
                    accept="image/*,video/*,audio/*,.pdf,.doc,.docx,.xls,.xlsx"
                    onChange={handleFileSelect}
                  />
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => fileInputRef.current?.click()}
                    className="text-gray-400 hover:text-white"
                  >
                    <Paperclip className="w-5 h-5" />
                  </Button>
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

export default SupportChatComplete;

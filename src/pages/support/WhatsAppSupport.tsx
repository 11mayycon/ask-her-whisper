import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Send, Search, MessageSquare, Phone } from "lucide-react";

const API_URL = import.meta.env.VITE_API_URL || 'https://isa.inovapro.cloud/api';

interface Chat {
  id: string;
  chat_id: string;
  name: string;
  lastMessageText?: string;
  lastMessageAt?: string;
  unreadCount?: number;
}

interface Message {
  id: string;
  message_id: string;
  from_me: number;
  sender: string;
  body: string;
  timestamp: string;
}

export default function WhatsAppSupport() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [chats, setChats] = useState<Chat[]>([]);
  const [selectedChat, setSelectedChat] = useState<Chat | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputMessage, setInputMessage] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [sendingMessage, setSendingMessage] = useState(false);

  // Verificar autenticação
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/support-login');
      return;
    }

    loadChats();
  }, [navigate]);

  // Carregar conversas
  const loadChats = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');

      const response = await fetch(`${API_URL}/wa/chats?limit=100`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.status === 401) {
        navigate('/support-login');
        return;
      }

      if (!response.ok) {
        throw new Error(`Erro ao carregar chats: ${response.status}`);
      }

      const data = await response.json();
      console.log('✅ Chats carregados:', data);

      if (data.success && data.data) {
        setChats(data.data);
      }
    } catch (error) {
      console.error('❌ Erro ao carregar chats:', error);
    } finally {
      setLoading(false);
    }
  };

  // Carregar mensagens de um chat
  const loadMessages = async (chatId: string) => {
    try {
      const token = localStorage.getItem('token');

      const response = await fetch(`${API_URL}/wa/chats/${encodeURIComponent(chatId)}/messages?limit=100`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error(`Erro ao carregar mensagens: ${response.status}`);
      }

      const data = await response.json();
      console.log('✅ Mensagens carregadas:', data);

      if (data.success && data.data) {
        setMessages(data.data);
      }
    } catch (error) {
      console.error('❌ Erro ao carregar mensagens:', error);
    }
  };

  // Selecionar chat
  const handleSelectChat = (chat: Chat) => {
    setSelectedChat(chat);
    setMessages([]);
    loadMessages(chat.chat_id);
  };

  // Enviar mensagem
  const handleSendMessage = async () => {
    if (!inputMessage.trim() || !selectedChat || sendingMessage) return;

    try {
      setSendingMessage(true);
      const token = localStorage.getItem('token');

      const response = await fetch(`${API_URL}/wa/messages/send`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          chatId: selectedChat.chat_id,
          text: inputMessage
        })
      });

      if (!response.ok) {
        throw new Error(`Erro ao enviar mensagem: ${response.status}`);
      }

      const data = await response.json();
      console.log('✅ Mensagem enviada:', data);

      // Limpar input e recarregar mensagens
      setInputMessage("");
      await loadMessages(selectedChat.chat_id);

    } catch (error) {
      console.error('❌ Erro ao enviar mensagem:', error);
      alert('Erro ao enviar mensagem. Tente novamente.');
    } finally {
      setSendingMessage(false);
    }
  };

  // Filtrar chats
  const filteredChats = chats.filter(chat =>
    chat.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    chat.chat_id?.includes(searchTerm)
  );

  // Formatar timestamp
  const formatTime = (timestamp: string) => {
    try {
      const date = new Date(timestamp);
      const now = new Date();
      const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60);

      if (diffInHours < 24) {
        return date.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
      } else if (diffInHours < 168) {
        return date.toLocaleDateString('pt-BR', { weekday: 'short' });
      } else {
        return date.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' });
      }
    } catch {
      return '';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-gradient-to-br from-[#0f172a] via-[#1e1b4b] to-[#0f172a]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500 mx-auto mb-4"></div>
          <p className="text-white">Carregando conversas...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-gradient-to-br from-[#0f172a] via-[#1e1b4b] to-[#0f172a]">
      {/* Lista de Conversas */}
      <div className="w-full md:w-96 border-r border-gray-700 flex flex-col bg-gray-900/50 backdrop-blur">
        {/* Header */}
        <div className="p-4 border-b border-gray-700">
          <h1 className="text-xl font-bold text-white mb-3 flex items-center gap-2">
            <MessageSquare className="w-6 h-6 text-purple-400" />
            WhatsApp Support
          </h1>

          {/* Busca */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <Input
              type="text"
              placeholder="Buscar conversa..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 bg-gray-800 border-gray-700 text-white"
            />
          </div>
        </div>

        {/* Lista de Chats */}
        <ScrollArea className="flex-1">
          {filteredChats.length === 0 ? (
            <div className="p-8 text-center text-gray-400">
              <MessageSquare className="w-12 h-12 mx-auto mb-2 opacity-50" />
              <p>Nenhuma conversa encontrada</p>
            </div>
          ) : (
            <div>
              {filteredChats.map((chat) => (
                <button
                  key={chat.id}
                  onClick={() => handleSelectChat(chat)}
                  className={`w-full p-4 flex items-start gap-3 hover:bg-gray-800/50 transition-colors border-b border-gray-800 ${
                    selectedChat?.id === chat.id ? 'bg-gray-800/70' : ''
                  }`}
                >
                  <Avatar className="w-12 h-12 flex-shrink-0">
                    <AvatarFallback className="bg-purple-600 text-white">
                      {chat.name?.charAt(0)?.toUpperCase() || '?'}
                    </AvatarFallback>
                  </Avatar>

                  <div className="flex-1 min-w-0 text-left">
                    <div className="flex justify-between items-start mb-1">
                      <h3 className="font-semibold text-white truncate">
                        {chat.name || chat.chat_id}
                      </h3>
                      {chat.lastMessageAt && (
                        <span className="text-xs text-gray-400 ml-2 flex-shrink-0">
                          {formatTime(chat.lastMessageAt)}
                        </span>
                      )}
                    </div>

                    <p className="text-sm text-gray-400 truncate">
                      {chat.lastMessageText || 'Sem mensagens'}
                    </p>

                    {chat.unreadCount && chat.unreadCount > 0 && (
                      <span className="inline-block mt-1 px-2 py-0.5 text-xs bg-purple-600 text-white rounded-full">
                        {chat.unreadCount}
                      </span>
                    )}
                  </div>
                </button>
              ))}
            </div>
          )}
        </ScrollArea>
      </div>

      {/* Área de Mensagens */}
      <div className="flex-1 flex flex-col">
        {selectedChat ? (
          <>
            {/* Header do Chat */}
            <div className="p-4 border-b border-gray-700 bg-gray-900/50 backdrop-blur flex items-center gap-3">
              <Avatar className="w-10 h-10">
                <AvatarFallback className="bg-purple-600 text-white">
                  {selectedChat.name?.charAt(0)?.toUpperCase() || '?'}
                </AvatarFallback>
              </Avatar>

              <div className="flex-1">
                <h2 className="font-semibold text-white">
                  {selectedChat.name || selectedChat.chat_id}
                </h2>
                <p className="text-xs text-gray-400 flex items-center gap-1">
                  <Phone className="w-3 h-3" />
                  {selectedChat.chat_id.replace('@s.whatsapp.net', '')}
                </p>
              </div>
            </div>

            {/* Mensagens */}
            <ScrollArea className="flex-1 p-4 bg-[#0a0a0a]/50">
              <div className="space-y-3">
                {messages.map((message) => (
                  <div
                    key={message.id}
                    className={`flex ${message.from_me ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`max-w-[70%] rounded-lg p-3 ${
                        message.from_me
                          ? 'bg-purple-600 text-white'
                          : 'bg-gray-800 text-white border border-gray-700'
                      }`}
                    >
                      {!message.from_me && message.sender && (
                        <p className="text-xs text-purple-300 font-semibold mb-1">
                          {message.sender}
                        </p>
                      )}

                      <p className="text-sm whitespace-pre-wrap break-words">
                        {message.body}
                      </p>

                      <p className={`text-xs mt-1 ${
                        message.from_me ? 'text-purple-200' : 'text-gray-400'
                      }`}>
                        {formatTime(message.timestamp)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>

            {/* Input de Mensagem */}
            <div className="p-4 border-t border-gray-700 bg-gray-900/50 backdrop-blur">
              <div className="flex gap-2">
                <Input
                  type="text"
                  placeholder="Digite sua mensagem..."
                  value={inputMessage}
                  onChange={(e) => setInputMessage(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                  disabled={sendingMessage}
                  className="flex-1 bg-gray-800 border-gray-700 text-white"
                />
                <Button
                  onClick={handleSendMessage}
                  disabled={!inputMessage.trim() || sendingMessage}
                  className="bg-purple-600 hover:bg-purple-700 text-white"
                >
                  <Send className="w-5 h-5" />
                </Button>
              </div>
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center text-gray-400">
            <div className="text-center">
              <MessageSquare className="w-16 h-16 mx-auto mb-4 opacity-30" />
              <p className="text-lg">Selecione uma conversa para começar</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

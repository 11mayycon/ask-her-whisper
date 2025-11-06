import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Send, Brain, User, Sparkles } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { API_URL, fetchWithAuth } from '@/lib/api-config';
import ReactMarkdown from 'react-markdown';

interface Message {
  sender: 'user' | 'ai';
  text: string;
  timestamp: string;
}

const HISTORY_KEY = 'inovapro_ai_chat_history';

const AIChat = () => {
  const { toast } = useToast();
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const scrollAreaRef = useRef<HTMLDivElement>(null);

  // Load chat history on mount
  useEffect(() => {
    const savedHistory = localStorage.getItem(HISTORY_KEY);
    if (savedHistory) {
      try {
        const parsed = JSON.parse(savedHistory);
        // Keep only last 20 messages
        setMessages(parsed.slice(-20));
      } catch (error) {
        console.error('Error loading chat history:', error);
      }
    }

    // Show welcome message if no history
    if (!savedHistory || JSON.parse(savedHistory).length === 0) {
      setMessages([{
        sender: 'ai',
        text: 'Olá! 👋 Sou a **InovaPro AI**, sua assistente administrativa.\n\nPosso te ajudar com:\n• Status da equipe de suporte\n• Atendimentos em andamento\n• Mensagens recentes\n• Estatísticas do sistema\n• Status do WhatsApp\n\nO que você gostaria de saber?',
        timestamp: new Date().toISOString()
      }]);
    }
  }, []);

  // Save history to localStorage whenever messages change
  useEffect(() => {
    if (messages.length > 0) {
      localStorage.setItem(HISTORY_KEY, JSON.stringify(messages.slice(-20)));
    }
  }, [messages]);

  useEffect(() => {
    if (scrollAreaRef.current) {
      scrollAreaRef.current.scrollTo({ top: scrollAreaRef.current.scrollHeight, behavior: 'smooth' });
    }
  }, [messages]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage: Message = {
      sender: 'user',
      text: input,
      timestamp: new Date().toISOString()
    };
    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      const response = await fetchWithAuth(`${API_URL}/ai/chat`, {
        method: 'POST',
        body: JSON.stringify({
          query: input,
          history: messages
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Erro ao comunicar com a InovaPro AI');
      }

      const data = await response.json();

      const aiMessage: Message = {
        sender: 'ai',
        text: data.response || "Não recebi uma resposta válida da InovaPro AI.",
        timestamp: new Date().toISOString()
      };
      setMessages((prev) => [...prev, aiMessage]);

    } catch (error: any) {
      console.error('Erro ao chamar InovaPro AI:', error);

      toast({
        title: 'Erro na comunicação com a InovaPro AI',
        description: error.message || 'Ocorreu um erro desconhecido.',
        variant: 'destructive',
        duration: 10000,
      });

      setInput(userMessage.text);
      setMessages(prev => prev.slice(0, prev.length - 1));
    } finally {
      setIsLoading(false);
    }
  };

  const clearHistory = () => {
    setMessages([{
      sender: 'ai',
      text: 'Histórico limpo! 🧹\n\nComo posso ajudar você agora?',
      timestamp: new Date().toISOString()
    }]);
    localStorage.removeItem(HISTORY_KEY);
  };

  return (
    <div className="flex flex-col h-full bg-gradient-to-br from-slate-900 via-purple-900/20 to-slate-900 relative overflow-hidden">
      {/* Animated background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute w-96 h-96 bg-purple-500/10 rounded-full blur-3xl -top-48 -left-48 animate-pulse"></div>
        <div className="absolute w-96 h-96 bg-blue-500/10 rounded-full blur-3xl -bottom-48 -right-48 animate-pulse delay-1000"></div>
      </div>

      {/* Header */}
      <header className="relative z-10 p-4 border-b border-purple-500/20 backdrop-blur-sm bg-slate-900/50">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="relative">
              <Brain className="w-6 h-6 text-purple-400" />
              <Sparkles className="w-3 h-3 text-purple-300 absolute -top-1 -right-1 animate-pulse" />
            </div>
            <div>
              <h1 className="text-xl font-bold bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent">
                InovaPro AI
              </h1>
              <p className="text-xs text-purple-300/70">Assistente Administrativa</p>
            </div>
          </div>
          <Button
            onClick={clearHistory}
            variant="ghost"
            size="sm"
            className="text-purple-300 hover:text-purple-200 hover:bg-purple-500/10"
          >
            Limpar Chat
          </Button>
        </div>
      </header>

      {/* Messages */}
      <ScrollArea className="flex-1 p-4 relative z-10" ref={scrollAreaRef as any}>
        <div className="space-y-6 max-w-4xl mx-auto">
          {messages.map((message, index) => (
            <div key={index} className={`flex items-start gap-3 ${message.sender === 'user' ? 'justify-end' : ''}`}>
              {message.sender === 'ai' && (
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-purple-700 flex-shrink-0 flex items-center justify-center shadow-lg shadow-purple-500/50 border border-purple-400/30">
                  <Brain size={20} className="text-white" />
                </div>
              )}
              <div className={`relative max-w-2xl ${message.sender === 'user' ? 'ml-auto' : ''}`}>
                <div className={`p-4 rounded-2xl backdrop-blur-sm ${
                  message.sender === 'user'
                    ? 'bg-gradient-to-br from-blue-600 to-blue-700 text-white shadow-lg shadow-blue-500/30 border border-blue-400/30'
                    : 'bg-slate-800/80 text-slate-100 shadow-lg shadow-purple-500/10 border border-purple-500/20'
                }`}>
                  {message.sender === 'ai' ? (
                    <ReactMarkdown
                      components={{
                        p: ({ children }) => <p className="mb-2 last:mb-0">{children}</p>,
                        ul: ({ children }) => <ul className="mb-2 last:mb-0 space-y-1">{children}</ul>,
                        li: ({ children }) => <li className="text-slate-200">{children}</li>,
                      }}
                    >
                      {message.text}
                    </ReactMarkdown>
                  ) : (
                    <p className="text-sm whitespace-pre-wrap">{message.text}</p>
                  )}
                </div>
                <span className="text-xs text-slate-500 mt-1 block">
                  {new Date(message.timestamp).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>
              {message.sender === 'user' && (
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-600 to-blue-700 flex-shrink-0 flex items-center justify-center shadow-lg shadow-blue-500/50 border border-blue-400/30">
                  <User size={20} className="text-white" />
                </div>
              )}
            </div>
          ))}
          {isLoading && (
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-purple-700 flex-shrink-0 flex items-center justify-center shadow-lg shadow-purple-500/50 border border-purple-400/30 animate-pulse">
                <Brain size={20} className="text-white" />
              </div>
              <div className="p-4 rounded-2xl backdrop-blur-sm bg-slate-800/80 shadow-lg border border-purple-500/20">
                <div className="flex items-center gap-3">
                  <div className="flex gap-1">
                    <div className="w-2 h-2 bg-purple-400 rounded-full animate-bounce"></div>
                    <div className="w-2 h-2 bg-purple-400 rounded-full animate-bounce delay-100"></div>
                    <div className="w-2 h-2 bg-purple-400 rounded-full animate-bounce delay-200"></div>
                  </div>
                  <span className="text-sm text-slate-300">Coletando dados do sistema...</span>
                </div>
              </div>
            </div>
          )}
        </div>
      </ScrollArea>

      {/* Input */}
      <footer className="relative z-10 p-4 border-t border-purple-500/20 backdrop-blur-sm bg-slate-900/50">
        <form onSubmit={handleSendMessage} className="flex items-center gap-2 max-w-4xl mx-auto">
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="💬 Converse com a InovaPro AI sobre relatórios, WhatsApp e suporte..."
            className="flex-1 bg-slate-800/50 border-purple-500/30 text-white placeholder:text-slate-500 focus:border-purple-400 focus:ring-purple-400/50"
            disabled={isLoading}
          />
          <Button
            type="submit"
            disabled={isLoading || !input.trim()}
            className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 text-white shadow-lg shadow-purple-500/30 border border-purple-400/30"
          >
            <Send className="w-4 h-4" />
            <span className="sr-only">Enviar</span>
          </Button>
        </form>
      </footer>
    </div>
  );
};

export default AIChat;

import { useEffect, useRef, useState } from 'react';
import { io, Socket } from 'socket.io-client';
import { API_URL } from '@/lib/api-config';

interface UseWebSocketOptions {
  instanceName?: string;
  onNewMessage?: (message: any) => void;
  onConversationUpdated?: (data: any) => void;
  onConversationTaken?: (data: any) => void;
  onTyping?: (data: any) => void;
}

export const useWebSocket = (options: UseWebSocketOptions = {}) => {
  const { instanceName, onNewMessage, onConversationUpdated, onConversationTaken, onTyping } = options;

  const socketRef = useRef<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    // Criar conexão WebSocket
    const socket = io(API_URL.replace('/api', ''), {
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionAttempts: 5
    });

    socketRef.current = socket;

    socket.on('connect', () => {
      console.log('✅ WebSocket conectado:', socket.id);
      setIsConnected(true);

      // Entrar na sala da instância
      if (instanceName) {
        socket.emit('join:instance', instanceName);
      }
    });

    socket.on('disconnect', () => {
      console.log('❌ WebSocket desconectado');
      setIsConnected(false);
    });

    socket.on('connect_error', (error) => {
      console.error('❌ Erro na conexão WebSocket:', error);
      setIsConnected(false);
    });

    // Eventos personalizados
    socket.on('new:message', (message: any) => {
      console.log('📩 Nova mensagem via WebSocket:', message);
      onNewMessage?.(message);
    });

    socket.on('conversation:updated', (data: any) => {
      console.log('🔄 Conversa atualizada via WebSocket:', data);
      onConversationUpdated?.(data);
    });

    socket.on('conversation:taken', (data: any) => {
      console.log('👤 Conversa assumida via WebSocket:', data);
      onConversationTaken?.(data);
    });

    socket.on('chat:typing', (data: any) => {
      console.log('⌨️ Alguém está digitando:', data);
      onTyping?.(data);
    });

    // Cleanup
    return () => {
      if (instanceName) {
        socket.emit('leave:instance', instanceName);
      }
      socket.disconnect();
    };
  }, [instanceName, onNewMessage, onConversationUpdated, onConversationTaken, onTyping]);

  const emitTyping = (chatId: string, isTyping: boolean) => {
    if (socketRef.current && instanceName) {
      socketRef.current.emit('chat:typing', { instanceName, chatId, isTyping });
    }
  };

  return {
    socket: socketRef.current,
    isConnected,
    emitTyping
  };
};

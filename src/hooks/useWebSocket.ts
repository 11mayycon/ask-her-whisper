import { useEffect, useRef, useState } from 'react';
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

  const socketRef = useRef<any>(null);
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    // WebSocket desabilitado temporariamente - socket.io-client removido
    console.log('⚠️ WebSocket desabilitado - aguardando reinstalação do socket.io-client');
    
    return () => {
      // Cleanup se necessário
    };
  }, [instanceName, onNewMessage, onConversationUpdated, onConversationTaken, onTyping]);

  const emitTyping = (chatId: string, isTyping: boolean) => {
    console.log('⚠️ WebSocket desabilitado - não é possível emitir eventos');
  };

  return {
    socket: null,
    isConnected: false,
    emitTyping
  };
};

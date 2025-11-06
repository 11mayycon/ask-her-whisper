import { useState, useEffect } from 'react';
import { Wifi, WifiOff, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';

interface ConnectionStatusProps {
  onReconnect?: () => void;
}

export const ConnectionStatus = ({ onReconnect }: ConnectionStatusProps) => {
  const navigate = useNavigate();
  const [isConnected, setIsConnected] = useState(true);
  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    checkConnection();
    const interval = setInterval(checkConnection, 30000);
    return () => clearInterval(interval);
  }, []);

  const checkConnection = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      setIsConnected(!!user);
    } catch (error) {
      console.error('Erro ao verificar conexão:', error);
      setIsConnected(false);
    } finally {
      setIsChecking(false);
    }
  };

  const handleReconnect = () => {
    navigate('/admin/whatsapp');
    if (onReconnect) {
      onReconnect();
    }
  };

  if (isChecking) {
    return (
      <div className="bg-muted/30 border-b border-border/50 px-4 py-2 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <RefreshCw className="h-4 w-4 animate-spin text-muted-foreground" />
          <span className="text-sm text-muted-foreground">Verificando conexão...</span>
        </div>
      </div>
    );
  }

  if (!isConnected) {
    return (
      <div className="bg-amber-500/10 border-b border-amber-500/30 px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <WifiOff className="h-5 w-5 text-amber-600 dark:text-amber-400" />
          <div>
            <p className="text-sm font-medium text-amber-600 dark:text-amber-400">
              WhatsApp desconectado
            </p>
            <p className="text-xs text-amber-600/80 dark:text-amber-400/80">
              Conecte sua conta para começar a atender
            </p>
          </div>
        </div>
        <Button
          size="sm"
          variant="outline"
          onClick={handleReconnect}
          className="border-amber-500/30 hover:bg-amber-500/20"
        >
          <RefreshCw className="h-4 w-4 mr-2" />
          Reconectar
        </Button>
      </div>
    );
  }

  return (
    <div className="bg-gradient-to-r from-green-500/10 via-emerald-500/10 to-teal-500/10 border-b border-green-500/20 px-4 py-2">
      <div className="flex items-center gap-3">
        <div className="relative">
          <Wifi className="h-5 w-5 text-green-600 dark:text-green-400" />
          <div className="absolute -top-1 -right-1 w-2 h-2 bg-green-500 rounded-full animate-pulse" />
        </div>
        <div className="flex-1">
          <p className="text-sm font-medium text-green-600 dark:text-green-400">
            Sistema Conectado
          </p>
        </div>
      </div>
    </div>
  );
};

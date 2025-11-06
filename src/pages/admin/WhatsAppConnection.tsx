import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { QrCode, CheckCircle, XCircle, Loader2, Smartphone, RefreshCw } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";

const API_URL = import.meta.env.VITE_BACKEND_URL || '/api';

export default function WhatsAppConnection() {
  const { user } = useAuth();
  const [isConnected, setIsConnected] = useState(false);
  const [showQrCode, setShowQrCode] = useState(false);
  const [qrCode, setQrCode] = useState("");
  const [instanceName, setInstanceName] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [status, setStatus] = useState("Aguardando conexão...");
  const [isLoading, setIsLoading] = useState(false);
  const [statusCheckInterval, setStatusCheckInterval] = useState<NodeJS.Timeout | null>(null);

  // Verificar status ao carregar a página
  useEffect(() => {
    const checkInitialStatus = async () => {
      if (!user?.email) return;

      // Gerar nome da instância baseado no email
      const instance = `isa_${user.email.replace(/[@.]/g, '_')}`;
      setInstanceName(instance);

      try {
        // Verificar se já existe instância conectada
        const response = await fetch(`${API_URL}/whatsapp/status/${instance}`);
        const data = await response.json();

        if (data.success && data.state) {
          console.log('Status inicial da instância:', data.state);

          if (data.state === 'open' || data.state === 'connected') {
            // Instância já conectada
            setIsConnected(true);
            setShowQrCode(false);
            setStatus("✅ WhatsApp conectado com sucesso!");

            // Buscar informações da conexão se disponível
            if (data.status?.instance?.owner) {
              setPhoneNumber(data.status.instance.owner);
            }
          } else if (data.state === 'connecting') {
            // Ainda conectando, mostrar QR code se disponível
            setStatus("🔄 Conectando... Aguarde");
          }
        }
      } catch (error) {
        console.error('Erro ao verificar status inicial:', error);
        // Não mostrar erro, apenas deixar no estado inicial
      }
    };

    checkInitialStatus();
  }, [user?.email]);

  useEffect(() => {
    return () => {
      if (statusCheckInterval) {
        clearInterval(statusCheckInterval);
      }
    };
  }, [statusCheckInterval]);

  const handleConnect = async () => {
    if (!user?.email) {
      toast.error("Usuário não autenticado");
      return;
    }

    setIsLoading(true);
    setStatus("Criando instância...");

    try {
      const token = localStorage.getItem('auth_token');

      const response = await fetch(`${API_URL}/whatsapp/connect`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ email: user.email })
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Erro ao conectar');
      }

      const data = await response.json();

      if (data.success && data.qrcode) {
        setQrCode(data.qrcode);
        setInstanceName(data.instanceName);
        setShowQrCode(true);
        setStatus("📱 Escaneie o QR Code para conectar");
        toast.success("QR Code gerado! Escaneie com seu WhatsApp");

        // Iniciar verificação de status
        startStatusCheck(data.instanceName);
      } else {
        throw new Error('QR Code não foi gerado');
      }
    } catch (error: any) {
      console.error('Erro ao conectar:', error);
      toast.error(error.message || "Erro ao conectar WhatsApp");
      setStatus("Erro ao conectar");
    } finally {
      setIsLoading(false);
    }
  };

  const startStatusCheck = (instance: string) => {
    // Limpar intervalo anterior se existir
    if (statusCheckInterval) {
      clearInterval(statusCheckInterval);
    }

    // Verificar status a cada 5 segundos
    const interval = setInterval(async () => {
      try {
        const response = await fetch(`${API_URL}/whatsapp/status/${instance}`);
        const data = await response.json();

        if (data.success) {
          const connectionState = data.state || 'disconnected';

          console.log('Status da conexão:', connectionState);

          if (connectionState === 'open' || connectionState === 'connected') {
            setIsConnected(true);
            setShowQrCode(false);
            setQrCode("");
            setStatus("✅ WhatsApp conectado com sucesso!");
            toast.success("WhatsApp conectado e pronto!");

            // Parar verificação
            clearInterval(interval);
            setStatusCheckInterval(null);

            // Buscar informações da conexão
            if (data.status?.instance) {
              setPhoneNumber(data.status.instance.owner || 'Número não disponível');
            }
          } else if (connectionState === 'close' || connectionState === 'disconnected') {
            setStatus("🕐 Aguardando conexão... Escaneie o QR Code");
          } else if (connectionState === 'connecting') {
            setStatus("🔄 Conectando... Aguarde");
          } else {
            setStatus("⚠️ Sessão desconectada ou expirada");
          }
        } else {
          setStatus("⚠️ Erro ao verificar status da conexão");
        }
      } catch (error) {
        console.error('Erro ao verificar status:', error);
        setStatus("⚠️ Erro ao verificar status da conexão");
      }
    }, 5000);

    setStatusCheckInterval(interval);
  };

  const handleRefreshQR = async () => {
    if (!instanceName) {
      toast.error("Nenhuma instância ativa");
      return;
    }

    setIsLoading(true);
    setStatus("Atualizando QR Code...");

    try {
      const response = await fetch(`${API_URL}/whatsapp/qrcode/${instanceName}`);
      const data = await response.json();

      if (data.success) {
        // Se já está conectado, não há QR code
        if (!data.qrcode && (data.status === 'open' || data.status === 'connected')) {
          setIsConnected(true);
          setShowQrCode(false);
          setStatus("✅ WhatsApp já está conectado!");
          toast.info("WhatsApp já está conectado!");

          // Parar verificação de status se houver
          if (statusCheckInterval) {
            clearInterval(statusCheckInterval);
            setStatusCheckInterval(null);
          }
        } else if (data.qrcode) {
          setQrCode(data.qrcode);
          setShowQrCode(true);
          setStatus("📱 QR Code atualizado! Escaneie para conectar");
          toast.success("QR Code atualizado!");
        } else {
          throw new Error('QR Code não disponível');
        }
      } else {
        throw new Error(data.error || 'Erro ao obter novo QR Code');
      }
    } catch (error: any) {
      console.error('Erro ao atualizar QR:', error);
      toast.error(error.message || "Erro ao atualizar QR Code");
      setStatus("Erro ao atualizar QR Code");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDisconnect = async () => {
    if (!instanceName) {
      toast.error("Nenhuma instância ativa");
      return;
    }

    setIsLoading(true);
    setStatus("Desconectando...");

    try {
      const token = localStorage.getItem('auth_token');

      const response = await fetch(`${API_URL}/whatsapp/disconnect/${instanceName}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        setIsConnected(false);
        setShowQrCode(false);
        setQrCode("");
        setInstanceName("");
        setPhoneNumber("");
        setStatus("Desconectado");

        if (statusCheckInterval) {
          clearInterval(statusCheckInterval);
          setStatusCheckInterval(null);
        }

        toast.success("WhatsApp desconectado com sucesso");
      } else {
        throw new Error('Erro ao desconectar');
      }
    } catch (error: any) {
      console.error('Erro ao desconectar:', error);
      toast.error("Erro ao desconectar WhatsApp");
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusColor = () => {
    if (status.includes('sucesso') || status.includes('Conectado') || status.includes('✅')) return 'text-green-400';
    if (status.includes('Erro') || status.includes('erro') || status.includes('expirada') || status.includes('⚠️')) return 'text-red-400';
    return 'text-yellow-400';
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-gradient-to-br from-background via-background to-accent/5">
      <div className="w-full max-w-xl">
        <div className="flex flex-col items-center justify-center p-8 bg-gray-900 rounded-2xl shadow-lg">
          {/* Título */}
          <h2 className="text-2xl font-semibold text-white mb-1 flex items-center gap-2">
            <Smartphone className="h-7 w-7" />
            Conexão WhatsApp
          </h2>
          <p className="text-gray-400 mb-8 text-sm text-center">
            Conecte seu WhatsApp via Evolution API - Escaneie o QR Code para vincular
          </p>

          {/* Status Conectado */}
          {isConnected && (
            <div className="w-full mb-6">
              <div className="p-4 bg-green-500/10 border border-green-500 rounded-xl flex items-start gap-3">
                <CheckCircle className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                <div className="flex-1">
                  <p className="font-medium text-green-400">WhatsApp Conectado</p>
                  <p className="text-sm text-gray-400 mt-1">
                    Seu WhatsApp está conectado e funcionando normalmente.
                  </p>
                  {phoneNumber && (
                    <p className="text-sm text-gray-400 mt-1">
                      Número: {phoneNumber}
                    </p>
                  )}
                </div>
              </div>

              <Button
                onClick={handleDisconnect}
                variant="destructive"
                size="lg"
                className="w-full mt-4"
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                    Desconectando...
                  </>
                ) : (
                  <>
                    <XCircle className="mr-2 h-5 w-5" />
                    Desconectar WhatsApp
                  </>
                )}
              </Button>
            </div>
          )}

          {/* Botão Conectar */}
          {!isConnected && !showQrCode && (
            <div className="w-full text-center space-y-4">
              <div className="inline-flex items-center justify-center p-4 bg-primary/10 rounded-full mb-2">
                <Smartphone className="h-16 w-16 text-primary" />
              </div>
              <p className="text-gray-300 mb-4">
                Clique no botão abaixo para gerar o QR Code
              </p>
              <Button
                onClick={handleConnect}
                size="lg"
                className="w-full bg-blue-600 hover:bg-blue-700"
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                    Gerando QR Code...
                  </>
                ) : (
                  <>
                    <QrCode className="mr-2 h-5 w-5" />
                    Conectar WhatsApp
                  </>
                )}
              </Button>
            </div>
          )}

          {/* QR Code */}
          {showQrCode && (
            <div className="w-full space-y-4">
              {qrCode ? (
                <div className="flex justify-center">
                  <img
                    src={qrCode.startsWith('data:image') ? qrCode : `data:image/png;base64,${qrCode}`}
                    alt="QR Code WhatsApp"
                    className="w-72 h-72 object-contain rounded-xl shadow-md bg-white p-4"
                  />
                </div>
              ) : (
                <div className="w-72 h-72 mx-auto flex items-center justify-center bg-gray-800 rounded-xl">
                  <Loader2 className="h-8 w-8 text-gray-400 animate-spin" />
                </div>
              )}

              {/* Status */}
              <p className={`text-center text-sm font-medium ${getStatusColor()}`}>
                {status}
              </p>

              {/* Botão Atualizar */}
              <div className="flex justify-center">
                <Button
                  onClick={handleRefreshQR}
                  className="bg-blue-600 hover:bg-blue-700 text-white rounded-lg px-5 py-2 font-semibold shadow"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Atualizando...
                    </>
                  ) : (
                    <>
                      <RefreshCw className="mr-2 h-4 w-4" />
                      Atualizar QR Code
                    </>
                  )}
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { QrCode, CheckCircle, XCircle, Loader2 } from "lucide-react";
import { whatsappWJSClient } from "@/lib/whatsapp-wjs-client";

export default function WhatsAppConnection() {
  const [isConnected, setIsConnected] = useState(false);
  const [showQrCode, setShowQrCode] = useState(false);
  const [qrCode, setQrCode] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    // Verificar status inicial
    checkStatus();

    // Conectar ao WebSocket
    whatsappWJSClient.connectSocket({
      onQR: (qr) => {
        console.log('QR Code recebido');
        setQrCode(qr);
        setShowQrCode(true);
        setIsConnected(false);
      },
      onReady: () => {
        console.log('WhatsApp pronto');
        setIsConnected(true);
        setShowQrCode(false);
        setQrCode("");
        toast.success("WhatsApp conectado com sucesso!");
      },
      onAuthenticated: () => {
        console.log('WhatsApp autenticado');
        toast.success("WhatsApp autenticado!");
      },
      onMessage: (message) => {
        console.log('Nova mensagem:', message);
        // Aqui você pode processar a mensagem recebida
      },
      onDisconnected: (reason) => {
        console.log('WhatsApp desconectado:', reason);
        setIsConnected(false);
        setShowQrCode(false);
        toast.error("WhatsApp desconectado: " + reason);
      }
    });

    return () => {
      whatsappWJSClient.disconnectSocket();
    };
  }, []);

  const checkStatus = async () => {
    try {
      const response = await whatsappWJSClient.getStatus();
      if (response.success) {
        setIsConnected(response.status.isReady);
        if (response.status.hasQRCode && !response.status.isReady) {
          const qrResponse = await whatsappWJSClient.getQRCode();
          if (qrResponse.success && qrResponse.qrCode) {
            setQrCode(qrResponse.qrCode);
            setShowQrCode(true);
          }
        }
      }
    } catch (error) {
      console.error('Erro ao verificar status:', error);
    }
  };

  const handleRefreshQR = async () => {
    setIsLoading(true);
    try {
      await checkStatus();
    } catch (error) {
      toast.error("Erro ao atualizar QR Code");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDisconnect = async () => {
    setIsLoading(true);
    try {
      const response = await whatsappWJSClient.disconnect();
      if (response.success) {
        setIsConnected(false);
        setShowQrCode(false);
        setQrCode("");
        toast.success("WhatsApp desconectado com sucesso");
      }
    } catch (error) {
      toast.error("Erro ao desconectar WhatsApp");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-gradient-to-br from-background via-background to-accent/5">
      <Card className="w-full max-w-2xl">
        <CardHeader className="bg-gradient-to-r from-primary/10 via-primary/5 to-transparent">
          <CardTitle className="text-3xl">Conexão WhatsApp</CardTitle>
          <CardDescription>
            Conecte seu WhatsApp escaneando o QR Code via WhatsApp Web JS
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-6 pt-6">
          {error && (
            <div className="p-4 bg-destructive/10 border border-destructive rounded-lg flex items-start gap-3">
              <XCircle className="h-5 w-5 text-destructive mt-0.5" />
              <div>
                <p className="font-medium text-destructive">Erro na conexão</p>
                <p className="text-sm text-muted-foreground mt-1">{error}</p>
              </div>
            </div>
          )}

          {isConnected && (
            <div className="p-4 bg-primary/10 border border-primary rounded-lg flex items-start gap-3">
              <CheckCircle className="h-5 w-5 text-primary mt-0.5" />
              <div>
                <p className="font-medium text-primary">WhatsApp Conectado</p>
                <p className="text-sm text-muted-foreground mt-1">
                  Seu WhatsApp está conectado e funcionando normalmente via WhatsApp Web JS.
                </p>
              </div>
            </div>
          )}

          {!isConnected && !showQrCode && (
            <div className="text-center space-y-4">
              <Loader2 className="h-16 w-16 mx-auto text-muted-foreground animate-spin" />
              <p className="text-muted-foreground">
                Aguardando inicialização do WhatsApp Web JS...
              </p>
              <Button onClick={handleRefreshQR} variant="outline" disabled={isLoading}>
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Atualizando...
                  </>
                ) : (
                  <>
                    <QrCode className="mr-2 h-4 w-4" />
                    Atualizar Status
                  </>
                )}
              </Button>
            </div>
          )}

          {showQrCode && qrCode && (
            <div className="space-y-4">
              <div className="bg-white p-6 rounded-lg border-2 border-primary/20">
                <img 
                  src={qrCode} 
                  alt="QR Code WhatsApp" 
                  className="w-full max-w-[300px] mx-auto"
                />
              </div>
              <div className="text-center space-y-2">
                <p className="text-sm text-muted-foreground">
                  Abra o WhatsApp no seu celular e escaneie este QR Code
                </p>
                <p className="text-xs text-muted-foreground">
                  WhatsApp {'>'} Mais opções {'>'} Dispositivos conectados {'>'} Conectar dispositivo
                </p>
              </div>
              <Button onClick={handleRefreshQR} variant="outline" className="w-full" disabled={isLoading}>
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Atualizando...
                  </>
                ) : (
                  <>
                    <QrCode className="mr-2 h-4 w-4" />
                    Atualizar QR Code
                  </>
                )}
              </Button>
            </div>
          )}

          {isConnected && (
            <Button 
              onClick={handleDisconnect} 
              variant="destructive" 
              size="lg" 
              className="w-full"
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
          )}
        </CardContent>
      </Card>
    </div>
  );
}

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Smartphone, Wifi, WifiOff, QrCode, RefreshCw, 
  Power, CheckCircle, Loader2, AlertCircle
} from "lucide-react";
import { motion } from "framer-motion";
import { useToast } from "@/hooks/use-toast";

const ClientWhatsApp = () => {
  const { toast } = useToast();
  const [isConnected, setIsConnected] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [showQR, setShowQR] = useState(false);

  const handleConnect = async () => {
    setIsLoading(true);
    setShowQR(true);
    
    // Simulate connection process
    setTimeout(() => {
      setIsConnected(true);
      setShowQR(false);
      setIsLoading(false);
      toast({
        title: "WhatsApp conectado!",
        description: "Seu número foi vinculado com sucesso.",
      });
    }, 3000);
  };

  const handleDisconnect = () => {
    setIsConnected(false);
    toast({
      title: "WhatsApp desconectado",
      description: "Sua sessão foi encerrada.",
    });
  };

  const handleReconnect = async () => {
    setIsLoading(true);
    setTimeout(() => {
      setIsConnected(true);
      setIsLoading(false);
      toast({
        title: "Reconectado!",
        description: "Sessão restaurada com sucesso.",
      });
    }, 2000);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-foreground flex items-center gap-3">
          <Smartphone className="w-8 h-8 text-emerald-500" />
          WhatsApp
        </h1>
        <p className="text-muted-foreground mt-1">
          Gerencie sua conexão com o WhatsApp
        </p>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Connection Status */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <Card className="bg-card/50 backdrop-blur-sm border-border/50">
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span className="flex items-center gap-2">
                  {isConnected ? (
                    <Wifi className="w-5 h-5 text-emerald-400" />
                  ) : (
                    <WifiOff className="w-5 h-5 text-red-400" />
                  )}
                  Status da Conexão
                </span>
                <Badge className={isConnected 
                  ? "bg-emerald-500/20 text-emerald-400 border-emerald-500/30" 
                  : "bg-red-500/20 text-red-400 border-red-500/30"
                }>
                  {isConnected ? "Conectado" : "Desconectado"}
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {isConnected ? (
                <div className="space-y-4">
                  <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20">
                    <div className="flex items-center gap-3">
                      <CheckCircle className="w-8 h-8 text-emerald-400" />
                      <div>
                        <p className="font-semibold text-emerald-400">WhatsApp conectado</p>
                        <p className="text-sm text-muted-foreground">
                          Sua IA está ativa e respondendo mensagens
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <Button 
                      onClick={handleReconnect} 
                      variant="outline" 
                      className="h-12"
                      disabled={isLoading}
                    >
                      {isLoading ? (
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      ) : (
                        <RefreshCw className="w-4 h-4 mr-2" />
                      )}
                      Reconectar
                    </Button>
                    <Button 
                      onClick={handleDisconnect} 
                      variant="destructive" 
                      className="h-12"
                    >
                      <Power className="w-4 h-4 mr-2" />
                      Desconectar
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  {showQR ? (
                    <div className="text-center space-y-4">
                      <div className="w-48 h-48 mx-auto bg-white rounded-xl flex items-center justify-center">
                        {isLoading ? (
                          <Loader2 className="w-12 h-12 text-primary animate-spin" />
                        ) : (
                          <QrCode className="w-32 h-32 text-slate-800" />
                        )}
                      </div>
                      <p className="text-muted-foreground text-sm">
                        Escaneie o QR Code com seu WhatsApp
                      </p>
                    </div>
                  ) : (
                    <div className="p-4 rounded-xl bg-yellow-500/10 border border-yellow-500/20">
                      <div className="flex items-center gap-3">
                        <AlertCircle className="w-8 h-8 text-yellow-400" />
                        <div>
                          <p className="font-semibold text-yellow-400">WhatsApp não conectado</p>
                          <p className="text-sm text-muted-foreground">
                            Conecte seu WhatsApp para ativar o atendimento
                          </p>
                        </div>
                      </div>
                    </div>
                  )}

                  {!showQR && (
                    <Button 
                      onClick={handleConnect} 
                      className="w-full h-12 bg-gradient-to-r from-emerald-500 to-green-500 hover:from-emerald-600 hover:to-green-600"
                      disabled={isLoading}
                    >
                      {isLoading ? (
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      ) : (
                        <QrCode className="w-4 h-4 mr-2" />
                      )}
                      Conectar WhatsApp
                    </Button>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>

        {/* Instructions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Card className="bg-card/50 backdrop-blur-sm border-border/50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <QrCode className="w-5 h-5 text-primary" />
                Como conectar
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                {[
                  { step: 1, text: "Abra o WhatsApp no seu celular" },
                  { step: 2, text: "Vá em Configurações > Aparelhos conectados" },
                  { step: 3, text: "Toque em 'Conectar um aparelho'" },
                  { step: 4, text: "Escaneie o QR Code que aparece aqui" },
                ].map((item) => (
                  <div key={item.step} className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center text-primary font-semibold text-sm">
                      {item.step}
                    </div>
                    <span className="text-foreground">{item.text}</span>
                  </div>
                ))}
              </div>

              <div className="mt-6 p-4 rounded-xl bg-blue-500/10 border border-blue-500/20">
                <p className="text-sm text-blue-300">
                  💡 <strong>Dica:</strong> Mantenha seu celular conectado à internet para o WhatsApp Web funcionar corretamente.
                </p>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
};

export default ClientWhatsApp;

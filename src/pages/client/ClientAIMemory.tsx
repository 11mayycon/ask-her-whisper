import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Brain, Save, Loader2, Sparkles, History } from "lucide-react";
import { motion } from "framer-motion";
import { useToast } from "@/hooks/use-toast";

const ClientAIMemory = () => {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [memory, setMemory] = useState(`Você é a ISA, assistente virtual da empresa.

Comportamento:
- Seja sempre educada e profissional
- Responda de forma clara e objetiva
- Use emojis com moderação
- Identifique-se como ISA

Horário de atendimento: 8h às 18h
Fora do horário, informe que retornará no próximo dia útil.

Produtos/Serviços:
- Plano Básico: R$ 59,90/mês
- Plano Pro: R$ 99,90/mês
- Plano Enterprise: R$ 199,90/mês

Quando não souber responder, peça para o cliente aguardar que um atendente humano entrará em contato.`);

  const handleSave = async () => {
    setIsLoading(true);
    
    // Simulate API call
    setTimeout(() => {
      setIsLoading(false);
      toast({
        title: "Memória salva!",
        description: "As configurações da IA foram atualizadas.",
      });
    }, 1500);
  };

  const suggestions = [
    "Adicione informações sobre horários de funcionamento",
    "Descreva os produtos ou serviços que você oferece",
    "Defina como a IA deve se comportar em diferentes situações",
    "Inclua respostas para perguntas frequentes"
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-foreground flex items-center gap-3">
          <Brain className="w-8 h-8 text-purple-500" />
          Memória da IA
        </h1>
        <p className="text-muted-foreground mt-1">
          Configure como sua IA deve se comportar e responder
        </p>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Main Editor */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="lg:col-span-2"
        >
          <Card className="bg-card/50 backdrop-blur-sm border-border/50">
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span className="flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-purple-400" />
                  Instruções da IA
                </span>
                <span className="text-sm font-normal text-muted-foreground">
                  {memory.length} caracteres
                </span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Textarea
                value={memory}
                onChange={(e) => setMemory(e.target.value)}
                placeholder="Descreva como a IA deve se comportar..."
                className="min-h-[400px] bg-background/50 border-border/50 text-foreground resize-none font-mono text-sm"
              />
              
              <div className="flex justify-end">
                <Button 
                  onClick={handleSave}
                  disabled={isLoading}
                  className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Salvando...
                    </>
                  ) : (
                    <>
                      <Save className="w-4 h-4 mr-2" />
                      Salvar Alterações
                    </>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Sidebar */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="space-y-6"
        >
          {/* Tips */}
          <Card className="bg-card/50 backdrop-blur-sm border-border/50">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                💡 Dicas
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {suggestions.map((tip, index) => (
                <div 
                  key={index}
                  className="p-3 rounded-lg bg-muted/30 border border-border/30 text-sm text-muted-foreground"
                >
                  {tip}
                </div>
              ))}
            </CardContent>
          </Card>

          {/* History */}
          <Card className="bg-card/50 backdrop-blur-sm border-border/50">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <History className="w-5 h-5 text-muted-foreground" />
                Histórico
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {[
                { date: "Hoje, 14:30", action: "Memória atualizada" },
                { date: "Ontem, 10:15", action: "Horários alterados" },
                { date: "15/12, 09:00", action: "Versão inicial" },
              ].map((item, index) => (
                <div 
                  key={index}
                  className="flex justify-between items-center py-2 border-b border-border/30 last:border-0"
                >
                  <span className="text-sm text-foreground">{item.action}</span>
                  <span className="text-xs text-muted-foreground">{item.date}</span>
                </div>
              ))}
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
};

export default ClientAIMemory;

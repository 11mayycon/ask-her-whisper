import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Brain, Save, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const AdminAIConfig = () => {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [globalPrompt, setGlobalPrompt] = useState(`Você é a ISA, uma assistente virtual inteligente.

Regras gerais:
- Seja sempre educada e profissional
- Responda de forma clara e objetiva
- Identifique-se como ISA
- Não forneça informações pessoais de outros clientes
- Em caso de dúvidas complexas, direcione para suporte humano`);

  const handleSave = async () => {
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      toast({ title: "Configurações salvas!", description: "Prompt global atualizado." });
    }, 1500);
  };

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-foreground flex items-center gap-3">
        <Brain className="w-8 h-8 text-purple-500" />
        Configurações da IA
      </h1>

      <Card className="bg-card/50 backdrop-blur-sm border-border/50">
        <CardHeader>
          <CardTitle>Prompt Base Global</CardTitle>
          <p className="text-sm text-muted-foreground">
            Este prompt é aplicado a todas as IAs dos clientes como base
          </p>
        </CardHeader>
        <CardContent className="space-y-4">
          <Textarea
            value={globalPrompt}
            onChange={(e) => setGlobalPrompt(e.target.value)}
            className="min-h-[300px] bg-background/50 border-border/50 font-mono text-sm"
          />
          <Button onClick={handleSave} disabled={isLoading} className="bg-gradient-to-r from-purple-600 to-pink-600">
            {isLoading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
            Salvar
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminAIConfig;

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Brain, Save, Loader2, Sparkles, Shield, MessageSquare, 
  AlertTriangle, Plus, X, Volume2
} from "lucide-react";
import { motion } from "framer-motion";
import { useToast } from "@/hooks/use-toast";

const AdminAIConfig = () => {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  
  const [config, setConfig] = useState({
    globalPrompt: `Você é a ISA, uma assistente virtual inteligente e profissional.

PERSONALIDADE:
- Seja sempre educada, empática e profissional
- Use linguagem clara e acessível
- Responda de forma objetiva, mas acolhedora
- Use emojis com moderação (máximo 2 por mensagem)
- Sempre se identifique como "ISA, assistente virtual"

REGRAS DE ATENDIMENTO:
- Nunca forneça informações pessoais de outros clientes
- Em caso de dúvidas complexas, direcione para suporte humano
- Não faça promessas que não podem ser cumpridas
- Mantenha a conversa focada no objetivo do cliente

LIMITES:
- Não discuta política, religião ou temas controversos
- Não forneça conselhos médicos, jurídicos ou financeiros
- Não aceite pagamentos ou dados de cartão diretamente`,
    
    forbiddenWords: ["palavrão1", "palavrão2", "spam", "pirâmide"],
    
    legalRestrictions: `- Não fazer afirmações sobre garantias não comprovadas
- Não prometer resultados específicos
- Seguir LGPD para dados pessoais
- Manter registro de todas as conversas`,
    
    voiceTone: "profissional",
    
    responseTemplates: [
      { id: 1, name: "Saudação", content: "Olá! Sou a ISA, assistente virtual. Como posso ajudar você hoje? 😊" },
      { id: 2, name: "Despedida", content: "Foi um prazer ajudar! Se precisar de mais alguma coisa, estarei aqui. Até logo! 👋" },
      { id: 3, name: "Aguarde", content: "Entendi sua solicitação. Um momento, estou verificando as informações para você... ⏳" },
    ]
  });

  const [newWord, setNewWord] = useState("");
  const [newTemplate, setNewTemplate] = useState({ name: "", content: "" });

  const handleSave = async () => {
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      toast({ 
        title: "Configurações salvas!", 
        description: "As configurações globais da IA foram atualizadas." 
      });
    }, 1500);
  };

  const addForbiddenWord = () => {
    if (newWord && !config.forbiddenWords.includes(newWord)) {
      setConfig({ ...config, forbiddenWords: [...config.forbiddenWords, newWord] });
      setNewWord("");
    }
  };

  const removeForbiddenWord = (word: string) => {
    setConfig({ ...config, forbiddenWords: config.forbiddenWords.filter(w => w !== word) });
  };

  const addTemplate = () => {
    if (newTemplate.name && newTemplate.content) {
      setConfig({
        ...config,
        responseTemplates: [...config.responseTemplates, { 
          id: Date.now(), 
          ...newTemplate 
        }]
      });
      setNewTemplate({ name: "", content: "" });
    }
  };

  const removeTemplate = (id: number) => {
    setConfig({
      ...config,
      responseTemplates: config.responseTemplates.filter(t => t.id !== id)
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground flex items-center gap-3">
            <Brain className="w-8 h-8 text-purple-500" />
            Configurações da IA
          </h1>
          <p className="text-muted-foreground mt-1">
            Configure o comportamento global da IA para todos os clientes
          </p>
        </div>
        <Button 
          onClick={handleSave} 
          disabled={isLoading}
          className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
        >
          {isLoading ? (
            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
          ) : (
            <Save className="w-4 h-4 mr-2" />
          )}
          Salvar Tudo
        </Button>
      </div>

      <Tabs defaultValue="prompt" className="space-y-6">
        <TabsList className="bg-card/50 border border-border/50">
          <TabsTrigger value="prompt" className="gap-2">
            <Sparkles className="w-4 h-4" />
            Prompt Base
          </TabsTrigger>
          <TabsTrigger value="restrictions" className="gap-2">
            <Shield className="w-4 h-4" />
            Restrições
          </TabsTrigger>
          <TabsTrigger value="tone" className="gap-2">
            <Volume2 className="w-4 h-4" />
            Tom de Voz
          </TabsTrigger>
          <TabsTrigger value="templates" className="gap-2">
            <MessageSquare className="w-4 h-4" />
            Templates
          </TabsTrigger>
        </TabsList>

        {/* Prompt Base */}
        <TabsContent value="prompt">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <Card className="bg-card/50 backdrop-blur-sm border-border/50">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-purple-400" />
                  Prompt Base Global
                </CardTitle>
                <p className="text-sm text-muted-foreground">
                  Este prompt é aplicado como base para todas as IAs dos clientes
                </p>
              </CardHeader>
              <CardContent className="space-y-4">
                <Textarea
                  value={config.globalPrompt}
                  onChange={(e) => setConfig({ ...config, globalPrompt: e.target.value })}
                  className="min-h-[400px] bg-background/50 border-border/50 font-mono text-sm"
                />
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">
                    {config.globalPrompt.length} caracteres
                  </span>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </TabsContent>

        {/* Restrictions */}
        <TabsContent value="restrictions">
          <div className="grid lg:grid-cols-2 gap-6">
            {/* Forbidden Words */}
            <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>
              <Card className="bg-card/50 backdrop-blur-sm border-border/50 h-full">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <AlertTriangle className="w-5 h-5 text-red-400" />
                    Palavras Proibidas
                  </CardTitle>
                  <p className="text-sm text-muted-foreground">
                    A IA evitará usar ou responder com estas palavras
                  </p>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex gap-2">
                    <Input
                      placeholder="Adicionar palavra..."
                      value={newWord}
                      onChange={(e) => setNewWord(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && addForbiddenWord()}
                      className="bg-background/50"
                    />
                    <Button onClick={addForbiddenWord} size="icon">
                      <Plus className="w-4 h-4" />
                    </Button>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {config.forbiddenWords.map((word) => (
                      <Badge 
                        key={word} 
                        variant="secondary"
                        className="bg-red-500/20 text-red-400 border-red-500/30 pr-1"
                      >
                        {word}
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-4 w-4 ml-1 hover:bg-red-500/20"
                          onClick={() => removeForbiddenWord(word)}
                        >
                          <X className="w-3 h-3" />
                        </Button>
                      </Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {/* Legal Restrictions */}
            <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}>
              <Card className="bg-card/50 backdrop-blur-sm border-border/50 h-full">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Shield className="w-5 h-5 text-blue-400" />
                    Restrições Legais
                  </CardTitle>
                  <p className="text-sm text-muted-foreground">
                    Diretrizes legais que a IA deve seguir
                  </p>
                </CardHeader>
                <CardContent>
                  <Textarea
                    value={config.legalRestrictions}
                    onChange={(e) => setConfig({ ...config, legalRestrictions: e.target.value })}
                    className="min-h-[200px] bg-background/50 border-border/50 text-sm"
                  />
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </TabsContent>

        {/* Voice Tone */}
        <TabsContent value="tone">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <Card className="bg-card/50 backdrop-blur-sm border-border/50">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Volume2 className="w-5 h-5 text-cyan-400" />
                  Tom de Voz Global
                </CardTitle>
                <p className="text-sm text-muted-foreground">
                  Defina o estilo de comunicação padrão da IA
                </p>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {[
                    { value: "profissional", label: "Profissional", desc: "Formal e corporativo" },
                    { value: "amigavel", label: "Amigável", desc: "Casual e acolhedor" },
                    { value: "tecnico", label: "Técnico", desc: "Preciso e detalhado" },
                    { value: "vendedor", label: "Vendedor", desc: "Persuasivo e entusiasta" },
                  ].map((tone) => (
                    <div
                      key={tone.value}
                      onClick={() => setConfig({ ...config, voiceTone: tone.value })}
                      className={`p-4 rounded-xl border cursor-pointer transition-all ${
                        config.voiceTone === tone.value
                          ? 'bg-primary/20 border-primary'
                          : 'bg-muted/30 border-border/50 hover:border-primary/50'
                      }`}
                    >
                      <p className="font-semibold text-foreground">{tone.label}</p>
                      <p className="text-sm text-muted-foreground">{tone.desc}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </TabsContent>

        {/* Templates */}
        <TabsContent value="templates">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <Card className="bg-card/50 backdrop-blur-sm border-border/50">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MessageSquare className="w-5 h-5 text-green-400" />
                  Templates de Respostas
                </CardTitle>
                <p className="text-sm text-muted-foreground">
                  Respostas padrão que a IA pode usar
                </p>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Add new template */}
                <div className="p-4 rounded-xl bg-muted/30 border border-border/50 space-y-4">
                  <h4 className="font-semibold text-foreground">Adicionar Template</h4>
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Nome do template</Label>
                      <Input
                        placeholder="Ex: Saudação, Despedida..."
                        value={newTemplate.name}
                        onChange={(e) => setNewTemplate({ ...newTemplate, name: e.target.value })}
                        className="bg-background/50"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Conteúdo</Label>
                      <div className="flex gap-2">
                        <Input
                          placeholder="Texto do template..."
                          value={newTemplate.content}
                          onChange={(e) => setNewTemplate({ ...newTemplate, content: e.target.value })}
                          className="bg-background/50"
                        />
                        <Button onClick={addTemplate}>
                          <Plus className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Templates list */}
                <div className="space-y-3">
                  {config.responseTemplates.map((template) => (
                    <div 
                      key={template.id}
                      className="p-4 rounded-xl bg-muted/30 border border-border/50 flex items-start justify-between gap-4"
                    >
                      <div className="flex-1">
                        <Badge variant="outline" className="mb-2">{template.name}</Badge>
                        <p className="text-foreground">{template.content}</p>
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="text-red-400 hover:text-red-300 hover:bg-red-500/10"
                        onClick={() => removeTemplate(template.id)}
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AdminAIConfig;

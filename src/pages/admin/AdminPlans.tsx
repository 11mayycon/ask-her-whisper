import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { 
  Package, Plus, Edit, Trash2, CheckCircle, MessageSquare, 
  Users, Brain, Zap
} from "lucide-react";
import { motion } from "framer-motion";
import { useToast } from "@/hooks/use-toast";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

const AdminPlans = () => {
  const { toast } = useToast();
  const [dialogOpen, setDialogOpen] = useState(false);

  const [plans, setPlans] = useState([
    { 
      id: 1, 
      name: "Básico", 
      price: 59.90, 
      messages: 1000, 
      contacts: 100, 
      aiActive: true,
      features: ["Atendimento automático", "1 WhatsApp", "Suporte por email"],
      popular: false
    },
    { 
      id: 2, 
      name: "Pro", 
      price: 99.90, 
      messages: 5000, 
      contacts: 500, 
      aiActive: true,
      features: ["Tudo do Básico", "Relatórios avançados", "3 WhatsApps", "Suporte prioritário"],
      popular: true
    },
    { 
      id: 3, 
      name: "Enterprise", 
      price: 199.90, 
      messages: -1, 
      contacts: -1, 
      aiActive: true,
      features: ["Tudo do Pro", "WhatsApps ilimitados", "API dedicada", "Gerente de conta"],
      popular: false
    },
  ]);

  const [newPlan, setNewPlan] = useState({
    name: "",
    price: "",
    messages: "",
    contacts: "",
  });

  const handleCreatePlan = () => {
    if (newPlan.name && newPlan.price) {
      setPlans([...plans, {
        id: Date.now(),
        name: newPlan.name,
        price: parseFloat(newPlan.price),
        messages: parseInt(newPlan.messages) || 1000,
        contacts: parseInt(newPlan.contacts) || 100,
        aiActive: true,
        features: [],
        popular: false
      }]);
      setNewPlan({ name: "", price: "", messages: "", contacts: "" });
      setDialogOpen(false);
      toast({ title: "Plano criado!", description: `${newPlan.name} foi adicionado.` });
    }
  };

  const handleDelete = (id: number) => {
    setPlans(plans.filter(p => p.id !== id));
    toast({ title: "Plano removido", variant: "destructive" });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground flex items-center gap-3">
            <Package className="w-8 h-8 text-blue-500" />
            Planos e Assinaturas
          </h1>
          <p className="text-muted-foreground mt-1">
            Gerencie os planos disponíveis na plataforma
          </p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-gradient-to-r from-blue-600 to-purple-600">
              <Plus className="w-4 h-4 mr-2" /> Novo Plano
            </Button>
          </DialogTrigger>
          <DialogContent className="bg-card border-border">
            <DialogHeader>
              <DialogTitle>Criar Novo Plano</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label>Nome do Plano</Label>
                <Input
                  placeholder="Ex: Premium"
                  value={newPlan.name}
                  onChange={(e) => setNewPlan({ ...newPlan, name: e.target.value })}
                  className="bg-background/50"
                />
              </div>
              <div className="space-y-2">
                <Label>Preço (R$)</Label>
                <Input
                  type="number"
                  placeholder="99.90"
                  value={newPlan.price}
                  onChange={(e) => setNewPlan({ ...newPlan, price: e.target.value })}
                  className="bg-background/50"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Mensagens/mês</Label>
                  <Input
                    type="number"
                    placeholder="5000"
                    value={newPlan.messages}
                    onChange={(e) => setNewPlan({ ...newPlan, messages: e.target.value })}
                    className="bg-background/50"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Contatos</Label>
                  <Input
                    type="number"
                    placeholder="500"
                    value={newPlan.contacts}
                    onChange={(e) => setNewPlan({ ...newPlan, contacts: e.target.value })}
                    className="bg-background/50"
                  />
                </div>
              </div>
              <Button onClick={handleCreatePlan} className="w-full">
                Criar Plano
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Plans Grid */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {plans.map((plan, index) => (
          <motion.div
            key={plan.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <Card className={`bg-card/50 backdrop-blur-sm border-border/50 relative overflow-hidden ${
              plan.popular ? 'border-primary ring-2 ring-primary/20' : ''
            }`}>
              {plan.popular && (
                <div className="absolute top-4 right-4">
                  <Badge className="bg-primary text-primary-foreground">Popular</Badge>
                </div>
              )}
              <CardHeader>
                <CardTitle className="text-xl text-foreground">{plan.name}</CardTitle>
                <div className="flex items-baseline gap-1">
                  <span className="text-4xl font-bold text-foreground">
                    R$ {plan.price.toFixed(2).replace('.', ',')}
                  </span>
                  <span className="text-muted-foreground">/mês</span>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Limits */}
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-blue-500/20 flex items-center justify-center">
                      <MessageSquare className="w-4 h-4 text-blue-400" />
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Mensagens</p>
                      <p className="font-semibold text-foreground">
                        {plan.messages === -1 ? 'Ilimitadas' : plan.messages.toLocaleString() + '/mês'}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-emerald-500/20 flex items-center justify-center">
                      <Users className="w-4 h-4 text-emerald-400" />
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Contatos</p>
                      <p className="font-semibold text-foreground">
                        {plan.contacts === -1 ? 'Ilimitados' : plan.contacts.toLocaleString()}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-purple-500/20 flex items-center justify-center">
                      <Brain className="w-4 h-4 text-purple-400" />
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">IA</p>
                      <p className="font-semibold text-foreground">
                        {plan.aiActive ? 'Ativa' : 'Inativa'}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Features */}
                {plan.features.length > 0 && (
                  <div className="pt-4 border-t border-border/50 space-y-2">
                    {plan.features.map((feature, i) => (
                      <div key={i} className="flex items-center gap-2 text-sm">
                        <CheckCircle className="w-4 h-4 text-emerald-400" />
                        <span className="text-muted-foreground">{feature}</span>
                      </div>
                    ))}
                  </div>
                )}

                {/* Actions */}
                <div className="flex gap-2 pt-4">
                  <Button variant="outline" size="sm" className="flex-1">
                    <Edit className="w-4 h-4 mr-1" /> Editar
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="text-red-400 hover:text-red-300"
                    onClick={() => handleDelete(plan.id)}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

export default AdminPlans;

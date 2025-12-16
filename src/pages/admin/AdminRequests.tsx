import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ClipboardList, Check, X, Clock } from "lucide-react";
import { motion } from "framer-motion";
import { useToast } from "@/hooks/use-toast";

const AdminRequests = () => {
  const { toast } = useToast();
  
  const [requests, setRequests] = useState([
    { id: 1, name: "Carlos Mendes", email: "carlos@email.com", cpf: "123.456.789-00", phone: "(11) 98888-7777", date: "16/12/2024" },
    { id: 2, name: "Fernanda Lima", email: "fernanda@email.com", cpf: "987.654.321-00", phone: "(21) 97777-6666", date: "15/12/2024" },
  ]);

  const handleApprove = (id: number) => {
    setRequests(requests.filter(r => r.id !== id));
    toast({ title: "Aprovado!", description: "Cliente aprovado com sucesso." });
  };

  const handleReject = (id: number) => {
    setRequests(requests.filter(r => r.id !== id));
    toast({ title: "Reprovado", description: "Solicitação removida." });
  };

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-foreground flex items-center gap-3">
        <ClipboardList className="w-8 h-8 text-yellow-500" />
        Solicitações de Cadastro
        <Badge className="bg-yellow-500/20 text-yellow-400">{requests.length}</Badge>
      </h1>

      {requests.length === 0 ? (
        <Card className="bg-card/50 border-border/50">
          <CardContent className="p-12 text-center">
            <Clock className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
            <p className="text-muted-foreground">Nenhuma solicitação pendente</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {requests.map((req) => (
            <motion.div key={req.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
              <Card className="bg-card/50 border-border/50">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 flex-1">
                      <div>
                        <p className="text-sm text-muted-foreground">Nome</p>
                        <p className="font-medium text-foreground">{req.name}</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Email</p>
                        <p className="text-foreground">{req.email}</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">CPF</p>
                        <p className="text-foreground">{req.cpf}</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Telefone</p>
                        <p className="text-foreground">{req.phone}</p>
                      </div>
                    </div>
                    <div className="flex gap-2 ml-4">
                      <Button onClick={() => handleApprove(req.id)} className="bg-emerald-600 hover:bg-emerald-700">
                        <Check className="w-4 h-4 mr-1" /> Aprovar
                      </Button>
                      <Button onClick={() => handleReject(req.id)} variant="destructive">
                        <X className="w-4 h-4 mr-1" /> Reprovar
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
};

export default AdminRequests;

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  ClipboardList, Check, X, Clock, User, Mail, Phone, CreditCard, Calendar
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useToast } from "@/hooks/use-toast";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const AdminRequests = () => {
  const { toast } = useToast();
  const [approvalDialog, setApprovalDialog] = useState<{ open: boolean; request: any }>({ 
    open: false, 
    request: null 
  });
  const [selectedDays, setSelectedDays] = useState("30");
  
  const [requests, setRequests] = useState([
    { id: 1, name: "Carlos Mendes", email: "carlos@email.com", cpf: "123.456.789-00", phone: "(11) 98888-7777", date: "16/12/2024 14:30" },
    { id: 2, name: "Fernanda Lima", email: "fernanda@email.com", cpf: "987.654.321-00", phone: "(21) 97777-6666", date: "16/12/2024 10:15" },
    { id: 3, name: "Roberto Alves", email: "roberto@email.com", cpf: "456.789.123-00", phone: "(31) 96666-5555", date: "15/12/2024 18:45" },
    { id: 4, name: "Juliana Costa", email: "juliana@email.com", cpf: "789.123.456-00", phone: "(41) 95555-4444", date: "15/12/2024 09:20" },
  ]);

  const handleApprove = (request: any) => {
    setApprovalDialog({ open: true, request });
  };

  const confirmApproval = () => {
    if (approvalDialog.request) {
      setRequests(requests.filter(r => r.id !== approvalDialog.request.id));
      toast({ 
        title: "Cliente Aprovado!", 
        description: `${approvalDialog.request.name} foi aprovado com ${selectedDays} dias de acesso.` 
      });
      setApprovalDialog({ open: false, request: null });
    }
  };

  const handleReject = (id: number, name: string) => {
    setRequests(requests.filter(r => r.id !== id));
    toast({ 
      title: "Solicitação Reprovada", 
      description: `Cadastro de ${name} foi removido.`,
      variant: "destructive"
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground flex items-center gap-3">
            <ClipboardList className="w-8 h-8 text-yellow-500" />
            Solicitações de Cadastro
          </h1>
          <p className="text-muted-foreground mt-1">
            Aprove ou reprove solicitações de novos clientes
          </p>
        </div>
        <Badge className="bg-yellow-500/20 text-yellow-400 border-yellow-500/30 text-lg px-4 py-2">
          {requests.length} pendentes
        </Badge>
      </div>

      {/* Requests List */}
      {requests.length === 0 ? (
        <Card className="bg-card/50 border-border/50">
          <CardContent className="p-12 text-center">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-emerald-500/20 flex items-center justify-center">
              <Check className="w-8 h-8 text-emerald-400" />
            </div>
            <h3 className="text-xl font-semibold text-foreground mb-2">Tudo em dia!</h3>
            <p className="text-muted-foreground">Nenhuma solicitação pendente no momento</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          <AnimatePresence>
            {requests.map((req, index) => (
              <motion.div 
                key={req.id} 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, x: -100 }}
                transition={{ delay: index * 0.1 }}
              >
                <Card className="bg-card/50 backdrop-blur-sm border-border/50 hover:border-primary/30 transition-all">
                  <CardContent className="p-6">
                    <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                      {/* User Info */}
                      <div className="flex items-start gap-4 flex-1">
                        <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-white font-bold text-xl flex-shrink-0">
                          {req.name[0]}
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 flex-1">
                          <div>
                            <div className="flex items-center gap-2 text-muted-foreground text-sm mb-1">
                              <User className="w-4 h-4" />
                              Nome
                            </div>
                            <p className="font-semibold text-foreground">{req.name}</p>
                          </div>
                          <div>
                            <div className="flex items-center gap-2 text-muted-foreground text-sm mb-1">
                              <Mail className="w-4 h-4" />
                              Email
                            </div>
                            <p className="text-foreground">{req.email}</p>
                          </div>
                          <div>
                            <div className="flex items-center gap-2 text-muted-foreground text-sm mb-1">
                              <CreditCard className="w-4 h-4" />
                              CPF
                            </div>
                            <p className="text-foreground">{req.cpf}</p>
                          </div>
                          <div>
                            <div className="flex items-center gap-2 text-muted-foreground text-sm mb-1">
                              <Phone className="w-4 h-4" />
                              Telefone
                            </div>
                            <p className="text-foreground">{req.phone}</p>
                          </div>
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="flex items-center gap-3">
                        <div className="text-right mr-4 hidden lg:block">
                          <div className="flex items-center gap-2 text-muted-foreground text-sm">
                            <Calendar className="w-4 h-4" />
                            {req.date}
                          </div>
                        </div>
                        <Button 
                          onClick={() => handleApprove(req)} 
                          className="bg-emerald-600 hover:bg-emerald-700 min-w-[120px]"
                        >
                          <Check className="w-4 h-4 mr-2" /> Aprovar
                        </Button>
                        <Button 
                          onClick={() => handleReject(req.id, req.name)} 
                          variant="destructive"
                          className="min-w-[120px]"
                        >
                          <X className="w-4 h-4 mr-2" /> Reprovar
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}

      {/* Approval Dialog */}
      <Dialog open={approvalDialog.open} onOpenChange={(open) => setApprovalDialog({ ...approvalDialog, open })}>
        <DialogContent className="bg-card border-border">
          <DialogHeader>
            <DialogTitle>Aprovar Cliente</DialogTitle>
            <DialogDescription>
              Defina o período de acesso para {approvalDialog.request?.name}
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <label className="text-sm text-muted-foreground">Período de Acesso</label>
              <Select value={selectedDays} onValueChange={setSelectedDays}>
                <SelectTrigger className="bg-background/50">
                  <SelectValue placeholder="Selecione o período" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="7">7 dias</SelectItem>
                  <SelectItem value="15">15 dias</SelectItem>
                  <SelectItem value="30">30 dias</SelectItem>
                  <SelectItem value="60">60 dias</SelectItem>
                  <SelectItem value="90">90 dias</SelectItem>
                  <SelectItem value="365">1 ano</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="p-4 rounded-xl bg-blue-500/10 border border-blue-500/20">
              <p className="text-sm text-blue-300">
                <strong>Resumo:</strong> O cliente terá acesso por {selectedDays} dias a partir da aprovação.
              </p>
            </div>
          </div>

          <div className="flex gap-3 justify-end">
            <Button variant="outline" onClick={() => setApprovalDialog({ open: false, request: null })}>
              Cancelar
            </Button>
            <Button onClick={confirmApproval} className="bg-emerald-600 hover:bg-emerald-700">
              Confirmar Aprovação
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminRequests;

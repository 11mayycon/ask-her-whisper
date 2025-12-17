import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  ClipboardList, Check, X, User, Mail, Phone, CreditCard, Calendar, Loader2, RefreshCw
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
import { supabase } from "@/integrations/supabase/client";

interface PendingRequest {
  id: string;
  name: string;
  email: string;
  cpf: string;
  phone?: string;
  created_at: string;
}

const AdminRequests = () => {
  const { toast } = useToast();
  const [approvalDialog, setApprovalDialog] = useState<{ open: boolean; request: PendingRequest | null }>({ 
    open: false, 
    request: null 
  });
  const [selectedDays, setSelectedDays] = useState("30");
  const [requests, setRequests] = useState<PendingRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  const fetchPendingRequests = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('users')
        .select('id, name, email, cpf, created_at')
        .eq('is_active', false)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching pending requests:', error);
        toast({
          title: "Erro ao carregar solicitações",
          description: error.message,
          variant: "destructive"
        });
        return;
      }

      // Map data and try to get phone from auth metadata if needed
      const mappedData: PendingRequest[] = (data || []).map(user => ({
        id: user.id,
        name: user.name || 'Nome não informado',
        email: user.email,
        cpf: user.cpf || 'CPF não informado',
        phone: '', // We'll try to get this from auth metadata
        created_at: user.created_at
      }));

      setRequests(mappedData);
    } catch (err) {
      console.error('Error:', err);
      toast({
        title: "Erro ao carregar",
        description: "Não foi possível carregar as solicitações pendentes.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPendingRequests();
  }, []);

  const handleApprove = (request: PendingRequest) => {
    setApprovalDialog({ open: true, request });
  };

  const confirmApproval = async () => {
    if (!approvalDialog.request) return;

    setActionLoading(approvalDialog.request.id);
    try {
      // Calculate expiration date
      const expiresAt = new Date();
      expiresAt.setDate(expiresAt.getDate() + parseInt(selectedDays));

      // Update user to active with expiration
      const { error } = await supabase
        .from('users')
        .update({ 
          is_active: true,
          expires_at: expiresAt.toISOString(),
          approved_at: new Date().toISOString()
        })
        .eq('id', approvalDialog.request.id);

      if (error) {
        console.error('Error approving user:', error);
        toast({
          title: "Erro ao aprovar",
          description: error.message,
          variant: "destructive"
        });
        return;
      }

      // Remove from local state
      setRequests(requests.filter(r => r.id !== approvalDialog.request!.id));
      
      toast({ 
        title: "Cliente Aprovado!", 
        description: `${approvalDialog.request.name} foi aprovado com ${selectedDays} dias de acesso.` 
      });
      
      setApprovalDialog({ open: false, request: null });
    } catch (err) {
      console.error('Error:', err);
      toast({
        title: "Erro ao aprovar",
        description: "Não foi possível aprovar o cliente.",
        variant: "destructive"
      });
    } finally {
      setActionLoading(null);
    }
  };

  const handleReject = async (request: PendingRequest) => {
    setActionLoading(request.id);
    try {
      // Delete user from users table
      const { error: deleteError } = await supabase
        .from('users')
        .delete()
        .eq('id', request.id);

      if (deleteError) {
        console.error('Error deleting user:', deleteError);
        toast({
          title: "Erro ao reprovar",
          description: deleteError.message,
          variant: "destructive"
        });
        return;
      }

      // Try to delete from auth (this may fail if user doesn't have admin rights)
      // The user record in users table is the main concern
      
      setRequests(requests.filter(r => r.id !== request.id));
      toast({ 
        title: "Solicitação Reprovada", 
        description: `Cadastro de ${request.name} foi removido.`,
        variant: "destructive"
      });
    } catch (err) {
      console.error('Error:', err);
      toast({
        title: "Erro ao reprovar",
        description: "Não foi possível remover a solicitação.",
        variant: "destructive"
      });
    } finally {
      setActionLoading(null);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatCPF = (cpf: string) => {
    const cleaned = cpf.replace(/\D/g, '');
    if (cleaned.length === 11) {
      return cleaned.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
    }
    return cpf;
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
        <div className="flex items-center gap-3">
          <Button 
            variant="outline" 
            size="icon"
            onClick={fetchPendingRequests}
            disabled={loading}
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </Button>
          <Badge className="bg-yellow-500/20 text-yellow-400 border-yellow-500/30 text-lg px-4 py-2">
            {requests.length} pendentes
          </Badge>
        </div>
      </div>

      {/* Loading State */}
      {loading ? (
        <Card className="bg-card/50 border-border/50">
          <CardContent className="p-12 text-center">
            <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-primary" />
            <p className="text-muted-foreground">Carregando solicitações...</p>
          </CardContent>
        </Card>
      ) : requests.length === 0 ? (
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
                          {req.name[0]?.toUpperCase() || '?'}
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
                            <p className="text-foreground text-sm break-all">{req.email}</p>
                          </div>
                          <div>
                            <div className="flex items-center gap-2 text-muted-foreground text-sm mb-1">
                              <CreditCard className="w-4 h-4" />
                              CPF
                            </div>
                            <p className="text-foreground">{formatCPF(req.cpf)}</p>
                          </div>
                          <div>
                            <div className="flex items-center gap-2 text-muted-foreground text-sm mb-1">
                              <Calendar className="w-4 h-4" />
                              Data do Cadastro
                            </div>
                            <p className="text-foreground text-sm">{formatDate(req.created_at)}</p>
                          </div>
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="flex items-center gap-3">
                        <Button 
                          onClick={() => handleApprove(req)} 
                          className="bg-emerald-600 hover:bg-emerald-700 min-w-[120px]"
                          disabled={actionLoading === req.id}
                        >
                          {actionLoading === req.id ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                          ) : (
                            <>
                              <Check className="w-4 h-4 mr-2" /> Aprovar
                            </>
                          )}
                        </Button>
                        <Button 
                          onClick={() => handleReject(req)} 
                          variant="destructive"
                          className="min-w-[120px]"
                          disabled={actionLoading === req.id}
                        >
                          {actionLoading === req.id ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                          ) : (
                            <>
                              <X className="w-4 h-4 mr-2" /> Reprovar
                            </>
                          )}
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
            <Button 
              onClick={confirmApproval} 
              className="bg-emerald-600 hover:bg-emerald-700"
              disabled={actionLoading !== null}
            >
              {actionLoading ? (
                <Loader2 className="w-4 h-4 animate-spin mr-2" />
              ) : null}
              Confirmar Aprovação
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminRequests;

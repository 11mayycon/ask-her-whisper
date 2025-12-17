import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { 
  Users, Search, MoreVertical, CheckCircle, XCircle, Clock, 
  Ban, RefreshCw, Eye, Trash2, Edit, Loader2
} from "lucide-react";
import { motion } from "framer-motion";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface Client {
  id: string;
  name: string;
  email: string;
  cpf: string | null;
  phone: string | null;
  is_active: boolean | null;
  expires_at: string | null;
  approved_at: string | null;
  created_at: string | null;
}

const AdminClients = () => {
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState("");
  const [filter, setFilter] = useState<string>("all");
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [renewDialog, setRenewDialog] = useState<{ open: boolean; client: Client | null }>({ open: false, client: null });
  const [selectedDays, setSelectedDays] = useState("30");

  const fetchClients = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching clients:', error);
        toast({
          title: "Erro ao carregar clientes",
          description: error.message,
          variant: "destructive"
        });
        return;
      }

      setClients(data || []);
    } catch (err) {
      console.error('Error:', err);
      toast({
        title: "Erro ao carregar",
        description: "Não foi possível carregar os clientes.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchClients();
  }, []);

  const getClientStatus = (client: Client): string => {
    if (!client.is_active && !client.approved_at) return "pending";
    if (!client.is_active) return "blocked";
    if (client.expires_at && new Date(client.expires_at) < new Date()) return "expired";
    return "active";
  };

  const getDaysRemaining = (expiresAt: string | null): number => {
    if (!expiresAt) return 0;
    const now = new Date();
    const expires = new Date(expiresAt);
    const diff = expires.getTime() - now.getTime();
    return Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)));
  };

  const filteredClients = clients.filter(c => {
    const matchesSearch = c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (c.cpf && c.cpf.includes(searchTerm));
    
    const status = getClientStatus(c);
    if (filter === "all") return matchesSearch;
    return matchesSearch && status === filter;
  });

  const getStatusBadge = (status: string) => {
    const styles = {
      active: "bg-emerald-500/20 text-emerald-400 border-emerald-500/30",
      expired: "bg-red-500/20 text-red-400 border-red-500/30",
      blocked: "bg-slate-500/20 text-slate-400 border-slate-500/30",
      pending: "bg-yellow-500/20 text-yellow-400 border-yellow-500/30",
    };
    const labels = {
      active: "Ativo",
      expired: "Expirado",
      blocked: "Bloqueado",
      pending: "Pendente",
    };
    return <Badge className={styles[status as keyof typeof styles]}>{labels[status as keyof typeof labels]}</Badge>;
  };

  const handleBlock = async (client: Client) => {
    setActionLoading(client.id);
    try {
      const { error } = await supabase
        .from('users')
        .update({ is_active: false })
        .eq('id', client.id);

      if (error) throw error;

      toast({ title: "Cliente bloqueado", description: `${client.name} foi bloqueado.` });
      fetchClients();
    } catch (err: any) {
      toast({ title: "Erro", description: err.message, variant: "destructive" });
    } finally {
      setActionLoading(null);
    }
  };

  const handleUnblock = async (client: Client) => {
    setActionLoading(client.id);
    try {
      const { error } = await supabase
        .from('users')
        .update({ is_active: true })
        .eq('id', client.id);

      if (error) throw error;

      toast({ title: "Cliente desbloqueado", description: `${client.name} foi desbloqueado.` });
      fetchClients();
    } catch (err: any) {
      toast({ title: "Erro", description: err.message, variant: "destructive" });
    } finally {
      setActionLoading(null);
    }
  };

  const handleRenew = (client: Client) => {
    setRenewDialog({ open: true, client });
  };

  const confirmRenew = async () => {
    if (!renewDialog.client) return;

    setActionLoading(renewDialog.client.id);
    try {
      const expiresAt = new Date();
      expiresAt.setDate(expiresAt.getDate() + parseInt(selectedDays));

      const { error } = await supabase
        .from('users')
        .update({ 
          expires_at: expiresAt.toISOString(),
          is_active: true
        })
        .eq('id', renewDialog.client.id);

      if (error) throw error;

      toast({ 
        title: "Acesso renovado!", 
        description: `${renewDialog.client.name} tem agora ${selectedDays} dias de acesso.` 
      });
      setRenewDialog({ open: false, client: null });
      fetchClients();
    } catch (err: any) {
      toast({ title: "Erro", description: err.message, variant: "destructive" });
    } finally {
      setActionLoading(null);
    }
  };

  const handleDelete = async (client: Client) => {
    if (!confirm(`Tem certeza que deseja excluir ${client.name}?`)) return;

    setActionLoading(client.id);
    try {
      const { error } = await supabase
        .from('users')
        .delete()
        .eq('id', client.id);

      if (error) throw error;

      toast({ title: "Cliente excluído", description: `${client.name} foi removido.`, variant: "destructive" });
      fetchClients();
    } catch (err: any) {
      toast({ title: "Erro", description: err.message, variant: "destructive" });
    } finally {
      setActionLoading(null);
    }
  };

  const statusCounts = {
    all: clients.length,
    active: clients.filter(c => getClientStatus(c) === "active").length,
    pending: clients.filter(c => getClientStatus(c) === "pending").length,
    expired: clients.filter(c => getClientStatus(c) === "expired").length,
    blocked: clients.filter(c => getClientStatus(c) === "blocked").length,
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleDateString('pt-BR');
  };

  const formatCPF = (cpf: string | null) => {
    if (!cpf) return '-';
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
            <Users className="w-8 h-8 text-primary" />
            Gestão de Clientes
          </h1>
          <p className="text-muted-foreground mt-1">
            Gerencie todos os clientes da plataforma
          </p>
        </div>
        <Button onClick={fetchClients} variant="outline" size="icon" disabled={loading}>
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
        </Button>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3">
        {[
          { key: "all", label: "Todos" },
          { key: "active", label: "Ativos" },
          { key: "pending", label: "Pendentes" },
          { key: "expired", label: "Expirados" },
          { key: "blocked", label: "Bloqueados" },
        ].map((f) => (
          <Button
            key={f.key}
            variant={filter === f.key ? "default" : "outline"}
            size="sm"
            onClick={() => setFilter(f.key)}
            className={filter === f.key ? "" : "bg-card/50"}
          >
            {f.label}
            <Badge variant="secondary" className="ml-2">
              {statusCounts[f.key as keyof typeof statusCounts]}
            </Badge>
          </Button>
        ))}
      </div>

      {/* Search */}
      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input
          placeholder="Buscar por nome, email ou CPF..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10 bg-card/50"
        />
      </div>

      {/* Table */}
      <Card className="bg-card/50 backdrop-blur-sm border-border/50">
        <CardContent className="p-0">
          {loading ? (
            <div className="p-12 text-center">
              <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-primary" />
              <p className="text-muted-foreground">Carregando clientes...</p>
            </div>
          ) : filteredClients.length === 0 ? (
            <div className="p-12 text-center">
              <Users className="w-12 h-12 mx-auto mb-4 text-muted-foreground/50" />
              <p className="text-muted-foreground">Nenhum cliente encontrado</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border/50">
                    <th className="text-left p-4 text-muted-foreground font-medium">Cliente</th>
                    <th className="text-left p-4 text-muted-foreground font-medium">CPF</th>
                    <th className="text-left p-4 text-muted-foreground font-medium">Status</th>
                    <th className="text-left p-4 text-muted-foreground font-medium">Dias Restantes</th>
                    <th className="text-left p-4 text-muted-foreground font-medium">Criado em</th>
                    <th className="text-left p-4 text-muted-foreground font-medium">Ações</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredClients.map((client, index) => {
                    const status = getClientStatus(client);
                    const daysRemaining = getDaysRemaining(client.expires_at);
                    
                    return (
                      <motion.tr 
                        key={client.id}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: index * 0.05 }}
                        className="border-b border-border/30 hover:bg-muted/30"
                      >
                        <td className="p-4">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-white font-bold">
                              {client.name[0]?.toUpperCase() || '?'}
                            </div>
                            <div>
                              <p className="font-medium text-foreground">{client.name}</p>
                              <p className="text-sm text-muted-foreground">{client.email}</p>
                            </div>
                          </div>
                        </td>
                        <td className="p-4 text-foreground">{formatCPF(client.cpf)}</td>
                        <td className="p-4">{getStatusBadge(status)}</td>
                        <td className="p-4">
                          {status === 'pending' ? (
                            <span className="text-muted-foreground">-</span>
                          ) : (
                            <span className={daysRemaining <= 7 ? "text-yellow-400" : "text-foreground"}>
                              {daysRemaining} dias
                            </span>
                          )}
                        </td>
                        <td className="p-4 text-foreground">{formatDate(client.created_at)}</td>
                        <td className="p-4">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="sm" disabled={actionLoading === client.id}>
                                {actionLoading === client.id ? (
                                  <Loader2 className="w-4 h-4 animate-spin" />
                                ) : (
                                  <MoreVertical className="w-4 h-4" />
                                )}
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem onClick={() => handleRenew(client)}>
                                <RefreshCw className="w-4 h-4 mr-2" /> Renovar acesso
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              {status === "blocked" || !client.is_active ? (
                                <DropdownMenuItem onClick={() => handleUnblock(client)}>
                                  <CheckCircle className="w-4 h-4 mr-2" /> Desbloquear
                                </DropdownMenuItem>
                              ) : (
                                <DropdownMenuItem onClick={() => handleBlock(client)} className="text-yellow-400">
                                  <Ban className="w-4 h-4 mr-2" /> Bloquear
                                </DropdownMenuItem>
                              )}
                              <DropdownMenuItem onClick={() => handleDelete(client)} className="text-red-400">
                                <Trash2 className="w-4 h-4 mr-2" /> Excluir
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </td>
                      </motion.tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Renew Dialog */}
      <Dialog open={renewDialog.open} onOpenChange={(open) => setRenewDialog({ ...renewDialog, open })}>
        <DialogContent className="bg-card border-border">
          <DialogHeader>
            <DialogTitle>Renovar Acesso</DialogTitle>
            <DialogDescription>
              Defina o novo período de acesso para {renewDialog.client?.name}
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
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

          <DialogFooter>
            <Button variant="outline" onClick={() => setRenewDialog({ open: false, client: null })}>
              Cancelar
            </Button>
            <Button onClick={confirmRenew} disabled={actionLoading !== null}>
              {actionLoading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
              Confirmar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminClients;

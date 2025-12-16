import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { 
  Users, Search, MoreVertical, CheckCircle, XCircle, Clock, 
  Ban, RefreshCw, Eye, Trash2, Edit
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

const AdminClients = () => {
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState("");
  const [filter, setFilter] = useState<string>("all");
  
  const [clients, setClients] = useState([
    { id: 1, name: "João Silva", email: "joao@email.com", cpf: "123.456.789-00", phone: "(11) 99999-8888", status: "active", daysRemaining: 23, whatsapp: true, plan: "Pro", createdAt: "10/12/2024" },
    { id: 2, name: "Maria Santos", email: "maria@email.com", cpf: "987.654.321-00", phone: "(21) 98888-7777", status: "active", daysRemaining: 15, whatsapp: true, plan: "Pro", createdAt: "05/12/2024" },
    { id: 3, name: "Pedro Costa", email: "pedro@email.com", cpf: "456.789.123-00", phone: "(31) 97777-6666", status: "expired", daysRemaining: 0, whatsapp: false, plan: "Básico", createdAt: "01/12/2024" },
    { id: 4, name: "Ana Oliveira", email: "ana@email.com", cpf: "789.123.456-00", phone: "(41) 96666-5555", status: "active", daysRemaining: 7, whatsapp: true, plan: "Enterprise", createdAt: "20/11/2024" },
    { id: 5, name: "Carlos Mendes", email: "carlos@email.com", cpf: "321.654.987-00", phone: "(51) 95555-4444", status: "blocked", daysRemaining: 12, whatsapp: false, plan: "Pro", createdAt: "15/11/2024" },
    { id: 6, name: "Fernanda Lima", email: "fernanda@email.com", cpf: "654.987.321-00", phone: "(61) 94444-3333", status: "pending", daysRemaining: 30, whatsapp: false, plan: "Básico", createdAt: "16/12/2024" },
  ]);

  const filteredClients = clients.filter(c => {
    const matchesSearch = c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.cpf.includes(searchTerm);
    
    if (filter === "all") return matchesSearch;
    return matchesSearch && c.status === filter;
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

  const handleAction = (action: string, client: typeof clients[0]) => {
    toast({
      title: `Ação: ${action}`,
      description: `Executado para ${client.name}`,
    });
  };

  const statusCounts = {
    all: clients.length,
    active: clients.filter(c => c.status === "active").length,
    pending: clients.filter(c => c.status === "pending").length,
    expired: clients.filter(c => c.status === "expired").length,
    blocked: clients.filter(c => c.status === "blocked").length,
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
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border/50">
                  <th className="text-left p-4 text-muted-foreground font-medium">Cliente</th>
                  <th className="text-left p-4 text-muted-foreground font-medium">CPF</th>
                  <th className="text-left p-4 text-muted-foreground font-medium">Plano</th>
                  <th className="text-left p-4 text-muted-foreground font-medium">Status</th>
                  <th className="text-left p-4 text-muted-foreground font-medium">Dias</th>
                  <th className="text-left p-4 text-muted-foreground font-medium">WhatsApp</th>
                  <th className="text-left p-4 text-muted-foreground font-medium">Ações</th>
                </tr>
              </thead>
              <tbody>
                {filteredClients.map((client, index) => (
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
                          {client.name[0]}
                        </div>
                        <div>
                          <p className="font-medium text-foreground">{client.name}</p>
                          <p className="text-sm text-muted-foreground">{client.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="p-4 text-foreground">{client.cpf}</td>
                    <td className="p-4">
                      <Badge variant="outline">{client.plan}</Badge>
                    </td>
                    <td className="p-4">{getStatusBadge(client.status)}</td>
                    <td className="p-4">
                      <span className={client.daysRemaining <= 7 ? "text-yellow-400" : "text-foreground"}>
                        {client.daysRemaining} dias
                      </span>
                    </td>
                    <td className="p-4">
                      {client.whatsapp ? (
                        <CheckCircle className="w-5 h-5 text-emerald-400" />
                      ) : (
                        <XCircle className="w-5 h-5 text-red-400" />
                      )}
                    </td>
                    <td className="p-4">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm">
                            <MoreVertical className="w-4 h-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => handleAction("Ver detalhes", client)}>
                            <Eye className="w-4 h-4 mr-2" /> Ver detalhes
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleAction("Editar", client)}>
                            <Edit className="w-4 h-4 mr-2" /> Editar
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleAction("Renovar", client)}>
                            <RefreshCw className="w-4 h-4 mr-2" /> Renovar acesso
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          {client.status === "blocked" ? (
                            <DropdownMenuItem onClick={() => handleAction("Desbloquear", client)}>
                              <CheckCircle className="w-4 h-4 mr-2" /> Desbloquear
                            </DropdownMenuItem>
                          ) : (
                            <DropdownMenuItem onClick={() => handleAction("Bloquear", client)} className="text-yellow-400">
                              <Ban className="w-4 h-4 mr-2" /> Bloquear
                            </DropdownMenuItem>
                          )}
                          <DropdownMenuItem onClick={() => handleAction("Excluir", client)} className="text-red-400">
                            <Trash2 className="w-4 h-4 mr-2" /> Excluir
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminClients;

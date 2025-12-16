import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { 
  ScrollText, Search, User, AlertTriangle, CheckCircle, 
  Settings, LogIn, LogOut, Edit, Trash2
} from "lucide-react";
import { motion } from "framer-motion";

const AdminLogs = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [filter, setFilter] = useState("all");

  const logs = [
    { id: 1, type: "login", user: "admin@isa.com", action: "Login realizado", ip: "192.168.1.1", date: "16/12/2024 14:32:15", status: "success" },
    { id: 2, type: "edit", user: "admin@isa.com", action: "Cliente João Silva aprovado", ip: "192.168.1.1", date: "16/12/2024 14:30:00", status: "success" },
    { id: 3, type: "error", user: "system", action: "Falha na conexão WhatsApp (Pedro Costa)", ip: "-", date: "16/12/2024 14:25:12", status: "error" },
    { id: 4, type: "setting", user: "admin@isa.com", action: "Configurações da IA atualizadas", ip: "192.168.1.1", date: "16/12/2024 14:20:00", status: "success" },
    { id: 5, type: "delete", user: "admin@isa.com", action: "Solicitação de Carlos Mendes rejeitada", ip: "192.168.1.1", date: "16/12/2024 14:15:00", status: "warning" },
    { id: 6, type: "login", user: "joao@email.com", action: "Login realizado (Cliente)", ip: "189.10.20.30", date: "16/12/2024 14:10:00", status: "success" },
    { id: 7, type: "logout", user: "maria@email.com", action: "Logout realizado (Cliente)", ip: "200.15.25.35", date: "16/12/2024 14:05:00", status: "info" },
    { id: 8, type: "error", user: "system", action: "Limite de tokens atingido (Ana Oliveira)", ip: "-", date: "16/12/2024 14:00:00", status: "warning" },
  ];

  const filteredLogs = logs.filter(log => {
    const matchesSearch = log.action.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.user.toLowerCase().includes(searchTerm.toLowerCase());
    if (filter === "all") return matchesSearch;
    return matchesSearch && log.type === filter;
  });

  const getTypeIcon = (type: string) => {
    const icons = {
      login: LogIn,
      logout: LogOut,
      edit: Edit,
      delete: Trash2,
      setting: Settings,
      error: AlertTriangle,
    };
    const Icon = icons[type as keyof typeof icons] || CheckCircle;
    return <Icon className="w-4 h-4" />;
  };

  const getStatusBadge = (status: string) => {
    const styles = {
      success: "bg-emerald-500/20 text-emerald-400 border-emerald-500/30",
      error: "bg-red-500/20 text-red-400 border-red-500/30",
      warning: "bg-yellow-500/20 text-yellow-400 border-yellow-500/30",
      info: "bg-blue-500/20 text-blue-400 border-blue-500/30",
    };
    return <Badge className={styles[status as keyof typeof styles]}>{status}</Badge>;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-foreground flex items-center gap-3">
          <ScrollText className="w-8 h-8 text-slate-400" />
          Logs & Auditoria
        </h1>
        <p className="text-muted-foreground mt-1">
          Histórico de todas as ações na plataforma
        </p>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3">
        {[
          { key: "all", label: "Todos" },
          { key: "login", label: "Login" },
          { key: "edit", label: "Alterações" },
          { key: "error", label: "Erros" },
          { key: "setting", label: "Configurações" },
        ].map((f) => (
          <button
            key={f.key}
            onClick={() => setFilter(f.key)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              filter === f.key
                ? 'bg-primary text-primary-foreground'
                : 'bg-card/50 text-muted-foreground hover:text-foreground'
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      {/* Search */}
      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input
          placeholder="Buscar nos logs..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10 bg-card/50"
        />
      </div>

      {/* Logs List */}
      <Card className="bg-card/50 backdrop-blur-sm border-border/50">
        <CardContent className="p-0">
          <div className="divide-y divide-border/50">
            {filteredLogs.map((log, index) => (
              <motion.div
                key={log.id}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: index * 0.05 }}
                className="p-4 hover:bg-muted/30 transition-colors"
              >
                <div className="flex items-start gap-4">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                    log.status === 'error' ? 'bg-red-500/20 text-red-400' :
                    log.status === 'warning' ? 'bg-yellow-500/20 text-yellow-400' :
                    log.status === 'success' ? 'bg-emerald-500/20 text-emerald-400' :
                    'bg-blue-500/20 text-blue-400'
                  }`}>
                    {getTypeIcon(log.type)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <p className="font-medium text-foreground">{log.action}</p>
                      {getStatusBadge(log.status)}
                    </div>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <User className="w-3 h-3" />
                        {log.user}
                      </span>
                      <span>IP: {log.ip}</span>
                      <span>{log.date}</span>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminLogs;

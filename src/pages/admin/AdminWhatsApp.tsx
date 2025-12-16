import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Smartphone, Wifi, WifiOff, RefreshCw, Power, Trash2, 
  MoreVertical, Search, AlertCircle
} from "lucide-react";
import { motion } from "framer-motion";
import { useToast } from "@/hooks/use-toast";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const AdminWhatsApp = () => {
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState("");

  const [connections, setConnections] = useState([
    { id: 1, client: "João Silva", phone: "+55 11 99999-8888", status: "online", lastSeen: "Agora", messages: 1247 },
    { id: 2, client: "Maria Santos", phone: "+55 21 98888-7777", status: "online", lastSeen: "Agora", messages: 892 },
    { id: 3, client: "Pedro Costa", phone: "+55 31 97777-6666", status: "offline", lastSeen: "2h atrás", messages: 456 },
    { id: 4, client: "Ana Oliveira", phone: "+55 41 96666-5555", status: "online", lastSeen: "Agora", messages: 2341 },
    { id: 5, client: "Carlos Mendes", phone: "+55 51 95555-4444", status: "error", lastSeen: "1 dia", messages: 123 },
  ]);

  const filteredConnections = connections.filter(c =>
    c.client.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.phone.includes(searchTerm)
  );

  const getStatusBadge = (status: string) => {
    const styles = {
      online: "bg-emerald-500/20 text-emerald-400 border-emerald-500/30",
      offline: "bg-slate-500/20 text-slate-400 border-slate-500/30",
      error: "bg-red-500/20 text-red-400 border-red-500/30",
    };
    const labels = { online: "Online", offline: "Offline", error: "Erro" };
    const icons = {
      online: <Wifi className="w-3 h-3 mr-1" />,
      offline: <WifiOff className="w-3 h-3 mr-1" />,
      error: <AlertCircle className="w-3 h-3 mr-1" />,
    };
    return (
      <Badge className={`${styles[status as keyof typeof styles]} flex items-center`}>
        {icons[status as keyof typeof icons]}
        {labels[status as keyof typeof labels]}
      </Badge>
    );
  };

  const handleAction = (action: string, connection: typeof connections[0]) => {
    toast({
      title: `${action}`,
      description: `Executado para ${connection.client}`,
    });
  };

  const stats = {
    total: connections.length,
    online: connections.filter(c => c.status === "online").length,
    offline: connections.filter(c => c.status === "offline").length,
    error: connections.filter(c => c.status === "error").length,
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-foreground flex items-center gap-3">
          <Smartphone className="w-8 h-8 text-emerald-500" />
          Gestão de WhatsApp
        </h1>
        <p className="text-muted-foreground mt-1">
          Monitore e gerencie todas as conexões WhatsApp dos clientes
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: "Total", value: stats.total, color: "from-blue-500 to-cyan-500" },
          { label: "Online", value: stats.online, color: "from-emerald-500 to-green-500" },
          { label: "Offline", value: stats.offline, color: "from-slate-500 to-slate-600" },
          { label: "Com Erro", value: stats.error, color: "from-red-500 to-orange-500" },
        ].map((stat, i) => (
          <Card key={i} className="bg-card/50 backdrop-blur-sm border-border/50">
            <CardContent className="p-4 text-center">
              <p className="text-3xl font-bold text-foreground">{stat.value}</p>
              <p className="text-sm text-muted-foreground">{stat.label}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Search */}
      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input
          placeholder="Buscar por cliente ou telefone..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10 bg-card/50"
        />
      </div>

      {/* Connections Table */}
      <Card className="bg-card/50 backdrop-blur-sm border-border/50">
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border/50">
                  <th className="text-left p-4 text-muted-foreground font-medium">Cliente</th>
                  <th className="text-left p-4 text-muted-foreground font-medium">Telefone</th>
                  <th className="text-left p-4 text-muted-foreground font-medium">Status</th>
                  <th className="text-left p-4 text-muted-foreground font-medium">Última atividade</th>
                  <th className="text-left p-4 text-muted-foreground font-medium">Mensagens</th>
                  <th className="text-left p-4 text-muted-foreground font-medium">Ações</th>
                </tr>
              </thead>
              <tbody>
                {filteredConnections.map((conn, index) => (
                  <motion.tr
                    key={conn.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: index * 0.05 }}
                    className="border-b border-border/30 hover:bg-muted/30"
                  >
                    <td className="p-4">
                      <p className="font-medium text-foreground">{conn.client}</p>
                    </td>
                    <td className="p-4 text-foreground">{conn.phone}</td>
                    <td className="p-4">{getStatusBadge(conn.status)}</td>
                    <td className="p-4 text-muted-foreground">{conn.lastSeen}</td>
                    <td className="p-4 text-foreground">{conn.messages.toLocaleString()}</td>
                    <td className="p-4">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm">
                            <MoreVertical className="w-4 h-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => handleAction("Reconectar", conn)}>
                            <RefreshCw className="w-4 h-4 mr-2" /> Forçar reconexão
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleAction("Desligar bot", conn)}>
                            <Power className="w-4 h-4 mr-2" /> Desligar bot
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleAction("Limpar sessão", conn)} className="text-red-400">
                            <Trash2 className="w-4 h-4 mr-2" /> Limpar sessão
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

export default AdminWhatsApp;

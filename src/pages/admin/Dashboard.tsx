import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Users, MessageSquare, Wifi, Brain, TrendingUp, AlertTriangle,
  CheckCircle, Clock, Activity, ArrowUpRight, Loader2, RefreshCw
} from "lucide-react";
import { motion } from "framer-motion";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

export default function Dashboard() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    clientesAtivos: 0,
    clientesPendentes: 0,
    clientesBloqueados: 0,
    clientesExpirados: 0,
    totalClientes: 0,
  });
  const [recentClients, setRecentClients] = useState<any[]>([]);

  const fetchStats = async () => {
    setLoading(true);
    try {
      // Fetch all users
      const { data: users, error } = await supabase
        .from('users')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching users:', error);
        return;
      }

      const now = new Date();
      let ativos = 0;
      let pendentes = 0;
      let bloqueados = 0;
      let expirados = 0;

      (users || []).forEach(user => {
        if (!user.is_active && !user.approved_at) {
          pendentes++;
        } else if (!user.is_active) {
          bloqueados++;
        } else if (user.expires_at && new Date(user.expires_at) < now) {
          expirados++;
        } else if (user.is_active) {
          ativos++;
        }
      });

      setStats({
        clientesAtivos: ativos,
        clientesPendentes: pendentes,
        clientesBloqueados: bloqueados,
        clientesExpirados: expirados,
        totalClientes: users?.length || 0,
      });

      // Recent clients (last 5)
      setRecentClients((users || []).slice(0, 5));
    } catch (err) {
      console.error('Error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  const getClientStatus = (client: any): string => {
    if (!client.is_active && !client.approved_at) return "pending";
    if (!client.is_active) return "blocked";
    if (client.expires_at && new Date(client.expires_at) < new Date()) return "expired";
    return "active";
  };

  const statCards = [
    { 
      title: "Clientes Ativos", 
      value: stats.clientesAtivos, 
      icon: Users, 
      color: "from-emerald-500 to-green-500",
    },
    { 
      title: "Pendentes", 
      value: stats.clientesPendentes, 
      icon: Clock, 
      color: "from-yellow-500 to-orange-500",
      onClick: () => navigate('/admin/requests'),
    },
    { 
      title: "Expirados", 
      value: stats.clientesExpirados, 
      icon: AlertTriangle, 
      color: "from-red-500 to-rose-500",
      onClick: () => navigate('/admin/clients'),
    },
    { 
      title: "Total de Clientes", 
      value: stats.totalClientes, 
      icon: Users, 
      color: "from-blue-500 to-cyan-500",
      onClick: () => navigate('/admin/clients'),
    },
  ];

  const alerts = [
    ...(stats.clientesPendentes > 0 ? [{ 
      type: "warning", 
      message: `${stats.clientesPendentes} solicitação(ões) de cadastro pendente(s)`, 
      icon: Clock,
      action: () => navigate('/admin/requests')
    }] : []),
    ...(stats.clientesExpirados > 0 ? [{ 
      type: "error", 
      message: `${stats.clientesExpirados} cliente(s) com conta expirada`, 
      icon: AlertTriangle,
      action: () => navigate('/admin/clients')
    }] : []),
    { type: "success", message: "Sistema operando normalmente", icon: CheckCircle },
  ];

  const formatDate = (dateString: string | null) => {
    if (!dateString) return '-';
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) return 'Hoje';
    if (diffDays === 1) return 'Ontem';
    return date.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground flex items-center gap-3">
            <Activity className="w-8 h-8 text-primary" />
            Dashboard
          </h1>
          <p className="text-muted-foreground mt-1">
            Visão geral do sistema ISA
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button onClick={fetchStats} variant="outline" size="icon" disabled={loading}>
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </Button>
          <Badge className="bg-emerald-500/20 text-emerald-400 border-emerald-500/30 text-sm">
            <CheckCircle className="w-4 h-4 mr-1" />
            Sistema Online
          </Badge>
        </div>
      </div>

      {/* Stats Grid */}
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {statCards.map((stat, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <Card 
                  className={`bg-card/50 backdrop-blur-sm border-border/50 hover:border-primary/30 transition-all ${stat.onClick ? 'cursor-pointer' : ''}`}
                  onClick={stat.onClick}
                >
                  <CardContent className="p-5">
                    <div className="flex items-start justify-between">
                      <div>
                        <p className="text-muted-foreground text-sm">{stat.title}</p>
                        <p className="text-3xl font-bold text-foreground mt-1">{stat.value}</p>
                      </div>
                      <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${stat.color} flex items-center justify-center`}>
                        <stat.icon className="w-6 h-6 text-white" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>

          {/* Main Grid */}
          <div className="grid lg:grid-cols-3 gap-6">
            {/* Recent Clients */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="lg:col-span-2"
            >
              <Card className="bg-card/50 backdrop-blur-sm border-border/50 h-full">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Users className="w-5 h-5 text-primary" />
                    Clientes Recentes
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {recentClients.length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground">
                      Nenhum cliente cadastrado ainda
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {recentClients.map((client, index) => {
                        const status = getClientStatus(client);
                        return (
                          <div key={client.id} className="flex items-center justify-between p-3 rounded-xl bg-muted/30 border border-border/30">
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-white font-bold">
                                {client.name[0]?.toUpperCase() || '?'}
                              </div>
                              <div>
                                <p className="font-medium text-foreground">{client.name}</p>
                                <p className="text-sm text-muted-foreground">{client.email}</p>
                              </div>
                            </div>
                            <div className="flex items-center gap-4">
                              <Badge className={
                                status === 'active' 
                                  ? "bg-emerald-500/20 text-emerald-400" 
                                  : status === 'pending'
                                  ? "bg-yellow-500/20 text-yellow-400"
                                  : status === 'expired'
                                  ? "bg-red-500/20 text-red-400"
                                  : "bg-slate-500/20 text-slate-400"
                              }>
                                {status === 'active' ? 'Ativo' : status === 'pending' ? 'Pendente' : status === 'expired' ? 'Expirado' : 'Bloqueado'}
                              </Badge>
                              <span className="text-sm text-muted-foreground">{formatDate(client.created_at)}</span>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </CardContent>
              </Card>
            </motion.div>

            {/* Alerts */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
            >
              <Card className="bg-card/50 backdrop-blur-sm border-border/50 h-full">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <AlertTriangle className="w-5 h-5 text-yellow-400" />
                    Alertas do Sistema
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {alerts.map((alert, index) => (
                    <div 
                      key={index}
                      onClick={alert.action}
                      className={`p-3 rounded-xl border ${
                        alert.type === 'warning' 
                          ? 'bg-yellow-500/10 border-yellow-500/20' 
                          : alert.type === 'success'
                          ? 'bg-emerald-500/10 border-emerald-500/20'
                          : alert.type === 'error'
                          ? 'bg-red-500/10 border-red-500/20'
                          : 'bg-blue-500/10 border-blue-500/20'
                      } ${alert.action ? 'cursor-pointer hover:opacity-80 transition-opacity' : ''}`}
                    >
                      <div className="flex items-center gap-3">
                        <alert.icon className={`w-5 h-5 ${
                          alert.type === 'warning' ? 'text-yellow-400' : 
                          alert.type === 'success' ? 'text-emerald-400' : 
                          alert.type === 'error' ? 'text-red-400' :
                          'text-blue-400'
                        }`} />
                        <span className="text-sm text-foreground">{alert.message}</span>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </>
      )}
    </div>
  );
}

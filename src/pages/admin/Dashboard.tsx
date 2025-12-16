import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Users, MessageSquare, Wifi, Brain, TrendingUp, AlertTriangle,
  CheckCircle, Clock, Activity, ArrowUpRight, ArrowDownRight
} from "lucide-react";
import { motion } from "framer-motion";

export default function Dashboard() {
  const [stats] = useState({
    clientesAtivos: 127,
    clientesPendentes: 8,
    clientesBloqueados: 3,
    whatsappsConectados: 98,
    consumoIA: 45280,
    conversasHoje: 1847,
    conversasMes: 42150,
  });

  const statCards = [
    { 
      title: "Clientes Ativos", 
      value: stats.clientesAtivos, 
      icon: Users, 
      color: "from-emerald-500 to-green-500",
      trend: "+12%",
      trendUp: true
    },
    { 
      title: "Pendentes", 
      value: stats.clientesPendentes, 
      icon: Clock, 
      color: "from-yellow-500 to-orange-500",
      trend: "+3",
      trendUp: true
    },
    { 
      title: "WhatsApps Online", 
      value: stats.whatsappsConectados, 
      icon: Wifi, 
      color: "from-blue-500 to-cyan-500",
      trend: "98%",
      trendUp: true
    },
    { 
      title: "Consumo IA (tokens)", 
      value: stats.consumoIA.toLocaleString(), 
      icon: Brain, 
      color: "from-purple-500 to-pink-500",
      trend: "+8%",
      trendUp: true
    },
  ];

  const alerts = [
    { type: "warning", message: "8 solicitações de cadastro pendentes", icon: Clock },
    { type: "info", message: "3 clientes com conta expirando em 3 dias", icon: AlertTriangle },
    { type: "success", message: "Sistema operando normalmente", icon: CheckCircle },
  ];

  const recentClients = [
    { name: "João Silva", email: "joao@email.com", status: "active", date: "Hoje" },
    { name: "Maria Santos", email: "maria@email.com", status: "pending", date: "Ontem" },
    { name: "Pedro Costa", email: "pedro@email.com", status: "active", date: "15/12" },
  ];

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
        <Badge className="bg-emerald-500/20 text-emerald-400 border-emerald-500/30 text-sm">
          <CheckCircle className="w-4 h-4 mr-1" />
          Sistema Online
        </Badge>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((stat, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <Card className="bg-card/50 backdrop-blur-sm border-border/50 hover:border-primary/30 transition-all">
              <CardContent className="p-5">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-muted-foreground text-sm">{stat.title}</p>
                    <p className="text-3xl font-bold text-foreground mt-1">{stat.value}</p>
                    <div className="flex items-center gap-1 mt-1">
                      {stat.trendUp ? (
                        <ArrowUpRight className="w-4 h-4 text-emerald-400" />
                      ) : (
                        <ArrowDownRight className="w-4 h-4 text-red-400" />
                      )}
                      <span className={stat.trendUp ? "text-emerald-400 text-sm" : "text-red-400 text-sm"}>
                        {stat.trend}
                      </span>
                    </div>
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
        {/* Conversations Chart */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="lg:col-span-2"
        >
          <Card className="bg-card/50 backdrop-blur-sm border-border/50 h-full">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MessageSquare className="w-5 h-5 text-primary" />
                Conversas
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-6">
                <div className="p-6 rounded-xl bg-muted/30 border border-border/30 text-center">
                  <p className="text-4xl font-bold text-foreground">{stats.conversasHoje.toLocaleString()}</p>
                  <p className="text-muted-foreground mt-1">Hoje</p>
                  <div className="flex items-center justify-center gap-1 mt-2">
                    <TrendingUp className="w-4 h-4 text-emerald-400" />
                    <span className="text-emerald-400 text-sm">+15% vs ontem</span>
                  </div>
                </div>
                <div className="p-6 rounded-xl bg-muted/30 border border-border/30 text-center">
                  <p className="text-4xl font-bold text-foreground">{stats.conversasMes.toLocaleString()}</p>
                  <p className="text-muted-foreground mt-1">Este mês</p>
                  <div className="flex items-center justify-center gap-1 mt-2">
                    <TrendingUp className="w-4 h-4 text-emerald-400" />
                    <span className="text-emerald-400 text-sm">+22% vs mês anterior</span>
                  </div>
                </div>
              </div>

              {/* Simple bar visualization */}
              <div className="mt-6 space-y-3">
                <div className="flex items-center gap-4">
                  <span className="text-sm text-muted-foreground w-12">Seg</span>
                  <div className="flex-1 h-6 bg-muted/30 rounded-full overflow-hidden">
                    <div className="h-full bg-gradient-to-r from-blue-500 to-cyan-500 rounded-full" style={{ width: '85%' }}></div>
                  </div>
                  <span className="text-sm text-foreground w-16">1,520</span>
                </div>
                <div className="flex items-center gap-4">
                  <span className="text-sm text-muted-foreground w-12">Ter</span>
                  <div className="flex-1 h-6 bg-muted/30 rounded-full overflow-hidden">
                    <div className="h-full bg-gradient-to-r from-blue-500 to-cyan-500 rounded-full" style={{ width: '92%' }}></div>
                  </div>
                  <span className="text-sm text-foreground w-16">1,847</span>
                </div>
                <div className="flex items-center gap-4">
                  <span className="text-sm text-muted-foreground w-12">Qua</span>
                  <div className="flex-1 h-6 bg-muted/30 rounded-full overflow-hidden">
                    <div className="h-full bg-gradient-to-r from-blue-500 to-cyan-500 rounded-full" style={{ width: '78%' }}></div>
                  </div>
                  <span className="text-sm text-foreground w-16">1,390</span>
                </div>
              </div>
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
                  className={`p-3 rounded-xl border ${
                    alert.type === 'warning' 
                      ? 'bg-yellow-500/10 border-yellow-500/20' 
                      : alert.type === 'success'
                      ? 'bg-emerald-500/10 border-emerald-500/20'
                      : 'bg-blue-500/10 border-blue-500/20'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <alert.icon className={`w-5 h-5 ${
                      alert.type === 'warning' ? 'text-yellow-400' : 
                      alert.type === 'success' ? 'text-emerald-400' : 'text-blue-400'
                    }`} />
                    <span className="text-sm text-foreground">{alert.message}</span>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Recent Clients */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        <Card className="bg-card/50 backdrop-blur-sm border-border/50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="w-5 h-5 text-primary" />
              Clientes Recentes
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {recentClients.map((client, index) => (
                <div key={index} className="flex items-center justify-between p-3 rounded-xl bg-muted/30 border border-border/30">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-white font-bold">
                      {client.name[0]}
                    </div>
                    <div>
                      <p className="font-medium text-foreground">{client.name}</p>
                      <p className="text-sm text-muted-foreground">{client.email}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <Badge className={
                      client.status === 'active' 
                        ? "bg-emerald-500/20 text-emerald-400" 
                        : "bg-yellow-500/20 text-yellow-400"
                    }>
                      {client.status === 'active' ? 'Ativo' : 'Pendente'}
                    </Badge>
                    <span className="text-sm text-muted-foreground">{client.date}</span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}

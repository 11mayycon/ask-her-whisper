import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { 
  LayoutDashboard, MessageSquare, Calendar, Wifi, WifiOff, 
  Brain, Clock, TrendingUp, AlertCircle, CheckCircle
} from "lucide-react";
import { motion } from "framer-motion";

const ClientDashboard = () => {
  const [accountData] = useState({
    status: "active",
    daysRemaining: 23,
    totalDays: 30,
    whatsappConnected: true,
    aiActive: true,
    messagesThisMonth: 1247,
    conversationsToday: 34
  });

  const progressPercent = (accountData.daysRemaining / accountData.totalDays) * 100;

  const statsCards = [
    {
      title: "Mensagens este mês",
      value: accountData.messagesThisMonth.toLocaleString(),
      icon: MessageSquare,
      color: "from-blue-500 to-cyan-500",
      trend: "+12%"
    },
    {
      title: "Conversas hoje",
      value: accountData.conversationsToday,
      icon: TrendingUp,
      color: "from-emerald-500 to-green-500",
      trend: "+8%"
    },
    {
      title: "Dias restantes",
      value: accountData.daysRemaining,
      icon: Calendar,
      color: "from-purple-500 to-pink-500",
      trend: null
    },
    {
      title: "Status da IA",
      value: accountData.aiActive ? "Ativa" : "Inativa",
      icon: Brain,
      color: accountData.aiActive ? "from-green-500 to-emerald-500" : "from-red-500 to-orange-500",
      trend: null
    }
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground flex items-center gap-3">
            <LayoutDashboard className="w-8 h-8 text-primary" />
            Dashboard
          </h1>
          <p className="text-muted-foreground mt-1">
            Visão geral do seu atendimento automatizado
          </p>
        </div>
        <Badge 
          className={`text-sm px-3 py-1 ${
            accountData.status === 'active' 
              ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30' 
              : 'bg-red-500/20 text-red-400 border-red-500/30'
          }`}
        >
          {accountData.status === 'active' ? (
            <>
              <CheckCircle className="w-4 h-4 mr-1" />
              Conta Ativa
            </>
          ) : (
            <>
              <AlertCircle className="w-4 h-4 mr-1" />
              Conta Expirada
            </>
          )}
        </Badge>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {statsCards.map((stat, index) => (
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
                    {stat.trend && (
                      <span className="text-emerald-400 text-sm">{stat.trend}</span>
                    )}
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

      {/* Main Content Grid */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Account Status */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.3 }}
        >
          <Card className="bg-card/50 backdrop-blur-sm border-border/50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-foreground">
                <Clock className="w-5 h-5 text-primary" />
                Status da Conta
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <div className="flex justify-between text-sm mb-2">
                  <span className="text-muted-foreground">Tempo restante</span>
                  <span className="text-foreground font-medium">{accountData.daysRemaining} dias</span>
                </div>
                <Progress value={progressPercent} className="h-3" />
              </div>

              <div className="grid grid-cols-2 gap-4 pt-4">
                <div className="p-4 rounded-xl bg-muted/50 border border-border/50">
                  <div className="flex items-center gap-2 mb-2">
                    {accountData.whatsappConnected ? (
                      <Wifi className="w-5 h-5 text-emerald-400" />
                    ) : (
                      <WifiOff className="w-5 h-5 text-red-400" />
                    )}
                    <span className="text-sm text-muted-foreground">WhatsApp</span>
                  </div>
                  <p className={`font-semibold ${
                    accountData.whatsappConnected ? 'text-emerald-400' : 'text-red-400'
                  }`}>
                    {accountData.whatsappConnected ? 'Conectado' : 'Desconectado'}
                  </p>
                </div>

                <div className="p-4 rounded-xl bg-muted/50 border border-border/50">
                  <div className="flex items-center gap-2 mb-2">
                    <Brain className={`w-5 h-5 ${accountData.aiActive ? 'text-emerald-400' : 'text-red-400'}`} />
                    <span className="text-sm text-muted-foreground">IA</span>
                  </div>
                  <p className={`font-semibold ${
                    accountData.aiActive ? 'text-emerald-400' : 'text-red-400'
                  }`}>
                    {accountData.aiActive ? 'Ativa' : 'Inativa'}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Quick Alerts */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.4 }}
        >
          <Card className="bg-card/50 backdrop-blur-sm border-border/50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-foreground">
                <AlertCircle className="w-5 h-5 text-yellow-400" />
                Alertas Rápidos
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {accountData.daysRemaining <= 7 && (
                <div className="p-4 rounded-xl bg-yellow-500/10 border border-yellow-500/20">
                  <div className="flex items-center gap-3">
                    <Clock className="w-5 h-5 text-yellow-400" />
                    <div>
                      <p className="text-yellow-400 font-medium">Conta expirando em breve</p>
                      <p className="text-sm text-muted-foreground">
                        Restam apenas {accountData.daysRemaining} dias
                      </p>
                    </div>
                  </div>
                </div>
              )}
              
              {!accountData.whatsappConnected && (
                <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20">
                  <div className="flex items-center gap-3">
                    <WifiOff className="w-5 h-5 text-red-400" />
                    <div>
                      <p className="text-red-400 font-medium">WhatsApp desconectado</p>
                      <p className="text-sm text-muted-foreground">
                        Reconecte para continuar o atendimento
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {accountData.whatsappConnected && accountData.aiActive && accountData.daysRemaining > 7 && (
                <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20">
                  <div className="flex items-center gap-3">
                    <CheckCircle className="w-5 h-5 text-emerald-400" />
                    <div>
                      <p className="text-emerald-400 font-medium">Tudo funcionando!</p>
                      <p className="text-sm text-muted-foreground">
                        Seu atendimento está operando normalmente
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
};

export default ClientDashboard;

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  BarChart3, Download, Calendar, TrendingUp, Users, 
  MessageSquare, Brain, ArrowUpRight
} from "lucide-react";
import { motion } from "framer-motion";
import { useToast } from "@/hooks/use-toast";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const AdminReports = () => {
  const { toast } = useToast();
  const [period, setPeriod] = useState("month");

  const stats = {
    totalMessages: 142850,
    totalConversations: 8420,
    aiUsage: 89420,
    activeClients: 127,
  };

  const topClients = [
    { name: "João Silva", messages: 4520, percentage: 85 },
    { name: "Maria Santos", messages: 3890, percentage: 72 },
    { name: "Ana Oliveira", messages: 3210, percentage: 60 },
    { name: "Pedro Costa", messages: 2870, percentage: 53 },
    { name: "Carlos Mendes", messages: 2340, percentage: 44 },
  ];

  const monthlyData = [
    { month: "Jan", messages: 12450 },
    { month: "Fev", messages: 15230 },
    { month: "Mar", messages: 18900 },
    { month: "Abr", messages: 21340 },
    { month: "Mai", messages: 24560 },
    { month: "Jun", messages: 28900 },
  ];

  const handleExport = (format: string) => {
    toast({ title: "Exportando...", description: `Gerando relatório em ${format.toUpperCase()}` });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground flex items-center gap-3">
            <BarChart3 className="w-8 h-8 text-cyan-500" />
            Relatórios
          </h1>
          <p className="text-muted-foreground mt-1">
            Análise detalhada do uso da plataforma
          </p>
        </div>
        <div className="flex gap-3">
          <Select value={period} onValueChange={setPeriod}>
            <SelectTrigger className="w-[180px] bg-card/50">
              <Calendar className="w-4 h-4 mr-2" />
              <SelectValue placeholder="Período" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="week">Última semana</SelectItem>
              <SelectItem value="month">Último mês</SelectItem>
              <SelectItem value="quarter">Último trimestre</SelectItem>
              <SelectItem value="year">Último ano</SelectItem>
            </SelectContent>
          </Select>
          <Button onClick={() => handleExport('csv')} variant="outline">
            <Download className="w-4 h-4 mr-2" /> Exportar CSV
          </Button>
          <Button onClick={() => handleExport('pdf')} variant="outline">
            <Download className="w-4 h-4 mr-2" /> Exportar PDF
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { title: "Total de Mensagens", value: stats.totalMessages, icon: MessageSquare, color: "from-blue-500 to-cyan-500", trend: "+18%" },
          { title: "Conversas", value: stats.totalConversations, icon: Users, color: "from-emerald-500 to-green-500", trend: "+12%" },
          { title: "Uso de IA (tokens)", value: stats.aiUsage, icon: Brain, color: "from-purple-500 to-pink-500", trend: "+22%" },
          { title: "Clientes Ativos", value: stats.activeClients, icon: Users, color: "from-yellow-500 to-orange-500", trend: "+5%" },
        ].map((stat, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <Card className="bg-card/50 backdrop-blur-sm border-border/50">
              <CardContent className="p-5">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-muted-foreground text-sm">{stat.title}</p>
                    <p className="text-3xl font-bold text-foreground mt-1">
                      {stat.value.toLocaleString()}
                    </p>
                    <div className="flex items-center gap-1 mt-1">
                      <ArrowUpRight className="w-4 h-4 text-emerald-400" />
                      <span className="text-emerald-400 text-sm">{stat.trend}</span>
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

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Monthly Chart */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
        >
          <Card className="bg-card/50 backdrop-blur-sm border-border/50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-primary" />
                Mensagens por Mês
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {monthlyData.map((data, index) => (
                  <div key={index} className="flex items-center gap-4">
                    <span className="text-sm text-muted-foreground w-10">{data.month}</span>
                    <div className="flex-1 h-8 bg-muted/30 rounded-full overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${(data.messages / 30000) * 100}%` }}
                        transition={{ delay: index * 0.1, duration: 0.5 }}
                        className="h-full bg-gradient-to-r from-blue-500 to-cyan-500 rounded-full"
                      />
                    </div>
                    <span className="text-sm text-foreground w-20 text-right">
                      {data.messages.toLocaleString()}
                    </span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Top Clients */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
        >
          <Card className="bg-card/50 backdrop-blur-sm border-border/50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="w-5 h-5 text-primary" />
                Clientes Mais Ativos
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {topClients.map((client, index) => (
                  <div key={index} className="flex items-center gap-4">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-white font-bold text-sm">
                      {index + 1}
                    </div>
                    <div className="flex-1">
                      <div className="flex justify-between mb-1">
                        <span className="font-medium text-foreground">{client.name}</span>
                        <span className="text-sm text-muted-foreground">
                          {client.messages.toLocaleString()} msgs
                        </span>
                      </div>
                      <div className="h-2 bg-muted/30 rounded-full overflow-hidden">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${client.percentage}%` }}
                          transition={{ delay: index * 0.1, duration: 0.5 }}
                          className="h-full bg-gradient-to-r from-emerald-500 to-green-500 rounded-full"
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
};

export default AdminReports;

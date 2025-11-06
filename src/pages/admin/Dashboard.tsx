import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Users, Activity, Clock, CheckCircle } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { api } from '@/lib/api';
import { toast } from 'sonner';

export default function Dashboard() {
  const { token } = useAuth();
  const [stats, setStats] = useState({
    iaAtendendo: 0,
    finalizados: 0,
    ultimos15Dias: 0,
    agentesOnline: 0,
  });

  useEffect(() => {
    if (token) {
      api.getStats(token)
        .then(setStats)
        .catch(err => toast.error('Erro ao carregar estatísticas'));
    }
  }, [token]);

  const cards = [
    { title: 'IA Atendendo', value: stats.iaAtendendo, icon: Activity, color: 'text-blue-500' },
    { title: 'Finalizados', value: stats.finalizados, icon: CheckCircle, color: 'text-green-500' },
    { title: 'Últimos 15 Dias', value: stats.ultimos15Dias, icon: Clock, color: 'text-yellow-500' },
    { title: 'Agentes Online', value: stats.agentesOnline, icon: Users, color: 'text-purple-500' },
  ];

  return (
    <div className="p-8 space-y-8">
      <div>
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <p className="text-muted-foreground">Visão geral do sistema</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {cards.map((card, i) => (
          <Card key={i}>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">{card.title}</CardTitle>
              <card.icon className={`w-5 h-5 ${card.color}`} />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{card.value}</div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}

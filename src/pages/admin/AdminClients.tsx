import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Users, Search, MoreVertical, CheckCircle, XCircle, Clock } from "lucide-react";
import { motion } from "framer-motion";

const AdminClients = () => {
  const [searchTerm, setSearchTerm] = useState("");
  
  const clients = [
    { id: 1, name: "João Silva", email: "joao@email.com", status: "active", daysRemaining: 23, whatsapp: true },
    { id: 2, name: "Maria Santos", email: "maria@email.com", status: "active", daysRemaining: 15, whatsapp: true },
    { id: 3, name: "Pedro Costa", email: "pedro@email.com", status: "expired", daysRemaining: 0, whatsapp: false },
    { id: 4, name: "Ana Oliveira", email: "ana@email.com", status: "active", daysRemaining: 7, whatsapp: true },
  ];

  const filteredClients = clients.filter(c => 
    c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-foreground flex items-center gap-3">
          <Users className="w-8 h-8 text-primary" />
          Clientes
        </h1>
      </div>

      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input
          placeholder="Buscar clientes..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10 bg-card/50"
        />
      </div>

      <Card className="bg-card/50 backdrop-blur-sm border-border/50">
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border/50">
                  <th className="text-left p-4 text-muted-foreground font-medium">Cliente</th>
                  <th className="text-left p-4 text-muted-foreground font-medium">Status</th>
                  <th className="text-left p-4 text-muted-foreground font-medium">Dias Restantes</th>
                  <th className="text-left p-4 text-muted-foreground font-medium">WhatsApp</th>
                  <th className="text-left p-4 text-muted-foreground font-medium">Ações</th>
                </tr>
              </thead>
              <tbody>
                {filteredClients.map((client) => (
                  <motion.tr 
                    key={client.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="border-b border-border/30 hover:bg-muted/30"
                  >
                    <td className="p-4">
                      <div>
                        <p className="font-medium text-foreground">{client.name}</p>
                        <p className="text-sm text-muted-foreground">{client.email}</p>
                      </div>
                    </td>
                    <td className="p-4">
                      <Badge className={client.status === 'active' 
                        ? "bg-emerald-500/20 text-emerald-400" 
                        : "bg-red-500/20 text-red-400"
                      }>
                        {client.status === 'active' ? 'Ativo' : 'Expirado'}
                      </Badge>
                    </td>
                    <td className="p-4 text-foreground">{client.daysRemaining} dias</td>
                    <td className="p-4">
                      {client.whatsapp ? (
                        <CheckCircle className="w-5 h-5 text-emerald-400" />
                      ) : (
                        <XCircle className="w-5 h-5 text-red-400" />
                      )}
                    </td>
                    <td className="p-4">
                      <Button variant="ghost" size="sm">
                        <MoreVertical className="w-4 h-4" />
                      </Button>
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

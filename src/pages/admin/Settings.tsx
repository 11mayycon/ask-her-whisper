import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import { Building, User, Bell, Save, Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";

export default function Settings() {
  const { user } = useAuth();
  const { theme, setTheme } = useTheme();
  const [notifications, setNotifications] = useState({
    email: true,
    sound: true,
    dailyReport: false,
  });

  useEffect(() => {
    // Carregar do localStorage
    const saved = localStorage.getItem('notifications');
    if (saved) {
      setNotifications(JSON.parse(saved));
    }
  }, []);

  const saveNotifications = async () => {
    try {
      // Salvar no localStorage temporariamente
      localStorage.setItem('notifications', JSON.stringify(notifications));
      toast.success("Preferências salvas com sucesso!");
    } catch (error) {
      console.error("Erro ao salvar notificações:", error);
      toast.error("Erro ao salvar preferências");
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold mb-2 bg-gradient-primary bg-clip-text text-transparent">
          Configurações
        </h1>
        <p className="text-muted-foreground">
          Gerencie as preferências do sistema
        </p>
      </div>

      {/* Dados da Empresa */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-3">
            <Building className="w-5 h-5 text-primary" />
            <div>
              <CardTitle>Dados da Empresa</CardTitle>
              <CardDescription>Informações sobre sua organização</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="company">Nome da Empresa</Label>
            <Input
              id="company"
              placeholder="InovaPro AI"
                defaultValue="InovaPro AI"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="logo">Logo</Label>
            <Input id="logo" type="file" accept="image/*" />
            <p className="text-xs text-muted-foreground">
              Formato recomendado: PNG ou SVG (max 2MB)
            </p>
          </div>

          <Button onClick={() => toast.info("Função em desenvolvimento")}>
            <Save className="w-4 h-4 mr-2" />
            Salvar Empresa
          </Button>
        </CardContent>
      </Card>

      {/* Perfil do Administrador */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-3">
            <User className="w-5 h-5 text-primary" />
            <div>
              <CardTitle>Perfil do Administrador</CardTitle>
              <CardDescription>Suas informações pessoais</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Nome Completo</Label>
            <Input
              id="name"
              value={user?.full_name || ""}
              disabled
              placeholder="Seu nome"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              value={user?.email || ""}
              disabled
            />
            <p className="text-xs text-muted-foreground">
              O email não pode ser alterado
            </p>
          </div>

          <Button onClick={() => toast.info("Função em desenvolvimento")}>
            <Save className="w-4 h-4 mr-2" />
            Salvar Perfil
          </Button>
        </CardContent>
      </Card>

      {/* Notificações */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-3">
            <Bell className="w-5 h-5 text-primary" />
            <div>
              <CardTitle>Notificações</CardTitle>
              <CardDescription>Configure alertas e avisos do sistema</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Email ao receber atendimento</Label>
              <p className="text-sm text-muted-foreground">
                Enviar email quando novo cliente entrar
              </p>
            </div>
            <Switch
              checked={notifications.email}
              onCheckedChange={(checked) =>
                setNotifications({ ...notifications, email: checked })
              }
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Som ao transferir para suporte</Label>
              <p className="text-sm text-muted-foreground">
                Tocar som quando IA transferir cliente
              </p>
            </div>
            <Switch
              checked={notifications.sound}
              onCheckedChange={(checked) =>
                setNotifications({ ...notifications, sound: checked })
              }
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Relatório diário automático</Label>
              <p className="text-sm text-muted-foreground">
                Receber relatório por email todos os dias
              </p>
            </div>
            <Switch
              checked={notifications.dailyReport}
              onCheckedChange={(checked) =>
                setNotifications({ ...notifications, dailyReport: checked })
              }
            />
          </div>

          <Button onClick={saveNotifications}>
            <Save className="w-4 h-4 mr-2" />
            Salvar Notificações
          </Button>
        </CardContent>
      </Card>

      {/* Aparência */}
      <Card>
        <CardHeader>
          <CardTitle>Aparência</CardTitle>
          <CardDescription>Personalize a interface do sistema</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Tema</Label>
              <p className="text-sm text-muted-foreground">
                Escolha entre modo claro ou escuro
              </p>
            </div>
            <div className="flex gap-2">
              <Button
                variant={theme === "light" ? "default" : "outline"}
                size="sm"
                onClick={() => setTheme("light")}
              >
                <Sun className="w-4 h-4 mr-2" />
                Claro
              </Button>
              <Button
                variant={theme === "dark" ? "default" : "outline"}
                size="sm"
                onClick={() => setTheme("dark")}
              >
                <Moon className="w-4 h-4 mr-2" />
                Escuro
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

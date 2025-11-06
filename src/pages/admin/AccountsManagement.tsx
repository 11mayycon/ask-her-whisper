import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { toast } from "sonner";
import { Plus, Edit, Trash2, UserCheck, UserX, IdCard, Shield, UserPlus, Lock, Unlock, Calendar, RefreshCw, Users } from "lucide-react";
import { Switch } from "@/components/ui/switch";

const API_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:3001/api';

interface Admin {
  id: string;
  nome: string;
  email: string;
  cpf?: string;
  role: string;
  created_at: string;
}

interface Support {
  id: string;
  nome: string;
  matricula: string;
  admin_id: string;
  admin_nome?: string;
  role: string;
  created_at: string;
}

interface LegacyUser {
  id: string;
  full_name: string;
  email: string;
  matricula: string;
  is_active: boolean;
  created_at: string;
}

interface Subscription {
  id: string;
  user_id: string;
  plan_name: string;
  status: string;
  created_at: string;
}

const AccountsManagement = () => {
  // Estados para Admins
  const [admins, setAdmins] = useState<Admin[]>([]);
  const [newAdmin, setNewAdmin] = useState({
    nome: '',
    email: '',
    senha: '',
    cpf: '',
    role: 'admin'
  });
  const [isCreateAdminOpen, setIsCreateAdminOpen] = useState(false);

  // Estados para Suportes
  const [supports, setSupports] = useState<Support[]>([]);
  const [newSupport, setNewSupport] = useState({
    nome: '',
    admin_id: ''
  });
  const [isCreateSupportOpen, setIsCreateSupportOpen] = useState(false);

  // Estados gerais
  const [loading, setLoading] = useState(false);
  const [adminLoading, setAdminLoading] = useState(true);
  const [supportLoading, setSupportLoading] = useState(true);

  // Carregar dados
  useEffect(() => {
    loadAdmins();
    loadSupports();
    loadLegacyUsers();
    loadSubscriptions();
  }, []);

  const loadAdmins = async () => {
    try {
      setAdminLoading(true);
      const response = await fetch('/api/admin/admins');
      if (response.ok) {
        const data = await response.json();
        setAdmins(data);
      }
    } catch (error) {
      console.error('Erro ao carregar admins:', error);
      toast.error('Erro ao carregar administradores');
    } finally {
      setAdminLoading(false);
    }
  };

  // Funções para Admins
  const createAdmin = async () => {
    if (!newAdmin.nome || !newAdmin.email || !newAdmin.senha) {
      toast.error('Preencha todos os campos obrigatórios');
      return;
    }

    setLoading(true);
    try {
      const response = await fetch('/api/admin/admins', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newAdmin)
      });

      if (response.ok) {
        toast.success('Administrador criado com sucesso');
        setNewAdmin({ nome: '', email: '', senha: '', cpf: '', role: 'admin' });
        setIsCreateAdminOpen(false);
        loadAdmins();
      } else {
        const error = await response.json();
        toast.error(error.error || 'Erro ao criar administrador');
      }
    } catch (error) {
      console.error('Erro ao criar admin:', error);
      toast.error('Erro ao criar administrador');
    } finally {
      setLoading(false);
    }
  };

  const deleteAdmin = async (id: string) => {
    if (!confirm('Tem certeza que deseja excluir este administrador?')) return;

    try {
      const response = await fetch(`/api/admin/admins/${id}`, {
        method: 'DELETE'
      });

      if (response.ok) {
        toast.success('Administrador excluído com sucesso');
        loadAdmins();
      } else {
        const error = await response.json();
        toast.error(error.error || 'Erro ao excluir administrador');
      }
    } catch (error) {
      console.error('Erro ao excluir admin:', error);
      toast.error('Erro ao excluir administrador');
    }
  };

  const loadSupports = async () => {
    try {
      setSupportLoading(true);
      const response = await fetch('/api/admin/supports');
      if (response.ok) {
        const data = await response.json();
        setSupports(data);
      }
    } catch (error) {
      console.error('Erro ao carregar suportes:', error);
      toast.error('Erro ao carregar suportes');
    } finally {
      setSupportLoading(false);
    }
  };

  const loadLegacyUsers = async () => {
    try {
      const response = await fetch('/api/admin/support-users');
      if (response.ok) {
        const data = await response.json();
        setLegacyUsers(data);
      }
    } catch (error) {
      console.error('Erro ao carregar usuários legados:', error);
      toast.error('Erro ao carregar usuários legados');
    }
  };

  // Funções para Suportes
  const createSupport = async () => {
    if (!newSupport.nome || !newSupport.admin_id) {
      toast.error('Preencha todos os campos obrigatórios');
      return;
    }

    setLoading(true);
    try {
      const response = await fetch('/api/admin/supports', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newSupport)
      });

      if (response.ok) {
        const data = await response.json();
        toast.success(`Suporte criado com matrícula: ${data.matricula}`);
        setNewSupport({ nome: '', admin_id: '' });
        setIsCreateSupportOpen(false);
        loadSupports();
      } else {
        const error = await response.json();
        toast.error(error.error || 'Erro ao criar suporte');
      }
    } catch (error) {
      console.error('Erro ao criar suporte:', error);
      toast.error('Erro ao criar suporte');
    } finally {
      setLoading(false);
    }
  };

  const deleteSupport = async (id: string) => {
    if (!confirm('Tem certeza que deseja excluir este suporte?')) return;

    try {
      const response = await fetch(`/api/admin/supports/${id}`, {
        method: 'DELETE'
      });

      if (response.ok) {
        toast.success('Suporte excluído com sucesso');
        loadSupports();
      } else {
        const error = await response.json();
        toast.error(error.error || 'Erro ao excluir suporte');
      }
    } catch (error) {
      console.error('Erro ao excluir suporte:', error);
      toast.error('Erro ao excluir suporte');
    }
  };

  const loadSubscriptions = async () => {
    try {
      setSubscriptionLoading(true);
      const response = await fetch('/api/subscriptions');
      if (response.ok) {
        const data = await response.json();
        setSubscriptions(data);
      }
    } catch (error) {
      console.error('Erro ao carregar assinaturas:', error);
    } finally {
      setSubscriptionLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR');
  };

  const getStatusBadge = (status: string) => {
    const statusMap: { [key: string]: { label: string; variant: "default" | "secondary" | "destructive" | "outline" } } = {
      active: { label: "Ativo", variant: "default" },
      inactive: { label: "Inativo", variant: "secondary" },
      expired: { label: "Expirado", variant: "destructive" },
      pending: { label: "Pendente", variant: "outline" },
    };

    const statusInfo = statusMap[status] || { label: status, variant: "outline" as const };
    return <Badge variant={statusInfo.variant}>{statusInfo.label}</Badge>;
  };

  const getRoleBadge = (role: string) => {
    const roleMap: { [key: string]: { label: string; variant: "default" | "secondary" | "destructive" | "outline" } } = {
      super_admin: { label: "Super Admin", variant: "destructive" },
      admin: { label: "Admin", variant: "default" },
      support: { label: "Suporte", variant: "secondary" },
    };

    const roleInfo = roleMap[role] || { label: role, variant: "outline" as const };
    return <Badge variant={roleInfo.variant}>{roleInfo.label}</Badge>;
  };

  return (
    <div className="container mx-auto p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">Gerenciar Contas</h1>
        <p className="text-gray-600">Gerencie administradores, suportes e usuários do sistema</p>
      </div>

      <Tabs defaultValue="admins" className="space-y-6">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="admins" className="flex items-center gap-2">
            <Users className="h-4 w-4" />
            Administradores
          </TabsTrigger>
          <TabsTrigger value="supports" className="flex items-center gap-2">
            <UserCheck className="h-4 w-4" />
            Suportes
          </TabsTrigger>
        </TabsList>

        {/* Administradores Tab */}
        <TabsContent value="admins" className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <Shield className="w-5 h-5" />
                    Administradores
                  </CardTitle>
                  <CardDescription>
                    Gerencie os administradores do sistema
                  </CardDescription>
                </div>
                <Dialog open={isCreateAdminOpen} onOpenChange={setIsCreateAdminOpen}>
                  <DialogTrigger asChild>
                    <Button>
                      <Plus className="w-4 h-4 mr-2" />
                      Novo Administrador
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Criar Novo Administrador</DialogTitle>
                      <DialogDescription>
                        Preencha os dados do novo administrador
                      </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4">
                      <div>
                        <Label htmlFor="admin-nome">Nome</Label>
                        <Input
                          id="admin-nome"
                          value={newAdmin.nome}
                          onChange={(e) => setNewAdmin({ ...newAdmin, nome: e.target.value })}
                          placeholder="Nome completo"
                        />
                      </div>
                      <div>
                        <Label htmlFor="admin-email">Email</Label>
                        <Input
                          id="admin-email"
                          type="email"
                          value={newAdmin.email}
                          onChange={(e) => setNewAdmin({ ...newAdmin, email: e.target.value })}
                          placeholder="email@exemplo.com"
                        />
                      </div>
                      <div>
                        <Label htmlFor="admin-senha">Senha</Label>
                        <Input
                          id="admin-senha"
                          type="password"
                          value={newAdmin.senha}
                          onChange={(e) => setNewAdmin({ ...newAdmin, senha: e.target.value })}
                          placeholder="Senha segura"
                        />
                      </div>
                      <div>
                        <Label htmlFor="admin-cpf">CPF</Label>
                        <Input
                          id="admin-cpf"
                          value={newAdmin.cpf}
                          onChange={(e) => setNewAdmin({ ...newAdmin, cpf: e.target.value })}
                          placeholder="000.000.000-00"
                        />
                      </div>
                      <div>
                        <Label htmlFor="admin-role">Função</Label>
                        <select
                          id="admin-role"
                          className="w-full p-2 border rounded-md"
                          value={newAdmin.role}
                          onChange={(e) => setNewAdmin({ ...newAdmin, role: e.target.value })}
                        >
                          <option value="admin">Administrador</option>
                          <option value="super_admin">Super Administrador</option>
                        </select>
                      </div>
                    </div>
                    <DialogFooter>
                      <Button variant="outline" onClick={() => setIsCreateAdminOpen(false)}>
                        Cancelar
                      </Button>
                      <Button onClick={createAdmin} disabled={loading} className="w-full">
                        {loading ? 'Criando...' : 'Criar Administrador'}
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </div>
            </CardHeader>
            <CardContent>
              {adminLoading ? (
                <div className="flex items-center justify-center py-8">
                  <RefreshCw className="w-6 h-6 animate-spin" />
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Nome</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>CPF</TableHead>
                      <TableHead>Função</TableHead>
                      <TableHead>Criado em</TableHead>
                      <TableHead>Ações</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {admins.map((admin) => (
                      <TableRow key={admin.id}>
                        <TableCell className="font-medium">{admin.nome}</TableCell>
                        <TableCell>{admin.email}</TableCell>
                        <TableCell>{admin.cpf || 'N/A'}</TableCell>
                        <TableCell>{getRoleBadge(admin.role)}</TableCell>
                        <TableCell>{formatDate(admin.created_at)}</TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Button
                              variant="destructive"
                              size="sm"
                              onClick={() => deleteAdmin(admin.id)}
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Suportes Tab */}
        <TabsContent value="supports" className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <IdCard className="w-5 h-5" />
                    Suportes
                  </CardTitle>
                  <CardDescription>
                    Gerencie os usuários de suporte do sistema
                  </CardDescription>
                </div>
                <Dialog open={isCreateSupportOpen} onOpenChange={setIsCreateSupportOpen}>
                  <DialogTrigger asChild>
                    <Button>
                      <Plus className="w-4 h-4 mr-2" />
                      Novo Suporte
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Criar Novo Suporte</DialogTitle>
                      <DialogDescription>
                        Preencha os dados do novo usuário de suporte. A matrícula será gerada automaticamente.
                      </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4">
                      <div>
                        <Label htmlFor="support-nome">Nome</Label>
                        <Input
                          id="support-nome"
                          value={newSupport.nome}
                          onChange={(e) => setNewSupport({ ...newSupport, nome: e.target.value })}
                          placeholder="Nome completo"
                        />
                      </div>
                      <div>
                        <Label htmlFor="support-admin">Administrador Responsável *</Label>
                        <select
                          id="support-admin"
                          className="w-full p-2 border rounded-md"
                          value={newSupport.admin_id}
                          onChange={(e) => setNewSupport({ ...newSupport, admin_id: e.target.value })}
                        >
                          <option value="">Selecione um administrador</option>
                          {admins.map((admin) => (
                            <option key={admin.id} value={admin.id}>
                              {admin.nome}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>
                    <div className="bg-blue-50 p-4 rounded-lg">
                      <p className="text-sm text-blue-800">
                        <strong>Nota:</strong> A matrícula será gerada automaticamente (6 dígitos únicos)
                      </p>
                    </div>
                    <DialogFooter>
                      <Button variant="outline" onClick={() => setIsCreateSupportOpen(false)}>
                        Cancelar
                      </Button>
                      <Button onClick={createSupport} disabled={loading} className="w-full">
                        {loading ? 'Criando...' : 'Criar Suporte'}
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </div>
            </CardHeader>
            <CardContent>
              {supportLoading ? (
                <div className="flex items-center justify-center py-8">
                  <RefreshCw className="w-6 h-6 animate-spin" />
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Nome</TableHead>
                      <TableHead>Matrícula</TableHead>
                      <TableHead>Função</TableHead>
                      <TableHead>Criado em</TableHead>
                      <TableHead>Ações</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {supports.map((support) => (
                      <TableRow key={support.id}>
                        <TableCell className="font-medium">{support.nome}</TableCell>
                        <TableCell>
                          <Badge variant="outline">{support.matricula}</Badge>
                        </TableCell>
                        <TableCell>{getRoleBadge(support.role)}</TableCell>
                        <TableCell>{formatDate(support.created_at)}</TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Button
                              variant="destructive"
                              size="sm"
                              onClick={() => deleteSupport(support.id)}
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>


      </Tabs>
    </div>
  );
};

export default AccountsManagement;
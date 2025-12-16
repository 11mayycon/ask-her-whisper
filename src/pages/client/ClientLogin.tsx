import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Bot, ArrowLeft, Mail, Lock, Loader2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

const ClientLogin = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    email: "",
    password: ""
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: formData.email,
        password: formData.password,
      });

      if (error) {
        if (error.message.includes("Invalid login credentials")) {
          toast({
            title: "Erro no login",
            description: "Email ou senha incorretos",
            variant: "destructive"
          });
        } else {
          toast({
            title: "Erro no login",
            description: error.message,
            variant: "destructive"
          });
        }
        return;
      }

      if (data.user) {
        // Check if user is approved (has client role and active subscription)
        const { data: roleData } = await supabase
          .from('user_roles')
          .select('role')
          .eq('user_id', data.user.id)
          .single();

        if (!roleData || (roleData.role !== 'user' && roleData.role !== 'admin' && roleData.role !== 'super_admin')) {
          await supabase.auth.signOut();
          toast({
            title: "Acesso negado",
            description: "Seu cadastro ainda está pendente de aprovação. Aguarde a liberação do administrador.",
            variant: "destructive"
          });
          return;
        }

        toast({
          title: "Login realizado!",
          description: "Bem-vindo de volta!",
        });
        navigate('/client/dashboard');
      }
    } catch (err) {
      toast({
        title: "Erro",
        description: "Ocorreu um erro ao fazer login",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-blue-950 to-slate-950 relative overflow-hidden flex items-center justify-center">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute w-96 h-96 bg-blue-500/20 rounded-full blur-3xl top-0 -left-48 animate-pulse"></div>
        <div className="absolute w-96 h-96 bg-cyan-500/20 rounded-full blur-3xl bottom-0 -right-48 animate-pulse delay-700"></div>
      </div>

      <div className="container mx-auto px-4 relative z-10">
        {/* Back button */}
        <motion.div 
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="absolute top-8 left-4"
        >
          <Button 
            variant="ghost" 
            onClick={() => navigate('/entrar')}
            className="text-white/70 hover:text-white hover:bg-white/10"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Voltar
          </Button>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="max-w-md mx-auto"
        >
          <Card className="bg-white/5 border-white/10 backdrop-blur-xl shadow-2xl shadow-blue-500/10">
            <CardHeader className="text-center pb-2">
              <div className="flex items-center justify-center gap-2 mb-4">
                <Bot className="w-10 h-10 text-blue-400" />
                <span className="text-2xl font-bold text-white">ISA</span>
              </div>
              <CardTitle className="text-2xl text-white">Área do Cliente</CardTitle>
              <p className="text-slate-400 text-sm mt-2">
                Entre com suas credenciais para acessar
              </p>
            </CardHeader>

            <CardContent className="pt-6">
              <form onSubmit={handleSubmit} className="space-y-5">
                <div className="space-y-2">
                  <Label htmlFor="email" className="text-slate-300">Email</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
                    <Input
                      id="email"
                      type="email"
                      placeholder="seu@email.com"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      className="pl-10 bg-white/5 border-white/10 text-white placeholder:text-slate-500 focus:border-blue-500"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="password" className="text-slate-300">Senha</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
                    <Input
                      id="password"
                      type="password"
                      placeholder="••••••••"
                      value={formData.password}
                      onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                      className="pl-10 bg-white/5 border-white/10 text-white placeholder:text-slate-500 focus:border-blue-500"
                      required
                    />
                  </div>
                </div>

                <Button
                  type="submit"
                  disabled={isLoading}
                  className="w-full bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white font-semibold h-12"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Entrando...
                    </>
                  ) : (
                    "Entrar"
                  )}
                </Button>
              </form>

              <div className="mt-6 text-center space-y-3">
                <p className="text-slate-500 text-sm">
                  Não tem conta?{" "}
                  <span 
                    className="text-blue-400 cursor-pointer hover:underline"
                    onClick={() => navigate('/client/register')}
                  >
                    Cadastre-se
                  </span>
                </p>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
};

export default ClientLogin;

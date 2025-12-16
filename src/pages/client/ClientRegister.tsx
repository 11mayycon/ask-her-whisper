import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Bot, ArrowLeft, Mail, Lock, User, Phone, CreditCard, Loader2, CheckCircle } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

const ClientRegister = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    phone: "",
    cpf: ""
  });

  const formatCPF = (value: string) => {
    const numbers = value.replace(/\D/g, '');
    return numbers
      .replace(/(\d{3})(\d)/, '$1.$2')
      .replace(/(\d{3})(\d)/, '$1.$2')
      .replace(/(\d{3})(\d{1,2})/, '$1-$2')
      .replace(/(-\d{2})\d+?$/, '$1');
  };

  const formatPhone = (value: string) => {
    const numbers = value.replace(/\D/g, '');
    return numbers
      .replace(/(\d{2})(\d)/, '($1) $2')
      .replace(/(\d{5})(\d)/, '$1-$2')
      .replace(/(-\d{4})\d+?$/, '$1');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (formData.password !== formData.confirmPassword) {
      toast({
        title: "Erro",
        description: "As senhas não coincidem",
        variant: "destructive"
      });
      return;
    }

    if (formData.password.length < 6) {
      toast({
        title: "Erro",
        description: "A senha deve ter pelo menos 6 caracteres",
        variant: "destructive"
      });
      return;
    }

    setIsLoading(true);

    try {
      // Create user in Supabase Auth
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
        options: {
          emailRedirectTo: `${window.location.origin}/client/login`,
          data: {
            full_name: formData.name,
            phone: formData.phone.replace(/\D/g, ''),
            cpf: formData.cpf.replace(/\D/g, ''),
            status: 'pending' // Mark as pending approval
          }
        }
      });

      if (authError) {
        if (authError.message.includes("already registered")) {
          toast({
            title: "Erro",
            description: "Este email já está cadastrado",
            variant: "destructive"
          });
        } else {
          toast({
            title: "Erro no cadastro",
            description: authError.message,
            variant: "destructive"
          });
        }
        return;
      }

      if (authData.user) {
        // Insert into users table for admin approval tracking
        const { error: insertError } = await supabase
          .from('users')
          .insert({
            id: authData.user.id,
            name: formData.name,
            email: formData.email,
            cpf: formData.cpf.replace(/\D/g, ''),
            password: 'supabase_auth', // Placeholder since real password is in auth
            role: 'user',
            is_active: false // Pending approval
          });

        if (insertError) {
          console.error('Error inserting user:', insertError);
        }

        setIsSuccess(true);
      }
    } catch (err) {
      toast({
        title: "Erro",
        description: "Ocorreu um erro ao fazer o cadastro",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-blue-950 to-slate-950 relative overflow-hidden flex items-center justify-center py-12">
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

        <AnimatePresence mode="wait">
          {isSuccess ? (
            <motion.div
              key="success"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="max-w-md mx-auto"
            >
              <Card className="bg-white/5 border-white/10 backdrop-blur-xl shadow-2xl shadow-green-500/10">
                <CardContent className="pt-12 pb-8 text-center">
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: "spring", duration: 0.5, delay: 0.2 }}
                  >
                    <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-gradient-to-br from-green-500/30 to-emerald-500/30 flex items-center justify-center">
                      <CheckCircle className="w-10 h-10 text-green-400" />
                    </div>
                  </motion.div>
                  
                  <h2 className="text-2xl font-bold text-white mb-3">
                    Cadastro Enviado!
                  </h2>
                  <p className="text-slate-400 mb-8">
                    Seu cadastro foi enviado para aprovação. Aguarde a liberação do administrador para acessar a plataforma.
                  </p>

                  <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-4 mb-6">
                    <p className="text-blue-300 text-sm">
                      📧 Você receberá um email quando seu acesso for liberado.
                    </p>
                  </div>

                  <Button
                    onClick={() => navigate('/client/login')}
                    className="w-full bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white font-semibold h-12"
                  >
                    Ir para Login
                  </Button>
                </CardContent>
              </Card>
            </motion.div>
          ) : (
            <motion.div
              key="form"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.5 }}
              className="max-w-md mx-auto"
            >
              <Card className="bg-white/5 border-white/10 backdrop-blur-xl shadow-2xl shadow-blue-500/10">
                <CardHeader className="text-center pb-2">
                  <div className="flex items-center justify-center gap-2 mb-4">
                    <Bot className="w-10 h-10 text-blue-400" />
                    <span className="text-2xl font-bold text-white">ISA</span>
                  </div>
                  <CardTitle className="text-2xl text-white">Criar Conta</CardTitle>
                  <p className="text-slate-400 text-sm mt-2">
                    Preencha seus dados para solicitar acesso
                  </p>
                </CardHeader>

                <CardContent className="pt-6">
                  <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="name" className="text-slate-300">Nome Completo</Label>
                      <div className="relative">
                        <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
                        <Input
                          id="name"
                          type="text"
                          placeholder="Seu nome completo"
                          value={formData.name}
                          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                          className="pl-10 bg-white/5 border-white/10 text-white placeholder:text-slate-500 focus:border-blue-500"
                          required
                        />
                      </div>
                    </div>

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
                      <Label htmlFor="phone" className="text-slate-300">WhatsApp</Label>
                      <div className="relative">
                        <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
                        <Input
                          id="phone"
                          type="tel"
                          placeholder="(00) 00000-0000"
                          value={formData.phone}
                          onChange={(e) => setFormData({ ...formData, phone: formatPhone(e.target.value) })}
                          className="pl-10 bg-white/5 border-white/10 text-white placeholder:text-slate-500 focus:border-blue-500"
                          maxLength={15}
                          required
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="cpf" className="text-slate-300">CPF</Label>
                      <div className="relative">
                        <CreditCard className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
                        <Input
                          id="cpf"
                          type="text"
                          placeholder="000.000.000-00"
                          value={formData.cpf}
                          onChange={(e) => setFormData({ ...formData, cpf: formatCPF(e.target.value) })}
                          className="pl-10 bg-white/5 border-white/10 text-white placeholder:text-slate-500 focus:border-blue-500"
                          maxLength={14}
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

                    <div className="space-y-2">
                      <Label htmlFor="confirmPassword" className="text-slate-300">Confirmar Senha</Label>
                      <div className="relative">
                        <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
                        <Input
                          id="confirmPassword"
                          type="password"
                          placeholder="••••••••"
                          value={formData.confirmPassword}
                          onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                          className="pl-10 bg-white/5 border-white/10 text-white placeholder:text-slate-500 focus:border-blue-500"
                          required
                        />
                      </div>
                    </div>

                    <Button
                      type="submit"
                      disabled={isLoading}
                      className="w-full bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white font-semibold h-12 mt-2"
                    >
                      {isLoading ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          Cadastrando...
                        </>
                      ) : (
                        "Enviar Cadastro"
                      )}
                    </Button>
                  </form>

                  <div className="mt-6 text-center">
                    <p className="text-slate-500 text-sm">
                      Já tem conta?{" "}
                      <span 
                        className="text-blue-400 cursor-pointer hover:underline"
                        onClick={() => navigate('/client/login')}
                      >
                        Fazer login
                      </span>
                    </p>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default ClientRegister;

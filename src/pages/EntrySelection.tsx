import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Bot, Shield, Users, ArrowLeft, Sparkles } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";

const EntrySelection = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-blue-950 to-slate-950 relative overflow-hidden flex items-center justify-center">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute w-96 h-96 bg-blue-500/20 rounded-full blur-3xl top-0 -left-48 animate-pulse"></div>
        <div className="absolute w-96 h-96 bg-purple-500/20 rounded-full blur-3xl bottom-0 -right-48 animate-pulse delay-700"></div>
        <div className="absolute w-64 h-64 bg-cyan-500/10 rounded-full blur-2xl top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 animate-pulse delay-1000"></div>
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
            onClick={() => navigate('/')}
            className="text-white/70 hover:text-white hover:bg-white/10"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Voltar
          </Button>
        </motion.div>

        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-center mb-12"
          >
            <div className="flex items-center justify-center gap-3 mb-4">
              <Bot className="w-12 h-12 text-blue-400" />
              <span className="text-3xl font-bold text-white">ISA</span>
            </div>
            <h1 className="text-3xl md:text-4xl font-bold text-white mb-3">
              Bem-vindo à ISA
            </h1>
            <p className="text-slate-400 text-lg">
              Escolha como deseja acessar a plataforma
            </p>
          </motion.div>

          {/* Selection Cards */}
          <div className="grid md:grid-cols-2 gap-8">
            {/* Admin Card */}
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              <Card 
                onClick={() => navigate('/admin/login')}
                className="group cursor-pointer bg-white/5 border-white/10 backdrop-blur-xl hover:bg-white/10 hover:border-purple-500/50 transition-all duration-500 hover:scale-[1.02] hover:shadow-2xl hover:shadow-purple-500/20 overflow-hidden relative"
              >
                {/* Glow effect */}
                <div className="absolute inset-0 bg-gradient-to-br from-purple-500/0 to-purple-500/0 group-hover:from-purple-500/10 group-hover:to-pink-500/10 transition-all duration-500"></div>
                
                <CardContent className="p-8 text-center relative z-10">
                  <div className="w-24 h-24 mx-auto mb-6 rounded-2xl bg-gradient-to-br from-purple-500/30 to-pink-500/30 flex items-center justify-center group-hover:scale-110 transition-transform duration-500 shadow-lg shadow-purple-500/20">
                    <Shield className="w-12 h-12 text-purple-400 group-hover:text-purple-300 transition-colors" />
                  </div>
                  
                  <h2 className="text-2xl font-bold text-white mb-3 group-hover:text-purple-200 transition-colors">
                    Administrador
                  </h2>
                  
                  <p className="text-slate-400 mb-6 group-hover:text-slate-300 transition-colors">
                    Acesso ao painel de controle completo. Gerencie clientes, configurações e monitore o sistema.
                  </p>

                  <div className="space-y-2 text-sm text-slate-500 mb-6">
                    <div className="flex items-center justify-center gap-2">
                      <Sparkles className="w-4 h-4" />
                      <span>Gestão de clientes</span>
                    </div>
                    <div className="flex items-center justify-center gap-2">
                      <Sparkles className="w-4 h-4" />
                      <span>Configurações globais da IA</span>
                    </div>
                    <div className="flex items-center justify-center gap-2">
                      <Sparkles className="w-4 h-4" />
                      <span>Relatórios e logs</span>
                    </div>
                  </div>

                  <Button 
                    className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-semibold h-12 group-hover:shadow-lg group-hover:shadow-purple-500/30 transition-all"
                  >
                    Entrar como Administrador
                  </Button>
                </CardContent>
              </Card>
            </motion.div>

            {/* Client Card */}
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
            >
              <Card 
                onClick={() => navigate('/client/login')}
                className="group cursor-pointer bg-white/5 border-white/10 backdrop-blur-xl hover:bg-white/10 hover:border-blue-500/50 transition-all duration-500 hover:scale-[1.02] hover:shadow-2xl hover:shadow-blue-500/20 overflow-hidden relative"
              >
                {/* Glow effect */}
                <div className="absolute inset-0 bg-gradient-to-br from-blue-500/0 to-cyan-500/0 group-hover:from-blue-500/10 group-hover:to-cyan-500/10 transition-all duration-500"></div>
                
                <CardContent className="p-8 text-center relative z-10">
                  <div className="w-24 h-24 mx-auto mb-6 rounded-2xl bg-gradient-to-br from-blue-500/30 to-cyan-500/30 flex items-center justify-center group-hover:scale-110 transition-transform duration-500 shadow-lg shadow-blue-500/20">
                    <Users className="w-12 h-12 text-blue-400 group-hover:text-blue-300 transition-colors" />
                  </div>
                  
                  <h2 className="text-2xl font-bold text-white mb-3 group-hover:text-blue-200 transition-colors">
                    Cliente
                  </h2>
                  
                  <p className="text-slate-400 mb-6 group-hover:text-slate-300 transition-colors">
                    Acesso ao seu painel pessoal. Configure sua IA, conecte o WhatsApp e gerencie seu atendimento.
                  </p>

                  <div className="space-y-2 text-sm text-slate-500 mb-6">
                    <div className="flex items-center justify-center gap-2">
                      <Sparkles className="w-4 h-4" />
                      <span>Conexão WhatsApp</span>
                    </div>
                    <div className="flex items-center justify-center gap-2">
                      <Sparkles className="w-4 h-4" />
                      <span>Personalização da IA</span>
                    </div>
                    <div className="flex items-center justify-center gap-2">
                      <Sparkles className="w-4 h-4" />
                      <span>Histórico de conversas</span>
                    </div>
                  </div>

                  <Button 
                    className="w-full bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white font-semibold h-12 group-hover:shadow-lg group-hover:shadow-blue-500/30 transition-all"
                  >
                    Entrar como Cliente
                  </Button>
                </CardContent>
              </Card>
            </motion.div>
          </div>

          {/* Footer info */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.5 }}
            className="text-center mt-12"
          >
            <p className="text-slate-500 text-sm">
              Ainda não tem conta? <span className="text-blue-400 cursor-pointer hover:underline" onClick={() => navigate('/client/register')}>Cadastre-se aqui</span>
            </p>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default EntrySelection;

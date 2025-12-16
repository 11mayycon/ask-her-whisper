import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Bot, Clock, Zap, BarChart3, MessageSquare, Shield, Sparkles, 
  CheckCircle, Users, Brain, Headphones, ArrowRight, Play,
  MessageCircle, Send
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { motion, useMotionValue, useSpring, AnimatePresence } from "framer-motion";

// WhatsApp Chat Simulation Messages
const chatScenarios = {
  suporte: [
    { type: "bot", text: "Olá! Sou a ISA, sua assistente virtual 🤖", delay: 500 },
    { type: "bot", text: "Como posso te ajudar hoje?", delay: 1000 },
    { type: "user", text: "Preciso de suporte técnico", delay: 2000 },
    { type: "bot", text: "Entendi! Vou te ajudar com suporte técnico 💪", delay: 3000 },
    { type: "bot", text: "Qual é o problema que você está enfrentando?", delay: 3800 },
  ],
  comprar: [
    { type: "bot", text: "Olá! Sou a ISA, sua assistente de vendas 🛒", delay: 500 },
    { type: "bot", text: "Posso ajudar você a encontrar o produto ideal!", delay: 1000 },
    { type: "user", text: "Quero comprar um plano", delay: 2000 },
    { type: "bot", text: "Ótima escolha! Temos planos a partir de R$59,90/mês 🎉", delay: 3000 },
    { type: "bot", text: "Quer que eu explique os benefícios de cada plano?", delay: 3800 },
  ],
  informacoes: [
    { type: "bot", text: "Olá! Sou a ISA, sua assistente inteligente 🧠", delay: 500 },
    { type: "bot", text: "Estou aqui 24h para tirar suas dúvidas!", delay: 1000 },
    { type: "user", text: "Quero informações sobre o serviço", delay: 2000 },
    { type: "bot", text: "A ISA é uma plataforma de IA para WhatsApp 🚀", delay: 3000 },
    { type: "bot", text: "Automatize seu atendimento, vendas e suporte sem código!", delay: 3800 },
  ]
};

const LandingPage = () => {
  const navigate = useNavigate();
  const [selectedScenario, setSelectedScenario] = useState<keyof typeof chatScenarios | null>(null);
  const [visibleMessages, setVisibleMessages] = useState<typeof chatScenarios.suporte>([]);
  const [isTyping, setIsTyping] = useState(false);
  const chatContainerRef = useRef<HTMLDivElement>(null);
  
  // Robot following cursor
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  const robotX = useSpring(mouseX, { stiffness: 50, damping: 20 });
  const robotY = useSpring(mouseY, { stiffness: 50, damping: 20 });

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      mouseX.set(e.clientX - 25);
      mouseY.set(e.clientY - 25);
    };
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, [mouseX, mouseY]);

  // Chat simulation effect
  useEffect(() => {
    if (!selectedScenario) return;
    
    setVisibleMessages([]);
    const messages = chatScenarios[selectedScenario];
    
    messages.forEach((msg, index) => {
      setTimeout(() => {
        if (msg.type === 'bot' && index > 0) {
          setIsTyping(true);
          setTimeout(() => {
            setIsTyping(false);
            setVisibleMessages(prev => [...prev, msg]);
          }, 800);
        } else {
          setVisibleMessages(prev => [...prev, msg]);
        }
      }, msg.delay);
    });
  }, [selectedScenario]);

  // Auto scroll chat
  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [visibleMessages, isTyping]);

  const features = [
    { icon: Bot, title: "IA Avançada", description: "Respostas inteligentes e contextuais", color: "from-blue-500 to-cyan-500" },
    { icon: Clock, title: "24/7 Online", description: "Atendimento ininterrupto", color: "from-green-500 to-emerald-500" },
    { icon: Zap, title: "Ultra Rápido", description: "Respostas em segundos", color: "from-yellow-500 to-orange-500" },
    { icon: MessageSquare, title: "WhatsApp", description: "Integração nativa", color: "from-emerald-500 to-green-500" },
    { icon: Brain, title: "Aprende Sozinha", description: "Melhora com o tempo", color: "from-purple-500 to-pink-500" },
    { icon: Shield, title: "Seguro", description: "Dados protegidos", color: "from-slate-500 to-slate-600" },
  ];

  const stats = [
    { value: "10K+", label: "Mensagens/dia" },
    { value: "500+", label: "Clientes ativos" },
    { value: "99.9%", label: "Uptime" },
    { value: "24/7", label: "Suporte ativo" },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-blue-950 to-slate-950 relative overflow-hidden">
      {/* Robot following cursor */}
      <motion.div
        className="fixed w-12 h-12 pointer-events-none z-50 hidden lg:block"
        style={{ x: robotX, y: robotY }}
      >
        <div className="w-full h-full rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center shadow-lg shadow-blue-500/50 animate-pulse">
          <Bot className="w-6 h-6 text-white" />
        </div>
      </motion.div>

      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute w-[600px] h-[600px] bg-blue-500/10 rounded-full blur-3xl top-0 -left-48 animate-pulse"></div>
        <div className="absolute w-[600px] h-[600px] bg-purple-500/10 rounded-full blur-3xl bottom-0 -right-48 animate-pulse delay-700"></div>
        <div className="absolute w-[400px] h-[400px] bg-cyan-500/5 rounded-full blur-2xl top-1/3 left-1/3 animate-pulse delay-1000"></div>
        {/* Grid pattern */}
        <div className="absolute inset-0 bg-[linear-gradient(rgba(59,130,246,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(59,130,246,0.03)_1px,transparent_1px)] bg-[size:50px_50px]"></div>
      </div>

      <div className="container mx-auto px-4 py-8 relative z-10">
        {/* Header */}
        <motion.header 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex justify-between items-center mb-16"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center">
              <Bot className="w-6 h-6 text-white" />
            </div>
            <span className="text-2xl font-bold text-white">ISA</span>
            <Badge className="bg-blue-500/20 text-blue-300 border-blue-500/30 text-xs ml-2">
              v2.5
            </Badge>
          </div>
          <Button 
            onClick={() => navigate('/entrar')}
            className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold px-6 shadow-lg shadow-blue-500/25 hover:shadow-xl hover:shadow-blue-500/30 transition-all duration-300 hover:scale-105"
          >
            Entrar
          </Button>
        </motion.header>

        <div className="max-w-7xl mx-auto space-y-24">
          {/* Hero Section */}
          <section className="text-center space-y-8">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="space-y-6"
            >
              <Badge className="bg-gradient-to-r from-blue-500/20 to-purple-500/20 text-blue-300 border-blue-500/30 text-sm px-4 py-2">
                <Sparkles className="w-4 h-4 mr-2 inline" />
                Conecte sua IA ao WhatsApp em minutos
              </Badge>
              
              <h1 className="text-5xl md:text-7xl font-bold text-white leading-tight">
                Atendimento
                <br />
                <span className="bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
                  Automático 24h
                </span>
              </h1>
              
              <p className="text-xl md:text-2xl text-slate-400 max-w-3xl mx-auto">
                Automatize vendas, suporte e agendamentos com Inteligência Artificial.
                <br />
                <span className="text-blue-400">Sem código. Sem complicação.</span>
              </p>

              <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
                <Button
                  size="lg"
                  onClick={() => navigate('/entrar')}
                  className="text-lg h-14 px-8 bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white font-bold shadow-lg shadow-blue-500/30 hover:shadow-xl hover:shadow-blue-500/40 transition-all duration-300 hover:scale-105"
                >
                  Começar Agora
                  <ArrowRight className="w-5 h-5 ml-2" />
                </Button>
                <Button
                  size="lg"
                  variant="outline"
                  className="text-lg h-14 px-8 border-white/20 text-white hover:bg-white/10 backdrop-blur-sm"
                  onClick={() => document.getElementById('demo')?.scrollIntoView({ behavior: 'smooth' })}
                >
                  <Play className="w-5 h-5 mr-2" />
                  Ver Demonstração
                </Button>
              </div>
            </motion.div>

            {/* Stats */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="grid grid-cols-2 md:grid-cols-4 gap-6 pt-8"
            >
              {stats.map((stat, index) => (
                <div key={index} className="text-center">
                  <div className="text-3xl md:text-4xl font-bold text-white mb-1">{stat.value}</div>
                  <div className="text-slate-500 text-sm">{stat.label}</div>
                </div>
              ))}
            </motion.div>
          </section>

          {/* Features Grid */}
          <motion.section
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="space-y-8"
          >
            <div className="text-center">
              <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
                Por que escolher a ISA?
              </h2>
              <p className="text-slate-400 max-w-2xl mx-auto">
                Uma plataforma completa para automatizar seu atendimento com inteligência artificial
              </p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {features.map((feature, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                >
                  <Card className="group bg-white/5 border-white/10 backdrop-blur-xl hover:bg-white/10 transition-all duration-500 hover:scale-[1.02] hover:shadow-xl hover:shadow-blue-500/10 h-full">
                    <CardContent className="p-6 space-y-4">
                      <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${feature.color} p-0.5`}>
                        <div className="w-full h-full rounded-2xl bg-slate-900 flex items-center justify-center">
                          <feature.icon className="w-7 h-7 text-white" />
                        </div>
                      </div>
                      <h3 className="text-xl font-bold text-white">{feature.title}</h3>
                      <p className="text-slate-400">{feature.description}</p>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          </motion.section>

          {/* Interactive Demo Section */}
          <motion.section
            id="demo"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="space-y-8"
          >
            <div className="text-center">
              <Badge className="bg-emerald-500/20 text-emerald-300 border-emerald-500/30 text-sm px-4 py-2 mb-4">
                <MessageCircle className="w-4 h-4 mr-2 inline" />
                Demonstração Interativa
              </Badge>
              <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
                Experimente a ISA em ação
              </h2>
              <p className="text-slate-400 max-w-2xl mx-auto">
                Clique em uma das opções abaixo e veja como a IA responde automaticamente
              </p>
            </div>

            <div className="grid lg:grid-cols-2 gap-8 items-center">
              {/* Scenario buttons */}
              <div className="space-y-4">
                <h3 className="text-xl font-semibold text-white mb-6">Escolha um cenário:</h3>
                
                {[
                  { key: 'suporte', icon: Headphones, label: 'Quero suporte', desc: 'Veja como a IA atende solicitações de ajuda' },
                  { key: 'comprar', icon: BarChart3, label: 'Quero comprar', desc: 'Simulação de atendimento de vendas' },
                  { key: 'informacoes', icon: MessageSquare, label: 'Quero informações', desc: 'Como a IA tira dúvidas dos clientes' },
                ].map((scenario) => (
                  <motion.button
                    key={scenario.key}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => setSelectedScenario(scenario.key as keyof typeof chatScenarios)}
                    className={`w-full p-4 rounded-xl border text-left transition-all duration-300 ${
                      selectedScenario === scenario.key 
                        ? 'bg-blue-500/20 border-blue-500/50 shadow-lg shadow-blue-500/20' 
                        : 'bg-white/5 border-white/10 hover:bg-white/10'
                    }`}
                  >
                    <div className="flex items-center gap-4">
                      <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                        selectedScenario === scenario.key ? 'bg-blue-500' : 'bg-white/10'
                      }`}>
                        <scenario.icon className="w-6 h-6 text-white" />
                      </div>
                      <div>
                        <div className="font-semibold text-white">{scenario.label}</div>
                        <div className="text-sm text-slate-400">{scenario.desc}</div>
                      </div>
                    </div>
                  </motion.button>
                ))}
              </div>

              {/* WhatsApp Mockup */}
              <div className="flex justify-center">
                <motion.div 
                  initial={{ opacity: 0, scale: 0.9 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  className="relative w-[320px] h-[640px] bg-slate-900 rounded-[3rem] border-8 border-slate-800 shadow-2xl shadow-emerald-500/20"
                >
                  {/* Phone notch */}
                  <div className="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-7 bg-slate-900 rounded-b-2xl z-10"></div>
                  
                  {/* Phone screen */}
                  <div className="absolute inset-2 bg-[#111b21] rounded-[2.3rem] overflow-hidden">
                    {/* WhatsApp Header */}
                    <div className="bg-[#202c33] px-4 py-3 flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center">
                        <Bot className="w-6 h-6 text-white" />
                      </div>
                      <div className="flex-1">
                        <div className="text-white font-semibold">ISA - Assistente</div>
                        <div className="text-emerald-400 text-xs">online</div>
                      </div>
                    </div>

                    {/* Chat area */}
                    <div 
                      ref={chatContainerRef}
                      className="h-[calc(100%-120px)] bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHZpZXdCb3g9IjAgMCA0MCA0MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cGF0aCBkPSJNMCAwaDE0djE0SDBWMHptMjYgMGgxNHYxNEgyNlYwek0wIDI2aDE0djE0SDBWMjZ6bTI2IDBoMTR2MTRIMjZWMjZ6IiBmaWxsPSJyZ2JhKDI1NSwyNTUsMjU1LDAuMDIpIi8+PC9zdmc+')] p-3 space-y-2 overflow-y-auto"
                    >
                      {!selectedScenario && (
                        <div className="flex items-center justify-center h-full">
                          <p className="text-slate-500 text-center text-sm px-4">
                            👆 Clique em um cenário ao lado para ver a demonstração
                          </p>
                        </div>
                      )}
                      
                      <AnimatePresence>
                        {visibleMessages.map((msg, index) => (
                          <motion.div
                            key={index}
                            initial={{ opacity: 0, y: 10, scale: 0.95 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            exit={{ opacity: 0 }}
                            className={`flex ${msg.type === 'user' ? 'justify-end' : 'justify-start'}`}
                          >
                            <div className={`max-w-[80%] rounded-lg p-3 ${
                              msg.type === 'user' 
                                ? 'bg-[#005c4b] rounded-tr-none' 
                                : 'bg-[#202c33] rounded-tl-none'
                            }`}>
                              <p className="text-sm text-white">{msg.text}</p>
                              <span className="text-[10px] text-slate-400 mt-1 block text-right">
                                {new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                              </span>
                            </div>
                          </motion.div>
                        ))}
                      </AnimatePresence>

                      {isTyping && (
                        <motion.div
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          className="flex justify-start"
                        >
                          <div className="bg-[#202c33] rounded-lg rounded-tl-none p-3 px-4">
                            <div className="flex gap-1">
                              <span className="w-2 h-2 bg-slate-400 rounded-full animate-bounce"></span>
                              <span className="w-2 h-2 bg-slate-400 rounded-full animate-bounce delay-100"></span>
                              <span className="w-2 h-2 bg-slate-400 rounded-full animate-bounce delay-200"></span>
                            </div>
                          </div>
                        </motion.div>
                      )}
                    </div>

                    {/* Input area */}
                    <div className="absolute bottom-0 left-0 right-0 bg-[#202c33] p-2 flex items-center gap-2">
                      <div className="flex-1 bg-[#2a3942] rounded-full px-4 py-2">
                        <span className="text-slate-500 text-sm">Digite uma mensagem</span>
                      </div>
                      <div className="w-10 h-10 rounded-full bg-emerald-500 flex items-center justify-center">
                        <Send className="w-5 h-5 text-white" />
                      </div>
                    </div>
                  </div>

                  {/* Phone button */}
                  <div className="absolute bottom-2 left-1/2 -translate-x-1/2 w-32 h-1 bg-slate-700 rounded-full"></div>
                </motion.div>
              </div>
            </div>
          </motion.section>

          {/* Pricing CTA */}
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <Card className="bg-gradient-to-br from-blue-900/50 to-purple-900/50 border-blue-500/30 backdrop-blur-xl overflow-hidden">
              <CardContent className="p-8 md:p-12">
                <div className="grid md:grid-cols-2 gap-12 items-center">
                  <div className="space-y-6">
                    <Badge className="bg-yellow-500/20 text-yellow-300 border-yellow-500/30">
                      🔥 Oferta de Lançamento
                    </Badge>
                    
                    <h2 className="text-3xl md:text-4xl font-bold text-white">
                      Comece a automatizar seu atendimento hoje
                    </h2>
                    
                    <ul className="space-y-3">
                      {[
                        "IA treinada para seu negócio",
                        "Integração WhatsApp em minutos",
                        "Suporte técnico incluído",
                        "Sem limite de mensagens",
                        "Cancele quando quiser"
                      ].map((item, i) => (
                        <li key={i} className="flex items-center gap-3 text-slate-300">
                          <CheckCircle className="w-5 h-5 text-emerald-400 flex-shrink-0" />
                          {item}
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="text-center space-y-6">
                    <div>
                      <span className="text-slate-400 text-lg line-through">R$ 149,90</span>
                      <div className="flex items-baseline justify-center gap-2">
                        <span className="text-6xl font-bold text-white">R$ 59,90</span>
                        <span className="text-xl text-slate-400">/mês</span>
                      </div>
                    </div>

                    <Button
                      size="lg"
                      onClick={() => window.open('https://w.app/rcro09', '_blank')}
                      className="w-full text-xl h-16 bg-gradient-to-r from-emerald-500 to-cyan-500 hover:from-emerald-600 hover:to-cyan-600 text-white font-bold shadow-lg shadow-emerald-500/30 hover:shadow-xl hover:shadow-emerald-500/40 transition-all duration-300 hover:scale-105"
                    >
                      <Zap className="w-6 h-6 mr-2" />
                      Começar Agora
                    </Button>

                    <p className="text-slate-500 text-sm">
                      ⚡ Ativação instantânea • Sem burocracia
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.section>

          {/* Trust badges */}
          <motion.footer
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="text-center space-y-8 pb-12"
          >
            <div className="flex flex-wrap justify-center gap-8 items-center">
              {[
                { icon: Shield, text: "Pagamento Seguro" },
                { icon: Users, text: "500+ Clientes" },
                { icon: Clock, text: "Suporte 24/7" },
                { icon: Bot, text: "IA Avançada" },
              ].map((item, i) => (
                <div key={i} className="flex items-center gap-2 text-slate-500">
                  <item.icon className="w-5 h-5" />
                  <span className="text-sm">{item.text}</span>
                </div>
              ))}
            </div>

            <p className="text-slate-600 text-sm">
              © 2024 ISA - Inteligência para Atendimento. Todos os direitos reservados.
            </p>
          </motion.footer>
        </div>
      </div>
    </div>
  );
};

export default LandingPage;

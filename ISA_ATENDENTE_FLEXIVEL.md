# 🤖 ISA - Atendente Flexível com IA Groq

## ✅ Sistema Atualizado!

A ISA foi **completamente transformada** de um bot de vendas com fluxo fixo para uma **atendente virtual inteligente e flexível** que:

✅ Usa **Groq AI** (Llama 3.1) para respostas contextuais
✅ Lê e segue instruções da **Memória de IA** configurável
✅ Mantém **histórico de conversas** por contato
✅ **Adapta-se** ao contexto de cada conversa
✅ **Sem fluxo pré-definido** - totalmente flexível

---

## 🎯 Como Funciona

### 1. **Memória da IA (Configurável)**

A ISA lê suas instruções da aba **"Memória de IA"** no painel admin:

```
📍 Acesse: https://isa.inovapro.cloud/admin/ai-memory
```

**O que você configurar lá, a ISA seguirá!**

### 2. **Groq AI (Motor Inteligente)**

- **Modelo:** Llama 3.1 8B Instant
- **API:** Groq (ultrarrápida)
- **Contexto:** Mantém até 10 mensagens anteriores
- **Temperatura:** 0.9 (criativa mas focada)
- **Tokens:** Até 250 por resposta

### 3. **Histórico de Conversas**

Cada contato tem seu próprio histórico que a IA usa para:
- Lembrar do que foi conversado
- Manter consistência
- Personalizar respostas
- Evitar repetições

---

## 🔧 Configuração

### Memória Padrão da ISA

Se não houver memória configurada, a ISA usa este padrão:

```
Você é a ISA (InovaPro AI Sales Assistant), uma atendente virtual inteligente e flexível.

PERSONALIDADE:
- Natural, empática e carismática
- Profissional mas descontraída
- Prestativa e solucionadora
- Adapta-se ao contexto da conversa

TOM DE VOZ:
- Respostas curtas e objetivas (máx 3-4 frases)
- Linguagem coloquial brasileira
- Emojis estratégicos
- Evite textos longos

CAPACIDADES:
- Atender dúvidas gerais
- Auxiliar com suporte
- Realizar vendas quando apropriado
- Coletar informações quando necessário
- Transferir para humano quando solicitado

IMPORTANTE:
- Sempre leia e siga as instruções da memória personalizada
- Adapte-se ao que o administrador configurou
- Seja flexível e contextual
```

### Como Personalizar

**1. Acesse a Memória de IA:**
```
https://isa.inovapro.cloud/admin/ai-memory
```

**2. Configure suas instruções:**

Exemplo para **Vendedora de PDV**:
```
Você é a ISA, vendedora especialista em PDV InovaPro.

OBJETIVO:
Converter leads em clientes pagantes do PDV InovaPro.

PRODUTO:
- PDV InovaPro (https://pdv.inovapro.cloud/)
- Controle de vendas, estoque e relatórios
- Preço: R$ 149,60 no primeiro mês (normal R$ 300)
- Teste grátis: teste@inovapro.cloud / senha: 1285042

FLUXO:
1. Cumprimente e qualifique (loja/mercado/posto?)
2. Identifique dores (controle manual? perdas?)
3. Ofereça teste gratuito
4. Após teste, envie pitch de venda
5. Colete email e gere link de pagamento

TOM:
Empática, persuasiva mas não agressiva. Máximo 3 frases.
```

Exemplo para **Suporte Técnico**:
```
Você é a ISA, assistente de suporte técnico da InovaPro.

OBJETIVO:
Resolver problemas e tirar dúvidas dos clientes.

CAPACIDADES:
- Ajudar com login e acesso
- Explicar funcionalidades do sistema
- Troubleshooting de problemas comuns
- Escalar para humano quando necessário

QUANDO ESCALAR:
- Problemas técnicos complexos
- Cliente solicita falar com humano
- Bugs ou erros críticos
- Questões de pagamento/faturamento

TOM:
Paciente, clara e objetiva. Use linguagem simples.
```

Exemplo para **Atendente Geral**:
```
Você é a ISA, recepcionista virtual da InovaPro.

FUNÇÃO:
Atender todos os contatos e direcionar adequadamente.

SAUDAÇÃO:
"Oi! Sou a ISA, assistente da InovaPro 😊
Você quer:
1️⃣ Conhecer nosso PDV
2️⃣ Suporte técnico
3️⃣ Falar com comercial
4️⃣ Outro assunto"

DIRECIONAMENTO:
- Vendas → Apresentar PDV
- Suporte → Coletar problema e transferir
- Comercial → Coletar dados e agendar
- Outros → Escutar e ajudar

TOM:
Amigável, prestativa e eficiente.
```

**3. Salve as instruções**

A ISA recarrega automaticamente! ✨

---

## 🔄 Atualização Automática

Quando você salva a memória, a ISA:
1. ✅ Salva no banco de dados SQLite
2. ✅ Recarrega a memória automaticamente
3. ✅ Aplica nas próximas conversas

**Não precisa reiniciar nada!**

---

## 📊 Dados Coletados Automaticamente

A ISA extrai automaticamente das mensagens:

| Dado | Como detecta |
|------|--------------|
| **Nome** | "Meu nome é...", "Sou..." |
| **Email** | Padrão `email@dominio.com` |
| **Tipo de negócio** | Palavras-chave: loja, mercado, posto, restaurante |
| **Sistema atual** | manual, planilha, sistema, nenhum |

Esses dados ficam salvos e a IA os usa no contexto.

---

## 🧪 Testando

### 1. Via WhatsApp Real
Envie mensagem para o número conectado na instância.

### 2. Via Simulação
```bash
curl -X POST "https://isa.inovapro.cloud/api/webhooks/evolution" \
  -H "Content-Type: application/json" \
  -d '{
    "data": {
      "message": {
        "conversation": "oi, preciso de ajuda",
        "fromMe": false
      },
      "key": {
        "remoteJid": "5511999999999@s.whatsapp.net"
      },
      "messageType": "conversation"
    }
  }'
```

### 3. Monitorar Logs
```bash
docker logs isa_backend --follow
```

Você verá:
```
🤖 Resposta da IA gerada: Oi! 😊 Como posso te ajudar?
```

---

## 🔍 Verificar Configuração

### Checar memória ativa:
```bash
curl http://localhost:3002/api/ai/memory
```

### Ver leads salvos:
```bash
sqlite3 /root/isa2.5/server/data/isa.db \
  "SELECT phone, name, business_type, stage FROM sales_leads;"
```

---

## 🎭 Exemplos de Uso

### Vendas
```
Cliente: oi
ISA: Oi! 😊 Tudo bem?
Você trabalha com loja, mercado ou posto?

Cliente: mercado
ISA: Legal! Como vocês controlam vendas e estoque hoje?

Cliente: tudo manual
ISA: Entendo! Muita gente perde tempo assim 😅
Quer testar nosso PDV grátis? É só acessar:
https://pdv.inovapro.cloud/
Email: teste@inovapro.cloud
Senha: 1285042
```

### Suporte
```
Cliente: não consigo entrar no sistema
ISA: Oi! Vou te ajudar 😊
Qual erro aparece quando tenta fazer login?

Cliente: diz senha incorreta
ISA: Entendi! Vamos resetar sua senha.
Me passa seu email cadastrado?
```

### Geral
```
Cliente: vocês fazem sistema para clínica?
ISA: Oi! 😊 Atualmente nosso PDV é focado em comércio (lojas, mercados, postos).
Para clínicas, recomendo falar com nosso comercial.
Posso anotar seus dados para retornarem?
```

---

## 🛠️ Arquitetura Técnica

### Fluxo de Processamento

```
1. WhatsApp → Evolution API
2. Evolution → Webhook ISA
3. ISA carrega lead/cria novo
4. ISA adiciona mensagem ao histórico
5. ISA consulta memória de IA
6. ISA chama Groq AI com contexto completo
7. Groq retorna resposta
8. ISA envia via Evolution API
9. ISA salva histórico atualizado
```

### Arquivos Modificados

**server/src/services/sales-bot.ts** - Reescrito completamente
- Removido fluxo fixo de vendas
- Adicionado Groq AI
- Adicionado histórico de conversas
- Adicionado carregamento de memória

**server/src/routes/ai.ts** - Endpoint de recarga
- Auto-reload ao salvar memória

---

## 📈 Próximas Melhorias Possíveis

- [ ] Interface visual para ver histórico de conversas
- [ ] Análise de sentimento do lead
- [ ] Tags automáticas (quente, frio, morno)
- [ ] Dashboard de performance da IA
- [ ] Múltiplas personalidades (vendas, suporte, etc)
- [ ] Integração com CRM externo
- [ ] A/B testing de prompts

---

## ⚙️ Variáveis de Ambiente

```env
# Groq AI
GROQ_API_URL=https://api.groq.com/openai/v1/chat/completions
GROQ_API_KEY=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
GROQ_MODEL=llama-3.1-8b-instant

# Evolution API
EVOLUTION_API_URL=https://evo.inovapro.cloud
EVOLUTION_API_KEY=BQYHJGJHJ
EVOLUTION_INSTANCE_NAME=isa_maiconsillva2025_gmail_com
```

---

## 🎉 Resumo

**Antes:** ISA tinha fluxo fixo de vendas com mensagens pré-definidas

**Agora:** ISA é uma IA flexível que:
- ✅ Lê instruções da Memória de IA
- ✅ Usa Groq para gerar respostas contextuais
- ✅ Mantém histórico de conversas
- ✅ Adapta-se a qualquer função (vendas, suporte, geral)
- ✅ Atualização em tempo real (sem restart)

**Configure a memória e deixe a IA trabalhar!** 🚀

---

**Desenvolvido com 💜 por InovaPro Technology**

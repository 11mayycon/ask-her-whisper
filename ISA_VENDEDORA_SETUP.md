# ISA 2.5 - Vendedora Automatizada via WhatsApp

## ✅ Configuração Completa

A ISA foi transformada em uma vendedora automatizada que responde leads pelo WhatsApp, coleta dados, envia teste gratuito do PDV InovaPro e conduz o cliente até a conversão final via Stripe.

---

## 🎯 Funcionalidades Implementadas

### 1. **Fluxo de Conversa Inteligente**

A ISA agora opera em 5 estágios:

#### **Estágio 1: Inicial (initial)**
- Saudação empática e natural
- Pergunta sobre o tipo de negócio (loja, mercado, posto)
- Exemplo: *"Oi! 😊 Tudo bem? Me conta rapidinho, você trabalha em loja, mercado ou posto?"*

#### **Estágio 2: Coleta de Dados (collecting_data)**
- Entende o sistema atual do cliente
- Identifica dores (manual, planilha, nenhum sistema)
- Exemplo: *"E como vocês controlam o estoque e as vendas por aí?"*

#### **Estágio 3: Demo Enviado (demo_sent)**
- Envia acesso de teste automaticamente
- **Link:** https://pdv.inovapro.cloud/
- **Email:** teste@inovapro.cloud
- **Senha:** 1285042
- Follow-up automático após 10 minutos

#### **Estágio 4: Fechamento (closing)**
- Pitch de venda com proposta promocional
- **Valor:** R$ 149,60 no primeiro mês (desconto de R$ 300)
- Coleta email para gerar link de pagamento
- Gera checkout do Stripe automaticamente

#### **Estágio 5: Completo (completed)**
- Venda finalizada
- Mensagem de agradecimento

---

## 💳 Integração Stripe

### Configuração Atual:
```
STRIPE_SECRET_KEY=sk_live_51R0yHMLWyC4uRc8x...
STRIPE_PUBLIC_KEY=pk_live_51R0yHMLWyC4uRc8x...
STRIPE_PRODUCT_ID=prod_SxI5PRn7tvaBf7
STRIPE_PROMO_PRICE=14960 (R$ 149,60 em centavos)
```

### Fluxo de Pagamento:
1. Cliente aceita a oferta
2. ISA coleta o email
3. Sistema gera link de checkout automaticamente
4. Após pagamento confirmado:
   - Usuário é criado no banco de dados
   - WhatsApp envia dados de acesso automaticamente
   - Credenciais: email do cliente + senha padrão (1285041)

### Webhook Stripe:
- **URL:** https://isa.inovapro.cloud/api/webhooks/stripe
- **Eventos:** checkout.session.completed, subscription.*

---

## 📱 Evolution API

### Instância Configurada:
- **Nome:** isa_maiconsillva2025_gmail_com
- **Status:** Aguardando reconexão (QR Code disponível)
- **Webhook:** https://isa.inovapro.cloud/api/webhooks/evolution
- **Eventos:** MESSAGES_UPSERT

### ⚠️ ATENÇÃO: Reconectar Instância
A instância está desconectada. Para ativar:

```bash
curl -X GET "https://evo.inovapro.cloud/instance/connect/isa_maiconsillva2025_gmail_com" \
  -H "apikey: BQYHJGJHJ"
```

Este comando retorna o QR Code. Escaneie com o WhatsApp para conectar.

---

## 🗄️ Banco de Dados

### Nova Tabela: sales_leads
```sql
CREATE TABLE sales_leads (
  phone TEXT PRIMARY KEY,
  name TEXT,
  business_type TEXT,
  current_system TEXT,
  stage TEXT NOT NULL DEFAULT 'initial',
  last_message_at TEXT NOT NULL,
  test_sent_at TEXT,
  email TEXT,
  created_at TEXT DEFAULT (datetime('now')),
  updated_at TEXT DEFAULT (datetime('now'))
);
```

### Armazenamento de Leads:
- Todos os leads são salvos automaticamente
- Histórico mantido por 7 dias
- Estados de conversa persistidos
- Follow-ups agendados automaticamente

---

## 🤖 Comportamento da ISA

### Tom de Voz:
- ✅ Natural, empática e dinâmica
- ✅ Mensagens curtas (máx. 3 frases)
- ✅ Sem termos técnicos
- ✅ Usa emojis discretos (😊, 💰, 🔗, 📧, 🔑)
- ❌ Nunca robotizada ou formal demais

### Detecção Automática:
- Tipo de negócio (loja, mercado, posto)
- Sistema atual (manual, planilha, nenhum)
- Email do cliente (regex)
- Intenção de compra (palavras-chave)

### Follow-up Automático:
- 10 minutos após enviar demo
- Mensagem de fechamento automática
- Não envia se cliente já respondeu

---

## 📊 Exemplo de Conversa Completa

```
Cliente: oi
ISA: Oi! 😊 Tudo bem? Me conta rapidinho, você trabalha em loja, mercado ou posto?

Cliente: mercado
ISA: Ah, show! E como vocês controlam o estoque e as vendas hoje em dia?

Cliente: manual
ISA: Entendo! Muita gente perde tempo e acaba errando nas contas 😅

Quer testar o sistema da InovaPro? É só abrir o link e usar esse acesso:

🔗 https://pdv.inovapro.cloud/
📧 Email: teste@inovapro.cloud
🔑 Senha: 1285042

Dá uma olhada e me fala o que achou! 😊

[10 minutos depois, se não responder]

ISA: E aí, gostou do sistema? 😊

Hoje tá com promoção especial:
💰 De R$ 300 por apenas R$ 149,60 no primeiro mês!

Posso te mandar o link de pagamento?

Cliente: quanto custa? meu email é cliente@example.com
ISA: 💳 Link de Pagamento Gerado!

[link do Stripe]

✅ Promoção especial: R$ 149,60 no primeiro mês!
(Valor normal: R$ 300)

🚀 Após o pagamento, você recebe acesso completo + suporte!

Qualquer dúvida, estou aqui! 😊
```

---

## 🚀 Status dos Serviços

### Containers Ativos:
```bash
docker ps | grep isa
# isa_backend  - Porta 3002
# isa_frontend - Traefik
```

### URLs:
- **Frontend:** https://isa.inovapro.cloud/
- **API:** https://isa.inovapro.cloud/api
- **Webhook Evolution:** https://isa.inovapro.cloud/api/webhooks/evolution
- **Webhook Stripe:** https://isa.inovapro.cloud/api/webhooks/stripe

### Logs:
```bash
docker logs isa_backend --tail 50
docker logs isa_backend -f  # seguir logs em tempo real
```

---

## 🔧 Manutenção

### Reiniciar Sistema:
```bash
cd /root/isa2.5
docker compose restart isa_backend
```

### Rebuild Completo:
```bash
cd /root/isa2.5
docker compose down
docker compose build --no-cache isa_backend
docker compose up -d
```

### Verificar Leads:
```bash
docker exec -it isa_backend sh
cd /app/data
sqlite3 isa.db
SELECT * FROM sales_leads ORDER BY created_at DESC LIMIT 10;
.exit
```

---

## 📝 Próximos Passos

1. **Reconectar WhatsApp:**
   - Executar comando de conexão
   - Escanear QR Code com WhatsApp da ISA

2. **Testar Fluxo Completo:**
   - Enviar mensagem teste para a ISA
   - Verificar todas as etapas do funil
   - Testar geração do link de pagamento

3. **Configurar Webhook do Stripe:**
   - Acessar Dashboard Stripe
   - Adicionar webhook endpoint: https://isa.inovapro.cloud/api/webhooks/stripe
   - Selecionar eventos: checkout.session.completed

4. **Monitorar Conversões:**
   - Verificar logs do backend
   - Acompanhar tabela sales_leads
   - Verificar pagamentos na Stripe

---

## ✨ Melhorias Futuras (Opcional)

- [ ] Dashboard de métricas de conversão
- [ ] A/B testing de mensagens
- [ ] Integração com CRM
- [ ] Notificações de novos leads via Telegram
- [ ] Relatórios automáticos de vendas

---

## 🎉 Resultado

A ISA está pronta para vender automaticamente o PDV InovaPro via WhatsApp!

**Conversões esperadas:**
- Lead chega → Qualifica → Demo → Fechamento → Pagamento
- Processo 100% automatizado
- Follow-ups inteligentes
- Pagamentos via Stripe
- Acesso liberado automaticamente

🚀 **Boas vendas!**

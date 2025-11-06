# 💳 Integração Stripe + ISA 2.5 + Evolution API

## 🎯 Objetivo
Este documento descreve a integração completa entre Stripe, ISA 2.5 e Evolution API para automação de pagamentos e ativação de contas.

## 🔧 Funcionalidades Implementadas

### 1. Endpoint de Checkout
**URL:** `POST https://isa.inovapro.cloud/api/payments/create-checkout`

**Corpo da requisição:**
```json
{
  "email": "cliente@example.com",
  "phone": "5511999999999"
}
```

**Resposta:**
```json
{
  "url": "https://checkout.stripe.com/c/pay/cs_xxx",
  "sessionId": "cs_xxx"
}
```

### 2. Webhook da Stripe
**URL:** `POST https://isa.inovapro.cloud/api/webhooks/stripe`

Este endpoint recebe eventos da Stripe quando:
- Pagamento é confirmado (`checkout.session.completed`)
- Assinatura é criada (`customer.subscription.created`)
- Assinatura é atualizada (`customer.subscription.updated`)
- Assinatura é cancelada (`customer.subscription.deleted`)

### 3. Processo Automático

Quando um pagamento é confirmado:
1. ✅ Stripe detecta o pagamento
2. ✅ Webhook recebe o evento `checkout.session.completed`
3. ✅ Sistema cria usuário no banco SQLite
4. ✅ Sistema envia mensagem de boas-vindas via WhatsApp
5. ✅ Cliente recebe login e senha para acessar o painel
6. ✅ Pagamento é registrado no banco de dados

## 🔐 Variáveis de Ambiente

As seguintes variáveis foram adicionadas ao arquivo `/root/isa2.5/server/.env`:

```env
# Stripe Configuration
STRIPE_SECRET_KEY=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
STRIPE_WEBHOOK_SECRET=whsec_7uigxIXOlW8KDLfajKZoL2SHNZBwHLVi
STRIPE_PUBLIC_KEY=pk_live_51R0yHMLWyC4uRc8xdcUM9872PlYkPfC1LZkz2EBpR6StHFdkH0Qf2GLBruVEMNFJixOfRaUySr1EfFqH6eJ5eiBQ00VVYRWqMz
STRIPE_PRODUCT_ID=prod_SxI5PRn7tvaBf7

# Evolution API
EVOLUTION_API_TOKEN=D200B057-C7A4-4445-B614-53C8B44E525F

# Frontend URL
FRONTEND_URL=https://isa.inovapro.cloud
```

## 📊 Estrutura do Banco de Dados

### Tabela `payments`
```sql
CREATE TABLE payments (
  id TEXT PRIMARY KEY,
  user_email TEXT NOT NULL,
  stripe_session_id TEXT UNIQUE NOT NULL,
  stripe_customer_id TEXT,
  stripe_subscription_id TEXT,
  amount INTEGER NOT NULL,
  currency TEXT DEFAULT 'brl',
  status TEXT DEFAULT 'pending',
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
)
```

### Tabela `users` (atualizada)
Campo `phone` foi adicionado para armazenar o telefone do cliente.

## 🚀 Como Configurar no Stripe

### 1. Configurar Webhook no Dashboard da Stripe

1. Acesse: https://dashboard.stripe.com/webhooks
2. Clique em "Add endpoint"
3. URL do webhook: `https://isa.inovapro.cloud/api/webhooks/stripe`
4. Selecione os seguintes eventos:
   - `checkout.session.completed`
   - `customer.subscription.created`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`
5. Copie o **Signing Secret** e atualize `STRIPE_WEBHOOK_SECRET` no `.env`

### 2. Produto e Preço

O produto já está configurado:
- **ID do Produto:** `prod_T6FQ6T3HfUh2w7`
- **Valor:** R$ 19,90/mês
- **Moeda:** BRL (Real Brasileiro)

## 🧠 Configuração da IA

Para que a IA da ISA saiba gerar links de checkout automaticamente, adicione as seguintes instruções à memória da IA:

```
Quando um cliente mencionar palavras como "assinar", "plano", "pagamento", "quero pagar", "ativar acesso" ou similar, você deve:

1. Perguntar o e-mail e telefone do cliente (formato internacional com DDI, ex: 5511999999999)
2. Gerar um link de checkout usando a API: POST https://isa.inovapro.cloud/api/payments/create-checkout
3. Enviar o link de pagamento ao cliente
4. Informar que após o pagamento, o acesso será liberado automaticamente

Exemplo de resposta:
"Para ativar sua assinatura da ISA 2.5, preciso de alguns dados:
📧 Qual seu e-mail?
📱 Qual seu WhatsApp (com DDD)?"

Após receber os dados:
"✅ Perfeito! Estou gerando seu link de pagamento...
💳 Acesse: [LINK DO CHECKOUT]

O valor é de R$ 19,90/mês e após a confirmação do pagamento, você receberá seus dados de acesso automaticamente!"
```

## 📱 Mensagem de Boas-vindas

Quando o pagamento é confirmado, o cliente recebe automaticamente via WhatsApp:

```
🎉 *Pagamento Confirmado!*

Bem-vindo(a) à *ISA 2.5* 👋

Seu acesso foi liberado com sucesso!

📱 *Dados de Acesso:*
• Painel: https://isa.inovapro.cloud/login
• Usuário: email@cliente.com
• Senha padrão: 1285041

⚠️ *Importante:* Altere sua senha no primeiro acesso!

💜 Desenvolvido por InovaPro Technology
```

## 🧪 Como Testar

### 1. Testar criação de checkout:
```bash
curl -X POST https://isa.inovapro.cloud/api/payments/create-checkout \
  -H "Content-Type: application/json" \
  -d '{
    "email": "teste@example.com",
    "phone": "5511999999999"
  }'
```

### 2. Testar Webhook (usar Stripe CLI):
```bash
stripe listen --forward-to https://isa.inovapro.cloud/api/webhooks/stripe
stripe trigger checkout.session.completed
```

### 3. Verificar logs do servidor:
```bash
docker logs isa_backend -f
```

## 📂 Arquivos Modificados/Criados

1. ✅ `/root/isa2.5/server/src/routes/payments.ts` - Novo arquivo
2. ✅ `/root/isa2.5/server/src/routes/webhooks.ts` - Atualizado
3. ✅ `/root/isa2.5/server/src/config/sqlite.ts` - Atualizado
4. ✅ `/root/isa2.5/server/src/index.ts` - Atualizado
5. ✅ `/root/isa2.5/server/.env` - Atualizado
6. ✅ `/root/isa2.5/server/package.json` - Stripe adicionado

## 🔒 Segurança

- ✅ Webhook validado com assinatura Stripe
- ✅ Tokens de API armazenados em variáveis de ambiente
- ✅ Senhas geradas automaticamente
- ✅ HTTPS obrigatório para webhooks

## 💡 Próximos Passos

1. Implementar página de sucesso no frontend (`/success`)
2. Implementar página de cancelamento (`/cancel`)
3. Adicionar dashboard de assinaturas no painel admin
4. Implementar renovação automática de assinaturas
5. Adicionar notificações de pagamento falho
6. Implementar relatório de pagamentos

## 📞 Suporte

Em caso de dúvidas ou problemas:
- Email: maiconsillva2025@gmail.com
- WhatsApp: (seu número)

---

💜 **Desenvolvido por InovaPro Technology — ISA 2.5 Automatização Total**

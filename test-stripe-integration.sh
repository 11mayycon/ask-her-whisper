#!/bin/bash

# Script de teste da integração Stripe + ISA 2.5
# Desenvolvido por InovaPro Technology

echo "🧪 Testando Integração Stripe + ISA 2.5"
echo "========================================="
echo ""

# Cores para output
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Configurações
BASE_URL="https://isa.inovapro.cloud"
TEST_EMAIL="teste@inovapro.cloud"
TEST_PHONE="5511999999999"

echo "📋 Configurações:"
echo "  Base URL: $BASE_URL"
echo "  Email de teste: $TEST_EMAIL"
echo "  Telefone de teste: $TEST_PHONE"
echo ""

# Teste 1: Health check
echo "1️⃣ Testando Health Check..."
HEALTH_RESPONSE=$(curl -s -o /dev/null -w "%{http_code}" "$BASE_URL/health")

if [ "$HEALTH_RESPONSE" -eq 200 ]; then
    echo -e "${GREEN}✅ Health Check OK${NC}"
else
    echo -e "${RED}❌ Health Check falhou (HTTP $HEALTH_RESPONSE)${NC}"
fi
echo ""

# Teste 2: Criar checkout
echo "2️⃣ Testando criação de checkout Stripe..."
CHECKOUT_RESPONSE=$(curl -s -X POST "$BASE_URL/api/payments/create-checkout" \
  -H "Content-Type: application/json" \
  -d "{\"email\":\"$TEST_EMAIL\",\"phone\":\"$TEST_PHONE\"}")

# Verificar se a resposta contém URL
if echo "$CHECKOUT_RESPONSE" | grep -q "url"; then
    echo -e "${GREEN}✅ Checkout criado com sucesso!${NC}"
    echo "Resposta:"
    echo "$CHECKOUT_RESPONSE" | python3 -m json.tool 2>/dev/null || echo "$CHECKOUT_RESPONSE"

    # Extrair URL do checkout
    CHECKOUT_URL=$(echo "$CHECKOUT_RESPONSE" | grep -o '"url":"[^"]*"' | cut -d'"' -f4)
    if [ ! -z "$CHECKOUT_URL" ]; then
        echo ""
        echo -e "${YELLOW}💳 URL do checkout:${NC}"
        echo "$CHECKOUT_URL"
    fi
else
    echo -e "${RED}❌ Erro ao criar checkout${NC}"
    echo "Resposta:"
    echo "$CHECKOUT_RESPONSE"
fi
echo ""

# Teste 3: Verificar webhook endpoint
echo "3️⃣ Testando endpoint do webhook Stripe..."
WEBHOOK_RESPONSE=$(curl -s -o /dev/null -w "%{http_code}" -X POST "$BASE_URL/api/webhooks/stripe" \
  -H "Content-Type: application/json" \
  -d '{}')

if [ "$WEBHOOK_RESPONSE" -eq 400 ]; then
    echo -e "${GREEN}✅ Webhook endpoint está ativo (esperado erro 400 sem assinatura)${NC}"
else
    echo -e "${YELLOW}⚠️  Webhook retornou HTTP $WEBHOOK_RESPONSE${NC}"
fi
echo ""

# Teste 4: Verificar logs do servidor
echo "4️⃣ Últimas 10 linhas do log do servidor:"
echo "========================================="
docker logs isa_backend --tail 10
echo ""

echo "========================================="
echo -e "${GREEN}✅ Testes concluídos!${NC}"
echo ""
echo "📚 Próximos passos:"
echo "  1. Configure o webhook no Stripe Dashboard: https://dashboard.stripe.com/webhooks"
echo "  2. URL do webhook: $BASE_URL/api/webhooks/stripe"
echo "  3. Eventos necessários:"
echo "     - checkout.session.completed"
echo "     - customer.subscription.created"
echo "     - customer.subscription.updated"
echo "     - customer.subscription.deleted"
echo ""
echo "💜 InovaPro Technology — ISA 2.5"

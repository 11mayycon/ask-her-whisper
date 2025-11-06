# ISA com OpenRouter AI - Setup Completo

## Mudanças Implementadas

### 1. Integração OpenRouter

A ISA agora usa OpenRouter com GPT-3.5 Turbo em vez de Groq/Gemini.

**Arquivos Modificados:**

- `server/src/services/sales-bot.ts` - Sistema de IA atualizado
- `server/src/routes/webhooks.ts` - Correção na detecção de mensagens
- `server/.env` - Novas credenciais

### 2. Configuração

**Variáveis de Ambiente (.env):**

```bash
# OPENROUTER AI (GPT-3.5 Turbo)
OPENROUTER_API_URL=https://openrouter.ai/api/v1/chat/completions
OPENROUTER_API_KEY=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
OPENROUTER_MODEL=openai/gpt-3.5-turbo
```

### 3. Modelos Disponíveis na OpenRouter

#### Grátis (com rate limits):
- `meta-llama/llama-3.2-3b-instruct:free` - Pode ter rate limit
- `google/gemma-2-9b-it:free` - Pode não estar disponível

#### Pagos (sem rate limit):
- `openai/gpt-3.5-turbo` ✅ **CONFIGURADO** - Rápido e barato ($0.50/1M tokens)
- `openai/gpt-4` - Melhor qualidade, mais caro
- `deepseek/deepseek-r1-distill-qwen-32b` - Alternativa barata

### 4. Como Usar

#### Testar a Integração:

```bash
# Via script de teste
/root/isa2.5/test-openrouter.sh

# Via WhatsApp
# Envie qualquer mensagem para o número conectado no WhatsApp
```

#### Trocar de Modelo:

1. Edite o arquivo `.env`:
```bash
nano /root/isa2.5/server/.env
```

2. Altere a linha:
```bash
OPENROUTER_MODEL=openai/gpt-3.5-turbo
```

3. Reinicie o backend:
```bash
docker compose stop isa_backend
docker compose up -d isa_backend
```

### 5. Custos Estimados

**GPT-3.5 Turbo:**
- Input: $0.50 / 1M tokens
- Output: $1.50 / 1M tokens
- Média por conversa (50 mensagens): ~$0.01 - $0.05

**Alternativas Mais Baratas:**
- DeepSeek R1: ~$0.15/1M tokens total
- Meta Llama 3: ~$0.20/1M tokens total

### 6. Monitoramento

#### Verificar logs:
```bash
docker logs isa_backend --tail 50 -f
```

#### Procurar por erros:
```bash
docker logs isa_backend 2>&1 | grep "❌ Erro"
```

#### Ver respostas da IA:
```bash
docker logs isa_backend 2>&1 | grep "🤖 Resposta da IA"
```

### 7. Troubleshooting

**Problema:** API Key inválida
```bash
❌ Erro ao chamar OpenRouter AI: { error: { message: 'No cookie auth credentials found', code: 401 } }
```
**Solução:** Verifique se a chave está correta no `.env` e reinicie o container com `stop` + `up -d`

**Problema:** Modelo não encontrado
```bash
❌ Erro ao chamar OpenRouter AI: { error: { message: 'No endpoints found for...', code: 404 } }
```
**Solução:** Troque para um modelo válido no `.env`

**Problema:** Rate limit
```bash
❌ Erro ao chamar OpenRouter AI: { error: { message: 'Provider returned error', code: 429 } }
```
**Solução:** Use um modelo pago ou aguarde o reset do rate limit

### 8. Próximos Passos

- [ ] Adicionar créditos na OpenRouter (https://openrouter.ai/settings/credits)
- [ ] Testar com conversas reais
- [ ] Ajustar prompts na interface de Memória da IA
- [ ] Monitorar custos e performance

## Links Úteis

- OpenRouter Dashboard: https://openrouter.ai/
- Documentação: https://openrouter.ai/docs
- Modelos Disponíveis: https://openrouter.ai/models
- Gerenciar Créditos: https://openrouter.ai/settings/credits

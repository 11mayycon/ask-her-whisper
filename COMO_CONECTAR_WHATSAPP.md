# 📱 Como Conectar o WhatsApp da ISA

## ⚠️ Status Atual

A instância Evolution API está **desconectada**. Antes de usar a ISA, você precisa conectar o WhatsApp.

---

## 🔧 Métodos de Conexão

### Opção 1: Via API (Recomendado)

#### 1. Obter QR Code
```bash
curl -X GET "https://evo.inovapro.cloud/instance/connect/isa_maiconsillva2025_gmail_com" \
  -H "apikey: BQYHJGJHJ"
```

#### 2. Escanear QR Code
A resposta vai conter um QR Code em base64. Use um dos métodos abaixo:

**Via terminal:**
```bash
# Extrair e exibir QR Code
curl -X GET "https://evo.inovapro.cloud/instance/connect/isa_maiconsillva2025_gmail_com" \
  -H "apikey: BQYHJGJHJ" | jq -r '.qrcode.base64' | qrencode -t ANSI
```

**Via navegador:**
Abra no navegador:
```
https://evo.inovapro.cloud/instance/connect/isa_maiconsillva2025_gmail_com
```

#### 3. No WhatsApp
1. Abra o **WhatsApp** no celular
2. Toque em **⋮** (mais opções) → **Aparelhos conectados**
3. Toque em **Conectar um aparelho**
4. Escaneie o QR Code exibido

---

### Opção 2: Via Painel Web

Se você tem acesso ao painel da Evolution API:

1. Acesse: `https://evo.inovapro.cloud`
2. Faça login com suas credenciais
3. Encontre a instância: `isa_maiconsillva2025_gmail_com`
4. Clique em "Conectar"
5. Escaneie o QR Code

---

### Opção 3: Via Interface do Sistema

Se você implementou uma interface web para a ISA:

1. Acesse: `https://isa.inovapro.cloud/admin/whatsapp-connection`
2. Clique em "Conectar WhatsApp"
3. Escaneie o QR Code exibido

---

## ✅ Verificar Conexão

Após escanear o QR Code, verifique se está conectado:

```bash
curl -X GET "https://evo.inovapro.cloud/instance/connectionState/isa_maiconsillva2025_gmail_com" \
  -H "apikey: BQYHJGJHJ"
```

**Resposta esperada:**
```json
{
  "instance": {
    "instanceName": "isa_maiconsillva2025_gmail_com",
    "state": "open"
  }
}
```

---

## 🧪 Testar Sistema

Após conectar, teste enviando uma mensagem para o número do WhatsApp conectado:

```
Você: oi
ISA: Oi! Tudo bem? 😊
Me conta rapidinho, você trabalha em loja, mercado ou posto?
```

---

## 🔄 Reconectar Automaticamente

O sistema já está configurado para manter a conexão ativa. Se desconectar:

1. O webhook continuará funcionando
2. A ISA tentará enviar mensagens
3. Se falhar, você receberá logs de erro
4. Basta reconectar seguindo os passos acima

---

## 🛠️ Troubleshooting

### Erro: "Connection Closed"
**Causa:** Instância desconectada
**Solução:** Escaneie o QR Code novamente

### Erro: "Instance not found"
**Causa:** Instância não existe
**Solução:** Criar nova instância:
```bash
curl -X POST "https://evo.inovapro.cloud/instance/create" \
  -H "apikey: BQYHJGJHJ" \
  -H "Content-Type: application/json" \
  -d '{
    "instanceName": "isa_maiconsillva2025_gmail_com",
    "qrcode": true,
    "integration": "WHATSAPP-BAILEYS"
  }'
```

### Erro: "Webhook not receiving messages"
**Causa:** Webhook não configurado
**Solução:** Reconfigurar webhook:
```bash
curl -X POST "https://evo.inovapro.cloud/webhook/set/isa_maiconsillva2025_gmail_com" \
  -H "apikey: BQYHJGJHJ" \
  -H "Content-Type: application/json" \
  -d '{
    "webhook": {
      "url": "https://isa.inovapro.cloud/api/webhooks/evolution",
      "enabled": true,
      "webhook_by_events": false,
      "webhook_base64": false,
      "events": ["MESSAGES_UPSERT"]
    }
  }'
```

---

## 📊 Monitoramento

### Verificar logs do backend:
```bash
docker logs isa_backend --tail 50 --follow
```

### Verificar webhook Evolution API:
```bash
curl -X GET "https://evo.inovapro.cloud/webhook/find/isa_maiconsillva2025_gmail_com" \
  -H "apikey: BQYHJGJHJ"
```

---

## 🎯 Próximos Passos

1. **Conectar WhatsApp** - Escaneie o QR Code
2. **Testar conversa** - Envie "oi" para o número
3. **Verificar logs** - Acompanhe as respostas da ISA
4. **Monitorar conversões** - Veja leads no banco de dados

---

**Status do Sistema:**
- ✅ Código implementado
- ✅ Webhook configurado
- ✅ Stripe integrado
- ⏳ **Aguardando conexão WhatsApp**

**Desenvolvido com 💜 por InovaPro Technology**

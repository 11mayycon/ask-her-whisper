#!/bin/bash

echo "🧪 Testando ISA com OpenRouter..."
echo ""

# Simular webhook do Evolution API
curl -X POST http://localhost:3002/api/webhooks/evolution \
  -H "Content-Type: application/json" \
  -d '{
    "event": "messages.upsert",
    "instance": "isa_maiconsillva2025_gmail_com",
    "data": {
      "key": {
        "remoteJid": "5511999887766@s.whatsapp.net",
        "fromMe": false,
        "id": "TEST_MSG_'$(date +%s)'"
      },
      "message": {
        "conversation": "Ola, quero saber mais sobre o PDV"
      },
      "messageTimestamp": '$(date +%s)',
      "pushName": "Teste Cliente"
    }
  }'

echo ""
echo ""
echo "✅ Mensagem de teste enviada!"
echo "📱 Verifique os logs do backend:"
echo "   docker logs isa_backend --tail 20"

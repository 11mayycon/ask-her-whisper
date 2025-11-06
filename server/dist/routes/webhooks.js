"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const axios_1 = __importDefault(require("axios"));
const sqlite_1 = require("../config/sqlite");
const stripe_1 = __importDefault(require("stripe"));
const sales_bot_1 = require("../services/sales-bot");
const websocket_events_1 = require("../services/websocket-events");
const router = (0, express_1.Router)();
// Inicializar Stripe apenas se a chave estiver disponível
let stripe = null;
if (process.env.STRIPE_SECRET_KEY) {
    stripe = new stripe_1.default(process.env.STRIPE_SECRET_KEY, {
        apiVersion: '2025-10-29.clover',
    });
}
// Webhook para receber mensagens do Evolution API
router.post('/evolution', async (req, res) => {
    try {
        console.log('📩 Webhook Evolution recebido:', JSON.stringify(req.body, null, 2));
        const { data } = req.body;
        // Verificar se é uma mensagem válida
        if (!data || !data.message) {
            return res.sendStatus(200);
        }
        const { message, key } = data;
        // Ignorar mensagens enviadas pela própria IA (fromMe = true)
        if (key.fromMe) {
            console.log('🤖 Ignorando mensagem enviada pela IA');
            return res.sendStatus(200);
        }
        // Verificar se é uma mensagem de texto
        const messageText = message.conversation || message.extendedTextMessage?.text || message.text || message.body;
        if (!messageText) {
            console.log('📎 Ignorando mensagem não textual');
            return res.sendStatus(200);
        }
        const fromNumber = key.remoteJid.replace('@s.whatsapp.net', '');
        console.log(`📱 Mensagem de ${fromNumber}: ${messageText}`);
        // Emitir evento de nova mensagem via WebSocket
        try {
            const wsService = (0, websocket_events_1.getWebSocketEventsService)();
            await wsService.emitNewMessage(process.env.EVOLUTION_INSTANCE_NAME || 'isa-whatsapp', data);
        }
        catch (wsError) {
            console.error('⚠️ Erro ao emitir evento WebSocket:', wsError);
        }
        // Usar o bot de vendas para processar a mensagem
        let aiReply;
        try {
            aiReply = await sales_bot_1.salesBot.processMessage(fromNumber, messageText);
            console.log('🤖 Resposta do Sales Bot:', aiReply);
        }
        catch (error) {
            console.error('❌ Erro no Sales Bot:', error.message);
            aiReply = 'Ops! Tive um probleminha aqui. Pode repetir sua mensagem? 😊';
        }
        // Enviar resposta via Evolution API
        const evolutionResponse = await axios_1.default.post(`${process.env.EVOLUTION_API_URL}/message/sendText/${process.env.EVOLUTION_INSTANCE_NAME}`, {
            number: fromNumber,
            text: aiReply
        }, {
            headers: {
                'apikey': process.env.EVOLUTION_API_KEY
            }
        });
        console.log('✅ Mensagem enviada via Evolution API');
        // Salvar a conversa no banco (opcional)
        try {
            const db = await (0, sqlite_1.getDatabase)();
            await db.run(`INSERT INTO messages (id, room_id, sender_id, sender_type, content, message_type, created_at)
         VALUES (?, ?, ?, ?, ?, ?, datetime('now'))`, [
                `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
                `room_${fromNumber}`,
                fromNumber,
                'client',
                messageText,
                'text'
            ]);
            await db.run(`INSERT INTO messages (id, room_id, sender_id, sender_type, content, message_type, created_at)
         VALUES (?, ?, ?, ?, ?, ?, datetime('now'))`, [
                `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
                `room_${fromNumber}`,
                'ai',
                'ai',
                aiReply,
                'text'
            ]);
        }
        catch (dbError) {
            console.error('Erro ao salvar mensagens no banco:', dbError);
        }
        res.sendStatus(200);
    }
    catch (error) {
        console.error('❌ Erro no webhook Evolution:', error);
        if (error.response) {
            console.error('Erro da API:', error.response.data);
        }
        res.sendStatus(500);
    }
});
// Webhook da Stripe para processar pagamentos
router.post('/stripe', async (req, res) => {
    const sig = req.headers['stripe-signature'];
    if (!sig) {
        console.error('❌ Assinatura Stripe ausente');
        return res.status(400).send('Webhook Error: No signature');
    }
    let event;
    try {
        // Verificar se Stripe está configurado
        if (!stripe) {
            return res.status(500).send('Stripe não configurado');
        }
        event = stripe.webhooks.constructEvent(req.body, sig, process.env.STRIPE_WEBHOOK_SECRET || '');
    }
    catch (err) {
        console.error('❌ Webhook Stripe inválido:', err.message);
        return res.status(400).send(`Webhook Error: ${err.message}`);
    }
    console.log('📩 Evento Stripe recebido:', event.type);
    // Processar evento de checkout completo
    if (event.type === 'checkout.session.completed') {
        const session = event.data.object;
        const { email, phone } = session.metadata || {};
        console.log('✅ Pagamento confirmado:', { email, phone, sessionId: session.id });
        if (!email || !phone) {
            console.error('❌ Metadados ausentes no checkout');
            return res.json({ received: true });
        }
        try {
            const db = await (0, sqlite_1.getDatabase)();
            // Gerar senha padrão
            const defaultPassword = '1285041';
            // Criar usuário no banco SQLite
            await db.run(`INSERT INTO users (id, email, phone, password, role, created_at)
         VALUES (?, ?, ?, ?, ?, datetime('now'))`, [
                `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
                email,
                phone,
                defaultPassword,
                'admin'
            ]);
            console.log('✅ Usuário criado:', email);
            // Enviar mensagem de boas-vindas via Evolution API
            try {
                const message = `🎉 *Pagamento Confirmado!*\n\nBem-vindo(a) à *ISA 2.5* 👋\n\nSeu acesso foi liberado com sucesso!\n\n📱 *Dados de Acesso:*\n• Painel: ${process.env.FRONTEND_URL}/login\n• Usuário: ${email}\n• Senha padrão: ${defaultPassword}\n\n⚠️ *Importante:* Altere sua senha no primeiro acesso!\n\n💜 Desenvolvido por InovaPro Technology`;
                const evolutionResponse = await axios_1.default.post(`${process.env.EVOLUTION_API_URL}/message/sendText/${process.env.EVOLUTION_INSTANCE_NAME}`, {
                    number: phone,
                    text: message
                }, {
                    headers: {
                        'apikey': process.env.EVOLUTION_API_KEY
                    }
                });
                console.log('📱 Mensagem de boas-vindas enviada para:', phone);
                // Salvar notificação no banco
                await db.run(`INSERT INTO messages (id, room_id, sender_id, sender_type, content, message_type, created_at)
           VALUES (?, ?, ?, ?, ?, ?, datetime('now'))`, [
                    `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
                    `room_${phone}`,
                    'system',
                    'ai',
                    message,
                    'text'
                ]);
            }
            catch (error) {
                console.error('❌ Erro ao enviar mensagem WhatsApp:', error.message);
                if (error.response) {
                    console.error('Detalhes do erro:', error.response.data);
                }
            }
            // Salvar informações do pagamento
            await db.run(`INSERT INTO payments (id, user_email, stripe_session_id, amount, status, created_at)
         VALUES (?, ?, ?, ?, ?, datetime('now'))`, [
                `pay_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
                email,
                session.id,
                1990,
                'completed'
            ]);
            console.log('💰 Pagamento registrado no banco');
        }
        catch (dbError) {
            console.error('❌ Erro ao processar pagamento:', dbError.message);
        }
    }
    // Processar evento de assinatura criada
    if (event.type === 'customer.subscription.created') {
        const subscription = event.data.object;
        console.log('📝 Nova assinatura criada:', subscription.id);
    }
    // Processar evento de assinatura atualizada
    if (event.type === 'customer.subscription.updated') {
        const subscription = event.data.object;
        console.log('🔄 Assinatura atualizada:', subscription.id, subscription.status);
    }
    // Processar evento de assinatura cancelada
    if (event.type === 'customer.subscription.deleted') {
        const subscription = event.data.object;
        console.log('❌ Assinatura cancelada:', subscription.id);
        // Aqui você pode desativar o usuário ou enviar notificação
    }
    res.json({ received: true });
});
// Webhook original do WhatsApp (manter compatibilidade)
router.post('/whatsapp', async (req, res) => {
    res.json({ success: true });
});
exports.default = router;

"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const sqlite_1 = require("../config/sqlite");
const websocket_events_1 = require("../services/websocket-events");
const router = (0, express_1.Router)();
// POST /api/wa/webhook - Receber eventos da Evolution API
router.post('/webhook', async (req, res) => {
    try {
        const event = req.body;
        const instanceHeader = req.headers['x-evolution-instance'];
        console.log('📥 Webhook Evolution recebido:', {
            event: event.event,
            instance: instanceHeader,
            data: JSON.stringify(event).substring(0, 200)
        });
        // Processar baseado no tipo de evento
        const eventType = event.event;
        switch (eventType) {
            case 'messages.upsert':
                await handleMessagesUpsert(event, instanceHeader);
                break;
            case 'messages.update':
                await handleMessagesUpdate(event, instanceHeader);
                break;
            case 'chats.upsert':
            case 'chats.update':
                await handleChatsUpsert(event, instanceHeader);
                break;
            case 'contacts.upsert':
                await handleContactsUpsert(event, instanceHeader);
                break;
            case 'connection.update':
                await handleConnectionUpdate(event, instanceHeader);
                break;
            default:
                console.log(`⚠️ Evento não tratado: ${eventType}`);
        }
        res.json({ success: true });
    }
    catch (error) {
        console.error('❌ Erro ao processar webhook:', error);
        res.status(500).json({ error: error.message });
    }
});
// ========== HANDLERS DE EVENTOS ==========
async function handleMessagesUpsert(event, instanceId) {
    const db = await (0, sqlite_1.getDatabase)();
    const messages = event.data?.messages || [];
    console.log(`📩 Processando ${messages.length} mensagens novas`);
    for (const msg of messages) {
        try {
            const chatId = msg.key?.remoteJid || '';
            const messageId = msg.key?.id || `msg_${Date.now()}`;
            const fromMe = msg.key?.fromMe || false;
            // Extrair texto da mensagem
            let body = '';
            if (msg.message) {
                body = msg.message.conversation ||
                    msg.message.extendedTextMessage?.text ||
                    msg.message.imageMessage?.caption ||
                    '[Mídia]';
            }
            // Buscar instance_id no banco (se não vier no header)
            let finalInstanceId = instanceId;
            if (!finalInstanceId) {
                // Tentar resolver pelo banco
                const instance = await db.get('SELECT instance_id FROM whatsapp_instances LIMIT 1');
                finalInstanceId = instance?.instance_id;
            }
            if (!finalInstanceId) {
                console.error('❌ Não foi possível resolver instance_id');
                continue;
            }
            // Salvar mensagem
            await db.run(`INSERT INTO whatsapp_messages (instance_id, chat_id, message_id, from_me, sender, sender_type, body, type, timestamp, status, raw_json)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
         ON CONFLICT(instance_id, message_id) DO NOTHING`, [
                finalInstanceId,
                chatId,
                messageId,
                fromMe ? 1 : 0,
                msg.pushName || '',
                fromMe ? 'support' : 'client',
                body,
                msg.type || 'text',
                new Date((msg.messageTimestamp || Date.now() / 1000) * 1000).toISOString(),
                'received',
                JSON.stringify(msg)
            ]);
            // Atualizar chat
            await db.run(`UPDATE whatsapp_chats
         SET lastMessageAt = ?,
             lastMessageText = ?,
             lastMessageFrom = ?,
             unreadCount = unreadCount + ?,
             updated_at = CURRENT_TIMESTAMP
         WHERE instance_id = ? AND chat_id = ?`, [
                new Date((msg.messageTimestamp || Date.now() / 1000) * 1000).toISOString(),
                body,
                msg.pushName || '',
                fromMe ? 0 : 1,
                finalInstanceId,
                chatId
            ]);
            // Emitir via WebSocket
            try {
                const wsService = (0, websocket_events_1.getWebSocketEventsService)();
                await wsService.emitNewMessage(finalInstanceId, {
                    chatId,
                    messageId,
                    from_me: fromMe,
                    sender: msg.pushName || '',
                    body,
                    timestamp: msg.messageTimestamp || Date.now() / 1000
                });
            }
            catch (wsError) {
                console.error('⚠️ Erro ao emitir WebSocket:', wsError);
            }
            console.log(`✅ Mensagem processada: ${messageId}`);
        }
        catch (msgError) {
            console.error('❌ Erro ao processar mensagem:', msgError);
        }
    }
}
async function handleMessagesUpdate(event, instanceId) {
    const db = await (0, sqlite_1.getDatabase)();
    const updates = event.data || [];
    console.log(`🔄 Atualizando ${updates.length} mensagens`);
    for (const update of updates) {
        try {
            const messageId = update.key?.id;
            const status = update.update?.status || 'received';
            if (!messageId)
                continue;
            // Buscar instance_id
            let finalInstanceId = instanceId;
            if (!finalInstanceId) {
                const instance = await db.get('SELECT instance_id FROM whatsapp_instances LIMIT 1');
                finalInstanceId = instance?.instance_id;
            }
            if (!finalInstanceId)
                continue;
            // Atualizar status
            await db.run(`UPDATE whatsapp_messages
         SET status = ?
         WHERE instance_id = ? AND message_id = ?`, [status, finalInstanceId, messageId]);
            console.log(`✅ Status atualizado: ${messageId} → ${status}`);
        }
        catch (updateError) {
            console.error('❌ Erro ao atualizar mensagem:', updateError);
        }
    }
}
async function handleChatsUpsert(event, instanceId) {
    const db = await (0, sqlite_1.getDatabase)();
    const chats = event.data || [];
    console.log(`💬 Processando ${chats.length} chats`);
    for (const chat of chats) {
        try {
            const chatId = chat.id || chat.jid;
            if (!chatId)
                continue;
            // Buscar instance_id
            let finalInstanceId = instanceId;
            if (!finalInstanceId) {
                const instance = await db.get('SELECT instance_id FROM whatsapp_instances LIMIT 1');
                finalInstanceId = instance?.instance_id;
            }
            if (!finalInstanceId)
                continue;
            // Salvar/atualizar chat
            await db.run(`INSERT INTO whatsapp_chats (instance_id, chat_id, name, unreadCount, isGroup, lastMessageAt)
         VALUES (?, ?, ?, ?, ?, ?)
         ON CONFLICT(instance_id, chat_id) DO UPDATE SET
           name = excluded.name,
           unreadCount = excluded.unreadCount,
           isGroup = excluded.isGroup,
           lastMessageAt = excluded.lastMessageAt,
           updated_at = CURRENT_TIMESTAMP`, [
                finalInstanceId,
                chatId,
                chat.name || chat.formattedTitle || '',
                chat.unreadCount || 0,
                chat.isGroup ? 1 : 0,
                chat.lastMessageAt ? new Date(chat.lastMessageAt * 1000).toISOString() : null
            ]);
            console.log(`✅ Chat processado: ${chatId}`);
        }
        catch (chatError) {
            console.error('❌ Erro ao processar chat:', chatError);
        }
    }
}
async function handleContactsUpsert(event, instanceId) {
    const db = await (0, sqlite_1.getDatabase)();
    const contacts = event.data || [];
    console.log(`👤 Processando ${contacts.length} contatos`);
    for (const contact of contacts) {
        try {
            const waId = contact.id || contact.number || contact.jid;
            if (!waId)
                continue;
            // Buscar instance_id
            let finalInstanceId = instanceId;
            if (!finalInstanceId) {
                const instance = await db.get('SELECT instance_id FROM whatsapp_instances LIMIT 1');
                finalInstanceId = instance?.instance_id;
            }
            if (!finalInstanceId)
                continue;
            // Salvar/atualizar contato
            await db.run(`INSERT INTO whatsapp_contacts (instance_id, wa_id, name, pushname, isBusiness, profilePicUrl)
         VALUES (?, ?, ?, ?, ?, ?)
         ON CONFLICT(instance_id, wa_id) DO UPDATE SET
           name = excluded.name,
           pushname = excluded.pushname,
           isBusiness = excluded.isBusiness,
           profilePicUrl = excluded.profilePicUrl,
           updated_at = CURRENT_TIMESTAMP`, [
                finalInstanceId,
                waId,
                contact.name || contact.pushname || '',
                contact.pushname || '',
                contact.isBusiness ? 1 : 0,
                contact.profilePicUrl || null
            ]);
            console.log(`✅ Contato processado: ${waId}`);
        }
        catch (contactError) {
            console.error('❌ Erro ao processar contato:', contactError);
        }
    }
}
async function handleConnectionUpdate(event, instanceId) {
    const db = await (0, sqlite_1.getDatabase)();
    const connection = event.data || {};
    console.log(`🔌 Atualização de conexão:`, connection);
    try {
        const state = connection.state || 'disconnected';
        let dbStatus = 'disconnected';
        if (state === 'open' || state === 'connected') {
            dbStatus = 'connected';
        }
        else if (state === 'connecting') {
            dbStatus = 'connecting';
        }
        // Buscar instance_id
        let finalInstanceId = instanceId;
        if (!finalInstanceId) {
            const instance = await db.get('SELECT instance_id FROM whatsapp_instances LIMIT 1');
            finalInstanceId = instance?.instance_id;
        }
        if (!finalInstanceId)
            return;
        // Atualizar status
        await db.run(`UPDATE whatsapp_instances
       SET status = ?, updated_at = CURRENT_TIMESTAMP
       WHERE instance_id = ?`, [dbStatus, finalInstanceId]);
        console.log(`✅ Status da instância atualizado: ${dbStatus}`);
    }
    catch (connError) {
        console.error('❌ Erro ao atualizar conexão:', connError);
    }
}
exports.default = router;

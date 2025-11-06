"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getWebSocketEventsService = exports.initializeWebSocketEvents = exports.WebSocketEventsService = void 0;
const sqlite_1 = require("../config/sqlite");
class WebSocketEventsService {
    constructor(io) {
        this.io = io;
    }
    // Emitir nova mensagem para clientes conectados
    async emitNewMessage(instanceName, message) {
        console.log(`📤 Emitindo nova mensagem para instância ${instanceName}`);
        try {
            const db = await (0, sqlite_1.getDatabase)();
            // Buscar detalhes do contato
            const phone = message.from?.replace('@s.whatsapp.net', '') || message.key?.remoteJid?.replace('@s.whatsapp.net', '');
            const messageData = {
                id: message.key?.id || message.id,
                chatId: message.from || message.key?.remoteJid,
                phone: phone,
                content: message.message?.conversation ||
                    message.message?.extendedTextMessage?.text ||
                    message.body ||
                    '[Mídia]',
                sender: message.key?.fromMe ? 'support' : 'client',
                timestamp: message.messageTimestamp ? message.messageTimestamp * 1000 : Date.now(),
                type: this.getMessageType(message),
                hasMedia: !!message.message?.imageMessage || !!message.message?.videoMessage || !!message.message?.documentMessage
            };
            // Emitir para a sala da instância
            this.io.to(`instance:${instanceName}`).emit('new:message', messageData);
            // Emitir atualização de conversa
            this.io.to(`instance:${instanceName}`).emit('conversation:updated', {
                chatId: messageData.chatId,
                lastMessage: messageData.content,
                lastMessageTime: messageData.timestamp
            });
            return messageData;
        }
        catch (error) {
            console.error('❌ Erro ao emitir nova mensagem:', error);
            throw error;
        }
    }
    // Emitir atualização de status de conversa
    emitConversationStatusUpdate(instanceName, chatId, status) {
        console.log(`📤 Emitindo atualização de status para ${chatId}: ${status}`);
        this.io.to(`instance:${instanceName}`).emit('conversation:status-changed', {
            chatId,
            status
        });
    }
    // Emitir quando suporte assume conversa
    emitConversationTaken(instanceName, chatId, supportName) {
        console.log(`📤 Emitindo que conversa ${chatId} foi assumida por ${supportName}`);
        this.io.to(`instance:${instanceName}`).emit('conversation:taken', {
            chatId,
            supportName
        });
    }
    // Emitir quando alguém está digitando
    emitTyping(instanceName, chatId, isTyping) {
        this.io.to(`instance:${instanceName}`).emit('chat:typing', {
            chatId,
            isTyping
        });
    }
    // Emitir atualização de presença (online/offline)
    emitPresenceUpdate(instanceName, chatId, presence) {
        this.io.to(`instance:${instanceName}`).emit('presence:update', {
            chatId,
            presence
        });
    }
    getMessageType(message) {
        if (message.message?.imageMessage)
            return 'image';
        if (message.message?.videoMessage)
            return 'video';
        if (message.message?.audioMessage)
            return 'audio';
        if (message.message?.documentMessage)
            return 'document';
        if (message.message?.stickerMessage)
            return 'sticker';
        return 'text';
    }
}
exports.WebSocketEventsService = WebSocketEventsService;
let wsEventsService = null;
const initializeWebSocketEvents = (io) => {
    wsEventsService = new WebSocketEventsService(io);
    return wsEventsService;
};
exports.initializeWebSocketEvents = initializeWebSocketEvents;
const getWebSocketEventsService = () => {
    if (!wsEventsService) {
        throw new Error('WebSocket Events Service não foi inicializado');
    }
    return wsEventsService;
};
exports.getWebSocketEventsService = getWebSocketEventsService;

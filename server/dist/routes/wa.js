"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const evolution_proxy_1 = require("../services/evolution-proxy");
const sqlite_1 = require("../config/sqlite");
const router = (0, express_1.Router)();
// Middleware de autenticação
const authenticate = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    if (!token) {
        return res.status(401).json({ error: 'Token não fornecido' });
    }
    try {
        const decoded = jsonwebtoken_1.default.verify(token, process.env.JWT_SECRET);
        req.user = decoded;
        next();
    }
    catch (error) {
        return res.status(401).json({ error: 'Token inválido' });
    }
};
// Helper para resolver admin_id do usuário logado
async function resolveAdminId(user) {
    const db = await (0, sqlite_1.getDatabase)();
    // Se for suporte, buscar admin_id vinculado
    if (user.role === 'support' || user.type === 'support') {
        const supportId = user.supportId || user.id;
        const support = await db.get('SELECT admin_id FROM supports WHERE id = ?', [supportId]);
        if (!support) {
            throw new Error('Suporte não encontrado');
        }
        return support.admin_id;
    }
    // Se for admin, retornar seu próprio ID
    return user.id || user.userId;
}
// GET /api/wa/instance - Resolver instância ativa do admin/suporte
router.get('/instance', authenticate, async (req, res) => {
    try {
        // Resolver admin_id
        const adminId = await resolveAdminId(req.user);
        // Buscar instância ativa
        const instance = await evolution_proxy_1.evolutionProxy.getAdminInstance(adminId);
        res.json({
            success: true,
            instance
        });
    }
    catch (error) {
        console.error('❌ Erro ao buscar instância:', error);
        res.status(500).json({
            error: error.message || 'Erro ao buscar instância'
        });
    }
});
// GET /api/wa/contacts - Listar contatos
router.get('/contacts', authenticate, async (req, res) => {
    try {
        const { cursor, limit = 100 } = req.query;
        // Resolver admin
        const adminId = await resolveAdminId(req.user);
        const instance = await evolution_proxy_1.evolutionProxy.getAdminInstance(adminId);
        // Buscar contatos
        const result = await evolution_proxy_1.evolutionProxy.fetchContacts(instance.instance_id, instance.api_base_url, instance.api_key, cursor);
        res.json({
            success: true,
            ...result
        });
    }
    catch (error) {
        console.error('❌ Erro ao buscar contatos:', error);
        res.status(500).json({
            error: error.message || 'Erro ao buscar contatos'
        });
    }
});
// GET /api/wa/chats - Listar conversas
router.get('/chats', authenticate, async (req, res) => {
    try {
        const { cursor, limit = 50 } = req.query;
        // Resolver admin
        const adminId = await resolveAdminId(req.user);
        const instance = await evolution_proxy_1.evolutionProxy.getAdminInstance(adminId);
        // Buscar chats
        const result = await evolution_proxy_1.evolutionProxy.fetchChats(instance.instance_id, instance.api_base_url, instance.api_key, parseInt(limit), cursor);
        res.json({
            success: true,
            ...result
        });
    }
    catch (error) {
        console.error('❌ Erro ao buscar chats:', error);
        res.status(500).json({
            error: error.message || 'Erro ao buscar chats'
        });
    }
});
// GET /api/wa/chats/:chatId/messages - Buscar mensagens de um chat
router.get('/chats/:chatId/messages', authenticate, async (req, res) => {
    try {
        const { chatId } = req.params;
        const { cursor, limit = 50, direction = 'before' } = req.query;
        // Resolver admin
        const adminId = await resolveAdminId(req.user);
        const instance = await evolution_proxy_1.evolutionProxy.getAdminInstance(adminId);
        // Buscar mensagens
        const result = await evolution_proxy_1.evolutionProxy.fetchMessages(instance.instance_id, chatId, instance.api_base_url, instance.api_key, parseInt(limit), cursor);
        res.json({
            success: true,
            ...result
        });
    }
    catch (error) {
        console.error('❌ Erro ao buscar mensagens:', error);
        res.status(500).json({
            error: error.message || 'Erro ao buscar mensagens'
        });
    }
});
// POST /api/wa/messages/send - Enviar mensagem
router.post('/messages/send', authenticate, async (req, res) => {
    try {
        const { chatId, text } = req.body;
        if (!chatId || !text) {
            return res.status(400).json({
                error: 'chatId e text são obrigatórios'
            });
        }
        const db = await (0, sqlite_1.getDatabase)();
        // Resolver admin e nome do suporte
        const adminId = await resolveAdminId(req.user);
        let supportName = req.user.full_name || req.user.email || 'Suporte';
        if (req.user.role === 'support' || req.user.type === 'support') {
            const supportId = req.user.supportId || req.user.id;
            const support = await db.get('SELECT nome FROM supports WHERE id = ?', [supportId]);
            if (support) {
                supportName = support.nome;
            }
        }
        const instance = await evolution_proxy_1.evolutionProxy.getAdminInstance(adminId);
        // Enviar mensagem
        const result = await evolution_proxy_1.evolutionProxy.sendMessage(instance.instance_id, chatId, text, supportName, instance.api_base_url, instance.api_key);
        // Salvar mensagem enviada no banco
        try {
            const messageId = result.key?.id || `msg_${Date.now()}`;
            await db.run(`INSERT INTO whatsapp_messages (instance_id, chat_id, message_id, from_me, sender, sender_type, body, type, timestamp, status)
         VALUES (?, ?, ?, 1, ?, 'support', ?, 'text', datetime('now'), 'sent')`, [instance.instance_id, chatId, messageId, supportName, text]);
        }
        catch (dbError) {
            console.error('⚠️ Erro ao salvar mensagem no banco:', dbError);
        }
        res.json({
            success: true,
            data: result
        });
    }
    catch (error) {
        console.error('❌ Erro ao enviar mensagem:', error);
        res.status(500).json({
            error: error.message || 'Erro ao enviar mensagem'
        });
    }
});
// GET /api/wa/status - Obter status da conexão
router.get('/status', authenticate, async (req, res) => {
    try {
        // Resolver admin
        const adminId = await resolveAdminId(req.user);
        const instance = await evolution_proxy_1.evolutionProxy.getAdminInstance(adminId);
        // Buscar status
        const status = await evolution_proxy_1.evolutionProxy.getInstanceStatus(instance.instance_id, instance.api_base_url, instance.api_key);
        res.json({
            success: true,
            ...status
        });
    }
    catch (error) {
        console.error('❌ Erro ao buscar status:', error);
        res.status(500).json({
            error: error.message || 'Erro ao buscar status'
        });
    }
});
exports.default = router;

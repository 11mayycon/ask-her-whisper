"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const sqlite_1 = require("../config/sqlite");
const crypto_1 = require("crypto");
const axios_1 = __importDefault(require("axios"));
const router = (0, express_1.Router)();
// Buscar memória da IA
router.get('/memory', async (req, res) => {
    try {
        const db = await (0, sqlite_1.getDatabase)();
        const memory = await db.get("SELECT * FROM ai_memory WHERE key = 'instructions' LIMIT 1");
        res.json(memory);
    }
    catch (error) {
        console.error('Erro ao buscar memória:', error);
        res.status(500).json({ error: 'Erro ao buscar memória da IA' });
    }
});
// Salvar/atualizar memória da IA
router.post('/memory', async (req, res) => {
    try {
        const { instructions } = req.body;
        if (!instructions || !instructions.trim()) {
            return res.status(400).json({ error: 'Instruções não podem estar vazias' });
        }
        const db = await (0, sqlite_1.getDatabase)();
        // Verificar se já existe
        const existing = await db.get("SELECT id FROM ai_memory WHERE key = 'instructions' LIMIT 1");
        if (existing) {
            // Atualizar
            await db.run("UPDATE ai_memory SET value = ?, updated_at = CURRENT_TIMESTAMP WHERE key = 'instructions'", [instructions]);
        }
        else {
            // Inserir
            const id = (0, crypto_1.randomUUID)();
            await db.run("INSERT INTO ai_memory (id, key, value, category) VALUES (?, 'instructions', ?, 'system')", [id, instructions]);
        }
        // Recarregar memória no sales bot
        try {
            const { salesBot } = await Promise.resolve().then(() => __importStar(require('../services/sales-bot')));
            await salesBot.reloadMemory();
            console.log('✅ Memória da ISA recarregada automaticamente');
        }
        catch (error) {
            console.error('Erro ao recarregar memória do sales bot:', error);
        }
        res.json({ success: true });
    }
    catch (error) {
        console.error('Erro ao salvar memória:', error);
        res.status(500).json({ error: 'Erro ao salvar memória da IA' });
    }
});
// Helper function to get detailed system context
async function getSystemContext() {
    try {
        const db = await (0, sqlite_1.getDatabase)();
        // Get support users status
        const supportUsers = await db.all('SELECT full_name, email, is_active, max_concurrent_chats FROM support_users');
        // Get active attendances
        const activeAttendances = await db.all(`SELECT a.*, sr.customer_name, sr.customer_phone, u.full_name as support_name
       FROM attendances a
       LEFT JOIN support_rooms sr ON a.room_id = sr.id
       LEFT JOIN users u ON a.assigned_to = u.id
       WHERE a.status = 'active'`);
        // Get waiting rooms
        const waitingRooms = await db.all(`SELECT customer_name, customer_phone, created_at
       FROM support_rooms
       WHERE status = 'waiting'
       ORDER BY created_at DESC
       LIMIT 10`);
        // Get recent messages with details
        const recentMessages = await db.all(`SELECT m.*, sr.customer_name, sr.customer_phone
       FROM messages m
       LEFT JOIN support_rooms sr ON m.room_id = sr.id
       WHERE m.created_at > datetime('now', '-24 hours')
       ORDER BY m.created_at DESC
       LIMIT 10`);
        // Get message count
        const messageCount = await db.get(`SELECT COUNT(*) as count
       FROM messages
       WHERE created_at > datetime('now', '-24 hours')`);
        // Get most common message topics (simple keyword analysis)
        const topicAnalysis = await db.all(`SELECT content, COUNT(*) as frequency
       FROM messages
       WHERE sender_type = 'customer'
       AND created_at > datetime('now', '-24 hours')
       GROUP BY content
       ORDER BY frequency DESC
       LIMIT 5`);
        // Get WhatsApp connection status
        const whatsappStatus = await db.get('SELECT status, phone_number, connected_at FROM whatsapp_connections ORDER BY updated_at DESC LIMIT 1');
        // Get total users
        const totalUsers = await db.get('SELECT COUNT(*) as count FROM users');
        // Get active subscriptions
        const activeSubscriptions = await db.get(`SELECT COUNT(*) as count FROM subscriptions WHERE status = 'active'`);
        // Build comprehensive context
        let context = '### 📊 Dados do Sistema ISA 2.5:\n\n';
        // Support team
        context += `**👥 Equipe de Suporte:**\n`;
        const onlineSupport = supportUsers.filter(u => u.is_active);
        const offlineSupport = supportUsers.filter(u => !u.is_active);
        context += `- Total: ${supportUsers.length} usuários\n`;
        context += `- Online: ${onlineSupport.length} ativos\n`;
        context += `- Offline: ${offlineSupport.length} inativos\n\n`;
        if (onlineSupport.length > 0) {
            context += `**Suportes Online:**\n`;
            onlineSupport.forEach(user => {
                context += `  • ${user.full_name} (${user.max_concurrent_chats} chats max)\n`;
            });
        }
        // Active attendances
        context += `\n**💬 Atendimentos:**\n`;
        context += `- Em andamento: ${activeAttendances.length}\n`;
        context += `- Aguardando: ${waitingRooms.length}\n`;
        if (activeAttendances.length > 0) {
            context += `\n**Atendimentos Ativos:**\n`;
            activeAttendances.slice(0, 5).forEach(att => {
                context += `  • ${att.customer_name || att.customer_phone} → ${att.support_name || 'Não atribuído'}\n`;
            });
        }
        if (waitingRooms.length > 0) {
            context += `\n**Aguardando Atendimento:**\n`;
            waitingRooms.slice(0, 3).forEach(room => {
                const waitTime = Math.floor((Date.now() - new Date(room.created_at).getTime()) / 60000);
                context += `  • ${room.customer_name || room.customer_phone} (${waitTime}min aguardando)\n`;
            });
        }
        // Messages
        context += `\n**📨 Mensagens:**\n`;
        context += `- Últimas 24h: ${messageCount?.count || 0} mensagens\n`;
        if (recentMessages.length > 0) {
            context += `\n**Últimas Mensagens:**\n`;
            recentMessages.slice(0, 3).forEach(msg => {
                const time = new Date(msg.created_at).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
                const preview = msg.content.length > 50 ? msg.content.substring(0, 50) + '...' : msg.content;
                context += `  • [${time}] ${msg.customer_name || msg.customer_phone}: "${preview}"\n`;
            });
        }
        // WhatsApp status
        context += `\n**📱 WhatsApp:**\n`;
        context += `- Status: ${whatsappStatus?.status || 'Desconectado'}\n`;
        if (whatsappStatus?.phone_number) {
            context += `- Número: ${whatsappStatus.phone_number}\n`;
            if (whatsappStatus.connected_at) {
                const connectedDate = new Date(whatsappStatus.connected_at).toLocaleString('pt-BR');
                context += `- Conectado desde: ${connectedDate}\n`;
            }
        }
        // System stats
        context += `\n**📈 Estatísticas Gerais:**\n`;
        context += `- Total de usuários: ${totalUsers?.count || 0}\n`;
        context += `- Assinaturas ativas: ${activeSubscriptions?.count || 0}\n`;
        return context;
    }
    catch (error) {
        console.error('Erro ao buscar contexto do sistema:', error);
        return '### Contexto do Sistema: Dados temporariamente indisponíveis.\n';
    }
}
// Chat com IA - InovaPro AI
router.post('/chat', async (req, res) => {
    try {
        const { query, history = [] } = req.body;
        if (!query || !query.trim()) {
            return res.status(400).json({ error: 'Consulta vazia' });
        }
        // Get API configuration
        const apiKey = process.env.GEMINI_API_KEY;
        const apiUrl = process.env.GEMINI_API_URL;
        if (!apiKey || !apiUrl) {
            return res.status(500).json({
                error: 'Configuração da InovaPro AI não encontrada. Verifique as variáveis de ambiente.'
            });
        }
        // Get system context
        const systemContext = await getSystemContext();
        // Get AI memory/instructions
        const db = await (0, sqlite_1.getDatabase)();
        const memory = await db.get("SELECT value FROM ai_memory WHERE key = 'instructions' LIMIT 1");
        const systemInstructions = memory?.value ||
            `Você é a InovaPro AI, assistente administrativa da ISA 2.5.

REGRAS:
- NUNCA mencione "Gemini", "Google", "Groq" ou nomes de modelos
- Sempre se identifique como "InovaPro AI"
- Respostas CURTAS (máximo 3-4 linhas)
- Use markdown e emojis discretos
- Seja profissional e objetiva

Você ajuda administradores com status de suporte, atendimentos, mensagens e WhatsApp.`;
        // Build conversation history for Gemini
        const conversationHistory = history.map((msg) => ({
            role: msg.sender === 'user' ? 'user' : 'model',
            parts: [{ text: msg.text }]
        }));
        // Build the prompt
        let fullPrompt = `${systemInstructions}\n\n${systemContext}\n\n**Pergunta:** ${query}`;
        // Limit prompt size to avoid token limits (keep last 2000 chars of context if needed)
        if (fullPrompt.length > 3000) {
            const truncatedContext = systemContext.slice(-1500);
            fullPrompt = `${systemInstructions}\n\n${truncatedContext}\n\n**Pergunta:** ${query}`;
        }
        // Prepare the request for Gemini API
        const geminiRequest = {
            contents: [
                {
                    role: 'user',
                    parts: [{
                            text: fullPrompt
                        }]
                }
            ],
            generationConfig: {
                temperature: 0.7,
                topK: 40,
                topP: 0.95,
                maxOutputTokens: 500,
            },
            safetySettings: [
                { category: 'HARM_CATEGORY_HARASSMENT', threshold: 'BLOCK_NONE' },
                { category: 'HARM_CATEGORY_HATE_SPEECH', threshold: 'BLOCK_NONE' },
                { category: 'HARM_CATEGORY_SEXUALLY_EXPLICIT', threshold: 'BLOCK_NONE' },
                { category: 'HARM_CATEGORY_DANGEROUS_CONTENT', threshold: 'BLOCK_NONE' },
            ]
        };
        // Call Gemini API
        const response = await axios_1.default.post(`${apiUrl}?key=${apiKey}`, geminiRequest, {
            headers: {
                'Content-Type': 'application/json',
            },
            timeout: 30000
        });
        // Extract response text
        const aiResponse = response.data?.candidates?.[0]?.content?.parts?.[0]?.text;
        if (!aiResponse) {
            console.error('Resposta vazia da API Gemini:', JSON.stringify(response.data));
            return res.json({
                response: '🔄 Estou coletando os dados do sistema para você... Por favor, aguarde alguns instantes e pergunte novamente.'
            });
        }
        res.json({ response: aiResponse.trim() });
    }
    catch (error) {
        console.error('Erro ao chamar InovaPro AI:', error.response?.data || error.message);
        // Check if it's a rate limit error (429)
        if (error.response?.data?.error?.code === 429) {
            return res.json({
                response: '⏳ Estou processando muitas requisições no momento. Por favor, aguarde 10-15 segundos e tente novamente.'
            });
        }
        // Return a friendly error instead of failing
        res.json({
            response: '🔄 Estou coletando os dados do sistema... Por favor, aguarde alguns instantes e faça sua pergunta novamente.'
        });
    }
});
exports.default = router;

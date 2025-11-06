"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.io = void 0;
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const dotenv_1 = __importDefault(require("dotenv"));
const http_1 = __importDefault(require("http"));
const socket_io_1 = require("socket.io");
const auth_1 = __importDefault(require("./routes/auth"));
const whatsapp_wjs_1 = __importDefault(require("./routes/whatsapp-wjs"));
const attendances_1 = __importDefault(require("./routes/attendances"));
const support_1 = __importDefault(require("./routes/support"));
const ai_1 = __importDefault(require("./routes/ai"));
const admin_1 = __importDefault(require("./routes/admin"));
const webhooks_1 = __importDefault(require("./routes/webhooks"));
const payments_1 = __importDefault(require("./routes/payments"));
const conversations_1 = __importDefault(require("./routes/conversations"));
const wa_1 = __importDefault(require("./routes/wa"));
const wa_webhook_1 = __importDefault(require("./routes/wa-webhook"));
const sqlite_1 = require("./config/sqlite");
const whatsapp_1 = require("./services/whatsapp");
const sales_bot_1 = require("./services/sales-bot");
const websocket_events_1 = require("./services/websocket-events");
dotenv_1.default.config();
const app = (0, express_1.default)();
const server = http_1.default.createServer(app);
const io = new socket_io_1.Server(server, {
    cors: {
        origin: '*',
        methods: ['GET', 'POST']
    }
});
exports.io = io;
const PORT = process.env.PORT || 3001;
// Middleware
app.use((0, cors_1.default)({
    origin: '*', // Permite todas as origens
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true,
}));
app.use(express_1.default.json());
// Servir arquivos estáticos da pasta uploads
app.use('/uploads', express_1.default.static('uploads'));
// Rotas
app.use('/api/auth', auth_1.default);
app.use('/api/whatsapp', whatsapp_wjs_1.default);
app.use('/api/attendances', attendances_1.default);
app.use('/api/support', support_1.default);
app.use('/api/ai', ai_1.default);
app.use('/api/admin', admin_1.default);
app.use('/api/webhooks', webhooks_1.default);
app.use('/api/payments', payments_1.default);
app.use('/api/conversations', conversations_1.default);
app.use('/api/wa', wa_1.default);
app.use('/api/wa', wa_webhook_1.default);
// WebSocket para eventos em tempo real
io.on('connection', (socket) => {
    console.log('✅ Cliente conectado via WebSocket:', socket.id);
    // Permitir o cliente entrar em uma sala específica (por instância)
    socket.on('join:instance', (instanceName) => {
        socket.join(`instance:${instanceName}`);
        console.log(`📱 Cliente ${socket.id} entrou na sala da instância: ${instanceName}`);
    });
    // Permitir o cliente sair de uma sala
    socket.on('leave:instance', (instanceName) => {
        socket.leave(`instance:${instanceName}`);
        console.log(`📱 Cliente ${socket.id} saiu da sala da instância: ${instanceName}`);
    });
    socket.on('disconnect', () => {
        console.log('❌ Cliente desconectado:', socket.id);
    });
});
// Eventos do WhatsApp Web JS
whatsapp_1.whatsappService.on('qr', (qrCode) => {
    console.log('📱 QR Code disponível');
    io.emit('qr', qrCode);
});
whatsapp_1.whatsappService.on('ready', () => {
    console.log('✅ WhatsApp pronto');
    io.emit('ready');
});
whatsapp_1.whatsappService.on('authenticated', () => {
    console.log('✅ WhatsApp autenticado');
    io.emit('authenticated');
});
whatsapp_1.whatsappService.on('message', (message) => {
    console.log('📩 Nova mensagem recebida');
    io.emit('message', message);
});
whatsapp_1.whatsappService.on('disconnected', (reason) => {
    console.log('❌ WhatsApp desconectado:', reason);
    io.emit('disconnected', reason);
});
// Health check
app.get('/health', async (req, res) => {
    try {
        const db = await (0, sqlite_1.getDatabase)();
        await db.get('SELECT 1');
        res.json({ status: 'OK', database: 'connected' });
    }
    catch (error) {
        res.status(500).json({ status: 'ERROR', database: 'disconnected' });
    }
});
// Não inicializar WhatsApp automaticamente - será criado por demanda
// whatsappService.initialize().catch(error => {
//   console.error('❌ Erro ao inicializar WhatsApp:', error);
// });
// Inicializar WebSocket Events Service
(0, websocket_events_1.initializeWebSocketEvents)(io);
console.log('✅ WebSocket Events Service inicializado');
// Inicializar ISA Atendente
sales_bot_1.salesBot.initialize().catch(error => {
    console.error('❌ Erro ao inicializar ISA:', error);
});
// Iniciar servidor
server.listen(PORT, () => {
    console.log(`🚀 Servidor ISA 2.5 rodando na porta ${PORT}`);
    console.log(`📊 Database: SQLite (${process.env.SQLITE_DB_PATH || '/app/data/isa.db'})`);
    console.log(`🤖 ISA Atendente com Groq AI inicializando...`);
    console.log(`🔌 WebSocket disponível na porta ${PORT}`);
});

import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import http from 'http';
import { Server as SocketIOServer } from 'socket.io';
import authRoutes from './routes/auth';
import whatsappWjsRoutes from './routes/whatsapp-wjs';
import attendancesRoutes from './routes/attendances';
import supportRoutes from './routes/support';
import aiRoutes from './routes/ai';
import adminRoutes from './routes/admin';
import webhooksRoutes from './routes/webhooks';
import paymentsRoutes from './routes/payments';
import conversationsRoutes from './routes/conversations';
import waRoutes from './routes/wa';
import waWebhookRoutes from './routes/wa-webhook';
import { getDatabase } from './config/sqlite';
import { whatsappService } from './services/whatsapp';
import { salesBot } from './services/sales-bot';
import { initializeWebSocketEvents } from './services/websocket-events';

dotenv.config();

const app = express();
const server = http.createServer(app);
const io = new SocketIOServer(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST']
  }
});

const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors({
  origin: '*', // Permite todas as origens
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true,
}));
app.use(express.json());

// Servir arquivos estáticos da pasta uploads
app.use('/uploads', express.static('uploads'));

// Rotas
app.use('/api/auth', authRoutes);
app.use('/api/whatsapp', whatsappWjsRoutes);
app.use('/api/attendances', attendancesRoutes);
app.use('/api/support', supportRoutes);
app.use('/api/ai', aiRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/webhooks', webhooksRoutes);
app.use('/api/payments', paymentsRoutes);
app.use('/api/conversations', conversationsRoutes);
app.use('/api/wa', waRoutes);
app.use('/api/wa', waWebhookRoutes);

// Exportar io para uso em outras partes da aplicação
export { io };

// WebSocket para eventos em tempo real
io.on('connection', (socket) => {
  console.log('✅ Cliente conectado via WebSocket:', socket.id);

  // Permitir o cliente entrar em uma sala específica (por instância)
  socket.on('join:instance', (instanceName: string) => {
    socket.join(`instance:${instanceName}`);
    console.log(`📱 Cliente ${socket.id} entrou na sala da instância: ${instanceName}`);
  });

  // Permitir o cliente sair de uma sala
  socket.on('leave:instance', (instanceName: string) => {
    socket.leave(`instance:${instanceName}`);
    console.log(`📱 Cliente ${socket.id} saiu da sala da instância: ${instanceName}`);
  });

  socket.on('disconnect', () => {
    console.log('❌ Cliente desconectado:', socket.id);
  });
});

// Eventos do WhatsApp Web JS
whatsappService.on('qr', (qrCode: string) => {
  console.log('📱 QR Code disponível');
  io.emit('qr', qrCode);
});

whatsappService.on('ready', () => {
  console.log('✅ WhatsApp pronto');
  io.emit('ready');
});

whatsappService.on('authenticated', () => {
  console.log('✅ WhatsApp autenticado');
  io.emit('authenticated');
});

whatsappService.on('message', (message: any) => {
  console.log('📩 Nova mensagem recebida');
  io.emit('message', message);
});

whatsappService.on('disconnected', (reason: string) => {
  console.log('❌ WhatsApp desconectado:', reason);
  io.emit('disconnected', reason);
});

// Health check
app.get('/health', async (req, res) => {
  try {
    const db = await getDatabase();
    await db.get('SELECT 1');
    res.json({ status: 'OK', database: 'connected' });
  } catch (error) {
    res.status(500).json({ status: 'ERROR', database: 'disconnected' });
  }
});

// Não inicializar WhatsApp automaticamente - será criado por demanda
// whatsappService.initialize().catch(error => {
//   console.error('❌ Erro ao inicializar WhatsApp:', error);
// });

// Inicializar WebSocket Events Service
initializeWebSocketEvents(io);
console.log('✅ WebSocket Events Service inicializado');

// Inicializar ISA Atendente
salesBot.initialize().catch(error => {
  console.error('❌ Erro ao inicializar ISA:', error);
});

// Iniciar servidor
server.listen(PORT, () => {
  console.log(`🚀 Servidor ISA 2.5 rodando na porta ${PORT}`);
  console.log(`📊 Database: SQLite (${process.env.SQLITE_DB_PATH || '/app/data/isa.db'})`);
  console.log(`🤖 ISA Atendente com Groq AI inicializando...`);
  console.log(`🔌 WebSocket disponível na porta ${PORT}`);
});

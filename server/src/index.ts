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
import { pool } from './config/database';
import { whatsappService } from './services/whatsapp';

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

// Rotas
app.use('/api/auth', authRoutes);
app.use('/api/whatsapp', whatsappWjsRoutes);
app.use('/api/attendances', attendancesRoutes);
app.use('/api/support', supportRoutes);
app.use('/api/ai', aiRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/webhooks', webhooksRoutes);

// WebSocket para eventos em tempo real
io.on('connection', (socket) => {
  console.log('Cliente conectado via WebSocket');

  socket.on('disconnect', () => {
    console.log('Cliente desconectado');
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
    await pool.query('SELECT NOW()');
    res.json({ status: 'OK', database: 'connected' });
  } catch (error) {
    res.status(500).json({ status: 'ERROR', database: 'disconnected' });
  }
});

// Inicializar WhatsApp Web JS
whatsappService.initialize().catch(error => {
  console.error('❌ Erro ao inicializar WhatsApp:', error);
});

// Iniciar servidor
server.listen(PORT, () => {
  console.log(`🚀 Servidor rodando na porta ${PORT}`);
  console.log(`📊 Database: ${process.env.DATABASE_URL?.split('@')[1]}`);
  console.log(`📱 WhatsApp Web JS inicializando...`);
});

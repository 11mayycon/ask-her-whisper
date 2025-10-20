import axios from 'axios';
import socketIOClient from 'socket.io-client';

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:3001';

export class WhatsAppWJSClient {
  private socket: ReturnType<typeof socketIOClient> | null = null;
  private static instance: WhatsAppWJSClient;

  private constructor() {}

  static getInstance(): WhatsAppWJSClient {
    if (!WhatsAppWJSClient.instance) {
      WhatsAppWJSClient.instance = new WhatsAppWJSClient();
    }
    return WhatsAppWJSClient.instance;
  }

  connectSocket(callbacks: {
    onQR?: (qrCode: string) => void;
    onReady?: () => void;
    onAuthenticated?: () => void;
    onMessage?: (message: any) => void;
    onDisconnected?: (reason: string) => void;
  }) {
    if (this.socket?.connected) {
      return this.socket;
    }

    this.socket = socketIOClient(BACKEND_URL);

    this.socket.on('connect', () => {
      console.log('✅ Conectado ao servidor WebSocket');
    });

    this.socket.on('qr', (qrCode: string) => {
      console.log('📱 QR Code recebido');
      callbacks.onQR?.(qrCode);
    });

    this.socket.on('ready', () => {
      console.log('✅ WhatsApp pronto');
      callbacks.onReady?.();
    });

    this.socket.on('authenticated', () => {
      console.log('✅ WhatsApp autenticado');
      callbacks.onAuthenticated?.();
    });

    this.socket.on('message', (message: any) => {
      console.log('📩 Nova mensagem:', message);
      callbacks.onMessage?.(message);
    });

    this.socket.on('disconnected', (reason: string) => {
      console.log('❌ WhatsApp desconectado:', reason);
      callbacks.onDisconnected?.(reason);
    });

    this.socket.on('disconnect', () => {
      console.log('❌ Desconectado do servidor WebSocket');
    });

    return this.socket;
  }

  disconnectSocket() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
  }

  async getStatus() {
    try {
      const response = await axios.get(`${BACKEND_URL}/api/whatsapp/status`);
      return response.data;
    } catch (error) {
      console.error('Erro ao verificar status:', error);
      throw error;
    }
  }

  async getQRCode() {
    try {
      const response = await axios.get(`${BACKEND_URL}/api/whatsapp/qrcode`);
      return response.data;
    } catch (error) {
      console.error('Erro ao buscar QR code:', error);
      throw error;
    }
  }

  async sendMessage(number: string, message: string) {
    try {
      const response = await axios.post(`${BACKEND_URL}/api/whatsapp/send-message`, {
        number,
        message
      });
      return response.data;
    } catch (error) {
      console.error('Erro ao enviar mensagem:', error);
      throw error;
    }
  }

  async getChats() {
    try {
      const response = await axios.get(`${BACKEND_URL}/api/whatsapp/chats`);
      return response.data;
    } catch (error) {
      console.error('Erro ao buscar chats:', error);
      throw error;
    }
  }

  async getContacts() {
    try {
      const response = await axios.get(`${BACKEND_URL}/api/whatsapp/contacts`);
      return response.data;
    } catch (error) {
      console.error('Erro ao buscar contatos:', error);
      throw error;
    }
  }

  async disconnect() {
    try {
      const response = await axios.post(`${BACKEND_URL}/api/whatsapp/disconnect`);
      return response.data;
    } catch (error) {
      console.error('Erro ao desconectar:', error);
      throw error;
    }
  }
}

export const whatsappWJSClient = WhatsAppWJSClient.getInstance();

import { Client, LocalAuth, Message } from 'whatsapp-web.js';
import QRCode from 'qrcode';
import { EventEmitter } from 'events';

export class WhatsAppService extends EventEmitter {
  private client: Client | null = null;
  private qrCode: string = '';
  private isReady: boolean = false;
  private isAuthenticated: boolean = false;

  constructor() {
    super();
  }

  async initialize() {
    console.log('🔄 Inicializando WhatsApp Web JS...');
    
    this.client = new Client({
      authStrategy: new LocalAuth({
        dataPath: '.wwebjs_auth'
      }),
      puppeteer: {
        headless: true,
        args: [
          '--no-sandbox',
          '--disable-setuid-sandbox',
          '--disable-dev-shm-usage',
          '--disable-accelerated-2d-canvas',
          '--no-first-run',
          '--no-zygote',
          '--disable-gpu'
        ]
      }
    });

    this.client.on('qr', async (qr: string) => {
      console.log('📱 QR Code recebido');
      try {
        this.qrCode = await QRCode.toDataURL(qr);
        this.emit('qr', this.qrCode);
      } catch (error) {
        console.error('Erro ao gerar QR Code:', error);
      }
    });

    this.client.on('authenticated', () => {
      console.log('✅ WhatsApp autenticado!');
      this.isAuthenticated = true;
      this.emit('authenticated');
    });

    this.client.on('ready', () => {
      console.log('✅ WhatsApp pronto para uso!');
      this.isReady = true;
      this.qrCode = '';
      this.emit('ready');
    });

    this.client.on('message', (message: Message) => {
      this.handleIncomingMessage(message);
    });

    this.client.on('message_create', (message: Message) => {
      if (message.fromMe) {
        this.emit('message_sent', message);
      }
    });

    this.client.on('disconnected', (reason: string) => {
      console.log('❌ WhatsApp desconectado:', reason);
      this.isReady = false;
      this.isAuthenticated = false;
      this.emit('disconnected', reason);
    });

    this.client.on('auth_failure', (error: Error) => {
      console.error('❌ Falha na autenticação:', error);
      this.emit('auth_failure', error);
    });

    await this.client.initialize();
  }

  private async handleIncomingMessage(message: Message) {
    try {
      const contact = await message.getContact();
      const chat = await message.getChat();

      const messageData = {
        id: message.id._serialized,
        from: message.from,
        to: message.to || '',
        body: message.body,
        timestamp: message.timestamp,
        isGroup: chat.isGroup,
        contactName: contact.pushname || contact.name || message.from,
        contactNumber: message.from.split('@')[0],
        hasMedia: message.hasMedia,
        type: message.type
      };

      this.emit('message', messageData);
    } catch (error) {
      console.error('Erro ao processar mensagem:', error);
    }
  }

  async sendMessage(number: string, message: string) {
    if (!this.client || !this.isReady) {
      throw new Error('WhatsApp não está pronto');
    }

    try {
      const chatId = number.includes('@') ? number : `${number}@c.us`;
      await this.client.sendMessage(chatId, message);
      return { success: true };
    } catch (error) {
      console.error('Erro ao enviar mensagem:', error);
      throw error;
    }
  }

  async getChats() {
    if (!this.client || !this.isReady) {
      throw new Error('WhatsApp não está pronto');
    }

    try {
      const chats = await this.client.getChats();
      return chats.map(chat => ({
        id: chat.id._serialized,
        name: chat.name,
        isGroup: chat.isGroup,
        unreadCount: chat.unreadCount,
        timestamp: chat.timestamp
      }));
    } catch (error) {
      console.error('Erro ao buscar chats:', error);
      throw error;
    }
  }

  async getContacts() {
    if (!this.client || !this.isReady) {
      throw new Error('WhatsApp não está pronto');
    }

    try {
      const contacts = await this.client.getContacts();
      return contacts
        .filter(contact => !contact.isGroup && !contact.isMe)
        .map(contact => ({
          id: contact.id._serialized,
          name: contact.name || contact.pushname || contact.number,
          number: contact.number,
          isMyContact: contact.isMyContact
        }));
    } catch (error) {
      console.error('Erro ao buscar contatos:', error);
      throw error;
    }
  }

  getQRCode() {
    return this.qrCode;
  }

  getStatus() {
    return {
      isReady: this.isReady,
      isAuthenticated: this.isAuthenticated,
      hasQRCode: !!this.qrCode
    };
  }

  async disconnect() {
    if (this.client) {
      await this.client.destroy();
      this.isReady = false;
      this.isAuthenticated = false;
      this.qrCode = '';
    }
  }
}

export const whatsappService = new WhatsAppService();

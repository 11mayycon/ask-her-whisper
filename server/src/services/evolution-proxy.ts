import axios, { AxiosInstance } from 'axios';
import { getDatabase } from '../config/sqlite';

interface EvolutionContact {
  id?: string;
  number?: string;
  jid?: string;
  name?: string;
  pushname?: string;
  isBusiness?: boolean;
  profilePicUrl?: string;
}

interface EvolutionChat {
  id?: string;
  jid?: string;
  name?: string;
  formattedTitle?: string;
  unreadCount?: number;
  isGroup?: boolean;
  lastMessageAt?: number;
  lastMessage?: any;
}

interface EvolutionMessage {
  id?: string;
  key?: {
    id?: string;
    fromMe?: boolean;
    remoteJid?: string;
  };
  fromMe?: boolean;
  pushName?: string;
  sender?: { name?: string };
  participant?: string;
  message?: {
    conversation?: string;
    extendedTextMessage?: { text?: string };
    imageMessage?: { caption?: string; url?: string };
    videoMessage?: { caption?: string; url?: string };
    audioMessage?: { url?: string };
    documentMessage?: { fileName?: string; url?: string };
  };
  text?: string;
  body?: string;
  type?: string;
  timestamp?: number;
  messageTimestamp?: number;
  status?: string;
}

export class EvolutionProxyService {
  private instances: Map<string, AxiosInstance> = new Map();

  // Obter instância ativa do admin
  async getAdminInstance(adminId: string) {
    const db = await getDatabase();

    const instance = await db.get(
      `SELECT * FROM whatsapp_instances
       WHERE admin_user_id = ?
       ORDER BY created_at DESC
       LIMIT 1`,
      [adminId]
    );

    if (!instance) {
      throw new Error('Nenhuma instância WhatsApp encontrada');
    }

    return {
      id: instance.id,
      instance_id: instance.instance_id,
      api_base_url: instance.api_base_url,
      api_key: instance.api_key,
      status: instance.status
    };
  }

  // Criar cliente HTTP para instância
  private getClient(baseUrl: string, apiKey: string): AxiosInstance {
    const key = `${baseUrl}:${apiKey}`;

    if (!this.instances.has(key)) {
      this.instances.set(key, axios.create({
        baseURL: baseUrl,
        headers: {
          'apikey': apiKey,
          'Content-Type': 'application/json'
        },
        timeout: 30000
      }));
    }

    return this.instances.get(key)!;
  }

  // ========== NORMALIZAÇÃO DE DADOS ==========

  mapContact(evo: EvolutionContact, instanceId: string) {
    return {
      instance_id: instanceId,
      wa_id: evo.id || evo.number || evo.jid || '',
      name: evo.name || evo.pushname || '',
      pushname: evo.pushname || '',
      isBusiness: evo.isBusiness ? 1 : 0,
      profilePicUrl: evo.profilePicUrl || null
    };
  }

  mapChat(evo: EvolutionChat, instanceId: string) {
    let lastMessageText = '';
    let lastMessageFrom = '';

    if (evo.lastMessage) {
      const msg = evo.lastMessage.message || evo.lastMessage;
      lastMessageText = msg.conversation ||
                       msg.extendedTextMessage?.text ||
                       msg.imageMessage?.caption ||
                       '[Mídia]';
      lastMessageFrom = evo.lastMessage.pushName ||
                       evo.lastMessage.sender?.name ||
                       '';
    }

    return {
      instance_id: instanceId,
      chat_id: evo.id || evo.jid || '',
      name: evo.name || evo.formattedTitle || '',
      unreadCount: evo.unreadCount || 0,
      isGroup: evo.isGroup ? 1 : 0,
      lastMessageAt: evo.lastMessageAt ? new Date(evo.lastMessageAt * 1000).toISOString() : null,
      lastMessageText,
      lastMessageFrom
    };
  }

  mapMessage(evo: EvolutionMessage, chatId: string, instanceId: string) {
    const fromMe = evo.fromMe || evo.key?.fromMe || false;
    let body = '';

    if (evo.message) {
      body = evo.message.conversation ||
             evo.message.extendedTextMessage?.text ||
             evo.message.imageMessage?.caption ||
             evo.message.videoMessage?.caption ||
             evo.message.documentMessage?.fileName ||
             '';
    } else {
      body = evo.text || evo.body || '';
    }

    return {
      instance_id: instanceId,
      chat_id: chatId,
      message_id: evo.id || evo.key?.id || `msg_${Date.now()}`,
      from_me: fromMe ? 1 : 0,
      sender: evo.pushName || evo.sender?.name || evo.participant || '',
      sender_type: fromMe ? 'support' : 'client',
      body,
      type: evo.type || 'text',
      timestamp: new Date((evo.timestamp || evo.messageTimestamp || Date.now() / 1000) * 1000).toISOString(),
      status: evo.status || 'received',
      raw_json: JSON.stringify(evo)
    };
  }

  // ========== ENDPOINTS PROXY ==========

  // Listar contatos
  async fetchContacts(instanceId: string, baseUrl: string, apiKey: string, cursor?: string) {
    const client = this.getClient(baseUrl, apiKey);
    const db = await getDatabase();

    try {
      console.log(`📱 Buscando contatos da instância: ${instanceId}`);

      const url = `/chat/findContacts/${instanceId}`;
      const response = await client.get(url);

      const contacts = Array.isArray(response.data) ? response.data : [];
      console.log(`✅ ${contacts.length} contatos encontrados`);

      // Persistir contatos
      for (const contact of contacts) {
        const mapped = this.mapContact(contact, instanceId);

        await db.run(
          `INSERT INTO whatsapp_contacts (instance_id, wa_id, name, pushname, isBusiness, profilePicUrl)
           VALUES (?, ?, ?, ?, ?, ?)
           ON CONFLICT(instance_id, wa_id) DO UPDATE SET
             name = excluded.name,
             pushname = excluded.pushname,
             isBusiness = excluded.isBusiness,
             profilePicUrl = excluded.profilePicUrl,
             updated_at = CURRENT_TIMESTAMP`,
          [mapped.instance_id, mapped.wa_id, mapped.name, mapped.pushname, mapped.isBusiness, mapped.profilePicUrl]
        );
      }

      return {
        data: contacts.map(c => this.mapContact(c, instanceId)),
        nextCursor: null // Evolution API não retorna cursor para contatos
      };
    } catch (error: any) {
      console.error('❌ Erro ao buscar contatos:', error.response?.data || error.message);
      throw error;
    }
  }

  // Listar chats
  async fetchChats(instanceId: string, baseUrl: string, apiKey: string, limit: number = 50, cursor?: string) {
    const client = this.getClient(baseUrl, apiKey);
    const db = await getDatabase();

    try {
      console.log(`💬 Buscando chats da instância: ${instanceId}`);

      const url = `/chat/findChats/${instanceId}`;
      const response = await client.get(url);

      const chats = Array.isArray(response.data) ? response.data : [];
      console.log(`✅ ${chats.length} chats encontrados`);

      // Persistir chats
      for (const chat of chats) {
        const mapped = this.mapChat(chat, instanceId);

        await db.run(
          `INSERT INTO whatsapp_chats (instance_id, chat_id, name, unreadCount, isGroup, lastMessageAt, lastMessageText, lastMessageFrom)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?)
           ON CONFLICT(instance_id, chat_id) DO UPDATE SET
             name = excluded.name,
             unreadCount = excluded.unreadCount,
             isGroup = excluded.isGroup,
             lastMessageAt = excluded.lastMessageAt,
             lastMessageText = excluded.lastMessageText,
             lastMessageFrom = excluded.lastMessageFrom,
             updated_at = CURRENT_TIMESTAMP`,
          [mapped.instance_id, mapped.chat_id, mapped.name, mapped.unreadCount,
           mapped.isGroup, mapped.lastMessageAt, mapped.lastMessageText, mapped.lastMessageFrom]
        );
      }

      // Retornar do banco ordenado
      const savedChats = await db.all(
        `SELECT * FROM whatsapp_chats
         WHERE instance_id = ?
         ORDER BY lastMessageAt DESC
         LIMIT ?`,
        [instanceId, limit]
      );

      return {
        data: savedChats,
        nextCursor: null
      };
    } catch (error: any) {
      console.error('❌ Erro ao buscar chats:', error.response?.data || error.message);
      throw error;
    }
  }

  // Buscar mensagens de um chat
  async fetchMessages(instanceId: string, chatId: string, baseUrl: string, apiKey: string, limit: number = 50, cursor?: string) {
    const client = this.getClient(baseUrl, apiKey);
    const db = await getDatabase();

    try {
      console.log(`📩 Buscando mensagens de ${chatId}`);

      const url = `/chat/findMessages/${instanceId}`;
      const response = await client.post(url, {
        where: {
          key: {
            remoteJid: chatId
          }
        }
      });

      const messages = Array.isArray(response.data) ? response.data : [];
      console.log(`✅ ${messages.length} mensagens encontradas`);

      // Persistir mensagens
      for (const message of messages) {
        const mapped = this.mapMessage(message, chatId, instanceId);

        try {
          await db.run(
            `INSERT INTO whatsapp_messages (instance_id, chat_id, message_id, from_me, sender, sender_type, body, type, timestamp, status, raw_json)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
             ON CONFLICT(instance_id, message_id) DO NOTHING`,
            [mapped.instance_id, mapped.chat_id, mapped.message_id, mapped.from_me,
             mapped.sender, mapped.sender_type, mapped.body, mapped.type,
             mapped.timestamp, mapped.status, mapped.raw_json]
          );
        } catch (dbError) {
          // Ignorar erros de duplicata
        }
      }

      // Retornar do banco ordenado
      const savedMessages = await db.all(
        `SELECT * FROM whatsapp_messages
         WHERE instance_id = ? AND chat_id = ?
         ORDER BY timestamp ASC
         LIMIT ?`,
        [instanceId, chatId, limit]
      );

      return {
        data: savedMessages,
        nextCursor: null
      };
    } catch (error: any) {
      console.error('❌ Erro ao buscar mensagens:', error.response?.data || error.message);
      throw error;
    }
  }

  // Enviar mensagem
  async sendMessage(instanceId: string, chatId: string, text: string, supportName: string, baseUrl: string, apiKey: string) {
    const client = this.getClient(baseUrl, apiKey);

    try {
      // Prefixar mensagem
      const finalText = `SUPORTE – ${supportName}\n\n${text}`;

      console.log(`📤 Enviando mensagem para ${chatId}`);

      const url = `/message/sendText/${instanceId}`;
      const response = await client.post(url, {
        number: chatId,
        text: finalText
      });

      console.log(`✅ Mensagem enviada`);

      return response.data;
    } catch (error: any) {
      console.error('❌ Erro ao enviar mensagem:', error.response?.data || error.message);
      throw error;
    }
  }

  // Obter status da instância
  async getInstanceStatus(instanceId: string, baseUrl: string, apiKey: string) {
    const client = this.getClient(baseUrl, apiKey);

    try {
      const url = `/instance/connectionState/${instanceId}`;
      const response = await client.get(url);

      const state = response.data.instance?.state || response.data.state || 'disconnected';

      // Atualizar no banco
      const db = await getDatabase();
      await db.run(
        `UPDATE whatsapp_instances
         SET status = ?, updated_at = CURRENT_TIMESTAMP
         WHERE instance_id = ?`,
        [state === 'open' ? 'connected' : state === 'connecting' ? 'connecting' : 'disconnected', instanceId]
      );

      return {
        status: state,
        state: response.data
      };
    } catch (error: any) {
      console.error('❌ Erro ao buscar status:', error.response?.data || error.message);
      throw error;
    }
  }
}

export const evolutionProxy = new EvolutionProxyService();

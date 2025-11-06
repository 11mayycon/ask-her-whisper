import express from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { whatsappService } from '../services/whatsapp';
import { getDatabase } from '../config/sqlite';
import jwt from 'jsonwebtoken';
import { getWebSocketEventsService } from '../services/websocket-events';

const router = express.Router();

// Configurar multer para upload de arquivos
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = path.join(__dirname, '../../uploads');
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 16 * 1024 * 1024 // 16MB max
  },
  fileFilter: (req, file, cb) => {
    // Aceitar imagens, vídeos, áudios e documentos
    const allowedMimes = [
      'image/jpeg', 'image/png', 'image/gif', 'image/webp',
      'video/mp4', 'video/mpeg', 'video/quicktime',
      'audio/mpeg', 'audio/ogg', 'audio/wav',
      'application/pdf', 'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'application/vnd.ms-excel',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    ];

    if (allowedMimes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Tipo de arquivo não suportado'));
    }
  }
});

// Middleware para verificar autenticação
const authenticate = (req: any, res: any, next: any) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Token não fornecido' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as any;
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(401).json({ error: 'Token inválido' });
  }
};

// Listar conversas ativas de uma instância WhatsApp
router.get('/:instanceName', authenticate, async (req: any, res) => {
  try {
    const { instanceName } = req.params;
    const db = await getDatabase();

    console.log(`📱 Buscando conversas da instância: ${instanceName}`);

    // Buscar conversas DIRETO da Evolution API
    const chats = await whatsappService.getChats(instanceName);

    if (!chats || chats.length === 0) {
      console.log('⚠️ Nenhum chat encontrado na Evolution API');
      return res.json({
        success: true,
        conversations: []
      });
    }

    console.log(`✅ ${chats.length} chats encontrados na Evolution API`);

    // Buscar atendimentos do banco para enriquecer os dados
    const connection = await db.get(
      'SELECT * FROM whatsapp_connections WHERE instance_name = ?',
      [instanceName]
    );

    let attendances: any[] = [];
    if (connection) {
      attendances = await db.all(
        'SELECT * FROM attendances WHERE whatsapp_connection_id = ? ORDER BY updated_at DESC',
        [connection.id]
      );
    }

    // Mapear conversas com dados do banco
    const conversations = chats.map((chat: any) => {
      // Extrair dados do chat da Evolution
      const remoteJid = chat.id || chat.remoteJid;
      const phone = remoteJid?.replace('@s.whatsapp.net', '') || '';

      // Extrair última mensagem
      let lastMessage = '';
      let lastMessageTime = Date.now();

      if (chat.lastMessage) {
        lastMessage = chat.lastMessage.message?.conversation ||
                     chat.lastMessage.message?.extendedTextMessage?.text ||
                     chat.lastMessage.message?.imageMessage?.caption ||
                     '[Mídia]';
        lastMessageTime = chat.lastMessage.messageTimestamp
          ? chat.lastMessage.messageTimestamp * 1000
          : Date.now();
      }

      // Buscar atendimento correspondente
      const attendance = attendances.find(
        (att: any) => att.client_phone === phone
      );

      return {
        id: remoteJid,
        name: chat.name || chat.pushName || chat.verifiedName || phone,
        phone: phone,
        profilePic: chat.profilePicUrl || null,
        lastMessage: lastMessage,
        lastMessageTime: lastMessageTime,
        unreadCount: chat.unreadCount || 0,
        attendanceId: attendance?.id || null,
        status: attendance?.status || 'waiting',
        assignedTo: attendance?.assigned_to || 'ai'
      };
    });

    // Ordenar por última mensagem (mais recente primeiro)
    const sortedConversations = conversations.sort((a: any, b: any) =>
      b.lastMessageTime - a.lastMessageTime
    );

    res.json({
      success: true,
      conversations: sortedConversations
    });

  } catch (error: any) {
    console.error('❌ Erro ao buscar conversas:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Erro ao buscar conversas'
    });
  }
});

// Buscar mensagens de uma conversa específica
router.get('/:instanceName/messages/:chatId', authenticate, async (req: any, res) => {
  try {
    const { instanceName, chatId } = req.params;
    const db = await getDatabase();

    console.log(`📩 Buscando mensagens de ${chatId} na instância ${instanceName}`);

    // Buscar mensagens DIRETO da Evolution API
    const evolutionMessages = await whatsappService.getMessages(instanceName, chatId);

    console.log(`✅ ${evolutionMessages.length} mensagens encontradas na Evolution`);

    // Mapear mensagens para o formato esperado
    const messages = evolutionMessages.map((msg: any) => {
      // Determinar tipo de mensagem
      let messageType = 'text';
      let content = '';
      let mediaUrl = null;

      const message = msg.message;

      if (message) {
        if (message.conversation) {
          content = message.conversation;
        } else if (message.extendedTextMessage) {
          content = message.extendedTextMessage.text;
        } else if (message.imageMessage) {
          messageType = 'image';
          content = message.imageMessage.caption || '[Imagem]';
          mediaUrl = message.imageMessage.url;
        } else if (message.videoMessage) {
          messageType = 'video';
          content = message.videoMessage.caption || '[Vídeo]';
          mediaUrl = message.videoMessage.url;
        } else if (message.audioMessage) {
          messageType = 'audio';
          content = '[Áudio]';
          mediaUrl = message.audioMessage.url;
        } else if (message.documentMessage) {
          messageType = 'document';
          content = message.documentMessage.fileName || '[Documento]';
          mediaUrl = message.documentMessage.url;
        } else {
          content = '[Mensagem não suportada]';
        }
      }

      // Determinar sender
      const isFromMe = msg.key?.fromMe || false;
      const sender = isFromMe ? 'support' : 'client';

      return {
        id: msg.key?.id || `msg_${Date.now()}`,
        content: content,
        sender: sender,
        senderName: isFromMe ? 'Suporte' : 'Cliente',
        timestamp: msg.messageTimestamp ? msg.messageTimestamp * 1000 : Date.now(),
        type: messageType,
        mediaUrl: mediaUrl
      };
    });

    // Ordenar por timestamp (mais antiga primeiro)
    const sortedMessages = messages.sort((a: any, b: any) => a.timestamp - b.timestamp);

    res.json({
      success: true,
      messages: sortedMessages
    });

  } catch (error: any) {
    console.error('❌ Erro ao buscar mensagens:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Erro ao buscar mensagens'
    });
  }
});

// Enviar mensagem como suporte (com prefixo)
router.post('/:instanceName/send', authenticate, async (req: any, res) => {
  try {
    const { instanceName } = req.params;
    const { chatId, message } = req.body;
    const db = await getDatabase();

    if (!chatId || !message) {
      return res.status(400).json({
        success: false,
        error: 'ChatId e mensagem são obrigatórios'
      });
    }

    // Buscar informações do suporte logado
    const support = await db.get(
      'SELECT * FROM supports WHERE id = ?',
      [req.user.id]
    );

    if (!support) {
      return res.status(404).json({
        success: false,
        error: 'Suporte não encontrado'
      });
    }

    // Montar mensagem com prefixo
    const prefixedMessage = `SUPORTE - ${support.nome}\n\n${message}`;

    // Enviar via Evolution API
    const phone = chatId.includes('@') ? chatId : `${chatId}@s.whatsapp.net`;
    await whatsappService.sendMessage(phone, prefixedMessage);

    // Salvar no banco de dados
    const connection = await db.get(
      'SELECT * FROM whatsapp_connections WHERE instance_name = ?',
      [instanceName]
    );

    if (connection) {
      // Buscar ou criar atendimento
      let attendance = await db.get(
        'SELECT * FROM attendances WHERE client_phone = ? AND whatsapp_connection_id = ?',
        [chatId.replace('@s.whatsapp.net', ''), connection.id]
      );

      if (!attendance) {
        // Criar novo atendimento
        const attendanceId = crypto.randomUUID();
        await db.run(
          `INSERT INTO attendances (id, client_name, client_phone, status, assigned_to, admin_id, whatsapp_connection_id)
           VALUES (?, ?, ?, ?, ?, ?, ?)`,
          [
            attendanceId,
            chatId.split('@')[0],
            chatId.replace('@s.whatsapp.net', ''),
            'in_progress',
            support.id,
            support.admin_id,
            connection.id
          ]
        );
        attendance = { id: attendanceId };
      }

      // Salvar mensagem
      await db.run(
        `INSERT INTO messages (id, room_id, sender_id, sender_type, content, message_type, admin_id)
         VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [
          crypto.randomUUID(),
          attendance.id,
          support.id,
          'support',
          message, // Salvar sem prefixo
          'text',
          support.admin_id
        ]
      );
    }

    res.json({
      success: true,
      message: 'Mensagem enviada com sucesso'
    });

  } catch (error: any) {
    console.error('❌ Erro ao enviar mensagem:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Erro ao enviar mensagem'
    });
  }
});

// Marcar conversa como assumida pelo suporte
router.post('/:instanceName/take/:chatId', authenticate, async (req: any, res) => {
  try {
    const { instanceName, chatId } = req.params;
    const db = await getDatabase();

    const connection = await db.get(
      'SELECT * FROM whatsapp_connections WHERE instance_name = ?',
      [instanceName]
    );

    if (!connection) {
      return res.status(404).json({
        success: false,
        error: 'Instância não encontrada'
      });
    }

    const support = await db.get(
      'SELECT * FROM supports WHERE id = ?',
      [req.user.id]
    );

    if (!support) {
      return res.status(404).json({
        success: false,
        error: 'Suporte não encontrado'
      });
    }

    // Atualizar atendimento
    await db.run(
      `UPDATE attendances
       SET assigned_to = ?, status = 'in_progress', updated_at = CURRENT_TIMESTAMP
       WHERE client_phone = ? AND whatsapp_connection_id = ?`,
      [support.id, chatId.replace('@s.whatsapp.net', ''), connection.id]
    );

    res.json({
      success: true,
      message: 'Conversa assumida com sucesso'
    });

  } catch (error: any) {
    console.error('❌ Erro ao assumir conversa:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Erro ao assumir conversa'
    });
  }
});

// Upload e envio de mídia
router.post('/:instanceName/send-media', authenticate, upload.single('media'), async (req: any, res) => {
  try {
    const { instanceName } = req.params;
    const { chatId, caption } = req.body;
    const file = req.file;

    if (!file) {
      return res.status(400).json({
        success: false,
        error: 'Nenhum arquivo foi enviado'
      });
    }

    if (!chatId) {
      return res.status(400).json({
        success: false,
        error: 'ChatId é obrigatório'
      });
    }

    const db = await getDatabase();

    // Buscar informações do suporte
    const support = await db.get(
      'SELECT * FROM supports WHERE id = ?',
      [req.user.id]
    );

    if (!support) {
      return res.status(404).json({
        success: false,
        error: 'Suporte não encontrado'
      });
    }

    // Construir URL do arquivo
    const fileUrl = `${process.env.BACKEND_URL || 'http://localhost:3001'}/uploads/${file.filename}`;

    // Preparar caption com prefixo
    const prefixedCaption = caption
      ? `SUPORTE - ${support.nome}\n\n${caption}`
      : `SUPORTE - ${support.nome}`;

    // Enviar via Evolution API
    const phone = chatId.includes('@') ? chatId : `${chatId}@s.whatsapp.net`;

    // Detectar tipo de mídia
    let mediaType = 'document';
    if (file.mimetype.startsWith('image/')) mediaType = 'image';
    else if (file.mimetype.startsWith('video/')) mediaType = 'video';
    else if (file.mimetype.startsWith('audio/')) mediaType = 'audio';

    // Enviar usando a Evolution API
    await whatsappService.sendMediaMessage(phone, fileUrl, prefixedCaption);

    // Salvar no banco
    const connection = await db.get(
      'SELECT * FROM whatsapp_connections WHERE instance_name = ?',
      [instanceName]
    );

    if (connection) {
      let attendance = await db.get(
        'SELECT * FROM attendances WHERE client_phone = ? AND whatsapp_connection_id = ?',
        [chatId.replace('@s.whatsapp.net', ''), connection.id]
      );

      if (!attendance) {
        const attendanceId = crypto.randomUUID();
        await db.run(
          `INSERT INTO attendances (id, client_name, client_phone, status, assigned_to, admin_id, whatsapp_connection_id)
           VALUES (?, ?, ?, ?, ?, ?, ?)`,
          [
            attendanceId,
            chatId.split('@')[0],
            chatId.replace('@s.whatsapp.net', ''),
            'in_progress',
            support.id,
            support.admin_id,
            connection.id
          ]
        );
        attendance = { id: attendanceId };
      }

      // Salvar mensagem
      await db.run(
        `INSERT INTO messages (id, room_id, sender_id, sender_type, content, message_type, media_url, admin_id)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          crypto.randomUUID(),
          attendance.id,
          support.id,
          'support',
          caption || '[Mídia enviada]',
          mediaType,
          fileUrl,
          support.admin_id
        ]
      );
    }

    res.json({
      success: true,
      message: 'Mídia enviada com sucesso',
      fileUrl
    });

  } catch (error: any) {
    console.error('❌ Erro ao enviar mídia:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Erro ao enviar mídia'
    });
  }
});

export default router;

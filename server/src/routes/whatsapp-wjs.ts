import express from 'express';
import { whatsappService } from '../services/whatsapp';
import jwt from 'jsonwebtoken';

const router = express.Router();

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

// Conectar WhatsApp - Criar nova instância
router.post('/connect', authenticate, async (req: any, res) => {
  try {
    const userEmail = req.user.email || req.body.email;

    if (!userEmail) {
      return res.status(400).json({
        success: false,
        error: 'Email do usuário não fornecido'
      });
    }

    const result = await whatsappService.createUserInstance(userEmail);
    res.json({
      success: true,
      ...result
    });
  } catch (error: any) {
    console.error('Erro ao conectar WhatsApp:', error);
    res.status(500).json({
      success: false,
      error: error.response?.data?.message || error.message || 'Erro ao conectar'
    });
  }
});

// Status da conexão de uma instância
router.get('/status/:instanceName?', async (req, res) => {
  try {
    const instanceName = req.params.instanceName || req.query.instance as string;

    if (!instanceName) {
      const status = whatsappService.getStatus();
      return res.json({ success: true, status });
    }

    const status = await whatsappService.getInstanceStatus(instanceName);
    res.json({ success: true, ...status });
  } catch (error) {
    console.error('Erro ao verificar status:', error);
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Erro desconhecido'
    });
  }
});

// Obter QR Code de uma instância
router.get('/qrcode/:instanceName', async (req, res) => {
  try {
    const { instanceName } = req.params;

    if (!instanceName) {
      return res.status(400).json({
        success: false,
        error: 'Nome da instância não fornecido'
      });
    }

    const result = await whatsappService.getInstanceQRCode(instanceName);
    res.json({ success: true, ...result });
  } catch (error: any) {
    console.error('Erro ao buscar QR code:', error);
    res.status(500).json({
      success: false,
      error: error.response?.data?.message || error.message || 'Erro ao buscar QR Code'
    });
  }
});

// Enviar mensagem
router.post('/send-message', async (req, res) => {
  try {
    const { number, message } = req.body;

    if (!number || !message) {
      return res.status(400).json({ 
        success: false, 
        error: 'Número e mensagem são obrigatórios' 
      });
    }

    await whatsappService.sendMessage(number, message);
    res.json({ success: true, message: 'Mensagem enviada com sucesso' });
  } catch (error) {
    console.error('Erro ao enviar mensagem:', error);
    res.status(500).json({ 
      success: false, 
      error: error instanceof Error ? error.message : 'Erro ao enviar mensagem' 
    });
  }
});

// Listar chats
router.get('/chats', async (req, res) => {
  try {
    const chats = await whatsappService.getChats();
    res.json({ success: true, chats });
  } catch (error) {
    console.error('Erro ao buscar chats:', error);
    res.status(500).json({ 
      success: false, 
      error: error instanceof Error ? error.message : 'Erro ao buscar chats' 
    });
  }
});

// Listar contatos
router.get('/contacts', async (req, res) => {
  try {
    const contacts = await whatsappService.getContacts();
    res.json({ success: true, contacts });
  } catch (error) {
    console.error('Erro ao buscar contatos:', error);
    res.status(500).json({ 
      success: false, 
      error: error instanceof Error ? error.message : 'Erro ao buscar contatos' 
    });
  }
});

// Desconectar instância
router.post('/disconnect/:instanceName', authenticate, async (req, res) => {
  try {
    const { instanceName } = req.params;

    if (!instanceName) {
      return res.status(400).json({
        success: false,
        error: 'Nome da instância não fornecido'
      });
    }

    await whatsappService.disconnectInstance(instanceName);
    res.json({ success: true, message: 'Instância desconectada com sucesso' });
  } catch (error: any) {
    console.error('Erro ao desconectar:', error);
    res.status(500).json({
      success: false,
      error: error.response?.data?.message || error.message || 'Erro ao desconectar'
    });
  }
});

// Deletar instância
router.delete('/instance/:instanceName', authenticate, async (req, res) => {
  try {
    const { instanceName } = req.params;

    if (!instanceName) {
      return res.status(400).json({
        success: false,
        error: 'Nome da instância não fornecido'
      });
    }

    await whatsappService.deleteUserInstance(instanceName);
    res.json({ success: true, message: 'Instância deletada com sucesso' });
  } catch (error: any) {
    console.error('Erro ao deletar instância:', error);
    res.status(500).json({
      success: false,
      error: error.response?.data?.message || error.message || 'Erro ao deletar instância'
    });
  }
});

export default router;

import express from 'express';
import { whatsappService } from '../services/whatsapp';

const router = express.Router();

// Status da conexão
router.get('/status', async (req, res) => {
  try {
    const status = whatsappService.getStatus();
    res.json({ success: true, status });
  } catch (error) {
    console.error('Erro ao verificar status:', error);
    res.status(500).json({ 
      success: false, 
      error: error instanceof Error ? error.message : 'Erro desconhecido' 
    });
  }
});

// Obter QR Code
router.get('/qrcode', async (req, res) => {
  try {
    const qrCode = whatsappService.getQRCode();
    if (!qrCode) {
      return res.json({ success: true, qrCode: null, message: 'QR Code não disponível' });
    }
    res.json({ success: true, qrCode });
  } catch (error) {
    console.error('Erro ao buscar QR code:', error);
    res.status(500).json({ 
      success: false, 
      error: error instanceof Error ? error.message : 'Erro desconhecido' 
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

// Desconectar
router.post('/disconnect', async (req, res) => {
  try {
    await whatsappService.disconnect();
    res.json({ success: true, message: 'WhatsApp desconectado com sucesso' });
  } catch (error) {
    console.error('Erro ao desconectar:', error);
    res.status(500).json({ 
      success: false, 
      error: error instanceof Error ? error.message : 'Erro ao desconectar' 
    });
  }
});

export default router;

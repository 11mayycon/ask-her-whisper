import { Router } from 'express';
import { getDatabase } from '../config/sqlite';
import { randomUUID } from 'crypto';

const router = Router();

// Login de suporte por matrícula
router.post('/login', async (req, res) => {
  try {
    const { matricula } = req.body;

    if (!matricula || !matricula.trim()) {
      return res.status(400).json({ error: 'Matrícula é obrigatória' });
    }

    const db = await getDatabase();

    // Buscar usuário de suporte pela matrícula
    const supportUser = await db.get(
      "SELECT * FROM support_users WHERE matricula = ? AND is_active = 1",
      [matricula.trim().toUpperCase()]
    );

    if (!supportUser) {
      return res.status(404).json({
        success: false,
        error: 'Matrícula não encontrada ou usuário inativo'
      });
    }

    // Buscar salas vinculadas ao usuário de suporte
    const rooms = await db.all(
      `SELECT sr.*,
        (SELECT COUNT(*) FROM messages WHERE room_id = sr.id AND sender_type = 'customer') as unread_count
       FROM support_rooms sr
       WHERE sr.assigned_to = ?
       ORDER BY sr.updated_at DESC`,
      [supportUser.user_id]
    );

    res.json({
      success: true,
      supportUser: {
        id: supportUser.id,
        user_id: supportUser.user_id,
        full_name: supportUser.full_name,
        email: supportUser.email,
        phone: supportUser.phone,
        matricula: supportUser.matricula,
        max_concurrent_chats: supportUser.max_concurrent_chats
      },
      rooms: rooms || []
    });

  } catch (error) {
    console.error('Erro ao fazer login de suporte:', error);
    res.status(500).json({
      success: false,
      error: 'Erro ao processar login'
    });
  }
});

// Listar usuários de suporte
router.get('/users', async (req, res) => {
  try {
    const db = await getDatabase();
    const users = await db.all(
      "SELECT * FROM support_users ORDER BY created_at DESC"
    );
    res.json(users);
  } catch (error) {
    console.error('Erro ao buscar usuários:', error);
    res.status(500).json({ error: 'Erro ao buscar usuários de suporte' });
  }
});

// Criar usuário de suporte
router.post('/users', async (req, res) => {
  try {
    const { user_id, full_name, email, phone, matricula } = req.body;

    if (!full_name || !email || !matricula) {
      return res.status(400).json({ error: 'Nome, email e matrícula são obrigatórios' });
    }

    const db = await getDatabase();

    // Verificar se já existe
    const existing = await db.get(
      "SELECT id FROM support_users WHERE email = ? OR matricula = ?",
      [email, matricula]
    );

    if (existing) {
      return res.status(409).json({ error: 'Email ou matrícula já cadastrados', code: '23505' });
    }

    const id = randomUUID();
    const supportUserId = user_id || randomUUID();

    await db.run(
      "INSERT INTO support_users (id, user_id, full_name, email, phone, matricula, is_active) VALUES (?, ?, ?, ?, ?, ?, 1)",
      [id, supportUserId, full_name, email, phone || null, matricula]
    );

    const newUser = await db.get("SELECT * FROM support_users WHERE id = ?", [id]);
    res.status(201).json(newUser);
  } catch (error) {
    console.error('Erro ao criar usuário:', error);
    res.status(500).json({ error: 'Erro ao criar usuário de suporte' });
  }
});

// Atualizar usuário de suporte
router.put('/users/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { full_name, email, phone, matricula } = req.body;

    const db = await getDatabase();

    await db.run(
      "UPDATE support_users SET full_name = ?, email = ?, phone = ?, matricula = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?",
      [full_name, email, phone || null, matricula, id]
    );

    const updatedUser = await db.get("SELECT * FROM support_users WHERE id = ?", [id]);
    res.json(updatedUser);
  } catch (error) {
    console.error('Erro ao atualizar usuário:', error);
    res.status(500).json({ error: 'Erro ao atualizar usuário de suporte' });
  }
});

// Alternar status ativo/inativo
router.patch('/users/:id/toggle', async (req, res) => {
  try {
    const { id } = req.params;
    const db = await getDatabase();

    const user = await db.get("SELECT is_active FROM support_users WHERE id = ?", [id]);
    const newStatus = user.is_active ? 0 : 1;

    await db.run(
      "UPDATE support_users SET is_active = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?",
      [newStatus, id]
    );

    const updatedUser = await db.get("SELECT * FROM support_users WHERE id = ?", [id]);
    res.json(updatedUser);
  } catch (error) {
    console.error('Erro ao alterar status:', error);
    res.status(500).json({ error: 'Erro ao alterar status do usuário' });
  }
});

// Deletar usuário de suporte
router.delete('/users/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const db = await getDatabase();

    await db.run("DELETE FROM support_users WHERE id = ?", [id]);
    res.json({ success: true });
  } catch (error) {
    console.error('Erro ao deletar usuário:', error);
    res.status(500).json({ error: 'Erro ao deletar usuário de suporte' });
  }
});

// Listar salas
router.get('/rooms', async (req, res) => {
  try {
    const db = await getDatabase();
    const rooms = await db.all(
      "SELECT * FROM support_rooms ORDER BY created_at DESC"
    );
    res.json(rooms);
  } catch (error) {
    console.error('Erro ao buscar salas:', error);
    res.status(500).json({ error: 'Erro ao buscar salas' });
  }
});

export default router;

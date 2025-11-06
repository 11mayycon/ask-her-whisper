import { Router } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { randomUUID } from 'crypto';
import { getDatabase } from '../config/sqlite';

const router = Router();

// Signup
router.post('/signup', async (req, res) => {
  try {
    const { email, password, full_name } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email e senha são obrigatórios' });
    }

    const db = await getDatabase();

    // Verificar se usuário já existe
    const existingUser = await db.get(
      'SELECT id FROM users WHERE email = ?',
      [email]
    );

    if (existingUser) {
      return res.status(400).json({ error: 'Usuário já existe' });
    }

    // Hash da senha
    const hashedPassword = await bcrypt.hash(password, 10);

    // Criar usuário
    const userId = randomUUID();
    await db.run(
      'INSERT INTO users (id, email, password, full_name) VALUES (?, ?, ?, ?)',
      [userId, email, hashedPassword, full_name || email]
    );

    // Criar role padrão
    const roleId = randomUUID();
    await db.run(
      'INSERT INTO user_roles (id, user_id, role) VALUES (?, ?, ?)',
      [roleId, userId, 'user']
    );

    // Criar perfil
    const profileId = randomUUID();
    await db.run(
      'INSERT INTO profiles (id, user_id, full_name) VALUES (?, ?, ?)',
      [profileId, userId, full_name || email]
    );

    // Gerar token
    const token = jwt.sign(
      {
        userId: userId,
        email: email,
        role: 'user',
        roles: ['user']
      },
      process.env.JWT_SECRET || 'your-secret-key',
      { expiresIn: '7d' }
    );

    res.status(201).json({
      user: {
        id: userId,
        email: email,
        full_name: full_name || email
      },
      token,
      role: 'user',
      roles: ['user']
    });
  } catch (error) {
    console.error('Signup error:', error);
    res.status(500).json({ error: 'Erro ao criar conta' });
  }
});

// Login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email e senha são obrigatórios' });
    }

    const db = await getDatabase();

    // Buscar usuário
    const user = await db.get(
      'SELECT id, email, password, full_name FROM users WHERE email = ?',
      [email]
    );

    if (!user) {
      return res.status(401).json({ error: 'Email ou senha incorretos' });
    }

    // Verificar senha
    const validPassword = await bcrypt.compare(password, user.password);

    if (!validPassword) {
      return res.status(401).json({ error: 'Email ou senha incorretos' });
    }

    // Buscar roles do usuário
    const roles = await db.all(
      'SELECT role FROM user_roles WHERE user_id = ?',
      [user.id]
    );

    const userRoles = roles.map(r => r.role);
    const primaryRole = userRoles.includes('super_admin') ? 'super_admin' :
                        userRoles.includes('admin') ? 'admin' :
                        userRoles.includes('support') ? 'support' : 'user';

    // Gerar token JWT
    const token = jwt.sign(
      {
        userId: user.id,
        email: user.email,
        role: primaryRole,
        roles: userRoles
      },
      process.env.JWT_SECRET || 'your-secret-key',
      { expiresIn: '7d' }
    );

    res.json({
      user: {
        id: user.id,
        email: user.email,
        full_name: user.full_name
      },
      token,
      role: primaryRole,
      roles: userRoles
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Erro ao fazer login' });
  }
});

// Login para suportes (apenas matrícula)
router.post('/support/login', async (req, res) => {
  try {
    const { matricula } = req.body;

    if (!matricula) {
      return res.status(400).json({ error: 'Matrícula é obrigatória' });
    }

    const db = await getDatabase();

    // Buscar suporte na nova estrutura
    const support = await db.get(
      'SELECT s.id, s.nome, s.matricula, s.admin_id, a.nome as admin_nome FROM supports s JOIN admins a ON s.admin_id = a.id WHERE s.matricula = ?',
      [matricula]
    );

    if (!support) {
      return res.status(401).json({ error: 'Matrícula não encontrada ou usuário inativo' });
    }

    // Gerar token JWT para suporte
    const token = jwt.sign(
      {
        supportId: support.id,
        matricula: support.matricula,
        adminId: support.admin_id,
        role: 'support',
        type: 'support'
      },
      process.env.JWT_SECRET || 'your-secret-key',
      { expiresIn: '7d' }
    );

    res.json({
      support: {
        id: support.id,
        matricula: support.matricula,
        nome: support.nome,
        admin_id: support.admin_id,
        admin_nome: support.admin_nome
      },
      token,
      role: 'support',
      type: 'support'
    });
  } catch (error) {
    console.error('Support login error:', error);
    res.status(500).json({ error: 'Erro ao fazer login' });
  }
});

// Get current user
router.get('/me', async (req, res) => {
  try {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
      return res.status(401).json({ error: 'Token não fornecido' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key') as any;

    const db = await getDatabase();
    const user = await db.get(
      'SELECT id, email, full_name, created_at FROM users WHERE id = ?',
      [decoded.userId]
    );

    if (!user) {
      return res.status(404).json({ error: 'Usuário não encontrado' });
    }

    const roles = await db.all(
      'SELECT role FROM user_roles WHERE user_id = ?',
      [user.id]
    );

    const userRoles = roles.map(r => r.role);
    const primaryRole = userRoles.includes('super_admin') ? 'super_admin' :
                        userRoles.includes('admin') ? 'admin' :
                        userRoles.includes('support') ? 'support' : 'user';

    res.json({
      user,
      role: primaryRole,
      roles: userRoles
    });
  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({ error: 'Erro ao buscar usuário' });
  }
});

// Get current user subscription
router.get('/subscription', async (req, res) => {
  try {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
      return res.status(401).json({ error: 'Token não fornecido' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key') as any;

    const db = await getDatabase();
    const subscription = await db.get(
      'SELECT * FROM subscriptions WHERE user_id = ?',
      [decoded.userId]
    );

    if (!subscription) {
      return res.status(404).json({ error: 'Assinatura não encontrada' });
    }

    res.json(subscription);
  } catch (error) {
    console.error('Get subscription error:', error);
    res.status(500).json({ error: 'Erro ao buscar assinatura' });
  }
});

// Listar todos os usuários/subscriptions
router.get('/users', async (req, res) => {
  try {
    const db = await getDatabase();
    const subscriptions = await db.all(`
      SELECT s.*, u.email, u.full_name
      FROM subscriptions s
      LEFT JOIN users u ON s.user_id = u.id
      ORDER BY s.created_at DESC
    `);
    res.json(subscriptions);
  } catch (error) {
    console.error('Erro ao buscar usuários:', error);
    res.status(500).json({ error: 'Erro ao buscar usuários' });
  }
});

// Criar admin
router.post('/admin/create', async (req, res) => {
  try {
    const { full_name, email, password, role, planName, days } = req.body;

    if (!email || !password || !full_name) {
      return res.status(400).json({ error: 'Campos obrigatórios faltando' });
    }

    const db = await getDatabase();

    // Verificar se usuário já existe
    const existingUser = await db.get(
      'SELECT id FROM users WHERE email = ?',
      [email]
    );

    if (existingUser) {
      return res.status(400).json({ error: 'Usuário já existe' });
    }

    // Hash da senha
    const hashedPassword = await bcrypt.hash(password, 10);

    // Criar usuário
    const userId = randomUUID();
    await db.run(
      'INSERT INTO users (id, email, password, full_name) VALUES (?, ?, ?, ?)',
      [userId, email, hashedPassword, full_name]
    );

    // Criar role
    const roleId = randomUUID();
    await db.run(
      'INSERT INTO user_roles (id, user_id, role) VALUES (?, ?, ?)',
      [roleId, userId, role || 'admin']
    );

    // Criar perfil
    const profileId = randomUUID();
    await db.run(
      'INSERT INTO profiles (id, user_id, full_name) VALUES (?, ?, ?)',
      [profileId, userId, full_name]
    );

    // Criar subscription
    const subscriptionId = randomUUID();
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + (days || 30));

    await db.run(
      'INSERT INTO subscriptions (id, user_id, email, full_name, status, expires_at) VALUES (?, ?, ?, ?, ?, ?)',
      [subscriptionId, userId, email, full_name, 'active', expiresAt.toISOString()]
    );

    res.status(201).json({ success: true, userId });
  } catch (error) {
    console.error('Erro ao criar admin:', error);
    res.status(500).json({ error: 'Erro ao criar administrador' });
  }
});

// Deletar admin
router.post('/admin/delete', async (req, res) => {
  try {
    const { userId } = req.body;

    const db = await getDatabase();

    await db.run('DELETE FROM users WHERE id = ?', [userId]);

    res.json({ success: true });
  } catch (error) {
    console.error('Erro ao deletar admin:', error);
    res.status(500).json({ error: 'Erro ao deletar administrador' });
  }
});

// Atualizar subscription
router.put('/subscriptions/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const { status, expires_at } = req.body;

    const db = await getDatabase();

    await db.run(
      'UPDATE subscriptions SET status = ?, expires_at = ?, updated_at = CURRENT_TIMESTAMP WHERE user_id = ?',
      [status, expires_at, userId]
    );

    const updated = await db.get('SELECT * FROM subscriptions WHERE user_id = ?', [userId]);
    res.json(updated);
  } catch (error) {
    console.error('Erro ao atualizar subscription:', error);
    res.status(500).json({ error: 'Erro ao atualizar subscription' });
  }
});

// Get all subscriptions (for admin)
router.get('/subscriptions', async (req, res) => {
  try {
    const db = await getDatabase();
    const subscriptions = await db.all(`
      SELECT s.*, u.email, u.full_name
      FROM subscriptions s
      LEFT JOIN users u ON s.user_id = u.id
      ORDER BY s.created_at DESC
    `);
    res.json(subscriptions);
  } catch (error) {
    console.error('Erro ao buscar subscriptions:', error);
    res.status(500).json({ error: 'Erro ao buscar subscriptions' });
  }
});

export default router;

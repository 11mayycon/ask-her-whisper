"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const sqlite_1 = require("../config/sqlite");
const router = (0, express_1.Router)();
// Dashboard stats
router.get('/stats', async (req, res) => {
    try {
        const db = await (0, sqlite_1.getDatabase)();
        // Buscar atendimentos ativos pela IA
        const iaAtendendo = await db.get("SELECT COUNT(*) as count FROM attendances WHERE status = 'in_progress' AND assigned_to = 'ai'");
        // Buscar atendimentos finalizados (total)
        const finalizados = await db.get("SELECT COUNT(*) as count FROM attendances WHERE status = 'finished'");
        // Buscar atendimentos dos últimos 15 dias
        const quinzeDiasAtras = new Date();
        quinzeDiasAtras.setDate(quinzeDiasAtras.getDate() - 15);
        const ultimos15Dias = await db.get("SELECT COUNT(*) as count FROM attendances WHERE created_at >= ?", [quinzeDiasAtras.toISOString()]);
        // Buscar agentes online (suportes ativos)
        const agentesOnline = await db.get("SELECT COUNT(*) as count FROM supports");
        // Buscar atendimentos aguardando
        const aguardando = await db.get("SELECT COUNT(*) as count FROM attendances WHERE status = 'waiting'");
        // Buscar atendimentos em atendimento
        const emAtendimento = await db.get("SELECT COUNT(*) as count FROM attendances WHERE status = 'in_progress'");
        // Buscar atendimentos finalizados hoje
        const hoje = new Date();
        hoje.setHours(0, 0, 0, 0);
        const finalizadosHoje = await db.get("SELECT COUNT(*) as count FROM attendances WHERE status = 'finished' AND finished_at >= ?", [hoje.toISOString()]);
        res.json({
            iaAtendendo: iaAtendendo?.count || 0,
            finalizados: finalizados?.count || 0,
            ultimos15Dias: ultimos15Dias?.count || 0,
            agentesOnline: agentesOnline?.count || 0,
            aguardando: aguardando?.count || 0,
            emAtendimento: emAtendimento?.count || 0,
            finalizadosHoje: finalizadosHoje?.count || 0,
        });
    }
    catch (error) {
        console.error('Erro ao buscar stats:', error);
        res.status(500).json({ error: 'Erro ao buscar estatísticas' });
    }
});
// Buscar atividades recentes
router.get('/activities', async (req, res) => {
    try {
        const db = await (0, sqlite_1.getDatabase)();
        const activities = await db.all("SELECT * FROM activities ORDER BY created_at DESC LIMIT 5");
        res.json(activities);
    }
    catch (error) {
        console.error('Erro ao buscar atividades:', error);
        res.status(500).json({ error: 'Erro ao buscar atividades' });
    }
});
// Buscar salas de suporte
router.get('/support-rooms', async (req, res) => {
    try {
        const db = await (0, sqlite_1.getDatabase)();
        const rooms = await db.all(`
      SELECT
        sr.*,
        (SELECT COUNT(*) FROM messages WHERE room_id = sr.id) as message_count,
        (SELECT COUNT(*) FROM attendances WHERE room_id = sr.id) as attendance_count
      FROM support_rooms sr
      ORDER BY sr.created_at DESC
    `);
        res.json(rooms);
    }
    catch (error) {
        console.error('Erro ao buscar salas:', error);
        res.status(500).json({ error: 'Erro ao buscar salas' });
    }
});
// Criar sala de suporte
router.post('/support-rooms', async (req, res) => {
    try {
        console.log('📝 Requisição para criar sala:', req.body);
        const db = await (0, sqlite_1.getDatabase)();
        const { randomUUID } = await Promise.resolve().then(() => __importStar(require('crypto')));
        const roomId = randomUUID();
        // Suporta dois formatos:
        // 1. Criação de sala de atendimento (com customer_phone)
        // 2. Criação de sala de suporte gerenciada (com name)
        const { 
        // Formato 1: Sala de atendimento
        customer_name, customer_phone, assigned_to, status, 
        // Formato 2: Sala de suporte
        name, description, max_members, support_user_id, admin_owner_id } = req.body;
        // Se tem 'name', é uma sala de suporte gerenciada
        if (name) {
            console.log('📋 Criando sala de suporte gerenciada');
            if (!name.trim()) {
                return res.status(400).json({ error: 'Nome da sala é obrigatório' });
            }
            // Gerar um telefone fictício para a sala (baseado no timestamp)
            const fakePhone = `SALA_${Date.now()}`;
            await db.run(`INSERT INTO support_rooms (id, customer_phone, customer_name, status, assigned_to, created_at, updated_at)
         VALUES (?, ?, ?, ?, ?, datetime('now'), datetime('now'))`, [roomId, fakePhone, name, 'active', support_user_id || null]);
            const newRoom = await db.get('SELECT * FROM support_rooms WHERE id = ?', [roomId]);
            console.log('✅ Sala de suporte criada:', newRoom);
            return res.json(newRoom);
        }
        // Senão, é uma sala de atendimento (requer customer_phone)
        if (!customer_phone || customer_phone.trim() === '') {
            console.error('❌ Telefone do cliente não fornecido');
            return res.status(400).json({
                error: 'Telefone do cliente ou nome da sala é obrigatório',
                received: req.body
            });
        }
        // Validar formato do telefone
        const phoneClean = customer_phone.replace(/\D/g, '');
        if (phoneClean.length < 10) {
            console.error('❌ Telefone inválido:', customer_phone);
            return res.status(400).json({
                error: 'Telefone do cliente deve ter pelo menos 10 dígitos',
                received: customer_phone
            });
        }
        console.log('💾 Criando sala de atendimento:', {
            roomId,
            customer_phone: phoneClean,
            customer_name: customer_name || 'Cliente',
            status: status || 'waiting',
            assigned_to: assigned_to || null
        });
        await db.run(`INSERT INTO support_rooms (id, customer_phone, customer_name, status, assigned_to, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, datetime('now'), datetime('now'))`, [roomId, phoneClean, customer_name || 'Cliente', status || 'waiting', assigned_to || null]);
        const newRoom = await db.get('SELECT * FROM support_rooms WHERE id = ?', [roomId]);
        console.log('✅ Sala de atendimento criada:', newRoom);
        res.json(newRoom);
    }
    catch (error) {
        console.error('❌ Erro ao criar sala:', error);
        res.status(500).json({
            error: 'Erro ao criar sala',
            details: error.message
        });
    }
});
// Deletar sala de suporte
router.delete('/support-rooms/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const db = await (0, sqlite_1.getDatabase)();
        await db.run('DELETE FROM support_rooms WHERE id = ?', [id]);
        res.json({ success: true });
    }
    catch (error) {
        console.error('Erro ao deletar sala:', error);
        res.status(500).json({ error: 'Erro ao deletar sala' });
    }
});
// Buscar usuários de suporte
// ============================================
// APIS PARA GERENCIAR SUPORTES (NOVA ESTRUTURA)
// ============================================
// Função para gerar matrícula automática de 6 dígitos
async function generateMatricula(db) {
    let matricula;
    let exists = true;
    while (exists) {
        // Gerar número aleatório de 6 dígitos
        matricula = Math.floor(100000 + Math.random() * 900000).toString();
        // Verificar se já existe
        const existing = await db.get('SELECT id FROM supports WHERE matricula = ?', [matricula]);
        exists = !!existing;
    }
    return matricula;
}
// Listar suportes
router.get('/supports', async (req, res) => {
    try {
        const db = await (0, sqlite_1.getDatabase)();
        const supports = await db.all(`
      SELECT s.*, a.nome as admin_nome 
      FROM supports s 
      LEFT JOIN admins a ON s.admin_id = a.id 
      ORDER BY s.nome
    `);
        res.json(supports);
    }
    catch (error) {
        console.error('Erro ao buscar suportes:', error);
        res.status(500).json({ error: 'Erro ao buscar suportes' });
    }
});
// Criar suporte
router.post('/supports', async (req, res) => {
    try {
        const { nome, admin_id } = req.body;
        if (!nome || !admin_id) {
            return res.status(400).json({ error: 'Nome e admin_id são obrigatórios' });
        }
        const db = await (0, sqlite_1.getDatabase)();
        // Verificar se o admin existe
        const admin = await db.get('SELECT id FROM admins WHERE id = ?', [admin_id]);
        if (!admin) {
            return res.status(400).json({ error: 'Admin não encontrado' });
        }
        // Gerar matrícula automática
        const matricula = await generateMatricula(db);
        // Criar suporte
        const result = await db.run(`
      INSERT INTO supports (nome, matricula, admin_id) 
      VALUES (?, ?, ?)
    `, [nome, matricula, admin_id]);
        // Buscar o suporte criado
        const newSupport = await db.get(`
      SELECT s.*, a.nome as admin_nome 
      FROM supports s 
      LEFT JOIN admins a ON s.admin_id = a.id 
      WHERE s.id = ?
    `, [result.lastID]);
        res.status(201).json(newSupport);
    }
    catch (error) {
        console.error('Erro ao criar suporte:', error);
        res.status(500).json({ error: 'Erro ao criar suporte' });
    }
});
// Atualizar suporte
router.put('/supports/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const { nome, admin_id } = req.body;
        if (!nome || !admin_id) {
            return res.status(400).json({ error: 'Nome e admin_id são obrigatórios' });
        }
        const db = await (0, sqlite_1.getDatabase)();
        // Verificar se o suporte existe
        const support = await db.get('SELECT id FROM supports WHERE id = ?', [id]);
        if (!support) {
            return res.status(404).json({ error: 'Suporte não encontrado' });
        }
        // Verificar se o admin existe
        const admin = await db.get('SELECT id FROM admins WHERE id = ?', [admin_id]);
        if (!admin) {
            return res.status(400).json({ error: 'Admin não encontrado' });
        }
        // Atualizar suporte
        await db.run(`
      UPDATE supports 
      SET nome = ?, admin_id = ?, updated_at = CURRENT_TIMESTAMP 
      WHERE id = ?
    `, [nome, admin_id, id]);
        // Buscar o suporte atualizado
        const updatedSupport = await db.get(`
      SELECT s.*, a.nome as admin_nome 
      FROM supports s 
      LEFT JOIN admins a ON s.admin_id = a.id 
      WHERE s.id = ?
    `, [id]);
        res.json(updatedSupport);
    }
    catch (error) {
        console.error('Erro ao atualizar suporte:', error);
        res.status(500).json({ error: 'Erro ao atualizar suporte' });
    }
});
// Deletar suporte
router.delete('/supports/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const db = await (0, sqlite_1.getDatabase)();
        // Verificar se o suporte existe
        const support = await db.get('SELECT id FROM supports WHERE id = ?', [id]);
        if (!support) {
            return res.status(404).json({ error: 'Suporte não encontrado' });
        }
        // Deletar suporte
        await db.run('DELETE FROM supports WHERE id = ?', [id]);
        res.json({ message: 'Suporte deletado com sucesso' });
    }
    catch (error) {
        console.error('Erro ao deletar suporte:', error);
        res.status(500).json({ error: 'Erro ao deletar suporte' });
    }
});
// ============================================
// APIS PARA GERENCIAR ADMINS
// ============================================
// Listar admins
router.get('/admins', async (req, res) => {
    try {
        const db = await (0, sqlite_1.getDatabase)();
        const admins = await db.all(`
      SELECT id, nome, email, cpf, role, created_at, updated_at 
      FROM admins 
      ORDER BY nome
    `);
        res.json(admins);
    }
    catch (error) {
        console.error('Erro ao buscar admins:', error);
        res.status(500).json({ error: 'Erro ao buscar admins' });
    }
});
// Criar admin
router.post('/admins', async (req, res) => {
    try {
        const { nome, email, senha, cpf, role = 'admin' } = req.body;
        if (!nome || !email || !senha) {
            return res.status(400).json({ error: 'Nome, email e senha são obrigatórios' });
        }
        const db = await (0, sqlite_1.getDatabase)();
        // Verificar se o email já existe
        const existingAdmin = await db.get('SELECT id FROM admins WHERE email = ?', [email]);
        if (existingAdmin) {
            return res.status(400).json({ error: 'Email já está em uso' });
        }
        // Criar admin (senha será hasheada no frontend ou middleware)
        const result = await db.run(`
      INSERT INTO admins (nome, email, senha, cpf, role) 
      VALUES (?, ?, ?, ?, ?)
    `, [nome, email, senha, cpf, role]);
        // Buscar o admin criado (sem a senha)
        const newAdmin = await db.get(`
      SELECT id, nome, email, cpf, role, created_at, updated_at 
      FROM admins 
      WHERE id = ?
    `, [result.lastID]);
        res.status(201).json(newAdmin);
    }
    catch (error) {
        console.error('Erro ao criar admin:', error);
        res.status(500).json({ error: 'Erro ao criar admin' });
    }
});
// Deletar admin
router.delete('/admins/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const db = await (0, sqlite_1.getDatabase)();
        // Verificar se o admin existe
        const admin = await db.get('SELECT id FROM admins WHERE id = ?', [id]);
        if (!admin) {
            return res.status(404).json({ error: 'Admin não encontrado' });
        }
        // Verificar se há suportes vinculados
        const linkedSupports = await db.get('SELECT COUNT(*) as count FROM supports WHERE admin_id = ?', [id]);
        if (linkedSupports.count > 0) {
            return res.status(400).json({ error: 'Não é possível deletar admin com suportes vinculados' });
        }
        // Deletar admin
        await db.run('DELETE FROM admins WHERE id = ?', [id]);
        res.json({ message: 'Admin deletado com sucesso' });
    }
    catch (error) {
        console.error('Erro ao deletar admin:', error);
        res.status(500).json({ error: 'Erro ao deletar admin' });
    }
});
// ============================================
// APIS LEGADAS (MANTER COMPATIBILIDADE)
// ============================================
router.get('/support-users', async (req, res) => {
    try {
        const db = await (0, sqlite_1.getDatabase)();
        const users = await db.all('SELECT * FROM support_users WHERE is_active = 1 ORDER BY full_name');
        res.json(users);
    }
    catch (error) {
        console.error('Erro ao buscar usuários de suporte:', error);
        res.status(500).json({ error: 'Erro ao buscar usuários de suporte' });
    }
});
// Buscar instâncias WhatsApp
router.get('/whatsapp-instances', async (req, res) => {
    try {
        const db = await (0, sqlite_1.getDatabase)();
        const instances = await db.all('SELECT * FROM whatsapp_connections');
        res.json(instances);
    }
    catch (error) {
        console.error('Erro ao buscar instâncias WhatsApp:', error);
        res.status(500).json({ error: 'Erro ao buscar instâncias WhatsApp' });
    }
});
// Buscar instância WhatsApp do admin/suporte logado
router.get('/whatsapp-instance', async (req, res) => {
    try {
        const db = await (0, sqlite_1.getDatabase)();
        // Buscar a primeira instância conectada
        // TODO: Vincular com o admin/suporte específico quando implementar multi-admin
        const instance = await db.get('SELECT * FROM whatsapp_connections WHERE status = ? ORDER BY created_at DESC LIMIT 1', ['connected']);
        if (!instance) {
            // Se não houver instância conectada, buscar qualquer uma
            const anyInstance = await db.get('SELECT * FROM whatsapp_connections ORDER BY created_at DESC LIMIT 1');
            return res.json({ instance: anyInstance });
        }
        res.json({ instance });
    }
    catch (error) {
        console.error('Erro ao buscar instância WhatsApp do admin:', error);
        res.status(500).json({ error: 'Erro ao buscar instância WhatsApp' });
    }
});
exports.default = router;

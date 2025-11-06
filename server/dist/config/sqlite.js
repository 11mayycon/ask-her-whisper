"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getDatabase = getDatabase;
exports.closeDatabase = closeDatabase;
const sqlite3_1 = __importDefault(require("sqlite3"));
const sqlite_1 = require("sqlite");
const path_1 = __importDefault(require("path"));
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const crypto_1 = require("crypto");
let db = null;
async function getDatabase() {
    if (db) {
        return db;
    }
    const dbPath = process.env.SQLITE_DB_PATH || path_1.default.join(__dirname, '../../data/isa.db');
    db = await (0, sqlite_1.open)({
        filename: dbPath,
        driver: sqlite3_1.default.Database
    });
    await initializeDatabase(db);
    return db;
}
async function initializeDatabase(database) {
    // Create users table
    await database.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      email TEXT UNIQUE NOT NULL,
      password TEXT NOT NULL,
      full_name TEXT,
      phone TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);
    // Add phone column if it doesn't exist (migration)
    try {
        await database.exec(`ALTER TABLE users ADD COLUMN phone TEXT`);
    }
    catch (error) {
        // Column already exists, ignore
    }
    // Create user_roles table
    await database.exec(`
    CREATE TABLE IF NOT EXISTS user_roles (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      role TEXT NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    )
  `);
    // Create profiles table
    await database.exec(`
    CREATE TABLE IF NOT EXISTS profiles (
      id TEXT PRIMARY KEY,
      user_id TEXT UNIQUE NOT NULL,
      full_name TEXT,
      avatar_url TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    )
  `);
    // Create whatsapp_connections table
    await database.exec(`
    CREATE TABLE IF NOT EXISTS whatsapp_connections (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      instance_name TEXT UNIQUE NOT NULL,
      phone_number TEXT,
      status TEXT DEFAULT 'disconnected',
      qr_code TEXT,
      connected_at DATETIME,
      disconnected_at DATETIME,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    )
  `);
    // Create support_rooms table
    await database.exec(`
    CREATE TABLE IF NOT EXISTS support_rooms (
      id TEXT PRIMARY KEY,
      customer_phone TEXT NOT NULL,
      customer_name TEXT,
      status TEXT DEFAULT 'waiting',
      assigned_to TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      closed_at DATETIME
    )
  `);
    // Create attendances table
    await database.exec(`
    CREATE TABLE IF NOT EXISTS attendances (
      id TEXT PRIMARY KEY,
      room_id TEXT NOT NULL,
      user_id TEXT,
      assigned_to TEXT,
      status TEXT DEFAULT 'waiting',
      started_at DATETIME,
      finished_at DATETIME,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (room_id) REFERENCES support_rooms(id) ON DELETE CASCADE,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
    )
  `);
    // Create messages table
    await database.exec(`
    CREATE TABLE IF NOT EXISTS messages (
      id TEXT PRIMARY KEY,
      room_id TEXT NOT NULL,
      sender_id TEXT,
      sender_type TEXT NOT NULL,
      content TEXT NOT NULL,
      message_type TEXT DEFAULT 'text',
      media_url TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (room_id) REFERENCES support_rooms(id) ON DELETE CASCADE
    )
  `);
    // Create support_users table
    await database.exec(`
    CREATE TABLE IF NOT EXISTS support_users (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      full_name TEXT,
      email TEXT,
      phone TEXT,
      matricula TEXT UNIQUE,
      is_active INTEGER DEFAULT 1,
      max_concurrent_chats INTEGER DEFAULT 3,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    )
  `);
    // Create admins table
    await database.exec(`
    CREATE TABLE IF NOT EXISTS admins (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      nome TEXT NOT NULL,
      email TEXT UNIQUE NOT NULL,
      senha TEXT NOT NULL,
      cpf TEXT,
      role TEXT DEFAULT 'admin',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);
    // Create supports table
    await database.exec(`
    CREATE TABLE IF NOT EXISTS supports (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      nome TEXT NOT NULL,
      matricula TEXT UNIQUE NOT NULL,
      admin_id INTEGER NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (admin_id) REFERENCES admins(id) ON DELETE CASCADE
    )
  `);
    // Create subscriptions table
    await database.exec(`
    CREATE TABLE IF NOT EXISTS subscriptions (
      id TEXT PRIMARY KEY,
      user_id TEXT UNIQUE NOT NULL,
      email TEXT NOT NULL,
      full_name TEXT,
      status TEXT DEFAULT 'active',
      expires_at DATETIME,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    )
  `);
    // Create activities table
    await database.exec(`
    CREATE TABLE IF NOT EXISTS activities (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      action TEXT NOT NULL,
      description TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    )
  `);
    // Create ai_memory table
    await database.exec(`
    CREATE TABLE IF NOT EXISTS ai_memory (
      id TEXT PRIMARY KEY,
      key TEXT UNIQUE NOT NULL,
      value TEXT NOT NULL,
      category TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);
    // Create payments table
    await database.exec(`
    CREATE TABLE IF NOT EXISTS payments (
      id TEXT PRIMARY KEY,
      user_email TEXT NOT NULL,
      stripe_session_id TEXT UNIQUE NOT NULL,
      stripe_customer_id TEXT,
      stripe_subscription_id TEXT,
      amount INTEGER NOT NULL,
      currency TEXT DEFAULT 'brl',
      status TEXT DEFAULT 'pending',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);
    // Create sales_leads table
    await database.exec(`
    CREATE TABLE IF NOT EXISTS sales_leads (
      phone TEXT PRIMARY KEY,
      name TEXT,
      business_type TEXT,
      current_system TEXT,
      stage TEXT NOT NULL DEFAULT 'initial',
      last_message_at TEXT NOT NULL,
      test_sent_at TEXT,
      email TEXT,
      created_at TEXT DEFAULT (datetime('now')),
      updated_at TEXT DEFAULT (datetime('now'))
    )
  `);
    // Create indexes for sales_leads
    await database.exec(`
    CREATE INDEX IF NOT EXISTS idx_sales_leads_stage ON sales_leads(stage)
  `);
    await database.exec(`
    CREATE INDEX IF NOT EXISTS idx_sales_leads_created ON sales_leads(created_at)
  `);
    // Check if super admin exists, if not create it
    const superAdmin = await database.get('SELECT id FROM users WHERE email = ?', ['maiconsillva2025@gmail.com']);
    if (!superAdmin) {
        console.log('📝 Criando super admin...');
        const userId = (0, crypto_1.randomUUID)();
        const hashedPassword = await bcryptjs_1.default.hash('1285041', 10);
        await database.run('INSERT INTO users (id, email, password, full_name) VALUES (?, ?, ?, ?)', [userId, 'maiconsillva2025@gmail.com', hashedPassword, 'Super Admin']);
        const roleId = (0, crypto_1.randomUUID)();
        await database.run('INSERT INTO user_roles (id, user_id, role) VALUES (?, ?, ?)', [roleId, userId, 'super_admin']);
        const profileId = (0, crypto_1.randomUUID)();
        await database.run('INSERT INTO profiles (id, user_id, full_name) VALUES (?, ?, ?)', [profileId, userId, 'Super Admin']);
        console.log('✅ Super admin criado com sucesso!');
    }
    // Check if AI memory exists, if not create default instructions
    const aiMemory = await database.get('SELECT id FROM ai_memory WHERE key = ?', ['instructions']);
    if (!aiMemory) {
        console.log('🧠 Criando memória padrão da IA...');
        const memoryId = (0, crypto_1.randomUUID)();
        const defaultInstructions = 'Você é a ISA 2.5, assistente virtual inteligente da InovaPro Technology. Seja cordial, profissional e objetiva em suas respostas. Ajude os clientes com informações sobre nossos produtos e serviços.';
        await database.run('INSERT INTO ai_memory (id, key, value, category) VALUES (?, ?, ?, ?)', [memoryId, 'instructions', defaultInstructions, 'system']);
        console.log('✅ Memória padrão da IA criada com sucesso!');
    }
    console.log('✅ Banco de dados SQLite inicializado');
}
async function closeDatabase() {
    if (db) {
        await db.close();
        db = null;
    }
}

-- ============================================
-- REFATORAÇÃO COMPLETA: REMOVER SALAS E IMPLEMENTAR ADMIN-SUPPORT
-- ISA 2.5 -> InovaPro AI - SQLite Version
-- ============================================

-- 1. CRIAR NOVA ESTRUTURA: TABELA ADMINS
-- ============================================

CREATE TABLE admins (
    id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(4))) || '-' || lower(hex(randomblob(2))) || '-4' || substr(lower(hex(randomblob(2))),2) || '-' || substr('89ab',abs(random()) % 4 + 1, 1) || substr(lower(hex(randomblob(2))),2) || '-' || lower(hex(randomblob(6)))),
    nome TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    senha TEXT NOT NULL,
    cpf TEXT UNIQUE,
    role TEXT DEFAULT 'admin' CHECK (role IN ('admin', 'super_admin')),
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 2. CRIAR NOVA ESTRUTURA: TABELA SUPPORTS
-- ============================================

CREATE TABLE supports (
    id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(4))) || '-' || lower(hex(randomblob(2))) || '-4' || substr(lower(hex(randomblob(2))),2) || '-' || substr('89ab',abs(random()) % 4 + 1, 1) || substr(lower(hex(randomblob(2))),2) || '-' || lower(hex(randomblob(6)))),
    nome TEXT NOT NULL,
    matricula TEXT UNIQUE NOT NULL,
    admin_id TEXT NOT NULL REFERENCES admins(id) ON DELETE CASCADE,
    role TEXT DEFAULT 'support',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 3. CRIAR TABELA SUPPORT_USERS TEMPORÁRIA PARA MIGRAÇÃO
-- ============================================

CREATE TABLE IF NOT EXISTS support_users (
    id TEXT PRIMARY KEY,
    full_name TEXT NOT NULL,
    email TEXT NOT NULL UNIQUE,
    phone TEXT,
    matricula TEXT NOT NULL UNIQUE,
    is_active BOOLEAN DEFAULT 1,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 4. MIGRAR DADOS EXISTENTES
-- ============================================

-- Migrar usuários admin existentes da tabela profiles para admins
INSERT INTO admins (id, nome, email, senha, role, created_at)
SELECT 
    p.id,
    COALESCE(p.full_name, 'Admin'),
    p.email,
    p.password_hash,
    CASE 
        WHEN ur.role = 'super_admin' THEN 'super_admin'
        ELSE 'admin'
    END,
    p.created_at
FROM profiles p
LEFT JOIN user_roles ur ON ur.user_id = p.id
WHERE ur.role IN ('admin', 'super_admin');

-- Migrar usuários de suporte existentes para a nova tabela supports
-- (Primeiro, vamos criar alguns dados de exemplo se não existirem)
INSERT OR IGNORE INTO support_users (id, full_name, matricula, is_active)
VALUES 
    ('support-1', 'Suporte Geral', '123456', 1),
    ('support-2', 'Suporte Técnico', '234567', 1),
    ('support-3', 'Suporte Comercial', '345678', 1);

-- Agora migrar para a tabela supports
INSERT INTO supports (nome, matricula, admin_id, created_at)
SELECT 
    su.full_name,
    su.matricula,
    -- Associar ao primeiro admin disponível
    (SELECT id FROM admins LIMIT 1),
    su.created_at
FROM support_users su
WHERE su.is_active = 1;

-- 5. ATUALIZAR TABELAS RELACIONADAS
-- ============================================

-- Adicionar coluna admin_id nas tabelas relacionadas
ALTER TABLE whatsapp_connections ADD COLUMN admin_id TEXT REFERENCES admins(id) ON DELETE CASCADE;
ALTER TABLE attendances ADD COLUMN admin_id TEXT REFERENCES admins(id) ON DELETE SET NULL;
ALTER TABLE messages ADD COLUMN admin_id TEXT REFERENCES admins(id) ON DELETE SET NULL;

-- Migrar dados de whatsapp_connections
UPDATE whatsapp_connections 
SET admin_id = admin_user_id 
WHERE admin_user_id IS NOT NULL;

-- Migrar dados de attendances (associar ao admin da conexão WhatsApp)
UPDATE attendances 
SET admin_id = (
    SELECT wc.admin_id 
    FROM whatsapp_connections wc 
    WHERE wc.id = attendances.whatsapp_connection_id
)
WHERE whatsapp_connection_id IS NOT NULL;

-- Migrar dados de messages
UPDATE messages 
SET admin_id = (
    SELECT a.admin_id 
    FROM attendances a 
    WHERE a.id = messages.attendance_id
)
WHERE attendance_id IS NOT NULL;

-- 6. REMOVER COLUNAS E TABELAS ANTIGAS
-- ============================================

-- Remover colunas que referenciam o sistema de salas
-- SQLite não suporta DROP COLUMN diretamente, então vamos recriar as tabelas

-- Backup e recriar whatsapp_connections sem support_room_id
CREATE TABLE whatsapp_connections_new (
    id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(4))) || '-' || lower(hex(randomblob(2))) || '-4' || substr(lower(hex(randomblob(2))),2) || '-' || substr('89ab',abs(random()) % 4 + 1, 1) || substr(lower(hex(randomblob(2))),2) || '-' || lower(hex(randomblob(6)))),
    instance_name TEXT NOT NULL,
    phone_number TEXT,
    status TEXT NOT NULL DEFAULT 'disconnected',
    qr_code TEXT,
    admin_id TEXT REFERENCES admins(id) ON DELETE CASCADE,
    matricula TEXT,
    last_connection DATETIME,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

INSERT INTO whatsapp_connections_new (id, instance_name, phone_number, status, qr_code, admin_id, matricula, last_connection, created_at, updated_at)
SELECT id, instance_name, phone_number, status, qr_code, admin_id, matricula, last_connection, created_at, updated_at
FROM whatsapp_connections;

DROP TABLE whatsapp_connections;
ALTER TABLE whatsapp_connections_new RENAME TO whatsapp_connections;

-- Backup e recriar attendances sem room_id e agent_id
CREATE TABLE attendances_new (
    id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(4))) || '-' || lower(hex(randomblob(2))) || '-4' || substr(lower(hex(randomblob(2))),2) || '-' || substr('89ab',abs(random()) % 4 + 1, 1) || substr(lower(hex(randomblob(2))),2) || '-' || lower(hex(randomblob(6)))),
    client_name TEXT NOT NULL,
    client_phone TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'waiting',
    assigned_to TEXT DEFAULT 'ai',
    admin_id TEXT REFERENCES admins(id) ON DELETE SET NULL,
    whatsapp_connection_id TEXT REFERENCES whatsapp_connections(id),
    initial_message TEXT,
    observations TEXT,
    tags TEXT,
    rating INTEGER,
    started_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    finished_at DATETIME,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

INSERT INTO attendances_new (id, client_name, client_phone, status, assigned_to, admin_id, whatsapp_connection_id, initial_message, observations, rating, started_at, finished_at, created_at, updated_at)
SELECT id, client_name, client_phone, status, assigned_to, admin_id, whatsapp_connection_id, initial_message, observations, rating, started_at, finished_at, created_at, updated_at
FROM attendances;

DROP TABLE attendances;
ALTER TABLE attendances_new RENAME TO attendances;

-- Remover tabelas do sistema de salas
DROP TABLE IF EXISTS room_members;
DROP TABLE IF EXISTS support_rooms;
DROP TABLE IF EXISTS support_users;

-- 7. CRIAR TRIGGERS PARA UPDATED_AT
-- ============================================

-- Trigger para admins
CREATE TRIGGER update_admins_updated_at 
    AFTER UPDATE ON admins
    FOR EACH ROW
    BEGIN
        UPDATE admins SET updated_at = CURRENT_TIMESTAMP WHERE id = NEW.id;
    END;

-- Trigger para supports
CREATE TRIGGER update_supports_updated_at 
    AFTER UPDATE ON supports
    FOR EACH ROW
    BEGIN
        UPDATE supports SET updated_at = CURRENT_TIMESTAMP WHERE id = NEW.id;
    END;

-- Trigger para whatsapp_connections
CREATE TRIGGER update_whatsapp_connections_updated_at 
    AFTER UPDATE ON whatsapp_connections
    FOR EACH ROW
    BEGIN
        UPDATE whatsapp_connections SET updated_at = CURRENT_TIMESTAMP WHERE id = NEW.id;
    END;

-- Trigger para attendances
CREATE TRIGGER update_attendances_updated_at 
    AFTER UPDATE ON attendances
    FOR EACH ROW
    BEGIN
        UPDATE attendances SET updated_at = CURRENT_TIMESTAMP WHERE id = NEW.id;
    END;

-- 8. CRIAR ÍNDICES PARA PERFORMANCE
-- ============================================

CREATE INDEX idx_supports_admin_id ON supports(admin_id);
CREATE INDEX idx_supports_matricula ON supports(matricula);
CREATE INDEX idx_admins_email ON admins(email);
CREATE INDEX idx_whatsapp_connections_admin_id ON whatsapp_connections(admin_id);
CREATE INDEX idx_attendances_admin_id ON attendances(admin_id);
CREATE INDEX idx_messages_admin_id ON messages(admin_id);

-- 9. INSERIR DADOS INICIAIS
-- ============================================

-- Inserir admin padrão se não existir
INSERT OR IGNORE INTO admins (id, nome, email, senha, role)
VALUES ('admin-default', 'Administrador', 'admin@inovapro.ai', 'admin123', 'super_admin');

-- Inserir alguns suportes de exemplo
INSERT OR IGNORE INTO supports (nome, matricula, admin_id)
VALUES 
    ('Suporte Geral', '100001', 'admin-default'),
    ('Suporte Técnico', '100002', 'admin-default'),
    ('Suporte Comercial', '100003', 'admin-default');

-- ============================================
-- FIM DA MIGRAÇÃO
-- ============================================
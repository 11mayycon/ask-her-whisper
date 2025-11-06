-- Migração 005: Tabelas para integração WhatsApp Evolution API

-- Tabela de instâncias WhatsApp (já existe parcialmente, vamos garantir que tem todos os campos)
CREATE TABLE IF NOT EXISTS whatsapp_instances (
    id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(4))) || '-' || lower(hex(randomblob(2))) || '-4' || substr(lower(hex(randomblob(2))),2) || '-' || substr('89ab',abs(random()) % 4 + 1, 1) || substr(lower(hex(randomblob(2))),2) || '-' || lower(hex(randomblob(6)))),
    admin_user_id TEXT NOT NULL REFERENCES admins(id) ON DELETE CASCADE,
    instance_id TEXT NOT NULL UNIQUE,
    api_base_url TEXT NOT NULL,
    api_key TEXT NOT NULL,
    status TEXT DEFAULT 'disconnected' CHECK (status IN ('connected', 'connecting', 'disconnected')),
    phone_number TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_whatsapp_instances_admin ON whatsapp_instances(admin_user_id);
CREATE INDEX IF NOT EXISTS idx_whatsapp_instances_status ON whatsapp_instances(status);

-- Tabela de contatos do WhatsApp
CREATE TABLE IF NOT EXISTS whatsapp_contacts (
    id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(4))) || '-' || lower(hex(randomblob(2))) || '-4' || substr(lower(hex(randomblob(2))),2) || '-' || substr('89ab',abs(random()) % 4 + 1, 1) || substr(lower(hex(randomblob(2))),2) || '-' || lower(hex(randomblob(6)))),
    instance_id TEXT NOT NULL,
    wa_id TEXT NOT NULL,
    pushname TEXT,
    name TEXT,
    isBusiness INTEGER DEFAULT 0,
    profilePicUrl TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(instance_id, wa_id)
);

CREATE INDEX IF NOT EXISTS idx_whatsapp_contacts_instance ON whatsapp_contacts(instance_id);
CREATE INDEX IF NOT EXISTS idx_whatsapp_contacts_wa_id ON whatsapp_contacts(wa_id);

-- Tabela de chats/conversas do WhatsApp
CREATE TABLE IF NOT EXISTS whatsapp_chats (
    id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(4))) || '-' || lower(hex(randomblob(2))) || '-4' || substr(lower(hex(randomblob(2))),2) || '-' || substr('89ab',abs(random()) % 4 + 1, 1) || substr(lower(hex(randomblob(2))),2) || '-' || lower(hex(randomblob(6)))),
    instance_id TEXT NOT NULL,
    chat_id TEXT NOT NULL,
    name TEXT,
    unreadCount INTEGER DEFAULT 0,
    isGroup INTEGER DEFAULT 0,
    lastMessageAt DATETIME,
    lastMessageText TEXT,
    lastMessageFrom TEXT,
    profilePicUrl TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(instance_id, chat_id)
);

CREATE INDEX IF NOT EXISTS idx_whatsapp_chats_instance ON whatsapp_chats(instance_id);
CREATE INDEX IF NOT EXISTS idx_whatsapp_chats_chat_id ON whatsapp_chats(chat_id);
CREATE INDEX IF NOT EXISTS idx_whatsapp_chats_lastMessageAt ON whatsapp_chats(lastMessageAt DESC);

-- Tabela de mensagens do WhatsApp
CREATE TABLE IF NOT EXISTS whatsapp_messages (
    id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(4))) || '-' || lower(hex(randomblob(2))) || '-4' || substr(lower(hex(randomblob(2))),2) || '-' || substr('89ab',abs(random()) % 4 + 1, 1) || substr(lower(hex(randomblob(2))),2) || '-' || lower(hex(randomblob(6)))),
    instance_id TEXT NOT NULL,
    chat_id TEXT NOT NULL,
    message_id TEXT NOT NULL,
    from_me INTEGER DEFAULT 0,
    sender TEXT,
    sender_type TEXT DEFAULT 'client' CHECK (sender_type IN ('client', 'support', 'system')),
    body TEXT,
    type TEXT DEFAULT 'text',
    timestamp DATETIME NOT NULL,
    status TEXT DEFAULT 'received',
    raw_json TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(instance_id, message_id)
);

CREATE INDEX IF NOT EXISTS idx_whatsapp_messages_instance ON whatsapp_messages(instance_id);
CREATE INDEX IF NOT EXISTS idx_whatsapp_messages_chat ON whatsapp_messages(chat_id);
CREATE INDEX IF NOT EXISTS idx_whatsapp_messages_timestamp ON whatsapp_messages(timestamp DESC);

-- Trigger para atualizar updated_at
CREATE TRIGGER IF NOT EXISTS update_whatsapp_instances_updated_at
AFTER UPDATE ON whatsapp_instances
FOR EACH ROW
BEGIN
    UPDATE whatsapp_instances SET updated_at = CURRENT_TIMESTAMP WHERE id = NEW.id;
END;

CREATE TRIGGER IF NOT EXISTS update_whatsapp_contacts_updated_at
AFTER UPDATE ON whatsapp_contacts
FOR EACH ROW
BEGIN
    UPDATE whatsapp_contacts SET updated_at = CURRENT_TIMESTAMP WHERE id = NEW.id;
END;

CREATE TRIGGER IF NOT EXISTS update_whatsapp_chats_updated_at
AFTER UPDATE ON whatsapp_chats
FOR EACH ROW
BEGIN
    UPDATE whatsapp_chats SET updated_at = CURRENT_TIMESTAMP WHERE id = NEW.id;
END;

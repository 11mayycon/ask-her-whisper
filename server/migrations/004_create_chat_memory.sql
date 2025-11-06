-- Criar tabela de memória por chat
CREATE TABLE IF NOT EXISTS chat_memory (
  id TEXT PRIMARY KEY,
  phone TEXT NOT NULL,
  conversation_summary TEXT,
  key_facts TEXT, -- JSON com fatos importantes
  last_topics TEXT, -- JSON com últimos tópicos discutidos
  user_preferences TEXT, -- JSON com preferências do usuário
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_chat_memory_phone ON chat_memory(phone);

-- Adicionar campo de memória às sales_leads
ALTER TABLE sales_leads ADD COLUMN memory_summary TEXT;

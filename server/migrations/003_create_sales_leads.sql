-- Criar tabela de leads de vendas
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
);

-- Criar índice para busca rápida
CREATE INDEX IF NOT EXISTS idx_sales_leads_stage ON sales_leads(stage);
CREATE INDEX IF NOT EXISTS idx_sales_leads_created ON sales_leads(created_at);

-- Criar tabela de pagamentos se não existir
CREATE TABLE IF NOT EXISTS payments (
  id TEXT PRIMARY KEY,
  user_email TEXT NOT NULL,
  stripe_session_id TEXT NOT NULL,
  amount INTEGER NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending',
  created_at TEXT DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_payments_email ON payments(user_email);
CREATE INDEX IF NOT EXISTS idx_payments_session ON payments(stripe_session_id);

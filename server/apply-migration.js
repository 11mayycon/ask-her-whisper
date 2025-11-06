const sqlite3 = require('sqlite3').verbose();
const fs = require('fs');
const path = require('path');

const dbPath = process.env.SQLITE_DB_PATH || './data/isa.db';
const migrationFile = './migrations/004_create_chat_memory.sql';

console.log('📊 Aplicando migração de memória de chat...');

const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error('❌ Erro ao conectar ao banco:', err);
    process.exit(1);
  }
});

const migration = fs.readFileSync(migrationFile, 'utf8');

// Executar cada comando SQL separadamente
const commands = migration
  .split(';')
  .map(cmd => cmd.trim())
  .filter(cmd => cmd.length > 0);

let completed = 0;

commands.forEach((cmd, index) => {
  db.exec(cmd, (err) => {
    if (err && !err.message.includes('duplicate column name')) {
      console.error(`❌ Erro no comando ${index + 1}:`, err.message);
    } else {
      completed++;
      if (completed === commands.length) {
        console.log('✅ Migração aplicada com sucesso!');
        db.close();
        process.exit(0);
      }
    }
  });
});

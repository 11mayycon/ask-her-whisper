const { getDatabase } = require('./dist/config/sqlite');

async function initDB() {
  try {
    console.log('🔄 Inicializando banco de dados...');
    const db = await getDatabase();
    console.log('✅ Banco de dados inicializado com sucesso!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Erro ao inicializar banco:', error);
    process.exit(1);
  }
}

initDB();
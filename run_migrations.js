const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');
const { config } = require('./config.js');

const pool = new Pool(config.supabase);

async function runMigration(filePath) {
    const sql = fs.readFileSync(filePath, 'utf8');
    const client = await pool.connect();
    try {
        console.log(`Executando: ${path.basename(filePath)}`);
        await client.query(sql);
        console.log(`✅ Sucesso: ${path.basename(filePath)}`);
    } catch (err) {
        console.error(`❌ Erro em ${path.basename(filePath)}:`, err.message);
    } finally {
        client.release();
    }
}

async function runAll() {
    console.log('🚀 Iniciando migrações...\n');
    
    const migrations = [
        'migrations/001_create_profiles.sql',
        'migrations/002_create_achievements.sql',
        'migrations/003_update_database.sql',
        'migrations/004_create_shop.sql'
    ];
    
    for (const migration of migrations) {
        const fullPath = path.join(__dirname, migration);
        if (fs.existsSync(fullPath)) {
            await runMigration(fullPath);
        } else {
            console.warn(`⚠️ Arquivo não encontrado: ${migration}`);
        }
    }
    
    console.log('\n✨ Migrações concluídas!');
    await pool.end();
}

runAll().catch(err => {
    console.error('Erro fatal:', err);
    process.exit(1);
});

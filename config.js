// config.js — Centraliza configuração do ambiente
require('dotenv').config();

const config = {
    server: {
        port: parseInt(process.env.SERVER_PORT, 10) || 8081,
    },
    supabase: {
        host: process.env.SUPABASE_HOST || 'localhost',
        port: parseInt(process.env.SUPABASE_PORT, 10) || 5432,
        database: process.env.SUPABASE_DATABASE || 'postgres',
        user: process.env.SUPABASE_USER || 'postgres',
        password: process.env.SUPABASE_PASSWORD || '',
        ssl: { rejectUnauthorized: false },
        max: 5,
        idleTimeoutMillis: 30000,
    },
};

// Validar configuração essencial
if (!config.supabase.password) {
    console.warn('⚠️  [Config] SUPABASE_PASSWORD não definida. Verifique o ficheiro .env');
}

if (!config.supabase.host || config.supabase.host === 'localhost') {
    console.warn('⚠️  [Config] SUPABASE_HOST não definida ou usando localhost. Verifique o ficheiro .env');
}

// Repo info para auto-actualizacao
config.repo = {
    owner: 'eliassebastiao',
    name: 'ezzogame',
    currentVersion: '2.0.0',
};

module.exports = { config };

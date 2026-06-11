const { Pool } = require('pg');

const pool = new Pool({
    host: 'aws-0-eu-west-1.pooler.supabase.com',
    port: 6543,
    database: 'postgres',
    user: 'postgres.kipvcdzyefjuqqixqbex',
    password: 'EZZO@#0000055',
    ssl: { rejectUnauthorized: false },
});

async function checkTables() {
    const client = await pool.connect();
    try {
        console.log('Verificando tabelas existentes...\n');
        
        const tables = await client.query(`
            SELECT table_name 
            FROM information_schema.tables 
            WHERE table_schema = 'public'
            ORDER BY table_name
        `);
        
        console.log('Tabelas encontradas:');
        tables.rows.forEach(row => {
            console.log(`  - ${row.table_name}`);
        });
        
        // Verificar estrutura da tabela users
        if (tables.rows.some(t => t.table_name === 'users')) {
            console.log('\nEstrutura da tabela users:');
            const columns = await client.query(`
                SELECT column_name, data_type 
                FROM information_schema.columns 
                WHERE table_name = 'users'
                ORDER BY ordinal_position
            `);
            columns.rows.forEach(col => {
                console.log(`  - ${col.column_name}: ${col.data_type}`);
            });
        }
        
        // Verificar estrutura da tabela profiles
        if (tables.rows.some(t => t.table_name === 'profiles')) {
            console.log('\nEstrutura da tabela profiles:');
            const columns = await client.query(`
                SELECT column_name, data_type 
                FROM information_schema.columns 
                WHERE table_name = 'profiles'
                ORDER BY ordinal_position
            `);
            columns.rows.forEach(col => {
                console.log(`  - ${col.column_name}: ${col.data_type}`);
            });
        }
        
        // Verificar estrutura da tabela achievements
        if (tables.rows.some(t => t.table_name === 'achievements')) {
            console.log('\nEstrutura da tabela achievements:');
            const columns = await client.query(`
                SELECT column_name, data_type 
                FROM information_schema.columns 
                WHERE table_name = 'achievements'
                ORDER BY ordinal_position
            `);
            columns.rows.forEach(col => {
                console.log(`  - ${col.column_name}: ${col.data_type}`);
            });
        }
        
    } catch (err) {
        console.error('Erro:', err.message);
    } finally {
        client.release();
        await pool.end();
    }
}

checkTables();

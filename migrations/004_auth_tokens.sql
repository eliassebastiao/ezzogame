-- Brick Clássico — Migração: auth_tokens
-- Executar no SQL Editor do Supabase Dashboard

-- Tabela de tokens de autenticacao
CREATE TABLE IF NOT EXISTS auth_tokens (
    id SERIAL PRIMARY KEY,
    username VARCHAR(50) REFERENCES profiles(username) ON DELETE CASCADE,
    token VARCHAR(255) UNIQUE NOT NULL,
    created_at TIMESTAMP DEFAULT NOW(),
    expires_at TIMESTAMP DEFAULT (NOW() + INTERVAL '30 days')
);

-- Indices
CREATE INDEX IF NOT EXISTS idx_auth_tokens_token ON auth_tokens(token);
CREATE INDEX IF NOT EXISTS idx_auth_tokens_username ON auth_tokens(username);

-- Remover tokens expirados (opcional, para limpeza)
DELETE FROM auth_tokens WHERE expires_at < NOW();

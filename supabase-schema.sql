-- Brick Clássico — Schema Supabase
-- Executar no SQL Editor do Supabase Dashboard

-- 1. Tabela de perfis de usuário
CREATE TABLE IF NOT EXISTS profiles (
    id SERIAL PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    display_name VARCHAR(50),
    bio TEXT,
    avatar_url TEXT,
    avatar_type VARCHAR(20) DEFAULT 'initials',
    xp INT DEFAULT 0,
    level INT DEFAULT 1,
    title VARCHAR(50) DEFAULT 'Novato',
    coins INT DEFAULT 0,
    total_games INT DEFAULT 0,
    total_bricks INT DEFAULT 0,
    total_hours INT DEFAULT 0,
    best_score INT DEFAULT 0,
    best_level INT DEFAULT 1,
    favorite_theme VARCHAR(50),
    created_at TIMESTAMP DEFAULT NOW(),
    last_login TIMESTAMP,
    updated_at TIMESTAMP DEFAULT NOW()
);

-- 2. Tabela de saves automáticos (1 por usuário)
CREATE TABLE IF NOT EXISTS game_saves (
    id SERIAL PRIMARY KEY,
    username VARCHAR(50) UNIQUE REFERENCES profiles(username),
    level INT DEFAULT 1,
    score INT DEFAULT 0,
    lives INT DEFAULT 7,
    reserve_life INT DEFAULT 0,
    max_combo INT DEFAULT 0,
    bricks_broken INT DEFAULT 0,
    powerups_collected INT DEFAULT 0,
    updated_at TIMESTAMP DEFAULT NOW()
);

-- 3. Tabela de histórico de partidas
CREATE TABLE IF NOT EXISTS game_history (
    id SERIAL PRIMARY KEY,
    username VARCHAR(50) REFERENCES profiles(username),
    score INT DEFAULT 0,
    level_reached INT DEFAULT 1,
    bricks_broken INT DEFAULT 0,
    max_combo INT DEFAULT 0,
    powerups_collected INT DEFAULT 0,
    duration_seconds INT DEFAULT 0,
    won BOOLEAN DEFAULT FALSE,
    played_at TIMESTAMP DEFAULT NOW()
);

-- 4. Índices para performance
CREATE INDEX IF NOT EXISTS idx_game_history_username ON game_history(username);
CREATE INDEX IF NOT EXISTS idx_game_history_score ON game_history(score DESC);
CREATE INDEX IF NOT EXISTS idx_profiles_best_score ON profiles(best_score DESC);

-- ====================================================================
-- NOVAS TABELAS (v3.0+)
-- ====================================================================

-- 5. Tabela de conquistas
CREATE TABLE IF NOT EXISTS achievements (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    icon VARCHAR(10) DEFAULT '🏆',
    condition_type VARCHAR(50) NOT NULL,
    condition_value INT DEFAULT 1,
    category VARCHAR(50) DEFAULT 'gameplay',
    rarity VARCHAR(20) DEFAULT 'common',
    reward_xp INT DEFAULT 0,
    reward_coins INT DEFAULT 0,
    hidden BOOLEAN DEFAULT FALSE,
    sort_order INT DEFAULT 0,
    is_active BOOLEAN DEFAULT TRUE
);

-- 6. Conquistas do usuário
CREATE TABLE IF NOT EXISTS user_achievements (
    id SERIAL PRIMARY KEY,
    username VARCHAR(50) REFERENCES profiles(username) ON DELETE CASCADE,
    achievement_id INT REFERENCES achievements(id) ON DELETE CASCADE,
    unlocked_at TIMESTAMP DEFAULT NOW(),
    progress INT DEFAULT 0,
    UNIQUE(username, achievement_id)
);

-- 7. Itens da loja
CREATE TABLE IF NOT EXISTS shop_items (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    type VARCHAR(20) NOT NULL, -- paddle, ball, theme, particles
    rarity VARCHAR(20) DEFAULT 'common',
    price INT DEFAULT 0,
    preview_data JSONB DEFAULT '{}',
    is_active BOOLEAN DEFAULT TRUE,
    sort_order INT DEFAULT 0
);

-- 8. Inventário do usuário
CREATE TABLE IF NOT EXISTS user_inventory (
    id SERIAL PRIMARY KEY,
    username VARCHAR(50) REFERENCES profiles(username) ON DELETE CASCADE,
    item_id INT REFERENCES shop_items(id) ON DELETE CASCADE,
    purchased_at TIMESTAMP DEFAULT NOW(),
    equipped BOOLEAN DEFAULT FALSE,
    UNIQUE(username, item_id)
);

-- 9. Log de XP
CREATE TABLE IF NOT EXISTS xp_log (
    id SERIAL PRIMARY KEY,
    username VARCHAR(50) REFERENCES profiles(username) ON DELETE CASCADE,
    amount INT NOT NULL,
    reason VARCHAR(50) DEFAULT 'game',
    created_at TIMESTAMP DEFAULT NOW()
);

-- 10. Sessões de jogo detalhadas
CREATE TABLE IF NOT EXISTS game_sessions (
    id SERIAL PRIMARY KEY,
    username VARCHAR(50) REFERENCES profiles(username) ON DELETE CASCADE,
    mode VARCHAR(20) DEFAULT 'classic',
    score INT DEFAULT 0,
    level INT DEFAULT 1,
    duration INT DEFAULT 0,
    bricks_broken INT DEFAULT 0,
    max_combo INT DEFAULT 0,
    powerups_collected INT DEFAULT 0,
    accuracy REAL DEFAULT 0,
    won BOOLEAN DEFAULT FALSE,
    started_at TIMESTAMP DEFAULT NOW(),
    ended_at TIMESTAMP
);

-- 11. Estatísticas diárias
-- 11. Token de autenticacao (sessoes)
CREATE TABLE IF NOT EXISTS auth_tokens (
    id SERIAL PRIMARY KEY,
    username VARCHAR(50) REFERENCES profiles(username) ON DELETE CASCADE,
    token VARCHAR(255) UNIQUE NOT NULL,
    created_at TIMESTAMP DEFAULT NOW(),
    expires_at TIMESTAMP DEFAULT (NOW() + INTERVAL '30 days')
);

CREATE INDEX IF NOT EXISTS idx_auth_tokens_token ON auth_tokens(token);
CREATE INDEX IF NOT EXISTS idx_auth_tokens_username ON auth_tokens(username);

-- 12. Estatisticas diarias
    id SERIAL PRIMARY KEY,
    username VARCHAR(50) REFERENCES profiles(username) ON DELETE CASCADE,
    date DATE DEFAULT CURRENT_DATE,
    games_count INT DEFAULT 0,
    total_score INT DEFAULT 0,
    avg_score REAL DEFAULT 0,
    total_time INT DEFAULT 0,
    best_score INT DEFAULT 0,
    bricks_broken INT DEFAULT 0,
    UNIQUE(username, date)
);

-- Índices adicionais
CREATE INDEX IF NOT EXISTS idx_user_achievements_username ON user_achievements(username);
CREATE INDEX IF NOT EXISTS idx_user_inventory_username ON user_inventory(username);
CREATE INDEX IF NOT EXISTS idx_game_sessions_username ON game_sessions(username);
CREATE INDEX IF NOT EXISTS idx_xp_log_username ON xp_log(username);

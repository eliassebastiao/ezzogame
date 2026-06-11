-- Criar tabela de perfis de jogadores
CREATE TABLE IF NOT EXISTS profiles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    username VARCHAR(255) NOT NULL REFERENCES users(username) ON DELETE CASCADE,
    display_name VARCHAR(255),
    avatar_url TEXT,
    avatar_type VARCHAR(50) DEFAULT 'initials', -- 'upload', 'initials', 'preset'
    bio TEXT DEFAULT '',
    xp INTEGER DEFAULT 0,
    level INTEGER DEFAULT 1,
    title VARCHAR(100) DEFAULT 'Novato',
    coins INTEGER DEFAULT 0,
    total_games INTEGER DEFAULT 0,
    total_hours INTEGER DEFAULT 0, -- em minutos
    best_score INTEGER DEFAULT 0,
    best_level INTEGER DEFAULT 1,
    total_bricks INTEGER DEFAULT 0,
    favorite_theme VARCHAR(50),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(username)
);

-- Criar índices para performance
CREATE INDEX IF NOT EXISTS idx_profiles_username ON profiles(username);
CREATE INDEX IF NOT EXISTS idx_profiles_xp ON profiles(xp DESC);
CREATE INDEX IF NOT EXISTS idx_profiles_level ON profiles(level DESC);

-- Criar tabela de log de XP
CREATE TABLE IF NOT EXISTS xp_log (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    username VARCHAR(255) NOT NULL REFERENCES users(username) ON DELETE CASCADE,
    amount INTEGER NOT NULL,
    reason VARCHAR(255) NOT NULL,
    game_session_id UUID,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_xp_log_username ON xp_log(username);
CREATE INDEX IF NOT EXISTS idx_xp_log_created ON xp_log(created_at DESC);

-- Criar tabela de game sessions para estatísticas
CREATE TABLE IF NOT EXISTS game_sessions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    username VARCHAR(255) NOT NULL REFERENCES users(username) ON DELETE CASCADE,
    mode VARCHAR(50) DEFAULT 'classic',
    score INTEGER DEFAULT 0,
    level INTEGER DEFAULT 1,
    duration INTEGER DEFAULT 0, -- em segundos
    bricks_broken INTEGER DEFAULT 0,
    max_combo INTEGER DEFAULT 0,
    powerups_collected INTEGER DEFAULT 0,
    accuracy DECIMAL(5,2) DEFAULT 0, -- percentagem
    won BOOLEAN DEFAULT FALSE,
    started_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    ended_at TIMESTAMP WITH TIME ZONE
);

CREATE INDEX IF NOT EXISTS idx_sessions_username ON game_sessions(username);
CREATE INDEX IF NOT EXISTS idx_sessions_started ON game_sessions(started_at DESC);

-- Criar tabela de daily stats
CREATE TABLE IF NOT EXISTS stats_daily (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    username VARCHAR(255) NOT NULL REFERENCES users(username) ON DELETE CASCADE,
    date DATE NOT NULL DEFAULT CURRENT_DATE,
    games_count INTEGER DEFAULT 0,
    total_score INTEGER DEFAULT 0,
    avg_score DECIMAL(10,2) DEFAULT 0,
    total_time INTEGER DEFAULT 0, -- em minutos
    best_score INTEGER DEFAULT 0,
    bricks_broken INTEGER DEFAULT 0,
    UNIQUE(username, date)
);

CREATE INDEX IF NOT EXISTS idx_stats_daily_username ON stats_daily(username);
CREATE INDEX IF NOT EXISTS idx_stats_daily_date ON stats_daily(date DESC);

-- Função para calcular nível baseado no XP
CREATE OR REPLACE FUNCTION calculate_level(player_xp INTEGER)
RETURNS INTEGER AS $$
BEGIN
    -- Fórmula: Nível = sqrt(XP / 100)
    RETURN GREATEST(1, FLOOR(SQRT(player_xp::FLOAT / 100))::INTEGER);
END;
$$ LANGUAGE plpgsql;

-- Função para obter título baseado no nível
CREATE OR REPLACE FUNCTION get_title(player_level INTEGER)
RETURNS VARCHAR(100) AS $$
BEGIN
    RETURN CASE
        WHEN player_level >= 100 THEN 'Deus do Brick'
        WHEN player_level >= 80 THEN 'Lendário'
        WHEN player_level >= 60 THEN 'Mestre Supremo'
        WHEN player_level >= 50 THEN 'Mestre'
        WHEN player_level >= 40 THEN 'Expert'
        WHEN player_level >= 30 THEN 'Veterano'
        WHEN player_level >= 20 THEN 'Avançado'
        WHEN player_level >= 10 THEN 'Intermediário'
        ELSE 'Novato'
    END;
END;
$$ LANGUAGE plpgsql;

-- Trigger para atualizar nível e título automaticamente quando XP muda
CREATE OR REPLACE FUNCTION update_profile_level()
RETURNS TRIGGER AS $$
BEGIN
    NEW.level := calculate_level(NEW.xp);
    NEW.title := get_title(NEW.level);
    NEW.updated_at := NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_update_profile_level ON profiles;
CREATE TRIGGER trigger_update_profile_level
    BEFORE UPDATE ON profiles
    FOR EACH ROW
    EXECUTE FUNCTION update_profile_level();

-- Trigger para criar perfil automaticamente quando usuário é criado
CREATE OR REPLACE FUNCTION create_profile_on_user_insert()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO profiles (username, display_name, created_at)
    VALUES (NEW.username, NEW.display_name, NOW())
    ON CONFLICT (username) DO NOTHING;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_create_profile ON users;
CREATE TRIGGER trigger_create_profile
    AFTER INSERT ON users
    FOR EACH ROW
    EXECUTE FUNCTION create_profile_on_user_insert();

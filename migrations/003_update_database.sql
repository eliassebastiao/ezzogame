-- Migração 003: Atualizar estrutura existente e criar novas tabelas

-- Adicionar colunas ausentes na tabela profiles existente
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS display_name VARCHAR(255),
ADD COLUMN IF NOT EXISTS avatar_url TEXT,
ADD COLUMN IF NOT EXISTS avatar_type VARCHAR(50) DEFAULT 'initials',
ADD COLUMN IF NOT EXISTS bio TEXT DEFAULT '',
ADD COLUMN IF NOT EXISTS xp INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS level INTEGER DEFAULT 1,
ADD COLUMN IF NOT EXISTS title VARCHAR(100) DEFAULT 'Novato',
ADD COLUMN IF NOT EXISTS coins INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS total_hours INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS favorite_theme VARCHAR(50),
ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();

-- Criar índices para a tabela profiles
CREATE INDEX IF NOT EXISTS idx_profiles_username ON profiles(username);
CREATE INDEX IF NOT EXISTS idx_profiles_xp ON profiles(xp DESC);
CREATE INDEX IF NOT EXISTS idx_profiles_level ON profiles(level DESC);

-- Criar tabela de log de XP
CREATE TABLE IF NOT EXISTS xp_log (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    username VARCHAR(255) NOT NULL REFERENCES profiles(username) ON DELETE CASCADE,
    amount INTEGER NOT NULL,
    reason VARCHAR(255) NOT NULL,
    game_session_id UUID,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_xp_log_username ON xp_log(username);
CREATE INDEX IF NOT EXISTS idx_xp_log_created ON xp_log(created_at DESC);

-- Criar tabela de game sessions para estatísticas
CREATE TABLE IF NOT EXISTS game_sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    username VARCHAR(255) NOT NULL REFERENCES profiles(username) ON DELETE CASCADE,
    mode VARCHAR(50) DEFAULT 'classic',
    score INTEGER DEFAULT 0,
    level INTEGER DEFAULT 1,
    duration INTEGER DEFAULT 0,
    bricks_broken INTEGER DEFAULT 0,
    max_combo INTEGER DEFAULT 0,
    powerups_collected INTEGER DEFAULT 0,
    accuracy DECIMAL(5,2) DEFAULT 0,
    won BOOLEAN DEFAULT FALSE,
    started_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    ended_at TIMESTAMP WITH TIME ZONE
);

CREATE INDEX IF NOT EXISTS idx_sessions_username ON game_sessions(username);
CREATE INDEX IF NOT EXISTS idx_sessions_started ON game_sessions(started_at DESC);

-- Criar tabela de daily stats
CREATE TABLE IF NOT EXISTS stats_daily (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    username VARCHAR(255) NOT NULL REFERENCES profiles(username) ON DELETE CASCADE,
    date DATE NOT NULL DEFAULT CURRENT_DATE,
    games_count INTEGER DEFAULT 0,
    total_score INTEGER DEFAULT 0,
    avg_score DECIMAL(10,2) DEFAULT 0,
    total_time INTEGER DEFAULT 0,
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

-- Criar tabela de conquistas
CREATE TABLE IF NOT EXISTS achievements (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    code VARCHAR(100) UNIQUE NOT NULL,
    name VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    icon VARCHAR(50) NOT NULL,
    category VARCHAR(50) NOT NULL,
    rarity VARCHAR(20) NOT NULL DEFAULT 'common',
    condition_type VARCHAR(50) NOT NULL,
    condition_value INTEGER NOT NULL DEFAULT 1,
    reward_xp INTEGER DEFAULT 0,
    reward_coins INTEGER DEFAULT 0,
    reward_skin VARCHAR(255),
    hidden BOOLEAN DEFAULT FALSE,
    sort_order INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Criar tabela de conquistas do usuário
CREATE TABLE IF NOT EXISTS user_achievements (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    username VARCHAR(255) NOT NULL REFERENCES profiles(username) ON DELETE CASCADE,
    achievement_id UUID NOT NULL REFERENCES achievements(id) ON DELETE CASCADE,
    progress INTEGER DEFAULT 0,
    unlocked_at TIMESTAMP WITH TIME ZONE,
    UNIQUE(username, achievement_id)
);

CREATE INDEX IF NOT EXISTS idx_user_achievements_username ON user_achievements(username);
CREATE INDEX IF NOT EXISTS idx_user_achievements_unlocked ON user_achievements(unlocked_at DESC);

-- Inserir conquistas padrão
INSERT INTO achievements (code, name, description, icon, category, rarity, condition_type, condition_value, reward_xp, reward_coins) VALUES
('first_win', 'Primeira Vitória', 'Complete o nível 1', '🏆', 'gameplay', 'common', 'level_reached', 1, 50, 10),
('level_10', 'Deca-Quebrador', 'Alcance o nível 10', '🔟', 'gameplay', 'common', 'level_reached', 10, 100, 25),
('level_50', 'Semi-Centenário', 'Alcance o nível 50', '👑', 'gameplay', 'rare', 'level_reached', 50, 500, 100),
('level_100', 'Centenário', 'Alcance o nível 100', '💯', 'gameplay', 'epic', 'level_reached', 100, 2000, 500),
('level_500', 'Meio Caminho', 'Alcance o nível 500', '🌟', 'gameplay', 'legendary', 'level_reached', 500, 10000, 5000),
('level_1000', 'Deus do Brick', 'Complete todos os 1000 níveis', '👑', 'gameplay', 'legendary', 'level_reached', 1000, 50000, 20000),
('score_1000', 'Milionário em Potência', 'Alcance 1.000 pontos', '💰', 'score', 'common', 'score_reached', 1000, 50, 10),
('score_10000', 'Rico', 'Alcance 10.000 pontos', '💎', 'score', 'common', 'score_reached', 10000, 100, 25),
('score_100000', 'Multimilionário', 'Alcance 100.000 pontos', '🏦', 'score', 'rare', 'score_reached', 100000, 500, 100),
('score_1000000', 'Bilionário', 'Alcance 1.000.000 pontos', '🌌', 'score', 'epic', 'score_reached', 1000000, 2000, 500),
('combo_5', 'Combo Iniciante', 'Alcance combo x5', '⚡', 'combo', 'common', 'combo_reached', 5, 50, 10),
('combo_10', 'Combo Master', 'Alcance combo x10', '🔥', 'combo', 'rare', 'combo_reached', 10, 200, 50),
('combo_20', 'Combo Deus', 'Alcance combo x20', '💥', 'combo', 'epic', 'combo_reached', 20, 1000, 200),
('combo_50', 'Combo Impossível', 'Alcance combo x50', '☄️', 'combo', 'legendary', 'combo_reached', 50, 5000, 1000),
('bricks_100', 'Demolidor', 'Destrua 100 tijolos', '🧱', 'collection', 'common', 'bricks_broken', 100, 50, 10),
('bricks_1000', 'Destruidor', 'Destrua 1.000 tijolos', '💣', 'collection', 'common', 'bricks_broken', 1000, 100, 25),
('bricks_10000', 'Aniquilador', 'Destrua 10.000 tijolos', '☄️', 'collection', 'rare', 'bricks_broken', 10000, 500, 100),
('bricks_100000', 'Apocalipse', 'Destrua 100.000 tijolos', '🌍', 'collection', 'epic', 'bricks_broken', 100000, 2000, 500),
('games_10', 'Viciado', 'Jogue 10 jogos', '🎮', 'collection', 'common', 'games_played', 10, 50, 10),
('games_100', 'Hardcore', 'Jogue 100 jogos', '👾', 'collection', 'rare', 'games_played', 100, 500, 100),
('games_1000', 'Lendário', 'Jogue 1.000 jogos', '🏅', 'collection', 'legendary', 'games_played', 1000, 5000, 1000),
('time_1h', 'Hora de Jogo', 'Jogue por 1 hora', '⏱️', 'collection', 'common', 'time_played', 60, 50, 10),
('time_10h', 'Maratonista', 'Jogue por 10 horas', '⏳', 'collection', 'rare', 'time_played', 600, 500, 100),
('time_100h', 'Vida dedicada', 'Jogue por 100 horas', '⌛', 'collection', 'epic', 'time_played', 6000, 2000, 500),
('powerups_10', 'Colecionador', 'Pegue 10 powerups', '⚡', 'collection', 'common', 'powerups_collected', 10, 50, 10),
('powerups_100', 'Powerup Master', 'Pegue 100 powerups', '🔋', 'collection', 'rare', 'powerups_collected', 100, 500, 100),
('powerups_1000', 'Powerup Deus', 'Pegue 1.000 powerups', '🔌', 'collection', 'epic', 'powerups_collected', 1000, 2000, 500),
('first_combo', 'Primeiro Combo', 'Alcance combo x2', '🔗', 'gameplay', 'common', 'combo_reached', 2, 25, 5)
ON CONFLICT (code) DO NOTHING;

-- Função para verificar e desbloquear conquistas
CREATE OR REPLACE FUNCTION check_achievements(
    p_username VARCHAR,
    p_condition_type VARCHAR,
    p_value INTEGER
)
RETURNS TABLE (achievement_id UUID, achievement_name VARCHAR, achievement_icon VARCHAR, reward_xp INTEGER, reward_coins INTEGER) AS $$
BEGIN
    RETURN QUERY
    SELECT a.id, a.name, a.icon, a.reward_xp, a.reward_coins
    FROM achievements a
    WHERE a.condition_type = p_condition_type
      AND a.condition_value <= p_value
      AND NOT EXISTS (
          SELECT 1 FROM user_achievements ua
          WHERE ua.achievement_id = a.id AND ua.username = p_username
      )
    ORDER BY a.condition_value ASC;
END;
$$ LANGUAGE plpgsql;

-- Função para desbloquear conquista
CREATE OR REPLACE FUNCTION unlock_achievement(
    p_username VARCHAR,
    p_achievement_id UUID
)
RETURNS BOOLEAN AS $$
BEGIN
    INSERT INTO user_achievements (username, achievement_id, progress, unlocked_at)
    VALUES (p_username, p_achievement_id, 0, NOW())
    ON CONFLICT (username, achievement_id) DO NOTHING;
    
    RETURN FOUND;
END;
$$ LANGUAGE plpgsql;

-- Atualizar registros existentes com valores padrão
UPDATE profiles SET 
    display_name = COALESCE(display_name, username),
    xp = COALESCE(xp, 0),
    level = COALESCE(level, 1),
    title = COALESCE(title, 'Novato'),
    coins = COALESCE(coins, 0),
    total_hours = COALESCE(total_hours, 0),
    best_score = COALESCE(best_score, 0),
    best_level = COALESCE(best_level, 1),
    total_bricks = COALESCE(total_bricks, 0),
    total_games = COALESCE(total_games, 0)
WHERE display_name IS NULL;

SELECT 'Migração concluída com sucesso!' as status;

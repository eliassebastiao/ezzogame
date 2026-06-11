-- Criar tabela de conquistas (achievements)
CREATE TABLE IF NOT EXISTS achievements (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    code VARCHAR(100) UNIQUE NOT NULL, -- Código interno único
    name VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    icon VARCHAR(50) NOT NULL, -- Emoji ou ícone
    category VARCHAR(50) NOT NULL, -- 'gameplay', 'score', 'combo', 'collection', 'secret', 'special'
    rarity VARCHAR(20) NOT NULL DEFAULT 'common', -- 'common', 'rare', 'epic', 'legendary', 'secret'
    condition_type VARCHAR(50) NOT NULL, -- 'score_reached', 'level_reached', 'combo_reached', 'bricks_broken', 'games_played', 'time_played', 'powerups_collected', 'special'
    condition_value INTEGER NOT NULL DEFAULT 1, -- Valor necessário
    reward_xp INTEGER DEFAULT 0,
    reward_coins INTEGER DEFAULT 0,
    reward_skin VARCHAR(255), -- ID da skin desbloqueada
    hidden BOOLEAN DEFAULT FALSE, -- Conquista secreta (não aparece até desbloquear)
    sort_order INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Criar tabela de conquistas do usuário
CREATE TABLE IF NOT EXISTS user_achievements (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    username VARCHAR(255) NOT NULL REFERENCES users(username) ON DELETE CASCADE,
    achievement_id UUID NOT NULL REFERENCES achievements(id) ON DELETE CASCADE,
    progress INTEGER DEFAULT 0,
    unlocked_at TIMESTAMP WITH TIME ZONE,
    UNIQUE(username, achievement_id)
);

CREATE INDEX IF NOT EXISTS idx_user_achievements_username ON user_achievements(username);
CREATE INDEX IF NOT EXISTS idx_user_achievements_unlocked ON user_achievements(unlocked_at DESC);

-- Inserir conquistas padrão
INSERT INTO achievements (code, name, description, icon, category, rarity, condition_type, condition_value, reward_xp, reward_coins) VALUES
-- Conquistas de Gameplay
('first_win', 'Primeira Vitória', 'Complete o nível 1', '🏆', 'gameplay', 'common', 'level_reached', 1, 50, 10),
('level_10', 'Deca-Quebrador', 'Alcance o nível 10', '🔟', 'gameplay', 'common', 'level_reached', 10, 100, 25),
('level_50', 'Semi-Centenário', 'Alcance o nível 50', '👑', 'gameplay', 'rare', 'level_reached', 50, 500, 100),
('level_100', 'Centenário', 'Alcance o nível 100', '💯', 'gameplay', 'epic', 'level_reached', 100, 2000, 500),
('level_500', 'Meio Caminho', 'Alcance o nível 500', '🌟', 'gameplay', 'legendary', 'level_reached', 500, 10000, 5000),
('level_1000', 'Deus do Brick', 'Complete todos os 1000 níveis', '👑', 'gameplay', 'legendary', 'level_reached', 1000, 50000, 20000),

-- Conquistas de Score
('score_1000', 'Milionário em Potência', 'Alcance 1.000 pontos', '💰', 'score', 'common', 'score_reached', 1000, 50, 10),
('score_10000', 'Rico', 'Alcance 10.000 pontos', '💎', 'score', 'common', 'score_reached', 10000, 100, 25),
('score_100000', 'Multimilionário', 'Alcance 100.000 pontos', '🏦', 'score', 'rare', 'score_reached', 100000, 500, 100),
('score_1000000', 'Bilionário', 'Alcance 1.000.000 pontos', '🌌', 'score', 'epic', 'score_reached', 1000000, 2000, 500),

-- Conquistas de Combo
('combo_5', 'Combo Iniciante', 'Alcance combo x5', '⚡', 'combo', 'common', 'combo_reached', 5, 50, 10),
('combo_10', 'Combo Master', 'Alcance combo x10', '🔥', 'combo', 'rare', 'combo_reached', 10, 200, 50),
('combo_20', 'Combo Deus', 'Alcance combo x20', '💥', 'combo', 'epic', 'combo_reached', 20, 1000, 200),
('combo_50', 'Combo Impossível', 'Alcance combo x50', '☄️', 'combo', 'legendary', 'combo_reached', 50, 5000, 1000),

-- Conquistas de Tijolos
('bricks_100', 'Demolidor', 'Destrua 100 tijolos', '🧱', 'collection', 'common', 'bricks_broken', 100, 50, 10),
('bricks_1000', 'Destruidor', 'Destrua 1.000 tijolos', '💣', 'collection', 'common', 'bricks_broken', 1000, 100, 25),
('bricks_10000', 'Aniquilador', 'Destrua 10.000 tijolos', '☄️', 'collection', 'rare', 'bricks_broken', 10000, 500, 100),
('bricks_100000', 'Apocalipse', 'Destrua 100.000 tijolos', '🌍', 'collection', 'epic', 'bricks_broken', 100000, 2000, 500),

-- Conquistas de Jogos
('games_10', 'Viciado', 'Jogue 10 jogos', '🎮', 'collection', 'common', 'games_played', 10, 50, 10),
('games_100', 'Hardcore', 'Jogue 100 jogos', '👾', 'collection', 'rare', 'games_played', 100, 500, 100),
('games_1000', 'Lendário', 'Jogue 1.000 jogos', '🏅', 'collection', 'legendary', 'games_played', 1000, 5000, 1000),

-- Conquistas de Tempo
('time_1h', 'Hora de Jogo', 'Jogue por 1 hora', '⏱️', 'collection', 'common', 'time_played', 60, 50, 10),
('time_10h', 'Maratonista', 'Jogue por 10 horas', '⏳', 'collection', 'rare', 'time_played', 600, 500, 100),
('time_100h', 'Vida dedicada', 'Jogue por 100 horas', '⌛', 'collection', 'epic', 'time_played', 6000, 2000, 500),

-- Conquistas de Powerups
('powerups_10', 'Colecionador', 'Pegue 10 powerups', '⚡', 'collection', 'common', 'powerups_collected', 10, 50, 10),
('powerups_100', 'Powerup Master', 'Pegue 100 powerups', '🔋', 'collection', 'rare', 'powerups_collected', 100, 500, 100),
('powerups_1000', 'Powerup Deus', 'Pegue 1.000 powerups', '🔌', 'collection', 'epic', 'powerups_collected', 1000, 2000, 500),

-- Conquistas Especiais
('no_lives_lost', 'Perfeccionista', 'Complete um nível sem perder vidas', '✨', 'special', 'rare', 'special', 1, 300, 50),
('no_powerups', 'Puro', 'Complete um nível sem pegar powerups', '🎯', 'special', 'rare', 'special', 1, 300, 50),
('speed_demon', 'Velocista', 'Complete 10 níveis em 5 minutos', '🏃', 'special', 'epic', 'special', 1, 1000, 200),
('night_owl', 'Coruja', 'Jogue às 3h da manhã', '🦉', 'special', 'secret', 'special', 1, 500, 100),
('first_combo', 'Primeiro Combo', 'Alcance combo x2', '🔗', 'gameplay', 'common', 'combo_reached', 2, 25, 5),
('paddle_master', 'Paddle Master', '50 hits consecutivos no paddle', '🏓', 'special', 'rare', 'special', 1, 500, 100),
('fire_lord', 'Senhor do Fogo', '2 minutos com fireball ativo', '🔥', 'special', 'rare', 'special', 1, 500, 100),
('laser_master', 'Laser Master', 'Destrua 100 tijolos com laser', '🔫', 'special', 'rare', 'special', 1, 500, 100),
('multiball_mayhem', 'Multiball Caos', '5 bolas em jogo simultaneamente', '⚪', 'special', 'epic', 'special', 1, 1000, 200),
('phoenix', 'Fénix', 'Use uma vida reserva', '🐦', 'special', 'common', 'special', 1, 100, 20),
('shield_master', 'Mestre do Escudo', '10 defesas com escudo', '🛡️', 'special', 'rare', 'special', 1, 500, 100)

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

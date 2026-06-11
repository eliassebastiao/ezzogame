-- Migração 004: Loja de Skins e Inventário

-- Criar tabela de itens da loja
CREATE TABLE IF NOT EXISTS shop_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    code VARCHAR(100) UNIQUE NOT NULL,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    type VARCHAR(50) NOT NULL, -- 'paddle', 'ball', 'theme', 'particles', 'effect'
    rarity VARCHAR(20) NOT NULL DEFAULT 'common', -- 'common', 'rare', 'epic', 'legendary'
    price INTEGER NOT NULL DEFAULT 0,
    preview_data JSONB DEFAULT '{}', -- Cores, formas, configurações visuais
    unlock_condition VARCHAR(255), -- Condição para desbloquear (ex: 'level_10', 'achievement_combo_10')
    is_active BOOLEAN DEFAULT TRUE,
    sort_order INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Criar tabela de inventário do usuário
CREATE TABLE IF NOT EXISTS user_inventory (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    username VARCHAR(255) NOT NULL REFERENCES profiles(username) ON DELETE CASCADE,
    item_id UUID NOT NULL REFERENCES shop_items(id) ON DELETE CASCADE,
    equipped BOOLEAN DEFAULT FALSE,
    purchased_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(username, item_id)
);

CREATE INDEX IF NOT EXISTS idx_user_inventory_username ON user_inventory(username);
CREATE INDEX IF NOT EXISTS idx_user_inventory_equipped ON user_inventory(username, equipped) WHERE equipped = TRUE;

-- Inserir itens da loja
INSERT INTO shop_items (code, name, description, type, rarity, price, preview_data, sort_order) VALUES
-- Paddles
('paddle_classic', 'Paddle Clássico', 'O paddle original que você já conhece', 'paddle', 'common', 0, '{"colors": ["#ff3c6f", "#ff8a5c"], "shape": "rect"}', 1),
('paddle_neon', 'Paddle Neon', 'Brilho neon ciano intenso', 'paddle', 'common', 200, '{"colors": ["#00e5ff", "#0080ff"], "shape": "rect", "glow": "#00e5ff"}', 2),
('paddle_gold', 'Paddle Gold', 'Dourado e luxuoso', 'paddle', 'rare', 1000, '{"colors": ["#ffd700", "#ffaa00"], "shape": "rect", "glow": "#ffd700"}', 3),
('paddle_diamond', 'Paddle Diamond', 'Cristalino e poderoso', 'paddle', 'epic', 3000, '{"colors": ["#b9f2ff", "#00ccff"], "shape": "rect", "glow": "#b9f2ff"}', 4),
('paddle_rainbow', 'Paddle Rainbow', 'Arco-íris animado', 'paddle', 'legendary', 5000, '{"colors": ["#ff0000", "#ff7f00", "#ffff00", "#00ff00", "#0000ff", "#8b00ff"], "shape": "rect", "animated": true}', 5),
('paddle_hexagon', 'Paddle Hexágono', 'Forma geométrica única', 'paddle', 'rare', 1500, '{"colors": ["#bd00ff", "#ff00cc"], "shape": "hexagon", "glow": "#bd00ff"}', 6),
('paddle_heart', 'Paddle Coração', 'Jogue com amor', 'paddle', 'epic', 2500, '{"colors": ["#ff3c6f", "#ff8a5c"], "shape": "heart", "glow": "#ff3c6f"}', 7),

-- Bolas
('ball_classic', 'Bola Clássica', 'A bola tradicional', 'ball', 'common', 0, '{"color": "#ffffff", "trail": "white"}', 10),
('ball_fire', 'Bola de Fogo', 'Chama intensa com partículas', 'ball', 'rare', 800, '{"color": "#ff5500", "trail": "fire", "particles": "fire"}', 11),
('ball_ice', 'Bola de Gelo', 'Cristais de gelo brilhantes', 'ball', 'rare', 800, '{"color": "#00ccff", "trail": "ice", "particles": "ice"}', 12),
('ball_rainbow', 'Bola Rainbow', 'Muda de cor constantemente', 'ball', 'epic', 2000, '{"color": "rainbow", "trail": "rainbow", "animated": true}', 13),
('ball_plasma', 'Bola Plasma', 'Energia pura', 'ball', 'legendary', 4000, '{"color": "#bd00ff", "trail": "plasma", "glow": "#bd00ff"}', 14),
('ball_gold', 'Bola Dourada', 'Ouro maciço', 'ball', 'rare', 1200, '{"color": "#ffd700", "trail": "gold", "glow": "#ffd700"}', 15),

-- Temas
('theme_cyberpunk', 'Tema Cyberpunk', 'Cidade neon do futuro', 'theme', 'rare', 1500, '{"bg": "#0a0a1a", "grid": "#00e5ff", "accent": "#ff3c6f"}', 20),
('theme_galaxy', 'Tema Galáxia', 'Espaço profundo', 'theme', 'epic', 2500, '{"bg": "#000022", "grid": "#ffffff", "accent": "#bd00ff", "stars": true}', 21),
('theme_retro', 'Tema Retro', 'Grid estilo Tron', 'theme', 'common', 500, '{"bg": "#000000", "grid": "#00ff00", "accent": "#00ff00", "scanlines": true}', 22),
('theme_ocean', 'Tema Oceano', 'Ondas do mar', 'theme', 'rare', 1500, '{"bg": "#001a33", "grid": "#00ccff", "accent": "#00e5ff", "waves": true}', 23),
('theme_fire', 'Tema Fogo', 'Inferno ardente', 'theme', 'epic', 2500, '{"bg": "#1a0000", "grid": "#ff5500", "accent": "#ff3c6f", "fire": true}', 24),
('theme_matrix', 'Tema Matrix', 'Chuva de código', 'theme', 'rare', 1800, '{"bg": "#000000", "grid": "#00ff00", "accent": "#00ff00", "matrix": true}', 25),

-- Efeitos de Partículas
('particles_explosion', 'Explosão de Cores', 'Partículas coloridas vibrantes', 'particles', 'common', 300, '{"style": "colorful", "colors": ["#ff3c6f", "#00e5ff", "#ffe156"]}', 30),
('particles_stars', 'Chuva de Estrelas', 'Estrelas cadentes', 'particles', 'common', 300, '{"style": "stars", "colors": ["#ffffff", "#ffe156"]}', 31),
('particles_bubbles', 'Bubbles', 'Bolhas flutuantes', 'particles', 'rare', 800, '{"style": "bubbles", "colors": ["#00e5ff", "#bd00ff"]}', 32),
('particles_glitch', 'Glitch Effect', 'Efeito digital', 'particles', 'epic', 1500, '{"style": "glitch", "colors": ["#00ff00", "#ff0000", "#0000ff"]}', 33)
ON CONFLICT (code) DO NOTHING;

-- Criar view para facilitar consultas da loja
CREATE OR REPLACE VIEW shop_with_ownership AS
SELECT 
    si.*,
    CASE WHEN ui.item_id IS NOT NULL THEN true ELSE false END as owned,
    ui.equipped,
    ui.purchased_at
FROM shop_items si
LEFT JOIN user_inventory ui ON si.id = ui.item_id;

-- Função para comprar item
CREATE OR REPLACE FUNCTION buy_item(
    p_username VARCHAR,
    p_item_id UUID
)
RETURNS TABLE (success BOOLEAN, error_message VARCHAR) AS $$
DECLARE
    v_price INTEGER;
    v_coins INTEGER;
BEGIN
    -- Verificar se item existe e está ativo
    SELECT price INTO v_price
    FROM shop_items
    WHERE id = p_item_id AND is_active = TRUE;
    
    IF v_price IS NULL THEN
        RETURN QUERY SELECT false, 'Item não encontrado ou indisponível';
        RETURN;
    END IF;
    
    -- Verificar se usuário já tem o item
    IF EXISTS (SELECT 1 FROM user_inventory WHERE username = p_username AND item_id = p_item_id) THEN
        RETURN QUERY SELECT false, 'Você já possui este item';
        RETURN;
    END IF;
    
    -- Verificar saldo de coins
    SELECT coins INTO v_coins
    FROM profiles
    WHERE username = p_username;
    
    IF v_coins IS NULL OR v_coins < v_price THEN
        RETURN QUERY SELECT false, 'Coins insuficientes';
        RETURN;
    END IF;
    
    -- Deduzir coins e adicionar ao inventário
    UPDATE profiles SET coins = coins - v_price WHERE username = p_username;
    INSERT INTO user_inventory (username, item_id) VALUES (p_username, p_item_id);
    
    RETURN QUERY SELECT true, 'Compra realizada com sucesso!';
END;
$$ LANGUAGE plpgsql;

-- Função para equipar item
CREATE OR REPLACE FUNCTION equip_item(
    p_username VARCHAR,
    p_item_id UUID
)
RETURNS BOOLEAN AS $$
DECLARE
    v_type VARCHAR;
BEGIN
    -- Verificar se usuário possui o item
    IF NOT EXISTS (SELECT 1 FROM user_inventory WHERE username = p_username AND item_id = p_item_id) THEN
        RETURN false;
    END IF;
    
    -- Obter tipo do item
    SELECT type INTO v_type
    FROM shop_items
    WHERE id = p_item_id;
    
    -- Desequipar outros itens do mesmo tipo
    UPDATE user_inventory
    SET equipped = false
    WHERE username = p_username
    AND item_id IN (
        SELECT id FROM shop_items WHERE type = v_type
    );
    
    -- Equipar o item selecionado
    UPDATE user_inventory
    SET equipped = true
    WHERE username = p_username AND item_id = p_item_id;
    
    RETURN true;
END;
$$ LANGUAGE plpgsql;

SELECT 'Loja de skins criada com sucesso!' as status;

// Brick Classico — Servidor de desenvolvimento + API Supabase
const http = require('http');
const fs = require('fs');
const path = require('path');
const { Pool } = require('pg');
const bcrypt = require('bcryptjs');
const { v4: uuidv4 } = require('uuid');
const { config } = require('./config.js');

const PORT = config.server.port;
const BASE = __dirname;

// ===== SUPABASE CONNECTION =====
const pool = new Pool(config.supabase);

pool.on('error', (err) => {
    console.error('  [DB] Erro inesperado no pool:', err.message);
});

// ===== MIME TYPES =====
const MIME = {
    '.html': 'text/html; charset=utf-8',
    '.js': 'application/javascript; charset=utf-8',
    '.css': 'text/css; charset=utf-8',
    '.png': 'image/png',
    '.jpg': 'image/jpeg',
    '.jpeg': 'image/jpeg',
    '.gif': 'image/gif',
    '.svg': 'image/svg+xml',
    '.ico': 'image/x-icon',
    '.mp3': 'audio/mpeg',
    '.wav': 'audio/wav',
    '.ogg': 'audio/ogg',
    '.json': 'application/json; charset=utf-8',
    '.woff': 'font/woff',
    '.woff2': 'font/woff2',
    '.ttf': 'font/ttf',
};

// ===== UTILITY =====
function parseBody(req) {
    return new Promise((resolve, reject) => {
        let body = '';
        req.on('data', chunk => body += chunk);
        req.on('end', () => {
            try { resolve(JSON.parse(body)); }
            catch (e) { reject(new Error('JSON invalido')); }
        });
        req.on('error', reject);
    });
}

function sendJson(res, status, data) {
    res.writeHead(status, { 'Content-Type': 'application/json; charset=utf-8' });
    res.end(JSON.stringify(data));
}

function getPathSegments(url) {
    return url.split('/').filter(Boolean);
}

function parseQuery(url) {
    const qIndex = url.indexOf('?');
    if (qIndex === -1) return {};
    const search = url.slice(qIndex + 1);
    const params = {};
    for (const part of search.split('&')) {
        const [key, val] = part.split('=').map(s => decodeURIComponent(s.replace(/\+/g, ' ')));
        if (key) params[key] = val || '';
    }
    return params;
}

// ===== API ROUTES =====

// POST /api/register
async function handleRegister(req, res) {
    const { username, password } = await parseBody(req);
    if (!username || !password) {
        return sendJson(res, 400, { success: false, error: 'Username e senha obrigatorios' });
    }
    if (username.length < 3 || username.length > 20 || !/^[a-zA-Z0-9_]+$/.test(username)) {
        return sendJson(res, 400, { success: false, error: 'Username: 3-20 caracteres, apenas letras, numeros e _' });
    }
    if (password.length < 4) {
        return sendJson(res, 400, { success: false, error: 'Senha deve ter pelo menos 4 caracteres' });
    }

    try {
        const existing = await pool.query('SELECT username FROM profiles WHERE username = $1', [username]);
        if (existing.rows.length > 0) {
            return sendJson(res, 409, { success: false, error: 'Username ja existe' });
        }

        const salt = await bcrypt.genSalt(10);
        const password_hash = await bcrypt.hash(password, salt);
        const token = uuidv4();

        await pool.query(
            'INSERT INTO profiles (username, password_hash, created_at, last_login) VALUES ($1, $2, NOW(), NOW())',
            [username, password_hash]
        );

        // Create initial save
        await pool.query(
            'INSERT INTO game_saves (username, level, score, lives) VALUES ($1, 1, 0, 7) ON CONFLICT (username) DO NOTHING',
            [username]
        );

        sendJson(res, 201, {
            success: true,
            token,
            user: { username, displayName: username, joinDate: new Date().toISOString() }
        });
    } catch (err) {
        console.error('  [API] Erro register:', err.message);
        sendJson(res, 500, { success: false, error: 'Erro interno do servidor' });
    }
}

// POST /api/login
async function handleLogin(req, res) {
    const { username, password } = await parseBody(req);
    if (!username || !password) {
        return sendJson(res, 400, { success: false, error: 'Username e senha obrigatorios' });
    }

    try {
        const result = await pool.query('SELECT password_hash FROM profiles WHERE username = $1', [username]);
        if (result.rows.length === 0) {
            return sendJson(res, 401, { success: false, error: 'Credenciais invalidas' });
        }

        const valid = await bcrypt.compare(password, result.rows[0].password_hash);
        if (!valid) {
            return sendJson(res, 401, { success: false, error: 'Credenciais invalidas' });
        }

        const token = uuidv4();
        await pool.query('UPDATE profiles SET last_login = NOW() WHERE username = $1', [username]);

        sendJson(res, 200, {
            success: true,
            token,
            user: { username, displayName: username, joinDate: new Date().toISOString() }
        });
    } catch (err) {
        console.error('  [API] Erro login:', err.message);
        sendJson(res, 500, { success: false, error: 'Erro interno do servidor' });
    }
}

// PUT /api/save/:username
async function handleSave(req, res, username) {
    try {
        const { level, score, lives, reserveLife, maxCombo, bricksBroken, powerupsCollected } = await parseBody(req);

        await pool.query(`
            INSERT INTO game_saves (username, level, score, lives, reserve_life, max_combo, bricks_broken, powerups_collected, updated_at)
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8, NOW())
            ON CONFLICT (username) DO UPDATE SET
                level = $2, score = $3, lives = $4, reserve_life = $5,
                max_combo = $6, bricks_broken = $7, powerups_collected = $8,
                updated_at = NOW()
        `, [username, level || 1, score || 0, lives || 7, reserveLife || 0,
            maxCombo || 0, bricksBroken || 0, powerupsCollected || 0]);

        // Update profile stats
        await pool.query(`
            UPDATE profiles SET
                total_games = total_games + 0,
                total_bricks = GREATEST(total_bricks, $2),
                best_score = GREATEST(best_score, $3),
                best_level = GREATEST(best_level, $4)
            WHERE username = $1
        `, [username, bricksBroken || 0, score || 0, level || 1]);

        sendJson(res, 200, { success: true });
    } catch (err) {
        console.error('  [API] Erro save:', err.message);
        sendJson(res, 500, { success: false, error: 'Erro ao salvar' });
    }
}

// GET /api/load/:username
async function handleLoad(req, res, username) {
    try {
        const result = await pool.query('SELECT * FROM game_saves WHERE username = $1', [username]);
        if (result.rows.length === 0) {
            return sendJson(res, 200, { save: null });
        }
        const s = result.rows[0];
        sendJson(res, 200, {
            save: {
                level: s.level,
                score: s.score,
                lives: s.lives,
                reserveLife: s.reserve_life,
                maxCombo: s.max_combo,
                bricksBroken: s.bricks_broken,
                powerupsCollected: s.powerups_collected,
                timestamp: s.updated_at,
            }
        });
    } catch (err) {
        console.error('  [API] Erro load:', err.message);
        sendJson(res, 500, { success: false, error: 'Erro ao carregar' });
    }
}

// GET /api/profile/:username
async function handleProfile(req, res, username) {
    try {
        const result = await pool.query(
            'SELECT username, created_at, last_login, total_games, total_bricks, best_score, best_level FROM profiles WHERE username = $1',
            [username]
        );
        if (result.rows.length === 0) {
            return sendJson(res, 404, { success: false, error: 'Perfil nao encontrado' });
        }
        const p = result.rows[0];
        sendJson(res, 200, {
            profile: {
                username: p.username,
                joinDate: p.created_at,
                lastLogin: p.last_login,
                totalGames: p.total_games,
                totalBricks: p.total_bricks,
                bestScore: p.best_score,
                bestLevel: p.best_level,
            }
        });
    } catch (err) {
        console.error('  [API] Erro profile:', err.message);
        sendJson(res, 500, { success: false, error: 'Erro ao carregar perfil' });
    }
}

// POST /api/history/:username
async function handleAddHistory(req, res, username) {
    try {
        const { score, levelReached, bricksBroken, maxCombo, powerupsCollected, durationSeconds, won } = await parseBody(req);

        await pool.query(`
            INSERT INTO game_history (username, score, level_reached, bricks_broken, max_combo, powerups_collected, duration_seconds, won, played_at)
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8, NOW())
        `, [username, score || 0, levelReached || 1, bricksBroken || 0, maxCombo || 0,
            powerupsCollected || 0, durationSeconds || 0, won || false]);

        // Update aggregated stats
        await pool.query(`
            UPDATE profiles SET
                total_games = total_games + 1,
                total_bricks = total_bricks + $2,
                best_score = GREATEST(best_score, $3),
                best_level = GREATEST(best_level, $4)
            WHERE username = $1
        `, [username, bricksBroken || 0, score || 0, levelReached || 1]);

        sendJson(res, 201, { success: true });
    } catch (err) {
        console.error('  [API] Erro addHistory:', err.message);
        sendJson(res, 500, { success: false, error: 'Erro ao registar historico' });
    }
}

// GET /api/history/:username
async function handleGetHistory(req, res, username) {
    try {
        const result = await pool.query(
            'SELECT * FROM game_history WHERE username = $1 ORDER BY played_at DESC LIMIT 20',
            [username]
        );
        sendJson(res, 200, { history: result.rows.map(h => ({
            score: h.score,
            levelReached: h.level_reached,
            bricksBroken: h.bricks_broken,
            maxCombo: h.max_combo,
            powerupsCollected: h.powerups_collected,
            durationSeconds: h.duration_seconds,
            won: h.won,
            playedAt: h.played_at,
        })) });
    } catch (err) {
        console.error('  [API] Erro getHistory:', err.message);
        sendJson(res, 500, { success: false, error: 'Erro ao carregar historico' });
    }
}

// GET /api/ranking
async function handleRanking(req, res) {
    try {
        const result = await pool.query(
            'SELECT username, best_score, best_level, total_games FROM profiles ORDER BY best_score DESC LIMIT 20'
        );
        sendJson(res, 200, {
            ranking: result.rows.map((r, i) => ({
                rank: i + 1,
                username: r.username,
                score: r.best_score,
                level: r.best_level,
                games: r.total_games,
            }))
        });
    } catch (err) {
        console.error('  [API] Erro ranking:', err.message);
        sendJson(res, 500, { success: false, error: 'Erro ao carregar ranking' });
    }
}

// ===== REQUEST ROUTER =====
const server = http.createServer((req, res) => {
    // CORS
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

    if (req.method === 'OPTIONS') {
        res.writeHead(204);
        res.end();
        return;
    }

    const url = req.url.split('?')[0];
    const segments = getPathSegments(url);

    // ===== API ROUTING =====
    if (segments[0] === 'api') {
        const route = segments.slice(1).join('/');

        // GET /api/version — versao actual do jogo
        if (route === 'version' && req.method === 'GET') {
            return sendJson(res, 200, { version: '2.0.0', name: 'Brick Clássico' });
        }

        // POST /api/register
        if (route === 'register' && req.method === 'POST') {
            return handleRegister(req, res);
        }

        // POST /api/login
        if (route === 'login' && req.method === 'POST') {
            return handleLogin(req, res);
        }

        // GET /api/ranking
        if (route === 'ranking' && req.method === 'GET') {
            return handleRanking(req, res);
        }

        // /api/:resource/:username
        if (segments.length >= 3) {
            const resource = segments[1]; // save, load, profile, history, xp, session, stats
            const username = segments[2];

            if (resource === 'save' && req.method === 'PUT') {
                return handleSave(req, res, username);
            }
            if (resource === 'load' && req.method === 'GET') {
                return handleLoad(req, res, username);
            }
            if (resource === 'profile' && req.method === 'GET') {
                return handleGetProfile(req, res, username);
            }
            if (resource === 'profile' && req.method === 'PUT') {
                return handleUpdateProfile(req, res, username);
            }
            if (resource === 'xp' && req.method === 'POST') {
                return handleAddXP(req, res, username);
            }
            if (resource === 'session' && req.method === 'POST') {
                return handleGameSession(req, res, username);
            }
            if (resource === 'stats' && req.method === 'GET') {
                return handleGetStats(req, res, username);
            }
            if (resource === 'history' && req.method === 'POST') {
                return handleAddHistory(req, res, username);
            }
            if (resource === 'history' && req.method === 'GET') {
                return handleGetHistory(req, res, username);
            }
            if (resource === 'achievements' && req.method === 'GET') {
                return handleGetAchievements(req, res, username);
            }
            if (resource === 'achievements' && req.method === 'POST') {
                return handleCheckAchievements(req, res, username);
            }
            if (resource === 'inventory' && req.method === 'GET') {
                return handleGetInventory(req, res, username);
            }
            if (resource === 'shop' && req.method === 'POST') {
                const action = segments[3]; // buy, equip
                if (action === 'buy') {
                    return handleBuyItem(req, res, username);
                }
                if (action === 'equip') {
                    return handleEquipItem(req, res, username);
                }
            }
        }
        
        // /api/:resource (sem username)
        if (segments.length === 2) {
            const resource = segments[1];
            
            if (resource === 'leaderboard' && req.method === 'GET') {
                return handleLeaderboard(req, res);
            }
            if (resource === 'achievements' && req.method === 'GET') {
                return handleGetAllAchievements(req, res);
            }
            if (resource === 'shop' && req.method === 'GET') {
                return handleGetShop(req, res);
            }
        }

        return sendJson(res, 404, { success: false, error: 'Rota nao encontrada' });
    }

    // ===== STATIC FILE SERVING (original logic preserved) =====
    let filePath = url;
    try { filePath = decodeURIComponent(filePath); } catch (e) {}
    if (filePath === '/') filePath = '/index.html';
    filePath = path.join(BASE, filePath);
    filePath = path.normalize(filePath);
    if (!filePath.startsWith(BASE)) {
        res.writeHead(403);
        res.end('Forbidden');
        return;
    }

    const ext = path.extname(filePath).toLowerCase();
    const contentType = MIME[ext] || 'application/octet-stream';

    fs.readFile(filePath, (err, data) => {
        if (err) {
            if (err.code === 'ENOENT') {
                res.writeHead(404);
                res.end('404 — Ficheiro nao encontrado');
            } else {
                res.writeHead(500);
                res.end('500 — Erro interno');
            }
            return;
        }
        res.writeHead(200, { 'Content-Type': contentType });
        res.end(data);
    });
});

// ===== PROFILE API ENDPOINTS =====

async function handleGetProfile(req, res, username) {
    try {
        const result = await pool.query(
            'SELECT * FROM profiles WHERE username = $1',
            [username]
        );
        if (result.rows.length === 0) {
            return sendJson(res, 404, { success: false, error: 'Perfil nao encontrado' });
        }
        return sendJson(res, 200, { success: true, profile: result.rows[0] });
    } catch (err) {
        console.error('  [DB] Erro ao obter perfil:', err.message);
        return sendJson(res, 500, { success: false, error: 'Erro ao obter perfil' });
    }
}

async function handleUpdateProfile(req, res, username) {
    const body = await parseBody(req);
    const { display_name, bio, avatar_type, avatar_url, favorite_theme } = body;
    
    try {
        const result = await pool.query(
            `UPDATE profiles 
             SET display_name = COALESCE($1, display_name),
                 bio = COALESCE($2, bio),
                 avatar_type = COALESCE($3, avatar_type),
                 avatar_url = COALESCE($4, avatar_url),
                 favorite_theme = COALESCE($5, favorite_theme),
                 updated_at = NOW()
             WHERE username = $6
             RETURNING *`,
            [display_name, bio, avatar_type, avatar_url, favorite_theme, username]
        );
        return sendJson(res, 200, { success: true, profile: result.rows[0] });
    } catch (err) {
        console.error('  [DB] Erro ao atualizar perfil:', err.message);
        return sendJson(res, 500, { success: false, error: 'Erro ao atualizar perfil' });
    }
}

async function handleAddXP(req, res, username) {
    const body = await parseBody(req);
    const { amount, reason } = body;
    
    if (!amount || amount <= 0) {
        return sendJson(res, 400, { success: false, error: 'Quantidade de XP invalida' });
    }
    
    const client = await pool.connect();
    try {
        await client.query('BEGIN');
        
        // Adicionar XP ao perfil
        await client.query(
            'UPDATE profiles SET xp = xp + $1, updated_at = NOW() WHERE username = $2',
            [amount, username]
        );
        
        // Registrar no log
        await client.query(
            'INSERT INTO xp_log (username, amount, reason) VALUES ($1, $2, $3)',
            [username, amount, reason || 'game']
        );
        
        // Obter perfil atualizado
        const profileResult = await client.query(
            'SELECT * FROM profiles WHERE username = $1',
            [username]
        );
        
        await client.query('COMMIT');
        return sendJson(res, 200, { 
            success: true, 
            profile: profileResult.rows[0],
            xp_added: amount 
        });
    } catch (err) {
        await client.query('ROLLBACK');
        console.error('  [DB] Erro ao adicionar XP:', err.message);
        return sendJson(res, 500, { success: false, error: 'Erro ao adicionar XP' });
    } finally {
        client.release();
    }
}

async function handleLeaderboard(req, res) {
    const { mode = 'xp', limit = 50 } = parseQuery(req);
    const validModes = ['xp', 'level', 'best_score', 'total_games'];
    const orderBy = validModes.includes(mode) ? mode : 'xp';
    
    try {
        const result = await pool.query(
            `SELECT username, display_name, avatar_url, xp, level, title, 
                    best_score, total_games, total_bricks
             FROM profiles 
             ORDER BY ${orderBy} DESC 
             LIMIT $1`,
            [Math.min(parseInt(limit) || 50, 100)]
        );
        return sendJson(res, 200, { success: true, leaderboard: result.rows });
    } catch (err) {
        console.error('  [DB] Erro ao obter leaderboard:', err.message);
        return sendJson(res, 500, { success: false, error: 'Erro ao obter leaderboard' });
    }
}

async function handleGameSession(req, res, username) {
    const body = await parseBody(req);
    const { 
        mode, score, level, duration, 
        bricks_broken, max_combo, powerups_collected, 
        accuracy, won 
    } = body;
    
    const client = await pool.connect();
    try {
        await client.query('BEGIN');
        
        // Inserir game session
        const sessionResult = await client.query(
            `INSERT INTO game_sessions 
             (username, mode, score, level, duration, bricks_broken, max_combo, powerups_collected, accuracy, won, ended_at)
             VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, NOW())
             RETURNING *`,
            [username, mode || 'classic', score || 0, level || 1, duration || 0,
             bricks_broken || 0, max_combo || 0, powerups_collected || 0, 
             accuracy || 0, won || false]
        );
        
        // Atualizar estatísticas do perfil
        await client.query(
            `UPDATE profiles 
             SET total_games = total_games + 1,
                 total_hours = total_hours + $1,
                 best_score = GREATEST(best_score, $2),
                 best_level = GREATEST(best_level, $3),
                 total_bricks = total_bricks + $4,
                 updated_at = NOW()
             WHERE username = $5`,
            [Math.ceil((duration || 0) / 60), score || 0, level || 1, bricks_broken || 0, username]
        );
        
        // Atualizar stats diários
        await client.query(
            `INSERT INTO stats_daily (username, date, games_count, total_score, total_time, best_score, bricks_broken)
             VALUES ($1, CURRENT_DATE, 1, $2, $3, $4, $5)
             ON CONFLICT (username, date) 
             DO UPDATE SET 
                games_count = stats_daily.games_count + 1,
                total_score = stats_daily.total_score + $2,
                avg_score = (stats_daily.total_score + $2) / (stats_daily.games_count + 1),
                total_time = stats_daily.total_time + $3,
                best_score = GREATEST(stats_daily.best_score, $4),
                bricks_broken = stats_daily.bricks_broken + $5`,
            [username, score || 0, Math.ceil((duration || 0) / 60), score || 0, bricks_broken || 0]
        );
        
        await client.query('COMMIT');
        return sendJson(res, 200, { success: true, session: sessionResult.rows[0] });
    } catch (err) {
        await client.query('ROLLBACK');
        console.error('  [DB] Erro ao registrar sessao:', err.message);
        return sendJson(res, 500, { success: false, error: 'Erro ao registrar sessao' });
    } finally {
        client.release();
    }
}

async function handleGetStats(req, res, username) {
    try {
        // Perfil
        const profileResult = await pool.query(
            'SELECT * FROM profiles WHERE username = $1',
            [username]
        );
        
        // Últimas sessões
        const sessionsResult = await pool.query(
            `SELECT * FROM game_sessions 
             WHERE username = $1 
             ORDER BY started_at DESC 
             LIMIT 20`,
            [username]
        );
        
        // Stats diários (últimos 30 dias)
        const dailyResult = await pool.query(
            `SELECT * FROM stats_daily 
             WHERE username = $1 AND date >= CURRENT_DATE - INTERVAL '30 days'
             ORDER BY date DESC`,
            [username]
        );
        
        // Resumo geral
        const summaryResult = await pool.query(
            `SELECT 
                COUNT(*) as total_sessions,
                AVG(score) as avg_score,
                MAX(score) as max_score,
                SUM(duration) as total_duration,
                AVG(accuracy) as avg_accuracy,
                SUM(bricks_broken) as total_bricks,
                MAX(max_combo) as best_combo
             FROM game_sessions 
             WHERE username = $1`,
            [username]
        );
        
        return sendJson(res, 200, { 
            success: true, 
            profile: profileResult.rows[0] || null,
            recent_sessions: sessionsResult.rows,
            daily_stats: dailyResult.rows,
            summary: summaryResult.rows[0]
        });
    } catch (err) {
        console.error('  [DB] Erro ao obter estatísticas:', err.message);
        return sendJson(res, 500, { success: false, error: 'Erro ao obter estatísticas' });
    }
}

// ===== ACHIEVEMENTS API ENDPOINTS =====

async function handleGetAchievements(req, res, username) {
    try {
        const result = await pool.query(
            `SELECT a.*, 
                    CASE WHEN ua.achievement_id IS NOT NULL THEN true ELSE false END as unlocked,
                    ua.unlocked_at,
                    ua.progress
             FROM achievements a
             LEFT JOIN user_achievements ua ON a.id = ua.achievement_id AND ua.username = $1
             ORDER BY a.sort_order, a.category, a.rarity`,
            [username]
        );
        return sendJson(res, 200, { success: true, achievements: result.rows });
    } catch (err) {
        console.error('  [DB] Erro ao obter conquistas:', err.message);
        return sendJson(res, 500, { success: false, error: 'Erro ao obter conquistas' });
    }
}

async function handleCheckAchievements(req, res, username) {
    const body = await parseBody(req);
    const { condition_type, value } = body;

    if (!condition_type || !value) {
        return sendJson(res, 400, { success: false, error: 'Tipo e valor obrigatórios' });
    }

    const client = await pool.connect();
    try {
        await client.query('BEGIN');

        // Buscar conquistas que se encaixam na condição e ainda não foram desbloqueadas
        const achievements = await client.query(
            `SELECT id, name, icon, reward_xp, reward_coins, condition_value
             FROM achievements
             WHERE condition_type = $1 AND condition_value <= $2
             AND id NOT IN (SELECT achievement_id FROM user_achievements WHERE username = $3)
             ORDER BY condition_value ASC`,
            [condition_type, value, username]
        );

        const unlocked = [];

        for (const achievement of achievements.rows) {
            // Inserir conquista desbloqueada
            await client.query(
                'INSERT INTO user_achievements (username, achievement_id, unlocked_at) VALUES ($1, $2, NOW()) ON CONFLICT DO NOTHING',
                [username, achievement.id]
            );

            // Adicionar recompensas
            await client.query(
                'UPDATE profiles SET xp = COALESCE(xp,0) + $1, coins = COALESCE(coins,0) + $2, updated_at = NOW() WHERE username = $3',
                [achievement.reward_xp || 0, achievement.reward_coins || 0, username]
            );

            unlocked.push({
                id: achievement.id,
                name: achievement.name,
                icon: achievement.icon,
                reward_xp: achievement.reward_xp || 0,
                reward_coins: achievement.reward_coins || 0
            });
        }
        
        await client.query('COMMIT');
        return sendJson(res, 200, { success: true, unlocked: unlocked });
    } catch (err) {
        await client.query('ROLLBACK');
        console.error('  [DB] Erro ao verificar conquistas:', err.message);
        return sendJson(res, 500, { success: false, error: 'Erro ao verificar conquistas' });
    } finally {
        client.release();
    }
}

async function handleGetAllAchievements(req, res) {
    try {
        const result = await pool.query(
            'SELECT * FROM achievements ORDER BY sort_order, category, rarity'
        );
        return sendJson(res, 200, { success: true, achievements: result.rows });
    } catch (err) {
        console.error('  [DB] Erro ao obter todas conquistas:', err.message);
        return sendJson(res, 500, { success: false, error: 'Erro ao obter conquistas' });
    }
}

// ===== SHOP API ENDPOINTS =====

async function handleGetShop(req, res) {
    const { type } = parseQuery(req);
    try {
        let query = 'SELECT * FROM shop_items WHERE is_active = TRUE';
        const params = [];
        if (type) {
            query += ' AND type = $1';
            params.push(type);
        }
        query += ' ORDER BY sort_order, type, rarity';
        const result = await pool.query(query, params);
        return sendJson(res, 200, { success: true, items: result.rows });
    } catch (err) {
        console.error('  [DB] Erro ao obter loja:', err.message);
        return sendJson(res, 500, { success: false, error: 'Erro ao obter loja' });
    }
}

async function handleGetInventory(req, res, username) {
    try {
        const result = await pool.query(
            `SELECT si.*, ui.equipped, ui.purchased_at
             FROM shop_items si
             INNER JOIN user_inventory ui ON si.id = ui.item_id
             WHERE ui.username = $1
             ORDER BY si.type, si.sort_order`,
            [username]
        );
        return sendJson(res, 200, { success: true, inventory: result.rows });
    } catch (err) {
        console.error('  [DB] Erro ao obter inventário:', err.message);
        return sendJson(res, 500, { success: false, error: 'Erro ao obter inventário' });
    }
}

async function handleBuyItem(req, res, username) {
    const body = await parseBody(req);
    const { item_id } = body;
    if (!item_id) {
        return sendJson(res, 400, { success: false, error: 'ID do item obrigatório' });
    }
    const client = await pool.connect();
    try {
        await client.query('BEGIN');

        // Verificar se já possui o item
        const owned = await client.query(
            'SELECT id FROM user_inventory WHERE username = $1 AND item_id = $2',
            [username, item_id]
        );
        if (owned.rows.length > 0) {
            await client.query('COMMIT');
            return sendJson(res, 400, { success: false, error: 'Item já possuído' });
        }

        // Buscar item e preço
        const item = await client.query(
            'SELECT price FROM shop_items WHERE id = $1 AND is_active = TRUE',
            [item_id]
        );
        if (item.rows.length === 0) {
            await client.query('ROLLBACK');
            return sendJson(res, 404, { success: false, error: 'Item não encontrado' });
        }

        const price = item.rows[0].price;

        // Verificar coins do usuário
        const profile = await client.query(
            'SELECT COALESCE(coins,0) as coins FROM profiles WHERE username = $1',
            [username]
        );
        if (profile.rows.length === 0) {
            await client.query('ROLLBACK');
            return sendJson(res, 404, { success: false, error: 'Perfil não encontrado' });
        }

        const userCoins = profile.rows[0].coins;
        if (userCoins < price) {
            await client.query('ROLLBACK');
            return sendJson(res, 400, { success: false, error: 'Coins insuficientes' });
        }

        // Deduzir coins e adicionar ao inventário
        await client.query(
            'UPDATE profiles SET coins = coins - $1, updated_at = NOW() WHERE username = $2',
            [price, username]
        );
        await client.query(
            'INSERT INTO user_inventory (username, item_id, purchased_at) VALUES ($1, $2, NOW())',
            [username, item_id]
        );

        await client.query('COMMIT');
        return sendJson(res, 200, { success: true, message: 'Item comprado com sucesso!' });
    } catch (err) {
        await client.query('ROLLBACK');
        console.error('  [DB] Erro ao comprar item:', err.message);
        return sendJson(res, 500, { success: false, error: 'Erro ao comprar item' });
    } finally {
        client.release();
    }
}

async function handleEquipItem(req, res, username) {
    const body = await parseBody(req);
    const { item_id } = body;
    if (!item_id) {
        return sendJson(res, 400, { success: false, error: 'ID do item obrigatório' });
    }
    const client = await pool.connect();
    try {
        await client.query('BEGIN');

        // Verificar se possui o item
        const owned = await client.query(
            'SELECT id FROM user_inventory WHERE username = $1 AND item_id = $2',
            [username, item_id]
        );
        if (owned.rows.length === 0) {
            await client.query('ROLLBACK');
            return sendJson(res, 400, { success: false, error: 'Item não possuído' });
        }

        // Desequipar todos os itens do mesmo tipo
        await client.query(
            `UPDATE user_inventory SET equipped = FALSE
             WHERE username = $1 AND item_id IN (
                SELECT id FROM shop_items WHERE type = (SELECT type FROM shop_items WHERE id = $2)
             )`,
            [username, item_id]
        );

        // Equipar o item selecionado
        await client.query(
            'UPDATE user_inventory SET equipped = TRUE WHERE username = $1 AND item_id = $2',
            [username, item_id]
        );

        await client.query('COMMIT');
        return sendJson(res, 200, { success: true, message: 'Item equipado!' });
    } catch (err) {
        await client.query('ROLLBACK');
        console.error('  [DB] Erro ao equipar item:', err.message);
        return sendJson(res, 500, { success: false, error: 'Erro ao equipar item' });
    } finally {
        client.release();
    }
}

server.listen(PORT, () => {
    console.log('');
    console.log('  ╔══════════════════════════════════╗');
    console.log('  ║     BRICK CLASSICO — SERVER       ║');
    console.log('  ╠══════════════════════════════════╣');
    console.log(`  ║  http://localhost:${PORT}            ║`);
    console.log('  ║  Supabase: Conectado              ║');
    console.log('  ║  API: /api/*                     ║');
    console.log('  ║  Ctrl+C para parar               ║');
    console.log('  ╚══════════════════════════════════╝');
    console.log('');
});

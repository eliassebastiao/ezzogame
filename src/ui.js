// ui.js — Manipulação DOM (HUD, overlays, popups, powerups, high scores, stats)

import {
    state,
    livesDisplayEl, reserveBadge,
    comboPopup, screenFlash, levelBanner,
    gameOverOverlay, winOverlay,
    scoreDisplay, levelDisplay, comboDisplay,
} from './state.js';

import { playSound, playLifeDown } from './audio.js';

import { getDisplayName, isLoggedIn, getUsername, logout } from './auth.js';
import { hasSavedGame, getSavedLevel, getGameHistory } from './save.js';
import { apiGetRanking, apiGetProfile, apiGetHistory, checkServerReachability } from './supabase.js';
import { getProfile, updateProfile, getStats, xpProgress, generateInitialsAvatar, AVATAR_PRESETS, generateEmojiAvatar } from './profile.js';
import { showAchievementsPanel } from './achievements.js';

// ===== VIDAS =====
export function updateLivesDisplay() {
    livesDisplayEl.innerHTML = '';
    const total = state.maxLives + 1;
    for (let i = 0; i < total; i++) {
        const el = document.createElement('div');
        if (i < state.lives) {
            el.className = 'life-icon active';
        } else if (i === state.maxLives && state.reserveLife > 0) {
            el.className = 'life-icon active reserve';
        } else if (i >= state.maxLives) {
            el.className = 'life-icon reserve-slot';
        } else {
            el.className = 'life-icon lost';
        }
        livesDisplayEl.appendChild(el);
    }
    if (state.reserveLife > 0) {
        reserveBadge.textContent = '+' + state.reserveLife;
        reserveBadge.style.display = 'inline';
    } else {
        reserveBadge.textContent = '';
        reserveBadge.style.display = 'none';
    }
}

// ===== LEVEL BANNER =====
export function showLevelBanner(text) {
    levelBanner.textContent = text;
    levelBanner.classList.remove('show');
    void levelBanner.offsetWidth;
    levelBanner.classList.add('show');

    // Grid ripple no centro do ecrã
    state.gridRipples.push({
        x: 320,
        y: 240,
        life: 1,
        maxRadius: 120,
        strength: 3,
    });

    // Partículas de level up (via comboParticles vector)
    const themeColor = '#00e5ff'; // accent2 padrão
    for (let i = 0; i < 12; i++) {
        const a = (i / 12) * Math.PI * 2;
        state.comboParticles.push({
            x: 320,
            y: 240,
            dx: Math.cos(a) * (4 + Math.random() * 3),
            dy: Math.sin(a) * (4 + Math.random() * 3),
            life: 1,
            decay: 0.025,
            size: 4 + Math.random() * 3,
            color: themeColor,
            gravity: -0.01,
        });
    }
}

// ===== COMBO POPUP =====
export function showComboPopup(info) {
    comboPopup.textContent = info.name;
    comboPopup.style.color = info.color;
    comboPopup.className = 'combo-popup';
    void comboPopup.offsetWidth;
    if (info.tier === 'master') {
        comboPopup.classList.add('master');
    } else if (info.tier === 'gold') {
        comboPopup.classList.add('gold');
    } else {
        comboPopup.classList.add('show');
    }
}

// ===== SCREEN FLASH =====
export function flashScreen(color, intensity) {
    screenFlash.style.background = color || 'rgba(255,215,0,0.3)';
    screenFlash.classList.add('flash');
    state.flashOverlay = intensity || 8;
    setTimeout(() => screenFlash.classList.remove('flash'), 150);
}

// ===== OVERLAYS =====
export function showGameOver() {
    document.getElementById('finalScore').textContent = state.score;
    document.getElementById('finalLevel').textContent = 'Nivel ' + state.level;
    updateStatsDisplay();
    checkAndSaveHighScore();
    gameOverOverlay.classList.remove('hidden');
}

export function showWin() {
    document.getElementById('winScore').textContent = state.score;
    checkAndSaveHighScore();
    winOverlay.classList.remove('hidden');
}

// ===== POWERUP INDICATORS =====
export function updatePowerupIndicators() {
    const container = document.getElementById('powerupIndicators');
    if (!container) return;

    const active = [];

    // Powerups com timer
    if (state.powerupTimers.expand > 0) {
        active.push({ icon: 'E', label: 'EXPAND', timer: state.powerupTimers.expand, maxTimer: 600, color: '#00e5ff' });
    }
    if (state.powerupTimers.fireball > 0) {
        active.push({ icon: 'F', label: 'FIRE', timer: state.powerupTimers.fireball, maxTimer: 420, color: '#ff3c6f' });
    }
    if (state.powerupTimers.laser > 0) {
        active.push({ icon: 'L', label: 'LASER', timer: state.powerupTimers.laser, maxTimer: 360, color: '#39ff14' });
    }
    if (state.hasShield) {
        active.push({ icon: 'S', label: 'SHIELD', timer: -1, maxTimer: 1, color: '#bd00ff' });
    }
    if (state.powerupTimers.magnet > 0) {
        active.push({ icon: 'M', label: 'MAGNET', timer: state.powerupTimers.magnet, maxTimer: 480, color: '#ff00ff' });
    }
    if (state.powerupTimers.slow > 0) {
        active.push({ icon: 'W', label: 'SLOW', timer: state.powerupTimers.slow, maxTimer: 360, color: '#4488ff' });
    }
    if (state.powerupTimers.ghost > 0) {
        active.push({ icon: 'G', label: 'GHOST', timer: state.powerupTimers.ghost, maxTimer: 300, color: '#ffffff' });
    }
    if (state.powerupTimers.mega > 0) {
        active.push({ icon: 'X', label: 'MEGA', timer: state.powerupTimers.mega, maxTimer: 240, color: '#ff8800' });
    }
    if (state.powerupTimers.drone > 0) {
        active.push({ icon: 'D', label: 'DRONE', timer: state.powerupTimers.drone, maxTimer: 540, color: '#ff6600' });
    }

    if (active.length === 0) {
        if (container.innerHTML !== '') container.innerHTML = '';
    } else {
        const html = active.map(p => {
            const pct = p.timer >= 0 ? Math.round((p.timer / p.maxTimer) * 100) : 100;
            const timeStr = p.timer >= 0 ? Math.ceil(p.timer / 60) + 's' : '';
            return `<div class="powerup-indicator" style="border-color:${p.color}40;">
                <span class="pup-icon" style="color:${p.color}">${p.icon}</span>
                <span class="pup-timer">${timeStr}</span>
                <div class="pup-bar"><div class="pup-bar-fill" style="width:${pct}%;background:${p.color}"></div></div>
            </div>`;
        }).join('');
        if (container.innerHTML !== html) container.innerHTML = html;
    }

    // Stored powerups display
    const storedContainer = document.getElementById('storedPowerups');
    if (storedContainer) {
        if (state.storedPowerups.length === 0) {
            if (storedContainer.innerHTML !== '') storedContainer.innerHTML = '';
        } else {
            const storedHtml = state.storedPowerups.map((type, idx) => {
                const icons = {
                    expand: 'E', fireball: 'F', laser: 'L', shield: 'S', multiball: 'M',
                    magnet: 'M', slow: 'W', ghost: 'G', mega: 'X', drone: 'D', bomb: 'B'
                };
                const colors = {
                    expand: '#00e5ff', fireball: '#ff3c6f', laser: '#39ff14', shield: '#bd00ff', multiball: '#ffd700',
                    magnet: '#ff00ff', slow: '#4488ff', ghost: '#ffffff', mega: '#ff8800', drone: '#ff6600', bomb: '#ff0000'
                };
                return `<div class="stored-pup" onclick="window._useStoredPowerup(${idx})">
                    <span class="stored-key">${idx + 1}</span>
                    <span style="color:${colors[type] || '#fff'}">${icons[type] || '?'}</span>
                </div>`;
            }).join('');
            if (storedContainer.innerHTML !== storedHtml) storedContainer.innerHTML = storedHtml;
        }
    }
}

// ===== COMBO METER =====
const COMBO_THRESHOLDS = [4, 5, 6, 7, 8, 9, 10, 11, 15];

export function updateComboMeter() {
    const fill = document.getElementById('comboMeterFill');
    const wrap = document.querySelector('.combo-meter');
    if (!fill) return;

    const combo = state.combo;

    // Find next threshold
    let nextTier = 0;
    let currentTier = 0;
    for (const t of COMBO_THRESHOLDS) {
        if (combo < t) { nextTier = t; break; }
        currentTier = t;
    }

    if (combo === 0 || nextTier === 0) {
        fill.style.width = '0%';
        fill.style.background = 'var(--accent3)';
        if (wrap) wrap.style.boxShadow = 'none';
        return;
    }

    const range = nextTier - currentTier;
    const progress = range > 0 ? ((combo - currentTier) / range) * 100 : 100;

    // Color shifts from yellow toward next tier color
    const tierColors = ['#44ff88', '#00e5ff', '#a78bfa', '#f472b6', '#ff7849', '#ffe156', '#ffe156', '#ffd700', '#ff3c6f'];
    const idx = COMBO_THRESHOLDS.indexOf(nextTier);
    const color = idx >= 0 ? tierColors[idx] : '#ffe156';

    fill.style.width = Math.min(progress, 100) + '%';
    fill.style.background = color;

    // Pulsar do meter wrap em combos altos
    if (wrap && combo >= 8) {
        const pulse = Math.sin(Date.now() * 0.006) * 0.3 + 0.7;
        wrap.style.boxShadow = `0 0 ${6 + pulse * 12}px ${color}`;
    } else if (wrap) {
        wrap.style.boxShadow = 'none';
    }
}

// ===== STATS DISPLAY =====
export function updateStatsDisplay() {
    const elapsed = state.stats.startTime ? Math.floor((Date.now() - state.stats.startTime) / 1000) : 0;
    const mins = Math.floor(elapsed / 60);
    const secs = elapsed % 60;
    const timeStr = mins > 0 ? mins + 'm ' + secs + 's' : secs + 's';

    const bricksEl = document.getElementById('statBricks');
    const comboEl = document.getElementById('statCombo');
    const pupEl = document.getElementById('statPowerups');
    const timeEl = document.getElementById('statTime');

    if (bricksEl) bricksEl.textContent = state.stats.bricksBroken;
    if (comboEl) comboEl.textContent = 'x' + state.stats.maxCombo;
    if (pupEl) pupEl.textContent = state.stats.powerupsCollected;
    if (timeEl) timeEl.textContent = timeStr;
}

// ===== HIGH SCORES =====
const HS_KEY = 'brickClassicoHighScores';
const MAX_HS = 5;

export function loadHighScores() {
    try {
        const data = localStorage.getItem(HS_KEY);
        return data ? JSON.parse(data) : [];
    } catch (e) {
        return [];
    }
}

export function saveHighScores(scores) {
    try {
        localStorage.setItem(HS_KEY, JSON.stringify(scores));
    } catch (e) {}
}

export function checkAndSaveHighScore() {
    const scores = loadHighScores();
    const entry = {
        score: state.score,
        level: state.level,
        bricks: state.stats.bricksBroken,
        date: Date.now(),
    };

    scores.push(entry);
    scores.sort((a, b) => b.score - a.score);
    const top = scores.slice(0, MAX_HS);
    saveHighScores(top);
    displayHighScores();
}

export function displayHighScores() {
    const section = document.getElementById('highscoreSection');
    const list = document.getElementById('highscoreList');
    if (!section || !list) return;

    const scores = loadHighScores();
    if (scores.length === 0) {
        section.style.display = 'none';
        return;
    }

    section.style.display = 'block';

    const medalIcons = ['1', '2', '3'];
    list.innerHTML = scores.map((s, i) => {
        const rank = medalIcons[i] || (i + 1);
        return `<li class="highscore-entry">
            <span class="hs-rank">${rank}</span>
            <span class="hs-score">${s.score.toLocaleString()}</span>
            <span class="hs-level">N${s.level}</span>
        </li>`;
    }).join('');
    updateStartOverlay();
}

// ===== USER INDICATOR =====
export function updateUserIndicator() {
    const el = document.getElementById('userNameDisplay');
    if (!el) return;
    const name = getDisplayName();
    el.textContent = name;
    el.className = 'user-name' + (isLoggedIn() ? ' logged-in' : '');
}

// ===== AUTH OVERLAY =====
let authMode = 'login';

export function showAuthOverlay(mode) {
    authMode = mode || 'login';
    const overlay = document.getElementById('authOverlay');
    const title = document.getElementById('authTitle');
    const submitBtn = document.getElementById('authSubmitBtn');
    const toggleBtn = document.getElementById('authToggleBtn');
    const confirmField = document.getElementById('authConfirmField');
    const errorEl = document.getElementById('authError');
    const successEl = document.getElementById('authSuccess');
    const usernameInput = document.getElementById('authUsername');
    const passwordInput = document.getElementById('authPassword');
    const confirmInput = document.getElementById('authConfirm');

    usernameInput.value = '';
    passwordInput.value = '';
    confirmInput.value = '';
    errorEl.textContent = '';
    successEl.style.display = 'none';

    if (authMode === 'register') {
        title.textContent = 'CRIAR CONTA';
        submitBtn.textContent = 'CRIAR';
        toggleBtn.textContent = 'Ja tenho conta';
        confirmField.classList.remove('hidden');
    } else {
        title.textContent = 'ENTRAR';
        submitBtn.textContent = 'ENTRAR';
        toggleBtn.textContent = 'Criar Conta';
        confirmField.classList.add('hidden');
    }

    overlay.classList.remove('hidden');
    setTimeout(() => usernameInput.focus(), 100);
}

export function hideAuthOverlay() {
    document.getElementById('authOverlay').classList.add('hidden');
}

export function getAuthMode() { return authMode; }

// ===== TRIAL WALL =====
export function showTrialWall(score, level) {
    document.getElementById('trialScore').textContent =
        (score || 0).toLocaleString() + ' pts';
    document.getElementById('trialLevel').textContent =
        'Nivel ' + (level || state.level || 10);
    document.getElementById('trialWallOverlay').classList.remove('hidden');
}

export function hideTrialWall() {
    document.getElementById('trialWallOverlay').classList.add('hidden');
}

// ===== START OVERLAY =====
export function updateStartOverlay() {
    const contSection = document.getElementById('continueSection');
    if (hasSavedGame()) {
        contSection.classList.add('visible');
        document.getElementById('continueBtn').textContent =
            'CONTINUAR (Nivel ' + getSavedLevel() + ')';
    } else {
        contSection.classList.remove('visible');
    }

    const profileBar = document.getElementById('profileBar');
    if (isLoggedIn()) {
        profileBar.classList.add('visible');
        document.getElementById('profileName').textContent = getUsername();
        apiGetProfile(getUsername()).then(result => {
            if (result && result.profile) {
                const p = result.profile;
                document.getElementById('profileStats').textContent =
                    'Melhor: ' + p.bestScore + ' pts · Nivel ' + p.bestLevel + ' · ' + p.totalGames + ' jogos';
            }
        }).catch(() => {});
    } else {
        profileBar.classList.remove('visible');
    }

    loadRanking();
}

// ===== RANKING =====
export async function loadRanking() {
    const section = document.getElementById('rankingSection');
    const list = document.getElementById('rankingList');
    const loading = document.getElementById('rankingLoading');
    if (!section) return;

    section.style.display = 'block';
    loading.textContent = 'A carregar...';

    const result = await apiGetRanking();
    if (!result || !result.ranking || result.ranking.length === 0) {
        loading.textContent = 'Nenhum ranking disponivel';
        list.innerHTML = '';
        return;
    }

    loading.style.display = 'none';
    list.innerHTML = result.ranking.map(r =>
        `<li class="highscore-entry">
            <span class="hs-rank">${r.rank}.</span>
            <span style="color:var(--accent2);font-size:8px;">${r.username}</span>
            <span class="hs-score">${r.score}</span>
            <span class="hs-level">Nv ${r.level}</span>
        </li>`
    ).join('');
}

// ===== PROFILE OVERLAY =====
export async function showProfileOverlay() {
    if (!isLoggedIn()) return;

    const overlay = document.getElementById('profileOverlay');
    document.getElementById('profileTitle').textContent = getUsername();
    overlay.classList.remove('hidden');

    const profResult = await apiGetProfile(getUsername());
    if (profResult && profResult.profile) {
        const p = profResult.profile;
        document.getElementById('profGames').textContent = p.totalGames || 0;
        document.getElementById('profBestScore').textContent = p.bestScore || 0;
        document.getElementById('profBestLevel').textContent = p.bestLevel || 1;
        document.getElementById('profBricks').textContent = p.totalBricks || 0;
    }

    const histResult = await apiGetHistory(getUsername());
    const histContainer = document.getElementById('historyList');
    if (histResult && histResult.history && histResult.history.length > 0) {
        histContainer.innerHTML = histResult.history.slice(0, 10).map(h => {
            const date = new Date(h.playedAt).toLocaleDateString();
            return '<div class="history-entry">' +
                '<span class="h-result ' + (h.won ? 'win' : 'loss') + '">' + (h.won ? 'V' : 'D') + '</span>' +
                '<span class="h-score">' + h.score + '</span>' +
                '<span>Nv ' + h.levelReached + '</span>' +
                '<span>' + date + '</span>' +
                '</div>';
        }).join('');
    } else {
        const localHist = getGameHistory();
        if (localHist.length > 0) {
            const recent = localHist.slice(-10).reverse();
            histContainer.innerHTML = recent.map(h => {
                const date = new Date(h.date).toLocaleDateString();
                return '<div class="history-entry">' +
                    '<span class="h-result ' + (h.won ? 'win' : 'loss') + '">' + (h.won ? 'V' : 'D') + '</span>' +
                    '<span class="h-score">' + h.score + '</span>' +
                    '<span>Nv ' + h.levelReached + '</span>' +
                    '<span>' + date + '</span>' +
                    '</div>';
            }).join('');
        } else {
            histContainer.innerHTML = '<div class="ranking-loading">Nenhuma partida ainda</div>';
        }
    }
}

export function hideProfileOverlay() {
    document.getElementById('profileOverlay').classList.add('hidden');
}

// ===== AUTH BUTTON WIRING =====
export function wireAuthButtons() {
    document.getElementById('authBtn').addEventListener('click', () => {
        if (isLoggedIn()) {
            showProfileOverlay();
        } else {
            showAuthOverlay('login');
        }
    });

    document.getElementById('authSubmitBtn').addEventListener('click', async () => {
        const username = document.getElementById('authUsername').value.trim();
        const password = document.getElementById('authPassword').value;
        const errorEl = document.getElementById('authError');
        const successEl = document.getElementById('authSuccess');

        if (!username || !password) {
            errorEl.textContent = 'Preenche todos os campos';
            return;
        }

        if (getAuthMode() === 'register') {
            const confirmEl = document.getElementById('authConfirm');
            if (password !== confirmEl.value) {
                errorEl.textContent = 'Senhas nao coincidem';
                return;
            }
            if (password.length < 4) {
                errorEl.textContent = 'Senha deve ter pelo menos 4 caracteres';
                return;
            }
        }

        // Mostrar loading
        const submitBtn = document.getElementById('authSubmitBtn');
        const originalText = submitBtn.textContent;
        submitBtn.textContent = 'A carregar...';
        submitBtn.disabled = true;
        errorEl.textContent = '';

        try {
            const { register, login } = await import('./auth.js');
            let result;
            if (getAuthMode() === 'register') {
                result = await register(username, password);
            } else {
                result = await login(username, password);
            }

            if (result && result.success) {
                successEl.textContent = getAuthMode() === 'register' ? 'Conta criada com sucesso!' : 'Login efetuado!';
                successEl.style.display = 'block';
                setTimeout(() => {
                    hideAuthOverlay();
                    updateUserIndicator();
                    updateStartOverlay();
                    successEl.style.display = 'none';
                    if (!document.getElementById('trialWallOverlay').classList.contains('hidden')) {
                        hideTrialWall();
                    }
                }, 1000);
            } else {
                errorEl.textContent = result?.error || 'Erro ao conectar ao servidor';
                console.error('[Auth] Erro:', result?.error || 'Erro desconhecido');
            }
        } catch (err) {
            console.error('[Auth] Erro inesperado:', err);
            errorEl.textContent = 'Erro inesperado. Verifica o console.';
        } finally {
            submitBtn.textContent = originalText;
            submitBtn.disabled = false;
        }
    });

    document.getElementById('authToggleBtn').addEventListener('click', () => {
        const newMode = getAuthMode() === 'login' ? 'register' : 'login';
        showAuthOverlay(newMode);
    });

    document.getElementById('authCancelBtn').addEventListener('click', hideAuthOverlay);

    document.getElementById('trialRegisterBtn').addEventListener('click', () => {
        hideTrialWall();
        showAuthOverlay('register');
    });
    document.getElementById('trialLoginBtn').addEventListener('click', () => {
        hideTrialWall();
        showAuthOverlay('login');
    });
    document.getElementById('trialBackBtn').addEventListener('click', hideTrialWall);

    document.getElementById('profileLogoutBtn').addEventListener('click', () => {
        logout();
        hideProfileOverlay();
        updateUserIndicator();
        updateStartOverlay();
        document.getElementById('startOverlay').classList.remove('hidden');
    });
    document.getElementById('profileCloseBtn').addEventListener('click', hideProfileOverlay);
    
    document.getElementById('profileFullBtn').addEventListener('click', () => {
        hideProfileOverlay();
        showFullProfile();
    });
    
    document.getElementById('profileAchievementsBtn').addEventListener('click', () => {
        hideProfileOverlay();
        showAchievementsPanel();
    });
}

// ===== PROFILE FULL SCREEN =====
let currentProfileData = null;

export async function showFullProfile() {
    const overlay = document.getElementById('profileFullOverlay');
    if (!overlay) return;
    
    overlay.classList.remove('hidden');
    
    const username = getUsername();
    if (!username) {
        overlay.innerHTML = '<div class="overlay"><div class="overlay-sub">Inicie sessão para ver o perfil</div></div>';
        return;
    }
    
    // Loading
    overlay.innerHTML = `
        <div class="overlay">
            <div class="profile-full-container">
                <div class="profile-loading">Carregando perfil...</div>
            </div>
        </div>
    `;
    
    try {
        const [profile, stats] = await Promise.all([
            getProfile(username),
            getStats(username)
        ]);
        
        currentProfileData = profile;
        
        if (!profile) {
            overlay.innerHTML = '<div class="overlay"><div class="overlay-sub">Erro ao carregar perfil</div></div>';
            return;
        }
        
        const xpPct = xpProgress(profile.xp, profile.level);
        const xpCurrent = profile.xp;
        const xpNext = (profile.level + 1) * (profile.level + 1) * 100;
        const xpNeeded = xpNext - xpCurrent;
        
        // Avatar
        const avatarUrl = profile.avatar_url || generateInitialsAvatar(profile.display_name || username);
        
        overlay.innerHTML = `
            <div class="overlay" style="overflow-y: auto;">
                <div class="profile-full-container">
                    <div class="profile-header">
                        <div class="profile-avatar-large">
                            <img src="${avatarUrl}" alt="Avatar" id="profileAvatarImg">
                            <div class="profile-avatar-edit" id="profileAvatarEdit">📷</div>
                        </div>
                        <div class="profile-info">
                            <h2 class="profile-name-large">${profile.display_name || username}</h2>
                            <div class="profile-title">${profile.title}</div>
                            <div class="profile-level-badge">
                                <span class="level-number">${profile.level}</span>
                                <span class="level-label">NÍVEL</span>
                            </div>
                        </div>
                    </div>
                    
                    <div class="profile-xp-bar">
                        <div class="xp-fill" style="width: ${xpPct * 100}%"></div>
                        <span class="xp-text">${xpCurrent} / ${xpNext} XP (${xpNeeded} para próximo)</span>
                    </div>
                    
                    <div class="profile-stats-grid">
                        <div class="stat-card">
                            <div class="stat-icon">🎮</div>
                            <div class="stat-value-large">${profile.total_games || 0}</div>
                            <div class="stat-label">Jogos</div>
                        </div>
                        <div class="stat-card">
                            <div class="stat-icon">🏆</div>
                            <div class="stat-value-large">${profile.best_score || 0}</div>
                            <div class="stat-label">Melhor Score</div>
                        </div>
                        <div class="stat-card">
                            <div class="stat-icon">📊</div>
                            <div class="stat-value-large">${profile.best_level || 1}</div>
                            <div class="stat-label">Melhor Nível</div>
                        </div>
                        <div class="stat-card">
                            <div class="stat-icon">🧱</div>
                            <div class="stat-value-large">${profile.total_bricks || 0}</div>
                            <div class="stat-label">Tijolos</div>
                        </div>
                        <div class="stat-card">
                            <div class="stat-icon">⏱️</div>
                            <div class="stat-value-large">${Math.floor((profile.total_hours || 0) / 60)}h</div>
                            <div class="stat-label">Tempo</div>
                        </div>
                        <div class="stat-card">
                            <div class="stat-icon">💰</div>
                            <div class="stat-value-large">${profile.coins || 0}</div>
                            <div class="stat-label">Coins</div>
                        </div>
                    </div>
                    
                    <div class="profile-bio-section">
                        <div class="profile-bio-label">Bio</div>
                        <div class="profile-bio-text" id="profileBioText">${profile.bio || 'Sem bio ainda...'}</div>
                        <button class="btn btn-small" id="profileEditBioBtn">Editar</button>
                    </div>
                    
                    <div class="profile-avatar-section">
                        <div class="profile-section-title">Escolher Avatar</div>
                        <div class="avatar-grid">
                            ${AVATAR_PRESETS.map(p => `
                                <div class="avatar-preset" data-preset="${p.id}" title="${p.name}">
                                    <span class="avatar-emoji">${p.icon}</span>
                                </div>
                            `).join('')}
                        </div>
                        <div class="avatar-upload">
                            <input type="file" id="avatarUploadInput" accept="image/*" style="display: none;">
                            <button class="btn btn-secondary" id="profileUploadBtn">📤 Upload</button>
                        </div>
                    </div>
                    
                    <div class="profile-actions">
                        <button class="btn" id="profileFullCloseBtn">Fechar</button>
                    </div>
                </div>
            </div>
        `;
        
        // Event listeners
        document.getElementById('profileFullCloseBtn').addEventListener('click', () => {
            overlay.classList.add('hidden');
        });
        
        document.getElementById('profileEditBioBtn').addEventListener('click', async () => {
            const newBio = prompt('Escreva sua bio:', profile.bio || '');
            if (newBio !== null && newBio !== profile.bio) {
                await updateProfile({ bio: newBio });
                showFullProfile(); // Refresh
            }
        });
        
        document.getElementById('profileUploadBtn').addEventListener('click', () => {
            document.getElementById('avatarUploadInput').click();
        });
        
        document.getElementById('avatarUploadInput').addEventListener('change', async (e) => {
            const file = e.target.files[0];
            if (file) {
                const reader = new FileReader();
                reader.onload = async (e) => {
                    const base64 = e.target.result;
                    await updateProfile({ avatar_url: base64, avatar_type: 'upload' });
                    showFullProfile();
                };
                reader.readAsDataURL(file);
            }
        });
        
        // Avatar presets
        document.querySelectorAll('.avatar-preset').forEach(el => {
            el.addEventListener('click', async () => {
                const preset = el.dataset.preset;
                const presetData = AVATAR_PRESETS.find(p => p.id === preset);
                if (presetData) {
                    const avatar = generateEmojiAvatar(presetData.icon);
                    await updateProfile({ avatar_url: avatar, avatar_type: 'preset' });
                    showFullProfile();
                }
            });
        });
        
    } catch (err) {
        console.error('Erro ao carregar perfil:', err);
        overlay.innerHTML = '<div class="overlay"><div class="overlay-sub">Erro ao carregar perfil</div></div>';
    }
}

export function hideFullProfile() {
    const overlay = document.getElementById('profileFullOverlay');
    if (overlay) overlay.classList.add('hidden');
}

// ===== UI JUICE: SCORE BOUNCE =====
export function scoreBounce() {
    scoreDisplay.style.transition = 'transform 0.15s cubic-bezier(0.34, 1.56, 0.64, 1)';
    scoreDisplay.style.transform = 'scale(1.2)';
    setTimeout(() => {
        scoreDisplay.style.transform = 'scale(1)';
    }, 150);
}

// ===== UI JUICE: COMBO METER PULSE =====
export function comboMeterPulse() {
    const meter = document.getElementById('comboMeterFill');
    if (!meter) return;
    meter.style.transition = 'transform 0.2s ease, box-shadow 0.2s ease';
    meter.style.transform = 'scaleY(1.5)';
    meter.style.boxShadow = '0 0 12px var(--accent)';
    setTimeout(() => {
        meter.style.transform = 'scaleY(1)';
        meter.style.boxShadow = 'none';
    }, 200);
}

// ===== UI JUICE: COMBO WARNING =====
export function comboWarning() {
    const comboWrap = document.querySelector('.combo-meter-wrap');
    if (!comboWrap) return;
    comboWrap.style.transition = 'transform 0.3s ease';
    comboWrap.style.transform = 'translateX(3px)';
    setTimeout(() => {
        comboWrap.style.transform = 'translateX(-3px)';
        setTimeout(() => {
            comboWrap.style.transform = 'translateX(0)';
        }, 150);
    }, 150);
}

// ===== UI JUICE: LIVES PULSE =====
export function livesPulse() {
    livesDisplayEl.style.transition = 'transform 0.2s ease';
    livesDisplayEl.style.transform = 'scale(1.15)';
    setTimeout(() => {
        livesDisplayEl.style.transform = 'scale(1)';
    }, 200);
}

// ===== UI JUICE: OVERLAY TRANSITIONS =====
export function showOverlaySmooth(overlay) {
    overlay.classList.remove('hidden');
    overlay.style.opacity = '0';
    overlay.style.transform = 'scale(0.95)';
    overlay.style.transition = 'opacity 0.3s ease, transform 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)';
    requestAnimationFrame(() => {
        overlay.style.opacity = '1';
        overlay.style.transform = 'scale(1)';
    });
}

export function hideOverlaySmooth(overlay) {
    overlay.style.opacity = '0';
    overlay.style.transform = 'scale(0.95)';
    setTimeout(() => {
        overlay.classList.add('hidden');
        overlay.style.transform = '';
        overlay.style.transition = '';
    }, 300);
}

// ===== UI JUICE: SCREEN GLOW =====
export function screenGlow(color, intensity = 0.3) {
    const glow = document.createElement('div');
    glow.style.position = 'fixed';
    glow.style.inset = '0';
    glow.style.pointerEvents = 'none';
    glow.style.zIndex = '999';
    glow.style.background = `radial-gradient(ellipse at center, ${color} 0%, transparent 70%)`;
    glow.style.opacity = intensity;
    glow.style.transition = 'opacity 0.5s ease';
    document.body.appendChild(glow);
    
    setTimeout(() => {
        glow.style.opacity = '0';
        setTimeout(() => glow.remove(), 500);
    }, 200);
}

// ===== BUTTON CLICK PARTICLES (Micro-animação) =====
document.addEventListener('click', (e) => {
    const btn = e.target.closest('.btn, .btn-secondary, .hud-btn, .settings-btn, .settings-close, .shop-category-btn, .shop-buy-btn, .shop-equip-btn');
    if (!btn) return;

    const rect = btn.getBoundingClientRect();
    const x = e.clientX;
    const y = e.clientY;

    // Determine the particle color based on the button or class
    let color = '#ff3c6f'; // default pink
    if (btn.classList.contains('btn-secondary') || btn.classList.contains('settings-close') || btn.classList.contains('shop-category-btn')) {
        color = '#00e5ff'; // cyan
    } else if (btn.id === 'authSubmitBtn' || btn.id === 'startBtn' || btn.classList.contains('shop-buy-btn')) {
        color = '#ffe156'; // yellow
    }

    for (let i = 0; i < 8; i++) {
        const p = document.createElement('div');
        p.style.position = 'fixed';
        p.style.left = `${x}px`;
        p.style.top = `${y}px`;
        p.style.width = `${4 + Math.random() * 4}px`;
        p.style.height = p.style.width;
        p.style.borderRadius = '50%';
        p.style.background = color;
        p.style.boxShadow = `0 0 8px ${color}`;
        p.style.pointerEvents = 'none';
        p.style.zIndex = '9999';

        const angle = Math.random() * Math.PI * 2;
        const speed = 1 + Math.random() * 3;
        const dx = Math.cos(angle) * speed;
        const dy = Math.sin(angle) * speed;

        document.body.appendChild(p);

        let life = 1;
        const anim = () => {
            life -= 0.04;
            if (life <= 0) {
                p.remove();
            } else {
                const curLeft = parseFloat(p.style.left);
                const curTop = parseFloat(p.style.top);
                p.style.left = `${curLeft + dx}px`;
                p.style.top = `${curTop + dy + 0.1}px`; // slight gravity
                p.style.opacity = life;
                p.style.transform = `scale(${life})`;
                requestAnimationFrame(anim);
            }
        };
        requestAnimationFrame(anim);
    }
});

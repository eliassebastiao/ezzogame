// achievements.js — Sistema de Conquistas/Achievements

import { getUsername, getSession } from './auth.js';
import { addXP } from './profile.js';

const API_BASE = window.location.origin + '/api';

// ===== OBTER CONQUISTAS DO USUÁRIO =====
export async function getAchievements(username = null) {
    const user = username || getUsername();
    if (!user) return [];
    
    try {
        const res = await fetch(`${API_BASE}/achievements/${user}`, {
            headers: { 'Authorization': 'Bearer ' + (getSession() || '') }
        });
        const data = await res.json();
        return data.success ? data.achievements : [];
    } catch (err) {
        console.error('Erro ao obter conquistas:', err);
        return [];
    }
}

// ===== VERIFICAR CONQUISTAS =====
export async function checkAchievements(conditionType, value) {
    const user = getUsername();
    if (!user) return [];
    
    try {
        const res = await fetch(`${API_BASE}/achievements/${user}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': 'Bearer ' + (getSession() || '')
            },
            body: JSON.stringify({ condition_type: conditionType, value })
        });
        const data = await res.json();
        if (data.success && data.unlocked && data.unlocked.length > 0) {
            // Mostrar notificações de conquistas desbloqueadas
            data.unlocked.forEach(achievement => {
                showAchievementNotification(achievement);
            });
            return data.unlocked;
        }
        return [];
    } catch (err) {
        console.error('Erro ao verificar conquistas:', err);
        return [];
    }
}

// ===== NOTIFICAÇÃO DE CONQUISTA =====
export function showAchievementNotification(achievement) {
    const notification = document.createElement('div');
    notification.className = 'achievement-notification';
    notification.innerHTML = `
        <div class="achievement-icon">${achievement.icon}</div>
        <div class="achievement-info">
            <div class="achievement-title">Conquista Desbloqueada!</div>
            <div class="achievement-name">${achievement.name}</div>
            ${achievement.reward_xp > 0 || achievement.reward_coins > 0 ? `
                <div class="achievement-rewards">
                    ${achievement.reward_xp > 0 ? `<span>+${achievement.reward_xp} XP</span>` : ''}
                    ${achievement.reward_coins > 0 ? `<span>+${achievement.reward_coins} 💰</span>` : ''}
                </div>
            ` : ''}
        </div>
    `;
    
    document.body.appendChild(notification);
    
    // Animar entrada
    setTimeout(() => notification.classList.add('show'), 100);
    
    // Remover após 5 segundos
    setTimeout(() => {
        notification.classList.remove('show');
        setTimeout(() => notification.remove(), 500);
    }, 5000);
}

// ===== VERIFICAR CONQUISTA DE SCORE =====
export async function checkScoreAchievements(score) {
    return await checkAchievements('score_reached', score);
}

// ===== VERIFICAR CONQUISTA DE NÍVEL =====
export async function checkLevelAchievements(level) {
    return await checkAchievements('level_reached', level);
}

// ===== VERIFICAR CONQUISTA DE COMBO =====
export async function checkComboAchievements(combo) {
    return await checkAchievements('combo_reached', combo);
}

// ===== VERIFICAR CONQUISTA DE TIJOLOS =====
export async function checkBricksAchievements(totalBricks) {
    return await checkAchievements('bricks_broken', totalBricks);
}

// ===== VERIFICAR CONQUISTA DE JOGOS =====
export async function checkGamesAchievements(totalGames) {
    return await checkAchievements('games_played', totalGames);
}

// ===== VERIFICAR CONQUISTA DE TEMPO =====
export async function checkTimeAchievements(totalMinutes) {
    return await checkAchievements('time_played', totalMinutes);
}

// ===== VERIFICAR CONQUISTA DE POWERUPS =====
export async function checkPowerupsAchievements(totalPowerups) {
    return await checkAchievements('powerups_collected', totalPowerups);
}

// ===== VERIFICAR CONQUISTA ESPECIAL =====
export async function checkSpecialAchievement(achievementCode) {
    const user = getUsername();
    if (!user) return [];
    
    try {
        const res = await fetch(`${API_BASE}/achievements/${user}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': 'Bearer ' + (getSession() || '')
            },
            body: JSON.stringify({ condition_type: 'special', value: 1 })
        });
        const data = await res.json();
        if (data.success && data.unlocked) {
            data.unlocked.forEach(achievement => {
                showAchievementNotification(achievement);
            });
            return data.unlocked;
        }
        return [];
    } catch (err) {
        console.error('Erro ao verificar conquista especial:', err);
        return [];
    }
}

// ===== OBTER TODAS AS CONQUISTAS (público) =====
export async function getAllAchievements() {
    try {
        const res = await fetch(`${API_BASE}/achievements`);
        const data = await res.json();
        return data.success ? data.achievements : [];
    } catch (err) {
        console.error('Erro ao obter todas conquistas:', err);
        return [];
    }
}

// ===== CONTAR CONQUISTAS DESBLOQUEADAS =====
export function countUnlocked(achievements) {
    return achievements.filter(a => a.unlocked).length;
}

// ===== CONTAR CONQUISTAS POR RARIDADE =====
export function countByRarity(achievements, rarity) {
    return achievements.filter(a => a.rarity === rarity).length;
}

// ===== CATEGORIAS DE CONQUISTAS =====
export const ACHIEVEMENT_CATEGORIES = {
    'gameplay': 'Gameplay',
    'score': 'Pontuação',
    'combo': 'Combos',
    'collection': 'Coleção',
    'special': 'Especiais',
    'secret': 'Secretas'
};

// ===== RARIDADES =====
export const ACHIEVEMENT_RARITIES = {
    'common': { label: 'Comum', color: '#9ca3af' },
    'rare': { label: 'Raro', color: '#3b82f6' },
    'epic': { label: 'Épico', color: '#a855f7' },
    'legendary': { label: 'Lendário', color: '#f59e0b' },
    'secret': { label: 'Secreto', color: '#ef4444' }
};

// ===== FUNÇÃO PARA MOSTRAR PAINEL DE CONQUISTAS =====
export async function showAchievementsPanel() {
    const overlay = document.getElementById('achievementsOverlay');
    if (!overlay) {
        console.warn('Overlay de conquistas não encontrado');
        return;
    }
    
    overlay.classList.remove('hidden');
    
    const user = getUsername();
    if (!user) {
        overlay.innerHTML = `
            <div class="overlay">
                <div class="overlay-title">CONQUISTAS</div>
                <div class="overlay-sub">Inicie sessão para ver suas conquistas</div>
                <button class="btn" id="achievementsCloseBtn">Fechar</button>
            </div>
        `;
        document.getElementById('achievementsCloseBtn').addEventListener('click', () => {
            overlay.classList.add('hidden');
        });
        return;
    }
    
    // Loading
    overlay.innerHTML = `
        <div class="overlay">
            <div class="achievements-container">
                <div class="achievements-loading">Carregando conquistas...</div>
            </div>
        </div>
    `;
    
    try {
        const achievements = await getAchievements(user);
        const unlockedCount = countUnlocked(achievements);
        const totalCount = achievements.length;
        
        // Agrupar por categoria
        const byCategory = {};
        achievements.forEach(a => {
            if (!byCategory[a.category]) byCategory[a.category] = [];
            byCategory[a.category].push(a);
        });
        
        overlay.innerHTML = `
            <div class="overlay">
                <div class="achievements-container">
                    <div class="achievements-header">
                        <div class="overlay-title">CONQUISTAS</div>
                        <div class="achievements-progress">
                            <div class="achievements-progress-bar">
                                <div class="achievements-progress-fill" style="width: ${(unlockedCount / totalCount) * 100}%"></div>
                            </div>
                            <span class="achievements-progress-text">${unlockedCount} / ${totalCount} (${Math.round((unlockedCount / totalCount) * 100)}%)</span>
                        </div>
                    </div>
                    
                    <div class="achievements-rarity-stats">
                        ${Object.entries(ACHIEVEMENT_RARITIES).map(([key, rarity]) => {
                            const total = achievements.filter(a => a.rarity === key).length;
                            const unlocked = achievements.filter(a => a.rarity === key && a.unlocked).length;
                            return `
                                <div class="rarity-stat ${key}">
                                    <span class="rarity-dot" style="background: ${rarity.color}"></span>
                                    <span class="rarity-label">${rarity.label}</span>
                                    <span class="rarity-count">${unlocked}/${total}</span>
                                </div>
                            `;
                        }).join('')}
                    </div>
                    
                    <div class="achievements-categories">
                        ${Object.entries(ACHIEVEMENT_CATEGORIES).map(([cat, label]) => {
                            if (!byCategory[cat]) return '';
                            return `
                                <div class="achievement-category">
                                    <div class="category-title">${label}</div>
                                    <div class="achievement-grid">
                                        ${byCategory[cat].map(a => `
                                            <div class="achievement-card ${a.unlocked ? 'unlocked' : 'locked'} ${a.rarity}">
                                                <div class="achievement-card-icon">${a.hidden && !a.unlocked ? '❓' : a.icon}</div>
                                                <div class="achievement-card-name">${a.hidden && !a.unlocked ? '???' : a.name}</div>
                                                <div class="achievement-card-desc">${a.hidden && !a.unlocked ? 'Conquista secreta' : a.description}</div>
                                                ${a.unlocked ? `
                                                    <div class="achievement-card-date">${new Date(a.unlocked_at).toLocaleDateString('pt-BR')}</div>
                                                ` : `
                                                    <div class="achievement-card-progress">
                                                        <div class="progress-bar">
                                                            <div class="progress-fill" style="width: ${Math.min(100, (a.progress / a.condition_value) * 100)}%"></div>
                                                        </div>
                                                        <span>${a.progress || 0} / ${a.condition_value}</span>
                                                    </div>
                                                `}
                                                ${a.reward_xp > 0 || a.reward_coins > 0 ? `
                                                    <div class="achievement-card-rewards">
                                                        ${a.reward_xp > 0 ? `<span class="reward-xp">+${a.reward_xp} XP</span>` : ''}
                                                        ${a.reward_coins > 0 ? `<span class="reward-coins">+${a.reward_coins} 💰</span>` : ''}
                                                    </div>
                                                ` : ''}
                                            </div>
                                        `).join('')}
                                    </div>
                                </div>
                            `;
                        }).join('')}
                    </div>
                    
                    <div class="achievements-actions">
                        <button class="btn" id="achievementsCloseBtn">Fechar</button>
                    </div>
                </div>
            </div>
        `;
        
        document.getElementById('achievementsCloseBtn').addEventListener('click', () => {
            overlay.classList.add('hidden');
        });
        
    } catch (err) {
        console.error('Erro ao carregar conquistas:', err);
        overlay.innerHTML = `
            <div class="overlay">
                <div class="overlay-title">CONQUISTAS</div>
                <div class="overlay-sub">Erro ao carregar conquistas</div>
                <button class="btn" id="achievementsCloseBtn">Fechar</button>
            </div>
        `;
        document.getElementById('achievementsCloseBtn').addEventListener('click', () => {
            overlay.classList.add('hidden');
        });
    }
}

export function hideAchievementsPanel() {
    const overlay = document.getElementById('achievementsOverlay');
    if (overlay) overlay.classList.add('hidden');
}

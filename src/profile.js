// profile.js — Sistema de Perfil Completo (avatar, XP, nível, estatísticas)

import { getUsername, getSession } from './auth.js';

const API_BASE = window.location.origin + '/api';

// ===== GERAR AVATAR COM INICIAIS =====
export function generateInitialsAvatar(name, size = 128) {
    const canvas = document.createElement('canvas');
    canvas.width = size;
    canvas.height = size;
    const ctx = canvas.getContext('2d');
    
    // Fundo gradiente
    const gradient = ctx.createLinearGradient(0, 0, size, size);
    const colors = [
        ['#ff3c6f', '#ff8a5c'],
        ['#00e5ff', '#0080ff'],
        ['#44ff88', '#00cc66'],
        ['#bd00ff', '#ff00cc'],
        ['#ffe156', '#ff8c00'],
        ['#ff6b6b', '#ee5a24'],
    ];
    const colorPair = colors[name.length % colors.length];
    gradient.addColorStop(0, colorPair[0]);
    gradient.addColorStop(1, colorPair[1]);
    
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, size, size);
    
    // Iniciais
    const initials = name.substring(0, 2).toUpperCase();
    ctx.fillStyle = '#ffffff';
    ctx.font = `bold ${size * 0.45}px "Press Start 2P", monospace`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(initials, size / 2, size / 2);
    
    return canvas.toDataURL('image/png');
}

// ===== OBTER PERFIL =====
export async function getProfile(username = null) {
    const user = username || getUsername();
    if (!user) return null;
    
    try {
        const res = await fetch(`${API_BASE}/profile/${user}`, {
            headers: { 'Authorization': 'Bearer ' + (getSession() || '') }
        });
        const data = await res.json();
        return data.success ? data.profile : null;
    } catch (err) {
        console.error('Erro ao obter perfil:', err);
        return null;
    }
}

// ===== ATUALIZAR PERFIL =====
export async function updateProfile(updates) {
    const user = getUsername();
    if (!user) return null;
    
    try {
        const res = await fetch(`${API_BASE}/profile/${user}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': 'Bearer ' + (getSession() || '')
            },
            body: JSON.stringify(updates)
        });
        const data = await res.json();
        return data.success ? data.profile : null;
    } catch (err) {
        console.error('Erro ao atualizar perfil:', err);
        return null;
    }
}

// ===== ADICIONAR XP =====
export async function addXP(amount, reason = 'game') {
    const user = getUsername();
    if (!user) return null;
    
    try {
        const res = await fetch(`${API_BASE}/xp/${user}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': 'Bearer ' + (getSession() || '')
            },
            body: JSON.stringify({ amount, reason })
        });
        const data = await res.json();
        if (data.success) {
            return data.profile;
        }
        return null;
    } catch (err) {
        console.error('Erro ao adicionar XP:', err);
        return null;
    }
}

// ===== REGISTRAR GAME SESSION =====
export async function recordGameSession(sessionData) {
    const user = getUsername();
    if (!user) return null;
    
    try {
        const res = await fetch(`${API_BASE}/session/${user}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': 'Bearer ' + (getSession() || '')
            },
            body: JSON.stringify(sessionData)
        });
        const data = await res.json();
        return data.success ? data.session : null;
    } catch (err) {
        console.error('Erro ao registrar sessão:', err);
        return null;
    }
}

// ===== OBTER ESTATÍSTICAS =====
export async function getStats(username = null) {
    const user = username || getUsername();
    if (!user) return null;
    
    try {
        const res = await fetch(`${API_BASE}/stats/${user}`, {
            headers: { 'Authorization': 'Bearer ' + (getSession() || '') }
        });
        const data = await res.json();
        return data.success ? data : null;
    } catch (err) {
        console.error('Erro ao obter estatísticas:', err);
        return null;
    }
}

// ===== OBTER LEADERBOARD =====
export async function getLeaderboard(mode = 'xp', limit = 50) {
    try {
        const res = await fetch(`${API_BASE}/leaderboard?mode=${mode}&limit=${limit}`);
        const data = await res.json();
        return data.success ? data.leaderboard : [];
    } catch (err) {
        console.error('Erro ao obter leaderboard:', err);
        return [];
    }
}

// ===== CALCULAR XP NECESSÁRIO PARA PRÓXIMO NÍVEL =====
export function xpForLevel(level) {
    return level * level * 100;
}

export function xpProgress(xp, level) {
    const currentLevelXP = xpForLevel(level);
    const nextLevelXP = xpForLevel(level + 1);
    const levelXP = xp - currentLevelXP;
    const needed = nextLevelXP - currentLevelXP;
    return Math.min(1, Math.max(0, levelXP / needed));
}

// ===== CRIAR PERFIL INICIAL (usado no registro) =====
export async function createInitialProfile(username, displayName) {
    const avatar = generateInitialsAvatar(displayName || username);
    return await updateProfile({
        display_name: displayName || username,
        avatar_url: avatar,
        avatar_type: 'initials'
    });
}

// ===== UPLOAD DE AVATAR (base64) =====
export async function uploadAvatar(base64Image) {
    return await updateProfile({
        avatar_url: base64Image,
        avatar_type: 'upload'
    });
}

// ===== PRESETS DE AVATAR =====
export const AVATAR_PRESETS = [
    { id: 'default', name: 'Padrão', icon: '👤' },
    { id: 'robot', name: 'Robô', icon: '🤖' },
    { id: 'alien', name: 'Alien', icon: '👽' },
    { id: 'ghost', name: 'Fantasma', icon: '👻' },
    { id: 'ninja', name: 'Ninja', icon: '🥷' },
    { id: 'king', name: 'Rei', icon: '👑' },
    { id: 'rocket', name: 'Foguete', icon: '🚀' },
    { id: 'fire', name: 'Fogo', icon: '🔥' },
    { id: 'diamond', name: 'Diamante', icon: '💎' },
    { id: 'star', name: 'Estrela', icon: '⭐' },
];

// Gerar avatar com emoji (usando canvas)
export function generateEmojiAvatar(emoji, size = 128) {
    const canvas = document.createElement('canvas');
    canvas.width = size;
    canvas.height = size;
    const ctx = canvas.getContext('2d');
    
    // Fundo
    ctx.fillStyle = '#1a1a2e';
    ctx.fillRect(0, 0, size, size);
    
    // Emoji
    ctx.font = `${size * 0.6}px serif`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(emoji, size / 2, size / 2 + size * 0.05);
    
    return canvas.toDataURL('image/png');
}

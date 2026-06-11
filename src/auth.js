// auth.js — Autenticação, sessão, trial
import { state, STORAGE_KEYS } from './state.js';
import {
    apiRegister, apiLogin, apiGetProfile,
    loadLocalAuth, saveLocalAuth, clearLocalAuth,
    checkServerReachability,
} from './supabase.js';
import { createInitialProfile } from './profile.js';

// ===== SESSION MANAGEMENT =====

export function loadSession() {
    const auth = loadLocalAuth();
    if (auth && auth.username) {
        state.user = {
            isGuest: false,
            username: auth.username,
            displayName: auth.displayName || auth.username,
            authToken: auth.authToken || null,
            joinDate: auth.joinDate || null,
        };
        return true;
    }
    state.user = {
        isGuest: true,
        username: null,
        displayName: null,
        authToken: null,
        joinDate: null,
    };
    return false;
}

export function saveSession(username, token, displayName) {
    const auth = { username, authToken: token, displayName, joinDate: new Date().toISOString() };
    saveLocalAuth(auth);
    state.user = {
        isGuest: false,
        username,
        displayName: displayName || username,
        authToken: token,
        joinDate: auth.joinDate,
    };
}

export function clearSession() {
    clearLocalAuth();
    state.user = {
        isGuest: true,
        username: null,
        displayName: null,
        authToken: null,
        joinDate: null,
    };
}

export function isLoggedIn() {
    return !state.user.isGuest && !!state.user.username;
}

export function getUsername() {
    return state.user.isGuest ? null : state.user.username;
}

export function getDisplayName() {
    return state.user.isGuest ? 'Convidado' : state.user.displayName;
}

export function getSession() {
    return state.user.authToken;
}

// ===== AUTH ACTIONS =====

export async function register(username, password) {
    console.log('[Auth] Tentando registar utilizador:', username);
    const result = await apiRegister(username, password);
    if (!result) {
        console.error('[Auth] Registo falhou: servidor não respondeu');
        return { error: 'Servidor indisponivel. Verifica se o servidor está a correr em http://localhost:8081' };
    }
    if (!result.success) {
        console.error('[Auth] Registo falhou:', result.error);
        return { error: result.error || 'Erro ao registar' };
    }
    console.log('[Auth] Registo bem-sucedido:', username);
    saveSession(result.user.username, result.token, result.user.displayName);
    
    // Criar perfil inicial automaticamente
    try {
        await createInitialProfile(result.user.username, result.user.displayName);
    } catch (err) {
        console.warn('Erro ao criar perfil inicial:', err);
    }
    
    return { success: true };
}

export async function login(username, password) {
    console.log('[Auth] Tentando login:', username);
    const result = await apiLogin(username, password);
    if (!result) {
        console.error('[Auth] Login falhou: servidor não respondeu');
        return { error: 'Servidor indisponivel. Verifica se o servidor está a correr em http://localhost:8081' };
    }
    if (!result.success) {
        console.error('[Auth] Login falhou:', result.error);
        return { error: result.error || 'Credenciais invalidas' };
    }
    console.log('[Auth] Login bem-sucedido:', username);
    saveSession(result.user.username, result.token, result.user.displayName);
    return { success: true };
}

export function logout() {
    clearSession();
}

// ===== TRIAL SYSTEM =====

export function isGuest() {
    return state.user.isGuest;
}

export function getTrialMaxLevel() {
    return state.trial.maxLevelReached;
}

export function updateTrialMaxLevel(level) {
    if (level > state.trial.maxLevelReached) {
        state.trial.maxLevelReached = level;
        try {
            localStorage.setItem(STORAGE_KEYS.TRIAL, JSON.stringify({ maxLevel: level }));
        } catch {}
    }
}

export function loadTrialState() {
    try {
        const raw = localStorage.getItem(STORAGE_KEYS.TRIAL);
        if (raw) {
            const data = JSON.parse(raw);
            state.trial.maxLevelReached = data.maxLevel || 0;
        }
    } catch {}
}

export function isTrialBlocked(currentLevel) {
    // Guest at level 10+ is blocked
    return state.user.isGuest && currentLevel >= 10;
}

// ===== INIT =====

export async function initAuth() {
    loadSession();
    loadTrialState();
    // Check server reachability (don't block init)
    checkServerReachability().catch(() => {});
}

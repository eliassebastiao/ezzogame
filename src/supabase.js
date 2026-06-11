// supabase.js — Cliente API para backend Supabase + fallback localStorage
import { state, STORAGE_KEYS } from './state.js';

const BASE = window.location.origin;

// Detectar se o jogo foi aberto diretamente (file://) em vez de via servidor
if (window.location.protocol === 'file:') {
    console.error('⚠️ ERRO: O jogo foi aberto diretamente do ficheiro. Usa o servidor: http://localhost:8081');
}

// ===== API FETCH WRAPPER =====
async function apiFetch(path, options = {}) {
    const url = `${BASE}/api${path}`;
    try {
        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), 5000);
        const res = await fetch(url, {
            ...options,
            signal: controller.signal,
            headers: {
                'Content-Type': 'application/json',
                ...(options.headers || {}),
            },
        });
        clearTimeout(timeout);
        state.serverReachable = true;
        return await res.json();
    } catch (err) {
        state.serverReachable = false;
        console.error(`[API] Falha ao conectar a ${url}:`, err.message || err);
        return null;
    }
}

// ===== AUTH =====
export async function apiRegister(username, password) {
    return apiFetch('/register', {
        method: 'POST',
        body: JSON.stringify({ username, password }),
    });
}

export async function apiLogin(username, password) {
    return apiFetch('/login', {
        method: 'POST',
        body: JSON.stringify({ username, password }),
    });
}

// ===== SAVE/LOAD =====
export async function apiSaveGame(username, data) {
    return apiFetch(`/save/${encodeURIComponent(username)}`, {
        method: 'PUT',
        body: JSON.stringify(data),
    });
}

export async function apiLoadGame(username) {
    return apiFetch(`/load/${encodeURIComponent(username)}`);
}

// ===== PROFILE =====
export async function apiGetProfile(username) {
    return apiFetch(`/profile/${encodeURIComponent(username)}`);
}

// ===== HISTORY =====
export async function apiAddHistory(username, data) {
    return apiFetch(`/history/${encodeURIComponent(username)}`, {
        method: 'POST',
        body: JSON.stringify(data),
    });
}

export async function apiGetHistory(username) {
    return apiFetch(`/history/${encodeURIComponent(username)}`);
}

// ===== RANKING =====
export async function apiGetRanking() {
    return apiFetch('/ranking');
}

// ===== LOCAL STORAGE HELPERS =====
export function loadLocalAuth() {
    try {
        const raw = localStorage.getItem(STORAGE_KEYS.AUTH);
        return raw ? JSON.parse(raw) : null;
    } catch { return null; }
}

export function saveLocalAuth(authData) {
    try {
        localStorage.setItem(STORAGE_KEYS.AUTH, JSON.stringify(authData));
    } catch {}
}

export function clearLocalAuth() {
    try { localStorage.removeItem(STORAGE_KEYS.AUTH); } catch {}
}

export function loadLocalSave() {
    try {
        const raw = localStorage.getItem(STORAGE_KEYS.SAVE);
        return raw ? JSON.parse(raw) : null;
    } catch { return null; }
}

export function saveLocalSave(saveData) {
    try {
        localStorage.setItem(STORAGE_KEYS.SAVE, JSON.stringify(saveData));
    } catch {}
}

export function clearLocalSave() {
    try { localStorage.removeItem(STORAGE_KEYS.SAVE); } catch {}
}

export function loadLocalTrial() {
    try {
        const raw = localStorage.getItem(STORAGE_KEYS.TRIAL);
        return raw ? JSON.parse(raw) : null;
    } catch { return null; }
}

export function saveLocalTrial(trialData) {
    try {
        localStorage.setItem(STORAGE_KEYS.TRIAL, JSON.stringify(trialData));
    } catch {}
}

export function loadLocalHistory() {
    try {
        const raw = localStorage.getItem(STORAGE_KEYS.HISTORY);
        return raw ? JSON.parse(raw) : [];
    } catch { return []; }
}

export function saveLocalHistory(history) {
    try {
        const capped = history.slice(-50);
        localStorage.setItem(STORAGE_KEYS.HISTORY, JSON.stringify(capped));
    } catch {}
}

// ===== SERVER REACHABILITY CHECK =====
let reachabilityCache = null;
export async function checkServerReachability() {
    if (reachabilityCache !== null) return reachabilityCache;
    try {
        const ctrl = new AbortController();
        setTimeout(() => ctrl.abort(), 3000);
        const res = await fetch(`${BASE}/api/ranking`, { signal: ctrl.signal });
        reachabilityCache = res.ok;
        state.serverReachable = res.ok;
        return res.ok;
    } catch {
        reachabilityCache = false;
        state.serverReachable = false;
        return false;
    }
}

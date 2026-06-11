// save.js — Auto-save, load, histórico
import { state, STORAGE_KEYS } from './state.js';
import {
    apiSaveGame, apiLoadGame, apiAddHistory,
    loadLocalSave, saveLocalSave, clearLocalSave,
    loadLocalHistory, saveLocalHistory,
} from './supabase.js';
import { isLoggedIn, getUsername } from './auth.js';

// ===== SAVE =====

export function saveGame(keepHistory = true) {
    const saveData = {
        level: state.level,
        score: state.score,
        lives: state.lives,
        reserveLife: state.reserveLife,
        maxCombo: state.stats.maxCombo,
        bricksBroken: state.stats.bricksBroken,
        powerupsCollected: state.stats.powerupsCollected,
        timestamp: Date.now(),
    };

    // Always save locally
    saveLocalSave(saveData);
    state.hasSavedGame = true;

    // Sync to server if logged in and reachable
    if (isLoggedIn() && state.serverReachable) {
        const username = getUsername();
        apiSaveGame(username, {
            ...saveData,
            gameHistoryEntry: null,
        }).catch(() => {});
    }
}

export function loadSavedGame() {
    const save = loadLocalSave();
    if (!save) return false;

    state.level = save.level || 1;
    state.score = save.score || 0;
    state.lives = save.lives || 7;
    state.reserveLife = save.reserveLife || 0;
    state.stats.maxCombo = save.maxCombo || 0;
    state.stats.bricksBroken = save.bricksBroken || 0;
    state.stats.powerupsCollected = save.powerupsCollected || 0;

    return true;
}

export async function loadServerSave() {
    if (!isLoggedIn() || !state.serverReachable) return false;
    const username = getUsername();
    const result = await apiLoadGame(username);
    if (!result || !result.save) return false;

    const s = result.save;
    const saveData = {
        level: s.level || 1,
        score: s.score || 0,
        lives: s.lives || 7,
        reserveLife: s.reserveLife || 0,
        maxCombo: s.maxCombo || 0,
        bricksBroken: s.bricksBroken || 0,
        powerupsCollected: s.powerupsCollected || 0,
        timestamp: Date.now(),
    };

    saveLocalSave(saveData);
    return loadSavedGame();
}

export function clearSavedGame() {
    clearLocalSave();
    state.hasSavedGame = false;
}

export function hasSavedGame() {
    return loadLocalSave() !== null;
}

export function getSavedLevel() {
    const save = loadLocalSave();
    return save ? save.level : 1;
}

// ===== GAME HISTORY =====

export function addGameHistoryEntry() {
    const entry = {
        date: Date.now(),
        score: state.score,
        levelReached: state.level,
        bricksBroken: state.stats.bricksBroken,
        maxCombo: state.stats.maxCombo,
        powerupsCollected: state.stats.powerupsCollected,
        durationSeconds: state.stats.startTime
            ? Math.floor((Date.now() - state.stats.startTime) / 1000)
            : 0,
        won: state.gameState === 'win',
    };

    // Save locally
    const history = loadLocalHistory();
    history.push(entry);
    saveLocalHistory(history);

    // Sync to server if available
    if (isLoggedIn() && state.serverReachable) {
        const username = getUsername();
        apiAddHistory(username, {
            ...entry,
            won: entry.won || state.level > state.maxLevel,
        }).catch(() => {});
    }
}

export function getGameHistory() {
    return loadLocalHistory();
}

export function clearHistory() {
    try { localStorage.removeItem(STORAGE_KEYS.HISTORY); } catch {}
}

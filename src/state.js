// state.js — Estado global do jogo e constantes

export const canvas = document.getElementById('game');
export const ctx = canvas.getContext('2d');
export const W = canvas.width;
export const H = canvas.height;

// UI refs
export const scoreDisplay = document.getElementById('scoreDisplay');
export const coinsDisplay = document.getElementById('coinsDisplay');
export const levelDisplay = document.getElementById('levelDisplay');
export const comboDisplay = document.getElementById('comboDisplay');
export const livesDisplayEl = document.getElementById('livesDisplay');
export const reserveBadge = document.getElementById('reserveBadge');
export const startOverlay = document.getElementById('startOverlay');
export const gameOverOverlay = document.getElementById('gameOverOverlay');
export const winOverlay = document.getElementById('winOverlay');
export const levelBanner = document.getElementById('levelBanner');
export const comboPopup = document.getElementById('comboPopup');
export const screenFlash = document.getElementById('screenFlash');

// Game state
export const state = {
    gameState: 'start', // start | playing | over | win
    score: 0,
    lives: 7,
    maxLives: 7,
    reserveLife: 0,
    level: 1,
    maxLevel: 1000,
    combo: 0,
    comboTimer: 0,
    comboCount: 0,
    lastComboTier: 0,
    shakeAmount: 0,
    flashOverlay: 0,
    keys: {},
    bricks: [],
    particles: [],
    comboParticles: [],

    // Juice / game feel
    popups: [],
    gridRipples: [],
    paddleFlash: 0,
    paddleScaleY: 1,
    paddleScaleX: 1,
    slowMoTimer: 0,

    // Novas propriedades de jogo
    coins: 0,
    balls: [],
    powerups: [],
    lasers: [],
    powerupTimers: {
        expand: 0,
        fireball: 0,
        laser: 0,
        magnet: 0,
        slow: 0,
        ghost: 0,
        mega: 0,
        drone: 0,
    },
    hasShield: false,
    laserFireTimer: 0,

    // Powerup storage (guardar até 2 poderes)
    storedPowerups: [],

    // Drone
    drones: [],
    droneFireTimer: 0,

    // Ghost / Mega
    isGhost: false,
    isMega: false,
    megaRadius: 5,
    normalRadius: 5,

    // Background particles
    bgParticles: [],

    // Audio / pause
    muted: false,
    paused: false,

    // User / Auth
    user: {
        isGuest: true,
        username: null,
        displayName: null,
        authToken: null,
        joinDate: null,
    },

    // Trial tracking (guest mode)
    trial: {
        maxLevelReached: 0,
    },

    // Saved game indicator
    hasSavedGame: false,
    serverReachable: true,

    // Estatísticas do jogo
    stats: {
        bricksBroken: 0,
        maxCombo: 0,
        powerupsCollected: 0,
        gamesPlayed: 0,
        startTime: 0,
    }
};

// Settings (persisted in localStorage)
function loadSettings() {
    try {
        const saved = localStorage.getItem('brickClassicoSettings');
        if (saved) return JSON.parse(saved);
    } catch (e) {}
    return { musicVolume: 0.7, sfxVolume: 0.8 };
}

export const settings = loadSettings();

export function saveSettings() {
    try {
        localStorage.setItem('brickClassicoSettings', JSON.stringify(settings));
    } catch (e) {}
}

// Storage keys
export const STORAGE_KEYS = {
    AUTH: 'brickClassicoAuth',
    SAVE: 'brickClassicoSave',
    TRIAL: 'brickClassicoTrial',
    HISTORY: 'brickClassicoHistory',
};

// Brick constants
export const BRICK_COLS = 10;
export const BRICK_W = 56;
export const BRICK_H = 20;
export const BRICK_PAD = 4;
export const BRICK_OFFSET_X = (W - (BRICK_COLS * (BRICK_W + BRICK_PAD) - BRICK_PAD)) / 2;
export const BRICK_OFFSET_Y = 50;

export const BRICK_COLORS = [
    { fill: '#ff3c6f', glow: 'rgba(255,60,111,0.5)' },
    { fill: '#ff7849', glow: 'rgba(255,120,73,0.5)' },
    { fill: '#ffe156', glow: 'rgba(255,225,86,0.5)' },
    { fill: '#44ff88', glow: 'rgba(68,255,136,0.5)' },
    { fill: '#00e5ff', glow: 'rgba(0,229,255,0.5)' },
    { fill: '#a78bfa', glow: 'rgba(167,139,250,0.5)' },
    { fill: '#f472b6', glow: 'rgba(244,114,182,0.5)' },
    { fill: '#fbbf24', glow: 'rgba(251,191,36,0.5)' },
];

export const BRICK_COLORS_EXTRA = [
    { fill: '#ff0066', glow: 'rgba(255,0,102,0.5)' },
    { fill: '#ff6600', glow: 'rgba(255,102,0,0.5)' },
    { fill: '#ffcc00', glow: 'rgba(255,204,0,0.5)' },
    { fill: '#00ff88', glow: 'rgba(0,255,136,0.5)' },
    { fill: '#00ccff', glow: 'rgba(0,204,255,0.5)' },
    { fill: '#8844ff', glow: 'rgba(136,68,255,0.5)' },
    { fill: '#ff44aa', glow: 'rgba(255,68,170,0.5)' },
    { fill: '#ff8800', glow: 'rgba(255,136,0,0.5)' },
];

// Paddle
export const paddle = {
    x: W / 2 - 50,
    y: H - 36,
    w: 100,
    h: 12,
    speed: 7,
    targetX: W / 2 - 50,
};

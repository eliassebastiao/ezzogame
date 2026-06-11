// combo.js — Sistema de combo completo com efeitos visuais e sonoros por nível

// Cada nível de combo tem: nome, cor, efeito visual (shake, flash, partículas) e som
export const COMBO_TIERS = {
    4:  { name: 'Boa!',            color: '#44ff88', flashColor: 'rgba(68,255,136,0.2)',  shake: 3,  particles: 15, sound: 'pieces',  soundVol: 0.5,  tier: 'normal' },
    5:  { name: 'Fogo!',           color: '#00e5ff', flashColor: 'rgba(0,229,255,0.25)',  shake: 4,  particles: 20, sound: 'pieces',  soundVol: 0.6,  tier: 'normal' },
    6:  { name: 'Tornado!',        color: '#a78bfa', flashColor: 'rgba(167,139,250,0.25)',shake: 5,  particles: 22, sound: 'pieces2', soundVol: 0.5,  tier: 'normal' },
    7:  { name: 'Trovão!',         color: '#f472b6', flashColor: 'rgba(244,114,182,0.3)', shake: 6,  particles: 25, sound: 'pieces2', soundVol: 0.6,  tier: 'normal' },
    8:  { name: 'Tsunami!',        color: '#ff7849', flashColor: 'rgba(255,120,73,0.3)',  shake: 7,  particles: 28, sound: 'launch',  soundVol: 0.4,  tier: 'normal' },
    9:  { name: 'Terramoto!',      color: '#ffe156', flashColor: 'rgba(255,225,86,0.3)',  shake: 8,  particles: 30, sound: 'launch',  soundVol: 0.5,  tier: 'normal' },
    10: { name: 'Tempestade!',     color: '#ffe156', flashColor: 'rgba(255,225,86,0.35)', shake: 9,  particles: 35, sound: 'launch2', soundVol: 0.5,  tier: 'normal' },
};

export const COMBO_GOLD = {
    name: '⚡ COMBO GOLD ⚡',
    color: '#ffd700',
    flashColor: 'rgba(255,215,0,0.35)',
    shake: 10,
    particles: 40,
    sound: 'launch2',
    soundVol: 0.6,
    tier: 'gold',
};

export const COMBO_GOLD_MASTER = {
    name: '🔥 GOLD MASTER 🔥',
    color: '#ff3c6f',
    flashColor: 'rgba(255,60,111,0.45)',
    shake: 16,
    particles: 50,
    sound: 'victory',
    soundVol: 0.4,
    tier: 'master',
};

// Flag para saber quando Gold Master já deu vida extra neste combo
let lastGoldMasterLifeGiven = false;

export function getComboInfo(count) {
    if (count >= 15) return { ...COMBO_GOLD_MASTER, threshold: 15 };
    if (count >= 11) return { ...COMBO_GOLD, threshold: 11 };
    if (COMBO_TIERS[count]) return { ...COMBO_TIERS[count], threshold: count };
    return null;
}

export function resetGoldMasterLifeFlag() {
    lastGoldMasterLifeGiven = false;
}

export function shouldGiveGoldMasterLife() {
    if (!lastGoldMasterLifeGiven) {
        lastGoldMasterLifeGiven = true;
        return true;
    }
    return false;
}

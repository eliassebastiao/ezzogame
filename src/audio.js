// audio.js — Sistema de áudio completo (efeitos + música adaptativa + pitch variation)

import { state, settings, saveSettings } from './state.js';

const SOUNDS = {};
let soundPoolIndex = {};
const UNAVAILABLE_SOUNDS = new Set(); // Sons que falharam ao carregar

// ===== SONS EXISTENTES =====
const SOUND_PATHS = {
    // Sons originais
    'pieces': 'Sons/pecaços-caindo 1.wav',
    'pieces2': 'Sons/pecaços-caindo 2.wav',
    'victory': 'Sons/Victory.wav',
    'launch': 'Sons/Sond_toque_lançamento.wav',
    'launch2': 'Sons/lançamento-2.wav',
    
    // Sons novos — Tijolos
    'break_normal': 'Sons/novos/efeitos/break_normal.wav',
    'break_armored': 'Sons/novos/efeitos/break_armored.wav',
    'break_explosive': 'Sons/novos/efeitos/break_explosive.wav',
    'break_bonus': 'Sons/novos/efeitos/break_bonus.wav',
    'break_indestructible': 'Sons/novos/efeitos/break_indestructible.wav',
    'break_frozen': 'Sons/novos/efeitos/break_frozen.wav',
    'break_mirror': 'Sons/novos/efeitos/break_mirror.wav',
    'break_heal': 'Sons/novos/efeitos/break_heal.wav',
    'break_coin': 'Sons/novos/efeitos/break_coin.wav',
    
    // Sons novos — Poderes
    'powerup_expand': 'Sons/novos/efeitos/powerup_expand.wav',
    'powerup_fireball': 'Sons/novos/efeitos/powerup_fireball.wav',
    'powerup_laser': 'Sons/novos/efeitos/powerup_laser.wav',
    'powerup_shield': 'Sons/novos/efeitos/powerup_shield.wav',
    'powerup_multiball': 'Sons/novos/efeitos/powerup_multiball.wav',
    'powerup_magnet': 'Sons/novos/efeitos/powerup_magnet.wav',
    'powerup_slow': 'Sons/novos/efeitos/powerup_slow.wav',
    'powerup_ghost': 'Sons/novos/efeitos/powerup_ghost.wav',
    'powerup_mega': 'Sons/novos/efeitos/powerup_mega.wav',
    'powerup_drone': 'Sons/novos/efeitos/powerup_drone.wav',
    'powerup_bomb': 'Sons/novos/efeitos/powerup_bomb.wav',
    
    // Sons novos — Combos
    'combo_low': 'Sons/novos/efeitos/combo_low.wav',
    'combo_mid': 'Sons/novos/efeitos/combo_mid.wav',
    'combo_high': 'Sons/novos/efeitos/combo_high.wav',
    'combo_gold': 'Sons/novos/efeitos/combo_gold.wav',
    'combo_master': 'Sons/novos/efeitos/combo_master.wav',
    
    // Sons novos — Eventos
    'level_up': 'Sons/novos/efeitos/level_up.wav',
    'level_milestone': 'Sons/novos/efeitos/level_milestone.wav',
    'life_up': 'Sons/novos/efeitos/life_up.wav',
    'life_down': 'Sons/novos/efeitos/life_down.wav',
    'game_over': 'Sons/novos/efeitos/game_over.wav',
    'near_miss': 'Sons/novos/efeitos/near_miss.wav',
    'paddle_hit': 'Sons/novos/efeitos/paddle_hit.wav',
    'wall_hit': 'Sons/novos/efeitos/wall_hit.wav',
    'store_powerup': 'Sons/novos/efeitos/store_powerup.wav',
    'use_stored': 'Sons/novos/efeitos/use_stored.wav',
    
    // Sons novos — Especiais
    'frozen_effect': 'Sons/novos/efeitos/frozen_effect.wav',
    'mirror_effect': 'Sons/novos/efeitos/mirror_effect.wav',
    'explosion_chain': 'Sons/novos/efeitos/explosion_chain.wav',
    'drone_shoot': 'Sons/novos/efeitos/drone_shoot.wav',
    'bomb_explosion': 'Sons/novos/efeitos/bomb_explosion.wav',
};

// Mapeamento de sons por tipo de tijolo
export const BRICK_SOUNDS = {
    'normal': 'break_normal',
    'armored': 'break_armored',
    'explosive': 'break_explosive',
    'bonus': 'break_bonus',
    'indestructible': 'break_indestructible',
    'frozen': 'break_frozen',
    'mirror': 'break_mirror',
    'heal': 'break_heal',
    'coin': 'break_coin',
};

// Mapeamento de sons por poder
export const POWERUP_SOUNDS = {
    'expand': 'powerup_expand',
    'fireball': 'powerup_fireball',
    'laser': 'powerup_laser',
    'shield': 'powerup_shield',
    'multiball': 'powerup_multiball',
    'magnet': 'powerup_magnet',
    'slow': 'powerup_slow',
    'ghost': 'powerup_ghost',
    'mega': 'powerup_mega',
    'drone': 'powerup_drone',
    'bomb': 'powerup_bomb',
};

// Mapeamento de sons por combo
export const COMBO_SOUNDS = {
    'low': 'combo_low',
    'mid': 'combo_mid',
    'high': 'combo_high',
    'gold': 'combo_gold',
    'master': 'combo_master',
};

// ===== FALLBACKS: sons que existem no projeto (os novos ainda não existem) =====
const SOUND_FALLBACKS = {
    // Tijolos → pieces (som original de peças caindo)
    'break_normal': 'pieces',
    'break_armored': 'pieces2',
    'break_explosive': 'pieces2',
    'break_bonus': 'pieces',
    'break_indestructible': 'pieces2',
    'break_frozen': 'pieces',
    'break_mirror': 'pieces',
    'break_heal': 'pieces',
    'break_coin': 'pieces',
    // Poderes → victory / launch
    'powerup_expand': 'victory',
    'powerup_fireball': 'launch2',
    'powerup_laser': 'launch',
    'powerup_shield': 'victory',
    'powerup_multiball': 'victory',
    'powerup_magnet': 'launch',
    'powerup_slow': 'launch',
    'powerup_ghost': 'launch2',
    'powerup_mega': 'launch2',
    'powerup_drone': 'launch',
    'powerup_bomb': 'launch2',
    // Combos → victory
    'combo_low': 'pieces',
    'combo_mid': 'pieces2',
    'combo_high': 'victory',
    'combo_gold': 'victory',
    'combo_master': 'victory',
    // Eventos
    'level_up': 'victory',
    'level_milestone': 'victory',
    'life_up': 'victory',
    'life_down': 'pieces',
    'game_over': 'victory',
    'near_miss': 'launch',
    'paddle_hit': 'launch',
    'wall_hit': 'pieces',
    'store_powerup': 'launch',
    'use_stored': 'victory',
    // Especiais
    'frozen_effect': 'pieces',
    'mirror_effect': 'pieces',
    'explosion_chain': 'pieces2',
    'drone_shoot': 'launch',
    'bomb_explosion': 'launch2',
};

export function initAudio() {
    const names = Object.keys(SOUND_PATHS);
    let loaded = 0;
    let total = 0;
    
    function onLoad() {
        loaded++;
        if (loaded === total) {
            console.log(`[Audio] ${loaded} sons carregados`);
        }
    }
    
    function onError(name) {
        UNAVAILABLE_SOUNDS.add(name);
        onLoad();
    }
    
    for (const name of names) {
        const path = SOUND_PATHS[name];
        if (!path) continue;
        total++;
        const pool = [];
        for (let i = 0; i < 3; i++) { // Pool de 3 por som
            const audio = new Audio();
            audio.preload = 'auto';
            audio.volume = 0.5;
            audio.addEventListener('canplaythrough', onLoad, { once: true });
            audio.addEventListener('error', () => onError(name), { once: true });
            audio.src = path;
            audio.load();
            pool.push(audio);
        }
        SOUNDS[name] = pool;
    }
}

// Verificar se um som está disponível (não deu erro de carregamento)
function soundIsAvailable(name) {
    if (!SOUNDS[name]) return false;
    if (UNAVAILABLE_SOUNDS.has(name)) return false;
    // Verificar se algum áudio do pool carregou com sucesso
    for (const audio of SOUNDS[name]) {
        if (!audio.error && audio.readyState >= 2) {
            return true;
        }
    }
    return false;
}

export function playSound(name, volume, pitchVariation) {
    if (state.muted) return;
    
    // Se o som não existe ou falhou ao carregar, tentar fallback
    if (!SOUNDS[name] || UNAVAILABLE_SOUNDS.has(name)) {
        const fallback = SOUND_FALLBACKS[name];
        if (fallback && SOUNDS[fallback] && !UNAVAILABLE_SOUNDS.has(fallback)) {
            name = fallback;
        } else {
            return; // Nenhum som disponível
        }
    }
    
    try {
        const pool = SOUNDS[name];
        if (!soundPoolIndex[name]) soundPoolIndex[name] = 0;
        const idx = soundPoolIndex[name] % pool.length;
        soundPoolIndex[name]++;
        const audio = pool[idx];
        const baseVol = volume !== undefined ? volume : 0.5;
        audio.volume = Math.min(1, baseVol * settings.sfxVolume);
        audio.currentTime = 0;
        
        // Pitch variation: ligeira alteração na velocidade
        if (pitchVariation) {
            audio.playbackRate = 0.85 + Math.random() * 0.3;
        } else {
            audio.playbackRate = 1;
        }
        
        audio.play().catch(() => {
            // Se falhar, tentar com o próximo do pool
            const nextIdx = (idx + 1) % pool.length;
            const nextAudio = pool[nextIdx];
            nextAudio.volume = audio.volume;
            nextAudio.currentTime = 0;
            nextAudio.playbackRate = audio.playbackRate;
            nextAudio.play().catch(() => {});
        });
    } catch (e) {
        // Silent fail
    }
}

// ===== SON POR TIPO DE TIJOLO =====
export function playBrickSound(brickType) {
    const soundName = BRICK_SOUNDS[brickType] || 'break_normal';
    playSound(soundName, 0.5, true);
}

// ===== SON POR PODER =====
export function playPowerupSound(powerupType) {
    const soundName = POWERUP_SOUNDS[powerupType] || 'powerup_expand';
    playSound(soundName, 0.6);
}

// ===== SON POR COMBO =====
export function playComboSound(comboTier) {
    const soundName = COMBO_SOUNDS[comboTier] || 'combo_low';
    playSound(soundName, 0.7);
}

// ===== SON DE PÁDEL =====
export function playPaddleHit(powerupType) {
    if (powerupType === 'fireball') {
        playSound('paddle_hit', 0.4, true);
    } else {
        playSound('launch', 0.3, true);
    }
}

// ===== SON DE PAREDE =====
export function playWallHit() {
    playSound('wall_hit', 0.2, true);
}

// ===== SON DE PODER ARMAZENADO =====
export function playStorePowerup() {
    playSound('store_powerup', 0.4);
}

export function playUseStored() {
    playSound('use_stored', 0.5);
}

// ===== SONS DE EVENTOS =====
export function playLevelUp() {
    playSound('level_up', 0.7);
}

export function playLevelMilestone() {
    playSound('level_milestone', 0.8);
}

export function playLifeUp() {
    playSound('life_up', 0.6);
}

export function playLifeDown() {
    playSound('life_down', 0.5);
}

export function playGameOver() {
    playSound('game_over', 0.7);
}

export function playNearMiss() {
    playSound('near_miss', 0.4);
}

// ===== SONS ESPECIAIS =====
export function playFrozenEffect() {
    playSound('frozen_effect', 0.5);
}

export function playMirrorEffect() {
    playSound('mirror_effect', 0.5);
}

export function playExplosionChain() {
    playSound('explosion_chain', 0.7);
}

export function playDroneShoot() {
    playSound('drone_shoot', 0.3);
}

export function playBombExplosion() {
    playSound('bomb_explosion', 0.8);
}

// ===== FILTRO DE ÁUDIO PARA SLOW-MO =====
let audioContext = null;
let masterGain = null;
let lowpassFilter = null;

function initAudioContext() {
    if (!audioContext) {
        try {
            audioContext = new (window.AudioContext || window.webkitAudioContext)();
            masterGain = audioContext.createGain();
            masterGain.connect(audioContext.destination);
            
            lowpassFilter = audioContext.createBiquadFilter();
            lowpassFilter.type = 'lowpass';
            lowpassFilter.frequency.value = 20000;
            lowpassFilter.connect(masterGain);
        } catch (e) {
            console.warn('[Audio] Web Audio API não suportado');
        }
    }
}

// Aplicar filtro de lowpass quando em slow-mo
export function setSlowMoAudio(intensity) {
    if (!lowpassFilter) return;
    // intensity: 0 a 1 (1 = máximo slow-mo)
    const freq = 20000 - (intensity * 15000); // 20000 -> 5000
    lowpassFilter.frequency.value = freq;
    masterGain.gain.value = 1 - (intensity * 0.2); // Ligeiramente mais silencioso
}

export function resetSlowMoAudio() {
    if (!lowpassFilter) return;
    lowpassFilter.frequency.value = 20000;
    masterGain.gain.value = 1;
}

// --- Background music (30% volume) ---
const MUSIC_FILES = [
    'Sons/sons play game/Calabouço Pixelado (1).mp3',
    'Sons/sons play game/Calabouço Pixelado.mp3',
    'Sons/sons play game/Corrida Contra o Destino.mp3',
    'Sons/sons play game/Loop do Labirinto.mp3',
    'Sons/sons play game/Sob o Trovão dos Tambores.mp3',
];

// Músicas especiais (adaptativas)
const SPECIAL_MUSIC = {
    'tensao': 'Sons/novas_musicas/musica_tensao.mp3',
    'combo': 'Sons/novas_musicas/musica_combo.mp3',
    'vitoria': 'Sons/novas_musicas/musica_vitoria.mp3',
};

const MUSIC_VOLUME = 0.3;
let musicPlayer = null;
let musicPlaying = false;
let musicCurrentTrack = -1;
let musicRetryCount = 0;
const MAX_MUSIC_RETRIES = 3;

function pickRandomTrack(files, current) {
    if (files.length <= 1) return 0;
    let next;
    do {
        next = Math.floor(Math.random() * files.length);
    } while (next === current);
    return next;
}

function handleMusicPlayError(err) {
    if (!musicPlaying) return;
    
    if (err && (err.name === 'NotAllowedError' || err.code === 20)) {
        console.warn("Música do jogo pausada aguardando interação do usuário.");
        const resumeMusic = () => {
            if (musicPlaying && musicPlayer) {
                musicPlayer.play().catch(() => {});
            }
            window.removeEventListener('click', resumeMusic);
            window.removeEventListener('touchstart', resumeMusic);
        };
        window.addEventListener('click', resumeMusic);
        window.addEventListener('touchstart', resumeMusic);
        return;
    }

    musicRetryCount++;
    if (musicRetryCount <= MAX_MUSIC_RETRIES) {
        console.error(`Erro ao carregar trilha sonora. Tentando novamente (${musicRetryCount}/${MAX_MUSIC_RETRIES}) em 3 segundos...`);
        setTimeout(() => {
            if (musicPlaying) playNextMusicTrack();
        }, 3000);
    } else {
        console.error("Limite de falhas de carregamento de áudio atingido. Parando música de fundo.");
    }
}

function playNextMusicTrack() {
    if (!musicPlaying) return;
    musicCurrentTrack = pickRandomTrack(MUSIC_FILES, musicCurrentTrack);
    
    try {
        if (musicPlayer) {
            musicPlayer.src = '';
        }
        musicPlayer = new Audio();
        musicPlayer.src = MUSIC_FILES[musicCurrentTrack];
        musicPlayer.volume = MUSIC_VOLUME * settings.musicVolume;
        musicPlayer.loop = false;
        
        musicPlayer.addEventListener('ended', () => {
            if (musicPlaying) {
                musicRetryCount = 0;
                playNextMusicTrack();
            }
        });
        
        musicPlayer.addEventListener('error', () => {
            handleMusicPlayError(new Error("Erro de carregamento do arquivo de áudio."));
        });
        
        musicPlayer.play().catch(handleMusicPlayError);
    } catch (e) {
        handleMusicPlayError(e);
    }
}

export function startMusic() {
    if (musicPlayer) stopMusic();
    musicPlaying = true;
    musicCurrentTrack = -1;
    musicRetryCount = 0;
    playNextMusicTrack();
}

export function stopMusic() {
    musicPlaying = false;
    if (musicPlayer) {
        try { musicPlayer.pause(); } catch (e) {}
        musicPlayer.src = '';
        musicPlayer = null;
    }
}

// --- Música especial (adaptativa) ---
let specialMusicPlayer = null;

export function playSpecialMusic(type) {
    const file = SPECIAL_MUSIC[type];
    if (!file) return;
    
    // Crossfade: fade out música normal, fade in especial
    if (musicPlayer) {
        const fadeOut = setInterval(() => {
            if (musicPlayer.volume > 0.05) {
                musicPlayer.volume -= 0.05;
            } else {
                clearInterval(fadeOut);
                musicPlayer.pause();
            }
        }, 100);
    }
    
    try {
        specialMusicPlayer = new Audio();
        specialMusicPlayer.src = file;
        specialMusicPlayer.volume = 0;
        specialMusicPlayer.loop = true;
        
        const fadeIn = setInterval(() => {
            if (specialMusicPlayer.volume < MUSIC_VOLUME * settings.musicVolume) {
                specialMusicPlayer.volume += 0.05;
            } else {
                clearInterval(fadeIn);
            }
        }, 100);
        
        specialMusicPlayer.play().catch(() => {});
    } catch (e) {}
}

export function stopSpecialMusic() {
    if (specialMusicPlayer) {
        try { 
            specialMusicPlayer.pause(); 
            specialMusicPlayer.src = '';
        } catch (e) {}
        specialMusicPlayer = null;
    }
    // Retomar música normal
    if (musicPlaying && musicPlayer) {
        musicPlayer.play().catch(() => {});
        const fadeIn = setInterval(() => {
            if (musicPlayer.volume < MUSIC_VOLUME * settings.musicVolume) {
                musicPlayer.volume += 0.05;
            } else {
                clearInterval(fadeIn);
            }
        }, 100);
    }
}

// --- Start screen music (70% volume) ---
const START_MUSIC_FILES = [
    'Sons/musica de inicio/Corrida Contra o Destino.mp3',
    'Sons/musica de inicio/Sob o Trovão dos Tambores.mp3',
];
const START_MUSIC_VOLUME = 0.7;
let startMusicPlayer = null;
let startMusicPlaying = false;
let startMusicCurrentTrack = -1;
let startMusicRetryCount = 0;
const MAX_START_RETRIES = 3;

function handleStartMusicPlayError(err) {
    if (!startMusicPlaying) return;

    if (err && (err.name === 'NotAllowedError' || err.code === 20)) {
        console.warn("Música de início pausada aguardando interação do usuário.");
        const resumeStartMusic = () => {
            if (startMusicPlaying && startMusicPlayer) {
                startMusicPlayer.play().catch(() => {});
            }
            window.removeEventListener('click', resumeStartMusic);
            window.removeEventListener('touchstart', resumeStartMusic);
        };
        window.addEventListener('click', resumeStartMusic);
        window.addEventListener('touchstart', resumeStartMusic);
        return;
    }

    startMusicRetryCount++;
    if (startMusicRetryCount <= MAX_START_RETRIES) {
        console.error(`Erro ao carregar música de início. Tentando novamente (${startMusicRetryCount}/${MAX_START_RETRIES}) em 3 segundos...`);
        setTimeout(() => {
            if (startMusicPlaying) playNextStartTrack();
        }, 3000);
    } else {
        console.error("Limite de falhas de carregamento de áudio atingido. Parando música de início.");
    }
}

function playNextStartTrack() {
    if (!startMusicPlaying) return;
    startMusicCurrentTrack = pickRandomTrack(START_MUSIC_FILES, startMusicCurrentTrack);
    
    try {
        if (startMusicPlayer) {
            startMusicPlayer.src = '';
        }
        startMusicPlayer = new Audio();
        startMusicPlayer.src = START_MUSIC_FILES[startMusicCurrentTrack];
        startMusicPlayer.volume = START_MUSIC_VOLUME * settings.musicVolume;
        startMusicPlayer.loop = false;
        
        startMusicPlayer.addEventListener('ended', () => {
            if (startMusicPlaying) {
                startMusicRetryCount = 0;
                playNextStartTrack();
            }
        });
        
        startMusicPlayer.addEventListener('error', () => {
            handleStartMusicPlayError(new Error("Erro de carregamento do arquivo de áudio."));
        });
        
        startMusicPlayer.play().catch(handleStartMusicPlayError);
    } catch (e) {
        handleStartMusicPlayError(e);
    }
}

export function playStartMusic() {
    stopStartMusic();
    startMusicPlaying = true;
    startMusicCurrentTrack = -1;
    startMusicRetryCount = 0;
    playNextStartTrack();
}

export function stopStartMusic() {
    startMusicPlaying = false;
    if (startMusicPlayer) {
        try { startMusicPlayer.pause(); } catch (e) {}
        startMusicPlayer.src = '';
        startMusicPlayer = null;
    }
}

// --- Volume control functions ---
export function setMusicVolume(v) {
    settings.musicVolume = v;
    saveSettings();
    if (musicPlayer) musicPlayer.volume = MUSIC_VOLUME * v;
    if (startMusicPlayer) startMusicPlayer.volume = START_MUSIC_VOLUME * v;
    if (specialMusicPlayer) specialMusicPlayer.volume = MUSIC_VOLUME * v;
}

export function setSfxVolume(v) {
    settings.sfxVolume = v;
    saveSettings();
}

export function setMuted(muted) {
    state.muted = muted;
    if (muted) {
        settings._musicVolume = settings.musicVolume;
        settings._sfxVolume = settings.sfxVolume;
        setMusicVolume(0);
        setSfxVolume(0);
    } else {
        setMusicVolume(settings._musicVolume !== undefined ? settings._musicVolume : 0.7);
        setSfxVolume(settings._sfxVolume !== undefined ? settings._sfxVolume : 0.8);
    }
}

// Verificar se sons novos existem (para debug)
export function checkMissingSounds() {
    const missing = [];
    for (const [name, path] of Object.entries(SOUND_PATHS)) {
        const audio = new Audio(path);
        audio.addEventListener('error', () => {
            missing.push({ name, path });
        });
        audio.addEventListener('canplaythrough', () => {
            // OK
        }, { once: true });
        audio.load();
    }
    
    setTimeout(() => {
        if (missing.length > 0) {
            console.warn('[Audio] Sons em falta:', missing);
        } else {
            console.log('[Audio] Todos os sons estão disponíveis');
        }
    }, 2000);
}

// Inicializar contexto de áudio no primeiro clique
window.addEventListener('click', () => {
    initAudioContext();
}, { once: true });

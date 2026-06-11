// physics.js — Atualização da física (paddle, bolas, lasers, powerups, colisões, nível)

import { state, paddle, scoreDisplay, coinsDisplay, levelDisplay, comboDisplay, startOverlay, H } from './state.js';
import { input } from './input.js';
import { 
    playSound, stopMusic, startMusic, playStartMusic, stopStartMusic, 
    playBrickSound, playPowerupSound, playComboSound, playPaddleHit, 
    playWallHit, playStorePowerup, playUseStored, playLevelUp, playLevelMilestone,
    playLifeUp, playLifeDown, playGameOver, playNearMiss, playFrozenEffect,
    playMirrorEffect, playExplosionChain, playDroneShoot, playBombExplosion,
    setSlowMoAudio, resetSlowMoAudio
} from './audio.js';
import { getComboInfo, resetGoldMasterLifeFlag, shouldGiveGoldMasterLife } from './combo.js';
import { spawnParticles, spawnComboParticles, updateParticles, addPopup, spawnFireTrailParticles } from './particles.js';
import { giveExtraLife, useReserveLife } from './lives.js';
import { updateLivesDisplay, showLevelBanner, showComboPopup, flashScreen, showGameOver, showWin, updatePowerupIndicators, updateComboMeter, showTrialWall, scoreBounce, comboMeterPulse, comboWarning, livesPulse, screenGlow } from './ui.js';
import { saveGame, addGameHistoryEntry } from './save.js';
import { isTrialBlocked, updateTrialMaxLevel } from './auth.js';
import { generateBricks } from './bricks.js';
import { applyTheme, getCurrentTheme, transitionTheme } from './theme.js';
import { draw, drawStatic, spawnBgParticles } from './render.js';
export { drawStatic }; // Re-exportado porque main.js importa de physics.js
import { addXP, recordGameSession } from './profile.js';
import {
    checkScoreAchievements,
    checkLevelAchievements,
    checkComboAchievements,
    checkBricksAchievements,
    checkSpecialAchievement
} from './achievements.js';

function gameOver() {
    stopMusic();
    state.gameState = 'over';
    saveGame();
    addGameHistoryEntry();
    
    // Registrar game session no servidor
    const sessionData = {
        mode: 'classic',
        score: state.score,
        level: state.level,
        duration: Math.floor((Date.now() - state.stats.startTime) / 1000),
        bricks_broken: state.stats.bricksBroken,
        max_combo: state.stats.maxCombo,
        powerups_collected: state.stats.powerupsCollected,
        accuracy: 0, // TODO: calcular accuracy
        won: false
    };
    recordGameSession(sessionData);
    
    // Verificar conquistas de score e tijolos
    checkScoreAchievements(state.score);
    checkBricksAchievements(state.stats.bricksBroken);
    checkComboAchievements(state.stats.maxCombo);
    
    stopLoop();
    drawStatic();
    showGameOver();
    playGameOver();
    playStartMusic();
}

function checkLevelClear() {
    const alive = state.bricks.filter(b => b.alive && !b.indestructible).length;
    if (alive === 0) {
        state.level++;
        if (state.level > state.maxLevel) {
            stopMusic();
            state.gameState = 'win';
            saveGame();
            addGameHistoryEntry();
            
            // Registrar vitória no servidor
            const winSession = {
                mode: 'classic',
                score: state.score,
                level: state.level,
                duration: Math.floor((Date.now() - state.stats.startTime) / 1000),
                bricks_broken: state.stats.bricksBroken,
                max_combo: state.stats.maxCombo,
                powerups_collected: state.stats.powerupsCollected,
                accuracy: 0,
                won: true
            };
            recordGameSession(winSession);
            
            // Verificar conquistas de vitória
            checkLevelAchievements(state.level);
            checkScoreAchievements(state.score);
            checkBricksAchievements(state.stats.bricksBroken);
            checkComboAchievements(state.stats.maxCombo);
            checkSpecialAchievement('win');
            
            stopLoop();
            drawStatic();
            showWin();
            playSound('victory', 0.6);
            setTimeout(playStartMusic, 1500);
        } else if (isTrialBlocked(state.level)) {
            updateTrialMaxLevel(state.level);
            stopMusic();
            state.gameState = 'start';
            saveGame();
            stopLoop();
            drawStatic();
            showTrialWall(state.score, state.level);
            playStartMusic();
        } else {
            updateTrialMaxLevel(state.level);
            levelDisplay.textContent = state.level;
            
            // Verificar conquistas de nível
            checkLevelAchievements(state.level);
            checkScoreAchievements(state.score);

            // Verificar conquista de combo
            if (state.stats.maxCombo >= 5) {
                checkComboAchievements(state.stats.maxCombo);
            }

            // Aplicar o tema atual baseado no nível (muda a cada 50 níveis) com transição suave
            const theme = transitionTheme(state.level, 1200);
            spawnBgParticles(theme);

            // Mensagens de milestone em marcos especiais
            const milestones = {
                100:  '⚡ NÍVEL 100 — SEM VOLTA!',
                200:  '🔥 NÍVEL 200 — MESTRE DO JOGO!',
                250:  '💎 NÍVEL 250 — LENDÁRIO!',
                300:  '🌌 NÍVEL 300 — ALÉM DOS LIMITES!',
                400:  '☄️ NÍVEL 400 — IMPARÁVEL!',
                500:  '🏆 NÍVEL 500 — METADE DO CAMINHO!',
                600:  '🚀 NÍVEL 600 — ESTRATOSFÉRICO!',
                700:  '👑 NÍVEL 700 — ROYALTY!',
                750:  '💥 NÍVEL 750 — DESTRUIÇÃO TOTAL!',
                800:  '🌟 NÍVEL 800 — ELITE SUPREMA!',
                900:  '🔱 NÍVEL 900 — QUASE LÁ!',
                950:  '⚔️ NÍVEL 950 — BATALHA FINAL!',
                999:  '🎖️ NÍVEL 999 — UM PASSO PARA A GLÓRIA!',
            };

            if (milestones[state.level]) {
                showLevelBanner(milestones[state.level]);
            } else if ((state.level - 1) % 50 === 0) {
                // Mudança de tema a cada 50 níveis
                showLevelBanner('🎨 TEMA: ' + theme.name);
            } else {
                showLevelBanner('NÍVEL ' + state.level);
            }

            // Som de nível completo ou milestone
            if (milestones[state.level]) {
                playLevelMilestone();
            } else {
                playLevelUp();
            }
            
            // Adicionar XP e coins por completar nível
            const levelXP = state.level * 10;
            const levelCoins = Math.floor(state.level * 2); // 2 coins por nível
            state.coins += levelCoins;
            if (coinsDisplay) coinsDisplay.textContent = state.coins.toLocaleString();
            addXP(levelXP, 'level_complete');
            
            generateBricks();
            resetBall();
        }
    }
}

export function update() {
    if (state.gameState !== 'playing') return;
    if (state.paused) return;
    updateJuiceState();
    updatePaddle();
    updatePowerups();
    updateLasers();
    
    // Música adaptativa: combo alto ou tensão
    updateAdaptiveMusic();

    // Combo timer decay — reset combo se não quebrar tijolos
    if (state.comboTimer > 0) {
        state.comboTimer--;
        // UI Juice: combo warning quando combo está a acabar (últimos 30 frames)
        if (state.comboTimer > 0 && state.comboTimer <= 30 && state.comboTimer % 5 === 0) {
            comboWarning();
        }
        if (state.comboTimer === 0) {
            state.combo = 0;
            state.comboCount = 0;
            state.lastComboTier = 0;
            resetGoldMasterLifeFlag();
            comboDisplay.textContent = 'x1';
            comboDisplay.style.color = '';
        }
    }

    // Atualizar todas as bolas ativas
    for (let i = state.balls.length - 1; i >= 0; i--) {
        const b = state.balls[i];
        updateBall(b);
    }
    
    updateParticles();
    checkLevelClear();
    updateComboMeter();
    updatePowerupIndicators();
}

// ===== MÚSICA ADAPTATIVA =====
let lastMusicState = 'normal';

function updateAdaptiveMusic() {
    // Detectar estado de jogo
    let currentState = 'normal';
    if (state.combo >= 10) {
        currentState = 'combo';
    } else if (state.lives <= 2) {
        currentState = 'tensao';
    }
    
    // Só mudar se o estado mudou
    if (currentState !== lastMusicState) {
        if (currentState === 'combo') {
            // Iniciar música de combo
            // playSpecialMusic('combo'); // Descomentar quando tiver música
        } else if (currentState === 'tensao') {
            // Iniciar música de tensão
            // playSpecialMusic('tensao'); // Descomentar quando tiver música
        } else {
            // Parar música especial e voltar à normal
            // stopSpecialMusic(); // Descomentar quando tiver música
        }
        lastMusicState = currentState;
    }
}

// ===== GAME LOOP =====
export function startLoop() {
    if (rafId) cancelAnimationFrame(rafId);
    loop();
}

export function stopLoop() {
    if (rafId) {
        cancelAnimationFrame(rafId);
        rafId = null;
    }
}

function loop() {
    update();
    draw();
    rafId = requestAnimationFrame(loop);
}

// ===== PAUSE =====
export function togglePause() {
    if (state.gameState !== 'playing') return;
    state.paused = !state.paused;
    const pauseOverlay = document.getElementById('pauseOverlay');
    if (state.paused) {
        pauseOverlay.classList.add('show');
        state._laserFrozen = state.powerupTimers.laser;
        state._laserTimerFrozen = state.laserFireTimer;
    } else {
        pauseOverlay.classList.remove('show');
        if (state._laserFrozen !== undefined) {
            state.powerupTimers.laser = state._laserFrozen;
            state.laserFireTimer = state._laserTimerFrozen || 0;
            delete state._laserFrozen;
            delete state._laserTimerFrozen;
        }
    }
}

// ===== CONTINUE SAVED GAME =====
export function continueGame() {
    if (isTrialBlocked(state.level)) {
        showTrialWall(state.score, state.level);
        return;
    }

    state.stats = {
        bricksBroken: state.stats.bricksBroken || 0,
        maxCombo: state.stats.maxCombo || 0,
        powerupsCollected: state.stats.powerupsCollected || 0,
        gamesPlayed: (state.stats.gamesPlayed || 0) + 1,
        startTime: Date.now(),
    };

    applyTheme(state.level);
    spawnBgParticles(getCurrentTheme(state.level));

    state.combo = 0;
    state.comboCount = 0;
    resetGoldMasterLifeFlag();
    state.lastComboTier = 0;
    state.paused = false;
    state.hasShield = false;
    state.isGhost = false;
    scoreDisplay.textContent = state.score;
    levelDisplay.textContent = state.level;
    comboDisplay.textContent = 'x1';
    comboDisplay.style.color = '';
    updateLivesDisplay();
    generateBricks();
    resetBall();
    state.gameState = 'playing';
    startOverlay.classList.add('hidden');
    document.getElementById('gameOverOverlay').classList.add('hidden');
    document.getElementById('winOverlay').classList.add('hidden');

    showLevelBanner('NÍVEL ' + state.level);
    stopStartMusic();
    startMusic();
    startLoop();
}

// ===== START GAME =====
export function startGame() {
    state.score = 0;
    state.lives = state.maxLives;
    state.reserveLife = 0;
    state.level = 1;
    state.stats = {
        bricksBroken: 0,
        maxCombo: 0,
        powerupsCollected: 0,
        gamesPlayed: (state.stats.gamesPlayed || 0) + 1,
        startTime: Date.now(),
    };
    
    // Aplicar tema do nível 1
    applyTheme(1);
    spawnBgParticles(getCurrentTheme(1));
    
    state.combo = 0;
    state.comboCount = 0;
    resetGoldMasterLifeFlag();
    state.lastComboTier = 0;
    resetJuiceState();
    scoreDisplay.textContent = '0';
    if (coinsDisplay) coinsDisplay.textContent = state.coins.toLocaleString();
    levelDisplay.textContent = '1';
    comboDisplay.textContent = 'x1';
    comboDisplay.style.color = '';
    updateLivesDisplay();
    generateBricks();
    resetBall();
    state.gameState = 'playing';
    startOverlay.classList.add('hidden');
    document.getElementById('gameOverOverlay').classList.add('hidden');
    document.getElementById('winOverlay').classList.add('hidden');
    
    showLevelBanner('NÍVEL 1');
    stopStartMusic();
    startMusic();
    startLoop();
}

// ===== RAF ID =====
let rafId = null;

// ===== JUICE STATE =====
export function resetJuiceState() {
    state.shakeAmount = 0;
    state.flashOverlay = 0;
    state.paddleFlash = 0;
    state.paddleScaleY = 1;
    state.paddleScaleX = 1;
    state.slowMoTimer = 0;
    state.popups = [];
    state.gridRipples = [];
    state.particles = [];
    state.comboParticles = [];
    state.balls = [];
    state.powerups = [];
    state.lasers = [];
    state.powerupTimers = { expand: 0, fireball: 0, laser: 0, magnet: 0, slow: 0, ghost: 0, mega: 0, drone: 0 };
    state.hasShield = false;
    state.isGhost = false;
    state.isMega = false;
    state.megaRadius = 12;
    state.storedPowerups = [];
    state.drones = [];
    state.droneFireTimer = 0;
    state.combo = 0;
    state.comboCount = 0;
    resetGoldMasterLifeFlag();
    state.comboTimer = 0;
    state.lastComboTier = 0;
}

function updateJuiceState() {
    if (state.shakeAmount > 0) state.shakeAmount *= 0.92;
    if (state.flashOverlay > 0) state.flashOverlay -= 0.04;
    if (state.paddleFlash > 0) state.paddleFlash -= 0.03;
    if (state.paddleScaleY !== 1) state.paddleScaleY += (1 - state.paddleScaleY) * 0.1;
    if (state.paddleScaleX !== 1) state.paddleScaleX += (1 - state.paddleScaleX) * 0.1;
    if (state.slowMoTimer > 0) state.slowMoTimer--;

    for (let i = state.gridRipples.length - 1; i >= 0; i--) {
        const r = state.gridRipples[i];
        r.life -= 0.015;
        r.maxRadius += 2;
        if (r.life <= 0) state.gridRipples.splice(i, 1);
    }
}

// ===== PADDLE =====
function updatePaddle() {
    const k = input.keys;
    const keyLeft = k['ArrowLeft'] || k['a'] || k['A'];
    const keyRight = k['ArrowRight'] || k['d'] || k['D'];
    if (keyLeft) paddle.targetX -= paddle.speed;
    if (keyRight) paddle.targetX += paddle.speed;
    if (input.mouseX !== null) {
        paddle.targetX = input.mouseX - paddle.w / 2;
    }
    // Limitar targetX para evitar acumulação infinita
    paddle.targetX = Math.max(-paddle.w, Math.min(640, paddle.targetX));
    // Lerp suave (como no referência)
    paddle.x += (paddle.targetX - paddle.x) * 0.35;
    paddle.x = Math.max(0, Math.min(640 - paddle.w, paddle.x));
}

// ===== POWERUPS =====
function updatePowerups() {
    for (let i = state.powerups.length - 1; i >= 0; i--) {
        const p = state.powerups[i];
        p.y += p.speed;
        if (p.y + p.h > paddle.y && p.y < paddle.y + paddle.h &&
            p.x + p.w > paddle.x && p.x < paddle.x + paddle.w) {
            activatePowerup(p.type);
            playSound('victory', 0.3);
            state.powerups.splice(i, 1);
            state.stats.powerupsCollected++;
            continue;
        }
        if (p.y > 480) state.powerups.splice(i, 1);
    }
    const t = state.powerupTimers;
    if (t.expand > 0) { t.expand--; if (t.expand === 0) paddle.w = 100; }
    if (t.fireball > 0) t.fireball--;
    if (t.laser > 0) {
        t.laser--;
        // Laser dispara automaticamente enquanto ativo (não só quando a bola bate no paddle)
        fireLaser();
    }
    if (t.magnet > 0) t.magnet--;
    if (t.slow > 0) t.slow--;
    if (t.ghost > 0) { t.ghost--; if (t.ghost === 0) state.isGhost = false; }
    if (t.mega > 0) {
        t.mega--;
        if (t.mega === 0) {
            state.isMega = false;
            for (const b of state.balls) b.r = state.normalRadius;
        }
    }
    if (t.drone > 0) {
        t.drone--;
        updateDrones();
        if (t.drone === 0) state.drones = [];
    }
}

// ===== DRONES =====
function updateDrones() {
    state.droneFireTimer--;
    for (const d of state.drones) {
        d.x = paddle.x + (d.x < paddle.x + paddle.w / 2 ? 10 : paddle.w - 18);
        d.y = paddle.y - 15;
        d.angle += 0.1;
    }
    if (state.droneFireTimer <= 0 && state.drones.length > 0) {
        state.droneFireTimer = 20;
        for (const d of state.drones) {
            state.lasers.push({
                x: d.x + d.w / 2 - 2,
                y: d.y,
                w: 4, h: 10, speed: 7, color: d.color
            });
        }
        playDroneShoot();
    }
}

function activatePowerup(type) {
    // Se já tem um poder ativo do mesmo tipo, armazenar (max 2)
    const storable = ['expand', 'fireball', 'laser', 'shield', 'multiball', 'magnet', 'slow', 'ghost', 'mega', 'drone', 'bomb'];
    const isActiveTimer = (t) => state.powerupTimers[t] > 0;
    const isActiveFlag = (t) => t === 'shield' && state.hasShield;

    if (storable.includes(type)) {
        const isActive = isActiveTimer(type) || isActiveFlag(type);
        if (isActive && state.storedPowerups.length < 2) {
            state.storedPowerups.push(type);
            playStorePowerup();
            return;
        }
    }
    
    // Som de poder ativado
    playPowerupSound(type);

    switch (type) {
        case 'expand':
            state.powerupTimers.expand = 600;
            paddle.w = 140;
            break;
        case 'fireball':
            state.powerupTimers.fireball = 420;
            break;
        case 'laser':
            state.powerupTimers.laser = 360;
            break;
        case 'shield':
            state.hasShield = true;
            break;
        case 'multiball':
            const existing = [...state.balls];
            for (const b of existing) {
                let newDx, newDy;
                if (b.attached) {
                    // Se bola está presa ao paddle, dar velocidade de lançamento
                    const angle = -Math.PI / 2 + (Math.random() - 0.5) * 1.0;
                    const levelBonus = Math.min(state.level - 1, 10) * 0.3;
                    const spd = BALL_SPEED + levelBonus;
                    newDx = Math.cos(angle) * spd;
                    newDy = Math.sin(angle) * spd;
                } else {
                    const angle = (Math.random() - 0.5) * 1.2;
                    newDx = Math.cos(angle) * b.dx - Math.sin(angle) * b.dy;
                    newDy = Math.sin(angle) * b.dx + Math.cos(angle) * b.dy;
                }
                state.balls.push({
                    x: b.x, y: b.y, r: b.r,
                    dx: newDx,
                    dy: newDy,
                    trail: [],
                    nearMissTriggered: false,
                    attached: false,
                });
            }
            break;
        case 'magnet':
            state.powerupTimers.magnet = 480;
            break;
        case 'slow':
            state.powerupTimers.slow = 360;
            // Diminuir velocidade de todas as bolas
            for (const b of state.balls) {
                const spd = Math.sqrt(b.dx * b.dx + b.dy * b.dy);
                if (spd > 0) {
                    const newSpd = Math.max(spd * 0.6, BALL_MIN_SPEED);
                    b.dx = (b.dx / spd) * newSpd;
                    b.dy = (b.dy / spd) * newSpd;
                }
            }
            break;
        case 'ghost':
            state.powerupTimers.ghost = 300;
            state.isGhost = true;
            break;
        case 'mega':
            state.powerupTimers.mega = 240;
            state.isMega = true;
            state.megaRadius = 12;
            for (const b of state.balls) {
                b.r = state.megaRadius;
            }
            break;
        case 'drone':
            state.powerupTimers.drone = 540;
            state.drones = [
                { x: paddle.x + 10, y: paddle.y - 15, w: 8, h: 8, speed: 3, color: '#ff6600', angle: 0 },
                { x: paddle.x + paddle.w - 18, y: paddle.y - 15, w: 8, h: 8, speed: 3, color: '#ff6600', angle: 0 },
            ];
            break;
        case 'bomb':
            // Explodir todos os tijolos num raio de 120px da bola
            for (const b of state.balls) {
                for (const brick of state.bricks) {
                    if (!brick.alive || brick.indestructible) continue;
                    const dx = (brick.x + brick.w / 2) - b.x;
                    const dy = (brick.y + brick.h / 2) - b.y;
                    if (dx * dx + dy * dy < 120 * 120) {
                        brick.hp = 0;
                        brick.alive = false;
                        onBrickDestroyed(brick);
                    }
                }
                playBombExplosion();
                flashScreen('rgba(255,68,0,0.5)', 15);
                state.shakeAmount = 12;
                spawnParticles(b.x, b.y, '#ff4400', 30);
            }
            break;
    }
}

// ===== USE STORED POWERUP =====
export function useStoredPowerup(index) {
    if (index < 0 || index >= state.storedPowerups.length) return;
    const type = state.storedPowerups[index];
    state.storedPowerups.splice(index, 1);
    playUseStored();
    activatePowerup(type);
}

// ===== LASERS =====

function updateLasers() {
    for (let i = state.lasers.length - 1; i >= 0; i--) {
        const l = state.lasers[i];
        l.y -= l.speed;
        for (const brick of state.bricks) {
            if (!brick.alive) continue;
            if (l.x < brick.x + brick.w && l.x + l.w > brick.x &&
                l.y < brick.y + brick.h && l.y + l.h > brick.y) {
                brick.hp--;
                brick.hitFlash = 1;
                if (brick.hp <= 0 && !brick.indestructible) {
                    brick.alive = false;
                    onBrickDestroyed(brick);
                }
                state.lasers.splice(i, 1);
                break;
            }
        }
        if (i < state.lasers.length && state.lasers[i] && state.lasers[i].y + state.lasers[i].h < 0) {
            state.lasers.splice(i, 1);
        }
    }
}

function fireLaser() {
    state.laserFireTimer--;
    if (state.laserFireTimer <= 0) {
        state.laserFireTimer = 15;
        state.lasers.push({ x: paddle.x + 10, y: paddle.y - 6, w: 4, h: 12, speed: 8, color: '#39ff14' });
        state.lasers.push({ x: paddle.x + paddle.w - 14, y: paddle.y - 6, w: 4, h: 12, speed: 8, color: '#39ff14' });
    }
}

// ===== BALL =====
export function resetBall() {
    const r = state.isMega ? state.megaRadius : state.normalRadius;
    state.balls = [{
        x: 320,
        y: paddle.y - r - 2,
        r: r,
        dx: 0,
        dy: 0,
        trail: [],
        attached: true,
        nearMissTriggered: false,
    }];
}

export function launchBall() {
    const b = state.balls[0];
    if (b && b.attached) {
        // Ângulo consistente: spread de ~60° (como no referência)
        const angle = -Math.PI / 2 + (Math.random() - 0.5) * 0.6;
        // Velocidade escala com nível
        const levelBonus = Math.min(state.level - 1, 10) * 0.3;
        const spd = BALL_SPEED + levelBonus;
        b.dx = Math.cos(angle) * spd;
        b.dy = Math.sin(angle) * spd;
        b.attached = false;
    }
}

const BALL_SPEED = 5;
const BALL_MAX_SPEED = 9;
const BALL_MIN_SPEED = 3.5;

function updateBall(b) {
    if (b.attached) {
        b.x = paddle.x + paddle.w / 2;
        b.y = paddle.y - 8;
        return;
    }

    const speedMul = state.slowMoTimer > 0 ? 0.3 : 1;
    const isFireball = state.powerupTimers.fireball > 0;
    const isMagnet = state.powerupTimers.magnet > 0;
    const isSlow = state.powerupTimers.slow > 0;
    const isGhost = state.isGhost;

    // Magnet: atrair bola ligeiramente para o centro do paddle
    if (isMagnet && b.dy > 0 && b.y > H * 0.3) {
        const paddleCenter = paddle.x + paddle.w / 2;
        const dist = paddleCenter - b.x;
        b.dx += dist * 0.003;
    }

    // Slow: velocidade reduzida
    const slowMul = isSlow ? 0.7 : 1;

    b.x += b.dx * speedMul * slowMul;
    b.y += b.dy * speedMul * slowMul;

    if (isFireball) spawnFireTrailParticles(b.x, b.y);

    // Trail
    b.trail.push({ x: b.x, y: b.y });
    if (b.trail.length > 12) b.trail.shift();

    // Near-Miss detection
    if (state.balls.length === 1 && b.dy > 0 && !b.nearMissTriggered) {
        if (b.y + b.r >= paddle.y - 18 && b.y + b.r < paddle.y) {
            if (b.x >= paddle.x - 40 && b.x <= paddle.x + paddle.w + 40) {
                state.slowMoTimer = 35;
                b.nearMissTriggered = true;
                playNearMiss();
                setSlowMoAudio(1.0);
            }
        }
    }
    
    // Reset slow-mo audio quando acabar
    if (state.slowMoTimer === 0 && b.nearMissTriggered) {
        resetSlowMoAudio();
        b.nearMissTriggered = false;
    }

    // Wall collisions
    if (b.x - b.r < 0) {
        b.x = b.r;
        b.dx = Math.abs(b.dx);
        playWallHit();
        state.gridRipples.push({ x: 0, y: b.y, life: 0.8, maxRadius: 6, strength: 0.8 });
    }
    if (b.x + b.r > 640) {
        b.x = 640 - b.r;
        b.dx = -Math.abs(b.dx);
        playWallHit();
        state.gridRipples.push({ x: 640, y: b.y, life: 0.8, maxRadius: 6, strength: 0.8 });
    }
    if (b.y - b.r < 0) {
        b.y = b.r;
        b.dy = Math.abs(b.dy);
        playWallHit();
        state.gridRipples.push({ x: b.x, y: 0, life: 0.8, maxRadius: 6, strength: 0.8 });
    }

    // Paddle collision
    const paddleTop = paddle.y;
    const paddleBottom = paddle.y + paddle.h;
    // Só colide se a bola estiver descendo e dentro dos limites X
    if (b.dy > 0 && b.y + b.r >= paddleTop && b.y - b.r <= paddleBottom &&
        b.x + b.r >= paddle.x && b.x - b.r <= paddle.x + paddle.w) {

        // Corrigir penetração: garantir que a bola fica ACIMA do paddle
        if (b.y + b.r > paddleTop) {
            b.y = paddleTop - b.r;
        }

        const hitPos = (b.x - paddle.x - paddle.w / 2) / (paddle.w / 2); // -1..1
        // Ângulo de ricochete: mapear hitPos para 0..1
        const refHit = (hitPos + 1) / 2; // 0..1
        // LIMITAR ÂNGULO MÍNIMO para evitar loops horizontais (nunca < -60° ou > -120°)
        const angle = -Math.PI * 0.67 + refHit * Math.PI * 0.34;
        const speed = Math.max(BALL_SPEED * 0.9, Math.sqrt(b.dx * b.dx + b.dy * b.dy));
        b.dx = Math.cos(angle) * speed;
        b.dy = Math.sin(angle) * speed;

        state.paddleFlash = 1;
        state.paddleScaleY = 0.85;
        state.paddleScaleX = 1.08;
        b.nearMissTriggered = false;
        playPaddleHit(state.powerupTimers.fireball > 0 ? 'fireball' : null);

        state.gridRipples.push({
            x: b.x,
            y: paddle.y,
            life: 1,
            maxRadius: 8,
            strength: 1.2,
        });

        // Laser já dispara automaticamente em updatePowerups()
    }

    // Fell off bottom
    if (b.y - b.r > 480) {
        // Ghost: atravessa o fundo e reaparece no topo
        if (isGhost) {
            b.y = -b.r;
            return;
        }

        const idx = state.balls.indexOf(b);
        if (idx > -1) state.balls.splice(idx, 1);

        if (state.balls.length === 0) {
            if (state.hasShield) { state.hasShield = false; resetBall(); playLifeUp(); livesPulse(); return; }
            if (useReserveLife()) { resetBall(); playLifeUp(); livesPulse(); return; }

            state.lives--;
            updateLivesDisplay();
            livesPulse();
            if (state.lives <= 0) {
                gameOver();
            } else {
                playLifeDown();
                resetBall();
                playSound('launch', 0.3, true);
            }
        }
        return;
    }

    // Speed cap — manter entre min e max
    const spd = Math.sqrt(b.dx * b.dx + b.dy * b.dy);
    if (spd > BALL_MAX_SPEED) {
        b.dx = (b.dx / spd) * BALL_MAX_SPEED;
        b.dy = (b.dy / spd) * BALL_MAX_SPEED;
    } else if (spd < BALL_MIN_SPEED && spd > 0) {
        b.dx = (b.dx / spd) * BALL_MIN_SPEED;
        b.dy = (b.dy / spd) * BALL_MIN_SPEED;
    }

    // Brick collisions — CORRIGIDO: círculo-retângulo, verifica TODOS, resolve corretamente
    let closestBrick = null;
    let closestDist = Infinity;
    let closestNormal = { x: 0, y: 0 };

    for (const brick of state.bricks) {
        if (!brick.alive) continue;

        const bx = brick.x, by = brick.y, bw = brick.w, bh = brick.h;

        // Ponto mais próximo do centro da bola dentro do retângulo do tijolo
        const closestX = Math.max(bx, Math.min(b.x, bx + bw));
        const closestY = Math.max(by, Math.min(b.y, by + bh));

        const dx = b.x - closestX;
        const dy = b.y - closestY;
        const distSq = dx * dx + dy * dy;

        if (distSq < b.r * b.r) {
            // Colisão! Calcular distância e normal
            const dist = Math.sqrt(distSq);
            let normalX, normalY;
            if (dist > 0.001) {
                normalX = dx / dist;
                normalY = dy / dist;
            } else {
                // Centro exatamente no canto — empurrar para cima
                normalX = 0;
                normalY = -1;
            }

            // Corrigir posição da bola para fora do tijolo
            const overlap = b.r - dist;
            b.x += normalX * overlap;
            b.y += normalY * overlap;

            // Guardar o tijolo mais próximo do centro para reflexão
            if (distSq < closestDist) {
                closestDist = distSq;
                closestBrick = brick;
                closestNormal = { x: normalX, y: normalY };
            }

            // Fireball destrói instantaneamente
            if (isFireball && !brick.indestructible) {
                brick.hp = 0;
            } else {
                brick.hp--;
            }
            brick.hitFlash = 1;

            state.gridRipples.push({
                x: brick.x + brick.w / 2,
                y: brick.y + brick.h / 2,
                life: 1,
                maxRadius: 5,
                strength: 0.8,
            });

            if (brick.hp <= 0 && !brick.indestructible) {
                brick.alive = false;
                onBrickDestroyed(brick);
            }
        }
    }

    // Aplicar reflexão com o tijolo mais próximo (ou uma média se múltiplos)
    if (closestBrick) {
        // Fireball: passa através do tijolo sem ricochetar, mas deixa explosão
        if (isFireball) {
            // Explosão de fogo: danifica tijolos vizinhos em raio de 50px
            const blastRadius = 50;
            const blastX = closestBrick.x + closestBrick.w / 2;
            const blastY = closestBrick.y + closestBrick.h / 2;
            for (const other of state.bricks) {
                if (!other.alive || other.indestructible || other === closestBrick) continue;
                const odx = (other.x + other.w / 2) - blastX;
                const ody = (other.y + other.h / 2) - blastY;
                if (odx * odx + ody * ody < blastRadius * blastRadius) {
                    other.hp--;
                    other.hitFlash = 1;
                    if (other.hp <= 0) {
                        other.alive = false;
                        onBrickDestroyed(other);
                    }
                }
            }
            // Efeito visual de explosão
            spawnParticles(blastX, blastY, '#ff6600', 10);
            state.gridRipples.push({
                x: blastX,
                y: blastY,
                life: 1.2,
                maxRadius: 10,
                strength: 1.5,
            });
        } else {
            // Refletir vetor velocidade ao longo da normal (normal)
            const dot = b.dx * closestNormal.x + b.dy * closestNormal.y;
            // Só refletir se a bola está indo na direção do tijolo
            if (dot < 0) {
                b.dx -= 2 * dot * closestNormal.x;
                b.dy -= 2 * dot * closestNormal.y;
            }
        }
    }
}

function onBrickDestroyed(brick) {
    state.stats.bricksBroken++;
    let points = 10;
    if (brick.brickType === 'armored') points = 25;
    if (brick.brickType === 'explosive') points = 30;
    if (brick.brickType === 'bonus') points = 50;
    if (brick.brickType === 'coin') points = 100;
    if (brick.brickType === 'frozen') points = 20;
    if (brick.brickType === 'mirror') points = 20;
    if (brick.brickType === 'heal') points = 15;

    state.combo++;
    state.comboCount++;
    state.comboTimer = 90; // 1.5s a 60fps

    const comboMul = Math.min(state.combo, 15);
    const total = points * comboMul;
    state.score += total;
    scoreDisplay.textContent = state.score;
    comboDisplay.textContent = 'x' + state.combo;
    
    // UI Juice: score bounce
    scoreBounce();

    // Som do tijolo destruído
    playBrickSound(brick.brickType);

    // Explosive chain — propagação recursiva
    if (brick.brickType === 'explosive') {
        triggerExplosion(brick);
        playExplosionChain();
    }

    if (brick.brickType === 'bonus') spawnPowerup(brick.x + brick.w / 2, brick.y + brick.h / 2);

    // Frozen: congela velocidade de todas as bolas
    if (brick.brickType === 'frozen') {
        for (const b of state.balls) {
            const spd = Math.sqrt(b.dx * b.dx + b.dy * b.dy);
            if (spd > 0) {
                const newSpd = Math.max(spd * 0.5, BALL_MIN_SPEED);
                b.dx = (b.dx / spd) * newSpd;
                b.dy = (b.dy / spd) * newSpd;
            }
        }
        playFrozenEffect();
        flashScreen('rgba(0,229,255,0.3)', 6);
        spawnParticles(brick.x + brick.w / 2, brick.y + brick.h / 2, '#00e5ff', 12);
    }

    // Mirror: reflete bola em direção aleatória
    if (brick.brickType === 'mirror') {
        for (const b of state.balls) {
            const dist = Math.sqrt((b.x - (brick.x + brick.w / 2)) ** 2 + (b.y - (brick.y + brick.h / 2)) ** 2);
            if (dist < 80) {
                const angle = Math.random() * Math.PI * 2;
                const spd = Math.sqrt(b.dx * b.dx + b.dy * b.dy);
                b.dx = Math.cos(angle) * spd;
                b.dy = Math.sin(angle) * spd;
            }
        }
        playMirrorEffect();
        flashScreen('rgba(255,255,255,0.3)', 6);
        spawnParticles(brick.x + brick.w / 2, brick.y + brick.h / 2, '#ffffff', 12);
    }

    // Heal: vida extra
    if (brick.brickType === 'heal') {
        giveExtraLife();
        playLifeUp();
        spawnParticles(brick.x + brick.w / 2, brick.y + brick.h / 2, '#44ff88', 15);
    }

    // Coin: pontos extras + ganha coins
    if (brick.brickType === 'coin') {
        const coinPoints = 100;
        const coinReward = 5; // Ganha 5 coins por tijolo coin
        state.score += coinPoints;
        state.coins += coinReward;
        scoreDisplay.textContent = state.score;
        coinsDisplay.textContent = state.coins.toLocaleString();
        addPopup('+' + coinPoints + ' 💰+' + coinReward, brick.x + brick.w / 2, brick.y, '#ffcc00', 1.0);
        spawnParticles(brick.x + brick.w / 2, brick.y + brick.h / 2, '#ffcc00', 15);
    }

    spawnParticles(brick.x + brick.w / 2, brick.y + brick.h / 2, brick.color.fill, 15);

    const comboInfo = getComboInfo(state.comboCount);
    if (comboInfo && state.lastComboTier !== comboInfo.threshold) {
        state.lastComboTier = comboInfo.threshold;
        showComboPopup(comboInfo);
        flashScreen(comboInfo.flashColor, comboInfo.shake);
        state.shakeAmount = comboInfo.shake;
        spawnComboParticles(brick.x + brick.w / 2, brick.y + brick.h / 2, comboInfo.color, comboInfo.particles);
        
        // UI Juice: combo meter pulse
        comboMeterPulse();
        
        // UI Juice: screen glow em combos altos
        if (comboInfo.tier === 'gold' || comboInfo.tier === 'master') {
            screenGlow(comboInfo.color, 0.2);
        }
        
        // Som de combo com base no tier
        let comboTier = 'low';
        if (comboInfo.tier === 'gold') comboTier = 'gold';
        else if (comboInfo.tier === 'master') comboTier = 'master';
        else if (comboInfo.threshold >= 9) comboTier = 'high';
        else if (comboInfo.threshold >= 6) comboTier = 'mid';
        playComboSound(comboTier);

        // Gold Master: 1 vida extra por combo
        if (comboInfo.tier === 'master' && shouldGiveGoldMasterLife()) {
            giveExtraLife();
        }
    }

    const popupColor = comboInfo ? comboInfo.color : (brick.color.fill || '#ffe156');
    addPopup('+' + total, brick.x + brick.w / 2, brick.y, popupColor, 0.8);
}

function triggerExplosion(brick) {
    const exploded = [brick];
    const chain = [brick];

    while (chain.length > 0) {
        const current = chain.pop();
        for (const other of state.bricks) {
            if (!other.alive || other === current || exploded.includes(other)) continue;
            const dx = other.x + other.w / 2 - (current.x + current.w / 2);
            const dy = other.y + other.h / 2 - (current.y + current.h / 2);
            const dist = Math.sqrt(dx * dx + dy * dy);
            if (dist < 80) {
                other.hp -= 2;
                other.hitFlash = 1;
                if (other.hp <= 0 && !other.indestructible) {
                    other.alive = false;
                    state.stats.bricksBroken++;
                    if (other.brickType === 'bonus') spawnPowerup(other.x + other.w / 2, other.y + other.h / 2);
                    if (other.brickType === 'explosive') {
                        exploded.push(other);
                        chain.push(other);
                    }
                }
            }
        }
    }
    flashScreen('rgba(255,68,0,0.4)', 10);
    state.shakeAmount = 8;
}

function spawnPowerup(x, y) {
    const types = ['expand', 'fireball', 'laser', 'shield', 'multiball', 'magnet', 'slow', 'ghost', 'mega', 'drone', 'bomb'];
    const colors = {
        expand: '#00e5ff', fireball: '#ff3c6f', laser: '#39ff14',
        shield: '#bd00ff', multiball: '#ffd700',
        magnet: '#ff00ff', slow: '#4488ff', ghost: '#ffffff',
        mega: '#ff8800', drone: '#ff6600', bomb: '#ff0000',
    };
    const type = types[Math.floor(Math.random() * types.length)];
    state.powerups.push({ x: x - 10, y: y, w: 20, h: 20, speed: 1.5, type, color: colors[type] });
}

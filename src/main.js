// main.js — Entry point, inicia o jogo e liga os modulos

import { state, settings } from './state.js';
import { initAudio, playStartMusic, setMusicVolume, setSfxVolume, setMuted } from './audio.js';
import { generateBricks } from './bricks.js';
import { startGame, continueGame, drawStatic, resetBall, togglePause, launchBall, useStoredPowerup } from './physics.js';
import { updateLivesDisplay, displayHighScores, wireAuthButtons, updateUserIndicator, updateStartOverlay } from './ui.js';
import { setOnLaunch, setOnPause, input } from './input.js';
import { spawnBgParticles } from './render.js';
import { getCurrentTheme } from './theme.js';
import { initAuth } from './auth.js';
import { loadSavedGame, loadServerSave, hasSavedGame } from './save.js';
import { showShop } from './shop.js';
import { showAchievementsPanel } from './achievements.js';
import { checkUpdateOnStartup } from './updateUI.js';

// Init session + UI
(async () => {
    // Verificar se o jogo está a correr via servidor
    if (window.location.protocol === 'file:') {
        console.error('⚠️ ERRO CRITICO: Abriste o ficheiro HTML diretamente!');
        console.error('   O jogo precisa do servidor para funcionar corretamente.');
        console.error('   Usa: node server.js e acede a http://localhost:8081');
    }
    
    await initAuth();
    wireAuthButtons();
    updateUserIndicator();
    state.hasSavedGame = hasSavedGame();
    updateStartOverlay();

    // Verificar actualizacao em background (nao bloqueia o jogo)
    checkUpdateOnStartup();
})();

// Init audio
initAudio();
updateLivesDisplay();
generateBricks();
resetBall();
drawStatic();
playStartMusic();

// Spawn background particles
spawnBgParticles(getCurrentTheme(state.level));

// Wire launch callback
setOnLaunch(() => {
    if (state.gameState === 'playing') launchBall();
});

// Wire pause callback
setOnPause(() => {
    togglePause();
});

// Expose stored powerup usage
window._useStoredPowerup = (idx) => {
    useStoredPowerup(idx);
};

// Keyboard shortcuts for stored powerups
document.addEventListener('keydown', e => {
    if (e.key === '1') useStoredPowerup(0);
    if (e.key === '2') useStoredPowerup(1);
});

// Display high scores on load
displayHighScores();

// Buttons
document.getElementById('startBtn').addEventListener('click', startGame);
document.getElementById('retryBtn').addEventListener('click', startGame);
document.getElementById('winRetryBtn').addEventListener('click', startGame);

document.getElementById('continueBtn').addEventListener('click', async () => {
    const loaded = (await loadServerSave()) || loadSavedGame();
    if (loaded) {
        state.hasSavedGame = true;
        continueGame();
    }
});

// ===== MUTE BUTTON =====
const muteBtn = document.getElementById('muteBtn');
let isMuted = false;

muteBtn.addEventListener('click', () => {
    isMuted = !isMuted;
    setMuted(isMuted);
    muteBtn.textContent = isMuted ? '🔇' : '🔊';
    muteBtn.classList.toggle('muted', isMuted);
});

// ===== PAUSE OVERLAY: allow click to resume =====
document.getElementById('pauseOverlay').addEventListener('click', () => {
    if (state.paused) togglePause();
});

// ===== SETTINGS =====
const settingsOverlay = document.getElementById('settingsOverlay');
const settingsBtn = document.getElementById('settingsBtn');
const settingsCloseBtn = document.getElementById('settingsCloseBtn');
const musicSlider = document.getElementById('musicVolumeSlider');
const sfxSlider = document.getElementById('sfxVolumeSlider');
const musicValue = document.getElementById('musicVolumeValue');
const sfxValue = document.getElementById('sfxVolumeValue');

// Init sliders from saved settings
musicSlider.value = Math.round(settings.musicVolume * 100);
sfxSlider.value = Math.round(settings.sfxVolume * 100);
musicValue.textContent = musicSlider.value + '%';
sfxValue.textContent = sfxSlider.value + '%';

settingsBtn.addEventListener('click', () => {
    settingsOverlay.classList.remove('hidden');
});

settingsCloseBtn.addEventListener('click', () => {
    settingsOverlay.classList.add('hidden');
});

// Close settings when clicking outside the panel
settingsOverlay.addEventListener('click', (e) => {
    if (e.target === settingsOverlay) {
        settingsOverlay.classList.add('hidden');
    }
});

musicSlider.addEventListener('input', () => {
    const v = musicSlider.value / 100;
    musicValue.textContent = musicSlider.value + '%';
    setMusicVolume(v);
    // Unmute if adjusting volume while muted
    if (isMuted) {
        isMuted = false;
        muteBtn.textContent = '🔊';
        muteBtn.classList.remove('muted');
    }
});

sfxSlider.addEventListener('input', () => {
    const v = sfxSlider.value / 100;
    sfxValue.textContent = sfxSlider.value + '%';
    setSfxVolume(v);
    if (isMuted) {
        isMuted = false;
        muteBtn.textContent = '🔊';
        muteBtn.classList.remove('muted');
    }
});

// ===== SHOP BUTTON =====
document.getElementById('shopBtn').addEventListener('click', showShop);

// ===== START SCREEN SHOP & ACHIEVEMENTS =====
document.getElementById('startShopBtn').addEventListener('click', showShop);
document.getElementById('startAchievementsBtn').addEventListener('click', showAchievementsPanel);
document.getElementById('profileAchievementsBtn').addEventListener('click', showAchievementsPanel);

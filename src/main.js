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
import { showRankingOverlay, hideRankingOverlay } from './ui.js';
import { checkUpdateOnStartup } from './updateUI.js';
import { checkForUpdate } from './update.js';

// ===== SPLASH SCREEN =====
function initSplashScreen() {
    const splash = document.getElementById('splashScreen');
    if (!splash) return;
    // Esconder splash após ~2.5s
    setTimeout(() => {
        splash.classList.add('done');
        setTimeout(() => {
            splash.style.display = 'none';
        }, 700);
    }, 2500);
}

// ===== MOBILE CONTROLS =====
function initMobileControls() {
    const mobileControls = document.getElementById('mobileControls');
    if (!mobileControls) return;

    // Só mostrar quando o jogo estiver a jogar e em dispositivos touch
    const isTouch = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
    const isMobile = window.matchMedia('(max-width: 700px)').matches;
    if (!isTouch && !isMobile) {
        mobileControls.classList.add('desktop-hidden');
        return;
    }

    const leftBtn = document.getElementById('mobileLeft');
    const rightBtn = document.getElementById('mobileRight');
    const launchBtn = document.getElementById('mobileLaunch');

    function addTouch(btn, key) {
        if (!btn) return;
        btn.addEventListener('touchstart', (e) => {
            e.preventDefault();
            input.keys[key] = true;
        }, { passive: false });
        btn.addEventListener('touchend', (e) => {
            e.preventDefault();
            input.keys[key] = false;
        }, { passive: false });
        btn.addEventListener('mousedown', (e) => {
            e.preventDefault();
            input.keys[key] = true;
        });
        btn.addEventListener('mouseup', (e) => {
            e.preventDefault();
            input.keys[key] = false;
        });
        btn.addEventListener('mouseleave', (e) => {
            input.keys[key] = false;
        });
    }

    addTouch(leftBtn, 'ArrowLeft');
    addTouch(rightBtn, 'ArrowRight');

    if (launchBtn) {
        launchBtn.addEventListener('touchstart', (e) => {
            e.preventDefault();
            if (state.gameState === 'playing') launchBall();
        }, { passive: false });
        launchBtn.addEventListener('click', (e) => {
            e.preventDefault();
            if (state.gameState === 'playing') launchBall();
        });
    }

    // Mostrar/ocultar controles mobile conforme estado do jogo
    function updateMobileControlsVisibility() {
        const playing = state.gameState === 'playing' && !state.paused;
        mobileControls.classList.toggle('active', playing);
    }

    // Checar a cada frame
    const originalLoop = window.requestAnimationFrame;
    function checkLoop() {
        updateMobileControlsVisibility();
        requestAnimationFrame(checkLoop);
    }
    checkLoop();
}

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

    // Splash e mobile controls
    initSplashScreen();
    initMobileControls();
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
const checkUpdateBtn = document.getElementById('checkUpdateBtn');
const updateStatusText = document.getElementById('updateStatusText');
const currentVersionLabel = document.getElementById('currentVersionLabel');

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

// ===== VERSION CHECK IN SETTINGS =====
currentVersionLabel.textContent = '2.0.0';
updateStatusText.textContent = '';

checkUpdateBtn.addEventListener('click', async () => {
    updateStatusText.textContent = 'A verificar...';
    updateStatusText.className = 'settings-update-status checking';
    checkUpdateBtn.disabled = true;
    checkUpdateBtn.textContent = 'A VERIFICAR...';

    const result = await checkForUpdate();

    if (result.available) {
        updateStatusText.textContent = 'Nova versao disponivel: v' + result.latestVersion;
        updateStatusText.className = 'settings-update-status available';
        checkUpdateBtn.textContent = '⬇ BAIXAR v' + result.latestVersion;
        checkUpdateBtn.onclick = () => {
            window.open(result.downloadUrl || result.releaseUrl, '_blank');
        };
    } else if (result.error) {
        updateStatusText.textContent = 'Nao foi possivel verificar';
        updateStatusText.className = 'settings-update-status error';
        checkUpdateBtn.textContent = 'VERIFICAR ACTUALIZACOES';
    } else {
        updateStatusText.textContent = 'Já tens a versao mais recente!';
        updateStatusText.className = 'settings-update-status latest';
        checkUpdateBtn.textContent = 'VERIFICAR ACTUALIZACOES';
    }
    checkUpdateBtn.disabled = false;
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

// ===== START SCREEN SHOP & ACHIEVEMENTS & RANKING =====
document.getElementById('startShopBtn').addEventListener('click', showShop);
document.getElementById('startAchievementsBtn').addEventListener('click', showAchievementsPanel);
document.getElementById('startRankingBtn').addEventListener('click', showRankingOverlay);
document.getElementById('profileAchievementsBtn').addEventListener('click', showAchievementsPanel);

// ===== RANKING OVERLAY CLOSE =====
const rankingOverlay = document.getElementById('rankingOverlay');
const rankingCloseBtn = document.getElementById('rankingCloseBtn');
if (rankingCloseBtn) {
    rankingCloseBtn.addEventListener('click', hideRankingOverlay);
}
if (rankingOverlay) {
    rankingOverlay.addEventListener('click', (e) => {
        if (e.target === rankingOverlay) hideRankingOverlay();
    });
}

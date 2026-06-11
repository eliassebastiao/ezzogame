// input.js — Teclado, rato e toque (apenas estado puro)

import { canvas, W } from './state.js';

export const input = {
    keys: {},
    mouseX: null,
};

export let onLaunch = null;
export let onPause = null;

export function setOnLaunch(fn) {
    onLaunch = fn;
}

export function setOnPause(fn) {
    onPause = fn;
}

document.addEventListener('keydown', e => {
    input.keys[e.key] = true;
    if (e.key === ' ') {
        e.preventDefault();
        if (onLaunch) onLaunch();
    }
    if (e.key === 'p' || e.key === 'P' || e.key === 'Escape') {
        e.preventDefault();
        if (onPause) onPause();
    }
});

document.addEventListener('keyup', e => {
    input.keys[e.key] = false;
});

canvas.addEventListener('mousemove', e => {
    const rect = canvas.getBoundingClientRect();
    input.mouseX = (e.clientX - rect.left) * (W / rect.width);
});

canvas.addEventListener('click', () => {
    if (onLaunch) onLaunch();
});

canvas.addEventListener('touchmove', e => {
    e.preventDefault();
    const rect = canvas.getBoundingClientRect();
    input.mouseX = (e.touches[0].clientX - rect.left) * (W / rect.width);
}, { passive: false });

canvas.addEventListener('touchstart', (e) => {
    e.preventDefault();
    // Em mobile, só lançar se clicar na metade inferior do canvas (evitar conflito com HUD)
    const rect = canvas.getBoundingClientRect();
    const touchY = e.touches[0].clientY - rect.top;
    const touchX = e.touches[0].clientX - rect.left;
    // Atualizar mouseX para posicionar o paddle
    input.mouseX = touchX * (W / rect.width);
    if (onLaunch && touchY > rect.height * 0.35) {
        onLaunch();
    }
}, { passive: false });

// ===== RESIZE HANDLER =====
// Garantir que o canvas se ajuste ao container em mobile
function resizeCanvas() {
    const container = canvas.parentElement;
    if (!container) return;
    const vw = window.innerWidth;
    const maxWidth = Math.min(vw * 0.96, 640);
    // Em mobile (< 700px), usar width 100% do container
    if (vw < 700) {
        canvas.style.width = '100%';
        canvas.style.height = 'auto';
    } else {
        canvas.style.width = '';
        canvas.style.height = '';
    }
}

window.addEventListener('resize', resizeCanvas);
// Executar uma vez no load
setTimeout(resizeCanvas, 0);

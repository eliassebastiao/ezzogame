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

canvas.addEventListener('touchstart', () => {
    if (onLaunch) onLaunch();
});

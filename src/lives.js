// lives.js — Lógica de vidas e reserva

import { state } from './state.js';
import { updateLivesDisplay, flashScreen, livesPulse } from './ui.js';

export function giveExtraLife() {
    if (state.lives < state.maxLives) {
        state.lives++;
        updateLivesDisplay();
        livesPulse();
        flashScreen('rgba(0,229,255,0.3)', 6);
    } else {
        state.reserveLife++;
        updateLivesDisplay();
        livesPulse();
        flashScreen('rgba(0,229,255,0.2)', 4);
    }
}

export function useReserveLife() {
    if (state.reserveLife > 0) {
        state.reserveLife--;
        state.lives = 1;
        updateLivesDisplay();
        return true;
    }
    return false;
}

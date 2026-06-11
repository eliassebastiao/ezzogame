// particles.js — Sistema de partículas, popups e rastro de fogo

import { ctx, state } from './state.js';

export function spawnParticles(x, y, color, count, extraSpeed) {
    const spd = extraSpeed || 1;
    // Mais partículas com cap mais alto para explosões impactantes
    const maxCount = Math.min(count, 20);
    for (let i = 0; i < maxCount; i++) {
        const angle = Math.random() * Math.PI * 2;
        const speed = spd + Math.random() * 3.5;
        // Variedade: algumas maiores, outras menores
        const sizeBias = Math.random();
        state.particles.push({
            x, y,
            dx: Math.cos(angle) * speed,
            dy: Math.sin(angle) * speed,
            life: 0.7 + Math.random() * 0.3,
            decay: 0.012 + Math.random() * 0.025,
            size: sizeBias < 0.2 ? 3.5 + Math.random() * 2.5 : 1.5 + Math.random() * 2.5,
            color,
            type: sizeBias < 0.15 ? 'spark' : 'default',
        });
    }
    // Partícula central de flash para impacto
    state.particles.push({
        x, y,
        dx: (Math.random() - 0.5) * 0.5,
        dy: (Math.random() - 0.5) * 0.5,
        life: 0.3,
        decay: 0.04,
        size: 6 + Math.random() * 4,
        color: '#ffffff',
        type: 'flash',
    });
}

export function spawnComboParticles(x, y, color, count) {
    const maxCount = Math.min(count, 50);
    for (let i = 0; i < maxCount; i++) {
        const angle = Math.random() * Math.PI * 2;
        const speed = 2 + Math.random() * 4;
        const sizeBias = Math.random();
        state.comboParticles.push({
            x, y,
            dx: Math.cos(angle) * speed,
            dy: Math.sin(angle) * speed - 2,
            life: 1,
            decay: 0.01 + Math.random() * 0.02,
            size: sizeBias < 0.2 ? 4 + Math.random() * 3 : 2 + Math.random() * 3,
            color,
            gravity: -0.02,
        });
    }
    // Explosão central dourada brilhante para combos altos
    for (let i = 0; i < 5; i++) {
        const a = (i / 5) * Math.PI * 2;
        state.comboParticles.push({
            x, y,
            dx: Math.cos(a) * 5,
            dy: Math.sin(a) * 5,
            life: 0.8,
            decay: 0.03,
            size: 5,
            color: '#ffffff',
            gravity: -0.01,
        });
    }
}

/** Partículas exclusivas de chama/faísca para Fire Ball */
export function spawnFireTrailParticles(x, y) {
    for (let i = 0; i < 3; i++) {
        const angle = Math.random() * Math.PI * 2;
        const speed = 0.5 + Math.random() * 1.5;
        state.particles.push({
            x: x + (Math.random() - 0.5) * 4,
            y: y + (Math.random() - 0.5) * 4,
            dx: Math.cos(angle) * speed,
            dy: Math.sin(angle) * speed + 0.8,
            life: 0.7 + Math.random() * 0.3,
            decay: 0.04 + Math.random() * 0.04,
            size: 2 + Math.random() * 3,
            color: Math.random() > 0.5 ? '#ff5500' : '#ffcc00',
            type: 'fire',
        });
    }
    if (Math.random() < 0.4) {
        state.particles.push({
            x, y,
            dx: (Math.random() - 0.5) * 2,
            dy: 1 + Math.random() * 2,
            life: 0.5,
            decay: 0.06,
            size: 1 + Math.random(),
            color: '#ffffff',
            type: 'spark',
        });
    }
}

/** Popup flutuante de pontuação (+100, COMBO x3, etc.) */
export function addPopup(text, x, y, color, scale = 1) {
    state.popups.push({
        text,
        x,
        y,
        color,
        scale,
        life: 1,
        vy: -1.2 - Math.random() * 0.4,
        wobble: Math.random() * Math.PI * 2,
    });
}

export function updatePopups() {
    for (let i = state.popups.length - 1; i >= 0; i--) {
        const p = state.popups[i];
        p.y += p.vy;
        p.wobble += 0.08;
        p.life -= 0.018;
        if (p.life <= 0) state.popups.splice(i, 1);
    }
}

export function drawPopups() {
    for (const p of state.popups) {
        const alpha = Math.min(1, p.life * 1.5);
        const scale = p.scale * (0.8 + p.life * 0.4);
        ctx.save();
        ctx.globalAlpha = alpha;
        ctx.font = `bold ${Math.round(10 * scale)}px "Press Start 2P"`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.shadowColor = p.color;
        ctx.shadowBlur = 14;
        ctx.fillStyle = p.color;
        const wobbleX = Math.sin(p.wobble) * 2;
        ctx.fillText(p.text, p.x + wobbleX, p.y);
        ctx.restore();
    }
    ctx.globalAlpha = 1;
    ctx.shadowBlur = 0;
}

export function updateParticles() {
    const { particles, comboParticles } = state;
    // Cap global para evitar lag com muitas explosões
    if (particles.length > 500) particles.splice(0, particles.length - 500);
    if (comboParticles.length > 200) comboParticles.splice(0, comboParticles.length - 200);
    for (let i = particles.length - 1; i >= 0; i--) {
        const p = particles[i];
        p.x += p.dx;
        p.y += p.dy;
        if (p.type === 'fire') {
            p.dy -= 0.02;
            p.dx *= 0.96;
        } else if (p.type === 'spark') {
            p.dy += 0.02;
            p.dx *= 0.97;
        } else if (p.type === 'flash') {
            p.dy *= 0.9;
            p.dx *= 0.9;
            p.size *= 0.96;
        } else {
            p.dy += 0.05;
        }
        p.life -= p.decay;
        if (p.life <= 0) particles.splice(i, 1);
    }
    for (let i = comboParticles.length - 1; i >= 0; i--) {
        const p = comboParticles[i];
        p.x += p.dx;
        p.y += p.dy;
        p.dy += p.gravity || 0.05;
        p.life -= p.decay;
        if (p.life <= 0) comboParticles.splice(i, 1);
    }
    updatePopups();
}

export function drawParticles() {
    const { particles, comboParticles } = state;
    for (const p of particles) {
        ctx.globalAlpha = p.life;
        if (p.type === 'fire') {
            ctx.fillStyle = p.color;
            ctx.shadowColor = p.color;
            ctx.shadowBlur = 10;
            ctx.beginPath();
            ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
            ctx.fill();
        } else if (p.type === 'spark') {
            ctx.fillStyle = p.color;
            ctx.shadowColor = p.color;
            ctx.shadowBlur = 10;
            ctx.fillRect(p.x - p.size / 2, p.y - p.size / 2, p.size * 0.6, p.size * 2);
        } else if (p.type === 'flash') {
            ctx.globalAlpha = p.life * 0.8;
            ctx.fillStyle = p.color;
            ctx.shadowColor = p.color;
            ctx.shadowBlur = 20;
            ctx.beginPath();
            ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
            ctx.fill();
        } else {
            ctx.fillStyle = p.color;
            ctx.shadowColor = p.color;
            ctx.shadowBlur = 8;
            ctx.fillRect(p.x - p.size / 2, p.y - p.size / 2, p.size, p.size);
        }
    }
    for (const p of comboParticles) {
        ctx.globalAlpha = p.life;
        ctx.fillStyle = p.color;
        ctx.shadowColor = p.color;
        ctx.shadowBlur = 12;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size / 2, 0, Math.PI * 2);
        ctx.fill();
    }
    ctx.globalAlpha = 1;
    ctx.shadowBlur = 0;
    drawPopups();
}

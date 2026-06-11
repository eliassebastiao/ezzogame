// render.js — Desenho Canvas

import { ctx, W, H, state, paddle } from './state.js';
import { drawParticles } from './particles.js';
import { getCurrentTheme } from './theme.js';

const SLOW_MO_DURATION = 35; // Deve corresponder ao valor em physics.js

function drawBackground(theme) {
    // Linhas de grade suaves com a cor do tema
    const baseAlpha = theme.bg === '#020804' ? 0.015 : 0.015;
    const baseColor = theme.bg === '#020804' ? '0, 255, 102' : '255, 255, 255';
    ctx.lineWidth = 1;
    
    // Aplicar ondulações de grade (grid ripples) nas linhas verticais
    for (let x = 0; x < W; x += 40) {
        ctx.beginPath();
        let hasRipple = false;
        for (let y = 0; y <= H; y += 5) {
            let dx = 0;
            // Calcular distorção baseada nos grid ripples ativos
            for (const r of state.gridRipples) {
                const dist = Math.sqrt((x - r.x) ** 2 + (y - r.y) ** 2);
                if (dist < r.maxRadius) {
                    const influence = (1 - dist / r.maxRadius) * r.life * r.strength * 0.5;
                    dx += Math.sin(dist * 0.1 - r.life * 3) * influence;
                }
            }
            if (Math.abs(dx) > 0.5) hasRipple = true;
            if (y === 0) {
                ctx.moveTo(x + dx, y);
            } else {
                ctx.lineTo(x + dx, y);
            }
        }
        ctx.strokeStyle = `rgba(${baseColor}, ${hasRipple ? baseAlpha * 3 : baseAlpha})`;
        ctx.stroke();
    }
    
    // Aplicar ondulações de grade nas linhas horizontais
    for (let y = 0; y < H; y += 40) {
        ctx.beginPath();
        let hasRipple = false;
        for (let x = 0; x <= W; x += 5) {
            let dy = 0;
            for (const r of state.gridRipples) {
                const dist = Math.sqrt((x - r.x) ** 2 + (y - r.y) ** 2);
                if (dist < r.maxRadius) {
                    const influence = (1 - dist / r.maxRadius) * r.life * r.strength * 0.5;
                    dy += Math.cos(dist * 0.1 - r.life * 3) * influence;
                }
            }
            if (Math.abs(dy) > 0.5) hasRipple = true;
            if (x === 0) {
                ctx.moveTo(x, y + dy);
            } else {
                ctx.lineTo(x, y + dy);
            }
        }
        ctx.strokeStyle = `rgba(${baseColor}, ${hasRipple ? baseAlpha * 3 : baseAlpha})`;
        ctx.stroke();
    }
    
    // Desenhar particulas de fundo
    drawBgParticles(theme);
}

export function spawnBgParticles(theme) {
    state.bgParticles = [];
    const colors = [
        theme.accent2,
        theme.accent,
        theme.accent3,
        'rgba(255,255,255,0.3)',
    ];
    // 20 estrelas lentas + 20 floaters médios + 15 névoa + 5 dust
    for (let i = 0; i < 60; i++) {
        const type = i < 15 ? 'haze' : i < 35 ? 'floater' : i < 55 ? 'star' : 'dust';
        state.bgParticles.push({
            x: Math.random() * (W + 40) - 20,
            y: Math.random() * (H + 40) - 20,
            size: type === 'haze' ? 8 + Math.random() * 12 :
                  type === 'floater' ? 1.5 + Math.random() * 2 :
                  type === 'dust' ? 0.3 + Math.random() * 0.5 :
                  0.5 + Math.random() * 1,
            speed: type === 'haze' ? 0.02 + Math.random() * 0.04 :
                   type === 'floater' ? 0.05 + Math.random() * 0.1 :
                   type === 'dust' ? 0.02 + Math.random() * 0.03 :
                   0.08 + Math.random() * 0.15,
            drift: type === 'haze' ? (Math.random() - 0.5) * 0.02 :
                   (Math.random() - 0.5) * 0.15,
            color: type === 'haze' ? theme.accent2 :
                   type === 'floater' ? colors[Math.floor(Math.random() * colors.length)] :
                   type === 'dust' ? 'rgba(255,255,255,0.5)' :
                   '#ffffff',
            alpha: type === 'haze' ? 0.03 + Math.random() * 0.03 :
                   type === 'floater' ? 0.1 + Math.random() * 0.2 :
                   type === 'dust' ? 0.05 + Math.random() * 0.1 :
                   0.15 + Math.random() * 0.25,
            phase: Math.random() * Math.PI * 2,
            twinkleSpeed: type === 'star' ? 0.02 + Math.random() * 0.03 : 0,
            type,
        });
    }
}

function updateBgParticles() {
    const now = Date.now() * 0.001;
    for (const p of state.bgParticles) {
        p.y -= p.speed;
        p.x += p.drift + Math.sin(p.phase + now * 0.5) * 0.03;
        p.phase += 0.008;
        if (p.type === 'star') {
            // Twinkle: alpha oscila
            p.alpha = (0.15 + Math.sin(now * 3 + p.phase) * 0.15) *
                      (0.7 + Math.sin(now * 1.7 + p.phase * 2) * 0.3);
        }
        if (p.y < -25) {
            p.y = H + 25;
            p.x = Math.random() * W;
        }
        if (p.x < -25) p.x = W + 25;
        if (p.x > W + 25) p.x = -25;
    }
}

function drawBgParticles(theme) {
    if (state.bgParticles.length === 0) {
        spawnBgParticles(theme);
    }
    updateBgParticles();
    for (const p of state.bgParticles) {
        if (p.type === 'haze') {
            ctx.globalAlpha = p.alpha;
            ctx.fillStyle = p.color;
            ctx.shadowColor = p.color;
            ctx.shadowBlur = 20;
            ctx.beginPath();
            ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
            ctx.fill();
        } else if (p.type === 'floater') {
            ctx.globalAlpha = p.alpha;
            ctx.fillStyle = p.color;
            ctx.shadowColor = p.color;
            ctx.shadowBlur = 6;
            ctx.beginPath();
            ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
            ctx.fill();
        } else {
            // Star - cintilante
            ctx.globalAlpha = Math.max(0.05, p.alpha);
            ctx.fillStyle = p.color;
            ctx.shadowColor = p.color;
            ctx.shadowBlur = 3;
            ctx.fillRect(p.x - p.size / 2, p.y - p.size / 2, p.size, p.size);
        }
    }
    ctx.globalAlpha = 1;
    ctx.shadowBlur = 0;
}

function drawPaddle(theme) {
    const isLaser = state.powerupTimers.laser > 0;
    
    // Aplicar squash & stretch (scaleY e scaleX)
    const scaleX = state.paddleScaleX || 1;
    const scaleY = state.paddleScaleY || 1;
    const centerX = paddle.x + paddle.w / 2;
    const centerY = paddle.y + paddle.h / 2;
    const currentW = paddle.w * scaleX;
    const currentH = paddle.h * scaleY;
    const drawX = centerX - currentW / 2;
    const drawY = centerY - currentH / 2;
    
    // Desenhar o corpo principal do paddle
    const grd = ctx.createLinearGradient(drawX, drawY, drawX + currentW, drawY);
    grd.addColorStop(0, theme.paddleColor1);
    grd.addColorStop(1, theme.paddleColor2);
    
    ctx.shadowColor = theme.paddleGlow;
    ctx.shadowBlur = 15 + (state.paddleFlash * 25);
    ctx.fillStyle = grd;
    
    const r = 6 * scaleY;
    ctx.beginPath();
    ctx.moveTo(drawX + r, drawY);
    ctx.lineTo(drawX + currentW - r, drawY);
    ctx.quadraticCurveTo(drawX + currentW, drawY, drawX + currentW, drawY + r);
    ctx.lineTo(drawX + currentW, drawY + currentH - r);
    ctx.quadraticCurveTo(drawX + currentW, drawY + currentH, drawX + currentW - r, drawY + currentH);
    ctx.lineTo(drawX + r, drawY + currentH);
    ctx.quadraticCurveTo(drawX, drawY + currentH, drawX, drawY + currentH - r);
    ctx.lineTo(drawX, drawY + r);
    ctx.quadraticCurveTo(drawX, drawY, drawX + r, drawY);
    ctx.closePath();
    ctx.fill();
    
    // Paddle Flash overlay (brilho branco no impacto)
    if (state.paddleFlash > 0) {
        ctx.globalAlpha = state.paddleFlash * 0.6;
        ctx.fillStyle = '#ffffff';
        ctx.fill();
        ctx.globalAlpha = 1;
    }
    
    ctx.shadowBlur = 0;
    
    // Detalhe de reflexo no paddle
    ctx.fillStyle = 'rgba(255,255,255,0.2)';
    ctx.fillRect(drawX + 8 * scaleX, drawY + 2 * scaleY, currentW - 16 * scaleX, 3 * scaleY);

    // Se estiver com laser ativo, desenha canhões nas pontas do paddle
    if (isLaser) {
        ctx.shadowColor = '#39ff14';
        ctx.shadowBlur = 8;
        ctx.fillStyle = '#39ff14';
        // Canhão esquerdo
        ctx.fillRect(drawX - 2, drawY - 6, 6, 8);
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(drawX, drawY - 4, 2, 4);
        
        ctx.fillStyle = '#39ff14';
        // Canhão direito
        ctx.fillRect(drawX + currentW - 4, drawY - 6, 6, 8);
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(drawX + currentW - 2, drawY - 4, 2, 4);
        ctx.shadowBlur = 0;
    }
}

function drawBalls(theme) {
    const isFireball = state.powerupTimers.fireball > 0;
    const isGhost = state.isGhost;
    const isMega = state.isMega;
    const isSlow = state.powerupTimers.slow > 0;
    const isMagnet = state.powerupTimers.magnet > 0;

    for (const b of state.balls) {
        // Trail mais rico com gradiente
        const trailLength = b.trail.length;
        if (trailLength > 1) {
            for (let i = 0; i < trailLength - 1; i++) {
                const t = b.trail[i];
                const t2 = b.trail[i + 1];
                const alpha = (i / trailLength) * 0.4;
                const lineWidth = b.r * (i / trailLength) * 1.5;
                
                ctx.beginPath();
                ctx.moveTo(t.x, t.y);
                ctx.lineTo(t2.x, t2.y);
                ctx.lineWidth = Math.max(0.5, lineWidth);
                ctx.lineCap = 'round';
                
                if (isFireball) {
                    ctx.strokeStyle = `rgba(255, 100, 0, ${alpha})`;
                } else if (isGhost) {
                    ctx.strokeStyle = `rgba(255, 255, 255, ${alpha * 0.5})`;
                } else if (isSlow) {
                    ctx.strokeStyle = `rgba(68, 136, 255, ${alpha})`;
                } else if (isMega) {
                    ctx.strokeStyle = `rgba(255, 170, 68, ${alpha})`;
                } else {
                    ctx.strokeStyle = `rgba(${theme.ballTrailRGBA}, ${alpha})`;
                }
                ctx.stroke();
            }
        }

        // Ball glow
        if (isFireball) {
            ctx.shadowColor = '#ff5500';
            ctx.shadowBlur = 30;
        } else if (isGhost) {
            ctx.shadowColor = 'rgba(255,255,255,0.5)';
            ctx.shadowBlur = 15;
        } else if (isSlow) {
            ctx.shadowColor = '#4488ff';
            ctx.shadowBlur = 25;
        } else if (isMega) {
            ctx.shadowColor = '#ff8800';
            ctx.shadowBlur = 40;
        } else if (isMagnet) {
            ctx.shadowColor = '#ff00ff';
            ctx.shadowBlur = 20;
        } else {
            ctx.shadowColor = theme.ballColor;
            ctx.shadowBlur = 20;
        }

        ctx.beginPath();
        ctx.arc(b.x, b.y, b.r, 0, Math.PI * 2);
        if (isFireball) {
            ctx.fillStyle = '#ffaa00';
        } else if (isGhost) {
            ctx.globalAlpha = 0.6;
            ctx.fillStyle = '#ffffff';
        } else if (isSlow) {
            ctx.fillStyle = '#88aaff';
        } else if (isMega) {
            ctx.fillStyle = '#ffaa44';
        } else if (isMagnet) {
            ctx.fillStyle = '#ff88ff';
        } else {
            ctx.fillStyle = theme.ballColor;
        }
        ctx.fill();
        ctx.globalAlpha = 1;

        // Highlight interno
        ctx.shadowBlur = 0;
        ctx.beginPath();
        ctx.arc(b.x - 2, b.y - 2, b.r * 0.4, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(255,255,255,0.7)';
        ctx.fill();
    }
}

function drawBricks() {
    const now = Date.now();

    for (const b of state.bricks) {
        if (!b.alive) continue;
        const hpRatio = b.maxHp === 999 ? 1 : (b.hp / b.maxHp);
        const flash = b.hitFlash > 0 ? b.hitFlash : 0;
        if (b.hitFlash > 0) b.hitFlash -= 0.05;

        const type = b.brickType || 'normal';

        // ── GLOW ──
        // Glow base + glow de combo (quando combo é alto, todos os tijolos brilham)
        const comboGlow = state.combo >= 8 ? Math.min((state.combo - 7) / 10, 0.5) : 0;
        const comboHue = (state.combo * 20 + now * 0.05) % 360;
        
        if (type === 'indestructible') {
            ctx.shadowColor = 'rgba(255,30,30,0.6)';
            ctx.shadowBlur = 18 + Math.sin(now * 0.004) * 6;
        } else if (type === 'explosive') {
            ctx.shadowColor = 'rgba(255,100,0,0.8)';
            ctx.shadowBlur = 14 + flash * 18 + Math.sin(now * 0.006) * 5;
        } else if (type === 'bonus') {
            ctx.shadowColor = 'rgba(255,215,0,0.9)';
            ctx.shadowBlur = 16 + Math.sin(now * 0.005) * 8;
        } else if (type === 'frozen') {
            ctx.shadowColor = 'rgba(0,229,255,0.8)';
            ctx.shadowBlur = 14 + Math.sin(now * 0.007) * 4;
        } else if (type === 'mirror') {
            ctx.shadowColor = 'rgba(255,255,255,0.6)';
            ctx.shadowBlur = 12 + Math.sin(now * 0.008) * 6;
        } else if (type === 'heal') {
            ctx.shadowColor = 'rgba(68,255,136,0.7)';
            ctx.shadowBlur = 14 + Math.sin(now * 0.006) * 5;
        } else if (type === 'coin') {
            ctx.shadowColor = 'rgba(255,204,0,0.9)';
            ctx.shadowBlur = 16 + Math.sin(now * 0.005) * 8;
        } else if (type === 'armored') {
            ctx.shadowColor = b.color.glow || 'rgba(160,160,200,0.6)';
            ctx.shadowBlur = 8 + flash * 16;
        } else {
            ctx.shadowColor = b.color.glow || 'rgba(255,255,255,0.3)';
            ctx.shadowBlur = 8 + flash * 18;
        }
        
        // Aplicar glow de combo (overlay)
        if (comboGlow > 0) {
            ctx.shadowColor = `hsla(${comboHue}, 100%, 70%, ${comboGlow})`;
            ctx.shadowBlur = 10 + comboGlow * 20;
        }

        // ── CORPO DO BLOCO ──
        const rx = 3;
        if (type === 'indestructible') {
            ctx.globalAlpha = 0.9;
            const grad = ctx.createLinearGradient(b.x, b.y, b.x, b.y + b.h);
            grad.addColorStop(0, '#888899');
            grad.addColorStop(0.5, '#444455');
            grad.addColorStop(1, '#222233');
            ctx.fillStyle = grad;
        } else if (type === 'explosive') {
            ctx.globalAlpha = 0.85 + hpRatio * 0.15;
            const grad = ctx.createLinearGradient(b.x, b.y, b.x + b.w, b.y + b.h);
            grad.addColorStop(0, '#ff6600');
            grad.addColorStop(0.5, '#ff2200');
            grad.addColorStop(1, '#cc0000');
            ctx.fillStyle = grad;
        } else if (type === 'bonus') {
            ctx.globalAlpha = 1;
            const grad = ctx.createLinearGradient(b.x, b.y, b.x + b.w, b.y + b.h);
            grad.addColorStop(0, '#ffe066');
            grad.addColorStop(0.5, '#ffd700');
            grad.addColorStop(1, '#cc9900');
            ctx.fillStyle = grad;
        } else if (type === 'frozen') {
            ctx.globalAlpha = 0.9;
            const grad = ctx.createLinearGradient(b.x, b.y, b.x + b.w, b.y + b.h);
            grad.addColorStop(0, '#00e5ff');
            grad.addColorStop(0.5, '#0088cc');
            grad.addColorStop(1, '#004488');
            ctx.fillStyle = grad;
        } else if (type === 'mirror') {
            ctx.globalAlpha = 0.85;
            const grad = ctx.createLinearGradient(b.x, b.y, b.x + b.w, b.y + b.h);
            grad.addColorStop(0, '#e0e0e0');
            grad.addColorStop(0.5, '#a0a0a0');
            grad.addColorStop(1, '#606060');
            ctx.fillStyle = grad;
        } else if (type === 'heal') {
            ctx.globalAlpha = 0.9;
            const grad = ctx.createLinearGradient(b.x, b.y, b.x + b.w, b.y + b.h);
            grad.addColorStop(0, '#44ff88');
            grad.addColorStop(0.5, '#00cc66');
            grad.addColorStop(1, '#008844');
            ctx.fillStyle = grad;
        } else if (type === 'coin') {
            ctx.globalAlpha = 1;
            const grad = ctx.createLinearGradient(b.x, b.y, b.x + b.w, b.y + b.h);
            grad.addColorStop(0, '#ffee88');
            grad.addColorStop(0.5, '#ffcc00');
            grad.addColorStop(1, '#cc9900');
            ctx.fillStyle = grad;
        } else if (type === 'armored') {
            ctx.globalAlpha = 0.5 + hpRatio * 0.5;
            const grad = ctx.createLinearGradient(b.x, b.y, b.x + b.w, b.y + b.h);
            grad.addColorStop(0, b.color.fill || '#aaa');
            grad.addColorStop(1, '#334');
            ctx.fillStyle = grad;
        } else {
            ctx.globalAlpha = 0.25 + hpRatio * 0.75;
            ctx.fillStyle = b.color.fill || '#fff';
        }

        ctx.beginPath();
        ctx.moveTo(b.x + rx, b.y);
        ctx.lineTo(b.x + b.w - rx, b.y);
        ctx.quadraticCurveTo(b.x + b.w, b.y, b.x + b.w, b.y + rx);
        ctx.lineTo(b.x + b.w, b.y + b.h - rx);
        ctx.quadraticCurveTo(b.x + b.w, b.y + b.h, b.x + b.w - rx, b.y + b.h);
        ctx.lineTo(b.x + rx, b.y + b.h);
        ctx.quadraticCurveTo(b.x, b.y + b.h, b.x, b.y + b.h - rx);
        ctx.lineTo(b.x, b.y + rx);
        ctx.quadraticCurveTo(b.x, b.y, b.x + rx, b.y);
        ctx.closePath();
        ctx.fill();

        ctx.globalAlpha = 1;
        ctx.shadowBlur = 0;

        // ── REFLEXO NO TOPO ──
        ctx.globalAlpha = 0.18;
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(b.x + 4, b.y + 2, b.w - 8, 3);
        ctx.globalAlpha = 1;
        
        // ── RESPIRAÇÃO: escala pulsante em tijolos especiais ──
        if (type === 'frozen' || type === 'heal' || type === 'coin') {
            const breathScale = 1 + Math.sin(now * 0.003 + b.x * 0.01) * 0.02;
            const centerX = b.x + b.w / 2;
            const centerY = b.y + b.h / 2;
            ctx.save();
            ctx.translate(centerX, centerY);
            ctx.scale(breathScale, breathScale);
            ctx.translate(-centerX, -centerY);
        }

        // ── ÍCONE / DECORAÇÃO POR TIPO ──
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';

        if (type === 'indestructible') {
            // Cruz vermelha animada
            ctx.globalAlpha = 0.7 + Math.sin(now * 0.005) * 0.3;
            ctx.fillStyle = '#ff4444';
            ctx.font = 'bold 10px sans-serif';
            ctx.fillText('✕', b.x + b.w / 2, b.y + b.h / 2);
            ctx.globalAlpha = 1;
        } else if (type === 'explosive') {
            // Ponto central pulsante + borda laranja
            ctx.strokeStyle = 'rgba(255,200,0,0.6)';
            ctx.lineWidth = 1.5;
            ctx.strokeRect(b.x + 2, b.y + 2, b.w - 4, b.h - 4);
            ctx.fillStyle = '#ffdd00';
            ctx.font = 'bold 9px sans-serif';
            ctx.fillText('💥', b.x + b.w / 2, b.y + b.h / 2);
        } else if (type === 'bonus') {
            // Estrela dourada
            ctx.fillStyle = '#ffffff';
            ctx.font = 'bold 9px sans-serif';
            ctx.fillText('★', b.x + b.w / 2, b.y + b.h / 2);
            // Borda brilhante
            ctx.strokeStyle = 'rgba(255,255,200,0.5)';
            ctx.lineWidth = 1.5;
            ctx.strokeRect(b.x + 1, b.y + 1, b.w - 2, b.h - 2);
        } else if (type === 'frozen') {
            // Floco de neve
            ctx.fillStyle = '#ffffff';
            ctx.font = 'bold 10px sans-serif';
            ctx.fillText('❄', b.x + b.w / 2, b.y + b.h / 2);
            ctx.strokeStyle = 'rgba(0,229,255,0.5)';
            ctx.lineWidth = 1.5;
            ctx.strokeRect(b.x + 2, b.y + 2, b.w - 4, b.h - 4);
        } else if (type === 'mirror') {
            // Espelho com reflexo
            ctx.fillStyle = '#ffffff';
            ctx.font = 'bold 10px sans-serif';
            ctx.fillText('◈', b.x + b.w / 2, b.y + b.h / 2);
            ctx.strokeStyle = 'rgba(255,255,255,0.4)';
            ctx.lineWidth = 1.5;
            ctx.strokeRect(b.x + 2, b.y + 2, b.w - 4, b.h - 4);
        } else if (type === 'heal') {
            // Cruz verde
            ctx.fillStyle = '#ffffff';
            ctx.font = 'bold 10px sans-serif';
            ctx.fillText('+', b.x + b.w / 2, b.y + b.h / 2);
            ctx.strokeStyle = 'rgba(68,255,136,0.5)';
            ctx.lineWidth = 1.5;
            ctx.strokeRect(b.x + 2, b.y + 2, b.w - 4, b.h - 4);
        } else if (type === 'coin') {
            // Cifrão
            ctx.fillStyle = '#ffffff';
            ctx.font = 'bold 9px sans-serif';
            ctx.fillText('💰', b.x + b.w / 2, b.y + b.h / 2);
            ctx.strokeStyle = 'rgba(255,204,0,0.5)';
            ctx.lineWidth = 1.5;
            ctx.strokeRect(b.x + 1, b.y + 1, b.w - 2, b.h - 2);
        } else if (type === 'armored') {
            // Padrão metálico: linhas diagonais
            ctx.globalAlpha = 0.12;
            ctx.strokeStyle = '#ffffff';
            ctx.lineWidth = 1;
            for (let i = -b.h; i < b.w + b.h; i += 6) {
                ctx.beginPath();
                ctx.moveTo(b.x + i, b.y);
                ctx.lineTo(b.x + i - b.h, b.y + b.h);
                ctx.stroke();
            }
            ctx.globalAlpha = 1;
        }

        // ── BARRA DE HP (para blocos com maxHp > 2) ──
        if (b.maxHp > 2 && type !== 'indestructible') {
            const barW = b.w - 8;
            const barH = 3;
            const barX = b.x + 4;
            const barY = b.y + b.h - 5;
            // Fundo da barra
            ctx.globalAlpha = 0.4;
            ctx.fillStyle = '#000000';
            ctx.fillRect(barX, barY, barW, barH);
            // Preenchimento
            const hpColor = hpRatio > 0.5 ? '#44ff88' : hpRatio > 0.25 ? '#ffaa00' : '#ff3355';
            ctx.globalAlpha = 0.85;
            ctx.fillStyle = hpColor;
            ctx.fillRect(barX, barY, barW * hpRatio, barH);
            ctx.globalAlpha = 1;
        } else if (b.maxHp === 2 && type !== 'indestructible') {
            // Para HP 2: mostra número pequeno
            ctx.fillStyle = 'rgba(255,255,255,0.9)';
            ctx.font = 'bold 8px sans-serif';
            ctx.textAlign = 'center';
            ctx.fillText(b.hp.toString(), b.x + b.w / 2, b.y + b.h / 2 + (type === 'normal' ? 1 : 0));
        }

        // Fechar respiração se foi aberta
        if (type === 'frozen' || type === 'heal' || type === 'coin') {
            ctx.restore();
        }

        ctx.textBaseline = 'alphabetic';
    }
}

function drawPowerups() {
    for (const p of state.powerups) {
        ctx.shadowColor = p.color;
        ctx.shadowBlur = 12;
        ctx.fillStyle = p.color;
        
        const r = p.w / 2;
        ctx.beginPath();
        ctx.arc(p.x + r, p.y + r, r, 0, Math.PI * 2);
        ctx.fill();

        ctx.shadowBlur = 0;
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.arc(p.x + r, p.y + r, r - 2, 0, Math.PI * 2);
        ctx.stroke();

        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 9px "Press Start 2P"';
        ctx.textAlign = 'center';
        let letter = '';
        if (p.type === 'multiball') letter = 'M';
        if (p.type === 'expand') letter = 'E';
        if (p.type === 'fireball') letter = 'F';
        if (p.type === 'laser') letter = 'L';
        if (p.type === 'shield') letter = 'S';
        ctx.fillText(letter, p.x + r, p.y + r + 3);
    }
}

function drawLasers() {
    for (const l of state.lasers) {
        ctx.shadowColor = l.color;
        ctx.shadowBlur = 10;
        ctx.fillStyle = l.color;
        ctx.fillRect(l.x, l.y, l.w, l.h);
        
        ctx.shadowBlur = 0;
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(l.x + 1, l.y + 1, l.w - 2, l.h - 2);
    }
}

function drawShield() {
    if (!state.hasShield) return;

    ctx.shadowColor = '#bd00ff';
    ctx.shadowBlur = 18;
    ctx.strokeStyle = '#bd00ff';
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.moveTo(10, 474);
    ctx.lineTo(630, 474);
    ctx.stroke();

    ctx.shadowBlur = 0;
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(12, 474);
    ctx.lineTo(628, 474);
    ctx.stroke();
}

function drawDrones() {
    if (state.drones.length === 0) return;
    const now = Date.now();
    for (const d of state.drones) {
        // Drone body
        ctx.shadowColor = d.color;
        ctx.shadowBlur = 12;
        ctx.fillStyle = d.color;
        ctx.beginPath();
        ctx.arc(d.x + d.w / 2, d.y + d.h / 2, d.w / 2, 0, Math.PI * 2);
        ctx.fill();
        // Rotating ring
        ctx.shadowBlur = 0;
        ctx.strokeStyle = 'rgba(255,255,255,0.6)';
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        const rx = d.w / 2 + 3;
        const ry = d.h / 2 + 3;
        ctx.ellipse(d.x + d.w / 2, d.y + d.h / 2, rx, ry, d.angle, 0, Math.PI * 2);
        ctx.stroke();
    }
}

function drawMagnetEffect() {
    if (state.powerupTimers.magnet <= 0) return;
    const paddleCenter = paddle.x + paddle.w / 2;
    const alpha = 0.15 + Math.sin(Date.now() * 0.005) * 0.05;
    ctx.strokeStyle = `rgba(255, 0, 255, ${alpha})`;
    ctx.lineWidth = 1;
    for (const b of state.balls) {
        if (b.dy <= 0) continue;
        const dist = Math.sqrt((paddleCenter - b.x) ** 2 + (paddle.y - b.y) ** 2);
        if (dist < 200 && b.y > H * 0.3) {
            ctx.beginPath();
            ctx.moveTo(paddleCenter, paddle.y);
            ctx.lineTo(b.x, b.y);
            ctx.stroke();
        }
    }
}

function drawShake() {
    if (state.shakeAmount > 0) {
        const sx = (Math.random() - 0.5) * state.shakeAmount;
        const sy = (Math.random() - 0.5) * state.shakeAmount;
        ctx.translate(sx, sy);
        state.shakeAmount *= 0.85;
        if (state.shakeAmount < 0.5) state.shakeAmount = 0;
    }
}

export function draw() {
    const theme = getCurrentTheme(state.level);
    ctx.save();
    drawShake();
    ctx.clearRect(-10, -10, W + 20, H + 20);
    
    drawBackground(theme);
    drawBricks();
    drawShield();
    drawPowerups();
    drawLasers();
    drawDrones();
    drawMagnetEffect();
    drawPaddle(theme);
    drawBalls(theme);
    drawParticles();
    
    // Tonalidade de câmera lenta (Slow-motion tint)
    if (state.slowMoTimer > 0) {
        const slowMoIntensity = state.slowMoTimer / SLOW_MO_DURATION;
        ctx.fillStyle = `rgba(0, 0, 0, ${slowMoIntensity * 0.15})`;
        ctx.fillRect(0, 0, W, H);

        // Bordas de foco (vignette)
        const gradient = ctx.createRadialGradient(W/2, H/2, H/3, W/2, H/2, H);
        gradient.addColorStop(0, 'rgba(0, 229, 255, 0)');
        gradient.addColorStop(1, `rgba(0, 229, 255, ${slowMoIntensity * 0.15})`);
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, W, H);

        // ── DISTORÇÃO GRAVITACIONAL ──
        // Empurra ripple da posição da bola para distorcer a grelha
        // só quando há bola activa e a bola não está attached
        for (const b of state.balls) {
            if (b && !b.attached && slowMoIntensity > 0.3) {
                state.gridRipples.push({
                    x: b.x,
                    y: b.y,
                    life: slowMoIntensity * 0.6,
                    maxRadius: 30 + slowMoIntensity * 20,
                    strength: 2.5 * slowMoIntensity,
                });
            }
        }
    }
    
    ctx.restore();
    if (state.flashOverlay > 0) state.flashOverlay -= 0.5;

    // ── BORDER GLOW: brilho nas bordas do ecrã em combos altos ──
    const combo = state.combo;
    if (combo >= 6 && state.gameState === 'playing') {
        const glowIntensity = Math.min((combo - 5) / 10, 1) * 0.4;
        const hue = (combo * 15 + Date.now() * 0.05) % 360;
        ctx.save();
        ctx.strokeStyle = `hsla(${hue}, 100%, 70%, ${glowIntensity})`;
        ctx.lineWidth = 4 + Math.sin(Date.now() * 0.003) * 2;
        ctx.shadowColor = `hsla(${hue}, 100%, 70%, 0.6)`;
        ctx.shadowBlur = 20 + glowIntensity * 30;
        ctx.strokeRect(2, 2, W - 4, H - 4);
        ctx.restore();
    }
}

export function drawStatic() {
    const theme = getCurrentTheme(state.level);
    ctx.clearRect(0, 0, W, H);
    drawBackground(theme);
    if (state.bricks.length > 0) drawBricks();
    drawShield();
    drawPaddle(theme);
    drawBalls(theme);
}

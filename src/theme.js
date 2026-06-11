// theme.js — 20 Temas Visuais do Jogo (dobrado de 10 para 20)

export const THEMES = [
    // ─── TEMA 1: CYBERPUNK NEON ───
    {
        name: "CYBERPUNK NEON",
        bg: "#0a0a12",
        surface: "#12121f",
        accent: "#ff3c6f",
        accent2: "#00e5ff",
        accent3: "#ffe156",
        glowPink: "rgba(255, 60, 111, 0.4)",
        glowCyan: "rgba(0, 229, 255, 0.3)",
        paddleColor1: "#00e5ff",
        paddleColor2: "#a78bfa",
        paddleGlow: "rgba(0, 229, 255, 0.5)",
        ballColor: "#ff3c6f",
        ballTrailRGBA: "255, 60, 111",
        brickColors: [
            { fill: '#ff3c6f', glow: 'rgba(255,60,111,0.5)' },
            { fill: '#ff7849', glow: 'rgba(255,120,73,0.5)' },
            { fill: '#ffe156', glow: 'rgba(255,225,86,0.5)' },
            { fill: '#44ff88', glow: 'rgba(68,255,136,0.5)' },
            { fill: '#00e5ff', glow: 'rgba(0,229,255,0.5)' },
            { fill: '#a78bfa', glow: 'rgba(167,139,250,0.5)' }
        ]
    },
    // ─── TEMA 2: RETRO SYNTHWAVE ───
    {
        name: "RETRO SYNTHWAVE",
        bg: "#120520",
        surface: "#1f0c35",
        accent: "#ff007f",
        accent2: "#ff7700",
        accent3: "#ff00ff",
        glowPink: "rgba(255, 0, 127, 0.4)",
        glowCyan: "rgba(255, 119, 0, 0.3)",
        paddleColor1: "#ff007f",
        paddleColor2: "#ff7700",
        paddleGlow: "rgba(255, 0, 127, 0.5)",
        ballColor: "#ff00ff",
        ballTrailRGBA: "255, 0, 255",
        brickColors: [
            { fill: '#ff007f', glow: 'rgba(255,0,127,0.5)' },
            { fill: '#ff5500', glow: 'rgba(255,85,0,0.5)' },
            { fill: '#ffaa00', glow: 'rgba(255,170,0,0.5)' },
            { fill: '#e600ff', glow: 'rgba(230,0,255,0.5)' },
            { fill: '#9d00ff', glow: 'rgba(157,0,255,0.5)' }
        ]
    },
    // ─── TEMA 3: DEEP OCEAN ───
    {
        name: "DEEP OCEAN",
        bg: "#020f18",
        surface: "#052033",
        accent: "#00f5d4",
        accent2: "#00bbf9",
        accent3: "#9b5de5",
        glowPink: "rgba(0, 245, 212, 0.4)",
        glowCyan: "rgba(0, 187, 249, 0.3)",
        paddleColor1: "#00bbf9",
        paddleColor2: "#00f5d4",
        paddleGlow: "rgba(0, 187, 249, 0.5)",
        ballColor: "#00f5d4",
        ballTrailRGBA: "0, 245, 212",
        brickColors: [
            { fill: '#00f5d4', glow: 'rgba(0,245,212,0.5)' },
            { fill: '#00bbf9', glow: 'rgba(0,187,249,0.5)' },
            { fill: '#0077b6', glow: 'rgba(0,119,182,0.5)' },
            { fill: '#0096c7', glow: 'rgba(0,150,199,0.5)' },
            { fill: '#9b5de5', glow: 'rgba(155,93,229,0.5)' }
        ]
    },
    // ─── TEMA 4: MATRIX CODE ───
    {
        name: "MATRIX CODE",
        bg: "#020804",
        surface: "#051609",
        accent: "#39ff14",
        accent2: "#00ff66",
        accent3: "#adff2f",
        glowPink: "rgba(57, 255, 20, 0.4)",
        glowCyan: "rgba(0, 255, 102, 0.3)",
        paddleColor1: "#00ff66",
        paddleColor2: "#39ff14",
        paddleGlow: "rgba(0, 255, 102, 0.5)",
        ballColor: "#39ff14",
        ballTrailRGBA: "57, 255, 20",
        brickColors: [
            { fill: '#39ff14', glow: 'rgba(57,255,20,0.5)' },
            { fill: '#00ff66', glow: 'rgba(0,255,102,0.5)' },
            { fill: '#00cc44', glow: 'rgba(0,204,68,0.5)' },
            { fill: '#adff2f', glow: 'rgba(173,255,47,0.5)' },
            { fill: '#7fff00', glow: 'rgba(127,255,0,0.5)' }
        ]
    },
    // ─── TEMA 5: VOLCANIC LAVA ───
    {
        name: "VOLCANIC LAVA",
        bg: "#0c0202",
        surface: "#1c0606",
        accent: "#ff3300",
        accent2: "#ffaa00",
        accent3: "#ff0055",
        glowPink: "rgba(255, 51, 0, 0.4)",
        glowCyan: "rgba(255, 170, 0, 0.3)",
        paddleColor1: "#ff3300",
        paddleColor2: "#ffaa00",
        paddleGlow: "rgba(255, 51, 0, 0.5)",
        ballColor: "#ffaa00",
        ballTrailRGBA: "255, 170, 0",
        brickColors: [
            { fill: '#ff3300', glow: 'rgba(255,51,0,0.5)' },
            { fill: '#ff6600', glow: 'rgba(255,102,0,0.5)' },
            { fill: '#ffaa00', glow: 'rgba(255,170,0,0.5)' },
            { fill: '#ff0055', glow: 'rgba(255,0,85,0.5)' },
            { fill: '#990000', glow: 'rgba(153,0,0,0.5)' }
        ]
    },
    // ─── TEMA 6: COSMIC NEBULA ───
    {
        name: "COSMIC NEBULA",
        bg: "#050515",
        surface: "#0d0d2a",
        accent: "#bd00ff",
        accent2: "#00e5ff",
        accent3: "#ff00aa",
        glowPink: "rgba(189, 0, 255, 0.4)",
        glowCyan: "rgba(0, 229, 255, 0.3)",
        paddleColor1: "#bd00ff",
        paddleColor2: "#00e5ff",
        paddleGlow: "rgba(189, 0, 255, 0.5)",
        ballColor: "#bd00ff",
        ballTrailRGBA: "189, 0, 255",
        brickColors: [
            { fill: '#bd00ff', glow: 'rgba(189,0,255,0.5)' },
            { fill: '#00e5ff', glow: 'rgba(0,229,255,0.5)' },
            { fill: '#ff00aa', glow: 'rgba(255,0,170,0.5)' },
            { fill: '#7b2cbf', glow: 'rgba(123,44,191,0.5)' },
            { fill: '#3a0ca3', glow: 'rgba(58,12,163,0.5)' }
        ]
    },
    // ─── TEMA 7: GLACIAL BLIZZARD ───
    {
        name: "GLACIAL BLIZZARD",
        bg: "#060b14",
        surface: "#101b2d",
        accent: "#e0f7fa",
        accent2: "#80deea",
        accent3: "#00b0ff",
        glowPink: "rgba(224, 247, 250, 0.4)",
        glowCyan: "rgba(128, 222, 234, 0.3)",
        paddleColor1: "#80deea",
        paddleColor2: "#e0f7fa",
        paddleGlow: "rgba(128, 222, 234, 0.5)",
        ballColor: "#80deea",
        ballTrailRGBA: "128, 222, 234",
        brickColors: [
            { fill: '#80deea', glow: 'rgba(128,222,234,0.5)' },
            { fill: '#00e5ff', glow: 'rgba(0,229,255,0.5)' },
            { fill: '#e0f7fa', glow: 'rgba(224,247,250,0.5)' },
            { fill: '#00b0ff', glow: 'rgba(0,176,255,0.5)' },
            { fill: '#90caf9', glow: 'rgba(144,202,249,0.5)' }
        ]
    },
    // ─── TEMA 8: CYBER ACID ───
    {
        name: "CYBER ACID",
        bg: "#0a0e02",
        surface: "#161e05",
        accent: "#ccff00",
        accent2: "#00ffcc",
        accent3: "#ff9900",
        glowPink: "rgba(204, 255, 0, 0.4)",
        glowCyan: "rgba(0, 255, 204, 0.3)",
        paddleColor1: "#ccff00",
        paddleColor2: "#00ffcc",
        paddleGlow: "rgba(204, 255, 0, 0.5)",
        ballColor: "#ccff00",
        ballTrailRGBA: "204, 255, 0",
        brickColors: [
            { fill: '#ccff00', glow: 'rgba(204,255,0,0.5)' },
            { fill: '#00ffcc', glow: 'rgba(0,255,204,0.5)' },
            { fill: '#ff9900', glow: 'rgba(255,153,0,0.5)' },
            { fill: '#76ff03', glow: 'rgba(118,255,3,0.5)' },
            { fill: '#64dd17', glow: 'rgba(100,221,23,0.5)' }
        ]
    },
    // ─── TEMA 9: SUNSET GLOW ───
    {
        name: "SUNSET GLOW",
        bg: "#100410",
        surface: "#1f091f",
        accent: "#ff9e00",
        accent2: "#ff5400",
        accent3: "#7209b7",
        glowPink: "rgba(255, 158, 0, 0.4)",
        glowCyan: "rgba(255, 84, 0, 0.3)",
        paddleColor1: "#ff9e00",
        paddleColor2: "#ff5400",
        paddleGlow: "rgba(255, 158, 0, 0.5)",
        ballColor: "#ff9e00",
        ballTrailRGBA: "255, 158, 0",
        brickColors: [
            { fill: '#ff9e00', glow: 'rgba(255,158,0,0.5)' },
            { fill: '#ff5400', glow: 'rgba(255,84,0,0.5)' },
            { fill: '#ff0054', glow: 'rgba(255,0,84,0.5)' },
            { fill: '#9e0059', glow: 'rgba(158,0,89,0.5)' },
            { fill: '#7209b7', glow: 'rgba(114,9,183,0.5)' }
        ]
    },
    // ─── TEMA 10: ROYAL AMBER ───
    {
        name: "ROYAL AMBER",
        bg: "#0a0301",
        surface: "#1c0b02",
        accent: "#ffd700",
        accent2: "#d4af37",
        accent3: "#9b111e",
        glowPink: "rgba(255, 215, 0, 0.4)",
        glowCyan: "rgba(212, 175, 55, 0.3)",
        paddleColor1: "#ffd700",
        paddleColor2: "#9b111e",
        paddleGlow: "rgba(255, 215, 0, 0.5)",
        ballColor: "#ffd700",
        ballTrailRGBA: "255, 215, 0",
        brickColors: [
            { fill: '#ffd700', glow: 'rgba(255,215,0,0.5)' },
            { fill: '#d4af37', glow: 'rgba(212,175,55,0.5)' },
            { fill: '#9b111e', glow: 'rgba(155,17,30,0.5)' },
            { fill: '#ff8c00', glow: 'rgba(255,140,0,0.5)' },
            { fill: '#b8860b', glow: 'rgba(184,134,11,0.5)' }
        ]
    },

    // ═══════════════════════════════════════════
    // ── NOVOS TEMAS (11-20) ──────────────────
    // ═══════════════════════════════════════════

    // ─── TEMA 11: AURORA BOREALIS ───
    {
        name: "AURORA BOREALIS",
        bg: "#010c0f",
        surface: "#031820",
        accent: "#00ffab",
        accent2: "#ff80ff",
        accent3: "#00e5ff",
        glowPink: "rgba(0, 255, 171, 0.4)",
        glowCyan: "rgba(255, 128, 255, 0.3)",
        paddleColor1: "#00ffab",
        paddleColor2: "#ff80ff",
        paddleGlow: "rgba(0, 255, 171, 0.5)",
        ballColor: "#00ffab",
        ballTrailRGBA: "0, 255, 171",
        brickColors: [
            { fill: '#00ffab', glow: 'rgba(0,255,171,0.5)' },
            { fill: '#ff80ff', glow: 'rgba(255,128,255,0.5)' },
            { fill: '#00e5ff', glow: 'rgba(0,229,255,0.5)' },
            { fill: '#40ffcc', glow: 'rgba(64,255,204,0.5)' },
            { fill: '#bf5fff', glow: 'rgba(191,95,255,0.5)' },
            { fill: '#00ff88', glow: 'rgba(0,255,136,0.5)' }
        ]
    },
    // ─── TEMA 12: TOXIC WASTE ───
    {
        name: "TOXIC WASTE",
        bg: "#050a00",
        surface: "#0d1800",
        accent: "#aaff00",
        accent2: "#ffee00",
        accent3: "#00ff44",
        glowPink: "rgba(170, 255, 0, 0.45)",
        glowCyan: "rgba(255, 238, 0, 0.3)",
        paddleColor1: "#aaff00",
        paddleColor2: "#ffee00",
        paddleGlow: "rgba(170, 255, 0, 0.5)",
        ballColor: "#aaff00",
        ballTrailRGBA: "170, 255, 0",
        brickColors: [
            { fill: '#aaff00', glow: 'rgba(170,255,0,0.5)' },
            { fill: '#ffee00', glow: 'rgba(255,238,0,0.5)' },
            { fill: '#00ff44', glow: 'rgba(0,255,68,0.5)' },
            { fill: '#80ff00', glow: 'rgba(128,255,0,0.5)' },
            { fill: '#ffcc00', glow: 'rgba(255,204,0,0.5)' },
            { fill: '#33ff66', glow: 'rgba(51,255,102,0.5)' }
        ]
    },
    // ─── TEMA 13: BLOOD MOON ───
    {
        name: "BLOOD MOON",
        bg: "#0c0000",
        surface: "#1a0000",
        accent: "#ff1a00",
        accent2: "#ff6600",
        accent3: "#cc0044",
        glowPink: "rgba(255, 26, 0, 0.45)",
        glowCyan: "rgba(255, 102, 0, 0.3)",
        paddleColor1: "#ff1a00",
        paddleColor2: "#ff6600",
        paddleGlow: "rgba(255, 26, 0, 0.5)",
        ballColor: "#ff3300",
        ballTrailRGBA: "255, 51, 0",
        brickColors: [
            { fill: '#ff1a00', glow: 'rgba(255,26,0,0.5)' },
            { fill: '#ff6600', glow: 'rgba(255,102,0,0.5)' },
            { fill: '#cc0044', glow: 'rgba(204,0,68,0.5)' },
            { fill: '#ff0022', glow: 'rgba(255,0,34,0.5)' },
            { fill: '#880000', glow: 'rgba(136,0,0,0.5)' },
            { fill: '#ff4400', glow: 'rgba(255,68,0,0.5)' }
        ]
    },
    // ─── TEMA 14: NEON TOKYO ───
    {
        name: "NEON TOKYO",
        bg: "#07000d",
        surface: "#120020",
        accent: "#ff00cc",
        accent2: "#aa00ff",
        accent3: "#ff44aa",
        glowPink: "rgba(255, 0, 204, 0.4)",
        glowCyan: "rgba(170, 0, 255, 0.3)",
        paddleColor1: "#ff00cc",
        paddleColor2: "#aa00ff",
        paddleGlow: "rgba(255, 0, 204, 0.5)",
        ballColor: "#ff00cc",
        ballTrailRGBA: "255, 0, 204",
        brickColors: [
            { fill: '#ff00cc', glow: 'rgba(255,0,204,0.5)' },
            { fill: '#aa00ff', glow: 'rgba(170,0,255,0.5)' },
            { fill: '#ff44aa', glow: 'rgba(255,68,170,0.5)' },
            { fill: '#cc00ff', glow: 'rgba(204,0,255,0.5)' },
            { fill: '#ff0088', glow: 'rgba(255,0,136,0.5)' },
            { fill: '#7700ee', glow: 'rgba(119,0,238,0.5)' }
        ]
    },
    // ─── TEMA 15: DEEP SPACE ───
    {
        name: "DEEP SPACE",
        bg: "#000005",
        surface: "#05050f",
        accent: "#4488ff",
        accent2: "#aaccff",
        accent3: "#ffffff",
        glowPink: "rgba(68, 136, 255, 0.4)",
        glowCyan: "rgba(170, 204, 255, 0.3)",
        paddleColor1: "#4488ff",
        paddleColor2: "#aaccff",
        paddleGlow: "rgba(68, 136, 255, 0.5)",
        ballColor: "#aaccff",
        ballTrailRGBA: "170, 204, 255",
        brickColors: [
            { fill: '#4488ff', glow: 'rgba(68,136,255,0.5)' },
            { fill: '#aaccff', glow: 'rgba(170,204,255,0.5)' },
            { fill: '#ffffff', glow: 'rgba(255,255,255,0.4)' },
            { fill: '#6699ff', glow: 'rgba(102,153,255,0.5)' },
            { fill: '#2255cc', glow: 'rgba(34,85,204,0.5)' },
            { fill: '#88bbff', glow: 'rgba(136,187,255,0.5)' }
        ]
    },
    // ─── TEMA 16: GOLDEN HOUR ───
    {
        name: "GOLDEN HOUR",
        bg: "#080400",
        surface: "#150b00",
        accent: "#ffcc00",
        accent2: "#ff8800",
        accent3: "#ffee88",
        glowPink: "rgba(255, 204, 0, 0.45)",
        glowCyan: "rgba(255, 136, 0, 0.3)",
        paddleColor1: "#ffcc00",
        paddleColor2: "#ff8800",
        paddleGlow: "rgba(255, 204, 0, 0.5)",
        ballColor: "#ffcc00",
        ballTrailRGBA: "255, 204, 0",
        brickColors: [
            { fill: '#ffcc00', glow: 'rgba(255,204,0,0.5)' },
            { fill: '#ff8800', glow: 'rgba(255,136,0,0.5)' },
            { fill: '#ffee88', glow: 'rgba(255,238,136,0.5)' },
            { fill: '#ffaa00', glow: 'rgba(255,170,0,0.5)' },
            { fill: '#dd6600', glow: 'rgba(221,102,0,0.5)' },
            { fill: '#ffdd44', glow: 'rgba(255,221,68,0.5)' }
        ]
    },
    // ─── TEMA 17: ELECTRIC STORM ───
    {
        name: "ELECTRIC STORM",
        bg: "#02020a",
        surface: "#080820",
        accent: "#ffffff",
        accent2: "#88aaff",
        accent3: "#ffff00",
        glowPink: "rgba(255, 255, 255, 0.5)",
        glowCyan: "rgba(136, 170, 255, 0.35)",
        paddleColor1: "#ffffff",
        paddleColor2: "#88aaff",
        paddleGlow: "rgba(255, 255, 255, 0.6)",
        ballColor: "#ffff88",
        ballTrailRGBA: "255, 255, 136",
        brickColors: [
            { fill: '#ffffff', glow: 'rgba(255,255,255,0.5)' },
            { fill: '#88aaff', glow: 'rgba(136,170,255,0.5)' },
            { fill: '#ffff00', glow: 'rgba(255,255,0,0.5)' },
            { fill: '#aabbff', glow: 'rgba(170,187,255,0.5)' },
            { fill: '#ccddff', glow: 'rgba(204,221,255,0.4)' },
            { fill: '#ffff88', glow: 'rgba(255,255,136,0.5)' }
        ]
    },
    // ─── TEMA 18: CANDY CRUSH ───
    {
        name: "CANDY CRUSH",
        bg: "#0a0008",
        surface: "#1a0014",
        accent: "#ff88cc",
        accent2: "#cc44ff",
        accent3: "#ffaaee",
        glowPink: "rgba(255, 136, 204, 0.4)",
        glowCyan: "rgba(204, 68, 255, 0.3)",
        paddleColor1: "#ff88cc",
        paddleColor2: "#cc44ff",
        paddleGlow: "rgba(255, 136, 204, 0.5)",
        ballColor: "#ff88cc",
        ballTrailRGBA: "255, 136, 204",
        brickColors: [
            { fill: '#ff88cc', glow: 'rgba(255,136,204,0.5)' },
            { fill: '#cc44ff', glow: 'rgba(204,68,255,0.5)' },
            { fill: '#ffaaee', glow: 'rgba(255,170,238,0.5)' },
            { fill: '#ff55bb', glow: 'rgba(255,85,187,0.5)' },
            { fill: '#aa22ee', glow: 'rgba(170,34,238,0.5)' },
            { fill: '#ff99dd', glow: 'rgba(255,153,221,0.5)' }
        ]
    },
    // ─── TEMA 19: JUNGLE FIRE ───
    {
        name: "JUNGLE FIRE",
        bg: "#010801",
        surface: "#031403",
        accent: "#44ff00",
        accent2: "#ff6600",
        accent3: "#ffff00",
        glowPink: "rgba(68, 255, 0, 0.4)",
        glowCyan: "rgba(255, 102, 0, 0.35)",
        paddleColor1: "#44ff00",
        paddleColor2: "#ff6600",
        paddleGlow: "rgba(68, 255, 0, 0.5)",
        ballColor: "#ff6600",
        ballTrailRGBA: "255, 102, 0",
        brickColors: [
            { fill: '#44ff00', glow: 'rgba(68,255,0,0.5)' },
            { fill: '#ff6600', glow: 'rgba(255,102,0,0.5)' },
            { fill: '#ffff00', glow: 'rgba(255,255,0,0.5)' },
            { fill: '#22cc00', glow: 'rgba(34,204,0,0.5)' },
            { fill: '#ff4400', glow: 'rgba(255,68,0,0.5)' },
            { fill: '#88ff00', glow: 'rgba(136,255,0,0.5)' }
        ]
    },
    // ─── TEMA 20: MIDNIGHT CHROME ───
    {
        name: "MIDNIGHT CHROME",
        bg: "#030308",
        surface: "#0a0a18",
        accent: "#c0c0ff",
        accent2: "#8888cc",
        accent3: "#e0e0ff",
        glowPink: "rgba(192, 192, 255, 0.4)",
        glowCyan: "rgba(136, 136, 204, 0.3)",
        paddleColor1: "#c0c0ff",
        paddleColor2: "#8888cc",
        paddleGlow: "rgba(192, 192, 255, 0.5)",
        ballColor: "#e0e0ff",
        ballTrailRGBA: "224, 224, 255",
        brickColors: [
            { fill: '#c0c0ff', glow: 'rgba(192,192,255,0.5)' },
            { fill: '#8888cc', glow: 'rgba(136,136,204,0.5)' },
            { fill: '#e0e0ff', glow: 'rgba(224,224,255,0.5)' },
            { fill: '#a0a0ee', glow: 'rgba(160,160,238,0.5)' },
            { fill: '#6666aa', glow: 'rgba(102,102,170,0.5)' },
            { fill: '#ddddff', glow: 'rgba(221,221,255,0.4)' }
        ]
    },
];

export function getCurrentTheme(level) {
    // Muda de tema a cada 50 níveis (20 temas × 50 = 1000 níveis perfeitos)
    const index = Math.floor((level - 1) / 50) % THEMES.length;
    return THEMES[index];
}

export function applyTheme(level) {
    const theme = getCurrentTheme(level);
    const root = document.documentElement;
    root.style.setProperty('--bg', theme.bg);
    root.style.setProperty('--surface', theme.surface);
    root.style.setProperty('--accent', theme.accent);
    root.style.setProperty('--accent2', theme.accent2);
    root.style.setProperty('--accent3', theme.accent3);
    root.style.setProperty('--glow-pink', theme.glowPink);
    root.style.setProperty('--glow-cyan', theme.glowCyan);
    return theme;
}

// Transição suave de tema com animação
export function transitionTheme(level, duration = 1000) {
    const theme = getCurrentTheme(level);
    const root = document.documentElement;
    
    // Criar overlay de transição
    const overlay = document.createElement('div');
    overlay.style.position = 'fixed';
    overlay.style.inset = '0';
    overlay.style.background = `radial-gradient(ellipse at center, ${theme.accent}22 0%, ${theme.bg} 70%)`;
    overlay.style.opacity = '0';
    overlay.style.pointerEvents = 'none';
    overlay.style.zIndex = '100';
    overlay.style.transition = `opacity ${duration}ms ease`;
    document.body.appendChild(overlay);
    
    // Flash inicial
    requestAnimationFrame(() => {
        overlay.style.opacity = '1';
        setTimeout(() => {
            overlay.style.opacity = '0';
            setTimeout(() => overlay.remove(), duration);
        }, duration * 0.3);
    });
    
    // Aplicar tema
    applyTheme(level);
    
    return theme;
}

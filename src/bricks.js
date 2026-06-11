// bricks.js — Sistema de 1000+ padrões únicos + HP progressivo + blocos especiais
// 50 padrões × modificadores × parâmetros = milhares de combinações

import { state, BRICK_COLS, BRICK_W, BRICK_H, BRICK_PAD, BRICK_OFFSET_X, BRICK_OFFSET_Y } from './state.js';
import { getCurrentTheme } from './theme.js';

// ─────────────────────────────────────────────────────────────────────────────
// RNG DETERMINÍSTICA POR NÍVEL
// ─────────────────────────────────────────────────────────────────────────────
function makeRng(seed) {
    let s = seed >>> 0;
    return function () {
        s = (s ^ (s << 13)) >>> 0;
        s = (s ^ (s >> 7)) >>> 0;
        s = (s ^ (s << 17)) >>> 0;
        return (s >>> 0) / 4294967296;
    };
}

// ─────────────────────────────────────────────────────────────────────────────
// HELPERS GEOMÉTRICOS
// ─────────────────────────────────────────────────────────────────────────────
function distFromCenter(r, c, rows, cols) {
    const cx = (cols - 1) / 2;
    const cy = (rows - 1) / 2;
    return Math.sqrt((c - cx) ** 2 + (r - cy) ** 2);
}

function manhattanDist(r, c, rows, cols) {
    const cx = (cols - 1) / 2;
    const cy = (rows - 1) / 2;
    return Math.abs(c - cx) + Math.abs(r - cy);
}

// ─────────────────────────────────────────────────────────────────────────────
// 50 PADRÕES BASE — retornam 1 (bloco presente) ou 0 (vazio)
// ─────────────────────────────────────────────────────────────────────────────
const BASE_PATTERNS = [
    // 0: full
    () => 1,

    // 1: checkerboard
    (r, c) => (r + c) % 2 === 0 ? 1 : 0,

    // 2: diamond euclidiano
    (r, c, rows, cols, p) => {
        const maxDist = distFromCenter(0, 0, rows, cols);
        return distFromCenter(r, c, rows, cols) < maxDist * (p.thresh || 0.65) ? 1 : 0;
    },

    // 3: diamond manhattan
    (r, c, rows, cols, p) => {
        const lim = Math.min(rows, cols) * (p.thresh || 0.48);
        return manhattanDist(r, c, rows, cols) < lim ? 1 : 0;
    },

    // 4: pirâmide (topo estreito, base larga)
    (r, c, rows, cols) => {
        const half = Math.floor((cols - r * (cols / rows)) / 2);
        return c >= half && c < cols - half ? 1 : 0;
    },

    // 5: pirâmide invertida
    (r, c, rows, cols) => {
        const inv = rows - 1 - r;
        const half = Math.floor((cols - inv * (cols / rows)) / 2);
        return c >= half && c < cols - half ? 1 : 0;
    },

    // 6: stripes horizontais — step variável
    (r, c, rows, cols, p) => r % (p.step || 2) === 0 ? 1 : 0,

    // 7: stripes verticais — step variável
    (r, c, rows, cols, p) => c % (p.step || 2) === 0 ? 1 : 0,

    // 8: stripes diagonais
    (r, c, rows, cols, p) => (r + c) % (p.step || 3) === 0 ? 1 : 0,

    // 9: borda simples
    (r, c, rows, cols) =>
        (r === 0 || r === rows - 1 || c === 0 || c === cols - 1) ? 1 : 0,

    // 10: borda dupla + interior cheio
    (r, c, rows, cols) => {
        const outer = r === 0 || r === rows - 1 || c === 0 || c === cols - 1;
        const inner = r === 2 || r === rows - 3 || c === 2 || c === cols - 3;
        const fill = r > 2 && r < rows - 3 && c > 2 && c < cols - 3 && (r + c) % 2 === 0;
        return (outer || inner || fill) ? 1 : 0;
    },

    // 11: borda tripla com relleno
    (r, c, rows, cols) => {
        const b1 = r === 0 || r === rows - 1 || c === 0 || c === cols - 1;
        const b2 = r === 2 || r === rows - 3 || c === 2 || c === cols - 3;
        const b3 = r === 4 || r === rows - 5 || c === 4 || c === cols - 5;
        return (b1 || b2 || b3) ? 1 : 0;
    },

    // 12: zigzag horizontal denso
    (r, c, rows, cols, p) => {
        const step = p.step || 3;
        const shift = (r % 2) * Math.floor(step / 2);
        return (c + shift) % step < Math.ceil(step * 0.7) ? 1 : 0;
    },

    // 13: zigzag vertical denso
    (r, c, rows, cols, p) => {
        const step = p.step || 3;
        const shift = (c % 2) * Math.floor(step / 2);
        return (r + shift) % step < Math.ceil(step * 0.7) ? 1 : 0;
    },

    // 14: ampulheta (mais blocos no topo e fundo)
    (r, c, rows, cols) => {
        const mid = cols / 2;
        const t = Math.abs(r / (rows - 1) - 0.5) * 2;
        const width = 0.3 + t * 0.7;
        const start = Math.floor(mid - width * mid);
        const end = Math.ceil(mid + width * mid);
        return c >= start && c < end ? 1 : 0;
    },

    // 15: castelo medieval
    (r, c, rows, cols) => {
        if (r === 0) return c % 2 === 0 ? 1 : 0; // Ameias
        const isWall = c === 0 || c === cols - 1 || c === Math.floor(cols / 2) || c === Math.ceil(cols / 2);
        const isFill = r % 2 === 0 && c % 3 === 1;
        return (isWall || isFill) ? 1 : 0;
    },

    // 16: castelo avançado
    (r, c, rows, cols) => {
        const wallCols = [0, 2, Math.floor(cols / 2) - 1, Math.floor(cols / 2), cols - 3, cols - 1];
        if (wallCols.includes(c)) return 1;
        if (r === 0 || r === rows - 1) return 1;
        return (r % 3 === 1 && c % 2 === 0) ? 1 : 0;
    },

    // 17: setas para cima (preenchidas)
    (r, c, rows, cols) => {
        const mid = Math.floor(cols / 2);
        const threshold = Math.floor(r / 2);
        return Math.abs(c - mid) <= threshold ? 1 : 0;
    },

    // 18: setas para baixo (preenchidas)
    (r, c, rows, cols) => {
        const mid = Math.floor(cols / 2);
        const inv = rows - 1 - r;
        return Math.abs(c - mid) <= Math.floor(inv / 2) ? 1 : 0;
    },

    // 19: cruz larga
    (r, c, rows, cols) => {
        const midR = Math.floor(rows / 2), midC = Math.floor(cols / 2);
        return (Math.abs(r - midR) <= 1 || Math.abs(c - midC) <= 1) ? 1 : 0;
    },

    // 20: X largo
    (r, c, rows, cols) => {
        const d1 = Math.abs(r - c * rows / cols);
        const d2 = Math.abs(r - (rows - 1 - c * rows / cols));
        return (d1 < 1.5 || d2 < 1.5) ? 1 : 0;
    },

    // 21: ondas horizontais densas
    (r, c, rows, cols, p) => {
        const freq = p.freq || 0.8;
        return Math.sin(c * freq + r * 1.5) > -0.3 ? 1 : 0;
    },

    // 22: ondas verticais densas
    (r, c, rows, cols, p) => {
        const freq = p.freq || 0.8;
        return Math.sin(r * freq + c * 0.6) > -0.3 ? 1 : 0;
    },

    // 23: ondas diagonais densas
    (r, c, rows, cols, p) => {
        const freq = p.freq || 0.7;
        return Math.sin((r + c) * freq) > -0.2 ? 1 : 0;
    },

    // 24: escadas L→R
    (r, c, rows, cols) => c >= (rows - 1 - r) ? 1 : 0,

    // 25: escadas R→L
    (r, c, rows, cols) => c <= r ? 1 : 0,

    // 26: anéis concêntricos
    (r, c, rows, cols) => {
        const d = distFromCenter(r, c, rows, cols);
        return (Math.floor(d / 1.8) % 2 === 0) ? 1 : 0;
    },

    // 27: espiral quadrada
    (r, c, rows, cols) => {
        const cx = (cols - 1) / 2, cy = (rows - 1) / 2;
        const ring = Math.max(Math.abs(c - cx), Math.abs(r - cy));
        return Math.floor(ring) % 2 === 0 ? 1 : 0;
    },

    // 28: alvo (bulls-eye)
    (r, c, rows, cols) => {
        const maxD = distFromCenter(0, 0, rows, cols);
        const ring = Math.floor(distFromCenter(r, c, rows, cols) / maxD * 5);
        return ring % 2 === 0 ? 1 : 0;
    },

    // 29: favo de mel
    (r, c, rows, cols) => {
        const col2 = c * 2 + (r % 2);
        return col2 % 3 !== 2 ? 1 : 0;
    },

    // 30: grade com espaços (step variável)
    (r, c, rows, cols, p) => {
        const step = p.step || 3;
        return r % step !== step - 1 && c % step !== step - 1 ? 1 : 0;
    },

    // 31: colunas alternadas grossas
    (r, c, rows, cols, p) => {
        const width = p.step || 2;
        return Math.floor(c / width) % 2 === 0 ? 1 : 0;
    },

    // 32: linhas alternadas grossas
    (r, c, rows, cols, p) => {
        const height = p.step || 2;
        return Math.floor(r / height) % 2 === 0 ? 1 : 0;
    },

    // 33: forma V (preenchida)
    (r, c, rows, cols) => {
        const mid = Math.floor(cols / 2);
        return c >= mid - r && c <= mid + r ? 1 : 0;
    },

    // 34: coração pixelado
    (r, c, rows, cols) => {
        const x = (c / (cols - 1)) * 2 - 1;
        const y = (r / (rows - 1)) * 2 - 1;
        const heart = (x * x + (y - 0.3) * (y - 0.3) - 0.85) ** 3 - x * x * (y - 0.3) ** 3;
        return heart < 0 ? 1 : 0;
    },

    // 35: estrela de 6 pontas
    (r, c, rows, cols) => {
        const x = (c / (cols - 1)) * 2 - 1;
        const y = (r / (rows - 1)) * 2 - 1;
        const d = Math.sqrt(x * x + y * y);
        const angle = Math.atan2(y, x);
        const star = d < 0.6 + 0.25 * Math.cos(6 * angle);
        return star ? 1 : 0;
    },

    // 36: funil
    (r, c, rows, cols) => {
        const mid = cols / 2;
        const ratio = 1 - (r / (rows - 1)) * 0.7;
        const hw = mid * ratio;
        return c >= mid - hw && c <= mid + hw ? 1 : 0;
    },

    // 37: gravata borboleta
    (r, c, rows, cols) => {
        const mid = cols / 2;
        const midR = rows / 2;
        const hw = Math.abs(r - midR) / midR * mid;
        return c >= mid - hw && c <= mid + hw ? 1 : 0;
    },

    // 38: moldura + interior xadrez
    (r, c, rows, cols) => {
        const onBorder = r === 0 || r === rows - 1 || c === 0 || c === cols - 1;
        const innerCheck = r > 0 && r < rows - 1 && c > 0 && c < cols - 1 && (r + c) % 2 === 0;
        return (onBorder || innerCheck) ? 1 : 0;
    },

    // 39: cantos + cruz central
    (r, c, rows, cols) => {
        const inCorner = (r < 3 || r >= rows - 3) && (c < 3 || c >= cols - 3);
        const midR = Math.floor(rows / 2), midC = Math.floor(cols / 2);
        const inCross = Math.abs(r - midR) <= 1 || Math.abs(c - midC) <= 1;
        return (inCorner || inCross) ? 1 : 0;
    },

    // 40: túnel (retângulos concêntricos)
    (r, c, rows, cols) => {
        const ringH = Math.min(r, rows - 1 - r);
        const ringV = Math.min(c, cols - 1 - c);
        const ring = Math.min(ringH, ringV);
        return ring % 2 === 0 ? 1 : 0;
    },

    // 41: faixa diagonal larga
    (r, c, rows, cols, p) => {
        const width = p.step || 3;
        return (r + c) % (width * 2) < width ? 1 : 0;
    },

    // 42: scatter com seed
    (r, c, rows, cols, p, rng) => rng() < (p.density || 0.65) ? 1 : 0,

    // 43: blocos 2×2 xadrez
    (r, c) => {
        const br = Math.floor(r / 2) % 2;
        const bc = Math.floor(c / 2) % 2;
        return br === bc ? 1 : 0;
    },

    // 44: duplo xadrez 3×3
    (r, c) => Math.floor(r / 3 + c / 3) % 2 === 0 ? 1 : 0,

    // 45: diamante duplo (anéis manhattan)
    (r, c, rows, cols) => {
        const d = manhattanDist(r, c, rows, cols);
        return d % 4 < 2 ? 1 : 0;
    },

    // 46: serpentina densa
    (r, c, rows, cols) => {
        if (r % 2 === 0) return c < cols ? 1 : 0;
        return c > 0 ? 1 : 0;
    },

    // 47: triângulo superior esquerdo
    (r, c, rows, cols) => c <= cols - 1 - (r * cols / rows) ? 1 : 0,

    // 48: diagonal dupla (cruz X preenchida)
    (r, c, rows, cols) => {
        const midR = Math.floor(rows / 2), midC = Math.floor(cols / 2);
        const isCross = Math.abs(r - midR) <= 1 || Math.abs(c - midC) <= 1;
        const d1 = Math.abs(r - c * rows / cols);
        const d2 = Math.abs(r - (rows - 1 - c * rows / cols));
        return (isCross || d1 < 1.5 || d2 < 1.5) ? 1 : 0;
    },

    // 49: damasco (losangos encadeados)
    (r, c, rows, cols, p) => {
        const freq = p.freq || 1.0;
        return (Math.abs(Math.sin(r * freq)) + Math.abs(Math.cos(c * freq))) > 1.0 ? 1 : 0;
    },
];

// ─────────────────────────────────────────────────────────────────────────────
// MODIFICADORES
// ─────────────────────────────────────────────────────────────────────────────
function applyModifier(grid, rows, cols, mod) {
    const newGrid = Array.from({ length: rows }, () => new Array(cols).fill(0));
    for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
            if (mod === 'mirror_h') {
                newGrid[r][c] = grid[r][cols - 1 - c];
            } else if (mod === 'mirror_v') {
                newGrid[r][c] = grid[rows - 1 - r][c];
            } else if (mod === 'rotate90') {
                const sr = Math.max(0, Math.min(rows - 1, (c * rows / cols) | 0));
                const sc = Math.max(0, Math.min(cols - 1, ((rows - 1 - r) * cols / rows) | 0));
                newGrid[r][c] = grid[sr][sc];
            } else if (mod === 'invert') {
                newGrid[r][c] = grid[r][c] ? 0 : 1;
            } else {
                newGrid[r][c] = grid[r][c];
            }
        }
    }
    return newGrid;
}

function combineGrids(g1, g2, rows, cols, mode) {
    const out = Array.from({ length: rows }, () => new Array(cols).fill(0));
    for (let r = 0; r < rows; r++)
        for (let c = 0; c < cols; c++) {
            if (mode === 'or')  out[r][c] = (g1[r][c] || g2[r][c]) ? 1 : 0;
            else if (mode === 'and') out[r][c] = (g1[r][c] && g2[r][c]) ? 1 : 0;
            else if (mode === 'xor') out[r][c] = (g1[r][c] ^ g2[r][c]);
        }
    return out;
}

// ─────────────────────────────────────────────────────────────────────────────
// CONFIGURAÇÃO POR NÍVEL
// ─────────────────────────────────────────────────────────────────────────────
function getLevelConfig(level) {
    const seed = (level * 1337 + level * level * 7 + 42) >>> 0;
    const rng = makeRng(seed);

    const patternIdx = (level - 1 + Math.floor(level / 50) * 3) % BASE_PATTERNS.length;

    const params = {
        thresh:  0.4 + rng() * 0.4,
        freq:    0.5 + rng() * 1.3,
        step:    2 + Math.floor(rng() * 3),
        density: 0.5 + rng() * 0.35,
    };

    // Modificadores — chance cresce gradualmente
    const mods = [];
    const modList = ['mirror_h', 'mirror_v', 'invert', 'rotate90'];
    const modChance = Math.min(0.12 + level * 0.0008, 0.6);
    for (const m of modList) {
        if (rng() < modChance) mods.push(m);
    }

    // Combinação com segundo padrão
    let secondPatternIdx = null;
    let combineMode = null;
    const combineChance = Math.min(level * 0.0012, 0.55);
    if (rng() < combineChance) {
        secondPatternIdx = Math.floor(rng() * BASE_PATTERNS.length);
        const modes = ['or', 'and', 'xor'];
        combineMode = modes[Math.floor(rng() * modes.length)];
    }

    return { patternIdx, secondPatternIdx, combineMode, mods, params, rng };
}

// ─────────────────────────────────────────────────────────────────────────────
// CONSTRUÇÃO DO GRID
// ─────────────────────────────────────────────────────────────────────────────
function buildGrid(level, rows, cols) {
    const cfg = getLevelConfig(level);
    const { patternIdx, secondPatternIdx, combineMode, mods, params, rng } = cfg;

    const patFn = BASE_PATTERNS[patternIdx];
    let grid = [];
    for (let r = 0; r < rows; r++) {
        grid[r] = [];
        for (let c = 0; c < cols; c++) {
            grid[r][c] = patFn(r, c, rows, cols, params, rng);
        }
    }

    for (const mod of mods) {
        grid = applyModifier(grid, rows, cols, mod);
    }

    if (secondPatternIdx !== null) {
        const pat2 = BASE_PATTERNS[secondPatternIdx];
        const rng2 = makeRng((level * 2333 + 77) >>> 0);
        const grid2 = [];
        for (let r = 0; r < rows; r++) {
            grid2[r] = [];
            for (let c = 0; c < cols; c++) {
                grid2[r][c] = pat2(r, c, rows, cols, params, rng2);
            }
        }
        grid = combineGrids(grid, grid2, rows, cols, combineMode);
    }

    return grid;
}

// ─────────────────────────────────────────────────────────────────────────────
// HP PROGRESSIVO — escala suavemente do nível 1 ao 1000
// ─────────────────────────────────────────────────────────────────────────────
function getBrickHp(level, row, rows, brickType, hpRng) {
    if (brickType === 'indestructible') return 999;

    // Níveis 1-5: todos os blocos normais/bonus/explosivos têm estritamente 1 HP, armored têm 2
    if (level <= 5) {
        return brickType === 'armored' ? 2 : 1;
    }

    // HP base: cresce de 1 (nível 6) até ~10 (nível 1000)
    let hpBase = 1;
    if (level > 900) hpBase = 10;
    else if (level > 730) hpBase = 9;
    else if (level > 630) hpBase = 8;
    else if (level > 530) hpBase = 7;
    else if (level > 430) hpBase = 6;
    else if (level > 330) hpBase = 5;
    else if (level > 230) hpBase = 4;
    else if (level > 130) hpBase = 3;
    else if (level > 30) hpBase = 2;

    // Bônus por linha (linhas mais altas = mais difíceis)
    // Apenas ativo após o nível 10
    let rowBonus = 0;
    if (level > 10) {
        const factor = Math.floor((level - 10) / 100);
        const maxRowBonus = Math.min(3, factor);
        if (maxRowBonus > 0) {
            rowBonus = Math.floor(((rows - row - 1) / rows) * maxRowBonus);
        }
    }

    // Variação aleatória pequena (±1)
    // Apenas ativa após o nível 15
    let variance = 0;
    if (level > 15) {
        variance = hpRng() < 0.25 ? 1 : 0;
    }

    let hp = hpBase + rowBonus + variance;

    // Blocos "armored" têm vida extra substancial
    if (brickType === 'armored') {
        const armoredExtra = level <= 15 ? 1 : (level <= 50 ? 2 : 3);
        hp += armoredExtra;
    }

    return Math.max(1, hp);
}

// ─────────────────────────────────────────────────────────────────────────────
// TIPO ESPECIAL DE BLOCO
// ─────────────────────────────────────────────────────────────────────────────
// Tipos: 'normal' | 'armored' | 'explosive' | 'bonus' | 'indestructible' | 'frozen' | 'mirror' | 'heal' | 'coin'
function getBrickType(level, row, rows, hpRng) {
    const r = hpRng();

    // Indestrutível: só acima do nível 100 nas primeiras linhas
    if (level >= 100 && row < 2) {
        const indestructChance = Math.min(0.01 + (level - 100) * 0.0002, 0.10);
        if (r < indestructChance) {
            return 'indestructible';
        }
    }

    // Explosivo: a partir do nível 2
    if (level >= 2) {
        const r2 = hpRng();
        const explosiveChance = Math.min(0.04 + (level - 2) * 0.0002, 0.15);
        if (r2 < explosiveChance) {
            return 'explosive';
        }
    }

    // Frozen: a partir do nível 10
    if (level >= 10) {
        const rFrozen = hpRng();
        const frozenChance = Math.min(0.03 + (level - 10) * 0.0001, 0.08);
        if (rFrozen < frozenChance) {
            return 'frozen';
        }
    }

    // Mirror: a partir do nível 15
    if (level >= 15) {
        const rMirror = hpRng();
        const mirrorChance = Math.min(0.03 + (level - 15) * 0.0001, 0.08);
        if (rMirror < mirrorChance) {
            return 'mirror';
        }
    }

    // Heal: a partir do nível 5
    if (level >= 5) {
        const rHeal = hpRng();
        const healChance = Math.min(0.02 + (level - 5) * 0.0001, 0.06);
        if (rHeal < healChance) {
            return 'heal';
        }
    }

    // Coin: a partir do nível 1
    if (level >= 1) {
        const rCoin = hpRng();
        const coinChance = Math.min(0.03 + level * 0.0001, 0.08);
        if (rCoin < coinChance) {
            return 'coin';
        }
    }

    // Bonus: a partir do nível 1 (chance maior de 8% para ver os poderes rápido!)
    const r3 = hpRng();
    const bonusChance = Math.min(0.08 + level * 0.0002, 0.15);
    if (r3 < bonusChance) {
        return 'bonus';
    }

    // Armored: a partir do nível 1
    const r4 = hpRng();
    const armoredChance = Math.min(0.10 + level * 0.0005, 0.35);
    if (r4 < armoredChance) {
        return 'armored';
    }

    return 'normal';
}

// ─────────────────────────────────────────────────────────────────────────────
// COR DO BLOCO — varia por linha E por coluna (mais diverso)
// ─────────────────────────────────────────────────────────────────────────────
function getBrickColor(theme, level, row, col, brickType) {
    const colorPool = theme.brickColors;

    if (brickType === 'indestructible') {
        return { fill: '#555566', glow: 'rgba(255,50,50,0.5)', accent: '#ff4444' };
    }
    if (brickType === 'explosive') {
        return { fill: '#ff4400', glow: 'rgba(255,68,0,0.7)', accent: '#ffaa00' };
    }
    if (brickType === 'bonus') {
        return { fill: '#ffd700', glow: 'rgba(255,215,0,0.7)', accent: '#ffffff' };
    }
    if (brickType === 'frozen') {
        return { fill: '#00e5ff', glow: 'rgba(0,229,255,0.6)', accent: '#80deea' };
    }
    if (brickType === 'mirror') {
        return { fill: '#c0c0c0', glow: 'rgba(255,255,255,0.5)', accent: '#ffffff' };
    }
    if (brickType === 'heal') {
        return { fill: '#44ff88', glow: 'rgba(68,255,136,0.6)', accent: '#00ff88' };
    }
    if (brickType === 'coin') {
        return { fill: '#ffcc00', glow: 'rgba(255,204,0,0.8)', accent: '#ffd700' };
    }

    // Cor varia por linha + coluna + level para máxima variedade
    const offset = (level - 1 + row * 2 + col) % colorPool.length;
    return colorPool[offset];
}

// ─────────────────────────────────────────────────────────────────────────────
// GERAÇÃO PRINCIPAL
// ─────────────────────────────────────────────────────────────────────────────
export function generateBricks() {
    state.bricks = [];
    const level = state.level;
    const theme = getCurrentTheme(level);

    // Linhas: cresce de 4 (nível 1) até 14 (nível ~400+)
    const rows = Math.min(4 + Math.floor(level / 25), 14);
    const cols = BRICK_COLS; // sempre 10

    let grid = buildGrid(level, rows, cols);

    // Garante mínimo de 6 blocos (antes era 3 — muito pouco)
    let brickCount = 0;
    for (let r = 0; r < rows; r++)
        for (let c = 0; c < cols; c++)
            if (grid[r][c]) brickCount++;

    if (brickCount < 6) {
        // Fallback: enche as 2 primeiras linhas
        for (let r = 0; r < 2; r++)
            for (let c = 0; c < cols; c++)
                grid[r][c] = 1;
    }

    // RNG separada para HP e tipo (não interfere com o layout)
    const hpRng = makeRng((level * 999 + 13) >>> 0);

    for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
            if (!grid[r][c]) continue;

            const brickType = getBrickType(level, r, rows, hpRng);
            const hp = getBrickHp(level, r, rows, brickType, hpRng);

            const color = getBrickColor(theme, level, r, c, brickType);

            state.bricks.push({
                x: BRICK_OFFSET_X + c * (BRICK_W + BRICK_PAD),
                y: BRICK_OFFSET_Y + r * (BRICK_H + BRICK_PAD),
                w: BRICK_W,
                h: BRICK_H,
                alive:  true,
                hp,
                maxHp: hp,
                color,
                hitFlash: 0,
                indestructible: brickType === 'indestructible',
                brickType,
                col: c,
                row: r,
            });
        }
    }
}

// Info do padrão para UI
export function getLevelPatternName(level) {
    const names = [
        'Full Grid', 'Checkerboard', 'Diamond', 'Manhattan Diamond', 'Pyramid',
        'Inv. Pyramid', 'H-Stripes', 'V-Stripes', 'Diag. Stripes', 'Border',
        'Dbl Border', 'Triple Border', 'H-Zigzag', 'V-Zigzag', 'Hourglass',
        'Castle', 'Adv. Castle', 'Arrows Up', 'Arrows Down', 'Wide Cross',
        'Wide X', 'Sine H', 'Sine V', 'Diag. Wave', 'Stairs L',
        'Stairs R', 'Rings', 'Sq. Spiral', 'Target', 'Honeycomb',
        'Grid Blocks', 'V-Columns', 'H-Rows', 'V-Shape', 'Heart',
        'Star 6pt', 'Funnel', 'Bowtie', 'Frame+Check', 'Corners+Cross',
        'Tunnel', 'Diag. Band', 'Scatter', '2x2 Blocks', '3x3 Checker',
        'Dbl Diamond', 'Serpentine', 'Triangle', 'Full Cross', 'Damask',
    ];
    const idx = (level - 1 + Math.floor(level / 50) * 3) % names.length;
    return names[idx];
}

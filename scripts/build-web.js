// build-web.js — Copia assets web para www/ para o Capacitor
const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const WWW = path.join(ROOT, 'www');
const SRC = path.join(ROOT, 'src');

// Limpar www
if (fs.existsSync(WWW)) {
    fs.rmSync(WWW, { recursive: true });
}
fs.mkdirSync(WWW, { recursive: true });

// Copiar index.html
fs.copyFileSync(path.join(ROOT, 'index.html'), path.join(WWW, 'index.html'));
console.log('[OK] index.html');

// Copiar src/
function copyDir(src, dest) {
    fs.mkdirSync(dest, { recursive: true });
    for (const entry of fs.readdirSync(src, { withFileTypes: true })) {
        const s = path.join(src, entry.name);
        const d = path.join(dest, entry.name);
        if (entry.isDirectory()) {
            copyDir(s, d);
        } else if (entry.name.endsWith('.js') || entry.name.endsWith('.css') || entry.name.endsWith('.json')) {
            fs.copyFileSync(s, d);
        }
    }
}
copyDir(SRC, path.join(WWW, 'src'));
console.log('[OK] src/');

// Copiar Sons/
const sons = path.join(ROOT, 'Sons');
if (fs.existsSync(sons)) {
    copyDir(sons, path.join(WWW, 'Sons'));
    console.log('[OK] Sons/');
}

// Copiar Abrindo/
const abrindo = path.join(ROOT, 'Abrindo');
if (fs.existsSync(abrindo)) {
    copyDir(abrindo, path.join(WWW, 'Abrindo'));
    console.log('[OK] Abrindo/');
}

// package-lock.json para compatibilidade
const lock = path.join(ROOT, 'package-lock.json');
if (fs.existsSync(lock)) {
    fs.copyFileSync(lock, path.join(WWW, 'package-lock.json'));
}

// .env se existir (server local usa de raiz, www nao precisa)
console.log('[OK] Build web completo:', WWW);

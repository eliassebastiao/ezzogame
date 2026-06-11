// update.js — Auto-actualizacao: consulta GitHub Releases e notifica o jogador

const REPO = 'eliassebastiao/ezzogame';
const VERSION = '2.0.0'; // mesma versao do package.json
const GITHUB_API = `https://api.github.com/repos/${REPO}/releases/latest`;
const GITHUB_RELEASES = `https://github.com/${REPO}/releases/latest`;

// Cache para evitar consultas repetidas
let _cachedUpdate = null;
let _lastCheck = 0;
const CACHE_TTL = 3600000; // 1 hora

/**
 * Verifica se ha actualizacao disponivel
 * @returns {Promise<{available: boolean, latestVersion: string|null, downloadUrl: string|null, releaseUrl: string|null, error: string|null}>}
 */
export async function checkForUpdate() {
    // Usar cache se ainda valido
    if (_cachedUpdate && Date.now() - _lastCheck < CACHE_TTL) {
        return _cachedUpdate;
    }

    try {
        const res = await fetch(GITHUB_API, {
            headers: {
                'Accept': 'application/vnd.github.v3+json',
                'User-Agent': 'BrickClassico/2.0.0'
            },
            // Timeout via AbortController
            signal: AbortSignal.timeout(8000)
        });

        if (!res.ok) {
            // GitHub pode rate-limit (403) sem autenticacao — silencioso
            const result = { available: false, latestVersion: null, downloadUrl: null, releaseUrl: null, error: `HTTP ${res.status}` };
            _cachedUpdate = result;
            _lastCheck = Date.now();
            return result;
        }

        const data = await res.json();
        const latestVersion = (data.tag_name || '').replace(/^v/, '');
        const downloadUrl = findApkAsset(data.assets);
        const releaseUrl = data.html_url || GITHUB_RELEASES;

        const available = latestVersion !== '' && compareVersions(latestVersion, VERSION) > 0;

        const result = {
            available,
            latestVersion: latestVersion || null,
            downloadUrl,
            releaseUrl,
            error: null
        };

        _cachedUpdate = result;
        _lastCheck = Date.now();
        return result;
    } catch (err) {
        // Falha de rede ou timeout — silencioso, nao atrapalha o jogo
        return { available: false, latestVersion: null, downloadUrl: null, releaseUrl: null, error: err.message };
    }
}

/**
 * Forca limpeza do cache para re-verificar na proxima chamada
 */
export function clearUpdateCache() {
    _cachedUpdate = null;
    _lastCheck = 0;
}

// ===== HELPERS =====

function findApkAsset(assets) {
    if (!Array.isArray(assets)) return null;
    const apk = assets.find(a => a.name && (a.name.endsWith('.apk') || a.content_type === 'application/vnd.android.package-archive'));
    return apk ? apk.browser_download_url : null;
}

/**
 * Compara versoes semver. Retorna > 0 se a > b, < 0 se a < b, 0 se igual.
 */
function compareVersions(a, b) {
    const pa = a.split('.').map(Number);
    const pb = b.split('.').map(Number);
    for (let i = 0; i < Math.max(pa.length, pb.length); i++) {
        const na = pa[i] || 0;
        const nb = pb[i] || 0;
        if (na !== nb) return na - nb;
    }
    return 0;
}

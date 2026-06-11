// updateUI.js — Interface de auto-actualizacao no jogo

import { checkForUpdate, clearUpdateCache } from './update.js';

let _toastTimer = null;

/**
 * Inicia verificacao de actualizacao no startup.
 * Mostra toast no canto inferior direito se houver update disponivel.
 */
export async function checkUpdateOnStartup() {
    const result = await checkForUpdate();
    if (!result.available) return;

    showUpdateToast(result.latestVersion, result.downloadUrl, result.releaseUrl);
}

/**
 * Mostra o toast de actualizacao
 */
function showUpdateToast(version, downloadUrl, releaseUrl) {
    const toast = document.getElementById('updateToast');
    const badge = document.getElementById('updateBadge');
    const versionEl = document.getElementById('updateVersion');
    const downloadBtn = document.getElementById('updateDownloadBtn');
    const dismissBtn = document.getElementById('updateDismissBtn');
    const progress = document.getElementById('updateProgress');
    const progressFill = document.getElementById('updateProgressFill');

    if (!toast) return;

    versionEl.textContent = `v2.0.0 → v${version}`;

    // Mostrar badge
    if (badge) {
        badge.classList.add('show');
        badge.addEventListener('click', () => {
            toast.classList.add('show');
            badge.classList.remove('show');
            if (_toastTimer) clearTimeout(_toastTimer);
        });
    }

    // Auto-mostrar toast apos 3 segundos
    setTimeout(() => {
        toast.classList.add('show');
        if (badge) badge.classList.remove('show');
    }, 3000);

    // Fechar auto apos 15 segundos
    if (_toastTimer) clearTimeout(_toastTimer);
    _toastTimer = setTimeout(() => {
        toast.classList.remove('show');
    }, 15000);

    // Botao de download
    downloadBtn.onclick = () => {
        if (downloadUrl) {
            window.open(downloadUrl, '_blank');
        } else if (releaseUrl) {
            window.open(releaseUrl, '_blank');
        }
        toast.classList.remove('show');
        if (badge) badge.classList.remove('show');
    };

    // Botao ignorar
    dismissBtn.onclick = () => {
        toast.classList.remove('show');
        if (badge) badge.classList.remove('show');
        if (_toastTimer) clearTimeout(_toastTimer);
    };

    // Fechar ao clicar fora
    toast.addEventListener('click', (e) => {
        if (e.target === toast) {
            toast.classList.remove('show');
            if (_toastTimer) clearTimeout(_toastTimer);
        }
    });
}

/**
 * Verificacao manual (ex: botao de "verificar actualizacoes")
 */
export function forceCheckUpdate() {
    clearUpdateCache();
    checkUpdateOnStartup();
}

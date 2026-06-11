// shop.js — Loja de Skins e Inventário

import { getUsername, getSession } from './auth.js';
import { getProfile } from './profile.js';

const API_BASE = window.location.origin + '/api';

// ===== OBTER ITENS DA LOJA =====
export async function getShopItems(type = null) {
    try {
        const url = type ? `${API_BASE}/shop?type=${type}` : `${API_BASE}/shop`;
        const res = await fetch(url);
        const data = await res.json();
        return data.success ? data.items : [];
    } catch (err) {
        console.error('Erro ao obter loja:', err);
        return [];
    }
}

// ===== OBTER INVENTÁRIO DO USUÁRIO =====
export async function getInventory() {
    const user = getUsername();
    if (!user) return [];
    
    try {
        const res = await fetch(`${API_BASE}/inventory/${user}`, {
            headers: { 'Authorization': 'Bearer ' + (getSession() || '') }
        });
        const data = await res.json();
        return data.success ? data.inventory : [];
    } catch (err) {
        console.error('Erro ao obter inventário:', err);
        return [];
    }
}

// ===== COMPRAR ITEM =====
export async function buyItem(itemId) {
    const user = getUsername();
    if (!user) return { success: false, error: 'Não autenticado' };
    
    try {
        const res = await fetch(`${API_BASE}/shop/${user}/buy`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': 'Bearer ' + (getSession() || '')
            },
            body: JSON.stringify({ item_id: itemId })
        });
        const data = await res.json();
        return data;
    } catch (err) {
        console.error('Erro ao comprar item:', err);
        return { success: false, error: 'Erro ao comprar' };
    }
}

// ===== EQUIPAR ITEM =====
export async function equipItem(itemId) {
    const user = getUsername();
    if (!user) return { success: false, error: 'Não autenticado' };
    
    try {
        const res = await fetch(`${API_BASE}/shop/${user}/equip`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': 'Bearer ' + (getSession() || '')
            },
            body: JSON.stringify({ item_id: itemId })
        });
        const data = await res.json();
        return data;
    } catch (err) {
        console.error('Erro ao equipar item:', err);
        return { success: false, error: 'Erro ao equipar' };
    }
}

// ===== CATEGORIAS =====
export const SHOP_CATEGORIES = {
    'paddle': { name: 'Paddles', icon: '🏓' },
    'ball': { name: 'Bolas', icon: '⚪' },
    'theme': { name: 'Temas', icon: '🎨' },
    'particles': { name: 'Partículas', icon: '✨' }
};

// ===== RARIDADES =====
export const SHOP_RARITIES = {
    'common': { label: 'Comum', color: '#9ca3af', bgColor: 'rgba(156, 163, 175, 0.1)' },
    'rare': { label: 'Raro', color: '#3b82f6', bgColor: 'rgba(59, 130, 246, 0.1)' },
    'epic': { label: 'Épico', color: '#a855f7', bgColor: 'rgba(168, 85, 247, 0.1)' },
    'legendary': { label: 'Lendário', color: '#f59e0b', bgColor: 'rgba(245, 158, 11, 0.1)' }
};

// ===== PREVIEW DE ITEMS =====
export function getItemPreview(item) {
    const preview = item.preview_data || {};
    const colors = preview.colors || ['#ffffff'];
    const isGradient = colors.length > 1;
    const gradient = isGradient ? `linear-gradient(135deg, ${colors.join(', ')})` : colors[0];
    
    switch (item.type) {
        case 'paddle':
            return {
                background: gradient,
                borderRadius: '4px',
                boxShadow: preview.glow ? `0 0 15px ${preview.glow}` : 'none'
            };
        case 'ball':
            return {
                background: gradient,
                borderRadius: '50%',
                boxShadow: preview.glow ? `0 0 15px ${preview.glow}` : 'none'
            };
        case 'theme':
            return {
                background: preview.bg || '#000000',
                border: `1px solid ${preview.accent || '#ffffff'}`,
                borderRadius: '8px'
            };
        default:
            return { background: gradient };
    }
}

// ===== MOSTRAR LOJA =====
let currentShopItems = [];
let currentInventory = [];
let currentCoins = 0;

export async function showShop() {
    const overlay = document.getElementById('shopOverlay');
    if (!overlay) {
        console.warn('Overlay da loja não encontrado');
        return;
    }
    
    overlay.classList.remove('hidden');
    
    const user = getUsername();
    
    // Loading
    overlay.innerHTML = `
        <div class="overlay">
            <div class="shop-container">
                <div class="shop-loading">Carregando loja...</div>
            </div>
        </div>
    `;
    
    try {
        const [items, inventory, profile] = await Promise.all([
            getShopItems(),
            user ? getInventory() : Promise.resolve([]),
            user ? getProfile(user) : Promise.resolve(null)
        ]);
        
        currentShopItems = items;
        currentInventory = inventory;
        currentCoins = profile?.coins || 0;
        
        // Agrupar por categoria
        const byCategory = {};
        items.forEach(item => {
            if (!byCategory[item.type]) byCategory[item.type] = [];
            byCategory[item.type].push(item);
        });
        
        overlay.innerHTML = `
            <div class="overlay">
                <div class="shop-container">
                    <div class="shop-header">
                        <div class="shop-title">🛒 LOJA DE SKINS</div>
                        ${user ? `
                            <div class="shop-coins">
                                <span class="coins-icon">💰</span>
                                <span class="coins-amount">${currentCoins}</span>
                            </div>
                        ` : '<div class="shop-coins">Faça login para comprar</div>'}
                    </div>
                    
                    <div class="shop-categories">
                        <button class="shop-category-btn active" data-category="all">Todos</button>
                        ${Object.entries(SHOP_CATEGORIES).map(([key, cat]) => `
                            <button class="shop-category-btn" data-category="${key}">${cat.icon} ${cat.name}</button>
                        `).join('')}
                        ${user ? `<button class="shop-category-btn" data-category="inventory">📦 Inventário</button>` : ''}
                    </div>
                    
                    <div class="shop-items-grid" id="shopItemsGrid">
                        ${renderItems(items, inventory)}
                    </div>
                    
                    <div class="shop-actions">
                        <button class="btn" id="shopCloseBtn">Fechar</button>
                    </div>
                </div>
            </div>
        `;
        
        // Event listeners
        document.getElementById('shopCloseBtn').addEventListener('click', () => {
            overlay.classList.add('hidden');
        });
        
        // Filtros de categoria
        document.querySelectorAll('.shop-category-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                document.querySelectorAll('.shop-category-btn').forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                
                const category = btn.dataset.category;
                const grid = document.getElementById('shopItemsGrid');
                
                if (category === 'all') {
                    grid.innerHTML = renderItems(currentShopItems, currentInventory);
                } else if (category === 'inventory') {
                    grid.innerHTML = renderInventory(currentInventory);
                } else {
                    const filtered = currentShopItems.filter(item => item.type === category);
                    grid.innerHTML = renderItems(filtered, currentInventory);
                }
                
                // Re-attach buy/equip listeners
                attachShopListeners();
            });
        });
        
        attachShopListeners();
        
    } catch (err) {
        console.error('Erro ao carregar loja:', err);
        overlay.innerHTML = `
            <div class="overlay">
                <div class="shop-container">
                    <div class="shop-error">Erro ao carregar loja</div>
                    <button class="btn" id="shopCloseBtn">Fechar</button>
                </div>
            </div>
        `;
        document.getElementById('shopCloseBtn').addEventListener('click', () => {
            overlay.classList.add('hidden');
        });
    }
}

function renderItems(items, inventory) {
    if (items.length === 0) {
        return '<div class="shop-empty">Nenhum item disponível</div>';
    }
    
    return items.map(item => {
        const owned = inventory.some(inv => inv.id === item.id);
        const equipped = inventory.some(inv => inv.id === item.id && inv.equipped);
        const rarity = SHOP_RARITIES[item.rarity] || SHOP_RARITIES.common;
        const preview = getItemPreview(item);
        
        return `
            <div class="shop-item-card ${item.rarity} ${owned ? 'owned' : ''} ${equipped ? 'equipped' : ''}">
                <div class="shop-item-preview" style="${Object.entries(preview).map(([k, v]) => `${k}:${v}`).join(';')}"></div>
                <div class="shop-item-info">
                    <div class="shop-item-name">${item.name}</div>
                    <div class="shop-item-desc">${item.description}</div>
                    <div class="shop-item-meta">
                        <span class="shop-item-rarity" style="color: ${rarity.color}; background: ${rarity.bgColor}">${rarity.label}</span>
                        ${!owned ? `
                            <span class="shop-item-price">${item.price} 💰</span>
                        ` : ''}
                    </div>
                    <div class="shop-item-actions">
                        ${!owned ? `
                            <button class="btn btn-small shop-buy-btn" data-item="${item.id}" ${item.price > currentCoins ? 'disabled' : ''}>
                                ${item.price === 0 ? 'Grátis' : `Comprar (${item.price} 💰)`}
                            </button>
                        ` : `
                            <span class="shop-owned-badge">✅ Possuído</span>
                            ${!equipped ? `
                                <button class="btn btn-secondary btn-small shop-equip-btn" data-item="${item.id}">Equipar</button>
                            ` : '<span class="shop-equipped-badge">⭐ Equipado</span>'}
                        `}
                    </div>
                </div>
            </div>
        `;
    }).join('');
}

function renderInventory(inventory) {
    if (inventory.length === 0) {
        return '<div class="shop-empty">Inventário vazio. Compre itens na loja!</div>';
    }
    
    return renderItems(inventory, inventory);
}

function attachShopListeners() {
    // Botões de compra
    document.querySelectorAll('.shop-buy-btn').forEach(btn => {
        btn.addEventListener('click', async (e) => {
            const itemId = e.target.dataset.item;
            const result = await buyItem(itemId);
            
            if (result.success) {
                showShopNotification('🎉 Compra realizada!', 'success');
                // Recarregar loja
                showShop();
            } else {
                showShopNotification(`❌ ${result.error || 'Erro na compra'}`, 'error');
            }
        });
    });
    
    // Botões de equipar
    document.querySelectorAll('.shop-equip-btn').forEach(btn => {
        btn.addEventListener('click', async (e) => {
            const itemId = e.target.dataset.item;
            const result = await equipItem(itemId);
            
            if (result.success) {
                showShopNotification('✅ Item equipado!', 'success');
                // Recarregar loja
                showShop();
            } else {
                showShopNotification(`❌ ${result.error || 'Erro ao equipar'}`, 'error');
            }
        });
    });
}

function showShopNotification(message, type) {
    const notification = document.createElement('div');
    notification.className = `shop-notification ${type}`;
    notification.textContent = message;
    document.body.appendChild(notification);
    
    setTimeout(() => notification.classList.add('show'), 100);
    setTimeout(() => {
        notification.classList.remove('show');
        setTimeout(() => notification.remove(), 500);
    }, 3000);
}

export function hideShop() {
    const overlay = document.getElementById('shopOverlay');
    if (overlay) overlay.classList.add('hidden');
}

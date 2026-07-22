/**
 * =============================================================================
 * CONTA COMIGO PRO — categorias.js
 * Lógica da visão Categorias Personalizadas
 * =============================================================================
 */

import { state, subscribeState } from '../../state.js';

export function initView() {
    renderView();
    subscribeState(() => {
        if (document.getElementById('page-categorias')?.classList.contains('active')) {
            renderView();
        }
    });
}

export function renderView() {
    const grid = document.getElementById('categories-list');
    if (!grid) return;

    grid.innerHTML = '';

    if (state.categoriesList.length === 0) {
        grid.innerHTML = `
            <div class="empty-state w-100" style="grid-column: 1/-1;">
                <i class="fa-solid fa-tags"></i>
                <p>Nenhuma categoria cadastrada.</p>
                <p style="font-size: 0.85rem; margin-top: 8px;">Clique em "Nova Categoria" para criar sua primeira categoria.</p>
            </div>
        `;
        return;
    }

    state.categoriesList.forEach(c => {
        grid.innerHTML += `
            <div class="category-ui category-list-item" style="background:var(--bg-secondary); border: 1px solid var(--border); padding: 8px; border-radius: 12px; display:flex; align-items:center; justify-content:space-between; transition: 0.2s; overflow: hidden;">
                <div style="display:flex; align-items:center; gap: 12px; min-width: 0; flex: 1;">
                    <div style="width: 20px; height: 20px; border-radius: 50%; background:var(--bg-main); color:var(--text-main); display:flex; align-items:center; justify-content:center; font-size: 0.8rem; border: 1px solid var(--border); flex-shrink: 0;">
                        <i class="fa-solid ${c.icon || 'fa-tag'}"></i>
                    </div>
                    <span style="font-weight: 600; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; flex: 1;">${c.name}</span>
                </div>
                <div style="display:flex; gap: 8px; flex-shrink: 0;">
                    <button class="btn-icon" onclick="window.editCategory('${c.id}')" title="Editar Categoria">
                        <i class="fa-solid fa-pen" style="color:var(--text-muted)"></i>
                    </button>
                    <button class="btn-icon" onclick="window.deleteCategory('${c.id}')" title="Excluir Categoria">
                        <i class="fa-solid fa-trash" style="color:var(--danger)"></i>
                    </button>
                </div>
            </div>
        `;
    });
}

/**
 * =============================================================================
 * CONTA COMIGO PRO — metas.js
 * Lógica da visão Minhas Metas
 * =============================================================================
 */

import { state, subscribeState } from '../../state.js';
import { formatCurrency } from '../../utils.js';

export function initView() {
    renderView();
    subscribeState(() => {
        if (document.getElementById('page-metas')?.classList.contains('active')) {
            renderView();
        }
    });
}

export function renderView() {
    const grid = document.getElementById('goals-list');
    if (!grid) return;

    grid.innerHTML = '';
    if (state.goalsList.length === 0) {
        grid.innerHTML = `<div class="empty-state w-100" style="grid-column: 1/-1;"><i class="fa-solid fa-bullseye"></i><p>Nenhuma meta cadastrada.</p></div>`;
        return;
    }

    state.goalsList.forEach(g => {
        const perc = g.targetValue > 0 ? Math.min(((g.currentValue / g.targetValue) * 100), 100).toFixed(0) : 0;
        const isDone = g.currentValue >= g.targetValue;
        const falta = Math.max(g.targetValue - g.currentValue, 0);
        const faltaFormatada = formatCurrency(falta);

        grid.innerHTML += `
        <div class="card goal-card" style="padding: 16px;">
            <div class="goal-header" style="display:flex; justify-content:space-between; align-items:center; margin-bottom: 12px;">
                <h4 style="margin: 0; font-size: 1.05rem;">${g.name}</h4>
                <span class="percentage" style="font-weight: 700; color: ${isDone ? 'var(--success)' : 'var(--primary)'}">${perc}%</span>
            </div>
            <div class="progress-container" style="height: 10px; background: var(--bg-body); border-radius: 5px; overflow: hidden; margin-bottom: 12px;">
                <div class="progress-bar" style="width: ${perc}%; height: 100%; background: ${isDone ? 'var(--success)' : 'linear-gradient(90deg, var(--primary), #818cf8)'};"></div>
            </div>
            <div class="goal-footer" style="display:flex; justify-content:space-between; align-items:flex-end;">
                <div class="goal-values" style="font-size: 0.85rem;">
                    <p style="margin: 0;">Atual: <strong>${formatCurrency(g.currentValue)}</strong></p>
                    <p style="margin: 4px 0 0 0;">Total: <strong>${formatCurrency(g.targetValue)}</strong></p>
                    ${falta > 0 ? `<p style="margin: 4px 0 0 0; color: var(--text-muted);">Falta: <strong>${faltaFormatada}</strong></p>` : `<p style="color: var(--success); margin: 4px 0 0 0; font-weight: 600;">✅ Meta alcançada!</p>`}
                </div>
                <div class="goal-actions" style="display:flex; gap:8px;">
                    <button class="btn-icon" onclick="window.addFundsToGoal('${g.id}', ${g.currentValue}, ${g.targetValue})" title="Adicionar fundo"><i class="fa-solid fa-hand-holding-dollar" style="color:var(--success)"></i></button>
                    <button class="btn-icon" onclick="window.deleteGoal('${g.id}')" title="Excluir Meta"><i class="fa-solid fa-trash"></i></button>
                </div>
            </div>
        </div>
    `;
    });
}

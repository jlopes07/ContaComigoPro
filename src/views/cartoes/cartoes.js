/**
 * =============================================================================
 * CONTA COMIGO PRO — cartoes.js
 * Lógica da visão Meus Cartões
 * =============================================================================
 */

import { state, subscribeState } from '../../state.js';
import { formatCurrency, formatDate, getCategoryIcon } from '../../utils.js';

export function initView() {
    renderView();
    subscribeState(() => {
        if (document.getElementById('page-cartoes')?.classList.contains('active')) {
            renderView();
        }
    });
}

export function renderView() {
    const grid = document.getElementById('cards-list');
    if (!grid) return;

    grid.innerHTML = '';
    if (state.cardsList.length === 0) {
        grid.innerHTML = `<div class="empty-state w-100" style="grid-column: 1/-1;"><i class="fa-solid fa-credit-card"></i><p>Nenhum cartão cadastrado.</p></div>`;
        return;
    }

    const currentMonth = new Date().toISOString().slice(0, 7);

    state.cardsList.forEach(c => {
        const spentOnCard = state.transactions
            .filter(t => t.paymentMethod === c.id && t.date && t.date.startsWith(currentMonth))
            .reduce((acc, t) => acc + (t.type === 'expense' ? t.amount : -t.amount), 0);

        const available = c.limit - Math.max(spentOnCard, 0);

        grid.innerHTML += `
            <div class="card credit-card-card" style="padding: 16px; border-top: 4px solid var(--primary); position: relative;">
                <button class="btn-icon" style="position: absolute; right: 40px; top: 8px;" onclick="window.editCard('${c.id}')" title="Editar Cartão"><i class="fa-solid fa-pen" style="font-size:0.9rem;"></i></button>
                <button class="btn-icon" style="position: absolute; right: 8px; top: 8px;" onclick="window.deleteCard('${c.id}')" title="Excluir Cartão"><i class="fa-solid fa-trash" style="font-size:0.9rem;"></i></button>
                <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom: 12px;">
                    <div style="font-weight: 600; font-size: 1.1rem; display:flex; align-items:center; gap:8px;">
                        <i class="fa-solid fa-credit-card" style="color: var(--primary)"></i> ${c.nickname}
                    </div>
                </div>
                <p style="color: var(--text-muted); font-size: 0.85rem; margin-bottom: 8px;">Instituição: <strong>${c.bank}</strong></p>
                <div style="margin-bottom: 8px;">
                    <span style="color: var(--text-muted); font-size: 0.8rem; display:block;">Fatura Atual (Mês ${currentMonth.slice(5)})</span>
                    <span style="font-weight: 700; font-size: 1.2rem; color: var(--danger);">${formatCurrency(Math.max(spentOnCard, 0))}</span>
                </div>
                <div style="display:flex; justify-space-between; font-size: 0.8rem; color: var(--text-muted); margin-bottom: 12px;">
                    <span>Limite: ${formatCurrency(c.limit)}</span>
                    <span>Disponível: ${formatCurrency(available)}</span>
                </div>
                <div style="display:flex; gap: 8px;">
                    <button class="btn btn-primary w-100" onclick="window.launchCardFatura('${c.id}', ${spentOnCard})">Pagar Fatura</button>
                </div>
            </div>
        `;
    });
}

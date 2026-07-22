/**
 * =============================================================================
 * CONTA COMIGO PRO — fixas.js
 * Lógica da visão Transações Fixas
 * =============================================================================
 */

import { state, subscribeState } from '../../state.js';
import { formatCurrency, getCategoryIcon } from '../../utils.js';

export function initView() {
    renderView();
    subscribeState(() => {
        if (document.getElementById('page-fixas')?.classList.contains('active')) {
            renderView();
        }
    });
}

export function renderView() {
    const container = document.getElementById('transaction-list-fixed');
    if (!container) return;

    container.innerHTML = '';
    if (state.fixedTransactionsList.length === 0 && state.cardsList.length === 0) {
        container.innerHTML = `<div class="empty-state"><i class="fa-solid fa-repeat"></i><p>Nenhuma transação fixa cadastrada.</p></div>`;
        return;
    }

    const currentMonth = new Date().toISOString().slice(0, 7);

    state.fixedTransactionsList.forEach(t => {
        const isInc = t.type === 'income';
        const sign = isInc ? '+' : '-';
        const autoText = t.isAutomatic ? `Todo dia ${t.dayOfMonth} (Auto)` : `Lançamento Manual (Venc. Dia ${t.dayOfMonth})`;

        const isProcessedThisMonth = t.lastProcessedMonth === currentMonth;
        let statusBadge = '';
        if (isProcessedThisMonth) {
            statusBadge = `<span style="font-size: 0.65rem; background: var(--success-bg); color: var(--success); padding: 4px 8px; border-radius: 12px; font-weight: 700; margin-left: 12px;"><i class="fa-solid fa-check"></i> Lançado este mês</span>`;
        }

        let launchBtn = !isProcessedThisMonth ? `<button class="btn-icon" onclick="window.launchManualFixedTransaction('${t.id}')" title="Lançar agora"><i class="fa-solid fa-play" style="color:var(--success)"></i></button>` : '';

        container.innerHTML += `
            <div class="transaction-item">
                <div class="tx-left" style="flex: 1;">
                    <div class="tx-icon ${isInc ? 'income' : 'expense'}"><i class="fa-solid ${isInc ? 'fa-arrow-up' : 'fa-arrow-down'}"></i></div>
                    <div class="tx-details">
                        <p class="tx-title" style="display:flex; align-items:center;">${t.description} ${statusBadge}</p>
                        <p class="tx-category"><i class="fa-solid ${getCategoryIcon(t.category)}"></i> ${t.category} | ${autoText}</p>
                    </div>
                </div>
                <div class="tx-right">
                    <p class="tx-amount ${isInc ? 'positive' : 'negative'}">${sign} ${formatCurrency(t.amount)}</p>
                </div>
                <div class="tx-actions" style="display:flex; gap: 8px;">
                    ${launchBtn}
                    <button class="btn-icon" onclick="window.editFixedTransaction('${t.id}')" title="Editar"><i class="fa-solid fa-pen"></i></button>
                    <button class="btn-icon" onclick="window.deleteFixedTransaction('${t.id}')" title="Excluir"><i class="fa-solid fa-trash"></i></button>
                </div>
            </div>`;
    });

    state.cardsList.forEach(c => {
        const spentOnCard = state.transactions
            .filter(t => t.paymentMethod === c.id && t.date && t.date.startsWith(currentMonth))
            .reduce((acc, t) => acc + (t.type === 'expense' ? t.amount : -t.amount), 0);

        const autoText = `Pagamento de Fatura (Venc. Dia ${c.dueDay})`;
        const isProcessedThisMonth = c.lastProcessedMonth === currentMonth;

        let statusBadge = '';
        if (isProcessedThisMonth) {
            statusBadge = `<span style="font-size: 0.65rem; background: var(--success-bg); color: var(--success); padding: 4px 8px; border-radius: 12px; font-weight: 700; margin-left: 12px;"><i class="fa-solid fa-check"></i> Pago este mês</span>`;
        }

        let launchBtn = !isProcessedThisMonth ? `<button class="btn-icon" onclick="window.launchCardFatura('${c.id}', ${spentOnCard})" title="Pagar Fatura Agora"><i class="fa-solid fa-play" style="color:var(--success)"></i></button>` : '';

        container.innerHTML += `
            <div class="transaction-item" style="border-left: 4px solid var(--primary);">
                <div class="tx-left" style="flex: 1;">
                    <div class="tx-icon expense"><i class="fa-solid fa-credit-card"></i></div>
                    <div class="tx-details">
                        <p class="tx-title" style="display:flex; align-items:center;">Fatura: ${c.nickname} ${statusBadge}</p>
                        <p class="tx-category"><i class="fa-solid fa-credit-card"></i> Cartão de Crédito | ${autoText}</p>
                    </div>
                </div>
                <div class="tx-right">
                    <p class="tx-amount negative">- ${formatCurrency(Math.max(spentOnCard, 0))}</p>
                </div>
                <div class="tx-actions" style="display:flex; gap: 8px;">
                    ${launchBtn}
                </div>
            </div>`;
    });
}

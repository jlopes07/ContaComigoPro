/**
 * =============================================================================
 * CONTA COMIGO PRO — transacoes.js
 * Lógica da visão Transações (Histórico Completo)
 * =============================================================================
 */

import { state, subscribeState } from '../../state.js';
import { formatCurrency, formatDate, getCategoryIcon } from '../../utils.js';

export function initView() {
    renderView();
    subscribeState(() => {
        if (document.getElementById('page-transacoes')?.classList.contains('active')) {
            renderView();
        }
    });

    const filterSearch = document.getElementById('filter-search');
    const filterType = document.getElementById('filter-type');
    const filterDateStart = document.getElementById('filter-date-start');
    const filterDateEnd = document.getElementById('filter-date-end');
    const filterCategory = document.getElementById('filter-category');
    const btnClearFilters = document.getElementById('btn-clear-filters');

    if (filterSearch) filterSearch.addEventListener('input', applyTransacoesFilters);
    if (filterType) filterType.addEventListener('change', applyTransacoesFilters);
    if (filterDateStart) filterDateStart.addEventListener('change', applyTransacoesFilters);
    if (filterDateEnd) filterDateEnd.addEventListener('change', applyTransacoesFilters);
    if (filterCategory) filterCategory.addEventListener('change', applyTransacoesFilters);
    if (btnClearFilters) {
        btnClearFilters.addEventListener('click', () => {
            if (filterSearch) filterSearch.value = '';
            if (filterType) filterType.value = 'all';
            if (filterCategory) filterCategory.value = 'all';
            if (filterDateStart) filterDateStart.value = '';
            if (filterDateEnd) filterDateEnd.value = '';
            applyTransacoesFilters();
        });
    }
}

export function renderView() {
    populateCategoryFilter();
    applyTransacoesFilters();
}

function populateCategoryFilter() {
    const select = document.getElementById('filter-category');
    if (!select) return;

    let opts = `<option value="all">Todas Categ.</option>`;
    state.categoriesList.forEach(c => {
        opts += `<option value="${c.name}">${c.name}</option>`;
    });
    select.innerHTML = opts;
}

export function applyTransacoesFilters() {
    const filterSearch = document.getElementById('filter-search');
    const filterType = document.getElementById('filter-type');
    const filterCategory = document.getElementById('filter-category');
    const filterDateStart = document.getElementById('filter-date-start');
    const filterDateEnd = document.getElementById('filter-date-end');

    const str = filterSearch ? filterSearch.value.toLowerCase() : '';
    const type = filterType ? filterType.value : 'all';
    const category = filterCategory ? filterCategory.value : 'all';
    const dateStart = filterDateStart ? filterDateStart.value : '';
    const dateEnd = filterDateEnd ? filterDateEnd.value : '';

    const res = state.transactions.filter(t => {
        const mStr = (t.description || '').toLowerCase().includes(str);
        const mType = type === 'all' || t.type === type;
        const mCat = category === 'all' || t.category === category;
        const mDate = (!dateStart || t.date >= dateStart) && (!dateEnd || t.date <= dateEnd);

        return mStr && mType && mCat && mDate;
    });

    const fAmounts = res.map(t => t.type === 'income' ? t.amount : -t.amount);
    const fTot = fAmounts.reduce((a, b) => a + b, 0);
    const fInc = fAmounts.filter(v => v > 0).reduce((a, b) => a + b, 0);
    const fExp = fAmounts.filter(v => v < 0).reduce((a, b) => a + b, 0) * -1;

    const fBalanceEl = document.getElementById('filtered-balance');
    const fIncomeEl = document.getElementById('filtered-income');
    const fExpenseEl = document.getElementById('filtered-expense');

    if (fBalanceEl) {
        fBalanceEl.textContent = formatCurrency(fTot);
        fBalanceEl.style.color = fTot < 0 ? 'var(--danger)' : 'var(--text-main)';
    }
    if (fIncomeEl) fIncomeEl.textContent = formatCurrency(fInc);
    if (fExpenseEl) fExpenseEl.textContent = formatCurrency(fExp);

    renderTransactionsList(res);
}

function renderTransactionsList(txs) {
    const container = document.getElementById('transaction-list-complete');
    if (!container) return;

    container.innerHTML = '';
    if (txs.length === 0) {
        container.innerHTML = `<div class="empty-state"><i class="fa-solid fa-receipt"></i><p>Nenhuma transação encontrada.</p></div>`;
        return;
    }

    txs.forEach(t => {
        const isInc = t.type === 'income';
        const sign = isInc ? '+' : '-';

        let pmBadge = '';
        if (t.paymentMethod) {
            const b = state.banksList.find(bank => bank.id === t.paymentMethod);
            if (b) {
                pmBadge = `<span style="font-size: 0.65rem; background: var(--bg-body); padding: 4px 8px; border-radius: 12px; border: 1px solid var(--border);"><i class="fa-solid fa-building-columns" style="color: ${b.color}"></i> ${b.name}</span>`;
            } else {
                const c = state.cardsList.find(card => card.id === t.paymentMethod);
                if (c) {
                    pmBadge = `<span style="font-size: 0.65rem; background: var(--bg-body); padding: 4px 8px; border-radius: 12px; border: 1px solid var(--border);"><i class="fa-solid fa-credit-card" style="color: var(--primary)"></i> ${c.nickname}</span>`;
                }
            }
        }

        container.innerHTML += `
            <div class="transaction-item">
                <div class="tx-left">
                    <div class="tx-icon ${isInc ? 'income' : 'expense'}"><i class="fa-solid ${isInc ? 'fa-arrow-up' : 'fa-arrow-down'}"></i></div>
                    <div class="tx-details">
                        <p class="tx-title" style="display:flex; align-items:center; flex-wrap:wrap; gap: 8px;">${t.description} ${pmBadge}</p>
                        <p class="tx-category"><i class="fa-solid ${getCategoryIcon(t.category)}"></i> ${t.category}</p>
                    </div>
                </div>
                <div class="tx-right">
                    <p class="tx-amount ${isInc ? 'positive' : 'negative'}">${sign} ${formatCurrency(t.amount)}</p>
                    <p class="tx-date">${formatDate(t.date)}</p>
                </div>
                <div class="tx-actions" style="display:flex; gap: 8px;">
                    <button class="btn-icon" onclick="window.editTransaction('${t.id}')" title="Editar"><i class="fa-solid fa-pen"></i></button>
                    <button class="btn-icon" onclick="window.deleteTransaction('${t.id}')" title="Excluir"><i class="fa-solid fa-trash"></i></button>
                </div>
            </div>`;
    });
}

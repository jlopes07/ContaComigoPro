/**
 * =============================================================================
 * CONTA COMIGO PRO — bancos.js
 * Lógica da visão Bancos & Contas
 * =============================================================================
 */

import { state, subscribeState } from '../../state.js';
import { formatCurrency, formatDate } from '../../utils.js';

export function initView() {
    renderView();
    subscribeState(() => {
        if (document.getElementById('page-bancos')?.classList.contains('active')) {
            renderView();
        }
    });
}

export function renderView() {
    const grid = document.getElementById('banks-list');
    if (!grid) return;

    if (state.currentBankFilter.id) {
        expandBank(state.currentBankFilter.id);
        return;
    }

    grid.innerHTML = '';
    if (state.banksList.length === 0) {
        grid.innerHTML = `<div class="empty-state w-100" style="grid-column: 1/-1;"><i class="fa-solid fa-building-columns"></i><p>Nenhuma conta bancária cadastrada.</p></div>`;
        return;
    }

    state.banksList.forEach(b => {
        const bankTransactions = state.transactions.filter(t => t.paymentMethod === b.id);
        const revenue = bankTransactions.filter(t => t.type === 'income').reduce((acc, t) => acc + t.amount, 0);
        const expenses = bankTransactions.filter(t => t.type === 'expense').reduce((acc, t) => acc + t.amount, 0);

        const currentBalance = (b.balance || 0) + revenue - expenses;
        const colorVar = currentBalance < 0 ? 'var(--danger)' : 'var(--text-main)';

        grid.innerHTML += `
            <div class="card bank-card" style="padding: 16px; border-top: 4px solid ${b.color}; cursor: pointer; position: relative;" onclick="window.expandBank('${b.id}')" data-bank-id="${b.id}">
                <button class="btn-icon" style="position: absolute; right: 40px; top: 8px;" onclick="event.stopPropagation(); window.editBank('${b.id}')" title="Editar Banco"><i class="fa-solid fa-pen" style="font-size:0.9rem;"></i></button>
                <button class="btn-icon" style="position: absolute; right: 8px; top: 8px;" onclick="event.stopPropagation(); window.deleteBank('${b.id}')" title="Excluir Banco"><i class="fa-solid fa-trash" style="font-size:0.9rem;"></i></button>
                <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom: 12px;">
                    <div style="font-weight: 600; font-size: 1.1rem; display:flex; align-items:center; gap:8px;">
                        <i class="fa-solid fa-building-columns" style="color: ${b.color}"></i> ${b.name}
                    </div>
                </div>
                <div style="margin-bottom: 8px;">
                    <span style="color: var(--text-muted); font-size: 0.8rem; display:block;">Saldo Atual</span>
                    <span style="font-weight: 700; font-size: 1.2rem; color: ${colorVar}" class="bank-balance-value" data-bank-id="${b.id}">${formatCurrency(currentBalance)}</span>
                </div>
                <div style="font-size: 0.8rem; color: var(--text-muted);">
                    Saldo Inicial: ${formatCurrency(b.balance || 0)}
                </div>
                <div style="font-size: 0.7rem; color: var(--text-muted); margin-top: 4px;">
                    <i class="fa-regular fa-clock"></i> ${bankTransactions.length} transações
                </div>
            </div>
        `;
    });
}

export function expandBank(id) {
    const b = state.banksList.find(x => x.id === id);
    const grid = document.getElementById('banks-list');
    if (!b || !grid) return;

    grid.innerHTML = '';

    const bankTransactions = state.transactions.filter(t => t.paymentMethod === b.id);
    const revenue = bankTransactions.filter(t => t.type === 'income').reduce((acc, t) => acc + t.amount, 0);
    const expenses = bankTransactions.filter(t => t.type === 'expense').reduce((acc, t) => acc + t.amount, 0);
    const currentBalance = (b.balance || 0) + revenue - expenses;
    const colorVar = currentBalance < 0 ? 'var(--danger)' : 'var(--text-main)';

    const savedStart = state.currentBankFilter.id === id ? state.currentBankFilter.startDate : '';
    const savedEnd = state.currentBankFilter.id === id ? state.currentBankFilter.endDate : '';

    const today = new Date();
    const currentMonth = today.toISOString().slice(0, 7);
    const monthStart = `${currentMonth}-01`;
    const monthEnd = today.toISOString().slice(0, 10);

    grid.innerHTML += `
        <div class="card w-100" style="grid-column: 1/-1; border-top: 4px solid ${b.color}; padding: 16px; margin-bottom: 16px;">
            <div style="display: flex; align-items: center; gap: 12px; margin-bottom: 16px; flex-wrap: wrap;">
                <button class="btn btn-secondary" onclick="window.closeExpandedBank()" style="padding: 6px 12px; font-size: 0.85rem; display: flex; align-items: center; gap: 6px;">
                    <i class="fa-solid fa-arrow-left"></i> Voltar
                </button>
                <span style="font-size: 0.85rem; color: var(--text-muted);">Voltar para todos os bancos</span>
                <div style="flex: 1;"></div>
                <button class="btn btn-outline" onclick="window.setBankFilterToMonth('${b.id}')" style="padding: 6px 12px; font-size: 0.85rem;">
                    <i class="fa-regular fa-calendar"></i> Mês Atual
                </button>
                <button class="btn btn-outline" onclick="window.clearBankFilters('${b.id}')" style="padding: 6px 12px; font-size: 0.85rem;">
                    <i class="fa-solid fa-eraser"></i> Limpar
                </button>
                <button class="btn btn-primary" onclick="window.generateBankReport('${b.id}')" style="padding: 6px 12px; font-size: 0.85rem;">
                    <i class="fa-solid fa-print"></i> Gerar Relatório
                </button>
            </div>
            
            <div style="display:flex; justify-content:space-between; align-items:center; flex-wrap: wrap; gap: 12px;">
                <div style="display:flex; gap: 16px; align-items:center;">
                    <i class="fa-solid fa-building-columns" style="font-size: 2rem; color: ${b.color}"></i>
                    <div>
                        <h3 style="margin: 0;">${b.name}</h3>
                        <p style="color: var(--text-muted); margin: 0; font-size: 0.9rem;">Saldo Inicial: ${formatCurrency(b.balance || 0)}</p>
                    </div>
                </div>
                <div style="text-align: right;">
                    <p style="color: var(--text-muted); margin: 0; font-size: 0.9rem;">Saldo Atual</p>
                    <h2 style="margin: 0; color: ${colorVar}" id="bank-current-balance-${b.id}">${formatCurrency(currentBalance)}</h2>
                </div>
            </div>
            
            <div class="filter-container mt-3" style="background:var(--bg-body); padding:12px; border-radius:8px;">
                <div style="display:flex; gap:12px; align-items:center; flex-wrap:wrap;">
                    <label style="font-size: 0.85rem; color: var(--text-muted); font-weight: 500;">Período:</label>
                    <input type="date" id="bank-filter-start" class="form-input" title="Início" onchange="window.filterBankExtract('${b.id}')" value="${savedStart}" style="width: 150px;">
                    <span style="color: var(--text-muted);">até</span>
                    <input type="date" id="bank-filter-end" class="form-input" title="Fim" onchange="window.filterBankExtract('${b.id}')" value="${savedEnd}" style="width: 150px;">
                    <div style="flex: 1;"></div>
                    <button class="btn btn-outline" style="margin-left: auto;" onclick="window.editBank('${b.id}')"><i class="fa-solid fa-pen"></i> Editar</button>
                    <button class="btn btn-outline" style="border-color: var(--danger); color: var(--danger);" onclick="window.deleteBank('${b.id}')"><i class="fa-solid fa-trash"></i> Excluir</button>
                </div>
            </div>
        </div>
        
        <div class="w-100" style="grid-column: 1/-1;">
            <div class="transactions-list" id="inline-bank-transactions"></div>
        </div>
    `;

    if (!savedStart && !savedEnd) {
        const startEl = document.getElementById('bank-filter-start');
        const endEl = document.getElementById('bank-filter-end');
        if (startEl) startEl.value = monthStart;
        if (endEl) endEl.value = monthEnd;
    }

    filterBankExtract(b.id);
}

export function filterBankExtract(id) {
    const listNode = document.getElementById('inline-bank-transactions');
    if (!listNode) return;

    state.currentBankFilter.id = id;
    state.currentBankFilter.startDate = document.getElementById('bank-filter-start')?.value || '';
    state.currentBankFilter.endDate = document.getElementById('bank-filter-end')?.value || '';

    const dStart = state.currentBankFilter.startDate;
    const dEnd = state.currentBankFilter.endDate;

    const b = state.banksList.find(x => x.id === id);
    if (!b) return;

    let res = state.transactions.filter(t => t.paymentMethod === id);
    const sortedAll = [...res].sort((a, b) => a.date.localeCompare(b.date));

    let saldoAcumulado = b.balance || 0;
    let totalReceitas = 0;
    let totalDespesas = 0;

    if (dEnd) {
        sortedAll.forEach(t => {
            if (t.date <= dEnd) {
                if (t.type === 'income') {
                    saldoAcumulado += t.amount;
                    totalReceitas += t.amount;
                } else {
                    saldoAcumulado -= t.amount;
                    totalDespesas += t.amount;
                }
            }
        });
    } else {
        sortedAll.forEach(t => {
            if (t.type === 'income') {
                saldoAcumulado += t.amount;
                totalReceitas += t.amount;
            } else {
                saldoAcumulado -= t.amount;
                totalDespesas += t.amount;
            }
        });
    }

    let displayRes = res;
    if (dStart) displayRes = displayRes.filter(t => t.date >= dStart);
    if (dEnd) displayRes = displayRes.filter(t => t.date <= dEnd);
    displayRes.sort((a, b) => a.date.localeCompare(b.date));

    listNode.innerHTML = '';
    if (displayRes.length === 0) {
        listNode.innerHTML = `<div class="empty-state"><i class="fa-solid fa-receipt"></i><p>Nenhuma transação encontrada no período.</p></div>`;
    } else {
        displayRes.forEach(t => {
            const isInc = t.type === 'income';
            const sign = isInc ? '+' : '-';
            listNode.innerHTML += `
                <div class="transaction-item">
                    <div class="tx-left">
                        <div class="tx-icon ${isInc ? 'income' : 'expense'}"><i class="fa-solid ${isInc ? 'fa-arrow-up' : 'fa-arrow-down'}"></i></div>
                        <div class="tx-details">
                            <p class="tx-title">${t.description}</p>
                            <p class="tx-category">${t.category || 'Geral'}</p>
                        </div>
                    </div>
                    <div class="tx-right">
                        <p class="tx-amount ${isInc ? 'positive' : 'negative'}">${sign} ${formatCurrency(t.amount)}</p>
                        <p class="tx-date">${formatDate(t.date)}</p>
                    </div>
                </div>`;
        });
    }

    const periodText = dStart && dEnd ? `${formatDate(dStart)} a ${formatDate(dEnd)}` : 'Todo o período';
    const saldoColor = saldoAcumulado >= 0 ? 'var(--success)' : 'var(--danger)';

    const summaryHtml = `
        <div class="bank-extract-summary">
            <div class="summary-item">
                <span class="label">📅 Período</span>
                <span class="value period">${periodText}</span>
            </div>
            <div class="summary-item">
                <span class="label">💰 Saldo Inicial</span>
                <span class="value initial">${formatCurrency(b.balance || 0)}</span>
            </div>
            <div class="summary-item">
                <span class="label">📈 Receitas</span>
                <span class="value positive">+ ${formatCurrency(totalReceitas)}</span>
            </div>
            <div class="summary-item">
                <span class="label">📉 Despesas</span>
                <span class="value negative">- ${formatCurrency(totalDespesas)}</span>
            </div>
            <div class="summary-item highlight">
                <span class="label">🏦 Saldo Final</span>
                <span class="value final" style="color: ${saldoColor};">${formatCurrency(saldoAcumulado)}</span>
            </div>
        </div>
    `;

    listNode.insertAdjacentHTML('afterbegin', summaryHtml);
}

window.expandBank = expandBank;
window.filterBankExtract = filterBankExtract;
window.closeExpandedBank = () => {
    state.currentBankFilter.id = null;
    renderView();
};
window.setBankFilterToMonth = (bankId) => {
    const today = new Date();
    const currentMonth = today.toISOString().slice(0, 7);
    const startEl = document.getElementById('bank-filter-start');
    const endEl = document.getElementById('bank-filter-end');
    if (startEl) startEl.value = `${currentMonth}-01`;
    if (endEl) endEl.value = today.toISOString().slice(0, 10);
    filterBankExtract(bankId);
};
window.clearBankFilters = (bankId) => {
    const startEl = document.getElementById('bank-filter-start');
    const endEl = document.getElementById('bank-filter-end');
    if (startEl) startEl.value = '';
    if (endEl) endEl.value = '';
    filterBankExtract(bankId);
};

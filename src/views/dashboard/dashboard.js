/**
 * =============================================================================
 * CONTA COMIGO PRO — dashboard.js
 * Lógica da visão Dashboard / Visão Geral
 * =============================================================================
 */

import { state, subscribeState } from '../../state.js';
import { formatCurrency, formatDate, getCategoryIcon, getCategoryColor } from '../../utils.js';
import { navigateTo } from '../../router.js';

let categoryChartInstance = null;

export function initView() {
    renderView();
    subscribeState(() => {
        if (document.getElementById('page-dashboard')?.classList.contains('active')) {
            renderView();
        }
    });

    const periodSelect = document.getElementById('chart-period');
    const dateStartInput = document.getElementById('chart-date-start');
    const dateEndInput = document.getElementById('chart-date-end');
    const btnViewAll = document.getElementById('btn-view-all-tx');

    if (periodSelect) periodSelect.addEventListener('change', generateCategoryChart);
    if (dateStartInput) dateStartInput.addEventListener('change', generateCategoryChart);
    if (dateEndInput) dateEndInput.addEventListener('change', generateCategoryChart);
    if (btnViewAll) {
        btnViewAll.addEventListener('click', (e) => {
            e.preventDefault();
            navigateTo('page-transacoes');
        });
    }
}

export function renderView() {
    updateSummaryCards();
    renderRecentTransactions();
    generateCategoryChart();
}

function updateSummaryCards() {
    let totalBalance = state.banksList.reduce((acc, bank) => acc + (bank.balance || 0), 0);

    state.banksList.forEach(bank => {
        const bankTransactions = state.transactions.filter(t => t.paymentMethod === bank.id);
        const revenue = bankTransactions.filter(t => t.type === 'income').reduce((acc, t) => acc + t.amount, 0);
        const expenses = bankTransactions.filter(t => t.type === 'expense').reduce((acc, t) => acc + t.amount, 0);
        totalBalance += revenue - expenses;
    });

    const totalBalanceEl = document.getElementById('total-balance');
    if (totalBalanceEl) {
        totalBalanceEl.textContent = formatCurrency(totalBalance);
        totalBalanceEl.style.color = totalBalance < 0 ? 'var(--danger)' : 'var(--text-main)';
    }

    const currentMonth = new Date().toISOString().slice(0, 7);
    let cardInvoiceTotal = 0;
    let cardCount = 0;

    state.cardsList.forEach(c => {
        const spent = state.transactions
            .filter(t => t.paymentMethod === c.id && t.date && t.date.startsWith(currentMonth))
            .reduce((acc, t) => acc + (t.type === 'expense' ? t.amount : -t.amount), 0);

        if (spent > 0) {
            cardInvoiceTotal += spent;
            cardCount++;
        }
    });

    const invoiceEl = document.getElementById('total-card-invoice');
    const detailEl = document.getElementById('card-invoice-detail');

    if (invoiceEl) {
        invoiceEl.textContent = formatCurrency(cardInvoiceTotal);
        invoiceEl.style.color = cardInvoiceTotal > 0 ? 'var(--danger)' : 'var(--text-muted)';
    }

    if (detailEl) {
        if (cardCount > 0) {
            detailEl.textContent = `Em ${cardCount} cartão(ões) no mês atual`;
        } else {
            detailEl.textContent = 'Nenhum gasto no cartão este mês';
        }
    }
}

function renderRecentTransactions() {
    const container = document.getElementById('transaction-list-recent');
    if (!container) return;

    container.innerHTML = '';
    const recent = state.transactions.slice(0, 5);

    if (recent.length === 0) {
        container.innerHTML = `<div class="empty-state"><i class="fa-solid fa-receipt"></i><p>Nenhuma transação recente.</p></div>`;
        return;
    }

    recent.forEach(t => {
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
            </div>`;
    });
}

export function generateCategoryChart() {
    const canvas = document.getElementById('category-chart');
    if (!canvas || typeof Chart === 'undefined') return;

    const periodSelect = document.getElementById('chart-period');
    const dateStartInput = document.getElementById('chart-date-start');
    const dateEndInput = document.getElementById('chart-date-end');

    const period = periodSelect ? periodSelect.value : '30';
    let filteredTxs = state.transactions.filter(t => t.type === 'expense');

    const today = new Date();
    if (period !== 'all') {
        const days = parseInt(period);
        const startDate = new Date();
        startDate.setDate(today.getDate() - days);
        const startDateStr = startDate.toISOString().slice(0, 10);
        filteredTxs = filteredTxs.filter(t => t.date >= startDateStr);
    }

    if (dateStartInput && dateStartInput.value) {
        filteredTxs = filteredTxs.filter(t => t.date >= dateStartInput.value);
    }
    if (dateEndInput && dateEndInput.value) {
        filteredTxs = filteredTxs.filter(t => t.date <= dateEndInput.value);
    }

    const categoriesTotals = {};
    filteredTxs.forEach(t => {
        const cat = t.category || 'Outros';
        categoriesTotals[cat] = (categoriesTotals[cat] || 0) + t.amount;
    });

    const labels = Object.keys(categoriesTotals);
    const data = Object.values(categoriesTotals);
    const backgroundColors = labels.map(getCategoryColor);

    if (categoryChartInstance) {
        categoryChartInstance.destroy();
    }

    if (labels.length === 0) {
        const ctx = canvas.getContext('2d');
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        const legend = document.getElementById('chart-legend');
        if (legend) legend.innerHTML = '<p style="color: var(--text-muted); text-align: center; font-size: 0.85rem;">Nenhuma despesa no período.</p>';
        return;
    }

    categoryChartInstance = new Chart(canvas, {
        type: 'doughnut',
        data: {
            labels: labels,
            datasets: [{
                data: data,
                backgroundColor: backgroundColors,
                borderWidth: 2,
                borderColor: 'var(--bg-card)'
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: { display: false }
            }
        }
    });

    const legendEl = document.getElementById('chart-legend');
    if (legendEl) {
        const total = data.reduce((a, b) => a + b, 0);
        legendEl.innerHTML = labels.map((l, idx) => {
            const val = data[idx];
            const pct = total > 0 ? ((val / total) * 100).toFixed(1) : 0;
            return `
                <div class="legend-item" style="display:flex; align-items:center; justify-space-between; width: 100%; font-size: 0.8rem; margin-top: 4px;">
                    <span style="display:flex; align-items:center; gap: 6px;">
                        <span style="width: 10px; height: 10px; border-radius: 50%; background: ${backgroundColors[idx]}; display: inline-block;"></span>
                        ${l}
                    </span>
                    <strong>${formatCurrency(val)} (${pct}%)</strong>
                </div>
            `;
        }).join('');
    }
}

window.generateCategoryChart = generateCategoryChart;

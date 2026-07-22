/**
 * =============================================================================
 * CONTA COMIGO PRO — cartoes.js
 * Lógica da visão Meus Cartões (com Extrato Detalhado de Faturas e Filtros)
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

    if (state.expandedCardId) {
        const expandedCard = state.cardsList.find(c => c.id === state.expandedCardId);
        if (expandedCard) {
            renderExpandedCard(expandedCard, grid);
            return;
        } else {
            state.expandedCardId = null;
        }
    }

    renderCardsGrid(grid);
}

function renderCardsGrid(grid) {
    const currentMonth = new Date().toISOString().slice(0, 7);

    state.cardsList.forEach(c => {
        const spentOnCard = state.transactions
            .filter(t => t.paymentMethod === c.id && t.date && t.date.startsWith(currentMonth))
            .reduce((acc, t) => acc + (t.type === 'expense' ? t.amount : -t.amount), 0);

        const available = c.limit - Math.max(spentOnCard, 0);

        grid.innerHTML += `
            <div class="card credit-card-card" style="padding: 16px; border-top: 4px solid var(--primary); position: relative; cursor: pointer;" onclick="window.toggleCardExtract('${c.id}', event)">
                <button class="btn-icon" style="position: absolute; right: 40px; top: 8px;" onclick="event.stopPropagation(); window.editCard('${c.id}')" title="Editar Cartão"><i class="fa-solid fa-pen" style="font-size:0.9rem;"></i></button>
                <button class="btn-icon" style="position: absolute; right: 8px; top: 8px;" onclick="event.stopPropagation(); window.deleteCard('${c.id}')" title="Excluir Cartão"><i class="fa-solid fa-trash" style="font-size:0.9rem;"></i></button>
                
                <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom: 12px;">
                    <div style="font-weight: 600; font-size: 1.1rem; display:flex; align-items:center; gap:8px;">
                        <i class="fa-solid fa-credit-card" style="color: var(--primary)"></i> ${c.nickname}
                    </div>
                </div>
                <p style="color: var(--text-muted); font-size: 0.85rem; margin-bottom: 8px;">Instituição: <strong>${c.bank}</strong></p>
                
                <div style="margin-bottom: 8px;">
                    <span style="color: var(--text-muted); font-size: 0.8rem; display:block;">Fatura Estimada (Mês ${currentMonth.slice(5)})</span>
                    <span style="font-weight: 700; font-size: 1.2rem; color: var(--danger);">${formatCurrency(Math.max(spentOnCard, 0))}</span>
                </div>
                
                <div style="display:flex; justify-content:space-between; font-size: 0.8rem; color: var(--text-muted); margin-bottom: 12px;">
                    <span>Limite: ${formatCurrency(c.limit)}</span>
                    <span>Disponível: ${formatCurrency(available)}</span>
                </div>
                
                <div style="display:flex; gap: 8px;">
                    <button class="btn btn-outline w-100" onclick="event.stopPropagation(); window.toggleCardExtract('${c.id}')">
                        <i class="fa-solid fa-list-check"></i> Ver Extrato / Fatura
                    </button>
                </div>
            </div>
        `;
    });
}

function renderExpandedCard(c, grid) {
    const today = new Date();
    const currentMonth = today.toISOString().slice(0, 7);

    const savedSearch = state.currentCardFilter.id === c.id ? state.currentCardFilter.search : '';
    const savedStart = state.currentCardFilter.id === c.id ? state.currentCardFilter.startDate : '';
    const savedEnd = state.currentCardFilter.id === c.id ? state.currentCardFilter.endDate : '';
    const savedMonth = state.currentCardFilter.id === c.id ? state.currentCardFilter.month : currentMonth;

    grid.innerHTML = `
        <div class="card w-100" style="grid-column: 1/-1; border-top: 4px solid var(--primary); padding: 20px; margin-bottom: 16px;">
            <div style="display: flex; align-items: center; gap: 12px; margin-bottom: 16px; flex-wrap: wrap;">
                <button class="btn btn-secondary" onclick="window.closeCardExtract()" style="padding: 6px 12px; font-size: 0.85rem; display: flex; align-items: center; gap: 6px;">
                    <i class="fa-solid fa-arrow-left"></i> Voltar
                </button>
                <span style="font-size: 0.85rem; color: var(--text-muted);">Voltar para a lista de cartões</span>
                <div style="flex: 1;"></div>
                <button class="btn btn-primary" id="btn-pay-invoice-${c.id}" style="display: none; padding: 6px 12px; font-size: 0.85rem;">
                    <i class="fa-solid fa-money-check-dollar"></i> Pagar Fatura
                </button>
                <button class="btn btn-outline" onclick="window.generateCardReport('${c.id}')" style="padding: 6px 12px; font-size: 0.85rem;">
                    <i class="fa-solid fa-print"></i> Imprimir Extrato
                </button>
            </div>
            
            <div style="display:flex; justify-content:space-between; align-items:center; flex-wrap: wrap; gap: 12px; margin-bottom: 16px;">
                <div style="display:flex; gap: 16px; align-items:center;">
                    <i class="fa-solid fa-credit-card" style="font-size: 2.2rem; color: var(--primary)"></i>
                    <div>
                        <h3 style="margin: 0; font-size: 1.3rem;">${c.nickname} <span style="font-size: 0.9rem; font-weight: normal; color: var(--text-muted);">(${c.bank})</span></h3>
                        <p style="color: var(--text-muted); margin: 2px 0 0 0; font-size: 0.85rem;">
                            Fechamento: Dia <strong>${c.closingDay}</strong> | Vencimento: Dia <strong>${c.dueDay}</strong>
                        </p>
                    </div>
                </div>
                <div style="text-align: right;">
                    <p style="color: var(--text-muted); margin: 0; font-size: 0.85rem;">Limite Total</p>
                    <h3 style="margin: 0; color: var(--text-main);">${formatCurrency(c.limit)}</h3>
                </div>
            </div>

            <!-- Filtros de Extrato de Cartão com Navegação por Setas -->
            <div class="filter-container" style="background: var(--bg-body); padding: 12px; border-radius: 8px; border: 1px solid var(--border); margin-bottom: 16px;">
                <div style="display: flex; gap: 10px; align-items: center; flex-wrap: wrap;">
                    <div style="display: flex; align-items: center; gap: 4px;">
                        <label for="cc-filter-month" style="font-size: 0.85rem; color: var(--text-muted); font-weight: 500; margin-right: 4px;">Fatura:</label>
                        <button type="button" class="btn-icon" onclick="window.navigateCardInvoiceMonth('${c.id}', -1)" title="Mês Anterior" style="padding: 4px 8px; border: 1px solid var(--border); border-radius: 6px; background: var(--bg-card); cursor: pointer;">
                            <i class="fa-solid fa-chevron-left"></i>
                        </button>
                        <input type="month" id="cc-filter-month" class="form-input" style="width: 140px; padding: 6px 8px; font-size: 0.85rem;" value="${savedMonth}" onchange="window.filterCardExtract('${c.id}')">
                        <button type="button" class="btn-icon" onclick="window.navigateCardInvoiceMonth('${c.id}', 1)" title="Próximo Mês" style="padding: 4px 8px; border: 1px solid var(--border); border-radius: 6px; background: var(--bg-card); cursor: pointer;">
                            <i class="fa-solid fa-chevron-right"></i>
                        </button>
                    </div>
                    <input type="text" id="cc-filter-search" class="form-input" placeholder="Buscar no extrato..." value="${savedSearch}" oninput="window.filterCardExtract('${c.id}')" style="flex: 1; min-width: 160px; padding: 6px 10px; font-size: 0.85rem;">
                    <input type="date" id="cc-filter-start" class="form-input" title="Data Inicial" value="${savedStart}" onchange="window.filterCardExtract('${c.id}')" style="width: 130px; padding: 6px 10px; font-size: 0.85rem;">
                    <span style="color: var(--text-muted); font-size: 0.85rem;">até</span>
                    <input type="date" id="cc-filter-end" class="form-input" title="Data Final" value="${savedEnd}" onchange="window.filterCardExtract('${c.id}')" style="width: 130px; padding: 6px 10px; font-size: 0.85rem;">
                    <button class="btn btn-outline" onclick="window.clearCardFilters('${c.id}')" style="padding: 6px 10px; font-size: 0.85rem;">
                        <i class="fa-solid fa-eraser"></i>
                    </button>
                </div>
            </div>

            <!-- Lista de Transações do Cartão -->
            <div class="transactions-list" id="inline-card-transactions"></div>
        </div>
    `;

    setTimeout(() => window.filterCardExtract(c.id), 50);
}

window.toggleCardExtract = (id, e) => {
    if (e && e.target.closest('button')) return;
    state.expandedCardId = state.expandedCardId === id ? null : id;
    renderView();
};

window.closeCardExtract = () => {
    state.expandedCardId = null;
    renderView();
};

window.clearCardFilters = (id) => {
    const searchInput = document.getElementById('cc-filter-search');
    const startInput = document.getElementById('cc-filter-start');
    const endInput = document.getElementById('cc-filter-end');

    if (searchInput) searchInput.value = '';
    if (startInput) startInput.value = '';
    if (endInput) endInput.value = '';

    window.filterCardExtract(id);
};

window.navigateCardInvoiceMonth = (id, offset) => {
    const input = document.getElementById('cc-filter-month');
    if (!input) return;
    let val = input.value || new Date().toISOString().slice(0, 7);
    let [year, month] = val.split('-').map(Number);

    month += offset;
    if (month > 12) {
        month = 1;
        year += 1;
    } else if (month < 1) {
        month = 12;
        year -= 1;
    }

    input.value = `${year}-${String(month).padStart(2, '0')}`;
    window.filterCardExtract(id);
};

export function getInvoiceMonth(transactionDate, closingDay) {
    if (!transactionDate) return "";
    const d = new Date(transactionDate + "T00:00:00");
    let year = d.getFullYear();
    let month = d.getMonth() + 1;
    let day = d.getDate();

    if (day >= closingDay) {
        month++;
        if (month > 12) {
            month = 1;
            year++;
        }
    }
    return `${year}-${month.toString().padStart(2, '0')}`;
}
window.getInvoiceMonth = getInvoiceMonth;

window.filterCardExtract = (id) => {
    const listNode = document.getElementById('inline-card-transactions');
    if (!listNode) return;

    const c = state.cardsList.find(x => x.id === id);
    if (!c) return;

    state.currentCardFilter.id = id;
    state.currentCardFilter.search = document.getElementById('cc-filter-search')?.value || '';
    state.currentCardFilter.startDate = document.getElementById('cc-filter-start')?.value || '';
    state.currentCardFilter.endDate = document.getElementById('cc-filter-end')?.value || '';
    state.currentCardFilter.month = document.getElementById('cc-filter-month')?.value || '';

    const filterSearch = state.currentCardFilter.search.toLowerCase();
    const dStart = state.currentCardFilter.startDate;
    const dEnd = state.currentCardFilter.endDate;
    const filterMonth = state.currentCardFilter.month;

    let res = state.transactions.filter(t => t.paymentMethod === id);

    if (filterSearch) {
        res = res.filter(t => t.description.toLowerCase().includes(filterSearch) || t.category.toLowerCase().includes(filterSearch));
    }
    if (dStart) {
        res = res.filter(t => t.date >= dStart);
    }
    if (dEnd) {
        res = res.filter(t => t.date <= dEnd);
    }
    if (filterMonth) {
        res = res.filter(t => window.getInvoiceMonth(t.date, c.closingDay) === filterMonth);
    }

    const monthExpenses = res.filter(t => t.type === 'expense').reduce((acc, t) => acc + t.amount, 0);
    const monthIncomes = res.filter(t => t.type === 'income').reduce((acc, t) => acc + t.amount, 0);
    const monthNet = monthExpenses - monthIncomes;

    let accExpenses = 0;
    let accIncomes = 0;
    state.transactions.filter(t => t.paymentMethod === id).forEach(t => {
        if (t.type === 'income') {
            accIncomes += t.amount;
        } else {
            const tMonth = window.getInvoiceMonth(t.date, c.closingDay);
            if (filterMonth) {
                if (tMonth <= filterMonth) accExpenses += t.amount;
            } else {
                accExpenses += t.amount;
            }
        }
    });

    const remainingToPay = accExpenses - accIncomes;
    const isPaid = filterMonth && remainingToPay <= 0 && accExpenses > 0;
    const tagHtml = isPaid
        ? `<span style="background: var(--success); color: white; padding: 4px 8px; border-radius: 4px; font-size: 0.8rem; margin-left: 12px;"><i class="fa-solid fa-check-double"></i> Fatura Paga</span>`
        : (filterMonth && accExpenses > 0 ? `<span style="background: var(--warning); color: white; padding: 4px 8px; border-radius: 4px; font-size: 0.8rem; margin-left: 12px;"><i class="fa-solid fa-clock"></i> Em Aberto</span>` : '');

    renderCardTransactionsList(res, listNode);

    if (res.length > 0 || accExpenses > 0) {
        const title = filterMonth ? `Resumo da Fatura (${filterMonth})${tagHtml}` : `Resumo Filtrado:`;
        const monthDisplay = filterMonth ? `Mês: ${formatMonthYear(filterMonth)}` : 'Sem filtro de mês';

        let displayHtml = `
            <div style="padding: 16px; margin-bottom: 16px; background: var(--bg-body); border-radius: 8px; border: 1px solid var(--border);">
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px;">
                    <span style="font-weight: 600; font-size: 1rem;">${title}</span>
                    <span style="font-size: 0.8rem; color: var(--text-muted);">${monthDisplay}</span>
                </div>
                <div style="display: flex; justify-content: space-between; align-items: center; font-size: 0.85rem; color: var(--text-muted); margin-bottom: 4px;">
                    <span>Total de lançamentos no período:</span>
                    <span style="color: ${monthNet > 0 ? 'var(--danger)' : 'var(--success)'}; font-weight: 600;">${formatCurrency(Math.abs(monthNet))}</span>
                </div>
                ${filterMonth ? `
                <div style="display: flex; justify-content: space-between; align-items: center; font-size: 1.05rem; font-weight: 700; margin-top: 8px; padding-top: 8px; border-top: 1px dashed var(--border);">
                    <span>Restante a Pagar (Fatura):</span>
                    <span style="color: ${remainingToPay > 0 ? 'var(--danger)' : 'var(--success)'};">${formatCurrency(Math.max(0, remainingToPay))}</span>
                </div>
                ` : ''}
            </div>
        `;
        listNode.insertAdjacentHTML('afterbegin', displayHtml);
    }

    const btnPay = document.getElementById(`btn-pay-invoice-${id}`);
    if (btnPay) {
        if (filterMonth && remainingToPay > 0) {
            btnPay.style.display = 'flex';
            btnPay.onclick = () => {
                if (window.launchCardFatura) {
                    window.launchCardFatura(id, remainingToPay);
                } else {
                    alert(`Fatura a pagar: ${formatCurrency(remainingToPay)}`);
                }
            };
        } else {
            btnPay.style.display = 'none';
        }
    }
};

function renderCardTransactionsList(txs, container) {
    if (!container) return;
    container.innerHTML = '';
    if (txs.length === 0) {
        container.innerHTML = `<div class="empty-state" style="padding: 24px; text-align: center;"><i class="fa-solid fa-receipt"></i><p>Nenhuma transação nesta fatura.</p></div>`;
        return;
    }

    txs.forEach(t => {
        const isInc = t.type === 'income';
        const sign = isInc ? '+' : '-';

        container.innerHTML += `
            <div class="transaction-item">
                <div class="tx-left">
                    <div class="tx-icon ${isInc ? 'income' : 'expense'}"><i class="fa-solid ${isInc ? 'fa-arrow-up' : 'fa-arrow-down'}"></i></div>
                    <div class="tx-details">
                        <p class="tx-title">${t.description}</p>
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

function formatMonthYear(month) {
    if (!month) return '';
    const [year, monthNum] = month.split('-');
    const months = ['Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho', 'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'];
    return `${months[parseInt(monthNum) - 1]} ${year}`;
}

window.generateCardReport = (id) => {
    const c = state.cardsList.find(x => x.id === id);
    if (!c) return;

    const filterMonth = document.getElementById('cc-filter-month')?.value;
    if (!filterMonth) {
        alert("Por favor, selecione um mês de fatura.");
        return;
    }

    let res = state.transactions.filter(t => t.paymentMethod === id);
    res = res.filter(t => window.getInvoiceMonth(t.date, c.closingDay) === filterMonth);
    res.sort((a, b) => new Date(a.date) - new Date(b.date));

    let accExpenses = 0;
    let accIncomes = 0;
    state.transactions.filter(t => t.paymentMethod === id).forEach(t => {
        if (t.type === 'income') {
            accIncomes += t.amount;
        } else {
            const tMonth = window.getInvoiceMonth(t.date, c.closingDay);
            if (tMonth <= filterMonth) accExpenses += t.amount;
        }
    });

    const remainingToPay = accExpenses - accIncomes;
    const isPaid = remainingToPay <= 0 && accExpenses > 0;
    const statusText = isPaid ? "Fatura Paga" : "Em Aberto";

    const [year, month] = filterMonth.split('-');
    const invoiceTitle = `Fatura: ${month}/${year}`;

    const printWindow = window.open('', '_blank');
    if (!printWindow) return alert('Por favor, permita pop-ups para gerar o relatório.');

    let html = `
    <html>
    <head>
        <title>Relatório de Fatura - ${c.nickname}</title>
        <style>
            @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');
            body { font-family: 'Inter', sans-serif; color: #1e293b; padding: 40px; }
            .header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 40px; border-bottom: 2px solid #e2e8f0; padding-bottom: 20px; }
            .card-details h2 { margin: 0 0 5px 0; color: #0f172a; }
            .card-details p { margin: 2px 0; color: #64748b; font-size: 0.95rem; }
            .invoice-summary { background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 20px; margin-bottom: 30px; display: flex; justify-content: space-between; align-items: center; }
            .invoice-summary h3 { margin: 0; font-size: 1.5rem; color: #0f172a; }
            .invoice-summary p { margin: 4px 0 0 0; color: #64748b; }
            .status-tag { margin-top: 8px; display: inline-block; padding: 4px 8px; border-radius: 4px; font-size: 0.85rem; font-weight: 600; background: ${isPaid ? '#dcfce7' : '#fef9c3'}; color: ${isPaid ? '#166534' : '#854d0e'}; border: 1px solid ${isPaid ? '#bbf7d0' : '#fef08a'}; }
            .total { font-size: 1.8rem; font-weight: 700; color: ${isPaid ? '#10b981' : '#ef4444'}; text-align: right; }
            table { width: 100%; border-collapse: collapse; margin-bottom: 40px; }
            th, td { padding: 12px 15px; text-align: left; border-bottom: 1px solid #e2e8f0; }
            th { background: #f1f5f9; font-weight: 600; color: #475569; }
            .amount { text-align: right; font-weight: 500; }
            .expense { color: #ef4444; }
            .income { color: #10b981; }
            .footer { text-align: center; margin-top: 50px; color: #94a3b8; font-size: 0.85rem; border-top: 1px solid #e2e8f0; padding-top: 20px; }
        </style>
    </head>
    <body>
        <div class="header">
            <div class="card-details">
                <h2>Extrato de Cartão de Crédito</h2>
                <p><strong>Cartão:</strong> ${c.nickname}</p>
                <p><strong>Banco:</strong> ${c.bank}</p>
                <p><strong>Fechamento:</strong> Dia ${c.closingDay}</p>
                <p><strong>Vencimento:</strong> Dia ${c.dueDay}</p>
            </div>
        </div>

        <div class="invoice-summary">
            <div>
                <h3>${invoiceTitle}</h3>
                <span class="status-tag">${statusText}</span>
            </div>
            <div class="total">
                <div style="font-size: 0.9rem; color: #64748b; font-weight: 400; margin-bottom: 4px;">Restante a Pagar</div>
                ${formatCurrency(Math.max(0, remainingToPay))}
            </div>
        </div>

        <table>
            <thead>
                <tr>
                    <th>Data</th>
                    <th>Descrição</th>
                    <th>Categoria</th>
                    <th style="text-align: right;">Valor</th>
                </tr>
            </thead>
            <tbody>
                ${res.length > 0 ? res.map(t => `
                    <tr>
                        <td>${formatDate(t.date)}</td>
                        <td>${t.description}</td>
                        <td>${t.category}</td>
                        <td style="text-align: right; color: ${t.type === 'income' ? '#10b981' : '#ef4444'}; font-weight: 600;">
                            ${t.type === 'income' ? '+' : '-'} ${formatCurrency(t.amount)}
                        </td>
                    </tr>
                `).join('') : '<tr><td colspan="4" style="text-align:center; padding: 20px;">Nenhuma transação nesta fatura.</td></tr>'}
            </tbody>
        </table>

        <div class="footer">Relatório gerado pelo Conta Comigo PRO</div>
        <script>window.onload = function() { setTimeout(function() { window.print(); }, 500); }</script>
    </body>
    </html>
    `;

    printWindow.document.write(html);
    printWindow.document.close();
};

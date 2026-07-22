/**
 * =============================================================================
 * CONTA COMIGO PRO — transacoes.js
 * Lógica da visão Transações (Histórico Completo Otimizado com Paginação e Multi-Filtro)
 * =============================================================================
 */

import { state, subscribeState } from '../../state.js';
import { formatCurrency, formatDate, getCategoryIcon } from '../../utils.js';

let currentPage = 1;
const itemsPerPage = 25;
let selectedPaymentMethods = [];

export function initView() {
    setupFilterEvents();
    renderView();
    subscribeState(() => {
        if (document.getElementById('page-transacoes')?.classList.contains('active')) {
            renderView();
        }
    });
}

export function renderView() {
    populateCategoryFilter();
    populatePaymentMethodFilter();
    applyTransacoesFilters();
}

function setupFilterEvents() {
    const filterSearch = document.getElementById('filter-search');
    const filterType = document.getElementById('filter-type');
    const filterDateStart = document.getElementById('filter-date-start');
    const filterDateEnd = document.getElementById('filter-date-end');
    const filterCategory = document.getElementById('filter-category');
    const btnClearFilters = document.getElementById('btn-clear-filters');

    const btnFilterPm = document.getElementById('btn-filter-pm');
    const dropdownFilterPm = document.getElementById('dropdown-filter-pm');

    const btnPrev = document.getElementById('btn-prev-page');
    const btnNext = document.getElementById('btn-next-page');

    if (filterSearch) filterSearch.addEventListener('input', () => { currentPage = 1; applyTransacoesFilters(); });
    if (filterType) filterType.addEventListener('change', () => { currentPage = 1; applyTransacoesFilters(); });
    if (filterDateStart) filterDateStart.addEventListener('change', () => { currentPage = 1; applyTransacoesFilters(); });
    if (filterDateEnd) filterDateEnd.addEventListener('change', () => { currentPage = 1; applyTransacoesFilters(); });
    if (filterCategory) filterCategory.addEventListener('change', () => { currentPage = 1; applyTransacoesFilters(); });

    if (btnFilterPm && dropdownFilterPm) {
        btnFilterPm.addEventListener('click', (e) => {
            e.stopPropagation();
            const isVisible = dropdownFilterPm.style.display === 'block';
            dropdownFilterPm.style.display = isVisible ? 'none' : 'block';
        });

        document.addEventListener('click', (e) => {
            if (!dropdownFilterPm.contains(e.target) && !btnFilterPm.contains(e.target)) {
                dropdownFilterPm.style.display = 'none';
            }
        });
    }

    if (btnPrev) {
        btnPrev.addEventListener('click', () => {
            if (currentPage > 1) {
                currentPage--;
                applyTransacoesFilters();
                window.scrollTo({ top: 0, behavior: 'smooth' });
            }
        });
    }

    if (btnNext) {
        btnNext.addEventListener('click', () => {
            currentPage++;
            applyTransacoesFilters();
            window.scrollTo({ top: 0, behavior: 'smooth' });
        });
    }

    if (btnClearFilters) {
        btnClearFilters.addEventListener('click', () => {
            if (filterSearch) filterSearch.value = '';
            if (filterType) filterType.value = 'all';
            if (filterCategory) filterCategory.value = 'all';
            if (filterDateStart) filterDateStart.value = '';
            if (filterDateEnd) filterDateEnd.value = '';

            selectedPaymentMethods = [];
            const checkboxes = document.querySelectorAll('.pm-filter-checkbox');
            checkboxes.forEach(cb => cb.checked = false);

            updatePmFilterLabel();
            currentPage = 1;
            applyTransacoesFilters();
        });
    }
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

function populatePaymentMethodFilter() {
    const dropdown = document.getElementById('dropdown-filter-pm');
    if (!dropdown) return;

    let html = '';

    if (state.banksList.length > 0) {
        html += `<div style="font-size: 0.75rem; font-weight: bold; color: var(--text-muted); text-transform: uppercase; margin-bottom: 6px;">Bancos / Contas</div>`;
        state.banksList.forEach(b => {
            const isChecked = selectedPaymentMethods.includes(b.id) ? 'checked' : '';
            html += `
                <label style="display: flex; align-items: center; gap: 8px; font-size: 0.85rem; padding: 4px 6px; cursor: pointer; border-radius: 4px;" class="pm-filter-item">
                    <input type="checkbox" value="${b.id}" class="pm-filter-checkbox" ${isChecked} style="cursor: pointer;">
                    <span>🏦 ${b.name}</span>
                </label>
            `;
        });
    }

    if (state.cardsList.length > 0) {
        if (state.banksList.length > 0) {
            html += `<div style="border-top: 1px solid var(--border); margin: 6px 0;"></div>`;
        }
        html += `<div style="font-size: 0.75rem; font-weight: bold; color: var(--text-muted); text-transform: uppercase; margin-bottom: 6px;">Cartões de Crédito</div>`;
        state.cardsList.forEach(c => {
            const isChecked = selectedPaymentMethods.includes(c.id) ? 'checked' : '';
            html += `
                <label style="display: flex; align-items: center; gap: 8px; font-size: 0.85rem; padding: 4px 6px; cursor: pointer; border-radius: 4px;" class="pm-filter-item">
                    <input type="checkbox" value="${c.id}" class="pm-filter-checkbox" ${isChecked} style="cursor: pointer;">
                    <span>💳 ${c.nickname}</span>
                </label>
            `;
        });
    }

    if (!html) {
        html = `<div style="font-size: 0.85rem; color: var(--text-muted); text-align: center; padding: 8px;">Nenhuma conta ou cartão cadastrado.</div>`;
    }

    dropdown.innerHTML = html;

    // Adiciona listener para cada checkbox
    dropdown.querySelectorAll('.pm-filter-checkbox').forEach(cb => {
        cb.addEventListener('change', () => {
            selectedPaymentMethods = Array.from(dropdown.querySelectorAll('.pm-filter-checkbox:checked')).map(c => c.value);
            updatePmFilterLabel();
            currentPage = 1;
            applyTransacoesFilters();
        });
    });
}

function updatePmFilterLabel() {
    const label = document.getElementById('label-filter-pm');
    if (!label) return;

    const count = selectedPaymentMethods.length;
    if (count === 0) {
        label.innerHTML = `<i class="fa-solid fa-building-columns" style="color: var(--primary);"></i> Todos os Meios`;
    } else if (count === 1) {
        const b = state.banksList.find(x => x.id === selectedPaymentMethods[0]);
        const c = state.cardsList.find(x => x.id === selectedPaymentMethods[0]);
        const name = b ? b.name : (c ? c.nickname : '1 Selecionado');
        label.innerHTML = `<i class="fa-solid fa-check" style="color: var(--primary);"></i> ${name}`;
    } else {
        label.innerHTML = `<i class="fa-solid fa-check-double" style="color: var(--primary);"></i> ${count} Selecionados`;
    }
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

    const filteredResults = state.transactions.filter(t => {
        const mStr = (t.description || '').toLowerCase().includes(str);
        const mType = type === 'all' || t.type === type;
        const mCat = category === 'all' || t.category === category;
        const mDate = (!dateStart || t.date >= dateStart) && (!dateEnd || t.date <= dateEnd);

        // Filtro Multi-Select de Meio de Pagamento (Banco/Cartão)
        const mPm = selectedPaymentMethods.length === 0 || selectedPaymentMethods.includes(t.paymentMethod);

        return mStr && mType && mCat && mDate && mPm;
    });

    // Saldo Total Filtrado
    const fTot = filteredResults.reduce((acc, t) => acc + (t.type === 'income' ? t.amount : -t.amount), 0);
    const fBalanceEl = document.getElementById('filtered-balance');

    if (fBalanceEl) {
        fBalanceEl.textContent = formatCurrency(fTot);
        fBalanceEl.style.color = fTot < 0 ? 'var(--danger)' : 'var(--text-main)';
    }

    // Lógica de Paginação (25 itens por página)
    const totalItems = filteredResults.length;
    const totalPages = Math.ceil(totalItems / itemsPerPage) || 1;

    if (currentPage > totalPages) currentPage = totalPages;
    if (currentPage < 1) currentPage = 1;

    const startIndex = (currentPage - 1) * itemsPerPage;
    const pageTransactions = filteredResults.slice(startIndex, startIndex + itemsPerPage);

    renderTransactionsList(pageTransactions);

    // Atualização da UI de Paginação
    const btnPrev = document.getElementById('btn-prev-page');
    const btnNext = document.getElementById('btn-next-page');
    const pageInfo = document.getElementById('pagination-info');

    if (btnPrev) btnPrev.disabled = currentPage === 1;
    if (btnNext) btnNext.disabled = currentPage >= totalPages || totalItems === 0;

    if (pageInfo) {
        if (totalItems === 0) {
            pageInfo.textContent = 'Nenhuma transação';
        } else {
            pageInfo.textContent = `Página ${currentPage} de ${totalPages} (${totalItems} transações)`;
        }
    }
}

function renderTransactionsList(txs) {
    const container = document.getElementById('transaction-list-complete');
    if (!container) return;

    container.innerHTML = '';
    if (txs.length === 0) {
        container.innerHTML = `<div class="empty-state" style="padding: 32px; text-align: center;"><i class="fa-solid fa-receipt"></i><p>Nenhuma transação encontrada.</p></div>`;
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

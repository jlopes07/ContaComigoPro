/**
 * =============================================================================
 * CONTA COMIGO PRO — modals.js
 * Gerenciamento central de modais e formulários
 * =============================================================================
 */

import { auth, db, transactionsCollection, goalsCollection, categoriesCollection, cardsCollection, fixedTransactionsCollection, banksCollection, investmentsCollection } from './firebase.js';
import { state, notifyStateChange } from './state.js';
import { parseCurrencyInput, formatCurrency, showMessage } from './utils.js';

export function initModals() {
    setupModalEvents();
    setupFormListeners();
    setupBulkAndPdfEvents();
}

function setupModalEvents() {
    document.querySelectorAll('.close-modal, [id^="btn-cancel-"]').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const modal = e.target.closest('.modal-overlay');
            if (modal) modal.classList.remove('active');
        });
    });

    window.addEventListener('click', (e) => {
        if (e.target.classList.contains('modal-overlay')) {
            e.target.classList.remove('active');
        }
    });

    // Top Header Buttons to Open Modals
    const btnNewTx = document.getElementById('btn-new-transaction');
    if (btnNewTx) {
        btnNewTx.addEventListener('click', () => {
            state.editingTransactionId = null;
            state.editingGroupId = null;
            state.launchingFixedId = null;
            state.launchingCardId = null;

            const formTx = document.getElementById('form-transaction');
            if (formTx) formTx.reset();

            const dateInput = document.getElementById('date');
            if (dateInput) dateInput.value = new Date().toISOString().slice(0, 10);

            const title = document.querySelector('#transaction-modal h2');
            if (title) title.textContent = "Nova Transação";

            populatePaymentMethods();
            populateCategorySelects();
            populateGoalsSelect();

            const modal = document.getElementById('transaction-modal');
            if (modal) modal.classList.add('active');
        });
    }

    const btnNewGoal = document.getElementById('btn-new-goal');
    if (btnNewGoal) {
        btnNewGoal.addEventListener('click', () => {
            const form = document.getElementById('form-goal');
            if (form) form.reset();
            const modal = document.getElementById('goal-modal');
            if (modal) modal.classList.add('active');
        });
    }

    const btnNewFixed = document.getElementById('btn-new-fixed-transaction');
    if (btnNewFixed) {
        btnNewFixed.addEventListener('click', () => {
            state.editingFixedId = null;
            const form = document.getElementById('form-fixed-transaction');
            if (form) form.reset();

            const dayInput = document.getElementById('fixed-day');
            if (dayInput) dayInput.value = new Date().getDate();

            const title = document.querySelector('#fixed-transaction-modal h2');
            if (title) title.textContent = "Nova Transação Fixa";

            populateCategorySelects();

            const modal = document.getElementById('fixed-transaction-modal');
            if (modal) modal.classList.add('active');
        });
    }

    const btnNewCard = document.getElementById('btn-new-card');
    if (btnNewCard) {
        btnNewCard.addEventListener('click', () => {
            state.editingCardId = null;
            const form = document.getElementById('form-card');
            if (form) form.reset();

            const title = document.querySelector('#card-modal h2');
            if (title) title.textContent = "Novo Cartão de Crédito";

            const modal = document.getElementById('card-modal');
            if (modal) modal.classList.add('active');
        });
    }

    const btnNewBank = document.getElementById('btn-new-bank');
    if (btnNewBank) {
        btnNewBank.addEventListener('click', () => {
            const form = document.getElementById('form-bank');
            if (form) form.reset();
            const modal = document.getElementById('bank-modal');
            if (modal) modal.classList.add('active');
        });
    }
}

export function populatePaymentMethods() {
    const pmSelect = document.getElementById('payment-method');
    const fixedPmSelect = document.getElementById('fixed-payment-method');
    if (!pmSelect) return;

    let opts = '';

    if (state.banksList.length > 0) {
        opts += `<optgroup label="Bancos / Contas">`;
        state.banksList.forEach(b => {
            opts += `<option value="${b.id}">🏦 ${b.name}</option>`;
        });
        opts += `</optgroup>`;
    }

    if (state.cardsList.length > 0) {
        opts += `<optgroup label="Cartões de Crédito">`;
        state.cardsList.forEach(c => {
            opts += `<option value="${c.id}">💳 ${c.nickname} (${c.bank})</option>`;
        });
        opts += `</optgroup>`;
    }

    pmSelect.innerHTML = opts;
    if (fixedPmSelect) fixedPmSelect.innerHTML = opts;
}

export function populateCategorySelects() {
    const opts = state.categoriesList.map(c => `<option value="${c.name}">${c.name}</option>`).join('');
    const catSelect = document.getElementById('category');
    const fixedCatSelect = document.getElementById('fixed-category');
    const filterCatSelect = document.getElementById('filter-category');

    if (catSelect) catSelect.innerHTML = `<option value="" disabled selected>Selecione</option>` + opts;
    if (fixedCatSelect) fixedCatSelect.innerHTML = `<option value="" disabled selected>Selecione</option>` + opts;
    if (filterCatSelect) filterCatSelect.innerHTML = `<option value="all">Todas Categ.</option>` + opts;
}

export function populateGoalsSelect() {
    const select = document.getElementById('transaction-goal');
    if (!select) return;

    let options = '<option value="">Nenhuma</option>';
    state.goalsList.forEach(g => {
        const perc = g.targetValue > 0 ? ((g.currentValue / g.targetValue) * 100).toFixed(0) : 0;
        options += `<option value="${g.id}">${g.name} (${perc}%)</option>`;
    });

    select.innerHTML = options;
}

function setupFormListeners() {
    // Form Transação
    const formTx = document.getElementById('form-transaction');
    if (formTx) {
        formTx.addEventListener('submit', async (e) => {
            e.preventDefault();
            if (!state.currentUser) return;

            const type = document.querySelector('input[name="type"]:checked')?.value || 'expense';
            const description = document.getElementById('description')?.value.trim();
            const amount = parseCurrencyInput(document.getElementById('amount')?.value);
            const date = document.getElementById('date')?.value;
            const category = document.getElementById('category')?.value;
            const pm = document.getElementById('payment-method')?.value;
            const goalId = document.getElementById('transaction-goal')?.value || '';

            if (!description || isNaN(amount) || amount <= 0 || !date || !category || !pm) {
                alert('Preencha todos os campos obrigatórios!');
                return;
            }

            try {
                if (state.editingTransactionId) {
                    await transactionsCollection.doc(state.editingTransactionId).update({
                        userId: state.currentUser.uid,
                        type,
                        description,
                        amount,
                        date,
                        category,
                        paymentMethod: pm,
                        goalId
                    });
                } else {
                    await transactionsCollection.add({
                        userId: state.currentUser.uid,
                        type,
                        description,
                        amount,
                        date,
                        category,
                        paymentMethod: pm,
                        goalId,
                        createdAt: firebase.firestore.FieldValue.serverTimestamp()
                    });
                }

                document.getElementById('transaction-modal')?.classList.remove('active');
                formTx.reset();
                state.editingTransactionId = null;
                notifyStateChange('transaction-saved');
            } catch (err) {
                alert('Erro ao salvar transação: ' + err.message);
            }
        });
    }

    // Form Banco
    const formBank = document.getElementById('form-bank');
    if (formBank) {
        formBank.addEventListener('submit', async (e) => {
            e.preventDefault();
            if (!state.currentUser) return;

            const name = document.getElementById('bank-name')?.value.trim();
            const balance = parseCurrencyInput(document.getElementById('bank-balance')?.value);
            const color = document.getElementById('bank-color')?.value || '#0ea5e9';

            if (!name) return alert('Insira um nome válido para a conta!');

            try {
                await banksCollection.add({
                    userId: state.currentUser.uid,
                    name,
                    balance,
                    color,
                    createdAt: firebase.firestore.FieldValue.serverTimestamp()
                });
                document.getElementById('bank-modal')?.classList.remove('active');
                formBank.reset();
                notifyStateChange('bank-saved');
            } catch (err) {
                alert('Erro ao salvar conta: ' + err.message);
            }
        });
    }

    // Form Cartão
    const formCard = document.getElementById('form-card');
    if (formCard) {
        formCard.addEventListener('submit', async (e) => {
            e.preventDefault();
            if (!state.currentUser) return;

            const nickname = document.getElementById('card-nickname')?.value.trim();
            const bank = document.getElementById('card-bank')?.value.trim();
            const limit = parseCurrencyInput(document.getElementById('card-limit')?.value);
            const closingDay = parseInt(document.getElementById('card-closing')?.value);
            const dueDay = parseInt(document.getElementById('card-due')?.value);

            if (!nickname || !bank || isNaN(limit) || limit <= 0) return alert('Campos inválidos!');

            try {
                await cardsCollection.add({
                    userId: state.currentUser.uid,
                    nickname,
                    bank,
                    limit,
                    closingDay,
                    dueDay
                });
                document.getElementById('card-modal')?.classList.remove('active');
                formCard.reset();
                notifyStateChange('card-saved');
            } catch (err) {
                alert('Erro ao salvar cartão: ' + err.message);
            }
        });
    }

    // Form Meta
    const formGoal = document.getElementById('form-goal');
    if (formGoal) {
        formGoal.addEventListener('submit', async (e) => {
            e.preventDefault();
            if (!state.currentUser) return;

            const name = document.getElementById('goal-name')?.value.trim();
            const targetValue = parseCurrencyInput(document.getElementById('goal-target')?.value);
            const currentValue = parseCurrencyInput(document.getElementById('goal-current')?.value);

            if (!name || isNaN(targetValue) || targetValue <= 0) return alert('Campos inválidos!');

            try {
                await goalsCollection.add({
                    userId: state.currentUser.uid,
                    name,
                    targetValue,
                    currentValue,
                    createdAt: firebase.firestore.FieldValue.serverTimestamp()
                });
                document.getElementById('goal-modal')?.classList.remove('active');
                formGoal.reset();
                notifyStateChange('goal-saved');
            } catch (err) {
                alert('Erro ao salvar meta: ' + err.message);
            }
        });
    }
}

function setupBulkAndPdfEvents() {
    const tabSingle = document.getElementById('tab-tx-single');
    const tabBulk = document.getElementById('tab-tx-bulk');
    const tabPdf = document.getElementById('tab-tx-pdf');
    const singleTxContainer = document.getElementById('single-tx-container');
    const bulkTxContainer = document.getElementById('bulk-tx-container');
    const pdfTxContainer = document.getElementById('pdf-tx-container');

    if (!tabSingle || !tabBulk) return;

    tabSingle.addEventListener('click', () => {
        tabSingle.classList.add('active');
        tabBulk.classList.remove('active');
        if (tabPdf) tabPdf.classList.remove('active');

        if (singleTxContainer) singleTxContainer.style.display = 'block';
        if (bulkTxContainer) bulkTxContainer.style.display = 'none';
        if (pdfTxContainer) pdfTxContainer.style.display = 'none';
    });

    tabBulk.addEventListener('click', () => {
        tabBulk.classList.add('active');
        tabSingle.classList.remove('active');
        if (tabPdf) tabPdf.classList.remove('active');

        if (singleTxContainer) singleTxContainer.style.display = 'none';
        if (bulkTxContainer) bulkTxContainer.style.display = 'block';
        if (pdfTxContainer) pdfTxContainer.style.display = 'none';
    });

    if (tabPdf) {
        tabPdf.addEventListener('click', () => {
            tabPdf.classList.add('active');
            tabSingle.classList.remove('active');
            tabBulk.classList.remove('active');

            if (singleTxContainer) singleTxContainer.style.display = 'none';
            if (bulkTxContainer) bulkTxContainer.style.display = 'none';
            if (pdfTxContainer) pdfTxContainer.style.display = 'block';
        });
    }
}

// Global actions exposed on window for inline event handlers
window.editTransaction = (id) => {
    const t = state.transactions.find(x => x.id === id);
    if (!t) return;

    state.editingTransactionId = id;

    const descEl = document.getElementById('description');
    const amountEl = document.getElementById('amount');
    const dateEl = document.getElementById('date');
    const catEl = document.getElementById('category');
    const pmEl = document.getElementById('payment-method');

    if (descEl) descEl.value = t.description;
    if (amountEl) amountEl.value = t.amount;
    if (dateEl) dateEl.value = t.date;

    populateCategorySelects();
    populatePaymentMethods();

    if (catEl) catEl.value = t.category;
    if (pmEl) pmEl.value = t.paymentMethod;

    const title = document.querySelector('#transaction-modal h2');
    if (title) title.textContent = "Editar Transação";

    const modal = document.getElementById('transaction-modal');
    if (modal) modal.classList.add('active');
};

window.deleteTransaction = async (id) => {
    if (confirm('Excluir esta transação?')) {
        try {
            await transactionsCollection.doc(id).delete();
            notifyStateChange('transaction-deleted');
        } catch (err) {
            alert('Erro ao excluir: ' + err.message);
        }
    }
};

window.deleteBank = async (id) => {
    if (confirm('Excluir esta conta bancária?')) {
        try {
            await banksCollection.doc(id).delete();
            notifyStateChange('bank-deleted');
        } catch (err) {
            alert('Erro ao excluir conta: ' + err.message);
        }
    }
};

window.deleteCard = async (id) => {
    if (confirm('Excluir este cartão de crédito?')) {
        try {
            await cardsCollection.doc(id).delete();
            notifyStateChange('card-deleted');
        } catch (err) {
            alert('Erro ao excluir cartão: ' + err.message);
        }
    }
};

window.deleteGoal = async (id) => {
    if (confirm('Excluir esta meta?')) {
        try {
            await goalsCollection.doc(id).delete();
            notifyStateChange('goal-deleted');
        } catch (err) {
            alert('Erro ao excluir meta: ' + err.message);
        }
    }
};

window.deleteCategory = async (id) => {
    if (confirm('Excluir esta categoria?')) {
        try {
            await categoriesCollection.doc(id).delete();
            notifyStateChange('category-deleted');
        } catch (err) {
            alert('Erro ao excluir categoria: ' + err.message);
        }
    }
};

window.deleteInvestment = async (id) => {
    if (confirm('Excluir este investimento?')) {
        try {
            await investmentsCollection.doc(id).delete();
            notifyStateChange('investment-deleted');
        } catch (err) {
            alert('Erro ao excluir investimento: ' + err.message);
        }
    }
};

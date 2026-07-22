/**
 * =============================================================================
 * CONTA COMIGO PRO — modals.js
 * Gerenciamento central de modais, formulários, transações em lote e importação PDF
 * =============================================================================
 */

import { auth, db, transactionsCollection, goalsCollection, categoriesCollection, cardsCollection, fixedTransactionsCollection, banksCollection, investmentsCollection } from './firebase.js';
import { state, notifyStateChange } from './state.js';
import { parseCurrencyInput, formatCurrency, showMessage } from './utils.js';

window.isBulkMode = false;

export function initModals() {
    setupModalEvents();
    setupFormListeners();
    setupBulkAndPdfEvents();
    setupSettingsForms();
    initPdfImport();
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

            // Reset tabs to single transaction
            const tabSingle = document.getElementById('tab-tx-single');
            if (tabSingle) tabSingle.click();

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
    const pdfDestSelect = document.getElementById('pdf-destination');
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
    if (pdfDestSelect) pdfDestSelect.innerHTML = '<option value="" disabled selected>Selecione a conta/cartão</option>' + opts;
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

            if (window.isBulkMode) {
                await processBulkTransactions();
                return;
            }

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

// =============================================================================
// LÓGICA DE TRANSAÇÕES EM LOTE (BULK TRANSACTIONS)
// =============================================================================

function setupBulkAndPdfEvents() {
    const tabSingle = document.getElementById('tab-tx-single');
    const tabBulk = document.getElementById('tab-tx-bulk');
    const tabPdf = document.getElementById('tab-tx-pdf');
    const singleTxContainer = document.getElementById('single-tx-container');
    const bulkTxContainer = document.getElementById('bulk-tx-container');
    const pdfTxContainer = document.getElementById('pdf-tx-container');
    const modalBox = document.querySelector('#transaction-modal .modal');
    const modalFooter = document.querySelector('#form-transaction .modal-footer');

    if (!tabSingle || !tabBulk) return;

    tabSingle.addEventListener('click', () => {
        window.isBulkMode = false;
        tabSingle.classList.add('active');
        tabBulk.classList.remove('active');
        if (tabPdf) tabPdf.classList.remove('active');

        if (singleTxContainer) singleTxContainer.style.display = 'block';
        if (bulkTxContainer) bulkTxContainer.style.display = 'none';
        if (pdfTxContainer) pdfTxContainer.style.display = 'none';
        if (modalBox) modalBox.style.maxWidth = '500px';
        if (modalFooter) modalFooter.style.display = 'flex';
    });

    tabBulk.addEventListener('click', () => {
        window.isBulkMode = true;
        tabBulk.classList.add('active');
        tabSingle.classList.remove('active');
        if (tabPdf) tabPdf.classList.remove('active');

        if (singleTxContainer) singleTxContainer.style.display = 'none';
        if (bulkTxContainer) bulkTxContainer.style.display = 'block';
        if (pdfTxContainer) pdfTxContainer.style.display = 'none';
        if (modalBox) modalBox.style.maxWidth = '800px';
        if (modalFooter) modalFooter.style.display = 'flex';

        const bulkDate = document.getElementById('bulk-date');
        if (bulkDate && !bulkDate.value) {
            bulkDate.value = document.getElementById('date')?.value || new Date().toISOString().slice(0, 10);
        }

        const bulkRowsContainer = document.getElementById('bulk-rows-container');
        if (bulkRowsContainer && bulkRowsContainer.children.length === 0) {
            window.addBulkRow();
        }
    });

    if (tabPdf) {
        tabPdf.addEventListener('click', () => {
            window.isBulkMode = false;
            tabPdf.classList.add('active');
            tabSingle.classList.remove('active');
            tabBulk.classList.remove('active');

            if (singleTxContainer) singleTxContainer.style.display = 'none';
            if (bulkTxContainer) bulkTxContainer.style.display = 'none';
            if (pdfTxContainer) pdfTxContainer.style.display = 'block';
            if (modalBox) modalBox.style.maxWidth = '500px';
            if (modalFooter) modalFooter.style.display = 'none';
        });
    }

    const btnAddBulkRow = document.getElementById('btn-add-bulk-row');
    if (btnAddBulkRow) {
        btnAddBulkRow.addEventListener('click', () => window.addBulkRow());
    }
}

window.addBulkRow = () => {
    window.addBulkRowWithData({});
};

window.addBulkRowWithData = (data = {}) => {
    const bulkRowsContainer = document.getElementById('bulk-rows-container');
    if (!bulkRowsContainer) return;

    const rowId = 'bulk_row_' + Date.now() + '_' + Math.random().toString(36).substr(2, 4);
    const defaultDate = data.date || document.getElementById('bulk-date')?.value || document.getElementById('date')?.value || new Date().toISOString().slice(0, 10);
    const defaultPm = data.paymentMethod || document.getElementById('payment-method')?.value || (state.banksList[0]?.id || state.cardsList[0]?.id || '');

    const rowDiv = document.createElement('div');
    rowDiv.id = rowId;
    rowDiv.className = 'bulk-row';
    rowDiv.style.cssText = `
        display: grid;
        grid-template-columns: 100px 1.5fr 110px 130px 1fr 1.2fr 36px;
        gap: 8px;
        align-items: center;
        background: var(--bg-body);
        padding: 8px 12px;
        border-radius: 8px;
        border: 1px solid var(--border);
    `;

    let catOpts = '<option value="" disabled selected>Categoria</option>';
    const targetCategory = data.category || 'Outros';

    state.categoriesList.forEach(c => {
        const selected = (targetCategory && c.name === targetCategory) ? 'selected' : '';
        catOpts += `<option value="${c.name}" ${selected}>${c.name}</option>`;
    });

    let pmOpts = '<option value="" disabled selected>Banco/Cartão</option>';
    if (state.banksList.length > 0) {
        state.banksList.forEach(b => {
            const selected = (defaultPm && b.id === defaultPm) ? 'selected' : '';
            pmOpts += `<option value="${b.id}" ${selected}>🏦 ${b.name}</option>`;
        });
    }
    if (state.cardsList.length > 0) {
        state.cardsList.forEach(c => {
            const selected = (defaultPm && c.id === defaultPm) ? 'selected' : '';
            pmOpts += `<option value="${c.id}" ${selected}>💳 ${c.nickname}</option>`;
        });
    }

    const typeExpenseSelected = (data.type === 'expense' || !data.type) ? 'selected' : '';
    const typeIncomeSelected = data.type === 'income' ? 'selected' : '';

    rowDiv.innerHTML = `
        <select class="bulk-row-type form-input" style="padding: 6px; font-size: 0.85rem;" required>
            <option value="expense" ${typeExpenseSelected}>Despesa</option>
            <option value="income" ${typeIncomeSelected}>Receita</option>
        </select>
        <input type="text" class="bulk-row-desc form-input" placeholder="Descrição" value="${data.description || ''}" style="padding: 6px; font-size: 0.85rem;" required>
        <input type="text" class="bulk-row-amount form-input" placeholder="Valor" value="${data.amount ? data.amount.toFixed(2).replace('.', ',') : ''}" style="padding: 6px; font-size: 0.85rem; text-align: right;" required>
        <input type="date" class="bulk-row-date form-input" value="${defaultDate}" style="padding: 6px; font-size: 0.85rem;">
        <select class="bulk-row-category form-input" style="padding: 6px; font-size: 0.85rem;" required>${catOpts}</select>
        <select class="bulk-row-pm form-input" style="padding: 6px; font-size: 0.85rem;" required>${pmOpts}</select>
        <button type="button" class="btn-icon" onclick="document.getElementById('${rowId}').remove()" title="Remover linha" style="color: var(--danger); font-size: 1.1rem;">
            <i class="fa-solid fa-xmark"></i>
        </button>
    `;

    bulkRowsContainer.appendChild(rowDiv);
};

window.applyBulkDateToAllRows = () => {
    const bulkDate = document.getElementById('bulk-date')?.value;
    if (!bulkDate) return alert('Selecione uma data primeiro.');

    document.querySelectorAll('.bulk-row-date').forEach(input => {
        input.value = bulkDate;
    });
};

window.setBulkDateToToday = () => {
    const today = new Date().toISOString().slice(0, 10);
    const bulkDate = document.getElementById('bulk-date');
    if (bulkDate) bulkDate.value = today;
    window.applyBulkDateToAllRows();
};

async function processBulkTransactions() {
    const rows = document.querySelectorAll('#bulk-rows-container .bulk-row');
    if (rows.length === 0) return alert('Adicione pelo menos uma linha de transação.');

    const transactionsToSave = [];
    let hasError = false;

    rows.forEach((row, idx) => {
        const type = row.querySelector('.bulk-row-type')?.value;
        const description = row.querySelector('.bulk-row-desc')?.value.trim();
        const amountStr = row.querySelector('.bulk-row-amount')?.value;
        const date = row.querySelector('.bulk-row-date')?.value;
        const category = row.querySelector('.bulk-row-category')?.value;
        const paymentMethod = row.querySelector('.bulk-row-pm')?.value;

        const amount = parseCurrencyInput(amountStr);

        if (!description || isNaN(amount) || amount <= 0 || !date || !category || !paymentMethod) {
            hasError = true;
            row.style.borderColor = 'var(--danger)';
        } else {
            row.style.borderColor = 'var(--border)';
            transactionsToSave.push({
                userId: state.currentUser.uid,
                type,
                description,
                amount,
                date,
                category,
                paymentMethod,
                createdAt: firebase.firestore.FieldValue.serverTimestamp()
            });
        }
    });

    if (hasError) {
        alert('Por favor, corrija as linhas destacadas em vermelho antes de salvar.');
        return;
    }

    try {
        const batch = db.batch();
        transactionsToSave.forEach(t => {
            const docRef = transactionsCollection.doc();
            batch.set(docRef, t);
        });

        await batch.commit();

        document.getElementById('transaction-modal')?.classList.remove('active');
        document.getElementById('bulk-rows-container').innerHTML = '';
        window.isBulkMode = false;
        alert(`${transactionsToSave.length} transações salvas com sucesso em lote!`);
        notifyStateChange('transactions-saved');
    } catch (err) {
        alert('Erro ao salvar transações em lote: ' + err.message);
    }
}

// =============================================================================
// LÓGICA DE IMPORTAÇÃO DE EXTRATO PDF (PDF.js + GEMINI AI)
// =============================================================================

function initPdfImport() {
    const dropzone = document.getElementById('pdf-dropzone');
    const fileInput = document.getElementById('pdf-file-input');
    const selectedFileDiv = document.getElementById('pdf-selected-file');
    const filenameSpan = document.getElementById('pdf-filename');
    const destinationSelect = document.getElementById('pdf-destination');
    const btnProcess = document.getElementById('btn-process-pdf');
    const loadingDiv = document.getElementById('pdf-loading');
    const loadingStatus = document.getElementById('pdf-loading-status');
    const keyContainer = document.getElementById('gemini-key-container');
    const apiKeyInput = document.getElementById('pdf-gemini-key');
    const saveKeyCheckbox = document.getElementById('save-gemini-key');

    const radioHeuristic = document.getElementById('method-heuristic');
    const radioAI = document.getElementById('method-ai');
    const labelHeuristic = document.querySelector('label[for="method-heuristic"]');
    const labelAI = document.querySelector('label[for="method-ai"]');

    if (!dropzone || !fileInput || !btnProcess) return;

    let selectedPdfFile = null;

    // Load saved Gemini key
    const savedKey = localStorage.getItem('gemini_api_key');
    if (savedKey && apiKeyInput) {
        apiKeyInput.value = savedKey;
    }

    // Toggle extraction methods UI
    if (labelHeuristic && labelAI && radioHeuristic && radioAI) {
        labelHeuristic.addEventListener('click', () => {
            radioHeuristic.checked = true;
            if (keyContainer) keyContainer.style.display = 'none';
        });

        labelAI.addEventListener('click', () => {
            radioAI.checked = true;
            if (keyContainer) keyContainer.style.display = 'block';
        });
    }

    // Dropzone drag & drop handlers
    dropzone.addEventListener('dragover', (e) => {
        e.preventDefault();
        dropzone.classList.add('dragover');
    });

    dropzone.addEventListener('dragleave', () => {
        dropzone.classList.remove('dragover');
    });

    dropzone.addEventListener('drop', (e) => {
        e.preventDefault();
        dropzone.classList.remove('dragover');
        if (e.dataTransfer.files.length > 0) {
            const file = e.dataTransfer.files[0];
            if (file.type === 'application/pdf' || file.name.endsWith('.pdf')) {
                selectedPdfFile = file;
                if (filenameSpan) filenameSpan.textContent = file.name;
                if (selectedFileDiv) selectedFileDiv.style.display = 'block';
            } else {
                alert('Apenas arquivos PDF são aceitos.');
            }
        }
    });

    // Dropzone click handlers
    dropzone.addEventListener('click', () => {
        fileInput.click();
    });

    fileInput.addEventListener('change', () => {
        if (fileInput.files.length > 0) {
            const file = fileInput.files[0];
            selectedPdfFile = file;
            if (filenameSpan) filenameSpan.textContent = file.name;
            if (selectedFileDiv) selectedFileDiv.style.display = 'block';
        }
    });

    // Processing trigger
    btnProcess.addEventListener('click', async () => {
        if (!selectedPdfFile) {
            alert('Por favor, selecione um arquivo PDF primeiro.');
            return;
        }

        const destAccount = destinationSelect ? destinationSelect.value : '';
        if (!destAccount) {
            alert('Por favor, selecione um banco ou cartão de destino.');
            return;
        }

        const useAI = radioAI && radioAI.checked;
        let apiKey = '';
        if (useAI) {
            apiKey = apiKeyInput ? apiKeyInput.value.trim() : '';
            if (!apiKey) {
                alert('Por favor, insira sua Chave de API do Gemini para continuar.');
                return;
            }
            if (saveKeyCheckbox && saveKeyCheckbox.checked) {
                localStorage.setItem('gemini_api_key', apiKey);
            } else {
                localStorage.removeItem('gemini_api_key');
            }
        }

        // Show loading and disable actions
        if (loadingDiv) loadingDiv.style.display = 'block';
        btnProcess.disabled = true;
        btnProcess.innerHTML = '<i class="fa-solid fa-circle-notch fa-spin"></i> Processando extrato...';

        try {
            if (loadingStatus) loadingStatus.textContent = 'Lendo e extraindo texto do arquivo PDF...';
            const pdfText = await extractTextFromPDF(selectedPdfFile);

            if (loadingStatus) loadingStatus.textContent = useAI ? 'Enviando texto para a IA...' : 'Processando transações localmente...';

            let extractedTxs = [];
            if (useAI) {
                extractedTxs = await parsePDFTextWithGemini(pdfText, apiKey);
            } else {
                extractedTxs = parsePDFTextHeuristic(pdfText);
            }

            if (extractedTxs.length === 0) {
                alert('Nenhuma transação identificada no extrato PDF. Verifique se o PDF contém texto selecionável ou tente utilizar a opção com IA.');
                if (loadingDiv) loadingDiv.style.display = 'none';
                btnProcess.disabled = false;
                btnProcess.innerHTML = '<i class="fa-solid fa-file-import"></i> Extrair Transações';
                return;
            }

            // Clear existing bulk rows
            const bulkRowsContainer = document.getElementById('bulk-rows-container');
            if (bulkRowsContainer) {
                bulkRowsContainer.innerHTML = '';
            }

            // Populate rows
            extractedTxs.forEach(tx => {
                tx.paymentMethod = destAccount;
                window.addBulkRowWithData(tx);
            });

            // Trigger click on Bulk Tab to show the list to user
            const tabBulk = document.getElementById('tab-tx-bulk');
            if (tabBulk) {
                tabBulk.click();
            }

            // Reset upload UI
            selectedPdfFile = null;
            fileInput.value = '';
            if (selectedFileDiv) selectedFileDiv.style.display = 'none';
            if (loadingDiv) loadingDiv.style.display = 'none';
            btnProcess.disabled = false;
            btnProcess.innerHTML = '<i class="fa-solid fa-file-import"></i> Extrair Transações';

            alert(`${extractedTxs.length} transação(ões) extraída(s) com sucesso! Revise os valores na aba "Lote" antes de salvar.`);

        } catch (error) {
            console.error(error);
            alert(`Erro ao processar o extrato: ${error.message}`);
            if (loadingDiv) loadingDiv.style.display = 'none';
            btnProcess.disabled = false;
            btnProcess.innerHTML = '<i class="fa-solid fa-file-import"></i> Extrair Transações';
        }
    });
}

async function extractTextFromPDF(file) {
    if (typeof window.pdfjsLib === 'undefined') {
        throw new Error("Biblioteca PDF.js não foi carregada. Verifique sua conexão à internet.");
    }
    window.pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.4.120/pdf.worker.min.js';

    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = async function () {
            try {
                const typedarray = new Uint8Array(this.result);
                const pdf = await window.pdfjsLib.getDocument({ data: typedarray }).promise;
                let fullText = '';

                for (let i = 1; i <= pdf.numPages; i++) {
                    const page = await pdf.getPage(i);
                    const textContent = await page.getTextContent();
                    const textItems = textContent.items;
                    let lastY = -1;
                    let pageText = '';

                    for (let j = 0; j < textItems.length; j++) {
                        const item = textItems[j];
                        if (lastY !== -1 && Math.abs(item.transform[5] - lastY) > 5) {
                            pageText += '\n';
                        }
                        pageText += item.str + ' ';
                        lastY = item.transform[5];
                    }
                    fullText += pageText + '\n';
                }
                resolve(fullText);
            } catch (err) {
                reject(err);
            }
        };
        reader.onerror = err => reject(err);
        reader.readAsArrayBuffer(file);
    });
}

function parsePDFTextHeuristic(text) {
    const lines = text.split('\n');
    const transactions = [];

    const dateRegex = /\b(\d{2})\/(\d{2})(?:\/(\d{2,4}))?\b/;
    const valueRegex = /(?:R\$\s*)?(-?\b\d{1,3}(?:\.\d{3})*,\d{2}\b|-?\b\d+,\d{2}\b)\s*([CDcd\-+])?/;

    for (let line of lines) {
        line = line.trim();
        if (!line) continue;

        const dateMatch = line.match(dateRegex);
        if (!dateMatch) continue;

        const valueMatch = line.match(valueRegex);
        if (!valueMatch) continue;

        const day = dateMatch[1];
        const month = dateMatch[2];
        let year = dateMatch[3] || new Date().getFullYear().toString();
        if (year.length === 2) {
            year = '20' + year;
        }
        const dateStr = `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;

        let valStr = valueMatch[1].replace(/\./g, '').replace(',', '.');
        let amount = parseFloat(valStr);
        if (isNaN(amount)) continue;

        let type = 'expense';
        const suffix = valueMatch[2];
        const prefixMinus = valueMatch[1].startsWith('-');

        if (prefixMinus || suffix === '-' || (suffix && suffix.toUpperCase() === 'D')) {
            type = 'expense';
        } else if (suffix === '+' || (suffix && suffix.toUpperCase() === 'C')) {
            type = 'income';
        } else {
            const lowerLine = line.toLowerCase();
            if (lowerLine.includes('recebido') || lowerLine.includes('depósito') || lowerLine.includes('credito') || lowerLine.includes('crédito') || lowerLine.includes('salário') || lowerLine.includes('estorno') || lowerLine.includes('transferência recebida') || lowerLine.includes('pix recebido')) {
                type = 'income';
            } else {
                type = 'expense';
            }
        }

        amount = Math.abs(amount);
        if (amount === 0) continue;

        let desc = line
            .replace(dateMatch[0], '')
            .replace(valueMatch[0], '')
            .replace(/\s+/g, ' ')
            .trim();

        desc = desc.replace(/^[\s\-\|\,\.\:]+/, '').replace(/[\s\-\|\,\.\:]+$/, '').trim();

        if (!desc) {
            desc = 'Transação Extrato';
        }

        let category = 'Outros';
        const lowerDesc = desc.toLowerCase();
        if (lowerDesc.includes('mercado') || lowerDesc.includes('supermercado')) {
            category = 'Alimentação';
        } else if (lowerDesc.includes('posto') || lowerDesc.includes('combustivel') || lowerDesc.includes('uber')) {
            category = 'Transporte';
        } else if (lowerDesc.includes('farmacia') || lowerDesc.includes('drogaria') || lowerDesc.includes('medico')) {
            category = 'Saúde';
        } else if (lowerDesc.includes('aluguel') || lowerDesc.includes('condominio') || lowerDesc.includes('luz') || lowerDesc.includes('energia') || lowerDesc.includes('agua') || lowerDesc.includes('gás')) {
            category = 'Moradia';
        } else if (lowerDesc.includes('restaurante') || lowerDesc.includes('ifood') || lowerDesc.includes('padaria') || lowerDesc.includes('cafe')) {
            category = 'Alimentação';
        }

        transactions.push({
            date: dateStr,
            description: desc,
            amount: amount,
            type: type,
            category: category
        });
    }

    return transactions;
}

async function parsePDFTextWithGemini(text, apiKey) {
    const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`;

    const prompt = `Analise o extrato bancário em texto abaixo e extraia todas as transações (receitas e despesas).
Retorne APENAS um array JSON estruturado com o formato especificado no responseSchema.

Texto do extrato:
${text}`;

    const requestBody = {
        contents: [{
            parts: [{ text: prompt }]
        }],
        generationConfig: {
            responseMimeType: "application/json",
            responseSchema: {
                type: "OBJECT",
                properties: {
                    transactions: {
                        type: "ARRAY",
                        description: "Lista de transações extraídas do extrato",
                        items: {
                            type: "OBJECT",
                            properties: {
                                date: { type: "STRING", description: "Data da transação no formato AAAA-MM-DD" },
                                description: { type: "STRING", description: "Descrição limpa da transação" },
                                amount: { type: "NUMBER", description: "Valor real absoluto positivo da transação" },
                                type: { type: "STRING", enum: ["expense", "income"], description: "Tipo: expense para saída, income para entrada" },
                                category: { type: "STRING", description: "Categoria da transação" }
                            },
                            required: ["date", "description", "amount", "type"]
                        }
                    }
                }
            }
        }
    };

    const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(requestBody)
    });

    if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        const errMsg = errorData.error?.message || `Status HTTP ${response.status}`;
        throw new Error(`Erro na API do Gemini: ${errMsg}`);
    }

    const data = await response.json();
    const responseText = data.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!responseText) {
        throw new Error("Resposta vazia da API do Gemini.");
    }

    const parsedJson = JSON.parse(responseText.trim());
    return parsedJson.transactions || [];
}

function setupSettingsForms() {
    // Form Dados Pessoais (Nome, Foto, E-mail)
    const formPersonal = document.getElementById('form-settings-personal');
    if (formPersonal) {
        formPersonal.addEventListener('submit', async (e) => {
            e.preventDefault();
            if (!state.currentUser) return;

            const btn = formPersonal.querySelector('button[type="submit"]');
            btn.disabled = true;

            const msgEl = document.getElementById('settings-personal-msg');

            try {
                const newName = document.getElementById('settings-name')?.value.trim();
                const newPhotoUrl = document.getElementById('settings-photo')?.value.trim();
                const fileInput = document.getElementById('settings-avatar-file');
                const compressedDataUrl = fileInput ? fileInput.dataset.compressedUrl : null;
                const newEmail = document.getElementById('settings-email')?.value.trim();

                const uid = state.currentUser.uid;
                let firebasePhotoUrl = newPhotoUrl;

                if (compressedDataUrl) {
                    localStorage.setItem('contaComigo_customAvatar_' + uid, compressedDataUrl);
                    firebasePhotoUrl = `https://ui-avatars.com/api/?name=${encodeURIComponent(newName || state.currentUser.email)}&background=6366f1&color=fff`;
                } else if (newPhotoUrl) {
                    if (newPhotoUrl.length > 1500) {
                        localStorage.setItem('contaComigo_customAvatar_' + uid, newPhotoUrl);
                        firebasePhotoUrl = `https://ui-avatars.com/api/?name=${encodeURIComponent(newName || state.currentUser.email)}&background=6366f1&color=fff`;
                    } else {
                        localStorage.removeItem('contaComigo_customAvatar_' + uid);
                    }
                }

                await state.currentUser.updateProfile({
                    displayName: newName,
                    photoURL: firebasePhotoUrl
                });

                if (newEmail && newEmail !== state.currentUser.email) {
                    await state.currentUser.updateEmail(newEmail);
                }

                notifyStateChange('profile-updated');
                if (msgEl) msgEl.innerHTML = "<span style='color:var(--success)'>Perfil atualizado com sucesso!</span>";

                setTimeout(() => {
                    if (msgEl) msgEl.innerHTML = "";
                    document.getElementById('modal-settings-personal')?.classList.remove('active');
                }, 1500);
            } catch (err) {
                if (msgEl) msgEl.innerHTML = `<span style='color:var(--danger)'>${err.message}</span>`;
                if (err.code === 'auth/requires-recent-login') {
                    alert("Para alterar o e-mail, por segurança, é necessário fazer login novamente.");
                    auth.signOut();
                }
            } finally {
                btn.disabled = false;
            }
        });
    }

    // Form Segurança (Senha)
    const formSecurity = document.getElementById('form-settings-security');
    if (formSecurity) {
        formSecurity.addEventListener('submit', async (e) => {
            e.preventDefault();
            if (!state.currentUser) return;

            const btn = formSecurity.querySelector('button[type="submit"]');
            btn.disabled = true;
            const msgEl = document.getElementById('settings-security-msg');

            try {
                const newPassword = document.getElementById('settings-new-password')?.value;
                await state.currentUser.updatePassword(newPassword);

                if (msgEl) msgEl.innerHTML = "<span style='color:var(--success)'>Senha atualizada!</span>";
                setTimeout(() => {
                    if (msgEl) msgEl.innerHTML = "";
                    document.getElementById('modal-settings-security')?.classList.remove('active');
                    formSecurity.reset();
                }, 1500);
            } catch (err) {
                if (msgEl) msgEl.innerHTML = `<span style='color:var(--danger)'>${err.message}</span>`;
                if (err.code === 'auth/requires-recent-login') {
                    alert("Para alterar a senha, faça login novamente.");
                    auth.signOut();
                }
            } finally {
                btn.disabled = false;
            }
        });
    }

    // Form Reportar Problema -> Grava no Firestore e exibe confirmação
    const formReport = document.getElementById('form-settings-report');
    if (formReport) {
        formReport.addEventListener('submit', async (e) => {
            e.preventDefault();
            const reportText = document.getElementById('report-text')?.value.trim();
            if (!reportText) return alert("Descreva o problema antes de enviar.");

            const userEmail = state.currentUser ? state.currentUser.email : 'Anônimo';
            const userName = state.currentUser ? (state.currentUser.displayName || 'Usuário') : 'Usuário';

            try {
                await db.collection('support_reports').add({
                    userId: state.currentUser ? state.currentUser.uid : null,
                    userEmail,
                    userName,
                    reportText,
                    destinationEmail: 'jessica.lopes93@hotmail.com',
                    userAgent: navigator.userAgent,
                    createdAt: firebase.firestore.FieldValue.serverTimestamp()
                });

                alert("Obrigado! Seu relato foi registrado com sucesso e encaminhado ao suporte.");
                formReport.reset();
                document.getElementById('modal-settings-report')?.classList.remove('active');
            } catch (err) {
                alert("Erro ao enviar relato: " + err.message);
            }
        });
    }
}

// Actions expostas no window
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

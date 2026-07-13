/**
 * =============================================================================
 * CONTA COMIGO PRO — app.js
 * =============================================================================
 * Arquivo principal de lógica do aplicativo Conta Comigo Pro.
 * Responsável por toda a integração com Firebase (Auth + Firestore),
 * renderização de UI dinâmica, navegação SPA, e módulos de:
 *
 *  - Autenticação (Google OAuth, e-mail/senha, link mágico)
 *  - Transações (individuais, em lote, parceladas)
 *  - Contas Bancárias e seus extratos
 *  - Cartões de Crédito e controle de faturas
 *  - Transações Fixas / Recorrentes
 *  - Metas Financeiras
 *  - Categorias personalizadas com ícones
 *  - Investimentos com estimativa de rendimento
 *  - Relatórios (DRE, categorias, extrato, cartões) com CSV e impressão
 *  - Configurações de conta, tema (claro/escuro), segurança
 *
 * Tecnologias: Firebase 10.x (Compat SDK), Vanilla JS, HTML5/CSS3
 * Autor: Conta Comigo Pro Team
 * =============================================================================
 */

// =============================================================================
// SEÇÃO 1 — CONFIGURAÇÃO DO FIREBASE
// =============================================================================
const firebaseConfig = {
    apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
    authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
    projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
    storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
    appId: import.meta.env.VITE_FIREBASE_APP_ID,
    measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID
};

if (!firebase.apps.length) {
    firebase.initializeApp(firebaseConfig);
}

const db = firebase.firestore();
const auth = firebase.auth();

const transactionsCollection = db.collection('transactions');
const goalsCollection = db.collection('goals');
const categoriesCollection = db.collection('categories');
const cardsCollection = db.collection('cards');
const fixedTransactionsCollection = db.collection('fixed_transactions');
const banksCollection = db.collection('banks');
const investmentsCollection = db.collection('investments');

// =============================================================================
// SEÇÃO 2 — UTILITÁRIOS GLOBAIS
// =============================================================================

function parseCurrencyInput(value) {
    if (!value) return 0;
    let str = value.toString().trim();
    if (str.includes(',')) {
        str = str.replace(/\./g, '');
        str = str.replace(',', '.');
    }
    const parsed = parseFloat(str);
    return isNaN(parsed) ? 0 : parsed;
}

let currentCardFilter = {
    id: null,
    search: '',
    startDate: '',
    endDate: '',
    month: ''
};

let currentBankFilter = {
    id: null,
    startDate: '',
    endDate: ''
};

// =============================================================================
// SEÇÃO 3 — ELEMENTOS DO DOM
// =============================================================================

const authOverlay = document.getElementById('auth-overlay');
const appWrapper = document.getElementById('app-wrapper');
const btnGoogleLogin = document.getElementById('btn-google-login');
const formAuth = document.getElementById('form-auth-email');
const authMessage = document.getElementById('auth-message');
const btnLogout = document.getElementById('btn-logout');

const userNameEl = document.getElementById('user-name');
const userEmailEl = document.getElementById('user-email');
const userAvatarEl = document.getElementById('user-avatar');

const transactionModal = document.getElementById('transaction-modal');
const formTransaction = document.getElementById('form-transaction');
const installmentsPendingModal = document.getElementById('installments-pending-modal');
const goalModal = document.getElementById('goal-modal');
const formGoal = document.getElementById('form-goal');
const fixedTransactionModal = document.getElementById('fixed-transaction-modal');
const formFixedTransaction = document.getElementById('form-fixed-transaction');
const cardModal = document.getElementById('card-modal');
const formCard = document.getElementById('form-card');
const cardPaymentModal = document.getElementById('card-payment-modal');
const formCardPayment = document.getElementById('form-card-payment');
const closeCardPaymentModal = document.getElementById('close-card-payment-modal');
const btnCancelCardPayment = document.getElementById('btn-cancel-card-payment');

closeCardPaymentModal.addEventListener('click', () => cardPaymentModal.classList.remove('active'));
btnCancelCardPayment.addEventListener('click', () => cardPaymentModal.classList.remove('active'));

const investmentModal = document.getElementById('investment-modal');
const formInvestment = document.getElementById('form-investment');
const btnNewCard = document.getElementById('btn-new-card');
const banksListGrid = document.getElementById('banks-list');
const bankModal = document.getElementById('bank-modal');
const formBank = document.getElementById('form-bank');
const btnNewBank = document.getElementById('btn-new-bank');
const transferModal = document.getElementById('transfer-modal');
const formTransfer = document.getElementById('form-transfer');
const closeTransferModal = document.getElementById('close-transfer-modal');
const btnCancelTransfer = document.getElementById('btn-cancel-transfer');
const btnNewTransfer = document.getElementById('btn-new-transfer');

if (closeTransferModal) closeTransferModal.addEventListener('click', () => transferModal.classList.remove('active'));
if (btnCancelTransfer) btnCancelTransfer.addEventListener('click', () => transferModal.classList.remove('active'));

const paymentMethod = document.getElementById('payment-method');
const fixedPaymentMethod = document.getElementById('fixed-payment-method');
const installmentsContainer = document.getElementById('installments-container');
const installmentsSelect = document.getElementById('installments');

const transactionListRecent = document.getElementById('transaction-list-recent');
const transactionListComplete = document.getElementById('transaction-list-complete');
const goalsListGrid = document.getElementById('goals-list');
const transactionListFixed = document.getElementById('transaction-list-fixed');
const cardsListGrid = document.getElementById('cards-list');

const filterSearch = document.getElementById('filter-search');
const filterType = document.getElementById('filter-type');
const filterDateStart = document.getElementById('filter-date-start');
const filterDateEnd = document.getElementById('filter-date-end');
const filterCategory = document.getElementById('filter-category');
const btnClearFilters = document.getElementById('btn-clear-filters');

const totalBalanceElement = document.getElementById('total-balance');
const totalIncomeElement = document.getElementById('total-income');
const totalExpenseElement = document.getElementById('total-expense');

const fBalanceEl = document.getElementById('filtered-balance');
const fIncomeEl = document.getElementById('filtered-income');
const fExpenseEl = document.getElementById('filtered-expense');

// =============================================================================
// SEÇÃO 4 — ESTADO GLOBAL DA APLICAÇÃO
// =============================================================================

let currentUser = null;
let transactions = [];
let goalsList = [];
let fixedTransactionsList = [];
let cardsList = [];
let categoriesList = [];
let banksList = [];
let investmentsList = [];

let unsTx = null;
let unsGoals = null;
let unsCategories = null;
let unsFixed = null;
let unsCards = null;
let unsBanks = null;
let unsInvestments = null;

let isDarkMode = localStorage.getItem('contaComigo_darkMode') === 'true';

let editingTransactionId = null;
let editingGroupId = null;
let editingFixedId = null;
let launchingFixedId = null;
let launchingCardId = null;
let editingCardId = null;
let expandedCardId = null;

// =============================================================================
// SEÇÃO 5 — MENU MOBILE
// =============================================================================

const mobileMenuBtn = document.getElementById('mobile-menu-btn');
const sidebar = document.querySelector('.sidebar');
const sidebarOverlay = document.getElementById('sidebar-overlay');

function toggleSidebar() {
    if (sidebar) sidebar.classList.toggle('open');
    if (sidebarOverlay) sidebarOverlay.classList.toggle('active');
}

function closeSidebar() {
    if (sidebar) sidebar.classList.remove('open');
    if (sidebarOverlay) sidebarOverlay.classList.remove('active');
}

if (mobileMenuBtn) mobileMenuBtn.addEventListener('click', toggleSidebar);
if (sidebarOverlay) sidebarOverlay.addEventListener('click', closeSidebar);

document.querySelectorAll('nav a').forEach(link => {
    link.addEventListener('click', () => {
        if (window.innerWidth <= 768) closeSidebar();
    });
});

// =============================================================================
// SEÇÃO 6 — AUTENTICAÇÃO
// =============================================================================

auth.onAuthStateChanged((user) => {
    if (user) {
        currentUser = user;
        authOverlay.classList.remove('active');
        appWrapper.style.display = 'flex';
        updateProfileUI();

        runDatabaseMigration().then(() => {
            runBankMigration().then(() => {
                runCategoryMigration().then(() => {
                    // Limpa duplicatas antes de iniciar os listeners
                    cleanDuplicateCategories().then(() => {
                        listenForTransactions();
                        listenForGoals();
                        listenForCategories();
                        listenForCards();
                        listenForBanks();
                        listenForFixed();
                    });
                });
            });
            listenForInvestments();
            fetchMarketRates();
        });
    } else {
        currentUser = null;
        appWrapper.style.display = 'none';
        authOverlay.classList.add('active');

        transactions = [];
        goalsList = [];
        fixedTransactionsList = [];
        cardsList = [];
        categoriesList = [];
        banksList = [];
        investmentsList = [];
        updateAppUI();

        if (unsTx) unsTx();
        if (unsGoals) unsGoals();
        if (unsCategories) unsCategories();
        if (unsFixed) unsFixed();
        if (unsCards) unsCards();
        if (unsBanks) unsBanks();
        if (unsInvestments) unsInvestments();
    }
});

// =============================================================================
// SEÇÃO 7 — MIGRAÇÕES DE BANCO DE DADOS
// =============================================================================

async function runBankMigration() {
    const migKey = `migrated_banks_${currentUser.uid}`;
    if (localStorage.getItem(migKey)) return;

    try {
        let defaultBankRef = null;
        const existingBanks = await banksCollection
            .where("userId", "==", currentUser.uid)
            .where("name", "==", "Conta Corrente Principal")
            .get();

        if (!existingBanks.empty) {
            defaultBankRef = existingBanks.docs[0].ref;
        } else {
            defaultBankRef = await banksCollection.add({
                userId: currentUser.uid,
                name: "Conta Corrente Principal",
                balance: 0,
                color: "#0ea5e9",
                createdAt: firebase.firestore.FieldValue.serverTimestamp()
            });
        }

        const snap = await transactionsCollection.where("userId", "==", currentUser.uid).get();
        const batch = db.batch();
        let ops = 0;

        for (const doc of snap.docs) {
            const data = doc.data();
            if (data.paymentMethod === 'checking') {
                batch.update(transactionsCollection.doc(doc.id), { paymentMethod: defaultBankRef.id });
                ops++;
            }
            if (ops > 400) {
                await batch.commit();
                ops = 0;
            }
        }
        if (ops > 0) await batch.commit();

        localStorage.setItem(migKey, 'done');
        console.log("Migração de Bancos concluída com sucesso!");
    } catch (e) {
        console.error("Migration de bancos falhou: ", e);
    }
}

async function runDatabaseMigration() {
    const migKey = `migrated_v2_${currentUser.uid}`;
    if (localStorage.getItem(migKey)) return;

    try {
        const snap = await transactionsCollection.where("userId", "==", currentUser.uid).get();
        const batch = db.batch();
        let ops = 0;

        for (const doc of snap.docs) {
            const data = doc.data();
            let moved = false;

            if (data.isCategory) {
                delete data.isCategory;
                delete data.date;
                batch.set(categoriesCollection.doc(doc.id), data);
                moved = true;
            } else if (data.isCreditCard) {
                delete data.isCreditCard;
                delete data.date;
                batch.set(cardsCollection.doc(doc.id), data);
                moved = true;
            } else if (data.isFixedTemplate) {
                delete data.isFixedTemplate;
                delete data.date;
                batch.set(fixedTransactionsCollection.doc(doc.id), data);
                moved = true;
            }

            if (moved) {
                batch.delete(transactionsCollection.doc(doc.id));
                ops++;
            }

            if (ops > 400) {
                await batch.commit();
                ops = 0;
            }
        }

        if (ops > 0) await batch.commit();
        localStorage.setItem(migKey, 'done');
        console.log("Banco de dados otimizado com sucesso!");
    } catch (e) {
        console.error("Migration falhou: ", e);
    }
}

async function runCategoryMigration() {
    const migKey = `migrated_categories_v1_${currentUser.uid}`;
    if (localStorage.getItem(migKey)) return;

    try {
        console.log("Iniciando migração de unificação de categorias...");
        const snap = await categoriesCollection.where("userId", "==", currentUser.uid).get();

        const groups = {};
        snap.forEach(doc => {
            const data = doc.data();
            const normalized = (data.name || '').trim().toLowerCase();
            if (!groups[normalized]) {
                groups[normalized] = [];
            }
            groups[normalized].push({ id: doc.id, ...data });
        });

        for (const normalizedName in groups) {
            const group = groups[normalizedName];
            if (group.length <= 1) continue;

            group.sort((a, b) => {
                const aName = a.name.trim();
                const bName = b.name.trim();
                const aIsDefault = defaultCategories.some(c => c.name === aName);
                const bIsDefault = defaultCategories.some(c => c.name === bName);
                if (aIsDefault && !bIsDefault) return -1;
                if (!aIsDefault && bIsDefault) return 1;
                return aName.length - bName.length || a.id.localeCompare(b.id);
            });

            const canonical = group[0];
            console.log(`Unificando categoria: mantendo '${canonical.name}' (${canonical.id}) e removendo duplicados.`);

            for (let i = 1; i < group.length; i++) {
                const duplicate = group[i];
                console.log(`Removendo duplicado '${duplicate.name}' (${duplicate.id})`);

                await categoriesCollection.doc(duplicate.id).delete();

                if (duplicate.name !== canonical.name) {
                    const txSnap = await transactionsCollection.where("userId", "==", currentUser.uid).where("category", "==", duplicate.name).get();
                    if (!txSnap.empty) {
                        let batch = db.batch();
                        let ops = 0;
                        for (const doc of txSnap.docs) {
                            batch.update(doc.ref, { category: canonical.name });
                            ops++;
                            if (ops >= 400) {
                                await batch.commit();
                                batch = db.batch();
                                ops = 0;
                            }
                        }
                        if (ops > 0) await batch.commit();
                        console.log(`Atualizadas ${txSnap.size} transações de '${duplicate.name}' para '${canonical.name}'`);
                    }

                    const fixedSnap = await fixedTransactionsCollection.where("userId", "==", currentUser.uid).where("category", "==", duplicate.name).get();
                    if (!fixedSnap.empty) {
                        let batch = db.batch();
                        let ops = 0;
                        for (const doc of fixedSnap.docs) {
                            batch.update(doc.ref, { category: canonical.name });
                            ops++;
                            if (ops >= 400) {
                                await batch.commit();
                                batch = db.batch();
                                ops = 0;
                            }
                        }
                        if (ops > 0) await batch.commit();
                        console.log(`Atualizadas ${fixedSnap.size} transações fixas de '${duplicate.name}' para '${canonical.name}'`);
                    }
                }
            }
        }

        localStorage.setItem(migKey, 'done');
        console.log("Migração de categorias concluída com sucesso!");
    } catch (e) {
        console.error("Falha na migração de categorias: ", e);
    }
}

function showMessage(msg, isError = false) {
    authMessage.textContent = msg;
    authMessage.style.color = isError ? 'var(--danger)' : 'var(--primary)';
}

btnGoogleLogin.addEventListener('click', () => {
    auth.signInWithPopup(new firebase.auth.GoogleAuthProvider())
        .catch(err => showMessage(err.message, true));
});

formAuth.addEventListener('submit', async (e) => {
    e.preventDefault();
    const email = document.getElementById('auth-email').value.trim();
    const password = document.getElementById('auth-password').value;
    if (!email || !password) return showMessage("Preencha todos os campos.", true);

    showMessage("Autenticando...");
    try {
        await auth.signInWithEmailAndPassword(email, password);
    } catch (error) {
        if (error.code === 'auth/user-not-found' || error.code === 'auth/invalid-credential') {
            try { await auth.createUserWithEmailAndPassword(email, password); } catch (err) { showMessage(err.message, true); }
        } else { showMessage(error.message, true); }
    }
});

document.getElementById('btn-email-link').addEventListener('click', async () => {
    const email = document.getElementById('auth-email').value.trim();
    if (!email) return showMessage("Preencha seu e-mail para receber o link.", true);
    try {
        await auth.sendSignInLinkToEmail(email, { url: window.location.href, handleCodeInApp: true });
        window.localStorage.setItem('emailForSignIn', email);
        showMessage("Link enviado! Verifique seu email.");
    } catch (error) { showMessage(error.message, true); }
});

if (auth.isSignInWithEmailLink(window.location.href)) {
    let email = window.localStorage.getItem('emailForSignIn') || window.prompt('Confirme seu e-mail:');
    auth.signInWithEmailLink(email, window.location.href)
        .then(() => window.localStorage.removeItem('emailForSignIn'))
        .catch(e => showMessage(e.message, true));
}

btnLogout.addEventListener('click', () => auth.signOut());

const btnNewCategory = document.getElementById('btn-new-category');
const categoryModal = document.getElementById('category-modal');
const formCategory = document.getElementById('form-category');
const btnCancelCategory = document.getElementById('btn-cancel-category');
const closeCategoryModal = document.getElementById('close-category-modal');
const categoriesListGrid = document.getElementById('categories-list');
const categoryIconsGrid = document.getElementById('category-icons-grid');

// =============================================================================
// SEÇÃO 8 — ROTEAMENTO SPA
// =============================================================================

const navLinks = document.querySelectorAll('#nav-menu a[data-page]');
navLinks.forEach(link => {
    link.addEventListener('click', (e) => {
        e.preventDefault();

        document.querySelectorAll('#nav-menu li').forEach(li => li.classList.remove('active'));
        const parentLi = link.parentElement;
        parentLi.classList.add('active');

        document.getElementById('page-title').textContent = parentLi.dataset.title;
        const targetPageId = link.dataset.page;

        const noNewTx = ['page-metas', 'page-configuracoes', 'page-fixas', 'page-categorias', 'page-investimentos', 'page-relatorios'];
        document.getElementById('btn-new-transaction').style.display = noNewTx.includes(targetPageId) ? 'none' : 'flex';

        if (btnNewTransfer) btnNewTransfer.style.display =
            ['page-dashboard', 'page-bancos', 'page-transacoes'].includes(targetPageId) ? 'flex' : 'none';

        document.getElementById('btn-new-goal').style.display = (targetPageId === 'page-metas') ? 'flex' : 'none';
        document.getElementById('btn-new-fixed-transaction').style.display = (targetPageId === 'page-fixas') ? 'flex' : 'none';
        btnNewCard.style.display = (targetPageId === 'page-cartoes') ? 'flex' : 'none';
        btnNewCategory.style.display = (targetPageId === 'page-categorias') ? 'flex' : 'none';
        btnNewBank.style.display = (targetPageId === 'page-bancos') ? 'flex' : 'none';
        document.getElementById('btn-new-investment').style.display = (targetPageId === 'page-investimentos') ? 'flex' : 'none';

        document.querySelectorAll('.page-section').forEach(sec => sec.classList.remove('active'));
        document.getElementById(targetPageId).classList.add('active');
    });
});

// =============================================================================
// SEÇÃO 9 — PERFIL & CONFIGURAÇÕES
// =============================================================================

function updateProfileUI() {
    const defaultAv = `https://ui-avatars.com/api/?name=${currentUser.email}&background=6366f1&color=fff`;
    const nm = currentUser.displayName || "Usuário Vazio";
    const pt = currentUser.photoURL || defaultAv;

    userNameEl.textContent = nm;
    userEmailEl.textContent = currentUser.email;
    userAvatarEl.src = pt;

    if (document.getElementById('settings-name')) document.getElementById('settings-name').value = currentUser.displayName || "";
    if (document.getElementById('settings-email')) document.getElementById('settings-email').value = currentUser.email || "";
    if (document.getElementById('settings-photo')) document.getElementById('settings-photo').value = currentUser.photoURL || "";
}

const modalsMap = {
    'btn-menu-personal': 'modal-settings-personal',
    'btn-menu-security': 'modal-settings-security',
    'btn-menu-devices': 'modal-settings-devices',
    'btn-menu-notifications': 'modal-settings-notifications',
    'btn-menu-report': 'modal-settings-report',
    'btn-menu-close-account': 'modal-settings-close-account'
};

Object.keys(modalsMap).forEach(btnId => {
    const btn = document.getElementById(btnId);
    if (btn) {
        btn.addEventListener('click', () => {
            document.getElementById(modalsMap[btnId]).classList.add('active');
        });
    }
});

document.querySelectorAll('[id^="close-settings-"], [id^="btn-cancel-"]').forEach(btn => {
    btn.addEventListener('click', (e) => {
        const modal = e.target.closest('.modal-overlay');
        if (modal && modal.id.startsWith('modal-settings')) {
            modal.classList.remove('active');
        }
    });
});

const formSettingsPersonal = document.getElementById('form-settings-personal');
if (formSettingsPersonal) {
    formSettingsPersonal.addEventListener('submit', async (e) => {
        e.preventDefault();
        const btn = formSettingsPersonal.querySelector('button[type="submit"]');
        btn.disabled = true;
        try {
            const newName = document.getElementById('settings-name').value.trim();
            const newPhoto = document.getElementById('settings-photo').value.trim();
            const newEmail = document.getElementById('settings-email').value.trim();

            await currentUser.updateProfile({ displayName: newName, photoURL: newPhoto });

            if (newEmail !== currentUser.email) {
                await currentUser.updateEmail(newEmail);
            }

            updateProfileUI();
            document.getElementById('settings-personal-msg').innerHTML = "<span style='color:var(--success)'>Perfil atualizado!</span>";
            setTimeout(() => {
                document.getElementById('settings-personal-msg').innerHTML = "";
                document.getElementById('modal-settings-personal').classList.remove('active');
            }, 2000);
        } catch (err) {
            document.getElementById('settings-personal-msg').innerHTML = `<span style='color:var(--danger)'>${err.message}</span>`;
            if (err.code === 'auth/requires-recent-login') {
                alert("Para alterar o e-mail, por segurança, é necessário fazer login novamente. Você será desconectado.");
                auth.signOut();
            }
        } finally {
            btn.disabled = false;
        }
    });
}

const formSettingsSecurity = document.getElementById('form-settings-security');
if (formSettingsSecurity) {
    formSettingsSecurity.addEventListener('submit', async (e) => {
        e.preventDefault();
        const btn = formSettingsSecurity.querySelector('button[type="submit"]');
        btn.disabled = true;
        try {
            const newPassword = document.getElementById('settings-new-password').value;
            await currentUser.updatePassword(newPassword);
            document.getElementById('settings-security-msg').innerHTML = "<span style='color:var(--success)'>Senha atualizada!</span>";
            setTimeout(() => {
                document.getElementById('settings-security-msg').innerHTML = "";
                document.getElementById('modal-settings-security').classList.remove('active');
                formSettingsSecurity.reset();
            }, 2000);
        } catch (err) {
            document.getElementById('settings-security-msg').innerHTML = `<span style='color:var(--danger)'>${err.message}</span>`;
            if (err.code === 'auth/requires-recent-login') {
                alert("Para alterar a senha, é necessário fazer login novamente. Você será desconectado.");
                auth.signOut();
            }
        } finally {
            btn.disabled = false;
        }
    });
}

const formSettingsNotif = document.getElementById('form-settings-notifications');
if (formSettingsNotif) {
    formSettingsNotif.addEventListener('submit', (e) => {
        e.preventDefault();
        alert('Preferências salvas com sucesso no seu dispositivo local.');
        document.getElementById('modal-settings-notifications').classList.remove('active');
    });
}

const formSettingsReport = document.getElementById('form-settings-report');
if (formSettingsReport) {
    formSettingsReport.addEventListener('submit', (e) => {
        e.preventDefault();
        alert('Obrigado! Seu problema foi enviado à nossa equipe de suporte.');
        formSettingsReport.reset();
        document.getElementById('modal-settings-report').classList.remove('active');
    });
}

const btnConfirmClose = document.getElementById('btn-confirm-close-account');
if (btnConfirmClose) {
    btnConfirmClose.addEventListener('click', async () => {
        if (!confirm("Certeza ABSOLUTA? Todo seu histórico será excluído do banco de dados para sempre.")) return;

        btnConfirmClose.disabled = true;
        btnConfirmClose.textContent = "Apagando...";
        try {
            const uid = currentUser.uid;

            const deleteDocs = async (collection) => {
                const snap = await collection.where('userId', '==', uid).get();
                const batch = db.batch();
                snap.forEach(doc => batch.delete(doc.ref));
                if (snap.size > 0) await batch.commit();
            };

            await deleteDocs(transactionsCollection);
            await deleteDocs(fixedTransactionsCollection);
            await deleteDocs(goalsCollection);
            await deleteDocs(cardsCollection);
            await deleteDocs(categoriesCollection);
            await deleteDocs(investmentsCollection);

            await currentUser.delete();
        } catch (err) {
            document.getElementById('settings-close-msg').innerHTML = `<span style='color:var(--danger)'>${err.message}</span>`;
            if (err.code === 'auth/requires-recent-login') {
                alert("Para excluir a conta, faça login novamente. Você será desconectado.");
                auth.signOut();
            }
            btnConfirmClose.disabled = false;
            btnConfirmClose.innerHTML = `<i class="fa-solid fa-trash"></i> Sim, Apagar Tudo`;
        }
    });
}

// =============================================================================
// SEÇÃO 10 — LISTENERS EM TEMPO REAL
// =============================================================================

function listenForTransactions() {
    if (unsTx) unsTx();
    unsTx = transactionsCollection
        .where("userId", "==", currentUser.uid)
        .orderBy("date", "desc")
        .onSnapshot(snap => {
            transactions = [];
            snap.forEach(doc => {
                transactions.push({ id: doc.id, ...doc.data() });
            });
            updateAppUI();
            renderFixedTransactions();
            renderCards();
        });
}

function listenForCards() {
    if (unsCards) unsCards();
    unsCards = cardsCollection.where('userId', '==', currentUser.uid).onSnapshot(snap => {
        cardsList = [];
        snap.forEach(doc => cardsList.push({ id: doc.id, ...doc.data() }));
        renderCards();
        renderBanks();
        populatePaymentMethodSelects();
        renderFixedTransactions();
    });
}

function listenForBanks() {
    if (unsBanks) unsBanks();
    unsBanks = banksCollection.where('userId', '==', currentUser.uid).onSnapshot(snap => {
        banksList = [];
        snap.forEach(doc => banksList.push({ id: doc.id, ...doc.data() }));
        renderBanks();
        populatePaymentMethodSelects();
        if (typeof window.populateReportBankSelect === 'function') window.populateReportBankSelect();
        updateAppUI();
    });
}

function listenForFixed() {
    if (unsFixed) unsFixed();
    unsFixed = fixedTransactionsCollection.where('userId', '==', currentUser.uid).onSnapshot(snap => {
        fixedTransactionsList = [];
        snap.forEach(doc => fixedTransactionsList.push({ id: doc.id, ...doc.data() }));
        renderFixedTransactions();
        checkAutomaticFixedTransactions();
    });
}

// =============================================================================
// SEÇÃO 11 — FORMULÁRIO DE TRANSAÇÃO
// =============================================================================

formTransaction.addEventListener('submit', async (e) => {
    e.preventDefault();

    if (window.isBulkMode) {
        const rows = document.getElementById('bulk-rows-container').querySelectorAll('.bulk-row');
        if (rows.length === 0) return alert('Adicione pelo menos uma transação!');

        try {
            const batch = db.batch();
            let hasError = false;

            for (const row of rows) {
                const type = row.querySelector('.bulk-row-type').value;
                const description = row.querySelector('.bulk-row-desc').value.trim();
                const amount = parseCurrencyInput(row.querySelector('.bulk-row-amount').value);
                const date = row.querySelector('.bulk-row-date').value;
                const category = row.querySelector('.bulk-row-category').value;
                const pm = row.querySelector('.bulk-row-pm').value;

                if (!description || isNaN(amount) || amount <= 0 || !category || !pm || !date) {
                    hasError = true;
                    row.style.borderColor = 'var(--danger)';
                    row.style.borderWidth = '2px';
                    continue;
                }

                row.style.borderColor = 'var(--border)';
                row.style.borderWidth = '1px';

                const txRef = transactionsCollection.doc();
                batch.set(txRef, {
                    userId: currentUser.uid,
                    type,
                    description,
                    amount,
                    date,
                    category,
                    paymentMethod: pm,
                    createdAt: firebase.firestore.FieldValue.serverTimestamp()
                });
            }

            if (hasError) {
                alert('Preencha todos os campos de todas as transações! As linhas com erro foram destacadas.');
                return;
            }

            await batch.commit();

            transactionModal.classList.remove('active');
            formTransaction.reset();
            window.resetBulkMode();

            updateAppUI();
            if (expandedCardId) {
                setTimeout(() => window.filterCardExtract(expandedCardId), 200);
            }
            if (currentBankFilter.id) {
                setTimeout(() => window.filterBankExtract(currentBankFilter.id), 200);
            }

            if (typeof showMessage === 'function') {
                showMessage(`${rows.length} transação(ões) salva(s) com sucesso!`);
            }

        } catch (e) {
            alert("Erro ao salvar lote: " + e.message);
        }
        return;
    }

    const type = document.querySelector('input[name="type"]:checked').value;
    const description = document.getElementById('description').value;
    const amount = parseCurrencyInput(document.getElementById('amount').value);
    const goalId = document.getElementById('transaction-goal')?.value || '';

    if (!description || isNaN(amount) || amount <= 0) return alert('Campos inválidos!');

    const pm = paymentMethod.value;
    const isCC = cardsList.some(c => c.id === pm);
    const numInst = (isCC && type === 'expense') ? parseInt(installmentsSelect.value) : 1;

    try {
        if (editingGroupId) {
            const snap = await transactionsCollection.where("groupId", "==", editingGroupId).get();
            const batch = db.batch();
            snap.forEach(doc => batch.delete(doc.ref));
            await batch.commit();
            editingGroupId = null;
        }

        if (editingTransactionId) {
            const payload = {
                userId: currentUser.uid,
                type,
                description,
                amount,
                date: document.getElementById('date').value,
                category: document.getElementById('category').value,
                paymentMethod: pm,
                goalId
            };
            await transactionsCollection.doc(editingTransactionId).update(payload);
        } else {
            if (!isCC || numInst === 1) {
                const payload = {
                    userId: currentUser.uid,
                    type,
                    description,
                    amount,
                    date: document.getElementById('date').value,
                    category: document.getElementById('category').value,
                    paymentMethod: pm,
                    goalId,
                    createdAt: firebase.firestore.FieldValue.serverTimestamp()
                };
                await transactionsCollection.add(payload);
            } else {
                const totalAmount = amount;
                const portion = totalAmount / numInst;
                const baseDate = new Date(document.getElementById('date').value + 'T00:00:00');
                const groupId = 'grp_' + Date.now().toString(36) + Math.random().toString(36).substr(2, 5);

                for (let i = 1; i <= numInst; i++) {
                    const d = new Date(baseDate.getTime());
                    d.setMonth(d.getMonth() + (i - 1));

                    const pDateStr = d.toISOString().slice(0, 10);
                    const descInst = description + ` (${i}/${numInst})`;

                    const payload = {
                        userId: currentUser.uid,
                        type,
                        description: descInst,
                        amount: portion,
                        category: document.getElementById('category').value,
                        date: pDateStr,
                        paymentMethod: pm,
                        goalId,
                        createdAt: firebase.firestore.FieldValue.serverTimestamp(),
                        groupId,
                        installmentTotal: numInst,
                        totalAmount
                    };
                    await transactionsCollection.add(payload);
                }
            }
        }

        transactionModal.classList.remove('active');
        formTransaction.reset();
        handleInstallmentVisibility();
        document.querySelector('#transaction-modal h2').textContent = "Nova Transação";
        editingTransactionId = null;
        launchingFixedId = null;
        launchingCardId = null;

        updateAppUI();

        if (expandedCardId) {
            setTimeout(() => window.filterCardExtract(expandedCardId), 200);
        }

        if (currentBankFilter.id) {
            setTimeout(() => window.filterBankExtract(currentBankFilter.id), 200);
        }

        if (document.getElementById('page-transacoes').classList.contains('active')) {
            setTimeout(() => applyTransacoesFilters(), 200);
        }

    } catch (e) {
        alert("Erro ao salvar: " + e.message);
    }
});

window.editTransaction = (id) => {
    const tabs = document.getElementById('tx-modal-tabs');
    if (tabs) tabs.style.display = 'none';
    if (window.resetBulkMode) window.resetBulkMode();

    const t = transactions.find(t => t.id === id);
    if (!t) return;

    if (t.groupId) {
        if (confirm('Esta transação faz parte de um parcelamento em multiplas vezes.\n\nDeseja editar TODAS as faturas juntas (o que apagará os registros atuais e re-gerará os novos a partir de hoje) ou editar apenas este lançamento individual? \n\n[OK] para Editar Completo \n[Cancelar] para Individual')) {
            document.querySelector(`#type-${t.type}`).checked = true;

            const baseDesc = t.description.replace(/\s\(\d+\/\d+\)$/, '');
            document.getElementById('description').value = baseDesc;

            document.getElementById('amount').value = t.totalAmount;

            document.getElementById('date').value = t.date;
            document.getElementById('category').value = t.category;
            populateGoalsSelect();
            document.getElementById('transaction-goal').value = t.goalId || '';

            if (t.paymentMethod) {
                paymentMethod.value = t.paymentMethod;
            } else {
                paymentMethod.value = 'checking';
            }
            handleInstallmentVisibility();
            installmentsSelect.value = t.installmentTotal || 1;

            editingTransactionId = null;
            editingGroupId = t.groupId;

            document.querySelector('#transaction-modal h2').textContent = "Editar Múltiplas Parcelas";
            transactionModal.classList.add('active');
            return;
        }
    }

    document.querySelector(`#type-${t.type}`).checked = true;
    document.getElementById('description').value = t.description;
    document.getElementById('amount').value = t.amount;
    document.getElementById('date').value = t.date;
    document.getElementById('category').value = t.category;
    populateGoalsSelect();
    document.getElementById('transaction-goal').value = t.goalId || '';

    if (t.paymentMethod) {
        paymentMethod.value = t.paymentMethod;
    } else {
        paymentMethod.value = 'checking';
    }
    handleInstallmentVisibility();
    installmentsContainer.style.display = 'none';

    editingTransactionId = id;
    document.querySelector('#transaction-modal h2').textContent = "Editar Transação";
    transactionModal.classList.add('active');
};

window.deleteTransaction = async (id) => {
    const tx = transactions.find(t => t.id === id);
    if (!tx) return;

    if (tx.groupId) {
        if (confirm('Esta é uma transação parcelada. Deseja excluir TODAS as parcelas associadas a esta compra?\n\n[OK] Sim, apagar todas\n[Cancelar] Não, apagar apenas essa individual')) {
            const snap = await transactionsCollection.where("groupId", "==", tx.groupId).get();
            const batch = db.batch();
            snap.forEach(doc => batch.delete(doc.ref));
            await batch.commit();
            return;
        }
    }

    if (confirm('Excluir transação individualmente?')) {
        await transactionsCollection.doc(id).delete();
    }
};

function populateGoalsSelect() {
    const goalSelect = document.getElementById('transaction-goal');
    if (!goalSelect) {
        // Se o select não existir, cria ele no DOM
        const categoryGroup = document.getElementById('category')?.closest('.form-group');
        if (categoryGroup) {
            const goalGroup = document.createElement('div');
            goalGroup.className = 'form-group';
            goalGroup.innerHTML = `
                <label for="transaction-goal">Vincular à Meta (Opcional)</label>
                <select id="transaction-goal" class="form-input">
                    <option value="">Nenhuma</option>
                </select>
            `;
            categoryGroup.parentNode.insertBefore(goalGroup, categoryGroup.nextSibling);
        }
    }

    const select = document.getElementById('transaction-goal');
    if (!select) return;

    let options = '<option value="">Nenhuma</option>';
    goalsList.forEach(g => {
        const perc = g.targetValue > 0 ? ((g.currentValue / g.targetValue) * 100).toFixed(0) : 0;
        options += `<option value="${g.id}">${g.name} (${perc}%)</option>`;
    });

    select.innerHTML = options;
}

// =============================================================================
// SEÇÃO 12 — METAS 
// =============================================================================

function listenForGoals() {
    if (unsGoals) unsGoals();
    unsGoals = goalsCollection.where("userId", "==", currentUser.uid).orderBy("createdAt", "desc")
        .onSnapshot(snap => {
            goalsList = [];
            snap.forEach(doc => goalsList.push({ id: doc.id, ...doc.data() }));
            renderGoals();
            populateGoalsSelect();
        }, e => console.error("Goal snapshot error:", e.message));
}

formGoal.addEventListener('submit', async (e) => {
    e.preventDefault();
    try {
        await goalsCollection.add({
            userId: currentUser.uid,
            name: document.getElementById('goal-name').value,
            targetValue: parseCurrencyInput(document.getElementById('goal-target').value),
            currentValue: parseCurrencyInput(document.getElementById('goal-current').value),
            createdAt: firebase.firestore.FieldValue.serverTimestamp()
        });
        goalModal.classList.remove('active');
        formGoal.reset();
    } catch (e) { alert("Erro: " + e.message); }
});

window.addFundsToGoal = (id, current, max) => {
    const modal = document.getElementById('goal-contribution-modal');
    const form = document.getElementById('form-goal-contribution');

    document.getElementById('contribution-goal-id').value = id;
    document.getElementById('contribution-goal-current').value = current;
    document.getElementById('contribution-goal-max').value = max;

    form.reset();
    document.getElementById('goal-contribution-amount').value = '';
    document.getElementById('contribution-source-select').value = '';
    document.getElementById('contribution-category').value = 'Investimentos';

    document.querySelector('input[name="contribution-source"][value="source"]').checked = true;
    document.getElementById('contribution-source-select-container').style.display = 'block';
    document.getElementById('contribution-category-container').style.display = 'block';

    populateContributionSourceSelect();

    modal.classList.add('active');
};

function populateContributionSourceSelect() {
    const select = document.getElementById('contribution-source-select');
    if (!select) return;

    let opts = '<option value="" disabled selected>Selecione uma conta ou cartão...</option>';

    if (banksList.length > 0) {
        banksList.forEach(b => {
            const balance = b.balance || 0;
            opts += `<option value="bank_${b.id}" data-type="bank">🏦 ${b.name} (Saldo: ${formatCurrency(balance)})</option>`;
        });
    }

    if (cardsList.length > 0) {
        cardsList.forEach(c => {
            const spentOnCard = transactions
                .filter(t => t.paymentMethod === c.id)
                .reduce((acc, t) => acc + (t.type === 'expense' ? t.amount : -t.amount), 0);
            const availableLimit = c.limit - spentOnCard;
            opts += `<option value="card_${c.id}" data-type="card">💳 ${c.nickname} (${c.bank}) - Disponível: ${formatCurrency(availableLimit)}</option>`;
        });
    }

    if (banksList.length === 0 && cardsList.length === 0) {
        opts = '<option value="" disabled selected>Nenhuma conta ou cartão cadastrado</option>';
    }

    select.innerHTML = opts;
}

document.querySelectorAll('input[name="contribution-source"]').forEach(radio => {
    radio.addEventListener('change', function () {
        const container = document.getElementById('contribution-source-select-container');
        const categoryContainer = document.getElementById('contribution-category-container');

        if (this.value === 'none') {
            container.style.display = 'none';
            categoryContainer.style.display = 'none';
        } else {
            container.style.display = 'block';
            categoryContainer.style.display = 'block';
        }
    });
});

document.getElementById('form-goal-contribution').addEventListener('submit', async function (e) {
    e.preventDefault();

    const goalId = document.getElementById('contribution-goal-id').value;
    const current = parseFloat(document.getElementById('contribution-goal-current').value);
    const max = parseFloat(document.getElementById('contribution-goal-max').value);
    const amount = parseCurrencyInput(document.getElementById('goal-contribution-amount').value);
    const source = document.querySelector('input[name="contribution-source"]:checked').value;
    const sourceSelect = document.getElementById('contribution-source-select').value;
    const category = document.getElementById('contribution-category').value;

    if (!amount || amount <= 0) {
        alert('Por favor, insira um valor válido.');
        return;
    }

    if (source !== 'none' && !sourceSelect) {
        alert('Por favor, selecione a conta ou cartão de origem.');
        return;
    }

    try {
        const newValue = Math.min(current + amount, max);
        await goalsCollection.doc(goalId).update({ currentValue: newValue });

        if (source !== 'none') {
            const sourceParts = sourceSelect.split('_');
            const sourceType = sourceParts[0];
            const sourceId = sourceParts[1];

            let sourceName = '';
            if (sourceType === 'bank') {
                const bank = banksList.find(b => b.id === sourceId);
                sourceName = bank ? bank.name : 'Conta';
            } else if (sourceType === 'card') {
                const card = cardsList.find(c => c.id === sourceId);
                sourceName = card ? card.nickname : 'Cartão';
            }

            const goal = goalsList.find(g => g.id === goalId);
            const goalName = goal ? goal.name : 'Meta';

            const transactionData = {
                userId: currentUser.uid,
                type: 'expense',
                description: `Aporte para Meta: ${goalName} (${sourceName})`,
                amount: amount,
                category: category || 'Investimentos',
                date: new Date().toISOString().slice(0, 10),
                paymentMethod: sourceId,
                createdAt: firebase.firestore.FieldValue.serverTimestamp(),
                goalId: goalId
            };

            await transactionsCollection.add(transactionData);

            if (typeof showMessage === 'function') {
                showMessage(`Aporte de ${formatCurrency(amount)} adicionado com sucesso!`);
            }
        }

        document.getElementById('goal-contribution-modal').classList.remove('active');

        renderGoals();
        updateAppUI();

    } catch (error) {
        alert('Erro ao adicionar aporte: ' + error.message);
    }
});

document.getElementById('close-goal-contribution-modal').addEventListener('click', () => {
    document.getElementById('goal-contribution-modal').classList.remove('active');
});

document.getElementById('btn-cancel-contribution').addEventListener('click', () => {
    document.getElementById('goal-contribution-modal').classList.remove('active');
});

document.getElementById('goal-contribution-modal').addEventListener('click', (e) => {
    if (e.target === e.currentTarget) {
        document.getElementById('goal-contribution-modal').classList.remove('active');
    }
});

window.deleteGoal = async (id) => {
    if (confirm('A meta será excluída. Continuar?')) await goalsCollection.doc(id).delete();
};

function renderGoals() {
    goalsListGrid.innerHTML = '';
    if (goalsList.length === 0) {
        goalsListGrid.innerHTML = `<div class="empty-state w-100" style="grid-column: 1/-1;"><i class="fa-solid fa-piggy-bank"></i><p>Nenhuma meta ativa.</p></div>`;
        return;
    }

    goalsList.forEach(g => {
        const perc = Math.min((g.currentValue / g.targetValue) * 100, 100).toFixed(1);
        const isDone = perc >= 100;
        const falta = g.targetValue - g.currentValue;
        const faltaFormatada = falta > 0 ? formatCurrency(falta) : 'R$ 0,00';

        goalsListGrid.innerHTML += `
        <div class="goal-card">
            <div class="goal-header">
                <h3>${g.name}</h3>
                <span class="percent" style="color: ${isDone ? 'var(--success)' : 'var(--primary)'}">${perc}%</span>
            </div>
            <div class="progress-container">
                <div class="progress-bar" style="width: ${perc}%; background: ${isDone ? 'var(--success)' : 'linear-gradient(90deg, var(--primary), #818cf8)'};"></div>
            </div>
            <div class="goal-footer">
                <div class="goal-values">
                    <p>Atual: <strong>${formatCurrency(g.currentValue)}</strong></p>
                    <p>Total: <strong>${formatCurrency(g.targetValue)}</strong></p>
                    ${falta > 0 ? `<p style="margin-top: 4px;">Falta: <strong>${faltaFormatada}</strong></p>` : `<p style="color: var(--success); margin-top: 4px;">✅ Meta alcançada!</p>`}
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


// =============================================================================
// SEÇÃO 13 — CATEGORIAS
// =============================================================================

const defaultCategories = [
    { name: 'Salário', icon: 'fa-sack-dollar' },
    { name: 'Alimentação', icon: 'fa-utensils' },
    { name: 'Moradia', icon: 'fa-house' },
    { name: 'Transporte', icon: 'fa-car' },
    { name: 'Lazer', icon: 'fa-gamepad' },
    { name: 'Saúde', icon: 'fa-heart-pulse' },
    { name: 'Investimentos', icon: 'fa-chart-line' },
    { name: 'Cartão', icon: 'fa-credit-card' },
    { name: 'Outros', icon: 'fa-tag' }
];

const iconLibrary = ['fa-tag', 'fa-utensils', 'fa-house', 'fa-car', 'fa-gamepad', 'fa-heart-pulse', 'fa-chart-line', 'fa-sack-dollar', 'fa-bag-shopping', 'fa-basket-shopping', 'fa-plane', 'fa-bolt', 'fa-mobile', 'fa-graduation-cap', 'fa-dog', 'fa-shirt', 'fa-music', 'fa-gift', 'fa-scissors', 'fa-wrench', 'fa-book', 'fa-cart-shopping'];

let isSeedingCategories = false;

async function seedCategories() {
    if (isSeedingCategories) return;
    isSeedingCategories = true;

    try {
        console.log('Verificando categorias padrão...');

        // Busca categorias existentes
        const existingSnap = await categoriesCollection
            .where('userId', '==', currentUser.uid)
            .get();

        // Cria um Set com os nomes existentes (normalizados)
        const existingNames = new Set();
        existingSnap.forEach(doc => {
            const name = doc.data().name?.trim().toLowerCase();
            if (name) existingNames.add(name);
        });

        console.log(`Categorias existentes: ${existingNames.size}`);

        // Filtra apenas as que não existem
        const categoriesToAdd = defaultCategories.filter(
            cat => !existingNames.has(cat.name.trim().toLowerCase())
        );

        if (categoriesToAdd.length === 0) {
            console.log('Todas as categorias padrão já existem.');
            return;
        }

        console.log(`Adicionando ${categoriesToAdd.length} novas categorias...`);

        // Adiciona em lote
        const batch = db.batch();
        categoriesToAdd.forEach(cat => {
            const docRef = categoriesCollection.doc();
            batch.set(docRef, {
                userId: currentUser.uid,
                name: cat.name.trim(),
                icon: cat.icon
            });
        });

        await batch.commit();
        console.log(`${categoriesToAdd.length} categorias adicionadas com sucesso!`);

    } catch (error) {
        console.error('Erro ao semear categorias:', error);
    } finally {
        isSeedingCategories = false;
    }
}

async function cleanDuplicateCategories() {
    try {
        console.log('Limpando categorias duplicadas...');

        const snap = await categoriesCollection
            .where('userId', '==', currentUser.uid)
            .get();

        const nameMap = new Map();
        const duplicates = [];

        snap.forEach(doc => {
            const data = doc.data();
            const name = data.name?.trim();

            if (!name) {
                // Remove categorias sem nome
                duplicates.push(doc.id);
                return;
            }

            const key = name.toLowerCase();
            if (nameMap.has(key)) {
                // É uma duplicata
                duplicates.push(doc.id);
            } else {
                nameMap.set(key, { id: doc.id, name, data });
            }
        });

        if (duplicates.length === 0) {
            console.log('Nenhuma categoria duplicada encontrada.');
            return;
        }

        console.log(`Encontradas ${duplicates.length} categorias duplicadas. Removendo...`);

        // Remove as duplicatas em lote
        const batch = db.batch();
        duplicates.forEach(id => {
            batch.delete(categoriesCollection.doc(id));
        });
        await batch.commit();

        console.log(`${duplicates.length} categorias duplicadas removidas.`);

    } catch (error) {
        console.error('Erro ao limpar duplicatas:', error);
    }
}

function listenForCategories() {
    if (unsCategories) unsCategories();

    // Flag para controlar se já estamos processando
    let isProcessing = false;

    unsCategories = categoriesCollection.where('userId', '==', currentUser.uid).onSnapshot(async snap => {
        // Se já está processando, ignora
        if (isProcessing) return;
        isProcessing = true;

        try {
            // Primeiro, verifica se há dados
            if (snap.empty) {
                // Verifica se já existem categorias na lista
                if (categoriesList.length === 0) {
                    console.log('Nenhuma categoria encontrada, iniciando seed...');
                    await seedCategories();
                }
                isProcessing = false;
                return;
            }

            // Atualiza a lista de categorias
            const newCategories = [];
            snap.forEach(doc => {
                const data = doc.data();
                // Evita duplicatas pelo nome
                const exists = newCategories.some(c => c.name === data.name);
                if (!exists) {
                    newCategories.push({ id: doc.id, ...data });
                }
            });

            // Ordena e atualiza
            categoriesList = newCategories.sort((a, b) => a.name.localeCompare(b.name));

            // Renderiza
            renderCategories();
            populateCategorySelects();

        } catch (error) {
            console.error('Erro ao processar categorias:', error);
        } finally {
            isProcessing = false;
        }
    });
}

function populateCategorySelects() {
    const opts = categoriesList.map(c => `<option value="${c.name}">${c.name}</option>`).join('');
    document.getElementById('category').innerHTML = `<option value="" disabled selected>Selecione</option>` + opts;
    document.getElementById('fixed-category').innerHTML = `<option value="" disabled selected>Selecione</option>` + opts;
    document.getElementById('filter-category').innerHTML = `<option value="all">Todas Categ.</option>` + opts;
}

function renderCategoryIconsPicker() {
    if (!categoryIconsGrid) return;
    categoryIconsGrid.innerHTML = iconLibrary.map(icon => `
        <div class="icon-option" onclick="window.selectCategoryIcon('${icon}', this)" style="display:flex; justify-content:center; align-items:center; width: 40px; height: 40px; border-radius: 8px; border: 1px solid var(--border); cursor: pointer; transition: 0.2s;">
            <i class="fa-solid ${icon}"></i>
        </div>
    `).join('');
}

window.selectCategoryIcon = (icon, el) => {
    document.getElementById('category-icon').value = icon;
    document.querySelectorAll('.icon-option').forEach(n => {
        n.style.borderColor = 'var(--border)';
        n.style.borderWidth = '1px';
    });
    el.style.borderColor = '#8b5cf6';
    el.style.borderWidth = '2px';
};

function renderCategories() {
    if (!categoriesListGrid) return;
    categoriesListGrid.innerHTML = '';

    if (categoriesList.length === 0) {
        categoriesListGrid.innerHTML = `
            <div class="empty-state w-100" style="grid-column: 1/-1;">
                <i class="fa-solid fa-tags"></i>
                <p>Nenhuma categoria cadastrada.</p>
                <p style="font-size: 0.85rem; margin-top: 8px;">Clique em "Nova Categoria" para criar sua primeira categoria.</p>
            </div>
        `;
        return;
    }

    categoriesList.forEach(c => {
        categoriesListGrid.innerHTML += `
            <div class="category-ui category-list-item" style="background:var(--bg-secondary); border: 1px solid var(--border); padding: 8px; border-radius: 12px; display:flex; align-items:center; justify-content:space-between; transition: 0.2s; overflow: hidden;">
                <div style="display:flex; align-items:center; gap: 12px; min-width: 0; flex: 1;">
                    <div style="width: 20px; height: 20px; border-radius: 50%; background:var(--bg-main); color:var(--text-main); display:flex; align-items:center; justify-content:center; font-size: 0.8rem; border: 1px solid var(--border); flex-shrink: 0;">
                        <i class="fa-solid ${c.icon || 'fa-tag'}"></i>
                    </div>
                    <span style="font-weight: 600; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; flex: 1;">${c.name}</span>
                </div>
                <div style="display:flex; gap: 8px; flex-shrink: 0;">
                    <button class="btn-icon" onclick="window.editCategory('${c.id}')" title="Editar Categoria">
                        <i class="fa-solid fa-pen" style="color:var(--text-muted)"></i>
                    </button>
                    <button class="btn-icon" onclick="window.deleteCategory('${c.id}')" title="Excluir Categoria">
                        <i class="fa-solid fa-trash" style="color:var(--danger)"></i>
                    </button>
                </div>
            </div>
        `;
    });
}

window.editCategory = (id) => {
    const category = categoriesList.find(c => c.id === id);
    if (!category) return;

    document.getElementById('category-id').value = category.id;
    document.getElementById('category-name').value = category.name;
    document.getElementById('category-icon').value = category.icon || 'fa-tag';

    document.getElementById('category-modal-title').textContent = 'Editar Categoria';
    document.getElementById('category-submit-text').textContent = 'Atualizar Categoria';

    document.querySelectorAll('.icon-option').forEach(el => {
        const icon = el.querySelector('i');
        if (icon && icon.classList.contains(category.icon)) {
            el.style.borderColor = '#8b5cf6';
            el.style.borderWidth = '2px';
        } else {
            el.style.borderColor = 'var(--border)';
            el.style.borderWidth = '1px';
        }
    });

    categoryModal.classList.add('active');
};

function resetCategoryForm() {
    document.getElementById('category-id').value = '';
    document.getElementById('category-name').value = '';
    document.getElementById('category-icon').value = '';
    document.getElementById('category-modal-title').textContent = 'Nova Categoria';
    document.getElementById('category-submit-text').textContent = 'Salvar Categoria';

    document.querySelectorAll('.icon-option').forEach(el => {
        el.style.borderColor = 'var(--border)';
        el.style.borderWidth = '1px';
    });
}

window.deleteCategory = async (id) => {
    const category = categoriesList.find(c => c.id === id);
    if (!category) return;

    const transactionsUsingCategory = transactions.filter(t => t.category === category.name);
    const fixedUsingCategory = fixedTransactionsList.filter(t => t.category === category.name);
    const totalUsage = transactionsUsingCategory.length + fixedUsingCategory.length;

    let confirmMessage = `Excluir a categoria "${category.name}"?`;
    if (totalUsage > 0) {
        confirmMessage += `\n\n⚠️ Esta categoria está sendo usada em ${totalUsage} transação(ões).\nAs transações existentes NÃO serão alteradas e ficarão com o nome "${category.name}" como categoria.`;
    }
    confirmMessage += `\n\nDeseja continuar?`;

    if (!confirm(confirmMessage)) return;

    try {
        await categoriesCollection.doc(id).delete();

        if (typeof showMessage === 'function') {
            showMessage(`Categoria "${category.name}" excluída com sucesso!`);
        }
    } catch (error) {
        alert('Erro ao excluir categoria: ' + error.message);
    }
};

formCategory.addEventListener('submit', async (e) => {
    e.preventDefault();

    const id = document.getElementById('category-id').value;
    const name = document.getElementById('category-name').value;
    const icon = document.getElementById('category-icon').value || 'fa-tag';

    const nameTrimmed = name.trim();
    if (!nameTrimmed) return alert("Por favor, digite um nome válido para a categoria.");

    const nameLower = nameTrimmed.toLowerCase();

    const exists = categoriesList.some(c =>
        c.name.trim().toLowerCase() === nameLower && c.id !== id
    );

    if (exists) {
        alert("Já existe uma categoria com este nome.");
        return;
    }

    try {
        if (id) {
            await categoriesCollection.doc(id).update({
                name: nameTrimmed,
                icon: icon
            });
        } else {
            await categoriesCollection.add({
                userId: currentUser.uid,
                name: nameTrimmed,
                icon: icon
            });
        }

        categoryModal.classList.remove('active');
        formCategory.reset();
        resetCategoryForm();

        if (typeof showMessage === 'function') {
            showMessage(id ? 'Categoria atualizada com sucesso!' : 'Categoria criada com sucesso!');
        }

    } catch (err) {
        alert("Erro ao salvar categoria: " + err.message);
    }
});

btnNewCategory.addEventListener('click', () => {
    resetCategoryForm();
    formCategory.reset();
    document.getElementById('category-icon').value = '';
    document.querySelectorAll('.icon-option').forEach(n => {
        n.style.borderColor = 'var(--border)';
        n.style.borderWidth = '1px';
    });
    categoryModal.classList.add('active');
});

btnCancelCategory.addEventListener('click', () => {
    categoryModal.classList.remove('active');
    resetCategoryForm();
});

closeCategoryModal.addEventListener('click', () => {
    categoryModal.classList.remove('active');
    resetCategoryForm();
});

// =============================================================================
// SEÇÃO 14 — TRANSAÇÕES FIXAS
// =============================================================================

function checkAutomaticFixedTransactions() {
    const currentMonth = new Date().toISOString().slice(0, 7);
    const currentDay = new Date().getDate();

    fixedTransactionsList.forEach(async ft => {
        if (ft.isAutomatic) {
            if (currentDay >= ft.dayOfMonth && ft.lastProcessedMonth !== currentMonth) {
                ft.lastProcessedMonth = currentMonth;
                try {
                    await transactionsCollection.add({
                        userId: currentUser.uid,
                        type: ft.type,
                        description: ft.description + ` (Automática)`,
                        amount: ft.amount,
                        date: new Date().toISOString().slice(0, 10),
                        category: ft.category,
                        paymentMethod: ft.paymentMethod || '',
                        fixedTransactionId: ft.id,
                        createdAt: firebase.firestore.FieldValue.serverTimestamp()
                    });
                    await fixedTransactionsCollection.doc(ft.id).update({
                        lastProcessedMonth: currentMonth
                    });
                } catch (e) {
                    console.error("Erro processamento automático:", e);
                }
            }
        }
    });
}

formFixedTransaction.addEventListener('submit', async (e) => {
    e.preventDefault();
    const type = document.querySelector('input[name="fixed-type"]:checked').value;
    const description = document.getElementById('fixed-description').value;
    const amount = parseCurrencyInput(document.getElementById('fixed-amount').value);
    const category = document.getElementById('fixed-category').value;
    const isAutomatic = document.getElementById('fixed-is-automatic').checked;
    let dayOfMonth = parseInt(document.getElementById('fixed-day').value);

    if (isNaN(dayOfMonth) || dayOfMonth < 1 || dayOfMonth > 31) {
        dayOfMonth = new Date().getDate();
    }

    if (!description || isNaN(amount) || amount <= 0) {
        return alert('Campos inválidos!');
    }

    const payload = {
        userId: currentUser.uid,
        type,
        description,
        amount,
        category,
        isAutomatic,
        dayOfMonth
    };

    try {
        if (editingFixedId) {
            await fixedTransactionsCollection.doc(editingFixedId).update(payload);
        } else {
            await fixedTransactionsCollection.add(payload);
        }
        fixedTransactionModal.classList.remove('active');
        formFixedTransaction.reset();
        document.querySelector('#fixed-transaction-modal h2').textContent = "Nova Transação Fixa";
        editingFixedId = null;
    } catch (e) { alert("Erro ao salvar: " + e.message); }
});

window.editFixedTransaction = (id) => {
    const t = fixedTransactionsList.find(t => t.id === id);
    if (!t) return;

    document.querySelector(`#fixed-type-${t.type}`).checked = true;
    document.getElementById('fixed-description').value = t.description;
    document.getElementById('fixed-amount').value = t.amount;
    document.getElementById('fixed-category').value = t.category;
    document.getElementById('fixed-is-automatic').checked = t.isAutomatic;
    document.getElementById('fixed-day').value = t.dayOfMonth || 1;

    editingFixedId = id;
    document.querySelector('#fixed-transaction-modal h2').textContent = "Editar Transação Fixa";
    fixedTransactionModal.classList.add('active');
};

window.deleteFixedTransaction = async (id) => {
    if (confirm('Deseja excluir esta transação recorrente? Isso não alterará o histórico passado.')) {
        await fixedTransactionsCollection.doc(id).delete();
    }
};

window.launchManualFixedTransaction = async (id) => {
    const ft = fixedTransactionsList.find(t => t.id === id);
    if (!ft) return;

    editingTransactionId = null;
    launchingFixedId = ft.id;

    document.querySelector('#transaction-modal h2').textContent = "Lançar Transação Fixa";
    formTransaction.reset();

    document.querySelector(`#type-${ft.type}`).checked = true;
    document.getElementById('description').value = ft.description;
    document.getElementById('amount').value = ft.amount;
    document.getElementById('date').value = new Date().toISOString().slice(0, 10);
    document.getElementById('category').value = ft.category;
    if (paymentMethod) paymentMethod.value = ft.paymentMethod || '';

    transactionModal.classList.add('active');
};

window.launchCardFatura = async (cardId, amountStr) => {
    const c = cardsList.find(x => x.id === cardId);
    if (!c) return;

    launchingCardId = c.id;
    const isAdvance = parseFloat(amountStr) === 0;

    document.getElementById('card-payment-title').textContent = isAdvance ? `Adiantar Pagamento: ${c.nickname}` : `Pagar Fatura: ${c.nickname}`;

    const totalContainer = document.getElementById('card-payment-total-container');
    if (totalContainer) {
        totalContainer.style.display = isAdvance ? 'none' : 'block';
    }

    document.getElementById('card-payment-total-display').textContent = formatCurrency(parseFloat(amountStr));

    let valToPay = parseFloat(amountStr) > 0 ? parseFloat(amountStr).toFixed(2) : '';
    document.getElementById('card-payment-amount').value = valToPay ? valToPay.replace('.', ',') : '';
    document.getElementById('card-payment-interest').value = '';
    document.getElementById('card-payment-date').value = new Date().toISOString().slice(0, 10);

    cardPaymentModal.classList.add('active');
};

formCardPayment.addEventListener('submit', async (e) => {
    e.preventDefault();

    const amountStr = document.getElementById('card-payment-amount').value;
    const interestStr = document.getElementById('card-payment-interest').value;
    const paymentDateStr = document.getElementById('card-payment-date').value;

    const amount = parseCurrencyInput(amountStr);
    const interest = parseCurrencyInput(interestStr);
    const sourceBankId = document.getElementById('card-payment-source-bank').value;

    if (isNaN(amount) || amount <= 0) {
        alert('Por favor, insira um valor válido para o pagamento.');
        return;
    }

    if (!sourceBankId) {
        alert('Por favor, selecione uma conta de origem.');
        return;
    }

    if (!paymentDateStr) {
        alert('Por favor, selecione a data do pagamento.');
        return;
    }

    const c = cardsList.find(x => x.id === launchingCardId);
    if (!c) {
        alert('Cartão não encontrado. Tente novamente.');
        return;
    }

    try {
        const bank = banksList.find(b => b.id === sourceBankId);
        if (bank) {
            const bankTransactions = transactions.filter(t => t.paymentMethod === sourceBankId);
            const revenue = bankTransactions.filter(t => t.type === 'income').reduce((acc, t) => acc + t.amount, 0);
            const expenses = bankTransactions.filter(t => t.type === 'expense').reduce((acc, t) => acc + t.amount, 0);
            const currentBalance = (bank.balance || 0) + revenue - expenses;

            if (currentBalance < (amount + interest)) {
                if (!confirm(`Saldo insuficiente na conta "${bank.name}".\nSaldo atual: ${formatCurrency(currentBalance)}\nValor do pagamento: ${formatCurrency(amount + interest)}\n\nDeseja continuar mesmo assim?`)) {
                    return;
                }
            }
        }

        const batch = db.batch();
        const now = paymentDateStr;

        const expenseRef = transactionsCollection.doc();
        batch.set(expenseRef, {
            userId: currentUser.uid,
            type: 'expense',
            description: `Pagamento Fatura: ${c.nickname}`,
            amount: amount + interest,
            category: 'Cartão',
            date: now,
            paymentMethod: sourceBankId,
            createdAt: firebase.firestore.FieldValue.serverTimestamp()
        });

        const incomeRef = transactionsCollection.doc();
        batch.set(incomeRef, {
            userId: currentUser.uid,
            type: 'income',
            description: `Pagamento Recebido - ${c.nickname}`,
            amount: amount,
            category: 'Cartão',
            date: now,
            paymentMethod: c.id,
            createdAt: firebase.firestore.FieldValue.serverTimestamp()
        });

        const currentMonth = new Date().toISOString().slice(0, 7);
        batch.update(cardsCollection.doc(c.id), {
            lastProcessedMonth: currentMonth
        });

        await batch.commit();

        cardPaymentModal.classList.remove('active');
        formCardPayment.reset();
        launchingCardId = null;

        if (typeof showMessage === 'function') {
            showMessage(`Pagamento de ${formatCurrency(amount + interest)} para ${c.nickname} efetuado com sucesso!`);
        } else {
            alert(`Pagamento de ${formatCurrency(amount + interest)} para ${c.nickname} efetuado com sucesso!`);
        }

        updateAppUI();

        if (expandedCardId) {
            setTimeout(() => window.filterCardExtract(expandedCardId), 200);
        }

        if (currentBankFilter.id) {
            setTimeout(() => window.filterBankExtract(currentBankFilter.id), 200);
        }

        renderFixedTransactions();

    } catch (error) {
        console.error('Erro ao pagar fatura:', error);
        if (typeof showMessage === 'function') {
            showMessage('Erro ao pagar fatura: ' + error.message, true);
        } else {
            alert('Erro ao pagar fatura: ' + error.message);
        }
    }
});

function getCategoryIcon(catName) {
    const c = categoriesList.find(x => x.name === catName);
    return c ? c.icon : 'fa-tag';
}

function renderFixedTransactions() {
    transactionListFixed.innerHTML = '';
    if (fixedTransactionsList.length === 0 && cardsList.length === 0) {
        transactionListFixed.innerHTML = `<div class="empty-state"><i class="fa-solid fa-repeat"></i><p>Nenhuma transação fixa cadastrada.</p></div>`;
        return;
    }

    const currentMonth = new Date().toISOString().slice(0, 7);

    fixedTransactionsList.forEach(t => {
        const isInc = t.type === 'income';
        const s = isInc ? '+' : '-';
        const autoText = t.isAutomatic ? `Todo dia ${t.dayOfMonth} (Auto)` : `Lançamento Manual (Venc. Dia ${t.dayOfMonth})`;

        const isProcessedThisMonth = t.lastProcessedMonth === currentMonth;
        let statusBadge = '';
        if (isProcessedThisMonth) {
            statusBadge = `<span style="font-size: 0.65rem; background: var(--success-bg); color: var(--success); padding: 4px 8px; border-radius: 12px; font-weight: 700; margin-left: 12px;"><i class="fa-solid fa-check"></i> Lançado este mês</span>`;
        }

        let launchBtn = !isProcessedThisMonth ? `<button class="btn-icon" onclick="window.launchManualFixedTransaction('${t.id}')" title="Lançar agora"><i class="fa-solid fa-play" style="color:var(--success)"></i></button>` : '';

        transactionListFixed.innerHTML += `
            <div class="transaction-item">
                <div class="tx-left" style="flex: 1;">
                    <div class="tx-icon ${isInc ? 'income' : 'expense'}"><i class="fa-solid ${isInc ? 'fa-arrow-up' : 'fa-arrow-down'}"></i></div>
                    <div class="tx-details">
                        <p class="tx-title" style="display:flex; align-items:center;">${t.description} ${statusBadge}</p>
                        <p class="tx-category"><i class="fa-solid ${getCategoryIcon(t.category)}"></i> ${t.category} | ${autoText}</p>
                    </div>
                </div>
                <div class="tx-right">
                    <p class="tx-amount ${isInc ? 'positive' : 'negative'}">${s} ${formatCurrency(t.amount)}</p>
                </div>
                <div class="tx-actions" style="display:flex; gap: 8px;">
                    ${launchBtn}
                    <button class="btn-icon" onclick="window.editFixedTransaction('${t.id}')" title="Editar"><i class="fa-solid fa-pen"></i></button>
                    <button class="btn-icon" onclick="window.deleteFixedTransaction('${t.id}')" title="Excluir"><i class="fa-solid fa-trash"></i></button>
                </div>
            </div>`;
    });

    cardsList.forEach(c => {
        const spentOnCard = transactions
            .filter(t => t.paymentMethod === c.id && t.date && t.date.startsWith(currentMonth))
            .reduce((acc, t) => acc + (t.type === 'expense' ? t.amount : -t.amount), 0);

        const autoText = `Pagamento de Fatura (Venc. Dia ${c.dueDay})`;
        const isProcessedThisMonth = c.lastProcessedMonth === currentMonth;

        let statusBadge = '';
        if (isProcessedThisMonth) {
            statusBadge = `<span style="font-size: 0.65rem; background: var(--success-bg); color: var(--success); padding: 4px 8px; border-radius: 12px; font-weight: 700; margin-left: 12px;"><i class="fa-solid fa-check"></i> Pago este mês</span>`;
        }

        let launchBtn = !isProcessedThisMonth ? `<button class="btn-icon" onclick="window.launchCardFatura('${c.id}', ${spentOnCard})" title="Pagar Fatura Agora"><i class="fa-solid fa-play" style="color:var(--success)"></i></button>` : '';

        transactionListFixed.innerHTML += `
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

// =============================================================================
// SEÇÃO 15 — CARTÕES DE CRÉDITO
// =============================================================================

formCard.addEventListener('submit', async (e) => {
    e.preventDefault();
    const nickname = document.getElementById('card-nickname').value;
    const bank = document.getElementById('card-bank').value;
    const limit = parseCurrencyInput(document.getElementById('card-limit').value);
    const closingDay = parseInt(document.getElementById('card-closing').value);
    const dueDay = parseInt(document.getElementById('card-due').value);

    if (!nickname || !bank || isNaN(limit) || limit <= 0 || isNaN(closingDay) || closingDay < 1 || isNaN(dueDay) || dueDay < 1) {
        return alert('Campos inválidos!');
    }

    const payload = {
        userId: currentUser.uid,
        nickname,
        bank,
        limit,
        closingDay,
        dueDay
    };

    try {
        if (editingCardId) {
            await cardsCollection.doc(editingCardId).update(payload);
        } else {
            await cardsCollection.add(payload);
        }
        cardModal.classList.remove('active');
        formCard.reset();
        document.querySelector('#card-modal h2').textContent = "Novo Cartão de Crédito";
        editingCardId = null;
    } catch (e) { alert("Erro ao salvar: " + e.message); }
});

window.editCard = (id) => {
    const c = cardsList.find(t => t.id === id);
    if (!c) return;

    document.getElementById('card-nickname').value = c.nickname;
    document.getElementById('card-bank').value = c.bank;
    document.getElementById('card-limit').value = c.limit;
    document.getElementById('card-closing').value = c.closingDay;
    document.getElementById('card-due').value = c.dueDay;

    editingCardId = id;
    document.querySelector('#card-modal h2').textContent = "Editar Cartão";
    cardModal.classList.add('active');
};

window.deleteCard = async (id) => {
    if (confirm('Excluir este cartão permanentemente?')) {
        await cardsCollection.doc(id).delete();
    }
};

function renderCards() {
    populatePaymentMethodSelects();
    cardsListGrid.innerHTML = '';
    if (cardsList.length === 0) {
        cardsListGrid.innerHTML = `<div class="empty-state w-100" style="grid-column: 1/-1;"><i class="fa-solid fa-credit-card"></i><p>Nenhum cartão cadastrado.</p></div>`;
        return;
    }

    const bankClassMap = {
        'Nubank': 'bank-nubank',
        'Banco Inter': 'bank-inter',
        'Itaú': 'bank-itaú',
        'Bradesco': 'bank-bradesco',
        'Santander': 'bank-santander',
        'C6 Bank': 'bank-c6',
        'Banco do Brasil': 'bank-bb',
        'XP Investimentos': 'bank-xp',
        'Caixa Econômica': 'bank-caixa',
        'Outro': 'bank-default'
    };

    cardsList.forEach(c => {
        const bClass = bankClassMap[c.bank] || 'bank-default';

        const spentOnCard = transactions
            .filter(t => t.paymentMethod === c.id)
            .reduce((acc, t) => acc + (t.type === 'expense' ? t.amount : -t.amount), 0);

        const availableLimit = c.limit - spentOnCard;
        const colorVar = availableLimit < 0 ? '#ff6b6b' : 'inherit';

        cardsListGrid.innerHTML += `
            <div class="credit-card-ui ${bClass}" onclick="window.toggleCardExtract('${c.id}', event)" style="cursor: pointer;">
                <div class="cc-header">
                    <span class="cc-bank">${c.bank}</span>
                    <div class="cc-chip"></div>
                </div>
                <div class="cc-info">
                    <p class="cc-name">${c.nickname}</p>
                    <p class="cc-limit" style="font-size:1.25rem; margin-bottom:2px; color:${colorVar};">Disp: ${formatCurrency(availableLimit)}</p>
                    <p style="font-size:0.8rem; margin-bottom: 12px; opacity: 0.8;">Limite Total: ${formatCurrency(c.limit)}</p>
                    <div class="cc-dates">
                        <span>Fec. Dia ${c.closingDay}</span>
                        <span>Venc. Dia ${c.dueDay}</span>
                    </div>
                </div>
                <div class="cc-actions">
                    <button class="btn-icon" onclick="window.editCard('${c.id}')" title="Editar"><i class="fa-solid fa-pen"></i></button>
                    <button class="btn-icon" onclick="window.deleteCard('${c.id}')" title="Excluir"><i class="fa-solid fa-trash"></i></button>
                </div>
            </div>
        `;
    });

    const ec = cardsList.find(c => c.id === expandedCardId);
    if (ec) {
        const savedMonth = currentCardFilter.id === ec.id ? currentCardFilter.month : window.getInvoiceMonth(new Date().toISOString().slice(0, 10), ec.closingDay);

        cardsListGrid.innerHTML += `
        <div class="card-extract-inline">
            <div class="extract-header">
                <h3>
                    <i class="fa-solid fa-credit-card" style="color: var(--primary);"></i>
                    Faturas: ${ec.nickname}
                    <span class="bank-name">(${ec.bank})</span>
                </h3>
                <button class="close-btn btn-icon" onclick="window.closeCardExtract()" title="Fechar extrato">
                    <i class="fa-solid fa-xmark"></i>
                </button>
            </div>
            
            <div class="extract-filters">
                <input type="text" id="cc-filter-search" oninput="window.filterCardExtract('${ec.id}')" 
                    placeholder="Buscar..." class="filter-input search" 
                    value="${currentCardFilter.id === ec.id ? currentCardFilter.search : ''}">
                
                <input type="date" id="cc-filter-start" onchange="window.filterCardExtract('${ec.id}')" 
                    class="filter-input date" title="Data Inicial" 
                    value="${currentCardFilter.id === ec.id ? currentCardFilter.startDate : ''}">
                
                <input type="date" id="cc-filter-end" onchange="window.filterCardExtract('${ec.id}')" 
                    class="filter-input date" title="Data Final" 
                    value="${currentCardFilter.id === ec.id ? currentCardFilter.endDate : ''}">
                
                <div class="month-navigation">
                    <button class="nav-btn btn-icon" onclick="window.navigateCardMonth('${ec.id}', -1)" title="Mês anterior">
                        <i class="fa-solid fa-chevron-left"></i>
                    </button>
                    
                    <input type="month" id="cc-filter-month" value="${savedMonth}" 
                        onchange="window.filterCardExtract('${ec.id}')" class="month-input" title="Mês da Fatura">
                    
                    <button class="nav-btn btn-icon" onclick="window.navigateCardMonth('${ec.id}', 1)" title="Próximo mês">
                        <i class="fa-solid fa-chevron-right"></i>
                    </button>
                    
                    <div class="divider"></div>
                    
                    <button class="reset-btn btn-icon" onclick="window.resetCardMonth('${ec.id}')" title="Voltar para o mês atual">
                        <i class="fa-solid fa-rotate-left"></i>
                    </button>
                </div>
                
                <button class="action-btn anticipate btn btn-outline" onclick="window.launchCardFatura('${ec.id}', 0)">
                    <i class="fa-solid fa-forward"></i> Antecipar Pagamento
                </button>
                
                <button id="btn-pay-invoice-${ec.id}" class="action-btn pay btn btn-success" style="display: none;">
                    <i class="fa-solid fa-check"></i> Pagar Fatura
                </button>
                
                <button class="action-btn report btn btn-primary" onclick="window.generateCardReport('${ec.id}')">
                    <i class="fa-solid fa-print"></i> Relatório
                </button>
            </div>
            
            <div class="transactions-list-container" id="inline-card-transactions">
                <!-- As transações são renderizadas via JavaScript -->
            </div>
            
            <div class="extract-footer">
                <div class="info-group">
                    <span><i class="fa-regular fa-calendar"></i> Fechamento: Dia ${ec.closingDay}</span>
                    <span><i class="fa-regular fa-clock"></i> Vencimento: Dia ${ec.dueDay}</span>
                    <span><i class="fa-solid fa-credit-card"></i> Limite: ${formatCurrency(ec.limit)}</span>
                </div>
                <div>
                    <span id="card-total-transactions-${ec.id}">
                        <i class="fa-regular fa-file-lines"></i> 0 transações
                    </span>
                </div>
            </div>
        </div>`;
    }

    if (expandedCardId) {
        setTimeout(() => window.filterCardExtract(expandedCardId), 50);
    }
}

window.toggleCardExtract = (id, e) => {
    if (e && e.target.closest('button')) return;
    expandedCardId = expandedCardId === id ? null : id;
    renderCards();
};

window.closeCardExtract = () => {
    expandedCardId = null;
    renderCards();
};

window.getInvoiceMonth = (transactionDate, closingDay) => {
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
};

window.filterCardExtract = (id) => {
    const listNode = document.getElementById('inline-card-transactions');
    if (!listNode) return;

    const c = cardsList.find(x => x.id === id);
    if (!c) return;

    currentCardFilter.id = id;
    currentCardFilter.search = document.getElementById('cc-filter-search')?.value || '';
    currentCardFilter.startDate = document.getElementById('cc-filter-start')?.value || '';
    currentCardFilter.endDate = document.getElementById('cc-filter-end')?.value || '';
    currentCardFilter.month = document.getElementById('cc-filter-month')?.value || '';

    const filterSearch = currentCardFilter.search.toLowerCase();
    const dStart = currentCardFilter.startDate;
    const dEnd = currentCardFilter.endDate;
    const filterMonth = currentCardFilter.month;

    let res = transactions.filter(t => t.paymentMethod === id);

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
    transactions.filter(t => t.paymentMethod === id).forEach(t => {
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

    renderTransactions(res, 'inline-card-transactions');

    if (res.length > 0 || accExpenses > 0) {
        const title = filterMonth ? `Resumo da Fatura (${filterMonth})${tagHtml}` : `Resumo Filtrado:`;

        const monthDisplay = filterMonth ? `Mês: ${formatMonthYear(filterMonth)}` : 'Sem filtro de mês';

        let displayHtml = `
            <div style="padding: 16px; margin-bottom: 12px; background: var(--bg-body); border-radius: 8px; border: 1px solid var(--border);">
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px;">
                    <span style="font-weight: 600; font-size: 1.1rem;">${title}</span>
                    <span style="font-size: 0.8rem; color: var(--text-muted);">${monthDisplay}</span>
                </div>
                <div style="display: flex; justify-content: space-between; align-items: center; font-size: 0.9rem; color: var(--text-muted); margin-bottom: 4px;">
                    <span>Movimentação do período:</span>
                    <span style="color: ${monthNet > 0 ? 'var(--danger)' : 'var(--success)'};">${formatCurrency(Math.abs(monthNet))}</span>
                </div>
                ${filterMonth ? `
                <div style="display: flex; justify-content: space-between; align-items: center; font-size: 1.1rem; font-weight: 700; margin-top: 8px; padding-top: 8px; border-top: 1px dashed var(--border);">
                    <span>Restante a Pagar (Acumulado):</span>
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
            btnPay.onclick = () => window.launchCardFatura(id, remainingToPay);
        } else {
            btnPay.style.display = 'none';
        }
    }
};

function formatMonthYear(month) {
    if (!month) return '';
    const [year, monthNum] = month.split('-');
    const months = ['Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho', 'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'];
    return `${months[parseInt(monthNum) - 1]} ${year}`;
}

// =============================================================================
// SEÇÃO 16 — RELATÓRIO DE CARTÃO
// =============================================================================

window.generateCardReport = (id) => {
    const c = cardsList.find(x => x.id === id);
    if (!c) return;

    const filterMonth = document.getElementById('cc-filter-month')?.value;
    if (!filterMonth) {
        alert("Por favor, selecione um mês de fatura.");
        return;
    }

    let res = transactions.filter(t => t.paymentMethod === id);
    res = res.filter(t => window.getInvoiceMonth(t.date, c.closingDay) === filterMonth);

    res.sort((a, b) => new Date(a.date) - new Date(b.date));

    let accExpenses = 0;
    let accIncomes = 0;
    transactions.filter(t => t.paymentMethod === id).forEach(t => {
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

    let html = `
    <html>
    <head>
        <title>Relatório de Fatura - ${c.nickname}</title>
        <style>
            @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');
            body { font-family: 'Inter', sans-serif; color: #1e293b; padding: 40px; }
            .header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 40px; border-bottom: 2px solid #e2e8f0; padding-bottom: 20px; }
            .logo { max-height: 60px; }
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
            @media print {
                body { padding: 0; }
                .no-print { display: none; }
            }
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
            <img src="img/ContaComigoPRO-logo-nobg.png" alt="ContaComigoPRO" class="logo">
        </div>

        <div class="invoice-summary">
            <div>
                <h3>${invoiceTitle}</h3>
                <p>Período base: ${c.closingDay}/${(parseInt(month) - 1) || 12} a ${c.closingDay - 1}/${month}</p>
                <span class="status-tag">${statusText}</span>
            </div>
            <div class="total">
                <div style="font-size: 0.9rem; color: #64748b; font-weight: 400; margin-bottom: 4px;">Restante a Pagar</div>
                ${new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(Math.max(0, remainingToPay))}
            </div>
        </div>

        <table>
            <thead>
                <tr>
                    <th>Data</th>
                    <th>Descrição</th>
                    <th>Categoria</th>
                    <th class="amount">Valor</th>
                </tr>
            </thead>
            <tbody>
    `;

    if (res.length === 0) {
        html += `<tr><td colspan="4" style="text-align: center; color: #94a3b8;">Nenhuma transação nesta fatura.</td></tr>`;
    } else {
        res.forEach(t => {
            const isInc = t.type === 'income';
            const valStr = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(t.amount);
            html += `
                <tr>
                    <td>${formatDate(t.date)}</td>
                    <td>${t.description}</td>
                    <td>${t.category}</td>
                    <td class="amount ${isInc ? 'income' : 'expense'}">${isInc ? '+' : '-'} ${valStr}</td>
                </tr>
            `;
        });
    }

    html += `
            </tbody>
        </table>
        
        <div class="footer">
            Gerado por ContaComigoPRO em ${new Date().toLocaleDateString('pt-BR')} às ${new Date().toLocaleTimeString('pt-BR')}
        </div>
        
        <script>
            window.onload = function() {
                setTimeout(function() {
                    window.print();
                }, 500);
            }
        </script>
    </body>
    </html>
    `;

    printWindow.document.write(html);
    printWindow.document.close();
};

// =============================================================================
// SEÇÃO 17 — UI DE BANCOS
// =============================================================================

btnNewBank.addEventListener('click', () => {
    document.querySelector('#bank-modal h2').textContent = "Nova Conta Bancária";
    formBank.reset();
    document.getElementById('bank-id').value = '';
    bankModal.classList.add('active');
});

formBank.addEventListener('submit', async (e) => {
    e.preventDefault();
    const id = document.getElementById('bank-id').value;
    const name = document.getElementById('bank-name').value;
    const balance = parseCurrencyInput(document.getElementById('bank-balance').value) || 0;
    const color = document.getElementById('bank-color').value || '#0ea5e9';

    if (!name) return alert('Campos inválidos!');

    try {
        const payload = { userId: currentUser.uid, name, balance, color };
        if (id) {
            await banksCollection.doc(id).update(payload);
        } else {
            await banksCollection.add(payload);
        }
        bankModal.classList.remove('active');
        formBank.reset();
    } catch (err) { alert("Erro ao salvar: " + err.message); }
});

window.editBank = (id) => {
    const b = banksList.find(x => x.id === id);
    if (!b) return;

    document.querySelector('#bank-modal h2').textContent = "Editar Conta Bancária";
    document.getElementById('bank-id').value = b.id;
    document.getElementById('bank-name').value = b.name;
    document.getElementById('bank-balance').value = b.balance || 0;
    document.getElementById('bank-color').value = b.color || '#0ea5e9';

    bankModal.classList.add('active');
};

window.deleteBank = async (id) => {
    if (confirm('Atenção: Excluir este banco apagará o registro dele na sua lista.\nPara manter suas transações intactas, crie um novo banco antes, caso planeje mudar algo. Confirmar exclusão?')) {
        await banksCollection.doc(id).delete();
    }
};

window.filterBankExtract = (id) => {
    const listNode = document.getElementById('inline-bank-transactions');
    if (!listNode) return;

    // Salva os filtros atuais
    currentBankFilter.id = id;
    currentBankFilter.startDate = document.getElementById('bank-filter-start')?.value || '';
    currentBankFilter.endDate = document.getElementById('bank-filter-end')?.value || '';

    const dStart = currentBankFilter.startDate;
    const dEnd = currentBankFilter.endDate;

    const b = banksList.find(x => x.id === id);
    if (!b) return;

    // Filtra transações do banco no período
    let res = transactions.filter(t => t.paymentMethod === id);

    // Ordena por data (mais antiga primeiro para calcular saldo)
    const sortedAll = [...res].sort((a, b) => a.date.localeCompare(b.date));

    // Calcula saldo acumulado até a data final
    let saldoAcumulado = b.balance || 0;
    let totalReceitas = 0;
    let totalDespesas = 0;

    // Se tiver data final, calcula saldo até aquela data
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

    // Filtra transações para exibição no período
    let displayRes = res;
    if (dStart) {
        displayRes = displayRes.filter(t => t.date >= dStart);
    }
    if (dEnd) {
        displayRes = displayRes.filter(t => t.date <= dEnd);
    }
    displayRes.sort((a, b) => a.date.localeCompare(b.date));

    // Renderiza as transações
    renderTransactions(displayRes, 'inline-bank-transactions');

    // Formata o período para exibição
    const periodText = dStart && dEnd ? `${formatDate(dStart)} a ${formatDate(dEnd)}` : 'Todo o período';

    // Define as cores dos valores
    const saldoColor = saldoAcumulado >= 0 ? 'var(--success)' : 'var(--danger)';
    const receitaColor = 'var(--success)';
    const despesaColor = 'var(--danger)';

    // Adiciona o resumo com layout melhorado
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
};

function renderBanks() {
    if (!banksListGrid) return;
    banksListGrid.innerHTML = '';

    if (banksList.length === 0) {
        banksListGrid.innerHTML = `<div class="empty-state w-100" style="grid-column: 1/-1;"><i class="fa-solid fa-building-columns"></i><p>Nenhuma conta bancária cadastrada.</p></div>`;
        return;
    }

    banksList.forEach(b => {
        const bankTransactions = transactions.filter(t => t.paymentMethod === b.id);
        const revenue = bankTransactions.filter(t => t.type === 'income').reduce((acc, t) => acc + t.amount, 0);
        const expenses = bankTransactions.filter(t => t.type === 'expense').reduce((acc, t) => acc + t.amount, 0);

        const currentBalance = (b.balance || 0) + revenue - expenses;
        const colorVar = currentBalance < 0 ? 'var(--danger)' : 'var(--text-main)';

        banksListGrid.innerHTML += `
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
                    <i class="fa-regular fa-clock"></i> ${transactions.filter(t => t.paymentMethod === b.id).length} transações
                </div>
            </div>
        `;
    });
}

window.expandBank = (id) => {
    const b = banksList.find(x => x.id === id);
    if (!b) return;

    banksListGrid.innerHTML = '';

    const bankTransactions = transactions.filter(t => t.paymentMethod === b.id);
    const revenue = bankTransactions.filter(t => t.type === 'income').reduce((acc, t) => acc + t.amount, 0);
    const expenses = bankTransactions.filter(t => t.type === 'expense').reduce((acc, t) => acc + t.amount, 0);
    const currentBalance = (b.balance || 0) + revenue - expenses;
    const colorVar = currentBalance < 0 ? 'var(--danger)' : 'var(--text-main)';

    const savedStart = currentBankFilter.id === id ? currentBankFilter.startDate : '';
    const savedEnd = currentBankFilter.id === id ? currentBankFilter.endDate : '';

    const today = new Date();
    const currentMonth = today.toISOString().slice(0, 7);
    const monthStart = `${currentMonth}-01`;
    const monthEnd = today.toISOString().slice(0, 10);

    banksListGrid.innerHTML += `
        <div class="card w-100" style="grid-column: 1/-1; border-top: 4px solid ${b.color}; padding: 16px; margin-bottom: 16px;">
            <div style="display: flex; align-items: center; gap: 12px; margin-bottom: 16px; flex-wrap: wrap;">
                <button class="btn btn-secondary" onclick="renderBanks()" style="padding: 6px 12px; font-size: 0.85rem; display: flex; align-items: center; gap: 6px;">
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
        document.getElementById('bank-filter-start').value = monthStart;
        document.getElementById('bank-filter-end').value = monthEnd;
    }

    window.filterBankExtract(b.id);
};

// =============================================================================
// SEÇÃO 18 — RELATÓRIO DE BANCO
// =============================================================================

/**
 * Gera relatório de extrato bancário com base no período filtrado
 * @param {string} bankId - ID do banco
 */
window.generateBankReport = (bankId) => {
    const bank = banksList.find(b => b.id === bankId);
    if (!bank) {
        alert('Banco não encontrado.');
        return;
    }

    // Obtém os filtros atuais
    const startDate = document.getElementById('bank-filter-start')?.value || '';
    const endDate = document.getElementById('bank-filter-end')?.value || '';

    if (!startDate || !endDate) {
        alert('Por favor, selecione um período para gerar o relatório.\nUse os filtros de data acima.');
        return;
    }

    // Verifica se há transações no período
    let transacoes = transactions.filter(t => t.paymentMethod === bankId);

    if (startDate) {
        transacoes = transacoes.filter(t => t.date >= startDate);
    }
    if (endDate) {
        transacoes = transacoes.filter(t => t.date <= endDate);
    }

    if (transacoes.length === 0) {
        if (!confirm('Nenhuma transação encontrada neste período.\nDeseja gerar o relatório mesmo assim?')) {
            return;
        }
    }

    // Ordena por data
    transacoes.sort((a, b) => a.date.localeCompare(b.date));

    // Calcula saldo inicial (antes do período)
    let saldoInicial = bank.balance || 0;
    const allTransactions = transactions.filter(t => t.paymentMethod === bankId);
    allTransactions.sort((a, b) => a.date.localeCompare(b.date));

    // Calcula saldo antes da data inicial
    for (const t of allTransactions) {
        if (t.date < startDate) {
            if (t.type === 'income') {
                saldoInicial += t.amount;
            } else {
                saldoInicial -= t.amount;
            }
        }
    }

    // Calcula totais do período
    let totalReceitas = 0;
    let totalDespesas = 0;
    let saldoCorrente = saldoInicial;

    const transactionRows = transacoes.map(t => {
        const isIncome = t.type === 'income';
        const valor = t.amount;
        if (isIncome) {
            totalReceitas += valor;
            saldoCorrente += valor;
        } else {
            totalDespesas += valor;
            saldoCorrente -= valor;
        }
        return {
            date: t.date,
            description: t.description,
            category: t.category || 'Sem Categoria',
            type: t.type,
            amount: valor,
            balance: saldoCorrente
        };
    });

    const saldoFinal = saldoCorrente;
    const totalMovimentado = totalReceitas + totalDespesas;

    // Formata as datas para exibição
    const formatDateBr = (date) => {
        if (!date) return '';
        const parts = date.split('-');
        return `${parts[2]}/${parts[1]}/${parts[0]}`;
    };

    // Abre janela de impressão
    const printWindow = window.open('', '_blank');
    if (!printWindow) {
        alert('Por favor, permita pop-ups para gerar o relatório.');
        return;
    }

    const html = `
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="UTF-8">
        <title>Extrato Bancário - ${bank.name}</title>
        <style>
            @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap');
            * { margin: 0; padding: 0; box-sizing: border-box; }
            body { 
                font-family: 'Inter', sans-serif; 
                padding: 40px; 
                background: #fff;
                color: #1e293b;
            }
            .header {
                display: flex;
                justify-content: space-between;
                align-items: flex-start;
                margin-bottom: 30px;
                padding-bottom: 20px;
                border-bottom: 2px solid #e2e8f0;
            }
            .header .bank-info h1 {
                font-size: 1.8rem;
                color: #0f172a;
                margin-bottom: 4px;
            }
            .header .bank-info p {
                color: #64748b;
                font-size: 0.95rem;
                margin: 2px 0;
            }
            .header .period {
                text-align: right;
                color: #64748b;
                font-size: 0.9rem;
            }
            .header .period strong {
                color: #0f172a;
            }
            .summary {
                display: grid;
                grid-template-columns: repeat(4, 1fr);
                gap: 16px;
                margin-bottom: 30px;
                padding: 20px;
                background: #f8fafc;
                border-radius: 8px;
                border: 1px solid #e2e8f0;
            }
            .summary .item {
                text-align: center;
            }
            .summary .item .label {
                font-size: 0.75rem;
                text-transform: uppercase;
                color: #64748b;
                letter-spacing: 0.5px;
                font-weight: 600;
            }
            .summary .item .value {
                font-size: 1.3rem;
                font-weight: 700;
                margin-top: 4px;
            }
            .summary .item .value.positive { color: #059669; }
            .summary .item .value.negative { color: #dc2626; }
            .summary .item .value.neutral { color: #0f172a; }
            
            table {
                width: 100%;
                border-collapse: collapse;
                margin-top: 20px;
            }
            th {
                background: #f1f5f9;
                padding: 12px 15px;
                text-align: left;
                font-weight: 600;
                color: #475569;
                border-bottom: 2px solid #e2e8f0;
            }
            td {
                padding: 10px 15px;
                border-bottom: 1px solid #e2e8f0;
            }
            td.amount {
                text-align: right;
                font-weight: 500;
            }
            td.amount.positive { color: #059669; }
            td.amount.negative { color: #dc2626; }
            td.balance {
                text-align: right;
                font-weight: 600;
            }
            .footer {
                margin-top: 30px;
                padding-top: 20px;
                border-top: 1px solid #e2e8f0;
                text-align: center;
                color: #94a3b8;
                font-size: 0.85rem;
            }
            .badge {
                display: inline-block;
                padding: 2px 8px;
                border-radius: 12px;
                font-size: 0.7rem;
                font-weight: 600;
                text-transform: uppercase;
            }
            .badge.income { background: #dcfce7; color: #059669; }
            .badge.expense { background: #fee2e2; color: #dc2626; }
            .no-transactions {
                text-align: center;
                padding: 40px;
                color: #94a3b8;
            }
            .no-transactions i {
                font-size: 2rem;
                display: block;
                margin-bottom: 12px;
            }
            @media print {
                body { padding: 20px; }
                .no-print { display: none; }
            }
            @media (max-width: 768px) {
                .summary {
                    grid-template-columns: repeat(2, 1fr);
                    gap: 12px;
                    padding: 16px;
                }
                table { font-size: 0.85rem; }
                th, td { padding: 8px 10px; }
                .header { flex-direction: column; gap: 12px; }
                .header .period { text-align: left; }
            }
        </style>
    </head>
    <body>
        <div class="header">
            <div class="bank-info">
                <h1>🏦 Extrato Bancário</h1>
                <p><strong>${bank.name}</strong></p>
                <p style="color: #64748b; font-size: 0.85rem;">
                    Saldo Inicial: ${new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(bank.balance || 0)}
                </p>
            </div>
            <div class="period">
                <p><strong>Período:</strong></p>
                <p>${formatDateBr(startDate)} a ${formatDateBr(endDate)}</p>
                <p style="margin-top: 4px; font-size: 0.7rem;">
                    Gerado em ${new Date().toLocaleDateString('pt-BR')} às ${new Date().toLocaleTimeString('pt-BR')}
                </p>
            </div>
        </div>

        <div class="summary">
            <div class="item">
                <div class="label">Saldo Inicial</div>
                <div class="value neutral">${new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(saldoInicial)}</div>
            </div>
            <div class="item">
                <div class="label">Receitas</div>
                <div class="value positive">+ ${new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(totalReceitas)}</div>
            </div>
            <div class="item">
                <div class="label">Despesas</div>
                <div class="value negative">- ${new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(totalDespesas)}</div>
            </div>
            <div class="item">
                <div class="label">Saldo Final</div>
                <div class="value ${saldoFinal >= 0 ? 'positive' : 'negative'}">${new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(saldoFinal)}</div>
            </div>
        </div>

        ${transactionRows.length > 0 ? `
        <table>
            <thead>
                <tr>
                    <th>Data</th>
                    <th>Descrição</th>
                    <th>Categoria</th>
                    <th style="text-align: right;">Tipo</th>
                    <th style="text-align: right;">Valor</th>
                    <th style="text-align: right;">Saldo</th>
                </tr>
            </thead>
            <tbody>
                ${transactionRows.map(row => `
                    <tr>
                        <td>${formatDateBr(row.date)}</td>
                        <td>${row.description}</td>
                        <td>${row.category}</td>
                        <td style="text-align: right;">
                            <span class="badge ${row.type}">${row.type === 'income' ? 'Receita' : 'Despesa'}</span>
                        </td>
                        <td class="amount ${row.type === 'income' ? 'positive' : 'negative'}">
                            ${row.type === 'income' ? '+' : '-'} ${new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(row.amount)}
                        </td>
                        <td class="balance" style="color: ${row.balance >= 0 ? '#059669' : '#dc2626'}">
                            ${new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(row.balance)}
                        </td>
                    </tr>
                `).join('')}
            </tbody>
            <tfoot>
                <tr style="background: #f8fafc; font-weight: 600;">
                    <td colspan="4" style="text-align: right;">Total do Período:</td>
                    <td style="text-align: right; color: ${saldoFinal >= 0 ? '#059669' : '#dc2626'}">
                        ${new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(totalMovimentado)}
                    </td>
                    <td style="text-align: right; color: ${saldoFinal >= 0 ? '#059669' : '#dc2626'}">
                        ${new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(saldoFinal)}
                    </td>
                </tr>
            </tfoot>
        </table>
        ` : `
        <div class="no-transactions">
            <i class="fa-solid fa-receipt"></i>
            <p>Nenhuma transação encontrada neste período.</p>
            <p style="font-size: 0.85rem; margin-top: 4px;">Período: ${formatDateBr(startDate)} a ${formatDateBr(endDate)}</p>
        </div>
        `}

        <div class="footer">
            <p>Relatório gerado pelo Conta Comigo PRO</p>
            <p style="margin-top: 4px; font-size: 0.8rem;">
                ${transactionRows.length} transações no período • 
                ${totalReceitas > 0 ? `Receitas: ${new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(totalReceitas)}` : 'Sem receitas'}
                ${totalReceitas > 0 && totalDespesas > 0 ? ' • ' : ''}
                ${totalDespesas > 0 ? `Despesas: ${new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(totalDespesas)}` : 'Sem despesas'}
            </p>
        </div>

        <script>
            window.onload = function() {
                setTimeout(function() {
                    window.print();
                }, 500);
            }
        </script>
    </body>
    </html>
    `;

    printWindow.document.write(html);
    printWindow.document.close();
};

window.setBankFilterToMonth = (bankId) => {
    const today = new Date();
    const currentMonth = today.toISOString().slice(0, 7);
    const monthStart = `${currentMonth}-01`;
    const monthEnd = today.toISOString().slice(0, 10);

    document.getElementById('bank-filter-start').value = monthStart;
    document.getElementById('bank-filter-end').value = monthEnd;
    window.filterBankExtract(bankId);
};

window.clearBankFilters = (bankId) => {
    document.getElementById('bank-filter-start').value = '';
    document.getElementById('bank-filter-end').value = '';
    currentBankFilter.startDate = '';
    currentBankFilter.endDate = '';
    window.filterBankExtract(bankId);
};

window.openTransactionModalWithBank = (bankId) => {
    paymentMethod.value = bankId;
    transactionModal.classList.add('active');
};

// =============================================================================
// SEÇÃO 19 — INTERFACE GERAL
// =============================================================================

const formatCurrency = val => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val);
const formatDate = str => { const p = str.split('-'); return p.length === 3 ? `${p[2]}/${p[1]}/${p[0]}` : str; };

function populatePaymentMethodSelects() {
    let opts = '';

    if (banksList.length > 0) {
        opts += `<optgroup label="Bancos / Contas">`;
        banksList.forEach(b => {
            opts += `<option value="${b.id}">🏦 ${b.name}</option>`;
        });
        opts += `</optgroup>`;
    }

    if (cardsList.length > 0) {
        opts += `<optgroup label="Cartões de Crédito">`;
        cardsList.forEach(c => {
            opts += `<option value="${c.id}">💳 ${c.nickname} (${c.bank})</option>`;
        });
        opts += `</optgroup>`;
    }

    paymentMethod.innerHTML = opts;
    if (fixedPaymentMethod) fixedPaymentMethod.innerHTML = opts;
    const pdfDestSelect = document.getElementById('pdf-destination');
    if (pdfDestSelect) {
        pdfDestSelect.innerHTML = '<option value="" disabled selected>Selecione onde lançar</option>' + opts;
    }
    const cardPaymentBankSelect = document.getElementById('card-payment-source-bank');
    if (cardPaymentBankSelect) {
        let bankOpts = '<option value="" disabled selected>Selecione</option>';
        banksList.forEach(b => bankOpts += `<option value="${b.id}">🏦 ${b.name}</option>`);
        cardPaymentBankSelect.innerHTML = bankOpts;
    }
}

function handleInstallmentVisibility() {
    const isCC = cardsList.some(c => c.id === paymentMethod.value);
    const typeEx = document.querySelector('input[name="type"]:checked').value;
    if (isCC && typeEx === 'expense') {
        installmentsContainer.style.display = 'flex';
    } else {
        installmentsContainer.style.display = 'none';
        installmentsSelect.value = "1";
    }
}

paymentMethod.addEventListener('change', handleInstallmentVisibility);
document.querySelectorAll('input[name="type"]').forEach(r => r.addEventListener('change', handleInstallmentVisibility));

function updateAppUI() {
    let totalBalance = banksList.reduce((acc, bank) => acc + (bank.balance || 0), 0);

    banksList.forEach(bank => {
        const bankTransactions = transactions.filter(t => t.paymentMethod === bank.id);
        const revenue = bankTransactions.filter(t => t.type === 'income').reduce((acc, t) => acc + t.amount, 0);
        const expenses = bankTransactions.filter(t => t.type === 'expense').reduce((acc, t) => acc + t.amount, 0);
        totalBalance += revenue - expenses;
    });

    const allAmounts = transactions.map(t => t.type === 'income' ? t.amount : -t.amount);
    const totalIncome = allAmounts.filter(v => v > 0).reduce((a, b) => a + b, 0);
    const totalExpense = allAmounts.filter(v => v < 0).reduce((a, b) => a + b, 0) * -1;

    if (totalBalanceElement) {
        totalBalanceElement.textContent = formatCurrency(totalBalance);
        totalBalanceElement.style.color = totalBalance < 0 ? 'var(--danger)' : 'var(--text-main)';
    }

    if (totalIncomeElement) {
        totalIncomeElement.textContent = formatCurrency(totalIncome);
    }

    if (totalExpenseElement) {
        totalExpenseElement.textContent = formatCurrency(totalExpense);
    }

    const invoiceData = calculateCardInvoice();
    const invoiceElement = document.getElementById('total-card-invoice');
    const detailElement = document.getElementById('card-invoice-detail');

    if (invoiceElement) {
        if (invoiceData.total > 0) {
            invoiceElement.textContent = formatCurrency(invoiceData.total);
            invoiceElement.style.color = 'var(--danger)';
        } else {
            invoiceElement.textContent = 'R$ 0,00';
            invoiceElement.style.color = 'var(--text-muted)';
        }
    }

    if (detailElement) {
        detailElement.textContent = invoiceData.details;
    }

    renderTransactions(transactions.slice(0, 5), 'transaction-list-recent');
    generateCategoryChart();
    applyTransacoesFilters();
}

filterSearch.addEventListener('input', applyTransacoesFilters);
filterType.addEventListener('change', applyTransacoesFilters);
filterDateStart.addEventListener('change', applyTransacoesFilters);
filterDateEnd.addEventListener('change', applyTransacoesFilters);
filterCategory.addEventListener('change', applyTransacoesFilters);
btnClearFilters.addEventListener('click', () => {
    filterSearch.value = '';
    filterType.value = 'all';
    filterCategory.value = 'all';
    filterDateStart.value = '';
    filterDateEnd.value = '';
    applyTransacoesFilters();
});

function applyTransacoesFilters() {
    const str = filterSearch.value.toLowerCase();
    const type = filterType.value;
    const category = filterCategory.value;
    const dateStart = filterDateStart.value;
    const dateEnd = filterDateEnd.value;

    let defaultDateEnd = "9999-12-31";
    if (!dateEnd) {
        const today = new Date();
        const lastDay = new Date(today.getFullYear(), today.getMonth() + 1, 0);
        defaultDateEnd = lastDay.toISOString().slice(0, 10);
    }
    const targetDateEnd = dateEnd || defaultDateEnd;

    const res = transactions.filter(t => {
        const mStr = t.description.toLowerCase().includes(str);
        const mType = type === 'all' || t.type === type;
        const mCat = category === 'all' || t.category === category;
        const mDate = (!dateStart || t.date >= dateStart) && (!dateEnd ? t.date <= targetDateEnd : t.date <= dateEnd);

        return mStr && mType && mCat && mDate;
    });

    const fAmounts = res.map(t => t.type === 'income' ? t.amount : -t.amount);
    const fTot = fAmounts.reduce((a, b) => a + b, 0);
    const fInc = fAmounts.filter(v => v > 0).reduce((a, b) => a + b, 0);
    const fExp = fAmounts.filter(v => v < 0).reduce((a, b) => a + b, 0) * -1;

    if (fBalanceEl) {
        fBalanceEl.textContent = formatCurrency(fTot);
        fIncomeEl.textContent = formatCurrency(fInc);
        fExpenseEl.textContent = formatCurrency(fExp);
        fBalanceEl.style.color = fTot < 0 ? 'var(--danger)' : 'var(--text-main)';
    }

    renderTransactions(res, 'transaction-list-complete');
}

function renderTransactions(txs, containerId) {
    const container = document.getElementById(containerId);
    container.innerHTML = '';
    if (txs.length === 0) {
        container.innerHTML = `<div class="empty-state"><i class="fa-solid fa-receipt"></i><p>Nenhuma transação encontrada.</p></div>`;
        return;
    }
    txs.forEach(t => {
        const isInc = t.type === 'income';
        const s = isInc ? '+' : '-';

        let pmBadge = '';
        if (t.paymentMethod) {
            const b = banksList.find(bank => bank.id === t.paymentMethod);
            if (b) {
                pmBadge = `<span style="font-size: 0.65rem; background: var(--bg-body); padding: 4px 8px; border-radius: 12px; border: 1px solid var(--border);"><i class="fa-solid fa-building-columns" style="color: ${b.color}"></i> ${b.name}</span>`;
            } else {
                const c = cardsList.find(card => card.id === t.paymentMethod);
                if (c) {
                    pmBadge = `<span style="font-size: 0.65rem; background: var(--bg-body); padding: 4px 8px; border-radius: 12px; border: 1px solid var(--border);"><i class="fa-solid fa-credit-card" style="color: var(--primary)"></i> Cartão: ${c.nickname}</span>`;
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
                    <p class="tx-amount ${isInc ? 'positive' : 'negative'}">${s} ${formatCurrency(t.amount)}</p>
                    <p class="tx-date">${formatDate(t.date)}</p>
                </div>
                <div class="tx-actions" style="display:flex; gap: 8px;">
                    <button class="btn-icon" onclick="window.editTransaction('${t.id}')" title="Editar"><i class="fa-solid fa-pen"></i></button>
                    <button class="btn-icon" onclick="window.deleteTransaction('${t.id}')" title="Excluir"><i class="fa-solid fa-trash"></i></button>
                </div>
            </div>`;
    });
}

// =============================================================================
// SEÇÃO 20 — NOVA TRANSAÇÃO - MODAL
// =============================================================================

document.getElementById('btn-new-transaction').addEventListener('click', () => {
    editingTransactionId = null;
    launchingFixedId = null;
    document.querySelector('#transaction-modal h2').textContent = "Nova Transação";
    formTransaction.reset();
    document.getElementById('date').valueAsDate = new Date();
    handleInstallmentVisibility();

    const tabs = document.getElementById('tx-modal-tabs');
    if (tabs) tabs.style.display = 'flex';
    window.resetBulkMode();

    transactionModal.classList.add('active');
});

window.isBulkMode = false;

window.resetBulkMode = () => {
    window.isBulkMode = false;

    const tabSingle = document.getElementById('tab-tx-single');
    const tabBulk = document.getElementById('tab-tx-bulk');
    if (tabSingle && tabBulk) {
        tabSingle.classList.add('active');
        tabSingle.style.borderBottom = '2px solid var(--primary)';
        tabSingle.style.color = 'var(--text-main)';
        tabBulk.classList.remove('active');
        tabBulk.style.borderBottom = 'none';
        tabBulk.style.color = 'var(--text-muted)';
    }

    const singleTxContainer = document.getElementById('single-tx-container');
    const bulkTxContainer = document.getElementById('bulk-tx-container');
    if (singleTxContainer) singleTxContainer.style.display = 'block';
    if (bulkTxContainer) bulkTxContainer.style.display = 'none';

    const modalBox = document.querySelector('#transaction-modal .modal');
    if (modalBox) modalBox.style.maxWidth = '500px';

    const bulkRowsContainer = document.getElementById('bulk-rows-container');
    if (bulkRowsContainer) bulkRowsContainer.innerHTML = '';
};

// =============================================================================
// SEÇÃO 21 — MODO EM LOTE
// =============================================================================

window.addBulkRow = () => {
    const bulkRowsContainer = document.getElementById('bulk-rows-container');
    if (!bulkRowsContainer) return;

    const rowId = 'bulk_row_' + Math.random().toString(36).substr(2, 9);
    const rowDiv = document.createElement('div');
    rowDiv.id = rowId;
    rowDiv.className = 'bulk-row';

    rowDiv.style.cssText = `
        display: grid;
        grid-template-columns: 100px 1fr 120px 130px 1fr 1.2fr 40px;
        gap: 8px;
        align-items: center;
        background: var(--bg-body);
        padding: 8px 12px;
        border-radius: 8px;
        border: 1px solid var(--border);
        margin-bottom: 8px;
        transition: all 0.2s ease;
    `;

    let catOpts = '<option value="" disabled selected>Categoria</option>';
    categoriesList.forEach(c => {
        catOpts += `<option value="${c.name}">${c.name}</option>`;
    });

    let pmOpts = '<option value="" disabled selected>Banco/Cartão</option>';
    if (banksList.length > 0) {
        banksList.forEach(b => {
            pmOpts += `<option value="${b.id}">🏦 ${b.name}</option>`;
        });
    }
    if (cardsList.length > 0) {
        cardsList.forEach(c => {
            pmOpts += `<option value="${c.id}">💳 ${c.nickname}</option>`;
        });
    }

    const bulkDate = document.getElementById('bulk-date').value || new Date().toISOString().slice(0, 10);

    rowDiv.innerHTML = `
        <select class="bulk-row-type form-input" style="width: 100%; padding: 6px 8px; border-radius: 6px; background: var(--bg-main); border: 1px solid var(--border); color: var(--text-main); font-size: 0.85rem;" required>
            <option value="expense">Despesa</option>
            <option value="income">Receita</option>
        </select>
        
        <input type="text" class="bulk-row-desc form-input" placeholder="Descrição" style="width: 100%; padding: 6px 8px; border-radius: 6px; background: var(--bg-main); border: 1px solid var(--border); color: var(--text-main); font-size: 0.85rem;" required>
        
        <input type="text" class="bulk-row-amount form-input" placeholder="Valor" style="width: 100%; padding: 6px 8px; border-radius: 6px; background: var(--bg-main); border: 1px solid var(--border); color: var(--text-main); font-size: 0.85rem; text-align: right;" required>
        
        <input type="date" class="bulk-row-date form-input" value="${bulkDate}" style="width: 100%; padding: 6px 8px; border-radius: 6px; background: var(--bg-main); border: 1px solid var(--border); color: var(--text-main); font-size: 0.85rem;">
        
        <select class="bulk-row-category form-input" style="width: 100%; padding: 6px 8px; border-radius: 6px; background: var(--bg-main); border: 1px solid var(--border); color: var(--text-main); font-size: 0.85rem;" required>
            ${catOpts}
        </select>
        
        <select class="bulk-row-pm form-input" style="width: 100%; padding: 6px 8px; border-radius: 6px; background: var(--bg-main); border: 1px solid var(--border); color: var(--text-main); font-size: 0.85rem;" required>
            ${pmOpts}
        </select>
        
        <button type="button" class="btn-icon" onclick="document.getElementById('${rowId}').remove()" title="Remover esta linha" style="color: var(--text-muted); padding: 4px; font-size: 1rem; transition: all 0.2s; display: flex; align-items: center; justify-content: center; width: 32px; height: 32px; border-radius: 4px; border: none; background: transparent; cursor: pointer;">
            <i class="fa-solid fa-xmark"></i>
        </button>
    `;

    const removeBtn = rowDiv.querySelector('.btn-icon');
    removeBtn.addEventListener('mouseenter', () => {
        removeBtn.style.color = 'var(--danger)';
        removeBtn.style.background = 'var(--danger-bg)';
    });
    removeBtn.addEventListener('mouseleave', () => {
        removeBtn.style.color = 'var(--text-muted)';
        removeBtn.style.background = 'transparent';
    });

    bulkRowsContainer.appendChild(rowDiv);
};

window.addBulkRowWithData = (data) => {
    const bulkRowsContainer = document.getElementById('bulk-rows-container');
    if (!bulkRowsContainer) return;

    const rowId = 'bulk_row_' + Math.random().toString(36).substr(2, 9);
    const rowDiv = document.createElement('div');
    rowDiv.id = rowId;
    rowDiv.className = 'bulk-row';

    rowDiv.style.cssText = `
        display: grid;
        grid-template-columns: 100px 1fr 120px 130px 1fr 1.2fr 40px;
        gap: 8px;
        align-items: center;
        background: var(--bg-body);
        padding: 8px 12px;
        border-radius: 8px;
        border: 1px solid var(--border);
        margin-bottom: 8px;
        transition: all 0.2s ease;
    `;

    let catOpts = '<option value="" disabled selected>Categoria</option>';
    let hasCategory = false;
    const targetCategory = data.category || 'Extrato PDF'; // <-- DEFINE A CATEGORIA PADRÃO AQUI

    categoriesList.forEach(c => {
        // Verifica se a categoria extraída ou a padrão existe na lista
        const selected = (targetCategory && c.name === targetCategory) ? 'selected' : '';
        if (selected) hasCategory = true;
        catOpts += `<option value="${c.name}" ${selected}>${c.name}</option>`;
    });

    if (!hasCategory && targetCategory) {
        // Remove a primeira opção "Selecione" e adiciona a nova categoria como selecionada
        catOpts = `<option value="${targetCategory}" selected>${targetCategory}</option>` +
            categoriesList.map(c => `<option value="${c.name}">${c.name}</option>`).join('');
    }

    let pmOpts = '<option value="" disabled selected>Banco/Cartão</option>';
    if (banksList.length > 0) {
        banksList.forEach(b => {
            const selected = (data.paymentMethod && b.id === data.paymentMethod) ? 'selected' : '';
            pmOpts += `<option value="${b.id}" ${selected}>🏦 ${b.name}</option>`;
        });
    }
    if (cardsList.length > 0) {
        cardsList.forEach(c => {
            const selected = (data.paymentMethod && c.id === data.paymentMethod) ? 'selected' : '';
            pmOpts += `<option value="${c.id}" ${selected}>💳 ${c.nickname}</option>`;
        });
    }

    const typeExpenseSelected = data.type === 'expense' ? 'selected' : '';
    const typeIncomeSelected = data.type === 'income' ? 'selected' : '';

    rowDiv.innerHTML = `
        <select class="bulk-row-type form-input" style="width: 100%; padding: 6px 8px; border-radius: 6px; background: var(--bg-main); border: 1px solid var(--border); color: var(--text-main); font-size: 0.85rem;" required>
            <option value="expense" ${typeExpenseSelected}>Despesa</option>
            <option value="income" ${typeIncomeSelected}>Receita</option>
        </select>
        
        <input type="text" class="bulk-row-desc form-input" placeholder="Descrição" value="${data.description || ''}" style="width: 100%; padding: 6px 8px; border-radius: 6px; background: var(--bg-main); border: 1px solid var(--border); color: var(--text-main); font-size: 0.85rem;" required>
        
        <input type="text" class="bulk-row-amount form-input" placeholder="Valor" value="${data.amount ? data.amount.toFixed(2).replace('.', ',') : ''}" style="width: 100%; padding: 6px 8px; border-radius: 6px; background: var(--bg-main); border: 1px solid var(--border); color: var(--text-main); font-size: 0.85rem; text-align: right;" required>
        
        <input type="date" class="bulk-row-date form-input" value="${data.date || ''}" style="width: 100%; padding: 6px 8px; border-radius: 6px; background: var(--bg-main); border: 1px solid var(--border); color: var(--text-main); font-size: 0.85rem;">
        
        <select class="bulk-row-category form-input" style="width: 100%; padding: 6px 8px; border-radius: 6px; background: var(--bg-main); border: 1px solid var(--border); color: var(--text-main); font-size: 0.85rem;" required>
            ${catOpts}
        </select>
        
        <select class="bulk-row-pm form-input" style="width: 100%; padding: 6px 8px; border-radius: 6px; background: var(--bg-main); border: 1px solid var(--border); color: var(--text-main); font-size: 0.85rem;" required>
            ${pmOpts}
        </select>
        
        <button type="button" class="btn-icon" onclick="document.getElementById('${rowId}').remove()" title="Remover esta linha" style="color: var(--text-muted); padding: 4px; font-size: 1rem; transition: all 0.2s; display: flex; align-items: center; justify-content: center; width: 32px; height: 32px; border-radius: 4px; border: none; background: transparent; cursor: pointer;">
            <i class="fa-solid fa-xmark"></i>
        </button>
    `;

    const removeBtn = rowDiv.querySelector('.btn-icon');
    removeBtn.addEventListener('mouseenter', () => {
        removeBtn.style.color = 'var(--danger)';
        removeBtn.style.background = 'var(--danger-bg)';
    });
    removeBtn.addEventListener('mouseleave', () => {
        removeBtn.style.color = 'var(--text-muted)';
        removeBtn.style.background = 'transparent';
    });

    bulkRowsContainer.appendChild(rowDiv);
};

function initBulkModeTabs() {
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
        tabSingle.style.borderBottom = '2px solid var(--primary)';
        tabSingle.style.color = 'var(--text-main)';

        tabBulk.classList.remove('active');
        tabBulk.style.borderBottom = 'none';
        tabBulk.style.color = 'var(--text-muted)';

        if (tabPdf) {
            tabPdf.classList.remove('active');
            tabPdf.style.borderBottom = 'none';
            tabPdf.style.color = 'var(--text-muted)';
        }

        if (singleTxContainer) singleTxContainer.style.display = 'block';
        if (bulkTxContainer) bulkTxContainer.style.display = 'none';
        if (pdfTxContainer) pdfTxContainer.style.display = 'none';
        if (modalBox) modalBox.style.maxWidth = '500px';
        if (modalFooter) modalFooter.style.display = 'flex';
    });

    tabBulk.addEventListener('click', () => {
        window.isBulkMode = true;
        tabBulk.classList.add('active');
        tabBulk.style.borderBottom = '2px solid var(--primary)';
        tabBulk.style.color = 'var(--text-main)';

        tabSingle.classList.remove('active');
        tabSingle.style.borderBottom = 'none';
        tabSingle.style.color = 'var(--text-muted)';

        if (tabPdf) {
            tabPdf.classList.remove('active');
            tabPdf.style.borderBottom = 'none';
            tabPdf.style.color = 'var(--text-muted)';
        }

        if (singleTxContainer) singleTxContainer.style.display = 'none';
        if (bulkTxContainer) bulkTxContainer.style.display = 'block';
        if (pdfTxContainer) pdfTxContainer.style.display = 'none';
        if (modalBox) modalBox.style.maxWidth = '800px';
        if (modalFooter) modalFooter.style.display = 'flex';

        const bulkDate = document.getElementById('bulk-date');
        if (bulkDate && !bulkDate.value) {
            bulkDate.value = document.getElementById('date').value || new Date().toISOString().slice(0, 10);
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
            tabPdf.style.borderBottom = '2px solid var(--primary)';
            tabPdf.style.color = 'var(--text-main)';

            tabSingle.classList.remove('active');
            tabSingle.style.borderBottom = 'none';
            tabSingle.style.color = 'var(--text-muted)';

            tabBulk.classList.remove('active');
            tabBulk.style.borderBottom = 'none';
            tabBulk.style.color = 'var(--text-muted)';

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

// =============================================================================
// SEÇÃO 21.1 — PARSER DE EXTRATO PDF (HEURÍSTICA & IA GEMINI)
// =============================================================================

async function extractTextFromPDF(file) {
    pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.4.120/pdf.worker.min.js';

    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = async function () {
            try {
                const typedarray = new Uint8Array(this.result);
                const pdf = await pdfjsLib.getDocument({ data: typedarray }).promise;
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

        let category = '';
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
        } else if (lowerDesc.includes('netflix') || lowerDesc.includes('spotify') || lowerDesc.includes('cinema') || lowerDesc.includes('show') || lowerDesc.includes('jogos')) {
            category = 'Lazer';
        } else {
            category = 'Extrato PDF';
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
Retorne APENAS um array JSON estruturado com o formato especificado no responseSchema. Não adicione nenhuma formatação markdown (como \`\`\`json) no texto de resposta se não for necessário, mas responda seguindo o schema de resposta JSON.

Instruções importantes:
- Identifique a data de cada transação. Se o ano não estiver especificado na linha, assuma o ano corrente (2026). Formate como AAAA-MM-DD.
- Identifique a descrição de forma limpa e clara.
- Identifique o valor (amount) como um número real estritamente positivo (ex: 123.45).
- Identifique o tipo (type): 'expense' para despesas (saídas, débitos, pagamentos, transferências enviadas, pix enviado) e 'income' para receitas (entradas, créditos, depósitos, salários, estornos, pix recebido, transferências recebidas).
- Classifique cada transação em uma das seguintes categorias padrão se aplicável (ou sugira uma categoria apropriada de mercado): Alimentação, Transporte, Saúde, Moradia, Lazer, Educação, Salário, Outros.

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
                                type: { type: "STRING", enum: ["expense", "income"], description: "Tipo da transação: expense para saída/débito, income para entrada/crédito" },
                                category: { type: "STRING", description: "Categoria sugerida para a transação" }
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
        headers: {
            'Content-Type': 'application/json'
        },
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
            labelHeuristic.classList.add('active');
            labelHeuristic.style.borderColor = 'var(--primary)';
            labelHeuristic.style.background = 'var(--bg-body)';

            labelAI.classList.remove('active');
            labelAI.style.borderColor = 'var(--border)';
            labelAI.style.background = 'var(--bg-card)';

            if (keyContainer) keyContainer.style.display = 'none';
        });

        labelAI.addEventListener('click', () => {
            radioAI.checked = true;
            labelAI.classList.add('active');
            labelAI.style.borderColor = 'var(--primary)';
            labelAI.style.background = 'var(--bg-body)';

            labelHeuristic.classList.remove('active');
            labelHeuristic.style.borderColor = 'var(--border)';
            labelHeuristic.style.background = 'var(--bg-card)';

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
                filenameSpan.textContent = file.name;
                selectedFileDiv.style.display = 'block';
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
            filenameSpan.textContent = file.name;
            selectedFileDiv.style.display = 'block';
        }
    });

    // Processing trigger
    btnProcess.addEventListener('click', async () => {
        if (!selectedPdfFile) {
            alert('Por favor, selecione um arquivo PDF primeiro.');
            return;
        }

        const destAccount = destinationSelect.value;
        if (!destAccount) {
            alert('Por favor, selecione um banco ou cartão de destino.');
            return;
        }

        const useAI = radioAI.checked;
        let apiKey = '';
        if (useAI) {
            apiKey = apiKeyInput.value.trim();
            if (!apiKey) {
                alert('Por favor, insira sua Chave de API do Gemini para continuar.');
                return;
            }
            if (saveKeyCheckbox.checked) {
                localStorage.setItem('gemini_api_key', apiKey);
            } else {
                localStorage.removeItem('gemini_api_key');
            }
        }

        // Show loading and disable actions
        loadingDiv.style.display = 'block';
        btnProcess.disabled = true;
        btnProcess.innerHTML = '<i class="fa-solid fa-circle-notch fa-spin"></i> Processando extrato...';

        try {
            loadingStatus.textContent = 'Lendo e extraindo texto do arquivo PDF...';
            const pdfText = await extractTextFromPDF(selectedPdfFile);

            loadingStatus.textContent = useAI ? 'Enviando texto para a Inteligência Artificial...' : 'Processando transações localmente...';

            let extractedTxs = [];
            if (useAI) {
                extractedTxs = await parsePDFTextWithGemini(pdfText, apiKey);
            } else {
                extractedTxs = parsePDFTextHeuristic(pdfText);
            }

            if (extractedTxs.length === 0) {
                alert('Nenhuma transação identificada no extrato. Tente utilizar a opção de Inteligência Artificial se o extrato for muito complexo.');
                loadingDiv.style.display = 'none';
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
            selectedFileDiv.style.display = 'none';
            loadingDiv.style.display = 'none';
            btnProcess.disabled = false;
            btnProcess.innerHTML = '<i class="fa-solid fa-file-import"></i> Extrair Transações';

            if (typeof showMessage === 'function') {
                showMessage(`${extractedTxs.length} transação(ões) extraída(s) com sucesso!`);
            } else {
                alert(`${extractedTxs.length} transações extraídas com sucesso! Revise os valores antes de salvar.`);
            }

        } catch (error) {
            console.error(error);
            alert(`Erro ao processar o extrato: ${error.message}`);
            loadingDiv.style.display = 'none';
            btnProcess.disabled = false;
            btnProcess.innerHTML = '<i class="fa-solid fa-file-import"></i> Extrair Transações';
        }
    });
}

// =============================================================================
// SEÇÃO 22 — TRANSFERÊNCIA
// =============================================================================

if (btnNewTransfer) {
    btnNewTransfer.addEventListener('click', () => {
        formTransfer.reset();
        document.getElementById('transfer-date').valueAsDate = new Date();

        const sourceSelect = document.getElementById('transfer-source-bank');
        const destSelect = document.getElementById('transfer-dest-bank');
        sourceSelect.innerHTML = '<option value="" disabled selected>Selecione</option>';
        destSelect.innerHTML = '<option value="" disabled selected>Selecione</option>';

        banksList.forEach(b => {
            sourceSelect.innerHTML += `<option value="${b.id}">${b.name}</option>`;
            destSelect.innerHTML += `<option value="${b.id}">${b.name}</option>`;
        });

        transferModal.classList.add('active');
    });
}

if (formTransfer) {
    formTransfer.addEventListener('submit', async (e) => {
        e.preventDefault();
        const amountStr = document.getElementById('transfer-amount').value;
        const dateStr = document.getElementById('transfer-date').value;
        const sourceId = document.getElementById('transfer-source-bank').value;
        const destId = document.getElementById('transfer-dest-bank').value;
        const desc = document.getElementById('transfer-description').value || 'Transferência entre contas';

        const amount = parseCurrencyInput(amountStr);

        if (isNaN(amount) || amount <= 0) return alert('Valor inválido!');
        if (!sourceId || !destId) return alert('Selecione as contas de origem e destino!');
        if (sourceId === destId) return alert('A conta de origem não pode ser a mesma de destino!');

        try {
            const batch = db.batch();

            const expenseRef = transactionsCollection.doc();
            batch.set(expenseRef, {
                userId: currentUser.uid,
                type: 'expense',
                description: desc,
                amount: amount,
                category: 'Transferência',
                date: dateStr,
                paymentMethod: sourceId,
                createdAt: firebase.firestore.FieldValue.serverTimestamp()
            });

            const incomeRef = transactionsCollection.doc();
            batch.set(incomeRef, {
                userId: currentUser.uid,
                type: 'income',
                description: desc,
                amount: amount,
                category: 'Transferência',
                date: dateStr,
                paymentMethod: destId,
                createdAt: firebase.firestore.FieldValue.serverTimestamp()
            });

            await batch.commit();

            transferModal.classList.remove('active');
            formTransfer.reset();

            const hasTransferCategory = categoriesList.some(c => c.name.trim().toLowerCase() === 'transferência');
            if (!hasTransferCategory) {
                await categoriesCollection.add({ userId: currentUser.uid, name: 'Transferência', icon: 'fa-arrow-right-arrow-left' });
            }

            if (typeof showMessage === 'function') showMessage('Transferência realizada com sucesso!');
        } catch (error) {
            alert('Erro ao transferir: ' + error.message);
        }
    });
}

// =============================================================================
// SEÇÃO 23 — BOTÕES DE AÇÃO
// =============================================================================

document.getElementById('btn-new-goal').addEventListener('click', () => goalModal.classList.add('active'));
document.getElementById('btn-new-fixed-transaction').addEventListener('click', () => {
    editingFixedId = null;
    document.querySelector('#fixed-transaction-modal h2').textContent = "Nova Transação Fixa";
    formFixedTransaction.reset();
    document.getElementById('fixed-day').value = new Date().getDate();
    fixedTransactionModal.classList.add('active');
});
btnNewCard.addEventListener('click', () => {
    editingCardId = null;
    document.querySelector('#card-modal h2').textContent = "Novo Cartão de Crédito";
    formCard.reset();
    cardModal.classList.add('active');
});

// =============================================================================
// SEÇÃO 24 — COMPRAS PARCELADAS PENDENTES
// =============================================================================

const btnShowPendingInstallments = document.getElementById('btn-show-pending-installments');
if (btnShowPendingInstallments) {
    btnShowPendingInstallments.addEventListener('click', () => {
        window.showPendingInstallmentsModal();
    });
}

window.showPendingInstallmentsModal = () => {
    const tbody = document.getElementById('installments-pending-tbody');
    if (!tbody) return;
    tbody.innerHTML = '';

    const groups = {};
    transactions.forEach(t => {
        if (t.groupId) {
            if (!groups[t.groupId]) {
                groups[t.groupId] = {
                    description: t.description.replace(/\s\(\d+\/\d+\)$/, ''),
                    totalAmount: t.totalAmount || 0,
                    installmentTotal: t.installmentTotal || 1,
                    paymentMethod: t.paymentMethod,
                    category: t.category,
                    installments: []
                };
            }
            groups[t.groupId].installments.push(t);
        }
    });

    const todayStr = new Date().toISOString().slice(0, 10);
    const pendingGroups = [];

    for (const groupId in groups) {
        const g = groups[groupId];
        g.installments.sort((a, b) => a.date.localeCompare(b.date));

        const futureOrToday = g.installments.filter(inst => inst.date >= todayStr);

        if (futureOrToday.length > 0) {
            const paidCount = g.installmentTotal - futureOrToday.length;
            const remainingAmount = futureOrToday.reduce((acc, inst) => acc + inst.amount, 0);
            const nextInst = futureOrToday[0];

            pendingGroups.push({
                description: g.description,
                paymentMethod: g.paymentMethod,
                category: g.category,
                installmentTotal: g.installmentTotal,
                paidCount,
                remainingCount: futureOrToday.length,
                remainingAmount,
                totalAmount: g.totalAmount || (g.installmentTotal * g.installments[0].amount),
                nextDate: nextInst.date,
                nextAmount: nextInst.amount
            });
        }
    }

    if (pendingGroups.length === 0) {
        tbody.innerHTML = `<tr><td colspan="7" style="text-align: center; padding: 24px; color: var(--text-muted);"><i class="fa-solid fa-check-double" style="font-size: 1.5rem; margin-bottom: 8px; display: block;"></i> Nenhuma compra parcelada pendente!</td></tr>`;
    } else {
        pendingGroups.forEach(g => {
            const pmName = getPaymentMethodName(g.paymentMethod);
            tbody.innerHTML += `
                <tr style="border-bottom: 1px solid var(--border);">
                    <td style="padding: 12px 8px; font-weight: 500;">${g.description}</td>
                    <td style="padding: 12px 8px; color: var(--text-muted);">${pmName}</td>
                    <td style="padding: 12px 8px;"><span class="badge" style="background: var(--bg-secondary); border: 1px solid var(--border); padding: 4px 8px; border-radius: 4px; font-size: 0.8rem;">${g.category}</span></td>
                    <td style="padding: 12px 8px; font-weight: 600;">${g.paidCount}/${g.installmentTotal} <span style="font-size: 0.75rem; color: var(--text-muted); font-weight: normal;">(restam ${g.remainingCount})</span></td>
                    <td style="padding: 12px 8px; font-size: 0.9rem;">${formatDate(g.nextDate)} <span style="font-size: 0.75rem; color: var(--text-muted); display: block;">${formatCurrency(g.nextAmount)}</span></td>
                    <td style="padding: 12px 8px; font-weight: 700; color: var(--danger);">${formatCurrency(g.remainingAmount)}</td>
                    <td style="padding: 12px 8px; color: var(--text-muted);">${formatCurrency(g.totalAmount)}</td>
                </tr>
            `;
        });
    }

    installmentsPendingModal.classList.add('active');
};

function getPaymentMethodName(pmId) {
    if (!pmId) return 'N/A';
    const bank = banksList.find(b => b.id === pmId);
    if (bank) return `🏦 ${bank.name}`;
    const card = cardsList.find(c => c.id === pmId);
    if (card) return `💳 ${card.nickname}`;
    return pmId;
}

// =============================================================================
// SEÇÃO 25 — FECHAR MODAIS
// =============================================================================

window.addEventListener('click', (e) => {
    if (e.target.classList.contains('modal-overlay')) {
        transactionModal.classList.remove('active');
        fixedTransactionModal.classList.remove('active');
        cardModal.classList.remove('active');
        goalModal.classList.remove('active');
        categoryModal.classList.remove('active');
        bankModal.classList.remove('active');
        if (investmentModal) investmentModal.classList.remove('active');
        if (installmentsPendingModal) installmentsPendingModal.classList.remove('active');
    }
});

renderCategoryIconsPicker();
updateAppUI();

document.querySelectorAll('.close-modal, .btn-secondary').forEach(btn => {
    btn.addEventListener('click', () => {
        transactionModal.classList.remove('active');
        fixedTransactionModal.classList.remove('active');
        cardModal.classList.remove('active');
        goalModal.classList.remove('active');
        categoryModal.classList.remove('active');
        bankModal.classList.remove('active');
        if (investmentModal) investmentModal.classList.remove('active');
        if (installmentsPendingModal) installmentsPendingModal.classList.remove('active');

        formTransaction.reset();
        editingTransactionId = null;
        editingGroupId = null;
        launchingFixedId = null;
        launchingCardId = null;
        document.querySelector('#transaction-modal h2').textContent = "Nova Transação";

        formFixedTransaction.reset();
        editingFixedId = null;

        formCard.reset();
        editingCardId = null;

        formBank.reset();
    });
});

[transactionModal, goalModal, fixedTransactionModal, cardModal, investmentModal, installmentsPendingModal].forEach(m => {
    if (m) m.addEventListener('click', e => { if (e.target === m) m.classList.remove('active'); });
});

// =============================================================================
// SEÇÃO 26 — INVESTIMENTOS
// =============================================================================

let marketRates = { selic: 10.5, cdi: 10.4 };

async function fetchMarketRates() {
    try {
        const res = await fetch('https://brasilapi.com.br/api/taxas/v1');
        const data = await res.json();
        const selicObj = data.find(i => i.nome.toLowerCase() === 'selic');
        const cdiObj = data.find(i => i.nome.toLowerCase() === 'cdi');
        if (selicObj) marketRates.selic = selicObj.valor;
        if (cdiObj) marketRates.cdi = cdiObj.valor;

        document.getElementById('market-rates-display').innerHTML = `
            <span style="margin-right: 16px;">Selic: <strong>${marketRates.selic.toFixed(2)}%</strong></span>
            <span>CDI: <strong>${marketRates.cdi.toFixed(2)}%</strong></span>
        `;
    } catch (e) {
        console.error("Erro ao buscar taxas da API:", e);
        document.getElementById('market-rates-display').textContent = `Selic: ${marketRates.selic}% | CDI: ${marketRates.cdi}% (Offline)`;
    }
}

function listenForInvestments() {
    if (unsInvestments) unsInvestments();
    unsInvestments = investmentsCollection.where('userId', '==', currentUser.uid)
        .orderBy('date', 'desc')
        .onSnapshot(snap => {
            investmentsList = [];
            snap.forEach(doc => investmentsList.push({ id: doc.id, ...doc.data() }));
            renderInvestments();
        }, e => console.error("Investments snap error:", e));
}

function calculateInvestmentYield(inv, targetDate = new Date(), ignoreManual = false) {
    let grossValue = inv.amount;
    let taxAmount = 0;

    const hasManualValue = inv.manualCurrentValue !== undefined && inv.manualCurrentValue !== null && inv.manualCurrentValue !== '';

    if (!ignoreManual && hasManualValue) {
        grossValue = parseFloat(inv.manualCurrentValue);
    } else if (inv.type === 'fixed') {
        const startDate = new Date(inv.date + 'T00:00:00');
        const daysElapsed = Math.floor((targetDate - startDate) / (1000 * 60 * 60 * 24));

        if (daysElapsed > 0) {
            let annualRate = 0;
            if (inv.rateType === 'cdi') {
                annualRate = marketRates.cdi * (inv.rateValue / 100);
            } else if (inv.rateType === 'selic') {
                annualRate = marketRates.selic * (inv.rateValue / 100);
            } else {
                annualRate = inv.rateValue;
            }

            const dailyRate = Math.pow(1 + (annualRate / 100), 1 / 365) - 1;
            grossValue = inv.amount * Math.pow(1 + dailyRate, daysElapsed);
        }
    }

    const profit = grossValue - inv.amount;

    if (profit > 0 && inv.type === 'fixed') {
        const startDate = new Date(inv.date + 'T00:00:00');
        const daysElapsed = Math.floor((targetDate - startDate) / (1000 * 60 * 60 * 24));

        let taxRate = 0;
        if (daysElapsed <= 180) taxRate = 0.225;
        else if (daysElapsed <= 360) taxRate = 0.20;
        else if (daysElapsed <= 720) taxRate = 0.175;
        else taxRate = 0.15;

        taxAmount = profit * taxRate;
    }

    return { gross: grossValue, tax: taxAmount, net: grossValue - taxAmount };
}

function renderInvestments() {
    const listGrid = document.getElementById('investments-list');
    if (!listGrid) return;
    listGrid.innerHTML = '';

    let totalInvested = 0;
    let totalGross = 0;

    if (investmentsList.length === 0) {
        listGrid.innerHTML = `<div class="empty-state w-100"><i class="fa-solid fa-chart-line"></i><p>Nenhum investimento cadastrado.</p></div>`;
        document.getElementById('total-investments').textContent = 'R$ 0,00';
        document.getElementById('total-investments-yield').textContent = 'R$ 0,00';
        return;
    }

    investmentsList.forEach(inv => {
        totalInvested += inv.amount;

        const hasManualValue = inv.manualCurrentValue !== undefined && inv.manualCurrentValue !== null && inv.manualCurrentValue !== '';
        let yieldData = calculateInvestmentYield(inv, new Date());
        let yieldHtml = '';

        if (inv.type === 'fixed' || hasManualValue) {
            const currentYield = yieldData;
            const isProfit = currentYield.gross >= inv.amount;

            let projHtml = '';
            if (inv.type === 'fixed' && inv.dueDate) {
                const targetDate = new Date(inv.dueDate + 'T00:00:00');
                if (targetDate > new Date()) {
                    const projYield = calculateInvestmentYield(inv, targetDate, true);
                    projHtml = `
                        <div style="margin-top: 8px; padding-top: 8px; border-top: 1px dashed var(--border);">
                            <span style="font-size: 0.8rem; color: var(--text-muted); text-transform: uppercase; font-weight: bold;">Projeção no Vencimento</span>
                            <div style="display: flex; justify-content: space-between; margin-top: 4px;">
                                <span>Bruto Estimado:</span>
                                <strong style="color: var(--text-main)">${formatCurrency(projYield.gross)}</strong>
                            </div>
                            <div style="display: flex; justify-content: space-between; margin-bottom: 4px; color: var(--text-muted);">
                                <span>Imposto (IR):</span>
                                <span>- ${formatCurrency(projYield.tax)}</span>
                            </div>
                            <div style="display: flex; justify-content: space-between; font-weight: bold;">
                                <span>Líquido Projetado:</span>
                                <span>${formatCurrency(projYield.net)}</span>
                            </div>
                        </div>
                    `;
                }
            }

            yieldHtml = `
                <div style="background: var(--bg-body); padding: 8px; border-radius: 6px; margin-top: 12px; font-size: 0.9rem;">
                    <span style="font-size: 0.8rem; color: var(--text-muted); text-transform: uppercase; font-weight: bold;">Posição Atual ${hasManualValue ? '(Manual)' : ''}</span>
                    <div style="display: flex; justify-content: space-between; margin-top: 4px;">
                        <span>Bruto ${hasManualValue ? 'Real' : 'Estimado'}:</span>
                        <strong style="color: ${isProfit ? 'var(--success)' : 'var(--danger)'}">${formatCurrency(currentYield.gross)}</strong>
                    </div>
                    ${inv.type === 'fixed' ? `
                    <div style="display: flex; justify-content: space-between; margin-bottom: 4px; color: var(--text-muted);">
                        <span>Imposto (IR):</span>
                        <span>- ${formatCurrency(currentYield.tax)}</span>
                    </div>` : ''}
                    <div style="display: flex; justify-content: space-between; font-weight: bold;">
                        <span>Líquido Atual:</span>
                        <span>${formatCurrency(currentYield.net)}</span>
                    </div>
                    ${projHtml}
                </div>
            `;
        }

        totalGross += yieldData.gross;

        listGrid.innerHTML += `
            <div class="card" style="padding: 16px; border: 1px solid var(--border); position: relative;">
                <div style="position: absolute; top: 16px; right: 16px; display: flex; gap: 8px;">
                    <button class="btn-icon" onclick="window.editInvestment('${inv.id}')" title="Editar / Aporte"><i class="fa-solid fa-pen"></i></button>
                    <button class="btn-icon" onclick="window.deleteInvestment('${inv.id}')" title="Excluir"><i class="fa-solid fa-trash"></i></button>
                </div>
                <h4 style="margin-bottom: 4px; padding-right: 24px;">${inv.name}</h4>
                <p style="color: var(--text-muted); font-size: 0.85rem; margin-bottom: 12px;">
                    <i class="fa-solid fa-building-columns"></i> ${inv.institution} • ${inv.type === 'fixed' ? 'Renda Fixa' : (inv.type === 'variable' ? 'Renda Variável' : 'Outros')}
                </p>
                <div style="display:flex; justify-content: space-between; margin-bottom: 4px;">
                    <span>Valor Aplicado:</span>
                    <strong>${formatCurrency(inv.amount)}</strong>
                </div>
                <div style="display:flex; justify-content: space-between; color: var(--text-muted); font-size: 0.85rem;">
                    <span>Data: ${formatDate(inv.date)}</span>
                    ${inv.dueDate ? `<span>Venc: ${formatDate(inv.dueDate)}</span>` : ''}
                </div>
                ${inv.type === 'fixed' ? `<div style="font-size: 0.85rem; margin-top: 4px; color: var(--primary);"><i class="fa-solid fa-percent"></i> Taxa: ${inv.rateValue}% ${inv.rateType.toUpperCase()}</div>` : ''}
                
                ${yieldHtml}
            </div>
        `;
    });

    document.getElementById('total-investments').textContent = formatCurrency(totalInvested);
    document.getElementById('total-investments-yield').textContent = formatCurrency(totalGross);
}

const investTypeSelect = document.getElementById('invest-type');
const fixedIncomeFields = document.getElementById('fixed-income-fields');
const investDueDateContainer = document.getElementById('invest-due-date-container');

if (investTypeSelect) {
    investTypeSelect.addEventListener('change', (e) => {
        if (e.target.value === 'fixed') {
            fixedIncomeFields.style.display = 'block';
            investDueDateContainer.style.display = 'block';
        } else {
            fixedIncomeFields.style.display = 'none';
            investDueDateContainer.style.display = 'none';
        }
    });
}

const btnNewInvestmentTrigger = document.getElementById('btn-new-investment');
if (btnNewInvestmentTrigger) {
    btnNewInvestmentTrigger.addEventListener('click', () => {
        formInvestment.reset();
        document.getElementById('investment-modal').querySelector('h2').textContent = 'Novo Investimento';
        document.getElementById('edit-investment-fields').style.display = 'none';
        document.getElementById('invest-id').value = '';
        document.getElementById('invest-amount').disabled = false;
        document.getElementById('invest-date').valueAsDate = new Date();
        investTypeSelect.dispatchEvent(new Event('change'));
        investmentModal.classList.add('active');
    });
}

if (formInvestment) {
    formInvestment.addEventListener('submit', async (e) => {
        e.preventDefault();
        const id = document.getElementById('invest-id').value;
        const name = document.getElementById('invest-name').value;
        const institution = document.getElementById('invest-institution').value;
        const type = investTypeSelect.value;
        const baseAmount = parseCurrencyInput(document.getElementById('invest-amount').value);
        const date = document.getElementById('invest-date').value;
        const dueDate = document.getElementById('invest-due-date').value;

        const newAporte = parseCurrencyInput(document.getElementById('invest-new-aporte').value) || 0;
        const manualValStr = document.getElementById('invest-manual-value').value;
        const manualCurrentValue = manualValStr ? parseFloat(manualValStr) : null;

        let finalAmount = baseAmount;
        if (id && newAporte > 0) {
            finalAmount += newAporte;
        }

        const payload = { userId: currentUser.uid, name, institution, type, amount: finalAmount, date, dueDate };

        if (manualCurrentValue !== null) {
            payload.manualCurrentValue = manualCurrentValue;
        } else if (id) {
            payload.manualCurrentValue = firebase.firestore.FieldValue.delete();
        }

        if (!id) payload.createdAt = firebase.firestore.FieldValue.serverTimestamp();

        if (type === 'fixed') {
            payload.rateType = document.getElementById('invest-rate-type').value;
            payload.rateValue = parseFloat(document.getElementById('invest-rate-value').value || 0);
        }

        try {
            if (id) {
                await investmentsCollection.doc(id).update(payload);
            } else {
                await investmentsCollection.add(payload);
            }
            investmentModal.classList.remove('active');
            formInvestment.reset();
        } catch (err) {
            alert("Erro ao salvar investimento: " + err.message);
        }
    });
}

window.editInvestment = (id) => {
    const inv = investmentsList.find(i => i.id === id);
    if (!inv) return;

    formInvestment.reset();
    document.getElementById('investment-modal').querySelector('h2').textContent = 'Editar Investimento / Aporte';
    document.getElementById('edit-investment-fields').style.display = 'block';
    document.getElementById('invest-id').value = inv.id;

    document.getElementById('invest-name').value = inv.name;
    document.getElementById('invest-institution').value = inv.institution;
    document.getElementById('invest-type').value = inv.type;
    document.getElementById('invest-amount').value = inv.amount;
    document.getElementById('invest-amount').disabled = true;
    document.getElementById('invest-date').value = inv.date;
    if (inv.dueDate) document.getElementById('invest-due-date').value = inv.dueDate;

    if (inv.type === 'fixed') {
        document.getElementById('invest-rate-type').value = inv.rateType;
        document.getElementById('invest-rate-value').value = inv.rateValue;
    }

    if (inv.manualCurrentValue !== undefined && inv.manualCurrentValue !== null) {
        document.getElementById('invest-manual-value').value = inv.manualCurrentValue;
    }

    investTypeSelect.dispatchEvent(new Event('change'));
    investmentModal.classList.add('active');
};

window.deleteInvestment = async (id) => {
    if (confirm('Excluir este investimento permanentemente?')) {
        await investmentsCollection.doc(id).delete();
    }
};

// =============================================================================
// SEÇÃO 27 — TEMA E DATA INICIAL
// =============================================================================

document.getElementById('current-date').textContent = new Date().toLocaleDateString('pt-BR', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }).replace(/^\w/, c => c.toUpperCase());
document.getElementById('date').valueAsDate = new Date();
const themeToggleSettings = document.getElementById('theme-toggle-settings');
const themeToggleTrack = document.getElementById('theme-toggle-track');
const themeToggleCircle = document.getElementById('theme-toggle-circle');

function updateThemeUI() {
    if (isDarkMode) {
        document.body.setAttribute('data-theme', 'dark');
    } else {
        document.body.removeAttribute('data-theme');
    }

    if (themeToggleCircle && themeToggleTrack) {
        if (isDarkMode) {
            themeToggleCircle.style.transform = 'translateX(20px)';
            themeToggleTrack.style.background = 'var(--primary)';
        } else {
            themeToggleCircle.style.transform = 'translateX(0)';
            themeToggleTrack.style.background = 'var(--border)';
        }
    }
}

if (isDarkMode) { document.body.setAttribute('data-theme', 'dark'); }
updateThemeUI();

if (themeToggleSettings) {
    themeToggleSettings.addEventListener('click', () => {
        isDarkMode = !isDarkMode;
        localStorage.setItem('contaComigo_darkMode', isDarkMode);
        updateThemeUI();
    });
}

// =============================================================================
// SEÇÃO 28 — RELATÓRIOS
// =============================================================================

window.populateReportBankSelect = function () {
    const reportBank = document.getElementById('report-bank');
    if (!reportBank) return;

    let opts = '<option value="" disabled selected>Selecione um banco</option>';
    banksList.forEach(b => {
        opts += `<option value="${b.id}">🏦 ${b.name}</option>`;
    });
    reportBank.innerHTML = opts;
};

window.handleReportTypeChange = function () {
    const reportType = document.getElementById('report-type').value;
    const bankContainer = document.getElementById('report-bank-container');
    const monthContainer = document.getElementById('report-period-container');

    if (reportType === 'bank-statement') {
        bankContainer.style.display = 'block';
        monthContainer.style.display = 'block';
    } else if (reportType === 'credit-card') {
        bankContainer.style.display = 'none';
        monthContainer.style.display = 'block';
    } else {
        bankContainer.style.display = 'none';
        monthContainer.style.display = 'block';
    }
};

window.generateReport = function () {
    const reportType = document.getElementById('report-type').value;
    const reportMonth = document.getElementById('report-month').value;
    const previewContent = document.getElementById('report-preview-content');
    const btnPrint = document.getElementById('btn-print-report');
    const btnExport = document.getElementById('btn-export-csv');

    if (!reportMonth) {
        alert('Por favor, selecione um mês de referência.');
        return;
    }

    let html = '';
    let title = '';

    switch (reportType) {
        case 'monthly-summary':
            html = generateMonthlySummary(reportMonth);
            title = 'Resumo Mensal (DRE)';
            break;
        case 'category-expenses':
            html = generateCategoryReport(reportMonth);
            title = 'Gastos por Categoria';
            break;
        case 'bank-statement':
            const bankId = document.getElementById('report-bank').value;
            if (!bankId) {
                alert('Por favor, selecione uma conta bancária.');
                return;
            }
            html = generateBankStatement(reportMonth, bankId);
            title = 'Extrato Bancário';
            break;
        case 'credit-card':
            html = generateCreditCardReport(reportMonth);
            title = 'Relatório de Cartões';
            break;
        default:
            html = '<p style="color: var(--text-muted);">Tipo de relatório não suportado.</p>';
    }

    previewContent.innerHTML = html;
    btnPrint.disabled = false;
    btnExport.disabled = false;

    window._currentReportHTML = html;
    window._currentReportTitle = title;
};

function generateMonthlySummary(month) {
    const [year, monthNum] = month.split('-');
    const startDate = `${year}-${monthNum}-01`;
    const lastDay = new Date(year, parseInt(monthNum), 0).getDate();
    const endDate = `${year}-${monthNum}-${String(lastDay).padStart(2, '0')}`;

    const monthTransactions = transactions.filter(t => {
        return t.date >= startDate && t.date <= endDate;
    });

    const income = monthTransactions.filter(t => t.type === 'income').reduce((acc, t) => acc + t.amount, 0);
    const expenses = monthTransactions.filter(t => t.type === 'expense').reduce((acc, t) => acc + t.amount, 0);
    const balance = income - expenses;

    const categoryExpenses = {};
    monthTransactions.filter(t => t.type === 'expense').forEach(t => {
        const cat = t.category || 'Sem Categoria';
        if (!categoryExpenses[cat]) categoryExpenses[cat] = 0;
        categoryExpenses[cat] += t.amount;
    });

    const sortedCategories = Object.entries(categoryExpenses)
        .sort((a, b) => b[1] - a[1]);

    let categoryHtml = '';
    if (sortedCategories.length === 0) {
        categoryHtml = '<tr><td colspan="2" style="text-align: center; color: var(--text-muted);">Nenhuma despesa neste período.</td></tr>';
    } else {
        sortedCategories.forEach(([cat, total]) => {
            const percent = expenses > 0 ? ((total / expenses) * 100).toFixed(1) : 0;
            categoryHtml += `
                <tr>
                    <td>${cat}</td>
                    <td style="text-align: right; font-weight: 500;">${formatCurrency(total)}</td>
                    <td style="text-align: right; color: var(--text-muted);">${percent}%</td>
                </tr>
            `;
        });
    }

    return `
        <div class="report-content">
            <h3 style="margin-bottom: 8px;">📊 ${formatMonthYear(month)}</h3>
            <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 16px; margin-bottom: 24px;">
                <div style="background: var(--success-bg); padding: 16px; border-radius: 8px; text-align: center; border: 1px solid var(--success);">
                    <span style="display: block; font-size: 0.85rem; color: var(--text-muted);">Receitas</span>
                    <span style="font-size: 1.5rem; font-weight: 700; color: var(--success);">${formatCurrency(income)}</span>
                </div>
                <div style="background: var(--danger-bg); padding: 16px; border-radius: 8px; text-align: center; border: 1px solid var(--danger);">
                    <span style="display: block; font-size: 0.85rem; color: var(--text-muted);">Despesas</span>
                    <span style="font-size: 1.5rem; font-weight: 700; color: var(--danger);">${formatCurrency(expenses)}</span>
                </div>
                <div style="background: var(--bg-body); padding: 16px; border-radius: 8px; text-align: center; border: 1px solid var(--border);">
                    <span style="display: block; font-size: 0.85rem; color: var(--text-muted);">Saldo do Mês</span>
                    <span style="font-size: 1.5rem; font-weight: 700; color: ${balance >= 0 ? 'var(--success)' : 'var(--danger)'};">${formatCurrency(balance)}</span>
                </div>
            </div>
            
            <h4 style="margin-bottom: 12px;">Despesas por Categoria</h4>
            <table style="width: 100%; border-collapse: collapse;">
                <thead>
                    <tr style="border-bottom: 2px solid var(--border);">
                        <th style="text-align: left; padding: 8px; color: var(--text-muted);">Categoria</th>
                        <th style="text-align: right; padding: 8px; color: var(--text-muted);">Valor</th>
                        <th style="text-align: right; padding: 8px; color: var(--text-muted);">%</th>
                    </tr>
                </thead>
                <tbody>
                    ${categoryHtml}
                </tbody>
            </table>
            
            <div style="margin-top: 16px; padding-top: 16px; border-top: 1px solid var(--border); color: var(--text-muted); font-size: 0.85rem;">
                <span>Total de transações: ${monthTransactions.length}</span>
            </div>
        </div>
    `;
}

function generateCategoryReport(month) {
    const [year, monthNum] = month.split('-');
    const startDate = `${year}-${monthNum}-01`;
    const lastDay = new Date(year, parseInt(monthNum), 0).getDate();
    const endDate = `${year}-${monthNum}-${String(lastDay).padStart(2, '0')}`;

    const monthTransactions = transactions.filter(t => {
        return t.date >= startDate && t.date <= endDate;
    });

    const categoryTotals = {};
    monthTransactions.forEach(t => {
        const cat = t.category || 'Sem Categoria';
        if (!categoryTotals[cat]) {
            categoryTotals[cat] = { income: 0, expense: 0, total: 0 };
        }
        if (t.type === 'income') {
            categoryTotals[cat].income += t.amount;
        } else {
            categoryTotals[cat].expense += t.amount;
        }
        categoryTotals[cat].total += t.type === 'income' ? t.amount : -t.amount;
    });

    const sortedCategories = Object.entries(categoryTotals)
        .sort((a, b) => Math.abs(b[1].total) - Math.abs(a[1].total));

    let categoryHtml = '';
    if (sortedCategories.length === 0) {
        categoryHtml = '<tr><td colspan="4" style="text-align: center; color: var(--text-muted);">Nenhuma transação neste período.</td></tr>';
    } else {
        sortedCategories.forEach(([cat, data]) => {
            categoryHtml += `
                <tr>
                    <td>${cat}</td>
                    <td style="text-align: right; font-weight: 500; color: var(--success);">${formatCurrency(data.income)}</td>
                    <td style="text-align: right; font-weight: 500; color: var(--danger);">${formatCurrency(data.expense)}</td>
                    <td style="text-align: right; font-weight: 700; color: ${data.total >= 0 ? 'var(--success)' : 'var(--danger)'};">${formatCurrency(data.total)}</td>
                </tr>
            `;
        });
    }

    return `
        <div class="report-content">
            <h3 style="margin-bottom: 8px;">📊 Gastos por Categoria - ${formatMonthYear(month)}</h3>
            <table style="width: 100%; border-collapse: collapse;">
                <thead>
                    <tr style="border-bottom: 2px solid var(--border);">
                        <th style="text-align: left; padding: 8px; color: var(--text-muted);">Categoria</th>
                        <th style="text-align: right; padding: 8px; color: var(--text-muted);">Receitas</th>
                        <th style="text-align: right; padding: 8px; color: var(--text-muted);">Despesas</th>
                        <th style="text-align: right; padding: 8px; color: var(--text-muted);">Saldo</th>
                    </tr>
                </thead>
                <tbody>
                    ${categoryHtml}
                </tbody>
            </table>
        </div>
    `;
}

function generateBankStatement(month, bankId) {
    const bank = banksList.find(b => b.id === bankId);
    if (!bank) return '<p style="color: var(--danger);">Banco não encontrado.</p>';

    const [year, monthNum] = month.split('-');
    const startDate = `${year}-${monthNum}-01`;
    const lastDay = new Date(year, parseInt(monthNum), 0).getDate();
    const endDate = `${year}-${monthNum}-${String(lastDay).padStart(2, '0')}`;

    const bankTransactions = transactions.filter(t => {
        return t.paymentMethod === bankId && t.date >= startDate && t.date <= endDate;
    }).sort((a, b) => a.date.localeCompare(b.date));

    let runningBalance = bank.balance || 0;
    let transactionHtml = '';

    if (bankTransactions.length === 0) {
        transactionHtml = '<tr><td colspan="4" style="text-align: center; color: var(--text-muted);">Nenhuma transação neste período.</td></tr>';
    } else {
        bankTransactions.forEach(t => {
            runningBalance += t.type === 'income' ? t.amount : -t.amount;
            transactionHtml += `
                <tr>
                    <td>${formatDate(t.date)}</td>
                    <td>${t.description}</td>
                    <td style="text-align: right; color: ${t.type === 'income' ? 'var(--success)' : 'var(--danger)'};">${formatCurrency(t.amount)}</td>
                    <td style="text-align: right; font-weight: 500;">${formatCurrency(runningBalance)}</td>
                </tr>
            `;
        });
    }

    const totalIncome = bankTransactions.filter(t => t.type === 'income').reduce((acc, t) => acc + t.amount, 0);
    const totalExpense = bankTransactions.filter(t => t.type === 'expense').reduce((acc, t) => acc + t.amount, 0);
    const finalBalance = runningBalance;

    return `
        <div class="report-content">
            <h3 style="margin-bottom: 8px;">🏦 Extrato - ${bank.name}</h3>
            <p style="color: var(--text-muted); margin-bottom: 16px;">${formatMonthYear(month)}</p>
            
            <div style="display: grid; grid-template-columns: repeat(4, 1fr); gap: 12px; margin-bottom: 20px;">
                <div style="background: var(--bg-body); padding: 12px; border-radius: 8px; text-align: center;">
                    <span style="display: block; font-size: 0.75rem; color: var(--text-muted);">Saldo Inicial</span>
                    <span style="font-weight: 700;">${formatCurrency(bank.balance || 0)}</span>
                </div>
                <div style="background: var(--success-bg); padding: 12px; border-radius: 8px; text-align: center;">
                    <span style="display: block; font-size: 0.75rem; color: var(--text-muted);">Receitas</span>
                    <span style="font-weight: 700; color: var(--success);">${formatCurrency(totalIncome)}</span>
                </div>
                <div style="background: var(--danger-bg); padding: 12px; border-radius: 8px; text-align: center;">
                    <span style="display: block; font-size: 0.75rem; color: var(--text-muted);">Despesas</span>
                    <span style="font-weight: 700; color: var(--danger);">${formatCurrency(totalExpense)}</span>
                </div>
                <div style="background: var(--bg-body); padding: 12px; border-radius: 8px; text-align: center;">
                    <span style="display: block; font-size: 0.75rem; color: var(--text-muted);">Saldo Final</span>
                    <span style="font-weight: 700; color: ${finalBalance >= 0 ? 'var(--success)' : 'var(--danger)'};">${formatCurrency(finalBalance)}</span>
                </div>
            </div>
            
            <table style="width: 100%; border-collapse: collapse;">
                <thead>
                    <tr style="border-bottom: 2px solid var(--border);">
                        <th style="text-align: left; padding: 8px; color: var(--text-muted);">Data</th>
                        <th style="text-align: left; padding: 8px; color: var(--text-muted);">Descrição</th>
                        <th style="text-align: right; padding: 8px; color: var(--text-muted);">Valor</th>
                        <th style="text-align: right; padding: 8px; color: var(--text-muted);">Saldo</th>
                    </tr>
                </thead>
                <tbody>
                    ${transactionHtml}
                </tbody>
            </table>
        </div>
    `;
}

function generateCreditCardReport(month) {
    const [year, monthNum] = month.split('-');
    const startDate = `${year}-${monthNum}-01`;
    const lastDay = new Date(year, parseInt(monthNum), 0).getDate();
    const endDate = `${year}-${monthNum}-${String(lastDay).padStart(2, '0')}`;

    if (cardsList.length === 0) {
        return '<p style="color: var(--text-muted);">Nenhum cartão cadastrado.</p>';
    }

    let cardsHtml = '';
    cardsList.forEach(card => {
        const cardTransactions = transactions.filter(t => {
            return t.paymentMethod === card.id && t.date >= startDate && t.date <= endDate;
        });

        const totalIncome = cardTransactions.filter(t => t.type === 'income').reduce((acc, t) => acc + t.amount, 0);
        const totalExpense = cardTransactions.filter(t => t.type === 'expense').reduce((acc, t) => acc + t.amount, 0);
        const balance = totalIncome - totalExpense;

        let txRows = '';
        if (cardTransactions.length === 0) {
            txRows = '<tr><td colspan="3" style="text-align: center; color: var(--text-muted);">Sem movimentação</td></tr>';
        } else {
            cardTransactions.forEach(t => {
                txRows += `
                    <tr>
                        <td>${formatDate(t.date)}</td>
                        <td>${t.description}</td>
                        <td style="text-align: right; color: ${t.type === 'income' ? 'var(--success)' : 'var(--danger)'};">${formatCurrency(t.amount)}</td>
                    </tr>
                `;
            });
        }

        cardsHtml += `
            <div style="background: var(--bg-body); padding: 16px; border-radius: 8px; border: 1px solid var(--border); margin-bottom: 16px;">
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px;">
                    <h4 style="margin: 0;">💳 ${card.nickname}</h4>
                    <span style="background: ${balance >= 0 ? 'var(--success-bg)' : 'var(--danger-bg)'}; padding: 4px 12px; border-radius: 12px; font-weight: 600; color: ${balance >= 0 ? 'var(--success)' : 'var(--danger)'};">${formatCurrency(balance)}</span>
                </div>
                <table style="width: 100%; border-collapse: collapse;">
                    <thead>
                        <tr style="border-bottom: 1px solid var(--border);">
                            <th style="text-align: left; padding: 4px 8px; color: var(--text-muted); font-size: 0.85rem;">Data</th>
                            <th style="text-align: left; padding: 4px 8px; color: var(--text-muted); font-size: 0.85rem;">Descrição</th>
                            <th style="text-align: right; padding: 4px 8px; color: var(--text-muted); font-size: 0.85rem;">Valor</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${txRows}
                    </tbody>
                </table>
                <div style="margin-top: 8px; display: flex; justify-content: space-between; font-size: 0.85rem; color: var(--text-muted);">
                    <span>Limite: ${formatCurrency(card.limit)}</span>
                    <span>Fechamento: Dia ${card.closingDay} | Vencimento: Dia ${card.dueDay}</span>
                </div>
            </div>
        `;
    });

    return `
        <div class="report-content">
            <h3 style="margin-bottom: 16px;">💳 Relatório de Cartões - ${formatMonthYear(month)}</h3>
            ${cardsHtml}
        </div>
    `;
}



window.printReport = function () {
    window.print();
};

window.exportReportCSV = function () {
    const content = document.getElementById('report-preview-content');
    const rows = content.querySelectorAll('table tr');

    if (rows.length === 0) {
        alert('Nenhum dado para exportar.');
        return;
    }

    let csv = '';
    rows.forEach(row => {
        const cols = row.querySelectorAll('th, td');
        const rowData = [];
        cols.forEach(col => {
            rowData.push('"' + col.textContent.trim().replace(/"/g, '""') + '"');
        });
        csv += rowData.join(',') + '\n';
    });

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `relatorio_${new Date().toISOString().slice(0, 10)}.csv`;
    link.click();
    URL.revokeObjectURL(link.href);
};

initBulkModeTabs();
initPdfImport();

// =============================================================================
// SEÇÃO 29 — CÁLCULO DA FATURA DO CARTÃO
// =============================================================================

function calculateCardInvoice() {
    const currentMonth = new Date().toISOString().slice(0, 7);
    const currentYear = new Date().getFullYear();
    const currentMonthNum = new Date().getMonth();

    let totalInvoice = 0;
    let cardDetails = [];

    cardsList.forEach(card => {
        const cardTransactions = transactions.filter(t => {
            if (t.paymentMethod !== card.id) return false;
            if (t.type !== 'expense') return false;
            if (!t.date) return false;

            const txDate = new Date(t.date);
            return txDate.getFullYear() === currentYear &&
                txDate.getMonth() === currentMonthNum;
        });

        const total = cardTransactions.reduce((acc, t) => acc + t.amount, 0);

        if (total > 0) {
            cardDetails.push({
                name: card.nickname,
                bank: card.bank,
                total: total
            });
            totalInvoice += total;
        }
    });

    cardDetails.sort((a, b) => b.total - a.total);

    let details = '';
    if (cardDetails.length === 0) {
        details = 'Nenhum gasto no cartão este mês';
    } else if (cardDetails.length === 1) {
        details = `${cardDetails[0].name}: ${formatCurrency(cardDetails[0].total)}`;
    } else {
        const mainCard = cardDetails[0];
        const otherCount = cardDetails.length - 1;
        const otherTotal = cardDetails.slice(1).reduce((acc, c) => acc + c.total, 0);
        details = `${mainCard.name}: ${formatCurrency(mainCard.total)} + ${otherCount} outro(s) cartão(es) (${formatCurrency(otherTotal)})`;
    }

    return {
        total: totalInvoice,
        details: details,
        cards: cardDetails
    };
}

// =============================================================================
// SEÇÃO 30 — GRÁFICO DE PIZZA
// =============================================================================

let categoryChart = null;

window.generateCategoryChart = generateCategoryChart;
function generateCategoryChart() {
    const ctx = document.getElementById('category-chart');
    if (!ctx) return;

    const period = parseInt(document.getElementById('chart-period').value) || 30;
    const dateStart = document.getElementById('chart-date-start').value;
    const dateEnd = document.getElementById('chart-date-end').value;

    let startDate = dateStart;
    let endDate = dateEnd;

    if (!startDate && !endDate && period !== 'all') {
        const end = new Date();
        const start = new Date();
        start.setDate(start.getDate() - period);
        startDate = start.toISOString().slice(0, 10);
        endDate = end.toISOString().slice(0, 10);

        document.getElementById('chart-date-start').value = startDate;
        document.getElementById('chart-date-end').value = endDate;
    }

    let filteredTransactions = transactions;

    if (startDate || endDate) {
        filteredTransactions = transactions.filter(t => {
            if (!t.date) return true;
            if (startDate && t.date < startDate) return false;
            if (endDate && t.date > endDate) return false;
            return true;
        });
    }

    const expenses = filteredTransactions.filter(t => t.type === 'expense');

    const categoryTotals = {};
    expenses.forEach(t => {
        const cat = t.category || 'Sem Categoria';
        if (!categoryTotals[cat]) {
            categoryTotals[cat] = 0;
        }
        categoryTotals[cat] += t.amount;
    });

    const sortedCategories = Object.entries(categoryTotals)
        .sort((a, b) => b[1] - a[1]);

    const labels = sortedCategories.map(item => item[0]);
    const data = sortedCategories.map(item => item[1]);

    const colors = [
        '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7',
        '#DDA0DD', '#FF8A5C', '#A29BFE', '#FD79A8', '#00B894',
        '#E17055', '#74B9FF', '#55EFC4', '#FDCB6E', '#E84393'
    ];

    const totalExpenses = data.reduce((a, b) => a + b, 0);

    const periodText = document.getElementById('chart-period').options[document.getElementById('chart-period').selectedIndex]?.text || 'Últimos 30 dias';
    const titleElement = document.querySelector('#page-dashboard .section-header h3');
    if (titleElement) {
        const periodLabel = startDate && endDate ? `${formatDate(startDate)} a ${formatDate(endDate)}` : periodText;
        titleElement.textContent = `Distribuição de Despesas (${periodLabel})`;
    }

    if (data.length === 0) {
        ctx.style.display = 'none';
        document.getElementById('chart-legend').innerHTML =
            '<p style="color: var(--text-muted); text-align: center; font-size: 0.9rem;">Nenhuma despesa no período selecionado.</p>';
        return;
    }
    ctx.style.display = 'block';

    if (categoryChart) {
        categoryChart.destroy();
    }

    categoryChart = new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: labels,
            datasets: [{
                data: data,
                backgroundColor: colors.slice(0, data.length),
                borderColor: '#ffffff',
                borderWidth: 2
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    display: false
                },
                tooltip: {
                    callbacks: {
                        label: function (context) {
                            const total = context.dataset.data.reduce((a, b) => a + b, 0);
                            const percentage = total > 0 ? ((context.parsed / total) * 100).toFixed(1) : 0;
                            return `${context.label}: ${formatCurrency(context.parsed)} (${percentage}%)`;
                        }
                    }
                }
            }
        }
    });

    const legendContainer = document.getElementById('chart-legend');
    if (legendContainer) {
        const total = data.reduce((a, b) => a + b, 0);
        legendContainer.innerHTML = labels.map((label, index) => {
            const value = data[index];
            const percentage = total > 0 ? ((value / total) * 100).toFixed(1) : 0;
            return `
                <div class="legend-item">
                    <span class="color-dot" style="background: ${colors[index % colors.length]};"></span>
                    <span style="font-weight: 500;">${label}</span>
                    <span class="value">${formatCurrency(value)}</span>
                    <span class="percentage">(${percentage}%)</span>
                </div>
            `;
        }).join('');

        legendContainer.innerHTML += `
            <div class="legend-total">
                <span style="font-weight: 600;">Total:</span>
                <span class="total-value">${formatCurrency(total)}</span>
            </div>
        `;
    }
}

// =============================================================================
// SEÇÃO 31 — LIMPAR FILTROS
// =============================================================================

function clearCardFilters() {
    currentCardFilter = {
        id: null,
        search: '',
        startDate: '',
        endDate: '',
        month: ''
    };
    if (expandedCardId) {
        window.filterCardExtract(expandedCardId);
    }
}

function clearBankFilters() {
    currentBankFilter = {
        id: null,
        startDate: '',
        endDate: ''
    };
    if (currentBankFilter.id) {
        window.filterBankExtract(currentBankFilter.id);
    }
}

function refreshUIWithFilters() {
    updateAppUI();

    if (expandedCardId) {
        setTimeout(() => window.filterCardExtract(expandedCardId), 300);
    }

    if (currentBankFilter.id) {
        setTimeout(() => window.filterBankExtract(currentBankFilter.id), 300);
    }

    if (document.getElementById('page-transacoes').classList.contains('active')) {
        setTimeout(() => applyTransacoesFilters(), 300);
    }
}

// =============================================================================
// SEÇÃO 32 — NAVEGAÇÃO DE MESES DO CARTÃO
// =============================================================================

window.navigateCardMonth = (cardId, direction) => {
    const monthInput = document.getElementById('cc-filter-month');
    if (!monthInput) return;

    let currentMonth = monthInput.value;
    if (!currentMonth) {
        const today = new Date();
        currentMonth = today.toISOString().slice(0, 7);
    }

    const [year, month] = currentMonth.split('-').map(Number);
    const date = new Date(year, month - 1 + direction, 1);
    const newMonth = date.toISOString().slice(0, 7);

    monthInput.value = newMonth;
    currentCardFilter.month = newMonth;
    window.filterCardExtract(cardId);
};

window.resetCardMonth = (cardId) => {
    const monthInput = document.getElementById('cc-filter-month');
    if (!monthInput) return;

    const c = cardsList.find(x => x.id === cardId);
    if (!c) return;

    const today = new Date();
    const currentMonth = window.getInvoiceMonth(today.toISOString().slice(0, 10), c.closingDay);

    monthInput.value = currentMonth;
    currentCardFilter.month = currentMonth;
    window.filterCardExtract(cardId);
};

function updateCardTransactionCount(cardId) {
    const container = document.getElementById('inline-card-transactions');
    if (!container) return;

    const count = container.querySelectorAll('.transaction-item').length;
    const span = document.getElementById(`card-total-transactions-${cardId}`);
    if (span) {
        span.innerHTML = `<i class="fa-regular fa-file-lines"></i> ${count} transação${count !== 1 ? 'ões' : ''}`;
    }
}

document.addEventListener('keydown', (e) => {
    if (!expandedCardId) return;
    const monthInput = document.getElementById('cc-filter-month');
    if (!monthInput || document.activeElement === monthInput) return;

    if (e.key === 'ArrowLeft' && e.ctrlKey) {
        e.preventDefault();
        window.navigateCardMonth(expandedCardId, -1);
    } else if (e.key === 'ArrowRight' && e.ctrlKey) {
        e.preventDefault();
        window.navigateCardMonth(expandedCardId, 1);
    } else if (e.key === 'r' && e.ctrlKey) {
        e.preventDefault();
        window.resetCardMonth(expandedCardId);
    }
});

// =============================================================================
// SEÇÃO 33 — DATAS DO MODO EM LOTE
// =============================================================================

window.applyBulkDateToAllRows = () => {
    const bulkDate = document.getElementById('bulk-date').value;
    if (!bulkDate) {
        alert('Por favor, selecione uma data primeiro.');
        return;
    }

    const rows = document.querySelectorAll('.bulk-row');
    if (rows.length === 0) {
        alert('Nenhuma linha para atualizar.');
        return;
    }

    rows.forEach(row => {
        const dateInput = row.querySelector('.bulk-row-date');
        if (dateInput) {
            dateInput.value = bulkDate;
        }
    });
};

window.setBulkDateToToday = () => {
    const today = new Date().toISOString().slice(0, 10);
    document.getElementById('bulk-date').value = today;
    window.applyBulkDateToAllRows();
};

document.addEventListener('DOMContentLoaded', () => {
    const bulkDateInput = document.getElementById('bulk-date');
    if (bulkDateInput) {
        bulkDateInput.addEventListener('change', function () {
            const rows = document.querySelectorAll('.bulk-row');
            rows.forEach(row => {
                const dateInput = row.querySelector('.bulk-row-date');
                if (dateInput && !dateInput.value) {
                    dateInput.value = this.value;
                }
            });
        });
    }
});

// =============================================================================
// EXPOSIÇÃO GLOBAL PARA FUNÇÕES CHAMADAS VIA ONCLICK
// =============================================================================

// Funções de bancos
window.renderBanks = renderBanks;
window.editBank = editBank;
window.deleteBank = deleteBank;
window.expandBank = expandBank;
window.filterBankExtract = filterBankExtract;
window.generateBankReport = generateBankReport;
window.setBankFilterToMonth = setBankFilterToMonth;
window.clearBankFilters = clearBankFilters;
window.openTransactionModalWithBank = openTransactionModalWithBank;

// Funções de cartões
window.renderCards = renderCards;
window.editCard = editCard;
window.deleteCard = deleteCard;
window.toggleCardExtract = toggleCardExtract;
window.closeCardExtract = closeCardExtract;
window.filterCardExtract = filterCardExtract;
window.navigateCardMonth = navigateCardMonth;
window.resetCardMonth = resetCardMonth;
window.generateCardReport = generateCardReport;
window.launchCardFatura = launchCardFatura;

// Funções de transações
window.editTransaction = editTransaction;
window.deleteTransaction = deleteTransaction;
window.renderTransactions = renderTransactions;
window.applyBulkDateToAllRows = applyBulkDateToAllRows;
window.setBulkDateToToday = setBulkDateToToday;
window.addBulkRow = addBulkRow;
window.addBulkRowWithData = addBulkRowWithData;
window.resetBulkMode = resetBulkMode;

// Funções de metas
window.addFundsToGoal = addFundsToGoal;
window.deleteGoal = deleteGoal;
window.populateGoalsSelect = populateGoalsSelect;

// Funções de categorias
window.editCategory = editCategory;
window.deleteCategory = deleteCategory;
window.selectCategoryIcon = selectCategoryIcon;
window.renderCategories = renderCategories;

// Funções de investimentos
window.editInvestment = editInvestment;
window.deleteInvestment = deleteInvestment;
window.renderInvestments = renderInvestments;

// Funções de transações fixas
window.editFixedTransaction = editFixedTransaction;
window.deleteFixedTransaction = deleteFixedTransaction;
window.launchManualFixedTransaction = launchManualFixedTransaction;
window.renderFixedTransactions = renderFixedTransactions;

// Funções de relatórios
window.generateReport = generateReport;
window.handleReportTypeChange = handleReportTypeChange;
window.populateReportBankSelect = populateReportBankSelect;
window.printReport = printReport;
window.exportReportCSV = exportReportCSV;

// Funções utilitárias
window.getInvoiceMonth = getInvoiceMonth;
window.generateCategoryChart = generateCategoryChart;
window.showPendingInstallmentsModal = showPendingInstallmentsModal;

console.log('Funções expostas globalmente');

// =============================================================================
// FIM DO ARQUIVO
// =============================================================================
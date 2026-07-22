/**
 * =============================================================================
 * CONTA COMIGO PRO — main.js
 * Ponto de entrada principal da aplicação (Vite Module Entry Point)
 * =============================================================================
 */

import { auth, db, transactionsCollection, goalsCollection, categoriesCollection, cardsCollection, fixedTransactionsCollection, banksCollection, investmentsCollection } from './firebase.js';
import { state, notifyStateChange } from './state.js';
import { navigateTo } from './router.js';
import { initModals, populatePaymentMethods, populateCategorySelects, populateGoalsSelect } from './modals.js';
import { showMessage, defaultCategories } from './utils.js';

// Elementos do DOM do Auth Shell
const authOverlay = document.getElementById('auth-overlay');
const appWrapper = document.getElementById('app-wrapper');
const btnGoogleLogin = document.getElementById('btn-google-login');
const formAuth = document.getElementById('form-auth-email');
const btnLogout = document.getElementById('btn-logout');

const userNameEl = document.getElementById('user-name');
const userEmailEl = document.getElementById('user-email');
const userAvatarEl = document.getElementById('user-avatar');

// Inicialização Principal
document.addEventListener('DOMContentLoaded', () => {
    updateCurrentDate();
    setupAuthListeners();
    setupSidebarNavigation();
    initModals();
});

function updateCurrentDate() {
    const currentDateEl = document.getElementById('current-date');
    if (currentDateEl) {
        const formatted = new Date().toLocaleDateString('pt-BR', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        }).replace(/^\w/, c => c.toUpperCase());
        currentDateEl.textContent = formatted;
    }
}

function setupAuthListeners() {
    auth.onAuthStateChanged((user) => {
        if (user) {
            state.currentUser = user;
            if (authOverlay) authOverlay.classList.remove('active');
            if (appWrapper) appWrapper.style.display = 'flex';
            updateProfileUI();
            updateCurrentDate();

            // Inicia os listeners em tempo real das coleções Firestore
            startRealtimeListeners();

            // Navega para a visão inicial (Dashboard)
            navigateTo('page-dashboard');
        } else {
            state.currentUser = null;
            if (appWrapper) appWrapper.style.display = 'none';
            if (authOverlay) authOverlay.classList.add('active');
            stopRealtimeListeners();
        }
    });

    if (btnGoogleLogin) {
        btnGoogleLogin.addEventListener('click', () => {
            auth.signInWithPopup(new firebase.auth.GoogleAuthProvider())
                .catch(err => showMessage(err.message, true));
        });
    }

    if (formAuth) {
        formAuth.addEventListener('submit', async (e) => {
            e.preventDefault();
            const email = document.getElementById('auth-email')?.value.trim();
            const password = document.getElementById('auth-password')?.value;
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
    }

    if (btnLogout) {
        btnLogout.addEventListener('click', () => auth.signOut());
    }
}

function updateProfileUI() {
    if (!state.currentUser) return;
    const defaultAv = `https://ui-avatars.com/api/?name=${state.currentUser.email}&background=6366f1&color=fff`;
    const nm = state.currentUser.displayName || "Usuário Vazio";
    const pt = state.currentUser.photoURL || defaultAv;

    if (userNameEl) userNameEl.textContent = nm;
    if (userEmailEl) userEmailEl.textContent = state.currentUser.email;
    if (userAvatarEl) userAvatarEl.src = pt;
}

let isSeeding = false;
async function seedDefaultCategoriesIfEmpty(uid) {
    if (isSeeding) return;
    isSeeding = true;
    try {
        const snap = await categoriesCollection.where('userId', '==', uid).get();
        if (snap.empty) {
            const batch = db.batch();
            defaultCategories.forEach(cat => {
                const docRef = categoriesCollection.doc();
                batch.set(docRef, {
                    userId: uid,
                    name: cat.name,
                    icon: cat.icon
                });
            });
            await batch.commit();
        }
    } catch (e) {
        console.error('Erro ao verificar categorias padrão:', e);
    } finally {
        isSeeding = false;
    }
}

function startRealtimeListeners() {
    const uid = state.currentUser.uid;

    state.unsTx = transactionsCollection
        .where("userId", "==", uid)
        .orderBy("date", "desc")
        .onSnapshot(snap => {
            state.transactions = [];
            snap.forEach(doc => state.transactions.push({ id: doc.id, ...doc.data() }));
            notifyStateChange('transactions-updated');
        });

    state.unsCards = cardsCollection.where('userId', '==', uid).onSnapshot(snap => {
        state.cardsList = [];
        snap.forEach(doc => state.cardsList.push({ id: doc.id, ...doc.data() }));
        populatePaymentMethods();
        notifyStateChange('cards-updated');
    });

    state.unsBanks = banksCollection.where('userId', '==', uid).onSnapshot(snap => {
        state.banksList = [];
        snap.forEach(doc => state.banksList.push({ id: doc.id, ...doc.data() }));
        populatePaymentMethods();
        notifyStateChange('banks-updated');
    });

    state.unsGoals = goalsCollection.where("userId", "==", uid).onSnapshot(snap => {
        state.goalsList = [];
        snap.forEach(doc => state.goalsList.push({ id: doc.id, ...doc.data() }));
        populateGoalsSelect();
        notifyStateChange('goals-updated');
    });

    state.unsCategories = categoriesCollection.where('userId', '==', uid).onSnapshot(async snap => {
        if (snap.empty) {
            await seedDefaultCategoriesIfEmpty(uid);
            return;
        }
        state.categoriesList = [];
        snap.forEach(doc => state.categoriesList.push({ id: doc.id, ...doc.data() }));
        populateCategorySelects();
        notifyStateChange('categories-updated');
    });

    state.unsFixed = fixedTransactionsCollection.where('userId', '==', uid).onSnapshot(snap => {
        state.fixedTransactionsList = [];
        snap.forEach(doc => state.fixedTransactionsList.push({ id: doc.id, ...doc.data() }));
        notifyStateChange('fixed-updated');
    });

    state.unsInvestments = investmentsCollection.where('userId', '==', uid).onSnapshot(snap => {
        state.investmentsList = [];
        snap.forEach(doc => state.investmentsList.push({ id: doc.id, ...doc.data() }));
        notifyStateChange('investments-updated');
    });
}

function stopRealtimeListeners() {
    if (state.unsTx) state.unsTx();
    if (state.unsCards) state.unsCards();
    if (state.unsBanks) state.unsBanks();
    if (state.unsGoals) state.unsGoals();
    if (state.unsCategories) state.unsCategories();
    if (state.unsFixed) state.unsFixed();
    if (state.unsInvestments) state.unsInvestments();
}

function setupSidebarNavigation() {
    const navLinks = document.querySelectorAll('#nav-menu a[data-page]');
    navLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const targetPageId = link.dataset.page;
            navigateTo(targetPageId);

            if (window.innerWidth <= 768) {
                closeSidebar();
            }
        });
    });

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
}

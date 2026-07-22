/**
 * =============================================================================
 * CONTA COMIGO PRO — firebase.js
 * Configuração e inicialização do Firebase (Auth & Firestore)
 * =============================================================================
 */

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

export const db = firebase.firestore();
try {
    db.settings({
        experimentalAutoDetectLongPolling: true,
        ignoreUndefinedProperties: true
    });
} catch (e) {
    // Configurações já inicializadas
}

export const auth = firebase.auth();

export const transactionsCollection = db.collection('transactions');
export const goalsCollection = db.collection('goals');
export const categoriesCollection = db.collection('categories');
export const cardsCollection = db.collection('cards');
export const fixedTransactionsCollection = db.collection('fixed_transactions');
export const banksCollection = db.collection('banks');
export const investmentsCollection = db.collection('investments');

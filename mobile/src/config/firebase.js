/**
 * =============================================================================
 * CONTA COMIGO PRO MOBILE — firebase.js
 * Configuração e inicialização do Firebase para React Native
 * =============================================================================
 */

import firebase from 'firebase/compat/app';
import 'firebase/compat/auth';
import 'firebase/compat/firestore';

const firebaseConfig = {
  apiKey: "AIzaSy_SUA_API_KEY_AQUI",
  authDomain: "conta-comigo-pro.firebaseapp.com",
  projectId: "conta-comigo-pro",
  storageBucket: "conta-comigo-pro.appspot.com",
  messagingSenderId: "1234567890",
  appId: "1:1234567890:web:abcdef123456"
};

if (!firebase.apps.length) {
  firebase.initializeApp(firebaseConfig);
}

export const db = firebase.firestore();
export const auth = firebase.auth();

export const transactionsCollection = db.collection('transactions');
export const goalsCollection = db.collection('goals');
export const categoriesCollection = db.collection('categories');
export const cardsCollection = db.collection('cards');
export const fixedTransactionsCollection = db.collection('fixed_transactions');
export const banksCollection = db.collection('banks');
export const investmentsCollection = db.collection('investments');

export default firebase;

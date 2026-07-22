/**
 * =============================================================================
 * CONTA COMIGO PRO MOBILE — state.js
 * Gerenciador de estado reativo global adaptado para React Native
 * =============================================================================
 */

export const state = {
  currentUser: null,
  transactions: [],
  banksList: [],
  cardsList: [],
  goalsList: [],
  categoriesList: [],
  fixedTransactionsList: [],
  investmentsList: [],
  editingTransactionId: null,
  editingFixedId: null,
  editingCardId: null,
  editingBankId: null,
  editingGoalId: null,
  editingCategoryId: null,
  editingInvestmentId: null,
};

const listeners = [];

export function subscribeState(fn) {
  listeners.push(fn);
  return () => {
    const index = listeners.indexOf(fn);
    if (index > -1) listeners.splice(index, 1);
  };
}

export function notifyStateChange(reason = 'general') {
  listeners.forEach(fn => fn(reason));
}

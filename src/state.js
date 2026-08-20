/**
 * =============================================================================
 * CONTA COMIGO PRO — state.js
 * Gerenciador de Estado Reativo Único (Compartilhado entre Web e Mobile)
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
    currentBankFilter: { id: null },
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

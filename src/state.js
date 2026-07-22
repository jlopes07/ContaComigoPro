/**
 * =============================================================================
 * CONTA COMIGO PRO — state.js
 * Estado global centralizado da aplicação
 * =============================================================================
 */

export const state = {
    currentUser: null,
    transactions: [],
    goalsList: [],
    fixedTransactionsList: [],
    cardsList: [],
    categoriesList: [],
    banksList: [],
    investmentsList: [],

    // Unsubscribes do Firestore
    unsTx: null,
    unsGoals: null,
    unsCategories: null,
    unsFixed: null,
    unsCards: null,
    unsBanks: null,
    unsInvestments: null,

    // Tema
    isDarkMode: localStorage.getItem('contaComigo_darkMode') === 'true',

    // Filtros e IDs de edição
    currentCardFilter: {
        id: null,
        search: '',
        startDate: '',
        endDate: '',
        month: ''
    },
    currentBankFilter: {
        id: null,
        startDate: '',
        endDate: ''
    },
    editingTransactionId: null,
    editingGroupId: null,
    editingFixedId: null,
    launchingFixedId: null,
    launchingCardId: null,
    editingCardId: null,
    expandedCardId: null,

    // Callbacks de atualização de views
    listeners: new Set()
};

export function subscribeState(callback) {
    state.listeners.add(callback);
    return () => state.listeners.delete(callback);
}

export function notifyStateChange(reason) {
    state.listeners.forEach(cb => {
        try { cb(reason); } catch (e) { console.error('Erro no listener de estado:', e); }
    });
}

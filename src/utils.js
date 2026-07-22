/**
 * =============================================================================
 * CONTA COMIGO PRO — utils.js
 * Funções Utilitárias Globais
 * =============================================================================
 */

export function parseCurrencyInput(value) {
    if (!value) return 0;
    let str = value.toString().trim();
    if (str.includes(',')) {
        str = str.replace(/\./g, '');
        str = str.replace(',', '.');
    }
    const parsed = parseFloat(str);
    return isNaN(parsed) ? 0 : parsed;
}

export function formatCurrency(val) {
    const num = Number(val) || 0;
    return num.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

export function formatDate(dateStr) {
    if (!dateStr) return '';
    const parts = dateStr.split('-');
    if (parts.length === 3) {
        return `${parts[2]}/${parts[1]}/${parts[0]}`;
    }
    return dateStr;
}

export const defaultCategories = [
    { name: 'Alimentação', icon: 'fa-utensils', type: 'expense', color: '#ef4444' },
    { name: 'Moradia', icon: 'fa-house', type: 'expense', color: '#f59e0b' },
    { name: 'Transporte', icon: 'fa-car', type: 'expense', color: '#3b82f6' },
    { name: 'Saúde', icon: 'fa-heart-pulse', type: 'expense', color: '#10b981' },
    { name: 'Educação', icon: 'fa-graduation-cap', type: 'expense', color: '#8b5cf6' },
    { name: 'Lazer', icon: 'fa-gamepad', type: 'expense', color: '#ec4899' },
    { name: 'Compras', icon: 'fa-bag-shopping', type: 'expense', color: '#6366f1' },
    { name: 'Salário', icon: 'fa-money-bill-wave', type: 'income', color: '#10b981' },
    { name: 'Investimentos', icon: 'fa-chart-line', type: 'income', color: '#0ea5e9' },
    { name: 'Outros', icon: 'fa-ellipsis', type: 'expense', color: '#64748b' }
];

export function getCategoryIcon(categoryName) {
    const found = defaultCategories.find(c => c.name.toLowerCase() === (categoryName || '').toLowerCase());
    return found ? found.icon : 'fa-tag';
}

export function getCategoryColor(categoryName) {
    const found = defaultCategories.find(c => c.name.toLowerCase() === (categoryName || '').toLowerCase());
    return found ? found.color : '#6366f1';
}

export function showMessage(msg, isError = false) {
    const authMessage = document.getElementById('auth-message');
    if (authMessage) {
        authMessage.textContent = msg;
        authMessage.style.color = isError ? 'var(--danger)' : 'var(--primary)';
    } else {
        alert(msg);
    }
}

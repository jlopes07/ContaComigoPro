/**
 * =============================================================================
 * CONTA COMIGO PRO — utils.js
 * Utilitários de Formatação Únicos (Compartilhados entre Web e Mobile)
 * =============================================================================
 */

export const defaultCategories = [
    'Alimentação',
    'Transporte',
    'Moradia',
    'Saúde',
    'Educação',
    'Lazer',
    'Compras',
    'Salário',
    'Investimentos',
    'Outros'
];

export function parseCurrencyInput(value) {
    if (!value && value !== 0) return 0;
    if (typeof value === 'number') return value;

    let str = String(value).replace(/R\$\s?/gi, '').trim();
    str = str.replace(/\./g, '').replace(',', '.');
    const num = parseFloat(str);
    return isNaN(num) ? 0 : num;
}

export function formatCurrency(amount) {
    const num = parseFloat(amount) || 0;
    return num.toLocaleString('pt-BR', {
        style: 'currency',
        currency: 'BRL'
    });
}

export function formatDate(dateString) {
    if (!dateString) return '';
    const parts = dateString.split('-');
    if (parts.length === 3) {
        return `${parts[2]}/${parts[1]}/${parts[0]}`;
    }
    return dateString;
}

export function getCategoryIcon(categoryName) {
    const map = {
        'Alimentação': 'fa-utensils',
        'Transporte': 'fa-car',
        'Moradia': 'fa-house',
        'Saúde': 'fa-heart-pulse',
        'Educação': 'fa-graduation-cap',
        'Lazer': 'fa-gamepad',
        'Compras': 'fa-bag-shopping',
        'Salário': 'fa-money-bill-wave',
        'Investimentos': 'fa-chart-line',
        'Viagem': 'fa-plane',
        'Presentes': 'fa-gift',
        'Transferência': 'fa-arrow-right-arrow-left'
    };
    return map[categoryName] || 'fa-tag';
}

export function getCategoryColor(categoryName) {
    const map = {
        'Alimentação': '#f59e0b',
        'Transporte': '#3b82f6',
        'Moradia': '#10b981',
        'Saúde': '#ef4444',
        'Educação': '#8b5cf6',
        'Lazer': '#ec4899',
        'Compras': '#6366f1',
        'Salário': '#059669',
        'Investimentos': '#10b981',
        'Outros': '#6b7280'
    };
    return map[categoryName] || '#3b82f6';
}

export function showMessage(msg, type = 'info') {
    if (typeof window !== 'undefined' && window.alert) {
        alert(msg);
    } else {
        console.log(`[${type.toUpperCase()}] ${msg}`);
    }
}

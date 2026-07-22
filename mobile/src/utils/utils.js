/**
 * =============================================================================
 * CONTA COMIGO PRO MOBILE — utils.js
 * Utilitários de formatação de moeda, datas e ícones para React Native
 * =============================================================================
 */

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
    currency: 'BRL',
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
    'Alimentação': 'silverware-fork-knife',
    'Transporte': 'car',
    'Moradia': 'home',
    'Saúde': 'heart-pulse',
    'Educação': 'school',
    'Lazer': 'controller-classic',
    'Compras': 'shopping-bag',
    'Salário': 'cash-multiple',
    'Investimentos': 'chart-line',
    'Viagem': 'airplane',
    'Presentes': 'gift',
  };
  return map[categoryName] || 'tag';
}

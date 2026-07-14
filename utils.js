/**
 * =============================================================================
 * CONTA COMIGO PRO — utils.js
 * =============================================================================
 * Funções auxiliares, formatadores, lógicas de negócios financeiras e utilitários
 * desacoplados de estado global direto e de efeitos de DOM.
 * =============================================================================
 */

// Formatação de valores em Reais (BRL)
export const formatCurrency = val => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val);

// Parse de strings de moeda BRL ou floats representados por texto para floats numéricos
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

// Formata strings "YYYY-MM" para texto em formato "Mês / Ano" (ex: "Janeiro 2026")
export function formatMonthYear(month) {
    if (!month) return '';
    const [year, monthNum] = month.split('-');
    const months = ['Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho', 'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'];
    return `${months[parseInt(monthNum) - 1]} ${year}`;
}

// Retorna o ícone associado à categoria fornecida
export function getCategoryIcon(catName, categoriesList = []) {
    const c = categoriesList.find(x => x.name === catName);
    return c ? c.icon : 'fa-tag';
}

// Busca o nome do método de pagamento (Banco ou Cartão) com base em seu ID
export function getPaymentMethodName(pmId, banksList = [], cardsList = []) {
    if (!pmId) return 'N/A';
    const bank = banksList.find(b => b.id === pmId);
    if (bank) return `🏦 ${bank.name}`;
    const card = cardsList.find(c => c.id === pmId);
    if (card) return `💳 ${card.nickname}`;
    return pmId;
}

// Analisa o texto de um extrato PDF extraído e retorna um array de objetos de transação
export function parsePDFTextHeuristic(text) {
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

// Projeção do rendimento de investimentos de Renda Fixa com regras de IR regressivo
export function calculateInvestmentYield(inv, targetDate = new Date(), marketRates = { cdi: 10.5, selic: 10.75 }, ignoreManual = false) {
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

// Calcula o valor total e detalhes textuais da fatura mensal dos cartões de crédito
export function calculateCardInvoice(cardsList = [], transactions = [], formatCurrencyFn = formatCurrency) {
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
        details = `${cardDetails[0].name}: ${formatCurrencyFn(cardDetails[0].total)}`;
    } else {
        const mainCard = cardDetails[0];
        const otherCount = cardDetails.length - 1;
        const otherTotal = cardDetails.slice(1).reduce((acc, c) => acc + c.total, 0);
        details = `${mainCard.name}: ${formatCurrencyFn(mainCard.total)} + ${otherCount} outro(s) cartão(es) (${formatCurrencyFn(otherTotal)})`;
    }

    return {
        total: totalInvoice,
        details: details,
        cards: cardDetails
    };
}

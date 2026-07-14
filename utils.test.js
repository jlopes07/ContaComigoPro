import { describe, it, expect } from 'vitest';
import {
    formatCurrency,
    parseCurrencyInput,
    formatMonthYear,
    getCategoryIcon,
    getPaymentMethodName,
    parsePDFTextHeuristic,
    calculateInvestmentYield,
    calculateCardInvoice
} from './utils.js';

describe('formatCurrency', () => {
    it('deve formatar valores monetários em BRL', () => {
        // Limpamos espaços para compatibilidade entre diferentes versões do Node
        const clean = str => str.replace(/\s/g, ' ');
        expect(clean(formatCurrency(1234.56))).toMatch(/R\$\s*1\.234,56/);
        expect(clean(formatCurrency(0))).toMatch(/R\$\s*0,00/);
        expect(clean(formatCurrency(-100.5))).toMatch(/-R\$\s*100,50/);
    });
});

describe('parseCurrencyInput', () => {
    it('deve fazer o parse correto de valores com formato brasileiro e padrão', () => {
        expect(parseCurrencyInput("1.234,56")).toBe(1234.56);
        expect(parseCurrencyInput("1234,56")).toBe(1234.56);
        expect(parseCurrencyInput("1234")).toBe(1234);
        expect(parseCurrencyInput(1234.56)).toBe(1234.56);
    });

    it('deve retornar 0 para valores inválidos ou vazios', () => {
        expect(parseCurrencyInput("")).toBe(0);
        expect(parseCurrencyInput(null)).toBe(0);
        expect(parseCurrencyInput(undefined)).toBe(0);
        expect(parseCurrencyInput("abc")).toBe(0);
    });
});

describe('formatMonthYear', () => {
    it('deve converter string YYYY-MM para formato por extenso em português', () => {
        expect(formatMonthYear("2026-07")).toBe("Julho 2026");
        expect(formatMonthYear("2026-01")).toBe("Janeiro 2026");
        expect(formatMonthYear("2026-12")).toBe("Dezembro 2026");
    });

    it('deve retornar string vazia para valores nulos ou vazios', () => {
        expect(formatMonthYear("")).toBe("");
        expect(formatMonthYear(null)).toBe("");
    });
});

describe('getCategoryIcon', () => {
    const categories = [
        { name: 'Alimentação', icon: 'fa-utensils' },
        { name: 'Transporte', icon: 'fa-car' }
    ];

    it('deve retornar o ícone correspondente à categoria cadastrada', () => {
        expect(getCategoryIcon('Alimentação', categories)).toBe('fa-utensils');
        expect(getCategoryIcon('Transporte', categories)).toBe('fa-car');
    });

    it('deve retornar fa-tag caso a categoria não seja cadastrada', () => {
        expect(getCategoryIcon('Lazer', categories)).toBe('fa-tag');
        expect(getCategoryIcon('Alimentação', [])).toBe('fa-tag');
    });
});

describe('getPaymentMethodName', () => {
    const banks = [{ id: 'bank-1', name: 'Banco do Brasil' }];
    const cards = [{ id: 'card-1', nickname: 'Roxinho' }];

    it('deve retornar o nome amigável para contas bancárias', () => {
        expect(getPaymentMethodName('bank-1', banks, cards)).toBe('🏦 Banco do Brasil');
    });

    it('deve retornar o nome amigável para cartões', () => {
        expect(getPaymentMethodName('card-1', banks, cards)).toBe('💳 Roxinho');
    });

    it('deve retornar o próprio ID como fallback se não encontrar banco nem cartão', () => {
        expect(getPaymentMethodName('outro-id', banks, cards)).toBe('outro-id');
    });

    it('deve retornar N/A para IDs nulos ou vazios', () => {
        expect(getPaymentMethodName('', banks, cards)).toBe('N/A');
        expect(getPaymentMethodName(null, banks, cards)).toBe('N/A');
    });
});

describe('parsePDFTextHeuristic', () => {
    it('deve extrair transações corretamente de linhas de texto formatadas', () => {
        const text = `
            13/07/2026 COMPRA MERCADO BH R$ 150,00 D
            14/07 PIX RECEBIDO DE JOAO R$ 200,00 C
            15/07/26 UBER VIAGEM R$ 25,50 -
        `;
        const currentYear = new Date().getFullYear();
        const res = parsePDFTextHeuristic(text);

        expect(res).toHaveLength(3);

        // Primeiro item: Despesa com ano explícito 2026
        expect(res[0].date).toBe('2026-07-13');
        expect(res[0].description).toBe('COMPRA MERCADO BH');
        expect(res[0].amount).toBe(150.00);
        expect(res[0].type).toBe('expense');
        expect(res[0].category).toBe('Alimentação');

        // Segundo item: Receita com ano implícito (ano atual)
        expect(res[1].date).toBe(`${currentYear}-07-14`);
        expect(res[1].description).toBe('PIX RECEBIDO DE JOAO');
        expect(res[1].amount).toBe(200.00);
        expect(res[1].type).toBe('income');
        expect(res[1].category).toBe('Extrato PDF'); // fallback

        // Terceiro item: Despesa com ano de dois dígitos '26'
        expect(res[2].date).toBe('2026-07-15');
        expect(res[2].description).toBe('UBER VIAGEM');
        expect(res[2].amount).toBe(25.50);
        expect(res[2].type).toBe('expense');
        expect(res[2].category).toBe('Transporte');
    });
});

describe('calculateInvestmentYield', () => {
    const marketRates = { cdi: 10.5, selic: 10.75 };

    it('deve respeitar e usar valor atualizado manual se disponível', () => {
        const inv = {
            amount: 1000,
            manualCurrentValue: '1250.00',
            type: 'fixed',
            date: '2026-01-01'
        };
        const yieldData = calculateInvestmentYield(inv, new Date('2026-06-01T00:00:00'), marketRates);
        expect(yieldData.gross).toBe(1250);
        expect(yieldData.tax).toBe(56.25); // IR regressivo sobre o lucro manual (1250 - 1000) * 22.5%
        expect(yieldData.net).toBe(1193.75);
    });

    it('deve simular rendimento anual pré-fixado e calcular imposto de renda regressivo', () => {
        // Investimento de 1 ano (365 dias)
        // Taxa anual pré-fixada de 12%
        const inv = {
            amount: 1000,
            type: 'fixed',
            rateType: 'pre',
            rateValue: 12,
            date: '2026-01-01'
        };
        const targetDate = new Date('2027-01-01T00:00:00'); // 365 dias depois
        const yieldData = calculateInvestmentYield(inv, targetDate, marketRates);

        // Bruto esperado: 1000 * 1.12 = 1120.00
        expect(yieldData.gross).toBeCloseTo(1120.00, 2);

        // Lucro: 120.00
        // Para 365 dias, a alíquota é 17.5% (faixa de 361 a 720 dias)
        // Imposto: 120.00 * 0.175 = 21.00
        expect(yieldData.tax).toBeCloseTo(21.00, 2);

        // Líquido esperado: 1120.00 - 21.00 = 1099.00
        expect(yieldData.net).toBeCloseTo(1099.00, 2);
    });

    it('deve aplicar alíquotas de imposto corretas dependendo do prazo', () => {
        const testTaxBracket = (days, expectedRate) => {
            const inv = {
                amount: 1000,
                type: 'fixed',
                rateType: 'pre',
                rateValue: 10,
                date: '2026-01-01'
            };
            const targetDate = new Date(new Date('2026-01-01T00:00:00').getTime() + (days * 24 * 60 * 60 * 1000));
            const yieldData = calculateInvestmentYield(inv, targetDate, marketRates);
            const profit = yieldData.gross - inv.amount;
            expect(yieldData.tax / profit).toBeCloseTo(expectedRate, 4);
        };

        testTaxBracket(180, 0.225); // Até 180 dias: 22.5%
        testTaxBracket(360, 0.20);  // De 181 a 360 dias: 20%
        testTaxBracket(720, 0.175); // De 361 a 720 dias: 17.5%
        testTaxBracket(730, 0.15);  // Acima de 720 dias: 15%
    });
});

describe('calculateCardInvoice', () => {
    const cards = [
        { id: 'card-1', nickname: 'Inter', bank: 'Banco Inter' },
        { id: 'card-2', nickname: 'Nubank', bank: 'Nubank' }
    ];

    const currentYear = new Date().getFullYear();
    const currentMonthNum = new Date().getMonth();
    const currentMonthStr = String(currentMonthNum + 1).padStart(2, '0');
    const currentMonthPrefix = `${currentYear}-${currentMonthStr}`;

    it('deve calcular a fatura somando apenas despesas do cartão no mês atual', () => {
        const transactions = [
            // Despesa no Inter (mês atual)
            { paymentMethod: 'card-1', type: 'expense', amount: 120.00, date: `${currentMonthPrefix}-05` },
            { paymentMethod: 'card-1', type: 'expense', amount: 80.00, date: `${currentMonthPrefix}-10` },
            // Despesa no Nubank (mês atual)
            { paymentMethod: 'card-2', type: 'expense', amount: 50.00, date: `${currentMonthPrefix}-12` },
            // Receita no Inter (deve ser ignorada no cálculo da fatura)
            { paymentMethod: 'card-1', type: 'income', amount: 15.00, date: `${currentMonthPrefix}-06` },
            // Despesa no Inter (mês anterior, deve ser ignorada)
            { paymentMethod: 'card-1', type: 'expense', amount: 300.00, date: '2025-01-01' }
        ];

        const mockFormat = val => `R$ ${val.toFixed(2)}`;
        const result = calculateCardInvoice(cards, transactions, mockFormat);

        // Fatura total: 120.00 + 80.00 + 50.00 = 250.00
        expect(result.total).toBe(250.00);

        // Detalhes agrupados e ordenados pelo maior total
        expect(result.cards).toHaveLength(2);
        expect(result.cards[0].name).toBe('Inter');
        expect(result.cards[0].total).toBe(200.00);
        expect(result.cards[1].name).toBe('Nubank');
        expect(result.cards[1].total).toBe(50.00);

        // Descrição textual formatada
        expect(result.details).toBe('Inter: R$ 200.00 + 1 outro(s) cartão(es) (R$ 50.00)');
    });

    it('deve retornar mensagem apropriada se não houver gastos no cartão', () => {
        const result = calculateCardInvoice(cards, [], val => `R$ ${val}`);
        expect(result.total).toBe(0);
        expect(result.details).toBe('Nenhum gasto no cartão este mês');
    });
});

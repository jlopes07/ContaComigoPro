/**
 * @vitest-environment jsdom
 */
import { describe, it, expect, beforeEach } from 'vitest';
import { state } from '../src/state.js';
import { renderView, getInvoiceMonth } from '../src/views/cartoes/cartoes.js';

describe('Página Cartões de Crédito (cartoes.test.js)', () => {
    beforeEach(() => {
        document.body.innerHTML = `
            <div id="page-cartoes">
                <div id="cards-list"></div>
            </div>
        `;
        state.cardsList = [];
        state.transactions = [];
        state.expandedCardId = null;
    });

    it('deve calcular corretamente o mês da fatura com base no dia de fechamento', () => {
        // Fechamento dia 5 -> compra em 2026-07-06 pertence à fatura 2026-08
        const invoiceMonthAfterClosing = getInvoiceMonth('2026-07-06', 5);
        expect(invoiceMonthAfterClosing).toBe('2026-08');

        // Compra em 2026-07-04 pertence à fatura 2026-07
        const invoiceMonthBeforeClosing = getInvoiceMonth('2026-07-04', 5);
        expect(invoiceMonthBeforeClosing).toBe('2026-07');
    });

    it('deve renderizar a lista de cartões cadastrados', () => {
        state.cardsList = [
            { id: 'c1', nickname: 'Nubank Black', bank: 'Nubank', limit: 10000, closingDay: 5, dueDay: 12 }
        ];

        renderView();

        const grid = document.getElementById('cards-list');
        expect(grid.textContent).toContain('Nubank Black');
        expect(grid.textContent).toContain('10.000,00');
    });
});

/**
 * @vitest-environment jsdom
 */
import { describe, it, expect, beforeEach } from 'vitest';
import { state } from '../src/state.js';
import { renderView } from '../src/views/dashboard/dashboard.js';

describe('Página Dashboard (dashboard.test.js)', () => {
    beforeEach(() => {
        document.body.innerHTML = `
            <div id="page-dashboard" class="active">
                <span id="total-balance">R$ 0,00</span>
                <span id="total-card-invoice">R$ 0,00</span>
                <span id="card-invoice-detail"></span>
                <div id="transaction-list-recent"></div>
            </div>
        `;
        state.transactions = [];
        state.banksList = [];
        state.cardsList = [];
    });

    it('deve renderizar saldos e totais calculados corretamente', () => {
        state.banksList = [{ id: 'b1', name: 'Nubank', balance: 1000 }];
        state.transactions = [
            { id: 't1', type: 'income', amount: 500, description: 'Salário', date: '2026-07-20', paymentMethod: 'b1' },
            { id: 't2', type: 'expense', amount: 200, description: 'Mercado', date: '2026-07-21', paymentMethod: 'b1' }
        ];

        renderView();

        const balanceEl = document.getElementById('total-balance');
        const recentEl = document.getElementById('transaction-list-recent');

        expect(balanceEl.textContent).toContain('1.300,00');
        expect(recentEl.children.length).toBe(2);
    });
});

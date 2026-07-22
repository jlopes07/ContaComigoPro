/**
 * @vitest-environment jsdom
 */
import { describe, it, expect, beforeEach } from 'vitest';
import { state } from '../src/state.js';
import { renderView } from '../src/views/fixas/fixas.js';

describe('Página Transações Fixas (fixas.test.js)', () => {
    beforeEach(() => {
        document.body.innerHTML = `
            <div id="page-fixas">
                <div id="transaction-list-fixed"></div>
            </div>
        `;
        state.fixedTransactionsList = [];
        state.cardsList = [];
        state.transactions = [];
    });

    it('deve listar as transações fixas e faturas recorrentes de cartão', () => {
        state.fixedTransactionsList = [
            { id: 'f1', description: 'Assinatura Netflix', type: 'expense', amount: 55.90, category: 'Lazer', dayOfMonth: 10, isAutomatic: true }
        ];

        renderView();

        const container = document.getElementById('transaction-list-fixed');
        expect(container.textContent).toContain('Assinatura Netflix');
        expect(container.textContent).toContain('55,90');
    });
});

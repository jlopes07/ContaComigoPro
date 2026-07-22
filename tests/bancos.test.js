/**
 * @vitest-environment jsdom
 */
import { describe, it, expect, beforeEach } from 'vitest';
import { state } from '../src/state.js';
import { renderView } from '../src/views/bancos/bancos.js';

describe('Página Contas Bancárias (bancos.test.js)', () => {
    beforeEach(() => {
        document.body.innerHTML = `
            <div id="page-bancos">
                <div id="banks-list"></div>
            </div>
        `;
        state.banksList = [];
        state.transactions = [];
    });

    it('deve listar contas bancárias com saldo inicial + movimentações', () => {
        state.banksList = [
            { id: 'b1', name: 'Itaú Unibanco', balance: 2000, color: '#ff6200' }
        ];
        state.transactions = [
            { id: 't1', type: 'income', amount: 500, date: '2026-07-01', paymentMethod: 'b1' }
        ];

        renderView();

        const grid = document.getElementById('banks-list');
        expect(grid.textContent).toContain('Itaú Unibanco');
        expect(grid.textContent).toContain('2.500,00');
    });
});

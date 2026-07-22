/**
 * @vitest-environment jsdom
 */
import { describe, it, expect, beforeEach } from 'vitest';
import { state } from '../src/state.js';
import { renderView } from '../src/views/transacoes/transacoes.js';

describe('Página Transações (transacoes.test.js)', () => {
    beforeEach(() => {
        document.body.innerHTML = `
            <div id="page-transacoes">
                <input id="filter-search" value="" />
                <select id="filter-type"><option value="all">Todas</option></select>
                <select id="filter-category"><option value="all">Todas</option></select>
                <input id="filter-date-start" value="" />
                <input id="filter-date-end" value="" />
                <button id="btn-clear-filters"></button>
                
                <span id="filter-total-balance">R$ 0,00</span>
                <span id="filter-total-income">R$ 0,00</span>
                <span id="filter-total-expense">R$ 0,00</span>
                
                <div id="transaction-list-complete"></div>
            </div>
        `;
        state.transactions = [];
    });

    it('deve listar transações e filtrar busca por texto', () => {
        state.transactions = [
            { id: 't1', type: 'expense', amount: 50, description: 'Supermercado', date: '2026-07-20', category: 'Alimentação' },
            { id: 't2', type: 'income', amount: 300, description: 'Freelance JS', date: '2026-07-21', category: 'Trabalho' }
        ];

        renderView();

        const container = document.getElementById('transaction-list-complete');
        expect(container.children.length).toBe(2);

        // Aplica filtro de busca
        document.getElementById('filter-search').value = 'Supermercado';
        renderView();
        expect(container.children.length).toBe(1);
        expect(container.textContent).toContain('Supermercado');
    });
});

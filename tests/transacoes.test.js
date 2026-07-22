/**
 * @vitest-environment jsdom
 */
import { describe, it, expect, beforeEach } from 'vitest';
import { state } from '../src/state.js';
import { renderView, applyTransacoesFilters } from '../src/views/transacoes/transacoes.js';

describe('Página Transações (transacoes.test.js)', () => {
    beforeEach(() => {
        document.body.innerHTML = `
            <div id="page-transacoes" class="active">
                <input id="filter-search" value="" />
                <select id="filter-type"><option value="all">Todas</option></select>
                <select id="filter-category"><option value="all">Todas</option></select>
                <input id="filter-date-start" value="" />
                <input id="filter-date-end" value="" />
                <button id="btn-clear-filters"></button>

                <button id="btn-filter-pm"><span id="label-filter-pm"></span></button>
                <div id="dropdown-filter-pm"></div>
                
                <span id="filtered-balance">R$ 0,00</span>
                
                <div id="transaction-list-complete"></div>

                <button id="btn-prev-page"></button>
                <span id="pagination-info"></span>
                <button id="btn-next-page"></button>
            </div>
        `;
        state.transactions = [];
        state.banksList = [];
        state.cardsList = [];
    });

    it('deve limitar a exibição a 25 transações por página', () => {
        // Cria 30 transações de teste
        const dummyTxs = [];
        for (let i = 1; i <= 30; i++) {
            dummyTxs.push({
                id: `t${i}`,
                type: 'expense',
                amount: 10 * i,
                description: `Item ${i}`,
                date: '2026-07-01',
                category: 'Outros'
            });
        }
        state.transactions = dummyTxs;

        renderView();

        const container = document.getElementById('transaction-list-complete');
        const pageInfo = document.getElementById('pagination-info');

        // Deve renderizar exatamente 25 itens na página 1
        expect(container.children.length).toBe(25);
        expect(pageInfo.textContent).toContain('Página 1 de 2');
    });

    it('deve filtrar transações por termo de busca', () => {
        state.transactions = [
            { id: 't1', type: 'expense', amount: 50, description: 'Supermercado', date: '2026-07-20', category: 'Alimentação' },
            { id: 't2', type: 'income', amount: 300, description: 'Freelance JS', date: '2026-07-21', category: 'Trabalho' }
        ];

        renderView();

        const container = document.getElementById('transaction-list-complete');
        expect(container.children.length).toBe(2);

        document.getElementById('filter-search').value = 'Supermercado';
        applyTransacoesFilters();

        expect(container.children.length).toBe(1);
        expect(container.textContent).toContain('Supermercado');
    });
});

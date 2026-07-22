/**
 * @vitest-environment jsdom
 */
import { describe, it, expect, beforeEach } from 'vitest';
import { state } from '../src/state.js';
import { renderView } from '../src/views/investimentos/investimentos.js';

describe('Página Investimentos (investimentos.test.js)', () => {
    beforeEach(() => {
        document.body.innerHTML = `
            <div id="page-investimentos" class="active">
                <span id="total-investments">R$ 0,00</span>
                <span id="total-investments-yield">R$ 0,00</span>
                <div id="investments-list"></div>
            </div>
        `;
        state.investmentsList = [];
    });

    it('deve calcular patrimônio investido e rentabilidade', () => {
        state.investmentsList = [
            { id: 'i1', name: 'Tesouro Selic', amount: 1000, date: '2026-01-01', type: 'fixed', rateType: 'selic', rateValue: 100 }
        ];

        renderView();

        const totalApplied = document.getElementById('total-investments');
        const grid = document.getElementById('investments-list');

        expect(totalApplied.textContent).toContain('1.000,00');
        expect(grid.textContent).toContain('Tesouro Selic');
    });
});

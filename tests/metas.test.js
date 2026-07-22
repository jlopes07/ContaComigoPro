/**
 * @vitest-environment jsdom
 */
import { describe, it, expect, beforeEach } from 'vitest';
import { state } from '../src/state.js';
import { renderView } from '../src/views/metas/metas.js';

describe('Página Metas Financeiras (metas.test.js)', () => {
    beforeEach(() => {
        document.body.innerHTML = `
            <div id="page-metas">
                <div id="goals-list"></div>
            </div>
        `;
        state.goalsList = [];
    });

    it('deve calcular a porcentagem de progresso da meta corretamente', () => {
        state.goalsList = [
            { id: 'g1', name: 'Viagem Japão', targetValue: 10000, currentValue: 2500 }
        ];

        renderView();

        const grid = document.getElementById('goals-list');
        expect(grid.textContent).toContain('Viagem Japão');
        expect(grid.textContent).toContain('25%');
    });
});

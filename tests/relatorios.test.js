/**
 * @vitest-environment jsdom
 */
import { describe, it, expect, beforeEach } from 'vitest';
import { state } from '../src/state.js';
import { generateReport } from '../src/views/relatorios/relatorios.js';

describe('Página Relatórios (relatorios.test.js)', () => {
    beforeEach(() => {
        document.body.innerHTML = `
            <div id="page-relatorios" class="active">
                <select id="report-type">
                    <option value="monthly-summary" selected>Resumo Mensal</option>
                </select>
                <input id="report-month" value="2026-07" />
                <div id="report-preview-content"></div>
                <button id="btn-print-report" disabled></button>
                <button id="btn-export-csv" disabled></button>
            </div>
        `;
        state.transactions = [];
    });

    it('deve consolidar despesas e receitas do período nos relatórios', () => {
        state.transactions = [
            { id: 't1', type: 'income', amount: 3000, date: '2026-07-05', category: 'Salário' },
            { id: 't2', type: 'expense', amount: 1200, date: '2026-07-10', category: 'Aluguel' }
        ];

        generateReport();

        const container = document.getElementById('report-preview-content');

        expect(container.textContent).toContain('3.000,00');
        expect(container.textContent).toContain('1.200,00');
        expect(container.textContent).toContain('1.800,00');
    });
});

/**
 * @vitest-environment jsdom
 */
import { describe, it, expect, beforeEach, vi } from 'vitest';

vi.mock('../src/firebase.js', () => ({
    auth: { currentUser: { uid: 'user1' } },
    db: {
        batch: () => ({ set: vi.fn(), commit: vi.fn().mockResolvedValue() })
    },
    transactionsCollection: {},
    goalsCollection: {},
    categoriesCollection: {},
    cardsCollection: {},
    fixedTransactionsCollection: {},
    banksCollection: {},
    investmentsCollection: {
        doc: vi.fn().mockReturnValue({
            delete: vi.fn().mockResolvedValue(),
            update: vi.fn().mockResolvedValue()
        }),
        add: vi.fn().mockResolvedValue()
    }
}));

import { state } from '../src/state.js';
import { renderView } from '../src/views/investimentos/investimentos.js';
import { initModals } from '../src/modals.js';

describe('Página Investimentos (investimentos.test.js)', () => {
    beforeEach(() => {
        document.body.innerHTML = `
            <div id="page-investimentos" class="active">
                <button id="btn-new-investment">Novo Investimento</button>
                <span id="total-investments">R$ 0,00</span>
                <span id="total-investments-yield">R$ 0,00</span>
                <div id="investments-list"></div>
            </div>

            <!-- Modal Investimento -->
            <div class="modal-overlay" id="investment-modal">
                <div class="modal">
                    <h2>Novo Investimento</h2>
                    <form id="form-investment">
                        <input type="hidden" id="invest-id" value="" />
                        <input type="text" id="invest-name" value="" />
                        <input type="text" id="invest-institution" value="" />
                        <select id="invest-type"><option value="fixed">Renda Fixa</option></select>
                        <input type="date" id="invest-date" value="" />
                        <input type="number" id="invest-amount" value="" />
                        <input type="date" id="invest-due-date" value="" />
                        <select id="invest-rate-type"><option value="cdi">% do CDI</option></select>
                        <input type="number" id="invest-rate-value" value="" />
                        <div id="edit-investment-fields" style="display: none;">
                            <input type="number" id="invest-new-aporte" value="" />
                            <input type="number" id="invest-manual-value" value="" />
                        </div>
                    </form>
                </div>
            </div>
        `;
        state.investmentsList = [];
        initModals();
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

    it('deve abrir o modal em modo de edição ao chamar window.editInvestment', () => {
        state.investmentsList = [
            { id: 'i1', name: 'Tesouro Selic', institution: 'XP', amount: 1000, date: '2026-01-01', type: 'fixed', rateType: 'selic', rateValue: 100 }
        ];

        renderView();
        expect(typeof window.editInvestment).toBe('function');

        window.editInvestment('i1');

        const modal = document.getElementById('investment-modal');
        const modalTitle = document.querySelector('#investment-modal h2');
        const investId = document.getElementById('invest-id');
        const investName = document.getElementById('invest-name');
        const investInstitution = document.getElementById('invest-institution');

        expect(modal.classList.contains('active')).toBe(true);
        expect(modalTitle.textContent).toBe('Editar Investimento');
        expect(investId.value).toBe('i1');
        expect(investName.value).toBe('Tesouro Selic');
        expect(investInstitution.value).toBe('XP');
    });
});

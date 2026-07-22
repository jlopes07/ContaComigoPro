// TESTES OK
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
    categoriesCollection: {
        doc: vi.fn().mockReturnValue({
            delete: vi.fn().mockResolvedValue(),
            update: vi.fn().mockResolvedValue()
        }),
        add: vi.fn().mockResolvedValue()
    },
    cardsCollection: {},
    fixedTransactionsCollection: {},
    banksCollection: {},
    investmentsCollection: {}
}));

import { state } from '../src/state.js';
import { renderView } from '../src/views/categorias/categorias.js';
import { initModals } from '../src/modals.js';

describe('Página Categorias (categorias.test.js)', () => {
    beforeEach(() => {
        document.body.innerHTML = `
            <div id="page-categorias">
                <button id="btn-new-category">Nova Categoria</button>
                <div id="categories-list"></div>
            </div>

            <!-- Modal Categoria -->
            <div class="modal-overlay" id="category-modal">
                <div class="modal">
                    <h2 id="category-modal-title">Nova Categoria</h2>
                    <form id="form-category">
                        <input type="hidden" id="category-id" value="" />
                        <input type="text" id="category-name" value="" />
                        <div id="category-icons-grid"></div>
                        <input type="hidden" id="category-icon" value="" />
                        <button type="submit" id="btn-save-category">
                            <span id="category-submit-text">Salvar Categoria</span>
                        </button>
                    </form>
                </div>
            </div>
        `;
        state.categoriesList = [];
        initModals();
    });

    it('deve exibir as categorias cadastradas na tela de categorias personalizadas', () => {
        state.categoriesList = [
            { id: 'cat1', name: 'Alimentação', icon: 'fa-utensils' },
            { id: 'cat2', name: 'Transporte', icon: 'fa-car' }
        ];

        renderView();

        const grid = document.getElementById('categories-list');
        expect(grid.children.length).toBe(2);
        expect(grid.textContent).toContain('Alimentação');
        expect(grid.textContent).toContain('Transporte');
    });

    it('deve preparar o modal de nova categoria e limpar id de edição ao clicar no botão do topo Nova Categoria', () => {
        state.categoriesList = [
            { id: 'cat1', name: 'Alimentação', icon: 'fa-utensils' }
        ];

        // 1. Simula que o usuário estava editando a categoria cat1 antes
        window.editCategory('cat1');
        expect(document.getElementById('category-id').value).toBe('cat1');
        expect(document.getElementById('category-modal-title').textContent).toBe('Editar Categoria');

        // 2. Clica no botão de Nova Categoria do topo da página
        const btnNew = document.getElementById('btn-new-category');
        btnNew.click();

        // 3. Garante que o estado de edição foi limpo e voltou ao modo de criação
        const modal = document.getElementById('category-modal');
        const modalTitle = document.getElementById('category-modal-title');
        const categoryId = document.getElementById('category-id');
        const submitText = document.getElementById('category-submit-text');

        expect(modal.classList.contains('active')).toBe(true);
        expect(modalTitle.textContent).toBe('Nova Categoria');
        expect(categoryId.value).toBe('');
        expect(submitText.textContent).toBe('Salvar Categoria');
    });

    it('deve preparar o modal ao clicar no botão de editar categoria (ícone de lápis)', () => {
        state.categoriesList = [
            { id: 'cat1', name: 'Alimentação', icon: 'fa-utensils' }
        ];

        renderView();
        expect(typeof window.editCategory).toBe('function');

        window.editCategory('cat1');

        const modal = document.getElementById('category-modal');
        const modalTitle = document.getElementById('category-modal-title');
        const categoryId = document.getElementById('category-id');
        const categoryName = document.getElementById('category-name');
        const categoryIcon = document.getElementById('category-icon');
        const submitText = document.getElementById('category-submit-text');

        expect(modal.classList.contains('active')).toBe(true);
        expect(modalTitle.textContent).toBe('Editar Categoria');
        expect(categoryId.value).toBe('cat1');
        expect(categoryName.value).toBe('Alimentação');
        expect(categoryIcon.value).toBe('fa-utensils');
        expect(submitText.textContent).toBe('Atualizar Categoria');
    });

    it('deve chamar a exclusão de categoria ao invocar window.deleteCategory', async () => {
        window.confirm = vi.fn().mockReturnValue(true);
        state.categoriesList = [
            { id: 'cat1', name: 'Alimentação', icon: 'fa-utensils' }
        ];

        expect(typeof window.deleteCategory).toBe('function');
        await window.deleteCategory('cat1');
        expect(window.confirm).toHaveBeenCalled();
    });
});

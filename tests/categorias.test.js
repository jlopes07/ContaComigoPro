/**
 * @vitest-environment jsdom
 */
import { describe, it, expect, beforeEach } from 'vitest';
import { state } from '../src/state.js';
import { renderView } from '../src/views/categorias/categorias.js';

describe('Página Categorias (categorias.test.js)', () => {
    beforeEach(() => {
        document.body.innerHTML = `
            <div id="page-categorias">
                <div id="categories-list"></div>
            </div>
        `;
        state.categoriesList = [];
    });

    it('deve exibir a lista de categorias cadastradas', () => {
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
});

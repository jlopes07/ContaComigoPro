/**
 * @vitest-environment jsdom
 */
import { describe, it, expect, beforeEach } from 'vitest';
import { state } from '../src/state.js';
import { populatePersonalSettingsModal } from '../src/views/configuracoes/configuracoes.js';

describe('Página Configurações (configuracoes.test.js)', () => {
    beforeEach(() => {
        document.body.innerHTML = `
            <div id="page-configuracoes" class="active">
                <input id="settings-name" />
                <input id="settings-email" />
                <input id="settings-photo" />
                <img id="settings-avatar-preview" />
                <input id="settings-avatar-file" type="file" />
                <button id="btn-theme-toggle"></button>
            </div>
        `;
        state.currentUser = { uid: 'u123', displayName: 'Jéssica Lopes', email: 'jessica@test.com' };
    });

    it('deve preencher os campos do perfil com as informações do usuário atual', () => {
        populatePersonalSettingsModal();

        const nameInput = document.getElementById('settings-name');
        const emailInput = document.getElementById('settings-email');

        expect(nameInput.value).toBe('Jéssica Lopes');
        expect(emailInput.value).toBe('jessica@test.com');
    });
});

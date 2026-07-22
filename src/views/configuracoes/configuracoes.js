/**
 * =============================================================================
 * CONTA COMIGO PRO — configuracoes.js
 * Lógica da visão Ajustes / Configurações
 * =============================================================================
 */

import { state, subscribeState } from '../../state.js';

export function initView() {
    renderView();
    subscribeState(() => {
        if (document.getElementById('page-configuracoes')?.classList.contains('active')) {
            renderView();
        }
    });

    const themeToggle = document.getElementById('theme-toggle-settings');
    if (themeToggle) {
        themeToggle.addEventListener('click', () => {
            state.isDarkMode = !state.isDarkMode;
            localStorage.setItem('contaComigo_darkMode', state.isDarkMode);
            updateThemeUI();
        });
    }

    setupSettingsMenuListeners();
}

export function renderView() {
    updateThemeUI();
}

function updateThemeUI() {
    if (state.isDarkMode) {
        document.body.setAttribute('data-theme', 'dark');
    } else {
        document.body.removeAttribute('data-theme');
    }

    const circle = document.getElementById('theme-toggle-circle');
    const track = document.getElementById('theme-toggle-track');

    if (circle && track) {
        if (state.isDarkMode) {
            circle.style.transform = 'translateX(20px)';
            track.style.background = 'var(--primary)';
        } else {
            circle.style.transform = 'translateX(0)';
            track.style.background = 'var(--border)';
        }
    }
}

function setupSettingsMenuListeners() {
    const modalsMap = {
        'btn-menu-personal': 'modal-settings-personal',
        'btn-menu-security': 'modal-settings-security',
        'btn-menu-devices': 'modal-settings-devices',
        'btn-menu-notifications': 'modal-settings-notifications',
        'btn-menu-report': 'modal-settings-report',
        'btn-menu-close-account': 'modal-settings-close-account'
    };

    Object.keys(modalsMap).forEach(btnId => {
        const btn = document.getElementById(btnId);
        if (btn) {
            btn.addEventListener('click', () => {
                const targetModal = document.getElementById(modalsMap[btnId]);
                if (targetModal) targetModal.classList.add('active');
            });
        }
    });
}

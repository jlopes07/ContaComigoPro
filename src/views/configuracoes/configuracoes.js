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
    setupAvatarUploadHandler();
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
                if (btnId === 'btn-menu-personal') {
                    populatePersonalSettingsModal();
                }
                const targetModal = document.getElementById(modalsMap[btnId]);
                if (targetModal) targetModal.classList.add('active');
            });
        }
    });
}

export function populatePersonalSettingsModal() {
    if (!state.currentUser) return;
    const nameInput = document.getElementById('settings-name');
    const emailInput = document.getElementById('settings-email');
    const photoInput = document.getElementById('settings-photo');
    const previewImg = document.getElementById('settings-avatar-preview');

    const customAv = localStorage.getItem('contaComigo_customAvatar_' + state.currentUser.uid);
    const defaultAv = `https://ui-avatars.com/api/?name=${encodeURIComponent(state.currentUser.displayName || state.currentUser.email)}&background=6366f1&color=fff`;
    const photo = customAv || state.currentUser.photoURL || defaultAv;

    if (nameInput) nameInput.value = state.currentUser.displayName || '';
    if (emailInput) emailInput.value = state.currentUser.email || '';
    if (photoInput) photoInput.value = (customAv || state.currentUser.photoURL || '').startsWith('data:') ? '' : (state.currentUser.photoURL || '');
    if (previewImg) previewImg.src = photo;
}

function setupAvatarUploadHandler() {
    const fileInput = document.getElementById('settings-avatar-file');
    const urlInput = document.getElementById('settings-photo');
    const previewImg = document.getElementById('settings-avatar-preview');

    if (fileInput) {
        fileInput.addEventListener('change', async (e) => {
            const file = e.target.files[0];
            if (file) {
                try {
                    const compressedDataUrl = await compressImage(file, 120, 120, 0.6);
                    if (previewImg) previewImg.src = compressedDataUrl;
                    if (urlInput) urlInput.value = ''; // Limpa campo de URL para usar foto local

                    // Armazena temporariamente no dataset para o form submit
                    fileInput.dataset.compressedUrl = compressedDataUrl;
                } catch (err) {
                    alert("Erro ao processar imagem: " + err.message);
                }
            }
        });
    }

    if (urlInput) {
        urlInput.addEventListener('input', () => {
            const url = urlInput.value.trim();
            if (url && previewImg) {
                previewImg.src = url;
                if (fileInput) delete fileInput.dataset.compressedUrl;
            }
        });
    }
}

function compressImage(file, maxWidth = 120, maxHeight = 120, quality = 0.6) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = (e) => {
            const img = new Image();
            img.onload = () => {
                const canvas = document.createElement('canvas');
                let width = img.width;
                let height = img.height;

                if (width > height) {
                    if (width > maxWidth) {
                        height = Math.round((height * maxWidth) / width);
                        width = maxWidth;
                    }
                } else {
                    if (height > maxHeight) {
                        width = Math.round((width * maxHeight) / height);
                        height = maxHeight;
                    }
                }

                canvas.width = width;
                canvas.height = height;
                const ctx = canvas.getContext('2d');
                ctx.drawImage(img, 0, 0, width, height);
                const dataUrl = canvas.toDataURL('image/jpeg', quality);
                resolve(dataUrl);
            };
            img.onerror = () => reject(new Error("Erro ao carregar imagem no canvas"));
            img.src = e.target.result;
        };
        reader.onerror = () => reject(new Error("Erro ao ler arquivo"));
        reader.readAsDataURL(file);
    });
}

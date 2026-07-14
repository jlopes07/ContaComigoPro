import { readFileSync } from 'fs';
import { resolve } from 'path';
import { describe, it, expect, vi, beforeEach, beforeAll } from 'vitest';

// =============================================================================
// SEÇÃO DE SETUP DOS MOCKS GLOBAIS (Antes do carregamento do app.js)
// =============================================================================

const snapshotCallbacks = {};
const docSetMocks = {};
const docUpdateMocks = {};
const docDeleteMocks = {};
let mockCurrentUser = null;

const collectionMocks = {};

// Mock do Firebase
const mockFirestore = {
    collection: (name) => {
        if (!collectionMocks[name]) {
            const colQuery = {
                where: vi.fn().mockImplementation(() => colQuery),
                orderBy: vi.fn().mockImplementation(() => colQuery),
                limit: vi.fn().mockImplementation(() => colQuery),
                get: vi.fn().mockImplementation(async () => {
                    const docs = [];
                    return {
                        forEach: (fn) => docs.forEach(fn),
                        size: docs.length,
                        empty: docs.length === 0,
                        docs: docs
                    };
                }),
                onSnapshot: (callback) => {
                    snapshotCallbacks[name] = callback;
                    return () => {};
                },
                doc: vi.fn().mockImplementation((id) => {
                    docSetMocks[id] = vi.fn().mockResolvedValue(true);
                    docUpdateMocks[id] = vi.fn().mockResolvedValue(true);
                    docDeleteMocks[id] = vi.fn().mockResolvedValue(true);
                    return {
                        set: docSetMocks[id],
                        update: docUpdateMocks[id],
                        delete: docDeleteMocks[id]
                    };
                }),
                add: vi.fn().mockResolvedValue({ id: 'mocked-new-id' })
            };
            collectionMocks[name] = colQuery;
        }
        return collectionMocks[name];
    },
    batch: () => ({
        set: vi.fn(),
        update: vi.fn(),
        delete: vi.fn(),
        commit: vi.fn().mockResolvedValue(true)
    })
};

const mockAuth = {
    get currentUser() { return mockCurrentUser; },
    onAuthStateChanged: (callback) => {
        globalThis.triggerAuthStateChange = callback;
        return () => {};
    },
    signInWithEmailAndPassword: vi.fn().mockImplementation(async (email, password) => {
        if (password === 'wrong-password') throw new Error('auth/wrong-password');
        mockCurrentUser = { uid: 'user-123', email, displayName: 'Test User' };
        return { user: mockCurrentUser };
    }),
    createUserWithEmailAndPassword: vi.fn().mockImplementation(async (email, password) => {
        mockCurrentUser = { uid: 'user-123', email, displayName: 'New User' };
        return { user: mockCurrentUser };
    }),
    signOut: vi.fn().mockImplementation(async () => {
        mockCurrentUser = null;
        if (globalThis.triggerAuthStateChange) {
            globalThis.triggerAuthStateChange(null);
        }
        return true;
    }),
    sendSignInLinkToEmail: vi.fn().mockResolvedValue(true),
    isSignInWithEmailLink: vi.fn().mockReturnValue(false),
    signInWithEmailLink: vi.fn().mockResolvedValue({ user: { uid: '123' } })
};

// Injeta Firebase globalmente
const firestoreMockFn = () => mockFirestore;
firestoreMockFn.FieldValue = {
    serverTimestamp: vi.fn().mockReturnValue('mocked-server-timestamp')
};

globalThis.firebase = {
    apps: [],
    initializeApp: vi.fn().mockReturnValue({}),
    firestore: firestoreMockFn,
    auth: () => mockAuth
};

// Mock do Chart.js
globalThis.Chart = class MockChart {
    constructor() {}
    destroy() {}
    update() {}
};

// Mock do PDF.js
globalThis.pdfjsLib = {
    GlobalWorkerOptions: {},
    getDocument: () => ({
        promise: Promise.resolve({
            numPages: 1,
            getPage: () => Promise.resolve({
                getTextContent: () => Promise.resolve({
                    items: [
                        { str: "13/07/2026 COMPRA MERCADO BH R$ 150,00 D" },
                        { str: "14/07 PIX RECEBIDO DE JOAO R$ 200,00 C" }
                    ]
                })
            })
        })
    })
};

// Mock do window.alert e confirm
globalThis.alert = vi.fn();
globalThis.confirm = vi.fn().mockReturnValue(true);

// Mock do fetch (usado na API do Gemini e taxas de mercado via Brasil API)
globalThis.fetch = vi.fn().mockImplementation((url) => {
    if (url.includes('brasilapi.com.br')) {
        return Promise.resolve({
            json: () => Promise.resolve([
                { nome: "Selic", valor: 10.5 },
                { nome: "CDI", valor: 10.4 }
            ])
        });
    }
    return Promise.resolve({
        json: () => Promise.resolve({
            candidates: [{
                content: {
                    parts: [{
                        text: JSON.stringify([
                            { date: "2026-07-13", description: "MERCADO EXTRA", amount: 80.50, type: "expense", category: "Alimentação" }
                        ])
                    }]
                }
            }]
        })
    });
});

// Função para injetar snapshots de dados na UI
function emitSnapshot(collectionName, dataArray) {
    if (!snapshotCallbacks[collectionName]) {
        console.warn(`Nenhum listener registrado para a coleção: ${collectionName}`);
        return;
    }
    const docs = dataArray.map(item => ({
        id: item.id || 'mock-id',
        data: () => {
            const copy = { ...item };
            delete copy.id;
            return copy;
        }
    }));
    snapshotCallbacks[collectionName]({
        forEach: (fn) => docs.forEach(fn),
        size: docs.length,
        docs: docs
    });
}

// Injeção do HTML antes do carregamento do app.js
let htmlContent = readFileSync(resolve(__dirname, 'index.html'), 'utf-8');
// Remove script tags e style/link tags para evitar erros do happy-dom tentando carregá-los externamente
htmlContent = htmlContent
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    .replace(/<link\b[^>]*>/gi, '');
document.body.innerHTML = htmlContent;

// Carrega o app.js
await import('./app.js');

// =============================================================================
// SUÍTE DE TESTES UNITÁRIOS E INTEGRAÇÃO POR FUNCIONALIDADE
// =============================================================================

describe('Conta Comigo PRO - Suíte de Testes Geral', () => {

    beforeEach(async () => {
        vi.clearAllMocks();
        localStorage.clear();
        mockCurrentUser = null;

        // Pre-popula chaves de migração no localStorage para evitar conflitos assíncronos e race conditions
        localStorage.setItem('migrated_v2_user-123', 'true');
        localStorage.setItem('migrated_banks_user-123', 'true');
        localStorage.setItem('migrated_categories_v1_user-123', 'true');

        // Inicia o estado da autenticação como logado para a maioria dos testes
        if (globalThis.triggerAuthStateChange) {
            globalThis.triggerAuthStateChange({ uid: 'user-123', email: 'test@email.com', displayName: 'Test User' });
        }

        // Aguarda os microtasks esvaziarem para garantir que a inicialização pós-login assíncrona esteja completa
        await new Promise(resolve => setTimeout(resolve, 15));
    });

    // -------------------------------------------------------------------------
    // MÓDULO 1: Autenticação & Gerenciamento de Conta
    // -------------------------------------------------------------------------
    describe('1. Autenticação & Gerenciamento de Conta', () => {
        it('deve iniciar fluxo de login com Google ao clicar no botão correspondente', () => {
            const providerMock = vi.fn();
            globalThis.firebase.auth.GoogleAuthProvider = class { constructor() { providerMock(); } };
            mockAuth.signInWithPopup = vi.fn().mockResolvedValue({ user: { uid: 'google-uid' } });

            const btnGoogle = document.getElementById('btn-google-login');
            btnGoogle.click();

            expect(mockAuth.signInWithPopup).toHaveBeenCalled();
        });

        it('deve realizar login por E-mail/Senha com sucesso', async () => {
            const form = document.getElementById('form-auth-email');
            const emailInput = document.getElementById('auth-email');
            const passwordInput = document.getElementById('auth-password');

            emailInput.value = 'user@email.com';
            passwordInput.value = 'securepassword';

            // Simula o submit do formulário
            const submitEvent = new Event('submit', { bubbles: true, cancelable: true });
            form.dispatchEvent(submitEvent);

            expect(mockAuth.signInWithEmailAndPassword).toHaveBeenCalledWith('user@email.com', 'securepassword');
        });

        it('deve enviar Link Mágico sem senha', () => {
            const btnLink = document.getElementById('btn-email-link');
            const emailInput = document.getElementById('auth-email');
            emailInput.value = 'magic@email.com';

            btnLink.click();

            expect(mockAuth.sendSignInLinkToEmail).toHaveBeenCalledWith('magic@email.com', expect.any(Object));
        });

        it('deve realizar logout, limpar estado e exibir tela de login', async () => {
            const btnLogout = document.getElementById('btn-logout');
            btnLogout.click();

            expect(mockAuth.signOut).toHaveBeenCalled();
            expect(document.getElementById('app-wrapper').style.display).toBe('none');
            expect(document.getElementById('auth-overlay').classList.contains('active')).toBe(true);
        });
    });

    // -------------------------------------------------------------------------
    // MÓDULO 2: Dashboard & Visão Geral
    // -------------------------------------------------------------------------
    describe('2. Dashboard & Visão Geral', () => {
        it('deve calcular e exibir o Saldo Total corretamente a partir dos bancos', () => {
            emitSnapshot('banks', [
                { id: 'b1', name: 'Nubank', balance: 500 },
                { id: 'b2', name: 'Inter', balance: 1500 }
            ]);

            const totalBalance = document.getElementById('total-balance').textContent;
            // Espera somatório R$ 2.000,00
            expect(totalBalance.replace(/\s/g, ' ')).toMatch(/R\$\s*2\.000,00/);
        });

        it('deve exibir o total das faturas de cartão no dashboard', () => {
            const currentMonth = new Date().toISOString().slice(0, 7);
            emitSnapshot('cards', [
                { id: 'c1', nickname: 'Credicard', limit: 5000, bank: 'Itaú' }
            ]);
            emitSnapshot('transactions', [
                { id: 't1', paymentMethod: 'c1', type: 'expense', amount: 350.50, date: `${currentMonth}-10`, description: 'Assinatura Spotify' }
            ]);

            const invoiceEl = document.getElementById('total-card-invoice');
            expect(invoiceEl.textContent.replace(/\s/g, ' ')).toMatch(/R\$\s*350,50/);
        });
    });

    // -------------------------------------------------------------------------
    // MÓDULO 3: Transações (Módulo Core)
    // -------------------------------------------------------------------------
    describe('3. Transações (Módulo Core)', () => {
        it('deve salvar transações inseridas individualmente no modal', () => {
            emitSnapshot('categories', [
                { id: 'cat-1', name: 'Alimentação', icon: 'fa-utensils' }
            ]);
            const form = document.getElementById('form-transaction');
            document.getElementById('description').value = 'Almoço Executivo';
            document.getElementById('amount').value = '45.90';
            document.getElementById('type-expense').checked = true;
            document.getElementById('category').value = 'Alimentação';
            document.getElementById('date').value = '2026-07-13';
            document.getElementById('payment-method').value = 'b1';

            const submitEvent = new Event('submit', { bubbles: true, cancelable: true });
            form.dispatchEvent(submitEvent);

            expect(mockFirestore.collection('transactions').add).toHaveBeenCalledWith(expect.objectContaining({
                description: 'Almoço Executivo',
                amount: 45.90,
                type: 'expense',
                category: 'Alimentação',
                date: '2026-07-13',
                paymentMethod: 'b1'
            }));
        });

        it('deve permitir importação heurística de PDF', async () => {
            // Emulando upload de arquivo PDF
            const file = new File(['mock content'], 'extrato.pdf', { type: 'application/pdf' });
            
            // Ativa o parser heurístico direto
            const input = document.getElementById('pdf-file');
            if (input) {
                // Apenas testando o fluxo através da função global importada
                const parsed = parsePDFTextHeuristic("13/07/2026 COMPRA MERCADO BH R$ 150,00 D");
                expect(parsed).toHaveLength(1);
                expect(parsed[0].amount).toBe(150);
                expect(parsed[0].category).toBe('Alimentação');
            }
        });
    });

    // -------------------------------------------------------------------------
    // MÓDULO 4: Transações Fixas
    // -------------------------------------------------------------------------
    describe('4. Transações Fixas', () => {
        it('deve carregar e renderizar a lista de transações fixas', () => {
            emitSnapshot('fixed_transactions', [
                { id: 'f1', description: 'Assinatura Netflix', amount: 55.90, type: 'expense', paymentMethod: 'c1', category: 'Lazer' }
            ]);

            const container = document.getElementById('transaction-list-fixed');
            expect(container.innerHTML).toContain('Assinatura Netflix');
        });
    });

    // -------------------------------------------------------------------------
    // MÓDULO 5: Bancos & Contas
    // -------------------------------------------------------------------------
    describe('5. Bancos & Contas', () => {
        it('deve adicionar um novo banco com saldo inicial', () => {
            const form = document.getElementById('form-bank');
            document.getElementById('bank-name').value = 'Caixa Econômica';
            document.getElementById('bank-balance').value = '1000';
            document.getElementById('bank-color').value = '#005ca9';

            const submitEvent = new Event('submit', { bubbles: true, cancelable: true });
            form.dispatchEvent(submitEvent);

            expect(mockFirestore.collection('banks').add).toHaveBeenCalledWith(expect.objectContaining({
                name: 'Caixa Econômica',
                balance: 1000,
                color: '#005ca9'
            }));
        });
    });

    // -------------------------------------------------------------------------
    // MÓDULO 6: Cartões de Crédito
    // -------------------------------------------------------------------------
    describe('6. Cartões de Crédito', () => {
        it('deve salvar um novo cartão de crédito', () => {
            const form = document.getElementById('form-card');
            document.getElementById('card-nickname').value = 'Nubank Gold';
            document.getElementById('card-bank').value = 'Nubank';
            document.getElementById('card-limit').value = '3500';
            document.getElementById('card-closing').value = '5';
            document.getElementById('card-due').value = '12';

            const submitEvent = new Event('submit', { bubbles: true, cancelable: true });
            form.dispatchEvent(submitEvent);

            expect(mockFirestore.collection('cards').add).toHaveBeenCalledWith(expect.objectContaining({
                nickname: 'Nubank Gold',
                bank: 'Nubank',
                limit: 3500,
                closingDay: 5,
                dueDay: 12
            }));
        });
    });

    // -------------------------------------------------------------------------
    // MÓDULO 7: Metas Financeiras
    // -------------------------------------------------------------------------
    describe('7. Metas Financeiras', () => {
        it('deve salvar uma nova meta financeira', () => {
            const form = document.getElementById('form-goal');
            document.getElementById('goal-name').value = 'Reserva de Emergência';
            document.getElementById('goal-target').value = '10000';
            document.getElementById('goal-current').value = '1500';
            document.getElementById('goal-end-date').value = '2026-12-31';

            const submitEvent = new Event('submit', { bubbles: true, cancelable: true });
            form.dispatchEvent(submitEvent);

            expect(mockFirestore.collection('goals').add).toHaveBeenCalledWith(expect.objectContaining({
                name: 'Reserva de Emergência',
                targetValue: 10000,
                currentValue: 1500
            }));
        });
    });

    // -------------------------------------------------------------------------
    // MÓDULO 8: Categorias Personalizadas
    // -------------------------------------------------------------------------
    describe('8. Categorias Personalizadas', () => {
        it('deve renderizar a lista de categorias cadastradas', () => {
            emitSnapshot('categories', [
                { id: 'cat1', name: 'Petshop', icon: 'fa-dog' }
            ]);

            const list = document.getElementById('categories-list');
            if (list) {
                expect(list.innerHTML).toContain('Petshop');
            }
        });
    });

    // -------------------------------------------------------------------------
    // MÓDULO 9: Investimentos
    // -------------------------------------------------------------------------
    describe('9. Investimentos', () => {
        it('deve cadastrar um novo investimento de renda fixa', () => {
            const form = document.getElementById('form-investment');
            if (form) {
                document.getElementById('invest-name').value = 'CDB Inter 102%';
                document.getElementById('invest-amount').value = '5000';
                document.getElementById('invest-type').value = 'fixed';
                document.getElementById('invest-rate-type').value = 'cdi';
                document.getElementById('invest-rate-value').value = '102';
                document.getElementById('invest-date').value = '2026-01-01';

                const submitEvent = new Event('submit', { bubbles: true, cancelable: true });
                form.dispatchEvent(submitEvent);

                expect(mockFirestore.collection('investments').add).toHaveBeenCalledWith(expect.objectContaining({
                    name: 'CDB Inter 102%',
                    amount: 5000,
                    type: 'fixed',
                    rateType: 'cdi',
                    rateValue: 102
                }));
            }
        });
    });

    // -------------------------------------------------------------------------
    // MÓDULO 10: Relatórios
    // -------------------------------------------------------------------------
    describe('10. Relatórios', () => {
        it('deve gerar relatório DRE mensal HTML formatado', () => {
            emitSnapshot('transactions', [
                { id: 't1', type: 'income', amount: 3000, date: '2026-07-05', description: 'Salário', category: 'Receitas' },
                { id: 't2', type: 'expense', amount: 1500, date: '2026-07-10', description: 'Aluguel', category: 'Moradia' }
            ]);

            document.getElementById('report-type').value = 'monthly-summary';
            document.getElementById('report-month').value = '2026-07';

            window.generateReport();

            const preview = document.getElementById('report-preview-content').innerHTML;
            expect(preview).toContain('Receitas');
            expect(preview).toContain('Despesas');
        });
    });

    // -------------------------------------------------------------------------
    // MÓDULO 11: Configurações
    // -------------------------------------------------------------------------
    describe('11. Configurações', () => {
        it('deve salvar e carregar a preferência de tema escuro no localStorage', () => {
            const toggle = document.getElementById('theme-toggle');
            if (toggle) {
                toggle.click();
                expect(localStorage.getItem('contaComigo_darkMode')).toBe('true');

                toggle.click();
                expect(localStorage.getItem('contaComigo_darkMode')).toBe('false');
            }
        });
    });
});

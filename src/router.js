/**
 * =============================================================================
 * CONTA COMIGO PRO — router.js
 * Gerenciador de rotas e carregador de Views (Code Splitting e Raw HTML Imports)
 * =============================================================================
 */

// Importa todos os templates HTML das visões como strings brutas (embutidas na compilação do Vite)
const htmlTemplates = import.meta.glob('./views/**/*.html', { query: '?raw', import: 'default', eager: true });

const viewsMap = {
    'page-dashboard': {
        title: 'Visão Geral',
        templateKey: './views/dashboard/dashboard.html',
        importModule: () => import('./views/dashboard/dashboard.js')
    },
    'page-transacoes': {
        title: 'Histórico Completo',
        templateKey: './views/transacoes/transacoes.html',
        importModule: () => import('./views/transacoes/transacoes.js')
    },
    'page-fixas': {
        title: 'Transações Fixas',
        templateKey: './views/fixas/fixas.html',
        importModule: () => import('./views/fixas/fixas.js')
    },
    'page-bancos': {
        title: 'Bancos & Contas',
        templateKey: './views/bancos/bancos.html',
        importModule: () => import('./views/bancos/bancos.js')
    },
    'page-cartoes': {
        title: 'Meus Cartões',
        templateKey: './views/cartoes/cartoes.html',
        importModule: () => import('./views/cartoes/cartoes.js')
    },
    'page-metas': {
        title: 'Minhas Metas',
        templateKey: './views/metas/metas.html',
        importModule: () => import('./views/metas/metas.js')
    },
    'page-categorias': {
        title: 'Categorias Personalizadas',
        templateKey: './views/categorias/categorias.html',
        importModule: () => import('./views/categorias/categorias.js')
    },
    'page-investimentos': {
        title: 'Meus Investimentos',
        templateKey: './views/investimentos/investimentos.html',
        importModule: () => import('./views/investimentos/investimentos.js')
    },
    'page-relatorios': {
        title: 'Relatórios & Gráficos',
        templateKey: './views/relatorios/relatorios.html',
        importModule: () => import('./views/relatorios/relatorios.js')
    },
    'page-configuracoes': {
        title: 'Gerenciar Conta',
        templateKey: './views/configuracoes/configuracoes.html',
        importModule: () => import('./views/configuracoes/configuracoes.js')
    }
};

const loadedModules = {};
let currentPageId = null;

export async function navigateTo(targetPageId) {
    if (!viewsMap[targetPageId]) targetPageId = 'page-dashboard';

    const container = document.getElementById('pages-container');
    if (!container) return;

    // Atualiza título do cabeçalho
    const pageTitleEl = document.getElementById('page-title');
    if (pageTitleEl) pageTitleEl.textContent = viewsMap[targetPageId].title;

    // Atualiza menu da sidebar
    document.querySelectorAll('#nav-menu li').forEach(li => {
        const link = li.querySelector('a');
        if (link && link.dataset.page === targetPageId) {
            li.classList.add('active');
        } else {
            li.classList.remove('active');
        }
    });

    // Controla visibilidade dos botões de ação do topo
    updateHeaderActionsVisibility(targetPageId);

    // Se o HTML da tela ainda não está inserido no DOM, obtém do mapa de templates
    let pageEl = document.getElementById(targetPageId);
    if (!pageEl) {
        try {
            const htmlContent = htmlTemplates[viewsMap[targetPageId].templateKey];
            if (!htmlContent) throw new Error(`Template não encontrado para ${targetPageId}`);

            const tempDiv = document.createElement('div');
            tempDiv.innerHTML = htmlContent.trim();
            pageEl = tempDiv.firstElementChild;
            container.appendChild(pageEl);
        } catch (err) {
            console.error('Erro ao inserir HTML da visão:', err);
            return;
        }
    }

    // Oculta todas as páginas e mostra apenas a ativa
    document.querySelectorAll('.page-section').forEach(sec => sec.classList.remove('active'));
    pageEl.classList.add('active');
    currentPageId = targetPageId;

    // Carrega dinamicamente o módulo JS se ainda não foi carregado
    try {
        if (!loadedModules[targetPageId]) {
            const mod = await viewsMap[targetPageId].importModule();
            loadedModules[targetPageId] = mod;
            if (mod.initView) mod.initView();
        } else if (loadedModules[targetPageId].renderView) {
            loadedModules[targetPageId].renderView();
        }
    } catch (err) {
        console.error(`Erro ao inicializar módulo de ${targetPageId}:`, err);
    }
}

function updateHeaderActionsVisibility(targetPageId) {
    const noNewTx = ['page-metas', 'page-configuracoes', 'page-fixas', 'page-categorias', 'page-investimentos', 'page-relatorios'];
    const btnNewTx = document.getElementById('btn-new-transaction');
    if (btnNewTx) btnNewTx.style.display = noNewTx.includes(targetPageId) ? 'none' : 'flex';

    const btnNewTransfer = document.getElementById('btn-new-transfer');
    if (btnNewTransfer) {
        btnNewTransfer.style.display = ['page-dashboard', 'page-bancos', 'page-transacoes'].includes(targetPageId) ? 'flex' : 'none';
    }

    const btnNewGoal = document.getElementById('btn-new-goal');
    if (btnNewGoal) btnNewGoal.style.display = (targetPageId === 'page-metas') ? 'flex' : 'none';

    const btnNewFixed = document.getElementById('btn-new-fixed-transaction');
    if (btnNewFixed) btnNewFixed.style.display = (targetPageId === 'page-fixas') ? 'flex' : 'none';

    const btnNewCard = document.getElementById('btn-new-card');
    if (btnNewCard) btnNewCard.style.display = (targetPageId === 'page-cartoes') ? 'flex' : 'none';

    const btnNewCategory = document.getElementById('btn-new-category');
    if (btnNewCategory) btnNewCategory.style.display = (targetPageId === 'page-categorias') ? 'flex' : 'none';

    const btnNewBank = document.getElementById('btn-new-bank');
    if (btnNewBank) btnNewBank.style.display = (targetPageId === 'page-bancos') ? 'flex' : 'none';

    const btnNewInvestment = document.getElementById('btn-new-investment');
    if (btnNewInvestment) btnNewInvestment.style.display = (targetPageId === 'page-investimentos') ? 'flex' : 'none';
}

export function getCurrentPageId() {
    return currentPageId;
}

export function getLoadedModule(pageId) {
    return loadedModules[pageId];
}

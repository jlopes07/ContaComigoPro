(function(){const t=document.createElement("link").relList;if(t&&t.supports&&t.supports("modulepreload"))return;for(const i of document.querySelectorAll('link[rel="modulepreload"]'))r(i);new MutationObserver(i=>{for(const a of i)if(a.type==="childList")for(const o of a.addedNodes)o.tagName==="LINK"&&o.rel==="modulepreload"&&r(o)}).observe(document,{childList:!0,subtree:!0});function n(i){const a={};return i.integrity&&(a.integrity=i.integrity),i.referrerPolicy&&(a.referrerPolicy=i.referrerPolicy),i.crossOrigin==="use-credentials"?a.credentials="include":i.crossOrigin==="anonymous"?a.credentials="omit":a.credentials="same-origin",a}function r(i){if(i.ep)return;i.ep=!0;const a=n(i);fetch(i.href,a)}})();const X={apiKey:"AIzaSyBFmPf_MY9qfxbAbazYa_pFruoaAhjiago",authDomain:"contacomigopro.firebaseapp.com",projectId:"contacomigopro",storageBucket:"contacomigopro.firebasestorage.app",messagingSenderId:"396497996638",appId:"1:396497996638:web:ea0417c96ab7b96de29dcf",measurementId:"G-4T964VEF2N"};firebase.apps.length||firebase.initializeApp(X);const v=firebase.firestore(),x=firebase.auth(),k=v.collection("transactions"),A=v.collection("goals"),T=v.collection("categories"),M=v.collection("cards"),Z=v.collection("fixed_transactions"),R=v.collection("banks"),H=v.collection("investments"),s={currentUser:null,transactions:[],goalsList:[],fixedTransactionsList:[],cardsList:[],categoriesList:[],banksList:[],investmentsList:[],unsTx:null,unsGoals:null,unsCategories:null,unsFixed:null,unsCards:null,unsBanks:null,unsInvestments:null,isDarkMode:localStorage.getItem("contaComigo_darkMode")==="true",currentCardFilter:{id:null,search:"",startDate:"",endDate:"",month:""},currentBankFilter:{id:null,startDate:"",endDate:""},editingTransactionId:null,editingGroupId:null,editingFixedId:null,launchingFixedId:null,launchingCardId:null,editingCardId:null,expandedCardId:null,listeners:new Set};function Le(e){return s.listeners.add(e),()=>s.listeners.delete(e)}function u(e){s.listeners.forEach(t=>{try{t(e)}catch(n){console.error("Erro no listener de estado:",n)}})}const ee="modulepreload",te=function(e){return"/"+e},U={},g=function(t,n,r){let i=Promise.resolve();if(n&&n.length>0){document.getElementsByTagName("link");const o=document.querySelector("meta[property=csp-nonce]"),d=(o==null?void 0:o.nonce)||(o==null?void 0:o.getAttribute("nonce"));i=Promise.allSettled(n.map(l=>{if(l=te(l),l in U)return;U[l]=!0;const c=l.endsWith(".css"),p=c?'[rel="stylesheet"]':"";if(document.querySelector(`link[href="${l}"]${p}`))return;const m=document.createElement("link");if(m.rel=c?"stylesheet":ee,c||(m.as="script"),m.crossOrigin="",m.href=l,d&&m.setAttribute("nonce",d),document.head.appendChild(m),c)return new Promise((f,y)=>{m.addEventListener("load",f),m.addEventListener("error",()=>y(new Error(`Unable to preload CSS for ${l}`)))})}))}function a(o){const d=new Event("vite:preloadError",{cancelable:!0});if(d.payload=o,window.dispatchEvent(d),!d.defaultPrevented)throw o}return i.then(o=>{for(const d of o||[])d.status==="rejected"&&a(d.reason);return t().catch(a)})},ne=`<div class="page-section" id="page-bancos">
    <section class="transactions-section">
        <div class="section-header">
            <h3>Bancos & Contas</h3>
            <p style="color: var(--text-muted); font-size: 0.9rem;">Controle seus saldos e extratos bancários</p>
        </div>
        <div class="cards-grid" id="banks-list"></div>
    </section>
</div>
`,ae=`<div class="page-section" id="page-cartoes">
    <section class="transactions-section">
        <div class="section-header">
            <h3>Meus Cartões de Crédito</h3>
            <p style="color: var(--text-muted); font-size: 0.9rem;">Organize seus limites e faturas</p>
        </div>
        <div class="cards-grid" id="cards-list"></div>
    </section>
</div>
`,se=`<div class="page-section" id="page-categorias">
    <section class="transactions-section">
        <div class="section-header">
            <h3>Minhas Categorias</h3>
            <p style="color: var(--text-muted); font-size: 0.9rem;">Organize suas transações com pastas personalizadas</p>
        </div>
        <div class="cards-grid" id="categories-list" style="display: grid; grid-template-columns: repeat(auto-fill, minmax(200px, 1fr)); gap: 16px;">
        </div>
    </section>
</div>
`,ie=`<div class="page-section" id="page-configuracoes">
    <div class="card settings-card" style="max-width: 600px; margin: 0 auto; padding: 0; overflow: hidden;">
        <div class="settings-header" style="padding: 24px; border-bottom: 1px solid var(--border); background: var(--bg-body);">
            <h3 style="margin: 0;"><i class="fa-solid fa-sliders"></i> Ajustes da Conta</h3>
            <p style="color: var(--text-muted); font-size: 0.9rem; margin-top: 4px;">Gerencie suas preferências e segurança</p>
        </div>
        <div class="settings-menu">
            <div class="settings-item" id="theme-toggle-settings" style="display: flex; align-items: center; padding: 16px 24px; border-bottom: 1px solid var(--border); cursor: pointer; transition: 0.2s;">
                <div class="settings-icon" style="width: 40px; height: 40px; border-radius: 50%; background: var(--bg-secondary); display: flex; align-items: center; justify-content: center; font-size: 1.2rem; color: var(--primary); margin-right: 16px;">
                    <i class="fa-solid fa-moon"></i>
                </div>
                <div class="settings-content" style="flex: 1;">
                    <h4 style="margin: 0; font-size: 1rem;">Modo Escuro</h4>
                    <p style="margin: 0; font-size: 0.85rem; color: var(--text-muted);">Alternar entre tema claro e escuro</p>
                </div>
                <div id="theme-toggle-track" style="width: 44px; height: 24px; background: var(--border); border-radius: 12px; position: relative; transition: background 0.3s;">
                    <div id="theme-toggle-circle" style="width: 20px; height: 20px; background: white; border-radius: 50%; position: absolute; top: 2px; left: 2px; transition: transform 0.3s; box-shadow: 0 1px 3px rgba(0,0,0,0.2);">
                    </div>
                </div>
            </div>
            <div class="settings-item" id="btn-menu-personal" style="display: flex; align-items: center; padding: 16px 24px; border-bottom: 1px solid var(--border); cursor: pointer; transition: 0.2s;">
                <div class="settings-icon" style="width: 40px; height: 40px; border-radius: 50%; background: var(--bg-secondary); display: flex; align-items: center; justify-content: center; font-size: 1.2rem; color: var(--primary); margin-right: 16px;">
                    <i class="fa-solid fa-user"></i>
                </div>
                <div class="settings-content" style="flex: 1;">
                    <h4 style="margin: 0; font-size: 1rem;">Dados Pessoais</h4>
                    <p style="margin: 0; font-size: 0.85rem; color: var(--text-muted);">Nome, e-mail, telefone e foto</p>
                </div>
                <i class="fa-solid fa-chevron-right" style="color: var(--text-muted);"></i>
            </div>
            <div class="settings-item" id="btn-menu-security" style="display: flex; align-items: center; padding: 16px 24px; border-bottom: 1px solid var(--border); cursor: pointer; transition: 0.2s;">
                <div class="settings-icon" style="width: 40px; height: 40px; border-radius: 50%; background: var(--bg-secondary); display: flex; align-items: center; justify-content: center; font-size: 1.2rem; color: var(--primary); margin-right: 16px;">
                    <i class="fa-solid fa-shield-halved"></i>
                </div>
                <div class="settings-content" style="flex: 1;">
                    <h4 style="margin: 0; font-size: 1rem;">Segurança e Acesso</h4>
                    <p style="margin: 0; font-size: 0.85rem; color: var(--text-muted);">Alterar senha</p>
                </div>
                <i class="fa-solid fa-chevron-right" style="color: var(--text-muted);"></i>
            </div>
            <div class="settings-item" id="btn-menu-devices" style="display: flex; align-items: center; padding: 16px 24px; border-bottom: 1px solid var(--border); cursor: pointer; transition: 0.2s;">
                <div class="settings-icon" style="width: 40px; height: 40px; border-radius: 50%; background: var(--bg-secondary); display: flex; align-items: center; justify-content: center; font-size: 1.2rem; color: var(--primary); margin-right: 16px;">
                    <i class="fa-solid fa-laptop"></i>
                </div>
                <div class="settings-content" style="flex: 1;">
                    <h4 style="margin: 0; font-size: 1rem;">Dispositivos Conectados</h4>
                    <p style="margin: 0; font-size: 0.85rem; color: var(--text-muted);">Gerencie as sessões ativas</p>
                </div>
                <i class="fa-solid fa-chevron-right" style="color: var(--text-muted);"></i>
            </div>
            <div class="settings-item" id="btn-menu-notifications" style="display: flex; align-items: center; padding: 16px 24px; border-bottom: 1px solid var(--border); cursor: pointer; transition: 0.2s;">
                <div class="settings-icon" style="width: 40px; height: 40px; border-radius: 50%; background: var(--bg-secondary); display: flex; align-items: center; justify-content: center; font-size: 1.2rem; color: var(--primary); margin-right: 16px;">
                    <i class="fa-solid fa-bell"></i>
                </div>
                <div class="settings-content" style="flex: 1;">
                    <h4 style="margin: 0; font-size: 1rem;">Notificações</h4>
                    <p style="margin: 0; font-size: 0.85rem; color: var(--text-muted);">Lembretes de contas a pagar</p>
                </div>
                <i class="fa-solid fa-chevron-right" style="color: var(--text-muted);"></i>
            </div>
            <div class="settings-item" id="btn-menu-report" style="display: flex; align-items: center; padding: 16px 24px; border-bottom: 1px solid var(--border); cursor: pointer; transition: 0.2s;">
                <div class="settings-icon" style="width: 40px; height: 40px; border-radius: 50%; background: var(--bg-secondary); display: flex; align-items: center; justify-content: center; font-size: 1.2rem; color: var(--primary); margin-right: 16px;">
                    <i class="fa-solid fa-circle-info"></i>
                </div>
                <div class="settings-content" style="flex: 1;">
                    <h4 style="margin: 0; font-size: 1rem;">Reportar Problema</h4>
                    <p style="margin: 0; font-size: 0.85rem; color: var(--text-muted);">Encontrou um erro?</p>
                </div>
                <i class="fa-solid fa-chevron-right" style="color: var(--text-muted);"></i>
            </div>
            <div class="settings-item" id="btn-menu-close-account" style="display: flex; align-items: center; padding: 16px 24px; cursor: pointer; transition: 0.2s; background: var(--danger-bg, rgba(239, 68, 68, 0.05));">
                <div class="settings-icon" style="width: 40px; height: 40px; border-radius: 50%; background: transparent; display: flex; align-items: center; justify-content: center; font-size: 1.2rem; color: var(--danger); margin-right: 16px;">
                    <i class="fa-solid fa-triangle-exclamation"></i>
                </div>
                <div class="settings-content" style="flex: 1;">
                    <h4 style="margin: 0; font-size: 1rem; color: var(--danger);">Encerrar Conta</h4>
                    <p style="margin: 0; font-size: 0.85rem; color: var(--danger); opacity: 0.8;">Ação irreversível</p>
                </div>
                <i class="fa-solid fa-chevron-right" style="color: var(--danger);"></i>
            </div>
        </div>
    </div>
</div>
`,oe=`<div class="page-section active" id="page-dashboard">
    <div class="dashboard-grid">
        <!-- Card de Saldo Total com Fatura do Cartão -->
        <section class="summary-cards" style="grid-template-columns: 1fr; margin-bottom: 0;">
            <div class="card balance-card dashboard-saldo-card">
                <div class="card-header">
                    <h3>Saldo Total</h3>
                    <i class="fa-solid fa-wallet"></i>
                </div>
                <div class="amount" id="total-balance">R$ 0,00</div>

                <div class="card-invoice-info">
                    <div class="invoice-row">
                        <span class="invoice-label">💳 Fatura do Cartão (mês atual)</span>
                        <span class="invoice-value" id="total-card-invoice">R$ 0,00</span>
                    </div>
                    <div class="invoice-detail" id="card-invoice-detail">Nenhum gasto no cartão este mês</div>
                </div>
            </div>
        </section>

        <!-- Gráfico de Pizza com Filtro -->
        <section class="transactions-section dashboard-grafico-card">
            <h3>Distribuição de Despesas</h3>

            <div style="display: flex; gap: 8px; align-items: center; flex-wrap: wrap; margin-bottom: 12px; margin-top: 8px;">
                <span style="font-size: 0.8rem; color: var(--text-muted);">Período:</span>
                <select id="chart-period" style="padding: 4px 8px; border-radius: 4px; border: 1px solid var(--border); background: var(--bg-body); color: var(--text-main); font-size: 0.8rem;">
                    <option value="7">Últimos 7 dias</option>
                    <option value="15">Últimos 15 dias</option>
                    <option value="30" selected>Últimos 30 dias</option>
                    <option value="60">Últimos 60 dias</option>
                    <option value="90">Últimos 90 dias</option>
                    <option value="all">Todo o período</option>
                </select>
                <input type="date" id="chart-date-start" style="padding: 4px 8px; border-radius: 4px; border: 1px solid var(--border); background: var(--bg-body); color: var(--text-main); font-size: 0.8rem; width: 130px;" title="Data Inicial">
                <span style="font-size: 0.8rem; color: var(--text-muted);">até</span>
                <input type="date" id="chart-date-end" style="padding: 4px 8px; border-radius: 4px; border: 1px solid var(--border); background: var(--bg-body); color: var(--text-main); font-size: 0.8rem; width: 130px;" title="Data Final">
            </div>

            <div class="chart-container">
                <canvas id="category-chart"></canvas>
            </div>
            <div class="chart-legend" id="chart-legend">
                <!-- Legenda gerada pelo JavaScript -->
            </div>
        </section>
    </div>

    <!-- Últimas Transações -->
    <section class="transactions-section">
        <div class="section-header">
            <h3>Últimas Transações</h3>
            <a href="#" class="view-all" id="btn-view-all-tx">Ver todo o histórico</a>
        </div>
        <div class="transactions-list" id="transaction-list-recent">
            <!-- O JavaScript preenche aqui -->
        </div>
    </section>
</div>
`,re=`<div class="page-section" id="page-fixas">
    <section class="transactions-section">
        <div class="section-header">
            <h3>Minhas Transações Fixas</h3>
            <p style="color: var(--text-muted); font-size: 0.9rem;">Receitas e Despesas Recorrentes</p>
        </div>
        <div class="transactions-list" id="transaction-list-fixed"></div>
    </section>
</div>
`,de=`<div class="page-section" id="page-investimentos">
    <section class="summary-cards" style="margin-bottom: 24px;">
        <div class="card balance-card">
            <div class="card-header">
                <h3>Total Investido</h3>
                <i class="fa-solid fa-piggy-bank"></i>
            </div>
            <div class="amount" id="total-investments">R$ 0,00</div>
        </div>
        <div class="card income-card">
            <div class="card-header">
                <h3>Rendimento Bruto Est.</h3>
                <i class="fa-solid fa-arrow-trend-up"></i>
            </div>
            <div class="amount" id="total-investments-yield">R$ 0,00</div>
        </div>
        <div class="card" style="background: var(--bg-secondary); border: 1px solid var(--border);">
            <div class="card-header" style="color: var(--text-main);">
                <h3>Taxas Atuais (API)</h3>
                <i class="fa-solid fa-globe"></i>
            </div>
            <div class="amount" id="market-rates-display" style="font-size: 1.2rem; color: var(--text-main); margin-top: 8px;">
                Carregando...
            </div>
        </div>
    </section>
    <section class="transactions-section">
        <div class="section-header">
            <h3>Meus Investimentos</h3>
            <p style="color: var(--text-muted); font-size: 0.9rem;">Acompanhe sua carteira e rendimentos</p>
        </div>
        <div class="investments-grid" id="investments-list" style="display: grid; grid-template-columns: 1fr; gap: 16px;">
        </div>
    </section>
</div>
`,le=`<div class="page-section" id="page-metas">
    <section class="transactions-section">
        <div class="section-header">
            <h3>Minhas Metas</h3>
            <p style="color: var(--text-muted); font-size: 0.9rem;">Organize suas metas financeiras</p>
        </div>
        <div class="goals-grid" id="goals-list"></div>
    </section>
</div>
`,ce=`<div class="page-section" id="page-relatorios">
    <div class="report-layout">
        <aside class="card" style="padding: 20px; border: 1px solid var(--border);">
            <h3 style="margin-top: 0; margin-bottom: 16px; display: flex; align-items: center; gap: 8px;">
                <i class="fa-solid fa-sliders" style="color: var(--primary);"></i> Opções de Emissão
            </h3>
            <div class="form-group" style="margin-bottom: 16px;">
                <label for="report-type" style="font-weight: 500; font-size: 0.9rem; color: var(--text-muted); display: block; margin-bottom: 6px;">Tipo de Relatório</label>
                <select id="report-type" class="form-input" style="width: 100%; padding: 8px; border-radius: 6px; background: var(--bg-main); border: 1px solid var(--border); color: var(--text-main);">
                    <option value="monthly-summary">Resumo Mensal (DRE)</option>
                    <option value="category-expenses">Gastos por Categoria</option>
                    <option value="bank-statement">Extrato de Conta/Banco</option>
                    <option value="credit-card">Relatório de Cartões</option>
                </select>
            </div>
            <div class="form-group" id="report-period-container" style="margin-bottom: 16px;">
                <label for="report-month" style="font-weight: 500; font-size: 0.9rem; color: var(--text-muted); display: block; margin-bottom: 6px;">Mês de Referência</label>
                <input type="month" id="report-month" class="form-input" style="width: 100%; padding: 8px; border-radius: 6px; background: var(--bg-main); border: 1px solid var(--border); color: var(--text-main);">
            </div>
            <div class="form-group" id="report-bank-container" style="display: none; margin-bottom: 16px;">
                <label for="report-bank" style="font-weight: 500; font-size: 0.9rem; color: var(--text-muted); display: block; margin-bottom: 6px;">Selecionar Conta/Banco</label>
                <select id="report-bank" class="form-input" style="width: 100%; padding: 8px; border-radius: 6px; background: var(--bg-main); border: 1px solid var(--border); color: var(--text-main);">
                </select>
            </div>
            <button class="btn btn-primary w-100 mt-3" id="btn-generate-report" style="justify-content: center; width: 100%;">
                <i class="fa-solid fa-gears"></i> Gerar Relatório
            </button>
        </aside>
        <section class="card report-preview">
            <div style="display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid var(--border); padding-bottom: 12px; margin-bottom: 20px;">
                <h3 style="margin: 0; display: flex; align-items: center; gap: 8px;">
                    <i class="fa-solid fa-receipt" style="color: var(--primary);"></i> Visualização do Relatório
                </h3>
                <div style="display: flex; gap: 8px;">
                    <button class="btn btn-outline" id="btn-print-report" disabled style="padding: 6px 12px; font-size: 0.85rem;">
                        <i class="fa-solid fa-print"></i> Imprimir
                    </button>
                    <button class="btn btn-outline" id="btn-export-csv" disabled style="padding: 6px 12px; font-size: 0.85rem;">
                        <i class="fa-solid fa-file-csv"></i> Exportar CSV
                    </button>
                </div>
            </div>
            <div id="report-preview-content" style="flex: 1; display: flex; flex-direction: column; justify-content: center; align-items: center; color: var(--text-muted);">
                <i class="fa-solid fa-chart-pie" style="font-size: 3rem; margin-bottom: 16px; opacity: 0.5;"></i>
                <p style="margin: 0; font-weight: 500;">Selecione as opções ao lado e clique em "Gerar Relatório".</p>
            </div>
        </section>
    </div>
</div>
`,me=`<div class="page-section" id="page-transacoes">
    <section class="transactions-section filter-container">
        <div class="filters">
            <input type="text" id="filter-search" class="form-input" placeholder="Buscar por descrição...">
            <select id="filter-type" class="form-input">
                <option value="all">Todas as transações</option>
                <option value="income">Apenas Receitas</option>
                <option value="expense">Apenas Despesas</option>
            </select>
            <input type="date" id="filter-date-start" class="form-input" title="Data Inicial">
            <span style="display:flex;align-items:center;color:var(--text-muted);font-weight:bold;">a</span>
            <input type="date" id="filter-date-end" class="form-input" title="Data Final">
            <select id="filter-category" class="form-input" title="Filtrar por Categoria">
                <option value="all">Todas Categ.</option>
            </select>
            <button id="btn-clear-filters" class="btn-icon" title="Limpar Filtros" style="padding: 0 16px; border: 1px solid var(--border); border-radius: 8px; background: var(--bg-body);">
                <i class="fa-solid fa-eraser"></i>
            </button>
            <button id="btn-show-pending-installments" class="btn btn-outline" style="height: 38px; padding: 0 16px; border: 1px solid var(--border); border-radius: 8px; background: var(--bg-body); color: var(--text-main); font-weight: 500; font-size: 0.9rem;" title="Compras Parceladas Pendentes">
                <i class="fa-solid fa-calendar-days" style="color: var(--primary);"></i> Parceladas Pendentes
            </button>
        </div>
    </section>

    <div class="summary-cards" style="gap: 16px; margin: 16px 0;">
        <div class="card balance-card" style="padding: 16px;">
            <div class="card-header" style="margin-bottom: 12px;">
                <h3>Valor Filtrado</h3><i class="fa-solid fa-wallet"></i>
            </div>
            <div class="amount" id="filtered-balance" style="font-size: 1.5rem;">R$ 0,00</div>
        </div>
        <div class="card income-card" style="padding: 16px;">
            <div class="card-header" style="margin-bottom: 12px;">
                <h3>Receitas</h3><i class="fa-solid fa-arrow-up"></i>
            </div>
            <div class="amount" id="filtered-income" style="font-size: 1.5rem;">R$ 0,00</div>
        </div>
        <div class="card expense-card" style="padding: 16px;">
            <div class="card-header" style="margin-bottom: 12px;">
                <h3>Despesas</h3><i class="fa-solid fa-arrow-down"></i>
            </div>
            <div class="amount" id="filtered-expense" style="font-size: 1.5rem;">R$ 0,00</div>
        </div>
    </div>

    <section class="transactions-section">
        <div class="transactions-list" id="transaction-list-complete"></div>
    </section>
</div>
`,ue=Object.assign({"./views/bancos/bancos.html":ne,"./views/cartoes/cartoes.html":ae,"./views/categorias/categorias.html":se,"./views/configuracoes/configuracoes.html":ie,"./views/dashboard/dashboard.html":oe,"./views/fixas/fixas.html":re,"./views/investimentos/investimentos.html":de,"./views/metas/metas.html":le,"./views/relatorios/relatorios.html":ce,"./views/transacoes/transacoes.html":me}),L={"page-dashboard":{title:"Visão Geral",templateKey:"./views/dashboard/dashboard.html",importModule:()=>g(()=>import("./dashboard-Bi-cvqa5.js"),[])},"page-transacoes":{title:"Histórico Completo",templateKey:"./views/transacoes/transacoes.html",importModule:()=>g(()=>import("./transacoes-T3jyjffV.js"),[])},"page-fixas":{title:"Transações Fixas",templateKey:"./views/fixas/fixas.html",importModule:()=>g(()=>import("./fixas-ObJi-zza.js"),[])},"page-bancos":{title:"Bancos & Contas",templateKey:"./views/bancos/bancos.html",importModule:()=>g(()=>import("./bancos-Ct9WTdGD.js"),[])},"page-cartoes":{title:"Meus Cartões",templateKey:"./views/cartoes/cartoes.html",importModule:()=>g(()=>import("./cartoes-jgMa4pP3.js"),[])},"page-metas":{title:"Minhas Metas",templateKey:"./views/metas/metas.html",importModule:()=>g(()=>import("./metas-DH1Q7ZFD.js"),[])},"page-categorias":{title:"Categorias Personalizadas",templateKey:"./views/categorias/categorias.html",importModule:()=>g(()=>import("./categorias-ig-lV4oM.js"),[])},"page-investimentos":{title:"Meus Investimentos",templateKey:"./views/investimentos/investimentos.html",importModule:()=>g(()=>import("./investimentos-gBBMNG_K.js"),[])},"page-relatorios":{title:"Relatórios & Gráficos",templateKey:"./views/relatorios/relatorios.html",importModule:()=>g(()=>import("./relatorios-DbkGwBDP.js"),[])},"page-configuracoes":{title:"Gerenciar Conta",templateKey:"./views/configuracoes/configuracoes.html",importModule:()=>g(()=>import("./configuracoes-DlB0VCU1.js"),[])}},B={};async function W(e){L[e]||(e="page-dashboard");const t=document.getElementById("pages-container");if(!t)return;const n=document.getElementById("page-title");n&&(n.textContent=L[e].title),document.querySelectorAll("#nav-menu li").forEach(i=>{const a=i.querySelector("a");a&&a.dataset.page===e?i.classList.add("active"):i.classList.remove("active")}),pe(e);let r=document.getElementById(e);if(!r)try{const i=ue[L[e].templateKey];if(!i)throw new Error(`Template não encontrado para ${e}`);const a=document.createElement("div");a.innerHTML=i.trim(),r=a.firstElementChild,t.appendChild(r)}catch(i){console.error("Erro ao inserir HTML da visão:",i);return}document.querySelectorAll(".page-section").forEach(i=>i.classList.remove("active")),r.classList.add("active");try{if(B[e])B[e].renderView&&B[e].renderView();else{const i=await L[e].importModule();B[e]=i,i.initView&&i.initView()}}catch(i){console.error(`Erro ao inicializar módulo de ${e}:`,i)}}function pe(e){const t=["page-metas","page-configuracoes","page-fixas","page-categorias","page-investimentos","page-relatorios"],n=document.getElementById("btn-new-transaction");n&&(n.style.display=t.includes(e)?"none":"flex");const r=document.getElementById("btn-new-transfer");r&&(r.style.display=["page-dashboard","page-bancos","page-transacoes"].includes(e)?"flex":"none");const i=document.getElementById("btn-new-goal");i&&(i.style.display=e==="page-metas"?"flex":"none");const a=document.getElementById("btn-new-fixed-transaction");a&&(a.style.display=e==="page-fixas"?"flex":"none");const o=document.getElementById("btn-new-card");o&&(o.style.display=e==="page-cartoes"?"flex":"none");const d=document.getElementById("btn-new-category");d&&(d.style.display=e==="page-categorias"?"flex":"none");const l=document.getElementById("btn-new-bank");l&&(l.style.display=e==="page-bancos"?"flex":"none");const c=document.getElementById("btn-new-investment");c&&(c.style.display=e==="page-investimentos"?"flex":"none")}function E(e){if(!e)return 0;let t=e.toString().trim();t.includes(",")&&(t=t.replace(/\./g,""),t=t.replace(",","."));const n=parseFloat(t);return isNaN(n)?0:n}function Be(e){return(Number(e)||0).toLocaleString("pt-BR",{style:"currency",currency:"BRL"})}function _e(e){if(!e)return"";const t=e.split("-");return t.length===3?`${t[2]}/${t[1]}/${t[0]}`:e}const N=[{name:"Alimentação",icon:"fa-utensils",type:"expense",color:"#ef4444"},{name:"Moradia",icon:"fa-house",type:"expense",color:"#f59e0b"},{name:"Transporte",icon:"fa-car",type:"expense",color:"#3b82f6"},{name:"Saúde",icon:"fa-heart-pulse",type:"expense",color:"#10b981"},{name:"Educação",icon:"fa-graduation-cap",type:"expense",color:"#8b5cf6"},{name:"Lazer",icon:"fa-gamepad",type:"expense",color:"#ec4899"},{name:"Compras",icon:"fa-bag-shopping",type:"expense",color:"#6366f1"},{name:"Salário",icon:"fa-money-bill-wave",type:"income",color:"#10b981"},{name:"Investimentos",icon:"fa-chart-line",type:"income",color:"#0ea5e9"},{name:"Outros",icon:"fa-ellipsis",type:"expense",color:"#64748b"}];function Ce(e){const t=N.find(n=>n.name.toLowerCase()===(e||"").toLowerCase());return t?t.icon:"fa-tag"}function ke(e){const t=N.find(n=>n.name.toLowerCase()===(e||"").toLowerCase());return t?t.color:"#6366f1"}function w(e,t=!1){const n=document.getElementById("auth-message");n?(n.textContent=e,n.style.color=t?"var(--danger)":"var(--primary)"):alert(e)}function fe(){ge(),ve(),ye()}function ge(){document.querySelectorAll('.close-modal, [id^="btn-cancel-"]').forEach(a=>{a.addEventListener("click",o=>{const d=o.target.closest(".modal-overlay");d&&d.classList.remove("active")})}),window.addEventListener("click",a=>{a.target.classList.contains("modal-overlay")&&a.target.classList.remove("active")});const e=document.getElementById("btn-new-transaction");e&&e.addEventListener("click",()=>{s.editingTransactionId=null,s.editingGroupId=null,s.launchingFixedId=null,s.launchingCardId=null;const a=document.getElementById("form-transaction");a&&a.reset();const o=document.getElementById("date");o&&(o.value=new Date().toISOString().slice(0,10));const d=document.querySelector("#transaction-modal h2");d&&(d.textContent="Nova Transação"),S(),z(),J();const l=document.getElementById("transaction-modal");l&&l.classList.add("active")});const t=document.getElementById("btn-new-goal");t&&t.addEventListener("click",()=>{const a=document.getElementById("form-goal");a&&a.reset();const o=document.getElementById("goal-modal");o&&o.classList.add("active")});const n=document.getElementById("btn-new-fixed-transaction");n&&n.addEventListener("click",()=>{s.editingFixedId=null;const a=document.getElementById("form-fixed-transaction");a&&a.reset();const o=document.getElementById("fixed-day");o&&(o.value=new Date().getDate());const d=document.querySelector("#fixed-transaction-modal h2");d&&(d.textContent="Nova Transação Fixa"),z();const l=document.getElementById("fixed-transaction-modal");l&&l.classList.add("active")});const r=document.getElementById("btn-new-card");r&&r.addEventListener("click",()=>{s.editingCardId=null;const a=document.getElementById("form-card");a&&a.reset();const o=document.querySelector("#card-modal h2");o&&(o.textContent="Novo Cartão de Crédito");const d=document.getElementById("card-modal");d&&d.classList.add("active")});const i=document.getElementById("btn-new-bank");i&&i.addEventListener("click",()=>{const a=document.getElementById("form-bank");a&&a.reset();const o=document.getElementById("bank-modal");o&&o.classList.add("active")})}function S(){const e=document.getElementById("payment-method"),t=document.getElementById("fixed-payment-method");if(!e)return;let n="";s.banksList.length>0&&(n+='<optgroup label="Bancos / Contas">',s.banksList.forEach(r=>{n+=`<option value="${r.id}">🏦 ${r.name}</option>`}),n+="</optgroup>"),s.cardsList.length>0&&(n+='<optgroup label="Cartões de Crédito">',s.cardsList.forEach(r=>{n+=`<option value="${r.id}">💳 ${r.nickname} (${r.bank})</option>`}),n+="</optgroup>"),e.innerHTML=n,t&&(t.innerHTML=n)}function z(){const e=s.categoriesList.map(i=>`<option value="${i.name}">${i.name}</option>`).join(""),t=document.getElementById("category"),n=document.getElementById("fixed-category"),r=document.getElementById("filter-category");t&&(t.innerHTML='<option value="" disabled selected>Selecione</option>'+e),n&&(n.innerHTML='<option value="" disabled selected>Selecione</option>'+e),r&&(r.innerHTML='<option value="all">Todas Categ.</option>'+e)}function J(){const e=document.getElementById("transaction-goal");if(!e)return;let t='<option value="">Nenhuma</option>';s.goalsList.forEach(n=>{const r=n.targetValue>0?(n.currentValue/n.targetValue*100).toFixed(0):0;t+=`<option value="${n.id}">${n.name} (${r}%)</option>`}),e.innerHTML=t}function ve(){const e=document.getElementById("form-transaction");e&&e.addEventListener("submit",async i=>{var f,y,b,h,I,F,V,O;if(i.preventDefault(),!s.currentUser)return;const a=((f=document.querySelector('input[name="type"]:checked'))==null?void 0:f.value)||"expense",o=(y=document.getElementById("description"))==null?void 0:y.value.trim(),d=E((b=document.getElementById("amount"))==null?void 0:b.value),l=(h=document.getElementById("date"))==null?void 0:h.value,c=(I=document.getElementById("category"))==null?void 0:I.value,p=(F=document.getElementById("payment-method"))==null?void 0:F.value,m=((V=document.getElementById("transaction-goal"))==null?void 0:V.value)||"";if(!o||isNaN(d)||d<=0||!l||!c||!p){alert("Preencha todos os campos obrigatórios!");return}try{s.editingTransactionId?await k.doc(s.editingTransactionId).update({userId:s.currentUser.uid,type:a,description:o,amount:d,date:l,category:c,paymentMethod:p,goalId:m}):await k.add({userId:s.currentUser.uid,type:a,description:o,amount:d,date:l,category:c,paymentMethod:p,goalId:m,createdAt:firebase.firestore.FieldValue.serverTimestamp()}),(O=document.getElementById("transaction-modal"))==null||O.classList.remove("active"),e.reset(),s.editingTransactionId=null,u("transaction-saved")}catch(Q){alert("Erro ao salvar transação: "+Q.message)}});const t=document.getElementById("form-bank");t&&t.addEventListener("submit",async i=>{var l,c,p,m;if(i.preventDefault(),!s.currentUser)return;const a=(l=document.getElementById("bank-name"))==null?void 0:l.value.trim(),o=E((c=document.getElementById("bank-balance"))==null?void 0:c.value),d=((p=document.getElementById("bank-color"))==null?void 0:p.value)||"#0ea5e9";if(!a)return alert("Insira um nome válido para a conta!");try{await R.add({userId:s.currentUser.uid,name:a,balance:o,color:d,createdAt:firebase.firestore.FieldValue.serverTimestamp()}),(m=document.getElementById("bank-modal"))==null||m.classList.remove("active"),t.reset(),u("bank-saved")}catch(f){alert("Erro ao salvar conta: "+f.message)}});const n=document.getElementById("form-card");n&&n.addEventListener("submit",async i=>{var p,m,f,y,b,h;if(i.preventDefault(),!s.currentUser)return;const a=(p=document.getElementById("card-nickname"))==null?void 0:p.value.trim(),o=(m=document.getElementById("card-bank"))==null?void 0:m.value.trim(),d=E((f=document.getElementById("card-limit"))==null?void 0:f.value),l=parseInt((y=document.getElementById("card-closing"))==null?void 0:y.value),c=parseInt((b=document.getElementById("card-due"))==null?void 0:b.value);if(!a||!o||isNaN(d)||d<=0)return alert("Campos inválidos!");try{await M.add({userId:s.currentUser.uid,nickname:a,bank:o,limit:d,closingDay:l,dueDay:c}),(h=document.getElementById("card-modal"))==null||h.classList.remove("active"),n.reset(),u("card-saved")}catch(I){alert("Erro ao salvar cartão: "+I.message)}});const r=document.getElementById("form-goal");r&&r.addEventListener("submit",async i=>{var l,c,p,m;if(i.preventDefault(),!s.currentUser)return;const a=(l=document.getElementById("goal-name"))==null?void 0:l.value.trim(),o=E((c=document.getElementById("goal-target"))==null?void 0:c.value),d=E((p=document.getElementById("goal-current"))==null?void 0:p.value);if(!a||isNaN(o)||o<=0)return alert("Campos inválidos!");try{await A.add({userId:s.currentUser.uid,name:a,targetValue:o,currentValue:d,createdAt:firebase.firestore.FieldValue.serverTimestamp()}),(m=document.getElementById("goal-modal"))==null||m.classList.remove("active"),r.reset(),u("goal-saved")}catch(f){alert("Erro ao salvar meta: "+f.message)}})}function ye(){const e=document.getElementById("tab-tx-single"),t=document.getElementById("tab-tx-bulk"),n=document.getElementById("tab-tx-pdf"),r=document.getElementById("single-tx-container"),i=document.getElementById("bulk-tx-container"),a=document.getElementById("pdf-tx-container");!e||!t||(e.addEventListener("click",()=>{e.classList.add("active"),t.classList.remove("active"),n&&n.classList.remove("active"),r&&(r.style.display="block"),i&&(i.style.display="none"),a&&(a.style.display="none")}),t.addEventListener("click",()=>{t.classList.add("active"),e.classList.remove("active"),n&&n.classList.remove("active"),r&&(r.style.display="none"),i&&(i.style.display="block"),a&&(a.style.display="none")}),n&&n.addEventListener("click",()=>{n.classList.add("active"),e.classList.remove("active"),t.classList.remove("active"),r&&(r.style.display="none"),i&&(i.style.display="none"),a&&(a.style.display="block")}))}window.editTransaction=e=>{const t=s.transactions.find(c=>c.id===e);if(!t)return;s.editingTransactionId=e;const n=document.getElementById("description"),r=document.getElementById("amount"),i=document.getElementById("date"),a=document.getElementById("category"),o=document.getElementById("payment-method");n&&(n.value=t.description),r&&(r.value=t.amount),i&&(i.value=t.date),z(),S(),a&&(a.value=t.category),o&&(o.value=t.paymentMethod);const d=document.querySelector("#transaction-modal h2");d&&(d.textContent="Editar Transação");const l=document.getElementById("transaction-modal");l&&l.classList.add("active")};window.deleteTransaction=async e=>{if(confirm("Excluir esta transação?"))try{await k.doc(e).delete(),u("transaction-deleted")}catch(t){alert("Erro ao excluir: "+t.message)}};window.deleteBank=async e=>{if(confirm("Excluir esta conta bancária?"))try{await R.doc(e).delete(),u("bank-deleted")}catch(t){alert("Erro ao excluir conta: "+t.message)}};window.deleteCard=async e=>{if(confirm("Excluir este cartão de crédito?"))try{await M.doc(e).delete(),u("card-deleted")}catch(t){alert("Erro ao excluir cartão: "+t.message)}};window.deleteGoal=async e=>{if(confirm("Excluir esta meta?"))try{await A.doc(e).delete(),u("goal-deleted")}catch(t){alert("Erro ao excluir meta: "+t.message)}};window.deleteCategory=async e=>{if(confirm("Excluir esta categoria?"))try{await T.doc(e).delete(),u("category-deleted")}catch(t){alert("Erro ao excluir categoria: "+t.message)}};window.deleteInvestment=async e=>{if(confirm("Excluir este investimento?"))try{await H.doc(e).delete(),u("investment-deleted")}catch(t){alert("Erro ao excluir investimento: "+t.message)}};const _=document.getElementById("auth-overlay"),C=document.getElementById("app-wrapper"),$=document.getElementById("btn-google-login"),G=document.getElementById("form-auth-email"),P=document.getElementById("btn-logout"),q=document.getElementById("user-name"),j=document.getElementById("user-email"),K=document.getElementById("user-avatar");document.addEventListener("DOMContentLoaded",()=>{Y(),be(),Ie(),fe()});function Y(){const e=document.getElementById("current-date");if(e){const t=new Date().toLocaleDateString("pt-BR",{weekday:"long",year:"numeric",month:"long",day:"numeric"}).replace(/^\w/,n=>n.toUpperCase());e.textContent=t}}function be(){x.onAuthStateChanged(e=>{e?(s.currentUser=e,_&&_.classList.remove("active"),C&&(C.style.display="flex"),he(),Y(),Ee(),W("page-dashboard")):(s.currentUser=null,C&&(C.style.display="none"),_&&_.classList.add("active"),we())}),$&&$.addEventListener("click",()=>{x.signInWithPopup(new firebase.auth.GoogleAuthProvider).catch(e=>w(e.message,!0))}),G&&G.addEventListener("submit",async e=>{var r,i;e.preventDefault();const t=(r=document.getElementById("auth-email"))==null?void 0:r.value.trim(),n=(i=document.getElementById("auth-password"))==null?void 0:i.value;if(!t||!n)return w("Preencha todos os campos.",!0);w("Autenticando...");try{await x.signInWithEmailAndPassword(t,n)}catch(a){if(a.code==="auth/user-not-found"||a.code==="auth/invalid-credential")try{await x.createUserWithEmailAndPassword(t,n)}catch(o){w(o.message,!0)}else w(a.message,!0)}}),P&&P.addEventListener("click",()=>x.signOut())}function he(){if(!s.currentUser)return;const e=`https://ui-avatars.com/api/?name=${s.currentUser.email}&background=6366f1&color=fff`,t=s.currentUser.displayName||"Usuário Vazio",n=s.currentUser.photoURL||e;q&&(q.textContent=t),j&&(j.textContent=s.currentUser.email),K&&(K.src=n)}let D=!1;async function xe(e){if(!D){D=!0;try{if((await T.where("userId","==",e).get()).empty){const n=v.batch();N.forEach(r=>{const i=T.doc();n.set(i,{userId:e,name:r.name,icon:r.icon})}),await n.commit()}}catch(t){console.error("Erro ao verificar categorias padrão:",t)}finally{D=!1}}}function Ee(){const e=s.currentUser.uid;s.unsTx=k.where("userId","==",e).orderBy("date","desc").onSnapshot(t=>{s.transactions=[],t.forEach(n=>s.transactions.push({id:n.id,...n.data()})),u("transactions-updated")}),s.unsCards=M.where("userId","==",e).onSnapshot(t=>{s.cardsList=[],t.forEach(n=>s.cardsList.push({id:n.id,...n.data()})),S(),u("cards-updated")}),s.unsBanks=R.where("userId","==",e).onSnapshot(t=>{s.banksList=[],t.forEach(n=>s.banksList.push({id:n.id,...n.data()})),S(),u("banks-updated")}),s.unsGoals=A.where("userId","==",e).onSnapshot(t=>{s.goalsList=[],t.forEach(n=>s.goalsList.push({id:n.id,...n.data()})),J(),u("goals-updated")}),s.unsCategories=T.where("userId","==",e).onSnapshot(async t=>{if(t.empty){await xe(e);return}s.categoriesList=[],t.forEach(n=>s.categoriesList.push({id:n.id,...n.data()})),z(),u("categories-updated")}),s.unsFixed=Z.where("userId","==",e).onSnapshot(t=>{s.fixedTransactionsList=[],t.forEach(n=>s.fixedTransactionsList.push({id:n.id,...n.data()})),u("fixed-updated")}),s.unsInvestments=H.where("userId","==",e).onSnapshot(t=>{s.investmentsList=[],t.forEach(n=>s.investmentsList.push({id:n.id,...n.data()})),u("investments-updated")})}function we(){s.unsTx&&s.unsTx(),s.unsCards&&s.unsCards(),s.unsBanks&&s.unsBanks(),s.unsGoals&&s.unsGoals(),s.unsCategories&&s.unsCategories(),s.unsFixed&&s.unsFixed(),s.unsInvestments&&s.unsInvestments()}function Ie(){document.querySelectorAll("#nav-menu a[data-page]").forEach(o=>{o.addEventListener("click",d=>{d.preventDefault();const l=o.dataset.page;W(l),window.innerWidth<=768&&a()})});const t=document.getElementById("mobile-menu-btn"),n=document.querySelector(".sidebar"),r=document.getElementById("sidebar-overlay");function i(){n&&n.classList.toggle("open"),r&&r.classList.toggle("active")}function a(){n&&n.classList.remove("open"),r&&r.classList.remove("active")}t&&t.addEventListener("click",i),r&&r.addEventListener("click",a)}export{Le as a,Ce as b,_e as c,Be as f,ke as g,W as n,s};

(function(){const t=document.createElement("link").relList;if(t&&t.supports&&t.supports("modulepreload"))return;for(const o of document.querySelectorAll('link[rel="modulepreload"]'))r(o);new MutationObserver(o=>{for(const a of o)if(a.type==="childList")for(const s of a.addedNodes)s.tagName==="LINK"&&s.rel==="modulepreload"&&r(s)}).observe(document,{childList:!0,subtree:!0});function n(o){const a={};return o.integrity&&(a.integrity=o.integrity),o.referrerPolicy&&(a.referrerPolicy=o.referrerPolicy),o.crossOrigin==="use-credentials"?a.credentials="include":o.crossOrigin==="anonymous"?a.credentials="omit":a.credentials="same-origin",a}function r(o){if(o.ep)return;o.ep=!0;const a=n(o);fetch(o.href,a)}})();const le={apiKey:"AIzaSyBFmPf_MY9qfxbAbazYa_pFruoaAhjiago",authDomain:"contacomigopro.firebaseapp.com",projectId:"contacomigopro",storageBucket:"contacomigopro.firebasestorage.app",messagingSenderId:"396497996638",appId:"1:396497996638:web:ea0417c96ab7b96de29dcf",measurementId:"G-4T964VEF2N"};firebase.apps.length||firebase.initializeApp(le);const I=firebase.firestore(),B=firebase.auth(),_=I.collection("transactions"),q=I.collection("goals"),z=I.collection("categories"),V=I.collection("cards"),de=I.collection("fixed_transactions"),j=I.collection("banks"),ne=I.collection("investments"),i={currentUser:null,transactions:[],goalsList:[],fixedTransactionsList:[],cardsList:[],categoriesList:[],banksList:[],investmentsList:[],unsTx:null,unsGoals:null,unsCategories:null,unsFixed:null,unsCards:null,unsBanks:null,unsInvestments:null,isDarkMode:localStorage.getItem("contaComigo_darkMode")==="true",currentCardFilter:{id:null,search:"",startDate:"",endDate:"",month:""},currentBankFilter:{id:null,startDate:"",endDate:""},editingTransactionId:null,editingGroupId:null,editingFixedId:null,launchingFixedId:null,launchingCardId:null,editingCardId:null,expandedCardId:null,listeners:new Set};function ae(e){return i.listeners.add(e),()=>i.listeners.delete(e)}function E(e){i.listeners.forEach(t=>{try{t(e)}catch(n){console.error("Erro no listener de estado:",n)}})}const me="modulepreload",ue=function(e){return"/"+e},J={},k=function(t,n,r){let o=Promise.resolve();if(n&&n.length>0){document.getElementsByTagName("link");const s=document.querySelector("meta[property=csp-nonce]"),c=(s==null?void 0:s.nonce)||(s==null?void 0:s.getAttribute("nonce"));o=Promise.allSettled(n.map(l=>{if(l=ue(l),l in J)return;J[l]=!0;const d=l.endsWith(".css"),u=d?'[rel="stylesheet"]':"";if(document.querySelector(`link[href="${l}"]${u}`))return;const m=document.createElement("link");if(m.rel=d?"stylesheet":me,d||(m.as="script"),m.crossOrigin="",m.href=l,c&&m.setAttribute("nonce",c),document.head.appendChild(m),d)return new Promise((p,f)=>{m.addEventListener("load",p),m.addEventListener("error",()=>f(new Error(`Unable to preload CSS for ${l}`)))})}))}function a(s){const c=new Event("vite:preloadError",{cancelable:!0});if(c.payload=s,window.dispatchEvent(c),!c.defaultPrevented)throw s}return o.then(s=>{for(const c of s||[])c.status==="rejected"&&a(c.reason);return t().catch(a)})},pe=`<div class="page-section" id="page-bancos">\r
    <section class="transactions-section">\r
        <div class="section-header">\r
            <h3>Bancos & Contas</h3>\r
            <p style="color: var(--text-muted); font-size: 0.9rem;">Controle seus saldos e extratos bancários</p>\r
        </div>\r
        <div class="cards-grid" id="banks-list"></div>\r
    </section>\r
</div>\r
`,fe=`<div class="page-section" id="page-cartoes">\r
    <section class="transactions-section">\r
        <div class="section-header">\r
            <h3>Meus Cartões de Crédito</h3>\r
            <p style="color: var(--text-muted); font-size: 0.9rem;">Organize seus limites e faturas</p>\r
        </div>\r
        <div class="cards-grid" id="cards-list"></div>\r
    </section>\r
</div>\r
`,ge=`<div class="page-section" id="page-categorias">\r
    <section class="transactions-section">\r
        <div class="section-header">\r
            <h3>Minhas Categorias</h3>\r
            <p style="color: var(--text-muted); font-size: 0.9rem;">Organize suas transações com pastas personalizadas</p>\r
        </div>\r
        <div class="cards-grid" id="categories-list" style="display: grid; grid-template-columns: repeat(auto-fill, minmax(200px, 1fr)); gap: 16px;">\r
        </div>\r
    </section>\r
</div>\r
`,ve=`<div class="page-section" id="page-configuracoes">\r
    <div class="card settings-card" style="max-width: 600px; margin: 0 auto; padding: 0; overflow: hidden;">\r
        <div class="settings-header" style="padding: 24px; border-bottom: 1px solid var(--border); background: var(--bg-body);">\r
            <h3 style="margin: 0;"><i class="fa-solid fa-sliders"></i> Ajustes da Conta</h3>\r
            <p style="color: var(--text-muted); font-size: 0.9rem; margin-top: 4px;">Gerencie suas preferências e segurança</p>\r
        </div>\r
        <div class="settings-menu">\r
            <div class="settings-item" id="theme-toggle-settings" style="display: flex; align-items: center; padding: 16px 24px; border-bottom: 1px solid var(--border); cursor: pointer; transition: 0.2s;">\r
                <div class="settings-icon" style="width: 40px; height: 40px; border-radius: 50%; background: var(--bg-secondary); display: flex; align-items: center; justify-content: center; font-size: 1.2rem; color: var(--primary); margin-right: 16px;">\r
                    <i class="fa-solid fa-moon"></i>\r
                </div>\r
                <div class="settings-content" style="flex: 1;">\r
                    <h4 style="margin: 0; font-size: 1rem;">Modo Escuro</h4>\r
                    <p style="margin: 0; font-size: 0.85rem; color: var(--text-muted);">Alternar entre tema claro e escuro</p>\r
                </div>\r
                <div id="theme-toggle-track" style="width: 44px; height: 24px; background: var(--border); border-radius: 12px; position: relative; transition: background 0.3s;">\r
                    <div id="theme-toggle-circle" style="width: 20px; height: 20px; background: white; border-radius: 50%; position: absolute; top: 2px; left: 2px; transition: transform 0.3s; box-shadow: 0 1px 3px rgba(0,0,0,0.2);">\r
                    </div>\r
                </div>\r
            </div>\r
            <div class="settings-item" id="btn-menu-personal" style="display: flex; align-items: center; padding: 16px 24px; border-bottom: 1px solid var(--border); cursor: pointer; transition: 0.2s;">\r
                <div class="settings-icon" style="width: 40px; height: 40px; border-radius: 50%; background: var(--bg-secondary); display: flex; align-items: center; justify-content: center; font-size: 1.2rem; color: var(--primary); margin-right: 16px;">\r
                    <i class="fa-solid fa-user"></i>\r
                </div>\r
                <div class="settings-content" style="flex: 1;">\r
                    <h4 style="margin: 0; font-size: 1rem;">Dados Pessoais</h4>\r
                    <p style="margin: 0; font-size: 0.85rem; color: var(--text-muted);">Nome, e-mail, telefone e foto</p>\r
                </div>\r
                <i class="fa-solid fa-chevron-right" style="color: var(--text-muted);"></i>\r
            </div>\r
            <div class="settings-item" id="btn-menu-security" style="display: flex; align-items: center; padding: 16px 24px; border-bottom: 1px solid var(--border); cursor: pointer; transition: 0.2s;">\r
                <div class="settings-icon" style="width: 40px; height: 40px; border-radius: 50%; background: var(--bg-secondary); display: flex; align-items: center; justify-content: center; font-size: 1.2rem; color: var(--primary); margin-right: 16px;">\r
                    <i class="fa-solid fa-shield-halved"></i>\r
                </div>\r
                <div class="settings-content" style="flex: 1;">\r
                    <h4 style="margin: 0; font-size: 1rem;">Segurança e Acesso</h4>\r
                    <p style="margin: 0; font-size: 0.85rem; color: var(--text-muted);">Alterar senha</p>\r
                </div>\r
                <i class="fa-solid fa-chevron-right" style="color: var(--text-muted);"></i>\r
            </div>\r
            <div class="settings-item" id="btn-menu-devices" style="display: flex; align-items: center; padding: 16px 24px; border-bottom: 1px solid var(--border); cursor: pointer; transition: 0.2s;">\r
                <div class="settings-icon" style="width: 40px; height: 40px; border-radius: 50%; background: var(--bg-secondary); display: flex; align-items: center; justify-content: center; font-size: 1.2rem; color: var(--primary); margin-right: 16px;">\r
                    <i class="fa-solid fa-laptop"></i>\r
                </div>\r
                <div class="settings-content" style="flex: 1;">\r
                    <h4 style="margin: 0; font-size: 1rem;">Dispositivos Conectados</h4>\r
                    <p style="margin: 0; font-size: 0.85rem; color: var(--text-muted);">Gerencie as sessões ativas</p>\r
                </div>\r
                <i class="fa-solid fa-chevron-right" style="color: var(--text-muted);"></i>\r
            </div>\r
            <div class="settings-item" id="btn-menu-notifications" style="display: flex; align-items: center; padding: 16px 24px; border-bottom: 1px solid var(--border); cursor: pointer; transition: 0.2s;">\r
                <div class="settings-icon" style="width: 40px; height: 40px; border-radius: 50%; background: var(--bg-secondary); display: flex; align-items: center; justify-content: center; font-size: 1.2rem; color: var(--primary); margin-right: 16px;">\r
                    <i class="fa-solid fa-bell"></i>\r
                </div>\r
                <div class="settings-content" style="flex: 1;">\r
                    <h4 style="margin: 0; font-size: 1rem;">Notificações</h4>\r
                    <p style="margin: 0; font-size: 0.85rem; color: var(--text-muted);">Lembretes de contas a pagar</p>\r
                </div>\r
                <i class="fa-solid fa-chevron-right" style="color: var(--text-muted);"></i>\r
            </div>\r
            <div class="settings-item" id="btn-menu-report" style="display: flex; align-items: center; padding: 16px 24px; border-bottom: 1px solid var(--border); cursor: pointer; transition: 0.2s;">\r
                <div class="settings-icon" style="width: 40px; height: 40px; border-radius: 50%; background: var(--bg-secondary); display: flex; align-items: center; justify-content: center; font-size: 1.2rem; color: var(--primary); margin-right: 16px;">\r
                    <i class="fa-solid fa-circle-info"></i>\r
                </div>\r
                <div class="settings-content" style="flex: 1;">\r
                    <h4 style="margin: 0; font-size: 1rem;">Reportar Problema</h4>\r
                    <p style="margin: 0; font-size: 0.85rem; color: var(--text-muted);">Encontrou um erro?</p>\r
                </div>\r
                <i class="fa-solid fa-chevron-right" style="color: var(--text-muted);"></i>\r
            </div>\r
            <div class="settings-item" id="btn-menu-close-account" style="display: flex; align-items: center; padding: 16px 24px; cursor: pointer; transition: 0.2s; background: var(--danger-bg, rgba(239, 68, 68, 0.05));">\r
                <div class="settings-icon" style="width: 40px; height: 40px; border-radius: 50%; background: transparent; display: flex; align-items: center; justify-content: center; font-size: 1.2rem; color: var(--danger); margin-right: 16px;">\r
                    <i class="fa-solid fa-triangle-exclamation"></i>\r
                </div>\r
                <div class="settings-content" style="flex: 1;">\r
                    <h4 style="margin: 0; font-size: 1rem; color: var(--danger);">Encerrar Conta</h4>\r
                    <p style="margin: 0; font-size: 0.85rem; color: var(--danger); opacity: 0.8;">Ação irreversível</p>\r
                </div>\r
                <i class="fa-solid fa-chevron-right" style="color: var(--danger);"></i>\r
            </div>\r
        </div>\r
    </div>\r
</div>\r
`,ye=`<div class="page-section active" id="page-dashboard">\r
    <div class="dashboard-grid">\r
        <!-- Card de Saldo Total com Fatura do Cartão -->\r
        <section class="summary-cards" style="grid-template-columns: 1fr; margin-bottom: 0;">\r
            <div class="card balance-card dashboard-saldo-card">\r
                <div class="card-header">\r
                    <h3>Saldo Total</h3>\r
                    <i class="fa-solid fa-wallet"></i>\r
                </div>\r
                <div class="amount" id="total-balance">R$ 0,00</div>\r
\r
                <div class="card-invoice-info">\r
                    <div class="invoice-row">\r
                        <span class="invoice-label">💳 Fatura do Cartão (mês atual)</span>\r
                        <span class="invoice-value" id="total-card-invoice">R$ 0,00</span>\r
                    </div>\r
                    <div class="invoice-detail" id="card-invoice-detail">Nenhum gasto no cartão este mês</div>\r
                </div>\r
            </div>\r
        </section>\r
\r
        <!-- Gráfico de Pizza com Filtro -->\r
        <section class="transactions-section dashboard-grafico-card">\r
            <h3>Distribuição de Despesas</h3>\r
\r
            <div style="display: flex; gap: 8px; align-items: center; flex-wrap: wrap; margin-bottom: 12px; margin-top: 8px;">\r
                <span style="font-size: 0.8rem; color: var(--text-muted);">Período:</span>\r
                <select id="chart-period" style="padding: 4px 8px; border-radius: 4px; border: 1px solid var(--border); background: var(--bg-body); color: var(--text-main); font-size: 0.8rem;">\r
                    <option value="7">Últimos 7 dias</option>\r
                    <option value="15">Últimos 15 dias</option>\r
                    <option value="30" selected>Últimos 30 dias</option>\r
                    <option value="60">Últimos 60 dias</option>\r
                    <option value="90">Últimos 90 dias</option>\r
                    <option value="all">Todo o período</option>\r
                </select>\r
                <input type="date" id="chart-date-start" style="padding: 4px 8px; border-radius: 4px; border: 1px solid var(--border); background: var(--bg-body); color: var(--text-main); font-size: 0.8rem; width: 130px;" title="Data Inicial">\r
                <span style="font-size: 0.8rem; color: var(--text-muted);">até</span>\r
                <input type="date" id="chart-date-end" style="padding: 4px 8px; border-radius: 4px; border: 1px solid var(--border); background: var(--bg-body); color: var(--text-main); font-size: 0.8rem; width: 130px;" title="Data Final">\r
            </div>\r
\r
            <div class="chart-container">\r
                <canvas id="category-chart"></canvas>\r
            </div>\r
            <div class="chart-legend" id="chart-legend">\r
                <!-- Legenda gerada pelo JavaScript -->\r
            </div>\r
        </section>\r
    </div>\r
\r
    <!-- Últimas Transações -->\r
    <section class="transactions-section">\r
        <div class="section-header">\r
            <h3>Últimas Transações</h3>\r
            <a href="#" class="view-all" id="btn-view-all-tx">Ver todo o histórico</a>\r
        </div>\r
        <div class="transactions-list" id="transaction-list-recent">\r
            <!-- O JavaScript preenche aqui -->\r
        </div>\r
    </section>\r
</div>\r
`,be=`<div class="page-section" id="page-fixas">\r
    <section class="transactions-section">\r
        <div class="section-header">\r
            <h3>Minhas Transações Fixas</h3>\r
            <p style="color: var(--text-muted); font-size: 0.9rem;">Receitas e Despesas Recorrentes</p>\r
        </div>\r
        <div class="transactions-list" id="transaction-list-fixed"></div>\r
    </section>\r
</div>\r
`,he=`<div class="page-section" id="page-investimentos">\r
    <section class="summary-cards" style="margin-bottom: 24px;">\r
        <div class="card balance-card">\r
            <div class="card-header">\r
                <h3>Total Investido</h3>\r
                <i class="fa-solid fa-piggy-bank"></i>\r
            </div>\r
            <div class="amount" id="total-investments">R$ 0,00</div>\r
        </div>\r
        <div class="card income-card">\r
            <div class="card-header">\r
                <h3>Rendimento Bruto Est.</h3>\r
                <i class="fa-solid fa-arrow-trend-up"></i>\r
            </div>\r
            <div class="amount" id="total-investments-yield">R$ 0,00</div>\r
        </div>\r
        <div class="card" style="background: var(--bg-secondary); border: 1px solid var(--border);">\r
            <div class="card-header" style="color: var(--text-main);">\r
                <h3>Taxas Atuais (API)</h3>\r
                <i class="fa-solid fa-globe"></i>\r
            </div>\r
            <div class="amount" id="market-rates-display" style="font-size: 1.2rem; color: var(--text-main); margin-top: 8px;">\r
                Carregando...\r
            </div>\r
        </div>\r
    </section>\r
    <section class="transactions-section">\r
        <div class="section-header">\r
            <h3>Meus Investimentos</h3>\r
            <p style="color: var(--text-muted); font-size: 0.9rem;">Acompanhe sua carteira e rendimentos</p>\r
        </div>\r
        <div class="investments-grid" id="investments-list" style="display: grid; grid-template-columns: 1fr; gap: 16px;">\r
        </div>\r
    </section>\r
</div>\r
`,xe=`<div class="page-section" id="page-metas">\r
    <section class="transactions-section">\r
        <div class="section-header">\r
            <h3>Minhas Metas</h3>\r
            <p style="color: var(--text-muted); font-size: 0.9rem;">Organize suas metas financeiras</p>\r
        </div>\r
        <div class="goals-grid" id="goals-list"></div>\r
    </section>\r
</div>\r
`,Ee=`<div class="page-section" id="page-relatorios">\r
    <div class="report-layout">\r
        <aside class="card" style="padding: 20px; border: 1px solid var(--border);">\r
            <h3 style="margin-top: 0; margin-bottom: 16px; display: flex; align-items: center; gap: 8px;">\r
                <i class="fa-solid fa-sliders" style="color: var(--primary);"></i> Opções de Emissão\r
            </h3>\r
            <div class="form-group" style="margin-bottom: 16px;">\r
                <label for="report-type" style="font-weight: 500; font-size: 0.9rem; color: var(--text-muted); display: block; margin-bottom: 6px;">Tipo de Relatório</label>\r
                <select id="report-type" class="form-input" style="width: 100%; padding: 8px; border-radius: 6px; background: var(--bg-main); border: 1px solid var(--border); color: var(--text-main);">\r
                    <option value="monthly-summary">Resumo Mensal (DRE)</option>\r
                    <option value="category-expenses">Gastos por Categoria</option>\r
                    <option value="bank-statement">Extrato de Conta/Banco</option>\r
                    <option value="credit-card">Relatório de Cartões</option>\r
                </select>\r
            </div>\r
            <div class="form-group" id="report-period-container" style="margin-bottom: 16px;">\r
                <label for="report-month" style="font-weight: 500; font-size: 0.9rem; color: var(--text-muted); display: block; margin-bottom: 6px;">Mês de Referência</label>\r
                <input type="month" id="report-month" class="form-input" style="width: 100%; padding: 8px; border-radius: 6px; background: var(--bg-main); border: 1px solid var(--border); color: var(--text-main);">\r
            </div>\r
            <div class="form-group" id="report-bank-container" style="display: none; margin-bottom: 16px;">\r
                <label for="report-bank" style="font-weight: 500; font-size: 0.9rem; color: var(--text-muted); display: block; margin-bottom: 6px;">Selecionar Conta/Banco</label>\r
                <select id="report-bank" class="form-input" style="width: 100%; padding: 8px; border-radius: 6px; background: var(--bg-main); border: 1px solid var(--border); color: var(--text-main);">\r
                </select>\r
            </div>\r
            <button class="btn btn-primary w-100 mt-3" id="btn-generate-report" style="justify-content: center; width: 100%;">\r
                <i class="fa-solid fa-gears"></i> Gerar Relatório\r
            </button>\r
        </aside>\r
        <section class="card report-preview">\r
            <div style="display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid var(--border); padding-bottom: 12px; margin-bottom: 20px;">\r
                <h3 style="margin: 0; display: flex; align-items: center; gap: 8px;">\r
                    <i class="fa-solid fa-receipt" style="color: var(--primary);"></i> Visualização do Relatório\r
                </h3>\r
                <div style="display: flex; gap: 8px;">\r
                    <button class="btn btn-outline" id="btn-print-report" disabled style="padding: 6px 12px; font-size: 0.85rem;">\r
                        <i class="fa-solid fa-print"></i> Imprimir\r
                    </button>\r
                    <button class="btn btn-outline" id="btn-export-csv" disabled style="padding: 6px 12px; font-size: 0.85rem;">\r
                        <i class="fa-solid fa-file-csv"></i> Exportar CSV\r
                    </button>\r
                </div>\r
            </div>\r
            <div id="report-preview-content" style="flex: 1; display: flex; flex-direction: column; justify-content: center; align-items: center; color: var(--text-muted);">\r
                <i class="fa-solid fa-chart-pie" style="font-size: 3rem; margin-bottom: 16px; opacity: 0.5;"></i>\r
                <p style="margin: 0; font-weight: 500;">Selecione as opções ao lado e clique em "Gerar Relatório".</p>\r
            </div>\r
        </section>\r
    </div>\r
</div>\r
`,we=`<div class="page-section" id="page-transacoes">\r
    <section class="transactions-section filter-container">\r
        <div class="filters">\r
            <input type="text" id="filter-search" class="form-input" placeholder="Buscar por descrição...">\r
            <select id="filter-type" class="form-input">\r
                <option value="all">Todas as transações</option>\r
                <option value="income">Apenas Receitas</option>\r
                <option value="expense">Apenas Despesas</option>\r
            </select>\r
            <input type="date" id="filter-date-start" class="form-input" title="Data Inicial">\r
            <span style="display:flex;align-items:center;color:var(--text-muted);font-weight:bold;">a</span>\r
            <input type="date" id="filter-date-end" class="form-input" title="Data Final">\r
            <select id="filter-category" class="form-input" title="Filtrar por Categoria">\r
                <option value="all">Todas Categ.</option>\r
            </select>\r
            <button id="btn-clear-filters" class="btn-icon" title="Limpar Filtros" style="padding: 0 16px; border: 1px solid var(--border); border-radius: 8px; background: var(--bg-body);">\r
                <i class="fa-solid fa-eraser"></i>\r
            </button>\r
            <button id="btn-show-pending-installments" class="btn btn-outline" style="height: 38px; padding: 0 16px; border: 1px solid var(--border); border-radius: 8px; background: var(--bg-body); color: var(--text-main); font-weight: 500; font-size: 0.9rem;" title="Compras Parceladas Pendentes">\r
                <i class="fa-solid fa-calendar-days" style="color: var(--primary);"></i> Parceladas Pendentes\r
            </button>\r
        </div>\r
    </section>\r
\r
    <div class="summary-cards" style="gap: 16px; margin: 16px 0;">\r
        <div class="card balance-card" style="padding: 16px;">\r
            <div class="card-header" style="margin-bottom: 12px;">\r
                <h3>Valor Filtrado</h3><i class="fa-solid fa-wallet"></i>\r
            </div>\r
            <div class="amount" id="filtered-balance" style="font-size: 1.5rem;">R$ 0,00</div>\r
        </div>\r
        <div class="card income-card" style="padding: 16px;">\r
            <div class="card-header" style="margin-bottom: 12px;">\r
                <h3>Receitas</h3><i class="fa-solid fa-arrow-up"></i>\r
            </div>\r
            <div class="amount" id="filtered-income" style="font-size: 1.5rem;">R$ 0,00</div>\r
        </div>\r
        <div class="card expense-card" style="padding: 16px;">\r
            <div class="card-header" style="margin-bottom: 12px;">\r
                <h3>Despesas</h3><i class="fa-solid fa-arrow-down"></i>\r
            </div>\r
            <div class="amount" id="filtered-expense" style="font-size: 1.5rem;">R$ 0,00</div>\r
        </div>\r
    </div>\r
\r
    <section class="transactions-section">\r
        <div class="transactions-list" id="transaction-list-complete"></div>\r
    </section>\r
</div>\r
`,Ie=Object.assign({"./views/bancos/bancos.html":pe,"./views/cartoes/cartoes.html":fe,"./views/categorias/categorias.html":ge,"./views/configuracoes/configuracoes.html":ve,"./views/dashboard/dashboard.html":ye,"./views/fixas/fixas.html":be,"./views/investimentos/investimentos.html":he,"./views/metas/metas.html":xe,"./views/relatorios/relatorios.html":Ee,"./views/transacoes/transacoes.html":we}),T={"page-dashboard":{title:"Visão Geral",templateKey:"./views/dashboard/dashboard.html",importModule:()=>k(()=>import("./dashboard-DAJuL-Qg.js"),[])},"page-transacoes":{title:"Histórico Completo",templateKey:"./views/transacoes/transacoes.html",importModule:()=>k(()=>import("./transacoes-B-4Lfdc3.js"),[])},"page-fixas":{title:"Transações Fixas",templateKey:"./views/fixas/fixas.html",importModule:()=>k(()=>import("./fixas-NiyyLsCl.js"),[])},"page-bancos":{title:"Bancos & Contas",templateKey:"./views/bancos/bancos.html",importModule:()=>k(()=>import("./bancos-Bu9VvS0E.js"),[])},"page-cartoes":{title:"Meus Cartões",templateKey:"./views/cartoes/cartoes.html",importModule:()=>k(()=>import("./cartoes-9E2WAhuH.js"),[])},"page-metas":{title:"Minhas Metas",templateKey:"./views/metas/metas.html",importModule:()=>k(()=>import("./metas-DFvIhFLo.js"),[])},"page-categorias":{title:"Categorias Personalizadas",templateKey:"./views/categorias/categorias.html",importModule:()=>k(()=>import("./categorias-7SlrHm1D.js"),[])},"page-investimentos":{title:"Meus Investimentos",templateKey:"./views/investimentos/investimentos.html",importModule:()=>k(()=>import("./investimentos-BsaOmoQv.js"),[])},"page-relatorios":{title:"Relatórios & Gráficos",templateKey:"./views/relatorios/relatorios.html",importModule:()=>k(()=>import("./relatorios-DKXfMrUw.js"),[])},"page-configuracoes":{title:"Gerenciar Conta",templateKey:"./views/configuracoes/configuracoes.html",importModule:()=>k(()=>import("./configuracoes-CnDpUfyb.js"),[])}},D={};async function oe(e){T[e]||(e="page-dashboard");const t=document.getElementById("pages-container");if(!t)return;const n=document.getElementById("page-title");n&&(n.textContent=T[e].title),document.querySelectorAll("#nav-menu li").forEach(o=>{const a=o.querySelector("a");a&&a.dataset.page===e?o.classList.add("active"):o.classList.remove("active")}),ke(e);let r=document.getElementById(e);if(!r)try{const o=Ie[T[e].templateKey];if(!o)throw new Error(`Template não encontrado para ${e}`);const a=document.createElement("div");a.innerHTML=o.trim(),r=a.firstElementChild,t.appendChild(r)}catch(o){console.error("Erro ao inserir HTML da visão:",o);return}document.querySelectorAll(".page-section").forEach(o=>o.classList.remove("active")),r.classList.add("active");try{if(D[e])D[e].renderView&&D[e].renderView();else{const o=await T[e].importModule();D[e]=o,o.initView&&o.initView()}}catch(o){console.error(`Erro ao inicializar módulo de ${e}:`,o)}}function ke(e){const t=["page-metas","page-configuracoes","page-fixas","page-categorias","page-investimentos","page-relatorios"],n=document.getElementById("btn-new-transaction");n&&(n.style.display=t.includes(e)?"none":"flex");const r=document.getElementById("btn-new-transfer");r&&(r.style.display=["page-dashboard","page-bancos","page-transacoes"].includes(e)?"flex":"none");const o=document.getElementById("btn-new-goal");o&&(o.style.display=e==="page-metas"?"flex":"none");const a=document.getElementById("btn-new-fixed-transaction");a&&(a.style.display=e==="page-fixas"?"flex":"none");const s=document.getElementById("btn-new-card");s&&(s.style.display=e==="page-cartoes"?"flex":"none");const c=document.getElementById("btn-new-category");c&&(c.style.display=e==="page-categorias"?"flex":"none");const l=document.getElementById("btn-new-bank");l&&(l.style.display=e==="page-bancos"?"flex":"none");const d=document.getElementById("btn-new-investment");d&&(d.style.display=e==="page-investimentos"?"flex":"none")}function C(e){if(!e)return 0;let t=e.toString().replace(/R\$\s?/gi,"").trim();t.includes(",")&&(t=t.replace(/\./g,""),t=t.replace(",","."));const n=parseFloat(t);return isNaN(n)?0:n}function A(e){return(Number(e)||0).toLocaleString("pt-BR",{style:"currency",currency:"BRL"})}function We(e){if(!e)return"";const t=e.split("-");return t.length===3?`${t[2]}/${t[1]}/${t[0]}`:e}const H=[{name:"Alimentação",icon:"fa-utensils",type:"expense",color:"#ef4444"},{name:"Moradia",icon:"fa-house",type:"expense",color:"#f59e0b"},{name:"Transporte",icon:"fa-car",type:"expense",color:"#3b82f6"},{name:"Saúde",icon:"fa-heart-pulse",type:"expense",color:"#10b981"},{name:"Educação",icon:"fa-graduation-cap",type:"expense",color:"#8b5cf6"},{name:"Lazer",icon:"fa-gamepad",type:"expense",color:"#ec4899"},{name:"Compras",icon:"fa-bag-shopping",type:"expense",color:"#6366f1"},{name:"Salário",icon:"fa-money-bill-wave",type:"income",color:"#10b981"},{name:"Investimentos",icon:"fa-chart-line",type:"income",color:"#0ea5e9"},{name:"Outros",icon:"fa-ellipsis",type:"expense",color:"#64748b"}];function Ke(e){const t=H.find(n=>n.name.toLowerCase()===(e||"").toLowerCase());return t?t.icon:"fa-tag"}function Je(e){const t=H.find(n=>n.name.toLowerCase()===(e||"").toLowerCase());return t?t.color:"#6366f1"}function L(e,t=!1){const n=document.getElementById("auth-message");n?(n.textContent=e,n.style.color=t?"var(--danger)":"var(--primary)"):alert(e)}window.isBulkMode=!1;function Be(){Le(),Ce(),Se(),$e(),Te()}function Le(){document.querySelectorAll('.close-modal, [id^="btn-cancel-"]').forEach(a=>{a.addEventListener("click",s=>{const c=s.target.closest(".modal-overlay");c&&c.classList.remove("active")})}),window.addEventListener("click",a=>{a.target.classList.contains("modal-overlay")&&a.target.classList.remove("active")});const e=document.getElementById("btn-new-transaction");e&&e.addEventListener("click",()=>{i.editingTransactionId=null,i.editingGroupId=null,i.launchingFixedId=null,i.launchingCardId=null;const a=document.getElementById("form-transaction");a&&a.reset();const s=document.getElementById("date");s&&(s.value=new Date().toISOString().slice(0,10));const c=document.querySelector("#transaction-modal h2");c&&(c.textContent="Nova Transação"),P(),R(),se();const l=document.getElementById("tab-tx-single");l&&l.click();const d=document.getElementById("transaction-modal");d&&d.classList.add("active")});const t=document.getElementById("btn-new-goal");t&&t.addEventListener("click",()=>{const a=document.getElementById("form-goal");a&&a.reset();const s=document.getElementById("goal-modal");s&&s.classList.add("active")});const n=document.getElementById("btn-new-fixed-transaction");n&&n.addEventListener("click",()=>{i.editingFixedId=null;const a=document.getElementById("form-fixed-transaction");a&&a.reset();const s=document.getElementById("fixed-day");s&&(s.value=new Date().getDate());const c=document.querySelector("#fixed-transaction-modal h2");c&&(c.textContent="Nova Transação Fixa"),R();const l=document.getElementById("fixed-transaction-modal");l&&l.classList.add("active")});const r=document.getElementById("btn-new-card");r&&r.addEventListener("click",()=>{i.editingCardId=null;const a=document.getElementById("form-card");a&&a.reset();const s=document.querySelector("#card-modal h2");s&&(s.textContent="Novo Cartão de Crédito");const c=document.getElementById("card-modal");c&&c.classList.add("active")});const o=document.getElementById("btn-new-bank");o&&o.addEventListener("click",()=>{const a=document.getElementById("form-bank");a&&a.reset();const s=document.getElementById("bank-modal");s&&s.classList.add("active")})}function P(){const e=document.getElementById("payment-method"),t=document.getElementById("fixed-payment-method"),n=document.getElementById("pdf-destination");if(!e)return;let r="";i.banksList.length>0&&(r+='<optgroup label="Bancos / Contas">',i.banksList.forEach(o=>{r+=`<option value="${o.id}">🏦 ${o.name}</option>`}),r+="</optgroup>"),i.cardsList.length>0&&(r+='<optgroup label="Cartões de Crédito">',i.cardsList.forEach(o=>{r+=`<option value="${o.id}">💳 ${o.nickname} (${o.bank})</option>`}),r+="</optgroup>"),e.innerHTML=r,t&&(t.innerHTML=r),n&&(n.innerHTML='<option value="" disabled selected>Selecione a conta/cartão</option>'+r)}function R(){const e=i.categoriesList.map(o=>`<option value="${o.name}">${o.name}</option>`).join(""),t=document.getElementById("category"),n=document.getElementById("fixed-category"),r=document.getElementById("filter-category");t&&(t.innerHTML='<option value="" disabled selected>Selecione</option>'+e),n&&(n.innerHTML='<option value="" disabled selected>Selecione</option>'+e),r&&(r.innerHTML='<option value="all">Todas Categ.</option>'+e)}function se(){const e=document.getElementById("transaction-goal");if(!e)return;let t='<option value="">Nenhuma</option>';i.goalsList.forEach(n=>{const r=n.targetValue>0?(n.currentValue/n.targetValue*100).toFixed(0):0;t+=`<option value="${n.id}">${n.name} (${r}%)</option>`}),e.innerHTML=t}function Ce(){const e=document.getElementById("form-transaction");e&&e.addEventListener("submit",async o=>{var p,f,g,y,b,v,x,h;if(o.preventDefault(),!i.currentUser)return;if(window.isBulkMode){await _e();return}const a=((p=document.querySelector('input[name="type"]:checked'))==null?void 0:p.value)||"expense",s=(f=document.getElementById("description"))==null?void 0:f.value.trim(),c=C((g=document.getElementById("amount"))==null?void 0:g.value),l=(y=document.getElementById("date"))==null?void 0:y.value,d=(b=document.getElementById("category"))==null?void 0:b.value,u=(v=document.getElementById("payment-method"))==null?void 0:v.value,m=((x=document.getElementById("transaction-goal"))==null?void 0:x.value)||"";if(!s||isNaN(c)||c<=0||!l||!d||!u){alert("Preencha todos os campos obrigatórios!");return}try{i.editingTransactionId?await _.doc(i.editingTransactionId).update({userId:i.currentUser.uid,type:a,description:s,amount:c,date:l,category:d,paymentMethod:u,goalId:m}):await _.add({userId:i.currentUser.uid,type:a,description:s,amount:c,date:l,category:d,paymentMethod:u,goalId:m,createdAt:firebase.firestore.FieldValue.serverTimestamp()}),(h=document.getElementById("transaction-modal"))==null||h.classList.remove("active"),e.reset(),i.editingTransactionId=null,E("transaction-saved")}catch(w){alert("Erro ao salvar transação: "+w.message)}});const t=document.getElementById("form-bank");t&&t.addEventListener("submit",async o=>{var l,d,u,m;if(o.preventDefault(),!i.currentUser)return;const a=(l=document.getElementById("bank-name"))==null?void 0:l.value.trim(),s=C((d=document.getElementById("bank-balance"))==null?void 0:d.value),c=((u=document.getElementById("bank-color"))==null?void 0:u.value)||"#0ea5e9";if(!a)return alert("Insira um nome válido para a conta!");try{await j.add({userId:i.currentUser.uid,name:a,balance:s,color:c,createdAt:firebase.firestore.FieldValue.serverTimestamp()}),(m=document.getElementById("bank-modal"))==null||m.classList.remove("active"),t.reset(),E("bank-saved")}catch(p){alert("Erro ao salvar conta: "+p.message)}});const n=document.getElementById("form-card");n&&n.addEventListener("submit",async o=>{var u,m,p,f,g,y;if(o.preventDefault(),!i.currentUser)return;const a=(u=document.getElementById("card-nickname"))==null?void 0:u.value.trim(),s=(m=document.getElementById("card-bank"))==null?void 0:m.value.trim(),c=C((p=document.getElementById("card-limit"))==null?void 0:p.value),l=parseInt((f=document.getElementById("card-closing"))==null?void 0:f.value),d=parseInt((g=document.getElementById("card-due"))==null?void 0:g.value);if(!a||!s||isNaN(c)||c<=0)return alert("Campos inválidos!");try{await V.add({userId:i.currentUser.uid,nickname:a,bank:s,limit:c,closingDay:l,dueDay:d}),(y=document.getElementById("card-modal"))==null||y.classList.remove("active"),n.reset(),E("card-saved")}catch(b){alert("Erro ao salvar cartão: "+b.message)}});const r=document.getElementById("form-goal");r&&r.addEventListener("submit",async o=>{var l,d,u,m;if(o.preventDefault(),!i.currentUser)return;const a=(l=document.getElementById("goal-name"))==null?void 0:l.value.trim(),s=C((d=document.getElementById("goal-target"))==null?void 0:d.value),c=C((u=document.getElementById("goal-current"))==null?void 0:u.value);if(!a||isNaN(s)||s<=0)return alert("Campos inválidos!");try{await q.add({userId:i.currentUser.uid,name:a,targetValue:s,currentValue:c,createdAt:firebase.firestore.FieldValue.serverTimestamp()}),(m=document.getElementById("goal-modal"))==null||m.classList.remove("active"),r.reset(),E("goal-saved")}catch(p){alert("Erro ao salvar meta: "+p.message)}})}function Se(){const e=document.getElementById("tab-tx-single"),t=document.getElementById("tab-tx-bulk"),n=document.getElementById("tab-tx-pdf"),r=document.getElementById("single-tx-container"),o=document.getElementById("bulk-tx-container"),a=document.getElementById("pdf-tx-container"),s=document.querySelector("#transaction-modal .modal"),c=document.querySelector("#form-transaction .modal-footer");if(!e||!t)return;e.addEventListener("click",()=>{window.isBulkMode=!1,e.classList.add("active"),t.classList.remove("active"),n&&n.classList.remove("active"),r&&(r.style.display="block"),o&&(o.style.display="none"),a&&(a.style.display="none"),s&&(s.style.maxWidth="500px"),c&&(c.style.display="flex")}),t.addEventListener("click",()=>{var m;window.isBulkMode=!0,t.classList.add("active"),e.classList.remove("active"),n&&n.classList.remove("active"),r&&(r.style.display="none"),o&&(o.style.display="block"),a&&(a.style.display="none"),s&&(s.style.maxWidth="800px"),c&&(c.style.display="flex");const d=document.getElementById("bulk-date");d&&!d.value&&(d.value=((m=document.getElementById("date"))==null?void 0:m.value)||new Date().toISOString().slice(0,10));const u=document.getElementById("bulk-rows-container");u&&u.children.length===0&&window.addBulkRow()}),n&&n.addEventListener("click",()=>{window.isBulkMode=!1,n.classList.add("active"),e.classList.remove("active"),t.classList.remove("active"),r&&(r.style.display="none"),o&&(o.style.display="none"),a&&(a.style.display="block"),s&&(s.style.maxWidth="500px"),c&&(c.style.display="none")});const l=document.getElementById("btn-add-bulk-row");l&&l.addEventListener("click",()=>window.addBulkRow())}window.addBulkRow=()=>{window.addBulkRowWithData({})};window.addBulkRowWithData=(e={})=>{var m,p,f,g,y;const t=document.getElementById("bulk-rows-container");if(!t)return;const n="bulk_row_"+Date.now()+"_"+Math.random().toString(36).substr(2,4),r=e.date||((m=document.getElementById("bulk-date"))==null?void 0:m.value)||((p=document.getElementById("date"))==null?void 0:p.value)||new Date().toISOString().slice(0,10),o=e.paymentMethod||((f=document.getElementById("payment-method"))==null?void 0:f.value)||((g=i.banksList[0])==null?void 0:g.id)||((y=i.cardsList[0])==null?void 0:y.id)||"",a=document.createElement("div");a.id=n,a.className="bulk-row",a.style.cssText=`
        display: grid;
        grid-template-columns: 100px 1.5fr 110px 130px 1fr 1.2fr 36px;
        gap: 8px;
        align-items: center;
        background: var(--bg-body);
        padding: 8px 12px;
        border-radius: 8px;
        border: 1px solid var(--border);
    `;let s='<option value="" disabled selected>Categoria</option>';const c=e.category||"Outros";i.categoriesList.forEach(b=>{const v=b.name===c?"selected":"";s+=`<option value="${b.name}" ${v}>${b.name}</option>`});let l='<option value="" disabled selected>Banco/Cartão</option>';i.banksList.length>0&&i.banksList.forEach(b=>{const v=o&&b.id===o?"selected":"";l+=`<option value="${b.id}" ${v}>🏦 ${b.name}</option>`}),i.cardsList.length>0&&i.cardsList.forEach(b=>{const v=o&&b.id===o?"selected":"";l+=`<option value="${b.id}" ${v}>💳 ${b.nickname}</option>`});const d=e.type==="expense"||!e.type?"selected":"",u=e.type==="income"?"selected":"";a.innerHTML=`
        <select class="bulk-row-type form-input" style="padding: 6px; font-size: 0.85rem;" required>
            <option value="expense" ${d}>Despesa</option>
            <option value="income" ${u}>Receita</option>
        </select>
        <input type="text" class="bulk-row-desc form-input" placeholder="Descrição" value="${e.description||""}" style="padding: 6px; font-size: 0.85rem;" required>
        <input type="text" class="bulk-row-amount form-input" placeholder="Valor" value="${e.amount?e.amount.toFixed(2).replace(".",","):""}" style="padding: 6px; font-size: 0.85rem; text-align: right;" required>
        <input type="date" class="bulk-row-date form-input" value="${r}" style="padding: 6px; font-size: 0.85rem;">
        <select class="bulk-row-category form-input" style="padding: 6px; font-size: 0.85rem;" required>${s}</select>
        <select class="bulk-row-pm form-input" style="padding: 6px; font-size: 0.85rem;" required>${l}</select>
        <button type="button" class="btn-icon" onclick="document.getElementById('${n}').remove()" title="Remover linha" style="color: var(--danger); font-size: 1.1rem;">
            <i class="fa-solid fa-xmark"></i>
        </button>
    `,t.appendChild(a)};window.applyBulkDateToAllRows=()=>{var t;const e=(t=document.getElementById("bulk-date"))==null?void 0:t.value;if(!e)return alert("Selecione uma data primeiro.");document.querySelectorAll(".bulk-row-date").forEach(n=>{n.value=e})};window.setBulkDateToToday=()=>{const e=new Date().toISOString().slice(0,10),t=document.getElementById("bulk-date");t&&(t.value=e),window.applyBulkDateToAllRows()};async function _e(){var r;const e=document.querySelectorAll("#bulk-rows-container .bulk-row");if(e.length===0)return alert("Adicione pelo menos uma linha de transação.");const t=[];let n=!1;if(e.forEach((o,a)=>{var f,g,y,b,v,x;const s=(f=o.querySelector(".bulk-row-type"))==null?void 0:f.value,c=(g=o.querySelector(".bulk-row-desc"))==null?void 0:g.value.trim(),l=(y=o.querySelector(".bulk-row-amount"))==null?void 0:y.value,d=(b=o.querySelector(".bulk-row-date"))==null?void 0:b.value,u=(v=o.querySelector(".bulk-row-category"))==null?void 0:v.value,m=(x=o.querySelector(".bulk-row-pm"))==null?void 0:x.value,p=C(l);!c||isNaN(p)||p<=0||!d||!u||!m?(n=!0,o.style.borderColor="var(--danger)"):(o.style.borderColor="var(--border)",t.push({userId:i.currentUser.uid,type:s,description:c,amount:p,date:d,category:u,paymentMethod:m,createdAt:firebase.firestore.FieldValue.serverTimestamp()}))}),n){alert("Por favor, corrija as linhas destacadas em vermelho antes de salvar.");return}try{const o=I.batch();t.forEach(a=>{const s=_.doc();o.set(s,a)}),await o.commit(),(r=document.getElementById("transaction-modal"))==null||r.classList.remove("active"),document.getElementById("bulk-rows-container").innerHTML="",window.isBulkMode=!1,alert(`${t.length} transações salvas com sucesso em lote!`),E("transactions-saved")}catch(o){alert("Erro ao salvar transações em lote: "+o.message)}}function Te(){const e=document.getElementById("pdf-dropzone"),t=document.getElementById("pdf-file-input"),n=document.getElementById("pdf-selected-file"),r=document.getElementById("pdf-filename"),o=document.getElementById("pdf-destination"),a=document.getElementById("btn-process-pdf"),s=document.getElementById("pdf-loading"),c=document.getElementById("pdf-loading-status"),l=document.getElementById("gemini-key-container"),d=document.getElementById("pdf-gemini-key"),u=document.getElementById("save-gemini-key"),m=document.getElementById("method-heuristic"),p=document.getElementById("method-ai"),f=document.querySelector('label[for="method-heuristic"]'),g=document.querySelector('label[for="method-ai"]');if(!e||!t||!a)return;let y=null;const b=localStorage.getItem("gemini_api_key");b&&d&&(d.value=b),f&&g&&m&&p&&(f.addEventListener("click",()=>{m.checked=!0,l&&(l.style.display="none")}),g.addEventListener("click",()=>{p.checked=!0,l&&(l.style.display="block")})),e.addEventListener("dragover",v=>{v.preventDefault(),e.classList.add("dragover")}),e.addEventListener("dragleave",()=>{e.classList.remove("dragover")}),e.addEventListener("drop",v=>{if(v.preventDefault(),e.classList.remove("dragover"),v.dataTransfer.files.length>0){const x=v.dataTransfer.files[0];x.type==="application/pdf"||x.name.endsWith(".pdf")?(y=x,r&&(r.textContent=x.name),n&&(n.style.display="block")):alert("Apenas arquivos PDF são aceitos.")}}),e.addEventListener("click",()=>{t.click()}),t.addEventListener("change",()=>{if(t.files.length>0){const v=t.files[0];y=v,r&&(r.textContent=v.name),n&&(n.style.display="block")}}),a.addEventListener("click",async()=>{if(!y){alert("Por favor, selecione um arquivo PDF primeiro.");return}const v=o?o.value:"";if(!v){alert("Por favor, selecione um banco ou cartão de destino.");return}const x=p&&p.checked;let h="";if(x){if(h=d?d.value.trim():"",!h){alert("Por favor, insira sua Chave de API do Gemini para continuar.");return}u&&u.checked?localStorage.setItem("gemini_api_key",h):localStorage.removeItem("gemini_api_key")}s&&(s.style.display="block"),a.disabled=!0,a.innerHTML='<i class="fa-solid fa-circle-notch fa-spin"></i> Processando extrato...';try{c&&(c.textContent="Lendo e extraindo texto do arquivo PDF...");const w=await De(y);c&&(c.textContent=x?"Enviando texto para a IA...":"Processando transações localmente...");let S=[];if(x?S=await Me(w,h):S=Ae(w),S.length===0){alert("Nenhuma transação identificada no extrato PDF. Verifique se o PDF contém texto selecionável ou tente utilizar a opção com IA."),s&&(s.style.display="none"),a.disabled=!1,a.innerHTML='<i class="fa-solid fa-file-import"></i> Extrair Transações';return}const G=document.getElementById("bulk-rows-container");G&&(G.innerHTML=""),S.forEach(K=>{K.paymentMethod=v,window.addBulkRowWithData(K)});const W=document.getElementById("tab-tx-bulk");W&&W.click(),y=null,t.value="",n&&(n.style.display="none"),s&&(s.style.display="none"),a.disabled=!1,a.innerHTML='<i class="fa-solid fa-file-import"></i> Extrair Transações',alert(`${S.length} transação(ões) extraída(s) com sucesso! Revise os valores na aba "Lote" antes de salvar.`)}catch(w){console.error(w),alert(`Erro ao processar o extrato: ${w.message}`),s&&(s.style.display="none"),a.disabled=!1,a.innerHTML='<i class="fa-solid fa-file-import"></i> Extrair Transações'}})}async function De(e){if(typeof window.pdfjsLib>"u")throw new Error("Biblioteca PDF.js não foi carregada. Verifique sua conexão à internet.");return window.pdfjsLib.GlobalWorkerOptions.workerSrc="https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.4.120/pdf.worker.min.js",new Promise((t,n)=>{const r=new FileReader;r.onload=async function(){try{const o=new Uint8Array(this.result),a=await window.pdfjsLib.getDocument({data:o}).promise;let s="";for(let c=1;c<=a.numPages;c++){const u=(await(await a.getPage(c)).getTextContent()).items;let m=-1,p="";for(let f=0;f<u.length;f++){const g=u[f];m!==-1&&Math.abs(g.transform[5]-m)>5&&(p+=`
`),p+=g.str+" ",m=g.transform[5]}s+=p+`
`}t(s)}catch(o){n(o)}},r.onerror=o=>n(o),r.readAsArrayBuffer(e)})}function Ae(e){const t=e.split(`
`),n=[],r=/\b(\d{2})\/(\d{2})(?:\/(\d{2,4}))?\b/,o=/(?:R\$\s*)?(-?\b\d{1,3}(?:\.\d{3})*,\d{2}\b|-?\b\d+,\d{2}\b)\s*([CDcd\-+])?/;for(let a of t){if(a=a.trim(),!a)continue;const s=a.match(r);if(!s)continue;const c=a.match(o);if(!c)continue;const l=s[1],d=s[2];let u=s[3]||new Date().getFullYear().toString();u.length===2&&(u="20"+u);const m=`${u}-${d.padStart(2,"0")}-${l.padStart(2,"0")}`;let p=c[1].replace(/\./g,"").replace(",","."),f=parseFloat(p);if(isNaN(f))continue;let g="expense";const y=c[2];if(c[1].startsWith("-")||y==="-"||y&&y.toUpperCase()==="D")g="expense";else if(y==="+"||y&&y.toUpperCase()==="C")g="income";else{const w=a.toLowerCase();w.includes("recebido")||w.includes("depósito")||w.includes("credito")||w.includes("crédito")||w.includes("salário")||w.includes("estorno")||w.includes("transferência recebida")||w.includes("pix recebido")?g="income":g="expense"}if(f=Math.abs(f),f===0)continue;let v=a.replace(s[0],"").replace(c[0],"").replace(/\s+/g," ").trim();v=v.replace(/^[\s\-\|\,\.\:]+/,"").replace(/[\s\-\|\,\.\:]+$/,"").trim(),v||(v="Transação Extrato");let x="Outros";const h=v.toLowerCase();h.includes("mercado")||h.includes("supermercado")?x="Alimentação":h.includes("posto")||h.includes("combustivel")||h.includes("uber")?x="Transporte":h.includes("farmacia")||h.includes("drogaria")||h.includes("medico")?x="Saúde":h.includes("aluguel")||h.includes("condominio")||h.includes("luz")||h.includes("energia")||h.includes("agua")||h.includes("gás")?x="Moradia":(h.includes("restaurante")||h.includes("ifood")||h.includes("padaria")||h.includes("cafe"))&&(x="Alimentação"),n.push({date:m,description:v,amount:f,type:g,category:x})}return n}async function Me(e,t){var d,u,m,p,f,g;const n=`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${t}`,o={contents:[{parts:[{text:`Analise o extrato bancário em texto abaixo e extraia todas as transações (receitas e despesas).
Retorne APENAS um array JSON estruturado com o formato especificado no responseSchema.

Texto do extrato:
${e}`}]}],generationConfig:{responseMimeType:"application/json",responseSchema:{type:"OBJECT",properties:{transactions:{type:"ARRAY",description:"Lista de transações extraídas do extrato",items:{type:"OBJECT",properties:{date:{type:"STRING",description:"Data da transação no formato AAAA-MM-DD"},description:{type:"STRING",description:"Descrição limpa da transação"},amount:{type:"NUMBER",description:"Valor real absoluto positivo da transação"},type:{type:"STRING",enum:["expense","income"],description:"Tipo: expense para saída, income para entrada"},category:{type:"STRING",description:"Categoria da transação"}},required:["date","description","amount","type"]}}}}}},a=await fetch(n,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify(o)});if(!a.ok){const b=((d=(await a.json().catch(()=>({}))).error)==null?void 0:d.message)||`Status HTTP ${a.status}`;throw new Error(`Erro na API do Gemini: ${b}`)}const c=(g=(f=(p=(m=(u=(await a.json()).candidates)==null?void 0:u[0])==null?void 0:m.content)==null?void 0:p.parts)==null?void 0:f[0])==null?void 0:g.text;if(!c)throw new Error("Resposta vazia da API do Gemini.");return JSON.parse(c.trim()).transactions||[]}function $e(){const e=document.getElementById("form-settings-personal");e&&e.addEventListener("submit",async r=>{var s,c,l;if(r.preventDefault(),!i.currentUser)return;const o=e.querySelector('button[type="submit"]');o.disabled=!0;const a=document.getElementById("settings-personal-msg");try{const d=(s=document.getElementById("settings-name"))==null?void 0:s.value.trim(),u=(c=document.getElementById("settings-photo"))==null?void 0:c.value.trim(),m=document.getElementById("settings-avatar-file"),p=m?m.dataset.compressedUrl:null,f=(l=document.getElementById("settings-email"))==null?void 0:l.value.trim(),g=i.currentUser.uid;let y=u;p?(localStorage.setItem("contaComigo_customAvatar_"+g,p),y=`https://ui-avatars.com/api/?name=${encodeURIComponent(d||i.currentUser.email)}&background=6366f1&color=fff`):u&&(u.length>1500?(localStorage.setItem("contaComigo_customAvatar_"+g,u),y=`https://ui-avatars.com/api/?name=${encodeURIComponent(d||i.currentUser.email)}&background=6366f1&color=fff`):localStorage.removeItem("contaComigo_customAvatar_"+g)),await i.currentUser.updateProfile({displayName:d,photoURL:y}),f&&f!==i.currentUser.email&&await i.currentUser.updateEmail(f),E("profile-updated"),a&&(a.innerHTML="<span style='color:var(--success)'>Perfil atualizado com sucesso!</span>"),setTimeout(()=>{var b;a&&(a.innerHTML=""),(b=document.getElementById("modal-settings-personal"))==null||b.classList.remove("active")},1500)}catch(d){a&&(a.innerHTML=`<span style='color:var(--danger)'>${d.message}</span>`),d.code==="auth/requires-recent-login"&&(alert("Para alterar o e-mail, por segurança, é necessário fazer login novamente."),B.signOut())}finally{o.disabled=!1}});const t=document.getElementById("form-settings-security");t&&t.addEventListener("submit",async r=>{var s;if(r.preventDefault(),!i.currentUser)return;const o=t.querySelector('button[type="submit"]');o.disabled=!0;const a=document.getElementById("settings-security-msg");try{const c=(s=document.getElementById("settings-new-password"))==null?void 0:s.value;await i.currentUser.updatePassword(c),a&&(a.innerHTML="<span style='color:var(--success)'>Senha atualizada!</span>"),setTimeout(()=>{var l;a&&(a.innerHTML=""),(l=document.getElementById("modal-settings-security"))==null||l.classList.remove("active"),t.reset()},1500)}catch(c){a&&(a.innerHTML=`<span style='color:var(--danger)'>${c.message}</span>`),c.code==="auth/requires-recent-login"&&(alert("Para alterar a senha, faça login novamente."),B.signOut())}finally{o.disabled=!1}});const n=document.getElementById("form-settings-report");n&&n.addEventListener("submit",async r=>{var c,l;r.preventDefault();const o=(c=document.getElementById("report-text"))==null?void 0:c.value.trim();if(!o)return alert("Descreva o problema antes de enviar.");const a=i.currentUser?i.currentUser.email:"Anônimo",s=i.currentUser&&i.currentUser.displayName||"Usuário";try{await I.collection("support_reports").add({userId:i.currentUser?i.currentUser.uid:null,userEmail:a,userName:s,reportText:o,destinationEmail:"jessica.lopes93@hotmail.com",userAgent:navigator.userAgent,createdAt:firebase.firestore.FieldValue.serverTimestamp()}),alert("Obrigado! Seu relato foi registrado com sucesso e encaminhado ao suporte."),n.reset(),(l=document.getElementById("modal-settings-report"))==null||l.classList.remove("active")}catch(d){alert("Erro ao enviar relato: "+d.message)}})}window.editTransaction=e=>{const t=i.transactions.find(d=>d.id===e);if(!t)return;i.editingTransactionId=e;const n=document.getElementById("description"),r=document.getElementById("amount"),o=document.getElementById("date"),a=document.getElementById("category"),s=document.getElementById("payment-method");n&&(n.value=t.description),r&&(r.value=t.amount),o&&(o.value=t.date),R(),P(),a&&(a.value=t.category),s&&(s.value=t.paymentMethod);const c=document.querySelector("#transaction-modal h2");c&&(c.textContent="Editar Transação");const l=document.getElementById("transaction-modal");l&&l.classList.add("active")};window.deleteTransaction=async e=>{if(confirm("Excluir esta transação?"))try{await _.doc(e).delete(),E("transaction-deleted")}catch(t){alert("Erro ao excluir: "+t.message)}};window.deleteBank=async e=>{if(confirm("Excluir esta conta bancária?"))try{await j.doc(e).delete(),E("bank-deleted")}catch(t){alert("Erro ao excluir conta: "+t.message)}};window.deleteCard=async e=>{if(confirm("Excluir este cartão de crédito?"))try{await V.doc(e).delete(),E("card-deleted")}catch(t){alert("Erro ao excluir cartão: "+t.message)}};window.deleteGoal=async e=>{if(confirm("Excluir esta meta?"))try{await q.doc(e).delete(),E("goal-deleted")}catch(t){alert("Erro ao excluir meta: "+t.message)}};window.deleteCategory=async e=>{if(confirm("Excluir esta categoria?"))try{await z.doc(e).delete(),E("category-deleted")}catch(t){alert("Erro ao excluir categoria: "+t.message)}};window.deleteInvestment=async e=>{if(confirm("Excluir este investimento?"))try{await ne.doc(e).delete(),E("investment-deleted")}catch(t){alert("Erro ao excluir investimento: "+t.message)}};const N=I.collection("sessions");let O=null;function re(){let e=localStorage.getItem("contaComigo_sessionId");return e||(e="sess_"+Date.now().toString(36)+"_"+Math.random().toString(36).substr(2,6),localStorage.setItem("contaComigo_sessionId",e)),e}function ze(){const e=navigator.userAgent;let t="Navegador Desconhecido",n="Sistema Desconhecido",r="fa-laptop";return e.includes("Firefox/")?t="Firefox":e.includes("Edg/")?t="Microsoft Edge":e.includes("Chrome/")?t="Google Chrome":e.includes("Safari/")&&!e.includes("Chrome/")?t="Safari":(e.includes("OPR/")||e.includes("Opera/"))&&(t="Opera"),e.includes("Win")?n="Windows":e.includes("Mac")?n="macOS":e.includes("Android")?(n="Android",r="fa-mobile-screen-button"):e.includes("iPhone")||e.includes("iPad")?(n="iOS",r="fa-mobile-screen-button"):e.includes("Linux")&&(n="Linux"),{deviceName:`${t} em ${n}`,browser:t,os:n,icon:r}}async function Pe(e){if(!e)return;const t=re(),n=ze();try{await N.doc(t).set({userId:e,sessionId:t,deviceName:n.deviceName,browser:n.browser,os:n.os,icon:n.icon,lastActive:firebase.firestore.FieldValue.serverTimestamp(),createdAt:firebase.firestore.FieldValue.serverTimestamp()},{merge:!0}),Re(e,t)}catch(r){console.error("Erro ao registrar sessão:",r)}}function Re(e,t){O&&O(),O=N.where("userId","==",e).onSnapshot(n=>{let r=!1;const o=[];if(n.forEach(a=>{const s=a.data();a.id===t&&(r=!0),o.push({id:a.id,...s})}),n.size>0&&!r){alert("Sua sessão foi encerrada por outro dispositivo."),B.signOut();return}Ne(o,t)},n=>console.error("Erro ao escutar sessões:",n))}function Ne(e,t){const n=document.querySelector("#modal-settings-devices .modal-body");if(!n)return;if(!e||e.length===0){n.innerHTML=`
            <div style="text-align: center; padding: 24px; color: var(--text-muted);">
                <i class="fa-solid fa-laptop" style="font-size: 2rem; margin-bottom: 8px;"></i>
                <p>Nenhum dispositivo encontrado.</p>
            </div>
        `;return}let r=`
        <div style="display: flex; flex-direction: column; gap: 12px; margin-bottom: 20px; max-height: 350px; overflow-y: auto;">
    `;e.forEach(o=>{const a=o.id===t,s=o.icon||"fa-laptop";r+=`
            <div style="display: flex; align-items: center; padding: 12px 16px; border: 1px solid ${a?"var(--primary)":"var(--border)"}; border-radius: 10px; background: ${a?"var(--bg-secondary)":"var(--bg-card)"}; justify-content: space-between;">
                <div style="display: flex; align-items: center; gap: 14px;">
                    <div style="width: 40px; height: 40px; border-radius: 50%; background: var(--bg-body); display: flex; align-items: center; justify-content: center; font-size: 1.2rem; color: ${a?"var(--primary)":"var(--text-muted)"};">
                        <i class="fa-solid ${s}"></i>
                    </div>
                    <div>
                        <h4 style="margin: 0; font-size: 0.95rem;">${o.deviceName||"Navegador"} ${a?'<span style="font-size: 0.75rem; background: var(--primary); color: white; padding: 2px 6px; border-radius: 10px; margin-left: 6px;">Este Dispositivo</span>':""}</h4>
                        <p style="margin: 2px 0 0 0; font-size: 0.8rem; color: ${a?"var(--success)":"var(--text-muted)"};">
                            ${a?"● Ativo agora":"Dispositivo registrado"}
                        </p>
                    </div>
                </div>
                ${a?"":`
                    <button class="btn-icon" onclick="window.revokeSession('${o.id}')" title="Encerrar Sessão" style="color: var(--danger);">
                        <i class="fa-solid fa-right-from-bracket"></i>
                    </button>
                `}
            </div>
        `}),r+="</div>",e.length>1&&(r+=`
            <button type="button" class="btn btn-secondary w-100" onclick="window.revokeAllOtherSessions()">
                <i class="fa-solid fa-right-from-bracket"></i> Sair de todos os outros dispositivos
            </button>
        `),n.innerHTML=r}window.revokeSession=async e=>{if(confirm("Deseja desconectar este dispositivo?"))try{await N.doc(e).delete(),L("Dispositivo desconectado com sucesso!")}catch(t){alert("Erro ao encerrar sessão: "+t.message)}};window.revokeAllOtherSessions=async()=>{if(!i.currentUser||!confirm("Certeza que deseja encerrar a sessão em todos os outros dispositivos?"))return;const e=re();try{const t=await N.where("userId","==",i.currentUser.uid).get(),n=I.batch();let r=0;t.forEach(o=>{o.id!==e&&(n.delete(o.ref),r++)}),r>0?(await n.commit(),L(`${r} outro(s) dispositivo(s) desconectado(s)!`)):alert("Não há outros dispositivos conectados.")}catch(t){alert("Erro ao encerrar sessões: "+t.message)}};function Oe(){Ue(),ae(e=>{F()}),setTimeout(F,1e3)}function Ue(){const e=document.getElementById("notif-bell-btn"),t=document.getElementById("notif-dropdown");e&&t&&(e.addEventListener("click",r=>{r.stopPropagation(),t.classList.toggle("active")}),document.addEventListener("click",r=>{!t.contains(r.target)&&r.target!==e&&t.classList.remove("active")}));const n=document.getElementById("form-settings-notifications");n&&n.addEventListener("submit",async r=>{var a,s,c,l;r.preventDefault();const o=document.getElementById("notif-push");o&&o.checked&&"Notification"in window&&await Notification.requestPermission()!=="granted"&&(alert("Permissão de notificação negada pelo navegador. Ative as permissões nas configurações do navegador."),o.checked=!1),localStorage.setItem("contaComigo_notifEmail",(a=document.getElementById("notif-email"))==null?void 0:a.checked),localStorage.setItem("contaComigo_notifPush",(s=document.getElementById("notif-push"))==null?void 0:s.checked),localStorage.setItem("contaComigo_notifReports",(c=document.getElementById("notif-reports"))==null?void 0:c.checked),alert("Preferências de notificação salvas com sucesso!"),(l=document.getElementById("modal-settings-notifications"))==null||l.classList.remove("active"),F()})}function F(){if(!i.currentUser)return;const e=[],t=new Date,n=t.toISOString().slice(0,10),r=t.toISOString().slice(0,7),o=t.getDate();if(i.fixedTransactionsList.forEach(s=>{if(!(s.lastProcessedMonth===r)&&s.type==="expense"){const l=s.dayOfMonth-o;l===0?e.push({id:`fixed_${s.id}`,title:`⚠️ Conta a pagar hoje: ${s.description}`,desc:`Valor: ${A(s.amount)} (Vencimento Hoje - Dia ${s.dayOfMonth})`,urgency:"high"}):l>0&&l<=3&&e.push({id:`fixed_${s.id}`,title:`📅 Conta a vencer em ${l} dia(s): ${s.description}`,desc:`Valor: ${A(s.amount)} (Vencimento no dia ${s.dayOfMonth})`,urgency:"medium"})}}),i.cardsList.forEach(s=>{if(!(s.lastProcessedMonth===r)){const l=s.dueDay-o,d=i.transactions.filter(u=>u.paymentMethod===s.id&&u.date&&u.date.startsWith(r)).reduce((u,m)=>u+(m.type==="expense"?m.amount:-m.amount),0);d>0&&(l===0?e.push({id:`card_${s.id}`,title:`💳 Fatura do cartão ${s.nickname} vence HOJE!`,desc:`Valor a pagar: ${A(d)}`,urgency:"high"}):l>0&&l<=3&&e.push({id:`card_${s.id}`,title:`💳 Fatura do cartão ${s.nickname} vence em ${l} dia(s)`,desc:`Valor: ${A(d)} (Dia ${s.dueDay})`,urgency:"medium"}))}}),Fe(e),localStorage.getItem("contaComigo_notifPush")==="true"&&e.length>0&&"Notification"in window&&Notification.permission==="granted"){const s="contaComigo_lastPushDate";if(localStorage.getItem(s)!==n){const l=e.find(d=>d.urgency==="high")||e[0];new Notification(l.title,{body:l.desc,icon:"/img/ContaComigoPRO-logo-nobg-favicon.png"}),localStorage.setItem(s,n)}}}function Fe(e){const t=document.getElementById("notif-badge"),n=document.getElementById("notif-dropdown-content");if(t&&(e.length>0?(t.textContent=e.length,t.style.display="flex"):t.style.display="none"),n){if(e.length===0){n.innerHTML=`
                <div style="padding: 20px; text-align: center; color: var(--text-muted); font-size: 0.85rem;">
                    <i class="fa-regular fa-bell-slash" style="font-size: 1.5rem; margin-bottom: 6px; display: block;"></i>
                    Nenhuma notificação ou pendência no momento.
                </div>
            `;return}let r="";e.forEach(o=>{const a=o.urgency==="high";r+=`
                <div style="padding: 12px; border-bottom: 1px solid var(--border); background: ${a?"var(--danger-bg, rgba(239, 68, 68, 0.05))":"transparent"};">
                    <p style="margin: 0; font-weight: 600; font-size: 0.85rem; color: ${a?"var(--danger)":"var(--text-main)"};">${o.title}</p>
                    <p style="margin: 4px 0 0 0; font-size: 0.8rem; color: var(--text-muted);">${o.desc}</p>
                </div>
            `}),n.innerHTML=r}}const M=document.getElementById("auth-overlay"),$=document.getElementById("app-wrapper"),Y=document.getElementById("btn-google-login"),Q=document.getElementById("form-auth-email"),X=document.getElementById("btn-logout"),Z=document.getElementById("user-name"),ee=document.getElementById("user-email"),te=document.getElementById("user-avatar");document.addEventListener("DOMContentLoaded",()=>{ie(),qe(),Ge(),Be(),Oe(),ae(e=>{e==="profile-updated"&&ce()})});function ie(){const e=document.getElementById("current-date");if(e){const t=new Date().toLocaleDateString("pt-BR",{weekday:"long",year:"numeric",month:"long",day:"numeric"}).replace(/^\w/,n=>n.toUpperCase());e.textContent=t}}function qe(){B.onAuthStateChanged(e=>{e?(i.currentUser=e,M&&M.classList.remove("active"),$&&($.style.display="flex"),ce(),ie(),Pe(e.uid),je(),oe("page-dashboard")):(i.currentUser=null,$&&($.style.display="none"),M&&M.classList.add("active"),He())}),Y&&Y.addEventListener("click",()=>{B.signInWithPopup(new firebase.auth.GoogleAuthProvider).catch(e=>L(e.message,!0))}),Q&&Q.addEventListener("submit",async e=>{var r,o;e.preventDefault();const t=(r=document.getElementById("auth-email"))==null?void 0:r.value.trim(),n=(o=document.getElementById("auth-password"))==null?void 0:o.value;if(!t||!n)return L("Preencha todos os campos.",!0);L("Autenticando...");try{await B.signInWithEmailAndPassword(t,n)}catch(a){if(a.code==="auth/user-not-found"||a.code==="auth/invalid-credential")try{await B.createUserWithEmailAndPassword(t,n)}catch(s){L(s.message,!0)}else L(a.message,!0)}}),X&&X.addEventListener("click",()=>B.signOut())}function ce(){if(!i.currentUser)return;const e=localStorage.getItem("contaComigo_customAvatar_"+i.currentUser.uid),t=`https://ui-avatars.com/api/?name=${encodeURIComponent(i.currentUser.displayName||i.currentUser.email)}&background=6366f1&color=fff`,n=i.currentUser.displayName||"Usuário Vazio",r=e||i.currentUser.photoURL||t;Z&&(Z.textContent=n),ee&&(ee.textContent=i.currentUser.email),te&&(te.src=r)}let U=!1;async function Ve(e){if(!U){U=!0;try{if((await z.where("userId","==",e).get()).empty){const n=I.batch();H.forEach(r=>{const o=z.doc();n.set(o,{userId:e,name:r.name,icon:r.icon})}),await n.commit()}}catch(t){console.error("Erro ao verificar categorias padrão:",t)}finally{U=!1}}}function je(){const e=i.currentUser.uid;i.unsTx=_.where("userId","==",e).orderBy("date","desc").onSnapshot(t=>{i.transactions=[],t.forEach(n=>i.transactions.push({id:n.id,...n.data()})),E("transactions-updated")}),i.unsCards=V.where("userId","==",e).onSnapshot(t=>{i.cardsList=[],t.forEach(n=>i.cardsList.push({id:n.id,...n.data()})),P(),E("cards-updated")}),i.unsBanks=j.where("userId","==",e).onSnapshot(t=>{i.banksList=[],t.forEach(n=>i.banksList.push({id:n.id,...n.data()})),P(),E("banks-updated")}),i.unsGoals=q.where("userId","==",e).onSnapshot(t=>{i.goalsList=[],t.forEach(n=>i.goalsList.push({id:n.id,...n.data()})),se(),E("goals-updated")}),i.unsCategories=z.where("userId","==",e).onSnapshot(async t=>{if(t.empty){await Ve(e);return}i.categoriesList=[],t.forEach(n=>i.categoriesList.push({id:n.id,...n.data()})),R(),E("categories-updated")}),i.unsFixed=de.where("userId","==",e).onSnapshot(t=>{i.fixedTransactionsList=[],t.forEach(n=>i.fixedTransactionsList.push({id:n.id,...n.data()})),E("fixed-updated")}),i.unsInvestments=ne.where("userId","==",e).onSnapshot(t=>{i.investmentsList=[],t.forEach(n=>i.investmentsList.push({id:n.id,...n.data()})),E("investments-updated")})}function He(){i.unsTx&&i.unsTx(),i.unsCards&&i.unsCards(),i.unsBanks&&i.unsBanks(),i.unsGoals&&i.unsGoals(),i.unsCategories&&i.unsCategories(),i.unsFixed&&i.unsFixed(),i.unsInvestments&&i.unsInvestments()}function Ge(){document.querySelectorAll("#nav-menu a[data-page]").forEach(s=>{s.addEventListener("click",c=>{c.preventDefault();const l=s.dataset.page;oe(l),window.innerWidth<=768&&a()})});const t=document.getElementById("mobile-menu-btn"),n=document.querySelector(".sidebar"),r=document.getElementById("sidebar-overlay");function o(){n&&n.classList.toggle("open"),r&&r.classList.toggle("active")}function a(){n&&n.classList.remove("open"),r&&r.classList.remove("active")}t&&t.addEventListener("click",o),r&&r.addEventListener("click",a)}export{ae as a,Ke as b,We as c,A as f,Je as g,oe as n,i as s};

import{s as n,f as u,c as k,a as E}from"./index-BZKSQWFW.js";function F(){w(),E(()=>{var a;(a=document.getElementById("page-bancos"))!=null&&a.classList.contains("active")&&w()})}function w(){const a=document.getElementById("banks-list");if(a){if(n.currentBankFilter.id){$(n.currentBankFilter.id);return}if(a.innerHTML="",n.banksList.length===0){a.innerHTML='<div class="empty-state w-100" style="grid-column: 1/-1;"><i class="fa-solid fa-building-columns"></i><p>Nenhuma conta bancária cadastrada.</p></div>';return}n.banksList.forEach(t=>{const s=n.transactions.filter(i=>i.paymentMethod===t.id),o=s.filter(i=>i.type==="income").reduce((i,d)=>i+d.amount,0),r=s.filter(i=>i.type==="expense").reduce((i,d)=>i+d.amount,0),f=(t.balance||0)+o-r,v=f<0?"var(--danger)":"var(--text-main)";a.innerHTML+=`
            <div class="card bank-card" style="padding: 16px; border-top: 4px solid ${t.color}; cursor: pointer; position: relative;" onclick="window.expandBank('${t.id}')" data-bank-id="${t.id}">
                <button class="btn-icon" style="position: absolute; right: 40px; top: 8px;" onclick="event.stopPropagation(); window.editBank('${t.id}')" title="Editar Banco"><i class="fa-solid fa-pen" style="font-size:0.9rem;"></i></button>
                <button class="btn-icon" style="position: absolute; right: 8px; top: 8px;" onclick="event.stopPropagation(); window.deleteBank('${t.id}')" title="Excluir Banco"><i class="fa-solid fa-trash" style="font-size:0.9rem;"></i></button>
                <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom: 12px;">
                    <div style="font-weight: 600; font-size: 1.1rem; display:flex; align-items:center; gap:8px;">
                        <i class="fa-solid fa-building-columns" style="color: ${t.color}"></i> ${t.name}
                    </div>
                </div>
                <div style="margin-bottom: 8px;">
                    <span style="color: var(--text-muted); font-size: 0.8rem; display:block;">Saldo Atual</span>
                    <span style="font-weight: 700; font-size: 1.2rem; color: ${v}" class="bank-balance-value" data-bank-id="${t.id}">${u(f)}</span>
                </div>
                <div style="font-size: 0.8rem; color: var(--text-muted);">
                    Saldo Inicial: ${u(t.balance||0)}
                </div>
                <div style="font-size: 0.7rem; color: var(--text-muted); margin-top: 4px;">
                    <i class="fa-regular fa-clock"></i> ${s.length} transações
                </div>
            </div>
        `})}}function $(a){const t=n.banksList.find(l=>l.id===a),s=document.getElementById("banks-list");if(!t||!s)return;s.innerHTML="";const o=n.transactions.filter(l=>l.paymentMethod===t.id),r=o.filter(l=>l.type==="income").reduce((l,p)=>l+p.amount,0),f=o.filter(l=>l.type==="expense").reduce((l,p)=>l+p.amount,0),v=(t.balance||0)+r-f,i=v<0?"var(--danger)":"var(--text-main)",d=n.currentBankFilter.id===a?n.currentBankFilter.startDate:"",y=n.currentBankFilter.id===a?n.currentBankFilter.endDate:"",c=new Date,g=`${c.toISOString().slice(0,7)}-01`,x=c.toISOString().slice(0,10);if(s.innerHTML+=`
        <div class="card w-100" style="grid-column: 1/-1; border-top: 4px solid ${t.color}; padding: 16px; margin-bottom: 16px;">
            <div style="display: flex; align-items: center; gap: 12px; margin-bottom: 16px; flex-wrap: wrap;">
                <button class="btn btn-secondary" onclick="window.closeExpandedBank()" style="padding: 6px 12px; font-size: 0.85rem; display: flex; align-items: center; gap: 6px;">
                    <i class="fa-solid fa-arrow-left"></i> Voltar
                </button>
                <span style="font-size: 0.85rem; color: var(--text-muted);">Voltar para todos os bancos</span>
                <div style="flex: 1;"></div>
                <button class="btn btn-outline" onclick="window.setBankFilterToMonth('${t.id}')" style="padding: 6px 12px; font-size: 0.85rem;">
                    <i class="fa-regular fa-calendar"></i> Mês Atual
                </button>
                <button class="btn btn-outline" onclick="window.clearBankFilters('${t.id}')" style="padding: 6px 12px; font-size: 0.85rem;">
                    <i class="fa-solid fa-eraser"></i> Limpar
                </button>
                <button class="btn btn-primary" onclick="window.generateBankReport('${t.id}')" style="padding: 6px 12px; font-size: 0.85rem;">
                    <i class="fa-solid fa-print"></i> Gerar Relatório
                </button>
            </div>
            
            <div style="display:flex; justify-content:space-between; align-items:center; flex-wrap: wrap; gap: 12px;">
                <div style="display:flex; gap: 16px; align-items:center;">
                    <i class="fa-solid fa-building-columns" style="font-size: 2rem; color: ${t.color}"></i>
                    <div>
                        <h3 style="margin: 0;">${t.name}</h3>
                        <p style="color: var(--text-muted); margin: 0; font-size: 0.9rem;">Saldo Inicial: ${u(t.balance||0)}</p>
                    </div>
                </div>
                <div style="text-align: right;">
                    <p style="color: var(--text-muted); margin: 0; font-size: 0.9rem;">Saldo Atual</p>
                    <h2 style="margin: 0; color: ${i}" id="bank-current-balance-${t.id}">${u(v)}</h2>
                </div>
            </div>
            
            <div class="filter-container mt-3" style="background:var(--bg-body); padding:12px; border-radius:8px;">
                <div style="display:flex; gap:12px; align-items:center; flex-wrap:wrap;">
                    <label style="font-size: 0.85rem; color: var(--text-muted); font-weight: 500;">Período:</label>
                    <input type="date" id="bank-filter-start" class="form-input" title="Início" onchange="window.filterBankExtract('${t.id}')" value="${d}" style="width: 150px;">
                    <span style="color: var(--text-muted);">até</span>
                    <input type="date" id="bank-filter-end" class="form-input" title="Fim" onchange="window.filterBankExtract('${t.id}')" value="${y}" style="width: 150px;">
                    <div style="flex: 1;"></div>
                    <button class="btn btn-outline" style="margin-left: auto;" onclick="window.editBank('${t.id}')"><i class="fa-solid fa-pen"></i> Editar</button>
                    <button class="btn btn-outline" style="border-color: var(--danger); color: var(--danger);" onclick="window.deleteBank('${t.id}')"><i class="fa-solid fa-trash"></i> Excluir</button>
                </div>
            </div>
        </div>
        
        <div class="w-100" style="grid-column: 1/-1;">
            <div class="transactions-list" id="inline-bank-transactions"></div>
        </div>
    `,!d&&!y){const l=document.getElementById("bank-filter-start"),p=document.getElementById("bank-filter-end");l&&(l.value=g),p&&(p.value=x)}b(t.id)}function b(a){var l,p;const t=document.getElementById("inline-bank-transactions");if(!t)return;n.currentBankFilter.id=a,n.currentBankFilter.startDate=((l=document.getElementById("bank-filter-start"))==null?void 0:l.value)||"",n.currentBankFilter.endDate=((p=document.getElementById("bank-filter-end"))==null?void 0:p.value)||"";const s=n.currentBankFilter.startDate,o=n.currentBankFilter.endDate,r=n.banksList.find(e=>e.id===a);if(!r)return;let f=n.transactions.filter(e=>e.paymentMethod===a);const v=[...f].sort((e,m)=>e.date.localeCompare(m.date));let i=r.balance||0,d=0,y=0;o?v.forEach(e=>{e.date<=o&&(e.type==="income"?(i+=e.amount,d+=e.amount):(i-=e.amount,y+=e.amount))}):v.forEach(e=>{e.type==="income"?(i+=e.amount,d+=e.amount):(i-=e.amount,y+=e.amount)});let c=f;s&&(c=c.filter(e=>e.date>=s)),o&&(c=c.filter(e=>e.date<=o)),c.sort((e,m)=>e.date.localeCompare(m.date)),t.innerHTML="",c.length===0?t.innerHTML='<div class="empty-state"><i class="fa-solid fa-receipt"></i><p>Nenhuma transação encontrada no período.</p></div>':c.forEach(e=>{const m=e.type==="income",h=m?"+":"-";t.innerHTML+=`
                <div class="transaction-item">
                    <div class="tx-left">
                        <div class="tx-icon ${m?"income":"expense"}"><i class="fa-solid ${m?"fa-arrow-up":"fa-arrow-down"}"></i></div>
                        <div class="tx-details">
                            <p class="tx-title">${e.description}</p>
                            <p class="tx-category">${e.category||"Geral"}</p>
                        </div>
                    </div>
                    <div class="tx-right">
                        <p class="tx-amount ${m?"positive":"negative"}">${h} ${u(e.amount)}</p>
                        <p class="tx-date">${k(e.date)}</p>
                    </div>
                </div>`});const B=s&&o?`${k(s)} a ${k(o)}`:"Todo o período",g=i>=0?"var(--success)":"var(--danger)",x=`
        <div class="bank-extract-summary">
            <div class="summary-item">
                <span class="label">📅 Período</span>
                <span class="value period">${B}</span>
            </div>
            <div class="summary-item">
                <span class="label">💰 Saldo Inicial</span>
                <span class="value initial">${u(r.balance||0)}</span>
            </div>
            <div class="summary-item">
                <span class="label">📈 Receitas</span>
                <span class="value positive">+ ${u(d)}</span>
            </div>
            <div class="summary-item">
                <span class="label">📉 Despesas</span>
                <span class="value negative">- ${u(y)}</span>
            </div>
            <div class="summary-item highlight">
                <span class="label">🏦 Saldo Final</span>
                <span class="value final" style="color: ${g};">${u(i)}</span>
            </div>
        </div>
    `;t.insertAdjacentHTML("afterbegin",x)}window.expandBank=$;window.filterBankExtract=b;window.closeExpandedBank=()=>{n.currentBankFilter.id=null,w()};window.setBankFilterToMonth=a=>{const t=new Date,s=t.toISOString().slice(0,7),o=document.getElementById("bank-filter-start"),r=document.getElementById("bank-filter-end");o&&(o.value=`${s}-01`),r&&(r.value=t.toISOString().slice(0,10)),b(a)};window.clearBankFilters=a=>{const t=document.getElementById("bank-filter-start"),s=document.getElementById("bank-filter-end");t&&(t.value=""),s&&(s.value=""),b(a)};export{$ as expandBank,b as filterBankExtract,F as initView,w as renderView};

import{a as z,s as i,f as p,b as k,c as F}from"./index-BZKSQWFW.js";function j(){v(),z(()=>{var t;(t=document.getElementById("page-cartoes"))!=null&&t.classList.contains("active")&&v()})}function v(){const t=document.getElementById("cards-list");if(t){if(t.innerHTML="",i.cardsList.length===0){t.innerHTML='<div class="empty-state w-100" style="grid-column: 1/-1;"><i class="fa-solid fa-credit-card"></i><p>Nenhum cartão cadastrado.</p></div>';return}if(i.expandedCardId){const a=i.cardsList.find(e=>e.id===i.expandedCardId);if(a){L(a,t);return}else i.expandedCardId=null}D(t)}}function D(t){const a=new Date().toISOString().slice(0,7);i.cardsList.forEach(e=>{const r=i.transactions.filter(c=>c.paymentMethod===e.id&&c.date&&c.date.startsWith(a)).reduce((c,s)=>c+(s.type==="expense"?s.amount:-s.amount),0),l=e.limit-Math.max(r,0);t.innerHTML+=`
            <div class="card credit-card-card" style="padding: 16px; border-top: 4px solid var(--primary); position: relative; cursor: pointer;" onclick="window.toggleCardExtract('${e.id}', event)">
                <button class="btn-icon" style="position: absolute; right: 40px; top: 8px;" onclick="event.stopPropagation(); window.editCard('${e.id}')" title="Editar Cartão"><i class="fa-solid fa-pen" style="font-size:0.9rem;"></i></button>
                <button class="btn-icon" style="position: absolute; right: 8px; top: 8px;" onclick="event.stopPropagation(); window.deleteCard('${e.id}')" title="Excluir Cartão"><i class="fa-solid fa-trash" style="font-size:0.9rem;"></i></button>
                
                <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom: 12px;">
                    <div style="font-weight: 600; font-size: 1.1rem; display:flex; align-items:center; gap:8px;">
                        <i class="fa-solid fa-credit-card" style="color: var(--primary)"></i> ${e.nickname}
                    </div>
                </div>
                <p style="color: var(--text-muted); font-size: 0.85rem; margin-bottom: 8px;">Instituição: <strong>${e.bank}</strong></p>
                
                <div style="margin-bottom: 8px;">
                    <span style="color: var(--text-muted); font-size: 0.8rem; display:block;">Fatura Estimada (Mês ${a.slice(5)})</span>
                    <span style="font-weight: 700; font-size: 1.2rem; color: var(--danger);">${p(Math.max(r,0))}</span>
                </div>
                
                <div style="display:flex; justify-content:space-between; font-size: 0.8rem; color: var(--text-muted); margin-bottom: 12px;">
                    <span>Limite: ${p(e.limit)}</span>
                    <span>Disponível: ${p(l)}</span>
                </div>
                
                <div style="display:flex; gap: 8px;">
                    <button class="btn btn-outline w-100" onclick="event.stopPropagation(); window.toggleCardExtract('${e.id}')">
                        <i class="fa-solid fa-list-check"></i> Ver Extrato / Fatura
                    </button>
                </div>
            </div>
        `})}function L(t,a){const r=new Date().toISOString().slice(0,7),l=i.currentCardFilter.id===t.id?i.currentCardFilter.search:"",c=i.currentCardFilter.id===t.id?i.currentCardFilter.startDate:"",s=i.currentCardFilter.id===t.id?i.currentCardFilter.endDate:"",d=i.currentCardFilter.id===t.id?i.currentCardFilter.month:r;a.innerHTML=`
        <div class="card w-100" style="grid-column: 1/-1; border-top: 4px solid var(--primary); padding: 20px; margin-bottom: 16px;">
            <div style="display: flex; align-items: center; gap: 12px; margin-bottom: 16px; flex-wrap: wrap;">
                <button class="btn btn-secondary" onclick="window.closeCardExtract()" style="padding: 6px 12px; font-size: 0.85rem; display: flex; align-items: center; gap: 6px;">
                    <i class="fa-solid fa-arrow-left"></i> Voltar
                </button>
                <span style="font-size: 0.85rem; color: var(--text-muted);">Voltar para a lista de cartões</span>
                <div style="flex: 1;"></div>
                <button class="btn btn-primary" id="btn-pay-invoice-${t.id}" style="display: none; padding: 6px 12px; font-size: 0.85rem;">
                    <i class="fa-solid fa-money-check-dollar"></i> Pagar Fatura
                </button>
                <button class="btn btn-outline" onclick="window.generateCardReport('${t.id}')" style="padding: 6px 12px; font-size: 0.85rem;">
                    <i class="fa-solid fa-print"></i> Imprimir Extrato
                </button>
            </div>
            
            <div style="display:flex; justify-content:space-between; align-items:center; flex-wrap: wrap; gap: 12px; margin-bottom: 16px;">
                <div style="display:flex; gap: 16px; align-items:center;">
                    <i class="fa-solid fa-credit-card" style="font-size: 2.2rem; color: var(--primary)"></i>
                    <div>
                        <h3 style="margin: 0; font-size: 1.3rem;">${t.nickname} <span style="font-size: 0.9rem; font-weight: normal; color: var(--text-muted);">(${t.bank})</span></h3>
                        <p style="color: var(--text-muted); margin: 2px 0 0 0; font-size: 0.85rem;">
                            Fechamento: Dia <strong>${t.closingDay}</strong> | Vencimento: Dia <strong>${t.dueDay}</strong>
                        </p>
                    </div>
                </div>
                <div style="text-align: right;">
                    <p style="color: var(--text-muted); margin: 0; font-size: 0.85rem;">Limite Total</p>
                    <h3 style="margin: 0; color: var(--text-main);">${p(t.limit)}</h3>
                </div>
            </div>

            <!-- Filtros de Extrato de Cartão -->
            <div class="filter-container" style="background: var(--bg-body); padding: 12px; border-radius: 8px; border: 1px solid var(--border); margin-bottom: 16px;">
                <div style="display: flex; gap: 10px; align-items: center; flex-wrap: wrap;">
                    <div style="display: flex; align-items: center; gap: 6px;">
                        <label for="cc-filter-month" style="font-size: 0.85rem; color: var(--text-muted); font-weight: 500;">Mês da Fatura:</label>
                        <input type="month" id="cc-filter-month" class="form-input" style="width: 150px; padding: 6px 10px; font-size: 0.85rem;" value="${d}" onchange="window.filterCardExtract('${t.id}')">
                    </div>
                    <input type="text" id="cc-filter-search" class="form-input" placeholder="Buscar no extrato..." value="${l}" oninput="window.filterCardExtract('${t.id}')" style="flex: 1; min-width: 160px; padding: 6px 10px; font-size: 0.85rem;">
                    <input type="date" id="cc-filter-start" class="form-input" title="Data Inicial" value="${c}" onchange="window.filterCardExtract('${t.id}')" style="width: 130px; padding: 6px 10px; font-size: 0.85rem;">
                    <span style="color: var(--text-muted); font-size: 0.85rem;">até</span>
                    <input type="date" id="cc-filter-end" class="form-input" title="Data Final" value="${s}" onchange="window.filterCardExtract('${t.id}')" style="width: 130px; padding: 6px 10px; font-size: 0.85rem;">
                    <button class="btn btn-outline" onclick="window.clearCardFilters('${t.id}')" style="padding: 6px 10px; font-size: 0.85rem;">
                        <i class="fa-solid fa-eraser"></i>
                    </button>
                </div>
            </div>

            <!-- Lista de Transações do Cartão -->
            <div class="transactions-list" id="inline-card-transactions"></div>
        </div>
    `,setTimeout(()=>window.filterCardExtract(t.id),50)}window.toggleCardExtract=(t,a)=>{a&&a.target.closest("button")||(i.expandedCardId=i.expandedCardId===t?null:t,v())};window.closeCardExtract=()=>{i.expandedCardId=null,v()};window.clearCardFilters=t=>{const a=document.getElementById("cc-filter-search"),e=document.getElementById("cc-filter-start"),r=document.getElementById("cc-filter-end");a&&(a.value=""),e&&(e.value=""),r&&(r.value=""),window.filterCardExtract(t)};function T(t,a){if(!t)return"";const e=new Date(t+"T00:00:00");let r=e.getFullYear(),l=e.getMonth()+1;return e.getDate()>=a&&(l++,l>12&&(l=1,r++)),`${r}-${l.toString().padStart(2,"0")}`}window.getInvoiceMonth=T;window.filterCardExtract=t=>{var $,C,E,I;const a=document.getElementById("inline-card-transactions");if(!a)return;const e=i.cardsList.find(n=>n.id===t);if(!e)return;i.currentCardFilter.id=t,i.currentCardFilter.search=(($=document.getElementById("cc-filter-search"))==null?void 0:$.value)||"",i.currentCardFilter.startDate=((C=document.getElementById("cc-filter-start"))==null?void 0:C.value)||"",i.currentCardFilter.endDate=((E=document.getElementById("cc-filter-end"))==null?void 0:E.value)||"",i.currentCardFilter.month=((I=document.getElementById("cc-filter-month"))==null?void 0:I.value)||"";const r=i.currentCardFilter.search.toLowerCase(),l=i.currentCardFilter.startDate,c=i.currentCardFilter.endDate,s=i.currentCardFilter.month;let d=i.transactions.filter(n=>n.paymentMethod===t);r&&(d=d.filter(n=>n.description.toLowerCase().includes(r)||n.category.toLowerCase().includes(r))),l&&(d=d.filter(n=>n.date>=l)),c&&(d=d.filter(n=>n.date<=c)),s&&(d=d.filter(n=>window.getInvoiceMonth(n.date,e.closingDay)===s));const h=d.filter(n=>n.type==="expense").reduce((n,g)=>n+g.amount,0),b=d.filter(n=>n.type==="income").reduce((n,g)=>n+g.amount,0),y=h-b;let m=0,x=0;i.transactions.filter(n=>n.paymentMethod===t).forEach(n=>{if(n.type==="income")x+=n.amount;else{const g=window.getInvoiceMonth(n.date,e.closingDay);s?g<=s&&(m+=n.amount):m+=n.amount}});const f=m-x,o=s&&f<=0&&m>0?'<span style="background: var(--success); color: white; padding: 4px 8px; border-radius: 4px; font-size: 0.8rem; margin-left: 12px;"><i class="fa-solid fa-check-double"></i> Fatura Paga</span>':s&&m>0?'<span style="background: var(--warning); color: white; padding: 4px 8px; border-radius: 4px; font-size: 0.8rem; margin-left: 12px;"><i class="fa-solid fa-clock"></i> Em Aberto</span>':"";if(P(d,a),d.length>0||m>0){const n=s?`Resumo da Fatura (${s})${o}`:"Resumo Filtrado:",g=s?`Mês: ${B(s)}`:"Sem filtro de mês";let M=`
            <div style="padding: 16px; margin-bottom: 16px; background: var(--bg-body); border-radius: 8px; border: 1px solid var(--border);">
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px;">
                    <span style="font-weight: 600; font-size: 1rem;">${n}</span>
                    <span style="font-size: 0.8rem; color: var(--text-muted);">${g}</span>
                </div>
                <div style="display: flex; justify-content: space-between; align-items: center; font-size: 0.85rem; color: var(--text-muted); margin-bottom: 4px;">
                    <span>Total de lançamentos no período:</span>
                    <span style="color: ${y>0?"var(--danger)":"var(--success)"}; font-weight: 600;">${p(Math.abs(y))}</span>
                </div>
                ${s?`
                <div style="display: flex; justify-content: space-between; align-items: center; font-size: 1.05rem; font-weight: 700; margin-top: 8px; padding-top: 8px; border-top: 1px dashed var(--border);">
                    <span>Restante a Pagar (Fatura):</span>
                    <span style="color: ${f>0?"var(--danger)":"var(--success)"};">${p(Math.max(0,f))}</span>
                </div>
                `:""}
            </div>
        `;a.insertAdjacentHTML("afterbegin",M)}const u=document.getElementById(`btn-pay-invoice-${t}`);u&&(s&&f>0?(u.style.display="flex",u.onclick=()=>{window.launchCardFatura?window.launchCardFatura(t,f):alert(`Fatura a pagar: ${p(f)}`)}):u.style.display="none")};function P(t,a){if(a){if(a.innerHTML="",t.length===0){a.innerHTML='<div class="empty-state" style="padding: 24px; text-align: center;"><i class="fa-solid fa-receipt"></i><p>Nenhuma transação nesta fatura.</p></div>';return}t.forEach(e=>{const r=e.type==="income",l=r?"+":"-";a.innerHTML+=`
            <div class="transaction-item">
                <div class="tx-left">
                    <div class="tx-icon ${r?"income":"expense"}"><i class="fa-solid ${r?"fa-arrow-up":"fa-arrow-down"}"></i></div>
                    <div class="tx-details">
                        <p class="tx-title">${e.description}</p>
                        <p class="tx-category"><i class="fa-solid ${k(e.category)}"></i> ${e.category}</p>
                    </div>
                </div>
                <div class="tx-right">
                    <p class="tx-amount ${r?"positive":"negative"}">${l} ${p(e.amount)}</p>
                    <p class="tx-date">${F(e.date)}</p>
                </div>
                <div class="tx-actions" style="display:flex; gap: 8px;">
                    <button class="btn-icon" onclick="window.editTransaction('${e.id}')" title="Editar"><i class="fa-solid fa-pen"></i></button>
                    <button class="btn-icon" onclick="window.deleteTransaction('${e.id}')" title="Excluir"><i class="fa-solid fa-trash"></i></button>
                </div>
            </div>`})}}function B(t){if(!t)return"";const[a,e]=t.split("-");return`${["Janeiro","Fevereiro","Março","Abril","Maio","Junho","Julho","Agosto","Setembro","Outubro","Novembro","Dezembro"][parseInt(e)-1]} ${a}`}window.generateCardReport=t=>{var w;const a=i.cardsList.find(o=>o.id===t);if(!a)return;const e=(w=document.getElementById("cc-filter-month"))==null?void 0:w.value;if(!e){alert("Por favor, selecione um mês de fatura.");return}let r=i.transactions.filter(o=>o.paymentMethod===t);r=r.filter(o=>window.getInvoiceMonth(o.date,a.closingDay)===e),r.sort((o,u)=>new Date(o.date)-new Date(u.date));let l=0,c=0;i.transactions.filter(o=>o.paymentMethod===t).forEach(o=>{o.type==="income"?c+=o.amount:window.getInvoiceMonth(o.date,a.closingDay)<=e&&(l+=o.amount)});const s=l-c,d=s<=0&&l>0,h=d?"Fatura Paga":"Em Aberto",[b,y]=e.split("-"),m=`Fatura: ${y}/${b}`,x=window.open("","_blank");if(!x)return alert("Por favor, permita pop-ups para gerar o relatório.");let f=`
    <html>
    <head>
        <title>Relatório de Fatura - ${a.nickname}</title>
        <style>
            @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');
            body { font-family: 'Inter', sans-serif; color: #1e293b; padding: 40px; }
            .header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 40px; border-bottom: 2px solid #e2e8f0; padding-bottom: 20px; }
            .card-details h2 { margin: 0 0 5px 0; color: #0f172a; }
            .card-details p { margin: 2px 0; color: #64748b; font-size: 0.95rem; }
            .invoice-summary { background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 20px; margin-bottom: 30px; display: flex; justify-content: space-between; align-items: center; }
            .invoice-summary h3 { margin: 0; font-size: 1.5rem; color: #0f172a; }
            .invoice-summary p { margin: 4px 0 0 0; color: #64748b; }
            .status-tag { margin-top: 8px; display: inline-block; padding: 4px 8px; border-radius: 4px; font-size: 0.85rem; font-weight: 600; background: ${d?"#dcfce7":"#fef9c3"}; color: ${d?"#166534":"#854d0e"}; border: 1px solid ${d?"#bbf7d0":"#fef08a"}; }
            .total { font-size: 1.8rem; font-weight: 700; color: ${d?"#10b981":"#ef4444"}; text-align: right; }
            table { width: 100%; border-collapse: collapse; margin-bottom: 40px; }
            th, td { padding: 12px 15px; text-align: left; border-bottom: 1px solid #e2e8f0; }
            th { background: #f1f5f9; font-weight: 600; color: #475569; }
            .amount { text-align: right; font-weight: 500; }
            .expense { color: #ef4444; }
            .income { color: #10b981; }
            .footer { text-align: center; margin-top: 50px; color: #94a3b8; font-size: 0.85rem; border-top: 1px solid #e2e8f0; padding-top: 20px; }
        </style>
    </head>
    <body>
        <div class="header">
            <div class="card-details">
                <h2>Extrato de Cartão de Crédito</h2>
                <p><strong>Cartão:</strong> ${a.nickname}</p>
                <p><strong>Banco:</strong> ${a.bank}</p>
                <p><strong>Fechamento:</strong> Dia ${a.closingDay}</p>
                <p><strong>Vencimento:</strong> Dia ${a.dueDay}</p>
            </div>
        </div>

        <div class="invoice-summary">
            <div>
                <h3>${m}</h3>
                <span class="status-tag">${h}</span>
            </div>
            <div class="total">
                <div style="font-size: 0.9rem; color: #64748b; font-weight: 400; margin-bottom: 4px;">Restante a Pagar</div>
                ${p(Math.max(0,s))}
            </div>
        </div>

        <table>
            <thead>
                <tr>
                    <th>Data</th>
                    <th>Descrição</th>
                    <th>Categoria</th>
                    <th style="text-align: right;">Valor</th>
                </tr>
            </thead>
            <tbody>
                ${r.length>0?r.map(o=>`
                    <tr>
                        <td>${F(o.date)}</td>
                        <td>${o.description}</td>
                        <td>${o.category}</td>
                        <td style="text-align: right; color: ${o.type==="income"?"#10b981":"#ef4444"}; font-weight: 600;">
                            ${o.type==="income"?"+":"-"} ${p(o.amount)}
                        </td>
                    </tr>
                `).join(""):'<tr><td colspan="4" style="text-align:center; padding: 20px;">Nenhuma transação nesta fatura.</td></tr>'}
            </tbody>
        </table>

        <div class="footer">Relatório gerado pelo Conta Comigo PRO</div>
        <script>window.onload = function() { setTimeout(function() { window.print(); }, 500); }<\/script>
    </body>
    </html>
    `;x.document.write(f),x.document.close()};export{T as getInvoiceMonth,j as initView,v as renderView};

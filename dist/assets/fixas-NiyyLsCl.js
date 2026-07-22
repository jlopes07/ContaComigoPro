import{a as u,s as n,b as x,f}from"./index-BZKSQWFW.js";function v(){p(),u(()=>{var s;(s=document.getElementById("page-fixas"))!=null&&s.classList.contains("active")&&p()})}function p(){const s=document.getElementById("transaction-list-fixed");if(!s)return;if(s.innerHTML="",n.fixedTransactionsList.length===0&&n.cardsList.length===0){s.innerHTML='<div class="empty-state"><i class="fa-solid fa-repeat"></i><p>Nenhuma transação fixa cadastrada.</p></div>';return}const l=new Date().toISOString().slice(0,7);n.fixedTransactionsList.forEach(a=>{const t=a.type==="income",d=t?"+":"-",c=a.isAutomatic?`Todo dia ${a.dayOfMonth} (Auto)`:`Lançamento Manual (Venc. Dia ${a.dayOfMonth})`,e=a.lastProcessedMonth===l;let o="";e&&(o='<span style="font-size: 0.65rem; background: var(--success-bg); color: var(--success); padding: 4px 8px; border-radius: 12px; font-weight: 700; margin-left: 12px;"><i class="fa-solid fa-check"></i> Lançado este mês</span>');let i=e?"":`<button class="btn-icon" onclick="window.launchManualFixedTransaction('${a.id}')" title="Lançar agora"><i class="fa-solid fa-play" style="color:var(--success)"></i></button>`;s.innerHTML+=`
            <div class="transaction-item">
                <div class="tx-left" style="flex: 1;">
                    <div class="tx-icon ${t?"income":"expense"}"><i class="fa-solid ${t?"fa-arrow-up":"fa-arrow-down"}"></i></div>
                    <div class="tx-details">
                        <p class="tx-title" style="display:flex; align-items:center;">${a.description} ${o}</p>
                        <p class="tx-category"><i class="fa-solid ${x(a.category)}"></i> ${a.category} | ${c}</p>
                    </div>
                </div>
                <div class="tx-right">
                    <p class="tx-amount ${t?"positive":"negative"}">${d} ${f(a.amount)}</p>
                </div>
                <div class="tx-actions" style="display:flex; gap: 8px;">
                    ${i}
                    <button class="btn-icon" onclick="window.editFixedTransaction('${a.id}')" title="Editar"><i class="fa-solid fa-pen"></i></button>
                    <button class="btn-icon" onclick="window.deleteFixedTransaction('${a.id}')" title="Excluir"><i class="fa-solid fa-trash"></i></button>
                </div>
            </div>`}),n.cardsList.forEach(a=>{const t=n.transactions.filter(i=>i.paymentMethod===a.id&&i.date&&i.date.startsWith(l)).reduce((i,r)=>i+(r.type==="expense"?r.amount:-r.amount),0),d=`Pagamento de Fatura (Venc. Dia ${a.dueDay})`,c=a.lastProcessedMonth===l;let e="";c&&(e='<span style="font-size: 0.65rem; background: var(--success-bg); color: var(--success); padding: 4px 8px; border-radius: 12px; font-weight: 700; margin-left: 12px;"><i class="fa-solid fa-check"></i> Pago este mês</span>');let o=c?"":`<button class="btn-icon" onclick="window.launchCardFatura('${a.id}', ${t})" title="Pagar Fatura Agora"><i class="fa-solid fa-play" style="color:var(--success)"></i></button>`;s.innerHTML+=`
            <div class="transaction-item" style="border-left: 4px solid var(--primary);">
                <div class="tx-left" style="flex: 1;">
                    <div class="tx-icon expense"><i class="fa-solid fa-credit-card"></i></div>
                    <div class="tx-details">
                        <p class="tx-title" style="display:flex; align-items:center;">Fatura: ${a.nickname} ${e}</p>
                        <p class="tx-category"><i class="fa-solid fa-credit-card"></i> Cartão de Crédito | ${d}</p>
                    </div>
                </div>
                <div class="tx-right">
                    <p class="tx-amount negative">- ${f(Math.max(t,0))}</p>
                </div>
                <div class="tx-actions" style="display:flex; gap: 8px;">
                    ${o}
                </div>
            </div>`})}export{v as initView,p as renderView};

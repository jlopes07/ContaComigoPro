import{a as c,s as n,f as r}from"./index-Bf9tqZDu.js";function m(){l(),c(()=>{var i;(i=document.getElementById("page-cartoes"))!=null&&i.classList.contains("active")&&l()})}function l(){const i=document.getElementById("cards-list");if(!i)return;if(i.innerHTML="",n.cardsList.length===0){i.innerHTML='<div class="empty-state w-100" style="grid-column: 1/-1;"><i class="fa-solid fa-credit-card"></i><p>Nenhum cartão cadastrado.</p></div>';return}const o=new Date().toISOString().slice(0,7);n.cardsList.forEach(t=>{const a=n.transactions.filter(e=>e.paymentMethod===t.id&&e.date&&e.date.startsWith(o)).reduce((e,s)=>e+(s.type==="expense"?s.amount:-s.amount),0),d=t.limit-Math.max(a,0);i.innerHTML+=`
            <div class="card credit-card-card" style="padding: 16px; border-top: 4px solid var(--primary); position: relative;">
                <button class="btn-icon" style="position: absolute; right: 40px; top: 8px;" onclick="window.editCard('${t.id}')" title="Editar Cartão"><i class="fa-solid fa-pen" style="font-size:0.9rem;"></i></button>
                <button class="btn-icon" style="position: absolute; right: 8px; top: 8px;" onclick="window.deleteCard('${t.id}')" title="Excluir Cartão"><i class="fa-solid fa-trash" style="font-size:0.9rem;"></i></button>
                <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom: 12px;">
                    <div style="font-weight: 600; font-size: 1.1rem; display:flex; align-items:center; gap:8px;">
                        <i class="fa-solid fa-credit-card" style="color: var(--primary)"></i> ${t.nickname}
                    </div>
                </div>
                <p style="color: var(--text-muted); font-size: 0.85rem; margin-bottom: 8px;">Instituição: <strong>${t.bank}</strong></p>
                <div style="margin-bottom: 8px;">
                    <span style="color: var(--text-muted); font-size: 0.8rem; display:block;">Fatura Atual (Mês ${o.slice(5)})</span>
                    <span style="font-weight: 700; font-size: 1.2rem; color: var(--danger);">${r(Math.max(a,0))}</span>
                </div>
                <div style="display:flex; justify-space-between; font-size: 0.8rem; color: var(--text-muted); margin-bottom: 12px;">
                    <span>Limite: ${r(t.limit)}</span>
                    <span>Disponível: ${r(d)}</span>
                </div>
                <div style="display:flex; gap: 8px;">
                    <button class="btn btn-primary w-100" onclick="window.launchCardFatura('${t.id}', ${a})">Pagar Fatura</button>
                </div>
            </div>
        `})}export{m as initView,l as renderView};

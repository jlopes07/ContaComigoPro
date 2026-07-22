import{a as b,s as y,f as d,c as v}from"./index-BZKSQWFW.js";let i={selic:10.5,cdi:10.4};function $(){w(),x(),b(()=>{var e;(e=document.getElementById("page-investimentos"))!=null&&e.classList.contains("active")&&x()})}function x(){const e=document.getElementById("investments-list");if(!e)return;e.innerHTML="";let n=0;if(y.investmentsList.length===0){e.innerHTML='<div class="empty-state w-100"><i class="fa-solid fa-chart-line"></i><p>Nenhum investimento cadastrado.</p></div>';const t=document.getElementById("total-investments"),s=document.getElementById("total-investments-yield");t&&(t.textContent="R$ 0,00"),s&&(s.textContent="R$ 0,00");return}y.investmentsList.forEach(t=>{n+=t.amount;const s=t.manualCurrentValue!==void 0&&t.manualCurrentValue!==null&&t.manualCurrentValue!=="";let r=g(t,new Date),p="";if(t.type==="fixed"||s){const o=r,a=o.gross>=t.amount;let u="";if(t.type==="fixed"&&t.dueDate){const f=new Date(t.dueDate+"T00:00:00");if(f>new Date){const m=g(t,f,!0);u=`
                        <div style="margin-top: 8px; padding-top: 8px; border-top: 1px dashed var(--border);">
                            <span style="font-size: 0.8rem; color: var(--text-muted); text-transform: uppercase; font-weight: bold;">Projeção no Vencimento</span>
                            <div style="display: flex; justify-content: space-between; margin-top: 4px;">
                                <span>Bruto Estimado:</span>
                                <strong style="color: var(--text-main)">${d(m.gross)}</strong>
                            </div>
                            <div style="display: flex; justify-content: space-between; margin-bottom: 4px; color: var(--text-muted);">
                                <span>Imposto (IR):</span>
                                <span>- ${d(m.tax)}</span>
                            </div>
                            <div style="display: flex; justify-content: space-between; font-weight: bold;">
                                <span>Líquido Projetado:</span>
                                <span>${d(m.net)}</span>
                            </div>
                        </div>
                    `}}p=`
                <div style="background: var(--bg-body); padding: 8px; border-radius: 6px; margin-top: 12px; font-size: 0.9rem;">
                    <span style="font-size: 0.8rem; color: var(--text-muted); text-transform: uppercase; font-weight: bold;">Posição Atual ${s?"(Manual)":""}</span>
                    <div style="display: flex; justify-content: space-between; margin-top: 4px;">
                        <span>Valor Bruto:</span>
                        <strong style="color: ${a?"var(--success)":"var(--danger)"}">${d(o.gross)}</strong>
                    </div>
                    <div style="display: flex; justify-content: space-between; margin-bottom: 4px; color: var(--text-muted);">
                        <span>Rendimento:</span>
                        <span style="color: ${a?"var(--success)":"var(--danger)"}">${a?"+":""}${d(o.gross-t.amount)}</span>
                    </div>
                    ${u}
                </div>
            `}const c={fixed:"Renda Fixa",variable:"Ações / FIIs",crypto:"Criptomoedas",fund:"Fundos"};e.innerHTML+=`
            <div class="card" style="padding: 16px; position: relative;">
                <button class="btn-icon" style="position: absolute; right: 8px; top: 8px;" onclick="window.deleteInvestment('${t.id}')" title="Excluir"><i class="fa-solid fa-trash"></i></button>
                <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 8px;">
                    <div>
                        <h4 style="margin: 0; font-size: 1.1rem;">${t.name}</h4>
                        <span style="font-size: 0.8rem; background: var(--bg-secondary); padding: 2px 6px; border-radius: 4px; color: var(--text-muted);">${c[t.type]||t.type}</span>
                    </div>
                </div>
                <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(120px, 1fr)); gap: 8px; margin-top: 12px; font-size: 0.85rem;">
                    <div>
                        <span style="color: var(--text-muted); display: block;">Aporte Inicial</span>
                        <strong>${d(t.amount)}</strong>
                    </div>
                    <div>
                        <span style="color: var(--text-muted); display: block;">Data de Início</span>
                        <span>${v(t.date)}</span>
                    </div>
                </div>
                ${p}
            </div>
        `});const l=document.getElementById("total-investments");l&&(l.textContent=d(n))}function g(e,n=new Date,l=!1){let t=e.amount,s=0;const r=e.manualCurrentValue!==void 0&&e.manualCurrentValue!==null&&e.manualCurrentValue!=="";if(!l&&r)t=parseFloat(e.manualCurrentValue);else if(e.type==="fixed"){const c=new Date(e.date+"T00:00:00"),o=Math.floor((n-c)/(1e3*60*60*24));if(o>0){let a=0;e.rateType==="cdi"?a=i.cdi*(e.rateValue/100):e.rateType==="selic"?a=i.selic*(e.rateValue/100):a=e.rateValue;const u=Math.pow(1+a/100,1/365)-1;t=e.amount*Math.pow(1+u,o)}}const p=t-e.amount;if(p>0&&e.type==="fixed"){const c=new Date(e.date+"T00:00:00"),o=Math.floor((n-c)/(1e3*60*60*24));let a=0;o<=180?a=.225:o<=360?a=.2:o<=720?a=.175:a=.15,s=p*a}return{gross:t,tax:s,net:t-s}}async function w(){try{const n=await(await fetch("https://brasilapi.com.br/api/taxas/v1")).json(),l=n.find(r=>r.nome.toLowerCase()==="selic"),t=n.find(r=>r.nome.toLowerCase()==="cdi");l&&(i.selic=l.valor),t&&(i.cdi=t.valor);const s=document.getElementById("market-rates-display");s&&(s.innerHTML=`
                <span style="margin-right: 16px;">Selic: <strong>${i.selic.toFixed(2)}%</strong></span>
                <span>CDI: <strong>${i.cdi.toFixed(2)}%</strong></span>
            `)}catch(e){console.error("Erro ao buscar taxas da API:",e);const n=document.getElementById("market-rates-display");n&&(n.textContent=`Selic: ${i.selic}% | CDI: ${i.cdi}% (Offline)`)}}export{$ as initView,x as renderView};

import{a as h,s as b,f as m,c as f}from"./index-BZKSQWFW.js";let g="",y="";function S(){x(),h(()=>{var o;(o=document.getElementById("page-relatorios"))!=null&&o.classList.contains("active")&&x()});const a=document.getElementById("report-type"),e=document.getElementById("btn-generate-report"),r=document.getElementById("btn-print-report"),n=document.getElementById("btn-export-csv");a&&a.addEventListener("change",u),e&&e.addEventListener("click",k),r&&r.addEventListener("click",C),n&&n.addEventListener("click",I);const i=document.getElementById("report-month");i&&!i.value&&(i.value=new Date().toISOString().slice(0,7))}function x(){$(),u()}function $(){const a=document.getElementById("report-bank");if(!a)return;let e='<option value="" disabled selected>Selecione um banco</option>';b.banksList.forEach(r=>{e+=`<option value="${r.id}">🏦 ${r.name}</option>`}),a.innerHTML=e}function u(){var n;const a=(n=document.getElementById("report-type"))==null?void 0:n.value,e=document.getElementById("report-bank-container"),r=document.getElementById("report-period-container");e&&r&&(a==="bank-statement"?(e.style.display="block",r.style.display="block"):(e.style.display="none",r.style.display="block"))}function k(){var d,p,l;const a=(d=document.getElementById("report-type"))==null?void 0:d.value,e=(p=document.getElementById("report-month"))==null?void 0:p.value,r=document.getElementById("report-preview-content"),n=document.getElementById("btn-print-report"),i=document.getElementById("btn-export-csv");if(!e){alert("Por favor, selecione um mês de referência.");return}let o="",s="";switch(a){case"monthly-summary":o=w(e),s="Resumo Mensal (DRE)";break;case"category-expenses":o=E(e),s="Gastos por Categoria";break;case"bank-statement":const t=(l=document.getElementById("report-bank"))==null?void 0:l.value;if(!t){alert("Por favor, selecione uma conta bancária.");return}o=D(e,t),s="Extrato Bancário";break;case"credit-card":o=B(e),s="Relatório de Cartões";break;default:o='<p style="color: var(--text-muted);">Tipo de relatório não suportado.</p>'}r&&(r.innerHTML=o),n&&(n.disabled=!1),i&&(i.disabled=!1),g=o,y=s}function w(a){const[e,r]=a.split("-"),n=`${e}-${r}-01`,i=new Date(e,parseInt(r),0).getDate(),o=`${e}-${r}-${String(i).padStart(2,"0")}`,s=b.transactions.filter(t=>t.date>=n&&t.date<=o),d=s.filter(t=>t.type==="income").reduce((t,c)=>t+c.amount,0),p=s.filter(t=>t.type==="expense").reduce((t,c)=>t+c.amount,0),l=d-p;return`
        <div style="width: 100%; max-width: 700px; margin: 0 auto; color: var(--text-main);">
            <div style="text-align: center; margin-bottom: 24px; border-bottom: 2px solid var(--border); padding-bottom: 16px;">
                <h2 style="margin: 0;">Demonstrativo do Resultado Mensal (DRE)</h2>
                <p style="color: var(--text-muted); margin-top: 4px;">Período: <strong>${r}/${e}</strong></p>
            </div>
            <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 16px; margin-bottom: 24px;">
                <div style="background: var(--bg-body); padding: 16px; border-radius: 8px; text-align: center; border: 1px solid var(--border);">
                    <span style="font-size: 0.85rem; color: var(--text-muted); display: block;">Total Receitas</span>
                    <strong style="font-size: 1.2rem; color: var(--success);">${m(d)}</strong>
                </div>
                <div style="background: var(--bg-body); padding: 16px; border-radius: 8px; text-align: center; border: 1px solid var(--border);">
                    <span style="font-size: 0.85rem; color: var(--text-muted); display: block;">Total Despesas</span>
                    <strong style="font-size: 1.2rem; color: var(--danger);">${m(p)}</strong>
                </div>
                <div style="background: var(--bg-body); padding: 16px; border-radius: 8px; text-align: center; border: 1px solid var(--border);">
                    <span style="font-size: 0.85rem; color: var(--text-muted); display: block;">Resultado do Mês</span>
                    <strong style="font-size: 1.2rem; color: ${l>=0?"var(--success)":"var(--danger)"};">${m(l)}</strong>
                </div>
            </div>
        </div>
    `}function E(a){const[e,r]=a.split("-"),n=`${e}-${r}-01`,i=new Date(e,parseInt(r),0).getDate(),o=`${e}-${r}-${String(i).padStart(2,"0")}`,s=b.transactions.filter(t=>t.date>=n&&t.date<=o&&t.type==="expense"),d={};s.forEach(t=>{const c=t.category||"Outros";d[c]=(d[c]||0)+t.amount});const p=Object.values(d).reduce((t,c)=>t+c,0);let l=Object.keys(d).map(t=>{const c=d[t],v=p>0?(c/p*100).toFixed(1):0;return`
            <tr>
                <td style="padding: 10px; border-bottom: 1px solid var(--border);">${t}</td>
                <td style="padding: 10px; border-bottom: 1px solid var(--border); text-align: right;">${m(c)}</td>
                <td style="padding: 10px; border-bottom: 1px solid var(--border); text-align: right;">${v}%</td>
            </tr>
        `}).join("");return`
        <div style="width: 100%; max-width: 700px; margin: 0 auto; color: var(--text-main);">
            <div style="text-align: center; margin-bottom: 24px; border-bottom: 2px solid var(--border); padding-bottom: 16px;">
                <h2 style="margin: 0;">Relatório de Despesas por Categoria</h2>
                <p style="color: var(--text-muted); margin-top: 4px;">Período: <strong>${r}/${e}</strong></p>
            </div>
            <table style="width: 100%; border-collapse: collapse;">
                <thead>
                    <tr style="background: var(--bg-body); text-align: left;">
                        <th style="padding: 10px; border-bottom: 2px solid var(--border);">Categoria</th>
                        <th style="padding: 10px; border-bottom: 2px solid var(--border); text-align: right;">Valor Total</th>
                        <th style="padding: 10px; border-bottom: 2px solid var(--border); text-align: right;">% do Total</th>
                    </tr>
                </thead>
                <tbody>${l||'<tr><td colspan="3" style="text-align:center; padding: 16px; color: var(--text-muted);">Nenhum gasto registrado.</td></tr>'}</tbody>
            </table>
        </div>
    `}function D(a,e){const r=b.banksList.find(t=>t.id===e);if(!r)return"<p>Banco não encontrado.</p>";const[n,i]=a.split("-"),o=`${n}-${i}-01`,s=new Date(n,parseInt(i),0).getDate(),d=`${n}-${i}-${String(s).padStart(2,"0")}`,p=b.transactions.filter(t=>t.paymentMethod===e&&t.date>=o&&t.date<=d);p.sort((t,c)=>t.date.localeCompare(c.date));let l=p.map(t=>`
        <tr>
            <td style="padding: 8px; border-bottom: 1px solid var(--border);">${f(t.date)}</td>
            <td style="padding: 8px; border-bottom: 1px solid var(--border);">${t.description}</td>
            <td style="padding: 8px; border-bottom: 1px solid var(--border);">${t.category||"Geral"}</td>
            <td style="padding: 8px; border-bottom: 1px solid var(--border); text-align: right; color: ${t.type==="income"?"var(--success)":"var(--danger)"};">
                ${t.type==="income"?"+":"-"} ${m(t.amount)}
            </td>
        </tr>
    `).join("");return`
        <div style="width: 100%; max-width: 700px; margin: 0 auto; color: var(--text-main);">
            <div style="text-align: center; margin-bottom: 24px; border-bottom: 2px solid var(--border); padding-bottom: 16px;">
                <h2 style="margin: 0;">Extrato Bancário — ${r.name}</h2>
                <p style="color: var(--text-muted); margin-top: 4px;">Mês: <strong>${i}/${n}</strong></p>
            </div>
            <table style="width: 100%; border-collapse: collapse;">
                <thead>
                    <tr style="background: var(--bg-body); text-align: left;">
                        <th style="padding: 8px; border-bottom: 2px solid var(--border);">Data</th>
                        <th style="padding: 8px; border-bottom: 2px solid var(--border);">Descrição</th>
                        <th style="padding: 8px; border-bottom: 2px solid var(--border);">Categoria</th>
                        <th style="padding: 8px; border-bottom: 2px solid var(--border); text-align: right;">Valor</th>
                    </tr>
                </thead>
                <tbody>${l||'<tr><td colspan="4" style="text-align:center; padding: 16px; color: var(--text-muted);">Nenhuma movimentação no período.</td></tr>'}</tbody>
            </table>
        </div>
    `}function B(a){const[e,r]=a.split("-"),n=`${e}-${r}-01`,i=new Date(e,parseInt(r),0).getDate(),o=`${e}-${r}-${String(i).padStart(2,"0")}`;let s=b.cardsList.map(d=>{const p=b.transactions.filter(l=>l.paymentMethod===d.id&&l.date>=n&&l.date<=o&&l.type==="expense").reduce((l,t)=>l+t.amount,0);return`
            <tr>
                <td style="padding: 10px; border-bottom: 1px solid var(--border);">${d.nickname} (${d.bank})</td>
                <td style="padding: 10px; border-bottom: 1px solid var(--border); text-align: right;">${m(d.limit)}</td>
                <td style="padding: 10px; border-bottom: 1px solid var(--border); text-align: right; color: var(--danger); font-weight: 600;">${m(p)}</td>
            </tr>
        `}).join("");return`
        <div style="width: 100%; max-width: 700px; margin: 0 auto; color: var(--text-main);">
            <div style="text-align: center; margin-bottom: 24px; border-bottom: 2px solid var(--border); padding-bottom: 16px;">
                <h2 style="margin: 0;">Relatório Geral de Cartões de Crédito</h2>
                <p style="color: var(--text-muted); margin-top: 4px;">Referência: <strong>${r}/${e}</strong></p>
            </div>
            <table style="width: 100%; border-collapse: collapse;">
                <thead>
                    <tr style="background: var(--bg-body); text-align: left;">
                        <th style="padding: 10px; border-bottom: 2px solid var(--border);">Cartão</th>
                        <th style="padding: 10px; border-bottom: 2px solid var(--border); text-align: right;">Limite Total</th>
                        <th style="padding: 10px; border-bottom: 2px solid var(--border); text-align: right;">Fatura Estimada</th>
                    </tr>
                </thead>
                <tbody>${s}</tbody>
            </table>
        </div>
    `}function C(){if(!g)return alert("Nenhum relatório gerado para imprimir.");const a=window.open("","_blank");a.document.write(`
        <html>
        <head>
            <title>${y}</title>
            <style>
                body { font-family: sans-serif; padding: 20px; color: #1e293b; }
                table { width: 100%; border-collapse: collapse; margin-top: 16px; }
                th, td { border: 1px solid #cbd5e1; padding: 8px; text-align: left; }
                th { background-color: #f1f5f9; }
            </style>
        </head>
        <body>
            ${g}
            <script>window.onload = function() { window.print(); }<\/script>
        </body>
        </html>
    `),a.document.close()}function I(){if(!g)return alert("Nenhum relatório gerado para exportar.");const a=document.createElement("div");a.innerHTML=g;const e=a.querySelector("table");if(!e)return alert("Não há tabela de dados neste relatório.");let r=[];e.querySelectorAll("tr").forEach(s=>{let d=[];s.querySelectorAll("th, td").forEach(p=>{d.push('"'+p.innerText.replace(/"/g,'""').trim()+'"')}),r.push(d.join(","))});const n="data:text/csv;charset=utf-8,\uFEFF"+r.join(`
`),i=encodeURI(n),o=document.createElement("a");o.setAttribute("href",i),o.setAttribute("download",`${y.toLowerCase().replace(/\s+/g,"_")}.csv`),document.body.appendChild(o),o.click(),document.body.removeChild(o)}export{I as exportReportCSV,k as generateReport,S as initView,C as printReport,x as renderView};

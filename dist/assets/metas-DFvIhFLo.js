import{a as c,s as r,f as e}from"./index-BZKSQWFW.js";function u(){l(),c(()=>{var t;(t=document.getElementById("page-metas"))!=null&&t.classList.contains("active")&&l()})}function l(){const t=document.getElementById("goals-list");if(t){if(t.innerHTML="",r.goalsList.length===0){t.innerHTML='<div class="empty-state w-100" style="grid-column: 1/-1;"><i class="fa-solid fa-bullseye"></i><p>Nenhuma meta cadastrada.</p></div>';return}r.goalsList.forEach(a=>{const s=a.targetValue>0?Math.min(a.currentValue/a.targetValue*100,100).toFixed(0):0,i=a.currentValue>=a.targetValue,n=Math.max(a.targetValue-a.currentValue,0),o=e(n);t.innerHTML+=`
        <div class="card goal-card" style="padding: 16px;">
            <div class="goal-header" style="display:flex; justify-content:space-between; align-items:center; margin-bottom: 12px;">
                <h4 style="margin: 0; font-size: 1.05rem;">${a.name}</h4>
                <span class="percentage" style="font-weight: 700; color: ${i?"var(--success)":"var(--primary)"}">${s}%</span>
            </div>
            <div class="progress-container" style="height: 10px; background: var(--bg-body); border-radius: 5px; overflow: hidden; margin-bottom: 12px;">
                <div class="progress-bar" style="width: ${s}%; height: 100%; background: ${i?"var(--success)":"linear-gradient(90deg, var(--primary), #818cf8)"};"></div>
            </div>
            <div class="goal-footer" style="display:flex; justify-content:space-between; align-items:flex-end;">
                <div class="goal-values" style="font-size: 0.85rem;">
                    <p style="margin: 0;">Atual: <strong>${e(a.currentValue)}</strong></p>
                    <p style="margin: 4px 0 0 0;">Total: <strong>${e(a.targetValue)}</strong></p>
                    ${n>0?`<p style="margin: 4px 0 0 0; color: var(--text-muted);">Falta: <strong>${o}</strong></p>`:'<p style="color: var(--success); margin: 4px 0 0 0; font-weight: 600;">✅ Meta alcançada!</p>'}
                </div>
                <div class="goal-actions" style="display:flex; gap:8px;">
                    <button class="btn-icon" onclick="window.addFundsToGoal('${a.id}', ${a.currentValue}, ${a.targetValue})" title="Adicionar fundo"><i class="fa-solid fa-hand-holding-dollar" style="color:var(--success)"></i></button>
                    <button class="btn-icon" onclick="window.deleteGoal('${a.id}')" title="Excluir Meta"><i class="fa-solid fa-trash"></i></button>
                </div>
            </div>
        </div>
    `})}}export{u as initView,l as renderView};

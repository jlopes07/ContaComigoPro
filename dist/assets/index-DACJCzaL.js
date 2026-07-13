(function(){const e=document.createElement("link").relList;if(e&&e.supports&&e.supports("modulepreload"))return;for(const o of document.querySelectorAll('link[rel="modulepreload"]'))n(o);new MutationObserver(o=>{for(const i of o)if(i.type==="childList")for(const s of i.addedNodes)s.tagName==="LINK"&&s.rel==="modulepreload"&&n(s)}).observe(document,{childList:!0,subtree:!0});function a(o){const i={};return o.integrity&&(i.integrity=o.integrity),o.referrerPolicy&&(i.referrerPolicy=o.referrerPolicy),o.crossOrigin==="use-credentials"?i.credentials="include":o.crossOrigin==="anonymous"?i.credentials="omit":i.credentials="same-origin",i}function n(o){if(o.ep)return;o.ep=!0;const i=a(o);fetch(o.href,i)}})();const Ot={apiKey:"AIzaSyBFmPf_MY9qfxbAbazYa_pFruoaAhjiago",authDomain:"contacomigopro.firebaseapp.com",projectId:"contacomigopro",storageBucket:"contacomigopro.firebasestorage.app",messagingSenderId:"396497996638",appId:"1:396497996638:web:ea0417c96ab7b96de29dcf",measurementId:"G-4T964VEF2N"};firebase.apps.length||firebase.initializeApp(Ot);const S=firebase.firestore(),P=firebase.auth(),L=S.collection("transactions"),Ee=S.collection("goals"),z=S.collection("categories"),Y=S.collection("cards"),G=S.collection("fixed_transactions"),ae=S.collection("banks"),xe=S.collection("investments");function F(t){if(!t)return 0;let e=t.toString().trim();e.includes(",")&&(e=e.replace(/\./g,""),e=e.replace(",","."));const a=parseFloat(e);return isNaN(a)?0:a}let D={id:null,search:"",startDate:"",endDate:"",month:""},M={id:null,startDate:"",endDate:""};const ct=document.getElementById("auth-overlay"),mt=document.getElementById("app-wrapper"),Vt=document.getElementById("btn-google-login"),Ht=document.getElementById("form-auth-email"),ut=document.getElementById("auth-message"),jt=document.getElementById("btn-logout"),Gt=document.getElementById("user-name"),Wt=document.getElementById("user-email"),_t=document.getElementById("user-avatar"),O=document.getElementById("transaction-modal"),Q=document.getElementById("form-transaction"),ne=document.getElementById("installments-pending-modal"),Ie=document.getElementById("goal-modal"),pt=document.getElementById("form-goal"),le=document.getElementById("fixed-transaction-modal"),Te=document.getElementById("form-fixed-transaction"),de=document.getElementById("card-modal"),Ae=document.getElementById("form-card"),ze=document.getElementById("card-payment-modal"),gt=document.getElementById("form-card-payment"),Ut=document.getElementById("close-card-payment-modal"),Yt=document.getElementById("btn-cancel-card-payment");Ut.addEventListener("click",()=>ze.classList.remove("active"));Yt.addEventListener("click",()=>ze.classList.remove("active"));const W=document.getElementById("investment-modal"),ce=document.getElementById("form-investment"),Dt=document.getElementById("btn-new-card"),X=document.getElementById("banks-list"),Be=document.getElementById("bank-modal"),Fe=document.getElementById("form-bank"),Mt=document.getElementById("btn-new-bank"),Ne=document.getElementById("transfer-modal"),Me=document.getElementById("form-transfer"),ft=document.getElementById("close-transfer-modal"),yt=document.getElementById("btn-cancel-transfer"),Re=document.getElementById("btn-new-transfer");ft&&ft.addEventListener("click",()=>Ne.classList.remove("active"));yt&&yt.addEventListener("click",()=>Ne.classList.remove("active"));const R=document.getElementById("payment-method"),vt=document.getElementById("fixed-payment-method"),Ze=document.getElementById("installments-container"),at=document.getElementById("installments");document.getElementById("transaction-list-recent");document.getElementById("transaction-list-complete");const Ge=document.getElementById("goals-list"),Ce=document.getElementById("transaction-list-fixed"),Le=document.getElementById("cards-list"),nt=document.getElementById("filter-search"),ot=document.getElementById("filter-type"),it=document.getElementById("filter-date-start"),rt=document.getElementById("filter-date-end"),st=document.getElementById("filter-category"),Kt=document.getElementById("btn-clear-filters"),We=document.getElementById("total-balance"),bt=document.getElementById("total-income"),xt=document.getElementById("total-expense"),_e=document.getElementById("filtered-balance"),Jt=document.getElementById("filtered-income"),Xt=document.getElementById("filtered-expense");let w=null,I=[],oe=[],V=[],B=[],A=[],$=[],ie=[],me=null,ue=null,pe=null,ge=null,fe=null,ye=null,ve=null,Z=localStorage.getItem("contaComigo_darkMode")==="true",j=null,be=null,ee=null,qe=null,he=null,te=null,T=null;const ht=document.getElementById("mobile-menu-btn"),Pe=document.querySelector(".sidebar"),re=document.getElementById("sidebar-overlay");function Qt(){Pe&&Pe.classList.toggle("open"),re&&re.classList.toggle("active")}function Tt(){Pe&&Pe.classList.remove("open"),re&&re.classList.remove("active")}ht&&ht.addEventListener("click",Qt);re&&re.addEventListener("click",Tt);document.querySelectorAll("nav a").forEach(t=>{t.addEventListener("click",()=>{window.innerWidth<=768&&Tt()})});P.onAuthStateChanged(t=>{t?(w=t,ct.classList.remove("active"),mt.style.display="flex",Ft(),ea().then(()=>{Zt().then(()=>{ta().then(()=>{ia(),da(),pa(),ra(),sa(),la()})}),ka(),Ba()})):(w=null,mt.style.display="none",ct.classList.add("active"),I=[],oe=[],V=[],B=[],A=[],$=[],ie=[],_(),me&&me(),ue&&ue(),pe&&pe(),ge&&ge(),fe&&fe(),ye&&ye(),ve&&ve())});async function Zt(){const t=`migrated_banks_${w.uid}`;if(!localStorage.getItem(t))try{let e=null;const a=await ae.where("userId","==",w.uid).where("name","==","Conta Corrente Principal").get();a.empty?e=await ae.add({userId:w.uid,name:"Conta Corrente Principal",balance:0,color:"#0ea5e9",createdAt:firebase.firestore.FieldValue.serverTimestamp()}):e=a.docs[0].ref;const n=await L.where("userId","==",w.uid).get(),o=S.batch();let i=0;for(const s of n.docs)s.data().paymentMethod==="checking"&&(o.update(L.doc(s.id),{paymentMethod:e.id}),i++),i>400&&(await o.commit(),i=0);i>0&&await o.commit(),localStorage.setItem(t,"done"),console.log("Migração de Bancos concluída com sucesso!")}catch(e){console.error("Migration de bancos falhou: ",e)}}async function ea(){const t=`migrated_v2_${w.uid}`;if(!localStorage.getItem(t))try{const e=await L.where("userId","==",w.uid).get(),a=S.batch();let n=0;for(const o of e.docs){const i=o.data();let s=!1;i.isCategory?(delete i.isCategory,delete i.date,a.set(z.doc(o.id),i),s=!0):i.isCreditCard?(delete i.isCreditCard,delete i.date,a.set(Y.doc(o.id),i),s=!0):i.isFixedTemplate&&(delete i.isFixedTemplate,delete i.date,a.set(G.doc(o.id),i),s=!0),s&&(a.delete(L.doc(o.id)),n++),n>400&&(await a.commit(),n=0)}n>0&&await a.commit(),localStorage.setItem(t,"done"),console.log("Banco de dados otimizado com sucesso!")}catch(e){console.error("Migration falhou: ",e)}}async function ta(){const t=`migrated_categories_v1_${w.uid}`;if(!localStorage.getItem(t))try{console.log("Iniciando migração de unificação de categorias...");const e=await z.where("userId","==",w.uid).get(),a={};e.forEach(n=>{const o=n.data(),i=(o.name||"").trim().toLowerCase();a[i]||(a[i]=[]),a[i].push({id:n.id,...o})});for(const n in a){const o=a[n];if(o.length<=1)continue;o.sort((s,r)=>{const l=s.name.trim(),d=r.name.trim(),m=tt.some(p=>p.name===l),u=tt.some(p=>p.name===d);return m&&!u?-1:!m&&u?1:l.length-d.length||s.id.localeCompare(r.id)});const i=o[0];console.log(`Unificando categoria: mantendo '${i.name}' (${i.id}) e removendo duplicados.`);for(let s=1;s<o.length;s++){const r=o[s];if(console.log(`Removendo duplicado '${r.name}' (${r.id})`),await z.doc(r.id).delete(),r.name!==i.name){const l=await L.where("userId","==",w.uid).where("category","==",r.name).get();if(!l.empty){let m=S.batch(),u=0;for(const p of l.docs)m.update(p.ref,{category:i.name}),u++,u>=400&&(await m.commit(),m=S.batch(),u=0);u>0&&await m.commit(),console.log(`Atualizadas ${l.size} transações de '${r.name}' para '${i.name}'`)}const d=await G.where("userId","==",w.uid).where("category","==",r.name).get();if(!d.empty){let m=S.batch(),u=0;for(const p of d.docs)m.update(p.ref,{category:i.name}),u++,u>=400&&(await m.commit(),m=S.batch(),u=0);u>0&&await m.commit(),console.log(`Atualizadas ${d.size} transações fixas de '${r.name}' para '${i.name}'`)}}}}localStorage.setItem(t,"done"),console.log("Migração de categorias concluída com sucesso!")}catch(e){console.error("Falha na migração de categorias: ",e)}}function C(t,e=!1){ut.textContent=t,ut.style.color=e?"var(--danger)":"var(--primary)"}Vt.addEventListener("click",()=>{P.signInWithPopup(new firebase.auth.GoogleAuthProvider).catch(t=>C(t.message,!0))});Ht.addEventListener("submit",async t=>{t.preventDefault();const e=document.getElementById("auth-email").value.trim(),a=document.getElementById("auth-password").value;if(!e||!a)return C("Preencha todos os campos.",!0);C("Autenticando...");try{await P.signInWithEmailAndPassword(e,a)}catch(n){if(n.code==="auth/user-not-found"||n.code==="auth/invalid-credential")try{await P.createUserWithEmailAndPassword(e,a)}catch(o){C(o.message,!0)}else C(n.message,!0)}});document.getElementById("btn-email-link").addEventListener("click",async()=>{const t=document.getElementById("auth-email").value.trim();if(!t)return C("Preencha seu e-mail para receber o link.",!0);try{await P.sendSignInLinkToEmail(t,{url:window.location.href,handleCodeInApp:!0}),window.localStorage.setItem("emailForSignIn",t),C("Link enviado! Verifique seu email.")}catch(e){C(e.message,!0)}});if(P.isSignInWithEmailLink(window.location.href)){let t=window.localStorage.getItem("emailForSignIn")||window.prompt("Confirme seu e-mail:");P.signInWithEmailLink(t,window.location.href).then(()=>window.localStorage.removeItem("emailForSignIn")).catch(e=>C(e.message,!0))}jt.addEventListener("click",()=>P.signOut());const At=document.getElementById("btn-new-category"),K=document.getElementById("category-modal"),et=document.getElementById("form-category"),aa=document.getElementById("btn-cancel-category"),na=document.getElementById("close-category-modal"),Se=document.getElementById("categories-list"),wt=document.getElementById("category-icons-grid"),oa=document.querySelectorAll("#nav-menu a[data-page]");oa.forEach(t=>{t.addEventListener("click",e=>{e.preventDefault(),document.querySelectorAll("#nav-menu li").forEach(i=>i.classList.remove("active"));const a=t.parentElement;a.classList.add("active"),document.getElementById("page-title").textContent=a.dataset.title;const n=t.dataset.page,o=["page-metas","page-configuracoes","page-fixas","page-categorias","page-investimentos","page-relatorios"];document.getElementById("btn-new-transaction").style.display=o.includes(n)?"none":"flex",Re&&(Re.style.display=["page-dashboard","page-bancos","page-transacoes"].includes(n)?"flex":"none"),document.getElementById("btn-new-goal").style.display=n==="page-metas"?"flex":"none",document.getElementById("btn-new-fixed-transaction").style.display=n==="page-fixas"?"flex":"none",Dt.style.display=n==="page-cartoes"?"flex":"none",At.style.display=n==="page-categorias"?"flex":"none",Mt.style.display=n==="page-bancos"?"flex":"none",document.getElementById("btn-new-investment").style.display=n==="page-investimentos"?"flex":"none",document.querySelectorAll(".page-section").forEach(i=>i.classList.remove("active")),document.getElementById(n).classList.add("active")})});function Ft(){const t=`https://ui-avatars.com/api/?name=${w.email}&background=6366f1&color=fff`,e=w.displayName||"Usuário Vazio",a=w.photoURL||t;Gt.textContent=e,Wt.textContent=w.email,_t.src=a,document.getElementById("settings-name")&&(document.getElementById("settings-name").value=w.displayName||""),document.getElementById("settings-email")&&(document.getElementById("settings-email").value=w.email||""),document.getElementById("settings-photo")&&(document.getElementById("settings-photo").value=w.photoURL||"")}const Et={"btn-menu-personal":"modal-settings-personal","btn-menu-security":"modal-settings-security","btn-menu-devices":"modal-settings-devices","btn-menu-notifications":"modal-settings-notifications","btn-menu-report":"modal-settings-report","btn-menu-close-account":"modal-settings-close-account"};Object.keys(Et).forEach(t=>{const e=document.getElementById(t);e&&e.addEventListener("click",()=>{document.getElementById(Et[t]).classList.add("active")})});document.querySelectorAll('[id^="close-settings-"], [id^="btn-cancel-"]').forEach(t=>{t.addEventListener("click",e=>{const a=e.target.closest(".modal-overlay");a&&a.id.startsWith("modal-settings")&&a.classList.remove("active")})});const Ue=document.getElementById("form-settings-personal");Ue&&Ue.addEventListener("submit",async t=>{t.preventDefault();const e=Ue.querySelector('button[type="submit"]');e.disabled=!0;try{const a=document.getElementById("settings-name").value.trim(),n=document.getElementById("settings-photo").value.trim(),o=document.getElementById("settings-email").value.trim();await w.updateProfile({displayName:a,photoURL:n}),o!==w.email&&await w.updateEmail(o),Ft(),document.getElementById("settings-personal-msg").innerHTML="<span style='color:var(--success)'>Perfil atualizado!</span>",setTimeout(()=>{document.getElementById("settings-personal-msg").innerHTML="",document.getElementById("modal-settings-personal").classList.remove("active")},2e3)}catch(a){document.getElementById("settings-personal-msg").innerHTML=`<span style='color:var(--danger)'>${a.message}</span>`,a.code==="auth/requires-recent-login"&&(alert("Para alterar o e-mail, por segurança, é necessário fazer login novamente. Você será desconectado."),P.signOut())}finally{e.disabled=!1}});const De=document.getElementById("form-settings-security");De&&De.addEventListener("submit",async t=>{t.preventDefault();const e=De.querySelector('button[type="submit"]');e.disabled=!0;try{const a=document.getElementById("settings-new-password").value;await w.updatePassword(a),document.getElementById("settings-security-msg").innerHTML="<span style='color:var(--success)'>Senha atualizada!</span>",setTimeout(()=>{document.getElementById("settings-security-msg").innerHTML="",document.getElementById("modal-settings-security").classList.remove("active"),De.reset()},2e3)}catch(a){document.getElementById("settings-security-msg").innerHTML=`<span style='color:var(--danger)'>${a.message}</span>`,a.code==="auth/requires-recent-login"&&(alert("Para alterar a senha, é necessário fazer login novamente. Você será desconectado."),P.signOut())}finally{e.disabled=!1}});const It=document.getElementById("form-settings-notifications");It&&It.addEventListener("submit",t=>{t.preventDefault(),alert("Preferências salvas com sucesso no seu dispositivo local."),document.getElementById("modal-settings-notifications").classList.remove("active")});const Ye=document.getElementById("form-settings-report");Ye&&Ye.addEventListener("submit",t=>{t.preventDefault(),alert("Obrigado! Seu problema foi enviado à nossa equipe de suporte."),Ye.reset(),document.getElementById("modal-settings-report").classList.remove("active")});const J=document.getElementById("btn-confirm-close-account");J&&J.addEventListener("click",async()=>{if(confirm("Certeza ABSOLUTA? Todo seu histórico será excluído do banco de dados para sempre.")){J.disabled=!0,J.textContent="Apagando...";try{const t=w.uid,e=async a=>{const n=await a.where("userId","==",t).get(),o=S.batch();n.forEach(i=>o.delete(i.ref)),n.size>0&&await o.commit()};await e(L),await e(G),await e(Ee),await e(Y),await e(z),await e(xe),await w.delete()}catch(t){document.getElementById("settings-close-msg").innerHTML=`<span style='color:var(--danger)'>${t.message}</span>`,t.code==="auth/requires-recent-login"&&(alert("Para excluir a conta, faça login novamente. Você será desconectado."),P.signOut()),J.disabled=!1,J.innerHTML='<i class="fa-solid fa-trash"></i> Sim, Apagar Tudo'}}});function ia(){me&&me(),me=L.where("userId","==",w.uid).orderBy("date","desc").onSnapshot(t=>{I=[],t.forEach(e=>{I.push({id:e.id,...e.data()})}),_(),Ve(),He()})}function ra(){fe&&fe(),fe=Y.where("userId","==",w.uid).onSnapshot(t=>{B=[],t.forEach(e=>B.push({id:e.id,...e.data()})),He(),zt(),lt(),Ve()})}function sa(){ye&&ye(),ye=ae.where("userId","==",w.uid).onSnapshot(t=>{$=[],t.forEach(e=>$.push({id:e.id,...e.data()})),zt(),lt(),typeof window.populateReportBankSelect=="function"&&window.populateReportBankSelect(),_()})}function la(){ge&&ge(),ge=G.where("userId","==",w.uid).onSnapshot(t=>{V=[],t.forEach(e=>V.push({id:e.id,...e.data()})),Ve(),va()})}Q.addEventListener("submit",async t=>{var l;if(t.preventDefault(),window.isBulkMode){const d=document.getElementById("bulk-rows-container").querySelectorAll(".bulk-row");if(d.length===0)return alert("Adicione pelo menos uma transação!");try{const m=S.batch();let u=!1;for(const p of d){const c=p.querySelector(".bulk-row-type").value,g=p.querySelector(".bulk-row-desc").value.trim(),b=F(p.querySelector(".bulk-row-amount").value),x=p.querySelector(".bulk-row-date").value,y=p.querySelector(".bulk-row-category").value,f=p.querySelector(".bulk-row-pm").value;if(!g||isNaN(b)||b<=0||!y||!f||!x){u=!0,p.style.borderColor="var(--danger)",p.style.borderWidth="2px";continue}p.style.borderColor="var(--border)",p.style.borderWidth="1px";const h=L.doc();m.set(h,{userId:w.uid,type:c,description:g,amount:b,date:x,category:y,paymentMethod:f,createdAt:firebase.firestore.FieldValue.serverTimestamp()})}if(u){alert("Preencha todos os campos de todas as transações! As linhas com erro foram destacadas.");return}await m.commit(),O.classList.remove("active"),Q.reset(),window.resetBulkMode(),_(),T&&setTimeout(()=>window.filterCardExtract(T),200),M.id&&setTimeout(()=>window.filterBankExtract(M.id),200),typeof C=="function"&&C(`${d.length} transação(ões) salva(s) com sucesso!`)}catch(m){alert("Erro ao salvar lote: "+m.message)}return}const e=document.querySelector('input[name="type"]:checked').value,a=document.getElementById("description").value,n=F(document.getElementById("amount").value),o=((l=document.getElementById("transaction-goal"))==null?void 0:l.value)||"";if(!a||isNaN(n)||n<=0)return alert("Campos inválidos!");const i=R.value,s=B.some(d=>d.id===i),r=s&&e==="expense"?parseInt(at.value):1;try{if(be){const d=await L.where("groupId","==",be).get(),m=S.batch();d.forEach(u=>m.delete(u.ref)),await m.commit(),be=null}if(j){const d={userId:w.uid,type:e,description:a,amount:n,date:document.getElementById("date").value,category:document.getElementById("category").value,paymentMethod:i,goalId:o};await L.doc(j).update(d)}else if(!s||r===1){const d={userId:w.uid,type:e,description:a,amount:n,date:document.getElementById("date").value,category:document.getElementById("category").value,paymentMethod:i,goalId:o,createdAt:firebase.firestore.FieldValue.serverTimestamp()};await L.add(d)}else{const d=n,m=d/r,u=new Date(document.getElementById("date").value+"T00:00:00"),p="grp_"+Date.now().toString(36)+Math.random().toString(36).substr(2,5);for(let c=1;c<=r;c++){const g=new Date(u.getTime());g.setMonth(g.getMonth()+(c-1));const b=g.toISOString().slice(0,10),x=a+` (${c}/${r})`,y={userId:w.uid,type:e,description:x,amount:m,category:document.getElementById("category").value,date:b,paymentMethod:i,goalId:o,createdAt:firebase.firestore.FieldValue.serverTimestamp(),groupId:p,installmentTotal:r,totalAmount:d};await L.add(y)}}O.classList.remove("active"),Q.reset(),se(),document.querySelector("#transaction-modal h2").textContent="Nova Transação",j=null,qe=null,he=null,_(),T&&setTimeout(()=>window.filterCardExtract(T),200),M.id&&setTimeout(()=>window.filterBankExtract(M.id),200),document.getElementById("page-transacoes").classList.contains("active")&&setTimeout(()=>U(),200)}catch(d){alert("Erro ao salvar: "+d.message)}});window.editTransaction=t=>{const e=document.getElementById("tx-modal-tabs");e&&(e.style.display="none"),window.resetBulkMode&&window.resetBulkMode();const a=I.find(n=>n.id===t);if(a){if(a.groupId&&confirm(`Esta transação faz parte de um parcelamento em multiplas vezes.

Deseja editar TODAS as faturas juntas (o que apagará os registros atuais e re-gerará os novos a partir de hoje) ou editar apenas este lançamento individual? 

[OK] para Editar Completo 
[Cancelar] para Individual`)){document.querySelector(`#type-${a.type}`).checked=!0;const n=a.description.replace(/\s\(\d+\/\d+\)$/,"");document.getElementById("description").value=n,document.getElementById("amount").value=a.totalAmount,document.getElementById("date").value=a.date,document.getElementById("category").value=a.category,populateGoalsSelect(),document.getElementById("transaction-goal").value=a.goalId||"",a.paymentMethod?R.value=a.paymentMethod:R.value="checking",se(),at.value=a.installmentTotal||1,j=null,be=a.groupId,document.querySelector("#transaction-modal h2").textContent="Editar Múltiplas Parcelas",O.classList.add("active");return}document.querySelector(`#type-${a.type}`).checked=!0,document.getElementById("description").value=a.description,document.getElementById("amount").value=a.amount,document.getElementById("date").value=a.date,document.getElementById("category").value=a.category,populateGoalsSelect(),document.getElementById("transaction-goal").value=a.goalId||"",a.paymentMethod?R.value=a.paymentMethod:R.value="checking",se(),Ze.style.display="none",j=t,document.querySelector("#transaction-modal h2").textContent="Editar Transação",O.classList.add("active")}};window.deleteTransaction=async t=>{const e=I.find(a=>a.id===t);if(e){if(e.groupId&&confirm(`Esta é uma transação parcelada. Deseja excluir TODAS as parcelas associadas a esta compra?

[OK] Sim, apagar todas
[Cancelar] Não, apagar apenas essa individual`)){const a=await L.where("groupId","==",e.groupId).get(),n=S.batch();a.forEach(o=>n.delete(o.ref)),await n.commit();return}confirm("Excluir transação individualmente?")&&await L.doc(t).delete()}};function da(){ue&&ue(),ue=Ee.where("userId","==",w.uid).orderBy("createdAt","desc").onSnapshot(t=>{oe=[],t.forEach(e=>oe.push({id:e.id,...e.data()})),Rt()},t=>console.error("Goal snapshot error:",t.message))}pt.addEventListener("submit",async t=>{t.preventDefault();try{await Ee.add({userId:w.uid,name:document.getElementById("goal-name").value,targetValue:F(document.getElementById("goal-target").value),currentValue:F(document.getElementById("goal-current").value),createdAt:firebase.firestore.FieldValue.serverTimestamp()}),Ie.classList.remove("active"),pt.reset()}catch(e){alert("Erro: "+e.message)}});window.addFundsToGoal=(t,e,a)=>{const n=document.getElementById("goal-contribution-modal"),o=document.getElementById("form-goal-contribution");document.getElementById("contribution-goal-id").value=t,document.getElementById("contribution-goal-current").value=e,document.getElementById("contribution-goal-max").value=a,o.reset(),document.getElementById("goal-contribution-amount").value="",document.getElementById("contribution-source-select").value="",document.getElementById("contribution-category").value="Investimentos",document.querySelector('input[name="contribution-source"][value="source"]').checked=!0,document.getElementById("contribution-source-select-container").style.display="block",document.getElementById("contribution-category-container").style.display="block",ca(),n.classList.add("active")};function ca(){const t=document.getElementById("contribution-source-select");if(!t)return;let e='<option value="" disabled selected>Selecione uma conta ou cartão...</option>';$.length>0&&$.forEach(a=>{const n=a.balance||0;e+=`<option value="bank_${a.id}" data-type="bank">🏦 ${a.name} (Saldo: ${v(n)})</option>`}),B.length>0&&B.forEach(a=>{const n=I.filter(i=>i.paymentMethod===a.id).reduce((i,s)=>i+(s.type==="expense"?s.amount:-s.amount),0),o=a.limit-n;e+=`<option value="card_${a.id}" data-type="card">💳 ${a.nickname} (${a.bank}) - Disponível: ${v(o)}</option>`}),$.length===0&&B.length===0&&(e='<option value="" disabled selected>Nenhuma conta ou cartão cadastrado</option>'),t.innerHTML=e}document.querySelectorAll('input[name="contribution-source"]').forEach(t=>{t.addEventListener("change",function(){const e=document.getElementById("contribution-source-select-container"),a=document.getElementById("contribution-category-container");this.value==="none"?(e.style.display="none",a.style.display="none"):(e.style.display="block",a.style.display="block")})});document.getElementById("form-goal-contribution").addEventListener("submit",async function(t){t.preventDefault();const e=document.getElementById("contribution-goal-id").value,a=parseFloat(document.getElementById("contribution-goal-current").value),n=parseFloat(document.getElementById("contribution-goal-max").value),o=F(document.getElementById("goal-contribution-amount").value),i=document.querySelector('input[name="contribution-source"]:checked').value,s=document.getElementById("contribution-source-select").value,r=document.getElementById("contribution-category").value;if(!o||o<=0){alert("Por favor, insira um valor válido.");return}if(i!=="none"&&!s){alert("Por favor, selecione a conta ou cartão de origem.");return}try{const l=Math.min(a+o,n);if(await Ee.doc(e).update({currentValue:l}),i!=="none"){const d=s.split("_"),m=d[0],u=d[1];let p="";if(m==="bank"){const x=$.find(y=>y.id===u);p=x?x.name:"Conta"}else if(m==="card"){const x=B.find(y=>y.id===u);p=x?x.nickname:"Cartão"}const c=oe.find(x=>x.id===e),g=c?c.name:"Meta",b={userId:w.uid,type:"expense",description:`Aporte para Meta: ${g} (${p})`,amount:o,category:r||"Investimentos",date:new Date().toISOString().slice(0,10),paymentMethod:u,createdAt:firebase.firestore.FieldValue.serverTimestamp(),goalId:e};await L.add(b),typeof C=="function"&&C(`Aporte de ${v(o)} adicionado com sucesso!`)}document.getElementById("goal-contribution-modal").classList.remove("active"),Rt(),_()}catch(l){alert("Erro ao adicionar aporte: "+l.message)}});document.getElementById("close-goal-contribution-modal").addEventListener("click",()=>{document.getElementById("goal-contribution-modal").classList.remove("active")});document.getElementById("btn-cancel-contribution").addEventListener("click",()=>{document.getElementById("goal-contribution-modal").classList.remove("active")});document.getElementById("goal-contribution-modal").addEventListener("click",t=>{t.target===t.currentTarget&&document.getElementById("goal-contribution-modal").classList.remove("active")});window.deleteGoal=async t=>{confirm("A meta será excluída. Continuar?")&&await Ee.doc(t).delete()};function Rt(){if(Ge.innerHTML="",oe.length===0){Ge.innerHTML='<div class="empty-state w-100" style="grid-column: 1/-1;"><i class="fa-solid fa-piggy-bank"></i><p>Nenhuma meta ativa.</p></div>';return}oe.forEach(t=>{const e=Math.min(t.currentValue/t.targetValue*100,100).toFixed(1),a=e>=100,n=t.targetValue-t.currentValue,o=n>0?v(n):"R$ 0,00";Ge.innerHTML+=`
        <div class="goal-card">
            <div class="goal-header">
                <h3>${t.name}</h3>
                <span class="percent" style="color: ${a?"var(--success)":"var(--primary)"}">${e}%</span>
            </div>
            <div class="progress-container">
                <div class="progress-bar" style="width: ${e}%; background: ${a?"var(--success)":"linear-gradient(90deg, var(--primary), #818cf8)"};"></div>
            </div>
            <div class="goal-footer">
                <div class="goal-values">
                    <p>Atual: <strong>${v(t.currentValue)}</strong></p>
                    <p>Total: <strong>${v(t.targetValue)}</strong></p>
                    ${n>0?`<p style="margin-top: 4px;">Falta: <strong>${o}</strong></p>`:'<p style="color: var(--success); margin-top: 4px;">✅ Meta alcançada!</p>'}
                </div>
                <div class="goal-actions" style="display:flex; gap:8px;">
                    <button class="btn-icon" onclick="window.addFundsToGoal('${t.id}', ${t.currentValue}, ${t.targetValue})" title="Adicionar fundo"><i class="fa-solid fa-hand-holding-dollar" style="color:var(--success)"></i></button>
                    <button class="btn-icon" onclick="window.deleteGoal('${t.id}')" title="Excluir Meta"><i class="fa-solid fa-trash"></i></button>
                </div>
            </div>
        </div>
    `})}const tt=[{name:"Salário",icon:"fa-sack-dollar"},{name:"Alimentação",icon:"fa-utensils"},{name:"Moradia",icon:"fa-house"},{name:"Transporte",icon:"fa-car"},{name:"Lazer",icon:"fa-gamepad"},{name:"Saúde",icon:"fa-heart-pulse"},{name:"Investimentos",icon:"fa-chart-line"},{name:"Cartão",icon:"fa-credit-card"},{name:"Outros",icon:"fa-tag"}],ma=["fa-tag","fa-utensils","fa-house","fa-car","fa-gamepad","fa-heart-pulse","fa-chart-line","fa-sack-dollar","fa-bag-shopping","fa-basket-shopping","fa-plane","fa-bolt","fa-mobile","fa-graduation-cap","fa-dog","fa-shirt","fa-music","fa-gift","fa-scissors","fa-wrench","fa-book","fa-cart-shopping"];let Ke=!1;async function ua(){if(!Ke){Ke=!0;try{const t=await z.where("userId","==",w.uid).get(),e=new Set(t.docs.map(o=>o.data().name.trim().toLowerCase())),a=S.batch();let n=0;for(const o of tt)if(!e.has(o.name.trim().toLowerCase())){const i=z.doc();a.set(i,{userId:w.uid,...o}),n++}n>0&&await a.commit()}catch(t){console.error("Erro ao semear categorias padrão:",t)}finally{Ke=!1}}}function pa(){pe&&pe(),pe=z.where("userId","==",w.uid).onSnapshot(async t=>{if(t.empty&&A.length===0){ua();return}A=[],t.forEach(e=>A.push({id:e.id,...e.data()})),A.sort((e,a)=>e.name.localeCompare(a.name)),ya(),ga()})}function ga(){const t=A.map(e=>`<option value="${e.name}">${e.name}</option>`).join("");document.getElementById("category").innerHTML='<option value="" disabled selected>Selecione</option>'+t,document.getElementById("fixed-category").innerHTML='<option value="" disabled selected>Selecione</option>'+t,document.getElementById("filter-category").innerHTML='<option value="all">Todas Categ.</option>'+t}function fa(){wt&&(wt.innerHTML=ma.map(t=>`
        <div class="icon-option" onclick="window.selectCategoryIcon('${t}', this)" style="display:flex; justify-content:center; align-items:center; width: 40px; height: 40px; border-radius: 8px; border: 1px solid var(--border); cursor: pointer; transition: 0.2s;">
            <i class="fa-solid ${t}"></i>
        </div>
    `).join(""))}window.selectCategoryIcon=(t,e)=>{document.getElementById("category-icon").value=t,document.querySelectorAll(".icon-option").forEach(a=>{a.style.borderColor="var(--border)",a.style.borderWidth="1px"}),e.style.borderColor="#8b5cf6",e.style.borderWidth="2px"};function ya(){if(Se){if(Se.innerHTML="",A.length===0){Se.innerHTML=`
            <div class="empty-state w-100" style="grid-column: 1/-1;">
                <i class="fa-solid fa-tags"></i>
                <p>Nenhuma categoria cadastrada.</p>
                <p style="font-size: 0.85rem; margin-top: 8px;">Clique em "Nova Categoria" para criar sua primeira categoria.</p>
            </div>
        `;return}A.forEach(t=>{Se.innerHTML+=`
            <div class="category-ui" style="background:var(--bg-secondary); border: 1px solid var(--border); padding: 16px; border-radius: 12px; display:flex; align-items:center; justify-content:space-between; transition: 0.2s;">
                <div style="display:flex; align-items:center; gap: 12px;">
                    <div style="width: 40px; height: 40px; border-radius: 50%; background:var(--bg-main); color:var(--text-main); display:flex; align-items:center; justify-content:center; font-size: 1.2rem; border: 1px solid var(--border)">
                        <i class="fa-solid ${t.icon||"fa-tag"}"></i>
                    </div>
                    <span style="font-weight: 600;">${t.name}</span>
                </div>
                <div style="display:flex; gap: 8px;">
                    <button class="btn-icon" onclick="window.editCategory('${t.id}')" title="Editar Categoria">
                        <i class="fa-solid fa-pen" style="color:var(--text-muted)"></i>
                    </button>
                    <button class="btn-icon" onclick="window.deleteCategory('${t.id}')" title="Excluir Categoria">
                        <i class="fa-solid fa-trash" style="color:var(--danger)"></i>
                    </button>
                </div>
            </div>
        `})}}window.editCategory=t=>{const e=A.find(a=>a.id===t);e&&(document.getElementById("category-id").value=e.id,document.getElementById("category-name").value=e.name,document.getElementById("category-icon").value=e.icon||"fa-tag",document.getElementById("category-modal-title").textContent="Editar Categoria",document.getElementById("category-submit-text").textContent="Atualizar Categoria",document.querySelectorAll(".icon-option").forEach(a=>{const n=a.querySelector("i");n&&n.classList.contains(e.icon)?(a.style.borderColor="#8b5cf6",a.style.borderWidth="2px"):(a.style.borderColor="var(--border)",a.style.borderWidth="1px")}),K.classList.add("active"))};function Oe(){document.getElementById("category-id").value="",document.getElementById("category-name").value="",document.getElementById("category-icon").value="",document.getElementById("category-modal-title").textContent="Nova Categoria",document.getElementById("category-submit-text").textContent="Salvar Categoria",document.querySelectorAll(".icon-option").forEach(t=>{t.style.borderColor="var(--border)",t.style.borderWidth="1px"})}window.deleteCategory=async t=>{const e=A.find(s=>s.id===t);if(!e)return;const a=I.filter(s=>s.category===e.name),n=V.filter(s=>s.category===e.name),o=a.length+n.length;let i=`Excluir a categoria "${e.name}"?`;if(o>0&&(i+=`

⚠️ Esta categoria está sendo usada em ${o} transação(ões).
As transações existentes NÃO serão alteradas e ficarão com o nome "${e.name}" como categoria.`),i+=`

Deseja continuar?`,!!confirm(i))try{await z.doc(t).delete(),typeof C=="function"&&C(`Categoria "${e.name}" excluída com sucesso!`)}catch(s){alert("Erro ao excluir categoria: "+s.message)}};et.addEventListener("submit",async t=>{t.preventDefault();const e=document.getElementById("category-id").value,a=document.getElementById("category-name").value,n=document.getElementById("category-icon").value||"fa-tag",o=a.trim();if(!o)return alert("Por favor, digite um nome válido para a categoria.");const i=o.toLowerCase();if(A.some(r=>r.name.trim().toLowerCase()===i&&r.id!==e)){alert("Já existe uma categoria com este nome.");return}try{e?await z.doc(e).update({name:o,icon:n}):await z.add({userId:w.uid,name:o,icon:n}),K.classList.remove("active"),et.reset(),Oe(),typeof C=="function"&&C(e?"Categoria atualizada com sucesso!":"Categoria criada com sucesso!")}catch(r){alert("Erro ao salvar categoria: "+r.message)}});At.addEventListener("click",()=>{Oe(),et.reset(),document.getElementById("category-icon").value="",document.querySelectorAll(".icon-option").forEach(t=>{t.style.borderColor="var(--border)",t.style.borderWidth="1px"}),K.classList.add("active")});aa.addEventListener("click",()=>{K.classList.remove("active"),Oe()});na.addEventListener("click",()=>{K.classList.remove("active"),Oe()});function va(){const t=new Date().toISOString().slice(0,7),e=new Date().getDate();V.forEach(async a=>{if(a.isAutomatic&&e>=a.dayOfMonth&&a.lastProcessedMonth!==t){a.lastProcessedMonth=t;try{await L.add({userId:w.uid,type:a.type,description:a.description+" (Automática)",amount:a.amount,date:new Date().toISOString().slice(0,10),category:a.category,paymentMethod:a.paymentMethod||"",fixedTransactionId:a.id,createdAt:firebase.firestore.FieldValue.serverTimestamp()}),await G.doc(a.id).update({lastProcessedMonth:t})}catch(n){console.error("Erro processamento automático:",n)}}})}Te.addEventListener("submit",async t=>{t.preventDefault();const e=document.querySelector('input[name="fixed-type"]:checked').value,a=document.getElementById("fixed-description").value,n=F(document.getElementById("fixed-amount").value),o=document.getElementById("fixed-category").value,i=document.getElementById("fixed-is-automatic").checked;let s=parseInt(document.getElementById("fixed-day").value);if((isNaN(s)||s<1||s>31)&&(s=new Date().getDate()),!a||isNaN(n)||n<=0)return alert("Campos inválidos!");const r={userId:w.uid,type:e,description:a,amount:n,category:o,isAutomatic:i,dayOfMonth:s};try{ee?await G.doc(ee).update(r):await G.add(r),le.classList.remove("active"),Te.reset(),document.querySelector("#fixed-transaction-modal h2").textContent="Nova Transação Fixa",ee=null}catch(l){alert("Erro ao salvar: "+l.message)}});window.editFixedTransaction=t=>{const e=V.find(a=>a.id===t);e&&(document.querySelector(`#fixed-type-${e.type}`).checked=!0,document.getElementById("fixed-description").value=e.description,document.getElementById("fixed-amount").value=e.amount,document.getElementById("fixed-category").value=e.category,document.getElementById("fixed-is-automatic").checked=e.isAutomatic,document.getElementById("fixed-day").value=e.dayOfMonth||1,ee=t,document.querySelector("#fixed-transaction-modal h2").textContent="Editar Transação Fixa",le.classList.add("active"))};window.deleteFixedTransaction=async t=>{confirm("Deseja excluir esta transação recorrente? Isso não alterará o histórico passado.")&&await G.doc(t).delete()};window.launchManualFixedTransaction=async t=>{const e=V.find(a=>a.id===t);e&&(j=null,qe=e.id,document.querySelector("#transaction-modal h2").textContent="Lançar Transação Fixa",Q.reset(),document.querySelector(`#type-${e.type}`).checked=!0,document.getElementById("description").value=e.description,document.getElementById("amount").value=e.amount,document.getElementById("date").value=new Date().toISOString().slice(0,10),document.getElementById("category").value=e.category,R&&(R.value=e.paymentMethod||""),O.classList.add("active"))};window.launchCardFatura=async(t,e)=>{const a=B.find(s=>s.id===t);if(!a)return;he=a.id;const n=parseFloat(e)===0;document.getElementById("card-payment-title").textContent=n?`Adiantar Pagamento: ${a.nickname}`:`Pagar Fatura: ${a.nickname}`;const o=document.getElementById("card-payment-total-container");o&&(o.style.display=n?"none":"block"),document.getElementById("card-payment-total-display").textContent=v(parseFloat(e));let i=parseFloat(e)>0?parseFloat(e).toFixed(2):"";document.getElementById("card-payment-amount").value=i?i.replace(".",","):"",document.getElementById("card-payment-interest").value="",document.getElementById("card-payment-date").value=new Date().toISOString().slice(0,10),ze.classList.add("active")};gt.addEventListener("submit",async t=>{t.preventDefault();const e=document.getElementById("card-payment-amount").value,a=document.getElementById("card-payment-interest").value,n=document.getElementById("card-payment-date").value,o=F(e),i=F(a),s=document.getElementById("card-payment-source-bank").value;if(isNaN(o)||o<=0){alert("Por favor, insira um valor válido para o pagamento.");return}if(!s){alert("Por favor, selecione uma conta de origem.");return}if(!n){alert("Por favor, selecione a data do pagamento.");return}const r=B.find(l=>l.id===he);if(!r){alert("Cartão não encontrado. Tente novamente.");return}try{const l=$.find(g=>g.id===s);if(l){const g=I.filter(f=>f.paymentMethod===s),b=g.filter(f=>f.type==="income").reduce((f,h)=>f+h.amount,0),x=g.filter(f=>f.type==="expense").reduce((f,h)=>f+h.amount,0),y=(l.balance||0)+b-x;if(y<o+i&&!confirm(`Saldo insuficiente na conta "${l.name}".
Saldo atual: ${v(y)}
Valor do pagamento: ${v(o+i)}

Deseja continuar mesmo assim?`))return}const d=S.batch(),m=n,u=L.doc();d.set(u,{userId:w.uid,type:"expense",description:`Pagamento Fatura: ${r.nickname}`,amount:o+i,category:"Cartão",date:m,paymentMethod:s,createdAt:firebase.firestore.FieldValue.serverTimestamp()});const p=L.doc();d.set(p,{userId:w.uid,type:"income",description:`Pagamento Recebido - ${r.nickname}`,amount:o,category:"Cartão",date:m,paymentMethod:r.id,createdAt:firebase.firestore.FieldValue.serverTimestamp()});const c=new Date().toISOString().slice(0,7);d.update(Y.doc(r.id),{lastProcessedMonth:c}),await d.commit(),ze.classList.remove("active"),gt.reset(),he=null,typeof C=="function"?C(`Pagamento de ${v(o+i)} para ${r.nickname} efetuado com sucesso!`):alert(`Pagamento de ${v(o+i)} para ${r.nickname} efetuado com sucesso!`),_(),T&&setTimeout(()=>window.filterCardExtract(T),200),M.id&&setTimeout(()=>window.filterBankExtract(M.id),200),Ve()}catch(l){console.error("Erro ao pagar fatura:",l),typeof C=="function"?C("Erro ao pagar fatura: "+l.message,!0):alert("Erro ao pagar fatura: "+l.message)}});function Pt(t){const e=A.find(a=>a.name===t);return e?e.icon:"fa-tag"}function Ve(){if(Ce.innerHTML="",V.length===0&&B.length===0){Ce.innerHTML='<div class="empty-state"><i class="fa-solid fa-repeat"></i><p>Nenhuma transação fixa cadastrada.</p></div>';return}const t=new Date().toISOString().slice(0,7);V.forEach(e=>{const a=e.type==="income",n=a?"+":"-",o=e.isAutomatic?`Todo dia ${e.dayOfMonth} (Auto)`:`Lançamento Manual (Venc. Dia ${e.dayOfMonth})`,i=e.lastProcessedMonth===t;let s="";i&&(s='<span style="font-size: 0.65rem; background: var(--success-bg); color: var(--success); padding: 4px 8px; border-radius: 12px; font-weight: 700; margin-left: 12px;"><i class="fa-solid fa-check"></i> Lançado este mês</span>');let r=i?"":`<button class="btn-icon" onclick="window.launchManualFixedTransaction('${e.id}')" title="Lançar agora"><i class="fa-solid fa-play" style="color:var(--success)"></i></button>`;Ce.innerHTML+=`
            <div class="transaction-item">
                <div class="tx-left" style="flex: 1;">
                    <div class="tx-icon ${a?"income":"expense"}"><i class="fa-solid ${a?"fa-arrow-up":"fa-arrow-down"}"></i></div>
                    <div class="tx-details">
                        <p class="tx-title" style="display:flex; align-items:center;">${e.description} ${s}</p>
                        <p class="tx-category"><i class="fa-solid ${Pt(e.category)}"></i> ${e.category} | ${o}</p>
                    </div>
                </div>
                <div class="tx-right">
                    <p class="tx-amount ${a?"positive":"negative"}">${n} ${v(e.amount)}</p>
                </div>
                <div class="tx-actions" style="display:flex; gap: 8px;">
                    ${r}
                    <button class="btn-icon" onclick="window.editFixedTransaction('${e.id}')" title="Editar"><i class="fa-solid fa-pen"></i></button>
                    <button class="btn-icon" onclick="window.deleteFixedTransaction('${e.id}')" title="Excluir"><i class="fa-solid fa-trash"></i></button>
                </div>
            </div>`}),B.forEach(e=>{const a=I.filter(r=>r.paymentMethod===e.id&&r.date&&r.date.startsWith(t)).reduce((r,l)=>r+(l.type==="expense"?l.amount:-l.amount),0),n=`Pagamento de Fatura (Venc. Dia ${e.dueDay})`,o=e.lastProcessedMonth===t;let i="";o&&(i='<span style="font-size: 0.65rem; background: var(--success-bg); color: var(--success); padding: 4px 8px; border-radius: 12px; font-weight: 700; margin-left: 12px;"><i class="fa-solid fa-check"></i> Pago este mês</span>');let s=o?"":`<button class="btn-icon" onclick="window.launchCardFatura('${e.id}', ${a})" title="Pagar Fatura Agora"><i class="fa-solid fa-play" style="color:var(--success)"></i></button>`;Ce.innerHTML+=`
            <div class="transaction-item" style="border-left: 4px solid var(--primary);">
                <div class="tx-left" style="flex: 1;">
                    <div class="tx-icon expense"><i class="fa-solid fa-credit-card"></i></div>
                    <div class="tx-details">
                        <p class="tx-title" style="display:flex; align-items:center;">Fatura: ${e.nickname} ${i}</p>
                        <p class="tx-category"><i class="fa-solid fa-credit-card"></i> Cartão de Crédito | ${n}</p>
                    </div>
                </div>
                <div class="tx-right">
                    <p class="tx-amount negative">- ${v(Math.max(a,0))}</p>
                </div>
                <div class="tx-actions" style="display:flex; gap: 8px;">
                    ${s}
                </div>
            </div>`})}Ae.addEventListener("submit",async t=>{t.preventDefault();const e=document.getElementById("card-nickname").value,a=document.getElementById("card-bank").value,n=F(document.getElementById("card-limit").value),o=parseInt(document.getElementById("card-closing").value),i=parseInt(document.getElementById("card-due").value);if(!e||!a||isNaN(n)||n<=0||isNaN(o)||o<1||isNaN(i)||i<1)return alert("Campos inválidos!");const s={userId:w.uid,nickname:e,bank:a,limit:n,closingDay:o,dueDay:i};try{te?await Y.doc(te).update(s):await Y.add(s),de.classList.remove("active"),Ae.reset(),document.querySelector("#card-modal h2").textContent="Novo Cartão de Crédito",te=null}catch(r){alert("Erro ao salvar: "+r.message)}});window.editCard=t=>{const e=B.find(a=>a.id===t);e&&(document.getElementById("card-nickname").value=e.nickname,document.getElementById("card-bank").value=e.bank,document.getElementById("card-limit").value=e.limit,document.getElementById("card-closing").value=e.closingDay,document.getElementById("card-due").value=e.dueDay,te=t,document.querySelector("#card-modal h2").textContent="Editar Cartão",de.classList.add("active"))};window.deleteCard=async t=>{confirm("Excluir este cartão permanentemente?")&&await Y.doc(t).delete()};function He(){if(lt(),Le.innerHTML="",B.length===0){Le.innerHTML='<div class="empty-state w-100" style="grid-column: 1/-1;"><i class="fa-solid fa-credit-card"></i><p>Nenhum cartão cadastrado.</p></div>';return}const t={Nubank:"bank-nubank","Banco Inter":"bank-inter",Itaú:"bank-itaú",Bradesco:"bank-bradesco",Santander:"bank-santander","C6 Bank":"bank-c6","Banco do Brasil":"bank-bb","XP Investimentos":"bank-xp","Caixa Econômica":"bank-caixa",Outro:"bank-default"};B.forEach(a=>{const n=t[a.bank]||"bank-default",o=I.filter(r=>r.paymentMethod===a.id).reduce((r,l)=>r+(l.type==="expense"?l.amount:-l.amount),0),i=a.limit-o,s=i<0?"#ff6b6b":"inherit";Le.innerHTML+=`
            <div class="credit-card-ui ${n}" onclick="window.toggleCardExtract('${a.id}', event)" style="cursor: pointer;">
                <div class="cc-header">
                    <span class="cc-bank">${a.bank}</span>
                    <div class="cc-chip"></div>
                </div>
                <div class="cc-info">
                    <p class="cc-name">${a.nickname}</p>
                    <p class="cc-limit" style="font-size:1.25rem; margin-bottom:2px; color:${s};">Disp: ${v(i)}</p>
                    <p style="font-size:0.8rem; margin-bottom: 12px; opacity: 0.8;">Limite Total: ${v(a.limit)}</p>
                    <div class="cc-dates">
                        <span>Fec. Dia ${a.closingDay}</span>
                        <span>Venc. Dia ${a.dueDay}</span>
                    </div>
                </div>
                <div class="cc-actions">
                    <button class="btn-icon" onclick="window.editCard('${a.id}')" title="Editar"><i class="fa-solid fa-pen"></i></button>
                    <button class="btn-icon" onclick="window.deleteCard('${a.id}')" title="Excluir"><i class="fa-solid fa-trash"></i></button>
                </div>
            </div>
        `});const e=B.find(a=>a.id===T);if(e){const a=D.id===e.id?D.month:window.getInvoiceMonth(new Date().toISOString().slice(0,10),e.closingDay);Le.innerHTML+=`
        <div class="card-extract-inline">
            <div class="extract-header">
                <h3>
                    <i class="fa-solid fa-credit-card" style="color: var(--primary);"></i>
                    Faturas: ${e.nickname}
                    <span class="bank-name">(${e.bank})</span>
                </h3>
                <button class="close-btn btn-icon" onclick="window.closeCardExtract()" title="Fechar extrato">
                    <i class="fa-solid fa-xmark"></i>
                </button>
            </div>
            
            <div class="extract-filters">
                <input type="text" id="cc-filter-search" oninput="window.filterCardExtract('${e.id}')" 
                    placeholder="Buscar..." class="filter-input search" 
                    value="${D.id===e.id?D.search:""}">
                
                <input type="date" id="cc-filter-start" onchange="window.filterCardExtract('${e.id}')" 
                    class="filter-input date" title="Data Inicial" 
                    value="${D.id===e.id?D.startDate:""}">
                
                <input type="date" id="cc-filter-end" onchange="window.filterCardExtract('${e.id}')" 
                    class="filter-input date" title="Data Final" 
                    value="${D.id===e.id?D.endDate:""}">
                
                <div class="month-navigation">
                    <button class="nav-btn btn-icon" onclick="window.navigateCardMonth('${e.id}', -1)" title="Mês anterior">
                        <i class="fa-solid fa-chevron-left"></i>
                    </button>
                    
                    <input type="month" id="cc-filter-month" value="${a}" 
                        onchange="window.filterCardExtract('${e.id}')" class="month-input" title="Mês da Fatura">
                    
                    <button class="nav-btn btn-icon" onclick="window.navigateCardMonth('${e.id}', 1)" title="Próximo mês">
                        <i class="fa-solid fa-chevron-right"></i>
                    </button>
                    
                    <div class="divider"></div>
                    
                    <button class="reset-btn btn-icon" onclick="window.resetCardMonth('${e.id}')" title="Voltar para o mês atual">
                        <i class="fa-solid fa-rotate-left"></i>
                    </button>
                </div>
                
                <button class="action-btn anticipate btn btn-outline" onclick="window.launchCardFatura('${e.id}', 0)">
                    <i class="fa-solid fa-forward"></i> Antecipar Pagamento
                </button>
                
                <button id="btn-pay-invoice-${e.id}" class="action-btn pay btn btn-success" style="display: none;">
                    <i class="fa-solid fa-check"></i> Pagar Fatura
                </button>
                
                <button class="action-btn report btn btn-primary" onclick="window.generateCardReport('${e.id}')">
                    <i class="fa-solid fa-print"></i> Relatório
                </button>
            </div>
            
            <div class="transactions-list-container" id="inline-card-transactions">
                <!-- As transações são renderizadas via JavaScript -->
            </div>
            
            <div class="extract-footer">
                <div class="info-group">
                    <span><i class="fa-regular fa-calendar"></i> Fechamento: Dia ${e.closingDay}</span>
                    <span><i class="fa-regular fa-clock"></i> Vencimento: Dia ${e.dueDay}</span>
                    <span><i class="fa-solid fa-credit-card"></i> Limite: ${v(e.limit)}</span>
                </div>
                <div>
                    <span id="card-total-transactions-${e.id}">
                        <i class="fa-regular fa-file-lines"></i> 0 transações
                    </span>
                </div>
            </div>
        </div>`}T&&setTimeout(()=>window.filterCardExtract(T),50)}window.toggleCardExtract=(t,e)=>{e&&e.target.closest("button")||(T=T===t?null:t,He())};window.closeCardExtract=()=>{T=null,He()};window.getInvoiceMonth=(t,e)=>{if(!t)return"";const a=new Date(t+"T00:00:00");let n=a.getFullYear(),o=a.getMonth()+1;return a.getDate()>=e&&(o++,o>12&&(o=1,n++)),`${n}-${o.toString().padStart(2,"0")}`};window.filterCardExtract=t=>{var y,f,h,k;const e=document.getElementById("inline-card-transactions");if(!e)return;const a=B.find(E=>E.id===t);if(!a)return;D.id=t,D.search=((y=document.getElementById("cc-filter-search"))==null?void 0:y.value)||"",D.startDate=((f=document.getElementById("cc-filter-start"))==null?void 0:f.value)||"",D.endDate=((h=document.getElementById("cc-filter-end"))==null?void 0:h.value)||"",D.month=((k=document.getElementById("cc-filter-month"))==null?void 0:k.value)||"";const n=D.search.toLowerCase(),o=D.startDate,i=D.endDate,s=D.month;let r=I.filter(E=>E.paymentMethod===t);n&&(r=r.filter(E=>E.description.toLowerCase().includes(n)||E.category.toLowerCase().includes(n))),o&&(r=r.filter(E=>E.date>=o)),i&&(r=r.filter(E=>E.date<=i)),s&&(r=r.filter(E=>window.getInvoiceMonth(E.date,a.closingDay)===s));const l=r.filter(E=>E.type==="expense").reduce((E,q)=>E+q.amount,0),d=r.filter(E=>E.type==="income").reduce((E,q)=>E+q.amount,0),m=l-d;let u=0,p=0;I.filter(E=>E.paymentMethod===t).forEach(E=>{if(E.type==="income")p+=E.amount;else{const q=window.getInvoiceMonth(E.date,a.closingDay);s?q<=s&&(u+=E.amount):u+=E.amount}});const c=u-p,b=s&&c<=0&&u>0?'<span style="background: var(--success); color: white; padding: 4px 8px; border-radius: 4px; font-size: 0.8rem; margin-left: 12px;"><i class="fa-solid fa-check-double"></i> Fatura Paga</span>':s&&u>0?'<span style="background: var(--warning); color: white; padding: 4px 8px; border-radius: 4px; font-size: 0.8rem; margin-left: 12px;"><i class="fa-solid fa-clock"></i> Em Aberto</span>':"";if(je(r,"inline-card-transactions"),r.length>0||u>0){const E=s?`Resumo da Fatura (${s})${b}`:"Resumo Filtrado:",q=s?`Mês: ${ke(s)}`:"Sem filtro de mês";let $e=`
            <div style="padding: 16px; margin-bottom: 12px; background: var(--bg-body); border-radius: 8px; border: 1px solid var(--border);">
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px;">
                    <span style="font-weight: 600; font-size: 1.1rem;">${E}</span>
                    <span style="font-size: 0.8rem; color: var(--text-muted);">${q}</span>
                </div>
                <div style="display: flex; justify-content: space-between; align-items: center; font-size: 0.9rem; color: var(--text-muted); margin-bottom: 4px;">
                    <span>Movimentação do período:</span>
                    <span style="color: ${m>0?"var(--danger)":"var(--success)"};">${v(Math.abs(m))}</span>
                </div>
                ${s?`
                <div style="display: flex; justify-content: space-between; align-items: center; font-size: 1.1rem; font-weight: 700; margin-top: 8px; padding-top: 8px; border-top: 1px dashed var(--border);">
                    <span>Restante a Pagar (Acumulado):</span>
                    <span style="color: ${c>0?"var(--danger)":"var(--success)"};">${v(Math.max(0,c))}</span>
                </div>
                `:""}
            </div>
        `;e.insertAdjacentHTML("afterbegin",$e)}const x=document.getElementById(`btn-pay-invoice-${t}`);x&&(s&&c>0?(x.style.display="flex",x.onclick=()=>window.launchCardFatura(t,c)):x.style.display="none")};function ke(t){if(!t)return"";const[e,a]=t.split("-");return`${["Janeiro","Fevereiro","Março","Abril","Maio","Junho","Julho","Agosto","Setembro","Outubro","Novembro","Dezembro"][parseInt(a)-1]} ${e}`}window.generateCardReport=t=>{var g;const e=B.find(b=>b.id===t);if(!e)return;const a=(g=document.getElementById("cc-filter-month"))==null?void 0:g.value;if(!a){alert("Por favor, selecione um mês de fatura.");return}let n=I.filter(b=>b.paymentMethod===t);n=n.filter(b=>window.getInvoiceMonth(b.date,e.closingDay)===a),n.sort((b,x)=>new Date(b.date)-new Date(x.date));let o=0,i=0;I.filter(b=>b.paymentMethod===t).forEach(b=>{b.type==="income"?i+=b.amount:window.getInvoiceMonth(b.date,e.closingDay)<=a&&(o+=b.amount)});const s=o-i,r=s<=0&&o>0,l=r?"Fatura Paga":"Em Aberto",[d,m]=a.split("-"),u=`Fatura: ${m}/${d}`,p=window.open("","_blank");let c=`
    <html>
    <head>
        <title>Relatório de Fatura - ${e.nickname}</title>
        <style>
            @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');
            body { font-family: 'Inter', sans-serif; color: #1e293b; padding: 40px; }
            .header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 40px; border-bottom: 2px solid #e2e8f0; padding-bottom: 20px; }
            .logo { max-height: 60px; }
            .card-details h2 { margin: 0 0 5px 0; color: #0f172a; }
            .card-details p { margin: 2px 0; color: #64748b; font-size: 0.95rem; }
            .invoice-summary { background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 20px; margin-bottom: 30px; display: flex; justify-content: space-between; align-items: center; }
            .invoice-summary h3 { margin: 0; font-size: 1.5rem; color: #0f172a; }
            .invoice-summary p { margin: 4px 0 0 0; color: #64748b; }
            .status-tag { margin-top: 8px; display: inline-block; padding: 4px 8px; border-radius: 4px; font-size: 0.85rem; font-weight: 600; background: ${r?"#dcfce7":"#fef9c3"}; color: ${r?"#166534":"#854d0e"}; border: 1px solid ${r?"#bbf7d0":"#fef08a"}; }
            .total { font-size: 1.8rem; font-weight: 700; color: ${r?"#10b981":"#ef4444"}; text-align: right; }
            table { width: 100%; border-collapse: collapse; margin-bottom: 40px; }
            th, td { padding: 12px 15px; text-align: left; border-bottom: 1px solid #e2e8f0; }
            th { background: #f1f5f9; font-weight: 600; color: #475569; }
            .amount { text-align: right; font-weight: 500; }
            .expense { color: #ef4444; }
            .income { color: #10b981; }
            .footer { text-align: center; margin-top: 50px; color: #94a3b8; font-size: 0.85rem; border-top: 1px solid #e2e8f0; padding-top: 20px; }
            @media print {
                body { padding: 0; }
                .no-print { display: none; }
            }
        </style>
    </head>
    <body>
        <div class="header">
            <div class="card-details">
                <h2>Extrato de Cartão de Crédito</h2>
                <p><strong>Cartão:</strong> ${e.nickname}</p>
                <p><strong>Banco:</strong> ${e.bank}</p>
                <p><strong>Fechamento:</strong> Dia ${e.closingDay}</p>
                <p><strong>Vencimento:</strong> Dia ${e.dueDay}</p>
            </div>
            <img src="img/ContaComigoPRO-logo-nobg.png" alt="ContaComigoPRO" class="logo">
        </div>

        <div class="invoice-summary">
            <div>
                <h3>${u}</h3>
                <p>Período base: ${e.closingDay}/${parseInt(m)-1||12} a ${e.closingDay-1}/${m}</p>
                <span class="status-tag">${l}</span>
            </div>
            <div class="total">
                <div style="font-size: 0.9rem; color: #64748b; font-weight: 400; margin-bottom: 4px;">Restante a Pagar</div>
                ${new Intl.NumberFormat("pt-BR",{style:"currency",currency:"BRL"}).format(Math.max(0,s))}
            </div>
        </div>

        <table>
            <thead>
                <tr>
                    <th>Data</th>
                    <th>Descrição</th>
                    <th>Categoria</th>
                    <th class="amount">Valor</th>
                </tr>
            </thead>
            <tbody>
    `;n.length===0?c+='<tr><td colspan="4" style="text-align: center; color: #94a3b8;">Nenhuma transação nesta fatura.</td></tr>':n.forEach(b=>{const x=b.type==="income",y=new Intl.NumberFormat("pt-BR",{style:"currency",currency:"BRL"}).format(b.amount);c+=`
                <tr>
                    <td>${N(b.date)}</td>
                    <td>${b.description}</td>
                    <td>${b.category}</td>
                    <td class="amount ${x?"income":"expense"}">${x?"+":"-"} ${y}</td>
                </tr>
            `}),c+=`
            </tbody>
        </table>
        
        <div class="footer">
            Gerado por ContaComigoPRO em ${new Date().toLocaleDateString("pt-BR")} às ${new Date().toLocaleTimeString("pt-BR")}
        </div>
        
        <script>
            window.onload = function() {
                setTimeout(function() {
                    window.print();
                }, 500);
            }
        <\/script>
    </body>
    </html>
    `,p.document.write(c),p.document.close()};Mt.addEventListener("click",()=>{document.querySelector("#bank-modal h2").textContent="Nova Conta Bancária",Fe.reset(),document.getElementById("bank-id").value="",Be.classList.add("active")});Fe.addEventListener("submit",async t=>{t.preventDefault();const e=document.getElementById("bank-id").value,a=document.getElementById("bank-name").value,n=F(document.getElementById("bank-balance").value)||0,o=document.getElementById("bank-color").value||"#0ea5e9";if(!a)return alert("Campos inválidos!");try{const i={userId:w.uid,name:a,balance:n,color:o};e?await ae.doc(e).update(i):await ae.add(i),Be.classList.remove("active"),Fe.reset()}catch(i){alert("Erro ao salvar: "+i.message)}});window.editBank=t=>{const e=$.find(a=>a.id===t);e&&(document.querySelector("#bank-modal h2").textContent="Editar Conta Bancária",document.getElementById("bank-id").value=e.id,document.getElementById("bank-name").value=e.name,document.getElementById("bank-balance").value=e.balance||0,document.getElementById("bank-color").value=e.color||"#0ea5e9",Be.classList.add("active"))};window.deleteBank=async t=>{confirm(`Atenção: Excluir este banco apagará o registro dele na sua lista.
Para manter suas transações intactas, crie um novo banco antes, caso planeje mudar algo. Confirmar exclusão?`)&&await ae.doc(t).delete()};window.filterBankExtract=t=>{var g,b;const e=document.getElementById("inline-bank-transactions");if(!e)return;M.id=t,M.startDate=((g=document.getElementById("bank-filter-start"))==null?void 0:g.value)||"",M.endDate=((b=document.getElementById("bank-filter-end"))==null?void 0:b.value)||"";const a=M.startDate,n=M.endDate,o=$.find(x=>x.id===t);if(!o)return;let i=I.filter(x=>x.paymentMethod===t);const s=[...i].sort((x,y)=>x.date.localeCompare(y.date));let r=o.balance||0,l=0,d=0;n?s.forEach(x=>{x.date<=n&&(x.type==="income"?(r+=x.amount,l+=x.amount):(r-=x.amount,d+=x.amount))}):s.forEach(x=>{x.type==="income"?(r+=x.amount,l+=x.amount):(r-=x.amount,d+=x.amount)});let m=i;a&&(m=m.filter(x=>x.date>=a)),n&&(m=m.filter(x=>x.date<=n)),m.sort((x,y)=>x.date.localeCompare(y.date)),je(m,"inline-bank-transactions");const u=a&&n?`${N(a)} a ${N(n)}`:"Todo o período",p=r>=0?"var(--success)":"var(--danger)",c=`
        <div class="bank-extract-summary">
            <div class="summary-item">
                <span class="label">📅 Período</span>
                <span class="value period">${u}</span>
            </div>
            <div class="summary-item">
                <span class="label">💰 Saldo Inicial</span>
                <span class="value initial">${v(o.balance||0)}</span>
            </div>
            <div class="summary-item">
                <span class="label">📈 Receitas</span>
                <span class="value positive">+ ${v(l)}</span>
            </div>
            <div class="summary-item">
                <span class="label">📉 Despesas</span>
                <span class="value negative">- ${v(d)}</span>
            </div>
            <div class="summary-item highlight">
                <span class="label">🏦 Saldo Final</span>
                <span class="value final" style="color: ${p};">${v(r)}</span>
            </div>
        </div>
    `;e.insertAdjacentHTML("afterbegin",c)};function zt(){if(X){if(X.innerHTML="",$.length===0){X.innerHTML='<div class="empty-state w-100" style="grid-column: 1/-1;"><i class="fa-solid fa-building-columns"></i><p>Nenhuma conta bancária cadastrada.</p></div>';return}$.forEach(t=>{const e=I.filter(s=>s.paymentMethod===t.id),a=e.filter(s=>s.type==="income").reduce((s,r)=>s+r.amount,0),n=e.filter(s=>s.type==="expense").reduce((s,r)=>s+r.amount,0),o=(t.balance||0)+a-n,i=o<0?"var(--danger)":"var(--text-main)";X.innerHTML+=`
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
                    <span style="font-weight: 700; font-size: 1.2rem; color: ${i}" class="bank-balance-value" data-bank-id="${t.id}">${v(o)}</span>
                </div>
                <div style="font-size: 0.8rem; color: var(--text-muted);">
                    Saldo Inicial: ${v(t.balance||0)}
                </div>
                <div style="font-size: 0.7rem; color: var(--text-muted); margin-top: 4px;">
                    <i class="fa-regular fa-clock"></i> ${I.filter(s=>s.paymentMethod===t.id).length} transações
                </div>
            </div>
        `})}}window.expandBank=t=>{const e=$.find(c=>c.id===t);if(!e)return;X.innerHTML="";const a=I.filter(c=>c.paymentMethod===e.id),n=a.filter(c=>c.type==="income").reduce((c,g)=>c+g.amount,0),o=a.filter(c=>c.type==="expense").reduce((c,g)=>c+g.amount,0),i=(e.balance||0)+n-o,s=i<0?"var(--danger)":"var(--text-main)",r=M.id===t?M.startDate:"",l=M.id===t?M.endDate:"",d=new Date,u=`${d.toISOString().slice(0,7)}-01`,p=d.toISOString().slice(0,10);X.innerHTML+=`
        <div class="card w-100" style="grid-column: 1/-1; border-top: 4px solid ${e.color}; padding: 16px; margin-bottom: 16px;">
            <div style="display: flex; align-items: center; gap: 12px; margin-bottom: 16px; flex-wrap: wrap;">
                <button class="btn btn-secondary" onclick="renderBanks()" style="padding: 6px 12px; font-size: 0.85rem; display: flex; align-items: center; gap: 6px;">
                    <i class="fa-solid fa-arrow-left"></i> Voltar
                </button>
                <span style="font-size: 0.85rem; color: var(--text-muted);">Voltar para todos os bancos</span>
                <div style="flex: 1;"></div>
                <button class="btn btn-outline" onclick="window.setBankFilterToMonth('${e.id}')" style="padding: 6px 12px; font-size: 0.85rem;">
                    <i class="fa-regular fa-calendar"></i> Mês Atual
                </button>
                <button class="btn btn-outline" onclick="window.clearBankFilters('${e.id}')" style="padding: 6px 12px; font-size: 0.85rem;">
                    <i class="fa-solid fa-eraser"></i> Limpar
                </button>
                <button class="btn btn-primary" onclick="window.generateBankReport('${e.id}')" style="padding: 6px 12px; font-size: 0.85rem;">
                    <i class="fa-solid fa-print"></i> Gerar Relatório
                </button>
            </div>
            
            <div style="display:flex; justify-content:space-between; align-items:center; flex-wrap: wrap; gap: 12px;">
                <div style="display:flex; gap: 16px; align-items:center;">
                    <i class="fa-solid fa-building-columns" style="font-size: 2rem; color: ${e.color}"></i>
                    <div>
                        <h3 style="margin: 0;">${e.name}</h3>
                        <p style="color: var(--text-muted); margin: 0; font-size: 0.9rem;">Saldo Inicial: ${v(e.balance||0)}</p>
                    </div>
                </div>
                <div style="text-align: right;">
                    <p style="color: var(--text-muted); margin: 0; font-size: 0.9rem;">Saldo Atual</p>
                    <h2 style="margin: 0; color: ${s}" id="bank-current-balance-${e.id}">${v(i)}</h2>
                </div>
            </div>
            
            <div class="filter-container mt-3" style="background:var(--bg-body); padding:12px; border-radius:8px;">
                <div style="display:flex; gap:12px; align-items:center; flex-wrap:wrap;">
                    <label style="font-size: 0.85rem; color: var(--text-muted); font-weight: 500;">Período:</label>
                    <input type="date" id="bank-filter-start" class="form-input" title="Início" onchange="window.filterBankExtract('${e.id}')" value="${r}" style="width: 150px;">
                    <span style="color: var(--text-muted);">até</span>
                    <input type="date" id="bank-filter-end" class="form-input" title="Fim" onchange="window.filterBankExtract('${e.id}')" value="${l}" style="width: 150px;">
                    <div style="flex: 1;"></div>
                    <button class="btn btn-outline" style="margin-left: auto;" onclick="window.editBank('${e.id}')"><i class="fa-solid fa-pen"></i> Editar</button>
                    <button class="btn btn-outline" style="border-color: var(--danger); color: var(--danger);" onclick="window.deleteBank('${e.id}')"><i class="fa-solid fa-trash"></i> Excluir</button>
                </div>
            </div>
        </div>
        
        <div class="w-100" style="grid-column: 1/-1;">
            <div class="transactions-list" id="inline-bank-transactions"></div>
        </div>
    `,!r&&!l&&(document.getElementById("bank-filter-start").value=u,document.getElementById("bank-filter-end").value=p),window.filterBankExtract(e.id)};window.generateBankReport=t=>{var x,y;const e=$.find(f=>f.id===t);if(!e){alert("Banco não encontrado.");return}const a=((x=document.getElementById("bank-filter-start"))==null?void 0:x.value)||"",n=((y=document.getElementById("bank-filter-end"))==null?void 0:y.value)||"";if(!a||!n){alert(`Por favor, selecione um período para gerar o relatório.
Use os filtros de data acima.`);return}let o=I.filter(f=>f.paymentMethod===t);if(a&&(o=o.filter(f=>f.date>=a)),n&&(o=o.filter(f=>f.date<=n)),o.length===0&&!confirm(`Nenhuma transação encontrada neste período.
Deseja gerar o relatório mesmo assim?`))return;o.sort((f,h)=>f.date.localeCompare(h.date));let i=e.balance||0;const s=I.filter(f=>f.paymentMethod===t);s.sort((f,h)=>f.date.localeCompare(h.date));for(const f of s)f.date<a&&(f.type==="income"?i+=f.amount:i-=f.amount);let r=0,l=0,d=i;const m=o.map(f=>{const h=f.type==="income",k=f.amount;return h?(r+=k,d+=k):(l+=k,d-=k),{date:f.date,description:f.description,category:f.category||"Sem Categoria",type:f.type,amount:k,balance:d}}),u=d,p=r+l,c=f=>{if(!f)return"";const h=f.split("-");return`${h[2]}/${h[1]}/${h[0]}`},g=window.open("","_blank");if(!g){alert("Por favor, permita pop-ups para gerar o relatório.");return}const b=`
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="UTF-8">
        <title>Extrato Bancário - ${e.name}</title>
        <style>
            @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap');
            * { margin: 0; padding: 0; box-sizing: border-box; }
            body { 
                font-family: 'Inter', sans-serif; 
                padding: 40px; 
                background: #fff;
                color: #1e293b;
            }
            .header {
                display: flex;
                justify-content: space-between;
                align-items: flex-start;
                margin-bottom: 30px;
                padding-bottom: 20px;
                border-bottom: 2px solid #e2e8f0;
            }
            .header .bank-info h1 {
                font-size: 1.8rem;
                color: #0f172a;
                margin-bottom: 4px;
            }
            .header .bank-info p {
                color: #64748b;
                font-size: 0.95rem;
                margin: 2px 0;
            }
            .header .period {
                text-align: right;
                color: #64748b;
                font-size: 0.9rem;
            }
            .header .period strong {
                color: #0f172a;
            }
            .summary {
                display: grid;
                grid-template-columns: repeat(4, 1fr);
                gap: 16px;
                margin-bottom: 30px;
                padding: 20px;
                background: #f8fafc;
                border-radius: 8px;
                border: 1px solid #e2e8f0;
            }
            .summary .item {
                text-align: center;
            }
            .summary .item .label {
                font-size: 0.75rem;
                text-transform: uppercase;
                color: #64748b;
                letter-spacing: 0.5px;
                font-weight: 600;
            }
            .summary .item .value {
                font-size: 1.3rem;
                font-weight: 700;
                margin-top: 4px;
            }
            .summary .item .value.positive { color: #059669; }
            .summary .item .value.negative { color: #dc2626; }
            .summary .item .value.neutral { color: #0f172a; }
            
            table {
                width: 100%;
                border-collapse: collapse;
                margin-top: 20px;
            }
            th {
                background: #f1f5f9;
                padding: 12px 15px;
                text-align: left;
                font-weight: 600;
                color: #475569;
                border-bottom: 2px solid #e2e8f0;
            }
            td {
                padding: 10px 15px;
                border-bottom: 1px solid #e2e8f0;
            }
            td.amount {
                text-align: right;
                font-weight: 500;
            }
            td.amount.positive { color: #059669; }
            td.amount.negative { color: #dc2626; }
            td.balance {
                text-align: right;
                font-weight: 600;
            }
            .footer {
                margin-top: 30px;
                padding-top: 20px;
                border-top: 1px solid #e2e8f0;
                text-align: center;
                color: #94a3b8;
                font-size: 0.85rem;
            }
            .badge {
                display: inline-block;
                padding: 2px 8px;
                border-radius: 12px;
                font-size: 0.7rem;
                font-weight: 600;
                text-transform: uppercase;
            }
            .badge.income { background: #dcfce7; color: #059669; }
            .badge.expense { background: #fee2e2; color: #dc2626; }
            .no-transactions {
                text-align: center;
                padding: 40px;
                color: #94a3b8;
            }
            .no-transactions i {
                font-size: 2rem;
                display: block;
                margin-bottom: 12px;
            }
            @media print {
                body { padding: 20px; }
                .no-print { display: none; }
            }
            @media (max-width: 768px) {
                .summary {
                    grid-template-columns: repeat(2, 1fr);
                    gap: 12px;
                    padding: 16px;
                }
                table { font-size: 0.85rem; }
                th, td { padding: 8px 10px; }
                .header { flex-direction: column; gap: 12px; }
                .header .period { text-align: left; }
            }
        </style>
    </head>
    <body>
        <div class="header">
            <div class="bank-info">
                <h1>🏦 Extrato Bancário</h1>
                <p><strong>${e.name}</strong></p>
                <p style="color: #64748b; font-size: 0.85rem;">
                    Saldo Inicial: ${new Intl.NumberFormat("pt-BR",{style:"currency",currency:"BRL"}).format(e.balance||0)}
                </p>
            </div>
            <div class="period">
                <p><strong>Período:</strong></p>
                <p>${c(a)} a ${c(n)}</p>
                <p style="margin-top: 4px; font-size: 0.7rem;">
                    Gerado em ${new Date().toLocaleDateString("pt-BR")} às ${new Date().toLocaleTimeString("pt-BR")}
                </p>
            </div>
        </div>

        <div class="summary">
            <div class="item">
                <div class="label">Saldo Inicial</div>
                <div class="value neutral">${new Intl.NumberFormat("pt-BR",{style:"currency",currency:"BRL"}).format(i)}</div>
            </div>
            <div class="item">
                <div class="label">Receitas</div>
                <div class="value positive">+ ${new Intl.NumberFormat("pt-BR",{style:"currency",currency:"BRL"}).format(r)}</div>
            </div>
            <div class="item">
                <div class="label">Despesas</div>
                <div class="value negative">- ${new Intl.NumberFormat("pt-BR",{style:"currency",currency:"BRL"}).format(l)}</div>
            </div>
            <div class="item">
                <div class="label">Saldo Final</div>
                <div class="value ${u>=0?"positive":"negative"}">${new Intl.NumberFormat("pt-BR",{style:"currency",currency:"BRL"}).format(u)}</div>
            </div>
        </div>

        ${m.length>0?`
        <table>
            <thead>
                <tr>
                    <th>Data</th>
                    <th>Descrição</th>
                    <th>Categoria</th>
                    <th style="text-align: right;">Tipo</th>
                    <th style="text-align: right;">Valor</th>
                    <th style="text-align: right;">Saldo</th>
                </tr>
            </thead>
            <tbody>
                ${m.map(f=>`
                    <tr>
                        <td>${c(f.date)}</td>
                        <td>${f.description}</td>
                        <td>${f.category}</td>
                        <td style="text-align: right;">
                            <span class="badge ${f.type}">${f.type==="income"?"Receita":"Despesa"}</span>
                        </td>
                        <td class="amount ${f.type==="income"?"positive":"negative"}">
                            ${f.type==="income"?"+":"-"} ${new Intl.NumberFormat("pt-BR",{style:"currency",currency:"BRL"}).format(f.amount)}
                        </td>
                        <td class="balance" style="color: ${f.balance>=0?"#059669":"#dc2626"}">
                            ${new Intl.NumberFormat("pt-BR",{style:"currency",currency:"BRL"}).format(f.balance)}
                        </td>
                    </tr>
                `).join("")}
            </tbody>
            <tfoot>
                <tr style="background: #f8fafc; font-weight: 600;">
                    <td colspan="4" style="text-align: right;">Total do Período:</td>
                    <td style="text-align: right; color: ${u>=0?"#059669":"#dc2626"}">
                        ${new Intl.NumberFormat("pt-BR",{style:"currency",currency:"BRL"}).format(p)}
                    </td>
                    <td style="text-align: right; color: ${u>=0?"#059669":"#dc2626"}">
                        ${new Intl.NumberFormat("pt-BR",{style:"currency",currency:"BRL"}).format(u)}
                    </td>
                </tr>
            </tfoot>
        </table>
        `:`
        <div class="no-transactions">
            <i class="fa-solid fa-receipt"></i>
            <p>Nenhuma transação encontrada neste período.</p>
            <p style="font-size: 0.85rem; margin-top: 4px;">Período: ${c(a)} a ${c(n)}</p>
        </div>
        `}

        <div class="footer">
            <p>Relatório gerado pelo Conta Comigo PRO</p>
            <p style="margin-top: 4px; font-size: 0.8rem;">
                ${m.length} transações no período • 
                ${r>0?`Receitas: ${new Intl.NumberFormat("pt-BR",{style:"currency",currency:"BRL"}).format(r)}`:"Sem receitas"}
                ${r>0&&l>0?" • ":""}
                ${l>0?`Despesas: ${new Intl.NumberFormat("pt-BR",{style:"currency",currency:"BRL"}).format(l)}`:"Sem despesas"}
            </p>
        </div>

        <script>
            window.onload = function() {
                setTimeout(function() {
                    window.print();
                }, 500);
            }
        <\/script>
    </body>
    </html>
    `;g.document.write(b),g.document.close()};window.setBankFilterToMonth=t=>{const e=new Date,n=`${e.toISOString().slice(0,7)}-01`,o=e.toISOString().slice(0,10);document.getElementById("bank-filter-start").value=n,document.getElementById("bank-filter-end").value=o,window.filterBankExtract(t)};window.clearBankFilters=t=>{document.getElementById("bank-filter-start").value="",document.getElementById("bank-filter-end").value="",M.startDate="",M.endDate="",window.filterBankExtract(t)};window.openTransactionModalWithBank=t=>{R.value=t,O.classList.add("active")};const v=t=>new Intl.NumberFormat("pt-BR",{style:"currency",currency:"BRL"}).format(t),N=t=>{const e=t.split("-");return e.length===3?`${e[2]}/${e[1]}/${e[0]}`:t};function lt(){let t="";$.length>0&&(t+='<optgroup label="Bancos / Contas">',$.forEach(n=>{t+=`<option value="${n.id}">🏦 ${n.name}</option>`}),t+="</optgroup>"),B.length>0&&(t+='<optgroup label="Cartões de Crédito">',B.forEach(n=>{t+=`<option value="${n.id}">💳 ${n.nickname} (${n.bank})</option>`}),t+="</optgroup>"),R.innerHTML=t,vt&&(vt.innerHTML=t);const e=document.getElementById("pdf-destination");e&&(e.innerHTML='<option value="" disabled selected>Selecione onde lançar</option>'+t);const a=document.getElementById("card-payment-source-bank");if(a){let n='<option value="" disabled selected>Selecione</option>';$.forEach(o=>n+=`<option value="${o.id}">🏦 ${o.name}</option>`),a.innerHTML=n}}function se(){const t=B.some(a=>a.id===R.value),e=document.querySelector('input[name="type"]:checked').value;t&&e==="expense"?Ze.style.display="flex":(Ze.style.display="none",at.value="1")}R.addEventListener("change",se);document.querySelectorAll('input[name="type"]').forEach(t=>t.addEventListener("change",se));function _(){let t=$.reduce((r,l)=>r+(l.balance||0),0);$.forEach(r=>{const l=I.filter(u=>u.paymentMethod===r.id),d=l.filter(u=>u.type==="income").reduce((u,p)=>u+p.amount,0),m=l.filter(u=>u.type==="expense").reduce((u,p)=>u+p.amount,0);t+=d-m});const e=I.map(r=>r.type==="income"?r.amount:-r.amount),a=e.filter(r=>r>0).reduce((r,l)=>r+l,0),n=e.filter(r=>r<0).reduce((r,l)=>r+l,0)*-1;We&&(We.textContent=v(t),We.style.color=t<0?"var(--danger)":"var(--text-main)"),bt&&(bt.textContent=v(a)),xt&&(xt.textContent=v(n));const o=Ma(),i=document.getElementById("total-card-invoice"),s=document.getElementById("card-invoice-detail");i&&(o.total>0?(i.textContent=v(o.total),i.style.color="var(--danger)"):(i.textContent="R$ 0,00",i.style.color="var(--text-muted)")),s&&(s.textContent=o.details),je(I.slice(0,5),"transaction-list-recent"),qt(),U()}nt.addEventListener("input",U);ot.addEventListener("change",U);it.addEventListener("change",U);rt.addEventListener("change",U);st.addEventListener("change",U);Kt.addEventListener("click",()=>{nt.value="",ot.value="all",st.value="all",it.value="",rt.value="",U()});function U(){const t=nt.value.toLowerCase(),e=ot.value,a=st.value,n=it.value,o=rt.value;let i="9999-12-31";if(!o){const p=new Date;i=new Date(p.getFullYear(),p.getMonth()+1,0).toISOString().slice(0,10)}const s=o||i,r=I.filter(p=>{const c=p.description.toLowerCase().includes(t),g=e==="all"||p.type===e,b=a==="all"||p.category===a,x=(!n||p.date>=n)&&(o?p.date<=o:p.date<=s);return c&&g&&b&&x}),l=r.map(p=>p.type==="income"?p.amount:-p.amount),d=l.reduce((p,c)=>p+c,0),m=l.filter(p=>p>0).reduce((p,c)=>p+c,0),u=l.filter(p=>p<0).reduce((p,c)=>p+c,0)*-1;_e&&(_e.textContent=v(d),Jt.textContent=v(m),Xt.textContent=v(u),_e.style.color=d<0?"var(--danger)":"var(--text-main)"),je(r,"transaction-list-complete")}function je(t,e){const a=document.getElementById(e);if(a.innerHTML="",t.length===0){a.innerHTML='<div class="empty-state"><i class="fa-solid fa-receipt"></i><p>Nenhuma transação encontrada.</p></div>';return}t.forEach(n=>{const o=n.type==="income",i=o?"+":"-";let s="";if(n.paymentMethod){const r=$.find(l=>l.id===n.paymentMethod);if(r)s=`<span style="font-size: 0.65rem; background: var(--bg-body); padding: 4px 8px; border-radius: 12px; border: 1px solid var(--border);"><i class="fa-solid fa-building-columns" style="color: ${r.color}"></i> ${r.name}</span>`;else{const l=B.find(d=>d.id===n.paymentMethod);l&&(s=`<span style="font-size: 0.65rem; background: var(--bg-body); padding: 4px 8px; border-radius: 12px; border: 1px solid var(--border);"><i class="fa-solid fa-credit-card" style="color: var(--primary)"></i> Cartão: ${l.nickname}</span>`)}}a.innerHTML+=`
            <div class="transaction-item">
                <div class="tx-left">
                    <div class="tx-icon ${o?"income":"expense"}"><i class="fa-solid ${o?"fa-arrow-up":"fa-arrow-down"}"></i></div>
                    <div class="tx-details">
                        <p class="tx-title" style="display:flex; align-items:center; flex-wrap:wrap; gap: 8px;">${n.description} ${s}</p>
                        <p class="tx-category"><i class="fa-solid ${Pt(n.category)}"></i> ${n.category}</p>
                    </div>
                </div>
                <div class="tx-right">
                    <p class="tx-amount ${o?"positive":"negative"}">${i} ${v(n.amount)}</p>
                    <p class="tx-date">${N(n.date)}</p>
                </div>
                <div class="tx-actions" style="display:flex; gap: 8px;">
                    <button class="btn-icon" onclick="window.editTransaction('${n.id}')" title="Editar"><i class="fa-solid fa-pen"></i></button>
                    <button class="btn-icon" onclick="window.deleteTransaction('${n.id}')" title="Excluir"><i class="fa-solid fa-trash"></i></button>
                </div>
            </div>`})}document.getElementById("btn-new-transaction").addEventListener("click",()=>{j=null,qe=null,document.querySelector("#transaction-modal h2").textContent="Nova Transação",Q.reset(),document.getElementById("date").valueAsDate=new Date,se();const t=document.getElementById("tx-modal-tabs");t&&(t.style.display="flex"),window.resetBulkMode(),O.classList.add("active")});window.isBulkMode=!1;window.resetBulkMode=()=>{window.isBulkMode=!1;const t=document.getElementById("tab-tx-single"),e=document.getElementById("tab-tx-bulk");t&&e&&(t.classList.add("active"),t.style.borderBottom="2px solid var(--primary)",t.style.color="var(--text-main)",e.classList.remove("active"),e.style.borderBottom="none",e.style.color="var(--text-muted)");const a=document.getElementById("single-tx-container"),n=document.getElementById("bulk-tx-container");a&&(a.style.display="block"),n&&(n.style.display="none");const o=document.querySelector("#transaction-modal .modal");o&&(o.style.maxWidth="500px");const i=document.getElementById("bulk-rows-container");i&&(i.innerHTML="")};window.addBulkRow=()=>{const t=document.getElementById("bulk-rows-container");if(!t)return;const e="bulk_row_"+Math.random().toString(36).substr(2,9),a=document.createElement("div");a.id=e,a.className="bulk-row",a.style.cssText=`
        display: grid;
        grid-template-columns: 100px 1fr 120px 130px 1fr 1.2fr 40px;
        gap: 8px;
        align-items: center;
        background: var(--bg-body);
        padding: 8px 12px;
        border-radius: 8px;
        border: 1px solid var(--border);
        margin-bottom: 8px;
        transition: all 0.2s ease;
    `;let n='<option value="" disabled selected>Categoria</option>';A.forEach(r=>{n+=`<option value="${r.name}">${r.name}</option>`});let o='<option value="" disabled selected>Banco/Cartão</option>';$.length>0&&$.forEach(r=>{o+=`<option value="${r.id}">🏦 ${r.name}</option>`}),B.length>0&&B.forEach(r=>{o+=`<option value="${r.id}">💳 ${r.nickname}</option>`});const i=document.getElementById("bulk-date").value||new Date().toISOString().slice(0,10);a.innerHTML=`
        <select class="bulk-row-type form-input" style="width: 100%; padding: 6px 8px; border-radius: 6px; background: var(--bg-main); border: 1px solid var(--border); color: var(--text-main); font-size: 0.85rem;" required>
            <option value="expense">Despesa</option>
            <option value="income">Receita</option>
        </select>
        
        <input type="text" class="bulk-row-desc form-input" placeholder="Descrição" style="width: 100%; padding: 6px 8px; border-radius: 6px; background: var(--bg-main); border: 1px solid var(--border); color: var(--text-main); font-size: 0.85rem;" required>
        
        <input type="text" class="bulk-row-amount form-input" placeholder="Valor" style="width: 100%; padding: 6px 8px; border-radius: 6px; background: var(--bg-main); border: 1px solid var(--border); color: var(--text-main); font-size: 0.85rem; text-align: right;" required>
        
        <input type="date" class="bulk-row-date form-input" value="${i}" style="width: 100%; padding: 6px 8px; border-radius: 6px; background: var(--bg-main); border: 1px solid var(--border); color: var(--text-main); font-size: 0.85rem;">
        
        <select class="bulk-row-category form-input" style="width: 100%; padding: 6px 8px; border-radius: 6px; background: var(--bg-main); border: 1px solid var(--border); color: var(--text-main); font-size: 0.85rem;" required>
            ${n}
        </select>
        
        <select class="bulk-row-pm form-input" style="width: 100%; padding: 6px 8px; border-radius: 6px; background: var(--bg-main); border: 1px solid var(--border); color: var(--text-main); font-size: 0.85rem;" required>
            ${o}
        </select>
        
        <button type="button" class="btn-icon" onclick="document.getElementById('${e}').remove()" title="Remover esta linha" style="color: var(--text-muted); padding: 4px; font-size: 1rem; transition: all 0.2s; display: flex; align-items: center; justify-content: center; width: 32px; height: 32px; border-radius: 4px; border: none; background: transparent; cursor: pointer;">
            <i class="fa-solid fa-xmark"></i>
        </button>
    `;const s=a.querySelector(".btn-icon");s.addEventListener("mouseenter",()=>{s.style.color="var(--danger)",s.style.background="var(--danger-bg)"}),s.addEventListener("mouseleave",()=>{s.style.color="var(--text-muted)",s.style.background="transparent"}),t.appendChild(a)};window.addBulkRowWithData=t=>{const e=document.getElementById("bulk-rows-container");if(!e)return;const a="bulk_row_"+Math.random().toString(36).substr(2,9),n=document.createElement("div");n.id=a,n.className="bulk-row",n.style.cssText=`
        display: grid;
        grid-template-columns: 100px 1fr 120px 130px 1fr 1.2fr 40px;
        gap: 8px;
        align-items: center;
        background: var(--bg-body);
        padding: 8px 12px;
        border-radius: 8px;
        border: 1px solid var(--border);
        margin-bottom: 8px;
        transition: all 0.2s ease;
    `;let o='<option value="" disabled selected>Categoria</option>';A.forEach(d=>{const m=t.category&&d.name.toLowerCase()===t.category.toLowerCase()?"selected":"";o+=`<option value="${d.name}" ${m}>${d.name}</option>`});let i='<option value="" disabled selected>Banco/Cartão</option>';$.length>0&&$.forEach(d=>{const m=t.paymentMethod&&d.id===t.paymentMethod?"selected":"";i+=`<option value="${d.id}" ${m}>🏦 ${d.name}</option>`}),B.length>0&&B.forEach(d=>{const m=t.paymentMethod&&d.id===t.paymentMethod?"selected":"";i+=`<option value="${d.id}" ${m}>💳 ${d.nickname}</option>`});const s=t.type==="expense"?"selected":"",r=t.type==="income"?"selected":"";n.innerHTML=`
        <select class="bulk-row-type form-input" style="width: 100%; padding: 6px 8px; border-radius: 6px; background: var(--bg-main); border: 1px solid var(--border); color: var(--text-main); font-size: 0.85rem;" required>
            <option value="expense" ${s}>Despesa</option>
            <option value="income" ${r}>Receita</option>
        </select>
        
        <input type="text" class="bulk-row-desc form-input" placeholder="Descrição" value="${t.description||""}" style="width: 100%; padding: 6px 8px; border-radius: 6px; background: var(--bg-main); border: 1px solid var(--border); color: var(--text-main); font-size: 0.85rem;" required>
        
        <input type="text" class="bulk-row-amount form-input" placeholder="Valor" value="${t.amount?t.amount.toFixed(2).replace(".",","):""}" style="width: 100%; padding: 6px 8px; border-radius: 6px; background: var(--bg-main); border: 1px solid var(--border); color: var(--text-main); font-size: 0.85rem; text-align: right;" required>
        
        <input type="date" class="bulk-row-date form-input" value="${t.date||""}" style="width: 100%; padding: 6px 8px; border-radius: 6px; background: var(--bg-main); border: 1px solid var(--border); color: var(--text-main); font-size: 0.85rem;">
        
        <select class="bulk-row-category form-input" style="width: 100%; padding: 6px 8px; border-radius: 6px; background: var(--bg-main); border: 1px solid var(--border); color: var(--text-main); font-size: 0.85rem;" required>
            ${o}
        </select>
        
        <select class="bulk-row-pm form-input" style="width: 100%; padding: 6px 8px; border-radius: 6px; background: var(--bg-main); border: 1px solid var(--border); color: var(--text-main); font-size: 0.85rem;" required>
            ${i}
        </select>
        
        <button type="button" class="btn-icon" onclick="document.getElementById('${a}').remove()" title="Remover esta linha" style="color: var(--text-muted); padding: 4px; font-size: 1rem; transition: all 0.2s; display: flex; align-items: center; justify-content: center; width: 32px; height: 32px; border-radius: 4px; border: none; background: transparent; cursor: pointer;">
            <i class="fa-solid fa-xmark"></i>
        </button>
    `;const l=n.querySelector(".btn-icon");l.addEventListener("mouseenter",()=>{l.style.color="var(--danger)",l.style.background="var(--danger-bg)"}),l.addEventListener("mouseleave",()=>{l.style.color="var(--text-muted)",l.style.background="transparent"}),e.appendChild(n)};function ba(){const t=document.getElementById("tab-tx-single"),e=document.getElementById("tab-tx-bulk"),a=document.getElementById("tab-tx-pdf"),n=document.getElementById("single-tx-container"),o=document.getElementById("bulk-tx-container"),i=document.getElementById("pdf-tx-container"),s=document.querySelector("#transaction-modal .modal"),r=document.querySelector("#form-transaction .modal-footer");if(!t||!e)return;t.addEventListener("click",()=>{window.isBulkMode=!1,t.classList.add("active"),t.style.borderBottom="2px solid var(--primary)",t.style.color="var(--text-main)",e.classList.remove("active"),e.style.borderBottom="none",e.style.color="var(--text-muted)",a&&(a.classList.remove("active"),a.style.borderBottom="none",a.style.color="var(--text-muted)"),n&&(n.style.display="block"),o&&(o.style.display="none"),i&&(i.style.display="none"),s&&(s.style.maxWidth="500px"),r&&(r.style.display="flex")}),e.addEventListener("click",()=>{window.isBulkMode=!0,e.classList.add("active"),e.style.borderBottom="2px solid var(--primary)",e.style.color="var(--text-main)",t.classList.remove("active"),t.style.borderBottom="none",t.style.color="var(--text-muted)",a&&(a.classList.remove("active"),a.style.borderBottom="none",a.style.color="var(--text-muted)"),n&&(n.style.display="none"),o&&(o.style.display="block"),i&&(i.style.display="none"),s&&(s.style.maxWidth="800px"),r&&(r.style.display="flex");const d=document.getElementById("bulk-date");d&&!d.value&&(d.value=document.getElementById("date").value||new Date().toISOString().slice(0,10));const m=document.getElementById("bulk-rows-container");m&&m.children.length===0&&window.addBulkRow()}),a&&a.addEventListener("click",()=>{window.isBulkMode=!1,a.classList.add("active"),a.style.borderBottom="2px solid var(--primary)",a.style.color="var(--text-main)",t.classList.remove("active"),t.style.borderBottom="none",t.style.color="var(--text-muted)",e.classList.remove("active"),e.style.borderBottom="none",e.style.color="var(--text-muted)",n&&(n.style.display="none"),o&&(o.style.display="none"),i&&(i.style.display="block"),s&&(s.style.maxWidth="500px"),r&&(r.style.display="none")});const l=document.getElementById("btn-add-bulk-row");l&&l.addEventListener("click",()=>window.addBulkRow())}async function xa(t){return pdfjsLib.GlobalWorkerOptions.workerSrc="https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.4.120/pdf.worker.min.js",new Promise((e,a)=>{const n=new FileReader;n.onload=async function(){try{const o=new Uint8Array(this.result),i=await pdfjsLib.getDocument({data:o}).promise;let s="";for(let r=1;r<=i.numPages;r++){const m=(await(await i.getPage(r)).getTextContent()).items;let u=-1,p="";for(let c=0;c<m.length;c++){const g=m[c];u!==-1&&Math.abs(g.transform[5]-u)>5&&(p+=`
`),p+=g.str+" ",u=g.transform[5]}s+=p+`
`}e(s)}catch(o){a(o)}},n.onerror=o=>a(o),n.readAsArrayBuffer(t)})}function ha(t){const e=t.split(`
`),a=[],n=/\b(\d{2})\/(\d{2})(?:\/(\d{2,4}))?\b/,o=/(?:R\$\s*)?(-?\b\d{1,3}(?:\.\d{3})*,\d{2}\b|-?\b\d+,\d{2}\b)\s*([CDcd\-+])?/;for(let i of e){if(i=i.trim(),!i)continue;const s=i.match(n);if(!s)continue;const r=i.match(o);if(!r)continue;const l=s[1],d=s[2];let m=s[3]||new Date().getFullYear().toString();m.length===2&&(m="20"+m);const u=`${m}-${d.padStart(2,"0")}-${l.padStart(2,"0")}`;let p=r[1].replace(/\./g,"").replace(",","."),c=parseFloat(p);if(isNaN(c))continue;let g="expense";const b=r[2];if(r[1].startsWith("-")||b==="-"||b&&b.toUpperCase()==="D")g="expense";else if(b==="+"||b&&b.toUpperCase()==="C")g="income";else{const k=i.toLowerCase();k.includes("recebido")||k.includes("depósito")||k.includes("credito")||k.includes("crédito")||k.includes("salário")||k.includes("estorno")||k.includes("transferência recebida")||k.includes("pix recebido")?g="income":g="expense"}if(c=Math.abs(c),c===0)continue;let y=i.replace(s[0],"").replace(r[0],"").replace(/\s+/g," ").trim();y=y.replace(/^[\s\-\|\,\.\:]+/,"").replace(/[\s\-\|\,\.\:]+$/,"").trim(),y||(y="Transação Extrato");let f="";const h=y.toLowerCase();h.includes("mercado")||h.includes("supermercado")||h.includes("pao de acucar")||h.includes("carrefour")?f="Alimentação":h.includes("posto")||h.includes("combustivel")||h.includes("gasolina")||h.includes("uber")||h.includes("99app")?f="Transporte":h.includes("farmacia")||h.includes("drogaria")||h.includes("medico")||h.includes("hospital")?f="Saúde":h.includes("aluguel")||h.includes("condominio")||h.includes("luz")||h.includes("energia")||h.includes("agua")||h.includes("gás")?f="Moradia":h.includes("restaurante")||h.includes("ifood")||h.includes("padaria")||h.includes("cafe")?f="Alimentação":(h.includes("netflix")||h.includes("spotify")||h.includes("cinema")||h.includes("show")||h.includes("jogos"))&&(f="Lazer"),a.push({date:u,description:y,amount:c,type:g,category:f})}return a}async function wa(t,e){var d,m,u,p,c,g;const a=`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${e}`,o={contents:[{parts:[{text:`Analise o extrato bancário em texto abaixo e extraia todas as transações (receitas e despesas).
Retorne APENAS um array JSON estruturado com o formato especificado no responseSchema. Não adicione nenhuma formatação markdown (como \`\`\`json) no texto de resposta se não for necessário, mas responda seguindo o schema de resposta JSON.

Instruções importantes:
- Identifique a data de cada transação. Se o ano não estiver especificado na linha, assuma o ano corrente (2026). Formate como AAAA-MM-DD.
- Identifique a descrição de forma limpa e clara.
- Identifique o valor (amount) como um número real estritamente positivo (ex: 123.45).
- Identifique o tipo (type): 'expense' para despesas (saídas, débitos, pagamentos, transferências enviadas, pix enviado) e 'income' para receitas (entradas, créditos, depósitos, salários, estornos, pix recebido, transferências recebidas).
- Classifique cada transação em uma das seguintes categorias padrão se aplicável (ou sugira uma categoria apropriada de mercado): Alimentação, Transporte, Saúde, Moradia, Lazer, Educação, Salário, Outros.

Texto do extrato:
${t}`}]}],generationConfig:{responseMimeType:"application/json",responseSchema:{type:"OBJECT",properties:{transactions:{type:"ARRAY",description:"Lista de transações extraídas do extrato",items:{type:"OBJECT",properties:{date:{type:"STRING",description:"Data da transação no formato AAAA-MM-DD"},description:{type:"STRING",description:"Descrição limpa da transação"},amount:{type:"NUMBER",description:"Valor real absoluto positivo da transação"},type:{type:"STRING",enum:["expense","income"],description:"Tipo da transação: expense para saída/débito, income para entrada/crédito"},category:{type:"STRING",description:"Categoria sugerida para a transação"}},required:["date","description","amount","type"]}}}}}},i=await fetch(a,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify(o)});if(!i.ok){const x=((d=(await i.json().catch(()=>({}))).error)==null?void 0:d.message)||`Status HTTP ${i.status}`;throw new Error(`Erro na API do Gemini: ${x}`)}const r=(g=(c=(p=(u=(m=(await i.json()).candidates)==null?void 0:m[0])==null?void 0:u.content)==null?void 0:p.parts)==null?void 0:c[0])==null?void 0:g.text;if(!r)throw new Error("Resposta vazia da API do Gemini.");return JSON.parse(r.trim()).transactions||[]}function Ea(){const t=document.getElementById("pdf-dropzone"),e=document.getElementById("pdf-file-input"),a=document.getElementById("pdf-selected-file"),n=document.getElementById("pdf-filename"),o=document.getElementById("pdf-destination"),i=document.getElementById("btn-process-pdf"),s=document.getElementById("pdf-loading"),r=document.getElementById("pdf-loading-status"),l=document.getElementById("gemini-key-container"),d=document.getElementById("pdf-gemini-key"),m=document.getElementById("save-gemini-key"),u=document.getElementById("method-heuristic"),p=document.getElementById("method-ai"),c=document.querySelector('label[for="method-heuristic"]'),g=document.querySelector('label[for="method-ai"]');if(!t||!e||!i)return;let b=null;const x=localStorage.getItem("gemini_api_key");x&&d&&(d.value=x),c&&g&&u&&p&&(c.addEventListener("click",()=>{u.checked=!0,c.classList.add("active"),c.style.borderColor="var(--primary)",c.style.background="var(--bg-body)",g.classList.remove("active"),g.style.borderColor="var(--border)",g.style.background="var(--bg-card)",l&&(l.style.display="none")}),g.addEventListener("click",()=>{p.checked=!0,g.classList.add("active"),g.style.borderColor="var(--primary)",g.style.background="var(--bg-body)",c.classList.remove("active"),c.style.borderColor="var(--border)",c.style.background="var(--bg-card)",l&&(l.style.display="block")})),t.addEventListener("dragover",y=>{y.preventDefault(),t.classList.add("dragover")}),t.addEventListener("dragleave",()=>{t.classList.remove("dragover")}),t.addEventListener("drop",y=>{if(y.preventDefault(),t.classList.remove("dragover"),y.dataTransfer.files.length>0){const f=y.dataTransfer.files[0];f.type==="application/pdf"||f.name.endsWith(".pdf")?(b=f,n.textContent=f.name,a.style.display="block"):alert("Apenas arquivos PDF são aceitos.")}}),t.addEventListener("click",()=>{e.click()}),e.addEventListener("change",()=>{if(e.files.length>0){const y=e.files[0];b=y,n.textContent=y.name,a.style.display="block"}}),i.addEventListener("click",async()=>{if(!b){alert("Por favor, selecione um arquivo PDF primeiro.");return}const y=o.value;if(!y){alert("Por favor, selecione um banco ou cartão de destino.");return}const f=p.checked;let h="";if(f){if(h=d.value.trim(),!h){alert("Por favor, insira sua Chave de API do Gemini para continuar.");return}m.checked?localStorage.setItem("gemini_api_key",h):localStorage.removeItem("gemini_api_key")}s.style.display="block",i.disabled=!0,i.innerHTML='<i class="fa-solid fa-circle-notch fa-spin"></i> Processando extrato...';try{r.textContent="Lendo e extraindo texto do arquivo PDF...";const k=await xa(b);r.textContent=f?"Enviando texto para a Inteligência Artificial...":"Processando transações localmente...";let E=[];if(f?E=await wa(k,h):E=ha(k),E.length===0){alert("Nenhuma transação identificada no extrato. Tente utilizar a opção de Inteligência Artificial se o extrato for muito complexo."),s.style.display="none",i.disabled=!1,i.innerHTML='<i class="fa-solid fa-file-import"></i> Extrair Transações';return}const q=document.getElementById("bulk-rows-container");q&&(q.innerHTML=""),E.forEach(dt=>{dt.paymentMethod=y,window.addBulkRowWithData(dt)});const $e=document.getElementById("tab-tx-bulk");$e&&$e.click(),b=null,e.value="",a.style.display="none",s.style.display="none",i.disabled=!1,i.innerHTML='<i class="fa-solid fa-file-import"></i> Extrair Transações',typeof C=="function"?C(`${E.length} transação(ões) extraída(s) com sucesso!`):alert(`${E.length} transações extraídas com sucesso! Revise os valores antes de salvar.`)}catch(k){console.error(k),alert(`Erro ao processar o extrato: ${k.message}`),s.style.display="none",i.disabled=!1,i.innerHTML='<i class="fa-solid fa-file-import"></i> Extrair Transações'}})}Re&&Re.addEventListener("click",()=>{Me.reset(),document.getElementById("transfer-date").valueAsDate=new Date;const t=document.getElementById("transfer-source-bank"),e=document.getElementById("transfer-dest-bank");t.innerHTML='<option value="" disabled selected>Selecione</option>',e.innerHTML='<option value="" disabled selected>Selecione</option>',$.forEach(a=>{t.innerHTML+=`<option value="${a.id}">${a.name}</option>`,e.innerHTML+=`<option value="${a.id}">${a.name}</option>`}),Ne.classList.add("active")});Me&&Me.addEventListener("submit",async t=>{t.preventDefault();const e=document.getElementById("transfer-amount").value,a=document.getElementById("transfer-date").value,n=document.getElementById("transfer-source-bank").value,o=document.getElementById("transfer-dest-bank").value,i=document.getElementById("transfer-description").value||"Transferência entre contas",s=F(e);if(isNaN(s)||s<=0)return alert("Valor inválido!");if(!n||!o)return alert("Selecione as contas de origem e destino!");if(n===o)return alert("A conta de origem não pode ser a mesma de destino!");try{const r=S.batch(),l=L.doc();r.set(l,{userId:w.uid,type:"expense",description:i,amount:s,category:"Transferência",date:a,paymentMethod:n,createdAt:firebase.firestore.FieldValue.serverTimestamp()});const d=L.doc();r.set(d,{userId:w.uid,type:"income",description:i,amount:s,category:"Transferência",date:a,paymentMethod:o,createdAt:firebase.firestore.FieldValue.serverTimestamp()}),await r.commit(),Ne.classList.remove("active"),Me.reset(),A.some(u=>u.name.trim().toLowerCase()==="transferência")||await z.add({userId:w.uid,name:"Transferência",icon:"fa-arrow-right-arrow-left"}),typeof C=="function"&&C("Transferência realizada com sucesso!")}catch(r){alert("Erro ao transferir: "+r.message)}});document.getElementById("btn-new-goal").addEventListener("click",()=>Ie.classList.add("active"));document.getElementById("btn-new-fixed-transaction").addEventListener("click",()=>{ee=null,document.querySelector("#fixed-transaction-modal h2").textContent="Nova Transação Fixa",Te.reset(),document.getElementById("fixed-day").value=new Date().getDate(),le.classList.add("active")});Dt.addEventListener("click",()=>{te=null,document.querySelector("#card-modal h2").textContent="Novo Cartão de Crédito",Ae.reset(),de.classList.add("active")});const Bt=document.getElementById("btn-show-pending-installments");Bt&&Bt.addEventListener("click",()=>{window.showPendingInstallmentsModal()});window.showPendingInstallmentsModal=()=>{const t=document.getElementById("installments-pending-tbody");if(!t)return;t.innerHTML="";const e={};I.forEach(o=>{o.groupId&&(e[o.groupId]||(e[o.groupId]={description:o.description.replace(/\s\(\d+\/\d+\)$/,""),totalAmount:o.totalAmount||0,installmentTotal:o.installmentTotal||1,paymentMethod:o.paymentMethod,category:o.category,installments:[]}),e[o.groupId].installments.push(o))});const a=new Date().toISOString().slice(0,10),n=[];for(const o in e){const i=e[o];i.installments.sort((r,l)=>r.date.localeCompare(l.date));const s=i.installments.filter(r=>r.date>=a);if(s.length>0){const r=i.installmentTotal-s.length,l=s.reduce((m,u)=>m+u.amount,0),d=s[0];n.push({description:i.description,paymentMethod:i.paymentMethod,category:i.category,installmentTotal:i.installmentTotal,paidCount:r,remainingCount:s.length,remainingAmount:l,totalAmount:i.totalAmount||i.installmentTotal*i.installments[0].amount,nextDate:d.date,nextAmount:d.amount})}}n.length===0?t.innerHTML='<tr><td colspan="7" style="text-align: center; padding: 24px; color: var(--text-muted);"><i class="fa-solid fa-check-double" style="font-size: 1.5rem; margin-bottom: 8px; display: block;"></i> Nenhuma compra parcelada pendente!</td></tr>':n.forEach(o=>{const i=Ia(o.paymentMethod);t.innerHTML+=`
                <tr style="border-bottom: 1px solid var(--border);">
                    <td style="padding: 12px 8px; font-weight: 500;">${o.description}</td>
                    <td style="padding: 12px 8px; color: var(--text-muted);">${i}</td>
                    <td style="padding: 12px 8px;"><span class="badge" style="background: var(--bg-secondary); border: 1px solid var(--border); padding: 4px 8px; border-radius: 4px; font-size: 0.8rem;">${o.category}</span></td>
                    <td style="padding: 12px 8px; font-weight: 600;">${o.paidCount}/${o.installmentTotal} <span style="font-size: 0.75rem; color: var(--text-muted); font-weight: normal;">(restam ${o.remainingCount})</span></td>
                    <td style="padding: 12px 8px; font-size: 0.9rem;">${N(o.nextDate)} <span style="font-size: 0.75rem; color: var(--text-muted); display: block;">${v(o.nextAmount)}</span></td>
                    <td style="padding: 12px 8px; font-weight: 700; color: var(--danger);">${v(o.remainingAmount)}</td>
                    <td style="padding: 12px 8px; color: var(--text-muted);">${v(o.totalAmount)}</td>
                </tr>
            `}),ne.classList.add("active")};function Ia(t){if(!t)return"N/A";const e=$.find(n=>n.id===t);if(e)return`🏦 ${e.name}`;const a=B.find(n=>n.id===t);return a?`💳 ${a.nickname}`:t}window.addEventListener("click",t=>{t.target.classList.contains("modal-overlay")&&(O.classList.remove("active"),le.classList.remove("active"),de.classList.remove("active"),Ie.classList.remove("active"),K.classList.remove("active"),Be.classList.remove("active"),W&&W.classList.remove("active"),ne&&ne.classList.remove("active"))});fa();_();document.querySelectorAll(".close-modal, .btn-secondary").forEach(t=>{t.addEventListener("click",()=>{O.classList.remove("active"),le.classList.remove("active"),de.classList.remove("active"),Ie.classList.remove("active"),K.classList.remove("active"),Be.classList.remove("active"),W&&W.classList.remove("active"),ne&&ne.classList.remove("active"),Q.reset(),j=null,be=null,qe=null,he=null,document.querySelector("#transaction-modal h2").textContent="Nova Transação",Te.reset(),ee=null,Ae.reset(),te=null,Fe.reset()})});[O,Ie,le,de,W,ne].forEach(t=>{t&&t.addEventListener("click",e=>{e.target===t&&t.classList.remove("active")})});let H={selic:10.5,cdi:10.4};async function Ba(){try{const e=await(await fetch("https://brasilapi.com.br/api/taxas/v1")).json(),a=e.find(o=>o.nome.toLowerCase()==="selic"),n=e.find(o=>o.nome.toLowerCase()==="cdi");a&&(H.selic=a.valor),n&&(H.cdi=n.valor),document.getElementById("market-rates-display").innerHTML=`
            <span style="margin-right: 16px;">Selic: <strong>${H.selic.toFixed(2)}%</strong></span>
            <span>CDI: <strong>${H.cdi.toFixed(2)}%</strong></span>
        `}catch(t){console.error("Erro ao buscar taxas da API:",t),document.getElementById("market-rates-display").textContent=`Selic: ${H.selic}% | CDI: ${H.cdi}% (Offline)`}}function ka(){ve&&ve(),ve=xe.where("userId","==",w.uid).orderBy("date","desc").onSnapshot(t=>{ie=[],t.forEach(e=>ie.push({id:e.id,...e.data()})),$a()},t=>console.error("Investments snap error:",t))}function kt(t,e=new Date,a=!1){let n=t.amount,o=0;const i=t.manualCurrentValue!==void 0&&t.manualCurrentValue!==null&&t.manualCurrentValue!=="";if(!a&&i)n=parseFloat(t.manualCurrentValue);else if(t.type==="fixed"){const r=new Date(t.date+"T00:00:00"),l=Math.floor((e-r)/(1e3*60*60*24));if(l>0){let d=0;t.rateType==="cdi"?d=H.cdi*(t.rateValue/100):t.rateType==="selic"?d=H.selic*(t.rateValue/100):d=t.rateValue;const m=Math.pow(1+d/100,1/365)-1;n=t.amount*Math.pow(1+m,l)}}const s=n-t.amount;if(s>0&&t.type==="fixed"){const r=new Date(t.date+"T00:00:00"),l=Math.floor((e-r)/(1e3*60*60*24));let d=0;l<=180?d=.225:l<=360?d=.2:l<=720?d=.175:d=.15,o=s*d}return{gross:n,tax:o,net:n-o}}function $a(){const t=document.getElementById("investments-list");if(!t)return;t.innerHTML="";let e=0,a=0;if(ie.length===0){t.innerHTML='<div class="empty-state w-100"><i class="fa-solid fa-chart-line"></i><p>Nenhum investimento cadastrado.</p></div>',document.getElementById("total-investments").textContent="R$ 0,00",document.getElementById("total-investments-yield").textContent="R$ 0,00";return}ie.forEach(n=>{e+=n.amount;const o=n.manualCurrentValue!==void 0&&n.manualCurrentValue!==null&&n.manualCurrentValue!=="";let i=kt(n,new Date),s="";if(n.type==="fixed"||o){const r=i,l=r.gross>=n.amount;let d="";if(n.type==="fixed"&&n.dueDate){const m=new Date(n.dueDate+"T00:00:00");if(m>new Date){const u=kt(n,m,!0);d=`
                        <div style="margin-top: 8px; padding-top: 8px; border-top: 1px dashed var(--border);">
                            <span style="font-size: 0.8rem; color: var(--text-muted); text-transform: uppercase; font-weight: bold;">Projeção no Vencimento</span>
                            <div style="display: flex; justify-content: space-between; margin-top: 4px;">
                                <span>Bruto Estimado:</span>
                                <strong style="color: var(--text-main)">${v(u.gross)}</strong>
                            </div>
                            <div style="display: flex; justify-content: space-between; margin-bottom: 4px; color: var(--text-muted);">
                                <span>Imposto (IR):</span>
                                <span>- ${v(u.tax)}</span>
                            </div>
                            <div style="display: flex; justify-content: space-between; font-weight: bold;">
                                <span>Líquido Projetado:</span>
                                <span>${v(u.net)}</span>
                            </div>
                        </div>
                    `}}s=`
                <div style="background: var(--bg-body); padding: 8px; border-radius: 6px; margin-top: 12px; font-size: 0.9rem;">
                    <span style="font-size: 0.8rem; color: var(--text-muted); text-transform: uppercase; font-weight: bold;">Posição Atual ${o?"(Manual)":""}</span>
                    <div style="display: flex; justify-content: space-between; margin-top: 4px;">
                        <span>Bruto ${o?"Real":"Estimado"}:</span>
                        <strong style="color: ${l?"var(--success)":"var(--danger)"}">${v(r.gross)}</strong>
                    </div>
                    ${n.type==="fixed"?`
                    <div style="display: flex; justify-content: space-between; margin-bottom: 4px; color: var(--text-muted);">
                        <span>Imposto (IR):</span>
                        <span>- ${v(r.tax)}</span>
                    </div>`:""}
                    <div style="display: flex; justify-content: space-between; font-weight: bold;">
                        <span>Líquido Atual:</span>
                        <span>${v(r.net)}</span>
                    </div>
                    ${d}
                </div>
            `}a+=i.gross,t.innerHTML+=`
            <div class="card" style="padding: 16px; border: 1px solid var(--border); position: relative;">
                <div style="position: absolute; top: 16px; right: 16px; display: flex; gap: 8px;">
                    <button class="btn-icon" onclick="window.editInvestment('${n.id}')" title="Editar / Aporte"><i class="fa-solid fa-pen"></i></button>
                    <button class="btn-icon" onclick="window.deleteInvestment('${n.id}')" title="Excluir"><i class="fa-solid fa-trash"></i></button>
                </div>
                <h4 style="margin-bottom: 4px; padding-right: 24px;">${n.name}</h4>
                <p style="color: var(--text-muted); font-size: 0.85rem; margin-bottom: 12px;">
                    <i class="fa-solid fa-building-columns"></i> ${n.institution} • ${n.type==="fixed"?"Renda Fixa":n.type==="variable"?"Renda Variável":"Outros"}
                </p>
                <div style="display:flex; justify-content: space-between; margin-bottom: 4px;">
                    <span>Valor Aplicado:</span>
                    <strong>${v(n.amount)}</strong>
                </div>
                <div style="display:flex; justify-content: space-between; color: var(--text-muted); font-size: 0.85rem;">
                    <span>Data: ${N(n.date)}</span>
                    ${n.dueDate?`<span>Venc: ${N(n.dueDate)}</span>`:""}
                </div>
                ${n.type==="fixed"?`<div style="font-size: 0.85rem; margin-top: 4px; color: var(--primary);"><i class="fa-solid fa-percent"></i> Taxa: ${n.rateValue}% ${n.rateType.toUpperCase()}</div>`:""}
                
                ${s}
            </div>
        `}),document.getElementById("total-investments").textContent=v(e),document.getElementById("total-investments-yield").textContent=v(a)}const we=document.getElementById("invest-type"),$t=document.getElementById("fixed-income-fields"),Ct=document.getElementById("invest-due-date-container");we&&we.addEventListener("change",t=>{t.target.value==="fixed"?($t.style.display="block",Ct.style.display="block"):($t.style.display="none",Ct.style.display="none")});const Lt=document.getElementById("btn-new-investment");Lt&&Lt.addEventListener("click",()=>{ce.reset(),document.getElementById("investment-modal").querySelector("h2").textContent="Novo Investimento",document.getElementById("edit-investment-fields").style.display="none",document.getElementById("invest-id").value="",document.getElementById("invest-amount").disabled=!1,document.getElementById("invest-date").valueAsDate=new Date,we.dispatchEvent(new Event("change")),W.classList.add("active")});ce&&ce.addEventListener("submit",async t=>{t.preventDefault();const e=document.getElementById("invest-id").value,a=document.getElementById("invest-name").value,n=document.getElementById("invest-institution").value,o=we.value,i=F(document.getElementById("invest-amount").value),s=document.getElementById("invest-date").value,r=document.getElementById("invest-due-date").value,l=F(document.getElementById("invest-new-aporte").value)||0,d=document.getElementById("invest-manual-value").value,m=d?parseFloat(d):null;let u=i;e&&l>0&&(u+=l);const p={userId:w.uid,name:a,institution:n,type:o,amount:u,date:s,dueDate:r};m!==null?p.manualCurrentValue=m:e&&(p.manualCurrentValue=firebase.firestore.FieldValue.delete()),e||(p.createdAt=firebase.firestore.FieldValue.serverTimestamp()),o==="fixed"&&(p.rateType=document.getElementById("invest-rate-type").value,p.rateValue=parseFloat(document.getElementById("invest-rate-value").value||0));try{e?await xe.doc(e).update(p):await xe.add(p),W.classList.remove("active"),ce.reset()}catch(c){alert("Erro ao salvar investimento: "+c.message)}});window.editInvestment=t=>{const e=ie.find(a=>a.id===t);e&&(ce.reset(),document.getElementById("investment-modal").querySelector("h2").textContent="Editar Investimento / Aporte",document.getElementById("edit-investment-fields").style.display="block",document.getElementById("invest-id").value=e.id,document.getElementById("invest-name").value=e.name,document.getElementById("invest-institution").value=e.institution,document.getElementById("invest-type").value=e.type,document.getElementById("invest-amount").value=e.amount,document.getElementById("invest-amount").disabled=!0,document.getElementById("invest-date").value=e.date,e.dueDate&&(document.getElementById("invest-due-date").value=e.dueDate),e.type==="fixed"&&(document.getElementById("invest-rate-type").value=e.rateType,document.getElementById("invest-rate-value").value=e.rateValue),e.manualCurrentValue!==void 0&&e.manualCurrentValue!==null&&(document.getElementById("invest-manual-value").value=e.manualCurrentValue),we.dispatchEvent(new Event("change")),W.classList.add("active"))};window.deleteInvestment=async t=>{confirm("Excluir este investimento permanentemente?")&&await xe.doc(t).delete()};document.getElementById("current-date").textContent=new Date().toLocaleDateString("pt-BR",{weekday:"long",year:"numeric",month:"long",day:"numeric"}).replace(/^\w/,t=>t.toUpperCase());document.getElementById("date").valueAsDate=new Date;const St=document.getElementById("theme-toggle-settings"),Je=document.getElementById("theme-toggle-track"),Xe=document.getElementById("theme-toggle-circle");function Nt(){Z?document.body.setAttribute("data-theme","dark"):document.body.removeAttribute("data-theme"),Xe&&Je&&(Z?(Xe.style.transform="translateX(20px)",Je.style.background="var(--primary)"):(Xe.style.transform="translateX(0)",Je.style.background="var(--border)"))}Z&&document.body.setAttribute("data-theme","dark");Nt();St&&St.addEventListener("click",()=>{Z=!Z,localStorage.setItem("contaComigo_darkMode",Z),Nt()});window.populateReportBankSelect=function(){const t=document.getElementById("report-bank");if(!t)return;let e='<option value="" disabled selected>Selecione um banco</option>';$.forEach(a=>{e+=`<option value="${a.id}">🏦 ${a.name}</option>`}),t.innerHTML=e};window.handleReportTypeChange=function(){const t=document.getElementById("report-type").value,e=document.getElementById("report-bank-container"),a=document.getElementById("report-period-container");t==="bank-statement"?(e.style.display="block",a.style.display="block"):(e.style.display="none",a.style.display="block")};window.generateReport=function(){const t=document.getElementById("report-type").value,e=document.getElementById("report-month").value,a=document.getElementById("report-preview-content"),n=document.getElementById("btn-print-report"),o=document.getElementById("btn-export-csv");if(!e){alert("Por favor, selecione um mês de referência.");return}let i="",s="";switch(t){case"monthly-summary":i=Ca(e),s="Resumo Mensal (DRE)";break;case"category-expenses":i=La(e),s="Gastos por Categoria";break;case"bank-statement":const r=document.getElementById("report-bank").value;if(!r){alert("Por favor, selecione uma conta bancária.");return}i=Sa(e,r),s="Extrato Bancário";break;case"credit-card":i=Da(e),s="Relatório de Cartões";break;default:i='<p style="color: var(--text-muted);">Tipo de relatório não suportado.</p>'}a.innerHTML=i,n.disabled=!1,o.disabled=!1,window._currentReportHTML=i,window._currentReportTitle=s};function Ca(t){const[e,a]=t.split("-"),n=`${e}-${a}-01`,o=new Date(e,parseInt(a),0).getDate(),i=`${e}-${a}-${String(o).padStart(2,"0")}`,s=I.filter(c=>c.date>=n&&c.date<=i),r=s.filter(c=>c.type==="income").reduce((c,g)=>c+g.amount,0),l=s.filter(c=>c.type==="expense").reduce((c,g)=>c+g.amount,0),d=r-l,m={};s.filter(c=>c.type==="expense").forEach(c=>{const g=c.category||"Sem Categoria";m[g]||(m[g]=0),m[g]+=c.amount});const u=Object.entries(m).sort((c,g)=>g[1]-c[1]);let p="";return u.length===0?p='<tr><td colspan="2" style="text-align: center; color: var(--text-muted);">Nenhuma despesa neste período.</td></tr>':u.forEach(([c,g])=>{const b=l>0?(g/l*100).toFixed(1):0;p+=`
                <tr>
                    <td>${c}</td>
                    <td style="text-align: right; font-weight: 500;">${v(g)}</td>
                    <td style="text-align: right; color: var(--text-muted);">${b}%</td>
                </tr>
            `}),`
        <div class="report-content">
            <h3 style="margin-bottom: 8px;">📊 ${ke(t)}</h3>
            <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 16px; margin-bottom: 24px;">
                <div style="background: var(--success-bg); padding: 16px; border-radius: 8px; text-align: center; border: 1px solid var(--success);">
                    <span style="display: block; font-size: 0.85rem; color: var(--text-muted);">Receitas</span>
                    <span style="font-size: 1.5rem; font-weight: 700; color: var(--success);">${v(r)}</span>
                </div>
                <div style="background: var(--danger-bg); padding: 16px; border-radius: 8px; text-align: center; border: 1px solid var(--danger);">
                    <span style="display: block; font-size: 0.85rem; color: var(--text-muted);">Despesas</span>
                    <span style="font-size: 1.5rem; font-weight: 700; color: var(--danger);">${v(l)}</span>
                </div>
                <div style="background: var(--bg-body); padding: 16px; border-radius: 8px; text-align: center; border: 1px solid var(--border);">
                    <span style="display: block; font-size: 0.85rem; color: var(--text-muted);">Saldo do Mês</span>
                    <span style="font-size: 1.5rem; font-weight: 700; color: ${d>=0?"var(--success)":"var(--danger)"};">${v(d)}</span>
                </div>
            </div>
            
            <h4 style="margin-bottom: 12px;">Despesas por Categoria</h4>
            <table style="width: 100%; border-collapse: collapse;">
                <thead>
                    <tr style="border-bottom: 2px solid var(--border);">
                        <th style="text-align: left; padding: 8px; color: var(--text-muted);">Categoria</th>
                        <th style="text-align: right; padding: 8px; color: var(--text-muted);">Valor</th>
                        <th style="text-align: right; padding: 8px; color: var(--text-muted);">%</th>
                    </tr>
                </thead>
                <tbody>
                    ${p}
                </tbody>
            </table>
            
            <div style="margin-top: 16px; padding-top: 16px; border-top: 1px solid var(--border); color: var(--text-muted); font-size: 0.85rem;">
                <span>Total de transações: ${s.length}</span>
            </div>
        </div>
    `}function La(t){const[e,a]=t.split("-"),n=`${e}-${a}-01`,o=new Date(e,parseInt(a),0).getDate(),i=`${e}-${a}-${String(o).padStart(2,"0")}`,s=I.filter(m=>m.date>=n&&m.date<=i),r={};s.forEach(m=>{const u=m.category||"Sem Categoria";r[u]||(r[u]={income:0,expense:0,total:0}),m.type==="income"?r[u].income+=m.amount:r[u].expense+=m.amount,r[u].total+=m.type==="income"?m.amount:-m.amount});const l=Object.entries(r).sort((m,u)=>Math.abs(u[1].total)-Math.abs(m[1].total));let d="";return l.length===0?d='<tr><td colspan="4" style="text-align: center; color: var(--text-muted);">Nenhuma transação neste período.</td></tr>':l.forEach(([m,u])=>{d+=`
                <tr>
                    <td>${m}</td>
                    <td style="text-align: right; font-weight: 500; color: var(--success);">${v(u.income)}</td>
                    <td style="text-align: right; font-weight: 500; color: var(--danger);">${v(u.expense)}</td>
                    <td style="text-align: right; font-weight: 700; color: ${u.total>=0?"var(--success)":"var(--danger)"};">${v(u.total)}</td>
                </tr>
            `}),`
        <div class="report-content">
            <h3 style="margin-bottom: 8px;">📊 Gastos por Categoria - ${ke(t)}</h3>
            <table style="width: 100%; border-collapse: collapse;">
                <thead>
                    <tr style="border-bottom: 2px solid var(--border);">
                        <th style="text-align: left; padding: 8px; color: var(--text-muted);">Categoria</th>
                        <th style="text-align: right; padding: 8px; color: var(--text-muted);">Receitas</th>
                        <th style="text-align: right; padding: 8px; color: var(--text-muted);">Despesas</th>
                        <th style="text-align: right; padding: 8px; color: var(--text-muted);">Saldo</th>
                    </tr>
                </thead>
                <tbody>
                    ${d}
                </tbody>
            </table>
        </div>
    `}function Sa(t,e){const a=$.find(g=>g.id===e);if(!a)return'<p style="color: var(--danger);">Banco não encontrado.</p>';const[n,o]=t.split("-"),i=`${n}-${o}-01`,s=new Date(n,parseInt(o),0).getDate(),r=`${n}-${o}-${String(s).padStart(2,"0")}`,l=I.filter(g=>g.paymentMethod===e&&g.date>=i&&g.date<=r).sort((g,b)=>g.date.localeCompare(b.date));let d=a.balance||0,m="";l.length===0?m='<tr><td colspan="4" style="text-align: center; color: var(--text-muted);">Nenhuma transação neste período.</td></tr>':l.forEach(g=>{d+=g.type==="income"?g.amount:-g.amount,m+=`
                <tr>
                    <td>${N(g.date)}</td>
                    <td>${g.description}</td>
                    <td style="text-align: right; color: ${g.type==="income"?"var(--success)":"var(--danger)"};">${v(g.amount)}</td>
                    <td style="text-align: right; font-weight: 500;">${v(d)}</td>
                </tr>
            `});const u=l.filter(g=>g.type==="income").reduce((g,b)=>g+b.amount,0),p=l.filter(g=>g.type==="expense").reduce((g,b)=>g+b.amount,0),c=d;return`
        <div class="report-content">
            <h3 style="margin-bottom: 8px;">🏦 Extrato - ${a.name}</h3>
            <p style="color: var(--text-muted); margin-bottom: 16px;">${ke(t)}</p>
            
            <div style="display: grid; grid-template-columns: repeat(4, 1fr); gap: 12px; margin-bottom: 20px;">
                <div style="background: var(--bg-body); padding: 12px; border-radius: 8px; text-align: center;">
                    <span style="display: block; font-size: 0.75rem; color: var(--text-muted);">Saldo Inicial</span>
                    <span style="font-weight: 700;">${v(a.balance||0)}</span>
                </div>
                <div style="background: var(--success-bg); padding: 12px; border-radius: 8px; text-align: center;">
                    <span style="display: block; font-size: 0.75rem; color: var(--text-muted);">Receitas</span>
                    <span style="font-weight: 700; color: var(--success);">${v(u)}</span>
                </div>
                <div style="background: var(--danger-bg); padding: 12px; border-radius: 8px; text-align: center;">
                    <span style="display: block; font-size: 0.75rem; color: var(--text-muted);">Despesas</span>
                    <span style="font-weight: 700; color: var(--danger);">${v(p)}</span>
                </div>
                <div style="background: var(--bg-body); padding: 12px; border-radius: 8px; text-align: center;">
                    <span style="display: block; font-size: 0.75rem; color: var(--text-muted);">Saldo Final</span>
                    <span style="font-weight: 700; color: ${c>=0?"var(--success)":"var(--danger)"};">${v(c)}</span>
                </div>
            </div>
            
            <table style="width: 100%; border-collapse: collapse;">
                <thead>
                    <tr style="border-bottom: 2px solid var(--border);">
                        <th style="text-align: left; padding: 8px; color: var(--text-muted);">Data</th>
                        <th style="text-align: left; padding: 8px; color: var(--text-muted);">Descrição</th>
                        <th style="text-align: right; padding: 8px; color: var(--text-muted);">Valor</th>
                        <th style="text-align: right; padding: 8px; color: var(--text-muted);">Saldo</th>
                    </tr>
                </thead>
                <tbody>
                    ${m}
                </tbody>
            </table>
        </div>
    `}function Da(t){const[e,a]=t.split("-"),n=`${e}-${a}-01`,o=new Date(e,parseInt(a),0).getDate(),i=`${e}-${a}-${String(o).padStart(2,"0")}`;if(B.length===0)return'<p style="color: var(--text-muted);">Nenhum cartão cadastrado.</p>';let s="";return B.forEach(r=>{const l=I.filter(c=>c.paymentMethod===r.id&&c.date>=n&&c.date<=i),d=l.filter(c=>c.type==="income").reduce((c,g)=>c+g.amount,0),m=l.filter(c=>c.type==="expense").reduce((c,g)=>c+g.amount,0),u=d-m;let p="";l.length===0?p='<tr><td colspan="3" style="text-align: center; color: var(--text-muted);">Sem movimentação</td></tr>':l.forEach(c=>{p+=`
                    <tr>
                        <td>${N(c.date)}</td>
                        <td>${c.description}</td>
                        <td style="text-align: right; color: ${c.type==="income"?"var(--success)":"var(--danger)"};">${v(c.amount)}</td>
                    </tr>
                `}),s+=`
            <div style="background: var(--bg-body); padding: 16px; border-radius: 8px; border: 1px solid var(--border); margin-bottom: 16px;">
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px;">
                    <h4 style="margin: 0;">💳 ${r.nickname}</h4>
                    <span style="background: ${u>=0?"var(--success-bg)":"var(--danger-bg)"}; padding: 4px 12px; border-radius: 12px; font-weight: 600; color: ${u>=0?"var(--success)":"var(--danger)"};">${v(u)}</span>
                </div>
                <table style="width: 100%; border-collapse: collapse;">
                    <thead>
                        <tr style="border-bottom: 1px solid var(--border);">
                            <th style="text-align: left; padding: 4px 8px; color: var(--text-muted); font-size: 0.85rem;">Data</th>
                            <th style="text-align: left; padding: 4px 8px; color: var(--text-muted); font-size: 0.85rem;">Descrição</th>
                            <th style="text-align: right; padding: 4px 8px; color: var(--text-muted); font-size: 0.85rem;">Valor</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${p}
                    </tbody>
                </table>
                <div style="margin-top: 8px; display: flex; justify-content: space-between; font-size: 0.85rem; color: var(--text-muted);">
                    <span>Limite: ${v(r.limit)}</span>
                    <span>Fechamento: Dia ${r.closingDay} | Vencimento: Dia ${r.dueDay}</span>
                </div>
            </div>
        `}),`
        <div class="report-content">
            <h3 style="margin-bottom: 16px;">💳 Relatório de Cartões - ${ke(t)}</h3>
            ${s}
        </div>
    `}window.printReport=function(){window.print()};window.exportReportCSV=function(){const e=document.getElementById("report-preview-content").querySelectorAll("table tr");if(e.length===0){alert("Nenhum dado para exportar.");return}let a="";e.forEach(i=>{const s=i.querySelectorAll("th, td"),r=[];s.forEach(l=>{r.push('"'+l.textContent.trim().replace(/"/g,'""')+'"')}),a+=r.join(",")+`
`});const n=new Blob([a],{type:"text/csv;charset=utf-8;"}),o=document.createElement("a");o.href=URL.createObjectURL(n),o.download=`relatorio_${new Date().toISOString().slice(0,10)}.csv`,o.click(),URL.revokeObjectURL(o.href)};ba();Ea();function Ma(){new Date().toISOString().slice(0,7);const t=new Date().getFullYear(),e=new Date().getMonth();let a=0,n=[];B.forEach(i=>{const r=I.filter(l=>{if(l.paymentMethod!==i.id||l.type!=="expense"||!l.date)return!1;const d=new Date(l.date);return d.getFullYear()===t&&d.getMonth()===e}).reduce((l,d)=>l+d.amount,0);r>0&&(n.push({name:i.nickname,bank:i.bank,total:r}),a+=r)}),n.sort((i,s)=>s.total-i.total);let o="";if(n.length===0)o="Nenhum gasto no cartão este mês";else if(n.length===1)o=`${n[0].name}: ${v(n[0].total)}`;else{const i=n[0],s=n.length-1,r=n.slice(1).reduce((l,d)=>l+d.total,0);o=`${i.name}: ${v(i.total)} + ${s} outro(s) cartão(es) (${v(r)})`}return{total:a,details:o,cards:n}}let Qe=null;window.generateCategoryChart=qt;function qt(){var x;const t=document.getElementById("category-chart");if(!t)return;const e=parseInt(document.getElementById("chart-period").value)||30,a=document.getElementById("chart-date-start").value,n=document.getElementById("chart-date-end").value;let o=a,i=n;if(!o&&!i&&e!=="all"){const y=new Date,f=new Date;f.setDate(f.getDate()-e),o=f.toISOString().slice(0,10),i=y.toISOString().slice(0,10),document.getElementById("chart-date-start").value=o,document.getElementById("chart-date-end").value=i}let s=I;(o||i)&&(s=I.filter(y=>y.date?!(o&&y.date<o||i&&y.date>i):!0));const r=s.filter(y=>y.type==="expense"),l={};r.forEach(y=>{const f=y.category||"Sem Categoria";l[f]||(l[f]=0),l[f]+=y.amount});const d=Object.entries(l).sort((y,f)=>f[1]-y[1]),m=d.map(y=>y[0]),u=d.map(y=>y[1]),p=["#FF6B6B","#4ECDC4","#45B7D1","#96CEB4","#FFEAA7","#DDA0DD","#FF8A5C","#A29BFE","#FD79A8","#00B894","#E17055","#74B9FF","#55EFC4","#FDCB6E","#E84393"];u.reduce((y,f)=>y+f,0);const c=((x=document.getElementById("chart-period").options[document.getElementById("chart-period").selectedIndex])==null?void 0:x.text)||"Últimos 30 dias",g=document.querySelector("#page-dashboard .section-header h3");if(g){const y=o&&i?`${N(o)} a ${N(i)}`:c;g.textContent=`Distribuição de Despesas (${y})`}if(u.length===0){t.style.display="none",document.getElementById("chart-legend").innerHTML='<p style="color: var(--text-muted); text-align: center; font-size: 0.9rem;">Nenhuma despesa no período selecionado.</p>';return}t.style.display="block",Qe&&Qe.destroy(),Qe=new Chart(t,{type:"doughnut",data:{labels:m,datasets:[{data:u,backgroundColor:p.slice(0,u.length),borderColor:"#ffffff",borderWidth:2}]},options:{responsive:!0,maintainAspectRatio:!1,plugins:{legend:{display:!1},tooltip:{callbacks:{label:function(y){const f=y.dataset.data.reduce((k,E)=>k+E,0),h=f>0?(y.parsed/f*100).toFixed(1):0;return`${y.label}: ${v(y.parsed)} (${h}%)`}}}}}});const b=document.getElementById("chart-legend");if(b){const y=u.reduce((f,h)=>f+h,0);b.innerHTML=m.map((f,h)=>{const k=u[h],E=y>0?(k/y*100).toFixed(1):0;return`
                <div class="legend-item">
                    <span class="color-dot" style="background: ${p[h%p.length]};"></span>
                    <span style="font-weight: 500;">${f}</span>
                    <span class="value">${v(k)}</span>
                    <span class="percentage">(${E}%)</span>
                </div>
            `}).join(""),b.innerHTML+=`
            <div class="legend-total">
                <span style="font-weight: 600;">Total:</span>
                <span class="total-value">${v(y)}</span>
            </div>
        `}}window.navigateCardMonth=(t,e)=>{const a=document.getElementById("cc-filter-month");if(!a)return;let n=a.value;n||(n=new Date().toISOString().slice(0,7));const[o,i]=n.split("-").map(Number),r=new Date(o,i-1+e,1).toISOString().slice(0,7);a.value=r,D.month=r,window.filterCardExtract(t)};window.resetCardMonth=t=>{const e=document.getElementById("cc-filter-month");if(!e)return;const a=B.find(i=>i.id===t);if(!a)return;const n=new Date,o=window.getInvoiceMonth(n.toISOString().slice(0,10),a.closingDay);e.value=o,D.month=o,window.filterCardExtract(t)};document.addEventListener("keydown",t=>{if(!T)return;const e=document.getElementById("cc-filter-month");!e||document.activeElement===e||(t.key==="ArrowLeft"&&t.ctrlKey?(t.preventDefault(),window.navigateCardMonth(T,-1)):t.key==="ArrowRight"&&t.ctrlKey?(t.preventDefault(),window.navigateCardMonth(T,1)):t.key==="r"&&t.ctrlKey&&(t.preventDefault(),window.resetCardMonth(T)))});window.applyBulkDateToAllRows=()=>{const t=document.getElementById("bulk-date").value;if(!t){alert("Por favor, selecione uma data primeiro.");return}const e=document.querySelectorAll(".bulk-row");if(e.length===0){alert("Nenhuma linha para atualizar.");return}e.forEach(a=>{const n=a.querySelector(".bulk-row-date");n&&(n.value=t)})};window.setBulkDateToToday=()=>{const t=new Date().toISOString().slice(0,10);document.getElementById("bulk-date").value=t,window.applyBulkDateToAllRows()};document.addEventListener("DOMContentLoaded",()=>{const t=document.getElementById("bulk-date");t&&t.addEventListener("change",function(){document.querySelectorAll(".bulk-row").forEach(a=>{const n=a.querySelector(".bulk-row-date");n&&!n.value&&(n.value=this.value)})})});

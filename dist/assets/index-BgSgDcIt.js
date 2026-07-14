(function(){const e=document.createElement("link").relList;if(e&&e.supports&&e.supports("modulepreload"))return;for(const n of document.querySelectorAll('link[rel="modulepreload"]'))o(n);new MutationObserver(n=>{for(const i of n)if(i.type==="childList")for(const s of i.addedNodes)s.tagName==="LINK"&&s.rel==="modulepreload"&&o(s)}).observe(document,{childList:!0,subtree:!0});function a(n){const i={};return n.integrity&&(i.integrity=n.integrity),n.referrerPolicy&&(i.referrerPolicy=n.referrerPolicy),n.crossOrigin==="use-credentials"?i.credentials="include":n.crossOrigin==="anonymous"?i.credentials="omit":i.credentials="same-origin",i}function o(n){if(n.ep)return;n.ep=!0;const i=a(n);fetch(n.href,i)}})();const v=t=>new Intl.NumberFormat("pt-BR",{style:"currency",currency:"BRL"}).format(t);function A(t){if(!t)return 0;let e=t.toString().trim();e.includes(",")&&(e=e.replace(/\./g,""),e=e.replace(",","."));const a=parseFloat(e);return isNaN(a)?0:a}function Ee(t){if(!t)return"";const[e,a]=t.split("-");return`${["Janeiro","Fevereiro","Março","Abril","Maio","Junho","Julho","Agosto","Setembro","Outubro","Novembro","Dezembro"][parseInt(a)-1]} ${e}`}function Ft(t,e=[]){const a=e.find(o=>o.name===t);return a?a.icon:"fa-tag"}function jt(t,e=[],a=[]){if(!t)return"N/A";const o=e.find(i=>i.id===t);if(o)return`🏦 ${o.name}`;const n=a.find(i=>i.id===t);return n?`💳 ${n.nickname}`:t}function Gt(t){const e=t.split(`
`),a=[],o=/\b(\d{2})\/(\d{2})(?:\/(\d{2,4}))?\b/,n=/(?:R\$\s*)?(-?\b\d{1,3}(?:\.\d{3})*,\d{2}\b|-?\b\d+,\d{2}\b)\s*([CDcd\-+])?/;for(let i of e){if(i=i.trim(),!i)continue;const s=i.match(o);if(!s)continue;const r=i.match(n);if(!r)continue;const l=s[1],p=s[2];let c=s[3]||new Date().getFullYear().toString();c.length===2&&(c="20"+c);const d=`${c}-${p.padStart(2,"0")}-${l.padStart(2,"0")}`;let u=r[1].replace(/\./g,"").replace(",","."),m=parseFloat(u);if(isNaN(m))continue;let g="expense";const b=r[2];if(r[1].startsWith("-")||b==="-"||b&&b.toUpperCase()==="D")g="expense";else if(b==="+"||b&&b.toUpperCase()==="C")g="income";else{const k=i.toLowerCase();k.includes("recebido")||k.includes("depósito")||k.includes("credito")||k.includes("crédito")||k.includes("salário")||k.includes("estorno")||k.includes("transferência recebida")||k.includes("pix recebido")?g="income":g="expense"}if(m=Math.abs(m),m===0)continue;let y=i.replace(s[0],"").replace(r[0],"").replace(/\s+/g," ").trim();y=y.replace(/^[\s\-\|\,\.\:]+/,"").replace(/[\s\-\|\,\.\:]+$/,"").trim(),y||(y="Transação Extrato");let f="";const x=y.toLowerCase();x.includes("mercado")||x.includes("supermercado")?f="Alimentação":x.includes("posto")||x.includes("combustivel")||x.includes("uber")?f="Transporte":x.includes("farmacia")||x.includes("drogaria")||x.includes("medico")?f="Saúde":x.includes("aluguel")||x.includes("condominio")||x.includes("luz")||x.includes("energia")||x.includes("agua")||x.includes("gás")?f="Moradia":x.includes("restaurante")||x.includes("ifood")||x.includes("padaria")||x.includes("cafe")?f="Alimentação":x.includes("netflix")||x.includes("spotify")||x.includes("cinema")||x.includes("show")||x.includes("jogos")?f="Lazer":f="Extrato PDF",a.push({date:d,description:y,amount:m,type:g,category:f})}return a}function pt(t,e=new Date,a={cdi:10.5,selic:10.75},o=!1){let n=t.amount,i=0;const s=t.manualCurrentValue!==void 0&&t.manualCurrentValue!==null&&t.manualCurrentValue!=="";if(!o&&s)n=parseFloat(t.manualCurrentValue);else if(t.type==="fixed"){const l=new Date(t.date+"T00:00:00"),p=Math.floor((e-l)/(1e3*60*60*24));if(p>0){let c=0;t.rateType==="cdi"?c=a.cdi*(t.rateValue/100):t.rateType==="selic"?c=a.selic*(t.rateValue/100):c=t.rateValue;const d=Math.pow(1+c/100,1/365)-1;n=t.amount*Math.pow(1+d,p)}}const r=n-t.amount;if(r>0&&t.type==="fixed"){const l=new Date(t.date+"T00:00:00"),p=Math.floor((e-l)/(1e3*60*60*24));let c=0;p<=180?c=.225:p<=360?c=.2:p<=720?c=.175:c=.15,i=r*c}return{gross:n,tax:i,net:n-i}}function Wt(t=[],e=[],a=v){new Date().toISOString().slice(0,7);const o=new Date().getFullYear(),n=new Date().getMonth();let i=0,s=[];t.forEach(l=>{const c=e.filter(d=>{if(d.paymentMethod!==l.id||d.type!=="expense"||!d.date)return!1;const u=new Date(d.date);return u.getFullYear()===o&&u.getMonth()===n}).reduce((d,u)=>d+u.amount,0);c>0&&(s.push({name:l.nickname,bank:l.bank,total:c}),i+=c)}),s.sort((l,p)=>p.total-l.total);let r="";if(s.length===0)r="Nenhum gasto no cartão este mês";else if(s.length===1)r=`${s[0].name}: ${a(s[0].total)}`;else{const l=s[0],p=s.length-1,c=s.slice(1).reduce((d,u)=>d+u.total,0);r=`${l.name}: ${a(l.total)} + ${p} outro(s) cartão(es) (${a(c)})`}return{total:i,details:r,cards:s}}const _t={apiKey:void 0,authDomain:void 0,projectId:void 0,storageBucket:void 0,messagingSenderId:void 0,appId:void 0,measurementId:void 0};firebase.apps.length||firebase.initializeApp(_t);const L=firebase.firestore(),N=firebase.auth(),T=L.collection("transactions"),Ie=L.collection("goals"),R=L.collection("categories"),K=L.collection("cards"),G=L.collection("fixed_transactions"),ne=L.collection("banks"),he=L.collection("investments");let M={id:null,search:"",startDate:"",endDate:"",month:""},S={id:null,startDate:"",endDate:""};const gt=document.getElementById("auth-overlay"),ft=document.getElementById("app-wrapper"),Ut=document.getElementById("btn-google-login"),Kt=document.getElementById("form-auth-email"),yt=document.getElementById("auth-message"),Jt=document.getElementById("btn-logout"),Yt=document.getElementById("user-name"),Xt=document.getElementById("user-email"),Qt=document.getElementById("user-avatar"),V=document.getElementById("transaction-modal"),Z=document.getElementById("form-transaction"),oe=document.getElementById("installments-pending-modal"),Be=document.getElementById("goal-modal"),vt=document.getElementById("form-goal"),le=document.getElementById("fixed-transaction-modal"),Re=document.getElementById("form-fixed-transaction"),de=document.getElementById("card-modal"),Pe=document.getElementById("form-card"),Oe=document.getElementById("card-payment-modal"),bt=document.getElementById("form-card-payment"),Zt=document.getElementById("close-card-payment-modal"),ea=document.getElementById("btn-cancel-card-payment");Zt.addEventListener("click",()=>Oe.classList.remove("active"));ea.addEventListener("click",()=>Oe.classList.remove("active"));const W=document.getElementById("investment-modal"),ce=document.getElementById("form-investment"),At=document.getElementById("btn-new-card"),Q=document.getElementById("banks-list"),ke=document.getElementById("bank-modal"),Ne=document.getElementById("form-bank"),Rt=document.getElementById("btn-new-bank"),He=document.getElementById("transfer-modal"),Ae=document.getElementById("form-transfer"),ht=document.getElementById("close-transfer-modal"),xt=document.getElementById("btn-cancel-transfer"),ze=document.getElementById("btn-new-transfer");ht&&ht.addEventListener("click",()=>He.classList.remove("active"));xt&&xt.addEventListener("click",()=>He.classList.remove("active"));const P=document.getElementById("payment-method"),wt=document.getElementById("fixed-payment-method"),et=document.getElementById("installments-container"),nt=document.getElementById("installments");document.getElementById("transaction-list-recent");document.getElementById("transaction-list-complete");const We=document.getElementById("goals-list"),Se=document.getElementById("transaction-list-fixed"),Me=document.getElementById("cards-list"),ot=document.getElementById("filter-search"),it=document.getElementById("filter-type"),rt=document.getElementById("filter-date-start"),st=document.getElementById("filter-date-end"),lt=document.getElementById("filter-category"),ta=document.getElementById("btn-clear-filters"),_e=document.getElementById("total-balance"),Et=document.getElementById("total-income"),It=document.getElementById("total-expense"),Ue=document.getElementById("filtered-balance"),aa=document.getElementById("filtered-income"),na=document.getElementById("filtered-expense");let w=null,I=[],J=[],O=[],B=[],F=[],$=[],ie=[],me=null,ue=null,pe=null,ge=null,fe=null,ye=null,ve=null,ee=localStorage.getItem("contaComigo_darkMode")==="true",j=null,be=null,te=null,je=null,xe=null,ae=null,D=null;const Bt=document.getElementById("mobile-menu-btn"),qe=document.querySelector(".sidebar"),re=document.getElementById("sidebar-overlay");function oa(){qe&&qe.classList.toggle("open"),re&&re.classList.toggle("active")}function Pt(){qe&&qe.classList.remove("open"),re&&re.classList.remove("active")}Bt&&Bt.addEventListener("click",oa);re&&re.addEventListener("click",Pt);document.querySelectorAll("nav a").forEach(t=>{t.addEventListener("click",()=>{window.innerWidth<=768&&Pt()})});N.onAuthStateChanged(t=>{t?(w=t,gt.classList.remove("active"),ft.style.display="flex",zt(),ra().then(()=>{ia().then(()=>{sa().then(()=>{ha().then(()=>{ma(),fa(),xa(),ua(),pa(),ga()})})}),Ta(),La()})):(w=null,ft.style.display="none",gt.classList.add("active"),I=[],J=[],O=[],B=[],F=[],$=[],ie=[],_(),me&&me(),ue&&ue(),pe&&pe(),ge&&ge(),fe&&fe(),ye&&ye(),ve&&ve())});async function ia(){const t=`migrated_banks_${w.uid}`;if(!localStorage.getItem(t))try{let e=null;const a=await ne.where("userId","==",w.uid).where("name","==","Conta Corrente Principal").get();a.empty?e=await ne.add({userId:w.uid,name:"Conta Corrente Principal",balance:0,color:"#0ea5e9",createdAt:firebase.firestore.FieldValue.serverTimestamp()}):e=a.docs[0].ref;const o=await T.where("userId","==",w.uid).get(),n=L.batch();let i=0;for(const s of o.docs)s.data().paymentMethod==="checking"&&(n.update(T.doc(s.id),{paymentMethod:e.id}),i++),i>400&&(await n.commit(),i=0);i>0&&await n.commit(),localStorage.setItem(t,"done"),console.log("Migração de Bancos concluída com sucesso!")}catch(e){console.error("Migration de bancos falhou: ",e)}}async function ra(){const t=`migrated_v2_${w.uid}`;if(!localStorage.getItem(t))try{const e=await T.where("userId","==",w.uid).get(),a=L.batch();let o=0;for(const n of e.docs){const i=n.data();let s=!1;i.isCategory?(delete i.isCategory,delete i.date,a.set(R.doc(n.id),i),s=!0):i.isCreditCard?(delete i.isCreditCard,delete i.date,a.set(K.doc(n.id),i),s=!0):i.isFixedTemplate&&(delete i.isFixedTemplate,delete i.date,a.set(G.doc(n.id),i),s=!0),s&&(a.delete(T.doc(n.id)),o++),o>400&&(await a.commit(),o=0)}o>0&&await a.commit(),localStorage.setItem(t,"done"),console.log("Banco de dados otimizado com sucesso!")}catch(e){console.error("Migration falhou: ",e)}}async function sa(){const t=`migrated_categories_v1_${w.uid}`;if(!localStorage.getItem(t))try{console.log("Iniciando migração de unificação de categorias...");const e=await R.where("userId","==",w.uid).get(),a={};e.forEach(o=>{const n=o.data(),i=(n.name||"").trim().toLowerCase();a[i]||(a[i]=[]),a[i].push({id:o.id,...n})});for(const o in a){const n=a[o];if(n.length<=1)continue;n.sort((s,r)=>{const l=s.name.trim(),p=r.name.trim(),c=at.some(u=>u.name===l),d=at.some(u=>u.name===p);return c&&!d?-1:!c&&d?1:l.length-p.length||s.id.localeCompare(r.id)});const i=n[0];console.log(`Unificando categoria: mantendo '${i.name}' (${i.id}) e removendo duplicados.`);for(let s=1;s<n.length;s++){const r=n[s];if(console.log(`Removendo duplicado '${r.name}' (${r.id})`),await R.doc(r.id).delete(),r.name!==i.name){const l=await T.where("userId","==",w.uid).where("category","==",r.name).get();if(!l.empty){let c=L.batch(),d=0;for(const u of l.docs)c.update(u.ref,{category:i.name}),d++,d>=400&&(await c.commit(),c=L.batch(),d=0);d>0&&await c.commit(),console.log(`Atualizadas ${l.size} transações de '${r.name}' para '${i.name}'`)}const p=await G.where("userId","==",w.uid).where("category","==",r.name).get();if(!p.empty){let c=L.batch(),d=0;for(const u of p.docs)c.update(u.ref,{category:i.name}),d++,d>=400&&(await c.commit(),c=L.batch(),d=0);d>0&&await c.commit(),console.log(`Atualizadas ${p.size} transações fixas de '${r.name}' para '${i.name}'`)}}}}localStorage.setItem(t,"done"),console.log("Migração de categorias concluída com sucesso!")}catch(e){console.error("Falha na migração de categorias: ",e)}}function C(t,e=!1){yt.textContent=t,yt.style.color=e?"var(--danger)":"var(--primary)"}Ut.addEventListener("click",()=>{N.signInWithPopup(new firebase.auth.GoogleAuthProvider).catch(t=>C(t.message,!0))});Kt.addEventListener("submit",async t=>{t.preventDefault();const e=document.getElementById("auth-email").value.trim(),a=document.getElementById("auth-password").value;if(!e||!a)return C("Preencha todos os campos.",!0);C("Autenticando...");try{await N.signInWithEmailAndPassword(e,a)}catch(o){if(o.code==="auth/user-not-found"||o.code==="auth/invalid-credential")try{await N.createUserWithEmailAndPassword(e,a)}catch(n){C(n.message,!0)}else C(o.message,!0)}});document.getElementById("btn-email-link").addEventListener("click",async()=>{const t=document.getElementById("auth-email").value.trim();if(!t)return C("Preencha seu e-mail para receber o link.",!0);try{await N.sendSignInLinkToEmail(t,{url:window.location.href,handleCodeInApp:!0}),window.localStorage.setItem("emailForSignIn",t),C("Link enviado! Verifique seu email.")}catch(e){C(e.message,!0)}});if(N.isSignInWithEmailLink(window.location.href)){let t=window.localStorage.getItem("emailForSignIn")||window.prompt("Confirme seu e-mail:");N.signInWithEmailLink(t,window.location.href).then(()=>window.localStorage.removeItem("emailForSignIn")).catch(e=>C(e.message,!0))}Jt.addEventListener("click",()=>N.signOut());const Nt=document.getElementById("btn-new-category"),Y=document.getElementById("category-modal"),tt=document.getElementById("form-category"),la=document.getElementById("btn-cancel-category"),da=document.getElementById("close-category-modal"),De=document.getElementById("categories-list"),kt=document.getElementById("category-icons-grid"),ca=document.querySelectorAll("#nav-menu a[data-page]");ca.forEach(t=>{t.addEventListener("click",e=>{e.preventDefault(),document.querySelectorAll("#nav-menu li").forEach(i=>i.classList.remove("active"));const a=t.parentElement;a.classList.add("active"),document.getElementById("page-title").textContent=a.dataset.title;const o=t.dataset.page,n=["page-metas","page-configuracoes","page-fixas","page-categorias","page-investimentos","page-relatorios"];document.getElementById("btn-new-transaction").style.display=n.includes(o)?"none":"flex",ze&&(ze.style.display=["page-dashboard","page-bancos","page-transacoes"].includes(o)?"flex":"none"),document.getElementById("btn-new-goal").style.display=o==="page-metas"?"flex":"none",document.getElementById("btn-new-fixed-transaction").style.display=o==="page-fixas"?"flex":"none",At.style.display=o==="page-cartoes"?"flex":"none",Nt.style.display=o==="page-categorias"?"flex":"none",Rt.style.display=o==="page-bancos"?"flex":"none",document.getElementById("btn-new-investment").style.display=o==="page-investimentos"?"flex":"none",document.querySelectorAll(".page-section").forEach(i=>i.classList.remove("active")),document.getElementById(o).classList.add("active")})});function zt(){const t=`https://ui-avatars.com/api/?name=${w.email}&background=6366f1&color=fff`,e=w.displayName||"Usuário Vazio",a=w.photoURL||t;Yt.textContent=e,Xt.textContent=w.email,Qt.src=a,document.getElementById("settings-name")&&(document.getElementById("settings-name").value=w.displayName||""),document.getElementById("settings-email")&&(document.getElementById("settings-email").value=w.email||""),document.getElementById("settings-photo")&&(document.getElementById("settings-photo").value=w.photoURL||"")}const $t={"btn-menu-personal":"modal-settings-personal","btn-menu-security":"modal-settings-security","btn-menu-devices":"modal-settings-devices","btn-menu-notifications":"modal-settings-notifications","btn-menu-report":"modal-settings-report","btn-menu-close-account":"modal-settings-close-account"};Object.keys($t).forEach(t=>{const e=document.getElementById(t);e&&e.addEventListener("click",()=>{document.getElementById($t[t]).classList.add("active")})});document.querySelectorAll('[id^="close-settings-"], [id^="btn-cancel-"]').forEach(t=>{t.addEventListener("click",e=>{const a=e.target.closest(".modal-overlay");a&&a.id.startsWith("modal-settings")&&a.classList.remove("active")})});const Ke=document.getElementById("form-settings-personal");Ke&&Ke.addEventListener("submit",async t=>{t.preventDefault();const e=Ke.querySelector('button[type="submit"]');e.disabled=!0;try{const a=document.getElementById("settings-name").value.trim(),o=document.getElementById("settings-photo").value.trim(),n=document.getElementById("settings-email").value.trim();await w.updateProfile({displayName:a,photoURL:o}),n!==w.email&&await w.updateEmail(n),zt(),document.getElementById("settings-personal-msg").innerHTML="<span style='color:var(--success)'>Perfil atualizado!</span>",setTimeout(()=>{document.getElementById("settings-personal-msg").innerHTML="",document.getElementById("modal-settings-personal").classList.remove("active")},2e3)}catch(a){document.getElementById("settings-personal-msg").innerHTML=`<span style='color:var(--danger)'>${a.message}</span>`,a.code==="auth/requires-recent-login"&&(alert("Para alterar o e-mail, por segurança, é necessário fazer login novamente. Você será desconectado."),N.signOut())}finally{e.disabled=!1}});const Fe=document.getElementById("form-settings-security");Fe&&Fe.addEventListener("submit",async t=>{t.preventDefault();const e=Fe.querySelector('button[type="submit"]');e.disabled=!0;try{const a=document.getElementById("settings-new-password").value;await w.updatePassword(a),document.getElementById("settings-security-msg").innerHTML="<span style='color:var(--success)'>Senha atualizada!</span>",setTimeout(()=>{document.getElementById("settings-security-msg").innerHTML="",document.getElementById("modal-settings-security").classList.remove("active"),Fe.reset()},2e3)}catch(a){document.getElementById("settings-security-msg").innerHTML=`<span style='color:var(--danger)'>${a.message}</span>`,a.code==="auth/requires-recent-login"&&(alert("Para alterar a senha, é necessário fazer login novamente. Você será desconectado."),N.signOut())}finally{e.disabled=!1}});const Ct=document.getElementById("form-settings-notifications");Ct&&Ct.addEventListener("submit",t=>{t.preventDefault(),alert("Preferências salvas com sucesso no seu dispositivo local."),document.getElementById("modal-settings-notifications").classList.remove("active")});const Je=document.getElementById("form-settings-report");Je&&Je.addEventListener("submit",t=>{t.preventDefault(),alert("Obrigado! Seu problema foi enviado à nossa equipe de suporte."),Je.reset(),document.getElementById("modal-settings-report").classList.remove("active")});const X=document.getElementById("btn-confirm-close-account");X&&X.addEventListener("click",async()=>{if(confirm("Certeza ABSOLUTA? Todo seu histórico será excluído do banco de dados para sempre.")){X.disabled=!0,X.textContent="Apagando...";try{const t=w.uid,e=async a=>{const o=await a.where("userId","==",t).get(),n=L.batch();o.forEach(i=>n.delete(i.ref)),o.size>0&&await n.commit()};await e(T),await e(G),await e(Ie),await e(K),await e(R),await e(he),await w.delete()}catch(t){document.getElementById("settings-close-msg").innerHTML=`<span style='color:var(--danger)'>${t.message}</span>`,t.code==="auth/requires-recent-login"&&(alert("Para excluir a conta, faça login novamente. Você será desconectado."),N.signOut()),X.disabled=!1,X.innerHTML='<i class="fa-solid fa-trash"></i> Sim, Apagar Tudo'}}});function ma(){me&&me(),me=T.where("userId","==",w.uid).orderBy("date","desc").onSnapshot(t=>{I=[],t.forEach(e=>{I.push({id:e.id,...e.data()})}),_(),$e(),Ce()})}function ua(){fe&&fe(),fe=K.where("userId","==",w.uid).onSnapshot(t=>{B=[],t.forEach(e=>B.push({id:e.id,...e.data()})),Ce(),dt(),ct(),$e()})}function pa(){ye&&ye(),ye=ne.where("userId","==",w.uid).onSnapshot(t=>{$=[],t.forEach(e=>$.push({id:e.id,...e.data()})),dt(),ct(),typeof window.populateReportBankSelect=="function"&&window.populateReportBankSelect(),_()})}function ga(){ge&&ge(),ge=G.where("userId","==",w.uid).onSnapshot(t=>{O=[],t.forEach(e=>O.push({id:e.id,...e.data()})),$e(),Ia()})}Z.addEventListener("submit",async t=>{var l;if(t.preventDefault(),window.isBulkMode){const p=document.getElementById("bulk-rows-container").querySelectorAll(".bulk-row");if(p.length===0)return alert("Adicione pelo menos uma transação!");try{const c=L.batch();let d=!1;for(const u of p){const m=u.querySelector(".bulk-row-type").value,g=u.querySelector(".bulk-row-desc").value.trim(),b=A(u.querySelector(".bulk-row-amount").value),h=u.querySelector(".bulk-row-date").value,y=u.querySelector(".bulk-row-category").value,f=u.querySelector(".bulk-row-pm").value;if(!g||isNaN(b)||b<=0||!y||!f||!h){d=!0,u.style.borderColor="var(--danger)",u.style.borderWidth="2px";continue}u.style.borderColor="var(--border)",u.style.borderWidth="1px";const x=T.doc();c.set(x,{userId:w.uid,type:m,description:g,amount:b,date:h,category:y,paymentMethod:f,createdAt:firebase.firestore.FieldValue.serverTimestamp()})}if(d){alert("Preencha todos os campos de todas as transações! As linhas com erro foram destacadas.");return}await c.commit(),V.classList.remove("active"),Z.reset(),window.resetBulkMode(),_(),D&&setTimeout(()=>window.filterCardExtract(D),200),S.id&&setTimeout(()=>window.filterBankExtract(S.id),200),typeof C=="function"&&C(`${p.length} transação(ões) salva(s) com sucesso!`)}catch(c){alert("Erro ao salvar lote: "+c.message)}return}const e=document.querySelector('input[name="type"]:checked').value,a=document.getElementById("description").value,o=A(document.getElementById("amount").value),n=((l=document.getElementById("transaction-goal"))==null?void 0:l.value)||"";if(!a||isNaN(o)||o<=0)return alert("Campos inválidos!");const i=P.value,s=B.some(p=>p.id===i),r=s&&e==="expense"?parseInt(nt.value):1;try{if(be){const p=await T.where("groupId","==",be).get(),c=L.batch();p.forEach(d=>c.delete(d.ref)),await c.commit(),be=null}if(j){const p={userId:w.uid,type:e,description:a,amount:o,date:document.getElementById("date").value,category:document.getElementById("category").value,paymentMethod:i,goalId:n};await T.doc(j).update(p)}else if(!s||r===1){const p={userId:w.uid,type:e,description:a,amount:o,date:document.getElementById("date").value,category:document.getElementById("category").value,paymentMethod:i,goalId:n,createdAt:firebase.firestore.FieldValue.serverTimestamp()};await T.add(p)}else{const p=o,c=p/r,d=new Date(document.getElementById("date").value+"T00:00:00"),u="grp_"+Date.now().toString(36)+Math.random().toString(36).substr(2,5);for(let m=1;m<=r;m++){const g=new Date(d.getTime());g.setMonth(g.getMonth()+(m-1));const b=g.toISOString().slice(0,10),h=a+` (${m}/${r})`,y={userId:w.uid,type:e,description:h,amount:c,category:document.getElementById("category").value,date:b,paymentMethod:i,goalId:n,createdAt:firebase.firestore.FieldValue.serverTimestamp(),groupId:u,installmentTotal:r,totalAmount:p};await T.add(y)}}V.classList.remove("active"),Z.reset(),se(),document.querySelector("#transaction-modal h2").textContent="Nova Transação",j=null,je=null,xe=null,_(),D&&setTimeout(()=>window.filterCardExtract(D),200),S.id&&setTimeout(()=>window.filterBankExtract(S.id),200),document.getElementById("page-transacoes").classList.contains("active")&&setTimeout(()=>U(),200)}catch(p){alert("Erro ao salvar: "+p.message)}});window.editTransaction=t=>{const e=document.getElementById("tx-modal-tabs");e&&(e.style.display="none"),window.resetBulkMode&&window.resetBulkMode();const a=I.find(o=>o.id===t);if(a){if(a.groupId&&confirm(`Esta transação faz parte de um parcelamento em multiplas vezes.

Deseja editar TODAS as faturas juntas (o que apagará os registros atuais e re-gerará os novos a partir de hoje) ou editar apenas este lançamento individual? 

[OK] para Editar Completo 
[Cancelar] para Individual`)){document.querySelector(`#type-${a.type}`).checked=!0;const o=a.description.replace(/\s\(\d+\/\d+\)$/,"");document.getElementById("description").value=o,document.getElementById("amount").value=a.totalAmount,document.getElementById("date").value=a.date,document.getElementById("category").value=a.category,Ve(),document.getElementById("transaction-goal").value=a.goalId||"",a.paymentMethod?P.value=a.paymentMethod:P.value="checking",se(),nt.value=a.installmentTotal||1,j=null,be=a.groupId,document.querySelector("#transaction-modal h2").textContent="Editar Múltiplas Parcelas",V.classList.add("active");return}document.querySelector(`#type-${a.type}`).checked=!0,document.getElementById("description").value=a.description,document.getElementById("amount").value=a.amount,document.getElementById("date").value=a.date,document.getElementById("category").value=a.category,Ve(),document.getElementById("transaction-goal").value=a.goalId||"",a.paymentMethod?P.value=a.paymentMethod:P.value="checking",se(),et.style.display="none",j=t,document.querySelector("#transaction-modal h2").textContent="Editar Transação",V.classList.add("active")}};window.deleteTransaction=async t=>{const e=I.find(a=>a.id===t);if(e){if(e.groupId&&confirm(`Esta é uma transação parcelada. Deseja excluir TODAS as parcelas associadas a esta compra?

[OK] Sim, apagar todas
[Cancelar] Não, apagar apenas essa individual`)){const a=await T.where("groupId","==",e.groupId).get(),o=L.batch();a.forEach(n=>o.delete(n.ref)),await o.commit();return}confirm("Excluir transação individualmente?")&&await T.doc(t).delete()}};function Ve(){var o;if(!document.getElementById("transaction-goal")){const n=(o=document.getElementById("category"))==null?void 0:o.closest(".form-group");if(n){const i=document.createElement("div");i.className="form-group",i.innerHTML=`
                <label for="transaction-goal">Vincular à Meta (Opcional)</label>
                <select id="transaction-goal" class="form-input">
                    <option value="">Nenhuma</option>
                </select>
            `,n.parentNode.insertBefore(i,n.nextSibling)}}const e=document.getElementById("transaction-goal");if(!e)return;let a='<option value="">Nenhuma</option>';J.forEach(n=>{const i=n.targetValue>0?(n.currentValue/n.targetValue*100).toFixed(0):0;a+=`<option value="${n.id}">${n.name} (${i}%)</option>`}),e.innerHTML=a}function fa(){ue&&ue(),ue=Ie.where("userId","==",w.uid).orderBy("createdAt","desc").onSnapshot(t=>{J=[],t.forEach(e=>J.push({id:e.id,...e.data()})),qt(),Ve()},t=>console.error("Goal snapshot error:",t.message))}vt.addEventListener("submit",async t=>{t.preventDefault();try{await Ie.add({userId:w.uid,name:document.getElementById("goal-name").value,targetValue:A(document.getElementById("goal-target").value),currentValue:A(document.getElementById("goal-current").value),createdAt:firebase.firestore.FieldValue.serverTimestamp()}),Be.classList.remove("active"),vt.reset()}catch(e){alert("Erro: "+e.message)}});window.addFundsToGoal=(t,e,a)=>{const o=document.getElementById("goal-contribution-modal"),n=document.getElementById("form-goal-contribution");document.getElementById("contribution-goal-id").value=t,document.getElementById("contribution-goal-current").value=e,document.getElementById("contribution-goal-max").value=a,n.reset(),document.getElementById("goal-contribution-amount").value="",document.getElementById("contribution-source-select").value="",document.getElementById("contribution-category").value="Investimentos",document.querySelector('input[name="contribution-source"][value="source"]').checked=!0,document.getElementById("contribution-source-select-container").style.display="block",document.getElementById("contribution-category-container").style.display="block",ya(),o.classList.add("active")};function ya(){const t=document.getElementById("contribution-source-select");if(!t)return;let e='<option value="" disabled selected>Selecione uma conta ou cartão...</option>';$.length>0&&$.forEach(a=>{const o=a.balance||0;e+=`<option value="bank_${a.id}" data-type="bank">🏦 ${a.name} (Saldo: ${v(o)})</option>`}),B.length>0&&B.forEach(a=>{const o=I.filter(i=>i.paymentMethod===a.id).reduce((i,s)=>i+(s.type==="expense"?s.amount:-s.amount),0),n=a.limit-o;e+=`<option value="card_${a.id}" data-type="card">💳 ${a.nickname} (${a.bank}) - Disponível: ${v(n)}</option>`}),$.length===0&&B.length===0&&(e='<option value="" disabled selected>Nenhuma conta ou cartão cadastrado</option>'),t.innerHTML=e}document.querySelectorAll('input[name="contribution-source"]').forEach(t=>{t.addEventListener("change",function(){const e=document.getElementById("contribution-source-select-container"),a=document.getElementById("contribution-category-container");this.value==="none"?(e.style.display="none",a.style.display="none"):(e.style.display="block",a.style.display="block")})});document.getElementById("form-goal-contribution").addEventListener("submit",async function(t){t.preventDefault();const e=document.getElementById("contribution-goal-id").value,a=parseFloat(document.getElementById("contribution-goal-current").value),o=parseFloat(document.getElementById("contribution-goal-max").value),n=A(document.getElementById("goal-contribution-amount").value),i=document.querySelector('input[name="contribution-source"]:checked').value,s=document.getElementById("contribution-source-select").value,r=document.getElementById("contribution-category").value;if(!n||n<=0){alert("Por favor, insira um valor válido.");return}if(i!=="none"&&!s){alert("Por favor, selecione a conta ou cartão de origem.");return}try{const l=Math.min(a+n,o);if(await Ie.doc(e).update({currentValue:l}),i!=="none"){const p=s.split("_"),c=p[0],d=p[1];let u="";if(c==="bank"){const h=$.find(y=>y.id===d);u=h?h.name:"Conta"}else if(c==="card"){const h=B.find(y=>y.id===d);u=h?h.nickname:"Cartão"}const m=J.find(h=>h.id===e),g=m?m.name:"Meta",b={userId:w.uid,type:"expense",description:`Aporte para Meta: ${g} (${u})`,amount:n,category:r||"Investimentos",date:new Date().toISOString().slice(0,10),paymentMethod:d,createdAt:firebase.firestore.FieldValue.serverTimestamp(),goalId:e};await T.add(b),typeof C=="function"&&C(`Aporte de ${v(n)} adicionado com sucesso!`)}document.getElementById("goal-contribution-modal").classList.remove("active"),qt(),_()}catch(l){alert("Erro ao adicionar aporte: "+l.message)}});document.getElementById("close-goal-contribution-modal").addEventListener("click",()=>{document.getElementById("goal-contribution-modal").classList.remove("active")});document.getElementById("btn-cancel-contribution").addEventListener("click",()=>{document.getElementById("goal-contribution-modal").classList.remove("active")});document.getElementById("goal-contribution-modal").addEventListener("click",t=>{t.target===t.currentTarget&&document.getElementById("goal-contribution-modal").classList.remove("active")});window.deleteGoal=async t=>{confirm("A meta será excluída. Continuar?")&&await Ie.doc(t).delete()};function qt(){if(We.innerHTML="",J.length===0){We.innerHTML='<div class="empty-state w-100" style="grid-column: 1/-1;"><i class="fa-solid fa-piggy-bank"></i><p>Nenhuma meta ativa.</p></div>';return}J.forEach(t=>{const e=Math.min(t.currentValue/t.targetValue*100,100).toFixed(1),a=e>=100,o=t.targetValue-t.currentValue,n=o>0?v(o):"R$ 0,00";We.innerHTML+=`
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
                    ${o>0?`<p style="margin-top: 4px;">Falta: <strong>${n}</strong></p>`:'<p style="color: var(--success); margin-top: 4px;">✅ Meta alcançada!</p>'}
                </div>
                <div class="goal-actions" style="display:flex; gap:8px;">
                    <button class="btn-icon" onclick="window.addFundsToGoal('${t.id}', ${t.currentValue}, ${t.targetValue})" title="Adicionar fundo"><i class="fa-solid fa-hand-holding-dollar" style="color:var(--success)"></i></button>
                    <button class="btn-icon" onclick="window.deleteGoal('${t.id}')" title="Excluir Meta"><i class="fa-solid fa-trash"></i></button>
                </div>
            </div>
        </div>
    `})}const at=[{name:"Salário",icon:"fa-sack-dollar"},{name:"Alimentação",icon:"fa-utensils"},{name:"Moradia",icon:"fa-house"},{name:"Transporte",icon:"fa-car"},{name:"Lazer",icon:"fa-gamepad"},{name:"Saúde",icon:"fa-heart-pulse"},{name:"Investimentos",icon:"fa-chart-line"},{name:"Cartão",icon:"fa-credit-card"},{name:"Outros",icon:"fa-tag"}],va=["fa-tag","fa-utensils","fa-house","fa-car","fa-gamepad","fa-heart-pulse","fa-chart-line","fa-sack-dollar","fa-bag-shopping","fa-basket-shopping","fa-plane","fa-bolt","fa-mobile","fa-graduation-cap","fa-dog","fa-shirt","fa-music","fa-gift","fa-scissors","fa-wrench","fa-book","fa-cart-shopping"];let Ye=!1;async function ba(){if(!Ye){Ye=!0;try{console.log("Verificando categorias padrão...");const t=await R.where("userId","==",w.uid).get(),e=new Set;t.forEach(n=>{var s;const i=(s=n.data().name)==null?void 0:s.trim().toLowerCase();i&&e.add(i)}),console.log(`Categorias existentes: ${e.size}`);const a=at.filter(n=>!e.has(n.name.trim().toLowerCase()));if(a.length===0){console.log("Todas as categorias padrão já existem.");return}console.log(`Adicionando ${a.length} novas categorias...`);const o=L.batch();a.forEach(n=>{const i=R.doc();o.set(i,{userId:w.uid,name:n.name.trim(),icon:n.icon})}),await o.commit(),console.log(`${a.length} categorias adicionadas com sucesso!`)}catch(t){console.error("Erro ao semear categorias:",t)}finally{Ye=!1}}}async function ha(){try{console.log("Limpando categorias duplicadas...");const t=await R.where("userId","==",w.uid).get(),e=new Map,a=[];if(t.forEach(n=>{var l;const i=n.data(),s=(l=i.name)==null?void 0:l.trim();if(!s){a.push(n.id);return}const r=s.toLowerCase();e.has(r)?a.push(n.id):e.set(r,{id:n.id,name:s,data:i})}),a.length===0){console.log("Nenhuma categoria duplicada encontrada.");return}console.log(`Encontradas ${a.length} categorias duplicadas. Removendo...`);const o=L.batch();a.forEach(n=>{o.delete(R.doc(n))}),await o.commit(),console.log(`${a.length} categorias duplicadas removidas.`)}catch(t){console.error("Erro ao limpar duplicatas:",t)}}function xa(){pe&&pe();let t=!1;pe=R.where("userId","==",w.uid).onSnapshot(async e=>{if(!t){t=!0;try{if(e.empty){F.length===0&&(console.log("Nenhuma categoria encontrada, iniciando seed..."),await ba()),t=!1;return}const a=[];e.forEach(o=>{const n=o.data();a.some(s=>s.name===n.name)||a.push({id:o.id,...n})}),F=a.sort((o,n)=>o.name.localeCompare(n.name)),Vt(),wa()}catch(a){console.error("Erro ao processar categorias:",a)}finally{t=!1}}})}function wa(){const t=F.map(e=>`<option value="${e.name}">${e.name}</option>`).join("");document.getElementById("category").innerHTML='<option value="" disabled selected>Selecione</option>'+t,document.getElementById("fixed-category").innerHTML='<option value="" disabled selected>Selecione</option>'+t,document.getElementById("filter-category").innerHTML='<option value="all">Todas Categ.</option>'+t}function Ea(){kt&&(kt.innerHTML=va.map(t=>`
        <div class="icon-option" onclick="window.selectCategoryIcon('${t}', this)" style="display:flex; justify-content:center; align-items:center; width: 40px; height: 40px; border-radius: 8px; border: 1px solid var(--border); cursor: pointer; transition: 0.2s;">
            <i class="fa-solid ${t}"></i>
        </div>
    `).join(""))}window.selectCategoryIcon=(t,e)=>{document.getElementById("category-icon").value=t,document.querySelectorAll(".icon-option").forEach(a=>{a.style.borderColor="var(--border)",a.style.borderWidth="1px"}),e.style.borderColor="#8b5cf6",e.style.borderWidth="2px"};function Vt(){if(De){if(De.innerHTML="",F.length===0){De.innerHTML=`
            <div class="empty-state w-100" style="grid-column: 1/-1;">
                <i class="fa-solid fa-tags"></i>
                <p>Nenhuma categoria cadastrada.</p>
                <p style="font-size: 0.85rem; margin-top: 8px;">Clique em "Nova Categoria" para criar sua primeira categoria.</p>
            </div>
        `;return}F.forEach(t=>{De.innerHTML+=`
            <div class="category-ui category-list-item" style="background:var(--bg-secondary); border: 1px solid var(--border); padding: 8px; border-radius: 12px; display:flex; align-items:center; justify-content:space-between; transition: 0.2s; overflow: hidden;">
                <div style="display:flex; align-items:center; gap: 12px; min-width: 0; flex: 1;">
                    <div style="width: 20px; height: 20px; border-radius: 50%; background:var(--bg-main); color:var(--text-main); display:flex; align-items:center; justify-content:center; font-size: 0.8rem; border: 1px solid var(--border); flex-shrink: 0;">
                        <i class="fa-solid ${t.icon||"fa-tag"}"></i>
                    </div>
                    <span style="font-weight: 600; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; flex: 1;">${t.name}</span>
                </div>
                <div style="display:flex; gap: 8px; flex-shrink: 0;">
                    <button class="btn-icon" onclick="window.editCategory('${t.id}')" title="Editar Categoria">
                        <i class="fa-solid fa-pen" style="color:var(--text-muted)"></i>
                    </button>
                    <button class="btn-icon" onclick="window.deleteCategory('${t.id}')" title="Excluir Categoria">
                        <i class="fa-solid fa-trash" style="color:var(--danger)"></i>
                    </button>
                </div>
            </div>
        `})}}window.editCategory=t=>{const e=F.find(a=>a.id===t);e&&(document.getElementById("category-id").value=e.id,document.getElementById("category-name").value=e.name,document.getElementById("category-icon").value=e.icon||"fa-tag",document.getElementById("category-modal-title").textContent="Editar Categoria",document.getElementById("category-submit-text").textContent="Atualizar Categoria",document.querySelectorAll(".icon-option").forEach(a=>{const o=a.querySelector("i");o&&o.classList.contains(e.icon)?(a.style.borderColor="#8b5cf6",a.style.borderWidth="2px"):(a.style.borderColor="var(--border)",a.style.borderWidth="1px")}),Y.classList.add("active"))};function Ge(){document.getElementById("category-id").value="",document.getElementById("category-name").value="",document.getElementById("category-icon").value="",document.getElementById("category-modal-title").textContent="Nova Categoria",document.getElementById("category-submit-text").textContent="Salvar Categoria",document.querySelectorAll(".icon-option").forEach(t=>{t.style.borderColor="var(--border)",t.style.borderWidth="1px"})}window.deleteCategory=async t=>{const e=F.find(s=>s.id===t);if(!e)return;const a=I.filter(s=>s.category===e.name),o=O.filter(s=>s.category===e.name),n=a.length+o.length;let i=`Excluir a categoria "${e.name}"?`;if(n>0&&(i+=`

⚠️ Esta categoria está sendo usada em ${n} transação(ões).
As transações existentes NÃO serão alteradas e ficarão com o nome "${e.name}" como categoria.`),i+=`

Deseja continuar?`,!!confirm(i))try{await R.doc(t).delete(),typeof C=="function"&&C(`Categoria "${e.name}" excluída com sucesso!`)}catch(s){alert("Erro ao excluir categoria: "+s.message)}};tt.addEventListener("submit",async t=>{t.preventDefault();const e=document.getElementById("category-id").value,a=document.getElementById("category-name").value,o=document.getElementById("category-icon").value||"fa-tag",n=a.trim();if(!n)return alert("Por favor, digite um nome válido para a categoria.");const i=n.toLowerCase();if(F.some(r=>r.name.trim().toLowerCase()===i&&r.id!==e)){alert("Já existe uma categoria com este nome.");return}try{e?await R.doc(e).update({name:n,icon:o}):await R.add({userId:w.uid,name:n,icon:o}),Y.classList.remove("active"),tt.reset(),Ge(),typeof C=="function"&&C(e?"Categoria atualizada com sucesso!":"Categoria criada com sucesso!")}catch(r){alert("Erro ao salvar categoria: "+r.message)}});Nt.addEventListener("click",()=>{Ge(),tt.reset(),document.getElementById("category-icon").value="",document.querySelectorAll(".icon-option").forEach(t=>{t.style.borderColor="var(--border)",t.style.borderWidth="1px"}),Y.classList.add("active")});la.addEventListener("click",()=>{Y.classList.remove("active"),Ge()});da.addEventListener("click",()=>{Y.classList.remove("active"),Ge()});function Ia(){const t=new Date().toISOString().slice(0,7),e=new Date().getDate();O.forEach(async a=>{if(a.isAutomatic&&e>=a.dayOfMonth&&a.lastProcessedMonth!==t){a.lastProcessedMonth=t;try{await T.add({userId:w.uid,type:a.type,description:a.description+" (Automática)",amount:a.amount,date:new Date().toISOString().slice(0,10),category:a.category,paymentMethod:a.paymentMethod||"",fixedTransactionId:a.id,createdAt:firebase.firestore.FieldValue.serverTimestamp()}),await G.doc(a.id).update({lastProcessedMonth:t})}catch(o){console.error("Erro processamento automático:",o)}}})}Re.addEventListener("submit",async t=>{t.preventDefault();const e=document.querySelector('input[name="fixed-type"]:checked').value,a=document.getElementById("fixed-description").value,o=A(document.getElementById("fixed-amount").value),n=document.getElementById("fixed-category").value,i=document.getElementById("fixed-is-automatic").checked;let s=parseInt(document.getElementById("fixed-day").value);if((isNaN(s)||s<1||s>31)&&(s=new Date().getDate()),!a||isNaN(o)||o<=0)return alert("Campos inválidos!");const r={userId:w.uid,type:e,description:a,amount:o,category:n,isAutomatic:i,dayOfMonth:s};try{te?await G.doc(te).update(r):await G.add(r),le.classList.remove("active"),Re.reset(),document.querySelector("#fixed-transaction-modal h2").textContent="Nova Transação Fixa",te=null}catch(l){alert("Erro ao salvar: "+l.message)}});window.editFixedTransaction=t=>{const e=O.find(a=>a.id===t);e&&(document.querySelector(`#fixed-type-${e.type}`).checked=!0,document.getElementById("fixed-description").value=e.description,document.getElementById("fixed-amount").value=e.amount,document.getElementById("fixed-category").value=e.category,document.getElementById("fixed-is-automatic").checked=e.isAutomatic,document.getElementById("fixed-day").value=e.dayOfMonth||1,te=t,document.querySelector("#fixed-transaction-modal h2").textContent="Editar Transação Fixa",le.classList.add("active"))};window.deleteFixedTransaction=async t=>{confirm("Deseja excluir esta transação recorrente? Isso não alterará o histórico passado.")&&await G.doc(t).delete()};window.launchManualFixedTransaction=async t=>{const e=O.find(a=>a.id===t);e&&(j=null,je=e.id,document.querySelector("#transaction-modal h2").textContent="Lançar Transação Fixa",Z.reset(),document.querySelector(`#type-${e.type}`).checked=!0,document.getElementById("description").value=e.description,document.getElementById("amount").value=e.amount,document.getElementById("date").value=new Date().toISOString().slice(0,10),document.getElementById("category").value=e.category,P&&(P.value=e.paymentMethod||""),V.classList.add("active"))};window.launchCardFatura=async(t,e)=>{const a=B.find(s=>s.id===t);if(!a)return;xe=a.id;const o=parseFloat(e)===0;document.getElementById("card-payment-title").textContent=o?`Adiantar Pagamento: ${a.nickname}`:`Pagar Fatura: ${a.nickname}`;const n=document.getElementById("card-payment-total-container");n&&(n.style.display=o?"none":"block"),document.getElementById("card-payment-total-display").textContent=v(parseFloat(e));let i=parseFloat(e)>0?parseFloat(e).toFixed(2):"";document.getElementById("card-payment-amount").value=i?i.replace(".",","):"",document.getElementById("card-payment-interest").value="",document.getElementById("card-payment-date").value=new Date().toISOString().slice(0,10),Oe.classList.add("active")};bt.addEventListener("submit",async t=>{t.preventDefault();const e=document.getElementById("card-payment-amount").value,a=document.getElementById("card-payment-interest").value,o=document.getElementById("card-payment-date").value,n=A(e),i=A(a),s=document.getElementById("card-payment-source-bank").value;if(isNaN(n)||n<=0){alert("Por favor, insira um valor válido para o pagamento.");return}if(!s){alert("Por favor, selecione uma conta de origem.");return}if(!o){alert("Por favor, selecione a data do pagamento.");return}const r=B.find(l=>l.id===xe);if(!r){alert("Cartão não encontrado. Tente novamente.");return}try{const l=$.find(g=>g.id===s);if(l){const g=I.filter(f=>f.paymentMethod===s),b=g.filter(f=>f.type==="income").reduce((f,x)=>f+x.amount,0),h=g.filter(f=>f.type==="expense").reduce((f,x)=>f+x.amount,0),y=(l.balance||0)+b-h;if(y<n+i&&!confirm(`Saldo insuficiente na conta "${l.name}".
Saldo atual: ${v(y)}
Valor do pagamento: ${v(n+i)}

Deseja continuar mesmo assim?`))return}const p=L.batch(),c=o,d=T.doc();p.set(d,{userId:w.uid,type:"expense",description:`Pagamento Fatura: ${r.nickname}`,amount:n+i,category:"Cartão",date:c,paymentMethod:s,createdAt:firebase.firestore.FieldValue.serverTimestamp()});const u=T.doc();p.set(u,{userId:w.uid,type:"income",description:`Pagamento Recebido - ${r.nickname}`,amount:n,category:"Cartão",date:c,paymentMethod:r.id,createdAt:firebase.firestore.FieldValue.serverTimestamp()});const m=new Date().toISOString().slice(0,7);p.update(K.doc(r.id),{lastProcessedMonth:m}),await p.commit(),Oe.classList.remove("active"),bt.reset(),xe=null,typeof C=="function"?C(`Pagamento de ${v(n+i)} para ${r.nickname} efetuado com sucesso!`):alert(`Pagamento de ${v(n+i)} para ${r.nickname} efetuado com sucesso!`),_(),D&&setTimeout(()=>window.filterCardExtract(D),200),S.id&&setTimeout(()=>window.filterBankExtract(S.id),200),$e()}catch(l){console.error("Erro ao pagar fatura:",l),typeof C=="function"?C("Erro ao pagar fatura: "+l.message,!0):alert("Erro ao pagar fatura: "+l.message)}});function $e(){if(Se.innerHTML="",O.length===0&&B.length===0){Se.innerHTML='<div class="empty-state"><i class="fa-solid fa-repeat"></i><p>Nenhuma transação fixa cadastrada.</p></div>';return}const t=new Date().toISOString().slice(0,7);O.forEach(e=>{const a=e.type==="income",o=a?"+":"-",n=e.isAutomatic?`Todo dia ${e.dayOfMonth} (Auto)`:`Lançamento Manual (Venc. Dia ${e.dayOfMonth})`,i=e.lastProcessedMonth===t;let s="";i&&(s='<span style="font-size: 0.65rem; background: var(--success-bg); color: var(--success); padding: 4px 8px; border-radius: 12px; font-weight: 700; margin-left: 12px;"><i class="fa-solid fa-check"></i> Lançado este mês</span>');let r=i?"":`<button class="btn-icon" onclick="window.launchManualFixedTransaction('${e.id}')" title="Lançar agora"><i class="fa-solid fa-play" style="color:var(--success)"></i></button>`;Se.innerHTML+=`
            <div class="transaction-item">
                <div class="tx-left" style="flex: 1;">
                    <div class="tx-icon ${a?"income":"expense"}"><i class="fa-solid ${a?"fa-arrow-up":"fa-arrow-down"}"></i></div>
                    <div class="tx-details">
                        <p class="tx-title" style="display:flex; align-items:center;">${e.description} ${s}</p>
                        <p class="tx-category"><i class="fa-solid ${Ft(e.category,F)}"></i> ${e.category} | ${n}</p>
                    </div>
                </div>
                <div class="tx-right">
                    <p class="tx-amount ${a?"positive":"negative"}">${o} ${v(e.amount)}</p>
                </div>
                <div class="tx-actions" style="display:flex; gap: 8px;">
                    ${r}
                    <button class="btn-icon" onclick="window.editFixedTransaction('${e.id}')" title="Editar"><i class="fa-solid fa-pen"></i></button>
                    <button class="btn-icon" onclick="window.deleteFixedTransaction('${e.id}')" title="Excluir"><i class="fa-solid fa-trash"></i></button>
                </div>
            </div>`}),B.forEach(e=>{const a=I.filter(r=>r.paymentMethod===e.id&&r.date&&r.date.startsWith(t)).reduce((r,l)=>r+(l.type==="expense"?l.amount:-l.amount),0),o=`Pagamento de Fatura (Venc. Dia ${e.dueDay})`,n=e.lastProcessedMonth===t;let i="";n&&(i='<span style="font-size: 0.65rem; background: var(--success-bg); color: var(--success); padding: 4px 8px; border-radius: 12px; font-weight: 700; margin-left: 12px;"><i class="fa-solid fa-check"></i> Pago este mês</span>');let s=n?"":`<button class="btn-icon" onclick="window.launchCardFatura('${e.id}', ${a})" title="Pagar Fatura Agora"><i class="fa-solid fa-play" style="color:var(--success)"></i></button>`;Se.innerHTML+=`
            <div class="transaction-item" style="border-left: 4px solid var(--primary);">
                <div class="tx-left" style="flex: 1;">
                    <div class="tx-icon expense"><i class="fa-solid fa-credit-card"></i></div>
                    <div class="tx-details">
                        <p class="tx-title" style="display:flex; align-items:center;">Fatura: ${e.nickname} ${i}</p>
                        <p class="tx-category"><i class="fa-solid fa-credit-card"></i> Cartão de Crédito | ${o}</p>
                    </div>
                </div>
                <div class="tx-right">
                    <p class="tx-amount negative">- ${v(Math.max(a,0))}</p>
                </div>
                <div class="tx-actions" style="display:flex; gap: 8px;">
                    ${s}
                </div>
            </div>`})}Pe.addEventListener("submit",async t=>{t.preventDefault();const e=document.getElementById("card-nickname").value,a=document.getElementById("card-bank").value,o=A(document.getElementById("card-limit").value),n=parseInt(document.getElementById("card-closing").value),i=parseInt(document.getElementById("card-due").value);if(!e||!a||isNaN(o)||o<=0||isNaN(n)||n<1||isNaN(i)||i<1)return alert("Campos inválidos!");const s={userId:w.uid,nickname:e,bank:a,limit:o,closingDay:n,dueDay:i};try{ae?await K.doc(ae).update(s):await K.add(s),de.classList.remove("active"),Pe.reset(),document.querySelector("#card-modal h2").textContent="Novo Cartão de Crédito",ae=null}catch(r){alert("Erro ao salvar: "+r.message)}});window.editCard=t=>{const e=B.find(a=>a.id===t);e&&(document.getElementById("card-nickname").value=e.nickname,document.getElementById("card-bank").value=e.bank,document.getElementById("card-limit").value=e.limit,document.getElementById("card-closing").value=e.closingDay,document.getElementById("card-due").value=e.dueDay,ae=t,document.querySelector("#card-modal h2").textContent="Editar Cartão",de.classList.add("active"))};window.deleteCard=async t=>{confirm("Excluir este cartão permanentemente?")&&await K.doc(t).delete()};function Ce(){if(ct(),Me.innerHTML="",B.length===0){Me.innerHTML='<div class="empty-state w-100" style="grid-column: 1/-1;"><i class="fa-solid fa-credit-card"></i><p>Nenhum cartão cadastrado.</p></div>';return}const t={Nubank:"bank-nubank","Banco Inter":"bank-inter",Itaú:"bank-itaú",Bradesco:"bank-bradesco",Santander:"bank-santander","C6 Bank":"bank-c6","Banco do Brasil":"bank-bb","XP Investimentos":"bank-xp","Caixa Econômica":"bank-caixa",Outro:"bank-default"};B.forEach(a=>{const o=t[a.bank]||"bank-default",n=I.filter(r=>r.paymentMethod===a.id).reduce((r,l)=>r+(l.type==="expense"?l.amount:-l.amount),0),i=a.limit-n,s=i<0?"#ff6b6b":"inherit";Me.innerHTML+=`
            <div class="credit-card-ui ${o}" onclick="window.toggleCardExtract('${a.id}', event)" style="cursor: pointer;">
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
        `});const e=B.find(a=>a.id===D);if(e){const a=M.id===e.id?M.month:window.getInvoiceMonth(new Date().toISOString().slice(0,10),e.closingDay);Me.innerHTML+=`
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
                    value="${M.id===e.id?M.search:""}">
                
                <input type="date" id="cc-filter-start" onchange="window.filterCardExtract('${e.id}')" 
                    class="filter-input date" title="Data Inicial" 
                    value="${M.id===e.id?M.startDate:""}">
                
                <input type="date" id="cc-filter-end" onchange="window.filterCardExtract('${e.id}')" 
                    class="filter-input date" title="Data Final" 
                    value="${M.id===e.id?M.endDate:""}">
                
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
        </div>`}D&&setTimeout(()=>window.filterCardExtract(D),50)}window.toggleCardExtract=(t,e)=>{e&&e.target.closest("button")||(D=D===t?null:t,Ce())};window.closeCardExtract=()=>{D=null,Ce()};window.getInvoiceMonth=(t,e)=>{if(!t)return"";const a=new Date(t+"T00:00:00");let o=a.getFullYear(),n=a.getMonth()+1;return a.getDate()>=e&&(n++,n>12&&(n=1,o++)),`${o}-${n.toString().padStart(2,"0")}`};window.filterCardExtract=t=>{var y,f,x,k;const e=document.getElementById("inline-card-transactions");if(!e)return;const a=B.find(E=>E.id===t);if(!a)return;M.id=t,M.search=((y=document.getElementById("cc-filter-search"))==null?void 0:y.value)||"",M.startDate=((f=document.getElementById("cc-filter-start"))==null?void 0:f.value)||"",M.endDate=((x=document.getElementById("cc-filter-end"))==null?void 0:x.value)||"",M.month=((k=document.getElementById("cc-filter-month"))==null?void 0:k.value)||"";const o=M.search.toLowerCase(),n=M.startDate,i=M.endDate,s=M.month;let r=I.filter(E=>E.paymentMethod===t);o&&(r=r.filter(E=>E.description.toLowerCase().includes(o)||E.category.toLowerCase().includes(o))),n&&(r=r.filter(E=>E.date>=n)),i&&(r=r.filter(E=>E.date<=i)),s&&(r=r.filter(E=>window.getInvoiceMonth(E.date,a.closingDay)===s));const l=r.filter(E=>E.type==="expense").reduce((E,q)=>E+q.amount,0),p=r.filter(E=>E.type==="income").reduce((E,q)=>E+q.amount,0),c=l-p;let d=0,u=0;I.filter(E=>E.paymentMethod===t).forEach(E=>{if(E.type==="income")u+=E.amount;else{const q=window.getInvoiceMonth(E.date,a.closingDay);s?q<=s&&(d+=E.amount):d+=E.amount}});const m=d-u,b=s&&m<=0&&d>0?'<span style="background: var(--success); color: white; padding: 4px 8px; border-radius: 4px; font-size: 0.8rem; margin-left: 12px;"><i class="fa-solid fa-check-double"></i> Fatura Paga</span>':s&&d>0?'<span style="background: var(--warning); color: white; padding: 4px 8px; border-radius: 4px; font-size: 0.8rem; margin-left: 12px;"><i class="fa-solid fa-clock"></i> Em Aberto</span>':"";if(Le(r,"inline-card-transactions"),r.length>0||d>0){const E=s?`Resumo da Fatura (${s})${b}`:"Resumo Filtrado:",q=s?`Mês: ${Ee(s)}`:"Sem filtro de mês";let Te=`
            <div style="padding: 16px; margin-bottom: 12px; background: var(--bg-body); border-radius: 8px; border: 1px solid var(--border);">
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px;">
                    <span style="font-weight: 600; font-size: 1.1rem;">${E}</span>
                    <span style="font-size: 0.8rem; color: var(--text-muted);">${q}</span>
                </div>
                <div style="display: flex; justify-content: space-between; align-items: center; font-size: 0.9rem; color: var(--text-muted); margin-bottom: 4px;">
                    <span>Movimentação do período:</span>
                    <span style="color: ${c>0?"var(--danger)":"var(--success)"};">${v(Math.abs(c))}</span>
                </div>
                ${s?`
                <div style="display: flex; justify-content: space-between; align-items: center; font-size: 1.1rem; font-weight: 700; margin-top: 8px; padding-top: 8px; border-top: 1px dashed var(--border);">
                    <span>Restante a Pagar (Acumulado):</span>
                    <span style="color: ${m>0?"var(--danger)":"var(--success)"};">${v(Math.max(0,m))}</span>
                </div>
                `:""}
            </div>
        `;e.insertAdjacentHTML("afterbegin",Te)}const h=document.getElementById(`btn-pay-invoice-${t}`);h&&(s&&m>0?(h.style.display="flex",h.onclick=()=>window.launchCardFatura(t,m)):h.style.display="none")};window.generateCardReport=t=>{var g;const e=B.find(b=>b.id===t);if(!e)return;const a=(g=document.getElementById("cc-filter-month"))==null?void 0:g.value;if(!a){alert("Por favor, selecione um mês de fatura.");return}let o=I.filter(b=>b.paymentMethod===t);o=o.filter(b=>window.getInvoiceMonth(b.date,e.closingDay)===a),o.sort((b,h)=>new Date(b.date)-new Date(h.date));let n=0,i=0;I.filter(b=>b.paymentMethod===t).forEach(b=>{b.type==="income"?i+=b.amount:window.getInvoiceMonth(b.date,e.closingDay)<=a&&(n+=b.amount)});const s=n-i,r=s<=0&&n>0,l=r?"Fatura Paga":"Em Aberto",[p,c]=a.split("-"),d=`Fatura: ${c}/${p}`,u=window.open("","_blank");let m=`
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
                <h3>${d}</h3>
                <p>Período base: ${e.closingDay}/${parseInt(c)-1||12} a ${e.closingDay-1}/${c}</p>
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
    `;o.length===0?m+='<tr><td colspan="4" style="text-align: center; color: #94a3b8;">Nenhuma transação nesta fatura.</td></tr>':o.forEach(b=>{const h=b.type==="income",y=new Intl.NumberFormat("pt-BR",{style:"currency",currency:"BRL"}).format(b.amount);m+=`
                <tr>
                    <td>${z(b.date)}</td>
                    <td>${b.description}</td>
                    <td>${b.category}</td>
                    <td class="amount ${h?"income":"expense"}">${h?"+":"-"} ${y}</td>
                </tr>
            `}),m+=`
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
    `,u.document.write(m),u.document.close()};Rt.addEventListener("click",()=>{document.querySelector("#bank-modal h2").textContent="Nova Conta Bancária",Ne.reset(),document.getElementById("bank-id").value="",ke.classList.add("active")});Ne.addEventListener("submit",async t=>{t.preventDefault();const e=document.getElementById("bank-id").value,a=document.getElementById("bank-name").value,o=A(document.getElementById("bank-balance").value)||0,n=document.getElementById("bank-color").value||"#0ea5e9";if(!a)return alert("Campos inválidos!");try{const i={userId:w.uid,name:a,balance:o,color:n};e?await ne.doc(e).update(i):await ne.add(i),ke.classList.remove("active"),Ne.reset()}catch(i){alert("Erro ao salvar: "+i.message)}});window.editBank=t=>{const e=$.find(a=>a.id===t);e&&(document.querySelector("#bank-modal h2").textContent="Editar Conta Bancária",document.getElementById("bank-id").value=e.id,document.getElementById("bank-name").value=e.name,document.getElementById("bank-balance").value=e.balance||0,document.getElementById("bank-color").value=e.color||"#0ea5e9",ke.classList.add("active"))};window.deleteBank=async t=>{confirm(`Atenção: Excluir este banco apagará o registro dele na sua lista.
Para manter suas transações intactas, crie um novo banco antes, caso planeje mudar algo. Confirmar exclusão?`)&&await ne.doc(t).delete()};window.filterBankExtract=t=>{var g,b;const e=document.getElementById("inline-bank-transactions");if(!e)return;S.id=t,S.startDate=((g=document.getElementById("bank-filter-start"))==null?void 0:g.value)||"",S.endDate=((b=document.getElementById("bank-filter-end"))==null?void 0:b.value)||"";const a=S.startDate,o=S.endDate,n=$.find(h=>h.id===t);if(!n)return;let i=I.filter(h=>h.paymentMethod===t);const s=[...i].sort((h,y)=>h.date.localeCompare(y.date));let r=n.balance||0,l=0,p=0;o?s.forEach(h=>{h.date<=o&&(h.type==="income"?(r+=h.amount,l+=h.amount):(r-=h.amount,p+=h.amount))}):s.forEach(h=>{h.type==="income"?(r+=h.amount,l+=h.amount):(r-=h.amount,p+=h.amount)});let c=i;a&&(c=c.filter(h=>h.date>=a)),o&&(c=c.filter(h=>h.date<=o)),c.sort((h,y)=>h.date.localeCompare(y.date)),Le(c,"inline-bank-transactions");const d=a&&o?`${z(a)} a ${z(o)}`:"Todo o período",u=r>=0?"var(--success)":"var(--danger)",m=`
        <div class="bank-extract-summary">
            <div class="summary-item">
                <span class="label">📅 Período</span>
                <span class="value period">${d}</span>
            </div>
            <div class="summary-item">
                <span class="label">💰 Saldo Inicial</span>
                <span class="value initial">${v(n.balance||0)}</span>
            </div>
            <div class="summary-item">
                <span class="label">📈 Receitas</span>
                <span class="value positive">+ ${v(l)}</span>
            </div>
            <div class="summary-item">
                <span class="label">📉 Despesas</span>
                <span class="value negative">- ${v(p)}</span>
            </div>
            <div class="summary-item highlight">
                <span class="label">🏦 Saldo Final</span>
                <span class="value final" style="color: ${u};">${v(r)}</span>
            </div>
        </div>
    `;e.insertAdjacentHTML("afterbegin",m)};function dt(){if(Q){if(Q.innerHTML="",$.length===0){Q.innerHTML='<div class="empty-state w-100" style="grid-column: 1/-1;"><i class="fa-solid fa-building-columns"></i><p>Nenhuma conta bancária cadastrada.</p></div>';return}$.forEach(t=>{const e=I.filter(s=>s.paymentMethod===t.id),a=e.filter(s=>s.type==="income").reduce((s,r)=>s+r.amount,0),o=e.filter(s=>s.type==="expense").reduce((s,r)=>s+r.amount,0),n=(t.balance||0)+a-o,i=n<0?"var(--danger)":"var(--text-main)";Q.innerHTML+=`
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
                    <span style="font-weight: 700; font-size: 1.2rem; color: ${i}" class="bank-balance-value" data-bank-id="${t.id}">${v(n)}</span>
                </div>
                <div style="font-size: 0.8rem; color: var(--text-muted);">
                    Saldo Inicial: ${v(t.balance||0)}
                </div>
                <div style="font-size: 0.7rem; color: var(--text-muted); margin-top: 4px;">
                    <i class="fa-regular fa-clock"></i> ${I.filter(s=>s.paymentMethod===t.id).length} transações
                </div>
            </div>
        `})}}window.expandBank=t=>{const e=$.find(m=>m.id===t);if(!e)return;Q.innerHTML="";const a=I.filter(m=>m.paymentMethod===e.id),o=a.filter(m=>m.type==="income").reduce((m,g)=>m+g.amount,0),n=a.filter(m=>m.type==="expense").reduce((m,g)=>m+g.amount,0),i=(e.balance||0)+o-n,s=i<0?"var(--danger)":"var(--text-main)",r=S.id===t?S.startDate:"",l=S.id===t?S.endDate:"",p=new Date,d=`${p.toISOString().slice(0,7)}-01`,u=p.toISOString().slice(0,10);Q.innerHTML+=`
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
    `,!r&&!l&&(document.getElementById("bank-filter-start").value=d,document.getElementById("bank-filter-end").value=u),window.filterBankExtract(e.id)};window.generateBankReport=t=>{var h,y;const e=$.find(f=>f.id===t);if(!e){alert("Banco não encontrado.");return}const a=((h=document.getElementById("bank-filter-start"))==null?void 0:h.value)||"",o=((y=document.getElementById("bank-filter-end"))==null?void 0:y.value)||"";if(!a||!o){alert(`Por favor, selecione um período para gerar o relatório.
Use os filtros de data acima.`);return}let n=I.filter(f=>f.paymentMethod===t);if(a&&(n=n.filter(f=>f.date>=a)),o&&(n=n.filter(f=>f.date<=o)),n.length===0&&!confirm(`Nenhuma transação encontrada neste período.
Deseja gerar o relatório mesmo assim?`))return;n.sort((f,x)=>f.date.localeCompare(x.date));let i=e.balance||0;const s=I.filter(f=>f.paymentMethod===t);s.sort((f,x)=>f.date.localeCompare(x.date));for(const f of s)f.date<a&&(f.type==="income"?i+=f.amount:i-=f.amount);let r=0,l=0,p=i;const c=n.map(f=>{const x=f.type==="income",k=f.amount;return x?(r+=k,p+=k):(l+=k,p-=k),{date:f.date,description:f.description,category:f.category||"Sem Categoria",type:f.type,amount:k,balance:p}}),d=p,u=r+l,m=f=>{if(!f)return"";const x=f.split("-");return`${x[2]}/${x[1]}/${x[0]}`},g=window.open("","_blank");if(!g){alert("Por favor, permita pop-ups para gerar o relatório.");return}const b=`
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
                <p>${m(a)} a ${m(o)}</p>
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
                <div class="value ${d>=0?"positive":"negative"}">${new Intl.NumberFormat("pt-BR",{style:"currency",currency:"BRL"}).format(d)}</div>
            </div>
        </div>

        ${c.length>0?`
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
                ${c.map(f=>`
                    <tr>
                        <td>${m(f.date)}</td>
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
                    <td style="text-align: right; color: ${d>=0?"#059669":"#dc2626"}">
                        ${new Intl.NumberFormat("pt-BR",{style:"currency",currency:"BRL"}).format(u)}
                    </td>
                    <td style="text-align: right; color: ${d>=0?"#059669":"#dc2626"}">
                        ${new Intl.NumberFormat("pt-BR",{style:"currency",currency:"BRL"}).format(d)}
                    </td>
                </tr>
            </tfoot>
        </table>
        `:`
        <div class="no-transactions">
            <i class="fa-solid fa-receipt"></i>
            <p>Nenhuma transação encontrada neste período.</p>
            <p style="font-size: 0.85rem; margin-top: 4px;">Período: ${m(a)} a ${m(o)}</p>
        </div>
        `}

        <div class="footer">
            <p>Relatório gerado pelo Conta Comigo PRO</p>
            <p style="margin-top: 4px; font-size: 0.8rem;">
                ${c.length} transações no período • 
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
    `;g.document.write(b),g.document.close()};window.setBankFilterToMonth=t=>{const e=new Date,o=`${e.toISOString().slice(0,7)}-01`,n=e.toISOString().slice(0,10);document.getElementById("bank-filter-start").value=o,document.getElementById("bank-filter-end").value=n,window.filterBankExtract(t)};window.clearBankFilters=t=>{document.getElementById("bank-filter-start").value="",document.getElementById("bank-filter-end").value="",S.startDate="",S.endDate="",window.filterBankExtract(t)};window.openTransactionModalWithBank=t=>{P.value=t,V.classList.add("active")};const z=t=>{const e=t.split("-");return e.length===3?`${e[2]}/${e[1]}/${e[0]}`:t};function ct(){let t="";$.length>0&&(t+='<optgroup label="Bancos / Contas">',$.forEach(o=>{t+=`<option value="${o.id}">🏦 ${o.name}</option>`}),t+="</optgroup>"),B.length>0&&(t+='<optgroup label="Cartões de Crédito">',B.forEach(o=>{t+=`<option value="${o.id}">💳 ${o.nickname} (${o.bank})</option>`}),t+="</optgroup>"),P.innerHTML=t,wt&&(wt.innerHTML=t);const e=document.getElementById("pdf-destination");e&&(e.innerHTML='<option value="" disabled selected>Selecione onde lançar</option>'+t);const a=document.getElementById("card-payment-source-bank");if(a){let o='<option value="" disabled selected>Selecione</option>';$.forEach(n=>o+=`<option value="${n.id}">🏦 ${n.name}</option>`),a.innerHTML=o}}function se(){const t=B.some(a=>a.id===P.value),e=document.querySelector('input[name="type"]:checked').value;t&&e==="expense"?et.style.display="flex":(et.style.display="none",nt.value="1")}P.addEventListener("change",se);document.querySelectorAll('input[name="type"]').forEach(t=>t.addEventListener("change",se));function _(){let t=$.reduce((r,l)=>r+(l.balance||0),0);$.forEach(r=>{const l=I.filter(d=>d.paymentMethod===r.id),p=l.filter(d=>d.type==="income").reduce((d,u)=>d+u.amount,0),c=l.filter(d=>d.type==="expense").reduce((d,u)=>d+u.amount,0);t+=p-c});const e=I.map(r=>r.type==="income"?r.amount:-r.amount),a=e.filter(r=>r>0).reduce((r,l)=>r+l,0),o=e.filter(r=>r<0).reduce((r,l)=>r+l,0)*-1;_e&&(_e.textContent=v(t),_e.style.color=t<0?"var(--danger)":"var(--text-main)"),Et&&(Et.textContent=v(a)),It&&(It.textContent=v(o));const n=Wt(B,I,v),i=document.getElementById("total-card-invoice"),s=document.getElementById("card-invoice-detail");i&&(n.total>0?(i.textContent=v(n.total),i.style.color="var(--danger)"):(i.textContent="R$ 0,00",i.style.color="var(--text-muted)")),s&&(s.textContent=n.details),Le(I.slice(0,5),"transaction-list-recent"),mt(),U()}ot.addEventListener("input",U);it.addEventListener("change",U);rt.addEventListener("change",U);st.addEventListener("change",U);lt.addEventListener("change",U);ta.addEventListener("click",()=>{ot.value="",it.value="all",lt.value="all",rt.value="",st.value="",U()});function U(){const t=ot.value.toLowerCase(),e=it.value,a=lt.value,o=rt.value,n=st.value;let i="9999-12-31";if(!n){const u=new Date;i=new Date(u.getFullYear(),u.getMonth()+1,0).toISOString().slice(0,10)}const s=n||i,r=I.filter(u=>{const m=u.description.toLowerCase().includes(t),g=e==="all"||u.type===e,b=a==="all"||u.category===a,h=(!o||u.date>=o)&&(n?u.date<=n:u.date<=s);return m&&g&&b&&h}),l=r.map(u=>u.type==="income"?u.amount:-u.amount),p=l.reduce((u,m)=>u+m,0),c=l.filter(u=>u>0).reduce((u,m)=>u+m,0),d=l.filter(u=>u<0).reduce((u,m)=>u+m,0)*-1;Ue&&(Ue.textContent=v(p),aa.textContent=v(c),na.textContent=v(d),Ue.style.color=p<0?"var(--danger)":"var(--text-main)"),Le(r,"transaction-list-complete")}function Le(t,e){const a=document.getElementById(e);if(a.innerHTML="",t.length===0){a.innerHTML='<div class="empty-state"><i class="fa-solid fa-receipt"></i><p>Nenhuma transação encontrada.</p></div>';return}t.forEach(o=>{const n=o.type==="income",i=n?"+":"-";let s="";if(o.paymentMethod){const r=$.find(l=>l.id===o.paymentMethod);if(r)s=`<span style="font-size: 0.65rem; background: var(--bg-body); padding: 4px 8px; border-radius: 12px; border: 1px solid var(--border);"><i class="fa-solid fa-building-columns" style="color: ${r.color}"></i> ${r.name}</span>`;else{const l=B.find(p=>p.id===o.paymentMethod);l&&(s=`<span style="font-size: 0.65rem; background: var(--bg-body); padding: 4px 8px; border-radius: 12px; border: 1px solid var(--border);"><i class="fa-solid fa-credit-card" style="color: var(--primary)"></i> Cartão: ${l.nickname}</span>`)}}a.innerHTML+=`
            <div class="transaction-item">
                <div class="tx-left">
                    <div class="tx-icon ${n?"income":"expense"}"><i class="fa-solid ${n?"fa-arrow-up":"fa-arrow-down"}"></i></div>
                    <div class="tx-details">
                        <p class="tx-title" style="display:flex; align-items:center; flex-wrap:wrap; gap: 8px;">${o.description} ${s}</p>
                        <p class="tx-category"><i class="fa-solid ${Ft(o.category,F)}"></i> ${o.category}</p>
                    </div>
                </div>
                <div class="tx-right">
                    <p class="tx-amount ${n?"positive":"negative"}">${i} ${v(o.amount)}</p>
                    <p class="tx-date">${z(o.date)}</p>
                </div>
                <div class="tx-actions" style="display:flex; gap: 8px;">
                    <button class="btn-icon" onclick="window.editTransaction('${o.id}')" title="Editar"><i class="fa-solid fa-pen"></i></button>
                    <button class="btn-icon" onclick="window.deleteTransaction('${o.id}')" title="Excluir"><i class="fa-solid fa-trash"></i></button>
                </div>
            </div>`})}document.getElementById("btn-new-transaction").addEventListener("click",()=>{j=null,je=null,document.querySelector("#transaction-modal h2").textContent="Nova Transação",Z.reset(),document.getElementById("date").valueAsDate=new Date,se();const t=document.getElementById("tx-modal-tabs");t&&(t.style.display="flex"),window.resetBulkMode(),V.classList.add("active")});window.isBulkMode=!1;window.resetBulkMode=()=>{window.isBulkMode=!1;const t=document.getElementById("tab-tx-single"),e=document.getElementById("tab-tx-bulk");t&&e&&(t.classList.add("active"),t.style.borderBottom="2px solid var(--primary)",t.style.color="var(--text-main)",e.classList.remove("active"),e.style.borderBottom="none",e.style.color="var(--text-muted)");const a=document.getElementById("single-tx-container"),o=document.getElementById("bulk-tx-container");a&&(a.style.display="block"),o&&(o.style.display="none");const n=document.querySelector("#transaction-modal .modal");n&&(n.style.maxWidth="500px");const i=document.getElementById("bulk-rows-container");i&&(i.innerHTML="")};window.addBulkRow=()=>{const t=document.getElementById("bulk-rows-container");if(!t)return;const e="bulk_row_"+Math.random().toString(36).substr(2,9),a=document.createElement("div");a.id=e,a.className="bulk-row",a.style.cssText=`
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
    `;let o='<option value="" disabled selected>Categoria</option>';F.forEach(r=>{o+=`<option value="${r.name}">${r.name}</option>`});let n='<option value="" disabled selected>Banco/Cartão</option>';$.length>0&&$.forEach(r=>{n+=`<option value="${r.id}">🏦 ${r.name}</option>`}),B.length>0&&B.forEach(r=>{n+=`<option value="${r.id}">💳 ${r.nickname}</option>`});const i=document.getElementById("bulk-date").value||new Date().toISOString().slice(0,10);a.innerHTML=`
        <select class="bulk-row-type form-input" style="width: 100%; padding: 6px 8px; border-radius: 6px; background: var(--bg-main); border: 1px solid var(--border); color: var(--text-main); font-size: 0.85rem;" required>
            <option value="expense">Despesa</option>
            <option value="income">Receita</option>
        </select>
        
        <input type="text" class="bulk-row-desc form-input" placeholder="Descrição" style="width: 100%; padding: 6px 8px; border-radius: 6px; background: var(--bg-main); border: 1px solid var(--border); color: var(--text-main); font-size: 0.85rem;" required>
        
        <input type="text" class="bulk-row-amount form-input" placeholder="Valor" style="width: 100%; padding: 6px 8px; border-radius: 6px; background: var(--bg-main); border: 1px solid var(--border); color: var(--text-main); font-size: 0.85rem; text-align: right;" required>
        
        <input type="date" class="bulk-row-date form-input" value="${i}" style="width: 100%; padding: 6px 8px; border-radius: 6px; background: var(--bg-main); border: 1px solid var(--border); color: var(--text-main); font-size: 0.85rem;">
        
        <select class="bulk-row-category form-input" style="width: 100%; padding: 6px 8px; border-radius: 6px; background: var(--bg-main); border: 1px solid var(--border); color: var(--text-main); font-size: 0.85rem;" required>
            ${o}
        </select>
        
        <select class="bulk-row-pm form-input" style="width: 100%; padding: 6px 8px; border-radius: 6px; background: var(--bg-main); border: 1px solid var(--border); color: var(--text-main); font-size: 0.85rem;" required>
            ${n}
        </select>
        
        <button type="button" class="btn-icon" onclick="document.getElementById('${e}').remove()" title="Remover esta linha" style="color: var(--text-muted); padding: 4px; font-size: 1rem; transition: all 0.2s; display: flex; align-items: center; justify-content: center; width: 32px; height: 32px; border-radius: 4px; border: none; background: transparent; cursor: pointer;">
            <i class="fa-solid fa-xmark"></i>
        </button>
    `;const s=a.querySelector(".btn-icon");s.addEventListener("mouseenter",()=>{s.style.color="var(--danger)",s.style.background="var(--danger-bg)"}),s.addEventListener("mouseleave",()=>{s.style.color="var(--text-muted)",s.style.background="transparent"}),t.appendChild(a)};window.addBulkRowWithData=t=>{const e=document.getElementById("bulk-rows-container");if(!e)return;const a="bulk_row_"+Math.random().toString(36).substr(2,9),o=document.createElement("div");o.id=a,o.className="bulk-row",o.style.cssText=`
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
    `;let n='<option value="" disabled selected>Categoria</option>',i=!1;const s=t.category||"Extrato PDF";F.forEach(d=>{const u=d.name===s?"selected":"";u&&(i=!0),n+=`<option value="${d.name}" ${u}>${d.name}</option>`}),!i&&s&&(n=`<option value="${s}" selected>${s}</option>`+F.map(d=>`<option value="${d.name}">${d.name}</option>`).join(""));let r='<option value="" disabled selected>Banco/Cartão</option>';$.length>0&&$.forEach(d=>{const u=t.paymentMethod&&d.id===t.paymentMethod?"selected":"";r+=`<option value="${d.id}" ${u}>🏦 ${d.name}</option>`}),B.length>0&&B.forEach(d=>{const u=t.paymentMethod&&d.id===t.paymentMethod?"selected":"";r+=`<option value="${d.id}" ${u}>💳 ${d.nickname}</option>`});const l=t.type==="expense"?"selected":"",p=t.type==="income"?"selected":"";o.innerHTML=`
        <select class="bulk-row-type form-input" style="width: 100%; padding: 6px 8px; border-radius: 6px; background: var(--bg-main); border: 1px solid var(--border); color: var(--text-main); font-size: 0.85rem;" required>
            <option value="expense" ${l}>Despesa</option>
            <option value="income" ${p}>Receita</option>
        </select>
        
        <input type="text" class="bulk-row-desc form-input" placeholder="Descrição" value="${t.description||""}" style="width: 100%; padding: 6px 8px; border-radius: 6px; background: var(--bg-main); border: 1px solid var(--border); color: var(--text-main); font-size: 0.85rem;" required>
        
        <input type="text" class="bulk-row-amount form-input" placeholder="Valor" value="${t.amount?t.amount.toFixed(2).replace(".",","):""}" style="width: 100%; padding: 6px 8px; border-radius: 6px; background: var(--bg-main); border: 1px solid var(--border); color: var(--text-main); font-size: 0.85rem; text-align: right;" required>
        
        <input type="date" class="bulk-row-date form-input" value="${t.date||""}" style="width: 100%; padding: 6px 8px; border-radius: 6px; background: var(--bg-main); border: 1px solid var(--border); color: var(--text-main); font-size: 0.85rem;">
        
        <select class="bulk-row-category form-input" style="width: 100%; padding: 6px 8px; border-radius: 6px; background: var(--bg-main); border: 1px solid var(--border); color: var(--text-main); font-size: 0.85rem;" required>
            ${n}
        </select>
        
        <select class="bulk-row-pm form-input" style="width: 100%; padding: 6px 8px; border-radius: 6px; background: var(--bg-main); border: 1px solid var(--border); color: var(--text-main); font-size: 0.85rem;" required>
            ${r}
        </select>
        
        <button type="button" class="btn-icon" onclick="document.getElementById('${a}').remove()" title="Remover esta linha" style="color: var(--text-muted); padding: 4px; font-size: 1rem; transition: all 0.2s; display: flex; align-items: center; justify-content: center; width: 32px; height: 32px; border-radius: 4px; border: none; background: transparent; cursor: pointer;">
            <i class="fa-solid fa-xmark"></i>
        </button>
    `;const c=o.querySelector(".btn-icon");c.addEventListener("mouseenter",()=>{c.style.color="var(--danger)",c.style.background="var(--danger-bg)"}),c.addEventListener("mouseleave",()=>{c.style.color="var(--text-muted)",c.style.background="transparent"}),e.appendChild(o)};function Ba(){const t=document.getElementById("tab-tx-single"),e=document.getElementById("tab-tx-bulk"),a=document.getElementById("tab-tx-pdf"),o=document.getElementById("single-tx-container"),n=document.getElementById("bulk-tx-container"),i=document.getElementById("pdf-tx-container"),s=document.querySelector("#transaction-modal .modal"),r=document.querySelector("#form-transaction .modal-footer");if(!t||!e)return;t.addEventListener("click",()=>{window.isBulkMode=!1,t.classList.add("active"),t.style.borderBottom="2px solid var(--primary)",t.style.color="var(--text-main)",e.classList.remove("active"),e.style.borderBottom="none",e.style.color="var(--text-muted)",a&&(a.classList.remove("active"),a.style.borderBottom="none",a.style.color="var(--text-muted)"),o&&(o.style.display="block"),n&&(n.style.display="none"),i&&(i.style.display="none"),s&&(s.style.maxWidth="500px"),r&&(r.style.display="flex")}),e.addEventListener("click",()=>{window.isBulkMode=!0,e.classList.add("active"),e.style.borderBottom="2px solid var(--primary)",e.style.color="var(--text-main)",t.classList.remove("active"),t.style.borderBottom="none",t.style.color="var(--text-muted)",a&&(a.classList.remove("active"),a.style.borderBottom="none",a.style.color="var(--text-muted)"),o&&(o.style.display="none"),n&&(n.style.display="block"),i&&(i.style.display="none"),s&&(s.style.maxWidth="800px"),r&&(r.style.display="flex");const p=document.getElementById("bulk-date");p&&!p.value&&(p.value=document.getElementById("date").value||new Date().toISOString().slice(0,10));const c=document.getElementById("bulk-rows-container");c&&c.children.length===0&&window.addBulkRow()}),a&&a.addEventListener("click",()=>{window.isBulkMode=!1,a.classList.add("active"),a.style.borderBottom="2px solid var(--primary)",a.style.color="var(--text-main)",t.classList.remove("active"),t.style.borderBottom="none",t.style.color="var(--text-muted)",e.classList.remove("active"),e.style.borderBottom="none",e.style.color="var(--text-muted)",o&&(o.style.display="none"),n&&(n.style.display="none"),i&&(i.style.display="block"),s&&(s.style.maxWidth="500px"),r&&(r.style.display="none")});const l=document.getElementById("btn-add-bulk-row");l&&l.addEventListener("click",()=>window.addBulkRow())}async function ka(t){return pdfjsLib.GlobalWorkerOptions.workerSrc="https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.4.120/pdf.worker.min.js",new Promise((e,a)=>{const o=new FileReader;o.onload=async function(){try{const n=new Uint8Array(this.result),i=await pdfjsLib.getDocument({data:n}).promise;let s="";for(let r=1;r<=i.numPages;r++){const c=(await(await i.getPage(r)).getTextContent()).items;let d=-1,u="";for(let m=0;m<c.length;m++){const g=c[m];d!==-1&&Math.abs(g.transform[5]-d)>5&&(u+=`
`),u+=g.str+" ",d=g.transform[5]}s+=u+`
`}e(s)}catch(n){a(n)}},o.onerror=n=>a(n),o.readAsArrayBuffer(t)})}async function $a(t,e){var p,c,d,u,m,g;const a=`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${e}`,n={contents:[{parts:[{text:`Analise o extrato bancário em texto abaixo e extraia todas as transações (receitas e despesas).
Retorne APENAS um array JSON estruturado com o formato especificado no responseSchema. Não adicione nenhuma formatação markdown (como \`\`\`json) no texto de resposta se não for necessário, mas responda seguindo o schema de resposta JSON.

Instruções importantes:
- Identifique a data de cada transação. Se o ano não estiver especificado na linha, assuma o ano corrente (2026). Formate como AAAA-MM-DD.
- Identifique a descrição de forma limpa e clara.
- Identifique o valor (amount) como um número real estritamente positivo (ex: 123.45).
- Identifique o tipo (type): 'expense' para despesas (saídas, débitos, pagamentos, transferências enviadas, pix enviado) e 'income' para receitas (entradas, créditos, depósitos, salários, estornos, pix recebido, transferências recebidas).
- Classifique cada transação em uma das seguintes categorias padrão se aplicável (ou sugira uma categoria apropriada de mercado): Alimentação, Transporte, Saúde, Moradia, Lazer, Educação, Salário, Outros.

Texto do extrato:
${t}`}]}],generationConfig:{responseMimeType:"application/json",responseSchema:{type:"OBJECT",properties:{transactions:{type:"ARRAY",description:"Lista de transações extraídas do extrato",items:{type:"OBJECT",properties:{date:{type:"STRING",description:"Data da transação no formato AAAA-MM-DD"},description:{type:"STRING",description:"Descrição limpa da transação"},amount:{type:"NUMBER",description:"Valor real absoluto positivo da transação"},type:{type:"STRING",enum:["expense","income"],description:"Tipo da transação: expense para saída/débito, income para entrada/crédito"},category:{type:"STRING",description:"Categoria sugerida para a transação"}},required:["date","description","amount","type"]}}}}}},i=await fetch(a,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify(n)});if(!i.ok){const h=((p=(await i.json().catch(()=>({}))).error)==null?void 0:p.message)||`Status HTTP ${i.status}`;throw new Error(`Erro na API do Gemini: ${h}`)}const r=(g=(m=(u=(d=(c=(await i.json()).candidates)==null?void 0:c[0])==null?void 0:d.content)==null?void 0:u.parts)==null?void 0:m[0])==null?void 0:g.text;if(!r)throw new Error("Resposta vazia da API do Gemini.");return JSON.parse(r.trim()).transactions||[]}function Ca(){const t=document.getElementById("pdf-dropzone"),e=document.getElementById("pdf-file-input"),a=document.getElementById("pdf-selected-file"),o=document.getElementById("pdf-filename"),n=document.getElementById("pdf-destination"),i=document.getElementById("btn-process-pdf"),s=document.getElementById("pdf-loading"),r=document.getElementById("pdf-loading-status"),l=document.getElementById("gemini-key-container"),p=document.getElementById("pdf-gemini-key"),c=document.getElementById("save-gemini-key"),d=document.getElementById("method-heuristic"),u=document.getElementById("method-ai"),m=document.querySelector('label[for="method-heuristic"]'),g=document.querySelector('label[for="method-ai"]');if(!t||!e||!i)return;let b=null;const h=localStorage.getItem("gemini_api_key");h&&p&&(p.value=h),m&&g&&d&&u&&(m.addEventListener("click",()=>{d.checked=!0,m.classList.add("active"),m.style.borderColor="var(--primary)",m.style.background="var(--bg-body)",g.classList.remove("active"),g.style.borderColor="var(--border)",g.style.background="var(--bg-card)",l&&(l.style.display="none")}),g.addEventListener("click",()=>{u.checked=!0,g.classList.add("active"),g.style.borderColor="var(--primary)",g.style.background="var(--bg-body)",m.classList.remove("active"),m.style.borderColor="var(--border)",m.style.background="var(--bg-card)",l&&(l.style.display="block")})),t.addEventListener("dragover",y=>{y.preventDefault(),t.classList.add("dragover")}),t.addEventListener("dragleave",()=>{t.classList.remove("dragover")}),t.addEventListener("drop",y=>{if(y.preventDefault(),t.classList.remove("dragover"),y.dataTransfer.files.length>0){const f=y.dataTransfer.files[0];f.type==="application/pdf"||f.name.endsWith(".pdf")?(b=f,o.textContent=f.name,a.style.display="block"):alert("Apenas arquivos PDF são aceitos.")}}),t.addEventListener("click",()=>{e.click()}),e.addEventListener("change",()=>{if(e.files.length>0){const y=e.files[0];b=y,o.textContent=y.name,a.style.display="block"}}),i.addEventListener("click",async()=>{if(!b){alert("Por favor, selecione um arquivo PDF primeiro.");return}const y=n.value;if(!y){alert("Por favor, selecione um banco ou cartão de destino.");return}const f=u.checked;let x="";if(f){if(x=p.value.trim(),!x){alert("Por favor, insira sua Chave de API do Gemini para continuar.");return}c.checked?localStorage.setItem("gemini_api_key",x):localStorage.removeItem("gemini_api_key")}s.style.display="block",i.disabled=!0,i.innerHTML='<i class="fa-solid fa-circle-notch fa-spin"></i> Processando extrato...';try{r.textContent="Lendo e extraindo texto do arquivo PDF...";const k=await ka(b);r.textContent=f?"Enviando texto para a Inteligência Artificial...":"Processando transações localmente...";let E=[];if(f?E=await $a(k,x):E=Gt(k),E.length===0){alert("Nenhuma transação identificada no extrato. Tente utilizar a opção de Inteligência Artificial se o extrato for muito complexo."),s.style.display="none",i.disabled=!1,i.innerHTML='<i class="fa-solid fa-file-import"></i> Extrair Transações';return}const q=document.getElementById("bulk-rows-container");q&&(q.innerHTML=""),E.forEach(ut=>{ut.paymentMethod=y,window.addBulkRowWithData(ut)});const Te=document.getElementById("tab-tx-bulk");Te&&Te.click(),b=null,e.value="",a.style.display="none",s.style.display="none",i.disabled=!1,i.innerHTML='<i class="fa-solid fa-file-import"></i> Extrair Transações',typeof C=="function"?C(`${E.length} transação(ões) extraída(s) com sucesso!`):alert(`${E.length} transações extraídas com sucesso! Revise os valores antes de salvar.`)}catch(k){console.error(k),alert(`Erro ao processar o extrato: ${k.message}`),s.style.display="none",i.disabled=!1,i.innerHTML='<i class="fa-solid fa-file-import"></i> Extrair Transações'}})}ze&&ze.addEventListener("click",()=>{Ae.reset(),document.getElementById("transfer-date").valueAsDate=new Date;const t=document.getElementById("transfer-source-bank"),e=document.getElementById("transfer-dest-bank");t.innerHTML='<option value="" disabled selected>Selecione</option>',e.innerHTML='<option value="" disabled selected>Selecione</option>',$.forEach(a=>{t.innerHTML+=`<option value="${a.id}">${a.name}</option>`,e.innerHTML+=`<option value="${a.id}">${a.name}</option>`}),He.classList.add("active")});Ae&&Ae.addEventListener("submit",async t=>{t.preventDefault();const e=document.getElementById("transfer-amount").value,a=document.getElementById("transfer-date").value,o=document.getElementById("transfer-source-bank").value,n=document.getElementById("transfer-dest-bank").value,i=document.getElementById("transfer-description").value||"Transferência entre contas",s=A(e);if(isNaN(s)||s<=0)return alert("Valor inválido!");if(!o||!n)return alert("Selecione as contas de origem e destino!");if(o===n)return alert("A conta de origem não pode ser a mesma de destino!");try{const r=L.batch(),l=T.doc();r.set(l,{userId:w.uid,type:"expense",description:i,amount:s,category:"Transferência",date:a,paymentMethod:o,createdAt:firebase.firestore.FieldValue.serverTimestamp()});const p=T.doc();r.set(p,{userId:w.uid,type:"income",description:i,amount:s,category:"Transferência",date:a,paymentMethod:n,createdAt:firebase.firestore.FieldValue.serverTimestamp()}),await r.commit(),He.classList.remove("active"),Ae.reset(),F.some(d=>d.name.trim().toLowerCase()==="transferência")||await R.add({userId:w.uid,name:"Transferência",icon:"fa-arrow-right-arrow-left"}),typeof C=="function"&&C("Transferência realizada com sucesso!")}catch(r){alert("Erro ao transferir: "+r.message)}});document.getElementById("btn-new-goal").addEventListener("click",()=>Be.classList.add("active"));document.getElementById("btn-new-fixed-transaction").addEventListener("click",()=>{te=null,document.querySelector("#fixed-transaction-modal h2").textContent="Nova Transação Fixa",Re.reset(),document.getElementById("fixed-day").value=new Date().getDate(),le.classList.add("active")});At.addEventListener("click",()=>{ae=null,document.querySelector("#card-modal h2").textContent="Novo Cartão de Crédito",Pe.reset(),de.classList.add("active")});const Lt=document.getElementById("btn-show-pending-installments");Lt&&Lt.addEventListener("click",()=>{window.showPendingInstallmentsModal()});window.showPendingInstallmentsModal=()=>{const t=document.getElementById("installments-pending-tbody");if(!t)return;t.innerHTML="";const e={};I.forEach(n=>{n.groupId&&(e[n.groupId]||(e[n.groupId]={description:n.description.replace(/\s\(\d+\/\d+\)$/,""),totalAmount:n.totalAmount||0,installmentTotal:n.installmentTotal||1,paymentMethod:n.paymentMethod,category:n.category,installments:[]}),e[n.groupId].installments.push(n))});const a=new Date().toISOString().slice(0,10),o=[];for(const n in e){const i=e[n];i.installments.sort((r,l)=>r.date.localeCompare(l.date));const s=i.installments.filter(r=>r.date>=a);if(s.length>0){const r=i.installmentTotal-s.length,l=s.reduce((c,d)=>c+d.amount,0),p=s[0];o.push({description:i.description,paymentMethod:i.paymentMethod,category:i.category,installmentTotal:i.installmentTotal,paidCount:r,remainingCount:s.length,remainingAmount:l,totalAmount:i.totalAmount||i.installmentTotal*i.installments[0].amount,nextDate:p.date,nextAmount:p.amount})}}o.length===0?t.innerHTML='<tr><td colspan="7" style="text-align: center; padding: 24px; color: var(--text-muted);"><i class="fa-solid fa-check-double" style="font-size: 1.5rem; margin-bottom: 8px; display: block;"></i> Nenhuma compra parcelada pendente!</td></tr>':o.forEach(n=>{const i=jt(n.paymentMethod,$,B);t.innerHTML+=`
                <tr style="border-bottom: 1px solid var(--border);">
                    <td style="padding: 12px 8px; font-weight: 500;">${n.description}</td>
                    <td style="padding: 12px 8px; color: var(--text-muted);">${i}</td>
                    <td style="padding: 12px 8px;"><span class="badge" style="background: var(--bg-secondary); border: 1px solid var(--border); padding: 4px 8px; border-radius: 4px; font-size: 0.8rem;">${n.category}</span></td>
                    <td style="padding: 12px 8px; font-weight: 600;">${n.paidCount}/${n.installmentTotal} <span style="font-size: 0.75rem; color: var(--text-muted); font-weight: normal;">(restam ${n.remainingCount})</span></td>
                    <td style="padding: 12px 8px; font-size: 0.9rem;">${z(n.nextDate)} <span style="font-size: 0.75rem; color: var(--text-muted); display: block;">${v(n.nextAmount)}</span></td>
                    <td style="padding: 12px 8px; font-weight: 700; color: var(--danger);">${v(n.remainingAmount)}</td>
                    <td style="padding: 12px 8px; color: var(--text-muted);">${v(n.totalAmount)}</td>
                </tr>
            `}),oe.classList.add("active")};window.addEventListener("click",t=>{t.target.classList.contains("modal-overlay")&&(V.classList.remove("active"),le.classList.remove("active"),de.classList.remove("active"),Be.classList.remove("active"),Y.classList.remove("active"),ke.classList.remove("active"),W&&W.classList.remove("active"),oe&&oe.classList.remove("active"))});Ea();_();document.querySelectorAll(".close-modal, .btn-secondary").forEach(t=>{t.addEventListener("click",()=>{V.classList.remove("active"),le.classList.remove("active"),de.classList.remove("active"),Be.classList.remove("active"),Y.classList.remove("active"),ke.classList.remove("active"),W&&W.classList.remove("active"),oe&&oe.classList.remove("active"),Z.reset(),j=null,be=null,je=null,xe=null,document.querySelector("#transaction-modal h2").textContent="Nova Transação",Re.reset(),te=null,Pe.reset(),ae=null,Ne.reset()})});[V,Be,le,de,W,oe].forEach(t=>{t&&t.addEventListener("click",e=>{e.target===t&&t.classList.remove("active")})});let H={selic:10.5,cdi:10.4};async function La(){try{const e=await(await fetch("https://brasilapi.com.br/api/taxas/v1")).json(),a=e.find(n=>n.nome.toLowerCase()==="selic"),o=e.find(n=>n.nome.toLowerCase()==="cdi");a&&(H.selic=a.valor),o&&(H.cdi=o.valor),document.getElementById("market-rates-display").innerHTML=`
            <span style="margin-right: 16px;">Selic: <strong>${H.selic.toFixed(2)}%</strong></span>
            <span>CDI: <strong>${H.cdi.toFixed(2)}%</strong></span>
        `}catch(t){console.error("Erro ao buscar taxas da API:",t),document.getElementById("market-rates-display").textContent=`Selic: ${H.selic}% | CDI: ${H.cdi}% (Offline)`}}function Ta(){ve&&ve(),ve=he.where("userId","==",w.uid).orderBy("date","desc").onSnapshot(t=>{ie=[],t.forEach(e=>ie.push({id:e.id,...e.data()})),Ot()},t=>console.error("Investments snap error:",t))}function Ot(){const t=document.getElementById("investments-list");if(!t)return;t.innerHTML="";let e=0,a=0;if(ie.length===0){t.innerHTML='<div class="empty-state w-100"><i class="fa-solid fa-chart-line"></i><p>Nenhum investimento cadastrado.</p></div>',document.getElementById("total-investments").textContent="R$ 0,00",document.getElementById("total-investments-yield").textContent="R$ 0,00";return}ie.forEach(o=>{e+=o.amount;const n=o.manualCurrentValue!==void 0&&o.manualCurrentValue!==null&&o.manualCurrentValue!=="";let i=pt(o,new Date,H),s="";if(o.type==="fixed"||n){const r=i,l=r.gross>=o.amount;let p="";if(o.type==="fixed"&&o.dueDate){const c=new Date(o.dueDate+"T00:00:00");if(c>new Date){const d=pt(o,c,H,!0);p=`
                        <div style="margin-top: 8px; padding-top: 8px; border-top: 1px dashed var(--border);">
                            <span style="font-size: 0.8rem; color: var(--text-muted); text-transform: uppercase; font-weight: bold;">Projeção no Vencimento</span>
                            <div style="display: flex; justify-content: space-between; margin-top: 4px;">
                                <span>Bruto Estimado:</span>
                                <strong style="color: var(--text-main)">${v(d.gross)}</strong>
                            </div>
                            <div style="display: flex; justify-content: space-between; margin-bottom: 4px; color: var(--text-muted);">
                                <span>Imposto (IR):</span>
                                <span>- ${v(d.tax)}</span>
                            </div>
                            <div style="display: flex; justify-content: space-between; font-weight: bold;">
                                <span>Líquido Projetado:</span>
                                <span>${v(d.net)}</span>
                            </div>
                        </div>
                    `}}s=`
                <div style="background: var(--bg-body); padding: 8px; border-radius: 6px; margin-top: 12px; font-size: 0.9rem;">
                    <span style="font-size: 0.8rem; color: var(--text-muted); text-transform: uppercase; font-weight: bold;">Posição Atual ${n?"(Manual)":""}</span>
                    <div style="display: flex; justify-content: space-between; margin-top: 4px;">
                        <span>Bruto ${n?"Real":"Estimado"}:</span>
                        <strong style="color: ${l?"var(--success)":"var(--danger)"}">${v(r.gross)}</strong>
                    </div>
                    ${o.type==="fixed"?`
                    <div style="display: flex; justify-content: space-between; margin-bottom: 4px; color: var(--text-muted);">
                        <span>Imposto (IR):</span>
                        <span>- ${v(r.tax)}</span>
                    </div>`:""}
                    <div style="display: flex; justify-content: space-between; font-weight: bold;">
                        <span>Líquido Atual:</span>
                        <span>${v(r.net)}</span>
                    </div>
                    ${p}
                </div>
            `}a+=i.gross,t.innerHTML+=`
            <div class="card" style="padding: 16px; border: 1px solid var(--border); position: relative;">
                <div style="position: absolute; top: 16px; right: 16px; display: flex; gap: 8px;">
                    <button class="btn-icon" onclick="window.editInvestment('${o.id}')" title="Editar / Aporte"><i class="fa-solid fa-pen"></i></button>
                    <button class="btn-icon" onclick="window.deleteInvestment('${o.id}')" title="Excluir"><i class="fa-solid fa-trash"></i></button>
                </div>
                <h4 style="margin-bottom: 4px; padding-right: 24px;">${o.name}</h4>
                <p style="color: var(--text-muted); font-size: 0.85rem; margin-bottom: 12px;">
                    <i class="fa-solid fa-building-columns"></i> ${o.institution} • ${o.type==="fixed"?"Renda Fixa":o.type==="variable"?"Renda Variável":"Outros"}
                </p>
                <div style="display:flex; justify-content: space-between; margin-bottom: 4px;">
                    <span>Valor Aplicado:</span>
                    <strong>${v(o.amount)}</strong>
                </div>
                <div style="display:flex; justify-content: space-between; color: var(--text-muted); font-size: 0.85rem;">
                    <span>Data: ${z(o.date)}</span>
                    ${o.dueDate?`<span>Venc: ${z(o.dueDate)}</span>`:""}
                </div>
                ${o.type==="fixed"?`<div style="font-size: 0.85rem; margin-top: 4px; color: var(--primary);"><i class="fa-solid fa-percent"></i> Taxa: ${o.rateValue}% ${o.rateType.toUpperCase()}</div>`:""}
                
                ${s}
            </div>
        `}),document.getElementById("total-investments").textContent=v(e),document.getElementById("total-investments-yield").textContent=v(a)}const we=document.getElementById("invest-type"),Tt=document.getElementById("fixed-income-fields"),St=document.getElementById("invest-due-date-container");we&&we.addEventListener("change",t=>{t.target.value==="fixed"?(Tt.style.display="block",St.style.display="block"):(Tt.style.display="none",St.style.display="none")});const Mt=document.getElementById("btn-new-investment");Mt&&Mt.addEventListener("click",()=>{ce.reset(),document.getElementById("investment-modal").querySelector("h2").textContent="Novo Investimento",document.getElementById("edit-investment-fields").style.display="none",document.getElementById("invest-id").value="",document.getElementById("invest-amount").disabled=!1,document.getElementById("invest-date").valueAsDate=new Date,we.dispatchEvent(new Event("change")),W.classList.add("active")});ce&&ce.addEventListener("submit",async t=>{t.preventDefault();const e=document.getElementById("invest-id").value,a=document.getElementById("invest-name").value,o=document.getElementById("invest-institution").value,n=we.value,i=A(document.getElementById("invest-amount").value),s=document.getElementById("invest-date").value,r=document.getElementById("invest-due-date").value,l=A(document.getElementById("invest-new-aporte").value)||0,p=document.getElementById("invest-manual-value").value,c=p?parseFloat(p):null;let d=i;e&&l>0&&(d+=l);const u={userId:w.uid,name:a,institution:o,type:n,amount:d,date:s,dueDate:r};c!==null?u.manualCurrentValue=c:e&&(u.manualCurrentValue=firebase.firestore.FieldValue.delete()),e||(u.createdAt=firebase.firestore.FieldValue.serverTimestamp()),n==="fixed"&&(u.rateType=document.getElementById("invest-rate-type").value,u.rateValue=parseFloat(document.getElementById("invest-rate-value").value||0));try{e?await he.doc(e).update(u):await he.add(u),W.classList.remove("active"),ce.reset()}catch(m){alert("Erro ao salvar investimento: "+m.message)}});window.editInvestment=t=>{const e=ie.find(a=>a.id===t);e&&(ce.reset(),document.getElementById("investment-modal").querySelector("h2").textContent="Editar Investimento / Aporte",document.getElementById("edit-investment-fields").style.display="block",document.getElementById("invest-id").value=e.id,document.getElementById("invest-name").value=e.name,document.getElementById("invest-institution").value=e.institution,document.getElementById("invest-type").value=e.type,document.getElementById("invest-amount").value=e.amount,document.getElementById("invest-amount").disabled=!0,document.getElementById("invest-date").value=e.date,e.dueDate&&(document.getElementById("invest-due-date").value=e.dueDate),e.type==="fixed"&&(document.getElementById("invest-rate-type").value=e.rateType,document.getElementById("invest-rate-value").value=e.rateValue),e.manualCurrentValue!==void 0&&e.manualCurrentValue!==null&&(document.getElementById("invest-manual-value").value=e.manualCurrentValue),we.dispatchEvent(new Event("change")),W.classList.add("active"))};window.deleteInvestment=async t=>{confirm("Excluir este investimento permanentemente?")&&await he.doc(t).delete()};document.getElementById("current-date").textContent=new Date().toLocaleDateString("pt-BR",{weekday:"long",year:"numeric",month:"long",day:"numeric"}).replace(/^\w/,t=>t.toUpperCase());document.getElementById("date").valueAsDate=new Date;const Dt=document.getElementById("theme-toggle-settings"),Xe=document.getElementById("theme-toggle-track"),Qe=document.getElementById("theme-toggle-circle");function Ht(){ee?document.body.setAttribute("data-theme","dark"):document.body.removeAttribute("data-theme"),Qe&&Xe&&(ee?(Qe.style.transform="translateX(20px)",Xe.style.background="var(--primary)"):(Qe.style.transform="translateX(0)",Xe.style.background="var(--border)"))}ee&&document.body.setAttribute("data-theme","dark");Ht();Dt&&Dt.addEventListener("click",()=>{ee=!ee,localStorage.setItem("contaComigo_darkMode",ee),Ht()});window.populateReportBankSelect=function(){const t=document.getElementById("report-bank");if(!t)return;let e='<option value="" disabled selected>Selecione um banco</option>';$.forEach(a=>{e+=`<option value="${a.id}">🏦 ${a.name}</option>`}),t.innerHTML=e};window.handleReportTypeChange=function(){const t=document.getElementById("report-type").value,e=document.getElementById("report-bank-container"),a=document.getElementById("report-period-container");t==="bank-statement"?(e.style.display="block",a.style.display="block"):(e.style.display="none",a.style.display="block")};window.generateReport=function(){const t=document.getElementById("report-type").value,e=document.getElementById("report-month").value,a=document.getElementById("report-preview-content"),o=document.getElementById("btn-print-report"),n=document.getElementById("btn-export-csv");if(!e){alert("Por favor, selecione um mês de referência.");return}let i="",s="";switch(t){case"monthly-summary":i=Sa(e),s="Resumo Mensal (DRE)";break;case"category-expenses":i=Ma(e),s="Gastos por Categoria";break;case"bank-statement":const r=document.getElementById("report-bank").value;if(!r){alert("Por favor, selecione uma conta bancária.");return}i=Da(e,r),s="Extrato Bancário";break;case"credit-card":i=Fa(e),s="Relatório de Cartões";break;default:i='<p style="color: var(--text-muted);">Tipo de relatório não suportado.</p>'}a.innerHTML=i,o.disabled=!1,n.disabled=!1,window._currentReportHTML=i,window._currentReportTitle=s};function Sa(t){const[e,a]=t.split("-"),o=`${e}-${a}-01`,n=new Date(e,parseInt(a),0).getDate(),i=`${e}-${a}-${String(n).padStart(2,"0")}`,s=I.filter(m=>m.date>=o&&m.date<=i),r=s.filter(m=>m.type==="income").reduce((m,g)=>m+g.amount,0),l=s.filter(m=>m.type==="expense").reduce((m,g)=>m+g.amount,0),p=r-l,c={};s.filter(m=>m.type==="expense").forEach(m=>{const g=m.category||"Sem Categoria";c[g]||(c[g]=0),c[g]+=m.amount});const d=Object.entries(c).sort((m,g)=>g[1]-m[1]);let u="";return d.length===0?u='<tr><td colspan="2" style="text-align: center; color: var(--text-muted);">Nenhuma despesa neste período.</td></tr>':d.forEach(([m,g])=>{const b=l>0?(g/l*100).toFixed(1):0;u+=`
                <tr>
                    <td>${m}</td>
                    <td style="text-align: right; font-weight: 500;">${v(g)}</td>
                    <td style="text-align: right; color: var(--text-muted);">${b}%</td>
                </tr>
            `}),`
        <div class="report-content">
            <h3 style="margin-bottom: 8px;">📊 ${Ee(t)}</h3>
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
                    <span style="font-size: 1.5rem; font-weight: 700; color: ${p>=0?"var(--success)":"var(--danger)"};">${v(p)}</span>
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
                    ${u}
                </tbody>
            </table>
            
            <div style="margin-top: 16px; padding-top: 16px; border-top: 1px solid var(--border); color: var(--text-muted); font-size: 0.85rem;">
                <span>Total de transações: ${s.length}</span>
            </div>
        </div>
    `}function Ma(t){const[e,a]=t.split("-"),o=`${e}-${a}-01`,n=new Date(e,parseInt(a),0).getDate(),i=`${e}-${a}-${String(n).padStart(2,"0")}`,s=I.filter(c=>c.date>=o&&c.date<=i),r={};s.forEach(c=>{const d=c.category||"Sem Categoria";r[d]||(r[d]={income:0,expense:0,total:0}),c.type==="income"?r[d].income+=c.amount:r[d].expense+=c.amount,r[d].total+=c.type==="income"?c.amount:-c.amount});const l=Object.entries(r).sort((c,d)=>Math.abs(d[1].total)-Math.abs(c[1].total));let p="";return l.length===0?p='<tr><td colspan="4" style="text-align: center; color: var(--text-muted);">Nenhuma transação neste período.</td></tr>':l.forEach(([c,d])=>{p+=`
                <tr>
                    <td>${c}</td>
                    <td style="text-align: right; font-weight: 500; color: var(--success);">${v(d.income)}</td>
                    <td style="text-align: right; font-weight: 500; color: var(--danger);">${v(d.expense)}</td>
                    <td style="text-align: right; font-weight: 700; color: ${d.total>=0?"var(--success)":"var(--danger)"};">${v(d.total)}</td>
                </tr>
            `}),`
        <div class="report-content">
            <h3 style="margin-bottom: 8px;">📊 Gastos por Categoria - ${Ee(t)}</h3>
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
                    ${p}
                </tbody>
            </table>
        </div>
    `}function Da(t,e){const a=$.find(g=>g.id===e);if(!a)return'<p style="color: var(--danger);">Banco não encontrado.</p>';const[o,n]=t.split("-"),i=`${o}-${n}-01`,s=new Date(o,parseInt(n),0).getDate(),r=`${o}-${n}-${String(s).padStart(2,"0")}`,l=I.filter(g=>g.paymentMethod===e&&g.date>=i&&g.date<=r).sort((g,b)=>g.date.localeCompare(b.date));let p=a.balance||0,c="";l.length===0?c='<tr><td colspan="4" style="text-align: center; color: var(--text-muted);">Nenhuma transação neste período.</td></tr>':l.forEach(g=>{p+=g.type==="income"?g.amount:-g.amount,c+=`
                <tr>
                    <td>${z(g.date)}</td>
                    <td>${g.description}</td>
                    <td style="text-align: right; color: ${g.type==="income"?"var(--success)":"var(--danger)"};">${v(g.amount)}</td>
                    <td style="text-align: right; font-weight: 500;">${v(p)}</td>
                </tr>
            `});const d=l.filter(g=>g.type==="income").reduce((g,b)=>g+b.amount,0),u=l.filter(g=>g.type==="expense").reduce((g,b)=>g+b.amount,0),m=p;return`
        <div class="report-content">
            <h3 style="margin-bottom: 8px;">🏦 Extrato - ${a.name}</h3>
            <p style="color: var(--text-muted); margin-bottom: 16px;">${Ee(t)}</p>
            
            <div style="display: grid; grid-template-columns: repeat(4, 1fr); gap: 12px; margin-bottom: 20px;">
                <div style="background: var(--bg-body); padding: 12px; border-radius: 8px; text-align: center;">
                    <span style="display: block; font-size: 0.75rem; color: var(--text-muted);">Saldo Inicial</span>
                    <span style="font-weight: 700;">${v(a.balance||0)}</span>
                </div>
                <div style="background: var(--success-bg); padding: 12px; border-radius: 8px; text-align: center;">
                    <span style="display: block; font-size: 0.75rem; color: var(--text-muted);">Receitas</span>
                    <span style="font-weight: 700; color: var(--success);">${v(d)}</span>
                </div>
                <div style="background: var(--danger-bg); padding: 12px; border-radius: 8px; text-align: center;">
                    <span style="display: block; font-size: 0.75rem; color: var(--text-muted);">Despesas</span>
                    <span style="font-weight: 700; color: var(--danger);">${v(u)}</span>
                </div>
                <div style="background: var(--bg-body); padding: 12px; border-radius: 8px; text-align: center;">
                    <span style="display: block; font-size: 0.75rem; color: var(--text-muted);">Saldo Final</span>
                    <span style="font-weight: 700; color: ${m>=0?"var(--success)":"var(--danger)"};">${v(m)}</span>
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
                    ${c}
                </tbody>
            </table>
        </div>
    `}function Fa(t){const[e,a]=t.split("-"),o=`${e}-${a}-01`,n=new Date(e,parseInt(a),0).getDate(),i=`${e}-${a}-${String(n).padStart(2,"0")}`;if(B.length===0)return'<p style="color: var(--text-muted);">Nenhum cartão cadastrado.</p>';let s="";return B.forEach(r=>{const l=I.filter(m=>m.paymentMethod===r.id&&m.date>=o&&m.date<=i),p=l.filter(m=>m.type==="income").reduce((m,g)=>m+g.amount,0),c=l.filter(m=>m.type==="expense").reduce((m,g)=>m+g.amount,0),d=p-c;let u="";l.length===0?u='<tr><td colspan="3" style="text-align: center; color: var(--text-muted);">Sem movimentação</td></tr>':l.forEach(m=>{u+=`
                    <tr>
                        <td>${z(m.date)}</td>
                        <td>${m.description}</td>
                        <td style="text-align: right; color: ${m.type==="income"?"var(--success)":"var(--danger)"};">${v(m.amount)}</td>
                    </tr>
                `}),s+=`
            <div style="background: var(--bg-body); padding: 16px; border-radius: 8px; border: 1px solid var(--border); margin-bottom: 16px;">
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px;">
                    <h4 style="margin: 0;">💳 ${r.nickname}</h4>
                    <span style="background: ${d>=0?"var(--success-bg)":"var(--danger-bg)"}; padding: 4px 12px; border-radius: 12px; font-weight: 600; color: ${d>=0?"var(--success)":"var(--danger)"};">${v(d)}</span>
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
                        ${u}
                    </tbody>
                </table>
                <div style="margin-top: 8px; display: flex; justify-content: space-between; font-size: 0.85rem; color: var(--text-muted);">
                    <span>Limite: ${v(r.limit)}</span>
                    <span>Fechamento: Dia ${r.closingDay} | Vencimento: Dia ${r.dueDay}</span>
                </div>
            </div>
        `}),`
        <div class="report-content">
            <h3 style="margin-bottom: 16px;">💳 Relatório de Cartões - ${Ee(t)}</h3>
            ${s}
        </div>
    `}window.printReport=function(){window.print()};window.exportReportCSV=function(){const e=document.getElementById("report-preview-content").querySelectorAll("table tr");if(e.length===0){alert("Nenhum dado para exportar.");return}let a="";e.forEach(i=>{const s=i.querySelectorAll("th, td"),r=[];s.forEach(l=>{r.push('"'+l.textContent.trim().replace(/"/g,'""')+'"')}),a+=r.join(",")+`
`});const o=new Blob([a],{type:"text/csv;charset=utf-8;"}),n=document.createElement("a");n.href=URL.createObjectURL(o),n.download=`relatorio_${new Date().toISOString().slice(0,10)}.csv`,n.click(),URL.revokeObjectURL(n.href)};Ba();Ca();let Ze=null;window.generateCategoryChart=mt;function mt(){var h;const t=document.getElementById("category-chart");if(!t)return;const e=parseInt(document.getElementById("chart-period").value)||30,a=document.getElementById("chart-date-start").value,o=document.getElementById("chart-date-end").value;let n=a,i=o;if(!n&&!i&&e!=="all"){const y=new Date,f=new Date;f.setDate(f.getDate()-e),n=f.toISOString().slice(0,10),i=y.toISOString().slice(0,10),document.getElementById("chart-date-start").value=n,document.getElementById("chart-date-end").value=i}let s=I;(n||i)&&(s=I.filter(y=>y.date?!(n&&y.date<n||i&&y.date>i):!0));const r=s.filter(y=>y.type==="expense"),l={};r.forEach(y=>{const f=y.category||"Sem Categoria";l[f]||(l[f]=0),l[f]+=y.amount});const p=Object.entries(l).sort((y,f)=>f[1]-y[1]),c=p.map(y=>y[0]),d=p.map(y=>y[1]),u=["#FF6B6B","#4ECDC4","#45B7D1","#96CEB4","#FFEAA7","#DDA0DD","#FF8A5C","#A29BFE","#FD79A8","#00B894","#E17055","#74B9FF","#55EFC4","#FDCB6E","#E84393"];d.reduce((y,f)=>y+f,0);const m=((h=document.getElementById("chart-period").options[document.getElementById("chart-period").selectedIndex])==null?void 0:h.text)||"Últimos 30 dias",g=document.querySelector("#page-dashboard .section-header h3");if(g){const y=n&&i?`${z(n)} a ${z(i)}`:m;g.textContent=`Distribuição de Despesas (${y})`}if(d.length===0){t.style.display="none",document.getElementById("chart-legend").innerHTML='<p style="color: var(--text-muted); text-align: center; font-size: 0.9rem;">Nenhuma despesa no período selecionado.</p>';return}t.style.display="block",Ze&&Ze.destroy(),Ze=new Chart(t,{type:"doughnut",data:{labels:c,datasets:[{data:d,backgroundColor:u.slice(0,d.length),borderColor:"#ffffff",borderWidth:2}]},options:{responsive:!0,maintainAspectRatio:!1,plugins:{legend:{display:!1},tooltip:{callbacks:{label:function(y){const f=y.dataset.data.reduce((k,E)=>k+E,0),x=f>0?(y.parsed/f*100).toFixed(1):0;return`${y.label}: ${v(y.parsed)} (${x}%)`}}}}}});const b=document.getElementById("chart-legend");if(b){const y=d.reduce((f,x)=>f+x,0);b.innerHTML=c.map((f,x)=>{const k=d[x],E=y>0?(k/y*100).toFixed(1):0;return`
                <div class="legend-item">
                    <span class="color-dot" style="background: ${u[x%u.length]};"></span>
                    <span style="font-weight: 500;">${f}</span>
                    <span class="value">${v(k)}</span>
                    <span class="percentage">(${E}%)</span>
                </div>
            `}).join(""),b.innerHTML+=`
            <div class="legend-total">
                <span style="font-weight: 600;">Total:</span>
                <span class="total-value">${v(y)}</span>
            </div>
        `}}function Aa(){S={id:null,startDate:"",endDate:""},S.id&&window.filterBankExtract(S.id)}window.navigateCardMonth=(t,e)=>{const a=document.getElementById("cc-filter-month");if(!a)return;let o=a.value;o||(o=new Date().toISOString().slice(0,7));const[n,i]=o.split("-").map(Number),r=new Date(n,i-1+e,1).toISOString().slice(0,7);a.value=r,M.month=r,window.filterCardExtract(t)};window.resetCardMonth=t=>{const e=document.getElementById("cc-filter-month");if(!e)return;const a=B.find(i=>i.id===t);if(!a)return;const o=new Date,n=window.getInvoiceMonth(o.toISOString().slice(0,10),a.closingDay);e.value=n,M.month=n,window.filterCardExtract(t)};document.addEventListener("keydown",t=>{if(!D)return;const e=document.getElementById("cc-filter-month");!e||document.activeElement===e||(t.key==="ArrowLeft"&&t.ctrlKey?(t.preventDefault(),window.navigateCardMonth(D,-1)):t.key==="ArrowRight"&&t.ctrlKey?(t.preventDefault(),window.navigateCardMonth(D,1)):t.key==="r"&&t.ctrlKey&&(t.preventDefault(),window.resetCardMonth(D)))});window.applyBulkDateToAllRows=()=>{const t=document.getElementById("bulk-date").value;if(!t){alert("Por favor, selecione uma data primeiro.");return}const e=document.querySelectorAll(".bulk-row");if(e.length===0){alert("Nenhuma linha para atualizar.");return}e.forEach(a=>{const o=a.querySelector(".bulk-row-date");o&&(o.value=t)})};window.setBulkDateToToday=()=>{const t=new Date().toISOString().slice(0,10);document.getElementById("bulk-date").value=t,window.applyBulkDateToAllRows()};document.addEventListener("DOMContentLoaded",()=>{const t=document.getElementById("bulk-date");t&&t.addEventListener("change",function(){document.querySelectorAll(".bulk-row").forEach(a=>{const o=a.querySelector(".bulk-row-date");o&&!o.value&&(o.value=this.value)})})});window.renderBanks=dt;window.editBank=editBank;window.deleteBank=deleteBank;window.expandBank=expandBank;window.filterBankExtract=filterBankExtract;window.generateBankReport=generateBankReport;window.setBankFilterToMonth=setBankFilterToMonth;window.clearBankFilters=Aa;window.openTransactionModalWithBank=openTransactionModalWithBank;window.renderCards=Ce;window.editCard=editCard;window.deleteCard=deleteCard;window.toggleCardExtract=toggleCardExtract;window.closeCardExtract=closeCardExtract;window.filterCardExtract=filterCardExtract;window.navigateCardMonth=navigateCardMonth;window.resetCardMonth=resetCardMonth;window.generateCardReport=generateCardReport;window.launchCardFatura=launchCardFatura;window.editTransaction=editTransaction;window.deleteTransaction=deleteTransaction;window.renderTransactions=Le;window.applyBulkDateToAllRows=applyBulkDateToAllRows;window.setBulkDateToToday=setBulkDateToToday;window.addBulkRow=addBulkRow;window.addBulkRowWithData=addBulkRowWithData;window.resetBulkMode=resetBulkMode;window.addFundsToGoal=addFundsToGoal;window.deleteGoal=deleteGoal;window.populateGoalsSelect=Ve;window.editCategory=editCategory;window.deleteCategory=deleteCategory;window.selectCategoryIcon=selectCategoryIcon;window.renderCategories=Vt;window.editInvestment=editInvestment;window.deleteInvestment=deleteInvestment;window.renderInvestments=Ot;window.editFixedTransaction=editFixedTransaction;window.deleteFixedTransaction=deleteFixedTransaction;window.launchManualFixedTransaction=launchManualFixedTransaction;window.renderFixedTransactions=$e;window.generateReport=generateReport;window.handleReportTypeChange=handleReportTypeChange;window.populateReportBankSelect=populateReportBankSelect;window.printReport=printReport;window.exportReportCSV=exportReportCSV;window.getInvoiceMonth=getInvoiceMonth;window.generateCategoryChart=mt;window.showPendingInstallmentsModal=showPendingInstallmentsModal;console.log("Funções expostas globalmente");

(function(){ 
  const cfg = window.MIEC_CONFIG||{};
  function el(t,p={},...k){const e=document.createElement(t);Object.assign(e,p);k.forEach(c=>e.append(c));return e;}
  function row(k,v,cls){const tr=el('tr'); if(cls) tr.className=cls; tr.append(el('td',{className:'k',textContent:k}), el('td',{}, v&&v.nodeType?v:document.createTextNode(v))); return tr;}
  function dot(c){return el('span',{className:'dot '+c})}
  const root = el('div',{id:'miechud',style:'display:none'});
  root.append(el('header',{}, el('strong',{textContent:'MIEC • Sanity HUD'}), el('span',{className:'badge',textContent:'v4.2.1-auth-min — r13 — 2025-09-07'})),
              el('main'), el('footer',{}, el('span',{className:'badge',textContent:location.pathname.split('/').pop()||'index'}), (function(){const b=el('button',{textContent:'Fechar'});b.onclick=()=>root.style.display='none';return b;})()));
  document.addEventListener('DOMContentLoaded',()=>document.body.appendChild(root));
  function vis(v){root.style.display=v?'block':'none'}
  window.MIEC_HUD={show:()=>vis(true),hide:()=>vis(false),fill:(checks)=>{const m=root.querySelector('main');m.innerHTML='';const t=el('table');checks.forEach(c=>{const s=c.state==='ok'?'ok':(c.state==='warn'?'warn':'err');t.append(row(c.name,el('span',{},dot(s),' ',document.createTextNode(' '+(c.msg||s))),s));});t.append(row('Versão',cfg.VERSION||'—'));t.append(row('DEV_MODE',String(cfg.DEV_MODE)));t.append(row('REQUIRE_AUTH',String(cfg.REQUIRE_AUTH)));t.append(row('AUTO_SYNC',String(cfg.AUTO_SYNC)));m.append(t);}}
})();
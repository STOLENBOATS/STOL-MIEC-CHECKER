// hin-iso-guard.r12b.js — validações leves + esconde avisos até haver interação
(function(){
  function ready(cb){ document.readyState==='complete' ? cb() : addEventListener('load', cb, {once:true}); }
  function showBadge(id, text){
    let b = document.getElementById(id);
    if(!b){
      b = document.createElement('div');
      b.id = id;
      b.style.position = 'absolute';
      b.style.right = '16px';
      b.style.top = '-12px';
      b.style.padding = '10px 12px';
      b.style.borderRadius = '18px';
      b.style.background = '#d33';
      b.style.color = '#fff';
      b.style.fontWeight = '700';
      b.style.boxShadow = '0 2px 8px rgba(0,0,0,.25)';
      const box = document.getElementById('winInput')?.closest('.form-grid, section, form') || document.body;
      box.style.position = box.style.position || 'relative';
      box.appendChild(b);
    }
    b.textContent = text;
    b.style.display = text ? '' : 'none';
  }
  ready(()=>{
    const input = document.getElementById('winInput');
    if(!input) return;
    showBadge('hinBadger',''); 
    let dirty = false;
    function validate(v){
      v = (v||'').trim().toUpperCase();
      if(!dirty){ showBadge('hinBadger',''); return; }
      const msg = [];
      if(v.length && v.length < 14) msg.push('Muito curto');
      if(v.length >= 11){
        const m = v[10];
        if(m && !"ABCDEFGHIJKL".includes(m)) msg.push('Mês inválido (espera-se A–L)');
      }
      if(v.length >= 10){
        const serial = v.slice(5,10);
        if(/[IOQ]/.test(serial)) msg.push('Contém I/O/Q');
      }
      if(v.length >= 14){
        const yy = v.slice(12,14);
        if(/^\d{2}$/.test(yy)){
          const year = (2000 + Number(yy)) - (Number(yy) < 30 ? 0 : 100);
          if(year && year < 1998) msg.push('< 1998 requer certificado');
        }
      }
      showBadge('hinBadger', msg.join(' • '));
    }
    input.addEventListener('input', ()=>{ dirty = true; validate(input.value); });
    const form = document.getElementById('winForm');
    form && form.addEventListener('submit', ()=>{ dirty = true; validate(input.value); });
  });
})();

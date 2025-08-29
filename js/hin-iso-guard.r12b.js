(function(){
  function ready(cb){ document.readyState==='complete'?cb():addEventListener('load',cb,{once:true}); }
  const MONTH=/^[A-L]$/;
  let touched=false; // só mostra feedback depois do utilizador interagir

  function mark(el, ok, msg){
    if(!el) return;
    let tip=document.getElementById('winBadge');
    if(!touched){ // esconder até haver interação
      if(tip) tip.classList.add('hidden');
      el.style.outline='';
      return;
    }
    if (tip){
      tip.classList.remove('hidden');
      tip.textContent = ok ? 'OK' : (msg||'Formato inválido');
      tip.style.background = ok ? '#10b981' : '#ef4444';
      tip.style.color = '#fff';
    }
    el.style.outline = ok ? '2px solid #10b981' : '2px solid #ef4444';
  }

  function decodeLayout(raw){
    const s = (raw||'').toUpperCase().replace(/[^A-Z0-9]/g,'');
    const n = s.length;
    if (n >= 14){
      return { s, n, type:'EU14', micFrom:2, micTo:5, monthIdx:10, year2From:n-2, serialFrom:5, serialTo:10 };
    }
    if (n === 12){
      return { s, n, type:'US12', micFrom:0, micTo:3, monthIdx:9, year2From:n-2, serialFrom:3, serialTo:8 };
    }
    return { s, n, type:'UNK', micFrom:0, micTo:0, monthIdx:Math.max(0,n-5), year2From:n-2, serialFrom:0, serialTo:Math.max(0,n-2) };
  }

  function yearFromYY(yy){
    const y = parseInt(yy,10);
    if (!isFinite(y)) return null;
    return (y <= 27) ? 2000 + y : 1900 + y;
  }

  function basicCheck(raw){
    const lay = decodeLayout(raw);
    const s = lay.s, n = lay.n;
    if(n < 12) return {ok:false,msg:'Muito curto'};

    // I/O/Q tolerado no prefixo (País/MIC). Proibido em série (6–10) e na cauda (data).
    const disallowed=/[IOQ]/;
    if (lay.serialTo > lay.serialFrom){
      const serial = s.slice(lay.serialFrom, lay.serialTo);
      if (disallowed.test(serial)) return {ok:false,msg:'I/O/Q não permitido na série (pos.6–10)'};
    }
    const tail = s.slice(lay.serialTo);
    if (/[IOQ]/.test(tail.replace(/[A-L]/g,''))) {
      return {ok:false,msg:'I/O/Q não permitido na data'};
    }

    const m = s[lay.monthIdx] || '';
    if (!MONTH.test(m)) return {ok:false,msg:'Mês inválido (espera-se A–L)'};

    const modelYY = s.slice(lay.year2From);
    const year = yearFromYY(modelYY);
    if (year == null) return {ok:false,msg:'Ano inválido'};
    if (year < 1998) return {ok:false,msg:'Ano < 1998 não permitido'};

    return {ok:true};
  }

  ready(function(){
    const input=document.getElementById('winInput'); const form=document.getElementById('winForm');
    if(!input||!form) return;

    const refresh=()=>{ const {ok,msg}=basicCheck(input.value); mark(input,ok,msg); };
    input.addEventListener('input', ()=>{ touched=true; refresh(); });
    input.addEventListener('blur',  ()=>{ touched=true; refresh(); });
    form.addEventListener('submit', (ev)=>{
      touched=true;
      const {ok,msg}=basicCheck(input.value);
      mark(input,ok,msg);
      if(!ok){ ev.preventDefault(); alert('HIN inválido: '+msg); }
    });

    // estado inicial escondido
    mark(input,true,'');
  });
})();
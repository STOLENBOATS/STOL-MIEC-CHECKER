(function(){
  function ready(cb){ document.readyState==='complete'?cb():addEventListener('load',cb,{once:true}); }
  const MONTH=/^[A-L]$/;

  function mark(el, ok, msg){
    if(el){
      let tip=document.getElementById('winBadge');
      if (tip){
        tip.classList.remove('hidden');
        tip.textContent = ok ? 'OK' : (msg||'Formato inválido');
        tip.style.background = ok ? '#10b981' : '#ef4444';
        tip.style.color = '#fff';
      }
      el.style.outline = ok ? '2px solid #10b981' : '2px solid #ef4444';
    }
  }

  function decodeLayout(raw){
    const s = raw.toUpperCase().replace(/[^A-Z0-9]/g,'');
    const n = s.length;
    if (n >= 14){
      // EU(14): 2 country + 3 MIC + 5 serial + 1 month + 1 prodYear + 2 modelYY
      return { s, n, type:'EU14', micFrom:2, micTo:5, monthIdx:10, year2From:n-2, serialFrom:5, serialTo:10 };
    }
    if (n === 12){
      // US(12): 3 MIC + 5 serial + 1 month + 1 prodYear + 2 modelYY
      return { s, n, type:'US12', micFrom:0, micTo:3, monthIdx:9, year2From:n-2, serialFrom:3, serialTo:8 };
    }
    // fallback
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

    // Regra I/O/Q: toleramos em Country/MIC, mas não são permitidos em serial/data.
    const disallowed = /[IOQ]/;
    if (lay.serialTo > lay.serialFrom){
      const serial = s.slice(lay.serialFrom, lay.serialTo);
      if (disallowed.test(serial)) return {ok:false,msg:'I/O/Q não permitido na série (pos.6–10)'};
    }
    // Também não permitido em data (mês/letras, anos), embora mês deva ser A–L.
    const tail = s.slice(lay.serialTo);
    if (/[IOQ]/.test(tail.replace(/[A-L]/g,''))) { /* if rest has I/O/Q outside allowed A-L month */ }

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
    input.addEventListener('input', refresh);
    refresh();
    form.addEventListener('submit', (ev)=>{
      const {ok,msg}=basicCheck(input.value);
      if(!ok){ ev.preventDefault(); alert('HIN inválido: '+msg); }
    });
  });
})(); 

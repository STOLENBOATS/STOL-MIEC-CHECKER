(function(){
  function ready(cb){ document.readyState==='complete'?cb():addEventListener('load',cb,{once:true}); }

  // A–L month; EU(14) layout: country(2) + MIC(3) + serial(5) + month(1) + year(1) + model(2)
  // US(12) layout: MIC(3) + serial(5) + month(1) + year(1) + model(2)
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

  function decodeLayout(s){
    // returns {monthIdx, year2Idx} or null
    const n = s.length;
    if (n >= 14){
      // EU/14: month at index 10, prod year (single digit) at 11, model YY at 12-13
      return { monthIdx: 10, year2From: n-2 };
    }
    if (n === 12){
      // US/12: month at index 9, model YY at 10-11
      return { monthIdx: 9, year2From: n-2 };
    }
    // Fallback heuristic: take the first A–L in last 5 chars as month
    for (let i=Math.max(0,n-5); i<n; i++){
      if (MONTH.test(s[i])) return { monthIdx: i, year2From: n-2 };
    }
    return null;
  }

  function yearFromYY(yy){
    const y = parseInt(yy,10);
    if (!isFinite(y)) return null;
    return (y <= 27) ? 2000 + y : 1900 + y; // same heuristic usada no resto da app
  }

  function basicCheck(hin){
    const s=(hin||'').toUpperCase().replace(/[^A-Z0-9]/g,'');
    if(s.length < 12) return {ok:false,msg:'Muito curto'};
    if(/[IOQ]/.test(s)) return {ok:false,msg:'Contém I/O/Q'};

    const lay = decodeLayout(s);
    if (!lay) return {ok:false,msg:'Formato desconhecido'};

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
    // Primeira avaliação ao carregar a página (útil quando vem preenchido)
    refresh();
    form.addEventListener('submit', (ev)=>{
      const {ok,msg}=basicCheck(input.value);
      if(!ok){ ev.preventDefault(); alert('HIN inválido: '+msg); }
    });
  });
})(); 

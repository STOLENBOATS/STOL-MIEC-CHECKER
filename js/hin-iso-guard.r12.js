(function(){
  function ready(cb){ document.readyState==='complete'?cb():addEventListener('load',cb,{once:true}); }
  const MONTH=/[A-L]/;
  function mark(el, ok, msg){
    if(el){
      let tip=document.getElementById('winBadge');
      if (tip){ tip.classList.remove('hidden'); tip.textContent= ok ? 'OK' : (msg||'Formato inválido'); tip.style.background= ok?'#10b981':'#ef4444'; tip.style.color='#fff'; }
      el.style.outline= ok?'2px solid #10b981':'2px solid #ef4444';
    }
  }
  function basicCheck(hin){
    const s=(hin||'').toUpperCase().replace(/[^A-Z0-9]/g,'');
    if(s.length<12) return {ok:false,msg:'Muito curto'};
    if(/[IOQ]/.test(s)) return {ok:false,msg:'Contém I/O/Q'};
    const m=s[11]; if(m && !MONTH.test(m)) return {ok:false,msg:'Mês inválido (espera-se A-L)'};
    const yy=parseInt(s.slice(-2),10); if(!isFinite(yy)) return {ok:false,msg:'Ano inválido'};
    const year=(yy<=27)?(2000+yy):(1900+yy);
    if(year<1998) return {ok:false,msg:'Ano < 1998 não permitido'};
    return {ok:true};
  }
  ready(function(){
    const input=document.getElementById('winInput'); const form=document.getElementById('winForm');
    if(!input||!form) return;
    input.addEventListener('input', ()=>{ const {ok,msg}=basicCheck(input.value); mark(input,ok,msg); });
    form.addEventListener('submit', (ev)=>{ const {ok,msg}=basicCheck(input.value); if(!ok){ ev.preventDefault(); alert('HIN inválido: '+msg); } });
  });
})(); 

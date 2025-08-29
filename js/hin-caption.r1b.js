/*! hin-caption.r1b.js — mostra "HIN pesquisado: …" acima do resultado */
(function(){
  function ready(cb){ document.readyState==='complete'?cb():addEventListener('load',cb,{once:true}); }
  function findResult(){ return document.getElementById('winResult')||document.querySelector('#winForm ~ .result')||document.querySelector('.result'); }
  ready(()=>{
    let tries=0, t=setInterval(()=>{
      const form=document.getElementById('winForm'), input=document.getElementById('winInput'), result=findResult();
      if(form && input && result){
        clearInterval(t);
        let cap=document.getElementById('hinCaption');
        if(!cap){ cap=document.createElement('div'); cap.id='hinCaption'; cap.style.textAlign='center'; cap.style.fontWeight='600'; cap.style.margin='8px 0 12px'; cap.style.opacity='0.9'; result.prepend(cap); }
        const write=()=>{ const v=(input.value||'').trim(); cap.textContent=v?('HIN pesquisado: '+v):''; cap.style.display=v?'':'none'; };
        input.addEventListener('input', write); form.addEventListener('submit',()=>setTimeout(write,0)); write();
      } else if(++tries>=40){ clearInterval(t); console.warn('[hin-caption] containers não encontrados'); }
    },250);
  });
})();

// hin-caption.r1b.js — mostra "HIN pesquisado: ..." no topo do cartão de resultado
(function(){
  function ready(cb){ document.readyState==='complete'?cb():addEventListener('load',cb,{once:true}); }
  function findResult(){
    return document.getElementById('winResult')
        || document.querySelector('#winForm ~ .result')
        || document.querySelector('.result');
  }
  ready(()=> {
    let tries = 0;
    const maxTries = 40; // ~10s
    const tick = setInterval(()=> {
      const form  = document.getElementById('winForm');
      const input = document.getElementById('winInput');
      const result= findResult();
      if (form && input && result){
        clearInterval(tick);
        let cap = document.getElementById('hinCaption');
        if(!cap){
          cap = document.createElement('div');
          cap.id = 'hinCaption';
          cap.style.textAlign = 'center';
          cap.style.fontWeight = '600';
          cap.style.margin = '8px 0 12px';
          cap.style.opacity = '0.9';
          result.prepend(cap);
        }
        const write = ()=> {
          const v = (input.value||'').trim();
          cap.textContent = v ? ('HIN pesquisado: ' + v) : '';
          cap.style.display = v ? '' : 'none';
        };
        input.addEventListener('input', write);
        form.addEventListener('submit', ()=> setTimeout(write,0));
        write();
      } else if (++tries >= maxTries){
        clearInterval(tick);
        console.warn('[hin-caption] não encontrou #winForm/#winInput/.result');
      }
    }, 250);
  });
})();

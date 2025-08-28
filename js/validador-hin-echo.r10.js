(function(){
  function onLoad(cb){ document.readyState==='complete'?cb():addEventListener('load',cb,{once:true}); }
  onLoad(function(){
    const form = document.getElementById('winForm');
    if (!form) return;
    let lastEl = document.getElementById('hinQueryEcho');
    if (!lastEl){
      lastEl = document.createElement('div');
      lastEl.id='hinQueryEcho';
      lastEl.style.textAlign='center';
      lastEl.style.fontWeight='600';
      lastEl.style.margin='6px 0';
      lastEl.style.opacity='0.85';
      const resultBox = document.getElementById('winResult') || form;
      resultBox.parentNode.insertBefore(lastEl, resultBox);
    }
    function setEcho(text){
      if (text && text.trim()) lastEl.textContent = 'HIN pesquisado: ' + text.trim();
    }
    form.addEventListener('submit', ()=>{
      const v = (document.getElementById('winInput')?.value||'').trim();
      if (v) setEcho(v);
    });
    window.addEventListener('miec:hin:validated', (ev)=>{
      const v = ev.detail && ev.detail.hin;
      if (v) setEcho(v);
    });
  });
})();

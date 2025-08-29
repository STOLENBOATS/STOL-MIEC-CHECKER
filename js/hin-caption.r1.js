(function(){
  function ready(cb){ document.readyState==='complete'?cb():addEventListener('load',cb,{once:true}); }
  ready(()=>{
    const form = document.getElementById('winForm');
    const input = document.getElementById('winInput');
    const result = document.getElementById('winResult');
    if(!form || !input || !result) return;

    // cria barra de caption, antes do "Formato: ..." (topo do #winResult)
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

    function write(){
      const v = (input.value||'').trim();
      cap.textContent = v ? ('HIN pesquisado: ' + v) : '';
      cap.style.display = v ? '' : 'none';
    }

    // actualizar quando o utilizador escreve e quando submete
    input.addEventListener('input', write);
    form.addEventListener('submit', function(){ setTimeout(write, 0); });
    write();
  });
})();
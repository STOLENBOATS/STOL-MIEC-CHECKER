// Acrescenta Fabricante (MIC) na área forense, quando possível.
(function(){
  const MIC = {
    'FR|CNB': 'Chantiers Navals de Bordeaux (FR)',
    'PT|SGL': 'Seaglobal Lda (PT)',
    'ES|ABC': 'Fabricante Exemplo (ES)'
  };
  function decodeManufacturer(hin){
    if (!hin) return null;
    const s = hin.toUpperCase().replace(/[^A-Z0-9]/g,'');
    const cc = s.slice(0,2);
    const mic = s.slice(2,5);
    if (cc.length===2 && mic.length===3){
      const key = cc+'|'+mic;
      return MIC[key]||null;
    }
    return null;
  }
  function inject(name){
    const host = document.getElementById('winForense') || document.getElementById('motorForense');
    if (!host || !name) return;
    if (host.querySelector('.mf-row')) return;
    const row = document.createElement('div');
    row.className='mf-row';
    row.style.marginTop='6px';
    row.innerHTML = '<b>Fabricante (MIC):</b> '+ name;
    host.appendChild(row);
  }
  window.addEventListener('miec:hin:decoded', (ev)=>{
    const hin = ev.detail && ev.detail.hin;
    const m = decodeManufacturer(hin);
    if (m) inject(m);
  });
  document.addEventListener('click', (ev)=>{
    if (ev.target && ev.target.matches('#winForm button[type=submit]')){
      setTimeout(()=>{
        const v = (document.getElementById('winInput')?.value||'').trim();
        const m = decodeManufacturer(v);
        if (m) inject(m);
      }, 600);
    }
  }, true);
})();

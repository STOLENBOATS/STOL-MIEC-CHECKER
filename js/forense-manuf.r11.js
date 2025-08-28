/* js/forense-manuf.r11.js
   Lê o codebook (MIEC_CODEBOOKS) e mostra o Fabricante (MIC) no bloco forense do HIN.
*/
(function(){
  function ready(cb){ document.readyState==='complete'?cb():addEventListener('load',cb,{once:true}); }

  async function ensureCodebook(){
    if (!window.MIEC_CODEBOOKS) {
      console.warn('[forense-manuf] codebooks-live.v1.js não está carregado.');
      return false;
    }
    try { await MIEC_CODEBOOKS.load(); } catch(e){} // idempotente
    return true;
  }

  function parseCCMIC(hin){
    if (!hin) return null;
    const s = hin.toUpperCase().replace(/[^A-Z0-9]/g,'');
    const cc = s.slice(0,2), mic = s.slice(2,5);
    if (cc.length===2 && mic.length===3 && /^[A-Z]{2}$/.test(cc) && /^[A-Z]{3}$/.test(mic)) {
      return { cc, mic };
    }
    return null;
  }

  function injectManufacturer(name){
    const host = document.getElementById('winForense');
    if (!host || !name) return;
    let row = host.querySelector('.mf-row');
    const html = `<b>Fabricante (MIC)</b> <span class="sub-en">(Manufacturer)</span>: ${name}`;
    if (row){ row.innerHTML = html; return; }
    row = document.createElement('div');
    row.className = 'mf-row';
    row.style.marginTop = '6px';
    row.innerHTML = html;
    host.appendChild(row);
  }

  function readCurrentHIN(){
    return (document.getElementById('winInput')?.value || '').trim();
  }

  async function resolveAndInject(hin){
    if (!await ensureCodebook()) return;
    const parsed = parseCCMIC(hin);
    if (!parsed) return;
    const name = MIEC_CODEBOOKS.micName(parsed.cc, parsed.mic);
    if (name) injectManufacturer(name);
  }

  ready(async ()=>{
    const initial = readCurrentHIN();
    if (initial) resolveAndInject(initial);

    const form = document.getElementById('winForm');
    form?.addEventListener('submit', ()=>{
      const v = readCurrentHIN();
      if (v) setTimeout(()=>resolveAndInject(v), 400);
    });

    window.addEventListener('miec:hin:decoded', (ev)=>{
      const v = ev?.detail?.hin;
      if (v) resolveAndInject(v);
    });
  });
})();

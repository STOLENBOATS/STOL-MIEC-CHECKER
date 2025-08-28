// History pages UI enhancements: header buttons + thumb size toggle
(function(){
  function ready(cb){ if (document.readyState==='complete') cb(); else addEventListener('load', cb, {once:true}); }
  function addHeaderActions(){
    const header = document.querySelector('.app-header .header-actions');
    if (!header) return;
    if (!header.querySelector('.back-validator')){
      const a = document.createElement('a');
      a.href = 'validador.html';
      a.className='btn back-validator';
      a.textContent = 'Voltar ao Validador';
      header.insertBefore(a, header.firstChild);
    }
    if (!header.querySelector('#logoutBtn')){
      const btn = document.createElement('button');
      btn.id='logoutBtn'; btn.className='btn danger'; btn.textContent='Sair';
      btn.title='Terminar sessão';
      header.appendChild(btn);
      btn.addEventListener('click', async ()=>{
        try{ await (window.supa?.logout?.() || window.MIEC_SYNC?.client?.auth?.signOut?.()); location.replace('login.html'); }
        catch(e){ alert('Falha a terminar sessão: ' + (e&&e.message||e)); }
      });
    }
  }
  function addThumbToggle(){
    const host = document.querySelector('.app-header .header-actions') || document.querySelector('.container') || document.body;
    if (!host || document.querySelector('#thumbSizeToggle')) return;
    const btn = document.createElement('button');
    btn.id='thumbSizeToggle';
    btn.className='btn';
    const update = ()=>{ btn.textContent = document.body.classList.contains('thumb-md') ? 'Thumbs: Médias' : 'Thumbs: Pequenas'; };
    btn.addEventListener('click', ()=>{ document.body.classList.toggle('thumb-md'); update(); });
    update();
    host.appendChild(btn);
  }
  ready(function(){ addHeaderActions(); addThumbToggle(); });
})();

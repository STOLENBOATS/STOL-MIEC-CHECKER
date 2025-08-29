// history-header.r1.js — uniformiza cabeçalho e tema nas páginas de histórico
(function(){
  function ready(cb){ document.readyState==='complete'?cb():addEventListener('load',cb,{once:true}); }
  function ensureThemeToggle(container){
    if(document.getElementById('themeBtn')) return;
    const btn = document.createElement('button');
    btn.id='themeBtn'; btn.className='theme-toggle btn';
    btn.textContent='🌙/☀️';
    btn.title='Alternar tema / Toggle theme';
    btn.addEventListener('click', ()=>{
      const root=document.documentElement;
      const isLight=root.classList.contains('theme-light');
      root.classList.toggle('theme-light', !isLight);
      root.classList.toggle('theme-dark', isLight);
      localStorage.setItem('theme', !isLight?'light':'dark');
    });
    container.appendChild(btn);
    // aplicar preferido
    const saved = localStorage.getItem('theme')||'dark';
    const root=document.documentElement;
    root.classList.remove('theme-dark','theme-light');
    root.classList.add(saved==='light'?'theme-light':'theme-dark');
  }
  ready(()=>{
    if(!/historico_/i.test(location.pathname)) return; // só em páginas de histórico
    const headerActions = document.querySelector('.app-header .header-actions') || document.querySelector('.app-header');
    if(!headerActions) return;
    // Evitar botões duplicados "Voltar ao Validador"
    if(!headerActions.querySelector('[data-go-validator]')){
      const a = document.createElement('a');
      a.className='btn'; a.textContent='Voltar ao Validador';
      a.setAttribute('data-go-validator','1');
      a.href='validador.html';
      headerActions.prepend(a);
    }
    // Evitar duplicação "Sair": se já existir um, não cria
    if(!headerActions.querySelector('#logoutBtn')){
      const b=document.createElement('button');
      b.id='logoutBtn'; b.className='btn danger'; b.textContent='Sair';
      b.addEventListener('click', async ()=>{
        try{ await window.supa?.logout?.(); }catch(_){}
        sessionStorage.removeItem('loggedIn'); location.replace('login.html');
      });
      headerActions.appendChild(b);
    }
    ensureThemeToggle(headerActions);
  });
})();

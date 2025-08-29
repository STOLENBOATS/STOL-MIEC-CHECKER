(function(){
  function ready(cb){ document.readyState==='complete'?cb():addEventListener('load',cb,{once:true}); }
  ready(()=>{
    const header=document.querySelector('.app-header'); if(!header) return;
    const btns = Array.from(header.querySelectorAll('.btn'));
    const seen = new Set();
    btns.forEach(b=>{
      const key = b.textContent.trim()+'|'+(b.getAttribute('href')||'');
      if(seen.has(key)) b.remove();
      else seen.add(key);
    });
    if(!header.querySelector('#themeBtn')){
      const btn=document.createElement('button');
      btn.id='themeBtn';
      btn.className='theme-toggle';
      btn.textContent='🌙/☀️';
      btn.title='Alternar tema / Toggle theme';
      header.querySelector('.header-actions')?.appendChild(btn);
      btn.addEventListener('click', ()=>{
        const root=document.documentElement;
        const isLight=root.classList.contains('theme-light');
        root.classList.toggle('theme-light');
        root.classList.toggle('theme-dark');
        localStorage.setItem('theme', isLight?'dark':'light');
      });
      const saved=localStorage.getItem('theme')||'dark';
      const root=document.documentElement;
      root.classList.remove('theme-dark','theme-light');
      root.classList.add(saved==='light'?'theme-light':'theme-dark');
    }
  });
})();
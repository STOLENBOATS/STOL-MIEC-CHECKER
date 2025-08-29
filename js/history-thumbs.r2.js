(function(){
  function ready(cb){ document.readyState==='complete'?cb():addEventListener('load',cb,{once:true}); }
  ready(()=>{
    const header = document.querySelector('.app-header .header-actions') || document.querySelector('.app-header');
    if(!header) return;

    // inject CSS once
    if(!document.getElementById('miec-thumbs-css')){
      const css = document.createElement('style');
      css.id='miec-thumbs-css';
      css.textContent = `
        :root { --thumb-size: 72px; }
        body.thumbs-md { --thumb-size: 112px; }
        /* tentamos cobrir os possíveis selectores de thumbs/lightbox */
        .hist-table td .thumb img,
        .hist-table td img.thumb,
        .lightbox-grid img,
        .lb-thumbs img,
        .miec-lightbox img,
        a.thumb > img,
        .thumb > img {
          width: var(--thumb-size);
          height: auto;
          max-height: calc(var(--thumb-size) + 8px);
          object-fit: cover;
          border-radius: 8px;
          box-shadow: 0 1px 3px rgba(0,0,0,.25);
        }
      `;
      document.head.appendChild(css);
    }

    // add toggle button (se não existir)
    if(!document.getElementById('thumbToggle')){
      const btn = document.createElement('button');
      btn.id = 'thumbToggle';
      btn.className='btn';
      btn.style.marginLeft='8px';
      btn.textContent = localStorage.getItem('miecThumbMode')==='md' ? 'Thumbs: Médias' : 'Thumbs: Pequenas';
      btn.addEventListener('click', ()=>{
        const mode = document.body.classList.toggle('thumbs-md') ? 'md' : 'sm';
        localStorage.setItem('miecThumbMode', mode);
        btn.textContent = mode==='md' ? 'Thumbs: Médias' : 'Thumbs: Pequenas';
      });
      header.appendChild(btn);

      // aplicar preferido
      const mode = localStorage.getItem('miecThumbMode') || 'sm';
      if(mode==='md') document.body.classList.add('thumbs-md');
    }
  });
})();
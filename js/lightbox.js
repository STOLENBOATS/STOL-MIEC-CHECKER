// Minimal Lightbox for history thumbs
(function(){
  function ensureOverlay(){
    let el = document.querySelector('.lb-overlay');
    if (el) return el;
    el = document.createElement('div');
    el.className = 'lb-overlay';
    el.innerHTML = '<span class="lb-close">✕</span><img alt="preview">';
    document.body.appendChild(el);
    el.addEventListener('click', (ev)=>{
      if (ev.target === el || ev.target.classList.contains('lb-close')) el.classList.remove('open');
    });
    return el;
  }
  function open(src){
    const o = ensureOverlay();
    const img = o.querySelector('img');
    img.src = src;
    o.classList.add('open');
  }
  window.addEventListener('click', (ev)=>{
    const t = ev.target;
    if (!(t && t.classList && t.classList.contains('thumb'))) return;
    const full = t.getAttribute('data-full') || t.src;
    if (full) { ev.preventDefault(); open(full); }
  });
})(); 

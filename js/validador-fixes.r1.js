(function(){
  function ready(cb){ document.readyState==='complete'?cb():addEventListener('load',cb,{once:true}); }
  ready(()=>{
    const headings = document.querySelectorAll('section.card h2');
    const motorH2 = headings[1] || document.querySelector('section.card + section.card h2');
    if(!motorH2) return;
    const host = motorH2.parentElement;
    if(!host) return;
    for(const n of Array.from(host.childNodes)){
      if(n.nodeType===3){
        const t = (n.textContent||'').trim();
        if(t==='/1' || t=='\\1' || t==='\\x5c1'){ n.textContent=''; }
      }
    }
  });
})();
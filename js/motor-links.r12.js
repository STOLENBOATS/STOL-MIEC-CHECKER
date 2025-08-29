(function(){
  async function loadRes(){
    try{
      const res=await fetch('data/motor-resources.json?v=r12',{cache:'no-store'});
      if(!res.ok) throw new Error('HTTP '+res.status);
      return await res.json();
    }catch(e){ console.warn('[motor-links] falha recursos:',e); return {}; }
  }
  function ready(cb){ document.readyState==='complete'?cb():addEventListener('load',cb,{once:true}); }
  function render(links){
    const host=document.getElementById('motorResult')||document.getElementById('motorForm');
    if(!host) return;
    let box=document.getElementById('motorLinksBox');
    if(!box){ box=document.createElement('div'); box.id='motorLinksBox'; box.className='muted'; box.style.marginTop='6px'; host.parentNode.insertBefore(box, host); }
    box.innerHTML = (!links||!links.length)? '' : '<div style="display:flex;gap:8px;flex-wrap:wrap">'+links.map(l=>`<a class="btn" href="${l.url}" target="_blank" rel="noreferrer">${l.label}</a>`).join('')+'</div>';
  }
  ready(async()=>{
    const cfg = await loadRes();
    const sel = document.getElementById('brand'); if(!sel) return;
    const refresh=()=>{ render(cfg[sel.value]||[]); };
    sel.addEventListener('change', refresh);
    refresh();
  });
})();

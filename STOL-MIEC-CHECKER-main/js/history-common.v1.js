// js/history-common.v1.js
window.MIEC_HIST = (function(){
  function fmtTs(ts){
    try{ const d=new Date(Number(ts)); if(!isFinite(d)) throw 0; 
      return d.toLocaleString('pt-PT'); }catch{ return String(ts); }
  }
  function esc(s){ return String(s??'').replace(/[&<>'"]/g, (c)=>({ '&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;' }[c])); }
  function thumbCell(url){
    const u = String(url||'').trim();
    if(!u) return '';
    const src = u.startsWith('http') ? u
             : (window.SUPABASE_URL ? (window.SUPABASE_URL.replace(/\/+$/,'') + '/storage/v1/object/public/' + u.replace(/^\/+/, '') ) : u);
    return `<img class="thumb" src="${esc(src)}" alt="foto">`;
  }
  function ensureTable(hostId, headers){
    let host = document.getElementById(hostId);
    if(!host){ host = document.querySelector('.container,.card,main,body'); }
    let tbody = document.getElementById('rows');
    if(tbody) return tbody;
    const card = document.createElement('div'); card.className='card';
    const h2 = document.createElement('h2'); h2.textContent = document.title.includes('Motores')?'Histórico Motores':'Histórico HIN';
    card.appendChild(h2);
    const table = document.createElement('table'); table.className='table';
    const thead = document.createElement('thead'); const tr = document.createElement('tr');
    for(const h of headers){ const th=document.createElement('th'); th.textContent=h; tr.appendChild(th); }
    thead.appendChild(tr); table.appendChild(thead);
    tbody = document.createElement('tbody'); tbody.id='rows'; table.appendChild(tbody);
    card.appendChild(table);
    host?.appendChild(card);
    return tbody;
  }
  async function getClient(){
    if (window.supabase && window.SUPABASE_URL && window.SUPABASE_ANON_KEY){
      try{ return window.supabase.createClient(window.SUPABASE_URL, window.SUPABASE_ANON_KEY); }catch{}
    }
    return null;
  }
  async function getSessionUserId(sb){
    try{ const { data:{ session } } = await sb.auth.getSession(); return session?.user?.id || null; }catch{ return null; }
  }
  function readLocal(keys){
    for(const k of keys){
      try{ const v = JSON.parse(localStorage.getItem(k)||'[]'); if(Array.isArray(v) && v.length) return v; }catch{}
    }
    return [];
  }
  return { fmtTs, esc, thumbCell, ensureTable, getClient, getSessionUserId, readLocal };
})();
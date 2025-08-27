// cleanup-history.js — Higieniza arrays existentes para evitar quota futura
(function(){
  function parse(v){ try { return JSON.parse(v); } catch { return []; } }
  function save(k,v){ try { localStorage.setItem(k, JSON.stringify(v)); } catch {} }

  function clean(key){
    const MAX = 200, KEEP_PHOTO = 5;
    const arr = parse(localStorage.getItem(key)) || [];
    if (!Array.isArray(arr) || !arr.length) return;

    const out = arr.slice(-MAX);
    for (let i = 0; i < out.length - KEEP_PHOTO; i++){
      if (out[i] && out[i].photo) out[i].photo = '';
    }
    for (let i = Math.max(0, out.length - KEEP_PHOTO); i < out.length; i++){
      const e = out[i];
      if (e && e.photo && String(e.photo).length > 250000) e.photo = '';
    }
    save(key, out);
  }

  if (document.readyState === 'loading'){
    document.addEventListener('DOMContentLoaded', ()=>{ clean('hist_win'); clean('hist_motor'); });
  } else {
    clean('hist_win'); clean('hist_motor');
  }
})();
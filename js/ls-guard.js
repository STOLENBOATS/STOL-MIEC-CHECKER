// ls-guard.js — Guarda de quota para hist_win / hist_motor
(function(){
  const orig = localStorage.setItem.bind(localStorage);

  function safeStringify(v){ try { return JSON.stringify(v); } catch { return '[]'; } }
  function parse(v){ try { return JSON.parse(v); } catch { return []; } }

  function shrinkArray(arr){
    const MAX = 200, KEEP_PHOTO = 5;
    if (!Array.isArray(arr)) return [];
    const out = arr.slice(-MAX);
    for (let i = 0; i < out.length - KEEP_PHOTO; i++){
      if (out[i] && out[i].photo && String(out[i].photo).length > 0){
        out[i].photo = '';
      }
    }
    for (let i = Math.max(0, out.length - KEEP_PHOTO); i < out.length; i++){
      const e = out[i];
      if (e && e.photo && String(e.photo).length > 250000) {
        e.photo = '';
      }
    }
    return out;
  }

  localStorage.setItem = function(key, value){
    if (key === 'hist_win' || key === 'hist_motor'){
      try {
        return orig(key, value);
      } catch (e){
        try {
          const arr = shrinkArray(parse(value));
          return orig(key, safeStringify(arr));
        } catch (e2){
          try {
            const arr = parse(value);
            const last = arr[arr.length - 1] || null;
            if (last) { last.photo = ''; return orig(key, safeStringify([last])); }
          } catch {}
        }
      }
      return;
    }
    return orig(key, value);
  };
})();
// js/codebooks-live.v1.js
// Carrega listas de Países (ISO-3166-1 alfa-2) e MIC (fabricantes de casco) dinamicamente.
// - Países: REST Countries (cache 7 dias) + fallback local data/countries.min.json
// - MICs:   fontes configuráveis (CSV/JSON) + fallback local data/mic.local.json
// Exporte: window.MIEC_CODEBOOKS { load(), countryName(cc), micName(code) }

(function(){
  const g = window;
  const CACHE_DAYS = 7;

  function days(ms){ return ms * 24*60*60*1000; }
  function now(){ return Date.now(); }
  function fromCache(key, maxAgeDays){
    try{
      const raw = localStorage.getItem(key);
      if(!raw) return null;
      const obj = JSON.parse(raw);
      if(!obj || !obj.t || !obj.v) return null;
      if (now() - obj.t > days(maxAgeDays)) return null;
      return obj.v;
    }catch{ return null; }
  }
  function toCache(key, value){
    try{ localStorage.setItem(key, JSON.stringify({ t: now(), v: value })); }catch{}
  }

  async function getJSON(url){
    const res = await fetch(url, { cache: 'no-cache' });
    if(!res.ok) throw new Error(`HTTP ${res.status}`);
    return await res.json();
  }
  async function getText(url){
    const res = await fetch(url, { cache: 'no-cache' });
    if(!res.ok) throw new Error(`HTTP ${res.status}`);
    return await res.text();
  }

  function parseCSV(text){
    // Muito simples (sem quoted commas) — suficiente para fontes limpas
    const lines = text.split(/\r?\n/).filter(l=>l.trim().length);
    const header = lines.shift().split(',').map(s=>s.trim().replace(/^"|"$/g,''));
    const idx = Object.fromEntries(header.map((h,i)=>[h.toLowerCase(), i]));
    return lines.map(line=>{
      const cols = line.split(',').map(s=>s.trim().replace(/^"|"$/g,''));
      return Object.fromEntries(Object.keys(idx).map(k=>[k, cols[idx[k]] ?? '' ]));
    });
  }

  async function loadCountries(){
    // tenta cache
    const cached = fromCache('miec_countries_cache_v1', CACHE_DAYS);
    if (cached) return cached;

    // tenta REST Countries
    try{
      const arr = await getJSON('https://restcountries.com/v3.1/all?fields=cca2,name');
      const map = {};
      for (const r of arr){
        const code = (r.cca2||'').toUpperCase();
        const name = r.name?.common || r.name?.official || '';
        if (code && name) map[code] = name;
      }
      if (Object.keys(map).length > 150){
        toCache('miec_countries_cache_v1', map);
        return map;
      }
    }catch(e){ console.warn('[codebooks] países online falhou:', e?.message||e); }

    // fallback local
    try{
      const map = await getJSON('data/countries.min.json');
      return map || {};
    }catch{ return {}; }
  }

  async function loadMICs(){
    // Origens configuráveis (podes definir window.MIEC_MIC_SOURCES = [ ... ])
    const out = {};
    const sources = Array.isArray(g.MIEC_MIC_SOURCES) ? g.MIEC_MIC_SOURCES.slice() : [];
    // Ex.: CSV USCG: { type:'csv', url:'https://...' , code:'MIC', name:'Company' }
    // Ex.: JSON plano: { type:'json', url:'https://...', map:{ code:'mic', name:'name' } }

    for (const s of sources){
      try{
        if (s.type === 'csv'){
          const txt = await getText(s.url);
          const rows = parseCSV(txt);
          for (const r of rows){
            const code = (r[s.code]?.toUpperCase()||'').trim();
            const name = (r[s.name]||'').trim();
            if (code && name) out[code] = name;
          }
        } else if (s.type === 'json'){
          const data = await getJSON(s.url);
          if (Array.isArray(data)){
            const codeKey = s.map?.code || 'code', nameKey = s.map?.name || 'name';
            for (const r of data){
              const code = (r[codeKey]?.toUpperCase()||'').trim();
              const name = (r[nameKey]||'').trim();
              if (code && name) out[code] = name;
            }
          } else {
            // objeto { "ABC":"Beneteau", ... }
            Object.assign(out, Object.fromEntries(Object.entries(data).map(([k,v])=>[k.toUpperCase(), String(v)])));
          }
        }
      }catch(e){
        console.warn('[codebooks] falhou fonte MIC:', s.url, e?.message||e);
      }
    }

    // Fallback local
    try{
      const local = await getJSON('data/mic.local.json');
      for (const [k,v] of Object.entries(local||{})){
        if (!out[k]) out[k.toUpperCase()] = String(v);
      }
    }catch{}

    return out;
  }

  const CB = {
    _countries: null,
    _mics: null,
    async load(){
      if (!this._countries) this._countries = await loadCountries();
      if (!this._mics) this._mics = await loadMICs();
      return this;
    },
    countryName(cc){ return (this._countries?.[String(cc||'').toUpperCase()] || '').trim(); },
    micName(code){ return (this._mics?.[String(code||'').toUpperCase()] || '').trim(); }
  };

  g.MIEC_CODEBOOKS = CB;
})();
// js/codebooks-live.v1.js
(function(){
  const g = window;
  const CACHE_DAYS = 7;
  const MS = 24*60*60*1000;
  const now = ()=>Date.now();
  const fromCache = (k,d)=>{ try{ const o=JSON.parse(localStorage.getItem(k)||'null'); if(!o) return null; if(now()-o.t>d*MS) return null; return o.v; }catch{ return null; } };
  const toCache   = (k,v)=>{ try{ localStorage.setItem(k, JSON.stringify({t:now(), v})); }catch{} };
  async function getJSON(u){ const r=await fetch(u,{cache:'no-cache'}); if(!r.ok) throw new Error(r.status); return r.json(); }
  async function getText(u){ const r=await fetch(u,{cache:'no-cache'}); if(!r.ok) throw new Error(r.status); return r.text(); }
  function parseCSV(s){ const L=s.split(/\r?\n/).filter(Boolean); const H=(L.shift()||'').split(',').map(x=>x.trim().replace(/^"|"$/g,'')); const idx=Object.fromEntries(H.map((h,i)=>[h.toLowerCase(),i])); return L.map(line=>{ const c=line.split(',').map(x=>x.trim().replace(/^"|"$/g,'')); return Object.fromEntries(Object.keys(idx).map(k=>[k, c[idx[k]]||'' ])); }); }
  async function loadCountries(){
    const cached = fromCache('miec_countries_cache_v1', CACHE_DAYS); if (cached) return cached;
    try{
      const arr = await getJSON('https://restcountries.com/v3.1/all?fields=cca2,name');
      const map = {}; for(const r of arr){ const code=(r.cca2||'').toUpperCase(); const name=r.name?.common||r.name?.official||''; if(code&&name) map[code]=name; }
      if(Object.keys(map).length>150){ toCache('miec_countries_cache_v1', map); return map; }
    }catch(e){ console.warn('[codebooks] países online falhou:', e?.message||e); }
    try{ return await getJSON('data/countries.min.json'); }catch{ return {}; }
  }
  async function loadMICs(){
    const out={};
    const srcs = Array.isArray(g.MIEC_MIC_SOURCES) ? g.MIEC_MIC_SOURCES : [];
    for(const s of srcs){
      try{
        if(s.type==='csv'){ const t=await getText(s.url); const rows=parseCSV(t); for(const r of rows){ const code=(r[s.code]?.toUpperCase()||'').trim(); const name=(r[s.name]||'').trim(); if(code&&name) out[code]=name; } }
        else if(s.type==='json'){ const data=await getJSON(s.url); if(Array.isArray(data)){ const ck=s.map?.code||'code', nk=s.map?.name||'name'; for(const r of data){ const code=(r[ck]?.toUpperCase()||'').trim(); const name=(r[nk]||'').trim(); if(code&&name) out[code]=name; } } else { Object.assign(out, Object.fromEntries(Object.entries(data).map(([k,v])=>[k.toUpperCase(), String(v)]))); } }
      }catch(e){ console.warn('[codebooks] falhou fonte MIC:', s.url, e?.message||e); }
    }
    try{ const local=await getJSON('data/mic.local.json'); for(const [k,v] of Object.entries(local||{})){ if(!out[k]) out[k.toUpperCase()]=String(v); } }catch{}
    try{ const all=await getJSON('data/mic.all.json'); for(const [k,v] of Object.entries(all||{})){ if(!out[k]) out[k.toUpperCase()]=String(v); } }catch{}
    return out;
  }
  const CB = {
    _countries:null, _mics:null,
    async load(){ if(!this._countries) this._countries=await loadCountries(); if(!this._mics) this._mics=await loadMICs(); return this; },
    countryName(cc){ return (this._countries?.[String(cc||'').toUpperCase()]||'').trim(); },
    micName(code){ return (this._mics?.[String(code||'').toUpperCase()]||'').trim(); }
  };
  g.MIEC_CODEBOOKS = CB;
})();
// historico-motor.js — v1.3 (one-time migration + robust dedupe + newest-first)
(function(){
  function $(s, r=document){ return r.querySelector(s); }

  
function parseMaybe(v){ try { return JSON.parse(v); } catch { return null; } }
function saveLS(k,v){ try { localStorage.setItem(k, JSON.stringify(v)); } catch {} }

function tsNum(x){
  const t = (x && (x.ts ?? x.timestamp ?? x.date)) || 0;
  if (typeof t === 'number') return t;
  if (typeof t === 'string'){
    const n = Number(t);
    if (!Number.isNaN(n)) return n;
    const d = Date.parse(t);
    if (!Number.isNaN(d)) return d;
  }
  return 0;
}


  const CANON_KEY = 'miec_history_motor';
  const MIG_FLAG  = 'miec_migrated_motor_v1';
  const IDX_KEY   = 'miec_hist_idx_motor';  // guarda ts por fingerprint

  function normEntry(e){
    if(!e) return null;
    const ok = typeof e.ok === 'boolean' ? e.ok : undefined;
    const resStr = e.result || (ok === true ? 'Válido' : ok === false ? 'Inválido' : '');
    const reason = e.reason || e.details || e.justification || e.motivo || e.message || '';
    const brand = e.brand || e.marca || '';
    const ident = e.ident || [e.model, e.code, e.sn, e.serial].filter(Boolean).join(' ').trim();
    const photo = e.photo || e.foto || '';
    const ts = e.ts || e.timestamp || e.date || null;
    return { ts, brand, ident, result: resStr, reason, photo };
  }
  function fpMotor(e){
    return `${(e.brand||'').toUpperCase()}|${(e.ident||'').toUpperCase()}|${(e.result||'').toLowerCase()}|${(e.reason||'').trim()}|${(e.photo||'').length}`;
  }

  function migrateOnce(){
    const migrated = localStorage.getItem(MIG_FLAG) === '1';
    const canon = parseMaybe(localStorage.getItem(CANON_KEY)) || [];
    const idx   = parseMaybe(localStorage.getItem(IDX_KEY)) || {}; // fp -> ts

    if(migrated){
      const out = [];
      const seen = new Set();
      for(const row of canon){
        const n = normEntry(row);
        if(!n || !n.brand || !n.ident) continue;
        const fp = fpMotor(n);
        let t = tsNum(n);
        if(!t && idx[fp]) t = idx[fp];
        n.ts = t || n.ts || n.timestamp || n.date || 0;
        if(!seen.has(fp)){ seen.add(fp); out.push(n); }
      }
      out.sort((a,b)=> tsNum(b)-tsNum(a));
      saveLS(CANON_KEY, out);
      return out;
    }

    const candidates = [];
    const keys = ['miec_history_motor','motorHistory','historicoMOTOR','history_motor','hist_motor'];
    for(const k of keys){
      const arr = parseMaybe(localStorage.getItem(k));
      if(Array.isArray(arr)){
        for(const raw of arr){ const n = normEntry(raw); if(n && n.brand && n.ident) candidates.push(n); }
      }
    }
    const out = [];
    const seen = new Set();
    for(const n of candidates){
      const fp = fpMotor(n);
      if(seen.has(fp)) continue;
      seen.add(fp);
      let t = tsNum(n);
      if(!t){
        t = idx[fp] || Date.now();
        idx[fp] = t;
      }
      n.ts = t;
      out.push(n);
    }
    out.sort((a,b)=> tsNum(b)-tsNum(a));
    saveLS(CANON_KEY, out);
    saveLS(IDX_KEY, idx);
    try{ localStorage.setItem(MIG_FLAG, '1'); }catch{}
    return out;
  }

  function ensureTbody(){
    let tbody = $('#motorTbody') || $('#motorTable tbody') || document.querySelector('tbody');
    if(!tbody){
      const table = $('#motorTable') || document.querySelector('table');
      if(table){ tbody = document.createElement('tbody'); tbody.id = 'motorTbody'; table.appendChild(tbody); }
    }
    return tbody;
  }

  function render(rows){
    const tbody = ensureTbody(); if(!tbody) return;
    const table = tbody.closest('table');
    const cols = table && table.tHead ? table.tHead.rows[0].cells.length : 6;
    if(!rows.length){ tbody.innerHTML = `<tr><td colspan="${cols}" class="cell-muted">Sem registos.</td></tr>`; return; }
    rows.sort((a,b)=> tsNum(b)-tsNum(a));
    tbody.innerHTML = rows.map(r => {
      const badge = r.result && /valid|ok|válid/i.test(r.result) ? `<span class="badge ok">${r.result}</span>` : r.result ? `<span class="badge err">${r.result}</span>` : '';
      const img = r.photo ? `<img class="thumb" src="${r.photo}" alt="foto motor">` : '';
      const date = new Date(tsNum(r)).toLocaleString('pt-PT');
      return `<tr>
        <td>${date}</td>
        <td><strong>${(r.brand||'')}</strong></td>
        <td class="wrap">${(r.ident||'')}</td>
        <td>${badge}</td>
        <td class="wrap">${r.reason||''}</td>
        <td>${img}</td>
      </tr>`;
    }).join('');
  }

  function boot(){ render(migrateOnce()); }
  if(document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot); else boot();
})();
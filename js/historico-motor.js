// historico-motor.js — v1.2 (tolerante + mapeamento 'hist_motor') — MIEC
(function(){
  function $(s, r=document){ return r.querySelector(s); }
  function parseMaybe(v){ try { return JSON.parse(v); } catch { return null; } }

  function ensureTbody(){
    let tbody = $('#motorTbody') || $('#motorTable tbody') || document.querySelector('tbody');
    if(!tbody){
      const table = $('#motorTable') || document.querySelector('table');
      if(table){
        tbody = document.createElement('tbody');
        tbody.id = 'motorTbody';
        table.appendChild(tbody);
      }
    }
    return tbody;
  }

  function normEntry(e){
    if(!e) return null;
    const ok = typeof e.ok === 'boolean' ? e.ok : undefined;
    const resStr = e.result || (ok === true ? 'Válido' : ok === false ? 'Inválido' : '');
    const reason = e.reason || e.details || e.justification || e.motivo || e.message || '';
    // Ident pode vir agregado ou separado (model/code/sn)
    const ident = e.ident || [e.model, e.code, e.sn, e.serial].filter(Boolean).join(' ').trim();

    return {
      ts: e.ts || e.timestamp || e.date || Date.now(),
      brand: e.brand || e.marca || '',
      ident: ident,
      result: resStr,
      reason: reason,
      photo: e.photo || e.foto || e.image || ''
    };
  }

  function migrateToCanon(){
    const CANON_KEY = 'miec_history_motor';
    const canon = parseMaybe(localStorage.getItem(CANON_KEY)) || [];
    const seen = new Set(canon.map(x => `${x.ts}|${x.brand}|${x.ident}`));

    const collectionKeys = ['miec_history_motor','motorHistory','historicoMOTOR','history_motor','hist_motor'];
    for(const k of collectionKeys){
      const arr = parseMaybe(localStorage.getItem(k));
      if(Array.isArray(arr)){
        for(const raw of arr){
          const e = normEntry(raw);
          if(e && e.ident && !seen.has(`${e.ts}|${e.brand}|${e.ident}`)){
            canon.push(e); seen.add(`${e.ts}|${e.brand}|${e.ident}`);
          }
        }
      }
    }

    for(let i=0;i<localStorage.length;i++){
      const k = localStorage.key(i);
      if(!k) continue;
      if(/motor|engine/i.test(k)){
        const raw = parseMaybe(localStorage.getItem(k));
        if(raw && typeof raw === 'object'){
          const e = normEntry(raw);
          if(e && e.ident && !seen.has(`${e.ts}|${e.brand}|${e.ident}`)){
            canon.push(e); seen.add(`${e.ts}|${e.brand}|${e.ident}`);
          }
        }
      }
    }
    try { localStorage.setItem(CANON_KEY, JSON.stringify(canon)); } catch {}
    return canon;
  }

  function render(rows){
    const tbody = ensureTbody();
    if(!tbody) return;

    const table = tbody.closest('table');
    const cols = table && table.tHead ? table.tHead.rows[0].cells.length : 6;

    if(!rows.length){
      tbody.innerHTML = `<tr><td colspan="${cols}" class="cell-muted">Sem registos.</td></tr>`;
      return;
    }
    rows.sort((a,b)=> (b.ts||0)-(a.ts||0));

    tbody.innerHTML = rows.map(r => {
      const badge = r.result && /valid|ok|válid/i.test(r.result)
        ? `<span class="badge ok">${r.result}</span>`
        : r.result ? `<span class="badge err">${r.result}</span>` : '';
      const img = r.photo ? `<img class="thumb" src="${r.photo}" alt="foto motor">` : '';
      const date = new Date(r.ts).toLocaleString('pt-PT');
      return `<tr>
        <td>${date}</td>
        <td><strong>${r.brand||''}</strong></td>
        <td class="wrap">${r.ident||''}</td>
        <td>${badge}</td>
        <td class="wrap">${r.reason||''}</td>
        <td>${img}</td>
      </tr>`;
    }).join('');
  }

  function boot(){ render(migrateToCanon()); }

  if(document.readyState === 'loading'){
    document.addEventListener('DOMContentLoaded', boot);
  } else {
    boot();
  }
})();
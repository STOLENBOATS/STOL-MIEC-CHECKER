// WIN/HIN Validator (UE: 14 chars; US: 14 or 16). Ignore hyphen at pos 3 (between 2&3).
// Rules from Ricardo's spec.
const monthsMap = {
  A:'Janeiro', B:'Fevereiro', C:'Março', D:'Abril', E:'Maio', F:'Junho',
  G:'Julho', H:'Agosto', J:'Setembro', K:'Outubro', L:'Novembro', M:'Dezembro'
};
const invalidMonthLetters = ['I','O','Q'];

function normalizeWIN(input){
  return input.toUpperCase().replace(/\s+/g,'').replace(/-/g,''); // strip spaces & hyphens
}

function isLetters(s){ return /^[A-Z]+$/.test(s); }
function isDigits(s){ return /^\d+$/.test(s); }


function resolveYears(prodDigit, modelYY){
  // Candidates
  const prodCandidates = [1990 + prodDigit, 2000 + prodDigit];
  const modelCandidates = [1900 + parseInt(modelYY,10), 2000 + parseInt(modelYY,10)];

  // Prefer pairs where model >= prod with minimal gap; tie-breaker prefers 2000+ century
  let best = null;
  for(const p of prodCandidates){
    for(const m of modelCandidates){
      if(m >= p){
        const gap = m - p;
        const score = gap + (m>=2000?0.01:0.1) + (p>=2000?0.01:0.1); // prefer 2000s slightly
        if(!best || score < best.score){ best = {p,m,score}; }
      }
    }
  }
  // If none satisfies m>=p, pick the closest and flag incoherence
  if(!best){
    let minGap = Infinity, pair = null;
    for(const p of prodCandidates){
      for(const m of modelCandidates){
        const gap = Math.abs(m - p);
        if(gap < minGap){ minGap = gap; pair = {p,m}; }
      }
    }
    return { prod: pair.p, model: pair.m, coherent:false };
  }
  return { prod: best.p, model: best.m, coherent:true };
}

function inferModelYear(twoDigits){
  // Allow 19xx or 20xx; default to 20xx for 00–49, 19xx for >=50 (simple heuristic)
  const n = parseInt(twoDigits,10);
  const year20 = 2000 + n;
  const year19 = 1900 + n;
  // Prefer 20xx for most modern vessels; present both
  return { preferred: year20, alt: year19 };
}

function inferProdYear(oneDigit){
  // Heuristic: 2000s decade by default; include note of ambiguity
  const d = parseInt(oneDigit,10);
  const preferred = 2000 + d;
  const alt = 1990 + d; // possible in 199x
  return { preferred, alt };
}

function explainField(name, value, interpretation, ok=true){
  const badge = ok ? '✅' : '⚠️';
  const enMap = {
    'País (1–2)':'Country',
    'Fabricante (3–5)':'Manufacturer',
    'Série (6–10)':'Serial',
    'Série (6–12)':'Serial',
    'Mês prod. (11)':'Prod. month',
    'Mês prod. (13)':'Prod. month',
    'Ano prod. (12)':'Prod. year',
    'Ano prod. (14)':'Prod. year',
    'Ano modelo (13–14)':'Model year',
    'Ano modelo (15–16)':'Model year'
  };
  const en = enMap[name] || '';
  const labelHtml = en ? `${name}<span class='sub-en'>( ${en} )</span>` : name;
  return `<tr><td><b>${labelHtml}</b></td><td class="code">${value}</td><td>${badge} ${interpretation}</td></tr>`;
}

function toggleCertLine(show){
  const line = document.getElementById('certLine');
  const box = document.getElementById('winCert');
  if(line){ line.style.display = show ? 'flex' : 'none'; }
  if(!show && box){ box.checked = false; }
}
function setWinBadge(type, text){
  const el = document.getElementById('winBadge');
  if(!el) return;
  el.className = 'badge ' + (type||'neutral');
  el.textContent = text || '';
  if(text){ el.classList.remove('hidden'); } else { el.classList.add('hidden'); }
}

function validateWIN(raw){
  const original = raw.trim();
  const hasHyphenBetween2and3 = original.length>=3 && original[2]==='-';
  const win = normalizeWIN(original);
  const len = win.length;

  const details = [];
  let ok = true;
  let format = '';

  if(len!==14 && len!==16){
    ok = false;
    details.push('Comprimento inválido: WIN deve ter 14 (UE/EUA) ou 16 (EUA) caracteres após normalização.');
  }

  // Determine format
  if(len===14){ format = 'UE/EUA (14)'; }
  if(len===16){ format = 'EUA (16)'; }

  // Parse common parts using positions per spec
  if(len===14){
    const country = win.slice(0,2);
    const maker = win.slice(2,5);
    const serie = win.slice(5,10);
    const monthL = win[10];
    const prodYear = win[11];
    const modelYear = win.slice(12,14);

    if(!isLetters(country)){ ok=false; details.push('País (pos.1–2) deve ser letras.'); }
    if(!isLetters(maker)){ ok=false; details.push('Fabricante (pos.3–5) deve ser letras.'); }
    if(!isDigits(serie)){ ok=false; details.push('Série (pos.6–10) deve ser dígitos.'); }
    if(invalidMonthLetters.includes(monthL) || !/[A-Z]/.test(monthL)){ ok=false; details.push('Mês (pos.11) deve ser letra A–M exceto I, O, Q.'); }
    if(!/^\d$/.test(prodYear)){ ok=false; details.push('Ano de produção (pos.12) deve ser 1 dígito.'); }
    if(!/^\d{2}$/.test(modelYear)){ ok=false; details.push('Ano do modelo (pos.13–14) deve ser 2 dígitos.'); }

    // Build table
    const monthOk = !invalidMonthLetters.includes(monthL) && /[A-Z]/.test(monthL) && monthsMap[monthL];
    const monthDesc = monthOk ? `${monthsMap[monthL]}` : 'Letra inválida para mês (Invalid month letter)';
    const years = resolveYears(parseInt(prodYear,10), modelYear);

    var html = `<table class="table"><tbody>`;
    html += explainField('País (1–2)', country, 'Código do país (letras). ' + (isLetters(country)?'Formato OK. (Format OK)':'Inválido. (Invalid)'), isLetters(country));
    html += explainField('Fabricante (3–5)', maker, 'Código do fabricante (letras). ' + (isLetters(maker)?'Formato OK. (Format OK)':'Inválido. (Invalid)'), isLetters(maker));
    html += explainField('Série (6–10)', serie, 'Número de série (5 dígitos). ' + (isDigits(serie)?'Formato OK. (Format OK)':'Inválido. (Invalid)'), isDigits(serie));
    html += explainField('Mês prod. (11)', monthL, monthDesc, monthOk);
    html += explainField('Ano prod. (12)', prodYear, `Provável ${years.prod} (alternativas 199${prodYear} ou 200${prodYear}).`, /^\d$/.test(prodYear));
    html += explainField('Ano modelo (13–14)', modelYear, `${years.coherent? 'Provável' : 'Possível (incoerência com ano de produção)'} ${years.model} (alternativas 19${modelYear} ou 20${modelYear}).`, /^\d{2}$/.test(modelYear));
    html += `</tbody></table>`;

    if(!hasHyphenBetween2and3){
      details.push('Aviso: recomenda-se hífen entre pos.2 e 3 (ex.: FR-CNB…).');
    }

    return { ok: ok && details.length===0, format, html, details, years };
  }

  if(len===16){
    const country = win.slice(0,2);
    const maker = win.slice(2,5);
    const serie = win.slice(5,12);
    const monthL = win[12];
    const prodYear = win[13];
    const modelYear = win.slice(14,16);

    if(!isLetters(country)){ ok=false; details.push('País (pos.1–2) deve ser letras.'); }
    if(!isLetters(maker)){ ok=false; details.push('Fabricante (pos.3–5) deve ser letras.'); }
    if(!isDigits(serie)){ ok=false; details.push('Série (pos.6–12) deve ser dígitos.'); }
    const monthOk = !invalidMonthLetters.includes(monthL) && /[A-Z]/.test(monthL) && monthsMap[monthL];
    if(!monthOk){ ok=false; details.push('Mês (pos.13) inválido.'); }
    if(!/^\d$/.test(prodYear)){ ok=false; details.push('Ano de produção (pos.14) deve ser 1 dígito.'); }
    if(!/^\d{2}$/.test(modelYear)){ ok=false; details.push('Ano do modelo (pos.15–16) deve ser 2 dígitos.'); }

    const years = resolveYears(parseInt(prodYear,10), modelYear);

    var html = `<table class="table"><tbody>`;
    html += explainField('País (1–2)', country, 'Código do país (letras). ' + (isLetters(country)?'Formato OK. (Format OK)':'Inválido. (Invalid)'), isLetters(country));
    html += explainField('Fabricante (3–5)', maker, 'Código do fabricante (letras). ' + (isLetters(maker)?'Formato OK. (Format OK)':'Inválido. (Invalid)'), isLetters(maker));
    html += explainField('Série (6–12)', serie, 'Número de série (7 dígitos). ' + (isDigits(serie)?'Formato OK. (Format OK)':'Inválido. (Invalid)'), isDigits(serie));
    html += explainField('Mês prod. (13)', monthL, monthsMap[monthL] || 'Letra inválida para mês (Invalid month letter)', monthOk);
    html += explainField('Ano prod. (14)', prodYear, `Provável ${years.prod} (alternativas 199${prodYear} ou 200${prodYear}).`, /^\d$/.test(prodYear));
    html += explainField('Ano modelo (15–16)', modelYear, `${years.coherent? 'Provável' : 'Possível (incoerência com ano de produção)'} ${years.model} (alternativas 19${modelYear} ou 20${modelYear}).`, /^\d{2}$/.test(modelYear));
    html += `</tbody></table>`;

    if(!hasHyphenBetween2and3){
      details.push('Aviso: recomenda-se hífen entre pos.2 e 3 (ex.: FR-CNB…).');
    }

    return { ok: ok && details.length===0, format, html, details, years };
  }

  // Fallback
  return { ok:false, format:'', html:'', details:['Formato desconhecido. (Unknown format)'], years:null };
}

function fileToDataURL(file){
  return new Promise((resolve, reject)=>{
    if(!file){ resolve(null); return; }
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

document.getElementById('winForm').addEventListener('submit', async (e)=>{
  e.preventDefault();
  const input = document.getElementById('winInput').value;
  const photoFile = document.getElementById('winPhoto').files[0];
  const dataUrl = await fileToDataURL(photoFile);

  const res = validateWIN(input);
  // Rule: pre-1998 requires Conformity Certificate (BV/Notified Body)
  const cert = document.getElementById('winCert')?.checked ?? false;
  let enforcedOk = res.ok;
  let pre1998 = false;
  if(res.years){
    pre1998 = ((res.years.prod && res.years.prod < 1998) || (res.years.model && res.years.model < 1998)) ? true : false;
  }
  // Show/hide certificate UI
  toggleCertLine(pre1998);
  if(pre1998 && !cert){
    enforcedOk = false;
    res.details = res.details || [];
    res.details.push('Pré-1998: requer Certificado/Declaração de Conformidade (requires Conformity Certificate) — ex.: Bureau Veritas.');
    setWinBadge('warn','⚠️ Pré-1998 — requer certificado');
  } else if(pre1998 && cert){
    res.details = res.details || [];
    res.details.push('Pré-1998: Certificado de Conformidade assinalado.');
    setWinBadge('ok','✔️ Pré-1998 — certificado indicado');
  } else {
    setWinBadge('', '');
  }
  // Capture optional certificate meta only if visible
  const certNumber = document.getElementById('certNumber')?.value?.trim() || '';
  const certIssuer = document.getElementById('certIssuer')?.value?.trim() || '';
  if(pre1998 && (certNumber || certIssuer)){
    res.details = res.details || [];
    res.details.push(`Certificado: ${certNumber || '—'} • Entidade: ${certIssuer || '—'}`);
  }
  const resultDiv = document.getElementById('winResult');
  resultDiv.className = 'result ' + (enforcedOk ? 'ok' : 'bad');

  const detailsHtml = res.details.length ? `<ul>${res.details.map(d=>`<li>⚠️ ${d}</li>`).join('')}</ul>` : '<p>Sem advertências.</p>';
  resultDiv.innerHTML = `
    <p><b>Formato:</b> ${res.format || '—'}</p>
    ${res.html}
    <h4>Observações</h4>
    ${detailsHtml}
  `;

  // Save to history
  const now = new Date().toISOString();
  const item = {
    ts: now, win: input, ok: enforcedOk,
    details: res.details.join(' | ') || 'Válido',
    certNumber: certNumber || null,
    certIssuer: certIssuer || null,
    photo: dataUrl || null
  };
  const key = 'hist_win';
  const list = JSON.parse(localStorage.getItem(key) || '[]');
  list.unshift(item);
  localStorage.setItem(key, JSON.stringify(list));

  // Forensic (optional)
  if(typeof window.showWinForense === 'function'){
    window.showWinForense(input);
  }
});
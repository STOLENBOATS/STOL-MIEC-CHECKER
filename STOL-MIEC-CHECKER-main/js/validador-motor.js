// Dynamic brand fields and simple brand-specific validation for Yamaha/Honda.
// Forensic/visual expansion can be added later without breaking API.
const brandSelect = document.getElementById('brand');
const brandFieldsDiv = document.getElementById('brandFields');

// Brand registry: defines fields per brand and status (active/partial)
const BRAND_REGISTRY = {
  'Yamaha': {
    status: 'active',
    fields: [      {id:'yam_model', label:'Modelo', en:'Model', type:'text', ph:'ex.: F115BETX'},
      {id:'yam_code', label:'Código', en:'Code', type:'text', ph:'ex.: 6D0'},
      {id:'yam_letter', label:'Letra', en:'Letter', type:'text', ph:'ex.: A'},
      {id:'yam_sn', label:'N.º Série', en:'Serial number', type:'text', ph:'ex.: 1001234'}]
  },
  'Honda': {
    status: 'active',
    fields: [      {id:'hon_model', label:'Modelo', en:'Model', type:'text', ph:'ex.: BF90D'},
      {id:'hon_frame', label:'Frame/Código', en:'Frame/Code', type:'text', ph:'ex.: BBAL'},
      {id:'hon_sn', label:'N.º Série', en:'Serial number', type:'text', ph:'ex.: 1400123'}]
  },
  'Mercury': {
    status: 'active',
    fields: [      {id:'mer_model', label:'Modelo', en:'Model', type:'text', ph:'ex.: F60ELPT'},
      {id:'mer_sn', label:'N.º Série', en:'Serial number', type:'text', ph:'ex.: 1B123456'},
      {id:'mer_notes', label:'Notas', en:'Notes', type:'text'}]
  },
  'Suzuki': {
    status: 'active',
    fields: [      {id:'suz_model', label:'Modelo', en:'Model', type:'text', ph:'ex.: DF90A'},
      {id:'suz_sn', label:'N.º Série', en:'Serial number', type:'text', ph:'ex.: 1234567'}]
  },
  'Volvo Penta': {
    status: 'active',
    fields: [      {id:'vol_model', label:'Modelo', en:'Model', type:'text', ph:'ex.: D4-260 / 5.7GXi / V6-240'},
      {id:'vol_prod', label:'N.º Produto (P/N)', en:'Product No', type:'text', ph:'ex.: 875814'},
      {id:'vol_sn', label:'N.º Série', en:'Serial number', type:'text', ph:'ex.: 2201234567'}]
  },
  'Evinrude': {
    status: 'partial',
    fields: [      {id:'evi_model', label:'Modelo', en:'Model', type:'text', ph:'ex.: E90DPXSUR'},
      {id:'evi_type', label:'Tipo/BOM', en:'Type/BOM', type:'text', ph:'ex.: 05123456'},
      {id:'evi_sn', label:'N.º Série', en:'Serial number', type:'text', ph:'ex.: 1234567'}]
  },
  'Selva': {
    status: 'partial',
    fields: [      {id:'sel_model', label:'Modelo', en:'Model', type:'text', ph:'ex.: Dorado 100'},
      {id:'sel_sn', label:'N.º Série', en:'Serial number', type:'text', ph:'ex.: 123456'}]
  },
  'Tohatsu': {
    status: 'partial',
    fields: [      {id:'toh_model', label:'Modelo', en:'Model', type:'text', ph:'ex.: M90A'},
      {id:'toh_sn', label:'N.º Série', en:'Serial number', type:'text', ph:'ex.: 123456'}]
  }
};


function renderFields(brand){
  const meta = BRAND_REGISTRY[brand];
  // Reset
  brandFieldsDiv.innerHTML = '';
  if(!brand){ return; }
  if(!meta){
    brandFieldsDiv.innerHTML = `<div class="result bad">Marca desconhecida. (Unknown brand)</div>`;
    return;
  }
  if(meta.status !== 'active'){
    brandFieldsDiv.innerHTML = `<div class="result bad"><b>Aviso:</b> Validação formal para <b>${brand}</b> ainda não está ativa. <span class="sub-en">(Validation pending)</span></div>`;
  }
  // Build fields
  const frag = document.createDocumentFragment();
  (meta.fields||[]).forEach(f=>{
    const lab = document.createElement('label');
    lab.setAttribute('for', f.id);
    lab.innerHTML = `<b>${f.label}</b><span class="sub-en">( ${f.en} )</span>`;
    const inp = document.createElement('input');
    inp.id = f.id; inp.type = f.type || 'text';
    inp.placeholder = f.ph || (f.en ? `${f.label} / ${f.en}` : f.label);
    frag.appendChild(lab);
    frag.appendChild(inp);
  });
  brandFieldsDiv.appendChild(frag);
}

brandSelect.addEventListener('change', e=> renderFields(e.target.value));

function validateMotor(payload){
  // Very basic structure checks; extend later with forensic matrices.
  const { brand } = payload;
  const details = [];
  let ok = true;

  if(brand==='Yamaha'){
    payload.model = (payload.yam_model||'').toUpperCase();
    payload.code = (payload.yam_code||'').toUpperCase();
    payload.letter = (payload.yam_letter||'').toUpperCase();
    payload.sn = (payload.yam_sn||'').trim();
    const { model, code, letter, sn } = payload;
    if(!/^[A-Z0-9]{3,}$/.test(model)) { ok=false; details.push('Modelo Yamaha com formato inesperado.'); }
    if(!/^[A-Z0-9]{2,4}$/.test(code)) { ok=false; details.push('Código Yamaha com formato inesperado.'); }
    if(!/^[A-HJ-NPR-Z]$/.test(letter)) { ok=false; details.push('Letra inválida (evitar I, O, Q).'); }
    if(!/^\d{5,8}$/.test(sn)) { ok=false; details.push('N.º de série deve ter 5–8 dígitos.'); }

    const interp = `Modelo ${model}, código ${code}, letra ${letter}, série ${sn}.`;
    return { ok, interp, details };

  
  } else if(brand==='Mercury'){
    // Accept common Mercury formats: pure digits (8–10) or digit+letter prefix + digits
    payload.model = (payload.mer_model||'').toUpperCase();
    payload.sn = (payload.mer_sn||'').toUpperCase();
    const sn = payload.sn;
    let patternOk = /^\d{8,10}$/.test(sn) || /^\d[A-Z]\d{6,8}$/.test(sn);
    if(!patternOk){ ok=false; details.push('N.º de série Mercury com formato inesperado. (Unexpected Mercury S/N format)'); }
    // Year approximation from prefix (heuristic)
    let yearHint = '';
    const prefix = sn.slice(0,2);
    const map = { '0C':'1990–1993', '0D':'1993–1994', '0G':'1995–1996', '0T':'1996–1999', '1A':'2002–2004', '1B':'2005–2006', '1C':'2006–2007' };
    if(/^[01][A-Z]$/.test(prefix) && map[prefix]){ yearHint = map[prefix]; }
    const interp = `Modelo ${payload.model || '—'}, série ${sn}${yearHint?` (aprox. ${yearHint})`:''}.`;
    return { ok, interp, details };

  } else if(brand==='Honda'){
    payload.model = (payload.hon_model||'');
    payload.frame = (payload.hon_frame||'');
    payload.sn = (payload.hon_sn||'');
    const { model, frame, sn } = payload;
    if(!/^BF?\d{2,3}[A-Z0-9]*$/i.test(model)) { ok=false; details.push('Modelo Honda com formato inesperado.'); }
    if(!/^[A-Z0-9\-]{3,}$/.test(frame)) { ok=false; details.push('Frame/Code com formato inesperado.'); }
    if(!/^\d{5,8}$/.test(sn)) { ok=false; details.push('N.º de série deve ter 5–8 dígitos.'); }
    const interp = `Modelo ${model}, frame ${frame}, série ${sn}.`;
    return { ok, interp, details };
  }

  return { ok:false, interp:'Marca não suportada.', details:['Selecione Yamaha ou Honda.'] };
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

document.getElementById('motorForm').addEventListener('submit', async (e)=>{
  e.preventDefault();
  const brand = brandSelect.value;
  if(!brand){ alert('Selecione a marca. / Please select a brand.'); return; }
  const isSoon = (BRAND_REGISTRY[brand]?.status !== 'active');

  let payload = { brand };
  const meta = BRAND_REGISTRY[brand];
  if(meta){
    meta.fields.forEach(f=>{
      const el = document.getElementById(f.id);
      if(el){ payload[f.id] = el.value.trim(); }
    });
  }
  if(isSoon){
    payload.model = (document.getElementById('gen_model')||{value:''}).value.trim();
    payload.sn = (document.getElementById('gen_sn')||{value:''}).value.trim();
  }
  if(brand==='Yamaha'){
    payload.model = (payload.yam_model||'').toUpperCase();
    payload.code = (payload.yam_code||'').toUpperCase();
    payload.letter = (payload.yam_letter||'').toUpperCase();
    payload.sn = document.getElementById('yam_sn').value.trim();
  
  } else if(brand==='Mercury'){
    // Accept common Mercury formats: pure digits (8–10) or digit+letter prefix + digits
    payload.model = (payload.mer_model||'').toUpperCase();
    payload.sn = (payload.mer_sn||'').toUpperCase();
    const sn = payload.sn;
    let patternOk = /^\d{8,10}$/.test(sn) || /^\d[A-Z]\d{6,8}$/.test(sn);
    if(!patternOk){ ok=false; details.push('N.º de série Mercury com formato inesperado. (Unexpected Mercury S/N format)'); }
    // Year approximation from prefix (heuristic)
    let yearHint = '';
    const prefix = sn.slice(0,2);
    const map = { '0C':'1990–1993', '0D':'1993–1994', '0G':'1995–1996', '0T':'1996–1999', '1A':'2002–2004', '1B':'2005–2006', '1C':'2006–2007' };
    if(/^[01][A-Z]$/.test(prefix) && map[prefix]){ yearHint = map[prefix]; }
    const interp = `Modelo ${payload.model || '—'}, série ${sn}${yearHint?` (aprox. ${yearHint})`:''}.`;
    return { ok, interp, details };

  } else if(brand==='Honda'){
    payload.model = document.getElementById('hon_model').value.toUpperCase().trim();
    payload.frame = document.getElementById('hon_frame').value.toUpperCase().trim();
    payload.sn = document.getElementById('hon_sn').value.trim();
  }

  const photoFile = document.getElementById('motorPhoto').files[0];
  const dataUrl = await fileToDataURL(photoFile);

  const res = isSoon ? { 
    ok:false, 
    interp:`Registo para ${brand}.`, 
    details:[`Validação ${brand} em breve. (Validation pending)`] 
  } : validateMotor(payload);
  const div = document.getElementById('motorResult');
  div.className = 'result ' + (res.ok ? 'ok' : 'bad');
  const detailsHtml = res.details.length ? `<ul>${res.details.map(d=>`<li>⚠️ ${d}</li>`).join('')}</ul>` : '<p>Sem advertências.</p>';
  div.innerHTML = `
    <p><b>Marca:</b> ${brand}</p>
    <p>${res.interp}</p>
    <h4>Observações</h4>
    ${detailsHtml}
  `;

  // Save to history
  const now = new Date().toISOString();
  const key = 'hist_motor';
  const item = {
    ts: now, brand, model: payload.model || '', sn: payload.sn || '', ok: res.ok,
    details: res.details.join(' | ') || 'Válido', photo: dataUrl || null
  };
  const list = JSON.parse(localStorage.getItem(key) || '[]');
  list.unshift(item);
  localStorage.setItem(key, JSON.stringify(list));

  // Forensic (optional)
  if(typeof window.showMotorForense === 'function'){
    window.showMotorForense(payload);
  }
});

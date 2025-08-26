(function(){
  const $ = (s, r=document) => r.querySelector(s);
  const $$ = (s, r=document) => Array.from(r.querySelectorAll(s));

  const brandSelect = $('#motorBrand');
  const fieldsBox   = $('#brandFields');
  const btnValidate = $('#btnValidateMotor');
  const resultBox   = $('#motorResult');

  if(!brandSelect || !fieldsBox || !btnValidate) return;

  const BRANDS = {
    Yamaha: {
      fields: [
        { name:'model', label:'Modelo (ex.: F350NSA)', type:'text', placeholder:'F350NSA', required:true },
        { name:'code',  label:'Código/Prefixo (ex.: 6ML)', type:'text', placeholder:'6ML', required:false },
        { name:'serial',label:'Nº de Série', type:'text', placeholder:'ex.: 1005843', required:true },
        { name:'photo', label:'Fotografia (opcional)', type:'file', accept:'image/*', required:false }
      ],
      validate: (v) => {
        const issues = [];
        if(!/^\w{3,12}$/i.test(v.model||'')) issues.push('Modelo deve ser alfanumérico (3–12).');
        if(v.code && !/^\w{2,6}$/i.test(v.code)) issues.push('Código deve ser alfanumérico (2–6).');
        if(!/^\d{5,9}$/.test(v.serial||'')) issues.push('Nº de série deve ter 5–9 dígitos.');
        return issues;
      }
    },
    Honda: {
      fields: [
        { name:'model', label:'Modelo (ex.: BF150)', type:'text', placeholder:'BF150', required:true },
        { name:'serial',label:'Nº de Série', type:'text', placeholder:'ex.: 1234567', required:true },
        { name:'photo', label:'Fotografia (opcional)', type:'file', accept:'image/*', required:false }
      ],
      validate: (v) => {
        const issues = [];
        if(!/^[A-Z]{1,3}\d{2,3}[A-Z]?$/i.test(v.model||'')) issues.push('Modelo esperado ex.: BF150, BF90D…');
        if(!/^\d{5,9}$/.test(v.serial||'')) issues.push('Nº de série deve ter 5–9 dígitos.');
        return issues;
      }
    }
  };

  function fieldToHTML(f){
    const base = `<div class="form-row">\n <label for="f_${f.name}"><strong>${f.label}</strong></label>`;
    if(f.type === 'file'){
      return base + `\n <input id="f_${f.name}" name="${f.name}" type="file" class="input" ${f.accept?`accept="${f.accept}"`:''} ${f.required?'required':''}/>\n</div>`;
    }
    return base + `\n <input id="f_${f.name}" name="${f.name}" type="${f.type||'text'}" class="input" placeholder="${f.placeholder||''}" ${f.required?'required':''}/>\n</div>`;
  }

  function onBrandChange(){
    const brand = brandSelect.value;
    fieldsBox.innerHTML = '';
    resultBox.textContent = '';
    if(!brand || !BRANDS[brand]) return;
    fieldsBox.innerHTML = BRANDS[brand].fields.map(fieldToHTML).join('');
  }

  async function readFileDataUrl(input){
    return new Promise((res, rej)=>{
      if(!input || !input.files || !input.files[0]) return res('');
      const fr = new FileReader();
      fr.onload = () => res(fr.result);
      fr.onerror = rej;
      fr.readAsDataURL(input.files[0]);
    });
  }

  async function onValidate(){
    const brand = brandSelect.value;
    if(!brand || !BRANDS[brand]){
      resultBox.innerHTML = '<span class="badge err">Selecione uma marca suportada.</span>';
      return;
    }
    const spec = BRANDS[brand];
    const values = {};
    for(const f of spec.fields){
      const el = document.getElementById(`f_${f.name}`);
      if(!el) continue;
      if(f.type === 'file') values[f.name] = await readFileDataUrl(el);
      else values[f.name] = (el.value||'').trim();
    }

    const issues = spec.validate(values);
    if(issues.length){
      resultBox.innerHTML = `<span class="badge err">Inválido</span>\n<ul>${issues.map(i=>`<li>${i}</li>`).join('')}</ul>`;
    } else {
      resultBox.innerHTML = `<span class="badge ok">Válido (sintaxe)</span>\n<p class="cell-muted">Nota: validação sintática. A confirmação forense/visual deve ser efetuada com a chapa/etiqueta e bases oficiais.</p>`;
    }

    // Registo simples no histórico canónico
    try {
      const CANON_KEY = 'miec_history_motor';
      const arr = JSON.parse(localStorage.getItem(CANON_KEY)||'[]');
      arr.push({
        ts: Date.now(),
        brand,
        ident: [values.model, values.code, values.serial].filter(Boolean).join(' '),
        result: issues.length ? 'Inválido' : 'Válido',
        reason: issues.join(' / '),
        photo: values.photo || ''
      });
      localStorage.setItem(CANON_KEY, JSON.stringify(arr));
    } catch(err){ /* quota or storage error */ }
  }

  brandSelect.addEventListener('change', onBrandChange);
  btnValidate.addEventListener('click', onValidate);
  onBrandChange();
})();
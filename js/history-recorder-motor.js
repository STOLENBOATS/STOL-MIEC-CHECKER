// MIEC — history-recorder-motor.js v1
(function(){
  const SEL = {
    brand: ['#motorBrand','select[name="brand"]','[data-field="brand"]'],
    model: ['#f_model','input[name="model"]','[data-field="model"]'],
    code:  ['#f_code','input[name="code"]','[data-field="code"]'],
    serial:['#f_serial','input[name="serial"]','input[name*="serial" i]','[data-field="serial"]'],
    validateBtn: ['#btnValidateMotor','.btn-validate-motor','#btnValidarMOTOR','button[name="validateMotor"]'],
    resultBox: ['#motorResult','.motor-result','.result-motor','.resultado-motor'],
    reasonBox: ['#motorReason','.motor-reason','.interpretation','.details','.justificacao'],
    photoInput: ['#motorPhoto','#fotoMotor','input[type="file"][name*="motor" i]','input[type="file"][accept*="image" i]'],
    photoPreview: ['#motorPreview','img#previewMotor','.motor-photo-preview img','img.preview-motor']
  };

  function $(sel, root=document){
    if(!sel) return null;
    if(Array.isArray(sel)){
      for(const s of sel){ const el = root.querySelector(s); if(el) return el; }
      return null;
    }
    return root.querySelector(sel);
  }
  function text(el){ return (el && ('innerText' in el ? el.innerText : el.textContent) || '').trim(); }

  function valOrText(sel){
    const el = $(sel);
    if(!el) return '';
    return ('value' in el ? el.value : text(el)).trim();
  }

  async function fileToDataUrl(file){
    return new Promise((res, rej)=>{
      const fr = new FileReader();
      fr.onload = () => res(fr.result);
      fr.onerror = rej;
      fr.readAsDataURL(file);
    });
  }

  function compressDataUrl(dataUrl, maxW=1024, quality=0.85){
    return new Promise((resolve)=>{
      if(!/^data:image\//i.test(dataUrl)) return resolve(dataUrl);
      const img = new Image();
      img.onload = () => {
        const scale = img.width > maxW ? (maxW / img.width) : 1;
        const w = Math.round(img.width * scale);
        const h = Math.round(img.height * scale);
        const canvas = document.createElement('canvas');
        canvas.width = w; canvas.height = h;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, w, h);
        try {
          const out = canvas.toDataURL('image/jpeg', quality);
          resolve(out);
        } catch(e){
          resolve(dataUrl);
        }
      };
      img.onerror = () => resolve(dataUrl);
      img.src = dataUrl;
    });
  }

  async function readPhotoDataUrl(){
    const fileEl = $(SEL.photoInput);
    if(fileEl && fileEl.files && fileEl.files[0]){
      const dataUrl = await fileToDataUrl(fileEl.files[0]);
      return await compressDataUrl(dataUrl, 1024, 0.85);
    }
    const img = $(SEL.photoPreview);
    if(img && img.src){
      if(/^data:image\//i.test(img.src)) return img.src;
      return img.src;
    }
    return '';
  }

  function getResult(){
    const box = $(SEL.resultBox);
    const t = text(box).toLowerCase();
    if(/inv[aá]l/i.test(t)) return 'Inválido';
    if(/v[aá]lid/i.test(t)) return 'Válido';
    return (t || '').substring(0, 40) || '';
  }

  function getReason(){
    return text($(SEL.reasonBox));
  }

  function buildIdent(model, code, serial){
    return [model, code, serial].filter(Boolean).join(' ').trim();
  }

  async function captureAndSave(){
    const brand = valOrText(SEL.brand);
    const model = valOrText(SEL.model);
    const code  = valOrText(SEL.code);
    const serial= valOrText(SEL.serial);
    const ident = buildIdent(model, code, serial);
    if(!brand || !ident) return;

    const result = getResult();
    const reason = getReason();
    const photo = await readPhotoDataUrl();

    const payload = { ts: Date.now(), brand, ident, result, reason, photo, version: window.APP_VERSION, device: navigator.userAgent };

    if(window.HistoryService && HistoryService.saveMotor){
      HistoryService.saveMotor(payload);
    } else {
      const key = 'miec_history_motor';
      let arr = []; try { arr = JSON.parse(localStorage.getItem(key)) || []; } catch {}
      arr.push(payload); try { localStorage.setItem(key, JSON.stringify(arr)); } catch {}
    }
  }

  function hook(){
    const btn = $(SEL.validateBtn);
    if(btn && !btn.__miec_hooked){
      btn.__miec_hooked = true;
      btn.addEventListener('click', () => setTimeout(captureAndSave, 300));
    }
  }

  document.addEventListener('validation:motor:done', async (ev) => {
    const d = ev && ev.detail || {};
    const payload = {
      ts: Date.now(),
      brand: d.brand || valOrText(SEL.brand),
      ident: d.ident || buildIdent(valOrText(SEL.model), valOrText(SEL.code), valOrText(SEL.serial)),
      result: d.result || getResult(),
      reason: d.reason || getReason(),
      photo: d.photoDataUrl || await readPhotoDataUrl(),
      version: window.APP_VERSION,
      device: navigator.userAgent
    };
    if(window.HistoryService && HistoryService.saveMotor) HistoryService.saveMotor(payload);
    else {
      const key = 'miec_history_motor';
      let arr = []; try { arr = JSON.parse(localStorage.getItem(key)) || []; } catch {}
      arr.push(payload); try { localStorage.setItem(key, JSON.stringify(arr)); } catch {}
    }
  });

  function boot(){ hook(); }
  if(document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot);
  else boot();
})();
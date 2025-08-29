// photo-capture.r1.js — ativa câmara e comprime imagem localmente
(function(){
  function ready(cb){ document.readyState==='complete'?cb():addEventListener('load',cb,{once:true}); }
  ready(()=>{
    const inputs = ['winPhoto','motorPhoto'].map(id=>document.getElementById(id)).filter(Boolean);
    if(!inputs.length) return;
    inputs.forEach(inp => {
      // preferir câmara traseira em mobile
      inp.setAttribute('accept','image/*');
      inp.setAttribute('capture','environment');
      inp.addEventListener('change', async () => {
        const f = inp.files && inp.files[0]; if(!f) return;
        try{
          const out = await compressImage(f, 1600, 1200, 0.75);
          const dt = new DataTransfer();
          dt.items.add(out);
          inp.files = dt.files;
          // dispara evento para qualquer listener de upload
          inp.dispatchEvent(new Event('miec:photo:compressed'));
        }catch(e){ console.warn('[photo-capture] compress failed', e); }
      });
    });
  });

  function compressImage(file, maxW, maxH, quality){
    return new Promise((resolve,reject)=>{
      const img = new Image();
      const url = URL.createObjectURL(file);
      img.onload = ()=>{
        let {width:w, height:h} = img;
        const ratio = Math.min(maxW/w, maxH/h, 1);
        const cw = Math.round(w*ratio), ch = Math.round(h*ratio);
        const canvas = document.createElement('canvas');
        canvas.width = cw; canvas.height = ch;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, cw, ch);
        canvas.toBlob(blob=>{
          if(!blob) return reject(new Error('blob null'));
          const out = new File([blob], file.name.replace(/\.(\w+)?$/i,'.jpg'), {type:'image/jpeg', lastModified: Date.now()});
          URL.revokeObjectURL(url);
          resolve(out);
        }, 'image/jpeg', quality);
      };
      img.onerror = reject;
      img.src = url;
    });
  }
})();

/*! photo-capture.r1.js — câmara mobile + compressão de imagens */
(function(){
  function ready(cb){ document.readyState==='complete'?cb():addEventListener('load',cb,{once:true}); }
  ready(()=>{
    ['winPhoto','motorPhoto'].forEach(id=>{
      const inp=document.getElementById(id); if(!inp) return;
      inp.setAttribute('accept','image/*'); inp.setAttribute('capture','environment');
      inp.addEventListener('change', async ()=>{
        const f=inp.files && inp.files[0]; if(!f) return;
        try{
          const out=await compress(f,1600,1200,0.75);
          const dt=new DataTransfer(); dt.items.add(out); inp.files=dt.files;
          inp.dispatchEvent(new Event('miec:photo:compressed'));
        }catch(e){ console.warn('[photo-capture] falhou:', e); }
      });
    });
  });
  function compress(file,maxW,maxH,quality){
    return new Promise((resolve,reject)=>{
      const img=new Image(), url=URL.createObjectURL(file);
      img.onload=()=>{
        const r=Math.min(maxW/img.width, maxH/img.height, 1), w=Math.round(img.width*r), h=Math.round(img.height*r);
        const c=document.createElement('canvas'); c.width=w; c.height=h;
        c.getContext('2d').drawImage(img,0,0,w,h);
        c.toBlob(b=>{ if(!b) return reject(new Error('blob null'));
          URL.revokeObjectURL(url);
          resolve(new File([b], file.name.replace(/\.(\w+)?$/i,'.jpg'), {type:'image/jpeg', lastModified: Date.now()}));
        }, 'image/jpeg', quality);
      };
      img.onerror=reject; img.src=url;
    });
  }
})();

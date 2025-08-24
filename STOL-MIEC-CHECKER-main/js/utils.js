function fmtDate(d){if(!(d instanceof Date))d=new Date(d);return d.toLocaleString()}
function saveToLS(key, arr){localStorage.setItem(key, JSON.stringify(arr))}
function loadFromLS(key){try{return JSON.parse(localStorage.getItem(key)||"[]")}catch(e){return[]}}
function downloadCSV(filename, rows){const esc=v=>('"'+String(v).replaceAll('"','""')+'"'); const csv=rows.map(r=>r.map(esc).join(',')).join('\n'); const blob=new Blob([csv],{type:'text/csv'}); const a=document.createElement('a'); a.href=URL.createObjectURL(blob); a.download=filename; a.click();}
function readFileAsDataURL(file){return new Promise((res,rej)=>{const fr=new FileReader(); fr.onload=()=>res(fr.result); fr.onerror=rej; fr.readAsDataURL(file);});}

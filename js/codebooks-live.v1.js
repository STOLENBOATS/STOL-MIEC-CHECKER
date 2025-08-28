/*! MIEC codebooks-live.v1.js (r1)
   Carrega codebooks (countries, manufacturers) e expõe helpers.
   Uso:
     await MIEC_CODEBOOKS.load();                 // carrega JSON
     MIEC_CODEBOOKS.countryName('FR','pt');      // "França"
     MIEC_CODEBOOKS.micName('FR','CNB');         // "Chantiers ..."
*/
(function(){
  const API = {
    _data: null,
    async load(url){
      const href = url || 'data/codebook.json?v=r1';
      try{
        const res = await fetch(href, {cache:'no-store'});
        if (!res.ok) throw new Error('HTTP ' + res.status);
        API._data = await res.json();
        console.log('[codebooks] loaded v%s', API._data.version||'?');
        return true;
      }catch(e){
        console.warn('[codebooks] load failed, using fallback:', e);
        API._data = API._data || {countries:{},manufacturers_cin:{},engine_brands:[]};
        return false;
      }
    },
    countryName(cc, lang){
      const d = API._data && API._data.countries && API._data.countries[(cc||'').toUpperCase()];
      if (!d) return null;
      return d[lang||'pt'] || d.pt || Object.values(d)[0];
    },
    micName(cc, mic){
      cc = (cc||'').toUpperCase(); mic = (mic||'').toUpperCase();
      const key = cc + '|' + mic;
      const m = API._data && API._data.manufacturers_cin && API._data.manufacturers_cin[key];
      return m || null;
    },
    listEngineBrands(){
      return (API._data && API._data.engine_brands) ? API._data.engine_brands.slice() : [];
    }
  };
  window.MIEC_CODEBOOKS = API;
})();
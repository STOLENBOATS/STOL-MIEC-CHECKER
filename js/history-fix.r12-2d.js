/*! MIEC minimal history hotfix • r12-2d
 * - No CDN injection
 * - No thumbs toggle
 * - Only de-duplicates header buttons and avoids breaking existing logic
 * Safe to include at the very end of historico_*.html
 */
(function(){
  try{
    // Run after DOM is ready
    if (document.readyState === 'loading'){
      document.addEventListener('DOMContentLoaded', init, { once:true });
    } else {
      init();
    }
  }catch(e){
    console.warn('[history-fix] init wrapper error:', e);
  }

  function init(){
    try{
      // 1) De-dup header actions (keep first occurrence of each logical button)
      const header = document.querySelector('.app-header .header-actions') || document.querySelector('.header-actions');
      if (header){
        const seen = new Set();
        const items = Array.from(header.children);
        for(const el of items){
          const tag = el.tagName.toLowerCase();
          if (tag !== 'a' && tag !== 'button') continue;
          const key = (el.textContent || '').trim() + '|' + (el.getAttribute('href')||'') + '|' + (el.id||'');
          if (seen.has(key)){
            el.remove();
          } else {
            seen.add(key);
          }
        }
      }

      // 2) If theme toggle exists duplicated, keep the first
      const themeBtns = document.querySelectorAll('#themeBtn');
      if (themeBtns.length > 1){
        themeBtns.forEach((b,i)=>{ if(i>0) b.remove(); });
      }

      // 3) Guard against accidental global leaks that could shadow app vars
      // (we do not create globals; everything is scoped inside IIFE)

      // Debug ping (small and harmless)
      console.log('[history-fix r12-2d] active. header dedup done:', !!header);
    }catch(e){
      console.warn('[history-fix] runtime error:', e);
    }
  }
})();
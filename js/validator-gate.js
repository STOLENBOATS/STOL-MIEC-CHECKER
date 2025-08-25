/* validator-gate.js (v420b debug)
   Early gate for validador.html with optional debug/hold:
   - ?debug=1 → verbose logs + on-screen overlay
   - ?hold=ms → wait N ms before redirect/continue (e.g., hold=3000)
*/
(function(){
  var Q = new URLSearchParams(location.search);
  var DEBUG = Q.has('debug');
  var HOLD = parseInt(Q.get('hold')||'0',10)||0;

  function log(){ try{ if (DEBUG) console.log.apply(console, ['[gate]'].concat([].slice.call(arguments))); }catch(_){} }
  function overlay(msg){
    if (!DEBUG) return;
    var el = document.getElementById('gate-overlay');
    if (!el){
      el = document.createElement('div');
      el.id = 'gate-overlay';
      el.style.cssText = 'position:fixed;z-index:999999;top:8px;right:8px;max-width:48vw;background:#111827;color:#E5E7EB;padding:10px 12px;border-radius:8px;box-shadow:0 6px 18px rgba(0,0,0,.25);font:12px/1.45 ui-monospace, SFMono-Regular, Menlo, Consolas, monospace;white-space:pre-wrap';
      document.body.appendChild(el);
    }
    el.textContent = msg;
  }

  function add(src){
    return new Promise(function(res, rej){
      var s = document.createElement('script'); s.src = src; s.defer = true;
      s.onload = res; s.onerror = rej; document.head.appendChild(s);
    });
  }
  async function ensureCore(){
    if (!window.supabase){ log('load sdk'); await add("https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2.56.0"); }
    if (!(window.SUPABASE_URL && window.SUPABASE_ANON_KEY)){ log('load config'); await add("js/config.js?v=418"); }
    if (!window.SupaAuth){ log('load supa.js'); await add("js/supa.js?v=418"); }
  }
  async function ready(fn){
    const t0 = Date.now();
    while (!(window.SupaAuth && window.SupaAuth[fn]) && Date.now()-t0 < 5000){
      await new Promise(r=>setTimeout(r, 20));
    }
    return !!(window.SupaAuth && window.SupaAuth[fn]);
  }
  function cleanUrl(){
    try{
      var base = location.pathname + (/\?/.test(location.search) ? location.search.replace(/([?#].*)/,'') : "?v=418");
      history.replaceState({}, "", base);
    }catch(_){}
  }
  async function sleep(ms){ return new Promise(r=>setTimeout(r, ms)); }

  async function gate(){
    try{
      overlay('gate: boot…');
      await ensureCore();
      if (!await ready("finalizeFromUrl")) throw new Error("auth-not-ready");
      overlay('gate: finalizeFromUrl…');
      log('finalizeFromUrl start');
      await window.SupaAuth.finalizeFromUrl({ storeSession: true, persistSession: true });
      log('finalizeFromUrl done');
      cleanUrl();

      // let storage settle
      await sleep(25);
      let sess = (await window.SupaAuth.getSession()).data?.session;
      if (!sess){ await sleep(250); sess = (await window.SupaAuth.getSession()).data?.session; }
      overlay('gate: session ' + (sess ? 'OK' : 'MISSING'));

      if (HOLD){ overlay('gate: hold '+HOLD+'ms'); await sleep(HOLD); }

      if (!sess){
        overlay('gate: redirect → login');
        location.replace("login.html?v=418");
        return;
      }
      overlay('gate: stay on validador ✓');
      try{ document.dispatchEvent(new CustomEvent("supa:ready")); }catch(_){}
    }catch(e){
      console.warn("[validator-gate]", e);
      overlay('gate: ERROR '+(e?.message||e));
      if (HOLD){ await sleep(HOLD); }
      try{ cleanUrl(); }catch(_){}
      location.replace("login.html?v=418");
    }
  }

  if (document.readyState === "loading"){
    document.addEventListener("DOMContentLoaded", gate, { once:true });
  } else {
    gate();
  }
})();
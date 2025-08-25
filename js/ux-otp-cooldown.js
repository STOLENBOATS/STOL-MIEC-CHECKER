/* js/ux-otp-cooldown.js — OTP cooldown & nicer errors (v420)
   - Wraps SupaAuth.sendEmailOtp to start a countdown on #sendOtpBtn
   - Shows remaining seconds in the button label and disables it
*/
(function(){
  function $(id){ return document.getElementById(id); }
  function secondsFromError(err){
    try{
      const m = String(err && (err.message || err.error_description || err.error) || "").match(/after\s+(\d+)\s*seconds?/i);
      return m ? parseInt(m[1],10) : 60;
    }catch(_){ return 60; }
  }
  function startCountdown(sec){
    const btn = $("sendOtpBtn");
    if (!btn) return;
    const original = btn.dataset.label || btn.textContent || "Enviar código (OTP)";
    btn.dataset.label = original;
    let s = Math.max(1, sec|0);
    btn.disabled = true;
    const tick = ()=>{
      btn.textContent = `${original.replace(/\s*\(\d+s\)$/, "")} (${s}s)`;
      if (--s < 0){
        btn.textContent = original;
        btn.disabled = false;
        clearInterval(timer);
      }
    };
    tick();
    const timer = setInterval(tick, 1000);
  }

  async function wrapOnce(){
    if (!window.SupaAuth || window.__OTP_COOLDOWN_WRAP__) return;
    window.__OTP_COOLDOWN_WRAP__ = true;

    const orig = window.SupaAuth.sendEmailOtp;
    if (typeof orig !== "function") return;

    window.SupaAuth.sendEmailOtp = async function(email){
      try{
        const res = await orig.call(window.SupaAuth, email);
        // success → typical rate-limit still applies; start a cooldown (e.g., 60s)
        startCountdown(60);
        return res;
      }catch(e){
        // If 429 or similar, parse suggested seconds and start countdown
        const sec = secondsFromError(e);
        startCountdown(sec);
        throw e;
      }
    };
  }

  // Try now and again on readiness
  document.addEventListener("DOMContentLoaded", wrapOnce);
  document.addEventListener("supa:ready", wrapOnce);
})();

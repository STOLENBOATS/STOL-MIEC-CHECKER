/*! history-fix.r12-2g.js — Minimal hotfix for history pages (WIN & Motor)
 * - Dedup header actions (Voltar ao Validador, Sair, toggles)
 * - Absolutely NO CDN/SDK injection
 * - Safe to include once, idempotent
 */
(() => {
  if (window.__MIEC_HISTORY_FIX__) return;
  window.__MIEC_HISTORY_FIX__ = true;

  const log = (...a)=>console.log("[history-fix r12-2g]", ...a);
  const once = (fn)=>{ try{ fn(); }catch(e){ console.warn("[history-fix] warn:", e); } };

  // 1) Dedup header actions
  once(() => {
    const header = document.querySelector(".app-header .header-actions") || document.querySelector(".header-actions");
    if (!header) return log("header not found; skip dedup");

    const btns = Array.from(header.querySelectorAll("a.btn,button.btn"));
    const keepFirstByLabel = (labelTest) => {
      let seen = false;
      btns.forEach(b => {
        const t = (b.textContent||"").trim().toLowerCase();
        if (labelTest(t)) {
          if (seen) {
            b.remove();
          } else {
            seen = true;
          }
        }
      });
    };

    keepFirstByLabel(t => t.includes("voltar ao validador"));
    keepFirstByLabel(t => t === "sair" || t.includes("logout") || t.includes("terminar"));

    // Remove duplicated "Thumbs: Pequenas/Médias" if exist
    const thumbChips = Array.from(header.querySelectorAll("a.btn,button.btn"))
      .filter(b => (b.textContent||"").toLowerCase().includes("thumbs"));
    if (thumbChips.length > 1) {
      thumbChips.slice(1).forEach(n=>n.remove());
    }
  });

  // 2) Guard against accidental global syntax errors from previous experiments
  // (no-op but keeps a recognizable log)
  log("active. header dedup done.");
})();

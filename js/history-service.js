// MIEC — history-service.js (Patch #2)
// API única para gravar local + enfileirar sync (quando disponível).

(function(){
  const g = window;
  const APP_VERSION = (g.MIEC_CONFIG && g.MIEC_CONFIG.APP_VERSION) || g.APP_VERSION || 'v4.2.1-auth-min — 2025-08-26';

  const LS = {
    WIN: 'miec_history_win',
    MOTOR: 'miec_history_motor',
  };

  function parse(v, fallback){
    try { return JSON.parse(v); } catch { return fallback; }
  }
  function save(k, v){ try { localStorage.setItem(k, JSON.stringify(v)); } catch {} }

  function addLocalWin(entry){
    const arr = parse(localStorage.getItem(LS.WIN), []) || [];
    arr.push(entry);
    save(LS.WIN, arr);
  }
  function addLocalMotor(entry){
    const arr = parse(localStorage.getItem(LS.MOTOR), []) || [];
    arr.push(entry);
    save(LS.MOTOR, arr);
  }

  function saveWin(e){
    const row = {
      ts: e.ts || Date.now(),
      win: (e.win||'').trim(),
      result: e.result || '',
      reason: e.reason || '',
      photo: e.photo || '',
      version: e.version || APP_VERSION,
      device: e.device || (navigator.userAgent || '')
    };
    addLocalWin(row);
    if (g.MIEC_SYNC && g.MIEC_SYNC.enqueue) {
      g.MIEC_SYNC.enqueue('win', row);
    }
    return row;
  }

  function saveMotor(e){
    const row = {
      ts: e.ts || Date.now(),
      brand: (e.brand||'').trim(),
      ident: (e.ident||'').trim(),
      result: e.result || '',
      reason: e.reason || '',
      photo: e.photo || '',
      version: e.version || APP_VERSION,
      device: e.device || (navigator.userAgent || '')
    };
    addLocalMotor(row);
    if (g.MIEC_SYNC && g.MIEC_SYNC.enqueue) {
      g.MIEC_SYNC.enqueue('motor', row);
    }
    return row;
  }

  async function startAutoSync(){
    // Tenta sincronizar logo à partida, depois a cada X segundos enquanto houver sessão.
    if (g.MIEC_SYNC && g.MIEC_SYNC.isEnabled) {
      try { await g.MIEC_SYNC.syncNow(); } catch {}
      // Repetir de forma leve
      let tries = 0;
      const tick = async () => {
        tries++;
        try { await g.MIEC_SYNC.syncNow(); } catch {}
        // Reduzir frequência após as primeiras tentativas
        const next = tries < 3 ? 5000 : 15000;
        g.__miec_sync_timer = g.setTimeout(tick, next);
      };
      g.__miec_sync_timer = g.setTimeout(tick, 5000);
    }
  }

  g.HistoryService = { saveWin, saveMotor, startAutoSync };
})();
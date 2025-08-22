// js/supa.js  —  agora com getSessionFromUrl() automático
window.supa = (function () {
  const STORE_KEY = "MIEC_CONFIG";
  const read = () => {
    try {
      return JSON.parse(localStorage.getItem(STORE_KEY) || "{}");
    } catch {
      return {};
    }
  };
  const merge = (a, b) => Object.assign({}, a || {}, b || {});
  let base = window.MIEC_CONFIG || {};
  let cfg = merge(base, read());
  let client = null;

  const ready = () => !!init();

  function init() {
    if (!cfg.SUPABASE_URL || !cfg.SUPABASE_ANON_KEY) return null;
    if (client) return client;
    client = supabase.createClient(cfg.SUPABASE_URL, cfg.SUPABASE_ANON_KEY);

    // 👉 NOVO: tentar trocar o hash (#access_token…) por sessão
    handleRedirect();

    return client;
  }

  async function handleRedirect() {
    // Se o URL tiver tokens (#access_token, etc.) troca-os por cookie + limpa o hash
    if (location.hash.includes("access_token")) {
      const { data, error } = await client.auth.getSessionFromUrl({
        storeSession: true,
      });
      if (error && error.name !== "AuthSessionMissingError") {
        console.warn("getSessionFromUrl:", error);
      }
      // limpa o fragmento para ficar URL limpo
      history.replaceState({}, document.title, location.pathname);
    }
  }

  // … (resto do ficheiro mantém-se igual, incluindo o redirectTo para validador.html)
  // ▼▼▼ código encurtado aqui; o patch completo está no ZIP ▼▼▼
})();

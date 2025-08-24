# Validador — Early Gate Patch

Cola o bloco abaixo **logo a seguir** ao `<script defer src="js/supa.js?v=418"></script>` dentro do `<head>` de `validador.html`.

~~~html
  <!-- Early session gate: runs BEFORE any other page scripts -->
  <script defer>
  (async () => {
    try {
      // Wait for SupaAuth to load (in case of slow networks)
      const waitFor = async (cond, t = 3000) => {
        const started = Date.now();
        while (!cond()) {
          if (Date.now() - started > t) break;
          await new Promise(r => setTimeout(r, 20));
        }
      };
      await waitFor(() => window.SupaAuth && window.SupaAuth.getSession);

      if (window.SupaAuth && window.SupaAuth.finalizeFromUrl) {
        await window.SupaAuth.finalizeFromUrl();
      }
      const res = await window.SupaAuth.getSession();
      const sess = res?.data?.session || null;
      if (!sess) {
        location.replace('login.html?v=418');
      }
      // else: keep the user on validador (session ok)
    } catch (e) {
      console.warn('[gate-early] ', e);
    }
  })();
  </script>

~~~

Isto garante que o `finalizeFromUrl()` corre **antes** de qualquer script da página poder redirecionar (evita o "pisca" e volta ao login).

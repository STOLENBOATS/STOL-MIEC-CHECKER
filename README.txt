MIEC — History Pages Fix r5
===========================

Inclui JS robustos que:
- Buscam os registos diretamente no Supabase (por user_id da sessão) e ordenam por ts desc;
- Caso não haja sessão/erro, fazem fallback a localStorage (miec_history_* ou miec_sync_outbox_v1);
- Criam a tabela automaticamente se o HTML não a tiver pronto (#rows).

Como usar (em 'historico_win.html' e 'historico_motor.html'):
-----------------------------------------------------------
No <head>, garanta que já carrega o supabase-js e 'js/config.js' (onde tens SUPABASE_URL/ANON_KEY).
Depois acrescente, **nesta ordem**:

  <script defer src="js/history-common.v1.js"></script>
  <!-- numa página: -->
  <script defer src="js/historico-win.r5.js"></script>
  <!-- na outra página: -->
  <script defer src="js/historico-motor.r5.js"></script>

Não precisa alterar o resto do HTML; se não existir <tbody id="rows">, o script cria a tabela.
MIEC • Minimal History Fix (r12-2d)
-----------------------------------
Objetivo: reverter a regressão nas páginas de históricos (HIN e Motores), mantendo
apenas um conjunto de botões no cabeçalho e NADA mais. Este patch não toca no
Supabase, não injeta CSS extra e não cria toggles.

Como aplicar
-----------
1) Copia o ficheiro para a tua pasta /js (js/history-fix.r12-2d.js).
2) Em 'historico_win.html' e 'historico_motor.html', remove quaisquer includes
   anteriores que tenhas adicionado deste género:
     - js/history-fixes.r12-2c.js
     - css/thumbs.css
3) Mesmo antes do </body>, adiciona APENAS:
   <script defer src="js/history-fix.r12-2d.js"></script>

Verificações rápidas
--------------------
- Abre o Histórico (HIN/Motores) e no console deverá aparecer:
  "[history-fix r12-2d] active. header dedup done: true"
- Não devem existir 2-3 botões "Voltar ao Validador".
- As tabelas devem carregar como antes (sem erros no console).

Se continuares sem ver linhas:
------------------------------
1) Garante no Validador que o outbox não está vazio e sincroniza:
   JSON.parse(localStorage.getItem('miec_sync_outbox_v1')||'[]').length
   await MIEC_SYNC.pushOutbox(); await MIEC_SYNC.pullAll();

2) Confirma no Supabase que existem registos em 'history_win' e 'history_motor'.

Este patch é idempotente (pode ser incluído duas vezes sem duplicar efeitos).
MIEC — Rescue Kit r12-2g
========================

Este kit é MINIMALISTA e seguro. Não injeta SDKs/CDNs, não mexe no fluxo Supabase.
Corrige:
- Histórico WIN/Motor com header duplicado
- Bloqueios por JS antigo
- Mantém o que já tens a gravar/sincronizar

Arquivos incluídos
------------------
- js/history-fix.r12-2g.js
- js/auto-sync.patch.v1.js  (usar **apenas** no Validador)
  
Como aplicar
------------
1) Remover dos históricos qualquer script experimental anterior (history-fixes, thumbs, etc.).
2) Copiar `js/history-fix.r12-2g.js` para a pasta `js/` do projeto.
3) Em **historico_win.html** e **historico_motor.html**, antes de `</body>`, deixar **apenas** esta linha:
   <script defer src="js/history-fix.r12-2g.js"></script>

4) Copiar `js/auto-sync.patch.v1.js` para a pasta `js/` do projeto.
5) Em **validador.html**, depois de `js/history-service.js` (e antes dos recorders), adicionar:
   <script defer src="js/auto-sync.patch.v1.js"></script>

Ordem recomendada no Validador (no <head>):
-------------------------------------------
<script src="https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2.56.0"></script>
<script defer src="js/config.js?v=418"></script>
<script defer src="js/supa-auth.js?v=1"></script>
<script defer src="js/compat-bridge.js?v=1"></script>
<script defer src="js/validador-gate.js?v=1"></script>

<script defer src="js/supa-sync.v1.2.js"></script>
<script defer src="js/history-service.js"></script>
<script defer src="js/auto-sync.patch.v1.js"></script>

<script defer src="js/history-recorder-win.js"></script>
<script defer src="js/history-recorder-motor.js"></script>

Testes rápidos (Console)
------------------------
1) Verifica que o histórico não tem erros vermelhos.
2) No Validador:
   JSON.parse(localStorage.getItem('miec_sync_outbox_v1')||'[]').length
   await MIEC_SYNC.pushOutbox();
   await MIEC_SYNC.pullAll();

3) Deverás ver no console do histórico:
   [history-fix r12-2g] active. header dedup done.

Qualquer dúvida, diz — sigo com a versão “full” assim que esta base estiver estável.

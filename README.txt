js/auth-boot.js (v420)

Coloca este ficheiro em js/ e **inclui-o MUITO cedo no <head>**, ANTES dos teus scripts de página.

Exemplo de ordem no <head>:
-------------------------------------------------
<script defer src="js/auth-boot.js?v=420"></script>
<!-- (opcional) os teus scripts vêm a seguir -->
<script defer src="js/cloud-diag.js?v=418"></script>
-------------------------------------------------

O bootstrapper vai carregar automaticamente:
- Supabase SDK @2.56.0 (se faltar)
- js/config.js?v=418 (se faltar)
- js/supa.js?v=418 (se faltar)
e cria `window.supa` para os teus handlers.

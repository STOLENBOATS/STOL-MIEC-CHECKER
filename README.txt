MIEC — Minimal Supabase Auth (v1)

Arquivos:
- js/supa-auth.js         → inicializa Supabase, finaliza a sessão a partir do URL (code/token), envia Magic Link/OTP, verifica OTP.
- js/compat-bridge.js     → cria window.supa.* para não precisares de mudar o teu código antigo.
- js/validador-gate.js    → gate para o validador (finaliza URL + verifica sessão; se faltar, volta ao login).

Como instalar
1) Garante no repositório:
   - js/config.js com:
     window.SUPABASE_URL = "https://SEU-PROJ.supabase.co";
     window.SUPABASE_ANON_KEY = "eyJhbGciOi...";
2) Em TODAS as páginas onde usas auth (login/validador/debug):
   Adiciona no <head> (nesta ordem):
     <script src="https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2.56.0"></script>
     <script defer src="js/config.js?v=418"></script>
     <script defer src="js/supa-auth.js?v=1"></script>
     <script defer src="js/compat-bridge.js?v=1"></script>

3) No validador.html, ainda no <head>, DEPOIS das linhas acima, adiciona:
     <script defer src="js/validador-gate.js?v=1"></script>

4) No Supabase Dashboard (uma vez):
   - Auth → Settings:
     • Site URL: https://stolenboats.github.io/STOL-MIEC-CHECKER/
     • Additional Redirect URLs: https://stolenboats.github.io/STOL-MIEC-CHECKER/login.html , .../validador.html
   - Email templates → Magic Link → usar {{ .ActionURL }} (não {{ .ConfirmationURL }}).
   - (Opcional) Confirm email: desligar para simplificar DEV.

5) Teste
   - login.html → “Entrar (link mágico)” usa window.supa.loginMagic(email)
   - login.html → OTP: window.supa.sendEmailOtp(email) e depois window.supa.verifyCode(email, code)
   - Após clicar no link do email: deve abrir validador.html?v=418&debug=1 (opcional) e ficar.

Dicas
- Debug do gate: validador.html?v=418&debug=1&hold=2500
- Se vir 403 no /verify, é código inválido/expirado. Peça novo OTP.

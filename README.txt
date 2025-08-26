noauth-dev.js (v1) — DEV-ONLY

O que faz:
- Simula uma sessão Supabase (SupaAuth.getSession() devolve um utilizador fake).
- Dispara "supa:ready" para que o teu JS continue.
- Marca o indicador Cloud como ON, se existir.
- Ignora envios/validações de OTP/magic link.

Como usar (só no DEV!):
1) Suba js/noauth-dev.js para /js do repositório.
2) No <head> do validador.html, adicione (o mais cedo possível):
   <script defer src="js/noauth-dev.js?v=1"></script>
3) Hard refresh.

Desativar temporariamente (sem remover o ficheiro):
- Abra: validador.html?auth=on

⚠️ Segurança: este bypass é apenas para ambientes DEV/Teste em páginas públicas.
Não use em produção.

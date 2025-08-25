# Login "loginMagic undefined" — Hotfix (v419)

**Sintoma:** Ao clicar "Entrar (link mágico)", a consola diz `Cannot read properties of undefined (reading 'loginMagic')`.

**Causa:** `window.supa` não existe no momento do clique (a página está a chamar `supa.loginMagic(...)`).

**Solução:** carrega a ponte de compatibilidade que cria `window.supa` imediatamente e encaminha para `SupaAuth`.

## Como aplicar
1) Copia **js/compat-bridge.js** para `js/` do teu repo.
2) No **<head>** do `login.html`, garante esta ordem (todos com `defer`):
   - Supabase SDK `@2.56.0`
   - `js/config.js?v=418`
   - `js/supa.js?v=418`
   - `js/compat-bridge.js?v=419`  ← **NOVO**
   - (depois) os teus scripts de página, ex.: `js/cloud-diag.js?v=418`

Podes simplesmente colar o conteúdo do ficheiro **head-snippet.html** no teu `<head>` (ajusta se já tiveres as linhas).

## Teste (Consola, no login.html)
```
typeof window.supa, typeof window.SupaAuth
```
Resultado esperado: `"object" "object"`.

Se ainda vires “Auth not ready” no primeiro clique, é normal em redes lentas — tenta de novo após 1–2s.

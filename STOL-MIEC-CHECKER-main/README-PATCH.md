# MIEC Auth Gate Patch (keep v=417)

Esta patch reforça o **gate de sessão** e a finalização de auth em `js/supa.js` mantendo o `?v=417` (para não mexer no HTML existente). Inclui ainda uma página opcional `debug.html` para testes rápidos.

## O que muda
- `finalizeFromUrl()` agora lida com **3 variações** de retorno dos emails de Supabase:
  1. **PKCE**: `?code=...` → `exchangeCodeForSession(code)`
  2. **Implícito**: `#access_token` + `#refresh_token` (hash) → `setSession({ access_token, refresh_token })`
  3. **Legacy/Template**: `?token=` / `?token_hash=` → `verifyOtp({ token_hash, type: 'email' })`

- Após criar sessão, o URL é **limpo** (remove hash e params de auth) mantendo **apenas** `?v=417`.
- Helpers expostos como `window.SupaAuth`:
  - `finalizeFromUrl()`, `hasAuthParamsInUrl()`
  - `loginMagic(email)`, `sendEmailOtp(email)`, `verifyCode(email, code)`
  - `getSession()`, `logout()`

> Nota: nas docs actuais, os tipos `'signup'` e `'magiclink'` em `verifyOtp()` estão **deprecated** para JS — usar `type: 'email'`.


## Como aplicar
1. Copiar **`js/supa.js`** para a pasta `js/` do projecto (substitui o existente).
2. (Opcional) Copiar **`debug.html`** para a raiz do repositório.
3. Fazer deploy no GitHub Pages e **hard refresh** (Ctrl/Cmd + F5).

## Teste rápido
- Abre `/debug.html` → envia **magic link** ou **OTP** → clica no link do email **ou** usa o código de 6 dígitos → verifica sessão e abre o `validador.html`.
- Abre `validador.html` directamente: se a sessão persistiu, entra sem pedir login. Caso contrário, o teu gate existente faz redirect para `login.html` (desde que o URL já não tenha tokens a processar).

## Dicas
- Garante no Supabase: **Site URL** e **Redirect URLs** apontam exactamente para o domínio GH Pages e páginas (`/login.html`, `/validador.html`).


# MIEC r12-2c — History Hotfix Pack

Drop-in files to fix:
- Bad Supabase CDN URL on history pages (adds runtime fallback)
- Consistent header actions: “Voltar ao Validador”, theme toggle, thumbs size toggle, “Sair”
- Thumbs small/medium toggle via body class

## Files
- `js/history-fixes.r12-2c.js` — **include this at the end of both history pages**
- `css/thumbs.css` — optional, if you don’t already have a thumbs stylesheet

## How to install (both `historico_win.html` and `historico_motor.html`)
1. Upload the two files to your server/repo keeping the same paths (`js/` and `css/`).
2. In each history page, before `</body>`, add:
```html
<link id="miec-thumbs-css" rel="stylesheet" href="css/thumbs.css?v=r12-2c">
<script defer src="js/history-fixes.r12-2c.js"></script>
```
> This script is **idempotent** (safe if included twice). It also adds a **fallback** Supabase loader:
> If `window.supabase` is missing, it injects the correct CDN:  
> `https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2.56.0`

## What you will see
- The header shows one “Voltar ao Validador”, the theme toggle (🌙/☀️), a “Thumbs: Pequenas/Médias” switch, and “Sair”.
- Clicking “Thumbs” toggles `body.thumbs-md`. Use `css/thumbs.css` or keep your own rules.
- If the Supabase CDN URL estava partido, o script injeta um correto automaticamente.
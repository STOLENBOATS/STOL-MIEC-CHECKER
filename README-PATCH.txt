M.I.E.C. • Patch r13-SANITY sobre r9b
=========================================
Data: 2025-09-07

Inclui (novos/alterados):
- css/status-hud.css
- js/config.js  (SANITY: REQUIRE_AUTH=false, DEV_MODE=true, AUTO_SYNC=false)
- js/status-hud.js
- js/selftest.js
- js/safe-init.js
- validador.html  (com bloco SANITY injetado) + backup validador.original-r9b.html

Como aplicar:
1) Faz backup da tua pasta atual (r9b baseline).
2) Extrai este patch por cima.
3) Abre o validador.html — o HUD deve aparecer com todos os checks a verde.
4) Depois liga os módulos reais (validador-win.js, validador-motor.js, history-service.js, etc.).

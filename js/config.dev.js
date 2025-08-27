// js/config.dev.js — ficheiro de DESENVOLVIMENTO (não usar em produção/publico)
// ATENÇÃO: pode conter credenciais DEV. Adicione ao .gitignore se repo for público.
window.MIEC_CONFIG = Object.assign({}, window.MIEC_CONFIG, {
  DEV_MODE: false,                // mude para true em DEV, ou use ?dev=1 / localStorage MIEC_DEV=1
  DEV_EMAIL: 'tester@miec.local', // <-- SUBSTITUIR pelo email DEV (opcional)
  DEV_PASSWORD: '',               // <-- SUBSTITUIR pela password DEV (opcional)
  HIDE_LOGIN_IN_DEV: false
});

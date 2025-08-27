// js/config.dev.js — ficheiro de DESENVOLVIMENTO (não usar em produção/publico)
// ATENÇÃO: este ficheiro pode conter credenciais DEV. Mantenha o repositório privado ou adicione ao .gitignore.
window.MIEC_CONFIG = Object.assign({}, window.MIEC_CONFIG, {
  DEV_MODE: true,                 // ativa autologin
  DEV_EMAIL: 'tester@miec.local', // <-- SUBSTITUIR pelo email DEV
  DEV_PASSWORD: 'coloca_aqui',    // <-- SUBSTITUIR pela password DEV
  HIDE_LOGIN_IN_DEV: true         // esconde botão "Sair" durante DEV
});

// config.dev.example.js — NÃO commitar com password real
// Copia para js/config.dev.js (gitignore) e edita:
window.MIEC_CONFIG = Object.assign({}, window.MIEC_CONFIG, {
  DEV_MODE: true,
  DEV_EMAIL: 'tester@miec.local',
  DEV_PASSWORD: 'coloca_aqui_a_tua',
  HIDE_LOGIN_IN_DEV: true
});

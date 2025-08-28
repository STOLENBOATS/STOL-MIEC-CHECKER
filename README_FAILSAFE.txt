MIEC - History Failsafe r4a
--------------------------------
Use este overlay se os históricos não estiverem a gravar.

1) Inclua no validador.html (depois dos recorders oficiais):
   <script defer src="js/history-recorder-failsafe.v1.js"></script>

2) Teste:
   - Submeta HIN/Motor
   - Console deve mostrar: "[failsafe] saveWin → outbox" / "saveMotor → outbox"
   - Verifique o outbox: JSON.parse(localStorage.getItem('miec_sync_outbox_v1')||'[]')

Funciona com o auto-sync; os itens serão empurrados para o Supabase quando houver sessão.

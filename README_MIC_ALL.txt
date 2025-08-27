MIEC — MIC Codebook (All) v1
================================
Este ficheiro JSON contém uma lista alargada de MIC → Fabricante para DEV/QA.
Use como "seed" e substitua/complete com uma fonte oficial assim que possível.

Como usar
---------
1) Copie data/mic.all.json para o seu projeto.
2) No <head>, ANTES de carregar "js/codebooks-live.v1.js", configure:
   <script>
     window.MIEC_MIC_SOURCES = [
       { type:'json', url:'data/mic.all.json' }  // usa estes MICs locais
     ];
   </script>
3) Carregue codebooks-live e o patch:
   <script defer src="js/codebooks-live.v1.js"></script>
   <script defer src="js/hin-rules.patch.v1.1.js"></script>

Nota
----
- Os códigos aqui incluídos são indicativos e não exaustivos.
- Em contexto forense, valide sempre com listas oficiais (ex.: autoridades marítimas, USCG, bases EU-CIN).

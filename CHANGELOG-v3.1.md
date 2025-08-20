# WIN Validator v3.1 – Consolidado
Data: 2025-08-20

## Base utilizada
- Ponto de partida: v3.0 Base Organizada
- Fusão com: NAV-2.2.2 (Fallback)

## O que foi integrado do 2.2.2
- **Módulos opcionais**: `js/config.js`, `js/utils.js`, `js/forense.js` (copiados e carregados no `validador.html`).
- **Adaptador forense**: `js/forense-adapter.js` criado para chamadas seguras (`showWinForense`, `showMotorForense`), sem quebras se os módulos não definirem as funções.
- **UI utilitária**: reintroduzidas classes comuns (`.kbd`, `.pills`, `.figure`, `.caption`, `.two-col`, `.hr`) no `css/styles.css`.
- **Ativos**: `images/logo-nav.png` preservado (não utilizado por omissão). `LEIA-ME-RAPIDO.txt` incluído na raiz.

## Melhorias v3.0 preservadas
- Header consistente com **logótipo PM pequeno** em todas as páginas.
- Históricos com **Exportar CSV**, preview de **foto** e **botão “Voltar ao Validador” no topo**.
- Validação **WIN/HIN** com interpretação campo-a-campo (UE 14; EUA 14/16, mês sem I/O/Q, heurística 1900/2000).
- Validação de **motores Yamaha/Honda** com **campos adaptativos**, gravação no histórico e feedback visual.
- **Login** funcional (`admin` / `Admin2025`) e **controlo de sessão**.

## Novidades v3.1
- **Painéis “Detalhe Forense (opcional)”** nos blocos WIN e Motores (expansível via `<details>`), preenchidos por `showWinForense` / `showMotorForense` se existirem funções no módulo forense.
- **Carregamento defensivo** de `config.js`, `utils.js`, `forense.js` (sem impacto caso não forneçam APIs esperadas).

## Notas
- **forense.html** não foi incluída como página isolada; a abordagem passa a ser **forense integrado** no ecrã principal.
- **Marcas** de motor mantêm-se: **Yamaha** e **Honda** (Suzuki/Mercury: próximas fases).
- Identidade visual padrão mantém-se **PM**; `logo-nav.png` fica disponível para uso opcional.


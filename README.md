# Journey

Diário pessoal de jogos e PWA estática. Evolução do GamePal, com biblioteca, sessões, memórias, coleções, campanhas e detalhes RAWG.

## Executar

Sirva a pasta com `python -m http.server 8000`. `app.jsx` e `overview.jsx` são as fontes React, `app.js` a versão compilada com Babel 7 (presets react/env). React 18.2 está em `vendor/`, preservando os avisos de licença dos distribuidores. Não há compilação em tempo de execução.

## Dados e migração

As chaves `gamepal_library_v1`, `gamepal_user_v1`, `gamepal_settings_v1` e o histórico legado (não utilizado) são mantidas para compatibilidade. O endereço e a origem do GitHub Pages devem permanecer iguais para acesso ao armazenamento já existente. Nenhuma biblioteca pessoal é armazenada no repositório. Novos campos são opcionais; campanhas antigas são apresentadas como Primeira jornada.

Exportação inclui biblioteca, imagens, coleções e nome; não inclui chaves de API nem conversa. Importação mescla por ID, prevalecendo o arquivo. Dados locais não sincronizam entre dispositivos. Screenshots limitadas a 1,5 MB; quota do navegador pode exigir backups externos.

## Verificação

`node tests/journey.test.cjs` e `node tests/rawg.test.cjs` verifica leitura de dados legados, cadastro manual, persistência de sessão, diário e replay, usando um simulador de estado React. Não substitui testes de navegador.

## Integrações

RAWG requer chave do usuário no Perfil. O assistente Journey AI usa uma conexão Gemini pessoal e opcional, detalhada abaixo. A visão geral consulta os endpoints de detalhes, screenshots e movies do RAWG. Cada coleção de mídia pode falhar independentemente, sem bloquear a sinopse. Trailers só aparecem quando retornados pelo catálogo. Requisições reais dependem de rede e de credenciais válidas. Chaves ficam no navegador e não devem ser incluídas no código.

## Próximas etapas

- Novo logo fornecido aplicado aos ícones PWA e à interface.
- Sincronização e importação de plataformas requerem backend e análise das APIs.
- Duração HowLongToBeat e recomendações editoriais ainda não integradas.
- Validar instalação e atualização em iOS e Android reais.


## Home discovery and search (November 2026)

- RAWG title searches now use one relevance request, locally ranked. A five-minute memory cache (40 entries) and in-flight deduplication avoid repeated calls. Requests time out after nine seconds. Credentials remain in the browser.
- Explore offers RAWG or FreeToGame. FreeToGame is limited to free-to-play PC/browser games; IDs use `ftg-` and never overwrite RAWG entries. Its catalog is searched locally after one same-origin download. Game details use the public FreeToGame endpoint.
- Random picks exclude owned IDs and matching titles. With a RAWG key, one catalog pool is cached locally for a day; otherwise (or on failure) the FreeToGame snapshot is used. Shuffle does not call an API.
- Gaming news displays publisher-supplied RSS headlines, dates, thumbnails and links only, never article bodies. Sources: PC Gamer, GamesRadar+, GamingOnLinux. The feed update timestamp remains visible, including stale-feed warnings.
- `python scripts/update-home.py` refreshes `data/news.json` and `data/free-games.json`. Individual feed failures are isolated; a total failure retains the last snapshot.
- `.github/workflows/refresh-home.yml` runs every six hours or manually. It commits public snapshots and requests a GitHub Pages build. GitHub Actions schedules can be delayed or disabled on inactive public repositories, and are subject to account quotas. No paid news API, third-party CORS proxy, user records or secrets are required.
- Runtime source order for compilation: `controls.jsx`, `overview.jsx`, `home.jsx`, `assistant.jsx`, `app.jsx`. Compile with Babel 7, presets `react` and `env`, into `app.js`.
- Checks: `node tests/journey.test.cjs`, `node tests/rawg.test.cjs`, `node tests/discovery.test.cjs`.


## Journey form polish (November 2026)

- Close and dismiss buttons use the same centered SVG symbol; icon buttons share fixed touch geometry.
- My journey uses sliders for ratings and completion estimates. Missing values stay unset until selected, zero ratings are preserved, and existing long/fractional estimates retain their values. Plus/minus buttons and Clear support precise adjustments; More hours expands long playthrough ranges.
- Started on and Finished on use native date inputs with explicit calendar controls. Browser date-picker presentation varies by device.
- Journal was removed from navigation. Legacy `#journal` links redirect to Library; per-game sessions and Memories are retained.
- Regression: `node tests/controls.test.cjs` verifies slider/date state and persistence boundaries.


## Journey AI (personal connection)

- Floating companion opens a responsive chat panel. The user supplies their own Gemini key for the current tab only. No shared key, localStorage/sessionStorage credential, saved chat, paid fallback, background generation or bundled secret is used. Reload/Disconnect forgets the key and conversation. Closing the panel keeps the current in-memory connection.
- Uses the documented Gemini `generateContent` REST API and `gemini-2.5-flash`, with schema-constrained JSON proposals. The free tier depends on Google project eligibility and quotas. Keep billing disabled for free-only use; Journey cannot inspect or enforce Google billing. Quota, authorization, timeout, blocked/truncated responses and offline errors leave the library unchanged.
- On first connection the UI explains that chat is sent directly to Google and free-tier content may be used to improve Google products. Sharing library metadata is off by default. When selected, only up to 100 recent titles, statuses, platforms and ratings are included, never stored notes, screenshots, sessions or credentials. Text explicitly typed into chat is sent as conversation history.
- Capabilities: recommendations, catalog lookups and additions, status/rating changes, and appending a comment to My thoughts. Catalog uses RAWG when configured, otherwise the limited FreeToGame catalog. No results offers a clearly labeled manual entry without artwork. Candidates require a selection; matching updates require an exact title and a preview click. Duplicate titles/IDs are rejected. Multiple library versions require choosing the target. Existing notes are appended, with size limits, and no delete/import/arbitrary code operation is exposed.
- Applying uses the same local persistence and Undo as the existing app. Each proposal applies once; a changed/removed game invalidates an old preview. Requests can be cancelled; late results are ignored after cancellation/disconnect.
- Shared public AI without personal keys requires an authenticated, rate-limited backend with a server-side secret. GitHub Pages cannot hold that secret. This release intentionally contains no shared production credential or unauthenticated proxy.
- Automated checks: `node tests/assistant.test.cjs` (request contract, validation, privacy, mutations and errors) and `node tests/assistant-ui.test.cjs` (send/choose/apply/disconnect flow with a mocked Gemini response). Real Gemini generation still requires an eligible personal key; no live credential was available during implementation.
- All close buttons now use `CloseButton` with a font-independent, explicitly centered SVG inside a fixed 44 px touch target. Covers game details, all compact forms/confirmations, gallery, toasts and the assistant. Browser layout checks include a 390 px iframe viewport; this is not a physical iPhone/Safari test.

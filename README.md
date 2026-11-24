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

RAWG requer chave do usuário no Perfil. O app não possui assistente de IA. A visão geral consulta os endpoints de detalhes, screenshots e movies do RAWG. Cada coleção de mídia pode falhar independentemente, sem bloquear a sinopse. Trailers só aparecem quando retornados pelo catálogo. Requisições reais dependem de rede e de credenciais válidas. Chaves ficam no navegador e não devem ser incluídas no código.

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
- Runtime source order for compilation: `overview.jsx`, `home.jsx`, `app.jsx`. Compile with Babel 7, presets `react` and `env`, into `app.js`.
- Checks: `node tests/journey.test.cjs`, `node tests/rawg.test.cjs`, `node tests/discovery.test.cjs`.

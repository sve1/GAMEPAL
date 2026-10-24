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

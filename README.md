# Europa 2026/27 — app de roteiro

App instalável (PWA) para iPhone e computador: roteiro dia a dia, feiras de Natal, mapa com ruas e rota a pé, GPS, radar "perto de mim", check-in automático, compras e checklist.

**Site:** https://matheusftorres.github.io/europa-2026/ (código em https://github.com/matheusftorres/europa-2026, publicado automaticamente pelo GitHub Actions a cada envio para `main`).

## Instalar no iPhone
1. Abra https://matheusftorres.github.io/europa-2026/ no **Safari**.
2. Toque em Compartilhar → **Adicionar à Tela de Início**.
3. Abra pelo ícone e, na aba **Perto**, toque em **Ativar localização** (permitir "Ao Usar o App").
4. Roteiro, horários, feiras, compras e lista funcionam sem internet. O mapa usa a chave da CARTO (variável `CARTO_KEY`, já configurada): os trechos vistos com Wi-Fi ficam guardados no aparelho por até 28 dias (os termos da CARTO limitam o cache a 30 dias). Por isso, faça a "visita prévia" de cada cidade a partir de ~10/12/2026, para cobrir a viagem inteira (22/12 a 04/01).

## Dados: duas versões
- `private/itineraryData.full.js` — versão completa, com códigos de reserva. Fica só no projeto do Claude ("Fase 2 - itineraryData.js"). **Nunca vai para o GitHub** (está no .gitignore).
- `src/data/itineraryData.js` — versão pública, gerada por `npm run redact`, com os códigos trocados por "•••". É a que o site usa.

## Como uma atualização entra no app
1. A mudança de roteiro ou a compra nova é informada na conversa do projeto.
2. Edita-se a versão completa; `DATA_VERSION.number` sobe e uma entrada nova entra no topo de `CHANGELOG`.
3. `npm run release` (valida, gera a versão pública e testa o build).
4. Commit e push no `main`: o GitHub Actions publica sozinho em 1–2 minutos.
5. No iPhone, o app se atualiza ao ser reaberto, e o ponto dourado aparece em "Novidades".
Check-ins e checklist ficam salvos no aparelho e não se perdem com as atualizações.

## Serviços externos (gratuitos, uso leve)
- Mapa: CARTO Dark Matter (noite) e Voyager (dia), com a chave gratuita não comercial (até 5 milhões de requisições/mês) salva na variável do repositório `CARTO_KEY` (Settings → Secrets and variables → Actions → Variables). A chave está restrita ao domínio matheusftorres.github.io no painel da CARTO. Créditos obrigatórios visíveis: © OpenStreetMap e © CARTO. Cache no aparelho limitado a 28 dias.
  Sem a variável, o build cai para as camadas padrão do OpenStreetMap, só com internet (a política da OSMF não permite uso offline), com modo noite por filtro de cor.
- Rota a pé: OSRM do FOSSGIS (routing.openstreetmap.de), uma consulta por dia/cidade, guardada no aparelho.
- Geocodificação de reserva: Nominatim (OpenStreetMap), só para locais sem coordenada, 1 consulta por segundo.

## Rodar no computador
    npm install
    npm run dev                 # http://localhost:5173
    BASE_PATH=/europa-2026/ npm run build
    npm run build:preview       # HTML único para a prévia publicada no Claude (sem mapa com ruas nem GPS)

## Estrutura
    src/App.jsx                  layout: tela dividida (computador) ou mapa + painel deslizante + abas (iPhone)
    src/components/MapView       Leaflet: camadas OSM ou CARTO, pinos do dia, rota a pé (trechos de transporte pontilhados), posição do GPS
    src/components/NearbyPanel   radar: próxima parada, locais por distância e direção, check-in automático
    src/components/Timeline      linha do tempo do dia, check-in, trens, distância até cada parada
    src/components/PlaceDetail   detalhes, horários da feira, links para Apple Mapas / Google Maps
    src/components/MarketsPanel  feiras de Natal e feiras fechadas
    src/components/BottomSheet   painel deslizante do iPhone (3 alturas)
    src/lib/                     fuso da viagem, GPS, distâncias, rotas, geocodificação, armazenamento local
    scripts/validate.mjs         confere coordenadas, horários, referências e feiras
    scripts/redact.mjs           gera a versão pública dos dados
    .github/workflows/deploy.yml publicação automática no GitHub Pages

# Slice 007: E2E Playwright, CI Branch Quality Gate & Release - Design

## 1. Arquitetura de CI/CD

### Fase A: Pull Request (verify.yml)
- **lint-and-unit**: Node 22, `npm ci`, `npm run lint`, `npm test` (Vitest)
- **build-and-e2e**: Node 22, `npm ci`, `BASE_PATH=/pythagoras-pass/ npm run build`, Playwright E2E contra `dist/` servido em `http://localhost:4173/pythagoras-pass/`, upload `e2e-results/results.json` + `playwright-report/` (7 dias)
- **ci-gate** (`if: always()`): baixa `results.json`, executa validador. Bloqueia merge se qualquer upstream falhou/cancelou/skipou, se `results.json` ausente/corrompido, se qualquer projeto ou caso obrigatório ausente/falho/flaky/skipped, ou se `unexpected` > 0

### Fase B: Deploy Pós-Merge (deploy.yml)
- **Concurrency no workflow completo**, inclusive publicação: `{ group: 'pages', cancel-in-progress: false }`. Uma execução ativa e uma pendente; uma nova execução pode substituir a pendente. Não existe FIFO nem garantia de publicar todos os commits. Todos os caminhos de publicação devem usar esse grupo e a guarda; conferir execuções antigas durante rollout, pois o workflow atual usa `true` e não tem E2E/guarda.
- **validate-and-package**: executa lint + Vitest + build + Playwright E2E + validador. Se aprovado, faz upload do exato `dist/` testado via `upload-pages-artifact@v3`. Se falhar: aborta, live anterior preservada
- **Guarda anti-stale** imediatamente antes de `deploy-pages@v4`, dentro do workflow serializado: consultar `refs/heads/main` por API autenticada ou `git ls-remote` e comparar com o SHA vinculado ao artifact testado. Divergência, consulta falha ou retorno inválido/ausente impedem chamar deploy-pages. Registrar SHA validado/remoto, run ID, artifact ID/digest e decisão. Se main avançar depois da guarda, o snapshot validado em andamento pode terminar de publicar; não há garantia de HEAD mais recente naquele instante. Um release posterior pode substituí-lo, mas uma execução antiga retomada será bloqueada pela guarda.
- **deploy-to-pages**: `deploy-pages@v4` sobre o artifact validado, sem rebuild
- Verificação futura: A/B concluem fora de ordem; A rejeitado após B; B publicado não sobrescrito por A; falha de consulta; avanço após guarda; identidade SHA/artifact; substituição de execução pendente. Falha antes da publicação preserva live por não publicar; não equivale a rollback automático de falha interna do serviço Pages.

## 2. Contrato do Validador (`scripts/validate-ci-gate.mjs`)

### Entradas
- `results.json` (caminho configurável via env `PLAYWRIGHT_REPORT_PATH`, default `e2e-results/results.json`)
- Status dos jobs upstream recebidos via `needs.*.result` do GitHub Actions (passados como argumentos ou variáveis; **nunca** default `'success'`)

### Algoritmo (pseudocódigo contratual)
1. **Upstream**: se qualquer job upstream teve resultado diferente de `success` → `exit(1)`. Ausência/unknown → `exit(1)`
2. **Existência**: `results.json` ausente → `exit(1)`
3. **Parse**: JSON inválido → `exit(1)`
4. **Esquema/cobertura**: validar o JSON da versão Playwright fixada; percorrer `suites` recursivamente e `specs[].tests[]`, associando `projectId` à configuração do projeto. Não presumir profundidade nem projetos como diretórios. Exigir cada chave `(projeto, ID, cenário)` da seção 4, por título exato como `[E2E-LAYOUT-01] scenario=pwa_guide`, sem substring ambígua. `repeatEach: 1`; duplicatas inesperadas ou esquema inválido reprovam.
5. **Status por caso**: exigir `expectedStatus === 'passed'`, `test.status === 'expected'`, `results` não vazio e TODAS as tentativas `status === 'passed'`. Skipped, failed, timedOut, interrupted, flaky, expectativa de falha e erros globais reprovam. Rejeitar também falhas de testes executados fora do catálogo; nenhuma falha inicial fica mascarada pelo retry.
6. **Aprovação**: todas as combinações obrigatórias presentes e aprovadas; baseline/aprovação ausente bloqueia visual. Mapa upstream é explícito: jobs de PR no PR; lint/Vitest/build/Playwright na validação integrada/local, sem inventar jobs de PR no contexto local. Contexto ou item upstream ausente reprova.

### Projetos obrigatórios
Os 4 core e os 6 adicionais da seção 4; os adicionais exigem layout e visual, sem repetir toda a suíte funcional.

### IDs canônicos obrigatórios (11)
`[E2E-GAME-01]` a `[E2E-GAME-06]`, `[E2E-FORMULA-01]`, `[E2E-LAYOUT-01]`, `[E2E-A11Y-01]`, `[E2E-PWA-01]`, `[E2E-VIS-01]`

### Testes do validador (`tests/ciGateValidator.test.ts`)
Casos simulados com fixtures JSON:
1. upstream `failure` → `exit(1)`
2. upstream `skipped` → `exit(1)`
3. upstream ausente/unknown → `exit(1)`
4. `results.json` ausente → `exit(1)`
5. JSON corrompido → `exit(1)`
6. Projeto `webkit-mobile` ausente → `exit(1)`
7. ID `[E2E-GAME-01]` ausente → `exit(1)`
8. ID `[E2E-GAME-01]` com `status: 'skipped'` → `exit(1)`
9. Teste flaky (primeiro `failed`, retry `passed`) → `exit(1)`
10. `unexpected` > 0 → `exit(1)`
11. Suíte completa: todos projetos, todos IDs, `expectedStatus: 'passed'`, zero flaky → `exit(0)`
12. Esquema inválido, suítes em profundidades distintas, cenário ausente, título similar/duplicado, resultados vazios, timedOut/interrupted, upstream cancelled, falha esperada e erro global → reprovação conforme contrato. Aprovar somente o conjunto completo da seção 4.

## 3. Política Anti-Flaky

- Playwright config proposta: `retries: 1`, `trace: 'on'`, capturando tentativa inicial e retry. Upload de report e `test-results/` mesmo em falha, retenção 7 dias.
- Flaky = teste falha na primeira tentativa e passa no retry. **Bloqueia o gate**
- `on-first-retry` não captura a primeira tentativa com falha e não satisfaz a exigência de evidência inicial.
- Não usar `test.fail()` / `xfail` como cobertura — espera-se `expectedStatus: 'passed'`

## 4. Matriz de Dispositivos e Cobertura

### Projetos Playwright (4 core, gate obrigatório)
| Projeto | Engine | Viewport | DPR | Touch | Configuração |
|---------|--------|----------|-----|-------|--------|
| `chromium-desktop` | Chromium | 1280×720 | 1 | não | customizada |
| `chromium-mobile` | Chromium | 412×915 | 2.625 | sim | customizada |
| `webkit-desktop` | WebKit | 1280×720 | 1 | não | customizada |
| `webkit-mobile` | WebKit | 390×844 | 3 | sim | customizada, UA iPhone |

### Projetos adicionais obrigatórios
| Projeto | Engine | Viewport CSS | DPR | Touch/mobile |
|---|---|---|---|---|
| chromium-compact | Chromium | 320×568 | 2 | sim |
| webkit-compact | WebKit | 320×568 | 2 | sim |
| chromium-landscape | Chromium | 844×390 | 3 | sim |
| webkit-landscape | WebKit | 844×390 | 3 | sim |
| chromium-wide | Chromium | 1440×900 | 1 | não |
| webkit-wide | WebKit | 1440×900 | 1 | não |

Dimensões/DPR dos dez projetos são configurações customizadas explícitas, não comprovação de hardware nem alegação de preset oficial. Fixar versão Playwright no futuro lockfile. Core webkit-mobile usa UA iPhone; os demais têm contexto padrão de sua engine. Fixtures PWA abaixo mudam UA somente para o ramo DOM testado.

### Alocação de casos obrigatórios por projeto
- **GAME-01..06, FORMULA-01, A11Y-01, PWA-01**: nos 4 core, cenário `functional`.
- **LAYOUT-01**: nos dez projetos, cenários `idle`, `formula`, `miss_short`, `miss_long`, `goal`, `pwa_guide`, `pwa_install_button`, `offline`.
- **VIS-01**: nos dez projetos, cenários `idle`, `formula`, `miss_short`, `miss_long`, `goal`, `phase_transition`, `champion`.
- O manifesto futuro de cobertura deve refletir exatamente estes conjuntos; ausência de uma única combinação reprova. Projetos adicionais selecionam arquivos layout/visual sem skips de casos exigidos.

## 5. Não-Encobrimento 2D (LAYOUT-01)

### Contrato
Teste aciona explicitamente cada estado de UI, obtém `boundingBox()` do `<canvas>` e de cada elemento, calcula área de intersecção 2D, exige **zero**. Sem condicionais `if isVisible` — elementos ausentes/invisíveis → `fail`.

### Estados e elementos verificados
1. **Header**: sempre visível
2. **ControlsPanel** (`div.bg-slate-900/95` dentro de `<main>`)
3. **HelpPanel** (expandido via toggle "Mostrar Ajuda" / "Show Help")
4. **Feedback de resultado**: curto, longo e gol acionados separadamente com entradas calculadas em centésimos a partir de A/B visíveis, formatadas em unidades no input. Não usar o mesmo valor fixo para curto e longo nem expor resposta oculta em atributos/hooks.
5. **OfflineIndicator**: ativar SW/cache antes de desconectar; assertar indicador visível e medir no instante definido da animação bounce.
6. **iOS Install Guide** (`showIOSGuide`): overlay React `fixed inset-0` no PWAInstallButton. Defeito atual confirmado: backdrop cobre canvas, violando o invariante sem exceção. Tarefa futura test-first deve convertê-lo em painel não sobreposto, preservando conteúdo/foco/fechamento. Nenhuma correção de produto nesta rodada.
7. Fixture `pwa_guide` nos dez projetos: UA iPhone, fora standalone e sem evento Chromium; clicar guia real. Reproduz ramo DOM, não comprova iOS físico. Fixture `pwa_install_button`: contexto não-iOS, evento sintético `beforeinstallprompt` após listener instalado para verificar botão/handler, não instalação nativa. Não dispensar estados por invisibilidade.

### Invariante
Geometria 2D: `overlapArea === 0` entre `canvasBox` e cada `elementBox` em todos os estados. `canvasBox` é re-obtido após cada transição de estado.
Caixas novas também após scroll, com presença/visibilidade/estabilização e rejeição de null. Header/controles são reavaliados em cada estado. Canvas compacto ≥250px e touch targets ≥44px. Capturar composição da cena com canvas no enquadramento além do bitmap; não ocultar/mask overlays para fazer passar. Diálogos nativos browser/OS são homologação manual separada, nunca justificativa para overlay React.

## 6. Determinismo Visual (VIS-01)

### Mecanismo (proposto, implementação futura)
- **Sorteio**: `page.addInitScript` instala PRNG Mulberry32 com seed uint32 fixa por cenário e reset por página/tentativa. Cobre `generateRoundPair`/`passerSide`; documentar seed e A/B observados sem depender de contagem arbitrária de chamadas. Não altera fonte nem build de produção e não publica C oculto.
- **Tempo**: `page.clock.install()` antes do load com época fixa; avançar rAF com `runFor` quando forem necessários callbacks sucessivos. Código atual: passe 1000ms e chute 600ms. Esperar botão/feedback terminal e flush React/paint. CSS/motion estabilizados ou capturados em instante definido, com fonts ready e relógio pausado; não apenas sleeps fixos.
- **Canvas**: não possui animações contínuas (partículas/celebração). Renderiza frame a frame baseado em `animationProgress` e `phase`. Aguarda `phase` diferente de `'passing'` e `'shooting'` para estabilizar

### Estados canônicos para snapshot
1. **Idle**: input C vazio, `phase === 'idle'`, canvas estático
2. **Fórmula aberta**: `isHelpOpen === true`, painel visível
3. **Erros separados**: `phase === 'miss_short'` e `phase === 'miss_long'`, feedback correspondente visível
4. **Gol (fase 1)**: `phase === 'goal'`, `currentPhase === 1`, banner de gol + "Avançar para Fase 2"
5. **Campeão (fase 3)**: `phase === 'goal'`, `currentPhase === 3`, troféu + "Jogar Novamente"
6. **Transição de fase**: após acerto da fase 1, ação real avançar e captura da fase 2 em idle com novo tema/rodada. Não existe modal; campeão não substitui esse cenário. As fases internas não são expostas atualmente: helpers usam UI real; observabilidade mínima futura, se necessária, é proposta/PENDING, sem respostas ocultas.

### Limiares
- Canvas: `maxDiffPixels: 50` (absoluto)
- Componentes DOM: `maxDiffPixelRatio: 0.01`, `maxDiffPixels: 100`
- Tolerâncias não garantem detectar qualquer defeito; assertivas geométricas/funcionais complementam. Comparações de composição têm os mesmos limites DOM.

### Baselines
- Coleta: `--update-snapshots` em rodada dedicada local
- Revisão humana + commit na branch de feature
- CI: **proibido** `--update-snapshots`. Sem baselines → gate bloqueado → status PENDING
- Ambiente fixo: Linux `ubuntu-24.04`, Node22, versão Playwright/browser/fonts, UTC, locale pt-BR e DPR da matriz. Coleta em outro OS não vira baseline CI automaticamente. Template futuro `e2e/__snapshots__/{projectName}/{testFilePath}/{arg}{ext}`, nomes ID/cenário/escopo. Aprovação humana registra SHA/path/digest das imagens; alteração de baseline invalida aprovação correspondente. Coleta dedicada não dispara deploy.

## 7. PWA e Offline (PWA-01)

### Contrato
1. Aguardar `navigator.serviceWorker.ready` e `navigator.serviceWorker.controller` ativos
2. Confirmar assets essenciais no Cache Storage
3. `context.setOffline(true)` (API oficial Playwright `BrowserContext`)
4. `page.reload()` → interface renderiza do cache, jogo funcional

## 8. Diagnóstico de Arquivos (`bun.lock` e `dev-dist/`)

### Evidências do clone limpo
- `bun.lock`: 168.329 bytes rastreados no clone; falha do parser JSON estrito não comprova validade Bun nem corrupção. Validação Bun não realizada. Preservar; npm/package-lock são canônicos em CI.
- `dev-dist/`: **ausente** do clone limpo. Não rastreado (`git ls-files` vazio). Gerado por `VitePWA` em modo dev. Adicionar ao `.gitignore` na implementação como boa prática, sem relação causal comprovada com alertas do AI Studio

## 9. Execução Local

### Script canônico (a ser adicionado como `test:local:full` no `package.json`)
```
npm run lint && npm test && BASE_PATH='/pythagoras-pass/' npm run build && npx playwright test && npm run test:gate:local
```

### `playwright.config.ts` — bloco `webServer`
```
webServer: {
  command: 'BASE_PATH=/pythagoras-pass/ npm run preview -- --port 4173 --strictPort',
  url: 'http://localhost:4173/pythagoras-pass/',
  reuseExistingServer: false,
  timeout: 120_000,
}
```
`webServer` gerencia ciclo de vida; sem processos manuais `&`. `strictPort: true` recomendado. `baseURL` configurado como `http://localhost:4173/pythagoras-pass/`.
`test:gate:local` é script FUTURO que recebe contexto local e mapa explícito de lint/Vitest/build/Playwright aprovados somente depois da sequência acima. CLI do validador será especificada na implementação, sem default success. Scripts não existem ainda. Falhas interrompem validação, sem impedir coleta de evidências.

### Isolamento de runners
- Vitest: `tests/**/*.test.ts` apenas
- Playwright: `e2e/**/*.spec.ts` apenas (`testDir: './e2e'`)

## 10. Configurações Pendentes (PENDING)

- Branch protection em `main` (2026-10-12: `protected: false`). Configuração manual pelo mantenedor: exigir PR + check `ci-gate` + sem bypass admin
- `data-canvas-status`: atributo DOM proposto para observação de idle/animating (não existe no código atual)
- Homologação física: iOS Safari real, Android Chrome real, VoiceOver/TalkBack (PHYS-01, A11Y-AUDIO-01)
- AI Studio branch sync: verificar compatibilidade; fallback via Git CLI local
- Sincronização desta SPEC em main é exceção documental expressamente solicitada, commit `[skip ci]` para evitar deploy antigo; futuro código continua branch/PR. A publicação da SPEC não autoriza BUILD. Falha antes do deploy não é garantia de recuperação de falha interna de Pages.

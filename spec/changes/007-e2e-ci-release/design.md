# Slice 007: E2E Playwright, CI Branch Quality Gate & Release - Design

## 1. Arquitetura Consolidada de CI/CD e Governança

```text
===================================================================================================
FASE A: VERIFICAÇÃO EM PULL REQUEST (.github/workflows/verify.yml)
===================================================================================================

 [Branch de Feature: feature/slice-007-e2e-ci] ──► Abrir PR para 'main'
                                 │
                                 ▼
                     [GitHub Actions Workflow: verify.yml]
                                 │
                    ┌────────────┴────────────┐
                    ▼                         ▼
            [Job: lint-and-unit]      [Job: build-and-e2e]
            - Node 22, npm ci         - Node 22, npm ci
            - npm run lint            - BASE_PATH='/pythagoras-pass/' npm run build
            - npm test (Vitest)       - Instala browsers Playwright
                                      - Sobe preview em http://localhost:4173/pythagoras-pass/
                                      - Executa Playwright gerando results.json e HTML
                                      - Upload de results.json e Playwright Report (7 dias)
                    │                         │
                    └────────────┬────────────┘
                                 ▼
                       [Job: ci-gate (Agregador Estruturado)]
                       - if: always()
                       - Valida status de lint-and-unit E build-and-e2e
                       - Baixa results.json e executa node scripts/validate-ci-gate.mjs
                       - Exige 100% dos projetos e casos obrigatórios
                       - Proíbe falhas, cancelamentos, skips e testes FLAKY
                                 │
            ┌────────────────────┴────────────────────┐
            ▼                                         ▼
   ❌ Falha em qualquer etapa                ✅ Todos os checks aprovados
   Merge BLOQUEADO no GitHub!                 PR LIBERADO para o mantenedor!
   Produção 100% protegida.                   (mesenga@gmail.com clica em "Merge")

===================================================================================================
FASE B: VALIDAÇÃO INTEGRADA E PUBLICAÇÃO PÓS-MERGE (.github/workflows/deploy.yml)
===================================================================================================

 [Merge Realizado na 'main'] ──► Dispara deploy.yml
                                 │
                                 ▼
          [Workflow Concurrency: { group: 'pages-release', cancel-in-progress: false }]
          - Serialização no nível do workflow completo (jobs não intercalam entre execuções)
          - Ordem estrita de execução garantindo integridade de liberação
          - Verificação de SHA mais recente: se um commit posterior na 'main' estiver em fila ou
            executado, a release anterior não sobrescreve produção com versão defasada (anti-stale)
                                 │
                                 ▼
          [Job 1: validate-and-package-integrated]
          - Executa validação idêntica na versão integrada:
              * npm run lint
              * npm test (Vitest)
              * BASE_PATH='/pythagoras-pass/' npm run build (Gera dist/)
              * Executa Playwright E2E contra dist/ recém-compilado
              * Executa node scripts/validate-ci-gate.mjs sobre o results.json integrado
          - Se e somente se TODOS passarem:
              * Empacota o EXATO dist/ testado via actions/upload-pages-artifact@v3
          - Se falhar: aborta imediatamente o job!
                                 │
            ┌────────────────────┴────────────────────┐
            ▼                                         ▼
   ❌ Validação falhou                        ✅ Validação integrada aprovada
   Deploy ABORTADO!                           [Job 2: deploy-to-pages]
   A publicação anterior no                   - actions/deploy-pages@v4
   GitHub Pages permanece intocada            - Publica o MESMO artefato testado
   (sem recompilação pós-teste).              - Zero drift entre teste e produção!
===================================================================================================
```

---

## 2. Relatório Estruturado e Avaliação do `ci-gate`

### Configuração de Reporters no Playwright (`playwright.config.ts`)
O Playwright deve emitir obrigatoriamente tanto a saída visual quanto o arquivo estruturado JSON consumível pelo gate:

```typescript
reporter: [
  ['json', { outputFile: 'playwright-report/results.json' }],
  ['html', { outputFolder: 'playwright-report', open: 'never' }],
  ['list']
],
```

### Script Avaliador de Cobertura (`scripts/validate-ci-gate.mjs`)
O job agregador executa um script dedicado de inspeção sobre `results.json`, recebendo opcionalmente o status de jobs precedentes:

```javascript
// Conceito arquitetural de scripts/validate-ci-gate.mjs
import fs from 'node:fs';

const reportPath = process.env.PLAYWRIGHT_REPORT_PATH || 'playwright-report/results.json';
const upstreamStatus = process.env.UPSTREAM_STATUS || process.argv[2] || 'success';

// 1. Validação de jobs upstream (recebidos do CI via variável ou argumento)
if (upstreamStatus !== 'success') {
  console.error(`❌ ERRO: Job upstream reprovado ou cancelado (status: ${upstreamStatus})!`);
  process.exit(1);
}

// 2. Validação da existência do relatório estruturado
if (!fs.existsSync(reportPath)) {
  console.error(`❌ ERRO: Relatório estruturado ${reportPath} não encontrado!`);
  process.exit(1);
}

let report;
try {
  report = JSON.parse(fs.readFileSync(reportPath, 'utf8'));
} catch (err) {
  console.error(`❌ ERRO: Relatório estruturado corrompido ou JSON inválido: ${err.message}`);
  process.exit(1);
}

// 3. Matriz de projetos obrigatórios exigidos no gate
const REQUIRED_PROJECTS = [
  'chromium-desktop',
  'chromium-mobile',
  'webkit-desktop',
  'webkit-mobile'
];

// 4. Identificadores canônicos estáveis obrigatórios
const REQUIRED_TEST_IDS = [
  '[E2E-GAME-01]',
  '[E2E-GAME-02]',
  '[E2E-GAME-03]',
  '[E2E-GAME-04]',
  '[E2E-GAME-05]',
  '[E2E-GAME-06]',
  '[E2E-FORMULA-01]',
  '[E2E-LAYOUT-01]',
  '[E2E-A11Y-01]',
  '[E2E-PWA-01]',
  '[E2E-VIS-01]'
];

// 5. Inspeção estruturada e política estrita anti-flaky
// O validador percorre a árvore de suítes e especificações garantindo que:
// - Cada um dos REQUIRED_PROJECTS executou todos os REQUIRED_TEST_IDS
// - Nenhum teste possui status 'flaky', 'skipped', 'unexpected' ou 'timedOut'
// - Se flakyCount > 0 -> FALHA DO GATE com código 1
// - Se qualquer projeto ou caso obrigatório estiver ausente -> FALHA DO GATE com código 1
// - Se 100% dos requisitos forem atendidos -> APROVAÇÃO com código 0
```

### Testes Unitários do Próprio Gate (`tests/ciGateValidator.test.ts`)
Para garantir que o validador do gate seja imune a falsas aprovações, serão testados cenários simulados:
1. **Simulação 1 (Job Upstream Falho)**: `upstreamStatus === 'failure'` $\rightarrow$ Gate falha com código 1.
2. **Simulação 2 (Job Upstream Pulado)**: `upstreamStatus === 'skipped'` $\rightarrow$ Gate falha com código 1.
3. **Simulação 3 (Relatório Inexistente)**: Arquivo `results.json` ausente $\rightarrow$ Gate falha com código 1.
4. **Simulação 4 (Projeto Ausente)**: `results.json` sem projeto `webkit-mobile` $\rightarrow$ Gate falha com código 1.
5. **Simulação 5 (Teste Obrigatório Ausente ou Skipped)**: Caso `[E2E-GAME-01]` ausente ou `skipped` $\rightarrow$ Gate falha com código 1.
6. **Simulação 6 (Teste Flaky)**: Teste com falha na tentativa inicial e sucesso no retry $\rightarrow$ Gate falha com código 1.
7. **Simulação 7 (Suíte Completa Aprovada)**: Todos os projetos e IDs com status `expected` e zero falhas $\rightarrow$ Gate aprova com código 0.

---

## 3. Política Rigorosa para Testes Flaky

- **Definição**: Um teste é considerado *flaky* quando falha na primeira tentativa de execução e é aprovado em uma tentativa subsequente configurada por `retries`.
- **Contrato Canônico**:
  - **Testes com status `flaky` reprovam o `ci-gate`**.
  - O Playwright registra detalhadamente todas as tentativas (`runs`) no `results.json` e anexa os traces da falha inicial.
  - A falha inicial nunca é descartada ou ocultada.
  - Flakiness em testes obrigatórios deve ser investigado e corrigido na causa raiz (ex.: estabilização assíncrona insuficiente ou corrida de animação), nunca mascarado por retries no pipeline.

---

## 4. Matriz de Dispositivos e Viewports Alinhada com `PRODUCT.md`

| Perfil de Tela | Resolução (CSS px) | DPR | Touch | Projeto / Preset Playwright | Foco da Verificação |
|---|---|---|---|---|---|
| **Mobile Standard iOS** | 390 × 844 | 3.0 | Ativado | `webkit-mobile` (`devices['iPhone 14']`) | Mão única, safe areas, layout estável |
| **Mobile Standard Android** | 412 × 915 | 2.625 | Ativado | `chromium-mobile` (`devices['Pixel 7']`) | Proporção alta, canvas em DPR fracionado |
| **Mobile Compacto** | 320 × 568 | 2.0 | Ativado | Viewport em teste de layout (`[E2E-LAYOUT-01]`) | Rolagem resiliente, controles $\ge 44\text{px}$, canvas $H \ge 250\text{px}$ |
| **Landscape Curto** | 844 × 390 | 3.0 | Ativado | Viewport em teste de layout (`[E2E-LAYOUT-01]`) | Ausência de corte vertical ou sobreposição |
| **Desktop Padrão** | 1280 × 720 | 1.0 | Desativado | `chromium-desktop` / `webkit-desktop` | Estágio centralizado smartphone (`max-w-[460px]`) |
| **Desktop Amplo** | 1440 × 900 | 1.0 | Desativado | Viewport em teste de layout (`[E2E-LAYOUT-01]`) | Alinhamento central e plano de fundo estável |

- **Relação com o Gate**: Os 4 projetos do Playwright (`chromium-desktop`, `chromium-mobile`, `webkit-desktop`, `webkit-mobile`) executam a matriz canônica de testes funcionais. Os viewports complementares (320×568 compacto, 844×390 horizontal e 1440×900 amplo) são parametrizados diretamente no teste de layout `e2e/layout-scene.spec.ts` (`[E2E-LAYOUT-01]`), garantindo que em todos os fatores de forma a altura mínima do canvas ($H \ge 250\text{px}$) e a ergonomia de toque ($\ge 44\text{px}$) sejam rigorosamente validadas antes do gate.

---

## 5. Algoritmo de Verificação de Não-Encobrimento em Duas Dimensões (2D)

O teste de layout não contém condicionais silenciosas (`if`). Todos os elementos de interface avaliados possuem presença, visibilidade e caixas delimitadoras assertadas explicitamente, e a intersecção bidimensional com o `PitchCanvas` deve ser rigorosamente zero:

```typescript
// e2e/layout-scene.spec.ts (Exemplo canônico estritamente determinístico, sem condicionais)
import { test, expect } from '@playwright/test';

test('[E2E-LAYOUT-01] nenhum controle, banner ou painel sobrepõe o canvas', async ({ page }) => {
  await page.goto('/pythagoras-pass/');

  // Canvas do campo de jogo (obrigatório e visível)
  const canvas = page.locator('canvas');
  await expect(canvas).toBeVisible();
  const canvasBox = (await canvas.boundingBox())!;
  expect(canvasBox).not.toBeNull();

  // 1. Header (obrigatório e visível no topo)
  const header = page.locator('header');
  await expect(header).toBeVisible();
  const headerBox = (await header.boundingBox())!;
  assertZero2DOverlap(canvasBox, headerBox, 'Header vs Canvas');

  // 2. Painel de controles de jogo (obrigatório e visível abaixo do canvas)
  const controls = page.locator('main').locator('div.bg-slate-900\\/95').first();
  await expect(controls).toBeVisible();
  const controlsBox = (await controls.boundingBox())!;
  assertZero2DOverlap(canvasBox, controlsBox, 'Controls vs Canvas');

  // 3. Painel de fórmula (aberto deterministicamente via ação de clique)
  const toggleBtn = page.getByRole('button', { name: /mostrar ajuda|show help|mostrar ayuda/i });
  await toggleBtn.click();
  const formulaPanel = page.getByRole('region', { name: /teorema/i });
  await expect(formulaPanel).toBeVisible();
  const formulaBox = (await formulaPanel.boundingBox())!;
  assertZero2DOverlap(canvasBox, formulaBox, 'Formula Panel vs Canvas');

  // Restaura painel fechado
  await toggleBtn.click();
  await expect(formulaPanel).not.toBeVisible();

  // 4. Linha de feedback de resultado (acionada deterministicamente por passe incorreto)
  const inputC = page.locator('#input-c');
  await inputC.fill('1.00');
  const launchBtn = page.getByRole('button', { name: /chutar|launch|lanzar/i });
  await launchBtn.click();

  // Aguarda término do passe e aparecimento do botão de repetição
  const retryBtn = page.getByRole('button', { name: /tentar novamente|retry|reintentar/i });
  await expect(retryBtn).toBeVisible({ timeout: 5000 });
  const feedbackLine = page.getByText(/passe curto|short pass|pase corto/i);
  await expect(feedbackLine).toBeVisible();
  const feedbackBox = (await feedbackLine.boundingBox())!;
  assertZero2DOverlap(canvasBox, feedbackBox, 'Feedback Text vs Canvas');
});

// Função utilitária geométrica de intersecção 2D
function assertZero2DOverlap(
  boxA: { x: number; y: number; width: number; height: number },
  boxB: { x: number; y: number; width: number; height: number },
  label: string
) {
  const xOverlap = Math.max(0, Math.min(boxA.x + boxA.width, boxB.x + boxB.width) - Math.max(boxA.x, boxB.x));
  const yOverlap = Math.max(0, Math.min(boxA.y + boxA.height, boxB.y + boxB.height) - Math.max(boxA.y, boxB.y));
  const overlapArea = xOverlap * yOverlap;
  expect(overlapArea, `Sobreposição 2D indevida detectada em ${label}! Área: ${overlapArea}px²`).toBe(0);
}
```

- **Isolamento de Modais e Overlays**: Modais com backdrop (`fixed inset-0`, como o diálogo de guia de instalação no iOS Safari) exercem função de sobreposição de foco intencional do sistema operacional, bloqueando interações com a tela de fundo. O teste de não-encobrimento do jogo assegura que todos os componentes de layout ativos de jogo (header, controles, painel de fórmula e feedback textual) residam fora do retângulo do canvas.

---

## 6. Determinismo Visual, Estados e Bootstrap de Baselines

### Estabilização Determinística dos Estados Visuais
Para cada estado canônico capturado em snapshot, estabelece-se critério de repouso verificável:
1. **Estado Inicial (Idle)**: Entrada de $C$ vazia, bola em repouso em $P$, sem animação ativa. Aguarda `#input-c` estar habilitado e atributo `data-canvas-status="idle"` no elemento canvas.
2. **Estado Fórmula Aberta**: Painel de fórmula expandido (`role="region"` visível), substituição algébrica renderizada e botão de preenchimento visível.
3. **Estado Passe Incorreto**: Passe concluído com erro, bola em repouso, texto de feedback visível (`Passe Curto` ou `Passe Longo`) e botão "Tentar Novamente" visível.
4. **Estado Gol / Celebração (Fase 1 ou 2)**: Conclusão do chute do atacante, texto de feedback de gol visível e botão "Avançar para a Fase" visível.
5. **Estado Campeão / Celebração Final (Fase 3)**: Conclusão do 3º round com acerto, mensagem de campeão visível, troféu renderizado e botão de reinício "Jogar Novamente" visível.

### Instrumentação Mínima de Observação
- O componente `PitchCanvas` expõe um atributo puramente observacional no elemento DOM: `data-canvas-status="idle" | "animating"`.
- Este atributo deriva reativamente do estado da aplicação:
  `data-canvas-status={phase === 'passing' || phase === 'shooting' ? 'animating' : 'idle'}`.
- Quando `phase` está em repouso (`idle`, `goal`, `miss_short`, `miss_long`), o valor é estritamente `"idle"`, assegurando que snapshots visuais só sejam capturados com a cena estabilizada.
- **Isolamento Estrito**: Esta flag é somente leitura no DOM, não altera nenhuma regra física, não altera catetos nem expõe a resposta calculada.

### Limiares Visuais Justificados
- Elemento `canvas`: `maxDiffPixels: 50` (absoluto), suficiente para tolerar pequenas variações de rasterização de fontes e antialiasing de linhas vetoriais, mas rejeitando rigorosamente qualquer desvio em traves, jogadores, bola ou triângulo retângulo.
- Componentes DOM (controles, header): `maxDiffPixelRatio: 0.01` com `maxDiffPixels: 100`.

### Protocolo de Bootstrap das Baselines
1. **Etapa 1 (Coleta)**: Execução local/runner dedicada para coletar as imagens candidatas em `e2e/__snapshots__/`.
2. **Etapa 2 (Revisão Humana)**: O mantenedor revisa visualmente os arquivos gerados.
3. **Etapa 3 (Aprovação e Commit)**: As imagens revisadas são comitadas na branch de feature.
4. **Etapa 4 (Execução do Gate)**: No CI, o teste compara estritamente com as baselines comitadas sem `--update-snapshots`. Sem baselines aprovadas, a verificação permanece **PENDING**.

---

## 7. Diagnóstico Rigoroso dos Arquivos Failed (`bun.lock` e `dev-dist/*`)

### Fatos Verificados (Evidências Concretas)
1. **`bun.lock`**:
   - Tamanho confirmado: 161.631 bytes.
   - Formato verificado via Node.js: É um arquivo de lock do Bun v1.2+ em formato JSONC (JSON com trailing commas). Parsers estritos de JSON puro falham com erro de sintaxe devido a vírgulas após o último elemento (`Expected double-quoted property name in JSON at position 465`), embora seja 100% válido para o runtime Bun.
2. **`dev-dist/registerSW.js` (119 bytes)**: Sintaxe JavaScript 100% válida (`node --check` retornou código 0).
3. **`dev-dist/sw.js` (2.907 bytes)**: Sintaxe JavaScript 100% válida (`node --check` retornou código 0).
4. **`dev-dist/workbox-7e5eb42b.js` (129.442 bytes)**: Sintaxe JavaScript 100% válida (`node --check` retornou código 0).
5. **Git Status**: O comando `git status` falha porque o contêiner de execução não possui o diretório `.git` local (o gerenciamento de repositório é externo ao contêiner).
6. **Interface Web**: Os ícones vermelhos deixaram de aparecer em leituras subsequentes da interface web.

### Hipóteses Não Comprovadas (Não Tratadas como Fato)
- **Não está comprovado** que o aviso "Failed to download file" tenha sido causado por timeout de WebSocket, tamanho de arquivo ou falha de rede.
- **Não está comprovado** se os arquivos dentro de `dev-dist/` estão atualmente rastreados ou não no Git remoto.
- **Não está comprovado** que a adição de regras ao `.gitignore` influencie diretamente o explorador de arquivos do AI Studio.
- **Não está comprovado** que adicionar `dev-dist/` ao `.gitignore` eliminará definitivamente reincidências do aviso no editor web.

### Verificações e Ações Pendentes para Implementação
- **Preservação de `bun.lock`**: O arquivo deve ser mantido intacto. Não deve ser removido sem instrução expressa do mantenedor. O projeto continuará utilizando `package-lock.json` e `npm ci` como padrão canônico nos workflows de CI.
- **Candidato à Exclusão do Versionamento**: `dev-dist/` é gerado dinamicamente pelo `VitePWA` em modo dev. Como boa prática de engenharia de software (independentemente do comportamento do editor), `dev-dist/` deve ser adicionado ao `.gitignore` na fase de implementação para evitar comitá-lo acidentalmente no Git.
- **Integridade**: Nenhum bundle ou script gerado deve ser editado manualmente.

---

## 8. Execução Local Completa e Alinhamento de Base Path

Para reproduzir localmente o pipeline idêntico ao CI:

```bash
# Script canônico de verificação local completa (test:local:full)
npm run lint && npm test && BASE_PATH='/pythagoras-pass/' npm run build && npx playwright test
```

- **Gerenciamento do Servidor de Teste (`webServer`)**: O `playwright.config.ts` gerencia o ciclo de vida do servidor de preview via bloco `webServer` nativo:
  ```typescript
  webServer: {
    command: "npm run preview -- --port 4173",
    url: "http://localhost:4173/pythagoras-pass/",
    reuseExistingServer: !process.env.CI,
    timeout: 120 * 1000,
  }
  ```
  Isso elimina processos manuais em background (`&`), assegura que os testes só iniciem após o endpoint HTTP responder 200 e encerra o processo de pré-visualização de forma limpa ao final da execução.
- Tanto o `vite build` quanto o `vite preview` herdam o mesmo `base: '/pythagoras-pass/'`, eliminando qualquer divergência de resolução de assets entre o ambiente local e o GitHub Pages.


# Slice 007: E2E Playwright, CI Branch Quality Gate & Release - Tasks

> **Nota de Governança**: Todas as tarefas técnicas e de automação iniciam obrigatoriamente como `[ ] PENDING`. A implementação só terá início após a aprovação expressa desta especificação revisada pelo mantenedor e o envio do comando `go 007`.

---

## Fase 1: Especificação, Diagnóstico e Governança (Rodada 1 - Concluída)
- [x] **TASK-007-SPEC-01**: Atualizar `requirements.md` com validação de cobertura estruturada no gate, política anti-flaky, matriz de viewports e estados determinísticos.
- [x] **TASK-007-SPEC-02**: Atualizar `design.md` com arquitetura estruturada do `ci-gate`, script validador `results.json`, algoritmo 2D de sobreposição e diagnóstico rigoroso dos arquivos.
- [x] **TASK-007-SPEC-03**: Atualizar `tasks.md` com tarefas ordenadas test-first, testes simulados do próprio gate e rastreabilidade total.
- [x] **TASK-007-SPEC-04**: Atualizar `verification.md` alinhando a matriz de evidências, API oficial BrowserContext e protocolo de bootstrap de baselines.
- [x] **TASK-007-SPEC-05**: Atualizar `spec/STATE.md` e `spec/PRODUCT.md` refletindo o estado atual e as capacidades canônicas de QA e liberação condicionada.
- [x] **TASK-007-SPEC-06**: Diagnosticar em modo somente leitura a integridade física e sintática dos 4 arquivos (`bun.lock` e `dev-dist/*`), separando fatos, hipóteses e ações pendentes.

---

## Fase 2: Infraestrutura Playwright, Gate Estruturado & Reparos (Pós-Aprovação)
- [ ] **TASK-007-INFRA-01**: Adicionar `dev-dist/` ao `.gitignore` como boa prática para evitar versionamento acidental de artefatos efêmeros do service worker de desenvolvimento.
- [ ] **TASK-007-INFRA-02**: Instalar `@playwright/test` como devDependency via npm, preservando a integridade de `package-lock.json`.
- [ ] **TASK-007-INFRA-03**: Configurar `playwright.config.ts` com reporters `json` (`playwright-report/results.json`), `html` e `list`, matriz oficial de projetos (`chromium-desktop`, `chromium-mobile`, `webkit-desktop`, `webkit-mobile`, além de presets para tela compacta de 320px e landscape curto).
- [ ] **TASK-007-INFRA-04**: Criar script validador estruturado `scripts/validate-ci-gate.mjs` para verificar presença do relatório, matriz de projetos, IDs obrigatórios e rejeitar qualquer teste `flaky` ou `failed`.
- [ ] **TASK-007-INFRA-05**: Criar suíte de testes com dados simulados para o próprio validador do gate (`tests/ciGateValidator.test.ts`), atestando rejeição em caso de falha upstream, skip, teste ausente, relatório ausente ou teste flaky.
- [ ] **TASK-007-INFRA-06**: Garantir isolamento estrito de runners: Vitest executa apenas `tests/**/*.test.ts` e Playwright executa apenas `e2e/**/*.spec.ts`.
- [ ] **TASK-007-INFRA-07**: Adicionar scripts no `package.json`:
  - `"test:e2e"`: `playwright test`
  - `"test:e2e:ui"`: `playwright test --ui`
  - `"test:local:full"`: `npm run lint && npm test && BASE_PATH='/pythagoras-pass/' npm run build && npx playwright test`

---

## Fase 3: Suíte de Testes End-to-End (Test-First)
- [ ] **TASK-007-TEST-01 (`e2e/gameplay.spec.ts`)**:
  - `[E2E-GAME-01]`: Inserção exata de $C$, trajetória da bola até $Q$, chute e animação de comemoração de gol.
  - `[E2E-GAME-02]`: Passe curto ($C < C_{\text{target}}$) com parada da bola antes de $Q$ e feedback textual sem gol.
  - `[E2E-GAME-03]`: Passe longo ($C > C_{\text{target}}$) ultrapassando $Q$ com feedback textual sem gol.
  - `[E2E-GAME-04]`: Clique em "Tentar Novamente" preservando catetos e posições originais de $A$ e $B$.
  - `[E2E-GAME-05]`: Clique em "Próximo Lance" sorteando nova rodada sem duplicação imediata.
  - `[E2E-GAME-06]`: Progressão sequencial das 3 fases (Bahia $\rightarrow$ Flamengo $\rightarrow$ Cruzeiro $\rightarrow$ Campeão $\rightarrow$ Reinício).
- [ ] **TASK-007-TEST-02 (`e2e/formula-toggle.spec.ts`)**:
  - `[E2E-FORMULA-01]`: Validar painel fechado por padrão (OFF), ausência de vazamento de resposta calculada no DOM ou atributos `aria-*`, abertura (ON) com exibição dos cálculos e botão de preenchimento.
- [ ] **TASK-007-TEST-03 (`e2e/layout-scene.spec.ts`)**:
  - `[E2E-LAYOUT-01]`: Validar programaticamente que o canvas do campo possui intersecção 2D estritamente igual a zero com header, controles, painel de fórmula expandido, banners de feedback e modal de instalação PWA.
  - Validar dimensões mínimas utilizáveis do canvas ($H \ge 260\text{px}$) em tela compacta de 320px.
  - Validar touch targets $\ge 44\text{px}$ para todos os botões e steppers.
- [ ] **TASK-007-TEST-04 (`e2e/accessibility.spec.ts`)**:
  - `[E2E-A11Y-01]`: Validar navegação integral por teclado e anéis de foco visíveis (`focus-visible`).
  - Validar alternância dinâmica entre os 3 idiomas (`pt-BR`, `en`, `es`).
  - Validar atualização de textos no elemento `aria-live` do DOM.
- [ ] **TASK-007-TEST-05 (`e2e/pwa-offline.spec.ts`)**:
  - `[E2E-PWA-01]`: Confirmar Service Worker ativo e assets no Cache Storage. Simular offline via `context.setOffline(true)`, recarregar página e verificar renderização a partir do cache.
- [ ] **TASK-007-TEST-06 (`e2e/visual-regression.spec.ts`)**:
  - `[E2E-VIS-01]`: Capturar e validar snapshots do canvas nos estados estáveis (idle, fórmula aberta, erro, gol, troca de fase) com limiar estrito `maxDiffPixels: 50`.

---

## Fase 4: Modernização de Workflows do GitHub Actions
- [ ] **TASK-007-CI-01**: Atualizar `.github/workflows/verify.yml`:
  - Job `lint-and-unit` (TypeScript e Vitest).
  - Job `build-and-e2e` (Build com `BASE_PATH`, execução Playwright gerando `results.json` e upload do relatório como artefato).
  - Job agregador `ci-gate` com `if: always()`, download de `results.json` e execução de `node scripts/validate-ci-gate.mjs`.
- [ ] **TASK-007-CI-02**: Atualizar `.github/workflows/deploy.yml`:
  - Concorrência estrita: `concurrency: { group: 'pages', cancel-in-progress: false }`.
  - Job `validate-and-package-integrated`: executa lint, Vitest, build de produção, Playwright E2E e validação do relatório estruturado sobre a versão integrada.
  - Empacota o EXATO diretório `dist/` testado via `actions/upload-pages-artifact@v3`.
  - Job `deploy-to-pages`: publica o artefato testado via `actions/deploy-pages@v4` somente após aprovação integral do job anterior.

---

## Fase 5: Bootstrap de Baselines & Homologação Física
- [ ] **TASK-007-BOOTSTRAP-01**: Executar rodada de coleta de imagens candidatas em ambiente isolado e submeter para revisão expressa do mantenedor.
- [ ] **TASK-007-DOC-01**: Documentar configuração de Branch Protection em `main` no painel web do GitHub (exigência de PR, check real `ci-gate` e inclusão de administradores).
- [ ] **TASK-007-DOC-02**: Documentar protocolo de homologação manual em smartphones físicos reais (iOS Safari e Android Chrome com teclado virtual nativo) e homologação acústica com leitor de tela real.
